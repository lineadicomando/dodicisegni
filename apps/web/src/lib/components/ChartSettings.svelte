<script lang="ts">
  import type { AyanamsaId, HouseSystem, NatalOrbConvention, Zodiac } from '@dodicisegni/core';
  import { HOUSE_SYSTEMS } from '#lib/house-systems.js';
  import { DIGNITY_SCHOOLS, type DignitySchoolChoice } from '#lib/scuole-dignita.js';
  import { ORB_CONVENTIONS } from '#lib/orbite.js';
  import { AYANAMSAS, ZODIACS } from '#lib/zodiacs.js';

  interface Props {
    houseSystem: HouseSystem;
    minorAspects: boolean;
    /**
     * Lo zodiaco, se in questa pagina c'è da sceglierlo.
     *
     * Facoltativo, e l'assenza è la scelta: l'elezione resta tropicale — le
     * ore planetarie non hanno zodiaco, e il vuoto di corso siderale non è una
     * tecnica di nessuno — quindi lì il menù non compare invece di comparire
     * spento.
     */
    zodiac?: Zodiac;
    /** Mostrato solo accanto allo zodiaco siderale. */
    ayanamsa?: AyanamsaId;
    /**
     * La scuola delle dignità da aggiungere a quelle comuni, o nessuna (la
     * stringa vuota). Facoltativa come lo zodiaco: le dignità stanno solo nel
     * tema natale, e altrove il menù non compare. Nel siderale nemmeno,
     * perché le tavole sono tropicali.
     */
    dignitySchool?: DignitySchoolChoice;
    /**
     * La convenzione delle orbite degli aspetti. Facoltativa come lo zodiaco:
     * dove gli aspetti sono transiti la convenzione è quella di Hand, una
     * sola, e il menù non compare.
     */
    orbConvention?: NatalOrbConvention;
    /** Senza ora di nascita non ci sono case: il sistema non ha nulla da scegliere. */
    housesDisabled?: boolean;
    /**
     * L'identificatore del menù.
     *
     * La stessa pagina può mostrare queste opzioni due volte — dentro il
     * modulo e nella striscia che resta quando si chiude — e i dettagli
     * nascosti restano nel documento: due `id` uguali scollegherebbero
     * l'etichetta dal campo che nomina.
     */
    id?: string;
    /**
     * Che cosa fare quando un'opzione cambia.
     *
     * Senza, cambiarla aggiorna solo il modulo, e il risultato arriva quando
     * si preme «Calcola»: è il comportamento di chi sta ancora impostando.
     * Con, il cambiamento è la domanda stessa — è così che la striscia lascia
     * confrontare Placidus e Koch sullo stesso tema senza risalire la pagina.
     */
    onchange?: () => void;
    /**
     * La forma da striscia: i due controlli in riga, senza l'etichetta del menù.
     *
     * Le voci si nominano da sé, e nella striscia l'altezza è spazio tolto al
     * risultato che si sta guardando.
     */
    compact?: boolean;
  }

  let {
    houseSystem = $bindable(),
    minorAspects = $bindable(),
    zodiac = $bindable(),
    ayanamsa = $bindable(),
    dignitySchool = $bindable(),
    orbConvention = $bindable(),
    housesDisabled = false,
    id = 'case',
    onchange,
    compact = false,
  }: Props = $props();
</script>

<!-- Nel modulo le opzioni sono una fascia a sé, con i menù in riga: stavano
     nella quarta cella della griglia della nascita, impilati in una colonna
     stretta accanto a tre campi corti. Ogni menù ha il suo contenitore perché
     la griglia lo tratti come un campo solo; nella striscia i contenitori e la
     fascia spariscono (`display: contents`) e la riga resta quella di prima. -->
<fieldset class="senza-cornice convenzioni" class:compatto={compact}>
  <legend class="titolo-fascia" class:nascosto={compact}>Convenzioni</legend>

  <div class="campo">
    <!-- L'etichetta si nasconde alla vista, non alla lettura: senza, l'unica
         cosa che dice che cos'è questo menù sparirebbe anche per chi la pagina
         non la vede affatto. -->
    <label for={id} class:nascosto={compact}>Sistema di case</label>
    <select {id} bind:value={houseSystem} disabled={housesDisabled} onchange={() => onchange?.()}>
      {#each HOUSE_SYSTEMS as system (system.value)}
        <option value={system.value}>{system.label}</option>
      {/each}
    </select>
  </div>

  {#if zodiac !== undefined}
    <div class="campo">
      <label for="{id}-zodiaco" class:nascosto={compact}>Zodiaco</label>
      <select id="{id}-zodiaco" bind:value={zodiac} onchange={() => onchange?.()}>
        {#each ZODIACS as voce (voce.value)}
          <option value={voce.value}>{voce.label}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- L'ayanamsa compare solo dove serve. Nel tropicale non ce n'è uno, e un
       menù disattivato accanto a uno attivo si legge come una cosa che manca
       invece che come una che non esiste. -->
  {#if zodiac === 'siderale'}
    <div class="campo">
      <label for="{id}-ayanamsa" class:nascosto={compact}>Ayanamsa</label>
      <select id="{id}-ayanamsa" bind:value={ayanamsa} onchange={() => onchange?.()}>
        {#each AYANAMSAS as voce (voce.value)}
          <option value={voce.value}>{voce.label}</option>
        {/each}
      </select>
    </div>
  {/if}

  {#if orbConvention !== undefined}
    <div class="campo">
      <label for="{id}-orbite" class:nascosto={compact}>Orbite degli aspetti</label>
      <select id="{id}-orbite" bind:value={orbConvention} onchange={() => onchange?.()}>
        {#each ORB_CONVENTIONS as voce (voce.value)}
          <option value={voce.value}>{voce.label}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- Una scelta e non una casella: le scuole sono più d'una e non si
       sommano, e la voce vuota dice che senza scuola restano le dignità comuni. -->
  {#if dignitySchool !== undefined && zodiac !== 'siderale'}
    <div class="campo">
      <label for="{id}-dignita" class:nascosto={compact}>Scuola delle dignità</label>
      <select id="{id}-dignita" bind:value={dignitySchool} onchange={() => onchange?.()}>
        <option value="">Dignità comuni</option>
        {#each DIGNITY_SCHOOLS as voce (voce.value)}
          <option value={voce.value}>{voce.label}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- In fondo alla riga: è l'unica casella fra menù, e in mezzo spezzerebbe
       la fila dei campi della stessa altezza. -->
  <div class="campo casella">
    <label class="interruttore">
      <input type="checkbox" bind:checked={minorAspects} onchange={() => onchange?.()} />
      <span>Aspetti minori</span>
    </label>
  </div>
</fieldset>

<style>
  /* I menù dividono una riga come i campi della nascita, e vanno a capo da soli
     dove non ci stanno. `auto-fill` e non `auto-fit`: con due menù soli le
     colonne vuote restano, e un «Placidus» non si allarga a mezzo modulo. */
  .convenzioni {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: 1rem 1.25rem;
    align-items: start;
  }

  /* La casella non ha etichetta sopra: scende all'altezza dei menù accanto,
     invece di stare in alto a mezz'aria. */
  .casella {
    align-self: end;
    padding-bottom: 0.6rem;
  }

  /* Nella striscia i controlli dividono una riga con il pulsante dei dettagli:
     senza reclamare lo spazio libero si stringerebbero fino a mandare a capo il
     menù anche dove ci starebbe. I contenitori spariscono, e i controlli
     tornano figli diretti della riga. */
  .compatto {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    flex: 1 1 auto;
    min-width: 0;
  }

  .compatto .campo {
    display: contents;
  }

  /* I campi del modulo occupano tutta la riga; qui il menù prende la larghezza
     del nome più lungo e lascia il resto alla casella. */
  .compatto select {
    width: auto;
    padding: 0.3rem 0.5rem;
  }

  .compatto .interruttore {
    margin-top: 0;
  }
</style>
