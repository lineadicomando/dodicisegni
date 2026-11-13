# TODO

Il lavoro aperto, con quello che serve per riprenderlo: per ogni voce il
file, la riga e il modo di verificarla. I numeri delle voci sono stabili e
non si riusano; una voce chiusa esce di qui (vedi `docs/storia.md`).

Prima di cominciare:

- `npm test`, `npm run typecheck` e `npm run lint` verdi;
- `docs/lavorare.md`: gli inciampi noti (build di `core` e `lettura`,
  fascicolo canonico, cache di `/api/jyotish`, CLI) e il metodo per le fonti;
- `docs/decisioni.md` prima di proporre una scelta di dottrina: molte sono
  già prese;
- `docs/esaminato.md` prima di cercare una fonte o una variante: forse è già
  stata cercata.

I riferimenti `file:riga` sono stati ricontrollati il 30 ottobre 2026 sulla
versione 0.14.0. Le righe si spostano: se una non torna, fa fede il nome
della funzione o della costante accanto.

## Dove siamo

Al 13 novembre 2026, versione **0.15.0**. Sono aperte la voce della SEO, che
aspetta i motori di ricerca, e quattro voci per l'integrazione con
**dodicicase** (31–34). dodicicase è la piattaforma commerciale, a codice
chiuso, che userà dodicisegni come motore chiamandolo solo in rete, sulla rete
interna del server, senza importarne codice (`~/Progetti/it-dodicicase`, in
particolare `docs/architettura.md`). Le quattro voci sono **funzioni
pubbliche e generali**: servono a dodicicase ma anche a chiunque usi le API, e
nessuna aggiunge a dodicisegni account, archivi o altro che contraddica
`/privacy`.

| Voce | Priorità | Taglia | Prima di cominciare |
|---|---|---|---|
| 28. La revisione della SEO | media | piccola | aspetta i dati dei motori: da rileggere non prima di metà novembre 2026 |
| 31. La versione del motore nelle risposte | alta | piccola | — |
| 32. Il testo compatto su tutte le rotte di calcolo | alta | piccola | — |
| 33. Un'istanza interna del motore | alta | piccola | conferma del proprietario per il server; meglio dopo 31 |
| 34. La doppia licenza di `ruota` e `lettura` | media | piccola | decisione del proprietario |
| 35. Le liste senza tetto nelle rotte | alta | piccola | — |
| 36. Il pool non sa chi se n'è andato | alta | media | non usare `worker.terminate()` come scadenza: vedi la voce |
| 37. Gli ingressi persi accanto a una stazione | alta | media | — |
| 38. Il reggitore del giorno letto nel fuso sbagliato | alta | piccola | — |
| 39. Gli elenchi vuoti e i nomi sconosciuti nei tool MCP | alta | piccola | — |
| 40. Gli errori delle rotte | media | piccola | — |
| 41. L'oraria con un significatore che manca | media | piccola | — |
| 42. Il tempo medio locale prima dei fusi | media | piccola | decisione del proprietario: correggere o dichiarare |
| 43. Le risposte MCP da un milione di caratteri | media | piccola | — |
| 44. Le descrizioni dei tool che non dicono il codice | media | piccola | — |
| 45. Il link e le risposte in corsa nell'interfaccia | media | media | va provata in un browser: è dedotta dalla lettura |
| 46. La ricerca delle località | media | media | — |
| 47. Gli input del motore non validati | bassa | piccola | — |
| 48. Il contorno | bassa | piccola | — |
| 49. La revisione di ciò che non è stato guardato | media | grande | per ultima, dopo le voci 35–48 |

Il 13 novembre 2026 una revisione dell'intero progetto ha aperto le voci
35–49. Quattro difetti sono stati corretti subito e non hanno una voce (le case
oltre il circolo polare, l'ora ambigua, Moshier dichiarato `swisseph`, le
coordinate mancanti lette come zero: `docs/storia.md`, *Le sessioni*); il resto
è qui sotto, in ordine di priorità, e la 49 dice che cosa la revisione **non**
ha letto. Le righe delle voci 35–48 sono del 13 novembre. Dove una voce dice
*verificato* il difetto è stato riprodotto con l'input scritto accanto; dove
dice *dedotto* viene dalla sola lettura, e la prima cosa da fare è riprodurlo.

Dal 30 ottobre 2026 il sito pubblicato è allineato al repo: `origin` e il
server sono alla `v0.14.0`. `git status -sb` dice se c'è altro da pubblicare;
il push lo chiede il proprietario, e il deploy si fa come in
`CLAUDE.local.md`.

## 28. La revisione della SEO

**Priorità media.** Nel repo la SEO è fatta, e ogni scelta ha il suo perché
nel commento accanto: `<Meta>` (`apps/web/src/lib/components/Meta.svelte`)
su tutte le diciassette pagine, sitemap e `robots.txt` in
`apps/web/src/lib/seo.ts`, con le prove in `seo.test.ts` (titoli sotto i
sessanta caratteri, descrizioni sotto `DESCRIZIONE_MASSIMA`, ogni pagina di
`(informativa)` nella sitemap, `/api` chiuso). Quelle scelte (niente
`lastmod` né `priority`, niente marcature da risultati ricchi, i temi mai
nella sitemap) non si riaprono qui. I quattro nomi di dominio, che il 30
ottobre 2026 rispondevano ciascuno come sito a sé, ora sono uno: `ORIGIN` nel `.env` del server e i
redirect di Cloudflare (come, in `docs/storia.md`, *Le sessioni*). Resta una
cosa, fuori dal repo:

- **Gli strumenti dei motori**, cosa del proprietario e non del codice.
  Il 30 ottobre 2026 `https://dodicisegni.it` è registrato in Google Search
  Console e in Bing Webmaster Tools, con la sitemap
  (`https://dodicisegni.it/sitemap.xml`, che anche `robots.txt` indica).
  Resta da leggere, **non prima di metà novembre 2026**, quali pagine
  risultano escluse e perché. Solo allora si sa se c'è altro da fare; prima,
  ogni ritocco ulteriore è un'ipotesi. Se non c'è niente da correggere, la
  voce si chiude.

## 31. La versione del motore nelle risposte

**Priorità alta.** Nessuna risposta di `/api` dice quale versione del motore
l'ha prodotta: la versione si legge solo nel footer, nei manifesti e in
`--version`. A chi conserva un risultato (dodicicase salva ogni report come
istantanea: input, risposta, versione) serve saperlo dalla risposta stessa.
La regola della versione dà già il significato al numero: in alpha la
seconda cifra si muove quando una risposta cambia, quindi chi legge
l'intestazione sa se un dato salvato è ancora quello che il motore darebbe.

Come:

- **un'intestazione HTTP**, per esempio `X-Dodicisegni-Version: 0.14.0`, su
  tutte le risposte di `/api`, comprese le immagini delle rotte di disegno e
  gli errori. Il posto naturale è un `handle` in
  `apps/web/src/hooks.server.ts` (oggi non esiste), che legge `VERSION` da
  `apps/web/src/lib/version.ts:22`: il numero non si ricopia;
- **non un campo nel JSON**: un campo che compare cambia la risposta, muove
  la seconda cifra e ogni file di `packages/core/test/canonico/`, e nelle
  risposte `text/plain` e nelle immagini non avrebbe posto. L'intestazione è
  «qualcosa che prima nessun indirizzo dava»: **terza cifra**;
- il nome dell'intestazione si dice nel commento dell'`handle` e nel README,
  *Le superfici*.

**Verifica**: una prova in `apps/web` che chiama una rotta JSON, una
`format=compact`, una di disegno e una che fallisce (400) e trova
l'intestazione uguale a `VERSION`; poi `curl -sI
'http://localhost:3000/api/chart?date=1968-03-12&time=14:30&locationId=3172394'
| grep -i x-dodicisegni-version`.

## 32. Il testo compatto su tutte le rotte di calcolo

**Priorità alta.** `format=compact` restituisce la tabella di testo che
leggono gli agenti, ed è la base di ogni lettura: l'oroscopo personale di
dodicicase parte dai transiti attivi, dai passaggi e dagli eventi del cielo.
Oggi c'è su `/api/chart` (`readFormat`, `apps/web/src/routes/api/chart/+server.ts:98`),
`/api/jyotish` (`…/jyotish/+server.ts:200`), `/api/horary` e
`/api/sky/course`. Manca su `/api/transits`, `/api/transits/active`,
`/api/transits/passages`, `/api/sky`, `/api/sky/calendar` e
`/api/election`.

Le funzioni di resa ci sono già tutte in `packages/core/src/format.ts`, le
stesse che usa il server MCP: `formatTransitsCompact` (riga 167),
`formatActiveTransitsCompact` (498), `formatPassagesCompact` (448),
`formatSkyCompact` (122), `formatSkyEventsCompact` (269),
`formatElectionCompact` (564). Il lavoro è solo di superficie:

- `readFormat` è copiato in due rotte; con sei in più va in
  `apps/web/src/lib/server/`, con la sua prova, e le rotte lo importano. Un
  valore sconosciuto resta un errore, non il JSON;
- le rotte che girano nel pool (`nelPool`, `lib/server/pool.ts`) formattano
  dopo il ritorno dal worker: la resa è una stringa pura, non tocca le
  effemeridi, e non c'è bisogno di spostarla nel thread;
- stessa intestazione testuale di `/api/chart` (la riga di provenienza
  davanti alla tabella), e `content-type: text/plain; charset=utf-8`;
- il commento in testa a ogni rotta dice il parametro, come fa `chart`;
- **terza cifra**: un'opzione nuova, e le risposte JSON non cambiano. Il
  fascicolo canonico non deve muoversi; se si muove, è un errore.

**Verifica**: per ognuna delle sei rotte, una prova che con
`format=compact` riceve `text/plain` uguale (a meno dell'intestazione) a ciò
che il tool MCP corrispondente restituisce per gli stessi input, e che con
`format=xml` riceve 400; `npx vitest run test/canonico.test.ts` in
`packages/core` senza file cambiati.

## 33. Un'istanza interna del motore

**Priorità alta**, ma conviene dopo la 31. dodicicase chiamerà il motore sulla
rete interna del server (`net-com`), non dall'indirizzo pubblico, per due
ragioni: il pool ha al massimo quattro thread (`docs/decisioni.md`, *I
thread del pool web*), e un import di centinaia di clienti o un lotto di
oroscopi non deve far aspettare il sito pubblico; e i dati dei clienti di un
professionista non devono passare da Cloudflare né finire nei log del sito
pubblico.

Nel repo:

- in `compose.yaml` un servizio `motore` accanto a `web` (riga 23), dalla
  stessa immagine e con lo stesso volume GeoNames in sola lettura, **senza
  `ports`**, con un profilo suo (`--profile motore`) così che `docker compose
  up` in locale non lo avvii senza volerlo. Il commento dice a che cosa
  serve e perché non ha porte;
- nessun codice nuovo: è la stessa applicazione. `ORIGIN` può restare
  quello pubblico, perché il servizio interno non serve pagine.

Sul server, fuori dal repo e con la procedura di `~/Progetti/cmdln-srv`
(`/nuovo-servizio`, punto di ripristino, conferma a ogni scrittura): IP fisso
su `net-com` e alias `dodicisegni-motore.local` nell'override del server,
nessun vhost in Caddy, scheda `docs/servizi/dodicisegni.md` di `cmdln-srv`
aggiornata. Va controllato che l'applicazione stessa non scriva nei suoi log
le query string: oggi la promessa di `/privacy` si regge sulla
configurazione dei log davanti all'applicazione, e l'istanza interna non ha
Caddy davanti.

**Versione**: niente, le risposte non cambiano.

**Verifica**: in locale `docker compose --profile motore up -d motore` e
una richiesta da un altro container della rete compose riceve 200, mentre
dall'host la porta non risponde; sul server, da un container su `net-com`,
`GET http://dodicisegni-motore.local:3000/api/chart?…` → 200, e
`docker logs` del motore non contiene la data della richiesta.

## 34. La doppia licenza di `ruota` e `lettura`

**Priorità media, decisione del proprietario.** dodicicase è chiuso e non
può importare codice AGPL. `packages/ruota` e `packages/lettura` però non
dipendono da `core` né da Swiss Ephemeris (`CLAUDE.md`, *Vincoli*), e il
1° novembre 2026 `git shortlog -sne HEAD -- packages/ruota packages/lettura
apps/web/src/lib/components` dà un autore solo, il proprietario. Ne segue che
il proprietario può rilasciarli **anche** sotto una licenza permissiva
(`AGPL-3.0-or-later OR MIT`, per esempio), e dodicicase potrebbe allora
disegnare le ruote e partire dai documenti di lettura senza riscriverli.
Senza la decisione, dodicicase li rifà da sé, e il motore resta comunque
chiamato solo in rete.

Da decidere:

- **se** e **quali**: `ruota`, `lettura`, le tabelle Svelte di
  `apps/web/src/lib/components` (che però importano tipi da `core`: andrebbero
  prima staccate, come `ruota` ridichiara i suoi in `types.ts`);
- **quale licenza** accanto all'AGPL;
- **i contributi esterni**: se un giorno il repo ne accetta, un accordo con
  chi contribuisce (CLA, o almeno una dichiarazione nel `CONTRIBUTING`) che
  conservi la possibilità della doppia licenza. Senza, il primo contributo
  esterno a quei pacchetti la chiude.

Se sì: campo `license` nei due `package.json`, un `LICENSE` per pacchetto,
una riga nel README, *Licenza*, e una voce in `docs/decisioni.md`.
**Versione**: niente.

**Verifica**: `npm pkg get license -w @dodicisegni/ruota -w
@dodicisegni/lettura` dice la doppia licenza, e i `LICENSE` ci sono.

## 35. Le liste senza tetto nelle rotte

**Priorità alta**, verificato. Due rotte prendono un elenco dalla query e lo
passano al motore così com'è, ripetizioni comprese:

- `/api/sky/calendar` (`readBodies`, `apps/web/src/routes/api/sky/calendar/+server.ts:92`):
  `findSignIngresses` e `findStations` (`packages/core/src/sky-events.ts:42`
  e `:97`) iterano l'elenco senza un `Set`, a differenza di
  `sky-passages.ts:121`. Su due mesi, `bodies=luna` ripetuto 1200 volte tiene
  un thread del pool 8,6 s e restituisce 3,9 MB; la crescita è lineare;
- `/api/jyotish` (`…/jyotish/+server.ts:163`): `vargas=d60` ripetuto 3000
  volte con `dashaLevels=3` restituisce 17 MB, dal filo principale.

Come: togliere i doppioni nel motore (un corpo chiesto due volte è una
domanda sola, e lo è per ogni superficie), e nelle rotte rifiutare un elenco
più lungo dei valori ammessi. `/api/election` non ne soffre.

**Versione**: niente per chi chiede elenchi senza ripetizioni; una richiesta
con doppioni riceve una risposta più corta, quindi **seconda cifra**.

**Verifica**: una prova in `sky-events.test.ts` (`['luna','luna']` dà gli
stessi eventi di `['luna']`) e una per rotta; poi le due richieste qui sopra
contro il server compilato, sotto il decimo di secondo.

## 36. Il pool non sa chi se n'è andato

**Priorità alta.** Tre cose in `apps/web/src/lib/server/pool.ts`:

- **nessuna rotta legge `request.signal`**, e `coda.push` (righe 237–254) è
  incondizionato: una richiesta abbandonata resta in coda e poi calcola per
  nessuno. *Verificato*: dopo sedici richieste di tre anni a
  `/api/transits/passages` con `moon=true&minorAspects=true`, lasciate cadere
  dopo 0,3 s, una richiesta di un mese ha atteso 23,8 s invece di 0,04, e il
  processo è salito a 870 MB;
- **la coda non ha tetto né scadenza**: oltre una certa lunghezza conviene
  rispondere 503 subito;
- **un thread che muore non fa ripartire la coda** (`congeda`, riga 192): se
  muoiono tutti con incarichi in attesa, quelle promesse restano pendenti
  finché non arriva un'altra richiesta pesante. *Dedotto.* `chiudiPool`
  (riga 266) svuota la coda senza rifiutare.

Come: togliere dalla coda l'incarico di una richiesta annullata (quello già
affidato a un thread finisce, vedi sotto), un tetto alla coda, e in `congeda`
smistare ciò che aspetta. Lato client, `apps/web/src/lib/api.ts` non usa mai
`AbortController`: si lega alla voce 45.

**Da non fare**: `worker.terminate()` come scadenza. Terminare un thread a
metà di `calc_ut` ha fatto cadere l'intero processo con `FATAL ERROR:
Error::ThrowAsJavaScriptException napi_throw`, dal modulo `sweph`. Va scritto
in `docs/decisioni.md`, *I thread del pool web*, con la correzione.

**Versione**: niente.

**Verifica**: prove in `pool.test.ts` per la richiesta annullata in coda, per
il tetto e per il thread che muore con la coda piena; poi la prova delle
sedici richieste qui sopra.

## 37. Gli ingressi persi accanto a una stazione

**Priorità alta**, verificato. `findSignIngresses`
(`packages/core/src/sky-events.ts:51`) campiona al passo del moto medio e
cerca un ingresso solo dove il segno cambia fra due campioni. Quando un corpo
entra in un segno, staziona ed esce dentro un passo solo, i due
attraversamenti spariscono, e che spariscano dipende da dove cade `from`.

Il caso: Mercurio, 4 gennaio 1970 (entra in Acquario alle 04:20 UT, stazione
alle 08:10 a 0°00′09″, rientra in Capricorno alle 11:59).
`findSignIngresses({from, to: '1970-01-31', timezone: 'UTC'}, {bodies:
['mercurio']})` dà i due ingressi con `from` al 15 dicembre 1969 o al 3
gennaio 1970, e `[]` con `from` al 1°, al 2 o al 4 gennaio. Contro una
ricerca a passi di tre ore, fra il 1800 e il 2400, Mercurio perde tre coppie
(1970, 2244, 2348); da Venere a Plutone nessuna.

Come: fra due campioni dello stesso segno, cercare il massimo e il minimo
della longitudine quando la velocità cambia segno nel passo (le stazioni il
motore le trova già), e guardare se sta oltre il confine. `findSignCourse` e
il vuoto di corso partono dagli ingressi e ne ereditano.

*Dedotto*, da riprodurre prima di toccarlo: la stessa struttura (`g0 * g1 >
0` fra campioni al moto medio) sta in `passages.ts:149` e
`sky-passages.ts:199`, e vale allora per le perfezioni doppie accanto a una
stazione. In `passages.ts:71` il margine di campionamento è fisso: con `orbs`
larghe la `window` dei passaggi vicini ai bordi può mancare, e `attivi.ts`
lo allarga mentre i passaggi no.

**Versione**: **seconda cifra** (compaiono eventi che prima mancavano), e il
fascicolo canonico dice se li vede.

**Verifica**: una prova col caso del 1970 per ognuno dei cinque `from`, e una
che confronta con la ricerca a tre ore su un secolo di Mercurio.

## 38. Il reggitore del giorno letto nel fuso sbagliato

**Priorità alta**, verificato. `rulerOfDay`
(`packages/core/src/election.ts:421`, chiamata alle righe 182 e 244) legge il
giorno della settimana dell'alba nel `timezone` ricevuto. Il giorno
planetario è però del **luogo**: va dall'alba all'alba di chi sta lì. Se il
fuso passato non è quello del luogo, il giorno slitta.

Il caso: Tokyo, l'ora che comincia alle `2026-11-13T03:16Z` (venerdì a
Tokyo). `findElectionHours` con `timezone: 'Asia/Tokyo'` dà Venere; con
`'UTC'` o `'Europe/Rome'` dà Giove. Lo stesso in `computeSky` con
`dignitySchool: 'lilly'`, dove `dayRuler` entra nelle condizioni di Lilly.
Colpisce chi passa luogo e fuso separati: la CLI con `--tz` di sistema,
`/api/sky` con le coordinate e il fuso di chi scrive.

Come: il giorno della settimana dal tempo locale del luogo, cioè dall'alba in
UT più la longitudine (quindici gradi l'ora), che non chiede nessun fuso.

**Versione**: **seconda cifra**.

**Verifica**: una prova in `election.test.ts` con Tokyo e tre fusi, stesso
reggitore; il fascicolo canonico.

## 39. Gli elenchi vuoti e i nomi sconosciuti nei tool MCP

**Priorità alta**, verificato. Sono risposte sbagliate che non si
presentano come errori, e chi le riceve è un agente che non può accorgersene.
Tutto in `packages/mcp/src/`:

- `find_election_hours` con `bodies: []` o `['luna']` (`tools.ts:1328`)
  marca la Luna `vuota` per tutte le ore dell'arco. La rotta REST rifiuta
  l'elenco vuoto con `CORPO_SCONOSCIUTO`; lo schema `z.array(z.string())` lo
  lascia passare;
- `rulers: []` (`:1336`) dà «Elenco filtrato: solo le ore di » e nessuna
  ora; `find_sky_events` con `include: []` (`:1163`) restituisce una stringa
  vuota come successo;
- `targets` sconosciuti in `find_transit_passages` e `find_active_transits`
  (`:1784`, `:1896`) sono ignorati: `targets: ['pippo']` dà «(nessun aspetto
  si perfeziona in questo arco di tempo)». Lo stesso refuso in `bodies` dà
  `CORPO_SCONOSCIUTO`. Anche `targets: []` e `bodies: []` passano;
- il prompt `lettura_oraria` (`prompts.ts:270`) scarta `time` quando manca
  `date` ed erige la figura per adesso, senza dirlo. Il tool `compute_horary`
  con gli stessi argomenti usa oggi a quell'ora, come le rotte.

Come: `.min(1)` sugli schemi, i `targets` validati come i `bodies`, e nel
prompt la stessa regola del tool.

**Versione**: **seconda cifra** (richieste che avevano una risposta ricevono
un errore).

**Verifica**: una prova per ognuno dei casi qui sopra in `packages/mcp`.

## 40. Gli errori delle rotte

**Priorità media**, verificato.

- **Un fuso non valido dà 500** quando serve a calcolare «adesso» prima che
  il motore lo veda: `transits/passages/+server.ts:36`,
  `transits/active/+server.ts:41`, `sky/calendar/+server.ts:32`, e
  `lib/server/place.ts` per l'elezione. `/api/sky/calendar?timezone=Foo/Bar`
  → `500 ERRORE_INTERNO: Invalid time zone specified: Foo/Bar`; con `from`
  esplicito, e sempre su `/api/chart`, è `400 FUSO_ORARIO_NON_VALIDO`;
- **`apps/web/src/lib/server/errors.ts:28` inoltra il `message` di qualunque
  errore imprevisto.** Per un errore di SQLite o del caricamento di un modulo
  nel thread porterebbe fuori percorsi del server (*dedotto*): al client va
  un testo fisso, il messaggio vero nel log. Lo stesso per `GeoError
  DATABASE_ASSENTE`, che mette nel 503 il percorso del database, e per
  l'avvertenza di Chirone fuori dal 1800–2399, che riporta il messaggio di
  Swiss Ephemeris col percorso della cartella delle effemeridi;
- **`format=xml` dà 200 in JSON** su `/api/sky/course` (riga 39) e
  `/api/horary` (riga 52), e 400 su `/api/chart` e `/api/jyotish`. La voce
  32 accentra `readFormat`: queste due rotte vanno passate di lì con le sei
  nuove;
- **`/api/jyotish?date=9999-03-12`** dà `500 ERRORE_EFFEMERIDI`, mentre
  `/api/chart` con la stessa data dà 200 con le avvertenze;
- **`time=24:00`** è accettato e diventa la mezzanotte del giorno dopo, senza
  avviso (`TIME_PATTERN`, `packages/core/src/time.ts:11`).

**Versione**: **seconda cifra** per i codici che cambiano.

**Verifica**: una prova per riga, e le richieste scritte qui sopra.

## 41. L'oraria con un significatore che manca

**Priorità media**, verificato. `computeHoraryLilly` esce con un `TypeError`
e non con un `ChartError` quando un significatore non è calcolabile:
`packages/core/src/oraria-lilly.ts:144` (`find(...)!`, anche alla riga 139).
`computeHoraryLilly({date: '3500-01-01', time: '12:00', timezone: 'UTC'},
roma, {question: {house: 7}})` → `Cannot read properties of undefined
(reading 'longitude')`: `DATE_PATTERN` ammette anni fino al 9999, Moshier
arriva al 3000. Le altre funzioni reggono: tema, cielo e transiti danno
avvisi; Jyotisha, panchanga e corso un `ChartError`.

**Versione**: **seconda cifra** (cambia un errore).

**Verifica**: una prova in `oraria-lilly.test.ts` che aspetta un
`ChartError` col suo `code`.

## 42. Il tempo medio locale prima dei fusi

**Priorità media, decisione del proprietario.** Prima che un paese adotti
l'ora unica, il database dei fusi dà il tempo medio locale della **città che
dà il nome al fuso**, non del luogo. `1850-06-01 12:00` con `Europe/Rome`
riceve 49,93 minuti di offset a Roma, a Lecce e a Torino, senza avviso; il
tempo locale vero di Lecce è 72,7 minuti e di Torino 30,8, cioè circa venti
minuti d'errore e parecchi gradi di Ascendente. Il commento di `resolveTime`
(`packages/core/src/time.ts`) lo presenta come gestito, e `/metodo` non ne
parla.

Da decidere: **correggere** (prima della data in cui il fuso smette di essere
LMT, usare la longitudine del luogo; ma `resolveTime` oggi riceve un
`LocalMoment` e non il luogo, e la data va presa dal database dei fusi) oppure
**dichiarare** (un'avvertenza quando l'offset del fuso è LMT, e una riga in
`/metodo`). La seconda è piccola e non sceglie al posto di chi calcola.

**Versione**: **seconda cifra** in entrambi i casi.

**Verifica**: una prova con le tre città nel 1850.

## 43. Le risposte MCP da un milione di caratteri

**Priorità media**, verificato. Il tetto di tre anni conta i giorni e non le
righe. `find_transit_passages` su tre anni con `bodies: ['luna', 'sole',
'mercurio', 'venere', 'marte']` e `minor_aspects: true` restituisce 1.220.988
caratteri in 6,2 s (`packages/mcp/src/tools.ts:1811`); `find_active_transits`
con la sola Luna 1.090.804 (`:1923`); `find_sky_events` con la Luna 755.515
(`:1191`). Sono risultati singoli su stdio, col server fermo nel frattempo, e
nessun agente li può leggere.

Come: un arco più corto quando fra i corpi c'è la Luna (è lei a fare il
numero), detto nella descrizione del tool e nel messaggio d'errore, oppure un
tetto alle righe con l'invito a restringere. Va deciso insieme per MCP e per
le rotte, che hanno lo stesso tetto.

**Versione**: **seconda cifra** se una richiesta oggi servita viene
rifiutata.

**Verifica**: le tre chiamate qui sopra ricevono un errore che dice come
restringere.

## 44. Le descrizioni dei tool che non dicono il codice

**Priorità media**, verificato. Le descrizioni dei tool sono la fonte
(`CLAUDE.md`), quindi qui un testo sbagliato è un dato sbagliato. In
`packages/mcp/src/tools.ts`:

- `compute_transits` (riga 591) dice «due gradi contro otto»; la risorsa
  `aspetti`, generata dal motore, dice 1° (hand) contro 10° (greene);
- `find_election_hours` dice «Massimo 31 giorni»: `from: '2026-01-10', to:
  '2026-02-10'` passa il controllo MCP (riga 1365, differenza 31) e il motore
  lo rifiuta con «Arco di 32 giorni… al massimo 31». Due conteggi, uno degli
  estremi compresi e uno no;
- `compute_jyotisha_chart` dice che senza ora le dasha «diventano indicative
  di anni»; l'avvertenza del motore dice «non sono approssimate ma
  inservibili»;
- `width` va da 400 a 2000 su `draw_chart_wheel` e da 200 a 4000 su
  `draw_jyotisha_chart` e sulle rotte.

**Versione**: niente per i testi; **seconda cifra** se cambiano i limiti di
`width` o dell'arco.

**Verifica**: dove si può, una prova che lega il testo alla costante, come
fa la risorsa `aspetti`.

## 45. Il link e le risposte in corsa nell'interfaccia

**Priorità media.** Tutto *dedotto* dalla lettura: la revisione non ha
aperto un browser, e la prima cosa da fare è riprodurre ogni punto.

- **Il link di `/vedica` non ricostruisce il tema.**
  `apps/web/src/routes/vedica/+page.svelte:324` scrive nel link
  `dashaLevels`, `dashaYear`, `vargas`, `hora` e `drishtiNodes`; l'`onMount`
  (riga 190) rilegge solo `ayanamsa`. Chi apre un link fatto con
  `dashaYear=savana` vede altre date, senza segnale;
- **Link e lettura si compongono dal modulo, non dal tema a schermo**:
  `routes/+page.svelte:297` e `:312`, `vedica/+page.svelte:324` e `:331`,
  `transiti/+page.svelte:354`. Calcolare, cambiare la data nel modulo senza
  ricalcolare, premere «Copia link»: esce il link di un'altra nascita sotto
  il tema vecchio. `oraria/+page.svelte` lo evita già con `mostrati`;
- **Risposte vecchie sopra le nuove**, dove manca il contatore `ultima`:
  `transiti/+page.svelte:229` (`loadPassages`), `cielo/+page.svelte:212`
  (`loadCalendar`), `elezione/+page.svelte:171` (`load`, coi pulsanti ‹ ›
  delle righe 338–341 che non si disabilitano), e
  `lib/components/LocationSearch.svelte:80` (`search`), dove inoltre «Nessun
  risultato» compare nei 220 ms del debounce (riga 204).

Con la voce 36: un `AbortController` in `lib/api.ts` chiude le corse e
libera il pool insieme.

**Versione**: niente.

**Verifica**: in un browser, con la rete rallentata, i tre percorsi qui
sopra; una prova per la lettura dei parametri di `/vedica`.

## 46. La ricerca delle località

**Priorità media.**

- **Ogni battuta scorre la tabella** (*verificato*):
  `packages/geo/src/search.ts:59`, `EXPLAIN QUERY PLAN` dice `SCAN n` più due
  B-tree temporanei su 1.217.417 righe, 54–60 ms a query e 95–120 per un
  prefisso di una lettera. Il `LIKE` non usa `idx_location_names_search`,
  che ha la collazione binaria. `/api/locations` non passa dal pool, quindi
  quel tempo è dell'event loop del server. Da provare: un intervallo sul
  prefisso (`>= 'rom' AND < 'ron'`) sulla colonna già normalizzata, o
  l'indice con `COLLATE NOCASE`; cambia `schema.sql`, quindi chiede una
  reimportazione, sul server compresa;
- **errori di SQLite grezzi invece di `GeoError`** (*verificato*): una
  query da 60.000 caratteri dà `LIKE or GLOB pattern too complex` (lo schema
  di `search_location` ha `min(1)` e nessun `max`); un file che non è un
  database in `GEONAMES_DB_PATH` dà `file is not a database`, perché
  `DatabaseSync` apre in modo pigro e il ramo `DATABASE_CORROTTO` di
  `database.ts:52` non si raggiunge, e la connessione rotta resta in cache;
- **i `.txt` di GeoNames in cache non hanno controllo** (*dedotto*):
  `usableFromCache` in `scripts/import-geonames.mjs` copre gli zip dal commit
  `da195dc`, non `countryInfo.txt`, che con un 200 non pertinente darebbe un
  database «riuscito» coi paesi nominati per sigla.

**Versione**: niente, se i risultati e il loro ordine non cambiano; va
provato.

**Verifica**: `EXPLAIN QUERY PLAN` con `SEARCH` al posto di `SCAN`, gli
stessi risultati di prima su un elenco di query fisse, e una prova per
ognuno dei due errori.

## 47. Gli input del motore non validati

**Priorità bassa**, verificato dove non è detto altro. Nessuno di questi si
raggiunge dal sito o da MCP, che filtrano prima; valgono per chi importa
`@dodicisegni/core` e per la CLI.

- `orbs` non è validato (`orbite.ts:282`, `aspects.ts:118`): `limit <= 0 ||
  orb > limit` è falso con `NaN`, e `computeTransits(natal, momento, {orbs:
  {congiunzione: NaN}})` dà 154 congiunzioni con orbita fino a 178°. Un
  valore negativo spegne l'aspetto in silenzio;
- `normalize360(-1e-15) === 360` (`math.ts:8`): a valle `tithiOf` dà l'indice
  31, `yogaOf` 28, `karanaOf` 61, tutti senza nome, e `nakshatraOf` lancia.
  Parente: `nakshatraOf(226.66666666666666)` dà `pada: 0`
  (`nakshatra.ts:129`);
- un giorno giuliano `NaN` passa `typeof … === 'number'`
  (`computeBody`, `ephemeris.ts`): Sole con longitudine `NaN`, segno
  «ariete», nessun avviso. Si raggiunge da `findSignCourse` e
  `planetaryHourAt`, che prendono il giorno giuliano nudo;
- nessun tetto agli archi (`resolveRange`, `roots.ts:74`): solo
  `findElectionHours` e `findSignCourse` ne hanno uno. Trent'anni costano
  6,3 s a `findSkyPassages`; web e MCP tagliano a 1096 giorni da sé, la CLI
  (`passageRange`, `cli.ts:1270`) no;
- `computeVimshottari` non controlla `levels` a runtime: con 6 produce
  597.870 periodi in 6,8 s;
- `findIngress` (`corso.ts:283`) non inoltra `options.ephemerisPath`
  (*dedotto*).

**Versione**: da guardare caso per caso; il fascicolo canonico non dovrebbe
muoversi.

**Verifica**: una prova per riga.

## 48. Il contorno

**Priorità bassa.**

- **Il lint non gira nei controlli**: `.github/workflows/controlli.yml`
  lancia `npm test` e `npm run typecheck`, non `npm run lint`, che questo
  file mette fra i tre da avere verdi;
- **`npm audit`**: il 13 novembre 2026, 20 segnalazioni, nessuna alta. In
  produzione due moderate, `hono` e `@hono/node-server`, da
  `@modelcontextprotocol/sdk`: riguardano il trasporto HTTP, che il server
  MCP non usa (solo stdio). `npm audit fix` le chiude; le altre stanno negli
  strumenti (`minimatch` sotto eslint ed electron-builder);
- **tre prove di `ruota` importano tipi da `core`**:
  `packages/ruota/test/png.test.ts:1`, `svg.test.ts:1`, `wheel.test.ts:1`.
  `CLAUDE.md` dice che `test/tipi.test.ts` è l'unico punto che lo vede: o si
  correggono le prove o si corregge la frase;
- **`apps/desktop/src/main.ts:196`** (*dedotto*, non eseguito): chiudere la
  finestra dell'importazione porta a `splash.destroy()` su una finestra già
  distrutta, e l'errore che si vede è `Object has been destroyed` al posto
  di «L'importazione non è andata a buon fine…». Nella stessa funzione
  `spawn` non ha un gestore di `error`;
- **le intestazioni di sicurezza**: l'applicazione non ne manda (niente
  CSP, `X-Content-Type-Options`, `Referrer-Policy`), e
  `apps/web/src/hooks.server.ts` non esiste. Va guardato che cosa aggiungono
  Caddy e Cloudflare (`curl -sI https://dodicisegni.it`) prima di decidere
  dove metterle; l'`handle` della voce 31 è il posto, se servono qui. La
  revisione non ha trovato un'iniezione che le renda urgenti.

**Versione**: niente.

## 49. La revisione di ciò che non è stato guardato

**Priorità media, per ultima.** La revisione del 13 novembre 2026 ha letto a
fondo le rotte, `lib/server`, il nucleo del motore (tempo, effemeridi, case,
tema, cielo, transiti, passaggi, eventi, elezione, panchanga), `packages/mcp`,
`packages/geo`, `packages/lettura`, il disegno della ruota e `main.ts` del
desktop. Il resto l'ha scorso o saltato, e lì non può escludere niente. Questa
voce è la revisione di quel resto, con lo stesso metodo: un difetto vale
quando è riprodotto con un input scritto, e ogni cosa trovata diventa una
voce sua o si corregge subito.

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
  agenti e la base di `format=compact` (voce 32). Un campo del risultato che
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
  `chrome-devtools-mcp:a11y-debugging`. Va fatta **in un browser**, anche
  per chiudere il «dedotto» della voce 45;
- **`packages/ruota/src/quadro-svg.ts`**, provato a tappeto ma non letto riga
  per riga, `glyphs.ts`, `types.ts`;
- **`apps/desktop`** eseguito davvero: la revisione non aveva un binario di
  Electron e ha solo letto;
- **le prove stesse**, mai lette: che cosa affermano e che cosa no. Tre dei
  quattro difetti corretti il 13 novembre avevano una prova accanto che
  guardava altro (l'avviso dell'ora ambigua c'era, l'ora giusta nessuno la
  controllava; Tromsø provava l'assenza dell'alba e non le case). Da cercare:
  prove che controllano solo che un avviso esista, e casi di bordo che il
  nome della prova promette e il corpo non tocca;
- **la produzione**, non toccata: intestazioni, log (la promessa di
  `/privacy` sulle query string, che la voce 33 chiede comunque di
  controllare), il comportamento dietro Cloudflare.

**Versione**: niente, finché non trova qualcosa.

**Verifica**: la voce si chiude quando ogni riga dell'elenco ha accanto, in
`docs/storia.md`, che cosa è stato letto e che cosa ne è uscito; non quando
non si trova più niente.
