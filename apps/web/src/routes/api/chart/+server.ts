import { computeNatalChart, formatChartCompact } from '@dodicisegni/core';
import { error } from '@sveltejs/kit';
import { placeLabel, readBirth, readChartOptions } from '#lib/server/birth.js';
import { toHttpError } from '#lib/server/errors.js';
import { isHttpError } from '#lib/server/place.js';
import type { RequestHandler } from './$types';

/**
 * `GET /api/chart?date=1968-03-12&time=14:30&locationId=3172394`
 *
 * Su GET e non POST di proposito: un tema natale è una funzione pura dei suoi
 * parametri, quindi l'URL è condivisibile e la risposta memorizzabile.
 *
 * In alternativa a `locationId` si possono passare `latitude`, `longitude` e
 * `timezone`; la terna dev'essere completa, perché senza fuso orario non è
 * possibile convertire l'ora locale in Tempo Universale.
 *
 * Con `zodiac=siderale` le longitudini si contano dalle stelle fisse invece
 * che dal punto vernale: oltre ventiquattro gradi di differenza, quasi un
 * segno. `ayanamsa` sceglie la convenzione — `lahiri` (default),
 * `true-chitra`, `krishnamurti`, `raman`, `yukteshwar`, `fagan-bradley` — e
 * senza `zodiac=siderale` viene rifiutato invece che ignorato.
 *
 * Nel tropicale il tema porta le dignità occidentali (`chart.dignities`):
 * domicili nelle due convenzioni, esaltazioni, esili, cadute e ricezioni,
 * ciascuna con la sua fonte. `dignitySchool=lilly` aggiunge la tavola di Lilly
 * (1647) con triplicità, termini e facce, conta le ricezioni su tutte e
 * cinque le dignità, e porta in `chart.dignities.lilly.conditions` le
 * condizioni dell'istante e il conto della sua tavola delle fortezze (p. 115),
 * riga per riga. `dignitySchool=tolomeo` aggiunge invece le tavole del
 * *Tetrabiblos* (I.17-21, ed. Robbins) in `chart.dignities.tolomeo`: per ogni
 * corpo domicilio, esaltazione, i signori del triangolo e chi lo governa
 * nella setta, il termine della tavola greca di p. 106; niente facce, esilio
 * o punteggio, che Tolomeo non ha, e ricezioni solo per domicilio ed
 * esaltazione, perché la ricezione è di Lilly. `dignitySchool=bonatti` aggiunge
 * le tavole del *Decem tractatus* (tratt. II, Ratdolt 1491) in
 * `chart.dignities.bonatti`: domicilio, esaltazione col grado e i Nodi, i tre
 * signori della triplicità e chi la governa nella setta, termine tolemaico
 * col Leone di Saturno, faccia caldea, esilio e caduta; niente punteggio, e
 * ricezioni solo per domicilio ed esaltazione, perché quella di Bonatti
 * chiede un'applicazione. `dignitySchool=valente` aggiunge le tavole delle
 * *Anthologiae* (ed. Kroll) in `chart.dignities.valente`: domicilio,
 * esaltazione col grado, i tre signori del triangolo e il loro ordine nella
 * setta, termine egizio e caduta; niente Nodi, facce, esilio o punteggio, e
 * ricezioni solo per domicilio ed esaltazione. Un'altra scuola è
 * `SCUOLA_DIGNITA_NON_VALIDA`; chiesta insieme a `zodiac=siderale` è
 * `ZODIACO_NON_TROPICALE`, perché le tavole sono costruite sullo zodiaco
 * tropicale. Nel siderale le dignità
 * non ci sono: quelle di Parashara stanno in `/api/jyotish`.
 *
 * Gli aspetti si trovano con le orbite di una scuola nominata, che il tema
 * porta in `chart.orbConvention` con la fonte: `orbConvention=greene`
 * (default, la tavola predefinita di Astrodienst, di Liz Greene), `leo`
 * (Alan Leo, 1928) oppure `lilly` (Christian Astrology, 1647: le metà delle
 * orbite dei due pianeti, solo i sette e i cinque aspetti tolemaici). Un'altra
 * è `ORBITE_NON_VALIDE`. `minorAspects=true`
 * aggiunge i minori che la scuola tratta: Greene ha anche i quintili.
 *
 * Con `format=compact` il tema torna come tabella di testo invece che come
 * JSON. È la stessa resa che il server MCP dà ai suoi agenti — circa un
 * quarto della lunghezza, e leggibile anche da chi la incolla altrove — e per la stessa ragione
 * porta in testa il nome del luogo, che nel JSON sta in un campo a parte.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const { birth, place } = readBirth(url.searchParams);
    const chart = computeNatalChart(birth, readChartOptions(url.searchParams));

    if (readFormat(url.searchParams) === 'compact') {
      const intestazione = place.label ? `Luogo di nascita: ${place.label}\n` : '';
      setHeaders({ 'cache-control': 'private, max-age=86400' });
      return new Response(intestazione + formatChartCompact(chart), {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    // `private` e non `public`: la risposta è memorizzabile — un tema è una
    // funzione pura dei suoi parametri — ma solo dal browser di chi l'ha
    // chiesta. `public` autorizzerebbe le cache condivise (CDN, proxy
    // aziendali) a conservarla, e la chiave di quella cache è un indirizzo
    // che contiene data, ora e luogo di nascita.
    setHeaders({ 'cache-control': 'private, max-age=86400' });
    return Response.json({ chart, place: placeLabel(place) });
  } catch (cause) {
    // Gli errori già formati da `error()` hanno la propria risposta: si rilanciano.
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};

/**
 * In che forma va restituito il tema.
 *
 * Un valore non riconosciuto viene rifiutato invece che ricondotto al
 * predefinito, come nel disegno: chi scrive `format=testo` deve sapere di aver
 * sbagliato, non ricevere del JSON e credere che il parametro non esista.
 */
function readFormat(parameters: URLSearchParams): 'json' | 'compact' {
  const formato = parameters.get('format') ?? 'json';
  if (formato !== 'json' && formato !== 'compact') {
    throw error(
      400,
      `Formato "${formato}" non riconosciuto: attesi "json" oppure "compact".`,
      { code: 'FORMATO_NON_VALIDO' },
    );
  }
  return formato;
}
