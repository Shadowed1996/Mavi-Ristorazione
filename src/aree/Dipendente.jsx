import React from "react";
import {
  ALLERGENI, CATEGORIE, COLORI, GIORNI, PIATTI, menuDelGiorno,
  sostituisce, QUOTA_DIPENDENTE, fuoriDieta,
} from "../data.js";
import {
  Accesso, DiscoColore, Icone, Illustrazione, Ingredienti, Intestazione, Messaggi,
  SchedaPiatto, Telaio, Velo, Documenti, Faccina, Faccia,
} from "../ui.jsx";
import { usaStato } from "../store.jsx";

function valutaEquilibrio(colori) {
  if (colori.length === 0) {
    return { livello: "basso", faccia: "triste", titolo: "Pasto sbilanciato",
      testo: "Nessuna portata scelta", spiega: "Aggiungi le portate al vassoio",
      manca: ["giallo", "rosso", "verde"] };
  }
  const conBlu = colori.includes("blu");
  const richiesti = conBlu ? ["blu", "verde"] : ["giallo", "rosso", "verde"];
  const mancanti = richiesti.filter((c) => !colori.includes(c));
  if (mancanti.length === 0) {
    return { livello: "ok", faccia: "sorridente", titolo: "Pasto bilanciato",
      testo: "Rispetta la regola del codice colori", spiega: "Rispetta la regola del codice colori",
      manca: [] };
  }
  if (mancanti.length === 1) {
    const t = "Aggiungi " + nomeColore(mancanti[0]);
    return { livello: "medio", faccia: "neutra", titolo: "Quasi ci sei",
      testo: t, spiega: t + " per completare il pasto", manca: mancanti };
  }
  const t = "Manca " + mancanti.map(nomeColore).join(" e ");
  return { livello: "basso", faccia: "triste", titolo: "Pasto sbilanciato",
    testo: t, spiega: t, manca: mancanti };
}

function nomeColore(c) {
  return ({ giallo: "un carboidrato", rosso: "una proteina", verde: "una verdura", blu: "un piatto unico" })[c] || c;
}

const VOCI = [
  ["menu", "Menu del giorno", Icone.piatto],
  ["settimana", "Menu settimana", Icone.calendario],
  ["prenotazioni", "Le mie prenotazioni", Icone.lista],
  ["diete", "Diete speciali", Icone.foglia],
  ["documenti", "Documenti utili", Icone.fattura],
];

export default function Dipendente({ onEsci, utente }) {
  const [dentro, setDentro] = React.useState(!!utente);
  const [pagina, setPagina] = React.useState("menu");
  const st = usaStato();

  if (!dentro)
    return (
      <Accesso
        area="dipendente"
        titolo="Portale dipendente"
        claim="Scegli con calma, <em>mangia meglio</em>."
        punti={[
          "Menu del giorno con la scheda completa di ogni piatto",
          "Prenotazione e disdetta entro le 14:00 del giorno prima",
          "Allergeni, valori nutrizionali e consigli di riscaldamento",
        ]}
        utente={utente ? utente.u : "antonella.rossi"}
        password="dimostrazione"
        onEntra={() => setDentro(true)}
        onIndietro={() => (onEsci ? onEsci() : null)}
      />
    );

  return (
    <Telaio
      area="dipendente"
      marchio="Portale dipendente"
      ruolo="Dipendente"
      utente={{ iniziali: utente ? utente.iniziali : "AR", nome: utente ? utente.nome : "Antonella Rossi", sotto: utente ? utente.committente : "Rossi Manifatture Spa" }}
      voci={VOCI}
      pagina={pagina}
      setPagina={setPagina}
      onEsci={() => (onEsci ? onEsci() : null)}
    >
      {pagina === "menu" && <MenuGiorno />}
      {pagina === "settimana" && <MenuSettimana />}
      {pagina === "prenotazioni" && <Prenotazioni />}
      {pagina === "diete" && <Diete />}
      {pagina === "documenti" && <Documenti soloPubblici />}
      <Messaggi lista={st.messaggi} />
    </Telaio>
  );
}

/* ==================== menu del giorno ==================== */
function MenuGiorno() {
  const st = usaStato();
  const [giorno, setGiorno] = React.useState(2);
  const [scheda, setScheda] = React.useState(null);
  const [avviso, setAvviso] = React.useState(null);

  const g = GIORNI[giorno];
  const ordine = st.ordini[giorno] || {};
  const coperte = st.coperte(giorno);
  const scelte = Object.values(ordine);
  const colori = [...new Set(scelte.map((id) => PIATTI[id].col))];
  const bilancio = valutaEquilibrio(colori);
  const confermato = !!st.confermati[giorno];
  const [avvisoDieta, setAvvisoDieta] = React.useState(null);

  function scegliConCheck(g, cat, id) {
    if (st.dietaUtente && fuoriDieta(PIATTI[id], st.dietaUtente)) {
      setAvvisoDieta({ g, cat, id, piatto: PIATTI[id] });
    } else {
      st.scegli(g, cat, id);
    }
  }

  function apriConferma() {
    const m = st.mancanti(giorno);
    if (m.length) setAvviso(m);
    else st.conferma(giorno);
  }

  return (
    <>
      <Intestazione
        occhiello="Settimana 36, 31 agosto · 4 settembre 2026"
        titolo="Menu del giorno"
        sotto="Prenota giorno per giorno. Puoi modificare finché il giorno resta aperto."
      />
      <div className="tela">
        <div className="strumenti">
          <button className="nav-tondo" onClick={() => st.avvisa("Settimana precedente")}><Icone.sx size={16} /></button>
          <div className="settimana">31 agosto · 4 settembre</div>
          <button className="nav-tondo" onClick={() => st.avvisa("Settimana successiva")}><Icone.dx size={16} /></button>
        </div>

        <div className="giorni">
          {GIORNI.map((d, i) => {
            const o = st.ordini[i] || {};
            const n = Object.keys(o).length;
            const cls = st.confermati[i] ? "ok" : n ? "parziale" : "";
            const testo = d.chiuso ? "chiuso" : st.confermati[i] ? "prenotato" : n ? "in corso" : "da fare";
            return (
              <button key={d.n} className={"giorno" + (i === giorno ? " on" : "")} onClick={() => setGiorno(i)}>
                <div className="gn">{d.n}</div>
                <div className="gd">{d.breve}</div>
                <div className="gs">
                  {d.chiuso ? <Icone.lucchetto size={13} /> : <i className={"punto " + cls} />}
                  {testo}
                </div>
              </button>
            );
          })}
        </div>

        {st.dietaUtente && (
          <div className="banner-dieta" style={{ marginBottom: 12 }}>
            <Icone.foglia size={15} />
            Dieta {st.dietaUtente} attiva — i piatti non compatibili sono segnalati
          </div>
        )}

        <div className="sezioni">
          {CATEGORIE.map((c) => {
            const lista = menuDelGiorno(st.menu, giorno, c.id);
            if (!lista.length) return null;
            const coperta = coperte.includes(c.id);
            const scelto = ordine[c.id];
            return (
              <section className={"sezione" + (coperta ? " coperta" : "")} key={c.id}>
                <div className="sezione-testa">
                  <h3>{c.nome}</h3>
                  <span className="conta-piatti">{lista.length}</span>
                  <span className={"stato" + (scelto ? " on" : "")}>
                    {coperta ? "coperto" : scelto ? "scelto" : "da scegliere"}
                  </span>
                </div>
                <p className="sezione-nota">{coperta ? "Coperto dal piatto unico." : c.nota}</p>
                <div className="tessere">
                  {lista.map((id) => (
                    <Tessera key={id} id={id} cat={c.id} giorno={giorno} scelto={scelto === id} dietaAttiva={st.dietaUtente} onScheda={() => setScheda({ id, cat: c.id })} onScegli={scegliConCheck} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="vassoio">
        <span className="portale-icona" style={{ marginBottom: 0 }}><Icone.sacco size={21} /></span>
        <span className="vassoio-t">
          <b>{g.n} {g.d}</b>
          <span>
            {scelte.length ? scelte.length + " portate selezionate" : "nessuna portata selezionata"}
            {" · "}{QUOTA_DIPENDENTE.toFixed(2).replace(".", ",")} € a tuo carico
          </span>
        </span>
        <span className="equilibrio">
          <span className="equilibrio-dischi">
            {["giallo", "rosso", "verde", "blu"].filter((c) => colori.includes(c) || !["blu", "viola"].includes(c)).map((c) => {
              const acceso = colori.includes(c);
              return (
                <span key={c}
                  className={"disco-eq" + (acceso ? " acceso" : "")}
                  style={acceso ? { background: COLORI[c].hex } : undefined}
                  title={COLORI[c].nome + ", " + COLORI[c].cosa} />
              );
            })}
          </span>
          <span className="equilibrio-testo">
            <b>Pasto equilibrato</b>
            {bilancio.livello === "ok"
              ? <span className="si">completo secondo il codice colori</span>
              : <span className="no">manca {(bilancio.manca || []).join(", ")}</span>}
          </span>
        </span>
        {g.chiuso ? (
          <button className="btn linea" disabled>Prenotazioni chiuse</button>
        ) : confermato ? (
          <button className="btn linea" onClick={() => st.disdici(giorno)}>Disdici prenotazione</button>
        ) : (
          <button className="btn" disabled={!scelte.length} onClick={apriConferma}>
            Conferma prenotazione <Icone.ok size={16} />
          </button>
        )}
      </div>

      {scheda && (
        <SchedaPiatto
          id={scheda.id}
          scelto={ordine[scheda.cat] === scheda.id}
          soloLettura={g.chiuso}
          allergeniUtente={st.allergeniUtente}
          onChiudi={() => setScheda(null)}
          onScegli={() => { st.scegli(giorno, scheda.cat, scheda.id); setScheda(null); }}
        />
      )}

      {avviso && (
        <Velo onChiudi={() => setAvviso(null)}>
          <div className="modale-corpo">
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ color: "var(--avv)", flex: "0 0 auto", marginTop: 4 }}><Icone.attenzione size={22} /></span>
              <div>
                <h2 style={{ fontSize: 23 }}>Manca qualcosa nel tuo pasto</h2>
                <p className="paragrafo" style={{ marginTop: 10 }}>
                  Non hai selezionato {avviso.join(", ")}. Puoi confermare lo stesso, oppure
                  tornare indietro e completare la scelta.
                </p>
              </div>
            </div>
            <div className="modale-azioni">
              <button className="btn linea" onClick={() => setAvviso(null)}>Torno a scegliere</button>
              <button className="btn" onClick={() => { setAvviso(null); st.conferma(giorno); }}>Confermo così</button>
            </div>
          </div>
        </Velo>
      )}
    </>
  );
}

function Tessera({ id, cat, giorno, scelto, dietaAttiva, onScheda, onScegli }) {
  const st = usaStato();
  const p = PIATTI[id];
  const conflitto = p.a.filter((n) => st.allergeniUtente.includes(n));
  const fuori = dietaAttiva && fuoriDieta(p, dietaAttiva);
  return (
    <div
      className={"tessera" + (scelto ? " on" : "") + (conflitto.length ? " allarmata" : "") + (fuori ? " fuori-dieta" : "")}
      onClick={(e) => {
        if (e.target.closest(".info-b")) return;
        onScegli(giorno, cat, id);
      }}
      style={{ cursor: "pointer" }}
    >
      <span className="tondo-piatto">
        {p.so && <span className="badge-u">U</span>}
        <Illustrazione id={id} />
        <span className="pastello-colore" style={{ background: COLORI[p.col].hex }} title={COLORI[p.col].nome} />
      </span>
      <span className="tessera-testo">
        <span className="tessera-nome">{p.n}</span>
        <span className="riga-colore">
          <DiscoColore colore={p.col} size={11} />
          {COLORI[p.col].nome} · {p.kcal} kcal{(p.mk || []).length ? " · " + p.mk.join(" ") : ""}
        </span>
        {p.so && <span className="tessera-sost">{sostituisce(id)}</span>}
        {conflitto.length > 0 && (
          <span className="allarme">
            <Icone.attenzione size={12} />
            contiene {conflitto.map((n) => ALLERGENI[n].toLowerCase()).join(", ")}
          </span>
        )}
      </span>
      <span className="tessera-comandi">
        <button className="info-b" onClick={(e) => { e.stopPropagation(); onScheda(); }} aria-label={"scheda di " + p.n}>i</button>
        <button className="spunta" aria-label="scegli">
          <Icone.ok size={15} />
        </button>
      </span>
    </div>
  );
}

function Voce({ id, cat, giorno, scelto, onScheda, onScegli }) {
  const st = usaStato();
  const p = PIATTI[id];
  return (
    <div className={"voce" + (scelto ? " on" : "")}>
      <span className="voce-mini" onClick={onScheda}><Illustrazione id={id} /></span>
      <span className="voce-corpo" onClick={() => onScegli(giorno, cat, id)}>
        <span className="voce-nome">{p.n}</span>
        {p.so && <span className="voce-sost">{sostituisce(id)}</span>}
      </span>
      <button className="voce-info" onClick={onScheda} aria-label={"scheda di " + p.n}>i</button>
      <button className="voce-spunta" onClick={() => onScegli(giorno, cat, id)} aria-label="scegli"><Icone.ok size={14} /></button>
    </div>
  );
}

/* ==================== menu della settimana ==================== */
function MenuSettimana() {
  const st = usaStato();
  const [scheda, setScheda] = React.useState(null);
  const [settIdx, setSettIdx] = React.useState(0);
  const [portataFiltro, setPortataFiltro] = React.useState("tutte");
  const SETT = [
    { lab: "Settimana 35", range: "24 · 28 agosto" },
    { lab: "Settimana 36", range: "31 ago · 4 set" },
    { lab: "Settimana 37", range: "7 · 11 settembre" },
    { lab: "Settimana 38", range: "14 · 18 settembre" },
  ];
  const s = SETT[settIdx];

  const catFiltrate = portataFiltro === "tutte"
    ? CATEGORIE
    : CATEGORIE.filter((c) => c.id === portataFiltro);

  return (
    <>
      <Intestazione
        occhiello={s.lab + " · 2026"}
        titolo="Menu della settimana"
        sotto="Tocca un piatto per la scheda con allergeni e valori nutrizionali"
      />
      <div className="tela">
        {/* navigazione settimane */}
        <div className="ms-nav">
          <button className="ms-nav-btn" disabled={settIdx === 0} onClick={() => setSettIdx(settIdx - 1)}>
            <Icone.sx size={14} />
          </button>
          {SETT.map((sw, i) => (
            <button key={i} className={"ms-nav-sett" + (i === settIdx ? " on" : "")} onClick={() => setSettIdx(i)}>
              <span className="ms-nav-n">{sw.lab.replace("Settimana ", "S")}</span>
              <span className="ms-nav-r">{sw.range}</span>
            </button>
          ))}
          <button className="ms-nav-btn" disabled={settIdx === SETT.length - 1} onClick={() => setSettIdx(settIdx + 1)}>
            <Icone.dx size={14} />
          </button>
        </div>

        {/* filtro portata */}
        <div className="commuta" style={{ marginBottom: 20 }}>
          <button className={portataFiltro === "tutte" ? "on" : ""} onClick={() => setPortataFiltro("tutte")}>Tutte</button>
          {CATEGORIE.map((c) => (
            <button key={c.id} className={portataFiltro === c.id ? "on" : ""} onClick={() => setPortataFiltro(c.id)}>
              {c.nome}
            </button>
          ))}
        </div>

        {/* griglia 5 colonne */}
        <div className="ms-grid">
          {/* intestazione giorni */}
          {GIORNI.map((g) => (
            <div className={"ms-giorno-head" + (g.chiuso && settIdx === 0 ? " chiuso" : "")} key={g.n}>
              <span className="ms-g-nome">{g.n}</span>
              <span className="ms-g-data">{g.breve}</span>
            </div>
          ))}

          {/* per ogni categoria una riga */}
          {catFiltrate.map((c) => (
            <React.Fragment key={c.id}>
              <div className="ms-cat-label" style={{ gridColumn: "1 / -1" }}>{c.nome}</div>
              {GIORNI.map((g, gi) => {
                const lista = menuDelGiorno(st.menu, gi, c.id);
                const chiuso = g.chiuso && settIdx === 0;
                return (
                  <div className={"ms-cella" + (chiuso ? " chiuso" : "")} key={g.n + c.id}>
                    {lista.length === 0 ? (
                      <span className="ms-vuoto">—</span>
                    ) : lista.map((id) => (
                      <button key={id} className="ms-piatto" onClick={() => setScheda({ id, cat: c.id })}>
                        <DiscoColore colore={PIATTI[id].col} size={7} />
                        <span className="ms-piatto-n">{PIATTI[id].n}</span>
                        {PIATTI[id].so && <span className="ms-u">U</span>}
                      </button>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* legenda */}
        <div className="ms-legenda">
          <span>● Giallo = carboidrato</span>
          <span>● Rosso = proteina</span>
          <span>● Verde = verdura</span>
          <span>● Blu = piatto unico</span>
          <span>U = sostituisce più portate</span>
        </div>
      </div>
      {scheda && (
        <SchedaPiatto id={scheda.id} cat={scheda.cat} onChiudi={() => setScheda(null)} />
      )}
    </>
  );
}

/* ==================== le mie prenotazioni ==================== */
function Prenotazioni() {
  const st = usaStato();
  return (
    <>
      <Intestazione
        occhiello="Settimana 36"
        titolo="Le mie prenotazioni"
        sotto="Riepilogo della settimana in corso"
        azioni={<button className="btn linea piccolo" onClick={() => st.avvisa("Riepilogo scaricato, funzione dimostrativa")}><Icone.scarica size={16} /> Scarica riepilogo</button>}
      />
      <div className="tela">
        <div className="pannello">
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Giorno</th><th>Portate scelte</th><th>Stato</th></tr></thead>
              <tbody>
                {GIORNI.map((d, i) => {
                  const o = st.ordini[i] || {};
                  const v = Object.values(o);
                  return (
                    <tr key={d.n}>
                      <td><b>{d.n}</b> <span style={{ color: "var(--muto)" }}>{d.breve}</span></td>
                      <td>{v.length ? v.map((id) => PIATTI[id].n).join(", ") : <span className="riservato">nessuna prenotazione</span>}</td>
                      <td>
                        {d.chiuso ? <span className="pastiglia p-neu">chiuso</span>
                          : st.confermati[i] ? <span className="pastiglia p-ok">prenotato</span>
                            : v.length ? <span className="pastiglia p-att">non confermato</span>
                              : <span className="pastiglia p-neu">vuoto</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Prenotazione e disdetta sono possibili fino alle 14:00 del giorno precedente. Dopo
            quell'ora il giorno resta consultabile ma non modificabile.
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== diete speciali ==================== */
const DIETE = [
  ["Vegetariano", "Nessun ingrediente di origine animale macellata"],
  ["Vegano", "Nessun ingrediente di origine animale"],
  ["Senza glutine", "Richiede certificazione medica, validata da MAVI"],
  ["Menu religioso", "Senza carne suina, oppure secondo indicazione"],
];

function Diete() {
  const st = usaStato();
  const [scelta, setScelta] = React.useState(null);
  return (
    <>
      <Intestazione occhiello="Profilo" titolo="Diete e allergeni" sotto="Il menu si adatta alle tue esigenze" />
      <div className="tela">
        <div className="pannello" style={{ maxWidth: 760 }}>
          <div className="pannello-testa"><h2>Regime alimentare</h2></div>
          <div style={{ padding: 22 }}>
            <p className="paragrafo" style={{ marginBottom: 18 }}>
              Se segui una dieta particolare puoi richiedere il menu dedicato. Le richieste di
              natura sanitaria, come la celiachia, richiedono il certificato medico e vengono
              validate da MAVI prima di diventare operative.
            </p>
            <div className="elenco">
              {DIETE.map(([t, d]) => (
                <div key={t} className={"voce" + (scelta === t ? " on" : "")}
                  onClick={() => { 
                    const nuova = scelta === t ? "" : t;
                    setScelta(nuova ? t : null); 
                    st.setDietaUtente(nuova.toLowerCase());
                    st.avvisa(nuova ? "Preferenza " + t + " attivata" : "Preferenza rimossa"); 
                  }}>
                  <span className="voce-corpo">
                    <span className="voce-nome">{t}</span>
                    <span style={{ display: "block", fontSize: 12.5, color: "var(--muto)", marginTop: 2 }}>{d}</span>
                  </span>
                  <button className="voce-spunta" aria-label="scegli"><Icone.ok size={14} /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="pannello-piede">
            La motivazione sanitaria resta visibile solo a te e al personale MAVI autorizzato.
            Il tuo datore di lavoro vede soltanto il numero di pasti speciali da preparare, come
            previsto dall'articolo 9 del GDPR.
          </div>
        </div>

        <div className="pannello" style={{ maxWidth: 760 }}>
          <div className="pannello-testa">
            <h2>I miei allergeni</h2>
            {st.allergeniUtente.length > 0 && (
              <div className="az">
                <button className="btn linea piccolo" onClick={() => st.allergeniUtente.forEach((n) => st.commutaAllergene(n))}>
                  Azzera selezione
                </button>
              </div>
            )}
          </div>
          <div style={{ padding: 22 }}>
            <p className="paragrafo" style={{ marginBottom: 18 }}>
              Segnala gli allergeni che devi evitare. I piatti che li contengono restano
              visibili, ma vengono marcati in rosso nel menu e nella scheda prodotto, così non
              li scegli per distrazione. Sono i quattordici allergeni del Regolamento UE
              1169/2011.
            </p>
            <div className="griglia-allergeni">
              {Object.keys(ALLERGENI).map((n) => {
                const num = Number(n);
                const on = st.allergeniUtente.includes(num);
                return (
                  <button key={n} className={"tasto-allergene" + (on ? " on" : "")} onClick={() => st.commutaAllergene(num)}>
                    <i>{on ? <Icone.ok size={12} /> : n}</i>
                    {ALLERGENI[n]}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pannello-piede">
            La marcatura è un aiuto alla scelta e non sostituisce la lettura della scheda
            prodotto. Per le allergie gravi va sempre segnalata la condizione a MAVI.
          </div>
        </div>
      </div>
    </>
  );
}
