/**
 * I prompt del server: il tema già impaginato insieme alle istruzioni per
 * leggerlo.
 *
 * Un prompt e non un tool, ed è la differenza che conta. I tool li chiama il
 * modello quando gli servono; **i prompt li sceglie chi usa il client**, per
 * nome, dal suo menu. Il server continua quindi a non chiedere a nessuno di
 * interpretare niente: offre le istruzioni a chi le domanda, e finché nessuno
 * le domanda non occupano un token.
 *
 * È la stessa cosa che il sito mette sotto il pulsante che copia negli
 * appunti, e viene dallo stesso posto — `@dodicisegni/lettura` — perché due
 * copie di quel testo divergerebbero, e quel testo è il riferimento unico per
 * la lettura.
 *
 * La differenza è che qui non si incolla: il tema lo calcola il server dentro
 * al prompt. Chiedere all'agente di chiamare prima `compute_natal_chart` e poi
 * di appiccicarci le istruzioni gli lascerebbe due modi di sbagliare — la
 * tabella riscritta a mano, e le istruzioni riassunte.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  computeHoraryLilly,
  currentMoment,
  formatHoraryCompact,
  computeJyotisha,
  computeNatalChart,
  formatChartCompact,
  formatJyotishaCompact,
  type BirthData,
  type ChartOptions,
} from '@dodicisegni/core';
import { letturaDaIncollare, letturaOrariaDaIncollare, SISTEMI, type Sistema } from '@dodicisegni/lettura';
import { z } from 'zod';
import { describeError, resolvePlace, type ToolContext } from './tools.js';

/** Il sistema predefinito: l'astrologia occidentale, che è ciò che si aspetta
 * chi non specifica niente. */
const SISTEMA_PREDEFINITO: Sistema = 'tropicale';

export function registerLetturaDelTema(server: McpServer, context: ToolContext = {}): void {
  server.registerPrompt(
    'lettura_del_tema',
    {
      title: 'Leggi un tema natale',
      description:
        'Calcola un tema natale e lo consegna insieme alle istruzioni per interpretarlo. ' +
        'Da usare quando chi scrive vuole una lettura del tema, non i suoi numeri: per i ' +
        'soli dati basta il tool compute_natal_chart. Le istruzioni che arrivano con il ' +
        'tema sono vincolanti e vanno seguite come sono, non riassunte: dicono anche che ' +
        'cosa non fare. Data e ora vanno indicate COME SONO SEGNATE sul documento di ' +
        "nascita, in ora locale. Se l'ora è ignota ometti il parametro: la lettura ne terrà " +
        'conto, mentre un orario inventato produce case e assi falsi senza dirlo.',
      argsSchema: {
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato atteso: YYYY-MM-DD.')
          .describe('Data di nascita locale, formato YYYY-MM-DD.'),
        time: z
          .string()
          .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato atteso: HH:mm.')
          .optional()
          .describe("Ora di nascita locale, formato HH:mm. Ometti se ignota: non indovinarla."),
        location_id: z
          .string()
          .optional()
          .describe('Identificatore GeoNames da search_location. Alternativo alla terna.'),
        latitude: z.string().optional().describe('Latitudine in gradi decimali, positiva a Nord.'),
        longitude: z.string().optional().describe('Longitudine in gradi decimali, positiva a Est.'),
        timezone: z
          .string()
          .optional()
          .describe('Fuso orario IANA, es. "Europe/Rome". Obbligatorio senza location_id.'),
        sistema: z
          .string()
          .optional()
          .describe(
            `Sistema astrologico della lettura. Ammessi: ${SISTEMI.join(', ')}. ` +
              `Default: ${SISTEMA_PREDEFINITO}, che è l'astrologia occidentale. ` +
              'jyotisha è quella indiana: zodiaco siderale, case a segni interi, e ' +
              'in più nakshatra, dasha, navamsa, drishti e dignità. Non sceglierlo tu: ' +
              'chiedilo solo se chi scrive lo domanda.',
          ),
      },
    },
    (args) => {
      const testo = componi(args, context);
      return {
        messages: [{ role: 'user', content: { type: 'text', text: testo } }],
      };
    },
  );
}

/**
 * Il testo del prompt, o il motivo per cui non c'è.
 *
 * Un fallimento torna come messaggio invece che come eccezione: chi ha
 * invocato il prompt dal menu del client si aspetta di vedere qualcosa nella
 * conversazione, e un errore di protocollo lì sparisce senza dire che cosa
 * correggere.
 */
function componi(
  args: {
    date: string;
    time?: string | undefined;
    location_id?: string | undefined;
    latitude?: string | undefined;
    longitude?: string | undefined;
    timezone?: string | undefined;
    sistema?: string | undefined;
  },
  context: ToolContext,
): string {
  const sistema = args.sistema ?? SISTEMA_PREDEFINITO;
  if (!SISTEMI.includes(sistema as Sistema)) {
    // Rifiutato invece che ricondotto al predefinito: chi scrive un sistema
    // che non esiste deve saperlo, non ricevere una lettura di un altro.
    return `Sistema "${sistema}" non riconosciuto. Ammessi: ${SISTEMI.join(', ')}.`;
  }

  const numero = (valore: string | undefined): number | undefined => {
    if (valore === undefined || valore.trim() === '') return undefined;
    const n = Number(valore);
    return Number.isFinite(n) ? n : Number.NaN;
  };

  const location_id = numero(args.location_id);
  const latitude = numero(args.latitude);
  const longitude = numero(args.longitude);
  if ([location_id, latitude, longitude].some((v) => v !== undefined && Number.isNaN(v))) {
    return 'location_id, latitude e longitude devono essere numeri.';
  }

  const place = resolvePlace(
    {
      ...(location_id !== undefined ? { location_id } : {}),
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {}),
      ...(args.timezone !== undefined ? { timezone: args.timezone } : {}),
    },
    context,
  );
  if ('error' in place) return place.error;

  try {
    const birth: BirthData = {
      date: args.date,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
    };
    if (args.time !== undefined) birth.time = args.time;

    // Il tema che accompagna le istruzioni è quello che le istruzioni
    // descrivono. Un tema tropicale sotto le istruzioni vediche non darebbe un
    // errore: darebbe un ibrido plausibile, sbagliato di quasi un segno, e
    // nessuno se ne accorgerebbe. Qui la coppia si decide in un punto solo.
    const vedico = sistema === 'jyotisha';
    const options: ChartOptions = {};
    if (context.ephemerisPath) options.ephemerisPath = context.ephemerisPath;
    if (vedico) {
      options.zodiac = 'siderale';
      // Le case a segni interi perché è così che il Jyotisha le conta, e le
      // istruzioni lo dicono: consegnare cuspidi di Placidus accanto sarebbe
      // una contraddizione dentro lo stesso testo.
      options.houseSystem = 'segni-interi';
    }

    const chart = computeNatalChart(birth, options);

    // Il luogo in testa alla tabella come nel tool: nel JSON sta in un campo a
    // parte, e qui un campo a parte non c'è.
    const intestazione = place.label ? `Luogo di nascita: ${place.label}\n` : '';
    const tavola = vedico
      ? formatJyotishaCompact(computeJyotisha(chart))
      : formatChartCompact(chart);

    return letturaDaIncollare(intestazione + tavola, { sistema: sistema as Sistema });
  } catch (error) {
    return describeError(error);
  }
}

/**
 * Il prompt dell'oraria: la domanda, la figura e le istruzioni per leggerla.
 *
 * La domanda è un argomento e non un contesto lasciato al modello: senza,
 * le istruzioni non sanno a che cosa rispondere, e la stessa figura dice cose
 * diverse a domande diverse. La casa invece resta da indicare, come nel tool:
 * sceglierla è il primo passo del giudizio, e il motore non lo fa al posto di
 * nessuno.
 */
export function registerLetturaOraria(server: McpServer, context: ToolContext = {}): void {
  server.registerPrompt(
    'lettura_oraria',
    {
      title: 'Leggi una domanda con l\'astrologia oraria',
      description:
        "Erige il tema orario di una domanda col metodo di Lilly e lo consegna insieme alle " +
        'istruzioni per giudicarlo, nel registro attribuito («secondo il metodo di Lilly la figura ' +
        'indica…»). Le istruzioni sono vincolanti e dicono anche che cosa non si giudica: salute, ' +
        'morte, cause e denaro. Ometti date e time per l\'istante presente.',
      argsSchema: {
        domanda: z.string().min(1).describe('La domanda, come l\'ha posta chi chiede.'),
        casa: z.string().describe('La casa del quesito, 1-12, scelta dalla domanda.'),
        derivata_da: z.string().optional().describe('Per le case derivate: la casa da cui contare.'),
        date: z.string().optional().describe('Giorno della domanda, YYYY-MM-DD. Ometti per adesso.'),
        time: z.string().optional().describe('Ora della domanda, HH:mm. Ometti per adesso.'),
        location_id: z.string().optional().describe('Dove si trova chi chiede, da search_location.'),
        latitude: z.string().optional().describe('Latitudine, positiva a Nord.'),
        longitude: z.string().optional().describe('Longitudine, positiva a Est.'),
        timezone: z.string().optional().describe('Fuso IANA. Obbligatorio senza location_id.'),
      },
    },
    (args) => ({
      messages: [{ role: 'user', content: { type: 'text', text: componiOraria(args, context) } }],
    }),
  );
}

function componiOraria(
  args: {
    domanda: string;
    casa: string;
    derivata_da?: string | undefined;
    date?: string | undefined;
    time?: string | undefined;
    location_id?: string | undefined;
    latitude?: string | undefined;
    longitude?: string | undefined;
    timezone?: string | undefined;
  },
  context: ToolContext,
): string {
  const intero = (valore: string | undefined): number | undefined =>
    valore === undefined || valore.trim() === '' ? undefined : Number(valore);
  const casa = intero(args.casa);
  const derivata = intero(args.derivata_da);
  if (casa === undefined || !Number.isInteger(casa) || casa < 1 || casa > 12) {
    return 'casa deve essere un numero da 1 a 12: la casa del quesito, scelta dalla domanda.';
  }
  if (derivata !== undefined && (!Number.isInteger(derivata) || derivata < 1 || derivata > 12)) {
    return 'derivata_da deve essere un numero da 1 a 12.';
  }
  if (args.date !== undefined && args.time === undefined) {
    return "Con date va indicata anche time: senza l'ora della domanda la figura non ha case.";
  }

  const location_id = intero(args.location_id);
  const latitude = intero(args.latitude);
  const longitude = intero(args.longitude);
  if ([location_id, latitude, longitude].some((v) => v !== undefined && Number.isNaN(v))) {
    return 'location_id, latitude e longitude devono essere numeri.';
  }
  const place = resolvePlace(
    {
      ...(location_id !== undefined ? { location_id } : {}),
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {}),
      ...(args.timezone !== undefined ? { timezone: args.timezone } : {}),
    },
    context,
  );
  if ('error' in place) return place.error;

  try {
    const moment =
      args.date === undefined
        ? currentMoment(place.timezone)
        : { date: args.date, time: args.time!, timezone: place.timezone };
    const horary = computeHoraryLilly(
      moment,
      { latitude: place.latitude, longitude: place.longitude },
      {
        question: { house: casa, ...(derivata !== undefined ? { derivedFrom: derivata } : {}) },
        ...(context.ephemerisPath ? { ephemerisPath: context.ephemerisPath } : {}),
      },
    );
    const intestazione = place.label ? `Luogo: ${place.label}\n` : '';
    return letturaOrariaDaIncollare(args.domanda, intestazione + formatHoraryCompact(horary));
  } catch (error) {
    return describeError(error);
  }
}
