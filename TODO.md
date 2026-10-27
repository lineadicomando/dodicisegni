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

Le fonti citate qui stanno in copia locale in `texts/`, fuori dal repo: la
cartella, le schede `FONTE.md` e l'elenco `texts/INDICE.md` si mantengono come
dice `CLAUDE.md` (*Le fonti testuali*). In una sessione nuova `texts/` può non
esserci, se il clone è un altro: le schede dicono da dove riscaricare ogni
fonte, e la voce 24 quelle che mancano ancora.

I riferimenti `file:riga` sono stati ricontrollati tutti contro il codice il
27 ottobre 2026, dopo i commit delle orbite nominate (`555e33b`). Il lotto A
della voce 17 (`da88a36`) ha poi allungato `types.ts`, `format.ts`,
`election.ts` e `ephemeris.ts`, e i numeri di riga in quei file non sono
stati riallineati. Le righe si spostano: se una non torna, il nome della funzione o della costante accanto
è quello che fa fede. Prima di cominciare conviene che `npm test`, `npm run
typecheck` e `npm run lint` siano verdi; se il typecheck di `apps/web` cade su
`config.kit.paths.origin`, `node_modules` è indietro rispetto al lockfile e
serve un `npm install`.

In fondo ci sono due elenchi che non sono lavoro: le decisioni prese, da non
riaprire, e le cose esaminate e lasciate stare, per non ritrovarle una seconda
volta e ricominciare da capo.

## Da dove ripartire

| Voce | Priorità | Taglia | Prima di cominciare |
|---|---|---|---|
| 8. Il glossario e /metodo | media | grande | si incrocia col punto 6 |
| 6. La prosa che invecchia | bassa | piccola | farla insieme al punto 8 |
| 5. I varga che mancano | non dichiarata | tre lotti | niente: il D-2 è deciso, gli altri hanno la fonte |
| 19. Le dignità, per scuola | bassa | media | il Jyotisha: i varga del BPHS, cap. 6-7 |
| 17. L'astrologia oraria | bassa | la più grande | lotto A fatto; il B è il substrato neutro |
| 24. Le fonti da scaricare in `texts/` | bassa | piccola | niente |

L'ordine consigliato è quello della tabella. La 8 e la 6 toccano la stessa
pagina, `/metodo`, e conviene farle insieme. Della 19 resta soprattutto il
Jyotisha, che sta accanto ai varga della 5: il D-2 deciso lì cambia anche il
modo di dire la dignità nella hora. La 17 usa le tavole di Lilly della 19 e
aggiunge le *moieties* come terza convenzione delle orbite, nel lotto B.

## 5. I nove varga che mancano

Calcolati: D-1, D-3, D-9, D-10, D-12, D-27, D-30, in `packages/core/src/varga.ts`.
Sono i più usati, ed è la ragione per cui vengono per primi, non la
completezza. Dei sedici classici ne restano nove.

**Non vanno fatti in un colpo solo.** Ogni varga è una regola a sé, e le regole
divergono fra scuole più che nel resto del Jyotisha: farne dieci in un
passaggio significa copiarne otto senza verificarle. I lotti che seguono
raggruppano per **forma della regola**, così che dentro ciascuno si verifichi
una volta il meccanismo e poi si applichi.

Per tutti vale la procedura già collaudata: la regola in una riga dentro
`VARGAS`, che viaggia nel risultato ed è ciò che rende il segno
ricontrollabile; le prove ai confini dei segni pari e dispari; l'aggiunta a
`VargaId` in `types.ts` e all'elenco di `--varga` nell'aiuto della CLI.

L'elenco dei varga che le superfici accettano si legge da `VARGAS`: il server
MCP (`VARGA_IDS` in `packages/mcp/src/tools.ts`) e le due rotte
`api/jyotish/+server.ts` e `api/jyotish/quadro/+server.ts` lo derivano, e la
CLI lo valida da lì. L'interfaccia no, perché nel bundle del browser non entra
un valore del motore: le caselle stanno in `apps/web/src/lib/varghe.ts`, una
copia che lascia fuori la D-1 apposta, e `apps/web/src/lib/elenchi.test.ts`
cade se resta indietro. Un varga nuovo fa quindi cadere quel test, e va
aggiunto lì a mano col suo nome.

Restano da aggiornare a mano i testi che li elencano, che nessun test vede: il
commento delle due rotte (`api/jyotish/+server.ts`, parametro `vargas`;
`quadro/+server.ts`, parametro `varga`), l'aiuto della CLI
(`--varga <lista>`, `packages/core/src/cli.ts:109`), la pagina del metodo
(«Il sito ne calcola sette», sezione `#varga`, `metodo/+page.svelte:358`) e
il commento in testa a quella pagina («le sette divisionali», riga 12). I
tipi, in `packages/core/src/types.ts`: `VargaId` a :359, `VargaChart` a :369,
l'opzione `vargas` a :597.

### Lotto A: quelli che si biforcano su pari e dispari

**D-2 Hora, D-4 Chaturthamsa, D-7 Saptamsa.** Stessa forma del D-10 già
fatto: si guarda se il segno è pari o dispari e si parte da due punti diversi.
Il D-2 divide in due (Sole e Luna); il D-4 in quattro, sui kendra; il D-7 in
sette, dal segno stesso nei dispari e dal settimo nei pari.

**Il D-2 è deciso (27 ottobre 2026): più convenzioni nominate, affiancate,
con Parashara come predefinita.** La ricerca che ha portato alla scelta:

- **I testi classici danno solo «hora del Sole» e «hora della Luna»**, senza
  un segno: BPHS 6.5-6 (Santhanam, vol. I, pp. 68-69, tavola «Speculum of
  Horas» a p. 69), Brihat Jataka I.11, Saravali III.14, Horasara II.2,
  Jataka Parijata I.30, Phaladeepika III.4, tutti scaricati in
  `texts/jyotisha/`. Segno dispari: 0-15° al Sole, 15-30° alla Luna; pari al
  contrario. È la sola con una fonte primaria, e basta agli usi che BPHS ne fa
  (7.13-19, pp. 91-95: frutti nella hora del Sole o della Luna, peso 2 nel
  vimshopaka). Trascrizioni in
  `texts/jyotisha/bphs-santhanam-1992-vol1/trascrizioni.md`, sezione «6.5-6».
- **Leone e Cancro** (hora del Sole al Leone, della Luna al Cancro) è la
  lettura corrente, ma nessun classico letto la enuncia: la presuppone
  Santhanam (p. 90, «Jupiter is in exaltation Varga if in Moon's Hora») e la
  dice quella che gli astrologi «normally use» P.V.R. Narasimha Rao (2003,
  `texts/jyotisha/narasimha-rao-personal-finances-hora-chart-2003`).
- **Le varianti moderne con un segno**, ciascuna con un autore, restano fuori
  per ora e si possono aggiungere come convenzioni a sé: la *parivritti-dvaya*
  ciclica (lettura letterale di BPHS 6.6), la Uma-Shambhu di Narasimha Rao
  (2012), la Kashinatha (scuola SJC), quella attribuita a «Raman» (in realtà
  di Raman Suprajarama, 2005), la «Somanatha» senza fonte primaria. Le regole
  e i casi di controllo stanno nelle schede `FONTE.md` delle cartelle
  `texts/jyotisha/narasimha-rao-*`, `suprajarama-*` e `texts/tecnica/pyjhora`.
- La regola di Garga/Yavana (signore del segno e dell'undicesimo) è riportata
  e scartata da Varahamihira (BJ I.12). Non entra.

Casi di controllo per i test, Sole a 10° e 20° dell'Ariete, 10° e 20° del
Toro: Parashara Sole / Luna / Luna / Sole; Leone-Cancro Leone / Cancro /
Cancro / Leone.

Come farlo, sul modello delle orbite (`packages/core/src/orbite.ts`): una
convenzione della hora con nome, fonte e regola, che il risultato porta;
`parashara` predefinita, `leone-cancro` accanto, dichiarata nella sua regola
come lettura corrente e non come testo. Che cosa tocca, e va deciso
scrivendo:

- **Il tipo.** Con Parashara il D-2 non ha un segno: `VargaChart.positions`
  (`types.ts`, `sign: ZodiacSign`) deve poter portare un signore,
  `hora: 'sole' | 'luna'`, al posto del segno. La forma che rompe meno è
  `sign` facoltativo più `hora` facoltativo, con la regola che uno dei due
  c'è sempre. Il tipo è ridichiarato in `packages/ruota/src/types.ts` e
  confrontato da `packages/ruota/test/tipi.test.ts`.
- **Il disegno.** Il quadro vedico (`packages/ruota/src/quadro.ts`) colloca i
  corpi nei segni: un D-2 di Parashara non ha dove metterli. O si rifiuta con
  un errore che dice di scegliere `leone-cancro`, o lo si disegna diverso.
  Lo stesso vale per `draw_jyotisha_chart` e `/api/jyotish/quadro`.
- **Le tabelle e i testi**: `formatVargaCompact` in `format.ts`, la tabella
  dei varga nell'interfaccia, le istruzioni di lettura in
  `packages/lettura/src/jyotisha.ts` se nominano i varga.
- **Le superfici**: l'opzione della convenzione su CLI, `/api/jyotish`, MCP;
  il D-2 in `apps/web/src/lib/varghe.ts`.

### Lotto B: i multipli con partenza fissa

**D-16 Shodashamsa, D-20 Vimshamsa, D-24 Chaturvimshamsa.** Qui la partenza non dipende dal segno di arrivo ma da un segno
fisso deciso dalla natura del segno di partenza (cardinale, fisso o mobile per
alcuni; pari o dispari per altri). Il meccanismo è quello del D-9, applicato a
divisioni più fini.

Il D-27, che stava qui, è fatto: BPHS 6.24-26, pp. 78-79, trascritto in
`texts/jyotisha/bphs-santhanam-1992-vol1/trascrizioni.md`. La voce lo
descriveva male in due punti, e vale la pena ricordarlo per gli altri del
lotto: 1°6'40" è un quarto di pada, non un pada; e non si riparte
dall'Ariete in ogni segno, si conta di seguito dall'Ariete lungo tutto lo
zodiaco (fuoco dall'Ariete, terra dal Cancro, aria dalla Bilancia, acqua
dal Capricorno). La tavola di Santhanam a p. 79 ha un refuso (Gemelli,
undicesima parte): le tavole stampate vanno controllate contro la regola,
non copiate.

### Lotto C: i fini, che vogliono un'ora di nascita esatta

**D-40 Khavedamsa, D-45 Akshavedamsa, D-60 Shashtiamsa.**

Il D-60 è, in Parashara, il più importante di tutti, e insieme quello che il
motore può garantire di meno: una divisione dura **30 primi d'arco**, che
l'Ascendente percorre in due minuti di orologio. Un'ora di nascita arrotondata
al quarto d'ora produce un D-60 sbagliato, e non se ne accorge nessuno.

Questo lotto vuole quindi una cosa che gli altri non chiedono: **un'avvertenza
propria**, sul modello di quelle delle dasha (l'array `warnings` in
`dasha.ts:99-120`, per l'ora ignota e per Moshier), che dica quanti
minuti di scarto valgano una divisione. Senza, sarebbe il caso peggiore di
tutti: un dato che sembra preciso perché ha molte cifre.

Fonte: BPHS cap. 6-7, nella traduzione di Santhanam, vol. I, che sta in
`texts/jyotisha/bphs-santhanam-1992-vol1`. Il cap. 6 comincia a riga 4370
dell'`ocr.txt`. Dove comincia la regola di ciascun varga, con la pagina
stampata ricavata dalle intestazioni dell'OCR (da confermare sull'immagine,
che si scarica come dice la scheda: pagina stampata = immagine `n` meno 4):

| Varga | Versi | Riga dell'OCR | Pagina circa | Stato |
|---|---|---|---|---|
| D-2 Hora | 6.5-6 | 4472 | 68-69 | deciso, da fare (lotto A) |
| D-3 Drekkana | 6.1-8 | 4521 | 69-70 | fatto, pagina da annotare |
| D-4 Chaturthamsa | 6.9 | 4582 | 70-71 | lotto A |
| D-7 Saptamsa | 6.10-11 | 4637 | 71-72 | lotto A |
| D-9 Navamsa | 6.12 | 4689 | 72 | fatto, pagina da annotare |
| D-10 Dasamsa | 6.13-14 | 4742 | 73 | fatto, pagina da annotare |
| D-16 Shodasamsa | 6.16 | 4847 | 74-75 | lotto B |
| D-20 Vimsamsa | 6.17-21 | 4939 | 76 | lotto B |
| D-24 Siddhamsa (Chaturvimsamsa) | 6.22-23 | 5053 | 77-78 | lotto B |
| D-27 Bhamsa | 6.24-26 | 5108 | 78-79 | fatto, p. 79 in `varga.ts` |
| D-30 Trimsamsa | 6.27-28 | 5181 | 80 | fatto, pagina da annotare |
| D-40 Khavedamsa (Chatvarimsamsa) | 6.29-30 | 5210 | 80-81 | lotto C |
| D-45 Akshavedamsa | 6.31-32 | 5269 | 81-82 | lotto C |
| D-60 Shashtiamsa | 6.33-41 | 5437 | 83-86 | lotto C |

Il D-12 Dwadasamsa (6.15) sta fra 4742 e 4847. Poi i gruppi di varga (riga
5884) e il cap. 7 da 6005, con gli usi a 6061-6112. Le regole dei varga già
calcolati, tranne il D-27, vengono da una sessione precedente e non portano
la pagina: conviene ricontrollarle sulle immagini quando si apre il primo
lotto, e scrivere la pagina nel commento come per il D-27.

Verifica per tutti i lotti: `packages/core/test/varga.test.ts` ha già la forma:
confini noti calcolati a mano per un segno pari e uno dispari, più la prova
che la regola viaggi col risultato.

## 6. La prosa che può invecchiare senza dirlo

**Bassa priorità.** Nessuna delle due rompe niente: producono testo che dice il
falso, e nessun test le vede. Stanno qui perché è il genere di cosa che si
ritrova per caso due anni dopo, e allora non si sa più quale delle due versioni
fosse quella giusta.

### La precisione di Moshier, dichiarata due volte e in due modi

`packages/core/src/ephemeris.ts`, riga 20, dice «0,1 secondi d'arco per i
pianeti maggiori». `README.md`, riga 46, dice «~0,4 secondi d'arco sui pianeti
principali». Sono la stessa affermazione sullo stesso ripiego, e differiscono di
un fattore quattro.

Una delle due è sbagliata e non si sa quale: il numero non viene da una misura
fatta qui, ma dalla documentazione di Swiss Ephemeris, dove la cifra dipende da
quali corpi e da quale epoca si guardano: Moshier degrada allontanandosi dal
presente, e i pianeti esterni non si comportano come i lunari.

La documentazione di Swiss Ephemeris è in `texts/tecnica/swiss-ephemeris`
(`swisseph.txt`, sezione «The Moshier Ephemeris», righe 1215-1240), ma
**nessuna delle due cifre sta lì**: la sezione dice «below 1 arc second with
the planets and a few arc seconds with the Moon», e 0,5″ per la Luna di
Chapront rispetto a DE404. Da dove vengano 0,1″ e 0,4″ non si sa.

Una terza frase dice la stessa cosa per la Luna e va allineata con le prime:
l'avvertenza delle dasha in `packages/core/src/dasha.ts:115` («un paio di
secondi d'arco»). La Luna va misurata anche lei, perché è quella che sposta
le dasha: la pagina del metodo (righe 340-344) dice che un secondo d'arco
vale circa tre ore e mezza di dasha.

La via per chiuderla non è scegliere il numero che suona meglio: è
**misurarlo**. Il motore sa calcolare in tutt'e due i modi, anche se la
modalità non si sceglie: `initEphemeris` (`ephemeris.ts:41-82`) passa a
Moshier quando nel percorso mancano i file `.se1`. Lo schema c'è già in
`packages/core/test/ephemeris.test.ts`: `EPHE_DIR` e `NO_EPHE_DIR`,
`describe.skipIf(!hasEphemerisFiles)` (riga 54), `resetEphemerisCache` fra una
modalità e l'altra perché la cache è per percorso. In `packages/core/ephe/`
ci sono `sepl_18`, `semo_18` e `seas_18`, che coprono il 1800-2400. Bastano
gli stessi corpi allo stesso istante nelle due modalità e la differenza in
secondi d'arco, su qualche data sparsa nell'arco. Diventa un test, e il
numero diventa verificabile invece che riportato.

Finché non è deciso, `apps/web/src/routes/(informativa)/metodo/+page.svelte`,
righe 77-78, dice «una frazione di secondo d'arco» senza cifra, di proposito, e
va aggiornata insieme alle altre.

Verifica: un test in `packages/core/test/` che confronti le due modalità e
fallisca se lo scarto esce dall'ordine di grandezza dichiarato. A quel punto le
tre righe di prosa possono portare la stessa cifra.

### La pagina del metodo non è legata al motore

`apps/web/src/routes/(informativa)/metodo/+page.svelte` ricopia in prosa valori
che vivono nel motore: la tavola delle orbite (sezione `#aspetti`, undici
righe per tre colonne: Greene, Leo, Hand) da `packages/core/src/orbite.ts`; i
nove sistemi di case da `HOUSE_SYSTEM_CODES`; i sei ayanamsa da `AYANAMSAS`
(`ayanamsa.ts`) e le sette divisionali da `VARGAS` (`varga.ts`), che la pagina
elenca nella sezione `#varga`.

Cambiando un'orbita, la pagina resta vecchia in silenzio. Non c'è nessun test
che colleghi le due cose, ed è la scelta scritta nel commento in testa al file:
legare la pagina ai valori vorrebbe dire generarla, e una tabella generata non
può dire *perché* le orbite dei transiti sono strette, che è l'unica ragione
per cui la pagina esiste. La risorsa MCP `riferimento/aspetti` invece è
generata dalle convenzioni (`packages/mcp/src/server.ts`, `aspectReference`),
e non ha il problema.

La forma che risolve senza generare la prosa esiste, ed è quella che il progetto
usa già altrove: **un test che fallisce a voce alta quando i due divergono**, sul
modello di `apps/web/src/lib/elenchi.test.ts`. Qui vorrebbe dire leggere il
file `.svelte`, trovare le righe della tavola delle orbite e confrontarne i
numeri con `orbOf` di ciascuna convenzione fra due pianeti.

Un test così è brutto e va tenuto stretto: se comincia a cercare frasi invece
che numeri diventa un impedimento a riscrivere la prosa, che è il contrario di
quello che serve. Da fare solo per i valori tabellari, e solo se la pagina
sopravvive abbastanza da giustificarlo.

Verifica: cambiare un'orbita in `orbite.ts` e vedere il test cadere.

## 8. Il glossario, e /metodo da rivedere

**Priorità media.** Viene da un esame del SEO organico, dove l'ipotesi di
partenza era un payoff da mettere nel titolo. Il payoff non sposta niente: è
del marchio, quindi si ripete su ogni pagina, e un titolo ripetuto è la cosa
che i motori riscrivono per prima. Quello che sposta è il testo, e di testo qui
ce n'è pochissimo.

Il conto è in `apps/web/src/lib/seo.ts`: sette indirizzi in
`PAGINE_PUBBLICHE`, e cinque sono strumenti: `h1` nascosto, un cappello di due
paragrafi e sotto il modulo. Le pagine fatte di prosa sono `/metodo` e
`/privacy`, e la seconda la cerca soltanto chi la deve controllare. Un sito con
due pagine di testo non si posiziona su niente, per quanto bene siano scritti i
suoi `<title>`.

Il vincolo del progetto, qui, non è un impedimento: è il filtro che sceglie il
contenuto. Che cos'è un nakshatra è un fatto verificabile; che cosa prometta
Saturno in settima no. **Il glossario è la prosa che questo progetto può
scrivere senza tradirsi**, ed è anche quella che intercetta le ricerche più
precise: in italiano, su questi termini, non copre bene nessuno.

### Il glossario

I termini ci sono già tutti, sparsi: quelli del Jyotisha che la regola di stile
tiene in sanscrito (`nakshatra`, `tithi`, `karana`, `yoga`, `dasha`, `varga`,
`drishti`, `pada`, più `ayanamsa` e `panchanga`) e quelli che il motore
occidentale calcola e nomina: Parte di Fortuna, Luna vuota di corso, ore
planetarie, cuspidi, orbita, retrogradazione, stazione, ingresso, distribuzione
fra elementi e modalità, i nove sistemi di case.

Non c'è niente da inventare e non si deve: la fonte è scritta due volte, nei
commenti di `packages/core` (`VoidOfCourse` in `types.ts`, `dasha.ts`,
`varga.ts`, `constants.ts`) e nella pagina del metodo, che quasi tutti li
spiega già.

Ed è esattamente lì il rischio. **Due pagine che dicono la stessa cosa si
tolgono i lettori a vicenda**, e un motore che deve scegliere fra le due
sceglie male. Il taglio va deciso prima di scrivere una riga, e la forma che
regge è questa: il glossario dice *che cos'è* il termine, in tre righe, e
rimanda; `/metodo` dice *con quale convenzione questo sito lo calcola*. Il
primo definisce, il secondo dichiara, che è poi la differenza fra i due
vincoli del progetto.

**Da decidere, e non è una scelta di stile.** Una pagina per termine è la forma
che intercetta le ricerche, ma sono trenta indirizzi da poche righe l'uno, che
è la definizione di pagina magra, e la sitemap li porterebbe tutti. Una pagina
sola con le ancore è un indirizzo solo e trenta ricerche perse. La via di mezzo
(una pagina per famiglia, il Jyotisha da una parte, il tempo e i moti
dall'altra) è probabilmente quella giusta, ma va scelta guardando quanto testo
regge davvero ogni termine, non prima.

Qualunque sia la forma, le pagine nuove **non sono sezioni**: vanno aggiunte a
mano in `PAGINE_PUBBLICHE`, come `/metodo` e `/privacy`, e
`lib/seo.test.ts` va esteso di conseguenza. Nel menù non entrano.

`seo.ts` porta conteggi scritti a mano nei commenti, da rifare con le pagine
nuove: «le altre sei» (riga 28), «sette indirizzi» per la sitemap (riga 71) e
«dodici endpoint» (riga 105), tutti giusti al 27 ottobre 2026. Anche il README
conta a mano le sezioni e gli endpoint («Cinque sezioni e dodici endpoint»).

### La revisione di /metodo

La pagina non è povera: 490 righe e diciassette sezioni, ciascuna con il suo
`id`. Il problema è che è **una pagina sola**. Le diciassette ancore non sono
diciassette risultati: `#dasha` non è mai un indirizzo per sé, e chi cerca
«dasha vimshottari» trova al più la pagina intera, che parla di altre sedici
cose.

Va quindi valutato (non è deciso) se le cinque parti dell'astrologia indiana
(`#nakshatra`, `#dasha`, `#varga`, `#drishti`, `#panchanga`, righe 312-400)
debbano staccarsi in pagine proprie. Contro: spezzare una pagina che si legge
bene di seguito, e che è l'unica cosa che risponda a «perché la stessa nascita
dà carte diverse altrove». A favore: sono già cinque capitoli con un titolo e
un `id`, e il testo di ognuno regge da solo.

Due cose invece vanno fatte comunque:

- **Il titolo e la descrizione.** «Metodo» è una parola che non cerca nessuno.
  La descrizione a `metodo/+page.svelte:24` è buona ed elenca già i termini
  giusti; il titolo li butta via tutti.
- **Il coordinamento con il punto 6**, che tocca questa stessa pagina in due
  modi: la precisione di Moshier senza cifra alle righe 77-78, e il legame
  mancante con la tavola delle orbite di `orbite.ts`. Se la pagina si riscrive, i due lavori si incrociano:
  farli in ordine sparso significa riscrivere due volte gli stessi paragrafi.

### Deciso, per non ridiscuterlo

- **Niente marcature FAQ.** Le domande frequenti vanno riempite di
  affermazioni, che è la merce che questo progetto non produce: la ragione sta
  già scritta per esteso nel commento sopra `strutturati` in `Meta.svelte`
  (righe 60-75).
- **I cappelli delle cinque sezioni restano come sono.** Allungarli metterebbe
  prosa fra chi arriva e il modulo che è venuto a compilare, e il guadagno
  sarebbe comunque il più piccolo dei tre.
- **Il payoff nel titolo non fa parte di questo lavoro.** Quello che
  dell'esame era rimasto in piedi, il titolo della home e uno `slogan` nei dati
  strutturati, è già fatto (`f7696e8`).

## 17. L'astrologia oraria

**Priorità bassa.** Le tavole di Lilly che presupponeva ci sono
(`dignita-lilly.ts`, punto 19), e il lotto A, le condizioni di un istante col
punteggio, è fatto (`condizioni-lilly.ts`). Il prossimo è il lotto B. Le
dignità, che l'oraria non può fare a meno di avere, sono una voce a sé perché
servono anche al natale e al Jyotisha. Qui resta ciò che è proprio delle
domande: il moto fino all'uscita dal segno, le regole di una scuola per
leggerlo.

### Deciso il 18 ottobre 2026

- **Le scuole sono pacchetti, e la prima è Lilly.** Il piano non è «Lilly più
  varianti»: è un substrato comune e neutro, con sopra le scuole, ciascuna
  intera, ciascuna nominata nel risultato. La prima versione ne implementa una
  sola, ma la struttura deve permettere di aggiungere le altre senza rifare
  niente (vedi *Le scuole che verranno*).
- **Il documento di lettura ha un registro attribuito.** L'oraria per natura
  risponde: «otterrò il lavoro?», «dov'è l'anello?». Gli altri due documenti di
  `packages/lettura` vietano le previsioni, e questo non può farlo senza perdere
  la ragione per cui esiste. La forma è «secondo il metodo di Lilly la figura
  indica…», con il metodo esposto e la lettura attribuita alla scuola, non
  affermata. Restano escluse come ovunque salute, morte, questioni legali e
  finanziarie: Lilly giudicava anche «il malato guarirà?», e quelle domande il
  documento le rifiuta dicendo perché.
- **Le dignità stanno nel punto 19.**

### Le fonti

Per Lilly: *Christian Astrology*, 1647, in `texts/occidentale/lilly-christian-astrology-1647`
(archive.org `b30338724`, pubblico dominio), con le pagine lette in
`pagine/` e le trascrizioni in `trascrizioni.md`. Nel PDF locale la pagina
stampata N è la N + 34, verificato fino a p. 180: `pdftoppm -f $((N+34)) -l
$((N+34)) -r 250 -jpeg -singlefile scansione.pdf pagine/pNNN`. Lette e
trascritte il 27 ottobre 2026 per il lotto A: pp. 33, 57-80, 90, 106,
113-115, 122, 177-180. Da leggere per i lotti che seguono: p. 91
(contrantiscion), pp. 121-123 per intero (le considerazioni), le altre
figure del libro II.

**I numeri si leggono sulla scansione, non sui siti.** L'edizione trascritta
che si trova in rete (Deborah Houlding, Skyscript) è protetta e non si
ricopia. Le cifre che le fonti secondarie davano in disaccordo ora sono lette:
combustione 8°30' nello stesso segno, raggi 17°, cazimi 17' (p. 113); la
tavola delle fortezze di p. 115, col domicilio a 5.

Le orbite per pianeta (*moieties*) **non** convergono, e Lilly ne dà due
colonne. *Christian Astrology* p. 107 (`pagine/p107.jpg`, trascritta):
colonna 1 Saturno 10°, Giove 12°, Marte 7°30', Sole 17°, Venere 8°, Mercurio
7°, Luna 12°30'; colonna 2 Saturno 9°, Giove 9°, Marte 7°, Sole 15°, Venere
7°, Mercurio 7°, Luna 12°. Lilly dice di usare l'una o l'altra «as my Memory
best Remembereth»; l'esempio di p. 107 usa la prima, quello di p. 110 la
seconda, con la regola della metà di ciascuno sommate. Il «Marte 8°» che
questa voce riportava è di al-Biruni (§436, trad. Wright 1934, in
`texts/occidentale/biruni-elements-of-astrology-wright-1934`), non di Lilly.
Implementarle vuol dire scegliere una colonna e dirla: la convenzione entra
in `NATAL_ORB_CONVENTIONS` (`packages/core/src/orbite.ts`) come una terza,
accanto a Greene e Leo, e `NatalOrbConvention` in `types.ts` prende il
nome nuovo. La firma `orbOf(aspect, a, b)` regge già un'orbita per pianeta:
la coppia è la somma delle due metà. Due cose vanno decise e scritte nella
`rule`, come fanno Greene e Leo per i corpi che non nominano: la tavola copre
solo i sette pianeti, e va detto che cosa valga per Urano, Nettuno, Plutone,
Chirone, i nodi e gli assi; e copre solo i cinque aspetti tolemaici (Lilly i
minori non li tratta, `trascrizioni.md` a p. 110), quindi `aspects` va
ristretto a quelli.

### Fatto: il lotto A, le condizioni di un istante

In `da88a36` (motore, CLI, test) e `cc80d1e` (interfaccia, MCP, lettura).
`packages/core/src/condizioni-lilly.ts` calcola per i sette pianeti casa
con la regola dei cinque gradi, rapporto col Sole, moto rispetto al moto
medio di Lilly, orientalità, partili, assedio, peregrino, le tre stelle,
l'antiscion, e il conto della tavola di p. 115 voce per voce con fortezze,
debilità e differenza (`LillyBodyConditions.score`); per l'istante, l'ora
planetaria (`planetaryHourAt`, estratta da `election.ts`), i gradi
dell'Ascendente e la Via Combusta. Sta in `WesternDignities.lilly.conditions`,
quindi nel tema natale con `dignitySchool: 'lilly'` e, nuovo, nel cielo
dell'istante con `SkyOptions.dignitySchool` (`computeSky`, e `--sky
--dignita lilly` nella CLI). Le stelle vengono da `sefstars.txt`, che
`ephe:download` scarica ora come file facoltativo; senza, `missing` lo dice.
Le letture fatte dove il testo lascia una scelta stanno in
`LILLY_CONDITIONS_READINGS` e viaggiano col risultato.

La verifica è la figura del 16 luglio 1634 (pp. 177-180), ricalcolata in
`test/condizioni-lilly.test.ts`. Venere, Marte e Saturno tornano riga per
riga; dove l'esempio non segue la tavola il test lo dice, e il motore segue
la tavola: Mercurio, Luna e Giove entro 17° dal Sole sono sotto i raggi
(Lilly scrive «Free from Combustion»), Giove orientale prende 2 che Lilly
non conta, il Sole diurno prende la triplicità che Lilly tace. Anche p. 113
si contraddice: il secondo esempio di combustione è a 10°, oltre la soglia
di 8°30' stampata accanto.

Resta, del lotto A:

- **le superfici del cielo con la scuola.** `/api/sky`, `compute_sky` e la
  pagina del cielo non hanno ancora `dignitySchool`: vanno col tool del
  lotto D, la cui descrizione deve distinguersi da `compute_sky`;
- **la Parte di Fortuna nel conto.** Lilly la conta a p. 180 («in ♍ hath
  five Debilities», rimando a p. 145): pagina da leggere;
- **la «stessa natura»** fra signore dell'ora e dell'Ascendente (p. 122):
  è la tavola delle qualità del libro I, caldo, freddo, secco, umido. Si
  calcola, ma è una considerazione, e va col lotto C.

### Il substrato comune: che cosa succede fino all'uscita dal segno

Le scuole divergono su come **classificare** quello che succede: traslazione e
collezione di luce, proibizione, refranazione. La tradizione araba e medievale
conta sei negazioni della perfezione (refranazione, evasione, proibizione,
abscissione, contrarietà, ritorno della luce), Lilly ne usa meno e con nomi
propri, e la «frustrazione» dei manuali moderni non coincide con nessuna delle
sei. Su **che cosa succede** invece non divergono, perché è moto.

Il substrato è quindi **la sequenza degli eventi di un corpo fino all'uscita dal
segno**: gli aspetti che perfeziona e con chi, le stazioni, l'ingresso, in
ordine e con l'istante. È un predicato puro, non sceglie nessuna scuola, e
`findSkyPassages`, `findStations` e `findSignIngresses` lo fanno già quasi
tutto: manca la composizione, ristretta all'arco che finisce col cambio di
segno. Si calcola per la Luna e per i significatori.

Da lì escono anche le Lune vuote, che sono più di una e vanno nominate.
Quella di `election.ts` ha il criterio moderno, l'ultimo aspetto **esatto**
prima del cambio di segno. Quella di Lilly (p. 112, già trascritta in
`trascrizioni.md`) è il pianeta «separato da un altro, che non applica a
nessun altro finché resta nel segno», e con le
*moieties* l'esito può cambiare. Sono due classificatori sulla stessa sequenza,
e il risultato dice quale ha usato.

Ogni scuola è un **classificatore nominato sopra la sequenza**: legge gli eventi
e dice «traslazione di luce secondo Lilly, p. …», con gli eventi che la
compongono accanto. Una scuola nuova è un classificatore nuovo, non un calcolo
nuovo.

### Che cosa entra e che cosa no

- **La casa del quesito è un input.** Quale casa riguardi una domanda dipende
  dalla domanda, e la sceglie chi la pone. Ma una volta dichiarata (anche come
  casa derivata: il coniuge del fratello è la settima dalla terza, cioè la
  nona) il motore calcola tutto rispetto ai due significatori, il signore
  dell'Ascendente e quello della casa del quesito. È una funzione verificabile
  dei suoi input, e l'uscita passa da dodici signori incrociati a una coppia.
  Senza la casa, il risultato porta le condizioni di tutti e la sequenza della
  Luna.
- **Le considerazioni prima del giudizio si calcolano come predicati, mai come
  rifiuto.** 0°-2° o 27°-29° all'Ascendente, Luna nella Via Combusta, Luna
  vuota, Saturno in prima o in settima, signore dell'Ascendente combusto.
  Lilly stesso le scavalca spesso, e il motore che «non giudica il tema»
  sarebbe il motore che giudica. Il fallimento resta parziale: una carta e un
  elenco di condizioni.
- **Il punteggio di Lilly entra come pacchetto intero**: le tavole del punto
  19, le condizioni di un istante, i suoi pesi, e ogni riga del conto accanto
  alla somma. Non si applica ai termini egizi o alle triplicità di Doroteo,
  perché quel conto Lilly non l'ha mai fatto.
- **Non entrano** il sì o no, la conversione dei gradi in giorni o mesi, la
  scelta della casa. Non sono regole di una scuola ma il giudizio stesso: li fa
  chi legge, e il documento di lettura dice come li faceva Lilly.
- **Da leggere sulla scansione prima di decidere**: la «stessa natura» fra
  signore dell'ora e dell'Ascendente (la stessa triplicità e lo stesso pianeta
  si calcolano già). Se Lilly intende le qualità del libro I, caldo e freddo,
  secco e umido, è una tavola e si calcola; se no resta fuori. Lo stesso vale
  per i «gradi tardi» della Luna, che nelle trascrizioni non hanno una soglia.

### Forma, in lotti

In quest'ordine (le tavole del punto 19 ci sono già): ogni lotto vale anche se
il successivo non si fa.

**Lotto A: le condizioni di un istante.** Fatto, vedi sopra; restano le tre
cose elencate lì.

**Lotto B: la sequenza degli eventi.** Il substrato neutro, e le due Lune vuote
come primi classificatori. Le *moieties* come terza convenzione di orbita.
È il lotto che regge tutto il resto, ed è il
meno dottrinale.

**Lotto C: la scuola di Lilly.** I modi della perfezione e del suo impedimento,
ciascuno con la definizione scritta nel commento e la pagina accanto; le
considerazioni prima del giudizio; i significatori a partire dalla casa del
quesito.

**Lotto D: le superfici.** Un tool MCP che dia il tema dell'istante con tutto
questo accanto e `date` omessa uguale ad adesso, come `compute_sky` (nome da
decidere vicino a quello, la cui descrizione va aggiornata perché un modello
non scelga il tool sbagliato); il documento di lettura `oraria` in
`packages/lettura`, col registro attribuito; un prompt MCP che li unisca, come
`lettura_del_tema`. Una pagina web solo dopo, e solo se le tabelle reggono da
sole.

Da B in poi conviene fermarsi a ogni lotto e chiedersi se continuare.

### Le scuole che verranno

Note, non pianificate. Ciascuna è un classificatore sul substrato del lotto B e
un pacchetto di tavole nel punto 19, ed è la prova che la struttura regge.

- **La linea araba e medievale**: Māshā'allāh e Sahl ibn Bishr, poi Bonatti
  (*Decem tractatus astronomiae*, Ratdolt 1491, col trattato sulle
  interrogazioni; scaricato in `texts/occidentale/bonatti-decem-tractatus-1491`,
  copia della Biblioteca Jagellonica: l'OCR dell'incunabolo è inutile e si
  legge sulle immagini). Termini egizi, le sei negazioni. Le traduzioni latine
  medievali sono di pubblico dominio, quelle inglesi moderne (Dykes) no.
- **Il prashna del Jyotisha.** Il *Prasna Marga* (Kerala, XVII secolo), e
  soprattutto l'oraria Krishnamurti Paddhati (KP), la più calcolabile di
  tutte: il consultante dà un numero da 1 a 249 che fissa il grado
  dell'Ascendente, e i sotto-signori si ricavano dalle proporzioni vimshottari
  che il motore ha già in `nakshatra.ts` e `dasha.ts`. Va verificato lo stato
  dei diritti sui libri di Krishnamurti; la regola si ricalcola dalla
  definizione e non chiede di ricopiarne il testo.

### Verifica

Le figure d'esempio del libro II portano data, ora e luogo, e Lilly scrive per
ciascuna le condizioni dei significatori e gli eventi che le legano. Sono
l'àncora esterna, come le cuspidi in `houses.test.ts`: ricalcolare la figura e
confrontare ciò che Lilly dichiara, scegliendo i casi lontani dai confini,
perché le sue effemeridi sbagliavano di qualche primo e un confine li
ribalta. Per il lotto B la verifica non chiede Lilly: una sequenza di eventi si
controlla con `findSkyPassages` sullo stesso arco.

## 19. Le dignità, per scuola

**Priorità bassa**, ora che il tropicale è fatto per intero. Viene dal punto
17, che ne ha bisogno, ma vale da sola: le dignità servono al natale letto
alla maniera tradizionale e al Jyotisha. Resta il Jyotisha (i varga) e le
scuole occidentali le cui fonti non sono ancora state lette.

### A che punto è

Fatto per il tema tropicale, in `2feb3be` e `ac7c553`.
`packages/core/src/dignita.ts` tiene domicili (tradizionali e moderni),
esilio, esaltazione e caduta, con le fonti e le pagine nei commenti;
`packages/core/test/dignita.test.ts` le prova contro le tavole delle fonti,
ricopiate indipendentemente. La sezione DIGNITÀ di `format.ts`
(`dignityLines`) porta le due colonne dei signori con le case e, in coda, una
riga per convenzione con chi è in domicilio, esaltazione, esilio o caduta.
`packages/lettura/src/tropicale.ts` manda lì il modello invece di fargliele
ricavare dal segno, e `lettura.test.ts` lo verifica.

Che cosa la sezione porta, e perché così:

- **domicili** in due colonne mai fuse. La tradizionale, dei sette pianeti, è
  comune alle scuole antiche; la moderna dà lo Scorpione a Plutone, l'Acquario
  a Urano, i Pesci a Nettuno, e dichiara di non avere un autore unico;
- **esilio** in tutte e due: il segno opposto al domicilio. Nella tradizionale
  ha una fonte, la colonna Detriment di Lilly; nella moderna è la stessa
  regola sull'altra tavola, e la riga lo dice. È così che Saturno in Leone è in
  esilio per una colonna e non per l'altra;
- **esaltazione e caduta** solo nella tradizionale, **per segno e senza
  gradi**: è la parte su cui Tolomeo, Firmico e Lilly concordano. I gradi e
  le esaltazioni dei Nodi vengono col pacchetto di Lilly. Per Urano, Nettuno
  e Plutone nessuna esaltazione ha un autore, e non entrano.

Fatto anche per il Jyotisha, in `15e79a3`. `packages/core/src/dignita-parashara.ts` tiene
uccha col grado più profondo, neecha nel settimo segno, moolatrikona e segno
proprio secondo il BPHS, e `computeJyotisha` le mette in `JyotishaChart.dignities`,
quindi nel JSON del tema vedico, non in `NatalChart`. La sezione DIGNITÀ
(PARASHARA) di `formatJyotishaCompact` porta la fonte, i signori dei segni, le
esaltazioni e una riga per graha. `packages/lettura/src/jyotisha.ts` manda lì
invece di ricopiare i domicili, e per il D9 dice che la forza si ricava per
segno da quella sezione e va detta come confronto, non come dignità calcolata.
Prove in `packages/core/test/dignita-parashara.test.ts` e in `lettura.test.ts`.

Una scelta di lettura, scritta nel commento a `TRATTI`: nei sette segni che
3.51-54 divide in tratti decide il tratto, anche contro 3.49 letto da solo.
La Luna a 10 del Toro è in moolatrikona e non in uccha, Mercurio a 18 della
Vergine pure. È il testo che precisa se stesso, non un'altra scuola.

Fatte anche le ricezioni, in `3349553`, nella stessa sezione del tema tropicale:
`receptionsOf` in `dignita.ts`, mutue e semplici fra i sette pianeti. La
definizione è di Lilly, p. 112 («in each others dignity», per domicilio,
triplicità, termine, faccia o «any essentiall dignity»), e a p. 176 il verbo
vale anche in un verso solo («single reception by exaltation»). Le pagine sono
in `texts/occidentale/lilly-christian-astrology-1647`, con la trascrizione.
Senza scuola le ricezioni sono per domicilio ed esaltazione; la riga della
fonte dice che le altre tre mancano, e il documento di lettura tropicale
vieta di dedurle. Con Lilly sono contate tutte e cinque (qui sotto).

Fatto anche il pacchetto di Lilly, in `c7ca93a`, `cbf5b83` e `193a5ee`.
`packages/core/src/dignita-lilly.ts` tiene la tavola di p. 104 per intero:
esaltazioni col grado e i Nodi (con le cadute della colonna Fall, il Sud nei
Gemelli e il Nord nel Sagittario), triplicità di giorno e di notte con l'acqua
a Marte, termini e facce; `lillyReceptionsOf` conta le ricezioni per tutte e
cinque le dignità, sugli esempi di Lilly a p. 112. La tavola è trascritta
riga per riga in `texts/occidentale/lilly-christian-astrology-1647/trascrizioni.md`,
con la lettura di p. 105 (che dice come si leggono le celle), e il test la
ricopia coi glifi della stampa (`packages/core/test/dignita-lilly.test.ts`).
Si accende con `ChartOptions.dignitySchool: 'lilly'` (`types.ts:782`, letto
in `chart.ts`) e con `--dignita lilly` nella CLI, solo sul tema natale
tropicale: la sezione DIGNITÀ aggiunge, sotto le righe comuni,
una riga per corpo con i signori del suo grado e le sue dignità, e le
ricezioni diventano quelle di tutta la tavola. `packages/lettura/src/tropicale.ts`
dice al modello di usarle solo se la riga di Lilly c'è.

Due scelte, scritte nei commenti: l'esaltazione vale per tutto il segno e il
grado è un dato a parte («in these Signes the Planets have their
Exaltations»); senza l'ora la triplicità c'è solo nell'acqua, dove il
reggente è lo stesso di giorno e di notte.

In calce alla tavola Lilly stampa i punti: 4 l'esaltazione, 3 la triplicità,
2 il termine, 1 la faccia, 5 l'esilio, 4 la caduta. Sotto la colonna dei
domicili il numero è illeggibile; la tavola delle fortezze di p. 115 dà 5.
Il punteggio, col peregrino di p. 112, è in `condizioni-lilly.ts` (voce 17,
lotto A).

Fatte anche le superfici, in `510d777` e `8622c05`. Le dignità occidentali
stanno in `NatalChart.dignities` (`dignita-tema.ts`), **solo nello zodiaco
tropicale**: nel siderale, che è anche la carta che il Jyotisha riusa,
mancano dal JSON e dalla tabella, e chiedere Lilly lì è `ZODIACO_NON_TROPICALE`.
È un cambiamento: prima la tabella compatta del tema siderale portava la
sezione DIGNITÀ coi domicili occidentali, e ora no. Il pacchetto di Lilly si
chiede nel calcolo (`ChartOptions.dignitySchool`), non nel formato: la tabella
compatta impagina il JSON e non ricalcola, e i test che confrontavano le due
rese non tolgono più la sezione. Le ricezioni portano `counted`, come la
distribuzione. Superfici: `--dignita lilly` (anche con `--json`),
`dignitySchool=lilly` su `/api/chart`, `dignity_school` su
`compute_natal_chart`, la casella «Dignità di Lilly» e `DignityTable.svelte`
nella pagina del tema. Il compatto ora pesa circa il 25% del JSON, e le
descrizioni dicono «circa un quarto».

### Che cosa resta

1. **Le dignità nei varga del Jyotisha**, che il BPHS tratta a parte (cap.
   6-7), e la pagina `/vedica`, che non mostra le dignità di Parashara anche
   se il JSON le porta. I dati: `JyotishaChart.dignities` (`types.ts:649`),
   riempito da `computeParasharaDignities` (`jyotisha.ts:89`) ed esposto su
   `/api/jyotish`; in `apps/web/src/routes/vedica/+page.svelte` non c'è
   niente che le mostri, e non esiste un componente per loro (quello
   occidentale è `DignityTable.svelte`, legato a `WesternDignities`). I varga
   portano solo segni (`VargaChart`, `types.ts:369`). Il materiale già letto:
   la nota di Santhanam a p. 90 e 7.13-19 (pp. 91-95), trascritti in
   `bphs-santhanam-1992-vol1/trascrizioni.md` per il D-2; il resto del cap. 7
   comincia alla riga 6005 dell'`ocr.txt`. Il D-2 di Parashara non ha un
   segno, quindi la dignità nella hora va definita col signore (vedi voce
   5).
2. **Le altre scuole occidentali**, quando le loro fonti sono state lette
   (vedi *Da verificare* qui sotto): ciascuna come valore nuovo di
   `DignitySchool`, intera. Il compilatore pretende il nome in
   `DIGNITY_SCHOOL_NAMES` (`packages/core/src/constants.ts`), e da lì CLI,
   MCP e `/api/chart` imparano il valore da soli, ma solo a validarlo: il
   risultato porta ancora un campo per scuola (`WesternDignities.lilly`,
   `types.ts:568`), e una scuola nuova chiede il suo campo, il suo ramo in
   `computeWesternDignities` (`dignita-tema.ts:58`), le sue righe in
   `format.ts` (come `lillyLines`, :670) e in `DignityTable.svelte`, e i
   testi che oggi nominano solo Lilly: l'aiuto di `--dignita` (`cli.ts:123`),
   la descrizione di `dignity_school` (`packages/mcp/src/tools.ts:308`) e il
   commento di `apps/web/src/routes/api/chart/+server.ts:26-28`.
   L'interfaccia è una casella sola, `lilly` in `ChartSettings.svelte` e in
   `routes/+page.svelte`, e con due scuole diventa una scelta da disegnare.

### Le scuole, e il default deciso il 18 ottobre 2026

Per il tema tropicale le scuole possibili sono cinque, ciascuna come pacchetto:

| | Domicili | Esaltazioni | Triplicità | Termini | Facce | Punteggio | Fonte primaria |
|---|---|---|---|---|---|---|---|
| Ellenistica (Doroteo, Valente) | tradizionali | da verificare: Valente I.2 non ha la tavola | tre reggenti, uno partecipe | egizi | sì | nessuno | Doroteo sopravvive in arabo, e la traduzione di Pingree è protetta; Valente in greco è libero |
| Tolomeo, *Tetrabiblos* | tradizionali | per segno, senza gradi (I.19) | due reggenti, acqua da verificare | tolemaici | da verificare | nessuno | greco e Ashmand (1822) liberi |
| Medievale araba (Abū Maʿshar, al-Bīrūnī, Bonatti) | tradizionali | col grado | doroteiche | egizi | caldee | 5-4-3-2-1, almuten | Bonatti latino (1491) libero |
| Lilly, 1647 | tradizionali | col grado, e i Nodi | due reggenti, Marte sull'acqua | tolemaici, nella sua versione | caldee | p. 104: esaltazione 4, triplicità 3, termine 2, faccia 1, esilio 5, caduta 4; domicilio illeggibile; peregrino definito a p. 112; tavola delle fortezze a p. 115, letta, domicilio 5 | scansioni libere; tavole lette il 27 ottobre 2026 |
| Moderna, XX secolo | con Urano, Nettuno, Plutone | segni, i pianeti esterni senza autore | nessuna | nessuno | decani per triplicità (Alan Leo) | nessuno | senza un autore unico |

Le righe medievale e moderna, fuori da quanto verificato qui sotto, vengono
da fonti secondarie e vanno lette sulle primarie prima di diventare tavole.
La riga di Lilly è stata letta sulla scansione, punti in calce compresi
(tranne quello del domicilio, illeggibile); la tavola delle fortezze di p.
115 no.

Il default nel tema tropicale sono **due colonne affiancate, mai mescolate**,
ed è quello che la sezione DIGNITÀ porta oggi:

- **i domicili tradizionali con esaltazione, esilio e caduta**, dichiarati come
  la parte comune alle scuole occidentali antiche;
- **i domicili moderni**, attribuiti alla convenzione del Novecento, che un
  autore unico non ce l'ha. Il progetto ha già scelto quella convenzione
  mettendo Plutone nel tema: qui la si dichiara.

Triplicità, termini e facce **non compaiono per default**: si chiedono
nominando la scuola. La prima disponibile è Lilly, che l'oraria richiede
comunque; le altre entrano quando le loro fonti sono state lette. Il
punteggio c'è per Lilly, in `condizioni-lilly.ts`; una scuola nuova porta il
suo, o nessuno.
Nel Jyotisha la scelta è più semplice, perché Parashara è il riferimento che i
documenti di lettura già presuppongono.

### Le fonti: verificato e da verificare

Verificato sulle scansioni il 18 ottobre 2026, e scritto nei commenti di
`dignita.ts` (il BPHS il 26 ottobre, in `dignita-parashara.ts`; la tavola
intera di Lilly il 27 ottobre, in `dignita-lilly.ts`):

- **Domicili.** Tolomeo I.17 (ed. Robbins, Loeb 1940, pp. 79-83, su
  LacusCurtius) e Lilly, *Christian Astrology* (1647), p. 104 (archive.org,
  `b30338724`) coincidono. Valente I.2 (ed. Kroll 1908, pp. 5-13) scrive
  «οἶκος» per nove segni, concordi; per Toro, Acquario e Pesci no. La copia
  letta allora non è annotata: che sia la stessa scansione di
  `valente-anthologiae-kroll-1908` va verificato (voce 24), e la cartella
  non ha ancora né `pagine/` né `trascrizioni.md`.
- **Domicili moderni.** Alan Leo, *The Art of Synthesis* (1912), p. 117,
  riferisce Urano all'Acquario e Nettuno ai Pesci come un uso, senza esserne
  il primo: Urano all'Acquario circolava già nell'Ottocento (Varley 1828,
  secondo Skyscript, pagina non vista). Per Plutone allo Scorpione nessun
  autore; C. C. Zain (1942) lo usa dichiarandolo solo il più diffuso.
- **Esaltazioni.** Tolomeo I.19 (Loeb pp. 89-91) dà i segni e nessun grado, e
  scrive lui le cadute («depression») nel segno opposto. Firmico, *Mathesis*
  II.3.5-6 (ed. Kroll-Skutsch I, 1897, p. 44, rr. 7-17) dà i gradi, con la
  caduta allo stesso grado del segno opposto; Lilly p. 104 dà gli stessi gradi
  e in più il Nodo Nord a 3° Gemelli e il Sud a 3° Sagittario (glifo stampato
  male). I gradi sono quindi della tradizione da Firmico a Lilly, non di
  Tolomeo, anche se Lilly intitola la tavola «according to Ptolomy». Valente
  I.2 una tavola delle esaltazioni non ce l'ha.
- **Ricezioni.** Lilly p. 112 (immagine n145) la definisce mutua, «in each
  others dignity», per qualunque dignità essenziale; p. 176 (n209) usa la
  ricezione in un verso solo. Trascritte in `texts/`.
- **La tavola di Lilly per intero**, pp. 104-105 (immagini n137 e n138):
  esaltazioni col grado e i Nodi, cadute della colonna Fall (Nodi compresi),
  triplicità, termini e facce, più i punti in calce. Letta a piena
  risoluzione e trascritta riga per riga in `trascrizioni.md`; p. 105 dice
  come si leggono le celle e dà Marte sull'acqua di giorno e di notte
  «according to Ptolomy and Naibod».
- **Esilio.** La colonna Detriment di Lilly p. 104 nomina, segno per segno, il
  signore del segno opposto; la colonna Fall coincide con Tolomeo per i sette
  pianeti. Sulla scansione l'immagine è la n137 contando da zero
  (`archive.org/download/b30338724/page/n137_w2000.jpg`).
- **BPHS, per il Jyotisha.** Santhanam, vol. I (Ranjan, 1992), su
  archive.org (`heag_brihat-parasara-hora-sastra-vol-1-…`): 3.49-50 a pp.
  38-39 (immagini n42 e n43 contando da zero), 3.51-54 a p. 39, i signori dei
  segni in 4.6-24 a pp. 50-53, letti sull'OCR e la p. 50 anche a vista
  (immagini in `pagine/`). I numeri
  combaciano anche col sanscrito stampato accanto. La scansione porta la
  dicitura «CC-0. In Public Domain. Gurukul Kangri Collection», ma vale per la
  copia digitale e non dice niente dei diritti sulla traduzione: se ne
  prendono i valori, non il testo.

Da verificare:

- **Bonatti**, per domicili ed esaltazioni: non è stato letto. L'edizione
  Ratdolt 1491 è in `texts/occidentale/bonatti-decem-tractatus-1491`, e l'OCR
  dell'incunabolo non serve: si legge sulle immagini. Non c'è ancora una
  mappa dei fogli: quali contengano domicili ed esaltazioni va trovato
  sfogliando, e scritto nella `FONTE.md`. Un'altra copia, senza
  OCR, è `ita-bnc-in1-00000968-001` (Biblioteca Nazionale Centrale di
  Firenze); quella della Bayerische Staatsbibliothek non si è trovata.
- **Le esaltazioni nella scuola ellenistica**: altrove in Valente, o in Doroteo.
- **La triplicità d'acqua in Tolomeo.** Una fonte gli attribuisce Marte di
  giorno e di notte come Lilly, un'altra un reggente diverso per setta. Lilly
  a p. 105 dice «according to Ptolomy and Naibod», che è un indizio e non
  Tolomeo letto. I.18 si legge senza scaricare niente: Robbins e Ashmand sono
  già in `texts/occidentale/tolomeo-tetrabiblos-*` (Ashmand traduce la
  parafrasi di Proclo: vale come confronto, Robbins come testo; in Robbins il
  libro I sta in `html/1A`, `html/1B` e `testo/`).
- **Le facce in Tolomeo**, nelle stesse due edizioni.
- **I punti 5-4-3-2-1 medievali**: a chi vanno attribuiti. I siti li danno
  come «medievali» senza un testo.
- **Per il Jyotisha**: una fonte per l'esaltazione dei Nodi, se c'è.
  Santhanam in nota a 3.50 rimanda alla sua traduzione dello *Horasara*,
  p. 20, che su archive.org non si è trovata (`texts/INDICE.md`, «Non
  libere»). C'è un'altra traduzione, Subrahmanya Sastri (1949), in
  `texts/jyotisha/horasara-subrahmanya-sastri-1949`: la pagina citata da
  Santhanam lì non vale, i diritti vanno trattati come protetti, e per i
  nodi non è ancora stata letta (lo è solo per il D-2, 2.2 e 8.11; vedi la
  sua `FONTE.md`). Finché non c'è, i nodi restano senza.

### Verifica

Le tavole contro la fonte, segno per segno e scuola per scuola: è una prova a
tabella e non chiede effemeridi, come in `dignita.test.ts`,
`dignita-parashara.test.ts` e `dignita-lilly.test.ts`. L'ultimo ricopia le
righe della tavola coi glifi della stampa e le rilegge: è il modello per una
scuola nuova.

## 24. Le fonti già usate che non stanno ancora in `texts/`

**Priorità bassa.** Le regole sono in `CLAUDE.md` (*Le fonti testuali*),
l'elenco in `texts/INDICE.md`. Le fonti citate nel codice prima che la
cartella esistesse sono quasi tutte scaricate; restano queste, una per riga,
ciascuna con la pagina da salvare in `pagine/` e da trascrivere:

- **Firmico, *Mathesis*, ed. Kroll-Skutsch, vol. I (1897)**, p. 44, rr.
  7-17: i gradi delle esaltazioni in `dignita.ts`. archive.org
  `matheseoslibrivi01firmuoft`, in `occidentale/firmico-mathesis-kroll-skutsch-1897`.
- **Alan Leo, *The Art of Synthesis*, 3ª ed. (1912)**, p. 117: Urano e
  Nettuno in `dignita.ts`. La 1912 su archive.org non si è trovata (ci sono
  la 1926, `artofsynthesis00leoa`, e la 1936): va cercata su HathiTrust o
  Google Books, e se si trova solo un'altra edizione la pagina va
  ricontrollata e il commento corretto.
- **RadixPro, l'esempio di Jan Kampherbeek** (Enschede, 2 novembre 2016,
  21:17:30 UT): la pagina web con le cifre intermedie su cui sta
  `houses.test.ts`. In `tecnica/radixpro-esempio-case`, `html/` e `testo/`.
- **Astrolog 8.00, i sorgenti**, almeno `matrix.cpp` e `calc.cpp`: l'altra
  metà dell'ancoraggio di `houses.test.ts`. La cartella c'è già,
  `tecnica/astrolog-pullen-800`, creata per le orbite con `astrolog.as`,
  `data.cpp` e `general.cpp` del commit `5bf172e`: i due file vanno presi
  dallo stesso commit e aggiunti a `sorgenti/`, e la riga «da scaricare» di
  `texts/INDICE.md` va tolta.
- **Valente, I.2, pp. 5-13**: lo scan c'è (`valente-anthologiae-kroll-1908`,
  archive.org `bub_gb_OQ_gAAAAMAAJ`), e per questo `texts/INDICE.md` lo dà
  fra le scaricate; mancano però la cartella `pagine/` con le immagini delle
  pagine e la conferma che sia la stessa copia letta per `dignita.ts`. La
  verifica qui sotto non lo vede: va controllato a mano.

Non si scaricano, perché protette: Meeus (`time.ts`), Dean e Munkasey
(attraverso RadixPro), Zain. Stanno in `texts/INDICE.md` con lo stato.

Verifica: ogni fonte citata in un commento di `packages/` ha una riga in
`texts/INDICE.md` che non sia «da scaricare».

## Deciso, e da non riaprire

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
  predefinita di Astrodienst) per il tema e il cielo, con Leo (1928) in
  alternativa; Hand, 1°, per transiti, passaggi e incontri in cielo, l'unica
  tavola dei transiti con un autore. Deciso il 27 ottobre 2026 con la voce
  18, scegliendo come predefinita la più diffusa. Le orbite senza autore che
  c'erano prima (8/7/5 con +2° ai luminari; 2/1,5/1 nei transiti) sono
  uscite: erano un ibrido di Leo e Astrolog.
- **Il D-2 si fa con più convenzioni nominate, Parashara predefinita.** Hora
  del Sole e della Luna come nei testi, e Leone-Cancro accanto, dichiarata
  come lettura corrente senza un classico che la enunci. Scelto dal
  proprietario il 27 ottobre 2026 fra quattro strade; il resto sta nella
  voce 5.
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
