# 43. Le risposte MCP da un milione di caratteri

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
