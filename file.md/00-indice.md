# Indice della documentazione

Documentazione tematica del prototipo MAVI. Ogni file sta sotto le 200 righe,
così può essere letto per intero senza troncamenti.

Il punto di partenza è `../CLAUDE.md`, che contiene struttura del repository,
comandi e regole di lavoro. Questo indice serve a scegliere cosa leggere dopo.

> **Prima di tutto**: la sezione **0. Regole di comportamento** in cima a
> `../CLAUDE.md` definisce tono, stile di risposta e standard di qualità. Va
> letta per prima e prevale sulle abitudini di default.

## Documenti

### 01 — Avvio e build
`01-avvio-e-build.md`
Comandi npm, cosa fa il logger custom di Vite, come si rigenera `dist/`, come
si consegna al cliente, dove vanno le fotografie dei piatti e il logo.

### 02 — Architettura
`02-architettura.md`
Come si entra nell'applicazione: preloader, login unico, instradamento per
profilo. Albero dei componenti, quale file governa quale portale, come si passa
da un ruolo all'altro.

### 03 — Store
`03-store.md`
Elenco completo di quello che espone `usaStato()`: stato, azioni, regole di
esclusione fra portate, log operazioni, presenze, tema. È il documento da
leggere prima di toccare qualsiasi comportamento condiviso fra portali.

### 04 — Dati
`04-dati.md`
Forma dei record in `data.js`: piatti, menu fissi e variabili, giorni,
committenti, pazienti comunità, allergeni. Codice colori WHP della Regione
Lombardia e regola del pasto equilibrato.

### 05 — UI e stile
`05-ui-e-stile.md`
Componenti condivisi di `ui.jsx` (`Telaio`, `Intestazione`, `Velo`,
`SchedaPiatto`, `Illustrazione`, `Faccina`) e convenzioni di `styles.css`:
nomi delle classi, identità cromatica per area, tema scuro.

### 06 — Portale dipendente
`06-portale-dipendente.md`
Menu del giorno a tre colonne, toggle alternative, piatto unico, vassoio con
indicatore di equilibrio, menu settimana, diete personali.

### 07 — Portale referente aziendale
`07-portale-referente.md`
Cruscotto, chi non ha prenotato, "prenota per lui", resoconti mensili con
dettaglio per dipendente, export paghe, fatture.

### 08 — Portale comunità
`08-portale-comunita.md`
Anagrafica pazienti, scheda dieta settimanale da lunedì a domenica con pranzo e
cena, modifica inline, import ed export Excel della dieta, presenze del giorno,
resoconti giorno e settimana.

### 09 — Portale MAVI, operatività
`09-portale-mavi.md`
Distinta di produzione per giorno e settimana, ordini in arrivo, giri di
consegna, etichette pasto, committenti.

### 09b — Portale MAVI, gestione
`09b-portale-mavi-gestione.md`
Menu della settimana e piatti fissi, catalogo, impostazioni per committente e
reparti, condizioni di fatturazione, proforma create a mano, log operazioni,
gestione portale con ruoli e permessi.

### 10 — Export e documenti
`10-export-e-documenti.md`
`excel.js`, `diete.js`, `proforma.js`, `manifesto.js`: come si genera un file
Excel con l'intestazione MAVI, come si legge una dieta caricata, come si apre
la proforma stampabile (ora con listino per committente) e il manifesto di
consegna nominativo. Documenti pubblici e riservati.

### 11 — Convenzioni
`11-convenzioni.md`
Regole di scrittura del codice, naming in italiano, pattern React usati nel
progetto, trappole note da non ripetere.

### 12 — Stato e cose da fare
`12-stato-e-todo.md`
Perimetro attuale, cosa è stato rimosso dal flusso, cosa manca prima della
prossima demo, decisioni ancora aperte con il cliente.

### 13 — Demo
`13-demo.md`
Credenziali, sequenza consigliata della presentazione, punti da mostrare in
riunione e cosa può andare storto.

## Come tenere aggiornata questa documentazione

Quando una modifica cambia un comportamento descritto qui, aggiornare il file
corrispondente nello stesso task. Se un documento supera le 200 righe, va
diviso in due invece di essere accorciato: la completezza conta più della
compattezza.

Il diario cronologico del progetto resta in `../MAVI_Stato_Progetto.md`, che
racconta cosa è successo sessione per sessione. Questi file invece descrivono
lo stato attuale, senza storia.
