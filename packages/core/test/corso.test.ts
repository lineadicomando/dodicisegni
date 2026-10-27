import { describe, expect, it } from 'vitest';
import { findSignCourse } from '../src/corso.js';
import { findElectionHours } from '../src/election.js';
import { ChartError } from '../src/errors.js';
import { resolveTime } from '../src/time.js';

const ROMA = { latitude: 41.9028, longitude: 12.4964 };

function istante(date: string, time: string): number {
  return resolveTime({ date, time, timezone: 'Europe/Rome' }).time.julianDayUT;
}

describe('findSignCourse', () => {
  // La sera del 27 ottobre 2026 la Luna è nel Toro: l'ultimo aspetto è il
  // quadrato a Giove delle 15:51, e alle 02:02 entra nei Gemelli.
  const corso = findSignCourse(istante('2026-10-27', '22:15'), 'luna', { timezone: 'Europe/Rome' });

  it('chiude la sequenza col cambio di segno', () => {
    expect(corso.sign).toBe('toro');
    const ultimo = corso.events.at(-1);
    expect(ultimo).toMatchObject({ kind: 'ingresso', sign: 'gemelli', from: 'toro', retrograde: false });
    expect(ultimo?.local).toBe('2026-10-28T02:02+01:00');
  });

  it("dice da che cosa il corpo si sta separando", () => {
    expect(corso.lastPerfected).toMatchObject({ kind: 'aspetto', with: 'giove', aspect: 'quadrato' });
    expect(corso.lastPerfected?.local).toBe('2026-10-27T15:51+01:00');
    expect(corso.entered! < corso.lastPerfected!.exact).toBe(true);
  });

  it('mette gli eventi in ordine, tutti dopo l istante', () => {
    const lunaPiena = findSignCourse(istante('2026-10-25', '12:00'), 'luna');
    const istanti = lunaPiena.events.map((event) => event.exact);
    expect(istanti).toEqual([...istanti].sort());
    expect(istanti.every((exact) => exact > lunaPiena.at)).toBe(true);
    expect(lunaPiena.events.filter((event) => event.kind === 'aspetto').length).toBeGreaterThan(0);
  });

  it('dà la Luna vuota moderna come il calendario elettivo', () => {
    // Lo stesso criterio, calcolato in due modi: il vuoto del calendario va
    // dall'ultimo aspetto all'ingresso, e il corso lo deve dire vuoto dentro
    // quel tratto e non vuoto prima.
    const { voids } = findElectionHours({ from: '2026-10-26', to: '2026-10-31', timezone: 'Europe/Rome' }, ROMA);
    expect(voids.length).toBeGreaterThan(1);
    for (const vuoto of voids) {
      const start = Date.parse(vuoto.start) / 86_400_000 + 2440587.5;
      const end = Date.parse(vuoto.end) / 86_400_000 + 2440587.5;
      const dentro = findSignCourse((start + end) / 2, 'luna');
      expect(dentro.voids.find((v) => v.school === 'moderno')?.void).toBe(true);
      expect(dentro.lastPerfected).toMatchObject({ with: vuoto.lastAspect?.body, aspect: vuoto.lastAspect?.aspect });
      const prima = findSignCourse(start - 1 / 24, 'luna');
      expect(prima.voids.find((v) => v.school === 'moderno')?.void).toBe(false);
    }
  });

  it('separa la Luna vuota di Lilly da quella moderna', () => {
    // Quando esce dal Toro la Luna non ha più aspetti esatti, ma sta formando
    // un sestile a Saturno entro le orbite: per p. 112 applica, e non è vuota.
    const [moderno, lilly] = corso.voids;
    expect(moderno).toMatchObject({ school: 'moderno', void: true });
    expect(lilly).toMatchObject({ school: 'lilly', void: false });
    expect(lilly?.applyingAtExit).toMatchObject({ with: 'saturno', aspect: 'sestile' });
    expect(lilly!.applyingAtExit!.orb).toBeLessThanOrEqual((12.5 + 10) / 2);
    expect(lilly?.source).toMatch(/p\. 112/);
  });

  it('porta le stazioni di un pianeta lento', () => {
    // Saturno nell'Ariete si ferma l'11 dicembre 2026 e torna diretto.
    const saturno = findSignCourse(istante('2026-10-27', '22:15'), 'saturno', { bodies: ['sole'] });
    const stazioni = saturno.events.filter((event) => event.kind === 'stazione');
    expect(stazioni.map((event) => (event.kind === 'stazione' ? event.direction : ''))).toContain('diretta');
    expect(saturno.events.every((event) => event.kind !== 'aspetto' || event.with === 'sole')).toBe(true);
  });

  it('rifiuta un corpo che non conosce', () => {
    expect(() => findSignCourse(istante('2026-10-27', '22:15'), 'vulcano' as never)).toThrow(ChartError);
  });
});
