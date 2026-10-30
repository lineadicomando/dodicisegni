import { findSignCourse, formatSignCourseCompact, resolveTime, type BodyId } from '@dodicisegni/core';
import { error } from '@sveltejs/kit';
import { toHttpError } from '#lib/server/errors.js';
import { resolveSkyMoment } from '#lib/server/moment.js';
import { isHttpError } from '#lib/server/place.js';
import type { RequestHandler } from './$types';

/** I corpi di cui si può chiedere il corso: i sette, che le due Lune vuote sanno leggere. */
const CORPI: readonly BodyId[] = ['luna', 'sole', 'mercurio', 'venere', 'marte', 'giove', 'saturno'];

/**
 * `GET /api/sky/course?body=luna&date=2026-10-27&time=22:15&timezone=Europe/Rome`
 *
 * Il corso di un corpo dall'istante dato fino al cambio di segno: gli aspetti
 * tolemaici esatti coi sette, ciascuno con chi si avvicina (`approaching`),
 * le stazioni, l'ingresso nel segno dopo, da che cosa si sta separando, e la
 * Luna vuota di corso in due letture nominate, la moderna e quella di Lilly
 * (p. 112). Nessun luogo: il corso è lo stesso ovunque, e il fuso serve solo a
 * leggere l'istante e a scrivere gli eventi.
 *
 * - `body`: uno dei sette. Default `luna`; un altro corpo è `CORPO_NON_VALIDO`.
 * - `date`, `time`, `timezone`: come su `/api/sky`. Senza `date` vale adesso.
 * - `format=compact`: l'elenco di testo che il server MCP dà agli agenti.
 *
 * Costa pochi decimi di secondo anche per Saturno, e non passa dal pool.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const parameters = url.searchParams;
    const body = (parameters.get('body') || 'luna') as BodyId;
    if (!CORPI.includes(body)) {
      throw error(400, `"body" deve essere uno dei sette: ${CORPI.join(', ')}.`, { code: 'CORPO_NON_VALIDO' });
    }
    const timezone = parameters.get('timezone') || 'UTC';
    const { moment, explicit } = resolveSkyMoment(parameters, timezone);
    const course = findSignCourse(resolveTime(moment).time.julianDayUT, body, { timezone });

    setHeaders({ 'cache-control': explicit ? 'public, max-age=86400' : 'no-store' });
    if (parameters.get('format') === 'compact') {
      return new Response(formatSignCourseCompact(course), {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    return Response.json({ course });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
