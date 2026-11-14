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

Al 14 novembre 2026, versione **0.26.1**, tag `v0.26.1`. `origin` e il sito
sono alla `v0.25.0`, pubblicata la mattina del 14 novembre; ciò che è venuto
dopo è in locale (`git status -sb`). Push e deploy li chiede il
proprietario, e si fanno come in `CLAUDE.local.md`.

I riferimenti `file:riga` di tutte le voci sono stati ricontrollati il 13
novembre 2026 sulla 0.15.0. Le righe si spostano: se una non torna, fa fede
il nome della funzione o della costante accanto.

Le voci vengono da due parti:

- **33**: ciò che resta dell'integrazione con **dodicicase**, la piattaforma commerciale a
  codice chiuso che chiamerebbe dodicisegni solo in rete, senza importarne
  codice (`~/Progetti/it-dodicicase`, `docs/architettura.md`). Dal 14
  novembre 2026 dodicicase è fermo: la voce resta, senza fretta;
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
| 33. Un servizio `motore` senza porte in `compose.yaml`, per la rete interna | `33-istanza-interna.md` | bassa | piccola | — | dodicicase è fermo; conferma del proprietario per il server |
| 45. Interfaccia: il link di `/vedica`, il link composto dal modulo, le risposte in corsa | `45-interfaccia-corse.md` | media | media | — | tutta dedotta: va riprodotta in un browser; il lato server è fatto con la 36 |
| 46. La ricerca delle località scorre la tabella a ogni battuta; errori di SQLite grezzi | `46-ricerca-localita.md` | media | media | — | cambia `schema.sql`: chiede una reimportazione, sul server compresa |
| 49. La revisione di ciò che il 13 novembre non è stato guardato | `49-revisione-resto.md` | media | grande | — | per ultima, dopo le voci 35–48; si può spezzare per riga |

Un ordine che regge: le alte della revisione sono chiuse, e così le due funzioni
per dodicicase (31 e 32) e le due medie che aspettavano una decisione (42 e
43); le medie che restano; la 49 per ultima.
