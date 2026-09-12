var e=e=>String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);function t({struttura:t,giorno:n,pasto:r,righe:i}){let a=new Date().toLocaleDateString(`it-IT`,{day:`2-digit`,month:`long`,year:`numeric`}),o=new Date().toLocaleTimeString(`it-IT`,{hour:`2-digit`,minute:`2-digit`}),s=i.map(t=>`
    <tr>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:13px;">${e(t.nome)}<br><span style="color:#999;font-size:11px;">${e(t.reparto||``)}</span></td>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:13px;">${e(t.primo)}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:13px;">${e(t.secondo)}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;font-size:13px;">${e(t.contorno)}</td>
    </tr>`).join(``),c=`<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>Manifesto consegna — ${e(t)}</title>
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
<p class="sotto">${e(t)} · ${e(n)}, ${e(r)} · generato il ${a} alle ${o}</p>
<table>
  <thead><tr><th>Nominativo</th><th>Primo</th><th>Secondo</th><th>Contorno</th></tr></thead>
  <tbody>${s||`<tr><td colspan="4" style="padding:16px;color:#999;text-align:center">Nessun ordine nominativo per questa giornata.</td></tr>`}</tbody>
</table>
<p class="piede">Da inserire nel cassone termico in consegna. Le etichette pasto in cucina restano anonime: questo foglio è l'unico documento nominativo, ad uso esclusivo del fornitore per la distribuzione in azienda.</p>
</body></html>`,l=window.open(`about:blank`,`_blank`);if(l)l.document.write(c),l.document.close();else{let e=new Blob([c],{type:`text/html;charset=utf-8`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`Manifesto_consegna.html`,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(t)}}export{t as generaManifestoConsegna};