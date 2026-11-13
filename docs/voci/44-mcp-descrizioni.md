# 44. Le descrizioni dei tool che non dicono il codice

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
