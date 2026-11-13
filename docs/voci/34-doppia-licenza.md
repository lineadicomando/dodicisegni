# 34. La doppia licenza di `ruota` e `lettura`

**Priorità media, decisione del proprietario.** dodicicase è chiuso e non
può importare codice AGPL. `packages/ruota` e `packages/lettura` però non
dipendono da `core` né da Swiss Ephemeris (`CLAUDE.md`, *Vincoli*), e il
1° novembre 2026 `git shortlog -sne HEAD -- packages/ruota packages/lettura
apps/web/src/lib/components` dà un autore solo, il proprietario. Ne segue che
il proprietario può rilasciarli **anche** sotto una licenza permissiva
(`AGPL-3.0-or-later OR MIT`, per esempio), e dodicicase potrebbe allora
disegnare le ruote e partire dai documenti di lettura senza riscriverli.
Senza la decisione, dodicicase li rifà da sé, e il motore resta comunque
chiamato solo in rete.

Da decidere:

- **se** e **quali**: `ruota`, `lettura`, le tabelle Svelte di
  `apps/web/src/lib/components` (che però importano tipi da `core`: andrebbero
  prima staccate, come `ruota` ridichiara i suoi in `types.ts`);
- **quale licenza** accanto all'AGPL;
- **i contributi esterni**: se un giorno il repo ne accetta, un accordo con
  chi contribuisce (CLA, o almeno una dichiarazione nel `CONTRIBUTING`) che
  conservi la possibilità della doppia licenza. Senza, il primo contributo
  esterno a quei pacchetti la chiude.

Se sì: campo `license` nei due `package.json`, un `LICENSE` per pacchetto,
una riga nel README, *Licenza*, e una voce in `docs/decisioni.md`.
**Versione**: niente.

**Verifica**: `npm pkg get license -w @dodicisegni/ruota -w
@dodicisegni/lettura` dice la doppia licenza, e i `LICENSE` ci sono.
