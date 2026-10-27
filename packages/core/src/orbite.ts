/**
 * Le orbite degli aspetti, per convenzione nominata.
 *
 * Quanto lontano dall'esatto un aspetto valga ancora non è un fatto: è una
 * regola di scuola, e le scuole non concordano. Il motore quindi non ne ha una
 * sua. Ogni tavola qui sotto ha un autore fuori da questo repo e una fonte
 * con la pagina, entra intera (aspetti trattati compresi) e viaggia nel
 * risultato col suo nome, come il sistema di case.
 *
 * Le orbite sono tante quante le domande. Il tema e il cielo di un istante
 * usano una convenzione **natale**; i transiti e i passaggi una convenzione
 * **dei transiti**, molto più stretta, perché lì l'orbita misura per quanto
 * tempo un contatto dura, e con le orbite natali un transito di Saturno
 * resterebbe «in aspetto» per mesi.
 *
 * Le fonti stanno in `texts/` (vedi `texts/INDICE.md`): la pagina di
 * Astrodienst in `tecnica/astrodienst-orbite-2026`, Leo in
 * `occidentale/leo-how-to-judge-a-nativity-1928`, Lilly in
 * `occidentale/lilly-christian-astrology-1647`.
 */

import { ChartError } from './errors.js';
import type {
  AspectId,
  NatalOrbConvention,
  OrbConventionInfo,
  TransitOrbConvention,
} from './types.js';

/** Una convenzione: chi, dove, e la regola che dà l'orbita di una coppia. */
export interface OrbConventionDefinition<Id extends string = string> {
  id: Id;
  /** Il nome con cui la si riconosce, l'autore per primo. */
  name: string;
  /** L'opera e la pagina, o l'indirizzo e la data della copia. */
  source: string;
  /** La regola in una riga, che viaggia col risultato. */
  rule: string;
  /** Gli aspetti che la scuola tratta: gli altri non li calcola. */
  aspects: readonly AspectId[];
  /** L'orbita massima, in gradi, di un aspetto fra due punti nominati. */
  orbOf: (aspect: AspectId, a: string, b: string) => number;
}

/**
 * I punti matematici: un nodo, un apogeo, un asse, un lotto. Per Astrodienst
 * non hanno un'orbita loro; i pianeti e Chirone sì.
 */
const PUNTI_MATEMATICI: ReadonlySet<string> = new Set([
  'nodo-nord',
  'nodo-sud',
  'lilith',
  'ascendente',
  'medio-cielo',
  'fortuna',
]);

/**
 * Liz Greene, la tavola che Astrodienst usa come predefinita.
 *
 * astro.com, «A Brief Introduction to Astrology: Aspects», seconda tavola
 * delle orbite: «These orbs are used by Liz Greene, and used in our web server
 * as default setting». Uguali per tutti i pianeti, Chirone compreso; 0° a
 * Nodo, AC e MC. La FAQ delle impostazioni (`fq_fh_setup_e.htm`) dice che in
 * aspetto a un pianeta di un punto senza orbita si conta **la metà**
 * dell'orbita del pianeta. Il motore estende «punti» a Lilith e alla Parte
 * di Fortuna, che sono della stessa natura (la FAQ dice «Ascendant, Nodes,
 * Vertex etc.»), e lo dichiara nella regola.
 */
const GREENE: Readonly<Record<AspectId, number>> = {
  congiunzione: 10,
  opposizione: 10,
  quadrato: 10,
  trigono: 10,
  sestile: 6,
  semisestile: 3,
  quinconce: 3,
  semiquadrato: 3,
  sesquiquadrato: 3,
  quintile: 2,
  biquintile: 2,
};

/**
 * Alan Leo, *How to Judge a Nativity*, 4ª ed. (1928), p. 47.
 *
 * Congiunzione e opposizione 8° fra pianeti, «about 10°» se uno dei due è un
 * luminare, 12° fra Sole e Luna; quadrato e trigono 8° «all round»; sestile
 * 7°; semiquadrato e sesquiquadrato 4°; semisestile e quinconce 2°. Il
 * quintile non c'è. Leo le chiama «hints… not hard and fast rules» e «the
 * outside limits». Non nomina nodi, Lilith, Chirone né Plutone: il motore
 * applica a loro la regola dei pianeti, e lo dice.
 */
const LEO: Readonly<Partial<Record<AspectId, number>>> = {
  congiunzione: 8,
  opposizione: 8,
  quadrato: 8,
  trigono: 8,
  sestile: 7,
  semiquadrato: 4,
  sesquiquadrato: 4,
  semisestile: 2,
  quinconce: 2,
};

const LUMINARI: ReadonlySet<string> = new Set(['sole', 'luna']);

/**
 * William Lilly, *Christian Astrology* (1647), p. 107: l'orbita è **del
 * pianeta**, non dell'aspetto, e la coppia è in aspetto entro la somma delle
 * due metà (*moieties*), p. 110: «every Planet that applies is allowed halfe
 * his owne orbs and halfe the orbs of that Planet from whom he seperates».
 *
 * Lilly stampa due colonne. La prima è quella che dice trovata «by the best
 * Authors and my owne Experience»; la seconda ha accanto «According to
 * others», «As some have wrote», «Most say». L'esempio di p. 107 usa la prima,
 * quello di p. 110 la seconda, e Lilly ammette di usarle «as my Memory best
 * Remembereth». Qui la prima, dichiarata nella regola.
 */
const LILLY_ORBI: Readonly<Record<string, number>> = {
  saturno: 10,
  giove: 12,
  marte: 7.5,
  sole: 17,
  venere: 8,
  mercurio: 7,
  luna: 12.5,
};

/** I cinque aspetti che Lilly tratta: i minori non li considera (p. 110). */
const TOLEMAICI: readonly AspectId[] = ['congiunzione', 'sestile', 'quadrato', 'trigono', 'opposizione'];

const TUTTI: readonly AspectId[] = Object.keys(GREENE) as AspectId[];

export const NATAL_ORB_CONVENTIONS: readonly OrbConventionDefinition<NatalOrbConvention>[] = [
  {
    id: 'greene',
    name: 'Liz Greene (predefinita di Astrodienst)',
    source:
      'astro.com, «A Brief Introduction to Astrology: Aspects», tavola delle orbite 2.AT/2.GW/2.GR; ' +
      'FAQ fq_fh_setup_e.htm per i punti senza orbita. Copia del 27 ottobre 2026.',
    rule:
      'Per aspetto, uguale per tutti i pianeti e Chirone: 10° a congiunzione, opposizione, ' +
      'quadrato e trigono, 6° al sestile, 3° a semisestile, quinconce, semiquadrato e ' +
      'sesquiquadrato, 2° a quintile e biquintile. Nodi, Lilith, assi e Parte di Fortuna non ' +
      "hanno orbita: con un pianeta vale metà della sua, fra loro nessun aspetto.",
    aspects: TUTTI,
    orbOf: (aspect, a, b) => {
      const propria = (id: string): number => (PUNTI_MATEMATICI.has(id) ? 0 : GREENE[aspect]);
      return (propria(a) + propria(b)) / 2;
    },
  },
  {
    id: 'leo',
    name: 'Alan Leo',
    source: 'Alan Leo, How to Judge a Nativity, 4ª ed. (1928), p. 47.',
    rule:
      'Per aspetto: congiunzione e opposizione 8° fra pianeti, 10° con un luminare, 12° fra ' +
      'Sole e Luna; quadrato e trigono 8°, sestile 7°, semiquadrato e sesquiquadrato 4°, ' +
      'semisestile e quinconce 2°. Niente quintili. Nodi, Lilith, Chirone e Plutone, che Leo non ' +
      'nomina, seguono la regola dei pianeti.',
    aspects: Object.keys(LEO) as AspectId[],
    orbOf: (aspect, a, b) => {
      const base = LEO[aspect] ?? 0;
      if (aspect !== 'congiunzione' && aspect !== 'opposizione') return base;
      return base + (LUMINARI.has(a) ? 2 : 0) + (LUMINARI.has(b) ? 2 : 0);
    },
  },
  {
    id: 'lilly',
    name: 'William Lilly (moieties)',
    source: 'William Lilly, Christian Astrology (1647), p. 107 (tavola, prima colonna) e p. 110 (la somma delle metà).',
    rule:
      "Per pianeta: Saturno 10°, Giove 12°, Marte 7°30', Sole 17°, Venere 8°, Mercurio 7°, Luna 12°30'; " +
      'una coppia è in aspetto entro la metà dell\'uno più la metà dell\'altro, per ognuno dei cinque ' +
      "aspetti tolemaici. Prima colonna della tavola; la seconda (Saturno e Giove 9°, Marte 7°, Sole 15°, " +
      'Venere 7°, Luna 12°) Lilly la attribuisce ad altri. Urano, Nettuno, Plutone, Chirone, i Nodi, ' +
      'Lilith e gli assi non sono nella tavola e non hanno orbita: con loro nessun aspetto.',
    aspects: TOLEMAICI,
    orbOf: (_aspect, a, b) => {
      const orboA = LILLY_ORBI[a];
      const orboB = LILLY_ORBI[b];
      if (orboA === undefined || orboB === undefined) return 0;
      return (orboA + orboB) / 2;
    },
  },
];

export const TRANSIT_ORB_CONVENTIONS: readonly OrbConventionDefinition<TransitOrbConvention>[] = [
  {
    id: 'hand',
    name: 'Robert Hand',
    source:
      'astro.com, FAQ fq_fh_sr_fore_e.htm: le previsioni di Robert Hand «use an orb of 1° for ' +
      'all transits to all natal planets». Copia del 27 ottobre 2026.',
    rule:
      '1° per ogni aspetto e ogni coppia, senza eccezioni per i luminari. Il motore la usa anche ' +
      'per gli assi natali e per gli incontri fra i corpi in cielo, che la frase di Hand non nomina.',
    aspects: TUTTI,
    orbOf: () => 1,
  },
];

export const DEFAULT_NATAL_ORB_CONVENTION: NatalOrbConvention = 'greene';
export const DEFAULT_TRANSIT_ORB_CONVENTION: TransitOrbConvention = 'hand';

/** La convenzione natale chiesta, o la predefinita. */
export function natalOrbConvention(
  id: NatalOrbConvention = DEFAULT_NATAL_ORB_CONVENTION,
): OrbConventionDefinition<NatalOrbConvention> {
  return find(NATAL_ORB_CONVENTIONS, id);
}

/** La convenzione dei transiti chiesta, o la predefinita. */
export function transitOrbConvention(
  id: TransitOrbConvention = DEFAULT_TRANSIT_ORB_CONVENTION,
): OrbConventionDefinition<TransitOrbConvention> {
  return find(TRANSIT_ORB_CONVENTIONS, id);
}

/**
 * Una convenzione per nome. L'identificativo si confronta come stringa: per
 * il tipo è sempre uno di quelli ammessi, ma dall'MCP e dalla CLI arriva con
 * un cast, e un nome sconosciuto va rifiutato dicendo quali esistono.
 */
function find<Id extends string>(
  conventions: readonly OrbConventionDefinition<Id>[],
  id: string,
): OrbConventionDefinition<Id> {
  const found = conventions.find((convention) => convention.id === id);
  if (!found) {
    throw new ChartError(
      'ORBITE_NON_VALIDE',
      `Convenzione delle orbite "${id}" non riconosciuta. Ammesse: ${conventions
        .map((convention) => convention.id)
        .join(', ')}.`,
    );
  }
  return found;
}

/**
 * La convenzione come la porta il risultato: il nome, la fonte, la regola, e
 * gli aspetti di cui chi ha chiamato ha sostituito l'orbita.
 */
export function orbConventionInfo(
  convention: OrbConventionDefinition,
  overrides?: Partial<Record<AspectId, number>>,
): OrbConventionInfo {
  const info: OrbConventionInfo = {
    id: convention.id,
    name: convention.name,
    source: convention.source,
    rule: convention.rule,
  };
  const overridden = Object.keys(overrides ?? {}) as AspectId[];
  if (overridden.length > 0) info.overridden = overridden;
  return info;
}

/**
 * L'orbita di una coppia per un aspetto, tenuto conto di quelle sostituite
 * da chi chiama. Una sostituzione vale per la coppia intera: non le si
 * aggiunge niente.
 */
export function pairOrb(
  convention: OrbConventionDefinition,
  aspect: AspectId,
  a: string,
  b: string,
  overrides?: Partial<Record<AspectId, number>>,
): number {
  return overrides?.[aspect] ?? convention.orbOf(aspect, a, b);
}
