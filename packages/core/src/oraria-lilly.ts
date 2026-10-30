/**
 * L'astrologia oraria secondo Lilly: i significatori di una domanda, i modi
 * in cui il loro incontro si compie o si impedisce, e le considerazioni prima
 * del giudizio.
 *
 * Tutto viene da *Christian Astrology* (Londra 1647), libro I per le
 * definizioni (pp. 108-113) e libro II per il loro uso (pp. 121-126), lette
 * sulla scansione in `texts/occidentale/lilly-christian-astrology-1647`, con
 * le trascrizioni in `trascrizioni.md`. È il classificatore di una scuola
 * sopra il corso dei corpi di `corso.ts`, che non ne sceglie nessuna: una
 * scuola nuova è un file nuovo accanto a questo, non una modifica.
 *
 * **Il motore non giudica.** Dice chi sono i significatori, se e come la
 * figura porta al loro incontro secondo le definizioni di Lilly, e quali
 * delle sue condizioni valgono; non dice se la cosa domandata avverrà, né
 * quando. Quel passo è di Lilly, e del lettore.
 */

import { CHALDEAN_ORDER } from './constants.js';
import { findSignCourse } from './corso.js';
import { DOMICILES } from './dignita.js';
import { lillyRulersAt, lillyTriplicityRuler } from './dignita-lilly.js';
import { LILLY_HOUSE_POINTS, lillyHouse } from './condizioni-lilly.js';
import { computeBodies, initEphemeris } from './ephemeris.js';
import { ChartError } from './errors.js';
import { computeSky } from './sky.js';
import type {
  BodyId,
  HoraryConsideration,
  HoraryEvent,
  HoraryFinding,
  HoraryLilly,
  HoraryOptions,
  House,
  HorarySignificator,
  LillyBodyConditions,
  MutualReception,
  Place,
  ReceptionDignity,
  Sect,
  SignCourse,
  SkyMoment,
  ZodiacSign,
} from './types.js';

export const HORARY_LILLY_SOURCE =
  'Lilly, Christian Astrology (1647): significatori a pp. 123-124, modi della perfezione a pp. 125-126, ' +
  'applicazione a p. 108, separazione e proibizione a pp. 110-111, refranazione e traslazione a p. 111, ' +
  'frustrazione a pp. 112-113, considerazioni prima del giudizio a pp. 121-123, nature dei pianeti nel libro I.';

/** Le letture fatte dove il testo lascia una scelta. Viaggiano col risultato. */
export const HORARY_LILLY_READINGS: readonly string[] = [
  'Il più leggero è il più veloce nel moto medio, nell\'ordine caldeo: «ever the lighter to the more ponderous» (p. 108).',
  'La finestra finisce quando il più leggero dei due significatori cambia segno: fin lì si guardano tutti; oltre, il motore non guarda.',
  'Proibizione: un terzo pianeta, più leggero del significatore più pesante, perfeziona con lui prima che i due si incontrino ' +
    '(pp. 110-111). La Luna no, quando è cosignificatrice di chi chiede («we doe give the ☽ as a Cosignificator with ' +
    'the querent», p. 124): il suo incontro col significatore del quesito è la parte del querente, non un terzo che si ' +
    'mette in mezzo. Proibisce, come gli altri, solo quando è lei uno dei due significatori.',
  'Frustrazione: il significatore più pesante perfeziona prima con un pianeta ancora più pesante (pp. 112-113).',
  'Refranazione: il più leggero applica in orbita all\'istante e si ferma retrogrado prima di perfezionare (p. 111).',
  'Traslazione: un pianeta più leggero di tutti e due, separato da uno dei due da quando è nel segno, la cui prima applicazione ' +
    'è all\'altro (pp. 111 e 126). La ricezione che p. 126 aggiunge è riportata, non pretesa.',
  'Collezione: i due non si guardano, né in orbita né prima del cambio di segno, e perfezionano tutti e due con un pianeta più ' +
    'pesante di entrambi (p. 126). Anche qui la ricezione è riportata, e la sua mancanza detta.',
  'Le case dell\'Ascendente e del quesito sono rette dal signore tradizionale del segno della cuspide; la figura è eretta col ' +
    'Regiomontano, come le figure del libro II.',
  'Qualità della perfezione (p. 125): le case «good», «proper» e «friendly» sono quelle a cui la tavola delle fortezze di ' +
    'p. 115 dà punti positivi, cioè tutte tranne la 6, l\'8 e la 12; la casa conta con la regola dei cinque gradi (p. 33).',
  'Qualità della perfezione: la congiunzione si giudica nella casa del grado in cui si compie («if this ☌ … be in a ' +
    'Succedant house»), con le cuspidi della figura.',
  'Qualità della perfezione: «have dignity in the Degrees wherein they are» (quadrato) vuol dire non peregrino (p. 112); ' +
    '«essentially well dignified» e «Essentially or Accidentally strong» non hanno una soglia, e non si calcolano.',
];

/**
 * Le nature dei sette, dal capitolo di ciascuno nel libro I. Mercurio «of his
 * owne nature he is cold and dry», ma prende la natura di chi gli è congiunto
 * (p. 77): qui la sua, dichiarata nella considerazione.
 */
const NATURA: Readonly<Partial<Record<BodyId, readonly [string, string]>>> = {
  saturno: ['freddo', 'secco'], // p. 58
  giove: ['caldo', 'umido'], // p. 62
  marte: ['caldo', 'secco'], // p. 66
  sole: ['caldo', 'secco'], // p. 70
  venere: ['freddo', 'umido'], // p. 73
  mercurio: ['freddo', 'secco'], // p. 77
  luna: ['freddo', 'umido'], // p. 81
};

const SETTE: readonly BodyId[] = ['sole', 'luna', 'mercurio', 'venere', 'marte', 'giove', 'saturno'];

/** I segni di ascensione breve che p. 122 nomina per i primi gradi. */
const ASCENSIONE_BREVE: readonly ZodiacSign[] = ['capricorno', 'acquario', 'pesci', 'ariete', 'toro', 'gemelli'];

/** Il peso di un pianeta: più alto per i più lenti, nell'ordine caldeo. */
function peso(body: BodyId): number {
  const indice = CHALDEAN_ORDER.indexOf(body);
  return indice < 0 ? -1 : CHALDEAN_ORDER.length - indice;
}

/**
 * Il tema orario di una domanda, secondo Lilly.
 *
 * Vuole l'ora e il luogo: senza, non ci sono case, e senza case non c'è
 * nessun significatore del quesito.
 */
export function computeHoraryLilly(moment: SkyMoment, place: Place, options: HoraryOptions): HoraryLilly {
  const { question } = options;
  for (const [nome, valore] of [
    ['house', question.house],
    ['derivedFrom', question.derivedFrom],
  ] as const) {
    if (valore !== undefined && (!Number.isInteger(valore) || valore < 1 || valore > 12)) {
      throw new ChartError('CASA_NON_VALIDA', `${nome} deve essere una casa da 1 a 12, non ${valore}.`);
    }
  }
  if (!moment.time) {
    throw new ChartError(
      'ORA_NON_VALIDA',
      "Un tema orario vuole l'ora della domanda: senza, le case non ci sono, e nemmeno i significatori.",
    );
  }

  const chart = computeSky(moment, {
    place,
    houseSystem: 'regiomontano',
    dignitySchool: 'lilly',
    orbConvention: 'lilly',
    ...(options.ephemerisPath ? { ephemerisPath: options.ephemerisPath } : {}),
  });
  const warnings = [...chart.warnings];
  const conditions = chart.dignities!.lilly!.conditions;
  const condizioniDi = (id: BodyId): LillyBodyConditions | undefined =>
    conditions.bodies.find((body) => body.id === id);

  const effectiveHouse = question.derivedFrom
    ? ((question.derivedFrom - 1 + question.house - 1) % 12) + 1
    : question.house;
  const cuspide = (numero: number): ZodiacSign => chart.houses.find((house) => house.number === numero)!.sign;
  const signoreAsc = DOMICILES.tradizionale[cuspide(1)];
  const signoreQuesito = DOMICILES.tradizionale[cuspide(effectiveHouse)];

  const significatore = (body: BodyId, role: HorarySignificator['role'], rules: number): HorarySignificator => {
    const corpo = chart.bodies.find((b) => b.id === body)!;
    const s: HorarySignificator = { body, role, rules, longitude: corpo.longitude, sign: corpo.sign };
    const casa = condizioniDi(body)?.house;
    if (casa !== undefined) s.house = casa;
    return s;
  };
  const significators = [
    significatore(signoreAsc, 'querente', 1),
    significatore(signoreQuesito, 'quesito', effectiveHouse),
  ];
  if (signoreAsc !== 'luna' && signoreQuesito !== 'luna') significators.push(significatore('luna', 'cosignificatore', 1));

  // Il corso del più leggero dei due fissa la finestra: finisce quando lui
  // cambia segno. Gli altri si guardano fino a lì; la Luna per intero, perché
  // la sua vuota di corso è una considerazione.
  const timezone = moment.timezone;
  const corsoDi = (id: BodyId, until?: number): SignCourse =>
    findSignCourse(chart.time.julianDayUT, id, {
      timezone,
      ...(until !== undefined ? { until } : {}),
      ...(options.ephemerisPath ? { ephemerisPath: options.ephemerisPath } : {}),
    });
  const leggero = peso(signoreAsc) <= peso(signoreQuesito) ? signoreAsc : signoreQuesito;
  const courses = new Map<BodyId, SignCourse>();
  courses.set(leggero, corsoDi(leggero));
  courses.set('luna', courses.get('luna') ?? corsoDi('luna'));
  const uscita = courses.get(leggero)!.events.find((e) => e.kind === 'ingresso');
  const limite = uscita ? Date.parse(uscita.exact) / 86_400_000 + 2440587.5 : undefined;
  for (const id of SETTE) if (!courses.has(id)) courses.set(id, corsoDi(id, limite));

  const sameSignificator = signoreAsc === signoreQuesito;
  const applicaAllInizio = chart.aspects.some(
    (aspect) =>
      aspect.applying &&
      ((aspect.from === signoreAsc && aspect.to === signoreQuesito) ||
        (aspect.from === signoreQuesito && aspect.to === signoreAsc)),
  );
  const inOrbita = chart.aspects.some(
    (aspect) =>
      (aspect.from === signoreAsc && aspect.to === signoreQuesito) ||
      (aspect.from === signoreQuesito && aspect.to === signoreAsc),
  );
  const { perfections, impediments } = sameSignificator
    ? { perfections: [], impediments: [] }
    : classifyLilly({
        a: signoreAsc,
        b: signoreQuesito,
        courses,
        positions: chart.bodies,
        sect: chart.sect,
        applyingAtStart: applicaAllInizio,
        inOrbAtStart: inOrbita,
        ...(signoreAsc !== 'luna' && signoreQuesito !== 'luna' ? { cosignificator: 'luna' as const } : {}),
      });
  const condizioniPer = new Map(conditions.bodies.map((body) => [body.id, body]));
  for (const finding of perfections) {
    if (finding.mode !== 'congiunzione' && finding.mode !== 'aspetto') continue;
    finding.quality = qualitaDellaPerfezione({
      finding,
      querente: signoreAsc,
      quesito: signoreQuesito,
      condizioni: condizioniPer,
      houses: chart.houses,
      mutue: chart.dignities!.receptions.mutual,
      luna: courses.get('luna')!,
      ephemerisPath: options.ephemerisPath,
    });
  }

  if (sameSignificator) {
    warnings.push(
      `Lo stesso pianeta, ${chart.bodies.find((b) => b.id === signoreAsc)?.name}, regge l'Ascendente e la casa ` +
        `${effectiveHouse}: non c'è un incontro fra due significatori da cercare.`,
    );
  }

  const result: HoraryLilly = {
    school: 'lilly',
    source: HORARY_LILLY_SOURCE,
    readings: [...HORARY_LILLY_READINGS],
    chart,
    question: { ...question, effectiveHouse, cuspSign: cuspide(effectiveHouse) },
    significators,
    sameSignificator,
    courses: [...new Set(significators.map((s) => s.body))].map((id) => courses.get(id)!),
    perfections,
    impediments,
    considerations: considerationsOf(chart, conditions.bodies, signoreAsc, cuspide, courses.get('luna')!),
    warnings,
  };
  return result;
}

export interface LillyClassifierInput {
  /** I due significatori, in qualunque ordine. */
  a: BodyId;
  b: BodyId;
  /** Il corso di ogni pianeta che può entrare nel conto: i sette. */
  courses: ReadonlyMap<BodyId, SignCourse>;
  /** Le posizioni all'istante, per le ricezioni. */
  positions: readonly { id: BodyId; longitude: number }[];
  sect: Sect | undefined;
  /** Se all'istante i due sono in un aspetto applicativo entro le orbite di Lilly. */
  applyingAtStart: boolean;
  /** Se all'istante sono in un aspetto qualunque entro le orbite. */
  inOrbAtStart: boolean;
  /**
   * La Luna quando è cosignificatrice di chi chiede (p. 124): non proibisce.
   * Assente quando è lei uno dei due significatori.
   */
  cosignificator?: BodyId;
}

/**
 * I classificatori della scuola di Lilly sopra il corso dei corpi: che cosa
 * porta i due significatori a incontrarsi, e che cosa lo impedisce.
 */
export function classifyLilly(input: LillyClassifierInput): { perfections: HoraryFinding[]; impediments: HoraryFinding[] } {
  const { a, b, courses } = input;
  const leggero = peso(a) < peso(b) ? a : b;
  const pesante = leggero === a ? b : a;
  const aspetti = (id: BodyId): HoraryEvent[] =>
    (courses.get(id)?.events ?? []).filter((e) => e.kind === 'aspetto').map((e) => ({ ...e, body: id }));
  const con = (event: HoraryEvent): BodyId | undefined => (event.kind === 'aspetto' ? event.with : undefined);

  const perfections: HoraryFinding[] = [];
  const impediments: HoraryFinding[] = [];

  // L'incontro diretto: il primo aspetto esatto fra i due, dal corso di
  // ciascuno. Lo stesso evento compare in tutti e due i corsi.
  const diretto = [...aspetti(leggero), ...aspetti(pesante)]
    .filter((event) => con(event) === (event.body === leggero ? pesante : leggero))
    .sort((x, y) => x.exact.localeCompare(y.exact))[0];

  // Il limite entro cui un impedimento conta: l'incontro, o l'uscita dal
  // segno del più leggero se l'incontro non c'è.
  const uscita = courses.get(leggero)?.events.find((e) => e.kind === 'ingresso')?.exact;
  const limite = diretto?.exact ?? uscita;

  if (diretto && diretto.kind === 'aspetto') {
    const congiunzione = diretto.aspect === 'congiunzione';
    perfections.push({
      mode: congiunzione ? 'congiunzione' : 'aspetto',
      definition: congiunzione
        ? 'Il signore dell\'Ascendente e quello del quesito si affrettano alla congiunzione e la perfezionano.'
        : 'I significatori si applicano per sestile, trigono, quadrato o opposizione e lo perfezionano.',
      page: 125,
      aspect: diretto.aspect,
      exact: diretto.exact,
      local: diretto.local,
      events: [diretto],
    });
  }

  // Proibizione e frustrazione: il più pesante perfeziona con un terzo prima
  // dell'incontro, o prima che il più leggero lasci il segno se applicavano.
  if (limite && (diretto || input.applyingAtStart)) {
    for (const event of aspetti(pesante)) {
      const terzo = con(event);
      if (!terzo || terzo === leggero || event.exact >= limite || !SETTE.includes(terzo)) continue;
      // La cosignificatrice è la parte di chi chiede, non un terzo (p. 124).
      if (terzo === input.cosignificator) continue;
      const frustra = peso(terzo) > peso(pesante);
      const corpo = event.kind === 'aspetto' && event.aspect === 'congiunzione';
      impediments.push({
        mode: frustra ? 'frustrazione' : 'proibizione',
        definition: frustra
          ? 'Prima che il più veloce raggiunga il più pesante, il più pesante si congiunge a un altro (pp. 112-113).'
          : `Prima che i due si incontrino un altro pianeta interpone ${corpo ? 'il suo corpo' : 'il suo aspetto'} (pp. 110-111).`,
        page: frustra ? 112 : 110,
        by: terzo,
        ...(event.kind === 'aspetto' ? { aspect: event.aspect } : {}),
        exact: event.exact,
        local: event.local,
        events: [event],
      });
    }
  }

  // Refranazione: applicavano, e il più leggero si ferma prima dell'incontro.
  if (!diretto && input.applyingAtStart) {
    const stazione = (courses.get(leggero)?.events ?? []).find(
      (e) => e.kind === 'stazione' && e.direction === 'retrograda',
    );
    if (stazione) {
      impediments.push({
        mode: 'refranazione',
        definition: 'Il più leggero si affretta all\'aspetto ma diventa retrogrado prima di arrivarci (p. 111).',
        page: 111,
        by: leggero,
        exact: stazione.exact,
        local: stazione.local,
        events: [{ ...stazione, body: leggero }],
      });
    }
  }

  // Traslazione: un terzo più leggero dei due, separato da uno, che come
  // primo aspetto raggiunge l'altro.
  for (const terzo of SETTE) {
    if (terzo === a || terzo === b || peso(terzo) >= peso(leggero)) continue;
    const corso = courses.get(terzo);
    if (!corso) continue;
    const prima = aspetti(terzo)[0];
    const verso = prima ? con(prima) : undefined;
    if (!prima || (verso !== a && verso !== b)) continue;
    const da = verso === a ? b : a;
    const separazione = [...corso.separations].reverse().find((e) => e.kind === 'aspetto' && e.with === da);
    if (!separazione) continue;
    const dignita = ricezione(da, terzo, input, ['domicilio', 'triplicita', 'termine']);
    const finding: HoraryFinding = {
      mode: 'traslazione',
      definition:
        'Un pianeta leggero si separa da uno dei significatori e subito si applica all\'altro, trasferendone la virtù (pp. 111 e 126).',
      page: 111,
      by: terzo,
      ...(prima.kind === 'aspetto' ? { aspect: prima.aspect } : {}),
      exact: prima.exact,
      local: prima.local,
      events: [{ ...separazione, body: terzo }, prima],
      reception: [{ by: da, of: terzo, dignities: dignita }],
    };
    if (dignita.length === 0) {
      finding.note = `A p. 126 chi trasferisce è ricevuto da chi lascia, per domicilio, triplicità o termine: qui no.`;
    }
    perfections.push(finding);
  }

  // Collezione: i due non si guardano, e tutti e due raggiungono un terzo più
  // pesante di entrambi.
  if (!diretto && !input.inOrbAtStart) {
    for (const terzo of SETTE) {
      if (terzo === a || terzo === b || peso(terzo) <= peso(pesante)) continue;
      const daA = aspetti(a).find((e) => con(e) === terzo);
      const daB = aspetti(b).find((e) => con(e) === terzo);
      if (!daA || !daB) continue;
      const riceveA = ricezione(a, terzo, input, ['domicilio', 'esaltazione', 'triplicita', 'termine', 'faccia']);
      const riceveB = ricezione(b, terzo, input, ['domicilio', 'esaltazione', 'triplicita', 'termine', 'faccia']);
      const ultimo = daA.exact > daB.exact ? daA : daB;
      const finding: HoraryFinding = {
        mode: 'collezione',
        definition:
          'I due significatori non si guardano, ma si applicano tutti e due a un pianeta più pesante che li riceve (p. 126).',
        page: 126,
        by: terzo,
        exact: ultimo.exact,
        local: ultimo.local,
        events: [daA, daB].sort((x, y) => x.exact.localeCompare(y.exact)),
        reception: [
          { by: a, of: terzo, dignities: riceveA },
          { by: b, of: terzo, dignities: riceveB },
        ],
      };
      if (riceveA.length === 0 || riceveB.length === 0) {
        finding.note = 'A p. 126 i due ricevono chi raccoglie «in some of their essentiall dignities»: qui non tutti e due.';
      }
      perfections.push(finding);
    }
  }

  return { perfections, impediments };
}

/** Le dignità per cui `ricevente` riceve `ricevuto`: `ricevuto` sta in una dignità di `ricevente`. */
function ricezione(
  ricevente: BodyId,
  ricevuto: BodyId,
  input: LillyClassifierInput,
  voci: readonly ReceptionDignity[],
): ReceptionDignity[] {
  const posizione = input.positions.find((p) => p.id === ricevuto);
  if (!posizione) return [];
  const signori = lillyRulersAt(posizione.longitude, input.sect);
  return voci.filter((voce) => signori[voce] === ricevente);
}

/**
 * Le condizioni di qualità della perfezione, p. 125, per il modo che la
 * figura porta: congiunzione, sestile o trigono, quadrato, opposizione. Le
 * letture sono in `HORARY_LILLY_READINGS`.
 */
function qualitaDellaPerfezione(input: {
  finding: HoraryFinding;
  querente: BodyId;
  quesito: BodyId;
  condizioni: ReadonlyMap<BodyId, LillyBodyConditions>;
  houses: readonly House[];
  mutue: readonly MutualReception[];
  luna: SignCourse;
  ephemerisPath: string | undefined;
}): HoraryConsideration[] {
  const { finding, querente, quesito, condizioni } = input;
  const due = [querente, quesito];
  const nome = (id: BodyId): string => condizioni.get(id)?.name ?? id;
  const casaBuona = (casa: number | undefined): boolean | undefined =>
    casa === undefined ? undefined : (LILLY_HOUSE_POINTS[casa] ?? 0) > 0;
  const caseBuone = (testo: string): HoraryConsideration => {
    const case_ = due.map((id) => condizioni.get(id)?.house);
    const esiti = case_.map(casaBuona);
    const consideration: HoraryConsideration = {
      id: 'case-buone',
      page: 125,
      text: testo,
      detail: due.map((id, k) => `${nome(id)} in casa ${case_[k] ?? '?'}`).join(', ') + '.',
    };
    if (esiti.every((esito) => esito !== undefined)) consideration.holds = esiti.every(Boolean);
    return consideration;
  };
  const dignita = (): HoraryConsideration => ({
    id: 'dignita',
    page: 125,
    text: 'Ciascun pianeta ha dignità nel grado in cui sta («have dignity in the Degrees wherein they are»).',
    holds: due.every((id) => condizioni.get(id)?.peregrine === false),
    detail:
      due.map((id) => `${nome(id)} ${condizioni.get(id)?.peregrine ? 'peregrino' : 'con dignità'}`).join(', ') +
      ' (p. 112).',
  });
  const forti = (testo: string): HoraryConsideration => ({
    id: 'forti',
    page: 125,
    text: testo,
    detail:
      'Senza soglia nel testo: non calcolata. Le differenze della tavola di p. 115: ' +
      due.map((id) => `${nome(id)} ${condizioni.get(id)?.score.totals.net ?? '?'}`).join(', ') +
      '.',
  });

  if (finding.mode === 'congiunzione') {
    const risultato: HoraryConsideration[] = [];
    const esatto = finding.exact ? Date.parse(finding.exact) / 86_400_000 + 2440587.5 : undefined;
    if (esatto !== undefined) {
      const context = initEphemeris(input.ephemerisPath);
      // Il grado della congiunzione: quello del più pesante, che nell'istante
      // esatto è lo stesso dell'altro.
      const pesante = peso(querente) >= peso(quesito) ? querente : quesito;
      const longitudine = computeBodies(esatto, [pesante], context).bodies[0]?.longitude;
      const casa = longitudine === undefined ? undefined : lillyHouse(longitudine, input.houses);
      if (casa !== undefined) {
        const angolare = casa % 3 === 1;
        const succedente = casa % 3 === 2;
        risultato.push({
          id: 'casa-della-congiunzione',
          page: 125,
          text: 'La congiunzione si compie nella prima casa o in un angolo («in the first house, or in any Angle»).',
          holds: angolare,
          detail: `In casa ${casa}, ${
            angolare
              ? 'angolare'
              : succedente
                ? 'succedente: «it will be perfected, but not so soon»'
                : 'cadente: «with infinite losse of time, some difficulty, and much strugling»'
          }.`,
        });
      }
    }
    risultato.push({
      id: 'veloci',
      page: 125,
      text: 'Più presto se i significatori sono veloci nel moto («swift in motion»).',
      holds: due.every((id) => condizioni.get(id)?.motion.pace === 'veloce'),
      detail:
        due.map((id) => `${nome(id)} ${condizioni.get(id)?.motion.pace ?? '?'}`).join(', ') +
        ', rispetto al moto medio del libro I.',
    });
    risultato.push(forti('Più presto se sono forti, per dignità essenziale o accidentale («Essentially or Accidentally strong»).'));
    return risultato;
  }

  const aspetto = finding.aspect;
  if (aspetto === 'sestile' || aspetto === 'trigono') {
    return [
      caseBuone('Applicano da case buone («out of good Houses»).'),
      forti('Applicano da luoghi in cui sono ben dignificati («essentially well dignified»).'),
    ];
  }
  if (aspetto === 'quadrato') {
    return [dignita(), caseBuone('Applicano da case proprie e buone («out of proper and good Houses»), «otherwise not».')];
  }
  if (aspetto === 'opposizione') {
    const mutua = input.mutue.find(
      (m) =>
        due.includes(m.bodies[0]) &&
        due.includes(m.bodies[1]) &&
        m.firstReceives.includes('domicilio') &&
        m.secondReceives.includes('domicilio'),
    );
    const risultato: HoraryConsideration[] = [
      {
        id: 'mutua-per-domicilio',
        page: 125,
        text: 'C\'è mutua ricezione per domicilio («mutuall reception by House»).',
        holds: mutua !== undefined,
      },
      caseBuone('Applicano da case amiche («out of friendly Houses»).'),
    ];
    if (querente !== 'luna' && quesito !== 'luna') {
      const separazione = input.luna.lastPerfected;
      const prossimo = input.luna.events.find((e) => e.kind === 'aspetto');
      const daQuesito = separazione?.kind === 'aspetto' && separazione.with === quesito;
      const aQuerente = prossimo?.kind === 'aspetto' && prossimo.with === querente;
      risultato.push({
        id: 'luna',
        page: 125,
        text:
          'La Luna si separa dal significatore della cosa chiesta e applica subito al signore dell\'Ascendente ' +
          '(«the ☽ seperating from the Significator of the thing demanded, and applying presently to the Lord of the Ascendant»).',
        holds: daQuesito && aQuerente,
        detail:
          `Si separa da ${separazione?.kind === 'aspetto' ? nome(separazione.with) : 'nessuno nel segno'}, ` +
          `applica per prima a ${prossimo?.kind === 'aspetto' ? nome(prossimo.with) : 'nessuno prima del cambio di segno'}.`,
      });
    }
    return risultato;
  }
  return [];
}

/** Le considerazioni prima del giudizio, pp. 121-123, una per una. */
function considerationsOf(
  chart: HoraryLilly['chart'],
  bodies: readonly LillyBodyConditions[],
  signoreAsc: BodyId,
  cuspide: (numero: number) => ZodiacSign,
  luna: SignCourse,
): HoraryConsideration[] {
  const conditions = chart.dignities!.lilly!.conditions;
  const di = (id: BodyId): LillyBodyConditions | undefined => bodies.find((body) => body.id === id);
  const nome = (id: BodyId): string => chart.bodies.find((body) => body.id === id)?.name ?? id;
  const out: HoraryConsideration[] = [];

  const ora = conditions.hour?.ruler;
  const segnoAsc = cuspide(1);
  if (ora) {
    const stesso = ora === signoreAsc;
    const reggenti = [lillyTriplicityRuler(segnoAsc, 'diurna'), lillyTriplicityRuler(segnoAsc, 'notturna')];
    const triplicita = reggenti.includes(ora as never);
    const naturaOra = NATURA[ora];
    const naturaAsc = NATURA[signoreAsc];
    const natura = !!naturaOra && !!naturaAsc && naturaOra.join() === naturaAsc.join();
    const parti = [
      stesso ? 'è lo stesso pianeta' : '',
      triplicita ? `${nome(ora)} regge la triplicità di ${segnoAsc}` : '',
      natura ? `tutti e due ${naturaOra.join(' e ')}` : '',
    ].filter(Boolean);
    out.push({
      id: 'radicale',
      page: 121,
      text:
        "La figura è radicale quando il signore dell'ora e quello dell'Ascendente sono della stessa triplicità, " +
        'lo stesso pianeta, o della stessa natura.',
      holds: parti.length > 0,
      detail:
        `Ora di ${nome(ora)}, Ascendente ${segnoAsc} di ${nome(signoreAsc)}` +
        (parti.length > 0 ? `: ${parti.join('; ')}.` : ': nessuna delle tre.') +
        (ora === 'mercurio' || signoreAsc === 'mercurio'
          ? ' Mercurio con la sua natura, fredda e secca; congiunto prende quella di chi gli sta accanto (p. 77).'
          : ''),
    });
  } else {
    out.push({
      id: 'radicale',
      page: 121,
      text: "La figura è radicale se il signore dell'ora e quello dell'Ascendente si accordano.",
      detail: "L'ora planetaria non c'è: qui il Sole non sorge o non tramonta.",
    });
  }

  if (conditions.ascendant) {
    const grado = conditions.ascendant.signDegree;
    out.push({
      id: 'ascendente-presto',
      page: 122,
      text: "Ascendono 0, 1 o 2 gradi di un segno, soprattutto nei segni di ascensione breve.",
      holds: conditions.ascendant.early,
      detail: `${segnoAsc} a ${grado.toFixed(2)}°${ASCENSIONE_BREVE.includes(segnoAsc) ? ', segno di ascensione breve' : ''}.`,
    });
    out.push({
      id: 'ascendente-tardi',
      page: 122,
      text: 'Ascendono 27, 28 o 29 gradi di un segno.',
      holds: conditions.ascendant.late,
    });
  }

  out.push({
    id: 'luna-gradi-tardi',
    page: 122,
    text: 'La Luna negli ultimi gradi di un segno, soprattutto in Gemelli, Scorpione o Capricorno.',
    detail: 'Lilly non dice da che grado: non si calcola.',
  });
  if (conditions.moonInViaCombusta !== undefined) {
    out.push({
      id: 'luna-via-combusta',
      page: 122,
      text: 'La Luna in Via Combusta, gli ultimi 15° della Bilancia e i primi 15° dello Scorpione («as some say»).',
      holds: conditions.moonInViaCombusta,
    });
  }
  const vuota = luna.voids.find((v) => v.school === 'lilly');
  out.push({
    id: 'luna-vuota',
    page: 122,
    text: 'La Luna vuota di corso, secondo la definizione di p. 112.',
    ...(vuota ? { holds: vuota.void } : {}),
    ...(vuota?.applyingAtExit
      ? { detail: `All'uscita dal segno applica a ${nome(vuota.applyingAtExit.with)} per ${vuota.applyingAtExit.aspect}.` }
      : vuota
        ? {}
        : { detail: 'Il segno della Luna non finisce entro la finestra.' }),
  });

  const settimo = DOMICILES.tradizionale[cuspide(7)];
  const condSettimo = di(settimo);
  out.push({
    id: 'settima',
    page: 122,
    text: 'La cuspide della settima afflitta, o il suo signore retrogrado o impedito.',
    ...(condSettimo ? { holds: condSettimo.motion.direction === 'retrogrado' } : {}),
    detail:
      `Signore della settima: ${nome(settimo)}${condSettimo?.motion.direction === 'retrogrado' ? ', retrogrado' : ', diretto'}. ` +
      'Si calcola solo il retrogrado: «afflitta» e «impedito» Lilly non li misura.',
  });

  const saturno = di('saturno');
  out.push({
    id: 'saturno-ascendente',
    page: 122,
    text: "Saturno nell'Ascendente, soprattutto retrogrado.",
    ...(saturno?.house !== undefined ? { holds: saturno.house === 1 } : {}),
    ...(saturno?.house === 1 && saturno.motion.direction === 'retrogrado' ? { detail: 'Ed è retrogrado.' } : {}),
  });
  out.push({
    id: 'saturno-settima',
    page: 123,
    text: 'Saturno nella settima.',
    ...(saturno?.house !== undefined ? { holds: saturno.house === 7 } : {}),
  });

  const asc = di(signoreAsc);
  out.push({
    id: 'signore-ascendente-combusto',
    page: 123,
    text: "Il signore dell'Ascendente combusto.",
    ...(asc?.sun ? { holds: asc.sun.state === 'combusto' } : signoreAsc === 'sole' ? { holds: false } : {}),
    ...(signoreAsc === 'sole' ? { detail: "Il signore dell'Ascendente è il Sole." } : {}),
  });

  const posSettimo = chart.bodies.find((body) => body.id === settimo);
  if (posSettimo && condSettimo) {
    const signori = lillyRulersAt(posSettimo.longitude, chart.sect);
    const caduto = chart.dignities!.lilly!.bodies.find((b) => b.id === settimo)?.dignities.includes('caduta') ?? false;
    const termineMalefico = signori.termine === 'saturno' || signori.termine === 'marte';
    const parti = [caduto ? 'in caduta' : '', termineMalefico ? `nel termine di ${nome(signori.termine)}` : ''].filter(Boolean);
    out.push({
      id: 'signore-settima',
      page: 123,
      text: 'Il signore della settima sfortunato, in caduta, o nei termini dei malefici.',
      holds: caduto || termineMalefico,
      detail:
        `${nome(settimo)}${parti.length > 0 ? `: ${parti.join(', ')}` : ': né in caduta né nei termini dei malefici'}. ` +
        '«Sfortunato» non si misura.',
    });
  }

  return out;
}

