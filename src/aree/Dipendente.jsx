import React from "react";
import {
  ALLERGENI, CATEGORIE, COLORI, GIORNI, PIATTI, menuDelGiorno,
  QUOTA_DIPENDENTE, fuoriDieta, giorniSettimana, primoAperto,
} from "../data.js";
import {
  Accesso, DiscoColore, Icone, Illustrazione, Intestazione, Messaggi, NessunPermesso,
  SchedaPiatto, Telaio, Velo, Documenti, usaVociPermesse,
} from "../ui.jsx";
import { usaStato } from "../store.jsx";
import { generaRiepilogoPrenotazioniPDF } from "../resoconto.js";

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

const PERMESSO_PAGINA = {
  menu: "menu.vedi",
  settimana: "settimana.vedi",
  prenotazioni: "prenotazioni.vedi",
  diete: "diete.vedi",
  documenti: "documenti.vedi",
};

export default function Dipendente({ onEsci, utente }) {
  const [dentro, setDentro] = React.useState(!!utente);
  const st = usaStato();
  const [voci, pagina, setPagina] = usaVociPermesse(VOCI, PERMESSO_PAGINA);

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
      chiaveUtente={utente ? utente.u : "antonella.rossi"}
      voci={voci}
      pagina={pagina}
      setPagina={setPagina}
      onEsci={() => (onEsci ? onEsci() : null)}
    >
      {voci.length === 0 && <NessunPermesso onEsci={onEsci} />}
      {pagina === "menu" && <MenuGiorno />}
      {pagina === "settimana" && <MenuSettimana />}
      {pagina === "prenotazioni" && <Prenotazioni utente={utente} />}
      {pagina === "diete" && <Diete />}
      {pagina === "documenti" && <Documenti soloPubblici={!st.puo("documenti.riservati")} />}
      <Messaggi lista={st.messaggi} />
    </Telaio>
  );
}

/* Al dipendente si mostra tutta la settimana. Con "adesso" martedì 15 alle
   22:56 lunedì, martedì e mercoledì sono chiusi: si vedono con il lucchetto e
   restano in sola lettura. Giovedì e venerdì si prenotano. */
const SETTIMANA = giorniSettimana(GIORNI);

/* ==================== menu del giorno ==================== */
function MenuGiorno() {
  const st = usaStato();
  const [giorno, setGiorno] = React.useState(() => primoAperto(GIORNI));
  const [scheda, setScheda] = React.useState(null);
  const [avviso, setAvviso] = React.useState(null);
  const [vistaCol, setVistaCol] = React.useState({ primo: "base", secondo: "base" });

  const g = GIORNI[giorno];
  const ordine = st.ordini[giorno] || {};
  const coperte = st.coperte(giorno);
  const scelte = Object.values(ordine);
  const colori = [...new Set(scelte.map((id) => PIATTI[id].col))];
  const bilancio = valutaEquilibrio(colori);
  const confermato = !!st.confermati[giorno];
  const [avvisoDieta, setAvvisoDieta] = React.useState(null);

  function scegliConCheck(g, cat, id) {
    if (GIORNI[g].chiuso) {
      st.avvisa("Le prenotazioni per " + GIORNI[g].n.toLowerCase() + " sono chiuse");
      return;
    }
    if (!st.puo("menu.prenota")) {
      st.avvisa("Il tuo ruolo consulta il menu ma non prenota");
      return;
    }
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
        occhiello="Settimana 38, 14 · 18 settembre 2026"
        titolo="Menu del giorno"
        sotto="Prenota giorno per giorno. Puoi modificare finché il giorno resta aperto."
      />
      <div className="tela">
        <div className="strumenti">
          <button className="nav-tondo" onClick={() => st.avvisa("Settimana precedente")}><Icone.sx size={16} /></button>
          <div className="settimana">14 · 18 settembre</div>
          <button className="nav-tondo" onClick={() => st.avvisa("Settimana successiva")}><Icone.dx size={16} /></button>
        </div>

        <div className="giorni">
          {SETTIMANA.map((d) => {
            const i = d.i;
            const o = st.ordini[i] || {};
            const n = Object.keys(o).length;
            const cls = st.confermati[i] ? "ok" : n ? "parziale" : "";
            const testo = d.chiuso ? "chiuso" : st.confermati[i] ? "prenotato" : n ? "in corso" : "da fare";
            return (
              <button key={d.n} className={"giorno" + (i === giorno ? " on" : "") + (d.chiuso ? " chiuso" : "")} onClick={() => setGiorno(i)}>
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

        {g.chiuso && (
          <div className="avviso chiuso" style={{ marginBottom: 12 }}>
            <Icone.lucchetto size={16} />
            <span>
              Le prenotazioni di <b>{g.n.toLowerCase()} {g.d}</b> sono chiuse: il menu resta
              consultabile ma non si può più scegliere, confermare o disdire.
            </span>
          </div>
        )}

        {st.dietaUtente && (
          <div className="banner-dieta" style={{ marginBottom: 12 }}>
            <Icone.foglia size={15} />
            Dieta {st.dietaUtente} attiva — i piatti non compatibili sono segnalati
          </div>
        )}

        <div className="colonne-3">
          {[
            { key: "primo", alt: "sost_primo", titolo: "Primo", nota: "Scegline uno, oppure passa alle alternative." },
            { key: "secondo", alt: "sost_secondo", titolo: "Secondo", nota: "Scegline uno, oppure passa alle alternative." },
            { key: "contorno", alt: null, titolo: "Contorno", nota: "Una scelta per completare il pasto." },
          ].map((col) => {
            const listaBase = menuDelGiorno(st.menu, giorno, col.key);
            const listaAlt = col.alt ? menuDelGiorno(st.menu, giorno, col.alt) : [];
            const vista = vistaCol[col.key] || "base";
            const lista = vista === "alt" ? listaAlt : listaBase;
            const catAttiva = vista === "alt" ? col.alt : col.key;
            const scelto = ordine[catAttiva];
            const scelotAltro = vista === "alt" ? ordine[col.key] : ordine[col.alt];
            const coperta = coperte.includes(col.key);
            if (!listaBase.length && !listaAlt.length) return null;
            return (
              <section className={"col3" + (coperta ? " coperta" : "")} key={col.key}>
                <div className="col3-testa">
                  <h3>{col.titolo}</h3>
                  <span className={"col3-stato" + (scelto || scelotAltro ? " on" : "")}>
                    {coperta ? "coperto" : (scelto || scelotAltro) ? "scelto" : "da scegliere"}
                  </span>
                </div>
                {col.alt && listaAlt.length > 0 && !coperta && (
                  <div className="col3-toggle">
                    <button className={vista === "base" ? "on" : ""} onClick={() => setVistaCol((v) => ({ ...v, [col.key]: "base" }))}>
                      {col.titolo} <em>{listaBase.length}</em>
                    </button>
                    <button className={vista === "alt" ? "on" : ""} onClick={() => setVistaCol((v) => ({ ...v, [col.key]: "alt" }))}>
                      Alternative <em>{listaAlt.length}</em>
                    </button>
                  </div>
                )}
                {coperta ? (
                  <p className="col3-nota">Coperto dal piatto unico che hai scelto.</p>
                ) : (
                  <>
                    <p className="col3-nota">{col.nota}</p>
                    <div className="col3-lista">
                      {lista.map((id) => (
                        <Tessera key={id} id={id} cat={catAttiva} giorno={giorno} scelto={scelto === id} dietaAttiva={st.dietaUtente} onScheda={() => setScheda({ id, cat: catAttiva })} onScegli={scegliConCheck} />
                      ))}
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>

        {(() => {
          const unici = menuDelGiorno(st.menu, giorno, "unico");
          if (!unici.length) return null;
          const sceltoUnico = ordine.unico;
          return (
            <div className={"unico-wrap" + (sceltoUnico ? " on" : "")}>
              <div className="unico-sep"><span>oppure</span></div>
              <section className={"col3 unico-box" + (sceltoUnico ? " scelto" : "")}>
                <div className="col3-testa">
                  <h3>Piatto unico</h3>
                  <span className={"col3-stato" + (sceltoUnico ? " on" : "")}>{sceltoUnico ? "scelto" : "da scegliere"}</span>
                </div>
                <p className="col3-nota">Sostituisce più portate, la scheda indica quali.</p>
                <div className="col3-lista">
                  {unici.map((id) => (
                    <Tessera key={id} id={id} cat="unico" giorno={giorno} scelto={sceltoUnico === id} dietaAttiva={st.dietaUtente} onScheda={() => setScheda({ id, cat: "unico" })} onScegli={scegliConCheck} />
                  ))}
                </div>
              </section>
            </div>
          );
        })()}
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
        {!st.puo("menu.prenota") ? (
          <button className="btn linea" disabled>Sola consultazione</button>
        ) : g.chiuso ? (
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
          soloLettura={g.chiuso || !st.puo("menu.prenota")}
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

      {avvisoDieta && (
        <Velo onChiudi={() => setAvvisoDieta(null)}>
          <div className="modale-corpo">
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ color: "var(--avv)", flex: "0 0 auto", marginTop: 4 }}><Icone.attenzione size={22} /></span>
              <div>
                <h2 style={{ fontSize: 23 }}>Piatto fuori dieta</h2>
                <p className="paragrafo" style={{ marginTop: 10 }}>
                  {avvisoDieta.piatto.n} non è compatibile con la dieta {st.dietaUtente} che hai
                  dichiarato. Puoi sceglierlo comunque, oppure tornare indietro.
                </p>
              </div>
            </div>
            <div className="modale-azioni">
              <button className="btn linea" onClick={() => setAvvisoDieta(null)}>Torno a scegliere</button>
              <button className="btn" onClick={() => { st.scegli(avvisoDieta.g, avvisoDieta.cat, avvisoDieta.id); setAvvisoDieta(null); }}>Scelgo comunque</button>
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
      className={"tsc" + (scelto ? " on" : "") + (conflitto.length ? " allarmata" : "") + (fuori ? " fuori-dieta" : "")}
      onClick={(e) => { if (e.target.closest(".tsc-info")) return; onScegli(giorno, cat, id); }}
    >
      <span className="tsc-thumb">
        <Illustrazione id={id} />
        <span className="tsc-dot" style={{ background: COLORI[p.col].hex }} />
      </span>
      <span className="tsc-txt">
        <span className="tsc-nome">{p.n}</span>
        <span className="tsc-meta">
          {p.kcal} kcal{(p.mk || []).length ? " · " + p.mk.join(" ") : ""}
          {p.so && <b className="tsc-u">U</b>}
        </span>
        {conflitto.length > 0 && (
          <span className="tsc-warn"><Icone.attenzione size={10} /> {conflitto.map((n) => ALLERGENI[n].toLowerCase()).join(", ")}</span>
        )}
        {fuori && <span className="tsc-fuori">fuori dieta</span>}
      </span>
      <span className="tsc-act">
        <button className="tsc-info" onClick={(e) => { e.stopPropagation(); onScheda(); }}>i</button>
        <span className={"tsc-check" + (scelto ? " on" : "")}><Icone.ok size={14} /></span>
      </span>
    </div>
  );
}

/* ==================== menu della settimana ==================== */
function MenuSettimana() {
  const st = usaStato();
  const [scheda, setScheda] = React.useState(null);
  const SETT = [
    { lab: "Settimana 35", range: "24 · 28 agosto" },
    { lab: "Settimana 36", range: "31 ago · 4 set" },
    { lab: "Settimana 37", range: "7 · 11 settembre" },
    { lab: "Settimana 38", range: "14 · 18 settembre" },
  ];
  const SETT_ATTUALE = SETT.length - 1; // settimana coperta da GIORNI/menu reale
  const [settIdx, setSettIdx] = React.useState(SETT_ATTUALE);
  const [portataFiltro, setPortataFiltro] = React.useState("tutte");
  const s = SETT[settIdx];
  /* le settimane passate sono archivio: il lucchetto serve solo in quella in corso */
  const giorniVisti = settIdx === SETT_ATTUALE ? SETTIMANA : SETTIMANA.map((g) => ({ ...g, chiuso: false }));

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

        {/* griglia: tutta la settimana, i giorni chiusi con il lucchetto */}
        <div className="ms-grid" style={{ gridTemplateColumns: "repeat(" + giorniVisti.length + ", 1fr)" }}>
          {giorniVisti.map((g) => (
            <div className={"ms-giorno-head" + (g.chiuso ? " chiuso" : "")} key={g.n}>
              <span className="ms-g-nome">{g.n}</span>
              <span className="ms-g-data">
                {g.breve}
                {g.chiuso && <span className="ms-g-chiuso"><Icone.lucchetto size={11} /> chiuso</span>}
              </span>
            </div>
          ))}

          {/* per ogni categoria una riga */}
          {catFiltrate.map((c) => (
            <React.Fragment key={c.id}>
              <div className="ms-cat-label" style={{ gridColumn: "1 / -1" }}>{c.nome}</div>
              {giorniVisti.map((g) => {
                const lista = menuDelGiorno(st.menu, g.i, c.id);
                return (
                  <div className="ms-cella" key={g.n + c.id}>
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
function Prenotazioni({ utente }) {
  const st = usaStato();

  /* tutta la settimana, come nella tabella qui sotto: giorno e portate */
  const righeOrdine = () => SETTIMANA.map((d) => {
    const scelte = Object.values(st.ordini[d.i] || {});
    return {
      giorno: d.n + " " + d.d,
      portate: scelte.map((id) => PIATTI[id]?.n).filter(Boolean),
      confermato: !!st.confermati[d.i],
    };
  });

  function scaricaRiepilogo() {
    try {
      generaRiepilogoPrenotazioniPDF({
        dipendente: utente?.nome || "Antonella Rossi",
        committente: utente?.committente || "Rossi Manifatture Spa",
        righe: righeOrdine(),
        datiAziendali: st.datiAziendali,
        avvisa: st.avvisa,
      });
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nella generazione del PDF, riprova");
    }
  }

  return (
    <>
      <Intestazione
        occhiello="Settimana 38"
        titolo="Le mie prenotazioni"
        sotto="La settimana intera: si prenota e si disdice fino alle 14:00 del giorno prima"
        azioni={st.puo("prenotazioni.riepilogo") && (
          <button className="btn linea piccolo" onClick={scaricaRiepilogo}><Icone.scarica size={16} /> Scarica riepilogo</button>
        )}
      />
      <div className="tela">
        <div className="pannello">
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Giorno</th><th>Portate scelte</th><th>Stato</th></tr></thead>
              <tbody>
                {SETTIMANA.map((d) => {
                  const i = d.i;
                  const o = st.ordini[i] || {};
                  const v = Object.values(o).filter((id) => PIATTI[id]);
                  return (
                    <tr key={d.n} className={d.chiuso ? "riga-chiusa" : ""}>
                      <td><b>{d.n}</b> <span style={{ color: "var(--muto)" }}>{d.breve}</span></td>
                      <td>{v.length ? v.map((id) => PIATTI[id].n).join(", ") : <span className="riservato">nessuna prenotazione</span>}</td>
                      <td>
                        {st.confermati[i] ? <span className="pastiglia p-ok">prenotato</span>
                            : v.length && !d.chiuso ? <span className="pastiglia p-att">non confermato</span>
                              : null}
                        {d.chiuso && <span className="pastiglia p-neu stato-chiuso"><Icone.lucchetto size={11} /> chiuso</span>}
                        {!d.chiuso && !st.confermati[i] && !v.length && <span className="pastiglia p-neu">vuoto</span>}
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
