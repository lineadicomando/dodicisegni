# 39. Gli elenchi vuoti e i nomi sconosciuti nei tool MCP

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
