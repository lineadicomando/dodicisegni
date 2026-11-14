/**
 * Le opzioni della sezione vedica scritte in un indirizzo, rimesse nella
 * forma che la pagina tiene.
 *
 * È l'inverso di `jyotishaParameters` in `api.ts`, con gli stessi nomi: il
 * collegamento che si copia dal tema porta ordini e anno delle dasha, le
 * divisionali, la hora e le drishti dei nodi, e chi lo apre deve vedere
 * quello che vedeva chi l'ha copiato. Prima la pagina rileggeva il solo
 * ayanamsa, e un collegamento fatto con l'anno savana mostrava altre date
 * senza dirlo.
 *
 * Un valore sconosciuto vale il predefinito, come per l'ayanamsa: un
 * indirizzo scritto a mano non deve fermare la pagina. Il server, a cui lo
 * stesso valore arrivasse, lo rifiuterebbe.
 */

import type { HoraConvention } from '@dodicisegni/core';
import type { JyotishaOptionsInput } from './api';
import { VARGHE } from './varghe';
import { ayanamsaOrDefault } from './zodiacs';

/** Le letture del D-2, nell'ordine del menù. Copia del motore: vedi `elenchi.test.ts`. */
export const HORE: readonly HoraConvention[] = [
  'parashara',
  'leone-cancro',
  'parivritti-dvaya',
  'kashinatha',
  'suprajarama',
  'uma-shambhu',
];

/** Le opzioni di chi non ha scelto niente: le stesse da cui parte la pagina. */
export const OPZIONI_VEDICHE: JyotishaOptionsInput = {
  ayanamsa: 'lahiri',
  dashaLevels: 2,
  dashaYear: 'solare',
  vargas: ['d9'],
  hora: 'parashara',
  drishtiNodes: 'nessuna',
};

/**
 * Le opzioni lette da un indirizzo. `vargas` torna **senza la D-1**: la
 * pagina la chiede sempre da sé, perché è il tema, e non la tiene fra le
 * divisionali da mostrare.
 */
export function jyotishaOptionsFromParameters(
  parametri: Pick<URLSearchParams, 'get'>,
): JyotishaOptionsInput {
  const livelli = parametri.get('dashaLevels');
  const anno = parametri.get('dashaYear');
  const hora = parametri.get('hora');
  const nodi = parametri.get('drishtiNodes');

  // L'elenco assente lascia il predefinito; l'elenco presente si prende per
  // quello che dice, anche vuoto, perché «nessuna divisionale» è una scelta.
  const elenco = parametri.get('vargas');
  const chieste = new Set((elenco ?? '').split(',').map((voce) => voce.trim().toLowerCase()));
  const vargas =
    elenco === null
      ? OPZIONI_VEDICHE.vargas
      : VARGHE.map((varga) => varga.value).filter((id) => id !== 'd1' && chieste.has(id));

  return {
    ayanamsa: ayanamsaOrDefault(parametri.get('ayanamsa')),
    dashaLevels: livelli === '1' ? 1 : livelli === '3' ? 3 : OPZIONI_VEDICHE.dashaLevels,
    dashaYear: anno === 'savana' ? 'savana' : OPZIONI_VEDICHE.dashaYear,
    vargas: [...vargas],
    hora: HORE.find((convenzione) => convenzione === hora) ?? OPZIONI_VEDICHE.hora,
    drishtiNodes: nodi === 'gioviana' ? 'gioviana' : OPZIONI_VEDICHE.drishtiNodes,
  };
}
