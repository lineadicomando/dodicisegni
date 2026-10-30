/**
 * La hora, il D-2: ogni segno in due metà, una al Sole e una alla Luna.
 *
 * È il solo varga su cui il motore espone più convenzioni, perché è il solo
 * in cui il testo e l'uso divergono sulla **forma** del risultato e non su un
 * dettaglio. Il *Brihat Parashara Hora Shastra* (6.5-6, trad. Santhanam,
 * vol. I, pp. 68-69, con la tavola «Speculum of Horas» a p. 69) dà a ciascuna
 * metà un **luminare** e nessun segno: nel segno dispari i primi 15° sono
 * hora del Sole e gli altri della Luna, nel pari il contrario. Lo stesso dicono
 * Brihat Jataka I.11, Saravali III.14, Horasara II.2, Jataka Parijata I.30 e
 * Phaladeepika III.4, e agli usi che il BPHS ne fa (7.13-19, pp. 91-95: i
 * frutti nella hora del Sole o della Luna, il peso nel vimshopaka) basta il
 * luminare.
 *
 * La lettura corrente manda la hora del Sole al Leone e quella della Luna al
 * Cancro, e ne fa una carta con due segni occupati. Nessun classico letto la
 * enuncia: la presuppone il commento di Santhanam (p. 90, «Jupiter is in
 * exaltation Varga if in Moon's Hora»), e P.V.R. Narasimha Rao (2003) la dà
 * per quella che gli astrologi «normally use», dubitandone. Entra come
 * convenzione a sé, dichiarata per quello che è.
 *
 * Le varianti moderne con un segno sono quattro, ciascuna con un autore che
 * la scrive per intero, e stanno accanto alle due di sopra: la
 * parivritti-dvaya, che Narasimha Rao (2003) riporta come ipotesi circolata
 * in rete e tiene nella sua tavola delle carte cicliche; la Kashinatha, di
 * Kashinath Rath, nella dispensa di Rao del 2003; quella di Raman
 * Suprajarama (2005); la Uma-Shambhu di Rao (2012). Sono letture moderne del
 * verso, e per questo **non entrano nei conti del BPHS** (varga buoni e
 * vimshopaka), che con loro contano la hora di Parashara e lo dicono: un
 * conto di Parashara su una carta di Rath sarebbe un ibrido che nessuno ha
 * praticato. Scelto dal proprietario il 30 ottobre 2026 (`TODO.md`,
 * *Deciso*). La sesta variante di PyJHora, che chiama «Somanatha» (la
 * parivritti alternata), non ha un autore che la scriva e non c'è; la regola
 * di Garga e Yavana, che Varahamihira riporta e scarta (BJ I.12), nemmeno.
 *
 * Le fonti stanno in `texts/jyotisha/`: `bphs-santhanam-1992-vol1`,
 * `narasimha-rao-personal-finances-hora-chart-2003`,
 * `narasimha-rao-uma-shambhu-hora-2012` e
 * `suprajarama-raman-hora-jyotish-blog-2005`, con le trascrizioni.
 */

import { ZODIAC_SIGNS } from './constants.js';
import { ChartError } from './errors.js';
import { degreeInSign, normalize360 } from './math.js';
import type { Hora, HoraConvention, HoraConventionInfo, ZodiacSign } from './types.js';

export interface HoraConventionDefinition extends HoraConventionInfo {
  /** La regola in una riga, che viaggia col risultato come quella di ogni varga. */
  rule: string;
  /**
   * Il segno in cui la convenzione manda una longitudine **siderale**, se ne
   * dà uno. Una funzione e non una tavola per luminare: tutte le varianti
   * moderne danno un segno diverso secondo il segno di partenza.
   */
  signOf?: (siderealLongitude: number) => ZodiacSign;
  /**
   * Se i conti del BPHS (varga buoni, vimshopaka) contano la hora con questa
   * convenzione. Solo le due del testo e del suo traduttore: con le altre i
   * conti usano Parashara, e lo dicono.
   */
  bphs: boolean;
}

/** Il segno all'indice dato, con il giro chiuso. */
const at = (index: number): ZodiacSign => ZODIAC_SIGNS[((index % 12) + 12) % 12] as ZodiacSign;

/** L'indice del segno (0 l'Ariete), se il segno è dispari, e se si è nella prima metà. */
function parti(siderealLongitude: number): { segno: number; dispari: boolean; prima: boolean } {
  const longitude = normalize360(siderealLongitude);
  const segno = Math.floor(longitude / 30);
  return { segno, dispari: segno % 2 === 0, prima: degreeInSign(longitude) < 15 };
}

/**
 * I segni forti di giorno e di notte di ciascun signore, nell'ordine
 * [diurno, notturno]: Rao (2003), «Sun represents day-strong signs, i.e.
 * Leo, Virgo, Libra, Scorpio, Aquarius and Pisces», e ogni pianeta con due
 * segni ne ha uno per parte. Indicizzati per segno, col signore di BPHS 4.
 */
const DIURNO_NOTTURNO: readonly (readonly [ZodiacSign, ZodiacSign])[] = [
  ['scorpione', 'ariete'], // Ariete, Marte
  ['bilancia', 'toro'], // Toro, Venere
  ['vergine', 'gemelli'], // Gemelli, Mercurio
  ['leone', 'cancro'], // Cancro, la Luna: in coppia col Sole
  ['leone', 'cancro'], // Leone, il Sole: in coppia con la Luna
  ['vergine', 'gemelli'], // Vergine, Mercurio
  ['bilancia', 'toro'], // Bilancia, Venere
  ['scorpione', 'ariete'], // Scorpione, Marte
  ['pesci', 'sagittario'], // Sagittario, Giove
  ['acquario', 'capricorno'], // Capricorno, Saturno
  ['acquario', 'capricorno'], // Acquario, Saturno
  ['pesci', 'sagittario'], // Pesci, Giove
];

/**
 * La stessa tavola per Suprajarama, che per il Sole e la Luna dà un segno
 * solo: «for Sun both day and night signs are Leo, for Moon both are
 * Cancer».
 */
const DIURNO_NOTTURNO_SUPRAJARAMA: readonly (readonly [ZodiacSign, ZodiacSign])[] = DIURNO_NOTTURNO.map(
  (coppia, segno): readonly [ZodiacSign, ZodiacSign] =>
    segno === 3 ? ['cancro', 'cancro'] : segno === 4 ? ['leone', 'leone'] : coppia,
);

/**
 * Le convenzioni del D-2. CLI, API e MCP ne leggono l'elenco da qui; lo
 * nominano a mano, e nessun test lo vede: il menù `menuHora` di
 * `JyotishaSettings.svelte`, l'aiuto di `--hora` in `cli.ts`, le descrizioni
 * di `hora` in `packages/mcp/src/tools.ts` (in `compute_jyotisha_chart` e in
 * `draw_jyotisha_chart`, e il rifiuto del D-2 senza segni), i commenti delle
 * due rotte `api/jyotish` e il rifiuto della rotta `quadro`, la sezione
 * `#hora` di `/metodo/varga` e il paragrafo della HORA in
 * `packages/lettura/src/jyotisha.ts`.
 */
export const HORA_CONVENTIONS: readonly HoraConventionDefinition[] = [
  {
    id: 'parashara',
    name: 'Parashara',
    source:
      'Brihat Parashara Hora Shastra 6.5-6, trad. R. Santhanam, vol. I (1992), pp. 68-69, ' +
      'tavola «Speculum of Horas» a p. 69.',
    rule:
      'Due parti da 15°. Nei segni dispari la prima è hora del Sole e la seconda della Luna, nei ' +
      'pari il contrario. La hora è di un luminare, non un segno: il testo non ne nomina (BPHS 6.5-6).',
    bphs: true,
  },
  {
    id: 'leone-cancro',
    name: 'Leone e Cancro',
    source:
      'Lettura corrente, che nessun classico letto enuncia: la presuppone Santhanam (BPHS, vol. I, ' +
      'p. 90) e la dice d\'uso comune P.V.R. Narasimha Rao, «Personal Finances from Hora Chart» (2003).',
    rule:
      'Le due metà di Parashara, con la hora del Sole al Leone e quella della Luna al Cancro, i ' +
      'segni dei due luminari: tutti i graha cadono in uno dei due.',
    signOf: (longitude) => (horaOf(longitude) === 'sole' ? 'leone' : 'cancro'),
    bphs: true,
  },
  {
    id: 'parivritti-dvaya',
    name: 'Parivritti-dvaya',
    source:
      'Proposta in rete senza un nome prima del 2003. La descrive P.V.R. Narasimha Rao, «Personal ' +
      'Finances from Hora Chart» (2003), che la tiene fra le carte cicliche della sua tavola 1 ' +
      '(«family support to karma») e non per la ricchezza; e di nuovo in «Uma-Shambhu Hora» ' +
      '(2012), «View 4». Legge «meṣādi … parivṛttidvayaṃ» di BPHS 6.6 come due giri dello zodiaco.',
    rule:
      "Due parti da 15°, contate di seguito dall'Ariete: le due metà dell'Ariete vanno all'Ariete e " +
      'al Toro, del Toro ai Gemelli e al Cancro, e così via, due giri in ventiquattro metà. Non ' +
      'lega le metà al Sole e alla Luna.',
    signOf: (longitude) => {
      const { segno, prima } = parti(longitude);
      return at(2 * segno + (prima ? 0 : 1));
    },
    bphs: false,
  },
  {
    id: 'kashinatha',
    name: 'Kashinatha',
    source:
      'Di Pt. Kashinath Rath, nella tradizione di Achyuta Dasa: P.V.R. Narasimha Rao, «Personal ' +
      'Finances from Hora Chart» (2003), con gli esempi di Giove a 25°16\' del Toro e di Marte a ' +
      '18°53\' del Sagittario e la carta 1. Il Leone e il Cancro fanno coppia («Leo and Cancer form ' +
      'a pair»): la hora del Sole va al Leone e quella della Luna al Cancro anche lì. PyJHora manda ' +
      'invece le due metà del Leone al Leone e del Cancro al Cancro; qui si segue il testo di Rao.',
    rule:
      'Le due metà di Parashara, e ciascuna va a un segno del signore del segno: la hora del Sole ' +
      'al suo segno forte di giorno (Leone, Vergine, Bilancia, Scorpione, Acquario, Pesci), quella ' +
      'della Luna al suo segno forte di notte (Ariete, Toro, Gemelli, Cancro, Sagittario, ' +
      'Capricorno).',
    signOf: (longitude) => {
      const coppia = DIURNO_NOTTURNO[parti(longitude).segno]!;
      return horaOf(longitude) === 'sole' ? coppia[0] : coppia[1];
    },
    bphs: false,
  },
  {
    id: 'suprajarama',
    name: 'Raman Suprajarama',
    source:
      'Raman Suprajarama, relazione del 15 agosto 2005, «Assessing finances through Hora chart (BV ' +
      'Raman Hora Chart)», riportata su jyotish-blog.blogspot.com il 17 agosto 2005, con la tavola. ' +
      'La regola è sua, non di B. V. Raman; riprende la hora degli Yavana che Varahamihira riporta ' +
      '(BJ I.12), il signore del segno e dell\'undicesimo.',
    rule:
      "Nel segno dispari la prima metà va al segno diurno del signore del segno, la seconda al " +
      "segno notturno del signore dell'undicesimo; nel pari la prima al notturno del signore del " +
      "segno, la seconda al diurno del signore dell'undicesimo. Per il Sole i due segni sono il " +
      'Leone, per la Luna il Cancro.',
    signOf: (longitude) => {
      const { segno, dispari, prima } = parti(longitude);
      const coppia = DIURNO_NOTTURNO_SUPRAJARAMA[prima ? segno : (segno + 10) % 12]!;
      return dispari === prima ? coppia[0] : coppia[1];
    },
    bphs: false,
  },
  {
    id: 'uma-shambhu',
    name: 'Uma-Shambhu',
    source:
      'P.V.R. Narasimha Rao, «Parasara\'s Hora Chart Decoded: Uma-Shambhu Hora» (2012), con la ' +
      'tavola completa a p. 3, sull\'esempio del navamsa di Krishna Mishra.',
    rule:
      "Due giri dello zodiaco dall'Ariete, come la parivritti-dvaya, ma nei segni pari l'ordine " +
      'delle due metà si rovescia: il Toro va al Cancro e poi ai Gemelli. La hora è del Sole se il ' +
      'segno di arrivo è dispari, della Luna se è pari.',
    signOf: (longitude) => {
      const { segno, dispari, prima } = parti(longitude);
      return at(2 * segno + (dispari === prima ? 0 : 1));
    },
    bphs: false,
  },
];

export const DEFAULT_HORA_CONVENTION: HoraConvention = 'parashara';

/** La definizione di una convenzione, o un errore che elenca quelle che ci sono. */
export function horaConvention(id: HoraConvention = DEFAULT_HORA_CONVENTION): HoraConventionDefinition {
  const definition = HORA_CONVENTIONS.find((convention) => convention.id === id);
  if (!definition) {
    throw new ChartError(
      'VARGA_NON_VALIDO',
      `Convenzione della hora "${id}" sconosciuta. Disponibili: ${HORA_CONVENTIONS.map((c) => c.id).join(', ')}.`,
    );
  }
  return definition;
}

/**
 * La convenzione con cui i conti del BPHS (varga buoni, vimshopaka) contano
 * la hora: quella chiesta se è del testo o del suo traduttore, altrimenti
 * Parashara. Vedi `bphs`.
 */
export function bphsHoraConvention(id: HoraConvention = DEFAULT_HORA_CONVENTION): HoraConventionDefinition {
  const chiesta = horaConvention(id);
  return chiesta.bphs ? chiesta : horaConvention('parashara');
}

/**
 * La hora in cui cade una longitudine **siderale**: quella del Sole o della
 * Luna. Vale per ogni convenzione, perché tutte cominciano da qui.
 */
export function horaOf(siderealLongitude: number): Hora {
  const longitude = normalize360(siderealLongitude);
  // L'Ariete ha indice 0 ed è il primo segno, quindi dispari.
  const dispari = Math.floor(longitude / 30) % 2 === 0;
  const primaMeta = degreeInSign(longitude) < 15;
  return dispari === primaMeta ? 'sole' : 'luna';
}
