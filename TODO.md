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

Al 13 novembre 2026, versione **0.20.0**, tag `v0.20.0`. `origin` e il sito
sono alla `v0.19.0`, pubblicata la sera del 13 novembre; ciò che è venuto
dopo è in locale (`git status -sb`). Push e deploy li chiede il
proprietario, e si fanno come in `CLAUDE.local.md`.

I riferimenti `file:riga` di tutte le voci sono stati ricontrollati il 13
novembre 2026 sulla 0.15.0. Le righe si spostano: se una non torna, fa fede
il nome della funzione o della costante accanto.

Le voci vengono da tre parti:

- **28**: la SEO, che aspetta i dati dei motori di ricerca;
- **33–34**: ciò che resta dell'integrazione con **dodicicase**, la piattaforma commerciale a
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
| 33. Un servizio `motore` senza porte in `compose.yaml`, per la rete interna | `33-istanza-interna.md` | alta | piccola | — | conferma del proprietario per il server |
| 34. La doppia licenza di `ruota` e `lettura` | `34-doppia-licenza.md` | media | piccola | — | decisione del proprietario |
| 40. Rotte: fuso non valido dà 500, messaggi grezzi al client, date e ore al limite | `40-errori-rotte.md` | media | piccola | 2ª | — |
| 41. L'oraria esce con un `TypeError` se un significatore non è calcolabile | `41-oraria-significatore.md` | media | piccola | 2ª | — |
| 42. Prima dei fusi il tempo medio locale è quello della città del fuso, non del luogo | `42-tempo-medio-locale.md` | media | piccola | 2ª | decisione del proprietario: correggere o dichiarare |
| 43. Tool MCP: con la Luna, tre anni rendono un milione di caratteri | `43-mcp-risposte-enormi.md` | media | piccola | 2ª | da decidere insieme per MCP e rotte |
| 44. Quattro descrizioni dei tool MCP non dicono ciò che il codice fa | `44-mcp-descrizioni.md` | media | piccola | — | — |
| 45. Interfaccia: il link di `/vedica`, il link composto dal modulo, le risposte in corsa | `45-interfaccia-corse.md` | media | media | — | tutta dedotta: va riprodotta in un browser; il lato server è fatto con la 36 |
| 46. La ricerca delle località scorre la tabella a ogni battuta; errori di SQLite grezzi | `46-ricerca-localita.md` | media | media | — | cambia `schema.sql`: chiede una reimportazione, sul server compresa |
| 47. Input del motore non validati (`orbs`, `normalize360`, giorno giuliano, archi, `levels`) | `47-input-motore.md` | bassa | piccola | caso per caso | — |
| 48. Il contorno: lint nei controlli, `npm audit`, tre prove di `ruota`, lo splash del desktop, le intestazioni | `48-contorno.md` | bassa | piccola | — | — |
| 49. La revisione di ciò che il 13 novembre non è stato guardato | `49-revisione-resto.md` | media | grande | — | per ultima, dopo le voci 35–48; si può spezzare per riga |

Un ordine che regge: le alte della revisione sono chiuse, e così le due funzioni
per dodicicase (31 e 32); le medie; la 49 per ultima.
