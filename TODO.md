# TODO

Il lavoro aperto, con quello che serve per riprenderlo: per ogni voce il
file, la riga e il modo di verificarla. I numeri delle voci sono stabili e
non si riusano; una voce chiusa esce di qui (vedi `docs/storia.md`).

Prima di cominciare:

- `npm test`, `npm run typecheck` e `npm run lint` verdi;
- `docs/lavorare.md`: gli inciampi noti (build di `core` e `lettura`,
  fascicolo canonico, cache di `/api/jyotish`, CLI) e il metodo per le fonti;
- `docs/decisioni.md` prima di proporre una scelta di dottrina: molte sono
  già prese;
- `docs/esaminato.md` prima di cercare una fonte o una variante: forse è già
  stata cercata.

I riferimenti `file:riga` sono stati ricontrollati il 30 ottobre 2026 sulla
versione 0.14.0. Le righe si spostano: se una non torna, fa fede il nome
della funzione o della costante accanto.

## Dove siamo

Al 30 ottobre 2026, versione **0.14.0**. È aperta una voce sola, che
aspetta i motori di ricerca:

| Voce | Priorità | Taglia | Prima di cominciare |
|---|---|---|---|
| 28. La revisione della SEO | media | piccola | aspetta i dati dei motori: da rileggere non prima di metà novembre 2026 |

Dal 30 ottobre 2026 il sito pubblicato è allineato al repo: `origin` e il
server sono alla `v0.14.0`. `git status -sb` dice se c'è altro da pubblicare;
il push lo chiede il proprietario, e il deploy si fa come in
`CLAUDE.local.md`.

## 28. La revisione della SEO

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
