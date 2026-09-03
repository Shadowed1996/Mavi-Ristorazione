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
| `conferma(giorno)` | conferma la prenotazione del giorno, logga |
| `disdici(giorno)` | annulla la conferma |
| `coperte(giorno)` | portate già coperte dal piatto unico scelto |
| `mancanti(giorno)` | array leggibile delle portate mancanti |

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
| `unita` | quantità dichiarate per unità, oggi solo `comunita` |
| `cambiaUnita(tipo, riga, campo, valore)` | modifica una cella, mai sotto zero |
| `aggiungiOspitePresente(ospite)` | incrementa la colonna dieta della griglia RSA |
| `presenze`, `cambiaPresenze(riga, campo, valore)` | presenze per classe, modello scuola |

`aggiungiOspitePresente` opera su `unita.rsa`, che nel perimetro attuale non è
inizializzato: la funzione esce subito. Resta per quando il modulo RSA tornerà.

## Comunità

| Nome | Cosa |
|---|---|
| `presenzeComunita` | `{ [idPaziente]: true | false | null }`, tutti a `null` all'avvio |
| `setPresenzeComunita(v)` | aggiorna la mappa |
| `presenzeTrasmesse` | lista trasmessa a MAVI |
| `trasmettiPresenze(lista)` | la trasmette e scrive nel log |
| `assenti`, `commutaAssente(id)` | assenze, modello a lista |
| `ospitiExtra`, `aggiungiOspite(ospite)` | ospiti aggiunti in demo, ritorna l'id |

`null` significa "non ancora segnato": è quello che tiene disattivato il bottone
"Trasmetti a MAVI" finché non sono stati segnati tutti.

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
| `datiAziendali`, `setDatiAziendali` | ragione sociale, P.IVA, CF, indirizzo, contatti, IBAN, condizioni di pagamento, note proforma. Tutti vuoti all'avvio, si compilano nella Gestione portale e finiscono nella proforma |
| `utenti`, `setUtenti` | tabella utenti con CRUD dalla Gestione portale |
| `notifiche`, `setNotifiche` | sei flag booleani |

## Messaggi a schermo

| Nome | Cosa |
|---|---|
| `messaggi` | coda dei toast attivi |
| `avvisa(testo)` | mostra un toast, sparisce dopo 3,2 secondi |

Ogni portale rende `<Messaggi lista={st.messaggi} />` dentro il `Telaio`.
