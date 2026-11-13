import { describe, expect, it } from 'vitest';
import { readFormat, testo } from './formato';

const params = (query: string): URLSearchParams => new URLSearchParams(query);

describe('readFormat', () => {
  it('dà il JSON quando il parametro manca', () => {
    expect(readFormat(params(''))).toBe('json');
    expect(readFormat(params('format=json'))).toBe('json');
    expect(readFormat(params('format=compact'))).toBe('compact');
  });

  it('rifiuta un formato che non conosce invece di servire il JSON', () => {
    try {
      readFormat(params('format=xml'));
    } catch (thrown) {
      expect(thrown).toMatchObject({ status: 400, body: { code: 'FORMATO_NON_VALIDO' } });
      return;
    }
    throw new Error('non è stato sollevato nessun errore');
  });
});

describe('testo', () => {
  it('mette le righe di provenienza che ci sono davanti alla tabella', async () => {
    const risposta = testo('TABELLA', 'Luogo di nascita: Roma', undefined, false, null);

    expect(risposta.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(await risposta.text()).toBe('Luogo di nascita: Roma\nTABELLA');
    expect(await testo('TABELLA').text()).toBe('TABELLA');
  });
});
