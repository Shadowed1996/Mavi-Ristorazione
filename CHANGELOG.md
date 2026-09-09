# Changelog

Tutte le modifiche rilevanti a questo progetto sono documentate in questo file.

Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.1.0/)
e il progetto adotta il [Versionamento Semantico](https://semver.org/lang/it/).

## [Non rilasciato]

### Aggiunto

- Documentazione standard del repository: `README.md`, `LICENSE`, `SECURITY.md`,
  `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` e questo changelog.
- Template per le issue (segnalazione di bug e richiesta di funzionalità) e per le
  pull request, con `CODEOWNERS`.
- Workflow di verifica non bloccante e configurazione di Dependabot per npm e
  GitHub Actions.
- File di controllo `.editorconfig` e `.gitattributes`.

## [0.1.0] — 2026-09-08

Prima versione del prototipo, corrispondente al commit iniziale del repository.

### Aggiunto

- Applicazione React 19 con Vite 8, base relativa per l'apertura della build da file locale.
- Accesso unico (`src/Accesso.jsx`) con profili di prova e instradamento al portale in base
  al profilo (`src/App.jsx`).
- Portale azienda con i ruoli dipendente e referente aziendale
  (`src/aree/Azienda.jsx`, `src/aree/Dipendente.jsx`, `src/aree/Cliente.jsx`).
- Portali RSA, comunità e scuola sull'impianto comune di `src/aree/Struttura.jsx`, con la
  configurazione per struttura, i ruoli e le pagine di comunità in `src/aree/Comunita.jsx`.
- Modelli di servizio riusati fra i portali: ordinazione per unità, presenze e ospiti RSA
  (`src/aree/Modelli.jsx`).
- Pagine trasversali: coda di approvazione, distinta unica di produzione, giri di consegna,
  etichette pasto, menu ciclico e impostazioni del committente (`src/aree/Extra.jsx`).
- Portale della cucina MAVI con produzione, ordini in arrivo, consegne, etichette,
  committenti, menu settimana, catalogo piatti, fatturazione, log operazioni, gestione del
  portale e archivio documenti (`src/aree/Fornitore.jsx`).
- Stato condiviso in `src/store.jsx` con ordini, menu, documenti, utenti e tema
  (chiaro, scuro o automatico, memorizzato in `localStorage`).
- Dati dimostrativi completi in `src/data.js`: piatti, menu settimanale, allergeni,
  categorie, committenti, diete terapeutiche, consistenze e fasce scolastiche.
- Componenti condivisi e illustrazioni vettoriali dei piatti in `src/ui.jsx`, con ricaduta
  automatica sull'illustrazione quando manca la fotografia.
- Indicatore di pasto equilibrato secondo il codice colori WHP di Regione Lombardia, con
  regola adattata al piatto unico.
- Esportazioni in `.xlsx` con ExcelJS e FileSaver (`src/excel.js`), template Excel per le
  diete e lettura del file compilato (`src/diete.js`), proforma impaginato per la stampa
  (`src/proforma.js`).
- Preloader di apertura mostrato una sola volta per sessione (`src/Preloader.jsx`).
- Vetrina dei cinque portali con le rispettive identità cromatiche (`src/Landing.jsx`).
- Cartelle pubbliche `foto`, `marchio` e `documenti` con le relative istruzioni d'uso.
- Manuale del prototipo in `LEGGIMI.md`.

[Non rilasciato]: https://github.com/Shadowed1996/Mavi-Ristorazione/compare/main...HEAD
[0.1.0]: https://github.com/Shadowed1996/Mavi-Ristorazione/releases/tag/v0.1.0
