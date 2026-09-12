/* manifesto.js — manifesto nominativo di consegna, stampabile, per il cassone
   termico dell'azienda. Documento riservato al fornitore: mostra chi ha
   ordinato cosa, cosa che le etichette pasto dell'azienda deliberatamente
   nascondono (sono anonime, raggruppate per piatto). Non va mai esposto al
   cliente o al dipendente. */

const testoHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function generaManifestoConsegna({ struttura, giorno, pasto, righe }) {
  const oggi = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  const oraStampa = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  const corpo = righe.map((r) => `
    <tr>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:13px;">${testoHtml(r.nome)}<br><span style="color:#999;font-size:11px;">${testoHtml(r.reparto || "")}</span></td>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:13px;">${testoHtml(r.primo)}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:13px;">${testoHtml(r.secondo)}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:13px;">${testoHtml(r.contorno)}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>Manifesto consegna — ${testoHtml(struttura)}</title>
<style>
@page{size:A4;margin:14mm}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Calibri,Arial,sans-serif;color:#333;font-size:13px;line-height:1.5;padding:32px}
.riservato{background:#3c3632;color:#fff;padding:8px 16px;border-radius:4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;display:inline-block;margin-bottom:14px}
h1{font-size:24px;color:#b0543a;margin-bottom:4px}
.sotto{color:#777;font-size:12px;margin-bottom:20px}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
thead th{background:#3c3632;color:#fff;padding:9px 14px;font-size:11px;font-weight:600;text-transform:uppercase;text-align:left}
.piede{font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:10px}
@media print{body{padding:0}.no-print{display:none!important}}
</style></head><body>
<div class="no-print" style="background:#b0543a;color:#fff;padding:10px 24px;margin:-32px -32px 24px;display:flex;justify-content:space-between;align-items:center;font-size:13px">
  <span>Manifesto di consegna — usa Ctrl+P o il pulsante per stampare</span>
  <button onclick="window.print()" style="background:#fff;color:#b0543a;border:none;padding:8px 20px;border-radius:4px;font-weight:700;cursor:pointer;font-size:13px">Stampa</button>
</div>
<span class="riservato">Riservato al fornitore — non esporre al cliente</span>
<h1>Manifesto di consegna</h1>
<p class="sotto">${testoHtml(struttura)} · ${testoHtml(giorno)}, ${testoHtml(pasto)} · generato il ${oggi} alle ${oraStampa}</p>
<table>
  <thead><tr><th>Nominativo</th><th>Primo</th><th>Secondo</th><th>Contorno</th></tr></thead>
  <tbody>${corpo || `<tr><td colspan="4" style="padding:16px;color:#999;text-align:center">Nessun ordine nominativo per questa giornata.</td></tr>`}</tbody>
</table>
<p class="piede">Da inserire nel cassone termico in consegna. Le etichette pasto in cucina restano anonime: questo foglio è l'unico documento nominativo, ad uso esclusivo del fornitore per la distribuzione in azienda.</p>
</body></html>`;

  const tab = window.open("about:blank", "_blank");
  if (tab) {
    tab.document.write(html);
    tab.document.close();
  } else {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Manifesto_consegna.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
