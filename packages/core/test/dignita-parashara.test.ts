import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import {
  computeParasharaDignities,
  parasharaDignityOf,
  parasharaExaltation,
  parasharaNodeDignities,
  parasharaSignDignities,
  parasharaSignLord,
} from '../src/dignita-parashara.js';
import { formatJyotishaCompact } from '../src/format.js';
import { computeJyotisha } from '../src/jyotisha.js';
import type { BirthData, BodyId, ZodiacSign } from '../src/types.js';

const NAPOLI: BirthData = {
  date: '1968-03-12',
  time: '14:30',
  latitude: 40.8518,
  longitude: 14.2681,
  timezone: 'Europe/Rome',
};

/** L'inizio del segno: Ariete 0, Toro 30, e così via. */
const SEGNI: readonly ZodiacSign[] = [
  'ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine',
  'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci',
];
const a = (sign: ZodiacSign, degree: number): number => SEGNI.indexOf(sign) * 30 + degree;

/**
 * BPHS 3.49-50, Santhanam vol. I pp. 38-39, ricopiato nell'ordine del verso
 * («dal Sole in poi») e non dal modulo, perché la prova ha senso solo se le
 * due tavole sono scritte indipendentemente.
 */
const VERSO_49_50: [BodyId, ZodiacSign, number][] = [
  ['sole', 'ariete', 10],
  ['luna', 'toro', 3],
  ['marte', 'capricorno', 28],
  ['mercurio', 'vergine', 15],
  ['giove', 'cancro', 5],
  ['venere', 'pesci', 27],
  ['saturno', 'bilancia', 20],
];

describe('uccha e neecha secondo Parashara', () => {
  it('coincidono con 3.49-50, graha per graha', () => {
    for (const [graha, segno, grado] of VERSO_49_50) {
      expect(parasharaExaltation(graha)).toEqual({ sign: segno, degree: grado });
    }
  });

  it('non mescolano i gradi occidentali: Sole a 10 e Giove a 5, non 19 e 15', () => {
    expect(parasharaExaltation('sole')?.degree).toBe(10);
    expect(parasharaExaltation('giove')?.degree).toBe(5);
  });

  it('mettono la debilitazione nel settimo segno', () => {
    expect(parasharaDignityOf('sole', a('bilancia', 10))).toBe('neecha');
    expect(parasharaDignityOf('saturno', a('ariete', 20))).toBe('neecha');
    expect(parasharaDignityOf('giove', a('capricorno', 5))).toBe('neecha');
    expect(parasharaDignityOf('luna', a('scorpione', 29))).toBe('neecha');
  });

  it('valgono per tutto il segno dove 3.51-54 non lo divide', () => {
    expect(parasharaDignityOf('sole', a('ariete', 0))).toBe('uccha');
    expect(parasharaDignityOf('sole', a('ariete', 29.9))).toBe('uccha');
    expect(parasharaDignityOf('venere', a('pesci', 1))).toBe('uccha');
  });

  it('col grado non ne danno ai nodi né ai pianeti moderni', () => {
    // 3.49-54 non nomina i nodi: le loro dignità sono di 47.35-36, solo per
    // segno, e stanno in `parasharaNodeDignities` (qui sotto).
    for (const corpo of ['nodo-nord', 'nodo-sud', 'urano', 'nettuno', 'plutone'] as const) {
      expect(parasharaExaltation(corpo)).toBeUndefined();
      for (let segno = 0; segno < 12; segno++) {
        expect(parasharaDignityOf(corpo, segno * 30 + 15)).toBeNull();
      }
    }
    // Plutone nello Scorpione è un domicilio moderno, non di Parashara.
    expect(parasharaDignityOf('plutone', a('scorpione', 10))).toBeNull();
  });
});

describe('i tratti di 3.51-54', () => {
  // Ogni confine provato da tutte e due le parti: il tratto comprende il suo
  // inizio e non la sua fine.
  it('Sole nel Leone: moolatrikona fino a 20, poi segno proprio', () => {
    expect(parasharaDignityOf('sole', a('leone', 0))).toBe('moolatrikona');
    expect(parasharaDignityOf('sole', a('leone', 19.99))).toBe('moolatrikona');
    expect(parasharaDignityOf('sole', a('leone', 20))).toBe('swakshetra');
  });

  it('Luna nel Toro: uccha nei primi 3, poi moolatrikona', () => {
    expect(parasharaDignityOf('luna', a('toro', 2.99))).toBe('uccha');
    expect(parasharaDignityOf('luna', a('toro', 3))).toBe('moolatrikona');
    expect(parasharaDignityOf('luna', a('toro', 29.99))).toBe('moolatrikona');
  });

  it('Marte nell\'Ariete: moolatrikona fino a 12', () => {
    expect(parasharaDignityOf('marte', a('ariete', 11.99))).toBe('moolatrikona');
    expect(parasharaDignityOf('marte', a('ariete', 12))).toBe('swakshetra');
  });

  it('Mercurio nella Vergine: uccha, moolatrikona, segno proprio', () => {
    expect(parasharaDignityOf('mercurio', a('vergine', 14.99))).toBe('uccha');
    expect(parasharaDignityOf('mercurio', a('vergine', 15))).toBe('moolatrikona');
    expect(parasharaDignityOf('mercurio', a('vergine', 19.99))).toBe('moolatrikona');
    expect(parasharaDignityOf('mercurio', a('vergine', 20))).toBe('swakshetra');
  });

  it('Giove nel Sagittario: il primo terzo, cioè dieci gradi', () => {
    expect(parasharaDignityOf('giove', a('sagittario', 9.99))).toBe('moolatrikona');
    expect(parasharaDignityOf('giove', a('sagittario', 10))).toBe('swakshetra');
  });

  it('Venere nella Bilancia: metà e metà', () => {
    expect(parasharaDignityOf('venere', a('bilancia', 14.99))).toBe('moolatrikona');
    expect(parasharaDignityOf('venere', a('bilancia', 15))).toBe('swakshetra');
  });

  it('Saturno nell\'Acquario come il Sole nel Leone', () => {
    expect(parasharaDignityOf('saturno', a('acquario', 19.99))).toBe('moolatrikona');
    expect(parasharaDignityOf('saturno', a('acquario', 20))).toBe('swakshetra');
  });
});

describe('i segni propri, da BPHS 4.6-24', () => {
  it('danno a ogni segno il suo signore', () => {
    const attesi: Record<ZodiacSign, BodyId> = {
      ariete: 'marte', toro: 'venere', gemelli: 'mercurio', cancro: 'luna',
      leone: 'sole', vergine: 'mercurio', bilancia: 'venere', scorpione: 'marte',
      sagittario: 'giove', capricorno: 'saturno', acquario: 'saturno', pesci: 'giove',
    };
    for (const segno of SEGNI) expect(parasharaSignLord(segno)).toBe(attesi[segno]);
  });

  it('fanno swakshetra il segno non diviso', () => {
    expect(parasharaDignityOf('marte', a('scorpione', 5))).toBe('swakshetra');
    expect(parasharaDignityOf('luna', a('cancro', 5))).toBe('swakshetra');
    expect(parasharaDignityOf('saturno', a('capricorno', 5))).toBe('swakshetra');
    expect(parasharaDignityOf('giove', a('pesci', 5))).toBe('swakshetra');
  });

  it('non danno niente dove non c\'è niente', () => {
    expect(parasharaDignityOf('giove', a('gemelli', 5))).toBeNull();
  });
});

describe('le corrispondenze per segno, che servono ai varga', () => {
  // Ricopiate qui dalle tavole di 3.49-54 e 4.6-24 e non ricavate dal
  // modulo: per ciascun graha, il segno di uccha, quello di moolatrikona, i
  // segni propri. La neecha è il settimo dall'uccha.
  const TAVOLA: Record<string, { uccha: ZodiacSign; moolatrikona: ZodiacSign; propri: ZodiacSign[] }> = {
    sole: { uccha: 'ariete', moolatrikona: 'leone', propri: ['leone'] },
    luna: { uccha: 'toro', moolatrikona: 'toro', propri: ['cancro'] },
    marte: { uccha: 'capricorno', moolatrikona: 'ariete', propri: ['ariete', 'scorpione'] },
    mercurio: { uccha: 'vergine', moolatrikona: 'vergine', propri: ['gemelli', 'vergine'] },
    giove: { uccha: 'cancro', moolatrikona: 'sagittario', propri: ['sagittario', 'pesci'] },
    venere: { uccha: 'pesci', moolatrikona: 'bilancia', propri: ['toro', 'bilancia'] },
    saturno: { uccha: 'bilancia', moolatrikona: 'acquario', propri: ['capricorno', 'acquario'] },
  };
  const SEGNI: ZodiacSign[] = ['ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine',
    'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci'];

  it('coincidono con le tavole, segno per segno e graha per graha', () => {
    for (const [graha, riga] of Object.entries(TAVOLA)) {
      const neecha = SEGNI[(SEGNI.indexOf(riga.uccha) + 6) % 12];
      for (const segno of SEGNI) {
        const attese = [
          ...(segno === riga.uccha ? ['uccha'] : []),
          ...(segno === riga.moolatrikona ? ['moolatrikona'] : []),
          ...(riga.propri.includes(segno) ? ['swakshetra'] : []),
          ...(segno === neecha ? ['neecha'] : []),
        ];
        expect(parasharaSignDignities(graha as BodyId, segno), `${graha} in ${segno}`).toEqual(attese);
      }
    }
  });

  it('le dà tutte, dove un segno ne ha più d una', () => {
    expect(parasharaSignDignities('sole', 'leone')).toEqual(['moolatrikona', 'swakshetra']);
    expect(parasharaSignDignities('luna', 'toro')).toEqual(['uccha', 'moolatrikona']);
    expect(parasharaSignDignities('mercurio', 'vergine')).toEqual(['uccha', 'moolatrikona', 'swakshetra']);
  });

  it('non ne dà ai nodi né ai pianeti esterni', () => {
    expect(parasharaSignDignities('nodo-nord', 'toro')).toEqual([]);
    expect(parasharaSignDignities('urano', 'acquario')).toEqual([]);
  });
});

/**
 * BPHS 47.35-36, Santhanam vol. II pp. 581-582, ricopiato dal verso:
 * «rāhos tu vṛṣabhaṃ ketor vṛścikaṃ tuṅgasaṃjñakam | mūlatrikoṇakaṃ jñeyaṃ
 * yugmaṃ cāpaṃ krameṇa ca || kumbhālī ca gṛhau proktau».
 */
const VERSO_47_35_36: [BodyId, ZodiacSign, ZodiacSign, ZodiacSign][] = [
  // nodo, uccha, moolatrikona, segno proprio
  ['nodo-nord', 'toro', 'gemelli', 'acquario'],
  ['nodo-sud', 'scorpione', 'sagittario', 'scorpione'],
];

describe('Rahu e Ketu secondo 47.35-36', () => {
  it('coincidono col verso, segno per segno, su tutto lo zodiaco', () => {
    for (const [nodo, uccha, moolatrikona, proprio] of VERSO_47_35_36) {
      for (const segno of SEGNI) {
        const attese = [
          ...(segno === uccha ? ['uccha'] : []),
          ...(segno === moolatrikona ? ['moolatrikona'] : []),
          ...(segno === proprio ? ['swakshetra'] : []),
        ];
        expect(parasharaNodeDignities(nodo, segno)).toEqual(attese);
      }
    }
  });

  it('per Ketu lo Scorpione è due cose insieme, e il motore non ne sceglie una', () => {
    expect(parasharaNodeDignities('nodo-sud', 'scorpione')).toEqual(['uccha', 'swakshetra']);
  });

  it('non danno neecha: il verso non dice il segno', () => {
    for (const [nodo] of VERSO_47_35_36) {
      for (const segno of SEGNI) expect(parasharaNodeDignities(nodo, segno)).not.toContain('neecha');
    }
  });

  it('non usano Vergine e Pesci, che il verso riferisce «secondo alcuni»', () => {
    expect(parasharaNodeDignities('nodo-nord', 'vergine')).toEqual([]);
    expect(parasharaNodeDignities('nodo-sud', 'pesci')).toEqual([]);
  });

  it('restano fuori dalle corrispondenze dei varga, che sono dei sette', () => {
    expect(parasharaSignDignities('nodo-nord', 'toro')).toEqual([]);
    expect(parasharaNodeDignities('sole', 'ariete')).toEqual([]);
  });
});

describe('nel tema vedico', () => {
  const carta = computeNatalChart(NAPOLI, { zodiac: 'siderale', houseSystem: 'segni-interi' });

  it('porta i sette graha con la dignità calcolata dalla loro longitudine, poi i nodi', () => {
    const dignita = computeParasharaDignities(carta);
    expect(dignita.school).toBe('parashara');
    expect(dignita.source).toContain('BPHS 3.49-54');
    expect(dignita.source).toContain('47.35-36');
    expect(dignita.grahas.map((graha) => graha.id)).toEqual([
      ...carta.bodies.map((body) => body.id).filter((id) =>
        ['sole', 'luna', 'mercurio', 'venere', 'marte', 'giove', 'saturno'].includes(id),
      ),
      'nodo-nord',
      'nodo-sud',
    ]);
    for (const graha of dignita.grahas.filter((g) => g.id === 'nodo-nord' || g.id === 'nodo-sud')) {
      const corpo = carta.bodies.find((body) => body.id === graha.id)!;
      expect(graha.name).toBe(graha.id === 'nodo-nord' ? 'Rahu' : 'Ketu');
      expect(graha.dignity).toBeNull();
      expect(graha.deepestDegree).toBeUndefined();
      expect(graha.signDignities).toEqual(parasharaNodeDignities(corpo.id, corpo.sign));
    }
    for (const graha of dignita.grahas.filter((g) => g.id !== 'nodo-nord' && g.id !== 'nodo-sud')) {
      expect(graha.signDignities).toBeUndefined();
      const corpo = carta.bodies.find((body) => body.id === graha.id)!;
      expect(graha.dignity).toBe(parasharaDignityOf(corpo.id, corpo.longitude));
      expect(graha.deepestDegree !== undefined).toBe(
        graha.dignity === 'uccha' || graha.dignity === 'neecha',
      );
    }
  });

  it('entra nel composto e nella tabella, con la fonte e i signori dei segni', () => {
    const vedico = computeJyotisha(carta);
    expect(vedico.dignities).toEqual(computeParasharaDignities(carta));

    const testo = formatJyotishaCompact(vedico);
    expect(testo).toContain('DIGNITÀ (PARASHARA)');
    expect(testo).toContain('Fonte: Parashara, BPHS');
    expect(testo).toContain('Signori dei segni: Ari Marte, Tor Venere');
    expect(testo).toContain(
      'Rahu e Ketu (47.35-36), per segno, senza gradi né neecha: Rahu uccha Tor, ' +
        'moolatrikona Gem, proprio Acq; Ketu uccha Sco, moolatrikona Sag, proprio Sco',
    );
    expect(testo).toMatch(/^Rahu {7}/m);
    expect(testo).toMatch(/^Ketu {7}/m);
    // La sezione occidentale non c'è: sarebbe un'altra scuola sugli stessi gradi.
    expect(testo).not.toContain('Domicili moderni');
  });
});
