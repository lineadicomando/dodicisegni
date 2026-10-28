import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sweph from 'sweph';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { computeBodies, initEphemeris, resetEphemerisCache } from '../src/ephemeris.js';
import type { BirthData, BodyId } from '../src/types.js';

const EPHE_DIR = fileURLToPath(new URL('../ephe', import.meta.url));
const NO_EPHE_DIR = '/tmp/dodicisegni-cartella-inesistente';

/** I file `.se1` non sono versionati: i test che li richiedono si autoescludono. */
const hasEphemerisFiles = existsSync(`${EPHE_DIR}/sepl_18.se1`);

const BIRTH: BirthData = {
  date: '1968-03-12',
  time: '14:30',
  latitude: 40.8518,
  longitude: 14.2681,
  timezone: 'Europe/Rome',
};

beforeEach(resetEphemerisCache);
afterEach(resetEphemerisCache);

describe('ripiego sulle effemeridi Moshier', () => {
  it('funziona senza alcun file di effemeridi', () => {
    const context = initEphemeris(NO_EPHE_DIR);

    expect(context.mode).toBe('moshier');
    expect(context.path).toBeNull();
    expect(context.asteroidsAvailable).toBe(false);
    expect(context.warnings.some((w) => w.includes('Moshier'))).toBe(true);
  });

  it('calcola comunque un tema completo', () => {
    const chart = computeNatalChart(BIRTH, { ephemerisPath: NO_EPHE_DIR });

    expect(chart.ephemerisMode).toBe('moshier');
    expect(chart.bodies.length).toBeGreaterThan(0);
    expect(chart.houses).toHaveLength(12);
  });

  it('omette Chirone segnalandolo, invece di far fallire il calcolo', () => {
    const chart = computeNatalChart(BIRTH, {
      bodies: ['sole', 'chirone'],
      ephemerisPath: NO_EPHE_DIR,
    });

    expect(chart.bodies.map((b) => b.id)).toEqual(['sole']);
    expect(chart.warnings.some((w) => w.includes('Chirone non calcolabile'))).toBe(true);
  });
});

describe.skipIf(!hasEphemerisFiles)('modalità Swiss Ephemeris', () => {
  it('rileva i file e attiva il modo swisseph', () => {
    const context = initEphemeris(EPHE_DIR);

    expect(context.mode).toBe('swisseph');
    expect(context.path).toBe(EPHE_DIR);
  });

  it('calcola Chirone quando il file degli asteroidi è presente', () => {
    const chart = computeNatalChart(BIRTH, { bodies: ['sole', 'chirone'], ephemerisPath: EPHE_DIR });

    const chiron = chart.bodies.find((b) => b.id === 'chirone');
    expect(chiron).toBeDefined();
    expect(chiron?.longitude).toBeGreaterThanOrEqual(0);
    expect(chiron?.longitude).toBeLessThan(360);
  });

  it('concorda con Moshier entro pochi secondi d\'arco', () => {
    // Verifica che il ripiego non degradi il risultato oltre l'accettabile:
    // in astrologia anche un minuto d'arco è irrilevante, ma uno scarto
    // grande segnalerebbe un errore di configurazione.
    resetEphemerisCache();
    const swiss = computeNatalChart(BIRTH, {
      bodies: ['sole', 'luna', 'plutone'],
      ephemerisPath: EPHE_DIR,
    });
    resetEphemerisCache();
    const moshier = computeNatalChart(BIRTH, {
      bodies: ['sole', 'luna', 'plutone'],
      ephemerisPath: NO_EPHE_DIR,
    });

    for (const body of swiss.bodies) {
      const other = moshier.bodies.find((b) => b.id === body.id);
      expect(other).toBeDefined();
      const arcSeconds = Math.abs(body.longitude - other!.longitude) * 3600;
      expect(arcSeconds).toBeLessThan(5);
    }
  });
});

/**
 * Quanto scarta Moshier dalle Swiss Ephemeris, misurato qui e non riportato.
 *
 * La documentazione di Swiss Ephemeris (`swisseph.txt`, «The Moshier
 * Ephemeris») dice solo «below 1 arc second with the planets and a few arc
 * seconds with the Moon», e la prosa del progetto portava due cifre diverse
 * senza una fonte. Le soglie vengono da una misura fitta, il 28 ottobre 2026:
 * ogni due anni dal 1800 al 2398, quattro date l'anno, longitudine
 * eclittica. I massimi trovati, in secondi d'arco:
 *
 * | | 1900-2100 | 1800-2400 |
 * |---|---|---|
 * | Sole, Mercurio | 0,13 | 0,15 |
 * | Venere, Marte, Giove, Saturno | 1,05 | 1,23 |
 * | Luna | 2,1 | 3,5 |
 * | Urano, Nettuno | 2,1 | 4,9 |
 * | Plutone | 1,5 | 8,5 |
 * | Nodi medi, Lilith media | 0 | 0 |
 *
 * Moshier degrada allontanandosi dal presente, e i pianeti esterni più degli
 * altri. Il test campiona più rado, ogni venticinque anni, e cade se uno
 * scarto esce dalla sua fascia: è la fascia, non il massimo, che la prosa
 * dichiara (`ephemeris.ts`, `dasha.ts`, il README e la pagina del metodo).
 */
describe.skipIf(!hasEphemerisFiles)('scarto di Moshier dalle Swiss Ephemeris, 1800-2400', () => {
  const FASCE: { corpi: BodyId[]; soglia: number }[] = [
    { corpi: ['sole', 'mercurio'], soglia: 0.2 },
    { corpi: ['venere', 'marte', 'giove', 'saturno'], soglia: 1.5 },
    { corpi: ['luna'], soglia: 4 },
    { corpi: ['urano', 'nettuno'], soglia: 5 },
    { corpi: ['plutone'], soglia: 10 },
    { corpi: ['nodo-nord', 'nodo-sud', 'lilith'], soglia: 0.01 },
  ];

  it.each(FASCE)('$corpi entro $soglia″', ({ corpi, soglia }) => {
    resetEphemerisCache();
    const swiss = initEphemeris(EPHE_DIR);
    resetEphemerisCache();
    const moshier = initEphemeris(NO_EPHE_DIR);
    expect(swiss.mode).toBe('swisseph');
    expect(moshier.mode).toBe('moshier');

    let peggiore = 0;
    for (let anno = 1800; anno <= 2375; anno += 25) {
      for (const mese of [1, 4, 7, 10]) {
        const jd = sweph.julday(anno, mese, 1, 12, sweph.constants.SE_GREG_CAL);
        const a = computeBodies(jd, corpi, swiss);
        const b = computeBodies(jd, corpi, moshier);
        expect(a.bodies).toHaveLength(corpi.length);
        for (const corpo of a.bodies) {
          const altro = b.bodies.find((x) => x.id === corpo.id)!;
          let d = Math.abs(corpo.longitude - altro.longitude);
          if (d > 180) d = 360 - d;
          peggiore = Math.max(peggiore, d * 3600);
        }
      }
    }
    expect(peggiore).toBeLessThan(soglia);
  });
});
