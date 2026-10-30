import { readFileSync } from 'node:fs';

/**
 * La versione di questa copia, per `--version` della riga di comando.
 *
 * Letta dal `package.json`, come nel server MCP e nella web app, e per la
 * stessa ragione: un numero ricopiato resta indietro. Il file sta accanto a
 * `src` e a `dist`, e lo stesso indirizzo relativo vale da tutti e due. Non
 * è esportato dall'indice del pacchetto: serve alla CLI, non al calcolo.
 */
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export const VERSION: string = manifest.version;
