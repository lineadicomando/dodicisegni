/**
 * Le carte divisionali che l'interfaccia lascia scegliere, con i nomi da
 * mostrare.
 *
 * Stavano dentro `JyotishaSettings.svelte`. Sono uscite in un modulo perché
 * `elenchi.test.ts` le possa confrontare con `VARGAS` del motore: l'elenco è
 * una copia, come quelli di `zodiacs.ts` e `house-systems.ts`, e per la stessa
 * ragione. Del motore si importano i soli **tipi**: un import di valore ne
 * trascinerebbe l'intero grafo nel bundle del browser.
 *
 * Manca la D-1, apposta: la carta rashi non è un'opzione, è il tema, e sta
 * nella colonna del disegno. Offrirla anche qui ne farebbe comparire due
 * uguali.
 */

import type { VargaId, VargaScheme } from '@dodicisegni/core';

export const VARGHE: readonly { value: VargaId; label: string }[] = [
  { value: 'd2', label: 'D2 Hora' },
  { value: 'd3', label: 'D3 Drekkana' },
  { value: 'd4', label: 'D4 Chaturthamsa' },
  { value: 'd7', label: 'D7 Saptamsa' },
  { value: 'd9', label: 'D9 Navamsa' },
  { value: 'd10', label: 'D10 Dasamsa' },
  { value: 'd12', label: 'D12 Dwadasamsa' },
  { value: 'd16', label: 'D16 Shodasamsa' },
  { value: 'd20', label: 'D20 Vimsamsa' },
  { value: 'd24', label: 'D24 Siddhamsa' },
  { value: 'd27', label: 'D27 Nakshatramsa' },
  { value: 'd30', label: 'D30 Trimsamsa' },
  { value: 'd40', label: 'D40 Khavedamsa' },
  { value: 'd45', label: 'D45 Akshavedamsa' },
  { value: 'd60', label: 'D60 Shashtiamsa' },
];

/**
 * I quattro gruppi di varga che Parashara nomina, BPHS 7.17-20 (pp. 95-96
 * di Santhanam): una copia di `VARGA_SCHEMES` del motore, come l'elenco qui
 * sopra, e `elenchi.test.ts` la confronta con quella.
 *
 * Senza la D-1 per la stessa ragione dell'elenco: la rashi c'è sempre.
 */
export const SCHEMI_VARGA: readonly { value: VargaScheme; label: string; vargas: readonly VargaId[] }[] = [
  { value: 'shadvarga', label: 'Shadvarga', vargas: ['d2', 'd3', 'd9', 'd12', 'd30'] },
  { value: 'saptavarga', label: 'Saptavarga', vargas: ['d2', 'd3', 'd7', 'd9', 'd12', 'd30'] },
  {
    value: 'dashavarga',
    label: 'Dashavarga',
    vargas: ['d2', 'd3', 'd7', 'd9', 'd10', 'd12', 'd16', 'd30', 'd60'],
  },
  {
    value: 'shodashavarga',
    label: 'Shodashavarga',
    vargas: ['d2', 'd3', 'd4', 'd7', 'd9', 'd10', 'd12', 'd16', 'd20', 'd24', 'd27', 'd30', 'd40', 'd45', 'd60'],
  },
];
