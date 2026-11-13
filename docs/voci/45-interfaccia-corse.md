# 45. Il link e le risposte in corsa nell'interfaccia

**Priorità media.** Tutto *dedotto* dalla lettura: la revisione non ha
aperto un browser, e la prima cosa da fare è riprodurre ogni punto.

- **Il link di `/vedica` non ricostruisce il tema.**
  `apps/web/src/routes/vedica/+page.svelte:324` scrive nel link
  `dashaLevels`, `dashaYear`, `vargas`, `hora` e `drishtiNodes`; l'`onMount`
  (riga 190) rilegge solo `ayanamsa`. Chi apre un link fatto con
  `dashaYear=savana` vede altre date, senza segnale;
- **Link e lettura si compongono dal modulo, non dal tema a schermo**:
  `routes/+page.svelte:297` e `:312`, `vedica/+page.svelte:324` e `:331`,
  `transiti/+page.svelte:354`. Calcolare, cambiare la data nel modulo senza
  ricalcolare, premere «Copia link»: esce il link di un'altra nascita sotto
  il tema vecchio. `oraria/+page.svelte` lo evita già con `mostrati`;
- **Risposte vecchie sopra le nuove**, dove manca il contatore `ultima`:
  `transiti/+page.svelte:229` (`loadPassages`), `cielo/+page.svelte:212`
  (`loadCalendar`), `elezione/+page.svelte:171` (`load`, coi pulsanti ‹ ›
  delle righe 338–341 che non si disabilitano), e
  `lib/components/LocationSearch.svelte:80` (`search`), dove inoltre «Nessun
  risultato» compare nei 220 ms del debounce (riga 204).

Con la voce 36: un `AbortController` in `lib/api.ts` chiude le corse e
libera il pool insieme.

**Versione**: niente.

**Verifica**: in un browser, con la rete rallentata, i tre percorsi qui
sopra; una prova per la lettura dei parametri di `/vedica`.
