<!--
  Le considerazioni prima del giudizio, pp. 121-123: predicati, mai un
  rifiuto. Lilly le scrive come avvertimenti all'astrologo; qui ciascuna dice
  se vale nella figura, e quelle senza una soglia nel testo dicono di non
  essere calcolate, e perché.
-->
<script lang="ts">
  import type { HoraryConsideration } from '@dodicisegni/core';

  interface Props {
    considerations: HoraryConsideration[];
  }

  let { considerations }: Props = $props();

  function esito(c: HoraryConsideration): string {
    return c.holds === undefined ? 'non calcolata' : c.holds ? 'sì' : 'no';
  }
</script>

<section>
  <h3 class="titolo-sezione">Considerazioni prima del giudizio</h3>
  <table>
    <thead>
      <tr>
        <th>Vale</th>
        <th>Lilly</th>
        <th>p.</th>
      </tr>
    </thead>
    <tbody>
      {#each considerations as c (c.id)}
        <tr>
          <td class:tenue={c.holds !== true}><strong>{esito(c)}</strong></td>
          <td>
            {c.text}
            {#if c.detail}<span class="tenue"> {c.detail}</span>{/if}
          </td>
          <td class="tenue">{c.page}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p class="fonti">
    Lilly le chiede prima di giudicare, e con nessuna rifiuta la domanda: dicono a chi
    legge di procedere con cautela.
  </p>
</section>

<style>
  .fonti {
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--testo-tenue);
  }
</style>
