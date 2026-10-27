/**
 * Le dignità essenziali secondo Lilly, intere: la scuola che il tema
 * tropicale porta solo a richiesta.
 *
 * La tavola è una sola, *Christian Astrology* (Londra 1647), p. 104, «A Table
 * of the Essentiall Dignities of the Planets according to Ptolomy», e p. 105
 * spiega come si legge; la trascrizione colonna per colonna sta nella copia
 * locale della fonte (`texts/occidentale/lilly-christian-astrology-1647`,
 * `trascrizioni.md`). Domicili, esilio e caduta per segno sono gli stessi di
 * `dignita.ts`, che li prova contro la stessa pagina; qui si aggiunge ciò che
 * di quella tavola è di Lilly e non di tutte le scuole antiche:
 *
 * - **le esaltazioni col grado**, e quelle dei Nodi, il Nord a 3 dei Gemelli e
 *   il Sud a 3 del Sagittario, con le cadute nei segni opposti;
 * - **le triplicità**, un reggente di giorno e uno di notte, e l'acqua a Marte
 *   in tutti e due i casi, «according to Ptolomy and Naibod» (p. 105);
 * - **i termini**, cinque tratti diseguali per segno, nella versione che Lilly
 *   chiama di Tolomeo;
 * - **le facce**, tre tratti di dieci gradi per segno, nell'ordine caldeo.
 *
 * Il pacchetto non si mescola con altre scuole, ed è la ragione per cui sta
 * in un file suo: le triplicità di Doroteo coi termini di Lilly sarebbero una
 * dottrina che nessuno ha praticato. I punti che Lilly stampa in calce alla
 * tavola (4 l'esaltazione, 3 la triplicità, 2 il termine, 1 la faccia, 5
 * l'esilio, 4 la caduta) non sono qui: il suo punteggio chiede anche le
 * condizioni accidentali, e sta con l'astrologia oraria.
 */

import { SIGN_ELEMENT } from './constants.js';
import { degreeInSign, signOf } from './math.js';
import { DOMICILES, detrimentsOf } from './dignita.js';
import type { BodyId, Element, Sect, ZodiacSign } from './types.js';

/** La riga che viaggia col risultato: da dove vengono le tavole. */
export const LILLY_SOURCE =
  'Lilly, Christian Astrology (1647), pp. 104-105: esaltazioni col grado e i Nodi, triplicità di giorno e di notte, termini «according to Ptolomy», facce caldee.';

/** I sette pianeti, gli unici a cui Lilly dà domicili, triplicità, termini e facce. */
export const LILLY_PLANETS = [
  'sole',
  'luna',
  'mercurio',
  'venere',
  'marte',
  'giove',
  'saturno',
] as const satisfies readonly BodyId[];

export type LillyPlanet = (typeof LILLY_PLANETS)[number];

/** I corpi che hanno un'esaltazione nella tavola: i sette e i due Nodi. */
type Esaltato = LillyPlanet | 'nodo-nord' | 'nodo-sud';

/**
 * Le esaltazioni col grado, colonna Exaltation. I gradi dei sette pianeti
 * sono quelli di Firmico, che `dignita.ts` cita; i Nodi sono di Lilly. Nel
 * Sagittario il glifo del Nodo Sud è stampato male, ma la colonna Fall (il
 * Nodo Nord caduto in Sagittario) e il testo sotto la tavola non lasciano
 * dubbi.
 */
const ESALTAZIONI: Readonly<Record<Esaltato, { sign: ZodiacSign; degree: number }>> = {
  sole: { sign: 'ariete', degree: 19 },
  luna: { sign: 'toro', degree: 3 },
  'nodo-nord': { sign: 'gemelli', degree: 3 },
  giove: { sign: 'cancro', degree: 15 },
  mercurio: { sign: 'vergine', degree: 15 },
  saturno: { sign: 'bilancia', degree: 21 },
  'nodo-sud': { sign: 'sagittario', degree: 3 },
  marte: { sign: 'capricorno', degree: 28 },
  venere: { sign: 'pesci', degree: 27 },
};

/**
 * Le cadute: la colonna Fall, che per i Nodi le stampa anche lei (il Sud nei
 * Gemelli, il Nord nel Sagittario). Scritte e non ricavate, perché sono una
 * colonna della tavola; il test verifica che stiano nel segno opposto.
 */
const CADUTE: Readonly<Record<Esaltato, ZodiacSign>> = {
  sole: 'bilancia',
  luna: 'scorpione',
  'nodo-nord': 'sagittario',
  giove: 'capricorno',
  mercurio: 'pesci',
  saturno: 'ariete',
  'nodo-sud': 'gemelli',
  marte: 'cancro',
  venere: 'vergine',
};

/**
 * Le triplicità: il reggente di giorno e quello di notte, per elemento.
 * Nell'acqua sono lo stesso pianeta, ed è Lilly a dirlo: Marte «ruleth onely
 * that Triplicity both day and night».
 */
const TRIPLICITA: Readonly<Record<Element, Readonly<Record<Sect, LillyPlanet>>>> = {
  fuoco: { diurna: 'sole', notturna: 'giove' },
  terra: { diurna: 'venere', notturna: 'luna' },
  aria: { diurna: 'saturno', notturna: 'mercurio' },
  acqua: { diurna: 'marte', notturna: 'marte' },
};

/**
 * I termini: per ogni segno cinque tratti, ciascuno col suo pianeta e il grado
 * in cui finisce. «The first six degrees of ♈ are the Termes of ♃; from six to
 * fourteen, the Termes of ♀» (p. 105): il tratto comprende il suo inizio ed
 * esclude la fine, così che 6°00' dell'Ariete è già di Venere.
 */
const TERMINI: Readonly<Record<ZodiacSign, readonly (readonly [LillyPlanet, number])[]>> = {
  ariete: [['giove', 6], ['venere', 14], ['mercurio', 21], ['marte', 26], ['saturno', 30]],
  toro: [['venere', 8], ['mercurio', 15], ['giove', 22], ['saturno', 26], ['marte', 30]],
  gemelli: [['mercurio', 7], ['giove', 14], ['venere', 21], ['saturno', 25], ['marte', 30]],
  cancro: [['marte', 6], ['giove', 13], ['mercurio', 20], ['venere', 27], ['saturno', 30]],
  leone: [['saturno', 6], ['mercurio', 13], ['venere', 19], ['giove', 25], ['marte', 30]],
  vergine: [['mercurio', 7], ['venere', 13], ['giove', 18], ['saturno', 24], ['marte', 30]],
  bilancia: [['saturno', 6], ['venere', 11], ['giove', 19], ['mercurio', 24], ['marte', 30]],
  scorpione: [['marte', 6], ['giove', 14], ['venere', 21], ['mercurio', 27], ['saturno', 30]],
  sagittario: [['giove', 8], ['venere', 14], ['mercurio', 19], ['saturno', 25], ['marte', 30]],
  capricorno: [['venere', 6], ['mercurio', 12], ['giove', 19], ['marte', 25], ['saturno', 30]],
  acquario: [['saturno', 6], ['mercurio', 12], ['venere', 20], ['giove', 25], ['marte', 30]],
  pesci: [['venere', 8], ['giove', 14], ['mercurio', 20], ['marte', 26], ['saturno', 30]],
};

/** Le facce: tre per segno, di dieci gradi, dall'inizio del segno. */
const FACCE: Readonly<Record<ZodiacSign, readonly [LillyPlanet, LillyPlanet, LillyPlanet]>> = {
  ariete: ['marte', 'sole', 'venere'],
  toro: ['mercurio', 'luna', 'saturno'],
  gemelli: ['giove', 'marte', 'sole'],
  cancro: ['venere', 'mercurio', 'luna'],
  leone: ['saturno', 'giove', 'marte'],
  vergine: ['sole', 'venere', 'mercurio'],
  bilancia: ['luna', 'saturno', 'giove'],
  scorpione: ['marte', 'sole', 'venere'],
  sagittario: ['mercurio', 'luna', 'saturno'],
  capricorno: ['giove', 'marte', 'sole'],
  acquario: ['venere', 'mercurio', 'luna'],
  pesci: ['saturno', 'giove', 'marte'],
};

/** L'esaltazione di un corpo col suo grado, se la tavola gliene dà una. */
export function lillyExaltation(body: BodyId): { sign: ZodiacSign; degree: number } | undefined {
  return (ESALTAZIONI as Partial<Record<BodyId, { sign: ZodiacSign; degree: number }>>)[body];
}

/** Il segno di caduta di un corpo, dalla colonna Fall. */
export function lillyFall(body: BodyId): ZodiacSign | undefined {
  return (CADUTE as Partial<Record<BodyId, ZodiacSign>>)[body];
}

/**
 * Il reggente di triplicità di un segno. Senza la setta, cioè senza l'ora,
 * c'è solo dove il giorno e la notte hanno lo stesso reggente, cioè
 * nell'acqua: altrove il reggente non è ignoto per caso, dipende da un dato
 * che manca.
 */
export function lillyTriplicityRuler(sign: ZodiacSign, sect: Sect | undefined): LillyPlanet | undefined {
  const reggenti = TRIPLICITA[SIGN_ELEMENT[sign]];
  if (sect) return reggenti[sect];
  return reggenti.diurna === reggenti.notturna ? reggenti.diurna : undefined;
}

/** Il signore del termine in cui cade una longitudine. */
export function lillyTermRuler(longitude: number): LillyPlanet {
  const grado = degreeInSign(longitude);
  const tratti = TERMINI[signOf(longitude)];
  // L'ultimo tratto finisce a 30, che `degreeInSign` non raggiunge mai.
  return (tratti.find(([, fine]) => grado < fine) ?? tratti[tratti.length - 1]!)[0];
}

/** Il signore della faccia in cui cade una longitudine. */
export function lillyFaceRuler(longitude: number): LillyPlanet {
  return FACCE[signOf(longitude)][Math.min(Math.floor(degreeInSign(longitude) / 10), 2)]!;
}

/** Chi ha autorità su un grado dello zodiaco, dignità per dignità. */
export interface LillyRulers {
  domicilio: LillyPlanet;
  /** Il corpo esaltato nel segno, se ce n'è uno: in Leone, Scorpione e Acquario nessuno. */
  esaltazione?: Esaltato;
  /** Assente senza la setta, fuori dall'acqua. */
  triplicita?: LillyPlanet;
  termine: LillyPlanet;
  faccia: LillyPlanet;
}

/** I signori di un grado, secondo la tavola di p. 104. */
export function lillyRulersAt(longitude: number, sect: Sect | undefined): LillyRulers {
  const sign = signOf(longitude);
  const esaltato = (Object.keys(ESALTAZIONI) as Esaltato[]).find(
    (corpo) => ESALTAZIONI[corpo].sign === sign,
  );
  const triplicita = lillyTriplicityRuler(sign, sect);
  return {
    domicilio: DOMICILES.tradizionale[sign] as LillyPlanet,
    ...(esaltato ? { esaltazione: esaltato } : {}),
    ...(triplicita ? { triplicita } : {}),
    termine: lillyTermRuler(longitude),
    faccia: lillyFaceRuler(longitude),
  };
}

/** Le voci della tavola di Lilly, dignità e debilità. */
export type LillyDignity =
  | 'domicilio'
  | 'esaltazione'
  | 'triplicita'
  | 'termine'
  | 'faccia'
  | 'esilio'
  | 'caduta';

/**
 * Le dignità e le debilità essenziali di un corpo nel grado in cui sta.
 *
 * L'esaltazione vale per tutto il segno, come in Lilly («in these Signes the
 * Planets have their Exaltations»): il grado dice dove è più piena, e sta in
 * `lillyExaltation`, ma non restringe la dignità. I Nodi hanno solo
 * esaltazione e caduta; Urano, Nettuno, Plutone e gli altri punti nella
 * tavola non ci sono, e ricevono un elenco vuoto.
 *
 * Un elenco vuoto per uno dei sette non dice «peregrino»: Lilly lo definisce a
 * p. 112, e quella definizione entra con la voce che la usa.
 */
export function lillyDignitiesOf(body: BodyId, longitude: number, sect: Sect | undefined): LillyDignity[] {
  const sign = signOf(longitude);
  const signori = lillyRulersAt(longitude, sect);
  const risultato: LillyDignity[] = [];
  if (signori.domicilio === body) risultato.push('domicilio');
  if (signori.esaltazione === body) risultato.push('esaltazione');
  if (signori.triplicita === body) risultato.push('triplicita');
  if (signori.termine === body) risultato.push('termine');
  if (signori.faccia === body) risultato.push('faccia');
  if (detrimentsOf(body, 'tradizionale').includes(sign)) risultato.push('esilio');
  if (lillyFall(body) === sign) risultato.push('caduta');
  return risultato;
}
