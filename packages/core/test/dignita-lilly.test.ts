import { describe, expect, it } from 'vitest';
import { ZODIAC_SIGNS } from '../src/constants.js';
import {
  LILLY_SOURCE,
  lillyDignitiesOf,
  lillyExaltation,
  lillyFaceRuler,
  lillyFall,
  lillyRulersAt,
  lillyTermRuler,
  lillyTriplicityRuler,
} from '../src/dignita-lilly.js';
import type { BodyId, ZodiacSign } from '../src/types.js';

/**
 * La tavola di Lilly, p. 104, riga per riga dall'Ariete, coi glifi della
 * stampa: esaltazione, triplicità di giorno e di notte, termini come «pianeta
 * grado finale», facce, caduta. Ricopiata dalla pagina (vedi `trascrizioni.md`
 * nella copia locale della fonte) e non dal modulo: la prova ha senso solo se
 * le due tavole sono scritte indipendentemente.
 */
const RIGHE: readonly string[] = [
  '☉19 | ☉♃ | ♃6 ♀14 ☿21 ♂26 ♄30 | ♂☉♀ | ♄',
  '☽3  | ♀☽ | ♀8 ☿15 ♃22 ♄26 ♂30 | ☿☽♄ | -',
  '☊3  | ♄☿ | ☿7 ♃14 ♀21 ♄25 ♂30 | ♃♂☉ | ☋',
  '♃15 | ♂♂ | ♂6 ♃13 ☿20 ♀27 ♄30 | ♀☿☽ | ♂',
  '-   | ☉♃ | ♄6 ☿13 ♀19 ♃25 ♂30 | ♄♃♂ | -',
  '☿15 | ♀☽ | ☿7 ♀13 ♃18 ♄24 ♂30 | ☉♀☿ | ♀',
  '♄21 | ♄☿ | ♄6 ♀11 ♃19 ☿24 ♂30 | ☽♄♃ | ☉',
  '-   | ♂♂ | ♂6 ♃14 ♀21 ☿27 ♄30 | ♂☉♀ | ☽',
  '☋3  | ☉♃ | ♃8 ♀14 ☿19 ♄25 ♂30 | ☿☽♄ | ☊',
  '♂28 | ♀☽ | ♀6 ☿12 ♃19 ♂25 ♄30 | ♃♂☉ | ♃',
  '-   | ♄☿ | ♄6 ☿12 ♀20 ♃25 ♂30 | ♀☿☽ | -',
  '♀27 | ♂♂ | ♀8 ♃14 ☿20 ♂26 ♄30 | ♄♃♂ | ☿',
];

const GLIFI: Readonly<Record<string, BodyId>> = {
  '☉': 'sole',
  '☽': 'luna',
  '☿': 'mercurio',
  '♀': 'venere',
  '♂': 'marte',
  '♃': 'giove',
  '♄': 'saturno',
  '☊': 'nodo-nord',
  '☋': 'nodo-sud',
};

function corpo(glifo: string): BodyId {
  const id = GLIFI[glifo];
  if (!id) throw new Error(`glifo sconosciuto: ${glifo}`);
  return id;
}

interface Riga {
  sign: ZodiacSign;
  esaltazione?: { body: BodyId; degree: number };
  giorno: BodyId;
  notte: BodyId;
  termini: [BodyId, number][];
  facce: BodyId[];
  caduta?: BodyId;
}

const TAVOLA: readonly Riga[] = RIGHE.map((testo, i) => {
  const [esalt, tripl, termini, facce, caduta] = testo.split('|').map((parte) => parte.trim()) as [
    string,
    string,
    string,
    string,
    string,
  ];
  const [giorno, notte] = [...tripl].map(corpo) as [BodyId, BodyId];
  return {
    sign: ZODIAC_SIGNS[i] as ZodiacSign,
    ...(esalt === '-' ? {} : { esaltazione: { body: corpo([...esalt][0]!), degree: Number(esalt.slice(1)) } }),
    giorno,
    notte,
    termini: termini.split(' ').map((t) => [corpo([...t][0]!), Number(t.slice(1))]),
    facce: [...facce].map(corpo),
    ...(caduta === '-' ? {} : { caduta: corpo(caduta) }),
  };
});

/** La longitudine di un grado di un segno. */
function lon(sign: ZodiacSign, degree: number): number {
  return ZODIAC_SIGNS.indexOf(sign) * 30 + degree;
}

describe('la tavola di Lilly, p. 104', () => {
  it('ha le esaltazioni col grado, Nodi compresi', () => {
    for (const riga of TAVOLA) {
      if (!riga.esaltazione) continue;
      expect(lillyExaltation(riga.esaltazione.body)).toEqual({
        sign: riga.sign,
        degree: riga.esaltazione.degree,
      });
    }
    expect(lillyExaltation('urano')).toBeUndefined();
  });

  it('ha le cadute della colonna Fall, e cadono nel segno opposto all\'esaltazione', () => {
    for (const riga of TAVOLA) {
      if (!riga.caduta) continue;
      expect(lillyFall(riga.caduta)).toBe(riga.sign);
      const esaltazione = lillyExaltation(riga.caduta)!;
      expect((ZODIAC_SIGNS.indexOf(esaltazione.sign) + 6) % 12).toBe(ZODIAC_SIGNS.indexOf(riga.sign));
    }
  });

  it('ha le triplicità di giorno e di notte', () => {
    for (const riga of TAVOLA) {
      expect(lillyTriplicityRuler(riga.sign, 'diurna')).toBe(riga.giorno);
      expect(lillyTriplicityRuler(riga.sign, 'notturna')).toBe(riga.notte);
    }
  });

  it('senza la setta dà il reggente solo nell\'acqua, dove è lo stesso', () => {
    expect(lillyTriplicityRuler('scorpione', undefined)).toBe('marte');
    expect(lillyTriplicityRuler('ariete', undefined)).toBeUndefined();
  });

  it('ha i termini, provati in ogni tratto e ai due bordi', () => {
    for (const riga of TAVOLA) {
      let inizio = 0;
      for (const [pianeta, fine] of riga.termini) {
        expect(lillyTermRuler(lon(riga.sign, inizio))).toBe(pianeta);
        expect(lillyTermRuler(lon(riga.sign, fine - 0.001))).toBe(pianeta);
        inizio = fine;
      }
      expect(inizio).toBe(30);
    }
  });

  it('ha le facce, di dieci gradi', () => {
    for (const riga of TAVOLA) {
      riga.facce.forEach((pianeta, i) => {
        expect(lillyFaceRuler(lon(riga.sign, i * 10))).toBe(pianeta);
        expect(lillyFaceRuler(lon(riga.sign, i * 10 + 9.999))).toBe(pianeta);
      });
    }
  });

  it('legge i bordi come p. 105: «the first six degrees of ♈ are the Termes of ♃»', () => {
    expect(lillyTermRuler(5.999)).toBe('giove');
    expect(lillyTermRuler(6)).toBe('venere');
    expect(lillyFaceRuler(10)).toBe('sole');
  });

  it('dà in ogni segno un termine a ciascuno dei cinque pianeti, e nessuno ai luminari', () => {
    // Vale per ogni riga della stampa: è la prova che nella trascrizione ♀ e
    // ☿, che sulla pagina si confondono, non sono stati scambiati.
    const cinque = ['giove', 'marte', 'mercurio', 'saturno', 'venere'];
    for (const riga of TAVOLA) {
      const pianeti = riga.termini.map(([pianeta]) => pianeta);
      expect([...pianeti].sort()).toEqual(cinque);
    }
  });
});

describe('le dignità di un corpo in un grado', () => {
  it('sommano le cinque dignità e le due debilità', () => {
    // Marte a 3 dell'Ariete, di notte: domicilio, faccia; il termine è di
    // Giove, la triplicità notturna del fuoco anche.
    expect(lillyDignitiesOf('marte', lon('ariete', 3), 'notturna')).toEqual(['domicilio', 'faccia']);
    // Il Sole a 15 dell'Ariete di giorno: esaltazione, triplicità, faccia.
    expect(lillyDignitiesOf('sole', lon('ariete', 15), 'diurna')).toEqual([
      'esaltazione',
      'triplicita',
      'faccia',
    ]);
    // Venere a 24 della Vergine, di giorno: triplicità e caduta; il termine
    // è già di Marte, perché quello di Saturno finisce a 24.
    expect(lillyDignitiesOf('venere', lon('vergine', 24), 'diurna')).toEqual(['triplicita', 'caduta']);
    // Mercurio a 28 dei Pesci: esilio e caduta, nel termine di Saturno.
    expect(lillyDignitiesOf('mercurio', lon('pesci', 28), undefined)).toEqual(['esilio', 'caduta']);
  });

  it("danno ai Nodi l'esaltazione e la caduta, e nient'altro", () => {
    expect(lillyDignitiesOf('nodo-nord', lon('gemelli', 20), 'diurna')).toEqual(['esaltazione']);
    expect(lillyDignitiesOf('nodo-nord', lon('sagittario', 1), 'diurna')).toEqual(['caduta']);
    expect(lillyDignitiesOf('nodo-sud', lon('gemelli', 1), 'diurna')).toEqual(['caduta']);
  });

  it('non danno niente ai corpi fuori dalla tavola', () => {
    expect(lillyDignitiesOf('plutone', lon('scorpione', 5), 'diurna')).toEqual([]);
  });

  it('nominano i signori di un grado', () => {
    expect(lillyRulersAt(lon('cancro', 16), undefined)).toEqual({
      domicilio: 'luna',
      esaltazione: 'giove',
      triplicita: 'marte',
      termine: 'mercurio',
      faccia: 'mercurio',
    });
    expect(lillyRulersAt(lon('leone', 1), undefined)).toEqual({
      domicilio: 'sole',
      termine: 'saturno',
      faccia: 'saturno',
    });
  });

  it('portano la fonte con la pagina', () => {
    expect(LILLY_SOURCE).toContain('pp. 104-105');
  });
});
