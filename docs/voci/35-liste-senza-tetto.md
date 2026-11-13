# 35. Le liste senza tetto nelle rotte

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
