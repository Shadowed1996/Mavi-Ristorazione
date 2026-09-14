/* manifesto.js — manifesto nominativo di consegna, stampabile, per il cassone
   termico dell'azienda. Documento riservato al fornitore: mostra chi ha
   ordinato cosa, cosa che le etichette pasto dell'azienda deliberatamente
   nascondono (sono anonime, raggruppate per piatto). Non va mai esposto al
   cliente o al dipendente.
   Impaginazione e regole di escape stanno in documento.js. */

import { apriDocumento, cellaConNota, dataIt, paginaDocumento, tabellaHtml } from "./documento.js";

/* righe: [{ nome, reparto, primo, secondo, contorno }] — è st.nominativiAzienda */
export function generaManifestoConsegna({ struttura, giorno, pasto, righe = [], datiAziendali, avvisa }) {
  const oggi = dataIt(new Date());
  const ora = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  const tabella = tabellaHtml({
    colonne: [{ titolo: "Nominativo" }, { titolo: "Primo" }, { titolo: "Secondo" }, { titolo: "Contorno" }],
    righe: righe.map((r) => [cellaConNota(r.nome, r.reparto), r.primo, r.secondo, r.contorno]),
    vuota: "Nessun ordine nominativo per questa giornata.",
  });

  const html = paginaDocumento({
    titolo: "Manifesto di consegna",
    badge: "Riservato al fornitore",
    sottotitolo: [struttura, [giorno, pasto].filter(Boolean).join(", "), "generato il " + oggi + " alle " + ora]
      .filter(Boolean).join(" · "),
    meta: [
      { etichetta: "Struttura", valore: struttura },
      { etichetta: "Giornata", valore: giorno },
      { etichetta: "Pasto", valore: pasto },
      { etichetta: "Nominativi", valore: righe.length },
    ],
    blocchi: [
      `<p class="doc-riservato">Riservato al fornitore — non esporre al cliente</p>`,
      tabella,
    ],
    piede: "Da inserire nel cassone termico in consegna. Le etichette pasto in cucina restano anonime: "
      + "questo foglio è l'unico documento nominativo, ad uso esclusivo del fornitore per la distribuzione in azienda.",
    datiAziendali,
  });

  apriDocumento(html, { nomeFile: "Manifesto_consegna.html", avvisa });
}
