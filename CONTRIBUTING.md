# Come contribuire

Grazie per l'interesse. Prima di tutto una cosa che è giusto dire subito.

## I contributi esterni non sono aperti

**MAVI Ristorazione — Portale** è un progetto **proprietario** (vedi
[`LICENSE`](LICENSE)), costruito per un cliente preciso. Le pull request non
richieste **non vengono accettate**, per quanto ben fatte.

Restano benvenute:

- le **segnalazioni di problemi**, tramite le issue;
- le **proposte di miglioramento**, sempre tramite issue, prima di scrivere
  una riga di codice;
- il lavoro di chi è stato **espressamente invitato** a collaborare.

Questo documento serve soprattutto a quest'ultimo caso, e a chi riprende in
mano il progetto dopo settimane.

## Prima di scrivere codice: leggi `CLAUDE.md` e `file.md/`

Le regole del progetto sono scritte in [`CLAUDE.md`](CLAUDE.md) e nei documenti
tematici di [`file.md/`](file.md/00-indice.md), che riportano anche i vincoli
già concordati con il cliente. Si legge `CLAUDE.md`, poi il documento della
zona che si tocca. In sintesi, i vincoli che non si negoziano:

- **è un prototipo e deve reggere una demo dal vivo**: niente backend, niente
  database, niente salvataggio;
- **stack minimale**: React, React Router, ExcelJS e file-saver. Nessuna
  dipendenza nuova senza un motivo forte, e **niente TypeScript, test runner,
  linter o passaggi di build aggiuntivi**;
- **tutto in italiano**: componenti, funzioni, variabili, props, classi CSS,
  commenti e testi a schermo;
- **`npm audit fix --force` non si lancia mai**: ha già rotto il progetto una
  volta;
- **niente `sed` né sostituzioni cieche** sui file JSX: le stringhe contengono
  `://` e orari come `14:00`, e una regex globale le spezza;
- il codice dei moduli **RSA e scuola** è fuori dal flusso ma **non si
  rimuove**: riattivarli costa una riga.

## Segnalare un problema

Apri una issue usando i template: [Segnalazione di
bug](.github/ISSUE_TEMPLATE/bug_report.yml) o [Richiesta di
funzionalità](.github/ISSUE_TEMPLATE/richiesta_funzionalita.yml). Passi per
riprodurre, profilo usato e modo di avvio fanno la differenza fra una
segnalazione utile e una che resta ferma.

Per i problemi di **sicurezza** non si usano le issue: si segue
[`SECURITY.md`](SECURITY.md).

## Preparare l'ambiente

Serve **Node.js 20.19 o superiore** (per la serie 22, dalla 22.12): è il minimo
richiesto da Vite 8.

```bash
npm ci          # installa esattamente le versioni di package-lock.json
npm run dev     # http://localhost:5173, il browser si apre da solo
```

## `dist/` si versiona, e va tenuta allineata

Qui la build **si committa**: `dist/` è la copia che si apre con un doppio clic
il giorno della presentazione, senza Node e senza rete.

Se tocchi `src/`, `public/`, `index.html` o `vite.config.js`, rigenera la build:

```bash
npm run build
```

e committa `dist/` **nello stesso commit** della modifica. Il workflow
*Verifica* ricompila i sorgenti a ogni push e segnala se `dist/` è rimasta
indietro.

## Flusso di lavoro

1. Parti da `main` aggiornato.
2. Crea un branch con nome `tipo/descrizione-breve`, per esempio
   `fix/avviso-fuori-dieta` o `feat/etichette-termiche`.
3. **Un argomento per pull request.** Una PR che tocca le etichette, il tema e
   le diete insieme è tre PR travestite da una.
4. Prova la modifica con `npm run dev`, **con i profili che la riguardano** e in
   tema chiaro e scuro, poi rigenera `dist/`.
5. Aggiorna la documentazione nello stesso lavoro: `MAVI_Stato_Progetto.md` a
   fine task, il documento di `file.md/` se cambia un comportamento descritto,
   una voce in [`CHANGELOG.md`](CHANGELOG.md) se la modifica si vede.
6. Apri la PR compilando il [template](.github/PULL_REQUEST_TEMPLATE.md).

## Convenzione dei commit

[Conventional Commits](https://www.conventionalcommits.org/it/), con la
descrizione **in italiano**, minuscola e senza punto finale.

| Prefisso | Quando |
|---|---|
| `feat:` | una funzionalità nuova |
| `fix:` | la correzione di un difetto |
| `docs:` | solo documentazione |
| `style:` | formattazione, senza effetti sul comportamento |
| `refactor:` | riorganizzazione a comportamento invariato |
| `perf:` | prestazioni |
| `test:` | verifiche |
| `chore:` | manutenzione, configurazione, dipendenze |

```
fix: fuoriDieta legge i marcatori del piatto invece della matricola
feat: etichette pasto nominative divise per pranzo e cena
docs: sequenza della demo con le presenze condivise
```

## Stile del codice

Le convenzioni sono **quelle osservate nei file esistenti**, descritte per
esteso in [`file.md/11-convenzioni.md`](file.md/11-convenzioni.md): prima di
introdurne di nuove, guarda come è scritto il file che stai toccando.

### In generale

- indentazione a **2 spazi**, fine riga **LF**, codifica **UTF-8** con gli
  accenti veri (vedi [`.editorconfig`](.editorconfig));
- commenti essenziali: servono per le logiche non ovvie, i casi limite e le
  note di sicurezza, non per il codice che si legge da solo.

### React

- solo componenti funzione e hook, niente classi;
- **un solo Context**, quello di `src/store.jsx`, letto con `usaStato()`: non
  si aggiungono altri Provider;
- lo stato di pagina (giorno, tab, modale aperta) resta locale al componente;
  nello store va solo ciò che serve a più portali;
- la navigazione interna di un portale è `pagina` + `setPagina` con render
  condizionale, non React Router; le voci di menu sono triple
  `[chiave, etichetta, Icona]` nell'elenco `VOCI`;
- nei record di `data.js` le chiavi corte (`n`, `ing`, `mk`, `so`…) si
  rispettano, non si allungano;
- `PIATTI` viene modificato fuori da React e ridisegnato tramite
  `st.versione`: è un compromesso del prototipo e **non va esteso a codice
  nuovo**;
- ExcelJS e file-saver si importano con `import()` dinamico, per non
  appesantire il bundle iniziale;
- gli SVG delle illustrazioni hanno sempre `width` e `height` espliciti;
- l'HTML composto come stringa (proforma, scheda stampabile del piatto)
  inserisce ogni valore con `testoHtml`, mai così com'è.

### CSS

- un unico foglio, `src/styles.css`, con classi in italiano separate da
  trattino, senza framework né classi di utilità;
- **nessun colore letterale nei componenti**: si passa dalle variabili CSS,
  altrimenti si rompono il tema scuro e l'identità di ciascun portale;
- ogni componente con un fondo proprio ha anche il suo override
  `[data-tema="scuro"]`.

## Dati e riservatezza

Il prototipo lavora su dati di esempio, e così deve restare. **Mai** nel
repository, nei file di prova o negli allegati delle issue: nomi di persone
reali, anagrafiche di dipendenti o pazienti, diete vere, credenziali, dati di
fatturazione del cliente. Con persone vere, le diete dei pazienti sarebbero
dati relativi alla salute.

## Checklist prima di aprire una pull request

- [ ] il branch parte da `main` aggiornato e tratta **un solo** argomento
- [ ] `npm run build` si chiude senza errori
- [ ] se ho toccato i sorgenti, `dist/` è rigenerata e committata insieme
- [ ] provato con `npm run dev` sui profili interessati, in tema chiaro e scuro
- [ ] nessuna dipendenza nuova, niente TypeScript, linter o test runner
- [ ] indentazione, lingua e stile seguono i file già presenti
- [ ] `MAVI_Stato_Progetto.md` aggiornato, e il documento di `file.md/` se serve
- [ ] voce aggiunta a `CHANGELOG.md` sotto *Non rilasciato* se la modifica si vede
- [ ] **nessun dato reale né segreto** committato
- [ ] i messaggi di commit seguono la convenzione qui sopra

## Autore

Filippo — [@Shadowed1996](https://github.com/Shadowed1996)
