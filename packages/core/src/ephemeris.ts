import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sweph from 'sweph';
import { BODIES, type BodyDefinition } from './constants.js';
import { ChartError } from './errors.js';
import { degreeInSign, normalize360, signOf } from './math.js';
import type { BodyId, CelestialBody, EphemerisMode } from './types.js';

/**
 * File di effemeridi minimi per il modo `swisseph`, copertura 1800-2400.
 * Scaricabili con `npm run ephe:download -w @dodicisegni/core`.
 */
const REQUIRED_FILES = ['sepl_18.se1', 'semo_18.se1'];
const ASTEROID_FILE = 'seas_18.se1';
/** Il catalogo delle stelle fisse, facoltativo: serve solo alle stelle della tavola di Lilly. */
const STARS_FILE = 'sefstars.txt';

export interface EphemerisContext {
  /**
   * `swisseph` usa i file `.se1` (precisione al secondo d'arco);
   * `moshier` è la modalità analitica interna, senza file esterni. Fra il
   * 1800 e il 2400 scarta dalla prima meno di un secondo d'arco dal Sole a
   * Saturno, fino a due sulla Luna nel 1900-2100 e a quattro verso il 2400,
   * fino a dieci sui pianeti esterni; niente sui Nodi e su Lilith medi. Sono
   * le fasce di `test/ephemeris.test.ts`, misurate e non riportate.
   */
  mode: EphemerisMode;
  /** Flag da passare a `calc_ut` / `houses_ex`. */
  flags: number;
  /** Cartella delle effemeridi, `null` in modalità Moshier. */
  path: string | null;
  /** `false` in modalità Moshier o se manca `seas_18.se1`: Chirone non è calcolabile. */
  asteroidsAvailable: boolean;
  /**
   * `false` se manca `sefstars.txt`: le stelle fisse non sono calcolabili.
   * Il catalogo non dipende dalle effemeridi dei pianeti, e vale anche col
   * ripiego su Moshier.
   */
  starsAvailable: boolean;
  warnings: string[];
}

let cache: { key: string; context: EphemerisContext } | undefined;

/**
 * Prepara Swiss Ephemeris e stabilisce la modalità di calcolo.
 *
 * Se i file `.se1` non sono presenti ripiega automaticamente sulle effemeridi
 * Moshier: il progetto resta utilizzabile senza scaricare nulla, al prezzo
 * di una precisione leggermente inferiore e della perdita di Chirone.
 */
export function initEphemeris(explicitPath?: string): EphemerisContext {
  const path = explicitPath ?? process.env['SE_EPHE_PATH'] ?? defaultEphemerisPath();
  const key = path;
  if (cache?.key === key) return cache.context;

  const warnings: string[] = [];
  const hasRequired = REQUIRED_FILES.every((file) => existsSync(joinPath(path, file)));
  const starsAvailable = existsSync(joinPath(path, STARS_FILE));

  let context: EphemerisContext;
  if (hasRequired) {
    sweph.set_ephe_path(path);
    const asteroidsAvailable = existsSync(joinPath(path, ASTEROID_FILE));
    if (!asteroidsAvailable) {
      warnings.push(
        `File ${ASTEROID_FILE} assente in ${path}: Chirone non è calcolabile.`,
      );
    }
    context = {
      mode: 'swisseph',
      flags: sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED,
      path,
      asteroidsAvailable,
      starsAvailable,
      warnings,
    };
  } else {
    // Senza i `.se1` il percorso serve ancora al catalogo delle stelle, se c'è:
    // Swiss Ephemeris lo cerca lì anche quando i pianeti vengono da Moshier.
    if (starsAvailable) sweph.set_ephe_path(path);
    warnings.push(
      `File di effemeridi non trovati in ${path}: uso le effemeridi Moshier ` +
        '(nessun file richiesto, precisione leggermente inferiore, Chirone non disponibile). ' +
        'Esegui `npm run ephe:download -w @dodicisegni/core` per la precisione piena.',
    );
    context = {
      mode: 'moshier',
      flags: sweph.constants.SEFLG_MOSEPH | sweph.constants.SEFLG_SPEED,
      path: null,
      asteroidsAvailable: false,
      starsAvailable,
      warnings,
    };
  }

  cache = { key, context };
  return context;
}

/** Azzera la cache di inizializzazione. Utile nei test. */
export function resetEphemerisCache(): void {
  cache = undefined;
}

/**
 * Calcola la posizione dei corpi richiesti al giorno giuliano dato.
 *
 * I corpi non calcolabili (tipicamente Chirone senza il file degli asteroidi)
 * vengono omessi dal risultato e segnalati in `warnings`, senza far fallire
 * l'intero calcolo.
 */
export function computeBodies(
  julianDayUT: number,
  bodyIds: readonly BodyId[],
  context: EphemerisContext,
): { bodies: CelestialBody[]; warnings: string[] } {
  const warnings: string[] = [];
  const bodies: CelestialBody[] = [];
  // Il Nodo Sud è derivato: va calcolato dopo il Nodo Nord.
  const northNode = new Map<BodyId, CelestialBody>();

  for (const id of bodyIds) {
    const definition = findBody(id);

    if (definition.id === 'nodo-sud') continue;

    if (definition.requiresAsteroidFile && !context.asteroidsAvailable) {
      warnings.push(`${definition.name} non calcolabile: manca il file delle effemeridi asteroidali.`);
      continue;
    }

    const body = computeBody(julianDayUT, definition, context);
    if (typeof body === 'string') {
      warnings.push(`${definition.name} non calcolabile: ${body}`);
      continue;
    }
    bodies.push(body);
    if (definition.id === 'nodo-nord') northNode.set('nodo-nord', body);
  }

  if (bodyIds.includes('nodo-sud')) {
    const north = northNode.get('nodo-nord') ?? computeNorthNodeOnDemand(julianDayUT, context);
    if (typeof north === 'string') {
      warnings.push(`Nodo Sud non calcolabile: ${north}`);
    } else {
      const longitude = normalize360(north.longitude + 180);
      bodies.push({
        id: 'nodo-sud',
        name: 'Nodo Sud',
        longitude,
        latitude: -north.latitude,
        distance: north.distance,
        speed: north.speed,
        retrograde: north.retrograde,
        sign: signOf(longitude),
        signDegree: degreeInSign(longitude),
      });
    }
  }

  return { bodies, warnings };
}

/** Restituisce il corpo calcolato, oppure una stringa con il messaggio d'errore. */
function computeBody(
  julianDayUT: number,
  definition: BodyDefinition,
  context: EphemerisContext,
): CelestialBody | string {
  if (definition.swephConstant === null) {
    return 'corpo derivato, non calcolabile direttamente';
  }
  const planetIndex = sweph.constants[definition.swephConstant as keyof typeof sweph.constants];
  if (typeof planetIndex !== 'number') {
    return `costante Swiss Ephemeris ${definition.swephConstant} non disponibile`;
  }

  const result = sweph.calc_ut(julianDayUT, planetIndex, context.flags);
  if (result.flag < 0) {
    return result.error || 'errore sconosciuto in calc_ut';
  }
  // `error` può contenere un avviso anche con flag >= 0: in quel caso i dati sono validi.

  const [longitude, latitude, distance, speed] = result.data;
  if (
    typeof longitude !== 'number' ||
    typeof latitude !== 'number' ||
    typeof distance !== 'number' ||
    typeof speed !== 'number'
  ) {
    return 'risposta inattesa da calc_ut';
  }

  const normalized = normalize360(longitude);
  return {
    id: definition.id,
    name: definition.name,
    longitude: normalized,
    latitude,
    distance,
    speed,
    retrograde: speed < 0,
    sign: signOf(normalized),
    signDegree: degreeInSign(normalized),
  };
}

/**
 * La longitudine eclittica di una stella fissa all'istante dato, coi flag del
 * contesto: precessione e moto proprio dal catalogo di Swiss Ephemeris
 * (`sefstars.txt`, coordinate ICRS). Una stringa con il messaggio se la
 * stella non è calcolabile, come `computeBody`.
 *
 * `name` è il nome del catalogo, per esteso o con la sigla di Bayer dopo la
 * virgola (`,alLeo`): la sigla è univoca, il nome no.
 */
export function fixedStarLongitude(
  julianDayUT: number,
  name: string,
  context: EphemerisContext,
): number | string {
  if (!context.starsAvailable) return `manca il catalogo delle stelle (${STARS_FILE})`;
  const result = sweph.fixstar2_ut(name, julianDayUT, context.flags);
  if (result.flag < 0) return result.error || 'errore sconosciuto in fixstar2_ut';
  const [longitude] = result.data;
  if (typeof longitude !== 'number') return 'risposta inattesa da fixstar2_ut';
  return normalize360(longitude);
}

function computeNorthNodeOnDemand(
  julianDayUT: number,
  context: EphemerisContext,
): CelestialBody | string {
  return computeBody(julianDayUT, findBody('nodo-nord'), context);
}

export function findBody(id: BodyId): BodyDefinition {
  const definition = BODIES.find((body) => body.id === id);
  if (!definition) {
    throw new ChartError('CORPO_SCONOSCIUTO', `Corpo celeste "${id}" non riconosciuto.`);
  }
  return definition;
}

function defaultEphemerisPath(): string {
  // Da `dist/ephemeris.js` (o `src/ephemeris.ts` con tsx) risale alla radice del pacchetto.
  return fileURLToPath(new URL('../ephe', import.meta.url));
}

function joinPath(base: string, file: string): string {
  return base.endsWith('/') ? `${base}${file}` : `${base}/${file}`;
}
