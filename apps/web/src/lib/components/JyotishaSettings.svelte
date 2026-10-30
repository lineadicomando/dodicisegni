<script lang="ts">
  import type { AyanamsaId, DashaYear, HoraConvention, NodeDrishti, VargaId } from '@dodicisegni/core';
  import { AYANAMSAS } from '#lib/zodiacs.js';
  import { SCHEMI_VARGA, VARGHE } from '#lib/varghe.js';

  /**
   * Le opzioni della sezione vedica, con la stessa forma di `ChartSettings`.
   *
   * Un componente e non un blocco dentro la pagina, per la stessa ragione di
   * quello: le stesse opzioni compaiono **due volte** — fra i campi del modulo
   * e nella striscia che resta quando lo si chiude — e due copie divergono.
   *
   * Zodiaco e case non ci sono, e non è una dimenticanza: siderale e segni
   * interi sono ciò che rende vedico un tema, non un predefinito da cambiare.
   * Restano le divergenze vere, quelle su cui le scuole non concordano.
   */
  interface Props {
    ayanamsa: AyanamsaId;
    dashaLevels: 1 | 2 | 3;
    dashaYear: DashaYear;
    drishtiNodes: NodeDrishti;
    /** Le carte divisionali da mostrare, oltre alla rashi che c'è sempre. */
    vargas: VargaId[];
    /**
     * Come leggere il D-2. Il menù compare solo quando il D-2 è fra le carte:
     * altrove non cambia niente, e un menù che non cambia niente si legge come
     * se cambiasse qualcosa.
     */
    hora: HoraConvention;
    /**
     * Che cosa fare quando un'opzione cambia.
     *
     * Come in `ChartSettings`: senza, il cambiamento aspetta «Calcola»; con, è
     * la domanda stessa, ed è così che la striscia lascia confrontare due
     * ayanamsa sullo stesso tema senza risalire la pagina.
     */
    onchange?: () => void;
    /**
     * La forma da striscia: i menù in riga, senza le caselle dei varga.
     *
     * Cinque caselle in una riga che divide lo spazio col pulsante dei
     * dettagli manderebbero tutto a capo. Là si cambia una convenzione
     * guardando il risultato; quali carte mostrare si decide prima.
     */
    compact?: boolean;
  }

  let {
    ayanamsa = $bindable(),
    dashaLevels = $bindable(),
    dashaYear = $bindable(),
    drishtiNodes = $bindable(),
    vargas = $bindable(),
    hora = $bindable(),
    onchange,
    compact = false,
  }: Props = $props();

  /** Se le caselle spuntate sono esattamente quelle del gruppo. */
  function coincide(gruppo: readonly VargaId[]): boolean {
    return gruppo.length === vargas.length && gruppo.every((id) => vargas.includes(id));
  }

  /** Spunta le carte di un gruppo, nell'ordine dell'elenco. */
  function scegli(gruppo: readonly VargaId[]): void {
    vargas = VARGHE.filter((varga) => gruppo.includes(varga.value)).map((varga) => varga.value);
    onchange?.();
  }

  function commuta(id: VargaId): void {
    vargas = VARGHE.filter((varga) =>
      vargas.includes(varga.value) ? varga.value !== id : varga.value === id,
    ).map((varga) => varga.value);
    onchange?.();
  }
</script>

<!-- Nel modulo le opzioni sono due fasce: le convenzioni, in riga, e le
     carte divisionali sotto, a tutta larghezza. Ogni menù sta nel suo
     contenitore perché la griglia lo tratti come un campo solo; nella
     striscia i contenitori spariscono (`display: contents`) e la riga resta
     quella di prima. -->
<div class:compatto={compact}>
  <fieldset class="senza-cornice convenzioni">
    <legend class="titolo-fascia" class:nascosto={compact}>Convenzioni</legend>
    <div class="campo">
      <label for="ayanamsa" class:nascosto={compact}>Ayanamsa</label>
      <select id="ayanamsa" bind:value={ayanamsa} onchange={() => onchange?.()}>
        {#each AYANAMSAS as voce (voce.value)}
          <option value={voce.value}>{voce.label}</option>
        {/each}
      </select>
    </div>

    <div class="campo">
      <label for="livelli" class:nascosto={compact}>Ordini di dasha</label>
      <select id="livelli" bind:value={dashaLevels} onchange={() => onchange?.()}>
        <option value={1}>Solo mahadasha</option>
        <option value={2}>Con antardasha</option>
        <option value={3}>Con pratyantardasha</option>
      </select>
    </div>

    <div class="campo">
      <label for="anno" class:nascosto={compact}>Anno di dasha</label>
      <select id="anno" bind:value={dashaYear} onchange={() => onchange?.()}>
        <option value="solare">Anno solare (365,25 giorni)</option>
        <option value="savana">Anno savana (360 giorni)</option>
      </select>
    </div>

    <div class="campo">
      <label for="nodi" class:nascosto={compact}>Drishti di Rahu e Ketu</label>
      <select id="nodi" bind:value={drishtiNodes} onchange={() => onchange?.()}>
        <option value="nessuna">Nodi senza sguardi</option>
        <option value="gioviana">Nodi come Giove</option>
      </select>
    </div>

    <!-- Nella striscia le caselle non ci sono, e la hora resta fra i menù. -->
    {#if compact && vargas.includes('d2')}
      {@render menuHora()}
    {/if}
  </fieldset>

  {#if !compact}
    <div class="fascia">
      <fieldset class="senza-cornice divisionali">
        <legend class="titolo-fascia">Carte divisionali</legend>
        <p class="nota">La carta rashi (D1) c'è sempre.</p>

        <!-- I gruppi sono quelli che Parashara nomina, e non una scorciatoia
             nostra: un gruppo inventato qui sarebbe una scelta di scuola che
             nessuno ha fatto. Premuto dice quale gruppo coincide con le caselle,
             e smette di dirlo appena se ne tocca una. -->
        <div class="gruppi" role="group" aria-label="Gruppi di Parashara">
          {#each SCHEMI_VARGA as schema (schema.value)}
            <button
              type="button"
              aria-pressed={coincide(schema.vargas)}
              title={schema.vargas.map((id) => id.toUpperCase()).join(' ')}
              onclick={() => scegli(schema.vargas)}
            >
              {schema.label}
            </button>
          {/each}
          <button type="button" aria-pressed={vargas.length === 0} onclick={() => scegli([])}>
            Nessuna
          </button>
        </div>

        <div class="scelte">
          {#each VARGHE as varga (varga.value)}
            <label class="interruttore">
              <input
                type="checkbox"
                checked={vargas.includes(varga.value)}
                onchange={() => commuta(varga.value)}
              />
              <span>{varga.label}</span>
            </label>
          {/each}
        </div>

        <!-- Sotto le caselle e non fra i menù: compare quando si spunta la D2,
             vicino a dove si è cliccato, e sposta solo ciò che sta sotto. -->
        {#if vargas.includes('d2')}
          <div class="campo hora">
            {@render menuHora()}
          </div>
        {/if}
      </fieldset>
    </div>
  {/if}
</div>

{#snippet menuHora()}
  <label for="hora" class:nascosto={compact}>Hora (D2)</label>
  <select id="hora" bind:value={hora} onchange={() => onchange?.()}>
    <option value="parashara">Hora di Parashara, senza segni</option>
    <option value="leone-cancro">Hora in Leone e Cancro</option>
    <option value="parivritti-dvaya">Parivritti-dvaya</option>
    <option value="kashinatha">Kashinatha (Rath)</option>
    <option value="suprajarama">Raman Suprajarama</option>
    <option value="uma-shambhu">Uma-Shambhu (Rao)</option>
  </select>
{/snippet}

<style>
  /* I menù dividono una riga come i campi della nascita, e vanno a capo da soli
     dove non ci stanno, come in `ChartSettings`. */
  .convenzioni {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: 1rem 1.25rem;
    align-items: start;
  }

  .nota {
    margin: -0.3rem 0 0.6rem;
    color: var(--testo-tenue);
    font-size: 0.8rem;
  }

  .gruppi {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 0.75rem;
  }

  .gruppi button {
    padding: 0.25rem 0.7rem;
    background: none;
    color: var(--testo-tenue);
    border: 1px solid var(--linea-forte);
    border-radius: 999px;
    font: inherit;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .gruppi button:hover {
    border-color: var(--accento);
    color: inherit;
  }

  .gruppi button[aria-pressed='true'] {
    border-color: var(--accento);
    color: var(--accento);
  }

  /* Colonne di larghezza uguale, non caselle che vanno a capo dove capita:
     quindici voci si leggono per righe e per colonne. */
  .scelte {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
    gap: 0.1rem 1.25rem;
  }

  .hora {
    margin-top: 1rem;
    max-width: 22rem;
  }

  /* Come nella striscia della ruota: i menù dividono una riga con il pulsante
     dei dettagli, e senza reclamare lo spazio libero si stringerebbero fino a
     mandare a capo anche dove ci starebbero. I contenitori dei campi e la
     fascia spariscono, e i menù tornano figli diretti della riga. */
  .compatto {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    flex: 1 1 auto;
    min-width: 0;
  }

  .compatto .convenzioni,
  .compatto .campo {
    display: contents;
  }

  .compatto select {
    width: auto;
    padding: 0.3rem 0.5rem;
  }
</style>
