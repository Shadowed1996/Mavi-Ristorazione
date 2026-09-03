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

| | Educatore (`operatore`) | Responsabile |
|---|---|---|
| Cruscotto | no | sì |
| Pazienti | sola lettura | completo |
| Presenze del giorno | sì | sì |
| Resoconti | sì | sì |
| Fatture | no | sì |
| Modifica dieta, elimina, modifica anagrafica, carica dieta, template | no | sì |

Il flag arriva come prop `soloLettura={operatore}` da `Struttura.jsx`.

## Pazienti — `Pazienti`

Elenco a card, una per paziente, con iniziali, nome, stanza e tag del tipo
dieta. In cima un avviso ricorda che nomi e dettagli sono di fantasia e che a
regime si tratterebbero dati personali con consenso e responsabilità precise.

CRUD completo per il responsabile: "Nuovo paziente" apre `ModuloPaziente`
(nome, stanza, note), che alla creazione genera una dieta vuota con
`dietaVuota()`.

L'elenco vive in uno stato locale inizializzato da `PAZIENTI_COMUNITA`.

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
`st.trasmettiPresenze(lista)`.

Lo stato vive in `st.presenzeComunita`, quindi **operatore e responsabile
vedono le stesse presenze**: è la dimostrazione dello stato condiviso.

## Resoconti — `ResocontiComunita`

Due viste commutabili:

- **Giorno** — tabella per paziente con le portate del giorno.
- **Settimana** — accordion per paziente (`PazienteAccordion`); il clic espande
  la griglia delle cinque card giornaliere.

Export Excel a due fogli.

## Etichette — `EtichetteComunita`

Tre etichette per paziente, una per portata, con toggle Pranzo/Cena. Da
stampare su etichetta adesiva. La versione operativa di questa pagina sta nel
portale MAVI, vedi `09-portale-mavi.md`.
