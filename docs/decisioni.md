# Decisioni prese, da non riaprire

Le scelte di dottrina e di progetto fatte dal proprietario, con la data, la
voce del `TODO.md` che le ha chieste e la ragione. Prima di proporre una
strada diversa su uno di questi punti, leggere qui: se una decisione va
cambiata, la cambia il proprietario, e la voce si aggiorna. I commenti del
codice rimandano qui con «`docs/decisioni.md`».


- **La prosa del sito si rivede con la skill di scrittura italiana anti
  pattern AI, senza «anima» decorativa.** Chiesto dal proprietario il 30
  ottobre 2026, senza calibrare una voce d'autore: perimetro le pagine
  informative, il README e i testi visibili delle pagine di calcolo; fuori i
  documenti di lettura e le descrizioni MCP, che leggono le AI. Si tolgono le
  negazioni che smentiscono un equivoco che il lettore non ha, le chiuse a
  effetto che ripetono il paragrafo, le ripetizioni; restano le negazioni
  che correggono un equivoco reale («due zodiaci non sono due astronomie»)
  e le frasi che enunciano i principi del sito. Niente prima persona, niente
  aneddoti: la voce è sobria e impersonale («il sito», «il motore»). Fatti,
  fonti, link, ancore, tavole e `<Meta>` non si toccano in una revisione di
  forma. Il lavoro è in `750708f`.

- **Dasha è femminile, con tutti i suoi periodi.** Scelto dal proprietario
  il 30 ottobre 2026: la dasha, la mahadasha, le antardasha, le
  pratyantardasha, come il sanscrito *daśā*. Vale per pagine, CLI,
  documenti, commenti e test; la regola è anche in `CLAUDE.md`, *Stile*.

- **La terza modalità è «mutevole», e «mobile» non nomina nessuna
  modalità.** Scelto dal proprietario il 30 ottobre 2026, voce 30. Per il
  greco, il latino, Lilly (p. 88), il sanscrito (*cara*) e la scuola di
  Bezza i «mobili» sono i cardinali, mentre la divulgazione italiana di oggi
  chiama così Gemelli, Vergine, Sagittario e Pesci: la parola diceva le due
  cose anche nel repo. `Modality` è `cardinale | fisso | mutevole`, e il
  Jyotisha usa le stesse parole (*cara* cardinale, *sthira* fisso,
  *dvisvabhāva* mutevole; la nota è in testa a `varga.ts`). «Mutevole» e non
  «comune» perché è la parola che la divulgazione mette accanto a «mobile»;
  il glossario dice i nomi antichi. Le fonti sono in
  `texts/occidentale/modalita-nomi-italiani-2026`.

- **L'oraria: scuole a pacchetti, e Lilly per prima.** Deciso il 18 e il
  27 ottobre 2026 con la voce 17, chiusa il 30. Un substrato neutro, il
  corso di `corso.ts`, con sopra le scuole, ciascuna intera e nominata; una
  scuola nuova è un file accanto a `oraria-lilly.ts`. La casa del quesito è
  un input obbligatorio, anche derivata: il motore non la sceglie. Le
  considerazioni prima del giudizio sono predicati, mai un rifiuto. Non
  entrano il sì o il no né la conversione dei gradi in giorni: li fa chi
  legge, e `ORARIA` dice come li faceva Lilly. Il documento ha un registro
  attribuito e rifiuta salute, morte, questioni legali e finanziarie; non è
  un valore di `SISTEMI`. Il pool dei worker non serve: una domanda costa
  due decimi di secondo.

- **Nel corso, chi applica lo dice il moto reale.** Scelto dal proprietario
  il 30 ottobre 2026, con la voce 17. Ogni incontro del corso porta
  `approaching`: chi si avvicina all'aspetto un quarto d'ora prima
  dell'esatto, il corpo, l'altro o tutti e due. Il corso resta neutro; il
  classificatore di Lilly continua a usare il peso (p. 108).

- **La Luna cosignificatrice non proibisce.** Scelto dal proprietario il 30
  ottobre 2026, con la voce 17, dopo una misura: su 720 figure di Roma del
  2026 la Luna faceva il 77% delle proibizioni (643 su 830), e in 50 delle
  193 figure con una perfezione diretta era l'unico impedimento. Lilly la dà
  come cosignificatrice di chi chiede (p. 124), e i suoi esempi di
  proibizione (pp. 110-111) sono di un pianeta che sorpassa il significatore
  più leggero: il suo incontro col significatore del quesito è la parte del
  querente. Proibisce solo quando è lei uno dei due significatori; resta
  traslatrice, come a p. 182. Dopo il cambio, sulle stesse figure, 187
  proibizioni.

- **La Parte di Fortuna nel conto di Lilly segue la tavola di p. 145.**
  Scelto dal proprietario il 30 ottobre 2026, con la voce 17. La Parte è
  quella di p. 144 (Ascendente + Luna − Sole, di giorno e di notte);
  aspetti coi pianeti entro la loro metà orbita, coi Nodi partili; casa con
  la regola dei cinque gradi e riga «Not Combust» come stampate, anche dove
  l'esempio di p. 180 non le segue; combustione con le soglie dei pianeti.
  Le letture stanno in `LILLY_CONDITIONS_READINGS`.

- **Le condizioni di qualità di p. 125 si leggono così.** Scelto dal
  proprietario il 30 ottobre 2026, con la voce 17. Le case «good», «proper»
  e «friendly» sono quelle con punti positivi nella tavola di p. 115 (tutte
  tranne 6, 8 e 12); la congiunzione si giudica nella casa del grado in cui
  si compie; «have dignity» del quadrato è «non peregrino», mentre
  «essentially well dignified» e «Essentially or Accidentally strong» non si
  calcolano e portano i dati. Le letture stanno in `HORARY_LILLY_READINGS`.

- **Le dignità occidentali: due colonne di default, le scuole a richiesta,
  e la riga moderna non è una scuola.** Il default, scelto il 18 ottobre
  2026 con la voce 19, sono i domicili tradizionali con esaltazione, esilio
  e caduta, la parte comune alle scuole antiche, e accanto i domicili
  moderni, mai fusi; triplicità, termini e facce solo nominando una scuola,
  intera. Il 30 ottobre 2026 il proprietario ha deciso che la riga
  «moderna» non diventa una scuola: Alan Leo, l'unico autore letto, non è
  coerente fra le edizioni (vedi `docs/esaminato.md`), e i domicili moderni restano
  la seconda colonna, com'erano. Nel Jyotisha il riferimento è Parashara;
  dove il BPHS lascia un buco o un autore moderno conta altrimenti entra
  Narasimha Rao, nominato e accanto.

- **La scuola di Valente si chiama `valente` e porta i termini di Pingree.**
  Scelto dal proprietario il 30 ottobre 2026, con la voce 19 e poi con la
  26. Un autore, come le altre scuole, e non «ellenistica»: Doroteo resta
  fuori finché non c'è un suo testo libero. I termini erano gli egizi di
  Robbins p. 96, perché in Kroll Ariete e Scorpione non si leggono; letta
  l'edizione critica di Pingree (1986, pp. 13-18, nella copia locale delle
  fonti), sono quelli che stampa lei: gli egizi in undici segni, con Ariete
  e Scorpione sanati dalla copia di Rhosus, e nella Bilancia i numeri di
  Valente (♄6 ☿5 ♃8 ♀7 ♂4), senza note in apparato.

- **La scuola di Bonatti ha le sue ricezioni, entro sei gradi, e non ha
  punteggio.** Scelto dal proprietario il 30 ottobre 2026, con la voce 19 e
  poi con la 26. La ricezione nasce da un'applicazione e chiede domicilio,
  esaltazione o due dignità minori (PDF pp. 167-168). L'applicazione è
  quella della definizione del cap. 4 (p. 158): il più leggero, nell'ordine
  delle sfere, con meno gradi nel suo segno del più pesante, per corpo,
  sestile, quadrato o trigono, e **sei gradi o meno**; non le orbite di p.
  159 («orbes amborum», di lettura incerta), e **non l'opposizione**, che il
  passo non nomina. Un fatto di posizione: il moto retrogrado non conta, e
  `corso.ts` non serve (`bonattiReceptionsOf` in `dignita-bonatti.ts`). Il
  5-4-5-3 del signore dell'anno non diventa un punteggio delle dignità. Il
  resto non era una scelta: le tavole sono quelle stampate, e nel Leone la
  tavola e il testo di Bonatti concordano.

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
  taglio è scritto in testa a
  `apps/web/src/routes/(informativa)/glossario/jyotisha/+page.svelte`. Niente
  marcature FAQ, per la ragione scritta sopra `strutturati` in `Meta.svelte`;
  i cappelli delle sezioni restano come sono.

- **Il dominio non entra nel codice.** `Meta.svelte` compone gli indirizzi da
  `page.url.origin`, e in produzione è `ORIGIN` a dirlo: il cambio di dominio è
  configurazione. Da SvelteKit 3 è configurazione della build e non
  dell'avvio, perché `paths.origin` finisce nel server compilato: cambiare
  dominio vuol dire rifare la build, o l'immagine. Scelto il 18 ottobre 2026
  contro l'alternativa degli header del proxy (`PROTOCOL_HEADER`,
  `HOST_HEADER`), che avrebbe lasciato l'immagine indipendente dal dominio ma
  appesa alla configurazione del proxy.

- **Il dominio principale è `https://dodicisegni.it`, senza `www`.** Scelto
  dal proprietario il 30 ottobre 2026, con la voce 28. Coincide col nome del
  sito (`SITE_NAME`), quello che Google mostra accanto all'indirizzo; una parola
  chiave nel dominio non pesa sul posizionamento, e `12segni` resta il nome
  breve e il dominio di servizio (la riga qui sotto). Senza `www` perché è
  più corto e il sito non ha cookie da separare. `www.dodicisegni.it`,
  `12segni.it` e `www.12segni.it` reindirizzano lì, con percorso e query,
  così chi sente «dodici segni» e scrive `12segni` arriva lo stesso.

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
  `a828b3f`. Il risultato è un'unione col discriminante `kind`:
  `SignVargaChart` (`'segni'`) e `HoraVargaChart` (`'signori'`, il solo D-2
  di Parashara, che il quadro rifiuta con `VARGA_SENZA_SEGNI`).

- **L'avvertenza sull'ora va anche al D-24 e al D-27.** Scelto dal
  proprietario il 30 ottobre 2026, voce 5. I varga fini sono cinque: i tre
  con parti sotto il grado e i due con parti di poco più (1°15' e
  1°6'40"), che l'Ascendente attraversa in cinque o sei minuti, meno del
  quarto d'ora a cui di solito si dà l'ora. Il D-30 no: tratti da cinque a
  otto gradi. Restano segnati a mano col campo `fine` di `VARGAS`, senza una
  soglia calcolata.

- **Le hora moderne entrano con un autore, e non nei conti del BPHS.**
  Scelto dal proprietario il 30 ottobre 2026, voce 5. Parivritti-dvaya,
  Kashinatha, Raman Suprajarama e Uma-Shambhu sono convenzioni del D-2 accanto
  a Parashara e Leone-Cancro. La parivritti-dvaya è nata anonima, ma Rao
  (2003, tavola 1; 2012, View 4) la descrive e le dà un uso, e si cita lui.
  Con una delle quattro il D-2 mostrato la segue, mentre i varga buoni di
  Santhanam e il vimshopaka contano la hora di Parashara e lo dicono
  (`bphsHoraConvention` in `hora.ts`): un conto del BPHS su una carta di
  Rath sarebbe un ibrido. Il conto di Rao (§6.6) resta col suo Leone-Cancro.

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
  Combustione coi limiti del *Surya Siddhanta* IX.6-9 e X.1; la tavola di
  Santhanam resta fuori. Il 30 ottobre 2026, voce 25, il proprietario ha
  scelto di giudicarla nella misura del testo, i gradi di tempo di IX.4-5:
  la differenza di ascensione obliqua (a est, all'alba) o di discensione (a
  ovest, la sera) fra il Sole e il pianeta, alla latitudine del luogo e col
  pianeta alla sua latitudine eclittica (`timeDegreesFromSun` in
  `stati.ts`); calcolata con la geometria esatta e non con le regole
  approssimate del testo, con la longitudine accanto, che decide solo oltre
  i circoli polari. Su mille nascite per latitudine il giudizio cambia
  rispetto alla longitudine in 81 casi su 6000 all'equatore, 458 a Roma, 772
  a 55° nord, 1404 a 64°. Guerra planetaria fra i
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

- **Gli arudha dei graha nei varga restano indeterminati dove la catena
  guarda il grado.** Scelto dal proprietario il 30 ottobre 2026, voce 25.
  Rao (§9.5, p. 94) li calcola in ogni divisionale, ma due spareggi
  (§15.5.1, 5b; §15.5.2, 6) guardano quanto un graha è avanzato nel segno,
  e nel segno di un varga il grado non è definito. Contro il grado «del
  varga» (gradi × N modulo 30), che è l'uso dei programmi e non di Rao, e
  che non vale per il D-30: quando la catena arriva lì, segno proprio e
  arudha mancano e `ownSignRule` dice dove si è fermata. Succede solo a
  Marte e Saturno, per il co-signore di Scorpione e Acquario: misurato su
  4200 carte, 26 arudha su 37800; dove l'arudha c'è, coincide con quello
  del grado «del varga» (`arudha-graha.test.ts`).

- **Il server MCP non ha un pool, e non gli serve**: è un processo per client,
  sul trasporto stdio, e non c'è nessun'altra richiesta da tenere in attesa.

- **I thread del pool web sono al massimo quattro, e la quinta richiesta
  pesante aspetta.** Sono uno meno dei nuclei, fino a quattro
  (`OPERAI`, `apps/web/src/lib/server/pool.ts:142`). Le due ragioni stanno nel
  commento lì sopra: uno meno dei nuclei perché il lavoro è tutto CPU e un
  nucleo resta al filo principale, che serve le richieste leggere; il tetto
  di quattro per la memoria, perché ogni thread carica la sua copia del
  motore e delle effemeridi. Va
  riguardato solo se la concorrenza sul sito pubblico diventa seria, e non da
  dentro il motore.
