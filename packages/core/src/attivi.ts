/**
 * Che cosa è in orbita in un arco di tempo.
 *
 * `findTransitPassages` risponde a *quando* un aspetto si perfeziona; questo a
 * *che cosa* è attivo fra due date, che è la domanda di chi legge un periodo.
 * Le due non coincidono: un transito di Saturno in orbita da maggio a
 * settembre, esatto a giugno e ad agosto, in un arco di luglio non ha nessun
 * passaggio ed è attivo per tutto il mese; e un corpo che si ferma a due gradi
 * e mezzo da un punto natale e torna indietro non si perfeziona mai, ma resta
 * in orbita per mesi.
 *
 * Il metodo è quello di `roots.ts`, con una funzione in più: oltre agli zeri
 * dello scarto dall'esatto, che sono le perfezioni, si cercano quelli di
 * `|scarto| − orbita`, che sono i bordi. I primi si trovano dai secondi, non
 * il contrario: è quel che lascia vedere i transiti senza perfezione.
 *
 * Nessun peso fra un transito e l'altro: vedi `ActiveTransit`.
 */

import { DEFAULT_PASSAGE_BODIES } from './constants.js';
import { aspectsOf } from './aspects.js';
import { orbConventionInfo, transitOrbConvention } from './orbite.js';
import type { AspectDefinition } from './constants.js';
import { zodiacContext } from './ayanamsa.js';
import { initEphemeris, type EphemerisContext } from './ephemeris.js';
import { signedDifference } from './math.js';
import {
  atTime,
  bodyAt,
  sampleLongitudes,
  transitOrbLimit,
  type Sample,
} from './passages.js';
import {
  MAX_WINDOW_DAYS,
  PRECISION_DAYS,
  WIDEST_ORB,
  bisect,
  julianDayToISO,
  meanDailyMotion,
  resolveRange,
  signedAngles,
} from './roots.js';
import { natalTargets } from './transits.js';
import type {
  ActiveTransit,
  BodyId,
  NatalChart,
  NatalPointId,
  OrbConventionInfo,
  PassageOptions,
  PassageRange,
} from './types.js';

/** Un transito trovato, con quel che serve a ordinarlo e a sapere se allargare. */
interface Found {
  /** L'istante da cui è attivo dentro l'arco: ordina il risultato. */
  from: number;
  transit: ActiveTransit;
  /** Il tratto arriva al primo o all'ultimo campione: il bordo sta più in là. */
  openBefore: boolean;
  openAfter: boolean;
}

/**
 * Trova i transiti in orbita in qualche momento dell'arco dato.
 *
 * Gli stessi corpi, punti natali, aspetti e orbite di `findTransitPassages`,
 * con le stesse opzioni: chi passa dall'una all'altra domanda non deve
 * trovare due elenchi costruiti con regole diverse.
 */
export function findActiveTransits(
  natal: NatalChart,
  range: PassageRange,
  options: PassageOptions = {},
): { transits: ActiveTransit[]; warnings: string[]; orbConvention: OrbConventionInfo } {
  const convention = transitOrbConvention(options.orbConvention);
  // Come nei transiti: lo zodiaco è quello del tema bersagliato.
  const context = zodiacContext(initEphemeris(options.ephemerisPath), {
    zodiac: natal.zodiac,
    ...(natal.ayanamsa ? { ayanamsa: natal.ayanamsa.id } : {}),
  });
  const warnings: string[] = [...context.warnings];

  const { start, end } = resolveRange(range);

  const definitions = aspectsOf(convention, options.minorAspects ?? false);
  const targets = natalTargets(natal, options.targets, warnings);
  const bodies = options.bodies ?? DEFAULT_PASSAGE_BODIES;

  const found: Found[] = [];

  for (const bodyId of bodies) {
    // Il margine oltre l'arco serve a trovare i bordi dei tratti che lo
    // attraversano. Si parte da quello dei passaggi, il tempo per
    // attraversare l'orbita più larga al moto medio, e lo si allarga solo se
    // un tratto arriva al primo o all'ultimo campione: vicino a una stazione
    // un corpo lento resta in orbita molto più a lungo. Il tetto è quello
    // delle finestre, tre anni.
    let margin = Math.min(MAX_WINDOW_DAYS, WIDEST_ORB / meanDailyMotion(bodyId));
    for (;;) {
      const samples = sampleLongitudes(
        bodyId, start - margin, end + margin, context, warnings, 'transiti attivi non cercati',
      );
      if (samples.length < 2) break;

      const forBody: Found[] = [];
      for (const target of targets) {
        for (const definition of definitions) {
          for (const angle of signedAngles(definition.angle)) {
            forBody.push(
              ...activeOf(bodyId, target, definition, angle, samples, context, start, end, range, options),
            );
          }
        }
      }

      const open = forBody.some((f) => f.openBefore || f.openAfter);
      if (!open || margin >= MAX_WINDOW_DAYS) {
        found.push(...forBody);
        break;
      }
      margin = Math.min(MAX_WINDOW_DAYS, margin * 4);
    }
  }

  found.sort((a, b) => a.from - b.from);
  return {
    transits: found.map((f) => f.transit),
    warnings,
    orbConvention: orbConventionInfo(convention, options.orbs),
  };
}

/**
 * I tratti in orbita di un aspetto solo, con un angolo firmato solo, che
 * toccano l'arco.
 *
 * Un tratto è una corsa di campioni in orbita, delimitata da un campione
 * fuori per parte. Ce n'è anche uno che non contiene nessun campione: un
 * corpo veloce con un'orbita stretta può attraversarla tutta fra due
 * campioni, e lo si riconosce dal cambio di segno dello scarto, cioè da una
 * perfezione.
 */
function activeOf(
  bodyId: BodyId,
  target: { id: NatalPointId; longitude: number },
  definition: AspectDefinition,
  signedAngle: number,
  samples: readonly Sample[],
  context: EphemerisContext,
  start: number,
  end: number,
  range: PassageRange,
  options: PassageOptions,
): Found[] {
  const gap = (longitude: number): number =>
    signedDifference(signedDifference(longitude, target.longitude), signedAngle);
  const orbLimit = transitOrbLimit(bodyId, target.id, definition, options);
  const distance = atTime(bodyId, (l) => Math.abs(gap(l)), context);
  const edge = atTime(bodyId, (l) => Math.abs(gap(l)) - orbLimit, context);

  const n = samples.length;
  const g = samples.map((sample) => gap(sample.longitude));
  const inside = (k: number): boolean => Math.abs(g[k]!) <= orbLimit;
  // Lo stesso criterio di `passagesOf`: un salto ampio è il giro che si
  // richiude a 180° dall'aspetto, non una perfezione.
  const perfectsBefore = (k: number): boolean =>
    Math.abs(g[k]! - g[k - 1]!) <= 90 && g[k - 1] !== 0 && g[k - 1]! * g[k]! <= 0;

  // `lo` e `hi` sono i campioni fuori orbita ai due lati; -1 e `n` quando il
  // tratto arriva al bordo dei campioni.
  const tratti: { lo: number; hi: number }[] = [];
  for (let k = 0; k < n; ) {
    if (inside(k)) {
      const lo = k - 1;
      while (k < n && inside(k)) k += 1;
      tratti.push({ lo, hi: k });
    } else {
      if (k > 0 && !inside(k - 1) && perfectsBefore(k)) tratti.push({ lo: k - 1, hi: k });
      k += 1;
    }
  }

  const found: Found[] = [];
  for (const { lo, hi } of tratti) {
    // Prima a grana grossa, sui campioni: i bordi si affinano solo per i
    // tratti che possono toccare l'arco, che sono pochi fra le centinaia del
    // margine.
    const roughStart = lo >= 0 ? samples[lo]!.julianDay : -Infinity;
    const roughEnd = hi < n ? samples[hi]!.julianDay : Infinity;
    if (roughEnd < start || roughStart > end) continue;

    // Le perfezioni del tratto, anche fuori dall'arco: servono a trovare i
    // bordi di un tratto senza campioni dentro.
    const exacts: number[] = [];
    for (let m = Math.max(lo + 1, 1); m <= Math.min(hi, n - 1); m += 1) {
      if (!perfectsBefore(m)) continue;
      const exact = bisect(
        samples[m - 1]!.julianDay,
        samples[m]!.julianDay,
        atTime(bodyId, gap, context),
      );
      if (exact !== null) exacts.push(exact);
    }

    const empty = hi - lo === 1;
    if (empty && exacts.length === 0) continue;
    const firstIn = empty ? exacts[0]! : samples[lo + 1]!.julianDay;
    const lastIn = empty ? exacts[0]! : samples[hi - 1]!.julianDay;

    const enters = lo >= 0 ? bisect(samples[lo]!.julianDay, firstIn, edge) : -Infinity;
    const leaves = hi < n ? bisect(lastIn, samples[hi]!.julianDay, edge) : Infinity;
    if (enters === null || leaves === null) continue;
    if (leaves < start || enters > end) continue;

    const from = Math.max(enters, start);
    const to = Math.min(leaves, end);

    const perfections: ActiveTransit['perfections'] = [];
    for (const exact of exacts) {
      if (exact < start || exact > end) continue;
      const body = bodyAt(bodyId, exact, context);
      if (!body) continue;
      perfections.push({
        exact: julianDayToISO(exact),
        local: julianDayToISO(exact, range.timezone),
        retrograde: body.speed < 0,
      });
    }

    const transit: ActiveTransit = {
      transiting: bodyId,
      natal: target.id,
      aspect: definition.id,
      angle: definition.angle,
      orb: orbLimit,
      throughout: enters < start && leaves > end,
      perfections,
    };
    if (Number.isFinite(enters)) transit.enters = julianDayToISO(enters, range.timezone);
    if (Number.isFinite(leaves)) transit.leaves = julianDayToISO(leaves, range.timezone);

    if (enters <= start) {
      const orb = distance(start);
      if (orb !== null) transit.orbAtFrom = orb;
    }
    if (leaves >= end) {
      const orb = distance(end);
      if (orb !== null) transit.orbAtTo = orb;
    }

    if (perfections.length === 0) {
      const closest = closestApproach(samples, g, lo, hi, from, to, distance);
      if (closest) {
        transit.closest = {
          orb: closest.orb,
          local: julianDayToISO(closest.julianDay, range.timezone),
        };
      }
    }

    found.push({
      from,
      transit,
      openBefore: lo < 0,
      openAfter: hi >= n,
    });
  }

  return found;
}

/**
 * Il punto del tratto più vicino all'esatto, fra `from` e `to`.
 *
 * I candidati sono i due estremi e i minimi locali dello scarto fra i
 * campioni, ciascuno affinato sui due campioni vicini: è lì che sta la
 * stazione di un corpo che si avvicina, si ferma e torna indietro.
 */
function closestApproach(
  samples: readonly Sample[],
  g: readonly number[],
  lo: number,
  hi: number,
  from: number,
  to: number,
  distance: (julianDay: number) => number | null,
): { julianDay: number; orb: number } | null {
  let best: { julianDay: number; orb: number } | null = null;
  const consider = (julianDay: number): void => {
    const orb = distance(julianDay);
    if (orb !== null && (best === null || orb < best.orb)) best = { julianDay, orb };
  };

  consider(from);
  consider(to);

  for (let m = Math.max(lo + 1, 1); m < Math.min(hi, samples.length - 1); m += 1) {
    const here = Math.abs(g[m]!);
    if (here > Math.abs(g[m - 1]!) || here > Math.abs(g[m + 1]!)) continue;
    const a = Math.max(from, samples[m - 1]!.julianDay);
    const b = Math.min(to, samples[m + 1]!.julianDay);
    if (a >= b) continue;
    const minimum = goldenSection(a, b, distance);
    if (minimum !== null) consider(minimum);
  }

  return best;
}

/** Il minimo di una funzione unimodale in [a, b], al minuto. */
function goldenSection(
  a: number,
  b: number,
  f: (julianDay: number) => number | null,
): number | null {
  const ratio = (Math.sqrt(5) - 1) / 2;
  let lo = a;
  let hi = b;
  while (hi - lo > PRECISION_DAYS) {
    const left = hi - ratio * (hi - lo);
    const right = lo + ratio * (hi - lo);
    const fLeft = f(left);
    const fRight = f(right);
    if (fLeft === null || fRight === null) return null;
    if (fLeft <= fRight) hi = right;
    else lo = left;
  }
  return (lo + hi) / 2;
}
