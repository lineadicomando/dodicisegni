import {
  assertReadable,
  computeNatalChart,
  DEFAULT_PASSAGE_BODIES,
  type PassageOptions,
  formatActiveTransitsCompact,
} from '@dodicisegni/core';
import { placeLabel, readBirth, readChartOptions } from '#lib/server/birth.js';
import { toHttpError } from '#lib/server/errors.js';
import { readFormat, testo, VIA_DEL_JSON } from '#lib/server/formato.js';
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
 * da sola fa qualche migliaio di righe l'anno. «In orbita» vuol dire entro
 * le orbite dei transiti di Robert Hand, 1°, dichiarate in `orbConvention`.
 *
 * Con `format=compact` la risposta è la tabella di testo che il server MCP dà
 * ai suoi agenti, `text/plain`, invece del JSON, con il luogo di nascita in testa. Un altro valore è
 * `FORMATO_NON_VALIDO`. Il testo ha un tetto di mille righe, oltre il quale la
 * risposta è `RISPOSTA_TROPPO_LUNGA` e dice come restringere; il JSON non ce l'ha.
 */
export const GET: RequestHandler = async ({ url, setHeaders, request }) => {
  try {
    const parameters = url.searchParams;
    const formato = readFormat(parameters);
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
    const { transits, warnings, orbConvention } = await nelPool(
      request.signal,
      'attivi',
      chart,
      range,
      passageOptions,
    );

    if (formato === 'compact') assertReadable(transits.length, range, VIA_DEL_JSON);

    setHeaders({ 'cache-control': explicit ? 'private, max-age=86400' : 'no-store' });
    if (formato === 'compact') {
      return testo(
        formatActiveTransitsCompact(chart, transits, range, orbConvention, warnings),
        place.label && `Luogo di nascita: ${place.label}`,
      );
    }
    return Response.json({
      chart,
      range,
      orbConvention,
      transits,
      warnings,
      place: placeLabel(place),
    });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
