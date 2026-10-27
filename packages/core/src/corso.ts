/**
 * Il corso di un corpo fino all'uscita dal segno: che cosa succede, in ordine.
 *
 * È il substrato dell'astrologia oraria (voce 17 del `TODO.md`), e non
 * appartiene a nessuna scuola. Le scuole divergono su come **chiamare** quello
 * che succede, traslazione di luce, proibizione, refranazione; su **che cosa**
 * succede no, perché è moto: gli aspetti che il corpo perfeziona e con chi, le
 * sue stazioni, il cambio di segno, ciascuno col suo istante. Il calcolo si
 * compone di tre ricerche che il motore già fa, gli incontri in cielo, le
 * stazioni e gli ingressi, ristrette all'arco che finisce col segno.
 *
 * Sopra la sequenza stanno i classificatori, ciascuno con un nome e una
 * fonte. I primi due sono le due Lune vuote, che non coincidono: quella
 * moderna guarda solo gli aspetti esatti prima del cambio di segno, quella di
 * Lilly anche quelli che il corpo sta ancora formando quando esce, dentro le
 * orbite dei due pianeti. Una scuola nuova è un classificatore nuovo, non un
 * calcolo nuovo.
 *
 * Gli aspetti cercati sono i cinque tolemaici, fra i corpi nominati. Le
 * orbite servono solo al classificatore di Lilly: l'istante esatto di un
 * aspetto non ne ha bisogno.
 */

import { computeAspects } from './aspects.js';
import { computeBodies, initEphemeris } from './ephemeris.js';
import { ChartError } from './errors.js';
import { degreeInSign } from './math.js';
import { natalOrbConvention } from './orbite.js';
import { julianDayToISO, meanDailyMotion } from './roots.js';
import { findSignIngresses, findStations } from './sky-events.js';
import { findSkyPassages } from './sky-passages.js';
import type {
  BodyId,
  CourseEvent,
  PassageRange,
  SignCourse,
  SignCourseOptions,
  VoidVerdict,
} from './types.js';

/**
 * Oltre questo arco il segno non si guarda più: tre anni bastano a Saturno,
 * che con le retrogradazioni resta in un segno fino a due anni e mezzo. Urano,
 * Nettuno e Plutone ne impiegano di più, e la sequenza resta aperta: lo dice
 * un'avvertenza.
 */
export const MAX_COURSE_DAYS = 1100;

/** I corpi con cui gli aspetti si cercano se chi chiama non li nomina: i sette. */
const SETTE: readonly BodyId[] = ['sole', 'luna', 'mercurio', 'venere', 'marte', 'giove', 'saturno'];

/** Le due Lune vuote, con la fonte e la regola. */
const VUOTI = {
  moderno: {
    name: 'moderna',
    source:
      'Il criterio del calendario elettivo (election.ts): vuota dall\'ultimo aspetto esatto al cambio di segno.',
    rule: 'Vuota se fino al cambio di segno non perfeziona più nessun aspetto tolemaico con i corpi nominati.',
  },
  lilly: {
    name: 'Lilly',
    source:
      'Lilly, Christian Astrology (1647), p. 112: «when he is seperated from a Planet, nor doth forthwith, ' +
      'during his being in that Signe, apply to any other»; orbite di p. 107 (moieties).',
    rule:
      'Vuota se fino al cambio di segno non perfeziona nessun aspetto, e se quando esce non sta formando ' +
      'nessun aspetto entro la metà delle orbite dei due pianeti: un aspetto che si perfeziona nel segno ' +
      'dopo, ma che è già in orbita, è un\'applicazione. Solo fra i sette.',
  },
} as const;

/**
 * La sequenza degli eventi di un corpo dall'istante dato fino al cambio di
 * segno.
 *
 * @example
 * ```ts
 * const { time } = resolveTime({ date: '2026-10-27', time: '22:15', timezone: 'Europe/Rome' });
 * const corso = findSignCourse(time.julianDayUT, 'luna');
 * corso.events;   // aspetti, stazioni e, in fondo, l'ingresso
 * corso.voids;    // la Luna vuota moderna e quella di Lilly
 * ```
 */
export function findSignCourse(
  julianDay: number,
  body: BodyId,
  options: SignCourseOptions = {},
): SignCourse {
  const context = initEphemeris(options.ephemerisPath);
  const warnings: string[] = [...context.warnings];
  const timezone = options.timezone ?? 'UTC';
  const others = (options.bodies ?? SETTE).filter((id) => id !== body);
  meanDailyMotion(body); // un corpo sconosciuto si rifiuta qui, col codice del motore

  const { bodies, warnings: bodyWarnings } = computeBodies(julianDay, [body], context);
  warnings.push(...bodyWarnings);
  const now = bodies[0];
  if (!now) {
    throw new ChartError('CORPO_SCONOSCIUTO', `${body}: posizione non calcolabile all'istante richiesto.`);
  }

  const exit = findIngress(body, julianDay, 'dopo', warnings);
  const entry = findIngress(body, julianDay, 'prima', warnings);
  const segnoFinisce = exit?.julianDay ?? julianDay + MAX_COURSE_DAYS;
  const end = options.until !== undefined ? Math.min(segnoFinisce, Math.max(options.until, julianDay)) : segnoFinisce;
  const conUscita = exit !== undefined && exit.julianDay <= end;
  const from = entry?.julianDay ?? julianDay;

  const perfezioni: (CourseEvent & { julianDay: number })[] = [];
  for (const other of others) {
    const { passages, warnings: passageWarnings } = findSkyPassages(dayRange(from, end), {
      bodies: [body, other],
      ...(options.ephemerisPath ? { ephemerisPath: options.ephemerisPath } : {}),
    });
    for (const warning of passageWarnings) if (!warnings.includes(warning)) warnings.push(warning);
    for (const passage of passages) {
      const exact = isoToJulianDay(passage.exact);
      if (exact <= from || exact >= end) continue;
      const lui = passage.faster === body ? 'faster' : 'slower';
      const altro = lui === 'faster' ? 'slower' : 'faster';
      perfezioni.push({
        kind: 'aspetto',
        with: other,
        aspect: passage.aspect,
        retrograde: { body: passage.retrograde[lui], other: passage.retrograde[altro] },
        exact: julianDayToISO(exact),
        local: julianDayToISO(exact, timezone),
        julianDay: exact,
      });
    }
  }

  const stazioni = findStations(dayRange(julianDay, end), {
    bodies: [body],
    ...(options.ephemerisPath ? { ephemerisPath: options.ephemerisPath } : {}),
  }).stations.flatMap((station) => {
    const exact = isoToJulianDay(station.exact);
    if (exact <= julianDay || exact >= end) return [];
    return [
      {
        kind: 'stazione' as const,
        direction: station.direction,
        longitude: station.longitude,
        exact: julianDayToISO(exact),
        local: julianDayToISO(exact, timezone),
        julianDay: exact,
      },
    ];
  });

  const prima = perfezioni.filter((event) => event.julianDay < julianDay);
  const dopo = [...perfezioni.filter((event) => event.julianDay > julianDay), ...stazioni];
  if (exit && conUscita) {
    dopo.push({
      kind: 'ingresso',
      sign: exit.sign,
      from: exit.from,
      retrograde: exit.retrograde,
      exact: julianDayToISO(exit.julianDay),
      local: julianDayToISO(exit.julianDay, timezone),
      julianDay: exit.julianDay,
    });
  } else if (!exit) {
    warnings.push(
      `${now.name} non cambia segno entro ${MAX_COURSE_DAYS} giorni: la sequenza resta aperta, ` +
        'e le Lune vuote non si classificano.',
    );
  }
  dopo.sort((a, b) => a.julianDay - b.julianDay);
  const pubblico = ({ julianDay: _, ...event }: CourseEvent & { julianDay: number }): CourseEvent => event;

  const course: SignCourse = {
    body,
    name: now.name,
    at: julianDayToISO(julianDay),
    local: julianDayToISO(julianDay, timezone),
    longitude: now.longitude,
    sign: now.sign,
    signDegree: degreeInSign(now.longitude),
    with: others,
    separations: [],
    events: dopo.map(pubblico),
    voids: [],
    warnings,
  };
  prima.sort((a, b) => a.julianDay - b.julianDay);
  course.separations = prima.map(pubblico);
  const ultima = prima.at(-1);
  if (ultima) course.lastPerfected = pubblico(ultima);
  if (entry) course.entered = julianDayToISO(entry.julianDay);

  if (exit && conUscita) course.voids = classifyVoids(body, others, dopo.some((event) => event.kind === 'aspetto'), exit.julianDay, options);
  return course;
}

/**
 * Le due Lune vuote sulla stessa sequenza. Si chiamano così per la Luna, che
 * è il caso di cui parlano tutti; la definizione di Lilly dice «a Planet», e
 * il calcolo vale per qualunque corpo.
 */
function classifyVoids(
  body: BodyId,
  others: readonly BodyId[],
  perfeziona: boolean,
  exit: number,
  options: SignCourseOptions,
): VoidVerdict[] {
  const moderno: VoidVerdict = { school: 'moderno', ...VUOTI.moderno, void: !perfeziona };

  // Un minuto prima dell'uscita: l'ultimo istante in cui il corpo sta ancora
  // nel segno. Chi applica lì dentro le orbite applicava già.
  const prima = exit - 1 / 1440;
  const context = initEphemeris(options.ephemerisPath);
  const { bodies } = computeBodies(prima, [body, ...others.filter((id) => SETTE.includes(id))], context);
  const inOrbita = computeAspects(bodies, { convention: natalOrbConvention('lilly') }).filter(
    (aspect) => aspect.applying && (aspect.from === body || aspect.to === body),
  );
  const lilly: VoidVerdict = { school: 'lilly', ...VUOTI.lilly, void: !perfeziona && inOrbita.length === 0 };
  const applicazione = inOrbita[0];
  if (applicazione) {
    lilly.applyingAtExit = {
      with: applicazione.from === body ? applicazione.to : applicazione.from,
      aspect: applicazione.aspect,
      orb: applicazione.orb,
    };
  }
  if (!SETTE.includes(body)) {
    lilly.void = !perfeziona;
    lilly.note = 'Il corpo non è fra i sette: le moieties non gli danno orbita, e resta solo la perfezione.';
  }
  return [moderno, lilly];
}

interface Ingresso {
  julianDay: number;
  sign: SignCourse['sign'];
  from: SignCourse['sign'];
  retrograde: boolean;
}

/**
 * Il primo cambio di segno dopo l'istante, o l'ultimo prima. La finestra parte
 * dal tempo che il corpo impiega di solito a fare un segno e si raddoppia fino
 * al tetto: per la Luna bastano tre giorni, per Saturno ne servono mesi.
 */
function findIngress(body: BodyId, julianDay: number, verso: 'prima' | 'dopo', warnings: string[]): Ingresso | undefined {
  let giorni = Math.min(MAX_COURSE_DAYS, Math.ceil((30 / meanDailyMotion(body)) * 1.2) + 2);
  for (;;) {
    const range = verso === 'dopo' ? dayRange(julianDay, julianDay + giorni) : dayRange(julianDay - giorni, julianDay);
    const { ingresses, warnings: ingressWarnings } = findSignIngresses(range, { bodies: [body] });
    for (const warning of ingressWarnings) if (!warnings.includes(warning)) warnings.push(warning);
    const candidati = ingresses
      .map((ingress) => ({ ...ingress, julianDay: isoToJulianDay(ingress.exact) }))
      .filter((ingress) => (verso === 'dopo' ? ingress.julianDay > julianDay : ingress.julianDay < julianDay));
    const scelto = verso === 'dopo' ? candidati[0] : candidati.at(-1);
    if (scelto) return { julianDay: scelto.julianDay, sign: scelto.sign, from: scelto.from, retrograde: scelto.retrograde };
    if (giorni >= MAX_COURSE_DAYS) return undefined;
    giorni = Math.min(MAX_COURSE_DAYS, giorni * 2);
  }
}

/** Un arco di giorni interi in UTC che contiene i due istanti. */
function dayRange(from: number, to: number): PassageRange {
  const giorno = (julianDay: number): string => julianDayToISO(julianDay).slice(0, 10);
  const fine = giorno(to) === giorno(from) ? giorno(to + 1) : giorno(to);
  return { from: giorno(from), to: fine, timezone: 'UTC' };
}

function isoToJulianDay(iso: string): number {
  return Date.parse(iso) / 86_400_000 + 2440587.5;
}

