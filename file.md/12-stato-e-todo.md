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
| Pagine dedicate | `Extra.jsx` → `PazientiRSA`, `Modelli.jsx` → `OspitiRsa` |
| Ordini demo di RSA e scuola | `store.jsx` → `ORDINI_IN_CODA` |
| Identità cromatica | `styles.css` → `[data-area="rsa"]`, `[data-area="scuola"]` |

Non sono raggiungibili dal login perché nessuna voce di `UTENTI` ha quelle
strutture. **Non rimuoverli**: possono tornare come moduli separati e
riattivarli costa una riga.

Anche `Landing.jsx` (vecchia pagina di scelta portale) e le schermate `Accesso`
interne ai portali sono fuori dal flusso ma vive nel codice.

## Difetti da correggere

### Tabella "Quantità da produrre" con intestazioni sfasate

In `Fornitore.jsx`, componente `Produzione`. Con filtro "tutte" l'intestazione
dichiara quattro colonne struttura (Azienda, RSA, Comunità, Scuola) ma il corpo
ne rende due, perché `perStruttura` ha solo `azienda` e `comunita`. Le celle
non corrispondono alle intestazioni. Serve una decisione: aggiungere dati
dimostrativi per RSA e scuola, oppure togliere quelle due colonne.

### `Extra.jsx` è interamente codice morto

Nessuno dei sette export è importato da alcun file di `src/`. Duplica in forma
più vecchia pagine oggi attive altrove (`Giri`→`GiriConsegna`,
`Etichette`→`EtichettePasto`, `ImpostazioniCommittente`→`ImpostazioniServizio`,
`PazientiRSA`→`OspitiRsa`). Da eliminare o da ricollegare: è una decisione di
prodotto, non un fix.

### CSS morto in `styles.css`

Intere famiglie di classi non sono più referenziate da alcun JSX: `.tessera*`,
`.tv-*`, `.cassetto*`, `.piatto-card*`, `.riga-piatto`, `.fase*`, `.roadmap`,
`.so-anteprima*`, `.comm-card`, `.cat-tab*`, `.filtri-colore`. Non rimosse
perché intrecciate con regole vive nello stesso intorno (esempio: `.btn:disabled`
sta dentro il blocco morto "Cronoprogramma"). Serve una passata dedicata con
verifica visiva a `npm run dev` aperto.

### "Prenota per lui" non alimenta ordini e distinta

Nel cruscotto del referente la prenotazione per conto di un dipendente scrive
solo un toast e una riga di log: non passa da `st.scegli` / `st.conferma`,
quindi non compare nel vassoio né nella distinta di produzione. Va deciso con
il cliente se collegarla.

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
