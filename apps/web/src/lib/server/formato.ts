import { error } from '@sveltejs/kit';

/**
 * In che forma va restituita una risposta di calcolo: il JSON, oppure con
 * `format=compact` la tabella di testo che il server MCP dà ai suoi agenti.
 *
 * Un valore non riconosciuto viene rifiutato invece che ricondotto al
 * predefinito, come nel disegno: chi scrive `format=testo` deve sapere di aver
 * sbagliato, non ricevere del JSON e credere che il parametro non esista.
 *
 * Sta qui e non nelle rotte perché lo leggono tutte e dieci quelle che
 * calcolano, e una copia per rotta aveva già prodotto due regole: due
 * rifiutavano `format=xml`, due lo servivano in JSON.
 */
export function readFormat(parameters: URLSearchParams): 'json' | 'compact' {
  const formato = parameters.get('format') ?? 'json';
  if (formato !== 'json' && formato !== 'compact') {
    throw error(
      400,
      `Formato "${formato}" non riconosciuto: attesi "json" oppure "compact".`,
      { code: 'FORMATO_NON_VALIDO' },
    );
  }
  return formato;
}

/**
 * La risposta di testo: le righe di provenienza che ci sono (il luogo, che
 * nel JSON sta in un campo a parte) davanti alla tabella del motore.
 */
export function testo(tabella: string, ...provenienza: (string | null | undefined | false)[]): Response {
  const intestazione = provenienza.filter(Boolean).map((riga) => `${riga as string}\n`).join('');
  return new Response(intestazione + tabella, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
