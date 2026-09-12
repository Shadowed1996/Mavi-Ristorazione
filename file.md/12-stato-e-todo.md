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
- **Comunità** — Comunità Il Ponte. Dieta personalizzata per paziente, il
  responsabile segna le presenze.

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

## Difetti da correggere

### `CONTRIBUTI_STRUTTURE` in `Fornitore.jsx` elenca ancora RSA e Scuola

Nella Distinta di produzione, tabella "Contributi per struttura": l'array
`CONTRIBUTI_STRUTTURE` (riga 79) ha righe per "RSA Villa Serena" e "Istituto
Sant'Anna", mostrate come committenti serviti con dati dimostrativi (numero
pasti duplicato da `aggComunita`). È una pagina raggiungibile dal login
Cucina MAVI, quindi il perimetro RSA/Scuola torna visibile in demo, al
contrario di quanto documentato in "Perimetro attuale" sopra. Non toccato:
va deciso con il cliente/con Filippo se togliere le due righe o lasciarle
come dato dimostrativo dichiarato.

## Prima della prossima demo

- Verificare i flussi end-to-end: nuovo paziente → presenza → etichetta.
- Ripulire i commenti superflui dai file sorgente. Attenzione: `sed` rompe le
  stringhe JSX che contengono `://`, vedi `11-convenzioni.md`.
- Rigenerare `dist/` dopo ogni modifica a `src/`.

## Da valutare con MAVI

- Prezzi, quota aziendale, visibilità del prezzo al dipendente.
- Reparti aziendali: come funzionano davvero.
- Se servono più listini e se serve la cena oltre al pranzo.
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

- Export PDF vero lato server. Oggi `proforma.js` produce HTML stampabile.
- Import Excel dell'anagrafica dipendenti.
- Persistenza: oggi non esiste. Tutto vive in memoria, tranne il tema.

## Sequenza di lavoro consigliata

1. Leggere `../CLAUDE.md` e il documento tematico della zona toccata.
2. Fare la modifica, mirata.
3. Verificare in `npm run dev`.
4. Rigenerare `dist/` se la modifica va consegnata.
5. Aggiornare `../MAVI_Stato_Progetto.md` e il file in `file.md/` se cambia un
   comportamento documentato.
