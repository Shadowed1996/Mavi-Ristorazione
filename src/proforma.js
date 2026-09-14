/* proforma.js — proforma stampabile, aperta in una nuova scheda.
   Impaginazione e regole di escape stanno in documento.js. */

import {
  apriDocumento, blocco, campo, cellaConNota, dataIt, eur, paginaDocumento,
  paragrafo, riepilogoTotali, tabellaHtml, testoHtml,
} from "./documento.js";

/* strutture: [{ nome, tipo, mese, pasti, prezzo, ivaPercentuale }]. `prezzo`
   e `ivaPercentuale` sono per riga, così ogni committente può avere un
   listino diverso; prezzoUnitarioDefault resta come ripiego per chi chiama
   con un solo prezzo per tutte le righe (compatibilità con le fatture di
   RSA, comunità e scuola generate dal loro portale).
   opzioni: { datiAziendali, avvisa } — i dati del mittente compilati in
   Cucina MAVI › Gestione portale e la funzione di avviso del portale. */
export function generaProformaPDF(strutture, prezzoUnitarioDefault, opzioni = {}) {
  const { datiAziendali, avvisa } = opzioni;
  const d = datiAziendali || {};

  const righeCalc = strutture.map((s) => {
    const prezzo = s.prezzo ?? prezzoUnitarioDefault ?? 0;
    const iva = s.ivaPercentuale ?? 10;
    const imponibileRiga = s.pasti * prezzo;
    return { ...s, prezzo, ivaPercentuale: iva, imponibileRiga, ivaRiga: imponibileRiga * (iva / 100) };
  });
  const totPasti = righeCalc.reduce((s, r) => s + r.pasti, 0);
  const imponibile = righeCalc.reduce((s, r) => s + r.imponibileRiga, 0);
  const iva = righeCalc.reduce((s, r) => s + r.ivaRiga, 0);
  const totale = imponibile + iva;
  const ivaMedia = imponibile > 0 ? Math.round((iva / imponibile) * 1000) / 10 : (righeCalc[0]?.ivaPercentuale ?? 10);

  const numDoc = "PRO-2026/" + String(Math.floor(Math.random() * 900) + 100);
  const oggi = dataIt(new Date());
  const periodo = [...new Set(righeCalc.map((s) => s.mese).filter(Boolean))].join(", ") || "—";

  const tabella = tabellaHtml({
    colonne: [
      { titolo: "Descrizione" },
      { titolo: "Quantità", allinea: "centro" },
      { titolo: "Prezzo unit.", allinea: "dx" },
      { titolo: "Importo", allinea: "dx" },
    ],
    righe: righeCalc.map((s) => [
      cellaConNota(s.nome, [s.tipo, s.mese].filter(Boolean).join(" — ")),
      s.pasti,
      "€ " + eur(s.prezzo),
      "€ " + eur(s.imponibileRiga),
    ]),
    totale: ["Totale pasti fatturati", totPasti, "", "€ " + eur(imponibile)],
    vuota: "Nessuna riga da fatturare per il periodo.",
  });

  const destinatario = blocco("Destinatario", `<div class="doc-mittente">`
    + `<strong>${righeCalc.map((s) => testoHtml(s.nome)).join(" / ") || `<span class="ph">[Committente]</span>`}</strong>`
    + `<span class="ph">[Indirizzo committente]</span><br>`
    + `<span class="ph">[P.IVA committente]</span><br>`
    + `<span class="ph">[Referente / Email]</span>`
    + `</div>`);

  const condizioni = blocco("Condizioni", paragrafo({
    html: campo(d.condizioniPagamento, "Modalità di pagamento: es. bonifico bancario 30 gg d.f.")
      + `<br>IBAN ` + campo(d.iban, "IT00 X000 0000 0000 0000 0000 000"),
  }) + paragrafo(
    "Documento proforma non fiscalmente rilevante ai sensi del DPR 633/72. "
    + "La fattura elettronica verrà emessa dal gestionale contabile e trasmessa al Sistema di Interscambio.",
    { piccolo: true }
  ));

  const note = [
    d.noteProforma,
    "I dati in corsivo terracotta sono segnaposto, da compilare in Cucina MAVI › Gestione portale prima della messa in produzione.",
  ].filter(Boolean);

  const html = paginaDocumento({
    titolo: "Proforma " + numDoc,
    badge: "Proforma",
    sottotitolo: "Riepilogo dei pasti erogati nel periodo " + periodo,
    meta: [
      { etichetta: "Documento n.", valore: numDoc },
      { etichetta: "Data emissione", valore: oggi },
      { etichetta: "Periodo", valore: periodo },
      { etichetta: "Pagamento", valore: { html: campo(d.condizioniPagamento, "30 gg d.f.") } },
    ],
    blocchi: [
      destinatario,
      tabella,
      riepilogoTotali([
        { etichetta: "Imponibile", valore: "€ " + eur(imponibile) },
        { etichetta: "IVA " + String(ivaMedia).replace(".", ",") + "%", valore: "€ " + eur(iva) },
        { etichetta: "Totale documento", valore: "€ " + eur(totale), forte: true },
      ]),
      condizioni,
    ],
    note,
    piede: "Documento generato dal portale MAVI Ristorazione il " + oggi,
    datiAziendali,
  });

  apriDocumento(html, { nomeFile: "Proforma_MAVI.html", avvisa });
}
