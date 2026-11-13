import { describe, expect, it } from 'vitest';
import { ChartError } from '../src/errors.js';
import { formatSkyEventsCompact } from '../src/format.js';
import { computeSky } from '../src/sky.js';
import { computeBodies, initEphemeris } from '../src/ephemeris.js';
import { signOf } from '../src/math.js';
import { findSignIngresses, findStations } from '../src/sky-events.js';
import type { PassageRange } from '../src/types.js';

const ANNO_2026: PassageRange = { from: '2026-01-01', to: '2026-12-31', timezone: 'UTC' };

describe('findSignIngresses', () => {
  it('trova gli ingressi dei pianeti lenti alle date pubblicate', () => {
    // Riferimenti indipendenti: nel 2026 Nettuno entra in Ariete il 26
    // gennaio, Saturno il 14 febbraio, Urano in Gemelli il 26 aprile.
    const { ingresses } = findSignIngresses(ANNO_2026, {
      bodies: ['saturno', 'urano', 'nettuno'],
    });

    expect(ingresses).toHaveLength(3);
    expect(ingresses.map((i) => [i.body, i.sign, i.exact.slice(0, 10)])).toEqual([
      ['nettuno', 'ariete', '2026-01-26'],
      ['saturno', 'ariete', '2026-02-14'],
      ['urano', 'gemelli', '2026-04-26'],
    ]);
  });

  it('colloca l istante sul confine del segno', () => {
    // Verifica incrociata: appena dopo l'ingresso il corpo è nel segno nuovo,
    // e a meno di un primo dal suo inizio.
    const { ingresses } = findSignIngresses(ANNO_2026, { bodies: ['giove'] });
    const giove = ingresses[0]!;

    const sky = computeSky({
      date: giove.exact.slice(0, 10),
      time: giove.exact.slice(11, 16),
      timezone: 'UTC',
    });
    const body = sky.bodies.find((b) => b.id === 'giove')!;

    // A cavallo del confine: il grado nel segno è quasi 0 oppure quasi 30.
    const distance = Math.min(body.signDegree, 30 - body.signDegree);
    expect(distance * 60).toBeLessThan(1);
  });

  it('conta anche i rientri all indietro', () => {
    // Saturno entra in Ariete nel maggio 2025, retrograda tornando in Pesci a
    // settembre e rientra nel febbraio successivo: sono tre attraversamenti,
    // non uno. Contarne uno solo darebbe una data d'inizio sbagliata di nove
    // mesi a un passaggio che dura tre anni.
    const { ingresses } = findSignIngresses(
      { from: '2025-01-01', to: '2026-12-31', timezone: 'UTC' },
      { bodies: ['saturno'] },
    );

    expect(ingresses.map((i) => [i.sign, i.retrograde, i.exact.slice(0, 10)])).toEqual([
      ['ariete', false, '2025-05-25'],
      ['pesci', true, '2025-09-01'],
      ['ariete', false, '2026-02-14'],
    ]);
    // Chi entra all'indietro torna nel segno da cui era appena uscito.
    expect(ingresses[1]?.from).toBe(ingresses[0]?.sign);
  });

  it('lascia fuori la Luna, che cambia segno ogni due giorni e mezzo', () => {
    const { ingresses } = findSignIngresses(ANNO_2026);

    expect(ingresses.some((i) => i.body === 'luna')).toBe(false);
    // Il Sole invece ne fa dodici, uno per mese: è il ritmo dell'anno.
    expect(ingresses.filter((i) => i.body === 'sole')).toHaveLength(12);
  });

  it('rifiuta un intervallo rovesciato', () => {
    expect(() =>
      findSignIngresses({ from: '2026-12-31', to: '2026-01-01', timezone: 'UTC' }),
    ).toThrow(ChartError);
  });

  it.each(['1969-12-15', '1970-01-01', '1970-01-02', '1970-01-03', '1970-01-04'])(
    'trova i due ingressi di Mercurio accanto alla stazione del 4 gennaio 1970, partendo dal %s',
    (from) => {
      // Entra in Acquario alle 04:20 UT, staziona alle 08:10 a nove secondi
      // d'arco dal confine, rientra in Capricorno alle 11:59. Con il segno
      // confrontato ai soli capi del passo, i due ingressi sparivano secondo
      // dove cadeva l'inizio dell'arco. Così vicino alla stazione il corpo è
      // quasi fermo, e l'istante regge al minuto e non oltre.
      const { ingresses } = findSignIngresses(
        { from, to: '1970-01-31', timezone: 'UTC' },
        { bodies: ['mercurio'] },
      );

      expect(ingresses.map((i) => [i.sign, i.retrograde])).toEqual([
        ['acquario', false],
        ['capricorno', true],
      ]);
      const minuti = (iso: string): number => Date.parse(iso) / 60_000;
      expect(Math.abs(minuti(ingresses[0]!.exact) - minuti('1970-01-04T04:20Z'))).toBeLessThanOrEqual(1);
      expect(Math.abs(minuti(ingresses[1]!.exact) - minuti('1970-01-04T11:59Z'))).toBeLessThanOrEqual(1);
    },
  );

  it('non perde ingressi di Mercurio in un secolo, contro una ricerca a passi di tre ore', () => {
    // La ricerca cieca non sa niente di stazioni: guarda il segno ogni tre
    // ore, e un soggiorno più breve non lo vede. Quello del 1970 dura sette
    // ore e mezza, e nel secolo è il solo che il passo del moto medio perdeva.
    const SECOLO: PassageRange = { from: '1900-01-01', to: '1999-12-31', timezone: 'UTC' };
    const { ingresses } = findSignIngresses(SECOLO, { bodies: ['mercurio'] });

    const context = initEphemeris();
    const segnoA = (julianDay: number): string =>
      signOf(computeBodies(julianDay, ['mercurio'], context).bodies[0]!.longitude);

    const inizio = Date.parse('1900-01-01T00:00Z') / 86_400_000 + 2440587.5;
    const fine = Date.parse('1999-12-31T23:59Z') / 86_400_000 + 2440587.5;
    const ciechi: string[] = [];
    let segno = segnoA(inizio);
    for (let julianDay = inizio + 0.125; julianDay <= fine; julianDay += 0.125) {
      const adesso = segnoA(julianDay);
      if (adesso !== segno) ciechi.push(adesso);
      segno = adesso;
    }

    expect(ingresses.map((i) => i.sign)).toEqual(ciechi);
  }, 30_000);

  it('conta una volta sola un corpo chiesto due volte', () => {
    const DUE_MESI: PassageRange = { from: '2026-01-01', to: '2026-02-28', timezone: 'UTC' };

    expect(findSignIngresses(DUE_MESI, { bodies: ['luna', 'luna'] })).toEqual(
      findSignIngresses(DUE_MESI, { bodies: ['luna'] }),
    );
  });
});

describe('findStations', () => {
  it('trova le stazioni di Mercurio alle date pubblicate', () => {
    // Nel 2026 la prima retrogradazione di Mercurio va dal 26 febbraio al
    // 20 marzo.
    const { stations } = findStations(
      { from: '2026-01-01', to: '2026-04-30', timezone: 'UTC' },
      { bodies: ['mercurio'] },
    );

    expect(stations).toHaveLength(2);
    expect(stations[0]?.direction).toBe('retrograda');
    expect(stations[0]?.exact.slice(0, 10)).toBe('2026-02-26');
    expect(stations[1]?.direction).toBe('diretta');
    expect(stations[1]?.exact.slice(0, 10)).toBe('2026-03-20');
  });

  it('porta con sé il grado su cui il pianeta si ferma', () => {
    const { stations } = findStations(ANNO_2026, { bodies: ['plutone'] });

    for (const station of stations) {
      expect(station.sign).toBe('acquario');
      expect(station.signDegree).toBeGreaterThanOrEqual(0);
      expect(station.signDegree).toBeLessThan(30);

      // Verifica incrociata: a quell'istante la velocità è quasi nulla.
      const sky = computeSky({
        date: station.exact.slice(0, 10),
        time: station.exact.slice(11, 16),
        timezone: 'UTC',
      });
      const plutone = sky.bodies.find((b) => b.id === 'plutone')!;
      expect(Math.abs(plutone.speed)).toBeLessThan(0.0001);
    }
  });

  it('alterna sempre retrograda e diretta', () => {
    const { stations } = findStations(ANNO_2026, { bodies: ['mercurio'] });

    expect(stations.length).toBeGreaterThanOrEqual(6);
    for (let i = 1; i < stations.length; i += 1) {
      expect(stations[i]?.direction).not.toBe(stations[i - 1]?.direction);
    }
  });

  it('non ne trova per il Sole, che non retrograda mai', () => {
    const { stations } = findStations(ANNO_2026, { bodies: ['sole', 'luna'] });

    expect(stations).toHaveLength(0);
  });

  it('conta una volta sola un corpo chiesto due volte', () => {
    expect(findStations(ANNO_2026, { bodies: ['mercurio', 'mercurio'] })).toEqual(
      findStations(ANNO_2026, { bodies: ['mercurio'] }),
    );
  });
});

describe('formatSkyEventsCompact', () => {
  it('tiene le due tabelle separate e dichiara i vuoti', () => {
    const arco: PassageRange = { from: '2026-01-01', to: '2026-01-10', timezone: 'Europe/Rome' };
    const { ingresses } = findSignIngresses(arco, { bodies: ['nettuno'] });
    const { stations } = findStations(arco, { bodies: ['nettuno'] });

    const testo = formatSkyEventsCompact(ingresses, stations, arco);

    expect(testo).toContain('EVENTI DEL CIELO — dal 2026-01-01 al 2026-01-10 (Europe/Rome)');
    expect(testo).toContain('INGRESSI NEI SEGNI');
    expect(testo).toContain('(nessuno in questo arco di tempo)');
    expect(testo).toContain('STAZIONI');
    expect(testo).toContain('(nessuna in questo arco di tempo)');
  });

  it('segnala gli ingressi fatti all indietro', () => {
    const arco: PassageRange = { from: '2026-08-01', to: '2026-09-30', timezone: 'UTC' };
    const { ingresses } = findSignIngresses(arco, { bodies: ['nodo-nord'] });

    // Il Nodo Nord medio è sempre retrogrado: entra nei segni all'indietro.
    const testo = formatSkyEventsCompact(ingresses, [], arco);
    expect(testo).toContain("(all'indietro)");
  });
});
