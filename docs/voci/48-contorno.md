# 48. Il contorno

**Priorità bassa.**

- **Il lint non gira nei controlli**: `.github/workflows/controlli.yml`
  lancia `npm test` e `npm run typecheck`, non `npm run lint`, che il
  `TODO.md` mette fra i tre da avere verdi;
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
