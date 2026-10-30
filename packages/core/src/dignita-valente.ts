/**
 * Il pacchetto delle dignità secondo Vettio Valente, *Anthologiae*, ed.
 * Kroll (Berlino 1908): la scuola ellenistica, che si chiede con
 * `dignitySchool: 'valente'`.
 *
 * Tiene quello che Valente dà:
 *
 * - **i domicili** dei sette, quelli di `dignita.ts`: I.2 (pp. 5-13) scrive
 *   «οἶκος» per nove segni, e per Toro, Acquario e Pesci non lo scrive ma
 *   nemmeno lo contraddice;
 * - **le esaltazioni col grado** e le **cadute** al grado opposto (III.4,
 *   p. 140, rr. 7-13: «ἐν δὲ ταῖς διαμέτροις μοίραις ταπεινοῦνται»), senza i
 *   Nodi;
 * - **i triangoli coi tre signori** (II.1, pp. 55-56): chi presiede nella
 *   setta, l'altro al secondo posto e un terzo che coopera in tutte e due;
 * - **i termini egizi**, quelli che I.3 (pp. 14-19) segue dove il testo è
 *   sano, nella tavola che Tolomeo riferisce (vedi `VALENS_TERMS_SOURCE`).
 *
 * E non tiene quello che in Valente non si è trovato: le **facce**
 * decaniche, l'**esilio**, un **punteggio**, i **Nodi**. Le ricezioni restano
 * quelle comuni, perché Valente non ne ha una: il suo ὑποδοχεύς (II.31,
 * pp. 102-105) è il signore del segno, non una ricezione fra due pianeti.
 * Cercata nell'indice di Kroll il 30 ottobre 2026, con l'esilio, che
 * nemmeno c'è; le trascrizioni in `texts/occidentale/valente-anthologiae-
 * kroll-1908`. Quella del tema è di Lilly.
 *
 * Le tavole sono scritte qui, e non prese da Bonatti, che ha gli stessi tre
 * signori dei triangoli, né da Lilly, che ha gli stessi gradi: una scuola
 * porta le sue. Trascrizioni nella copia locale
 * (`texts/occidentale/valente-anthologiae-kroll-1908`, `trascrizioni.md`).
 */

import { SIGN_ELEMENT, ZODIAC_SIGNS } from './constants.js';
import { degreeInSign, signOf } from './math.js';
import { DOMICILES } from './dignita.js';
import type { BodyId, Element, Sect, ValensDignity, ValensRulers, ZodiacSign } from './types.js';

export type { ValensDignity, ValensRulers };

/** La riga che viaggia col risultato: da dove vengono le tavole. */
export const VALENS_SOURCE =
  'Vettio Valente, Anthologiae, ed. Kroll (1908): domicili I.2, esaltazioni col grado e cadute al grado opposto ' +
  'III.4 (p. 140), triangoli coi tre signori ordinati per setta II.1 (pp. 55-56), termini egizi I.3; ' +
  'niente Nodi, facce, esilio né punteggio.';

/** La tavola dei termini seguita, e dove il testo di Valente se ne scosta. */
export const VALENS_TERMS_SOURCE =
  'Termini: gli egizi, nella tavola che Tolomeo riferisce (Tetrabiblos I.21, ed. Robbins, p. 96; somme Saturno 57, ' +
  'Giove 79, Marte 66, Venere 82, Mercurio 76). Valente I.3 (ed. Kroll, pp. 14-19) li segue in nove segni; ' +
  'nella Bilancia stampa Saturno 6, Mercurio 5, Giove 8, Venere 7, Marte 4 (l\'apparato: «ceteri» danno gli ' +
  'egizi), nello Scorpione i suoi numeri sommano 31 e nell\'Ariete due mancano. Lì si seguono gli egizi.';

/** I sette pianeti, gli unici a cui Valente dà domicili, esaltazioni, triangoli e termini. */
export const VALENS_PLANETS = [
  'sole',
  'luna',
  'mercurio',
  'venere',
  'marte',
  'giove',
  'saturno',
] as const satisfies readonly BodyId[];

export type ValensPlanet = (typeof VALENS_PLANETS)[number];

/** Le esaltazioni col grado, III.4, p. 140, nell'ordine del testo. */
const ESALTAZIONI: Readonly<Record<ValensPlanet, { sign: ZodiacSign; degree: number }>> = {
  sole: { sign: 'ariete', degree: 19 },
  luna: { sign: 'toro', degree: 3 },
  giove: { sign: 'cancro', degree: 15 },
  marte: { sign: 'capricorno', degree: 28 },
  saturno: { sign: 'bilancia', degree: 21 },
  mercurio: { sign: 'vergine', degree: 15 },
  venere: { sign: 'pesci', degree: 27 },
};

/**
 * I triangoli, II.1. `diurno` presiede di giorno e `notturno` di notte; in
 * ciascuna setta l'altro dei due sta «δευτέρῳ τόπῳ», e `terzo` «τρίτῳ» in
 * tutte e due. Nel fuoco Valente dice il Sole di giorno, Giove di notte «κατὰ
 * διαδοχήν», e Saturno che «συνεργεῖ» a entrambi; per la terra, l'aria e
 * l'acqua scrive i tre posti per esteso.
 *
 * I tre sono signori del triangolo a prescindere dalla setta, come in
 * Tolomeo e in Bonatti: la setta dice chi presiede.
 */
const TRIANGOLI: Readonly<Record<Element, { diurno: ValensPlanet; notturno: ValensPlanet; terzo: ValensPlanet }>> =
  {
    fuoco: { diurno: 'sole', notturno: 'giove', terzo: 'saturno' },
    terra: { diurno: 'venere', notturno: 'luna', terzo: 'marte' },
    aria: { diurno: 'saturno', notturno: 'mercurio', terzo: 'giove' },
    acqua: { diurno: 'venere', notturno: 'marte', terzo: 'luna' },
  };

/**
 * I termini egizi, dalla tavola greca di Robbins, p. 96: per ogni segno
 * cinque tratti, col pianeta e il grado in cui il tratto finisce. Il tratto
 * comprende il suo inizio ed esclude la fine.
 */
const TERMINI: Readonly<Record<ZodiacSign, readonly (readonly [ValensPlanet, number])[]>> = {
  ariete: [['giove', 6], ['venere', 12], ['mercurio', 20], ['marte', 25], ['saturno', 30]],
  toro: [['venere', 8], ['mercurio', 14], ['giove', 22], ['saturno', 27], ['marte', 30]],
  gemelli: [['mercurio', 6], ['giove', 12], ['venere', 17], ['marte', 24], ['saturno', 30]],
  cancro: [['marte', 7], ['venere', 13], ['mercurio', 19], ['giove', 26], ['saturno', 30]],
  leone: [['giove', 6], ['venere', 11], ['saturno', 18], ['mercurio', 24], ['marte', 30]],
  vergine: [['mercurio', 7], ['venere', 17], ['giove', 21], ['marte', 28], ['saturno', 30]],
  bilancia: [['saturno', 6], ['mercurio', 14], ['giove', 21], ['venere', 28], ['marte', 30]],
  scorpione: [['marte', 7], ['venere', 11], ['mercurio', 19], ['giove', 24], ['saturno', 30]],
  sagittario: [['giove', 12], ['venere', 17], ['mercurio', 21], ['saturno', 26], ['marte', 30]],
  capricorno: [['mercurio', 7], ['giove', 14], ['venere', 22], ['saturno', 26], ['marte', 30]],
  acquario: [['mercurio', 7], ['venere', 13], ['giove', 20], ['marte', 25], ['saturno', 30]],
  pesci: [['venere', 12], ['giove', 16], ['mercurio', 19], ['marte', 28], ['saturno', 30]],
};

/** L'esaltazione di un pianeta col suo grado. */
export function valensExaltation(body: BodyId): { sign: ZodiacSign; degree: number } | undefined {
  return (ESALTAZIONI as Partial<Record<BodyId, { sign: ZodiacSign; degree: number }>>)[body];
}

/** Il segno di caduta: l'opposto dell'esaltazione, «ἐν ταῖς διαμέτροις μοίραις». */
export function valensFall(body: BodyId): ZodiacSign | undefined {
  const esaltazione = valensExaltation(body);
  return esaltazione ? signOf(ZODIAC_SIGNS.indexOf(esaltazione.sign) * 30 + 180) : undefined;
}

/** I tre signori del triangolo di un segno. */
export function valensTriplicityLords(sign: ZodiacSign): {
  diurno: ValensPlanet;
  notturno: ValensPlanet;
  terzo: ValensPlanet;
} {
  return { ...TRIANGOLI[SIGN_ELEMENT[sign]] };
}

/** I tre signori nell'ordine di una setta: chi presiede, il secondo, il terzo. */
export function valensTriplicityOrder(sign: ZodiacSign, sect: Sect): [ValensPlanet, ValensPlanet, ValensPlanet] {
  const { diurno, notturno, terzo } = TRIANGOLI[SIGN_ELEMENT[sign]];
  return sect === 'diurna' ? [diurno, notturno, terzo] : [notturno, diurno, terzo];
}

/** Il signore del termine in cui cade una longitudine. */
export function valensTermRuler(longitude: number): ValensPlanet {
  const grado = degreeInSign(longitude);
  const tratti = TERMINI[signOf(longitude)];
  // L'ultimo tratto finisce a 30, che `degreeInSign` non raggiunge mai.
  return (tratti.find(([, fine]) => grado < fine) ?? tratti[tratti.length - 1]!)[0];
}

/** I termini di un segno, come coppie pianeta e grado finale. */
export function valensTerms(sign: ZodiacSign): [ValensPlanet, number][] {
  return TERMINI[sign].map(([pianeta, fine]) => [pianeta, fine]);
}

/** I signori di un grado secondo Valente. La setta serve solo a dire l'ordine del triangolo. */
export function valensRulersAt(longitude: number, sect: Sect | undefined): ValensRulers {
  const sign = signOf(longitude);
  const esaltato = VALENS_PLANETS.find((pianeta) => ESALTAZIONI[pianeta].sign === sign);
  return {
    domicilio: DOMICILES.tradizionale[sign],
    ...(esaltato ? { esaltazione: esaltato } : {}),
    triplicita: valensTriplicityLords(sign),
    ...(sect ? { triplicitaDiSetta: valensTriplicityOrder(sign, sect) } : {}),
    termine: valensTermRuler(longitude),
  };
}

/**
 * Le dignità e la debilità di un corpo nel grado in cui sta: domicilio,
 * esaltazione, triangolo, termine e caduta. Il triangolo vale per tutti e tre
 * i signori. Solo i sette: gli altri corpi ricevono un elenco vuoto.
 */
export function valensDignitiesOf(body: BodyId, longitude: number): ValensDignity[] {
  if (!(VALENS_PLANETS as readonly BodyId[]).includes(body)) return [];
  const sign = signOf(longitude);
  const signori = valensRulersAt(longitude, undefined);
  const { diurno, notturno, terzo } = signori.triplicita;
  const risultato: ValensDignity[] = [];
  if (signori.domicilio === body) risultato.push('domicilio');
  if (signori.esaltazione === body) risultato.push('esaltazione');
  if (diurno === body || notturno === body || terzo === body) risultato.push('triplicita');
  if (signori.termine === body) risultato.push('termine');
  if (valensFall(body) === sign) risultato.push('caduta');
  return risultato;
}

/** La riga delle ricezioni quando la scuola è Valente. */
export const VALENS_RECEPTION_SOURCE =
  'Valente non definisce una ricezione fra due pianeti (il suo ὑποδοχεύς, II.31, ed. Kroll pp. 102-105, è il ' +
  'signore del segno): queste sono di Lilly (p. 112 mutua, p. 176 semplice) per domicilio ed esaltazione. Sui triangoli e i termini di Valente non si contano, per non ' +
  'mescolare le scuole.';
