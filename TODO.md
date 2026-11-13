# TODO

L'indice del lavoro aperto. Ogni voce ha un file suo in `docs/voci/`, col
file, la riga, l'input che la riproduce e il modo di verificarla: **si legge
solo quello della voce su cui si lavora**. I numeri sono stabili e non si
riusano. Chiudere una voce vuol dire togliere la sua riga di qui, cancellare
il suo file e segnarla in `docs/storia.md`; aprirne una, il contrario, col
numero dopo l'ultimo.

Prima di cominciare:

- `npm test`, `npm run typecheck` e `npm run lint` verdi;
- `docs/lavorare.md` per gli inciampi noti, `docs/decisioni.md` prima di
  proporre una scelta di dottrina, `docs/esaminato.md` prima di cercare una
  fonte o di rifare un controllo: si cercano per parola, non si leggono
  interi.

## Dove siamo

Al 13 novembre 2026, versione **0.16.0**, tag `v0.16.0`. **Non pubblicata**:
`origin` e il sito sono alla `v0.14.0`, e in locale ci sono i commit della
revisione e della voce 35 (`git status -sb`). Push e deploy li chiede il proprietario, e si
fanno come in `CLAUDE.local.md`.

I riferimenti `file:riga` di tutte le voci sono stati ricontrollati il 13
novembre 2026 sulla 0.15.0. Le righe si spostano: se una non torna, fa fede
il nome della funzione o della costante accanto.

Le voci vengono da tre parti:

- **28**: la SEO, che aspetta i dati dei motori di ricerca;
- **31–34**: l'integrazione con **dodicicase**, la piattaforma commerciale a
  codice chiuso che chiamerà dodicisegni solo in rete, senza importarne
  codice (`~/Progetti/it-dodicicase`, `docs/architettura.md`). Sono funzioni
  pubbliche e generali: nessuna aggiunge account, archivi o altro che
  contraddica `/privacy`;
- **35–49**: la revisione dell'intero progetto del 13 novembre 2026. Nei
  file, *verificato* vuol dire riprodotto con l'input scritto accanto;
  *dedotto* viene dalla sola lettura, e la prima cosa da fare è riprodurlo.
  Che cosa la revisione ha letto e trovato a posto sta in
  `docs/esaminato.md`; che cosa non ha letto è la voce 49.

## Le voci

La colonna *Cifra* dice quale cifra della versione muove la voce
(`CLAUDE.md`, *La versione*): 2ª, 3ª o nessuna.

| Voce | File in `docs/voci/` | Priorità | Taglia | Cifra | Prima di cominciare |
|---|---|---|---|---|---|
| 28. La revisione della SEO: leggere negli strumenti dei motori quali pagine sono escluse | `28-seo.md` | media | piccola | — | non prima di metà novembre 2026; è del proprietario, fuori dal repo |
| 31. La versione del motore in un'intestazione su tutte le risposte di `/api` | `31-versione-nelle-risposte.md` | alta | piccola | 3ª | — |
| 32. `format=compact` sulle sei rotte di calcolo che non l'hanno | `32-testo-compatto.md` | alta | piccola | 3ª | porta con sé due righe della 40 |
| 33. Un servizio `motore` senza porte in `compose.yaml`, per la rete interna | `33-istanza-interna.md` | alta | piccola | — | conferma del proprietario per il server; meglio dopo la 31 |
| 34. La doppia licenza di `ruota` e `lettura` | `34-doppia-licenza.md` | media | piccola | — | decisione del proprietario |
| 36. Il pool calcola per chi se n'è andato, la coda non ha tetto, un thread morto non la fa ripartire | `36-pool.md` | alta | media | — | mai `worker.terminate()` come scadenza: fa cadere il processo |
| 37. Ingressi di Mercurio persi accanto a una stazione, secondo dove cade `from` | `37-ingressi-stazione.md` | alta | media | 2ª | — |
| 38. Il reggitore del giorno planetario letto nel fuso passato e non nel luogo | `38-reggitore-del-giorno.md` | alta | piccola | 2ª | — |
| 39. Tool MCP: elenchi vuoti e `targets` sconosciuti danno risposte sbagliate senza errore | `39-mcp-elenchi-vuoti.md` | alta | piccola | 2ª | — |
| 40. Rotte: fuso non valido dà 500, messaggi grezzi al client, `format=xml` accettato da due rotte | `40-errori-rotte.md` | media | piccola | 2ª | — |
| 41. L'oraria esce con un `TypeError` se un significatore non è calcolabile | `41-oraria-significatore.md` | media | piccola | 2ª | — |
| 42. Prima dei fusi il tempo medio locale è quello della città del fuso, non del luogo | `42-tempo-medio-locale.md` | media | piccola | 2ª | decisione del proprietario: correggere o dichiarare |
| 43. Tool MCP: con la Luna, tre anni rendono un milione di caratteri | `43-mcp-risposte-enormi.md` | media | piccola | 2ª | da decidere insieme per MCP e rotte |
| 44. Quattro descrizioni dei tool MCP non dicono ciò che il codice fa | `44-mcp-descrizioni.md` | media | piccola | — | — |
| 45. Interfaccia: il link di `/vedica`, il link composto dal modulo, le risposte in corsa | `45-interfaccia-corse.md` | media | media | — | tutta dedotta: va riprodotta in un browser; si lega alla 36 |
| 46. La ricerca delle località scorre la tabella a ogni battuta; errori di SQLite grezzi | `46-ricerca-localita.md` | media | media | — | cambia `schema.sql`: chiede una reimportazione, sul server compresa |
| 47. Input del motore non validati (`orbs`, `normalize360`, giorno giuliano, archi, `levels`) | `47-input-motore.md` | bassa | piccola | caso per caso | — |
| 48. Il contorno: lint nei controlli, `npm audit`, tre prove di `ruota`, lo splash del desktop, le intestazioni | `48-contorno.md` | bassa | piccola | — | — |
| 49. La revisione di ciò che il 13 novembre non è stato guardato | `49-revisione-resto.md` | media | grande | — | per ultima, dopo le voci 35–48; si può spezzare per riga |

Un ordine che regge: le alte e piccole della revisione (38, 39), poi 37 e
36, che sono le due di taglia media; 31 e 32 quando serve dodicicase; le
medie; la 49 per ultima.
