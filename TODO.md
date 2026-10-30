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
versione 0.13.0. Le righe si spostano: se una non torna, fa fede il nome
della funzione o della costante accanto.

## Dove siamo

Al 30 ottobre 2026, versione **0.13.0**. Sono aperte due voci, e nessuna
aspetta un testo:

| Voce | Priorità | Taglia | Prima di cominciare |
|---|---|---|---|
| 30. «Mobile» vuol dire due cose: la terza modalità diventa «mutevole» | media | media | chiesta dal proprietario; il piano è nella voce, file per file, e cambia un campo delle risposte |
| 28. La revisione della SEO | media | piccola | si fa sul server e non nel repo, e solo quando il proprietario chiede push e deploy |

La 30 si può fare subito, in un commit solo. La 28 è la sola che tocca chi
usa il sito oggi: i quattro nomi di dominio rispondono ciascuno come sito a
sé.

**Non pubblicato.** `origin` è fermo a `v0.5.2`: tutti i commit dopo, coi
tag annotati da `v0.6.0` a `v0.13.0`, sono solo locali. Il push lo chiede il
proprietario; si fa con `git push --follow-tags origin main`, poi il deploy
(come, in `CLAUDE.local.md`). `git status -sb` dice quanto manca.

## 30. «Mobile» vuol dire due cose: la terza modalità diventa «mutevole»

**Priorità media.** Aperta il 30 ottobre 2026, dopo la revisione dei testi.
Il motore chiama le tre modalità `cardinale`, `fisso`, `mobile`, con
`mobile` per Gemelli, Vergine, Sagittario e Pesci. È l'uso della
divulgazione italiana di oggi (Wikipedia, voce «Segni mobili»), ma la
tradizione dice il contrario: per il greco (τροπικά, στερεά, δίσωμα), il
latino (*mobilia, fixa, communia*), Lilly («Moveable, Fixed and Common, ♈ ♋
♎ ♑ are called moveable and Cardinall», p. 88, letto sull'immagine) e
l'astrologia tradizionale italiana (*Cielo e Terra*, la scuola di Bezza:
«I segni tropici o mobili (oggi detti "cardinali")», e i bicorporei
«oggi detti "mobili" con rischio di grave confusione») i **mobili sono i
cardinali**, e il terzo gruppo è dei **comuni** o **bicorporei**. Anche il
sanscrito: *cara*, «mobile», sono i cardinali. Le fonti sono in
`texts/occidentale/modalita-nomi-italiani-2026`.

In un sito che porta le scuole tradizionali la parola è un equivoco, e già
oggi il repo la usa nei due sensi: `arudha-graha.ts:40` scrive «0 mobile
(cara)», cioè cardinale, mentre `arudha.ts:55` traduce *cara-sthira-dvandva*
con «cardinale, fisso, mobile», e `varga.ts` dice «mobile» per il doppio. E
c'è un effetto sulle letture: `packages/lettura/src/oraria.ts:108` dice al
modello, con Lilly, che «nei segni mobili e angolari il tempo è breve», dove
mobili vuol dire cardinali, mentre la tabella che lo stesso modello legge
chiama `mobile` i mutevoli.

**La correzione** (chiesta dal proprietario il 30 ottobre 2026, da fare in
un commit solo, perché cambia un valore che le risposte portano):

1. Il valore: `Modality` diventa `'cardinale' | 'fisso' | 'mutevole'` in
   `packages/core/src/types.ts:1800` e `packages/ruota/src/types.ts:81`
   (`ruota/test/tipi.test.ts` verifica che combacino); poi
   `SIGN_MODALITY` in `core/src/constants.ts:60-63` e
   `ruota/src/glyphs.ts:202-205`, `MODALITY_ORDER` in `glyphs.ts:212`, la
   distribuzione vuota in `core/src/distribution.ts:46`, l'elenco di
   `core/src/format.ts:714`. Il campo `distribution.*.modalities.mobile`
   delle risposte diventa `.mutevole`: è il motivo della seconda cifra.
   «Mutevole» e non «comune»: è la parola che la divulgazione usa accanto a
   «mobile», e non dice niente di diverso a chi conosce la tradizione.
2. I test: `core/test/distribution.test.ts:118, 127-131, 146, 167` e il
   fascicolo canonico (`tema.json`, `cielo.json`), da riscrivere con `-u`.
3. Le parole del Jyotisha, dove il nome traduce il sanscrito: in
   `varga.ts` (commenti alle righe 27, 33, 197, 206, 235, 251, 282 e le
   `rule` di D-9, D-16, D-20, D-45), in `arudha.ts:55` e `:101` e in
   `arudha-graha.ts:40, 44-45, 168, 242`, il terzo gruppo è «doppio» o
   «mutevole» (*dvisvabhāva*, *dvandva*) e il primo «cardinale» (*cara*,
   «mobile» nei testi): una sola convenzione per tutti e tre i file, scritta
   in testa a `varga.ts`. Le `rule` dei varga cambiano testo: stanno nel
   fascicolo `vedico.json`. La tavola di `/metodo/varga` le ripete (righe
   58-67, e la prosa a riga 79): `metodo/jyotisha.test.ts` non le confronta,
   vanno corrette a mano. I commenti dei test di `varga.test.ts` (righe
   124-142, 209, 236, 240, 413) pure.
4. Le superfici di prosa: il glossario (`glossario/tema`, «cardinale,
   fissa e mobile», riga 140) dice «mutevole», e aggiunge in mezza riga che
   nei testi antichi «mobili» sono i cardinali e il terzo gruppo si chiama
   «comune» o «bicorporeo»; `packages/lettura/src/oraria.ts:108` scrive
   «nei segni cardinali (i "mobili" di Lilly)»; la tabella della
   distribuzione nell'interfaccia (`DistributionTable.svelte`) prende le
   etichette da `MODALITY_ORDER`, e va controllata a occhio; le descrizioni
   MCP e i documenti di lettura non nominano la modalità (verificare con
   `grep -w mobile`). Restano «mobili» dove non sono modalità: i karana
   mobili del panchanga (`panchanga.ts`, *cara karana*), i beni mobili delle
   case dell'oraria, il quadro del nord dove «i segni sono mobili».
5. La regola, perché non torni: in `CLAUDE.md`, *Stile*, una riga accanto
   a quella sul genere di dasha («la terza modalità è mutevole; nei testi
   tradizionali "mobile" vuol dire cardinale»), e una voce in `docs/decisioni.md`.
6. Versione: seconda cifra, per il campo rinominato.

Verifica: `grep -rnw mobile packages apps` non trova più la modalità; il
fascicolo canonico cambia solo dove deve; `npm test`, `typecheck`, `lint`.

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
