/**
 * I varga buoni di un graha e il loro conto, secondo il BPHS.
 *
 * Un varga è «buono» per un graha quando cade in uno dei suoi segni di
 * dignità o in un segno governato da un signore dei kendra contati
 * dall'arudha lagna (BPHS 6.52). I varga buoni si contano dentro quattro
 * schemi (6.42 e 7.17-20), e a ogni conto il testo dà un nome (6.43-51):
 * Parijata, Uttama, Gopura e così via. Il motore conta e nomina, come fa con
 * il punteggio di Lilly; che cosa il nome prometta non lo dice.
 *
 * Le scelte di lettura, prese dal proprietario il 28 ottobre 2026 e scritte
 * in `TODO.md` (*Deciso*), viaggiano nel risultato:
 *
 * - **6.52 come lo traduce Santhanam**: i *segni* di uccha, moolatrikona e
 *   propri. Il genitivo *adhipateḥ* si presterebbe anche a «i segni del
 *   signore di quei segni», ma quella lettura non ha un autore;
 * - **l'arudha lagna di BPHS 29.1-5**, calcolato qui (`arudhaOf`);
 * - **6.53 come nota e non come filtro**: il verso dice che cosa producono i
 *   varga buoni di un graha combusto, sconfitto, in neecha, debole o in
 *   avastha come shayana, non che non vadano contati;
 * - **la hora segue la convenzione del D-2**: con `leone-cancro` si conta per
 *   segno come ogni altro varga, con `parashara`, che non ha segni, secondo
 *   la nota di Santhanam a p. 90, dichiarata come sua.
 *
 * Fonte: *Brihat Parashara Hora Shastra*, trad. R. Santhanam, vol. I (Ranjan,
 * 1992), pp. 87-90 (6.42-53), 95-96 (7.17-25) e 294-297 (29.1-5), letti
 * sulle immagini in `texts/jyotisha/bphs-santhanam-1992-vol1` e trascritti
 * in `trascrizioni.md`.
 */

import { ZODIAC_SIGNS } from './constants.js';
import { parasharaDignityOf, parasharaSignDignities, parasharaSignLord, PARASHARA_GRAHAS } from './dignita-parashara.js';
import { DEFAULT_HORA_CONVENTION, horaConvention, horaOf } from './hora.js';
import { grahaName } from './nakshatra.js';
import { VARGAS, vargaSignOf } from './varga.js';
import type {
  BodyId,
  GoodVargaReason,
  GoodVargas,
  HoraConvention,
  NatalChart,
  VargaId,
  VargaScheme,
  ZodiacSign,
} from './types.js';

/** I varga di ciascuno schema: BPHS 7.17-20, pp. 95-96. */
export const VARGA_SCHEMES: Readonly<Record<VargaScheme, readonly VargaId[]>> = {
  // 7.17: «lagna-horā-dṛkāṇa-aṅkabhāga-sūryaka … triṃśāṃśaka».
  shadvarga: ['d1', 'd2', 'd3', 'd9', 'd12', 'd30'],
  // 7.18: «sasaptāṃśake».
  saptavarga: ['d1', 'd2', 'd3', 'd7', 'd9', 'd12', 'd30'],
  // 7.20: «dig-aṃśa-ādyāḥ kalāṃśāḥ ṣaṣṭi-bhāgakāḥ», D-10, D-16, D-60.
  dashavarga: ['d1', 'd2', 'd3', 'd7', 'd9', 'd10', 'd12', 'd16', 'd30', 'd60'],
  shodashavarga: ['d1', 'd2', 'd3', 'd4', 'd7', 'd9', 'd10', 'd12', 'd16', 'd20', 'd24', 'd27', 'd30', 'd40', 'd45', 'd60'],
};

/**
 * I nomi dei conti, BPHS 6.43-51, pp. 87-88, con la grafia di Santhanam.
 * L'indice è il numero di varga buoni; sotto i due il testo non dà un nome.
 */
export const GOOD_VARGA_NAMES: Readonly<Record<VargaScheme, Readonly<Record<number, string>>>> = {
  shadvarga: { 2: 'Kimsuka', 3: 'Vyanjana', 4: 'Chamara', 5: 'Chatra', 6: 'Kundala' },
  saptavarga: { 2: 'Kimsuka', 3: 'Vyanjana', 4: 'Chamara', 5: 'Chatra', 6: 'Kundala', 7: 'Mukuta' },
  dashavarga: {
    2: 'Parijata', 3: 'Uttama', 4: 'Gopura', 5: 'Simhasana', 6: 'Paravata',
    7: 'Devaloka', 8: 'Brahmaloka', 9: 'Sakravahana', 10: 'Sridhama',
  },
  shodashavarga: {
    2: 'Bhedaka', 3: 'Kusuma', 4: 'Nagapushpa', 5: 'Kanduka', 6: 'Kerala', 7: 'Kalpavriksha',
    8: 'Chandanavana', 9: 'Poornachandra', 10: 'Uchchaisrava', 11: 'Dhanvantari',
    12: 'Suryakanta', 13: 'Vidruma', 14: 'Sakrasimhasana', 15: 'Goloka', 16: 'Srivallabha',
  },
};

const SCHEMI: readonly VargaScheme[] = ['shadvarga', 'saptavarga', 'dashavarga', 'shodashavarga'];

const segno = (indice: number): ZodiacSign => ZODIAC_SIGNS[((indice % 12) + 12) % 12] as ZodiacSign;
const indice = (sign: ZodiacSign): number => ZODIAC_SIGNS.indexOf(sign);

/**
 * L'arudha (pada) di un bhava, BPHS 29.1-5, pp. 295-296.
 *
 * Si conta dal bhava al segno del suo signore, e altrettanto oltre il
 * signore. Due eccezioni (29.4-5, *svasthānaṃ saptamaṃ naivaṃ padaṃ
 * bhavitum arhati*): il pada non può essere il bhava stesso né il settimo da
 * lui; se ci cade, nel primo caso si prende il decimo dal bhava, nel secondo
 * il quarto. È quello che dicono il verso e la traduzione di Santhanam («the
 * 10th therefrom … the 4th from the original house»), e il verso 5 lo
 * ripete coi signori: col signore nel quarto il pada è il quarto, col
 * signore nel settimo il decimo.
 *
 * Il secondo esempio delle note di Santhanam a p. 296 (Acquario ascendente,
 * Saturno in Leone: «Taurus») non segue né il verso né la sua traduzione,
 * che danno lo Scorpione. Il motore segue il verso.
 */
export function arudhaOf(bhava: ZodiacSign, lordSign: ZodiacSign): ZodiacSign {
  const distanza = (indice(lordSign) - indice(bhava) + 12) % 12;
  const grezzo = (indice(lordSign) + distanza) % 12;
  const daBhava = (grezzo - indice(bhava) + 12) % 12;
  if (daBhava === 0) return segno(indice(bhava) + 9);
  if (daBhava === 6) return segno(indice(bhava) + 3);
  return segno(grezzo);
}

const ARUDHA_RULE =
  "BPHS 29.1-5 (trad. Santhanam, vol. I, pp. 295-296): dal lagna al segno del suo " +
  "signore, e altrettanto oltre; se si ricade nel lagna si prende il decimo, se nel settimo il " +
  "quarto. Il signore del lagna è quello di BPHS 4.6-24, uno per segno.";

/**
 * La nota di Santhanam a p. 90 per la hora di Parashara, che non ha segni:
 * da 7.13 (p. 94), Sole, Marte e Giove buoni nella hora del Sole, Luna,
 * Venere e Saturno in quella della Luna, Mercurio in entrambe; e Giove, che
 * esalta nel Cancro, anche in quella della Luna. È la lettura di Santhanam,
 * non un verso.
 */
const HORA_BUONE: Readonly<Record<string, readonly ('sole' | 'luna')[]>> = {
  sole: ['sole'],
  marte: ['sole'],
  giove: ['sole', 'luna'],
  mercurio: ['sole', 'luna'],
  luna: ['luna'],
  venere: ['luna'],
  saturno: ['luna'],
};

const HORA_RULE: Readonly<Record<HoraConvention, string>> = {
  parashara:
    'Hora di Parashara, senza segni: buona per Sole, Marte e Giove quella del Sole, per Luna, ' +
    'Venere e Saturno quella della Luna, per Mercurio e Giove entrambe. È la nota di Santhanam ' +
    'a p. 90, da 7.13, non un verso.',
  'leone-cancro': 'Hora con la convenzione Leone-Cancro: contata per segno come gli altri varga.',
};

const SOURCE =
  'BPHS 6.42-53 (trad. Santhanam, vol. I, pp. 87-90) e 7.17-20 (pp. 95-96). Buono il varga che ' +
  'cade nel segno di uccha, di moolatrikona o proprio del graha, come traduce Santhanam il ' +
  '6.52, o in un segno dei signori dei kendra dall\'arudha lagna. Il conto è per schema; il ' +
  'nome del conto è quello di 6.43-51.';

const VERSE_53 =
  'BPHS 6.53: i varga buoni di un graha combusto, sconfitto in guerra planetaria, in neecha, ' +
  'debole o in avastha come shayana «distruggono gli yoga» (il sanscrito dice anche nīcagā, ' +
  'che la traduzione omette). Il conto non cambia; il motore dice la neecha nella rashi, e non ' +
  'verifica combustione, guerra planetaria, debolezza né avastha.';

/**
 * I varga buoni dei sette graha di una carta **siderale con l'ora**, e il
 * loro conto nei quattro schemi.
 *
 * Restituisce `undefined` senza lagna: l'arudha lo vuole, e un conto senza
 * l'arudha è un numero diverso da quello del testo.
 */
export function computeGoodVargas(
  chart: NatalChart,
  hora: HoraConvention = DEFAULT_HORA_CONVENTION,
): GoodVargas | undefined {
  if (!chart.angles) return undefined;

  const lagna = segno(Math.floor(chart.angles.ascendant / 30));
  const signoreDelLagna = parasharaSignLord(lagna);
  const corpoSignore = chart.bodies.find((body) => body.id === signoreDelLagna);
  if (!corpoSignore) return undefined;
  const arudhaLagna = arudhaOf(lagna, segno(Math.floor(corpoSignore.longitude / 30)));

  const kendraLords = [...new Set([0, 3, 6, 9].map((k) => parasharaSignLord(segno(indice(arudhaLagna) + k))))];
  const arudhaSigns = ZODIAC_SIGNS.filter((sign) => kendraLords.includes(parasharaSignLord(sign)));
  const conSegniLaHora = horaConvention(hora).signOf !== undefined;

  const grahas = chart.bodies
    .filter((body) => (PARASHARA_GRAHAS as readonly BodyId[]).includes(body.id))
    .map((body) => {
      const vargas = VARGAS.map(({ id }) => {
        if (id === 'd2' && !conSegniLaHora) {
          const h = horaOf(body.longitude);
          const good: GoodVargaReason[] = HORA_BUONE[body.id]?.includes(h) ? ['hora'] : [];
          return { varga: id, hora: h, good };
        }
        const sign = vargaSignOf(body.longitude, id, hora);
        const good: GoodVargaReason[] = [
          ...parasharaSignDignities(body.id, sign).filter((d) => d !== 'neecha'),
          ...(arudhaSigns.includes(sign) ? (['arudha'] as const) : []),
        ];
        return { varga: id, sign, good };
      });

      const schemes = SCHEMI.map((scheme) => {
        const membri = VARGA_SCHEMES[scheme];
        const buoni = vargas.filter((v) => membri.includes(v.varga) && v.good.length > 0).length;
        return { scheme, vargas: membri.length, good: buoni, name: GOOD_VARGA_NAMES[scheme][buoni] ?? null };
      });

      return {
        id: body.id,
        name: grahaName(body.id, body.name),
        vargas,
        schemes,
        neecha: parasharaDignityOf(body.id, body.longitude) === 'neecha',
      };
    });

  return {
    source: SOURCE,
    arudhaLagna,
    arudhaRule: ARUDHA_RULE,
    kendraLords,
    arudhaSigns,
    hora: { convention: hora, rule: HORA_RULE[hora] },
    verse53: VERSE_53,
    grahas,
  };
}
