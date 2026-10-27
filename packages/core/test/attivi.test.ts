import { describe, expect, it } from 'vitest';
import { findActiveTransits } from '../src/attivi.js';
import { computeNatalChart } from '../src/chart.js';
import { ChartError } from '../src/errors.js';
import { findTransitPassages } from '../src/passages.js';
import { findStations } from '../src/sky-events.js';
import type { NatalChart, PassageRange } from '../src/types.js';

// Il caso di `TODO.md`, voce 7: in luglio 2026 due transiti di Saturno sono
// in orbita per tutto il mese e non si perfezionano dentro, e quindi
// `findTransitPassages` sull'arco non li vede.
const PALERMO: NatalChart = computeNatalChart({
  date: '1978-06-02',
  time: '15:15',
  latitude: 38.1157,
  longitude: 13.3615,
  timezone: 'Europe/Rome',
});

const LUGLIO: PassageRange = { from: '2026-07-01', to: '2026-08-01', timezone: 'Europe/Rome' };

describe('findActiveTransits', () => {
  it('vede i transiti in orbita per tutto l arco, che i passaggi non vedono', () => {
    const { transits } = findActiveTransits(PALERMO, LUGLIO, { bodies: ['saturno'] });
    const { passages } = findTransitPassages(PALERMO, LUGLIO, { bodies: ['saturno'] });
    expect(passages).toEqual([]);

    const venere = transits.find((t) => t.natal === 'venere' && t.aspect === 'quadrato');
    const plutone = transits.find((t) => t.natal === 'plutone' && t.aspect === 'opposizione');

    // Le finestre sono quelle che `findTransitPassages` dà su un arco largo,
    // da maggio a ottobre: lo stesso calcolo, guardato da un altro lato.
    expect(venere).toMatchObject({ throughout: true, perfections: [] });
    expect(venere?.enters?.slice(0, 10)).toBe('2026-05-26');
    expect(venere?.leaves?.slice(0, 10)).toBe('2026-09-29');
    expect(plutone).toMatchObject({ throughout: true, perfections: [] });
    expect(plutone?.enters?.slice(0, 10)).toBe('2026-05-29');
    expect(plutone?.leaves?.slice(0, 10)).toBe('2026-09-25');

    // Ai bordi dell'arco la distanza dall'esatto c'è, ed è dentro l'orbita.
    for (const transit of [venere, plutone]) {
      expect(transit?.orbAtFrom).toBeGreaterThan(0);
      expect(transit?.orbAtFrom).toBeLessThan(transit!.orb);
      expect(transit?.orbAtTo).toBeLessThan(transit!.orb);
    }
  });

  it('coincide con le finestre dei passaggi su un arco che le contiene', () => {
    const arco: PassageRange = { from: '2026-05-01', to: '2026-10-31', timezone: 'Europe/Rome' };
    const { passages } = findTransitPassages(PALERMO, arco, {
      bodies: ['saturno'],
      targets: ['venere'],
    });
    const { transits } = findActiveTransits(PALERMO, arco, {
      bodies: ['saturno'],
      targets: ['venere'],
    });

    const quadrato = transits.filter((t) => t.aspect === 'quadrato');
    expect(quadrato).toHaveLength(1);
    expect(quadrato[0]?.throughout).toBe(false);
    expect(quadrato[0]?.perfections.map((p) => p.local.slice(0, 10))).toEqual(
      passages.filter((p) => p.aspect === 'quadrato').map((p) => p.local.slice(0, 10)),
    );
    expect(quadrato[0]?.perfections.map((p) => p.local.slice(0, 10))).toEqual([
      '2026-06-22',
      '2026-08-31',
    ]);
    const window = passages.find((p) => p.aspect === 'quadrato')?.window;
    expect(quadrato[0]?.enters).toBe(window?.start);
    expect(quadrato[0]?.leaves).toBe(window?.end);
    // Con una perfezione la distanza minima è zero, e non si ripete.
    expect(quadrato[0]?.closest).toBeUndefined();
  });

  it('vede un transito che entra in orbita e torna indietro senza perfezionarsi', () => {
    // Costruito apposta, perché nessun tema reale garantisce il caso: un
    // punto natale messo un grado oltre il punto in cui Giove si ferma.
    // Giove ci arriva a un grado, si ferma e torna indietro: in orbita per
    // settimane, esatto mai.
    const { stations } = findStations(
      { from: '2026-01-01', to: '2026-12-31', timezone: 'UTC' },
      { bodies: ['giove'] },
    );
    const stazione = stations.find((s) => s.direction === 'retrograda');
    expect(stazione).toBeDefined();

    const punto = (stazione!.longitude + 1) % 360;
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
    expect(congiunzione[0]?.closest?.orb).toBeCloseTo(1, 2);
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
