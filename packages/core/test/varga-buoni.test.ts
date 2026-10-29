import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { parasharaSignDignities } from '../src/dignita-parashara.js';
import { computeJyotisha } from '../src/jyotisha.js';
import { arudhaOf } from '../src/arudha.js';
import { computeGoodVargas, GOOD_VARGA_NAMES, VARGA_SCHEMES } from '../src/varga-buoni.js';
import { VARGAS } from '../src/varga.js';
import type { BirthData } from '../src/types.js';

const NASCITA: BirthData = {
  date: '1968-03-12',
  time: '14:30',
  latitude: 40.8518,
  longitude: 14.2681,
  timezone: 'Europe/Rome',
};

const tema = () => computeNatalChart(NASCITA, { zodiac: 'siderale', houseSystem: 'segni-interi' });

describe("l'arudha di BPHS 29.1-5", () => {
  // Gli esempi di Santhanam, vol. I, pp. 295-297.
  it('conta dal lagna al signore e altrettanto oltre', () => {
    // Il tema campione: Scorpione ascendente, Marte nel Cancro, nove segni
    // avanti; nove ancora dal Cancro sono i Pesci.
    expect(arudhaOf('scorpione', 'cancro')).toBe('pesci');
  });

  it('prende il decimo quando il conto ricade nel bhava', () => {
    // Giove nel Sagittario: «we count 10 signs from Sagittarius and reach Virgo».
    expect(arudhaOf('sagittario', 'sagittario')).toBe('vergine');
  });

  it('col signore nel quarto dà il quarto', () => {
    // «Leo ascendant having the Sun … in Scorpio gets Scorpio itself».
    expect(arudhaOf('leone', 'scorpione')).toBe('scorpione');
  });

  it('col signore nel settimo dà il decimo, come il verso, e non il Toro della nota', () => {
    // 29.5, «saptame ca sthite nāthe vijñeyaṃ daśamaṃ padam». La nota di
    // Santhanam, Acquario con Saturno in Leone, stampa «Taurus»; il verso e
    // la sua stessa traduzione danno il decimo dall'Acquario.
    expect(arudhaOf('acquario', 'leone')).toBe('scorpione');
  });

  it('prende il quarto quando il conto cade nel settimo', () => {
    // Ariete con Marte nel Capricorno: nove avanti, nove ancora, la
    // Bilancia, che è il settimo; il pada è il Cancro.
    expect(arudhaOf('ariete', 'capricorno')).toBe('cancro');
  });
});

describe('gli schemi e i nomi di BPHS 6.42-51 e 7.17-20', () => {
  it('hanno sei, sette, dieci e sedici varga, tutti fra quelli calcolati', () => {
    expect(VARGA_SCHEMES.shadvarga).toHaveLength(6);
    expect(VARGA_SCHEMES.saptavarga).toHaveLength(7);
    expect(VARGA_SCHEMES.dashavarga).toHaveLength(10);
    expect(VARGA_SCHEMES.shodashavarga).toEqual(VARGAS.map((v) => v.id));
    // Ogni schema contiene il precedente.
    expect(VARGA_SCHEMES.saptavarga).toEqual(expect.arrayContaining([...VARGA_SCHEMES.shadvarga]));
    expect(VARGA_SCHEMES.dashavarga).toEqual(expect.arrayContaining([...VARGA_SCHEMES.saptavarga]));
  });

  it('danno un nome a ogni conto da due al massimo', () => {
    expect(Object.keys(GOOD_VARGA_NAMES.shadvarga).map(Number)).toEqual([2, 3, 4, 5, 6]);
    expect(GOOD_VARGA_NAMES.saptavarga[7]).toBe('Mukuta');
    expect(GOOD_VARGA_NAMES.dashavarga[2]).toBe('Parijata');
    expect(GOOD_VARGA_NAMES.dashavarga[10]).toBe('Sridhama');
    expect(Object.keys(GOOD_VARGA_NAMES.shodashavarga)).toHaveLength(15);
    expect(GOOD_VARGA_NAMES.shodashavarga[16]).toBe('Srivallabha');
  });
});

describe('i varga buoni di un tema', () => {
  it("trova l'arudha e i segni dei signori dei kendra", () => {
    // Lagna Cancro, la Luna nel lagna: il conto ricade nel lagna, e il pada
    // è il decimo, l'Ariete. I kendra dall'Ariete sono Ariete, Cancro,
    // Bilancia e Capricorno, coi signori Marte, Luna, Venere e Saturno, che
    // governano sette segni.
    const buoni = computeGoodVargas(tema())!;
    expect(buoni.arudhaLagna).toBe('ariete');
    expect(buoni.kendraLords).toEqual(['marte', 'luna', 'venere', 'saturno']);
    expect(buoni.arudhaSigns).toEqual([
      'ariete', 'toro', 'cancro', 'bilancia', 'scorpione', 'capricorno', 'acquario',
    ]);
  });

  it('dice per ogni varga perché è buono, e conta per schema', () => {
    const buoni = computeGoodVargas(tema())!;
    expect(buoni.grahas.map((g) => g.id)).toEqual(['sole', 'luna', 'mercurio', 'venere', 'marte', 'giove', 'saturno']);
    for (const graha of buoni.grahas) {
      expect(graha.vargas.map((v) => v.varga)).toEqual(VARGAS.map((v) => v.id));
      for (const v of graha.vargas) {
        if (!v.sign) continue;
        const attese = [
          ...parasharaSignDignities(graha.id, v.sign).filter((d) => d !== 'neecha'),
          ...(buoni.arudhaSigns.includes(v.sign) ? ['arudha'] : []),
        ];
        expect(v.good, `${graha.id} ${v.varga}`).toEqual(attese);
      }
      for (const schema of graha.schemes) {
        const membri = VARGA_SCHEMES[schema.scheme];
        const contati = graha.vargas.filter((v) => membri.includes(v.varga) && v.good.length > 0).length;
        expect(schema.good).toBe(contati);
        expect(schema.vargas).toBe(membri.length);
        expect(schema.name).toBe(GOOD_VARGA_NAMES[schema.scheme][contati] ?? null);
      }
    }
  });

  it('conta la hora di Parashara con la nota di Santhanam, e quella Leone-Cancro per segno', () => {
    const carta = tema();
    const parashara = computeGoodVargas(carta, 'parashara')!;
    const sole = parashara.grahas.find((g) => g.id === 'sole')!.vargas.find((v) => v.varga === 'd2')!;
    expect(sole.sign).toBeUndefined();
    expect(sole.good).toEqual(sole.hora === 'sole' ? ['hora'] : []);
    expect(parashara.hora.rule).toContain('p. 90');

    const leoneCancro = computeGoodVargas(carta, 'leone-cancro')!;
    const d2 = leoneCancro.grahas.find((g) => g.id === 'sole')!.vargas.find((v) => v.varga === 'd2')!;
    expect(['leone', 'cancro']).toContain(d2.sign);
  });

  it('dichiara il 6.53 invece di applicarlo', () => {
    const buoni = computeGoodVargas(tema())!;
    expect(buoni.verse53).toContain('Il conto non cambia');
    expect(buoni.verse53).toContain('la debolezza non ha una soglia');
    expect(
      buoni.grahas.every((g) => [g.neecha, g.combust, g.defeated].every((x) => typeof x === 'boolean')),
    ).toBe(true);
  });

  it("senza ora non conta, e il tema vedico dice perché", () => {
    const { time: _ora, ...senzaOra } = NASCITA;
    const carta = computeNatalChart(senzaOra, { zodiac: 'siderale', houseSystem: 'segni-interi' });
    expect(computeGoodVargas(carta)).toBeUndefined();
    const vedico = computeJyotisha(carta);
    expect(vedico.goodVargas).toBeUndefined();
    expect(vedico.warnings.join(' ')).toContain('arudha');
  });
});
