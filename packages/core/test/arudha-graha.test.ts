import { describe, expect, it } from 'vitest';
import { grahaArudhaOf, rasiDrishti, strongerCoLord, strongerRasi, type Posizioni } from '../src/arudha-graha.js';
import { computeNatalChart } from '../src/chart.js';
import { formatJyotishaCompact } from '../src/format.js';
import { computeJyotisha } from '../src/jyotisha.js';
import type { BodyId, ZodiacSign } from '../src/types.js';

/** Posizioni a metà segno, salvo dove l'avanzamento conta. */
const pos = (segni: Partial<Record<BodyId, ZodiacSign>>, gradi: Partial<Record<BodyId, number>> = {}): Posizioni =>
  Object.fromEntries(
    Object.entries(segni).map(([id, sign]) => [id, { sign, signDegree: gradi[id as BodyId] ?? 15 }]),
  );

describe('le rasi drishti, §10.3', () => {
  it('rifanno gli esempi di Rao', () => {
    // «So Ar aspects Le, Sc and Aq»; «Ta aspects Cn, Li and Cp»; «Ge aspects
    // Vi, Sg and Pi»; «a planet in Libra will aspect … Aq, Ta and Le».
    expect(rasiDrishti('ariete')).toEqual(['leone', 'scorpione', 'acquario']);
    expect(rasiDrishti('toro')).toEqual(['cancro', 'bilancia', 'capricorno']);
    expect(rasiDrishti('gemelli')).toEqual(['vergine', 'sagittario', 'pesci']);
    expect(rasiDrishti('bilancia')).toEqual(['toro', 'leone', 'acquario']);
  });

  it('sono simmetriche', () => {
    const segni = ['ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine', 'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci'] as const;
    for (const a of segni) for (const b of rasiDrishti(a)) expect(rasiDrishti(b)).toContain(a);
  });
});

describe('il co-signore più forte, §15.5.1', () => {
  it('prende l\'altro quando uno è nel segno', () => {
    expect(strongerCoLord('acquario', pos({ saturno: 'acquario', 'nodo-nord': 'ariete' })).lord).toBe('nodo-nord');
  });

  it('regola 1: Saturno in Pi con Marte e Sole, Rahu in Ar con Giove', () => {
    const r = strongerCoLord('acquario', pos({ saturno: 'pesci', marte: 'pesci', sole: 'pesci', 'nodo-nord': 'ariete', giove: 'ariete' }));
    expect(r.lord).toBe('saturno');
    expect(r.rule).toContain('(§15.5.1, 1)');
  });

  it('regola 3: Saturno esaltato in Li contro Rahu in Cn', () => {
    expect(strongerCoLord('acquario', pos({ saturno: 'bilancia', 'nodo-nord': 'cancro' })).rule).toContain('3)');
  });

  it('regola 4: Marte in Ge, segno doppio, contro Ketu in Aq, fisso', () => {
    expect(strongerCoLord('scorpione', pos({ marte: 'gemelli', 'nodo-sud': 'acquario' })).lord).toBe('marte');
  });

  it('regola 5b: Marte a 23Li17 contro Ketu a 5Cn54, contato dalla fine', () => {
    const r = strongerCoLord('scorpione', pos({ marte: 'bilancia', 'nodo-sud': 'cancro' }, { marte: 23 + 17 / 60, 'nodo-sud': 5 + 54 / 60 }));
    expect(r.lord).toBe('nodo-sud');
    expect(r.rule).toContain('5b');
  });
});

describe('il segno più forte, §15.5.2', () => {
  it('regola 1: Ar con Saturno e Giove, Li con Venere', () => {
    expect(strongerRasi('ariete', 'bilancia', pos({ saturno: 'ariete', giove: 'ariete', venere: 'bilancia' })).sign).toBe('ariete');
  });

  it('regola 3: Saturno e Mercurio in Li, Giove e Venere in Ar', () => {
    const r = strongerRasi('ariete', 'bilancia', pos({ saturno: 'bilancia', mercurio: 'bilancia', giove: 'ariete', venere: 'ariete' }));
    expect(r).toEqual({ sign: 'bilancia', rule: 'Contiene un graha esaltato (§15.5.2, 3).' });
  });
});

describe('gli arudha dei graha, §9.5', () => {
  /** L'esempio 30, Chart 1, pp. 94-95: i segni dei nove come li dice il testo. */
  const CHART_1 = pos({
    sole: 'pesci', luna: 'gemelli', marte: 'ariete', mercurio: 'pesci', giove: 'ariete',
    venere: 'pesci', saturno: 'ariete', 'nodo-nord': 'cancro', 'nodo-sud': 'capricorno',
  });

  it('rifanno l\'esempio 30 per tutti e nove i graha', () => {
    const attesi: [BodyId, ZodiacSign, ZodiacSign, boolean][] = [
      ['sole', 'leone', 'capricorno', false],
      ['luna', 'cancro', 'leone', false],
      ['marte', 'ariete', 'capricorno', true],
      ['mercurio', 'gemelli', 'gemelli', true],
      ['giove', 'pesci', 'acquario', false],
      ['venere', 'bilancia', 'toro', false],
      ['saturno', 'capricorno', 'cancro', true],
      ['nodo-nord', 'acquario', 'vergine', false],
      ['nodo-sud', 'scorpione', 'vergine', false],
    ];
    for (const [id, proprio, pada, eccezione] of attesi) {
      expect(grahaArudhaOf(id, CHART_1)).toMatchObject({ ownSign: proprio, pada, exception: eccezione });
    }
  });

  it('per Venere sceglie la Bilancia con la regola 4, come dice Rao', () => {
    // Toro e Bilancia vuoti, nessuno li guarda, nessun esaltato: Venere in
    // Pesci, pari, e la Bilancia è dispari.
    expect(grahaArudhaOf('venere', CHART_1)?.ownSignRule).toContain('(§15.5.2, 4)');
  });
});

describe('nel tema vedico', () => {
  const carta = computeNatalChart(
    { date: '1968-03-12', time: '14:30', latitude: 40.8518, longitude: 14.2681, timezone: 'Europe/Rome' },
    { zodiac: 'siderale', houseSystem: 'segni-interi' },
  );

  it('ci sono tutti e nove, con la fonte, e nella tabella compatta', () => {
    const vedico = computeJyotisha(carta);
    expect(vedico.grahaArudhas.grahas).toHaveLength(9);
    expect(vedico.grahaArudhas.source).toContain('Narasimha Rao');
    expect(formatJyotishaCompact(vedico)).toContain('ARUDHA DEI GRAHA (NARASIMHA RAO)');
  });
});
