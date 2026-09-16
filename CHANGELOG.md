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

### Corretto — 16 settembre 2026, cambi di dieta dalla scheda paziente
- **La scheda del paziente cambia la dieta settimanale e avvisa la cucina**:
  prima la modifica riscriveva la dieta di tutte le settimane **senza avvisare
  MAVI** e senza lasciare traccia. Ora ogni cambio arriva in Ordini in arrivo
  come "Dieta di base" ("Ogni domenica, da…") e le quantità di Produzione si
  aggiornano.
- **Le eccezioni di un solo giorno si fanno da Variazioni**: dalla scheda, "Serve
  solo per un giorno? Fai una variazione" apre Variazioni con il paziente già
  scelto. Nessuna delle due pagine chiede più "solo quel giorno o sempre".
- **I giorni chiusi non si toccano**: un cambio della dieta settimanale su un
  giorno già chiuso vale dalla prossima settimana, e la scheda lo scrive. La
  griglia mostra anche le eccezioni della settimana ("solo questa settimana").
- **Carica dieta da Excel** segue la stessa regola e manda un avviso a MAVI con
  i piatti cambiati.

### Corretto — 16 settembre 2026, tema scuro
- **Accenti leggibili nel tema scuro in ogni portale**: il blu del referente,
  la prugna della comunità e il verde della cucina restavano quelli del tema
  chiaro e sul fondo scuro non si leggevano (voce di menu attiva, secondi
  dell'orologio, selettore del tema, icone dei documenti). Ogni area ha ora un
  tono chiaro per i testi e uno pieno per bottoni e tab selezionate.
- **Testi secondari più chiari** nel tema scuro, e date e stati dei giorni
  selezionati leggibili.
- **Riquadri e numeri che restavano chiari** nel tema scuro (centro assegnato,
  pazienti esclusi, errori d'importazione, Presenti e Assenti, bottoni rossi e
  verdi) ora seguono il tema.

### Cambiato — 16 settembre 2026, settimana intera e orologio
- **Tutta la settimana visibile in ogni portale**: lunedì, martedì e mercoledì
  compaiono con il lucchetto e la dicitura "chiuso", giovedì e venerdì restano
  prenotabili. Vale per dipendente (menu del giorno, menu della settimana, le
  mie prenotazioni), referente aziendale (ordini del giorno), referente della
  comunità (variazioni, giorni chiusi non selezionabili) e cucina (produzione,
  ordini in arrivo, composizione del menu).
- **I giorni chiusi sono in sola lettura ovunque**: non si sceglie, non si
  conferma, non si disdice, non si prenota per conto di altri, non si mandano
  promemoria né variazioni, e la cucina non ne cambia il menu. Il blocco è
  anche nello stato condiviso, non solo nei pulsanti.
- **Orologio HH:MM:SS** in fondo alla barra laterale di ogni portale, con la
  data (visibile dove c'è la barra laterale).
- **Menu del giorno a schermata fissa su desktop**: intestazione compatta,
  settimana e giorni su una riga, colonne a tutta altezza con scorrimento solo
  dentro la lista quando i piatti non ci stanno, piatto unico centrato sotto le
  colonne e box dei giorni con caratteri più piccoli. La pagina non scorre più; su schermi piccoli resta com'era.
- **Tolto il nastro nero "Prototipo dimostrativo"** in cima a tutte le pagine:
  le pagine non scorrono più quando il contenuto sta nella finestra e la barra
  laterale occupa l'altezza piena.

### Cambiato — 16 settembre 2026, manifesto con i riquadri
- **Ogni dipendente dentro il suo riquadro** sul manifesto di consegna, sempre
  in colonna unica: testata con nome, reparto e matricola, le portate una per
  riga e le allergie dichiarate su fascia in fondo. Il riquadro non si spezza
  fra due pagine.
- **Solo la data** nella giornata del manifesto, senza il giorno della
  settimana.
- **Riquadri in testa al manifesto su una riga sola**, valori in maiuscolo e
  centrati: il nome della struttura non va più a capo dentro il box. Gli altri
  documenti tengono i riquadri di sempre.

### Cambiato — 16 settembre 2026, manifesto di consegna ed etichette
- **Manifesto di consegna riscritto, in colonna unica**: via il "Totale per
  piatto" in testa (la cucina ce l'ha già dalla distinta di produzione) e via
  le tabelle. Adesso è una persona sotto l'altra, in ordine alfabetico: nome e
  cognome, reparto, matricola e il pasto scritto per esteso una portata per
  riga.
- **Il manifesto non è più riservato al fornitore**: lo stampano in autonomia
  sia la cucina sia il referente dell'azienda, quindi via la fascetta "non
  esporre al cliente". Proprio per questo le diete con prescrizione medica non
  compaiono più: in chiaro restano solo le allergie dichiarate dal dipendente.
- **Etichette pasto ridotte all'essenziale**, aziendali anonime e comunità
  nominative: nome e cognome (solo in comunità), portata, nome del piatto e
  note. Via ingredienti, allergeni, kcal e riga di riscaldamento.

### Cambiato — 15 settembre 2026, stati delle proforma
- **Lo stato si vede sulla proforma**: timbro NON PAGATA (con la scadenza),
  PAGATA, ANNULLATA o STORNATA (con la data) stampato sul documento, più il
  riquadro Stato e la nota. In Fatturazione le azioni "Segna pagata" e
  "Storna" accanto ad "Annulla"; nei portali cliente lo stato si legge "non
  pagata", "pagata", "annullata", "stornata".
- **Tolta la scheda Fatturazione della Gestione portale** con le condizioni
  predefinite a 30 giorni: ogni committente ha le sue, e un nuovo committente
  deve scegliere i termini. Le note standard proforma sono in Dati aziendali.
- **Audit del sito** (58 pagine, desktop e telefono): tabella proforma di
  Fatturazione ricomposta (non taglia più pulsanti e "Apri"), importi e numeri
  che non vanno più a capo nelle tabelle, Menu settimana della cucina senza
  scorrimento orizzontale sul telefono, testi rimasti su "il responsabile".

### Cambiato — 15 settembre 2026, giorni chiusi e riepiloghi
- **Giorni chiusi agli ordini, calcolati**: con "adesso" fissato a martedì 15
  settembre alle 22:56 e gli orari limite dei committenti, lunedì, martedì e
  mercoledì sono chiusi. Dipendente e referente vedono solo giovedì e venerdì,
  la comunità da giovedì a domenica (presenze della demo spostate su giovedì).
  In produzione "adesso" sarà l'ora vera.
- **Riepilogo ordini del referente aziendale**: tutti i dipendenti del giorno,
  ognuno con sotto il suo pasto, su due colonne, con totale e chi non ha
  ordinato (al posto della tabella a cinque colonne).
- **Riepilogo del dipendente** ridotto all'ordine: il nome e, sotto ogni
  giorno, il pasto.
- **Manifesto della cucina** più dettagliato: totale per piatto con allergeni
  e porzioni, poi matricola, reparto, portate, dieta e allergie di ognuno.
- Ordini in arrivo: il dettaglio nominativo e il manifesto si vedono anche
  senza conferme dal vivo.

### Cambiato — 15 settembre 2026, variazioni e settimana delle comunità
- **Variazioni per tipo**: Presenze apre lo stato del paziente sbloccato (da
  assente a presente e viceversa), Dieta apre la sua dieta attuale del giorno
  da riscrivere, Altro apre il testo libero. Presenze e dieta si applicano
  subito: presenze del giorno, righe già trasmesse e quantità della distinta.
- **Le comunità vanno da lunedì a domenica**: giorni delle variazioni, scheda
  paziente, resoconti della settimana, template Excel del dietista e distinta
  di Produzione (sabato e domenica l'azienda risulta "nessun servizio").

### Aggiunto — 15 settembre 2026, vocale di MAVI
- **Referente e responsabile amministrativo**: nel portale comunità i ruoli
  diventano "Referente" (pazienti, diete, presenze e variazioni di tutte le
  strutture e i reparti) e "Responsabile amministrativo" (solo Fatture e
  Resoconti numerici, entra in Fatture). Un solo referente di prova,
  `samuele.ferri`.
- **Variazioni**: il referente scrive alla cucina cambi di dieta, ospiti in
  più o in meno, uscite; la cucina le trova in Ordini in arrivo e in
  Produzione (schermo, PDF, Excel) e le prende in carico, il referente vede
  data, ora e chi.
- **Resoconti per l'amministrazione** senza nomi né diete: pasti per centro e
  per pasto, giorno e settimana, con Excel e PDF uguali allo schermo.
- **Fatture** leggibili a colpo d'occhio: da saldare, scaduto, prossima
  scadenza, pagato.
- **Distinta di produzione divisa per committente e per centro**: una riga
  per centro con il suo referente, una scheda di consegna per destinazione
  su pagina nuova nel PDF, Excel in cinque fogli, piatti quasi omonimi
  segnalati "da verificare".

### Corretto — 15 settembre 2026
- Produzione: il filtro Cena contava i pasti del pranzo dell'azienda; la stima
  dell'azienda si sommava intera alle conferme; il primo centro che
  trasmetteva azzerava la stima degli altri; l'Excel non riportava giornata e
  perimetro; intestazioni della settimana diverse fra schermo ed export.
- Presenze: un paziente ritrasmesso assente restava nella distinta; un centro
  che trasmetteva tutti assenti tornava alla stima (ora "trasmesso, nessun
  pasto"); più pazienti segnati in rapida successione perdevano i clic.
- Documenti PDF: la riga di totale in posizione pari aveva il testo invisibile.
- Nomi dei file Excel con lettere accentate troncate ("Comunit_").

### Aggiunto — 14 settembre 2026, TO DO MAVI (nove punti del cliente)
- **`src/documento.js`**: impaginazione A4 condivisa per tutti i documenti
  stampabili (proforma, manifesto, resoconti, scheda piatto), un solo CSS,
  intestazione ripetuta su più pagine, mittente dai dati aziendali, avviso
  nel portale e download di ripiego se il browser blocca la scheda.
- **`src/resoconto.js`**: i bottoni PDF che mostravano solo un avviso ora
  producono documenti veri: Resoconti del referente (stessi numeri
  dell'Excel), Resoconti della comunità (una tabella per pasto), Resoconto
  della struttura, riepilogo prenotazioni del dipendente; anche il log
  operazioni esporta un Excel vero.
- **Pazienti con pranzo e cena indipendenti**: campo `pasti` in anagrafica
  (caselle Pranzo/Cena), presenze segnate e trasmesse per pasto senza
  cancellarsi a vicenda, etichette e ordini in arrivo distinti per pasto.
- **Fatturazione per committente e proforma create a mano**: termini di
  pagamento, metodo, regime IVA con dicitura di esenzione, CF/PEC/SDI sul
  committente; condizioni predefinite in Gestione portale; "Nuova proforma"
  con righe e condizioni modificabili, numerazione `PRO-2026/NNN`, scadenza
  calcolata, elenco ed annullamento; i portali cliente vedono solo le proprie.
- **Riepilogo del giorno del referente**: pannello "Ordini del giorno" con
  selettore dei cinque giorni, anteprima nominativa della sola azienda e
  "Stampa riepilogo" intestato `MARTEDÌ - 15/09/2026`; "Chi non ha
  prenotato" calcolato; manifesto MAVI filtrato per giornata.
- **Menu della settimana**: ogni piatto di ogni portata si rende fisso dal
  catalogo o dalla riga del giorno; tolto "Aggiungi il primo come piatto
  fisso".
- **Permessi e ruoli applicati davvero**: `PERMESSI` (68 chiavi per i tre
  portali) e `RUOLI_INIZIALI`; sessione, `puo(chiave)`, ruoli e utenti nello
  store; tab "Ruoli e permessi" in Gestione portale con matrice per portale,
  nuovo ruolo e copia; utenti creati da interfaccia che entrano davvero,
  disattivati che non entrano; voci di menu e azioni di ogni portale
  condizionate al volo; Cucina MAVI bloccata e guardia sull'ultimo
  amministratore; log con l'utente reale della sessione.
- **Produzione per giorno e per settimana**: navigazione fra le cinque
  giornate con la data sempre visibile, vista settimanale piatto × lun–ven,
  filtro per tipo, committente e pasto; azienda dai nominativi del giorno più
  una stima dichiarata, comunità dalle presenze trasmesse per giorno e pasto
  o stima dalle diete; "Stampa / PDF" con documento dedicato ed Excel vero;
  tolti i numeri fissi (diete "+ 4", "ultima chiusura" delle scuole).

### Corretto — 14 settembre 2026
- Stile dei campi email e telefono in "Modifica profilo", identico agli altri.
- "Prenota per lui" del referente: non sporca più il carrello del dipendente
  demo, niente righe vuote o doppioni, reparto e matricola veri.
- Trasmettere la cena della comunità cancellava il pranzo già trasmesso.
- Apertura dei documenti dopo un `import()` dinamico, che faceva bloccare la
  scheda ai browser: ora i moduli documento si importano staticamente.
- `FATTURE` statico condiviso fra azienda e comunità: Il Ponte vedeva gli
  importi di Rossi.

### Modificato — 14 settembre 2026
- `proforma.js`, `manifesto.js` e `schedaPdf` riscritti su `documento.js`;
  intestazione degli Excel dai dati aziendali quando compilati.
- `GIORNI` con data ISO, `nominativiAzienda` con `indiceGiorno` e reparto
  vero, `conferma(giorno, chi, piatti?)`.
- `file.md/09-portale-mavi.md` diviso in due (`09b-portale-mavi-gestione.md`).

### Aggiunto — 12 settembre 2026, quarta sessione
- **Etichette pasto** riscritta per reggere molte strutture (Filippo: "se io
  avessi 20 aziende e 30 comunità dovrei scrollare 3000 etichette"): pannelli
  separati "Aziende"/"Comunità", una struttura alla volta con ricerca dentro,
  vista di stampa dedicata per singola struttura (mai la pagina intera),
  raggruppamento aggiuntivo per reparto nella comunità.
- **Pallino "etichette arrivate"**: indicatore lampeggiante (`.pallino-nuovo`)
  su una struttura le cui etichette sono aumentate dall'ultima apertura;
  sparisce aprendo il dettaglio.

### Modificato — 12 settembre 2026, quarta sessione
- `EtichettePasto` (`Fornitore.jsx`): card azienda/comunità estratte in
  componenti riusabili (`CardEtichettaAzienda`, `CardEtichettaComunita`,
  `SezioneAzienda`, `SezioneComunita`) condivisi fra la vista a elenco e la
  vista di stampa, invece di essere duplicati.

### Aggiunto — 12 settembre 2026, terza sessione
- **Reparti gestibili**: pannello "Reparti" in Impostazioni per committente
  (sostituisce "Rotazione menu", rimossa perché non dipendeva nemmeno dal
  committente selezionato) per aggiungere o togliere reparti/unità
  (`c.unita`). Alimenta due nuovi menu a tendina: "Stanza / struttura" nel
  modulo paziente e "Reparto assegnato" per l'Educatore in Gestione portale →
  Utenti — prima erano testo libero.
- **Fatturazione**, seconda riscrittura: un tab per committente come azione
  principale ("Genera proforma PDF"/"Scarica Excel" per quella sola
  struttura, con il suo listino), più un pannello "Tutte le strutture" per il
  riepilogo e il documento combinato.

### Modificato — 12 settembre 2026, terza sessione
- "Frutta a ogni pasto" e "Consegna in monoporzione nominativa" non sono più
  toggle editabili in Impostazioni per committente ("sono già decise"):
  restano campi fissi sul committente.
- CSS: `input[type="number"]` e `select` dentro `.impo-riga` avevano lo stile
  di default del browser (nessuna delle regole esistenti li copriva, solo
  `input[type="text"]`) — il campo IVA ne era l'esempio più visibile.
  Allineati alla stessa styling, spinner nativi del number nascosti, freccia
  disegnata per le select. Aggiunta anche `.campo select` per il nuovo menu a
  tendina del modulo paziente.
- I due reparti/case demo della comunità sono stati rinominati ovunque da
  "Casa Aurora"/"Casa Ulivo" (nome di un vecchio modello di ordinazione mai
  collegato ai pazienti reali) a "Spazio Giovani SGA"/"CSS Sole Luna, Desio",
  gli stessi nomi già usati come `stanza` dei pazienti: `COMMITTENTI.unita`,
  `ORDINI_UNITA.comunita`, i due giri di consegna in `GIRI`.

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
