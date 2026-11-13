# 38. Il reggitore del giorno letto nel fuso sbagliato

**Priorità alta**, verificato. `rulerOfDay`
(`packages/core/src/election.ts:421`, chiamata alle righe 182 e 244) legge il
giorno della settimana dell'alba nel `timezone` ricevuto. Il giorno
planetario è però del **luogo**: va dall'alba all'alba di chi sta lì. Se il
fuso passato non è quello del luogo, il giorno slitta.

Il caso: Tokyo, l'ora che comincia alle `2026-11-13T03:16Z` (venerdì a
Tokyo). `findElectionHours` con `timezone: 'Asia/Tokyo'` dà Venere; con
`'UTC'` o `'Europe/Rome'` dà Giove. Lo stesso in `computeSky` con
`dignitySchool: 'lilly'`, dove `dayRuler` entra nelle condizioni di Lilly.
Colpisce chi passa luogo e fuso separati: la CLI con `--tz` di sistema,
`/api/sky` con le coordinate e il fuso di chi scrive.

Come: il giorno della settimana dal tempo locale del luogo, cioè dall'alba in
UT più la longitudine (quindici gradi l'ora), che non chiede nessun fuso.

**Versione**: **seconda cifra**.

**Verifica**: una prova in `election.test.ts` con Tokyo e tre fusi, stesso
reggitore; il fascicolo canonico.
