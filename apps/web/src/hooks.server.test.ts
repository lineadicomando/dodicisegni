import type { RequestEvent } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { handle, VERSION_HEADER } from './hooks.server';
import { VERSION } from './lib/version';

/** Fa passare dall'hook una risposta già pronta, come se l'avesse data la rotta. */
async function attraverso(percorso: string, risposta: Response): Promise<Response> {
  const event = { url: new URL(`http://localhost${percorso}`) } as RequestEvent;
  return handle({ event, resolve: () => Promise.resolve(risposta) });
}

describe("l'intestazione della versione", () => {
  it.each([
    ['il JSON', '/api/chart', Response.json({ chart: {} })],
    ['il testo compatto', '/api/chart', new Response('TEMA', { headers: { 'content-type': 'text/plain; charset=utf-8' } })],
    ['il disegno', '/api/chart/wheel', new Response(new Uint8Array([137, 80]), { headers: { 'content-type': 'image/png' } })],
    ['un errore', '/api/chart', Response.json({ code: 'DATA_NON_VALIDA' }, { status: 400 })],
  ])('sta su %s', async (_nome, percorso, risposta) => {
    const uscita = await attraverso(percorso, risposta);

    expect(uscita.headers.get(VERSION_HEADER)).toBe(VERSION);
    // La risposta è quella della rotta, con un'intestazione in più.
    expect(uscita.status).toBe(risposta.status);
  });

  it('non sta sulle pagine', async () => {
    const uscita = await attraverso('/metodo', new Response('<html>'));

    expect(uscita.headers.has(VERSION_HEADER)).toBe(false);
  });
});

describe('le intestazioni di sicurezza', () => {
  it.each(['/metodo', '/api/chart', '/?date=1968-03-12&time=14:30&locationId=3172394'])(
    'stanno su %s',
    async (percorso) => {
      const uscita = await attraverso(percorso, new Response('ok'));

      // Gli indirizzi portano una nascita: fuori dal sito non ne esce niente.
      expect(uscita.headers.get('referrer-policy')).toBe('same-origin');
      expect(uscita.headers.get('x-content-type-options')).toBe('nosniff');
    },
  );
});
