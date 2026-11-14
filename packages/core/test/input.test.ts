import { describe, expect, it } from 'vitest';
import {
  ChartError,
  computeNatalChart,
  computeTransits,
  computeVimshottari,
  findSignCourse,
  findTransitPassages,
  initEphemeris,
  nakshatraOf,
  normalize360,
  planetaryHourAt,
} from '../src/index.js';
import { karanaOf, tithiOf, yogaOf } from '../src/panchanga.js';

/** Gli input che il sito e il server MCP filtrano prima, e chi importa il motore no. */
const NASCITA = { date: '1968-03-12', time: '14:30', latitude: 40.8518, longitude: 14.2681, timezone: 'Europe/Rome' };
const MOMENTO = { date: '2026-07-01', time: '12:00', timezone: 'Europe/Rome' };

function codice(azione: () => unknown): string | undefined {
  try {
    azione();
  } catch (errore) {
    return errore instanceof ChartError ? errore.code : `altro: ${String(errore)}`;
  }
  return undefined;
}

describe('le orbite sostituite', () => {
  const natal = computeNatalChart(NASCITA, {});

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('rifiuta %s invece di usarlo', (orb) => {
    expect(codice(() => computeTransits(natal, MOMENTO, { orbs: { congiunzione: orb } }))).toBe('ORBITE_NON_VALIDE');
    expect(
      codice(() =>
        findTransitPassages(natal, { from: '2026-07-01', to: '2026-07-10', timezone: 'UTC' }, { orbs: { trigono: orb } }),
      ),
    ).toBe('ORBITE_NON_VALIDE');
  });

  it('lo zero resta il modo di spegnere un aspetto', () => {
    const { aspects } = computeTransits(natal, MOMENTO, { orbs: { congiunzione: 0 } });
    expect(aspects.some((aspect) => aspect.aspect === 'congiunzione')).toBe(false);
  });
});

describe('gli angoli sul bordo', () => {
  it('un negativo minuscolo torna a zero, non a 360', () => {
    expect(normalize360(-1e-15)).toBe(0);
    expect(normalize360(-1)).toBe(359);
    expect(normalize360(720)).toBe(0);
    // È così che il panchanga ricava l'elongazione e la somma: con 360 il
    // tithi era il trentunesimo, lo yoga il ventottesimo, il karana il 61°.
    const bordo = normalize360(-1e-15);
    expect(tithiOf(bordo).index).toBe(1);
    expect(yogaOf(bordo).index).toBe(1);
    expect(karanaOf(bordo).index).toBe(1);
    expect(() => nakshatraOf(-1e-15)).not.toThrow();
  });

  it('nessuna longitudine cade nel pada zero', () => {
    expect(nakshatraOf(226.66666666666666).pada).toBeGreaterThanOrEqual(1);
    for (let confine = 0; confine < 27; confine++) {
      const { pada } = nakshatraOf((confine * 360) / 27);
      expect(pada, `confine ${confine}`).toBeGreaterThanOrEqual(1);
      expect(pada, `confine ${confine}`).toBeLessThanOrEqual(4);
    }
  });
});

describe('un giorno giuliano che non è un numero', () => {
  it('il corso nel segno e le ore planetarie lo rifiutano', () => {
    expect(codice(() => findSignCourse(Number.NaN, 'sole'))).toBe('DATA_NON_VALIDA');
    expect(
      codice(() => planetaryHourAt(Number.NaN, { latitude: 41.9, longitude: 12.5 }, 'Europe/Rome', initEphemeris())),
    ).toBe('DATA_NON_VALIDA');
  });
});

describe('gli ordini delle dasha', () => {
  it('oltre il terzo si rifiutano, invece di produrre seicentomila periodi', () => {
    const tema = computeNatalChart(NASCITA, { zodiac: 'siderale' });
    for (const levels of [0, 4, 6, 1.5, Number.NaN]) {
      expect(codice(() => computeVimshottari(tema, { levels: levels as 1 })), String(levels)).toBe(
        'LIVELLI_DASHA_NON_VALIDI',
      );
    }
    expect(computeVimshottari(tema, { levels: 3 }).levels).toBe(3);
  });
});
