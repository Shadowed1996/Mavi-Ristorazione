# MAVI, prototipo dei tre portali

Prototipo di presentazione. I dati sono di esempio e restano in memoria,
non c'è database né salvataggio.

## Come avviarlo

### Modo veloce, senza installare nulla

Apri il file `dist/index.html` con un doppio clic. Funziona in qualsiasi
browser, senza Node installato, anche senza connessione. Senza rete restano
solo i due caratteri scaricati da Google Fonts (Fraunces e Inter): il
browser usa quelli di sistema al loro posto, l'interfaccia resta comunque
utilizzabile. Se possibile, il giorno della presentazione conviene comunque
avere una connessione per la resa grafica migliore.

### Modo sviluppo

Serve Node 20.19 o superiore (per la serie 22, dalla 22.12).

```
npm install
npm run dev
```

Il browser si apre da solo su `http://localhost:5173`.
Per ricompilare la versione statica: `npm run build`.

## Cosa contiene

Tre portali attivi in questa demo, ognuno con il proprio accesso e la
propria identità cromatica. Chi entra da uno non vede nemmeno che esistono
gli altri.

1. Portale azienda, accento terracotta. Due ruoli, il dipendente che
   compone il proprio pasto e il referente che amministra.
2. Portale comunità, accento prugna. Un referente per ogni centro, che
   gestisce diete, presenze e variazioni, e un responsabile che segue solo
   la parte amministrativa: fatture, scadenze e numeri dei pasti.
3. Portale MAVI, accento verde bosco. Composizione dei menu, distinte di
   produzione da tutte le strutture, catalogo, documenti e fatturazione.

Il prototipo contiene anche il codice per un portale RSA (accento verde
ottanio) e un portale scuola (accento blu), pensati sullo stesso schema:
non sono raggiungibili da questa demo, restano pronti per essere riattivati
come moduli separati quando servirà.

Le credenziali di prova sono già precompilate in ogni schermata di
accesso.

## Il preloader

All'apertura parte una breve animazione, il piatto che si compone con
primo, secondo e contorno. Compare solo al primo avvio della sessione,
quindi navigando fra i portali non si ripete. Per rivederlo basta
riaprire la scheda del browser, oppure aprire una finestra anonima.

## Da provare in riunione

1. Nel portale dipendente scegli il piatto unico Riso alla cantonese.
   Primo, secondo e contorno si spengono, perché sono già compresi.
2. Apri la i cerchiata su un piatto. Si apre la scheda con ingredienti,
   allergeni, valori nutrizionali e consigli. Il pulsante scarica scheda
   PDF apre davvero un documento impaginato e lancia la stampa.
3. Conferma la prenotazione, poi entra nel portale MAVI. Nella distinta
   di produzione le quantità sono salite.
4. Prova a confermare senza scegliere il contorno. Compare l'avviso che
   dice cosa manca e lascia decidere.
5. Nel portale MAVI apri Menu settimana. Scegli il giorno in alto, poi
   la portata da modificare, e aggiungi un piatto dal catalogo di destra.
   Torna al portale dipendente su quel giorno, il piatto è comparso. È la
   dimostrazione che il menu lo governa la cucina.
6. Sempre lì, premi Griglia settimana e poi Stampa. Esce il prospetto a
   cinque colonne pronto per la bacheca.
7. Nel vassoio del dipendente osserva l'indicatore del pasto equilibrato,
   segue il codice colori della Regione Lombardia. Con il piatto unico la
   regola cambia da sola.

## Fotografie dei piatti e logo

Ci sono due cartelle accanto all'applicazione.

In `foto` si mettono le immagini dei piatti, una per piatto, nominate
con il codice del piatto, per esempio `ris_fun.jpg`. L'elenco completo
dei codici sta dentro `foto/LEGGIMI.txt` e anche nel portale MAVI, alla
voce Catalogo piatti, colonna Codice. Formati accettati: jpg, jpeg, png,
webp. Consigliate quadrate, almeno 600 per 600 pixel.

In `marchio` si mette il logo, nominato `logo.png`. Se c'è, sostituisce
la scritta MAVI in tutte le testate e nella pagina iniziale.

In alternativa, dal portale MAVI, voce Catalogo piatti, si caricano le
foto direttamente dal browser, una per volta con il pulsante Foto sulla
riga, oppure tutte insieme con Carica foto in blocco, selezionando più
file nominati con i codici. Quelle caricate così restano per la durata
della sessione, perché il prototipo non ha un archivio.

Dove la fotografia manca resta l'illustrazione disegnata, quindi il
prototipo funziona comunque anche a cartelle vuote.

## Note tecniche

Le immagini dei piatti sono illustrazioni vettoriali generate nel
codice, così il prototipo funziona anche senza rete. Quando saranno
disponibili le fotografie reali si sostituiscono nel solo componente
`Illustrazione` dentro `src/ui.jsx`.

Struttura del sorgente:

```
src/
  data.js         piatti, menu, anagrafiche
  store.jsx       stato delle prenotazioni
  ui.jsx          icone, illustrazioni, componenti condivisi
  styles.css      sistema visivo
  Landing.jsx     scelta del portale
  aree/           un file per ciascun portale
```
