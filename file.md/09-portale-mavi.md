# Portale MAVI — `src/aree/Fornitore.jsx`

Accento verde bosco (`data-area="fornitore"`). Utente demo: Cucina MAVI.
È il portale più ricco, dodici voci di menu.

Le pagine stanno in due file: `Fornitore.jsx` (la maggior parte) e
`Modelli.jsx` (`ModelliServizio`, i componenti dei modelli di ordinazione).
Questo documento copre la parte operativa (Produzione, Ordini in arrivo,
Giri, Etichette, Committenti); menu, catalogo, impostazioni, fatturazione, log
e gestione portale stanno in `09b-portale-mavi-gestione.md`.

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
  demo): chi ha preso cosa, mai visibile al cliente. Dal 14 settembre 2026 il
  dettaglio si sceglie **per giornata** (selettore dei cinque giorni con il
  conteggio dei nominativi) e il bottone genera il **manifesto PDF** di quel
  solo giorno (`manifesto.js`, `generaManifestoConsegna` con `indiceGiorno`)
  da stampare e mettere nel cassone termico.
- **Comunità** — elenco nominativo da `st.presenzeTrasmesse`, con reparto
  (`stanza`), **pasto** (pranzo e cena sono righe distinte, trasmesse
  separatamente), portate, "per il giorno" e "generato il" (`generatoIl`,
  timbrato da `st.trasmettiPresenze` alla trasmissione). Il conteggio è di
  pasti, non di pazienti, e il dettaglio lo dichiara.
- **Altro committente** (aggiunto da "Nuovo committente") — nessuna fonte reale
  ancora collegata, mostrato onestamente come tale.

"Resoconto globale" esporta un Excel con un foglio per committente; ogni riga
ha anche "Scarica resoconto di questa struttura" per il singolo documento.

## Giri di consegna — `GiriConsegna`

Da `GIRI`: due giri, ognuno con furgone, autista, ora di partenza e tappe.
Ogni tappa ha ora, struttura, punto di consegna, numero di pasti e note
operative (citofono, ritiro vaschette, fermata breve).

## Etichette pasto — `EtichettePasto`

Riscritta il 12 settembre 2026 su segnalazione di Filippo: con 20 aziende e 30
comunità, uno scroll unico con tutte le etichette di tutte le strutture
sarebbe ingestibile (letteralmente migliaia di card). Ora:

- **Raggruppata per tipo di committente**: un pannello "Aziende" e uno
  "Comunità" (`righeAzienda`/`righeComunita`, filtrati da `st.committenti` su
  `c.tipo`), ciascuno con una riga per struttura e il conteggio etichette.
- **Una struttura alla volta**: "Apri dettaglio" espande solo quella riga;
  dentro, un campo di ricerca (per piatto in azienda, per nominativo in
  comunità) e un bottone "Stampa etichette di [struttura]" che apre una vista
  di stampa dedicata (`VistaStampaEtichette`) — mai la pagina intera.
- **Pallino "etichette arrivate"**: un pallino rosso lampeggiante (CSS
  `.pallino-nuovo`, animazione `lampeggia`) segnala una struttura il cui
  conteggio etichette è salito da quando non la si apriva (stato locale
  `visti`, `{ [committenteId]: conteggioUltimaApertura }`). Aprire il
  dettaglio (`apriStruttura`) lo fa sparire; il bottone stesso diventa
  "Visualizza etichette arrivate" finché c'è qualcosa di nuovo da vedere.

**Azienda** — etichette **anonime**, raggruppate per piatto con contatore `×N`
(`raggruppaAzienda`). Mostrano portata, nome piatto, ingredienti, allergeni,
kcal e riscaldamento. Nessun nome di dipendente: in cucina non serve e sarebbe
un dato inutile da far circolare. Si generano solo quando un dipendente
conferma la prenotazione.

**Comunità** — etichette **nominative**, raggruppate prima per **reparto**
poi per paziente e infine per Pranzo/Cena (`raggruppaComunita`) — senza il
livello reparto, una comunità con molti pazienti torna a essere uno scroll
enorme, lo stesso problema di partenza. La chiave di ogni etichetta include il
pasto (`com-<id>-<pasto>-<portata>`), così pranzo e cena dello stesso paziente
coesistono; la card "Pasto" in cima riflette i pasti presenti ("Pranzo",
"Cena", "Pranzo + Cena") invece di essere fissa. Mostrano nome paziente, stanza, tipo
dieta, portata, piatto, note di preparazione, ingredienti, allergeni, kcal e
note dieta.

Gli ingredienti dei piatti delle diete arrivano da `INGREDIENTI_DIETE`, che
mappa i nomi in chiaro (non ci sono codici piatto nelle diete).

Sotto ogni card c'è "Elimina etichetta", con modale di conferma — solo nella
vista a elenco, non nella vista di stampa: `CardEtichettaAzienda` e
`CardEtichettaComunita` accettano un `onElimina` opzionale, che
`VistaStampaEtichette` non passa, quindi lì il bottone non compare.

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
  pasti stimati, cutoff, listino (prezzo unitario e IVA), termini, metodo di
  pagamento e regime IVA. In anagrafica anche CF, PEC e codice SDI.

Più i bottoni "Imposta attivo" e "Sospendi / Riattiva servizio"
(`st.aggiornaCommittente`).

### Nuovo committente — `ModaleCommittente`

Aggiunto il 12 settembre 2026: il bottone "Nuovo committente" non è più uno
stub, apre un modulo completo (ragione sociale, tipo Azienda/Comunità,
anagrafica con CF/PEC/SDI, referente, pasti stimati, prezzo unitario, IVA,
cutoff, condizioni di fatturazione precompilate dalle predefinite di Gestione
portale).
`st.aggiungiCommittente` crea il record e lo fa comparire ovunque: Committenti,
Impostazioni per committente, Fatturazione, Produzione, Ordini in arrivo. Non
ci sono ancora ordini reali per un committente appena creato: le pagine lo
mostrano onestamente a zero finché non arriva un flusso vero (fuori perimetro
per RSA/Scuola, che restano creabili solo come tipo Azienda/Comunità).
