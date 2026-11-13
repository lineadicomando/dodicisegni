# 46. La ricerca delle località

**Priorità media.**

- **Ogni battuta scorre la tabella** (*verificato*):
  `packages/geo/src/search.ts:59`, `EXPLAIN QUERY PLAN` dice `SCAN n` più due
  B-tree temporanei su 1.217.417 righe, 54–60 ms a query e 95–120 per un
  prefisso di una lettera. Il `LIKE` non usa `idx_location_names_search`,
  che ha la collazione binaria. `/api/locations` non passa dal pool, quindi
  quel tempo è dell'event loop del server. Da provare: un intervallo sul
  prefisso (`>= 'rom' AND < 'ron'`) sulla colonna già normalizzata, o
  l'indice con `COLLATE NOCASE`; cambia `schema.sql`, quindi chiede una
  reimportazione, sul server compresa;
- **errori di SQLite grezzi invece di `GeoError`** (*verificato*): una
  query da 60.000 caratteri dà `LIKE or GLOB pattern too complex` (lo schema
  di `search_location` ha `min(1)` e nessun `max`); un file che non è un
  database in `GEONAMES_DB_PATH` dà `file is not a database`, perché
  `DatabaseSync` apre in modo pigro e il ramo `DATABASE_CORROTTO` di
  `database.ts:52` non si raggiunge, e la connessione rotta resta in cache;
- **i `.txt` di GeoNames in cache non hanno controllo** (*dedotto*):
  `usableFromCache` in `scripts/import-geonames.mjs` copre gli zip dal commit
  `da195dc`, non `countryInfo.txt`, che con un 200 non pertinente darebbe un
  database «riuscito» coi paesi nominati per sigla.

**Versione**: niente, se i risultati e il loro ordine non cambiano; va
provato.

**Verifica**: `EXPLAIN QUERY PLAN` con `SEARCH` al posto di `SCAN`, gli
stessi risultati di prima su un elenco di query fisse, e una prova per
ognuno dei due errori.
