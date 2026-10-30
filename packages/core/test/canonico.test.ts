import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { initEphemeris, resetEphemerisCache } from '../src/ephemeris.js';
import { computeHoraryLilly } from '../src/oraria-lilly.js';
import { computeJyotisha } from '../src/jyotisha.js';
import { computePanchanga } from '../src/panchanga.js';
import { computeSky } from '../src/sky.js';
import { computeTransits } from '../src/transits.js';
import { VARGAS } from '../src/varga.js';
import type { BirthData, Place, VargaId } from '../src/types.js';

/**
 * Il fascicolo canonico: le risposte del motore su input fissi, per intero.
 *
 * `CLAUDE.md` (*La versione*) fa decidere la cifra che si muove da una
 * domanda prima di tutte: **una domanda che aveva già una risposta ne riceve
 * un'altra?** È una domanda sui valori, non sul codice, e nessun'altra prova
 * la risolve: ciascuna asserisce quello per cui è stata scritta, e un tema
 * può cambiare in un punto che nessuno ha pensato di asserire. Questa
 * asserisce risposte intere.
 *
 * **Un file di `canonico/` che cambia è la risposta, stampata invece che
 * giudicata**: la seconda cifra si muove. Una sessione che qui non cambia
 * niente non ha cambiato nessuna risposta che c'era, qualunque altra cosa
 * abbia fatto. Quando il cambiamento è voluto, i file si riscrivono con
 * `npx vitest run test/canonico.test.ts -u` e il diff entra nel commit.
 *
 * Non è una prova di dominio e non la sostituisce: le tavole si provano
 * contro le fonti nei test accanto. Qui c'è una rete sotto le risposte, che
 * prende il cambiamento che nessuno ha previsto.
 *
 * **Ogni caso oltre il primo è scelto per un ramo** che il tema di Napoli
 * del 1968 non tocca: la notte, l'ora ignota, lo zodiaco siderale con un
 * ayanamsa diverso dal predefinito, le quattro scuole delle dignità, un cielo
 * senza luogo. Le rotte che costano secondi (passaggi, transiti attivi,
 * calendario del cielo, elezione) restano fuori: girano su intervalli, e un
 * intervallo abbastanza corto da stare in una prova non direbbe di più dei
 * calcoli d'istante che usano.
 */

/**
 * Sempre Moshier, e i file sono le sue risposte.
 *
 * Il motore usa Swiss Ephemeris dove ci sono i `.se1` e Moshier dove non ci
 * sono, e un file fissato su ciò che la macchina aveva cambierebbe con un
 * download. Moshier non chiede file, e lo calcolano sia un clone appena fatto
 * sia questo repository. La cartella è inesistente apposta, e per la stessa
 * ragione mancano le stelle fisse (`sefstars.txt` sta con le effemeridi e non
 * è versionato): le righe di Lilly che ne dipendono dicono «mancano» in ogni
 * file, e le provano `condizioni-lilly.test.ts` e `oraria-lilly.test.ts`
 * dove il catalogo c'è.
 *
 * Il percorso entra nell'avvertenza delle effemeridi, ed è per questo che è
 * fisso: niente si filtra dai file. Un fascicolo che togliesse in silenzio un
 * campo sarebbe una rete con un buco della forma di ciò che dava fastidio.
 */
const SENZA_EFFEMERIDI = '/fascicolo-canonico-senza-effemeridi';

beforeAll(() => {
  resetEphemerisCache();
  expect(initEphemeris(SENZA_EFFEMERIDI).mode, 'il fascicolo si calcola con Moshier').toBe('moshier');
});

// La cache è indicizzata dal percorso: lasciata così, consegnerebbe alla
// prova successiva un contesto che non ha chiesto.
afterAll(() => {
  resetEphemerisCache();
});

/** Napoli, e l'istante che il repository usa già per i suoi esempi. */
const NAPOLI: BirthData = {
  date: '1968-03-12',
  time: '14:30',
  latitude: 40.8518,
  longitude: 14.2681,
  timezone: 'Europe/Rome',
};

const ROMA: Place = { latitude: 41.9028, longitude: 12.4964 };

const E = { ephemerisPath: SENZA_EFFEMERIDI };

const TUTTI_I_VARGA = VARGAS.map((varga) => varga.id).filter((id) => id !== 'd1') as VargaId[];

/** Le superfici, una per file. La chiave di ogni caso è quello che un diff fa leggere. */
const FASCICOLO: Record<string, () => Record<string, unknown>> = {
  tema: () => ({
    'Napoli 1968, diurno': computeNatalChart(NAPOLI, E),
    // Le 2:30 della stessa notte: la setta si rovescia, e con lei la Parte di
    // Fortuna di settore e i reggenti di triplicità che ne dipendono.
    'Napoli 1968, notturno': computeNatalChart({ ...NAPOLI, time: '02:30' }, E),
    // Senza ora: niente case, niente angoli, la Luna con la sua escursione.
    'Napoli 1968, ora ignota': computeNatalChart({ ...NAPOLI, time: undefined }, E),
  }),
  dignita: () => ({
    lilly: computeNatalChart(NAPOLI, { ...E, dignitySchool: 'lilly' }).dignities,
    tolomeo: computeNatalChart(NAPOLI, { ...E, dignitySchool: 'tolomeo' }).dignities,
    bonatti: computeNatalChart(NAPOLI, { ...E, dignitySchool: 'bonatti' }).dignities,
    valente: computeNatalChart(NAPOLI, { ...E, dignitySchool: 'valente' }).dignities,
    'lilly, notturno': computeNatalChart({ ...NAPOLI, time: '02:30' }, { ...E, dignitySchool: 'lilly' }).dignities,
  }),
  vedico: () => {
    const lahiri = computeNatalChart(NAPOLI, { ...E, zodiac: 'siderale' });
    const raman = computeNatalChart(NAPOLI, { ...E, zodiac: 'siderale', ayanamsa: 'raman' });
    return {
      'Napoli 1968, Lahiri, i predefiniti': computeJyotisha(lahiri, E),
      // Tutti e sedici i varga, il D-2 compreso, coi tre ordini di dasha.
      'Napoli 1968, Lahiri, tutto': computeJyotisha(lahiri, {
        ...E,
        vargas: TUTTI_I_VARGA,
        dasha: { levels: 3 },
        drishti: { nodes: 'gioviana' },
      }),
      'Napoli 1968, Raman, il tema': raman,
      'Napoli 1968, ora ignota': computeJyotisha(
        computeNatalChart({ ...NAPOLI, time: undefined }, { ...E, zodiac: 'siderale' }),
        E,
      ),
    };
  },
  panchanga: () => ({
    'Napoli 1968': computePanchanga({ date: NAPOLI.date, time: NAPOLI.time, timezone: NAPOLI.timezone }, NAPOLI, E),
  }),
  cielo: () => ({
    'Roma 2026-10-30, con Lilly': computeSky(
      { date: '2026-10-30', time: '12:00', timezone: 'Europe/Rome' },
      { ...E, place: ROMA, dignitySchool: 'lilly' },
    ),
    // Senza luogo: niente case né assi, e la distribuzione senza il loro gruppo.
    '2026-10-30, senza luogo': computeSky({ date: '2026-10-30', time: '12:00', timezone: 'Europe/Rome' }, E),
  }),
  transiti: () => ({
    'su Napoli 1968, al 2026-08-01': computeTransits(
      computeNatalChart(NAPOLI, E),
      { date: '2026-08-01', time: '12:00', timezone: 'Europe/Rome' },
      E,
    ),
  }),
  oraria: () => ({
    'Roma 2026-10-27 22:15, settima casa': computeHoraryLilly(
      { date: '2026-10-27', time: '22:15', timezone: 'Europe/Rome' },
      ROMA,
      { ...E, question: { house: 7 } },
    ),
    // Una figura con una perfezione diretta, la congiunzione della Luna con
    // Saturno: le condizioni di qualità di p. 125 ci sono solo lì.
    'Roma 2026-01-21 15:00, settima casa, congiunzione': computeHoraryLilly(
      { date: '2026-01-21', time: '15:00', timezone: 'Europe/Rome' },
      ROMA,
      { ...E, question: { house: 7 } },
    ),
  }),
};

function scrivi(risposte: Record<string, unknown>): string {
  return `${JSON.stringify(risposte, null, 2)}\n`;
}

describe('il fascicolo canonico', () => {
  for (const [nome, calcola] of Object.entries(FASCICOLO)) {
    it(`dà le risposte del fascicolo: ${nome}`, async () => {
      await expect(scrivi(calcola())).toMatchFileSnapshot(`./canonico/${nome}.json`);
    });
  }

  it('è deterministico: due calcoli dello stesso caso danno lo stesso testo', () => {
    expect(scrivi(FASCICOLO['tema']!())).toBe(scrivi(FASCICOLO['tema']!()));
  });
});
