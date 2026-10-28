import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { ChartError } from '../src/errors.js';
import { formatVargaCompact } from '../src/format.js';
import { HORA_CONVENTIONS, horaOf } from '../src/hora.js';
import { computeVarga, VARGAS, vargaSignOf } from '../src/varga.js';
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

describe('computeVarga', () => {
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
    expect(() => vargaSignOf(0, 'd60' as VargaId)).toThrow(ChartError);
  });
});
