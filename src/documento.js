/* documento.js — impaginazione condivisa dei documenti stampabili del portale
   (proforma, manifesto di consegna, scheda prodotto). Nessun JSX, nessuna
   dipendenza: sono stringhe HTML scritte in una nuova scheda.

   Uso tipico dentro un gestore di click:

     import { paginaDocumento, tabellaHtml, apriDocumento } from "../documento.js";

     const html = paginaDocumento({
       titolo: "Manifesto di consegna",
       badge: "Riservato al fornitore",
       sottotitolo: "Rossi Manifatture Spa · mercoledì, pranzo",
       meta: [{ etichetta: "Pasto", valore: "Pranzo" }],
       blocchi: [tabellaHtml({ colonne, righe })],
       note: "Testo facoltativo in fondo",
       piede: "Riga finale del documento",
       datiAziendali: st.datiAziendali,
     });
     apriDocumento(html, { nomeFile: "Manifesto.html", avvisa: st.avvisa });

   Due regole importanti:

   1. Ogni valore passa da `testoHtml`, perché i dati arrivano dall'anagrafica e
      dal catalogo, modificabili dal portale (vedi «HTML composto come stringa»
      in file.md/11-convenzioni.md). Fanno eccezione i `blocchi` di
      `paginaDocumento` e le celle nella forma `{ html: "..." }`, che sono HTML
      già composto dai moduli documento (questo file, `proforma.js`,
      `manifesto.js`) a partire da pezzi già passati da `testoHtml`.
   2. `apriDocumento` va chiamata dentro il gesto dell'utente, quindi i moduli
      documento si importano in modo statico: un `await import(...)` prima
      dell'apertura fa perdere il gesto e il browser blocca la scheda. */

export const testoHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* accetta Date, stringa ISO (`2026-09-15`) o qualsiasi cosa che Date sappia
   leggere; le date ISO si costruiscono a mano per non farle slittare di un
   giorno quando il fuso è a ovest di Greenwich */
function aData(d) {
  if (d instanceof Date && !Number.isNaN(d.getTime())) return d;
  if (typeof d === "string") {
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    const libera = new Date(d);
    if (!Number.isNaN(libera.getTime())) return libera;
  }
  return new Date();
}

/* 15/09/2026 */
export function dataIt(d) {
  return aData(d).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* MARTEDÌ - 15/09/2026 */
export function giornoDataIt(d) {
  const x = aData(d);
  return x.toLocaleDateString("it-IT", { weekday: "long" }).toUpperCase() + " - " + dataIt(x);
}

/* 1.234,56 — senza simbolo, il simbolo lo mette il documento */
export function eur(n) {
  const x = Number(n);
  return (Number.isFinite(x) ? x : 0).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* valore compilato, oppure segnaposto in corsivo terracotta: in demo si vede
   subito cosa manca nella Gestione portale */
export function campo(valore, segnaposto) {
  const v = String(valore ?? "").trim();
  return v ? testoHtml(v) : `<span class="ph">[${testoHtml(segnaposto)}]</span>`;
}

/* blocco mittente, usato nella testata di ogni documento: è il "Da" */
export function intestazioneMavi(datiAziendali) {
  const d = datiAziendali || {};
  const fiscali = [d.piva && "P.IVA " + d.piva, d.cf && "C.F. " + d.cf].filter(Boolean).join(" · ");
  const contatti = [d.telefono, d.email].filter(Boolean).join(" · ");
  return `<div class="doc-mittente">`
    + `<strong>${campo(d.ragioneSociale, "Ragione sociale MAVI")}</strong>`
    + `${campo(d.indirizzo, "Indirizzo sede legale")}<br>`
    + `${fiscali ? testoHtml(fiscali) : `<span class="ph">[P.IVA / Codice fiscale]</span>`}<br>`
    + `${contatti ? testoHtml(contatti) : `<span class="ph">[Telefono] · [Email]</span>`}<br>`
    + `${d.pec ? "PEC " + testoHtml(d.pec) : `<span class="ph">[PEC]</span>`}`
    + `</div>`;
}

const ALLINEA = { sx: "a-sx", centro: "a-centro", dx: "a-dx" };

/* una cella è un valore qualsiasi (va da testoHtml) oppure { html } già pronto */
function cella(v) {
  return v && typeof v === "object" && "html" in v ? String(v.html) : testoHtml(v);
}

/* cella su due righe: valore principale e, sotto, una nota in grigio piccolo */
export function cellaConNota(principale, nota) {
  const n = String(nota ?? "").trim();
  return { html: testoHtml(principale) + (n ? `<span class="doc-cella-nota">${testoHtml(n)}</span>` : "") };
}

/* colonne: [{ titolo, allinea: "sx" | "centro" | "dx" }]
   righe:   [[cella, ...], ...]
   totale:  [cella, ...] facoltativo, ultima riga evidenziata
   vuota:   testo mostrato quando `righe` è vuoto */
export function tabellaHtml({ colonne = [], righe = [], totale, vuota = "Nessuna riga da mostrare." }) {
  const classi = colonne.map((c) => ALLINEA[c.allinea] || ALLINEA.sx);
  const cl = (i) => classi[i] || ALLINEA.sx;
  const testa = colonne.map((c, i) => `<th class="${cl(i)}">${testoHtml(c.titolo)}</th>`).join("");
  const corpo = righe.length
    ? righe.map((r) => `<tr>${r.map((v, i) => `<td class="${cl(i)}">${cella(v)}</td>`).join("")}</tr>`).join("")
    : `<tr class="doc-vuota"><td colspan="${colonne.length || 1}">${testoHtml(vuota)}</td></tr>`;
  const chiusura = Array.isArray(totale) && totale.length
    ? `<tr class="doc-totale">${totale.map((v, i) => `<td class="${cl(i)}">${cella(v)}</td>`).join("")}</tr>`
    : "";
  return `<table class="doc-tabella"><thead><tr>${testa}</tr></thead><tbody>${corpo}${chiusura}</tbody></table>`;
}

/* riquadro dei totali allineato a destra.
   voci: [{ etichetta, valore, forte }] — `forte` evidenzia la riga in terracotta */
export function riepilogoTotali(voci = []) {
  const righe = voci.map((v) =>
    `<tr${v.forte ? ` class="forte"` : ""}><td>${testoHtml(v.etichetta)}</td><td>${cella(v.valore)}</td></tr>`
  ).join("");
  return `<div class="doc-totali"><table>${righe}</table></div>`;
}

/* sezione con titoletto; `html` è già HTML (di solito il ritorno di un helper) */
export function blocco(titolo, html) {
  return `<section class="doc-blocco">${titolo ? `<h2>${testoHtml(titolo)}</h2>` : ""}${html || ""}</section>`;
}

/* capoverso di testo del documento */
export function paragrafo(testo, { piccolo } = {}) {
  return `<p class="doc-testo${piccolo ? " piccolo" : ""}">${cella(testo)}</p>`;
}

/* elenco puntato; ogni riga è una cella oppure { etichetta, valore } per la
   forma "sigla in grassetto più descrizione" (allergeni, marcatori) */
export function elenco(righe = []) {
  const voci = righe.map((r) => {
    if (r && typeof r === "object" && "etichetta" in r) {
      return `<li><b>${testoHtml(r.etichetta)}</b> ${testoHtml(r.valore)}</li>`;
    }
    return `<li>${cella(r)}</li>`;
  }).join("");
  return `<ul class="doc-elenco">${voci}</ul>`;
}

/* elenco degli ordini di un gruppo di persone: il nome e, sotto, il pasto.
   È il riepilogo del referente aziendale, pensato da leggere a colpo d'occhio.
   voci: [{ nome, nota, pasto }] — `nota` accanto al nome (il reparto) */
export function elencoOrdini(voci = []) {
  const righe = voci.map((v) => `<div class="doc-ordine">`
    + `<div class="doc-ordine-nome">${testoHtml(v.nome)}${v.nota ? `<span>${testoHtml(v.nota)}</span>` : ""}</div>`
    + `<div class="doc-ordine-pasto">${testoHtml(v.pasto)}</div></div>`).join("");
  return `<div class="doc-ordini">${righe}</div>`;
}

/* elenco dei pasti nominativi: una persona sotto l'altra, in colonna unica.
   Per ogni persona il nome, il pasto scritto per esteso una portata per riga e,
   se ci sono, le allergie dichiarate. È il manifesto di consegna del cassone
   termico, che leggono sia la cucina sia il referente dell'azienda. Ogni
   persona sta dentro il suo riquadro, in colonna unica: le colonne affiancate
   rendevano il foglio difficile da scorrere, la cornice no — tiene insieme
   nome e pasto e si vede a colpo d'occhio dove finisce uno e comincia l'altro.
   voci: [{ nome, nota, codice, portate, avviso }]
     nota     — il reparto, accanto al nome
     codice   — la matricola, a destra
     portate  — [{ etichetta, piatto, vuota }], una riga ciascuna
     avviso   — le allergie dichiarate, in fondo. Stringa vuota se non ce ne sono. */
export function elencoPasti(voci = []) {
  if (!voci.length) return "";
  const righe = voci.map((v) => {
    const portate = (v.portate || []).map((p) => `<div class="doc-pasto-portata${p.vuota ? " vuota" : ""}">`
      + `<span class="doc-pasto-et">${testoHtml(p.etichetta)}</span>`
      + `<span class="doc-pasto-piatto">${testoHtml(p.piatto)}</span></div>`).join("");
    return `<div class="doc-pasto">`
      + `<div class="doc-pasto-testa">`
      + `<span class="doc-pasto-nome">${testoHtml(v.nome)}${v.nota ? `<span>${testoHtml(v.nota)}</span>` : ""}</span>`
      + `${v.codice ? `<span class="doc-pasto-codice">${testoHtml(v.codice)}</span>` : ""}</div>`
      + portate
      + `${v.avviso ? `<div class="doc-pasto-avviso">Allergie dichiarate: ${testoHtml(v.avviso)}</div>` : ""}`
      + `</div>`;
  }).join("");
  return `<div class="doc-pasti">${righe}</div>`;
}

/* pastiglie in fila (marcatori, tag di un piatto) */
export function etichette(lista = []) {
  const voci = lista.filter(Boolean).map((t) => `<span class="doc-et">${testoHtml(t)}</span>`).join("");
  return voci ? `<div class="doc-etichette">${voci}</div>` : "";
}

const CSS = `
:root{--terracotta:#b0543a;--scuro:#3c3632;--avorio:#f2ece1;--avorio-chiaro:#faf6ef;--grigio:#e8e0d6;--muto:#8a8078;--testo:#4a433d}
*{margin:0;padding:0;box-sizing:border-box}
@page{size:A4;margin:14mm}
@page{@bottom-right{content:"Pagina " counter(page) " di " counter(pages);font-family:'Segoe UI',Calibri,Arial,sans-serif;font-size:9pt;color:#8a8078}}
html{background:var(--avorio)}
body{font-family:'Segoe UI',Calibri,Arial,sans-serif;color:var(--scuro);font-size:13px;line-height:1.5;background:#fff;max-width:940px;margin:0 auto;padding:38px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.barra{background:var(--terracotta);color:#fff;padding:10px 24px;margin:-38px -38px 30px;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:13px}
.barra button{background:#fff;color:var(--terracotta);border:none;padding:8px 20px;border-radius:4px;font-weight:700;font-size:13px;font-family:inherit;cursor:pointer}
.doc-testa{display:flex;justify-content:space-between;align-items:flex-start;gap:32px;border-bottom:3px solid var(--terracotta);padding-bottom:18px;margin-bottom:24px}
.doc-marchio h1{font-size:34px;color:var(--terracotta);font-weight:800;letter-spacing:-1px;line-height:1}
.doc-marchio p.claim{font-size:9.5px;color:var(--muto);letter-spacing:.16em;text-transform:uppercase;margin-top:3px}
.doc-mittente{font-size:11.5px;color:var(--testo);line-height:1.7;margin-top:12px}
.doc-mittente strong{display:block;font-size:13px;color:var(--scuro)}
.doc-badge{background:var(--terracotta);color:#fff;font-size:15px;font-weight:700;letter-spacing:1.5px;line-height:1.25;text-transform:uppercase;text-align:center;padding:10px 20px;border-radius:4px;max-width:240px}
.ph{color:var(--terracotta);font-style:italic}
.doc-titolo{font-size:23px;font-weight:700;color:var(--scuro);margin-bottom:4px}
.doc-sotto{font-size:12px;color:var(--muto);margin-bottom:22px}
.doc-meta{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:26px;page-break-inside:avoid}
.doc-meta-voce{flex:1 1 150px;background:var(--avorio-chiaro);border:1px solid var(--grigio);border-radius:6px;padding:11px 16px}
.doc-meta-voce label{display:block;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--muto);margin-bottom:4px}
.doc-meta-voce span{font-size:14px;font-weight:700;color:var(--scuro)}
.doc-meta.unariga{justify-content:center;gap:10px}
.doc-meta.unariga .doc-meta-voce{flex:1 1 auto;max-width:100%;text-align:center;padding:9px 18px}
.doc-meta.unariga .doc-meta-voce label{font-size:8.5px;margin-bottom:3px}
.doc-meta.unariga .doc-meta-voce span{display:block;font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap}
.doc-blocco{margin-bottom:24px}
.doc-blocco h2,.doc-note h2{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--terracotta);font-weight:700;margin-bottom:9px;padding-bottom:5px;border-bottom:1px solid var(--grigio);page-break-after:avoid}
.doc-testo{font-size:12.5px;line-height:1.75;color:var(--testo)}
.doc-testo.piccolo{font-size:11px;color:var(--muto)}
.doc-riservato{display:inline-block;background:var(--scuro);color:#fff;padding:7px 15px;border-radius:4px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:18px}
.doc-elenco{list-style:none;font-size:12.5px;line-height:1.8;color:var(--testo)}
.doc-elenco li{padding-left:14px;position:relative;page-break-inside:avoid}
.doc-elenco li::before{content:"·";position:absolute;left:2px;color:var(--terracotta);font-weight:700}
.doc-elenco b{color:var(--scuro)}
.doc-intesta{position:relative}
.doc-timbro{position:absolute;right:14px;top:-26px;transform:rotate(-8deg);border:4px double currentColor;border-radius:8px;padding:8px 22px 7px;text-align:center;background:rgba(255,255,255,.88);pointer-events:none}
.doc-timbro b{display:block;font-size:26px;font-weight:800;letter-spacing:3px;text-transform:uppercase;line-height:1.1}
.doc-timbro span{display:block;font-size:11px;font-weight:600;letter-spacing:.5px;margin-top:2px}
.doc-timbro-ok{color:#2f7a45}.doc-timbro-attesa{color:#b0543a}.doc-timbro-neutro{color:#7a726a}.doc-timbro-errore{color:#9b2c2c}
@media (max-width:640px){.doc-timbro{position:static;transform:none;display:inline-block;margin-bottom:14px}}
.doc-ordini{display:grid;grid-template-columns:1fr 1fr;gap:0 32px;margin-bottom:22px}
.doc-ordine{padding:11px 0;border-bottom:1px solid var(--grigio);page-break-inside:avoid}
.doc-ordine-nome{font-size:13.5px;font-weight:700;color:var(--scuro)}
.doc-ordine-nome span{font-size:10.5px;font-weight:400;color:var(--muto);margin-left:8px}
.doc-ordine-pasto{font-size:12.5px;color:var(--testo);margin-top:3px;line-height:1.5}
@media (max-width:640px){.doc-ordini{grid-template-columns:1fr}}
.doc-pasti{margin-bottom:12px}
.doc-pasto{border:1px solid var(--grigio);border-radius:6px;background:#fff;overflow:hidden;margin-bottom:12px;page-break-inside:avoid}
.doc-pasto:last-child{margin-bottom:0}
.doc-pasto-testa{display:flex;justify-content:space-between;align-items:baseline;gap:14px;background:var(--avorio-chiaro);border-bottom:2px solid var(--terracotta);padding:9px 16px}
.doc-pasto-nome{font-size:16px;font-weight:700;color:var(--scuro);letter-spacing:.01em}
.doc-pasto-nome span{font-size:11px;font-weight:400;color:var(--muto);text-transform:uppercase;letter-spacing:.08em;margin-left:10px}
.doc-pasto-codice{font-size:10.5px;color:var(--muto);letter-spacing:.06em;white-space:nowrap}
.doc-pasto-portata{display:flex;gap:16px;padding:7px 16px;border-bottom:1px dotted var(--grigio)}
.doc-pasto-portata:last-child{border-bottom:none}
.doc-pasto-et{flex:0 0 96px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.11em;color:var(--terracotta);padding-top:4px}
.doc-pasto-piatto{flex:1;font-size:14px;line-height:1.45;color:var(--scuro)}
.doc-pasto-portata.vuota .doc-pasto-piatto{color:var(--muto);font-style:italic}
.doc-pasto-avviso{background:rgba(176,84,58,.09);border-top:1px solid var(--grigio);padding:8px 16px;font-size:12px;font-weight:600;color:var(--terracotta)}
@media (max-width:640px){.doc-pasto-portata{flex-direction:column;gap:0}}
.doc-etichette{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.doc-et{background:var(--avorio-chiaro);border:1px solid var(--grigio);border-radius:4px;padding:3px 9px;font-size:10.5px;color:var(--testo)}
thead{display:table-header-group}
tfoot{display:table-footer-group}
tr{page-break-inside:avoid}
table.doc-tabella{width:100%;border-collapse:collapse;margin-bottom:22px;font-size:12.5px}
.doc-tabella th{background:var(--scuro);color:#fff;padding:9px 14px;font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.doc-tabella td{padding:9px 14px;border-bottom:1px solid var(--grigio);vertical-align:top}
.doc-tabella tbody tr:nth-child(even) td{background:var(--avorio-chiaro)}
.doc-tabella tr.doc-vuota td{padding:18px;text-align:center;color:var(--muto);background:#fff}
.doc-tabella tbody tr.doc-totale td{background:var(--terracotta);color:#fff;font-weight:700;border-bottom:none}
.doc-tabella tbody tr.doc-totale td .doc-cella-nota{color:#fff}
.doc-cella-nota{display:block;font-size:10.5px;color:var(--muto);margin-top:2px}
.a-sx{text-align:left}.a-centro{text-align:center}.a-dx{text-align:right}
.doc-totali{display:flex;justify-content:flex-end;margin-bottom:26px;page-break-inside:avoid}
.doc-totali table{width:330px;border-collapse:collapse}
.doc-totali td{padding:7px 16px;font-size:13px}
.doc-totali td:first-child{color:var(--muto)}
.doc-totali td:last-child{text-align:right;font-weight:600}
.doc-totali tr.forte td{background:var(--terracotta);color:#fff;font-size:15px;font-weight:700}
.doc-totali tr.forte td:first-child{border-radius:4px 0 0 4px}
.doc-totali tr.forte td:last-child{border-radius:0 4px 4px 0}
.doc-note{background:var(--avorio-chiaro);border-radius:6px;padding:16px 20px;margin-bottom:22px;page-break-inside:avoid}
.doc-note p{font-size:11px;line-height:1.8;color:var(--muto)}
.doc-piede{border-top:1px solid var(--grigio);padding-top:14px;text-align:center;font-size:9.5px;color:var(--muto)}
@media print{html{background:#fff}body{max-width:none;padding:0}.no-print{display:none!important}}
@media (max-width:640px){body{padding:20px}.barra{margin:-20px -20px 22px;flex-wrap:wrap}.doc-testa{flex-direction:column}.doc-badge{max-width:none}}
`;

/* pagina A4 completa: testata MAVI con mittente e badge, titolo, riquadri
   `meta`, `blocchi` (HTML già pronto), note e piede.
   meta:    [{ etichetta, valore }] — `valore` è una cella
   metaUnaRiga: riquadri con il valore in maiuscolo, centrato e su una riga
            sola, con il box che si allarga sul contenuto invece di avere una
            base fissa. La usa il manifesto di consegna: "Rossi Manifatture
            Spa" andava a capo dentro il riquadro
   blocchi: [stringa HTML]
   note:    stringa o array di stringhe, un capoverso ciascuna
   timbro:  { testo, sotto, tono: "ok" | "attesa" | "neutro" | "errore" }, facoltativo:
            un timbro inclinato accanto al titolo, che resta anche in stampa */
export function paginaDocumento({ titolo, badge, sottotitolo, meta = [], blocchi = [], note, piede, datiAziendali, timbro, metaUnaRiga }) {
  const riquadri = meta.length
    ? `<div class="doc-meta${metaUnaRiga ? " unariga" : ""}">${meta.map((m) =>
      `<div class="doc-meta-voce"><label>${testoHtml(m.etichetta)}</label><span>${cella(m.valore)}</span></div>`
    ).join("")}</div>`
    : "";
  const capoversi = note == null || note === "" ? [] : Array.isArray(note) ? note.filter(Boolean) : [note];
  const bloccoNote = capoversi.length
    ? `<div class="doc-note"><h2>Note</h2>${capoversi.map((t) => `<p>${cella(t)}</p>`).join("")}</div>`
    : "";
  return `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${testoHtml(titolo)}</title>
<style>${CSS}</style></head><body>
<div class="barra no-print">
  <span>Anteprima del documento — usa il pulsante oppure Ctrl+P per stampare o salvare in PDF</span>
  <button type="button" onclick="window.print()">Stampa / Salva PDF</button>
</div>
<header class="doc-testa">
  <div class="doc-marchio">
    <h1>MAVI</h1>
    <p class="claim">Ristorazione collettiva</p>
    ${intestazioneMavi(datiAziendali)}
  </div>
  ${badge ? `<div class="doc-badge">${testoHtml(badge)}</div>` : ""}
</header>
<div class="doc-intesta">
${timbro ? `<div class="doc-timbro doc-timbro-${testoHtml(timbro.tono || "neutro")}"><b>${testoHtml(timbro.testo)}</b>${timbro.sotto ? `<span>${testoHtml(timbro.sotto)}</span>` : ""}</div>` : ""}
<h2 class="doc-titolo">${testoHtml(titolo)}</h2>
${sottotitolo ? `<p class="doc-sotto">${cella(sottotitolo)}</p>` : ""}
</div>
${riquadri}
${blocchi.filter(Boolean).join("\n")}
${bloccoNote}
<div class="doc-piede">${piede ? testoHtml(piede) : "Documento generato dal portale MAVI Ristorazione il " + dataIt(new Date())}</div>
</body></html>`;
}

/* apre il documento in una nuova scheda. Va chiamata dentro il gesto
   dell'utente: se il browser blocca la finestra, avvisa nel portale e ripiega
   sul download del file .html. Ritorna true se la scheda si è aperta. */
export function apriDocumento(html, { nomeFile = "Documento_MAVI.html", avvisa } = {}) {
  const scheda = window.open("about:blank", "_blank");
  if (scheda) {
    scheda.document.open();
    scheda.document.write(html);
    scheda.document.close();
    return true;
  }
  if (typeof avvisa === "function") avvisa("Il browser ha bloccato la finestra: consenti i popup per stampare");
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return false;
}
