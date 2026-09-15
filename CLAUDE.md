# CLAUDE.md — MAVI Ristorazione, prototipo portali

Guida operativa per Claude Code su questo repository. Leggere questo file per
primo, poi il documento tematico che serve dentro `file.md/`.

---

# 0. REGOLE DI COMPORTAMENTO — leggere prima di tutto

Queste regole valgono per ogni risposta e ogni modifica, e prevalgono sulle
abitudini di default.

## Tono e stile di risposta

- **Gentile e cordiale.** Tono sempre educato, cordiale e professionale. La
  brevità non deve mai risultare fredda o sgarbata.
- **Nessuna verbosità.** Niente preamboli lunghi, convenevoli eccessivi o
  riassunti finali superflui.
- **Commenti al codice essenziali.** Non inserire commenti ridondanti per
  spiegare codice ovvio (es. `// incrementa i`). Scrivere codice pulito e
  auto-esplicativo. I commenti si riservano a logiche complesse, note di
  sicurezza o casi limite.
- **Diretto e concreto.** Fornire la soluzione in modo chiaro. Spiegazioni
  minime e precise, solo se servono a chiarire scelte architetturali non banali.

## Qualità ed esecuzione, best effort

- **Codice pronto per la produzione.** Niente placeholder, blocchi incompleti
  (`// ... resto del codice`) o TODO, salvo richiesta esplicita.
- **Correttezza prima di tutto.** Priorità assoluta a correttezza, type safety
  e gestione solida degli errori.
- **Standard idiomatici.** Rispettare rigorosamente convenzioni, formattazione
  e pattern del linguaggio e del progetto in uso.
- **Modifiche mirate.** Preferire interventi precisi e localizzati, invece di
  riscrivere interi file senza necessità.

## Struttura della risposta

1. **Soluzione o codice**, subito, con una breve introduzione cortese.
2. **Contesto**, facoltativo: da uno a tre punti elenco sintetici, solo se ci
   sono motivazioni tecniche non evidenti.

---

## 1. Cos'è questo progetto

Prototipo di presentazione per **MAVI Ristorazione** (ristorazione collettiva).
Applicazione React + Vite, tutta client-side. **Non c'è backend, non c'è
database, non c'è persistenza**: i dati stanno in memoria in `src/data.js` e
nello stato React di `src/store.jsx`. L'unica cosa salvata è il tema in
`localStorage` (chiave `mavi-tema`).

Serve a mostrare al cliente come funzionerebbe il prodotto reale. Ogni scelta
va valutata con questo metro: **deve reggere una demo dal vivo**, non deve
reggere il carico di produzione.

Lingua del codice e dell'interfaccia: **italiano**. Nomi di variabili, funzioni,
componenti, classi CSS e commenti sono in italiano. Mantenere questa convenzione.

## 2. Comandi

```
npm install       installazione dipendenze (Node 20.19+, lo richiede Vite 8)
npm run dev       server di sviluppo su http://localhost:5173, apre il browser
npm run build     build statica in dist/
npm run preview   anteprima della build su porta 4173
```

Consegna al cliente: doppio clic su `dist/index.html`, funziona offline.
Se si tocca `src/`, **ricostruire `dist/`** prima di consegnare.

**Mai lanciare `npm audit fix --force`.**

## 3. Struttura del repository

```
PROTOTIPO/
  index.html                punto d'ingresso Vite
  vite.config.js            config + logger custom con banner ASCII
  package.json
  LEGGIMI.md                istruzioni per il cliente (non tecniche)
  MAVI_Stato_Progetto.md    diario di progetto, va aggiornato a fine task
  CLAUDE.md                 questo file
  file.md/                  documentazione tematica per Claude
  README.md                 presentazione del repository su GitHub
  LICENSE                   licenza proprietaria, tutti i diritti riservati
  CHANGELOG.md              registro delle modifiche, sezione Non rilasciato
  CONTRIBUTING.md           vincoli, flusso di lavoro, commit, checklist PR
  SECURITY.md               segnalazioni di sicurezza, punti sensibili noti
  CODE_OF_CONDUCT.md        codice di condotta
  .github/                  template issue e PR, CODEOWNERS, Dependabot,
                            workflow Verifica (build e dist/ allineata)
  public/
    documenti/              PDF scaricabili dal portale
    foto/                   fotografie dei piatti, nominate <codice>.jpg
    marchio/                logo.png, se presente sostituisce la scritta MAVI
  dist/                     build statica, generata
  src/
    main.jsx                bootstrap React
    App.jsx                 instradamento per profilo dopo il login
    Accesso.jsx             login unico
    Preloader.jsx           animazione di apertura
    Landing.jsx             pagina di scelta portale (non nel flusso attivo)
    store.jsx               Provider + usaStato(), tutto lo stato condiviso
    data.js                 piatti, menu, anagrafiche, costanti di dominio
    ui.jsx                  icone, illustrazioni SVG, componenti condivisi
    styles.css              sistema visivo completo, tema chiaro e scuro
    excel.js                export Excel con ExcelJS
    diete.js                template e parser Excel delle diete
    proforma.js             proforma HTML stampabile, listino per riga
    manifesto.js            manifesto di consegna nominativo, riservato al fornitore
    aree/
      Azienda.jsx           smistamento ruolo azienda
      Dipendente.jsx        portale dipendente
      Cliente.jsx           portale referente aziendale
      Struttura.jsx         telaio generico struttura (comunità, RSA, scuola)
      Comunita.jsx          pagine del portale comunità
      Fornitore.jsx         portale MAVI (cucina)
      Modelli.jsx           componenti condivisi fra modelli di ordinazione
```

## 4. Documentazione tematica

Tutti i file stanno in `file.md/` e sono sotto le 200 righe. Leggere solo
quello che serve al task in corso.

| File | Quando leggerlo |
|---|---|
| `file.md/00-indice.md` | indice completo, punto di partenza |
| `file.md/01-avvio-e-build.md` | build, dist, consegna, asset in `public/` |
| `file.md/02-architettura.md` | flusso di login, instradamento, albero componenti |
| `file.md/03-store.md` | API completa di `usaStato()` |
| `file.md/04-dati.md` | forma dei dati in `data.js`, codice colori WHP |
| `file.md/05-ui-e-stile.md` | `Telaio`, `Intestazione`, `Velo`, classi CSS, tema scuro |
| `file.md/06-portale-dipendente.md` | menu del giorno, vassoio, equilibrio |
| `file.md/07-portale-referente.md` | cruscotto azienda, resoconti, fatture |
| `file.md/08-portale-comunita.md` | pazienti, diete, presenze, resoconti |
| `file.md/09-portale-mavi.md` | produzione, ordini in arrivo, etichette, committenti |
| `file.md/09b-portale-mavi-gestione.md` | menu, catalogo, impostazioni, fatturazione, ruoli e gestione |
| `file.md/10-export-e-documenti.md` | Excel, template diete, proforma PDF |
| `file.md/11-convenzioni.md` | regole di stile del codice, trappole note |
| `file.md/12-stato-e-todo.md` | cosa manca, decisioni aperte con il cliente |
| `file.md/13-demo.md` | sequenza della presentazione, credenziali |

## 5. Regole di lavoro

1. **Prima di modificare, leggere il documento tematico** corrispondente in
   `file.md/`. Contiene i vincoli già decisi con il cliente.
2. **A fine task, aggiornare `MAVI_Stato_Progetto.md`** e, se la modifica
   cambia struttura o comportamento documentato, il file in `file.md/`. Se la
   modifica si vede, anche una voce in `CHANGELOG.md` sotto *Non rilasciato*.
3. Non introdurre dipendenze nuove senza motivo forte. Lo stack è
   deliberatamente minimale: React, React Router, ExcelJS, file-saver.
4. Non aggiungere TypeScript, test runner, linter o build step: il progetto
   è un prototipo e la semplicità di consegna è un requisito.
5. Gli SVG delle illustrazioni vanno sempre vincolati con `width`/`height`
   espliciti, altrimenti si espandono e rompono il layout.
6. `ExcelJS` si importa con `import()` dinamico, per non appesantire il bundle.
7. Le stringhe JSX contengono `://` (URL, orari): **non usare `sed`** o
   sostituzioni cieche su questi file.
8. `dist/` è versionata: dopo una modifica a `src/` o `public/` si rigenera con
   `npm run build` e si committa insieme. Il workflow Verifica su GitHub
   ricompila i sorgenti e segnala se `dist/` è rimasta indietro.

## 6. Profili di accesso

Login unico, password `dimostrazione` per tutti.

| Utente | Struttura | Ruolo |
|---|---|---|
| Antonella Rossi | azienda | dipendente |
| Roberto Manzi | azienda | referente |
| Samuele Ferri | comunità | referente del centro Spazio Giovani SGA (diete, presenze, variazioni del proprio centro) |
| Marta Colli | comunità | referente del centro CSS Sole Luna, Desio |
| Ilaria Gatti | comunità | responsabile amministrativa (solo fatture e resoconti senza nominativi) |
| Cucina MAVI | mavi | fornitore (ruolo bloccato, non può chiudersi fuori) |

Ruoli e permessi si configurano da Cucina MAVI › Gestione portale › Ruoli e
permessi e si applicano subito a voci di menu e azioni. Dettagli in
`file.md/13-demo.md` e `file.md/09b-portale-mavi-gestione.md`.
