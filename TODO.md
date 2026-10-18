# Cosa manca

Lavoro aperto e rimandato di proposito, con dentro quello che serve per
riprenderlo senza rifare l'indagine che l'ha trovato. Non è un elenco di idee:
ogni voce è una cosa nota, con il file, la riga e il modo di verificarla.

In fondo c'è una lista che non è lavoro — roba esaminata e lasciata stare, per
non ritrovarla una seconda volta e ricominciare da capo.

## 1. Il nome: da undicesimacasa a dodicisegni — **fatto**

I tre passi sono chiusi, e con il **punto 10** è chiuso anche `REPOSITORY_URL`,
l'unico che dipendeva da un rinomino su GitHub.

Il progetto prende il nome `dodicisegni`, sul dominio `dodicisegni.it`; `12segni.it` è il dominio di servizio, già registrato. Nel
marchio il numero è in cifre — «12» sopra «segni» — perché «XII» si legge
anche «dodicesima» e il nome dice dodici segni, non il dodicesimo di qualcosa;
il nome breve dell'icona installata è `12segni`, che sta nei sette caratteri
che un lanciatore concede.

**Non c'è niente da preservare.** Il progetto non è in produzione: nessuno ha
una preferenza di tema salvata da migrare, nessun client MCP ha memorizzato un
`undicesimacasa://`, nessuno ha l'AppImage installata sotto il vecchio `appId`.
Ogni identificatore si cambia sul posto, e chi lo cambia non deve niente a
nessuno. È la ragione per cui questa voce è più corta di quanto sarebbe stata
fra un anno, ed è anche la ragione per cui conviene farla adesso.

È andato in tre passi per una ragione sola e molto più piccola di quella: **la
leggibilità del diff**. Il rinomino dello scope npm tocca quasi ogni file del
repo ed è rumore meccanico; impastarlo con le decisioni di nome — la CLI, il
server MCP, l'applicazione desktop — avrebbe prodotto un commit che nessuno
rilegge.

### Il sigillo non va ridisegnato

La stella al centro del marchio è il poligono stellato {12/5}: **dodici punte
già oggi**, e non undici. `apps/web/src/lib/components/Marchio.svelte`, righe
16-21, se ne scusava per esteso — il cielo si divide in dodici, e undici era
«solo il nome di questo progetto». Col nome nuovo la scusa non serve più e il
disegno diventa esatto: cambia soltanto la scritta sotto. Vale anche per
`graphics/favicon.svg` e per le icone che `apps/web/scripts/build-icons.mjs`
ne rasterizza, perché la fonte è il favicon e il favicon è la stessa stella.

### Passo 1 — quello che si legge — **fatto**

Il nome come parola, in ciò che una persona vede o incolla.
`apps/web/src/lib/project.ts` (`SITE_NAME`, `SITE_SHORT_NAME`),
`Marchio.svelte`, l'informativa privacy, i tre testi di `packages/lettura` che
finiscono negli appunti di chi li copia, il titolo della pagina senza rete,
`README.md`, `CLAUDE.md` e la skill `nuova-funzione`.

Nello stesso passaggio `Meta.svelte` e `service-worker.ts` hanno smesso di
ripetere il nome alla lettera e lo leggono da `SITE_NAME`, e la proprietà
`--marchio-casa` è diventata `--marchio-parola`: chi posa il marchio decide una
misura, non che cosa ci sta scritto.

### Passo 2 — lo scope npm e i tag — **fatto**

Meccanico e voluminoso, senza una sola decisione dentro. È andato in un commit
solo perché a metà l'albero non compila.

- `@undicesimacasa/*` → `@dodicisegni/*`: sette `package.json`, ogni import di
  ogni workspace, gli script della radice, `Dockerfile:48,58-65`,
  `.github/workflows/controlli.yml`, `compose.yaml:82` e
  `apps/desktop/scripts/stage.mjs:47,61,68`, che compone percorsi dentro
  `node_modules/@undicesimacasa`.
- Il nome del pacchetto radice (`package.json:2`), il nome del progetto compose
  (`compose.yaml:1`) e i tag immagine (`compose.yaml:9,72`,
  `controlli.yml:87,94,125`).
- I nomi di comodo nei test, che non provano niente e vanno per compagnia: i
  prefissi di `mkdtempSync` in `packages/mcp/test/server.test.ts:25`,
  `packages/geo/test/search.test.ts:98` e
  `packages/core/test/ephemeris.test.ts:9`, la URL finta in
  `packages/lettura/test/lettura.test.ts:68` e il sito finto in
  `apps/web/src/lib/cache-policy.test.ts:4`.

Verifica: `npm install` (rifà i collegamenti in `node_modules`, che con lo scope
nuovo sono altri file), poi
`npm run typecheck && npm test && npm run build`, poi il giro Docker con i
profili espliciti.

### Passo 3 — gli identificatori con un nome da scegliere — **fatto**

Pochi, e ciascuno voleva una decisione prima di una riga di codice. Nessuno
aveva più un vincolo di compatibilità: restava scegliere bene, e la scelta è
stata la stessa dappertutto — `dodicisegni`. `12segni` ha una giustificazione
sola, i sette caratteri sotto un'icona, e nessuno di questi posti è quello.

- **La CLI `casa11` è diventata `dodicisegni`** — **fatto**. La ragione era
  che il nome vecchio era già un terzo nome, né `undicesimacasa` né altro, e un
  progetto che si chiama in tre modi si spiega tre volte. `12segni` si sarebbe
  digitato meglio, ma il nome breve ha una sola giustificazione — i sette
  caratteri sotto un'icona — e sulla riga di comando quella giustificazione non
  c'è. Cambiati il `bin` di `packages/core/package.json`, l'aiuto e il commento
  a `printSky` in `cli.ts`, e le citazioni in `README.md`, `CLAUDE.md`,
  `packages/ruota/src/types.ts` e `.claude/skills/nuova-funzione/SKILL.md`.

  Una nota per chi rifà il giro su un altro identificatore: `npm install` non
  toglie il collegamento vecchio in `node_modules/.bin`, lo affianca. Finché
  non si cancella a mano, `npx casa11` continua a rispondere e il rinomino
  sembra non aver preso.
- **Il server MCP** — **fatto**. `SERVER_NAME` vale `dodicisegni`, il binario
  è `dodicisegni-mcp`, la chiave in `.mcp.json` e l'esempio del `README` pure,
  e le risorse di riferimento stanno su `dodicisegni://riferimento/…`.

  Come nel passo 1, il nome ha smesso di essere ripetuto alla lettera dove una
  costante c'era già: i due URI in `server.ts` e la riga di avvio in `stdio.ts`
  si compongono da `SERVER_NAME`. Il test resta sui letterali di proposito —
  deve provare il valore che passa sul filo, non che due costanti siano la
  stessa costante.

  Verificato avviando `dist/stdio.js` su stdio con un `initialize` a mano:
  `serverInfo.name` è `dodicisegni`, `resources/list` restituisce i due URI
  nuovi e `resources/read` serve il contenuto. Come per la CLI, il
  collegamento vecchio in `node_modules/.bin` è andato tolto a mano.
- **L'applicazione desktop** — **fatto**. `appId` è `it.dodicisegni.desktop`,
  `productName` ed `executableName` sono `dodicisegni`, e così la descrizione
  del pacchetto, che finisce nel `Comment` della voce di menu. In `main.ts` il
  nome sta in una costante `NOME` — dichiarata lì e non importata da `web`, che
  non è una libreria e da cui il desktop non dipende.

  Verificato impacchettando davvero: `npm run dist` produce
  `dodicisegni-0.1.0.AppImage`, l'eseguibile dentro è `dodicisegni`, e il
  `.desktop` porta `Name`, `Icon` e `StartupWMClass` tutti col nome nuovo.
  L'app avviata mostra il titolo giusto.

  Due cose viste di passaggio e **non toccate**, perché non sono di questo
  lavoro: `release/` tiene ancora l'AppImage vecchia del nome vecchio, e
  `electron-builder` avvisa che `desktopName` non è impostato in
  `package.json`, il che rende `syncDesktopName: true` meno efficace di quanto
  la riga qui sopra dicesse. L'avviso c'era già prima del rinomino.
- **La chiave del tema** — **fatto**. Vale `dodicisegni:color-scheme`, e
  `COLOR_SCHEME_KEY` la compone da `SITE_NAME` invece di ripeterla.

  Lo script in linea di `app.html` **non può** fare altrettanto: gira prima di
  ogni import, per non far lampeggiare la pagina, e la chiave se la scrive a
  mano. Prima erano due letterali e si dimenticavano insieme; ora la costante
  segue `SITE_NAME` e la copia in `app.html` no, che è un modo peggiore di
  sbagliare — cambiare il nome del sito perderebbe l'aspetto scelto a ogni
  caricamento, in silenzio. Per questo `color-scheme.test.ts` adesso legge
  `app.html` e confronta le due copie: è l'unico posto dove si guardano in
  faccia. Provato facendolo cadere.
- **Il nome della cache** — **fatto**. `service-worker.ts` lo compone da
  `SITE_NAME`, che già importava per il titolo della pagina senza rete;
  nel worker compilato risulta `dodicisegni-<versione>`. Le cache di nome
  vecchio le butta `activate` da sé.

  In tutt'e due i casi è cambiata anche la prosa dell'informativa privacy, che
  i due valori li cita alla lettera.

Il repository non è in questo elenco: `REPOSITORY_URL` dipende da un rinomino
su GitHub, che è fuori dal repo e non si può fare da qui. Sta al **punto 10**,
e non blocca niente di quanto sopra.

### Deciso, per non ridiscuterlo

- **Niente riscrittura della storia di git**, e nessun rinomino della cartella
  locale `it-undicesimacasa`: la prima è pericolosa, il secondo non è codice.
- **Il dominio non entra nel codice.** Nessun file lo scrive oggi: `Meta.svelte`
  compone gli indirizzi da `page.url.origin`, e in produzione è `ORIGIN` a
  dirlo. Il cambio di dominio è configurazione, non un passo di questo lavoro.
- **`12segni` non è un secondo marchio.** È il dominio di servizio e il nome
  breve sotto l'icona, dove sette caratteri sono il tetto. Nella prosa il nome
  è uno solo.

## 2. Il guardiano della navigazione nell'app desktop — **fatto**

Entrambi i rimedi, che erano due allo stesso inciampo a due livelli diversi.

Nel processo principale, `creaFinestra` ora installa anche un gestore di
`will-navigate` accanto a `setWindowOpenHandler`, che copriva il solo
`window.open`: confronta l'**origine** della destinazione con quella del server
interno — l'origine e non l'indirizzo, perché la porta del loopback è
sorteggiata a ogni avvio — e quando differisce annulla e passa a
`shell.openExternal`, per i soli `http(s)`.

Sull'interfaccia, i link che escono dal sito prendono `target="_blank"` e
`rel="noopener"`. Erano **sei e non tre**: la conta di questa voce dimenticava
i due su `REPOSITORY_URL` — il piè di pagina e l'informativa, cioè l'offerta del
sorgente che impone l'AGPL articolo 13 — e quello di Swiss Ephemeris in
`/metodo`. Il referrer non ha richiesto niente: la politica predefinita dei
browser è `strict-origin-when-cross-origin`, che fuori origine manda l'origine
e non il percorso, ed è il percorso a portare data e luogo di nascita.

**Attenzione se si rimette mano qui**: la verifica che questa voce prescriveva
— cliccare «Swiss Ephemeris» nel piè di pagina — adesso **non prova più il
guardiano**, perché con `target="_blank"` quel click passa dal gestore delle
finestre nuove. Per toccare `will-navigate` serve una navigazione di primo
livello, cioè un `location.href` verso un'altra origine.

Verificata così, e non a mano: Electron avviato con
`--remote-debugging-port`, la finestra pilotata via CDP con `location.href`
verso un indirizzo esterno, e `xdg-open` sostituito da uno stub che registra
quello che gli arriva. La finestra è rimasta sull'origine interna, lo stub ha
ricevuto l'indirizzo esterno, e la navigazione interna verso `/metodo` è
passata. Resta comunque fuori dai test: vuole un display e un binario Electron.

## 3. Electron da 38 a 43 — **fatto**

`apps/desktop/package.json` porta `electron` a `43.4.1`, esatta come prima. I
diciannove avvisi che `npm audit` contava sulla `38.8.6` sono chiusi:
l'intervallo vulnerabile di quel major si ferma a `43.0.0-beta.8`. Il conto del
repo passa da cinque vulnerabilità a tre, e le tre che restano sono `cookie`
sotto SvelteKit, che sta in fondo fra le cose esaminate e lasciate stare.

**Perché la 43 e non la 44.** La `44.0.0` era uscita stabile ed era quella che
`npm audit fix --force` proponeva, ma è anche l'unica versione della sua serie:
nessuna patch dietro, nessun rodaggio. Il desktop è l'unico posto del progetto
dove una regressione la vede chi usa il programma e non un test, e un major in
più si prende quando la serie ha qualche settimana addosso.

### Quello che non si sapeva da qui

**`extract-zip` non va ignorato: sparisce.** Era il ventesimo avviso, quello che
si era deciso di accettare perché il path traversal richiede uno zip malevolo.
Electron 43 non dipende più dal pacchetto pubblico — il `postinstall` usa
`@electron-internal/extract-zip`, un fork interno caricato pigramente — e
`node_modules/extract-zip` non esiste più nell'albero. L'avviso si chiude da
solo, senza che nessuno debba ragionarci sopra.

**Dentro l'AppImage il motore dà gli stessi numeri di fuori.** Verificato sul
tema del 2 giugno 1978, 15:15, Palermo: `ephemerisMode: swisseph`, Sole 11°39'
Gemelli, Luna 4°56' Toro, le stesse case della CLI lanciata fuori da Electron.
Il modulo nativo gira nell'`utilityProcess` senza accorgersi del motore nuovo.

Percorse tutt'e due le strade che il processo principale governa. L'importazione
GeoNames al primo avvio ha scaricato, costruito i 90 MB in
`~/.config/@dodicisegni/desktop` e mostrato l'avanzamento riga per riga
attraverso il `preload.cjs` in sandbox; il calcolo di un tema passa dalla
ricerca delle località alla carta a schermo. Nessuna delle due si comporta
diversamente da prima.

L'importazione ha però mostrato un difetto che con l'aggiornamento non c'entra
ed è più vecchio di lui: sta al **punto 16**.

## 4. Le azioni di GitHub su Node 24 — **fatto**

`controlli.yml` è salito a `checkout@v7`, `setup-node@v7` e `cache@v6` nel
commit «Porta le azioni sul runtime che i runner eseguono»: gli ultimi major, e
non il minimo che togliesse l'annotazione, così il file si tocca una volta
sola. La voce resta al suo numero invece di sparire: togliendola scalerebbero
tutte quelle dopo, e i punti 2, 3 e 6 sono citati per numero altrove.

## 5. I dieci varga che mancano

Calcolati: D-1, D-3, D-9, D-10, D-12, D-30, in `packages/core/src/varga.ts`.
Sono i più usati, ed è la ragione per cui vengono per primi — non la
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

### Lotto A — quelli che si biforcano su pari e dispari

**D-2 Hora, D-4 Chaturthamsa, D-7 Saptamsa.** Stessa forma del D-10 già
fatto: si guarda se il segno è pari o dispari e si parte da due punti diversi.
Il D-2 divide in due (Sole e Luna); il D-4 in quattro, sui kendra; il D-7 in
sette, dal segno stesso nei dispari e dal settimo nei pari.

Da decidere una cosa sola, ed è il D-2: alcune scuole assegnano le due metà ai
segni del Leone e del Cancro, altre parlano di «hora del Sole» e «hora della
Luna» senza un segno. `VargaChart.positions` porta un `ZodiacSign`, quindi la
seconda convenzione non ci sta dentro senza cambiare il tipo. Va deciso prima
di scrivere, non dopo.

### Lotto B — i multipli con partenza fissa

**D-16 Shodashamsa, D-20 Vimshamsa, D-24 Chaturvimshamsa, D-27
Nakshatramsa.** Qui la partenza non dipende dal segno di arrivo ma da un segno
fisso deciso dalla natura del segno di partenza — cardinale, fisso o mobile per
alcuni; pari o dispari per altri. Il meccanismo è quello del D-9, applicato a
divisioni più fini.

Il D-27 è il più utile del lotto e anche il più semplice: ventisette parti da
1°6'40", cioè un pada di nakshatra, e si parte sempre dall'Ariete. Si può fare
per primo e da solo.

### Lotto C — i fini, che vogliono un'ora di nascita esatta

**D-40 Khavedamsa, D-45 Akshavedamsa, D-60 Shashtiamsa.**

Il D-60 è, in Parashara, il più importante di tutti, e insieme quello che il
motore può garantire di meno: una divisione dura **30 primi d'arco**, che
l'Ascendente percorre in due minuti di orologio. Un'ora di nascita arrotondata
al quarto d'ora produce un D-60 sbagliato, e non se ne accorge nessuno.

Questo lotto vuole quindi una cosa che gli altri non chiedono: **un'avvertenza
propria**, sul modello di quella delle dasha in `dasha.ts`, che dica quanti
minuti di scarto valgano una divisione. Senza, sarebbe il caso peggiore di
tutti — un dato che sembra preciso perché ha molte cifre.

Verifica per tutti i lotti: `packages/core/test/varga.test.ts` ha già la forma
— confini noti calcolati a mano per un segno pari e uno dispari, più la prova
che la regola viaggi col risultato.

## 6. La prosa che può invecchiare senza dirlo

**Bassa priorità.** Nessuna delle due rompe niente: producono testo che dice il
falso, e nessun test le vede. Stanno qui perché è il genere di cosa che si
ritrova per caso due anni dopo, e allora non si sa più quale delle due versioni
fosse quella giusta.

### La precisione di Moshier, dichiarata due volte e in due modi

`packages/core/src/ephemeris.ts`, riga 20, dice «0,1 secondi d'arco per i
pianeti maggiori». `README.md`, riga 44, dice «~0,4 secondi d'arco sui pianeti
principali». Sono la stessa affermazione sullo stesso ripiego, e differiscono di
un fattore quattro.

Una delle due è sbagliata e non si sa quale: il numero non viene da una misura
fatta qui, ma dalla documentazione di Swiss Ephemeris, dove la cifra dipende da
quali corpi e da quale epoca si guardano — Moshier degrada allontanandosi dal
presente, e i pianeti esterni non si comportano come i lunari.

La via per chiuderla non è scegliere il numero che suona meglio: è
**misurarlo**. Il motore sa calcolare in tutt'e due i modi, e `initEphemeris`
espone la modalità; bastano gli stessi corpi allo stesso istante nelle due
modalità e la differenza in secondi d'arco, su qualche data sparsa nell'arco
1800-2400. Diventa un test, e il numero diventa verificabile invece che
riportato.

Finché non è deciso, `apps/web/src/routes/(informativa)/metodo/+page.svelte`,
riga 77, dice «una frazione di secondo d'arco» senza cifra — di proposito, e va
aggiornata insieme alle altre due.

Verifica: un test in `packages/core/test/` che confronti le due modalità e
fallisca se lo scarto esce dall'ordine di grandezza dichiarato. A quel punto le
tre righe di prosa possono portare la stessa cifra.

### La pagina del metodo non è legata a `constants.ts`

`apps/web/src/routes/(informativa)/metodo/+page.svelte` ricopia in prosa valori
che vivono nel motore: le nove orbite e i nove aspetti da `ASPECTS`
(`packages/core/src/constants.ts:275`), che la pagina ricopia nella tabella a
riga 194; i nove sistemi di case da `HOUSE_SYSTEM_CODES`, il bonus dei
luminari, le orbite dei transiti da `TRANSIT_ORBS`; i sei ayanamsa da
`AYANAMSAS` (`ayanamsa.ts:44`) e i sei varga da `VARGAS` (`varga.ts:75`), che
la pagina elenca a riga 344.

Cambiando un'orbita, la pagina resta vecchia in silenzio. Non c'è nessun test
che colleghi le due cose, ed è la scelta scritta nel commento in testa al file:
legare la pagina ai valori vorrebbe dire generarla, e una tabella generata non
può dire *perché* le orbite dei transiti sono strette — che è l'unica ragione
per cui la pagina esiste.

La forma che risolve senza generare la prosa esiste, ed è quella che il progetto
usa già altrove: **un test che fallisce a voce alta quando i due divergono**, sul
modello di `packages/ruota/test/tipi.test.ts`, che verifica che i tipi
ridichiarati combacino con quelli di `core` senza importarli. Qui vorrebbe dire
leggere il file `.svelte` e cercarci i valori di `ASPECTS` — nove righe di
tabella, non tutta la pagina — e fallire se un'orbita non compare più.

Un test così è brutto e va tenuto stretto: se comincia a cercare frasi invece
che numeri diventa un impedimento a riscrivere la prosa, che è il contrario di
quello che serve. Da fare solo per i valori tabellari, e solo se la pagina
sopravvive abbastanza da giustificarlo.

Verifica: cambiare un'orbita in `ASPECTS` e vedere il test cadere.

## 7. La domanda che manca ai transiti: che cosa è attivo in un arco

Oggi ci sono due tool e nessuno dei due risponde a «che cosa è in orbita fra il
1° e il 30 settembre». `compute_transits` fotografa **un istante**;
`find_transit_passages` elenca **gli istanti in cui un aspetto si perfeziona**.
Fra i due manca l'intervallo, che è quello che serve per leggere un periodo —
un giorno, una settimana, un mese, un bimestre. È una domanda sola con `from` e
`to` diversi: **non serve un enum di periodi**, e non deve entrarci. Chiamare
«bimestre» un arco è comodità di chi chiama, non un fatto del motore.

### Quasi tutto il calcolo c'è già

`windowAround`, `packages/core/src/passages.ts:180`, calcola già l'intervallo in
cui ogni passaggio resta in orbita, e lo fa quasi gratis: cammina sui campioni
già presi e dimezza solo l'ultimo. Il margine di campionamento a
`passages.ts:65` è `WIDEST_ORB / MEAN_DAILY_MOTION[bodyId]`, cioè esattamente il
tempo massimo che un corpo impiega ad attraversare l'orbita più larga concessa:
non è un margine prudenziale, è dimensionato sul caso peggiore.

Quel lavoro viene poi buttato via da una riga, `passages.ts:79`:

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
invisibile a ragione, perché lì non c'è nessun istante esatto da elencare — ma
in un elenco di ciò che è attivo quel transito c'è, e per mesi.

Va quindi cercata la radice di `|gap| − orbLimit` **indipendentemente** da
quella di `gap`. `bisect` in `roots.ts` sa già farlo ed è la stessa funzione che
`windowAround` chiama: solo, oggi la invoca ancorata a un istante esatto. Va
scollegata da quell'ancora.

Secondo caso, più semplice: quando il bordo non si trova entro
`MAX_WINDOW_DAYS` (1095, `roots.ts:30`) la finestra oggi viene omessa. In un
elenco di transiti attivi «in orbita per tutto l'arco» **è la risposta**, non un
dato mancante, e va detta invece che taciuta.

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
  domanda — `compute_sky` accanto a `find_sky_events` — e le descrizioni sono
  scritte apposta perché un modello non li confonda. Un flag che ribalta il
  significato delle righe è la cosa più facile da sbagliare per un agente.
- **Niente interfaccia web.** La funzione serve agli agenti e alla riga di
  comando: l'endpoint sì, la pagina e la tabella Svelte no.
- Serve un tetto all'arco: `MAX_RANGE_DAYS` in `tools.ts` e
  `lib/server/range.ts` sono il precedente.

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
   perfezionarsi va costruito apposta — il caso 1 non lo copre, perché lì le
   perfezioni esistono e cadono solo fuori dall'arco.

## 8. Il glossario, e /metodo da rivedere

**Priorità media.** Viene da un esame del SEO organico, dove l'ipotesi di
partenza era un payoff da mettere nel titolo. Il payoff non sposta niente — è
del marchio, quindi si ripete su ogni pagina, e un titolo ripetuto è la cosa
che i motori riscrivono per prima. Quello che sposta è il testo, e di testo qui
ce n'è pochissimo.

Il conto è in `apps/web/src/lib/seo.ts`: sette indirizzi in
`PAGINE_PUBBLICHE`, e cinque sono strumenti — `h1` nascosto, un cappello di due
paragrafi e sotto il modulo. Le pagine fatte di prosa sono `/metodo` e
`/privacy`, e la seconda la cerca soltanto chi la deve controllare. Un sito con
due pagine di testo non si posiziona su niente, per quanto bene siano scritti i
suoi `<title>`.

Il vincolo del progetto, qui, non è un impedimento: è il filtro che sceglie il
contenuto. Che cos'è un nakshatra è un fatto verificabile; che cosa prometta
Saturno in settima no. **Il glossario è la prosa che questo progetto può
scrivere senza tradirsi**, ed è anche quella che intercetta le ricerche più
precise — in italiano, su questi termini, non copre bene nessuno.

### Il glossario

I termini ci sono già tutti, sparsi: quelli del Jyotisha che la regola di stile
tiene in sanscrito — `nakshatra`, `tithi`, `karana`, `yoga`, `dasha`, `varga`,
`drishti`, `pada`, più `ayanamsa` e `panchanga` — e quelli che il motore
occidentale calcola e nomina: Parte di Fortuna, Luna vuota di corso, ore
planetarie, cuspidi, orbita, retrogradazione, stazione, ingresso, distribuzione
fra elementi e modalità, i nove sistemi di case.

Non c'è niente da inventare e non si deve: la fonte è scritta due volte, nei
commenti di `packages/core` — `VoidOfCourse` in `types.ts`, `dasha.ts`,
`varga.ts`, `constants.ts` — e nella pagina del metodo, che quasi tutti li
spiega già.

Ed è esattamente lì il rischio. **Due pagine che dicono la stessa cosa si
tolgono i lettori a vicenda**, e un motore che deve scegliere fra le due
sceglie male. Il taglio va deciso prima di scrivere una riga, e la forma che
regge è questa: il glossario dice *che cos'è* il termine, in tre righe, e
rimanda; `/metodo` dice *con quale convenzione questo sito lo calcola*. Il
primo definisce, il secondo dichiara — che è poi la differenza fra i due
vincoli del progetto.

**Da decidere, e non è una scelta di stile.** Una pagina per termine è la forma
che intercetta le ricerche, ma sono trenta indirizzi da poche righe l'uno, che
è la definizione di pagina magra, e la sitemap li porterebbe tutti. Una pagina
sola con le ancore è un indirizzo solo e trenta ricerche perse. La via di mezzo
— una pagina per famiglia, il Jyotisha da una parte, il tempo e i moti
dall'altra — è probabilmente quella giusta, ma va scelta guardando quanto testo
regge davvero ogni termine, non prima.

Qualunque sia la forma, le pagine nuove **non sono sezioni**: vanno aggiunte a
mano in `PAGINE_PUBBLICHE`, come `/metodo` e `/privacy`, e
`lib/seo.test.ts` va esteso di conseguenza. Nel menù non entrano.

### La revisione di /metodo

La pagina non è povera: 476 righe e diciassette sezioni, ciascuna con il suo
`id`. Il problema è che è **una pagina sola**. Le diciassette ancore non sono
diciassette risultati: `#dasha` non è mai un indirizzo per sé, e chi cerca
«dasha vimshottari» trova al più la pagina intera, che parla di altre sedici
cose.

Va quindi valutato — non è deciso — se le cinque parti dell'astrologia indiana
(`#nakshatra`, `#dasha`, `#varga`, `#drishti`, `#panchanga`, righe 298-388)
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
  con `constants.ts`. Se la pagina si riscrive, i due lavori si incrociano —
  farli in ordine sparso significa riscrivere due volte gli stessi paragrafi.

### Deciso, per non ridiscuterlo

- **Niente marcature FAQ.** Le domande frequenti vanno riempite di
  affermazioni, che è la merce che questo progetto non produce: la ragione sta
  già scritta per esteso nel commento a `strutturati` in `Meta.svelte`.
- **I cappelli delle cinque sezioni restano come sono.** Allungarli metterebbe
  prosa fra chi arriva e il modulo che è venuto a compilare, e il guadagno
  sarebbe comunque il più piccolo dei tre.
- **Il payoff nel titolo non fa parte di questo lavoro.** Quello che
  dell'esame è rimasto in piedi — il titolo della home, che oggi spreca la
  pagina più forte del sito, e uno `slogan` nei dati strutturati — è piccolo,
  isolato e va per conto suo.

## 9. Il codice morto non lo vede nessuno

**Priorità media**, e il primo passo è **fatto**: restano il linter vero e la
decisione che porta con sé. Il progetto non ha alcuna configurazione di lint o
di formattazione — nessun ESLint, nessun Prettier, nessun Biome, nessun oxlint,
e in `package.json` nessuno script che li chiami.

Non è un'ipotesi: due difetti reali sono entrati e nessuno se n'è accorto.
`api/chart/wheel/+server.ts` importava `ruotaSvg` e `ruotaPng` senza usarli, e
il secondo apriva una seconda porta su `ruota/png` — il punto d'ingresso col
modulo nativo che deve entrare solo da `lib/server`, cioè una regola di
`CLAUDE.md` aggirata da un import dimenticato. Quello è corretto; l'altro no.
Nessuno dei due lo vedono `typecheck` né i test, che girano verdi lo stesso.

### Il primo passo — **fatto**

`noUnusedLocals` e `noUnusedParameters` in `tsconfig.base.json`, e **anche in
`apps/web/tsconfig.json`**, che è la cosa che non si vedeva da qui: quello non
estende la base ma il `tsconfig` generato da SvelteKit, quindi i due flag alla
radice non lo raggiungono. Nessuna dipendenza nuova, quindi nessuna questione
di licenza aperta.

Il parametro morto che teneva fermo l'albero è tolto: `findVoidsOfCourse`
riceveva un `EphemerisContext` e non lo toccava, per la ragione dichiarata alle
righe 92-93 dello stesso file — l'elezione è tropicale per scelta, e «il vuoto
di corso siderale non è una tecnica di nessuno».

Due cose sono andate meglio del previsto. Si temeva che coprire i `.svelte`
volesse qualcosa in più: non lo vuole, perché `svelte-check` legge i due flag
come **errori** e non come suggerimenti, e li applica ai componenti come ai
`.ts`. E accendendoli è saltato fuori subito un import morto vero, `ASPECT_GLYPH`
in `components/TransitAspectTable.svelte`, che nessuno aveva visto — il terzo
della serie, dopo i due che aprono questa voce.

Verificato aggiungendo un import inutile in `packages/core/src/place.ts` e una
costante inutile in `apps/web/src/lib/seo.ts`: cadono tutt'e due, la seconda
solo dopo il flag nel `tsconfig` dell'app.

### Il linter vero è una decisione a parte

Va deciso, e non è ovvio:

- **Quale strumento**, e con quale licenza — ogni dipendenza nuova deve essere
  compatibile con l'AGPL-3.0-or-later.
- **Se la formattazione entri o no.** Qui la cautela è concreta: i commenti di
  questo repo sono prosa italiana mandata a capo a mano, spesso su misura del
  ragionamento che portano. Un formattatore che li riflua non rompe niente e
  peggiora tutto, e il diff che ne esce non si rilegge. Il lint delle regole e
  la formattazione del testo sono due decisioni, e conviene prendere solo la
  prima.
- **Che cosa aggiunge, ora che i `.svelte` sono coperti.** Il primo passo li
  prende già, import e variabili morte comprese. Quello che un linter porta in
  più sono le regole che il compilatore non ha — le promesse non attese, i
  confronti che non possono essere veri — e vanno guardate una per una prima di
  accenderle tutte.

## 10. Il rinomino su GitHub, e i due riferimenti che lascia indietro — **fatto**

Il repository è `lineadicomando/dodicisegni`, e i due riferimenti che il
rinomino lasciava indietro sono aggiornati: `REPOSITORY_URL` in
`apps/web/src/lib/project.ts:16` e il remote della copia locale.

L'ordine obbligato è stato rispettato — prima il rinomino su GitHub, poi la
costante — e per la ragione che lo rendeva obbligato: `REPOSITORY_URL` è
insieme il recapito che l'informativa privacy dichiara e l'offerta del sorgente
che l'AGPL articolo 13 impone, quindi un collegamento rotto lì non è un refuso
ma una violazione di licenza. Cambiarla prima avrebbe rotto l'indirizzo per il
tempo che passava in mezzo.

Verificato che l'indirizzo nuovo risponda **200 diretto e non per redirezione**,
prima di scriverlo: GitHub redirige il nome vecchio, quindi un 200 raggiunto
saltando non avrebbe distinto un rinomino avvenuto da uno solo annunciato.

## 11. Gli elenchi che vivono in quattro posti

**Priorità media.** `AYANAMSAS` è dichiarato in `packages/core/src/ayanamsa.ts:44`,
di nuovo in `packages/mcp/src/tools.ts:88`, di nuovo in
`apps/web/src/lib/server/birth.ts:27` e una quarta volta in
`apps/web/src/lib/zodiacs.ts:28`. I sistemi di case stanno in cinque, contando
`HOUSE_SYSTEM_CODES` in `constants.ts:255`. Oggi combaciano tutti: verificati uno
per uno.

Il commento in testa a `ayanamsa.ts` dice che aggiungerne uno «è una riga qui».
Sono quattro, e due delle quattro non se ne accorgerebbero. `zodiacs.ts` e
`house-systems.ts` dichiarano `AyanamsaId` e `HouseSystem`, quindi il
compilatore le tiene legate al motore; `birth.ts` usa un `Set<string>` e il
server MCP uno `z.enum` scritto lì, e un settimo ayanamsa non produrrebbe
nessun errore da nessuna parte — le due superfici continuerebbero a rifiutarlo,
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
`packages/ruota/test/tipi.test.ts` — un test che confronta e cade a voce alta.

Verifica: un settimo ayanamsa in `AYANAMSAS`, e il test che cade nominando i
posti rimasti indietro.

## 12. Le funzioni che compongono gli indirizzi non hanno test — **fatto**

`apps/web/src/lib/api.test.ts` e `apps/web/src/lib/server/birth.test.ts`, in
tutto settantaquattro prove.

La proprietà che la pagina del tema dichiara per iscritto —
`apps/web/src/routes/+page.svelte:47`, «un indirizzo condiviso che
ricalcolasse un tema diverso da quello a schermo sarebbe il peggiore dei
difetti, perché non si vede» — non è provata guardando i nomi dei parametri,
che sarebbe copiarli una seconda volta. L'indirizzo composto da
`chartParameters` viene **dato da rileggere a `lib/server/birth.ts`**, cioè al
codice vero delle rotte, e si confronta quel che ne esce con la nascita di
partenza. Un nome cambiato da una parte sola cade lì, in tutt'e due i versi:
verificato rinominando `locationId` nel client (dodici prove rosse) e
`houseSystem` nella rotta (sedici).

Nello stesso giro passano i nove sistemi di case e i sei ayanamsa che il modulo
propone, presi da `house-systems.ts` e `zodiacs.ts` e fatti accettare alla
rotta. **Non chiude il punto 11**: lega due delle quattro copie fra loro, non
al motore, e un settimo ayanamsa aggiunto in `core` continuerebbe a non far
cadere niente.

### Quello che non si sapeva da qui

`api.ts` non era senza test: undici prove su `chartParameters`,
`transitParameters`, `skyParameters` e `skyCalendarParameters` vivevano in
`moment.test.ts`, dove erano arrivate al seguito di `MomentInput` e di
`shiftDate`. È la ragione per cui la lacuna sembrava totale ed era invece
parziale — e anche la ragione per cui conveniva toglierle di lì: un test che
sta nel file del modulo sbagliato non lo trova chi cerca, e in un repo dove
ogni modulo ha il suo `.test.ts` accanto è l'assenza a fare da indice. Ora
`moment.test.ts` prova `moment.ts` e basta.

Il dataset GeoNames è sostituito da due località — Napoli e Tokyo, che servono
anche a provare che i due luoghi di una richiesta di transiti non si scambino.
`getLocation` è l'unica cosa che `server/place.ts` gli chiede, e nessuna prova
deve dipendere da un database da 215 MB che potrebbe non essere stato
importato.

## 13. Due semplificazioni piccole

**Priorità bassa**, e nessuna delle due rompe niente.

`fetchChartCompact` (`apps/web/src/lib/api.ts:142`) e `fetchJyotishaCompact`
(riga 224) sono la stessa funzione scritta due volte: cambiano l'indirizzo e due
messaggi. Che non passino da `request` è giusto — quella risposta è testo e non
JSON — ma è una ragione che vale una volta sola.

`packages/core/src/chart.ts:64` calcola la distribuzione e la butta: viene
rifatta a riga 123, quando anche gli assi e la Parte di Fortuna esistono, ed è
quella la buona. La prima serve solo a costruire un `NatalChart` completo. Costa
un conteggio su tredici elementi, quindi non è una questione di tempo: è che in
un file dove ogni riga ha una ragione ce n'è una che non ne ha, e il commento
accanto spiega la seconda chiamata senza dire niente della prima.

## 14. Il calcolo tiene fermo il server mentre gira — **fatto**

Le tre ricerche che costano secondi — i passaggi dei transiti, il calendario del
cielo, l'elezione — girano in un pool di worker thread. Il rimedio è **attorno
al motore e non dentro**, come la voce prevedeva: la catena di calcolo resta
sincrona e il vincolo su `await` non è stato toccato.

Sta in `apps/web/src/lib/server/pool.ts`, senza dipendenze nuove — quindi
nessuna questione di licenza — e le tre rotte lo chiamano con `nelPool`.

### Quello che non si sapeva da qui, ed è la ragione per cui si poteva fare

**Lo stato globale dell'ayanamsa è per thread, non per processo.** La voce dava
per scontato il contrario, ed è per questo che chiamava il pool un rimedio da
rimandare: se `set_sid_mode` valesse per il processo, due richieste con
ayanamsa diversi servite da thread diversi si contaminerebbero, e il risultato
non sarebbe un errore ma un tema sbagliato di ventiquattro gradi. Ogni thread
carica invece la **sua istanza** del modulo nativo.

Verificato, e non dedotto: due worker che calcolano in parallelo con `lahiri` e
`raman` danno gli stessi valori che darebbero da soli, cifra per cifra. La
prova sta in `pool.test.ts` e tiene fermo il fatto — se un domani smettesse di
valere, il pool va smontato e non aggiustato.

### Perché solo tre rotte

Misurato su questa macchina: tema natale **0,4 ms**, passaggi su tre anni
**621 ms**, con la Luna **1884 ms**. Avviare un worker e caricarci il motore
costa **~50 ms**. Mandare un tema natale nel pool lo peggiorerebbe di cento
volte, quindi le rotte leggere restano sincrone: il pool è un rimedio a una
misura, non una regola di stile.

Il pool ha una **coda** e un tetto di thread — `min(4, nuclei − 1)`, uno resta
al filo principale, che deve poter servire le richieste leggere mentre le
pesanti girano. Un worker per richiesta, l'altra forma che questa voce
proponeva, sarebbe stato ~50 ms di avvio ogni volta e nessun tetto al numero di
thread: il problema di prima con un nome diverso.

### La misura che dice se è servito

Sul server compilato, una `/api/chart` lanciata mentre gira una ricerca di
passaggi da 1,94 s:

| | prima | dopo |
|---|---|---|
| richiesta leggera durante una pesante | **1,677 s** | **0,004 s** |

Il «prima» non è una stima: le rotte sono state rimesse nella forma sincrona,
ricompilate e rimisurate.

### Quello che è costato scriverlo

Il worker è **una sorgente e non un file**, ed è la sola bruttezza della voce.
Vite impacchetta il codice di server in `build/server/chunks`, quindi un file
lasciato fuori dalla pipeline andrebbe ritrovato a runtime in tre posti diversi
— `vite dev`, `build/index.js` e il `bundle/` che `apps/desktop` compone — con
tre percorsi da tenere allineati a mano. Un `data:` non ha percorso e non ne
può sbagliare nessuno. Da un `data:` però i nomi dei pacchetti non si
risolvono, e il motore arriva quindi come URL assoluta in `workerData`, risolta
dal thread principale, che sta in un file vero.

Verificato in tutti e tre gli ambienti, perché è l'unica cosa che poteva
rompersi in uno solo: i test, il server compilato, e il bundle di Electron
dove `node_modules` è composto a mano da `stage.mjs`. In tutti e tre le tre
rotte rispondono 200, e un errore di dominio resta un **400 con il suo codice**
— l'errore attraversa il confine smontato e si rimonta di qua, perché
`structuredClone` conserva il messaggio e perde la classe, quindi perderebbe il
`code`.

Verificato anche che i thread inattivi non trattengano il processo: il server
esce su `SIGTERM` dopo aver usato il pool.

### Quello che resta fuori, e non per dimenticanza

Il **server MCP** non ha un pool e non gli serve: è un processo per client, sul
trasporto stdio, e non c'è nessun'altra richiesta da tenere in attesa.

Resta vero che sotto carico vero i thread non bastano: sono quattro, e quattro
richieste pesanti insieme mettono in coda la quinta. Il tetto è voluto — il
lavoro è tutto CPU, e più thread che nuclei non calcolano niente di più — ma
se un giorno l'applicazione sta in rete pubblica con concorrenza seria, la coda
va guardata di nuovo, e non da dentro il motore.

## 15. Le cuspidi sono ancorate a una fonte esterna — **fatto**

`packages/core/test/houses.test.ts`: le dodici cuspidi dei nove sistemi su un
tema solo, confrontate al primo d'arco con valori che non vengono dal motore.
Centootto cuspidi, scarto massimo ventitré secondi d'arco.

Il tema è quello dell'esempio pubblicato da Jan Kampherbeek su **RadixPro** —
Enschede, 2 novembre 2016, 21:17:30 UT — dove il calcolo è svolto passo per
passo, con tutte le cifre intermedie, sulle formule di Geoffrey Dean (*Recent
Advances in Natal Astrology*, 1977, p. 185) e di Michael Munkasey (*An
Astrological House Formulary*). È aritmetica su carta, e copre Porfirio,
Regiomontano e Alcabizio. Gli altri sei vengono da **Astrolog 8.00** di Walter
D. Pullen, compilato dai sorgenti **senza il modulo Swiss Ephemeris** — che è
la sola precauzione che conti, e sta qui sotto.

Verificato scambiando le lettere, come la voce chiedeva: `O` con `B` fa cadere
Porfirio di sessantun primi, e anche `P` con `T` — la coppia più vicina di
tutte — cade, di sette primi. Il messaggio nomina il sistema e la cuspide.

### Quello che non si sapeva da qui, ed è la ragione per cui poteva non servire a niente

**Astrolog, compilato come esce dalla scatola, non calcola le case: le chiede a
Swiss Ephemeris.** `calc.cpp:2824` chiama `swe_houses_armc_ex2`, e il commento
sopra `ComputeHouses` lo dice in chiaro — «is only called when Swiss Ephemeris
is NOT computing the houses». Un confronto fatto con quel binario avrebbe
mostrato un accordo perfetto e non avrebbe provato niente, perché sarebbe stato
il motore contro sé stesso. Va disattivato `SWISS` in `astrolog.h` e usato
`-bm`: allora le cuspidi escono da `matrix.cpp` e `calc.cpp`, discendenti dalle
routine di James Neely per Matrix Software degli anni Settanta. È l'unica
precauzione che conti in tutta questa voce.

**Lo scarto residuo non è imprecisione, è una convenzione diversa, e si sa
quale.** I sette-ventitré secondi che restano sono sistematici e tutti dello
stesso segno: entrambe le fonti usano l'obliquità **media** dell'eclittica, il
motore quella **vera**. La differenza è la nutazione in obliquità, che a quella
data vale −8,67 secondi d'arco. Dando a Swiss Ephemeris lo stesso ARMC e la
stessa obliquità delle fonti — `houses_armc_ex2`, che li prende espliciti — i
nove sistemi rientrano entro **un secondo d'arco**, e sui tre di RadixPro
l'accordo è esatto fino all'ultima cifra pubblicata. La domificazione non
aggiunge errore: lo eredita dagli assi. È la ragione per cui un primo d'arco è
la tolleranza giusta e non se ne può chiedere meno.

**Le due fonti si sono trovate d'accordo fra loro al secondo d'arco** sui tre
sistemi che entrambe calcolano, arrivandoci per vie separate — aritmetica a
mano da una parte, codice di quarant'anni fa dall'altra.

**La tolleranza regge perché i nove sistemi su quel tema stanno larghi.** La
coppia più vicina è Placido/Topocentrico, a quarantadue primi: quaranta volte
la tolleranza. Il fatto è provato da un test suo, perché è quello che regge
l'altro — se due sistemi cadessero vicini, scambiarne le lettere non farebbe
cadere niente.

Due trappole più piccole. Astrolog con `-C` stampa Medio Cielo e Fondo Cielo
come **punti angolari** e non come cuspidi decima e quarta: nell'equale e nei
segni interi quelle sono un'altra cosa, e vanno derivate dalla definizione.
E le cuspidi non dipendono dai file delle effemeridi — obliquità e tempo
siderale sono analitici — quindi la prova vale identica con Moshier.

### Le fonti che sembrano indipendenti e non lo sono

Da non ricontrollare: **astro.com** e le sue tavole delle case in PDF,
**AstroSeek**, **Cafe Astrology**, **AstroLibrary**, e ogni libreria costruita
su `pyswisseph` o `sweph` — Kerykeion, flatlib, immanuel. Sono tutte lo stesso
motore visto da fuori.

Se un giorno servisse un secondo ancoraggio, la strada c'è ed è di pubblico
dominio: **Dalton, *The Spherical Basis of Astrology* (1911, settima edizione,
che incorpora le Raphael's Tables of Houses)**, su archive.org come
`sphericalbasisof00dalt`, senza restrizioni, cuspidi Placido al primo d'arco per
le latitudini da 22 a 60. L'OCR delle tabelle è illeggibile ma le pagine si
leggono a vista. Le tavole di Koch — le sue *Häusertabellen* del 1971 e il
*Koch Book of Tables* di Michelsen — ci sono ma sono in prestito, non
scaricabili.

## 16. L'importazione finisce e non lo dice a nessuno — **fatto**

A download completo la finestra di avanzamento restava aperta e ferma
sull'ultima riga del log: per andare avanti bisognava accorgersene leggendo,
chiudere la finestra a mano e riavviare il programma.

**Non era una regressione di Electron 43**: lo stesso `utilityProcess.fork` su
uno script che stampa e finisce si comporta identico sulla `38.8.6` e sulla
`43.4.1`. Un figlio avviato così non esce quando il suo event loop si svuota,
perché il canale col processo padre lo tiene vivo, e `import-geonames.mjs`
chiude tutto quello che apre e finisce senza chiamare `process.exit`. La
promessa su `processo.once('exit')` non si risolveva mai, quindi
`splash.destroy()` non veniva mai raggiunto.

Le quattro vie, misurate prima di scegliere:

| | codice d'uscita | ultima riga del log |
|---|---|---|
| com'era | non esce | completa, ma la finestra resta |
| `process.exit(0)` nel figlio | 0 | **persa** |
| `process.parentPort?.close()` | **1** | completa |
| `exitCode = 0` più `parentPort.close()` | **1** | completa |

Le due che il processo lo chiudono davvero sbagliano ciascuna una cosa.
`process.exit` tronca l'output, perché su una pipe `console.log` scrive in modo
asincrono e le righe che si perdono sono proprio il riepilogo finale; chiudere
`parentPort` conserva l'output ma esce con `1`, che `importaDatabase`
leggerebbe come fallimento di un'importazione andata bene.

Ha vinto la quinta, che era da valutare per prima: `ELECTRON_RUN_AS_NODE` con
`child_process.spawn` su `process.execPath`. Dà al figlio la semantica di Node
vera — esce da solo, col suo codice d'uscita e tutto il suo output — e il
binario resta quello di Electron, quindi l'ABI non cambia e il modulo nativo di
SQLite si carica come prima. Il rimedio sta tutto in `apps/desktop/src/main.ts`
e `packages/geo` non si tocca, che è la sponda giusta: quello script serve
anche alla riga di comando e al container, dove si comportava già bene.

`utilityProcess` resta dov'era per il server, che invece deve **restare vivo**:
è la stessa proprietà, guardata dai due lati.

Verificato eseguendo l'importazione vera — non un finto script — col binario e
i moduli presi dall'AppImage impacchettata: dodici secondi riusando la cache
dei sorgenti, codice d'uscita `0`, log completo fino a «Fatto.», database di 90
MB costruito.

### La seconda metà, che si vedeva solo dopo la prima

Chiusa la finestra dell'importazione, l'applicazione si chiudeva con lei:
`window-all-closed` scatta nell'istante in cui quella sparisce, e la finestra
vera non esiste ancora — il server sta ancora salendo. Il rimedio è una guardia
su `avviato` nell'ascoltatore, che lascia passare la chiusura solo da quando la
finestra vera è stata aperta la prima volta.

Era lo stesso difetto visto dall'altro capo, e finché la splash non si chiudeva
da sola non si poteva vedere: chi la chiudeva a mano faceva scattare quella
stessa riga, ed è la ragione per cui l'importazione sembrava chiedere un
riavvio. Provato in isolamento — una finestra distrutta, una seconda aperta un
secondo e mezzo dopo — con la guardia e senza: senza, l'applicazione muore
prima della seconda.

### E i secondi di silenzio dopo «Scarica ora»

Fra il consenso e la comparsa della finestra passavano un paio di secondi
senza niente a schermo. Non è il caricamento della pagina, che è di 0,3: è il
primo processo renderer dentro l'AppImage, dove le librerie di Chromium si
leggono da un filesystem compresso — misurati 2,1 secondi contro i 0,3 dello
stesso codice in un albero non impacchettato.

La finestra si costruisce quindi **prima** del dialogo e resta invisibile, così
quei secondi passano mentre chi legge decide; alla scelta, `show()` costa un
millesimo. Chi risponde «Continua senza» o «Esci» non la vede mai, perché viene
distrutta lì. Nel frattempo il `<pre>` non è più vuoto: porta una riga
d'attesa, che la prima riga vera dello scaricamento porta via.

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
lo fa già, e il Regiomontano è fra i nove sistemi (`server.ts:159` lo descrive
già come «tradizionale nell'astrologia oraria»). Ci sono anche:

- `applying` sugli aspetti (`aspects.ts:170`), gli istanti esatti in
  `findSkyPassages` (`sky-passages.ts:58`), le stazioni in `findStations`, gli
  ingressi in `findSignIngresses`;
- `retrograde` e `speed` (`types.ts:622`);
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
l'àncora esterna, come le cuspidi del punto 15: ricalcolare la figura e
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
`packages/lettura/src/tropicale.ts:86` dice al modello che domicilio,
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
   `format.ts`; `tropicale.ts` passa da «li ricavi dal segno» a «li trovi nella
   tabella», e dice che le colonne sono due e perché. È il commit che chiude il
   difetto, e va fatto per primo anche se il resto aspetta.
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

## Esaminato, e lasciato stare

**`cookie@0.6.0` sotto SvelteKit** — `npm audit` conta tre vulnerabilità basse:
`cookie`, `@sveltejs/kit` e `@sveltejs/adapter-node` sono la stessa cosa vista da
tre punti della catena, e portano a una copia sola in
`node_modules/@sveltejs/kit/node_modules/cookie`. Quella di primo livello è
`0.7.2` e sta bene.

Tre ragioni per non farci niente, e la terza è quella che chiude il discorso.

1. **Non esiste una correzione.** L'ultima versione pubblicata di SvelteKit
   dipende ancora da `cookie@^0.6.0`, esattamente come quella installata. Il
   `fixAvailable` che npm propone è `@sveltejs/kit@0.0.30`, un pre-release del
   2023: **`npm audit fix --force` qui rompe il progetto invece di ripararlo.**
2. **Il codice viene messo in rete davvero**, e su questo `npm audit --omit=dev`
   inganna: dice zero perché SvelteKit è una dipendenza di sviluppo, ma il suo
   runtime viene incorporato nel server compilato. La stringa d'errore di
   `cookie` si trova in `apps/web/build/server/chunks/`.
3. **Non c'è un punto di chiamata.** L'avviso riguarda `serialize()`, che accetta
   caratteri fuori intervallo in nome, path e domain: serve a qualcosa solo se
   ci arriva input non fidato. Non esiste `hooks.server.ts`, e in tutto il repo
   `cookies.` non compare mai. Questa applicazione non imposta cookie.

Da riguardare quando SvelteKit alza la dipendenza, non prima.
