import { describe, expect, it, vi } from 'vitest';
import { ChartError } from '../src/errors.js';
import { resolveTime, toJulianDay } from '../src/time.js';

/**
 * La conversione ora locale → UT è il punto in cui si sbagliano i temi natali.
 * Un'ora di errore sposta l'Ascendente di circa 15 gradi, cioè mezzo segno.
 */
describe('resolveTime', () => {
  it('legge le 24:00 come la mezzanotte del giorno dopo, e lo dice', () => {
    const { time, warnings } = resolveTime({ date: '1968-03-12', time: '24:00', timezone: 'Europe/Rome' });

    expect(time.utc).toBe('1968-03-12T23:00:00Z');
    expect(warnings.join(' ')).toContain('00:00 del giorno dopo');
    // Le altre ore non ricevono l'avviso.
    expect(resolveTime({ date: '1968-03-12', time: '23:59', timezone: 'Europe/Rome' }).warnings).toEqual([]);
  });

  it('applica CET quando l\'ora legale non è in vigore', () => {
    const { time } = resolveTime({
      date: '1968-03-12',
      time: '14:30',
      latitude: 40.8518,
      longitude: 14.2681,
      timezone: 'Europe/Rome',
    });

    // L'Italia nel 1968 adottava l'ora legale dal 26 maggio: a marzo vale CET.
    expect(time.offsetMinutes).toBe(60);
    expect(time.utc).toBe('1968-03-12T13:30:00Z');
    expect(time.timeKnown).toBe(true);
  });

  it('applica CEST durante l\'ora legale', () => {
    const { time } = resolveTime({
      date: '1968-07-15',
      time: '14:30',
      latitude: 40.8518,
      longitude: 14.2681,
      timezone: 'Europe/Rome',
    });

    expect(time.offsetMinutes).toBe(120);
    expect(time.utc).toBe('1968-07-15T12:30:00Z');
  });

  it('usa il tempo medio locale per le date precedenti al 1893', () => {
    const { time } = resolveTime({
      date: '1880-06-15',
      time: '12:00',
      latitude: 41.9028,
      longitude: 12.4964,
      timezone: 'Europe/Rome',
    });

    // Roma passò a CET solo il 31 ottobre 1893. Prima valeva il tempo medio
    // locale, circa +0:50 — non l'ora di fuso.
    expect(time.offsetMinutes).toBeGreaterThan(0);
    expect(time.offsetMinutes).toBeLessThan(60);
  });

  it('segnala un\'ora inesistente al passaggio all\'ora legale', () => {
    const { warnings } = resolveTime({
      date: '2024-03-31',
      time: '02:30',
      latitude: 41.9028,
      longitude: 12.4964,
      timezone: 'Europe/Rome',
    });

    expect(warnings.some((w) => w.includes('non è mai esistita'))).toBe(true);
  });

  it('segnala un\'ora ambigua al ritorno all\'ora solare', () => {
    const { warnings } = resolveTime({
      date: '2024-10-27',
      time: '02:30',
      latitude: 41.9028,
      longitude: 12.4964,
      timezone: 'Europe/Rome',
    });

    expect(warnings.some((w) => w.includes('ambigua'))).toBe(true);
  });

  it('scioglie l\'ora ambigua allo stesso modo in qualunque stagione la si calcoli', () => {
    // Luxon, lasciato fare, parte dall'offset che il fuso ha adesso: la stessa
    // nascita dava 00:30Z calcolata d'estate e 01:30Z d'inverno.
    vi.useFakeTimers();
    try {
      for (const adesso of ['2026-01-15T12:00:00Z', '2026-07-15T12:00:00Z']) {
        vi.setSystemTime(new Date(adesso));
        const { time } = resolveTime({
          date: '1990-09-30',
          time: '02:30',
          timezone: 'Europe/Rome',
        });

        // La prima occorrenza, ancora in ora legale: è ciò che l'avviso dichiara.
        expect(time.utc, adesso).toBe('1990-09-30T00:30:00Z');
        expect(time.offsetMinutes, adesso).toBe(120);
      }
    } finally {
      vi.useRealTimers();
    }
  });

  describe('prima dell\'ora unica', () => {
    const nel1850 = (longitude: number) =>
      resolveTime({ date: '1850-06-01', time: '12:00', latitude: 41, longitude, timezone: 'Europe/Rome' });

    it('dà a Roma, Lecce e Torino lo stesso istante, e dice che è il tempo di Roma', () => {
      const [roma, lecce, torino] = [12.4964, 18.1743, 7.6869].map(nel1850);

      // Il fuso non sa dove si è nati: i tre istanti coincidono, ed è questo
      // che l'avviso dichiara invece di lasciarlo passare per un fatto.
      expect(lecce!.time.utc).toBe(roma!.time.utc);
      expect(torino!.time.utc).toBe(roma!.time.utc);
      expect(roma!.time.offsetMinutes).toBeCloseTo(49.93, 2);

      for (const { warnings } of [roma!, lecce!, torino!]) {
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain('+0:49:56 da Greenwich');
        expect(warnings[0]).toContain('quattro minuti per ogni grado');
      }
    });

    it('tace dopo l\'ora unica, e sui fusi a tre quarti d\'ora', () => {
      expect(
        resolveTime({ date: '1893-11-01', time: '12:00', timezone: 'Europe/Rome' }).warnings,
      ).toEqual([]);
      // Il Nepal sta a +5:45: è un fuso vero, non il tempo di una città.
      expect(
        resolveTime({ date: '2024-06-15', time: '12:00', timezone: 'Asia/Kathmandu' }).warnings,
      ).toEqual([]);
    });

    it('lo dice anche a ovest di Greenwich, col segno giusto', () => {
      const { warnings } = resolveTime({ date: '1850-06-01', time: '12:00', timezone: 'America/New_York' });
      expect(warnings[0]).toContain('-4:56:02 da Greenwich');
    });

    it('senza l\'ora non lo dice: non ci sono case da spostare', () => {
      expect(resolveTime({ date: '1850-06-01', timezone: 'Europe/Rome' }).warnings).toEqual([]);
    });
  });

  describe("l'ora letta su un orologio del luogo", () => {
    const LECCE = { date: '1850-06-01', time: '12:00', latitude: 40.35, longitude: 18.1743, timezone: 'Europe/Rome' };

    it('il tempo medio conta quattro minuti per grado, e il fuso non entra', () => {
      const { time, warnings } = resolveTime({ ...LECCE, clock: 'tempo-medio-locale' });

      // 18,1743° × 4 = 72 minuti e 42 secondi a Est di Greenwich.
      expect(time.utc).toBe('1850-06-01T10:47:18Z');
      expect(time.offsetMinutes).toBeCloseTo(72.7, 10);
      expect(time.clock).toBe('tempo-medio-locale');
      expect(time.equationOfTimeMinutes).toBeUndefined();
      // Niente avvertenza sul tempo medio di Roma: non è stato usato.
      expect(warnings).toEqual([]);

      const altrove = resolveTime({ ...LECCE, timezone: 'Asia/Tokyo', clock: 'tempo-medio-locale' });
      expect(altrove.time.utc).toBe(time.utc);
    });

    it('sta ventitré minuti prima della lettura col fuso', () => {
      const fuso = resolveTime(LECCE).time.julianDayUT;
      const medio = resolveTime({ ...LECCE, clock: 'tempo-medio-locale' }).time.julianDayUT;
      expect((fuso - medio) * 1440).toBeCloseTo(72.7 - 49.9333, 2);
    });

    it("il tempo vero aggiunge l'equazione del tempo, e la espone", () => {
      // Ai primi di novembre la meridiana anticipa l'orologio di oltre sedici
      // minuti, a metà febbraio lo ritarda di quattordici: i due estremi
      // dell'anno, che ogni almanacco riporta.
      const novembre = resolveTime({ date: '2026-11-03', time: '12:00', longitude: 0, timezone: 'UTC', clock: 'tempo-vero-locale' }).time;
      expect(novembre.equationOfTimeMinutes).toBeGreaterThan(16.3);
      expect(novembre.equationOfTimeMinutes).toBeLessThan(16.5);
      // A Greenwich il mezzogiorno vero cade allora alle 11:43 dell'orologio.
      expect(novembre.utc.slice(0, 16)).toBe('2026-11-03T11:43');

      const febbraio = resolveTime({ date: '2026-02-11', time: '12:00', longitude: 0, timezone: 'UTC', clock: 'tempo-vero-locale' }).time;
      expect(febbraio.equationOfTimeMinutes).toBeLessThan(-14);
      expect(febbraio.equationOfTimeMinutes).toBeGreaterThan(-14.4);
      expect(febbraio.utc.slice(0, 16)).toBe('2026-02-11T12:14');

      // Lo scarto è la somma dei due componenti.
      const lecce = resolveTime({ ...LECCE, clock: 'tempo-vero-locale' }).time;
      expect(lecce.offsetMinutes).toBeCloseTo(72.7 + lecce.equationOfTimeMinutes!, 10);
    });

    it("col fuso, che è il caso ordinario, il risultato non porta l'orologio", () => {
      expect(resolveTime({ ...LECCE, clock: 'fuso' }).time).toEqual(resolveTime(LECCE).time);
      expect(resolveTime(LECCE).time).not.toHaveProperty('clock');
    });

    it('senza un luogo si rifiuta, e così un nome sconosciuto', () => {
      const senzaLuogo = { date: '1850-06-01', time: '12:00', timezone: 'Europe/Rome' };
      for (const clock of ['tempo-medio-locale', 'tempo-vero-locale'] as const) {
        expect(() => resolveTime({ ...senzaLuogo, clock })).toThrow(/un luogo non c'è/);
      }
      expect(() => resolveTime({ ...LECCE, clock: 'siderale' as 'fuso' })).toThrow(/ammessi fuso, tempo-medio-locale/);
    });

    it("senza l'ora vale il mezzogiorno di quell'orologio", () => {
      const { time } = resolveTime({ ...LECCE, time: undefined, clock: 'tempo-medio-locale' });
      expect(time.timeKnown).toBe(false);
      expect(time.utc).toBe('1850-06-01T10:47:18Z');
    });
  });

  it('non emette avvisi per un orario ordinario', () => {
    const { warnings } = resolveTime({
      date: '2024-06-15',
      time: '09:15',
      latitude: 41.9028,
      longitude: 12.4964,
      timezone: 'Europe/Rome',
    });

    expect(warnings).toEqual([]);
  });

  it('ripiega su mezzogiorno locale quando l\'ora è ignota', () => {
    const { time, warnings } = resolveTime({
      date: '1968-03-12',
      latitude: 40.8518,
      longitude: 14.2681,
      timezone: 'Europe/Rome',
    });

    expect(time.timeKnown).toBe(false);
    expect(time.utc).toBe('1968-03-12T11:00:00Z');
    // La conversione riesce e non ha nulla da segnalare: che cosa comporti
    // l'ora mancante lo dice chi sa di che istante si tratti.
    expect(warnings).toEqual([]);
  });

  it('rifiuta fusi orari sconosciuti', () => {
    expect(() =>
      resolveTime({
        date: '2000-01-01',
        time: '12:00',
        latitude: 0,
        longitude: 0,
        timezone: 'Europa/Roma',
      }),
    ).toThrow(ChartError);
  });

  it('rifiuta date malformate', () => {
    expect(() =>
      resolveTime({
        date: '12/03/1968',
        time: '14:30',
        latitude: 0,
        longitude: 0,
        timezone: 'Europe/Rome',
      }),
    ).toThrow(/DATA_NON_VALIDA|formato/);
  });
});

describe('toJulianDay', () => {
  it('riproduce l\'epoca J2000', () => {
    // 1° gennaio 2000, 12:00 UT → JD 2451545.0 per definizione.
    expect(toJulianDay(2000, 1, 1, 12)).toBeCloseTo(2451545.0, 6);
  });

  it('gestisce gennaio e febbraio come mesi 13 e 14 dell\'anno precedente', () => {
    // Valore di riferimento da Meeus, Astronomical Algorithms, esempio 7.a.
    expect(toJulianDay(1957, 10, 4, 19.5)).toBeCloseTo(2436116.31, 2);
  });

  it('avanza di mezzo giorno ogni 12 ore', () => {
    expect(toJulianDay(2024, 6, 15, 12) - toJulianDay(2024, 6, 15, 0)).toBeCloseTo(0.5, 9);
  });
});
