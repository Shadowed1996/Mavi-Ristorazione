# Politica di sicurezza

**MAVI Ristorazione — Portale** è un prototipo di presentazione, e questo cambia
parecchio il quadro:

- **non c'è backend, non c'è database, non c'è salvataggio.** Tutto gira nel
  browser di chi apre il portale, sui dati di esempio di `src/data.js`, e
  sparisce a ogni ricaricamento. L'unica cosa conservata è il tema, in
  `localStorage`;
- **l'accesso è dimostrativo.** La password non viene verificata: conta solo il
  nome utente. Non protegge niente, e non è pensato per farlo;
- **il server di sviluppo di Vite** (`npm run dev`) è uno strumento di lavoro e
  non va esposto in rete. Per mostrare il portale si usa `dist/`.

Una segnalazione serve quindi soprattutto a non portare in produzione, il giorno
che ci sarà, un difetto che si vede già nel prototipo.

## Versioni supportate

Riceve correzioni soltanto l'ultima versione presente sul branch `main`.

| Versione | Supportata |
|---|---|
| `main` (0.1.x) | Sì |
| Copie consegnate in zip, revisioni precedenti | No |

## Come segnalare una vulnerabilità

**Non aprire una issue** per un problema di sicurezza.

1. Vai nella scheda **Security** del repository e scegli
   **Report a vulnerability**: apre una segnalazione privata, visibile solo al
   titolare del repository.
2. In alternativa, contatta [@Shadowed1996](https://github.com/Shadowed1996)
   su GitHub.

In nessun caso i dettagli vanno resi pubblici prima che sia disponibile una
correzione.

### Cosa includere nella segnalazione

- descrizione del problema e impatto concreto;
- **quale parte** riguarda: accesso, un portale e con quale profilo, import o
  export Excel, proforma, build o dipendenze;
- passi per riprodurlo, nell'ordine, con i valori usati;
- ambiente: sistema operativo, browser e versione, e come era avviato il portale
  (`dist/index.html`, `npm run dev` o `npm run preview`);
- log della console o schermate, **senza dati personali reali**;
- se c'è, una proposta di correzione.

### Tempi di risposta

| Fase | Tempo indicativo |
|---|---|
| Primo riscontro | entro 7 giorni |
| Valutazione e conferma | entro 14 giorni |
| Correzione o piano di rientro | concordato in base alla gravità |

Il progetto è curato da una sola persona: i tempi sono un impegno serio ma non
contrattuale.

## Divulgazione responsabile

Chi segnala in buona fede, senza accedere a dati altrui, senza danneggiare
servizi e senza divulgare il problema prima della correzione, **non subirà
alcuna azione legale** da parte del titolare. Su richiesta, il contributo viene
riconosciuto nella nota della correzione.

## Punti sensibili noti

Nel prototipo non sono sfruttabili da nessuno che non abbia già il portale aperto
davanti, ma sono le parti da rifare, o da presidiare, prima di un uso reale.

- **Proforma.** `src/proforma.js` compone l'intero documento come stringa HTML e
  lo scrive con `document.write` in una nuova scheda, che ha la stessa origine
  del portale. I nomi delle strutture vengono inseriti **senza escape**: un
  nome che contenesse del markup verrebbe interpretato come HTML. Prima della
  produzione ogni valore va sottoposto a escape, oppure il documento va
  costruito senza concatenare stringhe.
- **Import delle diete.** `parsaDietaExcel` in `src/diete.js` legge con ExcelJS
  un file scelto dall'utente, cioè un input non fidato. Il risultato non viene
  mai applicato direttamente: passa prima dal modale di anteprima.
- **Dati relativi alla salute.** Le schede dei pazienti della comunità
  contengono diete terapeutiche e note di preparazione: con persone vere
  sarebbero categorie particolari di dati personali ai sensi del GDPR. Nel
  repository e nelle segnalazioni devono restare **solo dati di esempio**.
- **Ruoli e permessi.** La sola lettura dell'educatore sulle diete e ogni altra
  distinzione fra ruoli sono applicate soltanto dall'interfaccia. Un sistema
  reale deve farle rispettare lato server.
- **Risorse esterne.** Aprendo il portale, il browser contatta
  `fonts.googleapis.com` e `fonts.gstatic.com` per i caratteri Fraunces e Inter.
- **Dipendenze.** ExcelJS ha preso il posto di SheetJS proprio per eliminare le
  vulnerabilità note (vedi `file.md/10-export-e-documenti.md`). Gli
  aggiornamenti arrivano come pull request di Dependabot; `npm audit fix --force`
  **non si lancia**.

## Fuori ambito

Non sono considerate vulnerabilità di questo progetto:

- l'assenza di autenticazione vera, di cifratura e di persistenza: sono scelte
  del prototipo, descritte sopra;
- le credenziali e i dati dimostrativi presenti nel codice: sono di esempio e
  non danno accesso ad alcun sistema;
- l'esposizione volontaria del server di sviluppo di Vite su una rete non
  fidata;
- vulnerabilità note di dipendenze di terze parti senza una correzione
  disponibile: vanno segnalate a chi le mantiene;
- risultati di scanner automatici senza una dimostrazione di impatto reale;
- attacchi che richiedono accesso fisico al dispositivo, ingegneria sociale o un
  browser già compromesso.
