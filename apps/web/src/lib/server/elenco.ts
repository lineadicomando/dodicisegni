import { error } from '@sveltejs/kit';

/**
 * Un elenco separato da virgola, letto dalla query.
 *
 * Il tetto è il numero dei valori che esistono: un elenco più lungo contiene
 * per forza ripetizioni o nomi sconosciuti, e si rifiuta prima di passarlo al
 * motore invece di lasciargli fare mille volte lo stesso conto. Sotto il
 * tetto le ripetizioni passano, e le toglie il motore, che lo fa per ogni
 * superficie.
 *
 * Rende l'elenco vuoto quando il valore è fatto di sole virgole: che cosa
 * voglia dire lo decide la rotta, che ha il messaggio adatto al parametro.
 */
export function readList(raw: string, name: string, tetto: number, code: string): string[] {
  const voci = raw
    .split(',')
    .map((voce) => voce.trim())
    .filter((voce) => voce !== '');

  if (voci.length > tetto) {
    throw error(
      400,
      `"${name}" elenca ${voci.length} valori, ma quelli ammessi sono ${tetto}: togli le ripetizioni.`,
      { code },
    );
  }

  return voci;
}
