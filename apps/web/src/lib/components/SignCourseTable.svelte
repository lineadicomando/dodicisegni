<!--
  Il corso di un corpo dall'istante della domanda al cambio di segno: gli
  aspetti tolemaici che perfeziona, le stazioni, l'ingresso nel segno dopo, e
  le due letture della Luna vuota, la moderna e quella di Lilly (p. 112),
  ciascuna col suo nome.

  Gli eventi sono moto, non scuole: i classificatori stanno sotto, e dove
  divergono si vede su che cosa.
-->
<script lang="ts">
  import type { CourseEvent, SignCourse } from '@dodicisegni/core';
  import { formatLocalInstant } from '#lib/format.js';
  import { BODY_GLYPH, BODY_LABEL, SIGN_LABEL } from '@dodicisegni/ruota';

  interface Props {
    course: SignCourse;
  }

  let { course }: Props = $props();

  function evento(e: CourseEvent): string {
    if (e.kind === 'aspetto') {
      const retro = e.retrograde.body ? ', retrogrado' : '';
      // La guardia: una risposta in cache può precedere il campo.
      const chi = !e.approaching
        ? ''
        : e.approaching.length === 2
          ? '; si vengono incontro'
          : e.approaching[0] === 'other'
            ? `; si avvicina ${BODY_LABEL[e.with]}`
            : '';
      return `${e.aspect} a ${BODY_LABEL[e.with]}${retro}${chi}`;
    }
    if (e.kind === 'stazione') return `stazione ${e.direction}`;
    return `entra in ${SIGN_LABEL[e.sign]}${e.retrograde ? ', all\'indietro' : ''}`;
  }
</script>

<section>
  <h3 class="titolo-sezione">
    <span class="glifo-piccolo">{BODY_GLYPH[course.body]}</span>
    Corso di {course.name} fino al cambio di segno
  </h3>
  {#if course.lastPerfected?.kind === 'aspetto'}
    <p class="riga tenue">
      Si separa da: {course.lastPerfected.aspect} a {BODY_LABEL[course.lastPerfected.with]},
      esatto il {formatLocalInstant(course.lastPerfected.local)}.
    </p>
  {/if}
  {#if course.events.length === 0}
    <p class="riga tenue">Nessun evento prima che la finestra si chiuda.</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Quando</th>
          <th>Che cosa</th>
        </tr>
      </thead>
      <tbody>
        {#each course.events as e, i (i)}
          <tr>
            <td class="quando">{formatLocalInstant(e.local)}</td>
            <td>{evento(e)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  {#each course.voids as v (v.school)}
    <p class="fonti">
      <strong>{v.name}: {v.void ? 'vuota di corso' : 'non vuota'}</strong>{v.applyingAtExit
        ? ` (esce dal segno applicando a ${BODY_LABEL[v.applyingAtExit.with]} di ${v.applyingAtExit.aspect})`
        : ''}. {v.rule}
      {v.note ?? ''}
    </p>
  {/each}
  {#each course.warnings as w, i (i)}
    <p class="fonti">{w}</p>
  {/each}
</section>

<style>
  .fonti {
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--testo-tenue);
  }

  .riga {
    margin: 0.25rem 0;
    font-size: 0.85rem;
  }

  .quando {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
</style>
