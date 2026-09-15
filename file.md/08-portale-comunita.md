# Portale comunità — `src/aree/Comunita.jsx`

Accento prugna (`data-area="comunita"`). Committente: Comunità Il Ponte.

Il telaio è quello generico di `Struttura.jsx`; questo file fornisce le pagine.
Esporta un oggetto:

```js
const Comunita = { Pazienti, Presenze, Variazioni, Resoconti, Etichette };
```

La pagina **Fatture** del portale è `FattureStruttura` in `Struttura.jsx`.

Due costanti fissano la giornata della demo, da tenere allineate:

```js
const GIORNO_DEMO = "mercoledì";
const DATA_DEMO   = "2026-09-16";   // per i titoli dei documenti stampabili
```

## Ruoli e permessi

Dal vocale MAVI del 15 settembre 2026, come chiarito da Filippo lo stesso
giorno: **il referente gestisce pazienti, diete, presenze e variazioni di
tutte le strutture e i reparti**, e **il responsabile fa solo la parte
amministrativa** (fatture e resoconti numerici per controllarle). La prima
versione del 15 settembre limitava ogni referente al proprio centro: era una
lettura sbagliata del vocale. Nell'interfaccia si dice **centro**; nel codice
restano `reparto`, `stanza`, `unita`. I permessi vengono dalla matrice
**Ruoli e permessi** di Gestione portale (`09b-portale-mavi-gestione.md`),
chiavi del portale `comunita` in `PERMESSI` (`04-dati.md`). Ruoli iniziali:

| Permesso | Referente (`operatore`) | Responsabile amministrativo |
|---|---|---|
| `pazienti.vedi`, `pazienti.anagrafica`, `pazienti.dieta` | sì | no |
| `pazienti.tuttiReparti` (tutti i centri) | sì | sì (per i resoconti) |
| `presenze.vedi`, `presenze.segna`, `presenze.trasmetti` | sì | no |
| `variazioni.vedi`, `variazioni.invia` | sì | no |
| `resoconti.vedi`, `resoconti.export` | sì | sì |
| `resoconti.nominativi` (nomi e diete nei resoconti) | sì | no: numeri per centro |
| `fatture.vedi`, `fatture.pdf` | no | sì |
| `documenti.vedi` | sì | no |
| `documenti.riservati`, `cruscotto.vedi` | no | no |

Pagina di partenza: il campo `home` del ruolo in `STRUTTURE.comunita.ruoli`
(`pazienti` per il referente, `fatture` per il responsabile), passato come
terzo argomento a `usaVociPermesse`; se il ruolo non la può aprire, la prima
voce permessa. Utenti demo: Samuele Ferri e Marta Colli (referenti; il campo
`reparto` resta come centro di appartenenza ma non filtra), Ilaria Gatti
(responsabile).

Il **centro** è il campo `stanza` del paziente. Il filtro per centro resta
per i ruoli creati dalla matrice senza `pazienti.tuttiReparti`: il centro
arriva dal record utente (`st.utenti`,
campo `reparto`, dal modale Utenti di Gestione portale) e `Struttura.jsx` lo
passa come prop `reparto` a `Pazienti`, `Presenze`, `Variazioni` e
`Resoconti`: `null` = tutti i centri, stringa = solo quello, stringa vuota =
nessun paziente con banner dedicato. `Etichette` resta irraggiungibile dal
portale comunità (la versione operativa vive nel portale MAVI).

`soloLettura` (da `pazienti.anagrafica`) gestisce Elimina / Modifica
anagrafica / Nuovo paziente; `puoDieta` (da `pazienti.dieta`) gestisce
Modifica dieta, Carica dieta e Scarica template. Togliere una spunta dalla
matrice si applica subito, senza rifare il login.

## Pazienti — `Pazienti`

Elenco a card, una per paziente, con iniziali, nome, stanza e tag del tipo
dieta. In cima un avviso ricorda che nomi e dettagli sono di fantasia e che a
regime si tratterebbero dati personali con consenso e responsabilità precise.

CRUD con `pazienti.anagrafica`: "Nuovo paziente" apre `ModuloPaziente` (nome,
centro a tendina sui centri censiti in Impostazioni per committente, **ridotto
al solo proprio centro** per chi è limitato; **pasti previsti** Pranzo/Cena,
almeno uno; note) e genera una dieta vuota con `dietaVuota()`. Le card con un
solo pasto mostrano la chip "Solo pranzo" / "Solo cena". Un centro non più
censito resta comunque in cima alla select, per non perderlo in silenzio.

L'elenco vive in uno stato locale inizializzato da `PAZIENTI_COMUNITA` (filtrato
per `stanza === reparto` se l'utente ha un centro). Creazione ed eliminazione
mutano anche l'array condiviso `PAZIENTI_COMUNITA` (stessa scorciatoia di
`salvaPiatto`), altrimenti Presenze, Resoconti ed Etichette non le vedrebbero.

## Scheda paziente — `SchedaPaziente`

Modale largo: in testa centro, data di ingresso, nome, note cliniche, tipo
dieta; sotto una card per giorno di `GIORNI_SETT` con **Pranzo** e **Cena**
(primo, secondo, contorno). Si mostrano solo i pasti previsti (`pastiDi`),
l'altro è un blocco disattivato "Non previsto per questo paziente". L'import
Excel non tocca il campo `pasti`.

Il testo di ogni portata passa da `splitPiatto`: la parte dopo ` || ` diventa
una nota di preparazione mostrata con il triangolo di attenzione.

### Modifica dieta

Con `pazienti.dieta` (il referente). Il bottone "Modifica dieta" accende `modalitaModifica`:
i campi diventano cliccabili con bordo tratteggiato, al clic si aprono in input
inline. Si salva con Invio o uscendo dal campo, si annulla con Esc.

**La modifica muta direttamente `paziente.dieta`**, cioè l'oggetto importato
da `data.js`. Funziona perché il modale si ridisegna, ma è la stessa scorciatoia
usata per il catalogo piatti: non replicarla in codice nuovo.

### Carica dieta

Con `pazienti.dieta`. File picker limitato a `.xlsx`/`.xls`, poi:

1. `import("../diete.js")` dinamico e `parsaDietaExcel(file)`;
2. modale di anteprima con la dieta letta, giorno per giorno;
3. "Approva e applica" fa `Object.assign(paziente.dieta, importPreview.dieta)`
   e scrive nel log; "Annulla" scarta tutto.

**Niente viene applicato prima dell'approvazione.** In caso di errore di
lettura compare un avviso con il messaggio dell'eccezione.

### Scarica template

Con `pazienti.dieta`. `generaTemplateDieta([paziente])` produce un xlsx per quel
singolo paziente, intestato con nome, stanza e tipo dieta, con righe = giorni e
colonne = portate divise in Pranzo e Cena, più la nota su come usare il
separatore ` || ` per le note di preparazione. È il file che si manda al
dietista.

## Presenze del giorno — `PresenzeComunita`

Toggle Pranzo/Cena in cima: dal 14 settembre 2026 **pranzo e cena sono
indipendenti**. Nel pasto scelto compaiono solo i pazienti che lo prevedono
(`pastiDi`); un banner dice quanti sono esclusi e perché. Quattro numeri, tutti
per il pasto corrente: presenti, assenti, da segnare, etichette (somma delle
portate realmente servite, `portateServite`, non più presenti × 3).

Tabella dei pazienti con le portate previste per quel pasto e un toggle a due
segmenti `✓ Presente | ✕ Assente`. Lo stato è `st.presenzeComunita[id][pasto]`:
segnare il pranzo non segna la cena. La riga prende una classe che la colora:

| Stato | Classe |
|---|---|
| `true` | `pz-presente`, verde |
| `false` | `pz-assente`, rosso, portate mostrate come `—` |
| `null` | `pz-neutro`, non ancora segnato |

Tutti partono da `null`. Il bottone **"Trasmetti pranzo/cena a MAVI" resta
disabilitato finché c'è anche un solo paziente del pasto non segnato** (o se
il pasto non ha pazienti), e nel frattempo l'etichetta diventa "Segna tutti
prima di trasmettere".

Alla trasmissione costruisce la lista dei soli presenti del pasto, con nome,
stanza, tipo dieta, note, `pasto` e la dieta del giorno per quel pasto, e
chiama `st.trasmettiPresenze(lista, { centri, pasto, giorno })`, che timbra
ogni riga con `generatoIl` (data/ora reale) prima di aggiungerla a
`st.presenzeTrasmesse`. `centri` sono i centri dei pazienti in pagina: le loro
righe precedenti per quel pasto vengono sostituite (un paziente ritrasmesso
assente sparisce dalla distinta) e il centro resta registrato in
`st.trasmissioniCentri` anche se erano tutti assenti, così la cucina lo vede
"trasmesso, nessun pasto" invece di tornare alla stima.

Lo stato vive in `st.presenzeComunita`, condiviso fra tutti gli utenti, e si
aggiorna in forma funzionale (più pazienti segnati in rapida successione non
si perdono). Il referente vede tutti i centri in una sola pagina; con un
`reparto` (ruolo limitato) numeri e bottone contano solo quel centro.
`st.trasmettiPresenze` **aggiorna per id e pasto, non
sovrascrive**: centri e pasti trasmessi in momenti diversi si sommano, e MAVI
vede pranzo e cena come righe distinte.

## Variazioni — `VariazioniComunita` (15 settembre 2026)

Voce dopo Presenze del giorno (`variazioni.vedi`). È il canale del referente
per dire alla cucina ciò che le presenze non dicono: dieta in bianco per
qualche giorno, ospiti in più, un paziente che esce. Dati e API in
`st.variazioni` (`03-store.md`).

- **Modulo** (`variazioni.invia`, nascosto a chi è limitato ma senza centro):
  giorno fra quelli non `chiuso` di `GIORNI` (parte da mercoledì, la giornata
  della demo), centro (fisso per chi è limitato, a tendina per chi vede tutti
  i centri), pasto (Pranzo / Cena / Pranzo e cena), tipo (Dieta / Presenze /
  Altro), paziente facoltativo del centro scelto ("Tutto il centro" di
  default), testo obbligatorio. "Invia a MAVI" chiama `st.inviaVariazione`.
- **Numeri**: in attesa di MAVI, prese in carico, totale.
- **Elenco** delle variazioni di tutti i centri (solo del proprio senza
  `pazienti.tuttiReparti`), più recenti in alto: per quando, riguarda, testo
  con autore e ora di invio, stato "Inviata a MAVI" oppure "Presa in carico il
  … da …". La presa in carico la fa MAVI (`flussi.variazioni`) e si vede qui
  subito, senza ricaricare.

Le variazioni sono avvisi: non modificano diete né presenze.

## Resoconti — `ResocontiComunita`

Un piccolo smistatore sceglie fra due componenti distinti (così togliere il
permesso dalla matrice cambia vista senza mescolare gli hook):

**Con `resoconti.nominativi`** (referente) — `ResocontiNominativi`, la vista di
prima. Giorno: una tabella per pasto (`TabellaGiornoPasto`) con stato
trasmesso; Settimana: accordion per paziente (`PazienteAccordion`). Excel
(colonne Centro e Pasto) e PDF `generaResocontoComunitaPDF` con le stesse
righe, filtrati per centro; il nome del file include il centro.

**Senza** (responsabile amministrativo) — `ResocontiCentri`: **nessun nome, nessuna
dieta**, avviso che lo spiega. Numeri aggregati **per centro e per pasto**:
Giorno (pasti previsti, presenti trasmessi a MAVI) e Settimana (pasti previsti
lunedì-venerdì, totale settimana), con totale per centro (quando i centri sono
più di uno) e totale generale. Previsti = pazienti con quel pasto fra i pasti
previsti e almeno una portata nella dieta del giorno; trasmessi = righe di
`st.presenzeTrasmesse` di mercoledì. Il calcolo è uno solo
(`contaPastiPerCentro` → `righeResocontoCentri`): schermo, Excel (fogli
"Mercoledì 16 settembre" e "Settimana") e PDF `generaResocontoCentriPDF`
leggono le stesse righe, verificato cifra per cifra.

La data dei documenti è `DATA_DEMO` (`2026-09-16`), da tenere allineata a
`GIORNO_DEMO`.

## Fatture — `FattureStruttura` in `Struttura.jsx`

Pagina di partenza del responsabile. Quattro riquadri: **da saldare** (proforma
`emessa`), **scaduto** (emesse con scadenza passata rispetto a oggi, in rosso),
**prossima scadenza** (data, numero, importo, giorni mancanti), **pagato**.
Avviso giallo se c'è qualcosa di scaduto. Tabella per proforma: documento
(periodo, emissione), totale (imponibile + IVA o "senza IVA"), scadenza con
condizioni, **da pagare**, situazione (Da saldare / Scaduta / Pagata /
Annullata, con i giorni). Riga di totale annullate escluse. Stati e importi
vengono da `st.proforme` e `totaliProforma`, senza toccare il modello.

## Etichette — `EtichetteComunita`

Tre etichette per paziente, una per portata, con toggle Pranzo/Cena. Da
stampare su etichetta adesiva. La versione operativa di questa pagina sta nel
portale MAVI, vedi `09-portale-mavi.md`.
