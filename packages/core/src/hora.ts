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
 * Le altre varianti moderne con un segno (la parivritti-dvaya, la Kashinatha,
 * la Uma-Shambhu, quella di Raman Suprajarama) hanno ciascuna un autore e
 * possono entrare accanto a queste due; finora non ci sono. La regola di
 * Garga e Yavana, che Varahamihira riporta e scarta (BJ I.12), no.
 *
 * Le fonti stanno in `texts/jyotisha/`: `bphs-santhanam-1992-vol1` e
 * `narasimha-rao-personal-finances-hora-chart-2003`, con le trascrizioni.
 */

import { ChartError } from './errors.js';
import { degreeInSign, normalize360 } from './math.js';
import type { Hora, HoraConvention, HoraConventionInfo, ZodiacSign } from './types.js';

export interface HoraConventionDefinition extends HoraConventionInfo {
  /** La regola in una riga, che viaggia col risultato come quella di ogni varga. */
  rule: string;
  /** Il segno che la convenzione dà a ciascuna hora, se ne dà uno. */
  signOf?: Readonly<Record<Hora, ZodiacSign>>;
}

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
    signOf: { sole: 'leone', luna: 'cancro' },
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
