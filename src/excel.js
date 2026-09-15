/* excel.js — helper per export xlsx con ExcelJS (zero CVE) */

/**
 * Crea un workbook, aggiunge fogli da array di oggetti, scarica il file.
 *
 * fogli = [
 *   { nome: "Riepilogo", titolo: "facoltativo", dati: [{...}, ...], colonne: [{ header, key, width }] },
 *   ...
 * ]
 *
 * `datiAziendali` è st.datiAziendali, compilato in Cucina MAVI › Gestione
 * portale: quando c'è, l'intestazione del foglio usa quei dati al posto dei
 * testi fissi di esempio.
 */
export async function scaricaExcel(nomefile, fogli, { datiAziendali } = {}) {
  const ExcelJS = await import("exceljs");
  const { saveAs } = await import("file-saver");

  const wb = new ExcelJS.Workbook();
  wb.creator = "MAVI Ristorazione";
  wb.created = new Date();

  const AVORIO = "FFF2ECE1";
  const AVORIO_CHIARO = "FFFAF6EF";
  const TERRACOTTA = "FFB0543A";
  const BIANCO = "FFFFFFFF";
  const GRIGIO = "FFE8E0D6";
  const SCURO = "FF3C3632";

  const azienda = datiAziendali || {};
  const ragioneSociale = String(azienda.ragioneSociale ?? "").trim() || "MAVI Ristorazione";
  const dettagliAzienda = [
    String(azienda.indirizzo ?? "").trim(),
    azienda.piva ? "P.IVA " + String(azienda.piva).trim() : "",
  ].filter(Boolean);
  const sottotitoloAzienda = dettagliAzienda.length
    ? "Ristorazione collettiva · " + dettagliAzienda.join(" · ")
    : "Ristorazione collettiva · Via dell'Industria 15, Varese · P.IVA 03456780125";

  for (const foglio of fogli) {
    const ws = wb.addWorksheet(foglio.nome);

    /* ---- intestazione aziendale (3 righe merge) ---- */
    const nCol = foglio.colonne.length;
    ws.mergeCells(1, 1, 1, nCol);
    const titolo = ws.getCell("A1");
    titolo.value = ragioneSociale;
    titolo.font = { name: "Calibri", size: 20, bold: true, color: { argb: TERRACOTTA } };
    titolo.alignment = { horizontal: "left", vertical: "middle" };
    ws.getRow(1).height = 32;

    ws.mergeCells(2, 1, 2, nCol);
    const sotto = ws.getCell("A2");
    sotto.value = sottotitoloAzienda;
    sotto.font = { name: "Calibri", size: 10, color: { argb: "FF888074" } };

    ws.mergeCells(3, 1, 3, nCol);
    const docTitolo = ws.getCell("A3");
    /* `titolo` facoltativo: dice a cosa si riferisce il foglio (giornata, perimetro),
       perché il file circola staccato dalla pagina che lo ha generato */
    docTitolo.value = [foglio.nome, foglio.titolo].filter(Boolean).join(" · ")
      + " — generato il " + new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
    docTitolo.font = { name: "Calibri", size: 11, bold: true, color: { argb: SCURO } };
    ws.getRow(3).height = 24;

    /* riga vuota */
    ws.addRow([]);

    /* ---- intestazioni colonne ---- */
    ws.columns = foglio.colonne.map((c) => ({ key: c.key, width: c.width }));
    const headerRow = ws.addRow(foglio.colonne.reduce((o, c) => { o[c.key] = c.header; return o; }, {}));
    headerRow.eachCell((cell) => {
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: BIANCO } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SCURO } };
      cell.alignment = { horizontal: "left", vertical: "middle" };
      cell.border = {
        bottom: { style: "thin", color: { argb: GRIGIO } },
      };
    });
    headerRow.height = 26;

    /* ---- righe dati con colori alternati ---- */
    foglio.dati.forEach((riga, i) => {
      const r = ws.addRow(riga);
      const bg = i % 2 === 0 ? BIANCO : AVORIO_CHIARO;
      r.eachCell((cell) => {
        cell.font = { name: "Calibri", size: 10.5 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
        cell.border = {
          bottom: { style: "hair", color: { argb: GRIGIO } },
        };
        cell.alignment = { vertical: "middle" };
      });
      r.height = 22;
    });

    /* ---- riga totale evidenziata se presente ---- */
    if (foglio.dati.length > 0) {
      const ultima = foglio.dati[foglio.dati.length - 1];
      const chiavi = foglio.colonne.map((c) => c.key);
      const isTotale = chiavi.some((k) => String(ultima[k]).toUpperCase() === "TOTALE");
      if (isTotale) {
        const lastRow = ws.getRow(ws.rowCount);
        lastRow.eachCell((cell) => {
          cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: BIANCO } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TERRACOTTA } };
          cell.border = {
            top: { style: "thin", color: { argb: SCURO } },
          };
        });
        lastRow.height = 26;
      }
    }

    /* ---- piè di pagina ---- */
    ws.addRow([]);
    const piedeMerge = ws.rowCount + 1;
    ws.mergeCells(piedeMerge, 1, piedeMerge, nCol);
    const piede = ws.getCell(piedeMerge, 1);
    piede.value = "Documento generato automaticamente dal portale MAVI Ristorazione · " + new Date().toLocaleString("it-IT");
    piede.font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF888074" } };

    /* impostazioni stampa */
    ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
    ws.headerFooter = { oddFooter: "&LMAVI Ristorazione&CPag. &P di &N&R&D" };
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, nomefile);
}
