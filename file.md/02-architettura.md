# Architettura

## Bootstrap

`index.html` monta `#root`, `src/main.jsx` fa il resto.

`main.jsx` definisce il componente `Avvio`, che rende `<App />` e, sopra di
esso, `<Preloader />` finché l'animazione non è finita. Il flag sta in
`sessionStorage` alla chiave `mavi-avviato`: una volta finito il preloader non
si ripete più per tutta la sessione del browser.

Tutto è avvolto in `React.StrictMode`. In sviluppo questo comporta il doppio
montaggio degli effetti: se un `useEffect` dovesse dare comportamenti raddoppiati
è quella la causa, non un bug dello store.

## Instradamento

Non si usa React Router per la navigazione principale, nonostante la dipendenza
sia presente. L'instradamento è a stato, dentro `src/App.jsx`:

```
App
 └─ Provider (store.jsx)
     └─ Instradamento
         ├─ sessione === null (o ruolo non valido) →  AccessoUnico
         ├─ ruoloSessione.portale === "mavi"       →  Fornitore
         ├─ ruoloSessione.portale === "azienda"    →  Azienda
         └─ altrimenti                              →  PortaleStruttura
```

Dal 14 settembre 2026 la sessione **vive nello store** (`st.sessione`,
`st.ruoloSessione`, `st.entra`, `st.esci`, vedi `03-store.md`), non più in
`App.jsx`. `Instradamento` sceglie il portale dal campo `portale` del ruolo
dell'utente, letto da `st.ruoli`, non da `utente.struttura`. Se il ruolo di un
utente collegato viene eliminato, si torna al login con un avviso. Un utente di
un committente creato in demo, senza configurazione in `STRUTTURE`, entra nel
telaio comunità, che è il portale base del tipo. Quando si entra, se la
struttura non è `mavi` viene anche impostato il committente attivo con
`st.setCommittente`.

## Accesso

`src/Accesso.jsx` esporta `AccessoUnico`. Un solo modulo di login per tutti:
non si sceglie il portale, lo decide il profilo.

- Il nome utente viene risolto con `st.trovaUtente()` dello store, che
  confronta in minuscolo e senza spazi contro `st.utenti` e **scarta gli
  utenti disattivati** ("Utenza disattivata" invece di "non riconosciuto").
- **La password non viene verificata.** Il campo è precompilato con
  `dimostrazione` per comodità di demo.
- Il pulsante "Mostra i profili di prova" espande l'elenco degli utenti
  attivi di `st.utenti`, quindi anche quelli creati in Gestione portale: un
  clic su una riga fa il login diretto. È il modo più rapido in riunione.
- Il pannello di sinistra ha un'illustrazione SVG del piatto con posate,
  disegnata inline nel file.

L'oggetto utente ha questa forma (seed `UTENTI` in `data.js`, stato
`st.utenti`):

```js
{ id, u, nome, iniziali, struttura, ruolo, committente, mansione, reparto, email, telefono, attivo }
```

`struttura` vale `azienda`, `comunita` o `mavi`. `ruolo` è l'id di un ruolo
di `st.ruoli` (`dipendente`, `referente`, `operatore`, `responsabile`,
`fornitore` all'avvio, più quelli creati da interfaccia). `reparto` conta per
chi non ha il permesso `pazienti.tuttiReparti`: decide quali pazienti vede,
vedi `08-portale-comunita.md`.

## I portali

### Azienda — `aree/Azienda.jsx`

Non è un portale vero, è uno smistatore. Il portale `azienda` ha due telai
ma un solo portale, quindi il ruolo dichiara quale usare con il campo
`vista`:

- `vista: "dipendente"` → `aree/Dipendente.jsx`
- `vista: "referente"` → `aree/Cliente.jsx`

Se il telaio dichiarato non ha nessuna pagina permessa e l'altro sì, usa
l'altro. `SceltaRuolo` non è più nel flusso. All'ingresso forza
`st.setCommittente("azienda")`.

### Struttura — `aree/Struttura.jsx`

Telaio generico per i committenti non aziendali. Esporta la costante
`STRUTTURE`, un dizionario con la configurazione di `rsa`, `comunita` e
`scuola`: nome, titolo, claim, punti dell'accesso, e l'elenco dei ruoli con
nome utente, icona e pagina di partenza (`home`).

**Solo `comunita` è nel flusso attivo.** Le configurazioni di `rsa` e `scuola`
restano nel file ma non sono raggiungibili dal login, perché nessun utente in
`UTENTI` ha quelle strutture. Vedi `12-stato-e-todo.md`.

Il componente `PortaleStruttura` costruisce l'elenco voci con
`usaVociPermesse(voci, permessoDi, iniziale)` (`ui.jsx`), che filtra sulla
mappa `PERMESSO_PAGINA` con `st.puo`; la pagina iniziale è `iniziale` se
permessa (il campo `home` del ruolo in `STRUTTURE`: Pazienti per il referente
del centro, Fatture per il responsabile amministrativo), altrimenti la prima
voce permessa. Per `comunita` delega le pagine a `aree/Comunita.jsx`
(Pazienti, Presenze del giorno, Variazioni, Resoconti), passando `reparto`, cioè
il centro (`null` per chi ha `pazienti.tuttiReparti`, altrimenti
`utente.reparto`, o stringa vuota se manca: nessun paziente, con banner) e i
flag derivati da `pazienti.anagrafica` e `pazienti.dieta`. `Telaio` riceve il
nome e le iniziali reali di chi ha fatto login.

Esporta ancora `SceltaRuolo`, non più usata nel flusso attivo, come
`Landing.jsx`.

### Fornitore — `aree/Fornitore.jsx`

Portale MAVI. Con la prop `diretto` salta la schermata di accesso interna,
ed è così che lo usa `App.jsx`. Ha dodici voci di menu, l'elenco più lungo
del prototipo. Alcune pagine sono definite nello stesso file, altre importate
da `Modelli.jsx`.

## Doppio accesso: una stranezza da conoscere

Ogni portale (`Dipendente`, `Cliente`, `Fornitore`, `PortaleStruttura`) contiene
ancora la propria schermata `Accesso` interna, retaggio della versione in cui si
sceglieva il portale dalla landing. Nel flusso attuale non si vede mai, perché
`App.jsx` passa sempre `utente` o `diretto`, che mettono `dentro` a `true`.

`src/Landing.jsx` è la vecchia pagina di scelta portale. Non è più raggiungibile
ma è rimasta nel repository.

Non rimuovere queste parti senza motivo: costano poco e riportarle in vita è
utile se il cliente chiede di rivedere il flusso a più portali.

## Albero dei componenti, vista completa

```
main.jsx  Avvio
  App
    Provider .......................... store condiviso
      Instradamento
        AccessoUnico
        Fornitore ..................... portale MAVI
          Telaio + 12 pagine
        Azienda
          SceltaRuolo
          Dipendente .................. Telaio + 5 pagine
          Cliente ..................... Telaio + 5 pagine
        PortaleStruttura
          SceltaRuolo
          Telaio + pagine da Comunita.jsx / Modelli.jsx
  Preloader ........................... solo al primo avvio
```

## Dove sta cosa

| Serve toccare | File |
|---|---|
| Chi può entrare e con che ruolo | `st.utenti` e `st.ruoli` (seed `UTENTI`, `RUOLI_INIZIALI` in `data.js`), modificabili da Gestione portale |
| Cosa può fare ogni ruolo | `data.js` → `PERMESSI`, matrice "Ruoli e permessi" in Gestione portale |
| Cosa si vede dopo il login | `App.jsx` → `Instradamento`, `ruoloSessione.portale` |
| Voci di menu di un portale | il file del portale, costanti `VOCI` e `PERMESSO_PAGINA` |
| Stato condiviso fra portali | `store.jsx` |
| Aspetto della barra laterale | `ui.jsx` → `Telaio`, `styles.css` → `.telaio` |
