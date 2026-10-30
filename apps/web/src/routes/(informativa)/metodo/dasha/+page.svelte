<!--
  Le dasha vimshottari, staccate da /metodo perché il termine si cerca da solo.

  Ricopia valori del motore: gli anni da `VIMSHOTTARI_YEARS` in
  `packages/core/src/dasha.ts`, l'ordine da `VIMSHOTTARI_ORDER` in
  `nakshatra.ts`, le due durate dell'anno da `DASHA_DAYS_PER_YEAR`. La tavola
  la guarda `../jyotisha.test.ts`; l'esempio svolto no, e va rifatto a mano se
  cambiano gli anni.
-->
<script lang="ts">
  import Meta from '#lib/components/Meta.svelte';
</script>

<Meta
  titolo="Dasha vimshottari: come si calcolano"
  descrizione="Le dasha vimshottari passo per passo: gli anni dei nove graha, il saldo dal nakshatra della Luna, le antardasha, un esempio da rifare a mano."
/>

<p class="sopra"><a href="/metodo#jyotisha">Metodo</a> · astrologia indiana</p>

<h1>Le dasha vimshottari</h1>
<p class="aggiornamento">
  Il tempo diviso in periodi retti da un graha, e come il sito li conta.
</p>

<p>
  <em>Vimshottari</em> vuol dire centoventi, e tanti sono gli anni del ciclo
  intero. I nove graha se li dividono in parti fisse e disuguali che sommano a
  centoventi esatti, e si succedono sempre nello stesso ordine. Ogni periodo,
  il <em>mahadasha</em>, si suddivide nei nove secondo le stesse proporzioni
  (gli <em>antardasha</em>), e ciascuno di quelli ancora nei nove (i
  <em>pratyantardasha</em>): il sito si ferma a questo terzo ordine.
</p>

<h2 id="anni">Gli anni dei nove</h2>

<p>
  Nell'ordine della successione. Ciascuno regge tre
  <a href="/metodo/nakshatra">nakshatra</a>, uno ogni nove, e questo legame
  decide da dove comincia la catena.
</p>

<table class="testo">
  <thead>
    <tr>
      <th>Graha</th>
      <th>Anni</th>
      <th>Nakshatra retti</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Ketu</td><td>7</td><td>Ashwini, Magha, Mula</td></tr>
    <tr><td>Venere</td><td>20</td><td>Bharani, Purva Phalguni, Purva Ashadha</td></tr>
    <tr><td>Sole</td><td>6</td><td>Krittika, Uttara Phalguni, Uttara Ashadha</td></tr>
    <tr><td>Luna</td><td>10</td><td>Rohini, Hasta, Shravana</td></tr>
    <tr><td>Marte</td><td>7</td><td>Mrigashira, Chitra, Dhanishta</td></tr>
    <tr><td>Rahu</td><td>18</td><td>Ardra, Swati, Shatabhisha</td></tr>
    <tr><td>Giove</td><td>16</td><td>Punarvasu, Vishakha, Purva Bhadrapada</td></tr>
    <tr><td>Saturno</td><td>19</td><td>Pushya, Anuradha, Uttara Bhadrapada</td></tr>
    <tr><td>Mercurio</td><td>17</td><td>Ashlesha, Jyeshtha, Revati</td></tr>
  </tbody>
</table>

<h2 id="saldo">Da dove comincia: il saldo alla nascita</h2>

<p>
  Il primo periodo è quello del graha che regge il nakshatra della Luna alla
  nascita. Ma la persona non nasce all'inizio di quel periodo: ne nasce dentro,
  tanto più avanti quanto più la Luna ha già percorso del suo nakshatra. Quello
  che resta del primo mahadasha è la sua durata moltiplicata per la frazione
  del nakshatra ancora da percorrere.
</p>

<p>
  Un esempio da rifare a mano. La Luna sta a 20°00' dell'Ariete siderale, cioè
  in Bharani, che va da 13°20' a 26°40' ed è retto da Venere. Ne ha percorso
  6°40' su 13°20', esattamente la metà: dei vent'anni di Venere ne restano
  dieci. Poi vengono il Sole per sei, la Luna per dieci, Marte per sette, e
  così via lungo l'ordine della tavola.
</p>

<p>
  Il primo mahadasha il sito lo calcola intero, e lo fa cominciare prima della
  nascita di quanto ne è già trascorso: così le sue suddivisioni hanno la
  durata piena, e la catena è una successione senza buchi.
</p>

<h2 id="suddivisioni">Le suddivisioni</h2>

<p>
  Dentro un mahadasha gli antardasha cominciano dal suo stesso graha e
  seguono l'ordine; ciascuno dura la sua quota del ciclo intero. Venere, che
  ha venti anni su centoventi, prende un sesto di qualunque periodo la
  contenga. Nel mahadasha di Venere, quindi:
</p>

<table>
  <thead>
    <tr>
      <th>Antardasha</th>
      <th>Durata</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Venere</td><td>3 anni 4 mesi</td></tr>
    <tr><td>Sole</td><td>1 anno</td></tr>
    <tr><td>Luna</td><td>1 anno 8 mesi</td></tr>
    <tr><td>Marte</td><td>1 anno 2 mesi</td></tr>
    <tr><td>Rahu</td><td>3 anni</td></tr>
    <tr><td>Giove</td><td>2 anni 8 mesi</td></tr>
    <tr><td>Saturno</td><td>3 anni 2 mesi</td></tr>
    <tr><td>Mercurio</td><td>2 anni 10 mesi</td></tr>
    <tr><td>Ketu</td><td>1 anno 2 mesi</td></tr>
  </tbody>
</table>

<p>
  I pratyantardasha si ricavano allo stesso modo dentro ogni antardasha.
</p>

<h2 id="anno">Quanto dura un anno</h2>

<p>
  Le scuole non concordano nemmeno su questo. Il predefinito è l'anno solare
  di 365,25 giorni; in alternativa c'è l'anno <em>savana</em> di 360 giorni,
  che su centoventi anni sposta la fine del ciclo di quasi due anni. L'anno
  usato viaggia col risultato.
</p>

<h2 id="precisione">Perché l'ora di nascita conta tanto</h2>

<p>
  È l'unico calcolo del sito in cui un secondo d'arco vale ore di calendario:
  13°20' di nakshatra valgono fino a vent'anni di dasha, quindi un secondo
  d'arco vale circa tre ore e mezza. La Luna percorre circa mezzo grado
  l'ora, e un quarto d'ora di incertezza sull'ora di nascita sposta le date fino
  a un paio di mesi. Senza l'ora di nascita le date non sono approssimate ma
  inservibili, e il risultato lo dice.
</p>

<p>
  Per la stessa ragione, quando il sito calcola con le
  <a href="/metodo#effemeridi">effemeridi di riserva</a>, l'avvertenza lo
  ricorda: sulla Luna scartano di un paio di secondi d'arco, che qui sono
  qualche ora.
</p>

<p>
  È la cosa più simile a una previsione che il sito emetta, e resta aritmetica:
  dice quando un periodo comincia, non che cosa ci accadrà dentro. Le dasha si
  calcolano nella sezione <a href="/vedica">Vedica</a>.
</p>

<p class="aggiornamento">
  Il termine in breve sta nel <a href="/glossario/jyotisha#dasha">glossario</a>.
</p>
