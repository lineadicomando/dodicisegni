<!--
  La pagina di un indirizzo che non risponde.

  Senza questo file SvelteKit mette la sua: un «404» e un «Not Found» in
  inglese, dentro il menù ma senza `<title>`, così che la scheda del browser e
  la cronologia mostrano l'indirizzo nudo. Qui c'è un titolo, una riga in
  italiano e la strada per tornare dentro il sito.

  Niente `Meta`: la descrizione e il canonico servono a una pagina che si può
  indicizzare, e un canonico qui dichiarerebbe pagina un indirizzo che non
  esiste. Niente `noindex` nemmeno: lo stato 404, che SvelteKit manda comunque,
  basta già a tenerla fuori dagli indici.
-->
<script lang="ts">
  import { page } from '$app/state';
  import { SECTIONS } from '#lib/navigation.js';
  import { titoloCompleto } from '#lib/seo.js';

  const nonTrovata = $derived(page.status === 404);
  const titolo = $derived(nonTrovata ? 'Pagina non trovata' : 'Errore');
</script>

<svelte:head>
  <title>{titoloCompleto(titolo)}</title>
</svelte:head>

<div class="errore">
  <h1>{titolo}</h1>

  {#if nonTrovata}
    <p>
      A questo indirizzo non c'è nessuna pagina. Se ci sei arrivato da un
      collegamento, può essere stato copiato a metà.
    </p>
  {:else}
    <p>
      La pagina non si è potuta comporre (errore {page.status}). Riprova fra
      poco, o riparti da una delle sezioni.
    </p>
  {/if}

  <ul>
    {#each SECTIONS as section (section.href)}
      <li><a href={section.href}>{section.label}</a></li>
    {/each}
    <li><a href="/metodo">Metodo</a></li>
    <li><a href="/glossario">Glossario</a></li>
  </ul>
</div>

<style>
  /* La misura della colonna di prosa di `(informativa)`, che questa pagina
     non può prendere dal layout: l'errore si mostra dentro il layout della
     radice, qualunque sia l'indirizzo sbagliato. */
  .errore {
    max-width: 42rem;
  }

  h1 {
    font-family: var(--serif);
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    font-weight: 400;
    letter-spacing: -0.01em;
    margin: 0 0 0.8rem;
  }

  ul {
    padding-left: 1.2rem;
  }

  li {
    margin-bottom: 0.4rem;
  }
</style>
