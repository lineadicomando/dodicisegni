# TODO

Lavoro aperto, con dentro quello che serve per riprenderlo senza rifare
l'indagine che l'ha trovato. Non è un elenco di idee: ogni voce è una cosa nota,
con il file, la riga e il modo di verificarla.

I numeri delle voci sono stabili, perché altrove, anche nei messaggi di commit,
le voci si citano così. Una voce chiusa esce dal file e il suo numero non si
riusa; quello che aveva da dire o è finito nel codice, nei commenti e nei test,
o sta in uno dei due elenchi in fondo. L'ultima versione che le contiene tutte,
chiuse comprese, è `cf5219a`, quando il file si chiamava ancora `ROADMAP.md`.
Le voci chiuse dopo, con il commit in cui si leggono ancora per intero:

| Voci | Commit |
|---|---|
| 20 | `3314553` |
| 21 e 22 | `819ce59` |
| 23 | `db332a6` |
| 11 | `e194d45` |
| 13 | `e532f2f` |
| 7 | `955977b` |
| 9 | `8a04cfb` |
| 18 | `2b8937d` |
| 6 | `8aa31a9` |
| 8 | `c4c4820` |
| 24 | `bd489c8` |

Le fonti citate qui stanno in copia locale in `texts/`, fuori dal repo: la
cartella, le schede `FONTE.md` e l'elenco `texts/INDICE.md` si mantengono come
dice `CLAUDE.md` (*Le fonti testuali*). In una sessione nuova `texts/` può non
esserci, se il clone è un altro: le schede dicono da dove riscaricare ogni
fonte.

I riferimenti `file:riga` e i nomi citati sono stati ricontrollati tutti
contro il codice il 29 ottobre 2026, dopo la scuola di Tolomeo della voce 19
(`75cc895`). Le righe si spostano: se una non torna, il nome della funzione
o della costante accanto è quello che fa fede.

Prima di cominciare conviene che `npm test`, `npm run typecheck` e `npm run
lint` siano verdi. Le cose che fanno perdere tempo:

- se il typecheck di `apps/web` cade su `config.kit.paths.origin`,
  `node_modules` è indietro rispetto al lockfile e serve un `npm install`;
- `apps/web` e `packages/mcp` vedono `core` compilato, non i sorgenti: dopo
  un export nuovo serve `npm run build -w @dodicisegni/core`, e il server di
  sviluppo di Vite va riavviato, o risponde 500 dicendo che l'export non c'è;
- i test che leggono le stelle fisse vogliono `packages/core/ephe/sefstars.txt`,
  che `npm run ephe:download -w @dodicisegni/core` scarica (133 KB); senza,
  vengono saltati e non falliscono;
- `/api/jyotish` si fa memorizzare dal browser per un giorno
  (`private, max-age=86400`): provando la pagina `/vedica` dopo aver
  cambiato il motore, il browser può mostrare la risposta vecchia. Basta
  cambiare di un minuto l'ora nell'indirizzo. Per la stessa ragione i
  componenti di `/vedica` mettono una guardia sui campi nuovi
  (`{#if jyotisha.arudhas}`) anche dove il tipo li dà per presenti;
- la pagina `/vedica` legge il luogo solo da `locationId`
  (`/vedica?date=1968-03-12&time=14:30&locationId=3172394` è Napoli): con
  `latitude` e `longitude` mostra il modulo vuoto, mentre `/api/jyotish` li
  accetta tutti e due;
- `computeJyotisha` non è più una funzione della sola carta: per l'alba delle
  avastha (`stati.ts`) chiama `initEphemeris` e `lastSunrise` di
  `panchanga.ts`, con `JyotishaOptions.ephemerisPath` se c'è. Resta
  sincrona, e l'alba non usa i flag siderali.

Per spegnere il server di sviluppo lanciato in sottofondo si usa la porta
(`fuser -k 5173/tcp`), non `pkill -f` col numero della porta: il comando
contiene lo stesso numero e chiude anche la shell che lo lancia.

In fondo ci sono due elenchi che non sono lavoro: le decisioni prese, da non
riaprire, e le cose esaminate e lasciate stare, per non ritrovarle una seconda
volta e ricominciare da capo.

## Da dove ripartire

| Voce | Priorità | Taglia | Prima di cominciare |
|---|---|---|---|
| 19. Le dignità, per scuola | bassa | media | Jyotisha: fatto, restano rifiniture; occidente: Lilly e Tolomeo fatti; la prossima è Bonatti, da leggere sulle immagini |
| 17. L'astrologia oraria | bassa | piccola, ormai | i quattro lotti sono fatti; restano rifiniture indipendenti, una per riga |
| 5. I varga: le convenzioni che restano | bassa | piccola | i sedici sono fatti; restano rifiniture, una per riga |

L'ordine consigliato è quello della tabella. Firmico, Valente e Leo sono
in `texts/` con le pagine lette (voce 24, chiusa): la parte occidentale
della 19 parte da lì. Della 19, nel Jyotisha, sono fatti dignità (anche dei
nodi), varga buoni (nei due conti, Santhanam e Narasimha Rao), relazioni,
vimshopaka, arudha dei bhava e dei graha, e gli stati di 6.53; restano
rifiniture senza urgenza. Nell'occidente ci sono Lilly e, dal 29 ottobre
2026, Tolomeo; la prossima scuola è Bonatti. La 17 usa le tavole di Lilly della 19 e ha
già le *moieties* come terza convenzione delle orbite.

**Come si è lavorato nel Jyotisha, e conviene continuare.** Ogni regola si
legge sull'immagine della pagina (`pdftoppm`, vedi le schede `FONTE.md`), si
trascrive in `trascrizioni.md` col sanscrito traslitterato e la traduzione,
e si prova contro una tavola o un esempio svolto della fonte, ricopiati nel
test. Dove il testo lascia due strade si cerca chi le percorre, con un nome
e un testo; se l'alternativa non ha un autore resta fuori e lo si scrive; se
ce l'ha, la scelta si fa fare al proprietario prima del codice, e finisce in
*Deciso*. Ogni risultato porta la sua fonte e le sue letture in un campo
`source` o `rule`, e arriva a cinque superfici: la tabella compatta
(`format.ts`), la pagina `/vedica` (un componente per sezione), la
descrizione di `compute_jyotisha_chart` (`packages/mcp/src/tools.ts`), il
documento di lettura (`packages/lettura/src/jyotisha.ts`, con le prove in
`lettura.test.ts`) e, quando è una convenzione, `/metodo/varga`.
Quest'ultima nessun test la confronta con la prosa, ed è quella che si
dimentica: il 29 ottobre 2026 diceva ancora il 6.53 «non verificato». Dalla
riga di comando la tabella compatta si vede con `--zodiaco siderale
--lettura --sistema jyotisha`.

## 5. I varga: le convenzioni che restano

**Priorità bassa.** I sedici varga del BPHS, cap. 6, sono calcolati tutti, in
`packages/core/src/varga.ts` (il D-2 con le sue convenzioni in `hora.ts`), in
quattro passaggi del 28 ottobre 2026: D-4 e D-7 (`097ae59`), il D-2
(`a828b3f`), D-16, D-20 e D-24 (`87fb824`), D-40, D-45 e D-60
(`178f01d`). Ogni regola è stata letta sull'immagine di Santhanam, vol. I,
pp. 68-86, sanscrito compreso, e ogni
tavola stampata è ricopiata in `packages/core/test/varga.test.ts` e
confrontata con la regola (`controllaTavola`, `tavolaPerGruppi`). Le
trascrizioni stanno in `texts/jyotisha/bphs-santhanam-1992-vol1/trascrizioni.md`.
Due cose da ricordare: la tavola del D-27 a p. 79 ha un refuso (Gemelli,
undicesima parte), e il D-20 scambia fissi e mobili rispetto al D-16 nel
verso stesso (*cāpān mṛgendrād*).

Il D-60 si conta dal segno stesso (vedi *Deciso*), e il D-40, il D-45 e il
D-60 portano `warnings`: di quanti minuti l'ora di nascita dovrebbe sbagliare
perché lagna e Luna cambino segno, calcolato sulla carta con la velocità
dell'Ascendente (`ascendantDegreesPerMinute`, dal tempo siderale locale, la
latitudine e l'obliquità media). Le avvertenze salgono in
`JyotishaChart.warnings` e le stampa `formatVargaCompact`. Quali varga
siano «fini» lo dice il campo `fine` di `VARGAS`.

### Che cosa resta

Ciascuna indipendente dalle altre.

- **Le altre convenzioni della hora.** La parivritti-dvaya, la Kashinatha,
  la Uma-Shambhu, quella di Raman Suprajarama: regole e casi di controllo
  nelle schede `FONTE.md` di `texts/jyotisha/narasimha-rao-*`,
  `suprajarama-*` e `texts/tecnica/pyjhora`. Una convenzione che dà un segno
  fisso per luminare è una voce di `HORA_CONVENTIONS` con `signOf`; quelle
  che danno un segno diverso per segno di partenza (la Kashinatha, la
  parivritti-dvaya) vogliono una funzione al posto di `signOf`. Le liste di
  CLI, API e MCP derivano da `HORA_CONVENTIONS`; il menù di
  `JyotishaSettings.svelte` no, ed è scritto a mano. La forma del D-2 nel
  risultato: `VargaChart` è un'unione col discriminante `kind`,
  `SignVargaChart` (`'segni'`) e `HoraVargaChart` (`'signori'`, il solo D-2
  di Parashara, rifiutato dal quadro con `VARGA_SENZA_SEGNI`).
- **L'avvertenza anche sul D-24 e sul D-27?** Le loro parti sono di poco più
  di un grado (1°15' e 1°6'40"), che l'Ascendente attraversa in cinque o sei
  minuti. Oggi la soglia è «meno di un grado»; se allargarla è una scelta, e
  costa una riga (`fine: true`).
- **I sessanta nomi del D-60** (Ghora, Rakshasa…, BPHS 6.34-40, tavola alle
  pp. 84-86, trascritta in sintesi): oggi non sono riportati, e
  `/metodo/varga` lo dice. Se entrano, entrano come nome, rovesciati nei
  segni pari, e senza il giudizio benefico o malefico del verso 41.

Per chi aggiunge un varga o una variante: l'elenco che le superfici accettano
si legge da `VARGAS` (server MCP, le due rotte `api/jyotish`, la CLI).
L'interfaccia ha una copia, `apps/web/src/lib/varghe.ts`, che lascia fuori la
D-1 apposta; `apps/web/src/lib/elenchi.test.ts` e
`apps/web/src/routes/(informativa)/metodo/jyotisha.test.ts` cadono finché la
copia e la tavola di `/metodo/varga` non combaciano con `VARGAS`, **anche
nell'ordine**. Nessun test vede invece i testi che li elencano: il commento
delle due rotte, l'aiuto di `--varga` (`packages/core/src/cli.ts:119`), la
descrizione dei parametri `vargas` e `varga` in `packages/mcp/src/tools.ts`,
il rimando in `/metodo` (voce `#varga`), la pagina `/metodo/varga` con la sua
descrizione in `Meta`, e il commento sopra `VargaId` in `types.ts`. Un varga
fuori dai sedici del BPHS fa cadere anche `varga-buoni.test.ts`, che
pretende `VARGA_SCHEMES.shodashavarga` uguale a `VARGAS`: gli schemi e i
pesi del vimshopaka (`VIMSHOPAKA_WEIGHTS`) sono quelli del testo, e un varga
nuovo non ci entra.

## 17. L'astrologia oraria

**Priorità bassa.** Il lavoro pianificato è fatto, in quattro lotti, il 27
ottobre 2026; restano rifiniture indipendenti, elencate sotto. Il metodo è
quello di William Lilly, *Christian Astrology* (1647), e ogni regola nel codice
porta la pagina del libro.

### Che cosa c'è

| Strato | File | Commit | Che cosa fa | Prova |
|---|---|---|---|---|
| A, condizioni di un istante | `packages/core/src/condizioni-lilly.ts` | `da88a36`, `cc80d1e` | per i sette: casa con la regola dei cinque gradi (p. 33), Sole (cazimi, combusto, raggi, p. 113), moto rispetto al moto medio di Lilly (pp. 57-80), orientale e occidentale (p. 114), partili (p. 106), assedio, peregrino, Regolo, Spica e Algol, antiscion (p. 90), e il conto della tavola di p. 115 con fortezze, debilità e differenza; per l'istante, l'ora planetaria (`planetaryHourAt` in `election.ts`), i gradi dell'Ascendente e la Via Combusta (p. 122). Sta in `WesternDignities.lilly.conditions` | `test/condizioni-lilly.test.ts`, sulla figura del 1634 |
| B, il corso fino al cambio di segno | `packages/core/src/corso.ts` | `916b711`, `dfd9a67` | `findSignCourse`: aspetti tolemaici esatti, stazioni e ingresso di un corpo dall'istante al cambio di segno, le separazioni da quando è nel segno, un limite `until`; sopra, la Luna vuota moderna e quella di Lilly (p. 112). Le *moieties* sono la convenzione `lilly` di `orbite.ts` | `test/corso.test.ts`, `test/aspects.test.ts` |
| C, la scuola di Lilly | `packages/core/src/oraria-lilly.ts` | `2433924` | `computeHoraryLilly(moment, place, { question: { house, derivedFrom? } })`: figura col Regiomontano, significatori (pp. 123-124), e i classificatori puri di `classifyLilly` (congiunzione e aspetto p. 125, traslazione e collezione p. 126, proibizione e frustrazione pp. 110-113, refranazione p. 111); le considerazioni di pp. 121-123 come predicati, con le nature dei pianeti del libro I | `test/oraria-lilly.test.ts`: gli esempi del libro I scritti a mano, e la traslazione della Luna della domanda del 1634 (p. 182) |
| D, le superfici | `packages/mcp/src/tools.ts` (`registerComputeHorary`), `prompts.ts` (`registerLetturaOraria`), `packages/lettura/src/oraria.ts`, `apps/web/src/routes/api/horary/+server.ts` | `ec58bdf` | il tool `compute_horary`, il prompt `lettura_oraria`, il documento `ORARIA` (fuori da `SISTEMI`), `GET /api/horary` | `packages/mcp/test/server.test.ts`, `packages/lettura/test/lettura.test.ts` |

Dalla riga di comando: `--dignita lilly` col tema o con `--sky`, `--sky
--corso <corpo>`, `--oraria <casa>` con `--derivata`. Con una longitudine
negativa va scritta col segno uguale, `--lon=-0.1278`, o `parseArgs` la prende
per un'opzione.

Le scelte fatte dove il testo lascia due strade non stanno qui: viaggiano col
risultato e si leggono nel codice, in `LILLY_CONDITIONS_READINGS`, nella
`rule` dei classificatori di `corso.ts` e in `HORARY_LILLY_READINGS`. Quelle che
più facilmente si vorranno rivedere:

- dove l'esempio svolto di pp. 177-180 non segue la sua tavola, il motore segue
  la tavola: Mercurio, Luna e Giove entro 17° dal Sole sono sotto i raggi
  (Lilly li dà liberi), Giove orientale prende 2 e il Sole diurno la
  triplicità che Lilly non conta. Il test lo tiene scritto;
- Regolo entro 5° come Spica e Algol (Lilly scrive «within six degrees», ma
  allora conterebbe Regolo alla Luna, e non lo fa);
- le *moieties* sono la prima colonna di p. 107, quella che Lilly dice sua;
- la Luna vuota di Lilly non pretende «separated from a Planet»;
- la Luna può proibire come ogni altro pianeta;
- traslazione e collezione si riconoscono anche senza la ricezione di p. 126,
  che è riportata e la cui mancanza è detta.

### Che cosa resta

Ciascuna indipendente dalle altre.

- **La pagina web.** «Solo se le tabelle reggono da sole»: la resa compatta
  regge, ma l'interfaccia non ha un modulo per la domanda, e la casa va scelta
  da un elenco che spieghi le dodici case (la descrizione di `compute_horary`
  ne nomina sei, ed è un punto di partenza). La rotta c'è già.
- **Le condizioni di qualità della perfezione**, p. 125: per il quadrato
  «each Planet have dignity», per l'opposizione la mutua ricezione per
  domicilio, e «out of good Houses». I dati sono tutti nel risultato
  (`chart.dignities.lilly`); il classificatore non li incrocia ancora, e il
  documento di lettura li chiede al lettore.
- **La Parte di Fortuna nel conto.** Lilly la conta a p. 180 («in ♍ hath five
  Debilities», con rimando a p. 145, da leggere). `condizioni-lilly.ts` conta
  solo i sette.
- **Chi applica a chi nel corso dei pianeti lenti.** Il corso di Saturno elenca
  anche i passaggi della Luna su di lui, che sono applicazioni della Luna.
  `classifyLilly` lo risolve col peso (`peso`, ordine caldeo); il corso no, e
  `bodies` serve a restringerlo.
- **La Luna come proibitore.** Perfeziona con tutti ogni pochi giorni: su
  figure reali potrebbe dare proibizioni ovunque. Se succede, è il primo posto
  da guardare, con la lettura scritta in `HORARY_LILLY_READINGS`.
- **Il cielo con la scuola sulle superfici**: `computeSky` ha
  `dignitySchool`, ma `/api/sky` e `compute_sky` no. Con `compute_horary`
  forse non servono più; deciderlo prima di farlo.
- **Il corso come superficie a sé**: `findSignCourse` arriva agli agenti solo
  dentro `compute_horary`. Un tool suo servirebbe a chi chiede «la Luna è
  vuota di corso?» senza una domanda oraria; `find_election_hours` risponde già
  col criterio moderno.
- **Altre figure del libro II** per la verifica: finora solo quella del 1634.
  Ogni figura porta data, ora e luogo; vanno scelti casi lontani dai confini,
  perché le effemeridi di Lilly sbagliano di qualche primo.

### Deciso

Il 18 ottobre 2026:

- **Le scuole sono pacchetti, e la prima è Lilly.** Un substrato neutro, il
  corso di `corso.ts`, con sopra le scuole, ciascuna intera e nominata nel
  risultato. Una scuola nuova è un file accanto a `oraria-lilly.ts`, non una
  modifica.
- **Il documento di lettura ha un registro attribuito**: «secondo il metodo di
  Lilly la figura indica…». È l'unico che risponde; salute, morte, questioni
  legali e finanziarie le rifiuta dicendo perché.
- **Le dignità stanno nel punto 19.**

Il 27 ottobre 2026, facendolo:

- **La casa del quesito è un input**, obbligatorio, anche derivata. Il motore
  non la sceglie, e le descrizioni dicono all'agente di chiederla se la
  domanda non la indica.
- **Le considerazioni prima del giudizio sono predicati, mai un rifiuto**;
  quelle senza una soglia nel testo restano «non calcolate» e lo dicono.
- **Non entrano il sì o il no né la conversione dei gradi in giorni**: li fa
  chi legge, e `ORARIA` dice come li faceva Lilly (p. 110 per il tempo).
- **`ORARIA` non è un valore di `SISTEMI`**: quelli leggono una nascita, e il
  prompt del tema natale applicherebbe le istruzioni di una domanda a un tema.
- **Il pool dei worker non serve**: una domanda di oggi costa due decimi di
  secondo. La figura del 1634 ne costa quasi due, ma gira solo nei test.

### Le fonti

*Christian Astrology* in `texts/occidentale/lilly-christian-astrology-1647`
(archive.org `b30338724`, pubblico dominio): 41 pagine lette in `pagine/`,
trascritte in `trascrizioni.md`, l'elenco per lotto in `FONTE.md`. Nel PDF
locale la pagina stampata N è la N + 34, verificato fino a p. 182: `pdftoppm
-f $((N+34)) -l $((N+34)) -r 250 -jpeg -singlefile scansione.pdf pagine/pNNN`.
Da p. 182 la numerazione stampata è disordinata (186, 185, 184, 185 di
seguito): oltre, la pagina si conta sul PDF e si dice. Da leggere: p. 91
(il contrantiscion, che il codice ricava come punto opposto all'antiscion) e
p. 145 (la Parte di Fortuna).

**I numeri si leggono sulla scansione, non sui siti**: la trascrizione in rete
(Houlding, Skyscript) è protetta, e le fonti secondarie non concordano. Il
«Marte 8°» che circola per Lilly è di al-Biruni (§436, trad. Wright 1934, in
`texts/occidentale/biruni-elements-of-astrology-wright-1934`).

Il catalogo delle stelle è `sefstars.txt` di Swiss Ephemeris, scaricato da
`npm run ephe:download -w @dodicisegni/core` in `packages/core/ephe/` e
copiato in `texts/tecnica/swiss-ephemeris/dati/`. Senza, le righe delle stelle
mancano dal conto e `missing` lo dice; i test della figura del 1634 vengono
saltati (`describe.skipIf`), e nel CI il file c'è.

### Le scuole che verranno

Note, non pianificate. Ciascuna è un classificatore sul corso di `corso.ts` e
un pacchetto di tavole nel punto 19.

- **La linea araba e medievale**: Māshā'allāh e Sahl ibn Bishr, poi Bonatti
  (*Decem tractatus astronomiae*, Ratdolt 1491, col trattato sulle
  interrogazioni; scaricato in `texts/occidentale/bonatti-decem-tractatus-1491`,
  copia della Biblioteca Jagellonica: l'OCR dell'incunabolo è inutile e si
  legge sulle immagini). Termini egizi, le sei negazioni della perfezione
  (refranazione, evasione, proibizione, abscissione, contrarietà, ritorno della
  luce), che non coincidono coi nomi di Lilly. Le traduzioni latine medievali
  sono di pubblico dominio, quelle inglesi moderne (Dykes) no.
- **Il prashna del Jyotisha.** Il *Prasna Marga* (Kerala, XVII secolo), e
  soprattutto la Krishnamurti Paddhati (KP), la più calcolabile: il
  consultante dà un numero da 1 a 249 che fissa il grado dell'Ascendente, e i
  sotto-signori si ricavano dalle proporzioni vimshottari che il motore ha già
  in `nakshatra.ts` e `dasha.ts`. Va verificato lo stato dei diritti sui libri
  di Krishnamurti; la regola si ricalcola dalla definizione.

## 19. Le dignità, per scuola

**Priorità bassa**, ora che il tropicale è fatto per intero. Viene dal punto
17, che ne ha bisogno, ma vale da sola: le dignità servono al natale letto
alla maniera tradizionale e al Jyotisha. Il Jyotisha è fatto, salvo
rifiniture; restano le scuole occidentali le cui fonti non sono ancora state
lette per intero, e la prima candidata è Tolomeo (sotto, *Che cosa resta*).

### A che punto è

Fatto per il tema tropicale, in `2feb3be` e `ac7c553`.
`packages/core/src/dignita.ts` tiene domicili (tradizionali e moderni),
esilio, esaltazione e caduta, con le fonti e le pagine nei commenti;
`packages/core/test/dignita.test.ts` le prova contro le tavole delle fonti,
ricopiate indipendentemente. La sezione DIGNITÀ di `format.ts`
(`dignityLines`) porta le due colonne dei signori con le case e, in coda, una
riga per convenzione con chi è in domicilio, esaltazione, esilio o caduta.
`packages/lettura/src/tropicale.ts` manda lì il modello invece di fargliele
ricavare dal segno, e `lettura.test.ts` lo verifica.

Che cosa la sezione porta, e perché così:

- **domicili** in due colonne mai fuse. La tradizionale, dei sette pianeti, è
  comune alle scuole antiche; la moderna dà lo Scorpione a Plutone, l'Acquario
  a Urano, i Pesci a Nettuno, e dichiara di non avere un autore unico;
- **esilio** in tutte e due: il segno opposto al domicilio. Nella tradizionale
  ha una fonte, la colonna Detriment di Lilly; nella moderna è la stessa
  regola sull'altra tavola, e la riga lo dice. È così che Saturno in Leone è in
  esilio per una colonna e non per l'altra;
- **esaltazione e caduta** solo nella tradizionale, **per segno e senza
  gradi**: è la parte su cui Tolomeo, Firmico e Lilly concordano. I gradi e
  le esaltazioni dei Nodi vengono col pacchetto di Lilly. Per Urano, Nettuno
  e Plutone nessuna esaltazione ha un autore, e non entrano.

Fatto anche per il Jyotisha, in `15e79a3`. `packages/core/src/dignita-parashara.ts` tiene
uccha col grado più profondo, neecha nel settimo segno, moolatrikona e segno
proprio secondo il BPHS, e `computeJyotisha` le mette in `JyotishaChart.dignities`,
quindi nel JSON del tema vedico, non in `NatalChart`. La sezione DIGNITÀ
(PARASHARA) di `formatJyotishaCompact` porta la fonte, i signori dei segni, le
esaltazioni e una riga per graha; su `/vedica` le mostra
`ParasharaDignityTable.svelte` (`c6faa27`), un componente separato da
`DignityTable.svelte` apposta. `packages/lettura/src/jyotisha.ts` manda lì
invece di ricopiare i domicili. Prove in
`packages/core/test/dignita-parashara.test.ts` e in `lettura.test.ts`.

Il resto del Jyotisha, del 28 e del 29 ottobre 2026, tutto con le scelte del
proprietario in *Deciso*:

| Che cosa | Dove | Commit | Fonte, e la prova |
|---|---|---|---|
| In ogni varga, in quali segni di uccha, moolatrikona, proprio e neecha cade il graha, per segno e tutte le corrispondenze | `parasharaSignDignities` in `dignita-parashara.ts`, campo `dignitySigns` di `SignVargaChart` con `dignitySource` | `8b09b74` | BPHS 6.52, p. 88; la tavola intera in `dignita-parashara.test.ts` |
| I varga buoni contati nei quattro schemi, col nome del conto | `varga-buoni.ts`, `JyotishaChart.goodVargas`, `GoodVargaTable.svelte` | `ef95829` | 6.42-53 e 7.17-20, pp. 87-96; `varga-buoni.test.ts` |
| Le relazioni fra i graha, naturale, temporanea e composta | `maitri.ts`, `JyotishaChart.relationships`, `RelationshipTable.svelte` | `a3840d3` | 3.55-58, pp. 40-42; la regola ridà la tavola di p. 40 in `maitri.test.ts` |
| Il vimshopaka nei quattro schemi | `vimshopaka.ts`, `JyotishaChart.vimshopaka`, `VimshopakaTable.svelte` | `0f511f3` | 7.17-27, pp. 95-99; l'esempio di Venere (New Delhi 1984, 16,8) in `vimshopaka.test.ts` |
| Gli arudha dei dodici bhava, coi due signori di Scorpione e Acquario | `arudha.ts` (`arudhaOf`, `bhavaLord`), `JyotishaChart.arudhas`, `ArudhaTable.svelte` | `f8c34a2` | 29.1-7, vol. I pp. 294-297, e 46.157-166, vol. II pp. 553-556; gli esempi di Santhanam in `arudha.test.ts` |
| Le dignità di Rahu e Ketu, per segno e senza neecha | `parasharaNodeDignities` in `dignita-parashara.ts`, campo `signDignities` dei nodi in `ParasharaDignities.grahas`, `ParasharaDignityTable.svelte` | `a38314c` | 47.34-36, vol. II pp. 581-582; il verso ricopiato in `dignita-parashara.test.ts` |
| Combustione, guerra planetaria e avastha, le condizioni di 6.53 | `stati.ts`, `JyotishaChart.states`, i campi `combust` e `defeated` di `GoodVargas.grahas`, `GrahaStatesTable.svelte` | `2a17fa6`, `294f6b3` | *Surya Siddhanta* IX.6-9, X.1, VII.12 e 19-23 (Burgess 1860); BPHS 79.9 e 45.30-33; l'esempio delle avastha di Santhanam (p. 455) in `stati.test.ts` |
| Il conto dei varga buoni di Narasimha Rao, accanto a quello di Santhanam | `narasimhaRaoGoodVargas` in `varga-buoni.ts`, campo `narasimhaRao` di `GoodVargas.grahas` | `a75189e`, `5bb3807` | Rao (2000), §6.6, pp. 63-65; il Giove di Bill Cosby in `varga-buoni.test.ts` |
| L'uccha dei nodi di 47.35 nella scelta del signore dell'arudha (46.164) | `bhavaLord` in `arudha.ts` | `b35e20e` | `arudha.test.ts` |
| Gli arudha dei nove graha secondo Narasimha Rao, con rasi drishti, segno più forte e co-signore più forte | `arudha-graha.ts`, `JyotishaChart.grahaArudhas`, `GrahaArudhaTable.svelte` | `277c300`, `f18f6b5` | Rao (2000), §9.5, 10.3, 15.5.1-2 e tavola 6; l'esempio 30 per tutti e nove i graha in `arudha-graha.test.ts` |

Senza ora di nascita `goodVargas` (e con lui il conto di Rao), `arudhas` e
`states.avasthas` mancano, e un'avvertenza lo dice per ciascuno; relazioni,
vimshopaka, combustione, guerra e arudha dei graha ci sono comunque. Le
sezioni della tabella compatta, nell'ordine: DIGNITÀ (PARASHARA), RELAZIONI
FRA I GRAHA, VIMSHOPAKA, ARUDHA DEI BHAVA, ARUDHA DEI GRAHA (NARASIMHA RAO),
VARGA BUONI, STATI DEI GRAHA (BPHS 6.53); sulla pagina `/vedica` un
componente per ciascuna (`GrahaArudhaTable.svelte` e `GrahaStatesTable.svelte`
sono gli ultimi). `/metodo/varga` (`#buoni`) racconta i due conti e il 6.53;
gli arudha e le dignità di Parashara in `/metodo` non ci sono, né prima né
ora.

I testi letti stanno in `texts/jyotisha/bphs-santhanam-1992-vol1/trascrizioni.md`
(sezioni «3.55-58», «6.42-53», «7.17-27», «29.1-5, 7.17-25», «La combustione
e la guerra nelle note di Santhanam», «45.30-37»),
`texts/jyotisha/bphs-santhanam-1992-vol2/trascrizioni.md` («46.157-166»,
«47.34-36 e 41», «79.9»), `texts/jyotisha/surya-siddhanta-burgess-1860/trascrizioni.md`
e `texts/jyotisha/narasimha-rao-vedic-astrology-integrated-approach-2000/trascrizioni.md`.
Le cose trovate leggendo, che il codice tiene scritte:

- la traduzione di 6.53 omette *nīcagā*;
- il secondo esempio delle note di Santhanam sull'arudha (p. 296) contraddice
  il verso, e il motore segue il verso;
- nel saptavarga il verso 7.18 non assegna i pesi ai varga, e il motore segue
  la tavola di p. 97;
- in 47.41 «(Scorpio)», la neecha di Rahu, è di Santhanam, non del verso;
- la tavola di combustione di Santhanam (vol. I, p. 100) non ha fonte e non
  è il *Surya Siddhanta* (Saturno 16 invece di 15, valori retrogradi per i
  pianeti esterni);
- in 79.9 «within one degree» è di Santhanam: il verso dice solo
  «congiunti», il grado è del *Surya Siddhanta* VII.19;
- in 45.33 il verso dice *yātadaṇḍa*, le ghati trascorse, e l'esempio di
  Santhanam conta quella in corso: il motore segue l'esempio, e lo dice;
- Narasimha Rao dà ai nodi esaltazioni diverse dal BPHS (Rahu Gemelli, Ketu
  Sagittario, tavola 6): valgono solo dentro `arudha-graha.ts`;
- negli esempi di Rao per le regole 1 e 2 dei due «più forte» (§15.5.1-2)
  la regola 1 decide già: illustrano la regola, non la catena, e i test non
  li usano come catena.

Una scelta di lettura, scritta nel commento a `TRATTI`: nei sette segni che
3.51-54 divide in tratti decide il tratto, anche contro 3.49 letto da solo.
La Luna a 10 del Toro è in moolatrikona e non in uccha, Mercurio a 18 della
Vergine pure. È il testo che precisa se stesso, non un'altra scuola.

Fatte anche le ricezioni, in `3349553`, nella stessa sezione del tema tropicale:
`receptionsOf` in `dignita.ts`, mutue e semplici fra i sette pianeti. La
definizione è di Lilly, p. 112 («in each others dignity», per domicilio,
triplicità, termine, faccia o «any essentiall dignity»), e a p. 176 il verbo
vale anche in un verso solo («single reception by exaltation»). Le pagine sono
in `texts/occidentale/lilly-christian-astrology-1647`, con la trascrizione.
Senza scuola le ricezioni sono per domicilio ed esaltazione; la riga della
fonte dice che le altre tre mancano, e il documento di lettura tropicale
vieta di dedurle. Con Lilly sono contate tutte e cinque (qui sotto).

Fatto anche il pacchetto di Lilly, in `c7ca93a`, `cbf5b83` e `193a5ee`.
`packages/core/src/dignita-lilly.ts` tiene la tavola di p. 104 per intero:
esaltazioni col grado e i Nodi (con le cadute della colonna Fall, il Sud nei
Gemelli e il Nord nel Sagittario), triplicità di giorno e di notte con l'acqua
a Marte, termini e facce; `lillyReceptionsOf` conta le ricezioni per tutte e
cinque le dignità, sugli esempi di Lilly a p. 112. La tavola è trascritta
riga per riga in `texts/occidentale/lilly-christian-astrology-1647/trascrizioni.md`,
con la lettura di p. 105 (che dice come si leggono le celle), e il test la
ricopia coi glifi della stampa (`packages/core/test/dignita-lilly.test.ts`).
Si accende con `ChartOptions.dignitySchool: 'lilly'` (`types.ts:1305`, letto
in `chart.ts`), con `SkyOptions.dignitySchool` (`types.ts:1502`, in
`sky.ts`) e con `--dignita lilly` nella CLI, solo nello zodiaco tropicale: la
sezione DIGNITÀ aggiunge, sotto le righe comuni,
una riga per corpo con i signori del suo grado e le sue dignità, e le
ricezioni diventano quelle di tutta la tavola. `packages/lettura/src/tropicale.ts`
dice al modello di usarle solo se la riga di Lilly c'è.

Due scelte, scritte nei commenti: l'esaltazione vale per tutto il segno e il
grado è un dato a parte («in these Signes the Planets have their
Exaltations»); senza l'ora la triplicità c'è solo nell'acqua, dove il
reggente è lo stesso di giorno e di notte.

In calce alla tavola Lilly stampa i punti: 4 l'esaltazione, 3 la triplicità,
2 il termine, 1 la faccia, 5 l'esilio, 4 la caduta. Sotto la colonna dei
domicili il numero è illeggibile; la tavola delle fortezze di p. 115 dà 5.
Il punteggio, col peregrino di p. 112 e le condizioni accidentali, è in
`condizioni-lilly.ts` (voce 17), e la sezione CONDIZIONI (LILLY) della tabella
lo porta sotto la sezione DIGNITÀ.

Fatte anche le superfici, in `510d777` e `8622c05`. Le dignità occidentali
stanno in `NatalChart.dignities` (`dignita-tema.ts`), **solo nello zodiaco
tropicale**: nel siderale, che è anche la carta che il Jyotisha riusa,
mancano dal JSON e dalla tabella, e chiedere Lilly lì è `ZODIACO_NON_TROPICALE`.
È un cambiamento: prima la tabella compatta del tema siderale portava la
sezione DIGNITÀ coi domicili occidentali, e ora no. Il pacchetto di Lilly si
chiede nel calcolo (`ChartOptions.dignitySchool`), non nel formato: la tabella
compatta impagina il JSON e non ricalcola, e i test che confrontavano le due
rese non tolgono più la sezione. Le ricezioni portano `counted`, come la
distribuzione. Superfici: `--dignita lilly` (anche con `--json`),
`dignitySchool=lilly` su `/api/chart`, `dignity_school` su
`compute_natal_chart`, la casella «Dignità di Lilly» e `DignityTable.svelte`
nella pagina del tema. Il compatto ora pesa circa il 25% del JSON, e le
descrizioni dicono «circa un quarto».

Fatta anche la scuola di Tolomeo, il 29 ottobre 2026, in `14df446` e
`75cc895`, con le scelte del proprietario in *Deciso*.
`packages/core/src/dignita-tolomeo.ts` tiene i triangoli di I.18 (i signori
tutti, e chi governa nella setta, nell'acqua Marte col co-reggente) e i
termini della tavola greca di Robbins, p. 106; domicili ed esaltazioni per
segno li prende da `dignita.ts`, che sono già di Tolomeo. Niente facce,
esilio, punteggio, e niente ricezioni sue: Tolomeo la ricezione non la
definisce, e con la sua scuola restano quelle comuni, con una riga che lo
dice (`PTOLEMY_RECEPTION_SOURCE`). Si chiede con `dignitySchool: 'tolomeo'`
e arriva in `WesternDignities.tolomeo`, anche nel cielo, senza condizioni.
Superfici: `--dignita tolomeo`, `dignitySchool=tolomeo` su `/api/chart`,
`dignity_school` su `compute_natal_chart`, il menù «Scuola delle dignità»
che ha preso il posto della casella di Lilly (`ChartSettings.svelte`, con la
copia `lib/scuole-dignita.ts` provata da `elenchi.test.ts`), il blocco
«Secondo Tolomeo» di `DignityTable.svelte`, il documento di lettura
tropicale e `/metodo#tolomeo`. Prove in
`packages/core/test/dignita-tolomeo.test.ts`, con la tavola ricopiata coi
glifi e il controllo delle somme di p. 103.

### Che cosa resta

1. **Il Jyotisha: quello che resta dopo il 29 ottobre 2026.** Ciascuna
   indipendente dalle altre, nessuna urgente.
   - **Le relazioni dei nodi.** Santhanam a p. 41 del vol. I le dà
     secondo altri testi, non secondo 3.55, e restano fuori finché non c'è
     una fonte scelta.
   - **La combustione nei gradi di tempo del *Surya Siddhanta*.** Oggi è in
     longitudine, e lo dice (`COMBUSTION_SOURCE` in `stati.ts`). Il calcolo
     esatto vuole l'ascensione obliqua all'orizzonte del luogo, col pianeta
     corretto per la latitudine (SS IX.1-5, pp. 364-366, e VII.8): un
     calcolo nuovo, da fare solo se servisse.
   - **Gli arudha dei graha nei varga.** Rao (§9.5) li calcola in ogni
     divisionale; `arudha-graha.ts` fa solo la rashi.
   - **La debolezza del 6.53** (*durbalāḥ*): nessuna soglia nel verso. Resta
     fuori finché una fonte non la dà.

2. **Le altre scuole occidentali**, quando le loro fonti sono state lette
   (vedi *Da verificare* qui sotto): ciascuna come valore nuovo di
   `DignitySchool`, intera. Lilly e Tolomeo ci sono; la prossima è Bonatti.
   Tolomeo è il modello più recente da seguire: `dignita-tolomeo.ts`, un
   campo in `WesternDignities`, un ramo in `computeWesternDignities`, una
   funzione di righe in `format.ts` (`ptolemyLines`), un blocco in
   `DignityTable.svelte`, una voce in `lib/scuole-dignita.ts`.

   Il compilatore pretende il nome in
   `DIGNITY_SCHOOL_NAMES` (`packages/core/src/constants.ts`), e da lì CLI,
   MCP e `/api/chart` imparano il valore da soli, ma solo a validarlo. I
   testi che elencano le scuole vanno aggiornati a mano: l'aiuto di
   `--dignita` (`cli.ts`), la descrizione di `dignity_school`
   (`packages/mcp/src/tools.ts`), il commento di
   `apps/web/src/routes/api/chart/+server.ts`, il documento di lettura
   tropicale e `/metodo`. Il conto delle fortezze e le condizioni
   accidentali sono di Lilly e restano suoi: una scuola nuova porta il
   proprio, o nessuno, e `LillyConditions` non si generalizza. Le ricezioni
   sono una definizione di Lilly: una scuola che non ne ha una sua le lascia
   comuni, come Tolomeo.

### Le scuole, e il default deciso il 18 ottobre 2026

Per il tema tropicale le scuole possibili sono cinque, ciascuna come pacchetto:

| | Domicili | Esaltazioni | Triplicità | Termini | Facce | Punteggio | Fonte primaria |
|---|---|---|---|---|---|---|---|
| Ellenistica (Doroteo, Valente) | tradizionali | da trovare: non in Valente I.2, ma Valente dà gradi altrove (apparato di Kroll-Skutsch a Firmico II.3.5) | tre reggenti, uno partecipe | egizi | sì | nessuno | Doroteo sopravvive in arabo, e la traduzione di Pingree è protetta; Valente in greco è libero |
| Tolomeo, *Tetrabiblos* | tradizionali | per segno, senza gradi (I.19) | due reggenti per setta; l'acqua a Marte, con Venere di giorno e la Luna di notte (I.18, p. 87) | tolemaici, dalla tavola greca di Robbins (p. 106) | no: la sua «faccia» è un aspetto ai luminari (I.23) | nessuno | greco e Ashmand (1822) liberi; nel codice dal 29 ottobre 2026 (`dignita-tolomeo.ts`) |
| Medievale araba (Abū Maʿshar, al-Bīrūnī, Bonatti) | tradizionali | col grado | doroteiche | egizi | caldee | 5-4-3-2-1, almuten | Bonatti latino (1491) libero |
| Lilly, 1647 | tradizionali | col grado, e i Nodi | due reggenti, Marte sull'acqua | tolemaici, nella sua versione | caldee | p. 104: esaltazione 4, triplicità 3, termine 2, faccia 1, esilio 5, caduta 4; domicilio illeggibile; peregrino definito a p. 112; tavola delle fortezze a p. 115, letta, domicilio 5 | scansioni libere; tavole lette il 27 ottobre 2026 |
| Moderna, XX secolo | con Urano, Nettuno, Plutone | segni, i pianeti esterni senza autore | nessuna | nessuno | decani per triplicità (Alan Leo) | nessuno | senza un autore unico |

Le righe medievale e moderna, fuori da quanto verificato qui sotto, vengono
da fonti secondarie e vanno lette sulle primarie prima di diventare tavole.
La riga di Lilly è stata letta sulla scansione, punti in calce compresi
(tranne quello del domicilio, illeggibile), e così la tavola delle fortezze
di p. 115, che dà il domicilio a 5.

Il default nel tema tropicale sono **due colonne affiancate, mai mescolate**,
ed è quello che la sezione DIGNITÀ porta oggi:

- **i domicili tradizionali con esaltazione, esilio e caduta**, dichiarati come
  la parte comune alle scuole occidentali antiche;
- **i domicili moderni**, attribuiti alla convenzione del Novecento, che un
  autore unico non ce l'ha. Il progetto ha già scelto quella convenzione
  mettendo Plutone nel tema: qui la si dichiara.

Triplicità, termini e facce **non compaiono per default**: si chiedono
nominando la scuola. La prima disponibile è Lilly, che l'oraria richiede
comunque; le altre entrano quando le loro fonti sono state lette. Il
punteggio c'è per Lilly, in `condizioni-lilly.ts`; una scuola nuova porta il
suo, o nessuno.
Nel Jyotisha la scelta è più semplice, perché Parashara è il riferimento che i
documenti di lettura già presuppongono; dove il BPHS lascia un buco senza
procedura (gli arudha dei graha) o un autore moderno conta altrimenti (i
varga buoni), entra Narasimha Rao, nominato e accanto, mai al posto.

### Le fonti: verificato e da verificare

Verificato sulle scansioni il 18 ottobre 2026, e scritto nei commenti di
`dignita.ts` (il BPHS il 26 ottobre, in `dignita-parashara.ts`; la tavola
intera di Lilly il 27 ottobre, in `dignita-lilly.ts`):

- **Domicili.** Tolomeo I.17 (ed. Robbins, Loeb 1940, pp. 79-83, su
  LacusCurtius) e Lilly, *Christian Astrology* (1647), p. 104 (archive.org,
  `b30338724`) coincidono. Valente I.2 (ed. Kroll 1908, pp. 5-13) scrive
  «οἶκος» per nove segni, concordi; per Toro, Acquario e Pesci no.
  Riletto il 29 ottobre 2026 sulle immagini di
  `valente-anthologiae-kroll-1908` (`pagine/`, `trascrizioni.md`).
- **Domicili moderni.** Alan Leo, *The Art of Synthesis* (3ª ed., 1912,
  in `texts/` come `leo-art-of-synthesis-1912`: archive.org la data 1926,
  il frontespizio dice 1912), p. 117,
  riferisce Urano all'Acquario e Nettuno ai Pesci come un uso, senza esserne
  il primo: Urano all'Acquario circolava già nell'Ottocento (Varley 1828,
  secondo Skyscript, pagina non vista). Per Plutone allo Scorpione nessun
  autore; C. C. Zain (1942) lo usa dichiarandolo solo il più diffuso.
- **Esaltazioni.** Tolomeo I.19 (Loeb pp. 89-91) dà i segni e nessun grado, e
  scrive lui le cadute («depression») nel segno opposto. Firmico, *Mathesis*
  II.3.5-6 (ed. Kroll-Skutsch I, 1897, p. 44, rr. 7-17) dà i gradi, con la
  caduta allo stesso grado del segno opposto; Lilly p. 104 dà gli stessi gradi
  e in più il Nodo Nord a 3° Gemelli e il Sud a 3° Sagittario (glifo stampato
  male). I gradi sono quindi della tradizione da Firmico a Lilly, non di
  Tolomeo, anche se Lilly intitola la tavola «according to Ptolomy». Valente
  I.2 una tavola delle esaltazioni non ce l'ha.
- **Ricezioni.** Lilly p. 112 (immagine n145) la definisce mutua, «in each
  others dignity», per qualunque dignità essenziale; p. 176 (n209) usa la
  ricezione in un verso solo. Trascritte in `texts/`.
- **La tavola di Lilly per intero**, pp. 104-105 (immagini n137 e n138):
  esaltazioni col grado e i Nodi, cadute della colonna Fall (Nodi compresi),
  triplicità, termini e facce, più i punti in calce. Letta a piena
  risoluzione e trascritta riga per riga in `trascrizioni.md`; p. 105 dice
  come si leggono le celle e dà Marte sull'acqua di giorno e di notte
  «according to Ptolomy and Naibod».
- **Esilio.** La colonna Detriment di Lilly p. 104 nomina, segno per segno, il
  signore del segno opposto; la colonna Fall coincide con Tolomeo per i sette
  pianeti. Sulla scansione l'immagine è la n137 contando da zero
  (`archive.org/download/b30338724/page/n137_w2000.jpg`).
- **BPHS, per il Jyotisha.** Santhanam, vol. I (Ranjan, 1992), su
  archive.org (`heag_brihat-parasara-hora-sastra-vol-1-…`): 3.49-50 a pp.
  38-39 (immagini n42 e n43 contando da zero), 3.51-54 a p. 39, i signori dei
  segni in 4.6-24 a pp. 50-53, letti sull'OCR e la p. 50 anche a vista
  (immagini in `pagine/`). I numeri
  combaciano anche col sanscrito stampato accanto. La scansione porta la
  dicitura «CC-0. In Public Domain. Gurukul Kangri Collection», ma vale per la
  copia digitale e non dice niente dei diritti sulla traduzione: se ne
  prendono i valori, non il testo.

Da verificare:

- **Bonatti**, per domicili ed esaltazioni: non è stato letto. L'edizione
  Ratdolt 1491 è in `texts/occidentale/bonatti-decem-tractatus-1491`, e l'OCR
  dell'incunabolo non serve: si legge sulle immagini. Non c'è ancora una
  mappa dei fogli: quali contengano domicili ed esaltazioni va trovato
  sfogliando, e scritto nella `FONTE.md`. Un'altra copia, senza
  OCR, è `ita-bnc-in1-00000968-001` (Biblioteca Nazionale Centrale di
  Firenze); quella della Bayerische Staatsbibliothek non si è trovata.
- **Le esaltazioni nella scuola ellenistica**: altrove in Valente, o in
  Doroteo. Valente i gradi li dà: l'apparato di Kroll-Skutsch a Firmico
  II.3.5 (p. 44) corregge Saturno a 21 e Giove a 15 «e Val. Doroth.»,
  contro i manoscritti (XX e XIX per Saturno, XXI e XVIII per Giove; per
  la caduta di Marte i codici hanno XXV e XXVI). Il luogo di Valente non è
  indicato: si cerca nell'indice dell'ed. Kroll. Vuol dire anche che i
  gradi di `dignita-lilly.ts` sono il testo critico di Firmico, non la
  lezione dei codici; vedi
  `texts/occidentale/firmico-mathesis-kroll-skutsch-1897/trascrizioni.md`.
- **La triplicità d'acqua in Tolomeo**: letta il 29 ottobre 2026, I.18,
  Loeb p. 87 (`texts/occidentale/tolomeo-tetrabiblos-robbins-1940/trascrizioni.md`).
  Marte la regge, e «the moon by night and Venus by day are co‑rulers»:
  due reggenti per setta, come scrive la seconda fonte. Le altre tre
  triplicità coincidono con Lilly. Il «according to Ptolomy» di Lilly a
  p. 105 vale per Marte, non per tutta la riga: una scuola di Tolomeo
  avrebbe la sua triplicità d'acqua, non quella di Lilly.
- **I termini in Tolomeo**: letti il 29 ottobre 2026, I.20-21, sulla
  scansione della Loeb (pp. 96 e 106, greco, con l'apparato a pp. 106-107)
  e confrontati con Ashmand p. 53 e con Lilly; nel codice in
  `dignita-tolomeo.ts`. Il confronto sta nelle trascrizioni della fonte: i
  termini di Lilly differiscono in sette segni, e le sue somme non tornano.
- **Le facce in Tolomeo**: lette il 29 ottobre 2026, I.22-23, Loeb
  pp. 109-111. Non ci sono facce decaniche: la «proper face» di I.23 è il
  pianeta che tiene coi luminari lo stesso aspetto del suo domicilio coi
  loro, e le divisioni più fini (I.22) Tolomeo le rifiuta. Vedi
  `texts/occidentale/tolomeo-tetrabiblos-robbins-1940/trascrizioni.md`.
- **I punti 5-4-3-2-1 medievali**: a chi vanno attribuiti. I siti li danno
  come «medievali» senza un testo.
- **Per il Jyotisha, l'esaltazione dei nodi**: chiusa col BPHS stesso,
  47.34-36, nel codice dal 29 ottobre 2026 (vedi *Deciso*). Se un giorno
  servisse una seconda fonte: Santhanam in nota a 3.50 rimanda alla sua
  traduzione dello *Horasara*, p. 20, che su archive.org non si è trovata
  (`texts/INDICE.md`, «Non libere»); l'altra traduzione, Subrahmanya Sastri
  (1949), è in `texts/jyotisha/horasara-subrahmanya-sastri-1949`, protetta,
  e per i nodi non è stata letta (lo è solo per il D-2, 2.2 e 8.11).

### Verifica

Le tavole contro la fonte, segno per segno e scuola per scuola: è una prova a
tabella e non chiede effemeridi, come in `dignita.test.ts`,
`dignita-parashara.test.ts` e `dignita-lilly.test.ts`. L'ultimo ricopia le
righe della tavola coi glifi della stampa e le rilegge: è il modello per una
scuola nuova.

## Deciso, e da non riaprire

- **La scuola di Tolomeo segue la tavola greca di Robbins com'è stampata.**
  Scelto dal proprietario il 29 ottobre 2026, con la voce 19. I termini
  sono quelli di p. 106 (cod. Vat. gr. 1453), non le seconde lezioni di
  Proclo né i termini di Lilly; nel Leone Giove primo, come la tavola,
  anche se il testo di p. 105 dà il segno a Saturno: correggerla col testo
  sarebbe una lezione nostra, e la riga della fonte lo dice. La scuola porta
  domicili, esaltazioni per segno, triangoli e termini; niente facce, esilio
  e punteggio. Le ricezioni restano quelle comuni: la definizione è di
  Lilly, e contarla sulle tavole di Tolomeo mescolerebbe le scuole.

- **Il glossario è una pagina per famiglia, e le parti indiane di `/metodo`
  sono pagine proprie.** Scelto dal proprietario il 28 ottobre 2026, con la
  voce 8: `/glossario` più `tema`, `tempo` e `jyotisha`; `/metodo/nakshatra`,
  `dasha`, `varga`, `drishti` e `panchanga`. Il glossario dice che cos'è un
  termine e rimanda, `/metodo` dichiara con quale convenzione lo si calcola: il
  taglio è scritto in testa a `glossario/jyotisha/+page.svelte`. Niente
  marcature FAQ, per la ragione scritta sopra `strutturati` in `Meta.svelte`;
  i cappelli delle cinque sezioni restano come sono.

- **Il dominio non entra nel codice.** `Meta.svelte` compone gli indirizzi da
  `page.url.origin`, e in produzione è `ORIGIN` a dirlo: il cambio di dominio è
  configurazione. Da SvelteKit 3 è configurazione della build e non
  dell'avvio, perché `paths.origin` finisce nel server compilato: cambiare
  dominio vuol dire rifare la build, o l'immagine. Scelto il 18 ottobre 2026
  contro l'alternativa degli header del proxy (`PROTOCOL_HEADER`,
  `HOST_HEADER`), che avrebbe lasciato l'immagine indipendente dal dominio ma
  appesa alla configurazione del proxy.
- **`12segni` non è un secondo marchio.** È il dominio di servizio e il nome
  breve sotto l'icona, dove sette caratteri sono il tetto. Nella prosa il nome
  è uno solo.
- **I transiti attivi non hanno un'interfaccia web, né un punteggio.**
  `find_active_transits`, `/api/transits/active` e `--attivi` servono agli
  agenti e alla riga di comando: la pagina e la tabella Svelte no. E nessun
  indice di intensità del periodo, che sarebbe un peso senza autore: si
  espongono i componenti (bordi, orbita ai bordi, perfezioni, avvicinamento
  massimo). Deciso con la voce 7.
- **Il linter ha regole e nessun formattatore.** ESLint con typescript-eslint
  e eslint-plugin-svelte, regole scelte una per una e nessun preset acceso in
  blocco (`eslint.config.js` dice perché ciascuna). Un formattatore
  rifluirebbe la prosa dei commenti, che è mandata a capo a mano. Deciso il
  27 ottobre 2026, con la voce 9.
- **Le orbite degli aspetti sono convenzioni nominate.** Greene (la
  predefinita di Astrodienst) per il tema e il cielo, con Leo (1928) e Lilly
  (1647, le *moieties*, dalla voce 17) in alternativa; Hand, 1°, per
  transiti, passaggi e incontri in cielo, l'unica
  tavola dei transiti con un autore. Deciso il 27 ottobre 2026 con la voce
  18, scegliendo come predefinita la più diffusa. Le orbite senza autore che
  c'erano prima (8/7/5 con +2° ai luminari; 2/1,5/1 nei transiti) sono
  uscite: erano un ibrido di Leo e Astrolog.
- **Il D-2 si fa con più convenzioni nominate, Parashara predefinita.** Hora
  del Sole e della Luna come nei testi, e Leone-Cancro accanto, dichiarata
  come lettura corrente senza un classico che la enunci. Scelto dal
  proprietario il 27 ottobre 2026 fra quattro strade, fatto il 28 in
  `a828b3f`; la forma del risultato sta nella voce 5, lotto A.
- **Il D-60 si conta dal segno stesso, con una convenzione sola.** Il verso
  6.33 dice *tad-rāśeḥ* e l'esempio di Santhanam lo applica, e P.V.R.
  Narasimha Rao lo legge allo stesso modo (in un'email del 2009 riportata su
  un forum, copia in `texts/tecnica/d60-letture-in-rete-2026`); la lettura
  dall'Ariete, cercata il 28 ottobre 2026, non ha trovato un autore.
  Confermato dal proprietario il 28 ottobre 2026. Le ragioni nella
  trascrizione di 6.33 (`texts/jyotisha/bphs-santhanam-1992-vol1`) e in
  `texts/tecnica/d60-letture-in-rete-2026`. Una seconda convenzione entra
  solo con un autore e un testo.
- **I varga buoni si contano secondo Santhanam, con l'arudha, la hora che
  segue la convenzione e il 6.53 come nota.** Quattro scelte prese dal
  proprietario il 28 ottobre 2026, voce 19: in 6.52 i *segni* di uccha,
  moolatrikona e propri, come traduce Santhanam (l'altra lettura di
  *adhipateḥ* non ha un autore); l'arudha lagna calcolato secondo 29.1-7, e
  non un conto senza (quello di Narasimha Rao è entrato accanto il 29
  ottobre, qui sotto); il 6.53 come giudizio sull'effetto, che non toglie
  varga dal conto; la hora per segno con `leone-cancro`, con la nota di
  Santhanam a p. 90 con `parashara`, dichiarata come sua.
- **Lo Scorpione e l'Acquario hanno due signori nel calcolo dell'arudha.**
  BPHS 29.7 vuole il più forte, 46.157 dà Ketu e Rahu accanto a Marte e
  Saturno, e il più forte si sceglie con la procedura di 46.158-166, che il
  testo dà per la chara dasha. Scelto dal proprietario il 28 ottobre 2026
  contro il signore unico di 4.6-24 e contro il riportare entrambi; vale
  per gli arudha e quindi per i varga buoni. Fuori dall'arudha (dignità,
  relazioni, vimshopaka) i signori restano quelli di 4.6-24.
- **Rahu e Ketu hanno le dignità di BPHS 47.35-36, solo nella tabella del
  tema, per segno e senza neecha.** Scelto dal proprietario il 29 ottobre
  2026, voce 19. Uccha, moolatrikona e segno proprio come li dà il verso,
  tutte le corrispondenze (per Ketu lo Scorpione è uccha e segno proprio
  insieme); la neecha no, perché il verso non dice il segno e la regola del
  settimo di 3.49 è detta dei sette; Vergine e Pesci, «secondo alcuni»,
  riferiti nella fonte e non usati. Restano ai sette graha le corrispondenze
  dei varga, i varga buoni, il vimshopaka, le relazioni e i signori dei
  segni di 4.6-24.
- **Il 6.53: combustione, guerra e avastha come dati, con letture
  dichiarate.** Scelto dal proprietario il 29 ottobre 2026, voce 19.
  Combustione in longitudine con i limiti del *Surya Siddhanta* IX.6-9 e
  X.1, dichiarando che il testo li dà in gradi di tempo e che la longitudine
  li approssima; la tavola di Santhanam resta fuori. Guerra planetaria fra i
  cinque *tārāgraha*, in coordinate eclittiche geocentriche, a distanza
  angolare sotto un grado, che alla congiunzione è la differenza delle
  latitudini (*Surya Siddhanta* VII.12 e 19), con le sole
  regole di Venere e del nord (BPHS 79.9, SS VII.21 e 23), dichiarando che
  le qualità osservative restano fuori. Avastha *śayanādi* di 45.30-37
  calcolata e mostrata come dato, col navamsa per l'*aṃśa* e la ghati in
  corso come nell'esempio di Santhanam, senza dire quali avastha annullino i
  varga buoni. Il conto dei varga buoni non cambia: il 6.53 resta una nota.
- **I varga buoni si contano anche secondo Narasimha Rao, e gli arudha dei
  graha sono i suoi.** Scelto dal proprietario il 29 ottobre 2026, voce 19.
  Il conto di Rao (2000, §6.6: uccha, moolatrikona e segno proprio, senza
  l'arudha) sta accanto a quello di Santhanam, sempre tutti e due e col
  nome. Gli arudha dei graha entrano secondo Rao per intero (§9.5 e le
  regole del segno più forte di §15.5.2, con le rasi drishti che
  richiedono), non col BPHS completato da noi: 29.7 non dice come si sceglie
  il segno più forte, e 46.158-166 confronta due signori, non due segni. Gli
  arudha dei bhava restano del BPHS. In 46.164 conta anche l'uccha di Rahu
  e Ketu di 47.35: è lo stesso libro.
- **Il server MCP non ha un pool, e non gli serve**: è un processo per client,
  sul trasporto stdio, e non c'è nessun'altra richiesta da tenere in attesa.
- **I thread del pool web sono al massimo quattro, e la quinta richiesta
  pesante aspetta.** Sono uno meno dei nuclei, fino a quattro
  (`OPERAI`, `apps/web/src/lib/server/pool.ts:142`). Le due ragioni stanno nel
  commento lì sopra: uno meno dei nuclei perché il lavoro è tutto CPU e un
  nucleo resta al filo principale, che serve le richieste leggere; il tetto
  di quattro per la memoria, perché ogni thread carica la sua copia del
  motore e delle effemeridi. Va
  riguardato solo se l'applicazione va in rete pubblica con concorrenza
  seria, e non da dentro il motore.

## Esaminato, e lasciato stare

**Le fonti per le cuspidi che sembrano indipendenti e non lo sono.** Da non
ricontrollare: **astro.com** e le sue tavole delle case in PDF, **AstroSeek**,
**Cafe Astrology**, **AstroLibrary**, e ogni libreria costruita su `pyswisseph`
o `sweph` (Kerykeion, flatlib, immanuel). Sono tutte lo stesso motore visto da
fuori. Le cuspidi sono ancorate in `houses.test.ts` a RadixPro e ad Astrolog
compilato senza Swiss Ephemeris, e il commento in testa al test dice perché.

Se un giorno servisse un secondo ancoraggio, la strada c'è ed è di pubblico
dominio: **Dalton, *The Spherical Basis of Astrology* (1911, settima edizione,
che incorpora le Raphael's Tables of Houses)**, su archive.org come
`sphericalbasisof00dalt`, senza restrizioni, cuspidi Placido al primo d'arco per
le latitudini da 22 a 60. L'OCR delle tabelle è illeggibile ma le pagine si
leggono a vista. Le tavole di Koch (le sue *Häusertabellen* del 1971 e il *Koch
Book of Tables* di Michelsen) ci sono, ma in prestito, non scaricabili.

**`sprintf-js` sotto `electron-builder`.** `npm audit` lo dà moderato in tutte
le versioni (`*`), e con lui `roarr`, `global-agent`, `@electron/get` e la
catena di `app-builder-lib`, che dicono «fix available» ma non ne hanno uno.
Girano solo quando si costruisce l'AppImage, sulla macchina di chi la
costruisce, e nell'AppImage non entrano. Da riguardare quando
`electron-builder` smette di dipendere da `@electron/get@3`.

**L'avviso di Chrome sui campi di modulo senza `id` né `name`.** Compare in
console come *issue*, «A form field element should have an id or name
attribute», e i campi sono una decina: le caselle di `BirthForm.svelte`,
`ChartSettings.svelte`, `JyotishaSettings.svelte`, `MomentFields.svelte`,
`LocationSearch.svelte`, `StrumentiLettura.svelte`, `elezione` e `vedica`.
Non è accessibilità: stanno tutti dentro un `<label>`, che è ciò che li
nomina. Riguarda l'autocompilazione del browser, che senza `name` non sa che
cosa proporre, e il progetto in parte la spegne già (`autocomplete="off"` in
`BirthForm.svelte:91` e `:103` e in `LocationSearch.svelte:156`). Prima di
aggiungere `name` per zittire l'avviso va ricordato che un browser che ricorda
date e luoghi di nascita costruisce lo stesso archivio che il service worker si
rifiuta di costruire (`lib/cache-policy.ts`).
