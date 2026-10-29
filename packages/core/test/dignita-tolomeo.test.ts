import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { ZODIAC_SIGNS } from '../src/constants.js';
import {
  PTOLEMY_RECEPTION_SOURCE,
  PTOLEMY_SOURCE,
  PTOLEMY_TERMS_SOURCE,
  ptolemyDignitiesOf,
  ptolemyRulersAt,
  ptolemyTermRuler,
  ptolemyTriplicityGovernors,
  ptolemyTriplicityLords,
} from '../src/dignita-tolomeo.js';
import { computeSky } from '../src/sky.js';
import { formatChartCompact } from '../src/format.js';
import type { BirthData, BodyId, ZodiacSign } from '../src/types.js';

/**
 * I termini «secondo Tolomeo», Tetrabiblos I.21, ed. Robbins (Loeb 1940),
 * p. 106: la tavola greca, riga per riga dall'Ariete, coi glifi della stampa
 * e il totale progressivo che la tavola stampa accanto ai gradi. Ricopiata
 * dalla pagina (vedi `trascrizioni.md` nella copia locale della fonte) e non
 * dal modulo.
 */
const TERMINI: readonly string[] = [
  '♃6 ♀14 ☿21 ♂26 ♄30',
  '♀8 ☿15 ♃22 ♄24 ♂30',
  '☿7 ♃13 ♀20 ♂26 ♄30',
  '♂6 ♃13 ☿20 ♀27 ♄30',
  '♃6 ☿13 ♄19 ♀25 ♂30',
  '☿7 ♀13 ♃18 ♄24 ♂30',
  '♄6 ♀11 ☿16 ♃24 ♂30',
  '♂6 ♀13 ♃21 ☿27 ♄30',
  '♃8 ♀14 ☿19 ♄25 ♂30',
  '♀6 ☿12 ♃19 ♄25 ♂30',
  '♄6 ☿12 ♀20 ♃25 ♂30',
  '♀8 ♃14 ☿20 ♂25 ♄30',
];

const GLIFI: Readonly<Record<string, BodyId>> = {
  '☉': 'sole',
  '☽': 'luna',
  '☿': 'mercurio',
  '♀': 'venere',
  '♂': 'marte',
  '♃': 'giove',
  '♄': 'saturno',
};

function corpo(glifo: string): BodyId {
  const id = GLIFI[glifo];
  if (!id) throw new Error(`glifo sconosciuto: ${glifo}`);
  return id;
}

const TAVOLA = TERMINI.map((riga, i) => ({
  sign: ZODIAC_SIGNS[i] as ZodiacSign,
  termini: riga.split(' ').map((t) => [corpo([...t][0]!), Number(t.slice(1))] as const),
}));

function lon(sign: ZodiacSign, degree: number): number {
  return ZODIAC_SIGNS.indexOf(sign) * 30 + degree;
}

describe('i termini di Tolomeo, p. 106', () => {
  it('sono quelli della tavola, provati in ogni tratto e ai due bordi', () => {
    for (const riga of TAVOLA) {
      let inizio = 0;
      for (const [pianeta, fine] of riga.termini) {
        expect(ptolemyTermRuler(lon(riga.sign, inizio))).toBe(pianeta);
        expect(ptolemyTermRuler(lon(riga.sign, fine - 0.001))).toBe(pianeta);
        inizio = fine;
      }
      expect(inizio).toBe(30);
    }
  });

  it('danno in ogni segno un termine a ciascuno dei cinque pianeti, e nessuno ai luminari', () => {
    const cinque = ['giove', 'marte', 'mercurio', 'saturno', 'venere'];
    for (const riga of TAVOLA) {
      expect(riga.termini.map(([pianeta]) => pianeta).sort()).toEqual(cinque);
    }
  });

  it('hanno per pianeta le somme dei termini egizi, come dice Tolomeo a p. 103', () => {
    // Le somme le stampa l'apparato di p. 96 dopo la tavola egizia: Saturno
    // 57, Giove 79, Marte 66, Venere 82, Mercurio 76. Una cella letta male
    // le sposta.
    const somme: Record<string, number> = {};
    for (const riga of TAVOLA) {
      let inizio = 0;
      for (const [pianeta, fine] of riga.termini) {
        somme[pianeta] = (somme[pianeta] ?? 0) + fine - inizio;
        inizio = fine;
      }
    }
    expect(somme).toEqual({ saturno: 57, giove: 79, marte: 66, venere: 82, mercurio: 76 });
  });

  it("chiudono la Bilancia con Marte, dove l'HTML di LacusCurtius stampa Saturno", () => {
    expect(ptolemyTermRuler(lon('bilancia', 29))).toBe('marte');
  });

  it('nel Leone seguono la tavola, Giove primo, e lo dicono', () => {
    expect(ptolemyTermRuler(lon('leone', 0))).toBe('giove');
    expect(PTOLEMY_TERMS_SOURCE).toContain('Nel Leone la tavola mette primo Giove');
  });
});

describe('i triangoli, I.18', () => {
  it('hanno i loro signori, a prescindere dalla setta', () => {
    expect(ptolemyTriplicityLords('ariete')).toEqual(['sole', 'giove']);
    expect(ptolemyTriplicityLords('toro')).toEqual(['luna', 'venere']);
    expect(ptolemyTriplicityLords('gemelli')).toEqual(['saturno', 'mercurio']);
    expect(ptolemyTriplicityLords('cancro')).toEqual(['marte', 'luna', 'venere']);
  });

  it('sono governati secondo la setta, e nell\'acqua Marte col co-reggente', () => {
    expect(ptolemyTriplicityGovernors('leone', 'diurna')).toEqual(['sole']);
    expect(ptolemyTriplicityGovernors('leone', 'notturna')).toEqual(['giove']);
    expect(ptolemyTriplicityGovernors('vergine', 'diurna')).toEqual(['venere']);
    expect(ptolemyTriplicityGovernors('bilancia', 'notturna')).toEqual(['mercurio']);
    expect(ptolemyTriplicityGovernors('pesci', 'diurna')).toEqual(['marte', 'venere']);
    expect(ptolemyTriplicityGovernors('pesci', 'notturna')).toEqual(['marte', 'luna']);
  });
});

describe('le dignità di un corpo secondo Tolomeo', () => {
  it('sommano domicilio, esaltazione, triangolo, termine e caduta', () => {
    // Marte a 2 del Cancro: signore del triangolo d'acqua, nel suo termine,
    // e in caduta (esaltato nel Capricorno, I.19).
    expect(ptolemyDignitiesOf('marte', lon('cancro', 2))).toEqual(['triplicita', 'termine', 'caduta']);
    // Venere a 5 dei Pesci: esaltata, co-reggente dell'acqua, nel suo termine.
    expect(ptolemyDignitiesOf('venere', lon('pesci', 5))).toEqual(['esaltazione', 'triplicita', 'termine']);
    // Mercurio a 3 della Vergine: domicilio, esaltazione e termine; il
    // triangolo di terra è di Venere e della Luna.
    expect(ptolemyDignitiesOf('mercurio', lon('vergine', 3))).toEqual(['domicilio', 'esaltazione', 'termine']);
  });

  it('non hanno né esilio né faccia', () => {
    // Saturno nel Leone è in esilio per Lilly; per Tolomeo è solo nel suo termine.
    expect(ptolemyDignitiesOf('saturno', lon('leone', 15))).toEqual(['termine']);
  });

  it('non danno niente ai corpi fuori dai sette', () => {
    expect(ptolemyDignitiesOf('nodo-nord', lon('gemelli', 3))).toEqual([]);
    expect(ptolemyDignitiesOf('urano', lon('acquario', 3))).toEqual([]);
  });

  it('nominano i signori di un grado, e chi governa il triangolo solo con la setta', () => {
    expect(ptolemyRulersAt(lon('ariete', 18.5), 'diurna')).toEqual({
      domicilio: 'marte',
      esaltazione: 'sole',
      triplicita: ['sole', 'giove'],
      triplicitaDiSetta: ['sole'],
      termine: 'mercurio',
    });
    expect(ptolemyRulersAt(lon('leone', 1), undefined)).toEqual({
      domicilio: 'sole',
      triplicita: ['sole', 'giove'],
      termine: 'giove',
    });
  });
});

describe('il pacchetto di Tolomeo nel tema', () => {
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
    const testo = sezione(formatChartCompact(computeNatalChart(NAPOLI, { dignitySchool: 'tolomeo' })));
    expect(testo).toContain(`Tolomeo (a richiesta): ${PTOLEMY_SOURCE}`);
    expect(testo).toContain(PTOLEMY_TERMS_SOURCE);
    expect(testo).not.toContain('Lilly (a richiesta)');
    const prima = (t: string): string => t.slice(0, t.indexOf(t.includes('Tolomeo (a') ? 'Tolomeo (a' : 'Ricezioni:'));
    expect(prima(testo)).toBe(prima(comune));
  });

  it('dà a ogni corpo i signori del suo grado e le sue dignità', () => {
    // Marte a 18°31' dell'Ariete, tema diurno: domicilio suo, esaltazione del
    // Sole, triangolo del Sole e di Giove governato dal Sole, termine di
    // Mercurio.
    const testo = formatChartCompact(computeNatalChart(NAPOLI, { dignitySchool: 'tolomeo' }));
    expect(testo).toMatch(/^Marte\s+Marte\s+Sole\s+Sole\+Giove\s+Sole\s+Mercurio\s+\| domicilio$/m);
  });

  it('lascia le ricezioni alle tavole comuni, e dice perché', () => {
    const chart = computeNatalChart(NAPOLI, { dignitySchool: 'tolomeo' });
    expect(chart.dignities?.receptions.counted).toEqual(['domicilio', 'esaltazione']);
    expect(chart.dignities?.receptions.source).toBe(PTOLEMY_RECEPTION_SOURCE);
    expect(chart.dignities?.receptions.single).toEqual(computeNatalChart(NAPOLI).dignities?.receptions.single);
    expect(chart.dignities?.lilly).toBeUndefined();
  });

  it('sta nel JSON', () => {
    const chart = computeNatalChart(NAPOLI, { dignitySchool: 'tolomeo' });
    expect(chart.dignities?.tolomeo?.source).toBe(PTOLEMY_SOURCE);
    expect(chart.dignities?.tolomeo?.bodies.find((b) => b.id === 'marte')).toEqual({
      id: 'marte',
      name: 'Marte',
      rulers: {
        domicilio: 'marte',
        esaltazione: 'sole',
        triplicita: ['sole', 'giove'],
        triplicitaDiSetta: ['sole'],
        termine: 'mercurio',
      },
      dignities: ['domicilio'],
    });
  });

  it('non si chiede nel siderale', () => {
    expect(() => computeNatalChart(NAPOLI, { zodiac: 'siderale', dignitySchool: 'tolomeo' })).toThrow(
      expect.objectContaining({ code: 'ZODIACO_NON_TROPICALE' }),
    );
  });

  it("senza l'ora non dice chi governa il triangolo", () => {
    const chart = computeNatalChart({ ...NAPOLI, time: undefined }, { dignitySchool: 'tolomeo' });
    expect(chart.dignities?.tolomeo?.bodies.every((b) => b.rulers.triplicitaDiSetta === undefined)).toBe(true);
    expect(formatChartCompact(chart)).toContain("senza l'ora la setta manca, e chi lo governa non si dice");
  });

  it('vale anche per il cielo, senza condizioni', () => {
    const sky = computeSky({ date: '2026-10-29', time: '12:00', timezone: 'Europe/Rome' }, { dignitySchool: 'tolomeo' });
    expect(sky.dignities?.tolomeo?.bodies.length).toBeGreaterThan(0);
    expect(sky.dignities?.lilly).toBeUndefined();
  });
});
