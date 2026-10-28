<!--
  Le dignità di un tema vedico secondo Parashara: una riga per ciascuno dei
  sette graha, e i signori dei segni.

  Non è `DignityTable.svelte` con un'altra fonte. Le dignità occidentali
  stanno in due colonne di domicili e in scuole che si chiedono per nome;
  queste sono una tradizione sola, con quattro stati che l'altra non ha
  (moolatrikona, per dirne uno) e senza i nodi, su cui il testo non sceglie.
  Fonderle in un componente vorrebbe dire mescolare due dottrine nella stessa
  tabella.

  Prende le dignità e le case, non il tema: è la regola delle altre tabelle.
  Come le altre, non dice che cosa una dignità significhi.
-->
<script lang="ts">
  import type { House, ParasharaDignities, ParasharaDignity } from '@dodicisegni/core';
  import { BODY_GLYPH, BODY_LABEL, SIGN_GLYPH, SIGN_LABEL, ZODIAC_ORDER } from '@dodicisegni/ruota';
  import type { Evidenza } from '#lib/evidenza.svelte.js';
  import { formatSignDegree } from '#lib/format.js';

  interface Props {
    dignities: ParasharaDignities;
    /** Le case a segni interi, per dire quali governa ciascun signore. Vuote senza ora. */
    houses?: House[];
    /** Il graha isolato, condiviso con le altre tabelle e col quadro. */
    evidenza?: Evidenza;
  }

  let { dignities, houses = [], evidenza }: Props = $props();

  /**
   * Il termine sanscrito resta, come vuole il resto del sito; la traduzione
   * accanto è per chi non lo conosce, ed è quella del glossario.
   */
  const VOCE: Record<ParasharaDignity, string> = {
    uccha: 'uccha (esaltazione)',
    moolatrikona: 'moolatrikona',
    swakshetra: 'swakshetra (segno proprio)',
    neecha: 'neecha (debilitazione)',
  };

  function caseDi(sign: string): string {
    return houses.filter((house) => house.sign === sign).map((house) => house.number).join(' ');
  }

  const conCase = $derived(houses.length > 0);
</script>

<section>
  <h3 class="titolo-sezione">Dignità (Parashara)</h3>

  <table>
    <thead>
      <tr>
        <th></th>
        <th>Graha</th>
        <th>Segno</th>
        <th class="numerico">Grado</th>
        <th>Dignità</th>
      </tr>
    </thead>
    <tbody>
      {#each dignities.grahas as graha (graha.id)}
        <tr
          onmouseenter={() => evidenza?.sorvola(graha.id)}
          onmouseleave={() => evidenza?.sorvola(null)}
          class:evidenziato={evidenza?.attivo === graha.id}
        >
          <td class="glifo">{BODY_GLYPH[graha.id]}</td>
          <td>{graha.name}</td>
          <td>{SIGN_GLYPH[graha.sign]} {SIGN_LABEL[graha.sign]}</td>
          <td class="numerico">{formatSignDegree(graha.signDegree)}</td>
          <td class:tenue={graha.dignity === null}>
            {graha.dignity ? VOCE[graha.dignity] : '—'}
            {#if graha.deepestDegree !== undefined}
              <span class="tenue">· più profonda a {graha.deepestDegree}°</span>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <p class="fonti">{dignities.source}</p>

  <!-- Chiuso all'inizio come nella tabella occidentale: dodici righe che
       servono a chi le cerca, e la prima che si cerca è il signore del lagna. -->
  <details>
    <summary>Signori dei segni{conCase ? ' e dei bhava' : ''}</summary>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Segno</th>
          <th>Signore</th>
          {#if conCase}<th class="numerico">Bhava</th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each ZODIAC_ORDER as sign (sign)}
          <tr>
            <td class="glifo">{SIGN_GLYPH[sign]}</td>
            <td>{SIGN_LABEL[sign]}</td>
            <td>{BODY_LABEL[dignities.signLords[sign]]}</td>
            {#if conCase}<td class="numerico">{caseDi(sign) || '—'}</td>{/if}
          </tr>
        {/each}
      </tbody>
    </table>
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

  .tenue {
    color: var(--testo-tenue);
  }
</style>
