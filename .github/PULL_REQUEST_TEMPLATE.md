## Descrizione

<!-- Cosa cambia e perché. Se la modifica si vede, allega una schermata o una breve registrazione. -->

## Tipo di modifica

- [ ] `fix` — correzione di un difetto
- [ ] `feat` — funzionalità nuova
- [ ] `docs` — solo documentazione
- [ ] `style` — formattazione, senza effetti sul comportamento
- [ ] `refactor` — riorganizzazione a comportamento invariato
- [ ] `perf` — prestazioni
- [ ] `chore` — manutenzione, dipendenze o configurazione

## Portali interessati

- [ ] Accesso e instradamento
- [ ] Portale azienda — dipendente
- [ ] Portale azienda — referente
- [ ] Portale comunità
- [ ] Portale MAVI (cucina)
- [ ] Moduli RSA e scuola, oggi fuori dal flusso attivo
- [ ] Store, dati, componenti condivisi o sistema visivo
- [ ] Nessuno: solo documentazione o configurazione

## Issue collegata

<!-- Per esempio: Chiude #12. Scrivi «nessuna» se la modifica non nasce da una issue. -->

## Come è stato provato

<!-- Comandi lanciati e percorso seguito nell'interfaccia. -->

```bash
npm ci
npm run dev
npm run build
```

- Profili provati:
- Browser provati:
- Tema chiaro e scuro controllati:

## Checklist

- [ ] La PR tratta **un solo** argomento e parte da `main` aggiornato
- [ ] `npm run build` si chiude senza errori
- [ ] Se ho toccato `src/` o `public/`, `dist/` è rigenerata e committata in questa PR
- [ ] `dist/index.html` aperto con un doppio clic funziona ancora
- [ ] Nessuna dipendenza nuova, niente TypeScript, linter o test runner (vedi `CLAUDE.md`)
- [ ] Nessuna sostituzione cieca con `sed` sui file JSX
- [ ] Nessun colore letterale nei componenti; override `[data-tema="scuro"]` per i fondi nuovi
- [ ] `MAVI_Stato_Progetto.md` e il documento di `file.md/` della zona toccata sono aggiornati
- [ ] Voce aggiunta a `CHANGELOG.md` sotto *Non rilasciato* se la modifica si vede
- [ ] **Nessun dato reale** committato: persone, pazienti, diete, credenziali
- [ ] I messaggi di commit seguono la convenzione di [`CONTRIBUTING.md`](https://github.com/Shadowed1996/Mavi-Ristorazione/blob/main/CONTRIBUTING.md)

## Note per chi revisiona

<!-- Punti su cui vuoi un occhio in più, decisioni discutibili, cose lasciate fuori di proposito. -->
