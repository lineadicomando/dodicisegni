<script lang="ts">
  import type { Shashtiamsa, VargaChart } from '@dodicisegni/core';
  import { BODY_GLYPH, SIGN_GLYPH, SIGN_LABEL, type StileQuadro } from '@dodicisegni/ruota';
  import type { Evidenza } from '#lib/evidenza.svelte.js';
  import QuadroVedico from './QuadroVedico.svelte';

  /**
   * Una carta divisionale.
   *
   * **La regola sta sotto il titolo e non in un tooltip.** Fra le sedici
   * divisioni le scuole divergono su più d'una, e un segno consegnato senza la
   * regola che l'ha prodotto non si può ricontrollare: chi ne segue un'altra
   * deve vederlo mentre guarda i segni, non dopo averli confrontati con un
   * altro programma.
   */
  interface Props {
    varga: VargaChart;
    /**
     * Lo stile del quadro. Omesso, la carta resta la sola tabella.
     *
     * Il disegno sta qui e non nella pagina perché è una carta divisionale
     * vista in due modi, non due cose accostate: chi la guarda deve trovare
     * il quadro sotto la regola che l'ha prodotto.
     */
    stile?: StileQuadro | undefined;
    /** Il graha isolato, condiviso con le altre tabelle e col quadro. */
    evidenza: Evidenza;
  }

  let { varga, stile = undefined, evidenza }: Props = $props();

  /**
   * Un varga con i segni soddisfa `SquareChart` così com'è: nessuna
   * conversione. Il D-2 di Parashara no, e non si disegna: ha la hora di un
   * luminare al posto del segno, e un quadro è fatto di segni.
   */
  const chart = $derived(varga.kind === 'segni' ? varga : undefined);

  const HORA_LABEL = { sole: 'del Sole', luna: 'della Luna' } as const;

  /**
   * Solo nel D-60: la colonna dei nomi dei sessanta mezzi gradi. La guardia
   * sta sulla fonte e non sull'identificativo, perché una risposta in cache
   * di prima del campo ha il D-60 senza nomi.
   */
  const nomi = $derived(varga.kind === 'segni' && varga.shashtiamsaSource !== undefined);

  /**
   * Gli arudha dei graha coi segni di questo varga (Narasimha Rao, §9.5), in
   * una colonna e non in una tabella a sé: sono di questa carta. Assenti
   * nelle risposte in cache di prima del campo.
   */
  const arudhas = $derived(varga.kind === 'segni' ? varga.grahaArudhas : undefined);
  const arudhaDi = (id: string) => arudhas?.grahas.find((g) => g.id === id);

</script>

<!-- Il numero è quello della lista del verso, che nei segni pari non è il
     mezzo grado: è quello con cui si ritrova il nome nella tavola. -->
{#snippet shashtiamsa(parte: Shashtiamsa | undefined)}
  {#if parte}<span class="tenue">{parte.number}</span> {parte.name}{/if}
{/snippet}

<section>
  <h3 class="titolo-sezione">{varga.name} ({varga.varga.toUpperCase()})</h3>
  {#if varga.convention}
    <p class="regola">
      Convenzione: <strong>{varga.convention.name}</strong>. {varga.convention.source}
    </p>
  {/if}
  <p class="regola">{varga.rule}</p>

  {#if stile && chart}
    <div class="disegno">
      <QuadroVedico {chart} {stile} {evidenza} titolo={varga.name} />
    </div>
  {/if}

  <table>
    <thead>
      <tr>
        <th></th>
        <th>Graha</th>
        <th>{varga.kind === 'segni' ? 'Segno' : 'Hora'}</th>
        {#if varga.kind === 'segni'}<th>Dignità del segno</th>{/if}
        {#if nomi}<th>Shashtiamsa</th>{/if}
        {#if arudhas}<th>Arudha (Rao)</th>{/if}
      </tr>
    </thead>
    <tbody>
      {#if varga.kind === 'signori'}
        {#if varga.ascendant}
          <tr>
            <td class="glifo">↑</td>
            <td>Lagna</td>
            <td>
              <span class="glifo-piccolo">{BODY_GLYPH[varga.ascendant]}</span>
              {HORA_LABEL[varga.ascendant]}
            </td>
          </tr>
        {/if}
        {#each varga.positions as position (position.id)}
          <tr
            onmouseenter={() => evidenza.sorvola(position.id)}
            onmouseleave={() => evidenza.sorvola(null)}
            class:evidenziato={evidenza.attivo === position.id}
          >
            <td class="glifo">{BODY_GLYPH[position.id]}</td>
            <td>{position.name}</td>
            <td>
              <span class="glifo-piccolo">{BODY_GLYPH[position.hora]}</span>
              {HORA_LABEL[position.hora]}
            </td>
          </tr>
        {/each}
      {:else}
      {#if varga.ascendant}
        <tr>
          <td class="glifo">↑</td>
          <td>Lagna</td>
          <td>
            <span class="glifo-piccolo" title={SIGN_LABEL[varga.ascendant]}>
              {SIGN_GLYPH[varga.ascendant]}
            </span>
            {SIGN_LABEL[varga.ascendant]}
          </td>
          <td></td>
          {#if nomi}<td>{@render shashtiamsa(varga.ascendantShashtiamsa)}</td>{/if}
          {#if arudhas}<td></td>{/if}
        </tr>
      {/if}
      {#each varga.positions as position (position.id)}
        <tr
          onmouseenter={() => evidenza.sorvola(position.id)}
          onmouseleave={() => evidenza.sorvola(null)}
          class:evidenziato={evidenza.attivo === position.id}
        >
          <td class="glifo">{BODY_GLYPH[position.id]}</td>
          <td>{position.name}</td>
          <td>
            <span class="glifo-piccolo" title={SIGN_LABEL[position.sign]}>
              {SIGN_GLYPH[position.sign]}
            </span>
            {SIGN_LABEL[position.sign]}
          </td>
          <td class:tenue={!position.dignitySigns?.length}>
            {position.dignitySigns?.join(', ') || (position.dignitySigns ? '—' : '')}
          </td>
          {#if nomi}<td>{@render shashtiamsa(position.shashtiamsa)}</td>{/if}
          {#if arudhas}
            {@const a = arudhaDi(position.id)}
            <td class:tenue={a && !a.pada} title={a?.ownSignRule}>
              {#if a?.pada}
                {SIGN_GLYPH[a.pada]} {SIGN_LABEL[a.pada]}
                {#if a.exception}<span class="tenue">· il 10°</span>{/if}
              {:else if a}
                indeterminato *
              {/if}
            </td>
          {/if}
        </tr>
      {/each}
      {/if}
    </tbody>
  </table>
  <!-- La guardia per le risposte in cache di prima del campo. -->
  {#if varga.kind === 'segni' && varga.dignitySource}
    <p class="fonti">{varga.dignitySource}</p>
  {/if}
  {#if varga.kind === 'segni' && varga.shashtiamsaSource}
    <p class="fonti">{varga.shashtiamsaSource}</p>
  {/if}
  {#if arudhas}
    {#each arudhas.grahas.filter((g) => !g.pada) as g (g.id)}
      <p class="fonti">* Arudha di {g.name}: {g.ownSignRule}</p>
    {/each}
    <p class="fonti">Arudha dei graha: {arudhas.source}</p>
  {/if}
</section>

<style>
  /* Il viewBox scala da sé: qui si toglie solo la larghezza fissa che l'SVG
     porta addosso, perché nasce anche come file a misura piena. */
  .disegno {
    max-width: 30rem;
    margin: 0 0 1rem;
  }

  .fonti {
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--testo-tenue);
  }

  .tenue {
    color: var(--testo-tenue);
  }

  .regola {
    margin: 0 0 0.75rem;
    color: var(--testo-tenue);
    font-size: 0.85rem;
    max-width: 46rem;
  }
</style>
