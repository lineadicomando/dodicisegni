import { describe, expect, it } from 'vitest';
import { assertReadable, ChartError, MAX_READABLE_ROWS } from '../src/index.js';

const ARCO = { from: '2026-01-01', to: '2028-12-31', timezone: 'Europe/Rome' };

describe('il tetto alle righe di un elenco', () => {
  it('lascia passare fino al tetto compreso', () => {
    expect(() => assertReadable(0, ARCO)).not.toThrow();
    expect(() => assertReadable(MAX_READABLE_ROWS, ARCO)).not.toThrow();
  });

  it('oltre rifiuta, dicendo quante righe erano e come restringere', () => {
    let errore: unknown;
    try {
      assertReadable(MAX_READABLE_ROWS + 1, ARCO);
    } catch (sollevato) {
      errore = sollevato;
    }

    expect(errore).toBeInstanceOf(ChartError);
    expect((errore as ChartError).code).toBe('RISPOSTA_TROPPO_LUNGA');
    const messaggio = (errore as ChartError).message;
    expect(messaggio).toContain(`${MAX_READABLE_ROWS + 1} righe`);
    expect(messaggio).toContain('Dal 2026-01-01 al 2028-12-31');
    expect(messaggio).toMatch(/arco più corto.*meno corpi.*aspetti minori/);
  });

  it('aggiunge la via che una superficie ha in più', () => {
    expect(() => assertReadable(5000, ARCO, 'oppure chiedi il JSON')).toThrow(/; oppure chiedi il JSON\.$/);
  });
});
