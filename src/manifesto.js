/* manifesto.js — manifesto nominativo di consegna, stampabile, per il cassone
   termico dell'azienda. Documento riservato al fornitore: mostra chi ha
   ordinato cosa, cosa che le etichette pasto dell'azienda deliberatamente
   nascondono (sono anonime, raggruppate per piatto). Non va mai esposto al
   cliente o al dipendente.
   Impaginazione e regole di escape stanno in documento.js. */

import { GIORNI } from "./data.js";
import { cellaConNota, dataIt, generaElencoNominativo, giornoDataIt } from "./documento.js";

/* righe: st.nominativiAzienda, l'elenco completo di tutte le giornate.
   Il manifesto è di una consegna sola, quindi qui si filtra su `indiceGiorno`:
   in cassone finisce il foglio di quel giorno, non la settimana intera. */
export function generaManifestoConsegna({ struttura, indiceGiorno, pasto = "pranzo", righe = [], datiAziendali, avvisa }) {
  const g = GIORNI[indiceGiorno];
  const delGiorno = righe.filter((r) => r.indiceGiorno === indiceGiorno);
  const oggi = dataIt(new Date());
  const ora = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  return generaElencoNominativo({
    titolo: "Manifesto di consegna",
    badge: "Riservato al fornitore",
    sottotitolo: [struttura, [g ? giornoDataIt(g.data) : "", pasto].filter(Boolean).join(", "),
      "generato il " + oggi + " alle " + ora].filter(Boolean).join(" · "),
    meta: [
      { etichetta: "Struttura", valore: struttura },
      { etichetta: "Giornata", valore: g ? giornoDataIt(g.data) : "—" },
      { etichetta: "Pasto", valore: pasto },
      { etichetta: "Nominativi", valore: delGiorno.length },
    ],
    colonne: [{ titolo: "Nominativo" }, { titolo: "Primo" }, { titolo: "Secondo" }, { titolo: "Contorno" }],
    righe: delGiorno.map((r) => [
      cellaConNota(r.nome, r.reparto),
      r.unico ? "Piatto unico: " + r.unico : r.primo,
      r.secondo,
      r.contorno,
    ]),
    vuota: "Nessun ordine nominativo per questa giornata.",
    blocchiPrima: [`<p class="doc-riservato">Riservato al fornitore — non esporre al cliente</p>`],
    piede: "Da inserire nel cassone termico in consegna. Le etichette pasto in cucina restano anonime: "
      + "questo foglio è l'unico documento nominativo, ad uso esclusivo del fornitore per la distribuzione in azienda.",
    nomeFile: "Manifesto_consegna.html",
    datiAziendali,
    avvisa,
  });
}
