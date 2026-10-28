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

Le fonti citate qui stanno in copia locale in `texts/`, fuori dal repo: la
cartella, le schede `FONTE.md` e l'elenco `texts/INDICE.md` si mantengono come
dice `CLAUDE.md` (*Le fonti testuali*). In una sessione nuova `texts/` può non
esserci, se il clone è un altro: le schede dicono da dove riscaricare ogni
fonte, e la voce 24 quelle che mancano ancora.

I riferimenti `file:riga` e i nomi citati sono stati ricontrollati tutti
contro il codice il 28 ottobre 2026, dopo il lotto A della voce 5 (`78c83ef`).
Le righe si spostano: se una non torna, il nome della funzione o della
costante accanto è quello che fa fede.

Prima di cominciare conviene che `npm test`, `npm run typecheck` e `npm run
lint` siano verdi. Tre cose che fanno perdere tempo:

- se il typecheck di `apps/web` cade su `config.kit.paths.origin`,
  `node_modules` è indietro rispetto al lockfile e serve un `npm install`;
- `apps/web` e `packages/mcp` vedono `core` compilato, non i sorgenti: dopo
  un export nuovo serve `npm run build -w @dodicisegni/core`, e il server di
  sviluppo di Vite va riavviato, o risponde 500 dicendo che l'export non c'è;
- i test che leggono le stelle fisse vogliono `packages/core/ephe/sefstars.txt`,
  che `npm run ephe:download -w @dodicisegni/core` scarica (133 KB); senza,
  vengono saltati e non falliscono.

In fondo ci sono due elenchi che non sono lavoro: le decisioni prese, da non
riaprire, e le cose esaminate e lasciate stare, per non ritrovarle una seconda
volta e ricominciare da capo.

## Da dove ripartire

| Voce | Priorità | Taglia | Prima di cominciare |
|---|---|---|---|
| 5. I varga che mancano | non dichiarata | due lotti | lotto B: confermare le tre regole sulle immagini; lotto C: far scegliere la lettura del D-60 |
| 19. Le dignità, per scuola | bassa | media | il Jyotisha: i varga del BPHS, cap. 6-7 |
| 17. L'astrologia oraria | bassa | piccola, ormai | i quattro lotti sono fatti; restano rifiniture indipendenti, una per riga |
| 24. Le fonti da scaricare in `texts/` | bassa | piccola | niente |

L'ordine consigliato è quello della tabella. Il lotto B della 5 è pronto da
fare; il C ha una scelta da far prendere al proprietario prima di scrivere
codice (la lettura del D-60, vedi lì). Della 19 resta soprattutto il Jyotisha,
che sta accanto ai varga della 5: il D-2 di Parashara, fatto senza segni,
cambia anche il modo di dire la dignità nella hora. La 17 usa le tavole di
Lilly della 19 e ha già le *moieties* come terza convenzione delle orbite.

## 5. I sei varga che mancano

Calcolati: D-1, D-2, D-3, D-4, D-7, D-9, D-10, D-12, D-27, D-30, in
`packages/core/src/varga.ts` (il D-2 con le sue convenzioni in `hora.ts`).
Dei sedici classici ne restano sei, nei lotti B e C.

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
aggiunto lì a mano col suo nome. Fa cadere anche
`apps/web/src/routes/(informativa)/metodo/jyotisha.test.ts`, che confronta
con `VARGAS` sigla, nome e parti della tavola di `/metodo/varga`: la riga
nuova va scritta lì, con la regola in parole.

Restano da aggiornare a mano i testi che li elencano, che nessun test vede: il
commento delle due rotte (`api/jyotish/+server.ts`, parametro `vargas`;
`quadro/+server.ts`, parametro `varga`), l'aiuto della CLI
(`--varga <lista>`, `packages/core/src/cli.ts:119`), il rimando in
`/metodo` («Il sito ne calcola dieci», voce `#varga` dell'elenco,
`apps/web/src/routes/(informativa)/metodo/+page.svelte:366`), la pagina
`/metodo/varga` («I dieci che il sito calcola», «Le altre sei divisioni
classiche non sono ancora calcolate», e la frase sotto che elenca le forme
delle regole) e la sua descrizione in `Meta`, che elenca le sigle; nel
glossario la voce `#varga` di `/glossario/jyotisha` cita D-9, D-10 e D-30 come
esempi e non va toccata. I tipi, in `packages/core/src/types.ts`: `VargaId` a
:359, `SignVargaChart` a :406, l'opzione `vargas` di `JyotishaOptions` a
:775. Il commento sopra `VargaId` conta i varga («Dieci dei sedici»).

### Lotto A, fatto il 28 ottobre 2026

D-4 e D-7 in `097ae59`, letti sulle pp. 70-71 e provati contro le due tavole
di Santhanam; il D-2 in `a828b3f`. Del D-2 vale la pena ricordare la forma,
perché è la sola eccezione alla regola «un varga dà un segno»:

- `VargaChart` è un'unione con il discriminante `kind`: `SignVargaChart`
  (`'segni'`, tutti i varga) e `HoraVargaChart` (`'signori'`, il solo D-2 di
  Parashara, con `hora: 'sole' | 'luna'` al posto del segno). Il D-2 porta
  anche `convention`, con il nome e la fonte.
- Il quadro disegna solo `SignVargaChart`: un D-2 di Parashara è rifiutato
  con `VARGA_SENZA_SEGNI` dalla CLI, da `/api/jyotish/quadro` e da
  `draw_jyotisha_chart`, che dicono di chiedere `leone-cancro`.
- Una convenzione nuova della hora (la parivritti-dvaya, la Kashinatha, la
  Uma-Shambhu, quella di Raman Suprajarama; regole e casi di controllo nelle
  schede `FONTE.md` di `texts/jyotisha/narasimha-rao-*`, `suprajarama-*` e
  `texts/tecnica/pyjhora`) è una voce di `HORA_CONVENTIONS` con `signOf`, se
  dà un segno fisso per luminare. Quelle che danno un segno diverso per segno
  di partenza (la Kashinatha, la parivritti-dvaya) non stanno in `signOf`:
  vogliono una funzione al suo posto. Le liste di CLI, API e MCP derivano da
  `HORA_CONVENTIONS`; il menù di `JyotishaSettings.svelte` no, ed è scritto
  a mano.

### Lotto B: i multipli con partenza fissa

**D-16 Shodasamsa, D-20 Vimsamsa, D-24 Siddhamsa (Chaturvimsamsa).** Qui il
segno da cui si comincia non è il segno stesso: è uno di pochi segni fissi,
scelto dalla modalità o dalla parità del segno di partenza, e da lì si conta
di seguito. È il meccanismo del D-9 (che parte da Ariete, Capricorno,
Bilancia o Cancro), applicato a divisioni più fini, quindi `signIndex` ha la
stessa forma.

Le regole, lette sull'OCR il 28 ottobre 2026 e **da confermare sulle
immagini** prima di scriverle nel codice (pp. 74-78, da estrarre come detto
sotto), con le tavole di Santhanam da controllare contro la regola:

- **D-16** (6.16, pp. 74-75): sedici parti da 1°52'30"; dall'Ariete per i
  segni cardinali («movable»), dal Leone per i fissi, dal Sagittario per i
  mobili («dual»). Il resto del verso riguarda le divinità, che si
  rovesciano nei segni pari: i segni no.
- **D-20** (6.17-21, p. 76): venti parti da 1°30'; dall'Ariete per i
  cardinali, dal Sagittario per i fissi, dal Leone per i mobili. Attenzione:
  fissi e mobili sono **scambiati** rispetto al D-16.
- **D-24** (6.22-23, pp. 77-78): ventiquattro parti da 1°15'; dal Leone nei
  segni dispari, dal Cancro nei pari.

Il D-27, che stava qui, è fatto: BPHS 6.24-26, pp. 78-79, trascritto in
`texts/jyotisha/bphs-santhanam-1992-vol1/trascrizioni.md`. La voce lo
descriveva male in due punti, e vale la pena ricordarlo per gli altri del
lotto: 1°6'40" è un quarto di pada, non un pada; e non si riparte
dall'Ariete in ogni segno, si conta di seguito dall'Ariete lungo tutto lo
zodiaco (fuoco dall'Ariete, terra dal Cancro, aria dalla Bilancia, acqua
dal Capricorno). La tavola di Santhanam a p. 79 ha un refuso (Gemelli,
undicesima parte): le tavole stampate vanno controllate contro la regola,
non copiate. Il modello di prova è `controllaTavola` in
`packages/core/test/varga.test.ts`, usato per D-4 e D-7.

### Lotto C: i fini, che vogliono un'ora di nascita esatta

**D-40 Khavedamsa, D-45 Akshavedamsa, D-60 Shashtiamsa.**

Le regole:

- **D-40** (6.29-30, p. 80, letto sull'immagine): quaranta parti da 45';
  dall'Ariete nei segni dispari, dalla Bilancia nei pari.
- **D-45** (6.31-32, pp. 81-82, dall'OCR): quarantacinque parti da 40';
  dall'Ariete per i cardinali, dal Leone per i fissi, dal Sagittario per i
  mobili (la forma del D-16).
- **D-60** (6.33-41, pp. 83-86, dall'OCR): sessanta parti da 30'. Il verso
  dice di ignorare il segno, raddoppiare i gradi percorsi, dividere per 12 e
  aggiungere 1 al resto. **Da dove si conta quel numero è la divergenza da
  decidere**: Santhanam, nell'esempio di p. 84 (Venere a 13°25' del
  Capricorno: 26 diviso 12 dà resto 2, più 1 fa 3), conta dal segno stesso e
  arriva ai Pesci. Il verso letto da solo («ignore the sign position») si
  presta anche a contare dall'Ariete, che darebbe i Gemelli: se qualcuno lo
  legge così, con un nome e un testo, va trovato; finora non è stato
  cercato. Va letta l'immagine, e la scelta presentata al proprietario come
  per il D-2: una convenzione predefinita e, se l'altra ha un autore,
  accanto. I sessanta nomi (Ghora, Rakshasa…) si
  rovesciano nei segni pari e sono qualità, benefiche o malefiche: entrano
  solo come nome, se entrano, e mai col giudizio accanto.

Il D-60 è, in Parashara, il più importante di tutti, e insieme quello che il
motore può garantire di meno: una divisione dura **30 primi d'arco**, che
l'Ascendente percorre in due minuti di orologio. Un'ora di nascita arrotondata
al quarto d'ora produce un D-60 sbagliato, e non se ne accorge nessuno.

Questo lotto vuole quindi una cosa che gli altri non chiedono: **un'avvertenza
propria**, sul modello di quelle delle dasha (l'array `warnings` in
`dasha.ts:99-121`, per l'ora ignota e per Moshier), che dica quanti
minuti di scarto valgano una divisione. Senza, sarebbe il caso peggiore di
tutti: un dato che sembra preciso perché ha molte cifre.

Fonte: BPHS cap. 6-7, nella traduzione di Santhanam, vol. I, che sta in
`texts/jyotisha/bphs-santhanam-1992-vol1`. Il cap. 6 comincia a riga 4370
dell'`ocr.txt`. Dove comincia la regola di ciascun varga, con la pagina
stampata ricavata dalle intestazioni dell'OCR, da confermare sull'immagine.
La pagina stampata p è la pagina p + 5 del PDF locale: `pdftoppm -f $((p+5))
-l $((p+5)) -r 150 -jpeg -singlefile scansione.pdf pagine/p0NN`.

| Varga | Versi | Riga dell'OCR | Pagina circa | Stato |
|---|---|---|---|---|
| D-2 Hora | 6.5-6 | 4472 | 68-69 | fatto, `hora.ts` |
| D-3 Drekkana | 6.7-8 | 4521 | 69-70 | fatto, p. 69 in `varga.ts` |
| D-4 Chaturthamsa | 6.9 | 4582 | 70-71 | fatto, p. 70 |
| D-7 Saptamsa | 6.10-11 | 4637 | 71 | fatto, p. 71 |
| D-9 Navamsa | 6.12 | 4689 | 72 | fatto, p. 72 |
| D-10 Dasamsa | 6.13-14 | 4742 | 73 | fatto, p. 73 |
| D-16 Shodasamsa | 6.16 | 4847 | 74-75 | lotto B |
| D-20 Vimsamsa | 6.17-21 | 4939 | 76 | lotto B |
| D-24 Siddhamsa (Chaturvimsamsa) | 6.22-23 | 5053 | 77-78 | lotto B |
| D-27 Bhamsa | 6.24-26 | 5108 | 78-79 | fatto, p. 79 in `varga.ts` |
| D-30 Trimsamsa | 6.27-28 | 5181 | 80 | fatto, p. 80 |
| D-40 Khavedamsa (Chatvarimsamsa) | 6.29-30 | 5210 | 80-81 | lotto C |
| D-45 Akshavedamsa | 6.31-32 | 5269 | 81-82 | lotto C |
| D-60 Shashtiamsa | 6.33-41 | 5437 | 83-86 | lotto C |

Il D-12 Dwadasamsa (6.15) sta a p. 73, fra le righe 4742 e 4847. Poi i
gruppi di varga (riga 5884) e il cap. 7 da 6005, con gli usi a 6061-6112.
Tutti i varga calcolati portano ora il verso nella regola e la pagina nel
commento, letti sulle immagini (`trascrizioni.md`, sezione «6.7-15»).

Verifica per tutti i lotti: `packages/core/test/varga.test.ts` ha già la forma:
confini noti calcolati a mano per un segno pari e uno dispari, più la prova
che la regola viaggi col risultato.

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
- la Luna può proibire come ogni altro pianeta;
- traslazione e collezione si riconoscono anche senza la ricezione di p. 126,
  che è riportata e la cui mancanza è detta.

### Che cosa resta

Ciascuna indipendente dalle altre.

- **La pagina web.** «Solo se le tabelle reggono da sole»: la resa compatta
  regge, ma l'interfaccia non ha un modulo per la domanda, e la casa va scelta
  da un elenco che spieghi le dodici case (la descrizione di `compute_horary`
  ne nomina sei, ed è un punto di partenza). La rotta c'è già.
- **Le condizioni di qualità della perfezione**, p. 125: per il quadrato
  «each Planet have dignity», per l'opposizione la mutua ricezione per
  domicilio, e «out of good Houses». I dati sono tutti nel risultato
  (`chart.dignities.lilly`); il classificatore non li incrocia ancora, e il
  documento di lettura li chiede al lettore.
- **La Parte di Fortuna nel conto.** Lilly la conta a p. 180 («in ♍ hath five
  Debilities», con rimando a p. 145, da leggere). `condizioni-lilly.ts` conta
  solo i sette.
- **Chi applica a chi nel corso dei pianeti lenti.** Il corso di Saturno elenca
  anche i passaggi della Luna su di lui, che sono applicazioni della Luna.
  `classifyLilly` lo risolve col peso (`peso`, ordine caldeo); il corso no, e
  `bodies` serve a restringerlo.
- **La Luna come proibitore.** Perfeziona con tutti ogni pochi giorni: su
  figure reali potrebbe dare proibizioni ovunque. Se succede, è il primo posto
  da guardare, con la lettura scritta in `HORARY_LILLY_READINGS`.
- **Il cielo con la scuola sulle superfici**: `computeSky` ha
  `dignitySchool`, ma `/api/sky` e `compute_sky` no. Con `compute_horary`
  forse non servono più; deciderlo prima di farlo.
- **Il corso come superficie a sé**: `findSignCourse` arriva agli agenti solo
  dentro `compute_horary`. Un tool suo servirebbe a chi chiede «la Luna è
  vuota di corso?» senza una domanda oraria; `find_election_hours` risponde già
  col criterio moderno.
- **Altre figure del libro II** per la verifica: finora solo quella del 1634.
  Ogni figura porta data, ora e luogo; vanno scelti casi lontani dai confini,
  perché le effemeridi di Lilly sbagliano di qualche primo.

### Deciso

Il 18 ottobre 2026:

- **Le scuole sono pacchetti, e la prima è Lilly.** Un substrato neutro, il
  corso di `corso.ts`, con sopra le scuole, ciascuna intera e nominata nel
  risultato. Una scuola nuova è un file accanto a `oraria-lilly.ts`, non una
  modifica.
- **Il documento di lettura ha un registro attribuito**: «secondo il metodo di
  Lilly la figura indica…». È l'unico che risponde; salute, morte, questioni
  legali e finanziarie le rifiuta dicendo perché.
- **Le dignità stanno nel punto 19.**

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
un pacchetto di tavole nel punto 19.

- **La linea araba e medievale**: Māshā'allāh e Sahl ibn Bishr, poi Bonatti
  (*Decem tractatus astronomiae*, Ratdolt 1491, col trattato sulle
  interrogazioni; scaricato in `texts/occidentale/bonatti-decem-tractatus-1491`,
  copia della Biblioteca Jagellonica: l'OCR dell'incunabolo è inutile e si
  legge sulle immagini). Termini egizi, le sei negazioni della perfezione
  (refranazione, evasione, proibizione, abscissione, contrarietà, ritorno della
  luce), che non coincidono coi nomi di Lilly. Le traduzioni latine medievali
  sono di pubblico dominio, quelle inglesi moderne (Dykes) no.
- **Il prashna del Jyotisha.** Il *Prasna Marga* (Kerala, XVII secolo), e
  soprattutto la Krishnamurti Paddhati (KP), la più calcolabile: il
  consultante dà un numero da 1 a 249 che fissa il grado dell'Ascendente, e i
  sotto-signori si ricavano dalle proporzioni vimshottari che il motore ha già
  in `nakshatra.ts` e `dasha.ts`. Va verificato lo stato dei diritti sui libri
  di Krishnamurti; la regola si ricalcola dalla definizione.

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
Si accende con `ChartOptions.dignitySchool: 'lilly'` (`types.ts:962`, letto
in `chart.ts`), con `SkyOptions.dignitySchool` (`types.ts:1159`, in
`sky.ts`) e con `--dignita lilly` nella CLI, solo nello zodiaco tropicale: la
sezione DIGNITÀ aggiunge, sotto le righe comuni,
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
Il punteggio, col peregrino di p. 112 e le condizioni accidentali, è in
`condizioni-lilly.ts` (voce 17), e la sezione CONDIZIONI (LILLY) della tabella
lo porta sotto la sezione DIGNITÀ.

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
   se il JSON le porta. I dati: `JyotishaChart.dignities` (`types.ts:829`),
   riempito da `computeParasharaDignities` (`jyotisha.ts:91`) ed esposto su
   `/api/jyotish`; in `apps/web/src/routes/vedica/+page.svelte` non c'è
   niente che le mostri, e non esiste un componente per loro (quello
   occidentale è `DignityTable.svelte`, legato a `WesternDignities`). I varga
   portano segni (`SignVargaChart`, `types.ts:406`), tranne il D-2 di
   Parashara, che porta la hora di un luminare (`HoraVargaChart`, :437):
   lì la dignità non si può dire per segno. Il materiale già letto:
   la nota di Santhanam a p. 90 e 7.13-19 (pp. 91-95), trascritti in
   `bphs-santhanam-1992-vol1/trascrizioni.md` per il D-2; il resto del cap. 7
   comincia alla riga 6005 dell'`ocr.txt`. Per la hora, 7.13-16 (p. 94)
   dice già quali graha danno frutto nella hora del Sole e quali in quella
   della Luna: è la forma che la dignità nel D-2 può prendere.
2. **Le altre scuole occidentali**, quando le loro fonti sono state lette
   (vedi *Da verificare* qui sotto): ciascuna come valore nuovo di
   `DignitySchool`, intera. Il compilatore pretende il nome in
   `DIGNITY_SCHOOL_NAMES` (`packages/core/src/constants.ts`), e da lì CLI,
   MCP e `/api/chart` imparano il valore da soli, ma solo a validarlo: il
   risultato porta ancora un campo per scuola (`WesternDignities.lilly`,
   `types.ts:741`), e una scuola nuova chiede il suo campo, il suo ramo in
   `computeWesternDignities` (`dignita-tema.ts:51`), le sue righe in
   `format.ts` (come `lillyLines`, :809, e `lillyConditionLines`) e in
   `DignityTable.svelte`, e i testi che oggi nominano solo Lilly: l'aiuto di
   `--dignita` (`cli.ts:138`), la descrizione di `dignity_school`
   (`packages/mcp/src/tools.ts:317`) e il commento di
   `apps/web/src/routes/api/chart/+server.ts:24-32`. Il conto delle fortezze
   e le condizioni accidentali sono di Lilly e restano suoi: una scuola nuova
   porta il proprio, o nessuno, e `LillyConditions` non si generalizza.
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
(tranne quello del domicilio, illeggibile), e così la tavola delle fortezze
di p. 115, che dà il domicilio a 5.

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
  `houses.test.ts`. Da salvare in `tecnica/radixpro-esempio-case` (la
  cartella non c'è ancora), con `html/` e `testo/`.
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
  `a828b3f`; la forma del risultato sta nella voce 5, lotto A.
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
