import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { formatJyotishaCompact } from '../src/format.js';
import { computeJyotisha } from '../src/jyotisha.js';
import { computePanchanga } from '../src/panchanga.js';
import {
  COMBUSTION_LIMITS,
  computeCombustion,
  computeWars,
  SHAYANADI_AVASTHAS,
  shayanadiAvasthaOf,
} from '../src/stati.js';
import type { BirthData, BodyId, CelestialBody, ZodiacSign } from '../src/types.js';

const SEGNI: readonly ZodiacSign[] = [
  'ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine',
  'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci',
];

/** Un corpo finto: bastano longitudine, latitudine e moto. */
function corpo(id: BodyId, longitude: number, latitude = 0, retrograde = false): CelestialBody {
  const l = ((longitude % 360) + 360) % 360;
  return {
    id,
    name: id,
    longitude: l,
    latitude,
    distance: 1,
    speed: retrograde ? -0.5 : 0.5,
    retrograde,
    sign: SEGNI[Math.floor(l / 30)] as ZodiacSign,
    signDegree: l % 30,
  };
}

describe('la combustione del Surya Siddhanta', () => {
  it('ha i limiti di IX.6-8 e X.1, ricopiati dal testo', () => {
    // IX.6: Giove undici, Saturno quindici, Marte diciassette; IX.7: Venere
    // otto e dieci; IX.8: Mercurio dodici retrogrado, quattordici veloce;
    // X.1: la Luna dodici.
    expect(COMBUSTION_LIMITS).toEqual({
      luna: { direct: 12 },
      marte: { direct: 17 },
      mercurio: { direct: 14, retrograde: 12 },
      giove: { direct: 11 },
      venere: { direct: 10, retrograde: 8 },
      saturno: { direct: 15 },
    });
  });

  it('confronta la distanza col limite del moto, sotto e non al limite', () => {
    const sole = corpo('sole', 100);
    const esito = (b: CelestialBody) => computeCombustion([sole, b])[0];
    expect(esito(corpo('mercurio', 113))?.combust).toBe(true);
    expect(esito(corpo('mercurio', 113, 0, true))?.combust).toBe(false);
    expect(esito(corpo('venere', 91))?.combust).toBe(true);
    expect(esito(corpo('venere', 91, 0, true))?.combust).toBe(false);
    expect(esito(corpo('saturno', 115))?.combust).toBe(false);
    expect(esito(corpo('saturno', 114.9))?.combust).toBe(true);
    expect(esito(corpo('luna', 88.5))?.combust).toBe(true);
  });

  it('misura l\'arco più corto, anche attraverso lo zero', () => {
    const [marte] = computeCombustion([corpo('sole', 355), corpo('marte', 8)]);
    expect(marte?.distance).toBeCloseTo(13, 9);
    expect(marte?.combust).toBe(true);
  });

  it('non ne dice niente per Rahu, Ketu e i pianeti esterni, che il testo non nomina', () => {
    const ids = computeCombustion([
      corpo('sole', 0),
      corpo('nodo-nord', 1),
      corpo('nodo-sud', 181),
      corpo('urano', 2),
    ]).map((c) => c.id);
    expect(ids).toEqual([]);
  });
});

describe('la guerra planetaria', () => {
  it('c\'è sotto un grado fra due tārāgraha, e vince chi sta a nord', () => {
    const [guerra] = computeWars([corpo('marte', 50, 0.6), corpo('giove', 50.3, 0.1)]);
    expect(guerra?.between).toEqual(['marte', 'giove']);
    expect(guerra?.separation).toBeLessThan(1);
    expect(guerra?.victor).toBe('marte');
    expect(guerra?.defeated).toBe('giove');
  });

  it('vince Venere anche a sud', () => {
    const [guerra] = computeWars([corpo('venere', 10, -1.2), corpo('saturno', 10.2, -0.5)]);
    expect(guerra?.victor).toBe('venere');
    expect(guerra?.defeated).toBe('saturno');
  });

  it('non c\'è a un grado o più, misurato sulla sfera e non in sola longitudine', () => {
    // Stessa longitudine, latitudini a 1,2° l'una dall'altra: è la
    // congiunzione di VII.20, non la guerra.
    expect(computeWars([corpo('marte', 50, 1), corpo('mercurio', 50, -0.2)])).toEqual([]);
  });

  it('non la fanno i luminari né i nodi', () => {
    expect(computeWars([corpo('sole', 10), corpo('luna', 10.1), corpo('marte', 10.2), corpo('nodo-nord', 10.3)])).toEqual([]);
  });
});

describe('le avastha śayanādi', () => {
  it('rifanno l\'esempio di Santhanam, p. 455: il Sole in Netrapani', () => {
    // Sole in Krittika (s 3), 3° navamsa del Toro (n 3), nascita in
    // Krittika (a 3), 30 ghati e 33 vighati (g 31), lagna Scorpione (r 8).
    expect(shayanadiAvasthaOf({ s: 3, p: 1, n: 3, a: 3, g: 31, r: 8 })).toEqual({
      total: 51,
      index: 3,
      avastha: 'Netrapani',
    });
  });

  it('leggono il resto zero come la dodicesima', () => {
    expect(shayanadiAvasthaOf({ s: 1, p: 1, n: 1, a: 1, g: 1, r: 9 })).toMatchObject({ index: 12, avastha: 'Nidra' });
  });

  it('sono dodici, nell\'ordine di 45.30-31', () => {
    expect(SHAYANADI_AVASTHAS).toEqual([
      'Sayana', 'Upavesana', 'Netrapani', 'Prakasana', 'Gamana', 'Aagamana',
      'Sabha', 'Agama', 'Bhojana', 'Nrityalipsa', 'Kautuka', 'Nidra',
    ]);
  });
});

describe('nel tema vedico', () => {
  const NAPOLI: BirthData = {
    date: '1968-03-12',
    time: '14:30',
    latitude: 40.8518,
    longitude: 14.2681,
    timezone: 'Europe/Rome',
  };
  const carta = computeNatalChart(NAPOLI, { zodiac: 'siderale', houseSystem: 'segni-interi' });
  const vedico = computeJyotisha(carta);

  it('conta le ghati dall\'alba del panchanga, la stessa', () => {
    const panchanga = computePanchanga(NAPOLI, NAPOLI);
    const avastha = vedico.states.avasthas!;
    expect(avastha.sunrise).toBe(panchanga.vara.sunrise);
    expect(avastha.ghati).toBe(Math.floor(avastha.ghatisSinceSunrise) + 1);
    // 14:30 a Roma è 13:30 UT; l'alba di quel giorno è poco dopo le 5:20 UT.
    expect(avastha.ghatisSinceSunrise).toBeGreaterThan(20);
    expect(avastha.ghatisSinceSunrise).toBeLessThan(21);
  });

  it('porta per ogni graha i fattori da cui si rifà la somma', () => {
    const a = vedico.states.avasthas!;
    expect(a.grahas.map((g) => g.id)).toHaveLength(9);
    for (const g of a.grahas) {
      expect(g.total).toBe(g.factors.s * g.factors.p * g.factors.n + a.moonNakshatra + a.ghati + a.lagnaSign);
      expect(g.avastha).toBe(SHAYANADI_AVASTHAS[(g.total % 12 || 12) - 1]);
    }
  });

  it('senza ora non calcola le avastha e lo dice, ma combustione e guerra sì', () => {
    const senzaOra = computeJyotisha(
      computeNatalChart({ ...NAPOLI, time: undefined }, { zodiac: 'siderale', houseSystem: 'segni-interi' }),
    );
    expect(senzaOra.states.avasthas).toBeUndefined();
    expect(senzaOra.states.combustion.grahas.length).toBe(6);
    expect(senzaOra.warnings.join(' ')).toContain('Le avastha (BPHS 45.30-33) non sono calcolate');
  });

  it('entra nella tabella compatta, con le fonti, e nella riga dei varga buoni', () => {
    const testo = formatJyotishaCompact(vedico);
    expect(testo).toContain('STATI DEI GRAHA (BPHS 6.53)');
    expect(testo).toContain('Combustione. Surya Siddhanta IX.6-9');
    expect(testo).toContain('Guerra planetaria. Surya Siddhanta VII.1');
    expect(testo).toContain('Avastha. BPHS 45.30-33');
    for (const graha of vedico.goodVargas!.grahas) {
      const c = vedico.states.combustion.grahas.find((x) => x.id === graha.id);
      expect(graha.combust).toBe(c?.combust ?? false);
    }
  });
});
