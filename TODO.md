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

Le fonti citate qui stanno in copia locale in `texts/`, fuori dal repo: la
cartella, le schede `FONTE.md` e l'elenco `texts/INDICE.md` si mantengono come
dice `CLAUDE.md` (*Le fonti testuali*). In una sessione nuova `texts/` può non
esserci, se il clone è un altro: le schede dicono da dove riscaricare ogni
fonte.

I riferimenti `file:riga` e i nomi citati sono stati ricontrollati tutti
contro il codice il 29 ottobre 2026, dopo la scuola di Tolomeo della voce 19
(`75cc895`). Le righe si spostano: se una non torna, il nome della funzione
o della costante accanto è quello che fa fede.

Prima di cominciare conviene che `npm test`, `npm run typecheck` e `npm run
lint` siano verdi. Le cose che fanno perdere tempo:

- se il typecheck di `apps/web` cade su `config.kit.paths.origin`,
  `node_modules` è indietro rispetto al lockfile e serve un `npm install`;
- `apps/web` e `packages/mcp` vedono `core` compilato, non i sorgenti: dopo
  un export nuovo serve `npm run build -w @dodicisegni/core`, e il server di
  sviluppo di Vite va riavviato, o risponde 500 dicendo che l'export non c'è;
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
contiene lo stesso numero e chiude anche la shell che lo lancia.

In fondo ci sono due elenchi che non sono lavoro: le decisioni prese, da non
riaprire, e le cose esaminate e lasciate stare, per non ritrovarle una seconda
volta e ricominciare da capo.

## Da dove ripartire

| Voce | Priorità | Taglia | Prima di cominciare |
|---|---|---|---|
| 17. L'astrologia oraria | bassa | piccola, ormai | i quattro lotti sono fatti; restano rifiniture indipendenti, una per riga |
| 5. I varga: le convenzioni che restano | bassa | piccola | i sedici sono fatti; restano rifiniture, una per riga |
| 25. Le dignità del Jyotisha: le rifiniture | bassa | piccola | due calcoli, da fare solo se servissero |
| 26. Le scuole occidentali: quello che resta | bassa | piccola | la ricezione di Bonatti va con la 17; Valente aspetta un testo |

**Versione 0.5.2**, in ogni manifesto, col tag `v0.5.2`. La prima, la
0.1.0, cade alla chiusura della voce 19 il 30 ottobre 2026; poi, tutte con la
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
restava è nelle voci 25 e 26, o in *Esaminato* dove manca una fonte. La 17
usa le tavole di Lilly e ha già le *moieties* come terza convenzione delle
orbite.

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
documento `packages/lettura/src/tropicale.ts` e `/metodo`. L'elenco preciso,
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

Il D-60 si conta dal segno stesso (vedi *Deciso*), e il D-40, il D-45 e il
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
  `suprajarama-*` e `texts/tecnica/pyjhora`. Una convenzione che dà un segno
  fisso per luminare è una voce di `HORA_CONVENTIONS` con `signOf`; quelle
  che danno un segno diverso per segno di partenza (la Kashinatha, la
  parivritti-dvaya) vogliono una funzione al posto di `signOf`. Le liste di
  CLI, API e MCP derivano da `HORA_CONVENTIONS`; il menù di
  `JyotishaSettings.svelte` no, ed è scritto a mano. La forma del D-2 nel
  risultato: `VargaChart` è un'unione col discriminante `kind`,
  `SignVargaChart` (`'segni'`) e `HoraVargaChart` (`'signori'`, il solo D-2
  di Parashara, rifiutato dal quadro con `VARGA_SENZA_SEGNI`).
- **L'avvertenza anche sul D-24 e sul D-27?** Le loro parti sono di poco più
  di un grado (1°15' e 1°6'40"), che l'Ascendente attraversa in cinque o sei
  minuti. Oggi la soglia è «meno di un grado»; se allargarla è una scelta, e
  costa una riga (`fine: true`).
- **I sessanta nomi del D-60** (Ghora, Rakshasa…, BPHS 6.34-40, tavola alle
  pp. 84-86, trascritta in sintesi): oggi non sono riportati, e
  `/metodo/varga` lo dice. Se entrano, entrano come nome, rovesciati nei
  segni pari, e senza il giudizio benefico o malefico del verso 41.

Per chi aggiunge un varga o una variante: l'elenco che le superfici accettano
si legge da `VARGAS` (server MCP, le due rotte `api/jyotish`, la CLI).
L'interfaccia ha una copia, `apps/web/src/lib/varghe.ts`, che lascia fuori la
D-1 apposta; `apps/web/src/lib/elenchi.test.ts` e
`apps/web/src/routes/(informativa)/metodo/jyotisha.test.ts` cadono finché la
copia e la tavola di `/metodo/varga` non combaciano con `VARGAS`, **anche
nell'ordine**. Nessun test vede invece i testi che li elencano: il commento
delle due rotte, l'aiuto di `--varga` (`packages/core/src/cli.ts:119`), la
descrizione dei parametri `vargas` e `varga` in `packages/mcp/src/tools.ts`,
il rimando in `/metodo` (voce `#varga`), la pagina `/metodo/varga` con la sua
descrizione in `Meta`, e il commento sopra `VargaId` in `types.ts`. Un varga
fuori dai sedici del BPHS fa cadere anche `varga-buoni.test.ts`, che
pretende `VARGA_SCHEMES.shodashavarga` uguale a `VARGAS`: gli schemi e i
pesi del vimshopaka (`VIMSHOPAKA_WEIGHTS`) sono quelli del testo, e un varga
nuovo non ci entra.

## 17. L'astrologia oraria

**Priorità bassa.** Il lavoro pianificato è fatto, in quattro lotti, il 27
ottobre 2026; restano rifiniture indipendenti, elencate sotto. Il metodo è
quello di William Lilly, *Christian Astrology* (1647), e ogni regola nel codice
porta la pagina del libro.

### Che cosa c'è

| Strato | File | Commit | Che cosa fa | Prova |
|---|---|---|---|---|
| A, condizioni di un istante | `packages/core/src/condizioni-lilly.ts` | `da88a36`, `cc80d1e` | per i sette: casa con la regola dei cinque gradi (p. 33), Sole (cazimi, combusto, raggi, p. 113), moto rispetto al moto medio di Lilly (pp. 57-80), orientale e occidentale (p. 114), partili (p. 106), assedio, peregrino, Regolo, Spica e Algol, antiscion (p. 90), e il conto della tavola di p. 115 con fortezze, debilità e differenza; per l'istante, l'ora planetaria (`planetaryHourAt` in `election.ts`), i gradi dell'Ascendente e la Via Combusta (p. 122). Sta in `WesternDignities.lilly.conditions` | `test/condizioni-lilly.test.ts`, sulla figura del 1634 |
| B, il corso fino al cambio di segno | `packages/core/src/corso.ts` | `916b711`, `dfd9a67` | `findSignCourse`: aspetti tolemaici esatti, stazioni e ingresso di un corpo dall'istante al cambio di segno, le separazioni da quando è nel segno, un limite `until`; sopra, la Luna vuota moderna e quella di Lilly (p. 112). Le *moieties* sono la convenzione `lilly` di `orbite.ts` | `test/corso.test.ts`, `test/aspects.test.ts` |
| C, la scuola di Lilly | `packages/core/src/oraria-lilly.ts` | `2433924` | `computeHoraryLilly(moment, place, { question: { house, derivedFrom? } })`: figura col Regiomontano, significatori (pp. 123-124), e i classificatori puri di `classifyLilly` (congiunzione e aspetto p. 125, traslazione e collezione p. 126, proibizione e frustrazione pp. 110-113, refranazione p. 111); le considerazioni di pp. 121-123 come predicati, con le nature dei pianeti del libro I | `test/oraria-lilly.test.ts`: gli esempi del libro I scritti a mano, e la traslazione della Luna della domanda del 1634 (p. 182) |
| D, le superfici | `packages/mcp/src/tools.ts` (`registerComputeHorary`), `prompts.ts` (`registerLetturaOraria`), `packages/lettura/src/oraria.ts`, `apps/web/src/routes/api/horary/+server.ts` | `ec58bdf` | il tool `compute_horary`, il prompt `lettura_oraria`, il documento `ORARIA` (fuori da `SISTEMI`), `GET /api/horary` | `packages/mcp/test/server.test.ts`, `packages/lettura/test/lettura.test.ts` |
| E, la pagina web | `apps/web/src/routes/oraria/+page.svelte`, i componenti `Horary*` e `SignCourseTable.svelte`, `lib/case-lilly.ts` | v0.1.1 | `/oraria`: istante, luogo, la casa scelta da un elenco delle dodici con le significazioni di Lilly (pp. 50-56), la domanda scritta che resta nel browser e va solo nel prompt (`letturaOrariaDaIncollare`) | `lib/case-lilly.test.ts`, `format.test.ts`; vista nel browser |

Dalla riga di comando: `--dignita lilly` col tema o con `--sky`, `--sky
--corso <corpo>`, `--oraria <casa>` con `--derivata`. Con una longitudine
negativa va scritta col segno uguale, `--lon=-0.1278`, o `parseArgs` la prende
per un'opzione.

Le scelte fatte dove il testo lascia due strade non stanno qui: viaggiano col
risultato e si leggono nel codice, in `LILLY_CONDITIONS_READINGS`, nella
`rule` dei classificatori di `corso.ts` e in `HORARY_LILLY_READINGS`. Quelle che
più facilmente si vorranno rivedere:

- dove l'esempio svolto di pp. 177-180 non segue la sua tavola, il motore segue
  la tavola: Mercurio, Luna e Giove entro 17° dal Sole sono sotto i raggi
  (Lilly li dà liberi), Giove orientale prende 2 e il Sole diurno la
  triplicità che Lilly non conta. Il test lo tiene scritto;
- Regolo entro 5° come Spica e Algol (Lilly scrive «within six degrees», ma
  allora conterebbe Regolo alla Luna, e non lo fa);
- le *moieties* sono la prima colonna di p. 107, quella che Lilly dice sua;
- la Luna vuota di Lilly non pretende «separated from a Planet»;
- la Luna non proibisce quando è cosignificatrice di chi chiede (p. 124):
  dal 30 ottobre 2026, vedi *Deciso*;
- traslazione e collezione si riconoscono anche senza la ricezione di p. 126,
  che è riportata e la cui mancanza è detta.

### Che cosa resta

Ciascuna indipendente dalle altre.

- **Altre figure del libro II** per la verifica. Oltre a quella del 1634 sono
  provate, dal 30 ottobre 2026, «Where an absent Brother was?» (pp. 196-197)
  e la notizia di Cambridge (p. 200), in `oraria-lilly.test.ts`: posizioni
  entro un grado, significatori, il corso della Luna, l'ora planetaria, tutto
  come Lilly lo stampa. Le altre figure stanno alle pagine PDF 253, 272, 274,
  320 e 323 (fin qui la pagina stampata è la PDF − 34), trovate con
  miniature delle pagine perché l'OCR delle figure non si legge. Due cose da
  sapere: le date sono giuliane (+10 giorni nel Seicento), e «hora
  meridiana» è il mezzogiorno vero, che va convertito in tempo medio con
  l'equazione del tempo (nel novembre 1645, le 11:45).

### Deciso

Il 18 ottobre 2026:

- **Le scuole sono pacchetti, e la prima è Lilly.** Un substrato neutro, il
  corso di `corso.ts`, con sopra le scuole, ciascuna intera e nominata nel
  risultato. Una scuola nuova è un file accanto a `oraria-lilly.ts`, non una
  modifica.
- **Il documento di lettura ha un registro attribuito**: «secondo il metodo di
  Lilly la figura indica…». È l'unico che risponde; salute, morte, questioni
  legali e finanziarie le rifiuta dicendo perché.
- **Le dignità stanno nel punto 19**, chiuso il 30 ottobre 2026: le tavole
  sono nei moduli `dignita-*.ts`.

Il 27 ottobre 2026, facendolo:

- **La casa del quesito è un input**, obbligatorio, anche derivata. Il motore
  non la sceglie, e le descrizioni dicono all'agente di chiederla se la
  domanda non la indica.
- **Le considerazioni prima del giudizio sono predicati, mai un rifiuto**;
  quelle senza una soglia nel testo restano «non calcolate» e lo dicono.
- **Non entrano il sì o il no né la conversione dei gradi in giorni**: li fa
  chi legge, e `ORARIA` dice come li faceva Lilly (p. 110 per il tempo).
- **`ORARIA` non è un valore di `SISTEMI`**: quelli leggono una nascita, e il
  prompt del tema natale applicherebbe le istruzioni di una domanda a un tema.
- **Il pool dei worker non serve**: una domanda di oggi costa due decimi di
  secondo. La figura del 1634 ne costa quasi due, ma gira solo nei test.

### Le fonti

*Christian Astrology* in `texts/occidentale/lilly-christian-astrology-1647`
(archive.org `b30338724`, pubblico dominio): 41 pagine lette in `pagine/`,
trascritte in `trascrizioni.md`, l'elenco per lotto in `FONTE.md`. Nel PDF
locale la pagina stampata N è la N + 34, verificato fino a p. 182: `pdftoppm
-f $((N+34)) -l $((N+34)) -r 250 -jpeg -singlefile scansione.pdf pagine/pNNN`.
Da p. 182 la numerazione stampata è disordinata (186, 185, 184, 185 di
seguito): oltre, la pagina si conta sul PDF e si dice. Da leggere: p. 91
(il contrantiscion, che il codice ricava come punto opposto all'antiscion) e
p. 145 (la Parte di Fortuna).

**I numeri si leggono sulla scansione, non sui siti**: la trascrizione in rete
(Houlding, Skyscript) è protetta, e le fonti secondarie non concordano. Il
«Marte 8°» che circola per Lilly è di al-Biruni (§436, trad. Wright 1934, in
`texts/occidentale/biruni-elements-of-astrology-wright-1934`).

Il catalogo delle stelle è `sefstars.txt` di Swiss Ephemeris, scaricato da
`npm run ephe:download -w @dodicisegni/core` in `packages/core/ephe/` e
copiato in `texts/tecnica/swiss-ephemeris/dati/`. Senza, le righe delle stelle
mancano dal conto e `missing` lo dice; i test della figura del 1634 vengono
saltati (`describe.skipIf`), e nel CI il file c'è.

### Le scuole che verranno

Note, non pianificate. Ciascuna è un classificatore sul corso di `corso.ts` e
un pacchetto di tavole come quelli di `dignita-*.ts`.

- **La linea araba e medievale**: Māshā'allāh e Sahl ibn Bishr, poi Bonatti
  (*Decem tractatus astronomiae*, Ratdolt 1491, col trattato sulle
  interrogazioni; scaricato in `texts/occidentale/bonatti-decem-tractatus-1491`,
  copia della Biblioteca Jagellonica: l'OCR dell'incunabolo è inutile e si
  legge sulle immagini). I termini di Bonatti non sono gli egizi ma i
  tolemaici (`dignita-bonatti.ts`); il trattato delle interrogazioni non è ancora stato
  cercato nella scansione, e la `FONTE.md` dice come orientarsi con l'OCR.
  Bonatti conta sei negazioni della perfezione (refranazione, evasione,
  proibizione, abscissione, contrarietà, ritorno della luce), che non
  coincidono coi nomi di Lilly. Le traduzioni latine medievali
  sono di pubblico dominio, quelle inglesi moderne (Dykes) no.
- **Il prashna del Jyotisha.** Il *Prasna Marga* (Kerala, XVII secolo), e
  soprattutto la Krishnamurti Paddhati (KP), la più calcolabile: il
  consultante dà un numero da 1 a 249 che fissa il grado dell'Ascendente, e i
  sotto-signori si ricavano dalle proporzioni vimshottari che il motore ha già
  in `nakshatra.ts` e `dasha.ts`. Va verificato lo stato dei diritti sui libri
  di Krishnamurti; la regola si ricalcola dalla definizione.

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
  nuovo.
- **Gli arudha dei graha nei varga.** Rao (§9.5) li calcola in ogni
  divisionale; `arudha-graha.ts` fa solo la rashi.

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
  corso di `corso.ts`. È lavoro dell'oraria più che della tavola, da pensare
  con la voce 17.
- **Valente, le cose non cercate.** Esilio e ricezione nelle *Anthologiae*,
  oltre l'indice di Kroll; e un testo critico migliore per I.3, l'ed. Pingree
  (Teubner 1986), protetta, che potrebbe sanare Ariete e Scorpione e dire se
  la Bilancia di Valente è sua o del codice. Se cambia, cambia la riga dei
  termini, non per forza la tavola.

**Per chi aggiunge una scuola** (Doroteo, se un suo testo diventasse
libero). Valente è il modello più recente: `93cb27b` il calcolo, `697fea0`
le superfici. Un modulo `dignita-<scuola>.ts` con le righe `source` e
`termsSource`, un valore di `DignitySchool` col nome in
`DIGNITY_SCHOOL_NAMES` (`constants.ts`, che il compilatore pretende e da cui
CLI, MCP e `/api/chart` imparano a validarlo), un campo in
`WesternDignities`, un ramo in `computeWesternDignities`, una funzione di
righe in `format.ts`, un blocco in `DignityTable.svelte`, una voce in
`lib/scuole-dignita.ts` (provata da `elenchi.test.ts`). A mano, perché nessun
test li vede: l'aiuto di `--dignita` (`cli.ts`), la descrizione di
`dignity_school` (`packages/mcp/src/tools.ts`), il commento di
`apps/web/src/routes/api/chart/+server.ts`, il documento di lettura tropicale
e `/metodo`. `apps/web/src/lib/server/birth.test.ts` usa il nome di una
scuola inesistente per provare il rifiuto (oggi `doroteo`), e va cambiato se
quella scuola entra. Il conto delle fortezze è di Lilly e resta suo: una
scuola porta il proprio, o nessuno. Le ricezioni restano quelle comuni per
ogni scuola che non le definisce o che le definisce in un modo che la
tavola non calcola, e la riga della fonte lo dice.

## Deciso, e da non riaprire

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
  taglio è scritto in testa a `glossario/jyotisha/+page.svelte`. Niente
  marcature FAQ, per la ragione scritta sopra `strutturati` in `Meta.svelte`;
  i cappelli delle cinque sezioni restano come sono.

- **Il dominio non entra nel codice.** `Meta.svelte` compone gli indirizzi da
  `page.url.origin`, e in produzione è `ORIGIN` a dirlo: il cambio di dominio è
  configurazione. Da SvelteKit 3 è configurazione della build e non
  dell'avvio, perché `paths.origin` finisce nel server compilato: cambiare
  dominio vuol dire rifare la build, o l'immagine. Scelto il 18 ottobre 2026
  contro l'alternativa degli header del proxy (`PROTOCOL_HEADER`,
  `HOST_HEADER`), che avrebbe lasciato l'immagine indipendente dal dominio ma
  appesa alla configurazione del proxy.
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
  riguardato solo se l'applicazione va in rete pubblica con concorrenza
  seria, e non da dentro il motore.

## Esaminato, e lasciato stare

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

**`sprintf-js` sotto `electron-builder`.** `npm audit` lo dà moderato in tutte
le versioni (`*`), e con lui `roarr`, `global-agent`, `@electron/get` e la
catena di `app-builder-lib`, che dicono «fix available» ma non ne hanno uno.
Girano solo quando si costruisce l'AppImage, sulla macchina di chi la
costruisce, e nell'AppImage non entrano. Da riguardare quando
`electron-builder` smette di dipendere da `@electron/get@3`.

**L'avviso di Chrome sui campi di modulo senza `id` né `name`.** Compare in
console come *issue*, «A form field element should have an id or name
attribute», e i campi sono una decina: le caselle di `BirthForm.svelte`,
`ChartSettings.svelte`, `JyotishaSettings.svelte`, `MomentFields.svelte`,
`LocationSearch.svelte`, `StrumentiLettura.svelte`, `elezione` e `vedica`.
Non è accessibilità: stanno tutti dentro un `<label>`, che è ciò che li
nomina. Riguarda l'autocompilazione del browser, che senza `name` non sa che
cosa proporre, e il progetto in parte la spegne già (`autocomplete="off"` in
`BirthForm.svelte:91` e `:103` e in `LocationSearch.svelte:156`). Prima di
aggiungere `name` per zittire l'avviso va ricordato che un browser che ricorda
date e luoghi di nascita costruisce lo stesso archivio che il service worker si
rifiuta di costruire (`lib/cache-policy.ts`).
