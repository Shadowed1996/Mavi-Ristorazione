# Portale comunità — `src/aree/Comunita.jsx`

Accento prugna (`data-area="comunita"`). Committente: Comunità Il Ponte.

Il telaio è quello generico di `Struttura.jsx`; questo file fornisce le pagine.
Esporta un oggetto:

```js
const Comunita = { Pazienti, Presenze, Resoconti, Etichette };
```

Due costanti fissano la giornata della demo:

```js
const GIORNO_DEMO = "mercoledì";
const PASTO_DEMO  = "pranzo";
```

## Ruoli e permessi

Rivisti il 12 settembre 2026: prima l'educatore era in sola lettura su tutto.
Ora il modello è "ogni reparto ha il suo educatore, il responsabile li vede e
coordina tutti", indicazione diretta di Filippo.

| | Educatore (`operatore`) | Responsabile |
|---|---|---|
| Cruscotto | no | sì |
| Pazienti | solo il proprio reparto | tutti i reparti |
| Modifica dieta, carica dieta, scarica template | sì, solo per i pazienti del proprio reparto | sì, per tutti |
| Elimina, modifica anagrafica, nuovo paziente | no | sì |
| Presenze del giorno | solo il proprio reparto | tutti i reparti |
| Resoconti | solo il proprio reparto | tutti i reparti |
| Fatture | no | sì |

Il **reparto** è il valore del campo `stanza` del paziente (riusato come
unità/struttura: nei quattro pazienti demo vale "Spazio Giovani SGA" o "CSS
Sole Luna, Desio", non un numero di stanza). L'educatore lo riceve
dall'anagrafica di accesso — `UTENTI` in `data.js`, campo `reparto` — e
`Struttura.jsx` lo passa come prop `reparto` a `Comunita.Pazienti`,
`.Presenze` e `.Resoconti`; quando `reparto` è assente (responsabile, o il
vecchio flusso senza login reale) si vede tutto. `Comunita.jsx` non filtra
altrove: `Etichette` resta irraggiungibile dal portale comunità (la versione
operativa vive nel portale MAVI).

`soloLettura={operatore}` continua a gestire solo Elimina/Modifica
anagrafica/Nuovo paziente: **non è più lo stesso interruttore** che decide
Modifica dieta. Quel permesso ha una prop dedicata, `puoDieta`, calcolata in
`Pazienti` come `!soloLettura || !!reparto` (responsabile sempre, educatore
sempre — perché la lista che vede è già filtrata al suo reparto) e passata a
`SchedaPaziente`.

Per assegnare un educatore a un reparto diverso dal demo, si cambia il campo
`reparto` in `UTENTI` (login) — e, solo per coerenza visiva nell'amministrazione
MAVI, il campo omonimo nel modale Utenti di `Gestione portale` (vedi
`09-portale-mavi.md`), che resta comunque scollegato dal login reale.

## Pazienti — `Pazienti`

Elenco a card, una per paziente, con iniziali, nome, stanza e tag del tipo
dieta. In cima un avviso ricorda che nomi e dettagli sono di fantasia e che a
regime si tratterebbero dati personali con consenso e responsabilità precise.

CRUD completo per il responsabile: "Nuovo paziente" apre `ModuloPaziente`
(nome, stanza/reparto — un menu a tendina sui reparti censiti in Impostazioni
per committente, non più testo libero, dal 12 settembre 2026 — note), che alla
creazione genera una dieta vuota con `dietaVuota()`. Se il paziente ha già una
stanza non più tra i reparti censiti (rimosso nel frattempo), la select la
include comunque in cima, per non perderla in silenzio.

L'elenco vive in uno stato locale inizializzato da `PAZIENTI_COMUNITA` (filtrato
per `stanza === reparto` se l'educatore ha un reparto). Creazione ed
eliminazione (12 settembre 2026) mutano anche l'array condiviso
`PAZIENTI_COMUNITA` stesso, la stessa scorciatoia di `salvaPiatto`/`eliminaPiatto`
in `store.jsx`: prima un paziente creato qui restava invisibile a Presenze,
Resoconti ed Etichette, che leggono `PAZIENTI_COMUNITA` direttamente.

## Scheda paziente — `SchedaPaziente`

Modale largo. In testa: stanza, data di ingresso, nome, note cliniche, tag del
tipo dieta.

Il corpo è una griglia di card giornaliere, una per giorno di `GIORNI_SETT`,
ognuna divisa in **Pranzo** e **Cena** con primo, secondo e contorno.

Il testo di ogni portata passa da `splitPiatto`: la parte dopo ` || ` diventa
una nota di preparazione mostrata con il triangolo di attenzione.

### Modifica dieta

Solo responsabile. Il bottone "Modifica dieta" accende `modalitaModifica`:
i campi diventano cliccabili con bordo tratteggiato, al clic si aprono in input
inline. Si salva con Invio o uscendo dal campo, si annulla con Esc.

**La modifica muta direttamente `paziente.dieta`**, cioè l'oggetto importato
da `data.js`. Funziona perché il modale si ridisegna, ma è la stessa scorciatoia
usata per il catalogo piatti: non replicarla in codice nuovo.

### Carica dieta

Solo responsabile. File picker limitato a `.xlsx`/`.xls`, poi:

1. `import("../diete.js")` dinamico e `parsaDietaExcel(file)`;
2. modale di anteprima con la dieta letta, giorno per giorno;
3. "Approva e applica" fa `Object.assign(paziente.dieta, importPreview.dieta)`
   e scrive nel log; "Annulla" scarta tutto.

**Niente viene applicato prima dell'approvazione.** In caso di errore di
lettura compare un avviso con il messaggio dell'eccezione.

### Scarica template

Solo responsabile. `generaTemplateDieta([paziente])` produce un xlsx per quel
singolo paziente, intestato con nome, stanza e tipo dieta, con righe = giorni e
colonne = portate divise in Pranzo e Cena, più la nota su come usare il
separatore ` || ` per le note di preparazione. È il file che si manda al
dietista.

## Presenze del giorno — `PresenzeComunita`

Toggle Pranzo/Cena in cima. Quattro numeri: presenti, assenti, da segnare,
etichette (presenti × 3, una per portata).

Tabella dei pazienti con le portate previste per quel pasto e un toggle a due
segmenti `✓ Presente | ✕ Assente`. La riga prende una classe che la colora:

| Stato | Classe |
|---|---|
| `true` | `pz-presente`, verde |
| `false` | `pz-assente`, rosso, portate mostrate come `—` |
| `null` | `pz-neutro`, non ancora segnato |

Tutti partono da `null`. Il bottone **"Trasmetti a MAVI" resta disabilitato
finché c'è anche un solo paziente non segnato**, e nel frattempo l'etichetta
del bottone diventa "Segna tutti prima di trasmettere".

Alla trasmissione costruisce la lista dei soli presenti, con nome, stanza, tipo
dieta, note e la dieta del giorno per quel pasto, e chiama
`st.trasmettiPresenze(lista)`, che timbra ogni riga con `generatoIl` (data/ora
reale) prima di aggiungerla a `st.presenzeTrasmesse`.

Lo stato vive in `st.presenzeComunita`, quindi **operatore e responsabile
vedono le stesse presenze**: è la dimostrazione dello stato condiviso. La
pagina si filtra per reparto quando c'è un `reparto` (educatore): i numeri e
il bottone "Trasmetti a MAVI" contano solo i pazienti del proprio reparto, così
un educatore può trasmettere il suo reparto senza aspettare gli altri.
`st.trasmettiPresenze` **aggiorna per id, non sovrascrive**: reparti diversi
trasmessi in momenti diversi (da educatori diversi, o dal responsabile dopo)
si sommano invece di cancellarsi a vicenda.

## Resoconti — `ResocontiComunita`

Due viste commutabili:

- **Giorno** — tabella per paziente con le portate del giorno.
- **Settimana** — accordion per paziente (`PazienteAccordion`); il clic espande
  la griglia delle cinque card giornaliere.

Entrambe le viste, i numeri e l'export Excel si filtrano per reparto quando
c'è un `reparto` (educatore); il nome del file scaricato include il reparto.

## Etichette — `EtichetteComunita`

Tre etichette per paziente, una per portata, con toggle Pranzo/Cena. Da
stampare su etichetta adesiva. La versione operativa di questa pagina sta nel
portale MAVI, vedi `09-portale-mavi.md`.
