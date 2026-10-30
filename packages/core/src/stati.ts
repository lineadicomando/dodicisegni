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
 * particolare. Le scelte sono del proprietario, 29 ottobre 2026
 * (`docs/decisioni.md`).
 *
 * - **Combustione**: *Surya Siddhanta* IX.6-9 e X.1, trad. Burgess (JAOS 6,
 *   1860), pp. 367 e 370, coi limiti in «gradi di tempo» (*kālāṃśa*), che
 *   IX.4-5 (pp. 365-366) definisce: la differenza di ascensione obliqua fra
 *   il Sole e il pianeta all'orizzonte del luogo, col pianeta alla sua
 *   latitudine (VII.8). Il motore calcola quella quantità con la geometria
 *   esatta e non con le approssimazioni del testo (seni indiani, tavola
 *   delle ascensioni di III.42-45), e lo dichiara; dove il calcolo non c'è,
 *   oltre i circoli polari, decide la longitudine. Scelto dal proprietario il
 *   30 ottobre 2026, al posto della sola longitudine. La tavola che
 *   Santhanam stampa in nota a BPHS 7.28-29 (vol. I, p. 100) non ha fonte e
 *   non coincide (Saturno 16): non è usata.
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
  'Mercurio 14 (12 retrogrado), Giove 11, Venere 10 (8 retrograda), Saturno 15, in gradi di ' +
  'tempo (kālāṃśa). Come IX.2-5 (pp. 365-366): se il pianeta è indietro rispetto al Sole in ' +
  'longitudine si confrontano le levate all\'orizzonte est, altrimenti i tramonti all\'ovest, ' +
  'e la distanza è la differenza di ascensione (o discensione) obliqua alla latitudine del ' +
  'luogo, col pianeta alla sua latitudine eclittica. Calcolata con la geometria esatta, ' +
  'obliquità media IAU 1980, e non con le regole approssimate del testo. Oltre i circoli ' +
  'polari, dove un corpo può non sorgere, decide la distanza in longitudine. Rahu e Ketu non ' +
  'sono nel testo.';

/** Dove e quando: quanto serve per passare dall'eclittica all'orizzonte. */
export interface CombustionPlace {
  /** Latitudine geografica del luogo, gradi, positiva a nord. */
  latitude: number;
  julianDayUT: number;
  /** L'ayanamsa da aggiungere alle longitudini siderali; 0 se sono tropicali. */
  ayanamsa: number;
}

/**
 * La distanza in gradi di tempo fra il Sole e un corpo, e l'orizzonte a cui
 * si misura; `undefined` dove uno dei due non sorge o non tramonta.
 *
 * Ascensione retta α e declinazione δ dalla longitudine tropicale e dalla
 * latitudine eclittica; la differenza ascensionale è asin(tan φ tan δ).
 * A est conta il momento della levata, α − differenza (ascensione obliqua);
 * a ovest quello del tramonto, α + differenza (discensione obliqua).
 */
export function timeDegreesFromSun(
  sole: Pick<CelestialBody, 'longitude' | 'latitude'>,
  corpo: Pick<CelestialBody, 'longitude' | 'latitude'>,
  luogo: CombustionPlace,
): { timeDegrees: number; horizon: 'est' | 'ovest' } | undefined {
  const secoli = (luogo.julianDayUT - 2451545) / 36525;
  const eps = (23.439291 - 0.0130042 * secoli) * DEG;
  const tanPhi = Math.tan(luogo.latitude * DEG);
  // IX.2-3: chi è indietro in longitudine si vede (o sparisce) a est, all'alba.
  const horizon = normalize360(sole.longitude - corpo.longitude) < 180 ? 'est' : 'ovest';
  const momento = (b: Pick<CelestialBody, 'longitude' | 'latitude'>): number | undefined => {
    const lambda = (b.longitude + luogo.ayanamsa) * DEG;
    const beta = b.latitude * DEG;
    const delta = Math.asin(Math.sin(beta) * Math.cos(eps) + Math.cos(beta) * Math.sin(eps) * Math.sin(lambda));
    const alpha = Math.atan2(Math.sin(lambda) * Math.cos(eps) - Math.tan(beta) * Math.sin(eps), Math.cos(lambda)) / DEG;
    const seno = tanPhi * Math.tan(delta);
    if (Math.abs(seno) > 1) return undefined;
    const differenza = Math.asin(seno) / DEG;
    return horizon === 'est' ? alpha - differenza : alpha + differenza;
  };
  const s = momento(sole);
  const c = momento(corpo);
  if (s === undefined || c === undefined) return undefined;
  return { timeDegrees: arco(s, c), horizon };
}

/** Distanza fra due longitudini, [0, 180]. */
function arco(a: number, b: number): number {
  const d = normalize360(a - b);
  return d > 180 ? 360 - d : d;
}

/**
 * I graha vicini al Sole, uno per ciascuno dei sei del testo che la carta
 * contiene. Col luogo decidono i gradi di tempo; senza, o dove non ci sono,
 * la longitudine, e `measure` dice quale.
 */
export function computeCombustion(bodies: readonly CelestialBody[], luogo?: CombustionPlace): CombustionState[] {
  const sole = bodies.find((body) => body.id === 'sole');
  if (!sole) return [];
  return bodies.flatMap((body) => {
    const limiti = COMBUSTION_LIMITS[body.id];
    if (!limiti) return [];
    const distance = arco(body.longitude, sole.longitude);
    const limit = body.retrograde && limiti.retrograde !== undefined ? limiti.retrograde : limiti.direct;
    const tempo = luogo ? timeDegreesFromSun(sole, body, luogo) : undefined;
    return [
      {
        id: body.id,
        name: grahaName(body.id, body.name),
        distance,
        ...(tempo ?? {}),
        measure: tempo ? 'gradi-di-tempo' : 'longitudine',
        limit,
        retrograde: body.retrograde,
        combust: (tempo?.timeDegrees ?? distance) < limit,
      },
    ];
  });
}

/** Il luogo e l'istante di una carta, per la combustione. */
export function combustionPlace(chart: NatalChart): CombustionPlace {
  return {
    latitude: chart.input.latitude,
    julianDayUT: chart.time.julianDayUT,
    ayanamsa: chart.ayanamsa?.degrees ?? 0,
  };
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
    combustion: { source: COMBUSTION_SOURCE, grahas: computeCombustion(chart.bodies, combustionPlace(chart)) },
    wars: { source: WAR_SOURCE, pairs: computeWars(chart.bodies) },
    ...(avasthas ? { avasthas } : {}),
  };
}
