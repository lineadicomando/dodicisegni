import {
  assertReadable,
  computeNatalChart,
  DEFAULT_PASSAGE_BODIES,
  type PassageOptions,
  formatPassagesCompact,
} from '@dodicisegni/core';
import { placeLabel, readBirth, readChartOptions } from '#lib/server/birth.js';
import { toHttpError } from '#lib/server/errors.js';
import { readFormat, testo, VIA_DEL_JSON } from '#lib/server/formato.js';
import { isHttpError } from '#lib/server/place.js';
import { nelPool } from '#lib/server/pool.js';
import { resolvePassageRange } from '#lib/server/range.js';
import type { RequestHandler } from './$types';

/**
 * `GET /api/transits/passages?date=1968-03-12&…&from=2026-01-01&to=2026-12-31`
 *
 * Gli istanti in cui i transiti si perfezionano, invece del quadro di un
 * momento solo: è la risposta a *quando*, e a *quante volte* — un pianeta
 * lento che retrograda passa tre volte sullo stesso punto natale.
 *
 * I parametri della nascita sono quelli di `/api/chart`. Senza `from` si parte
 * da oggi, senza `to` si arriva a un anno dopo. La Luna è esclusa: da sola
 * perfeziona qualche migliaio di aspetti all'anno, e si chiede con `moon=true`.
 *
 * Le finestre si misurano con le orbite dei transiti di Robert Hand, 1°, che
 * la risposta dichiara in `orbConvention`.
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

    // Il calcolo va in un altro thread: su tre anni con la Luna sono circa
    // due secondi, e qui terrebbero fermo il server per tutti. Il perché e
    // il perché sia sicuro stanno in `lib/server/pool.ts`.
    const { passages, warnings, orbConvention } = await nelPool(
      request.signal,
      'passaggi',
      chart,
      range,
      passageOptions,
    );

    if (formato === 'compact') assertReadable(passages.length, range, VIA_DEL_JSON);

    // Stessa regola dei transiti: un arco indicato è una funzione pura dei
    // parametri, un arco che comincia «oggi» scade a mezzanotte.
    setHeaders({ 'cache-control': explicit ? 'private, max-age=86400' : 'no-store' });
    if (formato === 'compact') {
      return testo(
        formatPassagesCompact(chart, passages, range, orbConvention, warnings),
        place.label && `Luogo di nascita: ${place.label}`,
      );
    }
    return Response.json({
      chart,
      range,
      orbConvention,
      passages,
      warnings,
      place: placeLabel(place),
    });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
