# Convenzioni di codice e trappole note

## Lingua

**Tutto in italiano**: nomi di componenti, funzioni, variabili, props, chiavi di
stato, classi CSS, commenti, testi a schermo.

Esempi dal codice: `usaStato`, `avvisa`, `scegli`, `mancanti`, `coperte`,
`cambiaMenu`, `trasmettiPresenze`, `Telaio`, `Velo`, `Intestazione`,
`SchedaPiatto`, `.pannello`, `.occhiello`.

Gli unici termini inglesi accettati sono quelli di React e delle librerie
(`useState`, `onClick`, `key`).

## Abbreviazioni ricorrenti nei dati

I record di `data.js` usano chiavi molto corte per restare leggibili su una
riga. Vanno rispettate, non allungate:

| Chiave | Significato |
|---|---|
| `n` | nome |
| `col` | colore WHP |
| `ill` | id illustrazione |
| `pal` | palette dell'illustrazione |
| `ing` | ingredienti |
| `g` | valori nutrizionali, array di sei numeri |
| `mk` | marcatori |
| `a` | allergeni |
| `de` | descrizione |
| `ris` | riscaldamento |
| `con` | consiglio |
| `so` | portate sostituite dal piatto unico |
| `m` | matricola (nei dipendenti) |
| `rep` | reparto |

## Pattern React usati nel progetto

- **Solo componenti funzione e hook.** Niente classi.
- **Un Context solo**, quello di `store.jsx`. Non aggiungere altri Provider.
- Lo stato di pagina (quale giorno, quale tab, quale modale aperta) resta
  **locale** al componente. Nello store va solo ciò che serve a più portali.
- Le pagine di un portale sono funzioni nello stesso file, non file separati,
  a meno che il file non superi le dimensioni gestibili. `Fornitore.jsx` ha
  scorporato in `Modelli.jsx` per questo motivo.
- La navigazione è `pagina` + `setPagina` con render condizionale
  `{pagina === "x" && <X />}`. Non usare React Router per le pagine interne.
- Le voci di menu sono array di triple `[chiave, etichetta, ComponenteIcona]`.
- Le funzioni passate ai figli si avvolgono in `React.useCallback` quando stanno
  nello store; nei componenti di pagina non è necessario.

## Stile CSS

- Classi in italiano con trattino, nessuna utility class, nessun framework.
- **Non scrivere colori letterali** nei componenti: usare le variabili CSS,
  altrimenti si rompono tema scuro e identità per area.
- Lo stile inline è ammesso per aggiustamenti puntuali (margini, larghezze), ed
  è usato spesso nel codice esistente. Per tutto ciò che si ripete, una classe.
- Aggiungendo un componente con fondo proprio, aggiungere anche l'override
  `[data-tema="scuro"]`.

## Trappole note

### `sed` e le sostituzioni cieche

Le stringhe JSX contengono `://` (URL, orari come `14:00`). Passare `sed` o una
regex globale su questi file **rompe il codice**. È già successo. Modificare a
mano o con sostituzioni mirate.

### SVG senza dimensioni

Gli SVG delle illustrazioni vanno sempre vincolati con `width` e `height`
espliciti. Senza, si espandono a riempire il contenitore e sfondano il layout
della card piatto.

### HTML composto come stringa

I documenti stampabili (proforma, manifesto, resoconti, scheda piatto) sono
stringhe HTML scritte con `document.write` in una nuova scheda, che ha la
stessa origine del portale. Li compone `documento.js`, che ha **l'unica copia
di `testoHtml`** del progetto. I valori arrivano da dati modificabili dal
portale (anagrafica, catalogo), quindi **ogni valore passa da `testoHtml`**,
che lo inserisce come testo. Un `${valore}` aggiunto senza, in quei documenti,
diventa HTML interpretato. Le celle nella forma `{ html: "…" }` sono l'unica
via per inserire HTML già composto, riservata ai moduli documento.

Altra regola: `apriDocumento` va chiamata **dentro il gesto dell'utente**. I
moduli documento si importano in modo statico; un `await import(...)` prima
dell'apertura fa perdere il gesto e il browser blocca la scheda (vedi
`10-export-e-documenti.md`).

Per lo stesso motivo `dangerouslySetInnerHTML`, oggi usato solo in `Accesso` per
il corsivo delle frasi fisse, non riceve mai valori che vengano dallo stato.

### `PIATTI` mutato fuori da React

`salvaPiatto` ed `eliminaPiatto` scrivono direttamente sull'oggetto `PIATTI`
importato da `data.js`. Per far ridisegnare i componenti c'è il contatore
`st.versione`. Chi legge il catalogo deve dipendere da `st.versione`.

Stessa cosa in `Comunita.jsx`, dove la modifica inline e l'import scrivono su
`paziente.dieta`, e dal 12 settembre 2026 anche "Nuovo paziente" ed "Elimina"
in `Pazienti`, che scrivono direttamente sull'array `PAZIENTI_COMUNITA`
(`push`/`splice`) oltre che sullo stato locale `lista`: senza, un paziente
creato lì non comparirebbe in Presenze, Resoconti né Etichette, che leggono
`PAZIENTI_COMUNITA` a modulo, non lo stato locale della pagina Pazienti.

È un compromesso accettato nel prototipo, esteso solo dentro la stessa
famiglia di casi (mutare un elenco di `data.js` per farlo vedere da più
pagine). **Non introdurlo in aree nuove del codice**: se il progetto va in
produzione questa è la prima cosa da rifare, con uno stato vero (backend o
almeno un Context dedicato) al posto di array mutati a mano.

### Doppio montaggio in StrictMode

`main.jsx` avvolge tutto in `React.StrictMode`. In sviluppo gli effetti si
montano due volte. Se un comportamento sembra raddoppiato, è quello.

### `npm audit fix --force`

**Mai lanciarlo.** Ha già rotto il progetto una volta.

## Aggiungere una pagina a un portale

1. Scrivere la funzione componente nel file del portale.
2. Aggiungere la tripla in `VOCI` con la chiave, l'etichetta e l'icona.
3. Aggiungere la riga `{pagina === "chiave" && <Componente />}`.
4. Se serve stato condiviso, aggiungerlo allo store e documentarlo in
   `03-store.md`.
5. Aggiornare il documento del portale in `file.md/` e
   `MAVI_Stato_Progetto.md`.

## Aggiungere un piatto

1. Nuova voce in `PIATTI` con codice breve in `snake_case` (`ris_fun`).
2. Inserirlo nei menu: `FISSI` se è di tutti i giorni, `VARIABILI[giorno]` se
   ruota.
3. Se è un piatto unico, dichiarare `so` con le portate che copre.
4. Facoltativo: fotografia in `public/foto/<codice>.jpg`. Senza, resta
   l'illustrazione vettoriale scelta con `ill` e `pal`.
