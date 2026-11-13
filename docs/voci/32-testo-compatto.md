# 32. Il testo compatto su tutte le rotte di calcolo

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

Con questa voce si chiudono anche due righe della 40: `/api/horary` e
`/api/sky/course` leggono `format` da sé e accettano `format=xml` come JSON;
passano dal `readFormat` comune insieme alle sei nuove.
