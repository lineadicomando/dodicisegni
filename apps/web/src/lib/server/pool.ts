/**
 * Il calcolo lungo, fuori dal filo che serve le richieste.
 *
 * Quattro ricerche costano secondi e non millesimi: i passaggi dei transiti,
 * i transiti attivi in un arco, il calendario del cielo, l'elezione. Misurato
 * su questa macchina, i passaggi su tre anni con la Luna sono circa 1,9
 * secondi, e i transiti attivi lo stesso. Node è a un filo solo, e quei
 * secondi sono **sincroni per costruzione**: il vincolo che vieta `await`
 * dentro la catena di calcolo esiste perché Swiss Ephemeris tiene lo zodiaco
 * siderale in stato globale, quindi spezzarla dall'interno non è un'opzione.
 * Mentre girano, nessun'altra richiesta viene servita.
 *
 * Il rimedio è attorno al motore e non dentro: la catena resta sincera e
 * sincrona, solo gira in un altro thread.
 *
 * **Lo stato globale dell'ayanamsa è per thread, non per processo.** È la cosa
 * che rendeva il rimedio incerto ed è verificata: due worker che calcolano in
 * parallelo con ayanamsa diversi danno gli stessi valori che darebbero da
 * soli, cifra per cifra — `set_sid_mode` vale per l'istanza del modulo nativo,
 * e ogni thread ha la sua. La prova sta in `pool.test.ts`. Senza quel fatto un
 * pool non sarebbe un rimedio ma il modo più veloce di produrre temi sbagliati
 * di ventiquattro gradi.
 *
 * Ci passano **solo le rotte che costano**. Un tema natale è mezzo millesimo e
 * avviare un worker ne costa cinquanta: mandarlo qui lo peggiorerebbe di cento
 * volte. Il pool non è una regola di stile, è un rimedio a una misura.
 */

import { ChartError } from '@dodicisegni/core';
import type {
  ActiveTransit,
  ElectionOptions,
  ElectionResult,
  NatalChart,
  OrbConventionInfo,
  PassageOptions,
  PassageRange,
  Place,
  SignIngress,
  SkyEventOptions,
  SkyPassage,
  SkyPassageOptions,
  Station,
  TransitPassage,
} from '@dodicisegni/core';
import { createRequire } from 'node:module';
import { availableParallelism } from 'node:os';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';

/**
 * I lavori che il pool sa fare, con la firma di ciò che sta dall'altra parte.
 *
 * L'elenco è chiuso apposta: non è un modo generico di eseguire codice altrove
 * ma quattro domande note, e la firma le lega a quelle del motore, così che un
 * argomento cambiato di là non passi inosservato di qua.
 *
 * `calendario` ne accorpa tre perché la rotta le chiede sempre insieme, sullo
 * stesso arco: tre andate e ritorno per un risultato solo sarebbero tre volte
 * la serializzazione e nessun guadagno.
 */
interface Lavori {
  passaggi: (
    natal: NatalChart,
    range: PassageRange,
    options: PassageOptions,
  ) => { passages: TransitPassage[]; warnings: string[]; orbConvention: OrbConventionInfo };
  attivi: (
    natal: NatalChart,
    range: PassageRange,
    options: PassageOptions,
  ) => { transits: ActiveTransit[]; warnings: string[]; orbConvention: OrbConventionInfo };
  elezione: (range: PassageRange, place: Place, options: ElectionOptions) => ElectionResult;
  calendario: (
    range: PassageRange,
    perPassaggi: SkyPassageOptions,
    perEventi: SkyEventOptions,
  ) => {
    incontri: { passages: SkyPassage[]; warnings: string[]; orbConvention: OrbConventionInfo };
    ingressi: { ingresses: SignIngress[]; warnings: string[] };
    stazioni: { stations: Station[]; warnings: string[] };
  };
}

/**
 * Il worker, come sorgente e non come file.
 *
 * Un file vero sarebbe più bello da leggere e non si riesce a collocarlo: Vite
 * impacchetta il codice di server in `build/server/chunks`, e un file lasciato
 * fuori dalla pipeline andrebbe poi ritrovato a runtime in tre posti diversi —
 * `vite dev`, `build/index.js` e il `bundle/` che `apps/desktop` compone — con
 * tre percorsi da tenere allineati a mano. Un `data:` non ha percorso, quindi
 * non ne ha nessuno da sbagliare.
 *
 * Da un `data:` però i nomi dei pacchetti non si risolvono, e per questo il
 * motore arriva come **URL assoluta** in `workerData`: chi la risolve è il
 * thread principale, che sta in un file vero e ha un `node_modules` sopra di
 * sé. È anche la ragione per cui `@dodicisegni/core` deve restare esterno nel
 * bundle di server — lo è già, per i moduli nativi, e `vite.config.ts` dice
 * perché.
 */
const SORGENTE = `
import { parentPort, workerData } from 'node:worker_threads';

const core = await import(workerData.core);

const LAVORI = {
  passaggi: (natal, range, options) => core.findTransitPassages(natal, range, options),
  attivi: (natal, range, options) => core.findActiveTransits(natal, range, options),
  elezione: (range, place, options) => core.findElectionHours(range, place, options),
  calendario: (range, perPassaggi, perEventi) => ({
    incontri: core.findSkyPassages(range, perPassaggi),
    ingressi: core.findSignIngresses(range, perEventi),
    stazioni: core.findStations(range, perEventi),
  }),
};

parentPort.on('message', ({ lavoro, argomenti }) => {
  try {
    parentPort.postMessage({ esito: LAVORI[lavoro](...argomenti) });
  } catch (errore) {
    // L'errore non attraversa il confine come oggetto: \`structuredClone\`
    // conserva il messaggio e perde la classe, quindi perderebbe il \`code\`,
    // che è l'unica parte su cui il chiamante ramifica. Passa smontato e di
    // là si rimonta.
    parentPort.postMessage({
      guasto: { code: errore?.code, message: String(errore?.message ?? errore) },
    });
  }
});
`;

/**
 * Quanti thread.
 *
 * Il lavoro è tutto CPU: più thread che nuclei non calcolano niente di più, si
 * contendono gli stessi. Uno resta al filo principale, che deve poter servire
 * le richieste leggere mentre le pesanti girano — è il motivo per cui tutto
 * questo esiste. Il tetto di quattro è per la memoria: ogni thread carica la
 * sua copia del motore e delle effemeridi.
 */
export const OPERAI = Math.max(1, Math.min(4, availableParallelism() - 1));

/**
 * Quanti incarichi possono aspettare un thread.
 *
 * Senza tetto la coda cresce finché arrivano richieste, e chi è in fondo
 * aspetta un tempo che nessuno gli ha detto: conviene rispondere subito che
 * il server è occupato. Quattro turni per thread: con i due secondi scarsi
 * del lavoro più lungo misurato, l'ultimo della coda aspetta una decina di
 * secondi, che è già al limite di ciò che chi guarda una pagina sopporta.
 */
export const CODA_MASSIMA = OPERAI * 4;

/**
 * Gli errori del pool, che non sono del motore: non dicono che la richiesta è
 * sbagliata ma che non è stata servita. `toHttpError` li riconosce dal `code`.
 */
export class PoolError extends Error {
  constructor(
    readonly code: 'SERVER_OCCUPATO' | 'RICHIESTA_ANNULLATA',
    message: string,
  ) {
    super(message);
    this.name = 'PoolError';
  }
}

interface Incarico {
  lavoro: keyof Lavori;
  argomenti: unknown[];
  risolvi: (esito: never) => void;
  rifiuta: (errore: Error) => void;
}

interface Operaio {
  worker: Worker;
  /**
   * Uno per volta, ed è la ragione per cui i messaggi non portano un
   * identificativo da confrontare: con un incarico solo in volo per thread la
   * risposta che arriva è per forza la sua. Un `id` che nessuno verifica
   * prometterebbe una correlazione che non c'è.
   */
  incarico: Incarico | null;
}

const operai: Operaio[] = [];
const coda: Incarico[] = [];

function assumi(): Operaio {
  const percorso = createRequire(import.meta.url).resolve('@dodicisegni/core');
  const worker = new Worker(new URL(`data:text/javascript,${encodeURIComponent(SORGENTE)}`), {
    workerData: { core: pathToFileURL(percorso).href },
  });

  const operaio: Operaio = { worker, incarico: null };

  worker.on('message', ({ esito, guasto }: { esito?: never; guasto?: Guasto }) => {
    const incarico = operaio.incarico;
    if (!incarico) return;
    operaio.incarico = null;
    // Fermo, non tiene più sveglio il processo: un server senza richieste in
    // corso deve poter uscire, e questi thread da soli lo terrebbero in piedi.
    worker.unref();

    if (guasto) incarico.rifiuta(rimonta(guasto));
    else incarico.risolvi(esito as never);

    smista();
  });

  // Un thread che muore — il motore che non si carica, la memoria che finisce
  // — fa cadere l'incarico che teneva, e se ne va. Non se ne rimette uno al
  // suo posto per abitudine: un guasto che dura non deve diventare un ciclo
  // che rilancia da solo. Ma chi aspettava in coda aspettava un thread, e se
  // sono morti tutti non arriva più nessun messaggio a farla ripartire: la si
  // smista qui. Ogni thread assunto così porta un incarico, e se muore anche
  // lui lo fa cadere: i tentativi sono al più quanti gli incarichi in attesa.
  const congeda = (errore: Error) => {
    const indice = operai.indexOf(operaio);
    if (indice < 0) return;
    operai.splice(indice, 1);
    operaio.incarico?.rifiuta(errore);
    operaio.incarico = null;
    smista();
  };
  worker.on('error', congeda);
  worker.on('exit', (codice) => {
    if (codice !== 0) congeda(new Error(`Il calcolo si è interrotto (codice ${codice}).`));
  });

  operai.push(operaio);
  return operaio;
}

/** Dà a chi è libero, o a un thread nuovo se c'è posto, ciò che aspetta in coda. */
function smista(): void {
  while (coda.length > 0) {
    const libero = operai.find((operaio) => operaio.incarico === null);
    if (!libero && operai.length >= OPERAI) return;
    affida(libero ?? assumi(), coda.shift()!);
  }
}

function affida(operaio: Operaio, incarico: Incarico): void {
  operaio.incarico = incarico;
  operaio.worker.ref();
  operaio.worker.postMessage({ lavoro: incarico.lavoro, argomenti: incarico.argomenti });
}

interface Guasto {
  code?: string;
  message: string;
}

/**
 * Rimonta l'errore smontato dall'altra parte.
 *
 * Con il `code` torna un `ChartError`, che è ciò che `toHttpError` riconosce:
 * altrimenti ogni errore d'input del motore diventerebbe un 500, e una data
 * scritta male sarebbe un guasto del server invece che una richiesta da
 * correggere.
 */
function rimonta(guasto: Guasto): Error {
  if (guasto.code) return new ChartError(guasto.code as ChartError['code'], guasto.message);
  return new Error(guasto.message);
}

/**
 * Manda un lavoro nel pool e aspetta il risultato.
 *
 * Gli argomenti e il risultato attraversano il confine per copia, quindi
 * devono essere dati e basta — lo sono: il motore emette oggetti semplici.
 *
 * `signal` è quello della richiesta (`request.signal`), ed è il primo
 * argomento perché nessuna rotta lo dimentichi: chi se n'è andato mentre
 * aspettava in coda ne esce, invece di far calcolare due secondi per nessuno
 * davanti a chi è ancora lì. L'incarico **già affidato** a un thread invece
 * finisce: fermarlo vorrebbe dire `worker.terminate()`, e terminare un thread
 * a metà di `calc_ut` fa cadere l'intero processo (`docs/decisioni.md`, *I
 * thread del pool web*). `null` è per chi non ha una richiesta, cioè le prove.
 */
export function nelPool<L extends keyof Lavori>(
  signal: AbortSignal | null,
  lavoro: L,
  ...argomenti: Parameters<Lavori[L]>
): Promise<ReturnType<Lavori[L]>> {
  return new Promise((risolvi, rifiuta) => {
    const annullata = (): PoolError =>
      new PoolError('RICHIESTA_ANNULLATA', 'La richiesta è stata annullata prima del calcolo.');
    if (signal?.aborted) return rifiuta(annullata());

    const incarico: Incarico = {
      lavoro,
      argomenti: argomenti,
      risolvi: risolvi,
      rifiuta,
    };

    const libero = operai.find((operaio) => operaio.incarico === null);
    if (libero) return affida(libero, incarico);
    if (operai.length < OPERAI) return affida(assumi(), incarico);

    // Tutti occupati: aspetta il turno. Senza coda si assumerebbero thread
    // finché ce n'è richiesta, che è il problema di prima con un altro nome.
    if (coda.length >= CODA_MASSIMA) {
      return rifiuta(
        new PoolError(
          'SERVER_OCCUPATO',
          'Il server sta già calcolando troppe richieste lunghe: riprova fra qualche secondo.',
        ),
      );
    }

    const esce = (): void => {
      const posto = coda.indexOf(incarico);
      // Non è più in coda: un thread lo sta già calcolando, e lo finisce.
      if (posto < 0) return;
      coda.splice(posto, 1);
      rifiuta(annullata());
    };
    signal?.addEventListener('abort', esce, { once: true });
    // Servito o caduto, l'ascolto non serve più: il segnale di una richiesta
    // vive quanto lei, ma non c'è ragione di lasciarglielo addosso.
    const sciolto = <A extends unknown[]>(f: (...a: A) => void) => (...a: A): void => {
      signal?.removeEventListener('abort', esce);
      f(...a);
    };
    incarico.risolvi = sciolto(risolvi);
    incarico.rifiuta = sciolto(rifiuta);
    coda.push(incarico);
  });
}

/** Quanti thread ci sono, quanti lavorano e quanti incarichi aspettano. */
export function statoPool(): { operai: number; occupati: number; inCoda: number } {
  return {
    operai: operai.length,
    occupati: operai.filter((operaio) => operaio.incarico !== null).length,
    inCoda: coda.length,
  };
}

/**
 * Congeda tutti i thread, e fa cadere ciò che era in volo o in attesa: una
 * promessa lasciata pendente non si distingue da un calcolo che dura.
 *
 * Serve ai test, che altrimenti finirebbero con dei thread ancora vivi. Va
 * chiamata a pool fermo: `terminate()` su un thread a metà di un calcolo è
 * ciò che `nelPool` evita.
 */
export async function chiudiPool(): Promise<void> {
  const chiuso = new Error('Il pool è stato chiuso.');
  const addio = operai.map((operaio) => {
    operaio.incarico?.rifiuta(chiuso);
    operaio.incarico = null;
    return operaio.worker.terminate();
  });
  operai.length = 0;
  for (const incarico of coda.splice(0)) incarico.rifiuta(chiuso);
  await Promise.all(addio);
}

/**
 * Finge la morte dei thread al lavoro, per la prova che la coda riparta.
 *
 * Non li termina, perché terminarli a metà calcolo farebbe cadere il
 * processo: emette l'errore che Node emetterebbe, e li congeda davvero solo
 * quando hanno finito. La promessa si chiude allora.
 */
export async function fingiLaMorteDegliOccupati(): Promise<void> {
  const occupati = operai.filter((operaio) => operaio.incarico !== null);
  const finiti = occupati.map(
    ({ worker }) =>
      new Promise<void>((fatto) => {
        worker.once('message', () => void worker.terminate().then(() => fatto()));
      }),
  );
  for (const { worker } of occupati) worker.emit('error', new Error('Il thread è morto.'));
  await Promise.all(finiti);
}
