# Politica di sicurezza

Grazie per l'attenzione alla sicurezza di **MAVI Ristorazione — Portale**.
Questo documento spiega come segnalare un problema e cosa aspettarsi dopo la segnalazione.

## Versioni supportate

Viene mantenuta soltanto l'ultima versione pubblicata sul branch `main`.

| Versione | Supportata |
| --- | --- |
| 0.1.x | Sì |
| precedenti alla 0.1 | No |

## Come segnalare una vulnerabilità

**Non aprire una issue pubblica** per un problema di sicurezza.

Usa uno di questi canali:

1. **GitHub Security Advisories privati** (canale preferito):
   scheda `Security` del repository → `Report a vulnerability`.
   La segnalazione resta visibile solo a te e al manutentore.
2. In alternativa, contatto tramite GitHub:
   [@Shadowed1996](https://github.com/Shadowed1996).

## Cosa includere nella segnalazione

Più la segnalazione è completa, più in fretta si può intervenire:

- descrizione del problema e impatto potenziale;
- passi precisi per riprodurlo, o una prova di concetto minima;
- versione o commit interessato e branch;
- ambiente: sistema operativo, browser e versione, versione di Node.js;
- eventuali log, screenshot o richieste di rete rilevanti;
- se ne hai una, una proposta di correzione.

## Tempi di risposta

- **Primo riscontro**: entro 7 giorni dalla segnalazione.
- **Valutazione e gravità**: entro 14 giorni.
- **Correzione**: pianificata in base alla gravità; per i problemi critici si interviene
  con priorità sulla successiva versione utile.

Ti verrà comunicato lo stato di avanzamento e, se lo desideri, il tuo contributo verrà
riconosciuto nell'avviso pubblicato al momento della correzione.

## Divulgazione responsabile

Chi segnala in buona fede, senza accedere a dati altrui, senza degradare il servizio e
senza divulgare il problema prima della correzione, **non subirà alcuna azione legale**.
Ti si chiede solo di concedere un tempo ragionevole per la correzione prima di rendere
pubblici i dettagli.

## Fuori ambito

Non sono considerate vulnerabilità di questo progetto:

- le credenziali e i dati dimostrativi presenti nel prototipo: sono di esempio, pubblici
  per costruzione e non danno accesso ad alcun sistema reale;
- l'assenza di autenticazione robusta e di cifratura: il prototipo non ha backend, non ha
  database e non conserva dati oltre la sessione del browser;
- vulnerabilità di dipendenze di terze parti già note e senza correzione disponibile
  (vanno segnalate a monte, al progetto che le mantiene);
- risultati grezzi di scanner automatici senza dimostrazione di un impatto concreto;
- assenza di intestazioni HTTP di sicurezza sul server di sviluppo di Vite, che non è
  pensato per essere esposto in rete;
- attacchi che richiedono accesso fisico al dispositivo, ingegneria sociale o un browser
  già compromesso;
- segnalazioni di denial of service ottenute con traffico massivo.

## Buone pratiche per chi usa il progetto

- Non pubblicare il server di sviluppo su reti non fidate: usa `npm run build` e servi la
  cartella `dist/`.
- Non inserire dati personali reali nel prototipo: non è predisposto a trattarli.
- Tieni aggiornate le dipendenze con `npm audit` e le pull request di Dependabot.
