# 49. La revisione di ciò che non è stato guardato

**Priorità media.** Era «per ultima, dopo le voci 35–48»: sono tutte chiuse,
quindi è la prossima. Si può spezzare per riga dell'elenco, una sessione per
riga. La revisione del 13 novembre 2026 ha letto a
fondo le rotte, `lib/server`, il nucleo del motore (tempo, effemeridi, case,
tema, cielo, transiti, passaggi, eventi, elezione, panchanga), `packages/mcp`,
`packages/geo`, `packages/lettura`, il disegno della ruota e `main.ts` del
desktop. Il resto l'ha scorso o saltato, e lì non può escludere niente. Questa
voce è la revisione di quel resto, con lo stesso metodo: un difetto vale
quando è riprodotto con un input scritto, e ogni cosa trovata diventa una
voce sua o si corregge subito.

Che cosa è stato letto e trovato a posto, da non rifare, sta in
`docs/esaminato.md`, *La revisione del 13 novembre 2026*.

Che cosa resta, in ordine di quanto può costare un errore:

- **le tavole e le regole di dottrina**, mai toccate:
  `packages/core/src/dignita*.ts`, `condizioni-lilly.ts`, il corpo di
  `oraria-lilly.ts` (letto solo l'ingresso), `maitri.ts`, `vimshopaka.ts`,
  `varga-buoni.ts`, `arudha.ts` e `arudha-graha.ts`, `constants.ts`. Qui la
  revisione non è di codice ma di fonte: ogni costante contro la pagina in
  `texts/`, col metodo di `docs/lavorare.md`, *Le fonti*, e nel conto vanno
  le costanti che non hanno una pagina accanto. È la parte più lunga, e si
  può spezzare per scuola;
- **il Jyotisha, letto senza i commenti o solo per l'aritmetica**:
  `jyotisha.ts`, `dasha.ts`, `nakshatra.ts`, `stati.ts`, `varga.ts`,
  `hora.ts`, `drishti.ts`; e `corso.ts`, `aspects.ts`, `orbite.ts`,
  `distribution.ts`;
- **`packages/core/src/format.ts`**, non letto: è il testo che leggono gli
  agenti e la base di `format=compact`. Il 14 novembre ci sono entrati
  `assertReadable` (il tetto alle righe) e `clockLabel` (l'orologio nella
  riga di testa), ma il resto non è stato letto. Un campo del risultato che
  la tabella non riporta, o riporta arrotondato male, non lo vede nessuna
  prova che guardi il JSON;
- **`packages/core/src/cli.ts`**, letto solo il parsing dei numeri, e
  `types.ts` e `index.ts` (che cosa è esportato e non dovrebbe, o viceversa);
- **l'interfaccia**: le tabelle Svelte una per una, `ChartWheel`,
  `ChartSettings`, `JyotishaSettings`, `BirthForm`, `esporta.ts`, `cielo.ts`,
  `+error.svelte`, le pagine `(informativa)` (che cosa `/metodo` e `/privacy`
  promettono contro ciò che il codice fa: due delle correzioni del 13
  novembre erano promesse di `/metodo` non mantenute), e l'**accessibilità**
  oltre ciò che `docs/esaminato.md` registra, con la skill
  `chrome-devtools-mcp:a11y-debugging`. Va fatta **in un browser**: come si
  prova lì una corsa o un campo sta in `docs/lavorare.md`;
- **`packages/ruota/src/quadro-svg.ts`**, provato a tappeto ma non letto riga
  per riga, `glyphs.ts`, `types.ts`;
- **`apps/desktop`** eseguito davvero: la revisione non aveva un binario di
  Electron e ha solo letto. Vale anche per la correzione del 14 novembre in
  `importaDatabase` (`main.ts`): chiudere la finestra durante l'importazione
  deve dare il messaggio «L'importazione non è andata a buon fine…» e non
  `Object has been destroyed`, ed è scritta sulla sola lettura;
- **le prove stesse**, mai lette: che cosa affermano e che cosa no. Tre dei
  quattro difetti corretti il 13 novembre avevano una prova accanto che
  guardava altro (l'avviso dell'ora ambigua c'era, l'ora giusta nessuno la
  controllava; Tromsø provava l'assenza dell'alba e non le case). Da cercare:
  prove che controllano solo che un avviso esista, e casi di bordo che il
  nome della prova promette e il corpo non tocca;
- **la produzione**: restano i log (la promessa di `/privacy` sulle query
  string, che la voce 33 chiede comunque di controllare) e il comportamento
  dietro Cloudflare. Le intestazioni sono fatte: `Referrer-Policy` e
  `X-Content-Type-Options` le manda `hooks.server.ts`; una
  Content-Security-Policy non c'è, per scelta, e se la si vuole va provata
  pagina per pagina;
- **ciò che le voci chiuse il 14 novembre hanno lasciato non provato**
  (il resto è in `docs/sessioni.md`, alla voce):
  - voce 45: link e lettura presi da ciò che è a schermo sono provati in un
    browser solo su `/vedica`, non sul tema natale né sui transiti; le corse
    solo sull'elezione e sulla ricerca delle località, non sui passaggi dei
    transiti né sul calendario del cielo, che usano lo stesso codice;
  - voce 50: nel modulo l'interruttore «Ora di un orologio locale» non è
    stato cliccato a mano (provato l'indirizzo che lo accende, la richiesta
    che ne parte e la riga di testa);
  - voce 46: il controllo dei `.txt` di GeoNames (`looksLikeTable` in
    `scripts/import-geonames.mjs`) è provato sui due file in cache, senza
    rilanciare l'importazione né simulare una risposta HTML;
  - voce 43: il tetto di mille righe è nostro e non viene da una misura
    d'uso; `find_sky_events` con la sola Luna su tre anni passa (23 mila
    caratteri).

**Versione**: niente, finché non trova qualcosa.

**Verifica**: la voce si chiude quando ogni riga dell'elenco ha accanto, in
`docs/sessioni.md`, che cosa è stato letto e che cosa ne è uscito; non quando
non si trova più niente.
