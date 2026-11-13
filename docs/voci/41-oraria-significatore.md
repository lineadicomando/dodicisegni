# 41. L'oraria con un significatore che manca

**Priorità media**, verificato. `computeHoraryLilly` esce con un `TypeError`
e non con un `ChartError` quando un significatore non è calcolabile:
`packages/core/src/oraria-lilly.ts:144` (`find(...)!`, anche alla riga 139).
`computeHoraryLilly({date: '3500-01-01', time: '12:00', timezone: 'UTC'},
roma, {question: {house: 7}})` → `Cannot read properties of undefined
(reading 'longitude')`: `DATE_PATTERN` ammette anni fino al 9999, Moshier
arriva al 3000. Le altre funzioni reggono: tema, cielo e transiti danno
avvisi; Jyotisha, panchanga e corso un `ChartError`.

**Versione**: **seconda cifra** (cambia un errore).

**Verifica**: una prova in `oraria-lilly.test.ts` che aspetta un
`ChartError` col suo `code`.
