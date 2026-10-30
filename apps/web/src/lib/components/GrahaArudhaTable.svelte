<!--
  Gli arudha dei nove graha secondo Narasimha Rao (2000), §9.5.

  Separata da `ArudhaTable.svelte` apposta: gli arudha dei bhava sono del
  BPHS, questi di un'altra scuola, con le sue esaltazioni dei nodi e la sua
  eccezione. In una tabella sola sembrerebbero una dottrina.
-->
<script lang="ts">
  import type { GrahaArudhas } from '@dodicisegni/core';
  import { BODY_GLYPH, SIGN_GLYPH, SIGN_LABEL } from '@dodicisegni/ruota';
  import type { Evidenza } from '#lib/evidenza.svelte.js';

  interface Props {
    arudhas: GrahaArudhas;
    /** Il graha isolato, condiviso con le altre tabelle e col quadro. */
    evidenza?: Evidenza;
  }

  let { arudhas, evidenza }: Props = $props();
</script>

<section>
  <h3 class="titolo-sezione">Arudha dei graha (Narasimha Rao)</h3>

  <table>
    <thead>
      <tr>
        <th></th>
        <th>Graha</th>
        <th>Segno</th>
        <th>Segno proprio</th>
        <th>Arudha</th>
      </tr>
    </thead>
    <tbody>
      {#each arudhas.grahas as g (g.id)}
        <tr
          onmouseenter={() => evidenza?.sorvola(g.id)}
          onmouseleave={() => evidenza?.sorvola(null)}
          class:evidenziato={evidenza?.attivo === g.id}
        >
          <td class="glifo">{BODY_GLYPH[g.id]}</td>
          <td>{g.name}</td>
          <td>{SIGN_GLYPH[g.sign]} {SIGN_LABEL[g.sign]}</td>
          <!-- Nella rashi segno proprio e arudha ci sono sempre: mancano solo
               nei varga, che li mostrano in `VargaTable.svelte`. La guardia
               serve al tipo, che è lo stesso. -->
          <td title={g.ownSignRule}>
            {g.ownSign ? SIGN_LABEL[g.ownSign] : 'indeterminato'}{#if g.ownSignRule}<span class="tenue"> *</span>{/if}
          </td>
          <td>
            {#if g.pada}
              {SIGN_GLYPH[g.pada]} {SIGN_LABEL[g.pada]}
              {#if g.exception}<span class="tenue">· il 10°</span>{/if}
            {:else}
              indeterminato
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <ul class="fonti">
    {#each arudhas.grahas.filter((g) => g.ownSignRule) as g (g.id)}
      <li>* {g.name}: {g.ownSignRule}</li>
    {/each}
    <li>{arudhas.source}</li>
  </ul>
</section>

<style>
  .fonti {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--testo-tenue);
  }

  .tenue {
    color: var(--testo-tenue);
  }
</style>
