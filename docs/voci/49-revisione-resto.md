# 49. La revisione di ciò che non è stato guardato

**Priorità media, in corso.** La revisione del 13 novembre 2026 ha letto a
fondo le rotte, `lib/server`, il nucleo del motore, `packages/mcp`, `geo`,
`lettura`, il disegno della ruota e `main.ts` del desktop (che cosa ha
trovato a posto è in `docs/esaminato.md`, *La revisione del 13 novembre
2026*, e non si rifà). Il resto l'ha scorso o saltato: questa voce lo
rilegge, **una riga dell'elenco per sessione**, la prima una scuola per
sessione. Un difetto vale quando è riprodotto con un input scritto; ciò che
si trova si corregge subito o diventa una voce sua.

**Versione**: niente, finché non trova qualcosa.

**Verifica**: la voce si chiude quando ogni riga ha in `docs/sessioni.md`
che cosa è stato letto e che cosa ne è uscito, non quando non si trova più
niente. Chiusa una riga, la si segna qui sotto e la si toglie dall'elenco.

## Stato

| Riga | Stato |
|---|---|
| 1. Tavole e regole di dottrina | in corso, una scuola per sessione (sotto) |
| 1a. Lilly: `dignita-lilly.ts`, `condizioni-lilly.ts`, `oraria-lilly.ts`, `dignita.ts` p. 104 | fatta il 14 novembre 2026: un difetto, voce 51 → 0.27.0 |
| 1b. Tolomeo: `dignita-tolomeo.ts`, `dignita.ts` I.17 e I.19, Firmico p. 44, Leo p. 117 | fatta il 15 novembre 2026: niente da correggere |
| 1c. Valente: `dignita-valente.ts`, `dignita.ts` I.2 | fatta il 15 novembre 2026: una lettura dichiarata nel commento |
| 1d. Bonatti: `dignita-bonatti.ts`, tratt. II capp. IV-XVII, tratt. III pp. 158-159 e 167-168 | fatta il 15 novembre 2026: una citazione sbagliata → 0.28.0, tre letture dichiarate nel commento |
| 1e. Il filo comune | da fare |
| 1f. Il Jyotisha | da fare |
| 2–9 | da fare |

## Le righe, in ordine di quanto può costare un errore

I file senza cartella stanno in `packages/core/src/`.

1. **Le tavole e le regole di dottrina.** Revisione di fonte, non di
   codice: ogni costante contro l'immagine della pagina in `texts/`
   (`docs/lavorare.md`, *Come si legge una fonte* e *Rileggere una tavola*;
   quali pagine, per ogni file, lo dice `texts/INDICE.md`), e nel conto
   vanno le costanti senza una pagina accanto. Le scuole fatte sono nello
   *Stato*; il racconto di ciascuna, con quello che è stato lasciato, è in
   `docs/sessioni.md` (cercare «Voce 49, prima riga»). Una lettura che il
   codice segue senza dirlo si dichiara nel commento, con il luogo che la
   regge; se il testo non la regge, è un difetto. Restano:
   - *il filo comune*: `dignita-tema.ts`, `constants.ts`;
   - *Jyotisha*: `dignita-parashara.ts`, `maitri.ts`, `vimshopaka.ts`,
     `varga-buoni.ts`, `arudha.ts`, `arudha-graha.ts`.
2. **Il Jyotisha, letto senza i commenti o solo per l'aritmetica**:
   `jyotisha.ts`, `dasha.ts`, `nakshatra.ts`, `stati.ts`, `varga.ts`,
   `hora.ts`, `drishti.ts`; e `corso.ts`, `aspects.ts`, `orbite.ts`,
   `distribution.ts`. Di `orbite.ts` e `corso.ts` la parte di Lilly
   (pp. 107, 110, 112) non è stata riletta con la sua scuola.
3. **`format.ts`**, non letto tranne `assertReadable` e `clockLabel`: è il
   testo che leggono gli agenti e la base di `format=compact`. Un campo del
   risultato che la tabella non riporta, o arrotonda male, non lo vede
   nessuna prova che guardi il JSON.
4. **`cli.ts`** (letto solo il parsing dei numeri), `types.ts` e `index.ts`:
   che cosa è esportato e non dovrebbe, o viceversa.
5. **L'interfaccia**, in un browser (`docs/lavorare.md` dice come si prova
   lì una corsa o un campo): le tabelle Svelte una per una, `ChartWheel`,
   `ChartSettings`, `JyotishaSettings`, `BirthForm`, `esporta.ts`,
   `cielo.ts`, `+error.svelte`; le pagine `(informativa)`, cioè che cosa
   `/metodo` e `/privacy` promettono contro ciò che il codice fa (due
   correzioni del 13 novembre erano promesse di `/metodo` non mantenute);
   l'accessibilità oltre ciò che `docs/esaminato.md` registra, con la skill
   `chrome-devtools-mcp:a11y-debugging`. Con questa riga anche ciò che le
   voci del 14 novembre non hanno provato a mano:
   - voce 45: link e lettura presi da ciò che è a schermo sul tema natale e
     sui transiti (provati solo su `/vedica`); le corse sui passaggi dei
     transiti e sul calendario del cielo (provate solo su elezione e
     ricerca delle località, stesso codice);
   - voce 50: l'interruttore «Ora di un orologio locale» cliccato nel
     modulo (provati l'indirizzo che lo accende e la richiesta);
   - voce 51: la riga `nessun-aspetto-malevolo` sulla pagina Oraria (vista
     solo nella tabella compatta).
6. **`packages/ruota/src/quadro-svg.ts`**, provato a tappeto ma non letto
   riga per riga; `glyphs.ts`, `types.ts`.
7. **`apps/desktop` eseguito davvero**: la revisione non aveva un binario
   di Electron. Compresa la correzione del 14 novembre in `importaDatabase`
   (`main.ts`), scritta sulla sola lettura: chiudere la finestra durante
   l'importazione deve dare «L'importazione non è andata a buon fine…» e
   non `Object has been destroyed`.
8. **Le prove stesse**, mai lette: che cosa affermano e che cosa no. Tre
   dei quattro difetti del 13 novembre avevano accanto una prova che
   guardava altro. Da cercare: prove che controllano solo che un avviso
   esista, e casi di bordo che il nome promette e il corpo non tocca.
9. **La produzione**: i log (la promessa di `/privacy` sulle query string,
   che serve anche alla voce 33) e il comportamento dietro Cloudflare. Le
   intestazioni sono fatte (`hooks.server.ts`); una Content-Security-Policy
   non c'è, per scelta. Con questa riga: il controllo dei `.txt` di
   GeoNames (`looksLikeTable` in `packages/geo/scripts/import-geonames.mjs`,
   voce 46) non è provato su un'importazione vera né su una risposta HTML.

Lasciato com'è, da non riaprire qui: il tetto di mille righe della voce 43
è nostro e non viene da una misura d'uso (`docs/decisioni.md`).
