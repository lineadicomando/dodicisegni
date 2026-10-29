/**
 * Il pacchetto delle dignità secondo Tolomeo, *Tetrabiblos* I.17-21, ed.
 * Robbins (Loeb Classical Library, 1940): la scuola che si chiede con
 * `dignitySchool: 'tolomeo'`.
 *
 * Tiene quello che Tolomeo dà, e niente di più:
 *
 * - **i domicili** dei sette (I.17, pp. 79-83), gli stessi di `dignita.ts`;
 * - **le esaltazioni per segno, senza gradi**, con la «depression» nel segno
 *   opposto (I.19, pp. 89-91): anche queste sono quelle di `dignita.ts`, che
 *   le cita da qui;
 * - **le triplicità**, cioè i signori dei quattro triangoli (I.18, pp.
 *   83-89): due per triangolo, uno che governa di giorno e uno di notte, e
 *   nell'acqua Marte con Venere di giorno e la Luna di notte come
 *   co-reggenti;
 * - **i termini «secondo Tolomeo»** (I.21, pp. 105-107), dalla tavola greca
 *   di p. 106.
 *
 * E non tiene quello che Tolomeo non ha. Le **facce** decaniche non ci sono:
 * la «proper face» di I.23 è un aspetto ai luminari, un'altra cosa. Non c'è
 * l'**esilio**, che in I.17-19 Tolomeo non nomina. Non c'è un **punteggio**:
 * i punti delle dignità sono di autori più tardi. E non c'è la **ricezione**,
 * che Tolomeo non definisce: quella del tema è la definizione di Lilly, e
 * contarla sui termini di Tolomeo farebbe una dottrina che nessuno dei due ha
 * scritto. Con questa scuola le ricezioni restano quelle comuni.
 *
 * I gradi delle esaltazioni, i Nodi, le facce caldee e le triplicità con
 * Marte solo sull'acqua sono di Lilly, in `dignita-lilly.ts`: i due
 * pacchetti non si mescolano.
 */

import { SIGN_ELEMENT } from './constants.js';
import { degreeInSign, signOf } from './math.js';
import { DOMICILES, exaltationOf, fallOf } from './dignita.js';
import type { BodyId, Element, PtolemyDignity, PtolemyRulers, Sect, ZodiacSign } from './types.js';

export type { PtolemyDignity, PtolemyRulers };

/** La riga che viaggia col risultato: da dove vengono le tavole. */
export const PTOLEMY_SOURCE =
  'Tolomeo, Tetrabiblos, ed. Robbins (Loeb 1940): domicili I.17, esaltazioni per segno e cadute I.19, ' +
  'triplicità I.18 coi co-reggenti dell\'acqua, termini «secondo Tolomeo» I.21 dalla tavola greca di p. 106; ' +
  'niente facce (I.23), niente esilio, niente punteggio.';

/**
 * La tavola dei termini, e le sue varianti, in una riga. La tavola di Robbins
 * segue il cod. Vat. gr. 1453; Proclo ne dà doppie lezioni in sette segni, e
 * i termini che Lilly chiama «according to Ptolomy» seguono quelle o altro.
 */
export const PTOLEMY_TERMS_SOURCE =
  'Termini: tavola greca di Robbins, p. 106 (cod. Vat. gr. 1453), le cui somme per pianeta (Saturno 57, ' +
  'Giove 79, Marte 66, Venere 82, Mercurio 76) sono quelle dei termini egizi, come Tolomeo dice a p. 103. ' +
  'Proclo dà doppie lezioni in Toro, Cancro, Leone, Bilancia, Scorpione, Capricorno e Pesci (nota a pp. 106-107). ' +
  'Nel Leone la tavola mette primo Giove, il testo di p. 105 Saturno: qui si segue la tavola.';

/** I sette pianeti, gli unici a cui Tolomeo dà domicili, triangoli e termini. */
export const PTOLEMY_PLANETS = [
  'sole',
  'luna',
  'mercurio',
  'venere',
  'marte',
  'giove',
  'saturno',
] as const satisfies readonly BodyId[];

export type PtolemyPlanet = (typeof PTOLEMY_PLANETS)[number];

/**
 * I triangoli, I.18. `signori` sono i pianeti a cui il triangolo è
 * assegnato, nell'ordine del testo; `diurna` e `notturna` chi lo governa in
 * ciascuna setta.
 *
 * - Fuoco (p. 83): «assigned to the sun and Jupiter … The sun assumes first
 *   governance of it by day and Jupiter by night».
 * - Terra (p. 85): «assigned to the moon and Venus; the moon governs it by
 *   night and Venus by day».
 * - Aria (p. 87): Saturno e Mercurio, «with Saturn governing during the day
 *   on account of his sect and Mercury by night».
 * - Acqua (p. 87): «left to the only remaining planet, Mars … and along with
 *   him … the moon by night and Venus by day are co-rulers». Marte governa
 *   in tutte e due le sette, e il co-reggente cambia.
 *
 * Signore del triangolo è chi vi è assegnato, a prescindere dalla setta: è
 * così che I.21 conta «the lords of the triplicity» per ordinare i termini,
 * dove dice che Venere sola regge il triangolo del Toro «since the moon does
 * not participate in the terms». La setta dice chi governa, non chi ne è
 * signore, e sta in un campo a parte.
 */
const TRIANGOLI: Readonly<
  Record<Element, { signori: readonly PtolemyPlanet[]; diurna: readonly PtolemyPlanet[]; notturna: readonly PtolemyPlanet[] }>
> = {
  fuoco: { signori: ['sole', 'giove'], diurna: ['sole'], notturna: ['giove'] },
  terra: { signori: ['luna', 'venere'], diurna: ['venere'], notturna: ['luna'] },
  aria: { signori: ['saturno', 'mercurio'], diurna: ['saturno'], notturna: ['mercurio'] },
  acqua: { signori: ['marte', 'luna', 'venere'], diurna: ['marte', 'venere'], notturna: ['marte', 'luna'] },
};

/**
 * I termini «secondo Tolomeo», I.21: per ogni segno cinque tratti, ciascuno
 * col suo pianeta e il grado in cui finisce, che è il totale progressivo che
 * la tavola greca di p. 106 stampa accanto ai gradi. Letti sulla scansione,
 * non sull'HTML di LacusCurtius, che nella Bilancia ha ♄ al posto di ♂
 * nell'ultimo tratto.
 *
 * Il tratto comprende il suo inizio ed esclude la fine, come nei termini di
 * Lilly: la tavola dà le fini, e 6°00' dell'Ariete è già del secondo tratto.
 *
 * Due cose che la tavola fa e il testo non direbbe: nel Leone mette primo
 * Giove e Saturno terzo, mentre a p. 105 Tolomeo scrive che il Leone va a
 * Saturno («Cancer to Mars and Leo to Saturn»); e in sette segni Proclo
 * legge altrimenti. Si segue la tavola com'è stampata, e `PTOLEMY_TERMS_SOURCE`
 * lo dice.
 */
const TERMINI: Readonly<Record<ZodiacSign, readonly (readonly [PtolemyPlanet, number])[]>> = {
  ariete: [['giove', 6], ['venere', 14], ['mercurio', 21], ['marte', 26], ['saturno', 30]],
  toro: [['venere', 8], ['mercurio', 15], ['giove', 22], ['saturno', 24], ['marte', 30]],
  gemelli: [['mercurio', 7], ['giove', 13], ['venere', 20], ['marte', 26], ['saturno', 30]],
  cancro: [['marte', 6], ['giove', 13], ['mercurio', 20], ['venere', 27], ['saturno', 30]],
  leone: [['giove', 6], ['mercurio', 13], ['saturno', 19], ['venere', 25], ['marte', 30]],
  vergine: [['mercurio', 7], ['venere', 13], ['giove', 18], ['saturno', 24], ['marte', 30]],
  bilancia: [['saturno', 6], ['venere', 11], ['mercurio', 16], ['giove', 24], ['marte', 30]],
  scorpione: [['marte', 6], ['venere', 13], ['giove', 21], ['mercurio', 27], ['saturno', 30]],
  sagittario: [['giove', 8], ['venere', 14], ['mercurio', 19], ['saturno', 25], ['marte', 30]],
  capricorno: [['venere', 6], ['mercurio', 12], ['giove', 19], ['saturno', 25], ['marte', 30]],
  acquario: [['saturno', 6], ['mercurio', 12], ['venere', 20], ['giove', 25], ['marte', 30]],
  pesci: [['venere', 8], ['giove', 14], ['mercurio', 20], ['marte', 25], ['saturno', 30]],
};

/** I signori del triangolo di un segno, tutti, nell'ordine del testo. */
export function ptolemyTriplicityLords(sign: ZodiacSign): PtolemyPlanet[] {
  return [...TRIANGOLI[SIGN_ELEMENT[sign]].signori];
}

/** Chi governa il triangolo di un segno in una setta. */
export function ptolemyTriplicityGovernors(sign: ZodiacSign, sect: Sect): PtolemyPlanet[] {
  return [...TRIANGOLI[SIGN_ELEMENT[sign]][sect]];
}

/** Il signore del termine in cui cade una longitudine. */
export function ptolemyTermRuler(longitude: number): PtolemyPlanet {
  const grado = degreeInSign(longitude);
  const tratti = TERMINI[signOf(longitude)];
  // L'ultimo tratto finisce a 30, che `degreeInSign` non raggiunge mai.
  return (tratti.find(([, fine]) => grado < fine) ?? tratti[tratti.length - 1]!)[0];
}

/** I termini di un segno, come coppie pianeta e grado finale. */
export function ptolemyTerms(sign: ZodiacSign): [PtolemyPlanet, number][] {
  return TERMINI[sign].map(([pianeta, fine]) => [pianeta, fine]);
}

/** I signori di un grado secondo Tolomeo. La setta serve solo a dire chi governa il triangolo. */
export function ptolemyRulersAt(longitude: number, sect: Sect | undefined): PtolemyRulers {
  const sign = signOf(longitude);
  const esaltato = PTOLEMY_PLANETS.find((pianeta) => exaltationOf(pianeta) === sign);
  return {
    domicilio: DOMICILES.tradizionale[sign],
    ...(esaltato ? { esaltazione: esaltato } : {}),
    triplicita: ptolemyTriplicityLords(sign),
    ...(sect ? { triplicitaDiSetta: ptolemyTriplicityGovernors(sign, sect) } : {}),
    termine: ptolemyTermRuler(longitude),
  };
}

/**
 * Le dignità e la debilità di un corpo nel grado in cui sta: domicilio,
 * esaltazione, triplicità, termine e caduta. La triplicità vale per tutti i
 * signori del triangolo, senza bisogno della setta (vedi `TRIANGOLI`).
 *
 * Solo i sette: i Nodi e i pianeti moderni in Tolomeo non ci sono, e ricevono
 * un elenco vuoto.
 */
export function ptolemyDignitiesOf(body: BodyId, longitude: number): PtolemyDignity[] {
  if (!(PTOLEMY_PLANETS as readonly BodyId[]).includes(body)) return [];
  const sign = signOf(longitude);
  const signori = ptolemyRulersAt(longitude, undefined);
  const risultato: PtolemyDignity[] = [];
  if (signori.domicilio === body) risultato.push('domicilio');
  if (signori.esaltazione === body) risultato.push('esaltazione');
  if (signori.triplicita.includes(body)) risultato.push('triplicita');
  if (signori.termine === body) risultato.push('termine');
  if (fallOf(body) === sign) risultato.push('caduta');
  return risultato;
}

/**
 * La riga delle ricezioni quando la scuola è Tolomeo. Le ricezioni sono
 * quelle comuni, e la riga dice perché.
 */
export const PTOLEMY_RECEPTION_SOURCE =
  'Tolomeo non definisce la ricezione: queste sono di Lilly (p. 112 mutua, p. 176 semplice) per domicilio ed ' +
  'esaltazione, che coincidono con Tolomeo I.17 e I.19. Sulle triplicità e i termini di Tolomeo non si contano, ' +
  'per non mescolare le due scuole.';
