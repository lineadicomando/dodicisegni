import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { ZODIAC_SIGNS } from '../src/constants.js';
import {
  BONATTI_RECEPTION_SOURCE,
  BONATTI_SOURCE,
  BONATTI_TERMS_SOURCE,
  bonattiApplication,
  bonattiDignitiesOf,
  bonattiReceptionBy,
  bonattiReceptionsOf,
  bonattiExaltation,
  bonattiFaceRuler,
  bonattiFall,
  bonattiRulersAt,
  bonattiTermRuler,
  bonattiTriplicityGovernor,
  bonattiTriplicityLords,
} from '../src/dignita-bonatti.js';
import { ptolemyTermRuler } from '../src/dignita-tolomeo.js';
import { computeSky } from '../src/sky.js';
import { formatChartCompact } from '../src/format.js';
import type { BirthData, BodyId, ZodiacSign } from '../src/types.js';

/**
 * Le tavole di Bonatti, *Decem tractatus astronomiae* (Ratdolt 1491),
 * tratt. II, parte 2, ricopiate dalla stampa coi glifi (vedi
 * `trascrizioni.md` nella copia locale della fonte) e non dal modulo.
 *
 * I termini, cap. XIV, f. 19v: la stampa dà i gradi di ciascun tratto, e qui
 * sono scritti così, non sommati.
 */
const TERMINI: readonly string[] = [
  '♃6 ♀8 ☿7 ♂5 ♄4',
  '♀8 ☿7 ♃7 ♄2 ♂6',
  '☿7 ♃6 ♀7 ♂6 ♄4',
  '♂6 ♃7 ☿7 ♀7 ♄3',
  '♄6 ☿7 ♂5 ♀6 ♃6',
  '☿7 ♀6 ♃5 ♄6 ♂6',
  '♄6 ♀5 ☿5 ♃8 ♂6',
  '♂6 ♀7 ♃8 ☿6 ♄3',
  '♃8 ♀6 ☿5 ♄6 ♂5',
  '♀6 ☿6 ♃7 ♄6 ♂5',
  '♄6 ☿6 ♀8 ♃5 ♂5',
  '♀8 ♃6 ☿6 ♂5 ♄5',
];

/** Le facce, cap. XVII, f. 21r, tre per segno dall'Ariete. */
const FACCE: readonly string[] = [
  '♂☉♀',
  '☿☽♄',
  '♃♂☉',
  '♀☿☽',
  '♄♃♂',
  '☉♀☿',
  '☽♄♃',
  '♂☉♀',
  '☿☽♄',
  '♃♂☉',
  '♀☿☽',
  '♄♃♂',
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

describe('i termini di Bonatti, cap. XIV', () => {
  it('sono quelli della tavola, provati in ogni tratto e ai due bordi', () => {
    for (const riga of TAVOLA) {
      let inizio = 0;
      for (const [pianeta, gradi] of riga.termini) {
        const fine = inizio + gradi;
        expect(bonattiTermRuler(lon(riga.sign, inizio))).toBe(pianeta);
        expect(bonattiTermRuler(lon(riga.sign, fine - 0.001))).toBe(pianeta);
        inizio = fine;
      }
      expect(inizio).toBe(30);
    }
  });

  it('hanno le somme che Bonatti stampa: Saturno 57, Giove 79, Marte 66, Venere 82, Mercurio 76', () => {
    const somme: Record<string, number> = {};
    for (const riga of TAVOLA) {
      for (const [pianeta, gradi] of riga.termini) somme[pianeta] = (somme[pianeta] ?? 0) + gradi;
    }
    expect(somme).toEqual({ saturno: 57, giove: 79, marte: 66, venere: 82, mercurio: 76 });
  });

  it('coincidono con la tavola greca di Robbins fuori dal Leone, e nel Leone no', () => {
    for (let grado = 0; grado < 360; grado += 0.5) {
      if (ZODIAC_SIGNS[Math.floor(grado / 30)] === 'leone') continue;
      expect(bonattiTermRuler(grado)).toBe(ptolemyTermRuler(grado));
    }
    // Cap. XV: «primus terminus leonis assignatus fuit saturno … in leone
    // ubi iupiter locatur postremus».
    expect(bonattiTermRuler(lon('leone', 0))).toBe('saturno');
    expect(bonattiTermRuler(lon('leone', 29))).toBe('giove');
    expect(ptolemyTermRuler(lon('leone', 0))).toBe('giove');
    expect(BONATTI_TERMS_SOURCE).toContain('nel Leone Saturno è primo e Giove ultimo');
  });
});

describe('le facce di Bonatti, cap. XVII', () => {
  it('sono quelle della tavola, dieci gradi ciascuna', () => {
    FACCE.forEach((riga, i) => {
      const sign = ZODIAC_SIGNS[i] as ZodiacSign;
      [...riga].forEach((glifo, j) => {
        expect(bonattiFaceRuler(lon(sign, j * 10))).toBe(corpo(glifo));
        expect(bonattiFaceRuler(lon(sign, j * 10 + 9.999))).toBe(corpo(glifo));
      });
    });
  });
});

describe('esaltazioni e cadute, capp. VIII e X', () => {
  it('portano il grado, Nodi compresi', () => {
    const attese: [BodyId, ZodiacSign, number][] = [
      ['sole', 'ariete', 19],
      ['luna', 'toro', 3],
      ['saturno', 'bilancia', 21],
      ['giove', 'cancro', 15],
      ['marte', 'capricorno', 28],
      ['venere', 'pesci', 27],
      ['mercurio', 'vergine', 15],
      ['nodo-nord', 'gemelli', 3],
      ['nodo-sud', 'sagittario', 3],
    ];
    for (const [corpo, sign, degree] of attese) expect(bonattiExaltation(corpo)).toEqual({ sign, degree });
    expect(bonattiExaltation('urano')).toBeUndefined();
  });

  it('mettono la caduta nel segno opposto, e la Testa del Drago cade nel Sagittario', () => {
    expect(bonattiFall('sole')).toBe('bilancia');
    expect(bonattiFall('marte')).toBe('cancro');
    // «Caput draconis cadit in sagittario: cauda in geminis».
    expect(bonattiFall('nodo-nord')).toBe('sagittario');
    expect(bonattiFall('nodo-sud')).toBe('gemelli');
    expect(bonattiFall('plutone')).toBeUndefined();
  });
});

describe('le triplicità, cap. XI', () => {
  it('hanno tre signori: di giorno, di notte e il partecipe', () => {
    expect(bonattiTriplicityLords('leone')).toEqual({ diurno: 'sole', notturno: 'giove', partecipe: 'saturno' });
    expect(bonattiTriplicityLords('capricorno')).toEqual({ diurno: 'venere', notturno: 'luna', partecipe: 'marte' });
    expect(bonattiTriplicityLords('acquario')).toEqual({ diurno: 'saturno', notturno: 'mercurio', partecipe: 'giove' });
    // Nell'acqua Venere di giorno e Marte di notte: né Tolomeo né Lilly.
    expect(bonattiTriplicityLords('scorpione')).toEqual({ diurno: 'venere', notturno: 'marte', partecipe: 'luna' });
  });

  it('sono governate dal signore della setta', () => {
    expect(bonattiTriplicityGovernor('pesci', 'diurna')).toBe('venere');
    expect(bonattiTriplicityGovernor('pesci', 'notturna')).toBe('marte');
  });
});

describe('le dignità di un corpo secondo Bonatti', () => {
  it('sommano le cinque dignità e le due debilità', () => {
    // La Luna a 25 dello Scorpione: partecipe dell'acqua, e in caduta; la
    // terza faccia è di Venere. A 25 del Cancro: domicilio, triplicità e la
    // terza faccia, sua.
    expect(bonattiDignitiesOf('luna', lon('scorpione', 25))).toEqual(['triplicita', 'caduta']);
    expect(bonattiDignitiesOf('luna', lon('cancro', 25))).toEqual(['domicilio', 'triplicita', 'faccia']);
    // Saturno a 2 del Leone: partecipe del fuoco, nel suo termine e nella sua
    // faccia, e in esilio.
    expect(bonattiDignitiesOf('saturno', lon('leone', 2))).toEqual(['triplicita', 'termine', 'faccia', 'esilio']);
    // Mercurio a 3 della Vergine: domicilio, esaltazione, termine; la terra è
    // di Venere, della Luna e di Marte, e la prima faccia del Sole.
    expect(bonattiDignitiesOf('mercurio', lon('vergine', 3))).toEqual(['domicilio', 'esaltazione', 'termine']);
  });

  it('danno ai Nodi esaltazione e caduta, e niente agli altri corpi', () => {
    expect(bonattiDignitiesOf('nodo-nord', lon('gemelli', 10))).toEqual(['esaltazione']);
    expect(bonattiDignitiesOf('nodo-nord', lon('sagittario', 10))).toEqual(['caduta']);
    expect(bonattiDignitiesOf('urano', lon('acquario', 3))).toEqual([]);
  });

  it('nominano i signori di un grado, e chi governa la triplicità solo con la setta', () => {
    expect(bonattiRulersAt(lon('ariete', 18.5), 'diurna')).toEqual({
      domicilio: 'marte',
      esaltazione: 'sole',
      triplicita: { diurno: 'sole', notturno: 'giove', partecipe: 'saturno' },
      triplicitaDiSetta: 'sole',
      termine: 'mercurio',
      faccia: 'sole',
    });
    expect(bonattiRulersAt(lon('gemelli', 1), undefined)).toEqual({
      domicilio: 'mercurio',
      esaltazione: 'nodo-nord',
      triplicita: { diurno: 'saturno', notturno: 'mercurio', partecipe: 'giove' },
      termine: 'mercurio',
      faccia: 'giove',
    });
  });
});

describe('il pacchetto di Bonatti nel tema', () => {
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
    const testo = sezione(formatChartCompact(computeNatalChart(NAPOLI, { dignitySchool: 'bonatti' })));
    expect(testo).toContain(`Bonatti (a richiesta): ${BONATTI_SOURCE}`);
    expect(testo).toContain(BONATTI_TERMS_SOURCE);
    expect(testo).not.toContain('Lilly (a richiesta)');
    expect(testo).not.toContain('Tolomeo (a richiesta)');
    const prima = (t: string): string => t.slice(0, t.indexOf(t.includes('Bonatti (a') ? 'Bonatti (a' : 'Ricezioni:'));
    expect(prima(testo)).toBe(prima(comune));
  });

  it('dà a ogni corpo i signori del suo grado e le sue dignità', () => {
    // Marte a 18°31' dell'Ariete, tema diurno: domicilio suo, esaltazione del
    // Sole, triplicità del Sole, di Giove e di Saturno governata dal Sole,
    // termine di Mercurio, seconda faccia, del Sole.
    const testo = formatChartCompact(computeNatalChart(NAPOLI, { dignitySchool: 'bonatti' }));
    expect(testo).toMatch(/^Marte\s+Marte\s+Sole\s+Sole\+Giove\+Saturno\s+Sole\s+Mercurio\s+Sole\s+\| domicilio$/m);
  });

  it('porta le ricezioni di Bonatti, che nascono da un\'applicazione', () => {
    const chart = computeNatalChart(NAPOLI, { dignitySchool: 'bonatti' });
    const ricezioni = chart.dignities!.receptions;
    expect(ricezioni.counted).toEqual(['domicilio', 'esaltazione', 'triplicita', 'termine', 'faccia']);
    expect(ricezioni.source).toBe(BONATTI_RECEPTION_SOURCE);
    expect(ricezioni.mutual).toEqual([]);
    expect(ricezioni.single).toEqual(bonattiReceptionsOf(chart.bodies));
    for (const r of ricezioni.single) expect(r.application, `${r.receiver} ${r.received}`).toBeDefined();
    expect(chart.dignities?.lilly).toBeUndefined();
    expect(chart.dignities?.tolomeo).toBeUndefined();
  });

  it('sta nel JSON', () => {
    const chart = computeNatalChart(NAPOLI, { dignitySchool: 'bonatti' });
    expect(chart.dignities?.bonatti?.source).toBe(BONATTI_SOURCE);
    expect(chart.dignities?.bonatti?.bodies.find((b) => b.id === 'marte')).toEqual({
      id: 'marte',
      name: 'Marte',
      rulers: {
        domicilio: 'marte',
        esaltazione: 'sole',
        triplicita: { diurno: 'sole', notturno: 'giove', partecipe: 'saturno' },
        triplicitaDiSetta: 'sole',
        termine: 'mercurio',
        faccia: 'sole',
      },
      dignities: ['domicilio'],
    });
  });

  it('non si chiede nel siderale', () => {
    expect(() => computeNatalChart(NAPOLI, { zodiac: 'siderale', dignitySchool: 'bonatti' })).toThrow(
      expect.objectContaining({ code: 'ZODIACO_NON_TROPICALE' }),
    );
  });

  it("senza l'ora non dice chi governa la triplicità", () => {
    const chart = computeNatalChart({ ...NAPOLI, time: undefined }, { dignitySchool: 'bonatti' });
    expect(chart.dignities?.bonatti?.bodies.every((b) => b.rulers.triplicitaDiSetta === undefined)).toBe(true);
    expect(formatChartCompact(chart)).toContain("senza l'ora la setta manca, e chi la governa non si dice");
  });

  it('vale anche per il cielo, senza condizioni', () => {
    const sky = computeSky({ date: '2026-10-30', time: '12:00', timezone: 'Europe/Rome' }, { dignitySchool: 'bonatti' });
    expect(sky.dignities?.bonatti?.bodies.length).toBeGreaterThan(0);
    expect(sky.dignities?.lilly).toBeUndefined();
  });
});

describe('la ricezione di Bonatti, tratt. III, parte 2', () => {
  /** Una longitudine tropicale: segno e grado. */
  const lon = (segno: ZodiacSign, grado: number) => ZODIAC_SIGNS.indexOf(segno) * 30 + grado;
  /** Un corpo con quel che le funzioni guardano. */
  const corpo = (id: BodyId, segno: ZodiacSign, grado: number) =>
    ({ id, name: id, longitude: lon(segno, grado) }) as Parameters<typeof bonattiReceptionsOf>[0][number];

  it('rifà l\'esempio dell\'applicazione, cap. 4 (PDF p. 158)', () => {
    // «ponatur quod sit venus vel mercurius in quarto gradu arietis et mars
    // vel iupiter vel saturnus sit in decimo gradu geminorum vel cancri vel
    // leonis ante se: vel sit in decimo gradu aquarij vel capricorni vel
    // sagittarij post se».
    const venere = { longitude: lon('ariete', 4) };
    const attesi = { gemelli: 'sestile', cancro: 'quadrato', leone: 'trigono', acquario: 'sestile', capricorno: 'quadrato', sagittario: 'trigono' } as const;
    for (const [segno, aspetto] of Object.entries(attesi) as [ZodiacSign, string][]) {
      expect(bonattiApplication(venere, { longitude: lon(segno, 10) }), segno).toEqual({ aspect: aspetto, distance: 6 });
    }
    // E per corpo, nello stesso segno, fino al minuto esatto.
    expect(bonattiApplication(venere, { longitude: lon('ariete', 10) })?.aspect).toBe('congiunzione');
    expect(bonattiApplication(venere, { longitude: lon('ariete', 4) })?.distance).toBe(0);
  });

  it('non si applica oltre sei gradi, da dietro, né per opposizione', () => {
    const venere = { longitude: lon('ariete', 4) };
    expect(bonattiApplication(venere, { longitude: lon('gemelli', 10.01) })).toBeUndefined();
    expect(bonattiApplication(venere, { longitude: lon('gemelli', 3.99) })).toBeUndefined();
    expect(bonattiApplication(venere, { longitude: lon('bilancia', 8) })).toBeUndefined();
    expect(bonattiApplication(venere, { longitude: lon('toro', 8) })).toBeUndefined();
  });

  it('rifà l\'esempio della Luna a 3° dell\'Ariete (PDF p. 168)', () => {
    // La ricevono Marte (domicilio), il Sole (esaltazione) e Giove, «dominus
    // primi termini arietis et … etiam dominus triplicitatis»; Saturno, che ha
    // solo la triplicità, no.
    const luna = lon('ariete', 3);
    expect(bonattiReceptionBy('marte', luna)).toContain('domicilio');
    expect(bonattiReceptionBy('sole', luna)).toContain('esaltazione');
    expect(bonattiReceptionBy('giove', luna)).toEqual(['triplicita', 'termine']);
    expect(bonattiReceptionBy('saturno', luna)).toEqual([]);
  });

  it('dà al più pesante il più leggero che gli si applica, mai il contrario', () => {
    const ricezioni = bonattiReceptionsOf([
      corpo('luna', 'ariete', 3),
      corpo('giove', 'gemelli', 7), // sestile, 4°, termine e triplicità: riceve
      corpo('saturno', 'cancro', 8), // quadrato, 5°, solo la triplicità: no
      corpo('marte', 'bilancia', 5), // alla Luna in opposizione: no
    ]);
    expect(ricezioni).toEqual([
      { receiver: 'giove', received: 'luna', by: ['triplicita', 'termine'], application: { aspect: 'sestile', distance: 4 } },
      // Marte a 5° della Bilancia, in quadrato a Saturno tre gradi più avanti,
      // sta nella sua esaltazione (e nella triplicità e nel termine): basta.
      // A Giove si applica per trigono, ma lì Giove ha solo la triplicità.
      {
        receiver: 'saturno',
        received: 'marte',
        by: ['esaltazione', 'triplicita', 'termine'],
        application: { aspect: 'quadrato', distance: 3 },
      },
    ]);
    // Saturno a 3° dell'Ariete e la Luna dopo di lui: Saturno non si applica.
    expect(bonattiReceptionsOf([corpo('saturno', 'ariete', 1), corpo('marte', 'ariete', 5)])).toEqual([]);
  });
});
