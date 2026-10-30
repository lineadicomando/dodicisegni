import { describe, expect, it } from 'vitest';
import { formatDegrees, formatLocalInstant, formatSignDegree } from './format';

describe('formatDegrees', () => {
  it('scrive gradi e primi con i primi a due cifre', () => {
    expect(formatDegrees(22.05)).toBe("22°03'");
  });

  it('azzera i primi quando non ce ne sono', () => {
    expect(formatDegrees(15)).toBe("15°00'");
  });

  it('propaga il riporto invece di scrivere 60 primi', () => {
    // 22,9999° arrotonda a 60 primi: `22°60'` non è una posizione.
    expect(formatDegrees(22.9999)).toBe("23°00'");
  });

  it('non azzera i primi appena sotto il riporto', () => {
    expect(formatDegrees(22.99)).toBe("22°59'");
  });

  it('regge lo zero', () => {
    expect(formatDegrees(0)).toBe("0°00'");
  });
});

describe('formatSignDegree', () => {
  it('scrive gradi e primi come formatDegrees', () => {
    expect(formatSignDegree(22.05)).toBe("22°03'");
  });

  it("non arriva mai a 30 gradi, che dentro un segno non esistono", () => {
    // Il segno lo mostra la colonna accanto: `30°00'` accanto al glifo
    // dell'acquario è una posizione che nessun tema può avere.
    expect(formatSignDegree(29.998844)).toBe("29°59'");
    expect(formatSignDegree(29.9999999)).toBe("29°59'");
  });

  it('arrotonda come formatDegrees quando il bordo non c\'entra', () => {
    expect(formatSignDegree(22.9999)).toBe("23°00'");
  });

  it('regge lo zero', () => {
    expect(formatSignDegree(0)).toBe("0°00'");
  });
});

describe('formatLocalInstant', () => {
  it("scrive giorno e ora del fuso dell'istante, senza convertirli", () => {
    expect(formatLocalInstant('2026-10-27T22:15:00+01:00')).toBe('27 ott 2026, 22:15');
    // Il fuso del browser non conta: mezzanotte a Tokyo resta mezzanotte.
    expect(formatLocalInstant('2026-01-05T00:05:00+09:00')).toBe('5 gen 2026, 00:05');
  });

  it('lascia com\'è una stringa che non riconosce', () => {
    expect(formatLocalInstant('adesso')).toBe('adesso');
  });
});
