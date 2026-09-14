# Portale dipendente — `src/aree/Dipendente.jsx`

Accento terracotta (`data-area="dipendente"`). Utente demo: Antonella Rossi.

Cinque voci di menu: Menu del giorno, Menu settimana, Le mie prenotazioni,
Diete speciali, Documenti utili.

## Menu del giorno — `MenuGiorno`

È la pagina più importante della demo. Riprogettata a settembre 2026 passando
da sei colonne a tre.

### Selettore giorno

Una riga di cinque bottoni, uno per giorno di `GIORNI`. Ogni bottone mostra
nome, data breve e stato:

| Stato | Quando |
|---|---|
| `chiuso` | `d.chiuso` è vero, compare il lucchetto |
| `prenotato` | il giorno è confermato, pallino verde |
| `in corso` | ci sono scelte non confermate, pallino giallo |
| `da fare` | nessuna scelta |

Il giorno di partenza è l'indice 0, lunedì. Con la settimana di `GIORNI`
interamente futura rispetto a "oggi" nessun giorno è `chiuso` di default: lo
stato `chiuso` in tabella resta un valore possibile del campo (impostabile
per mostrare il cutoff quando la settimana demo è a cavallo di "oggi"), non
un giorno fisso della settimana corrente.

Le frecce settimana sopra il selettore sono decorative: mostrano solo un toast.

### Le tre colonne

Sono definite inline dentro il componente:

```js
{ key: "primo",    alt: "sost_primo",    titolo: "Primo" }
{ key: "secondo",  alt: "sost_secondo",  titolo: "Secondo" }
{ key: "contorno", alt: null,            titolo: "Contorno" }
```

Ogni colonna con alternative ha un toggle interno a due segmenti, con il
conteggio: `Primo (5) | Alternative (2)`. Lo stato del toggle è in `vistaCol`,
locale al componente. Cambiare vista cambia anche la categoria attiva su cui
si scrive la selezione (`primo` oppure `sost_primo`), che è ciò che rende
naturale la mutua esclusione già gestita dallo store.

L'intestazione di colonna mostra `da scegliere`, `scelto` o `coperto`.

Se il piatto unico scelto copre quella portata, la colonna prende la classe
`coperta`, il toggle sparisce e al posto della lista compare la frase
"Coperto dal piatto unico che hai scelto."

### Piatto unico

Sotto le tre colonne c'è un separatore "oppure" e il box del piatto unico,
centrato, largo al massimo 460 px in desktop e a tutta larghezza in mobile.
Sceglierlo spegne le portate che copre; scegliere una di quelle portate
spegne l'unico.

### La card piatto — `Tessera`

Classe CSS `.tsc`. Contiene thumbnail 54 px con dimensioni SVG bloccate,
pallino del colore WHP, nome in serif 15 px, riga meta con kcal e marcatori,
badge `U` sui piatti unici, avviso allergeni se il piatto contiene un allergene
dichiarato dall'utente.

**Il clic su tutta la card seleziona.** Solo il bottone `i` cerchiato apre la
scheda piatto. È una distinzione da mantenere: in demo si clicca molto.

`Voce` è la variante compatta, usata dove non serve la thumbnail.

### Preferenza dieta

Se `st.dietaUtente` è impostata compare un banner in cima. I piatti fuori dieta
vengono segnalati con bordo e badge, e sceglierne uno apre un avviso di conferma
invece di selezionare subito (`scegliConCheck` → `avvisoDieta`).

Il modale di conferma è reso in fondo a `MenuGiorno`, con "Torno a scegliere"
e "Scelgo comunque" (quest'ultimo chiama `st.scegli`).

### Vassoio

Barra fissa in basso con le portate scelte e l'indicatore di pasto equilibrato.

L'indicatore usa `valutaEquilibrio`, funzione locale al file che replica la
regola del codice colori WHP: senza piatto unico servono giallo, rosso e verde;
con un piatto unico bastano blu e verde. Restituisce livello, faccia, titolo e
testo, resi con `<Faccina />`.

| Livello | Faccina | Significato |
|---|---|---|
| `ok` | verde, sorriso | rispetta la regola |
| `medio` | gialla, neutra | manca una sola cosa, il testo dice quale |
| `basso` | rossa, triste | mancano più elementi |

La conferma passa da `apriConferma`: se `st.mancanti(giorno)` non è vuoto
mostra un avviso che dice cosa manca e lascia decidere, altrimenti conferma.
**Questo avviso non blocca**: si può confermare comunque. È voluto.

## Menu settimana — `MenuSettimana`

Griglia unica con intestazione giorni su fondo scuro, righe-label di categoria
in terracotta e celle con i piatti cliccabili. Navigazione su quattro settimane,
filtro per portata, legenda dei codici colore in fondo.

Serve anche a dimostrare che il menu lo governa la cucina: se dal portale MAVI
si aggiunge un piatto a un giorno, qui compare.

## Le mie prenotazioni — `Prenotazioni`

Tabella dei cinque giorni con le portate scelte e lo stato in pastiglia:
`chiuso`, `prenotato`, `non confermato`, `vuoto`. In fondo la nota sul cutoff
delle 14:00 del giorno precedente. Il pulsante "Scarica riepilogo" apre un
documento stampabile con la settimana giorno per giorno
(`generaRiepilogoPrenotazioniPDF` di `resoconto.js`, dal 14 settembre 2026);
`Prenotazioni` riceve la prop `utente` per intestarlo.

## Diete speciali — `Diete`

Quattro regimi proposti: Vegetariano, Vegano, Senza glutine, Menu religioso.
La selezione scrive `st.setDietaUtente(nome.toLowerCase())`, quindi solo
`vegetariano` e `vegano` hanno effetto sul menu; le altre due sono
dimostrative, con la nota che le richieste sanitarie vanno certificate e
validate da MAVI.

Nella stessa pagina si dichiarano gli allergeni personali, che accendono gli
avvisi sulle card e nella scheda piatto.

## Documenti utili

`<Documenti soloPubblici />`, quindi si vedono solo le voci con
`perDipendenti: true`. Vedi `10-export-e-documenti.md`.
