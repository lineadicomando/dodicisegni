import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SECTIONS } from './navigation';
import { SITE_NAME, SITE_TAGLINE } from './project';
import { PAGINE_PUBBLICHE, robotsTxt, sitemapXml, TITOLO_MASSIMO, titoloCompleto } from './seo';

const ORIGINE = 'https://esempio.it';

/** Gli indirizzi delle pagine sotto `routes/(informativa)`, dal disco. */
function pagineDiProsa(): string[] {
  const radice = new URL('../routes/(informativa)/', import.meta.url);
  return readdirSync(radice, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('+page.svelte'))
    .map((file) => `/${file.replace(/\/?\+page\.svelte$/, '')}`.replace(/\\/g, '/'));
}

describe('titoloCompleto', () => {
  it('mette la sezione prima e il sito dopo', () => {
    expect(titoloCompleto('Transiti')).toBe(`Transiti — ${SITE_NAME}`);
  });

  it('tiene ogni sezione dentro il troncamento', () => {
    for (const section of SECTIONS) {
      expect(titoloCompleto(section.label).length).toBeLessThanOrEqual(TITOLO_MASSIMO);
    }
  });

  // La pagina d'ingresso non si intitola col nome della sezione ma con
  // `SITE_TAGLINE`, che è la più lunga di tutte: se qualcuno la allunga
  // ancora, il titolo della home viene tagliato a metà nei risultati di
  // ricerca e nessuno se ne accorge guardando il sito.
  it('tiene la pagina d\'ingresso dentro il troncamento', () => {
    expect(titoloCompleto(SITE_TAGLINE).length).toBeLessThanOrEqual(TITOLO_MASSIMO);
  });

  // Le pagine di prosa scrivono il titolo dentro il file, e lì sono lunghi
  // apposta: portano i termini che si cercano.
  it('tiene ogni pagina di prosa dentro il troncamento', () => {
    for (const percorso of pagineDiProsa()) {
      const sorgente = readFileSync(new URL(`../routes/(informativa)${percorso}/+page.svelte`, import.meta.url), 'utf8');
      const titolo = /titolo="([^"]+)"/.exec(sorgente)?.[1];
      expect(titolo, `${percorso} non passa un titolo a Meta`).toBeDefined();
      expect(titoloCompleto(titolo!).length, percorso).toBeLessThanOrEqual(TITOLO_MASSIMO);
    }
  });
});

describe('PAGINE_PUBBLICHE', () => {
  it('contiene tutte le sezioni del menù', () => {
    for (const section of SECTIONS) {
      expect(PAGINE_PUBBLICHE).toContain(section.href);
    }
  });

  it('contiene le pagine di prosa, che sezioni non sono', () => {
    expect(PAGINE_PUBBLICHE).toContain('/metodo');
    expect(PAGINE_PUBBLICHE).toContain('/privacy');
  });

  // Le pagine di prosa si elencano a mano, e sono quelle che crescono: il
  // metodo ha messo figlie, il glossario ne ha tre. Una pagina nuova sotto
  // `(informativa)` che non entra nell'elenco non entra nella sitemap, e
  // nessuno se ne accorge leggendo il sito.
  it('contiene ogni pagina sotto routes/(informativa)', () => {
    for (const percorso of pagineDiProsa()) {
      expect(PAGINE_PUBBLICHE, `${percorso} manca da PAGINE_PUBBLICHE in lib/seo.ts`).toContain(percorso);
    }
  });

  it('non elenca niente due volte', () => {
    expect(new Set(PAGINE_PUBBLICHE).size).toBe(PAGINE_PUBBLICHE.length);
  });

  it('non porta parametri: un tema non è una pagina', () => {
    for (const percorso of PAGINE_PUBBLICHE) {
      expect(percorso).not.toContain('?');
    }
  });
});

describe('sitemapXml', () => {
  it('elenca ogni pagina pubblica con un indirizzo assoluto', () => {
    const xml = sitemapXml(ORIGINE);

    for (const percorso of PAGINE_PUBBLICHE) {
      expect(xml).toContain(`<loc>${new URL(percorso, ORIGINE).href}</loc>`);
    }
  });

  it('conta tante <url> quante sono le pagine', () => {
    const xml = sitemapXml(ORIGINE);
    expect(xml.match(/<url>/g)).toHaveLength(PAGINE_PUBBLICHE.length);
  });

  it('segue l\'origine che gli si dà, senza costanti scritte dentro', () => {
    expect(sitemapXml('http://localhost:3000')).toContain('http://localhost:3000/');
    expect(sitemapXml('http://localhost:3000')).not.toContain('esempio.it');
  });

  it('non dichiara date di modifica né priorità', () => {
    const xml = sitemapXml(ORIGINE);
    expect(xml).not.toContain('lastmod');
    expect(xml).not.toContain('changefreq');
    expect(xml).not.toContain('priority');
  });

  it('è XML ben formato', () => {
    const xml = sitemapXml(ORIGINE);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });
});

describe('robotsTxt', () => {
  it('chiude /api e nient\'altro', () => {
    const righe = robotsTxt(ORIGINE)
      .split('\n')
      .filter((riga) => riga.startsWith('Disallow:'));

    expect(righe).toEqual(['Disallow: /api/']);
  });

  it('non lascia fuori nessuna pagina pubblica', () => {
    const chiuse = robotsTxt(ORIGINE)
      .split('\n')
      .filter((riga) => riga.startsWith('Disallow: '))
      .map((riga) => riga.slice('Disallow: '.length));

    for (const percorso of PAGINE_PUBBLICHE) {
      expect(chiuse.some((chiusa) => percorso.startsWith(chiusa))).toBe(false);
    }
  });

  it('indica la sitemap con un indirizzo assoluto', () => {
    expect(robotsTxt(ORIGINE)).toContain(`Sitemap: ${ORIGINE}/sitemap.xml`);
    expect(robotsTxt('http://localhost:3000')).toContain(
      'Sitemap: http://localhost:3000/sitemap.xml',
    );
  });

  it('vale per tutti i crawler', () => {
    expect(robotsTxt(ORIGINE).startsWith('User-agent: *\n')).toBe(true);
  });
});
