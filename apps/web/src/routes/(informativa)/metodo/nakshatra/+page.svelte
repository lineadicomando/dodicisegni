<!--
  I nakshatra, staccati da /metodo perché il termine si cerca da solo.

  Come la pagina madre, ricopia valori che vivono nel motore: i nomi e il loro
  ordine da `NAKSHATRAS`, i signori da `VIMSHOTTARI_ORDER`, tutti e due in
  `packages/core/src/nakshatra.ts`. La tavola la guarda `../jyotisha.test.ts`.
-->
<script lang="ts">
  import Meta from '#lib/components/Meta.svelte';
</script>

<Meta
  titolo="Nakshatra e pada: come si calcolano"
  descrizione="I ventisette nakshatra siderali: dove comincia ciascuno, il graha che lo regge, i quattro pada e perché un nakshatra tropicale non esiste."
/>

<p class="sopra"><a href="/metodo#jyotisha">Metodo</a> · astrologia indiana</p>

<h1>I nakshatra</h1>
<p class="aggiornamento">
  Lo zodiaco diviso in ventisette parti, e come il sito le conta.
</p>

<p>
  Le parti sono ventisette invece di dodici, tappe di un giro della Luna e
  non del Sole, e ciascuna misura 13°20', cioè ottocento primi tondi. Nell'astrologia indiana pesano quanto i segni e in più d'un caso
  di più; il nakshatra della Luna alla nascita è quello che si intende quando si
  chiede sotto quale stella qualcuno è nato, ed è il punto da cui partono le
  <a href="/metodo/dasha">dasha</a>.
</p>

<h2 id="siderale">Solo nello zodiaco siderale</h2>

<p>
  Chiederne uno su una longitudine tropicale è una domanda malposta: un
  nakshatra è un tratto di cielo fra stelle fisse, e contarlo dal punto vernale
  lo staccherebbe dalle stelle che lo nominano. Il motore lo dice invece di
  rispondere con un numero.
</p>

<p>
  Per la stessa ragione il nakshatra dipende dall'<a href="/metodo#zodiaco">ayanamsa</a>.
  Fra Lahiri, il predefinito, e Raman corre più di un grado e mezzo: una Luna
  vicina al confine cambia nakshatra cambiando ayanamsa, e con lei cambia la
  catena delle dasha.
</p>

<h2 id="tavola">I ventisette</h2>

<p>
  Nell'ordine in cui la Luna li attraversa, a partire da 0° dell'Ariete
  siderale. Ognuno è retto da uno dei nove graha delle dasha vimshottari, e la
  sequenza dei nove si ripete tre volte lungo il cerchio: è da questa
  ripetizione, e non da una colonna scritta a mano, che il motore ricava il
  signore.
</p>

<table class="testo">
  <thead>
    <tr>
      <th>N.</th>
      <th>Nakshatra</th>
      <th>Comincia a</th>
      <th>Signore</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>Ashwini</td><td>0°00' Ariete</td><td>Ketu</td></tr>
    <tr><td>2</td><td>Bharani</td><td>13°20' Ariete</td><td>Venere</td></tr>
    <tr><td>3</td><td>Krittika</td><td>26°40' Ariete</td><td>Sole</td></tr>
    <tr><td>4</td><td>Rohini</td><td>10°00' Toro</td><td>Luna</td></tr>
    <tr><td>5</td><td>Mrigashira</td><td>23°20' Toro</td><td>Marte</td></tr>
    <tr><td>6</td><td>Ardra</td><td>6°40' Gemelli</td><td>Rahu</td></tr>
    <tr><td>7</td><td>Punarvasu</td><td>20°00' Gemelli</td><td>Giove</td></tr>
    <tr><td>8</td><td>Pushya</td><td>3°20' Cancro</td><td>Saturno</td></tr>
    <tr><td>9</td><td>Ashlesha</td><td>16°40' Cancro</td><td>Mercurio</td></tr>
    <tr><td>10</td><td>Magha</td><td>0°00' Leone</td><td>Ketu</td></tr>
    <tr><td>11</td><td>Purva Phalguni</td><td>13°20' Leone</td><td>Venere</td></tr>
    <tr><td>12</td><td>Uttara Phalguni</td><td>26°40' Leone</td><td>Sole</td></tr>
    <tr><td>13</td><td>Hasta</td><td>10°00' Vergine</td><td>Luna</td></tr>
    <tr><td>14</td><td>Chitra</td><td>23°20' Vergine</td><td>Marte</td></tr>
    <tr><td>15</td><td>Swati</td><td>6°40' Bilancia</td><td>Rahu</td></tr>
    <tr><td>16</td><td>Vishakha</td><td>20°00' Bilancia</td><td>Giove</td></tr>
    <tr><td>17</td><td>Anuradha</td><td>3°20' Scorpione</td><td>Saturno</td></tr>
    <tr><td>18</td><td>Jyeshtha</td><td>16°40' Scorpione</td><td>Mercurio</td></tr>
    <tr><td>19</td><td>Mula</td><td>0°00' Sagittario</td><td>Ketu</td></tr>
    <tr><td>20</td><td>Purva Ashadha</td><td>13°20' Sagittario</td><td>Venere</td></tr>
    <tr><td>21</td><td>Uttara Ashadha</td><td>26°40' Sagittario</td><td>Sole</td></tr>
    <tr><td>22</td><td>Shravana</td><td>10°00' Capricorno</td><td>Luna</td></tr>
    <tr><td>23</td><td>Dhanishta</td><td>23°20' Capricorno</td><td>Marte</td></tr>
    <tr><td>24</td><td>Shatabhisha</td><td>6°40' Acquario</td><td>Rahu</td></tr>
    <tr><td>25</td><td>Purva Bhadrapada</td><td>20°00' Acquario</td><td>Giove</td></tr>
    <tr><td>26</td><td>Uttara Bhadrapada</td><td>3°20' Pesci</td><td>Saturno</td></tr>
    <tr><td>27</td><td>Revati</td><td>16°40' Pesci</td><td>Mercurio</td></tr>
  </tbody>
</table>

<p>
  I nomi restano in sanscrito e non si traducono. «Dimore lunari» è una
  perifrasi, e non il nome che usa la tradizione indiana. Rahu e Ketu, che qui
  sono due graha con un nome e non i due nodi dell'orbita lunare, si chiamano
  così anche nel resto del sito.
</p>

<h2 id="pada">I pada</h2>

<p>
  Ogni nakshatra si divide in quattro <em>pada</em> di 3°20'. Sono
  centootto in tutto, nove per segno, e coincidono con le parti del D-9, la
  <a href="/metodo/varga">navamsa</a>: il primo pada di Ashwini cade nella
  navamsa dell'Ariete, il secondo in quella del Toro, e così via di seguito
  lungo tutto lo zodiaco, senza ripartire a ogni segno. Accanto al nakshatra di
  ogni corpo il motore riporta il pada e il grado dentro il nakshatra.
</p>

<p class="aggiornamento">
  Il termine in breve sta nel <a href="/glossario/jyotisha#nakshatra">glossario</a>.
</p>
