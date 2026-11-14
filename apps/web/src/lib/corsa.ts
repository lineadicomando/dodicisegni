/**
 * Una richiesta alla volta per ogni cosa che si carica.
 *
 * Due richieste ravvicinate non tornano nell'ordine in cui sono partite: chi
 * preme due volte «giorni successivi» può vedersi arrivare la prima risposta
 * dopo la seconda, e restare a guardare i giorni sbagliati sotto la data
 * giusta. `parti` annulla la richiesta precedente e dà il segnale di quella
 * nuova; chi l'ha lanciata, quando la risposta arriva, guarda `aborted` e se
 * è vero non tocca niente.
 *
 * Annullare e non solo ignorare, perché sul server le ricerche lunghe stanno
 * in una coda con un tetto (`lib/server/pool.ts`): una richiesta che nessuno
 * aspetta più ne esce, invece di far aspettare le altre.
 */
export class Corsa {
  #inVolo: AbortController | null = null;

  parti(): AbortSignal {
    this.#inVolo?.abort();
    this.#inVolo = new AbortController();
    return this.#inVolo.signal;
  }
}
