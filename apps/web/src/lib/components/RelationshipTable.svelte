<!--
  Le relazioni fra i sette graha, BPHS 3.55-58: una griglia in cui ogni riga
  dice come quel graha vede gli altri.

  Una griglia e non un elenco perché le relazioni hanno un verso, e in una
  griglia lo si vede: la riga del Sole e la colonna del Sole non dicono la
  stessa cosa. Nella cella c'è la composta, che è quella che il testo usa;
  sotto, chiusa, la naturale, da cui chi legge ricava il resto con la
  temporanea.
-->
<script lang="ts">
  import type { BodyId, CompoundMaitri, GrahaRelationships, Maitri } from '@dodicisegni/core';
  import { BODY_GLYPH, BODY_LABEL } from '@dodicisegni/ruota';
  import type { Evidenza } from '#lib/evidenza.svelte.js';

  interface Props {
    relazioni: GrahaRelationships;
    /** Il graha isolato, condiviso con le altre tabelle e col quadro. */
    evidenza?: Evidenza;
  }

  let { relazioni, evidenza }: Props = $props();

  const grahas = $derived([...new Set(relazioni.pairs.map((p) => p.from))]);

  function coppia(da: BodyId, a: BodyId) {
    return relazioni.pairs.find((p) => p.from === da && p.to === a);
  }

  /** I due estremi si distinguono a colpo d'occhio; i tre di mezzo no, apposta. */
  const FORTE: Readonly<Partial<Record<CompoundMaitri | Maitri, string>>> = {
    adhimitra: 'forte',
    adhishatru: 'forte',
  };
</script>

<section>
  <h3 class="titolo-sezione">Relazioni fra i graha</h3>
  <p class="nota">
    Ogni riga dice come quel graha vede gli altri: le relazioni hanno un verso, e
    la riga del Sole non è la sua colonna. Nella cella la relazione composta, la
    naturale e la temporanea insieme.
  </p>

  {@render griglia('panchadha')}

  <details>
    <summary>Naturale (naisargika), uguale in ogni tema</summary>
    {@render griglia('naisargika')}
  </details>

  <p class="fonti">{relazioni.source}</p>
</section>

{#snippet griglia(campo: 'panchadha' | 'naisargika')}
  <div class="scorre">
    <table>
      <thead>
        <tr>
          <th></th>
          {#each grahas as a (a)}<th class="glifo" title={BODY_LABEL[a]}>{BODY_GLYPH[a]}</th>{/each}
        </tr>
      </thead>
      <tbody>
        {#each grahas as da (da)}
          <tr
            onmouseenter={() => evidenza?.sorvola(da)}
            onmouseleave={() => evidenza?.sorvola(null)}
            class:evidenziato={evidenza?.attivo === da}
          >
            <td>{BODY_LABEL[da]}</td>
            {#each grahas as a (a)}
              {@const c = coppia(da, a)}
              <td
                class={c ? FORTE[c[campo]] : 'tenue'}
                title={c ? `naturale ${c.naisargika}, temporanea ${c.tatkalika}` : undefined}
              >
                {c ? c[campo] : '·'}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/snippet}

<style>
  .scorre {
    overflow-x: auto;
  }

  td {
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .forte {
    font-weight: 600;
  }

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

  .tenue {
    color: var(--testo-tenue);
  }
</style>
