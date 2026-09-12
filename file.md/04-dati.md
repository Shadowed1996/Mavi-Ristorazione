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

`GIORNI` è la settimana della demo, cinque voci con `n` (nome), `d` (data),
`breve` e `chiuso`. `chiuso: true` simula il cutoff già passato: la selezione
su quel giorno viene rifiutata (vedi `store.jsx`). La settimana attuale è
interamente futura rispetto a "oggi", quindi nessun giorno è `chiuso`; il
flag va rimesso a `true` sui primi giorni quando si aggiorna `GIORNI` a una
settimana già iniziata.

## Anagrafiche e committenti

| Costante | Cosa contiene |
|---|---|
| `UTENTI` | i cinque profili di accesso, con struttura e ruolo |
| `ETICHETTE_STRUTTURA`, `ETICHETTE_RUOLO` | nomi leggibili per il login |
| `trovaUtente(nome)` | risolve il nome utente, case insensitive |
| `DIPENDENTI` | otto dipendenti Rossi Manifatture con matricola, reparto, dieta, stato, pasti |
| `COMMITTENTI` | i due committenti attivi: azienda e comunità, con modello, unità, etichetta unità |
| `MODELLI` | i tre modelli di ordinazione: `individuale`, `unita`, `presenze` |
| `PAZIENTI_COMUNITA` | quattro pazienti con dieta settimanale completa |
| `OSPITI`, `OSPITI_RSA` | ospiti RSA, fuori dal flusso attivo |
| `PRESENZE_SCUOLA`, `FASCE_SCOLASTICHE` | modello scuola, fuori dal flusso attivo |

### Pazienti comunità

```js
{ id, nome, stanza, dal, note, tipo_dieta, dieta: { giorno: { pranzo: {...}, cena: {...} } } }
```

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
| `FLUSSI_ORDINE` | ordini in arrivo con stato `ricevuto`, `chiuso`, `attesa` |
| `GIRI` | due giri di consegna con furgone, autista, tappe |
| `IMPOSTAZIONI_INIZIALI` | per committente: cutoff, regola pasto, listino, frutta, monoporzione |
| `CICLICO` | le quattro settimane della rotazione menu |
| `ORDINI_UNITA` | quantità dichiarate dalle case della comunità |
| `ETICHETTE_AZIENDA_DEMO` | sette ordini confermati, per popolare le etichette |
| `RESOCONTO_MENSILE` | dati aggregati di agosto 2026 con dettaglio giornaliero |
| `FATTURE` | tre documenti, uno dei quali proforma |
| `PREZZO_PASTO` (7,50 €), `QUOTA_DIPENDENTE` (3,20 €) | listino |

`allergeniDelGiorno(menu, giorno)` ritorna l'elenco ordinato dei numeri
allergene presenti in tutte le portate di quella giornata.
