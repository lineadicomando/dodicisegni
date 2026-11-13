# 40. Gli errori delle rotte

**Priorità media**, verificato.

- **Un fuso non valido dà 500** quando serve a calcolare «adesso» prima che
  il motore lo veda: `transits/passages/+server.ts:36`,
  `transits/active/+server.ts:41`, `sky/calendar/+server.ts:32`, e
  `lib/server/place.ts` per l'elezione. `/api/sky/calendar?timezone=Foo/Bar`
  → `500 ERRORE_INTERNO: Invalid time zone specified: Foo/Bar`; con `from`
  esplicito, e sempre su `/api/chart`, è `400 FUSO_ORARIO_NON_VALIDO`;
- **`apps/web/src/lib/server/errors.ts:28` inoltra il `message` di qualunque
  errore imprevisto.** Per un errore di SQLite o del caricamento di un modulo
  nel thread porterebbe fuori percorsi del server (*dedotto*): al client va
  un testo fisso, il messaggio vero nel log. Lo stesso per `GeoError
  DATABASE_ASSENTE`, che mette nel 503 il percorso del database, e per
  l'avvertenza di Chirone fuori dal 1800–2399, che riporta il messaggio di
  Swiss Ephemeris col percorso della cartella delle effemeridi;
- **`/api/election` conta l'arco a estremi esclusi** (`giorni >
  MAX_ELECTION_DAYS`, nella rotta) e il motore a estremi compresi: `from=2026-01-10&to=2026-02-10`
  passa il controllo della rotta e lo rifiuta il motore, con
  `INTERVALLO_NON_VALIDO` invece di `INTERVALLO_TROPPO_LUNGO`. Il tool MCP è
  stato allineato con la voce 44; la rotta cambia un codice, e va qui;
- **`/api/jyotish?date=9999-03-12`** dà `500 ERRORE_EFFEMERIDI`, mentre
  `/api/chart` con la stessa data dà 200 con le avvertenze;
- **`time=24:00`** è accettato e diventa la mezzanotte del giorno dopo, senza
  avviso (`TIME_PATTERN`, `packages/core/src/time.ts:11`).

**Versione**: **seconda cifra** per i codici che cambiano.

**Verifica**: una prova per riga, e le richieste scritte qui sopra.
