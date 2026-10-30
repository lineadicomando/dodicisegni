/**
 * Le condizioni di un istante secondo Lilly, e il punteggio che le somma.
 *
 * Tutto viene da *Christian Astrology* (Londra 1647), letto sulla scansione
 * che sta in `texts/occidentale/lilly-christian-astrology-1647`, con le
 * trascrizioni in `trascrizioni.md`: le pagine sono accanto a ogni regola.
 * La tavola che dà i punti è a p. 115, «A ready Table whereby to examine the
 * Fortitudes and Debilities of the Planets»; il modo di usarla è l'esempio
 * svolto del cap. XXVIII, pp. 177-181, dove Lilly conta pianeta per pianeta
 * le fortezze e le debilità e poi sottrae le une dalle altre.
 *
 * È il pacchetto di Lilly, intero: le dignità essenziali sono le sue (la
 * tavola di p. 104, in `dignita-lilly.ts`), e così le soglie del Sole, il moto
 * medio, le stelle e i pesi. Non si applica ad altre tavole, perché quel conto
 * Lilly l'ha fatto solo sulle sue.
 *
 * Il motore non giudica: dice i punti che la tavola assegna e le tre somme,
 * mai che cosa significhino. «Is weak by Testimonies 8, and is therefore
 * unfortunate» (p. 180) è la seconda metà della frase di Lilly, e qui non c'è.
 */

import { fixedStarLongitude, type EphemerisContext } from './ephemeris.js';
import { houseOf } from './houses.js';
import { angularSeparation, arcForward, degreeInSign, normalize360, signedDifference, signOf } from './math.js';
import {
  LILLY_PLANETS,
  lillyDignitiesOf,
  lillyReceptionsOf,
  lillyTermRuler,
  type LillyPlanet,
} from './dignita-lilly.js';
import { LILLY_MOIETIES } from './orbite.js';
import { ZODIAC_SIGNS } from './constants.js';
import type {
  AspectId,
  BodyId,
  CelestialBody,
  House,
  LillyBodyConditions,
  LillyConditions,
  LillyFortuneConditions,
  LillyScoreRow,
  LillySolarState,
  LillyStar,
  PlanetaryHourAt,
  Sect,
  ZodiacSign,
} from './types.js';

/** La riga che viaggia col risultato. */
export const LILLY_CONDITIONS_SOURCE =
  'Lilly, Christian Astrology (1647): punti dalla tavola di p. 115, applicata come a pp. 177-181; ' +
  'casa con la regola dei cinque gradi (p. 33), moto medio dal libro I (pp. 57-80), ' +
  'Sole a p. 113, orientale e occidentale e assedio a p. 114, partile a p. 106, ' +
  'antiscion a p. 90, Ascendente e Via Combusta a p. 122; la Parte di Fortuna da p. 144 e la sua tavola a p. 145.';

/** Le letture fatte dove il testo lascia una scelta. Viaggiano col risultato. */
export const LILLY_CONDITIONS_READINGS: readonly string[] = [
  'Sotto i raggi entro 17° in qualunque segno, come dice p. 113; la combustione (8°30\') solo nello stesso segno. ' +
    "Nell'esempio di pp. 179-180 Lilly dà «Free from Combustion» a Mercurio e alla Luna, che la regola mette sotto i raggi.",
  'Ricezione mutua per domicilio o per esaltazione: conta come dignità («shall have Dignities», p. 115), e chi ce l\'ha non è peregrino.',
  'Veloce o lento confrontando il moto col segno con la media: un retrogrado è sempre lento, come il Saturno di p. 178.',
  'Assediato: fra Saturno e Marte nello stesso segno, come nell\'esempio di p. 114.',
  'Stelle in longitudine ed entro 5° tutte e tre: Algol per la tavola, Spica per l\'esempio di p. 179, Regolo come loro. ' +
    "A p. 179 Lilly scrive «within six degrees» per Venere, ma non conta Regolo alla Luna, che il motore mette a 5°40'.",
  'Parte di Fortuna (p. 145): congiunzione, aspetti e opposizione coi pianeti entro la metà dell\'orbita del pianeta (p. 107), ' +
    'perché la Parte un\'orbita sua non ce l\'ha; coi Nodi, che non ne hanno, partile.',
  'Parte di Fortuna: la casa con la regola dei cinque gradi e la riga «Not Combust, or under the ☉ Beams», come stampate. ' +
    'A p. 180 Lilly la mette in seconda a più di cinque gradi dalla cuspide e non le conta quella riga.',
  'Parte di Fortuna: combusta entro 8°30\' dal Sole nello stesso segno, cazimi compreso; sotto i raggi entro 17°, e lì non ' +
    'prende né l\'una né l\'altra riga; libera oltre.',
];

/**
 * Il moto medio dei sette, in gradi al giorno, dal capitolo di ciascuno nel
 * libro I. Il «31 degr. 27 min.» di Marte a p. 65 è un refuso per minuti e
 * secondi: lo corregge Lilly stesso a p. 178 («31 min. 27. seconds»).
 */
const MOTO_MEDIO: Readonly<Record<LillyPlanet, number>> = {
  saturno: dms(0, 2, 1), // p. 57
  giove: dms(0, 4, 59), // p. 61
  marte: dms(0, 31, 27), // p. 65, corretto a p. 178
  sole: dms(0, 59, 8), // p. 69
  venere: dms(0, 59, 8), // p. 72
  mercurio: dms(0, 59, 8), // p. 76
  luna: dms(13, 10, 36), // p. 80
};

/** Le soglie del Sole, p. 113. */
const CAZIMI = dms(0, 17, 0);
const COMBUSTIONE = dms(8, 30, 0);
const RAGGI = 17;

/** I punti della casa, p. 115. Il segno dice da che parte sta. */
export const LILLY_HOUSE_POINTS: Readonly<Record<number, number>> = {
  1: 5,
  10: 5,
  7: 4,
  4: 4,
  11: 4,
  2: 3,
  5: 3,
  9: 2,
  3: 1,
  12: -5,
  8: -2,
  6: -2,
};

/**
 * Le stelle della tavola: la sigla di Bayer nel catalogo di Swiss Ephemeris,
 * l'orbita e i punti. I gradi che Lilly stampa (24 del Leone, 18 della
 * Bilancia, 20 del Toro) sono le posizioni del 1647: la stella si muove con
 * la precessione, e la si calcola all'istante.
 */
const STELLE: Readonly<Record<LillyStar, { bayer: string; orb: number; points: number }>> = {
  regolo: { bayer: ',alLeo', orb: 5, points: 6 },
  spica: { bayer: ',alVir', orb: 5, points: 5 },
  algol: { bayer: ',bePer', orb: 5, points: -5 },
};

/**
 * La tavola della Parte di Fortuna, p. 145, voce per voce. È sua, non quella
 * dei pianeti: l'ottava e la sesta valgono 4 e non 2, Algol 4 e non 5.
 */
const FORTUNA_SEGNI: Readonly<Partial<Record<ZodiacSign, number>>> = {
  toro: 5,
  pesci: 5,
  bilancia: 4,
  sagittario: 4,
  leone: 4,
  cancro: 4,
  gemelli: 3,
  // La Vergine vale 2 «so it be in the Terms of ♃ or ♀»: vedi sotto.
  scorpione: -5,
  capricorno: -5,
  acquario: -5,
  // «In ♈ he neither gets or loses».
};
const FORTUNA_CASE: Readonly<Record<number, number>> = {
  1: 5,
  10: 5,
  7: 4,
  4: 4,
  11: 4,
  2: 3,
  5: 3,
  9: 2,
  3: 1,
  12: -5,
  8: -4,
  6: -4,
};
const FORTUNA_ASPETTI: readonly { with: BodyId; aspect: AspectId; points: number }[] = [
  { with: 'giove', aspect: 'congiunzione', points: 5 },
  { with: 'venere', aspect: 'congiunzione', points: 5 },
  { with: 'giove', aspect: 'trigono', points: 4 },
  { with: 'venere', aspect: 'trigono', points: 4 },
  { with: 'giove', aspect: 'sestile', points: 3 },
  { with: 'venere', aspect: 'sestile', points: 3 },
  { with: 'saturno', aspect: 'congiunzione', points: -5 },
  { with: 'marte', aspect: 'congiunzione', points: -5 },
  { with: 'saturno', aspect: 'opposizione', points: -4 },
  { with: 'marte', aspect: 'opposizione', points: -4 },
  { with: 'saturno', aspect: 'quadrato', points: -3 },
  { with: 'marte', aspect: 'quadrato', points: -3 },
];
const FORTUNA_NODI: readonly { with: BodyId; points: number }[] = [
  { with: 'nodo-nord', points: 3 },
  { with: 'nodo-sud', points: -3 },
];
const FORTUNA_STELLE: Readonly<Record<LillyStar, number>> = { regolo: 6, spica: 5, algol: -4 };
const ANGOLO: Readonly<Partial<Record<AspectId, number>>> = {
  congiunzione: 0,
  sestile: 60,
  quadrato: 90,
  trigono: 120,
  opposizione: 180,
};

/** I pianeti superiori, p. 113: orientali sono una fortezza. */
const SUPERIORI: readonly BodyId[] = ['saturno', 'giove', 'marte'];
/** Mercurio e Venere: orientali sono una debilità. */
const INFERIORI: readonly BodyId[] = ['venere', 'mercurio'];

const ASPETTO_PER_SEGNI: Readonly<Record<number, AspectId>> = {
  0: 'congiunzione',
  2: 'sestile',
  10: 'sestile',
  3: 'quadrato',
  9: 'quadrato',
  4: 'trigono',
  8: 'trigono',
  6: 'opposizione',
};

/** I contatti partili che la tavola conta, con chi e quanto. */
const PARTILI: readonly { with: BodyId; aspect: AspectId; points: number }[] = [
  { with: 'giove', aspect: 'congiunzione', points: 5 },
  { with: 'venere', aspect: 'congiunzione', points: 5 },
  { with: 'nodo-nord', aspect: 'congiunzione', points: 4 },
  { with: 'giove', aspect: 'trigono', points: 4 },
  { with: 'venere', aspect: 'trigono', points: 4 },
  { with: 'giove', aspect: 'sestile', points: 3 },
  { with: 'venere', aspect: 'sestile', points: 3 },
  { with: 'saturno', aspect: 'congiunzione', points: -5 },
  { with: 'marte', aspect: 'congiunzione', points: -5 },
  { with: 'nodo-sud', aspect: 'congiunzione', points: -4 },
  { with: 'saturno', aspect: 'opposizione', points: -4 },
  { with: 'marte', aspect: 'opposizione', points: -4 },
  { with: 'saturno', aspect: 'quadrato', points: -3 },
  { with: 'marte', aspect: 'quadrato', points: -3 },
];

export interface LillyConditionsInput {
  /** I corpi del tema: servono i sette, e i Nodi per i contatti partili. */
  bodies: readonly CelestialBody[];
  /** Le cuspidi; vuote senza l'ora. */
  houses: readonly House[];
  ascendant?: number;
  sect?: Sect;
  /** Le longitudini delle stelle, o il motivo per cui mancano. */
  stars: { longitudes: Record<LillyStar, number> } | { missing: string };
  hour?: PlanetaryHourAt | null;
}

/**
 * Le condizioni di un istante e il punteggio dei sette pianeti.
 *
 * Il fallimento è parziale, come nel resto del motore: senza le case mancano
 * le righe della casa, senza il catalogo quelle delle stelle, senza i Nodi i
 * contatti partili con loro, e `missing` lo dice. Il resto del conto c'è.
 */
export function computeLillyConditions(input: LillyConditionsInput): LillyConditions {
  const { bodies, houses, sect } = input;
  const missing: string[] = [];
  const corpo = (id: BodyId): CelestialBody | undefined => bodies.find((body) => body.id === id);

  const conCase = houses.length > 0;
  if (!conCase) missing.push("casa: senza l'ora le case non ci sono");
  const stelle = 'longitudes' in input.stars ? input.stars.longitudes : undefined;
  if ('missing' in input.stars) missing.push(`stelle (Regolo, Spica, Algol): ${input.stars.missing}`);

  // Il Nodo Sud è sempre opposto al Nord: se il tema ne porta uno basta.
  const nord = corpo('nodo-nord')?.longitude ?? (corpo('nodo-sud') ? normalize360(corpo('nodo-sud')!.longitude + 180) : undefined);
  const nodi: Partial<Record<BodyId, number>> = {};
  if (nord === undefined) {
    missing.push('contatti partili coi Nodi: i Nodi non sono fra i corpi calcolati');
  } else {
    nodi['nodo-nord'] = nord;
    nodi['nodo-sud'] = normalize360(nord + 180);
  }

  const sole = corpo('sole');
  if (!sole) missing.push('Sole: senza, mancano combustione, orientalità e fase della Luna');

  const sette = LILLY_PLANETS.map((id) => corpo(id)).filter((body): body is CelestialBody => body !== undefined);
  const mutue = lillyReceptionsOf(sette, sect).mutual;
  const saturno = corpo('saturno');
  const marte = corpo('marte');

  const conditions: LillyBodyConditions[] = sette.map((body) => {
    const id = body.id as LillyPlanet;
    const fortitudes: LillyScoreRow[] = [];
    const debilities: LillyScoreRow[] = [];
    const conta = (row: LillyScoreRow): void => {
      if (row.points > 0) fortitudes.push(row);
      else debilities.push({ ...row, points: -row.points });
    };

    // Le dignità essenziali, dalla tavola di p. 104.
    const dignita = lillyDignitiesOf(id, body.longitude, sect);
    const punti = { domicilio: 5, esaltazione: 4, triplicita: 3, termine: 2, faccia: 1, esilio: -5, caduta: -4 } as const;
    for (const voce of dignita) conta({ item: voce, points: punti[voce] });

    // Le ricezioni mutue che p. 115 conta come dignità.
    let ricevuto = false;
    for (const mutua of mutue) {
      const indice = mutua.bodies.indexOf(id);
      if (indice < 0) continue;
      const altro = mutua.bodies[1 - indice]!;
      for (const per of ['domicilio', 'esaltazione'] as const) {
        if (mutua.firstReceives.includes(per) && mutua.secondReceives.includes(per)) {
          conta({ item: per === 'domicilio' ? 'ricezione-domicilio' : 'ricezione-esaltazione', points: per === 'domicilio' ? 5 : 4, with: altro });
          ricevuto = true;
        }
      }
    }
    const essenziali = ['domicilio', 'esaltazione', 'triplicita', 'termine', 'faccia'] as const;
    const peregrine = !essenziali.some((voce) => dignita.includes(voce)) && !ricevuto;
    if (peregrine) conta({ item: 'peregrino', points: -5 });

    // La casa, con la regola dei cinque gradi.
    const house = conCase ? lillyHouse(body.longitude, houses) : undefined;
    if (house !== undefined) conta({ item: 'casa', house, points: LILLY_HOUSE_POINTS[house] ?? 0 });

    // Il moto. Il Sole e la Luna non sono mai retrogradi, e per loro la riga
    // del diretto «is voyd» (p. 115).
    const luminare = id === 'sole' || id === 'luna';
    const direction = body.speed < 0 ? 'retrogrado' : 'diretto';
    if (!luminare) conta(direction === 'diretto' ? { item: 'diretto', points: 4 } : { item: 'retrogrado', points: -5 });
    const mean = MOTO_MEDIO[id];
    const pace = body.speed > mean ? 'veloce' : body.speed < mean ? 'lento' : 'medio';
    if (pace === 'veloce') conta({ item: 'veloce', points: 2 });
    if (pace === 'lento') conta({ item: 'lento', points: -2 });

    // Il Sole: fase e combustione.
    let phase: LillyBodyConditions['phase'];
    let solare: LillyBodyConditions['sun'];
    if (sole && id !== 'sole') {
      // Dietro il Sole nello zodiaco vuol dire sorgere prima di lui: orientale.
      const scarto = signedDifference(body.longitude, sole.longitude);
      if (scarto !== 0) phase = scarto < 0 ? 'orientale' : 'occidentale';
      if (phase && SUPERIORI.includes(id)) conta({ item: phase, points: phase === 'orientale' ? 2 : -2 });
      if (phase && INFERIORI.includes(id)) conta({ item: phase, points: phase === 'occidentale' ? 2 : -2 });
      if (phase && id === 'luna') conta(phase === 'occidentale' ? { item: 'crescente', points: 2 } : { item: 'calante', points: -2 });

      const distance = angularSeparation(body.longitude, sole.longitude);
      const state = solarState(distance, body.sign === sole.sign);
      solare = { distance, state };
      const puntiSole: Record<LillySolarState, number> = { cazimi: 5, libero: 5, combusto: -5, 'sotto-i-raggi': -4 };
      conta({ item: state, points: puntiSole[state] });
    }

    // I contatti partili: lo stesso grado intero, in segni che fanno l'aspetto.
    for (const regola of PARTILI) {
      if (regola.with === id) continue;
      const altro = regola.with in nodi ? nodi[regola.with] : corpo(regola.with)?.longitude;
      if (altro === undefined) continue;
      if (partileAspect(body.longitude, altro) === regola.aspect) {
        conta({ item: 'partile', aspect: regola.aspect, with: regola.with, points: regola.points });
      }
    }

    const besieged =
      saturno !== undefined &&
      marte !== undefined &&
      id !== 'saturno' &&
      id !== 'marte' &&
      body.sign === saturno.sign &&
      body.sign === marte.sign &&
      Math.min(saturno.longitude, marte.longitude) < body.longitude &&
      body.longitude < Math.max(saturno.longitude, marte.longitude);
    if (besieged) conta({ item: 'assediato', points: -5 });

    if (stelle) {
      for (const star of Object.keys(STELLE) as LillyStar[]) {
        const { orb, points } = STELLE[star];
        if (angularSeparation(body.longitude, stelle[star]) <= orb) conta({ item: 'stella', star, points });
      }
    }

    const somma = (rows: readonly LillyScoreRow[]): number => rows.reduce((totale, row) => totale + row.points, 0);
    const totals = { fortitudes: somma(fortitudes), debilities: somma(debilities), net: 0 };
    totals.net = totals.fortitudes - totals.debilities;
    const antiscion = normalize360(180 - body.longitude);

    const risultato: LillyBodyConditions = {
      id,
      name: body.name,
      motion: { speed: body.speed, mean, pace, direction },
      peregrine,
      besieged,
      antiscion,
      contrantiscion: normalize360(antiscion + 180),
      score: { fortitudes, debilities, totals },
    };
    if (house !== undefined) {
      risultato.house = house;
      risultato.angularity = [1, 4, 7, 10].includes(house) ? 'angolare' : [2, 5, 8, 11].includes(house) ? 'succedente' : 'cadente';
    }
    if (solare) risultato.sun = solare;
    if (phase) risultato.phase = phase;
    return risultato;
  });

  const result: LillyConditions = {
    source: LILLY_CONDITIONS_SOURCE,
    readings: [...LILLY_CONDITIONS_READINGS],
    missing,
    bodies: conditions,
  };
  if (input.hour) result.hour = input.hour;
  if (input.hour === null) missing.push('ora planetaria: qui il Sole non sorge o non tramonta, e le ore non ci sono');
  if (input.ascendant !== undefined && conCase) {
    const signDegree = degreeInSign(input.ascendant);
    result.ascendant = { signDegree, early: signDegree < 3, late: signDegree >= 27 };
  }
  const luna = corpo('luna');
  if (luna) result.moonInViaCombusta = luna.longitude >= 195 && luna.longitude < 225;
  if (input.ascendant !== undefined && conCase && sole && luna) {
    result.partOfFortune = fortunaDiLilly(normalize360(input.ascendant + luna.longitude - sole.longitude), {
      houses,
      sole: sole.longitude,
      corpi: (id) => (id in nodi ? nodi[id] : corpo(id)?.longitude),
      stelle,
    });
  } else if (input.ascendant === undefined || !conCase) {
    missing.push("Parte di Fortuna: senza l'ora l'Ascendente e le case non ci sono");
  }
  if (stelle) result.stars = stelle;
  return result;
}

/**
 * La Parte di Fortuna nel conto di p. 145. Le letture sono in
 * `LILLY_CONDITIONS_READINGS`.
 */
function fortunaDiLilly(
  longitude: number,
  input: {
    houses: readonly House[];
    sole: number;
    corpi: (id: BodyId) => number | undefined;
    stelle: Record<LillyStar, number> | undefined;
  },
): LillyFortuneConditions {
  const fortitudes: LillyScoreRow[] = [];
  const debilities: LillyScoreRow[] = [];
  const conta = (row: LillyScoreRow): void => {
    if (row.points > 0) fortitudes.push(row);
    else if (row.points < 0) debilities.push({ ...row, points: -row.points });
  };
  const sign = signOf(longitude);

  const puntiSegno = FORTUNA_SEGNI[sign];
  if (puntiSegno !== undefined) conta({ item: 'segno', sign, points: puntiSegno });
  const termine = lillyTermRuler(longitude);
  if (sign === 'vergine' && (termine === 'giove' || termine === 'venere')) {
    conta({ item: 'segno', sign, points: 2, with: termine });
  }
  if (termine === 'saturno' || termine === 'marte') conta({ item: 'termine', with: termine, points: -2 });

  const house = lillyHouse(longitude, input.houses)!;
  conta({ item: 'casa', house, points: FORTUNA_CASE[house] ?? 0 });

  for (const regola of FORTUNA_ASPETTI) {
    const altro = input.corpi(regola.with);
    if (altro === undefined) continue;
    const scarto = Math.abs(angularSeparation(longitude, altro) - ANGOLO[regola.aspect]!);
    if (scarto <= LILLY_MOIETIES[regola.with]!) {
      conta({ item: 'aspetto', aspect: regola.aspect, with: regola.with, points: regola.points });
    }
  }
  for (const regola of FORTUNA_NODI) {
    const nodo = input.corpi(regola.with);
    if (nodo !== undefined && partileAspect(longitude, nodo) === 'congiunzione') {
      conta({ item: 'partile', aspect: 'congiunzione', with: regola.with, points: regola.points });
    }
  }

  if (input.stelle) {
    for (const star of Object.keys(FORTUNA_STELLE) as LillyStar[]) {
      if (angularSeparation(longitude, input.stelle[star]) <= STELLE[star].orb) {
        conta({ item: 'stella', star, points: FORTUNA_STELLE[star] });
      }
    }
  }

  const distance = angularSeparation(longitude, input.sole);
  const state = solarState(distance, sign === signOf(input.sole));
  if (state === 'combusto' || state === 'cazimi') conta({ item: 'combusto', points: -5 });
  if (state === 'libero') conta({ item: 'libero', points: 5 });

  const somma = (rows: readonly LillyScoreRow[]): number => rows.reduce((totale, row) => totale + row.points, 0);
  const totals = { fortitudes: somma(fortitudes), debilities: somma(debilities), net: 0 };
  totals.net = totals.fortitudes - totals.debilities;
  return { longitude, sign, house, sun: { distance, state }, score: { fortitudes, debilities, totals } };
}

/** Le longitudini delle tre stelle all'istante, o il motivo per cui mancano. */
export function lillyStarsAt(julianDayUT: number, context: EphemerisContext): LillyConditionsInput['stars'] {
  const longitudes = {} as Record<LillyStar, number>;
  for (const star of Object.keys(STELLE) as LillyStar[]) {
    const longitude = fixedStarLongitude(julianDayUT, STELLE[star].bayer, context);
    if (typeof longitude === 'string') return { missing: longitude };
    longitudes[star] = longitude;
  }
  return { longitudes };
}

/**
 * La casa secondo la regola di p. 33: «if he be within five degrees of the
 * Cusp of any house, his vertue shall be assigned to that house to whose Cusp
 * he is neerest». Conta solo la cuspide che viene dopo: quella della casa in
 * cui il pianeta sta è già sua.
 */
export function lillyHouse(longitude: number, houses: readonly House[]): number | undefined {
  const own = houseOf(longitude, houses);
  if (own === undefined) return undefined;
  const cuspide = (number: number): number | undefined => houses.find((house) => house.number === number)?.longitude;
  const next = (own % 12) + 1;
  const inizio = cuspide(own);
  const fine = cuspide(next);
  if (inizio === undefined || fine === undefined) return own;
  const versoFine = arcForward(longitude, fine);
  return versoFine <= 5 && versoFine < arcForward(inizio, longitude) ? next : own;
}

/**
 * Lo stato rispetto al Sole, p. 113. La combustione chiede lo stesso segno.
 * La soglia è quella stampata, 8°30', la metà dell'orbita del Sole («I allow
 * the moyity of his owne Orbs»); il secondo esempio della pagina (Giove a 28
 * dell'Ariete, il Sole a 18) la supera, e non la cambia.
 */
function solarState(distance: number, sameSign: boolean): LillySolarState {
  if (distance <= CAZIMI) return 'cazimi';
  if (sameSign && distance <= COMBUSTIONE) return 'combusto';
  if (distance <= RAGGI) return 'sotto-i-raggi';
  return 'libero';
}

/** L'aspetto partile fra due longitudini, p. 106: lo stesso grado intero. */
export function partileAspect(a: number, b: number): AspectId | undefined {
  if (Math.floor(degreeInSign(a)) !== Math.floor(degreeInSign(b))) return undefined;
  const distanza = (ZODIAC_SIGNS.indexOf(signOf(b)) - ZODIAC_SIGNS.indexOf(signOf(a)) + 12) % 12;
  return ASPETTO_PER_SEGNI[distanza];
}

function dms(degrees: number, minutes: number, seconds: number): number {
  return degrees + minutes / 60 + seconds / 3600;
}
