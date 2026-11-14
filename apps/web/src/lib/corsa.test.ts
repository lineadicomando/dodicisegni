import { describe, expect, it } from 'vitest';
import { Corsa } from './corsa';

describe('una richiesta alla volta', () => {
  it('chi parte annulla chi era partito prima, e non se stesso', () => {
    const corsa = new Corsa();
    const prima = corsa.parti();
    expect(prima.aborted).toBe(false);

    const seconda = corsa.parti();
    expect(prima.aborted).toBe(true);
    expect(seconda.aborted).toBe(false);
  });

  it('la risposta lenta della prima non copre quella della seconda', async () => {
    const corsa = new Corsa();
    let a_schermo = '';

    async function carica(valore: string, attesa: number): Promise<void> {
      const segnale = corsa.parti();
      await new Promise((fatto) => setTimeout(fatto, attesa));
      if (segnale.aborted) return;
      a_schermo = valore;
    }

    await Promise.all([carica('prima', 30), carica('seconda', 5)]);
    expect(a_schermo).toBe('seconda');
  });

  it('due corse non si annullano a vicenda', () => {
    const [una, altra] = [new Corsa(), new Corsa()];
    const segnale = una.parti();
    altra.parti();
    expect(segnale.aborted).toBe(false);
  });
});
