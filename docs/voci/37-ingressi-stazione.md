# 37. Gli ingressi persi accanto a una stazione

**Priorità alta**, verificato. `findSignIngresses`
(`packages/core/src/sky-events.ts:51`) campiona al passo del moto medio e
cerca un ingresso solo dove il segno cambia fra due campioni. Quando un corpo
entra in un segno, staziona ed esce dentro un passo solo, i due
attraversamenti spariscono, e che spariscano dipende da dove cade `from`.

Il caso: Mercurio, 4 gennaio 1970 (entra in Acquario alle 04:20 UT, stazione
alle 08:10 a 0°00′09″, rientra in Capricorno alle 11:59).
`findSignIngresses({from, to: '1970-01-31', timezone: 'UTC'}, {bodies:
['mercurio']})` dà i due ingressi con `from` al 15 dicembre 1969 o al 3
gennaio 1970, e `[]` con `from` al 1°, al 2 o al 4 gennaio. Contro una
ricerca a passi di tre ore, fra il 1800 e il 2400, Mercurio perde tre coppie
(1970, 2244, 2348); da Venere a Plutone nessuna.

Come: fra due campioni dello stesso segno, cercare il massimo e il minimo
della longitudine quando la velocità cambia segno nel passo (le stazioni il
motore le trova già), e guardare se sta oltre il confine. `findSignCourse` e
il vuoto di corso partono dagli ingressi e ne ereditano.

*Dedotto*, da riprodurre prima di toccarlo: la stessa struttura (`g0 * g1 >
0` fra campioni al moto medio) sta in `passages.ts:149` e
`sky-passages.ts:199`, e vale allora per le perfezioni doppie accanto a una
stazione. In `passages.ts:71` il margine di campionamento è fisso: con `orbs`
larghe la `window` dei passaggi vicini ai bordi può mancare, e `attivi.ts`
lo allarga mentre i passaggi no.

**Versione**: **seconda cifra** (compaiono eventi che prima mancavano), e il
fascicolo canonico dice se li vede.

**Verifica**: una prova col caso del 1970 per ognuno dei cinque `from`, e una
che confronta con la ricerca a tre ore su un secolo di Mercurio.
