# Storia del lavoro

## Le voci chiuse

I numeri delle voci del `TODO.md` sono stabili, e una voce chiusa non si
riusa. L'ultima versione del file che le contiene tutte, chiuse comprese, è
`cf5219a`, quando si chiamava ancora `ROADMAP.md`. Le voci chiuse dopo, col
commit in cui si leggono ancora per intero (`git show <commit>:TODO.md`):

Dal 13 novembre 2026 ogni voce ha un file in `docs/voci/`: una voce chiusa da
allora si rilegge con `git show <commit>:docs/voci/<file>`, e la colonna
porta il nome del file.

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
| 30 | `66600e5` |
| 35, `35-liste-senza-tetto.md` | `fc3fa36` |

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
| 0.15.0 | le case oltre il circolo polare, l'ora ambigua, Moshier dichiarato fuori copertura, le coordinate mancanti (il fascicolo canonico non le vede) | — |
| 0.16.0 | un corpo o un varga chiesto due volte è una domanda sola; `bodies` e `vargas` più lunghi dei valori ammessi sono rifiutati (il fascicolo canonico non chiede doppioni) | 35 |

## Le sessioni

- **30 ottobre 2026.** Chiuse le voci 5, 25 e 26 (le rifiniture del Jyotisha
  e delle scuole occidentali), dalla 0.6.0 alla 0.12.0, con le scelte in
  `docs/decisioni.md`; rivista la prosa del sito con la skill di scrittura
  italiana anti pattern AI (`750708f`); dasha e i suoi periodi al femminile
  (0.13.0); aperta la voce 30; il `TODO.md` diviso fra sé e `docs/`.
- **30 ottobre 2026, dopo.** Chiusa la voce 30 (0.14.0), e pubblicato tutto:
  push da `v0.5.2` a `v0.14.0` e deploy. Voce 28, i quattro domini: sul
  server mancava il `.env`, e ora `/srv/dodicisegni/.env` porta
  `ORIGIN=https://dodicisegni.it` (git lo ignora); in Cloudflare una
  *Single Redirect* per zona, 301 con destinazione dinamica
  `concat("https://dodicisegni.it", http.request.uri.path)` e la query
  conservata: nella zona `12segni.it` su tutte le richieste, con *Always Use
  HTTPS* spento, nella `dodicisegni.it` su `http.host eq
  "www.dodicisegni.it"`. Verificato con `curl -sI` sui tre nomi secondari,
  in `http` e `https`: un salto solo, percorso e query intatti.
- **13 novembre 2026.** Revisione dell'intero progetto, in tre letture
  (motore, `apps/web`, i pacchetti minori col desktop): aperte le voci 35–49
  del `TODO.md`, l'ultima per ciò che la revisione non ha letto. Quattro
  difetti corretti subito, senza voce: oltre il circolo polare Placidus e
  Koch davano un errore invece del ripiego su Porfirio con l'avvertenza
  (`houses.ts` prendeva per fallimento il flag negativo con cui Swiss
  Ephemeris lo segnala); l'ora ambigua del ritorno all'ora solare dava
  un'occorrenza o l'altra secondo la stagione in cui si calcolava (`time.ts`
  la lasciava sciogliere a Luxon, che parte dall'offset di adesso); fuori dal
  1800–2399 il risultato si dichiarava `swisseph` mentre Swiss Ephemeris era
  passato a Moshier (`computeBodies` ora rende la modalità usata, con
  un'avvertenza); una richiesta con fuso e senza coordinate riceveva il tema
  di 0°N 0°E (`lib/server/place.ts`, `Number(null)`).
- **13 novembre 2026, dopo.** Il `TODO.md` diventa un indice e le voci vanno
  una per file in `docs/voci/`; ricontrollati sulla 0.15.0 tutti i
  riferimenti `file:riga`; ciò che la revisione ha trovato a posto è in
  `docs/esaminato.md`.
- **13 novembre 2026, sera.** Chiusa la voce 35 (0.16.0): `findSignIngresses`,
  `findStations` e `computeJyotisha` tolgono i doppioni, e le due rotte
  rifiutano l'elenco più lungo dei valori ammessi (`lib/server/elenco.ts`).
  Contro il server compilato le due richieste della voce rispondono 400 in
  centesimi di secondo.
