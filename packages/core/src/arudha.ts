/**
 * Gli arudha (pada) dei bhava, BPHS 29.1-7.
 *
 * Il pada di un bhava si trova contando dal bhava al segno del suo signore, e
 * altrettanto oltre il signore (29.1-3), con due eccezioni (29.4-5): non può
 * essere il bhava stesso né il settimo da lui, e in quei casi si prende il
 * decimo o il quarto dal bhava.
 *
 * **I segni con due signori.** 29.7 dice che per un segno governato da due
 * pianeti si conta dal più forte; 46.157 dà allo Scorpione Marte e Ketu,
 * all'Acquario Saturno e Rahu. Quale sia il più forte il cap. 29 non lo
 * dice. Lo dice 46.158-166, per gli stessi due segni e gli stessi due
 * signori, a proposito della chara dasha, e Santhanam rimanda lì (vol. I,
 * p. 297). Il motore applica quella procedura anche al pada: è una lettura,
 * scelta dal proprietario il 28 ottobre 2026 (`TODO.md`, *Deciso*), e il
 * risultato dice per ogni pada quale regola ha deciso.
 *
 * Fonte: *Brihat Parashara Hora Shastra*, trad. R. Santhanam, vol. I (1992),
 * pp. 294-297, e vol. II (1992), pp. 553-556, letti sulle immagini in
 * `texts/jyotisha/bphs-santhanam-1992-vol1` e `-vol2`.
 */

import { ZODIAC_SIGNS } from './constants.js';
import { parasharaExaltation, parasharaNodeSigns, parasharaSignLord } from './dignita-parashara.js';
import type { Arudhas, BodyId, NatalChart, ZodiacSign } from './types.js';

const indice = (sign: ZodiacSign): number => ZODIAC_SIGNS.indexOf(sign);
const segno = (i: number): ZodiacSign => ZODIAC_SIGNS[((i % 12) + 12) % 12] as ZodiacSign;
const avanti = (da: ZodiacSign, a: ZodiacSign): number => (indice(a) - indice(da) + 12) % 12;

/**
 * L'arudha di un bhava dato il segno del suo signore, BPHS 29.1-5.
 *
 * Il secondo esempio delle note di Santhanam a p. 296 (Acquario, Saturno in
 * Leone: «Taurus») non segue né il verso né la sua traduzione, che danno lo
 * Scorpione. Il motore segue il verso.
 */
export function arudhaOf(bhava: ZodiacSign, lordSign: ZodiacSign): ZodiacSign {
  const grezzo = segno(indice(lordSign) + avanti(bhava, lordSign));
  const daBhava = avanti(bhava, grezzo);
  if (daBhava === 0) return segno(indice(bhava) + 9);
  if (daBhava === 6) return segno(indice(bhava) + 3);
  return grezzo;
}

/** I due signori di 46.157: il primo è quello di 4.6-24. */
const DUE_SIGNORI: Readonly<Partial<Record<ZodiacSign, readonly [BodyId, BodyId]>>> = {
  scorpione: ['marte', 'nodo-sud'],
  acquario: ['saturno', 'nodo-nord'],
};

/** I nove graha, che sono i soli «pianeti» che 46.161-162 conta in un segno. */
const NOVE: readonly BodyId[] = ['sole', 'luna', 'marte', 'mercurio', 'giove', 'venere', 'saturno', 'nodo-nord', 'nodo-sud'];

/** 46.163, «cara-sthira-dvandvāḥ kramato balaśālinaḥ»: cardinale, fisso, mobile, in forza crescente. */
const forzaDelSegno = (sign: ZodiacSign): number => indice(sign) % 3;

/**
 * Il signore da cui contare il pada di un bhava, e, per Scorpione e
 * Acquario, la regola di 46.158-166 che l'ha scelto.
 *
 * Prende i segni dei corpi e non la carta, perché la regola si possa provare
 * su un esempio stampato senza effemeridi.
 */
export function bhavaLord(
  bhava: ZodiacSign,
  signs: Readonly<Partial<Record<BodyId, ZodiacSign>>>,
): { lord: BodyId; lordChoice?: string } {
  const coppia = DUE_SIGNORI[bhava];
  if (!coppia) return { lord: parasharaSignLord(bhava) };
  const [a, b] = coppia;
  const sa = signs[a];
  const sb = signs[b];
  if (!sa || !sb) return { lord: a, lordChoice: 'Manca la posizione di uno dei due signori: si conta dal signore di 4.6-24.' };

  const scegli = (lord: BodyId, regola: string) => ({ lord, lordChoice: regola });
  const nel = (s: ZodiacSign) => s === bhava;
  if (nel(sa) && nel(sb)) return scegli(a, 'Tutti e due nel segno (46.158): il pada è lo stesso, si nomina il signore di 4.6-24.');
  if (nel(sa)) return scegli(b, 'Uno nel segno e l\'altro fuori: si prende quello fuori (46.159-160).');
  if (nel(sb)) return scegli(a, 'Uno nel segno e l\'altro fuori: si prende quello fuori (46.159-160).');

  // 46.164: un signore nella sua esaltazione e l'altro no. Per Rahu e Ketu
  // l'uccha è quella di 47.35 (Toro e Scorpione), dello stesso libro: scelto
  // dal proprietario il 29 ottobre 2026. Ketu nello Scorpione è già «nel
  // segno» (46.159-160), quindi in pratica conta solo Rahu nel Toro.
  const esaltato = (lord: BodyId, s: ZodiacSign) =>
    (parasharaExaltation(lord)?.sign ?? parasharaNodeSigns(lord)?.uccha) === s;
  if (esaltato(a, sa) !== esaltato(b, sb)) {
    return scegli(esaltato(a, sa) ? a : b, 'Uno dei due nel segno di esaltazione: si prende quello (46.164).');
  }

  const altri = (lord: BodyId, s: ZodiacSign) =>
    NOVE.filter((id) => id !== lord && signs[id] === s).length;
  const na = altri(a, sa);
  const nb = altri(b, sb);
  if (na !== nb) return scegli(na > nb ? a : b, 'Più forte il signore con più graha nel suo segno (46.161-162).');

  if (forzaDelSegno(sa) !== forzaDelSegno(sb)) {
    return scegli(
      forzaDelSegno(sa) > forzaDelSegno(sb) ? a : b,
      'Stessi graha: più forte il segno mobile del fisso, il fisso del cardinale (46.163).',
    );
  }

  const da = avanti(bhava, sa);
  const db = avanti(bhava, sb);
  if (da !== db) return scegli(da > db ? a : b, 'Segni di pari forza: si prende il più lontano dal bhava (46.163).');
  return scegli(a, 'I due signori nello stesso segno: il pada è lo stesso, si nomina il signore di 4.6-24.');
}

/** I nomi dei dodici pada, come li elenca Santhanam, vol. I, p. 295. */
export const PADA_NAMES: readonly string[] = [
  'Lagna Pada', 'Dhana Pada', 'Vikrama Pada', 'Matru Pada', 'Mantra Pada', 'Roga Pada',
  'Dara Pada', 'Marana Pada', 'Pitru Pada', 'Karma Pada', 'Labha Pada', 'Vyaya Pada',
];

const SOURCE =
  'BPHS 29.1-7 (trad. Santhanam, vol. I, pp. 294-297): dal bhava al segno del signore, e ' +
  'altrettanto oltre; se si ricade nel bhava il decimo, se nel settimo il quarto. Signori di ' +
  '4.6-24; per Scorpione e Acquario, che 46.157 dà anche a Ketu e Rahu, il più forte secondo ' +
  '46.158-166 (vol. II, pp. 554-555), letto per il pada come per la chara dasha; in 46.164 vale ' +
  'anche l\'uccha di Rahu e Ketu di 47.35. Gli arudha dei graha sono a parte, secondo ' +
  'Narasimha Rao: 29.6-7 non dice come scegliere il più forte dei due segni.';

/** Gli arudha dei dodici bhava di una carta con l'ora; `undefined` senza lagna. */
export function computeArudhas(chart: NatalChart): Arudhas | undefined {
  if (!chart.angles) return undefined;
  const signs: Partial<Record<BodyId, ZodiacSign>> = {};
  for (const body of chart.bodies) signs[body.id] = segno(Math.floor(body.longitude / 30));
  const lagna = segno(Math.floor(chart.angles.ascendant / 30));

  const padas: Arudhas['padas'] = [];
  for (let k = 0; k < 12; k += 1) {
    const sign = segno(indice(lagna) + k);
    const { lord, lordChoice } = bhavaLord(sign, signs);
    const lordSign = signs[lord];
    if (!lordSign) return undefined;
    padas.push({
      bhava: k + 1,
      name: PADA_NAMES[k] as string,
      sign,
      lord,
      ...(lordChoice ? { lordChoice } : {}),
      pada: arudhaOf(sign, lordSign),
    });
  }
  return { source: SOURCE, padas };
}
