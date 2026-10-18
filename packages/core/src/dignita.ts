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
 * due forme che un tema tropicale si sente chiedere; esaltazioni, triplicità,
 * termini e facce verranno come tavole a sé, con le loro fonti.
 */

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
    'i sette pianeti, comuni alle scuole antiche (Tolomeo, Tetrabiblos I.17; Lilly, Christian Astrology, p. 104).',
  moderno:
    "convenzione del Novecento senza un autore unico: Urano all'Acquario e Nettuno ai Pesci come li riferisce Alan Leo (The Art of Synthesis, 1912, p. 117), Plutone allo Scorpione senza un autore.",
};

/** Il signore di un segno secondo una delle due convenzioni. */
export function domicileLord(sign: ZodiacSign, scheme: DomicileScheme): BodyId {
  return DOMICILES[scheme][sign];
}
