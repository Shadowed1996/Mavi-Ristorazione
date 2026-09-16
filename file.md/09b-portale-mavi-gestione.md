# Portale MAVI, gestione — `src/aree/Fornitore.jsx` (seconda parte)

Continua `09-portale-mavi.md`: qui le pagine di configurazione e
amministrazione del portale MAVI. Stesso file sorgente, stesso accento verde
bosco.

## Menu della settimana — `Settimana`

Compositore giorno per giorno, con navigazione a quattro settimane. Si apre sul
primo giorno aperto; i giorni con gli ordini chiusi (lunedì, martedì e
mercoledì) hanno il lucchetto e restano **in sola lettura**: niente catalogo,
niente riordino né "Rendi fisso", con un avviso. Ripristina e Pubblica restano
disponibili (16 settembre 2026).

Si sceglie il giorno in alto, poi la portata da modificare, e si aggiunge un
piatto dal catalogo sulla destra. Dal 14 settembre 2026 ogni voce del catalogo
ha due azioni: **Aggiungi al giorno**, che mette il piatto solo in quel giorno,
e **Rendi fisso**, che lo mette in tutti i giorni della settimana
(`st.cambiaMenu("fissi", categoria, id)`). Il catalogo elenca tutti i piatti
della portata e mostra lo stato di ciascuno ("Già in questo giorno", "In tutti
i giorni", etichetta `fisso`). Lo stesso si fa da una riga del giorno con
**Rendi fisso**, che toglie il piatto dai variabili e lo aggiunge ai fissi; sui
fissi resta solo "togli". Il vecchio tasto "Aggiungi il primo come piatto
fisso", che promuoveva d'ufficio il primo piatto della lista filtrata, non
esiste più. I fissi si vedono ripetuti su tutte le colonne della Griglia
settimana e nel portale dipendente tramite `menuDelGiorno`. Le modifiche
passano da `st.cambiaMenu` e si vedono subito nel portale dipendente: è la
dimostrazione che il menu lo governa la cucina.

C'è anche il riordino per trascinamento (`st.riordinaMenu`) e il ripristino
alla versione iniziale (`st.ripristinaMenu`).

Il pulsante **Griglia settimana** apre il prospetto a cinque colonne e
**Stampa** lo manda in stampa, pronto per la bacheca.

## Catalogo piatti — `Catalogo`

CRUD dei piatti. Colonna **Codice**: è la chiave di `PIATTI` e il nome del file
fotografia.

Caricamento fotografie: il pulsante **Foto** sulla riga carica un file per quel
piatto, **Carica foto in blocco** ne accetta molti insieme abbinandoli per nome
file. Le immagini finiscono in `st.foto` e vivono per la sessione.

Creazione e modifica passano da `st.salvaPiatto`, l'eliminazione da
`st.eliminaPiatto`, che rimuove il piatto anche da tutti i menu.

## Impostazioni — `ImpostazioniServizio`

Un tab per committente (`st.committenti`, non più un dizionario a parte).
Cutoff, listino (etichetta libera), **prezzo unitario a pasto e IVA**
(campi strutturati, usati da Fatturazione), regola pasto. Dal 14 settembre
2026 anche il pannello **Condizioni di fatturazione**: termini di pagamento,
metodo, regime IVA (l'aliquota si disattiva se senza IVA, la dicitura di
esenzione compare solo in quel caso), più CF, PEC e codice SDI nel blocco
anagrafico. Ogni modifica passa da `st.aggiornaCommittente` e diventa la
proposta di partenza per le proforma successive, senza toccare quelle già
emesse.

"Frutta a ogni pasto" e "Consegna in monoporzione nominativa" (12 settembre
2026, tolte su indicazione di Filippo: "quelle sono già decise") non sono più
toggle editabili qui — restano campi fissi (`c.frutta`, `c.monoporzione`) sul
committente, letti da `equilibrio()` in `data.js` per l'indicatore del pasto
equilibrato. Per cambiarli serve modificare il seed in `COMMITTENTI`
(`data.js`), non più l'interfaccia.

### Reparti — sostituisce "Rotazione menu" (12 settembre 2026)

Al posto del pannello "Rotazione menu" (rimosso: non dipendeva nemmeno dal
committente selezionato, era sempre lo stesso indipendentemente dal tab —
posto sbagliato per un'informazione globale), qui si gestisce l'elenco
`c.unita` del committente attivo: chip con la "×" per rimuovere, campo +
bottone "Aggiungi" per aggiungerne uno. Scrive con `st.aggiornaCommittente(id,
{ unita: [...] })`.

Questo stesso elenco alimenta:
- il menu a tendina "Stanza / struttura" in `ModuloPaziente` (`Comunita.jsx`),
  che decide anche il reparto del paziente;
- il menu a tendina "Reparto assegnato" (il centro) nel modale Utenti di
  Gestione portale: obbligatorio solo per i ruoli senza
  `pazienti.tuttiReparti`; per il Referente è il centro di appartenenza e non
  filtra.

Rimuovere un reparto **non sposta** i pazienti o gli utenti già assegnati a
quel valore: restano con la stringa vecchia finché qualcuno non la cambia a
mano (`ModuloPaziente` include comunque il valore corrente in lista anche se
non è più fra i reparti censiti, per non perderlo in silenzio).

La rotazione menu (`CICLICO` in `data.js`, la timeline a quattro settimane)
non ha più una pagina propria: il ciclo resta descritto nella costante ma senza
un pannello dedicato, coerente con quanto era già segnalato — non componeva i
piatti né era collegata a `CICLICO`, lo faceva comunque "Menu della
settimana".

## Fatturazione — `Fatturazione`

Riscritta il 14 settembre 2026 (decisione con il cliente: condizioni per
committente e **proforma create a mano**, niente più proforma unica). Stesso
schema a tab per committente di "Impostazioni per committente".

- **Nuova proforma** apre un `Velo largo` (`ModuloProforma`): periodo
  mese/anno, righe modificabili (descrizione, quantità, prezzo) precompilate
  con i pasti del periodo × prezzo unitario, aggiungi/togli riga; termini,
  metodo, regime IVA, aliquota e dicitura precompilati dal committente ma
  modificabili **solo per quel documento**; anteprima di imponibile, IVA,
  totale e scadenza. **Emetti e apri PDF** chiama `st.emettiProforma` e apre
  subito il documento con `generaProformaPDF` (`proforma.js`).
- Sotto, l'**elenco delle proforma emesse** del committente (`st.proforme`),
  con lo stato in pastiglia (`STATI_PROFORMA`: **non pagata**, **pagata**,
  **annullata**, **stornata**) e le azioni (15 settembre 2026): PDF sempre;
  su una non pagata **Segna pagata** (`fatturazione.pagamenti`), **Storna**
  (`fatturazione.storna`) e **Annulla** (`fatturazione.annulla`); su una
  pagata solo **Storna**. Annullate e stornate restano in elenco barrate, fuori
  dai totali (`proformaValida`). Lo stato è stampato anche sul PDF.
  Il termine non ha più un predefinito: senza termini del committente il
  modulo chiede "Scegli i termini" prima di emettere.
- **Tutte le strutture** — tabella riassuntiva con condizioni (termini,
  metodo, regime) e ultima scadenza per committente, più Excel.

I dati del mittente, IBAN e note standard arrivano da `st.datiAziendali`
(Gestione portale) e finiscono davvero nel documento.

## Log operazioni — `LogOperazioni`

Cronologia filtrabile per tipo, la più recente in testa. Colonne: ora, utente,
ruolo, azione, dettaglio, tipo.

Contiene sia log **di sistema** (backup, rotazione menu, cutoff applicato,
promemoria, distinta generata, etichette generate, giri calcolati) sia log
**utente** (ordini, approvazioni, presenze, modifiche) prodotti durante la demo
tramite `st.logga`.

Filtrare per "Sistema" è un buon momento della presentazione: mostra che il
sistema lavora anche quando nessuno lo guarda. "Esporta" produce un Excel vero
con le righe del filtro attivo (dal 14 settembre 2026).

## Gestione portale — `GestionePortale`

Sette tab (`TAB_GESTIONE`, ognuna sotto un permesso `gestione.*`):

| Tab | Contenuto |
|---|---|
| Dati aziendali | ragione sociale, P.IVA, CF, indirizzo, telefono, email, PEC, IBAN. Finiscono in testata di ogni documento stampabile e nell'intestazione degli Excel |
| ~~Fatturazione~~ | **tolta il 15 settembre 2026** (Filippo: "la fatturazione a 30 giorni togliamola, l'abbiamo diversificata"): niente più condizioni predefinite, termini, metodo e regime IVA si decidono per committente (Impostazioni e "Nuovo committente", dove i termini vanno scelti). Le note standard proforma sono passate in Dati aziendali, accanto all'IBAN |
| Aspetto | tre bottoni Chiaro / Scuro / Automatico |
| Utenti | `st.utenti`, **collegati al login** dal 14 settembre 2026: un utente creato qui entra davvero. Il modale (`ModaleUtente`) ha ruoli da `st.ruoli` filtrati per il portale della struttura, committenti da `st.committenti` più MAVI, username obbligatorio e univoco, reparto obbligatorio per chi non ha `pazienti.tuttiReparti` in una comunità, e mostra i permessi ricavati dal ruolo. Disattivare un utente gli impedisce il login; l'ultimo con `gestione.ruoli` non si disattiva |
| Ruoli e permessi | matrice permessi × ruoli per portale (selettore Mavi / Azienda / Comunità), spunte disattivate sul ruolo bloccato Cucina MAVI; "Nuovo ruolo" con nome, portale, telaio (solo azienda) e copia da un ruolo esistente; elimina ruolo se nessun utente lo usa. Ogni voce di menu e ogni azione del portale è condizionata da una chiave (`st.puo`), applicata al volo. Nel portale struttura i ruoli iniziali sono Referente (tutti i centri) e Responsabile amministrativo (solo fatture e resoconti numerici) (15 settembre 2026, gruppo Variazioni e `resoconti.nominativi`); in MAVI `flussi.variazioni` arriva da solo a Cucina MAVI |
| Notifiche | sei toggle: promemoria, cutoff, ordine ricevuto, presenze mancanti, report mensile, digest email |
| Backup | numeri e pulsanti backup manuale, export completo, ripristino |

## Documenti

`<Documenti gestibile />`: il portale MAVI è l'unico che può caricare e
rimuovere documenti.
