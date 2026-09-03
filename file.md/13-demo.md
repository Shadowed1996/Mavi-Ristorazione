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
| `samuele.ferri` | Samuele Ferri | Comunità Il Ponte | Educatore, sola lettura sulle diete |
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
8. Uscire → **Samuele Ferri** (educatore) → Pazienti → aprire Beatrice Comi,
   far notare che è in sola lettura.
9. **Presenze** → segnare presenti e assenti → "Trasmetti a MAVI" si attiva solo
   quando sono tutti segnati.
10. Uscire → **Ilaria Gatti** (responsabile) → Pazienti → Beatrice Comi →
    Modifica dieta → cambiare un piatto inline.
11. **Scarica template** → mostrare l'Excel pensato per il dietista.
12. **Resoconti** → vista Settimana con accordion → Excel.
13. Uscire → **Cucina MAVI** → Etichette pasto: sezione Azienda (anonime,
    raggruppate per piatto) e Comunità (nominative, per paziente e pasto).
14. **Produzione** → distinta multi struttura → "Filtra questa".
15. **Committenti** → Dettagli su una struttura.
16. **Impostazioni** → Rotazione menu, con la timeline a quattro settimane.
17. **Fatturazione** → Genera proforma PDF, si apre in una nuova scheda.
18. **Gestione portale** → Aspetto → provare il tema scuro.
19. **Log operazioni** → filtrare per Sistema.

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

## Cose da sapere prima di mostrare

- **Non c'è salvataggio.** Ricaricare la pagina azzera tutto tranne il tema.
  Non ricaricare durante la demo.
- Le frecce di navigazione settimana nel Menu del giorno sono decorative,
  mostrano solo un toast.
- "Scarica riepilogo" nella pagina Prenotazioni è dimostrativo.
- La prenotazione fatta dal referente con "Prenota per lui" non alimenta la
  distinta: produce toast e riga di log. Se qualcuno lo nota, è un punto aperto.
- I dati aziendali nella proforma appaiono come placeholder in corsivo finché
  non si compilano in Gestione portale. Compilarli prima se si vuole mostrare
  una proforma completa.
