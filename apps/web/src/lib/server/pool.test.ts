import { computeNatalChart, ChartError, DEFAULT_PASSAGE_BODIES } from '@dodicisegni/core';
import { afterAll, describe, expect, it } from 'vitest';
import {
  chiudiPool,
  CODA_MASSIMA,
  fingiLaMorteDegliOccupati,
  nelPool,
  OPERAI,
  PoolError,
  statoPool,
} from './pool';

afterAll(() => chiudiPool());

/** Una nascita inventata, la stessa dei test dei transiti attivi in `core`. */
const NASCITA = {
  date: '1985-09-20',
  time: '08:40',
  timezone: 'Europe/Rome',
  latitude: 45.0703,
  longitude: 7.6869,
};

const ARCO = { from: '2026-07-01', to: '2026-08-01', timezone: 'Europe/Rome' };

describe('il pool restituisce quello che restituirebbe il motore', () => {
  it('i passaggi dei transiti, identici al calcolo sul posto', async () => {
    const tema = computeNatalChart(NASCITA, {});
    const qui = (await import('@dodicisegni/core')).findTransitPassages(tema, ARCO, {
      minorAspects: false,
    });
    const di_la = await nelPool(null, 'passaggi', tema, ARCO, { minorAspects: false });

    expect(di_la.passages).toEqual(qui.passages);
    expect(di_la.warnings).toEqual(qui.warnings);
    // Non una lista vuota che combacia con un'altra lista vuota.
    expect(di_la.passages.length).toBeGreaterThan(0);
  });

  it('i transiti attivi, identici al calcolo sul posto', async () => {
    const tema = computeNatalChart(NASCITA, {});
    const qui = (await import('@dodicisegni/core')).findActiveTransits(tema, ARCO, {
      minorAspects: false,
    });
    const di_la = await nelPool(null, 'attivi', tema, ARCO, { minorAspects: false });

    expect(di_la.transits).toEqual(qui.transits);
    expect(di_la.warnings).toEqual(qui.warnings);
    expect(di_la.transits.length).toBeGreaterThan(0);
  });

  it('il calendario del cielo, con le tre ricerche in un viaggio solo', async () => {
    const core = await import('@dodicisegni/core');
    const esito = await nelPool(null, 'calendario', ARCO, { minorAspects: false }, {});

    expect(esito.incontri.passages).toEqual(core.findSkyPassages(ARCO, { minorAspects: false }).passages);
    expect(esito.ingressi.ingresses).toEqual(core.findSignIngresses(ARCO, {}).ingresses);
    expect(esito.stazioni.stations).toEqual(core.findStations(ARCO, {}).stations);
  });

  it('le ore planetarie dell\'elezione', async () => {
    const core = await import('@dodicisegni/core');
    const giorno = { from: '2029-08-24', to: '2029-08-26', timezone: 'Europe/Rome' };
    const luogo = { latitude: 45.0703, longitude: 7.6869 };

    const esito = await nelPool(null, 'elezione', giorno, luogo, {});
    expect(esito.hours).toEqual(core.findElectionHours(giorno, luogo, {}).hours);
    expect(esito.hours.length).toBeGreaterThan(0);
  });
});

describe('gli errori attraversano il confine senza perdere il codice', () => {
  it('un errore di dominio torna come ChartError, non come guasto del server', async () => {
    const tema = computeNatalChart(NASCITA, {});
    const rifiuto = nelPool(null, 'passaggi', tema, { ...ARCO, from: 'boh' }, {});

    // È il `code` che `toHttpError` guarda per rispondere 400 invece di 500:
    // perso quello, una data scritta male diventerebbe un guasto del server.
    await expect(rifiuto).rejects.toBeInstanceOf(ChartError);
    await expect(rifiuto).rejects.toMatchObject({ code: 'DATA_NON_VALIDA' });
  });
});

/*
 * La prova che regge tutto il resto.
 *
 * Swiss Ephemeris tiene lo zodiaco siderale in stato globale del modulo
 * nativo: `set_sid_mode` non vale per la chiamata. Se quello stato fosse per
 * processo, due richieste con ayanamsa diversi servite da thread diversi si
 * contaminerebbero, e il risultato non sarebbe un errore ma un tema sbagliato
 * di ventiquattro gradi — cioè il difetto peggiore, quello che non si vede.
 *
 * Lo stato è invece **per thread**, perché ogni thread carica la sua istanza
 * del modulo nativo. Questo test lo tiene fermo: se un domani smettesse di
 * essere vero, il pool va smontato, non aggiustato.
 */
describe('lo zodiaco siderale è isolato per thread', () => {
  it('due ayanamsa in parallelo non si contaminano', async () => {
    const core = await import('@dodicisegni/core');
    const soli = {
      lahiri: core.computeNatalChart(NASCITA, { zodiac: 'siderale', ayanamsa: 'lahiri' }),
      raman: core.computeNatalChart(NASCITA, { zodiac: 'siderale', ayanamsa: 'raman' }),
    };
    // I due ayanamsa devono davvero differire, altrimenti il confronto è vuoto.
    expect(soli.lahiri.bodies[0]!.longitude).not.toBeCloseTo(soli.raman.bodies[0]!.longitude, 3);

    // Ogni tema è il bersaglio di una ricerca di passaggi: il lavoro lungo
    // serve a tenere i due thread dentro il calcolo nello stesso momento, che
    // è la sola condizione in cui la contaminazione potrebbe accadere.
    const insieme = await Promise.all(
      (['lahiri', 'raman'] as const).flatMap((ayanamsa) =>
        [0, 1].map(async () => ({
          ayanamsa,
          esito: await nelPool(null, 'passaggi', soli[ayanamsa], ARCO, {
            minorAspects: false,
            bodies: [...DEFAULT_PASSAGE_BODIES, 'luna'],
          }),
        })),
      ),
    );

    for (const { ayanamsa, esito } of insieme) {
      const atteso = core.findTransitPassages(soli[ayanamsa], ARCO, {
        minorAspects: false,
        bodies: [...DEFAULT_PASSAGE_BODIES, 'luna'],
      });
      expect(esito.passages).toEqual(atteso.passages);
    }
  });
});

describe('la coda', () => {
  it('serve più lavori di quanti siano i thread, e li tiene distinti', async () => {
    const tema = computeNatalChart(NASCITA, {});
    // Uno per mese: risultati diversi fra loro, così che uno scambio di
    // risposte fra due incarichi in volo non passi per un successo.
    const archi = [1, 2, 3, 4, 5, 6, 7, 8].map((mese) => ({
      from: `2026-0${mese}-01`,
      to: `2026-0${mese + 1}-01`,
      timezone: 'Europe/Rome',
    }));

    const insieme = await Promise.all(
      archi.map((arco) => nelPool(null, 'passaggi', tema, arco, { minorAspects: false })),
    );

    const core = await import('@dodicisegni/core');
    insieme.forEach((esito, indice) => {
      expect(esito.passages).toEqual(
        core.findTransitPassages(tema, archi[indice]!, { minorAspects: false }).passages,
      );
    });
  });
});

describe('chi se ne va, la coda piena, il thread che muore', () => {
  const tema = computeNatalChart(NASCITA, {});
  /**
   * Sei mesi con la Luna: qualche decimo di secondo per thread. Non serve di
   * più, perché tutto ciò che le prove fanno alla coda accade nello stesso
   * giro dell'event loop in cui i thread sono stati occupati, prima che uno
   * qualunque possa rispondere.
   */
  const lungo = (): Promise<unknown> =>
    nelPool(null, 'passaggi', tema, { from: '2026-01-01', to: '2026-06-30', timezone: 'Europe/Rome' }, {
      minorAspects: false,
      bodies: [...DEFAULT_PASSAGE_BODIES, 'luna'],
    });
  const breve = (signal: AbortSignal | null = null) =>
    nelPool(signal, 'passaggi', tema, ARCO, { minorAspects: false });
  /** Tiene occupati tutti i thread, così che il prossimo incarico vada in coda. */
  const occupaTutti = (): Promise<unknown>[] => Array.from({ length: OPERAI }, lungo);

  it('toglie dalla coda la richiesta annullata, senza calcolarla', async () => {
    const occupati = occupaTutti();
    const richiesta = new AbortController();
    const abbandonata = breve(richiesta.signal);
    const rimasta = breve();
    expect(statoPool().inCoda).toBe(2);

    richiesta.abort();
    await expect(abbandonata).rejects.toMatchObject({ code: 'RICHIESTA_ANNULLATA' });
    expect(statoPool().inCoda).toBe(1);

    // Chi era dietro viene servito, e chi arriva già annullato non entra.
    await expect(rimasta).resolves.toHaveProperty('passages');
    await expect(breve(AbortSignal.abort())).rejects.toBeInstanceOf(PoolError);
    await Promise.all(occupati);
  }, 30_000);

  it('rifiuta subito quando la coda è piena, e serve chi era già dentro', async () => {
    const occupati = occupaTutti();
    const inCoda = Array.from({ length: CODA_MASSIMA }, () => breve());
    expect(statoPool().inCoda).toBe(CODA_MASSIMA);

    await expect(breve()).rejects.toMatchObject({ code: 'SERVER_OCCUPATO' });

    const serviti = await Promise.all(inCoda);
    expect(serviti).toHaveLength(CODA_MASSIMA);
    await Promise.all(occupati);
  }, 30_000);

  it('fa ripartire la coda quando muoiono tutti i thread', async () => {
    const occupati = occupaTutti().map((promessa) => promessa.catch((errore: Error) => errore));
    const inAttesa = [breve(), breve()];

    const sepolti = fingiLaMorteDegliOccupati();

    // Chi era in volo cade con l'errore del thread; chi aspettava trova un
    // thread nuovo, invece di restare pendente fino alla prossima richiesta.
    for (const caduto of await Promise.all(occupati)) expect(caduto).toBeInstanceOf(Error);
    for (const esito of await Promise.all(inAttesa)) expect(esito.passages.length).toBeGreaterThan(0);
    await sepolti;
  }, 30_000);
});
