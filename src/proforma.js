/* proforma.js — proforma stampabile, aperta in una nuova scheda.
   Impaginazione e regole di escape stanno in documento.js. */

import {
  metodoPagamento, regimeIva, scadenzaPagamento, terminiPagamento, totaliProforma,
} from "./data.js";
import {
  apriDocumento, blocco, campo, dataIt, eur, paginaDocumento,
  paragrafo, riepilogoTotali, tabellaHtml, testoHtml,
} from "./documento.js";

/* proforma: il documento di `st.proforme`, con righe e condizioni già
   congelate al momento dell'emissione (vedi `emettiProforma` in store.jsx).
   opzioni: { datiAziendali, committente, avvisa } — mittente dalla Gestione
   portale, anagrafica del destinatario dal committente, avviso del portale. */
export function generaProformaPDF(proforma, opzioni = {}) {
  const { datiAziendali, committente, avvisa } = opzioni;
  const d = datiAziendali || {};
  const c = committente || {};
  const p = proforma || {};

  const totali = totaliProforma(p);
  const termini = terminiPagamento(p.termini);
  const metodo = metodoPagamento(p.metodoPagamento);
  const regime = regimeIva(p.regimeIva);
  const annullata = p.stato === "annullata";

  const numDoc = p.numero || "Proforma";
  const periodo = p.periodo || "—";
  const emissione = dataIt(p.dataEmissione);
  const scadenza = dataIt(p.scadenza || scadenzaPagamento(p.dataEmissione, p.termini));

  const tabella = tabellaHtml({
    colonne: [
      { titolo: "Descrizione" },
      { titolo: "Quantità", allinea: "centro" },
      { titolo: "Prezzo unit.", allinea: "dx" },
      { titolo: "Importo", allinea: "dx" },
    ],
    righe: (p.righe || []).map((r) => [
      r.descrizione || "—",
      Number(r.quantita) || 0,
      "€ " + eur(r.prezzo),
      "€ " + eur((Number(r.quantita) || 0) * (Number(r.prezzo) || 0)),
    ]),
    totale: ["Totale imponibile", totali.quantita, "", "€ " + eur(totali.imponibile)],
    vuota: "Nessuna riga nella proforma.",
  });

  const fiscali = [c.piva && "P.IVA " + c.piva, c.cf && "C.F. " + c.cf].filter(Boolean).join(" · ");
  const elettronica = [c.pec && "PEC " + c.pec, c.codiceSdi && "Codice SDI " + c.codiceSdi].filter(Boolean).join(" · ");
  const contatti = [c.referente, c.email].filter(Boolean).join(" · ");
  const destinatario = blocco("Destinatario", `<div class="doc-mittente">`
    + `<strong>${campo(c.nome, "Ragione sociale committente")}</strong>`
    + `${campo(c.indirizzo, "Indirizzo committente")}<br>`
    + `${fiscali ? testoHtml(fiscali) : `<span class="ph">[P.IVA / Codice fiscale]</span>`}<br>`
    + `${elettronica ? testoHtml(elettronica) : `<span class="ph">[PEC / Codice SDI]</span>`}<br>`
    + `${contatti ? testoHtml(contatti) : `<span class="ph">[Referente / Email]</span>`}`
    + `</div>`);

  const condizioni = blocco("Condizioni di pagamento",
    paragrafo({
      html: `<b>Termini</b> ${testoHtml(termini.nome)}, scadenza ${testoHtml(scadenza)}<br>`
        + `<b>Metodo</b> ${testoHtml(metodo.nome)}`
        + (metodo.conIban ? `<br><b>IBAN</b> ` + campo(d.iban, "IT00 X000 0000 0000 0000 0000 000") : ""),
    })
    + (totali.conIva ? "" : paragrafo({
      html: `<b>Regime IVA</b> ` + campo(p.dicituraIva || regime.dicitura, "Dicitura di esenzione IVA"),
    }))
    + paragrafo(
      "Documento proforma non fiscalmente rilevante ai sensi del DPR 633/72. "
      + "La fattura elettronica verrà emessa dal gestionale contabile e trasmessa al Sistema di Interscambio.",
      { piccolo: true }
    ));

  const note = [
    annullata ? "Documento annullato: resta agli atti per tracciabilità e non è più esigibile." : null,
    p.note,
    d.noteProforma,
    "I dati in corsivo terracotta sono segnaposto, da compilare in Cucina MAVI › Gestione portale prima della messa in produzione.",
  ].filter(Boolean);

  const html = paginaDocumento({
    titolo: "Proforma " + numDoc,
    badge: annullata ? "Proforma annullata" : "Proforma",
    sottotitolo: "Riepilogo dei pasti erogati nel periodo " + periodo,
    meta: [
      { etichetta: "Documento n.", valore: numDoc },
      { etichetta: "Data emissione", valore: emissione },
      { etichetta: "Periodo", valore: periodo },
      { etichetta: "Scadenza", valore: scadenza },
    ],
    blocchi: [
      destinatario,
      tabella,
      riepilogoTotali([
        { etichetta: "Imponibile", valore: "€ " + eur(totali.imponibile) },
        {
          etichetta: totali.conIva ? "IVA " + String(totali.aliquota).replace(".", ",") + "%" : "IVA",
          valore: "€ " + eur(totali.iva),
        },
        { etichetta: "Totale documento", valore: "€ " + eur(totali.totale), forte: true },
      ]),
      condizioni,
    ],
    note,
    piede: "Documento generato dal portale MAVI Ristorazione il " + dataIt(new Date()),
    datiAziendali,
  });

  apriDocumento(html, { nomeFile: "Proforma_" + numDoc.replace(/[^A-Za-z0-9]+/g, "_") + ".html", avvisa });
}
