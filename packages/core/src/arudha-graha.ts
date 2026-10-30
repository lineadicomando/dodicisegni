/**
 * Gli arudha dei nove graha secondo P.V.R. Narasimha Rao, *Vedic Astrology:
 * An Integrated Approach* (2000), con le regole che il calcolo richiede:
 * le rasi drishti (§10.3), il segno più forte (§15.5.2), il signore più
 * forte di Scorpione e Acquario (§15.5.1) e la sua tavola delle dignità
 * (tavola 6, p. 34).
 *
 * **Perché Rao e non il BPHS.** BPHS 29.6-7 (trad. Santhanam, vol. I, p. 297)
 * dà la regola, ma per i graha con due segni dice soltanto di contare fino al
 * più forte (*sabalāvadhi*), senza dire come; Santhanam scrive di non avere
 * «authentic information» su come usarli. Completarlo con 46.158-166, che
 * confronta due signori di un segno e non due segni di un signore, sarebbe
 * una dottrina nostra. Rao dà la procedura intera e un esempio svolto, ed
 * entra intero, con le sue esaltazioni dei nodi (Rahu nei Gemelli, Ketu nel
 * Sagittario) e la sua eccezione (il decimo dal segno trovato, non quella di
 * BPHS 29.4-5): sono le sue, e qui valgono solo qui. Gli arudha dei bhava
 * restano del BPHS, in `arudha.ts`. Scelto dal proprietario il 29 ottobre
 * 2026 (`docs/decisioni.md`).
 *
 * **Una lettura nostra, dichiarata.** In §15.5.1 la regola (2) conta il
 * dispositore del graha; se il graha sta nello Scorpione o nell'Acquario il
 * dispositore è a sua volta da scegliere fra due, e la scelta può girare in
 * tondo. Il motore conta allora tutti e due i co-signori: basta che uno dei
 * due congiunga o guardi. Rao non dice altro.
 *
 * Rao lo applica a ogni divisionale, e così il motore: `computeGrahaArudhas`
 * per la rashi, `grahaArudhasOf` coi segni di un varga, dove il grado manca
 * e la catena può fermarsi (vedi `strongerCoLord`). Che cosa un arudha di
 * graha significhi il motore non lo dice.
 */

import { ZODIAC_SIGNS } from './constants.js';
import { grahaName } from './nakshatra.js';
import type { BodyId, GrahaArudhas, NatalChart, ZodiacSign } from './types.js';

const indice = (sign: ZodiacSign): number => ZODIAC_SIGNS.indexOf(sign);
const segno = (i: number): ZodiacSign => ZODIAC_SIGNS[((i % 12) + 12) % 12] as ZodiacSign;
const avanti = (da: ZodiacSign, a: ZodiacSign): number => (indice(a) - indice(da) + 12) % 12;

/** 0 cardinale (cara), 1 fisso (sthira), 2 mutevole (dvisvabhāva): la convenzione è in testa a `varga.ts`. */
const natura = (sign: ZodiacSign): number => indice(sign) % 3;

/**
 * I segni guardati da un segno, §10.3: il cardinale guarda i fissi tranne
 * quello che lo segue, il fisso i cardinali tranne quello che lo precede, il
 * mutevole gli altri mutevoli. La relazione è simmetrica.
 */
export function rasiDrishti(sign: ZodiacSign): ZodiacSign[] {
  const n = natura(sign);
  return ZODIAC_SIGNS.filter((altro) => {
    if (altro === sign) return false;
    if (n === 2) return natura(altro) === 2;
    if (n === 0) return natura(altro) === 1 && avanti(sign, altro) !== 1;
    return natura(altro) === 0 && avanti(altro, sign) !== 1;
  });
}

/** I nove graha, i soli che le regole contano. */
const NOVE: readonly BodyId[] = ['sole', 'luna', 'marte', 'mercurio', 'giove', 'venere', 'saturno', 'nodo-nord', 'nodo-sud'];

/** Tavola 6, p. 34: i segni propri. */
export const RAO_OWN_SIGNS: Readonly<Partial<Record<BodyId, readonly ZodiacSign[]>>> = {
  sole: ['leone'],
  luna: ['cancro'],
  marte: ['ariete', 'scorpione'],
  mercurio: ['gemelli', 'vergine'],
  giove: ['sagittario', 'pesci'],
  venere: ['toro', 'bilancia'],
  saturno: ['capricorno', 'acquario'],
  'nodo-nord': ['acquario'],
  'nodo-sud': ['scorpione'],
};

/** Tavola 6, p. 34: i segni di esaltazione. Per i nodi non sono quelli del BPHS. */
export const RAO_EXALTATION: Readonly<Partial<Record<BodyId, ZodiacSign>>> = {
  sole: 'ariete',
  luna: 'toro',
  marte: 'capricorno',
  mercurio: 'vergine',
  giove: 'cancro',
  venere: 'pesci',
  saturno: 'bilancia',
  'nodo-nord': 'gemelli',
  'nodo-sud': 'sagittario',
};

const CO_SIGNORI: Readonly<Partial<Record<ZodiacSign, readonly [BodyId, BodyId]>>> = {
  scorpione: ['marte', 'nodo-sud'],
  acquario: ['saturno', 'nodo-nord'],
};

/**
 * Dove sta un graha: il segno e i gradi nel segno. Nei varga il grado manca,
 * perché dentro un segno di varga non è definito (vedi il commento a
 * `retrograde` in `SignVargaChart`).
 */
export type Posizioni = Readonly<Partial<Record<BodyId, { sign: ZodiacSign; signDegree?: number }>>>;

const isNodo = (id: BodyId) => id === 'nodo-nord' || id === 'nodo-sud';

/**
 * L'avanzamento nel segno; per i nodi dalla fine del segno (§15.5.1, 5b).
 * Un graha che manca conta −1, come sempre; uno che c'è senza grado non
 * conta niente: `undefined`, e chi lo chiede si ferma.
 */
const avanzamento = (id: BodyId, p: Posizioni): number | undefined => {
  const pos = p[id];
  if (!pos) return -1;
  if (pos.signDegree === undefined) return undefined;
  return isNodo(id) ? 30 - pos.signDegree : pos.signDegree;
};

/** Il signore unico di un segno che non ne ha due. */
const SIGNORE: Readonly<Record<ZodiacSign, BodyId>> = Object.fromEntries(
  ZODIAC_SIGNS.map((sign) => [
    sign,
    (Object.keys(RAO_OWN_SIGNS) as BodyId[]).find((id) => !isNodo(id) && RAO_OWN_SIGNS[id]?.includes(sign)),
  ]),
) as Record<ZodiacSign, BodyId>;

/** Chi congiunge o guarda (rasi drishti) un segno. */
const vedeIlSegno = (id: BodyId, sign: ZodiacSign, p: Posizioni): boolean => {
  const dove = p[id]?.sign;
  return dove !== undefined && (dove === sign || rasiDrishti(dove).includes(sign));
};

const grahaNel = (sign: ZodiacSign, p: Posizioni, tranne?: BodyId): number =>
  NOVE.filter((id) => id !== tranne && p[id]?.sign === sign).length;

/**
 * Il signore più forte di Scorpione o Acquario, §15.5.1, con la regola che
 * ha deciso. Per gli altri segni il signore è uno, e la regola è vuota.
 *
 * Senza il grado nel segno, cioè in un varga, lo spareggio 5b non si fa: se
 * la catena arriva lì il signore è `undefined`, e la regola dice perché.
 * Scelto dal proprietario il 30 ottobre 2026, contro il grado «del varga»
 * (gradi × N modulo 30) che Rao non nomina (`docs/decisioni.md`).
 */
export function strongerCoLord(sign: ZodiacSign, p: Posizioni): { lord: BodyId | undefined; rule: string } {
  const coppia = CO_SIGNORI[sign];
  if (!coppia) return { lord: SIGNORE[sign], rule: '' };
  const [a, b] = coppia;
  const sa = p[a]?.sign;
  const sb = p[b]?.sign;
  if (!sa || !sb) return { lord: a, rule: 'Manca uno dei due: si prende il primo della tavola 6.' };
  if ((sa === sign) !== (sb === sign)) {
    return { lord: sa === sign ? b : a, rule: 'Uno dei due è nel segno: si prende l\'altro (§15.5.1).' };
  }
  const vince = (x: boolean, regola: string) => ({ lord: x ? a : b, rule: regola });

  const ga = grahaNel(sa, p, a);
  const gb = grahaNel(sb, p, b);
  if (ga !== gb) return vince(ga > gb, 'Più graha con lui (§15.5.1, 1).');

  const conto = (id: BodyId, dove: ZodiacSign): number => {
    const dispositori = CO_SIGNORI[dove] ?? [SIGNORE[dove]];
    const guarda = (x: BodyId) => vedeIlSegno(x, dove, p);
    return (guarda('giove') ? 1 : 0) + (guarda('mercurio') ? 1 : 0) + (dispositori.filter((d) => d !== id).some(guarda) ? 1 : 0);
  };
  const ca = conto(a, sa);
  const cb = conto(b, sb);
  if (ca !== cb) return vince(ca > cb, 'Più fra Giove, Mercurio e dispositore lo congiungono o lo guardano (§15.5.1, 2).');

  const ea = RAO_EXALTATION[a] === sa;
  const eb = RAO_EXALTATION[b] === sb;
  if (ea !== eb) return vince(ea, 'Esaltato secondo la tavola 6 (§15.5.1, 3).');

  if (natura(sa) !== natura(sb)) return vince(natura(sa) > natura(sb), 'Segno mutevole più forte del fisso, fisso del cardinale (§15.5.1, 4).');

  const aa = avanzamento(a, p);
  const ab = avanzamento(b, p);
  if (aa === undefined || ab === undefined) {
    return {
      lord: undefined,
      rule:
        `Indeterminato fra ${grahaName(a, a)} e ${grahaName(b, b)}: pari fino alla (4), e lo spareggio ` +
        '(§15.5.1, 5b) guarda il grado nel segno, che nel varga non è definito.',
    };
  }
  if (aa !== ab) return vince(aa > ab, 'Più avanzato nel segno, i nodi dalla fine (§15.5.1, 5b).');
  return { lord: a, rule: 'Pari in tutto: si prende il primo della tavola 6.' };
}

/** L'esito di una regola fra due segni: vince il primo, il secondo, o pari. */
type Esito = 'x' | 'y' | 'pari';
const confronta = (vx: number | boolean, vy: number | boolean): Esito =>
  vx === vy ? 'pari' : vx > vy ? 'x' : 'y';

/**
 * Il più forte fra due segni, §15.5.2, regole 1-6, con la regola che ha
 * deciso. Per i due segni di uno stesso graha decide al più la (5).
 *
 * Tre regole guardano il signore del segno, e per Scorpione e Acquario il
 * signore può restare indeterminato (`strongerCoLord`, senza grado). Allora
 * la regola si prova con tutti e due i co-signori: se l'esito è lo stesso, il
 * dubbio non conta; se cambia, il segno più forte è `undefined`, e la regola
 * dice dove la catena si è fermata. Lo stesso per la (6), che guarda il
 * grado.
 */
export function strongerRasi(x: ZodiacSign, y: ZodiacSign, p: Posizioni): { sign: ZodiacSign | undefined; rule: string } {
  const signori = (s: ZodiacSign): readonly BodyId[] => {
    const { lord } = strongerCoLord(s, p);
    return lord ? [lord] : (CO_SIGNORI[s] ?? []);
  };
  const dubbio = (s: ZodiacSign) => (strongerCoLord(s, p).lord ? '' : strongerCoLord(s, p).rule);
  /** L'esito della regola per ogni scelta possibile dei signori; `undefined` se non è uno solo. */
  const coiSignori = (f: (lx: BodyId, ly: BodyId) => Esito | undefined): Esito | undefined => {
    const esiti = new Set<Esito | undefined>();
    for (const lx of signori(x)) for (const ly of signori(y)) esiti.add(f(lx, ly));
    return esiti.size === 1 ? [...esiti][0] : undefined;
  };
  const indeterminato = (regola: string, perche: string) => ({
    sign: undefined,
    rule: `Indeterminato alla ${regola}: ${perche}`,
  });
  const vince = (esito: 'x' | 'y', regola: string) => ({ sign: esito === 'x' ? x : y, rule: regola });
  const senzaSignore = [dubbio(x), dubbio(y)].filter(Boolean).join(' ');

  const r1 = confronta(grahaNel(x, p), grahaNel(y, p));
  if (r1 !== 'pari') return vince(r1, 'Più graha nel segno (§15.5.2, 1).');

  const conto = (s: ZodiacSign, signore: BodyId): number =>
    (['giove', 'mercurio', signore] as BodyId[]).filter((id) => vedeIlSegno(id, s, p)).length;
  const r2 = coiSignori((lx, ly) => confronta(conto(x, lx), conto(y, ly)));
  if (r2 === undefined) return indeterminato('(§15.5.2, 2)', `il conto cambia secondo il signore. ${senzaSignore}`);
  if (r2 !== 'pari') return vince(r2, 'Più fra Giove, Mercurio e il signore lo occupano o lo guardano (§15.5.2, 2).');

  const esaltato = (s: ZodiacSign) => NOVE.some((id) => p[id]?.sign === s && RAO_EXALTATION[id] === s);
  const r3 = confronta(esaltato(x), esaltato(y));
  if (r3 !== 'pari') return vince(r3, 'Contiene un graha esaltato (§15.5.2, 3).');

  const dispari = (s: ZodiacSign) => indice(s) % 2;
  const diversa = (s: ZodiacSign, signore: BodyId) => {
    const dove = p[signore]?.sign;
    return dove !== undefined && dispari(dove) !== dispari(s);
  };
  const r4 = coiSignori((lx, ly) => confronta(diversa(x, lx), diversa(y, ly)));
  if (r4 === undefined) return indeterminato('(§15.5.2, 4)', `la parità cambia secondo il signore. ${senzaSignore}`);
  if (r4 !== 'pari') return vince(r4, 'Il signore sta in un segno di parità diversa (§15.5.2, 4).');

  const r5 = confronta(natura(x), natura(y));
  if (r5 !== 'pari') return vince(r5, 'Segno mutevole più forte del fisso, fisso del cardinale (§15.5.2, 5).');

  const r6 = coiSignori((lx, ly) => {
    if (lx === ly) return 'pari';
    const [ax, ay] = [avanzamento(lx, p), avanzamento(ly, p)];
    return ax === undefined || ay === undefined ? undefined : confronta(ax, ay);
  });
  if (r6 === undefined) {
    return indeterminato('(§15.5.2, 6)', 'guarda quanto il signore è avanzato nel segno, e nel varga il grado non è definito.');
  }
  if (r6 !== 'pari') return vince(r6, 'Signore più avanzato nel segno (§15.5.2, 6).');
  return { sign: x, rule: 'Pari in tutto: si prende il primo.' };
}

/** Il pada contato da un segno proprio, con l'eccezione del 1° e del 7°. */
function padaDa(dove: ZodiacSign, ownSign: ZodiacSign): { pada: ZodiacSign; exception: boolean } {
  const grezzo = segno(indice(ownSign) + avanti(dove, ownSign));
  const daGraha = avanti(dove, grezzo);
  const exception = daGraha === 0 || daGraha === 6;
  return { pada: exception ? segno(indice(grezzo) + 9) : grezzo, exception };
}

/** L'arudha di un graha, come lo dà `grahaArudhaOf`. */
export interface GrahaArudhaOf {
  /** Assente se il segno più forte resta indeterminato (solo nei varga). */
  ownSign?: ZodiacSign;
  ownSignRule?: string;
  /** Assente con `ownSign`. */
  pada?: ZodiacSign;
  exception?: boolean;
}

/**
 * L'arudha di un graha, §9.5: dal suo segno al segno proprio (il più forte,
 * se sono due) e altrettanto oltre; se si cade nel primo o nel settimo dal
 * segno del graha, il decimo dal segno trovato.
 *
 * Se il più forte resta indeterminato (in un varga, vedi `strongerRasi`)
 * l'arudha manca. Contarli tutti e due non salverebbe niente: il dubbio
 * nasce solo dal co-signore di Scorpione e Acquario, cioè per Marte e
 * Saturno, e i loro due segni danno sempre arudha diversi (i due conti
 * distano due segni, e l'eccezione del 10° non li fa mai coincidere).
 */
export function grahaArudhaOf(id: BodyId, p: Posizioni): GrahaArudhaOf | undefined {
  const dove = p[id]?.sign;
  const propri = RAO_OWN_SIGNS[id];
  if (!dove || !propri) return undefined;
  const scelta = propri.length === 2 ? strongerRasi(propri[0]!, propri[1]!, p) : undefined;
  const ownSignRule = scelta ? { ownSignRule: scelta.rule } : {};
  if (scelta && scelta.sign === undefined) return ownSignRule;
  const ownSign = scelta?.sign ?? propri[0]!;
  return { ownSign, ...ownSignRule, ...padaDa(dove, ownSign) };
}

const SOURCE_COMUNE =
  'P.V.R. Narasimha Rao, Vedic Astrology: An Integrated Approach (2000), §9.5, pp. 94-95: dal ' +
  'segno del graha al suo segno proprio, e altrettanto oltre; se si cade nel 1° o nel 7° dal ' +
  'graha, il 10° dal segno trovato. Per i graha con due segni il più forte secondo §15.5.2 ' +
  '(pp. 203-205), con le rasi drishti di §10.3 e, per Scorpione e Acquario, il co-signore più ' +
  'forte di §15.5.1; dignità della sua tavola 6 (p. 34), che per i nodi non sono quelle del ' +
  'BPHS. Lettura del motore: un graha nello Scorpione o nell\'Acquario ha per dispositore ' +
  'tutti e due i co-signori.';

const SOURCE =
  `${SOURCE_COMUNE} Questi sono della rashi; ogni varga porta i suoi. BPHS 29.6-7 non dice come ` +
  'scegliere il segno più forte: per questo la scuola è quella di Rao.';

/**
 * La fonte degli arudha in un varga. Rao li calcola in ogni divisionale («the
 * sign containing the planet in the divisional chart of interest», §9.5, p.
 * 94), ma non dice che grado usare dove la catena lo guarda.
 */
export const VARGA_GRAHA_ARUDHA_SOURCE =
  `${SOURCE_COMUNE} Nel varga, coi segni del varga (§9.5, p. 94). Due spareggi guardano il grado ` +
  'nel segno (§15.5.1, 5b; §15.5.2, 6), che nel varga non è definito, e Rao non dice quale ' +
  'usare: se la catena arriva lì il segno più forte resta indeterminato, e l\'arudha pure. ' +
  'Succede solo a Marte e a Saturno, per il co-signore di Scorpione e Acquario.';

/** Gli arudha dei nove graha, da un elenco di posizioni. */
export function grahaArudhasOf(
  bodies: readonly { id: BodyId; name: string }[],
  p: Posizioni,
): GrahaArudhas['grahas'] {
  return bodies.flatMap((body) => {
    const sign = p[body.id]?.sign;
    const arudha = sign ? grahaArudhaOf(body.id, p) : undefined;
    return sign && arudha ? [{ id: body.id, name: grahaName(body.id, body.name), sign, ...arudha }] : [];
  });
}

/** Gli arudha dei nove graha di una carta siderale. */
export function computeGrahaArudhas(chart: NatalChart): GrahaArudhas {
  const p: Partial<Record<BodyId, { sign: ZodiacSign; signDegree: number }>> = {};
  for (const body of chart.bodies) p[body.id] = { sign: body.sign, signDegree: body.signDegree };
  return { source: SOURCE, grahas: grahaArudhasOf(chart.bodies, p) };
}
