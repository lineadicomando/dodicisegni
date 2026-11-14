import { DateTime, IANAZone } from 'luxon';
import { ChartError } from './errors.js';
import type { LocalMoment, ResolvedTime } from './types.js';

export interface TimeResolution {
  time: ResolvedTime;
  warnings: string[];
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}(:\d{2})?$/;

/**
 * Converte data e ora **locali** in Tempo Universale, applicando le regole
 * storiche del fuso (ora legale di guerra, ora unica adottata nel 1893, ecc.).
 *
 * È il punto più delicato del calcolo: un errore di un'ora qui sposta
 * l'Ascendente di circa 15 gradi.
 *
 * **Prima dell'ora unica il fuso non sa dove si è nati.** Il database dei fusi
 * dà a tutto il paese il tempo medio della città che dà il nome al fuso:
 * `Europe/Rome` nel 1850 vale 49 minuti e 56 secondi a Roma, a Lecce e a
 * Torino, che sul proprio meridiano ne avrebbero 73 e 31. Qui non si
 * corregge, perché lo stesso scarto è anche l'ora legale di un paese che ha
 * adottato il tempo della capitale (l'Italia prima del 1893, la Francia fino
 * al 1911), e fra i due casi il runtime non distingue: dà lo scarto e non il
 * suo nome. Si dichiara, con l'avviso di `avvisoTempoMedio`.
 *
 * Gli avvisi riguardano la sola conversione — ora ambigua o mai esistita,
 * tempo medio di una città, le 24:00. Che
 * l'ora manchi si legge in `timeKnown`, e a dire che cosa comporti è chi sa
 * di che istante si tratti: in un tema natale sposta le case, in un quadro di
 * transiti quasi solo la Luna.
 */
export function resolveTime(moment: LocalMoment): TimeResolution {
  const warnings: string[] = [];

  if (!DATE_PATTERN.test(moment.date)) {
    throw new ChartError(
      'DATA_NON_VALIDA',
      `Data "${moment.date}" non valida: atteso il formato YYYY-MM-DD.`,
    );
  }
  if (moment.time !== undefined && !TIME_PATTERN.test(moment.time)) {
    throw new ChartError(
      'ORA_NON_VALIDA',
      `Ora "${moment.time}" non valida: atteso il formato HH:mm oppure HH:mm:ss.`,
    );
  }
  if (!IANAZone.isValidZone(moment.timezone)) {
    throw new ChartError(
      'FUSO_ORARIO_NON_VALIDO',
      `Fuso orario "${moment.timezone}" sconosciuto: atteso un identificatore IANA, es. Europe/Rome.`,
    );
  }

  const timeKnown = moment.time !== undefined;

  // Le 24:00 sono una scrittura legittima della mezzanotte che chiude il
  // giorno, e sui documenti si trova: l'istante è le 00:00 del giorno dopo.
  // Va detto, perché la data che ne esce non è quella scritta.
  if (moment.time?.startsWith('24:')) {
    warnings.push(
      `L'ora ${moment.time} del ${moment.date} è stata letta come la mezzanotte che chiude ` +
        'quel giorno, cioè le 00:00 del giorno dopo.',
    );
  }

  const wallClock = `${moment.date}T${normalizeTime(moment.time ?? '12:00')}`;
  const parsed = DateTime.fromISO(wallClock, { zone: moment.timezone });

  if (!parsed.isValid) {
    throw new ChartError(
      'DATA_NON_VALIDA',
      `Impossibile interpretare "${wallClock}" nel fuso ${moment.timezone}: ${parsed.invalidReason}.`,
    );
  }

  // Un'ora ambigua non si lascia sciogliere a Luxon: parte dall'offset che il
  // fuso ha **adesso** e lo tiene se torna, quindi la stessa nascita darebbe
  // un'occorrenza d'estate e l'altra d'inverno, a un'ora di distanza. Si
  // prende la prima delle due, sempre, che è quella che l'avviso dichiara.
  // L'ora inesistente non ha interpretazioni fra cui scegliere, e lì Luxon è
  // deterministico: resta la sua.
  const interpretations = interpretationsOf(wallClock, moment.timezone);
  const local = interpretations[0] ?? parsed;

  if (timeKnown) {
    if (interpretations.length === 0) {
      warnings.push(
        `L'ora locale ${moment.time} del ${moment.date} non è mai esistita in ${moment.timezone} ` +
          "(passaggio all'ora legale). È stata usata l'ora immediatamente successiva.",
      );
    } else if (interpretations.length > 1) {
      warnings.push(
        `L'ora locale ${moment.time} del ${moment.date} è ambigua in ${moment.timezone} ` +
          "(ritorno all'ora solare): ricorre due volte. È stata usata la prima occorrenza, " +
          "cioè quella ancora in ora legale.",
      );
    }
  }

  // Senza l'ora il tema non ha case, e venti minuti sul mezzogiorno di
  // ripiego non spostano niente che la carta mostri come certo.
  if (timeKnown && isCityMeanTime(local.offset)) {
    warnings.push(avvisoTempoMedio(moment, local.offset));
  }

  const utc = local.toUTC();

  return {
    time: {
      julianDayUT: toJulianDay(
        utc.year,
        utc.month,
        utc.day,
        utc.hour + utc.minute / 60 + utc.second / 3600 + utc.millisecond / 3_600_000,
      ),
      utc: utc.toISO({ suppressMilliseconds: true }),
      local: local.toISO({ suppressMilliseconds: true }),
      offsetMinutes: local.offset,
      timeKnown,
    },
    warnings,
  };
}

/**
 * Uno scarto da Greenwich che non è un numero intero di minuti è il tempo
 * medio di un meridiano, non un fuso: nessun fuso è mai stato definito al
 * secondo. È il solo segno che il runtime lascia, e non dice se quel tempo
 * fosse locale o già legale per tutto il paese.
 */
function isCityMeanTime(offsetMinutes: number): boolean {
  return !Number.isInteger(offsetMinutes);
}

function avvisoTempoMedio(moment: LocalMoment, offsetMinutes: number): string {
  const secondi = Math.round(Math.abs(offsetMinutes) * 60);
  const scarto =
    `${offsetMinutes < 0 ? '-' : '+'}${Math.floor(secondi / 3600)}:` +
    `${String(Math.floor((secondi % 3600) / 60)).padStart(2, '0')}:` +
    String(secondi % 60).padStart(2, '0');

  return (
    `Nel ${moment.date.slice(0, 4)} ${moment.timezone} non era ancora un fuso: l'ora è stata letta ` +
    `come tempo medio della città che gli dà il nome (${scarto} da Greenwich), per qualunque ` +
    "luogo. Se l'orologio del luogo seguiva il proprio meridiano, l'istante vero si sposta di " +
    'quattro minuti per ogni grado di longitudine che lo separa da quella città, e con lui ' +
    "l'Ascendente e le case."
  );
}

/**
 * L'istante presente, in ora locale di un fuso.
 *
 * Sta qui perché «che giorno è adesso» è una domanda sul fuso orario, e le
 * superfici che accettano il presente — la riga di comando senza `--on`, il
 * tool MCP senza `transit_date` — devono rispondersi tutte allo stesso modo.
 * Vale soprattutto per un agente, che la data corrente non la sa e non deve
 * tirarla a indovinare.
 */
export function currentMoment(timezone: string): LocalMoment {
  if (!IANAZone.isValidZone(timezone)) {
    throw new ChartError(
      'FUSO_ORARIO_NON_VALIDO',
      `Fuso orario "${timezone}" sconosciuto: atteso un identificatore IANA, es. Europe/Rome.`,
    );
  }

  const now = DateTime.now().setZone(timezone);
  return {
    date: now.toFormat('yyyy-MM-dd'),
    time: now.toFormat('HH:mm'),
    timezone,
  };
}

/**
 * Il fuso orario del sistema su cui gira il processo.
 *
 * Non cambia il cielo — l'istante è uno solo, ovunque lo si guardi — ma
 * decide come vengono scritte data e ora. Esiste perché chiedere il cielo di
 * adesso non debba costringere a dichiarare anche dove si è.
 */
export function systemTimezone(): string {
  return DateTime.local().zoneName;
}

function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

/**
 * Gli istanti che corrispondono a un dato orario da parete, dal primo.
 *
 * - nessuno: l'orario non esiste (salto in avanti per l'ora legale)
 * - uno: caso normale
 * - due: orario ambiguo (ritorno all'ora solare)
 *
 * Verifica ogni offset in vigore nell'intorno della data: per ciascuno
 * ricostruisce l'istante UTC e controlla se, riconvertito nel fuso, produce
 * di nuovo lo stesso orario da parete. Gli offset si leggono un giorno prima
 * e uno dopo, su istanti che ambigui non sono: il risultato non dipende da
 * come Luxon ha interpretato l'orario stesso.
 */
function interpretationsOf(wallClock: string, zone: string): DateTime<true>[] {
  const reference = DateTime.fromISO(wallClock, { zone: 'utc' });
  const base = DateTime.fromISO(wallClock, { zone });
  if (!reference.isValid || !base.isValid) return [];

  const candidateOffsets = new Set<number>([
    base.offset,
    base.minus({ days: 1 }).offset,
    base.plus({ days: 1 }).offset,
  ]);

  const target = reference.toFormat("yyyy-MM-dd'T'HH:mm:ss");
  const matches: DateTime<true>[] = [];
  for (const offset of candidateOffsets) {
    const candidate = DateTime.fromMillis(reference.toMillis() - offset * 60_000, { zone });
    if (candidate.isValid && candidate.toFormat("yyyy-MM-dd'T'HH:mm:ss") === target) {
      matches.push(candidate);
    }
  }
  return matches.sort((a, b) => a.toMillis() - b.toMillis());
}

/**
 * Giorno giuliano dal calendario gregoriano (algoritmo di Meeus,
 * *Astronomical Algorithms*, cap. 7).
 *
 * Calcolato qui invece che via `sweph.julday` per tenere la conversione
 * temporale indipendente dal modulo nativo — è la parte che va testata di più.
 */
export function toJulianDay(year: number, month: number, day: number, hour: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const dayFraction = day + hour / 24;
  return (
    Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFraction + b - 1524.5
  );
}
