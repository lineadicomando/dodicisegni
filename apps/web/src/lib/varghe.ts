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

import type { VargaId } from '@dodicisegni/core';

export const VARGHE: readonly { value: VargaId; label: string }[] = [
  { value: 'd2', label: 'D2 Hora' },
  { value: 'd3', label: 'D3 Drekkana' },
  { value: 'd4', label: 'D4 Chaturthamsa' },
  { value: 'd7', label: 'D7 Saptamsa' },
  { value: 'd9', label: 'D9 Navamsa' },
  { value: 'd10', label: 'D10 Dasamsa' },
  { value: 'd12', label: 'D12 Dwadasamsa' },
  { value: 'd27', label: 'D27 Nakshatramsa' },
  { value: 'd30', label: 'D30 Trimsamsa' },
];
