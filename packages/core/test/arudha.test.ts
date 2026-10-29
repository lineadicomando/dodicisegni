import { describe, expect, it } from 'vitest';
import { arudhaOf, bhavaLord, computeArudhas, PADA_NAMES } from '../src/arudha.js';
import { computeNatalChart } from '../src/chart.js';
import type { BodyId, ZodiacSign } from '../src/types.js';

type Segni = Partial<Record<BodyId, ZodiacSign>>;

describe('il signore dei bhava con due signori, BPHS 29.7 e 46.157-166', () => {
  it("rifà l'esempio di Santhanam, vol. II, p. 556: Rahu con la Luna vince Saturno da solo", () => {
    // Acquario ascendente; Saturno nello Scorpione da solo, Rahu nei Gemelli
    // con la Luna: «Rahu is associated with a planet».
    const segni: Segni = {
      saturno: 'scorpione', 'nodo-nord': 'gemelli', luna: 'gemelli', marte: 'toro',
      mercurio: 'acquario', giove: 'acquario', venere: 'acquario', sole: 'capricorno', 'nodo-sud': 'sagittario',
    };
    expect(bhavaLord('acquario', segni).lord).toBe('nodo-nord');
    expect(bhavaLord('acquario', segni).lordChoice).toContain('46.161-162');
  });

  it("prende quello fuori quando l'altro sta nel segno", () => {
    expect(bhavaLord('acquario', { saturno: 'acquario', 'nodo-nord': 'ariete' }).lord).toBe('nodo-nord');
    expect(bhavaLord('scorpione', { marte: 'leone', 'nodo-sud': 'scorpione' }).lord).toBe('marte');
  });

  it("prende l'esaltato prima di contare i graha", () => {
    // Marte nel Capricorno, la sua esaltazione, da solo; Ketu con due graha.
    const segni: Segni = { marte: 'capricorno', 'nodo-sud': 'toro', sole: 'toro', luna: 'toro' };
    expect(bhavaLord('scorpione', segni).lord).toBe('marte');
  });

  it("conta l'uccha di Rahu nel Toro, da 47.35", () => {
    // Rahu nel Toro da solo, Saturno nei Gemelli con due graha: senza l'uccha
    // dei nodi vincerebbe Saturno per 46.161-162.
    const segni: Segni = { 'nodo-nord': 'toro', saturno: 'gemelli', sole: 'gemelli', luna: 'gemelli' };
    expect(bhavaLord('acquario', segni)).toEqual({
      lord: 'nodo-nord',
      lordChoice: 'Uno dei due nel segno di esaltazione: si prende quello (46.164).',
    });
  });

  it('a pari graha guarda la natura del segno, poi la distanza', () => {
    // Saturno nel Cancro (cardinale), Rahu nella Vergine (mobile): vince il mobile.
    expect(bhavaLord('acquario', { saturno: 'cancro', 'nodo-nord': 'vergine' }).lord).toBe('nodo-nord');
    // Tutti e due in segni fissi, Toro e Leone: dall'Acquario il Leone è più lontano.
    expect(bhavaLord('acquario', { saturno: 'toro', 'nodo-nord': 'leone' }).lord).toBe('nodo-nord');
  });

  it('per gli altri segni non sceglie niente', () => {
    expect(bhavaLord('ariete', { marte: 'toro' })).toEqual({ lord: 'marte' });
  });
});

describe('gli arudha dei dodici bhava', () => {
  it('nel tema di prova', () => {
    const carta = computeNatalChart(
      { date: '1968-03-12', time: '14:30', latitude: 40.8518, longitude: 14.2681, timezone: 'Europe/Rome' },
      { zodiac: 'siderale', houseSystem: 'segni-interi' },
    );
    const arudha = computeArudhas(carta)!;
    expect(arudha.padas.map((p) => p.name)).toEqual(PADA_NAMES);
    // Lagna Cancro con la Luna nel lagna: il pada è il decimo, l'Ariete.
    expect(arudha.padas[0]).toMatchObject({ bhava: 1, sign: 'cancro', lord: 'luna', pada: 'ariete' });
    for (const p of arudha.padas) {
      const signore = carta.bodies.find((b) => b.id === p.lord)!;
      expect(p.pada).toBe(arudhaOf(p.sign, ['ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine', 'bilancia',
        'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci'][Math.floor(signore.longitude / 30)] as ZodiacSign));
      // Il pada non è mai il bhava stesso né il suo settimo.
      expect(p.pada).not.toBe(p.sign);
    }
    // Scorpione (quinto) e Acquario (ottavo) dicono come hanno scelto.
    expect(arudha.padas[4]!.lordChoice).toBeTruthy();
    expect(arudha.padas[7]!.lordChoice).toBeTruthy();
  });

  it('senza ora non ci sono', () => {
    const carta = computeNatalChart(
      { date: '1968-03-12', latitude: 40.8518, longitude: 14.2681, timezone: 'Europe/Rome' },
      { zodiac: 'siderale' },
    );
    expect(computeArudhas(carta)).toBeUndefined();
  });
});
