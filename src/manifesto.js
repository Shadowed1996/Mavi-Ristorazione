/* manifesto.js — manifesto nominativo di consegna, stampabile, per il cassone
   termico dell'azienda. Documento riservato al fornitore: mostra chi ha
   ordinato cosa, cosa che le etichette pasto dell'azienda deliberatamente
   nascondono (sono anonime, raggruppate per piatto). Non va mai esposto al
   cliente o al dipendente.
   È il resoconto dettagliato della cucina (Filippo, 15 settembre 2026): il
   riepilogo del dipendente resta volutamente semplice, questo no.
   Impaginazione e regole di escape stanno in documento.js. */

import { ALLERGENI, GIORNI, PIATTI } from "./data.js";
import { blocco, cellaConNota, dataIt, generaElencoNominativo, giornoDataIt, tabellaHtml } from "./documento.js";

const PORTATE = [
  { id: "primo", nome: "Primo" },
  { id: "unico", nome: "Piatto unico" },
  { id: "secondo", nome: "Secondo" },
  { id: "contorno", nome: "Contorno" },
];

const idDaNome = (nome) => {
  const chiave = String(nome || "").trim().toLowerCase();
  return Object.keys(PIATTI).find((id) => PIATTI[id].n.trim().toLowerCase() === chiave) || "";
};
const allergeniDelPiatto = (nome) => {
  const id = idDaNome(nome);
  return id ? (PIATTI[id].a || []).map((c) => ALLERGENI[c]).filter(Boolean) : [];
};

/* righe: st.nominativiAzienda, l'elenco completo di tutte le giornate, con in
   più per riga `dieta` ({ tipoDieta, note } o null) e `allergeni` (dichiarati
   dal dipendente). Il manifesto è di una consegna sola, quindi qui si filtra su
   `indiceGiorno`: in cassone finisce il foglio di quel giorno. */
export function generaManifestoConsegna({ struttura, indiceGiorno, pasto = "pranzo", righe = [], datiAziendali, avvisa }) {
  const g = GIORNI[indiceGiorno];
  const delGiorno = righe
    .filter((r) => r.indiceGiorno === indiceGiorno)
    .sort((a, b) => String(a.reparto || "").localeCompare(String(b.reparto || ""), "it") || a.nome.localeCompare(b.nome, "it"));
  const oggi = dataIt(new Date());
  const ora = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  /* totale per piatto: quante porzioni preparare, con gli allergeni del catalogo */
  const conteggio = new Map();
  delGiorno.forEach((r) => PORTATE.forEach((p) => {
    const nome = String(r[p.id] || "").trim();
    if (!nome || nome === "—") return;
    const chiave = p.id + "|" + nome.toLowerCase();
    const voce = conteggio.get(chiave) || { portata: p, nome, porzioni: 0 };
    voce.porzioni += 1;
    conteggio.set(chiave, voce);
  }));
  const voci = [...conteggio.values()].sort((a, b) =>
    PORTATE.indexOf(a.portata) - PORTATE.indexOf(b.portata) || b.porzioni - a.porzioni || a.nome.localeCompare(b.nome, "it"));
  const porzioni = voci.reduce((s, v) => s + v.porzioni, 0);

  const totalePerPiatto = blocco("Totale per piatto", tabellaHtml({
    colonne: [{ titolo: "Portata" }, { titolo: "Piatto" }, { titolo: "Allergeni" }, { titolo: "Porzioni", allinea: "dx" }],
    righe: voci.map((v) => [
      v.portata.nome,
      cellaConNota(v.nome, idDaNome(v.nome) ? "" : "fuori catalogo, allergeni da verificare"),
      allergeniDelPiatto(v.nome).join(", ") || "—",
      String(v.porzioni),
    ]),
    totale: ["Totale", delGiorno.length + (delGiorno.length === 1 ? " pasto" : " pasti"), "", String(porzioni)],
    vuota: "Nessun piatto ordinato per questa giornata.",
  }));

  const conAttenzioni = delGiorno.filter((r) => r.dieta || (r.allergeni || []).length).length;
  /* dieta in chiaro, sotto le note e le allergie dichiarate */
  const cellaDieta = (r) => {
    const allergie = r.allergeni || [];
    if (!r.dieta && !allergie.length) return "—";
    const titolo = r.dieta ? r.dieta.tipoDieta : "Allergie dichiarate";
    const nota = [
      r.dieta && r.dieta.note,
      allergie.length ? (r.dieta ? "allergie: " : "") + allergie.join(", ") : "",
    ].filter(Boolean).join(" · ");
    return cellaConNota(titolo, nota);
  };

  return generaElencoNominativo({
    titolo: "Manifesto di consegna",
    badge: "Riservato al fornitore",
    sottotitolo: [struttura, [g ? giornoDataIt(g.data) : "", pasto].filter(Boolean).join(", "),
      "generato il " + oggi + " alle " + ora].filter(Boolean).join(" · "),
    meta: [
      { etichetta: "Struttura", valore: struttura },
      { etichetta: "Giornata", valore: g ? giornoDataIt(g.data) : "—" },
      { etichetta: "Pasto", valore: pasto },
      { etichetta: "Pasti", valore: delGiorno.length },
      { etichetta: "Porzioni", valore: porzioni },
      { etichetta: "Con dieta o allergie", valore: conAttenzioni },
    ],
    colonne: [
      { titolo: "Matricola" }, { titolo: "Dipendente" }, { titolo: "Primo" }, { titolo: "Secondo" },
      { titolo: "Contorno" }, { titolo: "Dieta e allergie" },
    ],
    righe: delGiorno.map((r) => [
      r.matricola || "—",
      cellaConNota(r.nome, r.reparto),
      r.unico ? cellaConNota(r.unico, "piatto unico") : (r.primo || "—"),
      r.unico ? "—" : (r.secondo || "—"),
      r.unico ? "—" : (r.contorno || "—"),
      cellaDieta(r),
    ]),
    totale: ["", delGiorno.length + (delGiorno.length === 1 ? " pasto" : " pasti"), "", "", "", conAttenzioni ? conAttenzioni + " con attenzioni" : ""],
    vuota: "Nessun ordine nominativo per questa giornata.",
    blocchiPrima: [
      `<p class="doc-riservato">Riservato al fornitore — non esporre al cliente</p>`,
      totalePerPiatto,
      blocco("Dettaglio per dipendente, per reparto", ""),
    ],
    piede: "Da inserire nel cassone termico in consegna. Le etichette pasto in cucina restano anonime: "
      + "questo foglio è l'unico documento nominativo, ad uso esclusivo del fornitore per la distribuzione in azienda. "
      + "Le diete con prescrizione medica restano riservate: il portale segnala che esistono, non cosa contengono.",
    nomeFile: "Manifesto_consegna.html",
    datiAziendali,
    avvisa,
  });
}
