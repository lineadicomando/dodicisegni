<!--
  Il panchanga, staccato da /metodo perché il termine si cerca da solo.

  Le ampiezze (12° il tithi, 6° il karana, 13°20' lo yoga e il nakshatra) e i
  karana fissi vengono da `packages/core/src/panchanga.ts`. Nessun test le
  guarda: sono la definizione stessa delle cinque parti, e cambiarle vorrebbe
  dire calcolare un'altra cosa.
-->
<script lang="ts">
  import Meta from '#lib/components/Meta.svelte';
</script>

<Meta
  titolo="Panchanga: tithi, vara, yoga e karana"
  descrizione="Le cinque membra del calendario indiano: tithi, vara, nakshatra, yoga e karana, da due longitudini e un'alba, e quali dipendono dall'ayanamsa."
/>

<p class="sopra"><a href="/metodo#jyotisha">Metodo</a> · astrologia indiana</p>

<h1>Il panchanga</h1>
<p class="aggiornamento">
  Le cinque membra del calendario indiano, e come si ricavano.
</p>

<p>
  <em>Pañcāṅga</em> vuol dire «cinque membra», e sono tithi, vara, nakshatra,
  yoga e karana. Non è un tema: è la qualità di un istante in un luogo, e si
  consulta come da noi si consulta il calendario prima di fissare qualcosa.
  Tutto discende da due sole longitudini, quella del Sole e quella della Luna,
  e da un'alba.
</p>

<table class="testo">
  <thead>
    <tr>
      <th>Membro</th>
      <th>Da che cosa</th>
      <th>Ampiezza</th>
      <th>Quanti</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Tithi</td><td>distanza Luna − Sole</td><td>12°</td><td>30 per mese lunare</td></tr>
    <tr><td>Karana</td><td>distanza Luna − Sole</td><td>6°</td><td>60 per mese lunare</td></tr>
    <tr><td>Yoga</td><td>somma Luna + Sole</td><td>13°20'</td><td>27</td></tr>
    <tr><td>Nakshatra</td><td>longitudine della Luna</td><td>13°20'</td><td>27</td></tr>
    <tr><td>Vara</td><td>l'alba</td><td>un giorno</td><td>7</td></tr>
  </tbody>
</table>

<h2 id="tithi">Il tithi</h2>

<p>
  Il giorno lunare: il tempo che la Luna impiega ad allontanarsi dal Sole di
  dodici gradi. Non dura un giorno solare, e non comincia a mezzanotte né
  all'alba: comincia quando la distanza passa un multiplo di dodici. Trenta
  tithi fanno un mese lunare, diviso in due metà (<em>paksha</em>) di quindici:
  la crescente, <em>shukla</em>, che finisce con la Luna piena
  (<em>Purnima</em>), e la calante, <em>krishna</em>, che finisce con la Luna
  nuova (<em>Amavasya</em>).
</p>

<h2 id="karana">Il karana</h2>

<p>
  Mezzo tithi, sei gradi di distanza: sessanta per mese. La sequenza non è un
  ciclo solo. Il primo karana del mese è <em>Kimstughna</em> e gli ultimi tre
  sono <em>Shakuni</em>, <em>Chatushpada</em> e <em>Naga</em>: quattro fissi,
  che compaiono una volta sola. In mezzo restano cinquantasei posti, che sono
  esattamente otto giri dei sette mobili.
</p>

<h2 id="yoga">Lo yoga</h2>

<p>
  La somma delle longitudini di Sole e Luna, divisa in ventisette parti da
  13°20'. Non ha niente a che fare con la disciplina che porta lo stesso nome,
  né con gli yoga dei temi natali, che sono combinazioni di graha: qui è
  soltanto una divisione del cerchio, e il primo è <em>Vishkambha</em>.
</p>

<h2 id="vara">La vara</h2>

<p>
  Il giorno della settimana, retto dal pianeta che gli dà il nome
  (<em>Ravivara</em>, il giorno del Sole, è la domenica). Ma il giorno comincia
  all'alba, non a mezzanotte: un istante prima dell'alba appartiene ancora
  alla vara del giorno prima. L'alba è quella degli almanacchi, col
  lembo superiore del Sole e la rifrazione, che anticipa di qualche minuto
  quella geometrica usata per le <a href="/metodo#elezione">ore planetarie</a>.
  Oltre i circoli polari, nei giorni in cui il Sole non sorge, la vara non c'è,
  e il risultato lo dice.
</p>

<h2 id="ayanamsa">Che cosa dipende dall'ayanamsa</h2>

<p>
  <strong>Tithi e karana no</strong>, perché una differenza fra due longitudini
  non cambia se si spostano entrambe dello stesso arco. Nakshatra e yoga sì, e
  lo yoga il doppio degli altri, perché usa la somma: cambiando
  <a href="/metodo#zodiaco">ayanamsa</a> di un grado, lo yoga si sposta di due.
</p>

<p>
  Il sito non ha ancora una pagina per il panchanga: lo calcola la riga di
  comando, con <code>--panchanga</code>.
</p>

<p class="aggiornamento">
  Il termine in breve sta nel <a href="/glossario/jyotisha#panchanga">glossario</a>.
</p>
