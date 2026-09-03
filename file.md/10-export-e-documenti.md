# Export Excel, template diete, proforma, documenti

Tre moduli senza JSX, importati sempre in modo dinamico dove servono.

## `src/excel.js` — export xlsx

Un'unica funzione:

```js
await scaricaExcel("resoconto-agosto.xlsx", [
  { nome: "Riepilogo", dati: [{ ... }], colonne: [{ header, key, width }] },
  { nome: "Dettaglio", dati: [...],     colonne: [...] },
]);
```

`ExcelJS` e `file-saver` sono importati con `await import(...)` dentro la
funzione, così non entrano nel bundle iniziale.

Ogni foglio viene impaginato con l'identità MAVI:

1. Riga 1, titolo "MAVI Ristorazione" in terracotta 20 pt, celle unite su tutte
   le colonne.
2. Riga 2, indirizzo e P.IVA in grigio.
3. Riga 3, nome del foglio più la data di generazione in italiano.
4. Riga vuota.
5. Intestazione colonne: fondo scuro, testo bianco in grassetto.
6. Righe dati con fondo alternato bianco / avorio e bordo sottile.
7. **Riga totale**: se in una cella dell'ultima riga compare la parola `TOTALE`
   (confronto in maiuscolo), quella riga viene evidenziata in terracotta con
   testo bianco. È il modo per ottenere il totale: non serve un flag.
8. Piè di pagina con data e ora di generazione.

Imposta anche `pageSetup` in orizzontale adattato alla larghezza e un footer di
stampa con numerazione pagine.

> Il progetto è migrato da SheetJS a ExcelJS per azzerare le CVE. Non
> reintrodurre SheetJS.

## `src/diete.js` — template e import delle diete

Costanti locali: cinque giorni (lunedì–venerdì), due pasti, tre portate.

### `generaTemplateDieta(pazienti)`

Genera e scarica un xlsx con **un foglio per paziente**. Il nome del foglio è
il nome del paziente troncato a 31 caratteri, limite di Excel.

Struttura del foglio:

| Riga | Contenuto |
|---|---|
| 1 | "Dieta settimanale — Nome Paziente", terracotta 16 pt |
| 2 | stanza · tipo dieta · note |
| 3 | vuota |
| 4 | celle unite: `B4:D4` PRANZO, `E4:G4` CENA |
| 5 | Giorno, Primo, Secondo, Contorno, Primo, Secondo, Contorno |
| 6+ | una riga per giorno, da compilare |

In fondo c'è la nota su come usare il separatore ` || ` per le note di
preparazione (`Risotto agli asparagi || NO MANTECATO`).

È il file che il responsabile manda al dietista.

### `parsaDietaExcel(file)`

Legge il primo foglio del file caricato e ritorna
`{ dieta, titolo, nomeFoglio }`.

Per trovare l'inizio dei dati cerca la riga in cui la colonna A vale `giorno`,
senza distinzione di maiuscole, e parte da quella successiva. Se non la trova,
parte dalla riga 6.

Poi legge cinque righe, mappando le colonne 2–4 sul pranzo e 5–7 sulla cena.
Le celle vuote diventano `—`.

Il titolo si ricava dalla cella A1 togliendo il prefisso "Dieta settimanale —",
oppure dal nome del foglio.

Errori: se il file non contiene fogli lancia `Il file non contiene fogli`.
La scheda paziente cattura l'eccezione e mostra il messaggio in un avviso, senza
applicare nulla.

**Il risultato non viene mai applicato direttamente**: passa dal modale di
anteprima. Vedi `08-portale-comunita.md`.

## `src/proforma.js` — proforma stampabile

```js
generaProformaPDF(strutture, prezzoUnitario)
```

`strutture` è un array di `{ nome, tipo, mese, pasti }`.

Costruisce una stringa HTML completa e la apre in una nuova finestra, poi
lancia la stampa. Non è un PDF generato lato server: è HTML impaginato per la
stampa, che il browser salva in PDF.

Calcoli: imponibile = pasti totali × prezzo unitario, **IVA al 10 %**, totale.
Il numero documento è `PRO-2026/` più tre cifre casuali; la data è quella
odierna in italiano.

Il layout è ispirato a WHMCS: intestazione con logo testuale e badge PROFORMA,
info-box con numero, data, periodo e scadenza, box Da / A, tabella degli item,
riepilogo totali, note. Il CSS è inline nella stringa, con `@page { size: A4 }`.

I dati del mittente che non sono ancora stati compilati nella Gestione portale
compaiono come **placeholder in corsivo terracotta** (classe `.ph`), così in
demo si vede subito cosa manca.

In cima al documento c'è una barra con il pulsante "Stampa / Salva PDF", che
non finisce in stampa.

## Documenti del portale

L'elenco è nello store (`st.documenti`), inizializzato da `DOCUMENTI_INIZIALI`
in `store.jsx`. Ogni voce:

```js
{ id, nome, tipo, descrizione, file, peso, data, perDipendenti }
```

- `file` vuoto significa "da caricare": la voce si vede ma non è scaricabile.
- `perDipendenti: true` rende la voce pubblica.

Il componente `Documenti` di `ui.jsx` accetta due flag:

| Uso | Effetto |
|---|---|
| `<Documenti soloPubblici />` | solo le voci con `perDipendenti: true` |
| `<Documenti />` | tutte le voci, sola consultazione |
| `<Documenti gestibile />` | tutte le voci, con caricamento e rimozione |

I file veri stanno in `public/documenti/`. Al momento c'è solo
`codice-colori-whp.pdf`.
