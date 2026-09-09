# MAVI Ristorazione — Portale

Prototipo di portale web per la ristorazione collettiva: un unico accesso che, in base al profilo, apre il portale dell'azienda cliente, della RSA, della comunità, della scuola o della cucina MAVI.

![Stato](https://img.shields.io/badge/stato-prototipo-orange)
![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-8-646cff)
![Licenza](https://img.shields.io/badge/licenza-proprietaria-lightgrey)

## Cos'è

MAVI Ristorazione gestisce mense per aziende, residenze assistenziali, comunità e scuole.
Ogni tipo di committente ordina in modo diverso: il dipendente sceglie il proprio piatto,
l'operatore di nucleo dichiara quantità per dieta e consistenza, l'insegnante conta i presenti
della classe. Questo portale mette tutti questi flussi sullo stesso impianto e li fa confluire
nella cucina, che vede una sola distinta di produzione.

È un **prototipo di presentazione**: i dati sono di esempio e vivono in memoria per la durata
della sessione, non c'è database né salvataggio permanente. Serve a mostrare il funzionamento
del servizio, non a metterlo in esercizio.

## Funzionalità

- **Accesso unico**: si entra con un nome utente e l'instradamento al portale corretto è deciso
  dal profilo. Chi entra da un portale non vede l'esistenza degli altri. I profili di prova sono
  elencati nella schermata di accesso.
- **Portale azienda**: il dipendente compone il pasto dal menu del giorno, apre la scheda del
  piatto con ingredienti, allergeni e valori nutrizionali, e prenota. Il referente aziendale
  amministra commensali, resoconti e fatture.
- **Portale RSA e comunità**: ordinazione per unità (nucleo, casa), con diete terapeutiche e
  consistenze modificate gestite come categorie proprie. Il responsabile approva prima
  dell'invio alla cucina.
- **Portale scuola**: conteggio dei presenti per classe su menu vidimato, con grammature per
  fascia d'età.
- **Portale MAVI (cucina)**: distinta di produzione aggregata da tutte le strutture, ordini in
  arrivo, giri di consegna, etichette pasto, menu settimanale e ciclico, catalogo piatti,
  fatturazione, log operazioni e archivio documenti.
- **Indicatore di pasto equilibrato** secondo il codice colori WHP di Regione Lombardia, con la
  regola che si adatta da sola al piatto unico.
- **Esportazioni**: fogli `.xlsx` generati con ExcelJS (resoconti, distinte, template diete) e
  proforma impaginato pronto per la stampa.
- **Tema chiaro, scuro o automatico**, memorizzato nel browser.

## Requisiti

- **Node.js 18** o superiore
- **npm** (il repository include `package-lock.json`)

Dipendenze principali, dalle versioni bloccate nel lockfile:

| Pacchetto | Versione |
| --- | --- |
| `react` / `react-dom` | 19.2.8 |
| `react-router-dom` | 7.18.3 |
| `exceljs` | 4.4.0 |
| `file-saver` | 2.0.5 |
| `vite` | 8.2.2 |
| `@vitejs/plugin-react` | 6.1.0 |

## Installazione e avvio

```bash
npm install
npm run dev
```

Il server di sviluppo parte sulla porta **5173** e apre da solo il browser
(`open: true` in `vite.config.js`). Lo script `predev` stampa soltanto un banner di avvio.

Altri comandi disponibili:

```bash
npm run build     # compila la versione statica in dist/
npm run preview   # serve la build compilata sulla porta 4173
```

La build usa `base: "./"`, quindi la cartella `dist/` funziona anche aprendo `dist/index.html`
con un doppio clic, senza server e senza connessione.

## Struttura del progetto

```
.
├── index.html            pagina di ingresso, carica i font Inter e Fraunces
├── vite.config.js        configurazione Vite, base relativa e logger del server di sviluppo
├── public/
│   ├── documenti/        documenti scaricabili dal portale (PDF)
│   ├── foto/             fotografie dei piatti, una per piatto, nominate col codice
│   └── marchio/          logo dell'azienda (logo.png)
└── src/
    ├── main.jsx          punto di ingresso, monta l'applicazione e mostra il preloader
    ├── App.jsx           instradamento: dall'accesso al portale corretto per profilo
    ├── Accesso.jsx       schermata di accesso unica, con elenco dei profili di prova
    ├── Landing.jsx       vetrina dei cinque portali con le rispettive identità
    ├── Preloader.jsx     animazione di apertura, solo al primo avvio della sessione
    ├── store.jsx         stato condiviso (ordini, menu, documenti, utenti, tema)
    ├── data.js           piatti, menu, anagrafiche, diete, committenti, utenti di prova
    ├── ui.jsx            icone, illustrazioni e componenti condivisi fra i portali
    ├── styles.css        sistema visivo, temi e identità cromatica di ogni portale
    ├── excel.js          creazione e download di fogli .xlsx
    ├── diete.js          template Excel per il dietista e lettura del file compilato
    ├── proforma.js       proforma impaginato, aperto in iframe per stampa o salvataggio
    └── aree/             un file per portale o per gruppo di pagine
```

### Le aree

| File | A cosa serve |
| --- | --- |
| `aree/Azienda.jsx` | Portale della mensa aziendale. Presenta i due ruoli (dipendente e referente aziendale) e apre il modulo corrispondente. |
| `aree/Dipendente.jsx` | Vista del dipendente: menu del giorno, vassoio, scheda piatto, indicatore di pasto equilibrato, conferma della prenotazione. |
| `aree/Cliente.jsx` | Vista del referente aziendale: cruscotto, anagrafica dipendenti, resoconti, fatture, documenti. |
| `aree/Struttura.jsx` | Impianto comune ai portali RSA, comunità e scuola. Contiene la configurazione `STRUTTURE` con nome, tema, claim e ruoli di ciascuna. |
| `aree/Comunita.jsx` | Pagine specifiche della comunità: anagrafica dei pazienti, diete personalizzate, ordine per casa. |
| `aree/Modelli.jsx` | Modelli di servizio riusati fra i portali: ordinazione per unità, presenze, ospiti RSA, scelta del committente. |
| `aree/Extra.jsx` | Pagine trasversali: coda di approvazione, distinta unica di produzione, giri di consegna, etichette pasto, pazienti RSA, menu ciclico, impostazioni del committente. |
| `aree/Fornitore.jsx` | Portale della cucina MAVI, il modulo più esteso. Raccoglie produzione, ordini in arrivo, consegne, etichette, committenti, menu settimana, catalogo piatti, fatturazione, log operazioni e gestione del portale. |

## Configurazione

Il progetto **non usa variabili d'ambiente proprie** e per questo non esiste un `.env.example`.
L'unico riferimento a `import.meta.env` è `BASE_URL`, la variabile che Vite fornisce di serie e
che `src/ui.jsx` usa per comporre i percorsi delle risorse pubbliche:

- `foto/<codice piatto>.<jpg|jpeg|png|webp>` — fotografia del piatto, con ricaduta
  sull'illustrazione vettoriale quando il file manca;
- `marchio/logo.png` — logo mostrato al posto della scritta MAVI;
- `documenti/<file>` — documenti aperti dall'archivio del portale.

Le uniche impostazioni persistenti stanno nel browser:

| Chiave | Dove | Cosa contiene |
| --- | --- | --- |
| `mavi-tema` | `localStorage` | tema scelto: `auto`, `chiaro` o `scuro` |
| `mavi-avviato` | `sessionStorage` | segna che il preloader è già stato mostrato in questa sessione |

Comportamento del server di sviluppo (porta, apertura del browser, prebundling) e `base` della
build si cambiano in `vite.config.js`.

## Documentazione

| Documento | Contenuto |
| --- | --- |
| [`LEGGIMI.md`](LEGGIMI.md) | Manuale del prototipo: come avviarlo, cosa contiene ciascun portale, il percorso da seguire in riunione per la dimostrazione e le note tecniche. |
| [`public/foto/LEGGIMI.txt`](public/foto/LEGGIMI.txt) | Come nominare le fotografie dei piatti, formati accettati ed elenco completo dei codici. |
| [`public/marchio/LEGGIMI.txt`](public/marchio/LEGGIMI.txt) | Come sostituire la scritta MAVI con il logo dell'azienda. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Flusso di lavoro, convenzione dei commit e stile del codice. |
| [`SECURITY.md`](SECURITY.md) | Come segnalare una vulnerabilità. |
| [`CHANGELOG.md`](CHANGELOG.md) | Storia delle versioni. |

## Licenze di terze parti

Le librerie sono installate da npm e non sono incluse nel repository; le loro licenze restano
quelle dichiarate dai rispettivi pacchetti.

| Componente | Licenza |
| --- | --- |
| React, React DOM | MIT |
| react-router-dom | MIT |
| ExcelJS | MIT |
| FileSaver.js | MIT |
| Vite, `@vitejs/plugin-react` | MIT |
| Font Inter e Fraunces (caricati da Google Fonts) | SIL Open Font License 1.1 |

Il file `public/documenti/codice-colori-whp.pdf` è l'allegato 1F sul codice colori del programma
di Regione Lombardia per la promozione della salute nei luoghi di lavoro (WHP): spiega come si
assegnano i colori ai piatti e come si compone un pasto equilibrato. È materiale di terzi,
incluso a scopo di consultazione, e resta di titolarità dell'ente che lo ha pubblicato.

## Licenza

Software proprietario, tutti i diritti riservati. Vedi [`LICENSE`](LICENSE).

## Autore

Filippo — [@Shadowed1996](https://github.com/Shadowed1996)
