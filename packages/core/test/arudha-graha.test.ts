import { describe, expect, it } from 'vitest';
import {
  grahaArudhaOf,
  grahaArudhasOf,
  rasiDrishti,
  strongerCoLord,
  strongerRasi,
  type Posizioni,
} from '../src/arudha-graha.js';
import { computeNatalChart } from '../src/chart.js';
import { formatJyotishaCompact, formatVargaCompact } from '../src/format.js';
import { computeJyotisha } from '../src/jyotisha.js';
import { computeVarga, VARGAS } from '../src/varga.js';
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

  it('regola 4: Marte in Ge, segno mutevole, contro Ketu in Aq, fisso', () => {
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

describe('nei varga, dove il grado non c\'è', () => {
  // Rao, §9.5, p. 94: gli arudha si contano in ogni divisionale. Il grado nel
  // segno manca, e la scelta del proprietario del 30 ottobre 2026 è di
  // lasciare indeterminato quello che senza grado non si decide.
  /** Posizioni coi soli segni, come in un varga. */
  const segni = (s: Partial<Record<BodyId, ZodiacSign>>): Posizioni =>
    Object.fromEntries(Object.entries(s).map(([id, sign]) => [id, { sign }]));

  it('il co-signore resta indeterminato quando decide la 5b', () => {
    // Il caso della 5b di sopra, senza i gradi.
    const r = strongerCoLord('scorpione', segni({ marte: 'bilancia', 'nodo-sud': 'cancro' }));
    expect(r.lord).toBeUndefined();
    expect(r.rule).toContain('5b');
  });

  it('e con lui il segno più forte, se il conto della (2) dipende da chi è', () => {
    // Ketu dal Cancro guarda lo Scorpione, Marte dalla Bilancia no: con Ketu
    // signore lo Scorpione vince la (2), con Marte i due sono pari.
    const p = segni({ marte: 'bilancia', 'nodo-sud': 'cancro' });
    const r = strongerRasi('ariete', 'scorpione', p);
    expect(r.sign).toBeUndefined();
    expect(r.rule).toContain('(§15.5.2, 2)');
    const marte = grahaArudhaOf('marte', p);
    expect(marte?.pada).toBeUndefined();
    expect(marte?.ownSign).toBeUndefined();
    expect(marte?.ownSignRule).toContain('Indeterminato');
  });

  it('ma il dubbio non conta se decide una regola prima', () => {
    const p = segni({ marte: 'bilancia', 'nodo-sud': 'cancro', giove: 'ariete' });
    expect(strongerRasi('ariete', 'scorpione', p)).toEqual({ sign: 'ariete', rule: 'Più graha nel segno (§15.5.2, 1).' });
  });

  it('con i gradi il risultato è quello di prima', () => {
    const p = pos({ marte: 'bilancia', 'nodo-sud': 'cancro' }, { marte: 23 + 17 / 60, 'nodo-sud': 5 + 54 / 60 });
    expect(strongerRasi('ariete', 'scorpione', p).sign).toBeDefined();
    expect(grahaArudhaOf('marte', p)?.pada).toBeDefined();
  });

  const carta = computeNatalChart(
    { date: '1968-03-12', time: '14:30', latitude: 40.8518, longitude: 14.2681, timezone: 'Europe/Rome' },
    { zodiac: 'siderale', houseSystem: 'segni-interi' },
  );

  it('il D-1 ha gli arudha della rashi', () => {
    const d1 = computeVarga(carta, 'd1');
    if (d1.kind !== 'segni') throw new Error('il D-1 ha segni');
    expect(d1.grahaArudhas.grahas).toEqual(computeJyotisha(carta).grahaArudhas.grahas);
  });

  it('ogni varga coi segni li porta, con la fonte, e nella tabella compatta', () => {
    for (const { id } of VARGAS) {
      const varga = computeVarga(carta, id, { hora: 'leone-cancro' });
      if (varga.kind !== 'segni') throw new Error(id);
      expect(varga.grahaArudhas.grahas, id).toHaveLength(9);
      expect(varga.grahaArudhas.source, id).toContain('§9.5, p. 94');
      expect(formatVargaCompact(varga), id).toContain('Arudha dei graha (Narasimha Rao)');
    }
  });

  it('un arudha determinato non cambia con nessun grado', () => {
    // Su cento nascite e i quattordici varga dal D-3 al D-60: dove il motore
    // dà l'arudha, darlo col grado «del varga» (gradi × N modulo 30, l'uso
    // dei programmi) non lo cambia. Gli indeterminati sono pochi: il 30
    // ottobre 2026, su 4200 carte, 26 arudha.
    let indeterminati = 0;
    let determinati = 0;
    for (let i = 0; i < 100; i++) {
      const istante = new Date(Date.UTC(1940, 0, 1) + i * 86400000 * 97.3 + i * 3600000 * 7.1).toISOString();
      const nascita = computeNatalChart(
        { date: istante.slice(0, 10), time: istante.slice(11, 16), latitude: 41.9, longitude: 12.5, timezone: 'Europe/Rome' },
        { zodiac: 'siderale' },
      );
      for (const def of VARGAS) {
        if (def.id === 'd1' || def.id === 'd2') continue;
        const varga = computeVarga(nascita, def.id);
        if (varga.kind !== 'segni') continue;
        const conGrado: Posizioni = Object.fromEntries(
          nascita.bodies.map((body) => [
            body.id,
            { sign: varga.positions.find((x) => x.id === body.id)!.sign, signDegree: (body.signDegree * def.divisions) % 30 },
          ]),
        );
        const altri = grahaArudhasOf(nascita.bodies, conGrado);
        for (const a of varga.grahaArudhas.grahas) {
          if (a.pada === undefined) {
            indeterminati += 1;
            expect(['marte', 'saturno']).toContain(a.id);
            continue;
          }
          determinati += 1;
          expect(altri.find((x) => x.id === a.id)?.pada, `${def.id} ${a.id}`).toBe(a.pada);
        }
      }
    }
    expect(determinati).toBeGreaterThan(12000);
    expect(indeterminati).toBeLessThan(determinati / 100);
  });
});
