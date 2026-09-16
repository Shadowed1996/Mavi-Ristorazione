# Portale comunità — `src/aree/Comunita.jsx`

Accento prugna (`data-area="comunita"`). Committente: Comunità Il Ponte.

Il telaio è quello generico di `Struttura.jsx`; questo file fornisce le pagine.
Esporta un oggetto:

```js
const Comunita = { Pazienti, Presenze, Variazioni, Resoconti, Etichette };
```

La pagina **Fatture** del portale è `FattureStruttura` in `Struttura.jsx`.

La giornata della demo non è più scritta a mano: è il primo giorno ancora
aperto delle comunità (`INDICE_DEMO_COMUNITA`, **giovedì 17** con "adesso"
martedì 15 alle 22:56, `04-dati.md`). Da lì `INDICE_GIORNO_DEMO`,
`GIORNO_DEMO` (chiave delle diete), `DATA_DEMO` (titoli dei documenti) ed
`ETICHETTA_DEMO` (occhielli).

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
voce permessa. Utenti demo: un solo referente, Samuele Ferri, senza centro
assegnato perché li segue tutti (una seconda referente è stata tolta su
richiesta di Filippo: "troppo confusionario"), e Ilaria Gatti (responsabile).

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
dieta; sotto una card per giorno di `GIORNI_SETT` (**da lunedì a domenica**,
griglia `.menu-sett-grid` a sette colonne) con **Pranzo** e **Cena**
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

Con `pazienti.dieta`. `generaTemplateDieta([paziente])`: xlsx per il dietista,
righe = giorni da lunedì a domenica, colonne = portate di Pranzo e Cena
(dettagli in `10-export-e-documenti.md`).

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

Tutti partono da `null`, tranne chi ha una variazione di presenza già inviata
per la giornata della demo (nel seed Carmelo Aronica, assente a pranzo). Primo, secondo e
contorno mostrati e trasmessi sono quelli di `dietaEffettiva`, cioè con le
variazioni di dieta applicate. Il bottone **"Trasmetti pranzo/cena a MAVI" resta
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
per dire alla cucina ciò che cambia rispetto a presenze e diete. Dati, forma e
API in `st.variazioni` (`03-store.md`).

**Modulo** (`variazioni.invia`): giorno da **lunedì a domenica**
(`GIORNI_COMUNITA`, tutti elencati: lunedì, martedì e mercoledì "· chiuso" e non selezionabili, apertura su giovedì; `st.inviaVariazione` rifiuta comunque un giorno chiuso), centro, tipo, pasto (Pranzo / Cena /
Pranzo e cena), paziente. Il modulo cambia con il **tipo** (richiesta di
Filippo, 15 settembre 2026):

- **Presenze** — paziente obbligatorio. Per ogni pasto scelto si apre lo stato
  attuale ("Adesso: presente / assente / non ancora segnato"; nella giornata
  della demo quello di Presenze del giorno, negli altri giorni l'ultima
  variazione) con il toggle `✓ Presente | ✕ Assente` **sbloccato**: da assente
  si mette presente e viceversa. Un pasto non previsto dal paziente resta
  disattivato. Si invia solo se almeno un pasto cambia.
- **Dieta** — paziente obbligatorio. Si apre **la sua dieta attuale** di quel
  giorno (`dietaEffettiva`, con le variazioni precedenti già applicate), un
  campo per primo, secondo e contorno; i piatti riscritti si evidenziano con
  "Era: …". Vale per quel giorno e pasto, la dieta settimanale non cambia.
- **Altro** — si apre il **box di testo** libero, paziente facoltativo ("Tutto
  il centro"): ospiti in più, uscite di gruppo, avvisi.

Per Presenze e Dieta il testo della variazione è generato
(`testoVariazionePresenza`, `testoVariazioneDieta`: "Pranzo: da non segnato ad
assente.", "Pranzo · primo Pasta al ragù → Riso in bianco.") e **la variazione
si applica**: nella giornata della demo aggiorna `st.presenzeComunita` e, se
quel pasto del centro era già trasmesso, sostituisce o toglie la riga del
paziente con `st.sostituisciRigaTrasmessa`; negli altri giorni la legge la
stima di Produzione (`presenzaVariata`, `dietaEffettiva`). Presenze del giorno
mostra e trasmette la dieta con le variazioni applicate. Le variazioni Altro
restano avvisi che la cucina applica a mano.

- **Numeri**: in attesa di MAVI, prese in carico, totale.
- **Elenco** delle variazioni di tutti i centri (solo del proprio senza
  `pazienti.tuttiReparti`), più recenti in alto: per quando, riguarda, testo
  con autore e ora di invio, stato "Inviata a MAVI" oppure "Presa in carico il
  … da …". La presa in carico la fa MAVI (`flussi.variazioni`) e si vede qui
  subito, senza ricaricare.

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
da lunedì a domenica, totale settimana), con totale per centro (quando i centri sono
più di uno) e totale generale. Previsti = pazienti con quel pasto fra i pasti
previsti e almeno una portata nella dieta del giorno; trasmessi = righe di
`st.presenzeTrasmesse` della giornata della demo. Il calcolo è uno solo
(`contaPastiPerCentro` → `righeResocontoCentri`): schermo, Excel (fogli della
giornata e "Settimana") e PDF `generaResocontoCentriPDF` leggono le stesse
righe, verificato cifra per cifra. I resoconti sono documenti e mostrano tutta
la settimana, anche i giorni già chiusi agli ordini.

## Fatture — `FattureStruttura` in `Struttura.jsx`

Pagina di partenza del responsabile. Quattro riquadri: **da saldare** (proforma
`emessa`), **scaduto** (emesse con scadenza passata rispetto a oggi, in rosso),
**prossima scadenza** (data, numero, importo, giorni mancanti), **pagato**.
Avviso giallo se c'è qualcosa di scaduto. Tabella per proforma: documento
(periodo, emissione), totale (imponibile + IVA o "senza IVA"), scadenza con
condizioni, **da pagare**, situazione (Da saldare / Scaduta / Pagata con la
data / Annullata / Stornata). Riga di totale senza annullate e stornate. Stati e importi
vengono da `st.proforme` e `totaliProforma`, senza toccare il modello.

## Etichette — `EtichetteComunita`

Tre etichette per paziente, una per portata, con toggle Pranzo/Cena. Da
stampare su etichetta adesiva. La versione operativa di questa pagina sta nel
portale MAVI, vedi `09-portale-mavi.md`.
