import { readFileSync } from 'node:fs';

/**
 * La versione che il server dichiara nella stretta di mano.
 *
 * **Letta dal `package.json`, non ricopiata.** La costante che stava qui
 * diceva `0.0.0`, e l'ha detto per tutta la storia del progetto: una versione
 * scritta due volte è giusta in uno dei due posti. Il file sta accanto a
 * `src` come accanto a `dist`, e lo stesso indirizzo relativo vale sia dal
 * TypeScript sia dalla build.
 *
 * Tutto il repository si muove con un numero solo, che
 * `apps/web/src/lib/version.test.ts` verifica in ogni pacchetto; un rilascio
 * è il tag `v` seguito da quel numero.
 */
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export const SERVER_VERSION: string = manifest.version;
