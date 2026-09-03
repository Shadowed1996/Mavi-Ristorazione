# UI condivisa e sistema visivo

## `src/ui.jsx`

Contiene tutto ciò che è condiviso fra i portali: icone, illustrazioni, telaio,
componenti riusati. Prima di scrivere un componente nuovo controllare qui.

### Icone

`Icone` è un dizionario di componenti SVG, tutti a 24×24 con
`stroke="currentColor"`. Prendono una prop `size` (default 18).

Chiavi disponibili: `piatto`, `lista`, `foglia`, `grafico`, `gente`, `fattura`,
`cuoco`, `calendario`, `sacco`, `ok`, `piu`, `x`, `sx`, `dx`, `lucchetto`,
`scarica`, `stampa`, `edificio`, `attenzione` e altre.

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
  voci={VOCI}                // [[chiave, etichetta, ComponenteIcona], ...]
  pagina={pagina}
  setPagina={setPagina}
  onEsci={...}
>
  {contenuto della pagina}
</Telaio>
```

Rende: nastro "prototipo dimostrativo" in alto, barra laterale con marchio,
tag ruolo, menu di navigazione, toggle tema a tre stati e blocco utente con
pulsante di uscita; il contenuto in `<main className="principale">`; e, sotto,
una barra di navigazione per il mobile che mostra solo la prima parola di ogni
etichetta.

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

`schedaPdf(id)` apre una nuova finestra con la scheda impaginata e lancia
`print()` dopo 400 ms.

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

Le sezioni principali, nell'ordine: variabili, tema scuro, tipografia, nastro,
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

Attivato dall'attributo `data-tema="scuro"` su `<html>`, scritto dallo store.
Il blocco `[data-tema="scuro"]` ridefinisce le variabili base, poi seguono
override espliciti per: pastiglie (`.p-ok`, `.p-att`, `.p-err`, `.p-neu`),
tag dieta (terapeutica, base, sanitaria, etica), toggle presenza, righe
presenza, card, modali, tabelle, input, login, vassoio, commutatori.

Aggiungendo un componente con un fondo proprio va aggiunto anche l'override
scuro, altrimenti resta chiaro su chiaro.

### Nomi delle classi

In italiano, minuscole, parole separate da trattino: `.telaio`, `.fianco`,
`.principale`, `.pannello`, `.intestazione`, `.occhiello`, `.barra-basso`,
`.pallino-colore`, `.foto-piatto`, `.marchio-logo`.

Abbreviazioni ricorrenti: `.tsc` è la card piatto del menu del giorno, `.p-*`
sono le pastiglie di stato.

Non ci sono utility class alla Tailwind e non va introdotto un framework CSS.
