import { describe, expect, it } from 'vitest';
import { CASE_LILLY } from './case-lilly';

describe('le dodici case di Lilly', () => {
  it('sono dodici, in ordine, ciascuna con la sua pagina del cap. VII (pp. 50-56)', () => {
    expect(CASE_LILLY.map((casa) => casa.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const casa of CASE_LILLY) {
      const pagine = casa.pagina.split('-').map(Number);
      for (const pagina of pagine) {
        expect(pagina, `casa ${casa.numero}`).toBeGreaterThanOrEqual(50);
        expect(pagina, `casa ${casa.numero}`).toBeLessThanOrEqual(56);
      }
      expect(casa.temi.length, `casa ${casa.numero}`).toBeGreaterThan(20);
    }
  });
});
