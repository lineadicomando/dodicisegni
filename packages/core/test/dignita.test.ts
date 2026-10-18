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

  it('non compare nel tema vedico, che ha altri domicili', () => {
    const vedico = formatChartCompact(computeNatalChart(NAPOLI), { westernSections: false });
    expect(vedico).not.toContain('DIGNITÀ');
  });
});
