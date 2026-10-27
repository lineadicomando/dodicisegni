<!--
  Le dignità occidentali di un tema: signori dei segni, dignità dei corpi,
  ricezioni e, se chiesta, la tavola di Lilly.

  Prende le dignità e le case, non il tema: è la regola delle altre tabelle, e
  le dignità hanno già tutto ciò che serve, nomi compresi.

  Ogni blocco porta la sua fonte. Non è una nota a piè di pagina: le scuole
  divergono, e una dignità senza la convenzione che l'ha assegnata non si può
  ricontrollare. Per la stessa ragione i domicili stanno in due colonne che non
  si fondono, e la tabella non dice mai che cosa una dignità significhi.
-->
<script lang="ts">
  import type {
    BodyId,
    DomicileScheme,
    House,
    ReceptionDignity,
    Sect,
    WesternDignities,
  } from '@dodicisegni/core';
  import type { Evidenza } from '#lib/evidenza.svelte.js';
  import { BODY_GLYPH, BODY_LABEL, SIGN_GLYPH, SIGN_LABEL, ZODIAC_ORDER } from '@dodicisegni/ruota';

  interface Props {
    dignities: WesternDignities;
    /** Le cuspidi, per dire quali case governa ciascun signore. Vuote senza ora. */
    houses?: House[];
    /** La setta del tema, da cui dipende la triplicità di Lilly. Assente senza ora. */
    sect?: Sect | undefined;
    /** Il corpo isolato, condiviso con la ruota e con gli aspetti. */
    evidenza?: Evidenza;
  }

  let { dignities, houses = [], sect = undefined, evidenza }: Props = $props();

  const SCHEMI: readonly DomicileScheme[] = ['tradizionale', 'moderno'];

  /** Gli identificatori sono senza accento; la pagina no. */
  function voce(dignita: string): string {
    return dignita === 'triplicita' ? 'triplicità' : dignita;
  }

  function nome(id: BodyId | undefined): string {
    return id ? BODY_LABEL[id] : '—';
  }

  function per(by: readonly ReceptionDignity[]): string {
    return by.map(voce).join(', ');
  }

  /** La regola delle case, la più comune: il signore del segno della cuspide. */
  function caseDi(sign: string): string {
    return houses.filter((house) => house.sign === sign).map((house) => house.number).join(' ');
  }

  const conCase = $derived(houses.length > 0);
  const lilly = $derived(dignities.lilly);
</script>

<section>
  <h3 class="titolo-sezione">Dignità</h3>

  <table>
    <thead>
      <tr>
        <th></th>
        <th>Corpo</th>
        <th>Tradizionale</th>
        <th>Moderna</th>
      </tr>
    </thead>
    <tbody>
      {#each dignities.bodies as body (body.id)}
        <tr
          onmouseenter={() => evidenza?.sorvola(body.id)}
          onmouseleave={() => evidenza?.sorvola(null)}
          class:evidenziato={evidenza?.attivo === body.id}
        >
          <td class="glifo">{BODY_GLYPH[body.id]}</td>
          <td>{body.name}</td>
          {#each SCHEMI as schema (schema)}
            <td class:tenue={body.dignities[schema].length === 0}>
              {body.dignities[schema].join(', ') || '—'}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <ul class="fonti">
    <li>Domicili tradizionali: {dignities.sources.domicili.tradizionale}</li>
    <li>Domicili moderni: {dignities.sources.domicili.moderno}</li>
    <li>Esilio: {dignities.sources.esilio}</li>
    <li>Esaltazione e caduta, solo tradizionali: {dignities.sources.esaltazione}</li>
  </ul>

  <!-- Una riga per segno e non per corpo: è il segno ad avere un signore, e
       «chi governa la decima» si legge dalla cuspide anche dove non c'è
       nessuno. Chiuso all'inizio, perché sono dodici righe che servono a chi
       le cerca. -->
  <details>
    <summary>Signori dei segni{conCase ? ' e delle case' : ''}</summary>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Segno</th>
          <th>Tradizionale</th>
          <th>Moderno</th>
          {#if conCase}<th class="numerico">Case</th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each ZODIAC_ORDER as sign (sign)}
          {@const signori = dignities.signLords[sign]}
          <tr>
            <td class="glifo">{SIGN_GLYPH[sign]}</td>
            <td>{SIGN_LABEL[sign]}</td>
            <td>{nome(signori.tradizionale)}</td>
            <td class:diverso={signori.moderno !== signori.tradizionale}>{nome(signori.moderno)}</td>
            {#if conCase}<td class="numerico">{caseDi(sign) || '—'}</td>{/if}
          </tr>
        {/each}
      </tbody>
    </table>
    {#if conCase}
      <p class="fonti">Case: ciascuna al signore del segno della sua cuspide.</p>
    {/if}
  </details>

  {#if lilly}
    <h4>Secondo Lilly</h4>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Corpo</th>
          <th>Domicilio</th>
          <th>Esaltaz.</th>
          <th>Triplicità</th>
          <th>Termine</th>
          <th>Faccia</th>
          <th>Dignità del corpo</th>
        </tr>
      </thead>
      <tbody>
        {#each lilly.bodies as body (body.id)}
          <tr
            onmouseenter={() => evidenza?.sorvola(body.id)}
            onmouseleave={() => evidenza?.sorvola(null)}
            class:evidenziato={evidenza?.attivo === body.id}
          >
            <td class="glifo">{BODY_GLYPH[body.id]}</td>
            <td>{body.name}</td>
            <td>{nome(body.rulers.domicilio)}</td>
            <td>{nome(body.rulers.esaltazione)}</td>
            <td>{nome(body.rulers.triplicita)}</td>
            <td>{nome(body.rulers.termine)}</td>
            <td>{nome(body.rulers.faccia)}</td>
            <td class:tenue={body.dignities.length === 0}>
              {body.dignities.map(voce).join(', ') || '—'}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <p class="fonti">
      {lilly.source} Le colonne dicono chi governa il grado in cui sta ciascun corpo.
      {#if sect}
        Triplicità col reggente {sect === 'diurna' ? 'diurno' : 'notturno'}, dalla setta del tema.
      {:else}
        Senza l'ora la setta manca, e la triplicità c'è solo nell'acqua, dove il reggente è
        lo stesso di giorno e di notte.
      {/if}
    </p>
  {/if}

  <h4>Ricezioni</h4>
  {#if dignities.receptions.single.length === 0}
    <p class="tenue">Nessuna.</p>
  {:else}
    <ul class="ricezioni">
      {#each dignities.receptions.mutual as m (m.bodies.join())}
        <li>
          <strong>Mutua</strong>: {nome(m.bodies[0])} e {nome(m.bodies[1])}
          <span class="tenue">({per(m.firstReceives)} / {per(m.secondReceives)})</span>
        </li>
      {/each}
      {#each dignities.receptions.single as r (`${r.receiver}-${r.received}`)}
        <li>
          {nome(r.receiver)} riceve {nome(r.received)}
          <span class="tenue">({per(r.by)})</span>
        </li>
      {/each}
    </ul>
  {/if}
  <p class="fonti">
    {dignities.receptions.source} Contate per: {per(dignities.receptions.counted)}.
  </p>
</section>

<style>
  h4 {
    margin: 1.25rem 0 0.5rem;
    font-size: 0.95rem;
  }

  details {
    margin-top: 0.75rem;
  }

  summary {
    cursor: pointer;
  }

  /* Le fonti sono il dato che rende il resto ricontrollabile: stanno sotto la
     tabella che giustificano, in piccolo, ma in un colore che si legge. */
  .fonti {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--testo-tenue);
  }

  .ricezioni {
    padding-left: 1.1rem;
    margin: 0;
  }

  /* I tre segni in cui le due colonne divergono: il punto dove chi legge deve
     scegliere, e dirlo. */
  .diverso {
    font-style: italic;
  }

  .tenue {
    color: var(--testo-tenue);
  }
</style>
