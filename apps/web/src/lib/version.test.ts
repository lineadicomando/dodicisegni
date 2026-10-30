/**
 * Un numero solo per tutto il repository.
 *
 * Ogni `package.json` dei workspace porta la stessa versione della radice, e
 * così le voci del lockfile: è la condizione perché il footer, il server MCP
 * e `--version` della CLI, che leggono ciascuno il proprio manifesto, dicano
 * la stessa cosa. Un rilascio è il tag `v` seguito da questo numero.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ALPHA, VERSION } from './version';

const RADICE = new URL('../../../../', import.meta.url);

function versione(percorso: string): string {
  return (JSON.parse(readFileSync(new URL(percorso, RADICE), 'utf8')) as { version: string }).version;
}

const WORKSPACE = ['apps', 'packages'].flatMap((cartella) =>
  readdirSync(new URL(`${cartella}/`, RADICE), { withFileTypes: true })
    .filter((voce) => voce.isDirectory())
    .map((voce) => `${cartella}/${voce.name}`),
);

describe('la versione', () => {
  const radice = versione('package.json');

  it('è quella della radice, nella web app', () => {
    expect(VERSION).toBe(radice);
  });

  it('è la stessa in ogni workspace', () => {
    expect(WORKSPACE.length).toBeGreaterThan(5);
    for (const workspace of WORKSPACE) {
      expect(versione(`${workspace}/package.json`), workspace).toBe(radice);
    }
  });

  it('è la stessa nel lockfile', () => {
    const lock = JSON.parse(readFileSync(new URL('package-lock.json', RADICE), 'utf8')) as {
      version: string;
      packages: Record<string, { version?: string }>;
    };
    expect(lock.version).toBe(radice);
    expect(lock.packages['']?.version).toBe(radice);
    for (const workspace of WORKSPACE) {
      expect(lock.packages[workspace]?.version, workspace).toBe(radice);
    }
  });

  it("dice alpha finché comincia per zero", () => {
    expect(ALPHA).toBe(radice.startsWith('0.'));
  });
});
