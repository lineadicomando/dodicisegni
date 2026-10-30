# Come si lavora qui

Le cose da sapere prima di toccare il codice, che `CLAUDE.md` non dice:
gli inciampi noti e il metodo con cui si sono lette le fonti.

## Le fonti

Le regole stanno in `CLAUDE.md`, *Le fonti testuali*; qui la forma delle
cartelle.

- **Una cartella per edizione**, in
  `texts/<ambito>/<autore>-<opera>-<curatore>-<anno>/`, con l'ambito fra
  `jyotisha`, `occidentale` e `tecnica` (effemeridi, algoritmi, software).
  Nomi in minuscolo, col trattino, senza accenti. Una ricerca che non è
  un'edizione (più pagine web per una domanda) prende il nome della domanda
  e l'anno, come `occidentale/modalita-nomi-italiani-2026`.
- **Dentro, nomi fissi**: `FONTE.md` (titolo, edizione, URL e identificativo,
  stato dei diritti, la mappa fra pagine stampate e immagini, che cosa è
  stato letto e per quale file o voce), `scansione.pdf`, `ocr.txt`,
  `numeri-pagina.json`, `pagine/pNNN.jpg` col numero **stampato** sulla
  pagina, `trascrizioni.md` per i passi letti a vista, `html/` e `testo/`
  per le pagine web.
- **Una scansione porta sempre il suo testo**: l'OCR quando c'è, convertito
  in `.txt` quando la fonte è HTML, perché si possa cercare con `grep`.

Le fonti citate stanno in copia locale in `texts/`, fuori dal repo: la
cartella, le schede `FONTE.md` e l'elenco `texts/INDICE.md` si mantengono come
dice `CLAUDE.md` (*Le fonti testuali*). In una sessione nuova `texts/` può non
esserci, se il clone è un altro: le schede dicono da dove riscaricare ogni
fonte. Alcune non si riscaricano: le pagine dell'ed. Pingree di Valente
(`texts/occidentale/valente-anthologiae-pingree-1986`) le ha fotografate il
proprietario, e su archive.org quel libro non si presta.

## Le cose che fanno perdere tempo


- se il typecheck di `apps/web` cade su `config.kit.paths.origin`,
  `node_modules` è indietro rispetto al lockfile e serve un `npm install`;
- `apps/web` e `packages/mcp` vedono `core` e `lettura` compilati, non i
  sorgenti: dopo un export nuovo di `core` serve `npm run build -w
  @dodicisegni/core`, dopo una modifica a un documento di lettura `npm run
  build -w @dodicisegni/lettura`, e il server di sviluppo di Vite va
  riavviato, o risponde 500 dicendo che l'export non c'è;
- il fascicolo canonico (`packages/core/test/canonico.test.ts`) cade quando
  una risposta del motore cambia, ed è il suo mestiere: se il cambiamento è
  voluto si guarda il diff, si riscrivono i file con `npx vitest run
  test/canonico.test.ts -u` dentro `packages/core`, e la versione muove la
  seconda cifra (`CLAUDE.md`, *La versione*), anche quando a cambiare è solo
  il testo di un'avvertenza o di una fonte. È calcolato con Moshier e senza
  stelle fisse, apposta;
- i test che leggono le stelle fisse vogliono `packages/core/ephe/sefstars.txt`,
  che `npm run ephe:download -w @dodicisegni/core` scarica (133 KB); senza,
  vengono saltati e non falliscono;
- `/api/jyotish` si fa memorizzare dal browser per un giorno
  (`private, max-age=86400`): provando la pagina `/vedica` dopo aver
  cambiato il motore, il browser può mostrare la risposta vecchia, e il
  browser di prova di Chrome DevTools la conserva fra una sessione e
  l'altra. Basta cambiare di un minuto l'ora nell'indirizzo. Per la stessa
  ragione i componenti di `/vedica` mettono una guardia sui campi nuovi
  (`{#if jyotisha.arudhas}`) anche dove il tipo li dà per presenti;
- la pagina `/vedica` legge il luogo solo da `locationId`
  (`/vedica?date=1968-03-12&time=14:30&locationId=3172394` è Napoli): con
  `latitude` e `longitude` mostra il modulo vuoto, mentre `/api/jyotish` li
  accetta tutti e due;
- `computeJyotisha` non è una funzione della sola carta: per l'alba delle
  avastha (`stati.ts`) chiama `initEphemeris` e `lastSunrise` di
  `panchanga.ts`, con `JyotishaOptions.ephemerisPath` se c'è. Resta
  sincrona, e l'alba non usa i flag siderali;
- la CLI vuole le opzioni lunghe per tutto: `--date`, `--time`, `--lat`,
  `--lon`, `--tz`. La tabella compatta del Jyotisha si vede con `--zodiaco
  siderale --lettura --sistema jyotisha` (i varga, con `--varga`, si
  stampano senza `--lettura`), le dignità di una scuola con `--dignita
  <scuola>` e una nascita con l'ora, perché ci sia la setta.

Per spegnere il server di sviluppo lanciato in sottofondo si usa la porta
(`fuser -k 5173/tcp`), non `pkill -f` col numero della porta: il comando
contiene lo stesso numero e chiude anche la shell che lo lancia. E prima di
provare il server compilato (`npm start -w @dodicisegni/web`) va rifatto
`npm run build`: `apps/web/build` non è nel repo e resta com'era all'ultima
build, che può essere di settimane prima.

## Come si legge una fonte

**Come si è lavorato su una dottrina, e conviene continuare.** Ogni regola
si legge sull'immagine della pagina (`pdftoppm`, vedi le schede `FONTE.md`;
l'OCR serve solo a orientarsi, e sul gotico e sul greco non basta nemmeno a
quello: `tesseract -l ita` a 150-250 dpi trova almeno le parole), si
trascrive in `trascrizioni.md` e si prova contro una tavola o un esempio
svolto della fonte, ricopiati nel test. Dove il testo lascia due strade si
cerca chi le percorre, con un nome e un testo; se l'alternativa non ha un
autore resta fuori e lo si scrive; se ce l'ha, la scelta si fa fare al
proprietario prima del codice, e finisce in `docs/decisioni.md`. Ogni risultato porta
la sua fonte in un campo `source` o `rule`.

Nel Jyotisha le superfici sono cinque: la tabella compatta (`format.ts`), la
pagina `/vedica` (un componente per sezione), la descrizione di
`compute_jyotisha_chart` (`packages/mcp/src/tools.ts`), il documento di
lettura (`packages/lettura/src/jyotisha.ts`, con le prove in
`lettura.test.ts`) e, quando è una convenzione, `/metodo/varga` o un'altra
sottopagina di `/metodo`. Quest'ultima nessun test la confronta con la prosa,
ed è quella che si dimentica. Chi aggiunge un varga o una convenzione della
hora trova l'elenco dei testi da toccare nei commenti sopra `VARGAS`
(`varga.ts`) e `HORA_CONVENTIONS` (`hora.ts`).

Nelle scuole occidentali le superfici sono quelle del tema tropicale e del
cielo, che porta la scuola anche senza nascita (`/api/sky`, `compute_sky`,
la pagina Cielo): l'elenco completo, con quello che nessun test controlla,
sta nel commento in testa a `packages/core/src/dignita-tema.ts`.
