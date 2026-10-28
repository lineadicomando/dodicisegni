<!--
  I varga, staccati da /metodo perché il termine si cerca da solo.

  La tavola ricopia `VARGAS` in `packages/core/src/varga.ts`: sigla, nome e
  numero delle parti li guarda `../jyotisha.test.ts`; le regole sono la
  `rule` di ciascuno, che il test non confronta per non legare la prosa. Un
  varga nuovo va aggiunto qui a mano, e il test cade finché manca.
-->
<script lang="ts">
  import Meta from '#lib/components/Meta.svelte';
</script>

<Meta
  titolo="I varga: come si calcolano le divisionali"
  descrizione="Le carte divisionali del Jyotisha (hora D-2, D-3, D-4, D-7, navamsa D-9, D-10, D-12, D-16, D-20, D-24, D-27, D-30): la regola di ciascuna, un esempio svolto, e perché la regola viaggia col risultato."
/>

<p class="sopra"><a href="/metodo#jyotisha">Metodo</a> · astrologia indiana</p>

<h1>I varga</h1>
<p class="aggiornamento">
  Le carte divisionali, e la regola con cui il sito ricava ciascuna.
</p>

<p>
  Un varga divide ogni segno in <em>n</em> parti e assegna a ciascuna un segno,
  secondo una regola che cambia da varga a varga. Ne esce una carta nuova, con
  gli stessi corpi in posti diversi: il D-9 di una nascita è una seconda carta,
  non una colonna della prima. Il numero dopo la D dice in quante parti si
  divide il segno.
</p>

<p>
  Fra le sedici divisioni classiche le scuole divergono su più d'una, e un segno
  consegnato senza la regola che l'ha prodotto non si può ricontrollare: per
  questo <strong>la regola viaggia col risultato</strong>, scritta per esteso
  accanto alla carta. A che cosa serva ciascun varga è interpretazione e sta a
  chi legge; che cosa ciascuno sia è aritmetica, ed è dichiarata.
</p>

<h2 id="regole">I tredici che il sito calcola</h2>

<table class="testo">
  <thead>
    <tr>
      <th>Varga</th>
      <th>Nome</th>
      <th>Parti</th>
      <th>Regola</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>D-1</td><td>Rashi</td><td>1</td><td>Il segno stesso: è la carta di partenza.</td></tr>
    <tr><td>D-2</td><td>Hora</td><td>2</td><td>Due parti da 15°, la hora del Sole e quella della Luna, rovesciate fra segni dispari e pari. Se abbiano un segno lo dice la convenzione: vedi <a href="#hora">sotto</a>.</td></tr>
    <tr><td>D-3</td><td>Drekkana</td><td>3</td><td>Tre parti da 10°: la prima al segno stesso, la seconda al quinto da lui, la terza al nono.</td></tr>
    <tr><td>D-4</td><td>Chaturthamsa</td><td>4</td><td>Quattro parti da 7°30': al segno stesso, al quarto, al settimo e al decimo da lui.</td></tr>
    <tr><td>D-7</td><td>Saptamsa</td><td>7</td><td>Sette parti da 4°17'8,57". Nei segni dispari si parte dal segno stesso, nei pari dal settimo.</td></tr>
    <tr><td>D-9</td><td>Navamsa</td><td>9</td><td>Nove parti da 3°20'. Si parte dal segno stesso se è cardinale, dal nono se è fisso, dal quinto se è mobile.</td></tr>
    <tr><td>D-10</td><td>Dasamsa</td><td>10</td><td>Dieci parti da 3°. Nei segni dispari si parte dal segno stesso, nei pari dal nono.</td></tr>
    <tr><td>D-12</td><td>Dwadasamsa</td><td>12</td><td>Dodici parti da 2°30'. Si parte sempre dal segno stesso.</td></tr>
    <tr><td>D-16</td><td>Shodasamsa</td><td>16</td><td>Sedici parti da 1°52'30". Si parte dall'Ariete se il segno è cardinale, dal Leone se è fisso, dal Sagittario se è mobile.</td></tr>
    <tr><td>D-20</td><td>Vimsamsa</td><td>20</td><td>Venti parti da 1°30'. Si parte dall'Ariete se il segno è cardinale, dal Sagittario se è fisso, dal Leone se è mobile.</td></tr>
    <tr><td>D-24</td><td>Siddhamsa</td><td>24</td><td>Ventiquattro parti da 1°15'. Nei segni dispari si parte dal Leone, nei pari dal Cancro.</td></tr>
    <tr><td>D-27</td><td>Nakshatramsa</td><td>27</td><td>Ventisette parti da 1°06'40", contate di seguito dall'Ariete lungo tutto lo zodiaco.</td></tr>
    <tr><td>D-30</td><td>Trimsamsa</td><td>30</td><td>Cinque tratti disuguali, retti da Marte, Saturno, Giove, Mercurio e Venere; rovesciati nei segni pari.</td></tr>
  </tbody>
</table>

<p>
  Le altre tre divisioni classiche, le più fini (D-40, D-45, D-60), non sono
  ancora calcolate. Le regole si biforcano in modi diversi, ed è il motivo per
  cui la tavola non è una formula sola: il D-3 procede per trigoni, il D-4 per
  kendra, il D-9 parte da dove dice la modalità del segno, il D-7 e il D-10 da
  dove dice la sua parità, il D-12 riparte sempre dal segno stesso. Il D-16, il
  D-20 e il D-24 partono invece da pochi segni fissi, scelti dalla modalità o
  dalla parità: il D-16 e il D-20 usano gli stessi tre, ma con fissi e mobili
  scambiati.
</p>

<h2 id="navamsa">Un esempio: la navamsa</h2>

<p>
  Il Sole a 5° del Toro siderale. Il Toro è un segno fisso, quindi la prima
  delle nove parti va al nono segno da lui, il Capricorno, e le altre seguono
  in ordine. 5° cadono nella seconda parte, fra 3°20' e 6°40': il Sole è nella
  navamsa dell'Acquario.
</p>

<p>
  La stessa regola si può dire per elemento: si parte dall'Ariete nei segni di
  fuoco, dal Capricorno nella terra, dalla Bilancia nell'aria, dal Cancro
  nell'acqua. Ed equivale a contare le parti di seguito dall'Ariete lungo tutto
  lo zodiaco, senza ripartire a ogni segno: per questo le parti della navamsa
  coincidono con i <a href="/metodo/nakshatra#pada">pada</a> dei nakshatra.
</p>

<h2 id="hora">La hora, che nel testo non ha segni</h2>

<p>
  Il D-2 divide ogni segno in due metà. Nei segni dispari la prima è la
  <em>hora</em> del Sole e la seconda quella della Luna, nei pari il contrario.
  Fin qui concordano tutti. Il <em>Brihat Parashara Hora Shastra</em> (6.5-6)
  però si ferma lì: a ciascuna metà dà un luminare, non un segno, e così fanno
  i trattati che lo seguono. Agli usi che il testo ne fa basta il luminare.
</p>

<p>
  La lettura più diffusa manda la hora del Sole al Leone e quella della Luna al
  Cancro, i segni dei due luminari, e ne fa una carta in cui tutti i graha
  stanno in uno di quei due segni. Nessun classico letto qui la enuncia: la
  presuppone il commento di Santhanam, e la dice d'uso comune P.V.R. Narasimha
  Rao (2003), che ne dubita.
</p>

<p>
  Il sito le tiene tutte e due, col loro nome. La predefinita è quella del
  testo, <strong>Parashara</strong>: ogni graha nella hora del Sole o della
  Luna, senza segno, e quindi senza quadro da disegnare. L'altra,
  <strong>Leone e Cancro</strong>, si chiede, e dà una carta con i segni, che
  si può disegnare. In entrambi i casi la convenzione e la sua fonte viaggiano
  col risultato. Le altre varianti moderne con un segno, ciascuna con un
  autore, non sono calcolate.
</p>

<h2 id="disuguali">Il trimsamsa, che non divide in parti uguali</h2>

<p>
  Il D-30 si chiama così ma non ha trenta parti: ne ha cinque, di ampiezza
  diversa, ciascuna retta da un pianeta. Nei segni dispari 5° a Marte, 5° a
  Saturno, 8° a Giove, 7° a Mercurio e 5° a Venere, e ogni tratto va al segno
  dispari del suo pianeta (Ariete, Acquario, Sagittario, Gemelli, Bilancia).
  Nei segni pari lo stesso ordine si rovescia, con i segni pari degli stessi
  pianeti.
</p>

<h2 id="fonte">La fonte, e le tavole stampate</h2>

<p>
  Le regole vengono dal <em>Brihat Parashara Hora Shastra</em>, capitolo 6,
  nella traduzione di R. Santhanam (vol. I, 1992, pp. 68-80), e ciascuna porta
  il suo verso accanto al risultato. Quella del D-27 è 6.24-26, alle pp.
  78-79, e la tavola che Santhanam stampa accanto ha un refuso, nella colonna
  dei Gemelli, che la regola e la colonna della Bilancia smentiscono: il
  motore segue la regola. È il genere di errore che si propaga quando le
  tavole si copiano invece di ricalcolarle, ed è un'altra ragione per cui il
  sito consegna la regola e non solo il segno.
</p>

<p>
  I varga si calcolano nella sezione <a href="/vedica">Vedica</a>.
</p>

<p class="aggiornamento">
  Il termine in breve sta nel <a href="/glossario/jyotisha#varga">glossario</a>.
</p>
