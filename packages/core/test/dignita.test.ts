import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { DOMICILES, DOMICILE_SOURCES, domicileLord } from '../src/dignita.js';
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
    expect(DOMICILE_SOURCES.moderno).toContain('Plutone allo Scorpione senza un autore');
  });
});

describe('la tabella DOMICILI', () => {
  const testo = formatChartCompact(computeNatalChart(NAPOLI));
  const sezione = testo.slice(testo.indexOf('DOMICILI'));

  it('porta le due convenzioni, ciascuna con la sua fonte', () => {
    expect(sezione).toContain(`Tradizionale: ${DOMICILE_SOURCES.tradizionale}`);
    expect(sezione).toContain(`Moderno: ${DOMICILE_SOURCES.moderno}`);
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
    const parte = senzaOra.slice(senzaOra.indexOf('DOMICILI'));
    expect(parte).not.toContain('case');
    expect(parte).toMatch(/^Sco\s+Marte\s+Plutone$/m);
  });

  it('non compare nel tema vedico, che ha altri domicili', () => {
    const vedico = formatChartCompact(computeNatalChart(NAPOLI), { westernSections: false });
    expect(vedico).not.toContain('DOMICILI');
  });
});
