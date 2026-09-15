# Demo: credenziali e sequenza della presentazione

## Come aprire

Il modo più sicuro il giorno della presentazione: doppio clic su
`dist/index.html`. Funziona offline, senza Node, in qualsiasi browser.

Il modo di sviluppo: `npm run dev`, si apre da solo su `localhost:5173`.

All'apertura parte il preloader. Compare solo al primo avvio della sessione:
per rivederlo, ricaricare la scheda o aprire una finestra anonima.

## Credenziali

Login unico. **La password è `dimostrazione` per tutti** ed è già precompilata.
Il pulsante "Mostra i profili di prova" elenca tutti gli utenti: un clic sulla
riga entra direttamente, senza digitare.

| Nome utente | Persona | Struttura | Ruolo |
|---|---|---|---|
| `antonella.rossi` | Antonella Rossi | Rossi Manifatture Spa | Dipendente |
| `roberto.manzi` | Roberto Manzi | Rossi Manifatture Spa | Referente |
| `samuele.ferri` | Samuele Ferri | Comunità Il Ponte | Referente (tutti i centri) |
| `ilaria.gatti` | Ilaria Gatti | Comunità Il Ponte | Responsabile amministrativa (solo fatture e resoconti numerici) |
| `cucina.mavi` | Cucina centrale | MAVI Ristorazione | Fornitore |

La password non viene verificata: qualsiasi valore va bene, conta solo il nome
utente.

## Sequenza consigliata

1. **Apertura** — parte il preloader, il piatto che si compone.
2. **Antonella Rossi** → Menu del giorno. "Adesso" è martedì 15 settembre alle
   22:56: si vedono **solo giovedì e venerdì**, gli altri giorni sono chiusi.
   Mostrare le tre colonne con i toggle Alternative, scegliere i piatti, far
   notare la faccina dell'equilibrio che cambia man mano.
3. **Diete speciali** → selezionare Vegetariano → tornare al menu: i piatti con
   carne sono segnalati.
4. **Menu settimana** → griglia con navigazione settimane e filtro portata.
5. **Conferma prenotazione.** Provare prima a confermare senza contorno: compare
   l'avviso che dice cosa manca e lascia decidere. Poi **Le mie prenotazioni**
   → "Scarica riepilogo": solo il nome e, sotto giovedì e venerdì, il pasto.
6. Uscire → **Roberto Manzi** → Cruscotto → "Ordini del giorno" (giovedì e
   venerdì): "Prenota per lui" su un dipendente, scegliere i piatti, confermare:
   la riga compare nell'anteprima e il dipendente sparisce da "Chi non ha
   prenotato". Poi **Stampa riepilogo**: "Ordini di giovedì 17 settembre",
   tutti i dipendenti che hanno ordinato, ognuno con sotto il suo pasto, il
   totale e chi non ha ordinato. Solo la Rossi Manifatture.
7. **Resoconti** → espandere un dipendente per il dettaglio giornaliero →
   Excel → **PDF** (stessi numeri) → Export paghe. Poi **Fatture**: solo le
   proforma di Rossi, con scadenza e condizioni.
8. Uscire → **Samuele Ferri** (referente) → Pazienti: i pazienti di tutte le
   strutture e i reparti, Spazio Giovani SGA e CSS Sole Luna insieme. Aprire
   Beatrice Comi: la settimana va da lunedì a domenica → **Modifica dieta**;
   poi **Nuovo paziente**: si sceglie il centro. **Scarica template** →
   l'Excel per il dietista, anche lui da lunedì a domenica.
9. **Presenze** (tutti i centri in una pagina, **giovedì 17**: mercoledì è già
   chiuso) → Carmelo Aronica è già assente
   a pranzo per una variazione; segnare gli altri → "Trasmetti pranzo a MAVI".
   Passare a **Cena**: Beatrice e Zied non compaiono, fanno solo pranzo.
10. **Variazioni**, i tre tipi:
    - **Dieta** → Beatrice Comi: si apre la sua dieta di giovedì, riscrivere
      il primo (es. Riso in bianco), "Era: Pasta alla norma" → **Invia a MAVI**.
      In Presenze del giorno il piatto è già cambiato.
    - **Presenze** → Zied Dridi: "Adesso: presente", mettere **Assente** →
      Invia. Il pranzo era già trasmesso: in Produzione Spazio Giovani scende di
      un pasto, senza ritrasmettere.
    - **Altro** → si apre il box di testo, per esempio "stasera 2 ospiti in più".
    Il giorno si sceglie fra quelli aperti, da giovedì a domenica. In elenco ce n'è già una "Presa in
    carico" dalla cucina, con data, ora e chi l'ha presa.
11. Uscire → **Ilaria Gatti** (responsabile amministrativa) → entra
    direttamente in **Fatture**: da saldare, scaduto, prossima scadenza e
    pagato, poi l'elenco delle proforma con PDF. Nel menu ci sono solo
    Resoconti e Fatture. **Resoconti**: pasti per centro e per pasto, giorno
    e settimana, **senza nomi né diete** → Excel → **PDF**, stessi numeri.
12. Uscire → **Cucina MAVI** → Etichette pasto: pannelli separati Aziende e
    Comunità, pallino rosso lampeggiante su chi ha etichette arrivate. Aprire
    Rossi Manifatture Spa (anonime, per piatto), poi Comunità Il Ponte
    (nominative, per reparto e paziente) → provare la ricerca per nominativo
    → "Stampa etichette di Comunità Il Ponte" per la vista dedicata.
13. **Produzione** → si apre su **mercoledì 16**, la giornata che la cucina
    prepara stanotte. "Pasti per committente e centro": l'azienda e sotto Il
    Ponte **una riga per centro**, con il referente e lo stato. Con ‹ › su
    giovedì: il pranzo trasmesso da Samuele risulta confermato
    per entrambi i centri, la cena di Sole Luna resta in stima. Il pannello "Variazioni dai
    centri" mostra quella appena inviata. "Filtra centro" su Sole Luna, filtro
    Pranzo / Cena, cambiare giorno con ‹ › fino a domenica (l'azienda risulta
    "nessun servizio"), poi vista **Settimana** da lunedì a domenica.
    **Stampa / PDF**: riepilogo totale, variazioni, diete e poi **una scheda
    per destinazione, ognuna su pagina nuova**, da mettere con il carico.
    **Excel**: cinque fogli, stessi numeri.
14. **Ordini in arrivo** → aprire il dettaglio di Rossi Manifatture Spa: quantità
    per piatto con "per il giorno"/"generato il", poi il **dettaglio
    nominativo riservato al fornitore**, scegliere mercoledì e "Manifesto
    PDF": il resoconto dettagliato della cucina, con totale per piatto e
    allergeni, poi matricola, reparto, portate, dieta e allergie di ognuno.
    Su giovedì c'è anche Antonella Rossi, con le allergie dichiarate nel suo
    portale. Sulla riga di Comunità Il Ponte la colonna
    Variazioni dice quante sono da prendere in carico: aprire il dettaglio,
    elenco nominativo con centro e pasto, poi "Variazioni dai centri" →
    **Prendi in carico** sulla variazione di Samuele. Rientrando come Samuele
    Ferri, in Variazioni la trova "Presa in carico".
15. **Committenti** → "Nuovo committente": creare una struttura di prova e far
    notare che compare subito anche in Impostazioni, Fatturazione, Produzione
    e Ordini in arrivo.
16. **Impostazioni** → prezzo unitario e IVA, **Condizioni di fatturazione**
    (Il Ponte a 60 gg d.f.f.m. senza IVA, Rossi a 30 gg d.f.), e il pannello
    Reparti (aggiungere un reparto, farlo comparire subito nella tendina di
    "Nuovo paziente").
17. **Fatturazione** → tab per struttura, **Nuova proforma**: aggiungere una
    riga, cambiare i termini solo per quel documento, "Emetti e apri PDF";
    sotto l'elenco delle proforma con lo stato: su PRO-2026/002 aprire il PDF
    (timbro **NON PAGATA**), poi **Segna pagata** e riaprirlo (**PAGATA** con la
    data); su una pagata **Storna** (timbro **STORNATA**). Anche Roberto Manzi
    e Ilaria Gatti vedono gli stati nelle loro Fatture. **Menu settimana**:
    "Rendi fisso" su un piatto qualsiasi, poi Griglia settimana.
18. **Modifica profilo** (icona matita accanto al nome, in fondo alla barra
    laterale, in qualsiasi portale) → cambiare foto e telefono.
19. **Gestione portale** → Aspetto → provare il tema scuro. Utenti → aprire
    Samuele Ferri: nessun reparto assegnato, perché segue tutti i centri. **Ruoli e permessi** → portale
    Comunità, togliere "Trasmetti le presenze" a Referente; poi "Nuovo ruolo"
    Cuoco su MAVI con solo Produzione ed Etichette e un nuovo utente con quel
    ruolo. Rientrare come Samuele Ferri: il bottone Trasmetti non c'è più,
    senza rifare nulla; entrare con il nuovo utente: solo due voci di menu.
    Provare a disattivare Cucina MAVI: rifiutato.
20. **Log operazioni** → filtrare per Sistema.

## I momenti che colpiscono di più

1. **Il piatto unico.** Scegliere Riso alla cantonese: primo, secondo e contorno
   si spengono da soli, perché sono già compresi. E la regola dell'equilibrio
   cambia di conseguenza.
2. **La scheda piatto.** La `i` cerchiata apre ingredienti, allergeni, valori
   nutrizionali e consigli. "Scarica scheda PDF" apre davvero un documento
   impaginato con lo stesso stile di proforma e resoconti.
3. **Il ciclo completo.** Confermare la prenotazione come dipendente, poi
   entrare nel portale MAVI: nella distinta di produzione le quantità sono
   salite.
4. **Il menu lo governa la cucina.** Dal portale MAVI, Menu settimana, aggiungere
   un piatto a un giorno. Tornare al portale dipendente su quel giorno: il piatto
   è comparso.
5. **La griglia stampabile.** Sempre da Menu settimana, "Griglia settimana" poi
   "Stampa": esce il prospetto a cinque colonne pronto per la bacheca.
6. **Le presenze condivise.** Quello che il referente trasmette arriva alla
   cucina in tempo reale, pranzo e cena separati, centro per centro.
7. **Le etichette diverse per contesto.** Anonime per l'azienda, nominative per
   la comunità. È una scelta di riservatezza, non un dettaglio grafico.
8. **Un referente che segue tutto, un responsabile che paga.** È
   l'organizzazione che MAVI ha descritto (vocale del 15 settembre 2026). Da
   Samuele Ferri a Ilaria Gatti: stessi pazienti nel database, vista
   completamente diversa. Il referente gestisce tutte le strutture e i
   reparti; la responsabile non vede nomi né diete, solo fatture e numeri dei
   pasti per controllarle. Nessuna configurazione manuale in mezzo, solo il
   login.
9. **Un committente nuovo, ovunque.** "Nuovo committente" compila un solo
   modulo e la struttura compare subito in cinque pagine diverse.
10. **Chi ha ordinato cosa, ma solo per chi deve saperlo.** Le etichette
    dell'azienda restano anonime; il manifesto nominativo per il cassone
    termico esiste solo dentro "Ordini in arrivo", portale MAVI.
11. **Il pallino che sa che sono arrivate etichette nuove.** In Etichette
    pasto, un pallino rosso lampeggiante segnala quale struttura ha etichette
    da guardare: sparisce da solo appena si apre il dettaglio.
12. **La variazione che torna indietro.** Il referente scrive "stasera 2
    ospiti in più", la cucina la trova in Ordini in arrivo e in distinta, la
    prende in carico, e il referente vede subito data, ora e chi l'ha presa.
    Niente più messaggi persi su WhatsApp.

## Cose da sapere prima di mostrare

- **Non c'è salvataggio.** Ricaricare la pagina azzera tutto tranne il tema.
  Non ricaricare durante la demo.
- Le frecce di navigazione settimana nel Menu del giorno sono decorative,
  mostrano solo un toast.
- I dati aziendali nei documenti appaiono come placeholder in corsivo finché
  non si compilano in Gestione portale. Compilarli prima se si vuole mostrare
  una proforma completa.
- Se il browser blocca le finestre popup, i documenti non si aprono: compare
  l'avviso e parte il download del file. Consentire i popup sul sito prima
  della demo.
