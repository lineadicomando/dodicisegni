<!--
  Le condizioni di un istante secondo Lilly e il suo conto: l'ora planetaria,
  il rapporto col Sole, il moto, e i punti della tavola di Christian
  Astrology, p. 115, voce per voce.

  Prende le condizioni, non il tema: valgono per il tema natale e per il cielo
  di un istante, e le condizioni hanno già i nomi dei corpi.

  Il conto si mostra per esteso, con le due somme e la differenza come le
  scrive Lilly, e non come un numero solo: chi legge Lilly in un altro modo
  toglie una riga e rifà la somma. Le letture fatte dove il testo lascia una
  scelta stanno sotto, accanto alla fonte. La tabella non dice mai che cosa
  un punteggio significhi.
-->
<script lang="ts">
  import type { LillyConditions, LillyScoreRow, LillySolarState } from '@dodicisegni/core';
  import type { Evidenza } from '#lib/evidenza.svelte.js';
  import { BODY_GLYPH, BODY_LABEL, SIGN_GLYPH, SIGN_LABEL, ZODIAC_ORDER } from '@dodicisegni/ruota';
  import { formatDegrees, formatSignDegree } from '#lib/format.js';

  interface Props {
    conditions: LillyConditions;
    /** Il corpo isolato, condiviso con la ruota e con gli aspetti. */
    evidenza?: Evidenza;
  }

  let { conditions, evidenza }: Props = $props();

  const SOLE: Record<LillySolarState, string> = {
    cazimi: 'cazimi',
    combusto: 'combusto',
    'sotto-i-raggi': 'sotto i raggi',
    libero: 'libero',
  };

  const STELLE = { regolo: 'Regolo', spica: 'Spica', algol: 'Algol' } as const;

  const NOMI: Partial<Record<LillyScoreRow['item'], string>> = {
    triplicita: 'triplicità',
    'ricezione-domicilio': 'ricezione per domicilio',
    'ricezione-esaltazione': 'ricezione per esaltazione',
    libero: 'libero dal Sole',
    'sotto-i-raggi': 'sotto i raggi',
  };

  function riga(row: LillyScoreRow): string {
    let voce = NOMI[row.item] ?? row.item;
    if (row.item === 'casa') voce = `casa ${row.house}`;
    if (row.item === 'partile') voce = `partile ${row.aspect} ${row.with ? BODY_LABEL[row.with] : ''}`;
    if (row.item.startsWith('ricezione') && row.with) voce = `${voce} con ${BODY_LABEL[row.with]}`;
    if (row.item === 'stella' && row.star) voce = STELLE[row.star];
    if (row.item === 'segno' && row.sign) {
      voce = `in ${SIGN_LABEL[row.sign]}${row.with ? `, nei termini di ${BODY_LABEL[row.with]}` : ''}`;
    }
    if (row.item === 'aspetto') voce = `${row.aspect} ${row.with ? BODY_LABEL[row.with] : ''}`;
    if (row.item === 'termine' && row.with) voce = `termini di ${BODY_LABEL[row.with]}`;
    return `${voce} ${row.points}`;
  }

  /** Una longitudine come grado e glifo del segno. */
  function formatZodiacal(longitude: number): string {
    const sign = ZODIAC_ORDER[Math.floor(longitude / 30) % 12]!;
    return `${formatSignDegree(longitude % 30)} ${SIGN_GLYPH[sign]}`;
  }

  function ora(iso: string): string {
    return iso.slice(11, 16);
  }
</script>

<section>
  <h3 class="titolo-sezione">Condizioni secondo Lilly</h3>

  <ul class="istante">
    {#if conditions.hour}
      {@const h = conditions.hour}
      <li>
        Ora di <strong>{BODY_LABEL[h.ruler]}</strong>, {h.index}ª {h.diurnal ? 'diurna' : 'notturna'}
        del giorno di {BODY_LABEL[h.dayRuler]} ({ora(h.local.start)}-{ora(h.local.end)})
      </li>
    {/if}
    {#if conditions.ascendant}
      {@const a = conditions.ascendant}
      <li>
        Ascendente a {formatDegrees(a.signDegree)}{a.early
          ? ', nei primi tre gradi'
          : a.late
            ? ', negli ultimi tre gradi'
            : ''}
      </li>
    {/if}
    {#if conditions.moonInViaCombusta !== undefined}
      <li>Luna {conditions.moonInViaCombusta ? '' : 'non '}in Via Combusta</li>
    {/if}
    {#if conditions.stars}
      <li>
        Regolo {formatZodiacal(conditions.stars.regolo)}, Spica {formatZodiacal(conditions.stars.spica)},
        Algol {formatZodiacal(conditions.stars.algol)}
      </li>
    {/if}
    {#each conditions.missing as voce (voce)}
      <li class="tenue">Non calcolato: {voce}</li>
    {/each}
  </ul>

  <table>
    <thead>
      <tr>
        <th></th>
        <th>Corpo</th>
        <th class="numerico">Casa</th>
        <th>Dal Sole</th>
        <th>Fase</th>
        <th>Moto</th>
        <th>Antiscion</th>
      </tr>
    </thead>
    <tbody>
      {#each conditions.bodies as body (body.id)}
        <tr
          onmouseenter={() => evidenza?.sorvola(body.id)}
          onmouseleave={() => evidenza?.sorvola(null)}
          class:evidenziato={evidenza?.attivo === body.id}
        >
          <td class="glifo">{BODY_GLYPH[body.id]}</td>
          <td>{body.name}</td>
          <td class="numerico">{body.house ?? '—'}</td>
          <td>{body.sun ? `${formatDegrees(body.sun.distance)} ${SOLE[body.sun.state]}` : '—'}</td>
          <td>{body.phase ?? '—'}</td>
          <td>
            {[
              body.motion.pace,
              body.motion.direction === 'retrogrado' ? 'retrogrado' : '',
              body.peregrine ? 'peregrino' : '',
              body.besieged ? 'assediato' : '',
            ]
              .filter(Boolean)
              .join(', ')}
          </td>
          <td>{formatZodiacal(body.antiscion)}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <h4>Il conto di p. 115</h4>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>Corpo</th>
        <th>Fortezze</th>
        <th>Debilità</th>
        <th class="numerico">Differenza</th>
      </tr>
    </thead>
    <tbody>
      {#each conditions.bodies as body (body.id)}
        {@const { fortitudes, debilities, totals } = body.score}
        <tr
          onmouseenter={() => evidenza?.sorvola(body.id)}
          onmouseleave={() => evidenza?.sorvola(null)}
          class:evidenziato={evidenza?.attivo === body.id}
        >
          <td class="glifo">{BODY_GLYPH[body.id]}</td>
          <td>{body.name}</td>
          <td>{fortitudes.map(riga).join(', ') || '—'} <strong>= {totals.fortitudes}</strong></td>
          <td>{debilities.map(riga).join(', ') || '—'} <strong>= {totals.debilities}</strong></td>
          <td class="numerico">{totals.net > 0 ? '+' : ''}{totals.net}</td>
        </tr>
      {/each}
      <!-- La Parte di Fortuna ha la sua tavola, p. 145, e la stessa forma di
           conto: sta in coda, separata dai pianeti dalla sua riga di fonte. -->
      {#if conditions.partOfFortune}
        {@const fortuna = conditions.partOfFortune}
        <tr>
          <td class="glifo">⊗</td>
          <td>Fortuna <span class="tenue">{formatZodiacal(fortuna.longitude)}, casa {fortuna.house}</span></td>
          <td>{fortuna.score.fortitudes.map(riga).join(', ') || '—'} <strong>= {fortuna.score.totals.fortitudes}</strong></td>
          <td>{fortuna.score.debilities.map(riga).join(', ') || '—'} <strong>= {fortuna.score.totals.debilities}</strong></td>
          <td class="numerico">{fortuna.score.totals.net > 0 ? '+' : ''}{fortuna.score.totals.net}</td>
        </tr>
      {/if}
    </tbody>
  </table>

  <ul class="fonti">
    <li>{conditions.source}</li>
    {#each conditions.readings as lettura (lettura)}
      <li>Lettura: {lettura}</li>
    {/each}
    <li>Il contrantiscion è il punto opposto all'antiscion.</li>
    {#if conditions.partOfFortune}
      <li>
        La Parte di Fortuna è quella di Lilly, p. 144: Ascendente più Luna meno Sole, di giorno e di
        notte, anche dove il tema usa un'altra formula per la sua. Il suo conto è la tavola di p. 145.
      </li>
    {/if}
  </ul>
</section>

<style>
  h4 {
    margin: 1.25rem 0 0.5rem;
    font-size: 0.95rem;
  }

  .istante {
    padding-left: 1.1rem;
    margin: 0 0 0.75rem;
  }

  .fonti {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--testo-tenue);
  }

  .tenue {
    color: var(--testo-tenue);
  }
</style>
