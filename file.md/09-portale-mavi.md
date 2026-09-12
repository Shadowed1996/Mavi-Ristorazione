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

Ogni struttura ha un bottone **"Filtra questa"**; con il filtro attivo compare
un banner blu che lo segnala e permette di toglierlo.

## Ordini in arrivo — `FlussiOrdine`

Chi ha trasmesso cosa e quando, con lo stato. Dati da `FLUSSI_ORDINE` più
quelli generati durante la demo.

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

Dashboard operativa. Quattro numeri: committenti attivi, pasti oggi, chi ha
ordinato, ritardi.

Tabella "Stato operativo di oggi" con struttura, tipo, stato ordine, ora,
pasti e cutoff. Il bottone **Dettagli** apre un pannello a due colonne:

- **Anagrafica** — ragione sociale, indirizzo, P.IVA, referente con ruolo,
  email, telefono.
- **Configurazione servizio** — modello ordine, chi ordina, chi paga, unità,
  pasti stimati, cutoff.

Più i bottoni "Imposta attivo" e "Sospendi / Riattiva servizio".

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

Un tab per committente. Cutoff, listino, regola pasto, toggle frutta e
monoporzione. Valori iniziali da `IMPOSTAZIONI_INIZIALI`.

### Rotazione menu

Box terracotta con "Settimana N" in grande, data di decorrenza, quando ruota e
il bottone "Forza rotazione". Sotto, una timeline a quattro passi cliccabili
con lo stato: attiva, prossima, programmata. I testi sono in stato locale nel
componente, non in `CICLICO`: la costante in `data.js` descrive la stessa cosa
ma non è collegata alla pagina.

Questa sezione **non compone i piatti**: dice solo quale settimana del ciclo è
in vigore. I piatti si compongono in Menu della settimana.

## Fatturazione — `Fatturazione`

Tabella dei pasti per struttura con prezzo unitario, imponibile, IVA e totale.

- **Export Excel** con `scaricaExcel`.
- **Genera proforma PDF** con `generaProformaPDF`, che apre in una nuova scheda
  un documento stile WHMCS: badge PROFORMA, info-box con numero, data, periodo e
  scadenza, box Da/A, tabella degli item, totali e note. I dati aziendali non
  ancora compilati appaiono come placeholder in corsivo terracotta. In cima
  c'è la barra con "Stampa / Salva PDF".

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
| Utenti | tabella con CRUD completo; il modale mostra nome, username, ruolo, struttura, email, telefono e i permessi assegnati automaticamente per ruolo |
| Notifiche | sei toggle: promemoria, cutoff, ordine ricevuto, presenze mancanti, report mensile, digest email |
| Backup | numeri e pulsanti backup manuale, export completo, ripristino |

## Documenti

`<Documenti gestibile />`: il portale MAVI è l'unico che può caricare e
rimuovere documenti.
