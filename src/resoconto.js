/* resoconto.js — i documenti stampabili dei resoconti: resoconto mensile del
   referente aziendale, resoconto della giornata della comunità, resoconto
   mensile per unità di una struttura, distinta di produzione della cucina e
   riepilogo delle prenotazioni del dipendente.

   Impaginazione e regole di escape stanno in documento.js: qui si compongono
   solo i dati. Come per proforma.js e manifesto.js l'import è statico, perché
   `apriDocumento` va chiamata dentro il gesto dell'utente.

   I numeri non vengono mai ricalcolati: ogni funzione riceve le stesse righe
   già usate dalla vista a schermo o dall'export Excel corrispondente. */

import {
  apriDocumento, blocco, cellaConNota, dataIt, giornoDataIt, paginaDocumento,
  paragrafo, riepilogoTotali, tabellaHtml,
} from "./documento.js";

const oraIt = () => new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
const generatoIl = () => "generato il " + dataIt(new Date()) + " alle " + oraIt();
const unisci = (parti) => parti.filter(Boolean).join(" · ");

/* ==================== referente aziendale ==================== */

/* `riepilogo` e `dettaglio` sono le stesse righe passate a scaricaExcel da
   Resoconti in Cliente.jsx (vedi calcolaResoconto), quindi i numeri del PDF e
   quelli dell'Excel non possono divergere. Come nel foglio Excel, la riga con
   nome "TOTALE" è la riga di totale: qui diventa l'ultima riga evidenziata. */
export function generaResocontoPDF({ committente, periodo, riepilogo = [], dettaglio = [], datiAziendali, avvisa }) {
  const totale = riepilogo.find((r) => String(r.nome).toUpperCase() === "TOTALE");
  const dipendenti = riepilogo.filter((r) => r !== totale);

  const colonneRiepilogo = [
    { titolo: "Matricola" },
    { titolo: "Nome" },
    { titolo: "Reparto" },
    { titolo: "Pasti", allinea: "centro" },
    { titolo: "Quota dipendente", allinea: "dx" },
    { titolo: "Quota azienda", allinea: "dx" },
    { titolo: "Totale", allinea: "dx" },
  ];
  const rigaRiepilogo = (r) => [r.matricola, r.nome, r.reparto, r.pasti, r.quotaDip, r.quotaAz, r.totale];

  const tabellaRiepilogo = tabellaHtml({
    colonne: colonneRiepilogo,
    righe: dipendenti.map(rigaRiepilogo),
    totale: totale ? rigaRiepilogo(totale) : undefined,
    vuota: "Nessun consumo registrato nel periodo.",
  });

  /* il dettaglio arriva piatto, una riga per giorno e per dipendente: qui si
     raggruppa per matricola, una tabella a testa, che si legge meglio in stampa */
  const perDipendente = [];
  const indice = new Map();
  dettaglio.forEach((r) => {
    const chiave = r.matricola || r.nome;
    if (!indice.has(chiave)) {
      indice.set(chiave, { matricola: r.matricola, nome: r.nome, reparto: r.reparto, giorni: [] });
      perDipendente.push(indice.get(chiave));
    }
    indice.get(chiave).giorni.push(r);
  });

  const blocchiDettaglio = perDipendente.map((d) => blocco(
    unisci([d.nome, d.matricola, d.reparto]),
    tabellaHtml({
      colonne: [{ titolo: "Giorno" }, { titolo: "Primo" }, { titolo: "Secondo" }, { titolo: "Contorno" }],
      righe: d.giorni.map((g) => [g.giorno, g.primo, g.secondo, g.contorno]),
      vuota: "Nessun pasto nel periodo.",
    })
  ));

  const html = paginaDocumento({
    titolo: "Resoconto mensile",
    badge: "Resoconto",
    sottotitolo: unisci([committente, periodo, generatoIl()]),
    meta: [
      { etichetta: "Committente", valore: committente },
      { etichetta: "Periodo", valore: periodo },
      { etichetta: "Dipendenti", valore: dipendenti.length },
      { etichetta: "Pasti totali", valore: totale ? totale.pasti : dipendenti.reduce((s, r) => s + (Number(r.pasti) || 0), 0) },
    ],
    blocchi: [
      blocco("Riepilogo per dipendente", tabellaRiepilogo),
      totale ? riepilogoTotali([
        { etichetta: "Quota a carico dei dipendenti", valore: totale.quotaDip },
        { etichetta: "Quota a carico dell'azienda", valore: totale.quotaAz },
        { etichetta: "Totale del periodo", valore: totale.totale, forte: true },
      ]) : "",
      blocco("Dettaglio giornaliero", paragrafo(
        "Una tabella per dipendente, con le portate servite giorno per giorno. "
        + "I giorni senza pasto compaiono con il trattino lungo.",
        { piccolo: true }
      )),
      ...blocchiDettaglio,
    ],
    note: "Importi indicativi. Prezzi, quota aziendale e visibilità del prezzo al dipendente "
      + "sono ancora da definire con MAVI.",
    datiAziendali,
  });

  apriDocumento(html, { nomeFile: "Resoconto_mensile.html", avvisa });
}

/* ==================== comunità, resoconto della giornata ==================== */

/* pasti: [{ pasto, inviato, righe }]
   righe: [{ paziente, reparto, tipoDieta, primo, secondo, contorno }], dove
   ogni portata è { nome, nota } già passata da splitPiatto, come a schermo in
   TabellaGiornoPasto. Niente altro dato sanitario oltre al tipo di dieta. */
export function generaResocontoComunitaPDF({ struttura, reparto, giorno, pasti = [], datiAziendali, avvisa }) {
  const etichettaGiorno = giorno ? giornoDataIt(giorno) : "";
  const pazienti = new Set();
  pasti.forEach((p) => (p.righe || []).forEach((r) => pazienti.add(r.paziente)));

  const portata = (v) => cellaConNota(v?.nome || "—", v?.nota || "");

  const blocchi = pasti.map((p) => blocco(
    "Dettaglio per paziente, " + p.pasto,
    tabellaHtml({
      colonne: [
        { titolo: "Paziente" },
        { titolo: "Tipo dieta" },
        { titolo: "Primo" },
        { titolo: "Secondo" },
        { titolo: "Contorno" },
      ],
      righe: (p.righe || []).map((r) => [
        cellaConNota(r.paziente, r.reparto),
        r.tipoDieta || "Standard",
        portata(r.primo),
        portata(r.secondo),
        portata(r.contorno),
      ]),
      vuota: "Nessun paziente in elenco per questo pasto.",
    })
  ));

  const html = paginaDocumento({
    titolo: "Resoconto della giornata",
    badge: "Resoconto",
    sottotitolo: unisci([struttura, reparto, etichettaGiorno, generatoIl()]),
    meta: [
      { etichetta: "Struttura", valore: struttura },
      { etichetta: reparto ? "Reparto" : "Perimetro", valore: reparto || "Tutti i reparti" },
      { etichetta: "Giornata", valore: etichettaGiorno },
      { etichetta: "Pazienti", valore: pazienti.size },
    ],
    blocchi: blocchi.length ? blocchi : [paragrafo("Nessun pasto previsto per questa giornata.")],
    note: "Le note di preparazione sono riportate sotto la portata a cui si riferiscono. "
      + "Le etichette adesive per le vaschette vengono generate dalla cucina MAVI, non dalla struttura.",
    datiAziendali,
  });

  apriDocumento(html, { nomeFile: "Resoconto_comunita.html", avvisa });
}

/* ==================== struttura, resoconto mensile per unità ==================== */

/* numeri e righe sono quelli del cruscotto della struttura:
   numeri: [{ etichetta, valore }]
   righe:  [{ unita, pasti, diete, stato }] */
export function generaResocontoUnitaPDF({
  struttura, modello, periodo, etichettaUnita = "Unità", etichettaDiete = "Diete",
  numeri = [], righe = [], nota, datiAziendali, avvisa,
}) {
  const somma = (k) => righe.reduce((s, r) => s + (Number(r[k]) || 0), 0);

  const tabella = tabellaHtml({
    colonne: [
      { titolo: etichettaUnita },
      { titolo: "Pasti dichiarati", allinea: "centro" },
      { titolo: etichettaDiete, allinea: "centro" },
      { titolo: "Stato" },
    ],
    righe: righe.map((r) => [r.unita, r.pasti, r.diete, r.stato]),
    totale: righe.length ? ["TOTALE", somma("pasti"), somma("diete"), ""] : undefined,
    vuota: "Nessuna unità ha ancora dichiarato pasti.",
  });

  const html = paginaDocumento({
    titolo: "Resoconto mensile",
    badge: "Resoconto",
    sottotitolo: unisci([struttura, modello, periodo, generatoIl()]),
    meta: numeri.length ? numeri : [{ etichetta: "Struttura", valore: struttura }],
    blocchi: [
      blocco("Situazione per " + etichettaUnita.toLowerCase(), tabella),
      nota ? blocco("Nota sul modello di servizio", paragrafo(nota, { piccolo: true })) : "",
    ],
    note: [
      "Le quantità sono quelle della situazione corrente mostrata nel cruscotto della struttura.",
      "Il portale conosce il numero di pasti per tipo di dieta, mai il nominativo associato alla "
      + "prescrizione: la prescrizione resta nella cartella dell'ospite.",
    ],
    datiAziendali,
  });

  apriDocumento(html, { nomeFile: "Resoconto_mensile_struttura.html", avvisa });
}

/* ==================== cucina MAVI, distinta di produzione ==================== */

/* Distinta della cucina. La pagina Produzione del portale MAVI viene rifatta a
   parte, per giorno e per settimana: questa funzione è la sua impaginazione.

   sezioni:    [{ categoria, righe: [{ piatto, colore, perStruttura: [n, ...], totale }] }]
   strutture:  [nome, ...] — le colonne per committente, vuoto se c'è un filtro
   totali:     [{ etichetta, valore }] — i numeri in cima alla pagina */
export function generaDistintaPDF({ giorno, perimetro, strutture = [], sezioni = [], totali = [], datiAziendali, avvisa }) {
  const etichettaGiorno = giorno ? giornoDataIt(giorno) : "";
  const complessivo = sezioni.reduce((s, sez) =>
    s + (sez.righe || []).reduce((x, r) => x + (Number(r.totale) || 0), 0), 0);

  const colonne = [
    { titolo: "Piatto" },
    { titolo: "Colore" },
    ...strutture.map((nome) => ({ titolo: nome, allinea: "centro" })),
    { titolo: "Porzioni", allinea: "centro" },
  ];

  const blocchi = sezioni.map((sez) => {
    const righe = sez.righe || [];
    const totaleSezione = righe.reduce((s, r) => s + (Number(r.totale) || 0), 0);
    return blocco(sez.categoria, tabellaHtml({
      colonne,
      righe: righe.map((r) => [r.piatto, r.colore, ...(r.perStruttura || []), r.totale]),
      totale: righe.length
        ? ["TOTALE " + sez.categoria.toUpperCase(), "", ...strutture.map(() => ""), totaleSezione]
        : undefined,
      vuota: "Nessuna porzione da produrre in questa categoria.",
    }));
  });

  const html = paginaDocumento({
    titolo: "Distinta di produzione",
    badge: "Produzione",
    sottotitolo: unisci([etichettaGiorno, perimetro, generatoIl()]),
    meta: totali.length ? totali : [{ etichetta: "Porzioni totali", valore: complessivo }],
    blocchi: [
      ...(blocchi.length ? blocchi : [paragrafo("Nessuna struttura ha ancora trasmesso ordini per questa giornata.")]),
      riepilogoTotali([{ etichetta: "Porzioni totali da produrre", valore: complessivo, forte: true }]),
    ],
    note: "Documento di lavoro della cucina. Le quantità sommano i contributi di tutte le "
      + "strutture servite; il contributo dell'azienda cresce con le prenotazioni confermate dal portale.",
    datiAziendali,
  });

  apriDocumento(html, { nomeFile: "Distinta_di_produzione.html", avvisa });
}

/* ==================== dipendente, riepilogo delle prenotazioni ==================== */

/* righe: [{ giorno, data, portate: [nome, ...], stato }] — gli stessi cinque
   giorni della tabella a schermo in Prenotazioni */
export function generaRiepilogoPrenotazioniPDF({ dipendente, committente, settimana, righe = [], datiAziendali, avvisa }) {
  const prenotati = righe.filter((r) => (r.portate || []).length).length;
  const portate = righe.reduce((s, r) => s + (r.portate || []).length, 0);

  const tabella = tabellaHtml({
    colonne: [{ titolo: "Giorno" }, { titolo: "Portate scelte" }, { titolo: "Stato", allinea: "centro" }],
    righe: righe.map((r) => [
      cellaConNota(r.giorno, r.data),
      (r.portate || []).length ? (r.portate || []).join(", ") : "nessuna prenotazione",
      r.stato,
    ]),
    vuota: "Nessun giorno in questa settimana.",
  });

  const html = paginaDocumento({
    titolo: "Riepilogo delle prenotazioni",
    badge: "Prenotazioni",
    sottotitolo: unisci([dipendente, committente, settimana, generatoIl()]),
    meta: [
      { etichetta: "Dipendente", valore: dipendente },
      { etichetta: "Settimana", valore: settimana },
      { etichetta: "Giorni con prenotazione", valore: prenotati },
      { etichetta: "Portate scelte", valore: portate },
    ],
    blocchi: [blocco("La settimana giorno per giorno", tabella)],
    note: "Prenotazione e disdetta sono possibili fino alle 14:00 del giorno precedente. "
      + "Dopo quell'ora il giorno resta consultabile ma non modificabile.",
    datiAziendali,
  });

  apriDocumento(html, { nomeFile: "Riepilogo_prenotazioni.html", avvisa });
}
