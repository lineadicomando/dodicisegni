# 33. Un'istanza interna del motore

**Priorità alta**, ma conviene dopo la 31. dodicicase chiamerà il motore sulla
rete interna del server (`net-com`), non dall'indirizzo pubblico, per due
ragioni: il pool ha al massimo quattro thread (`docs/decisioni.md`, *I
thread del pool web*), e un import di centinaia di clienti o un lotto di
oroscopi non deve far aspettare il sito pubblico; e i dati dei clienti di un
professionista non devono passare da Cloudflare né finire nei log del sito
pubblico.

Nel repo:

- in `compose.yaml` un servizio `motore` accanto a `web` (riga 23), dalla
  stessa immagine e con lo stesso volume GeoNames in sola lettura, **senza
  `ports`**, con un profilo suo (`--profile motore`) così che `docker compose
  up` in locale non lo avvii senza volerlo. Il commento dice a che cosa
  serve e perché non ha porte;
- nessun codice nuovo: è la stessa applicazione. `ORIGIN` può restare
  quello pubblico, perché il servizio interno non serve pagine.

Sul server, fuori dal repo e con la procedura di `~/Progetti/cmdln-srv`
(`/nuovo-servizio`, punto di ripristino, conferma a ogni scrittura): IP fisso
su `net-com` e alias `dodicisegni-motore.local` nell'override del server,
nessun vhost in Caddy, scheda `docs/servizi/dodicisegni.md` di `cmdln-srv`
aggiornata. Va controllato che l'applicazione stessa non scriva nei suoi log
le query string: oggi la promessa di `/privacy` si regge sulla
configurazione dei log davanti all'applicazione, e l'istanza interna non ha
Caddy davanti.

**Versione**: niente, le risposte non cambiano.

**Verifica**: in locale `docker compose --profile motore up -d motore` e
una richiesta da un altro container della rete compose riceve 200, mentre
dall'host la porta non risponde; sul server, da un container su `net-com`,
`GET http://dodicisegni-motore.local:3000/api/chart?…` → 200, e
`docker logs` del motore non contiene la data della richiesta.
