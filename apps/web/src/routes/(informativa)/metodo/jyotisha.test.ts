/**
 * Le tavole delle pagine indiane del metodo contro il motore.
 *
 * Stesso principio di `orbite.test.ts`: la prosa resta libera, le tavole no.
 * Si guardano nomi, numeri e ordini, cella per cella; le regole dei varga,
 * che sono frasi, restano fuori apposta.
 */

import { readFileSync } from 'node:fs';
import {
  GRAHA_NAMES,
  housesSeenBy,
  NAKSHATRAS,
  VARGAS,
  VIMSHOTTARI_ORDER,
  VIMSHOTTARI_YEARS,
  type BodyId,
} from '@dodicisegni/core';
import { describe, expect, it } from 'vitest';

/** Le righe del corpo della prima tavola della pagina, cella per cella. */
function tavola(pagina: string): string[][] {
  const sorgente = readFileSync(new URL(`./${pagina}/+page.svelte`, import.meta.url), 'utf8');
  const corpo = /<tbody>([\s\S]*?)<\/tbody>/.exec(sorgente)?.[1];
  if (!corpo) throw new Error(`/metodo/${pagina} non ha più una tavola`);
  return [...corpo.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) =>
    [...r[1]!.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((c) => c[1]!.trim()),
  );
}

const nome = (id: BodyId): string => GRAHA_NAMES[id]!;

const SEGNI = [
  'Ariete', 'Toro', 'Gemelli', 'Cancro', 'Leone', 'Vergine',
  'Bilancia', 'Scorpione', 'Sagittario', 'Capricorno', 'Acquario', 'Pesci',
];

describe('le tavole delle pagine indiane combaciano con il motore', () => {
  it('i nakshatra: nome, inizio e signore', () => {
    const righe = tavola('nakshatra');
    expect(righe).toHaveLength(NAKSHATRAS.length);
    righe.forEach(([numero, nakshatra, inizio, signore], i) => {
      expect(numero).toBe(String(i + 1));
      expect(nakshatra, `nakshatra ${i + 1}`).toBe(NAKSHATRAS[i]!.name);
      const primi = i * 800;
      const atteso = `${Math.floor((primi % 1800) / 60)}°${String(primi % 60).padStart(2, '0')}' ${SEGNI[Math.floor(primi / 1800)]}`;
      expect(inizio, `inizio di ${nakshatra}`).toBe(atteso);
      expect(signore, `signore di ${nakshatra}`).toBe(nome(VIMSHOTTARI_ORDER[i % 9]!));
    });
  });

  it('le dasha: ordine, anni e nakshatra retti', () => {
    const righe = tavola('dasha');
    expect(righe.map((r) => r[0])).toEqual(VIMSHOTTARI_ORDER.map(nome));
    righe.forEach(([graha, anni, retti], i) => {
      const id = VIMSHOTTARI_ORDER[i]!;
      expect(Number(anni), `anni di ${graha}`).toBe(VIMSHOTTARI_YEARS[id]);
      expect(retti, `nakshatra di ${graha}`).toBe(
        [i, i + 9, i + 18].map((n) => NAKSHATRAS[n]!.name).join(', '),
      );
    });
  });

  it('i varga: sigla, nome e numero delle parti', () => {
    const righe = tavola('varga');
    expect(righe.map(([sigla, nome, parti]) => [sigla, nome, Number(parti)])).toEqual(
      VARGAS.map((v) => [`D-${v.id.slice(1)}`, v.name, v.divisions]),
    );
  });

  it('le drishti dei sette, nella forma classica', () => {
    const righe = tavola('drishti');
    expect(righe).toHaveLength(7);
    for (const [graha, case_] of righe) {
      const id = (Object.keys(GRAHA_NAMES) as BodyId[]).find((k) => GRAHA_NAMES[k] === graha)!;
      expect(case_, `drishti di ${graha}`).toBe(housesSeenBy(id, 'nessuna').join(', '));
    }
    // La prosa dice che nella forma classica i nodi non guardano e in quella
    // gioviana guardano come Giove: anche questo è un dato.
    expect(housesSeenBy('nodo-nord', 'nessuna')).toEqual([]);
    expect(housesSeenBy('nodo-nord', 'gioviana')).toEqual(housesSeenBy('giove', 'nessuna'));
  });
});
