# Storia del lavoro

Due tavole da consultare, non da leggere: in quale commit si rilegge una voce
chiusa, e che cosa ha portato ogni versione. Il racconto delle sessioni (che
cosa si è scelto strada facendo, che cosa si è misurato) sta in
`docs/sessioni.md`, e si cerca per parola o per numero di voce.

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
| 38, `38-reggitore-del-giorno.md` | `1fc934e` |
| 39, `39-mcp-elenchi-vuoti.md` | `c41ffbd` |
| 37, `37-ingressi-stazione.md` | `d6a0be7` |
| 36, `36-pool.md` | `8c80e20` |
| 31, `31-versione-nelle-risposte.md` | `bd6f720` |
| 32, `32-testo-compatto.md` | `b7fda5a` |
| 41, `41-oraria-significatore.md` | `118b487` |
| 44, `44-mcp-descrizioni.md` | `0460867` |
| 40, `40-errori-rotte.md` | `2c3b3e4` |
| 42, `42-tempo-medio-locale.md` | `7ec1eb5` |
| 43, `43-mcp-risposte-enormi.md` | `c2a98b2` |
| 47, `47-input-motore.md` | `7a2ac59` |
| 48, `48-contorno.md` | `2aaff7b` |
| 28, `28-seo.md` | `acc68d7` |
| 34, `34-doppia-licenza.md` | `acc68d7` |
| 50, `50-tempo-del-luogo.md` | `73fccb5` |
| 51, `51-oraria-aspetto-malevolo.md` | `a5e8139` |
| 45, `45-interfaccia-corse.md` | `f43c550` |
| 46, `46-ricerca-localita.md` | `cf47502` |

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
| 0.17.0 | il reggitore del giorno planetario dal tempo medio locale del luogo, non dal fuso della richiesta (il fascicolo canonico chiede luogo e fuso concordi) | 38 |
| 0.18.0 | gli elenchi vuoti nei tool MCP, un bersaglio natale sconosciuto e il vuoto di corso senza corpi sono errori; il prompt dell'oraria tiene l'ora senza la data (il fascicolo canonico non li chiede) | 39 |
| 0.19.0 | gli ingressi, i passaggi e gli incontri che si fanno e si disfano dentro un passo accanto a un'inversione del moto; la finestra con orbite sostituite oltre i quattro gradi (il fascicolo canonico non ne contiene) | 37 |
| 0.19.1 | l'intestazione `X-Dodicisegni-Version` su tutte le risposte di `/api` | 31 |
| 0.20.0 | `format=compact` sulle sei rotte di calcolo che non l'avevano; `/api/horary` e `/api/sky/course` rifiutano un formato sconosciuto invece di servire il JSON | 32 |
| 0.21.0 | l'oraria con un significatore non calcolabile dà `DATA_NON_VALIDA` invece di un `TypeError` | 41 |
| 0.22.0 | `draw_chart_wheel` accetta le larghezze da 200 a 4000 come il quadro e le rotte (prima 400–2000); quattro descrizioni MCP legate al codice | 44 |
| 0.23.0 | un fuso sconosciuto è sempre 400; i messaggi non portano percorsi del server; `/api/jyotish` fuori copertura dà `DATA_NON_VALIDA`; l'arco dell'elezione a estremi compresi; le 24:00 con l'avviso | 40 |
| 0.24.0 | un'ora data prima dell'ora unica porta l'avvertenza che è stata letta come tempo medio della città del fuso; `/metodo#tempo-medio` | 42 |
| 0.25.0 | oltre mille righe `find_transit_passages`, `find_active_transits`, `find_sky_events` e il testo compatto delle tre rotte gemelle rispondono `RISPOSTA_TROPPO_LUNGA`; il JSON delle rotte resta senza tetto | 43 |
| 0.26.0 | il corso nel segno cerca gli ingressi con le effemeridi chieste e non con quelle predefinite (un minuto di differenza nel fascicolo, `oraria.json`); orbite non finite o negative, ordini di dasha fuori da 1–3 e giorni giuliani non finiti si rifiutano; `normalize360` non rende più 360; la riga di comando ha il tetto di tre anni | 47 |
| 0.26.1 | l'ora di nascita si può leggere sul tempo medio o sul tempo vero del luogo: `clock` su rotte e MCP, `--orologio` sulla riga di comando, un interruttore nel modulo | 50 |
| 0.27.0 | l'oraria di Lilly riporta per sestile e trigono la terza condizione di p. 125: nessun quadrato o opposizione di un altro pianeta a un significatore prima della perfezione, la Luna cosignificatrice esclusa (una lettura in più in `oraria.json`) | 51 |
