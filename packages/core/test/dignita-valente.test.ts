import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { ZODIAC_SIGNS } from '../src/constants.js';
import {
  VALENS_RECEPTION_SOURCE,
  VALENS_SOURCE,
  VALENS_TERMS_SOURCE,
  valensDignitiesOf,
  valensExaltation,
  valensFall,
  valensRulersAt,
  valensTermRuler,
  valensTriplicityLords,
  valensTriplicityOrder,
} from '../src/dignita-valente.js';
import { computeSky } from '../src/sky.js';
import { formatChartCompact } from '../src/format.js';
import type { BirthData, BodyId, ZodiacSign } from '../src/types.js';

/**
 * I termini egizi, dalla tavola greca di Robbins (Tetrabiblos, Loeb 1940),
 * p. 96, coi gradi di ciascun tratto; ricopiati dalla pagina (vedi
 * `trascrizioni.md` della fonte di Tolomeo), non dal modulo.
 */
const EGIZI: readonly string[] = [
  '♃6 ♀6 ☿8 ♂5 ♄5',
  '♀8 ☿6 ♃8 ♄5 ♂3',
  '☿6 ♃6 ♀5 ♂7 ♄6',
  '♂7 ♀6 ☿6 ♃7 ♄4',
  '♃6 ♀5 ♄7 ☿6 ♂6',
  '☿7 ♀10 ♃4 ♂7 ♄2',
  '♄6 ☿8 ♃7 ♀7 ♂2',
  '♂7 ♀4 ☿8 ♃5 ♄6',
  '♃12 ♀5 ☿4 ♄5 ♂4',
  '☿7 ♃7 ♀8 ♄4 ♂4',
  '☿7 ♀6 ♃7 ♂5 ♄5',
  '♀12 ♃4 ☿3 ♂9 ♄2',
];

/**
 * I termini come li stampa l'ed. Pingree (Teubner 1986), I.3, pp. 13-18,
 * letti sulle pagine il 30 ottobre 2026 (`texts/occidentale/
 * valente-anthologiae-pingree-1986`): l'Ariete coi due numeri integrati da
 * Rhosus, lo Scorpione col 5 di Rhosus, la Bilancia di Valente.
 */
const VALENTE: Record<ZodiacSign, string> = {
  ariete: '♃6 ♀6 ☿8 ♂5 ♄5',
  toro: '♀8 ☿6 ♃8 ♄5 ♂3',
  gemelli: '☿6 ♃6 ♀5 ♂7 ♄6',
  cancro: '♂7 ♀6 ☿6 ♃7 ♄4',
  leone: '♃6 ♀5 ♄7 ☿6 ♂6',
  vergine: '☿7 ♀10 ♃4 ♂7 ♄2',
  bilancia: '♄6 ☿5 ♃8 ♀7 ♂4',
  scorpione: '♂7 ♀4 ☿8 ♃5 ♄6',
  sagittario: '♃12 ♀5 ☿4 ♄5 ♂4',
  capricorno: '☿7 ♃7 ♀8 ♄4 ♂4',
  acquario: '☿7 ♀6 ♃7 ♂5 ♄5',
  pesci: '♀12 ♃4 ☿3 ♂9 ♄2',
};

const GLIFI: Readonly<Record<string, BodyId>> = {
  '☿': 'mercurio',
  '♀': 'venere',
  '♂': 'marte',
  '♃': 'giove',
  '♄': 'saturno',
};

function tratti(riga: string): (readonly [BodyId, number])[] {
  return riga.split(' ').map((t) => {
    const id = GLIFI[[...t][0]!];
    if (!id) throw new Error(`glifo sconosciuto: ${t}`);
    return [id, Number(t.slice(1))] as const;
  });
}

function lon(sign: ZodiacSign, degree: number): number {
  return ZODIAC_SIGNS.indexOf(sign) * 30 + degree;
}

describe('i termini della scuola di Valente', () => {
  it('sono quelli di Pingree, provati in ogni tratto e ai due bordi', () => {
    for (const sign of ZODIAC_SIGNS) {
      let inizio = 0;
      for (const [pianeta, gradi] of tratti(VALENTE[sign])) {
        expect(valensTermRuler(lon(sign, inizio)), `${sign} ${inizio}`).toBe(pianeta);
        expect(valensTermRuler(lon(sign, inizio + gradi - 0.001))).toBe(pianeta);
        inizio += gradi;
      }
      expect(inizio, sign).toBe(30);
    }
  });

  it('sono gli egizi di Robbins tranne la Bilancia, e la riga lo dice', () => {
    const somme: Record<string, number> = {};
    for (const riga of EGIZI) for (const [p, g] of tratti(riga)) somme[p] = (somme[p] ?? 0) + g;
    expect(somme).toEqual({ saturno: 57, giove: 79, marte: 66, venere: 82, mercurio: 76 });
    const diversi = ZODIAC_SIGNS.filter((sign) => VALENTE[sign] !== EGIZI[ZODIAC_SIGNS.indexOf(sign)]);
    expect(diversi).toEqual(['bilancia']);
    expect(VALENS_TERMS_SOURCE).toContain('Pingree');
    expect(VALENS_TERMS_SOURCE).toContain('Saturno 6, Mercurio 5, Giove 8, Venere 7, Marte 4');
    expect(VALENS_TERMS_SOURCE).toContain('Saturno 57, Giove 80, Marte 68, Venere 82, Mercurio 73');
  });
});

describe('esaltazioni e cadute, III.4', () => {
  it('portano il grado di p. 140, e i Nodi no', () => {
    const attese: [BodyId, ZodiacSign, number][] = [
      ['sole', 'ariete', 19],
      ['luna', 'toro', 3],
      ['giove', 'cancro', 15],
      ['marte', 'capricorno', 28],
      ['saturno', 'bilancia', 21],
      ['mercurio', 'vergine', 15],
      ['venere', 'pesci', 27],
    ];
    for (const [corpo, sign, degree] of attese) expect(valensExaltation(corpo)).toEqual({ sign, degree });
    expect(valensExaltation('nodo-nord')).toBeUndefined();
  });

  it('mettono la caduta nel segno opposto', () => {
    expect(valensFall('sole')).toBe('bilancia');
    expect(valensFall('venere')).toBe('vergine');
    expect(valensFall('nodo-sud')).toBeUndefined();
  });
});

describe('i triangoli, II.1', () => {
  it('hanno tre signori', () => {
    expect(valensTriplicityLords('ariete')).toEqual({ diurno: 'sole', notturno: 'giove', terzo: 'saturno' });
    expect(valensTriplicityLords('toro')).toEqual({ diurno: 'venere', notturno: 'luna', terzo: 'marte' });
    expect(valensTriplicityLords('gemelli')).toEqual({ diurno: 'saturno', notturno: 'mercurio', terzo: 'giove' });
    expect(valensTriplicityLords('cancro')).toEqual({ diurno: 'venere', notturno: 'marte', terzo: 'luna' });
  });

  it('li ordinano per setta come il testo, posto per posto', () => {
    // 56, 2-4: di notte la Luna, «δευτέρῳ τόπῳ» Venere, «τρίτῳ» Marte; di
    // giorno Venere, la Luna, Marte.
    expect(valensTriplicityOrder('vergine', 'notturna')).toEqual(['luna', 'venere', 'marte']);
    expect(valensTriplicityOrder('vergine', 'diurna')).toEqual(['venere', 'luna', 'marte']);
    // 56, 5-8: di giorno Saturno, Mercurio, Giove; di notte Mercurio, Saturno, Giove.
    expect(valensTriplicityOrder('acquario', 'diurna')).toEqual(['saturno', 'mercurio', 'giove']);
    expect(valensTriplicityOrder('acquario', 'notturna')).toEqual(['mercurio', 'saturno', 'giove']);
    // 56, 9-12: di notte Marte, Venere, la Luna; di giorno Venere, Marte, la Luna.
    expect(valensTriplicityOrder('pesci', 'notturna')).toEqual(['marte', 'venere', 'luna']);
    expect(valensTriplicityOrder('pesci', 'diurna')).toEqual(['venere', 'marte', 'luna']);
  });
});

describe('le dignità di un corpo secondo Valente', () => {
  it('sommano domicilio, esaltazione, triangolo, termine e caduta', () => {
    // Marte a 2 del Cancro: signore notturno dell'acqua, nel suo termine, in
    // caduta.
    expect(valensDignitiesOf('marte', lon('cancro', 2))).toEqual(['triplicita', 'termine', 'caduta']);
    // Mercurio a 3 della Vergine: domicilio, esaltazione, termine.
    expect(valensDignitiesOf('mercurio', lon('vergine', 3))).toEqual(['domicilio', 'esaltazione', 'termine']);
  });

  it('non hanno né esilio né faccia, e niente per i corpi fuori dai sette', () => {
    // Saturno a 15 del Leone: terzo signore del fuoco e nel suo termine; nessun esilio.
    expect(valensDignitiesOf('saturno', lon('leone', 15))).toEqual(['triplicita', 'termine']);
    expect(valensDignitiesOf('nodo-nord', lon('gemelli', 3))).toEqual([]);
    expect(valensDignitiesOf('urano', lon('acquario', 3))).toEqual([]);
  });

  it("nominano i signori di un grado, e l'ordine del triangolo solo con la setta", () => {
    expect(valensRulersAt(lon('ariete', 18.5), 'diurna')).toEqual({
      domicilio: 'marte',
      esaltazione: 'sole',
      triplicita: { diurno: 'sole', notturno: 'giove', terzo: 'saturno' },
      triplicitaDiSetta: ['sole', 'giove', 'saturno'],
      termine: 'mercurio',
    });
    expect(valensRulersAt(lon('leone', 1), undefined)).toEqual({
      domicilio: 'sole',
      triplicita: { diurno: 'sole', notturno: 'giove', terzo: 'saturno' },
      termine: 'giove',
    });
  });
});

describe('il pacchetto di Valente nel tema', () => {
  const NAPOLI: BirthData = {
    date: '1968-03-12',
    time: '14:30',
    latitude: 40.8518,
    longitude: 14.2681,
    timezone: 'Europe/Rome',
  };
  const sezione = (testo: string): string => testo.slice(testo.indexOf('DIGNITÀ'));

  it('chiesto, aggiunge le sue righe con le fonti e lascia le comuni come sono', () => {
    const comune = sezione(formatChartCompact(computeNatalChart(NAPOLI)));
    const testo = sezione(formatChartCompact(computeNatalChart(NAPOLI, { dignitySchool: 'valente' })));
    expect(testo).toContain(`Valente (a richiesta): ${VALENS_SOURCE}`);
    expect(testo).toContain(VALENS_TERMS_SOURCE);
    expect(testo).not.toContain('Bonatti (a richiesta)');
    const prima = (t: string): string => t.slice(0, t.indexOf(t.includes('Valente (a') ? 'Valente (a' : 'Ricezioni:'));
    expect(prima(testo)).toBe(prima(comune));
  });

  it('dà a ogni corpo i signori del suo grado e le sue dignità', () => {
    // Marte a 18°31' dell'Ariete, tema diurno: domicilio suo, esaltazione del
    // Sole, triangolo del Sole, di Giove e di Saturno in quest'ordine di
    // giorno, termine di Mercurio (12-20).
    const testo = formatChartCompact(computeNatalChart(NAPOLI, { dignitySchool: 'valente' }));
    expect(testo).toMatch(
      /^Marte\s+Marte\s+Sole\s+Sole\+Giove\+Saturno\s+Sole>Giove>Saturno\s+Mercurio\s+\| domicilio$/m,
    );
  });

  it('lascia le ricezioni alle tavole comuni, e dice perché', () => {
    const chart = computeNatalChart(NAPOLI, { dignitySchool: 'valente' });
    expect(chart.dignities?.receptions.counted).toEqual(['domicilio', 'esaltazione']);
    expect(chart.dignities?.receptions.source).toBe(VALENS_RECEPTION_SOURCE);
    expect(chart.dignities?.receptions.single).toEqual(computeNatalChart(NAPOLI).dignities?.receptions.single);
  });

  it('non si chiede nel siderale', () => {
    expect(() => computeNatalChart(NAPOLI, { zodiac: 'siderale', dignitySchool: 'valente' })).toThrow(
      expect.objectContaining({ code: 'ZODIACO_NON_TROPICALE' }),
    );
  });

  it("senza l'ora non dice l'ordine del triangolo", () => {
    const chart = computeNatalChart({ ...NAPOLI, time: undefined }, { dignitySchool: 'valente' });
    expect(chart.dignities?.valente?.bodies.every((b) => b.rulers.triplicitaDiSetta === undefined)).toBe(true);
    expect(formatChartCompact(chart)).toContain("senza l'ora la setta manca, e l'ordine non si dice");
  });

  it('vale anche per il cielo', () => {
    const sky = computeSky({ date: '2026-10-30', time: '12:00', timezone: 'Europe/Rome' }, { dignitySchool: 'valente' });
    expect(sky.dignities?.valente?.bodies.length).toBeGreaterThan(0);
  });
});
