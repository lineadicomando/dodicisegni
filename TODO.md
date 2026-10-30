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

Al 30 ottobre 2026, versione **0.14.0**. È aperta una voce sola, e non
aspetta un testo:

| Voce | Priorità | Taglia | Prima di cominciare |
|---|---|---|---|
| 28. La revisione della SEO | media | piccola | resta il redirect, da fare nel pannello di Cloudflare: lo fa il proprietario |

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
nella sitemap) non si riaprono qui. Restano due cose trovate controllando il
sito pubblicato il 30 ottobre 2026, tutte fuori dal repo:

- **Quattro siti invece di uno, metà fatta.** I nomi sono quattro:
  `dodicisegni.it`, `www.dodicisegni.it`, `12segni.it` e `www.12segni.it`;
  il principale è `https://dodicisegni.it` (vedi `docs/decisioni.md`).
  - **Fatto il 30 ottobre 2026**: sul server mancava il `.env`, e `ORIGIN`
    arrivava vuoto alla build. Ora `/srv/dodicisegni/.env` contiene
    `ORIGIN=https://dodicisegni.it` (git lo ignora, il deploy non lo tocca),
    l'immagine è stata rifatta, e su tutti e quattro i nomi canonico e
    `og:url` dicono `https://dodicisegni.it`; la sitemap elenca solo quel
    dominio. Come arriva `ORIGIN`: `paths.origin` in `apps/web/vite.config.ts`
    lo scrive nel server compilato (`compose.yaml:16`, `Dockerfile:61`), e
    all'avvio non lo legge più nessuno.
  - **Resta il redirect**, che non sta né nel repo né sul server: tutti e
    quattro i nomi rispondono ancora 200. Va un redirect permanente (301 o
    308) dagli altri tre nomi a `https://dodicisegni.it`, **con percorso e
    query** (i temi condivisi sono indirizzi con la nascita dentro,
    `/?date=…&locationId=…`) e **in un salto solo** anche da `http://`. Il
    posto è Cloudflare, che sta davanti al container e oggi risponde 308 da
    `http://` a `https://` sullo stesso nome; non l'applicazione, che gira
    uguale in Electron e su localhost. In Cloudflare sono *Redirect Rules*
    (*Single Redirects*), una per zona: nella zona `12segni.it` per
    `12segni.it` e `www.12segni.it`, nella zona `dodicisegni.it` per
    `www.dodicisegni.it`; destinazione dinamica `concat("https://dodicisegni.it",
    http.request.uri.path)`, codice 301, *Preserve query string* acceso.
    Sulla zona `12segni.it`, che non serve più niente in proprio, conviene
    spegnere *Always Use HTTPS*, perché il salto verso `https://` sullo stesso
    nome non venga prima.

  Verifica: `curl -sI 'https://www.12segni.it/transiti?x=1'`, e gli altri
  due nomi, anche in `http://`, danno 301 o 308 con `location:
  https://dodicisegni.it/transiti?x=1` al primo salto.
- **Gli strumenti dei motori**, cosa del proprietario e non del codice:
  registrare il dominio principale in Google Search Console e in Bing
  Webmaster Tools, solo `https://dodicisegni.it` e dopo i redirect, dare loro
  la sitemap, e dopo qualche settimana leggere
  quali pagine risultano escluse e perché. Solo allora si sa se c'è altro da
  fare; prima, ogni ritocco ulteriore è un'ipotesi.
