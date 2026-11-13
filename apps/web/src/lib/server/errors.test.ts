import { ChartError } from '@dodicisegni/core';
import { GeoError } from '@dodicisegni/geo';
import { describe, expect, it, vi } from 'vitest';
import { toHttpError } from './errors';

/** Estrae status e corpo da un errore sollevato da `toHttpError`. */
function capture(cause: unknown): { status: number; body: { message: string; code?: string } } {
  try {
    toHttpError(cause);
  } catch (thrown) {
    return thrown as { status: number; body: { message: string; code?: string } };
  }
  throw new Error('toHttpError non ha sollevato nulla');
}

describe('toHttpError', () => {
  it('tratta gli errori di input come 400', () => {
    const result = capture(new ChartError('FUSO_ORARIO_NON_VALIDO', 'fuso ignoto'));

    expect(result.status).toBe(400);
    expect(result.body.code).toBe('FUSO_ORARIO_NON_VALIDO');
  });

  it('tratta il fallimento delle effemeridi come 500', () => {
    // Non è colpa della richiesta: è una condizione del server.
    expect(capture(new ChartError('ERRORE_EFFEMERIDI', 'calcolo fallito')).status).toBe(500);
  });

  it('tratta il database delle località assente come 503', () => {
    // Problema di installazione, non della richiesta: il client può riprovare
    // dopo che l'operatore ha eseguito l'importazione.
    const scritto = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(capture(new GeoError('DATABASE_ASSENTE', 'manca il db')).status).toBe(503);
    scritto.mockRestore();
  });

  it('tratta una query vuota come 400', () => {
    expect(capture(new GeoError('QUERY_VUOTA', 'vuota')).status).toBe(400);
  });

  it('traduce gli errori sconosciuti in 500 con un testo fisso', () => {
    // Il messaggio di un errore imprevisto può portare un percorso del server
    // o una riga di SQL: va nel registro, non nella risposta.
    const scritto = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = capture(new Error('SQLITE_CANTOPEN: /srv/dodicisegni/data/geo.db'));

    expect(result.status).toBe(500);
    expect(result.body.code).toBe('ERRORE_INTERNO');
    expect(result.body.message).not.toContain('/srv');
    expect(scritto).toHaveBeenCalled();
    scritto.mockRestore();
  });

  it('non dice dove il server cercava il database delle località', () => {
    const scritto = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = capture(new GeoError('DATABASE_ASSENTE', 'Database non trovato in /srv/dodicisegni/data/geo.db'));

    expect(result.status).toBe(503);
    expect(result.body.code).toBe('DATABASE_ASSENTE');
    expect(result.body.message).not.toContain('/srv');
    scritto.mockRestore();
  });
});
