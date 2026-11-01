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

Al 1° novembre 2026, versione **0.14.0**. Sono aperte la voce della SEO, che
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
