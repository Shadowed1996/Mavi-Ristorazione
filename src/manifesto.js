/* manifesto.js — manifesto nominativo di consegna, stampabile, per il cassone
   termico dell'azienda. Dice chi ha ordinato cosa, cosa che le etichette pasto
   restano anonime e non dicono.
   Lo stampano sia la cucina sia il referente dell'azienda (Filippo, 16
   settembre 2026): non è più un documento riservato al fornitore, quindi niente
   fascetta "non esporre al cliente" e niente diete con prescrizione medica, che
   restano riservate e non compaiono. In chiaro ci sono solo le allergie
   dichiarate dal dipendente, perché servono a chi distribuisce i pasti.
   Il documento è volutamente asciutto: nome, pasto una portata per riga,
   allergie. Le versioni con il totale per piatto in testa e con il dettaglio a
   riquadri erano più difficili da scorrere in consegna.
   Impaginazione e regole di escape stanno in documento.js. */

import { GIORNI } from "./data.js";
import { apriDocumento, dataIt, elencoPasti, paginaDocumento, paragrafo } from "./documento.js";

const PORTATE = [
  { id: "primo", nome: "Primo" },
  { id: "secondo", nome: "Secondo" },
  { id: "contorno", nome: "Contorno" },
];

const rigaPortata = (etichetta, valore) => {
  const nome = String(valore || "").trim();
  return nome && nome !== "—"
    ? { etichetta, piatto: nome }
    : { etichetta, piatto: "non indicato", vuota: true };
};

/* il piatto unico sostituisce primo, secondo e contorno: si scrive una riga
   sola, così si legge subito che non ne arrivano altre */
const portateDi = (r) => (String(r.unico || "").trim()
  ? [rigaPortata("Piatto unico", r.unico)]
  : PORTATE.map((p) => rigaPortata(p.nome, r[p.id])));

const allergieDi = (r) => (r.allergeni || []).join(", ");

/* righe: st.nominativiAzienda, l'elenco completo di tutte le giornate, con in
   più per riga `allergeni` (dichiarati dal dipendente); `dieta`, se presente,
   qui non si usa. Il manifesto è di una consegna sola, quindi si filtra su
   `indiceGiorno`: in cassone finisce il foglio di quel giorno. */
export function generaManifestoConsegna({ struttura, indiceGiorno, pasto = "pranzo", righe = [], datiAziendali, avvisa }) {
  const g = GIORNI[indiceGiorno];
  const delGiorno = righe
    .filter((r) => r.indiceGiorno === indiceGiorno)
    .sort((a, b) => a.nome.localeCompare(b.nome, "it"));
  const oggi = dataIt(new Date());
  const ora = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  const conAllergie = delGiorno.filter((r) => allergieDi(r)).length;
  const porzioni = delGiorno.reduce((s, r) => s + portateDi(r).filter((p) => !p.vuota).length, 0);

  const elenco = elencoPasti(delGiorno.map((r) => ({
    nome: r.nome,
    nota: r.reparto || "",
    codice: r.matricola ? "Matricola " + r.matricola : "",
    portate: portateDi(r),
    avviso: allergieDi(r),
  })));

  const html = paginaDocumento({
    titolo: "Manifesto di consegna",
    badge: "Cassone termico",
    sottotitolo: [struttura, [g ? dataIt(g.data) : "", pasto].filter(Boolean).join(", "),
      "generato il " + oggi + " alle " + ora].filter(Boolean).join(" · "),
    meta: [
      { etichetta: "Struttura", valore: struttura },
      { etichetta: "Giornata", valore: g ? dataIt(g.data) : "—" },
      { etichetta: "Pasto", valore: pasto },
      { etichetta: "Pasti", valore: delGiorno.length },
      { etichetta: "Porzioni", valore: porzioni },
      { etichetta: "Con allergie dichiarate", valore: conAllergie },
    ],
    blocchi: [elenco || paragrafo("Nessun ordine nominativo per questa giornata.")],
    piede: "Da inserire nel cassone termico in consegna. Le etichette pasto in cucina restano anonime: "
      + "questo è il foglio nominativo che serve a distribuire i pasti in azienda. "
      + "Le diete con prescrizione medica non compaiono: restano riservate.",
    datiAziendali,
  });

  return apriDocumento(html, { nomeFile: "Manifesto_consegna.html", avvisa });
}
