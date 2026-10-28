<!--
  Il vimshopaka dei sette graha: la forza su venti punti nei quattro schemi
  di BPHS 7.17-27.

  Solo i numeri e la fonte. Il testo associa ai punteggi delle fasce
  («sotto cinque non dà buoni risultati»): sono un giudizio, e qui non ci
  sono. Il dettaglio per varga sta chiuso, per chi vuole rifare il conto.
-->
<script lang="ts">
  import type { Vimshopaka } from '@dodicisegni/core';
  import { BODY_GLYPH, BODY_LABEL } from '@dodicisegni/ruota';
  import type { Evidenza } from '#lib/evidenza.svelte.js';

  interface Props {
    vimshopaka: Vimshopaka;
    /** Il graha isolato, condiviso con le altre tabelle e col quadro. */
    evidenza?: Evidenza;
  }

  let { vimshopaka, evidenza }: Props = $props();

  const SCHEMI = ['shadvarga', 'saptavarga', 'dashavarga', 'shodashavarga'] as const;

  function punti(n: number): string {
    return n.toFixed(2).replace('.', ',');
  }
</script>

<section>
  <h3 class="titolo-sezione">Vimshopaka</h3>

  <table>
    <thead>
      <tr>
        <th></th>
        <th>Graha</th>
        {#each SCHEMI as schema (schema)}<th class="numerico">{schema}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each vimshopaka.grahas as graha (graha.id)}
        <tr
          onmouseenter={() => evidenza?.sorvola(graha.id)}
          onmouseleave={() => evidenza?.sorvola(null)}
          class:evidenziato={evidenza?.attivo === graha.id}
        >
          <td class="glifo">{BODY_GLYPH[graha.id]}</td>
          <td>{graha.name}</td>
          {#each graha.schemes as s (s.scheme)}<td class="numerico">{punti(s.points)}</td>{/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <p class="fonti">{vimshopaka.source}</p>

  <details>
    <summary>Varga per varga: il signore e la relazione</summary>
    <ul class="dettaglio">
      {#each vimshopaka.grahas as graha (graha.id)}
        <li>
          <strong>{graha.name}</strong>:
          {graha.vargas
            .map((v) => `${v.varga.toUpperCase()} ${BODY_LABEL[v.lord]} ${v.relation} (${v.viswa})`)
            .join(', ')}
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
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--testo-tenue);
  }

  .dettaglio {
    padding-left: 1.1rem;
    font-size: 0.85rem;
  }
</style>
