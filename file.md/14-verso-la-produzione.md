# Verso la produzione, parte 1 — architettura, dati, sicurezza

Considerazioni tecniche per trasformare il prototipo in un sistema in uso
reale. Solo tecnica: niente tempi commerciali né compensi. Seconda parte, con
documenti, integrazioni, qualità e ordine dei lavori, in
`14b-verso-la-produzione.md`.

## Punto di partenza

Il prototipo è **tutto client-side**: dati in memoria (`data.js`, `store.jsx`),
nessun server, nessun salvataggio, password unica `dimostrazione`, "adesso"
fissato (`ADESSO_DEMO`). A ogni ricarica si riparte dal seed.

| Si riusa | Si riscrive o si butta |
|---|---|
| Componenti e pagine React, `styles.css`, tema scuro, identità per area | `store.jsx` come fonte dei dati: diventa un client delle API |
| Impaginazione dei documenti (`documento.js`, `manifesto.js`, `proforma.js`, `resoconto.js`) | Seed di `data.js` (piatti, pazienti, utenti, variazioni, ordini demo) |
| Regole di dominio pure: `ordiniChiusi`, `dietaEffettiva`, `dietaDiBase`, `menuDelGiorno`, `distintaDelGiorno`, `testoVariazioneDieta`, `valutaEquilibrio` | Mutazioni di oggetti condivisi (`PAZIENTI_COMUNITA`, catalogo piatti) |
| Catalogo dei permessi (`PERMESSI`, ruoli configurabili) | Permessi applicati solo nascondendo pulsanti |
| Codice colori WHP, allergeni, `splitPiatto` | `ADESSO_DEMO`, indici di giorno 0-6 al posto delle date |

Le regole pure vanno spostate in un **modulo condiviso** usato sia dal server
(che decide) sia dal client (che mostra), con test automatici.

## Architettura proposta

- **Frontend**: lo stesso React + Vite, servito come sito statico. Il login
  unico e l'instradamento per profilo restano; i dati arrivano dalle API.
- **Backend**: API HTTP (REST o simile) che applica **tutte** le regole: orari
  limite, permessi, perimetro per committente e centro, stati delle variazioni.
- **Database**: relazionale (PostgreSQL). I dati sono fortemente strutturati e
  collegati fra loro: committenti, centri, persone, giorni, pasti, piatti.
- **Aggiornamenti in tempo reale**: canale server → client (WebSocket o
  Server-Sent Events) per la cucina, che oggi vede arrivare ordini e variazioni
  solo perché tutto sta nella stessa scheda del browser.
- **Lavori pianificati**: chiusura ordini all'orario limite, promemoria a chi
  non ha prenotato, backup, pulizia dei dati scaduti.
- **Ambienti separati**: sviluppo, prova (staging, con dati finti) e produzione.
  I dati reali non entrano mai negli ambienti di prova.
- **Hosting in UE**, per i dati sanitari (vedi Sicurezza).

## Modello dati

Entità principali e cosa cambia rispetto al prototipo:

- **Committenti** (azienda, comunità) e **centri/reparti**: oggi
  `st.committenti` con `unita`. Ogni riga dei dati porta il committente:
  il sistema è multi-cliente e nessuno deve vedere dati di altri.
- **Utenti, ruoli e permessi**: ruoli per committente, permessi dal catalogo
  `PERMESSI`, assegnazione di centro per chi è limitato (`utente.reparto`).
- **Dipendenti** (azienda) e **pazienti** (comunità): anagrafiche separate
  dagli utenti che accedono; un dipendente può anche non avere un login.
- **Piatti e catalogo**: nome, portata, colore WHP, allergeni, ingredienti,
  marcatori, foto. Oggi coesistono piatti a catalogo e piatti "fuori catalogo"
  scritti a mano nelle diete: in produzione va deciso se le diete puntano al
  catalogo (consigliato, per allergeni e quantità affidabili).
- **Menu**: per **data**, non per indice di giorno. Piatti fissi e variabili
  diventano regole con validità (dal/al) invece di un menu unico ripetuto.
- **Diete dei pazienti**: dieta settimanale **storicizzata** con "valida dal".
  Sostituisce `dietaCongelata`: un cambio di dieta di base crea una nuova
  versione che parte dal primo giorno ancora aperto, e le settimane passate
  restano leggibili com'erano.
- **Variazioni**: tipo (dieta, presenze, altro, dieta di base), data, pasto,
  paziente o centro, prima/dopo strutturati, stato e presa in carico, autore.
- **Prenotazioni** (azienda) e **presenze trasmesse** (comunità), con data del
  servizio e momento dell'invio: sono due date diverse, come già nel prototipo.
- **Proforma e fatture**, **log operazioni**, **documenti** caricati.

Ogni tabella con dati personali ha **chi e quando** ha creato e modificato la
riga. Niente cancellazioni fisiche dove serve lo storico (ordini, variazioni,
diete, fatture): si archivia.

## Orari limite e date

- Il calcolo resta quello di `ordiniChiusi(data, oraLimite)` ma **lo decide il
  server**, con l'ora del server e il fuso **Europe/Rome** (attenzione al cambio
  dell'ora legale). Il client lo mostra soltanto.
- Orario limite **per committente** (oggi 14:00 azienda, 16:00 comunità del
  giorno prima), configurabile, con eventuali eccezioni per festivi e chiusure.
- **Congelamento all'orario limite**: alla chiusura la distinta di quel giorno
  si fissa (fotografia di ordini, presenze e variazioni). Quello che arriva dopo
  non cambia in silenzio la produzione: se ammesso, entra come eccezione
  segnalata alla cucina.
- Richieste concorrenti: due referenti sullo stesso paziente, un dipendente che
  conferma alle 13:59:59. Serve un controllo di versione sulle righe e la
  risposta del server come unica verità.

## Accesso e permessi

- **Autenticazione vera**: credenziali personali, password con hash robusto,
  recupero password via email, sessioni che scadono, blocco dopo tentativi
  falliti.
- **Secondo fattore** almeno per i ruoli che vedono dati sanitari (referente e
  responsabile di comunità, cucina) e per chi gestisce ruoli e permessi.
- **Permessi applicati dal server** su ogni richiesta, non solo nascondendo
  voci di menu come oggi: chi apre la console del browser non deve poter
  ordinare un giorno chiuso o leggere un paziente di un altro centro.
- **Perimetro sui dati** (committente, centro) applicato nel database stesso,
  per esempio con Row Level Security di PostgreSQL, così un errore nel codice
  delle API non espone dati di altri clienti.
- Il ruolo della cucina resta non modificabile da sé stesso, come oggi, per non
  chiudersi fuori.
- Eventuale accesso federato (SSO) per aziende grandi: da valutare, non serve
  all'avvio.

## Sicurezza e dati sanitari

Diete terapeutiche, allergie e patologie sono **categorie particolari di dati
personali** (GDPR art. 9). Requisiti tecnici conseguenti:

- **Cifratura** in transito (HTTPS ovunque) e a riposo (database, backup,
  file caricati come i certificati medici).
- **Hosting e backup in UE**, fornitori con accordo sul trattamento dei dati.
- **Registro degli accessi** ai dati sanitari: chi ha aperto quale scheda
  paziente e quando, non solo chi ha modificato.
- **Minimizzazione**: ogni ruolo vede il minimo. Già impostato nel prototipo
  (manifesto senza diete con prescrizione, responsabile senza nominativi) e da
  mantenere nelle API, non solo nelle pagine.
- **Conservazione e cancellazione**: tempi definiti per pazienti dimessi e
  dipendenti usciti, con cancellazione o anonimizzazione automatica.
- **Backup cifrati con prova di ripristino** periodica: un backup mai
  ripristinato non è un backup.
- Protezioni standard: limiti di richieste, intestazioni di sicurezza, CSP,
  dipendenze aggiornate (Dependabot è già configurato), nessun segreto nel
  codice del frontend.
