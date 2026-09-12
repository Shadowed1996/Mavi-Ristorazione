# MAVI Ristorazione — Portale

Prototipo di presentazione del portale web per **MAVI Ristorazione**, ristorazione collettiva:
un accesso unico che, in base al profilo, apre il portale dell'azienda cliente, della comunità o
della cucina MAVI.

![Stato](https://img.shields.io/badge/stato-prototipo-orange)
![Versione](https://img.shields.io/badge/versione-0.1.0-b0543a)
![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-8-646cff)
![Licenza](https://img.shields.io/badge/licenza-proprietaria-lightgrey)

---

## Cos'è

MAVI Ristorazione gestisce mense per aziende e comunità, e ogni committente ordina a modo suo:
il dipendente sceglie il proprio piatto dal menu del giorno, la comunità segue una dieta
personalizzata per ogni paziente e segna le presenze. Il portale mette questi flussi sullo
stesso impianto e li fa confluire nella cucina, che vede una sola distinta di produzione.

È un **prototipo di presentazione**, e questo spiega quasi tutte le scelte:

1. **Niente backend, niente database, niente salvataggio.** I dati di esempio stanno in
   `src/data.js` e nello stato React di `src/store.jsx`: ricaricando la pagina si riparte da
   capo. L'unica cosa che resta è il tema scelto.
2. **Deve reggere una demo dal vivo**, non il carico di produzione.
3. **`dist/` è versionata apposta.** È la copia che si apre con un doppio clic il giorno della
   presentazione, senza Node e senza server.

## Funzionalità

- **Accesso unico** con instradamento per profilo: chi entra da un portale non vede gli altri.
  I profili di prova sono elencati nella schermata di accesso.
- **Portale azienda, dipendente** — menu del giorno a tre colonne con le alternative, piatto
  unico che spegne le portate già comprese, scheda piatto con ingredienti, allergeni e valori
  nutrizionali, vassoio con l'indicatore del pasto equilibrato, diete personali, menu della
  settimana.
- **Portale azienda, referente** — cruscotto con chi non ha prenotato e «Prenota per lui»,
  resoconti per dipendente con export Excel ed export per le paghe, fatture con proforma.
- **Portale comunità** — educatore (sola lettura sulle diete) e responsabile: anagrafica dei
  pazienti, dieta settimanale su cinque giorni con pranzo e cena, modifica in linea, template
  Excel per il dietista e import con anteprima, presenze del giorno condivise, resoconti per
  giorno e per settimana.
- **Portale MAVI (cucina)** — distinta di produzione da tutte le strutture, ordini in arrivo,
  giri di consegna, etichette pasto (anonime per l'azienda, nominative per la comunità),
  committenti, menu della settimana, catalogo piatti con fotografie, impostazioni e rotazione
  del menu, proforma, log operazioni, gestione del portale.
- **Indicatore di pasto equilibrato** secondo il codice colori WHP di Regione Lombardia, con la
  regola che cambia da sola quando si sceglie il piatto unico.
- **Esportazioni** in `.xlsx` con ExcelJS e **proforma** HTML impaginata per la stampa.
- **Tema chiaro, scuro o automatico**, ricordato dal browser.

I portali **RSA** e **scuola** sono fuori dal flusso attivo: il loro codice c'è ancora
(`src/aree/Struttura.jsx`, `src/aree/Modelli.jsx`, i dati in `src/data.js`), ma nessun profilo
di prova ci arriva. Cosa resta e perché non si rimuove è scritto in
[`file.md/12-stato-e-todo.md`](file.md/12-stato-e-todo.md).

## Requisiti

| Per | Serve |
|---|---|
| Aprire il prototipo | un browser recente. Nient'altro: `dist/index.html` si apre con un doppio clic |
| Lavorare sul codice | **Node.js 20.19 o superiore** (per la serie 22, dalla 22.12), il minimo richiesto da Vite 8, e npm |

Dipendenze, come dichiarate in `package.json` e bloccate in `package-lock.json`:

| Pacchetto | Versione | Ruolo |
|---|---|---|
| `react`, `react-dom` | ^19.2.8 | interfaccia |
| `react-router-dom` | ^7.18.2 | instradamento fra accesso e portali |
| `exceljs` | ^4.4.0 | export e import dei fogli Excel |
| `file-saver` | ^2.0.5 | download dei file generati |
| `vite`, `@vitejs/plugin-react` | ^8.2.2, ^6.1.0 | server di sviluppo e build (solo sviluppo) |

## Avvio

### Il giorno della presentazione

Doppio clic su `dist/index.html`. Funziona in qualsiasi browser, anche senza connessione, grazie
alla base relativa (`base: "./"` in `vite.config.js`).

I caratteri Fraunces e Inter arrivano da Google Fonts: senza rete il portale funziona lo stesso,
con i caratteri di ripiego.

### Per lavorare sul codice

```bash
npm ci            # installa le versioni esatte del lockfile
npm run dev       # http://localhost:5173, il browser si apre da solo
```

```bash
npm run build     # rigenera dist/
npm run preview   # serve dist/ sulla porta 4173
```

Il server di sviluppo stampa un riquadro di avvio e le richieste HTTP colorate: è il logger
scritto a mano in `vite.config.js`, spiegato in
[`file.md/01-avvio-e-build.md`](file.md/01-avvio-e-build.md).

> **Se tocchi `src/` o `public/`, rigenera `dist/` e committala insieme alla modifica.**
> Altrimenti il doppio clic mostra la versione vecchia. Il workflow *Verifica* ricompila i
> sorgenti a ogni push e lo segnala.

## Profili di prova

Accesso unico. La password è precompilata e non viene verificata: conta solo il nome utente.

| Nome utente | Struttura | Ruolo |
|---|---|---|
| `antonella.rossi` | Rossi Manifatture Spa | dipendente |
| `roberto.manzi` | Rossi Manifatture Spa | referente |
| `samuele.ferri` | Comunità Il Ponte | educatore, sola lettura sulle diete |
| `ilaria.gatti` | Comunità Il Ponte | responsabile |
| `cucina.mavi` | MAVI Ristorazione | cucina |

La sequenza consigliata per la demo è in [`file.md/13-demo.md`](file.md/13-demo.md).

## Struttura del progetto

```
.
├── index.html              pagina di ingresso Vite, carica Fraunces e Inter
├── vite.config.js          base relativa, server di sviluppo e logger di avvio
├── package.json
├── dist/                   build statica versionata: si apre con un doppio clic
├── public/
│   ├── documenti/          PDF scaricabili dal portale (codice colori WHP)
│   ├── foto/               fotografie dei piatti, nominate con il codice del piatto
│   └── marchio/            logo.png: se c'è, sostituisce la scritta MAVI
├── src/
│   ├── main.jsx            avvio di React e del preloader
│   ├── App.jsx             instradamento per profilo dopo l'accesso
│   ├── Accesso.jsx         accesso unico con l'elenco dei profili di prova
│   ├── Preloader.jsx       animazione di apertura, una volta per sessione
│   ├── Landing.jsx         vecchia pagina di scelta del portale, fuori dal flusso
│   ├── store.jsx           Provider e usaStato(): tutto lo stato condiviso
│   ├── data.js             piatti, menu, anagrafiche, costanti di dominio
│   ├── ui.jsx              icone, illustrazioni SVG, componenti condivisi
│   ├── styles.css          sistema visivo, tema chiaro e scuro
│   ├── excel.js            export .xlsx con ExcelJS
│   ├── diete.js            template Excel delle diete e lettura del file compilato
│   ├── proforma.js         proforma HTML impaginata per la stampa
│   └── aree/               un file per portale o per gruppo di pagine
├── file.md/                documentazione tematica, a partire da 00-indice.md
├── CLAUDE.md               guida operativa e regole di lavoro sul codice
├── LEGGIMI.md              manuale del prototipo, per il cliente
└── MAVI_Stato_Progetto.md  diario di progetto
```

### Le aree

| File | A cosa serve |
|---|---|
| `aree/Azienda.jsx` | smista il portale azienda fra i ruoli dipendente e referente |
| `aree/Dipendente.jsx` | portale del dipendente: menu del giorno, vassoio, scheda piatto, prenotazioni |
| `aree/Cliente.jsx` | portale del referente aziendale: cruscotto, resoconti, fatture |
| `aree/Struttura.jsx` | telaio comune alle strutture (comunità, e RSA e scuola quando torneranno) |
| `aree/Comunita.jsx` | pagine della comunità: pazienti, diete, presenze, resoconti |
| `aree/Fornitore.jsx` | portale della cucina MAVI, il modulo più esteso |
| `aree/Modelli.jsx` | componenti condivisi fra i modelli di ordinazione |

## Configurazione

Il progetto **non usa variabili d'ambiente** e non ha un `.env.example`. L'unico riferimento a
`import.meta.env` è `BASE_URL`, fornito da Vite, con cui `src/ui.jsx` compone i percorsi delle
risorse pubbliche:

- `foto/<codice>.<jpg|jpeg|png|webp>` — fotografia del piatto; se manca resta l'illustrazione;
- `marchio/logo.png` — logo al posto della scritta MAVI;
- `documenti/<file>` — documenti aperti dall'archivio del portale.

Le sole impostazioni conservate stanno nel browser:

| Chiave | Dove | Contenuto |
|---|---|---|
| `mavi-tema` | `localStorage` | tema scelto: `auto`, `chiaro` o `scuro` |
| `mavi-avviato` | `sessionStorage` | il preloader è già stato mostrato in questa sessione |

Porta, apertura del browser e pre-bundling del server di sviluppo si cambiano in
`vite.config.js`.

---

## Documentazione

Questo README è la porta d'ingresso. Il resto:

| Documento | A cosa serve |
|---|---|
| [`LEGGIMI.md`](LEGGIMI.md) | **Il manuale per il cliente.** Come si apre, cosa contiene ogni portale, cosa provare in riunione, dove vanno fotografie e logo. Non serve saper programmare. |
| [`CLAUDE.md`](CLAUDE.md) | **Da leggere prima di toccare il codice.** Comandi, struttura, regole di lavoro e profili. |
| [`file.md/`](file.md/00-indice.md) | Quattordici documenti tematici, uno per zona del progetto: architettura, store, dati, interfaccia, un documento per portale, export, convenzioni, stato e demo. |
| [`MAVI_Stato_Progetto.md`](MAVI_Stato_Progetto.md) | Il diario del progetto, sessione per sessione, con la revisione del codice e i punti aperti. |
| [`public/foto/LEGGIMI.txt`](public/foto/LEGGIMI.txt) | Come nominare le fotografie dei piatti, con l'elenco completo dei codici. |
| [`public/marchio/LEGGIMI.txt`](public/marchio/LEGGIMI.txt) | Come mettere il logo al posto della scritta MAVI. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Come si lavora al codice: vincoli, `dist/`, flusso di lavoro, commit, stile, checklist. |
| [`SECURITY.md`](SECURITY.md) | Come segnalare una vulnerabilità e i punti sensibili noti. |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Il codice di condotta. |
| [`CHANGELOG.md`](CHANGELOG.md) | Il registro delle modifiche, versione per versione. |

## Terze parti

| Componente | Licenza | Dove |
|---|---|---|
| React, React DOM | MIT | installati da npm; compilati dentro `dist/assets/` |
| React Router | MIT | installato da npm; compilato dentro `dist/assets/` |
| ExcelJS | MIT | installato da npm; compilato dentro `dist/assets/` |
| FileSaver.js | MIT | installato da npm; compilato dentro `dist/assets/` |
| Vite, `@vitejs/plugin-react` | MIT | solo sviluppo e build |
| Caratteri Fraunces e Inter | SIL Open Font License 1.1 | serviti da Google Fonts a ogni apertura |

`public/documenti/codice-colori-whp.pdf`, e la sua copia in `dist/documenti/`, è l'allegato del
programma WHP di Regione Lombardia per la promozione della salute nei luoghi di lavoro: spiega
come si assegnano i colori ai piatti e come si compone un pasto equilibrato. È incluso a scopo
di consultazione e resta di titolarità dell'ente che lo ha pubblicato.

Il nome e il marchio **MAVI Ristorazione** appartengono al cliente e sono usati per identificare
il committente del prototipo.

## Licenza

Progetto **proprietario, tutti i diritti riservati**. Copia, redistribuzione, modifica e opere
derivate non sono consentite senza permesso scritto del titolare. Il testo completo è in
[`LICENSE`](LICENSE).

Le componenti di terze parti elencate qui sopra restano soggette alle proprie licenze.

## Autore

Filippo — [@Shadowed1996](https://github.com/Shadowed1996)
