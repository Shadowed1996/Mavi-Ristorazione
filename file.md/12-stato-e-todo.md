# Stato del progetto e cose da fare

Il diario cronologico completo sta in `../MAVI_Stato_Progetto.md`. Qui c'è solo
la fotografia dello stato attuale.

## Contesto commerciale

Cliente: MAVI Ristorazione, ristorazione collettiva. La prima presentazione
(27 agosto 2026) è andata bene. Il compenso previsto è 3.500 EUR lordi come
prestazione occasionale per il modulo aziendale base; i moduli aggiuntivi si
quantificano a parte. MAVI punta alla produzione per inizio 2027.

## Perimetro attuale

Due tipi di committente attivi:

- **Azienda** — Rossi Manifatture Spa. Il dipendente sceglie i piatti dal menu
  del giorno.
- **Comunità** — Comunità Il Ponte. Dieta personalizzata per paziente; il
  referente segue pazienti, presenze e variazioni di tutti i centri, il
  responsabile solo la parte amministrativa.

**RSA e scuole sono state rimosse dal flusso attivo.** Il codice però è ancora
tutto lì:

| Cosa resta | Dove |
|---|---|
| Configurazione portale RSA e scuola | `Struttura.jsx` → `STRUTTURE` |
| Ospiti RSA, nuclei, consistenze | `data.js` → `OSPITI`, `OSPITI_RSA` |
| Presenze e fasce scolastiche | `data.js` → `PRESENZE_SCUOLA`, `FASCE_SCOLASTICHE` |
| Pagine dedicate | `Modelli.jsx` → `OspitiRsa` |
| Ordini demo di RSA e scuola | `store.jsx` → `ORDINI_IN_CODA` |
| Identità cromatica | `styles.css` → `[data-area="rsa"]`, `[data-area="scuola"]` |

Non sono raggiungibili dal login perché nessuna voce di `UTENTI` ha quelle
strutture. **Non rimuoverli**: possono tornare come moduli separati e
riattivarli costa una riga.

`Extra.jsx`, che conteneva anche una vecchia pagina `PazientiRSA`, è stato
rimosso il 12 settembre 2026 perché interamente codice morto (vedi
`../MAVI_Stato_Progetto.md`): quel frammento RSA non esiste più, resta solo
`OspitiRsa` in `Modelli.jsx`.

Anche `Landing.jsx` (vecchia pagina di scelta portale) e le schermate `Accesso`
interne ai portali sono fuori dal flusso ma vive nel codice.

## Difetti corretti il 12 settembre 2026

### `CONTRIBUTI_STRUTTURE` in `Fornitore.jsx` elencava ancora RSA e Scuola

Risolto come effetto collaterale della riscrittura di "Nuovo committente":
la tabella "Contributi per struttura" ora elenca `st.committenti` (lo stato
condiviso, esteso da "Nuovo committente") invece di un array fisso a parte.
RSA e Scuola non ci sono mai state in `st.committenti`, quindi sono sparite
dalla tabella senza bisogno di una decisione separata.

## Prima della prossima demo

- Verificare i flussi end-to-end: nuovo paziente → presenza → etichetta.
- Ripulire i commenti superflui dai file sorgente. Attenzione: `sed` rompe le
  stringhe JSX che contengono `://`, vedi `11-convenzioni.md`.
- Rigenerare `dist/` dopo ogni modifica a `src/`.

## Da valutare con MAVI

- **Dal vocale del 15 settembre 2026** (vedi la sezione più sotto):
  - Il modello "referente di tutti i centri + responsabile solo amministrativo" vale
    anche per le aziende? Oggi il referente aziendale vede anche le fatture.
  - Il responsabile amministrativo deve vedere le variazioni in sola lettura?
  - Per controllare le fatture bastano pasti previsti e presenti per giorno e
    settimana, o serve un riepilogo mensile con l'importo stimato?
  - In cucina basta "presa in carico", o servono anche "rifiutata" e una
    risposta scritta al referente?
  - Gli ospiti in più (variazione Altro) devono entrare nei conteggi di
    presenze e fatture? Oggi le variazioni di presenza e di dieta di un
    paziente si applicano da sole, quelle Altro restano avvisi da applicare a
    mano.
  - Le presenze si segnano e si trasmettono solo per giovedì, il primo
    giorno aperto (`INDICE_DEMO_COMUNITA`): negli altri giorni, fine settimana
    compreso, la comunità è in stima dalle diete e dalle variazioni.
- **"Adesso" è fisso** (`ADESSO_DEMO`, martedì 15 settembre 2026 ore 22:56):
  in produzione diventa l'ora vera e i giorni chiusi si calcolano da soli con
  gli orari limite dei committenti. Da confermare con MAVI gli orari limite
  (14:00 azienda, 16:00 comunità del giorno prima).
- **"Rendi fisso" tocca anche i giorni chiusi**: il menu dei giorni chiusi è in
  sola lettura, ma un piatto reso fisso da un giorno aperto entra in tutta la
  settimana. In produzione i fissi dovranno valere dai giorni aperti in avanti.
  - Piatti quasi omonimi segnalati in Produzione: sono lo stesso piatto?
    Risotto ai funghi / ai funghi porcini, Pasta al pomodoro / Penne al
    pomodoro e basilico, Salmone al forno / con erbe, Pollo grigliato / Petto
    di pollo alla griglia, Polpette al sugo / di manzo al sugo, Fagiolini a
    vapore / al vapore; nelle diete Pasta alla norma / con ricotta, Pasta
    zucchine / zucchine e pomodori, Pasta al pesto / integrale al pesto.
  - Coperti previsti dell'azienda per giorno (26, 24, 28, 25, 22): sono il
    numero giusto da cui togliere le prenotazioni confermate?
  - In cucina serve davvero una scheda per centro su pagina separata?
- Prezzi, quota aziendale, visibilità del prezzo al dipendente.
- Reparti aziendali: come funzionano davvero.
- Regola di scadenza "fine mese" (oggi: giorni contati dall'ultimo giorno del
  mese di emissione) e dicitura di esenzione IVA da usare davvero.
- Se la "base demo" di Produzione e la stima delle presenze non trasmesse
  vanno tenute anche in produzione o tolte.
- Formato reale delle etichette termiche e modello di stampante.

## Sviluppi tecnici aperti

### Etichette termiche 80×50 mm

Formato target: stampante termica, 80×50 mm. Layout già progettato ma **non
ancora implementato come stampa reale**: per ora è un mockup di riferimento nel
portale MAVI. Serve un blocco CSS `@media print`.

Contenuto comune alle due varianti: marchio MAVI e data/pasto in testata,
categoria in maiuscoletto, nome piatto grande, ingredienti, codici allergeni EU
con badge, codice colore WHP, istruzioni di riscaldamento più "non ricongelare",
codice di tracciabilità in monospace.

Solo comunità: nome paziente in evidenza, stanza o unità, badge tipo dieta,
note di preparazione.

### Altri

- Export PDF vero lato server. Oggi `documento.js` e i moduli che lo usano
  producono HTML stampabile che il browser salva in PDF.
- Import Excel dell'anagrafica dipendenti.
- Persistenza: oggi non esiste. Tutto vive in memoria, tranne il tema.
- Numeri fissi rimasti nel cruscotto del referente (prenotazioni, pasti del
  mese, diete): decorativi, non calcolati.

## TO DO MAVI del 14 settembre 2026 — fatto in questa sessione

Nove punti lasciati in `TO DO MAVI.txt` sul Desktop, lavorati in parallelo da
agenti separati su un clone git (branch `todo-14-settembre`). Stato:

- **CSS email e telefono in Modifica profilo** — fatto (`styles.css`).
- **Pazienti con pranzo e cena indipendenti** — fatto (`08-portale-comunita.md`).
- **Fatturazione per committente e proforma manuali** — fatto
  (`09b-portale-mavi-gestione.md`, `03-store.md`, `04-dati.md`).
- **Ogni piatto impostabile come fisso** — fatto (`09b-portale-mavi-gestione.md`).
- **Export PDF strutturato** — fatto: `documento.js` (`10-export-e-documenti.md`).
- **Export PDF in azienda non funzionava** — fatto: `resoconto.js`, nessun
  bottone PDF finto rimasto.
- **Riepilogo del giorno per il referente** — fatto (`07-portale-referente.md`).
- **Permessi e ruoli applicati** — vedi `02-architettura.md` e `09b`.
- **Produzione per giorno e settimana con stampa** — vedi `09-portale-mavi.md`.

## TO DO di Filippo del 12 settembre 2026 — fatto in questa sessione

Sei punti lasciati in `Nuovo documento di testo.txt` sul Desktop, non
versionato. Stato a fine sessione:

- **Nuovo committente** — fatto. `ModaleCommittente` in `Modelli.jsx`,
  `st.aggiungiCommittente`: compare in Committenti, Impostazioni, Fatturazione,
  Produzione, Ordini in arrivo. Solo tipo Azienda/Comunità (perimetro attivo).
- **Fatturazione diversificata per committente** — fatto. Prezzo e IVA per
  committente in Impostazioni, proforma unica o separata per struttura.
- **Permessi comunità** (coordinatore/tutore/educatore vs responsabile) —
  fatto nella forma confermata da Filippo: reparto (`stanza` del paziente,
  `reparto` dell'utente), non assegnazione per singolo paziente. Vedi
  `08-portale-comunita.md`.
- **Permessi e gestione utenti** in generale — parzialmente fatto: il campo
  Reparto è comparso nel modale Utenti della Gestione portale MAVI, ma quella
  tabella resta scollegata dal login reale (`UTENTI` in `data.js`), come tutto
  il resto della Gestione utenti — è dimostrativa, non applicata. Un sistema
  di permessi granulari configurabili da interfaccia (oltre al ruolo fisso)
  resta fuori perimetro.
- **Sezione fornitore, Ordini in arrivo da rivedere** — fatto, riscritta da
  zero come drill-down per committente con dettaglio nominativo per l'azienda
  (manifesto PDF per il cassone termico) e per la comunità. Aggiunta anche la
  distinzione fra "generato il" e "per il giorno", segnalata da Filippo dopo
  la prima versione.
- **Edit profilo** — fatto. Icona matita sul blocco utente di ogni portale,
  modale `ModificaProfilo` in `ui.jsx`: nome, email, telefono, password e foto
  (tutto dimostrativo, vedi `05-ui-e-stile.md`).

## Sequenza di lavoro consigliata

1. Leggere `../CLAUDE.md` e il documento tematico della zona toccata.
2. Fare la modifica, mirata.
3. Verificare in `npm run dev`.
4. Rigenerare `dist/` se la modifica va consegnata.
5. Aggiornare `../MAVI_Stato_Progetto.md` e il file in `file.md/` se cambia un
   comportamento documentato.
