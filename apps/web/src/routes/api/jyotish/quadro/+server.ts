import {
  computeNatalChart,
  computeVarga,
  HORA_CONVENTIONS,
  VARGAS,
  type ChartOptions,
  type HoraConvention,
  type VargaId,
} from '@dodicisegni/core';
import type { StileQuadro } from '@dodicisegni/ruota';
import { error } from '@sveltejs/kit';
import { readAyanamsa, readBirth } from '#lib/server/birth.js';
import { toHttpError } from '#lib/server/errors.js';
import { isHttpError } from '#lib/server/place.js';
import { readWheelOptions } from '#lib/server/wheel.js';
import { quadroResponse } from '#lib/server/wheel-response.js';
import type { RequestHandler } from './$types';

/** I varga che il motore calcola, letti da lui: una copia resterebbe indietro. */
const VARGHE_CALCOLATE = new Set<string>(VARGAS.map((varga) => varga.id));

/**
 * `GET /api/jyotish/quadro?date=1968-03-12&time=14:30&locationId=3172394`
 *
 * Il quadro vedico, disegnato. Sta a `/api/jyotish` come `/api/chart/wheel` sta
 * a `/api/chart`: gli stessi dati in forma di immagine, per chi il tema deve
 * **mostrarlo** — e un modello non vede un SVG, lo legge come testo, che è la
 * ragione per cui `format=png` esiste.
 *
 * Un disegno non porta le avvertenze del calcolo, e questo nemmeno: chi lo
 * mostra dovrebbe aver chiesto anche `/api/jyotish`.
 *
 * Oltre ai parametri della nascita e a quelli del disegno — `format`, `theme`,
 * `width`, gli stessi della ruota:
 *
 * - `stile` — `sud` (default) o `nord`. Non è una preferenza grafica soltanto:
 *   nel sud i segni stanno fermi e le case si spostano, nel nord il contrario.
 *   Dicono la stessa cosa in due disposizioni diverse.
 * - `varga` — uno fra `d1` (default), `d3`, `d4`, `d7`, `d9`, `d10`, `d12`, `d16`,
 *   `d20`, `d24`, `d27`, `d30`, `d40`, `d45`, `d60`.
 *   **Uno solo**: un'immagine è un quadro solo.
 * - `hora` — solo con `varga=d2`: `parashara` (default) o `leone-cancro`. Con
 *   Parashara il D-2 non ha segni e il quadro risponde 400
 *   (`VARGA_SENZA_SEGNI`): per disegnarlo serve `leone-cancro`.
 * - `ayanamsa` — come su `/api/jyotish`.
 *
 * Lo zodiaco non si sceglie, ed è siderale. Lo `stile` del nord **richiede
 * l'ora di nascita**: le sue caselle sono case, e senza lagna non c'è una
 * prima casa da mettere in alto.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const parameters = url.searchParams;
    const { birth } = readBirth(parameters);

    const chartOptions: ChartOptions = { zodiac: 'siderale', houseSystem: 'segni-interi' };
    const ayanamsa = readAyanamsa(parameters);
    if (ayanamsa) chartOptions.ayanamsa = ayanamsa;

    const hora = readHora(parameters);
    const varga = computeVarga(
      computeNatalChart(birth, chartOptions),
      readVarga(parameters),
      hora ? { hora } : {},
    );
    const stile = readStile(parameters);

    // Il D-2 di Parashara non ha segni, e un quadro è fatto di segni.
    if (varga.kind !== 'segni') {
      throw error(
        400,
        `Il D-2 secondo ${varga.convention.name} non ha segni, e il quadro non ha dove mettere ` +
          'i graha. Con "hora=leone-cancro" la hora del Sole va al Leone e quella della Luna ' +
          'al Cancro, ed è la lettura corrente; la tabella senza segni sta su /api/jyotish.',
        { code: 'VARGA_SENZA_SEGNI' },
      );
    }

    // Il rifiuto arriva prima del disegno, e dice che cosa fare: la geometria
    // solleverebbe lo stesso, ma con un messaggio che parla di poligoni.
    if (stile === 'nord' && !varga.ascendant) {
      throw error(
        400,
        "Lo stile del nord ha le case fisse, e senza ora di nascita non c'è un lagna da " +
          'mettere in prima casa. Usa "stile=sud", dove a essere fissi sono i segni.',
        { code: 'QUADRO_NORD_SENZA_LAGNA' },
      );
    }

    setHeaders({ 'cache-control': 'private, max-age=86400' });

    return quadroResponse(varga, readWheelOptions(parameters), { stile });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};

function readStile(parameters: URLSearchParams): StileQuadro {
  const stile = parameters.get('stile') ?? 'sud';
  if (stile !== 'nord' && stile !== 'sud') {
    throw error(
      400,
      `Stile "${stile}" non riconosciuto: attesi "nord" oppure "sud".`,
      { code: 'STILE_QUADRO_NON_VALIDO' },
    );
  }
  return stile;
}

function readHora(parameters: URLSearchParams): HoraConvention | undefined {
  const hora = parameters.get('hora');
  if (hora === null) return undefined;
  if (!HORA_CONVENTIONS.some((convenzione) => convenzione.id === hora)) {
    throw error(
      400,
      `Convenzione della hora "${hora}" sconosciuta. Disponibili: ` +
        `${HORA_CONVENTIONS.map((convenzione) => convenzione.id).join(', ')}.`,
      { code: 'VARGA_NON_VALIDO' },
    );
  }
  return hora as HoraConvention;
}

function readVarga(parameters: URLSearchParams): VargaId {
  const varga = parameters.get('varga') ?? 'd1';
  if (!VARGHE_CALCOLATE.has(varga)) {
    throw error(
      400,
      `Varga "${varga}" non disponibile. Calcolati: ${[...VARGHE_CALCOLATE].join(', ')}.`,
      { code: 'VARGA_NON_VALIDO' },
    );
  }
  return varga as VargaId;
}
