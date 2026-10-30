<!--
  Il glossario del tema: zodiaco, case, aspetti, punti, dignità.

  Il taglio è scritto in testa a `../jyotisha/+page.svelte` e vale qui uguale:
  la voce definisce e rimanda, /metodo dichiara la convenzione.
-->
<script lang="ts">
  import Meta from '#lib/components/Meta.svelte';
</script>

<Meta
  titolo="Glossario del tema natale"
  descrizione="I termini del tema natale in breve: Ascendente, Medio Cielo, case, aspetti e orbite, Parte di Fortuna, nodi, domicilio, esaltazione, ricezione."
/>

<p class="sopra"><a href="/glossario">Glossario</a></p>

<h1>Il tema: i termini</h1>
<p class="aggiornamento">
  Che cosa vogliono dire, in breve. Come il sito li calcola sta nel metodo.
</p>

<h2 id="zodiaco-e-case">Lo zodiaco e le case</h2>

<h3 id="segno">Segno</h3>
<p>
  Una delle dodici parti uguali, di 30° ciascuna, in cui si divide l'eclittica,
  il cammino apparente del Sole nel cielo. Dove cominci il primo, l'Ariete,
  dipende dallo zodiaco.
</p>

<h3 id="zodiaco-tropicale">Zodiaco tropicale e siderale</h3>
<p>
  Due convenzioni su dove cominci l'Ariete. Il tropicale, dell'astrologia
  occidentale, lo fa cominciare all'equinozio di primavera; il siderale,
  dell'astrologia indiana, lo àncora alle stelle fisse. Lo scarto fra i due è
  l'<a href="/glossario/jyotisha#ayanamsa">ayanamsa</a>, oggi quasi un segno.
  → <a href="/metodo#zodiaco">Lo zodiaco</a>
</p>

<h3 id="effemeridi">Effemeridi</h3>
<p>
  Le tavole, oggi i programmi, che danno la posizione dei corpi celesti in un
  istante. Sono la parte astronomica del tema: tutto il resto è convenzione.
  → <a href="/metodo#effemeridi">Le effemeridi</a>
</p>

<h3 id="ascendente">Ascendente</h3>
<p>
  Il punto dell'eclittica che sorge all'orizzonte orientale nell'istante e nel
  luogo dati. Cambia di un grado ogni quattro minuti circa, e senza l'ora di
  nascita non si calcola. Il punto opposto è il Discendente.
  → <a href="/metodo#ora-ignota">Quando l'ora non si sa</a>
</p>

<h3 id="medio-cielo">Medio Cielo</h3>
<p>
  Il punto dell'eclittica che culmina, cioè attraversa il meridiano del luogo.
  Non coincide con lo zenit, il punto sopra la testa. Il punto opposto è il
  Fondo Cielo.
</p>

<h3 id="casa">Casa</h3>
<p>
  Una delle dodici parti in cui si divide il cielo di un luogo, a partire
  dall'orizzonte. I segni dipendono dalla posizione dei corpi nello zodiaco,
  le case dalla rotazione della Terra: per questo senza l'ora di nascita le
  case non ci sono.
</p>

<h3 id="cuspide">Cuspide</h3>
<p>
  Il punto in cui comincia una casa. Nella maggior parte dei sistemi la
  cuspide della prima è l'Ascendente e quella della decima il Medio Cielo.
</p>

<h3 id="sistema-di-case">Sistema di case</h3>
<p>
  La formula che divide il cielo in dodici case. Ne esistono molte, e danno
  cuspidi diverse: lo stesso pianeta può stare in decima con un sistema e in
  nona con un altro. Il sito ne offre nove, Placido il predefinito.
  → <a href="/metodo#case">I sistemi di case</a>
</p>

<h2 id="aspetti">Gli aspetti</h2>

<h3 id="aspetto">Aspetto</h3>
<p>
  Una distanza angolare fra due punti dello zodiaco, considerata quando cade
  vicino a certi angoli: 0° la congiunzione, 60° il sestile, 90° il quadrato,
  120° il trigono, 180° l'opposizione, più gli aspetti minori.
  → <a href="/metodo#aspetti">Gli aspetti</a>
</p>

<h3 id="orbita">Orbita</h3>
<p>
  La tolleranza entro cui un aspetto vale ancora: un quadrato con un'orbita di
  8° vale da 82° a 98°. Le orbite non si deducono da niente, si scelgono, e
  ogni scuola ha le sue; il sito usa tavole con un autore.
  → <a href="/metodo#aspetti">Le tavole</a>
</p>

<h3 id="aspetti-maggiori">Aspetti maggiori e minori</h3>
<p>
  I maggiori sono i cinque di Tolomeo: congiunzione, sestile, quadrato,
  trigono e opposizione. I minori sono quelli aggiunti più tardi:
  semisestile, quinconce, semiquadrato, sesquiquadrato, quintile e
  biquintile.
</p>

<h3 id="applicativo">Applicativo e separativo</h3>
<p>
  Un aspetto è applicativo quando la distanza dall'angolo esatto si sta
  stringendo, separativo quando si sta aprendo. Dipende dal moto di entrambi
  i corpi, non solo del più veloce.
</p>

<h2 id="punti">I punti e i corpi minori</h2>

<h3 id="parte-di-fortuna">Parte di Fortuna</h3>
<p>
  Un punto calcolato: l'Ascendente più la distanza fra Sole e Luna. Nella
  tradizione la formula si inverte nei temi notturni. Non tutti i programmi lo
  fanno, e così la stessa nascita può dare due Parti di Fortuna in segni
  diversi.
  → <a href="/metodo#fortuna">La formula</a>
</p>

<h3 id="tema-diurno">Tema diurno e notturno</h3>
<p>
  Un tema è diurno se il Sole sta sopra l'orizzonte, notturno se sta sotto.
  La tradizione lo chiama anche <em>setta</em>, e da lì dipendono la Parte di
  Fortuna e alcune dignità.
</p>

<h3 id="elementi-e-modalita">Elementi e modalità</h3>
<p>
  Due classificazioni dei segni. Gli elementi sono quattro, fuoco, terra, aria
  e acqua, e si ripetono in quest'ordine dall'Ariete. Le modalità sono tre,
  cardinale, fissa e mobile, e si ripetono anch'esse.
  → <a href="/metodo#distribuzione">Che cosa si conta</a>
</p>

<h3 id="nodi-lunari">Nodi lunari</h3>
<p>
  I due punti in cui l'orbita della Luna taglia l'eclittica, sempre opposti.
  Il nodo medio ne segue il moto medio, il nodo vero quello effettivo, e
  distano fino a un grado e mezzo: il sito usa il medio.
  → <a href="/metodo#corpi">I corpi</a>
</p>

<h3 id="lilith">Lilith</h3>
<p>
  La Luna Nera: il punto dell'orbita lunare più lontano dalla Terra,
  l'apogeo. Come per i nodi ne esistono una versione media e una vera; il sito
  usa la media.
</p>

<h3 id="chirone">Chirone</h3>
<p>
  Un corpo minore che orbita fra Saturno e Urano, scoperto nel 1977. Si calcola
  solo con il file di effemeridi degli asteroidi.
</p>

<h2 id="dignita">Le dignità</h2>

<h3 id="domicilio">Domicilio</h3>
<p>
  Il segno retto da un pianeta. Nella tradizione i sette pianeti si dividono i
  dodici segni, due ciascuno tranne Sole e Luna; nell'uso moderno lo
  Scorpione, l'Acquario e i Pesci passano a Plutone, Urano e Nettuno.
  → <a href="/metodo#dignita">Le dignità</a>
</p>

<h3 id="esilio">Esilio</h3>
<p>
  Il segno opposto al domicilio.
</p>

<h3 id="esaltazione">Esaltazione e caduta</h3>
<p>
  L'esaltazione è un segno, e nella tradizione un grado, in cui un pianeta è
  particolarmente forte; la caduta è il segno opposto. Il Sole, per esempio, è
  esaltato in Ariete e cade in Bilancia.
</p>

<h3 id="triplicita">Triplicità</h3>
<p>
  I pianeti che reggono un elemento, cioè i tre segni che lo condividono, con
  un reggente diurno e uno notturno. Le scuole le assegnano in modi diversi.
</p>

<h3 id="termini">Termini</h3>
<p>
  Tratti di ampiezza disuguale in cui ogni segno è diviso, ciascuno assegnato a
  uno dei cinque pianeti che non sono luminari. Le tavole cambiano da autore
  ad autore.
</p>

<h3 id="facce">Facce</h3>
<p>
  I tre tratti di 10° di ogni segno, assegnati ai sette pianeti nell'ordine
  caldeo a partire da Marte nel primo dell'Ariete. Altrove si chiamano decani.
</p>

<h3 id="peregrino">Peregrino</h3>
<p>
  Un pianeta che nel punto in cui si trova non ha nessuna dignità essenziale:
  né domicilio, né esaltazione, né triplicità, né termine, né faccia.
</p>

<h3 id="ricezione">Ricezione</h3>
<p>
  Il rapporto fra due pianeti quando uno sta in una dignità dell'altro. È mutua
  se ciascuno sta in una dignità dell'altro, come Marte in Toro e Venere in
  Ariete.
</p>

<h3 id="fortezze-e-debilita">Fortezze e debilità</h3>
<p>
  Nel metodo di Lilly, i punti che una tavola assegna alle condizioni buone e
  cattive di un pianeta, dalle dignità alla distanza dal Sole. Si sommano
  separatamente e poi si confrontano.
  → <a href="/metodo#lilly">Il conto di Lilly</a>
</p>
