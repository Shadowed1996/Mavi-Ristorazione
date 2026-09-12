# MAVI Ristorazione — Stato del progetto

Documento vivo. Va riletto all'inizio di ogni nuova sessione e aggiornato alla fine di ogni task.

**Ultimo aggiornamento**: 12 settembre 2026 — scheda piatto senza foto per l'attesa sulle estensioni, settimana della demo ferma al 31 agosto: entrambe corrette (sezione 17).

**Precedente**: 12 settembre 2026 — revisione critica del prototipo e correzioni: tabella Produzione, "Prenota per lui", rimozione di `Extra.jsx`, pulizia CSS morto, documentazione cliente allineata (sezione 16).

---

## 1. Contesto

Cliente: MAVI Ristorazione, ristorazione collettiva. La prima presentazione (27 agosto) è andata bene, il prototipo è piaciuto. La seconda demo è prevista entro questa settimana.

Cifra prevista: 3.500 EUR lordi come prestazione occasionale per il modulo aziendale base. I moduli aggiuntivi (comunità, eventuali RSA/scuole in futuro) si quantificano a parte. MAVI vorrebbe il sistema in produzione per inizio 2027, obiettivo realistico 1-2 mesi dopo la demo.

---

## 2. Perimetro attuale

Due tipi di committente:
- **AZIENDA** (Rossi Manifatture Spa) — il dipendente sceglie i piatti dal menu del giorno
- **COMUNITÀ** (Comunità Il Ponte) — dieta personalizzata per paziente, il responsabile segna le presenze

RSA e scuole rimossi dal flusso attivo. Possono tornare come moduli separati.

---

## 3. Stack tecnico

React 19 + Vite 8. Font Fraunces (serif, titoli) + Inter (sans). Sistema visivo su carta avorio (#faf6ef), inchiostro caldo. Colori per area: azienda=terracotta, comunità=prugna, MAVI=verde bosco.

**Dipendenze**: ExcelJS + file-saver (import/export Excel, zero CVE dopo migrazione da SheetJS).

**File in `src/`**

| File | Contenuto |
|---|---|
| `data.js` | Piatti, menu, allergeni, colori WHP, committenti, utenti, pazienti comunità con dieta settimanale, flussi ordine, giri consegna, impostazioni, `INGREDIENTI_DIETE` (mappa ingredienti+allergeni per 34 piatti delle diete), `RESOCONTO_MENSILE` |
| `store.jsx` | Stato condiviso (Provider, `usaStato`), ordini, presenze, log operazioni, tema, dati aziendali, utenti, notifiche |
| `ui.jsx` | Icone, illustrazioni SVG, SchedaPiatto, Telaio, Accesso, Documenti, Marchio, Faccina, Velo (con prop `largo`) |
| `styles.css` | Sistema visivo completo + tema scuro |
| `excel.js` | Export Excel professionale (intestazione MAVI, bordi, righe alternate, riga totale) |
| `diete.js` | Template Excel per il dietista + parser import diete |
| `proforma.js` | Generazione proforma stile WHMCS, apre in nuova tab |
| `Accesso.jsx` | Login unico con piatto SVG illustrato |
| `App.jsx` | Instradamento per profilo |
| `Preloader.jsx` | Animazione di apertura |
| `aree/` | Dipendente, Cliente, Fornitore, Struttura, Azienda, Modelli, Comunita, Extra |

**vite.config.js** — logger custom con banner ASCII, tempo boot, RAM, CPU, log HTTP colorati (scritto da Filippo).

---

## 4. Accesso

Login unico per tutti, password `dimostrazione`. Profili demo:
- **Antonella Rossi** → azienda, dipendente
- **Roberto Manzi** → azienda, referente
- **Samuele Ferri** → comunità, educatore (sola lettura sulle diete)
- **Ilaria Gatti** → comunità, responsabile (può modificare diete e anagrafica)
- **Cucina MAVI** → fornitore

---

## 5. Portale dipendente

### Menu del giorno — RIDISEGNATO 1 settembre

Struttura a **3 colonne larghe** invece delle 6 precedenti:
- **Primo** — toggle interno `Primo (5) | Alternative (2)` che filtra la lista
- **Secondo** — toggle interno `Secondo (6) | Alternative (3)`
- **Contorno** — lista semplice

Sotto le colonne, separatore "oppure" e box **Piatto unico** centrato (max-width 460px in desktop, larghezza piena in mobile).

Card piatto (`.tsc`): thumbnail 54px con dimensioni SVG bloccate, pallino colore WHP, nome 15px serif, meta con kcal e marcatori, badge U per piatto unico, alert allergeni. Click su tutta la card seleziona, solo il bottone "i" apre la scheda.

Vassoio in basso con indicatore pasto equilibrato (codice colori WHP Lombardia): faccina verde ok, giallo quasi, rosso sbilanciato.

Preferenza dieta: vegetariano/vegano. Banner in cima quando attiva, piatti fuori dieta segnalati con bordo e badge.

### Menu settimana

Griglia unica con intestazione giorni su sfondo scuro, righe-label categoria in terracotta, celle con piatti cliccabili. Navigazione a 4 settimane. Filtro per portata. Legenda codici colore in fondo.

### Altre pagine

Prenotazioni, Diete speciali, Documenti utili.

---

## 6. Portale referente aziendale

### Cruscotto

Numeri chiave. Tabella "chi non ha prenotato" con bottone **Prenota per lui** che apre un modale largo con il menu del giorno: pulsanti piatto per ogni portata, selezione con esclusione reciproca primo/sostitutivo, conferma che logga l'operazione.

### Resoconti

Numeri in evidenza. Tabella riepilogo per dipendente, click sulla riga espande il dettaglio giornaliero. Export Excel a due fogli (riepilogo + dettaglio) e file trattenute per l'ufficio paghe.

### Fatture

Tabella documenti con bottone PDF che genera la proforma reale. Pulsante "Paga" rimosso.

---

## 7. Portale comunità

### Pazienti

Anagrafica CRUD. Scheda paziente in **modale largo** (`100vw - 80px`) con griglia a 5 card giornaliere (Lunedì–Venerdì), ogni card divisa in Pranzo e Cena con primo/secondo/contorno.

**Modifica dieta** (solo responsabile): bottone che attiva la modalità editing. I campi diventano cliccabili con bordo tratteggiato, al click si aprono in input inline, salvataggio con Enter o blur.

**Carica dieta** (solo responsabile): file picker → parsing ExcelJS → modale anteprima con la dieta letta giorno per giorno → approva o annulla. Solo dopo l'approvazione viene applicata.

**Scarica template** (solo responsabile): genera un xlsx per quel singolo paziente, intestato con nome/stanza/tipo dieta, tabella righe=giorni colonne=portate divise in Pranzo e Cena, nota su come usare il separatore ` || ` per le note di preparazione.

L'**operatore** vede la scheda in sola lettura: niente Modifica dieta, Elimina, Modifica anagrafica, Carica dieta.

### Presenze del giorno

Toggle Pranzo/Cena. Tabella pazienti con toggle a due segmenti `✓ Presente | ✕ Assente`. La riga si colora (verde/rosso) con bordino laterale. Tutti partono non segnati. Il bottone "Trasmetti a MAVI" si attiva solo quando tutti sono segnati. Lo stato vive nello store condiviso, quindi operatore e responsabile vedono le stesse presenze.

### Resoconti

Due viste: **Giorno** (tabella per paziente) e **Settimana** (accordion per paziente, click espande la griglia a 5 card giornaliere). Export Excel a due fogli.

---

## 8. Portale MAVI fornitore

### Produzione

Distinta multi struttura. Bottone "Filtra questa" per struttura con banner blu quando il filtro è attivo.

### Ordini in arrivo

Chi ha trasmesso cosa, quando, con stato.

### Giri di consegna

Due giri con furgone, autista, tappe.

### Etichette pasto — RIVISTE

**Azienda** — anonime, raggruppate per piatto con contatore ×N. Mostrano portata, nome piatto, ingredienti, allergeni, kcal, riscaldamento. Nessun nome dipendente. Si generano solo quando un dipendente conferma la prenotazione.

**Comunità** — nominative, raggruppate per paziente e poi divise per Pranzo e Cena. Mostrano nome paziente, stanza, tipo dieta, portata, piatto, note preparazione, ingredienti, allergeni, kcal, note dieta.

Pulsante "Elimina etichetta" sotto ogni card, con modale di conferma.

### Committenti — RIFATTO 1 settembre

Dashboard operativa: 4 numeri (committenti attivi, pasti oggi, chi ha ordinato, ritardi). Tabella "Stato operativo di oggi" con struttura, tipo, stato ordine, ora, pasti, cutoff. Bottone "Dettagli" apre un pannello a due colonne:
- **Anagrafica**: ragione sociale, indirizzo, P.IVA, referente con ruolo, email, telefono
- **Configurazione servizio**: modello ordine, chi ordina, chi paga, unità, pasti stimati, cutoff

Bottoni "Imposta attivo" e "Sospendi/Riattiva servizio".

### Menu della settimana

Compositore giorno per giorno con navigazione a 4 settimane.

### Catalogo piatti

CRUD piatti.

### Impostazioni

Tab per committente. Cutoff, listino, regola pasto, toggle frutta e monoporzione.

**Rotazione menu** — RIFATTA 1 settembre. Box terracotta con "Settimana N" grande, data di decorrenza, quando ruota, bottone "Forza rotazione". Timeline visiva a 4 step cliccabili con stato (attiva / prossima / programmata). I piatti si compongono da Menu della settimana, questa sezione dice solo quale settimana è in vigore.

### Proforma

Tabella pasti per struttura, prezzo unitario, imponibile, IVA, totale. Export Excel e "Genera proforma PDF" che apre un documento stile WHMCS in una nuova tab: badge PROFORMA, info-box (numero, data, periodo, scadenza), box Da/A, tabella items, totali, note. I dati mancanti appaiono come placeholder in corsivo terracotta. Bottone "Stampa / Salva PDF" nella barra in cima.

### Log operazioni

Cronologia filtrabile per tipo. Include log di **sistema** (backup, rotazione menu, cutoff applicato, promemoria, distinta generata, etichette generate, giri calcolati) e log **utente** (ordini, approvazioni, presenze, modifiche). Colonne: ora, utente, ruolo, azione, dettaglio, tipo.

### Gestione portale

Sei tab:
- **Dati aziendali** — ragione sociale, P.IVA, CF, indirizzo, telefono, email, PEC, IBAN. Usati nella proforma.
- **Fatturazione** — condizioni di pagamento e note standard
- **Aspetto** — tre bottoni Chiaro / Scuro / Automatico
- **Utenti** — tabella con CRUD completo. Modale nuovo/modifica utente con nome, username, ruolo, struttura, email, telefono, e visualizzazione dei permessi assegnati automaticamente per ruolo
- **Notifiche** — 6 toggle (promemoria, cutoff, ordine ricevuto, presenze mancanti, report mensile, digest email)
- **Backup** — numeri e pulsanti backup manuale, export completo, ripristino

---

## 9. Tema chiaro / scuro

Tre modalità: chiaro, scuro, automatico (segue `prefers-color-scheme`). Salvato in localStorage. Toggle nel piede della sidebar di ogni portale, più la sezione Aspetto nella Gestione portale.

Il tema scuro ha override CSS per: variabili base, pastiglie (p-ok, p-att, p-err, p-neu), tag-dieta (terap, base, sanitaria, etica), toggle presenza, righe presenza, card, modali, tabelle, input, login, vassoio, commutatori.

---

## 10. Layout di stampa etichette

Formato target: **80×50 mm**, stampante termica. Layout progettato:

**Comune a entrambe**: marchio MAVI + data/pasto in testata, categoria in maiuscoletto, nome piatto grande, ingredienti, codici allergeni EU con badge, codice colore WHP, istruzioni riscaldamento + "non ricongelare", codice tracciabilità monospace.

**Solo comunità**: nome paziente in evidenza, stanza/unità, badge tipo dieta, note preparazione.

Non ancora implementato come stampa reale nel portale — per ora è un mockup di riferimento.

---

## 11. Cosa manca

### Prima della demo
- Verificare i flussi end-to-end (nuovo paziente → presenza → etichetta)
- Rimuovere i commenti dai file sorgente (attenzione: `sed` rompe le stringhe JSX contenenti `://`)

### Da valutare con MAVI
- Prezzi, quota aziendale, visibilità prezzo al dipendente
- Reparti aziendali: come funzionano
- Se servono più listini e se serve la cena oltre al pranzo
- Formato reale delle etichette termiche e modello stampante

### Tecniche
- Layout di stampa etichette 80×50mm come CSS `@media print`
- Export PDF vero server-side (ora è HTML stampabile)
- Import Excel anagrafica dipendenti

---

## 12. Note tecniche per la continuità

- Consegna: doppio clic `dist/index.html` oppure `npm install` + `npm run dev`
- MAI lanciare `npm audit fix --force`
- Riestrarre sempre lo zip in cartella nuova, non sovrascrivere parzialmente
- Le eccezioni preparazione usano il separatore ` || ` nel testo del piatto, `splitPiatto()` le separa
- Lo store espone `presenzeTrasmesse`, `trasmettiPresenze`, `presenzeComunita`, `logOperazioni`, `logga`
- ExcelJS si importa con import dinamico (lazy) per non appesantire il bundle
- Gli SVG delle illustrazioni vanno sempre vincolati con `width`/`height` espliciti, altrimenti si espandono e rompono il layout
- Workflow build+pack:

```
cd /home/claude/mavi/mavi-portale && rm -rf dist && npx vite build
cd /home/claude && rm -rf pack && mkdir -p pack/mavi-portale
cp -r mavi/mavi-portale/src mavi/mavi-portale/dist mavi/mavi-portale/public \
      mavi/mavi-portale/index.html mavi/mavi-portale/package.json \
      mavi/mavi-portale/vite.config.js pack/mavi-portale/
cd pack && zip -qr /mnt/user-data/outputs/MAVI_portale.zip mavi-portale
```

---

## 13. Sequenza demo consigliata

1. Apri, parte il preloader
2. **Antonella Rossi** → Menu del giorno, mostra le 3 colonne con i toggle alternative, scegli i piatti, mostra la faccina equilibrio
3. Diete speciali → seleziona Vegetariano → torna al menu, i piatti con carne sono segnalati
4. Menu settimana → griglia con navigazione settimane e filtro portata
5. Conferma prenotazione
6. Esci → **Roberto Manzi** → Cruscotto → "Prenota per lui" su un dipendente, scegli i piatti, conferma
7. Resoconti → espandi un dipendente per il dettaglio → Excel → Export paghe
8. Esci → **Samuele Ferri** (operatore) → Pazienti → apri Beatrice Comi, mostra che è in sola lettura
9. Presenze → segna presenti/assenti → Trasmetti a MAVI
10. Esci → **Ilaria Gatti** (responsabile) → Pazienti → apri Beatrice Comi → Modifica dieta → cambia un piatto
11. Scarica template → mostra l'Excel per il dietista
12. Resoconti → vista Settimana con accordion → Excel
13. Esci → **Cucina MAVI** → Etichette pasto → sezione Azienda (anonime, raggruppate) e Comunità (nominative, per paziente e pasto)
14. Produzione → distinta multi struttura → Filtra questa
15. Committenti → Dettagli su una struttura
16. Impostazioni → Rotazione menu
17. Proforma → Genera proforma PDF
18. Gestione portale → Aspetto → prova il tema scuro
19. Log operazioni → filtra per Sistema

---

## 14. Revisione del codice del 3 settembre 2026

Passata di verifica su tutto `src/` (bug, codice obsoleto, duplicazioni,
codice morto), con build di controllo e `dist/` ricostruito.

**Difetti corretti**

- `data.js`, `fuoriDieta` leggeva `piatto.m` invece di `piatto.mk`: con una
  preferenza dieta attiva *ogni* piatto risultava fuori dieta. Era il difetto
  noto più visibile in demo.
- `Dipendente.jsx`, il modale `avvisoDieta` non era mai reso a schermo:
  scegliere un piatto fuori dieta non produceva alcun effetto. Ora compare la
  conferma "Torno a scegliere" / "Scelgo comunque".
- `Struttura.jsx`, la proforma PDF stampava sempre l'etichetta generica
  "Struttura" perché `cfg.tipo` non esiste. Ora usa la mappa `ETICHETTA_TIPO`.
- `Comunita.jsx`, l'occhiello di Etichette mostrava sempre "pranzo" anche con
  la cena selezionata.
- `store.jsx`, tre guardie contro crash: `PIATTI[o.unico]?.so` in `coperte`
  (piatto eliminato dal catalogo durante la demo), `aggiungiOspitePresente` e
  `cambiaUnita` su unità non inizializzate.
- `store.jsx`, `eliminaPiatto` ora ripulisce anche la foto associata.
- `Cliente.jsx`, key React su indice sostituita con `key={g.giorno}`.

**Pulizia**

- `data.js`: rimossa la chiave `ing` duplicata in sei record di `PIATTI`.
- `Fornitore.jsx`: rimossi `Cronoprogramma` e `Roadmap` (mai renderizzati,
  circa 210 righe) e tre import morti. Da 2043 a 1830 righe.
- `Modelli.jsx`: rimossa `MenuOggi` (mai chiamata) e i relativi import; rimossa
  la prop `nudo` mai letta; eliminati due ricalcoli che ombreggiavano variabili
  già in scope. Da 722 a 677 righe.
- `Dipendente.jsx`: rimosso il componente `Voce` e quattro import morti.
- Import morti rimossi anche in `Azienda.jsx`, `Struttura.jsx`, `Landing.jsx`.
- `ui.jsx`: rimossa l'icona `righe` mai usata; la tabella dei valori
  nutrizionali, duplicata fra `SchedaPiatto` e `schedaPdf`, è ora la funzione
  condivisa `nutrientiDi(p)`.
- `styles.css`: rimossa la regola `.area-tag-OLD`.

**Punti aperti emersi**, tutti annotati in `file.md/12-stato-e-todo.md`:
tabella "Quantità da produrre" con intestazioni sfasate, `Extra.jsx` interamente
codice morto, CSS morto su larga scala in `styles.css`, box "Rotazione menu" non
collegato a `CICLICO`.

---

## 15. Repository GitHub e documentazione standard — 11 settembre 2026

Il repository `Shadowed1996/Mavi-Ristorazione` è stato allineato agli altri
progetti di Filippo.

**Storia**

Resta un unico commit iniziale, con Filippo unico autore. Dal messaggio è stata
tolta la riga `Co-Authored-By`, che faceva comparire Claude fra i contributori:
contenuto, autore e date del commit sono invariati.

**File aggiunti**

- `README.md`, `LICENSE` (proprietaria, tutti i diritti riservati),
  `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`.
- `.editorconfig` e `.gitattributes` (fine riga LF, `dist/` segnata come
  generata, documentazione esclusa dalle statistiche dei linguaggi).
- In `.github/`: template di issue e pull request, `CODEOWNERS`,
  `dependabot.yml` per npm e GitHub Actions, workflow `verifica.yml`.

**Workflow Verifica**

Informativo, non blocca niente. A ogni push su `main` controlla che i file
standard ci siano, che i JSON siano validi, che `npm ci` e `npm run build`
riescano e che la build ottenuta coincida con `dist/` versionata. Se qualcuno
tocca `src/` senza rigenerare `dist/`, lo segnala.

**Correzioni**

- `package-lock.json` era disallineato da `package.json`: conteneva ancora
  `typescript`, `@types/react` e `@types/react-dom`, e mancava `uuid` annidato
  sotto `exceljs`. `npm ci` falliva. Rigenerato con `npm install`, senza
  cambiare le versioni dichiarate.
- Il requisito di Node.js scritto in `LEGGIMI.md`, `CLAUDE.md` e
  `file.md/01-avvio-e-build.md` era Node 18, ma Vite 8 e `@vitejs/plugin-react`
  dichiarano `^20.19.0 || >=22.12.0`. Corretto ovunque.
- `.gitignore` esteso (editor, archivi zip); `dist/` resta versionata.
- `LICENSE` entra nello zip per il cliente; i file che riguardano solo il
  repository no (`file.md/01-avvio-e-build.md`).

**Correzione di sicurezza**

`proforma.js` e `schedaPdf` in `ui.jsx` componevano l'HTML inserendo i nomi
delle strutture e i campi del catalogo così com'erano: un valore con del markup
veniva interpretato nella nuova scheda. Ora ogni valore passa da `testoHtml`.
Corretti anche il commento in testa a `proforma.js`, che parlava di iframe, e
`file.md/10-export-e-documenti.md`, che diceva che la proforma lancia la stampa
da sola. `dist/` rigenerata. Nuova trappola annotata in
`file.md/11-convenzioni.md`.

**Da sapere**

La cartella `Desktop\Prototipo` sul PC non è un repository git e non coincide
con quello pubblicato: il `MAVI_Stato_Progetto.md` lì dentro racconta una
sezione Committenti con CRUD completo che su GitHub non c'è. Prima di lavorarci
va deciso quale delle due versioni è quella buona.

---

## 16. Revisione critica del prototipo e correzioni — 12 settembre 2026

Rilettura critica del prototipo su richiesta di Filippo, con verifica nel
codice dei punti aperti elencati in `file.md/12-stato-e-todo.md` e nella
sezione 14, più due incoerenze nuove nella documentazione cliente. Ogni punto
è stato affidato a un task dedicato (in parallelo dove i file non si
sovrapponevano), poi verificato con build e con un giro dal vivo in
`npm run dev` su tutti i profili demo, tema scuro incluso.

**Difetti corretti**

- `Fornitore.jsx`, componente `Produzione`: la tabella "Quantità da produrre"
  dichiarava quattro colonne struttura (Azienda, RSA, Comunità, Scuola) ma il
  corpo ne calcolava solo due. Intestazione allineata al corpo reale (Azienda,
  Comunità); anche un commento che citava un "aggregato RSA" mai calcolato è
  stato corretto.
- `Cliente.jsx` e `store.jsx`: "Prenota per lui" nel cruscotto del referente
  scriveva solo un avviso e una riga di log, senza passare da `st.scegli` /
  `st.conferma`. Ora la prenotazione entra davvero nel vassoio condiviso e
  compare nella distinta di produzione MAVI. `conferma()` accetta un secondo
  parametro opzionale con nome e ruolo di chi conferma (default invariato per
  il portale dipendente), così il log registra il dipendente per cui si
  prenota invece del nome fisso "Antonella Rossi". Verificato dal vivo: il log
  operazioni mostra correttamente "Luca De Santis · Referente (per conto suo)
  · Prenotazione confermata" e la distinta somma il pasto scelto.
- `Cliente.jsx`, cruscotto: il riquadro "Dipendenti attivi" era interamente
  hardcoded. `DIPENDENTI` ha già un campo `stato`, quindi ora sia il numeratore
  (`filter stato === "attivo"`) sia il denominatore (`DIPENDENTI.length`) sono
  calcolati dai dati.
- `src/aree/Extra.jsx` (731 righe), confermato codice morto al 100% (nessuno
  dei sette export importato da alcun file, incluso l'ex `PazientiRSA` per
  RSA): eliminato. Aggiornati i riferimenti rimasti in `CLAUDE.md`, `README.md`,
  `file.md/02-architettura.md`, `file.md/09-portale-mavi.md`,
  `file.md/11-convenzioni.md`, `file.md/12-stato-e-todo.md`.
- `LEGGIMI.md` (documento per il cliente): descriveva ancora cinque portali
  (azienda, RSA, comunità, scuola, MAVI) mentre solo tre sono raggiungibili dal
  login (`UTENTI` in `data.js` non ha voci per RSA/scuola, `App.jsx` non le
  instrada). Corretto: tre portali attivi, con una nota che il codice di
  RSA/scuola resta pronto per essere riattivato. Corretta anche la promessa
  "funziona anche senza connessione": `index.html` carica i font Fraunces/Inter
  da Google Fonts, quindi senza rete l'interfaccia resta usabile ma con i font
  di sistema, non con quelli del progetto.
- `styles.css`: pulizia del CSS morto rilevato nella revisione del 3 settembre
  (`.tessera*`, `.tv-*`, `.cassetto*`, `.piatto-card*`, `.riga-piatto`,
  `.fase*`/`.fasi`/`.roadmap` degli ex componenti `Cronoprogramma` e `Roadmap`
  già rimossi da `Fornitore.jsx`, `.so-anteprima*`, `.comm-card*`, `.cat-tab*`,
  `.filtri-colore`) più altre famiglie emerse durante il controllo
  (`.scelta-riga*`, `.pastello-colore`, `.ricerca`/`.filtro-c` del cassetto,
  `.piatti-grid`, `.piatto-info-btn`, gli override `[data-tema="scuro"]`
  corrispondenti). Rimossi solo i selettori con zero occorrenze verificate in
  `src/**/*.jsx`; dove un selettore raggruppato mescolava classi morte e vive
  (es. `.tessere, .elenco { ... }` per lo scroll) è stata tolta solo la parte
  morta. Regole vive interne a blocchi altrimenti morti sono state
  riconosciute e mantenute (`.btn:disabled`, `.modulo-ospite`/`.mo-riga`
  ricorrono due volte nel file, una delle quali dentro le sezioni
  Cronoprogramma/Roadmap: entrambe le occorrenze restano perché il CSS le
  applica comunque all'elemento live in `Modelli.jsx`). File passato da 6159 a
  5284 righe; CSS nella build da 101,6 kB a 84,6 kB (gzip 18,3 → 15,9 kB).
  Verificato dal vivo su Menu del giorno, tema scuro, cruscotto referente,
  distinta di produzione e log operazioni: nessuna regressione visiva.

**Punto lasciato aperto, per decisione**

- `CONTRIBUTI_STRUTTURE` in `Fornitore.jsx` (tabella "Contributi per
  struttura" della Distinta di produzione) elenca ancora "RSA Villa Serena" e
  "Istituto Sant'Anna" come committenti serviti, con pasti demo duplicati da
  `aggComunita`. È una pagina raggiungibile dal login Cucina MAVI, quindi il
  perimetro RSA/Scuola torna visibile in demo nonostante sia fuori dal
  perimetro attivo. Non toccato: va deciso se togliere le due righe o
  lasciarle come dato dimostrativo dichiarato. Vedi
  `file.md/12-stato-e-todo.md`.

---

## 17. Foto piatto vuota e settimana ferma — 12 settembre 2026

Due segnalazioni di Filippo, verificate dal vivo in `npm run dev` (Chrome,
profilo Antonella Rossi e poi tutti gli altri) prima e dopo la correzione.

**Difetti corretti**

- `ui.jsx`, componente `Illustrazione`: nella scheda piatto (e in ogni
  `Tessera`) l'area della foto restava vuota — sfondo `--carta` a vista, nessun
  errore in console — per tutta la durata dei quattro tentativi in sequenza
  sulle estensioni (`jpg`→`jpeg`→`png`→`webp`), perché `public/foto/` non
  contiene ancora fotografie reali (solo `LEGGIMI.txt`) e ogni tentativo
  richiede un giro di rete che fallisce prima di passare al successivo. Solo a
  cascata esaurita compariva l'illustrazione disegnata. Riprodotto radendo la
  sessione (prima apertura della scheda piatto dopo il login, prima che il
  browser mettesse in cache i 404) e confermato via `read_page`/JS: l'SVG di
  fallback aveva dimensioni corrette, semplicemente non era ancora montato.
  Corretto invertendo l'ordine: l'illustrazione è ora il primo render, la foto
  (se `public/foto/<codice>.<estensione>` esiste ed è caricabile) la sostituisce
  solo a caricamento riuscito, verificato con `new Image()` invece che con
  `onError` sull'`<img>` visibile. Nessuna foto reale in `public/foto/`, quindi
  in demo non cambia nulla a vista salvo la sparizione del vuoto iniziale;
  quando il cliente aggiungerà le foto (vedi `public/foto/LEGGIMI.txt`)
  appariranno con lo stesso miglioramento progressivo.
- Settimana della demo (`GIORNI` in `data.js`, usata dal "Menu del giorno" del
  portale dipendente e da quanto ne dipende) ferma al 31 agosto - 4 settembre
  2026: con oggi 12 settembre, un'intera settimana lavorativa già passata.
  Aggiornata alla settimana entrante su indicazione di Filippo — aziende
  lunedì-venerdì 14-18 settembre, comunità tutta la settimana 14-20 settembre
  — cioè la "Settimana 38" già presente come voce decorativa nei selettori
  multi-settimana. Aggiornati in blocco: `GIORNI` e le sette etichette demo di
  `ETICHETTE_AZIENDA_DEMO` in `data.js`; le intestazioni "Settimana 36"/date
  fisse in `Dipendente.jsx`, `Fornitore.jsx`, `Cliente.jsx`, `Comunita.jsx`,
  `Struttura.jsx`, `Modelli.jsx`, `store.jsx` (log operazioni) e `Landing.jsx`
  (fuori dal flusso attivo, aggiornata comunque per coerenza). L'indice di
  default di "Menu della settimana" (`Dipendente.jsx`) e "Griglia della
  settimana"/"Composizione del menu" (`Fornitore.jsx`) puntava sempre alla
  prima voce dell'elenco (`useState(0)`, "Settimana 35"): ora punta all'ultima
  voce, quella coperta da `GIORNI`, così l'intestazione e i giorni "chiuso"
  per cutoff tornano ad allinearsi con le colonne reali sotto. Non toccati,
  deliberatamente fuori perimetro: il ciclo menu a 4 settimane `CICLICO` in
  `data.js` (rotazione autonoma, non legata a "oggi") e le note "nel mese di
  agosto" dei resoconti mensili (mese completo più recente, resta valido).
  L'elenco decorativo delle quattro settimane navigabili (35-38) non è stato
  esteso: oggi la settimana reale coincide con l'ultima della lista, quindi non
  si può più scorrere in avanti; da estendere se si vuole tenere un margine.

**Correzione dello stesso giorno**: Filippo ha fatto notare che lunedì 14 non
deve risultare bloccato, perché oggi è il 12 settembre e l'intera settimana
14-18 è ancora futura — il cutoff non è passato per nessun giorno. `chiuso`
in `GIORNI` (`data.js`) era rimasto `true` su lunedì e martedì per abitudine,
copiato dal pattern della vecchia settimana (dove invece lunedì/martedì erano
già passati). Rimesso a `false` su tutti e cinque i giorni; il giorno di
apertura di default di "Menu del giorno" è tornato a essere il primo aperto,
ora lunedì (indice 0, prima 2/mercoledì). Rimossa anche la voce di log in
`store.jsx` ("Cutoff prenotazioni applicato... chiusi") che non corrispondeva
più a un evento realmente accaduto. Documentato in
`file.md/04-dati.md`/`06-portale-dipendente.md` che `chiuso` va rimesso a
`true` sui primi giorni solo quando `GIORNI` punta a una settimana già
iniziata rispetto a "oggi".

---
