# 28. La revisione della SEO

**Priorità media.** Nel repo la SEO è fatta, e ogni scelta ha il suo perché
nel commento accanto: `<Meta>` (`apps/web/src/lib/components/Meta.svelte`)
su tutte le diciassette pagine, sitemap e `robots.txt` in
`apps/web/src/lib/seo.ts`, con le prove in `seo.test.ts` (titoli sotto i
sessanta caratteri, descrizioni sotto `DESCRIZIONE_MASSIMA`, ogni pagina di
`(informativa)` nella sitemap, `/api` chiuso). Quelle scelte (niente
`lastmod` né `priority`, niente marcature da risultati ricchi, i temi mai
nella sitemap) non si riaprono qui. I quattro nomi di dominio, che il 30
ottobre 2026 rispondevano ciascuno come sito a sé, ora sono uno: `ORIGIN` nel `.env` del server e i
redirect di Cloudflare (come, in `docs/storia.md`, *Le sessioni*). Resta una
cosa, fuori dal repo:

- **Gli strumenti dei motori**, cosa del proprietario e non del codice.
  Il 30 ottobre 2026 `https://dodicisegni.it` è registrato in Google Search
  Console e in Bing Webmaster Tools, con la sitemap
  (`https://dodicisegni.it/sitemap.xml`, che anche `robots.txt` indica).
  Resta da leggere, **non prima di metà novembre 2026**, quali pagine
  risultano escluse e perché. Solo allora si sa se c'è altro da fare; prima,
  ogni ritocco ulteriore è un'ipotesi. Se non c'è niente da correggere, la
  voce si chiude.
