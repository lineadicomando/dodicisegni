/**
 * Gli elenchi del client contro quelli del motore.
 *
 * `zodiacs.ts`, `house-systems.ts` e `varghe.ts` ricopiano valori che vivono
 * in `@dodicisegni/core`, perché il client ne importa solo i tipi: un import
 * di valore trascinerebbe le effemeridi nel bundle del browser. Il tipo però
 * non basta a tenerli allineati: un ayanamsa nuovo nel motore resta fuori dal
 * menu senza nessun errore di compilazione, e la pagina che lo riceve in un
 * indirizzo ripiega su Lahiri in silenzio.
 *
 * È la stessa idea di `packages/ruota/test/tipi.test.ts`, ma sui valori: un
 * test, che può importare il motore perché nel bundle non entra, e che cade
 * nominando il file rimasto indietro. L'ordine conta, perché è quello dei
 * menu.
 */

import { AYANAMSAS as AYANAMSA_DEFINITIONS, HOUSE_SYSTEM_CODES, VARGAS } from '@dodicisegni/core';
import { describe, expect, it } from 'vitest';
import { HOUSE_SYSTEMS } from './house-systems';
import { VARGHE } from './varghe';
import { AYANAMSAS } from './zodiacs';

describe('gli elenchi del client combaciano con il motore', () => {
  it('gli ayanamsa di zodiacs.ts sono quelli di AYANAMSAS', () => {
    expect(
      AYANAMSAS.map((ayanamsa) => ayanamsa.value),
      'lib/zodiacs.ts è rimasto indietro rispetto a AYANAMSAS in packages/core/src/ayanamsa.ts',
    ).toEqual(AYANAMSA_DEFINITIONS.map((ayanamsa) => ayanamsa.id));
  });

  it('i sistemi di case di house-systems.ts sono quelli di HOUSE_SYSTEM_CODES', () => {
    expect(
      HOUSE_SYSTEMS.map((system) => system.value),
      'lib/house-systems.ts è rimasto indietro rispetto a HOUSE_SYSTEM_CODES in packages/core/src/constants.ts',
    ).toEqual(Object.keys(HOUSE_SYSTEM_CODES));
  });

  it('i varga di varghe.ts sono quelli di VARGAS, tranne la D-1', () => {
    expect(
      VARGHE.map((varga) => varga.value),
      'lib/varghe.ts è rimasto indietro rispetto a VARGAS in packages/core/src/varga.ts',
    ).toEqual(VARGAS.map((varga) => varga.id).filter((id) => id !== 'd1'));
  });
});
