/* diete.js — import/export diete pazienti da/verso Excel */

/* le comunità mangiano tutta la settimana: il template va da lunedì a domenica */
const GIORNI = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];
const PASTI = ["pranzo", "cena"];
const PORTATE = ["primo", "secondo", "contorno"];

/**
 * Genera e scarica un template Excel vuoto per il dietista.
 * Un foglio per paziente, struttura: righe=giorni, colonne=portate per pranzo e cena.
 */
export async function generaTemplateDieta(pazienti) {
  const ExcelJS = await import("exceljs");
  const { saveAs } = await import("file-saver");

  const wb = new ExcelJS.Workbook();
  wb.creator = "MAVI Ristorazione";
  wb.created = new Date();

  const TERRACOTTA = "FFB0543A";
  const AVORIO = "FFF2ECE1";
  const SCURO = "FF3C3632";
  const BIANCO = "FFFFFFFF";

  for (const paz of pazienti) {
    const nome = paz.nome.split(" ").slice(0, 2).join(" ").substring(0, 31);
    const ws = wb.addWorksheet(nome);

    /* intestazione */
    ws.mergeCells("A1", "G1");
    const t = ws.getCell("A1");
    t.value = "Dieta settimanale — " + paz.nome;
    t.font = { name: "Calibri", size: 16, bold: true, color: { argb: TERRACOTTA } };
    ws.getRow(1).height = 28;

    ws.mergeCells("A2", "G2");
    const info = ws.getCell("A2");
    info.value = paz.stanza + (paz.tipo_dieta ? " · " + paz.tipo_dieta : "") + " · " + (paz.note || "");
    info.font = { name: "Calibri", size: 10, color: { argb: "FF888074" } };

    ws.addRow([]);

    /* intestazione tabella — riga 4: Pranzo | Cena */
    const r4 = ws.getRow(4);
    ws.mergeCells("B4", "D4");
    ws.getCell("B4").value = "PRANZO";
    ws.getCell("B4").font = { name: "Calibri", size: 11, bold: true, color: { argb: BIANCO } };
    ws.getCell("B4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: SCURO } };
    ws.getCell("B4").alignment = { horizontal: "center" };
    ws.mergeCells("E4", "G4");
    ws.getCell("E4").value = "CENA";
    ws.getCell("E4").font = { name: "Calibri", size: 11, bold: true, color: { argb: BIANCO } };
    ws.getCell("E4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: SCURO } };
    ws.getCell("E4").alignment = { horizontal: "center" };
    ws.getCell("A4").value = "";
    ws.getCell("A4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: SCURO } };

    /* intestazione tabella — riga 5: Giorno | Primo | Secondo | Contorno | Primo | Secondo | Contorno */
    const r5 = ws.getRow(5);
    ["Giorno", "Primo", "Secondo", "Contorno", "Primo", "Secondo", "Contorno"].forEach((h, i) => {
      const c = r5.getCell(i + 1);
      c.value = h;
      c.font = { name: "Calibri", size: 10, bold: true, color: { argb: TERRACOTTA } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: AVORIO } };
      c.border = { bottom: { style: "thin", color: { argb: SCURO } } };
    });

    /* righe giorni */
    GIORNI.forEach((g, i) => {
      const r = ws.getRow(6 + i);
      r.getCell(1).value = g.charAt(0).toUpperCase() + g.slice(1);
      r.getCell(1).font = { name: "Calibri", size: 11, bold: true };
      for (let j = 2; j <= 7; j++) {
        r.getCell(j).fill = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 === 0 ? BIANCO : "FFFAF6EF" } };
        r.getCell(j).border = { bottom: { style: "hair", color: { argb: "FFE8E0D6" } } };
      }
      r.height = 24;
    });

    /* larghezze colonne */
    ws.getColumn(1).width = 14;
    for (let j = 2; j <= 7; j++) ws.getColumn(j).width = 24;

    /* nota in fondo, una riga vuota dopo l'ultimo giorno */
    const rigaNota = 6 + GIORNI.length + 1;
    const notaRow = ws.getRow(rigaNota);
    ws.mergeCells("A" + rigaNota, "G" + rigaNota);
    notaRow.getCell(1).value = "Compilare i piatti nelle celle vuote. Usare \" || \" per aggiungere note di preparazione (es: Risotto agli asparagi || NO MANTECATO)";
    notaRow.getCell(1).font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF888074" } };
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, "Template_Diete_Comunita.xlsx");
}

/**
 * Parsa un file Excel di dieta per un paziente.
 * Restituisce un oggetto dieta: { lunedì: { pranzo: { primo, secondo, contorno }, cena: ... }, ... }
 */
export async function parsaDietaExcel(file) {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await wb.xlsx.load(buffer);

  const ws = wb.worksheets[0];
  if (!ws) throw new Error("Il file non contiene fogli");

  const dieta = {};

  /* cerco la riga con "Giorno" per capire dove iniziano i dati */
  let rigaStart = 0;
  ws.eachRow((row, rowNum) => {
    const val = String(row.getCell(1).value || "").toLowerCase().trim();
    if (val === "giorno") rigaStart = rowNum + 1;
  });
  if (!rigaStart) rigaStart = 6; /* default se non trova l'intestazione */

  for (let i = 0; i < GIORNI.length; i++) {
    const row = ws.getRow(rigaStart + i);
    const giorno = GIORNI[i];
    /* un template vecchio si ferma a venerdì: le righe che non sono quel giorno
       non si leggono, e la dieta già presente per quel giorno resta */
    if (String(row.getCell(1).value || "").toLowerCase().trim() !== giorno) continue;
    dieta[giorno] = {
      pranzo: {
        primo: String(row.getCell(2).value || "—").trim(),
        secondo: String(row.getCell(3).value || "—").trim(),
        contorno: String(row.getCell(4).value || "—").trim(),
      },
      cena: {
        primo: String(row.getCell(5).value || "—").trim(),
        secondo: String(row.getCell(6).value || "—").trim(),
        contorno: String(row.getCell(7).value || "—").trim(),
      },
    };
  }

  /* nome dal titolo del foglio o dalla cella A1 */
  const titolo = String(ws.getCell("A1").value || ws.name || "").replace(/Dieta settimanale\s*—?\s*/i, "").trim();

  return { dieta, titolo, nomeFoglio: ws.name };
}
