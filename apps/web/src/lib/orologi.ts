/**
 * Gli orologi su cui un'ora di nascita può essere stata letta, con i nomi da
 * mostrare.
 *
 * Il primo è il caso ordinario e non si scrive negli indirizzi. Gli altri due
 * servono alle nascite di prima dell'ora unica, quando ogni città teneva
 * l'ora del proprio meridiano: vedi `/metodo#tempo-medio`.
 *
 * Copia dell'elenco del motore, come `zodiacs.ts`, e per la stessa ragione:
 * `elenchi.test.ts` cade se resta indietro.
 */

import type { LocalClock } from '@dodicisegni/core';

export const OROLOGI: readonly { value: LocalClock; label: string }[] = [
  { value: 'fuso', label: 'Ora civile, quella del fuso' },
  { value: 'tempo-medio-locale', label: 'Tempo medio locale' },
  { value: 'tempo-vero-locale', label: 'Tempo vero locale (meridiana)' },
];

/** L'orologio scritto in un indirizzo, o quello ordinario se manca o non esiste. */
export function orologioDa(valore: string | null): LocalClock {
  return OROLOGI.find((orologio) => orologio.value === valore)?.value ?? 'fuso';
}

/**
 * Che cosa scrivere accanto all'ora nella riga di testa di un tema: il fuso,
 * oppure l'orologio locale su cui l'ora è stata letta. Con un orologio locale
 * il fuso non è entrato nel conto, e nominarlo direbbe il falso.
 */
export function orologioLetto(time: { clock?: LocalClock }, timezone: string): string {
  if (time.clock === 'tempo-medio-locale') return 'tempo medio locale';
  if (time.clock === 'tempo-vero-locale') return 'tempo vero locale';
  return timezone;
}
