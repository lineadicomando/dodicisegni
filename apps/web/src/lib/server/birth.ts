/**
 * I dati di nascita e le opzioni del tema, letti dai parametri.
 *
 * Le sezioni che partono da una nascita accettano gli stessi parametri —
 * chi ha un indirizzo per il tema deve poterlo riusare per i transiti
 * cambiando solo l'endpoint — e quindi li leggono nello stesso posto.
 */

import {
  AYANAMSAS as AYANAMSA_DEFINITIONS,
  DIGNITY_SCHOOL_NAMES,
  HOUSE_SYSTEM_CODES,
  type AyanamsaId,
  type BirthData,
  type ChartOptions,
  type DignitySchool,
  type HouseSystem,
  type ZodiacOptions,
} from '@dodicisegni/core';
import { error } from '@sveltejs/kit';
import { resolvePlace, type ResolvedPlace } from './place';

/*
 * Gli elenchi dei valori ammessi si leggono dal motore. Questo modulo sta in
 * `lib/server`, che SvelteKit non lascia arrivare al browser: l'import di
 * valore non trascina niente nel bundle, e una copia qui rifiuterebbe in
 * silenzio il valore che il motore ha appena imparato. Le copie del client,
 * che invece non può importare, stanno in `lib/zodiacs.ts` e
 * `lib/house-systems.ts`, legate al motore da `lib/elenchi.test.ts`.
 */
const AYANAMSAS = new Set<string>(AYANAMSA_DEFINITIONS.map((ayanamsa) => ayanamsa.id));
const HOUSE_SYSTEMS = new Set<string>(Object.keys(HOUSE_SYSTEM_CODES));
const DIGNITY_SCHOOLS = new Set<string>(Object.keys(DIGNITY_SCHOOL_NAMES));

/** La nascita e il luogo da cui viene, che serve anche a intestare la risposta. */
export interface RequestedBirth {
  birth: BirthData;
  place: ResolvedPlace;
}

export function readBirth(parameters: URLSearchParams): RequestedBirth {
  const date = parameters.get('date');
  if (!date) {
    throw error(400, 'Parametro "date" mancante.', { code: 'DATA_MANCANTE' });
  }

  const place = resolvePlace(parameters);

  const birth: BirthData = {
    date,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  };
  const time = parameters.get('time');
  if (time) birth.time = time;

  return { birth, place };
}

/**
 * Lo zodiaco richiesto, letto a parte perché non riguarda solo i temi.
 *
 * Il calendario del cielo non ha né nascita né opzioni di carta, ma i suoi
 * ingressi nei segni dipendono da dove comincia l'Ariete come tutto il resto.
 */
export function readZodiacOptions(parameters: URLSearchParams): ZodiacOptions {
  const options: ZodiacOptions = {};

  const zodiac = parameters.get('zodiac');
  if (zodiac) {
    if (zodiac !== 'tropicale' && zodiac !== 'siderale') {
      throw error(
        400,
        `Zodiaco "${zodiac}" non riconosciuto: atteso "tropicale" oppure "siderale".`,
        { code: 'ZODIACO_NON_VALIDO' },
      );
    }
    options.zodiac = zodiac;
  }

  const ayanamsa = readAyanamsa(parameters);
  if (ayanamsa) {
    if (options.zodiac !== 'siderale') {
      // Accettarlo sullo zodiaco tropicale vuol dire restituire un tema in cui
      // l'ayanamsa chiesto non compare da nessuna parte, e nessuno se ne
      // accorge finché non confronta i gradi con un altro programma.
      throw error(
        400,
        'Il parametro "ayanamsa" richiede "zodiac=siderale".',
        { code: 'AYANAMSA_SENZA_ZODIACO' },
      );
    }
    options.ayanamsa = ayanamsa;
  }

  return options;
}

/**
 * L'ayanamsa richiesto, se c'è, senza chiedere niente sullo zodiaco.
 *
 * Sta a parte da `readZodiacOptions` perché non tutte le rotte hanno uno
 * zodiaco da scegliere: su `/api/jyotish` è siderale per definizione, e
 * pretendere lì il parametro che lo dice significherebbe farlo scrivere a ogni
 * richiesta per non dire niente.
 */
export function readAyanamsa(parameters: URLSearchParams): AyanamsaId | undefined {
  const ayanamsa = parameters.get('ayanamsa');
  if (!ayanamsa) return undefined;

  if (!AYANAMSAS.has(ayanamsa)) {
    throw error(
      400,
      `Ayanamsa "${ayanamsa}" non riconosciuto. Ammessi: ${[...AYANAMSAS].join(', ')}.`,
      { code: 'AYANAMSA_NON_VALIDO' },
    );
  }

  return ayanamsa as AyanamsaId;
}

export function readChartOptions(parameters: URLSearchParams): ChartOptions {
  const options: ChartOptions = {
    minorAspects: parameters.get('minorAspects') === 'true',
    ...readZodiacOptions(parameters),
  };

  const houseSystem = parameters.get('houseSystem');
  if (houseSystem) {
    if (!HOUSE_SYSTEMS.has(houseSystem)) {
      throw error(
        400,
        `Sistema di case "${houseSystem}" non riconosciuto.`,
        { code: 'SISTEMA_CASE_NON_VALIDO' },
      );
    }
    options.houseSystem = houseSystem as HouseSystem;
  }

  const fortuneFormula = parameters.get('partOfFortuneFormula');
  if (fortuneFormula) {
    if (fortuneFormula !== 'settore' && fortuneFormula !== 'diurna') {
      throw error(
        400,
        `Formula "${fortuneFormula}" non riconosciuta per la Parte di Fortuna: ` +
          'attesa "settore" oppure "diurna".',
        { code: 'FORMULA_FORTUNA_NON_VALIDA' },
      );
    }
    options.partOfFortuneFormula = fortuneFormula;
  }

  // Lo zodiaco lo controlla il motore, che nel siderale rifiuta la scuola con
  // ZODIACO_NON_TROPICALE: qui si controlla solo il nome.
  const dignitySchool = parameters.get('dignitySchool');
  if (dignitySchool) {
    if (!DIGNITY_SCHOOLS.has(dignitySchool)) {
      throw error(
        400,
        `Scuola delle dignità "${dignitySchool}" non riconosciuta. Ammesse: ${[...DIGNITY_SCHOOLS].join(', ')}.`,
        { code: 'SCUOLA_DIGNITA_NON_VALIDA' },
      );
    }
    options.dignitySchool = dignitySchool as DignitySchool;
  }

  return options;
}

/**
 * L'etichetta del luogo, come la riceve chi chiama.
 *
 * Accetta anche un luogo assente: nel cielo di un istante indicarlo è
 * facoltativo, e la risposta si limita a non intestarsi a nessun posto.
 */
export function placeLabel(
  place: { label?: string; refined?: boolean } | null,
): { label: string; refined: boolean } | undefined {
  return place?.label ? { label: place.label, refined: place.refined ?? false } : undefined;
}
