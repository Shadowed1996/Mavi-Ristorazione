import React from "react";
import {
  AGGREGATO, ALLERGENI, CATEGORIE, splitPiatto, COLORI, FLUSSI_ORDINE, GIORNI, GIRI, IMPOSTAZIONI_INIZIALI, INGREDIENTI_DIETE, MARCATORI, PIATTI, catalogoPerCategoria, sostituisce,
} from "../data.js";
import {
  Accesso, DiscoColore, Documenti, Icone, Illustrazione, Intestazione, Messaggi,
  Telaio, Velo, schedaPdf,
} from "../ui.jsx";
import { usaStato } from "../store.jsx";
import { ModelliServizio } from "./Modelli.jsx";

const VOCI = [
  ["produzione", "Produzione", Icone.cuoco],
  ["flussi", "Ordini in arrivo", Icone.lista],
  ["consegne", "Giri di consegna", Icone.sacco],
  ["etichette", "Etichette pasto", Icone.stampa],
  ["modelli", "Committenti", Icone.edificio],
  ["impostazioni", "Impostazioni", Icone.calendario],
  ["settimana", "Menu settimana", Icone.calendario],
  ["catalogo", "Catalogo piatti", Icone.piatto],
  ["fatturazione", "Fatturazione", Icone.fattura],
  ["log", "Log operazioni", Icone.lista],
  ["gestione", "Gestione portale", Icone.calendario],
  ["documenti", "Documenti", Icone.lista],
];

export default function Fornitore({ diretto, onEsci }) {
  const [dentro, setDentro] = React.useState(!!diretto);
  const [pagina, setPagina] = React.useState("produzione");
  const st = usaStato();

  if (!dentro)
    return (
      <Accesso
        area="fornitore"
        titolo="Portale MAVI"
        claim="Un solo documento, <em>certo</em>, per la cucina."
        punti={[
          "Distinta di produzione aggregata per azienda e reparto",
          "Menu della settimana con piatti fissi e rotazione",
          "Catalogo, allergeni, schede prodotto e fatturazione",
        ]}
        utente="cucina.mavi"
        password="dimostrazione"
        onEntra={() => setDentro(true)}
        onIndietro={() => (onEsci ? onEsci() : null)}
      />
    );

  return (
    <Telaio
      area="fornitore"
      marchio="Portale fornitore"
      ruolo="MAVI Ristorazione"
      utente={{ iniziali: "MV", nome: "Cucina centrale", sotto: "MAVI Ristorazione" }}
      voci={VOCI}
      pagina={pagina}
      setPagina={setPagina}
      onEsci={() => (onEsci ? onEsci() : null)}
    >
      {pagina === "produzione" && <Produzione />}
      {pagina === "flussi" && <FlussiOrdine />}
      {pagina === "consegne" && <GiriConsegna />}
      {pagina === "etichette" && <EtichettePasto />}
      {pagina === "modelli" && <ModelliServizio />}
      {pagina === "impostazioni" && <ImpostazioniServizio />}
      {pagina === "settimana" && <Settimana />}
      {pagina === "catalogo" && <Catalogo />}
      {pagina === "fatturazione" && <Fatturazione />}
      {pagina === "log" && <LogOperazioni />}
      {pagina === "gestione" && <GestionePortale />}
      {pagina === "documenti" && <Documenti gestibile />}
      <Messaggi lista={st.messaggi} />
    </Telaio>
  );
}

/* ==================== distinta di produzione, multi struttura ==================== */
const CONTRIBUTI_STRUTTURE = [
  { id: "azienda", nome: "Rossi Manifatture Spa", tipo: "Azienda", chiusura: "mar 14:00", stato: "chiuso" },
  { id: "rsa", nome: "RSA Villa Serena", tipo: "RSA", chiusura: "mar 16:00", stato: "chiuso" },
  { id: "comunita", nome: "Comunità Il Ponte", tipo: "Comunità", chiusura: "mar 16:00", stato: "chiuso" },
  { id: "scuola", nome: "Istituto Sant'Anna", tipo: "Scuola", chiusura: "mer 9:30", stato: "in attesa" },
];

function Produzione() {
  const st = usaStato();
  const [filtro, setFiltro] = React.useState("tutte");

  /* aggregato azienda dai vassoi confermati + AGGREGATO base */
  const aggAzienda = React.useMemo(() => {
    const a = { ...AGGREGATO };
    Object.keys(st.confermati).forEach((g) => {
      Object.values(st.ordini[g] || {}).forEach((id) => { a[id] = (a[id] || 0) + 1; });
    });
    return a;
  }, [st.ordini, st.confermati]);

  /* aggregato RSA e comunità: contiamo le teste per dieta e supponiamo il menu del giorno */
  const contaUnita = (righe) =>
    righe.reduce((s, r) => s + Object.keys(r).filter((k) => k !== "unita").reduce((x, k) => x + r[k], 0), 0);
  const aggComunita = contaUnita(st.unita.comunita || []);

  /* piatti del giorno per struttura, usiamo i primi tre del menu di mercoledì */
  const menuOggi = ["ris_fun", "pol_sug", "ver_gri", "pas_arr"];
  const perStruttura = {
    azienda: aggAzienda,
    comunita: menuOggi.slice(0, 3).reduce((o, id, i) => { o[id] = Math.round(aggComunita / 3); return o; }, {}),
  };

  /* somma totale per piatto */
  const totali = {};
  Object.entries(perStruttura).forEach(([sId, aggr]) => {
    if (filtro !== "tutte" && filtro !== sId) return;
    Object.entries(aggr).forEach(([id, q]) => { totali[id] = (totali[id] || 0) + q; });
  });
  const righe = Object.keys(totali).sort((a, b) => totali[b] - totali[a]);
  const massimo = Math.max(1, ...Object.values(totali));
  const complessivo = Object.values(totali).reduce((a, b) => a + b, 0);

  const dietePartic = (st.unita.comunita || []).reduce((s, r) => s + (r.iposodica || 0) + (r.diabetica || 0) + (r.senza_glutine || 0), 0);
  const consistenze = (st.unita.comunita || []).reduce((s, r) => s + (r.tritato || 0) + (r.frullato || 0), 0);

  return (
    <>
      <Intestazione
        occhiello="Mercoledì 2 settembre 2026"
        titolo="Distinta di produzione"
        sotto="Documento unico, aggrega quello che arriva da tutte le strutture servite"
        azioni={<>
          <button className="btn linea piccolo" onClick={() => st.avvisa("Distinta esportata in Excel")}>Excel</button>
          <button className="btn linea piccolo" onClick={() => st.avvisa("Distinta esportata in PDF")}>PDF</button>
          <button className="btn linea piccolo" onClick={() => window.print()}><Icone.stampa size={16} /> Stampa</button>
        </>}
      />
      <div className="tela">
        <div className="numeri">
          <div className="numero">
            <div className="n-lab">Pasti totali</div>
            <div className="n-val">{complessivo}</div>
            <div className="n-nota">{CONTRIBUTI_STRUTTURE.length} strutture servite</div>
          </div>
          <div className="numero">
            <div className="n-lab">Diete particolari</div>
            <div className="n-val">{dietePartic + 4}</div>
            <div className="n-nota">terapeutiche, sanitarie e etiche</div>
          </div>
          <div className="numero">
            <div className="n-lab">Consistenze modificate</div>
            <div className="n-val">{consistenze}</div>
            <div className="n-nota">tritato e frullato</div>
          </div>
          <div className="numero">
            <div className="n-lab">Ultima chiusura</div>
            <div className="n-val" style={{ fontSize: 22 }}>mer 9:30</div>
            <div className="n-nota">rilevazione scuole</div>
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Contributi per struttura</h2>
            <span className="conta-piatti">{CONTRIBUTI_STRUTTURE.length} committenti</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr><th>Struttura</th><th>Tipo</th><th>Chiusura</th><th>Pasti</th><th>Stato</th><th /></tr>
              </thead>
              <tbody>
                {CONTRIBUTI_STRUTTURE.map((c) => {
                  const pasti = c.id === "azienda"
                    ? Object.values(aggAzienda).reduce((a, b) => a + b, 0)
                    : aggComunita;
                  const attivo = filtro === c.id;
                  return (
                    <tr key={c.id}>
                      <td><b>{c.nome}</b></td>
                      <td><span className="pastiglia p-neu">{c.tipo}</span></td>
                      <td className="cifra">{c.chiusura}</td>
                      <td className="quantita">{pasti}</td>
                      <td>
                        {c.stato === "chiuso"
                          ? <span className="pastiglia p-ok">trasmesso</span>
                          : <span className="pastiglia p-att">in attesa</span>}
                      </td>
                      <td>
                        <button className={"btn piccolo" + (attivo ? "" : " linea")}
                          onClick={() => setFiltro(attivo ? "tutte" : c.id)}>
                          {attivo ? "Mostra tutte" : "Filtra questa"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            La cucina lavora sulla somma. I contributi restano visibili per capire chi ha
            trasmesso e chi no, e per ripartire dopo consegne e resi.
          </div>
        </div>

        {filtro !== "tutte" && (
          <div className="banner-dieta" style={{ background: "#eef3fa", borderColor: "#b8cce0", color: "#2c4a6c" }}>
            <Icone.attenzione size={15} />
            Stai vedendo solo i dati di <b>{CONTRIBUTI_STRUTTURE.find((c) => c.id === filtro)?.nome}</b>
            <button className="btn linea piccolo" style={{ marginLeft: "auto" }} onClick={() => setFiltro("tutte")}>Mostra tutte</button>
          </div>
        )}

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Quantità da produrre</h2>
            <span className="conta-piatti">
              {filtro === "tutte" ? "somma di tutte le strutture" : "solo " + CONTRIBUTI_STRUTTURE.find((c) => c.id === filtro).nome}
            </span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr>
                  <th>Piatto</th>
                  <th>Colore</th>
                  {filtro === "tutte" && <>
                    <th>Azienda</th><th>RSA</th><th>Comunità</th><th>Scuola</th>
                  </>}
                  <th>Totale</th>
                </tr>
              </thead>
              <tbody>
                {righe.map((id) => (
                  <tr key={id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span className="voce-mini" style={{ cursor: "default" }}><Illustrazione id={id} /></span>
                        <b>{PIATTI[id].n}</b>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                        <DiscoColore colore={PIATTI[id].col} size={11} />
                        {COLORI[PIATTI[id].col].nome}
                      </span>
                    </td>
                    {filtro === "tutte" && ["azienda", "comunita"].map((k) => (
                      <td key={k} className="cifra">{perStruttura[k][id] || 0}</td>
                    ))}
                    <td style={{ minWidth: 180 }}>
                      <span className="quantita">{totali[id]}</span>
                      <div className="progresso"><i style={{ width: Math.round((totali[id] / massimo) * 100) + "%" }} /></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Il dato dell'azienda cresce con le prenotazioni del prototipo. Gli altri contributi
            sono di esempio, calcolati dai numeri dichiarati dalle strutture.
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== menu della settimana, editabile ==================== */
function Settimana() {
  const st = usaStato();
  const [giorno, setGiorno] = React.useState(0);
  const [categoria, setCategoria] = React.useState("primo");
  const [cerca, setCerca] = React.useState("");
  const [stampa, setStampa] = React.useState(false);
  const [settimanaIdx, setSettimanaIdx] = React.useState(0);
  const SETTIMANE = [
    "Settimana 35, 24 · 28 agosto 2026",
    "Settimana 36, 31 agosto · 4 settembre 2026",
    "Settimana 37, 7 · 11 settembre 2026",
    "Settimana 38, 14 · 18 settembre 2026",
  ];

  const fissi = st.menu.fissi[categoria] || [];
  const delGiorno = (st.menu.variabili[giorno] || {})[categoria] || [];
  const cat = CATEGORIE.find((c) => c.id === categoria);

  const catalogo = catalogoPerCategoria(categoria)
    .filter((id) => !delGiorno.includes(id) && !fissi.includes(id))
    .filter((id) => PIATTI[id].n.toLowerCase().includes(cerca.toLowerCase()));

  if (stampa) return <GrigliaStampa onIndietro={() => setStampa(false)} />;

  return (
    <>
      <Intestazione
        occhiello={SETTIMANE[settimanaIdx]}
        titolo="Composizione del menu"
        sotto="Scegli il giorno, poi la portata. I piatti si aggiungono dal catalogo a destra."
        azioni={<>
          <button className="btn linea piccolo" onClick={st.ripristinaMenu}>Ripristina</button>
          <button className="btn linea piccolo" onClick={() => setStampa(true)}>
            <Icone.calendario size={16} /> Griglia settimana
          </button>
          <button className="btn piccolo" onClick={() => st.avvisa("Menu pubblicato, i dipendenti lo vedono da subito")}>
            Pubblica
          </button>
        </>}
      />
      <div className="tela">
        <div className="strumenti" style={{ marginBottom: 12 }}>
          <button className="nav-tondo" onClick={() => { setSettimanaIdx(Math.max(0, settimanaIdx - 1)); if (settimanaIdx > 0) st.avvisa("Settimana precedente caricata"); }}><Icone.sx size={16} /></button>
          <div className="settimana">{SETTIMANE[settimanaIdx].split(", ")[1]}</div>
          <button className="nav-tondo" onClick={() => { setSettimanaIdx(Math.min(SETTIMANE.length - 1, settimanaIdx + 1)); if (settimanaIdx < SETTIMANE.length - 1) st.avvisa("Settimana successiva caricata"); }}><Icone.dx size={16} /></button>
        </div>
        <div className="giorni-tab">
          {GIORNI.map((g, i) => (
            <button key={g.n} className={i === giorno ? "on" : ""} onClick={() => setGiorno(i)}>
              {g.n}<span>{g.d}</span>
            </button>
          ))}
        </div>

        <div className="compositore">
          <div>
            {CATEGORIE.map((c) => {
              const lista = (st.menu.variabili[giorno] || {})[c.id] || [];
              const fis = st.menu.fissi[c.id] || [];
              const attiva = c.id === categoria;
              return (
                <section className={"blocco-cat" + (attiva ? " attivo" : "")} key={c.id}>
                  <div className="blocco-testa">
                    <h4>{c.nome}</h4>
                    <span className="conta">
                      {lista.length + fis.length} piatti
                      {fis.length ? ", di cui " + fis.length + " fissi" : ""}
                    </span>
                    <button className={"btn piccolo" + (attiva ? "" : " linea")} onClick={() => setCategoria(c.id)}>
                      {attiva ? "In modifica" : "Modifica"}
                    </button>
                  </div>
                  {lista.length + fis.length === 0 ? (
                    <div className="blocco-lista vuota">Nessun piatto previsto per questa portata.</div>
                  ) : (
                    <ListaOrdinabile
                      giorno={giorno}
                      categoria={c.id}
                      variabili={lista}
                      fissi={fis}
                    />
                  )}
                </section>
              );
            })}
          </div>

          <aside className="catalogo-lato">
            <div className="catalogo-testa">
              <div className="occhiello">{GIORNI[giorno].n} {GIORNI[giorno].d}</div>
              <h3>{cat.nome}</h3>
              <p>Tocca un piatto per aggiungerlo alla portata.</p>
            </div>
            <div className="catalogo-cerca">
              <input type="text" placeholder="Cerca nel catalogo" value={cerca} onChange={(e) => setCerca(e.target.value)} />
            </div>
            <div className="catalogo-lista">
              {catalogo.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--muto)", margin: "8px 4px" }}>
                  Nessun piatto disponibile con questo filtro.
                </p>
              )}
              {catalogo.map((id) => (
                <button key={id} className="catalogo-voce" onClick={() => st.cambiaMenu(giorno, categoria, id)}>
                  <span className="disco"><Illustrazione id={id} /></span>
                  <span className="corpo">
                    <b>{PIATTI[id].n}</b>
                    <span>
                      {COLORI[PIATTI[id].col].nome} · {PIATTI[id].kcal} kcal
                      {PIATTI[id].a.length ? " · allergeni " + PIATTI[id].a.join(", ") : ""}
                    </span>
                  </span>
                  <span className="piu">+</span>
                </button>
              ))}
            </div>
            <div className="scelta-piede">
              <button className="btn linea pieno" onClick={() => st.cambiaMenu("fissi", categoria, catalogo[0])} disabled={!catalogo.length}>
                Aggiungi il primo come piatto fisso
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function ListaOrdinabile({ giorno, categoria, variabili, fissi }) {
  const st = usaStato();
  const [trascinato, setTrascinato] = React.useState(null);
  return (
    <div className="blocco-lista">
      {variabili.map((id, i) => (
        <RigaPiatto
          key={id}
          id={id}
          indice={i}
          trascinato={trascinato}
          setTrascinato={setTrascinato}
          onSposta={(da, a) => {
            if (a < 0 || a >= variabili.length) return;
            st.riordinaMenu(giorno, categoria, da, a);
          }}
          onTogli={() => st.cambiaMenu(giorno, categoria, id)}
        />
      ))}
      {fissi.map((id) => (
        <RigaPiatto key={id} id={id} fisso indice={-1} onTogli={() => st.cambiaMenu("fissi", categoria, id)} />
      ))}
    </div>
  );
}

function RigaPiatto({ id, fisso, indice, onTogli, onSposta, trascinato, setTrascinato }) {
  const p = PIATTI[id];
  const [sopra, setSopra] = React.useState(false);
  const mobile = typeof onSposta === "function";

  return (
    <div
      className={
        "piatto-riga" + (fisso ? " fisso" : "") +
        (trascinato === indice ? " in-volo" : "") + (sopra ? " bersaglio" : "")
      }
      draggable={mobile}
      onDragStart={(e) => { setTrascinato(indice); e.dataTransfer.effectAllowed = "move"; }}
      onDragEnd={() => { setTrascinato(null); setSopra(false); }}
      onDragOver={(e) => { if (!mobile || trascinato === null) return; e.preventDefault(); setSopra(true); }}
      onDragLeave={() => setSopra(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSopra(false);
        if (trascinato !== null && trascinato !== indice) onSposta(trascinato, indice);
        setTrascinato(null);
      }}
    >
      {mobile && (
        <span className="presa" title="trascina per riordinare">
          <svg width="13" height="17" viewBox="0 0 13 17" aria-hidden="true">
            {[0, 1, 2].map((r) => [0, 1].map((c) => (
              <circle key={r + "-" + c} cx={2.5 + c * 8} cy={2.5 + r * 6} r="1.7" fill="currentColor" />
            )))}
          </svg>
        </span>
      )}
      <span className="disco"><Illustrazione id={id} /></span>
      <DiscoColore colore={p.col} size={11} />
      <span className="corpo">
        <b>{p.n}</b>
        <span>
          {COLORI[p.col].nome} · {p.kcal} kcal
          {p.a.length ? " · allergeni " + p.a.join(", ") : " · nessun allergene"}
          {p.so ? " · " + sostituisce(id) : ""}
        </span>
      </span>
      {mobile && (
        <span className="frecce">
          <button onClick={() => onSposta(indice, indice - 1)} disabled={indice === 0} aria-label="sposta sopra">
            <Icone.dx size={13} style={{ transform: "rotate(-90deg)" }} />
          </button>
          <button onClick={() => onSposta(indice, indice + 1)} aria-label="sposta sotto">
            <Icone.dx size={13} />
          </button>
        </span>
      )}
      {fisso && <span className="etichetta-fisso">fisso</span>}
      <button className="tolgo" onClick={onTogli} aria-label="togli dal menu"><Icone.x size={15} /></button>
    </div>
  );
}

function GrigliaStampa({ onIndietro }) {
  const st = usaStato();
  return (
    <>
      <Intestazione
        occhiello="Settimana 36" titolo="Griglia della settimana"
        sotto="Vista di sola lettura, pronta per la stampa e la bacheca"
        azioni={<>
          <button className="btn linea piccolo" onClick={onIndietro}><Icone.sx size={16} /> Torna a comporre</button>
          <button className="btn piccolo" onClick={() => window.print()}><Icone.stampa size={16} /> Stampa</button>
        </>}
      />
      <div className="tela">
        <div className="pannello">
          <div className="griglia-menu">
            <table className="settimanale">
              <thead><tr>{GIORNI.map((g) => (<th key={g.n}>{g.n}<span>{g.d}</span></th>))}</tr></thead>
              <tbody>
                {CATEGORIE.map((c) => {
                  const variabili = GIORNI.map((_, i) => (st.menu.variabili[i] || {})[c.id] || []);
                  const righe = Math.max(1, ...variabili.map((v) => v.length));
                  const fissi = st.menu.fissi[c.id] || [];
                  return (
                    <React.Fragment key={c.id}>
                      <tr className="blocco"><td colSpan={5}>{c.nome}</td></tr>
                      {Array.from({ length: righe }).map((_, r) => (
                        <tr key={r}>
                          {variabili.map((v, i) => (
                            <td key={i}>
                              {v[r] && (<>
                                <DiscoColore colore={PIATTI[v[r]].col} size={9} />{" "}
                                {PIATTI[v[r]].so && <span className="u">U </span>}
                                {PIATTI[v[r]].n}
                                {PIATTI[v[r]].a.length > 0 && <span className="sost">allergeni {PIATTI[v[r]].a.join(", ")}</span>}
                              </>)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {fissi.length > 0 && (
                        <tr className="fisso">
                          {GIORNI.map((g) => (
                            <td key={g.n}>
                              {fissi.map((id) => (
                                <div key={id}>
                                  <DiscoColore colore={PIATTI[id].col} size={9} /> {PIATTI[id].n}
                                </div>
                              ))}
                            </td>
                          ))}
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Le righe su sfondo chiaro raccolgono i piatti presenti tutti i giorni. Il quadratino
            colorato segue il codice colori della Regione Lombardia, la U indica il piatto unico.
          </div>
        </div>
      </div>
    </>
  );
}

function Catalogo() {
  const st = usaStato();
  const ids = Object.keys(PIATTI);
  const [cerca, setCerca] = React.useState("");
  const inputSingolo = React.useRef(null);
  const inputBlocco = React.useRef(null);
  const [inCorso, setInCorso] = React.useState(null);
  const [modulo, setModulo] = React.useState(null); // { id } oppure { id: null }

  const visibili = ids.filter((id) =>
    PIATTI[id].n.toLowerCase().includes(cerca.toLowerCase()) || id.includes(cerca.toLowerCase())
  );
  const conFoto = ids.filter((id) => st.foto[id]).length;

  function leggi(file) {
    return new Promise((ok, no) => {
      const r = new FileReader();
      r.onload = () => ok(r.result);
      r.onerror = no;
      r.readAsDataURL(file);
    });
  }

  async function singola(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !inCorso) return;
    st.caricaFoto(inCorso, await leggi(file));
    st.avvisa("Fotografia caricata per " + PIATTI[inCorso].n);
    e.target.value = "";
    setInCorso(null);
  }

  /* caricamento in blocco: il nome del file deve corrispondere al codice del piatto */
  async function blocco(e) {
    const files = [...(e.target.files || [])];
    let ok = 0;
    const ignorati = [];
    for (const f of files) {
      const codice = f.name.replace(/\.[^.]+$/, "").toLowerCase().trim();
      if (PIATTI[codice]) {
        st.caricaFoto(codice, await leggi(f));
        ok++;
      } else ignorati.push(f.name);
    }
    e.target.value = "";
    st.avvisa(
      ok + (ok === 1 ? " fotografia associata" : " fotografie associate") +
      (ignorati.length ? ", " + ignorati.length + " senza corrispondenza" : "")
    );
  }

  return (
    <>
      <Intestazione
        occhiello="Anagrafica"
        titolo="Catalogo piatti"
        sotto={ids.length + " piatti, " + conFoto + " con fotografia caricata in questa sessione"}
        azioni={<>
          <button className="btn linea piccolo" onClick={() => inputBlocco.current.click()}>
            <Icone.scarica size={16} /> Carica foto in blocco
          </button>
          <button className="btn piccolo" onClick={() => setModulo({ id: null })}>Nuovo piatto</button>
        </>}
      />
      <input ref={inputSingolo} type="file" accept="image/*" style={{ display: "none" }} onChange={singola} />
      <input ref={inputBlocco} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={blocco} />

      <div className="tela">
        <div className="avviso info" style={{ alignItems: "flex-start" }}>
          <Icone.attenzione size={18} />
          <span>
            Le fotografie si caricano una per volta dal pulsante su ogni riga, oppure tutte insieme
            dal caricamento in blocco, nominando i file con il codice del piatto, per esempio
            ris_fun.jpg. In alternativa si possono depositare nella cartella foto accanto
            all'applicazione. Dove manca la fotografia resta l'illustrazione disegnata.
          </span>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Piatti a catalogo</h2>
            <div className="az" style={{ minWidth: 240 }}>
              <input type="text" placeholder="Cerca per nome o codice"
                value={cerca} onChange={(e) => setCerca(e.target.value)}
                style={{ padding: "8px 12px", fontSize: 13.5 }} />
            </div>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr><th>Piatto</th><th>Codice</th><th>Colore</th><th>Allergeni</th><th>Energia</th><th>Immagine</th><th /></tr>
              </thead>
              <tbody>
                {visibili.map((id) => (
                  <tr key={id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                        <span className="voce-mini" style={{ cursor: "default", width: 42, height: 42 }}>
                          <Illustrazione id={id} />
                        </span>
                        <b>{PIATTI[id].n}</b>
                      </div>
                    </td>
                    <td><code className="codice">{id}</code></td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                        <DiscoColore colore={PIATTI[id].col} size={11} />
                        {COLORI[PIATTI[id].col].nome}
                      </span>
                    </td>
                    <td className="cifra" style={{ fontSize: 12.5, color: "var(--muto)" }}>
                      {PIATTI[id].a.length ? PIATTI[id].a.join(", ") : "nessuno"}
                    </td>
                    <td className="cifra">{PIATTI[id].kcal} kcal</td>
                    <td>
                      {st.foto[id]
                        ? <span className="pastiglia p-ok">caricata</span>
                        : <span className="pastiglia p-neu">illustrazione</span>}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button className="btn linea piccolo"
                          onClick={() => { setInCorso(id); setTimeout(() => inputSingolo.current.click(), 0); }}>
                          Foto
                        </button>
                        {st.foto[id] && (
                          <button className="btn linea piccolo" onClick={() => st.togliFoto(id)}>Togli</button>
                        )}
                        <button className="btn linea piccolo" onClick={() => setModulo({ id })}>Modifica</button>
                        <button className="btn linea piccolo" onClick={() => schedaPdf(id)}>Scheda</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Le fotografie caricate qui restano per la durata della sessione, perché il prototipo non
            ha ancora un archivio. Nel prodotto finito finiscono su un archivio immagini con tre
            formati generati in automatico, elenco, scheda e stampa.
          </div>
        </div>
      </div>
      {modulo && <ModuloPiatto id={modulo.id} onChiudi={() => setModulo(null)} />}
    </>
  );
}

/* ==================== fatturazione — solo proforma ==================== */
function Fatturazione() {
  const st = usaStato();
  const PREZZO = 7.50;
  const strutture = [
    { nome: "Rossi Manifatture Spa", tipo: "Azienda", pasti: 790, mese: "Agosto 2026" },
    { nome: "Comunità Il Ponte", tipo: "Comunità", pasti: 248, mese: "Agosto 2026" },
  ];
  const totPasti = strutture.reduce((s, r) => s + r.pasti, 0);
  const totImponibile = totPasti * PREZZO;
  const totIva = totImponibile * 0.10;

  function eur(n) { return n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  async function generaProforma() {
    try {
      const { scaricaExcel } = await import("../excel.js");
      const righe = strutture.map((s) => ({
        struttura: s.nome, tipo: s.tipo, mese: s.mese, pasti: s.pasti,
        prezzo: "€ " + eur(PREZZO), imponibile: "€ " + eur(s.pasti * PREZZO),
      }));
      righe.push({
        struttura: "", tipo: "", mese: "TOTALE", pasti: totPasti,
        prezzo: "", imponibile: "€ " + eur(totImponibile),
      });
      await scaricaExcel("Proforma_MAVI_Agosto_2026.xlsx", [
        { nome: "Proforma", dati: righe, colonne: [
          { header: "Struttura", key: "struttura", width: 28 },
          { header: "Tipo", key: "tipo", width: 14 },
          { header: "Periodo", key: "mese", width: 16 },
          { header: "Pasti", key: "pasti", width: 10 },
          { header: "Prezzo unitario", key: "prezzo", width: 16 },
          { header: "Imponibile", key: "imponibile", width: 16 },
        ]},
      ]);
      st.avvisa("Proforma Excel scaricata");
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nella generazione, riprova");
    }
  }

  return (
    <>
      <Intestazione
        occhiello="Chiusura mensile" titolo="Proforma" sotto="Riepilogo dei pasti erogati per struttura, base per la fatturazione"
        azioni={<>
          <button className="btn linea piccolo" onClick={generaProforma}><Icone.scarica size={16} /> Scarica Excel</button>
          <button className="btn piccolo" onClick={async () => {
            const { generaProformaPDF } = await import("../proforma.js");
            generaProformaPDF(strutture, PREZZO);
            st.logga("Cucina MAVI", "Operatore", "Proforma generata", strutture.map(s => s.nome).join(", "), "generico");
          }}>Genera proforma PDF</button>
        </>}
      />
      <div className="tela">
        <div className="numeri">
          <div className="numero"><div className="n-lab">Pasti totali</div><div className="n-val">{totPasti}</div><div className="n-nota">nel mese di agosto</div></div>
          <div className="numero"><div className="n-lab">Strutture</div><div className="n-val">{strutture.length}</div><div className="n-nota">committenti attivi</div></div>
          <div className="numero"><div className="n-lab">Imponibile</div><div className="n-val" style={{ fontSize: 22 }}>€ {eur(totImponibile)}</div><div className="n-nota">prezzo unitario € {eur(PREZZO)}</div></div>
          <div className="numero"><div className="n-lab">IVA 10%</div><div className="n-val" style={{ fontSize: 22 }}>€ {eur(totIva)}</div><div className="n-nota">totale € {eur(totImponibile + totIva)}</div></div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Dettaglio per struttura</h2>
            <span className="conta-piatti">base per la fatturazione a fine mese</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Struttura</th><th>Tipo</th><th>Periodo</th><th>Pasti</th><th>Prezzo unitario</th><th>Imponibile</th></tr></thead>
              <tbody>
                {strutture.map((s) => (
                  <tr key={s.nome}>
                    <td><b>{s.nome}</b></td>
                    <td><span className="pastiglia p-neu">{s.tipo}</span></td>
                    <td>{s.mese}</td>
                    <td className="quantita">{s.pasti}</td>
                    <td className="cifra">€ {eur(PREZZO)}</td>
                    <td className="cifra">€ {eur(s.pasti * PREZZO)}</td>
                  </tr>
                ))}
                <tr className="riga-totale">
                  <td colSpan={3}><b>Totale</b></td>
                  <td className="quantita">{totPasti}</td>
                  <td />
                  <td className="cifra"><b>€ {eur(totImponibile)}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="proforma-totale">
            <span>IVA 10%: € {eur(totIva)}</span>
            <span>Totale documento: <b>€ {eur(totImponibile + totIva)}</b></span>
          </div>
          <div className="pannello-piede">
            La proforma si genera dallo storico pasti del mese selezionato. Non transita
            dal Sistema di Interscambio — la fattura elettronica si emette dal gestionale contabile.
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== modulo del piatto ==================== */
const VUOTO = {
  n: "", col: "giallo", kcal: 300, a: [], mk: [], ill: "pasta",
  pal: ["#FBF1EB", "#F6DFD2", "#EBB79E", "#C0442E"],
  g: [0, 0, 0, 0, 0, 0], de: "", ing: "", ris: "", con: "", so: null,
};

const FORME = [
  ["pasta", "Pasta"], ["risotto", "Riso o risotto"], ["lasagna", "Al forno"],
  ["zuppa", "Zuppa o vellutata"], ["carne", "Carne"], ["pesce", "Pesce"],
  ["polpette", "Polpette o spezzatino"], ["tofu", "Formaggi o tofu"],
  ["burger", "Burger o panino"], ["insalata", "Insalata"], ["patate", "Patate"],
  ["verdure", "Verdure"], ["riso", "Riso saltato"], ["piadina", "Piadina o focaccia"],
];

const SOSTITUZIONI = [
  [null, "No, è una portata singola"],
  [["secondo", "contorno"], "Sostituisce secondo e contorno"],
  [["primo", "secondo"], "Sostituisce primo e secondo"],
  [["primo", "secondo", "contorno"], "Sostituisce primo, secondo e contorno"],
];

function ModuloPiatto({ id, onChiudi }) {
  const st = usaStato();
  const esistente = id ? PIATTI[id] : null;
  const [d, setD] = React.useState(() => ({ ...VUOTO, ...(esistente || {}) }));
  const [codice, setCodice] = React.useState(id || "");

  const campo = (k, v) => setD((x) => ({ ...x, [k]: v }));
  const commuta = (k, v) =>
    setD((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : [...x[k], v] }));

  function suggerisciCodice(nome) {
    const parole = nome.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").trim().split(/\s+/);
    return parole.slice(0, 2).map((w) => w.slice(0, 3)).join("_") || "piatto";
  }

  function salva() {
    if (!d.n.trim()) { st.avvisa("Il nome del piatto è obbligatorio"); return; }
    const finale = id || (codice.trim() || suggerisciCodice(d.n));
    st.salvaPiatto(finale, { ...d, kcal: Number(d.kcal) || 0 });
    st.avvisa(id ? "Piatto aggiornato, si crea una nuova versione" : "Piatto creato e disponibile a catalogo");
    onChiudi();
  }

  return (
    <Velo onChiudi={onChiudi}>
      <div className="scelta-testa">
        <div className="occhiello">{id ? "Modifica piatto" : "Nuovo piatto"}</div>
        <h2>{id ? esistente.n : "Aggiungi al catalogo"}</h2>
        <p>
          {id
            ? "Le modifiche creano una nuova versione. Le prenotazioni già registrate restano com'erano."
            : "Compila i dati principali, il resto si può completare in seguito."}
        </p>
      </div>

      <div className="modulo">
        <div className="modulo-riga due">
          <label>
            <span>Nome del piatto</span>
            <input type="text" value={d.n} onChange={(e) => campo("n", e.target.value)} placeholder="Es. Risotto ai funghi" />
          </label>
          <label>
            <span>Codice</span>
            <input type="text" value={codice} disabled={!!id}
              onChange={(e) => setCodice(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder={d.n ? suggerisciCodice(d.n) : "ris_fun"} />
          </label>
        </div>

        <div className="modulo-riga tre">
          <label>
            <span>Codice colore WHP</span>
            <div className="scelta-colori">
              {Object.entries(COLORI).map(([k, c]) => (
                <button key={k} type="button" className={"bottone-colore" + (d.col === k ? " on" : "")}
                  onClick={() => campo("col", k)} title={c.cosa}>
                  <i style={{ background: c.hex }} />{c.nome}
                </button>
              ))}
            </div>
          </label>
          <label>
            <span>Energia, kcal</span>
            <input type="number" value={d.kcal} onChange={(e) => campo("kcal", e.target.value)} />
          </label>
          <label>
            <span>Aspetto nell'illustrazione</span>
            <select value={d.ill} onChange={(e) => campo("ill", e.target.value)}>
              {FORME.map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
            </select>
          </label>
        </div>

        <label className="modulo-blocco">
          <span>Allergeni dichiarati, Regolamento UE 1169/2011</span>
          <div className="scelta-allergeni">
            {Object.entries(ALLERGENI).map(([n, nome]) => (
              <button key={n} type="button"
                className={"pillola-allergene" + (d.a.includes(Number(n)) ? " on" : "")}
                onClick={() => commuta("a", Number(n))}>
                <i>{n}</i>{nome}
              </button>
            ))}
          </div>
        </label>

        <div className="modulo-riga due">
          <label className="modulo-blocco">
            <span>Marcatori</span>
            <div className="scelta-allergeni">
              {Object.entries(MARCATORI).map(([k, nome]) => (
                <button key={k} type="button"
                  className={"pillola-allergene" + (d.mk.includes(k) ? " on" : "")}
                  onClick={() => commuta("mk", k)}>{nome}</button>
              ))}
            </div>
          </label>
          <label>
            <span>Piatto unico</span>
            <select
              value={JSON.stringify(d.so)}
              onChange={(e) => campo("so", JSON.parse(e.target.value))}>
              {SOSTITUZIONI.map(([v, l]) => (
                <option key={l} value={JSON.stringify(v)}>{l}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="modulo-blocco">
          <span>Descrizione</span>
          <textarea rows={2} value={d.de} onChange={(e) => campo("de", e.target.value)}
            placeholder="Una o due righe su com'è fatto il piatto." />
        </label>
        <label className="modulo-blocco">
          <span>Ingredienti, gli allergeni vanno scritti in maiuscolo</span>
          <textarea rows={2} value={d.ing} onChange={(e) => campo("ing", e.target.value)}
            placeholder="Riso Carnaroli, funghi porcini, BURRO, brodo vegetale, cipolla, sale." />
        </label>
        <div className="modulo-riga due">
          <label className="modulo-blocco">
            <span>Riscaldamento</span>
            <textarea rows={2} value={d.ris} onChange={(e) => campo("ris", e.target.value)} />
          </label>
          <label className="modulo-blocco">
            <span>Consiglio di consumo</span>
            <textarea rows={2} value={d.con} onChange={(e) => campo("con", e.target.value)} />
          </label>
        </div>
      </div>

      <div className="scelta-piede modulo-piede">
        {id && (
          <button className="btn linea" onClick={() => { st.eliminaPiatto(id); st.avvisa("Piatto eliminato dal catalogo"); onChiudi(); }}>
            Elimina
          </button>
        )}
        <button className="btn linea" onClick={onChiudi}>Annulla</button>
        <button className="btn" onClick={salva}>{id ? "Salva modifiche" : "Crea piatto"}</button>
      </div>
    </Velo>
  );
}


/* ==================== ordini in arrivo, chi ha inviato ==================== */
function FlussiOrdine() {
  const st = usaStato();
  const totale = FLUSSI_ORDINE.reduce((s, x) => s + x.pasti, 0);
  const attesa = FLUSSI_ORDINE.filter((x) => x.stato === "attesa").length;
  const ricevuti = FLUSSI_ORDINE.filter((x) => x.stato !== "attesa").length;
  const percentuale = Math.round((ricevuti / FLUSSI_ORDINE.length) * 100);
  return (
    <>
      <Intestazione
        occhiello="Mercoledì 2 settembre 2026"
        titolo="Ordini in arrivo"
        sotto="Chi ha trasmesso il pasto di oggi, quando, e cosa ha dichiarato"
        azioni={<>
          <button className="btn linea piccolo" onClick={() => st.avvisa("Sollecito inviato alle strutture in attesa")}>
            Sollecita chi manca
          </button>
          <button className="btn piccolo" onClick={() => st.avvisa("Ordini congelati, distinta di produzione generata")}>
            Chiudi ordini di oggi
          </button>
        </>}
      />
      <div className="tela">
        <div className="barra-avanzamento">
          <div className="ba-testa">
            <span><b>{ricevuti}</b> ordini ricevuti su <b>{FLUSSI_ORDINE.length}</b> attesi</span>
            <span className="ba-perc">{percentuale}%</span>
          </div>
          <div className="ba-progresso"><i style={{ width: percentuale + "%" }} /></div>
          <p>{attesa > 0 ? "Chiusura ordini alle 16:00, poi le righe in attesa vengono congelate come sono." : "Tutte le strutture hanno trasmesso, si può chiudere la giornata."}</p>
        </div>
        <div className="numeri">
          <div className="numero"><div className="n-lab">Ordini ricevuti</div><div className="n-val">{ricevuti}</div><div className="n-nota">su {FLUSSI_ORDINE.length} attesi</div></div>
          <div className="numero"><div className="n-lab">Pasti dichiarati</div><div className="n-val">{totale}</div><div className="n-nota">totale multi struttura</div></div>
          <div className="numero"><div className="n-lab">In attesa</div><div className="n-val">{attesa}</div><div className="n-nota">chiusura ordini alle 16:00</div></div>
          <div className="numero"><div className="n-lab">Diete particolari</div><div className="n-val">7</div><div className="n-nota">segnalate negli ordini</div></div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Ordini di giornata</h2>
            <span className="conta-piatti">responsabile in ricezione, cucina centrale MAVI</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr><th>Quando</th><th>Struttura</th><th>Inviato da</th><th>Pasti</th><th>Note</th><th>Stato</th></tr>
              </thead>
              <tbody>
                {FLUSSI_ORDINE.map((f) => (
                  <tr key={f.id}>
                    <td className="cifra">{f.quando}</td>
                    <td><b>{f.struttura}</b><div className="riservato">{f.tipo}</div></td>
                    <td><b>{f.inviato_da}</b><div className="riservato">{f.ruolo}</div></td>
                    <td className="quantita">{f.pasti || "—"}</td>
                    <td style={{ fontSize: 12.5, color: "var(--muto)" }}>{f.note}</td>
                    <td>
                      {f.stato === "ricevuto" ? <span className="pastiglia p-ok">ricevuto</span>
                        : f.stato === "chiuso" ? <span className="pastiglia p-neu">chiuso</span>
                        : <span className="pastiglia p-att">in attesa</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            L'ordine arriva alla cucina attraverso un responsabile del servizio, che verifica
            provenienza, diete e coerenza con il capitolato prima di girarlo alla produzione.
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== giri di consegna ==================== */
function GiriConsegna() {
  const st = usaStato();
  return (
    <>
      <Intestazione
        occhiello="Consegne di oggi"
        titolo="Giri di consegna"
        sotto="Ordine di carico, orari e note per gli autisti"
        azioni={<>
          <button className="btn linea piccolo" onClick={() => window.print()}><Icone.stampa size={16} /> Stampa</button>
          <button className="btn piccolo" onClick={() => st.avvisa("Giri assegnati e notificati agli autisti")}>Assegna giri</button>
        </>}
      />
      <div className="tela">
        <div className="giri">
          {GIRI.map((g) => (
            <article className="giro" key={g.id}>
              <div className="giro-testa">
                <div>
                  <span className="occhiello">Partenza {g.partenza}</span>
                  <h3>{g.nome}</h3>
                  <p>Furgone {g.furgone} · {g.autista}</p>
                </div>
                <div className="giro-numeri">
                  <span><b>{g.tappe.length}</b> tappe</span>
                  <span><b>{g.tappe.reduce((s, t) => s + t.pasti, 0)}</b> pasti</span>
                </div>
              </div>
              <ol className="tappe">
                {g.tappe.map((t, i) => (
                  <li key={i}>
                    <span className="tappa-ora">{t.ora}</span>
                    <span className="tappa-corpo">
                      <b>{t.struttura}</b>
                      <span>{t.punto} · {t.pasti} pasti</span>
                      <em>{t.note}</em>
                    </span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

/* ==================== etichette pasto stampabili ==================== */
function EtichettePasto() {
  const st = usaStato();
  const trasmessi = st.presenzeTrasmesse || [];
  const [rimossi, setRimossi] = React.useState([]);
  const [conferma, setConferma] = React.useState(null);

  /* etichette azienda: solo da prenotazioni confermate nella sessione demo */
  const etichetteAzienda = React.useMemo(() => {
    const lista = [];
    Object.keys(st.confermati).forEach((gi) => {
      const o = st.ordini[gi] || {};
      Object.entries(o).forEach(([cat, id]) => {
        if (!PIATTI[id]) return;
        const catNome = cat === "sost_primo" ? "sostitutivo primo" : cat === "sost_secondo" ? "sostitutivo secondo" : cat;
        lista.push({
          chiave: "az-" + gi + "-" + cat,
          giorno: GIORNI[gi]?.n + " " + GIORNI[gi]?.breve,
          pasto: "pranzo",
          portata: catNome,
          piatto: PIATTI[id].n,
          kcal: PIATTI[id].kcal,
          ing: PIATTI[id].ing || "",
          allergeni: (PIATTI[id].a || []).map((code) => ALLERGENI[code] || code),
          riscaldamento: PIATTI[id].ris || "Riscaldare 800 W, 2 min",
        });
      });
    });
    return lista;
  }, [st.confermati, st.ordini]);

  /* etichette comunità: dalle presenze trasmesse */
  const etichetteComunita = React.useMemo(() => {
    const cercaPiatto = (nome) => {
      const fromCatalog = Object.values(PIATTI).find((p) => p.n.toLowerCase() === nome.toLowerCase());
      if (fromCatalog) return fromCatalog;
      const fromDiete = INGREDIENTI_DIETE[nome];
      if (fromDiete) return { ing: fromDiete.ing, a: fromDiete.a, kcal: "" };
      return null;
    };
    const lista = [];
    trasmessi.forEach((t) => {
      const { primo, secondo, contorno } = t.dieta;
      [["primo", primo], ["secondo", secondo], ["contorno", contorno]].forEach(([portata, piatto]) => {
        if (!piatto || piatto === "—") return;
        const nomeClean = splitPiatto(piatto).nome;
        const found = cercaPiatto(nomeClean);
        lista.push({
          chiave: "com-" + t.id + "-" + portata,
          nome: t.nome,
          stanza: t.stanza,
          tipoDieta: t.tipo_dieta,
          note: t.note,
          giorno: t.giorno,
          pasto: t.pasto,
          portata,
          piatto: nomeClean,
          nota: splitPiatto(piatto).nota,
          ing: found?.ing || "",
          allergeni: (found?.a || []).map((code) => ALLERGENI[code] || code),
          kcal: found?.kcal || "",
        });
      });
    });
    return lista;
  }, [trasmessi]);

  const azFiltrate = etichetteAzienda.filter((e) => !rimossi.includes(e.chiave));
  const comFiltrate = etichetteComunita.filter((e) => !rimossi.includes(e.chiave));
  const totale = azFiltrate.length + comFiltrate.length;
  const vuoto = totale === 0;

  function rimuovi(chiave) {
    setRimossi((p) => [...p, chiave]);
    st.avvisa("Etichetta rimossa");
    setConferma(null);
  }

  return (
    <>
      <Intestazione
        occhiello="Cucina centrale"
        titolo="Etichette pasto"
        sotto="Etichette azienda (anonime, solo piatto) e comunità (nominative). Si generano dalle prenotazioni confermate e dalle presenze trasmesse."
        azioni={
          totale > 0 && <button className="btn piccolo" onClick={() => window.print()}><Icone.stampa size={16} /> Stampa tutte</button>
        }
      />
      <div className="tela">
        {vuoto ? (
          <div className="avviso info" style={{ alignItems: "flex-start" }}>
            <Icone.attenzione size={18} />
            <span>
              Nessuna etichetta da mostrare. Le etichette azienda si generano quando un dipendente
              conferma la prenotazione dal suo portale. Quelle della comunità quando il responsabile
              trasmette le presenze.
            </span>
          </div>
        ) : (
          <>
            <div className="numeri">
              <div className="numero"><div className="n-lab">Etichette totali</div><div className="n-val">{totale}</div><div className="n-nota">azienda + comunità</div></div>
              <div className="numero"><div className="n-lab">Azienda</div><div className="n-val">{azFiltrate.length}</div><div className="n-nota">anonime, solo piatto</div></div>
              <div className="numero"><div className="n-lab">Comunità</div><div className="n-val">{comFiltrate.length}</div><div className="n-nota">nominative, per paziente</div></div>
              <div className="numero"><div className="n-lab">Pasto</div><div className="n-val" style={{ fontSize: 20 }}>Pranzo</div><div className="n-nota">mer 2 set 2026</div></div>
            </div>

            {/* ---- SEZIONE AZIENDA (etichette anonime, raggruppate per piatto) ---- */}
            {azFiltrate.length > 0 && (() => {
              const perPiatto = {};
              azFiltrate.forEach((e) => {
                const k = e.piatto;
                if (!perPiatto[k]) perPiatto[k] = { piatto: e.piatto, portata: e.portata, kcal: e.kcal, ing: e.ing, allergeni: e.allergeni, riscaldamento: e.riscaldamento, giorno: e.giorno, pasto: e.pasto, count: 0, chiavi: [] };
                perPiatto[k].count++;
                perPiatto[k].chiavi.push(e.chiave);
              });
              return (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 600, margin: "28px 0 16px", fontFamily: "var(--serif)" }}>
                    <span className="pastiglia p-ok" style={{ marginRight: 10 }}>Azienda</span>
                    Rossi Manifatture Spa — etichette anonime
                  </h2>
                  <div className="etichette-griglia">
                    {Object.values(perPiatto).map((g) => (
                      <div key={g.piatto}>
                        <div className="etichetta">
                          <div className="etichetta-testa">
                            <span className="marchio-t" style={{ fontSize: 14 }}>MAVI</span>
                            <span className="et-data">{g.giorno}, {g.pasto}</span>
                          </div>
                          <div style={{ padding: "10px 0" }}>
                            <span className="so-lab">{g.portata}</span>
                            <p style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 600 }}>{g.piatto}</p>
                            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--inchiostro-2)" }}>
                              <b style={{ fontSize: 20 }}>×{g.count}</b> <span style={{ color: "var(--muto)" }}>etichette</span>
                            </p>
                            {g.ing && <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muto)", lineHeight: 1.4 }}>Ingredienti: {g.ing}</p>}
                            {g.allergeni && g.allergeni.length > 0 && (
                              <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--acc)" }}>
                                Allergeni: {g.allergeni.join(", ")}
                              </p>
                            )}
                            <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--muto)" }}>{g.kcal} kcal</p>
                          </div>
                          <div className="etichetta-piede">
                            <span>{g.riscaldamento}</span>
                          </div>
                        </div>
                        <button className="btn-rimuovi-et" onClick={() => setConferma({ chiave: g.chiavi[0], nome: g.piatto, portata: g.portata })}>
                          <Icone.x size={12} /> Elimina gruppo
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {/* ---- SEZIONE COMUNITÀ (etichette nominative, per paziente > pasto) ---- */}
            {comFiltrate.length > 0 && (() => {
              const perPaziente = {};
              comFiltrate.forEach((e) => {
                if (!perPaziente[e.nome]) perPaziente[e.nome] = { nome: e.nome, stanza: e.stanza, tipoDieta: e.tipoDieta, note: e.note, pranzo: [], cena: [] };
                const pasto = e.pasto === "cena" ? "cena" : "pranzo";
                perPaziente[e.nome][pasto].push(e);
              });
              return (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 600, margin: "28px 0 16px", fontFamily: "var(--serif)" }}>
                    <span className="pastiglia p-ok" style={{ marginRight: 10 }}>Comunità</span>
                    Comunità Il Ponte — etichette nominative
                  </h2>
                  {Object.values(perPaziente).map((paz) => (
                    <div key={paz.nome} style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: "var(--inchiostro-2)" }}>
                        {paz.nome} · {paz.stanza}
                        {paz.tipoDieta && paz.tipoDieta !== "Standard" && (
                          <span className="tag-dieta terap" style={{ marginLeft: 10, fontSize: 11 }}>{paz.tipoDieta}</span>
                        )}
                      </h3>
                      {["pranzo", "cena"].map((pasto) => {
                        const lista = paz[pasto];
                        if (!lista.length) return null;
                        return (
                          <div key={pasto} style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muto)", marginBottom: 8 }}>{pasto}</div>
                            <div className="etichette-griglia">
                              {lista.map((e) => (
                                <div key={e.chiave}>
                                  <div className="etichetta">
                                    <div className="etichetta-testa">
                                      <span className="marchio-t" style={{ fontSize: 14 }}>MAVI</span>
                                      <span className="et-data">{e.giorno}, {e.pasto}</span>
                                    </div>
                                    <div className="etichetta-corpo">
                                      <span className="et-struttura">Comunità Il Ponte</span>
                                      <b>{e.nome}</b>
                                      <span className="et-unita">{e.stanza}</span>
                                    </div>
                                    <div style={{ padding: "8px 0" }}>
                                      <span className="so-lab">{e.portata}</span>
                                      <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600 }}>{e.piatto}</p>
                                      {e.nota && <p className="nota-prep" style={{ margin: "6px 0 0" }}>⚠ {e.nota}</p>}
                                      {e.ing && <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muto)", lineHeight: 1.4 }}>Ingredienti: {e.ing}</p>}
                                      {e.allergeni && e.allergeni.length > 0 && (
                                        <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--acc)" }}>Allergeni: {e.allergeni.join(", ")}</p>
                                      )}
                                      {e.kcal && <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muto)" }}>{e.kcal} kcal</p>}
                                    </div>
                                    <div className="etichetta-allergeni">
                                      <span className="so-lab">Note</span>
                                      <p>{e.note}</p>
                                    </div>
                                    <div className="etichetta-piede">
                                      <span>Riscaldare 800 W, 2 min</span>
                                      <span className="et-cod">{e.chiave}</span>
                                    </div>
                                  </div>
                                  <button className="btn-rimuovi-et" onClick={() => setConferma({ chiave: e.chiave, nome: e.nome, portata: e.portata })}>
                                    <Icone.x size={12} /> Elimina etichetta
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </>
              );
            })()}
          </>
        )}
      </div>

      {/* modale conferma cancellazione */}
      {conferma && (
        <Velo onChiudi={() => setConferma(null)}>
          <div className="scelta-testa">
            <div className="occhiello">Conferma rimozione</div>
            <h2>Rimuovere l'etichetta?</h2>
            <p>
              Stai per rimuovere l'etichetta di <b>{conferma.portata}</b> per <b>{conferma.nome}</b>.
              L'etichetta non verrà stampata.
            </p>
          </div>
          <div className="scelta-piede modulo-piede">
            <button className="btn linea" onClick={() => setConferma(null)}>Annulla</button>
            <button className="btn" style={{ background: "#d9534f", color: "#fff" }} onClick={() => rimuovi(conferma.chiave)}>Rimuovi</button>
          </div>
        </Velo>
      )}
    </>
  );
}

/* ==================== modale creazione/modifica utente ==================== */
function ModaleUtente({ utente, ruoli, strutture, onSalva, onChiudi }) {
  const [form, setForm] = React.useState(utente || { nome: "", username: "", ruolo: ruoli[0], struttura: strutture[0], email: "", telefono: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const PERMESSI_PER_RUOLO = {
    "Dipendente": ["Visualizza menu", "Prenota pasti", "Vedi prenotazioni"],
    "Referente aziendale": ["Visualizza menu", "Prenota per dipendenti", "Vedi resoconti", "Scarica Excel/PDF", "Gestisci dipendenti"],
    "Educatore": ["Visualizza pazienti", "Segna presenze", "Trasmetti presenze"],
    "Responsabile": ["Visualizza pazienti", "Segna presenze", "Trasmetti presenze", "Modifica diete", "Carica diete", "Gestisci anagrafica"],
    "Operatore cucina": ["Visualizza produzione", "Gestisci etichette", "Gestisci menu", "Gestisci committenti", "Fatturazione"],
    "Amministratore": ["Accesso completo", "Gestione utenti", "Gestione portale", "Backup", "Log operazioni"],
  };

  return (
    <Velo onChiudi={onChiudi}>
      <div className="scelta-testa">
        <div className="occhiello">Gestione utenti</div>
        <h2>{utente ? "Modifica utente" : "Nuovo utente"}</h2>
      </div>
      <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muto)", marginBottom: 4 }}>Nome completo</label>
          <input type="text" value={form.nome} onChange={(e) => set("nome", e.target.value)} style={{ width: "100%", fontSize: 13, padding: "8px 10px" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muto)", marginBottom: 4 }}>Username</label>
          <input type="text" value={form.username || ""} onChange={(e) => set("username", e.target.value)} style={{ width: "100%", fontSize: 13, padding: "8px 10px" }} placeholder="nome.cognome" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muto)", marginBottom: 4 }}>Ruolo</label>
          <select value={form.ruolo} onChange={(e) => set("ruolo", e.target.value)} style={{ width: "100%", fontSize: 13, padding: "8px 10px" }}>
            {ruoli.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muto)", marginBottom: 4 }}>Struttura</label>
          <select value={form.struttura} onChange={(e) => set("struttura", e.target.value)} style={{ width: "100%", fontSize: 13, padding: "8px 10px" }}>
            {strutture.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muto)", marginBottom: 4 }}>Email</label>
          <input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} style={{ width: "100%", fontSize: 13, padding: "8px 10px" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muto)", marginBottom: 4 }}>Telefono</label>
          <input type="tel" value={form.telefono || ""} onChange={(e) => set("telefono", e.target.value)} style={{ width: "100%", fontSize: 13, padding: "8px 10px" }} />
        </div>
      </div>
      <div style={{ padding: "0 24px 16px" }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muto)", marginBottom: 8 }}>Permessi per ruolo "{form.ruolo}"</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(PERMESSI_PER_RUOLO[form.ruolo] || []).map((p) => (
            <span key={p} className="pastiglia p-ok" style={{ fontSize: 11 }}>{p}</span>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--muto)", marginTop: 8 }}>I permessi sono assegnati automaticamente in base al ruolo. In produzione saranno configurabili per singolo utente.</p>
      </div>
      <div className="scelta-piede" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn linea" onClick={onChiudi}>Annulla</button>
        <button className="btn" disabled={!form.nome.trim()} onClick={() => onSalva(form)}>
          {utente ? "Salva modifiche" : "Crea utente"}
        </button>
      </div>
    </Velo>
  );
}

/* ==================== gestione portale ==================== */
function GestionePortale() {
  const st = usaStato();
  const [tab, setTab] = React.useState("azienda");
  const [dati, setDati] = React.useState({ ...st.datiAziendali });
  const [editUtente, setEditUtente] = React.useState(null); // null | "nuovo" | utente obj
  const RUOLI = ["Dipendente", "Referente aziendale", "Educatore", "Responsabile", "Operatore cucina", "Amministratore"];
  const STRUTTURE = ["Rossi Manifatture Spa", "Comunità Il Ponte", "MAVI Ristorazione"];

  function salvaDati() {
    st.setDatiAziendali(dati);
    st.avvisa("Dati aziendali salvati");
    st.logga("Cucina MAVI", "Admin", "Dati aziendali aggiornati", "Ragione sociale, indirizzo, P.IVA", "modifica");
  }

  function campo(label, chiave, tipo) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muto)", marginBottom: 4 }}>{label}</label>
        {tipo === "area" ? (
          <textarea value={dati[chiave] || ""} onChange={(e) => setDati((d) => ({ ...d, [chiave]: e.target.value }))}
            style={{ width: "100%", minHeight: 70, fontSize: 13, padding: "8px 10px" }} />
        ) : (
          <input type="text" value={dati[chiave] || ""} onChange={(e) => setDati((d) => ({ ...d, [chiave]: e.target.value }))}
            style={{ width: "100%", fontSize: 13, padding: "8px 10px" }} placeholder={"Inserisci " + label.toLowerCase()} />
        )}
      </div>
    );
  }

  function toggleNotifica(chiave, label) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--linea)" }}>
        <span style={{ fontSize: 13 }}>{label}</span>
        <button className={"btn piccolo" + (st.notifiche[chiave] ? "" : " linea")}
          style={st.notifiche[chiave] ? { background: "var(--ok)", color: "#fff", minWidth: 70 } : { minWidth: 70 }}
          onClick={() => st.setNotifiche((n) => ({ ...n, [chiave]: !n[chiave] }))}>
          {st.notifiche[chiave] ? "Attiva" : "Off"}
        </button>
      </div>
    );
  }

  return (
    <>
      <Intestazione occhiello="Amministrazione" titolo="Gestione portale" sotto="Dati aziendali, utenti, tema e notifiche del portale MAVI" />
      <div className="tela">
        <div className="commuta" style={{ marginBottom: 20 }}>
          {[["azienda", "Dati aziendali"], ["fatturazione", "Fatturazione"], ["tema", "Aspetto"], ["utenti", "Utenti"], ["notifiche", "Notifiche"], ["backup", "Backup"]].map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === "azienda" && (
          <div className="pannello">
            <div className="pannello-testa"><h2>Dati aziendali MAVI</h2></div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                {campo("Ragione sociale", "ragioneSociale")}
                {campo("Partita IVA", "piva")}
                {campo("Codice fiscale", "cf")}
                {campo("Indirizzo sede legale", "indirizzo")}
                {campo("Telefono", "telefono")}
                {campo("Email", "email")}
                {campo("PEC", "pec")}
                {campo("IBAN", "iban")}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button className="btn" onClick={salvaDati}>Salva dati</button>
              </div>
            </div>
            <div className="pannello-piede">
              Questi dati vengono usati nella generazione delle proforma e nei documenti del portale.
              I campi vuoti appariranno come placeholder nelle proforma.
            </div>
          </div>
        )}

        {tab === "fatturazione" && (
          <div className="pannello">
            <div className="pannello-testa"><h2>Impostazioni fatturazione</h2></div>
            <div style={{ padding: "20px 24px" }}>
              {campo("Condizioni di pagamento", "condizioniPagamento")}
              {campo("Note standard proforma", "noteProforma", "area")}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button className="btn" onClick={salvaDati}>Salva</button>
              </div>
            </div>
            <div className="pannello-piede">
              Condizioni e note vengono inserite automaticamente in ogni proforma generata.
            </div>
          </div>
        )}

        {tab === "tema" && (
          <div className="pannello">
            <div className="pannello-testa"><h2>Aspetto del portale</h2></div>
            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: 13, color: "var(--muto)", marginBottom: 16 }}>Scegli il tema del portale. L'impostazione viene salvata nel browser.</p>
              <div style={{ display: "flex", gap: 12 }}>
                {[["chiaro", "Chiaro", "☀️"], ["scuro", "Scuro", "🌙"], ["auto", "Automatico", "💻"]].map(([val, label, icon]) => (
                  <button key={val}
                    className={"btn" + (st.tema === val ? "" : " linea")}
                    style={{ flex: 1, padding: "16px 12px", fontSize: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
                    onClick={() => st.setTema(val)}>
                    <span style={{ fontSize: 24 }}>{icon}</span>
                    {label}
                    {val === "auto" && <span style={{ fontSize: 10, color: "var(--muto)" }}>segue il sistema</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "utenti" && (
          <div className="pannello">
            <div className="pannello-testa">
              <h2>Utenti del portale</h2>
              <span className="conta-piatti">{st.utenti.filter((u) => u.attivo).length} attivi su {st.utenti.length}</span>
              <button className="btn piccolo" style={{ marginLeft: "auto" }} onClick={() => setEditUtente("nuovo")}>
                <Icone.piu size={14} /> Nuovo utente
              </button>
            </div>
            <div className="scorri">
              <table className="dati">
                <thead><tr><th>Nome</th><th>Username</th><th>Ruolo</th><th>Struttura</th><th>Stato</th><th /></tr></thead>
                <tbody>
                  {st.utenti.map((u) => (
                    <tr key={u.id} style={{ opacity: u.attivo ? 1 : 0.5 }}>
                      <td><b>{u.nome}</b></td>
                      <td className="cifra">{u.username || "—"}</td>
                      <td>{u.ruolo}</td>
                      <td style={{ color: "var(--muto)" }}>{u.struttura}</td>
                      <td>{u.attivo ? <span className="pastiglia p-ok">attivo</span> : <span className="pastiglia p-neu">disattivato</span>}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn linea piccolo" onClick={() => setEditUtente({ ...u })}>Modifica</button>
                          <button className={"btn piccolo" + (u.attivo ? " linea" : "")}
                            style={u.attivo ? { color: "#d9534f" } : { background: "#5cb85c", color: "#fff" }}
                            onClick={() => {
                              st.setUtenti((p) => p.map((x) => x.id === u.id ? { ...x, attivo: !x.attivo } : x));
                              st.avvisa(u.nome + (u.attivo ? " disattivato" : " riattivato"));
                            }}>
                            {u.attivo ? "Disattiva" : "Riattiva"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pannello-piede">
              In produzione gli utenti avranno autenticazione con password individuale, reset via email e log degli accessi.
            </div>

            {editUtente && (
              <ModaleUtente
                utente={editUtente === "nuovo" ? null : editUtente}
                ruoli={RUOLI}
                strutture={STRUTTURE}
                onSalva={(u) => {
                  if (u.id) {
                    st.setUtenti((p) => p.map((x) => x.id === u.id ? u : x));
                    st.avvisa("Utente " + u.nome + " aggiornato");
                  } else {
                    const nuovo = { ...u, id: "u" + Date.now(), attivo: true };
                    st.setUtenti((p) => [...p, nuovo]);
                    st.avvisa("Utente " + u.nome + " creato");
                  }
                  st.logga("Cucina MAVI", "Admin", u.id ? "Utente modificato" : "Utente creato", u.nome + " — " + u.ruolo, "modifica");
                  setEditUtente(null);
                }}
                onChiudi={() => setEditUtente(null)}
              />
            )}
          </div>
        )}

        {tab === "notifiche" && (
          <div className="pannello">
            <div className="pannello-testa"><h2>Notifiche automatiche</h2></div>
            <div style={{ padding: "20px 24px" }}>
              {toggleNotifica("promemoria", "Promemoria prenotazione ai dipendenti che non hanno prenotato")}
              {toggleNotifica("cutoff", "Avviso cutoff in avvicinamento al responsabile")}
              {toggleNotifica("ordineRicevuto", "Notifica ordine ricevuto alla cucina")}
              {toggleNotifica("presenzeMancanti", "Avviso presenze non trasmesse")}
              {toggleNotifica("reportMensile", "Report mensile automatico a fine mese")}
              {toggleNotifica("emailDigest", "Digest giornaliero via email")}
            </div>
            <div className="pannello-piede">
              Le notifiche in produzione verranno inviate via email e/o push. Qui il toggle è dimostrativo.
            </div>
          </div>
        )}

        {tab === "backup" && (
          <div className="pannello">
            <div className="pannello-testa"><h2>Backup e ripristino</h2></div>
            <div style={{ padding: "20px 24px" }}>
              <div className="numeri" style={{ marginBottom: 20 }}>
                <div className="numero"><div className="n-lab">Ultimo backup</div><div className="n-val" style={{ fontSize: 18 }}>Oggi, 06:00</div><div className="n-nota">automatico</div></div>
                <div className="numero"><div className="n-lab">Dimensione DB</div><div className="n-val" style={{ fontSize: 18 }}>12,4 MB</div><div className="n-nota">pazienti, menu, ordini</div></div>
                <div className="numero"><div className="n-lab">Backup conservati</div><div className="n-val">30</div><div className="n-nota">ultimi 30 giorni</div></div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn linea" onClick={() => st.avvisa("Backup manuale avviato — in produzione verrà salvato su storage sicuro")}>
                  Backup manuale
                </button>
                <button className="btn linea" onClick={() => st.avvisa("Export completo: funzione dimostrativa. In produzione genera un archivio con DB + file")}>
                  Export completo
                </button>
                <button className="btn linea" style={{ color: "#d9534f" }} onClick={() => st.avvisa("Ripristino: funzione dimostrativa. In produzione si seleziona il backup da ripristinare")}>
                  Ripristina da backup
                </button>
              </div>
            </div>
            <div className="pannello-piede">
              In produzione il backup è automatico giornaliero su storage cifrato. Il ripristino richiede doppia conferma.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ==================== log operazioni ==================== */
function LogOperazioni() {
  const st = usaStato();
  const [filtro, setFiltro] = React.useState("tutti");
  const tipi = ["tutti", ...new Set(st.logOperazioni.map((l) => l.tipo))];
  const lista = filtro === "tutti" ? st.logOperazioni : st.logOperazioni.filter((l) => l.tipo === filtro);

  const coloreTipo = (t) => {
    const map = { ordine: "p-att", approvazione: "p-ok", presenze: "p-ok", generico: "p-neu", modifica: "p-att", eliminazione: "p-err", sistema: "p-neu" };
    return map[t] || "p-neu";
  };

  return (
    <>
      <Intestazione
        occhiello="Audit trail"
        titolo="Log operazioni"
        sotto="Cronologia di tutte le azioni eseguite nel portale, filtrabile per tipo"
        azioni={
          <button className="btn linea piccolo" onClick={() => st.avvisa("Log esportato, funzione dimostrativa")}>
            <Icone.scarica size={16} /> Esporta
          </button>
        }
      />
      <div className="tela">
        <div className="commuta" style={{ marginBottom: 20 }}>
          {tipi.map((t) => (
            <button key={t} className={filtro === t ? "on" : ""} onClick={() => setFiltro(t)}>
              {t === "tutti" ? "Tutti" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Operazioni registrate</h2>
            <span className="conta-piatti">{lista.length} {lista.length === 1 ? "operazione" : "operazioni"}</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr><th>Ora</th><th>Utente</th><th>Ruolo</th><th>Azione</th><th>Dettaglio</th><th>Tipo</th></tr>
              </thead>
              <tbody>
                {lista.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 30, color: "var(--muto)" }}>Nessuna operazione per questo filtro</td></tr>
                ) : lista.map((l) => (
                  <tr key={l.id}>
                    <td className="cifra" style={{ whiteSpace: "nowrap" }}>{l.ora}</td>
                    <td><b>{l.utente}</b></td>
                    <td style={{ color: "var(--muto)" }}>{l.ruolo}</td>
                    <td>{l.azione}</td>
                    <td style={{ fontSize: 13 }}>{l.dettaglio}</td>
                    <td><span className={"pastiglia " + coloreTipo(l.tipo)}>{l.tipo}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Il log registra ogni operazione eseguita nel portale: trasmissione ordini,
            approvazioni, presenze trasmesse e modifiche. In produzione sarà persistente su database.
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== impostazioni per committente ==================== */
function ImpostazioniServizio() {
  const st = usaStato();
  const [conf, setConf] = React.useState(IMPOSTAZIONI_INIZIALI);
  const [attivo, setAttivo] = React.useState("azienda");
  const [settCorrente, setSettCorrente] = React.useState(1);
  const strutture = [
    { id: "azienda", nome: "Rossi Manifatture Spa", tipo: "Azienda" },
    { id: "comunita", nome: "Comunità Il Ponte", tipo: "Comunità" },
  ];
  const c = conf[attivo];
  const cambia = (campo, val) => setConf((p) => ({ ...p, [attivo]: { ...p[attivo], [campo]: val } }));
  const attiva = strutture.find((s) => s.id === attivo);
  return (
    <>
      <Intestazione
        occhiello="Configurazione servizio"
        titolo="Impostazioni per committente"
        sotto="Ogni struttura ha le sue regole. Qui si definiscono orari limite, listino, composizione del pasto"
        azioni={<button className="btn piccolo" onClick={() => st.avvisa("Impostazioni salvate per " + attiva.nome)}>Salva</button>}
      />
      <div className="tela">
        <div className="giorni-tab">
          {strutture.map((s) => (
            <button key={s.id} className={attivo === s.id ? "on" : ""} onClick={() => setAttivo(s.id)}>
              {s.tipo}<span>{s.nome}</span>
            </button>
          ))}
        </div>

        <div className="impostazioni">
          <div className="impo-riga">
            <label>
              <span className="so-lab">Orario limite ordini</span>
              <input type="text" value={c.cutoff} onChange={(e) => cambia("cutoff", e.target.value)} />
              <em>Oltre questo momento l'ordine si congela e diventa distinta.</em>
            </label>
            <label>
              <span className="so-lab">Listino</span>
              <input type="text" value={c.listino} onChange={(e) => cambia("listino", e.target.value)} />
              <em>Il prototipo mostra un solo prezzo, a regime va per categoria di pasto.</em>
            </label>
          </div>
          <div className="impo-riga">
            <label>
              <span className="so-lab">Regola di composizione del pasto</span>
              <input type="text" value={c.regolaPasto} onChange={(e) => cambia("regolaPasto", e.target.value)} />
              <em>Base per l'indicatore di equilibrio nel vassoio del commensale.</em>
            </label>
          </div>
          <div className="impo-riga toggle">
            <label className="toggle-riga">
              <input type="checkbox" checked={c.frutta} onChange={(e) => cambia("frutta", e.target.checked)} />
              <span>
                <b>Frutta a ogni pasto</b>
                <em>Il capitolato prevede la sesta portata, colore viola secondo il codice WHP.</em>
              </span>
            </label>
            <label className="toggle-riga">
              <input type="checkbox" checked={c.monoporzione} onChange={(e) => cambia("monoporzione", e.target.checked)} />
              <span>
                <b>Consegna in monoporzione nominativa</b>
                <em>Etichetta obbligatoria su ogni vaschetta. Aumenta il costo di confezionamento.</em>
              </span>
            </label>
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Rotazione menu</h2>
            <span className="conta-piatti">ciclo autunnale, 4 settimane</span>
          </div>
          <div style={{ padding: "18px 24px" }}>
            <div className="rot-corrente">
              <div>
                <div className="so-lab">In vigore adesso</div>
                <div className="rot-big">Settimana {settCorrente}</div>
                <div className="rot-sub">dal 1 settembre · ruota automaticamente lunedì 8</div>
              </div>
              <button className="btn linea piccolo" onClick={() => {
                const next = settCorrente === 4 ? 1 : settCorrente + 1;
                setSettCorrente(next);
                st.avvisa("Rotazione forzata alla settimana " + next);
                st.logga("Cucina MAVI", "Admin", "Rotazione menu forzata", "Passaggio a settimana " + next, "modifica");
              }}>Forza rotazione</button>
            </div>

            <div className="rot-timeline">
              {[1, 2, 3, 4].map((n) => {
                const stato = n === settCorrente ? "attiva" : n === (settCorrente === 4 ? 1 : settCorrente + 1) ? "prossima" : "programmata";
                return (
                  <button key={n} className={"rot-step " + stato} onClick={() => {
                    setSettCorrente(n);
                    st.avvisa("Settimana " + n + " impostata come attiva");
                  }}>
                    <span className="rot-n">{n}</span>
                    <span className="rot-lab">Settimana {n}</span>
                    <span className="rot-stato">{stato}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pannello-piede">
            La rotazione dice quale delle quattro settimane del ciclo è in vigore. I piatti di ogni
            settimana si compongono da <b>Menu della settimana</b>. Alla fine della quarta si torna alla prima.
          </div>
        </div>
      </div>
    </>
  );
}
