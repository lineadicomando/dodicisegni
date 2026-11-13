import { ChartError } from '@dodicisegni/core';
import { GeoError } from '@dodicisegni/geo';
import { error } from '@sveltejs/kit';
import { PoolError } from './pool.js';

/**
 * Traduce gli errori del dominio in risposte HTTP.
 *
 * I codici dei pacchetti `core` e `geo` sono progettati proprio per questo:
 * il chiamante riceve un identificatore stabile su cui ramificare, non una
 * stringa da confrontare.
 */
export function toHttpError(cause: unknown): never {
  if (cause instanceof ChartError) {
    // Sono tutti errori d'input tranne il fallimento delle effemeridi,
    // che è una condizione del server.
    const status = cause.code === 'ERRORE_EFFEMERIDI' ? 500 : 400;
    throw error(status, cause.message, { code: cause.code });
  }

  if (cause instanceof GeoError) {
    if (cause.code === 'QUERY_VUOTA') throw error(400, cause.message, { code: cause.code });
    // Un database assente o rotto è un problema di installazione, non della
    // richiesta. Il messaggio di `geo` dice dove lo cercava, e serve a chi
    // amministra, non a chi chiede: va nel registro, e fuori un testo fisso.
    console.error(cause);
    throw error(503, 'La ricerca delle località non è disponibile su questo server.', {
      code: cause.code,
    });
  }

  if (cause instanceof PoolError) {
    // Né l'una né l'altra è colpa della richiesta: la coda piena è una
    // condizione del server, che passa; l'annullata non ha più nessuno che la
    // legga, e il 499 è il numero con cui la si riconosce nei registri.
    throw error(cause.code === 'SERVER_OCCUPATO' ? 503 : 499, cause.message, { code: cause.code });
  }

  // Un errore che nessuno ha previsto può dire qualunque cosa: il percorso di
  // un file, una riga di SQL, il modulo che un thread non ha caricato. Il
  // messaggio vero va nel registro del server; a chi chiede, un testo fisso.
  console.error(cause);
  throw error(500, 'Errore interno del server.', { code: 'ERRORE_INTERNO' });
}
