import React from "react";
import {
  CATEGORIE, DIPENDENTI, GIORNI, PIATTI, PREZZO_PASTO, QUOTA_DIPENDENTE, RESOCONTO_MENSILE,
  etichettaGiorno, giorniSettimana, menuDelGiorno, primoAperto, ordinaProforme, testoCondizioni, totaliProforma,
} from "../data.js";
import {
  Accesso, DiscoColore, Documenti, Icone, Intestazione, Messaggi, NessunPermesso,
  PastigliaProforma, Telaio, Velo, usaVociPermesse,
} from "../ui.jsx";
import { usaStato } from "../store.jsx";
import { generaProformaPDF } from "../proforma.js";
import { generaResocontoPDF } from "../resoconto.js";
import {
  apriDocumento, blocco, dataIt, elencoOrdini, giornoDataIt, paginaDocumento, paragrafo, riepilogoTotali,
} from "../documento.js";

const VOCI = [
  ["cruscotto", "Cruscotto", Icone.grafico],
  ["dipendenti", "Dipendenti", Icone.gente],
  ["resoconti", "Resoconti", Icone.lista],
  ["fatture", "Fatture", Icone.fattura],
  ["documenti", "Documenti", Icone.lista],
];



const PERMESSO_PAGINA = {
  cruscotto: "cruscotto.vedi",
  dipendenti: "dipendenti.vedi",
  resoconti: "resoconti.vedi",
  fatture: "fatture.vedi",
  documenti: "documenti.vedi",
};

const eur = (n) => "€ " + n.toFixed(2).replace(".", ",");

export default function Cliente({ onEsci, utente }) {
  const [dentro, setDentro] = React.useState(!!utente);
  const st = usaStato();
  const [voci, pagina, setPagina] = usaVociPermesse(VOCI, PERMESSO_PAGINA);

  if (!dentro)
    return (
      <Accesso
        area="cliente"
        titolo="Portale azienda cliente"
        claim="Il servizio mensa, <em>sotto controllo</em>."
        punti={[
          "Gestione autonoma di utenze, reparti e password",
          "Chi non ha prenotato, con promemoria in un clic",
          "Resoconti mensili, export per le paghe e fatture",
        ]}
        utente="admin.rossi"
        password="dimostrazione"
        onEntra={() => setDentro(true)}
        onIndietro={() => (onEsci ? onEsci() : null)}
      />
    );

  return (
    <Telaio
      area="cliente"
      marchio="Portale azienda cliente"
      ruolo="Admin cliente"
      utente={{ iniziali: utente ? utente.iniziali : "RM", nome: utente ? utente.nome : "Roberto Manzi", sotto: utente ? utente.committente : "Rossi Manifatture Spa" }}
      chiaveUtente={utente ? utente.u : "admin.rossi"}
      voci={voci}
      pagina={pagina}
      setPagina={setPagina}
      onEsci={() => (onEsci ? onEsci() : null)}
    >
      {voci.length === 0 && <NessunPermesso onEsci={onEsci} />}
      {pagina === "cruscotto" && <Cruscotto utente={utente} />}
      {pagina === "dipendenti" && <Dipendenti />}
      {pagina === "resoconti" && <Resoconti />}
      {pagina === "fatture" && <Fatture />}
      {pagina === "documenti" && <Documenti soloPubblici={!st.puo("documenti.riservati")} />}
      <Messaggi lista={st.messaggi} />
    </Telaio>
  );
}

/* il referente vede gli ordini di tutta la settimana, ma prenota per i
   dipendenti e manda promemoria solo nei giorni ancora aperti */
const SETTIMANA = giorniSettimana(GIORNI);

function Cruscotto({ utente }) {
  const st = usaStato();
  const [giorno, setGiorno] = React.useState(() => primoAperto(GIORNI));
  const chiuso = GIORNI[giorno].chiuso;
  const [prenota, setPrenota] = React.useState(null); // dipendente selezionato
  const [scelte, setScelte] = React.useState({});
  const referente = utente ? utente.nome : "Roberto Manzi";
  const azienda = (st.committenti.find((c) => c.id === "azienda") || {}).nome || "Rossi Manifatture Spa";

  /* il referente vede il nominativo della sua azienda e basta: le righe degli
     altri committenti non entrano mai in questa pagina */
  const ordinati = st.nominativiAzienda.filter((n) => n.committente === "azienda" && n.indiceGiorno === giorno);
  const attivi = DIPENDENTI.filter((d) => d.stato === "attivo");
  const senzaOrdine = attivi.filter((d) => !ordinati.some((n) => n.nome === d.n));
  const primoPortata = (n) => (n.unico ? "Piatto unico: " + n.unico : n.primo);

  function confermaPrenotazione() {
    const nPortate = Object.keys(scelte).length;
    /* le scelte passano direttamente a `conferma`: il carrello del portale
       dipendente non va toccato, è di un'altra persona */
    st.conferma(giorno, {
      nome: prenota.n, matricola: prenota.m, ruolo: "Dipendente",
      inseritaDa: { nome: referente, ruolo: "Referente" },
    }, scelte);
    st.avvisa("Prenotazione confermata per " + prenota.n + ", " + etichettaGiorno(giorno).toLowerCase()
      + ": " + nPortate + (nPortate === 1 ? " portata" : " portate") + ". Il dipendente riceverà la conferma via email.");
    setPrenota(null);
    setScelte({});
  }

  /* Il riepilogo di tutti gli ordini del giorno (Filippo, 15 settembre 2026):
     ogni dipendente e, sotto, il suo pasto, in ordine alfabetico. Curato ma non
     fitto: niente tabella a cinque colonne, il dettaglio è della cucina. */
  function stampaRiepilogo() {
    const g = GIORNI[giorno];
    const pastoDi = (n) => (n.unico
      ? [n.unico + " (piatto unico)"]
      : [n.primo, n.secondo, n.contorno]).filter((x) => x && x !== "—").join(" · ");
    const voci = [...ordinati]
      .sort((a, b) => a.nome.localeCompare(b.nome, "it"))
      .map((n) => ({ nome: n.nome, nota: n.reparto, pasto: pastoDi(n) || "—" }));
    const html = paginaDocumento({
      titolo: "Ordini di " + etichettaGiorno(giorno).toLowerCase(),
      badge: "Riepilogo ordini",
      sottotitolo: azienda + " · pranzo · " + giornoDataIt(g.data),
      blocchi: [
        voci.length ? elencoOrdini(voci) : paragrafo("Nessun ordine registrato per questa giornata."),
        riepilogoTotali([{ etichetta: "Pasti ordinati", valore: String(voci.length), forte: true }]),
        senzaOrdine.length
          ? blocco("Non hanno ordinato", paragrafo(senzaOrdine.map((d) => d.n).join(", ")))
          : paragrafo("Tutti i dipendenti attivi hanno ordinato.", { piccolo: true }),
      ],
      piede: "Riepilogo generato dal portale MAVI Ristorazione per " + azienda + " il " + dataIt(new Date()),
      datiAziendali: st.datiAziendali,
    });
    apriDocumento(html, { nomeFile: "Riepilogo_ordini_" + g.data + ".html", avvisa: st.avvisa });
    st.logga(referente, "Referente", "Riepilogo del giorno stampato",
      etichettaGiorno(giorno) + ", " + ordinati.length + " pasti", "generico");
  }

  return (
    <>
      <Intestazione occhiello={azienda} titolo="Cruscotto" sotto="Mensa aziendale, situazione aggiornata a oggi" />
      <div className="tela">
        <div className="numeri">
          <div className="numero"><div className="n-lab">Dipendenti attivi</div><div className="n-val">{attivi.length}</div><div className="n-nota">su {DIPENDENTI.length} utenze create</div></div>
          <div className="numero"><div className="n-lab">Prenotazioni di domani</div><div className="n-val">22</div><div className="n-nota">su 28 possibili</div><div className="progresso"><i style={{ width: "79%" }} /></div></div>
          <div className="numero"><div className="n-lab">Pasti del mese</div><div className="n-val">143</div><div className="n-nota">media 20 al giorno</div></div>
          <div className="numero"><div className="n-lab">Diete speciali attive</div><div className="n-val">4</div><div className="n-nota">2 senza glutine, 2 vegetariane</div></div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Ordini del giorno</h2>
            <span className="pastiglia p-neu">{ordinati.length} {ordinati.length === 1 ? "pasto" : "pasti"}</span>
            {st.puo("riepilogo.stampa") && (
              <div className="az">
                <button className="btn piccolo" onClick={stampaRiepilogo}>
                  <Icone.stampa size={16} /> Stampa riepilogo
                </button>
              </div>
            )}
          </div>
          <div className="scelta-giorno">
            <div className="giorni-tab">
              {SETTIMANA.map((g) => (
                <button key={g.n} className={(g.i === giorno ? "on" : "") + (g.chiuso ? " chiuso" : "")} onClick={() => setGiorno(g.i)}>
                  {g.chiuso && <Icone.lucchetto size={12} />}{g.n}<span>{g.chiuso ? "chiuso · " + g.breve : g.d}</span>
                </button>
              ))}
            </div>
            {chiuso && (
              <div className="avviso chiuso" style={{ marginBottom: 14 }}>
                <Icone.lucchetto size={16} />
                <span>Gli ordini di {etichettaGiorno(giorno).toLowerCase()} sono chiusi: l'elenco è quello definitivo arrivato alla cucina.</span>
              </div>
            )}
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Dipendente</th><th>Reparto</th><th>Primo</th><th>Secondo</th><th>Contorno</th></tr></thead>
              <tbody>
                {ordinati.length === 0 ? (
                  <tr><td colSpan={5} className="riga-vuota">Nessun ordine registrato per {etichettaGiorno(giorno).toLowerCase()}.</td></tr>
                ) : ordinati.map((n) => (
                  <tr key={n.id}>
                    <td><b>{n.nome}</b></td>
                    <td style={{ color: "var(--muto)" }}>{n.reparto}</td>
                    <td>{primoPortata(n)}</td>
                    <td>{n.secondo}</td>
                    <td>{n.contorno}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Il riepilogo stampato elenca tutti gli ordini del giorno, ogni dipendente con sotto il suo
            pasto, poi il totale e chi non ha ordinato. Nessuna dieta o informazione sanitaria compare nel documento.
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>{chiuso ? "Chi non ha prenotato per " : "Chi non ha ancora prenotato per "}{etichettaGiorno(giorno).toLowerCase()}</h2>
            <div className="az">
              <button className="btn piccolo" disabled={chiuso || senzaOrdine.length === 0}
                onClick={() => st.avvisa("Promemoria inviato a " + senzaOrdine.length + (senzaOrdine.length === 1 ? " dipendente" : " dipendenti"))}>
                Invia promemoria
              </button>
            </div>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Matricola</th><th>Nome</th><th>Reparto</th><th /></tr></thead>
              <tbody>
                {senzaOrdine.length === 0 ? (
                  <tr><td colSpan={4} className="riga-vuota">Tutti i dipendenti attivi hanno ordinato.</td></tr>
                ) : senzaOrdine.map((d) => (
                  <tr key={d.m}>
                    <td className="cifra">{d.m}</td>
                    <td><b>{d.n}</b></td>
                    <td>{d.rep}</td>
                    <td>
                      {st.puo("prenota.perConto") && (
                        <button className="btn linea piccolo" disabled={chiuso}
                          onClick={() => { setPrenota(d); setScelte({}); }}>
                          Prenota per lui
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            L'amministratore dell'azienda può prenotare al posto di un dipendente entro lo stesso
            orario limite delle 14:00 del giorno precedente.
          </div>
        </div>
      </div>

      {prenota && (
        <Velo onChiudi={() => setPrenota(null)} largo>
          <div className="scelta-testa">
            <div className="occhiello">Prenotazione per conto di un dipendente · {etichettaGiorno(giorno)}</div>
            <h2>Prenota per {prenota.n}</h2>
            <p>{prenota.rep} · Matricola {prenota.m}</p>
          </div>

          <div className="scheda-ospite" style={{ padding: "16px 24px" }}>
            {["primo", "sost_primo", "secondo", "sost_secondo", "contorno", "unico"].map((catId) => {
              const cat = CATEGORIE.find((c) => c.id === catId);
              if (!cat) return null;
              const piatti = menuDelGiorno(st.menu, giorno, catId);
              if (!piatti.length) return null;
              return (
                <div key={catId} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muto)", marginBottom: 8 }}>{cat.nome}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {piatti.map((id) => {
                      const p = PIATTI[id];
                      const scelto = scelte[catId] === id;
                      return (
                        <button key={id}
                          className={"btn piccolo" + (scelto ? "" : " linea")}
                          style={scelto ? { background: "var(--acc)", color: "#fff" } : {}}
                          onClick={() => setScelte((prev) => {
                            const n = { ...prev };
                            if (n[catId] === id) { delete n[catId]; }
                            else {
                              n[catId] = id;
                              if (catId === "primo") delete n.sost_primo;
                              if (catId === "sost_primo") delete n.primo;
                              if (catId === "secondo") delete n.sost_secondo;
                              if (catId === "sost_secondo") delete n.secondo;
                              /* stesse esclusioni di `scegli` nello store: il
                                 piatto unico cancella le portate che copre */
                              if (catId === "unico") {
                                (p.so || []).forEach((c) => {
                                  delete n[c];
                                  if (c === "primo") delete n.sost_primo;
                                  if (c === "secondo") delete n.sost_secondo;
                                });
                              } else if (n.unico && (PIATTI[n.unico].so || []).includes(catId)) {
                                delete n.unico;
                              }
                            }
                            return n;
                          })}
                        >
                          <DiscoColore colore={p.col} size={9} /> {p.n}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="scelta-piede" style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
            <span style={{ flex: 1, fontSize: 13, color: "var(--muto)" }}>
              {Object.keys(scelte).length === 0 ? "Seleziona almeno una portata" : Object.keys(scelte).length + " portate selezionate"}
            </span>
            <button className="btn linea" onClick={() => setPrenota(null)}>Annulla</button>
            <button className="btn" disabled={Object.keys(scelte).length === 0} onClick={confermaPrenotazione}>
              Conferma prenotazione
            </button>
          </div>
        </Velo>
      )}
    </>
  );
}

function Dipendenti() {
  const st = usaStato();
  return (
    <>
      <Intestazione
        occhiello="Anagrafica" titolo="Dipendenti" sotto="Utenze abilitate al servizio mensa"
        azioni={st.puo("dipendenti.modifica") && <>
          <button className="btn linea piccolo" onClick={() => st.avvisa("Importazione da file avviata")}>Importa da Excel</button>
          <button className="btn piccolo" onClick={() => st.avvisa("Nuovo dipendente creato")}>Aggiungi dipendente</button>
        </>}
      />
      <div className="tela">
        <div className="pannello">
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Matricola</th><th>Nome</th><th>Reparto</th><th>Dieta</th><th>Stato</th><th /></tr></thead>
              <tbody>
                {DIPENDENTI.map((d) => (
                  <tr key={d.m}>
                    <td className="cifra">{d.m}</td>
                    <td><b>{d.n}</b></td>
                    <td>{d.rep}</td>
                    <td>
                      {d.dieta === "riservata" ? <span className="riservato" title="dato sanitario, non visibile al datore di lavoro">riservata</span>
                        : d.dieta === "nessuna" ? <span className="pastiglia p-neu">nessuna</span>
                          : <span className="pastiglia p-ok">vegetariano</span>}
                    </td>
                    <td>{d.stato === "attivo" ? <span className="pastiglia p-ok">attivo</span> : <span className="pastiglia p-att">sospeso</span>}</td>
                    <td>
                      {st.puo("dipendenti.modifica") && (
                        <button className="btn linea piccolo" onClick={() => st.avvisa("Password reimpostata, email inviata")}>
                          Reimposta password
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            La colonna dieta mostra solo le preferenze non sanitarie. Le diete con motivazione
            medica restano riservate, come previsto dall'articolo 9 del GDPR.
          </div>
        </div>
      </div>
    </>
  );
}

/* riepilogo e dettaglio del mese, calcolati una volta sola: Excel e PDF devono
   mostrare gli stessi numeri. L'ultima riga del riepilogo è quella di totale,
   riconosciuta dal nome "TOTALE" sia da excel.js sia da resoconto.js. */
function calcolaResoconto(dati) {
  const riepilogo = dati.dipendenti.map((d) => ({
    matricola: d.m, nome: d.n, reparto: d.rep, pasti: d.pasti,
    quotaDip: eur(d.pasti * QUOTA_DIPENDENTE),
    quotaAz: eur(d.pasti * (PREZZO_PASTO - QUOTA_DIPENDENTE)),
    totale: eur(d.pasti * PREZZO_PASTO),
  }));
  riepilogo.push({
    matricola: "", nome: "TOTALE", reparto: "", pasti: dati.totPasti,
    quotaDip: eur(dati.totPasti * QUOTA_DIPENDENTE),
    quotaAz: eur(dati.totPasti * (PREZZO_PASTO - QUOTA_DIPENDENTE)),
    totale: eur(dati.totPasti * PREZZO_PASTO),
  });
  const dettaglio = [];
  dati.dipendenti.forEach((d) => {
    (d.dettaglio || []).forEach((g) => {
      dettaglio.push({ matricola: d.m, nome: d.n, reparto: d.rep, giorno: g.giorno, primo: g.primo, secondo: g.secondo, contorno: g.contorno });
    });
  });
  return { riepilogo, dettaglio };
}

function Resoconti() {
  const st = usaStato();
  const [espanso, setEspanso] = React.useState(null);
  const dati = RESOCONTO_MENSILE.azienda;

  async function esportaExcel() {
    try {
      const { scaricaExcel } = await import("../excel.js");
      const { riepilogo, dettaglio } = calcolaResoconto(dati);
      await scaricaExcel("Resoconto_Agosto_2026_Rossi_Manifatture.xlsx", [
        { nome: "Riepilogo", dati: riepilogo, colonne: [
          { header: "Matricola", key: "matricola", width: 12 },
          { header: "Nome", key: "nome", width: 22 },
          { header: "Reparto", key: "reparto", width: 18 },
          { header: "Pasti", key: "pasti", width: 8 },
          { header: "Quota dipendente", key: "quotaDip", width: 18 },
          { header: "Quota azienda", key: "quotaAz", width: 18 },
          { header: "Totale", key: "totale", width: 14 },
        ]},
        { nome: "Dettaglio giornaliero", dati: dettaglio, colonne: [
          { header: "Matricola", key: "matricola", width: 12 },
          { header: "Nome", key: "nome", width: 22 },
          { header: "Reparto", key: "reparto", width: 18 },
          { header: "Giorno", key: "giorno", width: 12 },
          { header: "Primo", key: "primo", width: 26 },
          { header: "Secondo", key: "secondo", width: 26 },
          { header: "Contorno", key: "contorno", width: 26 },
        ]},
      ], { datiAziendali: st.datiAziendali });
      st.avvisa("Resoconto Excel scaricato con riepilogo e dettaglio giornaliero");
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nell'export Excel, riprova");
    }
  }

  function esportaPDF() {
    try {
      const { riepilogo, dettaglio } = calcolaResoconto(dati);
      generaResocontoPDF({
        committente: "Rossi Manifatture Spa",
        periodo: RESOCONTO_MENSILE.mese,
        riepilogo,
        dettaglio,
        datiAziendali: st.datiAziendali,
        avvisa: st.avvisa,
      });
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nella generazione del PDF, riprova");
    }
  }

  async function esportaPaghe() {
    try {
      const { scaricaExcel } = await import("../excel.js");
      const paghe = dati.dipendenti.map((d) => ({
        matricola: d.m, nome: d.n, pasti: d.pasti,
        trattenuta: eur(d.pasti * QUOTA_DIPENDENTE),
      }));
      paghe.push({
        matricola: "", nome: "TOTALE", pasti: dati.totPasti,
        trattenuta: eur(dati.totPasti * QUOTA_DIPENDENTE),
      });
      await scaricaExcel("Trattenute_Agosto_2026_Rossi_Manifatture.xlsx", [
        { nome: "Trattenute", dati: paghe, colonne: [
          { header: "Matricola", key: "matricola", width: 12 },
          { header: "Cognome e nome", key: "nome", width: 26 },
          { header: "Pasti", key: "pasti", width: 8 },
          { header: "Trattenuta lorda", key: "trattenuta", width: 18 },
        ]},
      ], { datiAziendali: st.datiAziendali });
      st.avvisa("File trattenute Excel scaricato per l'ufficio paghe");
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nell'export Excel, riprova");
    }
  }

  return (
    <>
      <Intestazione
        occhiello="Agosto 2026" titolo="Resoconti" sotto="Consumi per dipendente e dettaglio giornaliero dei piatti"
        azioni={st.puo("resoconti.export") && <>
          <button className="btn linea piccolo" onClick={esportaExcel}><Icone.scarica size={16} /> Excel</button>
          <button className="btn linea piccolo" onClick={esportaPDF}><Icone.stampa size={16} /> PDF</button>
          <button className="btn piccolo" onClick={esportaPaghe}><Icone.scarica size={16} /> Export paghe</button>
        </>}
      />
      <div className="tela">
        <div className="numeri">
          <div className="numero"><div className="n-lab">Pasti totali</div><div className="n-val">{dati.totPasti}</div><div className="n-nota">nel mese di agosto</div></div>
          <div className="numero"><div className="n-lab">Dipendenti</div><div className="n-val">{dati.dipendenti.length}</div><div className="n-nota">con almeno un pasto</div></div>
          <div className="numero"><div className="n-lab">Quota dipendenti</div><div className="n-val" style={{ fontSize: 20 }}>{eur(dati.totPasti * QUOTA_DIPENDENTE)}</div><div className="n-nota">trattenuta in busta paga</div></div>
          <div className="numero"><div className="n-lab">Quota azienda</div><div className="n-val" style={{ fontSize: 20 }}>{eur(dati.totPasti * (PREZZO_PASTO - QUOTA_DIPENDENTE))}</div><div className="n-nota">importo fattura MAVI</div></div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Riepilogo per dipendente</h2>
            <span className="conta-piatti">clicca su un dipendente per il dettaglio</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Matricola</th><th>Nome</th><th>Reparto</th><th>Pasti</th><th>Quota dipendente</th><th>Quota azienda</th><th /></tr></thead>
              <tbody>
                {dati.dipendenti.map((d) => (
                  <React.Fragment key={d.m}>
                    <tr style={{ cursor: "pointer" }} onClick={() => setEspanso(espanso === d.m ? null : d.m)}>
                      <td className="cifra">{d.m}</td>
                      <td><b>{d.n}</b></td>
                      <td>{d.rep}</td>
                      <td className="quantita">{d.pasti}</td>
                      <td className="cifra">{eur(d.pasti * QUOTA_DIPENDENTE)}</td>
                      <td className="cifra">{eur(d.pasti * (PREZZO_PASTO - QUOTA_DIPENDENTE))}</td>
                      <td style={{ width: 30 }}>
                        <Icone.dx size={13} style={{ transform: espanso === d.m ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                      </td>
                    </tr>
                    {espanso === d.m && (d.dettaglio || []).length > 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: "8px 16px 16px", background: "var(--sfondo)" }}>
                          <div className="res-dettaglio">
                            <div className="res-giorno-riga" style={{ fontWeight: 700, fontSize: 12, color: "var(--muto)", borderBottom: "2px solid var(--linea)" }}>
                              <span>Giorno</span><span>Primo</span><span>Secondo</span><span>Contorno</span>
                            </div>
                            {d.dettaglio.map((g) => (
                              <div className="res-giorno-riga" key={g.giorno}>
                                <span className="data-col">{g.giorno}</span>
                                <span>{g.primo}</span>
                                <span>{g.secondo}</span>
                                <span>{g.contorno}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Importi indicativi. Prezzi, quota aziendale e visibilità del prezzo al dipendente
            sono ancora da definire con MAVI. Il pulsante Excel scarica due fogli, riepilogo e dettaglio giornaliero.
          </div>
        </div>
      </div>
    </>
  );
}

function Fatture() {
  const st = usaStato();
  const committente = st.committenti.find((c) => c.id === "azienda");
  /* solo le proforma intestate a questa azienda: gli importi degli altri
     committenti non devono mai comparire qui */
  const elenco = ordinaProforme(st.proforme.filter((p) => p.committenteId === "azienda"));
  const dovuto = elenco
    .filter((p) => p.stato === "emessa")
    .reduce((s, p) => s + totaliProforma(p).totale, 0);

  return (
    <>
      <Intestazione occhiello="Amministrazione" titolo="Fatture" sotto="Proforma ricevute da MAVI e scadenze di pagamento" />
      <div className="tela">
        <div className="pannello">
          <div className="pannello-testa">
            <h2>Proforma ricevute</h2>
            <span className="conta-piatti">{elenco.length} documenti, {eur(dovuto)} ancora da saldare</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Documento</th><th>Periodo</th><th>Imponibile</th><th>IVA</th><th>Totale</th><th>Scadenza</th><th>Condizioni</th><th>Stato</th><th /></tr></thead>
              <tbody>
                {elenco.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--muto)", padding: 22 }}>
                    Nessuna proforma ricevuta.
                  </td></tr>
                )}
                {elenco.map((p) => {
                  const t = totaliProforma(p);
                  return (
                    <tr key={p.id} className={p.stato === "annullata" || p.stato === "stornata" ? "riga-annullata" : undefined}>
                      <td className="cifra"><b>{p.numero}</b></td>
                      <td>{p.periodo}</td>
                      <td className="cifra">{eur(t.imponibile)}</td>
                      <td className="cifra">{eur(t.iva)}</td>
                      <td className="cifra"><b>{eur(t.totale)}</b></td>
                      <td className="cifra">{dataIt(p.scadenza)}</td>
                      <td style={{ fontSize: 12, color: "var(--muto)" }}>{testoCondizioni(p)}</td>
                      <td><PastigliaProforma stato={p.stato} /></td>
                      <td>
                        {st.puo("fatture.pdf") && (
                          <button className="btn linea piccolo" onClick={() => {
                            generaProformaPDF(p, { datiAziendali: st.datiAziendali, committente, avvisa: st.avvisa });
                          }}>PDF</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Le proforma le emette MAVI, con le condizioni concordate per Rossi Manifatture. Non
            transitano dal Sistema di Interscambio: la fattura elettronica arriva dal gestionale
            contabile. Il pagamento non passa dal portale.
          </div>
        </div>
      </div>
    </>
  );
}
