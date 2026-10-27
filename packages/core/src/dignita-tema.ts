/**
 * Le dignità occidentali di un tema, raccolte nel blocco che `NatalChart`
 * porta: le tavole comuni sempre, quelle di una scuola solo se chiesta.
 *
 * Sta in un file suo perché tiene insieme `dignita.ts` e `dignita-lilly.ts`,
 * e il secondo dipende dal primo: messo in uno dei due farebbe un ciclo.
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
import { computeLillyConditions, type LillyConditionsInput } from './condizioni-lilly.js';
import type {
  CelestialBody,
  DignitySchool,
  ReceptionDignity,
  Sect,
  WesternDignities,
} from './types.js';

/** Le dignità per cui le ricezioni si contano, con e senza la scuola. */
const CONTATE: Readonly<Record<'comune' | DignitySchool, readonly ReceptionDignity[]>> = {
  comune: ['domicilio', 'esaltazione'],
  lilly: ['domicilio', 'esaltazione', 'triplicita', 'termine', 'faccia'],
};

/**
 * Il blocco delle dignità per i corpi di un tema tropicale. La setta serve
 * solo alla triplicità di Lilly; senza, quella resta dov'è la stessa di
 * giorno e di notte.
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
      source: conLilly ? LILLY_RECEPTION_SOURCE : RECEPTION_SOURCE,
      counted: [...CONTATE[conLilly ? 'lilly' : 'comune']],
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

  return dignities;
}
