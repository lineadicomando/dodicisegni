import {
  computeNatalChart,
  computeSky,
  computeTransits,
  findActiveTransits,
  findElectionHours,
  findSignIngresses,
  findSkyPassages,
  findStations,
  findTransitPassages,
  formatActiveTransitsCompact,
  formatElectionCompact,
  formatPassagesCompact,
  formatSkyCompact,
  formatSkyEventsCompact,
  formatSkyPassagesCompact,
  formatTransitsCompact,
} from '@dodicisegni/core';
import type { RequestEvent } from '@sveltejs/kit';
import { afterAll, describe, expect, it } from 'vitest';
import { GET as chart } from '../../routes/api/chart/+server';
import { GET as election } from '../../routes/api/election/+server';
import { GET as horary } from '../../routes/api/horary/+server';
import { GET as jyotish } from '../../routes/api/jyotish/+server';
import { GET as sky } from '../../routes/api/sky/+server';
import { GET as calendar } from '../../routes/api/sky/calendar/+server';
import { GET as course } from '../../routes/api/sky/course/+server';
import { GET as transits } from '../../routes/api/transits/+server';
import { GET as active } from '../../routes/api/transits/active/+server';
import { GET as passages } from '../../routes/api/transits/passages/+server';
import { chiudiPool } from './pool';

afterAll(() => chiudiPool());

type Rotta = (event: never) => Response | Promise<Response>;

/** Chiama una rotta come farebbe SvelteKit, con il poco dell'evento che le rotte leggono. */
async function chiama(rotta: Rotta, query: string): Promise<Response> {
  const event = {
    url: new URL(`http://localhost/api?${query}`),
    request: new Request('http://localhost/api'),
    setHeaders: () => {},
  } as unknown as RequestEvent;
  return rotta(event as never);
}

/** Coordinate e fuso, senza `locationId`: nessun nome di luogo, quindi nessuna riga in testa. */
const NASCITA = { date: '1985-09-20', time: '08:40', timezone: 'Europe/Rome', latitude: 45.0703, longitude: 7.6869 };
const NATO = 'date=1985-09-20&time=08:40&timezone=Europe/Rome&latitude=45.0703&longitude=7.6869';
const ARCO = { from: '2026-07-01', to: '2026-08-01', timezone: 'Europe/Rome' };
const QUANDO = 'from=2026-07-01&to=2026-08-01';
const LUOGO = { latitude: 45.0703, longitude: 7.6869 };

/**
 * Il testo di ogni rotta è quello che il motore rende per gli stessi input,
 * con le stesse funzioni che usa il server MCP: la rotta non impagina niente
 * di suo.
 */
describe('format=compact sulle rotte di calcolo', () => {
  const tema = computeNatalChart(NASCITA, {});

  const attese: [nome: string, rotta: Rotta, query: string, atteso: () => string][] = [
    [
      '/api/transits',
      transits,
      `${NATO}&transitDate=2026-07-15&transitTime=12:00`,
      () =>
        formatTransitsCompact(
          tema,
          computeTransits(tema, { date: '2026-07-15', time: '12:00', timezone: 'Europe/Rome' }, { minorAspects: false }),
        ),
    ],
    [
      '/api/transits/active',
      active,
      `${NATO}&${QUANDO}`,
      () => {
        const { transits: attivi, warnings, orbConvention } = findActiveTransits(tema, ARCO, { minorAspects: false });
        return formatActiveTransitsCompact(tema, attivi, ARCO, orbConvention, warnings);
      },
    ],
    [
      '/api/transits/passages',
      passages,
      `${NATO}&${QUANDO}`,
      () => {
        const { passages: trovati, warnings, orbConvention } = findTransitPassages(tema, ARCO, { minorAspects: false });
        return formatPassagesCompact(tema, trovati, ARCO, orbConvention, warnings);
      },
    ],
    [
      '/api/sky',
      sky,
      'date=2026-07-15&time=12:00&timezone=Europe/Rome',
      () => formatSkyCompact(computeSky({ date: '2026-07-15', time: '12:00', timezone: 'Europe/Rome' }, { minorAspects: false })),
    ],
    [
      '/api/sky/calendar',
      calendar,
      `${QUANDO}&timezone=Europe/Rome`,
      () => {
        const incontri = findSkyPassages(ARCO, { minorAspects: false });
        return [
          formatSkyPassagesCompact(incontri.passages, ARCO, incontri.orbConvention, incontri.warnings),
          formatSkyEventsCompact(findSignIngresses(ARCO, {}).ingresses, findStations(ARCO, {}).stations, ARCO, []),
        ].join('\n\n');
      },
    ],
    [
      '/api/election',
      election,
      'from=2029-08-24&to=2029-08-25&timezone=Europe/Rome&latitude=45.0703&longitude=7.6869',
      () => formatElectionCompact(findElectionHours({ from: '2029-08-24', to: '2029-08-25', timezone: 'Europe/Rome' }, LUOGO, {})),
    ],
  ];

  it.each(attese)('%s rende il testo del motore, in text/plain', async (_nome, rotta, query, atteso) => {
    const risposta = await chiama(rotta, `${query}&format=compact`);

    expect(risposta.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    const testo = await risposta.text();
    expect(testo).toBe(atteso());
    expect(testo.length).toBeGreaterThan(100);
  });

  it.each(attese)('%s senza format resta JSON', async (_nome, rotta, query) => {
    const risposta = await chiama(rotta, query);

    expect(risposta.headers.get('content-type')).toContain('application/json');
  });
});

describe('un formato sconosciuto', () => {
  const tutte: [string, Rotta, string][] = [
    ['/api/chart', chart, NATO],
    ['/api/jyotish', jyotish, NATO],
    ['/api/horary', horary, 'house=10&date=2026-07-15&time=12:00&timezone=Europe/Rome&latitude=45.0703&longitude=7.6869'],
    ['/api/sky/course', course, 'date=2026-07-15&time=12:00'],
    ['/api/transits', transits, NATO],
    ['/api/transits/active', active, `${NATO}&${QUANDO}`],
    ['/api/transits/passages', passages, `${NATO}&${QUANDO}`],
    ['/api/sky', sky, 'date=2026-07-15&time=12:00'],
    ['/api/sky/calendar', calendar, QUANDO],
    ['/api/election', election, 'from=2029-08-24&timezone=Europe/Rome&latitude=45.0703&longitude=7.6869'],
  ];

  it.each(tutte)('%s lo rifiuta con FORMATO_NON_VALIDO', async (_nome, rotta, query) => {
    // Le rotte sincrone sollevano, quelle del pool rifiutano la promessa.
    const esito = await Promise.resolve()
      .then(() => chiama(rotta, `${query}&format=xml`))
      .catch((sollevato: unknown) => sollevato);

    expect(esito).toMatchObject({ status: 400, body: { code: 'FORMATO_NON_VALIDO' } });
  });
});

describe("l'arco dell'elezione", () => {
  const LUOGO_Q = 'timezone=Europe/Rome&latitude=45.0703&longitude=7.6869';

  it('si conta a estremi compresi, come nel motore', async () => {
    // Dal 10 gennaio al 10 febbraio sono trentadue giorni: prima passava il
    // controllo della rotta e lo fermava il motore, con un altro codice.
    const troppi = await Promise.resolve()
      .then(() => chiama(election as Rotta, `${LUOGO_Q}&from=2026-01-10&to=2026-02-10`))
      .catch((sollevato: unknown) => sollevato);
    expect(troppi).toMatchObject({ status: 400, body: { code: 'INTERVALLO_TROPPO_LUNGO' } });

    const giusti = await chiama(election, `${LUOGO_Q}&from=2026-01-10&to=2026-02-09&rulers=giove`);
    expect(giusti.status).toBe(200);
  });
});

