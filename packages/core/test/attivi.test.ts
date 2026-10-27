import { describe, expect, it } from 'vitest';
import { findActiveTransits } from '../src/attivi.js';
import { computeNatalChart } from '../src/chart.js';
import { ChartError } from '../src/errors.js';
import { findTransitPassages } from '../src/passages.js';
import { findStations } from '../src/sky-events.js';
import type { NatalChart, PassageRange } from '../src/types.js';

// Una nascita inventata, scelta perché il suo cielo del 2025-26 contiene i
// due casi che la domanda «che cosa è attivo» deve saper vedere, con le
// orbite dei transiti di Hand (1°). In febbraio 2026 Urano, fermo sui 27° del
// Toro, è in quadrato a Venere per tutto il mese senza mai essere esatto. In
// luglio 2025 Saturno, che si ferma poco dopo 1° Ariete, esce dall'orbita del
// quadrato a Nettuno il 4 e ci rientra il 22: esatto il 7 giugno e il 18
// agosto, cioè fuori dal mese. `findTransitPassages` su quei due mesi non vede
// né l'uno né l'altro.
const TORINO: NatalChart = computeNatalChart({
  date: '1985-09-20',
  time: '08:40',
  latitude: 45.0703,
  longitude: 7.6869,
  timezone: 'Europe/Rome',
});

/** La distanza in minuti fra due istanti ISO. */
const minuti = (a?: string, b?: string): number =>
  Math.abs(Date.parse(a ?? '') - Date.parse(b ?? '')) / 60_000;

const FEBBRAIO: PassageRange = { from: '2026-02-01', to: '2026-02-28', timezone: 'Europe/Rome' };
const LUGLIO: PassageRange = { from: '2025-07-01', to: '2025-07-31', timezone: 'Europe/Rome' };

describe('findActiveTransits', () => {
  it('vede i transiti in orbita per tutto l arco, che i passaggi non vedono', () => {
    const { transits, orbConvention } = findActiveTransits(TORINO, FEBBRAIO, { bodies: ['urano'] });
    const { passages } = findTransitPassages(TORINO, FEBBRAIO, { bodies: ['urano'] });
    expect(passages).toEqual([]);
    expect(orbConvention.id).toBe('hand');

    const venere = transits.find((t) => t.natal === 'venere' && t.aspect === 'quadrato');
    expect(venere).toMatchObject({ throughout: true, perfections: [] });
    expect(venere?.enters?.slice(0, 10)).toBe('2025-12-08');
    expect(venere?.leaves?.slice(0, 10)).toBe('2026-04-01');
    // Ai bordi dell'arco la distanza dall'esatto c'è, ed è dentro l'orbita.
    expect(venere?.orbAtFrom).toBeGreaterThan(0);
    expect(venere?.orbAtFrom).toBeLessThan(venere!.orb);
    expect(venere?.orbAtTo).toBeLessThan(venere!.orb);
    // Non si perfeziona: la riga dice quanto si avvicina, e quando.
    expect(venere?.closest?.orb).toBeGreaterThan(0);
  });

  it('dà due righe allo stesso transito quando esce dall orbita ed entra di nuovo', () => {
    const { transits } = findActiveTransits(TORINO, LUGLIO, {
      bodies: ['saturno'],
      targets: ['nettuno'],
    });
    const { passages } = findTransitPassages(TORINO, LUGLIO, { bodies: ['saturno'] });
    const quadrati = transits.filter((t) => t.aspect === 'quadrato');

    expect(passages).toEqual([]);
    expect(quadrati).toHaveLength(2);
    expect(quadrati.map((t) => t.throughout)).toEqual([false, false]);
    expect(quadrati[0]?.leaves?.slice(0, 10)).toBe('2025-07-04');
    expect(quadrati[0]?.orbAtFrom).toBeDefined();
    expect(quadrati[0]?.orbAtTo).toBeUndefined();
    expect(quadrati[1]?.enters?.slice(0, 10)).toBe('2025-07-22');
    expect(quadrati[1]?.orbAtFrom).toBeUndefined();
  });

  it('coincide con le finestre dei passaggi su un arco che le contiene', () => {
    const arco: PassageRange = { from: '2025-03-01', to: '2025-12-31', timezone: 'Europe/Rome' };
    const opzioni = { bodies: ['saturno' as const], targets: ['nettuno' as const] };
    const passaggi = findTransitPassages(TORINO, arco, opzioni).passages.filter(
      (p) => p.aspect === 'quadrato',
    );
    const attivi = findActiveTransits(TORINO, arco, opzioni).transits.filter(
      (t) => t.aspect === 'quadrato',
    );

    // Due perfezioni, il 7 giugno e il 18 agosto, ciascuna nel suo tratto.
    expect(passaggi.map((p) => p.local.slice(0, 10))).toEqual(['2025-06-07', '2025-08-18']);
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
    // Con 2° invece di 1°, Saturno quadrato Nettuno resta in orbita per tutto
    // luglio: dall'11 maggio al 16 settembre. Il risultato dichiara che
    // l'orbita è stata sostituita.
    const { transits, orbConvention } = findActiveTransits(TORINO, LUGLIO, {
      bodies: ['saturno'],
      targets: ['nettuno'],
      orbs: { quadrato: 2 },
    });
    const quadrato = transits.find((t) => t.aspect === 'quadrato');
    expect(quadrato).toMatchObject({ throughout: true, orb: 2 });
    expect(quadrato?.enters?.slice(0, 10)).toBe('2025-05-11');
    expect(quadrato?.leaves?.slice(0, 10)).toBe('2025-09-16');
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
      ...TORINO,
      bodies: TORINO.bodies.map((b) => (b.id === 'marte' ? { ...b, longitude: punto } : b)),
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
    const natale = TORINO.input.date;
    const { transits } = findActiveTransits(
      TORINO,
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
    const { transits } = findActiveTransits(TORINO, LUGLIO);
    const inizi = transits.map((t) =>
      t.enters && t.enters > '2025-07-01' ? t.enters : '2025-07-01',
    );
    expect(inizi).toEqual([...inizi].sort());
    // Il Sole, i pianeti lenti e i Nodi insieme: non è un elenco vuoto.
    expect(transits.length).toBeGreaterThan(20);
  });

  it('rifiuta un intervallo vuoto', () => {
    expect(() =>
      findActiveTransits(TORINO, { from: '2026-08-01', to: '2026-07-01', timezone: 'UTC' }),
    ).toThrow(ChartError);
  });
});
