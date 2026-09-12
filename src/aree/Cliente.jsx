import React from "react";
import { CATEGORIE, DIPENDENTI, FATTURE, PIATTI, PREZZO_PASTO, QUOTA_DIPENDENTE, RESOCONTO_MENSILE, menuDelGiorno } from "../data.js";
import { Accesso, DiscoColore, Documenti, Icone, Intestazione, Messaggi, Telaio, Velo } from "../ui.jsx";
import { usaStato } from "../store.jsx";

const VOCI = [
  ["cruscotto", "Cruscotto", Icone.grafico],
  ["dipendenti", "Dipendenti", Icone.gente],
  ["resoconti", "Resoconti", Icone.lista],
  ["fatture", "Fatture", Icone.fattura],
  ["documenti", "Documenti", Icone.lista],
];



const eur = (n) => "€ " + n.toFixed(2).replace(".", ",");

export default function Cliente({ onEsci, utente }) {
  const [dentro, setDentro] = React.useState(!!utente);
  const [pagina, setPagina] = React.useState("cruscotto");
  const st = usaStato();

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
      voci={VOCI}
      pagina={pagina}
      setPagina={setPagina}
      onEsci={() => (onEsci ? onEsci() : null)}
    >
      {pagina === "cruscotto" && <Cruscotto />}
      {pagina === "dipendenti" && <Dipendenti />}
      {pagina === "resoconti" && <Resoconti />}
      {pagina === "fatture" && <Fatture />}
      {pagina === "documenti" && <Documenti />}
      <Messaggi lista={st.messaggi} />
    </Telaio>
  );
}

function Cruscotto() {
  const st = usaStato();
  const [prenota, setPrenota] = React.useState(null); // dipendente selezionato
  const [scelte, setScelte] = React.useState({});

  function confermaPrenotazione() {
    const nPortate = Object.keys(scelte).length;
    Object.entries(scelte).forEach(([categoria, id]) => st.scegli(2, categoria, id));
    st.conferma(2, { nome: prenota.n, ruolo: "Referente (per conto suo)" });
    st.avvisa("Prenotazione confermata per " + prenota.n + ": " + nPortate + " portate. Il dipendente riceverà la conferma via email.");
    setPrenota(null);
    setScelte({});
  }

  return (
    <>
      <Intestazione occhiello="Rossi Manifatture Spa" titolo="Cruscotto" sotto="Mensa aziendale, situazione aggiornata a oggi" />
      <div className="tela">
        <div className="numeri">
          <div className="numero"><div className="n-lab">Dipendenti attivi</div><div className="n-val">{DIPENDENTI.filter((d) => d.stato === "attivo").length}</div><div className="n-nota">su {DIPENDENTI.length} utenze create</div></div>
          <div className="numero"><div className="n-lab">Prenotazioni di domani</div><div className="n-val">22</div><div className="n-nota">su 28 possibili</div><div className="progresso"><i style={{ width: "79%" }} /></div></div>
          <div className="numero"><div className="n-lab">Pasti del mese</div><div className="n-val">143</div><div className="n-nota">media 20 al giorno</div></div>
          <div className="numero"><div className="n-lab">Diete speciali attive</div><div className="n-val">4</div><div className="n-nota">2 senza glutine, 2 vegetariane</div></div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Chi non ha ancora prenotato per domani</h2>
            <div className="az">
              <button className="btn piccolo" onClick={() => st.avvisa("Promemoria inviato ai tre dipendenti")}>Invia promemoria</button>
            </div>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Matricola</th><th>Nome</th><th>Reparto</th><th /></tr></thead>
              <tbody>
                {DIPENDENTI.slice(3, 6).map((d) => (
                  <tr key={d.m}>
                    <td className="cifra">{d.m}</td>
                    <td><b>{d.n}</b></td>
                    <td>{d.rep}</td>
                    <td>
                      <button className="btn linea piccolo" onClick={() => { setPrenota(d); setScelte({}); }}>
                        Prenota per lui
                      </button>
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
            <div className="occhiello">Prenotazione per conto di un dipendente · Mercoledì 16 settembre</div>
            <h2>Prenota per {prenota.n}</h2>
            <p>{prenota.rep} · Matricola {prenota.m}</p>
          </div>

          <div className="scheda-ospite" style={{ padding: "16px 24px" }}>
            {["primo", "sost_primo", "secondo", "sost_secondo", "contorno", "unico"].map((catId) => {
              const cat = CATEGORIE.find((c) => c.id === catId);
              if (!cat) return null;
              const piatti = menuDelGiorno(st.menu, 2, catId);
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
        azioni={<>
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
                      <button className="btn linea piccolo" onClick={() => st.avvisa("Password reimpostata, email inviata")}>
                        Reimposta password
                      </button>
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

function Resoconti() {
  const st = usaStato();
  const [espanso, setEspanso] = React.useState(null);
  const dati = RESOCONTO_MENSILE.azienda;

  async function esportaExcel() {
    try {
      const { scaricaExcel } = await import("../excel.js");
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
      ]);
      st.avvisa("Resoconto Excel scaricato con riepilogo e dettaglio giornaliero");
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nell'export Excel, riprova");
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
      ]);
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
        azioni={<>
          <button className="btn linea piccolo" onClick={esportaExcel}><Icone.scarica size={16} /> Excel</button>
          <button className="btn linea piccolo" onClick={() => st.avvisa("Resoconto PDF generato")}>PDF</button>
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
  return (
    <>
      <Intestazione occhiello="Amministrazione" titolo="Fatture" sotto="Documenti ricevuti e stato dei pagamenti" />
      <div className="tela">
        <div className="pannello">
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Documento</th><th>Periodo</th><th>Pasti</th><th>Importo</th><th>Stato</th><th>Esito SDI</th><th /></tr></thead>
              <tbody>
                {FATTURE.map((f) => (
                  <tr key={f.num}>
                    <td className="cifra">{f.num}</td>
                    <td>{f.periodo}</td>
                    <td className="quantita">{f.pasti}</td>
                    <td className="cifra">€ {f.imp}</td>
                    <td>
                      {f.stato === "pagata" ? <span className="pastiglia p-ok">pagata</span>
                        : f.stato === "da pagare" ? <span className="pastiglia p-att">da pagare</span>
                          : <span className="pastiglia p-neu">in maturazione</span>}
                    </td>
                    <td>{f.sdi === "consegnata" ? <span className="pastiglia p-ok">consegnata</span> : <span className="pastiglia p-neu">non emessa</span>}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button className="btn linea piccolo" onClick={async () => {
                          const { generaProformaPDF } = await import("../proforma.js");
                          generaProformaPDF([{ nome: "Rossi Manifatture Spa", tipo: "Azienda", pasti: f.pasti, mese: f.periodo }], 7.50);
                        }}>PDF</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Capitolo ancora aperto. Modalità di pagamento, quota aziendale e ciclo di
            fatturazione vanno definiti con MAVI.
          </div>
        </div>
      </div>
    </>
  );
}
