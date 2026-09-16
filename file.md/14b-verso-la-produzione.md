# Verso la produzione, parte 2 — documenti, integrazioni, qualità, ordine dei lavori

Seguito di `14-verso-la-produzione.md`. Solo considerazioni tecniche.

## Notifiche

- **Email** transazionali da un servizio dedicato (con SPF, DKIM e DMARC sul
  dominio, altrimenti finiscono in spam): conferma prenotazione, promemoria a
  chi non ha prenotato (oggi "Invia promemoria" è solo un avviso a schermo),
  recupero password, variazione presa in carico.
- **In app, in tempo reale**: la cucina vede comparire ordini, presenze e
  variazioni senza ricaricare; il referente vede lo stato "presa in carico".
- Coda di invio con nuovi tentativi: un'email non partita non deve bloccare un
  ordine.

## Documenti, stampa, Excel

- **PDF generati dal server** (distinta di produzione, manifesto di consegna,
  proforma, resoconti, riepiloghi): oggi sono pagine HTML aperte in una nuova
  finestra e stampate dal browser, con resa che cambia fra browser e sistemi.
  L'impaginazione di `documento.js` si può riusare con un motore di rendering
  lato server (browser headless).
- Numerazione e archiviazione: ogni documento emesso (proforma, manifesto del
  giorno) si salva com'era al momento dell'emissione.
- **Etichette pasto** su stampante termica: formato reale (oggi si ipotizza
  80×50 mm) e modello di stampante ancora da conoscere. Due strade: stampa dal
  browser con `@page` a misura, oppure linguaggio della stampante (ZPL o
  ESC/POS) tramite un piccolo servizio locale in cucina. Da scegliere dopo aver
  visto la stampante.
- **Excel**: gli export (`excel.js`, ExcelJS) possono restare nel browser o
  passare al server per file grandi. Il formato dell'export per le paghe va
  concordato con chi le elabora.
- **Import con validazione**: anagrafiche dipendenti e pazienti, diete da file
  del dietista (`diete.js`). Serve un'anteprima con errori riga per riga e un
  import tutto-o-niente, non parziale.

## Integrazioni

- **Fatturazione elettronica**: le proforma restano nel portale; la fattura vera
  (XML FatturaPA verso lo SDI) è meglio affidarla al gestionale o
  all'intermediario che MAVI già usa, via API o esportazione. Numerazione,
  aliquote e totali calcolati dal server, mai dal browser.
- **Anagrafiche esistenti**: se MAVI o le aziende hanno già elenchi di
  dipendenti (paghe, badge), valutare una sincronizzazione invece dell'import
  manuale.
- **Catalogo e ricettario**: se la cucina ha già un software di ricette e
  allergeni, il catalogo piatti dovrebbe leggerlo, non duplicarlo.

## Qualità e rilascio

In produzione cadono i vincoli del prototipo "niente test runner, niente build
step aggiuntivi" (`CLAUDE.md`): servono.

- **Test automatici** sulle regole che toccano soldi e salute:
  orari limite e fuso orario, dieta effettiva e storicizzazione, distinta di
  produzione, esclusioni fra portate, permessi e perimetro per centro, totali
  delle proforma. Più test end-to-end sui flussi principali (prenotazione →
  distinta → manifesto; presenza → variazione → etichetta).
- **Integrazione continua**: il workflow Verifica esistente diventa bloccante
  e aggiunge test, controllo dei tipi (TypeScript o JSDoc) e analisi del codice.
- **Migrazioni del database** versionate, mai modifiche a mano in produzione.
- **Monitoraggio**: errori del frontend e del backend raccolti in un servizio
  dedicato, log strutturati, avviso se i lavori pianificati (chiusura ordini,
  backup) non partono.
- **Rilasci** in orari che non toccano gli orari limite, con possibilità di
  tornare alla versione precedente.
- Prestazioni: i volumi della ristorazione collettiva sono piccoli per un
  database, ma i picchi sono concentrati (tutti prenotano prima delle 14:00).
  Va provato un carico realistico su quella finestra.

## Pulizia del codice del prototipo

- Via `ADESSO_DEMO`, `ETICHETTA_ADESSO` usata come "oggi", i seed di
  `data.js` e i dati demo in `store.jsx` (`ORDINI_IN_CODA`, statistiche fisse del
  cruscotto come "22 su 28 possibili").
- Via le funzioni solo dimostrative che mostrano un avviso senza fare nulla
  (pubblica menu, ripristino backup, "Ultimo backup 06:00", invio promemoria).
- Indici di giorno 0-6 sostituiti da date ISO in tutto il codice.
- Codice fuori flusso da decidere: moduli RSA e scuola (`Struttura.jsx`,
  `Modelli.jsx`), `Landing.jsx`, schermate `Accesso` interne ai portali.
- Stili inline e colori letterali rimasti nei componenti portati in classi.
- Bundle: il file principale supera i 500 kB; dividerlo per portale
  (caricamento a richiesta) visto che ogni utente usa un solo portale.

## Ordine tecnico consigliato

1. **Fondamenta**: database e modello dati con storicizzazione, API con
   autenticazione, permessi e perimetro, modulo condiviso delle regole con test.
2. **Portale aziendale** su dati reali: catalogo e menu per data, prenotazioni
   con orario limite lato server, distinta, manifesto, notifiche email.
   È il pilota naturale: non tratta dati sanitari.
3. **Portale comunità**: pazienti, diete storicizzate, presenze, variazioni,
   registro degli accessi ai dati sanitari, cifratura dei documenti caricati.
4. **Cucina in tempo reale**: aggiornamenti senza ricarica, congelamento della
   distinta all'orario limite, presa in carico.
5. **Stampa e integrazioni**: etichette sulla stampante reale, PDF server,
   collegamento alla fatturazione elettronica, import e sincronizzazioni.
6. **Esercizio**: monitoraggio, backup con prova di ripristino, procedura di
   rilascio, documentazione operativa per chi dà assistenza.

## Informazioni tecniche da raccogliere prima di iniziare

- Modello della stampante termica e formato reale delle etichette.
- Gestionale o intermediario usato per la fatturazione elettronica, e se
  espone API.
- Formato dell'export per le paghe richiesto dalle aziende.
- Numero di committenti, centri, dipendenti e pazienti previsti nel primo anno.
- Orari limite definitivi, festivi e chiusure; se la cena serve anche alle
  aziende.
- Da dove arrivano oggi anagrafiche e diete (file, gestionali, carta).
- Dispositivi usati in cucina e nei centri (PC, tablet, connessione stabile).
