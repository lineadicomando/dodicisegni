# Le sessioni

Una voce per sessione di lavoro, in ordine di tempo: che cosa si è chiuso,
le scelte prese strada facendo e le misure fatte. **Non si legge intero**: si
cerca per numero di voce (`voce 43`), per versione o per parola. Le scelte
che restano valide stanno anche in `docs/decisioni.md`; qui c'è il come ci
si è arrivati. Le tavole delle voci chiuse e delle versioni sono in
`docs/storia.md`.

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
- **14 novembre 2026, tarda sera.** Chiusa la voce 46, senza versione e
  **senza toccare `schema.sql`**: la voce dava per necessaria una
  reimportazione, e non lo è. `search_name` è già normalizzato, quindi il
  prefisso si cerca come intervallo (`>= 'rom' AND < 'rom' + U+10FFFF`) e
  l'intervallo usa l'indice che c'era, `idx_location_names_search`: il piano
  passa da `SCAN n` a `SEARCH n USING COVERING INDEX`. Misurato sul dataset
  vero con venti query (latine, cirilliche, giapponesi, coi metacaratteri di
  LIKE), a 8 e a 50 risultati: stessi risultati nello stesso ordine, e da
  53 ms a meno di uno per tre lettere; una lettera sola resta fra 10 e 75 ms,
  perché le righe da raggruppare sono centinaia di migliaia, ma l'interfaccia
  cerca da due. Un file che non è un database dà `DATABASE_CORROTTO` e non
  resta in cache (`PRAGMA schema_version` all'apertura); una query di
  sessantamila caratteri non trova niente, senza errori; lo schema di
  `search_location` ha un `max(200)`. I `.txt` di GeoNames si controllano
  come tavole, in cache e appena scaricati. Il proprietario aveva dato il via
  libera a lavorare sul server per la reimportazione: non è servito.
- **14 novembre 2026, dopo la voce 46.** Voce 49, prima riga (le tavole di dottrina),
  scuola di Lilly. Rilette sull'immagine, non sulle trascrizioni: la tavola
  di p. 104 cella per cella (domicili, esaltazioni coi gradi e i Nodi,
  triplicità, i sessanta termini, le trentasei facce, esilio e caduta) contro
  `dignita-lilly.ts` e i domicili, l'esilio, le esaltazioni e le cadute di
  `dignita.ts`; la tavola di p. 115 contro i punti di `condizioni-lilly.ts`;
  quella di p. 145 contro la Parte di Fortuna; i sette moti medi (pp. 57,
  61, 65, 69, 72, 76, 80); le soglie di p. 113 (8°30', 17°, 17') e di p. 122
  (0-2 e 27-29 gradi, la Via Combusta); p. 125 contro
  `qualitaDellaPerfezione`. Tutte le costanti combaciano. Contro le sole
  trascrizioni, senza riaprire l'immagine: le nature dei sette (pp. 58-81),
  orientale e occidentale e l'assedio (p. 114), il partile (p. 106), i
  cinque gradi (p. 33), le definizioni di pp. 108-113 e 126 e le
  considerazioni di pp. 121-123; le regole del codice le seguono. Un solo
  difetto, la voce 51: a p. 125 il sestile e il trigono hanno una terza
  condizione («no malevolent Aspect to intervene») che l'oraria non riporta.
  Due cose notate e lasciate, perché sono letture già dichiarate nei
  `readings`: la frustrazione di p. 112 è «corporally», e il motore la dà per
  qualunque aspetto del più pesante con uno più pesante ancora; una ricezione
  mutua mista (uno per domicilio, l'altro per esaltazione) non prende punti
  dalla tavola di p. 115 e non toglie il peregrino. Nessuna costante della
  scuola è senza pagina. Non lette in questa sessione: `orbite.ts` e
  `corso.ts` (seconda riga della voce) e `apps/web/src/lib/case-lilly.ts`.
- **14 novembre 2026, sulla voce 51.** Cercato nel libro di Lilly che cosa
  sia il «malevolent Aspect» di p. 125, senza toccare il codice. Lette a
  vista e salvate le pp. 102, 184-186, 260, 310-311, 317, 385, 387-388, 445
  e 530. L'aspetto malevolo è il quadrato o l'opposizione, di qualunque
  pianeta (pp. 102, 106, 260); ciò che «intervenes» ha altrove i nomi delle
  definizioni (p. 317, p. 445). Ricalcolate due figure che Lilly giudica:
  quella di p. 220 e quella del cap. LIX (p. 385, 27 giugno 1646 gregoriano
  alle 07:26: il motore dà l'ora di Saturno e il sestile Sole-Saturno il
  giorno che dice Lilly). In tutte e due la Luna cosignificatrice porta
  quadrati o opposizioni ai significatori prima della perfezione, e Lilly
  non li conta o li conta a favore. Non si è trovata una figura in cui un
  terzo, non la Luna, faccia cadere la condizione. La lettura proposta è nel
  file della voce e aspetta la conferma del proprietario.
- **14 novembre 2026, chiusa la voce 51 (0.27.0).** Il proprietario ha
  confermato la lettura. `qualitaDellaPerfezione` dà per sestile e trigono
  una terza voce, `nessun-aspetto-malevolo`, dal corso dei due significatori
  che il calcolo aveva già; il dettaglio nomina chi arriva prima. Provata su
  tre figure: Roma, 1 gennaio 2026 alle 9 (il Sole passa dall'opposizione di
  Giove prima del sestile di Saturno: la condizione cade, e non era una
  proibizione, perché Saturno è il più pesante); p. 220 e il cap. LIX di
  p. 385, dove vale come le legge Lilly. Tolta l'esclusione della Luna le due
  figure di Lilly cadono, ed è la prova che la regge. Nel fascicolo canonico
  cambia solo l'elenco delle letture di `oraria.json`. Aggiornati il
  documento di lettura dell'oraria e `/metodo`; tabella compatta, pagina e
  tool stampano le voci di `quality` che arrivano e non sono stati toccati.
- **14 novembre 2026, riordino.** `TODO.md` e la voce 49 riscritti per
  riprendere: la voce ha le nove righe numerate con lo stato, e ciò che le
  voci 45, 46, 50 e 51 non hanno provato a mano sta nella riga dove lo si
  proverà (5 e 9). Verificato che ogni file e ogni nome citato esista nel
  codice. In `docs/lavorare.md`, *Rileggere una tavola*, gli strumenti con
  cui si è riletto Lilly.
- **15 novembre 2026.** Voce 49, prima riga, scuola di Tolomeo. Le tavole
  erano state lette il 29 ottobre sull'HTML di LacusCurtius, salvo i
  termini: rilette ora sulla scansione della Loeb. I.17 (pp. 79-83) contro
  `DOMICILI_TRADIZIONALI`, I.19 (pp. 89-91) contro le esaltazioni e le
  «depression», I.18 (pp. 83-87) contro `TRIANGOLI` coi co-reggenti
  dell'acqua, la tavola greca di p. 106 cella per cella contro `TERMINI`
  (nella Bilancia il 5 del terzo tratto è sbiadito e il totale 16 lo
  conferma), i passi di p. 103 (le somme) e p. 105 (il Leone a Saturno nel
  testo, Venere sola sul triangolo del Toro), l'apparato di pp. 106-107
  contro `PTOLEMY_TERMS_SOURCE`. Ricontate le somme sulla tavola compilata:
  57, 79, 66, 82, 76. Riletti anche Firmico p. 44 (i sette gradi delle
  esaltazioni, con le tre correzioni dell'apparato già nella sua `FONTE.md`)
  e Leo p. 117. Tutto combacia, nessun difetto, nessuna costante senza
  pagina. Resta una frase senza fonte salvata: in `DOMICILI_MODERNI`
  Urano all'Acquario «già nell'Ottocento (Varley, 1828)» viene da una fonte
  secondaria che il commento non nomina e che `texts/` non ha; è una nota
  storica, non un valore, e il commento lo dichiara. Pagine salvate in
  `texts/occidentale/tolomeo-tetrabiblos-robbins-1940/pagine/`.
- **15 novembre 2026, dopo Tolomeo.** Voce 49, prima riga, scuola di
  Valente. I termini di I.3 riletti tutti e dodici sulle foto di Pingree
  (finora la trascrizione ne riportava tre e diceva «come Kroll» per gli
  altri nove): sessanta celle, combaciano con `TERMINI`; ricontate le somme
  dichiarate in `VALENS_TERMS_SOURCE` (57, 80, 68, 82, 73). Nel Capricorno il
  4 di Marte è una correzione di Kroll al 6 di M, e ora la trascrizione lo
  dice. II.1 (pp. 55-56) contro `TRIANGOLI` e III.4 (p. 140) contro
  `ESALTAZIONI`, sull'immagine di Kroll: combaciano. I domicili di I.2 erano
  già stati riletti sull'immagine il 29 ottobre e non si sono rifatti.
  Trovata una lettura non dichiarata: III.4 dà esaltazioni e cadute per
  grado, e `valensDignitiesOf` le conta sul segno intero, come fa Lilly, che
  però lo dichiara. Cercato nell'indice di Kroll se Valente usi anche la
  forma per segno: sì, II.18 (p. 80, l'esaltazione del Sole è «ἐπὶ Κριόν»)
  e II.40 (p. 126, lo Scorpione «ταπείνωμα» della Luna). Il codice resta
  com'è, e il commento a `valensDignitiesOf` ora cita i due luoghi; nessuna
  risposta cambia.
- **15 novembre 2026, riordino.** `TODO.md` riallineato (versione pushata,
  sito ancora alla 0.26.1); nella voce 49 le scuole della riga 1 hanno una
  riga ciascuna nello *Stato* e non si ripetono nel testo. Verificato che
  ogni file e nome citato dalle voci 33 e 49 esista. In `texts/INDICE.md`
  tre rimandi alla vecchia sezione *Esaminato* del TODO puntano ora a
  `docs/esaminato.md`.
