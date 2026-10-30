/**
 * Formattazione dei valori angolari a schermo.
 *
 * Sta qui e non in un componente perché ogni tabella di posizioni la usa —
 * corpi, cuspidi, orbite degli aspetti — e le sezioni che verranno la useranno
 * allo stesso modo.
 */

/**
 * Gradi e primi, es. `22°03'`.
 *
 * L'arrotondamento dei primi può produrre 60: 22,9999° scriverebbe `22°60'`,
 * che non è una posizione. Il riporto va propagato al grado.
 */
export function formatDegrees(value: number): string {
  const degrees = Math.floor(value);
  const minutes = Math.round((value - degrees) * 60);
  return minutes === 60
    ? `${degrees + 1}°00'`
    : `${degrees}°${String(minutes).padStart(2, '0')}'`;
}

/**
 * Il grado dentro un segno, es. `22°03'`.
 *
 * Arrotonda come `formatDegrees`, **ma non oltre l'ultimo primo del segno**.
 * A 29°59'40" il riporto scriverebbe `30°00'`, che accanto al glifo
 * dell'acquario è una posizione che nessun tema può avere: i trenta gradi di
 * un segno finiscono a 29°59'59". Il segno lo mostra la colonna di fianco, e
 * contraddirlo per mezzo secondo d'arco costerebbe più del primo che si perde.
 *
 * `formatDegrees` resta com'è per le orbite degli aspetti, dove non c'è nessun
 * segno da contraddire e trenta gradi sono una misura come un'altra.
 */
export function formatSignDegree(value: number): string {
  const ultimo = 30 * 60 - 1;
  return formatDegrees(Math.min(Math.round(value * 60), ultimo) / 60);
}

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

/**
 * Un istante locale come lo scrive il motore, `2026-10-27T22:15:00+01:00`,
 * reso `27 ott 2026, 22:15`.
 *
 * Letto dalla stringa e non da `Date`: `toLocaleString` convertirebbe nel
 * fuso del browser, e un evento della figura va scritto nel fuso in cui la
 * domanda è stata posta, che può essere un altro. Il fuso è già nell'istante
 * locale, e qui si mostrano solo giorno e ora.
 */
export function formatLocalInstant(local: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(local);
  if (!match) return local;
  const [, anno, mese, giorno, ore, minuti] = match;
  return `${Number(giorno)} ${MESI[Number(mese) - 1]} ${anno}, ${ore}:${minuti}`;
}
