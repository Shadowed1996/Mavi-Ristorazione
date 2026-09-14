# Store condiviso — `src/store.jsx`

Un solo Context React per tutta l'applicazione. Si legge con `usaStato()`:

```js
import { usaStato } from "../store.jsx";
const st = usaStato();
```

Il Provider avvolge tutto in `App.jsx`, quindi lo stato sopravvive al cambio di
ruolo e di portale. È questo che permette la demo incrociata: il dipendente
prenota, il portale MAVI vede la distinta aggiornata.

## Ordini del dipendente

| Nome | Cosa |
|---|---|
| `ordini` | `{ [indiceGiorno]: { [categoria]: idPiatto } }` |
| `confermati` | `{ [indiceGiorno]: true }` |
| `scegli(giorno, categoria, id)` | seleziona o deseleziona un piatto |
| `conferma(giorno, chi, piatti?)` | conferma la prenotazione del giorno, logga, timbra `oraConferma[giorno]` e aggiunge/aggiorna la riga in `nominativiAzienda`. Con `piatti` (`{ categoria: idPiatto }`) è la prenotazione **per conto di un altro**: non tocca `ordini`, `confermati` né `oraConferma`, produce solo la riga nominativa. `chi` è `{ nome, matricola?, ruolo, inseritaDa? }`; con `inseritaDa` il log attribuisce l'azione a chi prenota |
| `disdici(giorno)` | annulla la conferma |
| `coperte(giorno)` | portate già coperte dal piatto unico scelto |
| `mancanti(giorno)` | array leggibile delle portate mancanti |
| `oraConferma` | `{ [giorno]: isoString }`, quando è stata confermata la prenotazione — diverso da "per quale giorno", che è `giorno` stesso |
| `nominativiAzienda` | elenco nominativo (chi ha preso cosa), parte da `ETICHETTE_AZIENDA_DEMO` e cresce con `conferma()`. Riga: `{ id, nome, matricola, reparto, committente: "azienda", committenteNome, indiceGiorno, giorno, pasto, primo, secondo, contorno, unico }`. Alimenta "Ordini in arrivo" e il manifesto del portale MAVI e, dal 14 settembre 2026, il riepilogo del giorno del referente (solo la propria azienda) |

`conferma` legge gli ordini da una ref (`ordiniRef`), non dalla closure: senza,
una conferma passata ai figli vedeva gli ordini del render precedente. La
deduplica è per **nome + `indiceGiorno`**, così la riga del seme viene
sostituita e non raddoppiata; matricola e reparto arrivano da
`anagraficaAzienda` di `data.js`.

### Regole di esclusione dentro `scegli`

Sono la parte più delicata dello store.

1. Ricliccare lo stesso piatto lo deseleziona.
2. `primo` e `sost_primo` si escludono a vicenda. Idem `secondo` e
   `sost_secondo`.
3. Scegliere un `unico` cancella tutte le categorie che quel piatto copre,
   lette da `PIATTI[id].so`, comprese le sostitutive corrispondenti.
4. Scegliere una portata già coperta dall'unico attivo cancella l'unico.
5. Se `GIORNI[giorno].chiuso` è vero, la selezione viene rifiutata con un avviso.
6. Ogni selezione azzera la conferma di quel giorno.

`mancanti` considera coperte le portate del piatto unico: con un unico che
copre primo e secondo, manca solo il contorno.

## Menu e catalogo

| Nome | Cosa |
|---|---|
| `menu` | `{ variabili: [5 giorni], fissi: {} }`, parte da `MENU_INIZIALE` |
| `cambiaMenu(giorno, categoria, id)` | aggiunge o toglie un piatto; `giorno` può essere `"fissi"` |
| `riordinaMenu(giorno, categoria, da, a)` | sposta un piatto dentro la portata |
| `ripristinaMenu()` | riporta il menu alla versione iniziale |
| `salvaPiatto(id, dati)` | crea o aggiorna un piatto **mutando `PIATTI`** |
| `eliminaPiatto(id)` | rimuove il piatto dal catalogo e da tutti i menu |
| `versione` | contatore che sale a ogni modifica del catalogo |
| `foto`, `caricaFoto(id, dato)`, `togliFoto(id)` | fotografie caricate dal browser |

**Attenzione**: `salvaPiatto` ed `eliminaPiatto` modificano l'oggetto `PIATTI`
importato da `data.js`, che non è stato React. Per questo esiste `versione`:
i componenti che leggono il catalogo devono dipendere da `st.versione` per
ricalcolare. È un compromesso deliberato del prototipo, non copiarlo altrove.

## Preferenze del commensale

| Nome | Cosa |
|---|---|
| `allergeniUtente` | array di numeri allergene (1–14) |
| `commutaAllergene(n)` | accende o spegne un allergene |
| `dietaUtente` | `""`, `"vegetariano"` o `"vegano"` |
| `setDietaUtente(v)` | imposta la preferenza |

## Committenti e unità

| Nome | Cosa |
|---|---|
| `committente` | id del committente attivo, parte da `COMMITTENTI[0].id` |
| `setCommittente(id)` | lo cambia; lo chiamano i portali al montaggio |
| `committenti` | l'elenco vero e proprio, parte da `COMMITTENTI` ma è stato React (12 settembre 2026): anagrafica, configurazione servizio e listino sono lo stesso record, non più tre dizionari separati |
| `aggiungiCommittente(dati)` | crea un committente (dal modulo "Nuovo committente" in `Modelli.jsx`), ritorna l'id; termini, metodo, regime IVA e dicitura partono dalle condizioni predefinite di `datiAziendali` |
| `aggiornaCommittente(id, patch)` | modifica un campo qualsiasi: usato da Impostazioni per committente e da "Sospendi/Riattiva" |
| `unita` | quantità dichiarate per unità, oggi solo `comunita` |
| `cambiaUnita(tipo, riga, campo, valore)` | modifica una cella, mai sotto zero |
| `aggiungiOspitePresente(ospite)` | incrementa la colonna dieta della griglia RSA |
| `presenze`, `cambiaPresenze(riga, campo, valore)` | presenze per classe, modello scuola |

`aggiungiOspitePresente` opera su `unita.rsa`, che nel perimetro attuale non è
inizializzato: la funzione esce subito. Resta per quando il modulo RSA tornerà.

## Comunità

| Nome | Cosa |
|---|---|
| `presenzeComunita` | `{ [idPaziente]: { pranzo: true \| false \| null, cena: true \| false \| null } }`, tutto a `null` all'avvio (dal 14 settembre 2026 la presenza è **per pasto**) |
| `setPresenzeComunita(v)` | aggiorna la mappa |
| `presenzeTrasmesse` | lista trasmessa a MAVI, **una riga per paziente e pasto**, ogni riga timbrata con `generatoIl` |
| `trasmettiPresenze(lista)` | timbra `generatoIl` e **aggiorna per `id` + `pasto`** (non sovrascrive): reparti e pasti trasmessi in momenti diversi si sommano, la cena non cancella il pranzo; il log riporta anche il pasto |
| `assenti`, `commutaAssente(id)` | assenze, modello a lista |
| `ospitiExtra`, `aggiungiOspite(ospite)` | ospiti aggiunti in demo, ritorna l'id |

`null` significa "non ancora segnato": tiene disattivato il bottone "Trasmetti"
**solo per il pasto corrente**, finché non sono stati segnati tutti i pazienti
che prevedono quel pasto (`pastiDi(p)` in `data.js`).

## Proforma (dal 14 settembre 2026)

| Nome | Cosa |
|---|---|
| `proforme` | elenco delle proforma emesse, seed da `PROFORME_INIZIALI` espanso con listino e condizioni del committente |
| `emettiProforma(dati)` | numera `PRO-2026/NNN` proseguendo dal seed, timbra `dataEmissione` e `scadenza` (`scadenzaPagamento`), logga e **ritorna il documento**, così il chiamante apre il PDF nello stesso gesto di click |
| `annullaProforma(id)` | `stato: "annullata"`, logga e avvisa; la riga resta in elenco |

Forma del documento:

```js
{ id, numero, committenteId, periodo, dataEmissione,      // ISO giorno
  righe: [{ descrizione, quantita, prezzo }],
  termini, metodoPagamento, regimeIva, aliquota, dicituraIva,
  note, stato: "emessa" | "pagata" | "annullata", scadenza } // ISO giorno
```

Le condizioni si copiano dentro il documento al momento dell'emissione e da lì
restano ferme: cambiare le condizioni del committente non riscrive le proforma
già emesse. I totali si calcolano sempre con `totaliProforma` di `data.js`,
unico punto usato da portale MAVI, portali cliente e PDF. I portali cliente
leggono `proforme` filtrate per il proprio committente.

## Flusso ordini fra strutture e cucina

| Nome | Cosa |
|---|---|
| `ordiniTrasmessi` | lista, precaricata con `ORDINI_IN_CODA` |
| `trasmettiOrdine(ord)` | inserisce in testa con stato `in_attesa`, ritorna l'id |
| `approvaOrdine(id)` | passa a `approvato`, registra `oraApprov` |
| `respingiOrdine(id, motivo)` | passa a `respinto` con motivo |

Stati possibili: `in_attesa`, `approvato`, `respinto`.

## Log operazioni

| Nome | Cosa |
|---|---|
| `logOperazioni` | lista, la più recente in testa |
| `logga(utente, ruolo, azione, dettaglio, tipo)` | aggiunge una riga con l'ora corrente |

`tipo` usato dal filtro nel portale MAVI: `sistema`, `ordine`, `approvazione`,
`presenze`, `generico`. Le righe iniziali con id `s1`–`s7` sono log di sistema
finti (backup, rotazione menu, cutoff, promemoria) che danno realismo alla demo.

## Documenti

| Nome | Cosa |
|---|---|
| `documenti` | lista, parte da `DOCUMENTI_INIZIALI` |
| `aggiungiDocumento(doc)` | inserisce in testa con id generato |
| `rimuoviDocumento(id)` | elimina |

## Tema

| Nome | Cosa |
|---|---|
| `tema` | `"chiaro"`, `"scuro"` o `"auto"` |
| `setTema(t)` | imposta e salva in `localStorage` alla chiave `mavi-tema` |

Un `useEffect` scrive l'attributo `data-tema` su `<html>`. In modalità `auto`
ascolta `prefers-color-scheme` e si aggiorna al volo.

## Dati aziendali, utenti, notifiche

| Nome | Cosa |
|---|---|
| `datiAziendali`, `setDatiAziendali` | ragione sociale, P.IVA, CF, indirizzo, contatti, PEC, IBAN, note proforma, più le **condizioni predefinite** per i nuovi committenti (`terminiDefault`, `metodoDefault`, `regimeIvaDefault`, `dicituraIvaDefault`). Si compilano nella Gestione portale e finiscono in testata di ogni documento stampabile, nell'intestazione Excel e nella proforma (IBAN, note) |
| `utenti`, `setUtenti` | tabella utenti con CRUD dalla Gestione portale |
| `notifiche`, `setNotifiche` | sei flag booleani |
| `profili`, `aggiornaProfilo(chiave, patch)` | override del profilo personale per username (`chiave`), letti da `Telaio`/`ModificaProfilo` in `ui.jsx`. Si sommano a `UTENTI`, non lo sostituiscono mai |

## Messaggi a schermo

| Nome | Cosa |
|---|---|
| `messaggi` | coda dei toast attivi |
| `avvisa(testo)` | mostra un toast, sparisce dopo 3,2 secondi |

Ogni portale rende `<Messaggi lista={st.messaggi} />` dentro il `Telaio`.
