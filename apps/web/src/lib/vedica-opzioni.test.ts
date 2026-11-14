import { describe, expect, it } from 'vitest';
import { jyotishaParameters, type JyotishaOptionsInput } from './api';
import { emptyBirthInput, resetCoordinates } from './birth';
import { jyotishaOptionsFromParameters, OPZIONI_VEDICHE } from './vedica-opzioni';

function nascita() {
  const input = emptyBirthInput();
  input.date = '1968-03-12';
  input.time = '14:30';
  input.location = {
    id: 3172394,
    name: 'Napoli',
    countryCode: 'IT',
    country: 'Italia',
    latitude: 40.8518,
    longitude: 14.2681,
    timezone: 'Europe/Rome',
    population: 900000,
    region: 'Campania',
  };
  resetCoordinates(input);
  return input;
}

describe('le opzioni vediche in un indirizzo', () => {
  it('tornano quelle con cui il link è stato composto', () => {
    const scelte: JyotishaOptionsInput = {
      ayanamsa: 'raman',
      dashaLevels: 3,
      dashaYear: 'savana',
      vargas: ['d2', 'd9', 'd10'],
      hora: 'kashinatha',
      drishtiNodes: 'gioviana',
    };
    // La pagina manda sempre anche la D-1, che è il tema.
    const link = jyotishaParameters(nascita(), { ...scelte, vargas: ['d1', ...scelte.vargas] });

    expect(jyotishaOptionsFromParameters(link)).toEqual(scelte);
  });

  it('senza niente valgono i predefiniti della pagina', () => {
    expect(jyotishaOptionsFromParameters(new URLSearchParams('date=1968-03-12'))).toEqual(OPZIONI_VEDICHE);
  });

  it('un valore sconosciuto vale il predefinito, e un varga sconosciuto si scarta', () => {
    const lette = jyotishaOptionsFromParameters(
      new URLSearchParams('dashaLevels=6&dashaYear=lunare&vargas=d9,d99,D10&hora=boh&drishtiNodes=tutte&ayanamsa=boh'),
    );

    expect(lette).toEqual({ ...OPZIONI_VEDICHE, vargas: ['d9', 'd10'] });
  });

  it('un elenco di divisionali vuoto resta vuoto', () => {
    expect(jyotishaOptionsFromParameters(new URLSearchParams('vargas=d1')).vargas).toEqual([]);
  });
});
