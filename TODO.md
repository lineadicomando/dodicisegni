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

Le fonti citate qui stanno in copia locale in `texts/`, fuori dal repo: la
cartella, le schede `FONTE.md` e l'elenco `texts/INDICE.md` si mantengono come
dice `CLAUDE.md` (*Le fonti testuali*). In una sessione nuova `texts/` può non
esserci, se il clone è un altro: le schede dicono da dove riscaricare ogni
fonte.

I riferimenti `file:riga`, i nomi e i commit citati sono stati ricontrollati
tutti contro il codice il 30 ottobre 2026 una seconda volta, su `b05e801`
(versione 0.5.2), dopo i ritocchi all'interfaccia che seguono la chiusura
delle voci 17 e 19. Le righe si spostano: se una non torna, il
nome della funzione o della costante accanto è quello che fa fede.

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
  seconda cifra (`CLAUDE.md`, *La versione*). È calcolato con Moshier e senza
  stelle fisse, apposta;
- i test che leggono le stelle fisse vogliono `packages/core/ephe/sefstars.txt`,
  che `npm run ephe:download -w @dodicisegni/core` scarica (133 KB); senza,
  vengono saltati e non falliscono;
- `/api/jyotish` si fa memorizzare dal browser per un giorno
  (`private, max-age=86400`): provando la pagina `/vedica` dopo aver
  cambiato il motore, il browser può mostrare la risposta vecchia. Basta
  cambiare di un minuto l'ora nell'indirizzo. Per la stessa ragione i
  componenti di `/vedica` mettono una guardia sui campi nuovi
  (`{#if jyotisha.arudhas}`) anche dove il tipo li dà per presenti;
- la pagina `/vedica` legge il luogo solo da `locationId`
  (`/vedica?date=1968-03-12&time=14:30&locationId=3172394` è Napoli): con
  `latitude` e `longitude` mostra il modulo vuoto, mentre `/api/jyotish` li
  accetta tutti e due;
- `computeJyotisha` non è più una funzione della sola carta: per l'alba delle
  avastha (`stati.ts`) chiama `initEphemeris` e `lastSunrise` di
  `panchanga.ts`, con `JyotishaOptions.ephemerisPath` se c'è. Resta
  sincrona, e l'alba non usa i flag siderali.

Per spegnere il server di sviluppo lanciato in sottofondo si usa la porta
(`fuser -k 5173/tcp`), non `pkill -f` col numero della porta: il comando
contiene lo stesso numero e chiude anche la shell che lo lancia. E prima di
provare il server compilato (`npm start -w @dodicisegni/web`) va rifatto
`npm run build`: `apps/web/build` non è nel repo e resta com'era all'ultima
build, che può essere di settimane prima.

**Il push si fa coi tag.** Il 30 ottobre 2026 sono andati su `origin` tutti
i commit e i tag da `v0.1.0` a `v0.5.2`. Il push lo chiede il proprietario;
quando lo chiede, `git push --follow-tags` porta anche i tag annotati.
Prima di cominciare, `git status -sb` dice se c'è lavoro non pubblicato.

In fondo ci sono due elenchi che non sono lavoro: le decisioni prese, da non
riaprire, e le cose esaminate e lasciate stare, per non ritrovarle una seconda
volta e ricominciare da capo.

## Da dove ripartire

| Voce | Priorità | Taglia | Prima di cominciare |
|---|---|---|---|
| 5. I varga: le convenzioni che restano | bassa | piccola | i sedici sono fatti; restano rifiniture, una per riga |
| 25. Le dignità del Jyotisha: le rifiniture | bassa | piccola | due calcoli, da fare solo se servissero |
| 26. Le scuole occidentali delle dignità: quello che resta | bassa | piccola | la ricezione di Bonatti chiede un'applicazione; Valente aspetta un testo |
| 28. La revisione della SEO | media | piccola | il dominio principale è deciso; i redirect e `ORIGIN` si fanno sul server, non nel repo |

Le prime tre sono rifiniture, nessuna urgente. La 28 è la sola che tocca
chi usa il programma oggi: il suo primo punto divide il sito in quattro agli
occhi dei motori di ricerca, e si fa sul server, quando il proprietario lo
chiede. Fra le rifiniture, i sessanta nomi del D-60 sono fatti il 30
ottobre 2026 (`shashtiamsaOf` in `varga.ts`, versione 0.6.0). L'avvertenza
sul D-24 e sul D-27 è una scelta del proprietario prima che una riga di
codice; le altre convenzioni della hora sono il lavoro più lungo della voce
5. Della 25 il pezzo più vicino sono gli arudha dei graha nei varga; la
combustione in gradi di tempo vuole pagine ancora da leggere. La 26 aspetta
testi.

**Versione 0.6.0**, in ogni manifesto, col tag `v0.6.0`: i nomi del D-60
(voce 5), un campo che compare nella risposta del varga. La
prima, la 0.1.0, cade col numero unico della voce 27 (`f6026fa`) il 30
ottobre 2026; poi, tutte con la
voce 17: la 0.1.1 la pagina web dell'oraria, la 0.2.0 le condizioni di
qualità di p. 125, la 0.3.0 la Parte di Fortuna nel conto di Lilly, la 0.4.0
la Luna cosignificatrice che non proibisce, la 0.5.0 chi si avvicina negli
incontri del corso, la 0.5.1 la scuola delle dignità sul cielo (`/api/sky`,
`compute_sky`, la pagina Cielo), la 0.5.2 il corso come superficie a sé (il
tool `find_sign_course` e `GET /api/sky/course`). Le regole (un
numero solo, le tre domande che dicono quale cifra si muove, il tag) stanno
in `CLAUDE.md`, *La versione*. Se una risposta che c'era è cambiata lo dice
il fascicolo canonico (`packages/core/test/canonico.test.ts`, voce 27,
chiusa): un file di `test/canonico/` che cambia muove la seconda cifra.

L'ordine consigliato è quello della tabella. La voce 19, le dignità per
scuola, è chiusa il 30 ottobre 2026: nell'occidente Lilly, Tolomeo, Bonatti
e Valente, nel Jyotisha Parashara con Narasimha Rao accanto; quello che
restava è nelle voci 25 e 26, o in *Esaminato* dove manca una fonte. Anche
la 17, l'oraria, è chiusa il 30 ottobre 2026: le sue decisioni sono in
*Deciso*, le figure di Lilly che il motore non riproduce in *Esaminato*.

**Come si è lavorato nel Jyotisha, e conviene continuare.** Ogni regola si
legge sull'immagine della pagina (`pdftoppm`, vedi le schede `FONTE.md`), si
trascrive in `trascrizioni.md` col sanscrito traslitterato e la traduzione,
e si prova contro una tavola o un esempio svolto della fonte, ricopiati nel
test. Dove il testo lascia due strade si cerca chi le percorre, con un nome
e un testo; se l'alternativa non ha un autore resta fuori e lo si scrive; se
ce l'ha, la scelta si fa fare al proprietario prima del codice, e finisce in
*Deciso*. Ogni risultato porta la sua fonte e le sue letture in un campo
`source` o `rule`, e arriva a cinque superfici: la tabella compatta
(`format.ts`), la pagina `/vedica` (un componente per sezione), la
descrizione di `compute_jyotisha_chart` (`packages/mcp/src/tools.ts`), il
documento di lettura (`packages/lettura/src/jyotisha.ts`, con le prove in
`lettura.test.ts`) e, quando è una convenzione, `/metodo/varga`.
Quest'ultima nessun test la confronta con la prosa, ed è quella che si
dimentica: il 29 ottobre 2026 diceva ancora il 6.53 «non verificato». Dalla
riga di comando la tabella compatta si vede con `--zodiaco siderale
--lettura --sistema jyotisha`.

**Come si lavora su una scuola occidentale.** Lo stesso metodo, con le
superfici del tema tropicale: il modulo `dignita-<scuola>.ts` con la sua
riga `source`, il campo in `WesternDignities`, le righe in `format.ts`, il
blocco in `DignityTable.svelte`, la voce del menù in `lib/scuole-dignita.ts`,
la descrizione di `dignity_school` in `packages/mcp/src/tools.ts`, il
documento `packages/lettura/src/tropicale.ts` e `/metodo`; e, dalla 0.5.1,
il cielo, che porta la scuola anche senza nascita (`/api/sky`, `compute_sky`,
la pagina Cielo; il modello è `ec1ad1e`). L'elenco preciso,
con quello che nessun test controlla, è alla voce 26. Dalla riga di comando la
sezione si vede con `--dignita <scuola>` e una nascita qualunque, con l'ora
perché ci sia la setta.

## 5. I varga: le convenzioni che restano

**Priorità bassa.** I sedici varga del BPHS, cap. 6, sono calcolati tutti, in
`packages/core/src/varga.ts` (il D-2 con le sue convenzioni in `hora.ts`), in
quattro passaggi del 28 ottobre 2026: D-4 e D-7 (`097ae59`), il D-2
(`a828b3f`), D-16, D-20 e D-24 (`87fb824`), D-40, D-45 e D-60
(`178f01d`). Ogni regola è stata letta sull'immagine di Santhanam, vol. I,
pp. 68-86, sanscrito compreso, e ogni
tavola stampata è ricopiata in `packages/core/test/varga.test.ts` e
confrontata con la regola (`controllaTavola`, `tavolaPerGruppi`). Le
trascrizioni stanno in `texts/jyotisha/bphs-santhanam-1992-vol1/trascrizioni.md`.
Due cose da ricordare: la tavola del D-27 a p. 79 ha un refuso (Gemelli,
undicesima parte), e il D-20 scambia fissi e mobili rispetto al D-16 nel
verso stesso (*cāpān mṛgendrād*).

Il D-60 si conta dal segno stesso (vedi *Deciso*), e porta per ogni graha e
per il lagna lo shashtiamsa, il mezzo grado col nome di BPHS 6.34-40
(`shashtiamsaOf`, `SHASHTIAMSA_NAMES`, nella grafia della tavola di
Santhanam, pp. 84-86, rovesciato nei segni pari), senza il benefico o
malefico del verso 41. La seconda metà di 6.40 si potrebbe leggere anche come
rovescio dei signori, cioè dei segni: Santhanam no, e la trascrizione dice
perché; una lettura così entra solo con un autore. Il D-40, il D-45 e il
D-60 portano `warnings`: di quanti minuti l'ora di nascita dovrebbe sbagliare
perché lagna e Luna cambino segno, calcolato sulla carta con la velocità
dell'Ascendente (`ascendantDegreesPerMinute`, dal tempo siderale locale, la
latitudine e l'obliquità media). Le avvertenze salgono in
`JyotishaChart.warnings` e le stampa `formatVargaCompact`. Quali varga
siano «fini» lo dice il campo `fine` di `VARGAS`.

### Che cosa resta

Ciascuna indipendente dalle altre.

- **Le altre convenzioni della hora.** La parivritti-dvaya, la Kashinatha,
  la Uma-Shambhu, quella di Raman Suprajarama: regole e casi di controllo
  nelle schede `FONTE.md` di `texts/jyotisha/narasimha-rao-*`,
  `suprajarama-*` e `texts/tecnica/pyjhora`. Oggi `HORA_CONVENTIONS` dà a
  ogni convenzione un segno fisso per luminare (`signOf`), che basta a
  Parashara e a `leone-cancro`; **tutte e quattro** quelle che restano danno
  invece un segno diverso secondo il segno di partenza, quindi la forma della
  voce va cambiata (una funzione al posto di `signOf`) prima di aggiungere la
  prima. PyJHora ne conosce sei e non quattro: la sesta, che chiama
  «Somanatha» (la parivritti alternata), non è stata né presa né scartata, e
  va cercato se ha un autore. Nella Kashinatha PyJHora e la dispensa di Rao
  del 2003 divergono su Leone e Cancro, e quale delle due segua Jagannatha
  Hora non è verificato (la scheda di `texts/tecnica/pyjhora` dice come). Le
  liste di CLI, API e MCP derivano da `HORA_CONVENTIONS`; il menù
  dell'interfaccia no: è scritto a mano nello snippet `menuHora` di
  `JyotishaSettings.svelte`, con un `<option>` per convenzione. La forma
  del D-2 nel risultato: `VargaChart` è un'unione col discriminante `kind`,
  `SignVargaChart` (`'segni'`) e `HoraVargaChart` (`'signori'`, il solo D-2
  di Parashara, rifiutato dal quadro con `VARGA_SENZA_SEGNI`).
- **L'avvertenza anche sul D-24 e sul D-27?** Le loro parti sono di poco più
  di un grado (1°15' e 1°6'40"), che l'Ascendente attraversa in cinque o sei
  minuti. I varga «fini» oggi sono i tre con parti sotto il grado, segnati
  a mano col campo `fine` di `VARGAS` (non c'è una soglia calcolata).
  Allargarli è una scelta del proprietario; nel codice costa una riga, ma i
  testi che nominano i tre fini sono almeno sette, e nessun test li vede:
  l'aiuto della CLI («le ultime tre», `cli.ts:122-124`), le descrizioni MCP
  (`tools.ts:492-493` e `:1627`, `draw_jyotisha_chart`), `/metodo/varga`
  (il paragrafo dell'avvertenza), `packages/lettura/src/jyotisha.ts:149` e i
  commenti in `types.ts:398` e `varga.ts:83`.

Per chi aggiunge un varga o una variante: l'elenco che le superfici accettano
si legge da `VARGAS` (server MCP, le due rotte `api/jyotish`, la CLI).
L'interfaccia ne ha due copie in `apps/web/src/lib/varghe.ts`, tutte e due
senza la D-1, apposta: `VARGHE`, l'elenco delle caselle, e `SCHEMI_VARGA`,
i pulsanti dei quattro gruppi di Parashara (BPHS 7.17-20), copiati da
`VARGA_SCHEMES` (`d09578b`). `apps/web/src/lib/elenchi.test.ts` e
`apps/web/src/routes/(informativa)/metodo/jyotisha.test.ts` cadono finché le
copie e la tavola di `/metodo/varga` non combaciano con `VARGAS` e
`VARGA_SCHEMES`, **anche nell'ordine**. Nessun test vede invece i testi che
li elencano: il commento delle due rotte `api/jyotish`, l'aiuto di `--varga`
(`packages/core/src/cli.ts:120`), la descrizione dei parametri `vargas` e
`varga` in `packages/mcp/src/tools.ts`, il rimando in `/metodo` (voce
`#varga`), la pagina `/metodo/varga` con la sua descrizione in `Meta`, il
commento sopra `VargaId` in `types.ts`, e i testi sui varga fini elencati qui
sopra, nella riga sul D-24 e sul D-27. Un varga
fuori dai sedici del BPHS fa cadere anche `varga-buoni.test.ts`, che
pretende `VARGA_SCHEMES.shodashavarga` uguale a `VARGAS`: gli schemi e i
pesi del vimshopaka (`VIMSHOPAKA_WEIGHTS`) sono quelli del testo, e un varga
nuovo non ci entra.

## 25. Le dignità del Jyotisha: le rifiniture

**Priorità bassa.** Restano dalla voce 19, chiusa il 30 ottobre 2026; le
dignità di Parashara e tutto quello che ne deriva sono in `dignita-parashara.ts`,
`varga-buoni.ts`, `maitri.ts`, `vimshopaka.ts`, `arudha.ts`,
`arudha-graha.ts` e `stati.ts`, ciascuno con la sua fonte nel commento e la
sua prova nel test. Le due cose qui sono indipendenti, e da fare solo se
servissero:

- **La combustione nei gradi di tempo del *Surya Siddhanta*.** Oggi è in
  longitudine, e lo dice (`COMBUSTION_SOURCE` in `stati.ts`). Il calcolo
  esatto vuole l'ascensione obliqua all'orizzonte del luogo, col pianeta
  corretto per la latitudine (SS IX.1-5, pp. 364-366, e VII.8): un calcolo
  nuovo. Le pagine non sono ancora lette: nella copia locale
  (`texts/jyotisha/surya-siddhanta-burgess-1860`) c'è l'immagine di p. 366 e
  non quelle di pp. 364-365, e `trascrizioni.md` ha solo VII.8 e pp. 366-367.
- **Gli arudha dei graha nei varga.** Rao (§9.5, p. 94, letto
  sull'immagine) li calcola in ogni divisionale («the sign containing the
  planet in the divisional chart of interest»); `arudha-graha.ts` fa solo la
  rashi. Il nodo è uno, e chiede una scelta del proprietario prima del
  codice: due spareggi della catena, §15.5.1 (5b) e §15.5.2 (6), guardano
  quanto un graha è avanzato nel segno, e in un segno di varga il grado non
  è definito (`types.ts`, il commento a `retrograde` di `SignVargaChart`).
  Rao non dice che grado usare. Le strade: lasciare indeterminato l'arudha
  quando la catena arriva lì, dicendolo; o il grado «del varga» (gradi × N
  modulo 30), che è l'uso dei programmi e non vale per il D-30, a tratti
  disuguali. Misurato il 30 ottobre 2026 su 300 nascite di prova e i
  quattordici varga con segni dal D-3 al D-60: in 13 carte su 4200 il
  risultato cambia col grado (5 nel D-30, 3 nel D-10, 2 nel D-27, una nel
  D-7, nel D-9 e nel D-12).

## 26. Le scuole occidentali delle dignità: quello che resta

**Priorità bassa.** Dalla voce 19, chiusa il 30 ottobre 2026. Le scuole sono
quattro, ciascuna un modulo con la sua fonte, le sue tavole ricopiate nel
test e le scelte del proprietario in *Deciso*: Lilly (`dignita-lilly.ts`, con
le condizioni e il conto in `condizioni-lilly.ts`), Tolomeo
(`dignita-tolomeo.ts`), Bonatti (`dignita-bonatti.ts`) e Valente
(`dignita-valente.ts`). Le tavole comuni, che il tema porta sempre, sono in
`dignita.ts`; il blocco del tema in `dignita-tema.ts`.

- **La ricezione di Bonatti**, se un giorno servisse: nasce da
  un'applicazione in corso (tratt. III, PDF pp. 167-168), quindi vuole una
  convenzione delle orbite di Bonatti (da leggere: non è stata cercata) e il
  corso di `corso.ts`. È lavoro dell'oraria (voce 17, chiusa) più che della
  tavola.
- **Valente, le cose non cercate.** Esilio e ricezione nelle *Anthologiae*,
  oltre l'indice di Kroll; e un testo critico migliore per I.3, l'ed. Pingree
  (Teubner 1986), protetta, che potrebbe sanare Ariete e Scorpione e dire se
  la Bilancia di Valente è sua o del codice. Se cambia, cambia la riga dei
  termini, non per forza la tavola. L'edizione è in `texts/INDICE.md`, fra
  le non libere.

**Per chi aggiunge una scuola** (Doroteo, se un suo testo diventasse
libero). Valente è il modello più recente: `93cb27b` il calcolo, `697fea0`
le superfici. Un modulo `dignita-<scuola>.ts` con le righe `source` e
`termsSource`, un valore di `DignitySchool` col nome in
`DIGNITY_SCHOOL_NAMES` (`constants.ts`, che il compilatore pretende e da cui
CLI, MCP, `/api/chart` e `/api/sky` imparano a validarlo), un campo in
`WesternDignities`, un ramo in `computeWesternDignities`, la fonte delle
ricezioni (`*_RECEPTION_SOURCE`) con le voci di `CONTATE` e
`FONTE_RICEZIONI` in `dignita-tema.ts`, gli export in `index.ts`, una
funzione di righe in `format.ts`, un blocco in `DignityTable.svelte`, una
voce in `lib/scuole-dignita.ts` (provata da `elenchi.test.ts`; la pagina
Cielo la legge da lì). Le prove, come per Valente: un caso in
`packages/lettura/test/lettura.test.ts` e uno in
`packages/mcp/test/server.test.ts` (`compute_natal_chart` con
`dignity_school`); e la scuola nuova va aggiunta a mano al blocco `dignita`
del fascicolo canonico (`packages/core/test/canonico.test.ts:95-101`), che
le elenca una per una. È una scuola chiesta per nome: muove la terza cifra
della versione. A mano, perché nessun test li vede: l'aiuto di `--dignita`
(`cli.ts`, lo stesso che vale per `--sky`), la descrizione di
`dignity_school` in `packages/mcp/src/tools.ts` **due volte** (in
`compute_natal_chart` e in `compute_sky`), il commento di
`apps/web/src/routes/api/chart/+server.ts` e quello di
`apps/web/src/routes/api/sky/+server.ts`, il commento in
`packages/core/src/sky.ts` sulle scuole senza condizioni, il documento di
lettura tropicale e `/metodo`. `apps/web/src/lib/server/birth.test.ts` usa
il nome di una scuola inesistente per provare il rifiuto (oggi `doroteo`), e va cambiato se
quella scuola entra. Il conto delle fortezze è di Lilly e resta suo: una
scuola porta il proprio, o nessuno. Le ricezioni restano quelle comuni per
ogni scuola che non le definisce o che le definisce in un modo che la
tavola non calcola, e la riga della fonte lo dice.

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

## Deciso, e da non riaprire

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

- **La scuola di Valente si chiama `valente` e porta i termini egizi.**
  Scelto dal proprietario il 30 ottobre 2026, con la voce 19. Un autore, come
  le altre scuole, e non «ellenistica»: Doroteo resta fuori finché non c'è un
  suo testo libero. I termini sono la tavola egizia di Robbins p. 96, che
  Valente I.3 segue dove il testo è sano; non la sua Bilancia né una tavola
  composta segno per segno, che nessuna fonte stampa intera. La riga dei
  termini dice le tre divergenze.

- **La scuola di Bonatti lascia le ricezioni comuni e non ha punteggio.**
  Scelto dal proprietario il 30 ottobre 2026, con la voce 19. La ricezione
  di Bonatti nasce da un'applicazione e chiede domicilio, esaltazione o due
  dignità minori: non si calcola, la riga delle ricezioni la riporta, e
  restano quelle per domicilio ed esaltazione. Il 5-4-5-3 del signore
  dell'anno non diventa un punteggio delle dignità. Il resto non era una
  scelta: le tavole sono quelle stampate, e nel Leone la tavola e il testo
  di Bonatti concordano.

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
  `a828b3f`; la forma del risultato sta nella voce 5, *Che cosa resta*, nella
  riga sulle altre convenzioni della hora.

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
  Combustione in longitudine con i limiti del *Surya Siddhanta* IX.6-9 e
  X.1, dichiarando che il testo li dà in gradi di tempo e che la longitudine
  li approssima; la tavola di Santhanam resta fuori. Guerra planetaria fra i
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
