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
| 28. La revisione della SEO | media | piccola | si fa sul server e non nel repo, e solo quando il proprietario chiede push e deploy |

È la sola che tocca chi usa il sito oggi: i quattro nomi di dominio
rispondono ciascuno come sito a sé.

**Non pubblicato.** `origin` è fermo a `v0.5.2`: tutti i commit dopo, coi
tag annotati da `v0.6.0` a `v0.14.0`, sono solo locali. Il push lo chiede il
proprietario; si fa con `git push --follow-tags origin main`, poi il deploy
(come, in `CLAUDE.local.md`). `git status -sb` dice quanto manca.

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

- **Quattro siti invece di uno.** I nomi sono quattro: `dodicisegni.it`,
  `www.dodicisegni.it`, `12segni.it` e `www.12segni.it`; il principale è
  `https://dodicisegni.it` (vedi `docs/decisioni.md`). Oggi tutti e quattro
  rispondono 200 con la stessa pagina, e ciascuno dichiara canonico **sé
  stesso**: `og:url`, `<link rel="canonical">` e gli indirizzi della sitemap
  seguono l'host della richiesta. È il caso che il README (*Prima di mettere
  in rete*, `ORIGIN`) descrive («un motore di ricerca vedrebbe due siti dove
  ce n'è uno»), e vuol dire che sul server `ORIGIN` alla build non arriva, o non
  vale. Il lavoro è tutto fuori dal repo, e sono due cose da fare insieme:
  1. `ORIGIN=https://dodicisegni.it` nel `.env` del server, che la build
     riceve da `compose.yaml:16` e dal `Dockerfile:61`, e poi l'immagine
     rifatta (il deploy la rifà; come si lancia, in `CLAUDE.local.md`).
     Basta da solo a sistemare canonici, `og:url` e sitemap;
  2. un redirect permanente (301 o 308) dagli altri tre nomi a
     `https://dodicisegni.it`, **in un salto solo** anche da `http://` e
     **con percorso e query**: i temi condivisi sono indirizzi con la
     nascita dentro (`/?date=…&locationId=…`), e un redirect che tiene solo
     il dominio rompe ogni collegamento già in giro. Il posto è il proxy
     davanti al container (oggi Cloudflare, dagli header delle risposte),
     non l'applicazione: lì `url.origin` vale `ORIGIN` qualunque sia l'host,
     e la stessa build gira in Electron e su localhost. Oggi `http://`
     risponde già 308 verso `https://` **sullo stesso nome**: la regola dei
     nomi secondari va messa prima di quella, o `http://www.12segni.it` fa
     due salti.

  Come arriva `ORIGIN`, verificato su SvelteKit 3.1 e adapter-node 6.0:
  `paths.origin` in `apps/web/vite.config.ts` (non c'è `svelte.config.js`)
  lo scrive in `build/adapter-node.js` alla build, e il server lo usa per
  ogni richiesta ignorando l'host; all'avvio non lo legge più nessuno, quindi
  metterlo solo nell'ambiente del container non basta.

  Verifica, dopo il deploy: `curl -s https://dodicisegni.it/metodo | grep
  canonical` dà `https://dodicisegni.it/metodo`; `curl -sI
  'https://www.12segni.it/transiti?x=1'` (e gli altri due nomi, anche in
  `http://`) dà un 301 o 308 con `location:
  https://dodicisegni.it/transiti?x=1`; `curl -s
  https://dodicisegni.it/sitemap.xml` elenca solo indirizzi di
  `dodicisegni.it`.
- **Gli strumenti dei motori**, cosa del proprietario e non del codice:
  registrare il dominio principale in Google Search Console e in Bing
  Webmaster Tools, solo `https://dodicisegni.it` e dopo i redirect, dare loro
  la sitemap, e dopo qualche settimana leggere
  quali pagine risultano escluse e perché. Solo allora si sa se c'è altro da
  fare; prima, ogni ritocco ulteriore è un'ipotesi.
