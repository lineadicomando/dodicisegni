/**
 * Le dignità occidentali di un tema, raccolte nel blocco che `NatalChart`
 * porta: le tavole comuni sempre, quelle di una scuola solo se chiesta.
 *
 * Sta in un file suo perché tiene insieme `dignita.ts` e i pacchetti delle
 * scuole (`dignita-lilly.ts`, `dignita-tolomeo.ts`, `dignita-bonatti.ts`,
 * `dignita-valente.ts`), che dipendono dal primo: messo in uno di loro
 * farebbe un ciclo.
 * Non aggiunge regole, le applica ai corpi di un tema.
 *
 * **Per chi aggiunge una scuola** (Doroteo, se un suo testo diventasse
 * libero). Valente è il modello: `93cb27b` il calcolo, `697fea0` le
 * superfici. Servono un modulo `dignita-<scuola>.ts` con le righe `source` e
 * `termsSource` e le tavole ricopiate nel suo test; un valore di
 * `DignitySchool` col nome in `DIGNITY_SCHOOL_NAMES` (`constants.ts`: il
 * compilatore lo pretende, e da lì CLI, MCP, `/api/chart` e `/api/sky`
 * imparano a validarlo); un campo in `WesternDignities` e un ramo qui sotto;
 * la fonte delle ricezioni (`*_RECEPTION_SOURCE`) con le voci di `CONTATE` e
 * `FONTE_RICEZIONI`; gli export in `index.ts`; una funzione di righe in
 * `format.ts`; un blocco in `DignityTable.svelte`; una voce in
 * `apps/web/src/lib/scuole-dignita.ts` (provata da `elenchi.test.ts`; la
 * pagina Cielo la legge da lì). Le prove: un caso in
 * `packages/lettura/test/lettura.test.ts`, uno in
 * `packages/mcp/test/server.test.ts` (`compute_natal_chart` con
 * `dignity_school`), e la scuola nel blocco `dignita` del fascicolo canonico
 * (`packages/core/test/canonico.test.ts`), che le elenca una per una. Nessun
 * test vede invece i testi che le nominano a mano: l'aiuto di `--dignita` in
 * `cli.ts` (vale anche per `--sky`), la descrizione di `dignity_school` in
 * `packages/mcp/src/tools.ts` due volte (`compute_natal_chart` e
 * `compute_sky`), i commenti di `routes/api/chart/+server.ts` e
 * `routes/api/sky/+server.ts`, il commento in `sky.ts` sulle scuole senza
 * condizioni, il documento `packages/lettura/src/tropicale.ts` e `/metodo`
 * (`#dignita`). `apps/web/src/lib/server/birth.test.ts` prova il rifiuto con
 * una scuola che non c'è (oggi `doroteo`): va cambiata se quella entra. È una
 * scuola chiesta per nome, e muove la terza cifra della versione. Il conto
 * delle fortezze è di Lilly e resta suo: una scuola porta il proprio, o
 * nessuno; e le ricezioni restano quelle comuni per ogni scuola che non le
 * definisce, e la riga della fonte lo dice.
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
  bonattiReceptionsOf,
  bonattiRulersAt,
} from './dignita-bonatti.js';
import {
  VALENS_RECEPTION_SOURCE,
  VALENS_SOURCE,
  VALENS_TERMS_SOURCE,
  valensDignitiesOf,
  valensRulersAt,
} from './dignita-valente.js';
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
 * sono le sue, che nascono da un'applicazione: tutte e cinque le dignità,
 * delle minori due insieme (`bonattiReceptionsOf`). Con Valente anche: lui non ne definisce una (vedi `VALENS_RECEPTION_SOURCE`).
 */
const CONTATE: Readonly<Record<'comune' | DignitySchool, readonly ReceptionDignity[]>> = {
  comune: ['domicilio', 'esaltazione'],
  lilly: ['domicilio', 'esaltazione', 'triplicita', 'termine', 'faccia'],
  tolomeo: ['domicilio', 'esaltazione'],
  bonatti: ['domicilio', 'esaltazione', 'triplicita', 'termine', 'faccia'],
  valente: ['domicilio', 'esaltazione'],
};

/** La riga delle ricezioni per ciascun caso. */
const FONTE_RICEZIONI: Readonly<Record<'comune' | DignitySchool, string>> = {
  comune: RECEPTION_SOURCE,
  lilly: LILLY_RECEPTION_SOURCE,
  tolomeo: PTOLEMY_RECEPTION_SOURCE,
  bonatti: BONATTI_RECEPTION_SOURCE,
  valente: VALENS_RECEPTION_SOURCE,
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
  const { single, mutual } = conLilly
    ? lillyReceptionsOf(bodies, sect)
    : school === 'bonatti'
      ? { single: bonattiReceptionsOf(bodies), mutual: [] }
      : receptionsOf(bodies);
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

  if (school === 'valente') {
    dignities.valente = {
      school: 'valente',
      source: VALENS_SOURCE,
      termsSource: VALENS_TERMS_SOURCE,
      bodies: bodies.map((body) => ({
        id: body.id,
        name: body.name,
        rulers: valensRulersAt(body.longitude, sect),
        dignities: valensDignitiesOf(body.id, body.longitude),
      })),
    };
  }

  return dignities;
}
