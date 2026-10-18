import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/**
 * I pacchetti del monorepo sono collegati via symlink, quindi Vite li tratta
 * come sorgente da impacchettare e ne segue le importazioni fino ai moduli
 * nativi — `sweph` per il calcolo, `@resvg/resvg-js` per la rasterizzazione —
 * che sono binding N-API e non sono impacchettabili: Rollup ci si imbatte in
 * un file `.node` e prova a leggerlo come JavaScript.
 *
 * La soluzione è dichiararli esterni: `core`, `geo` e `ruota` sono già ESM
 * compilato, Node li carica direttamente a runtime. Da notare che NON si può
 * usare `build.rollupOptions.external`, perché sostituirebbe l'elenco di
 * esterni di SvelteKit — builtin di Node compresi.
 *
 * `@dodicisegni/ruota` è esterno anche se il *client* ne importa davvero
 * dei valori — glifi, colori, geometria. Non è una contraddizione: nel client
 * la regola non si applica, perché `ssr.external` riguarda il solo bundle del
 * server. Quello che il browser non deve mai vedere è `ruota/png`, e a
 * tenerlo fuori è il fatto che lo importi solo `lib/server`.
 */
export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter(),
      /*
       * `src/service-worker/index.ts` viene compilato ma non registrato da
       * qui: la registrazione ha due condizioni da rispettare — non in
       * sviluppo, e non dentro Electron — e sta in `routes/+layout.svelte`,
       * dove quelle condizioni si possono scrivere. Il perché della seconda è
       * là.
       */
      serviceWorker: { register: false },
      /*
       * L'indirizzo pubblico del sito, da cui escono il canonico e l'`og:url`
       * di ogni pagina. Si legge qui, cioè alla build: `adapter-node` lo
       * scrive nel server compilato, e all'avvio non lo cerca più
       * nell'ambiente. Senza, l'origine si ricava dagli header della
       * richiesta, con `https` come schema. Vedi «Prima di mettere in rete»
       * nel README. `||` e non `??`: una chiave vuota vale come assente.
       */
      paths: { origin: process.env['ORIGIN'] || undefined },
    }),
  ],
  ssr: {
    external: [
      'sweph',
      '@resvg/resvg-js',
      '@dodicisegni/core',
      '@dodicisegni/geo',
      '@dodicisegni/ruota',
    ],
  },
});
