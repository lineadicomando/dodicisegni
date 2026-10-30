import { version } from '../../package.json';

/**
 * Quale copia di dodicisegni sta parlando con chi legge.
 *
 * **Il numero si legge dal `package.json`, non si scrive qui.** Una versione
 * è già un dato che npm tiene, e una costante ricopiata accanto ne sarebbe una
 * seconda copia, libera di restare indietro: il server MCP ha dichiarato
 * `0.0.0` per tutta la storia del progetto fino alla 0.1.0. L'import si
 * risolve alla build, e al browser arriva la stringa, non il file.
 *
 * **Il tag ripete il numero, non lo definisce.** Un rilascio è `v` seguito da
 * questo, `v0.1.0`; ma una copia può arrivare senza tag (un archivio,
 * un'immagine, un fork), e una versione presa da `git describe` lì non
 * direbbe niente. `version.test.ts` tiene ogni pacchetto allo stesso numero.
 *
 * **`ALPHA` si ricava, non si dichiara.** Lo zero davanti dice già, per il
 * versionamento semantico, che una versione non promette niente alla
 * successiva: un secondo flag potrebbe solo contraddirlo. Alla 1.0.0 smette di
 * essere vero senza che nessuno debba ricordarsene.
 */
export const VERSION: string = version;

/** Se questa copia è prima della 1.0.0, dove una risposta può cambiare da una versione all'altra. */
export const ALPHA = /^0\./.test(VERSION);
