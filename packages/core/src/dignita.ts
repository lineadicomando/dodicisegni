/**
 * Le dignità: tavole senza moto e senza tempo, ciascuna con la sua scuola.
 *
 * Una dignità dice quale pianeta abbia autorità su un tratto dello zodiaco.
 * Che cosa ne segua per chi ha quel pianeta lì è interpretazione e sta a chi
 * legge; quale pianeta la tavola assegni è una regola di una tradizione, che
 * si ricalcola, e sta qui.
 *
 * **Le scuole non si mescolano.** Ogni tavola dice da dove viene, e dove due
 * convenzioni divergono il risultato le porta tutte e due, ciascuna col suo
 * nome, invece di sceglierne una in silenzio. Oggi ci sono i domicili, nelle
 * due forme che un tema tropicale si sente chiedere, l'esilio che ne discende
 * e le esaltazioni con le cadute, che hanno una forma sola; triplicità,
 * termini e facce verranno come tavole a sé, con le loro fonti.
 */

import { ZODIAC_SIGNS } from './constants.js';
import type { BodyId, ZodiacSign } from './types.js';

/** Le due convenzioni dei domicili, che il tema porta affiancate. */
export type DomicileScheme = 'tradizionale' | 'moderno';

/**
 * I domicili tradizionali: a ogni segno il suo signore fra i sette pianeti.
 *
 * Tolomeo, *Tetrabiblos* I.17, ed. Robbins (Loeb 435, 1940), pp. 79-83: i
 * luminari a p. 79, Saturno, Giove, Marte e Venere a p. 81, Mercurio a p. 83.
 * Lilly, *Christian Astrology* (1647), p. 104, dà la stessa colonna nella sua
 * tavola delle dignità, che intitola «according to Ptolomy». Valente,
 * *Anthologiae* I.2, ed. Kroll (1908), pp. 5-13, scrive «οἶκος» per nove
 * segni, che coincidono; per Toro, Acquario e Pesci non lo scrive, e la
 * coincidenza lì è solo dello schema. Bonatti non è stato letto.
 */
const DOMICILI_TRADIZIONALI: Readonly<Record<ZodiacSign, BodyId>> = {
  ariete: 'marte',
  toro: 'venere',
  gemelli: 'mercurio',
  cancro: 'luna',
  leone: 'sole',
  vergine: 'mercurio',
  bilancia: 'venere',
  scorpione: 'marte',
  sagittario: 'giove',
  capricorno: 'saturno',
  acquario: 'saturno',
  pesci: 'giove',
};

/**
 * I domicili moderni: gli stessi, con i tre pianeti scoperti dopo il
 * telescopio al posto dei signori antichi in tre segni.
 *
 * Non hanno un autore unico, e la riga di `DOMICILE_SOURCES` non gliene
 * inventa uno. Alan Leo, *The Art of Synthesis* (3ª ed., 1912), p. 117, dice
 * di ritenere da tempo che Urano e Nettuno reggano Acquario e Pesci, ma
 * riferisce un uso, non lo fonda: Urano all'Acquario circolava già
 * nell'Ottocento (Varley, 1828, secondo una fonte secondaria che non dà la
 * pagina), e chi abbia proposto per primo Nettuno ai Pesci non si è trovato.
 * Per Plutone allo Scorpione nessun autore: si afferma dopo il 1930, e nel
 * 1942 C. C. Zain lo usa dichiarando che è solo il più diffuso.
 */
const DOMICILI_MODERNI: Readonly<Record<ZodiacSign, BodyId>> = {
  ...DOMICILI_TRADIZIONALI,
  scorpione: 'plutone',
  acquario: 'urano',
  pesci: 'nettuno',
};

export const DOMICILES: Readonly<Record<DomicileScheme, Readonly<Record<ZodiacSign, BodyId>>>> = {
  tradizionale: DOMICILI_TRADIZIONALI,
  moderno: DOMICILI_MODERNI,
};

/**
 * Da dove viene ciascuna tavola, in una riga che viaggia col risultato.
 *
 * Come la regola di un varga: un signore consegnato senza la convenzione che
 * l'ha assegnato non si può ricontrollare, e chi ne segue un'altra deve
 * vederlo prima di confrontare.
 */
export const DOMICILE_SOURCES: Readonly<Record<DomicileScheme, string>> = {
  tradizionale:
    'i sette pianeti, comuni alle scuole antiche (Tolomeo, Tetrabiblos I.17; Lilly, p. 104).',
  moderno:
    "Novecento, senza un autore unico: Urano e Nettuno come li riferisce Alan Leo (The Art of Synthesis, p. 117), Plutone senza un autore.",
};

/** Il signore di un segno secondo una delle due convenzioni. */
export function domicileLord(sign: ZodiacSign, scheme: DomicileScheme): BodyId {
  return DOMICILES[scheme][sign];
}

/**
 * Le esaltazioni, per segno e senza gradi.
 *
 * Tolomeo, *Tetrabiblos* I.19, ed. Robbins (Loeb 435, 1940), pp. 89-91. I
 * gradi (il Sole a 19 dell'Ariete, la Luna a 3 del Toro...) Tolomeo non li
 * dà: vengono da Firmico, *Mathesis* II.3.5-6, ed. Kroll-Skutsch I (1897),
 * p. 44, e Lilly li ripete a p. 104, dove aggiunge anche i Nodi. Sono una
 * scuola, e arriveranno col suo pacchetto; qui sta la parte su cui le tre
 * fonti concordano, che è il segno. Valente, I.2, una tavola delle
 * esaltazioni non ce l'ha. Il BPHS dà gradi diversi per il Sole e per Giove
 * ed è un'altra tradizione, che non va mescolata a questa: sta in
 * `dignita-parashara.ts`.
 *
 * Urano, Nettuno e Plutone non ci sono: le esaltazioni che circolano per
 * loro non hanno un autore, e per la stessa ragione non c'è una colonna
 * moderna.
 */
const ESALTAZIONI: Readonly<Partial<Record<BodyId, ZodiacSign>>> = {
  sole: 'ariete',
  luna: 'toro',
  saturno: 'bilancia',
  giove: 'cancro',
  marte: 'capricorno',
  venere: 'pesci',
  mercurio: 'vergine',
};

export const EXALTATION_SOURCE =
  'Tolomeo, Tetrabiblos I.19, per segno e senza gradi; caduta nel segno opposto.';

export const DETRIMENT_SOURCE =
  'il segno opposto al domicilio (Lilly, p. 104; nella moderna per la stessa regola).';

/** Il segno opposto: sei segni più in là. */
function opposite(sign: ZodiacSign): ZodiacSign {
  return ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sign) + 6) % 12] as ZodiacSign;
}

/** Il segno di esaltazione di un corpo, se la tavola gliene dà uno. */
export function exaltationOf(body: BodyId): ZodiacSign | undefined {
  return ESALTAZIONI[body];
}

/**
 * Il segno di caduta: l'opposto dell'esaltazione. Non è un derivato nostro,
 * Tolomeo lo scrive pianeta per pianeta («depression»), e la colonna Fall di
 * Lilly coincide.
 */
export function fallOf(body: BodyId): ZodiacSign | undefined {
  const esaltazione = ESALTAZIONI[body];
  return esaltazione && opposite(esaltazione);
}

/**
 * I segni di esilio in una delle due convenzioni: gli opposti dei domicili.
 *
 * Nella tradizionale la regola ha una fonte, la colonna Detriment di Lilly a
 * p. 104, che segno per segno nomina il signore del segno opposto. Nella
 * moderna è la stessa regola applicata all'altra tavola, e va detto: è così
 * che Saturno in Leone è in esilio per l'una e non per l'altra.
 */
export function detrimentsOf(body: BodyId, scheme: DomicileScheme): ZodiacSign[] {
  return ZODIAC_SIGNS.filter((sign) => DOMICILES[scheme][sign] === body).map(opposite);
}

/** Che cosa un corpo ha nel segno in cui sta. */
export type Dignity = 'domicilio' | 'esaltazione' | 'esilio' | 'caduta';

/**
 * Le dignità e le debilità di un corpo in un segno, secondo una convenzione.
 *
 * Esaltazione e caduta stanno solo nella tradizionale, che è l'unica ad
 * averne una tavola con un autore. Un corpo può averne due insieme: Mercurio
 * in Vergine è in domicilio ed esaltato, in Pesci in esilio e in caduta.
 */
export function dignitiesOf(body: BodyId, sign: ZodiacSign, scheme: DomicileScheme): Dignity[] {
  const risultato: Dignity[] = [];
  if (DOMICILES[scheme][sign] === body) risultato.push('domicilio');
  if (scheme === 'tradizionale' && exaltationOf(body) === sign) risultato.push('esaltazione');
  if (detrimentsOf(body, scheme).includes(sign)) risultato.push('esilio');
  if (scheme === 'tradizionale' && fallOf(body) === sign) risultato.push('caduta');
  return risultato;
}
