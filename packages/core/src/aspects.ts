import { ASPECTS, NON_ASPECTING_PAIRS, type AspectDefinition } from './constants.js';
import { angularSeparation } from './math.js';
import { natalOrbConvention, pairOrb, type OrbConventionDefinition } from './orbite.js';
import type { Aspect, AspectId, AspectPoint, BodyId, CelestialBody, PointAspect } from './types.js';

/** Passo temporale massimo, in giorni, per stabilire se un aspetto è applicativo. */
const APPLYING_PROBE_DAYS = 0.05;

/**
 * Quanto al più deve spostarsi il più rapido dei due punti durante la sonda.
 *
 * Un'ora e un quarto è un passo giusto per un pianeta, che in tanto tempo
 * percorre frazioni di grado. Non lo è per l'Ascendente in transito, che ne
 * percorre diciotto: la sonda scavalcherebbe l'aspetto e lo direbbe separativo
 * proprio mentre si chiude. Il passo si accorcia quindi con la velocità, che è
 * anche il modo di avvicinarsi alla derivata che questo calcolo vuole essere.
 */
const APPLYING_PROBE_ARC = 0.1;

export interface AspectOptions {
  /** Includi gli aspetti minori che la convenzione tratta. */
  minorAspects?: boolean;
  /** La convenzione delle orbite. Default: la natale predefinita, `greene`. */
  convention?: OrbConventionDefinition;
  /**
   * Orbite per aspetto, in gradi: sostituiscono quella della convenzione per
   * i soli aspetti nominati, per ogni coppia.
   */
  orbs?: Partial<Record<AspectId, number>>;
}

/** Le regole risolte una volta sola, invece che a ogni coppia. */
interface AspectRules {
  definitions: readonly AspectDefinition[];
  convention: OrbConventionDefinition;
  orbs: Partial<Record<AspectId, number>>;
}

/**
 * Calcola la matrice degli aspetti fra i corpi di uno stesso tema.
 *
 * Ogni coppia compare una volta sola, nell'ordine in cui i corpi sono stati
 * passati: `from` è quello che viene prima nell'elenco, non il più veloce.
 * La direzione dell'aspetto non ne dipende — `applying` guarda il moto di
 * entrambi — quindi l'ordine è di sola presentazione.
 */
export function computeAspects(
  bodies: readonly CelestialBody[],
  options: AspectOptions = {},
): Aspect[] {
  const rules = rulesFor(options);
  const aspects: Aspect[] = [];

  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      const a = bodies[i];
      const b = bodies[j];
      if (!a || !b) continue;
      if (isNonAspectingPair(a.id, b.id)) continue;

      const aspect = aspectBetween(a, b, rules);
      if (aspect) aspects.push(aspect);
    }
  }

  return sortByOrb(aspects);
}

/**
 * Calcola gli aspetti fra due insiemi di punti distinti: ognuno del primo
 * contro ognuno del secondo.
 *
 * Le due esclusioni che valgono dentro un tema qui non valgono più. Un punto
 * si confronta anche con il proprio omonimo — il Sole in transito congiunto
 * al Sole natale è il ritorno solare — e la coppia dei nodi non è più
 * ridondante: il Nodo Nord che passa sul Nodo Sud di nascita è un transito,
 * non una tautologia.
 *
 * `from` è l'insieme in movimento e `to` quello di riferimento, che nei
 * transiti ha velocità nulla: da lì discende il verso di `applying`.
 */
export function computeCrossAspects<From extends string, To extends string>(
  from: readonly AspectPoint<From>[],
  to: readonly AspectPoint<To>[],
  options: AspectOptions = {},
): PointAspect<From, To>[] {
  const rules = rulesFor(options);
  const aspects: PointAspect<From, To>[] = [];

  for (const moving of from) {
    for (const fixed of to) {
      const aspect = aspectBetween(moving, fixed, rules);
      if (aspect) aspects.push(aspect);
    }
  }

  return sortByOrb(aspects);
}

/**
 * L'aspetto fra due punti, o `null` se non ne formano nessuno.
 *
 * Le orbite non si sovrappongono fra aspetti diversi: al primo che combacia
 * ci si ferma.
 */
function aspectBetween<From extends string, To extends string>(
  a: AspectPoint<From>,
  b: AspectPoint<To>,
  rules: AspectRules,
): PointAspect<From, To> | null {
  const separation = angularSeparation(a.longitude, b.longitude);

  for (const definition of rules.definitions) {
    const orb = Math.abs(separation - definition.angle);
    const limit = pairOrb(rules.convention, definition.id, a.id, b.id, rules.orbs);
    // Un'orbita nulla non è un aspetto esatto al secondo: è un aspetto che la
    // convenzione non concede, come fra due punti senza orbita in Greene.
    if (limit <= 0 || orb > limit) continue;

    return {
      aspect: definition.id,
      angle: definition.angle,
      from: a.id,
      to: b.id,
      orb,
      applying: isApplying(a, b, definition.angle),
    };
  }

  return null;
}

function rulesFor(options: AspectOptions): AspectRules {
  const convention = options.convention ?? natalOrbConvention();
  return {
    definitions: aspectsOf(convention, options.minorAspects ?? false),
    convention,
    orbs: options.orbs ?? {},
  };
}

/**
 * Gli aspetti da cercare: quelli che la convenzione tratta, e fra questi i
 * minori solo se chiesti. In `ASPECTS` l'ordine, che decide chi vince.
 */
export function aspectsOf(
  convention: OrbConventionDefinition,
  minorAspects: boolean,
): readonly AspectDefinition[] {
  return ASPECTS.filter(
    (aspect) => convention.aspects.includes(aspect.id) && (minorAspects || aspect.major),
  );
}

/** L'aspetto più stretto per primo: è quello che pesa di più nella lettura. */
function sortByOrb<T extends { orb: number }>(aspects: T[]): T[] {
  return aspects.sort((x, y) => x.orb - y.orb);
}

/**
 * Un aspetto è applicativo se, avanzando di un piccolo passo temporale,
 * lo scarto dall'angolo esatto diminuisce.
 *
 * Vale anche con un punto fermo — un asse, una posizione natale — perché a
 * muovere lo scarto basta uno dei due.
 */
function isApplying(a: AspectPoint, b: AspectPoint, angle: number): boolean {
  const step = probeStep(a, b);
  const now = Math.abs(angularSeparation(a.longitude, b.longitude) - angle);
  const later = Math.abs(
    angularSeparation(a.longitude + a.speed * step, b.longitude + b.speed * step) - angle,
  );
  return later < now;
}

/** Il passo della sonda: abbastanza corto da non superare ciò che misura. */
function probeStep(a: AspectPoint, b: AspectPoint): number {
  const fastest = Math.max(Math.abs(a.speed), Math.abs(b.speed));
  if (fastest === 0) return APPLYING_PROBE_DAYS;
  return Math.min(APPLYING_PROBE_DAYS, APPLYING_PROBE_ARC / fastest);
}

function isNonAspectingPair(a: BodyId, b: BodyId): boolean {
  return NON_ASPECTING_PAIRS.some(
    ([first, second]) => (first === a && second === b) || (first === b && second === a),
  );
}
