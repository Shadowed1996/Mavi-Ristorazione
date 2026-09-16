# UI condivisa e sistema visivo

## `src/ui.jsx`

Contiene tutto ciò che è condiviso fra i portali: icone, illustrazioni, telaio,
componenti riusati. Prima di scrivere un componente nuovo controllare qui.

### Icone

`Icone` è un dizionario di componenti SVG, tutti a 24×24 con
`stroke="currentColor"`. Prendono una prop `size` (default 18).

Chiavi disponibili: `piatto`, `lista`, `foglia`, `grafico`, `gente`, `fattura`,
`cuoco`, `calendario`, `sacco`, `ok`, `piu`, `x`, `sx`, `dx`, `lucchetto`,
`scarica`, `stampa`, `edificio`, `attenzione`, `utente`, `matita` e altre.

Uso: `<Icone.piatto size={18} />`. Nelle liste `VOCI` si passa il componente,
non l'elemento: `["menu", "Menu del giorno", Icone.piatto]`.

### `Telaio`

Il guscio di ogni portale. Props:

```jsx
<Telaio
  area="dipendente"          // scrive data-area, decide l'accento
  marchio="Portale dipendente"
  ruolo="Dipendente"
  utente={{ iniziali, nome, sotto }}
  chiaveUtente={utente?.u}   // chiave per il profilo personale, vedi sotto
  voci={VOCI}                // [[chiave, etichetta, ComponenteIcona], ...]
  pagina={pagina}
  setPagina={setPagina}
  onEsci={...}
>
  {contenuto della pagina}
</Telaio>
```

Rende: barra laterale alta quanto la finestra (`100dvh`, niente più nastro
"Prototipo dimostrativo" dal 16 settembre 2026) con marchio, tag ruolo, menu,
**orologio**, toggle tema e blocco utente con uscita; il contenuto in
`<main className="principale">`; sotto, la barra di navigazione mobile.

**`Orologio`** (16 settembre 2026): ora reale `HH:MM:SS` in Fraunces a cifre
tabellari, due punti che pulsano, secondi in accento, data sotto. In fondo alla
barra laterale (sotto i 1040px non si vede). Si riallinea al secondo pieno e
ridisegna solo sé stesso. È l'ora vera, non `ADESSO_DEMO`.

### Modifica profilo — aggiunta 12 settembre 2026

Il blocco utente in fondo alla barra laterale è cliccabile (icona matita) e
apre `ModificaProfilo`, un modale interno a `Telaio` uguale in tutti i
portali: nome, email, telefono, nuova password (dimostrativa, non applicata al
login), foto profilo caricata come file e mostrata come immagine circolare al
posto delle iniziali.

I dati modificati vivono in `st.profili`, un dizionario per `chiaveUtente`
(username reale, o `"cucina.mavi"` per il portale MAVI che non ha una sessione
utente propria) con override che si sommano — mai sostituiscono — l'anagrafica
di login (`UTENTI` in `data.js`): cambiare il proprio profilo non tocca mai
`UTENTI`. `Telaio` unisce automaticamente `utente` e l'override per mostrare
nome/iniziali/foto aggiornati.

### `Intestazione`

Testata di pagina: `occhiello`, `titolo`, `sotto`, `azioni` (nodo a destra),
`extra` (nodo sotto il sottotitolo). Va messa in cima a ogni pagina.

### `Velo`

Modale generica. `<Velo onChiudi={...} largo>{contenuto}</Velo>`. La prop
`largo` allarga il pannello, usata per la scheda paziente e per il modale
"prenota per lui".

### `SchedaPiatto`

La scheda completa di un piatto: descrizione, ingredienti con allergeni in
evidenza, tabella nutrizionale, marcatori, colore WHP, riscaldamento, consiglio.
Props: `id`, `scelto`, `soloLettura`, `allergeniUtente`, `onChiudi`, `onScegli`.

Se `allergeniUtente` contiene un allergene del piatto, la scheda mostra un
avviso di conflitto.

`schedaPdf(id, { datiAziendali, avvisa })` apre la scheda prodotto in una
nuova scheda del browser con l'impaginazione condivisa di `documento.js`
(badge "Scheda prodotto", sezioni ingredienti, allergeni, valori nutrizionali,
riscaldamento, consiglio); si stampa dalla barra in cima, non parte più un
`print()` automatico e non c'è più `alert()` se i popup sono bloccati: arriva
l'avviso del portale e il file scaricato. Ogni campo del piatto passa da
`testoHtml`, perché il catalogo si modifica dal portale (vedi «HTML composto
come stringa» in `11-convenzioni.md`).

### `Illustrazione`

Immagine di un piatto, con tre livelli di ripiego nell'ordine:

1. fotografia caricata dal portale MAVI (`st.foto[id]`), vive per la sessione;
2. file in `public/foto/<id>.<ext>`, provando jpg, jpeg, png, webp in sequenza
   tramite `onError`;
3. illustrazione vettoriale disegnata nel codice, dal dizionario `DISEGNI`
   usando la palette `p.pal`.

Il terzo livello è sempre disponibile, quindi il prototipo funziona anche senza
rete e a cartelle vuote.

### Altri componenti

| Componente | Cosa |
|---|---|
| `Marchio({ sotto, chiaro })` | logo da `public/marchio/logo.png`, ripiego sulla scritta MAVI |
| `DiscoColore({ colore, size })` | pallino del colore WHP con tooltip |
| `Ingredienti({ testo })` | ingredienti con gli allergeni in grassetto maiuscolo |
| `Faccia({ tipo, size })` | faccina piccola, tipi `sorriso`, `quasi`, `neutra`, `triste`, `neutro` |
| `Faccina({ livello, size })` | faccina grande del vassoio, livelli `ok`, `medio`, altro |
| `Messaggi({ lista })` | coda dei toast, va sempre dentro il `Telaio` |
| `Documenti({ soloPubblici, gestibile })` | pagina documenti, riusata da tutti i portali |
| `Accesso({...})` | schermata di login per portale, oggi non più nel flusso |

`Documenti` con `soloPubblici` mostra solo le voci con `perDipendenti: true`;
con `gestibile` abilita caricamento e rimozione.

## `src/styles.css`

Un solo foglio, circa 130 KB, organizzato per sezioni con commenti a barre:

```
/* ============================ telaio ============================ */
```

Le sezioni principali, nell'ordine: variabili, tema scuro, tipografia,
pagina iniziale, accesso, telaio, bottoni, giorni, avvisi, barra vassoio,
modale, pannelli e tabelle, mobile, pannello scelta piatti, griglia settimanale,
griglia quantità, modelli, etichette, presenze, menu ciclico, proforma, card
giornaliere, gestione portale.

### Variabili

Definite su `:root`. Le principali:

| Variabile | Uso |
|---|---|
| `--carta`, `--foglio` | fondi, avorio `#faf6ef` e bianco |
| `--inchiostro`, `--inchiostro-2`, `--muto` | testo, tre livelli |
| `--linea`, `--linea-forte` | bordi |
| `--acc`, `--acc-scuro`, `--acc-tenue`, `--acc-bordo` | accento, cambia per area |
| `--acc-pieno`, `--acc-pieno-hover` | fondo pieno con testo bianco; definite solo nel tema scuro, nel chiaro ricadono su `--acc` e `--acc-scuro` |
| `--ok`, `--avv`, `--err` e le versioni `-tenue` | semantica di stato |
| `--r-s`…`--r-xl` | raggi, tutti fra 3 e 5 px: il progetto è volutamente squadrato |
| `--o-1`…`--o-3` | ombre; le prime due sono `none` di proposito |
| `--serif`, `--sans` | Fraunces per i titoli, Inter per il testo |

### Identità per area

L'accento si riscrive con l'attributo `data-area`, che `Telaio` mette sul
contenitore:

| `data-area` | Accento |
|---|---|
| `dipendente` | terracotta `#b4531f` |
| `cliente` | blu `#34408c` |
| `fornitore` | verde bosco `#2a6045` |

Restano definite anche `rsa` (verde ottanio), `comunita` (prugna) e `scuola`
(blu) per i moduli fuori dal flusso attivo.

**Non scrivere colori letterali nei componenti.** Usare le variabili, così il
tema scuro e il cambio di area funzionano da soli.

### Tema scuro

Attivato da `data-tema="scuro"` su `<html>`, scritto dallo store. Il blocco
`[data-tema="scuro"]` ridefinisce le variabili base (`--muto` `#a39b90`), poi
override per pastiglie, tag dieta, presenze, card, modali, tabelle, input,
login, vassoio, commutatori. **Accenti per area** in fondo a `styles.css`
(16 settembre 2026): nel chiaro l'accento è scuro e sul fondo scuro spariva
(blu del referente 2:1). Nel scuro `--acc` è chiaro (testi, bordi, voci
attive, ≥6:1) e `--acc-pieno` è il tono pieno per i fondi con testo bianco
(≥5:1): ogni `background: var(--acc)` è scritto
`var(--acc-pieno, var(--acc))`. `--rosso-azione`, `--rosso-pieno`,
`--verde-pieno` sostituiscono i rossi e verdi prima scritti nei componenti.
Con un fondo proprio va aggiunto l'override scuro; un fondo pieno con testo
bianco usa `--acc-pieno`, un testo in accento `--acc`.

### Nomi delle classi

In italiano, minuscole, parole separate da trattino: `.telaio`, `.fianco`,
`.principale`, `.pannello`, `.intestazione`, `.occhiello`, `.barra-basso`,
`.pallino-colore`, `.foto-piatto`, `.marchio-logo`.

Abbreviazioni ricorrenti: `.tsc` è la card piatto del menu del giorno, `.p-*`
sono le pastiglie di stato.

Non ci sono utility class alla Tailwind e non va introdotto un framework CSS.
