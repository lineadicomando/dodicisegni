<!--
  Il glossario del Jyotisha.

  Il taglio, che vale per tutte e tre le famiglie: il glossario dice che
  cos'è un termine, in poche righe, e rimanda; /metodo e le sue pagine
  figlie dicono con quale convenzione il sito lo calcola. Il primo
  definisce, il secondo dichiara. Due pagine che dicono la stessa cosa si
  tolgono i lettori a vicenda: se una voce qui comincia a spiegare un
  calcolo, quel testo va spostato in /metodo e qui resta il rimando.

  Le voci non promettono niente. Che cos'è un nakshatra è un fatto; che cosa
  prometta a chi ci è nato no, e da qui non esce.
-->
<script lang="ts">
  import Meta from '#lib/components/Meta.svelte';
</script>

<Meta
  titolo="Jyotisha: glossario dei termini"
  descrizione="I termini dell'astrologia indiana in breve: graha, lagna, ayanamsa, nakshatra, dasha, varga, navamsa, drishti, panchanga, tithi, uccha e neecha."
/>

<p class="sopra"><a href="/glossario">Glossario</a></p>

<h1>Jyotisha: i termini</h1>
<p class="aggiornamento">
  Che cosa vogliono dire, in breve. Come il sito li calcola sta nel metodo.
</p>

<p>
  I termini restano in sanscrito, come in tutto il sito: tradurli produrrebbe
  parole che nessun libro usa e che non si possono cercare. La traslitterazione
  è quella semplice, senza segni diacritici: la stessa con cui si cercano.
</p>

<h2 id="fondamenti">Il cielo del Jyotisha</h2>

<h3 id="jyotisha">Jyotisha</h3>
<p>
  Il nome indiano dell'astrologia, da <em>jyotis</em>, luce, astro. Calcola
  nello zodiaco siderale, con nove corpi invece di dieci e con strumenti suoi:
  i nakshatra, le dasha, i varga, le drishti.
  → <a href="/metodo#jyotisha">Il metodo</a>
</p>

<h3 id="graha">Graha</h3>
<p>
  I nove corpi del Jyotisha: Sole, Luna, Mercurio, Venere, Marte, Giove,
  Saturno, Rahu e Ketu. Urano, Nettuno e Plutone non ne fanno parte: il
  sistema è più vecchio della loro scoperta, e le sue regole non li prevedono.
</p>

<h3 id="rahu-ketu">Rahu e Ketu</h3>
<p>
  I due nodi lunari, i punti in cui l'orbita della Luna taglia l'eclittica,
  trattati come graha con un nome: Rahu è il nodo nord, Ketu il sud, sempre
  opposti. Sul sito sono il nodo medio, come nel resto del tema.
  → <a href="/metodo#corpi">I corpi</a>
</p>

<h3 id="rashi">Rashi</h3>
<p>
  Il segno, una delle dodici parti da 30° dello zodiaco. La carta dei segni,
  quella di partenza, si chiama anche D-1.
</p>

<h3 id="lagna">Lagna</h3>
<p>
  Il segno che sorge all'orizzonte orientale nell'istante e nel luogo dati: il
  corrispondente dell'Ascendente. Senza l'ora di nascita non c'è.
</p>

<h3 id="ayanamsa">Ayanamsa</h3>
<p>
  L'arco fra il punto vernale, da cui l'astrologia occidentale fa cominciare
  l'Ariete, e l'inizio dell'Ariete siderale, ancorato alle stelle. Oggi vale
  poco più di ventiquattro gradi, e cresce di circa un grado ogni settantadue
  anni. Le scuole lo fissano in modi diversi: il sito ne offre sei.
  → <a href="/metodo#zodiaco">Lo zodiaco</a>
</p>

<h2 id="divisioni">Le divisioni del cerchio</h2>

<h3 id="nakshatra">Nakshatra</h3>
<p>
  Una delle ventisette parti da 13°20' in cui il Jyotisha divide lo zodiaco,
  le tappe di un giro della Luna. Ognuna ha un nome e un graha che la regge; il
  nakshatra della Luna alla nascita è quello da cui partono le dasha.
  → <a href="/metodo/nakshatra">Come si calcolano</a>
</p>

<h3 id="pada">Pada</h3>
<p>
  Un quarto di nakshatra, 3°20'. Sono centootto, nove per segno, e coincidono
  con le parti della navamsa.
  → <a href="/metodo/nakshatra#pada">I pada</a>
</p>

<h3 id="varga">Varga</h3>
<p>
  Una carta divisionale: ogni segno si divide in <em>n</em> parti e a
  ciascuna si assegna un segno, secondo una regola propria di quel varga. Si
  indicano con D seguito dal numero delle parti: D-9, D-10, D-30.
  → <a href="/metodo/varga">Le regole</a>
</p>

<h3 id="hora">Hora</h3>
<p>
  Il D-2, la divisione di ogni segno in due metà rette dal Sole e dalla Luna.
  Nel testo di Parashara la hora è di un luminare e non ha segno; l'uso
  corrente la manda al Leone o al Cancro.
  → <a href="/metodo/varga#hora">Le due letture</a>
</p>

<h3 id="navamsa">Navamsa</h3>
<p>
  Il D-9, la divisione di ogni segno in nove parti da 3°20'. È il varga più
  usato dopo la carta dei segni.
  → <a href="/metodo/varga#navamsa">Un esempio</a>
</p>

<h2 id="tempo">Il tempo</h2>

<h3 id="dasha">Dasha</h3>
<p>
  Un periodo della vita retto da un graha. Il sistema più diffuso, il
  <em>vimshottari</em>, divide un ciclo di centoventi anni fra i nove graha in
  quote fisse; ogni periodo, il <em>mahadasha</em>, si suddivide in
  <em>antardasha</em>, e questi in <em>pratyantardasha</em>.
  → <a href="/metodo/dasha">Come si calcolano</a>
</p>

<h3 id="panchanga">Panchanga</h3>
<p>
  Il calendario indiano, «cinque membra»: tithi, vara, nakshatra, yoga e
  karana. Descrive un istante in un luogo, non una persona.
  → <a href="/metodo/panchanga">Come si ricava</a>
</p>

<h3 id="tithi">Tithi</h3>
<p>
  Il giorno lunare: il tempo in cui la Luna si allontana dal Sole di 12°.
  Trenta fanno un mese, in due metà (<em>paksha</em>) di quindici: la
  crescente, <em>shukla</em>, e la calante, <em>krishna</em>.
  → <a href="/metodo/panchanga#tithi">Il tithi</a>
</p>

<h3 id="vara">Vara</h3>
<p>
  Il giorno della settimana, che nel panchanga comincia all'alba e non a
  mezzanotte.
  → <a href="/metodo/panchanga#vara">La vara</a>
</p>

<h3 id="yoga">Yoga</h3>
<p>
  Nel panchanga, una delle ventisette parti da 13°20' della somma delle
  longitudini di Sole e Luna. Nei temi natali la stessa parola indica invece
  una combinazione di graha descritta dai testi. Nessuna delle due ha a che
  fare con la disciplina.
  → <a href="/metodo/panchanga#yoga">Lo yoga del panchanga</a>
</p>

<h3 id="karana">Karana</h3>
<p>
  Mezzo tithi, 6° di distanza fra Luna e Sole: sessanta per mese lunare, di
  cui quattro fissi e cinquantasei che ripetono sette nomi.
  → <a href="/metodo/panchanga#karana">Il karana</a>
</p>

<h2 id="rapporti">I rapporti e le dignità</h2>

<h3 id="drishti">Drishti</h3>
<p>
  Lo sguardo di un graha su un segno. Si conta a segni interi e in avanti, senza
  orbita: tutti guardano il settimo segno da sé, Marte anche il quarto e
  l'ottavo, Giove il quinto e il nono, Saturno il terzo e il decimo.
  → <a href="/metodo/drishti">La tavola</a>
</p>

<h3 id="uccha-neecha">Uccha e neecha</h3>
<p>
  L'esaltazione e la debilitazione di un graha. Uccha è il segno in cui il
  graha è esaltato, con un grado di esaltazione più profonda; neecha è il
  segno opposto, allo stesso grado. Sul sito vengono dal <em>Brihat Parashara
  Hora Shastra</em>, 3.49-50. Per Rahu e Ketu lo stesso testo dà l'uccha in un
  altro capitolo (47.35), senza grado e senza dire il segno della neecha, che
  il sito quindi non indica.
</p>

<h3 id="moolatrikona">Moolatrikona</h3>
<p>
  «Trigono radice»: un tratto di uno dei segni propri di un graha, distinto
  dal resto del segno. Il Sole, per esempio, ha il moolatrikona nei primi venti
  gradi del Leone e il segno proprio negli altri dieci (BPHS 3.51-54).
</p>

<h3 id="swakshetra">Swakshetra</h3>
<p>
  Il segno proprio di un graha, quello che regge: il corrispondente del
  <a href="/glossario/tema#domicilio">domicilio</a> occidentale.
</p>
