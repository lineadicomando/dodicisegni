---
name: nuova-funzione
description: Usare quando si AGGIUNGE o si ESTENDE una funzione di calcolo di dodicisegni che deve arrivare agli utenti o agli agenti: nuovo calcolo in core, nuovo endpoint /api, nuovo tool MCP, nuova sezione dell'interfaccia, nuova opzione della CLI. Elenca i passi da attraversare (core, CLI, web, MCP, lettura, README) e come spezzarli in commit. Trigger: nuovo calcolo, nuovo endpoint, nuovo tool MCP, nuova sezione, esporre agli agenti, nuova opzione CLI.
---

# Aggiungere una funzione a dodicisegni

Il progetto ha un motore solo e **tre superfici** che lo raccontano: la CLI,
il web (API e interfaccia, che il desktop porta in una finestra) e il server
MCP. Una
funzione che si ferma a metà lascia un endpoint che nessuna interfaccia chiama,
o un tool MCP che nessun prompt sa di poter usare. Il lavoro non è finito finché
tutte le superfici pertinenti sono allineate.

## Le superfici

```
packages/core/src/<funzione>.ts     il calcolo
  ├── types.ts                      i tipi del risultato
  ├── index.ts                      l'export pubblico
  ├── format.ts                     formatXxxCompact, la resa densa per gli agenti
  └── cli.ts                        le opzioni di dodicisegni
packages/core/test/<funzione>.test.ts   obbligatorio

apps/web/
  ├── src/routes/api/<...>/+server.ts   endpoint GET
  ├── src/lib/server/{place,birth,moment,range}.ts   lettura parametri, già condivisa
  ├── src/lib/server/pool.ts            se il calcolo costa secondi
  ├── src/lib/api.ts                    chiamata lato client
  ├── src/lib/components/<Xxx>Table.svelte
  ├── src/routes/<sezione>/+page.svelte
  └── src/lib/navigation.ts             se è una sezione nuova

packages/mcp/
  ├── src/tools.ts                  registerXxx(server, context)
  ├── src/server.ts                 la registrazione
  └── test/server.test.ts           obbligatorio

packages/ruota/                     se la funzione disegna (tool draw_*, rotte .../wheel)
packages/lettura/src/               le istruzioni di lettura, se la funzione le tocca
packages/mcp/src/prompts.ts         il prompt che le consegna
README.md                           se cambiano i comandi, le superfici o i conteggi
```

**Il progetto non ha una documentazione estesa, e non è una dimenticanza.** I
parametri si documentano dove vivono: il commento in testa alla rotta, la
descrizione del tool MCP, `--help` della CLI. Un elenco separato è una copia
che diverge. Il README tiene descrizione, licenza e comandi, e basta.

## Procedura

1. **Il calcolo, in `core`.** Funzione pura, nessuna nozione di HTTP o MCP.
   Tipi in `types.ts`, export da `index.ts`, un `formatXxxCompact` in
   `format.ts` se il risultato è destinato anche agli agenti. Test con valori
   attesi verificabili, non snapshot.
2. **La CLI**, se la funzione ha senso da riga di comando: è il modo più
   economico di provarla prima che esistano le altre superfici.
3. **Le superfici**, insieme: endpoint, interfaccia, tool MCP. Riusa
   `lib/server/*` per leggere i parametri invece di riscriverne la validazione,
   e fa' che le tabelle prendano i dati, non il tema.
4. **Il commento in testa alla rotta e la descrizione del tool**, che sono la
   documentazione: dicono i parametri, i valori ammessi e che cosa non fare.
   Il README solo se cambiano i comandi o i conteggi scritti a mano: i tool
   MCP («undici tool», anche in `CLAUDE.md`), gli endpoint e le sezioni web.
5. `npm test && npm run typecheck`.
6. **La versione**, con l'ultimo commit della funzione: le tre domande di
   `CLAUDE.md` (*La versione*) dicono quale cifra si muove. Una funzione
   nuova muove la terza; se cambia anche una risposta che c'era, la seconda,
   e lo dice il fascicolo canonico (`test/canonico.test.ts` in `core`), che
   allora fallisce. Se la funzione è un'opzione nuova che si chiede per nome,
   aggiungi un suo caso al fascicolo.
   Poi il tag annotato `v<numero>` su quel commit.

## I commit

Uno per fase, nell'ordine in cui il repo li ha sempre avuti:

```
Trova gli ingressi nei segni e le stazioni                   → core + cli + test
Mostra il calendario del cielo nell'interfaccia e agli agenti → web + mcp
```

Italiano, indicativo presente terza persona, nessun prefisso convenzionale.
Il cambio di versione non è un commit a sé: sta nell'ultimo della serie.

## Regole che valgono qui più che altrove

- **Non far scegliere in silenzio.** `compute_natal_chart` non fa geocoding
  perché scegliere fra le decine di «Roma» del mondo produce un tema plausibile
  e sbagliato. Ogni disambiguazione resta un passo esplicito.
- **La data di adesso la mette il server.** Nelle descrizioni dei tool MCP, i
  parametri temporali vanno dichiarati omissibili e l'agente va istruito a non
  compilarli: `transit_date`, `from`, `date`.
- **Le descrizioni dei tool dicono anche cosa non fare.** È lì che un modello
  inventa una data di nascita per poter chiamare `compute_transits`.
- **Dottrine nominate, mai significati.** Una regola di una tradizione entra
  con la scuola e la fonte accanto, la pagina compresa; una scuola entra
  intera, non mescolata a un'altra; dove le scuole divergono si espongono i
  componenti, e non entra un peso che non abbia un autore fuori dal repo. Che
  cosa il dato significhi non lo dice mai: è il vincolo in `CLAUDE.md`.
- **Niente `async` nella catena di calcolo.** Se la funzione costa secondi, la
  rotta la manda nel pool di `lib/server/pool.ts`, che la tiene sincrona su un
  altro thread.
- **Nel client di `apps/web` si importano solo tipi da `core`.** Un import di
  valore trascina le effemeridi nel bundle del browser.
- Se il risultato può crescere senza limite (un arco di date), serve un tetto:
  `MAX_RANGE_DAYS` in `tools.ts` e `lib/server/range.ts` sono il precedente.
