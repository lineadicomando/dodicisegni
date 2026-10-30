import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { ChartError } from '../src/errors.js';
import { formatVargaCompact } from '../src/format.js';
import { HORA_CONVENTIONS, horaOf } from '../src/hora.js';
import { parasharaSignDignities } from '../src/dignita-parashara.js';
import { computeVarga, SHASHTIAMSA_NAMES, shashtiamsaOf, VARGAS, vargaSignOf } from '../src/varga.js';
import type { BirthData, VargaId } from '../src/types.js';

const NASCITA: BirthData = {
  date: '1968-03-12',
  time: '14:30',
  latitude: 40.8518,
  longitude: 14.2681,
  timezone: 'Europe/Rome',
};

const tema = () => computeNatalChart(NASCITA, { zodiac: 'siderale' });

/** L'inizio del segno numero `n`, contando l'Ariete come 0. */
const inizioSegno = (n: number): number => n * 30;

describe('D-1, che non divide niente', () => {
  it('restituisce il segno stesso', () => {
    expect(vargaSignOf(0, 'd1')).toBe('ariete');
    expect(vargaSignOf(200, 'd1')).toBe('bilancia');
  });
});

describe('D-3, che procede per trigoni', () => {
  it('manda i tre decani al segno, al quinto e al nono', () => {
    expect([0, 10, 20].map((d) => vargaSignOf(d, 'd3'))).toEqual([
      'ariete',
      'leone',
      'sagittario',
    ]);
    // Da un segno d'acqua i trigoni sono d'acqua.
    expect([90, 100, 110].map((d) => vargaSignOf(d, 'd3'))).toEqual([
      'cancro',
      'scorpione',
      'pesci',
    ]);
  });
});

const SEGNI = ['ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine', 'bilancia',
  'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci'];

/**
 * Confronta un varga con una tavola stampata: per ogni segno (la chiave, 1-12)
 * i segni delle sue parti, dalla prima all'ultima, come numeri 1-12. Prende il
 * punto di mezzo di ciascuna parte, lontano dai confini.
 */
function controllaTavola(id: VargaId, parti: number, tavola: Record<number, number[]>): void {
  const ampiezza = 30 / parti;
  for (const [segno, colonna] of Object.entries(tavola)) {
    expect(colonna).toHaveLength(parti);
    colonna.forEach((atteso, k) => {
      const longitudine = inizioSegno(Number(segno) - 1) + (k + 0.5) * ampiezza;
      expect(vargaSignOf(longitudine, id), `${id}, segno ${segno}, parte ${k + 1}`).toBe(SEGNI[atteso - 1]);
    });
  }
}

describe('D-4, che procede per kendra', () => {
  // BPHS 6.9, trad. Santhanam, vol. I, p. 70; tavola a p. 71.
  it('manda i quarti al segno, al quarto, al settimo e al decimo', () => {
    expect([0, 7.5, 15, 22.5].map((d) => vargaSignOf(d + 1, 'd4'))).toEqual([
      'ariete', 'cancro', 'bilancia', 'capricorno',
    ]);
    // Da un segno pari la regola è la stessa: niente biforcazione.
    expect([0, 7.5, 15, 22.5].map((d) => vargaSignOf(30 + d + 1, 'd4'))).toEqual([
      'toro', 'leone', 'scorpione', 'acquario',
    ]);
  });

  it("cambia parte a 7°30'", () => {
    expect(vargaSignOf(7.5 - 1e-6, 'd4')).toBe('ariete');
    expect(vargaSignOf(7.5 + 1e-6, 'd4')).toBe('cancro');
  });

  it('coincide con la tavola di Santhanam, p. 71', () => {
    // «Speculum Of Chaturthamsas», le dodici colonne.
    controllaTavola('d4', 4, {
      1: [1, 4, 7, 10], 2: [2, 5, 8, 11], 3: [3, 6, 9, 12], 4: [4, 7, 10, 1],
      5: [5, 8, 11, 2], 6: [6, 9, 12, 3], 7: [7, 10, 1, 4], 8: [8, 11, 2, 5],
      9: [9, 12, 3, 6], 10: [10, 1, 4, 7], 11: [11, 2, 5, 8], 12: [12, 3, 6, 9],
    });
  });
});

describe('D-7, che si biforca su pari e dispari', () => {
  // BPHS 6.10-11, trad. Santhanam, vol. I, p. 71, con la tavola.
  const parte = 30 / 7;

  it('parte dal segno nei dispari e dal settimo nei pari', () => {
    expect(vargaSignOf(inizioSegno(0), 'd7')).toBe('ariete'); // Ariete, dispari
    expect(vargaSignOf(inizioSegno(1), 'd7')).toBe('scorpione'); // Toro, pari
    expect(vargaSignOf(inizioSegno(11), 'd7')).toBe('vergine'); // Pesci, pari
  });

  it("cambia parte ogni 4°17'8,57\"", () => {
    expect(vargaSignOf(parte - 1e-6, 'd7')).toBe('ariete');
    expect(vargaSignOf(parte + 1e-6, 'd7')).toBe('toro');
    expect(vargaSignOf(29.99, 'd7')).toBe('bilancia');
    expect(vargaSignOf(59.99, 'd7')).toBe('toro');
  });

  it('coincide con la tavola di Santhanam, p. 71', () => {
    // «Speculum Of Sapthamamsas», le dodici colonne.
    controllaTavola('d7', 7, {
      1: [1, 2, 3, 4, 5, 6, 7], 2: [8, 9, 10, 11, 12, 1, 2],
      3: [3, 4, 5, 6, 7, 8, 9], 4: [10, 11, 12, 1, 2, 3, 4],
      5: [5, 6, 7, 8, 9, 10, 11], 6: [12, 1, 2, 3, 4, 5, 6],
      7: [7, 8, 9, 10, 11, 12, 1], 8: [2, 3, 4, 5, 6, 7, 8],
      9: [9, 10, 11, 12, 1, 2, 3], 10: [4, 5, 6, 7, 8, 9, 10],
      11: [11, 12, 1, 2, 3, 4, 5], 12: [6, 7, 8, 9, 10, 11, 12],
    });
  });
});

describe('D-9, che parte da dove dice la modalità', () => {
  it('apre ogni segno dove la regola vuole', () => {
    // Cardinali dal segno stesso, fissi dal nono, mobili dal quinto: detto
    // altrimenti, fuoco dall'Ariete, terra dal Capricorno, aria dalla
    // Bilancia, acqua dal Cancro. Le due formulazioni devono coincidere, e
    // questa prova è ciò che lo garantisce.
    const aperture = Array.from({ length: 12 }, (_, i) => vargaSignOf(inizioSegno(i), 'd9'));

    expect(aperture).toEqual([
      'ariete', // Ariete, cardinale di fuoco
      'capricorno', // Toro, fisso di terra
      'bilancia', // Gemelli, mobile d'aria
      'cancro', // Cancro, cardinale d'acqua
      'ariete', // Leone, fisso di fuoco
      'capricorno', // Vergine, mobile di terra
      'bilancia', // Bilancia, cardinale d'aria
      'cancro', // Scorpione, fisso d'acqua
      'ariete', // Sagittario, mobile di fuoco
      'capricorno', // Capricorno, cardinale di terra
      'bilancia', // Acquario, fisso d'aria
      'cancro', // Pesci, mobile d'acqua
    ]);
  });

  it('chiude ogni segno nove parti più avanti', () => {
    // L'ultimo navamsa dell'Ariete è il nono dall'Ariete, cioè il Sagittario.
    expect(vargaSignOf(29.99, 'd9')).toBe('sagittario');
    // E quello dei Pesci chiude il giro dei centootto.
    expect(vargaSignOf(359.99, 'd9')).toBe('pesci');
  });

  it("cambia navamsa ogni 3°20'", () => {
    expect(vargaSignOf(3.33, 'd9')).toBe('ariete');
    expect(vargaSignOf(3.34, 'd9')).toBe('toro');
  });
});

describe('D-10, che si biforca su pari e dispari', () => {
  it('parte dal segno nei dispari e dal nono nei pari', () => {
    expect(vargaSignOf(inizioSegno(0), 'd10')).toBe('ariete'); // Ariete, dispari
    expect(vargaSignOf(inizioSegno(1), 'd10')).toBe('capricorno'); // Toro, pari
    expect(vargaSignOf(inizioSegno(2), 'd10')).toBe('gemelli'); // Gemelli, dispari
  });

  it('cambia parte ogni 3°', () => {
    expect(vargaSignOf(2.9, 'd10')).toBe('ariete');
    expect(vargaSignOf(3.1, 'd10')).toBe('toro');
  });
});

describe('D-12, che parte sempre dal segno stesso', () => {
  it("avanza di un segno ogni 2°30'", () => {
    expect(vargaSignOf(0, 'd12')).toBe('ariete');
    expect(vargaSignOf(2.6, 'd12')).toBe('toro');
    expect(vargaSignOf(29.9, 'd12')).toBe('pesci');
    // Anche da un segno pari: qui non c'è biforcazione.
    expect(vargaSignOf(inizioSegno(1), 'd12')).toBe('toro');
  });
});

/**
 * Una tavola di Santhanam per i varga che partono da segni fissi.
 *
 * Le tavole del D-16, del D-20 e del D-24 hanno dodici righe («1st/13th»,
 * «2nd/14th»…) e una colonna per gruppo di segni: la parte k prende la riga
 * k modulo 12. Qui le colonne si ricopiano come stampate, numeri 1-12, e si
 * stendono sui segni del gruppo.
 */
function tavolaPerGruppi(gruppi: { segni: number[]; colonna: number[] }[], parti: number) {
  const tavola: Record<number, number[]> = {};
  for (const { segni, colonna } of gruppi) {
    expect(colonna).toHaveLength(12);
    for (const segno of segni) {
      tavola[segno] = Array.from({ length: parti }, (_, k) => colonna[k % 12] as number);
    }
  }
  return tavola;
}

const CARDINALI = [1, 4, 7, 10];
const FISSI = [2, 5, 8, 11];
const MOBILI = [3, 6, 9, 12];

describe('D-16, che parte da tre segni secondo la modalità', () => {
  // BPHS 6.16, trad. Santhanam, vol. I, pp. 74-75.
  const parte = 30 / 16;

  it('apre i cardinali dall Ariete, i fissi dal Leone, i mobili dal Sagittario', () => {
    const aperture = Array.from({ length: 12 }, (_, i) => vargaSignOf(inizioSegno(i), 'd16'));
    expect(aperture).toEqual([
      'ariete', 'leone', 'sagittario', 'ariete', 'leone', 'sagittario',
      'ariete', 'leone', 'sagittario', 'ariete', 'leone', 'sagittario',
    ]);
  });

  it("cambia parte ogni 1°52'30\", e la sedicesima chiude quattro segni dopo l'apertura", () => {
    expect(vargaSignOf(parte - 1e-6, 'd16')).toBe('ariete');
    expect(vargaSignOf(parte + 1e-6, 'd16')).toBe('toro');
    expect(vargaSignOf(29.99, 'd16')).toBe('cancro');
    // Toro, pari e fisso: dal Leone allo Scorpione. La parità non conta.
    expect(vargaSignOf(30 + 1e-6, 'd16')).toBe('leone');
    expect(vargaSignOf(59.99, 'd16')).toBe('scorpione');
  });

  it('coincide con la tavola di Santhanam, p. 75', () => {
    // «Speculum of Shodasamsas (or Kalamsas)», le tre colonne.
    controllaTavola('d16', 16, tavolaPerGruppi([
      { segni: CARDINALI, colonna: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { segni: FISSI, colonna: [5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4] },
      { segni: MOBILI, colonna: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8] },
    ], 16));
  });
});

describe('D-20, con fissi e mobili scambiati rispetto al D-16', () => {
  // BPHS 6.17-21, trad. Santhanam, vol. I, pp. 76-77.
  const parte = 30 / 20;

  it('apre i cardinali dall Ariete, i fissi dal Sagittario, i mobili dal Leone', () => {
    const aperture = Array.from({ length: 12 }, (_, i) => vargaSignOf(inizioSegno(i), 'd20'));
    expect(aperture).toEqual([
      'ariete', 'sagittario', 'leone', 'ariete', 'sagittario', 'leone',
      'ariete', 'sagittario', 'leone', 'ariete', 'sagittario', 'leone',
    ]);
  });

  it("cambia parte ogni 1°30'", () => {
    expect(vargaSignOf(parte - 1e-6, 'd20')).toBe('ariete');
    expect(vargaSignOf(parte + 1e-6, 'd20')).toBe('toro');
    // La ventesima è l'ottava dall'apertura: lo Scorpione per l'Ariete, il
    // Cancro per il Toro, che parte dal Sagittario.
    expect(vargaSignOf(29.99, 'd20')).toBe('scorpione');
    expect(vargaSignOf(59.99, 'd20')).toBe('cancro');
  });

  it('coincide con la tavola di Santhanam, pp. 76-77', () => {
    // «Speculum of Vimsamsas», le tre colonne.
    controllaTavola('d20', 20, tavolaPerGruppi([
      { segni: CARDINALI, colonna: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { segni: FISSI, colonna: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8] },
      { segni: MOBILI, colonna: [5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4] },
    ], 20));
  });
});

describe('D-24, che parte dal Leone o dal Cancro secondo la parità', () => {
  // BPHS 6.22-23, trad. Santhanam, vol. I, pp. 77-78.
  const parte = 30 / 24;

  it('apre i dispari dal Leone e i pari dal Cancro', () => {
    const aperture = Array.from({ length: 12 }, (_, i) => vargaSignOf(inizioSegno(i), 'd24'));
    expect(aperture).toEqual(Array.from({ length: 12 }, (_, i) => (i % 2 === 0 ? 'leone' : 'cancro')));
  });

  it("cambia parte ogni 1°15'", () => {
    expect(vargaSignOf(parte - 1e-6, 'd24')).toBe('leone');
    expect(vargaSignOf(parte + 1e-6, 'd24')).toBe('vergine');
    // La ventiquattresima chiude il secondo giro un segno prima dell'apertura.
    expect(vargaSignOf(29.99, 'd24')).toBe('cancro');
    expect(vargaSignOf(59.99, 'd24')).toBe('gemelli');
  });

  it('coincide con la tavola di Santhanam, p. 78', () => {
    // «Speculum of Siddhamsa», le colonne «Odd» ed «Even».
    controllaTavola('d24', 24, tavolaPerGruppi([
      { segni: [1, 3, 5, 7, 9, 11], colonna: [5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4] },
      { segni: [2, 4, 6, 8, 10, 12], colonna: [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3] },
    ], 24));
  });
});

describe('D-27, che conta di seguito dall Ariete', () => {
  // BPHS 6.24-26, trad. Santhanam, vol. I, pp. 78-79.
  const parte = 30 / 27;

  it('apre ogni segno dove dice l elemento', () => {
    // Fuoco dall'Ariete, terra dal Cancro, aria dalla Bilancia, acqua dal
    // Capricorno: la riga «1st» della tavola di Santhanam, p. 79.
    const aperture = Array.from({ length: 12 }, (_, i) => vargaSignOf(inizioSegno(i), 'd27'));
    expect(aperture).toEqual([
      'ariete', 'cancro', 'bilancia', 'capricorno',
      'ariete', 'cancro', 'bilancia', 'capricorno',
      'ariete', 'cancro', 'bilancia', 'capricorno',
    ]);
  });

  it("cambia parte ogni 1°6'40\", in un segno dispari e in uno pari", () => {
    // Ariete, dispari: parti 1, 2, 3 all'Ariete, al Toro, ai Gemelli; la
    // ventisettesima ai Gemelli, perché 27 fa 3 modulo 12.
    expect(vargaSignOf(0.5 * parte, 'd27')).toBe('ariete');
    expect(vargaSignOf(1.5 * parte, 'd27')).toBe('toro');
    expect(vargaSignOf(2.5 * parte, 'd27')).toBe('gemelli');
    expect(vargaSignOf(26.5 * parte, 'd27')).toBe('gemelli');
    // Ai due lati del confine fra la prima e la seconda parte.
    expect(vargaSignOf(parte - 1e-6, 'd27')).toBe('ariete');
    expect(vargaSignOf(parte + 1e-6, 'd27')).toBe('toro');
    // Toro, pari: dal Cancro, e l'ultima parte alla Vergine; i Gemelli
    // ripartono dalla Bilancia, il segno dopo, perché il conto non si
    // interrompe.
    expect(vargaSignOf(30 + 0.5 * parte, 'd27')).toBe('cancro');
    expect(vargaSignOf(30 + 26.5 * parte, 'd27')).toBe('vergine');
    expect(vargaSignOf(60 + 0.5 * parte, 'd27')).toBe('bilancia');
  });

  it('coincide con la tavola di Santhanam, refuso escluso', () => {
    // Le colonne di p. 79 per Ariete, Toro, Gemelli e Cancro, dalla prima
    // alla dodicesima parte (le righe si ripetono ogni dodici). Ai Gemelli,
    // undicesima parte, la stampa dice 3: la regola dà 5, come la colonna
    // della Bilancia, che è lo stesso conto.
    const tavola: Record<number, number[]> = {
      0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      1: [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3],
      2: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6],
      3: [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
    const segni = ['ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine', 'bilancia',
      'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci'];
    for (const [segno, colonna] of Object.entries(tavola)) {
      colonna.forEach((atteso, k) => {
        expect(vargaSignOf(inizioSegno(Number(segno)) + (k + 0.5) * parte, 'd27')).toBe(
          segni[atteso - 1],
        );
      });
    }
  });
});

describe('D-30, che abbandona le parti uguali', () => {
  it('divide i segni dispari in cinque tratti disuguali', () => {
    // 5° Marte, 5° Saturno, 8° Giove, 7° Mercurio, 5° Venere, ciascuno col
    // proprio segno dispari.
    expect([3, 7, 14, 20, 27].map((d) => vargaSignOf(d, 'd30'))).toEqual([
      'ariete',
      'acquario',
      'sagittario',
      'gemelli',
      'bilancia',
    ]);
  });

  it('rovescia l\'ordine nei segni pari, coi segni pari degli stessi pianeti', () => {
    expect([3, 7, 14, 22, 27].map((d) => vargaSignOf(30 + d, 'd30'))).toEqual([
      'toro',
      'vergine',
      'pesci',
      'capricorno',
      'scorpione',
    ]);
  });

  it('non è una divisione in trenta parti uguali', () => {
    // La prova che il varga sia quello giusto e non un trentesimo regolare: a
    // 14° un trentesimo uguale sarebbe alla quindicesima parte, qui siamo
    // ancora dentro gli otto gradi di Giove.
    expect(vargaSignOf(11, 'd30')).toBe(vargaSignOf(17, 'd30'));
    expect(vargaSignOf(9, 'd30')).not.toBe(vargaSignOf(11, 'd30'));
  });
});

describe('D-40, che parte dall Ariete o dalla Bilancia secondo la parità', () => {
  // BPHS 6.29-30, trad. Santhanam, vol. I, pp. 80-81.
  const parte = 30 / 40;

  it('apre i dispari dall Ariete e i pari dalla Bilancia', () => {
    const aperture = Array.from({ length: 12 }, (_, i) => vargaSignOf(inizioSegno(i), 'd40'));
    expect(aperture).toEqual(Array.from({ length: 12 }, (_, i) => (i % 2 === 0 ? 'ariete' : 'bilancia')));
  });

  it("cambia parte ogni 45'", () => {
    expect(vargaSignOf(parte - 1e-6, 'd40')).toBe('ariete');
    expect(vargaSignOf(parte + 1e-6, 'd40')).toBe('toro');
    // La quarantesima è la quarta dall'apertura: il Cancro per l'Ariete, il
    // Capricorno per il Toro, che parte dalla Bilancia.
    expect(vargaSignOf(29.99, 'd40')).toBe('cancro');
    expect(vargaSignOf(59.99, 'd40')).toBe('capricorno');
  });

  it('coincide con la tavola di Santhanam, p. 81', () => {
    // «Speculum of Chatvarimsamsa»: una colonna per segno, righe «1st, 13th,
    // 25th, 37th»…; i dispari stampano 1-12, i pari 7-12 e 1-6.
    controllaTavola('d40', 40, tavolaPerGruppi([
      { segni: [1, 3, 5, 7, 9, 11], colonna: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { segni: [2, 4, 6, 8, 10, 12], colonna: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6] },
    ], 40));
  });
});

describe('D-45, con la forma del D-16', () => {
  // BPHS 6.31-32, trad. Santhanam, vol. I, pp. 81-82.
  const parte = 30 / 45;

  it('apre i cardinali dall Ariete, i fissi dal Leone, i mobili dal Sagittario', () => {
    const aperture = Array.from({ length: 12 }, (_, i) => vargaSignOf(inizioSegno(i), 'd45'));
    expect(aperture).toEqual([
      'ariete', 'leone', 'sagittario', 'ariete', 'leone', 'sagittario',
      'ariete', 'leone', 'sagittario', 'ariete', 'leone', 'sagittario',
    ]);
  });

  it("cambia parte ogni 40'", () => {
    expect(vargaSignOf(parte - 1e-6, 'd45')).toBe('ariete');
    expect(vargaSignOf(parte + 1e-6, 'd45')).toBe('toro');
    // La quarantacinquesima è la nona dall'apertura.
    expect(vargaSignOf(29.99, 'd45')).toBe('sagittario');
    expect(vargaSignOf(59.99, 'd45')).toBe('ariete');
  });

  it('coincide con la tavola di Santhanam, p. 82', () => {
    // «Speculum of Akshavedamsa»: le colonne dei segni 1, 2 e 3; le altre
    // le ripetono ogni tre.
    controllaTavola('d45', 45, tavolaPerGruppi([
      { segni: CARDINALI, colonna: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { segni: FISSI, colonna: [5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4] },
      { segni: MOBILI, colonna: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8] },
    ], 45));
  });
});

describe('D-60, che conta dal segno stesso', () => {
  // BPHS 6.33, trad. Santhanam, vol. I, pp. 82-83.
  it("rifà l'esempio di Santhanam: Venere a 13°25' del Capricorno è nei Pesci", () => {
    // 13°25' per 2 fa 26°50'; 26 diviso 12 dà resto 2, più 1 fa 3: il
    // terzo segno contando dal Capricorno. Dall'Ariete sarebbero i Gemelli.
    expect(vargaSignOf(inizioSegno(9) + 13 + 25 / 60, 'd60')).toBe('pesci');
  });

  it('cambia segno ogni mezzo grado, dal segno stesso anche nei pari', () => {
    expect(vargaSignOf(0.5 - 1e-6, 'd60')).toBe('ariete');
    expect(vargaSignOf(0.5 + 1e-6, 'd60')).toBe('toro');
    // Il Toro comincia dal Toro: il rovesciamento nei pari riguarda i nomi.
    expect(vargaSignOf(inizioSegno(1) + 0.25, 'd60')).toBe('toro');
    expect(vargaSignOf(inizioSegno(1) + 0.75, 'd60')).toBe('gemelli');
    // Sessanta parti fanno cinque giri: l'ultima è il segno prima di sé.
    expect(vargaSignOf(inizioSegno(1) + 29.9, 'd60')).toBe('ariete');
  });
});

/**
 * La tavola dei nomi del D-60, Santhanam, vol. I, pp. 84-86, ricopiata
 * dall'immagine: per ogni nome l'inizio del tratto nei segni dispari e in
 * quelli pari, in gradi, come stampati. Al n. 14 la colonna dei pari dice
 * «23°23°30'», con il trattino caduto: è 23°-23°30'.
 */
const TAVOLA_D60: readonly [nome: string, dispari: number, pari: number][] = [
  ['Ghora', 0, 29.5], ['Rakshasa', 0.5, 29], ['Deva', 1, 28.5], ['Kubera', 1.5, 28], ['Yaksha', 2, 27.5],
  ['Kinnara', 2.5, 27], ['Bhrashta', 3, 26.5], ['Kulaghna', 3.5, 26], ['Garala', 4, 25.5], ['Vahni', 4.5, 25],
  ['Maya', 5, 24.5], ['Purishaka', 5.5, 24], ['Apampathi', 6, 23.5], ['Marut', 6.5, 23], ['Kaala', 7, 22.5],
  ['Sarpa', 7.5, 22], ['Amrita', 8, 21.5], ['Indu', 8.5, 21], ['Mridu', 9, 20.5], ['Komala', 9.5, 20],
  ['Heramba', 10, 19.5], ['Brahma', 10.5, 19], ['Vishnu', 11, 18.5], ['Maheswara', 11.5, 18], ['Deva', 12, 17.5],
  ['Ardra', 12.5, 17], ['Kalinasa', 13, 16.5], ['Kshiteesa', 13.5, 16], ['Kamalakara', 14, 15.5], ['Gulika', 14.5, 15],
  ['Mrithyu', 15, 14.5], ['Kaala', 15.5, 14], ['Davagani', 16, 13.5], ['Ghora', 16.5, 13], ['Yama', 17, 12.5],
  ['Kantaka', 17.5, 12], ['Sudha', 18, 11.5], ['Amrita', 18.5, 11], ['Poornachandra', 19, 10.5], ['Vishadagdha', 19.5, 10],
  ['Kulanasa', 20, 9.5], ['Vamsakshaya', 20.5, 9], ['Utpata', 21, 8.5], ['Kaala', 21.5, 8], ['Saumya', 22, 7.5],
  ['Komala', 22.5, 7], ['Seetala', 23, 6.5], ['Karaladamshtra', 23.5, 6], ['Chandramukhi', 24, 5.5], ['Praveena', 24.5, 5],
  ['Kala Pavaka', 25, 4.5], ['Dandayudha', 25.5, 4], ['Nirmala', 26, 3.5], ['Saumya', 26.5, 3], ['Kroora', 27, 2.5],
  ['Atiseetala', 27.5, 2], ['Amrita', 28, 1.5], ['Payodhi', 28.5, 1], ['Bhramana', 29, 0.5], ['Chandra Rekha', 29.5, 0],
];

describe('i nomi del D-60, rovesciati nei segni pari', () => {
  // BPHS 6.34-40, trad. Santhanam, vol. I, pp. 82-86.
  it('sono sessanta, e combaciano con la tavola di pp. 84-86 riga per riga', () => {
    expect(SHASHTIAMSA_NAMES).toHaveLength(60);
    TAVOLA_D60.forEach(([nome, dispari, pari], i) => {
      // A metà del tratto, nell'Ariete (dispari) e nel Toro (pari).
      expect(shashtiamsaOf(dispari + 0.25), `n. ${i + 1}, dispari`).toEqual({ part: i + 1, number: i + 1, name: nome });
      expect(shashtiamsaOf(inizioSegno(1) + pari + 0.25), `n. ${i + 1}, pari`).toEqual({
        part: 60 - i,
        number: i + 1,
        name: nome,
      });
    });
  });

  it("rovescia i nomi e non i segni: la Venere dell'esempio è in Ghora, nei Pesci", () => {
    // Capricorno, segno pari: 13°25' è il ventisettesimo mezzo grado, e al
    // rovescio il trentaquattresimo nome, il secondo Ghora.
    const venere = inizioSegno(9) + 13 + 25 / 60;
    expect(shashtiamsaOf(venere)).toEqual({ part: 27, number: 34, name: 'Ghora' });
    expect(vargaSignOf(venere, 'd60')).toBe('pesci');
  });

  it('arrivano nella carta del D-60 e in nessun altra, per i graha e per il lagna', () => {
    const carta = tema();
    const d60 = computeVarga(carta, 'd60');
    if (d60.kind !== 'segni') throw new Error('il D-60 ha segni');
    for (const posizione of d60.positions) {
      const corpo = carta.bodies.find((body) => body.id === posizione.id)!;
      expect(posizione.shashtiamsa, posizione.id).toEqual(shashtiamsaOf(corpo.longitude));
    }
    expect(d60.ascendantShashtiamsa).toEqual(shashtiamsaOf(carta.angles!.ascendant));
    expect(d60.shashtiamsaSource).toContain('6.34-40');
    expect(d60.shashtiamsaSource).toContain('non è riportato');

    const d45 = computeVarga(carta, 'd45');
    if (d45.kind !== 'segni') throw new Error('il D-45 ha segni');
    expect(d45.shashtiamsaSource).toBeUndefined();
    expect(d45.ascendantShashtiamsa).toBeUndefined();
    expect(d45.positions.every((posizione) => posizione.shashtiamsa === undefined)).toBe(true);
  });
});

/** Sposta un'ora `HH:mm` di un numero di secondi, e la scrive `HH:mm:ss`. */
function spostaOra(ora: string, secondi: number): string {
  const [h, m] = ora.split(':').map(Number) as [number, number];
  const totale = Math.round(h * 3600 + m * 60 + secondi);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(totale / 3600))}:${pad(Math.floor((totale % 3600) / 60))}:${pad(totale % 60)}`;
}

/** I minuti di una durata scritta dall'avvertenza, «1,3 minuti» o «40 secondi». */
function minutiDi(testo: string): number {
  const [numero, unita] = testo.split(' ') as [string, string];
  const valore = Number(numero.replace(',', '.'));
  return unita.startsWith('second') ? valore / 60 : valore;
}

describe('i varga fini, che vogliono l ora al minuto', () => {
  it('portano un avvertenza solo loro, e il tema vedico la riporta', () => {
    const carta = tema();
    for (const id of ['d24', 'd27', 'd40', 'd45', 'd60'] as const) {
      expect(computeVarga(carta, id).warnings, id).toHaveLength(1);
    }
    expect(computeVarga(carta, 'd30').warnings).toBeUndefined();
    expect(computeVarga(carta, 'd20').warnings).toBeUndefined();
    expect(computeVarga(carta, 'd24').warnings![0]).toContain("una parte è di 1°15' d'arco");
    expect(computeVarga(carta, 'd27').warnings![0]).toContain(`una parte è di 1°6'40" d'arco`);
    expect(computeVarga(carta, 'd60').warnings![0]).toContain("una parte è di 30' d'arco");
    expect(formatVargaCompact(computeVarga(carta, 'd60'))).toContain('Avvertenza: Il D60');
  });

  it("dice di quanto l'ora può sbagliare, e il lagna cambia davvero lì", () => {
    const carta = tema();
    const [avviso] = computeVarga(carta, 'd60').warnings!;
    const durate = /anticipata di ([\d,]+ \w+) o posticipata di ([\d,]+ \w+)/.exec(avviso!);
    expect(durate, avviso).not.toBeNull();
    const [prima, dopo] = [minutiDi(durate![1]!), minutiDi(durate![2]!)];
    const lagnaAlle = (secondi: number) =>
      computeVarga(computeNatalChart({ ...NASCITA, time: spostaOra(NASCITA.time!, secondi) }, { zodiac: 'siderale' }), 'd60')
        .ascendant;
    const qui = computeVarga(carta, 'd60').ascendant;

    // Un po' prima del confine il lagna è ancora quello, un po' oltre no. Il
    // margine del 15% copre l'arrotondamento a un decimale e la velocità
    // presa come costante.
    expect(lagnaAlle(-prima * 60 * 0.85)).toBe(qui);
    expect(lagnaAlle(-prima * 60 * 1.15 - 2)).not.toBe(qui);
    expect(lagnaAlle(dopo * 60 * 0.85)).toBe(qui);
    expect(lagnaAlle(dopo * 60 * 1.15 + 2)).not.toBe(qui);
  });

  it("dà all'Ascendente la velocità che ha davvero", () => {
    const carta = tema();
    const [avviso] = computeVarga(carta, 'd60').warnings!;
    const parte = minutiDi(/ne percorre una in circa ([\d,]+ \w+)/.exec(avviso!)![1]!);
    const dopo = computeNatalChart({ ...NASCITA, time: '14:40' }, { zodiac: 'siderale' });
    const gradiAlMinuto = (dopo.angles!.ascendant - carta.angles!.ascendant) / 10;
    // La cifra è scritta a un decimale e la velocità vera è una media su dieci
    // minuti: basta che stiano entro il tre per cento.
    expect(Math.abs(parte - 0.5 / gradiAlMinuto) / parte).toBeLessThan(0.03);
  });

  it("senza ora di nascita dice che il segno della Luna non è determinato", () => {
    const { time: _ora, ...senzaOra } = NASCITA;
    const carta = computeNatalChart(senzaOra, { zodiac: 'siderale' });
    const [avviso] = computeVarga(carta, 'd60').warnings!;
    expect(avviso).toContain('non ha lagna');
    expect(avviso).toMatch(/circa 2\d parti/);
  });
});

describe('D-2, la hora, con due convenzioni', () => {
  // BPHS 6.5-6, trad. Santhanam, vol. I, pp. 68-69; la lettura Leone-Cancro
  // è quella corrente, che nessun classico enuncia. Vedi `hora.ts`.

  it('dà Sole, Luna, Luna, Sole a 10° e 20° di Ariete e Toro', () => {
    // I casi di controllo scelti con la decisione del 27 ottobre 2026.
    expect([10, 20, 40, 50].map(horaOf)).toEqual(['sole', 'luna', 'luna', 'sole']);
  });

  it('coincide con la tavola di Santhanam, p. 69', () => {
    // «Speculum Of Horas»: nei segni dispari 0-15° al Sole e 15-30° alla
    // Luna, nei pari il contrario, per tutti e dodici.
    for (let segno = 0; segno < 12; segno += 1) {
      const dispari = segno % 2 === 0;
      expect(horaOf(inizioSegno(segno) + 7.5), `segno ${segno + 1}`).toBe(dispari ? 'sole' : 'luna');
      expect(horaOf(inizioSegno(segno) + 22.5), `segno ${segno + 1}`).toBe(dispari ? 'luna' : 'sole');
    }
    // Ai due lati del confine di metà segno.
    expect(horaOf(15 - 1e-6)).toBe('sole');
    expect(horaOf(15 + 1e-6)).toBe('luna');
  });

  it('con Parashara non ha segni, e vargaSignOf lo dice invece di inventarne uno', () => {
    expect(() => vargaSignOf(10, 'd2')).toThrow(ChartError);
    try {
      vargaSignOf(10, 'd2', 'parashara');
    } catch (errore) {
      expect((errore as ChartError).code).toBe('VARGA_SENZA_SEGNI');
    }
  });

  it('con Leone-Cancro manda la hora del Sole al Leone e quella della Luna al Cancro', () => {
    expect([10, 20, 40, 50].map((l) => vargaSignOf(l, 'd2', 'leone-cancro'))).toEqual([
      'leone', 'cancro', 'cancro', 'leone',
    ]);
  });

  it('esce senza segni con Parashara, la predefinita, e porta la convenzione', () => {
    const carta = tema();
    const d2 = computeVarga(carta, 'd2');

    expect(d2.kind).toBe('signori');
    if (d2.kind !== 'signori') return;
    expect(d2.convention.id).toBe('parashara');
    expect(d2.convention.source).toContain('6.5-6');
    expect(d2.rule).toContain('non un segno');
    for (const body of carta.bodies) {
      expect(d2.positions.find((p) => p.id === body.id)?.hora).toBe(horaOf(body.longitude));
    }
    expect(d2.ascendant).toBe(horaOf(carta.angles!.ascendant));
    expect(d2.positions[0]).not.toHaveProperty('sign');
  });

  it('esce coi segni con Leone-Cancro, e lo dichiara', () => {
    const carta = tema();
    const d2 = computeVarga(carta, 'd2', { hora: 'leone-cancro' });

    expect(d2.kind).toBe('segni');
    if (d2.kind !== 'segni') return;
    expect(d2.convention?.id).toBe('leone-cancro');
    expect(d2.convention?.source).toContain('nessun classico');
    for (const position of d2.positions) {
      expect(['leone', 'cancro']).toContain(position.sign);
    }
  });

  it('nella resa compatta dice il luminare per esteso, e la convenzione con la fonte', () => {
    const testo = formatVargaCompact(computeVarga(tema(), 'd2'));
    expect(testo).toContain('HORA (D2)');
    expect(testo).toContain('Convenzione: Parashara. Fonte: Brihat Parashara Hora Shastra 6.5-6');
    expect(testo).toMatch(/^Sole +hora della? (Sole|Luna)$/m);
    expect(testo).not.toMatch(/ (leone|cancro)$/m);

    const conSegni = formatVargaCompact(computeVarga(tema(), 'd2', { hora: 'leone-cancro' }));
    expect(conSegni).toContain('Convenzione: Leone e Cancro.');
    expect(conSegni).toMatch(/^Sole +(leone|cancro)$/m);
  });

  it('non tocca gli altri varga, qualunque convenzione si chieda', () => {
    const carta = tema();
    const d9 = computeVarga(carta, 'd9', { hora: 'leone-cancro' });
    expect(d9).toEqual(computeVarga(carta, 'd9'));
    expect(d9).not.toHaveProperty('convention');
  });
});

describe('D-2, le convenzioni moderne con un segno', () => {
  // Le tavole e gli esempi delle fonti, in `texts/jyotisha/`: Rao 2003
  // (parivritti-dvaya e Kashinatha), Suprajarama 2005, Rao 2012
  // (Uma-Shambhu). Ogni riga: il segno, poi i segni della prima e della
  // seconda metà.
  const SEGNI = ['ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine', 'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci'] as const;
  const ABBR: Record<string, (typeof SEGNI)[number]> = {
    Ar: 'ariete', Ta: 'toro', Ge: 'gemelli', Cn: 'cancro', Le: 'leone', Vi: 'vergine',
    Li: 'bilancia', Sc: 'scorpione', Sg: 'sagittario', Cp: 'capricorno', Aq: 'acquario', Pi: 'pesci',
  };
  /** Le due metà di ogni segno secondo una convenzione, nella forma «Ar Ar/Ta». */
  const tavola = (hora: Parameters<typeof vargaSignOf>[2]) =>
    SEGNI.map((_, i) => [vargaSignOf(i * 30 + 7, 'd2', hora), vargaSignOf(i * 30 + 22, 'd2', hora)]);
  const leggi = (righe: string) =>
    righe.trim().split(/\s*,\s*/).map((riga) => riga.split(' ')[1]!.split('/').map((a) => ABBR[a]));

  it('parivritti-dvaya: due giri dall Ariete, come la descrive Rao (2003)', () => {
    // «the two parts of Aries go into Aries and Taurus; the two parts of
    // Taurus go into Gemini and Cancer; … Cancer go into Libra and Scorpio».
    expect(tavola('parivritti-dvaya').slice(0, 4)).toEqual(leggi('Ar Ar/Ta, Ta Ge/Cn, Ge Le/Vi, Cn Li/Sc'));
    expect(tavola('parivritti-dvaya')[11]).toEqual(['acquario', 'pesci']);
  });

  it('Uma-Shambhu: la tavola di Rao (2012), p. 3', () => {
    expect(tavola('uma-shambhu')).toEqual(
      leggi('Ar Ar/Ta, Ta Cn/Ge, Ge Le/Vi, Cn Sc/Li, Le Sg/Cp, Vi Pi/Aq, Li Ar/Ta, Sc Cn/Ge, Sg Le/Vi, Cp Sc/Li, Aq Sg/Cp, Pi Pi/Aq'),
    );
  });

  it('Suprajarama: la tavola del post del 2005', () => {
    expect(tavola('suprajarama')).toEqual(
      leggi('Ar Sc/Cp, Ta Ta/Pi, Ge Vi/Ar, Cn Cn/Li, Le Le/Ge, Vi Ge/Cn, Li Li/Le, Sc Ar/Vi, Sg Pi/Ta, Cp Cp/Sc, Aq Aq/Sg, Pi Sg/Aq'),
    );
  });

  it('Kashinatha: gli esempi del testo di Rao (2003) e la sua carta 1', () => {
    const k = (gradi: number, segno: (typeof SEGNI)[number]) => vargaSignOf(SEGNI.indexOf(segno) * 30 + gradi, 'd2', 'kashinatha');
    // Nel testo: Giove a 25°16' del Toro → Bilancia; Marte a 18°53' del
    // Sagittario → Sagittario.
    expect(k(25 + 16 / 60, 'toro')).toBe('bilancia');
    expect(k(18 + 53 / 60, 'sagittario')).toBe('sagittario');
    // La carta 1, D-2 (Kn), 7 aprile 1893 (p. 4 del PDF, letta
    // sull'immagine): le posizioni della rashi e il segno del D-2.
    const carta1: [number, (typeof SEGNI)[number], (typeof SEGNI)[number]][] = [
      [26 + 23 / 60, 'toro', 'bilancia'], // As
      [25 + 13 / 60, 'pesci', 'pesci'], // Su
      [29 + 47 / 60, 'scorpione', 'scorpione'], // Mo
      [13 + 47 / 60, 'toro', 'toro'], // Ma
      [14 + 34 / 60, 'pesci', 'sagittario'], // Me
      [10 + 36 / 60, 'ariete', 'scorpione'], // Ju
      [18 + 39 / 60, 'pesci', 'pesci'], // Ve
      [16 + 27 / 60, 'vergine', 'vergine'], // Sa
      [7 + 3 / 60, 'ariete', 'scorpione'], // Ra
      [7 + 3 / 60, 'bilancia', 'bilancia'], // Ke
      [14 + 44 / 60, 'cancro', 'cancro'], // HL, la hora lagna
      [29 + 15 / 60, 'sagittario', 'sagittario'], // GL, la ghati lagna
    ];
    for (const [gradi, segno, d2] of carta1) expect(k(gradi, segno), `${gradi} ${segno}`).toBe(d2);
  });

  it('Kashinatha: il Leone e il Cancro fanno coppia, come dice Rao', () => {
    // «Leo and Cancer form a pair»: la hora del Sole al Leone, quella della
    // Luna al Cancro. PyJHora manda invece tutto il Leone al Leone.
    expect(tavola('kashinatha')[3]).toEqual(['cancro', 'leone']);
    expect(tavola('kashinatha')[4]).toEqual(['leone', 'cancro']);
    // Il segno coincide con la hora: diurno col Sole, notturno con la Luna.
    const diurni = ['leone', 'vergine', 'bilancia', 'scorpione', 'acquario', 'pesci'];
    for (let l = 1; l < 360; l += 2) {
      expect(diurni.includes(vargaSignOf(l, 'd2', 'kashinatha')), `${l}`).toBe(horaOf(l) === 'sole');
    }
  });

  it('Uma-Shambhu: il genere del segno di arrivo è la hora di Parashara', () => {
    // È il punto dell'articolo: dispari = Sole, pari = Luna.
    for (let l = 1; l < 360; l += 2) {
      const arrivo = SEGNI.indexOf(vargaSignOf(l, 'd2', 'uma-shambhu') as (typeof SEGNI)[number]);
      expect(arrivo % 2 === 0, `${l}`).toBe(horaOf(l) === 'sole');
    }
  });

  it('ogni convenzione con un segno esce come un varga coi segni, e porta la sua fonte', () => {
    const carta = tema();
    for (const convenzione of HORA_CONVENTIONS.filter((c) => c.signOf)) {
      const d2 = computeVarga(carta, 'd2', { hora: convenzione.id });
      expect(d2.kind, convenzione.id).toBe('segni');
      expect(d2.convention?.id).toBe(convenzione.id);
      expect(d2.rule).toBe(convenzione.rule);
      expect(d2).not.toHaveProperty('convention.bphs');
    }
  });
});

describe('computeVarga', () => {
  it('dice per i sette graha in quali loro segni di dignità cade il varga, e da dove lo prende', () => {
    const carta = tema();
    for (const id of ['d9', 'd30', 'd60'] as const) {
      const varga = computeVarga(carta, id);
      if (varga.kind !== 'segni') throw new Error(id);
      expect(varga.dignitySource).toContain('6.52');
      for (const posizione of varga.positions) {
        const grahaDelTesto = ['sole', 'luna', 'marte', 'mercurio', 'giove', 'venere', 'saturno'];
        if (grahaDelTesto.includes(posizione.id)) {
          expect(posizione.dignitySigns, `${id}, ${posizione.id}`).toEqual(
            parasharaSignDignities(posizione.id, posizione.sign),
          );
        } else {
          expect(posizione).not.toHaveProperty('dignitySigns');
        }
      }
    }
  });

  it('porta con sé la regola che ha prodotto i segni', () => {
    // Fra le sedici divisioni le scuole divergono su più d'una: un segno
    // senza la sua regola non si può ricontrollare.
    for (const definizione of VARGAS) {
      const carta = computeVarga(tema(), definizione.id);
      // Nel D-2 la regola è quella della convenzione, che porta anche la
      // fonte: la parte comune sta in `VARGAS` e non basta da sola.
      expect(carta.rule).toBe(
        definizione.id === 'd2' ? HORA_CONVENTIONS[0]!.rule : definizione.rule,
      );
      expect(carta.rule.length).toBeGreaterThan(30);
      expect(carta.divisions).toBe(definizione.divisions);
      expect(carta.name).toBe(definizione.name);
    }
  });

  it('mette ogni corpo del tema in un segno, e ci aggiunge il lagna', () => {
    const carta = tema();
    const d9 = computeVarga(carta, 'd9');

    expect(d9.kind).toBe('segni');
    expect(d9.positions).toHaveLength(carta.bodies.length);
    expect(d9.ascendant).toBe(vargaSignOf(carta.angles!.ascendant, 'd9'));
  });

  it('nomina i nodi Rahu e Ketu come il resto del Jyotisha', () => {
    const d9 = computeVarga(tema(), 'd9');
    const nomi = d9.positions.map((position) => position.name);

    expect(nomi).toContain('Rahu');
    expect(nomi).toContain('Ketu');
    expect(nomi).not.toContain('Nodo Nord');
  });

  it('lascia il D-1 identico ai segni del tema', () => {
    // È la verifica che la serie cominci davvero dalla carta di partenza, e
    // non da una sua variante.
    const carta = tema();
    const d1 = computeVarga(carta, 'd1');
    if (d1.kind !== 'segni') throw new Error('il D-1 ha i segni');

    for (const body of carta.bodies) {
      expect(d1.positions.find((p) => p.id === body.id)?.sign).toBe(body.sign);
    }
  });

  it('porta la retrogradazione in ogni varga, che è del corpo e non del segno', () => {
    // Il varga sposta dove un corpo cade, non come si muove: il moto
    // apparente a quell'istante resta quello in tutte e sedici le divisioni.
    // È la ragione per cui questo si può portare e il grado no — dentro un
    // segno di trimsamsa un grado non è nemmeno definito.
    const carta = tema();
    const vakri = new Set(
      carta.bodies.filter((body) => body.retrograde).map((body) => body.id),
    );
    expect(vakri.size).toBeGreaterThan(0);

    for (const definizione of VARGAS) {
      for (const position of computeVarga(carta, definizione.id).positions) {
        expect(position.retrograde).toBe(vakri.has(position.id));
      }
    }
  });

  it('non dà le case, che in un varga si contano dal lagna', () => {
    // Darle vorrebbe dire scegliere una domificazione dove il sistema non ne
    // prevede: dal segno del lagna e da quello del corpo la casa si ricava
    // senza altro calcolo.
    const d9 = computeVarga(tema(), 'd9');
    expect(d9).not.toHaveProperty('houses');
  });

  it('rifiuta un tema tropicale e un varga che non calcola', () => {
    expect(() => computeVarga(computeNatalChart(NASCITA), 'd9')).toThrow(ChartError);
    expect(() => vargaSignOf(0, 'd81' as VargaId)).toThrow(ChartError);
  });
});
