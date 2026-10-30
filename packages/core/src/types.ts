/**
 * Tipi pubblici del motore di calcolo.
 *
 * Tutte le longitudini eclittiche sono in gradi decimali nell'intervallo [0, 360).
 * Le latitudini geografiche sono positive a Nord, le longitudini geografiche
 * positive a Est (convenzione Swiss Ephemeris).
 */

export type ZodiacSign =
  | 'ariete'
  | 'toro'
  | 'gemelli'
  | 'cancro'
  | 'leone'
  | 'vergine'
  | 'bilancia'
  | 'scorpione'
  | 'sagittario'
  | 'capricorno'
  | 'acquario'
  | 'pesci';

export type BodyId =
  | 'sole'
  | 'luna'
  | 'mercurio'
  | 'venere'
  | 'marte'
  | 'giove'
  | 'saturno'
  | 'urano'
  | 'nettuno'
  | 'plutone'
  | 'nodo-nord'
  | 'nodo-sud'
  | 'lilith'
  | 'chirone';

export type HouseSystem =
  | 'placidus'
  | 'koch'
  | 'segni-interi'
  | 'equale'
  | 'regiomontano'
  | 'campano'
  | 'porfirio'
  | 'topocentrico'
  | 'alcabizio';

/**
 * Da dove si comincia a contare i segni.
 *
 * `tropicale` parte dal punto vernale, `siderale` dalle stelle fisse. Fra i
 * due corrono oggi più di ventiquattro gradi: quasi un segno, quindi non è una
 * sfumatura ma un altro tema. Vedi `ayanamsa.ts`.
 */
export type Zodiac = 'tropicale' | 'siderale';

/** Le convenzioni siderali esposte dal motore. */
export type AyanamsaId =
  | 'lahiri'
  | 'true-chitra'
  | 'krishnamurti'
  | 'raman'
  | 'yukteshwar'
  | 'fagan-bradley';

/**
 * L'ayanamsa usato e quanto valeva in quell'istante.
 *
 * Il valore viaggia col risultato e non resta implicito: è la differenza fra
 * un tema che si può ricontrollare e uno di cui bisogna fidarsi. Chi segue
 * un'altra scuola sottrae la differenza invece di rifare tutto.
 */
export interface AyanamsaInfo {
  id: AyanamsaId;
  /** Il nome con cui la convenzione si trova sui libri. */
  name: string;
  /** Scarto fra longitudine tropicale e siderale, in gradi decimali. */
  degrees: number;
}

/**
 * Lo zodiaco in cui esprimere le longitudini.
 *
 * Un'opzione e non un motore a parte: cambiare zodiaco è cambiare l'origine da
 * cui si contano i gradi, non il modo di calcolarli. Le portano tutte le
 * funzioni che riportano un segno.
 */
export interface ZodiacOptions {
  /** Default: `tropicale`. */
  zodiac?: Zodiac;
  /** Vale solo nello zodiaco siderale. Default: `lahiri`. */
  ayanamsa?: AyanamsaId;
}

/** I ventisette nakshatra, nell'ordine a partire da 0° dell'Ariete siderale. */
export type NakshatraId =
  | 'ashwini'
  | 'bharani'
  | 'krittika'
  | 'rohini'
  | 'mrigashira'
  | 'ardra'
  | 'punarvasu'
  | 'pushya'
  | 'ashlesha'
  | 'magha'
  | 'purva-phalguni'
  | 'uttara-phalguni'
  | 'hasta'
  | 'chitra'
  | 'swati'
  | 'vishakha'
  | 'anuradha'
  | 'jyeshtha'
  | 'mula'
  | 'purva-ashadha'
  | 'uttara-ashadha'
  | 'shravana'
  | 'dhanishta'
  | 'shatabhisha'
  | 'purva-bhadrapada'
  | 'uttara-bhadrapada'
  | 'revati';

/**
 * Dove cade una longitudine fra i ventisette nakshatra.
 *
 * Vale **solo su una longitudine siderale**: un nakshatra è un tratto di cielo
 * fra stelle fisse. Vedi `nakshatra.ts`.
 */
export interface NakshatraPosition {
  id: NakshatraId;
  /** Il nome in sanscrito, che non si traduce. */
  name: string;
  /** Posizione nei ventisette, 1-27. */
  index: number;
  /**
   * Il graha che lo regge, nell'ordine vimshottari.
   *
   * `nodo-nord` e `nodo-sud` vanno letti come Rahu e Ketu: in questo sistema
   * non sono punti calcolati ma graha con un nome. Vedi `GRAHA_NAMES`.
   */
  lord: BodyId;
  /** Il quarto di nakshatra, 1-4. Ognuno misura 3°20'. */
  pada: 1 | 2 | 3 | 4;
  /** Posizione dentro il nakshatra in gradi decimali, [0, 13.333). */
  degree: number;
}

/** Le due metà del mese lunare: crescente e calante. */
export type Paksha = 'shukla' | 'krishna';

/**
 * Il tithi: il giorno lunare, cioè dodici gradi di distanza fra Luna e Sole.
 *
 * Non dura un giorno solare. La Luna si allontana dal Sole di dodici gradi in
 * poco più di ventidue ore quando corre e in quasi ventisette quando è lenta,
 * quindi un tithi può cominciare e finire nello stesso giorno civile oppure
 * saltarne uno.
 */
export interface Tithi {
  /** Posizione nel mese lunare, 1-30. */
  index: number;
  /** Il nome in sanscrito. */
  name: string;
  paksha: Paksha;
  /** Posizione dentro il paksha, 1-15. */
  numberInPaksha: number;
  /** Quanto del tithi è già percorso, in gradi [0, 12). */
  degree: number;
}

/** Il karana: mezzo tithi, sei gradi di allontanamento. Sessanta in un mese. */
export interface Karana {
  /** Posizione nel mese lunare, 1-60. */
  index: number;
  name: string;
  /**
   * `false` per i quattro fissi, che nel mese compaiono una volta sola:
   * Kimstughna apre, Shakuni, Chatushpada e Naga chiudono. Gli altri sette
   * girano otto volte.
   */
  movable: boolean;
  /** Quanto del karana è già percorso, in gradi [0, 6). */
  degree: number;
}

/**
 * Lo yoga del panchanga: la **somma** delle due longitudini divisa in
 * ventisette.
 *
 * Non ha niente a che vedere con gli yoga combinatori di un tema, che sono
 * configurazioni fra pianeti. Qui è una delle cinque parti del calendario, e
 * la sua è l'unica formula che usi la somma invece della differenza — il che
 * la rende dipendente dall'ayanamsa il doppio delle altre.
 */
export interface PanchangaYoga {
  /** Posizione nei ventisette, 1-27. */
  index: number;
  name: string;
  /** Quanto dello yoga è già percorso, in gradi [0, 13.333). */
  degree: number;
}

/**
 * La vara: il giorno della settimana, che comincia **all'alba** e non a
 * mezzanotte.
 *
 * È la sola delle cinque parti che chieda un luogo, ed è la ragione per cui il
 * panchanga ne vuole uno. Fra mezzanotte e l'alba di lunedì regge ancora la
 * domenica — la stessa regola che governa le ore planetarie in `election.ts`.
 */
export interface Vara {
  /** Posizione nella settimana, 1-7, a partire da Ravivara (domenica). */
  index: number;
  name: string;
  /** Il graha che la regge. */
  lord: BodyId;
  /** L'alba da cui comincia, in UTC, ISO 8601. */
  sunrise: string;
  /** La stessa alba nel fuso richiesto. */
  local: string;
}

export interface PanchangaOptions {
  /**
   * La convenzione siderale. Default: `lahiri`.
   *
   * Lo zodiaco non è un'opzione: il panchanga è siderale per definizione, e
   * offrire una scelta che ha una risposta sola sarebbe una domanda finta.
   */
  ayanamsa?: AyanamsaId;
  /** Percorso della cartella con i file `.se1`. */
  ephemerisPath?: string;
}

/**
 * Il panchanga: le cinque parti in cui il calendario indiano divide un
 * istante.
 *
 * Tutto discende da due sole longitudini, e per questo stanno nel risultato:
 * chi vuole ricontrollare non deve fidarsi. Tithi e karana vengono dalla loro
 * **differenza**, e sono perciò indipendenti dall'ayanamsa — la scelta della
 * scuola non li tocca. Nakshatra e yoga no: il primo dipende da dove cade la
 * Luna, il secondo dalla somma, che l'ayanamsa sposta due volte.
 */
export interface Panchanga {
  input: LocalMoment;
  place: Place;
  time: ResolvedTime;
  ephemerisMode: EphemerisMode;
  /** Sempre siderale: il panchanga non esiste altrimenti. */
  zodiac: Zodiac;
  ayanamsa: AyanamsaInfo;
  /** Longitudine siderale del Sole, da cui si può rifare ogni conto. */
  sun: number;
  /** Longitudine siderale della Luna. */
  moon: number;
  tithi: Tithi;
  /** Assente alle latitudini polari, dove per settimane non c'è un'alba. */
  vara?: Vara;
  /** Il nakshatra della Luna, che è quello che si intende senza dire altro. */
  nakshatra: NakshatraPosition;
  yoga: PanchangaYoga;
  karana: Karana;
  /**
   * Avvertimenti non bloccanti: ora non indicata, alba non trovata, ripiego
   * sulle effemeridi Moshier.
   */
  warnings: string[];
}

/**
 * Quanti giorni valga un anno di dasha.
 *
 * Le scuole non concordano, e lo scarto non è trascurabile: su un mahadasha di
 * diciotto anni sono più di tre mesi, e cresce lungo la catena. `solare` è la
 * convenzione dei panchanga moderni e della maggior parte del software;
 * `savana` è l'anno tradizionale di trecentosessanta giorni, con cui i conti
 * tornano tondi.
 */
export type DashaYear = 'solare' | 'savana';

/**
 * Un periodo della catena vimshottari.
 *
 * Il livello dice di quale ordine sia: 1 mahadasha, 2 antardasha, 3
 * pratyantardasha. La struttura è annidata perché è annidato il sistema — ogni
 * periodo si divide nei nove secondo le stesse proporzioni.
 */
export interface DashaPeriod {
  /** Il graha che regge il periodo. `nodo-nord` è Rahu, `nodo-sud` è Ketu. */
  lord: BodyId;
  level: 1 | 2 | 3;
  /** Inizio in UTC, ISO 8601. */
  start: string;
  /** Fine in UTC: coincide con l'inizio del periodo successivo. */
  end: string;
  /** Gli stessi due istanti nel fuso della nascita. */
  local: { start: string; end: string };
  /** Durata in anni della convenzione scelta. */
  years: number;
  /** I sotto-periodi, se ne sono stati chiesti. */
  periods?: DashaPeriod[];
}

export interface VimshottariOptions {
  /**
   * Quanti ordini di periodo calcolare. Default 2.
   *
   * Un livello sono nove periodi, due sono ottantuno, tre settecentoventinove.
   * Il terzo si chiede quando serve: a un agente riempie il contesto, e a chi
   * legge un elenco di settecento righe non è un elenco.
   */
  levels?: 1 | 2 | 3;
  /** La lunghezza dell'anno. Default: `solare`. */
  yearLength?: DashaYear;
}

/**
 * La catena vimshottari a partire da una nascita.
 *
 * *Vimshottari* vuol dire centoventi, e tanti sono gli anni del ciclo intero.
 * Dove cominci lo dice il nakshatra della Luna alla nascita, e quanto ne resti
 * lo dice il punto esatto in cui la Luna si trovava dentro quel nakshatra: è
 * l'unico calcolo del motore in cui un secondo d'arco vale ore di calendario.
 */
export interface VimshottariDasha {
  /** Il nakshatra della Luna alla nascita: l'origine di tutta la catena. */
  nakshatra: NakshatraPosition;
  /**
   * Quanto restava del primo mahadasha alla nascita, in anni.
   *
   * È il numero che si riporta per primo in ogni lettura, e quello con cui si
   * verifica a colpo d'occhio che il conto sia stato fatto giusto.
   */
  balance: number;
  yearLength: DashaYear;
  /** Quanti giorni valga un anno, secondo la convenzione scelta. */
  daysPerYear: number;
  levels: 1 | 2 | 3;
  /** I nove mahadasha, dal primo in corso alla nascita. */
  periods: DashaPeriod[];
  /**
   * Avvertimenti non bloccanti: ora di nascita ignota, ripiego sulle
   * effemeridi Moshier.
   */
  warnings: string[];
}

/**
 * I varga calcolati.
 *
 * I sedici classici del BPHS, cap. 6.
 */
export type VargaId =
  | 'd1' | 'd2' | 'd3' | 'd4' | 'd7' | 'd9' | 'd10' | 'd12'
  | 'd16' | 'd20' | 'd24' | 'd27' | 'd30' | 'd40' | 'd45' | 'd60';

/** Le due metà di un segno nel D-2: la hora del Sole e quella della Luna. */
export type Hora = 'sole' | 'luna';

/**
 * Come si legge il D-2. `parashara` (predefinita) dà a ogni metà un luminare
 * e nessun segno, come il testo; `leone-cancro` manda la hora del Sole al
 * Leone e quella della Luna al Cancro, come l'uso corrente. Le altre quattro
 * sono letture moderne con un autore, ciascuna con un segno per metà, e i
 * conti del BPHS non le usano. Le fonti in `hora.ts`.
 */
export type HoraConvention =
  | 'parashara'
  | 'leone-cancro'
  | 'parivritti-dvaya'
  | 'kashinatha'
  | 'suprajarama'
  | 'uma-shambhu';

/** La convenzione della hora, come viaggia col risultato. */
export interface HoraConventionInfo {
  id: HoraConvention;
  name: string;
  /** L'opera e la pagina, o perché una pagina non c'è. */
  source: string;
}

/** Quello che ogni carta divisionale porta, abbia segni o no. */
interface VargaChartBase {
  varga: VargaId;
  /** Il nome sanscrito. */
  name: string;
  /**
   * Il numero che dà il nome al varga, **non sempre un conto di parti uguali**.
   * Il trimsamsa si chiama D-30 ma divide il segno in cinque tratti disuguali:
   * quanto e come si divida lo dice `rule`, che è l'unica a poterlo dire per
   * tutti.
   */
  divisions: number;
  /** La regola in una riga. Nel D-2 è quella della convenzione. */
  rule: string;
  /** Solo nel D-2: la convenzione con cui è stato letto. */
  convention?: HoraConventionInfo;
  /**
   * Solo nei varga fini (D-24, D-27, D-40, D-45, D-60): di quanti minuti l'ora di nascita
   * dovrebbe sbagliare perché lagna e Luna cambino segno, calcolato su questa
   * carta. Un segno di una parte da mezzo grado sembra preciso quanto gli
   * altri, e non lo è.
   */
  warnings?: string[];
}

/**
 * Una carta divisionale: gli stessi corpi in segni diversi.
 *
 * Porta con sé **la regola che l'ha prodotta**. Fra le sedici divisioni le
 * scuole divergono su più d'una, e un segno consegnato senza la regola non si
 * può ricontrollare: chi ne segue un'altra deve vederlo subito, invece di
 * scoprirlo confrontando i numeri con un altro programma.
 */
export interface SignVargaChart extends VargaChartBase {
  /** Ogni corpo ha un segno: è la forma di tutti i varga tranne il D-2 di Parashara. */
  kind: 'segni';
  positions: {
    id: BodyId;
    name: string;
    sign: ZodiacSign;
    /**
     * Se il graha era retrogrado, cioè *vakri*.
     *
     * Si porta in ogni varga e non solo nella rashi, ed è lecito perché
     * **la retrogradazione è del corpo e non del segno**: è il moto apparente
     * a quell'istante, e il varga non lo tocca — sposta dove il corpo cade,
     * non come si muove. Il grado invece resta fuori, e per la ragione
     * opposta: dentro un segno di varga non è definito. Il trimsamsa divide
     * il segno in cinque tratti disuguali, e là un «grado nel segno» non
     * esiste in nessun senso che si possa ricalcolare.
     */
    retrograde: boolean;
    /**
     * Solo per i sette graha dal Sole a Saturno: in quali dei loro segni di
     * uccha, moolatrikona, proprio e neecha cade il segno del varga, **per
     * segno e tutte insieme** (vuoto se nessuno). Non è la dignità della
     * rashi, che il grado decide: qui il grado non c'è. Vedi
     * `parasharaSignDignities` e `dignitySource`.
     */
    dignitySigns?: ParasharaDignity[];
    /** Solo nel D-60: in quale dei sessanta mezzi gradi cade, e il suo nome. */
    shashtiamsa?: Shashtiamsa;
  }[];
  /** Il segno del lagna. Assente se il tema non ha un Ascendente. */
  ascendant?: ZodiacSign;
  /** Solo nel D-60, e solo se c'è il lagna: il suo shashtiamsa. */
  ascendantShashtiamsa?: Shashtiamsa;
  /** Da dove vengono `dignitySigns`, e che cosa non sono. */
  dignitySource: string;
  /** Solo nel D-60: da dove vengono i nomi di `shashtiamsa`, e che cosa manca. */
  shashtiamsaSource?: string;
  /**
   * Gli arudha dei nove graha contati coi segni di questo varga, secondo
   * Narasimha Rao (§9.5). Dove la catena guarda il grado, che qui non c'è,
   * possono restare indeterminati; `source` lo dice.
   */
  grahaArudhas: GrahaArudhas;
}

/**
 * Uno dei sessanta mezzi gradi del segno, col nome che BPHS 6.34-40 gli dà.
 *
 * Il nome è un nome e basta. Il verso 41 divide i sessanta in benefici e
 * malefici, e la tavola di Santhanam (pp. 84-86) segna ciascuno con una (B) o
 * una (M): quel giudizio resta fuori, come le altre letture sull'effetto, e
 * `shashtiamsaSource` lo dice.
 */
export interface Shashtiamsa {
  /** Il mezzo grado del segno, da 1 (0°-0°30') a 60 (29°30'-30°). */
  part: number;
  /**
   * Il numero del nome nella lista del verso, da 1 (Ghora) a 60 (Chandra
   * Rekha). Nei segni dispari è `part`; nei pari la lista si legge al
   * rovescio (6.40), e vale 61 − `part`.
   */
  number: number;
  /** Il nome, nella grafia della tavola di Santhanam. */
  name: string;
}

/**
 * Il D-2 secondo Parashara: ogni corpo nella hora di un luminare, senza segno.
 *
 * È un altro tipo e non un `SignVargaChart` con il segno facoltativo perché
 * chi riceve una carta divisionale la deve poter disegnare o impaginare senza
 * scoprire a metà che un segno manca: il discriminante `kind` lo dice prima.
 */
export interface HoraVargaChart extends VargaChartBase {
  kind: 'signori';
  varga: 'd2';
  convention: HoraConventionInfo;
  positions: {
    id: BodyId;
    name: string;
    hora: Hora;
    retrograde: boolean;
  }[];
  /** La hora del lagna. Assente se il tema non ha un Ascendente. */
  ascendant?: Hora;
}

/** Una carta divisionale: con i segni, o il D-2 con i soli luminari. */
export type VargaChart = SignVargaChart | HoraVargaChart;

/**
 * Se e come i nodi gettino drishti.
 *
 * `nessuna` è la forma classica: Parashara la drishti la dà ai sette, e quella
 * dei nodi è aggiunta più tarda. `gioviana` dà a Rahu e Ketu la quinta, la
 * settima e la nona, come Giove. È una divergenza fra scuole, quindi si dichiara
 * invece di sceglierla in silenzio.
 */
export type NodeDrishti = 'nessuna' | 'gioviana';

/** Chi può ricevere uno sguardo: un graha, oppure il lagna. */
export type DrishtiTarget = BodyId | 'lagna';

/**
 * Uno sguardo fra due punti del tema.
 *
 * **I due lati non si scambiano.** Le case si contano sempre in avanti nello
 * zodiaco, quindi che `from` guardi `to` non implica il contrario: Saturno in
 * Ariete guarda i Gemelli come terza casa, ma dai Gemelli l'Ariete è
 * l'undicesimo, e l'undicesima non la guarda nessuno.
 */
export interface Drishti {
  from: BodyId;
  fromName: string;
  to: DrishtiTarget;
  toName: string;
  /**
   * A quante case di distanza, contando il segno di chi guarda come prima.
   * La settima è di tutti; la terza e la decima di Saturno, la quarta e
   * l'ottava di Marte, la quinta e la nona di Giove.
   */
  house: number;
}

export interface DrishtiOptions {
  /** Default: `nessuna`, che è la forma classica. */
  nodes?: NodeDrishti;
}

/**
 * Gli sguardi di un tema, sui graha e sui segni.
 *
 * I segni ci sono tutti, anche quelli disabitati: una drishti che cade su una
 * casa vuota è un dato che questo sistema usa, e tenerla fuori sarebbe il
 * motore che decide che cosa conti.
 */
export interface DrishtiChart {
  /** La convenzione applicata ai nodi, che viaggia col risultato. */
  nodes: NodeDrishti;
  /** Gli sguardi che trovano qualcuno: un graha o il lagna. */
  aspects: Drishti[];
  /** I segni bersagliati da ciascun graha, occupati o no. */
  signs: { from: BodyId; fromName: string; house: number; sign: ZodiacSign }[];
  /** Avvertimenti non bloccanti: tema senza ora, e quindi senza lagna. */
  warnings: string[];
}

/**
 * Che cosa mostrare della carta impaginata.
 */
export interface ChartFormatOptions {
  /**
   * Aspetti, distribuzione e Parte di Fortuna. Default `true`.
   *
   * Sono **letture occidentali** degli stessi gradi: aspetti misurati a
   * orbite, un conteggio per elementi e modalità, una sorte di origine
   * ellenistica. In un tema vedico non sono un di più ma un errore di
   * categoria — là gli aspetti si contano a segni interi e gli elementi non si
   * contano affatto — e chi le trovasse stampate le userebbe.
   */
  westernSections?: boolean;
}

/** Le scuole delle dignità che si possono chiedere per nome. */
export type DignitySchool = 'lilly' | 'tolomeo' | 'bonatti' | 'valente';

/** Le due convenzioni dei domicili, che il tema porta affiancate. */
export type DomicileScheme = 'tradizionale' | 'moderno';

/** Che cosa un corpo ha nel segno in cui sta, nelle tavole comuni. */
export type Dignity = 'domicilio' | 'esaltazione' | 'esilio' | 'caduta';

/**
 * La dignità per cui un pianeta ne riceve un altro. Le ultime tre vengono
 * solo dal pacchetto di Lilly, a richiesta.
 */
export type ReceptionDignity = 'domicilio' | 'esaltazione' | 'triplicita' | 'termine' | 'faccia';

/** `receiver` riceve `received`: il secondo sta in una dignità del primo. */
export interface Reception {
  receiver: BodyId;
  received: BodyId;
  by: ReceptionDignity[];
}

/** Due pianeti ciascuno nella dignità dell'altro. */
export interface MutualReception {
  /** I due pianeti, nell'ordine dei corpi del tema. */
  bodies: [BodyId, BodyId];
  /** Per che cosa il primo riceve il secondo. */
  firstReceives: ReceptionDignity[];
  /** Per che cosa il secondo riceve il primo. */
  secondReceives: ReceptionDignity[];
}

/** Le voci della tavola di Lilly, dignità e debilità. */
export type LillyDignity =
  | 'domicilio'
  | 'esaltazione'
  | 'triplicita'
  | 'termine'
  | 'faccia'
  | 'esilio'
  | 'caduta';

/** Chi ha autorità su un grado dello zodiaco secondo Lilly, dignità per dignità. */
export interface LillyRulers {
  domicilio: BodyId;
  /** Il corpo esaltato nel segno, se ce n'è uno: in Leone, Scorpione e Acquario nessuno. */
  esaltazione?: BodyId;
  /** Assente senza la setta, fuori dall'acqua. */
  triplicita?: BodyId;
  termine: BodyId;
  faccia: BodyId;
}

/**
 * Le voci di Tolomeo, *Tetrabiblos* I.17-21: quattro dignità e una debilità.
 * Niente faccia ed esilio, che Tolomeo non ha.
 */
export type PtolemyDignity = 'domicilio' | 'esaltazione' | 'triplicita' | 'termine' | 'caduta';

/** Chi ha autorità su un grado dello zodiaco secondo Tolomeo. */
export interface PtolemyRulers {
  domicilio: BodyId;
  /** Il pianeta esaltato nel segno, se ce n'è uno: in Leone, Scorpione e Acquario nessuno. */
  esaltazione?: BodyId;
  /**
   * I signori del triangolo, tutti, nell'ordine di I.18: due, e tre
   * nell'acqua (Marte, la Luna e Venere). Sono signori a prescindere dalla
   * setta.
   */
  triplicita: BodyId[];
  /**
   * Chi governa il triangolo nella setta del tema: uno, e nell'acqua Marte
   * col co-reggente della setta. Assente senza la setta.
   */
  triplicitaDiSetta?: BodyId[];
  termine: BodyId;
}

/**
 * Le voci di Bonatti, *Decem tractatus* II, parte 2: le cinque dignità del
 * cap. V e le due debilità dei capp. VII e X.
 */
export type BonattiDignity =
  | 'domicilio'
  | 'esaltazione'
  | 'triplicita'
  | 'termine'
  | 'faccia'
  | 'esilio'
  | 'caduta';

/** Chi ha autorità su un grado dello zodiaco secondo Bonatti. */
export interface BonattiRulers {
  domicilio: BodyId;
  /** Il corpo esaltato nel segno, Nodi compresi, se ce n'è uno: in Leone, Scorpione e Acquario nessuno. */
  esaltazione?: BodyId;
  /**
   * I tre signori della triplicità (cap. XI): di giorno, di notte e il
   * partecipe, che lo è in tutte e due le sette. Sono signori a prescindere
   * dalla setta.
   */
  triplicita: { diurno: BodyId; notturno: BodyId; partecipe: BodyId };
  /** Chi governa la triplicità nella setta del tema. Assente senza la setta. */
  triplicitaDiSetta?: BodyId;
  termine: BodyId;
  faccia: BodyId;
}

/**
 * Le voci di Valente, *Anthologiae* I.2-3, II.1, III.4: quattro dignità e
 * una debilità. Niente faccia ed esilio, che in Valente non si sono trovati.
 */
export type ValensDignity = 'domicilio' | 'esaltazione' | 'triplicita' | 'termine' | 'caduta';

/** Chi ha autorità su un grado dello zodiaco secondo Valente. */
export interface ValensRulers {
  domicilio: BodyId;
  /** Il pianeta esaltato nel segno, se ce n'è uno: in Gemelli, Leone, Scorpione, Sagittario e Acquario nessuno. */
  esaltazione?: BodyId;
  /**
   * I tre signori del triangolo (II.1): chi presiede di giorno, chi di notte,
   * e il terzo, che coopera in tutte e due. Sono signori a prescindere dalla
   * setta.
   */
  triplicita: { diurno: BodyId; notturno: BodyId; terzo: BodyId };
  /** I tre nell'ordine della setta del tema: chi presiede, il secondo, il terzo. Assente senza la setta. */
  triplicitaDiSetta?: BodyId[];
  termine: BodyId;
}

/** Le tre stelle fisse della tavola di Lilly, p. 115. */
export type LillyStar = 'regolo' | 'spica' | 'algol';

/**
 * Le voci della tavola delle fortezze e debilità di Lilly, p. 115. Una voce
 * può stare da una parte o dall'altra secondo il pianeta: `orientale` è una
 * fortezza per Saturno, Giove e Marte e una debilità per Venere e Mercurio,
 * e `casa` dipende dalla casa.
 */
export type LillyScoreItem =
  | 'domicilio'
  | 'ricezione-domicilio'
  | 'esaltazione'
  | 'ricezione-esaltazione'
  | 'triplicita'
  | 'termine'
  | 'faccia'
  | 'esilio'
  | 'caduta'
  | 'peregrino'
  | 'casa'
  | 'diretto'
  | 'retrogrado'
  | 'veloce'
  | 'lento'
  | 'orientale'
  | 'occidentale'
  | 'crescente'
  | 'calante'
  | 'libero'
  | 'cazimi'
  | 'combusto'
  | 'sotto-i-raggi'
  | 'partile'
  | 'assediato'
  | 'segno'
  | 'aspetto'
  | 'stella';

/** Una riga del conto di Lilly: la voce, i punti e con che cosa. */
export interface LillyScoreRow {
  item: LillyScoreItem;
  /** Sempre positivi, come li stampa Lilly: è la colonna a dire il verso. */
  points: number;
  /** Per `casa`. */
  house?: number;
  /** Per `partile`: l'aspetto e il corpo. Per le ricezioni: l'altro pianeta. */
  aspect?: AspectId;
  with?: BodyId;
  /** Per `stella`. */
  star?: LillyStar;
  /** Per `segno`, nel conto della Parte di Fortuna. */
  sign?: ZodiacSign;
}

/**
 * La Parte di Fortuna nel conto di Lilly: la tavola di p. 145, applicata come
 * a p. 180. La Parte è quella di p. 144, Ascendente più Luna meno Sole di
 * giorno e di notte («Ptolomie, day and night takes it as above directed»),
 * a prescindere dalla formula che il tema usa per la sua.
 */
export interface LillyFortuneConditions {
  longitude: number;
  sign: ZodiacSign;
  /** Con la regola dei cinque gradi, come i pianeti. */
  house: number;
  /** Distanza dal Sole e lo stato, con le soglie dei pianeti (p. 113). */
  sun: { distance: number; state: LillySolarState };
  score: {
    fortitudes: LillyScoreRow[];
    debilities: LillyScoreRow[];
    totals: { fortitudes: number; debilities: number; net: number };
  };
}

/** Il rapporto col Sole secondo Lilly, p. 113. */
export type LillySolarState = 'cazimi' | 'combusto' | 'sotto-i-raggi' | 'libero';

/** Le condizioni di uno dei sette pianeti a un istante, e il suo conto. */
export interface LillyBodyConditions {
  id: BodyId;
  name: string;
  /**
   * La casa secondo Lilly: quella del tema, salvo che il pianeta stia entro
   * cinque gradi dalla cuspide successiva (p. 33). Assente senza l'ora.
   */
  house?: number;
  angularity?: 'angolare' | 'succedente' | 'cadente';
  /** Distanza dal Sole in gradi e lo stato che ne segue. Assente per il Sole. */
  sun?: { distance: number; state: LillySolarState };
  /**
   * Orientale o occidentale del Sole, p. 114. Per la Luna occidentale vuol
   * dire crescente. Assente per il Sole.
   */
  phase?: 'orientale' | 'occidentale';
  motion: {
    /** Gradi al giorno, col segno: negativa se retrogrado. */
    speed: number;
    /** Il moto medio di Lilly, gradi al giorno (libro I, pp. 57-80). */
    mean: number;
    pace: 'veloce' | 'lento' | 'medio';
    direction: 'diretto' | 'retrogrado';
  };
  /** Nessuna delle cinque dignità essenziali nel grado, p. 112. */
  peregrine: boolean;
  /** Fra Saturno e Marte nello stesso segno, p. 114. */
  besieged: boolean;
  /** Longitudine dell'antiscion (p. 90) e del contrantiscion. */
  antiscion: number;
  contrantiscion: number;
  /**
   * Il conto della tavola di p. 115, riga per riga, e le tre somme come le fa
   * Lilly a pp. 178-181: le fortezze, le debilità, e la differenza.
   */
  score: {
    fortitudes: LillyScoreRow[];
    debilities: LillyScoreRow[];
    totals: { fortitudes: number; debilities: number; net: number };
  };
}

/**
 * Le condizioni di un istante secondo Lilly, e il suo punteggio. Vedi
 * `condizioni-lilly.ts`.
 */
export interface LillyConditions {
  source: string;
  /**
   * Le letture fatte dove il testo lascia una scelta, una riga ciascuna:
   * chi legge Lilly in un altro modo sa che cosa rifare.
   */
  readings: string[];
  /** L'ora planetaria. Assente senza l'ora o dove il Sole non sorge. */
  hour?: PlanetaryHourAt;
  /** I gradi dell'Ascendente che Lilly sconsiglia di giudicare, p. 122. */
  ascendant?: { signDegree: number; early: boolean; late: boolean };
  /** La Luna fra 15° della Bilancia e 15° dello Scorpione, p. 122. */
  moonInViaCombusta?: boolean;
  /** Le longitudini delle tre stelle all'istante, se il catalogo c'è. */
  stars?: Record<LillyStar, number>;
  /** Le voci del conto che non si sono potute calcolare, e perché. */
  missing: string[];
  bodies: LillyBodyConditions[];
  /** La Parte di Fortuna e il suo conto, p. 145. Assente senza l'ora. */
  partOfFortune?: LillyFortuneConditions;
}

/**
 * Le dignità occidentali di un tema tropicale. Vedi `dignita.ts`,
 * `dignita-lilly.ts`, `dignita-tolomeo.ts`, `dignita-bonatti.ts` e
 * `dignita-valente.ts`.
 *
 * Come per le altre dottrine, ogni blocco porta la sua fonte, e dove le scuole
 * divergono ci sono tutte e due: i domicili in due colonne mai fuse, e le
 * tavole di una scuola solo se la si è chiesta per nome.
 */
export interface WesternDignities {
  /** Da dove vengono le tavole comuni, una riga per tavola. */
  sources: {
    domicili: Record<DomicileScheme, string>;
    esilio: string;
    esaltazione: string;
  };
  /** Il signore di ciascun segno, nelle due convenzioni. */
  signLords: Record<ZodiacSign, Record<DomicileScheme, BodyId>>;
  /**
   * Ogni corpo del tema con le sue dignità nelle due convenzioni. Esaltazione
   * e caduta stanno solo nella tradizionale, l'unica che ne abbia una tavola
   * con un autore.
   */
  bodies: {
    id: BodyId;
    name: string;
    sign: ZodiacSign;
    dignities: Record<DomicileScheme, Dignity[]>;
  }[];
  /**
   * Le ricezioni fra i sette pianeti, secondo Lilly. `counted` dice per quali
   * dignità sono state contate, come `Distribution.counted`: senza la scuola,
   * con Tolomeo, che la ricezione non la definisce, con Bonatti, che la
   * definisce su un'applicazione, e con Valente, domicilio ed esaltazione;
   * con Lilly, tutte e cinque.
   */
  receptions: {
    source: string;
    counted: ReceptionDignity[];
    single: Reception[];
    mutual: MutualReception[];
  };
  /** Il pacchetto di Lilly, solo se chiesto con `dignitySchool: 'lilly'`. */
  lilly?: {
    school: 'lilly';
    source: string;
    /**
     * Per ogni corpo, i signori del grado in cui sta e le dignità che ha lì.
     * I signori sono un fatto del grado e ci sono per tutti; le dignità solo
     * per i sette pianeti e i Nodi, gli unici che la tavola nomina.
     */
    bodies: {
      id: BodyId;
      name: string;
      rulers: LillyRulers;
      dignities: LillyDignity[];
    }[];
    /**
     * Le condizioni accidentali dei sette e il punteggio di p. 115. Senza
     * l'ora mancano le case, e con loro le righe che ne dipendono: lo dice
     * `missing`.
     */
    conditions: LillyConditions;
  };
  /** Il pacchetto di Tolomeo, solo se chiesto con `dignitySchool: 'tolomeo'`. */
  tolomeo?: {
    school: 'tolomeo';
    source: string;
    /** La tavola dei termini seguita, e le sue varianti. */
    termsSource: string;
    /**
     * Per ogni corpo, i signori del grado in cui sta e le dignità che ha lì.
     * I signori ci sono per tutti; le dignità solo per i sette pianeti.
     */
    bodies: {
      id: BodyId;
      name: string;
      rulers: PtolemyRulers;
      dignities: PtolemyDignity[];
    }[];
  };
  /** Il pacchetto di Bonatti, solo se chiesto con `dignitySchool: 'bonatti'`. */
  bonatti?: {
    school: 'bonatti';
    source: string;
    /** La tavola dei termini seguita, e come si rapporta a quella di Tolomeo. */
    termsSource: string;
    /**
     * Per ogni corpo, i signori del grado in cui sta e le dignità che ha lì.
     * I signori ci sono per tutti; le dignità per i sette pianeti, e per i
     * Nodi solo esaltazione e caduta.
     */
    bodies: {
      id: BodyId;
      name: string;
      rulers: BonattiRulers;
      dignities: BonattiDignity[];
    }[];
  };
  /** Il pacchetto di Valente, solo se chiesto con `dignitySchool: 'valente'`. */
  valente?: {
    school: 'valente';
    source: string;
    /** La tavola dei termini seguita, e dove il testo di Valente se ne scosta. */
    termsSource: string;
    /**
     * Per ogni corpo, i signori del grado in cui sta e le dignità che ha lì.
     * I signori ci sono per tutti; le dignità solo per i sette pianeti.
     */
    bodies: {
      id: BodyId;
      name: string;
      rulers: ValensRulers;
      dignities: ValensDignity[];
    }[];
  };
}

/**
 * Che cosa mettere nel tema vedico.
 *
 * I predefiniti sono il taglio che serve a una lettura: due ordini di dasha e
 * il solo navamsa. Il terzo ordine sono settecentoventinove righe e le altre
 * carte divisionali riguardano un'area ciascuna: chi le vuole le chiede.
 */
export interface JyotishaOptions {
  /** Default: due ordini. */
  dasha?: VimshottariOptions;
  /** Default: il solo `d9`. */
  vargas?: VargaId[];
  /** Come leggere il D-2, se c'è fra i `vargas`. Default: `parashara`. */
  hora?: HoraConvention;
  /** Default: la forma classica, senza sguardi dei nodi. */
  drishti?: DrishtiOptions;
  /**
   * Dove cercare le effemeridi per l'alba delle avastha. Default: quello di
   * `initEphemeris`.
   */
  ephemerisPath?: string;
}

/**
 * La dignità di un graha nel suo segno secondo Parashara: esaltazione,
 * moolatrikona (il tratto migliore di uno dei segni propri), segno proprio,
 * debilitazione. Vedi `dignita-parashara.ts`.
 */
export type ParasharaDignity = 'uccha' | 'moolatrikona' | 'swakshetra' | 'neecha';

/** Le dignità di un tema vedico, con la scuola e la fonte che le assegnano. */
export interface ParasharaDignities {
  school: 'parashara';
  /** La fonte con i versi e le pagine, come la regola di un varga. */
  source: string;
  /** Il signore di ciascun segno, dalla stessa fonte. */
  signLords: Record<ZodiacSign, BodyId>;
  /**
   * I sette graha dal Sole a Saturno che la carta contiene, poi Rahu e Ketu.
   * Per i sette vale 3.49-54, col grado; per i nodi 47.34-36, solo per segno.
   */
  grahas: {
    id: BodyId;
    name: string;
    sign: ZodiacSign;
    signDegree: number;
    /**
     * `null` quando il graha non ha nessuna delle quattro nel suo segno, e
     * sempre per Rahu e Ketu: per loro vedi `signDignities`.
     */
    dignity: ParasharaDignity | null;
    /**
     * Solo per Rahu e Ketu: in quali dei loro segni di BPHS 47.34-36 cade il
     * nodo, tutte le corrispondenze nell'ordine del verso (uccha,
     * moolatrikona, segno proprio). Il testo non dà gradi né tratti, quindi
     * una sola dignità non si può scegliere: per Ketu lo Scorpione è insieme
     * uccha e segno proprio. Neecha non c'è, perché il verso non la dà.
     * Vuoto fuori da quei segni.
     */
    signDignities?: ParasharaDignity[];
    /**
     * Solo con uccha e neecha: il grado del segno dove l'esaltazione, o la
     * debilitazione, è più profonda. Il testo lo dà come numero intero e non
     * dice se intenda il punto o il grado che vi finisce.
     */
    deepestDegree?: number;
  }[];
}

/**
 * La relazione fra due graha secondo BPHS 3.55-58, coi nomi sanscriti.
 *
 * `Maitri` è quella naturale (*naisargika*, 3.55) e temporanea
 * (*tatkalika*, 3.56); `CompoundMaitri` la composta (*panchadha*, 3.57-58),
 * che ha cinque gradi.
 */
export type Maitri = 'mitra' | 'sama' | 'shatru';
export type CompoundMaitri = 'adhimitra' | 'mitra' | 'sama' | 'shatru' | 'adhishatru';

/**
 * Le relazioni fra i sette graha di un tema, BPHS 3.55-58.
 *
 * **Hanno un verso**: che il Sole sia amico della Luna non dice niente di
 * come la Luna stia col Sole. La naturale non cambia da un tema all'altro e
 * si ricava dalla regola di 3.55, non da una tavola; la temporanea dipende
 * dai segni che i due occupano nella rashi. Rahu e Ketu non ci sono: il
 * verso non li nomina.
 */
export interface GrahaRelationships {
  /** Versi, pagine e regole, in una riga. */
  source: string;
  pairs: {
    from: BodyId;
    to: BodyId;
    naisargika: Maitri;
    /** `mitra` o `shatru`: la temporanea non ha il grado di mezzo. */
    tatkalika: Exclude<Maitri, 'sama'>;
    panchadha: CompoundMaitri;
  }[];
}

/**
 * Gli arudha (pada) dei dodici bhava, BPHS 29.1-5.
 *
 * Per lo Scorpione e l'Acquario, che hanno due signori (46.157: Marte e
 * Ketu, Saturno e Rahu), si conta dal più forte (29.7), scelto con la
 * procedura di 46.158-166; `lordChoice` dice quale regola ha deciso.
 */
export interface Arudhas {
  /** Versi, pagine e la lettura seguita per i due signori, in una riga. */
  source: string;
  padas: {
    /** Il bhava, 1-12 dal lagna. */
    bhava: number;
    /** Il nome del pada, come in Santhanam a p. 295: Lagna Pada, Dhana Pada… */
    name: string;
    /** Il segno del bhava. */
    sign: ZodiacSign;
    /** Il signore da cui si è contato. */
    lord: BodyId;
    /** Solo per Scorpione e Acquario: perché quel signore e non l'altro. */
    lordChoice?: string;
    /** Il segno del pada. */
    pada: ZodiacSign;
  }[];
}

/** I quattro schemi di BPHS 6.42 e 7.17-20, dal più breve al completo. */
export type VargaScheme = 'shadvarga' | 'saptavarga' | 'dashavarga' | 'shodashavarga';

/**
 * Il vimshopaka, la forza su venti punti di BPHS 7.17-27.
 *
 * In ogni varga il graha prende un punteggio (*varga viswa*, 7.24-25): 20
 * se il segno è suo, poi secondo la relazione composta col signore del
 * segno, da 18 (adhimitra) a 5 (adhishatru). Lo si moltiplica per il peso
 * del varga nello schema (*swaviswa*, 7.17-23) e si divide per 20 (7.26):
 * la somma è la forza nello schema, al più 20. Le fasce di 7.26-27 («sotto
 * 5 non dà buoni risultati»…) sono un giudizio, e non sono riportate.
 */
export interface Vimshopaka {
  /** Versi, pagine e la tavola dei pesi seguita, in una riga. */
  source: string;
  /** I pesi di ciascun varga per schema, come nella tavola di Santhanam a p. 97. */
  weights: Record<VargaScheme, Partial<Record<VargaId, number>>>;
  grahas: {
    id: BodyId;
    name: string;
    /** Un elemento per ciascuno dei sedici varga, nell'ordine di `VARGAS`. */
    vargas: {
      varga: VargaId;
      /** Il signore del segno del varga, o del luminare nella hora di Parashara. */
      lord: BodyId;
      /** `swakshetra` se il graha è lui stesso il signore. */
      relation: CompoundMaitri | 'swakshetra';
      /** Il varga viswa: 20, 18, 15, 10, 7 o 5. */
      viswa: number;
    }[];
    /** La forza in ciascuno schema, su 20. */
    schemes: { scheme: VargaScheme; points: number }[];
  }[];
}

/**
 * Perché un varga è buono per un graha, secondo BPHS 6.52 letto da
 * Santhanam: il segno di uccha, di moolatrikona, proprio, un segno dei
 * signori dei kendra dall'arudha lagna; `hora` per il D-2 di Parashara, che
 * non ha segni e segue la nota di Santhanam a p. 90.
 */
export type GoodVargaReason = 'uccha' | 'moolatrikona' | 'swakshetra' | 'arudha' | 'hora';

/**
 * Un graha vicino al Sole secondo il *Surya Siddhanta* IX.6-9 e X.1: la
 * distanza in longitudine e il limite sotto cui il testo lo dice invisibile.
 */
export interface CombustionState {
  id: BodyId;
  name: string;
  /** Distanza dal Sole in longitudine, gradi, [0, 180]. */
  distance: number;
  /**
   * Distanza dal Sole in gradi di tempo (*kālāṃśa*, SS IX.4-5): la
   * differenza di ascensione obliqua all'orizzonte del luogo. Assente oltre
   * i circoli polari, dove uno dei due può non sorgere.
   */
  timeDegrees?: number;
  /** L'orizzonte a cui si misura: est se il graha è indietro rispetto al Sole, ovest se è avanti. */
  horizon?: 'est' | 'ovest';
  /** Quale delle due distanze ha deciso: i gradi di tempo, o la longitudine dove quelli mancano. */
  measure: 'gradi-di-tempo' | 'longitudine';
  /** Il limite del testo per questo graha, nel suo moto. */
  limit: number;
  /** Il moto che ha deciso il limite: conta solo per Mercurio e Venere. */
  retrograde: boolean;
  /** La distanza di `measure` sotto `limit`. */
  combust: boolean;
}

/**
 * Due dei cinque *tārāgraha* a meno di un grado l'uno dall'altro: la guerra
 * del *Surya Siddhanta* VII.19, col vincitore di BPHS 79.9.
 */
export interface PlanetaryWar {
  between: [BodyId, BodyId];
  /** Distanza angolare fra i due sulla sfera, in gradi. */
  separation: number;
  /** Le latitudini eclittiche dei due, nello stesso ordine di `between`. */
  latitudes: [number, number];
  /** `null` quando la regola non decide (latitudini uguali). */
  victor: BodyId | null;
  defeated: BodyId | null;
  /** Quale delle due regole ha deciso. */
  rule: string;
}

/** Le dodici avastha di BPHS 45.30-31, nell'ordine del verso e con la grafia di Santhanam. */
export type ShayanadiAvastha =
  | 'Sayana'
  | 'Upavesana'
  | 'Netrapani'
  | 'Prakasana'
  | 'Gamana'
  | 'Aagamana'
  | 'Sabha'
  | 'Agama'
  | 'Bhojana'
  | 'Nrityalipsa'
  | 'Kautuka'
  | 'Nidra';

/**
 * Le avastha *śayanādi* dei nove graha, BPHS 45.30-33 con la formula e le
 * letture di Santhanam (vol. I, pp. 454-455). I fattori comuni stanno qui,
 * quelli di ciascun graha nella sua riga: chi conta diversamente rifà la
 * somma.
 */
export interface ShayanadiAvasthas {
  source: string;
  /** L'alba da cui si contano le ghati, ISO UTC: lembo superiore e rifrazione. */
  sunrise: string;
  /** Ghati trascorse dall'alba, decimali (una ghati = 24 minuti). */
  ghatisSinceSunrise: number;
  /** g: la ghati in corso, come nell'esempio di Santhanam (30;33 → 31). */
  ghati: number;
  /** a: il nakshatra della Luna, 1-27. */
  moonNakshatra: number;
  /** r: il segno del lagna da Ariete, 1-12. */
  lagnaSign: number;
  grahas: {
    id: BodyId;
    name: string;
    /** s, il nakshatra del graha (1-27); p, il suo numero (Sole 1 … Ketu 9); n, il navamsa nel segno (1-9). */
    factors: { s: number; p: number; n: number };
    /** s × p × n + a + g + r. */
    total: number;
    /** Il resto della divisione per dodici, con lo zero letto come dodici. */
    index: number;
    avastha: ShayanadiAvastha;
  }[];
}

/**
 * Gli arudha dei nove graha secondo Narasimha Rao (2000), §9.5: un'altra
 * scuola rispetto agli arudha dei bhava, che sono del BPHS. Vedi
 * `arudha-graha.ts`.
 */
export interface GrahaArudhas {
  source: string;
  grahas: {
    id: BodyId;
    name: string;
    sign: ZodiacSign;
    /**
     * Il segno proprio da cui si conta: per i graha con due segni, il più
     * forte. Assente solo nei varga, quando la scelta resta indeterminata.
     */
    ownSign?: ZodiacSign;
    /** Solo per i graha con due segni: la regola di §15.5.2 che ha scelto, o dove si è fermata. */
    ownSignRule?: string;
    /**
     * L'arudha. Assente solo nei varga, quando il segno proprio è
     * indeterminato: `ownSignRule` dice perché.
     */
    pada?: ZodiacSign;
    /** Se è scattata l'eccezione del 1° o del 7°, e si è preso il 10°. Assente con `pada`. */
    exception?: boolean;
  }[];
}

/**
 * Le condizioni che BPHS 6.53 nomina, calcolate come dati: combustione,
 * guerra planetaria, avastha. Il motore non dice che cosa annullino: il
 * conto dei varga buoni resta quello che è.
 */
export interface GrahaStates {
  combustion: { source: string; grahas: CombustionState[] };
  wars: { source: string; pairs: PlanetaryWar[] };
  /** Assente senza ora di nascita, o dove quel giorno il Sole non sorge. */
  avasthas?: ShayanadiAvasthas;
}

/**
 * I varga buoni dei sette graha e il loro conto per schema, con il nome che
 * BPHS 6.43-51 dà a ciascun conto.
 *
 * Il motore conta e nomina; che cosa il nome prometta non lo dice. Ogni
 * scelta di lettura sta in `source`, e quelle del testo che il motore non sa
 * verificare (6.53) sono dichiarate, non taciute.
 */
export interface GoodVargas {
  /** Versi, pagine e scelte di lettura, in una riga. */
  source: string;
  /** L'arudha lagna (pada lagna) di BPHS 29.1-5, e la regola che l'ha dato. */
  arudhaLagna: ZodiacSign;
  arudhaRule: string;
  /** I signori dei quattro kendra contati dall'arudha lagna, senza ripetizioni. */
  kendraLords: BodyId[];
  /** I segni di quei signori: buoni per ogni graha. */
  arudhaSigns: ZodiacSign[];
  /** Come è stata contata la hora: la convenzione e la regola che ne segue. */
  hora: { convention: HoraConvention; rule: string };
  /**
   * BPHS 6.53: i varga buoni di un graha combusto, sconfitto, in neecha,
   * debole o in avastha come shayana «distruggono gli yoga». Letto come un
   * giudizio sull'effetto e non come una regola di conto: il conto resta, e
   * questa riga dice che cosa il motore sa verificare e che cosa no.
   */
  verse53: string;
  /**
   * Il secondo conto, di P.V.R. Narasimha Rao (2000), §6.6: solo uccha,
   * moolatrikona e segno proprio, senza l'arudha, col D-2 Leone-Cancro del
   * suo esempio. Sta accanto a quello di Santhanam e non lo sostituisce.
   */
  narasimhaRaoSource: string;
  grahas: {
    id: BodyId;
    name: string;
    /** Un elemento per ciascuno dei sedici varga, nell'ordine di `VARGAS`. */
    vargas: {
      varga: VargaId;
      /** Il segno; assente solo nel D-2 di Parashara. */
      sign?: ZodiacSign;
      /** Solo nel D-2 di Parashara. */
      hora?: Hora;
      /** Vuoto se il varga non è buono. */
      good: GoodVargaReason[];
    }[];
    schemes: {
      scheme: VargaScheme;
      /** Quanti varga lo schema considera. */
      vargas: number;
      /** Quanti di quelli sono buoni. */
      good: number;
      /** Il nome del conto (6.43-51), o `null` sotto i due. */
      name: string | null;
    }[];
    /**
     * Il conto di Narasimha Rao: i varga buoni (dignità per segno, D-2
     * Leone-Cancro) e, per schema, quanti e il nome.
     */
    narasimhaRao: {
      /** Il segno del D-2 con la convenzione Leone-Cancro, quella del suo esempio. */
      d2Sign: ZodiacSign;
      goodVargas: VargaId[];
      schemes: { scheme: VargaScheme; vargas: number; good: number; name: string | null }[];
    };
    /** Se il graha è in neecha nella rashi (6.53, *nīcagā*). */
    neecha: boolean;
    /** Se è combusto secondo `GrahaStates.combustion` (6.53, *astaṃgatā*). */
    combust: boolean;
    /** Se è vinto in una guerra di `GrahaStates.wars` (6.53, *grahajitā*). */
    defeated: boolean;
  }[];
}

/**
 * Il tema vedico: la carta più ciò che il Jyotisha ci legge sopra.
 *
 * Non è un `NatalChart` con dei campi in più. La carta ci sta dentro intera,
 * perché le posizioni sono le stesse; quello che le si affianca è un'altra
 * lettura degli stessi gradi. Vedi `jyotisha.ts`, che dice anche che cosa non
 * c'è e perché.
 */
export interface JyotishaChart {
  /** La carta siderale da cui tutto discende. */
  chart: NatalChart;
  /** Il nakshatra di ciascun corpo, col nome che il Jyotisha gli dà. */
  nakshatras: { id: BodyId; name: string; nakshatra: NakshatraPosition }[];
  dasha: VimshottariDasha;
  vargas: VargaChart[];
  drishti: DrishtiChart;
  dignities: ParasharaDignities;
  /**
   * I varga buoni e il loro conto (BPHS 6.42-53). Assente senza ora di
   * nascita: la regola dell'arudha vuole il lagna, e un conto senza sarebbe
   * un altro numero. L'assenza la dice un'avvertenza.
   */
  /** Gli arudha dei dodici bhava (BPHS 29.1-7). Assenti senza ora: vogliono il lagna. */
  arudhas?: Arudhas;
  goodVargas?: GoodVargas;
  /** Le relazioni fra i sette graha, naturali, temporanee e composte (BPHS 3.55-58). */
  relationships: GrahaRelationships;
  /** La forza su venti punti nei quattro schemi (BPHS 7.17-27). */
  vimshopaka: Vimshopaka;
  /** Combustione, guerra planetaria e avastha: le condizioni di BPHS 6.53. */
  states: GrahaStates;
  /** Gli arudha dei nove graha, secondo Narasimha Rao. Non vogliono l'ora. */
  grahaArudhas: GrahaArudhas;
  /**
   * Le avvertenze dei pezzi, raccolte qui.
   *
   * Chi legge il tema vedico non deve andarle a cercare dentro la catena delle
   * dasha. Quelle della carta restano in `chart.warnings`, dove chi conosce il
   * motore le cerca già.
   */
  warnings: string[];
}

export type AspectId =
  | 'congiunzione'
  | 'opposizione'
  | 'trigono'
  | 'quadrato'
  | 'sestile'
  | 'semisestile'
  | 'quinconce'
  | 'semiquadrato'
  | 'sesquiquadrato'
  | 'quintile'
  | 'biquintile';

/**
 * Le convenzioni delle orbite per il tema e il cielo di un istante, ciascuna
 * con un autore: vedi `orbite.ts`. `greene` è la predefinita.
 */
export type NatalOrbConvention = 'greene' | 'leo' | 'lilly';

/**
 * Le convenzioni delle orbite per i transiti e i passaggi, più strette di
 * quelle natali. Una sola, per ora: è l'unica nominata che si sia trovata.
 */
export type TransitOrbConvention = 'hand';

/**
 * La convenzione delle orbite che ha prodotto gli aspetti di un risultato.
 *
 * Sta nel risultato per la ragione per cui ci sta il sistema di case: un
 * elenco di aspetti senza le orbite che lo hanno filtrato non si può
 * ricontrollare, e fra due scuole il trigono a 9° esiste o no.
 */
export interface OrbConventionInfo {
  id: string;
  /** L'autore, per primo. */
  name: string;
  /** L'opera e la pagina, o l'indirizzo e la data della copia. */
  source: string;
  /** La regola per esteso. */
  rule: string;
  /** Gli aspetti di cui chi ha chiamato ha sostituito l'orbita, se ce ne sono. */
  overridden?: AspectId[];
}

/** Modalità di calcolo effettivamente usata dal motore. */
export type EphemerisMode = 'swisseph' | 'moshier';

/**
 * Un istante in ora **locale**: la conversione a Tempo Universale è fatta dal
 * motore.
 *
 * Non è per forza una nascita — lo stesso istante descrive il momento di cui
 * si vogliono i transiti — e non porta coordinate: quelle servono alle case,
 * non alla conversione oraria.
 */
export interface LocalMoment {
  /** Data locale, formato ISO `YYYY-MM-DD`. */
  date: string;
  /** Ora locale, formato `HH:mm` o `HH:mm:ss`. Se omessa vale mezzogiorno locale. */
  time?: string;
  /** Identificatore IANA del fuso orario, es. `Europe/Rome`. */
  timezone: string;
}

/**
 * Un punto sulla superficie terrestre.
 *
 * Le longitudini eclittiche sono geocentriche: a Roma e a Tokyo un pianeta è
 * allo stesso grado dello zodiaco. Il luogo serve soltanto a orientare il
 * cielo rispetto all'orizzonte, cioè agli assi e alle case.
 *
 * È un tipo a sé, e non due campi sciolti, perché latitudine e longitudine
 * non hanno senso separate: una firma che le accettasse singolarmente
 * lascerebbe passare mezzo luogo.
 */
export interface Place {
  /** Latitudine in gradi decimali, positiva a Nord. */
  latitude: number;
  /** Longitudine in gradi decimali, positiva a Est. */
  longitude: number;
  /** Altitudine in metri sul livello del mare (usata solo dal sistema topocentrico). */
  altitude?: number;
}

/** Dati di nascita in ora **locale**: la conversione a UT è fatta dal motore. */
export interface BirthData extends LocalMoment, Place {
  /**
   * Ora locale, formato `HH:mm` o `HH:mm:ss`.
   * Se omessa la carta viene calcolata a mezzogiorno locale e le case,
   * gli assi e la posizione della Luna vanno considerati indicativi.
   */
  time?: string;
}

export interface ChartOptions extends ZodiacOptions {
  /** Sistema di domificazione. Default: `placidus`. */
  houseSystem?: HouseSystem;
  /**
   * Includi gli aspetti minori (semisestile, quinconce, semiquadrato,
   * sesquiquadrato, e quintile e biquintile se la convenzione li tratta).
   */
  minorAspects?: boolean;
  /** Convenzione delle orbite. Default: `greene`. Vedi `orbite.ts`. */
  orbConvention?: NatalOrbConvention;
  /** Corpi da calcolare. Default: tutti tranne Chirone e Lilith. */
  bodies?: BodyId[];
  /**
   * Formula della Parte di Fortuna.
   *
   * `settore` (default) inverte Sole e Luna nei temi notturni, secondo la
   * tradizione ellenistica e medievale. `diurna` usa sempre ASC + Luna − Sole:
   * è la semplificazione adottata da parte dei programmi moderni, utile solo
   * per confrontare i risultati con essi.
   */
  partOfFortuneFormula?: 'settore' | 'diurna';
  /**
   * La scuola delle dignità da aggiungere a quelle comuni, in
   * `NatalChart.dignities`. Omessa, nessuna: triplicità, termini e facce non
   * hanno una forma sola, e si chiedono nominando chi le ha scritte. Oggi ci
   * sono Lilly (1647), vedi `dignita-lilly.ts`, Tolomeo, vedi
   * `dignita-tolomeo.ts`, Bonatti (1491), vedi `dignita-bonatti.ts`, e
   * Valente, vedi `dignita-valente.ts`. Solo nello zodiaco tropicale, su
   * cui le loro tavole sono costruite: nel siderale è un `ChartError`.
   */
  dignitySchool?: DignitySchool;
  /** Percorso della cartella con i file `.se1`. Default: variabile d'ambiente o `<pkg>/ephe`. */
  ephemerisPath?: string;
}

/** Esito della conversione ora locale → tempo universale. */
export interface ResolvedTime {
  /** Giorno giuliano in Tempo Universale, l'input di tutti i calcoli. */
  julianDayUT: number;
  /** Istante UTC in formato ISO 8601. */
  utc: string;
  /** Istante locale in formato ISO 8601 con offset. */
  local: string;
  /** Scarto dal UTC in minuti, come risultante dal database tzdata storico. */
  offsetMinutes: number;
  /** `false` quando l'ora di nascita non è stata fornita. */
  timeKnown: boolean;
}

export interface CelestialBody {
  id: BodyId;
  name: string;
  /** Longitudine eclittica in gradi decimali [0, 360). */
  longitude: number;
  /** Latitudine eclittica in gradi decimali. */
  latitude: number;
  /** Distanza dalla Terra in unità astronomiche. */
  distance: number;
  /** Velocità in longitudine, gradi/giorno. Negativa se retrogrado. */
  speed: number;
  retrograde: boolean;
  sign: ZodiacSign;
  /** Posizione all'interno del segno, [0, 30). */
  signDegree: number;
  /** Casa occupata, 1-12. Assente se l'ora di nascita è ignota. */
  house?: number;
}

/**
 * Un punto calcolato: non un corpo celeste ma una posizione derivata da altri
 * elementi del tema. Non ha moto proprio, quindi non ha velocità né
 * retrogradazione.
 */
export interface ChartPoint {
  longitude: number;
  sign: ZodiacSign;
  /** Posizione all'interno del segno, [0, 30). */
  signDegree: number;
  /** Casa occupata, 1-12. */
  house?: number;
}

/**
 * Settore del tema: diurno se il Sole è sopra l'orizzonte al momento della
 * nascita, notturno altrimenti.
 *
 * Determina la formula della Parte di Fortuna ed è un dato interpretativo di
 * per sé nell'astrologia tradizionale.
 */
export type Sect = 'diurna' | 'notturna';

/** Tempo siderale locale: la posizione del cielo rispetto al luogo. */
export interface SiderealTime {
  /** Ore decimali, [0, 24). */
  hours: number;
  /** Formato `HH:mm:ss`. */
  formatted: string;
}

export interface House {
  /** Numero della casa, 1-12. */
  number: number;
  /** Longitudine eclittica della cuspide. */
  longitude: number;
  sign: ZodiacSign;
  signDegree: number;
}

export interface Angles {
  ascendant: number;
  midheaven: number;
  descendant: number;
  imumCoeli: number;
  /** Assente, con avvertenza, se le effemeridi non lo riportano. */
  vertex?: number;
}

/**
 * Un punto capace di formare aspetti.
 *
 * Non deve essere un corpo celeste: a un asse o a una cuspide bastano una
 * longitudine e una velocità nulla. Il tipo esiste perché gli aspetti si
 * calcolano anche fra insiemi appartenenti a **temi diversi** — i transiti
 * aspettano le posizioni di nascita — e lì `CelestialBody` sarebbe una
 * richiesta eccessiva.
 */
export interface AspectPoint<Id extends string = string> {
  id: Id;
  /** Longitudine eclittica in gradi decimali [0, 360). */
  longitude: number;
  /** Velocità in longitudine, gradi/giorno. Zero per un punto fermo. */
  speed: number;
}

export interface PointAspect<From extends string = string, To extends string = From> {
  aspect: AspectId;
  /** Angolo esatto dell'aspetto in gradi. */
  angle: number;
  from: From;
  to: To;
  /** Scarto dall'angolo esatto, in gradi. */
  orb: number;
  /** `true` se l'aspetto si sta perfezionando, `false` se si sta separando. */
  applying: boolean;
}

/** Aspetto fra due corpi dello stesso tema. */
export type Aspect = PointAspect<BodyId>;

export interface NatalChart {
  input: BirthData;
  time: ResolvedTime;
  houseSystem: HouseSystem;
  ephemerisMode: EphemerisMode;
  /**
   * Lo zodiaco in cui sono espresse tutte le longitudini, e con esse ogni
   * segno riportato qui dentro.
   *
   * Sta nel risultato e non solo fra le opzioni, per la stessa ragione di
   * `houseSystem`: senza, «Sole in Pesci» è un'affermazione che non si può
   * verificare, perché non si sa da dove siano stati contati i gradi.
   */
  zodiac: Zodiac;
  /** L'ayanamsa usato e quanto valeva. Assente nello zodiaco tropicale. */
  ayanamsa?: AyanamsaInfo;
  bodies: CelestialBody[];
  /** Vuoto se l'ora di nascita è ignota. */
  houses: House[];
  /** Assente se l'ora di nascita è ignota. */
  angles?: Angles;
  /**
   * Parte di Fortuna. Assente se l'ora di nascita è ignota: dipende
   * dall'Ascendente.
   */
  partOfFortune?: ChartPoint;
  /** Settore diurno o notturno. Assente se l'ora di nascita è ignota. */
  sect?: Sect;
  /**
   * Tempo siderale locale all'istante di nascita.
   *
   * Serve a verificare a colpo d'occhio che la conversione oraria sia
   * avvenuta correttamente: è il dato da cui discendono Ascendente e case.
   */
  siderealTime: SiderealTime;
  /** La convenzione delle orbite con cui sono stati trovati gli aspetti. */
  orbConvention: OrbConventionInfo;
  aspects: Aspect[];
  /**
   * Quanti punti cadono in ciascun elemento e in ciascuna modalità, divisi per
   * gruppo. È un conteggio e non una lettura: vedi `Distribution`.
   */
  distribution: Distribution;
  /**
   * Le dignità occidentali. Solo nello zodiaco tropicale: le tavole sono
   * costruite lì, e nel siderale, che è anche la carta che il Jyotisha riusa,
   * sarebbero una dottrina applicata fuori dal suo zodiaco. Le dignità di
   * Parashara stanno in `JyotishaChart.dignities`.
   */
  dignities?: WesternDignities;
  /**
   * Avvertimenti non bloccanti: ora ambigua o inesistente per il cambio
   * ora legale, ripiego sulle effemeridi Moshier, corpi non calcolabili,
   * sistema di case non applicabile alla latitudine.
   */
  warnings: string[];
}

/** L'istante di cui si vuole il cielo, in ora locale. */
export type SkyMoment = LocalMoment;

export interface SkyOptions extends ZodiacOptions {
  /** Luogo di osservazione. Se assente: niente assi, niente case. */
  place?: Place;
  /** Sistema di domificazione. Default: `placidus`. Vale solo con un luogo. */
  houseSystem?: HouseSystem;
  /** Includi gli aspetti minori. */
  minorAspects?: boolean;
  /** Convenzione delle orbite per gli aspetti fra i corpi. Default: `greene`. */
  orbConvention?: NatalOrbConvention;
  /** Corpi da calcolare. Default: tutti tranne Chirone e Lilith. */
  bodies?: BodyId[];
  /**
   * Le dignità di una scuola: Lilly, con le condizioni dell'istante,
   * Tolomeo, Bonatti o Valente. Omessa, il cielo non porta dignità. Solo nel
   * tropicale, come nel tema. Per Lilly le case, l'ora planetaria e i gradi dell'Ascendente
   * chiedono il luogo e l'ora.
   */
  dignitySchool?: DignitySchool;
  /** Percorso della cartella con i file `.se1`. */
  ephemerisPath?: string;
}

/**
 * Il cielo a un istante, senza nessuna nascita a cui riferirlo.
 *
 * Non è un `NatalChart` con la data di oggi: quello pretende un luogo, e qui
 * il luogo è facoltativo. Non sono transiti: un transito è un rapporto con un
 * tema, e qui il tema non c'è. È la pagina di un'effemeride.
 */
export interface SkyChart {
  input: SkyMoment;
  /** Il luogo da cui il cielo è guardato, se ne è stato indicato uno. */
  place?: Place;
  time: ResolvedTime;
  ephemerisMode: EphemerisMode;
  /**
   * Lo zodiaco in cui sono espresse tutte le longitudini, e con esse ogni
   * segno riportato qui dentro.
   *
   * Sta nel risultato e non solo fra le opzioni, per la stessa ragione di
   * `houseSystem`: senza, «Sole in Pesci» è un'affermazione che non si può
   * verificare, perché non si sa da dove siano stati contati i gradi.
   */
  zodiac: Zodiac;
  /** L'ayanamsa usato e quanto valeva. Assente nello zodiaco tropicale. */
  ayanamsa?: AyanamsaInfo;
  bodies: CelestialBody[];
  /** Vuoto senza luogo o senza ora: in un giorno le cuspidi fanno un giro intero. */
  houses: House[];
  /** Assente alle stesse condizioni delle case. */
  angles?: Angles;
  /** Presente solo se le case sono state calcolate. */
  houseSystem?: HouseSystem;
  /** Presente solo con un luogo: è locale, dipende dalla longitudine. */
  siderealTime?: SiderealTime;
  /** Diurno se il Sole è sopra l'orizzonte. Richiede gli assi. */
  sect?: Sect;
  /** La convenzione delle orbite con cui sono stati trovati gli aspetti. */
  orbConvention: OrbConventionInfo;
  /** Aspetti reciproci fra i corpi, con le orbite di una convenzione natale. */
  aspects: Aspect[];
  /** Come nel tema. Il gruppo degli assi resta vuoto senza luogo o senza ora. */
  distribution: Distribution;
  /** Le dignità di una scuola, solo con `dignitySchool`: con Lilly anche le condizioni. */
  dignities?: WesternDignities;
  /**
   * Avvertimenti non bloccanti: ora non indicata, luogo senza ora, ripiego
   * sulle effemeridi Moshier, corpi non calcolabili.
   */
  warnings: string[];
}

/**
 * Ciò che, in un tema natale, può ricevere un transito: un corpo, un asse o
 * la Parte di Fortuna.
 *
 * Non è `BodyId` perché un transito sull'Ascendente è fra i più significativi
 * che esistano, e l'Ascendente non è un corpo celeste.
 */
export type NatalPointId =
  | BodyId
  | 'ascendente'
  | 'medio-cielo'
  | 'discendente'
  | 'fondo-cielo'
  | 'fortuna';

/** La triplicità di un segno. */
export type Element = 'fuoco' | 'terra' | 'aria' | 'acqua';

/** La quadruplicità di un segno. */
export type Modality = 'cardinale' | 'fisso' | 'mobile';

/**
 * Quanti punti di un gruppo cadono in ciascun elemento e in ciascuna modalità.
 *
 * `counted` non è un di più: è ciò che rende il conteggio verificabile. Un
 * numero nudo — «Fuoco 3» — non si può ricontare, e chi legge non ha modo di
 * sapere se dentro ci siano i nodi, Chirone o l'Ascendente. Con l'elenco, chi
 * segue una convenzione diversa dalla nostra rifà la somma invece di doverci
 * credere.
 */
export interface DistributionGroup {
  elements: Record<Element, number>;
  modalities: Record<Modality, number>;
  counted: NatalPointId[];
}

/**
 * La distribuzione dei punti fra elementi e modalità, divisa per gruppo.
 *
 * Spezzata e non sommata di proposito. Non esiste un conteggio solo: c'è chi
 * conta i sette pianeti tradizionali, chi i dieci, chi aggiunge i nodi, chi
 * l'Ascendente, chi pesa i luminari più del resto. Dare un totale unico
 * significherebbe scegliere una scuola in silenzio e presentarne il risultato
 * come un fatto.
 *
 * Con i gruppi separati ogni convenzione si ricava sommando: chi vuole i soli
 * pianeti legge `planets`, chi vuole anche l'Ascendente aggiunge `angles`.
 * Il motore conta, la scelta di che cosa contare resta a chi legge.
 */
export interface Distribution {
  /** I dieci fra luminari e pianeti. */
  planets: DistributionGroup;
  /** Nodi, Lilith, Chirone, Parte di Fortuna: quelli che il tema porta. */
  points: DistributionGroup;
  /** Ascendente e Medio Cielo. Vuoto senza ora di nascita. */
  angles: DistributionGroup;
}

/** L'istante di cui si vogliono i transiti, in ora locale. */
export type TransitMoment = LocalMoment;

/**
 * Un punto che può trovarsi in transito.
 *
 * Ai corpi si aggiungono i due assi **dell'istante**, che esistono solo se al
 * transito è stato dato un luogo: l'Ascendente di adesso dipende da dove lo si
 * guarda, e senza coordinate non è definito. Discendente e Fondo Cielo restano
 * fuori per la stessa ragione per cui non sono bersagli predefiniti — sono
 * l'opposizione esatta degli altri due, e ogni loro contatto compare già.
 */
export type TransitingPointId = BodyId | 'ascendente' | 'medio-cielo';

export interface TransitOptions {
  /** Corpi in transito. Default: `DEFAULT_TRANSIT_BODIES`. */
  bodies?: BodyId[];
  /**
   * Luogo da cui si guarda il transito.
   *
   * Facoltativo, e senza non manca nulla di ciò che il transito aveva prima:
   * le longitudini dei corpi sono geocentriche e i loro aspetti al tema non
   * cambiano di un secondo d'arco. Serve alle sole cose che un orizzonte
   * definisce — assi dell'istante, case dell'istante, tempo siderale — e
   * vuole anche l'ora, senza la quale l'Ascendente compie un giro in un
   * giorno.
   *
   * Non è il luogo di nascita rilocato: il tema natale resta quello che è, e
   * le case in cui i transiti si leggono restano le sue.
   */
  place?: Place;
  /**
   * Domificazione delle case **dell'istante**. Default: `placidus`. Vale solo
   * con un luogo, e non tocca le case natali, che il tema porta già con sé.
   */
  houseSystem?: HouseSystem;
  /**
   * Punti natali da bersagliare. Default: i corpi del tema più Ascendente e
   * Medio Cielo. Un bersaglio assente dal tema produce un avviso, non un errore.
   */
  targets?: NatalPointId[];
  /** Includi gli aspetti minori. */
  minorAspects?: boolean;
  /** Convenzione delle orbite. Default: `hand`. Vedi `orbite.ts`. */
  orbConvention?: TransitOrbConvention;
  /**
   * Orbite per aspetto, in gradi: sostituiscono quella della convenzione per
   * i soli aspetti nominati, per ogni coppia. Il risultato lo dichiara.
   */
  orbs?: Partial<Record<AspectId, number>>;
  /** Percorso della cartella con i file `.se1`. Default: variabile d'ambiente o `<pkg>/ephe`. */
  ephemerisPath?: string;
}

/**
 * Un aspetto fra un corpo in transito e un punto del tema natale.
 *
 * I due lati non sono intercambiabili — uno si muove e l'altro è fermo per
 * sempre — quindi si chiamano `transiting` e `natal` invece di `from` e `to`.
 */
export interface TransitAspect {
  aspect: AspectId;
  /** Angolo esatto dell'aspetto in gradi. */
  angle: number;
  /**
   * Un corpo, oppure un asse dell'istante se al transito è stato dato un
   * luogo. Gli assi si muovono di un grado ogni quattro minuti: un loro
   * contatto dura minuti, non giorni come quello di un pianeta.
   */
  transiting: TransitingPointId;
  natal: NatalPointId;
  /** Scarto dall'angolo esatto, in gradi. */
  orb: number;
  /**
   * `true` se l'aspetto si sta perfezionando. Dipende dal solo corpo in
   * transito: il punto natale è fermo.
   */
  applying: boolean;
  /**
   * Il transitante è retrogrado all'istante considerato. Sempre `false` per
   * gli assi, che non hanno moto proprio da invertire.
   */
  retrograde: boolean;
}

/** L'arco di tempo su cui cercare i passaggi, in date locali. */
export interface PassageRange {
  /** Primo giorno, `YYYY-MM-DD`. */
  from: string;
  /** Ultimo giorno, incluso. */
  to: string;
  /** Fuso in cui vanno letti i due estremi. */
  timezone: string;
}

export interface PassageOptions {
  /** Corpi in transito. Default: `DEFAULT_PASSAGE_BODIES`, cioè senza la Luna. */
  bodies?: BodyId[];
  /** Punti natali da bersagliare. Default: i corpi del tema più Ascendente e Medio Cielo. */
  targets?: NatalPointId[];
  /** Includi gli aspetti minori. */
  minorAspects?: boolean;
  /** Convenzione delle orbite delle finestre. Default: `hand`. */
  orbConvention?: TransitOrbConvention;
  /** Orbite per aspetto: valgono per la finestra, non per l'istante esatto. */
  orbs?: Partial<Record<AspectId, number>>;
  /** Percorso della cartella con i file `.se1`. */
  ephemerisPath?: string;
}

/**
 * Un aspetto che si perfeziona: l'istante in cui il transitante raggiunge
 * esattamente l'angolo, non l'intervallo in cui gli è vicino.
 *
 * Un corpo lento che passa in retrogradazione perfeziona lo stesso aspetto
 * tre volte — avanti, indietro, avanti — e sono tre passaggi distinti, non
 * uno lungo: è la struttura che rende leggibile un anno.
 */
export interface TransitPassage {
  transiting: BodyId;
  natal: NatalPointId;
  aspect: AspectId;
  /** Angolo esatto dell'aspetto in gradi. */
  angle: number;
  /** Istante UTC in cui l'aspetto è esatto, ISO 8601. */
  exact: string;
  /** Lo stesso istante nel fuso richiesto. */
  local: string;
  /** Il transitante è retrogrado in quel momento. */
  retrograde: boolean;
  /**
   * Intervallo in cui l'aspetto resta entro l'orbita.
   *
   * Assente quando non si chiude entro tre anni: succede ai pianeti lenti,
   * per cui il contatto dura più di quanto abbia senso chiamare finestra.
   */
  window?: { start: string; end: string };
}

/**
 * Un transito in orbita in qualche momento di un arco di tempo.
 *
 * È l'altra metà della domanda di `TransitPassage`: quello dice *quando* un
 * aspetto si perfeziona, questo *che cosa* è in orbita fra due date, anche se
 * non si perfeziona mai. Un corpo lento che si ferma a due gradi e mezzo da un
 * punto natale e torna indietro non ha un istante esatto, ma è in orbita per
 * mesi. Lo stesso aspetto che entra in orbita due volte nell'arco dà due
 * righe, una per tratto.
 *
 * Porta i componenti e non un giudizio: quanto stretto, da quando a quando,
 * quante volte esatto. Nessun peso fra un transito e l'altro.
 */
export interface ActiveTransit {
  transiting: BodyId;
  natal: NatalPointId;
  aspect: AspectId;
  /** Angolo esatto dell'aspetto in gradi. */
  angle: number;
  /** L'orbita usata, in gradi: quella dell'aspetto più i bonus dei luminari. */
  orb: number;
  /**
   * Ingresso in orbita, nel fuso dell'arco.
   *
   * Assente quando era già in orbita tre anni prima dell'inizio dell'arco:
   * oltre, come per `TransitPassage.window`, il bordo non si cerca.
   */
  enters?: string;
  /** Uscita dall'orbita, nel fuso dell'arco. Assente, allo stesso modo, oltre i tre anni dopo la fine. */
  leaves?: string;
  /** In orbita dal primo all'ultimo istante dell'arco. */
  throughout: boolean;
  /** Distanza dall'esatto, in gradi, all'inizio dell'arco. Solo se già in orbita allora. */
  orbAtFrom?: number;
  /** Distanza dall'esatto, in gradi, alla fine dell'arco. Solo se ancora in orbita allora. */
  orbAtTo?: number;
  /** Le perfezioni che cadono dentro l'arco, in ordine di tempo. Spesso nessuna. */
  perfections: { exact: string; local: string; retrograde: boolean }[];
  /**
   * L'avvicinamento massimo dentro l'arco, quando non si perfeziona: la
   * distanza minima dall'esatto e l'istante, nel fuso dell'arco. Assente
   * quando `perfections` non è vuoto, perché lì la distanza minima è zero.
   */
  closest?: { orb: number; local: string };
}

export interface SkyPassageOptions {
  /** Corpi da seguire. Default: `DEFAULT_PASSAGE_BODIES`, cioè senza la Luna. */
  bodies?: BodyId[];
  /** Includi gli aspetti minori. */
  minorAspects?: boolean;
  /** Convenzione delle orbite delle finestre. Default: `hand`. */
  orbConvention?: TransitOrbConvention;
  /** Orbite per aspetto: valgono per la finestra, non per l'istante esatto. */
  orbs?: Partial<Record<AspectId, number>>;
  /** Percorso della cartella con i file `.se1`. */
  ephemerisPath?: string;
}

/**
 * Un aspetto fra due corpi in cielo che si perfeziona.
 *
 * I due lati si distinguono per **velocità media** e non per moto istantaneo:
 * è il più veloce a raggiungere il più lento, ed è la convenzione con cui si
 * nomina un incontro. Presa sul moto del momento, la coppia si scambierebbe i
 * ruoli a ogni retrogradazione, e lo stesso aspetto comparirebbe ora in un
 * verso ora nell'altro.
 */
export interface SkyPassage {
  faster: BodyId;
  slower: BodyId;
  aspect: AspectId;
  /** Angolo esatto dell'aspetto in gradi. */
  angle: number;
  /** Istante UTC in cui l'aspetto è esatto, ISO 8601. */
  exact: string;
  /** Lo stesso istante nel fuso richiesto. */
  local: string;
  /**
   * Quale dei due è retrogrado in quell'istante.
   *
   * È la ragione per cui uno stesso aspetto può perfezionarsi più volte: due
   * corpi che si inseguono si incontrano una volta sola, ma se uno dei due
   * torna indietro si incontrano tre.
   */
  retrograde: { faster: boolean; slower: boolean };
  /**
   * Intervallo in cui l'aspetto resta entro l'orbita.
   *
   * Assente quando non si chiude entro tre anni: fra due pianeti lenti un
   * contatto dura più di quanto abbia senso chiamare finestra.
   */
  window?: { start: string; end: string };
}

export interface SkyEventOptions extends ZodiacOptions {
  /** Corpi da seguire. Default: `DEFAULT_PASSAGE_BODIES`, cioè senza la Luna. */
  bodies?: BodyId[];
  /** Percorso della cartella con i file `.se1`. */
  ephemerisPath?: string;
}

/**
 * Il passaggio di un corpo da un segno al successivo.
 *
 * Non è sempre un progresso: un pianeta che retrograda rientra nel segno da
 * cui era uscito, e più tardi lo lascia di nuovo. Ogni attraversamento è un
 * evento a sé, e `from` dice da dove arriva proprio perché il verso non è
 * scontato.
 */
export interface SignIngress {
  body: BodyId;
  /** Il segno in cui entra. */
  sign: ZodiacSign;
  /** Il segno che lascia. */
  from: ZodiacSign;
  /** Istante UTC dell'attraversamento, ISO 8601. */
  exact: string;
  /** Lo stesso istante nel fuso richiesto. */
  local: string;
  /** `true` se entra andando all'indietro. */
  retrograde: boolean;
}

/**
 * L'istante in cui un corpo si ferma e inverte il moto.
 *
 * La longitudine è parte dell'evento e non un dettaglio: è il grado su cui il
 * pianeta indugia per giorni, e su cui tornerà due volte.
 */
export interface Station {
  body: BodyId;
  /** `retrograda` quando comincia a tornare indietro, `diretta` quando riprende. */
  direction: 'retrograda' | 'diretta';
  /** Istante UTC della stazione, ISO 8601. */
  exact: string;
  /** Lo stesso istante nel fuso richiesto. */
  local: string;
  /** Longitudine eclittica in cui si ferma. */
  longitude: number;
  sign: ZodiacSign;
  /** Posizione all'interno del segno, [0, 30). */
  signDegree: number;
}

/**
 * Un corpo in transito, che può trovarsi in **due** case per volta.
 *
 * Non è una contraddizione ma la differenza fra due domande. `house` risponde
 * a «in quale settore della vita di questa persona sta passando», e vale
 * ovunque la persona si trovi. `transitHouse` risponde a «dove sta in cielo,
 * adesso, per chi è in quel posto»: sopra o sotto l'orizzonte, a oriente o a
 * occidente. La prima è quella che si legge di solito; la seconda esiste solo
 * se al transito è stato dato un luogo.
 */
export interface TransitingBody extends CelestialBody {
  /**
   * Casa **dell'istante**, 1-12: quella della domificazione calcolata sul
   * luogo del transito. Assente senza luogo o senza ora.
   */
  transitHouse?: number;
}

export interface TransitChart {
  input: TransitMoment;
  time: ResolvedTime;
  ephemerisMode: EphemerisMode;
  /**
   * Lo zodiaco in cui sono espresse tutte le longitudini, e con esse ogni
   * segno riportato qui dentro.
   *
   * Sta nel risultato e non solo fra le opzioni, per la stessa ragione di
   * `houseSystem`: senza, «Sole in Pesci» è un'affermazione che non si può
   * verificare, perché non si sa da dove siano stati contati i gradi.
   */
  zodiac: Zodiac;
  /** L'ayanamsa usato e quanto valeva. Assente nello zodiaco tropicale. */
  ayanamsa?: AyanamsaInfo;
  /**
   * Posizioni all'istante del transito. `house` è la casa **natale** in cui il
   * corpo cade, ed è assente se il tema di nascita non ha case.
   */
  transiting: TransitingBody[];
  /** La convenzione delle orbite con cui sono stati trovati gli aspetti. */
  orbConvention: OrbConventionInfo;
  aspects: TransitAspect[];
  /** Il luogo da cui il transito è guardato, se ne è stato indicato uno. */
  place?: Place;
  /**
   * Case **dell'istante**, non quelle natali: la domificazione del luogo del
   * transito. Vuote senza luogo o senza ora — in un giorno le cuspidi fanno
   * un giro intero. Le case natali restano nel tema, dove sono sempre state.
   */
  houses: House[];
  /** Assi dell'istante. Assenti alle stesse condizioni delle case. */
  angles?: Angles;
  /** Domificazione usata per `houses`. Presente solo se sono state calcolate. */
  houseSystem?: HouseSystem;
  /** Presente solo con un luogo: è locale, dipende dalla longitudine. */
  siderealTime?: SiderealTime;
  /**
   * Avvertimenti non bloccanti: ora del transito non fornita, tema natale
   * senza case, luogo senza ora, bersagli richiesti e non disponibili, corpi
   * non calcolabili.
   */
  warnings: string[];
}

export interface ElectionOptions {
  /**
   * Corpi il cui incontro basta a togliere la Luna dal vuoto di corso.
   * Default: i sei classici oltre alla Luna, cioè la regola nella sua forma
   * tradizionale.
   */
  bodies?: BodyId[];
  /**
   * Restringe l'elenco alle ore rette da questi pianeti.
   *
   * Serve alla leggibilità prima che alla velocità: un mese intero sono
   * settecentoquaranta ore, che nessuno consulta e che a un agente riempiono
   * il contesto. Chiedere un reggitore solo ne lascia un settimo.
   */
  rulers?: BodyId[];
  /**
   * Scarta le ore che un vuoto di corso attraversa, in tutto o in parte.
   *
   * È una scelta di chi chiede, non un consiglio del motore: i vuoti restano
   * nel risultato, perché sono la ragione per cui quelle ore mancano.
   */
  skipMoonVoid?: boolean;
  /** Percorso della cartella con i file `.se1`. */
  ephemerisPath?: string;
}

/**
 * Un'ora planetaria: una delle dodici parti in cui si divide l'arco diurno, o
 * l'arco notturno, del luogo.
 *
 * Dura sessanta minuti soltanto agli equinozi. A giugno, alle nostre
 * latitudini, un'ora diurna sfiora gli ottanta minuti e una notturna scende
 * sotto i quaranta: `minutes` dice quale delle due si sta guardando meglio di
 * qualunque etichetta.
 */
export interface PlanetaryHour {
  /** Il pianeta che la regge, secondo l'ordine caldeo. */
  ruler: BodyId;
  /** `true` fra alba e tramonto. */
  diurnal: boolean;
  /** Posizione nella dodicina, 1-12. */
  index: number;
  /** Inizio in UTC, ISO 8601. */
  start: string;
  /** Fine in UTC: coincide con l'inizio dell'ora successiva. */
  end: string;
  /** Gli stessi due istanti nel fuso richiesto. */
  local: { start: string; end: string };
  /** Durata effettiva in minuti. */
  minutes: number;
  /**
   * L'Ascendente all'inizio dell'ora.
   *
   * È il dato che si muove più in fretta di tutti: un grado ogni quattro
   * minuti, un segno intero nell'arco di due ore scarse. Vale all'istante
   * `start` e non per l'ora intera.
   */
  ascendant: { longitude: number; sign: ZodiacSign; signDegree: number };
  /** `true` se la Luna è vuota di corso durante tutta l'ora o parte di essa. */
  moonVoid: boolean;
}

/**
 * L'ora planetaria in cui cade un istante: la stessa divisione del calendario
 * elettivo, presa per un istante solo. È la prima cosa che Lilly guarda in
 * una domanda (*Christian Astrology*, p. 121).
 */
export interface PlanetaryHourAt {
  /** Il pianeta che regge l'ora, secondo l'ordine caldeo. */
  ruler: BodyId;
  /** Il pianeta del giorno planetario, che comincia all'alba. */
  dayRuler: BodyId;
  /** `true` fra alba e tramonto. */
  diurnal: boolean;
  /** Posizione nella dodicina, 1-12. */
  index: number;
  /** Inizio e fine in UTC, ISO 8601. */
  start: string;
  end: string;
  /** Gli stessi due istanti nel fuso richiesto. */
  local: { start: string; end: string };
  /** Durata effettiva in minuti. */
  minutes: number;
}

/** Come chiedere il corso di un corpo fino all'uscita dal segno. */
export interface SignCourseOptions {
  /**
   * I corpi con cui cercare gli aspetti. Default: i sette pianeti. La Luna
   * vuota di Lilly guarda comunque solo i sette, gli unici con un'orbita.
   */
  bodies?: BodyId[];
  /** Il fuso in cui scrivere gli istanti locali. Default: UTC. */
  timezone?: string;
  /**
   * Un giorno giuliano oltre il quale non cercare aspetti e stazioni, se
   * viene prima del cambio di segno. Il cambio di segno si cerca comunque, ma
   * entra negli eventi, e con lui le Lune vuote, solo se cade entro il limite.
   */
  until?: number;
  /** Percorso della cartella con i file `.se1`. */
  ephemerisPath?: string;
}

/**
 * Un evento nel corso di un corpo: un aspetto che perfeziona, una stazione,
 * il cambio di segno che chiude la sequenza.
 */
export type CourseEvent = {
  /** Istante UTC, ISO 8601, e lo stesso nel fuso richiesto. */
  exact: string;
  local: string;
} & (
  | {
      kind: 'aspetto';
      with: BodyId;
      aspect: AspectId;
      /** Chi dei due è retrogrado nell'istante esatto. */
      retrograde: { body: boolean; other: boolean };
      /**
       * Chi si avvicina all'aspetto col proprio moto, un attimo prima
       * dell'esatto: il corpo del corso, l'altro, o tutti e due quando si
       * vengono incontro (uno retrogrado). È moto, non una scuola: nel corso
       * di Saturno l'incontro con la Luna dice che a muoversi è la Luna.
       */
      approaching: ('body' | 'other')[];
    }
  | { kind: 'stazione'; direction: 'retrograda' | 'diretta'; longitude: number }
  | { kind: 'ingresso'; sign: ZodiacSign; from: ZodiacSign; retrograde: boolean }
);

/**
 * Il giudizio di un classificatore nominato sulla sequenza: se il corpo è
 * vuoto di corso secondo una scuola, con la fonte e la regola.
 */
export interface VoidVerdict {
  school: 'moderno' | 'lilly';
  name: string;
  source: string;
  rule: string;
  void: boolean;
  /**
   * Per Lilly: l'aspetto che il corpo sta ancora formando quando esce dal
   * segno, entro le orbite. È ciò che lo rende non vuoto anche dove il criterio
   * moderno lo dice vuoto.
   */
  applyingAtExit?: { with: BodyId; aspect: AspectId; orb: number };
  note?: string;
}

/**
 * Il corso di un corpo dall'istante dato fino al cambio di segno. Vedi
 * `corso.ts`. Non sceglie nessuna scuola: gli eventi sono moto, e i
 * classificatori in `voids` dicono ciascuno il proprio nome.
 */
export interface SignCourse {
  body: BodyId;
  name: string;
  /** L'istante di partenza, UTC e nel fuso richiesto. */
  at: string;
  local: string;
  longitude: number;
  sign: ZodiacSign;
  signDegree: number;
  /** I corpi con cui sono stati cercati gli aspetti. */
  with: BodyId[];
  /** Quando il corpo è entrato nel segno, se entro l'arco cercato. */
  entered?: string;
  /**
   * L'ultimo aspetto perfezionato prima dell'istante, da quando è nel segno:
   * ciò da cui il corpo si sta separando.
   */
  lastPerfected?: CourseEvent;
  /**
   * Tutti gli aspetti perfezionati da quando il corpo è nel segno fino
   * all'istante, in ordine: le separazioni. L'ultimo è `lastPerfected`.
   */
  separations: CourseEvent[];
  /** In ordine; l'ultimo è l'ingresso nel segno dopo, se cade entro l'arco. */
  events: CourseEvent[];
  /** La Luna vuota moderna e quella di Lilly. Vuoto se il segno non finisce entro l'arco. */
  voids: VoidVerdict[];
  warnings: string[];
}

/**
 * La domanda di un tema orario, ridotta a ciò che il motore può calcolare: la
 * casa che la riguarda. Sceglierla è il primo atto del giudizio e lo fa chi
 * pone la domanda; il motore la riceve.
 */
export interface HoraryQuestion {
  /** La casa del quesito, 1-12, contata dall'Ascendente o da `derivedFrom`. */
  house: number;
  /**
   * Per le case derivate: la casa da cui contare. Il coniuge del fratello è
   * la settima dalla terza, `{ house: 7, derivedFrom: 3 }`, cioè la nona.
   */
  derivedFrom?: number;
}

export interface HoraryOptions {
  question: HoraryQuestion;
  /** Percorso della cartella con i file `.se1`. */
  ephemerisPath?: string;
}

/** Un significatore e la casa che significa. */
export interface HorarySignificator {
  body: BodyId;
  /** `querente` per l'Ascendente, `quesito` per la casa del quesito, `cosignificatore` la Luna (p. 124). */
  role: 'querente' | 'quesito' | 'cosignificatore';
  /** La casa di cui è signore; per la Luna, la prima. */
  rules: number;
  longitude: number;
  sign: ZodiacSign;
  /** La casa in cui sta, con la regola dei cinque gradi. */
  house?: number;
}

/** I modi della perfezione, pp. 125-126, e del suo impedimento, pp. 110-113. */
export type HoraryFindingMode =
  | 'congiunzione'
  | 'aspetto'
  | 'traslazione'
  | 'collezione'
  | 'proibizione'
  | 'frustrazione'
  | 'refranazione';

/** Un evento del corso di un corpo, col nome del corpo. */
export type HoraryEvent = CourseEvent & { body: BodyId };

/**
 * Ciò che un classificatore della scuola di Lilly trova nella sequenza: il
 * modo, la pagina della definizione, e gli eventi che lo compongono. Non dice
 * se la cosa domandata avverrà: dice che la figura ha questa configurazione
 * secondo quella definizione.
 */
export interface HoraryFinding {
  mode: HoraryFindingMode;
  /** La definizione in una riga e la pagina di Christian Astrology. */
  definition: string;
  page: number;
  /** Il pianeta che trasferisce, raccoglie, proibisce o frustra. */
  by?: BodyId;
  /** L'aspetto con cui la perfezione o l'impedimento avviene. */
  aspect?: AspectId;
  /** L'istante in cui si compie, se c'è. */
  exact?: string;
  local?: string;
  /** Gli eventi da cui la si legge, in ordine. */
  events: HoraryEvent[];
  /**
   * Le ricezioni che la definizione nomina: per la traslazione (p. 126) se
   * il pianeta che trasferisce è ricevuto da quello da cui si separa, per la
   * collezione se i due significatori ricevono quello che raccoglie.
   */
  reception?: { by: BodyId; of: BodyId; dignities: ReceptionDignity[] }[];
  /**
   * Le condizioni di qualità di p. 125, solo per la congiunzione e
   * l'aspetto: dove la congiunzione si compie, se i significatori hanno
   * dignità e applicano da case buone, per l'opposizione la mutua ricezione
   * per domicilio e la Luna. Predicati come le considerazioni: quelli senza
   * soglia nel testo restano senza `holds`, e `detail` dice i dati.
   */
  quality?: HoraryConsideration[];
  note?: string;
}

/**
 * Una considerazione prima del giudizio, pp. 121-123: un predicato, mai un
 * rifiuto. `holds` assente vuol dire che il testo non dà una soglia da
 * calcolare, e `detail` dice perché.
 */
export interface HoraryConsideration {
  id: string;
  page: number;
  /** La condizione, con le parole di Lilly riassunte. */
  text: string;
  holds?: boolean;
  detail?: string;
}

/**
 * Il tema orario secondo Lilly: la figura dell'istante con le sue condizioni,
 * i significatori della domanda, il loro corso fino al cambio di segno, e ciò
 * che i classificatori della scuola vi trovano. Vedi `oraria-lilly.ts`.
 *
 * Non c'è un sì o un no, né un tempo in giorni: sono il giudizio, e il
 * giudizio lo fa chi legge.
 */
export interface HoraryLilly {
  school: 'lilly';
  source: string;
  readings: string[];
  /** La figura: Regiomontano, tropicale, col pacchetto di Lilly. */
  chart: SkyChart;
  question: HoraryQuestion & { effectiveHouse: number; cuspSign: ZodiacSign };
  significators: HorarySignificator[];
  /** Lo stesso pianeta regge l'Ascendente e la casa del quesito. */
  sameSignificator: boolean;
  /** Il corso dei significatori e della Luna fino al cambio di segno. */
  courses: SignCourse[];
  perfections: HoraryFinding[];
  impediments: HoraryFinding[];
  considerations: HoraryConsideration[];
  warnings: string[];
}

/**
 * Il tratto in cui la Luna non perfeziona più alcun aspetto maggiore prima di
 * lasciare il segno.
 *
 * Dura da pochi minuti a un giorno e mezzo. La tradizione sconsiglia di
 * cominciare qualcosa mentre è in corso — il perché è interpretazione, e sta
 * a chi legge; qui c'è solo quando comincia e quando finisce.
 */
export interface VoidOfCourse {
  /** Il segno che la Luna sta attraversando mentre è vuota. */
  sign: ZodiacSign;
  /** Il segno in cui entra, chiudendo il vuoto. */
  nextSign: ZodiacSign;
  /**
   * L'ultimo aspetto perfezionato prima del vuoto.
   *
   * Assente nel caso raro in cui la Luna attraversi un segno intero senza
   * concludere nulla: allora il vuoto comincia con l'ingresso stesso.
   */
  lastAspect?: { body: BodyId; aspect: AspectId };
  /** Inizio in UTC, ISO 8601. */
  start: string;
  /** Fine in UTC: l'istante in cui la Luna cambia segno. */
  end: string;
  /** Gli stessi due istanti nel fuso richiesto. */
  local: { start: string; end: string };
  /** Durata in minuti. */
  minutes: number;
}

/**
 * Il calendario elettivo di un luogo.
 *
 * Non contiene nessuna raccomandazione, ed è deliberato: dice com'è fatto il
 * tempo — chi regge ogni ora, che grado sorge, quando la Luna è vuota — e
 * lascia la scelta a chi consuma.
 */
export interface ElectionResult {
  range: PassageRange;
  place: Place;
  hours: PlanetaryHour[];
  voids: VoidOfCourse[];
  /**
   * I filtri applicati alla richiesta, se ce n'erano.
   *
   * Viaggia col risultato perché un elenco ridotto che non dichiari di esserlo
   * si legge come completo: sessanta ore al posto di settecento sembrerebbero
   * tutte quelle che esistono.
   */
  filters?: { rulers?: BodyId[]; skipMoonVoid?: boolean };
  /**
   * Avvertimenti non bloccanti: alba o tramonto non calcolabili alle latitudini
   * polari, corpi non disponibili, ripieghi sul sistema di case.
   */
  warnings: string[];
}
