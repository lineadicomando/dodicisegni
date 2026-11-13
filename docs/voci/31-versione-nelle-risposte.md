# 31. La versione del motore nelle risposte

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
