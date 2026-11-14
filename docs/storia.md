# Storia del lavoro

## Le voci chiuse

I numeri delle voci del `TODO.md` sono stabili, e una voce chiusa non si
riusa. L'ultima versione del file che le contiene tutte, chiuse comprese, è
`cf5219a`, quando si chiamava ancora `ROADMAP.md`. Le voci chiuse dopo, col
commit in cui si leggono ancora per intero (`git show <commit>:TODO.md`):

Dal 13 novembre 2026 ogni voce ha un file in `docs/voci/`: una voce chiusa da
allora si rilegge con `git show <commit>:docs/voci/<file>`, e la colonna
porta il nome del file.

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
| 30 | `66600e5` |
| 35, `35-liste-senza-tetto.md` | `fc3fa36` |
| 38, `38-reggitore-del-giorno.md` | `1fc934e` |
| 39, `39-mcp-elenchi-vuoti.md` | `c41ffbd` |
| 37, `37-ingressi-stazione.md` | `d6a0be7` |
| 36, `36-pool.md` | `8c80e20` |
| 31, `31-versione-nelle-risposte.md` | `bd6f720` |
| 32, `32-testo-compatto.md` | `b7fda5a` |
| 41, `41-oraria-significatore.md` | `118b487` |
| 44, `44-mcp-descrizioni.md` | `0460867` |
| 40, `40-errori-rotte.md` | `2c3b3e4` |
| 42, `42-tempo-medio-locale.md` | `7ec1eb5` |
| 43, `43-mcp-risposte-enormi.md` | `c2a98b2` |
| 47, `47-input-motore.md` | `7a2ac59` |
| 48, `48-contorno.md` | `2aaff7b` |
| 28, `28-seo.md` | `acc68d7` |
| 34, `34-doppia-licenza.md` | `acc68d7` |
| 50, `50-tempo-del-luogo.md` | `73fccb5` |
| 45, `45-interfaccia-corse.md` | `f43c550` |

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
| 0.14.0 | la terza modalità è `mutevole`, non `mobile` (cambia il campo della distribuzione e quattro regole dei varga) | 30 |
| 0.15.0 | le case oltre il circolo polare, l'ora ambigua, Moshier dichiarato fuori copertura, le coordinate mancanti (il fascicolo canonico non le vede) | — |
| 0.16.0 | un corpo o un varga chiesto due volte è una domanda sola; `bodies` e `vargas` più lunghi dei valori ammessi sono rifiutati (il fascicolo canonico non chiede doppioni) | 35 |
| 0.17.0 | il reggitore del giorno planetario dal tempo medio locale del luogo, non dal fuso della richiesta (il fascicolo canonico chiede luogo e fuso concordi) | 38 |
| 0.18.0 | gli elenchi vuoti nei tool MCP, un bersaglio natale sconosciuto e il vuoto di corso senza corpi sono errori; il prompt dell'oraria tiene l'ora senza la data (il fascicolo canonico non li chiede) | 39 |
| 0.19.0 | gli ingressi, i passaggi e gli incontri che si fanno e si disfano dentro un passo accanto a un'inversione del moto; la finestra con orbite sostituite oltre i quattro gradi (il fascicolo canonico non ne contiene) | 37 |
| 0.19.1 | l'intestazione `X-Dodicisegni-Version` su tutte le risposte di `/api` | 31 |
| 0.20.0 | `format=compact` sulle sei rotte di calcolo che non l'avevano; `/api/horary` e `/api/sky/course` rifiutano un formato sconosciuto invece di servire il JSON | 32 |
| 0.21.0 | l'oraria con un significatore non calcolabile dà `DATA_NON_VALIDA` invece di un `TypeError` | 41 |
| 0.22.0 | `draw_chart_wheel` accetta le larghezze da 200 a 4000 come il quadro e le rotte (prima 400–2000); quattro descrizioni MCP legate al codice | 44 |
| 0.23.0 | un fuso sconosciuto è sempre 400; i messaggi non portano percorsi del server; `/api/jyotish` fuori copertura dà `DATA_NON_VALIDA`; l'arco dell'elezione a estremi compresi; le 24:00 con l'avviso | 40 |
| 0.24.0 | un'ora data prima dell'ora unica porta l'avvertenza che è stata letta come tempo medio della città del fuso; `/metodo#tempo-medio` | 42 |
| 0.25.0 | oltre mille righe `find_transit_passages`, `find_active_transits`, `find_sky_events` e il testo compatto delle tre rotte gemelle rispondono `RISPOSTA_TROPPO_LUNGA`; il JSON delle rotte resta senza tetto | 43 |
| 0.26.0 | il corso nel segno cerca gli ingressi con le effemeridi chieste e non con quelle predefinite (un minuto di differenza nel fascicolo, `oraria.json`); orbite non finite o negative, ordini di dasha fuori da 1–3 e giorni giuliani non finiti si rifiutano; `normalize360` non rende più 360; la riga di comando ha il tetto di tre anni | 47 |
| 0.26.1 | l'ora di nascita si può leggere sul tempo medio o sul tempo vero del luogo: `clock` su rotte e MCP, `--orologio` sulla riga di comando, un interruttore nel modulo | 50 |

## Le sessioni

- **30 ottobre 2026.** Chiuse le voci 5, 25 e 26 (le rifiniture del Jyotisha
  e delle scuole occidentali), dalla 0.6.0 alla 0.12.0, con le scelte in
  `docs/decisioni.md`; rivista la prosa del sito con la skill di scrittura
  italiana anti pattern AI (`750708f`); dasha e i suoi periodi al femminile
  (0.13.0); aperta la voce 30; il `TODO.md` diviso fra sé e `docs/`.
- **30 ottobre 2026, dopo.** Chiusa la voce 30 (0.14.0), e pubblicato tutto:
  push da `v0.5.2` a `v0.14.0` e deploy. Voce 28, i quattro domini: sul
  server mancava il `.env`, e ora `/srv/dodicisegni/.env` porta
  `ORIGIN=https://dodicisegni.it` (git lo ignora); in Cloudflare una
  *Single Redirect* per zona, 301 con destinazione dinamica
  `concat("https://dodicisegni.it", http.request.uri.path)` e la query
  conservata: nella zona `12segni.it` su tutte le richieste, con *Always Use
  HTTPS* spento, nella `dodicisegni.it` su `http.host eq
  "www.dodicisegni.it"`. Verificato con `curl -sI` sui tre nomi secondari,
  in `http` e `https`: un salto solo, percorso e query intatti.
- **13 novembre 2026.** Revisione dell'intero progetto, in tre letture
  (motore, `apps/web`, i pacchetti minori col desktop): aperte le voci 35–49
  del `TODO.md`, l'ultima per ciò che la revisione non ha letto. Quattro
  difetti corretti subito, senza voce: oltre il circolo polare Placidus e
  Koch davano un errore invece del ripiego su Porfirio con l'avvertenza
  (`houses.ts` prendeva per fallimento il flag negativo con cui Swiss
  Ephemeris lo segnala); l'ora ambigua del ritorno all'ora solare dava
  un'occorrenza o l'altra secondo la stagione in cui si calcolava (`time.ts`
  la lasciava sciogliere a Luxon, che parte dall'offset di adesso); fuori dal
  1800–2399 il risultato si dichiarava `swisseph` mentre Swiss Ephemeris era
  passato a Moshier (`computeBodies` ora rende la modalità usata, con
  un'avvertenza); una richiesta con fuso e senza coordinate riceveva il tema
  di 0°N 0°E (`lib/server/place.ts`, `Number(null)`).
- **13 novembre 2026, dopo.** Il `TODO.md` diventa un indice e le voci vanno
  una per file in `docs/voci/`; ricontrollati sulla 0.15.0 tutti i
  riferimenti `file:riga`; ciò che la revisione ha trovato a posto è in
  `docs/esaminato.md`.
- **13 novembre 2026, sera.** Chiusa la voce 35 (0.16.0): `findSignIngresses`,
  `findStations` e `computeJyotisha` tolgono i doppioni, e le due rotte
  rifiutano l'elenco più lungo dei valori ammessi (`lib/server/elenco.ts`).
  Contro il server compilato le due richieste della voce rispondono 400 in
  centesimi di secondo.
- **13 novembre 2026, sera, poi.** Chiusa la voce 38 (0.17.0): `rulerOfDay`
  prende la longitudine e non il fuso. Tokyo alle 03:40 UT del 13 novembre
  2026 dà Venere con `Asia/Tokyo`, `UTC` e `Europe/Rome`.
- **13 novembre 2026, notte.** Chiusa la voce 39 (0.18.0). Negli schemi MCP
  ogni elenco vuole almeno una voce. Due controlli sono finiti nel motore e
  non nel server MCP, perché valgono per ogni superficie: `natalTargets`
  rifiuta con `CORPO_SCONOSCIUTO` un nome che non è un punto natale (quello
  che esiste ma manca nel tema resta un avviso), e `findElectionHours`
  rifiuta `bodies` vuoto o con la sola Luna, anche su `/api/election`.
- **13 novembre 2026, notte, poi.** Chiusa la voce 37 (0.19.0). I campioni
  si tagliano dove il moto si inverte (`splitAtTurns` in `roots.ts`): alla
  stazione per gli ingressi e i passaggi natali, dove la velocità relativa
  cambia segno per gli incontri fra due corpi. La parte che la voce dava per
  dedotta è stata riprodotta prima di toccarla: la stessa ricerca su un
  secolo con la griglia spostata di qualche ora (quattro fusi) dava 8903 o
  8905 incontri e da 34290 a 34292 passaggi natali; ora 8905 e 34300 in
  tutti e quattro. Riprodotto e corretto anche il margine fisso: con `orbs`
  oltre i quattro gradi la finestra mancava sugli archi corti, e ora il
  margine segue l'orbita più larga chiesta (`widestOrb`). Resta com'era che
  accanto a una stazione l'istante regge al minuto e non oltre: lo stesso
  ingresso esce alle 04:20 o alle 04:21 secondo la griglia.
- **13 novembre 2026, notte fonda.** Chiusa la voce 36, senza versione. Le
  quattro rotte del pool passano `request.signal`: la richiesta annullata
  esce dalla coda, la coda ha un tetto (503 `SERVER_OCCUPATO`), e quando un
  thread muore ciò che aspettava viene smistato, cosa che la voce dava per
  dedotta e che una prova ha confermato (senza, la coda restava pendente).
  Contro il server compilato, dopo sedici richieste di tre anni lasciate
  cadere a 0,3 s, quella di un mese aspetta 5,0 s invece di 23,8 e il
  processo sta a 376 MB invece di 870; di quaranta richieste lunghe tenute
  aperte insieme, venti servite e venti rifiutate. Le scelte sono in
  `docs/decisioni.md`. Resta alla voce 45 l'`AbortController` in
  `lib/api.ts`: il server ora sa chi se n'è andato, ma l'interfaccia non
  annulla ancora le richieste che supera.
- **13 novembre 2026, a mezzanotte.** Pubblicato tutto: push da `v0.15.0` a
  `v0.19.0` e deploy, col footer alla 0.19.0 e le rotte toccate provate sul
  sito. Poi chiusa la voce 31 (0.19.1): un `handle` in
  `apps/web/src/hooks.server.ts`, il primo hook del server, mette la
  versione su ogni risposta di `/api`, il 404 di un indirizzo che non esiste
  compreso. La prova passa dall'hook risposte già pronte; le rotte vere sono
  state controllate con `curl` contro il server compilato.
- **14 novembre 2026.** Chiusa la voce 32 (0.20.0). `readFormat` sta in
  `lib/server/formato.ts` e lo leggono tutte e dieci le rotte di calcolo.
  La voce diceva terza cifra; si è mossa la seconda, perché con lei si
  chiude la riga della 40 su `format=xml`: `/api/horary` e `/api/sky/course`
  rispondevano 200 in JSON e ora 400, cioè una domanda che aveva una
  risposta ne riceve un'altra. Le risposte JSON non cambiano e il fascicolo
  canonico non si è mosso. Confrontato una volta, contro il server
  compilato, il testo delle sei rotte con quello dei sei tool MCP per gli
  stessi input: uguale carattere per carattere. La prova stabile
  (`rotte-compatte.test.ts`) chiama le rotte e confronta con le funzioni di
  resa del motore, perché `apps/web` non dipende dal server MCP.
- **14 novembre 2026, poi.** Chiusa la voce 41 (0.21.0). Il codice è
  `DATA_NON_VALIDA` e non `ERRORE_EFFEMERIDI`, che sulle rotte è un 500: una
  data fuori copertura è di chi chiede. Il messaggio non riporta le
  avvertenze del cielo, che portano il percorso delle effemeridi (voce 40).
- **14 novembre 2026, ancora.** Chiusa la voce 44 (0.22.0). Le orbite a
  confronto in `compute_transits` si leggono dal motore; il testo delle
  dasha senza ora dice «inservibili» come l'avvertenza; `find_election_hours`
  conta i giorni estremi compresi, come il motore, e usa la sua costante.
  La seconda cifra si muove per la sola larghezza della ruota. La rotta
  `/api/election` ha lo stesso conteggio a estremi esclusi e non è stata
  toccata: l'arco di trentadue giorni lo rifiuta comunque il motore, con
  `INTERVALLO_NON_VALIDO` invece di `INTERVALLO_TROPPO_LUNGO`. Sta nella
  voce 40.
- **14 novembre 2026, sera.** Chiusa la voce 40 (0.23.0), riga per riga e
  riprovata contro il server compilato. Scelte prese qui: l'errore imprevisto
  e il database delle località assente danno un testo fisso, e il messaggio
  vero va su `console.error`; i messaggi di Swiss Ephemeris perdono il
  percorso della cartella nel motore (`withoutPaths` in `errors.ts`), non
  nelle rotte, perché escono anche dalla CLI e dal server MCP; le 24:00 non
  si rifiutano, perché sui documenti si trovano, ma portano un'avvertenza;
  il tema vedico senza Sole o Luna è `DATA_NON_VALIDA`, come l'oraria della
  voce 41. `rotte-compatte.test.ts`, entrato con la 0.20.0, aveva sedici
  asserzioni di tipo superflue che il lint segnala: i commit dalla 0.20.0
  alla 0.22.0 non lo passano, questo sì.
- **14 novembre 2026, notte.** Chiusa la voce 42 (0.24.0) per la via che il
  proprietario ha scelto: dichiarare, non correggere. Il segno è uno scarto da
  Greenwich che non fa un numero intero di minuti, il solo che il runtime
  lasci: non distingue il tempo locale dal tempo di una capitale esteso per
  legge a tutto il paese, e l'avvertenza è scritta per valere in entrambi i
  casi. Senza l'ora non si emette. Il fascicolo canonico non si muove (non ha
  nascite così vecchie): la seconda cifra la decide la voce, perché un tema
  del 1850 riceve un'avvertenza che prima non aveva. Aperta la voce 50, la
  via esplicita per chi sa che l'orologio seguiva il meridiano del luogo.
- **14 novembre 2026, notte, poi.** Chiusa la voce 43 (0.25.0) come ha scelto
  il proprietario: un tetto alle righe, come errore e non come taglio, dove
  legge un agente (i tre tool MCP in entrambi i formati, e `format=compact`
  sulle rotte); il JSON delle rotte intatto. Il tetto è `MAX_READABLE_ROWS`
  in `format.ts`, mille righe, scelto sulle misure scritte nel suo commento:
  un anno coi corpi predefiniti (circa 450 righe) e tre mesi di Luna (circa
  370) passano, tre anni coi predefiniti (circa 1400, 117–138 mila caratteri)
  no, e prima erano serviti. Il calcolo si paga prima del rifiuto: 4,2 s per
  la chiamata peggiore della voce, che ora rende 226 caratteri invece di
  1.220.988. `find_sky_events` con la sola Luna su tre anni passa (23 mila
  caratteri): il numero della voce veniva dalla Luna insieme agli altri
  corpi. La riga di comando non ha tetto: chi la usa ha un terminale e un
  file.
- **14 novembre 2026, mattina.** Pubblicata la 0.25.0 (push e deploy,
  verificata sul sito). Chiusa la voce 47 (0.26.0), una prova per riga in
  `test/input.test.ts`. La riga *dedotta* era vera e muove il fascicolo:
  `findIngress` non inoltrava `ephemerisPath`, quindi il corso nel segno di
  un calcolo Moshier cercava gli ingressi con i file Swiss della cartella
  predefinita, e `entered` dell'oraria canonica si sposta di un minuto. È la
  ragione della seconda cifra. Scelte prese qui: l'orbita zero resta ammessa,
  perché è il modo di spegnere un aspetto e le convenzioni lo usano; il
  tetto di tre anni agli archi **non entra nel motore**, perché
  `findSignCourse` cerca fino a 1100 giorni e chi importa la libreria paga
  ciò che chiede: `MAX_RANGE_DAYS` sta in `roots.ts` come numero unico, e lo
  applicano il sito, il server MCP e ora la riga di comando; gli ordini di
  dasha hanno il codice `LIVELLI_DASHA_NON_VALIDI`, lo stesso che la rotta
  usava già di suo.
- **14 novembre 2026, mattina, poi.** Chiusa la voce 48, senza versione.
  Il lint gira nei controlli, dopo `typecheck`. `npm audit fix`: in
  produzione zero segnalazioni (`npm audit --omit=dev`); ne restano sedici
  negli strumenti (`minimatch`, `deepmerge` sotto eslint ed
  electron-builder), nessuna alta, che si chiudono solo con `--force` e un
  salto di versione maggiore: lasciate. Le tre prove di `ruota` continuano a
  importare i tipi di `core`, perché disegnano una carta fatta come la fa il
  motore: corretta la frase di `CLAUDE.md`, non le prove. Il desktop non è
  stato eseguito: la correzione dello splash è scritta sulla lettura, e
  passa i tipi. Le intestazioni: né Caddy né Cloudflare ne aggiungono
  (`curl -sI`, 14 novembre), quindi `Referrer-Policy: same-origin` e
  `X-Content-Type-Options: nosniff` stanno nell'`handle`, su pagine e
  `/api`, provate sul server compilato. Niente Content-Security-Policy e
  niente `X-Frame-Options`: la prima va provata pagina per pagina, e nessuna
  delle due ha oggi qualcosa da proteggere (nessun account, nessuna azione).
- **14 novembre 2026, più tardi.** Chiuse due voci sulla parola del
  proprietario, senza codice. La 28: ha letto gli strumenti dei motori e non
  risultano pagine escluse, quindi non c'è altro da fare. La 34: dodicicase è
  fermo, e `ruota` e `lettura` restano AGPL come il resto (in
  `docs/decisioni.md`). La 33, che serve a dodicicase, resta aperta ma non ha
  più fretta.
- **14 novembre 2026, pomeriggio.** Chiusa la voce 50 (0.26.1), col tempo
  medio e col tempo vero come ha chiesto il proprietario. È un'opzione della
  nascita, `clock`, accanto al fuso e non al suo posto: il fuso serve ancora a
  tutto il resto (gli archi, le ore scritte dei transiti), e un valore
  speciale al suo posto li avrebbe rotti. `ResolvedTime` porta `clock` solo
  quando non è `fuso`, quindi nessuna risposta di prima cambia: terza cifra,
  e il fascicolo guadagna `orologio.json` senza toccare gli altri. Il tempo
  vero usa `swe_time_equ`, esposta in `equationOfTimeMinutes`; equazione e
  scarto del meridiano sono arrotondati al secondo, perché fra i file `.se1`
  e Moshier corrono centesimi che avrebbero dato due giorni giuliani diversi
  su due macchine. Vale per le nascite (ogni rotta e tool che ne parte, e il
  prompt di lettura); un istante senza luogo lo rifiuta con
  `OROLOGIO_NON_VALIDO`. Provato sul server compilato e nel browser: Lecce
  1850, 23 e 26 minuti prima della lettura col fuso, Ascendente spostato di
  quattro gradi e mezzo e di cinque.
- **14 novembre 2026, sera.** Pubblicata la 0.26.1 (push e deploy,
  verificata sul sito). Chiusa la voce 45, senza versione, riproducendo ogni
  punto in un browser sul server compilato. Il link di `/vedica` ora
  ricostruisce tutte le opzioni (`lib/vedica-opzioni.ts`, l'inverso di
  `jyotishaParameters`). Link e lettura di tema, vedica e transiti vengono dai
  parametri di ciò che è a schermo (`mostrati`), non dal modulo: cambiata la
  data senza ricalcolare, il link copiato è rimasto quello del tema mostrato.
  Le corse si chiudono con `Corsa` (`lib/corsa.ts`), che annulla la richiesta
  precedente con un `AbortController`: passaggi, calendario del cielo,
  elezione e ricerca delle località. Provato ritardando la prima risposta:
  due passi di ‹ › nell'elezione, e «ro» poi «roma» nella ricerca; la prima
  richiesta risulta annullata e a schermo resta la seconda. «Nessun
  risultato» non compare più durante l'attesa della battuta. I passaggi e il
  calendario usano lo stesso codice e non sono stati riprodotti a parte. Il
  contatore `ultima` dei tre `calcola` è rimasto com'era: funziona, e quelle
  rotte non passano dal pool.
