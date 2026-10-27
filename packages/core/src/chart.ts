import { computeAspects } from './aspects.js';
import { ayanamsaAt, DEFAULT_AYANAMSA, zodiacContext } from './ayanamsa.js';
import { DEFAULT_BODIES, DIGNITY_SCHOOL_NAMES } from './constants.js';
import { computeWesternDignities } from './dignita-tema.js';
import { computeDistribution } from './distribution.js';
import { ChartError } from './errors.js';
import { computeBodies, initEphemeris } from './ephemeris.js';
import { computeHouses, houseOf } from './houses.js';
import { validatePlace } from './place.js';
import { chartSect, computePartOfFortune } from './points.js';
import { localSiderealTime } from './sidereal.js';
import { resolveTime } from './time.js';
import type {
  Angles,
  BirthData,
  ChartOptions,
  ChartPoint,
  House,
  NatalChart,
  Sect,
} from './types.js';

/**
 * Calcola un tema natale completo.
 *
 * Il risultato è puramente astronomico: posizioni, case, assi e aspetti.
 * Non contiene interpretazioni — quelle restano a carico del consumatore
 * (interfaccia web, agente, generatore di testi).
 *
 * @example
 * ```ts
 * const chart = computeNatalChart({
 *   date: '1968-03-12',
 *   time: '14:30',
 *   latitude: 40.8518,
 *   longitude: 14.2681,
 *   timezone: 'Europe/Rome',
 * });
 * ```
 */
export function computeNatalChart(birth: BirthData, options: ChartOptions = {}): NatalChart {
  validatePlace(birth);

  const houseSystem = options.houseSystem ?? 'placidus';
  const bodyIds = options.bodies ?? DEFAULT_BODIES;

  const zodiac = options.zodiac ?? 'tropicale';
  // Rifiutata e non ignorata: chi chiede Lilly e non lo trova penserebbe che
  // il tema non abbia dignità da mostrare.
  if (options.dignitySchool && zodiac !== 'tropicale') {
    throw new ChartError(
      'ZODIACO_NON_TROPICALE',
      `Le dignità di ${DIGNITY_SCHOOL_NAMES[options.dignitySchool]} sono costruite sullo zodiaco tropicale: ` +
        'nel siderale non si calcolano.',
    );
  }
  // Il contesto siderale è una copia: quello in cache resta tropicale, e il
  // tema dopo questo non eredita i suoi flag.
  const context = zodiacContext(initEphemeris(options.ephemerisPath), options);
  const { time, warnings: timeWarnings } = resolveTime(birth);
  const { bodies, warnings: bodyWarnings } = computeBodies(time.julianDayUT, bodyIds, context);

  const warnings = [...context.warnings, ...timeWarnings, ...bodyWarnings];

  if (!time.timeKnown) {
    warnings.push(
      'Ora di nascita non fornita: la carta è calcolata a mezzogiorno locale. ' +
        'Case, assi e posizione della Luna sono indicativi.',
    );
  }

  // Senza ora di nascita le case sono prive di significato: la cuspide
  // dell'Ascendente ruota di 360° nell'arco della giornata.
  let houses: House[] = [];
  let angles: Angles | undefined;
  let sect: Sect | undefined;
  let partOfFortune: ChartPoint | undefined;
  if (time.timeKnown) {
    const houseResult = computeHouses(
      time.julianDayUT,
      birth.latitude,
      birth.longitude,
      houseSystem,
      context,
    );
    houses = houseResult.houses;
    angles = houseResult.angles;
    warnings.push(...houseResult.warnings);

    for (const body of bodies) {
      body.house = houseOf(body.longitude, houses);
    }

    // La Parte di Fortuna dipende dall'Ascendente e dai due luminari: senza
    // uno dei tre non è calcolabile, e l'assenza va segnalata invece di
    // restituire un punto arbitrario.
    const sun = bodies.find((body) => body.id === 'sole');
    const moon = bodies.find((body) => body.id === 'luna');

    if (sun && moon) {
      sect = chartSect(sun.longitude, angles.descendant);
      partOfFortune = computePartOfFortune(
        angles.ascendant,
        sun.longitude,
        moon.longitude,
        sect,
        options.partOfFortuneFormula ?? 'settore',
      );
      partOfFortune.house = houseOf(partOfFortune.longitude, houses);
    } else {
      warnings.push(
        'Parte di Fortuna non calcolabile: richiede Sole e Luna fra i corpi calcolati.',
      );
    }
  }

  // Il tema si compone qui, quando c'è tutto: la distribuzione conta anche
  // gli assi e la Parte di Fortuna, e calcolarla prima darebbe un tema senza
  // assi anche quando l'ora di nascita è nota. L'ordine delle chiavi è quello
  // del JSON che le superfici restituiscono.
  const chart: NatalChart = {
    input: birth,
    time,
    houseSystem,
    ephemerisMode: context.mode,
    zodiac,
    bodies,
    houses,
    siderealTime: localSiderealTime(time.julianDayUT, birth.longitude),
    aspects: computeAspects(bodies, { minorAspects: options.minorAspects ?? false }),
    distribution: computeDistribution({ bodies, angles, partOfFortune }),
    warnings,
  };

  if (zodiac === 'siderale') {
    chart.ayanamsa = ayanamsaAt(
      time.julianDayUT,
      context,
      options.ayanamsa ?? DEFAULT_AYANAMSA,
    );
  }
  if (angles) chart.angles = angles;
  if (sect) chart.sect = sect;
  if (partOfFortune) chart.partOfFortune = partOfFortune;

  // Solo nel tropicale: vedi `NatalChart.dignities`. La setta serve alla
  // triplicità di Lilly, e c'è solo con l'ora.
  if (zodiac === 'tropicale') {
    chart.dignities = computeWesternDignities(chart.bodies, chart.sect, options.dignitySchool);
  }

  return chart;
}
