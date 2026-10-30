import { BODIES, NATAL_POINT_NAMES, SIGN_ABBR, ZODIAC_SIGNS } from './constants.js';
import { PARASHARA_GRAHAS, PARASHARA_NODES, parasharaExaltation, parasharaNodeSigns } from './dignita-parashara.js';
import { formatDegrees, formatZodiacal } from './math.js';
import { grahaName, nakshatraOf, requireSidereal } from './nakshatra.js';
import type {
  Angles,
  Aspect,
  AyanamsaInfo,
  BodyId,
  CelestialBody,
  Distribution,
  DashaPeriod,
  DistributionGroup,
  DrishtiChart,
  ElectionResult,
  ChartFormatOptions,
  Dignity,
  DomicileScheme,
  House,
  JyotishaChart,
  NatalChart,
  ParasharaDignities,
  Arudhas,
  GoodVargas,
  Vimshopaka,
  GrahaRelationships,
  CompoundMaitri,
  NatalPointId,
  Panchanga,
  PassageRange,
  Place,
  SignIngress,
  SkyChart,
  SkyPassage,
  Sect,
  Station,
  TransitChart,
  TransitingBody,
  TransitingPointId,
  TransitPassage,
  ActiveTransit,
  OrbConventionInfo,
  VargaChart,
  Hora,
  VimshottariDasha,
  WesternDignities,
  SignCourse,
  HoraryFinding,
  HoraryLilly,
  LillyConditions,
  LillyScoreItem,
  LillyScoreRow,
  LillySolarState,
  LillyStar,
  Zodiac,
  GrahaStates,
  GrahaArudhas,
} from './types.js';

/**
 * Rende il tema in forma tabellare compatta.
 *
 * Pensata per essere consumata da un modello linguistico: a parità di
 * contenuto, circa un quarto della lunghezza del JSON impaginato.
 * Per le integrazioni programmatiche usare direttamente l'oggetto `NatalChart`.
 */
export function formatChartCompact(
  chart: NatalChart,
  options: ChartFormatOptions = {},
): string {
  const occidentali = options.westernSections ?? true;
  const lines: string[] = [];
  const { input, time } = chart;

  const place = formatPlace(input);
  const when = time.timeKnown
    ? `${input.date} ${input.time} (${input.timezone}, UTC${formatOffset(time.offsetMinutes)})`
    : `${input.date} (ora ignota)`;

  lines.push(`TEMA NATALE — ${when} — ${place}`);
  lines.push(
    `Case: ${chart.houseSystem} | ${zodiacLine(chart)} | Effemeridi: ${chart.ephemerisMode} | UT: ${time.utc}`,
  );
  lines.push(
    `Tempo siderale locale: ${chart.siderealTime.formatted}` +
      (chart.sect ? ` | Settore: ${chart.sect}` : ''),
  );

  lines.push('', 'CORPI', ...bodyLines(chart.bodies));

  if (chart.partOfFortune && occidentali) {
    const house =
      chart.partOfFortune.house !== undefined ? ` casa ${chart.partOfFortune.house}` : '';
    lines.push(
      `${'Fortuna'.padEnd(11)} ${formatZodiacal(chart.partOfFortune.longitude).padEnd(11)}  ${house}`,
    );
  }

  if (chart.angles) lines.push('', 'ASSI', ...angleLines(chart.angles));
  if (chart.houses.length > 0) lines.push('', 'CUSPIDI', ...cuspLines(chart.houses));

  if (occidentali) {
    lines.push('', 'ASPETTI', orbLine(chart.orbConvention), ...aspectLines(chart));
    lines.push('', 'DISTRIBUZIONE', ...distributionLines(chart.distribution));
    if (chart.dignities) lines.push('', 'DIGNITÀ', ...dignityLines(chart, chart.dignities));
    if (chart.dignities?.lilly) {
      lines.push('', 'CONDIZIONI (LILLY)', ...lillyConditionLines(chart.dignities.lilly.conditions));
    }
  }
  lines.push(...warningLines(chart.warnings));

  return lines.join('\n');
}

/**
 * Rende in forma tabellare il cielo di un istante.
 *
 * L'intestazione dice che cosa manca e perché: senza luogo non ci sono assi
 * né case, e chi legge non deve chiedersi se siano stati dimenticati.
 */
export function formatSkyCompact(sky: SkyChart): string {
  const { input, time } = sky;

  const when = time.timeKnown
    ? `${input.date} ${input.time} (${input.timezone}, UTC${formatOffset(time.offsetMinutes)})`
    : `${input.date} (ora non indicata, mezzogiorno locale)`;

  const lines = [
    `CIELO — ${when}`,
    `${zodiacLine(sky)} | Effemeridi: ${sky.ephemerisMode} | UT: ${time.utc}`,
  ];

  if (sky.place) {
    const details = [`Luogo: ${formatPlace(sky.place)}`];
    if (sky.houseSystem) details.push(`Case: ${sky.houseSystem}`);
    if (sky.siderealTime) details.push(`Tempo siderale: ${sky.siderealTime.formatted}`);
    if (sky.sect) details.push(`Settore: ${sky.sect}`);
    lines.push(details.join(' | '));
  } else {
    lines.push('Senza luogo: posizioni valide ovunque, nessun asse e nessuna casa.');
  }

  lines.push('', 'CORPI', ...bodyLines(sky.bodies));

  if (sky.angles) lines.push('', 'ASSI', ...angleLines(sky.angles));
  if (sky.houses.length > 0) lines.push('', 'CUSPIDI', ...cuspLines(sky.houses));

  lines.push('', 'ASPETTI', orbLine(sky.orbConvention), ...aspectLines(sky));
  lines.push('', 'DISTRIBUZIONE', ...distributionLines(sky.distribution));
  if (sky.dignities) lines.push('', 'DIGNITÀ', ...dignityLines(sky, sky.dignities));
  if (sky.dignities?.lilly) {
    lines.push('', 'CONDIZIONI (LILLY)', ...lillyConditionLines(sky.dignities.lilly.conditions));
  }
  lines.push(...warningLines(sky.warnings));

  return lines.join('\n');
}

/**
 * Rende i transiti in forma tabellare compatta.
 *
 * Prende anche il tema natale perché senza non si possono nominare i
 * bersagli, e perché chi legge deve vedere su quale nascita sta lavorando:
 * un quadro di transiti senza la data di nascita è un cielo qualsiasi.
 */
export function formatTransitsCompact(natal: NatalChart, transits: TransitChart): string {
  const lines: string[] = [];
  const { input, time } = transits;

  const when = time.timeKnown
    ? `${input.date} ${input.time} (${input.timezone}, UTC${formatOffset(time.offsetMinutes)})`
    : `${input.date} (ora non indicata, mezzogiorno locale)`;
  const birth = natal.time.timeKnown
    ? `${natal.input.date} ${natal.input.time}`
    : `${natal.input.date} (ora ignota)`;

  lines.push(`TRANSITI — ${when}`);
  lines.push(`Tema natale: ${birth} — ${formatPlace(natal.input)}`);
  lines.push(
    `Case natali: ${natal.houseSystem} | ${zodiacLine(transits)} | Effemeridi: ${transits.ephemerisMode} | UT: ${time.utc}`,
  );
  if (transits.place) {
    const siderale = transits.siderealTime ? ` | TSL: ${transits.siderealTime.formatted}` : '';
    const domificazione = transits.houseSystem ? ` | Case dell'istante: ${transits.houseSystem}` : '';
    lines.push(`Luogo del transito: ${formatPlace(transits.place)}${siderale}${domificazione}`);
  }

  // Due case per corpo vanno spiegate una volta sola, in cima alla colonna:
  // ripeterlo su ogni riga costerebbe più di quanto chiarisca.
  const intestazione = transits.houses.length > 0
    ? "IN TRANSITO (casa natale, fra parentesi la casa dell'istante)"
    : 'IN TRANSITO';
  lines.push('', intestazione, ...transitingLines(transits.transiting));

  if (transits.angles) lines.push('', "ASSI DELL'ISTANTE", ...angleLines(transits.angles));
  if (transits.houses.length > 0) {
    lines.push('', "CUSPIDI DELL'ISTANTE", ...cuspLines(transits.houses));
  }

  lines.push('', 'ASPETTI (in transito → natale)', orbLine(transits.orbConvention));
  if (transits.aspects.length === 0) {
    lines.push('(nessuno entro le orbite dei transiti)');
  }
  for (const aspect of transits.aspects) {
    const direction = aspect.applying ? 'applicativo' : 'separativo';
    lines.push(
      `${transitingName(transits, aspect.transiting).padEnd(11)} ${aspect.aspect.padEnd(15)} ` +
        `${natalPointName(natal, aspect.natal).padEnd(11)} ` +
        `${formatDegrees(aspect.orb).padStart(7)}  ${direction}${aspect.retrograde ? '  R' : ''}`,
    );
  }

  lines.push(...warningLines(transits.warnings));

  return lines.join('\n');
}

/**
 * Rende in forma tabellare il calendario degli incontri in cielo.
 *
 * Una riga per aspetto esatto, in ordine di tempo, con il moto di **entrambi**
 * i corpi: è quello a spiegare perché uno stesso incontro possa comparire tre
 * volte a poche settimane di distanza.
 */
export function formatSkyPassagesCompact(
  passages: readonly SkyPassage[],
  range: PassageRange,
  orbConvention: OrbConventionInfo,
  warnings: readonly string[] = [],
): string {
  const lines = [
    `INCONTRI IN CIELO — dal ${range.from} al ${range.to} (${range.timezone})`,
    `${orbLine(orbConvention)}, per le finestre`,
    '',
  ];

  if (passages.length === 0) {
    lines.push('(nessun aspetto si perfeziona in questo arco di tempo)');
    return lines.join('\n');
  }

  lines.push('Data e ora locali | più veloce | aspetto | più lento | moto | finestra');
  for (const passage of passages) {
    const window = passage.window
      ? `${passage.window.start.slice(0, 10)} → ${passage.window.end.slice(0, 10)}`
      : 'oltre i tre anni';
    const motion = `${passage.retrograde.faster ? 'R' : 'D'}/${passage.retrograde.slower ? 'R' : 'D'}`;

    lines.push(
      `${passage.local.slice(0, 16).replace('T', ' ')} ` +
        `${bodyName(passage.faster).padEnd(11)} ${passage.aspect.padEnd(15)} ` +
        `${bodyName(passage.slower).padEnd(11)} ${motion}  ${window}`,
    );
  }

  lines.push(...warningLines(warnings));

  return lines.join('\n');
}

/**
 * Rende in forma tabellare ingressi e stazioni.
 *
 * Le due tabelle stanno insieme perché rispondono alla stessa domanda — che
 * cosa cambia nel cielo in questo periodo — e perché spesso si spiegano a
 * vicenda: un pianeta che si ferma appena dentro un segno lo lascerà di nuovo.
 */
export function formatSkyEventsCompact(
  ingresses: readonly SignIngress[],
  stations: readonly Station[],
  range: PassageRange,
  warnings: readonly string[] = [],
): string {
  const lines = [`EVENTI DEL CIELO — dal ${range.from} al ${range.to} (${range.timezone})`];

  lines.push('', 'INGRESSI NEI SEGNI');
  if (ingresses.length === 0) {
    lines.push('(nessuno in questo arco di tempo)');
  }
  for (const ingress of ingresses) {
    lines.push(
      `${ingress.local.slice(0, 16).replace('T', ' ')} ` +
        `${bodyName(ingress.body).padEnd(11)} ${ingress.from} → ${ingress.sign}` +
        `${ingress.retrograde ? '  (all\'indietro)' : ''}`,
    );
  }

  lines.push('', 'STAZIONI');
  if (stations.length === 0) {
    lines.push('(nessuna in questo arco di tempo)');
  }
  for (const station of stations) {
    lines.push(
      `${station.local.slice(0, 16).replace('T', ' ')} ` +
        `${bodyName(station.body).padEnd(11)} ${station.direction.padEnd(11)} ` +
        `${formatZodiacal(station.longitude)}`,
    );
  }

  lines.push(...warningLines(warnings));

  return lines.join('\n');
}

/**
 * Il tema orario secondo Lilly: la domanda, i significatori, ciò che i
 * classificatori della scuola trovano, le considerazioni, e sotto la figura
 * intera e il corso dei significatori.
 *
 * Nessuna riga dice se la cosa avverrà: i modi della perfezione e degli
 * impedimenti stanno ciascuno con la sua definizione e la pagina, e gli
 * eventi da cui si leggono.
 */
export function formatHoraryCompact(horary: HoraryLilly): string {
  const quando = (iso: string): string => iso.slice(0, 16).replace('T', ' ');
  const { question } = horary;
  const casa = question.derivedFrom
    ? `casa ${question.house} dalla ${question.derivedFrom}, cioè la ${question.effectiveHouse}`
    : `casa ${question.effectiveHouse}`;
  const lines = [
    `TEMA ORARIO (LILLY) — ${casa}, cuspide in ${question.cuspSign}`,
    `Fonte: ${horary.source}`,
    ...horary.readings.map((r) => `Lettura: ${r}`),
    '',
    'SIGNIFICATORI',
  ];
  const ruolo = { querente: 'querente', quesito: 'quesito', cosignificatore: 'cosignificatore' } as const;
  for (const s of horary.significators) {
    lines.push(
      `${ruolo[s.role].padEnd(15)} ${bodyName(s.body).padEnd(10)} ` +
        `${s.role === 'cosignificatore' ? 'col signore della 1' : `signore della ${s.rules}`}, ` +
        `${formatZodiacal(s.longitude)}${s.house !== undefined ? `, in casa ${s.house}` : ''}`,
    );
  }

  const riga = (f: HoraryFinding): string => {
    const quale = [f.by ? bodyName(f.by) : '', f.aspect ?? ''].filter(Boolean).join(', ');
    const eventi = f.events
      .map((e) =>
        e.kind === 'aspetto'
          ? `${bodyName(e.body)} ${e.aspect} ${bodyName(e.with)} ${quando(e.local)}`
          : e.kind === 'stazione'
            ? `${bodyName(e.body)} stazione ${e.direction} ${quando(e.local)}`
            : `${bodyName(e.body)} ingresso ${quando(e.local)}`,
      )
      .join('; ');
    const ricezioni = (f.reception ?? [])
      .map((r) => `${bodyName(r.by)} riceve ${bodyName(r.of)}: ${r.dignities.map(dignityLabel).join(', ') || 'no'}`)
      .join('; ');
    return (
      `${f.mode}${quale ? ` (${quale})` : ''}, p. ${f.page}. ${f.definition}\n  Eventi: ${eventi}` +
      (ricezioni ? `\n  Ricezione: ${ricezioni}` : '') +
      (f.note ? `\n  ${f.note}` : '')
    );
  };
  lines.push('', 'PERFEZIONE');
  if (horary.sameSignificator) lines.push('(un solo significatore: lo stesso pianeta regge le due case)');
  else if (horary.perfections.length === 0) lines.push('(nessuno dei modi di pp. 125-126 entro la finestra)');
  lines.push(...horary.perfections.map(riga));
  lines.push('', 'IMPEDIMENTI');
  if (horary.impediments.length === 0) lines.push('(nessuno entro la finestra)');
  lines.push(...horary.impediments.map(riga));

  lines.push('', 'CONSIDERAZIONI PRIMA DEL GIUDIZIO');
  for (const c of horary.considerations) {
    const esito = c.holds === undefined ? 'non calcolata' : c.holds ? 'sì' : 'no';
    lines.push(`${esito.padEnd(13)} p. ${c.page} ${c.text}${c.detail ? ` ${c.detail}` : ''}`);
  }
  lines.push(...warningLines(horary.warnings));

  lines.push('', formatSkyCompact(horary.chart));
  for (const course of horary.courses) lines.push('', formatSignCourseCompact(course));
  return lines.join('\n');
}

/**
 * Il corso di un corpo fino all'uscita dal segno, e le due Lune vuote.
 *
 * Gli eventi in ordine, uno per riga, e i classificatori dopo, ciascuno col
 * suo nome e la sua regola: sono due letture della stessa sequenza, e chi
 * legge deve vedere su che cosa divergono.
 */
export function formatSignCourseCompact(course: SignCourse): string {
  const quando = (iso: string): string => iso.slice(0, 16).replace('T', ' ');
  const lines = [
    `CORSO — ${course.name} dal ${quando(course.local)} fino all'uscita dal segno`,
    `${course.name} a ${formatZodiacal(course.longitude)}` +
      (course.entered ? `, nel segno dal ${quando(course.entered)} UTC` : ''),
    `Aspetti tolemaici cercati con: ${course.with.map(bodyName).join(', ')}`,
  ];
  if (course.lastPerfected?.kind === 'aspetto') {
    const { aspect, with: altro, local } = course.lastPerfected;
    lines.push(`Si separa da: ${aspect} a ${bodyName(altro)}, esatto il ${quando(local)}`);
  }

  lines.push('', 'EVENTI');
  if (course.events.length === 0) lines.push('(nessuno entro l\'arco)');
  for (const event of course.events) {
    const quale =
      event.kind === 'aspetto'
        ? `${event.aspect} a ${bodyName(event.with)}${event.retrograde.body ? ' (retrogrado)' : ''}` +
          `${event.retrograde.other ? ` (${bodyName(event.with)} retrogrado)` : ''}`
        : event.kind === 'stazione'
          ? `stazione ${event.direction} a ${formatZodiacal(event.longitude)}`
          : `ingresso in ${event.sign}${event.retrograde ? ", all'indietro" : ''}`;
    lines.push(`${quando(event.local)}  ${quale}`);
  }

  if (course.voids.length > 0) {
    lines.push('', 'VUOTO DI CORSO');
    for (const verdict of course.voids) {
      const perche = verdict.applyingAtExit
        ? `, all'uscita applica a ${bodyName(verdict.applyingAtExit.with)} ` +
          `(${verdict.applyingAtExit.aspect} a ${formatDegrees(verdict.applyingAtExit.orb)})`
        : '';
      lines.push(`${verdict.name}: ${verdict.void ? 'vuoto' : 'non vuoto'}${perche}. ${verdict.rule}`);
      lines.push(`  Fonte: ${verdict.source}`);
      if (verdict.note) lines.push(`  ${verdict.note}`);
    }
  }
  lines.push(...warningLines(course.warnings));
  return lines.join('\n');
}

/**
 * Rende in forma tabellare il calendario dei passaggi.
 *
 * Una riga per aspetto esatto, in ordine di tempo. La colonna del moto è
 * quella che dà senso all'elenco: tre righe uguali a mesi di distanza, con
 * una `R` in mezzo, sono un pianeta lento che passa e ripassa — e si legge
 * come un periodo unico, non come tre fatti separati.
 */
export function formatPassagesCompact(
  natal: NatalChart,
  passages: readonly TransitPassage[],
  range: PassageRange,
  orbConvention: OrbConventionInfo,
  warnings: readonly string[] = [],
): string {
  const birth = natal.time.timeKnown
    ? `${natal.input.date} ${natal.input.time}`
    : `${natal.input.date} (ora ignota)`;

  const lines = [
    `PASSAGGI — dal ${range.from} al ${range.to} (${range.timezone})`,
    `Tema natale: ${birth} — ${formatPlace(natal.input)}`,
    `${orbLine(orbConvention)}, per le finestre`,
    '',
  ];

  if (passages.length === 0) {
    lines.push('(nessun aspetto si perfeziona in questo arco di tempo)');
    return lines.join('\n');
  }

  lines.push('Data e ora locali | transitante | aspetto | punto natale | moto | finestra');
  for (const passage of passages) {
    const window = passage.window
      ? `${passage.window.start.slice(0, 10)} → ${passage.window.end.slice(0, 10)}`
      : 'oltre i tre anni';

    lines.push(
      `${passage.local.slice(0, 16).replace('T', ' ')} ` +
        `${nameOf(natal, passage.transiting).padEnd(11)} ${passage.aspect.padEnd(15)} ` +
        `${natalPointName(natal, passage.natal).padEnd(11)} ` +
        `${passage.retrograde ? 'R' : 'D'}  ${window}`,
    );
  }

  lines.push(...warningLines(warnings));

  return lines.join('\n');
}

/**
 * Rende in forma tabellare i transiti attivi in un arco.
 *
 * Una riga per tratto in orbita: da quando a quando, quanto stretto ai due
 * bordi dell'arco, e le perfezioni che ci cadono dentro. Quando non ce n'è
 * nessuna la riga dice l'avvicinamento massimo, che è la sola misura di un
 * transito che si ferma prima dell'esatto.
 */
export function formatActiveTransitsCompact(
  natal: NatalChart,
  transits: readonly ActiveTransit[],
  range: PassageRange,
  orbConvention: OrbConventionInfo,
  warnings: readonly string[] = [],
): string {
  const birth = natal.time.timeKnown
    ? `${natal.input.date} ${natal.input.time}`
    : `${natal.input.date} (ora ignota)`;

  const lines = [
    `TRANSITI ATTIVI — dal ${range.from} al ${range.to} (${range.timezone})`,
    `Tema natale: ${birth} — ${formatPlace(natal.input)}`,
    orbLine(orbConvention),
    '',
  ];

  if (transits.length === 0) {
    lines.push('(nessun transito in orbita in questo arco di tempo)');
    lines.push(...warningLines(warnings));
    return lines.join('\n');
  }

  lines.push(
    'In orbita | transitante | aspetto | punto natale | orbita | ai bordi dell\'arco | esatto nell\'arco',
  );
  for (const transit of transits) {
    const enters = transit.enters?.slice(0, 10) ?? 'oltre tre anni prima';
    const leaves = transit.leaves?.slice(0, 10) ?? 'oltre tre anni dopo';
    const atFrom = transit.orbAtFrom === undefined ? '—' : formatDegrees(transit.orbAtFrom);
    const atTo = transit.orbAtTo === undefined ? '—' : formatDegrees(transit.orbAtTo);
    const edges = `${atFrom} → ${atTo}${transit.throughout ? ' (tutto l\'arco)' : ''}`;
    const exact =
      transit.perfections.length > 0
        ? transit.perfections
            .map((p) => `${p.local.slice(0, 16).replace('T', ' ')}${p.retrograde ? ' R' : ''}`)
            .join(', ')
        : transit.closest
          ? `mai; al più vicino ${formatDegrees(transit.closest.orb)} il ${transit.closest.local.slice(0, 10)}`
          : 'mai';

    lines.push(
      `${enters} → ${leaves}  ` +
        `${nameOf(natal, transit.transiting).padEnd(11)} ${transit.aspect.padEnd(15)} ` +
        `${natalPointName(natal, transit.natal).padEnd(11)} ` +
        `${formatDegrees(transit.orb).padStart(6)}  ${edges}  ${exact}`,
    );
  }

  lines.push(...warningLines(warnings));

  return lines.join('\n');
}

/**
 * Rende in forma tabellare il calendario elettivo.
 *
 * Le ore vanno raggruppate per giorno perché è così che si consultano, e la
 * durata va scritta accanto a ciascuna: sono ore che non durano un'ora, e
 * vederne una da settantotto minuti accanto a una da quarantadue dice della
 * stagione più di qualunque didascalia.
 *
 * I vuoti di corso stanno in coda e non dentro le righe: sono intervalli loro,
 * che tagliano le ore invece di allinearvisi.
 */
export function formatElectionCompact(election: ElectionResult): string {
  const { range, place, hours, voids, filters } = election;
  const lines = [
    `ELEZIONE — dal ${range.from} al ${range.to} (${range.timezone})`,
    `Luogo: ${formatPlace(place)}`,
  ];

  // Il filtro va dichiarato subito: chi legge deve sapere che le ore mancanti
  // non sono state omesse dal calcolo ma escluse su richiesta.
  if (filters) {
    const criteri: string[] = [];
    if (filters.rulers) criteri.push(`solo le ore di ${filters.rulers.map(bodyName).join(', ')}`);
    if (filters.skipMoonVoid) criteri.push('escluse quelle con la Luna vuota di corso');
    lines.push(`Elenco filtrato: ${criteri.join('; ')}`);
  }

  if (hours.length === 0) {
    lines.push('', '(nessuna ora planetaria calcolabile in questo arco)');
    lines.push(...warningLines(election.warnings));
    return lines.join('\n');
  }

  lines.push('', 'ORE PLANETARIE');
  lines.push('Ora locale | reggitore | d/n | durata | Ascendente | Luna');

  let day = '';
  for (const hour of hours) {
    const current = hour.local.start.slice(0, 10);
    if (current !== day) {
      day = current;
      lines.push(`— ${day}`);
    }

    lines.push(
      `${hour.local.start.slice(11, 16)}-${hour.local.end.slice(11, 16)} ` +
        `${bodyName(hour.ruler).padEnd(10)} ` +
        `${hour.diurnal ? 'd' : 'n'}${String(hour.index).padStart(2)} ` +
        `${String(hour.minutes).padStart(3)}m ` +
        `${formatZodiacal(hour.ascendant.longitude).padEnd(11)} ` +
        `${hour.moonVoid ? 'vuota' : ''}`.trimEnd(),
    );
  }

  lines.push('', 'LUNA VUOTA DI CORSO');
  if (voids.length === 0) {
    lines.push('(nessun tratto in questo arco di tempo)');
  }
  for (const period of voids) {
    const last = period.lastAspect
      ? `dopo ${period.lastAspect.aspect} a ${bodyName(period.lastAspect.body)}`
      : 'dall\'ingresso, senza aspetti nel segno';
    lines.push(
      `${period.local.start.slice(0, 16).replace('T', ' ')} → ` +
        `${period.local.end.slice(0, 16).replace('T', ' ')} ` +
        `(${period.minutes} min) in ${period.sign}, ${last}, poi ${period.nextSign}`,
    );
  }

  lines.push(...warningLines(election.warnings));

  return lines.join('\n');
}

/** Una riga per corpo: nome, posizione zodiacale, moto, casa se c'è. */
function bodyLines(bodies: readonly CelestialBody[]): string[] {
  return bodies.map((body) => {
    const retro = body.retrograde ? ' R' : '  ';
    const house = body.house !== undefined ? ` casa ${String(body.house).padStart(2)}` : '';
    return `${body.name.padEnd(11)} ${formatZodiacal(body.longitude).padEnd(11)}${retro}${house}`;
  });
}

/**
 * I transitanti, con una casa o con due.
 *
 * La colonna natale resta dov'è sempre stata e quella dell'istante si aggiunge
 * dopo, fra parentesi: senza un luogo la riga è identica a prima, e con un
 * luogo l'ordine dice da sé quale delle due si legge per prima.
 */
function transitingLines(bodies: readonly TransitingBody[]): string[] {
  const conLuogo = bodies.some((body) => body.transitHouse !== undefined);

  return bodies.map((body) => {
    const retro = body.retrograde ? ' R' : '  ';
    const natale = body.house !== undefined ? ` casa ${String(body.house).padStart(2)}` : '';
    const istante = conLuogo ? `  (${String(body.transitHouse ?? '—').padStart(2)})` : '';
    return (
      `${body.name.padEnd(11)} ${formatZodiacal(body.longitude).padEnd(11)}` +
      `${retro}${natale}${istante}`
    );
  });
}

function angleLines(angles: Angles): string[] {
  return [
    `ASC ${formatZodiacal(angles.ascendant)}   MC  ${formatZodiacal(angles.midheaven)}`,
    `DSC ${formatZodiacal(angles.descendant)}   IC  ${formatZodiacal(angles.imumCoeli)}`,
  ];
}

/** Le dodici cuspidi, tre per riga: dodici righe da sole occuperebbero uno schermo. */
function cuspLines(houses: readonly House[]): string[] {
  const lines: string[] = [];
  for (let i = 0; i < houses.length; i += 3) {
    lines.push(
      houses
        .slice(i, i + 3)
        .map((h) => `${String(h.number).padStart(2)}. ${formatZodiacal(h.longitude).padEnd(11)}`)
        .join(' '),
    );
  }
  return lines;
}

function aspectLines(chart: { bodies: readonly CelestialBody[]; aspects: readonly Aspect[] }): string[] {
  if (chart.aspects.length === 0) return ['(nessuno entro le orbite previste)'];

  return chart.aspects.map((aspect) => {
    const direction = aspect.applying ? 'applicativo' : 'separativo';
    return (
      `${nameOf(chart, aspect.from).padEnd(11)} ${aspect.aspect.padEnd(15)} ` +
      `${nameOf(chart, aspect.to).padEnd(11)} ` +
      `${formatDegrees(aspect.orb).padStart(7)}  ${direction}`
    );
  });
}

/**
 * La distribuzione, in tre righe.
 *
 * I gruppi restano distinti anche qui, e il totale non viene scritto: sommarli
 * vorrebbe dire scegliere una convenzione, che è proprio ciò che il conteggio
 * spezzato evita. Chi legge somma le righe che gli servono.
 *
 * I gruppi vuoti si saltano: un tema senza ora non ha assi, e una riga di zeri
 * si leggerebbe come «nessun asse in nessun elemento» invece che «non pervenuti».
 */
function distributionLines(distribution: Distribution): string[] {
  const gruppi: [string, DistributionGroup][] = [
    ['Pianeti', distribution.planets],
    ['Punti', distribution.points],
    ['Assi', distribution.angles],
  ];

  return gruppi
    .filter(([, gruppo]) => gruppo.counted.length > 0)
    .map(([nome, gruppo]) => {
      const elementi = (['fuoco', 'terra', 'aria', 'acqua'] as const)
        .map((elemento) => `${elemento} ${gruppo.elements[elemento]}`)
        .join('  ');
      const modalita = (['cardinale', 'fisso', 'mobile'] as const)
        .map((modo) => `${modo} ${gruppo.modalities[modo]}`)
        .join('  ');
      return `${nome.padEnd(8)} ${elementi.padEnd(38)} | ${modalita}`;
    });
}

/**
 * I signori dei segni, nelle due convenzioni affiancate e mai fuse, e in coda
 * le dignità dei corpi del tema.
 *
 * Una riga per segno e non per corpo: è il segno ad avere un signore, e la
 * domanda che la tabella deve reggere è «chi governa la decima», che si legge
 * dalla cuspide anche quando lì non c'è nessuno. La colonna delle case segue
 * la regola più comune, che va detta perché non è l'unica: una casa ha per
 * signore quello del segno in cui cade la sua cuspide. Con le case
 * diseguali un segno può non averne nessuna o averne due, e la riga lo mostra.
 *
 * Le dignità dei corpi stanno in coda, una riga per convenzione. Domicilio
 * ed esilio si ricaverebbero dalle righe sopra, ma sono la prima cosa che
 * chi legge cerca, e lasciarli da ricavare a un modello è la via per cui se li
 * ricavava da sé, con la scuola che preferiva. Esaltazione e caduta stanno
 * solo nella riga tradizionale, perché solo lì hanno una tavola con un autore:
 * la riga moderna lo dice invece di tacerlo.
 *
 * Se il tema porta il pacchetto di una scuola, le sue righe vengono sotto
 * quelle comuni senza toccarle: le due colonne di default restano quello che
 * erano, e la scuola si legge accanto, col suo nome.
 *
 * Le ricezioni chiudono la sezione, secondo Lilly: sulle sole tavole comuni,
 * o su tutta la sua tavola quando il pacchetto è acceso. Le mutue vengono
 * prima perché sono la sua definizione; le semplici le contengono anche
 * loro, nei due versi.
 *
 * Tutto viene da `chart.dignities`: la tabella impagina il JSON, non
 * ricalcola, e le due rese dicono la stessa cosa.
 */
function dignityLines(
  chart: Pick<NatalChart, 'houses' | 'bodies' | 'sect'>,
  dignities: WesternDignities,
): string[] {
  const schemi: readonly DomicileScheme[] = ['tradizionale', 'moderno'];
  const conCase = chart.houses.length > 0;

  const lines = [
    `Domicili tradizionali: ${dignities.sources.domicili.tradizionale}`,
    `Domicili moderni: ${dignities.sources.domicili.moderno}`,
    `Esilio: ${dignities.sources.esilio}`,
    `Esaltazione e caduta, solo tradizionali: ${dignities.sources.esaltazione}`,
  ];
  if (conCase) lines.push('Case: ciascuna al signore del segno della sua cuspide.');
  lines.push(`Segno ${'tradiz.'.padEnd(10)} ${'moderno'.padEnd(10)}${conCase ? ' case' : ''}`.trimEnd());

  for (const sign of ZODIAC_SIGNS) {
    const case_ = chart.houses.filter((house) => house.sign === sign).map((house) => house.number);
    const signori = dignities.signLords[sign];
    const riga =
      `${SIGN_ABBR[sign].padEnd(5)} ` +
      `${bodyName(signori.tradizionale).padEnd(10)} ` +
      `${bodyName(signori.moderno).padEnd(10)}` +
      `${conCase ? ` ${case_.join(' ') || '—'}` : ''}`;
    lines.push(riga.trimEnd());
  }

  const voci: Record<DomicileScheme, readonly Dignity[]> = {
    tradizionale: ['domicilio', 'esaltazione', 'esilio', 'caduta'],
    moderno: ['domicilio', 'esilio'],
  };
  for (const schema of schemi) {
    const parti = voci[schema].map((voce) => {
      const corpi = dignities.bodies.filter((body) => body.dignities[schema].includes(voce));
      return `${voce} ${corpi.map((body) => body.name).join(', ') || '—'}`;
    });
    lines.push(`${schema === 'tradizionale' ? 'Tradiz.' : 'Moderno'} — ${parti.join('; ')}`);
  }

  if (dignities.lilly) lines.push(...lillyLines(dignities.lilly, chart.sect));
  if (dignities.tolomeo) lines.push(...ptolemyLines(dignities.tolomeo, chart.sect));
  if (dignities.bonatti) lines.push(...bonattiLines(dignities.bonatti, chart.sect));
  if (dignities.valente) lines.push(...valensLines(dignities.valente, chart.sect));

  const { source, single, mutual } = dignities.receptions;
  const nome = (id: BodyId): string => nameOf(chart, id);
  const per = (by: readonly string[]): string => by.map(dignityLabel).join(' e ');
  lines.push(`Ricezioni: ${source}`);
  lines.push(
    `Mutue — ${
      mutual
        .map(
          (m) =>
            `${nome(m.bodies[0])} e ${nome(m.bodies[1])} ` +
            `(${per(m.firstReceives)} / ${per(m.secondReceives)})`,
        )
        .join('; ') || '—'
    }`,
  );
  lines.push(
    `Semplici — ${
      single.map((r) => `${nome(r.receiver)} riceve ${nome(r.received)} (${per(r.by)})`).join('; ') ||
      '—'
    }`,
  );

  return lines;
}

/** Gli identificatori delle dignità sono senza accento; la tabella no. */
function dignityLabel(voce: string): string {
  return voce === 'triplicita' ? 'triplicità' : voce;
}

/**
 * Il pacchetto di Lilly: per ogni corpo i signori del grado in cui sta, dignità
 * per dignità, e le dignità e debilità che ha lì.
 *
 * I signori si danno per tutti i corpi, perché sono un fatto del grado e non
 * del corpo; le dignità solo dove la tavola le prevede, cioè per i sette e per
 * i Nodi. Senza l'ora la setta manca, e la triplicità resta solo dove il
 * giorno e la notte hanno lo stesso reggente: la riga lo dice.
 */
function lillyLines(lilly: NonNullable<WesternDignities['lilly']>, sect: Sect | undefined): string[] {
  const nome = (id: BodyId | undefined): string => (id ? bodyName(id) : '—');
  const lines = [
    `Lilly (a richiesta): ${lilly.source}`,
    sect
      ? `Triplicità: reggente ${sect === 'diurna' ? 'diurno' : 'notturno'}, dalla setta del tema.`
      : "Triplicità: senza l'ora la setta manca, e il reggente c'è solo nell'acqua, dove è lo stesso di giorno e di notte.",
    `${'Corpo'.padEnd(11)} ${['domic.', 'esalt.', 'tripl.', 'termine', 'faccia'].map((t) => t.padEnd(9)).join(' ')} | dignità`,
  ];
  for (const body of lilly.bodies) {
    const { domicilio, esaltazione, triplicita, termine, faccia } = body.rulers;
    const colonne = [domicilio, esaltazione, triplicita, termine, faccia]
      .map((id) => nome(id).padEnd(9))
      .join(' ');
    const dignita = body.dignities.map(dignityLabel);
    lines.push(`${body.name.padEnd(11)} ${colonne} | ${dignita.join(', ') || '—'}`);
  }
  return lines;
}

/**
 * Il pacchetto di Tolomeo: per ogni corpo i signori del grado in cui sta, e
 * le dignità che ha lì. Come in Lilly, i signori si danno per tutti e le
 * dignità solo per i sette.
 *
 * Il triangolo ha due colonne perché in Tolomeo sono due fatti: chi ne è
 * signore (sempre, i due o i tre di I.18) e chi lo governa nella setta del
 * tema, che senza l'ora non si sa. Niente faccia ed esilio: Tolomeo non li
 * ha, e una colonna vuota sembrerebbe un dato.
 */
function ptolemyLines(
  tolomeo: NonNullable<WesternDignities['tolomeo']>,
  sect: Sect | undefined,
): string[] {
  const nome = (id: BodyId | undefined): string => (id ? bodyName(id) : '—');
  const elenco = (ids: readonly BodyId[] | undefined): string => (ids ? ids.map(bodyName).join('+') : '—');
  const lines = [
    `Tolomeo (a richiesta): ${tolomeo.source}`,
    tolomeo.termsSource,
    sect
      ? `Triangolo: i signori di I.18, e chi lo governa di ${sect === 'diurna' ? 'giorno' : 'notte'}, dalla setta del tema.`
      : "Triangolo: i signori di I.18; senza l'ora la setta manca, e chi lo governa non si dice.",
    `${'Corpo'.padEnd(11)} ${['domic.', 'esalt.'].map((t) => t.padEnd(9)).join(' ')} ${'triangolo'.padEnd(20)} ${'governa'.padEnd(14)} ${'termine'.padEnd(9)} | dignità`,
  ];
  for (const body of tolomeo.bodies) {
    const { domicilio, esaltazione, triplicita, triplicitaDiSetta, termine } = body.rulers;
    const riga =
      `${body.name.padEnd(11)} ${nome(domicilio).padEnd(9)} ${nome(esaltazione).padEnd(9)} ` +
      `${elenco(triplicita).padEnd(20)} ${elenco(triplicitaDiSetta).padEnd(14)} ${nome(termine).padEnd(9)}`;
    lines.push(`${riga} | ${body.dignities.map(dignityLabel).join(', ') || '—'}`);
  }
  return lines;
}

/**
 * Il pacchetto di Bonatti: per ogni corpo i signori del grado in cui sta, e
 * le dignità e debilità che ha lì. I signori si danno per tutti, le dignità
 * per i sette e, d'esaltazione e caduta, per i Nodi.
 *
 * La triplicità ha due colonne, come il triangolo di Tolomeo: i tre signori
 * del cap. XI, nell'ordine giorno, notte e partecipe, che lo sono sempre, e
 * chi la governa nella setta del tema, che senza l'ora non si sa.
 */
function bonattiLines(bonatti: NonNullable<WesternDignities['bonatti']>, sect: Sect | undefined): string[] {
  const nome = (id: BodyId | undefined): string => (id ? bodyName(id) : '—');
  const lines = [
    `Bonatti (a richiesta): ${bonatti.source}`,
    bonatti.termsSource,
    sect
      ? `Triplicità: i tre signori del cap. XI (giorno+notte+partecipe), e chi la governa di ${sect === 'diurna' ? 'giorno' : 'notte'}, dalla setta del tema.`
      : "Triplicità: i tre signori del cap. XI (giorno+notte+partecipe); senza l'ora la setta manca, e chi la governa non si dice.",
    `${'Corpo'.padEnd(11)} ${['domic.', 'esalt.'].map((t) => t.padEnd(9)).join(' ')} ${'triplicità'.padEnd(26)} ${'governa'.padEnd(9)} ${['termine', 'faccia'].map((t) => t.padEnd(9)).join(' ')} | dignità`,
  ];
  for (const body of bonatti.bodies) {
    const { domicilio, esaltazione, triplicita, triplicitaDiSetta, termine, faccia } = body.rulers;
    const signori = [triplicita.diurno, triplicita.notturno, triplicita.partecipe].map(bodyName).join('+');
    const riga =
      `${body.name.padEnd(11)} ${nome(domicilio).padEnd(9)} ${nome(esaltazione).padEnd(9)} ` +
      `${signori.padEnd(26)} ${nome(triplicitaDiSetta).padEnd(9)} ${nome(termine).padEnd(9)} ${nome(faccia).padEnd(9)}`;
    lines.push(`${riga} | ${body.dignities.map(dignityLabel).join(', ') || '—'}`);
  }
  return lines;
}

/**
 * Il pacchetto di Valente: per ogni corpo i signori del grado in cui sta, e
 * le dignità che ha lì. I signori si danno per tutti, le dignità per i sette.
 *
 * Il triangolo ha due colonne: i tre signori di II.1 (di giorno, di notte e
 * il terzo), che lo sono sempre, e i tre nell'ordine della setta del tema,
 * che senza l'ora non si sa. Niente faccia ed esilio, che in Valente non si
 * sono trovati.
 */
function valensLines(valente: NonNullable<WesternDignities['valente']>, sect: Sect | undefined): string[] {
  const nome = (id: BodyId | undefined): string => (id ? bodyName(id) : '—');
  const elenco = (ids: readonly BodyId[] | undefined): string => (ids ? ids.map(bodyName).join('>') : '—');
  const lines = [
    `Valente (a richiesta): ${valente.source}`,
    valente.termsSource,
    sect
      ? `Triangolo: i tre signori di II.1 (giorno+notte+terzo), e il loro ordine di ${sect === 'diurna' ? 'giorno' : 'notte'}, dalla setta del tema.`
      : "Triangolo: i tre signori di II.1 (giorno+notte+terzo); senza l'ora la setta manca, e l'ordine non si dice.",
    `${'Corpo'.padEnd(11)} ${['domic.', 'esalt.'].map((t) => t.padEnd(9)).join(' ')} ${'triangolo'.padEnd(26)} ${'ordine'.padEnd(26)} ${'termine'.padEnd(9)} | dignità`,
  ];
  for (const body of valente.bodies) {
    const { domicilio, esaltazione, triplicita, triplicitaDiSetta, termine } = body.rulers;
    const signori = [triplicita.diurno, triplicita.notturno, triplicita.terzo].map(bodyName).join('+');
    const riga =
      `${body.name.padEnd(11)} ${nome(domicilio).padEnd(9)} ${nome(esaltazione).padEnd(9)} ` +
      `${signori.padEnd(26)} ${elenco(triplicitaDiSetta).padEnd(26)} ${nome(termine).padEnd(9)}`;
    lines.push(`${riga} | ${body.dignities.map(dignityLabel).join(', ') || '—'}`);
  }
  return lines;
}

/**
 * Le condizioni di Lilly e il suo conto, una riga per pianeta.
 *
 * Il conto si scrive per esteso, voce per voce, e dopo le due somme e la
 * differenza: è così che lo scrive Lilly a pp. 178-180, ed è ciò che lascia
 * a chi legge la possibilità di rifarlo togliendo una riga che non accetta.
 * Le letture fatte dove il testo lascia una scelta vengono prima, una per
 * riga, perché sono la cosa da cui dipende il resto.
 */
function lillyConditionLines(conditions: LillyConditions): string[] {
  const lines = [`Fonte: ${conditions.source}`, ...conditions.readings.map((r) => `Lettura: ${r}`)];

  const istante: string[] = [];
  if (conditions.hour) {
    const { ruler, dayRuler, diurnal, index, local } = conditions.hour;
    istante.push(
      `ora di ${bodyName(ruler)} (${index}ª ${diurnal ? 'diurna' : 'notturna'}, giorno di ${bodyName(dayRuler)}, ` +
        `${local.start.slice(11, 16)}-${local.end.slice(11, 16)})`,
    );
  }
  if (conditions.ascendant) {
    const { signDegree, early, late } = conditions.ascendant;
    const quando = early ? ', nei primi tre gradi' : late ? ', negli ultimi tre gradi' : '';
    istante.push(`Ascendente a ${formatDegrees(signDegree)}${quando}`);
  }
  if (conditions.moonInViaCombusta !== undefined) {
    istante.push(`Luna ${conditions.moonInViaCombusta ? '' : 'non '}in Via Combusta`);
  }
  if (istante.length > 0) lines.push(`Istante: ${istante.join('; ')}`);
  if (conditions.stars) {
    const { regolo, spica, algol } = conditions.stars;
    lines.push(
      `Stelle: Regolo ${formatZodiacal(regolo)}, Spica ${formatZodiacal(spica)}, Algol ${formatZodiacal(algol)}`,
    );
  }
  for (const voce of conditions.missing) lines.push(`Non calcolato: ${voce}`);

  const statoSole: Record<LillySolarState, string> = {
    cazimi: 'cazimi',
    combusto: 'combusto',
    'sotto-i-raggi': 'sotto i raggi',
    libero: 'libero',
  };
  lines.push(
    `${'Corpo'.padEnd(10)} ${'casa'.padEnd(4)} ${'dal Sole'.padEnd(23)} ${'fase'.padEnd(11)} moto`,
  );
  for (const body of conditions.bodies) {
    const sole = body.sun ? `${formatDegrees(body.sun.distance)} ${statoSole[body.sun.state]}` : '—';
    const moto = [body.motion.pace, body.motion.direction === 'retrogrado' ? 'retrogrado' : ''].filter(Boolean);
    const extra = [body.peregrine ? 'peregrino' : '', body.besieged ? 'assediato' : ''].filter(Boolean);
    lines.push(
      `${body.name.padEnd(10)} ${String(body.house ?? '—').padEnd(4)} ${sole.padEnd(23)} ` +
        `${(body.phase ?? '—').padEnd(11)} ${[...moto, ...extra].join(', ')}`,
    );
  }

  lines.push('Conto di p. 115: fortezze | debilità | differenza');
  for (const body of conditions.bodies) {
    const { fortitudes, debilities, totals } = body.score;
    lines.push(
      `${body.name.padEnd(10)} ${fortitudes.map(scoreRowLabel).join(', ') || '—'} = ${totals.fortitudes} | ` +
        `${debilities.map(scoreRowLabel).join(', ') || '—'} = ${totals.debilities} | ` +
        `${totals.net > 0 ? '+' : ''}${totals.net}`,
    );
  }

  lines.push(
    `Antiscia: ${conditions.bodies.map((body) => `${body.name} ${formatZodiacal(body.antiscion)}`).join(', ')}; ` +
      'il contrantiscion è il punto opposto.',
  );
  return lines;
}

/** Una riga del conto: la voce, con che cosa, e i punti. */
function scoreRowLabel(row: LillyScoreRow): string {
  const nomi: Partial<Record<LillyScoreItem, string>> = {
    triplicita: 'triplicità',
    'ricezione-domicilio': 'ricezione per domicilio',
    'ricezione-esaltazione': 'ricezione per esaltazione',
    libero: 'libero dal Sole',
    'sotto-i-raggi': 'sotto i raggi',
  };
  const stelle: Record<LillyStar, string> = { regolo: 'Regolo', spica: 'Spica', algol: 'Algol' };
  let voce = nomi[row.item] ?? row.item;
  if (row.item === 'casa') voce = `casa ${row.house}`;
  if (row.item === 'partile') voce = `partile ${row.aspect} ${row.with ? bodyName(row.with) : ''}`;
  if (row.item.startsWith('ricezione') && row.with) voce = `${voce} con ${bodyName(row.with)}`;
  if (row.item === 'stella' && row.star) voce = stelle[row.star];
  return `${voce} ${row.points}`;
}

/**
 * Da dove sono contati i gradi, detto sempre e non solo quando è insolito.
 *
 * Un tema siderale che tacesse si leggerebbe come tropicale, e sbaglierebbe di
 * quasi un segno; ma anche il tropicale lo dichiara, perché un'assenza non è
 * un'affermazione — chi non trova la riga non sa se sia tropicale o se sia
 * stata dimenticata. Con l'ayanamsa in chiaro, chi segue un'altra scuola rifà
 * il conto invece di doverci credere.
 */
/**
 * La convenzione delle orbite in una riga: il nome, e gli aspetti di cui chi
 * ha chiamato ha cambiato l'orbita. La fonte e la regola stanno nel JSON.
 */
function orbLine(info: OrbConventionInfo): string {
  const cambiate = info.overridden?.length ? `; sostituite per ${info.overridden.join(', ')}` : '';
  return `Orbite: ${info.name}${cambiate}`;
}

function zodiacLine(chart: { zodiac: Zodiac; ayanamsa?: AyanamsaInfo }): string {
  if (!chart.ayanamsa) return `Zodiaco: ${chart.zodiac}`;
  return `Zodiaco: ${chart.zodiac} (${chart.ayanamsa.name} ${formatDegrees(chart.ayanamsa.degrees)})`;
}

/**
 * I nakshatra dei corpi di un tema siderale.
 *
 * Una tabella a parte e non una colonna in più fra i corpi: la divisione in
 * ventisette è un'altra lettura dello stesso cielo, e appiccicarla di fianco ai
 * segni farebbe una riga in cui due sistemi si contendono lo spazio. Chi la
 * vuole la chiede.
 *
 * Ci sono dentro anche Urano, Nettuno e Plutone, che **graha non sono**: il
 * Jyotisha ne conta nove ed è più vecchio di loro di qualche millennio. Ma un
 * nakshatra è una divisione del cerchio, e ogni longitudine ne ha una: toglierli
 * sarebbe il motore che decide chi conta, che è esattamente ciò che non fa.
 * Quali corpi compaiano lo sceglie chi chiede il tema, con `options.bodies`.
 */
export function formatNakshatraCompact(chart: NatalChart): string {
  requireSidereal(chart.zodiac, 'La tabella dei nakshatra');

  const lines: string[] = ['NAKSHATRA'];

  for (const body of chart.bodies) {
    const nakshatra = nakshatraOf(body.longitude);
    lines.push(
      `${grahaName(body.id, body.name).padEnd(11)} ` +
        `${formatZodiacal(body.longitude).padEnd(11)} ` +
        `${nakshatra.name.padEnd(18)} ` +
        `pada ${nakshatra.pada}  ` +
        `sig. ${grahaName(nakshatra.lord, nakshatra.lord)}`,
    );
  }

  return lines.join('\n');
}

/**
 * Il panchanga in cinque righe, più le due longitudini da cui discende.
 *
 * Le longitudini non sono un di più: sono ciò che rende il resto
 * ricontrollabile senza fidarsi, come `counted` per la distribuzione. Da Sole
 * e Luna si rifanno tutte e cinque le parti con un'aritmetica che sta in tre
 * righe.
 */
export function formatPanchangaCompact(panchanga: Panchanga): string {
  const { input, time, tithi, vara, nakshatra, yoga, karana } = panchanga;

  const quando = time.timeKnown
    ? `${input.date} ${input.time} (${input.timezone})`
    : `${input.date} (ora non indicata, mezzogiorno locale)`;

  const lines = [
    `PANCHANGA — ${quando} — ${formatPlace(panchanga.place)}`,
    `Ayanamsa: ${panchanga.ayanamsa.name} ${formatDegrees(panchanga.ayanamsa.degrees)} | ` +
      `Effemeridi: ${panchanga.ephemerisMode} | UT: ${time.utc}`,
    `Sole ${formatZodiacal(panchanga.sun)} | Luna ${formatZodiacal(panchanga.moon)}`,
    '',
    `Tithi     ${tithi.name} (${tithi.paksha}, ${tithi.numberInPaksha}º) — ${tithi.index}/30`,
    vara
      ? `Vara      ${vara.name}, retto da ${grahaName(vara.lord, vara.lord)} — alba ${vara.local.slice(11, 16)}`
      : 'Vara      non calcolabile: qui il Sole non sorge',
    `Nakshatra ${nakshatra.name}, pada ${nakshatra.pada} — ${nakshatra.index}/27, ` +
      `signore ${grahaName(nakshatra.lord, nakshatra.lord)}`,
    `Yoga      ${yoga.name} — ${yoga.index}/27`,
    `Karana    ${karana.name} — ${karana.index}/60${karana.movable ? '' : ', fisso'}`,
  ];

  lines.push(...warningLines(panchanga.warnings));

  return lines.join('\n');
}

/**
 * La catena delle dasha, un periodo per riga e i sotto-periodi rientrati.
 *
 * Il saldo alla nascita in testa: è il numero che si riporta per primo in ogni
 * lettura, e quello con cui si verifica a colpo d'occhio che il conto torni.
 *
 * Le date sono locali. Un periodo di Saturno che comincia il 12 novembre è un
 * fatto del calendario di chi lo vive, non un istante UTC — quello resta nel
 * JSON per chi deve rifare i conti.
 */
export function formatDashaCompact(dasha: VimshottariDasha): string {
  const lines = [
    `DASHA VIMSHOTTARI — Luna in ${dasha.nakshatra.name} pada ${dasha.nakshatra.pada}, ` +
      `signore ${grahaName(dasha.nakshatra.lord, dasha.nakshatra.lord)}`,
    `Saldo alla nascita: ${dasha.balance.toFixed(2)} anni | ` +
      `anno ${dasha.yearLength} (${dasha.daysPerYear} giorni) | ` +
      `${dasha.levels} ${dasha.levels === 1 ? 'ordine' : 'ordini'}`,
    '',
  ];

  const righe = (periods: readonly DashaPeriod[], rientro: string): void => {
    for (const period of periods) {
      lines.push(
        `${rientro}${grahaName(period.lord, period.lord).padEnd(11 - rientro.length)} ` +
          `${period.local.start.slice(0, 10)} → ${period.local.end.slice(0, 10)}  ` +
          `${formatDashaYears(period.years)}`,
      );
      if (period.periods) righe(period.periods, `${rientro}  `);
    }
  };

  righe(dasha.periods, '');
  lines.push(...warningLines(dasha.warnings));

  return lines.join('\n');
}

/**
 * La durata di un periodo, nell'unità in cui si legge meglio.
 *
 * Mesi sotto l'anno, anni sopra, e senza decimale quando è tondo: le durate dei
 * mahadasha sono numeri interi per costruzione, e «7.0 anni» fa sembrare
 * approssimato ciò che è esatto. La soglia sta sotto l'anno e non a un anno
 * netto, o un periodo di undici mesi e mezzo si leggerebbe «12 mesi».
 */
function formatDashaYears(years: number): string {
  const tondo = Math.round(years);
  if (Math.abs(years - tondo) < 0.05) return `${tondo} ${tondo === 1 ? 'anno' : 'anni'}`;
  if (years < 0.95) return `${Math.round(years * 12)} mesi`;
  return `${years.toFixed(1)} anni`;
}

/** Le due hora del D-2, dette per esteso. */
const HORA_LABEL: Readonly<Record<Hora, string>> = {
  sole: 'hora del Sole',
  luna: 'hora della Luna',
};

/**
 * Una carta divisionale: una riga per corpo, e la regola in testa.
 *
 * La regola non è un commento ma parte del dato. Un D-9 senza la sua regola è
 * un elenco di segni di cui non si può dire se sia quello che si voleva:
 * fra le sedici divisioni le scuole divergono, e chi ne segue un'altra deve
 * poterlo vedere prima di confrontare i numeri.
 */
export function formatVargaCompact(varga: VargaChart): string {
  // Nell'intestazione niente «N parti per segno»: nel trimsamsa sarebbe falso,
  // e la riga sotto lo smentirebbe. Quanto e come si divida lo dice la regola,
  // che è l'unica a poterlo dire per tutti.
  const lines = [
    `${varga.name.toUpperCase()} (${varga.varga.toUpperCase()})`,
    ...(varga.convention
      ? [`Convenzione: ${varga.convention.name}. Fonte: ${varga.convention.source}`]
      : []),
    `Regola: ${varga.rule}`,
    ...(varga.warnings ?? []).map((w) => `Avvertenza: ${w}`),
    '',
  ];

  // Il D-2 di Parashara non ha segni: la riga dice il luminare, per esteso,
  // perché «sole» da solo in una colonna di segni si leggerebbe come un segno
  // che non esiste.
  if (varga.kind === 'signori') {
    if (varga.ascendant) lines.push(`${'Lagna'.padEnd(11)} ${HORA_LABEL[varga.ascendant]}`);
    for (const position of varga.positions) {
      lines.push(`${position.name.padEnd(11)} ${HORA_LABEL[position.hora]}`);
    }
    return lines.join('\n');
  }

  // Le corrispondenze stanno sulla riga del graha, dopo il segno, e la loro
  // fonte una volta sola in testa: è la stessa per tutti i varga, ma chi
  // legge un varga solo deve trovarla lì.
  lines.splice(lines.length - 1, 0, `Dignità: ${varga.dignitySource}`);
  if (varga.ascendant) lines.push(`${'Lagna'.padEnd(11)} ${varga.ascendant}`);
  for (const position of varga.positions) {
    const dignita = position.dignitySigns?.length ? `  (${position.dignitySigns.join(', ')})` : '';
    lines.push(`${position.name.padEnd(11)} ${position.sign}${dignita}`);
  }

  return lines.join('\n');
}

/**
 * Gli sguardi di un tema: chi guarda chi, e su quali segni cadono.
 *
 * Le due tabelle non sono una il riassunto dell'altra. La prima dice i
 * contatti fra graha; la seconda dove lo sguardo arriva, **anche dove non
 * trova nessuno**, che in questo sistema è un dato e non un'assenza.
 *
 * La freccia è nel verso giusto e non si scambia: le case si contano in avanti,
 * quindi che uno guardi l'altro non implica il contrario.
 */
export function formatDrishtiCompact(drishti: DrishtiChart): string {
  const lines = [
    'DRISHTI',
    `Nodi: ${drishti.nodes === 'gioviana' ? 'quinta, settima e nona come Giove' : 'nessuno sguardo (forma classica)'}`,
    '',
  ];

  if (drishti.aspects.length === 0) {
    lines.push('(nessuno sguardo trova un graha o il lagna)');
  }
  for (const aspect of drishti.aspects) {
    lines.push(
      `${aspect.fromName.padEnd(11)} → ${aspect.toName.padEnd(11)} ${aspect.house}ª casa`,
    );
  }

  lines.push('', 'SEGNI GUARDATI');
  for (const cast of drishti.signs) {
    lines.push(`${cast.fromName.padEnd(11)} ${cast.house}ª  ${cast.sign}`);
  }

  lines.push(...warningLines(drishti.warnings));

  return lines.join('\n');
}

/**
 * Il tema vedico impaginato: la carta, le dignità, i nakshatra, le dasha, i
 * varga e le drishti, in un testo solo.
 *
 * Prende il composto e non la carta: che cosa sia «il tema vedico» lo decide
 * `computeJyotisha`, in un posto solo, e qui si impagina quello che arriva.
 */
export function formatJyotishaCompact(jyotisha: JyotishaChart): string {
  // Senza ASPETTI, DISTRIBUZIONE e Parte di Fortuna: sono letture occidentali
  // degli stessi gradi, e in un tema vedico non sono un di più ma un errore di
  // categoria — aspetti a orbite dove gli aspetti sono a segni interi, elementi
  // e modalità dove non si contano, una sorte ellenistica in un sistema indiano.
  const parti = [formatChartCompact(jyotisha.chart, { westernSections: false })];

  if (jyotisha.warnings.length > 0) {
    parti.push(['AVVERTENZE DEL TEMA VEDICO', ...jyotisha.warnings.map((w) => `- ${w}`)].join('\n'));
  }

  parti.push(formatParasharaDignitiesCompact(jyotisha.dignities));
  parti.push(formatRelationshipsCompact(jyotisha.relationships));
  parti.push(formatVimshopakaCompact(jyotisha.vimshopaka));
  if (jyotisha.arudhas) parti.push(formatArudhasCompact(jyotisha.arudhas));
  parti.push(formatGrahaArudhasCompact(jyotisha.grahaArudhas));
  if (jyotisha.goodVargas) parti.push(formatGoodVargasCompact(jyotisha.goodVargas));
  parti.push(formatGrahaStatesCompact(jyotisha.states));
  parti.push(formatNakshatraCompact(jyotisha.chart));
  parti.push(formatDashaCompact(jyotisha.dasha));
  for (const varga of jyotisha.vargas) parti.push(formatVargaCompact(varga));
  parti.push(formatDrishtiCompact(jyotisha.drishti));

  return parti.join('\n\n');
}

/**
 * Le dignità del tema vedico: la fonte, i signori dei segni, una riga per graha.
 *
 * I signori dei segni e le esaltazioni stanno qui anche se non cambiano da
 * un tema all'altro. Il primo dato che una lettura vedica cerca è il signore
 * del lagna, e un modello che non lo trova nella tabella lo ricava da sé, con
 * le tavole occidentali che conosce meglio e Plutone nello Scorpione. Le
 * esaltazioni servono a leggere i varga, che portano solo segni: senza la
 * riga, i gradi il modello li prenderebbe dalla scuola che preferisce.
 *
 * Accanto a uccha e neecha il grado più profondo, nello stesso segno: la
 * distanza la vede chi legge, e il motore non ne fa una forza.
 */
function formatParasharaDignitiesCompact(dignities: ParasharaDignities): string {
  const lines = [
    'DIGNITÀ (PARASHARA)',
    `Fonte: ${dignities.source}`,
    `Signori dei segni: ${ZODIAC_SIGNS.map(
      (sign) => `${SIGN_ABBR[sign]} ${bodyName(dignities.signLords[sign])}`,
    ).join(', ')}`,
    `Uccha, neecha nel settimo segno allo stesso grado: ${PARASHARA_GRAHAS.map((graha) => {
      const uccha = parasharaExaltation(graha)!;
      return `${bodyName(graha)} ${uccha.degree}° ${SIGN_ABBR[uccha.sign]}`;
    }).join(', ')}`,
    `Rahu e Ketu (47.35-36), per segno, senza gradi né neecha: ${PARASHARA_NODES.map((nodo) => {
      const segni = parasharaNodeSigns(nodo)!;
      return `${grahaName(nodo, nodo)} uccha ${SIGN_ABBR[segni.uccha]}, moolatrikona ` +
        `${SIGN_ABBR[segni.moolatrikona]}, proprio ${SIGN_ABBR[segni.swakshetra]}`;
    }).join('; ')}`,
    '',
  ];

  for (const graha of dignities.grahas) {
    const longitudine = ZODIAC_SIGNS.indexOf(graha.sign) * 30 + graha.signDegree;
    const profondo =
      graha.deepestDegree !== undefined
        ? `, ${graha.dignity === 'uccha' ? 'esaltazione' : 'debilitazione'} più profonda a ` +
          `${graha.deepestDegree}° ${SIGN_ABBR[graha.sign]}`
        : '';
    const dignita = graha.signDignities
      ? graha.signDignities.length
        ? `${graha.signDignities.join(', ')} (per segno)`
        : '—'
      : (graha.dignity ?? '—');
    lines.push(`${graha.name.padEnd(11)} ${formatZodiacal(longitudine).padEnd(11)} ${dignita}${profondo}`);
  }

  return lines.join('\n');
}

/**
 * Le relazioni fra i graha: una riga per graha con la composta, raggruppata
 * per grado, e la naturale fra parentesi accanto a ogni nome, perché chi
 * legge veda da dove viene il grado.
 */
function formatRelationshipsCompact(relazioni: GrahaRelationships): string {
  const GRADI: readonly CompoundMaitri[] = ['adhimitra', 'mitra', 'sama', 'shatru', 'adhishatru'];
  const lines = ['RELAZIONI FRA I GRAHA (BPHS 3.55-58)', `Fonte: ${relazioni.source}`,
    'Per ogni graha, come vede gli altri: la composta, e fra parentesi la naturale.', ''];
  const ordine = [...new Set(relazioni.pairs.map((p) => p.from))];
  for (const da of ordine) {
    const sue = relazioni.pairs.filter((p) => p.from === da);
    const gruppi = GRADI.map((grado) => {
      const nomi = sue.filter((p) => p.panchadha === grado).map((p) => `${bodyName(p.to)} (${p.naisargika})`);
      return nomi.length ? `${grado} ${nomi.join(', ')}` : '';
    }).filter(Boolean);
    lines.push(`${bodyName(da).padEnd(11)} ${gruppi.join('; ')}`);
  }
  return lines.join('\n');
}

/** Gli arudha: una riga per bhava, e per Scorpione e Acquario il perché del signore. */
function formatArudhasCompact(arudhas: Arudhas): string {
  const lines = ['ARUDHA DEI BHAVA (BPHS 29.1-7)', `Fonte: ${arudhas.source}`, ''];
  for (const p of arudhas.padas) {
    lines.push(
      `${String(p.bhava).padStart(2)} ${p.name.padEnd(13)} ${SIGN_ABBR[p.sign]} → ${p.pada}` +
        `  (signore ${bodyName(p.lord)})${p.lordChoice ? ` ${p.lordChoice}` : ''}`,
    );
  }
  return lines.join('\n');
}

/**
 * Gli arudha dei graha, di un'altra scuola rispetto a quelli dei bhava: il
 * titolo lo dice, perché i due non si leggano come una tavola sola.
 */
function formatGrahaArudhasCompact(arudhas: GrahaArudhas): string {
  const lines = ['ARUDHA DEI GRAHA (NARASIMHA RAO)', `Fonte: ${arudhas.source}`, ''];
  for (const g of arudhas.grahas) {
    lines.push(
      `${g.name.padEnd(11)} ${SIGN_ABBR[g.sign]} → proprio ${SIGN_ABBR[g.ownSign]} → ${g.pada}` +
        `${g.exception ? ' (eccezione del 1°/7°: il 10°)' : ''}${g.ownSignRule ? ` · ${g.ownSignRule}` : ''}`,
    );
  }
  return lines.join('\n');
}

/**
 * Il vimshopaka: una riga per graha coi quattro totali, e una coi varga dove
 * il graha è nel segno proprio o di un adhimitra o adhishatru, perché chi
 * legge veda da dove viene il numero senza sedici colonne.
 */
function formatVimshopakaCompact(vimshopaka: Vimshopaka): string {
  const lines = ['VIMSHOPAKA (BPHS 7.17-27), su 20', `Fonte: ${vimshopaka.source}`, ''];
  for (const graha of vimshopaka.grahas) {
    const totali = graha.schemes.map((s) => `${s.scheme} ${s.points.toFixed(2)}`).join(' · ');
    lines.push(`${graha.name.padEnd(11)} ${totali}`);
    const estremi = graha.vargas
      .filter((v) => v.relation === 'swakshetra' || v.relation === 'adhimitra' || v.relation === 'adhishatru')
      .map((v) => `${v.varga.toUpperCase()} ${v.relation}`)
      .join(', ');
    if (estremi) lines.push(`${''.padEnd(11)} ${estremi}`);
  }
  return lines.join('\n');
}

/**
 * I varga buoni: le scelte di lettura in testa, poi due righe per graha, il
 * conto per schema col suo nome e i varga buoni con la ragione.
 *
 * Le scelte stanno in testa e non in coda perché cambiano il numero: chi
 * conta con un'altra lettura deve saperlo prima di confrontare.
 */
function formatGoodVargasCompact(buoni: GoodVargas): string {
  const lines = [
    'VARGA BUONI (BPHS 6.42-53)',
    `Fonte: ${buoni.source}`,
    `Arudha lagna: ${buoni.arudhaLagna}. ${buoni.arudhaRule}`,
    `Signori dei kendra dall'arudha: ${buoni.kendraLords.map(bodyName).join(', ')}; i loro segni, ` +
      `buoni per tutti: ${buoni.arudhaSigns.map((s) => SIGN_ABBR[s]).join(', ')}`,
    `Hora: ${buoni.hora.rule}`,
    buoni.verse53,
    buoni.narasimhaRaoSource,
    '',
  ];
  for (const graha of buoni.grahas) {
    const conti = graha.schemes
      .map((s) => `${s.scheme} ${s.good}/${s.vargas}${s.name ? ` ${s.name}` : ''}`)
      .join(' · ');
    const stati = [
      ...(graha.neecha ? ['in neecha nella rashi'] : []),
      ...(graha.combust ? ['combusto'] : []),
      ...(graha.defeated ? ['vinto in guerra'] : []),
    ];
    lines.push(`${graha.name.padEnd(11)} ${conti}${stati.map((s) => ` · ${s}`).join('')}`);
    const elenco = graha.vargas
      .filter((v) => v.good.length > 0)
      .map((v) => `${v.varga.toUpperCase()} ${v.good.join('+')}`)
      .join(', ');
    lines.push(`${''.padEnd(11)} buoni: ${elenco || 'nessuno'}`);
    const rao = graha.narasimhaRao;
    lines.push(
      `${''.padEnd(11)} Narasimha Rao: ` +
        rao.schemes.map((s) => `${s.scheme} ${s.good}/${s.vargas}${s.name ? ` ${s.name}` : ''}`).join(' · ') +
        ` (D2 ${SIGN_ABBR[rao.d2Sign]})`,
    );
  }
  return lines.join('\n');
}

/**
 * Le condizioni di BPHS 6.53, ciascuna con la sua fonte: combustione e
 * guerra sempre, le avastha con l'ora. I fattori dell'avastha stanno nella
 * riga, perché chi conta con un'altra lettura rifaccia la somma.
 */
function formatGrahaStatesCompact(stati: GrahaStates): string {
  const lines = ['STATI DEI GRAHA (BPHS 6.53)', '', `Combustione. ${stati.combustion.source}`];
  for (const c of stati.combustion.grahas) {
    lines.push(
      `${c.name.padEnd(11)} ${formatDegrees(c.distance).padEnd(9)} dal Sole, limite ${c.limit}°` +
        `${c.retrograde && (c.id === 'mercurio' || c.id === 'venere') ? ' (retrogrado)' : ''}` +
        `${c.combust ? ' · combusto' : ''}`,
    );
  }
  lines.push('', `Guerra planetaria. ${stati.wars.source}`);
  if (stati.wars.pairs.length === 0) lines.push('Nessuna coppia a meno di un grado.');
  for (const w of stati.wars.pairs) {
    lines.push(
      `${bodyName(w.between[0])} e ${bodyName(w.between[1])} a ${formatDegrees(w.separation)}` +
        ` (latitudini ${w.latitudes.map((l) => l.toFixed(2)).join(' e ')}): ` +
        `${w.victor ? `vince ${bodyName(w.victor)}` : 'nessun vincitore'}. ${w.rule}`,
    );
  }
  if (stati.avasthas) {
    const a = stati.avasthas;
    lines.push(
      '',
      `Avastha. ${a.source}`,
      `Alba ${a.sunrise}, ${a.ghatisSinceSunrise.toFixed(2)} ghati dopo: g ${a.ghati}; ` +
        `a ${a.moonNakshatra} (nakshatra della Luna); r ${a.lagnaSign} (lagna).`,
    );
    for (const g of a.grahas) {
      lines.push(
        `${g.name.padEnd(11)} ${g.avastha.padEnd(12)} (s ${g.factors.s} × p ${g.factors.p} × n ${g.factors.n}` +
          ` + a + g + r = ${g.total}, resto ${g.index % 12})`,
      );
    }
  }
  return lines.join('\n');
}

function warningLines(warnings: readonly string[]): string[] {
  if (warnings.length === 0) return [];
  return ['', 'AVVERTENZE', ...warnings.map((warning) => `- ${warning}`)];
}

function nameOf(chart: { bodies: readonly CelestialBody[] }, id: string): string {
  return chart.bodies.find((body) => body.id === id)?.name ?? id;
}

/** Il nome di un corpo quando non c'è nessuna carta da cui ricavarlo. */
function bodyName(id: BodyId): string {
  return BODIES.find((body) => body.id === id)?.name ?? id;
}

/** Gli stessi nomi visti come mappa parziale su tutti i bersagli possibili. */
const POINT_NAMES: Readonly<Partial<Record<NatalPointId, string>>> = NATAL_POINT_NAMES;

/** Il nome di un bersaglio natale: un corpo del tema, oppure un asse. */
function natalPointName(chart: NatalChart, id: NatalPointId): string {
  return POINT_NAMES[id] ?? nameOf(chart, id);
}

/**
 * Il nome di un transitante: un corpo del cielo, oppure un asse dell'istante.
 *
 * Gli assi non stanno fra i corpi calcolati — non lo sono — e cercarveli
 * lascerebbe nella tabella l'identificatore grezzo al posto del nome.
 */
function transitingName(transits: TransitChart, id: TransitingPointId): string {
  return POINT_NAMES[id] ?? nameOf({ bodies: transits.transiting }, id);
}

function formatPlace(place: Place): string {
  return `${formatCoordinate(place.latitude, 'N', 'S')} ${formatCoordinate(place.longitude, 'E', 'O')}`;
}

function formatCoordinate(value: number, positive: string, negative: string): string {
  const hemisphere = value >= 0 ? positive : negative;
  return `${Math.abs(value).toFixed(4)}${hemisphere}`;
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const rest = Math.round(absolute % 60);
  return `${sign}${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
