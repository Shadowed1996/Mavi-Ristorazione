import React from "react";
import {
  COMMITTENTI, CONSISTENZE, DIETE_TERAPEUTICHE, MODELLI, PIATTI, PREZZO_PASTO,
} from "../data.js";
import { DiscoColore, Icone, Illustrazione, Intestazione, Velo } from "../ui.jsx";
import { usaStato } from "../store.jsx";

/* ============================================================
   Coda approvazioni per il responsabile della struttura
   ============================================================ */
export function CodaApprovazioni({ struttura }) {
  const st = usaStato();
  const [motivo, setMotivo] = React.useState(null); // { id }
  const miei = st.ordiniTrasmessi.filter((o) => o.struttura === struttura);
  const attesa = miei.filter((o) => o.stato === "in_attesa");
  const chiusi = miei.filter((o) => o.stato !== "in_attesa");

  return (
    <>
      <Intestazione
        occhiello="Da approvare"
        titolo="Ordini in attesa"
        sotto="Gli operatori inviano qui, tu approvi e la cucina MAVI riceve"
        azioni={
          <button className="btn linea piccolo" onClick={() => attesa.forEach((o) => st.approvaOrdine(o.id))} disabled={!attesa.length}>
            Approva tutti
          </button>
        }
      />
      <div className="tela">
        <div className="numeri">
          <div className="numero"><div className="n-lab">In attesa</div><div className="n-val">{attesa.length}</div><div className="n-nota">da approvare o respingere</div></div>
          <div className="numero"><div className="n-lab">Pasti in coda</div><div className="n-val">{attesa.reduce((s, o) => s + o.pasti, 0)}</div><div className="n-nota">totale delle unità</div></div>
          <div className="numero"><div className="n-lab">Già approvati</div><div className="n-val">{chiusi.filter((o) => o.stato === "approvato").length}</div><div className="n-nota">trasmessi alla cucina</div></div>
          <div className="numero"><div className="n-lab">Chiusura ordini</div><div className="n-val" style={{ fontSize: 24 }}>ore 10:00</div><div className="n-nota">del giorno di consegna</div></div>
        </div>

        <div className="pannello">
          <div className="pannello-testa"><h2>Ordini in attesa</h2></div>
          {attesa.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muto)" }}>
              Nessun ordine in attesa. Torna più tardi.
            </div>
          ) : (
            <div className="scorri">
              <table className="dati">
                <thead>
                  <tr><th>Unità</th><th>Mittente</th><th>Ora</th><th>Pasti</th><th>Note</th><th /></tr>
                </thead>
                <tbody>
                  {attesa.map((o) => (
                    <tr key={o.id}>
                      <td><b>{o.unita}</b></td>
                      <td>{o.mittente}<div className="riservato">{o.ruoloMittente}</div></td>
                      <td className="cifra">{o.ora}</td>
                      <td className="quantita">{o.pasti}</td>
                      <td style={{ fontSize: 12.5, color: "var(--muto)" }}>{o.note}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button className="btn piccolo" onClick={() => st.approvaOrdine(o.id)}>Approva</button>
                          <button className="btn linea piccolo" onClick={() => setMotivo({ id: o.id })}>Respingi</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="pannello-piede">
            Un ordine respinto torna al mittente con la motivazione. Un ordine approvato entra
            nella distinta unica che la cucina prepara alle dieci.
          </div>
        </div>

        {chiusi.length > 0 && (
          <div className="pannello">
            <div className="pannello-testa"><h2>Cronologia della giornata</h2></div>
            <div className="scorri">
              <table className="dati">
                <thead><tr><th>Unità</th><th>Mittente</th><th>Pasti</th><th>Stato</th><th>Approvato alle</th></tr></thead>
                <tbody>
                  {chiusi.map((o) => (
                    <tr key={o.id}>
                      <td><b>{o.unita}</b></td>
                      <td>{o.mittente}</td>
                      <td className="quantita">{o.pasti}</td>
                      <td>{o.stato === "approvato"
                        ? <span className="pastiglia p-ok">approvato</span>
                        : <span className="pastiglia p-err">respinto</span>}</td>
                      <td className="cifra">{o.oraApprov || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {motivo && (
        <Velo onChiudi={() => setMotivo(null)}>
          <div className="modale-corpo">
            <h2 style={{ fontSize: 22 }}>Motivo del respingimento</h2>
            <p className="paragrafo" style={{ marginTop: 8 }}>
              Sarà visibile all'operatore, che potrà correggere e trasmettere di nuovo.
            </p>
            <textarea rows={3} style={{ width: "100%", padding: 12, marginTop: 14, borderRadius: 6, border: "1px solid var(--linea-forte)", fontFamily: "inherit" }}
              placeholder="Es. i pasti dichiarati non tornano con le presenze di stamattina"
              id="mot-txt" />
            <div className="modale-azioni">
              <button className="btn linea" onClick={() => setMotivo(null)}>Annulla</button>
              <button className="btn" onClick={() => {
                const t = document.getElementById("mot-txt").value || "Nessuna motivazione indicata";
                st.respingiOrdine(motivo.id, t); setMotivo(null);
              }}>Respingi ordine</button>
            </div>
          </div>
        </Velo>
      )}
    </>
  );
}

/* ============================================================
   Distinta unica di produzione per la cucina MAVI
   ============================================================ */
export function DistintaUnica() {
  const st = usaStato();
  const [tab, setTab] = React.useState("aggregato");
  const approvati = st.ordiniTrasmessi.filter((o) => o.stato === "approvato");
  const perStruttura = COMMITTENTI.map((c) => {
    const ord = approvati.filter((o) => o.struttura === c.id);
    return { ...c, ordini: ord, pasti: ord.reduce((s, o) => s + o.pasti, 0) };
  }).filter((c) => c.ordini.length > 0);
  const totale = perStruttura.reduce((s, c) => s + c.pasti, 0);

  return (
    <>
      <Intestazione
        occhiello="Cucina MAVI, giovedì 3 settembre 2026"
        titolo="Distinta unica di produzione"
        sotto="Somma di tutti gli ordini approvati oggi, da tutte le strutture servite"
        azioni={<>
          <button className="btn linea piccolo" onClick={() => st.avvisa("Distinta esportata in Excel")}>Excel</button>
          <button className="btn linea piccolo" onClick={() => window.print()}><Icone.stampa size={16} /> Stampa</button>
        </>}
      />
      <div className="tela">
        <div className="numeri">
          <div className="numero"><div className="n-lab">Pasti totali</div><div className="n-val">{totale}</div><div className="n-nota">{perStruttura.length} strutture servite</div></div>
          <div className="numero"><div className="n-lab">Strutture</div><div className="n-val">{perStruttura.length}</div><div className="n-nota">su {COMMITTENTI.length} committenti</div></div>
          <div className="numero"><div className="n-lab">Diete e consistenze</div><div className="n-val">28</div><div className="n-nota">pasti su misura</div></div>
          <div className="numero"><div className="n-lab">Chiusura</div><div className="n-val" style={{ fontSize: 24 }}>ore 10:00</div><div className="n-nota">documento poi congelato</div></div>
        </div>

        <div className="commuta" style={{ marginBottom: 18 }}>
          <button className={tab === "aggregato" ? "on" : ""} onClick={() => setTab("aggregato")}>
            <Icone.griglia size={15} /> Aggregato per piatto
          </button>
          <button className={tab === "struttura" ? "on" : ""} onClick={() => setTab("struttura")}>
            <Icone.edificio size={15} /> Dettaglio per struttura
          </button>
        </div>

        {tab === "aggregato" && <TabellaAggregato perStruttura={perStruttura} totale={totale} />}
        {tab === "struttura" && <TabellaStruttura perStruttura={perStruttura} />}
      </div>
    </>
  );
}

function TabellaAggregato({ perStruttura, totale }) {
  /* nel prodotto reale la scomposizione arriva dalle scelte, qui simulo */
  const distribuzione = [
    ["pas_pom", 0.22], ["ris_fun", 0.14], ["min_orz", 0.10], ["pol_gri", 0.20],
    ["sal_for", 0.14], ["tof_pia", 0.08], ["ins_mis", 0.30], ["pat_for", 0.22], ["ver_gri", 0.20],
  ];
  const righe = distribuzione.map(([id, q]) => ({
    id, quantita: Math.round(totale * q),
    per: perStruttura.map((c) => ({ nome: c.tipo, q: Math.round(c.pasti * q) })).filter((x) => x.q > 0),
  })).filter((r) => r.quantita > 0);
  const max = Math.max(...righe.map((r) => r.quantita));

  return (
    <div className="pannello">
      <div className="pannello-testa">
        <h2>Quantità da produrre, tutte le strutture insieme</h2>
      </div>
      <div className="scorri">
        <table className="dati">
          <thead><tr><th>Piatto</th><th>Colore</th><th>Ripartizione</th><th>Quantità</th></tr></thead>
          <tbody>
            {righe.map((r) => (
              <tr key={r.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="voce-mini" style={{ cursor: "default", width: 42, height: 42 }}><Illustrazione id={r.id} /></span>
                    <b>{PIATTI[r.id].n}</b>
                  </div>
                </td>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <DiscoColore colore={PIATTI[r.id].col} size={11} />
                  </span>
                </td>
                <td style={{ fontSize: 12.5, color: "var(--muto)" }}>
                  {r.per.map((x) => x.nome + " " + x.q).join(" · ")}
                </td>
                <td style={{ minWidth: 180 }}>
                  <span className="quantita">{r.quantita}</span>
                  <div className="progresso"><i style={{ width: Math.round((r.quantita / max) * 100) + "%" }} /></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pannello-piede">
        La colonna Ripartizione mostra come le quantità totali si distribuiscono fra i quattro tipi
        di struttura, così la cucina sa già cosa va dove.
      </div>
    </div>
  );
}

function TabellaStruttura({ perStruttura }) {
  return (
    <>
      {perStruttura.map((c) => (
        <div className="pannello" key={c.id}>
          <div className="pannello-testa">
            <h2>{c.nome}</h2>
            <span className="conta-piatti">{MODELLI[c.modello].nome} · {c.pasti} pasti</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>{c.etichettaUnita}</th><th>Mittente</th><th>Note</th><th>Pasti</th></tr></thead>
              <tbody>
                {c.ordini.map((o) => (
                  <tr key={o.id}>
                    <td><b>{o.unita}</b></td>
                    <td>{o.mittente}<div className="riservato">{o.ruoloMittente}</div></td>
                    <td style={{ fontSize: 12.5, color: "var(--muto)" }}>{o.note}</td>
                    <td className="quantita">{o.pasti}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}

/* ============================================================
   Giri di consegna
   ============================================================ */
export function Giri() {
  const st = usaStato();
  const giri = [
    { furgone: "F1", autista: "Bruno D.", partenza: "10:45", tappe: [
      { struttura: "azienda", nome: "Rossi Manifatture Spa", ora: "11:15", pasti: 28, indirizzo: "Via dell'Industria 14, Varese" },
      { struttura: "comunita", nome: "Comunità Il Ponte, Casa Aurora", ora: "11:40", pasti: 19, indirizzo: "Via Rovera 7, Varese" },
    ]},
    { furgone: "F2", autista: "Carla R.", partenza: "10:30", tappe: [
      { struttura: "scuola", nome: "Istituto Sant'Anna", ora: "11:00", pasti: 118, indirizzo: "Via San Michele 3, Varese" },
    ]},
    { furgone: "F3", autista: "Diego P.", partenza: "11:00", tappe: [
      { struttura: "rsa", nome: "RSA Villa Serena, Nucleo Glicine", ora: "11:20", pasti: 34, indirizzo: "Via delle Cure 22, Varese" },
      { struttura: "rsa", nome: "RSA Villa Serena, Nucleo Magnolia", ora: "11:25", pasti: 27, indirizzo: "Via delle Cure 22, Varese" },
    ]},
  ];
  return (
    <>
      <Intestazione
        occhiello="Logistica, giovedì 3 settembre"
        titolo="Giri di consegna"
        sotto="Ordine di carico dei furgoni e sequenza delle consegne"
        azioni={
          <button className="btn linea piccolo" onClick={() => window.print()}>
            <Icone.stampa size={16} /> Stampa fogli di viaggio
          </button>
        }
      />
      <div className="tela">
        <div className="giri">
          {giri.map((g) => {
            const totale = g.tappe.reduce((s, t) => s + t.pasti, 0);
            return (
              <article className="giro" key={g.furgone}>
                <header className="giro-testa">
                  <span className="giro-furgone">{g.furgone}</span>
                  <div>
                    <b>{g.autista}</b>
                    <span>Partenza ore {g.partenza} · {totale} pasti a bordo</span>
                  </div>
                </header>
                <ol className="giro-tappe">
                  {g.tappe.map((t, i) => (
                    <li key={i}>
                      <span className="giro-ora">{t.ora}</span>
                      <div className="giro-punto">
                        <b>{t.nome}</b>
                        <span>{t.indirizzo}</span>
                      </div>
                      <span className="giro-pasti">{t.pasti}</span>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Etichette dei pasti stampabili
   ============================================================ */
export function Etichette() {
  const st = usaStato();
  const et = [
    { struttura: "RSA Villa Serena", unita: "Nucleo Glicine", ospite: "Ospite 007", dieta: "Iposodica, tritato", allergeni: "GLUTINE", riscaldare: "Microonde 800W, 2 minuti" },
    { struttura: "RSA Villa Serena", unita: "Nucleo Glicine", ospite: "Ospite 012", dieta: "Diabetici, normale", allergeni: "nessuno", riscaldare: "Microonde 800W, 2 minuti" },
    { struttura: "RSA Villa Serena", unita: "Nucleo Magnolia", ospite: "Ospite 023", dieta: "Frullato", allergeni: "LATTE, UOVA", riscaldare: "Bagnomaria" },
    { struttura: "Rossi Manifatture", unita: "Amministrazione", ospite: "Sara Colombo", dieta: "Vegetariana", allergeni: "GLUTINE", riscaldare: "Microonde 800W, 2 minuti" },
    { struttura: "Istituto Sant'Anna", unita: "Primaria 2", ospite: "Bimbo, dieta certificata", dieta: "Senza glutine", allergeni: "GLUTINE (assente)", riscaldare: "Forno 160°, 8 minuti" },
    { struttura: "Comunità Il Ponte", unita: "Casa Aurora", ospite: "Ospite A", dieta: "Standard", allergeni: "nessuno", riscaldare: "Microonde 800W, 2 minuti" },
  ];
  return (
    <>
      <Intestazione
        occhiello="Confezionamento"
        titolo="Etichette dei pasti"
        sotto="Stampabili sulla stampante termica, una per pasto personalizzato"
        azioni={
          <button className="btn piccolo" onClick={() => window.print()}>
            <Icone.stampa size={16} /> Stampa tutte
          </button>
        }
      />
      <div className="tela">
        <div className="avviso info">
          <Icone.attenzione size={18} />
          Le diete speciali richiedono etichetta obbligatoria. Le porzioni standard viaggiano invece
          in multiporzione senza etichetta.
        </div>
        <div className="etichette">
          {et.map((e, i) => (
            <div className="etichetta" key={i}>
              <div className="et-testa">
                <span className="et-marchio">MAVI</span>
                <span className="et-num">#{String(i + 1).padStart(3, "0")}</span>
              </div>
              <div className="et-corpo">
                <b>{e.ospite}</b>
                <span>{e.struttura}</span>
                <span>{e.unita}</span>
              </div>
              <div className="et-dieta">
                <span className="et-lab">Dieta</span>
                <b>{e.dieta}</b>
              </div>
              <div className="et-allergeni">
                <span className="et-lab">Allergeni</span>
                <b>{e.allergeni}</b>
              </div>
              <div className="et-piede">
                <span>{e.riscaldare}</span>
                <span>giovedì 3 set 2026</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Pazienti RSA, anagrafica con scheda
   ============================================================ */
const OSPITI_DEMO = [
  { id: "os007", codice: "007", nome: "Ospite dimostrativo A", nucleo: "Nucleo Glicine", eta: 84, consistenza: "tritato", diete: ["iposodica"], allergeni: [1], note: "Preferisce piatti caldi. Fatica con la carne rossa, meglio bianca." },
  { id: "os012", codice: "012", nome: "Ospite dimostrativo B", nucleo: "Nucleo Glicine", eta: 78, consistenza: "normale", diete: ["diabetica"], allergeni: [], note: "Controllo glicemia post pranzo alle 14:30." },
  { id: "os023", codice: "023", nome: "Ospite dimostrativo C", nucleo: "Nucleo Magnolia", eta: 91, consistenza: "frullato", diete: ["ipoproteica"], allergeni: [7, 3], note: "Assistenza al pasto sempre necessaria, tempi lunghi." },
  { id: "os031", codice: "031", nome: "Ospite dimostrativo D", nucleo: "Nucleo Magnolia", eta: 88, consistenza: "normale", diete: [], allergeni: [], note: "Nessuna prescrizione, gradisce il pesce." },
  { id: "os042", codice: "042", nome: "Ospite dimostrativo E", nucleo: "Nucleo protetto", eta: 76, consistenza: "tritato", diete: ["diabetica", "iposodica"], allergeni: [7], note: "Da servire nella propria stanza, sempre." },
];

export function PazientiRSA() {
  const st = usaStato();
  const [scheda, setScheda] = React.useState(null);
  const [filtro, setFiltro] = React.useState("tutti");

  const visibili = filtro === "tutti" ? OSPITI_DEMO : OSPITI_DEMO.filter((o) => o.nucleo === filtro);
  const nuclei = ["tutti", ...new Set(OSPITI_DEMO.map((o) => o.nucleo))];

  return (
    <>
      <Intestazione
        occhiello="Anagrafica dati dimostrativi"
        titolo="Pazienti e diete"
        sotto="Ogni ospite ha la propria scheda, il sistema tiene conto delle sue prescrizioni negli ordini"
        azioni={<>
          <button className="btn linea piccolo" onClick={() => st.avvisa("Anagrafica esportata")}>
            <Icone.scarica size={16} /> Export
          </button>
          <button className="btn piccolo" onClick={() => st.avvisa("Nuova scheda paziente")}>
            Nuovo paziente
          </button>
        </>}
      />
      <div className="tela">
        <div className="avviso info" style={{ alignItems: "flex-start" }}>
          <Icone.attenzione size={18} />
          <span>
            Nomi e dati sono di fantasia, solo a scopo dimostrativo. Nel prodotto reale queste
            informazioni sono dati sanitari e vanno protette con cifratura, accessi tracciati e
            consenso documentato dell'ospite o del familiare tutore.
          </span>
        </div>

        <div className="filtri-nuclei">
          {nuclei.map((n) => (
            <button key={n} className={n === filtro ? "on" : ""} onClick={() => setFiltro(n)}>
              {n === "tutti" ? "Tutti i nuclei" : n}
              <em>{n === "tutti" ? OSPITI_DEMO.length : OSPITI_DEMO.filter((o) => o.nucleo === n).length}</em>
            </button>
          ))}
        </div>

        <div className="pazienti">
          {visibili.map((o) => (
            <article className="paziente" key={o.id} onClick={() => setScheda(o)}>
              <span className="paz-codice">#{o.codice}</span>
              <div className="paz-corpo">
                <b>{o.nome}</b>
                <span>{o.nucleo} · {o.eta} anni</span>
                <div className="paz-etichette">
                  {o.diete.length > 0 && o.diete.map((d) => (
                    <span key={d} className="et-piccola dieta">{DIETE_TERAPEUTICHE.find((x) => x.id === d)?.nome || d}</span>
                  ))}
                  {o.consistenza !== "normale" && (
                    <span className="et-piccola consist">{CONSISTENZE.find((c) => c.id === o.consistenza)?.nome}</span>
                  )}
                  {o.allergeni.length > 0 && (
                    <span className="et-piccola allerg">{o.allergeni.length} allergeni</span>
                  )}
                  {o.diete.length === 0 && o.consistenza === "normale" && o.allergeni.length === 0 && (
                    <span className="et-piccola ok">Standard</span>
                  )}
                </div>
              </div>
              <span className="paz-freccia"><Icone.dx size={16} /></span>
            </article>
          ))}
        </div>
      </div>

      {scheda && <SchedaPaziente ospite={scheda} onChiudi={() => setScheda(null)} />}
    </>
  );
}

function SchedaPaziente({ ospite, onChiudi }) {
  const st = usaStato();
  return (
    <Velo onChiudi={onChiudi}>
      <div className="scelta-testa">
        <div className="occhiello">Scheda paziente</div>
        <h2>{ospite.nome}</h2>
        <p>{ospite.nucleo} · {ospite.eta} anni · codice {ospite.codice}</p>
      </div>
      <div className="modulo">
        <div className="modulo-riga due">
          <label>
            <span>Consistenza</span>
            <select defaultValue={ospite.consistenza}>
              {CONSISTENZE.map((c) => (<option key={c.id} value={c.id}>{c.nome}</option>))}
            </select>
          </label>
          <label>
            <span>Assistenza al pasto</span>
            <select defaultValue="parziale">
              <option value="no">Autonomo</option>
              <option value="parziale">Parziale</option>
              <option value="totale">Totale</option>
            </select>
          </label>
        </div>

        <label className="modulo-blocco">
          <span>Diete e prescrizioni attive</span>
          <div className="scelta-allergeni">
            {DIETE_TERAPEUTICHE.map((d) => (
              <button type="button" key={d.id}
                className={"pillola-allergene" + (ospite.diete.includes(d.id) ? " on" : "")}>
                {d.nome}
              </button>
            ))}
          </div>
        </label>

        <label className="modulo-blocco">
          <span>Preferenze e note dello staff</span>
          <textarea rows={3} defaultValue={ospite.note} />
        </label>

        <div className="modulo-blocco">
          <span className="modulo-lab">Effetto sull'ordine di oggi</span>
          <div className="effetto">
            <Icone.ok size={16} />
            <span>
              Quando ordini per il nucleo, il sistema conta automaticamente
              <b> 1 pasto {CONSISTENZE.find((c) => c.id === ospite.consistenza)?.nome.toLowerCase()}</b>
              {ospite.diete.length > 0 && <> con dieta <b>{DIETE_TERAPEUTICHE.find((x) => x.id === ospite.diete[0])?.nome.toLowerCase()}</b></>}
              {ospite.allergeni.length > 0 && <> ed esclude gli allergeni <b>{ospite.allergeni.join(", ")}</b></>}.
            </span>
          </div>
        </div>
      </div>
      <div className="scelta-piede modulo-piede">
        <button className="btn linea" onClick={onChiudi}>Chiudi</button>
        <button className="btn" onClick={() => { st.avvisa("Scheda paziente aggiornata"); onChiudi(); }}>Salva</button>
      </div>
    </Velo>
  );
}

/* ============================================================
   Menu ciclico a rotazione, quattro settimane
   ============================================================ */
export function MenuCiclico() {
  const st = usaStato();
  const [settimana, setSettimana] = React.useState(1);
  const [stagione, setStagione] = React.useState("autunno");

  const SETTIMANE = [1, 2, 3, 4];
  const STAGIONI = [
    { id: "primavera", nome: "Primavera", periodo: "marzo · maggio" },
    { id: "estate", nome: "Estate", periodo: "giugno · agosto" },
    { id: "autunno", nome: "Autunno", periodo: "settembre · novembre" },
    { id: "inverno", nome: "Inverno", periodo: "dicembre · febbraio" },
  ];

  return (
    <>
      <Intestazione
        occhiello="Programmazione stagionale"
        titolo="Menu ciclico"
        sotto="Quattro settimane che ruotano, una stagione alla volta. Cambia solo quando cambia il menu di base."
        azioni={<>
          <button className="btn linea piccolo" onClick={() => st.avvisa("Menu duplicato sulla stagione successiva")}>
            Duplica su altra stagione
          </button>
          <button className="btn piccolo" onClick={() => st.avvisa("Menu ciclico pubblicato, entra in vigore da lunedì")}>
            Pubblica ciclo
          </button>
        </>}
      />
      <div className="tela">
        <div className="stagioni">
          {STAGIONI.map((s) => (
            <button key={s.id} className={"stagione" + (stagione === s.id ? " on" : "")} onClick={() => setStagione(s.id)}>
              <b>{s.nome}</b>
              <span>{s.periodo}</span>
            </button>
          ))}
        </div>

        <div className="giorni-tab" style={{ marginTop: 18 }}>
          {SETTIMANE.map((n) => (
            <button key={n} className={n === settimana ? "on" : ""} onClick={() => setSettimana(n)}>
              Settimana {n}<span>del ciclo</span>
            </button>
          ))}
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Settimana {settimana}, stagione {STAGIONI.find((s) => s.id === stagione).nome.toLowerCase()}</h2>
            <span className="conta-piatti">36 piatti pianificati</span>
          </div>
          <div style={{ padding: 22 }}>
            <p className="paragrafo" style={{ marginBottom: 14 }}>
              Il menu della settimana si compone come nella pagina Menu settimana, ma qui vive
              dentro un ciclo. Ogni quattro settimane si ricomincia dalla prima. All'inizio della
              stagione successiva parte una nuova rotazione, così i piatti seguono la stagionalità.
            </p>
            <div className="ciclo-schema">
              {SETTIMANE.map((n) => (
                <div key={n} className={"ciclo-cella" + (n === settimana ? " attiva" : "")}>
                  <b>Settimana {n}</b>
                  <span>{n === 1 ? "corrente" : n === 2 ? "prossima" : "successive"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pannello-piede">
            La rotazione a quattro settimane è la prassi nelle mense scolastiche e nelle RSA, e
            corrisponde alle indicazioni delle linee guida SIAN.
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Impostazioni per committente
   ============================================================ */
export function ImpostazioniCommittente() {
  const st = usaStato();
  const [scelto, setScelto] = React.useState(COMMITTENTI[0].id);
  const c = COMMITTENTI.find((x) => x.id === scelto);

  return (
    <>
      <Intestazione
        occhiello="Configurazione"
        titolo="Impostazioni del committente"
        sotto="Ogni struttura può avere il proprio orario limite, le proprie regole di composizione e il proprio listino"
      />
      <div className="tela">
        <div className="strutture" style={{ marginBottom: 22 }}>
          {COMMITTENTI.map((x) => (
            <button key={x.id} className={"struttura" + (scelto === x.id ? " on" : "")} onClick={() => setScelto(x.id)}>
              <b>{x.tipo}</b>
              <span>{x.nome}</span>
              <em>{MODELLI[x.modello].nome}</em>
            </button>
          ))}
        </div>

        <div className="due-colonne">
          <div className="pannello">
            <div className="pannello-testa"><h2>Orari</h2></div>
            <div className="modulo">
              <label>
                <span>Orario limite di chiusura ordini</span>
                <select defaultValue={c.modello === "presenze" ? "09:30" : "14:00"}>
                  <option>09:30</option><option>10:00</option><option>14:00</option><option>16:00</option><option>17:00</option>
                </select>
              </label>
              <label>
                <span>Riferimento del limite</span>
                <select defaultValue={c.modello === "presenze" ? "giorno_stesso" : "giorno_prima"}>
                  <option value="giorno_prima">Giorno precedente</option>
                  <option value="giorno_stesso">Giorno stesso</option>
                </select>
              </label>
              <label>
                <span>Orario di consegna previsto</span>
                <input type="text" defaultValue="11:00 · 11:45" />
              </label>
            </div>
          </div>

          <div className="pannello">
            <div className="pannello-testa"><h2>Regole di composizione del pasto</h2></div>
            <div className="modulo">
              <label>
                <span>Composizione minima obbligatoria</span>
                <select defaultValue={c.modello === "presenze" ? "gllRV" : "gllRVo"}>
                  <option value="gllRVo">Primo o piatto unico, più contorno</option>
                  <option value="gllRVsecondo">Primo, secondo e contorno</option>
                  <option value="gllRV">Menu vidimato, non componibile</option>
                </select>
              </label>
              <label>
                <span>Piatti unici ammessi</span>
                <select defaultValue="si">
                  <option value="si">Sì, sostituiscono le portate previste</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label>
                <span>Frutta obbligatoria</span>
                <select defaultValue={c.modello === "presenze" ? "si" : "no"}>
                  <option value="si">Sì, viola sempre presente</option>
                  <option value="no">No, facoltativa</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa"><h2>Listino e fatturazione</h2></div>
          <div className="modulo">
            <div className="modulo-riga tre">
              <label>
                <span>Prezzo a pasto</span>
                <input type="text" defaultValue={"€ " + PREZZO_PASTO.toFixed(2).replace(".", ",")} />
              </label>
              <label>
                <span>Maggiorazione dieta speciale</span>
                <input type="text" defaultValue="€ 0,00" />
              </label>
              <label>
                <span>Cadenza fatturazione</span>
                <select defaultValue="mensile">
                  <option value="mensile">Mensile</option>
                  <option value="quindicinale">Quindicinale</option>
                  <option value="settimanale">Settimanale</option>
                </select>
              </label>
            </div>
            <label className="modulo-blocco">
              <span>Fatturazione elettronica</span>
              <div className="scelta-allergeni">
                <button type="button" className="pillola-allergene on">Genera PDF conforme</button>
                <button type="button" className="pillola-allergene">Invio automatico SDI, non attivo</button>
              </div>
            </label>
          </div>
          <div className="pannello-piede">
            La piattaforma genera fatture e proforme in PDF conformi. L'invio al Sistema di Interscambio
            resta esterno: viene affidato al commercialista o al gestionale esistente, per non
            immischiare responsabilità con l'Agenzia delle Entrate.
          </div>
        </div>
      </div>
    </>
  );
}
