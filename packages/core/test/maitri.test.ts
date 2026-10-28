import { describe, expect, it } from 'vitest';
import { computeNatalChart } from '../src/chart.js';
import { computeJyotisha } from '../src/jyotisha.js';
import { computeRelationships, naisargikaMaitri, panchadhaMaitri, tatkalikaMaitri } from '../src/maitri.js';
import type { BirthData, BodyId, Maitri } from '../src/types.js';

/**
 * La tavola di Santhanam sotto BPHS 3.55 (vol. I, p. 40), ricopiata com'è
 * stampata: amici, nemici, neutri. La regola del verso deve ridarla.
 */
const TAVOLA: Record<string, { mitra: BodyId[]; shatru: BodyId[]; sama: BodyId[] }> = {
  sole: { mitra: ['luna', 'marte', 'giove'], shatru: ['venere', 'saturno'], sama: ['mercurio'] },
  luna: { mitra: ['sole', 'mercurio'], shatru: [], sama: ['marte', 'giove', 'venere', 'saturno'] },
  marte: { mitra: ['sole', 'luna', 'giove'], shatru: ['mercurio'], sama: ['venere', 'saturno'] },
  mercurio: { mitra: ['sole', 'venere'], shatru: ['luna'], sama: ['marte', 'giove', 'saturno'] },
  giove: { mitra: ['sole', 'luna', 'marte'], shatru: ['mercurio', 'venere'], sama: ['saturno'] },
  venere: { mitra: ['mercurio', 'saturno'], shatru: ['luna', 'sole'], sama: ['marte', 'giove'] },
  saturno: { mitra: ['mercurio', 'venere'], shatru: ['sole', 'luna', 'marte'], sama: ['giove'] },
};

describe('la relazione naturale, BPHS 3.55', () => {
  it('ridà dalla regola la tavola di Santhanam, p. 40', () => {
    for (const [graha, riga] of Object.entries(TAVOLA)) {
      for (const relazione of ['mitra', 'shatru', 'sama'] as Maitri[]) {
        for (const altro of riga[relazione]) {
          expect(naisargikaMaitri(graha as BodyId, altro), `${graha} verso ${altro}`).toBe(relazione);
        }
      }
      // Sei relazioni per graha: tutti gli altri, nessuno due volte.
      expect([...riga.mitra, ...riga.shatru, ...riga.sama].sort()).toEqual(
        Object.keys(TAVOLA).filter((g) => g !== graha).sort(),
      );
    }
  });

  it('ha un verso: Saturno è sama per Marte, Marte è shatru per Saturno', () => {
    // L'esempio di Santhanam: Saturno è nemico di Marte perché governa l'11°
    // dall'Ariete, e amico perché governa il Capricorno, dove Marte esalta.
    expect(naisargikaMaitri('marte', 'saturno')).toBe('sama');
    expect(naisargikaMaitri('saturno', 'marte')).toBe('shatru');
  });

  it('non dice niente dei nodi né di un graha verso sé stesso', () => {
    expect(naisargikaMaitri('nodo-nord', 'sole')).toBeUndefined();
    expect(naisargikaMaitri('sole', 'nodo-sud')).toBeUndefined();
    expect(naisargikaMaitri('sole', 'sole')).toBeUndefined();
  });
});

describe('la temporanea, BPHS 3.56, e la composta, 3.57-58', () => {
  it('fa amici i graha nel 2°, 3°, 4°, 10°, 11° e 12°, e nemici gli altri', () => {
    const dallAriete = ['toro', 'gemelli', 'cancro', 'leone', 'vergine', 'bilancia',
      'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci'] as const;
    expect(dallAriete.map((s) => tatkalikaMaitri('ariete', s))).toEqual([
      'mitra', 'mitra', 'mitra', 'shatru', 'shatru', 'shatru', 'shatru', 'shatru', 'mitra', 'mitra', 'mitra',
    ]);
    // Nello stesso segno sono nemici: la prima casa non è fra quelle del verso.
    expect(tatkalikaMaitri('ariete', 'ariete')).toBe('shatru');
  });

  it('compone come la tavola di p. 42', () => {
    expect(panchadhaMaitri('mitra', 'mitra')).toBe('adhimitra');
    expect(panchadhaMaitri('sama', 'mitra')).toBe('mitra');
    expect(panchadhaMaitri('shatru', 'mitra')).toBe('sama');
    expect(panchadhaMaitri('mitra', 'shatru')).toBe('sama');
    expect(panchadhaMaitri('sama', 'shatru')).toBe('shatru');
    expect(panchadhaMaitri('shatru', 'shatru')).toBe('adhishatru');
  });
});

describe('nel tema vedico', () => {
  const NASCITA: BirthData = {
    date: '1968-03-12', time: '14:30', latitude: 40.8518, longitude: 14.2681, timezone: 'Europe/Rome',
  };

  it('dà le quarantadue coppie dei sette graha, con la fonte', () => {
    const carta = computeNatalChart(NASCITA, { zodiac: 'siderale', houseSystem: 'segni-interi' });
    const relazioni = computeRelationships(carta);
    expect(relazioni.pairs).toHaveLength(42);
    expect(relazioni.source).toContain('3.55-58');
    expect(computeJyotisha(carta).relationships).toEqual(relazioni);
  });

  it('nel tema di prova: Sole e Mercurio nello stesso segno, quindi nemici temporanei', () => {
    // Sole, Mercurio e Venere stanno tutti nell'Acquario siderale.
    const carta = computeNatalChart(NASCITA, { zodiac: 'siderale', houseSystem: 'segni-interi' });
    const coppia = computeRelationships(carta).pairs.find((p) => p.from === 'sole' && p.to === 'mercurio')!;
    expect(coppia).toEqual({ from: 'sole', to: 'mercurio', naisargika: 'sama', tatkalika: 'shatru', panchadha: 'shatru' });
  });
});
