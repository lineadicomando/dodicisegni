<!--
  Le convenzioni con cui il sito calcola, dette a chi legge.

  Non è documentazione per chi tocca il codice — quella sta nei commenti, che
  restano la fonte — ma il rovescio del vincolo che regge tutto il progetto: se
  il motore promette predicati che chiunque può ricalcolare, allora deve dire
  con quale convenzione li ha calcolati, e deve dirlo dove il risultato si
  guarda e non solo dentro un `warnings` che nessuno apre.

  Ogni numero qui dentro sta anche in `packages/core`, ed è il posto in cui
  cambia per primo: `orbite.ts` per le orbite, `constants.ts` per corpi e
  sistemi di case, `ayanamsa.ts` per i sei ayanamsa. Le cinque parti
  dell'astrologia indiana hanno ciascuna una pagina qui sotto, con le tavole
  di `nakshatra.ts`, `dasha.ts`, `varga.ts` e `drishti.ts`, che
  `jyotisha.test.ts` guarda come `orbite.test.ts` guarda le orbite. Quando
  quelli cambiano, questa pagina è vecchia. Generarla dai valori vorrebbe dire
  ridurre la prosa a una tabella, che è esattamente la cosa che una pagina come
  questa non deve essere; un test però guarda le due tavole delle orbite,
  cella per cella, e cade se `orbite.ts` cambia (`orbite.test.ts`, qui
  accanto). I sistemi di case e gli ayanamsa nessun test li vede.
-->
<script lang="ts">
  import Meta from '#lib/components/Meta.svelte';
</script>

<Meta
  titolo="Metodo: case, ayanamsa, orbite e dasha"
  descrizione="Le convenzioni con cui il sito calcola: effemeridi, ayanamsa, sistemi di case, orbite degli aspetti, Parte di Fortuna, nakshatra, dasha, varga e le dignità di Lilly."
/>

<h1>Metodo</h1>
<p class="aggiornamento">
  Con quali convenzioni questo sito calcola, e dove le scuole non vanno
  d'accordo.
</p>

<div class="sintesi">
  <ul>
    <li>Il calcolo è deterministico: stessi dati in ingresso, stesso risultato.</li>
    <li>Dove le scuole divergono, la convenzione usata viaggia accanto al numero.</li>
    <li>Quello che i numeri significhino non lo dice mai nessuna pagina di questo sito.</li>
  </ul>
</div>

<p>
  Un tema natale non è una misura: è una misura <em>più</em> una lunga fila di
  convenzioni. Due programmi che partono dalla stessa nascita danno due carte
  diverse, e quasi mai perché uno dei due sbaglia i conti, ma perché contano
  l'inizio dell'Ariete da due punti diversi, dividono le case con due formule
  diverse, chiamano aspetto due angoli diversi. Questa pagina elenca le scelte
  fatte qui, così che chi trova un risultato diverso altrove possa vedere dove
  le due strade si separano invece di chiedersi chi ha ragione. Che cosa
  vogliano dire i termini, in breve, lo dice il <a href="/glossario">glossario</a>.
</p>

<h2 id="predicati">Che cosa il motore dice e che cosa tace</h2>

<p>
  Il confine è netto e non è una modestia di facciata: il motore emette
  <strong>predicati verificabili</strong>, cioè affermazioni che chiunque può
  ricalcolare dagli stessi dati di partenza seguendo la convenzione dichiarata
  accanto al risultato. «La Luna è a 12°34' dello Scorpione», «sette corpi su
  dieci cadono in segni d'acqua», «Saturno torna diretto il 15 novembre alle
  03:41 UTC» sono predicati. «Saturno in settima ritarda il matrimonio» non lo
  è, e da questo sito non esce.
</p>

<p>
  Il confine non è l'ampiezza del calcolo ma il significato: un conteggio esteso
  a tutto il tema si può fare, un'inferenza su una vita no. È la stessa riga che
  separa il settore diurno dal carattere di chi è nato di giorno: il motore
  produce il primo e tace sul secondo.
</p>

<h2 id="effemeridi">Le effemeridi</h2>

<p>
  Le posizioni vengono da <a href="https://www.astro.com/swisseph/" target="_blank" rel="noopener">Swiss
  Ephemeris</a>, che è lo standard di fatto anche dei programmi commerciali.
  Quando i suoi file di dati non sono installati il motore ripiega sulle
  effemeridi analitiche di Moshier: il sito resta utilizzabile, le posizioni
  scartano di meno di un secondo d'arco dal Sole a Saturno e di un paio sulla
  Luna, di più sui pianeti lenti e lontano dal presente (irrilevante per un
  tema, dove il grado è già una misura fine), e <strong>Chirone non è più
  calcolabile</strong>, perché richiede il file degli asteroidi. Gli scarti
  non vengono dalla documentazione: sono misurati da un test del motore.
</p>

<p>
  Quale delle due strade sia stata presa non resta implicito: finisce fra le
  avvertenze che accompagnano il risultato. È la regola generale del motore:
  <strong>il fallimento è parziale</strong>. Un corpo che non si riesce a
  calcolare produce un avviso e non un errore, e la carta arriva lo stesso con
  tutto il resto.
</p>

<h2 id="zodiaco">Lo zodiaco, e i ventiquattro gradi di differenza</h2>

<p>
  I due zodiaci non sono due astronomie: sono due convenzioni su dove cominci
  l'Ariete. Quello <strong>tropicale</strong>, usato dall'astrologia
  occidentale, lo fa cominciare al punto vernale (l'equinozio di primavera),
  che per via della precessione degli equinozi arretra di circa un grado ogni
  settantadue anni. Quello <strong>siderale</strong>, usato dall'astrologia
  indiana, lo àncora alle stelle fisse.
</p>

<p>
  Lo scarto fra i due si chiama <em>ayanamsa</em> e oggi vale poco più di
  ventiquattro gradi: quasi un segno intero. Vuol dire che la stessa persona ha
  quasi sempre due Soli diversi a seconda della convenzione, e che chi si è
  visto dire due segni solari diversi non è stato ingannato da nessuno dei due.
</p>

<p>
  Non esiste un ayanamsa giusto: dipende da quale stella si prende come chiodo
  e a quale longitudine la si fissa. Fra Lahiri (l'ufficiale del governo
  indiano, e il predefinito qui) e Raman corre più di un grado e mezzo,
  abbastanza da spostare la Luna di un nakshatra e con essa l'intera sequenza
  delle dasha. Il sito ne espone sei: <strong>Lahiri</strong>,
  <strong>Chitrapaksha vero</strong>, <strong>Krishnamurti</strong>,
  <strong>Raman</strong>, <strong>Yukteshwar</strong> e
  <strong>Fagan/Bradley</strong>. Il valore in gradi viaggia col risultato, non
  solo il nome.
</p>

<h2 id="case">I sistemi di case</h2>

<p>
  Nove, e la scelta cambia la carta più di quanto si creda: uno stesso pianeta
  può stare in decima con Placido e in nona a segni interi. Sono
  <strong>Placido</strong> (il predefinito, e il più diffuso in Occidente),
  <strong>Koch</strong>, <strong>segni interi</strong>, <strong>equale</strong>,
  <strong>Regiomontano</strong>, <strong>Campano</strong>,
  <strong>Porfirio</strong>, <strong>topocentrico</strong> e
  <strong>Alcabizio</strong>.
</p>

<p>
  Placido e Koch <strong>non sono definiti alle latitudini polari</strong>: oltre
  il circolo polare certe cuspidi non esistono. In quel caso Swiss Ephemeris
  ripiega da sé su Porfirio, e il sito lo riporta fra le avvertenze invece di
  tacerlo, perché è un'altra carta e non la stessa carta con un dettaglio in
  meno.
</p>

<p>
  Il sistema di case usato viaggia col tema. Anche il sistema Gauquelin, che
  divide il cielo in trentasei settori invece che in dodici, non è supportato:
  produce un errore esplicito, non dodici cuspidi arbitrarie.
</p>

<h2 id="ora-ignota">Quando l'ora di nascita non si sa</h2>

<p>
  Il sito calcola lo stesso, e non chiede di inventare un'ora. Quello che cade è
  tutto e solo ciò che dipende dalla rotazione della Terra: niente Ascendente,
  niente Medio Cielo, nessuna casa, nessuna Parte di Fortuna (che si costruisce
  sull'Ascendente) e nessun settore diurno o notturno. Restano le posizioni nei
  segni e gli aspetti fra i corpi.
</p>

<p>
  La Luna resta il dato più fragile: percorre circa tredici gradi al giorno,
  quindi su una nascita a ora ignota il suo grado è incerto di mezzo segno. È
  una carta più povera, non una carta approssimata.
</p>

<h2 id="corpi">I corpi</h2>

<p>
  Di serie: i dieci fra luminari e pianeti (Sole, Luna, Mercurio, Venere,
  Marte, Giove, Saturno, Urano, Nettuno, Plutone), più l'asse dei Nodi lunari.
  Su richiesta anche <strong>Lilith</strong> e <strong>Chirone</strong>.
</p>

<p>
  Due precisazioni che altrove restano implicite. Il <strong>Nodo Nord è il nodo
  medio</strong>, non quello vero: sono due punti che distano fino a un grado e
  mezzo, e i programmi si dividono su quale usare. Il Nodo Sud non è calcolato
  ma derivato, essendo per definizione all'opposizione esatta del Nord; per la
  stessa ragione non compare fra i corpi in transito, dove ogni sua riga sarebbe
  una riga già presente letta al contrario, e non gli si assegna nessun aspetto
  col Nord. <strong>Lilith è l'apogeo lunare medio</strong>, la cosiddetta Luna
  Nera; anche qui la variante vera esiste ed è un altro punto.
</p>

<p>
  I <em>graha</em>, che è come l'astrologia indiana chiama i corpi, quando
  sono retrogradi si marcano con <code>℞</code>.
</p>

<h2 id="aspetti">Gli aspetti e le orbite</h2>

<p>
  Un aspetto è una distanza angolare fra due punti, ammessa entro una tolleranza
  che si chiama orbita. Le orbite sono la convenzione su cui i programmi
  divergono di più, perché non discendono da niente: si scelgono. Il sito non
  ne sceglie una sua. Usa tavole che hanno un autore e una fonte, e ogni tema,
  ogni cielo e ogni elenco di transiti dice sotto gli aspetti con quale li ha
  trovati.
</p>

<table>
  <thead>
    <tr>
      <th>Aspetto</th>
      <th>Angolo</th>
      <th>Greene</th>
      <th>Leo</th>
      <th>Hand, transiti</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Congiunzione</td><td>0°</td><td>10°</td><td>8°</td><td>1°</td></tr>
    <tr><td>Opposizione</td><td>180°</td><td>10°</td><td>8°</td><td>1°</td></tr>
    <tr><td>Trigono</td><td>120°</td><td>10°</td><td>8°</td><td>1°</td></tr>
    <tr><td>Quadrato</td><td>90°</td><td>10°</td><td>8°</td><td>1°</td></tr>
    <tr><td>Sestile</td><td>60°</td><td>6°</td><td>7°</td><td>1°</td></tr>
    <tr><td>Semisestile</td><td>30°</td><td>3°</td><td>2°</td><td>1°</td></tr>
    <tr><td>Quinconce</td><td>150°</td><td>3°</td><td>2°</td><td>1°</td></tr>
    <tr><td>Semiquadrato</td><td>45°</td><td>3°</td><td>4°</td><td>1°</td></tr>
    <tr><td>Sesquiquadrato</td><td>135°</td><td>3°</td><td>4°</td><td>1°</td></tr>
    <tr><td>Quintile</td><td>72°</td><td>2°</td><td>—</td><td>1°</td></tr>
    <tr><td>Biquintile</td><td>144°</td><td>2°</td><td>—</td><td>1°</td></tr>
  </tbody>
</table>

<p>
  <strong>Greene</strong> è la predefinita del tema e del cielo: è la tavola che
  Astrodienst usa sul suo sito e che dichiara di Liz Greene, e quindi quella che
  più persone si sono viste davanti. È uguale per tutti i pianeti, Chirone
  compreso. I nodi, Lilith, gli assi e la Parte di Fortuna sono punti senza
  orbita propria: con un pianeta vale metà della sua, fra loro nessun aspetto.
  <strong>Leo</strong> è quella di <em>How to Judge a Nativity</em> (1928, p.
  47): 8° fra pianeti, che diventano 10° con un luminare e 12° fra Sole e Luna,
  ma solo per congiunzione e opposizione. Il quintile in Leo non c'è, e con le
  sue orbite il sito non lo calcola: una scuola si prende intera.
</p>

<p>
  La terza è di <strong>William Lilly</strong>, <em>Christian Astrology</em>
  (1647), e non entra nella tavola come quarta colonna perché funziona in un
  altro modo: l'orbita non è dell'aspetto ma <strong>del pianeta</strong>
  (p. 107), e due pianeti sono in aspetto entro la metà dell'orbita dell'uno
  più la metà di quella dell'altro (p. 110). Sole e Luna, per esempio, entro
  8°30' più 6°15', cioè 14°45', per qualunque dei cinque aspetti che Lilly
  tratta; i minori non li considera. Lilly stampa due colonne e dice sua la
  prima, che è quella usata qui. Urano, Nettuno, Plutone, Chirone, i nodi e gli
  assi non stanno nella sua tavola, e con queste orbite non fanno aspetti.
</p>

<table>
  <thead>
    <tr>
      <th>Pianeta</th>
      <th>Orbita di Lilly</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Sole</td><td>17°</td></tr>
    <tr><td>Luna</td><td>12°30'</td></tr>
    <tr><td>Mercurio</td><td>7°</td></tr>
    <tr><td>Venere</td><td>8°</td></tr>
    <tr><td>Marte</td><td>7°30'</td></tr>
    <tr><td>Giove</td><td>12°</td></tr>
    <tr><td>Saturno</td><td>10°</td></tr>
  </tbody>
</table>

<p>
  Gli aspetti minori (semisestile, quinconce, semiquadrato, sesquiquadrato, e
  con Greene quintile e biquintile) <strong>sono esclusi finché non si
  chiedono</strong>: la tabella predefinita porta i cinque maggiori.
</p>

<p>
  Le orbite dei transiti sono molto più strette e non per gusto: con le orbite
  natali un transito di Saturno resterebbe «in aspetto» per mesi di fila, e il
  quadro del momento diventerebbe un elenco di contatti permanenti che non
  distingue il giorno in cui l'aspetto si perfeziona da quello prima e da quello
  dopo. Sono quelle di <strong>Robert Hand</strong>, un grado per ogni transito,
  come Astrodienst le dichiara per le sue previsioni; valgono anche per le
  finestre dei passaggi e per gli incontri fra i corpi in cielo, che Hand non
  nomina. È l'unica tavola dei transiti con un autore che si sia trovata.
</p>

<p>
  Ogni aspetto porta anche la direzione (<strong>applicativo</strong> se la
  distanza si sta stringendo, <strong>separativo</strong> se si sta aprendo),
  ricavata dal moto di entrambi i punti e non dal solo più veloce.
</p>

<h2 id="fortuna">La Parte di Fortuna</h2>

<p>
  Proietta sull'Ascendente la distanza fra Sole e Luna. È il caso da manuale di
  convenzione divergente: nella tradizione ellenistica e medievale la formula
  <strong>si inverte nei temi notturni</strong>, mentre parte dei programmi
  moderni usa sempre la forma diurna. Su un tema notturno le due danno risultati
  che possono distare oltre cento gradi: non un dettaglio, un altro punto in un
  altro segno.
</p>

<p>
  Qui il predefinito è la formula che tiene conto del settore, cioè quella che
  si inverte di notte. L'altra resta disponibile, e serve soprattutto a
  riprodurre il risultato di un altro programma quando lo si sta confrontando.
  La formula usata è dichiarata accanto al punto.
</p>

<p>
  Un tema è diurno quando il Sole sta sopra l'orizzonte, notturno quando sta
  sotto. Da che parte stia non si decide dal numero di casa del Sole ma
  geometricamente, dall'arco fra Discendente e Ascendente: nei segni interi la
  settima casa non comincia al Discendente, e «casa maggiore o uguale a sette»
  darebbe la risposta sbagliata.
</p>

<h2 id="distribuzione">La distribuzione fra elementi e modalità</h2>

<p>
  Che l'Ariete sia di fuoco non è interpretazione ma classificazione, e su
  quella non c'è scuola che dissenta da Tolomeo in poi. Il punto delicato non è
  contare: è <strong>decidere che cosa contare</strong>. Includere gli assi? La
  Parte di Fortuna? I Nodi? Le scuole non concordano, e un totale solo
  nasconderebbe la scelta dentro un numero.
</p>

<p>
  Qui la decisione non si prende. I dieci fra luminari e pianeti fanno un gruppo,
  e ciò che sta oltre (Nodi, Lilith, Chirone, assi, Parte di Fortuna) viene
  contato a parte invece che escluso. Ogni gruppo porta con sé
  <strong>l'elenco di ciò che ha contato</strong>, così che chi conta
  diversamente possa rifare la somma senza rifare il tema.
</p>

<h2 id="jyotisha">L'astrologia indiana</h2>

<p>
  I termini restano in sanscrito, qui come nel resto del sito: <em>nakshatra</em>,
  <em>dasha</em>, <em>varga</em>, <em>drishti</em>, <em>tithi</em>. Tradurli
  produrrebbe parole che nessun libro usa e che non si possono cercare da
  nessuna parte, e «dimore lunari» per i nakshatra è una perifrasi, non un nome.
  Tutto quello che segue vale <strong>nello zodiaco siderale</strong>.
</p>

<p>
  Ciascuna delle cinque parti ha una pagina sua, con le tavole e un esempio da
  rifare a mano:
</p>

<ul>
  <li id="nakshatra">
    <a href="/metodo/nakshatra"><strong>I nakshatra</strong></a>: lo zodiaco in
    ventisette parti da 13°20', ciascuna divisa in quattro pada, e il graha che
    regge ognuna.
  </li>
  <li id="dasha">
    <a href="/metodo/dasha"><strong>Le dasha vimshottari</strong></a>: il ciclo
    di centoventi anni diviso fra i nove graha, il saldo alla nascita e le
    suddivisioni; l'unico calcolo in cui un secondo d'arco vale ore.
  </li>
  <li id="varga">
    <a href="/metodo/varga"><strong>I varga</strong></a>: le carte
    divisionali. Il sito calcola le sedici del testo, e la regola di ciascuna
    viaggia col risultato.
  </li>
  <li id="drishti">
    <a href="/metodo/drishti"><strong>Le drishti</strong></a>: gli sguardi dei
    graha, a segni interi e in un verso solo.
  </li>
  <li id="panchanga">
    <a href="/metodo/panchanga"><strong>Il panchanga</strong></a>: tithi, vara,
    nakshatra, yoga e karana, da due longitudini e un'alba.
  </li>
</ul>

<h2 id="elezione">L'elezione: le ore planetarie</h2>

<p>
  Qui l'istante non si riceve, si cerca. Il calcolo dice di che cosa è fatto il
  tempo in un certo luogo, e tre cose lo rendono diverso dal resto del sito.
</p>

<ul>
  <li>
    <strong>Dipende dal luogo più di ogni altro calcolo.</strong> Alba e tramonto
    muovono tutto: a parità di istante, un'ora planetaria di Palermo non è quella
    di Oslo.
  </li>
  <li>
    <strong>Le ore non durano un'ora.</strong> Il giorno si divide comunque in
    dodici parti (lunghe d'estate, corte d'inverno) e la notte per differenza.
  </li>
  <li>
    <strong>Il giorno comincia all'alba</strong>, non a mezzanotte: il reggitore
    di lunedì entra in carica quando il Sole sorge, non quando scatta la data.
  </li>
</ul>

<p>
  La successione dei reggitori segue l'ordine caldeo, cioè i sette pianeti
  classici per velocità apparente decrescente. Ventiquattro ore avanzano di tre
  posizioni nella catena, ed è da questo scarto che nasce l'ordine dei giorni
  della settimana, che infatti non è quello dei pianeti, e che sopravvive
  intatto nei nomi italiani dei giorni.
</p>

<p>
  Accanto alle ore compare il <strong>vuoto di corso</strong> della Luna: il
  tratto in cui non perfeziona più alcun aspetto maggiore prima di lasciare il
  segno, e che dura da pochi minuti a un giorno e mezzo. È il criterio moderno;
  quello di Lilly, più stretto, è detto <a href="#lilly">qui sotto</a>. Il sito
  dice quando comincia e quando finisce. Che la tradizione sconsigli di cominciare qualcosa
  mentre è in corso è interpretazione, e sta a chi legge.
</p>

<p>
  Nessuna di queste pagine dice quale ora sia propizia. Il risultato è un
  calendario, non una classifica, ed è una scelta di fondo: una graduatoria
  sarebbe un giudizio travestito da numero.
</p>

<h2 id="lilly">La scuola di Lilly: dignità, Luna vuota, astrologia oraria</h2>

<p>
  William Lilly, <em>Christian Astrology</em> (Londra 1647), è l'unico testo
  della tradizione occidentale che il sito segua per intero, con le sue tavole,
  le sue soglie e i suoi pesi, e ogni regola porta la pagina del libro. La
  ragione è pratica: il metodo vi è svolto su esempi abbastanza minuti da
  poterli ricalcolare, e il test del motore lo fa. Le pagine si leggono sulla
  scansione della prima edizione, che è di pubblico dominio, non sulle
  trascrizioni che circolano in rete.
</p>

<p>
  <strong>Le dignità.</strong> Senza chiedere niente, il tema tropicale porta
  due colonne affiancate e mai fuse: i domicili tradizionali, con esilio,
  esaltazione e caduta, che sono la parte su cui Tolomeo, Firmico e Lilly
  concordano; e i domicili moderni, con Urano, Nettuno e Plutone, che un autore
  unico non hanno. Triplicità, termini e facce non compaiono finché non si
  nomina una scuola, perché lì le scuole divergono davvero. Nominando Lilly
  entra la sua tavola di p. 104 intera: le esaltazioni col grado e quelle dei
  nodi, le triplicità di giorno e di notte con Marte signore dell'acqua, i suoi
  termini e le facce. Le ricezioni sono quelle di p. 112, per qualunque delle
  cinque dignità. Nello zodiaco siderale le dignità occidentali non ci sono, e
  chiederle è un errore: la tavola è scritta per i segni tropicali.
</p>

<p id="tolomeo">
  <strong>Le dignità di Tolomeo.</strong> Al posto di Lilly si può nominare
  Tolomeo, <em>Tetrabiblos</em> I.17-21, nell'edizione di Robbins (Loeb, 1940).
  Entra quello che Tolomeo dà: i domicili, le esaltazioni per segno senza
  gradi, i signori dei quattro triangoli, con chi li governa di giorno e di
  notte e nell'acqua Marte con Venere o la Luna, e i suoi termini. Non entra
  quello che non ha: le facce di dieci gradi, l'esilio, un punteggio. Nemmeno
  la ricezione, che è una definizione di Lilly: contarla sui termini di
  Tolomeo farebbe una dottrina che nessuno dei due ha scritto, e con Tolomeo le
  ricezioni restano per domicilio ed esaltazione. I termini sono quelli della
  tavola greca di Robbins, letta sulla scansione, che dà a ogni pianeta la
  stessa somma di gradi dei termini egizi, come Tolomeo dice che deve essere.
  Non sono i termini che Lilly chiama «secondo Tolomeo»: differiscono in sette
  segni, quasi tutti per varianti dei manoscritti che la parafrasi di Proclo
  riporta. Nel Leone la tavola mette primo Giove, mentre il testo assegna il
  segno a Saturno: il sito segue la tavola, e lo dice.
</p>

<p>
  <strong>Il conto delle fortezze.</strong> A p. 115 Lilly stampa una tavola che
  assegna punti a ogni condizione di un pianeta: le dignità, la casa (con la
  regola dei cinque gradi di p. 33), la distanza dal Sole (cazimi, combusto
  entro 8°30', sotto i raggi entro 17°), il moto rispetto al suo moto medio,
  l'essere orientale o occidentale, l'assedio fra Saturno e Marte, la vicinanza
  a Regolo, Spica e Algol. Il sito dà i punti uno per uno, le fortezze, le
  debilità e la differenza, come Lilly li somma nell'esempio di pp. 177-181.
  Non dice la seconda metà della sua frase, che il pianeta «is therefore
  unfortunate». Dove l'esempio svolto non segue la sua stessa tavola, il sito
  segue la tavola, e lo dice.
</p>

<p>
  <strong>La Luna vuota di corso, due volte.</strong> Il criterio moderno, quello
  del calendario elettivo, la vuole vuota dall'ultimo aspetto esatto al cambio
  di segno. Quello di Lilly (p. 112) guarda anche gli aspetti che la Luna sta
  ancora formando quando esce dal segno: se è già in orbita con un pianeta,
  secondo le metà delle orbite di p. 107, quella è un'applicazione e la Luna non
  è vuota. Le due definizioni danno tratti diversi. Il calendario elettivo usa
  la moderna; il corso di un pianeta fino al cambio di segno, che sta sotto il
  tema orario, le porta tutte e due col loro nome invece di sceglierne una.
</p>

<p>
  <strong>Il tema orario.</strong> L'astrologia oraria legge una domanda, non
  una nascita: la figura è eretta per l'istante e il luogo in cui la domanda è
  posta, col sistema di case Regiomontano, come le figure del secondo libro.
  La casa della cosa domandata è un dato che si fornisce, anche derivata (la
  seconda dalla settima, per esempio): il sito non la ricava dalla domanda.
  Il calcolo dice chi sono i significatori (pp. 123-124) e come la figura porta
  al loro incontro secondo le definizioni di Lilly: per aspetto, per
  traslazione o per collezione di luce (pp. 125-126), o come lo impedisce, per
  proibizione, frustrazione o refranazione (pp. 110-113). Le considerazioni
  prima del giudizio di pp. 121-123 sono riportate come fatti, mai come un
  rifiuto di calcolare. Il sì o il no, e quando, restano a chi legge. Il tema
  orario non ha ancora una pagina sua: lo calcolano l'interfaccia REST, la riga
  di comando e il server MCP.
</p>

<h2 id="rifare-i-conti">Rifare i conti</h2>

<p>
  Tutto quello che l'interfaccia mostra è disponibile anche altrove, con gli
  stessi parametri: un'<strong>interfaccia REST</strong> sotto
  <code>/api</code>, in cui ogni endpoint è una richiesta <code>GET</code>
  perché un tema è una funzione pura dei suoi argomenti; una <strong>riga di
  comando</strong>; e un <strong>server MCP</strong> per chi lavora con un
  assistente. I parametri sono documentati nei commenti delle rotte e nelle
  descrizioni dei tool, che restano la fonte.
</p>

<p>
  Il codice è pubblico e la licenza è AGPL-3.0-or-later: chiunque può leggere
  come ciascuno di questi numeri viene fuori, e correggerlo se è sbagliato. È il
  senso di questa pagina: non chiedere fiducia, ma dire dove guardare.
</p>
