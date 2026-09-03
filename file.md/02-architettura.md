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
         ├─ sessione === null      →  AccessoUnico
         ├─ struttura === "mavi"   →  Fornitore
         ├─ struttura === "azienda"→  Azienda
         └─ altrimenti             →  PortaleStruttura (tipo = struttura)
```

`Instradamento` tiene un solo pezzo di stato, `sessione`, che è l'oggetto
utente restituito dal login. Quando si entra, se la struttura non è `mavi`
viene anche impostato il committente attivo nello store con
`st.setCommittente(utente.struttura)`. `esci` riporta `sessione` a `null` e
si torna alla schermata di accesso.

## Accesso

`src/Accesso.jsx` esporta `AccessoUnico`. Un solo modulo di login per tutti:
non si sceglie il portale, lo decide il profilo.

- Il nome utente viene risolto con `trovaUtente()` di `data.js`, che confronta
  in minuscolo e senza spazi contro l'array `UTENTI`.
- **La password non viene verificata.** Il campo è precompilato con
  `dimostrazione` per comodità di demo.
- Il pulsante "Mostra i profili di prova" espande l'elenco completo di `UTENTI`:
  un clic su una riga fa il login diretto. È il modo più rapido in riunione.
- Il pannello di sinistra ha un'illustrazione SVG del piatto con posate,
  disegnata inline nel file.

L'oggetto utente ha questa forma:

```js
{ u, nome, iniziali, struttura, ruolo, committente, mansione }
```

`struttura` vale `azienda`, `comunita` o `mavi`. `ruolo` vale `dipendente`,
`referente`, `operatore`, `responsabile` o `fornitore`.

## I portali

### Azienda — `aree/Azienda.jsx`

Non è un portale vero, è uno smistatore. Contiene la configurazione `CFG` con
i due ruoli e, se `ruoloIniziale` non è passato, mostra `SceltaRuolo`. Poi
delega:

- ruolo `dipendente` → `aree/Dipendente.jsx`
- ruolo `referente` → `aree/Cliente.jsx`

All'ingresso forza `st.setCommittente("azienda")`.

### Struttura — `aree/Struttura.jsx`

Telaio generico per i committenti non aziendali. Esporta la costante
`STRUTTURE`, un dizionario con la configurazione di `rsa`, `comunita` e
`scuola`: nome, titolo, claim, punti dell'accesso, e l'elenco dei ruoli con
nome utente, icona e pagina di partenza (`home`).

**Solo `comunita` è nel flusso attivo.** Le configurazioni di `rsa` e `scuola`
restano nel file ma non sono raggiungibili dal login, perché nessun utente in
`UTENTI` ha quelle strutture. Vedi `12-stato-e-todo.md`.

Il componente `PortaleStruttura` costruisce l'elenco voci in base a `tipo` e
al fatto che il ruolo sia `operatore` o no, poi rende `Telaio` e sceglie la
pagina. Per `comunita` delega tutto a `aree/Comunita.jsx`.

Esporta anche `SceltaRuolo`, riusato da `Azienda.jsx`.

### Fornitore — `aree/Fornitore.jsx`

Portale MAVI. Con la prop `diretto` salta la schermata di accesso interna,
ed è così che lo usa `App.jsx`. Ha dodici voci di menu, l'elenco più lungo
del prototipo. Alcune pagine sono definite nello stesso file, altre importate
da `Modelli.jsx` ed `Extra.jsx`.

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
| Chi può entrare e con che ruolo | `data.js` → `UTENTI` |
| Cosa si vede dopo il login | `App.jsx` → `Instradamento` |
| Voci di menu di un portale | il file del portale, costante `VOCI` |
| Stato condiviso fra portali | `store.jsx` |
| Aspetto della barra laterale | `ui.jsx` → `Telaio`, `styles.css` → `.telaio` |
