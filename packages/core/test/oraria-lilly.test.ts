import { describe, expect, it } from 'vitest';
import { ChartError } from '../src/errors.js';
import { classifyLilly, computeHoraryLilly, type LillyClassifierInput } from '../src/oraria-lilly.js';
import type { AspectId, BodyId, CourseEvent, SignCourse } from '../src/types.js';

/**
 * Gli esempi del libro I danno le posizioni e lasciano al lettore il moto: un
 * corso scritto a mano per ciascun pianeta, con gli eventi nell'ordine che
 * l'esempio descrive, è il modo di provare la definizione e non l'effemeride.
 */
function corso(body: BodyId, events: CourseEvent[], separations: CourseEvent[] = []): SignCourse {
  return {
    body,
    name: body,
    at: '2026-01-01T00:00Z',
    local: '2026-01-01T00:00Z',
    longitude: 0,
    sign: 'ariete',
    signDegree: 0,
    with: [],
    separations,
    events,
    voids: [],
    warnings: [],
  };
}

function aspetto(withBody: BodyId, aspect: AspectId, giorno: number): CourseEvent {
  const exact = `2026-01-${String(giorno).padStart(2, '0')}T00:00Z`;
  return { kind: 'aspetto', with: withBody, aspect, retrograde: { body: false, other: false }, exact, local: exact };
}

function ingresso(giorno: number): CourseEvent {
  const exact = `2026-01-${String(giorno).padStart(2, '0')}T00:00Z`;
  return { kind: 'ingresso', sign: 'toro', from: 'ariete', retrograde: false, exact, local: exact };
}

function input(a: BodyId, b: BodyId, courses: SignCourse[], extra: Partial<LillyClassifierInput> = {}): LillyClassifierInput {
  return {
    a,
    b,
    courses: new Map(courses.map((c) => [c.body, c])),
    positions: [],
    sect: 'diurna',
    applyingAtStart: true,
    inOrbAtStart: true,
    ...extra,
  };
}

describe('i classificatori, sugli esempi di Lilly', () => {
  it('riconosce la proibizione per corpo di p. 111', () => {
    // «♂ is in 7. degr. of ♈, and ♄ is in the 12 … the ☉ is at the same time
    // in 6. degr. of ♈ … he will overtake ♂, and come to ☌ with ♄ before ♂».
    const { perfections, impediments } = classifyLilly(
      input('marte', 'saturno', [
        corso('marte', [aspetto('sole', 'congiunzione', 2), aspetto('saturno', 'congiunzione', 6), ingresso(20)]),
        corso('saturno', [aspetto('sole', 'congiunzione', 4), aspetto('marte', 'congiunzione', 6)]),
      ]),
    );
    expect(perfections[0]).toMatchObject({ mode: 'congiunzione', page: 125 });
    expect(impediments).toHaveLength(1);
    expect(impediments[0]).toMatchObject({ mode: 'proibizione', by: 'sole', aspect: 'congiunzione' });
  });

  it("riconosce la proibizione per aspetto di p. 111", () => {
    // «♂ in 7. degr. of ♈, ♄ in 15 of ♈ … the ☉ in 5. degr. of ♊ … comes
    // before ♂ can come to ☌ to a ✶ dexter of ♄».
    const { impediments } = classifyLilly(
      input('marte', 'saturno', [
        corso('marte', [aspetto('saturno', 'congiunzione', 10), ingresso(25)]),
        corso('saturno', [aspetto('sole', 'sestile', 5), aspetto('marte', 'congiunzione', 10)]),
      ]),
    );
    expect(impediments[0]).toMatchObject({ mode: 'proibizione', by: 'sole', aspect: 'sestile', page: 110 });
  });

  it('riconosce la refranazione di p. 111', () => {
    // «♄ in 12. degr. of ♈, ♂ in 7. … before he comes to the tenth or
    // eleventh degree of ♈ he becomes Retrograde».
    const stazione: CourseEvent = {
      kind: 'stazione',
      direction: 'retrograda',
      longitude: 10.5,
      exact: '2026-01-05T00:00Z',
      local: '2026-01-05T00:00Z',
    };
    const { perfections, impediments } = classifyLilly(
      input('marte', 'saturno', [corso('marte', [stazione, ingresso(28)]), corso('saturno', [])]),
    );
    expect(perfections).toEqual([]);
    expect(impediments[0]).toMatchObject({ mode: 'refranazione', by: 'marte', page: 111 });
    // Senza applicazione all'istante non c'è niente da cui astenersi.
    const lontani = classifyLilly(
      input('marte', 'saturno', [corso('marte', [stazione, ingresso(28)]), corso('saturno', [])], {
        applyingAtStart: false,
      }),
    );
    expect(lontani.impediments).toEqual([]);
  });

  it('riconosce la frustrazione di p. 113', () => {
    // «☿ in ten degrees of ♈, ♂ twelve, ♃ in thirteen of ♈; here ☿ strives
    // to come to ☌ with ♂, but ♂ first gets to ☌ with ♃».
    const { impediments } = classifyLilly(
      input('mercurio', 'marte', [
        corso('mercurio', [aspetto('marte', 'congiunzione', 6), ingresso(20)]),
        corso('marte', [aspetto('giove', 'congiunzione', 3), aspetto('mercurio', 'congiunzione', 6)]),
      ]),
    );
    expect(impediments[0]).toMatchObject({ mode: 'frustrazione', by: 'giove', page: 112 });
  });

  it('riconosce la traslazione di p. 111', () => {
    // «Let ♄ be in 20. degr. of ♈: ♂ in 15. of ♈, and ☿ in 16. of ♈; here ☿
    // being a swift Planet seperates from ♂, and translates the vertue of ♂
    // unto ♄».
    const { perfections } = classifyLilly(
      input(
        'marte',
        'saturno',
        [
          corso('marte', [ingresso(25)]),
          corso('saturno', []),
          corso('mercurio', [aspetto('saturno', 'congiunzione', 4)], [aspetto('marte', 'congiunzione', 1)]),
        ],
        { applyingAtStart: false },
      ),
    );
    const traslazione = perfections.find((p) => p.mode === 'traslazione');
    expect(traslazione).toMatchObject({ by: 'mercurio', aspect: 'congiunzione' });
    expect(traslazione?.events.map((e) => (e.kind === 'aspetto' ? e.with : ''))).toEqual(['marte', 'saturno']);
  });

  it('non chiama traslazione chi, prima dell altro significatore, incontra un terzo', () => {
    // «before he meeteth with the ☌ or aspect of any other Planet» (p. 126).
    const { perfections } = classifyLilly(
      input(
        'marte',
        'saturno',
        [
          corso('marte', [ingresso(25)]),
          corso('saturno', []),
          corso(
            'mercurio',
            [aspetto('venere', 'sestile', 2), aspetto('saturno', 'congiunzione', 4)],
            [aspetto('marte', 'congiunzione', 1)],
          ),
        ],
        { applyingAtStart: false },
      ),
    );
    expect(perfections.filter((p) => p.mode === 'traslazione')).toEqual([]);
  });

  it('riconosce la collezione di p. 126 e dice la ricezione', () => {
    // I due non si guardano e si applicano tutti e due a Saturno, che sta a
    // 15 dei Gemelli: nel domicilio di Mercurio e nel termine di Venere.
    const { perfections } = classifyLilly(
      input(
        'venere',
        'mercurio',
        [
          corso('venere', [aspetto('saturno', 'trigono', 5), ingresso(20)]),
          corso('mercurio', [aspetto('saturno', 'sestile', 3)]),
          corso('saturno', []),
        ],
        { applyingAtStart: false, inOrbAtStart: false, positions: [{ id: 'saturno', longitude: 75 }] },
      ),
    );
    const collezione = perfections.find((p) => p.mode === 'collezione');
    expect(collezione).toMatchObject({ by: 'saturno', exact: '2026-01-05T00:00Z' });
    expect(collezione?.reception).toEqual([
      { by: 'venere', of: 'saturno', dignities: ['termine'] },
      { by: 'mercurio', of: 'saturno', dignities: ['domicilio'] },
    ]);
    expect(collezione?.note).toBeUndefined();
  });
});

describe('la domanda del 1634 (Christian Astrology, pp. 177-182)', () => {
  // «If the Querent shall be Rich or Poore», domanda di seconda casa: la
  // Bilancia sorge, e la signora dell'Ascendente è Venere; la cuspide della
  // seconda è nello Scorpione, di Marte.
  const horary = computeHoraryLilly(
    { date: '1634-07-26', time: '11:06', timezone: 'Europe/London' },
    { latitude: 51.5074, longitude: -0.1278 },
    { question: { house: 2 } },
  );

  it('trova i significatori di Lilly', () => {
    expect(horary.significators.map((s) => [s.role, s.body])).toEqual([
      ['querente', 'venere'],
      ['quesito', 'marte'],
      ['cosignificatore', 'luna'],
    ]);
    expect(horary.chart.houseSystem).toBe('regiomontano');
  });

  it('trova la traslazione della Luna da Marte a Venere, come a p. 182', () => {
    // «the ☽ separated newly from a ✶ of ♂ Lord of the second … and
    // immediately after seperated from ☌ of ☿, then instantly applying to
    // the ☌ of ♀ significator of the Querent, transferring thereby…».
    const traslazione = horary.perfections.find((p) => p.mode === 'traslazione');
    expect(traslazione).toMatchObject({ by: 'luna', aspect: 'congiunzione' });
    const [separazione, applicazione] = traslazione!.events;
    expect(separazione).toMatchObject({ kind: 'aspetto', with: 'marte', aspect: 'sestile' });
    expect(applicazione).toMatchObject({ kind: 'aspetto', with: 'venere', aspect: 'congiunzione' });
    const luna = horary.courses.find((c) => c.body === 'luna')!;
    expect(luna.lastPerfected).toMatchObject({ with: 'mercurio', aspect: 'congiunzione' });
    // Venere e Marte non si incontrano prima che Venere lasci il Leone.
    expect(horary.perfections.filter((p) => p.mode === 'aspetto' || p.mode === 'congiunzione')).toEqual([]);
  });

  it('calcola le considerazioni che hanno una soglia e dice quali no', () => {
    const per = (id: string) => horary.considerations.find((c) => c.id === id);
    expect(per('ascendente-presto')?.holds).toBe(false);
    expect(per('luna-vuota')?.holds).toBe(false);
    expect(per('saturno-settima')?.holds).toBe(false);
    expect(per('luna-gradi-tardi')?.holds).toBeUndefined();
    // Ora del Sole, Ascendente di Venere: né lo stesso pianeta, né la
    // triplicità dell'aria, né la stessa natura.
    expect(per('radicale')).toMatchObject({ holds: false, page: 121 });
  });

  it('conta la Parte di Fortuna con la tavola di p. 145, dove Lilly a p. 180 se ne scosta', () => {
    // Lilly: «in ♏ hath five Debilities», la mette in seconda e le dà «but
    // three testimonies of strength», cioè «weak by two». Il motore segue la tavola e la regola dei
    // cinque gradi: la Parte, a 0°30' dello Scorpione e a quasi sette gradi
    // dalla cuspide della seconda, è in prima (5); è libera dal Sole (5), e
    // sta nei termini di Marte (2), riga che Lilly non conta.
    const fortuna = horary.chart.dignities!.lilly!.conditions.partOfFortune!;
    expect(fortuna.sign).toBe('scorpione');
    expect(fortuna.house).toBe(1);
    expect(fortuna.score.debilities).toEqual([
      { item: 'segno', sign: 'scorpione', points: 5 },
      { item: 'termine', with: 'marte', points: 2 },
    ]);
    expect(fortuna.score.totals).toEqual({ fortitudes: 10, debilities: 7, net: 3 });
  });
});

describe('computeHoraryLilly', () => {
  const ROMA = { latitude: 41.9028, longitude: 12.4964 };

  it('conta le case derivate', () => {
    const horary = computeHoraryLilly(
      { date: '2026-10-27', time: '22:15', timezone: 'Europe/Rome' },
      ROMA,
      { question: { house: 7, derivedFrom: 3 } },
    );
    expect(horary.question.effectiveHouse).toBe(9);
  });

  it("rifiuta una casa che non esiste e una domanda senz'ora", () => {
    expect(() =>
      computeHoraryLilly({ date: '2026-10-27', time: '22:15', timezone: 'Europe/Rome' }, ROMA, {
        question: { house: 13 },
      }),
    ).toThrow(ChartError);
    expect(() =>
      computeHoraryLilly({ date: '2026-10-27', timezone: 'Europe/Rome' }, ROMA, { question: { house: 2 } }),
    ).toThrow(/ora/);
  });
});

describe('le condizioni di qualità della perfezione, p. 125', () => {
  // Figure di Roma del gennaio 2026, scelte perché ciascuna porta un modo
  // diverso; domanda di settima casa.
  const ROMA = { latitude: 41.9028, longitude: 12.4964 };
  const figura = (date: string, time: string) =>
    computeHoraryLilly({ date, time, timezone: 'Europe/Rome' }, ROMA, { question: { house: 7 } });
  const qualita = (date: string, time: string) => {
    const perfezione = figura(date, time).perfections.find((f) => f.mode === 'congiunzione' || f.mode === 'aspetto');
    return new Map((perfezione?.quality ?? []).map((c) => [c.id, c]));
  };

  it('per la congiunzione dicono la casa in cui si compie, la velocità, e non giudicano la forza', () => {
    // La Luna, signora dell'Ascendente, raggiunge Saturno, signore della 7,
    // che sta in casa 10: la congiunzione si compie in un angolo.
    const q = qualita('2026-01-21', '15:00');
    expect(q.get('casa-della-congiunzione')).toMatchObject({ holds: true, detail: 'In casa 10, angolare.' });
    expect(q.get('veloci')?.holds).toBe(false);
    expect(q.get('forti')?.holds).toBeUndefined();
    expect(q.get('forti')?.detail).toContain('non calcolata');
  });

  it('per il quadrato chiedono dignità a tutti e due e case buone, «otherwise not»', () => {
    // La Luna in casa 6, che a p. 115 vale -2: la casa non è buona.
    const q = qualita('2026-01-15', '15:00');
    expect(q.get('dignita')?.holds).toBe(true);
    expect(q.get('case-buone')).toMatchObject({ holds: false, detail: 'Luna in casa 6, Saturno in casa 10.' });
  });

  it("per l'opposizione cercano la mutua ricezione per domicilio, le case amiche e la Luna", () => {
    const q = qualita('2026-01-02', '15:00');
    expect([...q.keys()]).toEqual(['mutua-per-domicilio', 'case-buone', 'luna']);
    expect(q.get('mutua-per-domicilio')?.holds).toBe(false);
    expect(q.get('luna')?.holds).toBe(false);
  });

  it('per sestile e trigono guardano le case, e «ben dignificato» resta non calcolato', () => {
    const q = qualita('2026-01-01', '09:00');
    expect(q.get('case-buone')).toMatchObject({ holds: false, detail: 'Saturno in casa 2, Sole in casa 12.' });
    expect(q.get('forti')?.holds).toBeUndefined();
  });

  it('dicono le letture con cui sono calcolate', () => {
    const letture = figura('2026-01-21', '15:00').readings.join(' ');
    expect(letture).toContain('tutte tranne la 6, l\'8 e la 12');
    expect(letture).toContain('nella casa del grado in cui si compie');
    expect(letture).toContain('vuol dire non peregrino');
  });
});

describe('la Luna cosignificatrice, p. 124', () => {
  const ROMA = { latitude: 41.9028, longitude: 12.4964 };

  it('non proibisce, ma resta a contare quando è lei un significatore', () => {
    // Un anno di figure di settima e decima casa: la Luna cosignificatrice
    // non compare mai fra i proibitori.
    for (let giorno = 0; giorno < 60; giorno += 6) {
      const date = new Date(Date.UTC(2026, 0, 1 + giorno)).toISOString().slice(0, 10);
      for (const house of [7, 10]) {
        const h = computeHoraryLilly({ date, time: '14:00', timezone: 'Europe/Rome' }, ROMA, { question: { house } });
        const cosignificatrice = h.significators.some((s) => s.role === 'cosignificatore');
        if (cosignificatrice) {
          expect(h.impediments.filter((f) => f.mode === 'proibizione' && f.by === 'luna'), `${date} casa ${house}`).toEqual([]);
        }
      }
    }
  });

  it('lo dice fra le letture', () => {
    const h = computeHoraryLilly({ date: '2026-01-21', time: '15:00', timezone: 'Europe/Rome' }, ROMA, { question: { house: 7 } });
    expect(h.readings.join(' ')).toContain('La Luna no, quando è cosignificatrice di chi chiede');
  });
});

/**
 * Altre figure del libro II, per la verifica: ciò che Lilly afferma nel
 * giudizio, e le posizioni che stampa nella figura entro un grado (le sue
 * effemeridi sbagliano di qualche primo). Le date sono giuliane nel libro e
 * gregoriane qui. Le trascrizioni sono nella copia locale della fonte.
 */
describe('altre figure del libro II', () => {
  const LONDRA = { latitude: 51.5074, longitude: -0.1278 };
  const vicino = (longitudine: number | undefined, segno: number, gradi: number, primi: number) =>
    expect(Math.abs((longitudine ?? NaN) - (segno * 30 + gradi + primi / 60))).toBeLessThan(1);

  describe('«Where an absent Brother was?», pp. 196-197', () => {
    // «Friday 7 Novem 1645 hora meridiana»: il 17 novembre gregoriano, al
    // mezzogiorno vero, che allora cadeva verso le 11:45 di tempo medio.
    const h = computeHoraryLilly({ date: '1645-11-17', time: '11:45', timezone: 'Europe/London' }, LONDRA, {
      question: { house: 3 },
    });
    const pos = (id: string) => h.chart.bodies.find((b) => b.id === id)?.longitude;

    it('ha le posizioni della figura', () => {
      vicino(h.chart.angles?.ascendant, 9, 20, 27); // Ascendente 20°27' ♑
      vicino(pos('luna'), 7, 15, 29);
      vicino(pos('mercurio'), 7, 8, 28);
      vicino(pos('venere'), 8, 28, 53);
      vicino(pos('marte'), 7, 29, 10);
      vicino(pos('giove'), 3, 4, 55);
      vicino(pos('saturno'), 0, 29, 13);
    });

    it('dà a Saturno chi chiede e a Venere il fratello', () => {
      expect(h.significators.map((s) => [s.role, s.body])).toEqual([
        ['querente', 'saturno'],
        ['quesito', 'venere'],
        ['cosignificatore', 'luna'],
      ]);
    });

    it('trova la Luna separata dal trigono di Giove e diretta alla congiunzione del Sole', () => {
      // «the separation of the ☽ was good, viz. from a △ dexter of ♃, and
      // her next application to a ☌ of ☉». Fra le due c'è la congiunzione con
      // Mercurio, che Lilly non nomina.
      const luna = h.courses.find((c) => c.body === 'luna')!;
      expect(luna.separations.map((e) => (e.kind === 'aspetto' ? [e.aspect, e.with] : []))).toContainEqual([
        'trigono',
        'giove',
      ]);
      expect(luna.events[0]).toMatchObject({ kind: 'aspetto', aspect: 'congiunzione', with: 'sole' });
      // «she neither applyed to one significator or other».
      const applicazioni = luna.events.filter((e) => e.kind === 'aspetto').map((e) => (e.kind === 'aspetto' ? e.with : ''));
      expect(applicazioni).not.toContain('saturno');
      expect(applicazioni).not.toContain('venere');
    });

    it('non trova aspetti di Mercurio o di Marte a Venere', () => {
      // «♀ … is no manner of way afflicted either by ☿ … or by ♂».
      const aVenere = h.chart.aspects.filter(
        (a) => [a.from, a.to].includes('venere') && (['mercurio', 'marte'] as const).some((x) => [a.from, a.to].includes(x)),
      );
      expect(aVenere).toEqual([]);
    });
  });

  describe('«If I should purchase Master B. his houses», pp. 219-221', () => {
    // «31 Mar. 1634, 6 Hor. P.M.», «Dns diei ☽, Hor: astr ☉», «☽ a ☌ ♂ ad □
    // ♄»: il 10 aprile gregoriano, la domanda di Lilly stesso sulla casa in
    // cui ancora viveva nel 1647.
    const h = computeHoraryLilly({ date: '1634-04-10', time: '18:00', timezone: 'Europe/London' }, LONDRA, {
      question: { house: 4 },
    });
    const pos = (id: string) => h.chart.bodies.find((b) => b.id === id)?.longitude;
    const condizioni = h.chart.dignities!.lilly!.conditions;
    const di = (id: string) => condizioni.bodies.find((b) => b.id === id)!;

    it('ha le posizioni della figura', () => {
      vicino(h.chart.angles?.ascendant, 6, 13, 45); // ♎
      vicino(pos('luna'), 5, 19, 38);
      vicino(pos('mercurio'), 1, 3, 38);
      vicino(pos('giove'), 2, 25, 32);
      vicino(pos('saturno'), 8, 21, 25);
      expect(condizioni.hour).toMatchObject({ dayRuler: 'luna', ruler: 'sole' });
    });

    it('trova Venere che applica al trigono di Saturno, e tutti e due che si avvicinano', () => {
      // «♀ was applying to a △ of ♄, Lord of the fourth … both Significators
      // strongly applyed to a △ aspect, viz. ♄ and ♀, for ♄ is Retrograde».
      expect(h.significators.slice(0, 2).map((s) => s.body)).toEqual(['venere', 'saturno']);
      const trigono = h.perfections.find((f) => f.mode === 'aspetto');
      expect(trigono).toMatchObject({ aspect: 'trigono' });
      expect(trigono?.events[0]).toMatchObject({ approaching: ['body', 'other'] });
      expect(di('saturno').motion.direction).toBe('retrogrado');
      expect(di('saturno').angularity).toBe('cadente');
    });

    it('trova il Sole in settima che riceve Venere per esaltazione, e in trigono con Saturno', () => {
      expect(di('sole').house).toBe(7);
      expect(h.chart.dignities!.receptions.single).toContainEqual(
        expect.objectContaining({ receiver: 'sole', received: 'venere', by: expect.arrayContaining(['esaltazione']) }),
      );
      expect(
        h.chart.aspects.find((a) => [a.from, a.to].includes('sole') && [a.from, a.to].includes('saturno')),
      ).toMatchObject({ aspect: 'trigono' });
    });

    it('conta anche quello che Lilly non conta: il Sole che perfeziona prima con Saturno', () => {
      // Il trigono del Sole a Saturno si compie prima di quello di Venere, e
      // per la regola di pp. 110-111 è una proibizione. Lilly scrive invece
      // «had no abscission or frustration ere the perfect aspect» e lo legge
      // a favore («the ☉ was in perfect △ with ♄ … Lord of my eleventh»).
      // Il motore segue la regola, e la divergenza resta scritta qui.
      expect(h.impediments).toContainEqual(expect.objectContaining({ mode: 'proibizione', by: 'sole' }));
    });

    it('trova Marte retrogrado, Giove cadente in esilio, la Luna da Marte al quadrato di Saturno', () => {
      expect(di('marte').motion.direction).toBe('retrogrado');
      expect(di('giove').angularity).toBe('cadente');
      expect(h.chart.dignities!.lilly!.bodies.find((b) => b.id === 'giove')?.dignities).toContain('esilio');
      const luna = h.courses.find((c) => c.body === 'luna')!;
      expect(luna.lastPerfected).toMatchObject({ aspect: 'congiunzione', with: 'marte' });
      expect(luna.events[0]).toMatchObject({ aspect: 'quadrato', with: 'saturno' });
    });
  });

  describe('«If one were with Child of a Male or Female», pp. 240-241', () => {
    // «7 Apri. 1645, 2h 15' P.M.», «Dns diei, hor. ☽», «☽ a □♀ ad □☿»: il
    // 17 aprile gregoriano.
    const h = computeHoraryLilly({ date: '1645-04-17', time: '14:15', timezone: 'Europe/London' }, LONDRA, {
      question: { house: 5 },
    });
    const condizioni = h.chart.dignities!.lilly!.conditions;
    const di = (id: string) => condizioni.bodies.find((b) => b.id === id)!;
    const cuspide = (n: number) => h.chart.houses.find((c) => c.number === n)!.longitude;

    it('ha le cuspidi della figura entro pochi primi', () => {
      vicino(cuspide(1), 5, 8, 50);
      vicino(cuspide(2), 5, 29, 50);
      vicino(cuspide(3), 6, 25, 29);
      vicino(cuspide(5), 9, 14, 1);
      vicino(cuspide(6), 10, 15, 50);
    });

    it("ha il giorno e l'ora della Luna, e la Luna dal quadrato di Venere al quadrato di Mercurio", () => {
      // Il testo di p. 241 scrive «♃ Lord of the Houre», contro la figura:
      // il motore dà l'ora della Luna fino alle 14:17, come la figura.
      expect(condizioni.hour).toMatchObject({ dayRuler: 'luna', ruler: 'luna' });
      const luna = h.courses.find((c) => c.body === 'luna')!;
      expect(luna.lastPerfected).toMatchObject({ aspect: 'quadrato', with: 'venere' });
      expect(luna.events[0]).toMatchObject({ aspect: 'quadrato', with: 'mercurio' });
    });

    it('trova le testimonianze di p. 241 che si calcolano', () => {
      // ♍ sorge, ♑ sulla quinta: Mercurio e Saturno.
      expect(h.significators.slice(0, 2).map((s) => s.body)).toEqual(['mercurio', 'saturno']);
      const segno = (id: string) => h.chart.bodies.find((b) => b.id === id)!.sign;
      expect([segno('mercurio'), segno('saturno'), segno('giove')]).toEqual(['ariete', 'ariete', 'gemelli']);
      expect(segno('luna')).toBe('capricorno');
      // «☿ Applying to ♂ his □».
      const mercurio = h.courses.find((c) => c.body === 'mercurio')!;
      expect(mercurio.events.find((e) => e.kind === 'aspetto' && e.with === 'marte')).toMatchObject({
        aspect: 'quadrato',
      });
      // «♄ In a house» maschile: la nona.
      expect(di('saturno').house).toBe(9);
    });

    it('mette la Luna in quarta per sei primi, dove Lilly la mette in quinta', () => {
      // Lilly la stampa a 9°50' ♑, a 4°11' dalla cuspide della quinta (14°1'),
      // e con la regola dei cinque gradi la conta in quinta, casa maschile. Il
      // motore la ha a 8°53', a cinque gradi e sei primi: un confine, non una
      // regola diversa.
      expect(di('luna').house).toBe(4);
      expect(cuspide(5) - h.chart.bodies.find((b) => b.id === 'luna')!.longitude).toBeGreaterThan(5);
      expect(cuspide(5) - h.chart.bodies.find((b) => b.id === 'luna')!.longitude).toBeLessThan(5.2);
    });
  });

  describe('«A sick Doctor, what was his Disease?», p. 286', () => {
    // «1645, ♃ 8 Maij, 6h 15' P.M., hor: astr: ♀», «☽ a △ ☿ ad □ ☉ et ✶ ♄»:
    // il 18 maggio gregoriano. Una domanda di malattia: qui si provano solo i
    // fatti del cielo, non il giudizio.
    const h = computeHoraryLilly({ date: '1645-05-18', time: '18:15', timezone: 'Europe/London' }, LONDRA, {
      question: { house: 6 },
    });
    const pos = (id: string) => h.chart.bodies.find((b) => b.id === id)?.longitude;

    it('ha le posizioni, il giorno e l\'ora della figura', () => {
      expect(h.chart.angles && Math.floor(h.chart.angles.ascendant / 30)).toBe(7); // «The Signe ascending … is ♏»
      vicino(pos('sole'), 1, 28, 0);
      vicino(pos('venere'), 1, 13, 54);
      vicino(pos('mercurio'), 2, 14, 57);
      vicino(pos('saturno'), 0, 28, 32);
      vicino(pos('luna'), 10, 27, 57);
      expect(h.chart.dignities!.lilly!.conditions.hour).toMatchObject({ dayRuler: 'giove', ruler: 'venere' });
    });

    it('trova la Luna dal trigono di Mercurio al quadrato del Sole e al sestile di Saturno', () => {
      const luna = h.courses.find((c) => c.body === 'luna')!;
      expect(luna.lastPerfected).toMatchObject({ aspect: 'trigono', with: 'mercurio' });
      const prossimi = luna.events.filter((e) => e.kind === 'aspetto').slice(0, 2);
      expect(prossimi).toMatchObject([
        { aspect: 'quadrato', with: 'sole' },
        { aspect: 'sestile', with: 'saturno' },
      ]);
    });
  });

  describe('«Whether the Sick would live or dye», p. 289', () => {
    // «Die Mercurij 16 Julij 1645, 7h 22' A.M., hor: ♄»: il 26 luglio
    // gregoriano. Come sopra, solo i fatti del cielo.
    const h = computeHoraryLilly({ date: '1645-07-26', time: '07:22', timezone: 'Europe/London' }, LONDRA, {
      question: { house: 6 },
    });
    const pos = (id: string) => h.chart.bodies.find((b) => b.id === id)?.longitude;
    const di = (id: string) => h.chart.dignities!.lilly!.conditions.bodies.find((b) => b.id === id)!;

    it('ha le posizioni, il giorno e l\'ora della figura', () => {
      vicino(pos('sole'), 4, 3, 29);
      vicino(pos('giove'), 2, 25, 12);
      vicino(pos('saturno'), 1, 4, 12);
      expect(h.chart.dignities!.lilly!.conditions.hour).toMatchObject({ dayRuler: 'mercurio', ruler: 'saturno' });
    });

    it('trova la Vergine sorgente con Marte e la Luna in prima, e Saturno signore della sesta in Toro', () => {
      // «♍ … most afflicted by the corporall presence of ♂»; «♒ being the
      // Signe of the sixt … and ♄ who is Lord of the sixt house is in ♉»; la
      // Luna «afflicted by her proximity to ♂ and posited in the ascendant».
      expect(Math.floor(h.chart.angles!.ascendant / 30)).toBe(5);
      expect(di('marte').house).toBe(1);
      expect(di('luna').house).toBe(1);
      expect(h.chart.houses.find((c) => c.number === 6)?.sign).toBe('acquario');
      expect(h.significators.find((s) => s.role === 'quesito')).toMatchObject({ body: 'saturno', sign: 'toro' });
    });
  });

  describe('«A Report that Cambridge was taken by the King\'s Forces», p. 200', () => {
    // «11. Apr. 1643, 4h 31' P.M.»: il 21 aprile gregoriano.
    const h = computeHoraryLilly({ date: '1643-04-21', time: '16:31', timezone: 'Europe/London' }, LONDRA, {
      question: { house: 7 },
    });
    const pos = (id: string) => h.chart.bodies.find((b) => b.id === id)?.longitude;
    const condizioni = h.chart.dignities!.lilly!.conditions;

    it('ha le posizioni della figura', () => {
      vicino(h.chart.angles?.ascendant, 6, 4, 37); // ♎
      vicino(h.chart.angles?.midheaven, 3, 6, 10); // ♋
      vicino(pos('sole'), 1, 1, 23);
      vicino(pos('luna'), 2, 12, 43);
      vicino(pos('marte'), 3, 1, 50);
      vicino(pos('saturno'), 0, 2, 7);
    });

    it('ha il giorno di Marte e l\'ora di Venere, come stampa la figura', () => {
      expect(condizioni.hour).toMatchObject({ dayRuler: 'marte', ruler: 'venere' });
    });

    it('dà Venere esaltata a chi chiede e Marte, signore della settima, al nemico', () => {
      expect(h.significators.slice(0, 2).map((s) => s.body)).toEqual(['venere', 'marte']);
      expect(h.chart.dignities!.lilly!.bodies.find((b) => b.id === 'venere')?.dignities).toContain('esaltazione');
      // «♂ … entring his Fall, viz. ♋, and afflicted by □ of ♄».
      expect(h.chart.dignities!.lilly!.bodies.find((b) => b.id === 'marte')?.dignities).toContain('caduta');
      expect(
        h.chart.aspects.find((a) => [a.from, a.to].includes('marte') && [a.from, a.to].includes('saturno')),
      ).toMatchObject({ aspect: 'quadrato' });
    });

    it('trova la Luna cadente, separata dal sestile di Giove e diretta al quadrato di Venere', () => {
      // «☽ a ✶♃ ad □♀», al centro della figura; «I found the ☽ cadent».
      const luna = h.courses.find((c) => c.body === 'luna')!;
      expect(luna.lastPerfected).toMatchObject({ kind: 'aspetto', aspect: 'sestile', with: 'giove' });
      expect(luna.events[0]).toMatchObject({ kind: 'aspetto', aspect: 'quadrato', with: 'venere' });
      expect(condizioni.bodies.find((b) => b.id === 'luna')?.angularity).toBe('cadente');
      // Giove «placed in the seventh».
      expect(condizioni.bodies.find((b) => b.id === 'giove')?.house).toBe(7);
    });
  });
});
