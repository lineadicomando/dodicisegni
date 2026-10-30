/**
 * I varga: lo stesso cielo riletto su una scala più fine.
 *
 * Un varga divide ogni segno in *n* parti e assegna a ciascuna un segno,
 * secondo una regola che cambia da varga a varga. Ne esce una carta nuova, con
 * gli stessi corpi in posti diversi — il D-9 di una nascita è una seconda
 * carta, non una colonna della prima.
 *
 * A che cosa serva ciascuno è interpretazione e sta a chi legge. Che cosa
 * ciascuno *sia* è aritmetica, e sta qui.
 *
 * **La regola viaggia col risultato.** Non è un vezzo: fra le sedici divisioni
 * classiche le scuole divergono su più d'una, e un segno consegnato senza la
 * regola che l'ha prodotto non si può ricontrollare. Chi segue una convenzione
 * diversa dalla nostra deve poterlo vedere subito, invece di scoprirlo
 * confrontando i risultati con un altro programma.
 *
 * Le regole hanno forme diverse, e vale la pena vederle accanto:
 * - **D-1** non divide niente: è il segno stesso.
 * - **D-2**, la hora, divide in due metà rette dal Sole e dalla Luna, e il
 *   testo non dà loro un segno: le convenzioni stanno in `hora.ts`.
 * - **D-3** procede per trigoni: primo terzo al segno, secondo al quinto da
 *   lui, terzo al nono.
 * - **D-4** procede per kendra: i quarti al segno, al quarto, al settimo e
 *   al decimo.
 * - **D-9** parte da dove dice la **modalità**: dal segno stesso se cardinale,
 *   dal nono se fisso, dal quinto se mobile.
 * - **D-7** e **D-10** si biforcano su **pari e dispari**: si parte dal
 *   segno stesso nei dispari, dal settimo (D-7) o dal nono (D-10) nei pari.
 * - **D-12** parte sempre dal segno stesso e prosegue.
 * - **D-16**, **D-20** e **D-24** partono da pochi segni fissi, come il D-9
 *   ma senza riferirsi al segno di partenza: dall'Ariete, dal Leone o dal
 *   Sagittario secondo la modalità (D-16 e D-20, con fissi e mobili
 *   scambiati fra i due), dal Leone o dal Cancro secondo la parità (D-24).
 * - **D-30** abbandona le parti uguali: cinque tratti di ampiezza diversa,
 *   rovesciati fra segni pari e dispari.
 * - **D-40** parte dall'Ariete nei segni dispari e dalla Bilancia nei pari;
 *   **D-45** ha la forma del D-16.
 * - **D-60** conta dal segno stesso una parte ogni mezzo grado.
 * - **D-27** non riparte a ogni segno: conta di seguito dall'Ariete lungo
 *   tutto lo zodiaco, e il segno da cui comincia ciascun segno ne è la
 *   conseguenza.
 *
 * Le regole sono quelle del *Brihat Parashara Hora Shastra*, cap. 6, nella
 * traduzione di R. Santhanam, vol. I (Ranjan, 1992), lette sulla scansione in
 * `texts/jyotisha/bphs-santhanam-1992-vol1` (trascrizioni in
 * `trascrizioni.md`). Il verso viaggia nella regola, la pagina sta accanto a
 * ciascuna. Le tavole che Santhanam stampa sotto i versi sono state
 * controllate contro la regola, non copiate: quella del D-27 ha un refuso.
 */

import { ZODIAC_SIGNS } from './constants.js';
import { ChartError } from './errors.js';
import { degreeInSign, normalize360 } from './math.js';
import { DEFAULT_HORA_CONVENTION, horaConvention, horaOf } from './hora.js';
import { grahaName, requireSidereal } from './nakshatra.js';
import { PARASHARA_GRAHAS, parasharaSignDignities, VARGA_DIGNITY_SOURCE } from './dignita-parashara.js';
import type {
  BodyId,
  CelestialBody,
  HoraConvention,
  NatalChart,
  Shashtiamsa,
  SignVargaChart,
  VargaChart,
  VargaId,
  ZodiacSign,
} from './types.js';

interface VargaDefinition {
  id: VargaId;
  /** Il nome sanscrito, che non si traduce. */
  name: string;
  /** In quante parti divide un segno. */
  divisions: number;
  /** La regola in una riga, che viaggia col risultato. */
  rule: string;
  /**
   * L'indice del segno, 0-11, da indice del segno di partenza e grado dentro.
   * Manca nel D-2, dove il segno, se c'è, lo dà la convenzione della hora.
   */
  signIndex?: (sign: number, degree: number) => number;
  /**
   * Se il varga è **fine**: parti di un grado e un quarto o meno, che
   * l'Ascendente attraversa in pochi minuti di orologio. Questi portano
   * un'avvertenza calcolata sulla carta (`fineWarning`). Sono cinque: il D-24, il
   * D-27 e gli ultimi tre; il D-30 no, perché i suoi tratti vanno da cinque a
   * otto gradi.
   * Scelto dal proprietario il 30 ottobre 2026 (TODO.md, *Deciso*).
   */
  fine?: boolean;
}

/** Il segno all'indice dato, con il giro chiuso. */
const at = (index: number): ZodiacSign => ZODIAC_SIGNS[((index % 12) + 12) % 12] as ZodiacSign;

/**
 * I tratti del trimsamsa nei segni dispari, con il segno che ciascuno assegna.
 *
 * Cinque e non trenta, e di ampiezza diversa: è il varga che smette di dividere
 * in parti uguali. Ogni tratto porta il segno del pianeta che lo regge — Marte
 * l'Ariete, Saturno l'Acquario, e così via, tutti segni dispari.
 */
const TRIMSAMSA_ODD: readonly { until: number; sign: number }[] = [
  { until: 5, sign: 0 }, // Marte — Ariete
  { until: 10, sign: 10 }, // Saturno — Acquario
  { until: 18, sign: 8 }, // Giove — Sagittario
  { until: 25, sign: 2 }, // Mercurio — Gemelli
  { until: 30, sign: 6 }, // Venere — Bilancia
];

/** Gli stessi cinque rovesciati, con i segni pari dei medesimi pianeti. */
const TRIMSAMSA_EVEN: readonly { until: number; sign: number }[] = [
  { until: 5, sign: 1 }, // Venere — Toro
  { until: 12, sign: 5 }, // Mercurio — Vergine
  { until: 20, sign: 11 }, // Giove — Pesci
  { until: 25, sign: 9 }, // Saturno — Capricorno
  { until: 30, sign: 7 }, // Marte — Scorpione
];

export const VARGAS: readonly VargaDefinition[] = [
  {
    id: 'd1',
    name: 'Rashi',
    divisions: 1,
    rule: 'Il segno stesso: è la carta di partenza, e vale come varga perché la serie comincia da lei.',
    signIndex: (sign) => sign,
  },
  {
    // BPHS 6.5-6, pp. 68-69, con la tavola a p. 69. La regola che viaggia col
    // risultato è quella della convenzione scelta (`hora.ts`): questa è la
    // parte comune a tutte.
    id: 'd2',
    name: 'Hora',
    divisions: 2,
    rule:
      'Due parti da 15°, la hora del Sole e quella della Luna, rovesciate fra segni dispari e pari. ' +
      'Se abbiano un segno lo dice la convenzione (BPHS 6.5-6).',
  },
  {
    // BPHS 6.7-8, p. 69; tavola a p. 70.
    id: 'd3',
    name: 'Drekkana',
    divisions: 3,
    rule:
      'Tre parti da 10°. La prima al segno stesso, la seconda al quinto da lui, la terza al nono: ' +
      'i suoi trigoni (BPHS 6.7-8).',
    signIndex: (sign, degree) => sign + Math.floor(degree / 10) * 4,
  },
  {
    // BPHS 6.9, p. 70; tavola a p. 71. «Svarkṣādi-kendra-patayaḥ»: i signori
    // dei kendra a partire dal segno stesso.
    id: 'd4',
    name: 'Chaturthamsa',
    divisions: 4,
    rule:
      "Quattro parti da 7°30'. La prima al segno stesso, poi al quarto, al settimo e al decimo " +
      'da lui: i suoi kendra (BPHS 6.9).',
    signIndex: (sign, degree) => sign + Math.floor(degree / 7.5) * 3,
  },
  {
    // BPHS 6.10-11, p. 71, con la tavola sotto i versi.
    id: 'd7',
    name: 'Saptamsa',
    divisions: 7,
    rule:
      'Sette parti da 4°17\'8,57". Nei segni dispari si parte dal segno stesso, nei pari dal ' +
      'settimo da lui (BPHS 6.10-11).',
    signIndex: (sign, degree) => {
      const inizio = sign % 2 === 0 ? sign : sign + 6;
      return inizio + Math.floor((degree * 7) / 30);
    },
  },
  {
    // BPHS 6.12, p. 72. Il «movable» di Santhanam è il cardinale, il «dual»
    // il mobile.
    id: 'd9',
    name: 'Navamsa',
    divisions: 9,
    rule:
      "Nove parti da 3°20'. Si parte dal segno stesso se è cardinale, dal nono se è fisso, " +
      'dal quinto se è mobile; cioè, detto altrimenti, da Ariete per i segni di fuoco, ' +
      'Capricorno per la terra, Bilancia per l\'aria, Cancro per l\'acqua (BPHS 6.12).',
    signIndex: (sign, degree) => {
      // 0 cardinale, 1 fisso, 2 mobile: la modalità si legge dall'indice.
      const salto = [0, 8, 4][sign % 3] as number;
      return sign + salto + Math.floor(degree / (30 / 9));
    },
  },
  {
    // BPHS 6.13-14, p. 73, con la tavola.
    id: 'd10',
    name: 'Dasamsa',
    divisions: 10,
    rule:
      'Dieci parti da 3°. Nei segni dispari si parte dal segno stesso, nei pari dal nono da lui ' +
      '(BPHS 6.13-14).',
    signIndex: (sign, degree) => {
      const inizio = sign % 2 === 0 ? sign : sign + 8;
      return inizio + Math.floor(degree / 3);
    },
  },
  {
    // BPHS 6.15, p. 73.
    id: 'd12',
    name: 'Dwadasamsa',
    divisions: 12,
    rule: "Dodici parti da 2°30'. Si parte sempre dal segno stesso e si prosegue in ordine (BPHS 6.15).",
    signIndex: (sign, degree) => sign + Math.floor(degree / 2.5),
  },
  {
    // BPHS 6.16, pp. 74-75, con la tavola a p. 75. «Aja-siṃha-aśvito … cara-
    // ādiṣu»: dall'Ariete, dal Leone e dal Sagittario (l'«aśvin», il cavallo)
    // per cardinali, fissi e mobili. Il verso rovescia nei segni pari le
    // divinità, non i segni.
    id: 'd16',
    name: 'Shodasamsa',
    divisions: 16,
    rule:
      "Sedici parti da 1°52'30\". Si parte dall'Ariete se il segno è cardinale, dal Leone se " +
      'è fisso, dal Sagittario se è mobile, e si prosegue in ordine (BPHS 6.16).',
    signIndex: (sign, degree) => {
      const inizio = [0, 4, 8][sign % 3] as number;
      return inizio + Math.floor((degree * 16) / 30);
    },
  },
  {
    // BPHS 6.17-21, p. 76, con la tavola a pp. 76-77. «Kriyāc care sthire
    // cāpān mṛgendrād dvisvabhāvake»: dall'Ariete nel cardinale, dall'arco
    // (Sagittario) nel fisso, dal leone nel mobile. Fissi e mobili sono
    // scambiati rispetto al D-16, e il sanscrito lo conferma.
    id: 'd20',
    name: 'Vimsamsa',
    divisions: 20,
    rule:
      "Venti parti da 1°30'. Si parte dall'Ariete se il segno è cardinale, dal Sagittario se " +
      'è fisso, dal Leone se è mobile, e si prosegue in ordine (BPHS 6.17-21).',
    signIndex: (sign, degree) => {
      const inizio = [0, 8, 4][sign % 3] as number;
      return inizio + Math.floor((degree * 20) / 30);
    },
  },
  {
    // BPHS 6.22-23, p. 77, con la tavola a p. 78. «Siṃhād oja-bhage …
    // karkād yugma-bhage»: dal Leone nel segno dispari, dal Cancro nel pari.
    // Santhanam lo chiama anche Chaturvimsamsa.
    id: 'd24',
    name: 'Siddhamsa',
    divisions: 24,
    rule:
      "Ventiquattro parti da 1°15'. Nei segni dispari si parte dal Leone, nei pari dal Cancro, " +
      'e si prosegue in ordine (BPHS 6.22-23).',
    signIndex: (sign, degree) => {
      const inizio = sign % 2 === 0 ? 4 : 3;
      return inizio + Math.floor((degree * 24) / 30);
    },
    fine: true,
  },
  {
    // BPHS 6.24-26, trad. Santhanam, vol. I, pp. 78-79: «meṣādi-cara-bha-
    // kramāt», dall'Ariete e dagli altri segni mobili. Santhanam lo scioglie
    // per elemento, e la sua tavola (p. 79) lo conferma colonna per colonna,
    // tranne un refuso: Gemelli, undicesima parte, stampa 3 dove la regola e
    // la colonna della Bilancia danno 5. Le due formulazioni coincidono
    // perché 27 fa 3 modulo 12: contare di seguito dall'Ariete porta ogni
    // segno a cominciare tre segni dopo il precedente.
    id: 'd27',
    name: 'Nakshatramsa',
    divisions: 27,
    rule:
      "Ventisette parti da 1°6'40\", un quarto di pada. Si parte dall'Ariete per i segni di " +
      "fuoco, dal Cancro per la terra, dalla Bilancia per l'aria, dal Capricorno per l'acqua: " +
      "cioè si conta di seguito dall'Ariete lungo tutto lo zodiaco (BPHS 6.26).",
    signIndex: (sign, degree) => sign * 3 + Math.floor((degree * 27) / 30),
    fine: true,
  },
  {
    // BPHS 6.27-28, p. 80, con la tavola.
    id: 'd30',
    name: 'Trimsamsa',
    divisions: 30,
    rule:
      'Cinque tratti di ampiezza disuguale, non trenta parti. Nei segni dispari 5° a Marte ' +
      "(Ariete), 5° a Saturno (Acquario), 8° a Giove (Sagittario), 7° a Mercurio (Gemelli), " +
      '5° a Venere (Bilancia); nei pari lo stesso ordine rovesciato, coi segni pari dei ' +
      'medesimi pianeti (BPHS 6.27-28).',
    signIndex: (sign, degree) => {
      const tratti = sign % 2 === 0 ? TRIMSAMSA_ODD : TRIMSAMSA_EVEN;
      const tratto = tratti.find((parte) => degree < parte.until) ?? tratti[tratti.length - 1];
      return (tratto as { sign: number }).sign;
    },
  },
  {
    // BPHS 6.29-30, p. 80, con la tavola a p. 81. «Viṣame kriyāt … samabhe
    // tulataḥ»: dall'Ariete nel dispari, dalla Bilancia nel pari. Santhanam
    // lo intitola Chatvarimsamsa e nelle note lo chiama Khavedamsa.
    id: 'd40',
    name: 'Khavedamsa',
    divisions: 40,
    rule:
      "Quaranta parti da 45'. Nei segni dispari si parte dall'Ariete, nei pari dalla Bilancia, " +
      'e si prosegue in ordine (BPHS 6.29-30).',
    signIndex: (sign, degree) => {
      const inizio = sign % 2 === 0 ? 0 : 6;
      return inizio + Math.floor((degree * 40) / 30);
    },
    fine: true,
  },
  {
    // BPHS 6.31-32, p. 81, con la tavola a p. 82. «Carabhe kriyāt | sthire
    // siṃhād dvibhe cāpāt»: la forma del D-16.
    id: 'd45',
    name: 'Akshavedamsa',
    divisions: 45,
    rule:
      "Quarantacinque parti da 40'. Si parte dall'Ariete se il segno è cardinale, dal Leone " +
      'se è fisso, dal Sagittario se è mobile, e si prosegue in ordine (BPHS 6.31-32).',
    signIndex: (sign, degree) => {
      const inizio = [0, 4, 8][sign % 3] as number;
      return inizio + Math.floor((degree * 45) / 30);
    },
    fine: true,
  },
  {
    // BPHS 6.33, p. 82; la traduzione e l'esempio a p. 83. «Śeṣaṃ saikaṃ ca
    // tad-rāśeḥ»: il resto più uno, da quel segno. Santhanam conta così
    // (Venere a 13°25' del Capricorno: 26 diviso 12 dà resto 2, più 1 fa 3,
    // contati dal Capricorno: Pesci), e la sua traduzione omette «da quel
    // segno»: è da lì che viene la lettura dall'Ariete, che non ha trovato un
    // autore e non è calcolata. P.V.R. Narasimha Rao legge il verso come qui
    // (un'email del 2009 riportata su un forum, in `texts/tecnica/
    // d60-letture-in-rete-2026`). La decisione sta in TODO.md, *Deciso*. I sessanta nomi (6.34-40)
    // si rovesciano nei segni pari; i segni no. I nomi sono in `SHASHTIAMSA_NAMES`.
    id: 'd60',
    name: 'Shashtiamsa',
    divisions: 60,
    rule:
      "Sessanta parti da 30'. Si raddoppiano i gradi percorsi nel segno, si divide per 12 e " +
      "si aggiunge 1 al resto: è il segno, contato dal segno stesso (BPHS 6.33, «tad-rāśeḥ»). " +
      "Chi conta dall'Ariete segue un'altra lettura, che qui non è calcolata.",
    signIndex: (sign, degree) => sign + Math.floor(degree * 2),
    fine: true,
  },
];

/** La definizione di un varga, o un errore che elenca quelli che ci sono. */
export function findVarga(id: VargaId): VargaDefinition {
  const definition = VARGAS.find((varga) => varga.id === id);
  if (!definition) {
    throw new ChartError(
      'VARGA_NON_VALIDO',
      `Varga "${id}" non disponibile. Calcolati: ${VARGAS.map((v) => v.id).join(', ')}.`,
    );
  }
  return definition;
}

/**
 * Il segno che una longitudine **siderale** occupa in un varga.
 *
 * Prende una longitudine nuda come `nakshatraOf`: vale per un corpo, per una
 * cuspide o per il lagna allo stesso modo. Nel D-2 vuole una convenzione che
 * dia un segno: con quella di Parashara, che non ne dà, è un errore, e la
 * hora si chiede a `horaOf`.
 */
export function vargaSignOf(
  siderealLongitude: number,
  id: VargaId,
  hora: HoraConvention = DEFAULT_HORA_CONVENTION,
): ZodiacSign {
  const definition = findVarga(id);
  const longitude = normalize360(siderealLongitude);

  if (!definition.signIndex) {
    const convenzione = horaConvention(hora);
    if (!convenzione.signOf) {
      throw new ChartError(
        'VARGA_SENZA_SEGNI',
        `Il D-2 secondo ${convenzione.name} non ha segni, solo la hora del Sole o della Luna. ` +
          'Per avere un segno serve la convenzione leone-cancro.',
      );
    }
    return convenzione.signOf[horaOf(longitude)];
  }

  return at(definition.signIndex(Math.floor(longitude / 30), degreeInSign(longitude)));
}

/**
 * I sessanta nomi del D-60 nei segni dispari, nell'ordine di BPHS 6.34-39.
 *
 * La grafia è quella della tavola di Santhanam, vol. I, pp. 84-86, letta
 * sull'immagine: è la tavola che lega ogni nome al suo mezzo grado. La lista
 * che la stessa traduzione stampa a p. 83 scrive alcuni nomi altrimenti
 * (Marutwan per Marut, Kala per Kaala, Davagni, Karala Damshtra, Kalapavaka,
 * Chandrarekha), e il verso traslitterato in `texts/` dice quale forma
 * sanscrita sta sotto ciascuno. Due nomi tornano tre volte (Kaala, Amrita) e
 * quattro due volte (Ghora, Deva, Komala, Saumya): è il testo, e la tavola li
 * rimanda l'uno all'altro («same as S. No. 15»).
 */
export const SHASHTIAMSA_NAMES: readonly string[] = [
  'Ghora', 'Rakshasa', 'Deva', 'Kubera', 'Yaksha', 'Kinnara', 'Bhrashta', 'Kulaghna', 'Garala', 'Vahni',
  'Maya', 'Purishaka', 'Apampathi', 'Marut', 'Kaala', 'Sarpa', 'Amrita', 'Indu', 'Mridu', 'Komala',
  'Heramba', 'Brahma', 'Vishnu', 'Maheswara', 'Deva', 'Ardra', 'Kalinasa', 'Kshiteesa', 'Kamalakara', 'Gulika',
  'Mrithyu', 'Kaala', 'Davagani', 'Ghora', 'Yama', 'Kantaka', 'Sudha', 'Amrita', 'Poornachandra', 'Vishadagdha',
  'Kulanasa', 'Vamsakshaya', 'Utpata', 'Kaala', 'Saumya', 'Komala', 'Seetala', 'Karaladamshtra', 'Chandramukhi', 'Praveena',
  'Kala Pavaka', 'Dandayudha', 'Nirmala', 'Saumya', 'Kroora', 'Atiseetala', 'Amrita', 'Payodhi', 'Bhramana', 'Chandra Rekha',
];

/** Da dove vengono i nomi del D-60, e che cosa non ne viene. */
export const SHASHTIAMSA_SOURCE =
  'Nomi dei sessanta shashtiamsa secondo BPHS 6.34-40 (Santhanam, vol. I, pp. 82-86, grafia della ' +
  'tavola di pp. 84-86): nei segni dispari dal primo mezzo grado, nei pari al rovescio (6.40). ' +
  "Il giudizio benefico o malefico del verso 41, che la tavola segna con (B) e (M), non è riportato.";

/**
 * Lo shashtiamsa di una longitudine **siderale**: il mezzo grado, e il nome.
 *
 * Il mezzo grado è lo stesso che dà il segno del D-60 (`⌊2·gradi⌋`, BPHS
 * 6.33). Il rovescio dei segni pari vale per i nomi soltanto (6.40, e la
 * traduzione di Santhanam lo dice: «insomuch as these names are concerned»).
 */
export function shashtiamsaOf(siderealLongitude: number): Shashtiamsa {
  const longitude = normalize360(siderealLongitude);
  const part = Math.min(Math.floor(degreeInSign(longitude) * 2), 59) + 1;
  const dispari = Math.floor(longitude / 30) % 2 === 0;
  const number = dispari ? part : 61 - part;
  return { part, number, name: SHASHTIAMSA_NAMES[number - 1]! };
}

/**
 * Quanti gradi di Ascendente passano in un minuto di orologio, sulla carta.
 *
 * Dall'Ascendente come funzione del tempo siderale locale, della latitudine e
 * dell'obliquità (tan λ = −cos θ / (sin ε tan φ + cos ε sin θ)), derivato a
 * differenze centrate su un minuto. Il tempo siderale avanza di 360,9856° al
 * giorno. L'obliquità è quella media della IAU 1980: per una velocità, e per
 * un'avvertenza espressa in minuti, la nutazione non cambia la cifra.
 *
 * La derivata non dipende da quale delle due soluzioni sia l'Ascendente e
 * quale il Discendente, ed è la ragione per cui qui basta l'arcotangente
 * senza scegliere il ramo. Alle latitudini polari, dove l'Ascendente salta,
 * la cifra non ha senso e la funzione restituisce `undefined`.
 */
function ascendantDegreesPerMinute(chart: NatalChart): number | undefined {
  const rad = Math.PI / 180;
  const secoli = (chart.time.julianDayUT - 2451545) / 36525;
  const eps = (23.439291 - 0.0130042 * secoli) * rad;
  const phi = chart.input.latitude * rad;
  const ascendente = (theta: number): number =>
    Math.atan2(-Math.cos(theta), Math.sin(eps) * Math.tan(phi) + Math.cos(eps) * Math.sin(theta)) / rad;

  const passo = 360.98564736629 / 1440; // gradi di tempo siderale in un minuto
  const theta = chart.siderealTime.hours * 15;
  const avanti = ascendente((theta + passo) * rad);
  const indietro = ascendente((theta - passo) * rad);
  const velocita = normalize360(avanti - indietro + 180) - 180;
  const perMinuto = velocita / 2;
  return Number.isFinite(perMinuto) && perMinuto > 0 && Math.abs(chart.input.latitude) < 66 ? perMinuto : undefined;
}

/** Una durata in minuti, a parole: i secondi sotto il minuto. */
function durata(minuti: number): string {
  if (minuti < 1) return `${Math.round(minuti * 60)} secondi`;
  return `${minuti.toFixed(1).replace('.', ',')} minuti`;
}

/** Quanto manca, all'indietro e in avanti, al confine della parte in cui cade la longitudine. */
function distanzeDalConfine(longitude: number, divisions: number): [number, number] {
  const ampiezza = 30 / divisions;
  const grado = degreeInSign(longitude);
  const dentro = grado - Math.floor(grado / ampiezza) * ampiezza;
  return [dentro, ampiezza - dentro];
}

/** Un arco in gradi, primi e secondi, senza le parti nulle: 45', 1°15', 1°6'40". */
function arco(gradi: number): string {
  const secondi = Math.round(gradi * 3600);
  const [g, m, s] = [Math.floor(secondi / 3600), Math.floor((secondi % 3600) / 60), secondi % 60];
  return `${g ? `${g}°` : ''}${m ? `${m}'` : ''}${s ? `${s}"` : ''}`;
}

/**
 * L'avvertenza di un varga fine, calcolata sulla carta e non a memoria.
 *
 * La cifra che circola, «due minuti per parte del D-60», è una media: quanto
 * valga per una nascita dipende dal segno che sorge e dalla latitudine, e
 * dove cada l'Ascendente dentro la sua parte conta più della larghezza della
 * parte. Per questo si dice di quanto l'ora dovrebbe sbagliare, prima o
 * dopo, perché lagna e Luna cambino segno in questo varga. Senza ora di
 * nascita il lagna non c'è, e si dice quante parti la Luna attraversa in un
 * giorno.
 */
function fineWarning(chart: NatalChart, definition: VargaDefinition): string {
  const n = definition.divisions;
  const nome = `Il ${definition.id.toUpperCase()}`;
  const ampiezza = arco(30 / n);
  const luna = chart.bodies.find((body) => body.id === 'luna');

  if (!chart.time.timeKnown || !chart.angles) {
    const parti = luna ? Math.round((Math.abs(luna.speed) * n) / 30) : undefined;
    return (
      `${nome} senza ora di nascita non ha lagna, e i suoi segni valgono solo per i graha lenti. ` +
      (parti
        ? `La Luna in un giorno attraversa circa ${parti} parti da ${ampiezza}: il suo segno qui non è determinato.`
        : `Una parte è di ${ampiezza} d'arco.`)
    );
  }

  const velocita = ascendantDegreesPerMinute(chart);
  const righe = [`${nome} vuole l'ora di nascita al minuto: una parte è di ${ampiezza} d'arco.`];
  if (velocita) {
    const [prima, dopo] = distanzeDalConfine(chart.angles.ascendant, n);
    righe.push(
      `Qui l'Ascendente ne percorre una in circa ${durata(30 / n / velocita)}, e il lagna cambia segno ` +
        `se l'ora di nascita è anticipata di ${durata(prima / velocita)} o posticipata di ` +
        `${durata(dopo / velocita)}.`,
    );
  }
  if (luna && luna.speed > 0) {
    const perMinuto = luna.speed / 1440;
    const [prima, dopo] = distanzeDalConfine(luna.longitude, n);
    righe.push(
      `La Luna cambia segno con un anticipo di ${durata(prima / perMinuto)} o un ritardo di ` +
        `${durata(dopo / perMinuto)}.`,
    );
  }
  righe.push('Un\'ora arrotondata al quarto d\'ora non basta a dire quale segno sia quello giusto.');
  return righe.join(' ');
}

/**
 * Un corpo in un varga a segni: il segno, il moto e, per i sette graha, i
 * loro segni di dignità in cui il segno cade.
 */
function posizione(body: CelestialBody, sign: ZodiacSign): SignVargaChart['positions'][number] {
  return {
    id: body.id,
    name: grahaName(body.id, body.name),
    sign,
    retrograde: body.retrograde,
    ...((PARASHARA_GRAHAS as readonly BodyId[]).includes(body.id)
      ? { dignitySigns: parasharaSignDignities(body.id, sign) }
      : {}),
  };
}

/** Le opzioni di una carta divisionale: per ora, la sola lettura del D-2. */
export interface VargaOptions {
  /** Default: `parashara`. Conta solo nel D-2. */
  hora?: HoraConvention;
}

/**
 * La carta di un varga: dove finiscono i corpi e il lagna.
 *
 * Le case non ci sono, e non è una mancanza. In un varga si contano dal lagna
 * a segni interi, quindi la casa di un corpo si ricava dal suo segno e da
 * quello del lagna senza altro calcolo: darle qui vorrebbe dire scegliere una
 * domificazione dove il sistema non ne prevede.
 *
 * Il D-2 secondo Parashara esce come `HoraVargaChart`, con la hora al posto
 * del segno; con `leone-cancro` come ogni altro varga. In tutti e due i casi
 * porta la convenzione e la sua regola.
 */
export function computeVarga(chart: NatalChart, id: VargaId, options: VargaOptions = {}): VargaChart {
  requireSidereal(chart.zodiac, `Il varga ${id.toUpperCase()}`);

  const definition = findVarga(id);

  if (definition.id === 'd2') {
    const { rule, signOf, ...convention } = horaConvention(options.hora);
    const comune = { varga: 'd2' as const, name: definition.name, divisions: definition.divisions, rule, convention };
    if (!signOf) {
      return {
        ...comune,
        kind: 'signori',
        positions: chart.bodies.map((body) => ({
          id: body.id,
          name: grahaName(body.id, body.name),
          hora: horaOf(body.longitude),
          retrograde: body.retrograde,
        })),
        ...(chart.angles ? { ascendant: horaOf(chart.angles.ascendant) } : {}),
      };
    }
    return {
      ...comune,
      kind: 'segni',
      positions: chart.bodies.map((body) => posizione(body, signOf[horaOf(body.longitude)])),
      ...(chart.angles ? { ascendant: signOf[horaOf(chart.angles.ascendant)] } : {}),
      dignitySource: VARGA_DIGNITY_SOURCE,
    };
  }

  return {
    kind: 'segni',
    varga: definition.id,
    name: definition.name,
    divisions: definition.divisions,
    rule: definition.rule,
    positions: chart.bodies.map((body) => ({
      ...posizione(body, vargaSignOf(body.longitude, id)),
      ...(id === 'd60' ? { shashtiamsa: shashtiamsaOf(body.longitude) } : {}),
    })),
    ...(chart.angles ? { ascendant: vargaSignOf(chart.angles.ascendant, id) } : {}),
    ...(id === 'd60' && chart.angles ? { ascendantShashtiamsa: shashtiamsaOf(chart.angles.ascendant) } : {}),
    dignitySource: VARGA_DIGNITY_SOURCE,
    ...(id === 'd60' ? { shashtiamsaSource: SHASHTIAMSA_SOURCE } : {}),
    ...(definition.fine ? { warnings: [fineWarning(chart, definition)] } : {}),
  };
}
