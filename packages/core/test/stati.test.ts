import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { formatJyotishaCompact } from '../src/format.js';
import { computeJyotisha } from '../src/jyotisha.js';
import { computePanchanga } from '../src/panchanga.js';
import sweph from 'sweph';
import {
  COMBUSTION_LIMITS,
  computeCombustion,
  timeDegreesFromSun,
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

describe('la combustione in gradi di tempo, SS IX.4-5', () => {
  // Burgess, p. 366: la distanza è l'intervallo fra le levate del Sole e del
  // pianeta all'orizzonte est, o fra i tramonti all'ovest, in gradi
  // dell'equatore. J2000, ayanamsa zero: longitudini tropicali.
  const J2000 = 2451545;
  const eps = 23.439291;
  const rad = Math.PI / 180;
  const luogo = (latitude: number) => ({ latitude, julianDayUT: J2000, ayanamsa: 0 });

  /** Il tempo siderale a cui sorge il punto λ dell'eclittica, dalla formula dell'Ascendente. */
  function levata(lambda: number, phi: number): number {
    const asc = (theta: number) =>
      (Math.atan2(Math.cos(theta * rad), -(Math.sin(eps * rad) * Math.tan(phi * rad) + Math.cos(eps * rad) * Math.sin(theta * rad))) / rad + 360) % 360;
    // L'Ascendente cresce col tempo siderale: si cerca θ con asc(θ) = λ.
    let [a, b] = [0, 360];
    const scarto = (t: number) => ((asc(t) - lambda + 540) % 360) - 180;
    // Un punto di partenza dove lo scarto cambia segno una volta sola.
    for (let t = 0; t < 360; t += 1) {
      if (scarto(t) <= 0 && scarto(t + 1) > 0 && scarto(t + 1) - scarto(t) < 90) [a, b] = [t, t + 1];
    }
    for (let i = 0; i < 60; i++) {
      const m = (a + b) / 2;
      if (scarto(m) <= 0) a = m;
      else b = m;
    }
    return a;
  }
  const arco = (x: number, y: number) => Math.min(Math.abs(x - y) % 360, 360 - (Math.abs(x - y) % 360));

  it('all\'equatore, sull\'eclittica, è la differenza di ascensione retta', () => {
    const r = timeDegreesFromSun(corpo('sole', 0), corpo('giove', 10), luogo(0))!;
    expect(r.horizon).toBe('ovest');
    expect(r.timeDegrees).toBeCloseTo(Math.atan(Math.tan(10 * rad) * Math.cos(eps * rad)) / rad, 9);
  });

  it('a est è l\'intervallo fra le levate, come lo dà la formula dell\'Ascendente', () => {
    for (const [phi, sole, pianeta] of [[45, 100, 88], [41.9, 330, 315], [-33, 200, 190], [60, 10, 357]] as const) {
      const r = timeDegreesFromSun(corpo('sole', sole), corpo('marte', pianeta), luogo(phi))!;
      expect(r.horizon).toBe('est');
      expect(r.timeDegrees, `${phi} ${sole} ${pianeta}`).toBeCloseTo(arco(levata(sole, phi), levata(pianeta, phi)), 6);
    }
  });

  it('a ovest è l\'intervallo fra i tramonti: le levate dei punti opposti, come dice Burgess', () => {
    // «by adding, then, six signs to the calculated positions of the sun and
    // the planet … the interval between the setting of the sun and that of
    // the planet will be determined» (p. 366).
    for (const [phi, sole, pianeta] of [[45, 100, 112], [41.9, 330, 345], [52, 170, 181]] as const) {
      const r = timeDegreesFromSun(corpo('sole', sole), corpo('saturno', pianeta), luogo(phi))!;
      expect(r.horizon).toBe('ovest');
      expect(r.timeDegrees).toBeCloseTo(arco(levata(sole + 180, phi), levata(pianeta + 180, phi)), 6);
    }
  });

  it('porta il pianeta alla sua latitudine: ascensione retta e declinazione come le dà Swiss Ephemeris', () => {
    // All'equatore la differenza ascensionale è zero, e i gradi di tempo sono
    // la differenza di ascensione retta, che cotrans calcola per conto suo.
    const equatoriale = (lon: number, lat: number) => sweph.cotrans([lon, lat, 1], -eps)[0]!;
    const r = timeDegreesFromSun(corpo('sole', 120), corpo('venere', 128, 4), luogo(0))!;
    expect(r.timeDegrees).toBeCloseTo(arco(equatoriale(120, 0), equatoriale(128, 4)), 6);
    // A latitudine alta la latitudine del pianeta sposta l'esito di più gradi.
    const piatta = timeDegreesFromSun(corpo('sole', 120), corpo('venere', 128, 0), luogo(55))!;
    const alta = timeDegreesFromSun(corpo('sole', 120), corpo('venere', 128, 4), luogo(55))!;
    expect(Math.abs(alta.timeDegrees - piatta.timeDegrees)).toBeGreaterThan(2);
  });

  it('decide al posto della longitudine, e lo dice', () => {
    // A 55° nord, coi segni di levata breve: Saturno 18° indietro rispetto
    // al Sole, all'alba, intorno all'equinozio di primavera, è oltre il
    // limite in longitudine, ma dentro in gradi di tempo.
    const [saturno] = computeCombustion([corpo('sole', 8), corpo('saturno', 350)], luogo(55));
    expect(saturno?.distance).toBeCloseTo(18, 9);
    expect(saturno?.measure).toBe('gradi-di-tempo');
    expect(saturno?.timeDegrees).toBeLessThan(15);
    expect(saturno?.combust).toBe(true);
    const [senzaLuogo] = computeCombustion([corpo('sole', 8), corpo('saturno', 350)]);
    // La sera, dall'altra parte, gli stessi segni tramontano lenti: avanti
    // al Sole di 18°, in gradi di tempo è ben più lontano.
    const [sera] = computeCombustion([corpo('sole', 350), corpo('saturno', 8)], luogo(55));
    expect(sera?.horizon).toBe('ovest');
    expect(sera?.timeDegrees).toBeGreaterThan(18);
    expect(senzaLuogo?.measure).toBe('longitudine');
    expect(senzaLuogo?.combust).toBe(false);
  });

  it('oltre il circolo polare, dove un corpo può non tramontare, torna alla longitudine', () => {
    const [marte] = computeCombustion([corpo('sole', 90), corpo('marte', 100)], luogo(75));
    expect(marte?.timeDegrees).toBeUndefined();
    expect(marte?.measure).toBe('longitudine');
    expect(marte?.combust).toBe(true);
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
