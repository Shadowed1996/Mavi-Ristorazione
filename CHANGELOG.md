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
