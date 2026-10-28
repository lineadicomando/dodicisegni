import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { computeJyotisha } from '../src/jyotisha.js';
import { computeVimshopaka, VARGA_VISWA, VIMSHOPAKA_WEIGHTS } from '../src/vimshopaka.js';
import { VARGA_SCHEMES } from '../src/varga-buoni.js';

describe('i pesi di BPHS 7.17-23', () => {
  it('sommano a 20 in ogni schema, e coprono i varga dello schema', () => {
    for (const [schema, pesi] of Object.entries(VIMSHOPAKA_WEIGHTS)) {
      expect(Object.values(pesi).reduce((a, b) => a + b, 0), schema).toBe(20);
      expect(Object.keys(pesi).sort(), schema).toEqual([...VARGA_SCHEMES[schema as keyof typeof VARGA_SCHEMES]].sort());
    }
  });

  it('seguono la tavola di Santhanam a p. 97 nel saptavarga', () => {
    // Il verso dà 5, 2, 3, 2½, 4½, 2, 1 senza dire a chi; la tavola mette il
    // saptamsa in coda.
    expect(VIMSHOPAKA_WEIGHTS.saptavarga).toEqual({ d1: 5, d2: 2, d3: 3, d9: 2.5, d12: 4.5, d30: 2, d7: 1 });
  });

  it('danno 20 al segno proprio e scendono con la relazione, 7.24-25', () => {
    expect(VARGA_VISWA).toEqual({ swakshetra: 20, adhimitra: 18, mitra: 15, sama: 10, shatru: 7, adhishatru: 5 });
  });
});

describe("l'esempio di Santhanam, vol. I, pp. 98-99", () => {
  // New Delhi, 17 febbraio 1984, 22:35 IST. Santhanam dà Venere a 9s 4°32'30";
  // qui viene 4°31'54", lontano da ogni confine dei sei varga.
  const carta = () =>
    computeNatalChart(
      { date: '1984-02-17', time: '22:35', latitude: 28.6139, longitude: 77.209, timezone: 'Asia/Kolkata' },
      { zodiac: 'siderale', houseSystem: 'segni-interi' },
    );

  it('rifà la tavola di Venere nello shadvarga, e il totale di 16,8', () => {
    // La tavola usa la hora del Cancro, quindi la convenzione Leone-Cancro;
    // il signore, la Luna, è lo stesso con quella di Parashara.
    for (const hora of ['leone-cancro', 'parashara'] as const) {
      const venere = computeVimshopaka(carta(), hora).grahas.find((g) => g.id === 'venere')!;
      const riga = (id: string) => venere.vargas.find((v) => v.varga === id)!;
      expect(riga('d1')).toEqual({ varga: 'd1', lord: 'saturno', relation: 'adhimitra', viswa: 18 });
      expect(riga('d2')).toEqual({ varga: 'd2', lord: 'luna', relation: 'adhishatru', viswa: 5 });
      expect(riga('d3')).toMatchObject({ lord: 'saturno', relation: 'adhimitra' });
      expect(riga('d9')).toMatchObject({ lord: 'saturno', relation: 'adhimitra' });
      expect(riga('d12')).toMatchObject({ lord: 'saturno', relation: 'adhimitra' });
      expect(riga('d30')).toEqual({ varga: 'd30', lord: 'venere', relation: 'swakshetra', viswa: 20 });
      expect(venere.schemes.find((s) => s.scheme === 'shadvarga')!.points).toBe(16.8);
    }
  });

  it('arriva nel tema vedico, per i sette graha e i quattro schemi', () => {
    const vedico = computeJyotisha(carta());
    expect(vedico.vimshopaka.grahas).toHaveLength(7);
    for (const graha of vedico.vimshopaka.grahas) {
      expect(graha.schemes.map((s) => s.scheme)).toEqual(['shadvarga', 'saptavarga', 'dashavarga', 'shodashavarga']);
      for (const s of graha.schemes) {
        expect(s.points).toBeGreaterThanOrEqual(5);
        expect(s.points).toBeLessThanOrEqual(20);
      }
    }
    expect(vedico.vimshopaka.source).toContain('p. 97');
  });
});
