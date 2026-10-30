/**
 * Il pacchetto delle dignità secondo Guido Bonatti, *Decem tractatus
 * astronomiae*, trattato II, parte 2 (Augusta, Ratdolt, 1491, ff. 14v-21r):
 * la scuola che si chiede con `dignitySchool: 'bonatti'`.
 *
 * Il cap. V nomina cinque dignità «per naturam», domicilio, esaltazione,
 * termine, triplicità e faccia, e il pacchetto le tiene tutte, come Bonatti
 * le stampa:
 *
 * - **i domicili** dei sette (cap. VI, ff. 14v-15r), quelli di `dignita.ts`;
 * - **l'esilio** nel segno opposto al domicilio (cap. VII, f. 16r), che
 *   Bonatti elenca segno per segno ed è la regola di `dignita.ts`;
 * - **le esaltazioni col grado**, Nodi compresi (cap. VIII, f. 16v), «secondo
 *   Albumasar e Alcabizio», e le **cadute** allo stesso grado del segno
 *   opposto (cap. X, f. 17r);
 * - **le triplicità coi tre signori**, uno di giorno, uno di notte e il
 *   partecipe, che lo è in tutte e due le sette (cap. XI, ff. 17r-17v);
 * - **i termini** che Bonatti dice di Tolomeo (cap. XIV, f. 19v);
 * - **le facce** caldee (cap. XVII, f. 21r).
 *
 * Non c'è un **punteggio**: nei capitoli delle dignità Bonatti non ne dà, e
 * le «fortitudines» del trattato delle rivoluzioni (domicilio 5, esaltazione
 * 4, termine 5, triplicità 3) servono a scegliere il signore dell'anno, non
 * a contare le dignità di un pianeta. Non ci sono le **sue ricezioni**:
 * Bonatti le fa nascere da un'applicazione, per corpo o per aspetto, e con
 * questa scuola restano quelle comuni (vedi `BONATTI_RECEPTION_SOURCE`).
 *
 * Le tavole sono scritte qui, lette sulla stampa, e non prese da Lilly
 * anche dove coincidono (esaltazioni e facce): una scuola porta le sue, e il
 * test le ricopia dalla fonte. La trascrizione sta nella copia locale
 * (`texts/occidentale/bonatti-decem-tractatus-1491`, `trascrizioni.md`).
 */

import { SIGN_ELEMENT, ZODIAC_SIGNS } from './constants.js';
import { degreeInSign, signOf } from './math.js';
import { DOMICILES, detrimentsOf } from './dignita.js';
import type { BodyId, BonattiDignity, BonattiRulers, Element, Sect, ZodiacSign } from './types.js';

export type { BonattiDignity, BonattiRulers };

/** La riga che viaggia col risultato: da dove vengono le tavole. */
export const BONATTI_SOURCE =
  'Bonatti, Decem tractatus astronomiae (Ratdolt 1491), tratt. II, parte 2: domicili cap. VI, esilio cap. VII, ' +
  'esaltazioni col grado e i Nodi cap. VIII, cadute cap. X, triplicità coi tre signori cap. XI, termini cap. XIV, ' +
  'facce caldee cap. XVII (ff. 14v-21r); niente punteggio.';

/** La tavola dei termini seguita, e come si rapporta alle altre. */
export const BONATTI_TERMS_SOURCE =
  'Termini: tavola del cap. XIV (f. 19v), quelli che Bonatti dice di Tolomeo, con le somme dei termini egizi ' +
  '(Saturno 57, Giove 79, Marte 66, Venere 82, Mercurio 76). Uguali alla tavola greca di Robbins in undici segni; ' +
  'nel Leone Saturno è primo e Giove ultimo, come il cap. XV spiega e come Tolomeo scrive a p. 105.';

/** I sette pianeti, gli unici a cui Bonatti dà domicili, triplicità, termini e facce. */
export const BONATTI_PLANETS = [
  'sole',
  'luna',
  'mercurio',
  'venere',
  'marte',
  'giove',
  'saturno',
] as const satisfies readonly BodyId[];

export type BonattiPlanet = (typeof BONATTI_PLANETS)[number];

/** I corpi che hanno un'esaltazione: i sette e i due Nodi. */
type Esaltato = BonattiPlanet | 'nodo-nord' | 'nodo-sud';

/**
 * Le esaltazioni col grado, cap. VIII, f. 16v: «sol exaltatur in ariete
 * scilicet in 19. gradu eius…», fino a «Caput draconis exaltatur in geminis
 * scilicet in 3. gradu eius. Cauda illius exaltatur in sagittario scilicet in
 * 3. gradu». Gli stessi gradi di Firmico e di Lilly.
 */
const ESALTAZIONI: Readonly<Record<Esaltato, { sign: ZodiacSign; degree: number }>> = {
  sole: { sign: 'ariete', degree: 19 },
  luna: { sign: 'toro', degree: 3 },
  saturno: { sign: 'bilancia', degree: 21 },
  giove: { sign: 'cancro', degree: 15 },
  marte: { sign: 'capricorno', degree: 28 },
  venere: { sign: 'pesci', degree: 27 },
  mercurio: { sign: 'vergine', degree: 15 },
  'nodo-nord': { sign: 'gemelli', degree: 3 },
  'nodo-sud': { sign: 'sagittario', degree: 3 },
};

/**
 * Le cadute, cap. X, f. 17r: «omne septimum signum ab exaltatione cuiusque
 * planete dicitur eius descensio sive casus», al grado dell'esaltazione
 * («in simili gradu»), e «Caput draconis cadit in sagittario: cauda in
 * geminis». Il segno opposto all'esaltazione, Nodi compresi: si ricava, e il
 * test lo confronta col capitolo.
 */
function cadutaDi(corpo: Esaltato): ZodiacSign {
  const { sign } = ESALTAZIONI[corpo];
  return signOf(ZODIAC_SIGNS.indexOf(sign) * 30 + 180);
}

/**
 * Le triplicità, cap. XI: per il fuoco (f. 17r) «domini sunt in die sol: in
 * nocte iupiter quorum particeps tam in die quam in nocte est saturnus»; per
 * la terra, l'aria e l'acqua (f. 17v) allo stesso modo. Nell'acqua il
 * signore di giorno è Venere e quello di notte Marte, con la Luna partecipe:
 * non è Tolomeo (Marte coi co-reggenti) né Lilly (Marte di giorno e di
 * notte).
 *
 * Tutti e tre sono signori della triplicità a prescindere dalla setta: è
 * così che Bonatti chiama Saturno, il partecipe, «dominus triplicitatis
 * arietis» negli esempi della ricezione (tratt. III, PDF p. 168). La setta
 * dice chi governa, e sta in un campo a parte.
 */
const TRIPLICITA: Readonly<
  Record<Element, { diurno: BonattiPlanet; notturno: BonattiPlanet; partecipe: BonattiPlanet }>
> = {
  fuoco: { diurno: 'sole', notturno: 'giove', partecipe: 'saturno' },
  terra: { diurno: 'venere', notturno: 'luna', partecipe: 'marte' },
  aria: { diurno: 'saturno', notturno: 'mercurio', partecipe: 'giove' },
  acqua: { diurno: 'venere', notturno: 'marte', partecipe: 'luna' },
};

/**
 * I termini, cap. XIV, f. 19v: per ogni segno cinque tratti, col pianeta e il
 * grado in cui il tratto finisce (la tavola stampa i gradi di ciascun tratto,
 * qui sommati). Il tratto comprende il suo inizio ed esclude la fine, come
 * negli altri pacchetti.
 *
 * Nel Leone la tavola mette Saturno primo e Giove ultimo, e il cap. XV (f.
 * 20r) lo dice: «primus terminus leonis assignatus fuit saturno … preter
 * quam in leone ubi iupiter locatur postremus». Non è un refuso, ed è la
 * sola differenza dalla tavola greca di Robbins in `dignita-tolomeo.ts`.
 */
const TERMINI: Readonly<Record<ZodiacSign, readonly (readonly [BonattiPlanet, number])[]>> = {
  ariete: [['giove', 6], ['venere', 14], ['mercurio', 21], ['marte', 26], ['saturno', 30]],
  toro: [['venere', 8], ['mercurio', 15], ['giove', 22], ['saturno', 24], ['marte', 30]],
  gemelli: [['mercurio', 7], ['giove', 13], ['venere', 20], ['marte', 26], ['saturno', 30]],
  cancro: [['marte', 6], ['giove', 13], ['mercurio', 20], ['venere', 27], ['saturno', 30]],
  leone: [['saturno', 6], ['mercurio', 13], ['marte', 18], ['venere', 24], ['giove', 30]],
  vergine: [['mercurio', 7], ['venere', 13], ['giove', 18], ['saturno', 24], ['marte', 30]],
  bilancia: [['saturno', 6], ['venere', 11], ['mercurio', 16], ['giove', 24], ['marte', 30]],
  scorpione: [['marte', 6], ['venere', 13], ['giove', 21], ['mercurio', 27], ['saturno', 30]],
  sagittario: [['giove', 8], ['venere', 14], ['mercurio', 19], ['saturno', 25], ['marte', 30]],
  capricorno: [['venere', 6], ['mercurio', 12], ['giove', 19], ['saturno', 25], ['marte', 30]],
  acquario: [['saturno', 6], ['mercurio', 12], ['venere', 20], ['giove', 25], ['marte', 30]],
  pesci: [['venere', 8], ['giove', 14], ['mercurio', 20], ['marte', 25], ['saturno', 30]],
};

/**
 * Le facce, cap. XVII, f. 21r: tre per segno, di dieci gradi, dalla prima
 * dell'Ariete a Marte nell'ordine dei cieli.
 */
const FACCE: Readonly<Record<ZodiacSign, readonly [BonattiPlanet, BonattiPlanet, BonattiPlanet]>> = {
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

/** L'esaltazione di un corpo col suo grado, se Bonatti gliene dà una. */
export function bonattiExaltation(body: BodyId): { sign: ZodiacSign; degree: number } | undefined {
  return (ESALTAZIONI as Partial<Record<BodyId, { sign: ZodiacSign; degree: number }>>)[body];
}

/** Il segno di caduta di un corpo, se ha un'esaltazione. */
export function bonattiFall(body: BodyId): ZodiacSign | undefined {
  return body in ESALTAZIONI ? cadutaDi(body as Esaltato) : undefined;
}

/** I tre signori della triplicità di un segno: di giorno, di notte e il partecipe. */
export function bonattiTriplicityLords(sign: ZodiacSign): {
  diurno: BonattiPlanet;
  notturno: BonattiPlanet;
  partecipe: BonattiPlanet;
} {
  return { ...TRIPLICITA[SIGN_ELEMENT[sign]] };
}

/** Chi governa la triplicità di un segno in una setta: il signore di giorno o quello di notte. */
export function bonattiTriplicityGovernor(sign: ZodiacSign, sect: Sect): BonattiPlanet {
  const signori = TRIPLICITA[SIGN_ELEMENT[sign]];
  return sect === 'diurna' ? signori.diurno : signori.notturno;
}

/** Il signore del termine in cui cade una longitudine. */
export function bonattiTermRuler(longitude: number): BonattiPlanet {
  const grado = degreeInSign(longitude);
  const tratti = TERMINI[signOf(longitude)];
  // L'ultimo tratto finisce a 30, che `degreeInSign` non raggiunge mai.
  return (tratti.find(([, fine]) => grado < fine) ?? tratti[tratti.length - 1]!)[0];
}

/** I termini di un segno, come coppie pianeta e grado finale. */
export function bonattiTerms(sign: ZodiacSign): [BonattiPlanet, number][] {
  return TERMINI[sign].map(([pianeta, fine]) => [pianeta, fine]);
}

/** Il signore della faccia in cui cade una longitudine. */
export function bonattiFaceRuler(longitude: number): BonattiPlanet {
  return FACCE[signOf(longitude)][Math.min(Math.floor(degreeInSign(longitude) / 10), 2)]!;
}

/** I signori di un grado secondo Bonatti. La setta serve solo a dire chi governa la triplicità. */
export function bonattiRulersAt(longitude: number, sect: Sect | undefined): BonattiRulers {
  const sign = signOf(longitude);
  const esaltato = (Object.keys(ESALTAZIONI) as Esaltato[]).find((corpo) => ESALTAZIONI[corpo].sign === sign);
  return {
    domicilio: DOMICILES.tradizionale[sign],
    ...(esaltato ? { esaltazione: esaltato } : {}),
    triplicita: bonattiTriplicityLords(sign),
    ...(sect ? { triplicitaDiSetta: bonattiTriplicityGovernor(sign, sect) } : {}),
    termine: bonattiTermRuler(longitude),
    faccia: bonattiFaceRuler(longitude),
  };
}

/**
 * Le dignità e le debilità di un corpo nel grado in cui sta. La triplicità
 * vale per tutti e tre i signori, senza bisogno della setta (vedi
 * `TRIPLICITA`). L'esaltazione vale per tutto il segno, e il grado sta in
 * `bonattiExaltation`.
 *
 * I Nodi hanno solo esaltazione e caduta; Urano, Nettuno, Plutone e gli altri
 * punti in Bonatti non ci sono, e ricevono un elenco vuoto.
 */
export function bonattiDignitiesOf(body: BodyId, longitude: number): BonattiDignity[] {
  const sign = signOf(longitude);
  const signori = bonattiRulersAt(longitude, undefined);
  const { diurno, notturno, partecipe } = signori.triplicita;
  const risultato: BonattiDignity[] = [];
  if (signori.domicilio === body) risultato.push('domicilio');
  if (signori.esaltazione === body) risultato.push('esaltazione');
  if (diurno === body || notturno === body || partecipe === body) risultato.push('triplicita');
  if (signori.termine === body) risultato.push('termine');
  if (signori.faccia === body) risultato.push('faccia');
  if (detrimentsOf(body, 'tradizionale').includes(sign)) risultato.push('esilio');
  if (bonattiFall(body) === sign) risultato.push('caduta');
  return risultato;
}

/**
 * La riga delle ricezioni quando la scuola è Bonatti. Le ricezioni restano
 * quelle comuni, e la riga dice perché: la regola di Bonatti chiede
 * un'applicazione, che una tavola delle dignità non vede.
 */
export const BONATTI_RECEPTION_SOURCE =
  'Bonatti (tratt. III, parte 2, PDF pp. 167-168) fa nascere la ricezione da un\'applicazione per corpo o per ' +
  'aspetto, e la dà al signore del domicilio, dell\'esaltazione o di due dignità minori insieme (termine e ' +
  'triplicità, termine e faccia, faccia e triplicità), mai di una sola. Qui non è calcolata: queste sono le ' +
  'ricezioni comuni, di Lilly (p. 112 mutua, p. 176 semplice) per domicilio ed esaltazione.';
