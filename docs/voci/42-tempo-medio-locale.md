# 42. Il tempo medio locale prima dei fusi

**Priorità media, decisione del proprietario.** Prima che un paese adotti
l'ora unica, il database dei fusi dà il tempo medio locale della **città che
dà il nome al fuso**, non del luogo. `1850-06-01 12:00` con `Europe/Rome`
riceve 49,93 minuti di offset a Roma, a Lecce e a Torino, senza avviso; il
tempo locale vero di Lecce è 72,7 minuti e di Torino 30,8, cioè circa venti
minuti d'errore e parecchi gradi di Ascendente. Il commento di `resolveTime`
(`packages/core/src/time.ts`) lo presenta come gestito, e `/metodo` non ne
parla.

Da decidere: **correggere** (prima della data in cui il fuso smette di essere
LMT, usare la longitudine del luogo; ma `resolveTime` oggi riceve un
`LocalMoment` e non il luogo, e la data va presa dal database dei fusi) oppure
**dichiarare** (un'avvertenza quando l'offset del fuso è LMT, e una riga in
`/metodo`). La seconda è piccola e non sceglie al posto di chi calcola.

**Versione**: **seconda cifra** in entrambi i casi.

**Verifica**: una prova con le tre città nel 1850.
