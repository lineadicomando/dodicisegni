/**
 * Le relazioni fra i graha, BPHS 3.55-58: naturale, temporanea, composta.
 *
 * Servono a dire se un graha sta nel segno di un amico o di un nemico, e da
 * lì al vimshopaka del cap. 7. Che cosa un'amicizia produca non lo dicono:
 * il motore riporta la relazione, come riporta un aspetto.
 *
 * **La naturale si calcola, non si copia.** Il verso 3.55 è una regola: dal
 * segno di moolatrikona di un graha, i signori del 2°, 4°, 5°, 8°, 9° e 12°
 * sono amici, e così il signore del segno di esaltazione; i signori degli
 * altri segni sono nemici; chi è l'una e l'altra cosa è *sama*, neutro. La
 * tavola che Santhanam stampa sotto il verso (p. 40) è la regola applicata, e
 * il test la ricopia per controllarla. Il graha stesso, quando governa uno di
 * quei segni, non conta.
 *
 * Fonte: *Brihat Parashara Hora Shastra*, trad. R. Santhanam, vol. I (1992),
 * pp. 40-42, letto sulle immagini in `texts/jyotisha/bphs-santhanam-1992-vol1`.
 */

import { ZODIAC_SIGNS } from './constants.js';
import {
  parasharaExaltation,
  parasharaMoolatrikonaSign,
  parasharaSignLord,
  PARASHARA_GRAHAS,
} from './dignita-parashara.js';
import type { BodyId, CompoundMaitri, GrahaRelationships, Maitri, NatalChart, ZodiacSign } from './types.js';

const indice = (sign: ZodiacSign): number => ZODIAC_SIGNS.indexOf(sign);
const segno = (i: number): ZodiacSign => ZODIAC_SIGNS[((i % 12) + 12) % 12] as ZodiacSign;

/** 3.55, «svāt-sukha-sva-antya-dhī-dharma-āyuḥ»: le case amiche contate dal moolatrikona, 1 = il segno stesso. */
const CASE_AMICHE = [2, 4, 5, 8, 9, 12] as const;

/**
 * La relazione naturale di `from` verso `to`, BPHS 3.55, p. 40.
 *
 * `undefined` se uno dei due non è fra i sette, o se sono lo stesso graha.
 */
export function naisargikaMaitri(from: BodyId, to: BodyId): Maitri | undefined {
  const mt = parasharaMoolatrikonaSign(from);
  const uccha = parasharaExaltation(from);
  if (!mt || !uccha || from === to || !(PARASHARA_GRAHAS as readonly BodyId[]).includes(to)) return undefined;

  let amico = parasharaSignLord(uccha.sign) === to;
  let nemico = false;
  for (let casa = 2; casa <= 12; casa += 1) {
    if (parasharaSignLord(segno(indice(mt) + casa - 1)) !== to) continue;
    if ((CASE_AMICHE as readonly number[]).includes(casa)) amico = true;
    else nemico = true;
  }
  if (amico && nemico) return 'sama';
  if (amico) return 'mitra';
  // Un graha che non governa nessuna delle undici case e non è il signore
  // dell'esaltazione non capita fra i sette: ognuno governa almeno un segno
  // diverso dal moolatrikona dell'altro. Il ramo resta per completezza.
  return nemico ? 'shatru' : 'sama';
}

/**
 * La relazione temporanea fra due segni della rashi, BPHS 3.56, p. 41:
 * amici se l'uno sta nel 2°, 3°, 4°, 10°, 11° o 12° dall'altro, nemici
 * altrimenti. È simmetrica, perché quelle case vanno a coppie (2 e 12, 3 e
 * 11, 4 e 10).
 */
export function tatkalikaMaitri(fromSign: ZodiacSign, toSign: ZodiacSign): 'mitra' | 'shatru' {
  const casa = ((indice(toSign) - indice(fromSign) + 12) % 12) + 1;
  return [2, 3, 4, 10, 11, 12].includes(casa) ? 'mitra' : 'shatru';
}

/** La composta, BPHS 3.57-58, p. 41-42: la tavola di Santhanam a p. 42. */
export function panchadhaMaitri(naisargika: Maitri, tatkalika: 'mitra' | 'shatru'): CompoundMaitri {
  if (tatkalika === 'mitra') {
    return naisargika === 'mitra' ? 'adhimitra' : naisargika === 'sama' ? 'mitra' : 'sama';
  }
  return naisargika === 'shatru' ? 'adhishatru' : naisargika === 'sama' ? 'shatru' : 'sama';
}

const SOURCE =
  'BPHS 3.55-58 (trad. Santhanam, vol. I, pp. 40-42). Naturale: dal segno di moolatrikona, ' +
  'amici i signori del 2°, 4°, 5°, 8°, 9° e 12° e il signore dell\'esaltazione, nemici gli ' +
  'altri, sama chi è l\'uno e l\'altro. Temporanea: amico chi sta nel 2°, 3°, 4°, 10°, 11° o ' +
  '12° segno della rashi, nemico chi no. Composta: le due insieme, 3.57-58. Hanno un verso. ' +
  'Rahu e Ketu non ci sono: il verso non li nomina.';

/** Le relazioni fra i sette graha di una carta siderale, in tutti e due i versi. */
export function computeRelationships(chart: NatalChart): GrahaRelationships {
  const grahas = chart.bodies.filter((body) => (PARASHARA_GRAHAS as readonly BodyId[]).includes(body.id));
  const segnoDi = (longitude: number) => segno(Math.floor(longitude / 30));
  const pairs: GrahaRelationships['pairs'] = [];
  for (const a of grahas) {
    for (const b of grahas) {
      const naisargika = naisargikaMaitri(a.id, b.id);
      if (!naisargika) continue;
      const tatkalika = tatkalikaMaitri(segnoDi(a.longitude), segnoDi(b.longitude));
      pairs.push({ from: a.id, to: b.id, naisargika, tatkalika, panchadha: panchadhaMaitri(naisargika, tatkalika) });
    }
  }
  return { source: SOURCE, pairs };
}
