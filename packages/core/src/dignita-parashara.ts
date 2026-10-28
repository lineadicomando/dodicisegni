/**
 * Le dignità del Jyotisha secondo Parashara: uccha, moolatrikona, segno
 * proprio e neecha.
 *
 * Uccha è l'esaltazione, neecha la debilitazione nel segno opposto;
 * moolatrikona («trigono radice») è un tratto di uno dei segni propri in cui
 * il graha sta meglio che nel resto del segno; swakshetra è il segno proprio,
 * cioè il domicilio. È una scuola a sé e non tocca le tavole occidentali di
 * `dignita.ts`: i segni delle esaltazioni coincidono, i gradi no (il Sole a
 * 10 dell'Ariete contro i 19 di Firmico, Giove a 5 del Cancro contro 15), e
 * il moolatrikona in occidente non c'è.
 *
 * Fonte: *Brihat Parashara Hora Shastra*, trad. R. Santhanam, vol. I (Ranjan,
 * 1992), letta sulla scansione di archive.org
 * (`heag_brihat-parasara-hora-sastra-vol-1-…`). Della traduzione si prendono
 * i valori e non il testo, che è protetto; i numeri sono stati confrontati
 * anche col sanscrito stampato accanto, dove sono scritti a parole (nakha,
 * «le unghie», per venti; arka, il Sole, per dodici).
 *
 * - 3.49-50, pp. 38-39: i segni di esaltazione dei sette graha dal Sole a
 *   Saturno, i gradi dell'esaltazione più profonda, la debilitazione nel
 *   settimo segno allo stesso grado;
 * - 3.51-54, p. 39: il moolatrikona, e il segno diviso in tratti;
 * - 4.6-24, pp. 50-53: il signore di ciascun segno, nella descrizione dei
 *   segni. Coincide con i domicili di Tolomeo, ma qui la fonte è questa.
 *
 * **Rahu e Ketu non hanno dignità qui.** Santhanam, in nota a 3.50, scrive che
 * sull'esaltazione dei nodi le opinioni divergono e rimanda a un altro testo:
 * il BPHS non sceglie, e il motore nemmeno. Urano, Nettuno e Plutone non sono
 * graha e non ne hanno.
 */

import type { BodyId, NatalChart, ParasharaDignities, ParasharaDignity, ZodiacSign } from './types.js';
import { ZODIAC_SIGNS } from './constants.js';
import { grahaName } from './nakshatra.js';
import { normalize360 } from './math.js';

/** I sette graha a cui il BPHS dà le dignità, nell'ordine dei versi. */
export const PARASHARA_GRAHAS = [
  'sole',
  'luna',
  'marte',
  'mercurio',
  'giove',
  'venere',
  'saturno',
] as const satisfies readonly BodyId[];

type Graha = (typeof PARASHARA_GRAHAS)[number];

/**
 * L'esaltazione: il segno e il grado più profondo, BPHS 3.49-50. Il sanscrito
 * dà i gradi come «dieci, tre, ventotto, tithi, akṣa, bha, nakha»: 15 i tithi
 * di una metà del mese lunare, 5 i sensi, 27 i nakshatra, 20 le unghie.
 */
const UCCHA: Readonly<Record<Graha, { sign: ZodiacSign; degree: number }>> = {
  sole: { sign: 'ariete', degree: 10 },
  luna: { sign: 'toro', degree: 3 },
  marte: { sign: 'capricorno', degree: 28 },
  mercurio: { sign: 'vergine', degree: 15 },
  giove: { sign: 'cancro', degree: 5 },
  venere: { sign: 'pesci', degree: 27 },
  saturno: { sign: 'bilancia', degree: 20 },
};

/** I segni propri, dalla descrizione dei segni in BPHS 4.6-24. */
const SEGNI_PROPRI: Readonly<Record<ZodiacSign, Graha>> = {
  ariete: 'marte',
  toro: 'venere',
  gemelli: 'mercurio',
  cancro: 'luna',
  leone: 'sole',
  vergine: 'mercurio',
  bilancia: 'venere',
  scorpione: 'marte',
  sagittario: 'giove',
  capricorno: 'saturno',
  acquario: 'saturno',
  pesci: 'giove',
};

/**
 * Il segno che 3.51-54 divide in tratti, uno per graha. Ogni tratto va da
 * `from` incluso a `to` escluso, in gradi del segno.
 *
 * Il testo non nomina soltanto il moolatrikona: dice anche che cosa sia il
 * resto del segno. Nel Leone il Sole ha il moolatrikona nei primi venti gradi
 * e il segno proprio negli altri dieci; nel Toro la Luna ha l'esaltazione nei
 * primi tre e il moolatrikona nel resto; Mercurio divide la Vergine in tre.
 * Sono questi tratti, e non le tavole di 3.49-50 lette da sole, a dire la
 * dignità dentro questi sette segni: è lo stesso testo che precisa se stesso,
 * non un'altra scuola. Così la Luna a 10 del Toro è in moolatrikona e non in
 * uccha, benché il Toro sia il suo segno di esaltazione.
 */
const TRATTI: Readonly<
  Record<Graha, { sign: ZodiacSign; parts: { from: number; to: number; dignity: ParasharaDignity }[] }>
> = {
  sole: {
    sign: 'leone',
    parts: [
      { from: 0, to: 20, dignity: 'moolatrikona' },
      { from: 20, to: 30, dignity: 'swakshetra' },
    ],
  },
  luna: {
    sign: 'toro',
    parts: [
      { from: 0, to: 3, dignity: 'uccha' },
      { from: 3, to: 30, dignity: 'moolatrikona' },
    ],
  },
  marte: {
    sign: 'ariete',
    parts: [
      { from: 0, to: 12, dignity: 'moolatrikona' },
      { from: 12, to: 30, dignity: 'swakshetra' },
    ],
  },
  mercurio: {
    sign: 'vergine',
    parts: [
      { from: 0, to: 15, dignity: 'uccha' },
      { from: 15, to: 20, dignity: 'moolatrikona' },
      { from: 20, to: 30, dignity: 'swakshetra' },
    ],
  },
  giove: {
    sign: 'sagittario',
    parts: [
      { from: 0, to: 10, dignity: 'moolatrikona' },
      { from: 10, to: 30, dignity: 'swakshetra' },
    ],
  },
  venere: {
    sign: 'bilancia',
    parts: [
      { from: 0, to: 15, dignity: 'moolatrikona' },
      { from: 15, to: 30, dignity: 'swakshetra' },
    ],
  },
  saturno: {
    sign: 'acquario',
    parts: [
      { from: 0, to: 20, dignity: 'moolatrikona' },
      { from: 20, to: 30, dignity: 'swakshetra' },
    ],
  },
};

/** Da dove viene la tavola, in una riga che viaggia col risultato. */
export const PARASHARA_SOURCE =
  'Parashara, BPHS 3.49-54 (trad. Santhanam, vol. I, pp. 38-39) per uccha, neecha e ' +
  'moolatrikona; 4.6-24 (pp. 50-53) per i segni propri. Nei sette segni che 3.51-54 ' +
  'divide in tratti decide il tratto; Rahu e Ketu senza dignità, perché il testo non ne ' +
  'sceglie una.';

function isGraha(body: BodyId): body is Graha {
  return (PARASHARA_GRAHAS as readonly BodyId[]).includes(body);
}

function opposite(sign: ZodiacSign): ZodiacSign {
  return ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sign) + 6) % 12] as ZodiacSign;
}

/** Il signore di un segno secondo BPHS 4.6-24. */
export function parasharaSignLord(sign: ZodiacSign): BodyId {
  return SEGNI_PROPRI[sign];
}

/** Segno e grado dell'esaltazione più profonda, se il graha ne ha una. */
export function parasharaExaltation(body: BodyId): { sign: ZodiacSign; degree: number } | undefined {
  return isGraha(body) ? UCCHA[body] : undefined;
}

/**
 * La dignità di un graha a una longitudine **siderale**, o `null` se non ne ha.
 *
 * Al più una: nel BPHS i tratti di uno stesso segno si escludono, e fuori dai
 * sette segni divisi uccha, neecha e segno proprio non cadono mai sullo
 * stesso segno per lo stesso graha. Per i corpi che non sono fra i sette
 * restituisce `null` anche dove una tavola occidentale direbbe altro.
 */
export function parasharaDignityOf(body: BodyId, siderealLongitude: number): ParasharaDignity | null {
  if (!isGraha(body)) return null;
  const longitude = normalize360(siderealLongitude);
  const sign = ZODIAC_SIGNS[Math.floor(longitude / 30)] as ZodiacSign;
  const degree = longitude - Math.floor(longitude / 30) * 30;

  const tratti = TRATTI[body];
  if (tratti.sign === sign) {
    const tratto = tratti.parts.find((part) => degree >= part.from && degree < part.to);
    return tratto?.dignity ?? null;
  }
  if (UCCHA[body].sign === sign) return 'uccha';
  if (opposite(UCCHA[body].sign) === sign) return 'neecha';
  if (SEGNI_PROPRI[sign] === body) return 'swakshetra';
  return null;
}

/**
 * In quali dei suoi segni di dignità cade un graha, guardando **il solo
 * segno**: uccha, moolatrikona, segno proprio, neecha, nell'ordine.
 *
 * Serve ai varga, dove il grado dentro il segno non è definito (vedi
 * `SignVargaChart`): lì i tratti di 3.51-54 non si possono applicare, e
 * scegliere un solo nome per un segno che ne ha due sarebbe decidere al
 * posto del testo. Per questo restituisce **tutte** le corrispondenze: il
 * Leone è per il Sole segno proprio e di moolatrikona, il Toro per la Luna
 * di uccha e di moolatrikona, la Vergine per Mercurio tutte e tre.
 *
 * È la parte di BPHS 6.52 che si dice per segno (trad. Santhanam, vol. I,
 * p. 88: «the divisions falling in the planet's exaltation sign,
 * Moolatrikona sign, own sign»), con la neecha di 3.49-50 accanto. Non è il
 * conto dei varga buoni: quello chiede anche la regola dell'arudha e le
 * esclusioni di 6.53, che il motore non ha (TODO.md, voce 19).
 */
export function parasharaSignDignities(body: BodyId, sign: ZodiacSign): ParasharaDignity[] {
  if (!isGraha(body)) return [];
  const corrispondenze: ParasharaDignity[] = [];
  if (UCCHA[body].sign === sign) corrispondenze.push('uccha');
  if (TRATTI[body].sign === sign) corrispondenze.push('moolatrikona');
  if (SEGNI_PROPRI[sign] === body) corrispondenze.push('swakshetra');
  if (opposite(UCCHA[body].sign) === sign) corrispondenze.push('neecha');
  return corrispondenze;
}

/** Da dove vengono le corrispondenze per segno dei varga, in una riga. */
export const VARGA_DIGNITY_SOURCE =
  'Per segno, senza gradi: il segno del varga confrontato coi segni di uccha, moolatrikona, ' +
  'proprio e neecha di ciascuno dei sette graha (BPHS 3.49-54 e 4.6-24; 6.52, trad. Santhanam, ' +
  'vol. I, p. 88, per i primi tre come varga buoni). Tutte le corrispondenze, non una sola. ' +
  'Il conto dei varga buoni di 6.42-53 non è calcolato: chiede la regola dell\'arudha e le ' +
  'esclusioni di 6.53.';

/**
 * Le dignità dei sette graha di una carta siderale.
 *
 * Accanto a uccha e neecha c'è il grado del punto più profondo, che è nello
 * stesso segno: chi legge vede a colpo d'occhio quanto il graha ne sia
 * lontano, senza che il motore ne ricavi una forza. Quella è lo shadbala, e
 * ha regole sue.
 */
export function computeParasharaDignities(chart: NatalChart): ParasharaDignities {
  return {
    school: 'parashara',
    source: PARASHARA_SOURCE,
    signLords: Object.fromEntries(
      ZODIAC_SIGNS.map((sign) => [sign, SEGNI_PROPRI[sign]]),
    ) as Record<ZodiacSign, BodyId>,
    grahas: chart.bodies
      .filter((body) => isGraha(body.id))
      .map((body) => {
        const dignity = parasharaDignityOf(body.id, body.longitude);
        const uccha = UCCHA[body.id as Graha];
        return {
          id: body.id,
          name: grahaName(body.id, body.name),
          sign: body.sign,
          signDegree: body.signDegree,
          dignity,
          ...(dignity === 'uccha' || dignity === 'neecha' ? { deepestDegree: uccha.degree } : {}),
        };
      }),
  };
}
