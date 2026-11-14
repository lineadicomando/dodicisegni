# 50. Chiedere per nome il tempo medio del luogo

**Priorità bassa.** Segue la voce 42, chiusa con un'avvertenza: prima
dell'ora unica il motore legge l'ora come tempo medio della città che dà il
nome al fuso, e lo dice (`avvisoTempoMedio` in `packages/core/src/time.ts`).
Chi ha un atto del 1850 e sa che l'orologio seguiva il meridiano del luogo
oggi deve spostare l'ora a mano, quattro minuti per grado.

Come: un valore esplicito al posto del fuso (per esempio `timezone=locale`,
nome da decidere) che fa calcolare lo scarto dalla longitudine, `longitude /
15` ore. Il motore non sceglie: lo fa solo se glielo si chiede, e
`resolveTime` riceve già la longitudine nel `LocalMoment` di una nascita.
Dove il luogo manca (un arco, il cielo senza luogo) il valore si rifiuta.
Attraversa le superfici: vedi la skill `nuova-funzione`. Da decidere se il
tempo è medio o vero (con l'equazione del tempo): sono due richieste
diverse e, se entrano, entrano con due nomi.

**Versione**: **terza cifra**.

**Verifica**: Lecce, `1850-06-01 12:00`, col valore nuovo dà un istante di
ventitré minuti prima di quello con `Europe/Rome`, e nessuna avvertenza sul
tempo medio.
