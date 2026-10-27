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
