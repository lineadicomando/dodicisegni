<!--
  I significatori di una domanda oraria secondo Lilly (pp. 123-124): il
  signore dell'Ascendente per chi chiede, il signore della casa del quesito
  per la cosa chiesta, e la Luna come cosignificatrice.

  Prende i significatori, non la figura: sono già tutto quello che serve.
-->
<script lang="ts">
  import type { HorarySignificator } from '@dodicisegni/core';
  import type { Evidenza } from '#lib/evidenza.svelte.js';
  import { formatSignDegree } from '#lib/format.js';
  import { BODY_GLYPH, BODY_LABEL, SIGN_GLYPH, SIGN_LABEL } from '@dodicisegni/ruota';

  interface Props {
    significators: HorarySignificator[];
    /** Lo stesso pianeta regge l'Ascendente e la casa del quesito. */
    sameSignificator: boolean;
    evidenza?: Evidenza;
  }

  let { significators, sameSignificator, evidenza }: Props = $props();

  const RUOLO: Record<HorarySignificator['role'], string> = {
    querente: 'Chi chiede',
    quesito: 'La cosa chiesta',
    cosignificatore: 'Cosignificatrice',
  };

  function governa(s: HorarySignificator): string {
    return s.role === 'cosignificatore' ? 'con il signore della 1' : `signore della ${s.rules}`;
  }
</script>

<section>
  <h3 class="titolo-sezione">Significatori</h3>
  <table>
    <thead>
      <tr>
        <th>Per</th>
        <th></th>
        <th>Pianeta</th>
        <th>Perché</th>
        <th>Dove</th>
        <th>Casa</th>
      </tr>
    </thead>
    <tbody>
      {#each significators as s (s.role)}
        <tr
          onmouseenter={() => evidenza?.sorvola(s.body)}
          onmouseleave={() => evidenza?.sorvola(null)}
          class:evidenziato={evidenza?.attivo === s.body}
        >
          <td>{RUOLO[s.role]}</td>
          <td class="glifo">{BODY_GLYPH[s.body]}</td>
          <td>{BODY_LABEL[s.body]}</td>
          <td class="tenue">{governa(s)}</td>
          <td>
            {formatSignDegree(s.longitude % 30)}
            <span class="glifo-piccolo" title={SIGN_LABEL[s.sign]}>{SIGN_GLYPH[s.sign]}</span>
          </td>
          <td>{s.house ?? '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p class="fonti">
    Lilly, pp. 123-124. La casa in cui sta un pianeta segue la regola dei cinque gradi
    (p. 33): entro cinque gradi dalla cuspide successiva conta già per quella.
    {#if sameSignificator}
      Qui lo stesso pianeta regge l'Ascendente e la casa del quesito: un significatore solo,
      e i modi della perfezione fra due pianeti non si cercano.
    {/if}
  </p>
</section>

<style>
  .fonti {
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--testo-tenue);
  }
</style>
