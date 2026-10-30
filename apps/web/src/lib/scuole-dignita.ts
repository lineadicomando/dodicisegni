/**
 * Le scuole delle dignità che l'interfaccia lascia scegliere, con i nomi da
 * mostrare.
 *
 * Una copia, come `orbite.ts`, e per la stessa ragione: del motore il client
 * importa solo i tipi. `elenchi.test.ts` la tiene allineata a
 * `DIGNITY_SCHOOL_NAMES`.
 *
 * La voce vuota è «nessuna scuola», cioè le sole dignità comuni: non è un
 * default fra le scuole, è l'assenza di una scelta, e nell'indirizzo non si
 * scrive.
 */

import type { DignitySchool } from '@dodicisegni/core';

export type DignitySchoolChoice = DignitySchool | '';

export const DIGNITY_SCHOOLS: readonly { value: DignitySchool; label: string }[] = [
  { value: 'lilly', label: 'Dignità di Lilly' },
  { value: 'tolomeo', label: 'Dignità di Tolomeo' },
  { value: 'bonatti', label: 'Dignità di Bonatti' },
  { value: 'valente', label: 'Dignità di Valente' },
];

/** La scuola scritta in un indirizzo, se esiste. Altrimenti nessuna. */
export function dignitySchoolOrNone(value: string | null): DignitySchoolChoice {
  return DIGNITY_SCHOOLS.some((school) => school.value === value) ? (value as DignitySchool) : '';
}
