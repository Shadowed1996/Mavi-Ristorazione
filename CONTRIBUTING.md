# Come contribuire

**MAVI Ristorazione — Portale** è un progetto proprietario: i contributi esterni non sono
aperti e le pull request si accettano **solo su invito**. Questo documento serve a chi lavora
al codice su richiesta del titolare, perché il lavoro resti coerente con quello già presente.

Referente del progetto: Filippo — [@Shadowed1996](https://github.com/Shadowed1996).

## Segnalare un problema

Le issue sono aperte e sono il canale giusto per bug e proposte:

- **Bug**: usa il template *Segnalazione di bug*. Servono passi per riprodurre, comportamento
  atteso e ambiente (sistema operativo, browser, versione di Node.js).
- **Nuova funzionalità**: usa il template *Richiesta di funzionalità*. Descrivi il problema da
  risolvere prima della soluzione proposta.
- **Vulnerabilità di sicurezza**: non aprire una issue, segui [`SECURITY.md`](SECURITY.md).

Prima di aprire una issue, controlla che non ne esista già una uguale.

## Flusso di lavoro

1. Allinea il tuo `main`: `git pull origin main`.
2. Crea un branch dedicato con il formato `tipo/descrizione-breve`, tutto in minuscolo e con
   i trattini al posto degli spazi:
   - `feat/etichette-pasto-rsa`
   - `fix/vassoio-piatto-unico`
   - `docs/manuale-catalogo`
3. Lavora su **un solo argomento per branch e per pull request**.
4. Verifica che il progetto parta e compili:

   ```bash
   npm install
   npm run dev
   npm run build
   ```

5. Apri la pull request verso `main` usando il template proposto.

## Convenzione dei commit

Si usano i *Conventional Commits* con la descrizione in italiano, in minuscolo e
all'infinito o all'indicativo, senza punto finale:

```
tipo: descrizione breve in italiano
```

Tipi ammessi:

| Tipo | Quando si usa |
| --- | --- |
| `feat` | nuova funzionalità |
| `fix` | correzione di un difetto |
| `docs` | solo documentazione |
| `style` | formattazione, senza effetti sul comportamento |
| `refactor` | riorganizzazione del codice a parità di comportamento |
| `perf` | miglioramento delle prestazioni |
| `test` | aggiunta o modifica di verifiche |
| `chore` | manutenzione, dipendenze, configurazione |

Esempi presi dal progetto:

```
feat: distinta di produzione aggregata per giro di consegna
fix: il piatto unico non spegneva il contorno nel vassoio
docs: elenco dei codici piatto nella cartella foto
```

Se il commit chiude una issue, aggiungi in fondo al corpo `Chiude #12`.

## Stile del codice

Le convenzioni sono quelle già osservabili nei file del repository:

- **Indentazione**: 2 spazi, mai tabulazioni. Le impone anche [`.editorconfig`](.editorconfig).
- **Stringhe**: doppi apici (`"..."`), come nel resto del sorgente.
- **Punto e virgola**: presente a fine istruzione.
- **Estensioni**: `.jsx` per i file che contengono JSX, `.js` per i moduli di sola logica
  (`data.js`, `excel.js`, `diete.js`, `proforma.js`). Gli import interni indicano sempre
  l'estensione: `import { usaStato } from "./store.jsx";`.
- **Lingua**: identificatori, commenti e testi dell'interfaccia in italiano
  (`usaStato`, `Telaio`, `Intestazione`, `committente`, `soloLettura`).
- **Nomi**:
  - componenti React in `PascalCase` (`Fornitore`, `SchedaPiatto`, `CodaApprovazioni`);
  - funzioni e variabili in `camelCase` (`menuDelGiorno`, `ordiniTrasmessi`);
  - dati e configurazioni costanti in `MAIUSCOLO_CON_UNDERSCORE` (`PIATTI`, `COMMITTENTI`,
    `DIETE_TERAPEUTICHE`, `PREZZO_PASTO`);
  - gli hook personalizzati seguono la forma italiana già adottata (`usaStato`).
- **Stato**: si passa dal contesto di `src/store.jsx` tramite `usaStato()`. Non aggiungere
  altri store paralleli.
- **Stili**: un unico foglio `src/styles.css`, con classi in italiano e minuscolo
  (`pannello`, `tela`, `btn linea piccolo`) e l'identità di portale gestita dagli attributi
  `data-area` e `data-tema`. Niente CSS inline se esiste già una classe adatta.
- **Commenti**: in italiano; per separare le sezioni lunghe si usano i riquadri già presenti
  nel codice, del tipo `/* ===== nome della sezione ===== */`.
- **Nuove pagine di portale**: vanno in `src/aree/`, un file per portale o per gruppo
  omogeneo di pagine, e si registrano nell'elenco `VOCI` del portale di appartenenza.
- **Dipendenze**: prima di aggiungerne una, verifica che il risultato non sia già ottenibile
  con quelle presenti. Le librerie pesanti (ExcelJS, FileSaver) si caricano con `import()`
  dinamico, come in `excel.js` e `diete.js`, per non appesantire il bundle iniziale.

## Dati e riservatezza

Il prototipo lavora su dati di esempio. **Non inserire mai** dati personali reali, credenziali,
chiavi API o documenti riservati nel repository, nemmeno nei file di prova o negli allegati
delle issue.

## Checklist prima di aprire una pull request

- [ ] Il branch parte da `main` aggiornato e riguarda un solo argomento.
- [ ] `npm run build` termina senza errori.
- [ ] L'applicazione è stata provata con `npm run dev` sui portali toccati dalla modifica.
- [ ] Indentazione a 2 spazi e convenzioni di nome rispettate.
- [ ] Nessun dato personale, credenziale o segreto committato.
- [ ] Documentazione aggiornata dove serve (`README.md`, `LEGGIMI.md`, i `LEGGIMI.txt`).
- [ ] [`CHANGELOG.md`](CHANGELOG.md) aggiornato nella sezione *Non rilasciato*.
- [ ] Il messaggio di commit segue la convenzione descritta sopra.
