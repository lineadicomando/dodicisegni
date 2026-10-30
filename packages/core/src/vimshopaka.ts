/**
 * Il vimshopaka: la forza di un graha su venti punti, BPHS 7.17-27.
 *
 * Per ogni varga di uno schema il graha prende un punteggio, il *varga
 * viswa* (7.24-25): 20 se il segno del varga è suo, altrimenti secondo la
 * relazione composta (3.57-58) col signore di quel segno, 18 adhimitra, 15
 * mitra, 10 sama, 7 shatru, 5 adhishatru. Lo si moltiplica per il peso del
 * varga nello schema, lo *swaviswa*, e si divide per 20 (7.26). La somma è
 * la forza nello schema.
 *
 * Due cose che il testo non dice da solo, e come le tratta il motore:
 *
 * - **I pesi del saptavarga.** Il verso 7.18 elenca sette numeri (5, 2, 3,
 *   2½, 4½, 2, 1) senza dire a quale varga vada ciascuno. La tavola di
 *   Santhanam a p. 97 mette il saptamsa in coda: navamsa 2½, dwadasamsa 4½,
 *   trimsamsa 2, saptamsa 1. Il motore segue la tavola; PyJHora fa lo
 *   stesso. L'altra lettura, col saptamsa al suo posto fra drekkana e
 *   navamsa, non ha trovato un autore.
 * - **Esaltazione e moolatrikona non valgono 20.** Il verso 7.24 dà il pieno
 *   solo ai varga «propri»; un graha esaltato in un varga prende la
 *   relazione col signore del segno, come nell'esempio di Santhanam a p. 99.
 *
 * Nella hora il signore è il luminare, con tutte e due le convenzioni del
 * D-2: con Parashara la hora è sua, con Leone-Cancro il segno è del Sole o
 * della Luna. Rahu e Ketu non hanno relazioni nel verso, e non hanno
 * vimshopaka.
 *
 * Fonte: *Brihat Parashara Hora Shastra*, trad. R. Santhanam, vol. I (1992),
 * pp. 95-99, letto sulle immagini in `texts/jyotisha/bphs-santhanam-1992-vol1`.
 */

import { parasharaSignLord, PARASHARA_GRAHAS } from './dignita-parashara.js';
import { bphsHoraConvention, DEFAULT_HORA_CONVENTION, horaConvention, horaOf } from './hora.js';
import { computeRelationships } from './maitri.js';
import { grahaName } from './nakshatra.js';
import { VARGAS, vargaSignOf } from './varga.js';
import type {
  BodyId,
  CompoundMaitri,
  HoraConvention,
  NatalChart,
  VargaId,
  VargaScheme,
  Vimshopaka,
} from './types.js';

/** Gli swaviswa per schema: la tavola di Santhanam, vol. I, p. 97 (7.17-23). */
export const VIMSHOPAKA_WEIGHTS: Readonly<Record<VargaScheme, Readonly<Partial<Record<VargaId, number>>>>> = {
  shadvarga: { d1: 6, d2: 2, d3: 4, d9: 5, d12: 2, d30: 1 },
  saptavarga: { d1: 5, d2: 2, d3: 3, d9: 2.5, d12: 4.5, d30: 2, d7: 1 },
  dashavarga: { d1: 3, d2: 1.5, d3: 1.5, d9: 1.5, d12: 1.5, d30: 1.5, d7: 1.5, d10: 1.5, d16: 1.5, d60: 5 },
  shodashavarga: {
    d1: 3.5, d2: 1, d3: 1, d9: 3, d12: 0.5, d30: 1, d7: 0.5, d10: 0.5, d16: 2, d60: 4,
    d20: 0.5, d24: 0.5, d27: 0.5, d4: 0.5, d40: 0.5, d45: 0.5,
  },
};

/** Il varga viswa, BPHS 7.24-25, p. 96. */
export const VARGA_VISWA: Readonly<Record<CompoundMaitri | 'swakshetra', number>> = {
  swakshetra: 20,
  adhimitra: 18,
  mitra: 15,
  sama: 10,
  shatru: 7,
  adhishatru: 5,
};

const SCHEMI: readonly VargaScheme[] = ['shadvarga', 'saptavarga', 'dashavarga', 'shodashavarga'];

const SOURCE =
  'BPHS 7.17-27 (trad. Santhanam, vol. I, pp. 95-99). In ogni varga 20 se il segno è del ' +
  'graha, altrimenti 18, 15, 10, 7 o 5 secondo la relazione composta (3.57-58) col suo ' +
  'signore; per il peso del varga nello schema, diviso 20. Pesi della tavola di Santhanam a ' +
  'p. 97: nel saptavarga, dove il verso non assegna i numeri ai varga, navamsa 2½, ' +
  'dwadasamsa 4½, trimsamsa 2, saptamsa 1. Esaltazione e moolatrikona non danno il pieno. ' +
  'Nella hora il signore è il luminare. Le fasce di 7.26-27 sono un giudizio e non sono riportate.';

/** Il vimshopaka dei sette graha di una carta siderale, nei quattro schemi. */
export function computeVimshopaka(chart: NatalChart, hora: HoraConvention = DEFAULT_HORA_CONVENTION): Vimshopaka {
  const relazioni = computeRelationships(chart).pairs;
  // Con una convenzione moderna della hora il conto resta su Parashara: vedi
  // `bphsHoraConvention`. Con Leone-Cancro il signore è comunque il luminare.
  const usata = bphsHoraConvention(hora);
  const chiesta = horaConvention(hora);
  const conSegniLaHora = usata.signOf !== undefined;

  const grahas = chart.bodies
    .filter((body) => (PARASHARA_GRAHAS as readonly BodyId[]).includes(body.id))
    .map((body) => {
      const vargas = VARGAS.map(({ id }) => {
        const lord: BodyId =
          id === 'd2' && !conSegniLaHora
            ? horaOf(body.longitude)
            : parasharaSignLord(vargaSignOf(body.longitude, id, usata.id));
        const relation: CompoundMaitri | 'swakshetra' =
          lord === body.id
            ? 'swakshetra'
            : (relazioni.find((p) => p.from === body.id && p.to === lord)?.panchadha as CompoundMaitri);
        return { varga: id, lord, relation, viswa: VARGA_VISWA[relation] };
      });
      const schemes = SCHEMI.map((scheme) => {
        const pesi = VIMSHOPAKA_WEIGHTS[scheme];
        const points = vargas.reduce((somma, v) => somma + ((pesi[v.varga] ?? 0) * v.viswa) / 20, 0);
        return { scheme, points: Math.round(points * 100) / 100 };
      });
      return { id: body.id, name: grahaName(body.id, body.name), vargas, schemes };
    });

  const source =
    chiesta === usata
      ? SOURCE
      : `${SOURCE} La convenzione ${chiesta.name} scelta per il D-2 è una lettura moderna e non ` +
        'entra nei conti del BPHS: qui la hora è quella di Parashara.';
  return { source, weights: VIMSHOPAKA_WEIGHTS, grahas };
}
