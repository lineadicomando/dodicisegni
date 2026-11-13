import { computeSky, type SkyOptions, formatSkyCompact } from '@dodicisegni/core';
import { placeLabel, readChartOptions } from '#lib/server/birth.js';
import { toHttpError } from '#lib/server/errors.js';
import { readFormat, testo } from '#lib/server/formato.js';
import { resolveSkyMoment } from '#lib/server/moment.js';
import { isHttpError, resolveOptionalPlace } from '#lib/server/place.js';
import type { RequestHandler } from './$types';

/**
 * `GET /api/sky?date=2026-08-01&time=18:30&timezone=Europe/Rome`
 *
 * Il cielo di un istante, senza nessuna nascita. Nessun parametro è
 * obbligatorio: senza `date` vale adesso, senza `timezone` vale UTC, e il
 * luogo — `locationId` oppure `latitude` e `longitude` — può mancare del
 * tutto. Senza luogo la risposta non ha assi né case, che è la differenza
 * fra un'effemeride e una carta.
 *
 * `zodiac`, `ayanamsa`, `orbConvention` e `minorAspects` valgono come su
 * `/api/chart`, e il cielo porta la convenzione in `sky.orbConvention`.
 *
 * `dignitySchool` (lilly, tolomeo, bonatti, valente) aggiunge le dignità di
 * quella scuola in `sky.dignities`, come su `/api/chart`; con Lilly anche le
 * condizioni dell'istante e il conto delle fortezze, che per case, ora
 * planetaria e Parte di Fortuna vogliono il luogo e l'ora. Senza scuola il
 * cielo non porta dignità. Solo nello zodiaco tropicale
 * (`ZODIACO_NON_TROPICALE`).
 *
 * Con `format=compact` la risposta è la tabella di testo che il server MCP dà
 * ai suoi agenti, `text/plain`, invece del JSON, con il luogo in testa quando c'è. Un altro valore è
 * `FORMATO_NON_VALIDO`.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const parameters = url.searchParams;
    const formato = readFormat(parameters);
    const place = resolveOptionalPlace(parameters);
    const { moment, explicit } = resolveSkyMoment(parameters, place?.timezone);

    const { houseSystem, minorAspects, zodiac, ayanamsa, orbConvention, dignitySchool } =
      readChartOptions(parameters);
    const options: SkyOptions = { minorAspects: minorAspects ?? false };
    if (orbConvention) options.orbConvention = orbConvention;
    if (houseSystem) options.houseSystem = houseSystem;
    if (zodiac) options.zodiac = zodiac;
    if (ayanamsa) options.ayanamsa = ayanamsa;
    if (dignitySchool) options.dignitySchool = dignitySchool;
    if (place) options.place = { latitude: place.latitude, longitude: place.longitude };

    const sky = computeSky(moment, options);

    // Qui la cache può essere condivisa, a differenza di quella di un tema:
    // il cielo di un istante è lo stesso per tutti, e non è di nessuno.
    // «Adesso» invece invecchia mentre lo si legge.
    setHeaders({ 'cache-control': explicit ? 'public, max-age=86400' : 'no-store' });
    if (formato === 'compact') return testo(formatSkyCompact(sky), place?.label && `Luogo: ${place.label}`);
    return Response.json({ sky, place: placeLabel(place) });
  } catch (cause) {
    // Gli errori già formati da `error()` hanno la propria risposta: si rilanciano.
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
