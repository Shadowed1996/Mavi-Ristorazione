# Avvio, build e consegna

## Requisiti

Node 20.19 o superiore (per la serie 22, dalla 22.12): è il minimo dichiarato
da Vite 8 e da `@vitejs/plugin-react`. Nessun altro prerequisito: niente
database, niente servizi esterni, niente variabili d'ambiente.

## Comandi

```
npm install
npm run dev       server di sviluppo, porta 5173, apre il browser da solo
npm run build     build statica in dist/
npm run preview   serve dist/ sulla porta 4173
```

Non esistono script di test, lint o typecheck. Il progetto è volutamente privo
di toolchain aggiuntiva.

## Il logger di Vite

`vite.config.js` contiene un plugin custom, `superFastLogger`, scritto a mano.
Fa due cose:

1. Intercetta le richieste HTTP del dev server e le stampa colorate con
   metodo, codice di stato e durata. Filtra il rumore: `/@`, `node_modules`,
   `.map`, `.vite/deps`.
2. All'avvio stampa un riquadro ASCII con URL locale, tempo di boot, memoria
   heap e RSS, core CPU, versione Node.

È estetica, non funzionalità. Se dà fastidio in un ambiente particolare si può
togliere dall'array `plugins`, ma va rimesso: al cliente piace.

Altre impostazioni rilevanti:

- `base: "./"` — percorsi relativi, indispensabile perché `dist/index.html`
  funzioni con doppio clic senza server.
- `clearScreen: false` — non cancella l'output del terminale.
- `optimizeDeps.include` — pre-bundle esplicito di react, react-dom,
  react-router-dom, exceljs, file-saver.
- `server.warmup.clientFiles` — pre-scalda `main.jsx` e `App.jsx`.
- `server.fs.strict: true`.

## La build statica

`npm run build` produce `dist/`. Il contenuto di `public/` viene copiato dentro
`dist/` così com'è, quindi le sottocartelle `documenti/`, `foto/` e `marchio/`
si ritrovano accanto a `index.html`.

Grazie a `base: "./"` il file `dist/index.html` si apre con doppio clic in
qualsiasi browser, anche senza connessione. **È la via consigliata il giorno
della presentazione**, perché non dipende da Node né dalla rete.

Regola: se si tocca qualcosa in `src/`, **rigenerare `dist/`** prima di
consegnare. Altrimenti il cliente vede la versione vecchia.

Nel repository `dist/` è versionata, quindi va committata insieme alla modifica
dei sorgenti. Il workflow **Verifica** su GitHub (`.github/workflows/verifica.yml`)
a ogni push esegue `npm ci` e `npm run build` e segnala se la build ottenuta non
coincide con `dist/`. È informativo: non blocca niente.

## Consegna

Quando si prepara uno zip per il cliente vanno inclusi:

```
src/  dist/  public/  index.html  package.json  vite.config.js  LEGGIMI.md  LICENSE
```

`node_modules/` no. `MAVI_Stato_Progetto.md`, `CLAUDE.md` e `file.md/` sono
documenti interni, non vanno nello zip del cliente. Nemmeno i file che
riguardano solo il repository: `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`,
`SECURITY.md`, `CODE_OF_CONDUCT.md` e `.github/`.

Va sempre riestratto in una cartella nuova, mai sovrapposto a una precedente:
i file rimasti da una versione vecchia hanno già causato confusione.

## Fotografie dei piatti

Le immagini si mettono in `public/foto/`, una per piatto, nominate con il
codice del piatto più l'estensione. Esempio: `ris_fun.jpg`.

Formati accettati: jpg, jpeg, png, webp. Consigliate quadrate, almeno
600×600 pixel.

L'elenco completo dei codici sta in `public/foto/LEGGIMI.txt` e anche dentro il
portale MAVI, alla voce **Catalogo piatti**, colonna Codice.

Dove la fotografia manca resta l'illustrazione vettoriale disegnata nel codice
(componente `Illustrazione` in `src/ui.jsx`), quindi il prototipo funziona
comunque con le cartelle vuote.

In alternativa, dal portale MAVI → Catalogo piatti si caricano le foto
direttamente dal browser: una alla volta col pulsante **Foto** sulla riga,
oppure tutte insieme con **Carica foto in blocco** selezionando più file
nominati con i codici. Quelle caricate così vivono nello stato (`st.foto`) e
si perdono alla chiusura della scheda, perché non c'è archivio.

## Logo

Il logo si mette in `public/marchio/logo.png`. Se il file esiste sostituisce la
scritta MAVI in tutte le testate e nella pagina iniziale. Lo gestisce il
componente `Marchio` in `src/ui.jsx`.

## Documenti scaricabili

`public/documenti/` contiene i PDF che il portale offre in download. Al momento
c'è `codice-colori-whp.pdf`, l'allegato 1F della Regione Lombardia.

L'elenco dei documenti è dichiarato in `store.jsx` nella costante
`DOCUMENTI_INIZIALI`. Ogni voce ha `nome`, `tipo`, `descrizione`, `file`,
`peso`, `data` e `perDipendenti`. Se `file` è vuoto la voce compare come "da
caricare" e non è scaricabile. Il flag `perDipendenti` decide se la voce si
vede anche nei portali con `Documenti soloPubblici`.

## Il preloader

All'apertura parte una breve animazione, il piatto che si compone con primo,
secondo e contorno (`src/Preloader.jsx`). Compare solo al primo avvio della
sessione, quindi navigando fra i portali non si ripete.

Per rivederlo basta ricaricare la scheda del browser o aprire una finestra
anonima.
