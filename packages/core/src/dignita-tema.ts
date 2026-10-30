/**
 * Le dignità occidentali di un tema, raccolte nel blocco che `NatalChart`
 * porta: le tavole comuni sempre, quelle di una scuola solo se chiesta.
 *
 * Sta in un file suo perché tiene insieme `dignita.ts` e i pacchetti delle
 * scuole (`dignita-lilly.ts`, `dignita-tolomeo.ts`, `dignita-bonatti.ts`),
 * che dipendono dal primo: messo in uno di loro farebbe un ciclo.
 * Non aggiunge regole, le applica ai corpi di un tema.
 */

import { ZODIAC_SIGNS } from './constants.js';
import {
  DETRIMENT_SOURCE,
  dignitiesOf,
  DOMICILE_SOURCES,
  domicileLord,
  EXALTATION_SOURCE,
  RECEPTION_SOURCE,
  receptionsOf,
} from './dignita.js';
import {
  LILLY_RECEPTION_SOURCE,
  LILLY_SOURCE,
  lillyDignitiesOf,
  lillyReceptionsOf,
  lillyRulersAt,
} from './dignita-lilly.js';
import {
  PTOLEMY_RECEPTION_SOURCE,
  PTOLEMY_SOURCE,
  PTOLEMY_TERMS_SOURCE,
  ptolemyDignitiesOf,
  ptolemyRulersAt,
} from './dignita-tolomeo.js';
import {
  BONATTI_RECEPTION_SOURCE,
  BONATTI_SOURCE,
  BONATTI_TERMS_SOURCE,
  bonattiDignitiesOf,
  bonattiRulersAt,
} from './dignita-bonatti.js';
import { computeLillyConditions, type LillyConditionsInput } from './condizioni-lilly.js';
import type {
  CelestialBody,
  DignitySchool,
  ReceptionDignity,
  Sect,
  WesternDignities,
} from './types.js';

/**
 * Le dignità per cui le ricezioni si contano, con e senza la scuola. Con
 * Tolomeo restano le comuni: la ricezione è una definizione di Lilly, e
 * contarla sulle tavole di Tolomeo mescolerebbe le due scuole. Con Bonatti
 * pure: la sua ricezione nasce da un'applicazione, e qui non si calcola.
 */
const CONTATE: Readonly<Record<'comune' | DignitySchool, readonly ReceptionDignity[]>> = {
  comune: ['domicilio', 'esaltazione'],
  lilly: ['domicilio', 'esaltazione', 'triplicita', 'termine', 'faccia'],
  tolomeo: ['domicilio', 'esaltazione'],
  bonatti: ['domicilio', 'esaltazione'],
};

/** La riga delle ricezioni per ciascun caso. */
const FONTE_RICEZIONI: Readonly<Record<'comune' | DignitySchool, string>> = {
  comune: RECEPTION_SOURCE,
  lilly: LILLY_RECEPTION_SOURCE,
  tolomeo: PTOLEMY_RECEPTION_SOURCE,
  bonatti: BONATTI_RECEPTION_SOURCE,
};

/**
 * Il blocco delle dignità per i corpi di un tema tropicale. La setta serve
 * alla triplicità di Lilly, che senza resta dov'è la stessa di giorno e di
 * notte, e a dire chi governa il triangolo di Tolomeo e la triplicità di
 * Bonatti.
 *
 * `instant` serve alle condizioni di Lilly, che oltre ai corpi chiedono le
 * case, le stelle e l'ora planetaria: chi lo omette le ha senza case e senza
 * stelle, e `missing` lo dice.
 */
export function computeWesternDignities(
  bodies: readonly CelestialBody[],
  sect: Sect | undefined,
  school?: DignitySchool,
  instant?: Omit<LillyConditionsInput, 'bodies' | 'sect'>,
): WesternDignities {
  const signLords = Object.fromEntries(
    ZODIAC_SIGNS.map((sign) => [
      sign,
      { tradizionale: domicileLord(sign, 'tradizionale'), moderno: domicileLord(sign, 'moderno') },
    ]),
  ) as WesternDignities['signLords'];

  const conLilly = school === 'lilly';
  const { single, mutual } = conLilly ? lillyReceptionsOf(bodies, sect) : receptionsOf(bodies);
  const caso = school ?? 'comune';

  const dignities: WesternDignities = {
    sources: {
      domicili: { ...DOMICILE_SOURCES },
      esilio: DETRIMENT_SOURCE,
      esaltazione: EXALTATION_SOURCE,
    },
    signLords,
    bodies: bodies.map((body) => ({
      id: body.id,
      name: body.name,
      sign: body.sign,
      dignities: {
        tradizionale: dignitiesOf(body.id, body.sign, 'tradizionale'),
        moderno: dignitiesOf(body.id, body.sign, 'moderno'),
      },
    })),
    receptions: {
      source: FONTE_RICEZIONI[caso],
      counted: [...CONTATE[caso]],
      single,
      mutual,
    },
  };

  if (conLilly) {
    dignities.lilly = {
      school: 'lilly',
      source: LILLY_SOURCE,
      bodies: bodies.map((body) => ({
        id: body.id,
        name: body.name,
        rulers: lillyRulersAt(body.longitude, sect),
        dignities: lillyDignitiesOf(body.id, body.longitude, sect),
      })),
      conditions: computeLillyConditions({
        bodies,
        sect,
        ...(instant ?? { houses: [], stars: { missing: 'non richieste' } }),
      }),
    };
  }

  if (school === 'tolomeo') {
    dignities.tolomeo = {
      school: 'tolomeo',
      source: PTOLEMY_SOURCE,
      termsSource: PTOLEMY_TERMS_SOURCE,
      bodies: bodies.map((body) => ({
        id: body.id,
        name: body.name,
        rulers: ptolemyRulersAt(body.longitude, sect),
        dignities: ptolemyDignitiesOf(body.id, body.longitude),
      })),
    };
  }

  if (school === 'bonatti') {
    dignities.bonatti = {
      school: 'bonatti',
      source: BONATTI_SOURCE,
      termsSource: BONATTI_TERMS_SOURCE,
      bodies: bodies.map((body) => ({
        id: body.id,
        name: body.name,
        rulers: bonattiRulersAt(body.longitude, sect),
        dignities: bonattiDignitiesOf(body.id, body.longitude),
      })),
    };
  }

  return dignities;
}
