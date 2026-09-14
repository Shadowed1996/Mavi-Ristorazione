# Dati di dominio — `src/data.js`

Tutti i dati del prototipo stanno qui, in memoria. Nel prodotto reale
arriverebbero dalle API. Il file è lungo ma è piatto: costanti esportate più
qualche funzione pura di supporto.

## Piatti

`PIATTI` è un dizionario `codice → piatto`. Il codice è la chiave usata anche
per il nome del file fotografia (`ris_fun.jpg`).

```js
ris_fun: {
  col: "giallo",                      // colore WHP
  n: "Risotto ai funghi porcini",     // nome
  ill: "risotto",                     // id illustrazione in ui.jsx
  pal: ["#FAF6EC", ...],              // palette dell'illustrazione, 4 colori
  ing: "RISO CARNAROLI, funghi ...",  // ingredienti, allergeni in maiuscolo
  kcal: 430,
  g: [14.2, 6.8, 58, 2.4, 10.1, 1.2], // grassi, saturi, carbo, zuccheri, proteine, sale
  mk: ["V", "SG"],                    // marcatori
  a: [7],                             // numeri allergene
  de: "...",                          // descrizione
  ris: "...",                         // istruzioni di riscaldamento
  con: "...",                         // consiglio di servizio
  so: ["primo", "secondo"],           // solo sui piatti unici: cosa sostituisce
}
```

Il campo `so` è ciò che distingue un piatto unico: se c'è, il piatto è unico e
`so` elenca le portate che copre. `catalogoPerCategoria` usa esattamente questo
per separare i due insiemi.

`MARCATORI`: `SG` senza glutine, `V` vegetariano, `VEG` vegano, `M` contiene
maiale, `SUR` surgelato all'origine.

`ALLERGENI` è la mappa `1..14 → nome` del Regolamento UE 1169/2011.

## Codice colori WHP

`COLORI` implementa il codice colori della Regione Lombardia, allegato 1F
(promozione della salute nei luoghi di lavoro). Il colore descrive la natura
nutrizionale del piatto e **non coincide con la categoria di menu**: un
sostitutivo del primo può essere rosso.

| Colore | Significato | Hex |
|---|---|---|
| giallo | carboidrati, cereali, tuberi | `#E8B430` |
| rosso | proteine: carne, pesce, uova, latticini, legumi | `#C8443B` |
| verde | verdure | `#4E8C4A` |
| viola | frutta | `#A83E7C` |
| blu | piatto unico, carboidrati e proteine insieme | `#37629E` |

### Regola del pasto equilibrato

`equilibrio(coloriPresenti, conFrutta)` ritorna
`{ richiesti, mancanti, ok, livello, faccia, titolo, testo }`.

- Senza piatto unico servono **giallo + rosso + verde**.
- Con un piatto unico (blu) servono **blu + verde**.
- Il viola entra nel conteggio solo se `conFrutta` è vero, cioè se il capitolato
  del committente prevede la frutta.

Livelli: `vuoto`, `buono`, `migliorabile` (manca una cosa sola), `sbilanciato`.

Il portale dipendente ha una seconda funzione locale, `valutaEquilibrio` dentro
`Dipendente.jsx`, con la stessa logica ma testi diversi, tarati per il vassoio.
Se si cambia la regola vanno aggiornate entrambe.

### `ingredientiEvidenziati(testo)`

Mette in maiuscolo gli ingredienti allergenici trovati nel testo, come da prassi
del settore. L'elenco delle parole è `PAROLE_ALLERGENICHE`, interno al file.
`quinoa` è esplicitamente esclusa dalla sostituzione.

## Categorie e menu

`CATEGORIE` elenca le sei portate nell'ordine di presentazione: `primo`,
`sost_primo`, `secondo`, `sost_secondo`, `contorno`, `unico`.

Il menu è composto da due parti:

- `FISSI` — piatti presenti tutti i giorni, per categoria.
- `VARIABILI` — array di cinque giorni, ognuno con le proprie liste.

`MENU_INIZIALE` le combina e diventa lo stato `menu` nello store.

`menuDelGiorno(menu, indiceGiorno, categoria)` ritorna prima i variabili del
giorno, poi i fissi non già presenti. È la funzione da usare sempre per
ottenere l'elenco di una portata: non leggere le liste a mano.

`GIORNI` è la settimana della demo (14–18 settembre 2026), cinque voci con `n`
(nome), `d` (data leggibile), `breve`, `data` (ISO, `2026-09-15`, per i
documenti stampabili) e `chiuso`. `chiuso: true` simula il cutoff già passato:
la selezione su quel giorno viene rifiutata (vedi `store.jsx`). La settimana
attuale è interamente futura rispetto a "oggi", quindi nessun giorno è
`chiuso`; il flag va rimesso a `true` sui primi giorni quando si aggiorna
`GIORNI` a una settimana già iniziata. `etichettaGiorno(indice)` dà l'etichetta
leggibile ("Martedì 15 settembre"), la stessa ovunque: non comporla a mano.

## Anagrafiche e committenti

| Costante | Cosa contiene |
|---|---|
| `UTENTI` | seed di `st.utenti`: i cinque profili di prova con `id`, `attivo`, email, struttura e `ruolo` (id di un ruolo). Chi non ha `pazienti.tuttiReparti` usa `reparto` (es. "Spazio Giovani SGA") per vedere solo i propri pazienti, vedi `08-portale-comunita.md` |
| `PERMESSI` | 68 voci `{ k, portale, gruppo, n }`: chiave (`<pagina>.vedi` per la voce di menu, `<pagina>.<azione>` per le azioni), portale `mavi` / `azienda` / `comunita`, gruppo = pagina, nome leggibile. Le chiavi sono uniche dentro un portale, non fra portali. `permessiDelPortale(p)` filtra |
| `RUOLI_INIZIALI` | `{ id, nome, portale, vista?, bloccato?, permessi }`: `dipendente` e `referente` (portale `azienda`, `vista` sceglie il telaio), `operatore` (Educatore), `responsabile`, `fornitore` (`bloccato: true`, tutti i permessi MAVI). Riproducono il comportamento precedente alla matrice |
| `ETICHETTE_STRUTTURA`, `ETICHETTE_RUOLO`, `ETICHETTE_PORTALE` | nomi leggibili; i nomi veri dei ruoli arrivano da `st.ruoli` |

`trovaUtente` non è più qui: sta nello store, perché lavora su `st.utenti`.
| `DIPENDENTI` | otto dipendenti Rossi Manifatture con matricola, reparto, dieta, stato, pasti |
| `anagraficaAzienda(nome)` | matricola e reparto veri di chi ordina in azienda: prima `DIPENDENTI`, poi la `mansione` di `UTENTI` (Antonella Rossi è un profilo demo, non è in `DIPENDENTI`) |
| `COMMITTENTI` | i due committenti di partenza (azienda e comunità): modello, unità, etichetta unità, **più** anagrafica (indirizzo, P.IVA, `cf`, `pec`, `codiceSdi`, referente), configurazione (cutoff, regola pasto, frutta, monoporzione), listino (`prezzoUnitario`, `ivaPercentuale`, `pastiMeseDemo`) e **condizioni di fatturazione** (`termini`, `metodoPagamento`, `regimeIva`, `dicituraIva`) — un solo record. È solo il seed: lo stato vero è `st.committenti` in `store.jsx`, esteso da "Nuovo committente". Demo: Rossi a 30 gg d.f. con IVA 10 %, Il Ponte a 60 gg d.f.f.m. senza IVA con dicitura |
| `MODELLI` | i tre modelli di ordinazione: `individuale`, `unita`, `presenze` |
| `PAZIENTI_COMUNITA` | quattro pazienti con dieta settimanale completa |
| `OSPITI`, `OSPITI_RSA` | ospiti RSA, fuori dal flusso attivo |
| `PRESENZE_SCUOLA`, `FASCE_SCOLASTICHE` | modello scuola, fuori dal flusso attivo |

### Pazienti comunità

```js
{ id, nome, stanza, dal, note, tipo_dieta, pasti: ["pranzo", "cena"],
  dieta: { giorno: { pranzo: {...}, cena: {...} } } }
```

`pasti` (dal 14 settembre 2026) elenca i pasti previsti dal paziente: Beatrice
Comi e Zied Dridi fanno solo pranzo. `pastiDi(paziente)` lo legge in modo
retrocompatibile (senza il campo valgono pranzo e cena) e `portateServite(dieta)`
dà le portate diverse da `—` e non vuote: sono le funzioni da usare per contare
etichette e presenze, non un fisso `× 3`.

`stanza` fa doppio servizio: è anche il **reparto/struttura** usato per
filtrare la visibilità dell'educatore (vedi `08-portale-comunita.md`). Nei
quattro pazienti demo vale "Spazio Giovani SGA" o "CSS Sole Luna, Desio", non
un numero di stanza — riflette il dato reale, non un vincolo di nome.

I giorni sono i sette di `GIORNI_SETT`, i pasti quelli di `PASTI_TIPO`
(`pranzo`, `cena`). Ogni pasto ha `primo`, `secondo`, `contorno`; il trattino
lungo `—` significa "non previsto".

Il testo di un piatto può contenere una nota di preparazione dopo il separatore
` || `, per esempio `Risotto agli asparagi || NO MANTECATO`.
**`splitPiatto(testo)` è l'unico modo corretto di separarli**: ritorna
`{ nome, nota }`.

`INGREDIENTI_DIETE` mappa i nomi dei piatti delle diete (che sono testo libero,
non codici) a ingredienti e allergeni. Serve alle etichette della comunità.

## Diete e consistenze

`DIETE_TERAPEUTICHE` — `std`, `iposodica`, `ipoproteica`, `diabetica`,
`senza_glutine`, `vegetariana`, `no_suino`. Ogni voce ha un `tipo` (`base`,
`terapeutica`, `sanitaria`, `etica`, `religiosa`) che il CSS usa per colorare
il tag.

`CONSISTENZE` — `normale`, `tritato`, `frullato`, `addensato`.

`nomeDieta(id)` e `nomeConsistenza(id)` danno l'etichetta leggibile.

`fuoriDieta(piatto, dieta)` verifica se un piatto è incompatibile con la
preferenza `vegetariano` o `vegano` del dipendente.

Legge i marcatori da `piatto.mk`. Il difetto storico che faceva risultare
fuori dieta *ogni* piatto (leggeva `piatto.m`) è stato corretto il 3 settembre
2026.

## Operatività MAVI

| Costante | Cosa |
|---|---|
| `AGGREGATO` | base della distinta di produzione, il prototipo ci somma le scelte fatte in demo |
| `GIRI` | due giri di consegna con furgone, autista, tappe |
| `CICLICO` | le quattro settimane della rotazione menu |
| `ORDINI_UNITA` | quantità dichiarate dalle case della comunità |
| `ETICHETTE_AZIENDA_DEMO` | sette ordini nominativi demo di mercoledì (`indiceGiorno: 2`), con matricola e reparto ricavati da `anagraficaAzienda`, `committente: "azienda"`, `committenteNome` e `unico`. Seed di `st.nominativiAzienda` |
| `RESOCONTO_MENSILE` | dati aggregati di agosto 2026 con dettaglio giornaliero |
| `PROFORME_INIZIALI` | quattro proforma seed, due per committente (`numero, committenteId, periodo, dataEmissione, pasti, stato`); lo store le espande con listino e condizioni del committente. Ha sostituito `FATTURE`: nessun portale legge più un elenco condiviso |
| `PREZZO_PASTO` (7,50 €), `QUOTA_DIPENDENTE` (3,20 €) | listino |

## Condizioni di fatturazione (dal 14 settembre 2026)

| Costante / funzione | Cosa |
|---|---|
| `TERMINI_PAGAMENTO` | `{ id, nome, giorni, fineMese }`: anticipato, vista fattura, 30 gg d.f., 30 gg d.f.f.m., 60 gg d.f., 60 gg d.f.f.m., 90 gg d.f.f.m. |
| `METODI_PAGAMENTO` | bonifico (`conIban`), RiBa, SDD |
| `REGIMI_IVA` | `ordinaria` con aliquota, `senza_iva` con dicitura di esenzione precompilata |
| `terminiPagamento(id)`, `metodoPagamento(id)`, `regimeIva(id)` | lookup con ripiego |
| `scadenzaPagamento(dataEmissione, terminiId)` | `Date` di scadenza: i giorni si contano dalla data di emissione; con `fineMese` dall'**ultimo giorno reale del mese di emissione** (14/09 a 60 gg d.f.f.m. → 30/09 + 60 → 29/11/2026); anticipato e vista scadono lo stesso giorno |
| `totaliProforma(p)` | `{ quantita, imponibile, iva, totale }` dalle righe libere e dal regime, unico punto di calcolo |
| `testoCondizioni(x)`, `ordinaProforme(lista)` | etichetta leggibile delle condizioni; ordinamento per data e numero |

`allergeniDelGiorno(menu, giorno)` ritorna l'elenco ordinato dei numeri
allergene presenti in tutte le portate di quella giornata.
