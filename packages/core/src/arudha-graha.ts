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
 * 2026 (`TODO.md`, *Deciso*).
 *
 * **Una lettura nostra, dichiarata.** In §15.5.1 la regola (2) conta il
 * dispositore del graha; se il graha sta nello Scorpione o nell'Acquario il
 * dispositore è a sua volta da scegliere fra due, e la scelta può girare in
 * tondo. Il motore conta allora tutti e due i co-signori: basta che uno dei
 * due congiunga o guardi. Rao non dice altro.
 *
 * Il calcolo vale per la rashi (D-1); Rao lo applica a ogni divisionale, e
 * qui non è fatto. Che cosa un arudha di graha significhi il motore non lo
 * dice.
 */

import { ZODIAC_SIGNS } from './constants.js';
import { grahaName } from './nakshatra.js';
import type { BodyId, GrahaArudhas, NatalChart, ZodiacSign } from './types.js';

const indice = (sign: ZodiacSign): number => ZODIAC_SIGNS.indexOf(sign);
const segno = (i: number): ZodiacSign => ZODIAC_SIGNS[((i % 12) + 12) % 12] as ZodiacSign;
const avanti = (da: ZodiacSign, a: ZodiacSign): number => (indice(a) - indice(da) + 12) % 12;

/** 0 mobile (cara), 1 fisso, 2 doppio. */
const natura = (sign: ZodiacSign): number => indice(sign) % 3;

/**
 * I segni guardati da un segno, §10.3: il mobile guarda i fissi tranne
 * quello che lo segue, il fisso i mobili tranne quello che lo precede, il
 * doppio gli altri doppi. La relazione è simmetrica.
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

/** Dove sta un graha: il segno e i gradi nel segno. */
export type Posizioni = Readonly<Partial<Record<BodyId, { sign: ZodiacSign; signDegree: number }>>>;

const isNodo = (id: BodyId) => id === 'nodo-nord' || id === 'nodo-sud';

/** L'avanzamento nel segno; per i nodi dalla fine del segno (§15.5.1, 5b). */
const avanzamento = (id: BodyId, p: Posizioni): number => {
  const pos = p[id];
  if (!pos) return -1;
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
 */
export function strongerCoLord(sign: ZodiacSign, p: Posizioni): { lord: BodyId; rule: string } {
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

  if (natura(sa) !== natura(sb)) return vince(natura(sa) > natura(sb), 'Segno doppio più forte del fisso, fisso del mobile (§15.5.1, 4).');

  const aa = avanzamento(a, p);
  const ab = avanzamento(b, p);
  if (aa !== ab) return vince(aa > ab, 'Più avanzato nel segno, i nodi dalla fine (§15.5.1, 5b).');
  return { lord: a, rule: 'Pari in tutto: si prende il primo della tavola 6.' };
}

/**
 * Il più forte fra due segni, §15.5.2, regole 1-6, con la regola che ha
 * deciso. Per i due segni di uno stesso graha decide al più la (4).
 */
export function strongerRasi(x: ZodiacSign, y: ZodiacSign, p: Posizioni): { sign: ZodiacSign; rule: string } {
  const vince = (primo: boolean, regola: string) => ({ sign: primo ? x : y, rule: regola });

  const gx = grahaNel(x, p);
  const gy = grahaNel(y, p);
  if (gx !== gy) return vince(gx > gy, 'Più graha nel segno (§15.5.2, 1).');

  const conto = (s: ZodiacSign): number => {
    const signore = strongerCoLord(s, p).lord;
    return (['giove', 'mercurio', signore] as BodyId[]).filter((id) => vedeIlSegno(id, s, p)).length;
  };
  const cx = conto(x);
  const cy = conto(y);
  if (cx !== cy) return vince(cx > cy, 'Più fra Giove, Mercurio e il signore lo occupano o lo guardano (§15.5.2, 2).');

  const esaltato = (s: ZodiacSign) => NOVE.some((id) => p[id]?.sign === s && RAO_EXALTATION[id] === s);
  if (esaltato(x) !== esaltato(y)) return vince(esaltato(x), 'Contiene un graha esaltato (§15.5.2, 3).');

  const dispari = (s: ZodiacSign) => indice(s) % 2;
  const diversa = (s: ZodiacSign) => {
    const dove = p[strongerCoLord(s, p).lord]?.sign;
    return dove !== undefined && dispari(dove) !== dispari(s);
  };
  if (diversa(x) !== diversa(y)) return vince(diversa(x), 'Il signore sta in un segno di parità diversa (§15.5.2, 4).');

  if (natura(x) !== natura(y)) return vince(natura(x) > natura(y), 'Segno doppio più forte del fisso, fisso del mobile (§15.5.2, 5).');

  const ax = avanzamento(strongerCoLord(x, p).lord, p);
  const ay = avanzamento(strongerCoLord(y, p).lord, p);
  if (ax !== ay) return vince(ax > ay, 'Signore più avanzato nel segno (§15.5.2, 6).');
  return { sign: x, rule: 'Pari in tutto: si prende il primo.' };
}

/**
 * L'arudha di un graha, §9.5: dal suo segno al segno proprio (il più forte,
 * se sono due) e altrettanto oltre; se si cade nel primo o nel settimo dal
 * segno del graha, il decimo dal segno trovato.
 */
export function grahaArudhaOf(
  id: BodyId,
  p: Posizioni,
): { ownSign: ZodiacSign; ownSignRule?: string; pada: ZodiacSign; exception: boolean } | undefined {
  const dove = p[id]?.sign;
  const propri = RAO_OWN_SIGNS[id];
  if (!dove || !propri) return undefined;
  const scelta = propri.length === 2 ? strongerRasi(propri[0]!, propri[1]!, p) : undefined;
  const ownSign = scelta?.sign ?? propri[0]!;
  const grezzo = segno(indice(ownSign) + avanti(dove, ownSign));
  const daGraha = avanti(dove, grezzo);
  const exception = daGraha === 0 || daGraha === 6;
  return {
    ownSign,
    ...(scelta ? { ownSignRule: scelta.rule } : {}),
    pada: exception ? segno(indice(grezzo) + 9) : grezzo,
    exception,
  };
}

const SOURCE =
  'P.V.R. Narasimha Rao, Vedic Astrology: An Integrated Approach (2000), §9.5, pp. 94-95: dal ' +
  'segno del graha al suo segno proprio, e altrettanto oltre; se si cade nel 1° o nel 7° dal ' +
  'graha, il 10° dal segno trovato. Per i graha con due segni il più forte secondo §15.5.2 ' +
  '(pp. 203-205), con le rasi drishti di §10.3 e, per Scorpione e Acquario, il co-signore più ' +
  'forte di §15.5.1; dignità della sua tavola 6 (p. 34), che per i nodi non sono quelle del ' +
  'BPHS. Lettura del motore: un graha nello Scorpione o nell\'Acquario ha per dispositore ' +
  'tutti e due i co-signori. Solo la rashi. BPHS 29.6-7 non dice come scegliere il segno più ' +
  'forte: per questo la scuola è quella di Rao.';

/** Gli arudha dei nove graha di una carta siderale. */
export function computeGrahaArudhas(chart: NatalChart): GrahaArudhas {
  const p: Partial<Record<BodyId, { sign: ZodiacSign; signDegree: number }>> = {};
  for (const body of chart.bodies) p[body.id] = { sign: body.sign, signDegree: body.signDegree };
  return {
    source: SOURCE,
    grahas: chart.bodies.flatMap((body) => {
      const arudha = grahaArudhaOf(body.id, p);
      return arudha ? [{ id: body.id, name: grahaName(body.id, body.name), sign: body.sign, ...arudha }] : [];
    }),
  };
}
