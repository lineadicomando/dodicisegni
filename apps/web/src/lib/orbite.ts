/**
 * Le convenzioni delle orbite che l'interfaccia lascia scegliere, con i nomi
 * da mostrare.
 *
 * Una copia, come gli elenchi di `zodiacs.ts` e `house-systems.ts`, e per la
 * stessa ragione: del motore il client importa solo i tipi, e un import di
 * valore trascinerebbe le effemeridi nel bundle. `elenchi.test.ts` la tiene
 * allineata a `NATAL_ORB_CONVENTIONS`.
 *
 * Solo le natali: i transiti hanno una convenzione sola, quella di Hand, e un
 * menù di una voce non è una scelta.
 */

import type { NatalOrbConvention } from '@dodicisegni/core';

export const ORB_CONVENTIONS: readonly { value: NatalOrbConvention; label: string }[] = [
  { value: 'greene', label: 'Orbite di Greene' },
  { value: 'leo', label: 'Orbite di Leo' },
];

/** La predefinita del motore: non si scrive negli indirizzi. */
export const DEFAULT_ORB_CONVENTION: NatalOrbConvention = 'greene';

/** La convenzione scritta in un indirizzo, se esiste. Altrimenti la predefinita. */
export function orbConventionOrDefault(value: string | null): NatalOrbConvention {
  return ORB_CONVENTIONS.some((convention) => convention.value === value)
    ? (value as NatalOrbConvention)
    : DEFAULT_ORB_CONVENTION;
}
