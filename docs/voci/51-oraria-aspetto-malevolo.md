# 51. La condizione di p. 125 che l'oraria di Lilly non riporta

**Priorità media.** Trovata il 14 novembre 2026 rileggendo `oraria-lilly.ts`
contro le pagine (voce 49, prima riga, scuola di Lilly).

Per il sestile e il trigono Lilly scrive, a p. 125
(`texts/occidentale/lilly-christian-astrology-1647/pagine/p125.jpg`,
trascritto in `trascrizioni.md`):

> …when as the principall signifiers apply by ✶ or △ aspect out of good
> Houses and places where they are essentially well dignified (and meet with
> no malevolent Aspect to intervene ere they come to be in perfect ✶ or △;
> I meane to the partill Sextill or Tryne.

Le condizioni sono tre. `qualitaDellaPerfezione`
(`packages/core/src/oraria-lilly.ts:530`) ne restituisce due, `case-buone` e
`forti`; la parentesi, «no malevolent Aspect to intervene», non compare né
calcolata né come testo non calcolato, e `HORARY_LILLY_READINGS` non dice che
è stata lasciata fuori. Non la copre la proibizione: quella guarda solo ciò
che il significatore **più pesante** perfeziona con un terzo, e un quadrato
che il più leggero riceve per strada non è una proibizione per il motore.

**Come si riproduce**: una figura in cui i due significatori perfezionano un
sestile o un trigono; in `quality` ci sono due voci e nessuna nomina
l'aspetto malevolo. La prova «per sestile e trigono guardano le case…» in
`packages/core/test/oraria-lilly.test.ts` lo fissa così.

**Che cosa dicono le fonti** (cercato il 14 novembre 2026 in tutto il libro,
con l'OCR per trovare e l'immagine per leggere; pagine e passi stanno nella
copia locale, `trascrizioni.md`, *«Malevolent Aspect» e ciò che
«intervenes»*). Le tre strade erano: (1) quadrato o opposizione di chiunque,
(2) un aspetto qualunque di Saturno o Marte, (3) non calcolare.

- *L'aspetto malevolo è un tipo di aspetto, non l'aspetto di un malefico.*
  p. 102 li distingue («afflicted by any other malevolent Planet or
  aspect»); p. 106 dice quali sono (il quadrato «imperfect emnity»,
  l'opposizione «perfect hatred», sestile e trigono «Love»); p. 260 lo dice
  cattivo qualunque sia il pianeta («be the Planet good or ill, that
  afflicts, or hath evill aspect»); e quando Lilly vuole anche il malefico
  lo scrive («□ or ☍ of an ill Planet», p. 310; «malevolent aspect of the
  Infortunes» altrove). La strada 2 non ha un luogo che la sostenga. Il
  solo passo in cui un sestile è «malevolent» (p. 530) riguarda le direzioni
  nelle natività, ed è riferito come opinione altrui.
- *Che cosa «intervenes» Lilly lo ripete altrove con gli stessi nomi delle
  definizioni*: per sestile e trigono nel matrimonio «no prohibition,
  frustration or abscission, or Retrogradation of the principall
  Significators intervening» (p. 317); «without the abscission of any other
  Planet before ☌» (p. 445). La parentesi di p. 125 è il corrispettivo, per
  sestile e trigono, del «meet with no prohibition or refrenation» che la
  stessa pagina dà per la congiunzione.
- *La Luna cosignificatrice non è un aspetto che interviene.* Due figure
  giudicate da Lilly, ricalcolate col motore: a pp. 219-221 prima del
  trigono dei significatori la Luna fa quadrato a Saturno e opposizione a
  Venere, e Lilly scrive «no abscission or frustration ere the perfect
  aspect»; a pp. 385-388 prima del sestile la Luna si oppone al Sole,
  signore dell'Ascendente, e Lilly la conta **a favore** («though by ☍, yet
  with Reception, was another small argument»). È la stessa esclusione che
  la proibizione fa già (p. 124).
- *Che cosa non si è trovato*: una figura in cui un terzo pianeta, non la
  Luna, porti un quadrato o un'opposizione a un significatore prima di un
  sestile o di un trigono, con Lilly che lo nomina. Le due figure confermano
  ciò che non conta, non danno un caso in cui la condizione cade. Cercate le
  figure del libro II già lette (`docs/esaminato.md`) più il cap. LIX; le
  altre no.
- *Il capitolo sul pianeta che impedisce* (pp. 184-186) è una dottrina più
  larga, che pesa natura, stato e ricezione di chi si interpone («evill
  Planet, evill disposed, without reception»): non è la parentesi di
  p. 125, e sarebbe una voce sua, con soglie che il testo dà («Peregrine,
  Retrograde, Combust, Cadent», caduta, esilio).

Non cercati: Bonatti e Dariot, da cui il passo di p. 125 probabilmente
discende. Un altro autore non decide che cosa intenda Lilly, e la scuola
entra intera.

**La lettura che ne esce, da confermare col proprietario prima del codice**
(è la strada 1, ristretta dalle due figure): la condizione vale quando
nessun pianeta, tolti i due significatori e la Luna quando è
cosignificatrice, perfeziona un quadrato o un'opposizione con uno dei due
prima che il loro sestile o trigono sia esatto. Va in
`HORARY_LILLY_READINGS` con le pagine 102, 106 e 260 per il nome e 220 e 387
per la Luna. Restano da dire nella lettura, perché il testo non le decide:

- la congiunzione con Saturno o Marte resta fuori: per p. 102 è
  l'afflizione di un pianeta, non di un aspetto;
- conta l'aspetto esatto dentro la finestra, come per la proibizione, non
  quello solo in orbita;
- la proibizione non cambia: segue la definizione di pp. 110-111, dove
  l'esempio è un sestile, anche se a p. 220 Lilly non conta il trigono del
  Sole (la divergenza è già scritta nella prova di quella figura).

Se il proprietario non la conferma, vale la strada 3: la condizione compare
col testo e «non calcolata».

**Superfici**: `format.ts` e `HoraryFindingTable.svelte` stampano le voci di
`quality` che arrivano; il documento di lettura dell'oraria
(`packages/lettura`) e la descrizione di `compute_horary` vanno riletti per
vedere se elencano le condizioni.

**Versione**: seconda cifra. `test/canonico/oraria.json` porta un `quality`,
e una voce in più lo cambia.

**Verifica**: la prova del sestile e del trigono vuole tre voci, la terza
con la pagina 125; le figure di p. 220 e di p. 385 (27 giugno 1646
gregoriano, 07:26, Londra, casa 7) danno la condizione per valida, come le
legge Lilly, e una figura costruita con un quadrato di un terzo la dà per
caduta; la lettura scelta sta in `HORARY_LILLY_READINGS` e in
`docs/decisioni.md`.
