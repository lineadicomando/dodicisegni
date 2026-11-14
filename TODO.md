# TODO

L'indice del lavoro aperto: una riga per voce. La voce intera (file, input
che la riproduce, verifica) sta in `docs/voci/`, e **si legge solo quella su
cui si lavora**. I numeri sono stabili e non si riusano: il prossimo è il
**52**.

Prima di cominciare: `npm test`, `npm run typecheck` e `npm run lint` verdi
(il lint si guarda intero). `docs/lavorare.md` tiene gli inciampi noti;
`docs/decisioni.md` va cercato per parola prima di proporre una scelta,
`docs/esaminato.md` prima di cercare una fonte o rifare un controllo.

## Dove siamo

Al 14 novembre 2026: versione **0.27.0**, tag `v0.27.0`, **non ancora
pubblicata**. `origin` e il sito (https://dodicisegni.it) sono fermi alla
0.26.1, commit `a1f605e`; se `git status
-sb` dice altro, quello è lavoro locale. Push e deploy li chiede il
proprietario, e si fanno come in `CLAUDE.local.md`.

Tutte le voci della revisione del 13 novembre (35–48) sono chiuse, e così
la 28, la 34, la 42, la 43 e la 50. Resta la revisione di ciò che allora non
fu letto (voce 49): della prima riga, le tavole di dottrina, è fatta la
scuola di Lilly, che ha aperto la voce 51, chiusa lo stesso giorno.

## Le voci

*Cifra*: quale cifra della versione muove la voce (`CLAUDE.md`, *La
versione*).

| Voce | File in `docs/voci/` | Priorità | Taglia | Cifra | Prima di cominciare |
|---|---|---|---|---|---|
| 49. La revisione di ciò che il 13 novembre non è stato guardato | `49-revisione-resto.md` | media | grande | — | è la prossima; si spezza per riga dell'elenco, una sessione per riga. Fatta la scuola di Lilly; il file dice che cosa resta della prima riga |
| 33. Un servizio `motore` senza porte in `compose.yaml`, per la rete interna | `33-istanza-interna.md` | bassa | piccola | — | ferma: serve a dodicicase, che il proprietario ha messo in pausa |

## Chiudere e aprire una voce

Chiudere: togliere la riga di qui, `git rm` del suo file, e segnare

- in `docs/storia.md` una riga nella tavola delle voci chiuse, col
  commit **prima** della chiusura (quello in cui il file si legge ancora) e,
  se la versione si muove, la riga nella tavola delle versioni;
- in `docs/sessioni.md` che cosa si è scelto e misurato;
- in `docs/decisioni.md` le scelte che restano valide;
- qui sopra, *Dove siamo*.

Aprire: il contrario, col numero dopo l'ultimo, e un file in `docs/voci/`
che dica priorità, come riprodurre, quale cifra muove e come si verifica.
