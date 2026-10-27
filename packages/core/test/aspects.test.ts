import { describe, expect, it } from 'vitest';
import { computeAspects, computeCrossAspects } from '../src/aspects.js';
import { degreeInSign, signOf } from '../src/math.js';
import { natalOrbConvention, transitOrbConvention } from '../src/orbite.js';
import type { AspectPoint, BodyId, CelestialBody } from '../src/types.js';

/**
 * Corpi sintetici invece che calcolati: gli aspetti sono geometria pura, e
 * posizioni scelte a tavolino rendono le soglie delle orbite verificabili
 * al grado — cosa che un tema reale non permette.
 */
function body(id: BodyId, longitude: number, speed = 1): CelestialBody {
  return {
    id,
    name: id,
    longitude,
    latitude: 0,
    distance: 1,
    speed,
    retrograde: speed < 0,
    sign: signOf(longitude),
    signDegree: degreeInSign(longitude),
  };
}

function point<Id extends string>(id: Id, longitude: number, speed = 0): AspectPoint<Id> {
  return { id, longitude, speed };
}

describe('computeAspects', () => {
  it('riconosce un aspetto e ne misura lo scarto dall angolo esatto', () => {
    const aspects = computeAspects([body('marte', 10), body('giove', 128)]);

    expect(aspects).toHaveLength(1);
    expect(aspects[0]).toMatchObject({ aspect: 'trigono', from: 'marte', to: 'giove', angle: 120 });
    expect(aspects[0]?.orb).toBeCloseTo(2, 6);
  });

  it('tace quando la separazione eccede l orbita prevista', () => {
    // Sestile a 60°, orbita 6 in Greene: a 66° c'è, a 67° no.
    expect(computeAspects([body('marte', 10), body('giove', 76)])).toHaveLength(1);
    expect(computeAspects([body('marte', 10), body('giove', 77)])).toHaveLength(0);
  });

  it('non produce aspetti fra Nodo Nord e Nodo Sud', () => {
    const aspects = computeAspects([body('nodo-nord', 10), body('nodo-sud', 190)], {
      minorAspects: true,
    });

    expect(aspects).toHaveLength(0);
  });

  it('omette gli aspetti minori se non richiesti', () => {
    const bodies = [body('marte', 10), body('giove', 40)];

    expect(computeAspects(bodies)).toHaveLength(0);
    expect(computeAspects(bodies, { minorAspects: true })[0]?.aspect).toBe('semisestile');
  });

  it('ordina per orbita crescente', () => {
    const aspects = computeAspects([
      body('marte', 0),
      body('giove', 94), // quadrato, orbita 4
      body('saturno', 181), // opposizione, orbita 1
      body('urano', 62), // sestile, orbita 2
    ]);

    expect(aspects.map((a) => a.orb)).toEqual([...aspects.map((a) => a.orb)].sort((x, y) => x - y));
    expect(aspects[0]?.to).toBe('saturno');
  });
});

describe('computeCrossAspects', () => {
  it('confronta ogni punto del primo insieme con ognuno del secondo', () => {
    const aspects = computeCrossAspects(
      [point('sole', 100, 1), point('marte', 10, 0.5)],
      [point('sole', 100), point('luna', 190)],
    );

    expect(aspects).toHaveLength(4);
    expect(aspects.map((a) => `${a.from}-${a.to}`).sort()).toEqual([
      'marte-luna',
      'marte-sole',
      'sole-luna',
      'sole-sole',
    ]);
  });

  it('riconosce il ritorno di un corpo sulla propria posizione natale', () => {
    const aspects = computeCrossAspects([point('sole', 100, 1)], [point('sole', 100)]);

    expect(aspects[0]).toMatchObject({ aspect: 'congiunzione', from: 'sole', to: 'sole' });
    expect(aspects[0]?.orb).toBeCloseTo(0, 6);
  });

  it('confronta i due nodi fra insiemi diversi, dove non sono ridondanti', () => {
    // Coi transiti di Hand, che danno 1° a ogni coppia: con Greene i due
    // nodi, punti senza orbita, non farebbero aspetto fra loro.
    const aspects = computeCrossAspects([point('nodo-nord', 10, -0.05)], [point('nodo-sud', 10)], {
      convention: transitOrbConvention(),
    });

    expect(aspects[0]?.aspect).toBe('congiunzione');
  });

  it('accetta bersagli che non sono corpi celesti', () => {
    const aspects = computeCrossAspects(
      [point('marte', 100, 0.5)],
      [point('ascendente', 10), point('medio-cielo', 280)],
    );

    expect(aspects.map((a) => a.to).sort()).toEqual(['ascendente', 'medio-cielo']);
  });

  describe('direzione rispetto a un bersaglio fermo', () => {
    const natal = [point('sole', 0)];

    it('è applicativa se il transitante si avvicina all angolo esatto', () => {
      const aspects = computeCrossAspects([point('saturno', 118, 0.03)], natal);
      expect(aspects[0]?.applying).toBe(true);
    });

    it('è separativa se se ne allontana', () => {
      const aspects = computeCrossAspects([point('saturno', 118, -0.03)], natal);
      expect(aspects[0]?.applying).toBe(false);
    });

    it('è applicativa anche in moto retrogrado, se lo scarto si stringe', () => {
      const aspects = computeCrossAspects([point('saturno', 122, -0.03)], natal);
      expect(aspects[0]?.applying).toBe(true);
    });
  });

  it('non produce nulla se uno dei due insiemi è vuoto', () => {
    expect(computeCrossAspects([point('sole', 100, 1)], [])).toHaveLength(0);
    expect(computeCrossAspects([], [point('sole', 100)])).toHaveLength(0);
  });
});

describe('le convenzioni delle orbite', () => {
  const leo = { convention: natalOrbConvention('leo') };

  it('Greene: 10° ai maggiori fra pianeti, metà con un punto, niente fra due punti', () => {
    // Fonte: astro.com, tavola 2.AT/2.GW/2.GR e FAQ fq_fh_setup_e.htm.
    expect(computeAspects([body('marte', 10), body('giove', 109.5)])).toHaveLength(1);
    expect(computeAspects([body('marte', 10), body('giove', 110.5)])).toHaveLength(0);
    // Con un nodo vale metà dell'orbita del pianeta: 5°.
    expect(computeAspects([body('marte', 10), body('nodo-nord', 14.5)])).toHaveLength(1);
    expect(computeAspects([body('marte', 10), body('nodo-nord', 15.5)])).toHaveLength(0);
    // Fra due punti senza orbita nessun aspetto, nemmeno esatto.
    expect(computeAspects([body('nodo-nord', 10), body('lilith', 10)])).toHaveLength(0);
  });

  it('Greene: il quintile e il biquintile, a 2°, fra i minori', () => {
    const quintile = [body('marte', 10), body('giove', 83.5)];
    expect(computeAspects(quintile)).toHaveLength(0);
    expect(computeAspects(quintile, { minorAspects: true })[0]?.aspect).toBe('quintile');
    expect(
      computeAspects([body('marte', 10), body('giove', 155)], { minorAspects: true })[0]?.aspect,
    ).toBe('biquintile');
  });

  it('Leo: 8°, 10° con un luminare, 12° fra Sole e Luna, solo per congiunzione e opposizione', () => {
    // Fonte: Alan Leo, How to Judge a Nativity, 4ª ed. (1928), p. 47.
    expect(computeAspects([body('venere', 10), body('marte', 18)], leo)).toHaveLength(1);
    expect(computeAspects([body('venere', 10), body('marte', 19)], leo)).toHaveLength(0);
    expect(computeAspects([body('sole', 10), body('marte', 19)], leo)).toHaveLength(1);
    expect(computeAspects([body('sole', 10), body('luna', 21.5)], leo)).toHaveLength(1);
    // Il quadrato è 8° «all round»: il luminare non lo allarga.
    expect(computeAspects([body('sole', 10), body('marte', 108.5)], leo)).toHaveLength(0);
  });

  it('Leo non ha il quintile', () => {
    expect(
      computeAspects([body('marte', 10), body('giove', 82)], { ...leo, minorAspects: true }),
    ).toHaveLength(0);
  });

  it('Hand: 1° a ogni coppia, luminari compresi', () => {
    const hand = { convention: transitOrbConvention() };
    expect(computeCrossAspects([point('saturno', 120.9)], [point('sole', 0)], hand)).toHaveLength(1);
    expect(computeCrossAspects([point('saturno', 121.1)], [point('sole', 0)], hand)).toHaveLength(0);
  });

  it('un orbita sostituita vale per la coppia intera', () => {
    const aspects = computeAspects([body('marte', 10), body('giove', 133)], {
      orbs: { trigono: 3 },
    });
    expect(aspects).toHaveLength(1);
    expect(
      computeAspects([body('marte', 10), body('giove', 134)], { orbs: { trigono: 3 } }),
    ).toHaveLength(0);
  });

  it('rifiuta una convenzione che non conosce', () => {
    expect(() => natalOrbConvention('lilly' as never)).toThrow(/greene, leo/);
  });
});
