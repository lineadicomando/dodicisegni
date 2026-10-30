# TODO

Lavoro aperto, con dentro quello che serve per riprenderlo senza rifare
l'indagine che l'ha trovato. Non è un elenco di idee: ogni voce è una cosa nota,
con il file, la riga e il modo di verificarla.

I numeri delle voci sono stabili, perché altrove, anche nei messaggi di commit,
le voci si citano così. Una voce chiusa esce dal file e il suo numero non si
riusa; quello che aveva da dire o è finito nel codice, nei commenti e nei test,
o sta in uno dei due elenchi in fondo. L'ultima versione che le contiene tutte,
chiuse comprese, è `cf5219a`, quando il file si chiamava ancora `ROADMAP.md`.
Le voci chiuse dopo, con il commit in cui si leggono ancora per intero:

| Voci | Commit |
|---|---|
| 20 | `3314553` |
| 21 e 22 | `819ce59` |
| 23 | `db332a6` |
| 11 | `e194d45` |
| 13 | `e532f2f` |
| 7 | `955977b` |
| 9 | `8a04cfb` |
| 18 | `2b8937d` |
| 6 | `8aa31a9` |
| 8 | `c4c4820` |
| 24 | `bd489c8` |
| 19 | `91ca295` |
| 27 | `f6026fa` |
| 17 | `cd6d0f2` |
| 29 | `62ae8f6` |
| 25 | `63b0755` |
| 5 | `a2e2207` |
| 26 | `6a4898d` |

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

**Che cosa è successo nell'ultima sessione**, il 30 ottobre 2026, per chi
riprende: chiuse le voci 5, 25 e 26 (le rifiniture del Jyotisha e delle
scuole occidentali), dalla 0.6.0 alla 0.12.0, ciascuna scelta in *Deciso*;
rivista la prosa del sito con la skill di scrittura italiana anti pattern AI
(`750708f`, vedi *Deciso*); messe al femminile dasha, mahadasha e antardasha
(0.13.0); aperta la voce 30.

## Come si lavora qui

Le fonti citate stanno in copia locale in `texts/`, fuori dal repo: la
cartella, le schede `FONTE.md` e l'elenco `texts/INDICE.md` si mantengono come
dice `CLAUDE.md` (*Le fonti testuali*). In una sessione nuova `texts/` può non
esserci, se il clone è un altro: le schede dicono da dove riscaricare ogni
fonte. Alcune non si riscaricano: le pagine dell'ed. Pingree di Valente
(`texts/occidentale/valente-anthologiae-pingree-1986`) le ha fotografate il
proprietario, e su archive.org quel libro non si presta.

I riferimenti `file:riga`, i nomi, le cartelle di `texts/` e i commit citati
qui sono stati ricontrollati tutti contro il codice il 30 ottobre 2026 una
terza volta, sulla versione 0.13.0. Le righe si spostano: se una non torna,
il nome della funzione o della costante accanto è quello che fa fede.

Prima di cominciare conviene che `npm test`, `npm run typecheck` e `npm run
lint` siano verdi. Le cose che fanno perdere tempo:

- se il typecheck di `apps/web` cade su `config.kit.paths.origin`,
  `node_modules` è indietro rispetto al lockfile e serve un `npm install`;
- `apps/web` e `packages/mcp` vedono `core` e `lettura` compilati, non i
  sorgenti: dopo un export nuovo di `core` serve `npm run build -w
  @dodicisegni/core`, dopo una modifica a un documento di lettura `npm run
  build -w @dodicisegni/lettura`, e il server di sviluppo di Vite va
  riavviato, o risponde 500 dicendo che l'export non c'è;
- il fascicolo canonico (`packages/core/test/canonico.test.ts`) cade quando
  una risposta del motore cambia, ed è il suo mestiere: se il cambiamento è
  voluto si guarda il diff, si riscrivono i file con `npx vitest run
  test/canonico.test.ts -u` dentro `packages/core`, e la versione muove la
  seconda cifra (`CLAUDE.md`, *La versione*), anche quando a cambiare è solo
  il testo di un'avvertenza o di una fonte. È calcolato con Moshier e senza
  stelle fisse, apposta;
- i test che leggono le stelle fisse vogliono `packages/core/ephe/sefstars.txt`,
  che `npm run ephe:download -w @dodicisegni/core` scarica (133 KB); senza,
  vengono saltati e non falliscono;
- `/api/jyotish` si fa memorizzare dal browser per un giorno
  (`private, max-age=86400`): provando la pagina `/vedica` dopo aver
  cambiato il motore, il browser può mostrare la risposta vecchia, e il
  browser di prova di Chrome DevTools la conserva fra una sessione e
  l'altra. Basta cambiare di un minuto l'ora nell'indirizzo. Per la stessa
  ragione i componenti di `/vedica` mettono una guardia sui campi nuovi
  (`{#if jyotisha.arudhas}`) anche dove il tipo li dà per presenti;
- la pagina `/vedica` legge il luogo solo da `locationId`
  (`/vedica?date=1968-03-12&time=14:30&locationId=3172394` è Napoli): con
  `latitude` e `longitude` mostra il modulo vuoto, mentre `/api/jyotish` li
  accetta tutti e due;
- `computeJyotisha` non è una funzione della sola carta: per l'alba delle
  avastha (`stati.ts`) chiama `initEphemeris` e `lastSunrise` di
  `panchanga.ts`, con `JyotishaOptions.ephemerisPath` se c'è. Resta
  sincrona, e l'alba non usa i flag siderali;
- la CLI vuole le opzioni lunghe per tutto: `--date`, `--time`, `--lat`,
  `--lon`, `--tz`. La tabella compatta del Jyotisha si vede con `--zodiaco
  siderale --lettura --sistema jyotisha` (i varga, con `--varga`, si
  stampano senza `--lettura`), le dignità di una scuola con `--dignita
  <scuola>` e una nascita con l'ora, perché ci sia la setta.

Per spegnere il server di sviluppo lanciato in sottofondo si usa la porta
(`fuser -k 5173/tcp`), non `pkill -f` col numero della porta: il comando
contiene lo stesso numero e chiude anche la shell che lo lancia. E prima di
provare il server compilato (`npm start -w @dodicisegni/web`) va rifatto
`npm run build`: `apps/web/build` non è nel repo e resta com'era all'ultima
build, che può essere di settimane prima.

**Come si è lavorato su una dottrina, e conviene continuare.** Ogni regola
si legge sull'immagine della pagina (`pdftoppm`, vedi le schede `FONTE.md`;
l'OCR serve solo a orientarsi, e sul gotico e sul greco non basta nemmeno a
quello: `tesseract -l ita` a 150-250 dpi trova almeno le parole), si
trascrive in `trascrizioni.md` e si prova contro una tavola o un esempio
svolto della fonte, ricopiati nel test. Dove il testo lascia due strade si
cerca chi le percorre, con un nome e un testo; se l'alternativa non ha un
autore resta fuori e lo si scrive; se ce l'ha, la scelta si fa fare al
proprietario prima del codice, e finisce in *Deciso*. Ogni risultato porta
la sua fonte in un campo `source` o `rule`.

Nel Jyotisha le superfici sono cinque: la tabella compatta (`format.ts`), la
pagina `/vedica` (un componente per sezione), la descrizione di
`compute_jyotisha_chart` (`packages/mcp/src/tools.ts`), il documento di
lettura (`packages/lettura/src/jyotisha.ts`, con le prove in
`lettura.test.ts`) e, quando è una convenzione, `/metodo/varga` o un'altra
sottopagina di `/metodo`. Quest'ultima nessun test la confronta con la prosa,
ed è quella che si dimentica. Chi aggiunge un varga o una convenzione della
hora trova l'elenco dei testi da toccare nei commenti sopra `VARGAS`
(`varga.ts`) e `HORA_CONVENTIONS` (`hora.ts`).

Nelle scuole occidentali le superfici sono quelle del tema tropicale e del
cielo, che porta la scuola anche senza nascita (`/api/sky`, `compute_sky`,
la pagina Cielo): l'elenco completo, con quello che nessun test controlla,
sta nel commento in testa a `packages/core/src/dignita-tema.ts`.

In fondo ci sono due elenchi che non sono lavoro: le decisioni prese, da non
riaprire, e le cose esaminate e lasciate stare, per non ritrovarle una seconda
volta e ricominciare da capo.

## Le versioni

Le regole (un numero solo, le tre domande che dicono quale cifra si muove,
il tag) stanno in `CLAUDE.md`, *La versione*. Se una risposta che c'era è
cambiata lo dice il fascicolo canonico: un file di `test/canonico/` che
cambia muove la seconda cifra.

| Versione | Che cosa | Voce |
|---|---|---|
| 0.1.0 | il numero unico (`f6026fa`) | 27 |
| 0.1.1 | la pagina web dell'oraria | 17 |
| 0.2.0 | le condizioni di qualità di Lilly, p. 125 | 17 |
| 0.3.0 | la Parte di Fortuna nel conto di Lilly | 17 |
| 0.4.0 | la Luna cosignificatrice che non proibisce | 17 |
| 0.5.0 | chi si avvicina negli incontri del corso | 17 |
| 0.5.1 | la scuola delle dignità sul cielo (`/api/sky`, `compute_sky`, la pagina Cielo) | 17 |
| 0.5.2 | il corso come superficie a sé (`find_sign_course`, `GET /api/sky/course`) | 17 |
| 0.6.0 | i nomi dei sessanta shashtiamsa del D-60 | 5 |
| 0.7.0 | l'avvertenza sull'ora anche nel D-24 e nel D-27 | 5 |
| 0.8.0 | gli arudha dei graha in ogni varga | 25 |
| 0.8.1 | le quattro convenzioni moderne della hora | 5 |
| 0.9.0 | la combustione del Jyotisha nei gradi di tempo | 25 |
| 0.10.0 | la riga delle ricezioni di Valente: lui non ne definisce una | 26 |
| 0.11.0 | le ricezioni di Bonatti, dall'applicazione entro sei gradi | 26 |
| 0.12.0 | i termini di Valente dall'ed. Pingree (cambia la Bilancia) | 26 |
| 0.13.0 | dasha, mahadasha e antardasha al femminile (cambia un'avvertenza) | — |

## 28. La revisione della SEO

**Priorità media.** Quello che c'è è già ragionato, e ogni scelta ha il suo
perché nel commento accanto: titolo, descrizione, canonico senza parametri,
Open Graph, anteprima e `WebSite` in JSON-LD in
`apps/web/src/lib/components/Meta.svelte`, su tutte le diciassette pagine;
sitemap e `robots.txt` in `apps/web/src/lib/seo.ts`, serviti da
`routes/sitemap.xml` e `routes/robots.txt`, con le prove in `seo.test.ts`
(titoli sotto i sessanta caratteri, ogni pagina di `(informativa)` nella
sitemap, `/api` chiuso). Le scelte di quei commenti (niente `lastmod`, niente
`priority`, niente marcature che promettono risultati ricchi, i temi mai
nella sitemap) non si riaprono qui. Dal 30 ottobre 2026 c'è anche la pagina
d'errore (`routes/+error.svelte`), e le descrizioni hanno un tetto,
`DESCRIZIONE_MASSIMA`, che `seo.test.ts` prova su ogni pagina; le dignità di
`/metodo` stanno in `#dignita`, con le quattro scuole alla pari, e `#lilly`
tiene fortezze, Luna vuota e oraria. Restano le cose trovate controllando il
sito pubblicato lo stesso giorno, tutte fuori dal repo, in ordine di peso:

- **Quattro siti invece di uno.** I nomi sono quattro: `dodicisegni.it`,
  `www.dodicisegni.it`, `12segni.it` e `www.12segni.it`; il principale è
  `https://dodicisegni.it` (vedi *Deciso*). Oggi tutti e quattro rispondono
  200 con la stessa pagina, e ciascuno dichiara canonico **sé stesso**:
  `og:url`, `<link rel="canonical">` e gli indirizzi della sitemap seguono
  l'host della richiesta. È il caso che il README (*Prima di mettere in
  rete*, `ORIGIN`) descrive come «il modo più silenzioso di dividere in due
  un sito», e vuol dire che sul server `ORIGIN` alla build non arriva, o non
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
   tradizionali "mobile" vuol dire cardinale»), e una voce in *Deciso*.
6. Versione: seconda cifra, per il campo rinominato.

Verifica: `grep -rnw mobile packages apps` non trova più la modalità; il
fascicolo canonico cambia solo dove deve; `npm test`, `typecheck`, `lint`.

## Deciso, e da non riaprire

- **La prosa del sito si rivede con la skill di scrittura italiana anti
  pattern AI, senza «anima» decorativa.** Chiesto dal proprietario il 30
  ottobre 2026, senza calibrare una voce d'autore: perimetro le pagine
  informative, il README e i testi visibili delle pagine di calcolo; fuori i
  documenti di lettura e le descrizioni MCP, che leggono le AI. Si tolgono le
  negazioni che smentiscono un equivoco che il lettore non ha, le chiuse a
  effetto che ripetono il paragrafo, le ripetizioni; restano le negazioni
  che correggono un equivoco reale («due zodiaci non sono due astronomie»)
  e le frasi che enunciano i principi del sito. Niente prima persona, niente
  aneddoti: la voce è sobria e impersonale («il sito», «il motore»). Fatti,
  fonti, link, ancore, tavole e `<Meta>` non si toccano in una revisione di
  forma. Il lavoro è in `750708f`.

- **Dasha è femminile, con tutti i suoi periodi.** Scelto dal proprietario
  il 30 ottobre 2026: la dasha, la mahadasha, le antardasha, le
  pratyantardasha, come il sanscrito *daśā*. Vale per pagine, CLI,
  documenti, commenti e test; la regola è anche in `CLAUDE.md`, *Stile*.

- **L'oraria: scuole a pacchetti, e Lilly per prima.** Deciso il 18 e il
  27 ottobre 2026 con la voce 17, chiusa il 30. Un substrato neutro, il
  corso di `corso.ts`, con sopra le scuole, ciascuna intera e nominata; una
  scuola nuova è un file accanto a `oraria-lilly.ts`. La casa del quesito è
  un input obbligatorio, anche derivata: il motore non la sceglie. Le
  considerazioni prima del giudizio sono predicati, mai un rifiuto. Non
  entrano il sì o il no né la conversione dei gradi in giorni: li fa chi
  legge, e `ORARIA` dice come li faceva Lilly. Il documento ha un registro
  attribuito e rifiuta salute, morte, questioni legali e finanziarie; non è
  un valore di `SISTEMI`. Il pool dei worker non serve: una domanda costa
  due decimi di secondo.

- **Nel corso, chi applica lo dice il moto reale.** Scelto dal proprietario
  il 30 ottobre 2026, con la voce 17. Ogni incontro del corso porta
  `approaching`: chi si avvicina all'aspetto un quarto d'ora prima
  dell'esatto, il corpo, l'altro o tutti e due. Il corso resta neutro; il
  classificatore di Lilly continua a usare il peso (p. 108).

- **La Luna cosignificatrice non proibisce.** Scelto dal proprietario il 30
  ottobre 2026, con la voce 17, dopo una misura: su 720 figure di Roma del
  2026 la Luna faceva il 77% delle proibizioni (643 su 830), e in 50 delle
  193 figure con una perfezione diretta era l'unico impedimento. Lilly la dà
  come cosignificatrice di chi chiede (p. 124), e i suoi esempi di
  proibizione (pp. 110-111) sono di un pianeta che sorpassa il significatore
  più leggero: il suo incontro col significatore del quesito è la parte del
  querente. Proibisce solo quando è lei uno dei due significatori; resta
  traslatrice, come a p. 182. Dopo il cambio, sulle stesse figure, 187
  proibizioni.

- **La Parte di Fortuna nel conto di Lilly segue la tavola di p. 145.**
  Scelto dal proprietario il 30 ottobre 2026, con la voce 17. La Parte è
  quella di p. 144 (Ascendente + Luna − Sole, di giorno e di notte);
  aspetti coi pianeti entro la loro metà orbita, coi Nodi partili; casa con
  la regola dei cinque gradi e riga «Not Combust» come stampate, anche dove
  l'esempio di p. 180 non le segue; combustione con le soglie dei pianeti.
  Le letture stanno in `LILLY_CONDITIONS_READINGS`.

- **Le condizioni di qualità di p. 125 si leggono così.** Scelto dal
  proprietario il 30 ottobre 2026, con la voce 17. Le case «good», «proper»
  e «friendly» sono quelle con punti positivi nella tavola di p. 115 (tutte
  tranne 6, 8 e 12); la congiunzione si giudica nella casa del grado in cui
  si compie; «have dignity» del quadrato è «non peregrino», mentre
  «essentially well dignified» e «Essentially or Accidentally strong» non si
  calcolano e portano i dati. Le letture stanno in `HORARY_LILLY_READINGS`.

- **Le dignità occidentali: due colonne di default, le scuole a richiesta,
  e la riga moderna non è una scuola.** Il default, scelto il 18 ottobre
  2026 con la voce 19, sono i domicili tradizionali con esaltazione, esilio
  e caduta, la parte comune alle scuole antiche, e accanto i domicili
  moderni, mai fusi; triplicità, termini e facce solo nominando una scuola,
  intera. Il 30 ottobre 2026 il proprietario ha deciso che la riga
  «moderna» non diventa una scuola: Alan Leo, l'unico autore letto, non è
  coerente fra le edizioni (vedi *Esaminato*), e i domicili moderni restano
  la seconda colonna, com'erano. Nel Jyotisha il riferimento è Parashara;
  dove il BPHS lascia un buco o un autore moderno conta altrimenti entra
  Narasimha Rao, nominato e accanto.

- **La scuola di Valente si chiama `valente` e porta i termini di Pingree.**
  Scelto dal proprietario il 30 ottobre 2026, con la voce 19 e poi con la
  26. Un autore, come le altre scuole, e non «ellenistica»: Doroteo resta
  fuori finché non c'è un suo testo libero. I termini erano gli egizi di
  Robbins p. 96, perché in Kroll Ariete e Scorpione non si leggono; letta
  l'edizione critica di Pingree (1986, pp. 13-18, nella copia locale delle
  fonti), sono quelli che stampa lei: gli egizi in undici segni, con Ariete
  e Scorpione sanati dalla copia di Rhosus, e nella Bilancia i numeri di
  Valente (♄6 ☿5 ♃8 ♀7 ♂4), senza note in apparato.

- **La scuola di Bonatti ha le sue ricezioni, entro sei gradi, e non ha
  punteggio.** Scelto dal proprietario il 30 ottobre 2026, con la voce 19 e
  poi con la 26. La ricezione nasce da un'applicazione e chiede domicilio,
  esaltazione o due dignità minori (PDF pp. 167-168). L'applicazione è
  quella della definizione del cap. 4 (p. 158): il più leggero, nell'ordine
  delle sfere, con meno gradi nel suo segno del più pesante, per corpo,
  sestile, quadrato o trigono, e **sei gradi o meno**; non le orbite di p.
  159 («orbes amborum», di lettura incerta), e **non l'opposizione**, che il
  passo non nomina. Un fatto di posizione: il moto retrogrado non conta, e
  `corso.ts` non serve (`bonattiReceptionsOf` in `dignita-bonatti.ts`). Il
  5-4-5-3 del signore dell'anno non diventa un punteggio delle dignità. Il
  resto non era una scelta: le tavole sono quelle stampate, e nel Leone la
  tavola e il testo di Bonatti concordano.

- **La scuola di Tolomeo segue la tavola greca di Robbins com'è stampata.**
  Scelto dal proprietario il 29 ottobre 2026, con la voce 19. I termini
  sono quelli di p. 106 (cod. Vat. gr. 1453), non le seconde lezioni di
  Proclo né i termini di Lilly; nel Leone Giove primo, come la tavola,
  anche se il testo di p. 105 dà il segno a Saturno: correggerla col testo
  sarebbe una lezione nostra, e la riga della fonte lo dice. La scuola porta
  domicili, esaltazioni per segno, triangoli e termini; niente facce, esilio
  e punteggio. Le ricezioni restano quelle comuni: la definizione è di
  Lilly, e contarla sulle tavole di Tolomeo mescolerebbe le scuole.

- **Il glossario è una pagina per famiglia, e le parti indiane di `/metodo`
  sono pagine proprie.** Scelto dal proprietario il 28 ottobre 2026, con la
  voce 8: `/glossario` più `tema`, `tempo` e `jyotisha`; `/metodo/nakshatra`,
  `dasha`, `varga`, `drishti` e `panchanga`. Il glossario dice che cos'è un
  termine e rimanda, `/metodo` dichiara con quale convenzione lo si calcola: il
  taglio è scritto in testa a
  `apps/web/src/routes/(informativa)/glossario/jyotisha/+page.svelte`. Niente
  marcature FAQ, per la ragione scritta sopra `strutturati` in `Meta.svelte`;
  i cappelli delle sezioni restano come sono.

- **Il dominio non entra nel codice.** `Meta.svelte` compone gli indirizzi da
  `page.url.origin`, e in produzione è `ORIGIN` a dirlo: il cambio di dominio è
  configurazione. Da SvelteKit 3 è configurazione della build e non
  dell'avvio, perché `paths.origin` finisce nel server compilato: cambiare
  dominio vuol dire rifare la build, o l'immagine. Scelto il 18 ottobre 2026
  contro l'alternativa degli header del proxy (`PROTOCOL_HEADER`,
  `HOST_HEADER`), che avrebbe lasciato l'immagine indipendente dal dominio ma
  appesa alla configurazione del proxy.

- **Il dominio principale è `https://dodicisegni.it`, senza `www`.** Scelto
  dal proprietario il 30 ottobre 2026, con la voce 28. Coincide col nome del
  sito (`SITE_NAME`), quello che Google mostra accanto all'indirizzo; una parola
  chiave nel dominio non pesa sul posizionamento, e `12segni` resta il nome
  breve e il dominio di servizio (la riga qui sotto). Senza `www` perché è
  più corto e il sito non ha cookie da separare. `www.dodicisegni.it`,
  `12segni.it` e `www.12segni.it` reindirizzano lì, con percorso e query,
  così chi sente «dodici segni» e scrive `12segni` arriva lo stesso.

- **`12segni` non è un secondo marchio.** È il dominio di servizio e il nome
  breve sotto l'icona, dove sette caratteri sono il tetto. Nella prosa il nome
  è uno solo.

- **I transiti attivi non hanno un'interfaccia web, né un punteggio.**
  `find_active_transits`, `/api/transits/active` e `--attivi` servono agli
  agenti e alla riga di comando: la pagina e la tabella Svelte no. E nessun
  indice di intensità del periodo, che sarebbe un peso senza autore: si
  espongono i componenti (bordi, orbita ai bordi, perfezioni, avvicinamento
  massimo). Deciso con la voce 7.

- **Il linter ha regole e nessun formattatore.** ESLint con typescript-eslint
  e eslint-plugin-svelte, regole scelte una per una e nessun preset acceso in
  blocco (`eslint.config.js` dice perché ciascuna). Un formattatore
  rifluirebbe la prosa dei commenti, che è mandata a capo a mano. Deciso il
  27 ottobre 2026, con la voce 9.

- **Le orbite degli aspetti sono convenzioni nominate.** Greene (la
  predefinita di Astrodienst) per il tema e il cielo, con Leo (1928) e Lilly
  (1647, le *moieties*, dalla voce 17) in alternativa; Hand, 1°, per
  transiti, passaggi e incontri in cielo, l'unica
  tavola dei transiti con un autore. Deciso il 27 ottobre 2026 con la voce
  18, scegliendo come predefinita la più diffusa. Le orbite senza autore che
  c'erano prima (8/7/5 con +2° ai luminari; 2/1,5/1 nei transiti) sono
  uscite: erano un ibrido di Leo e Astrolog.

- **Il D-2 si fa con più convenzioni nominate, Parashara predefinita.** Hora
  del Sole e della Luna come nei testi, e Leone-Cancro accanto, dichiarata
  come lettura corrente senza un classico che la enunci. Scelto dal
  proprietario il 27 ottobre 2026 fra quattro strade, fatto il 28 in
  `a828b3f`. Il risultato è un'unione col discriminante `kind`:
  `SignVargaChart` (`'segni'`) e `HoraVargaChart` (`'signori'`, il solo D-2
  di Parashara, che il quadro rifiuta con `VARGA_SENZA_SEGNI`).

- **L'avvertenza sull'ora va anche al D-24 e al D-27.** Scelto dal
  proprietario il 30 ottobre 2026, voce 5. I varga fini sono cinque: i tre
  con parti sotto il grado e i due con parti di poco più (1°15' e
  1°6'40"), che l'Ascendente attraversa in cinque o sei minuti, meno del
  quarto d'ora a cui di solito si dà l'ora. Il D-30 no: tratti da cinque a
  otto gradi. Restano segnati a mano col campo `fine` di `VARGAS`, senza una
  soglia calcolata.

- **Le hora moderne entrano con un autore, e non nei conti del BPHS.**
  Scelto dal proprietario il 30 ottobre 2026, voce 5. Parivritti-dvaya,
  Kashinatha, Raman Suprajarama e Uma-Shambhu sono convenzioni del D-2 accanto
  a Parashara e Leone-Cancro. La parivritti-dvaya è nata anonima, ma Rao
  (2003, tavola 1; 2012, View 4) la descrive e le dà un uso, e si cita lui.
  Con una delle quattro il D-2 mostrato la segue, mentre i varga buoni di
  Santhanam e il vimshopaka contano la hora di Parashara e lo dicono
  (`bphsHoraConvention` in `hora.ts`): un conto del BPHS su una carta di
  Rath sarebbe un ibrido. Il conto di Rao (§6.6) resta col suo Leone-Cancro.

- **Il D-60 si conta dal segno stesso, con una convenzione sola.** Il verso
  6.33 dice *tad-rāśeḥ* e l'esempio di Santhanam lo applica, e P.V.R.
  Narasimha Rao lo legge allo stesso modo (in un'email del 2009 riportata su
  un forum, copia in `texts/tecnica/d60-letture-in-rete-2026`); la lettura
  dall'Ariete, cercata il 28 ottobre 2026, non ha trovato un autore.
  Confermato dal proprietario il 28 ottobre 2026. Le ragioni nella
  trascrizione di 6.33 (`texts/jyotisha/bphs-santhanam-1992-vol1`) e in
  `texts/tecnica/d60-letture-in-rete-2026`. Una seconda convenzione entra
  solo con un autore e un testo.

- **I varga buoni si contano secondo Santhanam, con l'arudha, la hora che
  segue la convenzione e il 6.53 come nota.** Quattro scelte prese dal
  proprietario il 28 ottobre 2026, voce 19: in 6.52 i *segni* di uccha,
  moolatrikona e propri, come traduce Santhanam (l'altra lettura di
  *adhipateḥ* non ha un autore); l'arudha lagna calcolato secondo 29.1-7, e
  non un conto senza (quello di Narasimha Rao è entrato accanto il 29
  ottobre, qui sotto); il 6.53 come giudizio sull'effetto, che non toglie
  varga dal conto; la hora per segno con `leone-cancro`, con la nota di
  Santhanam a p. 90 con `parashara`, dichiarata come sua.

- **Lo Scorpione e l'Acquario hanno due signori nel calcolo dell'arudha.**
  BPHS 29.7 vuole il più forte, 46.157 dà Ketu e Rahu accanto a Marte e
  Saturno, e il più forte si sceglie con la procedura di 46.158-166, che il
  testo dà per la chara dasha. Scelto dal proprietario il 28 ottobre 2026
  contro il signore unico di 4.6-24 e contro il riportare entrambi; vale
  per gli arudha e quindi per i varga buoni. Fuori dall'arudha (dignità,
  relazioni, vimshopaka) i signori restano quelli di 4.6-24.

- **Rahu e Ketu hanno le dignità di BPHS 47.35-36, solo nella tabella del
  tema, per segno e senza neecha.** Scelto dal proprietario il 29 ottobre
  2026, voce 19. Uccha, moolatrikona e segno proprio come li dà il verso,
  tutte le corrispondenze (per Ketu lo Scorpione è uccha e segno proprio
  insieme); la neecha no, perché il verso non dice il segno e la regola del
  settimo di 3.49 è detta dei sette; Vergine e Pesci, «secondo alcuni»,
  riferiti nella fonte e non usati. Restano ai sette graha le corrispondenze
  dei varga, i varga buoni, il vimshopaka, le relazioni e i signori dei
  segni di 4.6-24.

- **Il 6.53: combustione, guerra e avastha come dati, con letture
  dichiarate.** Scelto dal proprietario il 29 ottobre 2026, voce 19.
  Combustione coi limiti del *Surya Siddhanta* IX.6-9 e X.1; la tavola di
  Santhanam resta fuori. Il 30 ottobre 2026, voce 25, il proprietario ha
  scelto di giudicarla nella misura del testo, i gradi di tempo di IX.4-5:
  la differenza di ascensione obliqua (a est, all'alba) o di discensione (a
  ovest, la sera) fra il Sole e il pianeta, alla latitudine del luogo e col
  pianeta alla sua latitudine eclittica (`timeDegreesFromSun` in
  `stati.ts`); calcolata con la geometria esatta e non con le regole
  approssimate del testo, con la longitudine accanto, che decide solo oltre
  i circoli polari. Su mille nascite per latitudine il giudizio cambia
  rispetto alla longitudine in 81 casi su 6000 all'equatore, 458 a Roma, 772
  a 55° nord, 1404 a 64°. Guerra planetaria fra i
  cinque *tārāgraha*, in coordinate eclittiche geocentriche, a distanza
  angolare sotto un grado, che alla congiunzione è la differenza delle
  latitudini (*Surya Siddhanta* VII.12 e 19), con le sole
  regole di Venere e del nord (BPHS 79.9, SS VII.21 e 23), dichiarando che
  le qualità osservative restano fuori. Avastha *śayanādi* di 45.30-37
  calcolata e mostrata come dato, col navamsa per l'*aṃśa* e la ghati in
  corso come nell'esempio di Santhanam, senza dire quali avastha annullino i
  varga buoni. Il conto dei varga buoni non cambia: il 6.53 resta una nota.

- **I varga buoni si contano anche secondo Narasimha Rao, e gli arudha dei
  graha sono i suoi.** Scelto dal proprietario il 29 ottobre 2026, voce 19.
  Il conto di Rao (2000, §6.6: uccha, moolatrikona e segno proprio, senza
  l'arudha) sta accanto a quello di Santhanam, sempre tutti e due e col
  nome. Gli arudha dei graha entrano secondo Rao per intero (§9.5 e le
  regole del segno più forte di §15.5.2, con le rasi drishti che
  richiedono), non col BPHS completato da noi: 29.7 non dice come si sceglie
  il segno più forte, e 46.158-166 confronta due signori, non due segni. Gli
  arudha dei bhava restano del BPHS. In 46.164 conta anche l'uccha di Rahu
  e Ketu di 47.35: è lo stesso libro.

- **Gli arudha dei graha nei varga restano indeterminati dove la catena
  guarda il grado.** Scelto dal proprietario il 30 ottobre 2026, voce 25.
  Rao (§9.5, p. 94) li calcola in ogni divisionale, ma due spareggi
  (§15.5.1, 5b; §15.5.2, 6) guardano quanto un graha è avanzato nel segno,
  e nel segno di un varga il grado non è definito. Contro il grado «del
  varga» (gradi × N modulo 30), che è l'uso dei programmi e non di Rao, e
  che non vale per il D-30: quando la catena arriva lì, segno proprio e
  arudha mancano e `ownSignRule` dice dove si è fermata. Succede solo a
  Marte e Saturno, per il co-signore di Scorpione e Acquario: misurato su
  4200 carte, 26 arudha su 37800; dove l'arudha c'è, coincide con quello
  del grado «del varga» (`arudha-graha.test.ts`).

- **Il server MCP non ha un pool, e non gli serve**: è un processo per client,
  sul trasporto stdio, e non c'è nessun'altra richiesta da tenere in attesa.

- **I thread del pool web sono al massimo quattro, e la quinta richiesta
  pesante aspetta.** Sono uno meno dei nuclei, fino a quattro
  (`OPERAI`, `apps/web/src/lib/server/pool.ts:142`). Le due ragioni stanno nel
  commento lì sopra: uno meno dei nuclei perché il lavoro è tutto CPU e un
  nucleo resta al filo principale, che serve le richieste leggere; il tetto
  di quattro per la memoria, perché ogni thread carica la sua copia del
  motore e delle effemeridi. Va
  riguardato solo se la concorrenza sul sito pubblico diventa seria, e non da
  dentro il motore.

## Esaminato, e lasciato stare

**Esilio e ricezione in Valente.** Cercati il 30 ottobre 2026 (voce 26)
nell'indice II di Kroll, lettere δ, ε e υ, e riletti i luoghi. ὑποδοχεύς
(«ricevitore», pp. 103 e 105) è in II.31 il signore del segno in cui sta un
luminare, sinonimo di οἰκοδεσπότης, come annota Kroll a p. 102: il
dispositore, non una ricezione fra due pianeti. ἐναντίαι μοῖραι (p. 70, 16)
sono gradi «contrari», non il segno opposto al domicilio. Nessun lemma per
l'esilio. Le ricezioni di `valente` restano quelle comuni, come dice
`VALENS_RECEPTION_SOURCE`, e la scuola non ha esilio, come dice la sua riga
`source`. Le trascrizioni in `texts/occidentale/valente-anthologiae-kroll-1908`.

**Due verifiche sulla hora, senza esito.** Dalla voce 5, chiusa il 30
ottobre 2026. *La Kashinatha su Leone e Cancro*: il motore segue Rao
(2003), «Leo and Cancer form a pair», e manda la hora del Sole al Leone e
quella della Luna al Cancro anche lì; PyJHora manda tutto il Leone al Leone
e tutto il Cancro al Cancro (`planet_hora_dict_for_odd_even_signs`). La
carta 1 di Rao (p. 4 del PDF, trascritta) non distingue le due letture, e
che cosa faccia Jagannatha Hora non si trova in rete (cercato il 30 ottobre
2026); servirebbe il programma, che gira su Windows. Se Rao stesso, in un
testo successivo, la desse come PyJHora, cambiano la riga `source` della
Kashinatha in `hora.ts` e il test della coppia in `varga.test.ts`. *La
parivritti alternata*, che PyJHora chiama «Somanatha» (dispari dall'Ariete in
avanti, pari dai Pesci all'indietro): cercata lo stesso giorno, compare come
voce di menù anche in Deva Guru («D2 Somanath», accanto a un «D2
Samasaptaka»; `texts/tecnica/deva-guru-varga-2026`), dove «Somanath» è il
nome di una famiglia di varga (D-2, D-3, D-9), ma nessuno ne scrive la regola
con un nome. Entra solo con un autore.

**Le scuole d'oraria che verranno, non pianificate.** Note dalla voce 17.
Ciascuna sarebbe un classificatore sul corso di `corso.ts` e un pacchetto di
tavole come quelli di `dignita-*.ts`. La linea araba e medievale
(Māshā'allāh, Sahl ibn Bishr, Bonatti): il trattato delle interrogazioni di
Bonatti non è ancora stato cercato nella scansione di
`texts/occidentale/bonatti-decem-tractatus-1491`, e le sue sei negazioni
della perfezione (refranazione, evasione, proibizione, abscissione,
contrarietà, ritorno della luce) non coincidono coi nomi di Lilly; le
traduzioni inglesi moderne (Dykes) sono protette. Il prashna del Jyotisha:
il *Prasna Marga* e soprattutto la Krishnamurti Paddhati, in cui un numero
da 1 a 249 fissa il grado dell'Ascendente e i sotto-signori vengono dalle
proporzioni vimshottari già in `nakshatra.ts` e `dasha.ts`; i diritti sui
libri di Krishnamurti sono da verificare.

**Le figure del libro II di Lilly che il motore non riproduce.** Esaminate il
30 ottobre 2026 con la voce 17, chiusa (le prove in `oraria-lilly.test.ts`,
le trascrizioni nella copia locale della fonte). La figura di p. 238 (1635)
è incoerente in sé: case per circa le 12:30, pianeti per quasi un giorno
dopo. A p. 220 il motore vede una proibizione del Sole che Lilly legge a
favore. A p. 241 la Luna di Lilly è in quinta per la regola dei cinque gradi
e quella del motore in quarta per sei primi, e il testo dà «♃ Lord of the
Houre» contro la figura. Nessuna delle tre chiede un cambio del motore; la
seconda, se un giorno si volesse, è una lettura da decidere. Per leggerne
altre: le date di Lilly sono giuliane (+10 giorni nel Seicento); «hora
meridiana» è il mezzogiorno vero, da convertire in tempo medio con
l'equazione del tempo (nel novembre 1645, le 11:45); nel PDF locale la
pagina stampata N è la PDF N + 34 almeno fino a p. 289, salvo la numerazione
disordinata di pp. 182-185; le figure si trovano
con miniature delle pagine, perché l'OCR non le legge. Sono state cercate e
lette tutte le figure fra le pagine PDF 200 e 330 (stampate 166-296); il
libro II continua oltre, e lì non sono state cercate.

**Alan Leo come scuola delle dignità.** Letto il 30 ottobre 2026 (voce 19),
in `texts/occidentale/leo-how-to-judge-a-nativity-1928/trascrizioni.md`.
Nella 4ª ed. di *How to Judge a Nativity* (p. 27, testo del 1903) i domicili
sono i tradizionali e Urano e Nettuno non ne hanno («for the present they
may be taken as substitutes for the Sun and Moon»); nel 1912 (*The Art of
Synthesis*, p. 117) li dà ad Acquario e Pesci. La colonna «Strong» di p. 27
(Mercurio nel Cancro, il Sole nello Scorpione…) non ha una regola scritta, e
«Weak» è l'esilio. I decani per triplicità (pp. 92-99) sono uno strumento
per leggere l'Ascendente, coi signori tradizionali e aggiunte moderne non
sistematiche («Saturn or Uranus»), non una dignità. Una scuola «leo»
dovrebbe scegliere fra le sue edizioni: è una dottrina nostra.

**Le relazioni dei nodi e la debolezza del 6.53, nel Jyotisha.** Ferme
senza fonte (voce 19). Santhanam (vol. I, p. 41) dà le relazioni di Rahu e
Ketu secondo altri testi, non secondo 3.55; *durbalāḥ* di 6.53 non ha una
soglia nel verso. Entrano se una fonte con un nome le dà.

**I punti 5-4-3-2-1 «medievali».** I siti li attribuiscono alla tradizione
medievale senza un testo. In Bonatti non ci sono: i capitoli delle dignità
non danno punti, e il solo conto (trattato delle rivoluzioni, PDF p. 484) è
domicilio 5, esaltazione 4, termine 5, triplicità 3, per scegliere il
signore dell'anno. Da cercare in al-Qabīṣī o Ibn Ezra, se mai servisse.

**Una seconda fonte per l'esaltazione dei nodi nel Jyotisha.** Chiusa col
BPHS stesso, 47.34-36. Santhanam in nota a 3.50 rimanda alla sua traduzione
dello *Horasara*, p. 20, non trovata su archive.org; l'altra, Subrahmanya
Sastri (1949), è in `texts/jyotisha/horasara-subrahmanya-sastri-1949`,
protetta, e per i nodi non è stata letta.

**Le fonti per le cuspidi che sembrano indipendenti e non lo sono.** Da non
ricontrollare: **astro.com** e le sue tavole delle case in PDF, **AstroSeek**,
**Cafe Astrology**, **AstroLibrary**, e ogni libreria costruita su `pyswisseph`
o `sweph` (Kerykeion, flatlib, immanuel). Sono tutte lo stesso motore visto da
fuori. Le cuspidi sono ancorate in `houses.test.ts` a RadixPro e ad Astrolog
compilato senza Swiss Ephemeris, e il commento in testa al test dice perché.

Se un giorno servisse un secondo ancoraggio, la strada c'è ed è di pubblico
dominio: **Dalton, *The Spherical Basis of Astrology* (1911, settima edizione,
che incorpora le Raphael's Tables of Houses)**, su archive.org come
`sphericalbasisof00dalt`, senza restrizioni, cuspidi Placido al primo d'arco per
le latitudini da 22 a 60. L'OCR delle tabelle è illeggibile ma le pagine si
leggono a vista. Le tavole di Koch (le sue *Häusertabellen* del 1971 e il *Koch
Book of Tables* di Michelsen) ci sono, ma in prestito, non scaricabili.

**`sprintf-js` sotto `electron-builder`.** Fino a ottobre 2026 `npm audit`
lo dava moderato in tutte le versioni, con `roarr`, `global-agent`,
`@electron/get` e la catena di `app-builder-lib`, senza un rimedio vero; il
30 ottobre 2026 non lo segnala più, anche se la catena è ancora installata.
Girava solo quando si costruisce l'AppImage, e nell'AppImage non entra.

**`deepmerge` sotto SvelteKit.** Resta dalla voce 29, chiusa il 30 ottobre
2026, quando gli avvisi di `npm audit` erano nove: `electron` è passato alla
43.8.4 (fissata esatta in `apps/desktop/package.json`, e l'AppImage
ricostruita parte), `zod` alla 4 (l'SDK MCP 1.32.1 accetta `^3.25 || ^4.0`;
lo schema di `tools/list` ha perso `additionalProperties: false`, che zod 3
dichiarava senza applicarlo, e gli interi hanno preso i limiti dei numeri
sicuri; per il resto è identico), e `npm audit fix` ha aggiornato
`body-parser`, `@hono/node-server`, `fast-uri`, SvelteKit (3.1.1) e
adapter-node (6.0.1) dentro i manifesti. Restano quattro avvisi bassi su
`deepmerge`, sotto `@sveltejs/vite-plugin-svelte`, `kit` e `adapter-node`:
il «fix» che `npm audit` propone è una versione 0.0.x di SvelteKit, cioè un
ritorno indietro di anni. Non si segue; si aspetta un aggiornamento di
`vite-plugin-svelte`, e `npm audit` dice quando.

**L'avviso di Chrome sui campi di modulo senza `id` né `name`.** Compare in
console come *issue*, «A form field element should have an id or name
attribute». Contati il 30 ottobre 2026: le due caselle di
`BirthForm.svelte`, una di `ChartSettings.svelte`, le caselle dei varga in
`JyotishaSettings.svelte` (una per varga), l'area di testo di
`StrumentiLettura.svelte`, una casella in `elezione`, due pulsanti di scelta
in `vedica` e la casella della casa derivata in `oraria`. `MomentFields` e
`LocationSearch` un `id` ce l'hanno.
Non è accessibilità: stanno dentro un `<label>`, o hanno un `aria-label`
(l'area di testo di `StrumentiLettura.svelte`), che è ciò che li nomina.
Riguarda l'autocompilazione del browser, che senza `name` non sa che
cosa proporre, e il progetto in parte la spegne già (`autocomplete="off"` in
`BirthForm.svelte:79` e `:91` e in `LocationSearch.svelte:156`). Prima di
aggiungere `name` per zittire l'avviso va ricordato che un browser che ricorda
date e luoghi di nascita costruisce lo stesso archivio che il service worker si
rifiuta di costruire (`lib/cache-policy.ts`).
