<!--
  Gli arudha dei dodici bhava, BPHS 29.1-7.

  Una riga per bhava. Per lo Scorpione e l'Acquario, che hanno due signori,
  la riga dice da quale si è contato e perché: è una lettura, e chi conta
  con l'altro signore deve vederla.
-->
<script lang="ts">
  import type { Arudhas } from '@dodicisegni/core';
  import { BODY_LABEL, SIGN_GLYPH, SIGN_LABEL } from '@dodicisegni/ruota';

  interface Props {
    arudhas: Arudhas;
  }

  let { arudhas }: Props = $props();
</script>

<section>
  <h3 class="titolo-sezione">Arudha dei bhava</h3>

  <table>
    <thead>
      <tr>
        <th class="numerico">Bhava</th>
        <th>Pada</th>
        <th>Segno del bhava</th>
        <th>Signore</th>
        <th>Arudha</th>
      </tr>
    </thead>
    <tbody>
      {#each arudhas.padas as p (p.bhava)}
        <tr>
          <td class="numerico">{p.bhava}</td>
          <td>{p.name}</td>
          <td>{SIGN_GLYPH[p.sign]} {SIGN_LABEL[p.sign]}</td>
          <td title={p.lordChoice}>
            {BODY_LABEL[p.lord]}{#if p.lordChoice}<span class="tenue"> *</span>{/if}
          </td>
          <td>{SIGN_GLYPH[p.pada]} {SIGN_LABEL[p.pada]}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <ul class="fonti">
    {#each arudhas.padas.filter((p) => p.lordChoice) as p (p.bhava)}
      <li>* {SIGN_LABEL[p.sign]}: {p.lordChoice}</li>
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
