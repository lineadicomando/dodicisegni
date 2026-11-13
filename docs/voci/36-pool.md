# 36. Il pool non sa chi se n'è andato

**Priorità alta.** Tre cose in `apps/web/src/lib/server/pool.ts`:

- **nessuna rotta legge `request.signal`**, e `coda.push` (righe 237–254) è
  incondizionato: una richiesta abbandonata resta in coda e poi calcola per
  nessuno. *Verificato*: dopo sedici richieste di tre anni a
  `/api/transits/passages` con `moon=true&minorAspects=true`, lasciate cadere
  dopo 0,3 s, una richiesta di un mese ha atteso 23,8 s invece di 0,04, e il
  processo è salito a 870 MB;
- **la coda non ha tetto né scadenza**: oltre una certa lunghezza conviene
  rispondere 503 subito;
- **un thread che muore non fa ripartire la coda** (`congeda`, riga 192): se
  muoiono tutti con incarichi in attesa, quelle promesse restano pendenti
  finché non arriva un'altra richiesta pesante. *Dedotto.* `chiudiPool`
  (riga 266) svuota la coda senza rifiutare.

Come: togliere dalla coda l'incarico di una richiesta annullata (quello già
affidato a un thread finisce, vedi sotto), un tetto alla coda, e in `congeda`
smistare ciò che aspetta. Lato client, `apps/web/src/lib/api.ts` non usa mai
`AbortController`: si lega alla voce 45.

**Da non fare**: `worker.terminate()` come scadenza. Terminare un thread a
metà di `calc_ut` ha fatto cadere l'intero processo con `FATAL ERROR:
Error::ThrowAsJavaScriptException napi_throw`, dal modulo `sweph`. Va scritto
in `docs/decisioni.md`, *I thread del pool web*, con la correzione.

**Versione**: niente.

**Verifica**: prove in `pool.test.ts` per la richiesta annullata in coda, per
il tetto e per il thread che muore con la coda piena; poi la prova delle
sedici richieste qui sopra.
