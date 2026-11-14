import type { Handle } from '@sveltejs/kit/hooks';
import { VERSION } from '#lib/version.js';

/**
 * Il nome dell'intestazione con cui ogni risposta di `/api` dice quale
 * versione del motore l'ha prodotta.
 */
export const VERSION_HEADER = 'X-Dodicisegni-Version';

/**
 * Mette la versione su tutte le risposte di `/api`: il JSON, il testo
 * compatto, le immagini delle rotte di disegno, e gli errori.
 *
 * Serve a chi conserva un risultato e vuole sapere, dalla risposta stessa, se
 * è ancora quello che il motore darebbe: finché la prima cifra è zero la
 * seconda si muove quando una risposta cambia (`CLAUDE.md`, *La versione*).
 *
 * È un'intestazione e non un campo del JSON apposta: un campo cambierebbe ogni
 * risposta, e nel testo e nelle immagini non avrebbe posto. Il numero viene da
 * `lib/version.ts`, che lo legge dal manifesto: non si ricopia.
 *
 * Le pagine non la portano. La versione di ciò che si guarda sta nel footer;
 * questa dice la versione di un calcolo.
 */
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  if (event.url.pathname.startsWith('/api/')) response.headers.set(VERSION_HEADER, VERSION);
  for (const [nome, valore] of Object.entries(SICUREZZA)) response.headers.set(nome, valore);
  return response;
};

/**
 * Le due intestazioni di sicurezza che non costano niente e non possono
 * rompere niente, su ogni risposta che passa di qui (pagine e `/api`; i file
 * statici li serve l'adattatore e non le portano).
 *
 * - `Referrer-Policy: same-origin`: gli indirizzi di questa applicazione
 *   portano data, ora e luogo di nascita, e a un sito esterno non deve
 *   arrivare nemmeno l'origine da cui si viene. I browser di oggi tagliano
 *   già il percorso verso gli altri siti; qui lo si dice, invece di contarci.
 * - `X-Content-Type-Options: nosniff`: una risposta è del tipo che dichiara.
 *
 * Stanno qui e non nel proxy perché l'applicazione gira anche dove un proxy
 * non c'è (Docker altrove, Electron). Una Content-Security-Policy non c'è:
 * va provata pagina per pagina, e nessuna iniezione nota la rende urgente.
 */
export const SICUREZZA: Readonly<Record<string, string>> = {
  'Referrer-Policy': 'same-origin',
  'X-Content-Type-Options': 'nosniff',
};
