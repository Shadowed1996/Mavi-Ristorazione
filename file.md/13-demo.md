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
| `samuele.ferri` | Samuele Ferri | Comunità Il Ponte | Educatore, reparto "Spazio Giovani SGA" |
| `ilaria.gatti` | Ilaria Gatti | Comunità Il Ponte | Responsabile |
| `cucina.mavi` | Cucina centrale | MAVI Ristorazione | Fornitore |

La password non viene verificata: qualsiasi valore va bene, conta solo il nome
utente.

## Sequenza consigliata

1. **Apertura** — parte il preloader, il piatto che si compone.
2. **Antonella Rossi** → Menu del giorno. Mostrare le tre colonne con i toggle
   Alternative, scegliere i piatti, far notare la faccina dell'equilibrio che
   cambia man mano.
3. **Diete speciali** → selezionare Vegetariano → tornare al menu: i piatti con
   carne sono segnalati.
4. **Menu settimana** → griglia con navigazione settimane e filtro portata.
5. **Conferma prenotazione.** Provare prima a confermare senza contorno: compare
   l'avviso che dice cosa manca e lascia decidere.
6. Uscire → **Roberto Manzi** → Cruscotto → "Prenota per lui" su un dipendente,
   scegliere i piatti, confermare.
7. **Resoconti** → espandere un dipendente per il dettaglio giornaliero →
   Excel → Export paghe.
8. Uscire → **Samuele Ferri** (educatore) → Pazienti: si vedono solo i due
   pazienti di "Spazio Giovani SGA", con il banner che lo segnala. Aprire
   Beatrice Comi → **Modifica dieta** funziona (per i pazienti del proprio
   reparto); "Elimina" e "Modifica anagrafica" restano assenti.
9. **Presenze** (filtrate allo stesso reparto) → segnare presenti e assenti →
   "Trasmetti a MAVI" si attiva quando sono segnati i pazienti di quel reparto.
10. Uscire → **Ilaria Gatti** (responsabile) → Pazienti: vede tutti e quattro i
    pazienti, di entrambe le strutture. Aprire Carmelo Aronica → **Modifica
    anagrafica** ed **Elimina**, assenti per l'educatore, compaiono qui.
11. **Scarica template** → mostrare l'Excel pensato per il dietista.
12. **Resoconti** → vista Settimana con accordion → Excel.
13. Uscire → **Cucina MAVI** → Etichette pasto: sezione Azienda (anonime,
    raggruppate per piatto) e Comunità (nominative, per paziente e pasto).
14. **Produzione** → distinta multi struttura → "Filtra questa".
15. **Ordini in arrivo** → aprire il dettaglio di Rossi Manifatture Spa: quantità
    per piatto con "per il giorno"/"generato il", poi il **dettaglio
    nominativo riservato al fornitore** e "Genera manifesto PDF per il
    cassone termico". Aprire anche il dettaglio di Comunità Il Ponte: elenco
    nominativo con reparto.
16. **Committenti** → "Nuovo committente": creare una struttura di prova e far
    notare che compare subito anche in Impostazioni, Fatturazione, Produzione
    e Ordini in arrivo.
17. **Impostazioni** → prezzo unitario e IVA per committente, e il pannello
    Reparti (aggiungere un reparto, farlo comparire subito nella tendina di
    "Nuovo paziente").
18. **Fatturazione** → tab per struttura, "Genera proforma PDF" usa il listino
    di quella sola struttura; in fondo "Tutte le strutture" per il riepilogo e
    la proforma unica.
19. **Modifica profilo** (icona matita accanto al nome, in fondo alla barra
    laterale, in qualsiasi portale) → cambiare foto e telefono.
20. **Gestione portale** → Aspetto → provare il tema scuro. Utenti → aprire
    Samuele Ferri, far notare il campo Reparto.
21. **Log operazioni** → filtrare per Sistema.

## I momenti che colpiscono di più

1. **Il piatto unico.** Scegliere Riso alla cantonese: primo, secondo e contorno
   si spengono da soli, perché sono già compresi. E la regola dell'equilibrio
   cambia di conseguenza.
2. **La scheda piatto.** La `i` cerchiata apre ingredienti, allergeni, valori
   nutrizionali e consigli. "Scarica scheda PDF" apre davvero un documento
   impaginato e lancia la stampa.
3. **Il ciclo completo.** Confermare la prenotazione come dipendente, poi
   entrare nel portale MAVI: nella distinta di produzione le quantità sono
   salite.
4. **Il menu lo governa la cucina.** Dal portale MAVI, Menu settimana, aggiungere
   un piatto a un giorno. Tornare al portale dipendente su quel giorno: il piatto
   è comparso.
5. **La griglia stampabile.** Sempre da Menu settimana, "Griglia settimana" poi
   "Stampa": esce il prospetto a cinque colonne pronto per la bacheca.
6. **Le presenze condivise.** Educatore e responsabile vedono le stesse
   presenze, in tempo reale.
7. **Le etichette diverse per contesto.** Anonime per l'azienda, nominative per
   la comunità. È una scelta di riservatezza, non un dettaglio grafico.
8. **Il reparto che filtra tutto.** Da Samuele Ferri a Ilaria Gatti: stessi
   pazienti nel database, vista completamente diversa. Nessuna configurazione
   manuale in mezzo, solo il login.
9. **Un committente nuovo, ovunque.** "Nuovo committente" compila un solo
   modulo e la struttura compare subito in cinque pagine diverse.
10. **Chi ha ordinato cosa, ma solo per chi deve saperlo.** Le etichette
    dell'azienda restano anonime; il manifesto nominativo per il cassone
    termico esiste solo dentro "Ordini in arrivo", portale MAVI.

## Cose da sapere prima di mostrare

- **Non c'è salvataggio.** Ricaricare la pagina azzera tutto tranne il tema.
  Non ricaricare durante la demo.
- Le frecce di navigazione settimana nel Menu del giorno sono decorative,
  mostrano solo un toast.
- "Scarica riepilogo" nella pagina Prenotazioni è dimostrativo.
- I dati aziendali nella proforma appaiono come placeholder in corsivo finché
  non si compilano in Gestione portale. Compilarli prima se si vuole mostrare
  una proforma completa.
