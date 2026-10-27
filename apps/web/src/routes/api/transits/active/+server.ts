import {
  computeNatalChart,
  DEFAULT_PASSAGE_BODIES,
  type PassageOptions,
} from '@dodicisegni/core';
import { placeLabel, readBirth, readChartOptions } from '#lib/server/birth.js';
import { toHttpError } from '#lib/server/errors.js';
import { isHttpError } from '#lib/server/place.js';
import { nelPool } from '#lib/server/pool.js';
import { resolvePassageRange } from '#lib/server/range.js';
import type { RequestHandler } from './$types';

/**
 * `GET /api/transits/active?date=1968-03-12&…&from=2026-09-01&to=2026-09-30`
 *
 * I transiti in orbita in qualche momento dell'arco: è la risposta a *che
 * cosa* è attivo in un periodo, dove `/api/transits/passages` risponde a
 * *quando* un aspetto si perfeziona. Ogni riga dice da quando a quando il
 * transito resta in orbita, se lo è per tutto l'arco, quanto è stretto ai due
 * bordi e le perfezioni che cadono dentro, e anche i transiti che non si
 * perfezionano mai, con l'avvicinamento massimo. Nessun punteggio: i
 * componenti, non un totale.
 *
 * Un periodo è solo un arco: un giorno, un mese, un bimestre si chiedono con
 * `from` e `to`, non con un nome. Gli stessi parametri di
 * `/api/transits/passages`: quelli della nascita come `/api/chart`, `from`
 * (default oggi), `to` (default un anno dopo, al massimo tre anni),
 * `transitTimezone`, `minorAspects`, e `moon=true` per includere la Luna, che
 * da sola fa qualche migliaio di righe l'anno.
 */
export const GET: RequestHandler = async ({ url, setHeaders }) => {
  try {
    const parameters = url.searchParams;
    const { birth, place } = readBirth(parameters);
    const options = readChartOptions(parameters);
    const chart = computeNatalChart(birth, options);

    const { range, explicit } = resolvePassageRange(
      parameters,
      parameters.get('transitTimezone') || birth.timezone,
    );

    const passageOptions: PassageOptions = { minorAspects: options.minorAspects ?? false };
    if (parameters.get('moon') === 'true') {
      passageOptions.bodies = [...DEFAULT_PASSAGE_BODIES, 'luna'];
    }

    // Costa quanto i passaggi, fino a due secondi: va nel pool per la stessa
    // ragione, scritta in `lib/server/pool.ts`.
    const { transits, warnings } = await nelPool('attivi', chart, range, passageOptions);

    setHeaders({ 'cache-control': explicit ? 'private, max-age=86400' : 'no-store' });
    return Response.json({ chart, range, transits, warnings, place: placeLabel(place) });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
