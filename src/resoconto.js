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
  apriDocumento, blocco, cellaConNota, dataIt, elenco, giornoDataIt, paginaDocumento,
  paragrafo, riepilogoTotali, tabellaHtml, testoHtml,
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
      { etichetta: reparto ? "Centro" : "Perimetro", valore: reparto || "Tutti i centri" },
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

/* ==================== comunità, pasti per centro senza nominativi ==================== */

/* Il resoconto del responsabile amministrativo: nessun nome, nessuna dieta.
   righe:        [{ tipo: "dettaglio" | "centro" | "totale", centro, pasto,
                    previsti, trasmessi, settimana: [n, ...], totaleSettimana }]
                 le stesse di ResocontiCentri in Comunita.jsx e dei due fogli Excel
   intestazioni: [etichetta, ...] le colonne dei giorni della settimana
   numeri:       [{ etichetta, valore }] gli stessi riquadri dello schermo */
export function generaResocontoCentriPDF({
  struttura, perimetro, giorno, periodo, intestazioni = [], righe = [], numeri = [], datiAziendali, avvisa,
}) {
  const etichettaGiorno = giorno ? giornoDataIt(giorno) : "";
  /* totali del centro e totale generale in grassetto dentro il corpo della
     tabella: la riga `totale` di tabellaHtml, quando cade in posizione pari,
     prende lo sfondo chiaro delle righe alterne e il testo bianco sparisce */
  const forte = (v) => ({ html: "<b>" + testoHtml(v) + "</b>" });
  const cella = (r, v) => (r.tipo === "dettaglio" ? v : forte(v));
  const testa = (r) => [cella(r, r.centro), cella(r, r.pasto)];

  const tabellaGiorno = tabellaHtml({
    colonne: [
      { titolo: "Centro" },
      { titolo: "Pasto" },
      { titolo: "Pasti previsti", allinea: "dx" },
      { titolo: "Presenti trasmessi a MAVI", allinea: "dx" },
    ],
    righe: righe.map((r) => [...testa(r), cella(r, r.previsti), cella(r, r.trasmessi)]),
    vuota: "Nessun centro nel perimetro.",
  });

  const tabellaSettimana = tabellaHtml({
    colonne: [
      { titolo: "Centro" },
      { titolo: "Pasto" },
      ...intestazioni.map((titolo) => ({ titolo, allinea: "dx" })),
      { titolo: "Totale settimana", allinea: "dx" },
    ],
    righe: righe.map((r) => [...testa(r), ...(r.settimana || []).map((n) => cella(r, n)), cella(r, r.totaleSettimana)]),
    vuota: "Nessun centro nel perimetro.",
  });

  const html = paginaDocumento({
    titolo: "Resoconto dei pasti per centro",
    badge: "Resoconto",
    sottotitolo: unisci([struttura, perimetro, etichettaGiorno, generatoIl()]),
    meta: [
      { etichetta: "Perimetro", valore: perimetro || "Tutti i centri" },
      ...numeri,
    ],
    blocchi: [
      blocco("Pasti per centro, " + (etichettaGiorno || "giornata"), tabellaGiorno),
      blocco("Pasti previsti per centro, settimana " + (periodo || ""), tabellaSettimana),
    ],
    note: [
      "Il resoconto non riporta nomi dei pazienti né diete: sono dati sanitari e restano ai referenti "
        + "dei centri. Per controllare le fatture bastano i numeri dei pasti.",
      "Pasti previsti: pazienti che hanno quel pasto nella dieta del giorno. Presenti trasmessi: quelli "
        + "confermati a MAVI dal referente; finché le presenze del centro non sono trasmesse restano a zero.",
    ],
    datiAziendali,
  });

  apriDocumento(html, { nomeFile: "Resoconto_pasti_per_centro.html", avvisa });
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

/* Le due distinte della cucina condividono impaginazione e sezioni: quella del
   giorno ha una colonna per committente, quella della settimana una colonna per
   giornata. In tutte e due la data (o la settimana) e il perimetro del filtro
   stanno nel titolo e nei primi due riquadri: il foglio finisce in cucina
   staccato dallo schermo che lo ha generato, e deve dire da solo a cosa si
   riferisce. */

const SPAZIO_FIRMA = "&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;";

/* diete: [{ nome, committenteNome, reparto, pastiTesto, tipoDieta, note }] — le
   note di preparazione delle persone in elenco, quelle che la cucina deve avere
   sotto gli occhi */
function bloccoDiete(diete = [], titolo = "Diete particolari e consistenze") {
  return blocco(titolo, tabellaHtml({
    colonne: [
      { titolo: "Nominativo" },
      { titolo: "Committente e centro" },
      { titolo: "Pasti" },
      { titolo: "Tipo di dieta" },
      { titolo: "Note di preparazione" },
    ],
    righe: diete.map((d) => [
      d.nome, cellaConNota(d.reparto || "—", d.committenteNome), d.pastiTesto || "—", d.tipoDieta, d.note || "—",
    ]),
    vuota: "Nessuna dieta particolare fra le persone comprese nel perimetro.",
  }));
}

/* variazioni: [{ giorno, committente, centro, pasto, paziente, tipo, testo, autore, inviata, stato }]
   scritte dai referenti; presenza e dieta sono già nelle quantità, Altro no */
function bloccoVariazioni(variazioni = [], { conGiorno = false, titolo = "Variazioni dai centri" } = {}) {
  return blocco(titolo, tabellaHtml({
    colonne: [
      ...(conGiorno ? [{ titolo: "Giorno" }] : []),
      { titolo: "Centro" },
      { titolo: "Pasto" },
      { titolo: "Paziente" },
      { titolo: "Variazione" },
      { titolo: "Stato" },
    ],
    righe: variazioni.map((v) => [
      ...(conGiorno ? [v.giorno] : []),
      cellaConNota(v.centro, v.committente),
      v.pasto,
      v.paziente,
      cellaConNota(v.tipo + ": " + v.testo, "Inviata da " + v.autore + " il " + v.inviata),
      v.stato,
    ]),
    vuota: "Nessuna variazione dai centri per il periodo, il perimetro e il pasto scelti.",
  }) + (variazioni.length
    ? paragrafo("Le variazioni di presenza e di dieta sono già conteggiate nelle quantità; quelle Altro vanno applicate a mano.", { piccolo: true })
    : ""));
}

/* pastiPerCentro: { colonnePasto: ["Pranzo", ...], righe: [riga], totale: riga }
   riga: { committente, centro, referente, perPasto: [n, ...], pasti, confermati, stimati, porzioni, stato } */
function bloccoPastiPerCentro(pastiPerCentro) {
  if (!pastiPerCentro) return "";
  const { colonnePasto = [], righe = [], totale } = pastiPerCentro;
  /* lo stato è già detto da confermati e stimati: una colonna in meno perché la
     tabella stia nella larghezza di un A4 */
  const riga = (r) => [
    r.committente, r.centro, r.referente, ...(r.perPasto || []), r.pasti, r.confermati, r.stimati, r.porzioni,
  ];
  return blocco("Pasti per committente e centro", tabellaHtml({
    colonne: [
      { titolo: "Committente" },
      { titolo: "Centro" },
      { titolo: "Referente" },
      ...colonnePasto.map((titolo) => ({ titolo, allinea: "centro" })),
      { titolo: "Pasti", allinea: "centro" },
      { titolo: "Confermati", allinea: "centro" },
      { titolo: "Stimati", allinea: "centro" },
      { titolo: "Porzioni", allinea: "centro" },
    ],
    righe: righe.map(riga),
    totale: righe.length && totale ? riga(totale) : undefined,
    vuota: "Nessuna destinazione nel perimetro scelto.",
  }));
}

/* Una scheda per destinazione di consegna (l'azienda, oppure un centro della
   comunità), ognuna su una pagina nuova: si stacca e va con il carico.
   destinazione: { titolo, centro, tipo, referente, pasti, confermati, stimati,
     porzioni, perPasto: [{ pasto, pasti }], stato, colonnePasto: ["Pranzo", ...],
     righe: [{ categoria, piatto, colore, nota, perPasto: [n, ...], totale }],
     diete, variazioni } */
function schedaDestinazione(d, etichettaPeriodo) {
  const intestazione = d.centro ? "Centro " + d.centro : d.tipo === "Azienda" ? "Consegna unica" : d.titolo;
  const riquadri = [
    { etichetta: "Periodo", valore: etichettaPeriodo },
    { etichetta: "Referente", valore: d.referente || "—" },
    {
      etichetta: "Pasti",
      valore: (d.colonnePasto || []).length
        ? unisci([d.pasti + " in tutto", ...(d.perPasto || []).map((p) => p.pasto.toLowerCase() + " " + p.pasti)])
        : d.pasti,
    },
    { etichetta: "Porzioni", valore: d.porzioni },
    { etichetta: "Stato", valore: d.stimati > 0 ? d.stato + " (" + d.confermati + " confermati, " + d.stimati + " stimati)" : d.stato },
  ];
  const colonnePasto = d.colonnePasto || [];
  const righe = d.righe || [];
  const tabella = tabellaHtml({
    colonne: [
      { titolo: "Portata" },
      { titolo: "Piatto" },
      { titolo: "Colore" },
      ...colonnePasto.map((titolo) => ({ titolo, allinea: "centro" })),
      { titolo: "Porzioni", allinea: "centro" },
    ],
    righe: righe.map((r) => [
      r.categoria,
      r.nota ? cellaConNota(r.piatto, r.nota) : r.piatto,
      r.colore || "—",
      ...colonnePasto.map((_, i) => (r.perPasto || [])[i] || 0),
      r.totale,
    ]),
    totale: righe.length
      ? ["TOTALE", "", "", ...colonnePasto.map((_, i) => righe.reduce((s, r) => s + ((r.perPasto || [])[i] || 0), 0)),
        righe.reduce((s, r) => s + (Number(r.totale) || 0), 0)]
      : undefined,
    vuota: "Nessun pasto per questa destinazione nel periodo e nel pasto scelti.",
  });
  return `<div style="break-before:page;page-break-before:always"></div>`
    + `<section class="doc-blocco"><h2>Scheda di consegna · ${testoHtml(d.titolo)}</h2>`
    + `<p class="doc-titolo">${testoHtml(intestazione)}</p>`
    + `<div class="doc-meta">${riquadri.map((m) =>
      `<div class="doc-meta-voce"><label>${testoHtml(m.etichetta)}</label><span>${testoHtml(m.valore)}</span></div>`).join("")}</div>`
    + tabella + `</section>`
    + ((d.diete || []).length ? bloccoDiete(d.diete, "Diete particolari di questa destinazione") : "")
    + ((d.variazioni || []).length ? bloccoVariazioni(d.variazioni, { titolo: "Variazioni di questo centro" }) : "");
}

function bloccoFirma() {
  return blocco("Note di lavorazione e firma", tabellaHtml({
    colonne: [{ titolo: "Note della cucina" }, { titolo: "Firma del responsabile di produzione" }],
    righe: [[{ html: SPAZIO_FIRMA }, { html: SPAZIO_FIRMA }]],
  }));
}

/* una sezione per categoria di portata; `chiave` dice da quale array della riga
   leggere le colonne intermedie (`perStruttura` o `perGiorno`) */
function sezioniDistinta(sezioni, intestazioni, chiave) {
  const colonne = [
    { titolo: "Piatto" },
    { titolo: "Colore" },
    ...intestazioni.map((titolo) => ({ titolo, allinea: "centro" })),
    { titolo: "Porzioni", allinea: "centro" },
  ];
  return sezioni.map((sez) => {
    const righe = sez.righe || [];
    const totaleSezione = righe.reduce((s, r) => s + (Number(r.totale) || 0), 0);
    return blocco(sez.categoria, tabellaHtml({
      colonne,
      righe: righe.map((r) => [
        r.nota ? cellaConNota(r.piatto, r.nota) : r.piatto,
        r.colore || "—",
        ...intestazioni.map((_, i) => (r[chiave] || [])[i] || 0),
        r.totale,
      ]),
      totale: righe.length
        ? ["TOTALE " + String(sez.categoria).toUpperCase(), "", ...intestazioni.map(() => ""), totaleSezione]
        : undefined,
      vuota: "Nessuna porzione da produrre in questa categoria.",
    }));
  });
}

const porzioniDi = (sezioni) => sezioni.reduce((s, sez) =>
  s + (sez.righe || []).reduce((x, r) => x + (Number(r.totale) || 0), 0), 0);

/* Distinta di una sola giornata.
   giorno:         data ISO o Date della giornata guardata, finisce nel titolo
   perimetro:      testo del filtro applicato (struttura, tipo, pasto)
   strutture:      [nome, ...] — le colonne per committente, [] con un filtro singolo
   sezioni:        [{ categoria, righe: [{ piatto, colore, nota, perStruttura: [n, ...], totale }] }]
   totali:         [{ etichetta, valore }] — riquadri dopo giornata e perimetro
   pastiPerCentro: vedi bloccoPastiPerCentro
   destinazioni:   una scheda per destinazione, vedi schedaDestinazione
   variazioni:     vedi bloccoVariazioni
   diete:          vedi bloccoDiete
   Ordine: riepilogo totale per piatto, pasti per committente e centro,
   variazioni, diete, firma; poi le schede per destinazione, una per pagina. */
export function generaDistintaPDF({
  giorno, perimetro, strutture = [], sezioni = [], totali = [], pastiPerCentro, destinazioni = [], variazioni = [],
  diete = [], datiAziendali, avvisa,
}) {
  const etichettaGiorno = giorno ? giornoDataIt(giorno) : "";
  const complessivo = porzioniDi(sezioni);
  const blocchi = sezioniDistinta(sezioni, strutture, "perStruttura");

  const html = paginaDocumento({
    titolo: unisci(["Distinta di produzione", etichettaGiorno]),
    badge: "Produzione",
    sottotitolo: unisci([perimetro, generatoIl()]),
    meta: [
      { etichetta: "Giornata", valore: etichettaGiorno || "—" },
      { etichetta: "Perimetro", valore: perimetro || "Tutte le strutture" },
      ...totali,
    ],
    blocchi: [
      paragrafo("Riepilogo totale per piatto: quanto produrre in tutto. Il dettaglio per committente e centro è nelle schede di consegna in fondo, una per pagina.", { piccolo: true }),
      ...(blocchi.length ? blocchi : [paragrafo("Nessuna porzione da produrre in questa giornata con il perimetro scelto.")]),
      riepilogoTotali([{ etichetta: "Porzioni totali da produrre", valore: complessivo, forte: true }]),
      bloccoPastiPerCentro(pastiPerCentro),
      bloccoVariazioni(variazioni),
      bloccoDiete(diete),
      bloccoFirma(),
      ...destinazioni.map((d) => schedaDestinazione(d, etichettaGiorno)),
    ],
    note: "Documento di lavoro della cucina, valido per la sola giornata indicata in testa. Le "
      + "quantità sommano i contributi delle strutture comprese nel perimetro: quelle ancora non "
      + "confermate sono stime del portale e vanno confermate dal committente prima della produzione. "
      + "Le variazioni di presenza e di dieta sono già conteggiate nelle quantità; quelle Altro vanno applicate a mano.",
    datiAziendali,
  });

  return apriDocumento(html, { nomeFile: "Distinta_di_produzione.html", avvisa });
}

/* Gemella della precedente sulla settimana: stessa struttura, ma le colonne
   intermedie sono le giornate invece dei committenti.
   periodo:  "Settimana dal 14/09 al 18/09/2026", finisce nel titolo
   giorni:   [etichetta, ...] — le colonne, da lunedì a domenica
   sezioni:  [{ categoria, righe: [{ piatto, colore, nota, perGiorno: [n, ...], totale }] }]
   pastiPerCentro, destinazioni, variazioni, diete: come la distinta del giorno,
   sommati sulla settimana */
export function generaDistintaSettimanaPDF({
  periodo, perimetro, giorni = [], sezioni = [], totali = [], pastiPerCentro, destinazioni = [], variazioni = [],
  diete = [], datiAziendali, avvisa,
}) {
  const complessivo = porzioniDi(sezioni);
  const blocchi = sezioniDistinta(sezioni, giorni, "perGiorno");

  const html = paginaDocumento({
    titolo: unisci(["Distinta di produzione", periodo]),
    badge: "Produzione settimana",
    sottotitolo: unisci([perimetro, generatoIl()]),
    meta: [
      { etichetta: "Settimana", valore: periodo || "—" },
      { etichetta: "Perimetro", valore: perimetro || "Tutte le strutture" },
      ...totali,
    ],
    blocchi: [
      paragrafo("Riepilogo totale per piatto, giornata per giornata. Il dettaglio per committente e centro è nelle schede di consegna in fondo, con i totali della settimana.", { piccolo: true }),
      ...(blocchi.length ? blocchi : [paragrafo("Nessuna porzione da produrre in questa settimana con il perimetro scelto.")]),
      riepilogoTotali([{ etichetta: "Porzioni totali della settimana", valore: complessivo, forte: true }]),
      bloccoPastiPerCentro(pastiPerCentro),
      bloccoVariazioni(variazioni, { conGiorno: true }),
      bloccoDiete(diete),
      bloccoFirma(),
      ...destinazioni.map((d) => schedaDestinazione(d, periodo)),
    ],
    note: "Prospetto settimanale della cucina: serve a programmare acquisti e lavorazioni, non "
      + "sostituisce la distinta del giorno, che resta il documento da portare in produzione. Le "
      + "giornate non ancora confermate dai committenti sono stime del portale. Le variazioni di "
      + "presenza e di dieta sono già conteggiate nelle quantità; quelle Altro vanno applicate a mano.",
    datiAziendali,
  });

  return apriDocumento(html, { nomeFile: "Distinta_di_produzione_settimana.html", avvisa });
}

/* ==================== dipendente, riepilogo delle prenotazioni ==================== */

/* Solo il riepilogo dell'ordine (Filippo, 15 settembre 2026): il dipendente
   e, sotto ogni giorno ancora aperto, il pasto scelto. Niente tabelle né
   conteggi: il resoconto dettagliato è quello della cucina.
   righe: [{ giorno: "Giovedì 17 settembre", portate: [nome, ...], confermato }] */
export function generaRiepilogoPrenotazioniPDF({ dipendente, committente, righe = [], datiAziendali, avvisa }) {
  const giorni = righe.map((r) => blocco(r.giorno, (r.portate || []).length
    ? elenco(r.portate) + (r.confermato ? "" : paragrafo("Scelto ma non ancora confermato", { piccolo: true }))
    : paragrafo("Nessuna prenotazione", { piccolo: true })));

  const html = paginaDocumento({
    titolo: dipendente,
    badge: "Il mio ordine",
    sottotitolo: unisci([committente, generatoIl()]),
    blocchi: giorni.length ? giorni : [paragrafo("Nessun giorno ancora aperto agli ordini.")],
    note: "Si prenota e si disdice fino alle 14:00 del giorno precedente.",
    datiAziendali,
  });

  apriDocumento(html, { nomeFile: "Riepilogo_prenotazioni.html", avvisa });
}
