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
  descrizione="Le carte divisionali del Jyotisha, dalla hora D-2 alla D-60: la regola di ciascuna, un esempio svolto, e perché la regola viaggia col risultato."
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

<h2 id="regole">I sedici che il sito calcola</h2>

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
    <tr><td>D-40</td><td>Khavedamsa</td><td>40</td><td>Quaranta parti da 45'. Nei segni dispari si parte dall'Ariete, nei pari dalla Bilancia.</td></tr>
    <tr><td>D-45</td><td>Akshavedamsa</td><td>45</td><td>Quarantacinque parti da 40'. Si parte dall'Ariete se il segno è cardinale, dal Leone se è fisso, dal Sagittario se è mobile.</td></tr>
    <tr><td>D-60</td><td>Shashtiamsa</td><td>60</td><td>Sessanta parti da 30', contate dal segno stesso: vedi <a href="#d60">sotto</a>.</td></tr>
  </tbody>
</table>

<p>
  Sono le sedici divisioni del <em>Brihat Parashara Hora Shastra</em>. Le
  regole si biforcano in modi diversi, ed è il motivo per cui la tavola non è
  una formula sola: il D-3 procede per trigoni, il D-4 per
  kendra, il D-9 parte da dove dice la modalità del segno, il D-7 e il D-10 da
  dove dice la sua parità, il D-12 riparte sempre dal segno stesso. Il D-16, il
  D-20 e il D-24 partono invece da pochi segni fissi, scelti dalla modalità o
  dalla parità: il D-16 e il D-20 usano gli stessi tre, ma con fissi e mobili
  scambiati. Il D-40 e il D-45 ripetono quelle forme su parti più strette.
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

<h2 id="d60">Lo shashtiamsa, e l'ora al minuto</h2>

<p>
  Il D-60 divide il segno in sessanta parti da mezzo grado. Il verso (6.33)
  dice di raddoppiare i gradi percorsi nel segno, dividere per dodici e
  aggiungere uno al resto: si ottiene un numero di segni, contato <strong>dal
  segno stesso</strong>. Il sanscrito lo scrive (<em>tad-rāśeḥ</em>, «da quel
  segno»), così lo legge P.V.R. Narasimha Rao, e così fa l'esempio di
  Santhanam: Venere a 13°25' del Capricorno, 26 diviso 12 dà resto 2, più uno
  fa 3, e il terzo segno dal Capricorno sono i Pesci. La traduzione inglese omette quelle due parole, e c'è chi conta
  dall'Ariete, che darebbe i Gemelli. Quella lettura non ha un autore che la
  sostenga per iscritto, e il sito non la calcola.
</p>

<p>
  Mezzo grado è poco. L'Ascendente lo attraversa in pochi minuti di orologio,
  più o meno secondo il segno che sorge e la latitudine, e un'ora di nascita
  data al quarto d'ora non basta a dire in quale parte cada. Non basta
  nemmeno per le parti di poco più d'un grado del D-24 (1°15') e del D-27
  (1°6'40"), che passano in cinque o sei minuti. Per questo il D-24, il D-27,
  il D-40, il D-45 e il D-60 escono con un'avvertenza calcolata su quel tema:
  di quanti minuti l'ora dovrebbe sbagliare, prima o dopo, perché il lagna e
  la Luna cambino segno. Un segno con molte cifre sembra preciso anche quando
  non lo è; l'avvertenza serve a dire quando lo è.
</p>

<p>
  Ogni parte ha un nome (6.34-39): Ghora, Rakshasa, Deva, fino a Chandra
  Rekha, la sessantesima. Nei segni dispari la lista si legge dal primo mezzo
  grado, nei pari al rovescio (6.40), e il rovescio tocca i nomi e non i
  segni: la Venere dell'esempio, nel Capricorno, che è pari, cade nella
  ventisettesima parte e porta il trentaquattresimo nome, il secondo Ghora. Il
  sito dà il nome accanto al segno, per i graha e per il lagna, nella grafia
  della tavola di Santhanam (pp. 84-86), col numero della lista, che nei
  segni pari non è quello della parte ed è quello con cui il nome si ritrova
  nella tavola. Il verso successivo (6.41) divide i sessanta in benefici e
  malefici, e quello non è riportato: è un giudizio sull'effetto, e il nome
  resta un nome.
</p>

<h2 id="buoni">I varga buoni, e il loro conto</h2>

<p>
  Il testo (6.42-53) chiama «buono» per un graha il varga che cade nel suo
  segno di esaltazione, di moolatrikona o proprio, oppure in un segno dei
  signori dei kendra contati dall'<em>arudha lagna</em>. I varga buoni si
  contano in quattro schemi, di sei, sette, dieci e sedici divisioni, e a
  ogni conto il testo dà un nome: nel dashavarga, per esempio, due fanno
  Parijata, tre Uttama, dieci Sridhama. Il sito conta e riporta il nome; che
  cosa il nome prometta non lo dice.
</p>

<p>
  Dove il testo lascia due strade, la scelta è dichiarata accanto al conto.
  I segni di dignità sono quelli della traduzione di Santhanam. L'arudha
  lagna si ricava come in 29.1-5: si conta dal lagna al segno del suo
  signore e altrettanto oltre, e se si ricade nel lagna o nel settimo si
  prende il decimo o il quarto. Lo Scorpione e l'Acquario hanno due signori
  (Marte e Ketu, Saturno e Rahu), e il testo vuole il più forte: il sito lo
  sceglie con la regola che il BPHS dà per gli stessi due segni nella chara
  dasha (46.158-166), e dice quale ha scelto. È una regola larga, che Santhanam stesso
  segnala: può rendere buoni fino a otto segni su dodici, e per questo ogni
  varga buono porta la sua ragione. La hora di Parashara, che non ha segni,
  si conta con la nota di Santhanam (p. 90). Senza ora di nascita il conto
  non c'è, perché l'arudha vuole il lagna.
</p>

<p>
  Accanto c'è sempre un secondo conto, di un altro autore: P.V.R. Narasimha
  Rao (<em>Vedic Astrology: An Integrated Approach</em>, 2000, §6.6) conta
  solo i segni di esaltazione, di moolatrikona e propri, senza la regola
  dell'arudha, e la hora con i segni Leone e Cancro, come nel suo esempio. I
  due conti possono dare nomi molto diversi, e il sito li riporta tutti e due
  col nome di chi li fa, senza sceglierne uno.
</p>

<p>
  Il verso 53 dice che i varga buoni di un graha combusto, sconfitto in
  guerra, in neecha, debole o in un'avastha come <em>śayana</em> «distruggono
  gli yoga». Non cambia il conto, ma il sito calcola le condizioni che nomina,
  ciascuna con la sua fonte, perché il BPHS le nomina senza definirle. La
  combustione usa le distanze dal Sole del <em>Surya Siddhanta</em> (IX.6-9),
  che il testo dà in gradi di tempo e il sito applica alla longitudine,
  dicendolo. La guerra è fra due dei cinque pianeti a meno di un grado (VII.19),
  e vince Venere comunque, degli altri chi sta a nord (BPHS 79.9). Le dodici
  avastha si contano con la formula di 45.30-33 e le letture di Santhanam, che
  la prova su un esempio. Quali avastha guastino i varga buoni il testo non lo
  dice, e il sito nemmeno; la debolezza non ha una soglia, e non c'è.
</p>

<h2 id="vimshopaka">Il vimshopaka, la forza su venti punti</h2>

<p>
  Lo stesso capitolo (7.17-27) dà a ogni graha una forza su venti punti in
  ciascuno schema. In ogni varga il graha prende 20 se il segno è suo, e
  altrimenti 18, 15, 10, 7 o 5 secondo la relazione composta col signore del
  segno, da adhimitra ad adhishatru; il numero si pesa con l'importanza del
  varga nello schema. Esaltazione e moolatrikona non danno il pieno: il
  testo lo riserva al segno proprio. Nel saptavarga il verso elenca sette
  pesi senza dire a quale varga vada ciascuno, e il sito segue la tavola di
  Santhanam (p. 97), che dà al navamsa 2½ e al dwadasamsa 4½. Il calcolo è
  ricontrollato sull'esempio svolto di Santhanam (pp. 98-99): Venere, 16,8
  punti nello shadvarga. Le fasce che il testo associa ai punteggi («sotto
  cinque non dà buoni risultati») sono un giudizio, e non sono riportate.
</p>

<h2 id="fonte">La fonte, e le tavole stampate</h2>

<p>
  Le regole vengono dal <em>Brihat Parashara Hora Shastra</em>, capitolo 6,
  nella traduzione di R. Santhanam (vol. I, 1992, pp. 68-86), e ciascuna porta
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
