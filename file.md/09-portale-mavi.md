# Portale MAVI — `src/aree/Fornitore.jsx`

Accento verde bosco (`data-area="fornitore"`). Utente demo: Cucina MAVI.
È il portale più ricco, dodici voci di menu.

Le pagine stanno in due file: `Fornitore.jsx` (la maggior parte) e
`Modelli.jsx` (`ModelliServizio`, i componenti dei modelli di ordinazione).

## Produzione — `Produzione`

Distinta di produzione multi struttura: quante porzioni di ogni piatto servono
oggi, sommando i contributi di tutti i committenti.

La base è `AGGREGATO` in `data.js`, a cui il prototipo somma le scelte fatte
in demo dal portale dipendente. È il collegamento che rende evidente lo stato
condiviso: se il dipendente conferma, qui i numeri salgono.

La tabella "Contributi per struttura" elenca `st.committenti` (non più un
array fisso `CONTRIBUTI_STRUTTURE` a parte): un committente nuovo compare qui
a zero pasti finché non trasmette qualcosa di reale, e RSA/Scuola non
compaiono più perché sono fuori da `st.committenti`, coerente col perimetro
attivo (prima del 12 settembre comparivano qui nonostante fossero disattivate
altrove, vedi sezione 16 di `../MAVI_Stato_Progetto.md`).

Ogni struttura ha un bottone **"Filtra questa"**; con il filtro attivo compare
un banner blu che lo segnala e permette di toglierlo.

## Ordini in arrivo — `FlussiOrdine`

Riscritta il 12 settembre 2026: non più un elenco statico di eventi, ma un
drill-down per committente sullo stesso stato condiviso della distinta di
produzione e delle presenze — niente dati inventati a parte.

Una riga per committente (`st.committenti`), con pasti dichiarati e stato
(trasmesso/in attesa) calcolati dal vivo. **Apri dettaglio** mostra:

- **Azienda** — quantità aggregate per piatto (da `st.confermati`/`st.ordini`,
  anonime, come le etichette), con una riga "Per [giorno] · generato il
  [data/ora reale]" per ciascun giorno confermato (`st.oraConferma`). Sotto,
  un **dettaglio nominativo riservato al fornitore** (`st.nominativiAzienda`,
  seminato da `ETICHETTE_AZIENDA_DEMO` e alimentato dalle conferme reali della
  demo): chi ha preso cosa, mai visibile al cliente. Il bottone genera un
  **manifesto PDF** (`manifesto.js`, `generaManifestoConsegna`) da stampare e
  mettere nel cassone termico.
- **Comunità** — elenco nominativo da `st.presenzeTrasmesse`, con reparto
  (`stanza`), portate, "per il giorno" e "generato il" (`generatoIl`, timbrato
  da `st.trasmettiPresenze` alla trasmissione).
- **Altro committente** (aggiunto da "Nuovo committente") — nessuna fonte reale
  ancora collegata, mostrato onestamente come tale.

"Resoconto globale" esporta un Excel con un foglio per committente; ogni riga
ha anche "Scarica resoconto di questa struttura" per il singolo documento.

## Giri di consegna — `GiriConsegna`

Da `GIRI`: due giri, ognuno con furgone, autista, ora di partenza e tappe.
Ogni tappa ha ora, struttura, punto di consegna, numero di pasti e note
operative (citofono, ritiro vaschette, fermata breve).

## Etichette pasto — `EtichettePasto`

Due sezioni, con logiche diverse di proposito.

**Azienda** — etichette **anonime**, raggruppate per piatto con contatore `×N`.
Mostrano portata, nome piatto, ingredienti, allergeni, kcal e riscaldamento.
Nessun nome di dipendente: in cucina non serve e sarebbe un dato inutile da
far circolare. Si generano solo quando un dipendente conferma la prenotazione.

**Comunità** — etichette **nominative**, raggruppate per paziente e poi divise
per Pranzo e Cena. Mostrano nome paziente, stanza, tipo dieta, portata, piatto,
note di preparazione, ingredienti, allergeni, kcal e note dieta. Qui il nome
serve, perché il pasto è personalizzato.

Gli ingredienti dei piatti delle diete arrivano da `INGREDIENTI_DIETE`, che
mappa i nomi in chiaro (non ci sono codici piatto nelle diete).

Sotto ogni card c'è "Elimina etichetta", con modale di conferma.

## Committenti — `ModelliServizio` (`Modelli.jsx`)

Dashboard operativa su `st.committenti`, lo stato condiviso (non più un
dizionario statico): quattro numeri, committenti attivi, pasti oggi, chi ha
ordinato, ritardi.

Tabella "Stato operativo di oggi" con struttura, tipo, stato ordine, ora,
pasti e cutoff. Il bottone **Dettagli** apre un pannello a due colonne:

- **Anagrafica** — ragione sociale, indirizzo, P.IVA, referente con ruolo,
  email, telefono. Campi del committente stesso, non più un dizionario
  `CONTATTI` separato.
- **Configurazione servizio** — modello ordine, chi ordina, chi paga, unità,
  pasti stimati, cutoff, listino (prezzo unitario e IVA).

Più i bottoni "Imposta attivo" e "Sospendi / Riattiva servizio"
(`st.aggiornaCommittente`).

### Nuovo committente — `ModaleCommittente`

Aggiunto il 12 settembre 2026: il bottone "Nuovo committente" non è più uno
stub, apre un modulo completo (ragione sociale, tipo Azienda/Comunità,
anagrafica, referente, pasti stimati, prezzo unitario, IVA, cutoff).
`st.aggiungiCommittente` crea il record e lo fa comparire ovunque: Committenti,
Impostazioni per committente, Fatturazione, Produzione, Ordini in arrivo. Non
ci sono ancora ordini reali per un committente appena creato: le pagine lo
mostrano onestamente a zero finché non arriva un flusso vero (fuori perimetro
per RSA/Scuola, che restano creabili solo come tipo Azienda/Comunità).

## Menu della settimana — `Settimana`

Compositore giorno per giorno, con navigazione a quattro settimane.

Si sceglie il giorno in alto, poi la portata da modificare, e si aggiunge un
piatto dal catalogo sulla destra. Le modifiche passano da `st.cambiaMenu` e si
vedono subito nel portale dipendente su quel giorno: è la dimostrazione che il
menu lo governa la cucina.

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
(campi strutturati, usati da Fatturazione), regola pasto, toggle frutta e
monoporzione. Ogni modifica passa da `st.aggiornaCommittente` e si vede subito
anche nella pagina Fatturazione.

### Rotazione menu

Box terracotta con "Settimana N" in grande, data di decorrenza, quando ruota e
il bottone "Forza rotazione". Sotto, una timeline a quattro passi cliccabili
con lo stato: attiva, prossima, programmata. I testi sono in stato locale nel
componente, non in `CICLICO`: la costante in `data.js` descrive la stessa cosa
ma non è collegata alla pagina.

Questa sezione **non compone i piatti**: dice solo quale settimana del ciclo è
in vigore. I piatti si compongono in Menu della settimana.

## Fatturazione — `Fatturazione`

Riscritta il 12 settembre 2026: **listino diversificato per committente**,
non più un prezzo fisso per tutti. Tabella dei pasti per struttura con prezzo
unitario e IVA propri (da `st.committenti`), imponibile, IVA e totale per riga
più il totale documento.

- **Export Excel** con `scaricaExcel`, un rigo per committente più il totale,
  con prezzo e IVA di ciascuno.
- **Genera proforma unica PDF** con `generaProformaPDF`, un solo documento con
  tutte le strutture (stile WHMCS: badge PROFORMA, info-box, box Da/A, tabella
  degli item, totali e note; dati mancanti come placeholder in corsivo
  terracotta).
- **PDF per riga** — proforma separata per quella sola struttura, stesso
  generatore con un array di una riga. `generaProformaPDF(strutture, prezzoDefault)`
  ora legge `prezzo`/`ivaPercentuale` da ogni riga; il secondo parametro resta
  come ripiego per chi passa un solo prezzo (`FattureStruttura` in
  `Struttura.jsx`).

I dati del mittente arrivano da `st.datiAziendali`, che si compila nella
Gestione portale.

## Log operazioni — `LogOperazioni`

Cronologia filtrabile per tipo, la più recente in testa. Colonne: ora, utente,
ruolo, azione, dettaglio, tipo.

Contiene sia log **di sistema** (backup, rotazione menu, cutoff applicato,
promemoria, distinta generata, etichette generate, giri calcolati) sia log
**utente** (ordini, approvazioni, presenze, modifiche) prodotti durante la demo
tramite `st.logga`.

Filtrare per "Sistema" è un buon momento della presentazione: mostra che il
sistema lavora anche quando nessuno lo guarda.

## Gestione portale — `GestionePortale`

Sei tab:

| Tab | Contenuto |
|---|---|
| Dati aziendali | ragione sociale, P.IVA, CF, indirizzo, telefono, email, PEC, IBAN. Finiscono nella proforma |
| Fatturazione | condizioni di pagamento e note standard |
| Aspetto | tre bottoni Chiaro / Scuro / Automatico |
| Utenti | tabella con CRUD completo; il modale mostra nome, username, ruolo, struttura, email, telefono, i permessi assegnati automaticamente per ruolo e — solo per ruolo Educatore — il reparto assegnato (vedi `08-portale-comunita.md`) |
| Notifiche | sei toggle: promemoria, cutoff, ordine ricevuto, presenze mancanti, report mensile, digest email |
| Backup | numeri e pulsanti backup manuale, export completo, ripristino |

## Documenti

`<Documenti gestibile />`: il portale MAVI è l'unico che può caricare e
rimuovere documenti.
