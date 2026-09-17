# MAVI Ristorazione — Stato del progetto

Documento vivo. Va riletto all'inizio di ogni nuova sessione e aggiornato alla fine di ogni task.

**Ultimo aggiornamento**: 16 settembre 2026, pomeriggio — considerazioni tecniche per la produzione in `file.md/14` e `14b` (sezione 30); cambi di dieta: la scheda paziente cambia la dieta settimanale con avviso a MAVI, le eccezioni del giorno solo da Variazioni (sezione 29); tema scuro corretto in tutti i portali con verifica automatica del contrasto (sezione 28); tutta la settimana visibile in ogni portale, lunedì, martedì e mercoledì chiusi con il lucchetto e in sola lettura, giovedì e venerdì aperti; orologio HH:MM:SS nel telaio; tolto il nastro nero "Prototipo dimostrativo" che faceva scorrere le pagine; Menu del giorno del dipendente a schermata fissa su desktop (sezione 27).

**Precedente**: 16 settembre 2026 — manifesto di consegna riscritto in colonna unica e aperto anche al cliente, con un riquadro per dipendente; etichette pasto ridotte all'essenziale (sezione 26).

**Prima ancora**: 15 settembre 2026, notte — stato delle proforma stampato sul documento (non pagata, pagata, annullata, stornata) con le azioni in Fatturazione, tolta la scheda Fatturazione a 30 giorni della Gestione portale, audit completo del sito nel browser (sezione 25).

---

## 1. Contesto

Cliente: MAVI Ristorazione, ristorazione collettiva. La prima presentazione (27 agosto) è andata bene, il prototipo è piaciuto. La seconda demo è prevista entro questa settimana.

Cifra prevista: 3.500 EUR lordi come prestazione occasionale per il modulo aziendale base. I moduli aggiuntivi (comunità, eventuali RSA/scuole in futuro) si quantificano a parte. MAVI vorrebbe il sistema in produzione per inizio 2027, obiettivo realistico 1-2 mesi dopo la demo.

---

## 2. Perimetro attuale

Due tipi di committente:
- **AZIENDA** (Rossi Manifatture Spa) — il dipendente sceglie i piatti dal menu del giorno
- **COMUNITÀ** (Comunità Il Ponte) — dieta personalizzata per paziente; il referente segue pazienti, presenze e variazioni di tutti i centri, il responsabile solo la parte amministrativa (dal 15 settembre 2026)

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
| `documento.js` | Impaginazione A4 condivisa dei documenti stampabili, `testoHtml`, `apriDocumento` con avviso se i popup sono bloccati |
| `proforma.js` | Proforma di `st.proforme` con destinatario, condizioni e scadenza, su `documento.js` |
| `manifesto.js` | Manifesto di consegna nominativo per giornata, riservato al fornitore |
| `resoconto.js` | Resoconti del referente, della comunità e della struttura, distinta di produzione per giorno e settimana, riepilogo prenotazioni |
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
- **Samuele Ferri** → comunità, unico referente, per tutti i centri (dal 14 settembre 2026 i ruoli sono configurabili da Gestione portale)
- **Ilaria Gatti** → comunità, responsabile amministrativa: solo fatture e resoconti senza nominativi (dal 15 settembre 2026)
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

## 18. Sei punti del TO DO di Filippo — 12 settembre 2026

Filippo aveva lasciato un `Nuovo documento di testo.txt` sul Desktop del
progetto (non versionato) con sei richieste. Prima di iniziare sono state
fatte domande di chiarimento su ampiezza e ambiguità (vedi risposte più sotto),
poi il lavoro è proseguito in un'unica sessione, con verifica dal vivo in
`npm run dev` (Chrome) a mano a mano che ogni pezzo veniva completato.

### Decisioni prese con Filippo prima di iniziare

- **Permessi comunità**: non un'assegnazione per singolo paziente, ma per
  reparto/struttura — "ogni struttura ha il suo responsabile, ogni reparto o
  padiglione ha il suo educatore; l'educatore vede i pazienti del reparto, il
  responsabile li vede tutti".
- **Nuovo committente**: collegamento completo, non solo un'anagrafica isolata.
- **Fatturazione diversificata**: listino strutturato per committente, più
  proforma separata per singola struttura oltre a quella unica.
- **Ordine di lavoro**: lasciato alla mia scelta.

### Modello dati: committenti unificati

`COMMITTENTI` in `data.js` e lo stato `st.committenti` in `store.jsx` ora
portano in un solo record quello che prima erano tre cose separate:
anagrafica (prima un dizionario `CONTATTI` locale a `ModelliServizio`),
configurazione di servizio (prima `IMPOSTAZIONI_INIZIALI`) e listino (prima un
prezzo fisso `7,50 €` uguale per tutti in `Fatturazione`). `st.committenti` è
stato React, esteso da `st.aggiungiCommittente`/`st.aggiornaCommittente`: è
il collegamento che fa comparire un committente nuovo ovunque senza codice
duplicato.

### Nuovo committente

Il bottone "Nuovo committente" in Committenti (`ModaleCommittente`,
`Modelli.jsx`) non è più uno stub: apre un modulo con ragione sociale, tipo
(Azienda o Comunità — RSA/Scuola restano fuori perimetro, coerente con la
sezione 12 di questo documento), anagrafica, referente, pasti stimati, prezzo
unitario, IVA, cutoff. Alla creazione (`st.aggiungiCommittente`) il
committente compare subito in Committenti, Impostazioni per committente,
Fatturazione, Produzione e Ordini in arrivo. Non ha ancora ordini reali:
le pagine lo mostrano onestamente a zero pasti, non con dati inventati.

Effetto collaterale utile: la tabella "Contributi per struttura" di
Produzione ora legge `st.committenti` invece dell'array fisso
`CONTRIBUTI_STRUTTURE`, che aveva ancora righe per RSA e Scuola (punto aperto
della sezione 16). Sparite senza bisogno di una decisione a parte.

### Fatturazione diversificata per committente

Impostazioni per committente ha due campi nuovi, **prezzo unitario a pasto** e
**IVA**, usati davvero da Fatturazione al posto del prezzo fisso `PREZZO = 7.50`
che valeva per tutte le strutture. La tabella mostra imponibile, IVA e totale
per riga oltre al totale documento. `proforma.js` (`generaProformaPDF`) ora
accetta `prezzo`/`ivaPercentuale` per riga invece di un unico parametro
globale; "Genera proforma unica PDF" produce un documento con tutte le
strutture, il bottone PDF di ogni riga un documento separato per quella sola
struttura, come chiesto.

### Permessi comunità per reparto

Prima: l'educatore era in sola lettura su tutto il portale comunità. Ora:

- **Reparto/struttura** = campo `stanza` del paziente, già presente e già
  diverso per i quattro pazienti demo (`Spazio Giovani SGA`, `CSS Sole Luna,
  Desio`) — riusato invece di aggiungere un campo nuovo, perché nella pratica
  era già la stessa cosa.
- **Reparto dell'educatore** = nuovo campo `reparto` su `UTENTI` (login) e su
  `st.utenti` (Gestione Utenti, solo per coerenza visiva, resta scollegato dal
  login reale). Samuele Ferri è stato assegnato a "Spazio Giovani SGA" (prima
  la sua `mansione` diceva "Casa Aurora", un'etichetta di un vecchio modello
  di ordinazione mai collegato a questa parte del prodotto).
- **Pazienti, Presenze, Resoconti** in `Comunita.jsx` ricevono `reparto` da
  `Struttura.jsx` (assente per il responsabile) e filtrano la lista di
  conseguenza, con un banner che lo segnala.
- **Modifica dieta, carica dieta, scarica template** ora sono permessi anche
  all'educatore, ma solo per i pazienti del suo reparto (prop `puoDieta`,
  separata da `soloLettura` che continua a governare Elimina, Modifica
  anagrafica, Nuovo paziente — questi restano solo del responsabile, come
  chiesto: "il responsabile... accetta nuovi pazienti e gestisce la loro
  anagrafica").
- `st.trasmettiPresenze` **aggiorna per id invece di sovrascrivere**: prima,
  due trasmissioni in momenti diversi (due reparti, o un educatore e poi il
  responsabile) si sarebbero cancellate a vicenda.
- Corretto anche un difetto preesistente scoperto lavorandoci: "Nuovo
  paziente" ed "Elimina" scrivevano solo nello stato locale della pagina
  Pazienti, mai nell'array condiviso `PAZIENTI_COMUNITA` letto da Presenze,
  Resoconti ed Etichette. Ora mutano anche quello (stessa scorciatoia di
  `salvaPiatto`/`eliminaPiatto`, vedi `file.md/11-convenzioni.md`).

Verificato dal vivo: **Samuele Ferri** vede e può modificare la dieta solo dei
due pazienti di "Spazio Giovani SGA"; **Ilaria Gatti** vede tutti e quattro e
mantiene Elimina/Modifica anagrafica.

### Ordini in arrivo, riscritta da zero

La vecchia pagina era un elenco statico (`FLUSSI_ORDINE`, rimosso) di eventi
con dati inventati. La nuova (`FlussiOrdine` in `Fornitore.jsx`) è un
drill-down per committente sullo stesso stato condiviso di Produzione e
Presenze:

- **Azienda** — quantità aggregate per piatto, anonime, da `st.confermati`/
  `st.ordini` (la scelta reale fatta in demo dal dipendente).
- **Comunità** — elenco nominativo da `st.presenzeTrasmesse`, con reparto e
  portate.
- **Un committente nuovo** senza fonte reale — mostrato onestamente come tale,
  non con numeri finti.
- "Resoconto globale" scarica un Excel con un foglio per committente;
  ogni riga ha anche "Scarica resoconto di questa struttura".

**Correzione dello stesso giorno**, su segnalazione di Filippo dopo aver visto
la prima versione: mancava la distinzione fra **quando l'ordine è stato
generato** e **per quale giorno vale**. Aggiunto `st.oraConferma` (timbrato da
`conferma()`, per riga confermata) e `generatoIl` (timbrato da
`st.trasmettiPresenze`, per riga trasmessa dalla comunità): ogni riga del
dettaglio ora mostra sia "per il giorno" sia "generato il", a schermo e
nell'export Excel.

**Aggiunta collegata**, sempre su richiesta di Filippo: un **manifesto di
consegna nominativo**, riservato al fornitore — "Maria Giovanna ha preso un
pollo, una patata, uno yogurt", da stampare e mettere nel cassone termico
consegnato in azienda. Le etichette pasto dell'azienda restano deliberatamente
anonime (per la cucina non serve il nome, vedi sezione 8/`09-portale-mavi.md`)
ma il fornitore aveva comunque bisogno di sapere chi ha ordinato cosa per
organizzare la consegna. Nuovo file `src/manifesto.js`
(`generaManifestoConsegna`), stessa tecnica HTML-in-nuova-scheda di
`proforma.js`. Alimentato da `st.nominativiAzienda`, che riusa
`ETICHETTE_AZIENDA_DEMO` — sette righe già presenti in `data.js` da prima ma
mai importate da nessuna parte — e cresce con le conferme reali della demo
(`conferma()` in `store.jsx` aggiunge/aggiorna la riga della persona che
conferma). Il documento è raggiungibile solo dal portale MAVI, mai da
Azienda/Cliente.

### Modifica profilo

Icona a forma di matita sul blocco utente in fondo alla barra laterale, in
ogni portale (`Telaio` in `ui.jsx`): apre `ModificaProfilo`, nome, email,
telefono, nuova password (dimostrativa, non applicata al login reale — nessuno
lo era prima) e foto profilo, mostrata come immagine circolare al posto delle
iniziali. I dati vivono in `st.profili`, indicizzato per username, e si
sommano all'anagrafica di login senza mai sovrascriverla.

Corretto nello stesso lavoro un difetto preesistente: il blocco utente del
portale comunità (e di RSA/Scuola, fuori perimetro) mostrava l'etichetta
generica del ruolo ("Educatore di turno") invece del nome reale della persona
loggata. `Struttura.jsx` ora passa `utente?.nome`/`utente?.iniziali` a
`Telaio` quando disponibili.

### Punto lasciato aperto

La Gestione Utenti del portale MAVI (tab Utenti) resta, come già annotato
nelle sezioni precedenti, uno strumento dimostrativo scollegato dal login
reale: il campo Reparto aggiunto lì per l'Educatore è coerente con
`UTENTI`/`data.js` ma non lo scrive. Un vero sistema di permessi configurabili
da interfaccia resta fuori perimetro per questo prototipo.

---

## 19. Rifiniture dopo la prima prova — 12 settembre 2026

Filippo ha provato dal vivo il lavoro della sezione 18 e ha lasciato cinque
osservazioni puntuali. Le prime quattro sono state affrontate direttamente,
la quinta (Fatturazione) è stata proposta come domanda di chiarimento — non
voluta, Filippo ha chiesto di procedere lo stesso con giudizio e di pensarci
io: la sessione è quindi proseguita a mia discrezione anche su quel punto.

### Reparti come tendina, gestibili dalla struttura

"La struttura/reparto di appartenenza, preferenza un menu a tendina —
ovviamente si possono aggiungere o togliere reparti dalla gestione della
struttura." Il campo `unita` del committente (già esistente, prima solo per
azienda/comunità di partenza e non modificabile da interfaccia) è diventato
il catalogo dei reparti: un pannello **Reparti** in Impostazioni per
committente permette di aggiungerne o toglierne, e sia "Stanza / struttura"
nel modulo paziente sia "Reparto assegnato" per l'Educatore in Gestione
Utenti sono ora tendine che pescano da lì, non più testo libero.

Nel farlo è emersa un'incoerenza lasciata dalla sessione precedente: `unita`
della comunità diceva ancora "Casa Aurora"/"Casa Ulivo" (nomi di un vecchio
modello di ordinazione per unità, mai collegato ai pazienti reali), mentre i
pazienti e il reparto di Samuele Ferri usavano "Spazio Giovani SGA"/"CSS Sole
Luna, Desio". Allineati ovunque su questi ultimi (anche `ORDINI_UNITA` e i
Giri di consegna), altrimenti la nuova tendina avrebbe offerto reparti che
nessun paziente ha mai avuto.

### Frutta e monoporzione: tolte, sono già decise

"Togliamo il frutta a ogni pasto e consegna in monoporzione nominativa,
quelle sono già decise." I due toggle sono spariti da Impostazioni per
committente. I campi restano sul committente (`frutta` serve ancora a
`equilibrio()` per l'indicatore del pasto equilibrato) ma non sono più
presentati come una scelta aperta nell'interfaccia.

### Rotazione menu tolta da qui, sostituita dai Reparti

"Il rotazione menu via, mettiamoci altro di più utile." Il pannello non
dipendeva nemmeno dal committente selezionato — stessa timeline
indipendentemente dal tab, quindi era nel posto sbagliato. Rimosso da questa
pagina (`CICLICO` resta descritto in `data.js`, senza un pannello dedicato:
era comunque scollegato, come già annotato prima) e sostituito dal pannello
Reparti, che invece varia davvero per committente.

### CSS dell'IVA

"Il CSS dell'IVA nelle impostazioni non mi piace, da fixare." Causa trovata:
la regola CSS copriva solo `input[type="text"]`, mentre i campi Prezzo
unitario e IVA sono `type="number"` — restavano con lo stile di default del
browser, spinner compresi, in un modulo dove tutto il resto è curato.
Allineati alla stessa styling (bordo, raggio, padding), spinner nativi
nascosti, e aggiunta una freccia disegnata per le nuove select.

### Fatturazione, riscritta una seconda volta

"Fatturazione è da rifare perché bisogna poter creare la fattura proforma per
ogni struttura in base alle loro impostazioni." La versione precedente aveva
già prezzo/IVA per riga e un bottone PDF per riga, ma dentro un'unica tabella
con tutte le strutture insieme — la creazione della proforma non era
l'azione principale della pagina. Riscritta con lo stesso schema a tab per
committente di "Impostazioni per committente": si sceglie la struttura, si
vedono solo i suoi numeri, "Genera proforma PDF" e "Scarica Excel" agiscono
solo su quella. Il riepilogo di tutte le strutture e il documento combinato
restano disponibili in un pannello sotto, non più persi.

---

## 20. Etichette pasto, ripensata per la scala — 12 settembre 2026

Mentre verificavo dal vivo il lavoro della sezione 18, Filippo ha fatto
notare un problema di fondo nella pagina Etichette pasto (portale MAVI): con
20 aziende e 30 comunità, uno scroll unico con tutte le etichette di tutte le
strutture significherebbe scorrere letteralmente migliaia di card. Aveva
ragione: la pagina di partenza mostrava "Rossi Manifatture Spa" e "Comunità
Il Ponte" con intestazioni scritte a mano, un'unica sezione dopo l'altra,
senza alcun modo di isolare una struttura.

**Primo passaggio**: stesso drill-down già usato per "Ordini in arrivo" —
una riga per committente, "Apri dettaglio" per espandere solo quella, un
campo di ricerca dentro (per piatto in azienda, per nominativo in comunità),
e una vista di stampa dedicata (`VistaStampaEtichette`) che mostra solo la
struttura scelta, non l'intera pagina: si stampa un lotto alla volta, mai
tremila etichette insieme. Per la comunità, raggruppamento aggiuntivo per
reparto sopra al paziente, altrimenti una sola comunità con molti pazienti
tornerebbe a essere uno scroll enorme.

**Secondo passaggio**, su ulteriore indicazione di Filippo mentre verificavo
il primo: "raggruppiamole proprio per comunità e aziende, con un pallino che
lampeggia con 'Etichette arrivate'". Le strutture non stanno più in un'unica
tabella mista: un pannello "Aziende" e uno "Comunità", ciascuno con le sue
righe. Aggiunto anche il pallino rosso lampeggiante (`.pallino-nuovo` in
`styles.css`): appare su una struttura quando le sue etichette sono aumentate
da quando non veniva aperta (stato locale `visti`, un contatore per
committente), sia sulla singola riga sia come badge di riepilogo nell'intestazione
del pannello; sparisce non appena si apre il dettaglio. Il bottone stesso
cambia testo in "Visualizza etichette arrivate" quando c'è qualcosa di nuovo.

Verificato dal vivo con dati reali: prenotazione confermata come Antonella
Rossi, presenze trasmesse come Ilaria Gatti, poi login Cucina MAVI — entrambi
i pannelli mostravano il pallino, la ricerca per nominativo filtrava
correttamente ("Marco" → solo Marco Bellini, reparto CSS Sole Luna aggiornato
a "1 paziente"), la vista di stampa mostrava solo Comunità Il Ponte con tutti
i suoi pazienti (la ricerca a schermo non la restringe: si stampa sempre
tutto quello che appartiene alla struttura), e aprire il dettaglio di Rossi
Manifatture Spa faceva sparire il suo pallino lasciando intatto quello di
Comunità Il Ponte.

---

## 21. TO DO MAVI in nove punti — 14 settembre 2026

Filippo ha lasciato sul Desktop `TO DO MAVI.txt` con otto richieste del
cliente, più una nona (Produzione) arrivata a lavoro in corso. Per la prima
volta il lavoro è stato organizzato da un orchestratore con nove agenti
separati, uno per punto, ciascuno in un proprio worktree git su un clone vero
del repository (branch `todo-14-settembre`), in tre ondate: prima i punti
indipendenti e la base comune dei documenti, poi quelli che la usano, infine
permessi e Produzione. Ogni agente ha riportato branch, diff e criteri
verificati; l'orchestratore ha fatto revisione, merge e documentazione.

**Decisioni prese con Filippo prima di partire**: pranzo e cena come flag in
anagrafica paziente con presenze separate per pasto; condizioni di
fatturazione per committente e proforma create a mano da MAVI, niente più
proforma unica; permessi completi e applicati davvero; il referente stampa
il riepilogo nominativo della sua sola azienda.

Cosa è cambiato, punto per punto:

1. **CSS di email e telefono in Modifica profilo** — il selettore globale di
   `styles.css` copriva solo `text` e `password`: aggiunti `email` e `tel`,
   anche in `.impo-riga`.
2. **Pranzo e cena indipendenti** — campo `pasti` sul paziente (Beatrice e
   Zied solo pranzo), `presenzeComunita` per paziente e pasto,
   `trasmettiPresenze` che deduplica per `id` + `pasto`: prima trasmettere la
   cena cancellava il pranzo. Etichette con chiave per pasto, resoconti con
   una tabella per pasto.
3. **Fatturazione per committente e proforma manuali** — termini, metodo,
   regime IVA con dicitura, CF/PEC/SDI sul committente; condizioni predefinite
   in Gestione portale; `st.proforme` con `emettiProforma` e
   `annullaProforma`; modale "Nuova proforma" con righe e condizioni
   modificabili per il singolo documento; i portali cliente vedono solo le
   proprie (prima `FATTURE` era condiviso: Il Ponte vedeva gli importi di
   Rossi). Regola di scadenza "fine mese": giorni contati dall'ultimo giorno
   del mese di emissione, da confermare con MAVI.
4. **Permessi e ruoli** — `PERMESSI` (68 chiavi in tre portali) e
   `RUOLI_INIZIALI` in `data.js`; sessione, `puo`, ruoli e utenti nello
   store, con `loggaSessione` al posto dei nomi cablati nel log. Nuova tab
   "Ruoli e permessi" con la matrice per portale; il modale Utenti lavora sui
   ruoli veri e un utente creato lì entra davvero. Ogni voce di menu e ogni
   azione è sotto una chiave (`usaVociPermesse` in `ui.jsx` sceglie la prima
   pagina permessa). Con la matrice iniziale i cinque profili vedono
   esattamente le voci di prima; togliere una spunta si applica senza rifare
   il login; Cucina MAVI è un ruolo bloccato e l'ultimo amministratore non si
   disattiva. Scelta non prevista dal brief: il campo `vista` sui ruoli del
   portale azienda, che ha due telai (dipendente e referente) e un solo
   portale.
5. **Piatti fissi** — ogni voce del catalogo ha "Aggiungi al giorno" e
   "Rendi fisso", anche dalla riga del giorno; sparito "Aggiungi il primo come
   piatto fisso", che promuoveva d'ufficio il primo della lista filtrata.
6. **Export PDF strutturato** — nuovo `documento.js`: un solo CSS A4,
   intestazione ripetuta, mittente dai dati aziendali, apertura sincrona
   dentro il gesto di click con avviso e download di ripiego se il browser
   blocca la scheda. `proforma.js`, `manifesto.js`, `schedaPdf` ed `excel.js`
   riscritti sopra; sparite le tre copie di `testoHtml`.
7. **PDF finti** — `Resoconti › PDF` del referente mostrava solo un toast
   (anche in `dist/`), come i resoconti comunità e struttura, il riepilogo del
   dipendente e l'export del log: ora `resoconto.js` produce documenti veri
   con gli stessi numeri dell'Excel (`calcolaResoconto` condivisa).
8. **Riepilogo del giorno del referente** — `GIORNI` con data ISO,
   `nominativiAzienda` con `indiceGiorno` e reparto vero,
   `conferma(giorno, chi, piatti?)`. Corretto il bug di "Prenota per lui",
   che sporcava il carrello di Antonella e leggeva gli ordini da una closure
   vecchia (righe vuote o con i piatti sbagliati, doppioni con il seme).
   Pannello "Ordini del giorno" con selettore dei cinque giorni e "Stampa
   riepilogo" intestato `MARTEDÌ - 15/09/2026`; manifesto MAVI per giornata.
9. **Produzione per giorno e per settimana** — richiesta testuale di Filippo:
   "deve funzionare sia giorno per giorno sia settimana per settimana, così
   stampano ogni volta il riepilogo da portare in cucina; deve apparire
   sempre la data". Sette difetti chiusi come criteri obbligatori: data fissa,
   somma di tutti i giorni confermati più `AGGREGATO`, comunità con menu fisso
   e teste divise per tre, Excel e PDF finti, `window.print()` che nascondeva
   la data, numeri fissi (diete "+ 4", "ultima chiusura" delle scuole), piè di
   pagina fuorviante. Ora azienda dai nominativi del giorno più una stima
   dichiarata, comunità dalle presenze trasmesse per giorno e pasto o stima
   dalle diete, documento "Stampa / PDF" con data e filtro, Excel vero.

**Metodo, cosa ha funzionato e cosa no**: gli agenti hanno lavorato senza
aprire il server di sviluppo (il primo era stato interrotto proprio
all'avvio di `npm run dev`), verificando con `npm run build`, lettura del
codice e script Node sui moduli senza JSX. Nel clone mancava l'identità git e
la scrittura di `git config` è stata rifiutata: i commit passano l'identità
al singolo comando con l'indirizzo noreply GitHub. Due merge sono finiti su
`origin` con la build rotta (marcatori di conflitto residui, import
duplicato) e sono stati corretti subito dopo; da lì in poi ogni merge è stato
fatto con `--no-commit`, build e `git grep` dei marcatori prima del commit.
`file.md/09-portale-mavi.md` ha superato le 200 righe ed è stato diviso in
due (`09b-portale-mavi-gestione.md`).

**Da riprendere** (sessione chiusa per esaurimento, 14 settembre 2026):
- branch `todo-14-settembre` su `origin`, PR in bozza verso `main`; i nove
  punti sono integrati e la build è verde, `dist/` rigenerata;
- **verifica end-to-end dal vivo non fatta**: gli agenti hanno verificato per
  lettura del codice e script Node, mai nel browser. Da fare con i cinque
  profili seguendo `file.md/13-demo.md` (in particolare: proforma manuale,
  riepilogo del giorno, Produzione per giorno e settimana, matrice permessi,
  popup bloccati);
- **punto 10** (date fisse fuori da Produzione): **non iniziato**, l'agente
  è stato fermato in fase di analisi, nessun branch da unire. Brief: Ordini
  in arrivo con selettore del giorno come Produzione (`giornoDataIt`,
  conteggi azienda per `indiceGiorno` e comunità dalle presenze del giorno,
  manifesto ed Excel sul giorno scelto, riusando `distintaDelGiorno` e
  l'indice `idPerNome`); occhielli comunità derivati da `DATA_DEMO`;
  `nomeFile` del manifesto da parametrizzare con `GIORNI[i].data`. Censimento
  su `323a3a4`: `Fornitore.jsx` :2039 occhiello fisso, :2510 «mer 16 set
  2026», :995 «Settimana 38», :734-737 elenco settimane a mano;
  `Comunita.jsx` :454, :567, :855 occhielli, :606 «mer 16 set 2026», :59 `dal`;
  `Dipendente.jsx` :141, :390, :508, :522 «Settimana 38»; `Modelli.jsx` :317,
  :805; `Struttura.jsx` :405; `Landing.jsx` :56. Da lasciare: `data.js` :452,
  :1092, :1121, `Fornitore.jsx` :1567 (placeholder), `store.jsx` :36 (seed
  storico), `Cliente.jsx` :470 (deriva da `RESOCONTO_MENSILE.mese`);
- `produzione.stampa` è collegato ai bottoni di Produzione (commit `d8e32af`);
- documentazione già allineata per tutti i punti (`file.md/`, `CHANGELOG.md`,
  `CLAUDE.md`), da rileggere dopo il punto 10.

**Rimandi e cose da verificare con MAVI**: regola di scadenza "fine mese" e
dicitura di esenzione IVA; se la stima di base di Produzione (che si somma
alle conferme reali) va tenuta o se la conferma deve scalarla; le presenze
comunità restano trasmesse solo per mercoledì (`GIORNO_DEMO`), negli altri
giorni la comunità è per forza in stima; i quattro numeri in cima al cruscotto
del referente restano fissi; il "Resoconto mensile" della struttura riporta la
situazione corrente del cruscotto, lo dichiara in nota.

---

## 22. Il vocale di MAVI — 15 settembre 2026

La referente di MAVI ha mandato a Filippo un vocale di 43 secondi, trascritto
in locale con Whisper large-v3. Il passaggio che conta:

> «Noi abbiamo un referente per ogni centro, che è quello che si occupa di
> gestire le diete, mandarmi le presenze, scrivermi delle variazioni, cose di
> questo tipo. E poi abbiamo il responsabile di tutti i centri, che si occupa
> solo della parte amministrativa, quindi di quello che poi bisogna pagare.
> Questa è la cosa principale. Poi l'importante è sicuramente un resoconto per
> la cucina, e che sia diversificato per le varie comunità o aziende.»

**Decisioni prese con Filippo prima di partire**: centro = reparto/unità della
comunità (Spazio Giovani SGA, CSS Sole Luna); il responsabile ha solo fatture,
pagamenti e resoconti per controllarle, mentre pazienti, diete, presenze e
variazioni passano al referente del centro (supera la TO DO del 12 settembre,
dove il responsabile accettava anche i pazienti); la pagina Produzione va
verificata e rifinita, non rifatta. Il modello vale per ora **solo per le
comunità**: per le aziende è una domanda aperta.

Prima di iniziare, `main` locale aveva modifiche del 12 settembre mai
committate (condizioni di pagamento nella proforma), già superate dal lavoro
del 14: messe da parte in `git stash` e in
`.git/backup-modifiche-locali-2026-09-12.patch`, poi `pull` a `c0502d9`.

Lavoro diviso fra due agenti Opus in parallelo sulla stessa cartella, con un
contratto scritto e proprietà dei file rigida (A: portale comunità, store e
dati; B: portale MAVI, distinta, export), e uno strumento di prova comune
fuori dal repo (puppeteer-core sul Chrome installato, un solo Chrome alla
volta). Entrambi gli agenti si sono bloccati una volta e sono stati ripresi.

**Portale comunità (agente A)**
- Ruoli: `operatore` → "Referente del centro", `responsabile` →
  "Responsabile amministrativo", che vede solo Resoconti, Fatture e Documenti
  e parte da Fatture (`usaVociPermesse` accetta la pagina iniziale).
  Etichetta dell'unità della comunità: "Centro".
- Utenti: nuova **Marta Colli** (`u6`), referente di CSS Sole Luna, così la
  demo ha davvero un referente per centro.
- Permessi nuovi: `variazioni.vedi`, `variazioni.invia`,
  `resoconti.nominativi`, `flussi.variazioni` (MAVI).
- **Variazioni**: `st.variazioni`, `inviaVariazione`,
  `prendiInCaricoVariazione`, seed `VARIAZIONI_INIZIALI`; pagina con modulo
  (giorno, centro bloccato, pasto, tipo, paziente facoltativo, testo) ed
  elenco con lo stato "Inviata a MAVI" / "Presa in carico il … da …".
- **Resoconti senza nominativi** per chi non ha `resoconti.nominativi`: pasti
  per centro e per pasto, giorno e settimana, un solo calcolo per schermo,
  Excel e il nuovo `generaResocontoCentriPDF`.
- **Fatture**: da saldare, scaduto, prossima scadenza, pagato; colonna "Da
  pagare" e riga di totale.

**Portale MAVI (agente B)**
- Confronto automatico schermo / PDF / Excel su tutti i filtri, giorno e
  settimana: le cifre per piatto combaciavano, ma sei difetti di logica ed
  etichette sono stati corretti. I più gravi: il filtro Cena contava i pasti
  del pranzo dell'azienda; la stima dell'azienda si sommava intera alle
  conferme (7 + 28 invece di 28); il primo centro che trasmetteva azzerava la
  stima degli altri; l'Excel non riportava né giornata né perimetro.
- "Pasti per committente e centro" con una riga per centro e il suo
  referente, schede per destinazione a schermo e **una pagina per
  destinazione nel PDF**, Excel in cinque fogli, piatti quasi omonimi
  segnalati "da verificare" senza sommarli.
- Variazioni in Ordini in arrivo (colonna e "Prendi in carico") e in
  Produzione, nel PDF e nell'Excel, dichiarate "non già conteggiate nelle
  quantità".
- `documento.js`: la riga di totale in posizione pari diventava invisibile
  (specificità CSS).

**Coordinatore**: `trasmettiPresenze(lista, { centri, pasto, giorno })` e
`st.trasmissioniCentri`. Prima un paziente ritrasmesso assente restava in
distinta (la sostituzione era per id dei soli presenti) e un centro con tutti
assenti tornava alla stima; ora il centro risulta "trasmesso, nessun pasto".
Nomi dei file Excel senza accenti troncati ("Comunita", non "Comunit_").

**Verifiche nel browser**: agente A 29 controlli su 29; agente B confronto a 0
discrepanze e prova end-to-end delle variazioni 12 su 12; prova integrata
finale 12 su 12 (presenze ritrasmesse, centro tutto assente anche nel PDF,
variazione di Marta presa in carico, responsabile senza nomi, portali azienda
aperti) e confronto di B rilanciato dopo la correzione, ancora 0 discrepanze.

**Domande aperte per MAVI**: vedi `file.md/12-stato-e-todo.md`, sezione "Da
valutare con MAVI".

**Chiarimento di Filippo, stesso giorno, dopo il push di `7017b90`**: "penso
che la mia amica intendesse che l'educatore vedesse tutte le strutture / tutti
i reparti e il responsabile SOLO la parte amministrativa". La lettura "un
referente limitato al proprio centro" era sbagliata. Correzioni:
- il ruolo `operatore` si chiama **"Referente"** e ha `pazienti.tuttiReparti`:
  pazienti, presenze, variazioni e resoconti nominativi di tutte le strutture
  e i reparti, centro a scelta in Nuovo paziente e Variazioni;
- il **responsabile** tiene solo **Fatture e Resoconti numerici** (tolti
  `documenti.vedi` e `documenti.riservati`, scelta di Filippo);
- **un solo referente**, Samuele Ferri, senza centro assegnato: Marta Colli
  (`u6`, aggiunta poche ore prima) è stata tolta su richiesta di Filippo
  ("lascia un solo referente sennò è troppo confusionario") e le sue due
  variazioni di esempio ora sono firmate da Samuele; in Produzione la
  colonna Referente elenca chi trasmette le presenze e vede quel centro;
- corretto un difetto emerso nella prova: in Presenze più pazienti segnati in
  rapida successione si perdevano, perché `setPresenzeComunita` riceveva un
  oggetto costruito sullo stato vecchio; ora l'aggiornamento è funzionale.

Verificato nel browser (15 controlli su 15, matrice ruoli compresa) e
confronto schermo / PDF / Excel della distinta ancora a 0 discrepanze.

---

## 23. Variazioni per tipo, comunità da lunedì a domenica — 15 settembre 2026

Provando il localhost, Filippo ha chiesto:
- **Presenze**: "si deve sbloccare lo stato del paziente, che se era assente si
  può mettere presente e viceversa";
- **Altro**: "deve aprirsi il box testo";
- **Dieta**: "deve aprirsi la sua dieta attuale per la variazione";
- e: "ricorda che le comunità come giorni arrivano fino a domenica".

**Variazioni strutturate** (`VariazioniComunita`): il modulo cambia con il
tipo. Presenze e Dieta chiedono il paziente e aprono il suo stato o la sua
dieta del giorno scelto, e generano il testo; Altro apre il testo libero con
paziente facoltativo. Le variazioni ora hanno `presenza`/`presenzaPrima` o
`dieta`/`dietaPrima`, e **si applicano** (scelta presa senza chiedere, perché
"sbloccare lo stato" vuol dire cambiarlo davvero):
- nella giornata della demo aggiornano `st.presenzeComunita` e, se il pasto era
  già trasmesso, la riga arrivata alla cucina (`sostituisciRigaTrasmessa`);
- Presenze del giorno mostra e trasmette `dietaEffettiva`;
- la stima di Produzione salta i pazienti con presenza variata a `false` e usa
  la dieta variata;
- le note "le variazioni non sono conteggiate nelle quantità" in Produzione, PDF
  ed Excel sono diventate "presenza e dieta già conteggiate, Altro a mano".
La dieta settimanale del paziente non cambia. Il seed è convertito: la dieta di
Zied, gli ospiti in più (ora Altro), Carmelo assente a pranzo (che parte già
segnato in Presenze del giorno).

**Sette giorni** (`GIORNI_COMUNITA`, `GIORNI` più sabato 19 e domenica 20,
stessi indici): giorni delle variazioni, scheda paziente (prima sabato e
domenica comparivano senza nome), griglia a sette colonne, resoconti della
settimana, template e import Excel delle diete (un template vecchio non
sovrascrive il fine settimana), distinta di Produzione giorno e settimana.
L'azienda resta su `GIORNI` e nel fine settimana ha "nessun servizio".

**Verifiche**: prova nel browser 22 controlli su 22 (tre tipi di modulo, stato
applicato a Presenze del giorno, variazione su pasto già trasmesso che fa
scendere la distinta, navigazione fino a domenica, colonne della settimana,
scheda e resoconti a sette giorni, nessun errore) e confronto schermo / PDF /
Excel della distinta a 0 discrepanze, giorno e settimana. Errore mio corretto
durante la prova: il pulsante "giorno successivo" restava disabilitato a
venerdì.

---

## 24. Giorni chiusi, riepilogo del dipendente, manifesto della cucina — 15 settembre 2026

Richiesta di Filippo alle 22:56 di martedì: il riepilogo del dipendente "meno
dettagli ma meglio, dipendente e sotto il pasto, solo un riepilogo
dell'ordine"; "blocca gli ordini di lunedì, martedì e mercoledì, mostriamo
giovedì e venerdì e basta (in produzione dovrà essere automatico)"; "per i
resoconti di MAVI invece loro hanno bisogno di un resoconto dettagliato per la
cucina". Chiarito con tre domande:
- il riepilogo è quello del **dipendente**;
- i giorni chiusi valgono per **azienda e comunità**;
- il manifesto aggiunge totale per piatto, diete e allergie, reparto e matricola.

**Adesso e giorni chiusi** (`data.js`): `ADESSO_DEMO` (martedì 15, 22:56) e
`ordiniChiusi(data, oraLimite)` con 14:00 per l'azienda e 16:00 per la
comunità del giorno prima. `chiuso` di `GIORNI` e `GIORNI_COMUNITA` non è più
scritto a mano. `giorniAperti` alimenta tutto quello che vede chi ordina:
- **dipendente**: menu del giorno, menu della settimana in corso e Le mie
  prenotazioni, solo giovedì e venerdì;
- **referente aziendale**: ordini del giorno, solo giovedì e venerdì;
- **comunità**: Variazioni da giovedì a domenica.
La cucina vede tutta la settimana: Produzione si apre su `INDICE_DOMANI`
(mercoledì, ordini chiusi da produrre), Ordini in arrivo e Committenti
mostrano `ETICHETTA_ADESSO`. In produzione basta sostituire `ADESSO_DEMO` con
l'ora vera.

**Comunità su giovedì**: con mercoledì chiuso, la giornata delle presenze della
demo è il primo giorno aperto (`INDICE_DEMO_COMUNITA`, giovedì 17). In
`Comunita.jsx` giorno, data ed etichette della demo si ricavano da lì. Anche
le variazioni di esempio sono spostate su giovedì, con la dieta di Zied di
giovedì.

**Riepilogo ordini del referente**: Filippo ha poi precisato che intendeva il
riepilogo che scarica il referente aziendale: "totale per tutti, dipendente 1
pasto, dipendente 2 pasto, un insieme di tutto, non troppo dettagliato ma
fatto bene". "Stampa riepilogo" ora compone un documento "Ordini di giovedì 17
settembre" con `elencoOrdini` (nuovo in `documento.js`):
- ogni dipendente in ordine alfabetico, con il reparto accanto al nome e sotto
  il pasto su una riga, su due colonne;
- il totale dei pasti e chi non ha ordinato.
Prova: 6 ordini, 7 controlli su 7.

**Riepilogo del dipendente** (fatto prima del chiarimento, lasciato perché
coerente con lo stesso stile): `generaRiepilogoPrenotazioniPDF` ora ha il nome
come titolo e un blocco per giorno aperto con le portate, oppure "Nessuna
prenotazione". Niente tabella, stato o conteggi.

**Manifesto della cucina** (`manifesto.js`):
- riquadri pasti, porzioni e dipendenti "con dieta o allergie";
- "Totale per piatto" con portata, allergeni dal catalogo e porzioni (un nome
  fuori catalogo è "allergeni da verificare");
- dettaglio per reparto con matricola, dipendente, portate e "Dieta e
  allergie": dieta dall'anagrafica, o quella impostata nel portale, e allergie
  dichiarate.
In Ordini in arrivo il dettaglio nominativo e il manifesto ora si vedono anche
senza conferme dal vivo: prima la sezione restava vuota e nascondeva gli
ordini già chiusi.

**Verifiche**: nuova prova 16 controlli su 16 (giorni visibili a dipendente,
referente e comunità, riepilogo semplice, manifesto dettagliato con
l'allergia dichiarata da Antonella, comunità su giovedì). Aggiornate e ripassate
le prove di variazioni (22 su 22) e ruoli (17 su 17); confronto
schermo / PDF / Excel della distinta a 0 discrepanze.

---

## 25. Stati delle proforma, via la Fatturazione a 30 giorni, audit — 15 settembre 2026

Richieste di Filippo: "le proforme pagate, non pagate, annullate o stornate
devono vedersi fisicamente sulla fattura"; "la fatturazione a 30 giorni nella
gestione portale togliamola, essendo che l'abbiamo diversificata"; poi "esegui
un piccolo audit, testa tu fisicamente il sito".

**Stati** (`STATI_PROFORMA` in `data.js`): `emessa` si legge "non pagata"; in
più `stornata`.
- Store: `segnaPagataProforma` e `stornaProforma` accanto ad
  `annullaProforma`, ognuna con la data del cambio (`pagataIl`, `stornataIl`,
  `annullataIl`). Nel seed le due proforma pagate hanno la data di pagamento.
- Fatturazione MAVI: su una non pagata "Segna pagata", "Storna", "Annulla"; su
  una pagata "Storna". Permessi nuovi `fatturazione.pagamenti` e
  `fatturazione.storna`.
- Totali: `proformaValida` esclude annullate e stornate.
- PDF: timbro inclinato accanto al titolo (`timbro` di `paginaDocumento`) con
  NON PAGATA e la scadenza, PAGATA, ANNULLATA o STORNATA con la data; in più il
  riquadro "Stato" e la nota.
- Portali cliente: pastiglie con le stesse parole, e "Stornata" nella
  situazione della responsabile.

**Tolta la scheda Fatturazione** della Gestione portale e le condizioni
predefinite (`terminiDefault` e simili, permesso `gestione.fatturazione`). Le
note standard proforma sono in Dati aziendali. "Nuovo committente" e "Nuova
proforma" chiedono "Scegli i termini" se mancano. `terminiPagamento` di un id
sconosciuto dice "da definire" invece di ripiegare su 30 giorni.

**Audit nel browser**: 5 profili, tutte le voci di menu, a 1440 px e a 390 px
(telefono), 58 pagine. Per ognuna errori in console, testi rotti (NaN,
undefined, date non valide), pagina vuota, scorrimento orizzontale e
screenshot, guardati uno per uno. Trovato e corretto:
- la tabella proforma di Fatturazione era troppo stretta (importi spezzati,
  pulsanti in colonna, "Apri" tagliato): periodo ed emissione sotto il numero,
  termini e metodo in una colonna;
- `.dati td.cifra` non va più a capo in tutte le tabelle (importi e numeri di
  documento spezzati anche in Fatture del referente);
- Menu settimana della cucina scorreva in orizzontale sul telefono
  (`.compositore > * { min-width: 0 }`);
- due testi dicevano ancora "il responsabile" (etichette pasto vuote, notifica
  di cutoff).
Dopo le correzioni: 58 pagine, 0 problemi. Ripassate tutte le prove sulla
build e il confronto schermo / PDF / Excel della distinta.

---

## 26. Manifesto di consegna in colonna, etichette essenziali — 16 settembre 2026

Due passaggi, entrambi partiti da come il documento si legge davvero in
consegna e non da come stava in pagina.

**Manifesto di consegna** (`manifesto.js`, `documento.js`). Impaginazione
piaciuta, contenuto no. Tolto in due giri:

1. Il **"Totale per piatto"** che stava in testa. La cucina quel conteggio ce
   l'ha già dalla distinta di produzione; nel cassone termico serve il
   nominativo, non il riepilogo.
2. Le **tabelle e i riquadri** del dettaglio. Prima provato a riquadri, una
   scheda per dipendente su due colonne divise per reparto: troppo. Adesso è
   una **colonna unica**, una persona sotto l'altra in ordine alfabetico —
   nome e cognome, reparto accanto, matricola a destra, il pasto scritto per
   esteso una portata per riga (o `Piatto unico` da solo) e, se ce ne sono, le
   allergie dichiarate.

Cambio più importante del solo aspetto: **il manifesto non è più riservato al
fornitore**. Deve poterlo stampare in autonomia sia la cucina sia il referente
dell'azienda, quindi via la fascetta "non esporre al cliente" — e proprio per
questo le **diete con prescrizione medica non compaiono più**, restano
riservate. In chiaro solo le allergie dichiarate dal dipendente, che servono a
chi distribuisce i pasti.

In `documento.js`: `generaElencoNominativo` eliminata (l'usava solo il
manifesto) e sostituita da `elencoPasti`; `manifesto.js` compone
`paginaDocumento` e chiude con `apriDocumento`, come già fanno `proforma.js` e
`resoconto.js`. I titoletti di sezione non restano più orfani in fondo alla
pagina stampata.

**Etichette pasto** (`Fornitore.jsx`). Il cliente ha fatto sapere che basta
molto meno: nome e cognome (solo in comunità, quelle aziendali restano
anonime), portata, nome del piatto e note. Via **ingredienti, allergeni, kcal
e la riga di riscaldamento** da entrambe le card. Il blocco Note della comunità
compare solo se la dieta ha davvero delle note, e `INGREDIENTI_DIETE` non serve
più a `Fornitore.jsx`.

**Rifinitura dello stesso giorno.** Ogni dipendente sta ora dentro il suo
riquadro — testata con nome, reparto e matricola, portate una per riga,
allergie su fascia in fondo — sempre in colonna unica, e il riquadro non si
spezza fra due pagine. Della giornata si stampa solo la data, senza il giorno
della settimana, e i riquadri in testa stanno tutti su una fila, in maiuscolo
e centrati (`metaUnaRiga` di `paginaDocumento`, solo per il manifesto: "Rossi
Manifatture Spa" andava a capo dentro il box).

Provata e scartata l'idea di farlo stare per forza su una pagina sola: con 28
pasti servivano una riga per persona e caratteri da 8px, illeggibili in cucina.
Con molti dipendenti il manifesto occupa più pagine e va bene così.

Provato sulla build: manifesto generato con i dati demo (piatto unico e piatto
fuori catalogo inclusi) e le due card etichetta viste nel portale cucina dopo
una prenotazione confermata dal dipendente e le presenze trasmesse dalla
comunità.

---

## 27. Settimana intera con i giorni chiusi, orologio — 16 settembre 2026

Richiesta di Filippo: "lasciamo tutti i giorni di questa settimana ma lunedì,
martedì, mercoledì li mettiamo come chiusi", in modo ricorsivo per fornitore,
dipendenti, responsabile e il resto, "in modo che funzioni tutto"; giovedì e
venerdì restano attivi. In più "un orologio con HH:MM:SS carino".

**Da dove si partiva.** Il calcolo dei giorni chiusi c'era già (sezione 24,
`ADESSO_DEMO` martedì 15 alle 22:56): con quell'ora lunedì, martedì e mercoledì
risultano chiusi, giovedì e venerdì aperti. Ma chi ordina vedeva **solo** i
giorni aperti: i chiusi erano nascosti. "Adesso" non cambia.

**Dati** (`data.js`): `giorniSettimana(giorni)` (tutti i giorni con l'indice),
`primoAperto(giorni)`; `giorniAperti` resta e si appoggia al primo.

**Portale per portale:**
- **Dipendente** — Menu del giorno con i cinque giorni: i chiusi hanno bordo
  tratteggiato e lucchetto, un avviso sopra le colonne, il clic su un piatto
  risponde che le prenotazioni sono chiuse, vassoio "Prenotazioni chiuse".
  Menu settimana con cinque colonne e "chiuso" nelle intestazioni (solo nella
  settimana in corso). Le mie prenotazioni e il riepilogo scaricato coprono la
  settimana intera, con la pastiglia "chiuso".
- **Referente aziendale** — Ordini del giorno su tutta la settimana, apertura
  su giovedì; nei giorni chiusi l'elenco è quello definitivo, "Prenota per lui"
  e "Invia promemoria" sono spenti.
- **Referente della comunità** — Variazioni: il selettore elenca da lunedì a
  domenica, i giorni chiusi sono "· chiuso" e non selezionabili.
- **Responsabile amministrativa** — vede solo Resoconti e Fatture, che già
  coprivano la settimana intera: nessun cambio necessario.
- **Cucina MAVI** — Produzione con la pastiglia "ordini chiusi" (lucchetto) o
  "ordini aperti"; Ordini in arrivo con "chiuso" / "aperto" su ogni giornata del
  dettaglio nominativo; Composizione del menu con il lucchetto sui giorni
  chiusi, apertura su giovedì, e il menu dei giorni chiusi **in sola lettura**
  (niente catalogo, riordino o "Rendi fisso").

**Blocco anche nello stato** (`store.jsx`), non solo nei pulsanti: oltre a
`scegli`, ora anche `conferma` (compresa la prenotazione per conto del
referente), `disdici` e `inviaVariazione` rifiutano un giorno chiuso con un
avviso.

**Orologio** (`ui.jsx`, `Orologio`): ora reale HH:MM:SS in Fraunces con cifre
tabellari, due punti che pulsano, secondi nell'accento dell'area e la data
sotto. In fondo alla barra laterale di tutti i portali (sotto i 1040px la barra
sparisce e l'orologio con lei). È l'ora vera, non
"adesso" della demo. Si ridisegna solo lui, riallineato al secondo pieno.

**Via il nastro "Prototipo dimostrativo"** (richiesta successiva di Filippo:
"è quello che rompe tutto"). La riga nera stava sopra ogni pagina — telaio,
accesso, scelta del ruolo, landing — mentre `.telaio` e `.fianco` erano alti
`100dvh - 32px`: la pagina superava la finestra e scorreva anche quando il
contenuto ci stava. Tolti il nastro da JSX e CSS (stampa compresa) e la
variante compatta dell'orologio che ci viveva dentro; telaio e barra laterale
ora `100dvh` pieni. Misurato nel browser: login e pagina Documenti alti
esattamente quanto la finestra, barra laterale senza overflow.

**Menu del giorno a schermata fissa** (richiesta successiva: "tirare un po' su
anche i menu di destra nel pannello dipendente", evitando lo scorrimento senza
rompere il layout). La pagina era alta 1359px su una finestra di 1009. Su
desktop (da 1101×760) ora:
- intestazione più bassa, navigazione settimana e giorni sulla stessa riga,
  schede giorno più compatte;
- le tre colonne occupano l'altezza rimasta; se i piatti non ci stanno scorre
  solo la lista della colonna, con barra sottile;
- il piatto unico resta centrato sotto le colonne, con meno margini.
Primo giro scartato da Filippo: piatto unico in fascia orizzontale e card
compatte (miniatura 46px) stavano tutti nella finestra ma era "tutto troppo
stretto". Ripristinati box centrato e card originali; lo spazio si recupera
riducendo i caratteri dei box dei giorni in alto.
In `Dipendente.jsx` solo due `div` in più (`menu-fisso`, `menu-barra`);
sotto quelle misure non hanno stili e il layout resta quello a scorrimento.
Misurato a 1920×1009: pagina 1009px, ferma; scorrono dentro la colonna le
liste di Primo e Secondo, il Contorno ci sta. Scelta di un piatto, vassoio e conferma invariati.

**Limite noto**: "Rendi fisso" da un giorno aperto aggiunge il piatto a tutta la
settimana, quindi anche ai giorni chiusi, come prima. Per la demo va bene; in
produzione i fissi dovranno valere dai giorni aperti in avanti.

**Verifiche sulla build** (preview nel browser): dipendente con lun-mer chiusi
e giovedì selezionato, clic su un piatto di mercoledì rifiutato con l'avviso;
referente con le tab chiuse e giovedì attivo; comunità con lun-mer disabilitati
e giovedì selezionato; responsabile invariata; cucina con compositore in sola
lettura su mercoledì e catalogo presente su giovedì. Orologio che scatta, nessun
errore in console.

---

## 28. Tema scuro, accenti e contrasto — 16 settembre 2026

Segnalazione di Filippo, portale del referente aziendale in tema scuro:
"qualcosa che non va con l'highlight dei colori, è blu su bianco e non si
vede", con la richiesta di verificare tutto il CSS del tema scuro.

**Causa.** Nel tema scuro le aree ridefinivano solo `--acc-tenue` e
`--acc-bordo`: `--acc` e `--acc-scuro` restavano quelli del chiaro. Per il
referente `#34408c` e `#27306c` su fondo quasi nero: la voce di menu attiva
(testo `--acc-scuro` su `--acc-tenue`) non si leggeva, come i secondi
dell'orologio e la luna del selettore del tema. Stesso problema per la
comunità (prugna) e la cucina (verde); un secondo blocco scuro imponeva a
tutte le aree le tinte terracotta del dipendente.

**Correzione** (`styles.css`, in fondo):
- per ogni area due toni nel tema scuro: `--acc` chiaro per testi, bordi e
  voci attive (≥6:1 sul fondo) e `--acc-pieno` per i fondi con testo bianco
  (≥5:1), con `--acc-pieno-hover`; `--acc-scuro` diventa la variante più
  chiara. I 19 `background: var(--acc)` sono ora
  `var(--acc-pieno, var(--acc))`: nel tema chiaro `--acc-pieno` non esiste e
  non cambia nulla;
- `--muto` del tema scuro da `#8a8279` a `#a39b90` (i testi secondari erano
  fra 4,1 e 4,5:1);
- colori scritti nei componenti trasformati in classi o variabili con la
  versione scura: banner del centro assegnato e dei pazienti esclusi, avvisi
  d'importazione, numeri Presenti e Assenti, bottoni rossi e verdi
  (`--rosso-azione`, `--rosso-pieno`, `--verde-pieno`, `--ok-pieno`);
- date e stati del giorno selezionato, contatori delle alternative e date
  delle tab più leggibili; occhiello della pagina di accesso più chiaro.

**Verifica.** Controllo automatico nel browser: per ogni testo visibile colore
e fondo effettivi (trasparenze e opacità comprese) e rapporto di contrasto
WCAG, soglia 4,5:1 (3:1 per testo grande), in tema scuro su tutte le pagine
dei cinque profili, la pagina di accesso e le finestre "Prenota per lui",
scheda piatto e scheda paziente. Prima della correzione il solo referente
aveva 15 segnalazioni, con la voce attiva e l'icona dei documenti sotto 3:1;
dopo, nessuna. Esclusi di proposito: elementi disattivati o spenti (giorni
chiusi, documenti non disponibili) e i due punti dell'orologio, che pulsano.

---

## 29. Cambi di dieta dalla scheda paziente — 16 settembre 2026

Domanda di Filippo: se dalla scheda di un paziente si cambia la dieta di
domenica da piatto X a piatto Y, parte un avviso al fornitore che solo per
quel giorno, solo per questa settimana, il paziente è variato?

**Com'era: no.** "Modifica dieta" riscriveva `paziente.dieta` in memoria:
cambio **permanente** (ogni domenica), **nessuna variazione** a MAVI, nessuna
riga nel log, nessun controllo sui giorni chiusi; la cucina vedeva il piatto
nuovo in Produzione solo se la pagina si ridisegnava per altri motivi. "Carica
dieta" da Excel aveva lo stesso buco su tutta la settimana. Il percorso giusto
per un solo giorno esisteva già (Variazioni › Dieta) ma dalla scheda non si
raggiungeva. (La dieta la modifica il referente, non il responsabile, che vede
solo fatture e resoconti.)

Filippo: "procedi nel modo che ritieni più valido secondo logica".

**Come funziona ora.** Ogni piatto cambiato dalla scheda apre una scelta:
- **Solo [giorno e data]** — variazione di tipo Dieta per quel giorno, identica
  a quella della pagina Variazioni: MAVI la riceve, le quantità di quel giorno
  si aggiornano, la dieta settimanale non cambia. Disattivata sui giorni chiusi.
- **Tutte le settimane** — cambia la dieta di base e manda a MAVI una variazione
  **Dieta di base** ("Ogni domenica, da domenica 20 settembre"). Se il giorno
  questa settimana è già chiuso vale **dalla prossima settimana**: la dieta di
  prima resta congelata per questa settimana, perché la cucina l'ha già
  preparata.

La griglia della scheda mostra cosa si serve questa settimana, con il
lucchetto sui giorni chiusi e le note "solo questa settimana · di base X" e
"dalla prossima settimana: Y". "Carica dieta" applica solo i piatti diversi con
la stessa regola e manda un solo avviso con il riepilogo.

**Codice.** `data.js`: `dietaDiBase` (dieta congelata sui giorni chiusi),
`cambiaDietaDiBase`, `quandoVariazione`, `NOMI_TIPO_VARIAZIONE`;
`dietaEffettiva` parte da `dietaDiBase`. `store.jsx`: tipo `dieta_base`,
ammesso anche sui giorni chiusi, con log "Dieta di base modificata, avviso a
MAVI". `Comunita.jsx`: scelta nella scheda, `applicaImport`,
`aggiornaRigheTrasmesse` condivisa con Variazioni. `Fornitore.jsx`: tipo e
"per quando" delle variazioni in Ordini in arrivo, Produzione ed Excel.

**Provato nel browser** con Beatrice Comi: venerdì "solo questo giorno"
(Filetto → Merluzzo), giovedì "tutte le settimane" (Pasta alla norma → Pasta al
pomodoro), lunedì chiuso "tutte le settimane" (Patate arrosto → Zucchine
trifolate, con "solo questo giorno" disattivato). In Ordini in arrivo tre voci
con tipo e "per quando" giusti, nel log tre righe; in Produzione lunedì resta 4
Patate arrosto e nessuna zucchina, giovedì Pasta al pomodoro al posto della
norma, venerdì 1 filetto (l'altro paziente) e 1 merluzzo.

---

### 29 bis. Tolto il doppione "solo quel giorno o sempre"

Osservazione di Filippo subito dopo: la pagina Variazioni già modifica la dieta
di un giorno, quindi la scelta "solo quel giorno / sempre" nella scheda è un
processo duplicato. Vero: due strade per la stessa eccezione. Spostare tutto
in Variazioni però avrebbe lasciato la dieta di base con due ingressi (Carica
dieta nella scheda, modifica a mano in Variazioni). Proposta accettata, "una
pagina, una cosa":

- **Scheda paziente** › Modifica dieta e Carica dieta: solo la dieta
  settimanale, per tutte le settimane, sempre con avviso "Dieta di base" a
  MAVI; sui giorni chiusi dalla prossima settimana. Tolta la finestra di scelta.
- **Variazioni** › Dieta: solo le eccezioni di un giorno, come prima.
- In modifica, un banner nella scheda lo spiega e il bottone "Serve solo per un
  giorno? Fai una variazione" apre Variazioni con centro, paziente e tipo Dieta
  già scelti (`onVariazione` da `Struttura.jsx`, `preset` in
  `VariazioniComunita`); compare solo a chi può inviare variazioni.

Provato nel browser: venerdì Filetto → Merluzzo e lunedì chiuso Patate arrosto
→ Zucchine trifolate dalla scheda, senza finestra, entrambi "Dieta di base"
(lunedì "dalla prossima settimana"); scorciatoia su Variazioni con Beatrice
Comi già scelta; variazione di venerdì Merluzzo → Orata al cartoccio inviata a
MAVI; tornando alla scheda venerdì mostra "Orata al cartoccio · solo questa
settimana · di base Merluzzo al vapore".

---

## 30. Considerazioni tecniche per la produzione — 16 settembre 2026

Domanda di Filippo alla vigilia della demo: se MAVI accetta, cosa serve per
avere il sistema davvero in produzione. Dopo una risposta a voce su tecnica,
obblighi e aspetti economici, la richiesta: un file con **solo le
considerazioni tecniche**, senza la parte commerciale, e stamparlo.

Scritto in due documenti tematici, per restare sotto le 200 righe ciascuno:
- `file.md/14-verso-la-produzione.md`: cosa si riusa e cosa no, architettura
  (frontend riusato, API, PostgreSQL, tempo reale, lavori pianificati, ambienti,
  hosting UE), modello dati con menu per data e diete storicizzate al posto di
  `dietaCongelata`, orari limite decisi dal server con fuso Europe/Rome e
  congelamento della distinta, accesso e permessi applicati dal server con
  perimetro nel database, requisiti tecnici per i dati sanitari;
- `file.md/14b-verso-la-produzione.md`: notifiche, PDF lato server, etichette
  termiche, import con validazione, fatturazione elettronica via gestionale,
  test e integrazione continua, monitoraggio, pulizia del codice demo, ordine
  tecnico dei lavori e informazioni da raccogliere prima di iniziare.

Stampato sulla stampante predefinita (Olivetti d-COPIA 4513MF KX): PDF A4 di 5
pagine generato da questi due file.

---

## 31. Nomi dei piatti unificati — 17 settembre 2026

Richiesta di Filippo il giorno della presentazione: togliere i piatti con nome
doppio o quasi uguale e scriverli tutti allo stesso modo.

Il problema vero: gli ordini demo di domani (`ETICHETTE_AZIENDA_DEMO`) e il
resoconto di agosto (`RESOCONTO_MENSILE`) usavano nomi brevi ("Pasta al
pomodoro", "Pollo grigliato"), mentre una prenotazione fatta in demo scrive il
nome del catalogo (`PIATTI[id].n`). Manifesto ed etichette mostravano così lo
stesso piatto due volte con due nomi.

- Azienda, in `data.js`: i nomi brevi diventano quelli del catalogo (Penne al
  pomodoro e basilico, Petto di pollo alla griglia, Risotto ai funghi porcini,
  Salmone al forno con erbe, Vellutata di zucca e carote, Tofu alla piastra con
  verdure, Fagiolini al vapore, Polpette di manzo al sugo, Insalata di farro e
  verdure, Piatto di formaggi misti, Pasta integrale al pesto).
- Diete della comunità, sinonimi dello stesso piatto: Patate arrosto → Patate
  al forno, Insalata fresca → Insalata mista, Pasta pomodoro e basilico → Penne
  al pomodoro e basilico, e il refuso Fuselli → Fusi di pollo al forno.
- `INGREDIENTI_DIETE` allineato alle nuove chiavi, tolto il doppione Patate
  arrosto.

Lasciate **volutamente diverse** le coppie che distinguono una dieta: Pasta
alla norma (senza ricotta, per l'intolleranza al lattosio di Beatrice Comi) e
con ricotta, Spinaci all'olio EVO e al Padano, Pasta zucchine (niente pomodoro
per l'esofagite di Carmelo Aronica) e zucchine e pomodori, Pasta al pesto e
integrale al pesto, Petto di pollo al forno e alla griglia (è il cambio della
variazione demo di Zied Dridi), Patate e Patatine al forno.

Verificato con uno script: nessun nome degli ordini e del resoconto azienda è
fuori catalogo. `dist/` ricompilata.

---
