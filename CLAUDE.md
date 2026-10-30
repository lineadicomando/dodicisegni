# dodicisegni

Calcolo di temi natali: un **motore puro** (`packages/core`) e **adattatori** che
lo espongono su superfici diverse. Il `README.md` tiene la descrizione, la
licenza e i comandi; qui c'è ciò che serve sapere prima di toccare qualsiasi
cosa. Il progetto è agli inizi e **non ha una documentazione estesa**: i
parametri si leggono nei commenti delle rotte e nelle descrizioni dei tool MCP,
che sono la fonte. Il lavoro aperto sta in `TODO.md`: una voce per cosa, con il
file, la riga e il modo di verificarla. In `docs/` c'è la memoria del lavoro,
non documentazione per gli utenti: `decisioni.md` (le scelte già prese, da non
ridiscutere), `esaminato.md` (cose cercate e lasciate fuori), `lavorare.md`
(gli inciampi noti e come si legge una fonte), `storia.md` (voci chiuse,
versioni, sessioni). Si leggono quando servono, non tutte all'inizio.

## Mappa

| | |
|---|---|
| `packages/core` | motore di calcolo e CLI `dodicisegni`. Nessuna dipendenza da HTTP, framework o MCP |
| `packages/geo` | ricerca località su dataset GeoNames locale (SQLite) |
| `packages/ruota` | il disegno: la ruota e il quadro vedico nei due stili. Geometria, glifi, colori, SVG e PNG. Non dipende da `core` |
| `packages/lettura` | il tema più le istruzioni per leggerlo, in un testo solo. Un documento per sistema astrologico, più quello dell'oraria, che legge una domanda e non una nascita. Riceve una tabella già impaginata: non dipende da `core`, nemmeno dai tipi |
| `packages/mcp` | server MCP: tredici tool, due prompt di lettura e due risorse di riferimento, trasporto stdio |
| `apps/web` | SvelteKit: interfaccia + API REST, tutti gli endpoint in GET |
| `apps/desktop` | Electron: la web app in una finestra. Avvia il server di `web` compilato, non duplica superfici |

Monorepo npm workspaces, Node ≥ 22.17, ESM, TypeScript.

## Comandi

```sh
npm test                                   # tutti i workspace (vitest)
npm run test:watch -w @dodicisegni/core
npm run typecheck                          # ricompila ruota, lettura, core e geo, poi controlla il resto
npm run lint                               # regole, non formattazione: vedi eslint.config.js
npm run build
npm run dev -w @dodicisegni/web         # http://localhost:5173 (Vite)
npm start -w @dodicisegni/web           # http://localhost:3000, dopo build
npm run dist -w @dodicisegni/desktop    # AppImage in apps/desktop/release, dopo build
```

`npm run geo:import -w @dodicisegni/geo` scarica **~215 MB**: serve solo se
la ricerca delle località non funziona, non va lanciato per abitudine.
`npm run ephe:download -w @dodicisegni/core` (~2 MB) è opzionale: senza,
il motore usa Moshier invece delle effemeridi Swiss.

## Vincoli

- **Licenza AGPL-3.0-or-later**, imposta da Swiss Ephemeris. Ogni nuova
  dipendenza deve esserle compatibile.
- **Il motore non interpreta: calcola dottrine nominate.** Un dato è
  un'affermazione che chiunque può ricalcolare dagli stessi input seguendo la
  convenzione che il motore dichiara, con il suo nome e, dove viene da un testo,
  la sua fonte: `Distribution` porta `counted` perché chi conta diversamente
  rifaccia la somma, la Parte di Fortuna nomina la formula, il tema porta il
  sistema di case. Che cosa significhi non lo dice mai: la riga sta per esteso
  nel commento a `VoidOfCourse` in `types.ts`. Il confine è il significato, non
  l'ampiezza e non la dottrina: un conteggio su tutto il tema si può fare, e
  così il punteggio delle dignità di Lilly o uno yoga del Parashara, che sono
  regole di una tradizione e si ricalcolano; «Saturno in settima ritarda il
  matrimonio» no.

  L'astrologia non ha un'ortodossia, e il motore non ne sceglie una. Le scuole
  convivono e nessuna è un default taciuto: dove divergono, il risultato dice
  quale ha seguito e ne espone i componenti, mai un totale solo. Una scuola
  entra intera (tavole, regole e pesi insieme) e non a pezzi mescolati con
  un'altra: le triplicità di Doroteo con i punti di Lilly sono un ibrido che
  nessuno ha praticato, cioè una dottrina nostra. Per la stessa ragione non
  entra un peso che non abbia un autore fuori da questo repo, e le costanti si
  prendono dalla fonte primaria, con la pagina accanto, non dai riassunti che
  ne circolano.
- **Il client non importa valori da `@dodicisegni/core`, solo tipi.** Un
  import di valore trascina effemeridi e modulo nativo nel bundle del browser.
- **Niente `async`/`await` nella catena di calcolo**: `chart`, `sky`,
  `transits`, `passages`, `election`, `sky-events`, `panchanga`, e ogni modulo
  nuovo che passi da `zodiacContext`. Swiss Ephemeris tiene lo
  zodiaco siderale in **stato globale del modulo nativo**: `set_sid_mode` vale
  per il processo, non per la chiamata. Oggi è sicuro perché fra l'impostazione
  e l'ultima `calc_ut` l'event loop non gira; il primo `await` lì dentro apre
  una corsa fra richieste concorrenti con ayanamsa diversi, e il risultato non
  è un errore ma un tema sbagliato di ventiquattro gradi. Per la stessa ragione
  `zodiacContext` restituisce una **copia** del contesto invece di scrivere sui
  flag di quello che `initEphemeris` tiene in cache.

  Quello stato è però **per thread**, non per processo: ogni thread carica la
  sua istanza del modulo nativo. È la ragione per cui le quattro rotte che costano
  secondi (passaggi, transiti attivi, calendario del cielo, elezione) girano in un pool di
  worker (`apps/web/src/lib/server/pool.ts`) senza che il vincolo qui sopra
  cambi di una virgola: la catena resta sincrona, solo gira altrove. Il fatto è
  verificato in `pool.test.ts` e non va dato per scontato: se cadesse, il pool
  va smontato, non aggiustato.
- **Il fallimento è parziale**: un corpo non calcolabile produce un avviso, non
  un errore; l'ora ignota produce una carta senza case, non un rifiuto. Gli
  errori di dominio sono `ChartError` con un `code` mappabile su HTTP.
- Le tabelle Svelte prendono **i dati, non il tema**: legarle a `NatalChart`
  le rende inutilizzabili per i transiti.
- **`packages/ruota` non importa da `core`, nemmeno i tipi**: li ridichiara in
  `types.ts`, e `test/tipi.test.ts` verifica che combacino. Quel test è l'unico
  punto che vede `core`, ed è la ragione per cui `core` sta fra le sue
  dipendenze di sviluppo. Serve a rompere il
  ciclo con la CLI, che vive in `core` e disegna. Il disegno riceve una carta
  già calcolata e non deve poterne calcolare una.
- **Il PNG sta in `@dodicisegni/ruota/png`**, punto d'ingresso separato:
  porta un modulo nativo, e nel browser non deve arrivare. Lato web si importa
  solo da `lib/server`.
- **`packages/lettura` non prende dipendenze, e soprattutto non prende `core`.**
  Riceve il tema come stringa già impaginata da `format.ts`. Il pulsante che lo
  copia negli appunti gira nel browser: un import di `core` da qui trascinerebbe
  le effemeridi nel bundle per la via traversa che il vincolo sul client
  chiudeva dalla porta principale. I documenti di lettura sono uno per sistema
  astrologico, non uno parametrizzato; vedi `src/lettura.ts`.
- **Il service worker conserva il guscio, non i calcoli.** `/api` non entra
  mai nella sua cache, e le pagine ci entrano indicizzate per **percorso**,
  senza query. Le due regole stanno in `apps/web/src/lib/cache-policy.ts` e non
  nel worker apposta per poterle provare. La ragione è una sola e vale per
  entrambe: gli indirizzi di questa applicazione portano data, ora e luogo di
  nascita (`/?date=…&locationId=…` è una URL vera), e una cache che
  l'applicazione governa, con un nome suo e senza scadenza, sarebbe un elenco
  dei temi guardati che resta sul dispositivo. Senza rete si apre
  l'interfaccia; il calcolo no, e `lib/api.ts` lo dice già.
- **Un disegno non sostituisce i dati**: non porta le avvertenze del calcolo.
  Le superfici lo dicono a chi le usa, e le descrizioni MCP pure.

## La versione

- **Il repository ha un numero solo**, nel campo `version` di ogni
  `package.json` e del lockfile; `apps/web/src/lib/version.test.ts` fallisce
  se uno resta indietro. Il footer (`lib/version.ts`), il server MCP
  (`packages/mcp/src/version.ts`) e `--version` della CLI
  (`packages/core/src/version.ts`) lo **leggono** dal proprio manifesto: non
  si ricopia da nessuna parte. Si cambia dappertutto in un colpo:
  `npm version <numero> --workspaces --include-workspace-root
  --no-git-tag-version --allow-same-version`.
- **Quale cifra si muove lo decide la risposta, non la quantità di lavoro.**
  Tre domande, in quest'ordine, e vince il primo sì:
  1. una domanda che aveva già una risposta ne riceve un'altra (un valore
     diverso, un campo che compare o sparisce, un parametro rinominato, un
     indirizzo spostato)? Si muove la **seconda** cifra;
  2. arriva qualcosa che prima nessun indirizzo dava (una sezione, un
     endpoint, un'opzione, una scuola nuova chiesta per nome)? La **terza**;
  3. non arriva niente (commenti, test, `TODO.md`, `docs/`, `texts/`)?
     **Niente**.

  **Alla prima domanda risponde la macchina**: il fascicolo canonico,
  `packages/core/test/canonico.test.ts`, scrive in `test/canonico/` le
  risposte intere del motore su input fissi, con Moshier. Un file che cambia
  è un sì; nessun file cambiato, un no, qualunque altra cosa sia cambiata.
  Quando il cambiamento è voluto si riscrivono con `npx vitest run
  test/canonico.test.ts -u` (dentro `packages/core`), e il diff entra nel
  commit che muove la versione. Il fascicolo vede solo le risposte che dà:
  una tavola cambiata in un grado dove nessun suo corpo cade non lo muove, e
  lì la domanda torna a chi fa il commit.

  La prima cifra è lo stato e non una misura: passa da 0 a 1 quando finisce
  l'alpha, e `ALPHA` in `lib/version.ts` smette di dirlo da sé. Finché è
  zero, `/metodo#versione` dice a chi legge che cosa può cambiare.
- **Il cambio viaggia col commit che lo guadagna**; se una funzione è
  spezzata in più commit (calcolo, poi superfici), con l'ultimo. Su quel
  commit va il tag annotato `v<numero>`, col messaggio
  `dodicisegni <numero> — <oggetto del commit>`. Il tag ripete il numero, non
  lo definisce, e non fa partire niente; va su col push, e il push si fa solo
  quando il proprietario lo chiede.

## Stile

Messaggi di commit **in italiano, indicativo presente terza persona**, che
dicono cosa fa il codice e non cosa è stato fatto. Nessun prefisso tipo
`feat:`. Esempi reali: «Trova gli ingressi nei segni e le stazioni», «Espone i
transiti su /api/transits», «Accorpa l'asse dei Nodi nell'elenco degli aspetti».

Commenti e identificatori di dominio in italiano dove il dominio è italiano
(`incontri`, `ingressi`, `stazioni`, i `code` degli errori); il resto in inglese.

**I termini dell'astrologia indiana restano in sanscrito e non si traducono**:
`nakshatra`, `tithi`, `karana`, `yoga`, `dasha`, `varga`, `drishti`, `pada`. La
regola di sopra dice «nella lingua del dominio», e qui il dominio è quello,
come `yoga` e `karma`, che in italiano si dicono così. Tradurli produrrebbe
parole che i testi della tradizione non usano e che non si possono cercare:
«dimore lunari» per i nakshatra è una perifrasi, non un nome. La prosa dei
commenti resta italiana, e la prima volta che un termine compare lo si spiega
in mezza riga. Il genere segue il sanscrito: *daśā* è femminile, e così la
mahadasha, le antardasha, le pratyantardasha.

La terza modalità è **mutevole** (Gemelli, Vergine, Sagittario, Pesci), in
ogni sistema: nei testi tradizionali «mobile» vuol dire cardinale (*cara*, i
*moveable* di Lilly), e nel repo non nomina nessuna modalità.

## Le fonti testuali: `texts/`

Le costanti che vengono da un testo (tavole, gradi, regole) si prendono dalla
fonte primaria con la pagina accanto, e la fonte si tiene in `texts/`, una
cartella **fuori dal repo** (è in `.gitignore`): molte non sono
redistribuibili, e tutte pesano. Serve a rileggere un valore senza rifare la
ricerca che l'ha trovato.

- **Prima di citare, scaricare.** Una fonte che una ricerca trova e che entra
  nel codice, in un test, nel `TODO.md` o in `docs/` va salvata qui nella
  stessa sessione, in `texts/<ambito>/<autore>-<opera>-<curatore>-<anno>/`
  con la sua scheda `FONTE.md`. Quelle che non si possono scaricare stanno in
  `texts/INDICE.md` con lo stato. I nomi fissi dentro la cartella sono in
  `docs/lavorare.md`, *Le fonti*.
- **L'OCR non è una lettura**: il numero che entra nel codice si legge
  sull'immagine, che si salva in `pagine/`, e il passo si trascrive in
  `trascrizioni.md`.
- **`texts/INDICE.md`** ha una riga per fonte (cartella, opera, stato, dove è
  usata) e si aggiorna con la cartella, non dopo.
- Dal repo della fonte esce solo ciò che si cita: il valore, l'opera, la
  pagina. Il testo di una traduzione protetta non si ricopia nei commenti.

## Aggiungere una funzione

Attraversa più superfici e ha una procedura sua: vedi la skill `nuova-funzione`.
