<script lang="ts">
  import { nowMoment, shiftMoment, type MomentInput, type StepUnit } from '#lib/moment.js';

  interface Props {
    value: MomentInput;
    /**
     * Di che istante si tratta. Le due sezioni lo chiamano diversamente — il
     * giorno *del transito*, il giorno e basta — e il campo deve dirlo, non
     * lasciarlo dedurre dalla pagina in cui ci si trova.
     */
    what?: string;
    /** Prefisso degli identificatori: due moduli nella stessa pagina non collidono. */
    id?: string;
    /**
     * Che cosa fare quando l'istante si sposta da sé.
     *
     * Senza, le frecce non compaiono affatto: un passo che non ricalcola
     * niente cambierebbe solo un numero nel modulo, e tanto varrebbe scriverlo
     * a mano. Non è un `$effect` sull'istante di proposito — scatterebbe anche
     * mentre si digita nel campo della data, una richiesta per tasto.
     */
    onstep?: () => void;
    /**
     * La forma da striscia: tutto su una riga sola, senza etichette né note.
     *
     * La usa il modulo chiuso, che resta appeso in cima alla pagina mentre si
     * sfoglia il risultato. Là l'altezza è lo spazio che si sta togliendo a
     * quello che si vuole guardare, e le etichette le sostituisce il contesto:
     * l'istante è scritto per esteso nell'intestazione del risultato.
     */
    compact?: boolean;
  }

  let {
    value = $bindable(),
    what = '',
    id = 'momento',
    onstep,
    compact = false,
  }: Props = $props();

  const suffix = $derived(what ? ` ${what}` : '');

  /**
   * Il fuso in cui vanno letti i due campi.
   *
   * Va detto: è quello di chi guarda, e nei transiti non coincide con quello
   * di nascita. Senza scriverlo, «ore 9» sarebbe un'ora ambigua fra due
   * orologi.
   */
  const zona = $derived(value.timezone.replace('_', ' '));

  /** Le ampiezze del passo, dalla più fine: è anche l'ordine del menù. */
  type Passo = { unit: StepUnit; label: string; uno: string };
  // Una tupla e non un elenco: il ripiego qui sotto vuole un primo elemento
  // che ci sia di sicuro.
  const PASSI: readonly [Passo, ...Passo[]] = [
    { unit: 'day', label: 'giorno', uno: 'Un giorno' },
    { unit: 'week', label: 'settimana', uno: 'Una settimana' },
    { unit: 'month', label: 'mese', uno: 'Un mese' },
    { unit: 'year', label: 'anno', uno: 'Un anno' },
  ];

  let unit = $state<StepUnit>('day');

  const passo = $derived(PASSI.find((candidato) => candidato.unit === unit) ?? PASSI[0]);

  function step(amount: number): void {
    value = shiftMoment(value, unit, amount);
    onstep?.();
  }

  function adesso(): void {
    value = nowMoment();
    // Anche questo è un salto a un altro istante: due controlli accanto di cui
    // uno ricalcola e l'altro no sarebbero due gesti diversi senza dirlo.
    onstep?.();
  }
</script>

<div class="momento" class:compatto={compact}>
  <div class="campo">
    <!-- L'etichetta si nasconde alla vista, non alla lettura: togliendola,
         l'unica cosa che dice che cos'è questo campo sparirebbe anche per chi
         la pagina non la vede affatto. -->
    <label for="{id}-data" class:nascosto={compact}>Giorno{suffix}</label>
    <input id="{id}-data" type="date" bind:value={value.date} required />
    {#if !compact}
      <p class="fuso">
        Ora di {zona} ·
        <button type="button" class="adesso" onclick={adesso}>adesso</button>
      </p>
    {/if}
  </div>

  <div class="campo">
    <label for="{id}-ora" class:nascosto={compact}>Ora{suffix}</label>
    <input id="{id}-ora" type="time" bind:value={value.time} />
    {#if !compact && !value.time}
      <p class="fuso">Senza ora: mezzogiorno. Nella giornata si sposta solo la Luna.</p>
    {/if}
  </div>

  {#if onstep}
    <!-- Aperto, le frecce stanno in riga con i due campi e hanno un'etichetta
         come loro: sotto la data sembravano spostare solo quella, e spostano
         l'istante intero. Chiuso l'etichetta si nasconde alla vista come le
         altre. I pulsanti sono `type="button"`: nei transiti il modulo è dentro
         un `<form>`, e senza dirlo un passo indietro manderebbe una richiesta. -->
    <div class="campo passo-campo">
      <label for="{id}-passo" class:nascosto={compact}>Sposta di</label>
      <div class="passo">
        <button
          type="button"
          class="freccia"
          aria-label="{passo.uno} indietro"
          onclick={() => step(-1)}>‹</button
        >

        <select id="{id}-passo" bind:value={unit}>
          {#each PASSI as candidato (candidato.unit)}
            <option value={candidato.unit}>{candidato.label}</option>
          {/each}
        </select>

        <button
          type="button"
          class="freccia"
          aria-label="{passo.uno} avanti"
          onclick={() => step(1)}>›</button
        >
      </div>
    </div>
  {/if}

  {#if compact}
    <button type="button" class="adesso" onclick={adesso}>adesso</button>
  {/if}
</div>

<style>
  .momento {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    align-items: flex-start;
    /* Nella striscia divide la riga con il pulsante dei dettagli: senza
       reclamare lo spazio libero si stringerebbe fino a mandare a capo i due
       campi anche dove ci starebbero. */
    flex: 1 1 auto;
    min-width: 0;
  }

  /* Ogni campo prende la sua larghezza, non metà della riga: con la crescita
     libera giorno e ora finivano ai due capi del modulo, a mezzo schermo l'uno
     dall'altro. La misura la danno gli input, che ne hanno una propria. */
  .campo {
    flex: 0 0 auto;
    min-width: 0;
  }

  .fuso {
    margin: 0.4rem 0 0;
    font-size: 0.78rem;
    color: var(--testo-tenue);
  }

  .adesso {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.78rem;
    color: var(--accento);
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }

  /* Le frecce e il menù si stirano all'altezza del più alto, che è il menù:
     la stessa dei campi accanto, così la riga è una riga sola. */
  .passo {
    display: flex;
    align-items: stretch;
    gap: 0.35rem;
  }

  /* I campi del modulo occupano tutta la riga; qui invece i tre controlli
     stanno insieme, e il menù non deve spingere via le frecce. */
  .passo select {
    width: auto;
  }

  .freccia {
    min-width: 2.5rem;
    padding: 0 0.6rem;
    background: none;
    color: var(--accento);
    border: 1px solid var(--linea-forte);
    border-radius: var(--raggio);
    cursor: pointer;
    line-height: 1.3;
  }

  .freccia:hover {
    border-color: var(--accento);
  }

  .compatto {
    gap: 0.5rem;
    align-items: center;
  }

  .compatto .campo {
    flex: 0 0 auto;
    min-width: 0;
  }

  .compatto input {
    width: auto;
    padding: 0.3rem 0.5rem;
  }

  /* Nella striscia il menù del passo resta tenue: è l'ampiezza del gesto, non
     un valore del calcolo. */
  .compatto .passo select {
    color: var(--testo-tenue);
  }

  /* Nella striscia i controlli del passo non stanno più sotto i campi ma in
     riga con loro e con il pulsante dei dettagli, e là un'altezza propria non
     si legge come una gerarchia: si legge come un dislivello. Prendono la
     misura del pulsante — stesso corpo, stesso incavo — e la riga torna una
     riga sola. La misura è quella di `.commuta` in `ModuloPieghevole`: se
     cambia là, cambia qui. */
  .compatto .passo select,
  .compatto .freccia,
  .compatto .adesso {
    padding: 0.35rem 0.8rem;
    font-size: 0.85rem;
    line-height: 1.55;
  }

  /* Le frecce sono i due controlli che si premono più spesso — sfogliare è il
     mestiere della striscia — e portano il segno più stretto di tutta la riga.
     La larghezza gliela dà un minimo e non l'incavo: il bersaglio deve essere
     più grande del glifo, e i due tasti larghi uguali fra loro anche se «‹» e
     «›» non misurano lo stesso. */
  .compatto .freccia {
    min-width: 2.5rem;
    padding-inline: 0.6rem;
  }

  /* Aperto, «adesso» è una parola in fondo alla nota del fuso, e il
     sottolineato la distingue dal testo intorno. Chiuso non ha più nessun
     testo intorno: è un comando in una riga di comandi, e lo dice stando come
     stanno gli altri. */
  .compatto .adesso {
    flex: none;
    border: 1px solid var(--linea-forte);
    border-radius: var(--raggio);
    text-decoration: none;
  }

  .compatto .adesso:hover {
    border-color: var(--accento);
  }
</style>
