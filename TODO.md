# TODO

Lavoro aperto, con dentro quello che serve per riprenderlo senza rifare
l'indagine che l'ha trovato. Non è un elenco di idee: ogni voce è una cosa nota,
con il file, la riga e il modo di verificarla.

I numeri delle voci sono stabili, perché altrove, anche nei messaggi di commit,
le voci si citano così. Una voce chiusa esce dal file e il suo numero non si
riusa; quello che aveva da dire o è finito nel codice, nei commenti e nei test,
o sta in uno dei due elenchi in fondo. L'ultima versione che le contiene tutte,
chiuse comprese, è `cf5219a`, quando il file si chiamava ancora `ROADMAP.md`.
Le voci dalla 20 alla 23 sono nate e si sono chiuse dopo: la 20 per intero sta
in `3314553`, la 21 e la 22 in `819ce59`, la 23 in `db332a6`.

In fondo ci sono due elenchi che non sono lavoro: le decisioni prese, da non
riaprire, e le cose esaminate e lasciate stare, per non ritrovarle una seconda
volta e ricominciare da capo.

## Da dove ripartire

| Voce | Priorità | Taglia | Prima di cominciare |
|---|---|---|---|
| 19. Le dignità, per scuola | media | grande, a commit piccoli | il primo commit, i domicili, si fa subito |
| 11. Gli elenchi in più posti | media | piccola | prima del punto 5 |
| 13. Due semplificazioni | bassa | piccola | niente |
| 9. Il linter | media | piccola | decidere lo strumento |
| 18. Le orbite senza autore | media | media | decidere fra le due strade |
| 7. I transiti attivi in un arco | non dichiarata | media | niente, è pronta |
| 8. Il glossario e /metodo | media | grande | si incrocia col punto 6 |
| 6. La prosa che invecchia | bassa | piccola | farla insieme al punto 8 |
| 5. I varga che mancano | non dichiarata | tre lotti | il punto 11; per il D-2, la convenzione |
| 17. L'astrologia oraria | bassa | la più grande | il punto 19 |

L'ordine consigliato è quello della tabella: il primo commit delle dignità,
che chiude un difetto già presente, poi le voci piccole che tolgono copie
e righe morte prima che il lavoro grande ci passi sopra.

## 5. I dieci varga che mancano

Calcolati: D-1, D-3, D-9, D-10, D-12, D-30, in `packages/core/src/varga.ts`.
Sono i più usati, ed è la ragione per cui vengono per primi, non la
completezza. Dei sedici classici ne restano dieci.

**Non vanno fatti in un colpo solo.** Ogni varga è una regola a sé, e le regole
divergono fra scuole più che nel resto del Jyotisha: farne dieci in un
passaggio significa copiarne otto senza verificarle. I lotti che seguono
raggruppano per **forma della regola**, così che dentro ciascuno si verifichi
una volta il meccanismo e poi si applichi.

Per tutti vale la procedura già collaudata: la regola in una riga dentro
`VARGAS`, che viaggia nel risultato ed è ciò che rende il segno
ricontrollabile; le prove ai confini dei segni pari e dispari; l'aggiunta a
`VargaId` in `types.ts` e all'elenco di `--varga` nell'aiuto della CLI.

L'elenco dei varga però non vive solo lì: è ricopiato in
`packages/mcp/src/tools.ts:123` (`VARGA_IDS`, uno `z.enum`), nelle due rotte
`apps/web/src/routes/api/jyotish/+server.ts:17` e `api/jyotish/quadro/+server.ts:12`
(un `Set<string>`), in `apps/web/src/lib/components/JyotishaSettings.svelte:57`
(`VARGHE`) e nella pagina del metodo, righe 346-347. Un varga nuovo
dimenticato in una delle copie viene rifiutato da quella superficie senza
nessun errore: è lo stesso difetto del punto 11, che conviene chiudere prima.

### Lotto A: quelli che si biforcano su pari e dispari

**D-2 Hora, D-4 Chaturthamsa, D-7 Saptamsa.** Stessa forma del D-10 già
fatto: si guarda se il segno è pari o dispari e si parte da due punti diversi.
Il D-2 divide in due (Sole e Luna); il D-4 in quattro, sui kendra; il D-7 in
sette, dal segno stesso nei dispari e dal settimo nei pari.

Da decidere una cosa sola, ed è il D-2: alcune scuole assegnano le due metà ai
segni del Leone e del Cancro, altre parlano di «hora del Sole» e «hora della
Luna» senza un segno. `VargaChart.positions` porta un `ZodiacSign`, quindi la
seconda convenzione non ci sta dentro senza cambiare il tipo. Va deciso prima
di scrivere, non dopo.

### Lotto B: i multipli con partenza fissa

**D-16 Shodashamsa, D-20 Vimshamsa, D-24 Chaturvimshamsa, D-27
Nakshatramsa.** Qui la partenza non dipende dal segno di arrivo ma da un segno
fisso deciso dalla natura del segno di partenza (cardinale, fisso o mobile per
alcuni; pari o dispari per altri). Il meccanismo è quello del D-9, applicato a
divisioni più fini.

Il D-27 è il più utile del lotto e anche il più semplice: ventisette parti da
1°6'40", cioè un pada di nakshatra, e si parte sempre dall'Ariete. Si può fare
per primo e da solo.

### Lotto C: i fini, che vogliono un'ora di nascita esatta

**D-40 Khavedamsa, D-45 Akshavedamsa, D-60 Shashtiamsa.**

Il D-60 è, in Parashara, il più importante di tutti, e insieme quello che il
motore può garantire di meno: una divisione dura **30 primi d'arco**, che
l'Ascendente percorre in due minuti di orologio. Un'ora di nascita arrotondata
al quarto d'ora produce un D-60 sbagliato, e non se ne accorge nessuno.

Questo lotto vuole quindi una cosa che gli altri non chiedono: **un'avvertenza
propria**, sul modello di quella delle dasha in `dasha.ts`, che dica quanti
minuti di scarto valgano una divisione. Senza, sarebbe il caso peggiore di
tutti: un dato che sembra preciso perché ha molte cifre.

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

La via per chiuderla non è scegliere il numero che suona meglio: è
**misurarlo**. Il motore sa calcolare in tutt'e due i modi, e `initEphemeris`
espone la modalità; bastano gli stessi corpi allo stesso istante nelle due
modalità e la differenza in secondi d'arco, su qualche data sparsa nell'arco
1800-2400. Diventa un test, e il numero diventa verificabile invece che
riportato.

Finché non è deciso, `apps/web/src/routes/(informativa)/metodo/+page.svelte`,
riga 77, dice «una frazione di secondo d'arco» senza cifra, di proposito, e va
aggiornata insieme alle altre due.

Verifica: un test in `packages/core/test/` che confronti le due modalità e
fallisca se lo scarto esce dall'ordine di grandezza dichiarato. A quel punto le
tre righe di prosa possono portare la stessa cifra.

### La pagina del metodo non è legata a `constants.ts`

`apps/web/src/routes/(informativa)/metodo/+page.svelte` ricopia in prosa valori
che vivono nel motore: le nove orbite e i nove aspetti da `ASPECTS`
(`packages/core/src/constants.ts:275`), che la pagina ricopia nella tabella a
riga 195; i nove sistemi di case da `HOUSE_SYSTEM_CODES`, il bonus dei
luminari, le orbite dei transiti da `TRANSIT_ORBS`; i sei ayanamsa da
`AYANAMSAS` (`ayanamsa.ts:44`) e i sei varga da `VARGAS` (`varga.ts:75`), che
la pagina elenca alle righe 346-347.

Cambiando un'orbita, la pagina resta vecchia in silenzio. Non c'è nessun test
che colleghi le due cose, ed è la scelta scritta nel commento in testa al file:
legare la pagina ai valori vorrebbe dire generarla, e una tabella generata non
può dire *perché* le orbite dei transiti sono strette, che è l'unica ragione
per cui la pagina esiste.

La forma che risolve senza generare la prosa esiste, ed è quella che il progetto
usa già altrove: **un test che fallisce a voce alta quando i due divergono**, sul
modello di `packages/ruota/test/tipi.test.ts`, che verifica che i tipi
ridichiarati combacino con quelli di `core` senza importarli. Qui vorrebbe dire
leggere il file `.svelte` e cercarci i valori di `ASPECTS` (nove righe di
tabella, non tutta la pagina) e fallire se un'orbita non compare più.

Un test così è brutto e va tenuto stretto: se comincia a cercare frasi invece
che numeri diventa un impedimento a riscrivere la prosa, che è il contrario di
quello che serve. Da fare solo per i valori tabellari, e solo se la pagina
sopravvive abbastanza da giustificarlo.

Verifica: cambiare un'orbita in `ASPECTS` e vedere il test cadere.

## 7. La domanda che manca ai transiti: che cosa è attivo in un arco

Oggi ci sono due tool e nessuno dei due risponde a «che cosa è in orbita fra il
1° e il 30 settembre». `compute_transits` fotografa **un istante**;
`find_transit_passages` elenca **gli istanti in cui un aspetto si perfeziona**.
Fra i due manca l'intervallo, che è quello che serve per leggere un periodo:
un giorno, una settimana, un mese, un bimestre. È una domanda sola con `from` e
`to` diversi: **non serve un enum di periodi**, e non deve entrarci. Chiamare
«bimestre» un arco è comodità di chi chiama, non un fatto del motore.

### Quasi tutto il calcolo c'è già

`windowAround`, `packages/core/src/passages.ts:180`, calcola già l'intervallo in
cui ogni passaggio resta in orbita, e lo fa quasi gratis: cammina sui campioni
già presi e dimezza solo l'ultimo. Il margine di campionamento a
`passages.ts:64` è `WIDEST_ORB / MEAN_DAILY_MOTION[bodyId]`, cioè esattamente il
tempo massimo che un corpo impiega ad attraversare l'orbita più larga concessa:
non è un margine prudenziale, è dimensionato sul caso peggiore.

Quel lavoro viene poi buttato via da un filtro, `passages.ts:78-80`:

```js
found.filter((passage) => passage.julianDay >= start && passage.julianDay <= end)
```

Sostituire «l'istante esatto cade nell'arco» con «la finestra interseca l'arco»
non è matematica nuova: è un predicato diverso su valori già calcolati. Il
commento sopra il filtro lo dice quasi in chiaro.

### Il pezzo che invece manca davvero

`passagesOf`, `passages.ts:116`, trova i passaggi cercando i **cambi di segno**
di `gap`, cioè le perfezioni. Un transito che entra in orbita, staziona a due
gradi e mezzo dal punto natale e retrocede **senza mai perfezionarsi** non
produce nessuna radice, quindi nessun passaggio, quindi nessuna finestra. Oggi è
invisibile a ragione, perché lì non c'è nessun istante esatto da elencare; ma
in un elenco di ciò che è attivo quel transito c'è, e per mesi.

Va quindi cercata la radice di `|gap| − orbLimit` **indipendentemente** da
quella di `gap`. `bisect` in `roots.ts` sa già farlo ed è la stessa funzione che
`windowAround` chiama: solo, oggi la invoca ancorata a un istante esatto. Va
scollegata da quell'ancora.

Secondo caso, più semplice: quando il bordo non si trova entro
`MAX_WINDOW_DAYS` (1095, `roots.ts:30`, che fa anche da tetto al margine di
riga 64), o quando i campioni finiscono prima di trovarlo, la finestra oggi
viene omessa. In un elenco di transiti attivi «in orbita per tutto l'arco»
**è la risposta**, non un dato mancante, e va detta invece che taciuta.

Niente di tutto questo tocca la catena di calcolo sincrona né lo stato globale
dell'ayanamsa: si resta dentro `zodiacContext`, come il resto del file.

### Decisioni già prese, per non ridiscuterle

- **Le superfici espongono solo dati.** MCP, CLI e API restano agnostiche
  rispetto alla lettura: dicono quale transito è in orbita, con che aspetto, con
  quanta orbita ai bordi, e quante volte si perfeziona dentro l'arco.
  L'interpretazione la fanno gli agenti, su fattori che non si trattano qui e
  che non entrano nel repo.
- **Nessun punteggio, nessun indice di intensità del periodo.** Sarebbe il
  «totale solo» che il progetto rifiuta: pesare Saturno contro Giove è una
  dottrina, e qui non ce n'è una da nominare. Sarebbe la nostra, e finirebbe
  nel codice senza che chi legge possa vederla. Si espongono i componenti,
  come `Distribution` porta `counted`. Un indice che avesse un autore e una
  fonte sarebbe un'altra domanda (vedi il vincolo in `CLAUDE.md`), ma per i
  transiti di un periodo non se ne conosce uno.
- **Nessun `mode:` su `find_transit_passages`.** Il precedente è un tool per
  domanda (`compute_sky` accanto a `find_sky_events`), e le descrizioni sono
  scritte apposta perché un modello non li confonda. Un flag che ribalta il
  significato delle righe è la cosa più facile da sbagliare per un agente.
- **Niente interfaccia web.** La funzione serve agli agenti e alla riga di
  comando: l'endpoint sì, la pagina e la tabella Svelte no.
- Serve un tetto all'arco: `MAX_RANGE_DAYS` in `packages/mcp/src/tools.ts:816`
  e in `apps/web/src/lib/server/range.ts:18` (1096 giorni, tre anni) è il
  precedente.

### Nome e superfici

`find_transit_passages` risponde a *quando*, questo a *che cosa*: i due nomi
devono renderlo ovvio a un modello che li legge di fianco. `find_active_transits`
per l'MCP, `attivi.ts` accanto a `passages.ts` in `core`.

Due commit, nell'ordine della skill `nuova-funzione`: il calcolo con la CLI e i
test, che è il grosso; poi rotta GET e tool MCP con la descrizione che dice
anche che cosa non fare.

Verifica, in due casi distinti perché provano due cose diverse:

1. **Il filtro.** Tema del 2 giugno 1978, 15:15, Palermo, arco
   `2026-07-01 → 2026-08-01`. Saturno quadrato Venere (finestra
   2026-05-26 → 2026-09-29, esatto il 22 giugno e il 31 agosto) e Saturno
   opposizione Plutone (finestra 2026-05-29 → 2026-09-25, esatto il 27 giugno e
   il 25 agosto) sono in orbita per tutto l'arco e non si perfezionano dentro:
   oggi `find_transit_passages` su quell'arco non restituisce nulla. Caso reale,
   già verificato, nessuna costruzione.
2. **La radice nuova.** Un transito che entri in orbita e retroceda senza mai
   perfezionarsi va costruito apposta: il caso 1 non lo copre, perché lì le
   perfezioni esistono e cadono solo fuori dall'arco.

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

### La revisione di /metodo

La pagina non è povera: 478 righe e diciassette sezioni, ciascuna con il suo
`id`. Il problema è che è **una pagina sola**. Le diciassette ancore non sono
diciassette risultati: `#dasha` non è mai un indirizzo per sé, e chi cerca
«dasha vimshottari» trova al più la pagina intera, che parla di altre sedici
cose.

Va quindi valutato (non è deciso) se le cinque parti dell'astrologia indiana
(`#nakshatra`, `#dasha`, `#varga`, `#drishti`, `#panchanga`, righe 300-390)
debbano staccarsi in pagine proprie. Contro: spezzare una pagina che si legge
bene di seguito, e che è l'unica cosa che risponda a «perché la stessa nascita
dà carte diverse altrove». A favore: sono già cinque capitoli con un titolo e
un `id`, e il testo di ognuno regge da solo.

Due cose invece vanno fatte comunque:

- **Il titolo e la descrizione.** «Metodo» è una parola che non cerca nessuno.
  La descrizione a `metodo/+page.svelte:24` è buona ed elenca già i termini
  giusti; il titolo li butta via tutti.
- **Il coordinamento con il punto 6**, che tocca questa stessa pagina in due
  modi: la precisione di Moshier senza cifra alla riga 77, e il legame mancante
  con `constants.ts`. Se la pagina si riscrive, i due lavori si incrociano:
  farli in ordine sparso significa riscrivere due volte gli stessi paragrafi.

### Deciso, per non ridiscuterlo

- **Niente marcature FAQ.** Le domande frequenti vanno riempite di
  affermazioni, che è la merce che questo progetto non produce: la ragione sta
  già scritta per esteso nel commento a `strutturati` in `Meta.svelte`.
- **I cappelli delle cinque sezioni restano come sono.** Allungarli metterebbe
  prosa fra chi arriva e il modulo che è venuto a compilare, e il guadagno
  sarebbe comunque il più piccolo dei tre.
- **Il payoff nel titolo non fa parte di questo lavoro.** Quello che
  dell'esame era rimasto in piedi, il titolo della home e uno `slogan` nei dati
  strutturati, è già fatto (`f7696e8`).

## 9. Il codice morto non lo vede nessuno

**Priorità media.** Restano il linter vero e la decisione che porta con
sé. Il progetto non ha alcuna configurazione di lint o
di formattazione: nessun ESLint, nessun Prettier, nessun Biome, nessun oxlint,
e in `package.json` nessuno script che li chiami.

Non è un'ipotesi: due difetti reali sono entrati e nessuno se n'è accorto.
`api/chart/wheel/+server.ts` importava `ruotaSvg` e `ruotaPng` senza usarli, e
il secondo apriva una seconda porta su `ruota/png`, il punto d'ingresso col
modulo nativo che deve entrare solo da `lib/server`, cioè una regola di
`CLAUDE.md` aggirata da un import dimenticato. Quello è corretto; l'altro no.
Nessuno dei due lo vedono `typecheck` né i test, che girano verdi lo stesso.

### Quello che c'è già

`noUnusedLocals` e `noUnusedParameters` stanno in `tsconfig.base.json` e anche
in `apps/web/tsconfig.json`, che non estende la base ma `$app/tsconfig`, quello
generato da SvelteKit, quindi i flag della radice non lo raggiungono.
`svelte-check` li legge come errori e li applica ai componenti come ai `.ts`:
import e variabili morte, anche nei `.svelte`, oggi cadono. Accendendoli è
saltato fuori un terzo import morto, `ASPECT_GLYPH` in
`TransitAspectTable.svelte`.

Resta scoperto il service worker. Da SvelteKit 3 è un progetto TypeScript a sé,
`apps/web/src/service-worker/tsconfig.json`, che estende
`$app/tsconfig/service-worker` e non porta i due flag: lo script `typecheck` di
`web` lo controlla con `tsc`, ma un import morto lì non cade. Sono due righe in
`compilerOptions`, da aggiungere con questa voce o prima.

### Il linter vero è una decisione a parte

Va deciso, e non è ovvio:

- **Quale strumento**, e con quale licenza: ogni dipendenza nuova deve essere
  compatibile con l'AGPL-3.0-or-later.
- **Se la formattazione entri o no.** Qui la cautela è concreta: i commenti di
  questo repo sono prosa italiana mandata a capo a mano, spesso su misura del
  ragionamento che portano. Un formattatore che li riflua non rompe niente e
  peggiora tutto, e il diff che ne esce non si rilegge. Il lint delle regole e
  la formattazione del testo sono due decisioni, e conviene prendere solo la
  prima.
- **Che cosa aggiunge, ora che i `.svelte` sono coperti.** Il primo passo li
  prende già, import e variabili morte comprese. Quello che un linter porta in
  più sono le regole che il compilatore non ha (le promesse non attese, i
  confronti che non possono essere veri), e vanno guardate una per una prima di
  accenderle tutte.

## 11. Gli elenchi che vivono in quattro posti

**Priorità media.** `AYANAMSAS` è dichiarato in `packages/core/src/ayanamsa.ts:44`,
di nuovo in `packages/mcp/src/tools.ts:88`, di nuovo in
`apps/web/src/lib/server/birth.ts:27` e una quarta volta in
`apps/web/src/lib/zodiacs.ts:28`. I sistemi di case stanno in cinque: l'unione
`HouseSystem` in `packages/core/src/types.ts:39`, `HOUSE_SYSTEM_CODES` in
`constants.ts:255`, `HOUSE_SYSTEMS` in `packages/mcp/src/tools.ts:125`, in
`apps/web/src/lib/server/birth.ts:36` e in `apps/web/src/lib/house-systems.ts:15`.
L'elenco dei varga ha lo stesso difetto (vedi il punto 5). Oggi combaciano
tutti: verificati uno per uno.

Il commento sopra `AYANAMSAS` (`ayanamsa.ts:41-42`) dice che aggiungerne uno
«è una riga qui». Non lo è nemmeno nel motore, perché serve anche l'unione
`AyanamsaId` in `types.ts`; fuori dal motore le copie sono tre, e due delle tre
non se ne accorgerebbero. `zodiacs.ts` e
`house-systems.ts` dichiarano `AyanamsaId` e `HouseSystem`, quindi il
compilatore le tiene legate al motore; `birth.ts` usa un `Set<string>` e il
server MCP uno `z.enum` scritto lì, e un settimo ayanamsa non produrrebbe
nessun errore da nessuna parte: le due superfici continuerebbero a rifiutarlo,
cioè a dire che non esiste una cosa che esiste.

Il guasto è sicuro: un rifiuto, non un numero sbagliato, ed è la ragione per cui
la priorità è media e non alta. È però invisibile a chi aggiunge, che vede il
motore accettare il valore nuovo dalla riga di comando e non ha motivo di
sospettare le altre tre copie.

Il rimedio non è importare dappertutto. La ragione per cui `zodiacs.ts` non lo
fa sta scritta lì ed è il bundle del browser, dove un import di valore dal
motore trascina le effemeridi. Quella ragione non vale per `packages/mcp`, che è
codice di server e che in `server.ts:3` importa già `HOUSE_SYSTEM_CODES` da
`core`: là la copia non ha nessuna giustificazione e si toglie. Per `birth.ts` e
per i due elenchi del client la forma è quella che il progetto usa già in
`packages/ruota/test/tipi.test.ts`: un test che confronta e cade a voce alta.

Verifica: un settimo ayanamsa in `AYANAMSAS`, e il test che cade nominando i
posti rimasti indietro.

## 13. Due semplificazioni piccole

**Priorità bassa**, e nessuna delle due rompe niente.

`fetchChartCompact` (`apps/web/src/lib/api.ts:142`) e `fetchJyotishaCompact`
(riga 224) sono la stessa funzione scritta due volte: cambiano l'indirizzo e due
messaggi. Che non passino da `request` è giusto (quella risposta è testo e non
JSON), ma è una ragione che vale una volta sola.

`packages/core/src/chart.ts:64` calcola la distribuzione e la butta: viene
rifatta a riga 123, quando anche gli assi e la Parte di Fortuna esistono, ed è
quella la buona. La prima serve solo a costruire un `NatalChart` completo. Costa
un conteggio su tredici elementi, quindi non è una questione di tempo. Il
commento a riga 63 lo dice («riempita in fondo, quando anche assi e Parte di
Fortuna esistono»), ma un valore calcolato per essere buttato resta una riga
che si può togliere: basta un segnaposto vuoto, o costruire il tema dopo.

## 17. L'astrologia oraria

**Priorità bassa, e presuppone il punto 19.** Le dignità, che l'oraria non può
fare a meno di avere, sono una voce a sé: servono anche al natale e al
Jyotisha, e chiudono un difetto che c'è già oggi. Qui resta ciò che è proprio
delle domande: le condizioni di un istante, il moto fino all'uscita dal segno,
le regole di una scuola per leggerlo.

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

Per Lilly: *Christian Astrology*, 1647. Il libro II è il metodo orario intero,
il libro I ha le tavole. È di pubblico dominio, e se ne trovano scansioni
dell'originale: quella del Museo Franz Mayer (Città del Messico) sta sotto
CC BY-SA 4.0, altre vengono da EEBO attraverso la Wellcome Collection.

**I numeri si leggono sulla scansione, non sui siti.** L'edizione trascritta che
si trova in rete (Deborah Houlding, Skyscript) è protetta e non si ricopia, e le
fonti secondarie non concordano su cose che qui diventano costanti:

- **La combustione.** Una fonte attribuisce a Lilly 8°30' per la combustione e
  17° per i raggi; un'altra cita dal volume orario 12° per i raggi. Il cazimi è
  dato a 16' o a 17'. Va letto a p. 113 circa e scritto con la pagina accanto.
- **La tavola delle fortezze e debilità**, p. 115, quella che va da +38 a −38.
  Nessuna fonte trovata la riporta per intero.

Sul resto le fonti convergono: le orbite per pianeta (*moieties*: Sole 15°,
Luna 12°, Saturno e Giove 9°, Marte 8°, Venere e Mercurio 7°, l'orbita di un
aspetto è la media delle due), l'ordine caldeo delle ore, le considerazioni
prima del giudizio alle pp. 121-123.

### Che cosa c'è già

Il tema orario è un tema dell'istante in un luogo: `computeSky` con luogo e ora
lo fa già, e il Regiomontano è fra i nove sistemi
(`packages/mcp/src/server.ts:159` lo descrive già come «tradizionale
nell'astrologia oraria»). Ci sono anche:

- `applying` sugli aspetti (`isApplying`, `aspects.ts:170`), gli istanti esatti in
  `findSkyPassages` (`sky-passages.ts:58`), le stazioni in `findStations`, gli
  ingressi in `findSignIngresses`;
- `speed` e `retrograde` (`types.ts:623-624`);
- la setta (`points.ts:13`);
- la Luna vuota di corso, alba, tramonto e ore planetarie in `election.ts`.

Manca, oltre alle dignità del punto 19:

- **il signore dell'ora a un istante dato.** `rulerOfDay` e `chaldeanRuler`
  (`election.ts:364` e `:379`) sono privati, e l'ora si ottiene solo dentro un
  calendario. Va estratta, e serve per prima: è la prima considerazione di
  Lilly;
- combustione, sotto i raggi, cazimi; la velocità rispetto a
  `MEAN_DAILY_MOTION`, che esiste ma serve solo al campionamento;
- angolare, succedente, cadente;
- le *moieties* (oggi le orbite sono per aspetto, punto 18);
- antiscia e Via Combusta.

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
prima del cambio di segno. Quella di Lilly (p. 112) è il pianeta «separato da
un altro, che non applica a nessun altro finché resta nel segno», e con le
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

Dopo il punto 19, e in quest'ordine: ogni lotto vale anche se il successivo non
si fa.

**Lotto A: le condizioni di un istante.** Signore dell'ora a un istante
(estratto da `election.ts`), angolarità, combustione, raggi e cazimi con le
soglie lette da Lilly, velocità rispetto alla media, Via Combusta, gradi
dell'Ascendente, antiscia. In fondo, il punteggio di Lilly, che chiede le
tavole del punto 19 e queste condizioni insieme. Serve anche al natale letto
alla maniera tradizionale.

**Lotto B: la sequenza degli eventi.** Il substrato neutro, e le due Lune vuote
come primi classificatori. Le *moieties* come seconda convenzione di orbita,
che il punto 18 chiede comunque. È il lotto che regge tutto il resto, ed è il
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
  interrogazioni; la copia digitale più probabile è alla Bayerische
  Staatsbibliothek). Termini egizi, le sei negazioni. Le traduzioni latine
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

## 18. Le orbite senza autore

**Priorità media.** È la prima cosa che il vincolo riscritto in `CLAUDE.md`
trova già nel codice. Il vincolo dice che nessuna scuola è un default taciuto e
che non entra un peso senza un autore fuori da questo repo. Le orbite degli
aspetti sono tutte e due le cose.

`ASPECTS` (`packages/core/src/constants.ts:275`) dà 8° a congiunzione e
opposizione, 7° a trigono e quadrato, 5° al sestile, da 2° a 3° ai minori;
`LUMINARY_ORB_BONUS` aggiunge 2° per ciascun luminare, e il commento lo
giustifica con «la prassi corrente». `TRANSIT_ORBS` (riga 303) ha valori
propri, anche loro senza fonte. Decidono quali aspetti esistono in un tema, e
quindi che cosa un agente legge.

Non sono nascoste: la risorsa MCP `aspetti` e la tabella di `/metodo` le
dichiarano, e `AspectOptions.orbs` permette di cambiarle. Ma dichiarare un
numero non è nominarne la scuola, e il risultato non dice quale convenzione di
orbite ha prodotto i suoi aspetti.

Due strade, da scegliere prima di scrivere:

- **Trovare un autore.** Valori di questo ordine si trovano in molti manuali
  moderni, ma la ricerca va fatta su un testo preciso, e se nessuno li dà
  identici la tavola va sostituita con quella di un autore, non attribuita a
  uno che le somiglia.
- **Più convenzioni nominate, una per default.** Le *moieties* di Lilly (punto
  17, lotto B) sono la seconda tavola già prevista, ed è la forma che le orbite
  per aspetto e quelle per pianeta chiedono comunque: un identificatore della
  convenzione nel risultato, come il sistema di case.

In tutti e due i casi il risultato degli aspetti deve portare il nome della
convenzione, e la risorsa MCP e `/metodo` devono dire da dove viene.

Verifica: un tema calcolato con due convenzioni produce due elenchi di aspetti
diversi, e ciascuno dice quale l'ha prodotto.

## 19. Le dignità, per scuola

**Priorità media.** Viene dal punto 17, che ne ha bisogno, ma vale da sola: le
dignità servono al natale letto alla maniera tradizionale e al Jyotisha, e
chiudono un difetto che c'è già.

### Il difetto di oggi

Le dignità nel repo ci sono già, nello strato che non può verificarle.
`packages/lettura/src/tropicale.ts:87` dice al modello che domicilio,
esaltazione, esilio e caduta «li ricavi dal segno», contro la regola con cui
lo stesso documento si apre («se una tecnica ti servirebbe e il dato manca,
dillo e fermati lì»); e non dice se i domicili siano quelli tradizionali o
quelli con Urano, Nettuno e Plutone, quindi la scuola la sceglie il modello
senza dirlo. `packages/lettura/src/jyotisha.ts:45` ricopia in prosa la tavola
dei domicili antichi, e `lettura.test.ts:153` la chiama «la trappola più
insidiosa». Il vincolo riscritto in `CLAUDE.md` le ammette nel motore.

### Che cosa

Tavole, senza moto e senza tempo, ciascuna con la sua scuola e la fonte:

- **Domicili**, tradizionali e moderni come due campi distinti, non uno
  scelto; esilio come derivato.
- **Esaltazione** col grado, e caduta come derivato. L'esaltazione dei Nodi
  diverge (Gemelli e Sagittario in molti testi occidentali, Toro e Scorpione in
  molti vedici) e va nominata.
- **Triplicità**: Lilly (due reggenti) e Doroteo (tre, uno partecipe).
- **Termini**: tolemaici ed egizi.
- **Facce** caldee.
- **Peregrinità**, che ogni scuola definisce sulle sue tavole.
- Per il Jyotisha: esaltazione e caduta col grado, moolatrikona, segno
  proprio. Le amicizie fra graha (la naturale, la temporanea, e la loro
  composizione in cinque gradi) dopo, e con le due tavole di partenza esposte.

E le relazioni che dalle tavole si ricavano per regola: **signori delle case,
dispositori, ricezioni** (per domicilio, per esaltazione, la mutua).

Le tavole si leggono sulle fonti primarie, con la pagina accanto: Tolomeo,
*Tetrabiblos*, per domicili, esaltazioni e termini tolemaici; Lilly, libro I,
per la sua tavola delle dignità; Doroteo per le triplicità; il *Brihat
Parashara Hora Shastra* per il Jyotisha. Un modulo `dignita.ts` in `core`,
con le scuole come pacchetti e mai mescolate.

### Le scuole, e il default deciso il 18 ottobre 2026

Per il tema tropicale le scuole possibili sono cinque, ciascuna come pacchetto:

| | Domicili | Esaltazioni | Triplicità | Termini | Facce | Punteggio | Fonte primaria |
|---|---|---|---|---|---|---|---|
| Ellenistica (Doroteo, Valente) | tradizionali | col grado | tre reggenti, uno partecipe | egizi | sì | nessuno | Doroteo sopravvive in arabo, e la traduzione di Pingree è protetta; Valente in greco è libero |
| Tolomeo, *Tetrabiblos* | tradizionali | sì, gradi da verificare | due reggenti, acqua da verificare | tolemaici | da verificare | nessuno | greco e Ashmand (1822) liberi |
| Medievale araba (Abū Maʿshar, al-Bīrūnī, Bonatti) | tradizionali | col grado | doroteiche | egizi | caldee | 5-4-3-2-1, almuten | Bonatti latino (1491) libero |
| Lilly, 1647 | tradizionali | col grado | due reggenti, Marte sull'acqua | tolemaici, nella sua versione | caldee | da +5 a +1, esilio −5, caduta −4, peregrino −5 | scansioni libere |
| Moderna, XX secolo | con Urano, Nettuno, Plutone | segni, i pianeti esterni contesi | nessuna | nessuno | decani per triplicità (Alan Leo) | nessuno | senza un autore unico |

Il default nel tema tropicale sono **due colonne affiancate, mai mescolate**:

- **i domicili tradizionali con esaltazione, esilio e caduta**, dichiarati come
  la parte comune alle scuole occidentali antiche. Sulle quattro dignità
  maggiori le prime quattro righe concordano, ed è per questo che mostrarle
  non sceglie fra loro in silenzio. Sono anche le quattro che `tropicale.ts`
  usa oggi;
- **i domicili moderni**, attribuiti alla convenzione del Novecento con le sue
  fonti parziali: Alan Leo per Urano all'Acquario e Nettuno ai Pesci. Per
  Plutone allo Scorpione il risultato dice che non c'è un autore. Il progetto
  ha già scelto quella convenzione mettendo Plutone nel tema: qui la si
  dichiara.

Con due schemi i segni dello Scorpione, dell'Acquario e dei Pesci hanno due
signori, e così le case che vi cadono: il risultato li porta tutti e due, col
nome della convenzione.

Triplicità, termini, facce e punteggio **non compaiono per default**: si
chiedono nominando la scuola. La prima disponibile è Lilly, che l'oraria
richiede comunque; le altre entrano quando le loro fonti sono state lette.

Nel Jyotisha la scelta è più semplice, perché Parashara è il riferimento che i
documenti di lettura già presuppongono.

### Da verificare prima di scrivere le tavole

- **Che la parte comune sia davvero comune.** Domicili ed esaltazioni per segno
  in ciascuna delle quattro scuole antiche, sulla fonte. È un test a tabella, e
  se una scuola diverge la colonna di default si restringe invece di
  sceglierne una.
- **I gradi di esaltazione in Tolomeo**: le fonti secondarie non dicono se ci
  siano. Se mancano, il default porta i segni e il grado resta della scuola che
  lo dà.
- **La triplicità d'acqua in Tolomeo.** Una fonte gli attribuisce Marte di
  giorno e di notte come Lilly, un'altra un reggente diverso per setta.
- **I punti 5-4-3-2-1 medievali**: a chi vanno attribuiti. I siti li danno
  come «medievali» senza un testo.
- **Una fonte per Plutone allo Scorpione**, o la dichiarazione che non c'è.

### Superfici, in commit

1. **I domicili nelle due colonne**, con i signori delle case, nella tabella di
   `packages/core/src/format.ts`; `tropicale.ts` passa da «li ricavi dal
   segno» a «li trovi nella tabella», e dice che le colonne sono due e
   perché. È il commit che chiude il difetto, e va fatto per primo anche se
   il resto aspetta.
2. Esaltazione, caduta, esilio nella colonna tradizionale, e le ricezioni.
3. Il pacchetto di Lilly a richiesta: triplicità, termini, facce. È il pezzo
   che il punto 17 aspetta, e il suo punteggio sta là, perché chiede anche le
   condizioni di un istante.
4. Le dignità del Jyotisha, e il documento `jyotisha.ts` che smette di
   ricopiare la tavola in prosa o la tiene come istruzione, col dato che ora
   arriva calcolato.

Poi CLI, rotta, tool MCP e una tabella Svelte, nell'ordine della skill
`nuova-funzione`. La tabella prende i dati, non il tema.

### Verifica

Le tavole contro la fonte, segno per segno e scuola per scuola: è una prova a
tabella e non chiede effemeridi. Per i domicili, anche il test che
`tropicale.ts` non dica più «li ricavi dal segno».

## Deciso, e da non riaprire

- **Niente riscrittura della storia di git.** Il rinomino da undicesimacasa a
  dodicisegni l'ha lasciata com'era, ed è pericolosa per un guadagno estetico.
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
- **Il server MCP non ha un pool, e non gli serve**: è un processo per client,
  sul trasporto stdio, e non c'è nessun'altra richiesta da tenere in attesa.
- **I thread del pool web sono al massimo quattro, e la quinta richiesta
  pesante aspetta.** Sono uno meno dei nuclei, fino a quattro
  (`apps/web/src/lib/server/pool.ts:133`). Il tetto è voluto: il lavoro è
  tutto CPU, e più thread che nuclei non calcolano niente di più. Va
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
