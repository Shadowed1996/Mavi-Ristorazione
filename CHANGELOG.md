# Changelog

Tutte le modifiche degne di nota a questo progetto vengono annotate qui.

Il formato segue [Keep a Changelog](https://keepachangelog.com/it-IT/1.1.0/)
e il progetto adotta il [Versionamento Semantico](https://semver.org/lang/it/).

> **Nota sulla storia.** Il repository è nato con un unico commit iniziale che
> raccoglie il lavoro svolto prima della pubblicazione: le voci della versione
> `0.1.0` descrivono quindi il contenuto di quel commit, non una sequenza di
> rilasci. Il racconto sessione per sessione, compresa la revisione del codice
> del 3 settembre 2026, è in [`MAVI_Stato_Progetto.md`](MAVI_Stato_Progetto.md).

## [Non rilasciato]

### Aggiunto — 12 settembre 2026, seconda sessione
- **Nuovo committente**: modulo completo in Committenti (`ModaleCommittente`,
  `Modelli.jsx`) che crea una struttura vera, visibile subito in Committenti,
  Impostazioni, Fatturazione, Produzione e Ordini in arrivo
  (`st.aggiungiCommittente` in `store.jsx`).
- **Modifica profilo**: icona sul blocco utente di ogni portale (`Telaio` in
  `ui.jsx`), modale `ModificaProfilo` per nome, email, telefono, password
  dimostrativa e foto, salvati in `st.profili` per username.
- **Manifesto di consegna nominativo** (`src/manifesto.js`,
  `generaManifestoConsegna`): dal drill-down azienda di Ordini in arrivo, PDF
  stampabile riservato al fornitore con chi ha ordinato cosa, per il cassone
  termico. Alimentato da `st.nominativiAzienda` (seme `ETICHETTE_AZIENDA_DEMO`,
  prima mai usata, più le conferme reali della demo).
- Distinzione fra **"generato il"** (quando l'ordine è stato trasmesso,
  `st.oraConferma` per l'azienda, `generatoIl` per le presenze comunità) e
  **"per il giorno"** (a quale giorno del menu si riferisce), in "Ordini in
  arrivo" e nell'export Excel.
- Campo **Reparto** nel modale Utenti della Gestione portale MAVI, per il ruolo
  Educatore (solo visualizzazione coerente con l'anagrafica di accesso, non
  collegato al login reale).

### Modificato — 12 settembre 2026, seconda sessione
- **Committenti**: anagrafica, configurazione di servizio e listino sono ora
  un solo record per committente in `st.committenti` (stato React, non più un
  array statico più due dizionari separati in `Modelli.jsx`/`Fornitore.jsx`).
- **Fatturazione**: prezzo unitario e IVA sono per committente (impostabili in
  Impostazioni per committente), non più un prezzo fisso uguale per tutti.
  "Genera proforma unica PDF" per tutte le strutture insieme, bottone PDF per
  riga per un documento separato. `proforma.js`, `generaProformaPDF` accetta
  `prezzo`/`ivaPercentuale` per riga.
- **Permessi comunità**: l'educatore non è più in sola lettura su tutto.
  Vede e modifica dieta/menu solo dei pazienti del proprio reparto (campo
  `stanza` del paziente, `reparto` dell'utente); elimina, modifica anagrafica e
  nuovo paziente restano solo del responsabile. Presenze e Resoconti si
  filtrano allo stesso modo. `st.trasmettiPresenze` ora aggiorna per id invece
  di sovrascrivere, così più reparti possono trasmettere in momenti diversi.
- **Ordini in arrivo** (`FlussiOrdine` in `Fornitore.jsx`): riscritta da un
  elenco statico di eventi a un drill-down per committente sullo stesso stato
  condiviso di Produzione e Presenze, con export Excel globale (un foglio per
  struttura) o per singola struttura.
- "Nuovo paziente" ed "Elimina" nel portale comunità ora mutano anche l'elenco
  condiviso `PAZIENTI_COMUNITA`, non solo lo stato locale della pagina: prima
  un paziente creato lì non compariva in Presenze, Resoconti o Etichette.

### Rimosso — 12 settembre 2026, seconda sessione
- `CONTRIBUTI_STRUTTURE` e `IMPOSTAZIONI_INIZIALI` in `Fornitore.jsx`,
  `FLUSSI_ORDINE` in `data.js`: sostituiti da `st.committenti` e dal nuovo
  "Ordini in arrivo". Come effetto collaterale, RSA e Scuola sono sparite dalla
  distinta di produzione, dove comparivano nonostante fossero fuori perimetro
  (punto aperto della sezione 16 di `MAVI_Stato_Progetto.md`).

### Rimosso
- `src/aree/Extra.jsx` (731 righe): codice morto, nessuno dei sette export era
  più importato da alcun file. Riferimenti aggiornati in `CLAUDE.md`,
  `README.md` e nei documenti tematici di `file.md/`.
- CSS morto in `src/styles.css`: famiglie di classi non più referenziate da
  alcun JSX (`.tessera*`, `.tv-*`, `.cassetto*`, `.piatto-card*`,
  `.riga-piatto`, `.fase*`/`.fasi`/`.roadmap`, `.so-anteprima*`, `.comm-card*`,
  `.cat-tab*`, `.filtri-colore`, `.scelta-riga*` e altre minori). File da 6159
  a 5284 righe.

### Corretto
- `Fornitore.jsx`, componente `Produzione`: intestazione della tabella
  "Quantità da produrre" allineata al corpo reale (solo Azienda e Comunità,
  non più anche RSA e Scuola).
- `Cliente.jsx`/`store.jsx`: "Prenota per lui" nel cruscotto del referente ora
  scrive davvero l'ordine nel vassoio condiviso (`st.scegli`/`st.conferma`),
  quindi compare nella distinta di produzione MAVI; il log riporta il
  dipendente per cui si prenota invece del nome fisso "Antonella Rossi".
- `Cliente.jsx`, cruscotto: il riquadro "Dipendenti attivi" è ora calcolato da
  `DIPENDENTI` invece di essere un valore fisso.
- `LEGGIMI.md`: il perimetro descritto (tre portali attivi, non cinque) e la
  promessa di funzionamento offline (i font Fraunces/Inter arrivano da Google
  Fonts) ora corrispondono al prototipo reale.
- `ui.jsx`, componente `Illustrazione`: la scheda piatto (e ogni card) restava
  vuota per la durata dei tentativi falliti sulle estensioni della foto
  (`jpg`/`jpeg`/`png`/`webp`), prima di ripiegare sull'illustrazione. Ora
  l'illustrazione è il primo render e la foto la sostituisce solo a
  caricamento riuscito.
- Settimana della demo aggiornata dal 31 agosto - 4 settembre al 14-18
  settembre 2026 (aziende, `GIORNI` in `data.js`) e al 14-20 settembre per le
  comunità (`Struttura.jsx`): era rimasta ferma alla settimana in cui è nato
  il prototipo. Aggiornate tutte le intestazioni "Settimana 36"/date fisse nei
  portali dipendente, referente, comunità e MAVI; l'indice di default di
  "Menu della settimana" e "Griglia della settimana" ora punta alla settimana
  reale invece che alla prima della lista. Con la settimana reale interamente
  futura rispetto a "oggi" (12 settembre), lunedì e martedì non sono più
  `chiuso: true`: nessun giorno ha ancora superato il cutoff, quindi nessuno
  va bloccato. Il "Menu del giorno" apre di default su lunedì (prima apriva
  su mercoledì, il primo giorno aperto quando lunedì/martedì erano chiusi).

### Aggiunto
- Documentazione e file di controllo standard del repository: `README.md`,
  `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` e questo
  `CHANGELOG.md`.
- Template di issue e pull request e `CODEOWNERS` in `.github/`.
- Workflow di verifica non bloccante: file standard, sintassi JSON, `npm ci`,
  `npm run build` e controllo che `dist/` sia allineata ai sorgenti.
- `dependabot.yml` per npm e per le GitHub Actions.
- `.editorconfig` e `.gitattributes`.

### Modificato
- `.gitignore` esteso con cache, file di editor e archivi locali; `dist/`
  resta versionata di proposito.
- Requisito di Node.js corretto in `LEGGIMI.md`, `CLAUDE.md` e
  `file.md/01-avvio-e-build.md`: non Node 18, ma 20.19 o superiore (22.12 per
  la serie 22), come richiede Vite 8.
- `CLAUDE.md` e `file.md/01-avvio-e-build.md` descrivono i nuovi file del
  repository e cosa entra nello zip per il cliente.

### Corretto
- `package-lock.json` riallineato a `package.json`: dichiarava ancora
  `typescript`, `@types/react` e `@types/react-dom` e non conteneva `uuid`
  annidato sotto `exceljs`, per cui `npm ci` si fermava con un errore.
- `file.md/10-export-e-documenti.md` diceva che la proforma lancia la stampa da
  sola: la stampa parte dal pulsante in cima al documento.

### Sicurezza
- La proforma (`src/proforma.js`) e la scheda stampabile del piatto
  (`schedaPdf` in `src/ui.jsx`) inserivano nell'HTML i nomi delle strutture e i
  campi del catalogo senza escape: un valore contenente markup veniva
  interpretato nella nuova scheda, che ha la stessa origine del portale. Ora
  ogni valore passa da `testoHtml`. `dist/` rigenerata.

## [0.1.0] - 2026-09-03

Prima versione pubblicata del prototipo.

### Aggiunto
- **Applicazione React 19 con Vite 8**, tutta lato client, con base relativa
  perché `dist/index.html` si apra con un doppio clic anche senza rete.
- **Build statica versionata** in `dist/`, pronta per la presentazione.
- **Preloader** di apertura, mostrato una volta per sessione
  (`src/Preloader.jsx`).
- **Accesso unico** con i profili di prova e instradamento al portale in base
  al profilo (`src/Accesso.jsx`, `src/App.jsx`).
- **Portale azienda, dipendente** (`src/aree/Dipendente.jsx`): menu del giorno
  a tre colonne con le alternative, piatto unico, scheda piatto con
  ingredienti, allergeni e valori nutrizionali, vassoio con l'indicatore del
  pasto equilibrato, diete personali, menu della settimana.
- **Portale azienda, referente** (`src/aree/Cliente.jsx`): cruscotto con
  «Prenota per lui», resoconti per dipendente, export Excel ed export per le
  paghe, fatture con proforma.
- **Portale comunità** (`src/aree/Struttura.jsx`, `src/aree/Comunita.jsx`):
  anagrafica dei pazienti, dieta settimanale con pranzo e cena, modifica in
  linea riservata al responsabile, template Excel per il dietista e import con
  anteprima, presenze del giorno condivise, resoconti per giorno e settimana.
- **Portale MAVI** (`src/aree/Fornitore.jsx`, `src/aree/Modelli.jsx`):
  distinta di produzione da tutte le strutture, ordini in arrivo, giri di
  consegna, etichette pasto anonime e nominative, committenti, menu della
  settimana, catalogo piatti con caricamento delle fotografie, impostazioni e
  rotazione del menu, proforma, log operazioni, gestione del portale.
- **Indicatore di pasto equilibrato** secondo il codice colori WHP di Regione
  Lombardia, con la regola adattata al piatto unico.
- **Esportazioni**: fogli `.xlsx` con ExcelJS (`src/excel.js`), template e
  lettura delle diete (`src/diete.js`), proforma HTML per la stampa
  (`src/proforma.js`).
- **Tema chiaro, scuro o automatico**, memorizzato in `localStorage`.
- Cartelle `public/foto`, `public/marchio` e `public/documenti`, con le
  istruzioni d'uso nei rispettivi `LEGGIMI.txt`.
- Documentazione di progetto: `LEGGIMI.md` per il cliente, `CLAUDE.md` e i
  quattordici documenti tematici di `file.md/`, il diario
  `MAVI_Stato_Progetto.md`.

[Non rilasciato]: https://github.com/Shadowed1996/Mavi-Ristorazione/compare/bf9eddad60a9f831ad6e242c65c54133bbe4c64f...main
[0.1.0]: https://github.com/Shadowed1996/Mavi-Ristorazione/tree/bf9eddad60a9f831ad6e242c65c54133bbe4c64f
