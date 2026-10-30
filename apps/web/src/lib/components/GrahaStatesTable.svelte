<!--
  Le condizioni dei graha che BPHS 6.53 nomina: combustione, guerra
  planetaria e avastha śayanādi. Ognuna con la sua fonte, perché il BPHS le
  nomina e non le definisce: i limiti e le regole vengono dal Surya
  Siddhanta, la formula delle avastha dal cap. 45 con le letture di
  Santhanam.

  Prende gli stati, non il tema. Come le altre tabelle, non dice che cosa
  uno stato significhi, né quale avastha guasti i varga buoni: il testo non
  lo dice.
-->
<script lang="ts">
  import type { GrahaStates } from '@dodicisegni/core';
  import { BODY_GLYPH, BODY_LABEL } from '@dodicisegni/ruota';
  import type { Evidenza } from '#lib/evidenza.svelte.js';

  interface Props {
    stati: GrahaStates;
    /** Il graha isolato, condiviso con le altre tabelle e col quadro. */
    evidenza?: Evidenza;
  }

  let { stati, evidenza }: Props = $props();

  function gradi(n: number): string {
    return `${n.toFixed(1).replace('.', ',')}°`;
  }

  const avasthaDi = (id: string) => stati.avasthas?.grahas.find((g) => g.id === id);
  const combustioneDi = (id: string) => stati.combustion.grahas.find((c) => c.id === id);
  const sconfittoDa = (id: string) => stati.wars.pairs.find((w) => w.defeated === id)?.victor;

  /** I nove graha nell'ordine delle avastha, o i sei della combustione se manca l'ora. */
  const righe = $derived(
    stati.avasthas
      ? stati.avasthas.grahas.map((g) => ({ id: g.id, name: g.name }))
      : stati.combustion.grahas.map((c) => ({ id: c.id, name: c.name })),
  );
</script>

<section>
  <h3 class="titolo-sezione">Stati dei graha (BPHS 6.53)</h3>

  <table>
    <thead>
      <tr>
        <th></th>
        <th>Graha</th>
        <th class="numerico">Dal Sole</th>
        <th class="numerico" title="Gradi di tempo (kālāṃśa): la distanza che il Surya Siddhanta misura, all'orizzonte del luogo">In gradi di tempo</th>
        <th>Combustione</th>
        <th>Guerra</th>
        {#if stati.avasthas}<th>Avastha</th>{/if}
      </tr>
    </thead>
    <tbody>
      {#each righe as riga (riga.id)}
        {@const c = combustioneDi(riga.id)}
        {@const a = avasthaDi(riga.id)}
        {@const vincitore = sconfittoDa(riga.id)}
        <tr
          onmouseenter={() => evidenza?.sorvola(riga.id)}
          onmouseleave={() => evidenza?.sorvola(null)}
          class:evidenziato={evidenza?.attivo === riga.id}
        >
          <td class="glifo">{BODY_GLYPH[riga.id]}</td>
          <td>{riga.name}</td>
          <td class="numerico" class:tenue={!c}>{c ? gradi(c.distance) : '—'}</td>
          <!-- Le risposte in cache di prima del campo non hanno i gradi di
               tempo: la cella resta vuota, come oltre i circoli polari. -->
          <td class="numerico" class:tenue={c?.timeDegrees === undefined}>
            {#if c?.timeDegrees !== undefined}{gradi(c.timeDegrees)} <span class="tenue">{c.horizon}</span>{:else}—{/if}
          </td>
          <td class:tenue={!c?.combust}>
            {#if c}{c.combust ? 'combusto' : '—'} <span class="tenue">· limite {c.limit}°</span>{:else}—{/if}
          </td>
          <td class:tenue={!vincitore}>{vincitore ? `vinto da ${BODY_LABEL[vincitore]}` : '—'}</td>
          {#if stati.avasthas}
            <td>
              {a?.avastha ?? '—'}
              {#if a}<span class="tenue">· {a.factors.s}×{a.factors.p}×{a.factors.n} … = {a.total}</span>{/if}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>

  <ul class="fonti">
    <li>{stati.combustion.source}</li>
    <li>
      {stati.wars.source}
      {#if stati.wars.pairs.length === 0}Nessuna coppia a meno di un grado.{/if}
      {#each stati.wars.pairs as w (w.between.join())}
        {BODY_LABEL[w.between[0]]} e {BODY_LABEL[w.between[1]]} a {gradi(w.separation)}: {w.rule}
      {/each}
    </li>
    {#if stati.avasthas}
      <li>
        {stati.avasthas.source} Ghati {stati.avasthas.ghati}, nakshatra della Luna
        {stati.avasthas.moonNakshatra}, lagna {stati.avasthas.lagnaSign}.
      </li>
    {/if}
  </ul>
</section>

<style>
  .fonti {
    margin: 0.5rem 0 0;
    padding-left: 1.1rem;
    font-size: 0.8rem;
    color: var(--testo-tenue);
  }

  .tenue {
    color: var(--testo-tenue);
  }
</style>
