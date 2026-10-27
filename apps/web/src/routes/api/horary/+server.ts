import { computeHoraryLilly, formatHoraryCompact, type HoraryQuestion } from '@dodicisegni/core';
import { error } from '@sveltejs/kit';
import { placeLabel } from '#lib/server/birth.js';
import { toHttpError } from '#lib/server/errors.js';
import { resolveSkyMoment } from '#lib/server/moment.js';
import { isHttpError, resolvePlace } from '#lib/server/place.js';
import type { RequestHandler } from './$types';

/**
 * `GET /api/horary?house=10&locationId=3169070`
 *
 * Il tema orario di una domanda secondo Lilly (Christian Astrology, 1647):
 * la figura dell'istante col Regiomontano e il suo pacchetto, i
 * significatori, i modi della perfezione e degli impedimenti con la pagina
 * del libro, le considerazioni prima del giudizio, il corso dei significatori
 * fino al cambio di segno. Non dice se la cosa avverrà.
 *
 * - `house` (obbligatorio): la casa del quesito, 1-12. La sceglie chi chiede,
 *   dalla domanda: il motore non la indovina. Un valore fuori da 1-12 è
 *   `CASA_NON_VALIDA`.
 * - `derivedFrom`: per le case derivate, la casa da cui contare. Il partner
 *   del fratello è `house=7&derivedFrom=3`.
 * - il luogo, obbligatorio: `locationId`, oppure `latitude`, `longitude` e
 *   `timezone`. Senza, non ci sono case (`LUOGO_MANCANTE`).
 * - `date` e `time`: l'istante della domanda. Senza `date` vale adesso; con
 *   `date` serve anche `time`, o la figura non ha case (`ORA_NON_VALIDA`).
 * - `format=compact`: la tabella di testo che il server MCP dà agli agenti.
 *
 * Il calcolo costa due decimi di secondo per un istante di oggi, e non passa
 * dal pool dei worker.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const parameters = url.searchParams;
    const place = resolvePlace(parameters);
    const { moment, explicit } = resolveSkyMoment(parameters, place.timezone);
    if (explicit && !moment.time) {
      throw error(400, "Con date va indicato anche time: senza l'ora la figura non ha case.", {
        code: 'ORA_NON_VALIDA',
      });
    }

    const question: HoraryQuestion = { house: readHouse(parameters, 'house', true)! };
    const derivedFrom = readHouse(parameters, 'derivedFrom', false);
    if (derivedFrom !== undefined) question.derivedFrom = derivedFrom;

    const horary = computeHoraryLilly(moment, { latitude: place.latitude, longitude: place.longitude }, { question });

    // Privata come un tema: l'indirizzo dice dove e quando qualcuno ha posto
    // una domanda. «Adesso» invece invecchia mentre lo si legge.
    setHeaders({ 'cache-control': explicit ? 'private, max-age=86400' : 'no-store' });
    if (parameters.get('format') === 'compact') {
      const intestazione = place.label ? `Luogo: ${place.label}\n` : '';
      return new Response(intestazione + formatHoraryCompact(horary), {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    return Response.json({ horary, place: placeLabel(place) });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};

/** Una casa, 1-12, o l'errore che dice quale parametro è sbagliato. */
function readHouse(parameters: URLSearchParams, name: string, required: boolean): number | undefined {
  const raw = parameters.get(name);
  if (raw === null || raw === '') {
    if (!required) return undefined;
    throw error(400, `Manca "${name}": la casa del quesito, da 1 a 12, scelta dalla domanda.`, {
      code: 'CASA_NON_VALIDA',
    });
  }
  const house = Number(raw);
  if (!Number.isInteger(house) || house < 1 || house > 12) {
    throw error(400, `"${name}" deve essere una casa da 1 a 12, non "${raw}".`, { code: 'CASA_NON_VALIDA' });
  }
  return house;
}
