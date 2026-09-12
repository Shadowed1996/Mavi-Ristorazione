/* proforma.js — genera proforma stile WHMCS, apre in una nuova scheda per stampa/salva */

/* i nomi arrivano dall'anagrafica, modificabile dal portale: nel documento vanno come testo, non come HTML */
const testoHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* strutture: [{ nome, tipo, mese, pasti, prezzo, ivaPercentuale }]. `prezzo`
   e `ivaPercentuale` sono per riga, così ogni committente può avere un
   listino diverso; prezzoUnitarioDefault resta come ripiego per chi chiama
   con un solo prezzo per tutte le righe (compatibilità con le fatture di
   RSA, comunità e scuola generate dal loro portale). */
export function generaProformaPDF(strutture, prezzoUnitarioDefault) {
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
  const eur = (n) => n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const oggi = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  const numDoc = "PRO-2026/" + String(Math.floor(Math.random() * 900) + 100);

  const righe = righeCalc.map(s => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:13px;">${testoHtml(s.nome)}<br><span style="color:#999;font-size:11px;">${testoHtml(s.tipo)} — ${testoHtml(s.mese)}</span></td>
      <td style="padding:10px 16px;border-bottom:1px solid #eee;text-align:center;font-size:13px;">${testoHtml(s.pasti)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #eee;text-align:right;font-size:13px;">€ ${eur(s.prezzo)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #eee;text-align:right;font-size:13px;font-weight:600;">€ ${eur(s.imponibileRiga)}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>Proforma ${numDoc}</title>
<style>
@page{size:A4;margin:15mm}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Calibri,Arial,sans-serif;color:#333;font-size:13px;line-height:1.5;padding:40px}
.inv-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px}
.inv-logo h1{font-size:36px;color:#b0543a;font-weight:800;letter-spacing:-1px;margin:0}
.inv-logo p{font-size:11px;color:#999;margin-top:2px}
.inv-badge{background:#b0543a;color:#fff;font-size:22px;font-weight:700;letter-spacing:2px;padding:10px 28px;border-radius:4px}
.inv-meta{display:flex;gap:40px;margin-bottom:32px}
.inv-meta-box{flex:1;border:1px solid #e8e0d6;border-radius:8px;padding:18px 22px}
.inv-meta-box h4{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#b0543a;margin-bottom:8px;font-weight:700}
.inv-meta-box p{font-size:12px;line-height:1.7}
.inv-meta-box strong{font-size:14px;display:block;margin-bottom:2px}
.ph{color:#b0543a;font-style:italic}
.inv-info{display:flex;gap:24px;margin-bottom:28px}
.inv-info-item{background:#faf6ef;border-radius:6px;padding:12px 20px;flex:1;text-align:center}
.inv-info-item label{display:block;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:4px}
.inv-info-item span{font-size:15px;font-weight:700;color:#333}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
thead th{background:#3c3632;color:#fff;padding:11px 16px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
thead th:first-child{text-align:left;border-radius:6px 0 0 0}
thead th:last-child{text-align:right;border-radius:0 6px 0 0}
.inv-totals{display:flex;justify-content:flex-end;margin-bottom:32px}
.inv-totals table{width:320px}
.inv-totals td{padding:6px 16px;font-size:13px;border:none}
.inv-totals .label{text-align:left;color:#999}
.inv-totals .val{text-align:right;font-weight:600}
.inv-totals .grand{background:#b0543a;color:#fff;font-size:16px;font-weight:700;border-radius:4px}
.inv-notes{background:#faf6ef;border-radius:8px;padding:18px 22px;margin-bottom:24px}
.inv-notes h4{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#b0543a;margin-bottom:8px;font-weight:700}
.inv-notes p{font-size:11px;color:#888;line-height:1.7}
.inv-footer{text-align:center;font-size:9px;color:#ccc;padding-top:16px;border-top:1px solid #eee}
@media print{body{padding:0}.no-print{display:none!important}}
</style></head><body>

<div class="no-print" style="background:#b0543a;color:#fff;padding:10px 24px;margin:-40px -40px 30px;display:flex;justify-content:space-between;align-items:center;font-size:13px">
  <span>Anteprima proforma — usa Ctrl+P o il pulsante per stampare/salvare come PDF</span>
  <button onclick="window.print()" style="background:#fff;color:#b0543a;border:none;padding:8px 20px;border-radius:4px;font-weight:700;cursor:pointer;font-size:13px">Stampa / Salva PDF</button>
</div>

<div class="inv-header">
  <div class="inv-logo">
    <h1>MAVI</h1>
    <p>Ristorazione collettiva</p>
  </div>
  <div class="inv-badge">PROFORMA</div>
</div>

<div class="inv-info">
  <div class="inv-info-item"><label>Documento n.</label><span>${numDoc}</span></div>
  <div class="inv-info-item"><label>Data emissione</label><span>${oggi}</span></div>
  <div class="inv-info-item"><label>Periodo</label><span>Agosto 2026</span></div>
  <div class="inv-info-item"><label>Scadenza</label><span class="ph">[30 gg d.f.]</span></div>
</div>

<div class="inv-meta">
  <div class="inv-meta-box">
    <h4>Da</h4>
    <p>
      <strong class="ph">[RAGIONE SOCIALE MAVI]</strong>
      <span class="ph">[Indirizzo sede legale]</span><br>
      <span class="ph">[P.IVA / Codice Fiscale]</span><br>
      <span class="ph">[Telefono] · [Email]</span>
    </p>
  </div>
  <div class="inv-meta-box">
    <h4>A</h4>
    <p>
      <strong>${strutture.map(s => testoHtml(s.nome)).join(" / ")}</strong>
      <span class="ph">[Indirizzo committente]</span><br>
      <span class="ph">[P.IVA committente]</span><br>
      <span class="ph">[Referente / Email]</span>
    </p>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="text-align:left">Descrizione</th>
      <th style="text-align:center">Quantità</th>
      <th style="text-align:right">Prezzo unit.</th>
      <th style="text-align:right">Importo</th>
    </tr>
  </thead>
  <tbody>${righe}</tbody>
</table>

<div class="inv-totals"><table>
  <tr><td class="label">Subtotale</td><td class="val">€ ${eur(imponibile)}</td></tr>
  <tr><td class="label">IVA ${ivaMedia}%</td><td class="val">€ ${eur(iva)}</td></tr>
  <tr class="grand"><td style="padding:10px 16px">Totale</td><td style="padding:10px 16px;text-align:right">€ ${eur(totale)}</td></tr>
</table></div>

<div class="inv-notes">
  <h4>Condizioni</h4>
  <p>
    <span class="ph">[Modalità di pagamento: es. bonifico bancario 30 gg d.f.]</span><br>
    <span class="ph">[IBAN: IT00 X000 0000 0000 0000 0000 000]</span><br><br>
    Documento proforma non fiscalmente rilevante ai sensi del DPR 633/72.
    La fattura elettronica verrà emessa dal gestionale contabile e trasmessa al Sistema di Interscambio.
  </p>
</div>

<div class="inv-notes">
  <h4>Note</h4>
  <p>I dati in <span class="ph">corsivo terracotta</span> sono placeholder da compilare con i dati reali dell'azienda prima della messa in produzione.</p>
</div>

<div class="inv-footer">
  Documento generato dal portale MAVI Ristorazione il ${oggi}
</div>
</body></html>`;

  /* apro in una nuova tab (non popup, non blob) */
  const tab = window.open("about:blank", "_blank");
  if (tab) {
    tab.document.write(html);
    tab.document.close();
  } else {
    /* fallback: scarica come file */
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Proforma_MAVI.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
