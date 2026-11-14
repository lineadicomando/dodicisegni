export type ChartErrorCode =
  | 'DATA_NON_VALIDA'
  | 'ORA_NON_VALIDA'
  | 'FUSO_ORARIO_NON_VALIDO'
  | 'OROLOGIO_NON_VALIDO'
  | 'COORDINATE_NON_VALIDE'
  | 'CORPO_SCONOSCIUTO'
  | 'SISTEMA_CASE_NON_VALIDO'
  | 'AYANAMSA_NON_VALIDO'
  | 'ZODIACO_NON_SIDERALE'
  | 'ZODIACO_NON_TROPICALE'
  | 'VARGA_NON_VALIDO'
  | 'VARGA_SENZA_SEGNI'
  | 'LIVELLI_DASHA_NON_VALIDI'
  | 'INTERVALLO_NON_VALIDO'
  | 'RISPOSTA_TROPPO_LUNGA'
  | 'ORBITE_NON_VALIDE'
  | 'CASA_NON_VALIDA'
  | 'ERRORE_EFFEMERIDI';

/**
 * Errore d'uso del motore di calcolo: input malformato o condizione
 * per cui il calcolo non è possibile. Il `code` è pensato per essere
 * mappato direttamente su una risposta d'errore dell'API.
 */
export class ChartError extends Error {
  readonly code: ChartErrorCode;

  constructor(code: ChartErrorCode, message: string) {
    super(message);
    this.name = 'ChartError';
    this.code = code;
  }
}

/**
 * Il messaggio di Swiss Ephemeris senza il percorso della cartella in cui ha
 * cercato i file (`… not found in PATH '/…/ephe/'`).
 *
 * Quei messaggi finiscono nelle avvertenze, e le avvertenze escono dal
 * motore: su un server direbbero a chiunque com'è fatto il suo disco. Il nome
 * del file resta, che è ciò che serve a capire che cosa manca.
 */
export function withoutPaths(message: string | undefined): string {
  return (message ?? '').replace(/\s*in PATH '[^']*'/g, '').trim();
}
