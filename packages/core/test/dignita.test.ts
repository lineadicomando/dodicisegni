import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { ZODIAC_SIGNS } from '../src/constants.js';
import {
  detrimentsOf,
  dignitiesOf,
  DOMICILES,
  DOMICILE_SOURCES,
  domicileLord,
  exaltationOf,
  fallOf,
  receptionsOf,
} from '../src/dignita.js';
import { formatChartCompact } from '../src/format.js';
import type { BirthData, BodyId, ZodiacSign } from '../src/types.js';

const NAPOLI: BirthData = {
  date: '1968-03-12',
  time: '14:30',
  latitude: 40.8518,
  longitude: 14.2681,
  timezone: 'Europe/Rome',
};

/**
 * I domicili segno per segno, ricopiati da Tolomeo (Tetrabiblos I.17, Loeb
 * pp. 79-83) nel suo ordine e non dal modulo: la prova ha senso solo se le
 * due tavole sono scritte indipendentemente.
 */
const TOLOMEO: Readonly<Record<ZodiacSign, BodyId>> = {
  cancro: 'luna',
  leone: 'sole',
  gemelli: 'mercurio',
  vergine: 'mercurio',
  toro: 'venere',
  bilancia: 'venere',
  ariete: 'marte',
  scorpione: 'marte',
  sagittario: 'giove',
  pesci: 'giove',
  capricorno: 'saturno',
  acquario: 'saturno',
};

describe('i domicili tradizionali', () => {
  it('coincidono con la tavola della fonte, segno per segno', () => {
    expect(DOMICILES.tradizionale).toEqual(TOLOMEO);
  });

  it('danno due segni a ogni pianeta e uno a ciascun luminare', () => {
    const conteggio = new Map<BodyId, number>();
    for (const signore of Object.values(DOMICILES.tradizionale)) {
      conteggio.set(signore, (conteggio.get(signore) ?? 0) + 1);
    }
    expect(Object.fromEntries(conteggio)).toEqual({
      marte: 2,
      venere: 2,
      mercurio: 2,
      luna: 1,
      sole: 1,
      giove: 2,
      saturno: 2,
    });
  });
});

describe('i domicili moderni', () => {
  it('cambiano i signori di tre segni soli', () => {
    const diversi = (Object.keys(TOLOMEO) as ZodiacSign[])
      .filter((sign) => domicileLord(sign, 'moderno') !== domicileLord(sign, 'tradizionale'))
      .map((sign) => [sign, domicileLord(sign, 'moderno')]);
    expect(Object.fromEntries(diversi)).toEqual({
      scorpione: 'plutone',
      acquario: 'urano',
      pesci: 'nettuno',
    });
  });

  it('dicono che per Plutone allo Scorpione non c\'è un autore', () => {
    expect(DOMICILE_SOURCES.moderno).toContain('Plutone senza un autore');
  });
});

/**
 * Esaltazioni e cadute da Tolomeo, I.19 (Loeb pp. 89-91), per segno: la
 * caduta («depression») la scrive lui, pianeta per pianeta.
 */
const TOLOMEO_ESALTAZIONI: readonly [BodyId, ZodiacSign, ZodiacSign][] = [
  ['sole', 'ariete', 'bilancia'],
  ['luna', 'toro', 'scorpione'],
  ['saturno', 'bilancia', 'ariete'],
  ['giove', 'cancro', 'capricorno'],
  ['marte', 'capricorno', 'cancro'],
  ['venere', 'pesci', 'vergine'],
  ['mercurio', 'vergine', 'pesci'],
];

/** La colonna Detriment di Lilly, p. 104, segno per segno, dall'Ariete. */
const LILLY_DETRIMENT: readonly BodyId[] = [
  'venere',
  'marte',
  'giove',
  'saturno',
  'saturno',
  'giove',
  'marte',
  'venere',
  'mercurio',
  'luna',
  'sole',
  'mercurio',
];

describe('le esaltazioni e le cadute', () => {
  it('coincidono con Tolomeo, pianeta per pianeta', () => {
    for (const [corpo, esaltazione, caduta] of TOLOMEO_ESALTAZIONI) {
      expect(exaltationOf(corpo)).toBe(esaltazione);
      expect(fallOf(corpo)).toBe(caduta);
    }
  });

  it('non ne danno ai pianeti moderni né ai Nodi, che non hanno una tavola con un autore', () => {
    for (const corpo of ['urano', 'nettuno', 'plutone', 'nodo-nord', 'nodo-sud'] as const) {
      expect(exaltationOf(corpo)).toBeUndefined();
      expect(fallOf(corpo)).toBeUndefined();
    }
  });

  it('stanno solo nella convenzione tradizionale', () => {
    expect(dignitiesOf('sole', 'ariete', 'tradizionale')).toEqual(['esaltazione']);
    expect(dignitiesOf('sole', 'ariete', 'moderno')).toEqual([]);
  });
});

describe("l'esilio", () => {
  it('coincide con la colonna Detriment di Lilly, segno per segno', () => {
    for (const [i, corpo] of LILLY_DETRIMENT.entries()) {
      expect(detrimentsOf(corpo, 'tradizionale')).toContain(ZODIAC_SIGNS[i]);
    }
  });

  it('cambia con la convenzione: Saturno in Leone è in esilio solo per la tradizionale', () => {
    expect(dignitiesOf('saturno', 'leone', 'tradizionale')).toEqual(['esilio']);
    expect(dignitiesOf('saturno', 'leone', 'moderno')).toEqual([]);
    expect(detrimentsOf('plutone', 'moderno')).toEqual(['toro']);
    expect(detrimentsOf('plutone', 'tradizionale')).toEqual([]);
  });

  it('si somma alla caduta, come il domicilio all\'esaltazione', () => {
    expect(dignitiesOf('mercurio', 'pesci', 'tradizionale')).toEqual(['esilio', 'caduta']);
    expect(dignitiesOf('mercurio', 'vergine', 'tradizionale')).toEqual(['domicilio', 'esaltazione']);
  });
});

describe('la tabella DIGNITÀ', () => {
  const testo = formatChartCompact(computeNatalChart(NAPOLI));
  const sezione = testo.slice(testo.indexOf('DIGNITÀ'));

  it('porta le due convenzioni, ciascuna con la sua fonte', () => {
    expect(sezione).toContain(`Domicili tradizionali: ${DOMICILE_SOURCES.tradizionale}`);
    expect(sezione).toContain(`Domicili moderni: ${DOMICILE_SOURCES.moderno}`);
    expect(sezione).toContain('Tolomeo, Tetrabiblos I.19');
  });

  it('dice le dignità dei corpi, una riga per convenzione', () => {
    // A Napoli, il 12 marzo 1968: Marte e Saturno in Ariete.
    expect(sezione).toContain('Tradiz. — domicilio Marte; esaltazione —; esilio —; caduta Saturno');
    expect(sezione).toContain('Moderno — domicilio Marte; esilio —');
  });

  it('dà allo Scorpione due signori, uno per colonna', () => {
    expect(sezione).toMatch(/^Sco\s+Marte\s+Plutone\b/m);
  });

  it('assegna ogni casa una volta sola, dal segno della cuspide', () => {
    const chart = computeNatalChart(NAPOLI);
    const case_ = sezione
      .split('\n')
      .filter((riga) => /^[A-Z][a-z]{2} /.test(riga))
      .flatMap((riga) => riga.split(/\s+/).slice(3).filter((v) => v !== '—').map(Number));
    expect(case_.sort((a, b) => a - b)).toEqual(chart.houses.map((house) => house.number));
  });

  it('mette la decima sulla riga del segno del Medio Cielo', () => {
    // A Napoli, il 12 marzo 1968 alle 14:30, il Medio Cielo è in Ariete.
    expect(sezione).toMatch(/^Ari\s+Marte\s+Marte\s+10$/m);
  });

  it('senza ora non ha la colonna delle case', () => {
    const senzaOra = formatChartCompact(computeNatalChart({ ...NAPOLI, time: undefined }));
    const parte = senzaOra.slice(senzaOra.indexOf('DIGNITÀ'));
    expect(parte).not.toContain('case');
    expect(parte).toMatch(/^Sco\s+Marte\s+Plutone$/m);
  });

  it('impagina il JSON: le stesse dignità stanno in chart.dignities', () => {
    const chart = computeNatalChart(NAPOLI);
    expect(chart.dignities?.signLords.scorpione).toEqual({ tradizionale: 'marte', moderno: 'plutone' });
    expect(chart.dignities?.bodies.find((b) => b.id === 'saturno')?.dignities).toEqual({
      tradizionale: ['caduta'],
      moderno: [],
    });
    expect(chart.dignities?.receptions.counted).toEqual(['domicilio', 'esaltazione']);
    expect(chart.dignities?.lilly).toBeUndefined();
  });

  it('nel tema siderale non ci sono, né nel JSON né nella tabella', () => {
    const chart = computeNatalChart(NAPOLI, { zodiac: 'siderale' });
    expect(chart.dignities).toBeUndefined();
    expect(formatChartCompact(chart)).not.toContain('DIGNITÀ');
  });

  it('non compare nel tema vedico, che ha altri domicili', () => {
    const vedico = formatChartCompact(computeNatalChart(NAPOLI), { westernSections: false });
    expect(vedico).not.toContain('DIGNITÀ');
  });
});

/**
 * Lilly, p. 112: «as ☉ in ♈, and ♂ in ♌; here is reception of these two
 * Planets by Houses». La prova usa il suo esempio, non uno costruito qui.
 */
describe('le ricezioni', () => {
  it("riconoscono la mutua per domicilio dell'esempio di Lilly", () => {
    const { mutual } = receptionsOf([
      { id: 'sole', sign: 'ariete' },
      { id: 'marte', sign: 'leone' },
    ]);
    expect(mutual).toEqual([
      { bodies: ['sole', 'marte'], firstReceives: ['domicilio'], secondReceives: ['domicilio'] },
    ]);
  });

  it("del secondo esempio, che per Lilly è per triplicità, vedono solo ciò che le tavole hanno", () => {
    // ♀ in ♈ e ☉ in ♉: Venere riceve il Sole per domicilio, il Sole riceve
    // Venere per esaltazione. La triplicità è del pacchetto di Lilly
    // (`dignita-lilly.test.ts`): qui la mutua esce per le due dignità comuni.
    const { mutual } = receptionsOf([
      { id: 'venere', sign: 'ariete' },
      { id: 'sole', sign: 'toro' },
    ]);
    expect(mutual).toEqual([
      { bodies: ['venere', 'sole'], firstReceives: ['domicilio'], secondReceives: ['esaltazione'] },
    ]);
  });

  it('danno le semplici in un verso solo', () => {
    const { single, mutual } = receptionsOf([
      { id: 'saturno', sign: 'ariete' },
      { id: 'marte', sign: 'cancro' },
    ]);
    // Saturno in Ariete sta nel domicilio di Marte: Marte lo riceve. Marte in
    // Cancro non sta in nessuna dignità di Saturno.
    expect(single).toEqual([{ receiver: 'marte', received: 'saturno', by: ['domicilio'] }]);
    expect(mutual).toEqual([]);
  });

  it('possono essere per due dignità insieme', () => {
    // Mercurio in Vergine è nel domicilio e nell'esaltazione di sé stesso, e
    // non si riceve; ma la Luna in Vergine Mercurio la riceve per tutte e due.
    const { single } = receptionsOf([
      { id: 'mercurio', sign: 'gemelli' },
      { id: 'luna', sign: 'vergine' },
    ]);
    expect(single).toContainEqual({
      receiver: 'mercurio',
      received: 'luna',
      by: ['domicilio', 'esaltazione'],
    });
  });

  it('lasciano fuori i corpi senza domicili nelle tavole di Lilly', () => {
    const { single } = receptionsOf([
      { id: 'plutone', sign: 'leone' },
      { id: 'sole', sign: 'scorpione' },
      { id: 'nodo-nord', sign: 'leone' },
    ]);
    expect(single).toEqual([]);
  });

  it('stanno in fondo alla sezione, con la fonte', () => {
    const testo = formatChartCompact(computeNatalChart(NAPOLI));
    expect(testo).toContain('Ricezioni: Lilly, p. 112');
    // A Napoli il Sole è in Pesci e Giove in Leone: domicilio per domicilio.
    expect(testo).toMatch(/^Mutue — Sole e Giove \(domicilio \/ domicilio\)$/m);
    expect(testo).toContain('Venere riceve Sole (esaltazione)');
  });
});
