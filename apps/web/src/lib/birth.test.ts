import type { Location } from '@dodicisegni/geo';
import { orologioLetto } from './orologi';
import { describe, expect, it } from 'vitest';
import {
  birthFromParameters,
  emptyBirthInput,
  isComplete,
  refinedCoordinates,
  resetCoordinates,
  type BirthInput,
} from './birth';

const NAPOLI: Location = {
  id: 3172394,
  name: 'Napoli',
  countryCode: 'IT',
  country: 'Italia',
  region: 'Campania',
  latitude: 40.8518,
  longitude: 14.2681,
  timezone: 'Europe/Rome',
  population: 966144,
};

function completo(): BirthInput {
  const input = emptyBirthInput();
  input.date = '1968-03-12';
  input.time = '14:30';
  input.location = NAPOLI;
  resetCoordinates(input);
  return input;
}

describe('isComplete', () => {
  it('accetta data, ora e luogo', () => {
    expect(isComplete(completo())).toBe(true);
  });

  it('rifiuta un modulo vuoto', () => {
    expect(isComplete(emptyBirthInput())).toBe(false);
  });

  it('rifiuta la data senza luogo', () => {
    const input = completo();
    input.location = null;
    expect(isComplete(input)).toBe(false);
  });

  it('rifiuta il luogo senza data', () => {
    const input = completo();
    input.date = '';
    expect(isComplete(input)).toBe(false);
  });

  it('non pretende l’ora se dichiarata sconosciuta', () => {
    const input = completo();
    input.time = '';
    input.timeUnknown = true;
    expect(isComplete(input)).toBe(true);
  });

  it('rifiuta coordinate a metà quando la correzione è attiva', () => {
    // Ripiegare in silenzio sul centroide vanificherebbe la correzione:
    // chi la attiva lo fa proprio perché il centroide non gli basta.
    const input = completo();
    input.refineCoordinates = true;
    input.latitude = "38°08'";
    input.longitude = '';
    expect(isComplete(input)).toBe(false);
  });

  it('ignora coordinate non valide se la correzione è spenta', () => {
    const input = completo();
    input.latitude = 'niente';
    expect(isComplete(input)).toBe(true);
  });
});

describe('refinedCoordinates', () => {
  it('restituisce null quando la correzione è spenta', () => {
    expect(refinedCoordinates(completo())).toBeNull();
  });

  it('legge il formato sessagesimale', () => {
    const input = completo();
    input.refineCoordinates = true;
    input.latitude = "38°08'N";
    input.longitude = "13°20'E";

    const coordinate = refinedCoordinates(input);
    expect(coordinate?.latitude).toBeCloseTo(38.1333, 4);
    expect(coordinate?.longitude).toBeCloseTo(13.3333, 4);
  });
});

describe('resetCoordinates', () => {
  it('riporta i campi al centroide della località', () => {
    const input = completo();
    input.latitude = '0';
    input.longitude = '0';
    resetCoordinates(input);
    expect(input.latitude).toBe('40.8518');
    expect(input.longitude).toBe('14.2681');
  });

  it('svuota i campi se la località non c’è', () => {
    const input = completo();
    input.location = null;
    resetCoordinates(input);
    expect(input.latitude).toBe('');
    expect(input.longitude).toBe('');
  });
});

describe("l'orologio in un indirizzo", () => {
  it('torna nel modulo, e una parola sconosciuta vale il fuso', () => {
    const letto = (query: string) => birthFromParameters(new URLSearchParams(query), null).clock;

    expect(letto('date=1850-06-01&time=12:00&clock=tempo-vero-locale')).toBe('tempo-vero-locale');
    expect(letto('date=1850-06-01&time=12:00')).toBe('fuso');
    expect(letto('date=1850-06-01&time=12:00&clock=boh')).toBe('fuso');
  });
});

describe("l'orologio nella riga di testa", () => {
  it('nomina il fuso solo quando è il fuso ad aver letto l’ora', () => {
    expect(orologioLetto({}, 'Europe/Rome')).toBe('Europe/Rome');
    expect(orologioLetto({ clock: 'tempo-medio-locale' }, 'Europe/Rome')).toBe('tempo medio locale');
    expect(orologioLetto({ clock: 'tempo-vero-locale' }, 'Europe/Rome')).toBe('tempo vero locale');
  });
});

