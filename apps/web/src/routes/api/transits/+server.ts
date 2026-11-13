import { computeNatalChart, computeTransits, type TransitOptions, formatTransitsCompact } from '@dodicisegni/core';
import { placeLabel, readBirth, readChartOptions } from '#lib/server/birth.js';
import { toHttpError } from '#lib/server/errors.js';
import { readFormat, testo } from '#lib/server/formato.js';
import { resolveTransitMoment } from '#lib/server/moment.js';
import { isHttpError, LUOGO_TRANSITO, resolveOptionalPlace } from '#lib/server/place.js';
import type { RequestHandler } from './$types';

/**
 * `GET /api/transits?date=1968-03-12&time=14:30&locationId=3172394&transitDate=2026-08-15`
 *
 * I parametri della nascita sono gli stessi di `/api/chart`: un indirizzo che
 * calcola un tema calcola i suoi transiti cambiando solo il percorso.
 * A questi si aggiungono `transitDate`, `transitTime` e `transitTimezone`, e
 * il luogo da cui si guarda: `transitLocationId`, oppure `transitLatitude` e
 * `transitLongitude` insieme.
 *
 * Senza `transitDate` valgono l'istante e il giorno correnti. Il luogo del
 * transito è facoltativo: senza, la risposta è quella di prima.
 *
 * Risponde con il tema **e** i transiti: le posizioni natali servono comunque
 * a leggere il quadro, e chiederle due volte significherebbe ricalcolarle.
 *
 * Con `format=compact` la risposta è la tabella di testo che il server MCP dà
 * ai suoi agenti, `text/plain`, invece del JSON, con il luogo di nascita e quello del transito in testa. Un altro valore è
 * `FORMATO_NON_VALIDO`.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const parameters = url.searchParams;
    const formato = readFormat(parameters);
    const { birth, place } = readBirth(parameters);
    const options = readChartOptions(parameters);
    const chart = computeNatalChart(birth, options);

    // Il luogo si risolve prima dell'istante perché può fornirne il fuso: chi
    // sceglie una città per il transito intende «le nove là», non le nove
    // dell'orologio con cui è nato.
    const transitPlace = resolveOptionalPlace(parameters, LUOGO_TRANSITO);
    const { moment, explicit } = resolveTransitMoment(
      parameters,
      transitPlace?.timezone ?? birth.timezone,
    );

    const transitOptions: TransitOptions = { minorAspects: options.minorAspects ?? false };
    if (options.houseSystem) transitOptions.houseSystem = options.houseSystem;
    if (transitPlace) {
      transitOptions.place = {
        latitude: transitPlace.latitude,
        longitude: transitPlace.longitude,
      };
    }

    const transits = computeTransits(chart, moment, transitOptions);

    // Un istante indicato rende la risposta una funzione pura dei parametri,
    // memorizzabile come un tema; «adesso» invece invecchia mentre la si
    // legge — la Luna si sposta di mezzo grado all'ora — e conservarla
    // significherebbe mostrare domani il cielo di oggi.
    setHeaders({
      'cache-control': explicit ? 'private, max-age=86400' : 'no-store',
    });
    if (formato === 'compact') {
      return testo(
        formatTransitsCompact(chart, transits),
        place.label && `Luogo di nascita: ${place.label}`,
        transitPlace?.label && `Luogo del transito: ${transitPlace.label}`,
      );
    }
    return Response.json({
      chart,
      transits,
      place: placeLabel(place),
      transitPlace: placeLabel(transitPlace),
    });
  } catch (cause) {
    // Gli errori già formati da `error()` hanno la propria risposta: si rilanciano.
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
