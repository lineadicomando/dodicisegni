/**
 * Le tavole delle orbite di /metodo contro `packages/core/src/orbite.ts`.
 *
 * La pagina ricopia a mano valori del motore, e la prosa intorno non si può
 * generare: dice perché le orbite dei transiti sono strette, che una tabella
 * generata non saprebbe dire. Questo test lascia la prosa libera e guarda
 * solo i numeri delle due tavole, cella per cella. Cambiando un'orbita in
 * `orbite.ts` cade, nominando l'aspetto o il pianeta rimasto indietro.
 *
 * Va tenuto così stretto: se comincia a cercare frasi diventa un
 * impedimento a riscrivere la pagina, che è il contrario di quello che serve.
 */

import { readFileSync } from 'node:fs';
import {
  ASPECTS,
  NATAL_ORB_CONVENTIONS,
  TRANSIT_ORB_CONVENTIONS,
  type AspectId,
  type OrbConventionDefinition,
} from '@dodicisegni/core';
import { describe, expect, it } from 'vitest';

const PAGINA = readFileSync(new URL('./+page.svelte', import.meta.url), 'utf8');

/** Le righe del corpo della prima tavola la cui intestazione contiene `colonna`. */
function righe(colonna: string): string[][] {
  const tavola = [...PAGINA.matchAll(/<table>([\s\S]*?)<\/table>/g)]
    .map((m) => m[1]!)
    .find((t) => t.includes(`<th>${colonna}</th>`));
  if (!tavola) throw new Error(`/metodo non ha più una tavola con la colonna «${colonna}»`);
  const corpo = tavola.slice(tavola.indexOf('<tbody>'));
  return [...corpo.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) =>
    [...r[1]!.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((c) => c[1]!.trim()),
  );
}

/** «7°30'» → 7,5; «—» → 0, cioè aspetto che la scuola non tratta. */
function gradi(cella: string): number {
  if (cella === '—') return 0;
  const m = /^(\d+)°(?:(\d+)')?$/.exec(cella);
  if (!m) throw new Error(`cella non leggibile come gradi: «${cella}»`);
  return Number(m[1]) + Number(m[2] ?? 0) / 60;
}

function convenzione<T extends { id: string }>(elenco: readonly T[], id: string): T {
  const trovata = elenco.find((c) => c.id === id);
  if (!trovata) throw new Error(`convenzione ${id} assente dal motore`);
  return trovata;
}

describe('le orbite di /metodo combaciano con orbite.ts', () => {
  it('la tavola per aspetto: Greene, Leo e Hand fra due pianeti', () => {
    const greene = convenzione(NATAL_ORB_CONVENTIONS, 'greene');
    const leo = convenzione(NATAL_ORB_CONVENTIONS, 'leo');
    const hand = convenzione(TRANSIT_ORB_CONVENTIONS, 'hand');
    // Due pianeti senza eccezioni: né luminari (Leo li allarga) né punti
    // (Greene li dimezza). La prosa sotto la tavola dice le eccezioni.
    const orbita = (c: OrbConventionDefinition, aspetto: AspectId): number =>
      c.aspects.includes(aspetto) ? c.orbOf(aspetto, 'marte', 'venere') : 0;

    const tavola = righe('Greene');
    expect(tavola.map((r) => r[0]!.toLowerCase())).toEqual(ASPECTS.map((a) => a.id));
    for (const [nome, angolo, g, l, h] of tavola) {
      const aspetto = ASPECTS.find((a) => a.id === nome!.toLowerCase())!;
      expect(gradi(angolo!), `angolo di ${nome}`).toBe(aspetto.angle);
      expect(gradi(g!), `Greene, ${nome}`).toBe(orbita(greene, aspetto.id));
      expect(gradi(l!), `Leo, ${nome}`).toBe(orbita(leo, aspetto.id));
      expect(gradi(h!), `Hand, ${nome}`).toBe(orbita(hand, aspetto.id));
    }
  });

  it('la tavola per pianeta: le moieties di Lilly', () => {
    const lilly = convenzione(NATAL_ORB_CONVENTIONS, 'lilly');
    const tavola = righe('Orbita di Lilly');
    expect(tavola).toHaveLength(7);
    // L'orbita di un pianeta con sé stesso è la somma di due metà uguali,
    // cioè l'orbita intera: è il modo di leggerla da `orbOf`.
    for (const [nome, cella] of tavola) {
      const id = nome!.toLowerCase();
      expect(gradi(cella!), `Lilly, ${nome}`).toBe(lilly.orbOf('congiunzione', id, id));
    }
  });
});
