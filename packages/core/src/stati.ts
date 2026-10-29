/**
 * Le condizioni dei graha che BPHS 6.53 nomina: combustione (*astaṃgatā*),
 * sconfitta in guerra planetaria (*grahajitā*) e avastha come *śayana*
 * (*śayanādi-gatāḥ*). La neecha, l'altra condizione del verso, sta in
 * `dignita-parashara.ts`; la debolezza (*durbalāḥ*) non ha una soglia nel
 * testo e non c'è.
 *
 * Il BPHS le nomina ma non le definisce, o non tutte: le definizioni vengono
 * da dove il testo le presuppone, e ognuna porta la sua fonte e la sua
 * lettura. Il motore le calcola come dati e non dice che cosa annullino: il
 * conto dei varga buoni resta quello che è (vedi `varga-buoni.ts`), e che una
 * avastha guasti i varga buoni il 6.53 non lo dice per nessuna in
 * particolare. Le scelte sono del proprietario, 29 ottobre 2026 (`TODO.md`,
 * *Deciso*).
 *
 * - **Combustione**: *Surya Siddhanta* IX.6-9 e X.1, trad. Burgess (JAOS 6,
 *   1860), pp. 367 e 370. Il testo misura in «gradi di tempo», l'ascensione
 *   obliqua all'orizzonte; il motore misura in longitudine, e lo dichiara.
 *   La tavola che Santhanam stampa in nota a BPHS 7.28-29 (vol. I, p. 100)
 *   non ha fonte e non coincide (Saturno 16): non è usata.
 * - **Guerra planetaria**: fra i soli cinque *tārāgraha* (SS VII.1), quando
 *   la distanza è sotto un grado (VII.19), che alla congiunzione è la
 *   differenza delle latitudini (VII.12). Vince Venere comunque, degli altri
 *   chi sta a nord: BPHS 79.9 (vol. II, p. 950) e SS VII.21 e 23. Le qualità
 *   osservative che SS VII.20-21 aggiunge (splendore, grandezza, colore)
 *   un'effemeride non le dà, e restano fuori.
 * - **Avastha *śayanādi***: BPHS 45.30-33 (vol. I, pp. 453-455) con la
 *   formula e le letture di Santhanam, che dà l'esempio svolto: il navamsa
 *   per l'*aṃśa*, la ghati in corso contata dall'alba, il resto zero come
 *   dodicesima. Lo stato secondario (45.34-37) vuole la prima sillaba del
 *   nome, che non è un dato di nascita, e non c'è.
 *
 * Le trascrizioni stanno in `texts/jyotisha/surya-siddhanta-burgess-1860`,
 * `bphs-santhanam-1992-vol1` e `-vol2`.
 */

import { grahaName, nakshatraOf } from './nakshatra.js';
import { normalize360 } from './math.js';
import { julianDayToISO } from './roots.js';
import type {
  BodyId,
  CelestialBody,
  CombustionState,
  GrahaStates,
  NatalChart,
  PlanetaryWar,
  ShayanadiAvastha,
  ShayanadiAvasthas,
} from './types.js';

const DEG = Math.PI / 180;

/**
 * I limiti del *Surya Siddhanta*, in gradi. Il secondo valore, dove c'è, vale
 * in moto retrogrado: IX.8 per Mercurio («according as he is retrograding or
 * rapidly advancing»); IX.7 per Venere, che tramonta a ovest e sorge a est a
 * otto gradi, cioè intorno alla congiunzione inferiore, dove è retrograda, e a
 * dieci intorno alla superiore.
 */
export const COMBUSTION_LIMITS: Readonly<Partial<Record<BodyId, { direct: number; retrograde?: number }>>> = {
  luna: { direct: 12 },
  marte: { direct: 17 },
  mercurio: { direct: 14, retrograde: 12 },
  giove: { direct: 11 },
  venere: { direct: 10, retrograde: 8 },
  saturno: { direct: 15 },
};

const COMBUSTION_SOURCE =
  'Surya Siddhanta IX.6-9 e X.1 (trad. Burgess, 1860, pp. 367, 370): Luna 12, Marte 17, ' +
  'Mercurio 14 (12 retrogrado), Giove 11, Venere 10 (8 retrograda), Saturno 15. Il testo li dà ' +
  'in gradi di tempo, l\'ascensione obliqua all\'orizzonte; qui sono applicati alla distanza ' +
  'in longitudine, che li approssima. Rahu e Ketu non sono nel testo.';

/** Distanza fra due longitudini, [0, 180]. */
function arco(a: number, b: number): number {
  const d = normalize360(a - b);
  return d > 180 ? 360 - d : d;
}

/** I graha vicini al Sole, uno per ciascuno dei sei del testo che la carta contiene. */
export function computeCombustion(bodies: readonly CelestialBody[]): CombustionState[] {
  const sole = bodies.find((body) => body.id === 'sole');
  if (!sole) return [];
  return bodies.flatMap((body) => {
    const limiti = COMBUSTION_LIMITS[body.id];
    if (!limiti) return [];
    const distance = arco(body.longitude, sole.longitude);
    const limit = body.retrograde && limiti.retrograde !== undefined ? limiti.retrograde : limiti.direct;
    return [
      {
        id: body.id,
        name: grahaName(body.id, body.name),
        distance,
        limit,
        retrograde: body.retrograde,
        combust: distance < limit,
      },
    ];
  });
}

/** I cinque *tārāgraha* di SS VII.1, i soli che fanno guerra. */
export const TARAGRAHAS = ['marte', 'mercurio', 'giove', 'venere', 'saturno'] as const satisfies readonly BodyId[];

const WAR_SOURCE =
  'Surya Siddhanta VII.1, 12, 19-23 (trad. Burgess, pp. 307-317) e BPHS 79.9 (trad. Santhanam, ' +
  'vol. II, p. 950): guerra fra due dei cinque tārāgraha a meno di un grado, che alla ' +
  'congiunzione è la differenza delle latitudini; vince Venere comunque, degli altri chi sta ' +
  'a nord. Splendore, grandezza e colore (SS VII.20-21) non si calcolano e restano fuori. ' +
  '«Within one degree» nella traduzione di 79.9 è di Santhanam; il grado è del Surya Siddhanta.';

/** Distanza angolare sulla sfera fra due punti in coordinate eclittiche, in gradi. */
function separazione(a: CelestialBody, b: CelestialBody): number {
  const coseno =
    Math.sin(a.latitude * DEG) * Math.sin(b.latitude * DEG) +
    Math.cos(a.latitude * DEG) * Math.cos(b.latitude * DEG) * Math.cos((a.longitude - b.longitude) * DEG);
  return Math.acos(Math.min(1, Math.max(-1, coseno))) / DEG;
}

/** Le coppie di *tārāgraha* in guerra, col vincitore. */
export function computeWars(bodies: readonly CelestialBody[]): PlanetaryWar[] {
  const tara = TARAGRAHAS.flatMap((id) => bodies.filter((body) => body.id === id));
  const guerre: PlanetaryWar[] = [];
  for (let i = 0; i < tara.length; i += 1) {
    for (let j = i + 1; j < tara.length; j += 1) {
      const a = tara[i] as CelestialBody;
      const b = tara[j] as CelestialBody;
      const separation = separazione(a, b);
      if (separation >= 1) continue;
      let victor: BodyId | null = null;
      let rule: string;
      if (a.id === 'venere' || b.id === 'venere') {
        victor = 'venere';
        rule = 'Vince Venere, a nord o a sud (BPHS 79.9, SS VII.23).';
      } else if (a.latitude !== b.latitude) {
        victor = a.latitude > b.latitude ? a.id : b.id;
        rule = 'Vince chi sta a nord, la latitudine maggiore (BPHS 79.9, SS VII.21).';
      } else {
        rule = 'Stessa latitudine: la regola del nord non decide.';
      }
      guerre.push({
        between: [a.id, b.id],
        separation,
        latitudes: [a.latitude, b.latitude],
        victor,
        defeated: victor === null ? null : victor === a.id ? b.id : a.id,
        rule,
      });
    }
  }
  return guerre;
}

/** BPHS 45.30-31, nell'ordine: il resto 1 è Sayana, lo zero Nidra. */
export const SHAYANADI_AVASTHAS: readonly ShayanadiAvastha[] = [
  'Sayana',
  'Upavesana',
  'Netrapani',
  'Prakasana',
  'Gamana',
  'Aagamana',
  'Sabha',
  'Agama',
  'Bhojana',
  'Nrityalipsa',
  'Kautuka',
  'Nidra',
];

/**
 * Il numero del graha nella formula: «Sun 1, Moon 2 etc.», «Mercury 4»
 * (Santhanam, pp. 454-455), cioè l'ordine dei giorni della settimana; Rahu e
 * Ketu ottavo e nono, perché la nota dice di farlo «for 9 planets».
 */
export const AVASTHA_GRAHA_NUMBER: Readonly<Partial<Record<BodyId, number>>> = {
  sole: 1,
  luna: 2,
  marte: 3,
  mercurio: 4,
  giove: 5,
  venere: 6,
  saturno: 7,
  'nodo-nord': 8,
  'nodo-sud': 9,
};

/**
 * L'avastha da sei numeri, la formula di Santhanam a p. 454:
 * (s × p × n + a + g + r) mod 12, con lo zero letto come dodici. Prende i
 * numeri e non la carta, perché l'esempio di p. 455 si possa rifare senza
 * effemeridi.
 */
export function shayanadiAvasthaOf(f: { s: number; p: number; n: number; a: number; g: number; r: number }): {
  total: number;
  index: number;
  avastha: ShayanadiAvastha;
} {
  const total = f.s * f.p * f.n + f.a + f.g + f.r;
  const index = total % 12 === 0 ? 12 : total % 12;
  return { total, index, avastha: SHAYANADI_AVASTHAS[index - 1] as ShayanadiAvastha };
}

const AVASTHA_SOURCE =
  'BPHS 45.30-33 (trad. Santhanam, vol. I, pp. 453-455): (s × p × n + a + g + r) mod 12, con s il ' +
  'nakshatra del graha, p il suo numero (Sole 1, Luna 2, Marte 3, Mercurio 4, Giove 5, Venere 6, ' +
  'Saturno 7, Rahu 8, Ketu 9), n il navamsa nel segno, a il nakshatra della Luna, g la ghati, r ' +
  'il lagna da Ariete. Letture di Santhanam: l\'aṃśa è il navamsa (dall\'esempio di Balabhadra, ' +
  'Hora Ratna); g è la ghati in corso contata dall\'alba (il verso dice yātadaṇḍa, le trascorse, ' +
  'che darebbero una in meno); il resto zero è la dodicesima. L\'alba è quella degli almanacchi, ' +
  'lembo superiore e rifrazione. Quali avastha guastino i varga buoni il 6.53 non lo dice.';

/**
 * Le avastha *śayanādi* dei nove graha, data l'alba (giorno giuliano UT)
 * che precede la nascita. `undefined` senza ora o senza lagna.
 */
export function computeAvasthas(chart: NatalChart, sunriseJulianDayUT: number): ShayanadiAvasthas | undefined {
  if (!chart.time.timeKnown || !chart.angles) return undefined;
  const luna = chart.bodies.find((body) => body.id === 'luna');
  if (!luna) return undefined;

  const ghatisSinceSunrise = (chart.time.julianDayUT - sunriseJulianDayUT) * 60;
  const ghati = Math.floor(ghatisSinceSunrise) + 1;
  const moonNakshatra = nakshatraOf(luna.longitude).index;
  const lagnaSign = Math.floor(normalize360(chart.angles.ascendant) / 30) + 1;

  const grahas = chart.bodies.flatMap((body) => {
    const p = AVASTHA_GRAHA_NUMBER[body.id];
    if (p === undefined) return [];
    const s = nakshatraOf(body.longitude).index;
    const n = Math.min(9, Math.floor(body.signDegree / (30 / 9)) + 1);
    return [
      {
        id: body.id,
        name: grahaName(body.id, body.name),
        factors: { s, p, n },
        ...shayanadiAvasthaOf({ s, p, n, a: moonNakshatra, g: ghati, r: lagnaSign }),
      },
    ];
  });

  return {
    source: AVASTHA_SOURCE,
    sunrise: julianDayToISO(sunriseJulianDayUT),
    ghatisSinceSunrise,
    ghati,
    moonNakshatra,
    lagnaSign,
    grahas,
  };
}

/**
 * Le tre condizioni insieme. L'alba la passa chi chiama (`computeJyotisha`),
 * perché vuole le effemeridi e il resto no; senza, le avastha mancano.
 */
export function computeGrahaStates(chart: NatalChart, sunriseJulianDayUT: number | null): GrahaStates {
  const avasthas = sunriseJulianDayUT === null ? undefined : computeAvasthas(chart, sunriseJulianDayUT);
  return {
    combustion: { source: COMBUSTION_SOURCE, grahas: computeCombustion(chart.bodies) },
    wars: { source: WAR_SOURCE, pairs: computeWars(chart.bodies) },
    ...(avasthas ? { avasthas } : {}),
  };
}
