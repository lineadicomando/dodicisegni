# 47. Gli input del motore non validati

**Priorità bassa**, verificato dove non è detto altro. Nessuno di questi si
raggiunge dal sito o da MCP, che filtrano prima; valgono per chi importa
`@dodicisegni/core` e per la CLI.

- `orbs` non è validato (`orbite.ts:282`, `aspects.ts:118`): `limit <= 0 ||
  orb > limit` è falso con `NaN`, e `computeTransits(natal, momento, {orbs:
  {congiunzione: NaN}})` dà 154 congiunzioni con orbita fino a 178°. Un
  valore negativo spegne l'aspetto in silenzio;
- `normalize360(-1e-15) === 360` (`math.ts:8`): a valle `tithiOf` dà l'indice
  31, `yogaOf` 28, `karanaOf` 61, tutti senza nome, e `nakshatraOf` lancia.
  Parente: `nakshatraOf(226.66666666666666)` dà `pada: 0`
  (`nakshatra.ts:129`);
- un giorno giuliano `NaN` passa `typeof … === 'number'`
  (`computeBody`, `ephemeris.ts`): Sole con longitudine `NaN`, segno
  «ariete», nessun avviso. Si raggiunge da `findSignCourse` e
  `planetaryHourAt`, che prendono il giorno giuliano nudo;
- nessun tetto agli archi (`resolveRange`, `roots.ts:74`): solo
  `findElectionHours` e `findSignCourse` ne hanno uno. Trent'anni costano
  6,3 s a `findSkyPassages`; web e MCP tagliano a 1096 giorni da sé, la CLI
  (`passageRange`, `cli.ts:1270`) no;
- `computeVimshottari` non controlla `levels` a runtime: con 6 produce
  597.870 periodi in 6,8 s;
- `findIngress` (`corso.ts:283`) non inoltra `options.ephemerisPath`
  (*dedotto*).

**Versione**: da guardare caso per caso; il fascicolo canonico non dovrebbe
muoversi.

**Verifica**: una prova per riga.
