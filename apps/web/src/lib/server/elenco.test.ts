import { describe, expect, it } from 'vitest';
import { readList } from './elenco';

function capture(run: () => unknown): { status: number; body: { message: string; code?: string } } {
  try {
    run();
  } catch (thrown) {
    return thrown as { status: number; body: { message: string; code?: string } };
  }
  throw new Error('non è stato sollevato nessun errore');
}

describe('readList', () => {
  it('separa le voci e scarta quelle vuote', () => {
    expect(readList(' sole, luna ,,', 'bodies', 14, 'CORPO_SCONOSCIUTO')).toEqual(['sole', 'luna']);
    expect(readList(',,', 'bodies', 14, 'CORPO_SCONOSCIUTO')).toEqual([]);
  });

  it('lascia passare un elenco lungo quanto i valori ammessi', () => {
    expect(readList('d1,d1,d9', 'vargas', 3, 'VARGA_NON_VALIDO')).toHaveLength(3);
  });

  it('rifiuta un elenco più lungo dei valori ammessi', () => {
    // La richiesta della voce 35: `bodies=luna` ripetuto 1200 volte.
    const ripetuto = Array.from({ length: 1200 }, () => 'luna').join(',');
    const { status, body } = capture(() => readList(ripetuto, 'bodies', 14, 'CORPO_SCONOSCIUTO'));

    expect(status).toBe(400);
    expect(body.code).toBe('CORPO_SCONOSCIUTO');
    expect(body.message).toContain('1200');
  });
});
