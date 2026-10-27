export type ChartErrorCode =
  | 'DATA_NON_VALIDA'
  | 'ORA_NON_VALIDA'
  | 'FUSO_ORARIO_NON_VALIDO'
  | 'COORDINATE_NON_VALIDE'
  | 'CORPO_SCONOSCIUTO'
  | 'SISTEMA_CASE_NON_VALIDO'
  | 'AYANAMSA_NON_VALIDO'
  | 'ZODIACO_NON_SIDERALE'
  | 'ZODIACO_NON_TROPICALE'
  | 'VARGA_NON_VALIDO'
  | 'INTERVALLO_NON_VALIDO'
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
