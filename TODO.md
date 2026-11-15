# TODO

L'indice del lavoro aperto: una riga per voce. La voce intera sta in
`docs/voci/`, e **si legge solo quella su cui si lavora**. I numeri sono
stabili e non si riusano: il prossimo è il **52**.

Prima di cominciare: `npm test`, `npm run typecheck` e `npm run lint` verdi
(il lint si guarda intero). Si cercano per parola, non si leggono interi:
`docs/decisioni.md` prima di proporre una scelta, `docs/esaminato.md` prima
di cercare una fonte o rifare un controllo, `docs/sessioni.md` per come si è
arrivati a una cosa. `docs/lavorare.md` tiene gli inciampi e il metodo.

## Dove siamo

Al 15 novembre 2026: versione **0.28.0** (tag `v0.28.0`, commit `a4f13f5`),
pushata su `origin` col lavoro che la segue. Il sito (https://dodicisegni.it)
è ancora alla **0.26.1**: i deploy della 0.27.0 e della 0.28.0 non sono
stati chiesti. `git status -sb` deve dire che `main` è allineato a
`origin`, o avanti dei soli commit della sessione; altro è lavoro lasciato
a metà. Push e deploy li chiede il proprietario, e si fanno come in
`CLAUDE.local.md`.

**Da dove si riprende**: voce 49, riga 1, l'ultima scuola, il Jyotisha. Quali restano lo dice la tabella *Stato* della voce.

## Le voci

*Cifra*: quale cifra della versione muove la voce (`CLAUDE.md`, *La
versione*).

| Voce | File in `docs/voci/` | Priorità | Taglia | Cifra | Stato |
|---|---|---|---|---|---|
| 49. La revisione di ciò che il 13 novembre non è stato guardato | `49-revisione-resto.md` | media | grande | — | in corso: nove righe; della prima fatte Lilly, Tolomeo, Valente, Bonatti e il filo comune |
| 33. Un servizio `motore` senza porte in `compose.yaml`, per la rete interna | `33-istanza-interna.md` | bassa | piccola | — | ferma: serve a dodicicase, che il proprietario ha messo in pausa |

## Chiudere e aprire una voce

Chiudere: togliere la riga di qui, `git rm` del suo file, e segnare

- in `docs/storia.md` una riga nella tavola delle voci chiuse, col commit
  **prima** della chiusura (quello in cui il file si legge ancora: una voce
  aperta e chiusa nella stessa sessione vuole quindi due commit) e, se la
  versione si muove, la riga nella tavola delle versioni;
- in `docs/sessioni.md` che cosa si è scelto e misurato;
- in `docs/decisioni.md` le scelte che restano valide;
- qui sopra, *Dove siamo*.

Aprire: il contrario, col numero dopo l'ultimo, e un file in `docs/voci/`
che dica priorità, come riprodurre, quale cifra muove e come si verifica.
