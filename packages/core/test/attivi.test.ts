import { describe, expect, it } from 'vitest';
import { findActiveTransits } from '../src/attivi.js';
import { computeNatalChart } from '../src/chart.js';
import { ChartError } from '../src/errors.js';
import { findTransitPassages } from '../src/passages.js';
import { findStations } from '../src/sky-events.js';
import type { NatalChart, PassageRange } from '../src/types.js';

// Il caso della voce 7 del `TODO.md`, con le orbite di Hand (1°): in luglio
// 2026 Saturno è in opposizione a Plutone per tutto il mese, esatto il 27
// giugno e il 25 agosto, cioè fuori; e in quadrato a Venere in due tratti,
// fino al 22 luglio e dal 31. `findTransitPassages` sull'arco non vede né
// l'uno né l'altro.
const PALERMO: NatalChart = computeNatalChart({
  date: '1978-06-02',
  time: '15:15',
  latitude: 38.1157,
  longitude: 13.3615,
  timezone: 'Europe/Rome',
});

/** La distanza in minuti fra due istanti ISO. */
const minuti = (a?: string, b?: string): number =>
  Math.abs(Date.parse(a ?? '') - Date.parse(b ?? '')) / 60_000;

const LUGLIO: PassageRange = { from: '2026-07-01', to: '2026-08-01', timezone: 'Europe/Rome' };

describe('findActiveTransits', () => {
  it('vede i transiti in orbita per tutto l arco, che i passaggi non vedono', () => {
    const { transits, orbConvention } = findActiveTransits(PALERMO, LUGLIO, { bodies: ['saturno'] });
    const { passages } = findTransitPassages(PALERMO, LUGLIO, { bodies: ['saturno'] });
    expect(passages).toEqual([]);
    expect(orbConvention.id).toBe('hand');

    const plutone = transits.find((t) => t.natal === 'plutone' && t.aspect === 'opposizione');
    expect(plutone).toMatchObject({ throughout: true, perfections: [] });
    expect(plutone?.enters?.slice(0, 10)).toBe('2026-06-11');
    expect(plutone?.leaves?.slice(0, 10)).toBe('2026-09-11');
    // Ai bordi dell'arco la distanza dall'esatto c'è, ed è dentro l'orbita.
    expect(plutone?.orbAtFrom).toBeGreaterThan(0);
    expect(plutone?.orbAtFrom).toBeLessThan(plutone!.orb);
    expect(plutone?.orbAtTo).toBeLessThan(plutone!.orb);
  });

  it('dà due righe allo stesso transito quando esce dall orbita ed entra di nuovo', () => {
    const { transits } = findActiveTransits(PALERMO, LUGLIO, {
      bodies: ['saturno'],
      targets: ['venere'],
    });
    const quadrati = transits.filter((t) => t.aspect === 'quadrato');

    expect(quadrati).toHaveLength(2);
    expect(quadrati.map((t) => t.throughout)).toEqual([false, false]);
    expect(quadrati[0]?.leaves?.slice(0, 10)).toBe('2026-07-22');
    expect(quadrati[0]?.orbAtFrom).toBeDefined();
    expect(quadrati[0]?.orbAtTo).toBeUndefined();
    expect(quadrati[1]?.enters?.slice(0, 10)).toBe('2026-07-31');
    expect(quadrati[1]?.orbAtFrom).toBeUndefined();
  });

  it('coincide con le finestre dei passaggi su un arco che le contiene', () => {
    const arco: PassageRange = { from: '2026-05-01', to: '2026-10-31', timezone: 'Europe/Rome' };
    const opzioni = { bodies: ['saturno' as const], targets: ['venere' as const] };
    const passaggi = findTransitPassages(PALERMO, arco, opzioni).passages.filter(
      (p) => p.aspect === 'quadrato',
    );
    const attivi = findActiveTransits(PALERMO, arco, opzioni).transits.filter(
      (t) => t.aspect === 'quadrato',
    );

    // Due perfezioni, il 22 giugno e il 31 agosto, ciascuna nel suo tratto.
    expect(passaggi.map((p) => p.local.slice(0, 10))).toEqual(['2026-06-22', '2026-08-31']);
    expect(attivi).toHaveLength(2);
    attivi.forEach((tratto, k) => {
      expect(tratto.perfections.map((p) => p.local)).toEqual([passaggi[k]?.local]);
      // Le due ricerche dimezzano intervalli diversi e si fermano al minuto
      // (`PRECISION_DAYS`): i bordi coincidono a meno di quello.
      expect(minuti(tratto.enters, passaggi[k]?.window?.start)).toBeLessThanOrEqual(2);
      expect(minuti(tratto.leaves, passaggi[k]?.window?.end)).toBeLessThanOrEqual(2);
      // Con una perfezione la distanza minima è zero, e non si ripete.
      expect(tratto.closest).toBeUndefined();
    });
  });

  it('riproduce le finestre di un orbita più larga, se la si chiede', () => {
    // Con 2° invece di 1°, Saturno quadrato Venere torna in orbita per tutto
    // luglio: dal 26 maggio al 29 settembre. Il risultato dichiara che
    // l'orbita è stata sostituita.
    const { transits, orbConvention } = findActiveTransits(PALERMO, LUGLIO, {
      bodies: ['saturno'],
      targets: ['venere'],
      orbs: { quadrato: 2 },
    });
    const quadrato = transits.find((t) => t.aspect === 'quadrato');
    expect(quadrato).toMatchObject({ throughout: true, orb: 2 });
    expect(quadrato?.enters?.slice(0, 10)).toBe('2026-05-26');
    expect(quadrato?.leaves?.slice(0, 10)).toBe('2026-09-29');
    expect(orbConvention.overridden).toEqual(['quadrato']);
  });

  it('vede un transito che entra in orbita e torna indietro senza perfezionarsi', () => {
    // Costruito apposta, perché nessun tema reale garantisce il caso: un
    // punto natale messo mezzo grado oltre il punto in cui Giove si ferma.
    // Giove ci arriva a mezzo grado, si ferma e torna indietro: in orbita
    // (1°, Hand) per settimane, esatto mai.
    const { stations } = findStations(
      { from: '2026-01-01', to: '2026-12-31', timezone: 'UTC' },
      { bodies: ['giove'] },
    );
    const stazione = stations.find((s) => s.direction === 'retrograda');
    expect(stazione).toBeDefined();

    const punto = (stazione!.longitude + 0.5) % 360;
    const tema: NatalChart = {
      ...PALERMO,
      bodies: PALERMO.bodies.map((b) => (b.id === 'marte' ? { ...b, longitude: punto } : b)),
    };
    const anno: PassageRange = { from: '2026-01-01', to: '2026-12-31', timezone: 'UTC' };
    const opzioni = { bodies: ['giove' as const], targets: ['marte' as const] };

    const passaggi = findTransitPassages(tema, anno, opzioni).passages;
    expect(passaggi.filter((p) => p.aspect === 'congiunzione')).toEqual([]);

    const { transits } = findActiveTransits(tema, anno, opzioni);
    const congiunzione = transits.filter((t) => t.aspect === 'congiunzione');
    expect(congiunzione).toHaveLength(1);
    expect(congiunzione[0]?.perfections).toEqual([]);
    expect(congiunzione[0]?.closest?.orb).toBeCloseTo(0.5, 2);
    // L'avvicinamento massimo è la stazione, al giorno.
    expect(congiunzione[0]?.closest?.local.slice(0, 10)).toBe(stazione!.local.slice(0, 10));
    expect(congiunzione[0]?.enters! < stazione!.local).toBe(true);
    expect(congiunzione[0]?.leaves! > stazione!.local).toBe(true);
  });

  it('dà due righe allo stesso aspetto quando entra in orbita due volte', () => {
    // Il Sole sul proprio punto natale per un anno e un giorno: due ritorni
    // solari, due tratti distinti.
    const natale = PALERMO.input.date;
    const { transits } = findActiveTransits(
      PALERMO,
      { from: '2026-01-01', to: '2027-12-31', timezone: 'Europe/Rome' },
      { bodies: ['sole'], targets: ['sole'] },
    );
    const ritorni = transits.filter((t) => t.aspect === 'congiunzione');
    expect(ritorni).toHaveLength(2);
    expect(ritorni.map((t) => t.perfections[0]?.local.slice(5, 7))).toEqual([
      natale.slice(5, 7),
      natale.slice(5, 7),
    ]);
  });

  it('mette i transiti in ordine di attivazione dentro l arco', () => {
    const { transits } = findActiveTransits(PALERMO, LUGLIO);
    const inizi = transits.map((t) =>
      t.enters && t.enters > '2026-07-01' ? t.enters : '2026-07-01',
    );
    expect(inizi).toEqual([...inizi].sort());
    // Il Sole, i pianeti lenti e i Nodi insieme: non è un elenco vuoto.
    expect(transits.length).toBeGreaterThan(20);
  });

  it('rifiuta un intervallo vuoto', () => {
    expect(() =>
      findActiveTransits(PALERMO, { from: '2026-08-01', to: '2026-07-01', timezone: 'UTC' }),
    ).toThrow(ChartError);
  });
});
