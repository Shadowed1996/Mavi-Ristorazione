# Export Excel, documenti stampabili, template diete

Sei moduli senza JSX. `excel.js` e `diete.js` si importano con `await import(...)`
perché portano ExcelJS; `documento.js`, `proforma.js`, `manifesto.js` e
`resoconto.js` si importano **staticamente**, perché la scheda del documento va
aperta dentro il gesto di click (vedi sotto).

## `src/documento.js` — impaginazione condivisa (dal 14 settembre 2026)

Un solo CSS A4 per tutti i documenti stampabili: palette terracotta / scuro /
avorio (la stessa di `excel.js`), font Segoe UI / Calibri, `@page A4 14mm`,
`thead` ripetuto su ogni pagina, righe che non si spezzano, numero di pagina
nei browser che supportano le margin box di `@page`, barra "Stampa / Salva PDF"
esclusa dalla stampa. La riga di totale (`tbody tr.doc-totale td`) ha la stessa
specificità della riga pari e viene dopo: resta terracotta con testo bianco
anche quando cade in posizione pari (prima diventava bianco su avorio). Testata con marchio MAVI, mittente (`intestazioneMavi`) e
badge.

| Funzione | Cosa |
|---|---|
| `testoHtml(v)` | escape HTML, **unica copia** nel progetto |
| `dataIt(d)` | `15/09/2026`; accetta `Date` o ISO `2026-09-15` |
| `giornoDataIt(d)` | `MARTEDÌ - 15/09/2026` |
| `eur(n)` | `1.234,56`, senza simbolo |
| `campo(valore, segnaposto)` | valore escapato, oppure `<span class="ph">[segnaposto]</span>` |
| `intestazioneMavi(datiAziendali)` | blocco mittente, già nella testata di `paginaDocumento` |
| `paginaDocumento({ titolo, badge, sottotitolo, meta, blocchi, note, piede, datiAziendali })` | HTML completo; `meta` è `[{ etichetta, valore }]`, `blocchi` HTML già pronto |
| `tabellaHtml({ colonne, righe, totale, vuota })` | `colonne: [{ titolo, allinea: "sx"\|"centro"\|"dx" }]`, `righe: [[cella, …]]`, `totale` ultima riga evidenziata |
| `cellaConNota(principale, nota)` | cella su due righe, nota in grigio |
| `riepilogoTotali([{ etichetta, valore, forte }])` | riquadro totali a destra |
| `blocco(titolo, html)`, `paragrafo(testo, { piccolo })`, `elenco(righe)`, `etichette(lista)` | sezioni di testo |
| `generaElencoNominativo({ titolo, badge, sottotitolo, meta, colonne, righe, totale, vuota, blocchiPrima, blocchiDopo, note, piede, nomeFile, datiAziendali, avvisa })` | pagina + tabella + apertura, usata dal manifesto |
| `elencoOrdini([{ nome, nota, pasto }])` | nome (con nota accanto) e sotto il pasto, su due colonne: il riepilogo ordini del referente |
| `apriDocumento(html, { nomeFile, avvisa })` | apre la scheda; ritorna `true` se aperta |

Una **cella** è un valore qualsiasi, che passa da `testoHtml`, oppure
`{ html: "…" }` già composto. La forma `{ html }` è riservata ai moduli
documento: è l'unico modo per mettere un segnaposto `.ph` o una nota dentro
una cella.

Due regole:

1. **Ogni valore passa da `testoHtml`**: i dati arrivano da anagrafiche e
   catalogo modificabili dal portale. Fanno eccezione solo `blocchi` e le
   celle `{ html }`.
2. **`apriDocumento` si chiama dentro il gestore di click**, senza `await`
   prima: un `await import(...)` fa perdere il gesto e il browser blocca la
   scheda. Se la scheda è bloccata comunque, chiama
   `avvisa("Il browser ha bloccato la finestra: consenti i popup per stampare")`
   e scarica il file `.html`. Nessun `alert()`.

Per questo i chiamanti passano sempre `st.datiAziendali` (mittente) e
`st.avvisa`.

## `src/proforma.js` — proforma stampabile

```js
generaProformaPDF(proforma, { datiAziendali, committente, avvisa })
```

`proforma` è un documento di `st.proforme` (vedi `03-store.md`): righe e
condizioni sono già congelate al momento dell'emissione. Il documento mostra
mittente (testata), destinatario dall'anagrafica del committente (nome,
indirizzo, P.IVA/CF, PEC, codice SDI, referente), periodo, righe con quantità e
prezzo, totali (`totaliProforma` di `data.js`), scadenza calcolata
(`scadenzaPagamento`), termini e metodo di pagamento, IBAN solo se il metodo lo
prevede, note del documento e `noteProforma` dei dati aziendali. Se il regime è
`senza_iva` compare la riga `IVA € 0,00` con la dicitura di esenzione.

**Lo stato è stampato sul documento** (15 settembre 2026): un timbro inclinato
accanto al titolo (`timbro` di `paginaDocumento`, classi `.doc-timbro-*`) con
**NON PAGATA** e la scadenza, **PAGATA**, **ANNULLATA** o **STORNATA** con la
data (`pagataIl`, `annullataIl`, `stornataIl`), un riquadro "Stato" fra i dati
del documento e una nota (pagamento registrato, annullato agli atti, stornato
con nota di credito). Colori: verde pagata, terracotta non pagata, grigio
annullata, rosso scuro stornata.

La chiamano Fatturazione (portale MAVI, "Emetti e apri PDF" e "PDF" in elenco),
`Fatture` in `Cliente.jsx` e `FattureStruttura` in `Struttura.jsx`. Non esiste
più la "proforma unica" con tutte le strutture insieme.

## `src/manifesto.js` — manifesto di consegna nominativo

```js
generaManifestoConsegna({ struttura, indiceGiorno, pasto, righe, datiAziendali, avvisa })
```

`righe` è `st.nominativiAzienda` completo, arricchito da `FlussiOrdine` con
`dieta` (`dietaDipendente` o dieta impostata nel portale) e `allergeni`
dichiarati: la funzione **filtra per `indiceGiorno`** e intesta con
`giornoDataIt(GIORNI[i].data)`. Le etichette pasto dell'azienda sono anonime;
questo è l'unico documento nominativo, marcato "Riservato al fornitore — non
esporre al cliente", raggiungibile solo dal drill-down azienda di "Ordini in
arrivo" nel portale MAVI, dopo aver scelto la giornata.

È il **resoconto dettagliato della cucina** (Filippo, 15 settembre 2026):
riquadri pasti, porzioni e "con dieta o allergie"; **Totale per piatto**
(portata, piatto, allergeni dal catalogo, porzioni; un nome fuori catalogo è
segnalato "allergeni da verificare"); poi il dettaglio per dipendente ordinato
per reparto: matricola, nome con reparto, primo (o piatto unico), secondo,
contorno, **dieta e allergie** (una prescrizione medica resta "Riservata").

## `src/resoconto.js` — resoconti e riepiloghi

Ogni funzione compone `paginaDocumento` e chiude con `apriDocumento`.

| Funzione | Chi la usa |
|---|---|
| `generaResocontoPDF({ committente, periodo, riepilogo, dettaglio, datiAziendali, avvisa })` | Referente › Resoconti › PDF. `riepilogo` è **lo stesso array** passato a `scaricaExcel`, riga `TOTALE` inclusa (`calcolaResoconto` in `Cliente.jsx`): Excel e PDF non possono divergere |
| `generaResocontoComunitaPDF({ struttura, reparto, giorno, pasti, datiAziendali, avvisa })` | Comunità › Resoconti › PDF; `pasti` è `[{ pasto, righe }]`, ogni portata `{ nome, nota }` da `splitPiatto` |
| `generaResocontoUnitaPDF({ struttura, modello, periodo, etichettaUnita, etichettaDiete, numeri, righe, nota, datiAziendali, avvisa })` | "Resoconto mensile" del cruscotto struttura: riporta la situazione corrente del cruscotto, lo dichiara in nota |
| `generaDistintaPDF({ giorno, perimetro, strutture, sezioni, totali, pastiPerCentro, destinazioni, variazioni, diete, datiAziendali, avvisa })` | Produzione, vista Giorno: `sezioni: [{ categoria, righe: [{ piatto, colore, nota?, perStruttura, totale }] }]` (la `nota` segnala i nomi quasi omonimi); poi "Pasti per committente e centro" (`pastiPerCentro: { colonnePasto, righe, totale }`), "Variazioni dai centri", diete (`{ nome, committenteNome, reparto, pastiTesto, tipoDieta, note }`), firma; infine **una scheda di consegna per destinazione, ognuna su pagina nuova** (`schedaDestinazione`: periodo, referente, pasti, stato, piatti con pranzo/cena, diete e variazioni del centro) |
| `generaDistintaSettimanaPDF({ periodo, perimetro, giorni, sezioni, totali, pastiPerCentro, destinazioni, variazioni, diete, datiAziendali, avvisa })` | Produzione, vista Settimana: `giorni` sono le colonne lun–dom ("Lunedì 14 set"), righe con `perGiorno`; stesse sezioni sommate sulla settimana, variazioni con la colonna Giorno |
| `generaRiepilogoPrenotazioniPDF({ dipendente, committente, righe, datiAziendali, avvisa })` | Dipendente › Le mie prenotazioni › "Scarica riepilogo": solo l'ordine, titolo il nome e un blocco per giorno aperto con le portate in elenco (`righe: [{ giorno, portate, confermato }]`) |

Il riepilogo ordini del referente (`Cliente.jsx`, Cruscotto) compone
`paginaDocumento` con `elencoOrdini([{ nome, nota, pasto }])` di
`documento.js`: ogni dipendente con il reparto e, sotto, il pasto su una riga,
su due colonne (`.doc-ordini`), poi `riepilogoTotali` con i pasti ordinati e
"Non hanno ordinato". Nessuna dieta sanitaria nel documento.

Ogni bottone PDF del progetto ha `try/catch` con avviso: nessun export mostra
più un messaggio di successo senza produrre un documento. Anche il "Log
operazioni" del portale MAVI esporta un Excel vero, con il filtro attivo.

## `src/excel.js` — export xlsx

```js
await scaricaExcel("resoconto-agosto.xlsx", [
  { nome: "Riepilogo", dati: [{ ... }], colonne: [{ header, key, width }] },
], { datiAziendali: st.datiAziendali });
```

`ExcelJS` e `file-saver` sono importati con `await import(...)` dentro la
funzione. Ogni foglio è impaginato con l'identità MAVI:

1. Riga 1, ragione sociale da `datiAziendali` (o "MAVI Ristorazione") in
   terracotta 20 pt, celle unite.
2. Riga 2, indirizzo e P.IVA da `datiAziendali`; se vuoti, i testi fissi di
   esempio.
3. Riga 3, nome del foglio, `titolo` facoltativo del foglio (la distinta ci
   mette giornata e perimetro) e data di generazione.
4. Intestazione colonne su fondo scuro, righe alternate bianco / avorio.
5. **Riga totale**: se in una cella dell'ultima riga compare `TOTALE`, la riga
   è evidenziata in terracotta. Non serve un flag.
6. Piè di pagina con data e ora; `pageSetup` orizzontale e footer di stampa.

> Il progetto è migrato da SheetJS a ExcelJS per azzerare le CVE. Non
> reintrodurre SheetJS.

## `src/diete.js` — template e import delle diete

Costanti locali: **sette giorni, da lunedì a domenica** (dal 15 settembre
2026: le comunità mangiano tutta la settimana), due pasti, tre portate.
L'import non tocca il campo `pasti` del paziente.

### `generaTemplateDieta(pazienti)`

Xlsx con **un foglio per paziente** (nome troncato a 31 caratteri). Riga 1
titolo "Dieta settimanale — Nome", riga 2 stanza · tipo dieta · note, riga 4
celle unite PRANZO / CENA, riga 5 intestazioni, dalla 6 alla 12 un giorno per
riga. Dopo una riga vuota la nota sul separatore ` || ` per le note di
preparazione.

### `parsaDietaExcel(file)`

Legge il primo foglio e ritorna `{ dieta, titolo, nomeFoglio }`. Cerca la riga
con `giorno` in colonna A (altrimenti parte dalla 6), legge sette righe,
colonne 2–4 pranzo e 5–7 cena, celle vuote → `—`. Una riga si legge solo se in
colonna A c'è proprio quel giorno: un template vecchio, fermo a venerdì, lascia
com'erano sabato e domenica. Errore `Il file non contiene
fogli` se vuoto. **Il risultato passa sempre dal modale di anteprima**, mai
applicato direttamente (`08-portale-comunita.md`).

## Documenti del portale

L'elenco è nello store (`st.documenti`, seed `DOCUMENTI_INIZIALI`). Ogni voce:
`{ id, nome, tipo, descrizione, file, peso, data, perDipendenti }`. `file`
vuoto significa "da caricare"; `perDipendenti: true` rende la voce pubblica.

| Uso di `Documenti` (`ui.jsx`) | Effetto |
|---|---|
| `<Documenti soloPubblici />` | solo le voci pubbliche |
| `<Documenti />` | tutte le voci, sola consultazione |
| `<Documenti gestibile />` | tutte le voci, con caricamento e rimozione |

I file veri stanno in `public/documenti/`; oggi solo `codice-colori-whp.pdf`.
