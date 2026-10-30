<!--
  Il glossario dei moti e del tempo: retrogradazioni, transiti, Luna vuota,
  ore planetarie, astrologia oraria.

  Il taglio è scritto in testa a `../jyotisha/+page.svelte` e vale qui uguale:
  la voce definisce e rimanda, /metodo dichiara la convenzione.
-->
<script lang="ts">
  import Meta from '#lib/components/Meta.svelte';
</script>

<Meta
  titolo="Glossario dei moti e del tempo"
  descrizione="I termini del tempo in astrologia: retrogradazione, stazione, ingresso, transito, Luna vuota di corso, ore planetarie, elezione, tema orario."
/>

<p class="sopra"><a href="/glossario">Glossario</a></p>

<h1>I moti e il tempo: i termini</h1>
<p class="aggiornamento">
  Che cosa vogliono dire, in breve. Come il sito li calcola sta nel metodo.
</p>

<h2 id="moti">I moti</h2>

<h3 id="retrogradazione">Retrogradazione</h3>
<p>
  Il tratto in cui un pianeta, visto dalla Terra, sembra tornare indietro
  nello zodiaco. È un effetto di prospettiva fra due orbite, non un moto vero.
  Sole e Luna non sono mai retrogradi; i nodi medi lo sono sempre. Sul sito un
  corpo retrogrado porta il segno ℞.
</p>

<h3 id="stazione">Stazione</h3>
<p>
  L'istante in cui un pianeta sembra fermarsi, perché il suo moto apparente
  cambia verso: da diretto a retrogrado, o il contrario. Il sito la cerca come
  l'istante in cui la velocità passa per lo zero.
</p>

<h3 id="ingresso">Ingresso</h3>
<p>
  L'istante in cui un corpo entra in un segno. Con le retrogradazioni un
  pianeta lento può entrare nello stesso segno due o tre volte.
</p>

<h3 id="orientale">Orientale e occidentale</h3>
<p>
  Un pianeta è orientale quando sorge prima del Sole, cioè lo precede nello
  zodiaco; occidentale quando tramonta dopo di lui.
</p>

<h3 id="combustione">Combustione, cazimi, sotto i raggi</h3>
<p>
  Tre gradi di vicinanza al Sole, nella tradizione. Sotto i raggi un pianeta
  entro 17°, combusto entro 8°30', in <em>cazimi</em> («nel cuore del Sole»)
  entro 17 primi. Sono le soglie di Lilly.
  → <a href="/metodo#lilly">Il conto di Lilly</a>
</p>

<h2 id="transiti">I transiti</h2>

<h3 id="transito">Transito</h3>
<p>
  Il rapporto fra un corpo nel cielo di oggi, o di un'altra data, e un punto
  del tema natale: Saturno di oggi in quadrato al Sole di nascita. Le orbite
  dei transiti sono molto più strette di quelle natali.
  → <a href="/metodo#aspetti">Perché</a>
</p>

<h3 id="perfezione">Perfezione</h3>
<p>
  L'istante in cui un aspetto diventa esatto. Un transito di un pianeta lento,
  con le retrogradazioni, può perfezionarsi tre volte, e può anche restare in
  orbita per mesi senza perfezionarsi mai.
</p>

<h3 id="luna-vuota">Luna vuota di corso</h3>
<p>
  Il tratto in cui la Luna non forma più nessun aspetto prima di cambiare
  segno. Le definizioni non coincidono: quella moderna guarda gli aspetti
  esatti, quella di Lilly anche quelli che la Luna sta ancora formando quando
  esce dal segno.
  → <a href="/metodo#lilly">Le due definizioni</a>
</p>

<h2 id="elezione">L'elezione</h2>

<h3 id="elezione-termine">Elezione</h3>
<p>
  La scelta del momento per cominciare qualcosa: invece di leggere un istante
  dato, lo si cerca.
  → <a href="/metodo#elezione">L'elezione</a>
</p>

<h3 id="ore-planetarie">Ore planetarie</h3>
<p>
  Il giorno, dall'alba al tramonto, e la notte, dal tramonto all'alba, divisi
  ciascuno in dodici parti, ognuna retta da un pianeta. Non durano un'ora:
  d'estate le diurne sono lunghe e le notturne corte.
  → <a href="/metodo#elezione">Come si contano</a>
</p>

<h3 id="ordine-caldeo">Ordine caldeo</h3>
<p>
  I sette pianeti classici dal più lento al più veloce: Saturno, Giove,
  Marte, Sole, Venere, Mercurio, Luna. Regge la successione delle ore
  planetarie, e da questa viene l'ordine dei giorni della settimana.
</p>

<h2 id="oraria">L'astrologia oraria</h2>

<h3 id="tema-orario">Tema orario</h3>
<p>
  Il tema dell'istante in cui una domanda viene posta, letto per rispondere a
  quella domanda. Il sito lo calcola col metodo di William Lilly.
  → <a href="/metodo#lilly">Il tema orario</a>
</p>

<h3 id="significatore">Significatore</h3>
<p>
  Il pianeta che rappresenta una delle parti della domanda: chi domanda ha il
  signore dell'Ascendente, la cosa domandata il signore della sua casa.
</p>

<h3 id="traslazione">Traslazione e collezione di luce</h3>
<p>
  Due modi in cui due significatori che non si incontrano direttamente vengono
  collegati. Nella traslazione un pianeta più veloce si separa da uno e va
  all'altro; nella collezione tutti e due vanno verso un terzo più lento.
</p>

<h3 id="proibizione">Proibizione, frustrazione, refranazione</h3>
<p>
  Tre impedimenti all'incontro dei significatori. Nella
  proibizione un terzo pianeta arriva prima; nella frustrazione il
  significatore più lento si incontra prima con un altro ancora più lento;
  nella refranazione il più veloce si ferma e torna indietro prima di
  arrivare.
</p>
