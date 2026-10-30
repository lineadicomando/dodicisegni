<!--
  Le drishti, staccate da /metodo perché il termine si cerca da solo.

  La tavola ricopia `housesSeenBy` in `packages/core/src/drishti.ts`, e
  `../jyotisha.test.ts` la confronta con quella funzione per ogni graha e per
  le due convenzioni dei nodi.
-->
<script lang="ts">
  import Meta from '#lib/components/Meta.svelte';
</script>

<Meta
  titolo="Le drishti: gli sguardi dei graha"
  descrizione="Le drishti del Jyotisha: quali case guarda ogni graha, perché si contano a segni interi e in un verso solo, e come differiscono dagli aspetti."
/>

<p class="sopra"><a href="/metodo#jyotisha">Metodo</a> · astrologia indiana</p>

<h1>Le drishti</h1>
<p class="aggiornamento">
  Lo sguardo che un graha getta su un segno, e come il sito lo conta.
</p>

<p>
  Non sono gli <a href="/metodo#aspetti">aspetti</a> occidentali con un altro
  nome, e differiscono in tutto.
</p>

<ul>
  <li>
    <strong>Si contano a segni interi.</strong> Non c'è orbita: un graha guarda
    un segno intero e tutto ciò che vi si trova. Due graha a ventinove gradi di
    distanza dentro lo stesso rapporto di segni si guardano quanto due che ne
    distano uno.
  </li>
  <li>
    <strong>Sono direzionali.</strong> Si contano sempre in avanti nello
    zodiaco, e la casa di chi guarda conta come prima. Che A guardi B non
    implica che B guardi A.
  </li>
  <li>
    <strong>Cadono anche sul vuoto.</strong> Un graha guarda anche una casa
    disabitata; per questo i segni guardati si riportano tutti, non solo
    quelli occupati.
  </li>
</ul>

<h2 id="tavola">Chi guarda che cosa</h2>

<p>
  La regola di base è che ognuno guarda il settimo da sé, cioè il segno
  opposto. Tre ne hanno altre due ciascuno.
</p>

<table class="testo">
  <thead>
    <tr>
      <th>Graha</th>
      <th>Case guardate</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Sole</td><td>7</td></tr>
    <tr><td>Luna</td><td>7</td></tr>
    <tr><td>Mercurio</td><td>7</td></tr>
    <tr><td>Venere</td><td>7</td></tr>
    <tr><td>Marte</td><td>4, 7, 8</td></tr>
    <tr><td>Giove</td><td>5, 7, 9</td></tr>
    <tr><td>Saturno</td><td>3, 7, 10</td></tr>
  </tbody>
</table>

<p>
  Un esempio. Saturno in Ariete guarda i Gemelli, che gli sono terzi, la
  Bilancia, settima, e il Capricorno, decimo. Dai Gemelli, però, l'Ariete è
  l'undicesimo, e nessuno guarda l'undicesima: Saturno guarda chi sta nei
  Gemelli, e chi sta nei Gemelli non guarda Saturno.
</p>

<h2 id="nodi">Rahu e Ketu</h2>

<p>
  Qui le scuole si dividono, e il sito non sceglie in silenzio. Nella forma
  classica, che è la predefinita, i nodi non hanno drishti: Parashara la dà ai
  sette, e quella dei nodi è un'aggiunta più tarda. In alternativa si può
  chiedere la forma che dà a Rahu e Ketu le stesse drishti di Giove: la
  quinta, la settima e la nona. La convenzione usata viaggia col risultato.
</p>

<p>
  Urano, Nettuno e Plutone non sono graha e non hanno drishti: attribuirne
  loro una vorrebbe dire inventarla.
</p>

<p>
  Le drishti si calcolano nella sezione <a href="/vedica">Vedica</a>.
</p>

<p class="aggiornamento">
  Il termine in breve sta nel <a href="/glossario/jyotisha#drishti">glossario</a>.
</p>
