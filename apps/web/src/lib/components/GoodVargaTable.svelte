<!--
  I varga buoni dei sette graha e il loro conto nei quattro schemi del BPHS,
  col nome che il testo dà a ciascun conto.

  Le scelte di lettura stanno sotto la tabella e non in una nota a parte:
  cambiano il numero, e chi conta con un'altra lettura deve vederle mentre
  guarda il conto. La tabella non dice che cosa un nome prometta.
-->
<script lang="ts">
  import type { GoodVargas, VargaScheme } from '@dodicisegni/core';
  import { BODY_GLYPH, BODY_LABEL, SIGN_LABEL } from '@dodicisegni/ruota';
  import type { Evidenza } from '#lib/evidenza.svelte.js';

  interface Props {
    buoni: GoodVargas;
    /** Il graha isolato, condiviso con le altre tabelle e col quadro. */
    evidenza?: Evidenza;
  }

  let { buoni, evidenza }: Props = $props();

  const SCHEMI: readonly VargaScheme[] = ['shadvarga', 'saptavarga', 'dashavarga', 'shodashavarga'];
</script>

<section>
  <h3 class="titolo-sezione">Varga buoni</h3>

  <table>
    <thead>
      <tr>
        <th></th>
        <th>Graha</th>
        {#each SCHEMI as schema (schema)}<th>{schema}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each buoni.grahas as graha (graha.id)}
        <tr
          onmouseenter={() => evidenza?.sorvola(graha.id)}
          onmouseleave={() => evidenza?.sorvola(null)}
          class:evidenziato={evidenza?.attivo === graha.id}
        >
          <td class="glifo">{BODY_GLYPH[graha.id]}</td>
          <td>
            {graha.name}
            {#if graha.neecha}<span class="tenue">· neecha</span>{/if}
          </td>
          {#each graha.schemes as conto (conto.scheme)}
            <td>
              <span class="numerico">{conto.good}/{conto.vargas}</span>
              <span class:tenue={!conto.name}>{conto.name ?? '—'}</span>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <ul class="fonti">
    <li>{buoni.source}</li>
    <li>
      Arudha lagna: <strong>{SIGN_LABEL[buoni.arudhaLagna]}</strong>. {buoni.arudhaRule}
      Signori dei kendra dall'arudha: {buoni.kendraLords.map((id) => BODY_LABEL[id]).join(', ')};
      i loro segni sono buoni per tutti: {buoni.arudhaSigns.map((s) => SIGN_LABEL[s]).join(', ')}.
    </li>
    <li>{buoni.hora.rule}</li>
    <li>{buoni.verse53}</li>
  </ul>

  <!-- Chiuso all'inizio: sono sette righe lunghe, e servono a chi vuole
       rifare il conto. -->
  <details>
    <summary>Quali varga sono buoni, e perché</summary>
    <ul class="dettaglio">
      {#each buoni.grahas as graha (graha.id)}
        <li>
          <strong>{graha.name}</strong>:
          {graha.vargas
            .filter((v) => v.good.length > 0)
            .map((v) => `${v.varga.toUpperCase()} (${v.good.join(', ')})`)
            .join(', ') || 'nessuno'}
        </li>
      {/each}
    </ul>
  </details>
</section>

<style>
  details {
    margin-top: 0.75rem;
  }

  summary {
    cursor: pointer;
  }

  .fonti {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--testo-tenue);
  }

  .fonti li {
    margin-bottom: 0.3rem;
  }

  .dettaglio {
    padding-left: 1.1rem;
    font-size: 0.85rem;
  }

  .tenue {
    color: var(--testo-tenue);
  }
</style>
