# Portale referente aziendale — `src/aree/Cliente.jsx`

Accento blu (`data-area="cliente"`). Utente demo: Roberto Manzi, ufficio del
personale di Rossi Manifatture Spa.

Cinque voci: Cruscotto, Dipendenti, Resoconti, Fatture, Documenti.

Helper locale: `eur(n)` formatta in euro con la virgola decimale.

## Cruscotto — `Cruscotto`

### Numeri chiave

Quattro riquadri `.numero`: dipendenti attivi, prenotazioni di domani (con
barra di avanzamento), pasti del mese, diete speciali attive. Sono valori
fissi scritti nel componente, non calcolati: servono a dare contesto in demo.

### Ordini del giorno (dal 14 settembre 2026)

Pannello con un selettore dei soli giorni **ancora aperti**
(`giorniAperti(GIORNI)`: con "adesso" martedì 15 alle 22:56, giovedì e
venerdì), apertura sul primo. Anteprima a schermo delle righe di
`st.nominativiAzienda` con `committente === "azienda"` e `indiceGiorno` uguale
al giorno scelto: Dipendente / Reparto / Primo / Secondo / Contorno, con il
piatto unico indicato come "Piatto unico: …" nella colonna Primo, e il
conteggio dei pasti. Le conferme del portale dipendente compaiono qui nel
giorno giusto, con il reparto vero.

**Stampa riepilogo** apre il **riepilogo di tutti gli ordini del giorno**
(Filippo, 15 settembre 2026: "dipendente 1 pasto, dipendente 2 pasto, un
insieme di tutto, non troppo dettagliato ma fatto bene"): titolo "Ordini di
giovedì 17 settembre", poi con `elencoOrdini` di `documento.js` ogni
dipendente in ordine alfabetico, con il reparto accanto al nome e sotto il
pasto su una riga (primo · secondo · contorno, oppure il piatto unico), su due
colonne; in fondo il totale dei pasti e chi non ha ordinato. Solo i dipendenti
della propria azienda, nessuna dieta sanitaria.

### Chi non ha ancora prenotato

Tabella con matricola, nome e reparto: i dipendenti attivi di `DIPENDENTI`
senza riga nominativa per il giorno scelto, non più un `slice` fisso. Un
pulsante "Invia promemoria" mostra un toast.

### "Prenota per lui"

Il bottone sulla riga apre un `Velo largo` con il menu del giorno selezionato.
Per ogni categoria di `CATEGORIE` compare una fila di pulsanti piatto con il
pallino del colore WHP. La selezione vive in `scelte`, stato locale, e replica
le esclusioni fra primo/sostitutivo, secondo/sostitutivo e piatto unico.

Alla conferma si chiama `st.conferma(giorno, { nome, matricola, ruolo,
inseritaDa }, scelte)`: con le portate esplicite la conferma **non tocca il
carrello del dipendente demo** (`st.ordini`, `st.confermati`), produce solo la
riga nominativa (deduplicata per persona e giorno, quindi niente doppioni con
il seme) e scrive nel log "Prenotazione per conto di …" attribuita al
referente. Il dipendente sparisce da "Chi non ha ancora prenotato" per quel
giorno e la riga entra nel riepilogo e nel manifesto MAVI. Prima del 14
settembre 2026 la conferma passava da `st.scegli` sul carrello di Antonella e
leggeva gli ordini da una closure vecchia: riga vuota o con i piatti sbagliati.

## Dipendenti — `Dipendenti`

Tabella dell'anagrafica da `DIPENDENTI`: matricola, nome, reparto, dieta,
stato, pasti del mese. Le diete marcate `riservata` compaiono come tali senza
dettaglio, con la classe `.riservato`: il referente aziendale non deve vedere
il dato sanitario del dipendente. È un punto da sottolineare in riunione.

## Resoconti — `Resoconti`

Basata su `RESOCONTO_MENSILE` (agosto 2026).

- Numeri in evidenza in cima.
- Tabella riepilogo per dipendente: pasti, imponibile, quota a carico
  dell'azienda, trattenuta in busta paga. Il listino è `PREZZO_PASTO` (7,50 €)
  con `QUOTA_DIPENDENTE` (3,20 €).
- **Click sulla riga** espande il dettaglio giornaliero, giorno per giorno con
  primo, secondo e contorno. I giorni senza pasto mostrano il trattino lungo.
- Export Excel a due fogli: riepilogo e dettaglio.
- **PDF** (dal 14 settembre 2026 non più finto): `generaResocontoPDF` di
  `resoconto.js`, con gli stessi dati dell'Excel perché entrambi partono da
  `calcolaResoconto`.
- Export dedicato per l'ufficio paghe, con le sole trattenute.

Gli Excel passano da `scaricaExcel` di `excel.js`, vedi
`10-export-e-documenti.md`.

## Fatture — `Fatture`

Dal 14 settembre 2026 legge `st.proforme` filtrate per il proprio committente
(`"azienda"`): numero, periodo, imponibile, IVA, totale, scadenza, condizioni
(termini, metodo, regime IVA) e stato (non pagata, pagata, annullata, stornata, con
`PastigliaProforma` di `ui.jsx`). Gli importi sono gli stessi del PDF perché
vengono da `totaliProforma`.

Il bottone PDF apre la proforma con `generaProformaPDF` di `proforma.js` in una
nuova scheda, impaginata, con il pulsante di stampa. Non c'è più la nota
"vanno definiti con MAVI": le condizioni sono quelle del committente.

Il pulsante "Paga" è stato rimosso di proposito: il pagamento non passa dal
portale.

## Documenti

`<Documenti />` senza flag, quindi il referente vede tutte le voci, comprese
quelle non pubbliche come il capitolato del servizio.
