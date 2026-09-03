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

### Chi non ha ancora prenotato

Tabella con matricola, nome e reparto, popolata da `DIPENDENTI.slice(3, 6)`.
Un pulsante "Invia promemoria" mostra un toast. In fondo la nota sul cutoff
delle 14:00 del giorno precedente.

### "Prenota per lui"

È il pezzo forte della pagina. Il bottone sulla riga apre un `Velo largo` con
il menu del giorno di mercoledì (indice 2, fisso).

Per ogni categoria di `CATEGORIE` compare una fila di pulsanti piatto, con il
pallino del colore WHP. La selezione vive in `scelte`, stato locale, e
replica la mutua esclusione primo/sostitutivo e secondo/sostitutivo.

Il piede mostra il conteggio delle portate selezionate; "Conferma prenotazione"
è disabilitato finché non se ne sceglie almeno una. Alla conferma:

```js
st.avvisa(...)                                    // toast di conferma
st.logga("Roberto Manzi", "Referente",
         "Prenotazione per conto di", ..., "ordine")
```

Il log è visibile poi nel portale MAVI, alla voce Log operazioni: è la
dimostrazione della tracciabilità.

> Nota: questa prenotazione **non** scrive in `st.ordini`, quindi non compare
> nel vassoio del dipendente né nella distinta. È deliberato per la demo, ma
> se il cliente chiede coerenza va collegata a `st.scegli` / `st.conferma`.

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
- Export dedicato per l'ufficio paghe, con le sole trattenute.

Entrambi gli export passano da `scaricaExcel` di `excel.js`, vedi
`10-export-e-documenti.md`.

## Fatture — `Fatture`

Tabella dei documenti da `FATTURE`: numero, periodo, pasti, imponibile, stato
(`pagata`, `da pagare`, `in corso`) e stato SdI.

Il bottone PDF genera la proforma reale con `generaProformaPDF` di
`proforma.js`: si apre in una nuova scheda, impaginata, con il pulsante di
stampa.

Il pulsante "Paga" è stato rimosso di proposito: il pagamento non passa dal
portale.

## Documenti

`<Documenti />` senza flag, quindi il referente vede tutte le voci, comprese
quelle non pubbliche come il capitolato del servizio.
