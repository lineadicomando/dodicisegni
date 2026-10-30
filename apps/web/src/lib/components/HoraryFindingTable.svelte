<!--
  Che cosa i classificatori della scuola di Lilly trovano nella figura: i modi
  della perfezione (congiunzione, aspetto, traslazione, collezione, pp.
  125-126) o quelli dell'impedimento (proibizione, frustrazione,
  refranazione, pp. 110-113), ciascuno con la pagina del libro e gli eventi da
  cui lo si legge.

  Non dice se la cosa avverrà: dice che la figura ha questa configurazione.
  Il giudizio è di chi legge.
-->
<script lang="ts">
  import type { HoraryEvent, HoraryFinding, ReceptionDignity } from '@dodicisegni/core';
  import { formatLocalInstant } from '#lib/format.js';
  import { BODY_LABEL, SIGN_LABEL } from '@dodicisegni/ruota';

  interface Props {
    titolo: string;
    findings: HoraryFinding[];
    /** Che cosa scrivere quando non c'è niente. */
    vuoto: string;
  }

  let { titolo, findings, vuoto }: Props = $props();

  function evento(e: HoraryEvent): string {
    const chi = BODY_LABEL[e.body];
    if (e.kind === 'aspetto') return `${chi} ${e.aspect} ${BODY_LABEL[e.with]}`;
    if (e.kind === 'stazione') return `${chi} stazione ${e.direction}`;
    return `${chi} entra in ${SIGN_LABEL[e.sign]}`;
  }

  function voce(dignita: ReceptionDignity): string {
    return dignita === 'triplicita' ? 'triplicità' : dignita;
  }
</script>

<section>
  <h3 class="titolo-sezione">{titolo}</h3>
  {#if findings.length === 0}
    <p class="tenue">{vuoto}</p>
  {:else}
    <ul class="trovati">
      {#each findings as f, index (index)}
        <li>
          <p>
            <strong>{f.mode}</strong>{#if f.by}, per {BODY_LABEL[f.by]}{/if}{#if f.aspect}, di
              {f.aspect}{/if}{#if f.local}, esatta il {formatLocalInstant(f.local)}{/if}
            <span class="tenue">· p. {f.page}</span>
          </p>
          <p class="definizione">{f.definition}</p>
          <ol class="eventi">
            {#each f.events as e, i (i)}
              <li><span class="quando">{formatLocalInstant(e.local)}</span> {evento(e)}</li>
            {/each}
          </ol>
          {#if f.reception && f.reception.length > 0}
            <p class="tenue">
              {#each f.reception as r, i (i)}
                {i > 0 ? '; ' : ''}{BODY_LABEL[r.by]} riceve {BODY_LABEL[r.of]}: {r.dignities.length > 0
                  ? r.dignities.map(voce).join(', ')
                  : 'no'}
              {/each}
            </p>
          {/if}
          {#if f.note}
            <p class="tenue">{f.note}</p>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .trovati {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1rem;
  }

  .trovati p {
    margin: 0 0 0.25rem;
  }

  .definizione {
    font-size: 0.9rem;
  }

  .eventi {
    margin: 0.25rem 0;
    padding-left: 1.25rem;
    font-size: 0.85rem;
  }

  .quando {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    color: var(--testo-tenue);
  }
</style>
