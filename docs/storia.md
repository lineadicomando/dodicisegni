# Storia del lavoro

## Le voci chiuse

I numeri delle voci del `TODO.md` sono stabili, e una voce chiusa non si
riusa. L'ultima versione del file che le contiene tutte, chiuse comprese, è
`cf5219a`, quando si chiamava ancora `ROADMAP.md`. Le voci chiuse dopo, col
commit in cui si leggono ancora per intero (`git show <commit>:TODO.md`):

| Voci | Commit |
|---|---|
| 20 | `3314553` |
| 21 e 22 | `819ce59` |
| 23 | `db332a6` |
| 11 | `e194d45` |
| 13 | `e532f2f` |
| 7 | `955977b` |
| 9 | `8a04cfb` |
| 18 | `2b8937d` |
| 6 | `8aa31a9` |
| 8 | `c4c4820` |
| 24 | `bd489c8` |
| 19 | `91ca295` |
| 27 | `f6026fa` |
| 17 | `cd6d0f2` |
| 29 | `62ae8f6` |
| 25 | `63b0755` |
| 5 | `a2e2207` |
| 26 | `6a4898d` |

## Le versioni

Le regole (un numero solo, le tre domande che dicono quale cifra si muove,
il tag) stanno in `CLAUDE.md`, *La versione*. Se una risposta che c'era è
cambiata lo dice il fascicolo canonico: un file di `test/canonico/` che
cambia muove la seconda cifra.

| Versione | Che cosa | Voce |
|---|---|---|
| 0.1.0 | il numero unico (`f6026fa`) | 27 |
| 0.1.1 | la pagina web dell'oraria | 17 |
| 0.2.0 | le condizioni di qualità di Lilly, p. 125 | 17 |
| 0.3.0 | la Parte di Fortuna nel conto di Lilly | 17 |
| 0.4.0 | la Luna cosignificatrice che non proibisce | 17 |
| 0.5.0 | chi si avvicina negli incontri del corso | 17 |
| 0.5.1 | la scuola delle dignità sul cielo (`/api/sky`, `compute_sky`, la pagina Cielo) | 17 |
| 0.5.2 | il corso come superficie a sé (`find_sign_course`, `GET /api/sky/course`) | 17 |
| 0.6.0 | i nomi dei sessanta shashtiamsa del D-60 | 5 |
| 0.7.0 | l'avvertenza sull'ora anche nel D-24 e nel D-27 | 5 |
| 0.8.0 | gli arudha dei graha in ogni varga | 25 |
| 0.8.1 | le quattro convenzioni moderne della hora | 5 |
| 0.9.0 | la combustione del Jyotisha nei gradi di tempo | 25 |
| 0.10.0 | la riga delle ricezioni di Valente: lui non ne definisce una | 26 |
| 0.11.0 | le ricezioni di Bonatti, dall'applicazione entro sei gradi | 26 |
| 0.12.0 | i termini di Valente dall'ed. Pingree (cambia la Bilancia) | 26 |
| 0.13.0 | dasha, mahadasha e antardasha al femminile (cambia un'avvertenza) | — |
| 0.14.0 | la terza modalità è `mutevole`, non `mobile` (cambia il campo della distribuzione e quattro regole dei varga) | 30 |

## Le sessioni

- **30 ottobre 2026.** Chiuse le voci 5, 25 e 26 (le rifiniture del Jyotisha
  e delle scuole occidentali), dalla 0.6.0 alla 0.12.0, con le scelte in
  `docs/decisioni.md`; rivista la prosa del sito con la skill di scrittura
  italiana anti pattern AI (`750708f`); dasha e i suoi periodi al femminile
  (0.13.0); aperta la voce 30; il `TODO.md` diviso fra sé e `docs/`.
