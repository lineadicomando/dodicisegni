<!--
  L'indice del glossario: le tre famiglie e i termini di ciascuna.

  Una pagina per famiglia e non una per termine: trenta indirizzi da tre righe
  l'uno sarebbero pagine magre, e una sola pagina con le ancore perderebbe le
  ricerche. Deciso dal proprietario il 28 ottobre 2026, con la voce 8 del
  `TODO.md`. Una famiglia nuova va aggiunta qui, in `PAGINE_PUBBLICHE` di
  `lib/seo.ts`, e `lib/seo.test.ts` cade se manca.
-->
<script lang="ts">
  import Meta from '#lib/components/Meta.svelte';
</script>

<Meta
  titolo="Glossario: tema, moti e Jyotisha"
  descrizione="Il glossario di dodicisegni: i termini del tema natale, del tempo e dell'astrologia indiana, in breve e col rimando a come il sito li calcola."
/>

<h1>Glossario</h1>
<p class="aggiornamento">
  I termini che il sito usa, che cosa vogliono dire.
</p>

<p>
  Ogni voce dice che cos'è un termine, in poche righe, e rimanda alla pagina
  del <a href="/metodo">metodo</a> che dice con quale convenzione il sito lo
  calcola. Il glossario definisce, il metodo dichiara. Nessuna delle due dice
  che cosa un termine significhi nella vita di qualcuno: quello è
  interpretazione, e da questo sito non esce.
</p>

<h2 id="tema"><a href="/glossario/tema">Il tema</a></h2>
<p>
  Segno, zodiaco tropicale e siderale, effemeridi, Ascendente, Medio Cielo,
  casa, cuspide, sistema di case; aspetto, orbita, aspetti maggiori e minori,
  applicativo e separativo; Parte di Fortuna, tema diurno e notturno, elementi
  e modalità, nodi lunari, Lilith, Chirone; domicilio, esilio, esaltazione e
  caduta, triplicità, termini, facce, peregrino, ricezione, fortezze e
  debilità.
</p>

<h2 id="tempo"><a href="/glossario/tempo">I moti e il tempo</a></h2>
<p>
  Retrogradazione, stazione, ingresso, orientale e occidentale, combustione e
  cazimi; transito, perfezione, Luna vuota di corso; elezione, ore planetarie,
  ordine caldeo; tema orario, significatore, traslazione e collezione di luce,
  proibizione, frustrazione e refranazione.
</p>

<h2 id="jyotisha"><a href="/glossario/jyotisha">Il Jyotisha</a></h2>
<p>
  Jyotisha, graha, Rahu e Ketu, rashi, lagna, ayanamsa; nakshatra, pada,
  varga, hora, navamsa; dasha, panchanga, tithi, vara, yoga, karana; drishti, uccha
  e neecha, moolatrikona, swakshetra.
</p>
