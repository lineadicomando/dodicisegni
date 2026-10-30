<script lang="ts">
  import type { HoraryLilly } from '@dodicisegni/core';
  import type { Location } from '@dodicisegni/geo';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import {
    fetchHorary,
    fetchHoraryCompact,
    fetchLocation,
    horaryParameters,
    RequestError,
  } from '#lib/api.js';
  import AngleTable from '#lib/components/AngleTable.svelte';
  import AspectTable from '#lib/components/AspectTable.svelte';
  import BodyTable from '#lib/components/BodyTable.svelte';
  import CampiMancanti from '#lib/components/CampiMancanti.svelte';
  import ChartWheel from '#lib/components/ChartWheel.svelte';
  import DignityTable from '#lib/components/DignityTable.svelte';
  import HoraryConsiderationList from '#lib/components/HoraryConsiderationList.svelte';
  import HoraryFindingTable from '#lib/components/HoraryFindingTable.svelte';
  import HorarySignificatorTable from '#lib/components/HorarySignificatorTable.svelte';
  import LegendaElementi from '#lib/components/LegendaElementi.svelte';
  import LillyConditionsTable from '#lib/components/LillyConditionsTable.svelte';
  import LocationSearch from '#lib/components/LocationSearch.svelte';
  import Meta from '#lib/components/Meta.svelte';
  import ModuloPieghevole from '#lib/components/ModuloPieghevole.svelte';
  import MomentFields from '#lib/components/MomentFields.svelte';
  import Risultato from '#lib/components/Risultato.svelte';
  import SignCourseTable from '#lib/components/SignCourseTable.svelte';
  import StrumentiDisegno from '#lib/components/StrumentiDisegno.svelte';
  import StrumentiLettura from '#lib/components/StrumentiLettura.svelte';
  import { CASE_LILLY } from '#lib/case-lilly.js';
  import { Evidenza } from '#lib/evidenza.svelte.js';
  import { nowMoment } from '#lib/moment.js';

  /**
   * L'istante della domanda: adesso, come nell'oraria si fa. Una domanda
   * posta ieri si giudica sull'istante di ieri, e il modulo lo lascia
   * scrivere.
   */
  let moment = $state(nowMoment());
  let location = $state<Location | null>(null);
  /** La casa del quesito. Nessuna all'inizio: la sceglie chi chiede, e un default sceglierebbe al suo posto. */
  let house = $state<number | null>(null);
  /** Per le case derivate: la casa da cui contare. */
  let derivata = $state(false);
  let derivedFrom = $state<number>(3);
  /**
   * La domanda come l'ha scritta chi chiede. Resta nel browser: serve solo al
   * prompt, non va al server e non entra nell'indirizzo.
   */
  let domanda = $state('');

  let horary = $state<HoraryLilly | null>(null);
  /**
   * I parametri della figura a schermo, non quelli del modulo: chi cambia la
   * casa dopo aver calcolato non deve ritrovarsi nel prompt una figura che
   * non sta guardando.
   */
  let mostrati = $state<URLSearchParams | null>(null);
  let placeLabel = $state<string | null>(null);
  let loading = $state(false);
  let errorMessage = $state<string | null>(null);
  const evidenza = new Evidenza();
  let disegno = $state<SVGSVGElement | null>(null);
  let aperto = $state(true);

  const parametri = $derived(
    location && house !== null && moment.date !== ''
      ? horaryParameters(moment, location, house, derivata ? derivedFrom : null)
      : null,
  );

  /* L'ora è obbligatoria, a differenza del cielo: senza non ci sono case, e
     senza case non c'è la casa del quesito. */
  const mancanti = $derived([
    ...(moment.date === '' ? ['il giorno'] : []),
    ...(moment.time === '' ? ["l'ora"] : []),
    ...(location === null ? ['il luogo'] : []),
    ...(house === null ? ['la casa del quesito'] : []),
  ]);

  /**
   * Istante, luogo e casa possono arrivare nell'indirizzo; la domanda no.
   * Con un indirizzo completo la figura si calcola da sola: è un segnalibro.
   */
  async function dallIndirizzo(p: Pick<URLSearchParams, 'get'>): Promise<boolean> {
    const date = p.get('date');
    if (!date) return false;
    moment = { date, time: p.get('time') ?? '', timezone: p.get('timezone') || nowMoment().timezone };
    const casa = Number(p.get('house'));
    house = Number.isInteger(casa) && casa >= 1 && casa <= 12 ? casa : null;
    const da = Number(p.get('derivedFrom'));
    derivata = Number.isInteger(da) && da >= 1 && da <= 12;
    if (derivata) derivedFrom = da;
    const id = Number(p.get('locationId'));
    if (Number.isInteger(id) && id > 0) location = await fetchLocation(id);
    return true;
  }

  onMount(() => {
    void (async () => {
      if ((await dallIndirizzo(page.url.searchParams)) && mancanti.length === 0) {
        if (await load()) aperto = false;
      }
    })();
  });

  let ultima = 0;

  async function load(): Promise<boolean> {
    if (!parametri || mancanti.length > 0) return false;
    const richiesta = ++ultima;
    loading = true;
    errorMessage = null;
    try {
      const body = await fetchHorary(parametri);
      if (richiesta !== ultima) return false;
      horary = body.horary;
      mostrati = parametri;
      placeLabel = body.place?.label ?? null;
      void goto(`?${parametri}`, { shallow: true, replace: true });
      return true;
    } catch (cause) {
      if (richiesta !== ultima) return false;
      errorMessage = cause instanceof RequestError ? cause.message : 'Calcolo della figura non riuscito.';
      horary = null;
      return false;
    } finally {
      if (richiesta === ultima) loading = false;
    }
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (await load()) aperto = false;
  }

  function condizioni(h: HoraryLilly): string {
    const ut = h.chart.time.utc.replace('T', ' ').replace('Z', '');
    const casa = h.question.derivedFrom
      ? `casa ${h.question.house} dalla ${h.question.derivedFrom}, cioè la ${h.question.effectiveHouse}`
      : `casa ${h.question.effectiveHouse}`;
    return (
      `${casa} · ${h.chart.input.date} ${h.chart.input.time ?? ''} · ${h.chart.input.timezone} · UT ${ut}` +
      ` · Regiomontano · effemeridi ${h.chart.ephemerisMode}`
    );
  }

  function selectLocation(chosen: Location | null): void {
    location = chosen;
  }
</script>

<Meta
  titolo="Oraria"
  descrizione="Il tema di una domanda, secondo William Lilly: significatori, modi della perfezione e degli impedimenti con la pagina del libro."
/>

<h1 class="nascosto">Astrologia oraria</h1>

<div class="cappello">
  <p>
    Il tema dell'istante in cui una domanda viene posta, eretto e analizzato col metodo di
    William Lilly, <em>Christian Astrology</em> (1647): i significatori, i modi in cui la
    cosa chiesta si compirebbe e quelli che la impediscono, ciascuno con la pagina del
    libro, le considerazioni prima del giudizio.
  </p>
  <p>
    La figura non dice se la cosa avverrà: il giudizio è di chi legge.
    <a href="/metodo#lilly">Come è calcolato</a>.
  </p>
</div>

<ModuloPieghevole
  bind:aperto
  etichetta="Domanda, luogo e casa"
  chiudibile={horary !== null}
  onsubmit={submit}
>
  {#snippet striscia()}
    <MomentFields bind:value={moment} id="oraria" what="Quando è posta la domanda" compact={!aperto} />
  {/snippet}

  {#snippet dettagli()}
    <div class="campi">
      <div class="domanda">
        <label for="oraria-domanda">La domanda (facoltativa)</label>
        <textarea
          id="oraria-domanda"
          bind:value={domanda}
          rows="2"
          placeholder="Per esempio: otterrò il lavoro per cui ho fatto il colloquio?"
        ></textarea>
        <p class="suggerimento">
          Resta in questa pagina: serve solo al prompt per un'AI, e non va al server.
        </p>
      </div>

      <LocationSearch
        selected={location}
        onselect={selectLocation}
        label="Dove si trova chi chiede"
        id="oraria-luogo"
      />
    </div>

    <div class="fascia">
      <fieldset class="senza-cornice case">
        <legend class="titolo-fascia">La casa del quesito</legend>
        <p class="suggerimento">
          La sceglie chi chiede, dalla domanda, come la sceglieva Lilly: il motore non la
          indovina. Che cosa significa ciascuna, secondo Lilly (libro I, cap. VII, pp. 50-56):
        </p>
        <ul>
          {#each CASE_LILLY as casa (casa.numero)}
            <li>
              <label class="interruttore">
                <input type="radio" name="casa" value={casa.numero} bind:group={house} />
                <strong>{casa.numero}</strong>
                <span>{casa.temi}</span>
                <span class="tenue">p. {casa.pagina}</span>
              </label>
            </li>
          {/each}
        </ul>
        <label class="interruttore">
          <input type="checkbox" bind:checked={derivata} />
          <span>Contata da un'altra casa, per le persone della persona</span>
        </label>
        {#if derivata}
          <div class="derivata">
            <label class="interruttore" for="oraria-derivata">contata dalla casa</label>
            <select id="oraria-derivata" bind:value={derivedFrom}>
              {#each CASE_LILLY as casa (casa.numero)}
                <option value={casa.numero}>{casa.numero}</option>
              {/each}
            </select>
            <p class="suggerimento">Il partner di un fratello è la 7 contata dalla 3, cioè la 9.</p>
          </div>
        {/if}
      </fieldset>
    </div>

    <button
      type="submit"
      class="invia"
      disabled={mancanti.length > 0 || loading}
      aria-describedby={mancanti.length > 0 ? 'mancanti-oraria' : undefined}
    >
      {loading ? 'Calcolo…' : 'Erigi la figura'}
    </button>
    <CampiMancanti campi={mancanti} id="mancanti-oraria" />
  {/snippet}
</ModuloPieghevole>

{#if errorMessage}
  <p class="errore" role="alert">{errorMessage}</p>
{/if}

{#if horary}
  <Risultato
    titolo={placeLabel ?? 'Tema orario'}
    meta={condizioni(horary)}
    avvertenze={[...horary.warnings, ...horary.chart.warnings]}
  >
    <div class="griglia">
      <div class="ruota">
        <ChartWheel
          chart={horary.chart}
          {evidenza}
          label="Ruota del tema orario con le posizioni planetarie e i loro aspetti"
          bind:elemento={disegno}
        />
        <LegendaElementi />
        <StrumentiDisegno svg={disegno} {evidenza} nome={['oraria', placeLabel, horary.chart.input.date]} />
        <p class="suggerimento istruzione">
          Scegli un corpo, qui o nelle tabelle, per isolarne gli aspetti.
        </p>
      </div>

      <div class="tabelle">
        {#if mostrati}
          {@const p = mostrati}
          <StrumentiLettura tavola={() => fetchHoraryCompact(p)} {domanda} />
        {/if}

        <HorarySignificatorTable
          significators={horary.significators}
          sameSignificator={horary.sameSignificator}
          {evidenza}
        />

        <HoraryFindingTable
          titolo="Perfezione"
          findings={horary.perfections}
          vuoto={horary.sameSignificator
            ? 'Un significatore solo: i modi della perfezione fra due pianeti non si cercano.'
            : 'Nessuno dei modi di pp. 125-126 prima che i significatori cambino segno.'}
        />

        <HoraryFindingTable
          titolo="Impedimenti"
          findings={horary.impediments}
          vuoto="Nessuno prima che i significatori cambino segno."
        />

        <HoraryConsiderationList considerations={horary.considerations} />

        <BodyTable bodies={horary.chart.bodies} {evidenza} />

        {#if horary.chart.angles}
          <AngleTable angles={horary.chart.angles} houses={horary.chart.houses} />
        {/if}

        <AspectTable aspects={horary.chart.aspects} {evidenza} orbite={horary.chart.orbConvention} />

        {#if horary.chart.dignities}
          <DignityTable
            dignities={horary.chart.dignities}
            houses={horary.chart.houses}
            sect={horary.chart.sect}
            {evidenza}
          />
        {/if}
        {#if horary.chart.dignities?.lilly}
          <LillyConditionsTable conditions={horary.chart.dignities.lilly.conditions} {evidenza} />
        {/if}

        {#each horary.courses as course (course.body)}
          <SignCourseTable {course} />
        {/each}

        <section>
          <h3 class="titolo-sezione">Fonte e letture</h3>
          <p class="fonti">{horary.source}</p>
          {#each horary.readings as reading, i (i)}
            <p class="fonti">{reading}</p>
          {/each}
        </section>
      </div>
    </div>
  </Risultato>
{/if}

<style>
  .fonti {
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--testo-tenue);
  }

  .domanda {
    display: grid;
    gap: 0.3rem;
  }

  .domanda textarea {
    resize: vertical;
  }

  .domanda p {
    margin: 0;
  }

  .case ul {
    list-style: none;
    margin: 0.5rem 0;
    padding: 0;
    display: grid;
    gap: 0.25rem;
  }

  /* Le voci sono l'opzione stessa, e si leggono: `interruttore` toglie il
     maiuscolo delle etichette di campo, e la griglia allinea numero, temi e
     pagina in colonna. */
  .case li label {
    display: grid;
    grid-template-columns: auto 1.75rem 1fr auto;
    align-items: baseline;
    margin-top: 0;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .derivata {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: baseline;
    margin-top: 0.4rem;
  }

  .derivata label {
    margin-top: 0;
  }

  .derivata select {
    width: auto;
  }

  .derivata p {
    margin: 0;
  }
</style>
