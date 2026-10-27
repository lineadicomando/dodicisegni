import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { computeLillyConditions, lillyHouse, partileAspect } from '../src/condizioni-lilly.js';
import { initEphemeris } from '../src/ephemeris.js';
import { degreeInSign, signOf } from '../src/math.js';
import type { BodyId, CelestialBody, House, LillyBodyConditions, LillyScoreRow } from '../src/types.js';

/** Un corpo con la sola longitudine e la velocità: il resto non serve al conto. */
function corpo(id: BodyId, longitude: number, speed = 1): CelestialBody {
  return {
    id,
    name: id,
    longitude,
    latitude: 0,
    distance: 1,
    speed,
    retrograde: speed < 0,
    sign: signOf(longitude),
    signDegree: degreeInSign(longitude),
  };
}

/** Le cuspidi di dodici case uguali a partire da un Ascendente. */
function caseUguali(ascendant: number): House[] {
  return Array.from({ length: 12 }, (_, i) => {
    const longitude = (ascendant + i * 30) % 360;
    return { number: i + 1, longitude, sign: signOf(longitude), signDegree: degreeInSign(longitude) };
  });
}

const SENZA_STELLE = { missing: 'non richieste' } as const;

function condizioni(bodies: CelestialBody[], houses: House[] = []) {
  return computeLillyConditions({ bodies, houses, sect: 'diurna', stars: SENZA_STELLE });
}

function di(result: ReturnType<typeof condizioni>, id: BodyId): LillyBodyConditions {
  const trovato = result.bodies.find((body) => body.id === id);
  if (!trovato) throw new Error(`${id} assente`);
  return trovato;
}

/** Le righe in forma breve, per confrontarle con quelle stampate da Lilly. */
function righe(rows: readonly LillyScoreRow[]): string[] {
  return rows.map((row) => `${row.item}${row.house ?? ''}${row.star ? ` ${row.star}` : ''} ${row.points}`);
}

describe('le regole, sugli esempi di Lilly', () => {
  it('distingue cazimi, combustione e raggi come a p. 113', () => {
    // «☉ in 15.30. ♉, ☿ in 15.25. of ♉: here ☿ is in Cazimi»; «♃ in the tenth
    // degree of ♈, and ☉ in the eighteenth of ♈; here ♃ is combust: or let
    // the ☉ be in eighteen of ♈, and ♃ in twenty eight degrees of ♈, here ♃
    // is combust».
    const cazimi = condizioni([corpo('sole', 45.5), corpo('mercurio', 45 + 25 / 60)]);
    expect(di(cazimi, 'mercurio').sun?.state).toBe('cazimi');

    const combusto = condizioni([corpo('sole', 18), corpo('giove', 10)]);
    expect(di(combusto, 'giove').sun?.state).toBe('combusto');
    // Il secondo esempio mette Giove a 10° dal Sole, oltre gli 8°30' che la
    // stessa pagina stampa come soglia: il motore segue la soglia, e quel
    // Giove per lui è sotto i raggi.
    const secondo = condizioni([corpo('sole', 18), corpo('giove', 28)]);
    expect(di(secondo, 'giove').sun?.state).toBe('sotto-i-raggi');

    // Entro 8°30' ma in un altro segno: «Combustion can onely be by personall
    // ☌ in one Signe» (p. 114). Resta sotto i raggi, che vanno fino a 17°.
    const altroSegno = condizioni([corpo('sole', 31), corpo('mercurio', 28)]);
    expect(di(altroSegno, 'mercurio').sun?.state).toBe('sotto-i-raggi');

    const lontano = condizioni([corpo('sole', 0), corpo('venere', 17.5)]);
    expect(di(lontano, 'venere').sun?.state).toBe('libero');
  });

  it('dice orientale chi sorge prima del Sole, e ne conta i punti secondo il pianeta', () => {
    // p. 114: i superiori sono orientali dalla congiunzione all'opposizione,
    // cioè con il Sole davanti; Mercurio e Venere quando stanno «in fewer
    // degrees of the Signe the ☉ is». p. 115: orientali è +2 per i primi e
    // −2 per i secondi; la Luna occidentale è crescente, +2.
    const result = condizioni([
      corpo('sole', 100),
      corpo('marte', 40),
      corpo('venere', 90),
      corpo('luna', 160),
    ]);
    expect(di(result, 'marte').phase).toBe('orientale');
    expect(righe(di(result, 'marte').score.fortitudes)).toContain('orientale 2');
    expect(di(result, 'venere').phase).toBe('orientale');
    expect(righe(di(result, 'venere').score.debilities)).toContain('orientale 2');
    expect(righe(di(result, 'luna').score.fortitudes)).toContain('crescente 2');
  });

  it('trova i partili sullo stesso grado intero, come a p. 106', () => {
    // «if ♀ be in nine degrees of ♈, and ♃ in nine degrees of ♌, this is a
    // Partill △ aspect». In gradi interi: 9°00'-9°59'.
    expect(partileAspect(9.2, 120 + 9.9)).toBe('trigono');
    expect(partileAspect(9.9, 120 + 10.1)).toBeUndefined();
    // «☉ in one degree of ♉, and ☽ in one degree of ♋, make a Partil ✶».
    expect(partileAspect(31.5, 91.2)).toBe('sestile');

    const result = condizioni([corpo('sole', 200), corpo('venere', 9.2), corpo('giove', 129.9)]);
    expect(di(result, 'venere').score.fortitudes).toContainEqual({
      item: 'partile',
      aspect: 'trigono',
      with: 'giove',
      points: 4,
    });
  });

  it("riconosce l'assedio di p. 114", () => {
    // «♄ in 15. ♈, ♂ in 10. of ♈, ♀ in 13 ♈: here Venus is besieged».
    const result = condizioni([corpo('sole', 200), corpo('saturno', 15), corpo('marte', 10), corpo('venere', 13)]);
    expect(di(result, 'venere').besieged).toBe(true);
    expect(righe(di(result, 'venere').score.debilities)).toContain('assediato 5');
  });

  it('dice peregrino chi non ha dignità nel grado, come a p. 112', () => {
    // «♄ in the tenth degree of ♈ … he is then said to be Peregrine; had he
    // been in 27, 28, &c. of ♈, he could not be termed Peregrine, because
    // then he is in his owne Terme».
    expect(di(condizioni([corpo('saturno', 10)]), 'saturno').peregrine).toBe(true);
    expect(di(condizioni([corpo('saturno', 27.5)]), 'saturno').peregrine).toBe(false);
    // «So the ☉ in any part of ♋ is Peregrine».
    expect(di(condizioni([corpo('sole', 95)]), 'sole').peregrine).toBe(true);
  });

  it("mette l'antiscion dove lo mette p. 90", () => {
    // «when the ☉ is in the tenth of ♉, he hath his Antiscion to the twentieth of ♌».
    const sole = di(condizioni([corpo('sole', 40)]), 'sole');
    expect(sole.antiscion).toBeCloseTo(140);
    expect(sole.contrantiscion).toBeCloseTo(320);
  });

  it('confronta il moto col moto medio di Lilly, come a p. 178', () => {
    // «The Diurnall motion of ♂ is 35. min. this being more then his …
    // meane motion … 31 min. 27. seconds. He is reputed swift»; il Sole a
    // 57' è lento; Saturno retrogrado di due primi pure.
    const result = condizioni([corpo('sole', 120, 57 / 60), corpo('marte', 200, 35 / 60), corpo('saturno', 250, -2 / 60)]);
    expect(di(result, 'marte').motion.pace).toBe('veloce');
    expect(di(result, 'sole').motion.pace).toBe('lento');
    expect(di(result, 'saturno').motion).toMatchObject({ pace: 'lento', direction: 'retrogrado' });
    expect(di(result, 'marte').motion.mean).toBeCloseTo(31 / 60 + 27 / 3600, 10);
  });

  it('passa alla casa dopo entro cinque gradi dalla cuspide, come a p. 33', () => {
    const houses = caseUguali(0);
    expect(lillyHouse(26, houses)).toBe(2);
    expect(lillyHouse(24, houses)).toBe(1);
    expect(lillyHouse(31, houses)).toBe(2);
    // Il passaggio della dodicesima alla prima.
    expect(lillyHouse(357, houses)).toBe(1);
  });

  it("dice i gradi dell'Ascendente e la Via Combusta di p. 122", () => {
    const presto = computeLillyConditions({
      bodies: [corpo('luna', 200)],
      houses: caseUguali(62.5),
      ascendant: 62.5,
      stars: SENZA_STELLE,
    });
    expect(presto.ascendant).toMatchObject({ early: true, late: false });
    expect(presto.moonInViaCombusta).toBe(true);

    const tardi = computeLillyConditions({
      bodies: [corpo('luna', 226)],
      houses: caseUguali(87.2),
      ascendant: 87.2,
      stars: SENZA_STELLE,
    });
    expect(tardi.ascendant).toMatchObject({ early: false, late: true });
    expect(tardi.moonInViaCombusta).toBe(false);
  });

  it('dice che cosa manca invece di contarlo come zero', () => {
    const result = condizioni([corpo('sole', 10), corpo('luna', 50)]);
    expect(result.missing.join(' ')).toMatch(/casa/);
    expect(result.missing.join(' ')).toMatch(/stelle/);
    expect(result.missing.join(' ')).toMatch(/Nodi/);
    expect(di(result, 'luna').house).toBeUndefined();
  });
});

/**
 * Il conto di Lilly conta anche Regolo e Spica, che vengono dal catalogo
 * delle stelle: un file facoltativo, come le effemeridi. Su un clone dove non
 * è ancora stato scaricato la figura non si confronta, invece di cadere senza
 * che niente sia rotto; nel CI il file c'è.
 */
const conStelle = initEphemeris().starsAvailable;

describe.skipIf(!conStelle)("la figura di Lilly del 16 luglio 1634 (Christian Astrology, pp. 177-180)", () => {
  // La figura di p. 177: «16. July 1634, 11 H 6 A M», Londra. La data è
  // giuliana, il 26 luglio nel gregoriano del motore. Lilly erigeva col
  // Regiomontano. Le sue effemeridi sbagliano di qualche primo, ma nessun
  // pianeta qui sta su un confine che cambi il conto.
  const chart = computeNatalChart(
    { date: '1634-07-26', time: '11:06', timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
    { houseSystem: 'regiomontano', dignitySchool: 'lilly' },
  );
  const conditions = chart.dignities!.lilly!.conditions;
  const pianeta = (id: BodyId): LillyBodyConditions => conditions.bodies.find((body) => body.id === id)!;

  it("dà l'ora del Sole, come la figura", () => {
    expect(conditions.hour?.ruler).toBe('sole');
  });

  it('conta Venere, Marte e Saturno riga per riga come Lilly', () => {
    // p. 179: «♀ … In the eleventh house 4, Direct 4, Swift in motion 2,
    // Occidentall of ☉ 2, Free from Combustion 5, ☌ with Regulus … 6» = 23;
    // «Peregrine 5». Venere sta prima della cuspide dell'undicesima: è la
    // regola dei cinque gradi.
    expect(righe(pianeta('venere').score.fortitudes)).toEqual([
      'casa11 4',
      'diretto 4',
      'veloce 2',
      'occidentale 2',
      'libero 5',
      'stella regolo 6',
    ]);
    expect(righe(pianeta('venere').score.debilities)).toEqual(['peregrino 5']);
    expect(pianeta('venere').score.totals).toEqual({ fortitudes: 23, debilities: 5, net: 18 });

    // p. 179: «♂ … In the Ascendant 5, Direct 4, Swift in motion 2, Free from
    // Combustion 5, In ☌ with Spica ♍, or within five degrees 5» = 21; «In
    // Detriment 5, Peregrine 5, Occidentall of the ☉ 2» = 12.
    expect(righe(pianeta('marte').score.fortitudes)).toEqual([
      'casa1 5',
      'diretto 4',
      'veloce 2',
      'libero 5',
      'stella spica 5',
    ]);
    expect(righe(pianeta('marte').score.debilities)).toEqual(['esilio 5', 'peregrino 5', 'occidentale 2']);
    // p. 180: «♂ Is strong as having 9 Dignities».
    expect(pianeta('marte').score.totals.net).toBe(9);

    // p. 178: «In the third House 1, Free from Combustion 5» = 6; «Peregrine
    // 5, Retrograde 5, Slow in motion 2, Occidentall 2» = 14. p. 180: «♄ Is
    // weak by Testimonies 8».
    expect(righe(pianeta('saturno').score.fortitudes)).toEqual(['casa3 1', 'libero 5']);
    expect(righe(pianeta('saturno').score.debilities)).toEqual([
      'peregrino 5',
      'retrogrado 5',
      'lento 2',
      'occidentale 2',
    ]);
    expect(pianeta('saturno').score.totals.net).toBe(-8);
  });

  it("segue la tavola dove l'esempio se ne discosta, e il test lo tiene scritto", () => {
    // Sole, p. 179: Lilly conta «In his owne House 5, In Mid-heaven 5» e
    // «Slow in motion 2». La figura è diurna e il Sole regge di giorno la
    // triplicità del fuoco: la tavola di p. 104 gli dà anche quella, e
    // l'esempio la tace.
    expect(righe(pianeta('sole').score.fortitudes)).toEqual(['domicilio 5', 'triplicita 3', 'casa10 5']);
    expect(righe(pianeta('sole').score.debilities)).toEqual(['lento 2']);

    // Mercurio, la Luna e Giove stanno entro 17° dal Sole, e per p. 113 sono
    // sotto i raggi; Lilly scrive per tutti e tre «Free from Combustion 5».
    for (const id of ['mercurio', 'luna', 'giove'] as const) {
      expect(pianeta(id).sun?.state).toBe('sotto-i-raggi');
      expect(pianeta(id).sun!.distance).toBeLessThan(17);
    }
    // Mercurio, p. 180: «In the tenth house 5, Direct 4, Swift in motion 2,
    // Occidentall 2, Free from Combustion 5»; «Peregrine 5».
    expect(righe(pianeta('mercurio').score.fortitudes)).toEqual(['casa10 5', 'diretto 4', 'veloce 2', 'occidentale 2']);
    expect(righe(pianeta('mercurio').score.debilities)).toEqual(['peregrino 5', 'sotto-i-raggi 4']);
    // Luna, p. 180: «In the tenth house 5, Increasing in Light 2, Free from
    // Combustion 5»; «Slow in motion 2, Peregrine 5».
    expect(righe(pianeta('luna').score.fortitudes)).toEqual(['casa10 5', 'crescente 2']);
    expect(righe(pianeta('luna').score.debilities)).toEqual(['peregrino 5', 'lento 2', 'sotto-i-raggi 4']);
    // Giove, p. 179: «In Exaltation 4, In the tenth House 5, Direct 4, Swift
    // in motion 2, Free from Combustion 5». È anche orientale, e la tavola
    // gli dà 2 che l'esempio non conta.
    expect(righe(pianeta('giove').score.fortitudes)).toEqual([
      'esaltazione 4',
      'casa10 5',
      'diretto 4',
      'veloce 2',
      'orientale 2',
    ]);
    expect(righe(pianeta('giove').score.debilities)).toEqual(['sotto-i-raggi 4']);
  });

  it('porta le letture fatte e la fonte', () => {
    expect(conditions.source).toMatch(/p\. 115/);
    expect(conditions.readings.join(' ')).toMatch(/Free from Combustion/);
    expect(conditions.missing).toEqual([]);
  });
});
