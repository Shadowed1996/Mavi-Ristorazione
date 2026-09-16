# Portale MAVI — `src/aree/Fornitore.jsx`

Accento verde bosco (`data-area="fornitore"`). Utente demo: Cucina MAVI.
È il portale più ricco, dodici voci di menu.

Le pagine stanno in due file: `Fornitore.jsx` (la maggior parte) e
`Modelli.jsx` (`ModelliServizio`, i componenti dei modelli di ordinazione).
Questo documento copre la parte operativa (Produzione, Ordini in arrivo,
Giri, Etichette, Committenti); menu, catalogo, impostazioni, fatturazione, log
e gestione portale stanno in `09b-portale-mavi-gestione.md`.

## Produzione — `Produzione`

Riscritta il 14 settembre 2026 su richiesta di Filippo: è la dashboard con cui
MAVI verifica i pasti in arrivo, **per giorno e per settimana**, con il
riepilogo da stampare per la cucina. **La data che si sta guardando è sempre
visibile**: occhiello, titolo, banner del filtro e ogni documento.

- **Vista Giorno**: navigazione ‹ › fra le **sette giornate** di
  `GIORNI_COMUNITA`, da lunedì a domenica, perché le comunità mangiano tutta
  la settimana (apertura su domani rispetto ad "adesso", `INDICE_DOMANI`,
  mercoledì 16; pastiglia "ordini chiusi" con lucchetto o "ordini aperti"),
  titolo `giornoDataIt(GIORNI_COMUNITA[g].data)`. Sabato e domenica l'azienda
  non ha menu (`indiceGiorno >= GIORNI.length`): contributo con `chiusi` e stato
  **"nessun servizio"**.
- **Vista Settimana**: "Settimana dal 14/09 al 20/09/2026", tabella piatto ×
  lun–dom con il totale.
- **Filtro**: Tutte / Aziende / Comunità / singolo committente ("Filtra
  questa") / **singolo centro** ("Filtra centro", `filtro = "centro:<chiave>"`),
  con banner che lo segnala; Pranzo / Cena / Entrambi. L'azienda serve solo il
  pranzo: con Cena restano le sole comunità.

**Destinazioni** (vocale MAVI del 15/09/2026: resoconto cucina diversificato
per committente e per centro). `destinazioniDi(c)`: l'azienda è una consegna
unica (`chiave = c.id`), la comunità una destinazione per centro
(`chiave = c.id + "|" + centro`, da `c.unita` più i centri trovati in pazienti e
presenze). `distintaDelGiorno` calcola sempre pranzo e cena, con
`voce.per[destinazione][pasto]` e i coperti di ogni destinazione divisi in
`confermati` e `stimati`; il filtro del pasto si applica in lettura.

- **Azienda** — le righe di `st.nominativiAzienda` con quell'`indiceGiorno`
  (conferme reali), più una **stima** sul `menuDelGiorno` (`ripartisci`) che
  copre solo i coperti **mancanti**: `COPERTI_STIMA_AZIENDA[i] - confermati`
  (prima si sommava la stima intera alle conferme: 7 + 28 invece di 28).
- **Comunità** — centro per centro e pasto per pasto: `st.presenzeTrasmesse`
  di quel centro (`stanza`); se quel centro non ha trasmesso, stima dalle diete
  dei suoi pazienti (`pastiDi`, `portateServite`) **con le variazioni applicate**:
  un paziente con variazione di presenza `false` per quel giorno e pasto non
  si conta, la dieta è `dietaEffettiva`. Sulle righe già trasmesse le
  variazioni arrivano sostituendo la riga (`sostituisciRigaTrasmessa`, lato
  comunità). Prima bastava che un centro
  trasmettesse per azzerare la stima degli altri. Un centro che ha trasmesso
  tutti assenti non ha righe ma compare in `st.trasmissioniCentri`: conta come
  trasmesso (campo `trasmessi` del contributo) e ha stato **"trasmesso, nessun
  pasto"**, a schermo, nel PDF e nell'Excel.

Riquadri: pasti (azienda, comunità, quanti stimati), porzioni, diete
particolari, variazioni dai centri (da prendere in carico; presenza e dieta già
nelle quantità, Altro da applicare a mano), "Destinazioni confermate N su M".
Pannelli, nell'ordine:

1. **Pasti per committente e centro** — riga per committente e, sotto, una riga
   per centro con referente (`st.utenti` con `struttura` e `reparto`), pasti per
   pasto, porzioni e stato (`statoContributo`: confermato, in parte stimato,
   stima, in attesa). Righe fuori filtro attenuate (`.dist-fuori`).
2. **Quantità da produrre** — riepilogo totale per piatto, colonne per
   committente (giorno) o per giornata (settimana, "Lunedì 14 set" come nel PDF
   e nell'Excel), riga di totale. I **piatti quasi omonimi** con almeno un nome
   fuori catalogo (`piattiSimili`, radici delle parole senza preposizioni) sono
   segnalati "da verificare", mai sommati: i dati non si correggono.
3. **Dettaglio per committente e centro** — una scheda per destinazione
   (`.dist-dest`) con piatti, pranzo/cena, diete e variazioni del centro.
4. **Variazioni dai centri** — `st.variazioni` del periodo, del perimetro e del
   pasto (una variazione "entrambi" vale per tutti e due).
5. **Diete particolari e consistenze** — con committente, centro e pasti.

**Stampa / PDF** (`generaDistintaPDF` / `generaDistintaSettimanaPDF`): riepilogo
per piatto, pasti per committente e centro, variazioni, diete, firma, poi una
**scheda di consegna per destinazione, ognuna su pagina nuova**. **Excel**:
fogli "Quantità per piatto", "Pasti per centro", "Per committente e centro"
(righe piatte filtrabili), "Variazioni dai centri", "Diete particolari"; ogni
foglio riporta giornata e perimetro in riga 3, il nome file anche filtro e
pasto. PDF ed Excel ricevono gli stessi array della pagina: verificato numero per
numero con lo strumento di prova per ogni filtro, pasto, giorno e settimana.

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
  conteggio dei nominativi e "chiuso" / "aperto", lucchetto sui chiusi) e il bottone genera il **manifesto PDF** di quel
  solo giorno (`manifesto.js`, `generaManifestoConsegna` con `indiceGiorno`)
  da stampare e mettere nel cassone termico. Dal 16 settembre 2026 il manifesto
  è asciutto e **non è più riservato al fornitore**: lo stampano sia la cucina
  sia il referente dell'azienda, quindi niente diete con prescrizione medica,
  solo nome, pasto una portata per riga e allergie dichiarate
  (`10-export-e-documenti.md`). Dal 15 settembre 2026 il dettaglio
  nominativo e il manifesto si vedono anche senza conferme dal vivo (prima la
  sezione spariva finché un dipendente non confermava, nascondendo gli ordini
  già chiusi). L'occhiello della pagina è `ETICHETTA_ADESSO`.
- **Comunità** — elenco nominativo da `st.presenzeTrasmesse`, con centro
  (`stanza`), **pasto** (pranzo e cena sono righe distinte, trasmesse
  separatamente), portate, "per il giorno" e "generato il" (`generatoIl`,
  timbrato da `st.trasmettiPresenze` alla trasmissione). Il conteggio è di
  pasti, non di pazienti, e il dettaglio lo dichiara. Sotto, **Variazioni dai
  centri** (`st.variazioni || []`): centro, autore, giorno, pasto, paziente,
  tipo, testo e stato; "Prendi in carico" chiama `st.prendiInCaricoVariazione`
  e compare solo se la funzione esiste e il ruolo ha `flussi.variazioni`. La
  riga del committente ha la colonna Variazioni con "N da prendere in carico".
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
(`raggruppaAzienda`). Mostrano portata e nome piatto, nient'altro. Nessun nome
di dipendente: in cucina non serve e sarebbe un dato inutile da far circolare.
Si generano solo quando un dipendente conferma la prenotazione.

**Comunità** — etichette **nominative**, raggruppate prima per **centro** (`stanza`)
poi per paziente e infine per Pranzo/Cena (`raggruppaComunita`) — senza il
livello reparto, una comunità con molti pazienti torna a essere uno scroll
enorme, lo stesso problema di partenza. La chiave di ogni etichetta include il
pasto (`com-<id>-<pasto>-<portata>`), così pranzo e cena dello stesso paziente
coesistono; la card "Pasto" in cima riflette i pasti presenti ("Pranzo",
"Cena", "Pranzo + Cena") invece di essere fissa. Mostrano nome paziente,
stanza, tipo dieta, portata, piatto, nota di preparazione e note della dieta.

**Dal 16 settembre 2026 le etichette dicono il minimo indispensabile** (Filippo,
riferendo il cliente): nome e cognome solo in comunità, portata, nome del piatto
e note. Via ingredienti, allergeni, kcal e riga di riscaldamento da entrambe —
erano informazione in più che rendeva l'etichetta difficile da leggere in
cucina. Per questo `INGREDIENTI_DIETE` non serve più a `Fornitore.jsx`. Il
blocco Note della comunità compare solo se la dieta ha davvero delle note.

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
