import React from "react";
import { PAZIENTI_COMUNITA, GIORNI_SETT, splitPiatto } from "../data.js";
import { Icone, Intestazione, Velo } from "../ui.jsx";
import { usaStato } from "../store.jsx";

const GIORNO_DEMO = "mercoledì";

/* ==================== pagina Pazienti ==================== */
function Pazienti({ soloLettura, reparto }) {
  const st = usaStato();
  const [lista, setLista] = React.useState(() =>
    reparto ? PAZIENTI_COMUNITA.filter((p) => p.stanza === reparto) : PAZIENTI_COMUNITA
  );
  const [scheda, setScheda] = React.useState(null);
  const [modulo, setModulo] = React.useState(null); // null | "nuovo" | paziente per modifica
  const [giornoVista, setGiornoVista] = React.useState("lunedì");
  const repartiComunita = st.committenti.find((c) => c.id === "comunita")?.unita || [];

  /* Nuovo paziente ed eliminazione mutano anche l'elenco condiviso
     PAZIENTI_COMUNITA (stessa scorciatoia del catalogo piatti in store.jsx):
     senza questo, un paziente creato qui non comparirebbe in Presenze,
     Resoconti né nelle Etichette del portale MAVI. */
  function salva(dati) {
    if (dati.id) {
      Object.assign(PAZIENTI_COMUNITA.find((p) => p.id === dati.id) || {}, dati);
      setLista((l) => l.map((p) => (p.id === dati.id ? { ...p, ...dati } : p)));
      st.avvisa(dati.nome + " aggiornato");
      st.logga(dati.nome, "Responsabile", "Anagrafica paziente modificata", dati.nome + ", " + dati.stanza, "modifica");
    } else {
      const nuovo = { ...dati, id: "p" + Date.now(), dal: "settembre 2026" };
      PAZIENTI_COMUNITA.push(nuovo);
      setLista((l) => [...l, nuovo]);
      st.avvisa(nuovo.nome + " aggiunto all'anagrafica");
      st.logga(nuovo.nome, "Responsabile", "Nuovo paziente accettato", nuovo.nome + ", " + nuovo.stanza, "modifica");
    }
    setModulo(null);
  }

  function elimina(id) {
    const idx = PAZIENTI_COMUNITA.findIndex((p) => p.id === id);
    if (idx >= 0) PAZIENTI_COMUNITA.splice(idx, 1);
    setLista((l) => l.filter((p) => p.id !== id));
    st.avvisa("Paziente rimosso dall'anagrafica");
    setScheda(null);
  }

  return (
    <>
      <Intestazione
        occhiello="Comunità Il Ponte"
        titolo="Pazienti"
        sotto="Anagrafica e dieta settimanale di ogni paziente. La dieta la scrive il dietista, il responsabile la carica"
        azioni={
          !soloLettura && <button className="btn piccolo" onClick={() => setModulo("nuovo")}>
            <Icone.piu size={14} /> Nuovo paziente
          </button>
        }
      />
      <div className="tela">
        <div className="avviso info" style={{ alignItems: "flex-start" }}>
          <Icone.attenzione size={18} />
          <span>
            Nomi e dettagli di questa schermata sono di fantasia, con finalità dimostrative. A regime
            la gestione dei pazienti tratta dati personali e richiede consenso e responsabilità precise.
          </span>
        </div>

        {reparto && (
          <div className="banner-dieta" style={{ background: "#eef3fa", borderColor: "#b8cce0", color: "#2c4a6c" }}>
            <Icone.attenzione size={15} />
            Stai vedendo solo i pazienti di <b>{reparto}</b>. Il responsabile vede tutte le strutture.
          </div>
        )}

        <div className="ospiti">
          {lista.map((p) => (
            <button className="ospite" key={p.id} onClick={() => setScheda(p)}>
              <span className="ospite-testa">
                <span className="ospite-iniziali">
                  {p.nome.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                </span>
                <span className="ospite-nome">
                  <b>{p.nome}</b>
                  <span>{p.stanza}</span>
                </span>
              </span>
              <span className="ospite-tag">
                {p.tipo_dieta ? <span className="tag-dieta terap">{p.tipo_dieta}</span> : <span className="tag-dieta base">Standard</span>}
              </span>
              <span className="ospite-dettaglio">Apri scheda <Icone.dx size={13} /></span>
            </button>
          ))}
        </div>
      </div>

      {scheda && (
        <SchedaPaziente
          paziente={scheda}
          onChiudi={() => setScheda(null)}
          onModifica={soloLettura ? null : () => { setModulo(scheda); setScheda(null); }}
          onElimina={soloLettura ? null : () => elimina(scheda.id)}
          soloLettura={soloLettura}
          puoDieta={!soloLettura || !!reparto}
        />
      )}

      {modulo && (
        <ModuloPaziente
          paziente={modulo === "nuovo" ? null : modulo}
          reparti={repartiComunita}
          onChiudi={() => setModulo(null)}
          onSalva={salva}
        />
      )}
    </>
  );
}

/* ==================== scheda paziente ==================== */
function SchedaPaziente({ paziente, onChiudi, onModifica, onElimina, soloLettura, puoDieta }) {
  const [editing, setEditing] = React.useState(null);
  const [editVal, setEditVal] = React.useState("");
  const [modalitaModifica, setModalitaModifica] = React.useState(false);
  const [importPreview, setImportPreview] = React.useState(null); // { dieta, titolo }
  const [importError, setImportError] = React.useState("");
  const fileRef = React.useRef(null);
  const st = usaStato();
  const NOMI_GIORNI = { "lunedì": "Lunedì", "martedì": "Martedì", "mercoledì": "Mercoledì", "giovedì": "Giovedì", "venerdì": "Venerdì" };

  function salvaOverride(giorno, pasto, portata) {
    if (editVal.trim()) {
      paziente.dieta[giorno][pasto][portata] = editVal.trim();
      st.avvisa(portata + " di " + pasto + ", " + giorno + " aggiornato");
    }
    setEditing(null);
  }

  function renderPortata(giorno, pasto, portata) {
    const val = paziente.dieta[giorno]?.[pasto]?.[portata] || "—";
    const chiave = giorno + "-" + pasto + "-" + portata;
    const isEditing = editing === chiave;

    if (isEditing) {
      return (
        <div style={{ marginTop: 2 }}>
          <input type="text" value={editVal} onChange={(e) => setEditVal(e.target.value)}
            style={{ width: "100%", fontSize: 12, padding: "4px 6px", border: "1.5px solid var(--acc)", borderRadius: 4, outline: "none" }} autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") salvaOverride(giorno, pasto, portata); if (e.key === "Escape") setEditing(null); }}
            onBlur={() => salvaOverride(giorno, pasto, portata)} />
        </div>
      );
    }
    return (
      <div
        style={{
          fontSize: 13, lineHeight: 1.4, padding: "2px 0",
          cursor: modalitaModifica ? "pointer" : "default",
          borderBottom: modalitaModifica ? "1px dashed var(--linea-forte)" : "1px solid transparent",
        }}
        onClick={() => { if (!modalitaModifica) return; setEditing(chiave); setEditVal(val === "—" ? "" : val); }}
      >
        {splitPiatto(val).nome}
        {splitPiatto(val).nota && <span className="nota-prep piccola"> ⚠ {splitPiatto(val).nota}</span>}
      </div>
    );
  }

  return (
    <Velo onChiudi={onChiudi} largo>
      <div className="scelta-testa">
        <div className="occhiello">{paziente.stanza} · presente dal {paziente.dal}</div>
        <h2>{paziente.nome}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <p style={{ flex: 1, minWidth: 200 }}>{paziente.note}</p>
          {paziente.tipo_dieta && <span className="tag-dieta terap">{paziente.tipo_dieta}</span>}
          {puoDieta && (
            <button
              className={"btn piccolo" + (modalitaModifica ? "" : " linea")}
              onClick={() => { setModalitaModifica(!modalitaModifica); setEditing(null); }}
            >
              {modalitaModifica ? "Fine modifica" : "Modifica dieta"}
            </button>
          )}
        </div>
      </div>

      <div className="scheda-ospite" style={{ padding: "16px 24px" }}>
        <div className="menu-sett-grid">
          {GIORNI_SETT.map((g) => {
            const dieta = paziente.dieta[g];
            if (!dieta) return null;
            return (
              <div className="menu-sett-giorno" key={g}>
                <div className="menu-sett-giorno-testa">
                  <h3>{NOMI_GIORNI[g]}</h3>
                </div>
                {["pranzo", "cena"].map((pasto) => (
                  <div key={pasto} className="menu-sett-portata">
                    <div className="menu-sett-portata-lab">{pasto}</div>
                    {["primo", "secondo", "contorno"].map((portata) => (
                      <div key={portata} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--muto)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{portata}</div>
                        {renderPortata(g, pasto, portata)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="scelta-piede" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        {!soloLettura && <button className="btn linea" style={{ color: "#d9534f" }} onClick={onElimina}>Elimina</button>}
        {!soloLettura && <button className="btn linea" onClick={onModifica}>Modifica anagrafica</button>}
        {puoDieta && <>
          <input type="file" accept=".xlsx,.xls" ref={fileRef} style={{ display: "none" }} onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              setImportError("");
              const { parsaDietaExcel } = await import("../diete.js");
              const result = await parsaDietaExcel(file);
              setImportPreview(result);
            } catch (err) {
              setImportError("Errore nella lettura del file: " + err.message);
            }
            e.target.value = "";
          }} />
          <button className="btn linea" onClick={() => fileRef.current?.click()}>
            Carica dieta
          </button>
          <button className="btn linea" onClick={async () => {
            const { generaTemplateDieta } = await import("../diete.js");
            await generaTemplateDieta([paziente]);
            st.avvisa("Template Excel scaricato per " + paziente.nome);
          }}>
            Scarica template
          </button>
        </>}
        <button className="btn" onClick={onChiudi}>Chiudi</button>
      </div>

      {importError && (
        <div className="avviso info" style={{ margin: "12px 24px", background: "#fef3e8", border: "1px solid #e8d2b0" }}>
          <Icone.attenzione size={16} />
          <span>{importError}</span>
        </div>
      )}

      {importPreview && (
        <Velo onChiudi={() => setImportPreview(null)}>
          <div className="scelta-testa">
            <div className="occhiello">Anteprima dieta importata</div>
            <h2>Conferma import per {paziente.nome}</h2>
            <p>Verifica che i piatti siano corretti prima di applicare la dieta.</p>
          </div>
          <div className="scheda-ospite" style={{ padding: "16px 24px", maxHeight: 400, overflowY: "auto" }}>
            <div className="menu-sett-grid">
              {GIORNI_SETT.map((g) => {
                const d = importPreview.dieta[g];
                if (!d) return null;
                return (
                  <div className="menu-sett-giorno" key={g}>
                    <div className="menu-sett-giorno-testa">
                      <h3 style={{ textTransform: "capitalize" }}>{g}</h3>
                    </div>
                    {["pranzo", "cena"].map((pasto) => (
                      <div key={pasto} className="menu-sett-portata">
                        <div className="menu-sett-portata-lab">{pasto}</div>
                        {["primo", "secondo", "contorno"].map((portata) => (
                          <div key={portata} style={{ fontSize: 12, padding: "2px 0" }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--muto)", textTransform: "uppercase" }}>{portata}: </span>
                            {d[pasto]?.[portata] || "—"}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="scelta-piede" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn linea" onClick={() => setImportPreview(null)}>Annulla</button>
            <button className="btn" onClick={() => {
              Object.assign(paziente.dieta, importPreview.dieta);
              st.avvisa("Dieta aggiornata per " + paziente.nome + " — tutti i giorni importati dal file");
              st.logga(paziente.nome, "Import dieta", "Dieta caricata da file Excel", "5 giorni, pranzo e cena", "modifica");
              setImportPreview(null);
            }}>
              Approva e applica
            </button>
          </div>
        </Velo>
      )}
    </Velo>
  );
}

/* ==================== modulo crea/modifica paziente ==================== */
function ModuloPaziente({ paziente, reparti, onChiudi, onSalva }) {
  const [nome, setNome] = React.useState(paziente?.nome || "");
  /* se il paziente ha già una stanza che non è (più) nell'elenco reparti
     (dato storico, o reparto nel frattempo rimosso), la teniamo comunque in
     lista così la select non la cancella in silenzio */
  const opzioni = paziente?.stanza && !reparti.includes(paziente.stanza)
    ? [paziente.stanza, ...reparti] : reparti;
  const [stanza, setStanza] = React.useState(paziente?.stanza || reparti[0] || "");
  const [note, setNote] = React.useState(paziente?.note || "");

  function invia(e) {
    e.preventDefault();
    if (!nome.trim() || !stanza) return;
    onSalva({
      ...(paziente || {}),
      nome: nome.trim(),
      stanza,
      note: note.trim(),
      dieta: paziente?.dieta || dietaVuota(),
    });
  }

  return (
    <Velo onChiudi={onChiudi}>
      <div className="scelta-testa">
        <div className="occhiello">Anagrafica</div>
        <h2>{paziente ? "Modifica paziente" : "Nuovo paziente"}</h2>
        <p>La dieta settimanale si carica dalla scheda del paziente dopo averlo creato.</p>
      </div>
      <form onSubmit={invia} style={{ padding: "20px 26px" }}>
        <div className="campo">
          <label>Nome e cognome</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="es. Mario Bianchi" />
        </div>
        <div className="campo">
          <label>Stanza / struttura</label>
          {opzioni.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "var(--muto)" }}>
              Nessun reparto ancora censito. Aggiungine uno da Impostazioni per committente → Comunità Il Ponte.
            </p>
          ) : (
            <select value={stanza} onChange={(e) => setStanza(e.target.value)}>
              {opzioni.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
          )}
          <p style={{ fontSize: 11, color: "var(--muto)", margin: "4px 0 0" }}>
            Determina anche il reparto: solo l'educatore assegnato a questo valore vedrà il paziente.
          </p>
        </div>
        <div className="campo">
          <label>Note per la cucina</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Allergie, preferenze, consistenza" />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 10 }}>
          <button type="button" className="btn linea" onClick={onChiudi}>Annulla</button>
          <button type="submit" className="btn" disabled={!nome.trim() || !stanza}>
            {paziente ? "Salva modifiche" : "Crea paziente"}
          </button>
        </div>
      </form>
    </Velo>
  );
}

function dietaVuota() {
  const vuoto = { primo: "", secondo: "", contorno: "" };
  const obj = {};
  GIORNI_SETT.forEach((g) => { obj[g] = { pranzo: { ...vuoto }, cena: { ...vuoto } }; });
  return obj;
}

/* ==================== pagina Presenze ==================== */
function PresenzeComunita({ reparto }) {
  const st = usaStato();
  const [pasto, setPasto] = React.useState("pranzo");
  const presenti = st.presenzeComunita;
  const paz = reparto ? PAZIENTI_COMUNITA.filter((p) => p.stanza === reparto) : PAZIENTI_COMUNITA;

  const segnaPresente = (id) => st.setPresenzeComunita({ ...presenti, [id]: true });
  const segnaAssente = (id) => st.setPresenzeComunita({ ...presenti, [id]: false });
  const totPresenti = paz.filter((p) => presenti[p.id] === true).length;
  const totAssenti = paz.filter((p) => presenti[p.id] === false).length;
  const totNonSegnati = paz.filter((p) => presenti[p.id] == null).length;

  return (
    <>
      <Intestazione
        occhiello={"Mercoledì 16 settembre 2026, " + pasto + (reparto ? " · " + reparto : "")}
        titolo="Presenze del giorno"
        sotto="Segna ogni paziente come presente o assente. La cucina prepara solo i pasti dei presenti"
        azioni={
          <button className="btn piccolo" disabled={totNonSegnati > 0} onClick={() => {
            const trasmessi = paz
              .filter((p) => presenti[p.id] === true)
              .map((p) => ({
                id: p.id,
                nome: p.nome,
                stanza: p.stanza,
                tipo_dieta: p.tipo_dieta,
                note: p.note,
                pasto: pasto,
                giorno: GIORNO_DEMO,
                dieta: p.dieta[GIORNO_DEMO]?.[pasto] || {},
              }));
            st.trasmettiPresenze(trasmessi);
            st.avvisa(trasmessi.length + " presenze trasmesse alla cucina MAVI con " + (trasmessi.length * 3) + " etichette");
          }}>
            {totNonSegnati > 0 ? "Segna tutti prima di trasmettere" : "Trasmetti a MAVI"}
          </button>
        }
      />
      <div className="tela">
        <div className="commuta" style={{ marginBottom: 20 }}>
          <button className={pasto === "pranzo" ? "on" : ""} onClick={() => setPasto("pranzo")}>Pranzo</button>
          <button className={pasto === "cena" ? "on" : ""} onClick={() => setPasto("cena")}>Cena</button>
        </div>
        <div className="numeri">
          <div className="numero"><div className="n-lab">Presenti</div><div className="n-val" style={{ color: "#2d6a2d" }}>{totPresenti}</div><div className="n-nota">pasti da preparare</div></div>
          <div className="numero"><div className="n-lab">Assenti</div><div className="n-val" style={{ color: "#8b2020" }}>{totAssenti}</div><div className="n-nota">nessun pasto</div></div>
          <div className="numero"><div className="n-lab">Da segnare</div><div className="n-val">{totNonSegnati}</div><div className="n-nota">non ancora segnati</div></div>
          <div className="numero"><div className="n-lab">Etichette</div><div className="n-val">{totPresenti * 3}</div><div className="n-nota">una per portata</div></div>
        </div>

        {reparto && (
          <div className="banner-dieta" style={{ background: "#eef3fa", borderColor: "#b8cce0", color: "#2c4a6c" }}>
            <Icone.attenzione size={15} />
            Stai vedendo solo i pazienti di <b>{reparto}</b>. Il responsabile vede tutte le strutture.
          </div>
        )}

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Pazienti della struttura</h2>
            <span className="conta-piatti">{totPresenti} presenti, {totAssenti} assenti su {paz.length}</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr>
                  <th>Paziente</th>
                  <th>Stanza</th>
                  <th>Primo</th>
                  <th>Secondo</th>
                  <th>Contorno</th>
                  <th style={{ textAlign: "center" }}>Stato</th>
                </tr>
              </thead>
              <tbody>
                {paz.map((p) => {
                  const dieta = p.dieta[GIORNO_DEMO]?.[pasto];
                  const stato = presenti[p.id]; // null, true, false
                  const cls = stato === true ? "pz-presente" : stato === false ? "pz-assente" : "pz-neutro";
                  return (
                    <tr key={p.id} className={cls}>
                      <td><b>{p.nome}</b></td>
                      <td style={{ fontSize: 13, color: "var(--muto)" }}>{p.stanza}</td>
                      <td>{stato !== false ? <>{splitPiatto(dieta?.primo).nome}{splitPiatto(dieta?.primo).nota && <div className="nota-prep piccola">⚠ {splitPiatto(dieta?.primo).nota}</div>}</> : "—"}</td>
                      <td>{stato !== false ? <>{splitPiatto(dieta?.secondo).nome}{splitPiatto(dieta?.secondo).nota && <div className="nota-prep piccola">⚠ {splitPiatto(dieta?.secondo).nota}</div>}</> : "—"}</td>
                      <td>{stato !== false ? <>{splitPiatto(dieta?.contorno).nome}{splitPiatto(dieta?.contorno).nota && <div className="nota-prep piccola">⚠ {splitPiatto(dieta?.contorno).nota}</div>}</> : "—"}</td>
                      <td style={{ textAlign: "center" }}>
                        <div className="toggle-presenza">
                          <button
                            className={stato === true ? "on-verde" : ""}
                            onClick={() => segnaPresente(p.id)}
                          >✓ Presente</button>
                          <button
                            className={stato === false ? "on-rosso" : ""}
                            onClick={() => segnaAssente(p.id)}
                          >✕ Assente</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Segna ogni paziente come presente o assente. Il pulsante Trasmetti a MAVI si attiva quando tutti sono segnati.
            I pasti dei pazienti assenti non vengono preparati.
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== pagina Etichette ==================== */
function EtichetteComunita() {
  const st = usaStato();
  const [pasto, setPasto] = React.useState("pranzo");

  return (
    <>
      <Intestazione
        occhiello={"Mercoledì 16 settembre 2026, " + pasto}
        titolo="Etichette pasto"
        sotto="Tre etichette per paziente: primo, secondo, contorno. Da stampare su etichetta adesiva"
        extra={
          <div className="commuta" style={{ marginTop: 12 }}>
            <button className={pasto === "pranzo" ? "on" : ""} onClick={() => setPasto("pranzo")}>Pranzo</button>
            <button className={pasto === "cena" ? "on" : ""} onClick={() => setPasto("cena")}>Cena</button>
          </div>
        }
        azioni={
          <button className="btn piccolo" onClick={() => window.print()}>
            <Icone.stampa size={16} /> Stampa tutte
          </button>
        }
      />
      <div className="tela">
        <div className="avviso info">
          <Icone.attenzione size={18} />
          <span>
            Le etichette si generano per i pazienti presenti. Ogni vaschetta ha la sua etichetta
            con il nome del paziente, la portata e gli ingredienti del piatto dalla dieta personale.
          </span>
        </div>

        {PAZIENTI_COMUNITA.map((p) => {
          const dieta = p.dieta[GIORNO_DEMO]?.[pasto];
          if (!dieta || (dieta.primo === "—" && dieta.secondo === "—")) return null;
          return (
            <div key={p.id} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: "var(--inchiostro-2)" }}>
                {p.nome} · {p.stanza}
              </h3>
              <div className="etichette-griglia">
                {["primo", "secondo", "contorno"].map((portata) => (
                  <div className="etichetta" key={portata}>
                    <div className="etichetta-testa">
                      <span className="marchio-t" style={{ fontSize: 14 }}>MAVI</span>
                      <span className="et-data">mer 16 set 2026, {pasto}</span>
                    </div>
                    <div className="etichetta-corpo">
                      <span className="et-struttura">Comunità Il Ponte</span>
                      <b>{p.nome}</b>
                      <span className="et-unita">{p.stanza}</span>
                    </div>
                    <div style={{ padding: "8px 0" }}>
                      <span className="so-lab">{portata}</span>
                      <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600 }}>
                        {dieta[portata]}
                      </p>
                    </div>
                    <div className="etichetta-allergeni">
                      <span className="so-lab">Note</span>
                      <p>{p.note}</p>
                    </div>
                    <div className="etichetta-piede">
                      <span>Riscaldare 800 W, 2 min</span>
                      <span className="et-cod">{p.id}-{portata.slice(0, 3)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---- accordion paziente per resoconto settimanale ---- */
function PazienteAccordion({ paziente, giorni }) {
  const [aperto, setAperto] = React.useState(false);
  const p = paziente;
  return (
    <div style={{ borderBottom: "1px solid var(--linea)" }}>
      <button onClick={() => setAperto(!aperto)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 14,
        padding: "14px 20px", cursor: "pointer", textAlign: "left", background: aperto ? "var(--carta)" : "transparent",
        transition: "background .12s",
      }}>
        <Icone.dx size={13} style={{ transform: aperto ? "rotate(90deg)" : "none", transition: "transform .15s", flexShrink: 0 }} />
        <b style={{ fontSize: 15, fontFamily: "var(--serif)", flex: 1 }}>{p.nome}</b>
        <span style={{ fontSize: 12, color: "var(--muto)" }}>{p.stanza}</span>
        {p.tipo_dieta && p.tipo_dieta !== "Standard" && <span className="tag-dieta terap" style={{ fontSize: 10 }}>{p.tipo_dieta}</span>}
        <span style={{ fontSize: 12, color: "var(--muto)" }}>{giorni.length} giorni</span>
      </button>
      {aperto && (
        <div style={{ padding: "0 20px 16px" }}>
          <div className="menu-sett-grid" style={{ marginTop: 8 }}>
            {giorni.map((g) => {
              const d = p.dieta[g]?.pranzo;
              if (!d) return null;
              return (
                <div className="menu-sett-giorno" key={g} style={{ fontSize: 13 }}>
                  <div className="menu-sett-giorno-testa" style={{ padding: "8px 12px" }}>
                    <h3 style={{ fontSize: 14, textTransform: "capitalize" }}>{g}</h3>
                  </div>
                  {["primo", "secondo", "contorno"].map((portata) => {
                    const val = d[portata] || "—";
                    return (
                      <div key={portata} style={{ padding: "6px 12px", borderBottom: "1px solid var(--linea)" }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--muto)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{portata}</div>
                        <div style={{ fontSize: 13, marginTop: 2 }}>
                          {splitPiatto(val).nome}
                          {splitPiatto(val).nota && <span className="nota-prep piccola"> ⚠ {splitPiatto(val).nota}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== resoconti per il gestore ==================== */
function ResocontiComunita({ reparto }) {
  const st = usaStato();
  const GIORNI_SETT_DEMO = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì"];
  const [vista, setVista] = React.useState("giorno"); // "giorno" o "mese"
  const paz = reparto ? PAZIENTI_COMUNITA.filter((p) => p.stanza === reparto) : PAZIENTI_COMUNITA;
  const trasmesso = paz.some((p) => st.presenzeComunita[p.id] != null) || st.presenzeTrasmesse.some((t) => paz.some((p) => p.id === t.id));

  async function esportaExcel() {
    try {
      const { scaricaExcel } = await import("../excel.js");
      const righe = paz.map((p) => {
        const dieta = p.dieta["mercoledì"]?.pranzo;
        return {
          paziente: p.nome, stanza: p.stanza, tipoDieta: p.tipo_dieta || "Standard",
          primo: splitPiatto(dieta?.primo).nome, secondo: splitPiatto(dieta?.secondo).nome,
          contorno: splitPiatto(dieta?.contorno).nome,
          note: [splitPiatto(dieta?.primo).nota, splitPiatto(dieta?.secondo).nota, splitPiatto(dieta?.contorno).nota].filter(Boolean).join("; ") || "—",
        };
      });
      const sett = [];
      paz.forEach((p) => {
        GIORNI_SETT_DEMO.forEach((g) => {
          const d = p.dieta[g]?.pranzo;
          if (!d || (d.primo === "—" && d.secondo === "—")) return;
          sett.push({ paziente: p.nome, giorno: g, pasto: "pranzo",
            primo: splitPiatto(d?.primo).nome, secondo: splitPiatto(d?.secondo).nome,
            contorno: splitPiatto(d?.contorno).nome });
        });
      });
      const nomeFile = "Resoconto_Comunita_Il_Ponte" + (reparto ? "_" + reparto.replace(/[^a-zA-Z0-9]+/g, "_") : "") + ".xlsx";
      await scaricaExcel(nomeFile, [
        { nome: "Pranzo mercoledì", dati: righe, colonne: [
          { header: "Paziente", key: "paziente", width: 22 },
          { header: "Stanza", key: "stanza", width: 24 },
          { header: "Tipo dieta", key: "tipoDieta", width: 22 },
          { header: "Primo", key: "primo", width: 26 },
          { header: "Secondo", key: "secondo", width: 26 },
          { header: "Contorno", key: "contorno", width: 26 },
          { header: "Note preparazione", key: "note", width: 32 },
        ]},
        { nome: "Settimana completa", dati: sett, colonne: [
          { header: "Paziente", key: "paziente", width: 22 },
          { header: "Giorno", key: "giorno", width: 14 },
          { header: "Pasto", key: "pasto", width: 10 },
          { header: "Primo", key: "primo", width: 26 },
          { header: "Secondo", key: "secondo", width: 26 },
          { header: "Contorno", key: "contorno", width: 26 },
        ]},
      ]);
      st.avvisa("Resoconto Excel scaricato con dettaglio giornaliero e settimanale");
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nell'export Excel, riprova");
    }
  }

  return (
    <>
      <Intestazione
        occhiello={"Mercoledì 16 settembre 2026" + (reparto ? " · " + reparto : "")}
        titolo="Resoconti"
        sotto="Cosa è stato trasmesso alla cucina MAVI, con dettaglio per giorno e per paziente"
        azioni={<>
          <button className="btn linea piccolo" onClick={esportaExcel}><Icone.scarica size={16} /> Excel</button>
          <button className="btn linea piccolo" onClick={() => st.avvisa("Resoconto esportato in PDF")}>
            <Icone.stampa size={16} /> PDF
          </button>
        </>}
      />
      <div className="tela">
        {reparto && (
          <div className="banner-dieta" style={{ background: "#eef3fa", borderColor: "#b8cce0", color: "#2c4a6c", marginBottom: 16 }}>
            <Icone.attenzione size={15} />
            Stai vedendo solo i pazienti di <b>{reparto}</b>. Il responsabile vede tutte le strutture.
          </div>
        )}
        <div className="commuta" style={{ marginBottom: 20 }}>
          <button className={vista === "giorno" ? "on" : ""} onClick={() => setVista("giorno")}>Giorno</button>
          <button className={vista === "mese" ? "on" : ""} onClick={() => setVista("mese")}>Settimana</button>
        </div>
        <div className="numeri">
          <div className="numero"><div className="n-lab">Pazienti</div><div className="n-val">{paz.length}</div><div className="n-nota">{reparto ? "in " + reparto : "in tutta la comunità"}</div></div>
          <div className="numero"><div className="n-lab">Portate totali</div><div className="n-val">{paz.length * 3}</div><div className="n-nota">primo + secondo + contorno</div></div>
          <div className="numero"><div className="n-lab">Diete speciali</div><div className="n-val">{paz.filter(p => p.tipo_dieta && p.tipo_dieta !== "Standard").length}</div><div className="n-nota">con restrizioni</div></div>
          <div className="numero"><div className="n-lab">Stato</div><div className="n-val" style={{ fontSize: 20 }}>{trasmesso ? "Trasmesso" : "Da trasmettere"}</div><div className="n-nota">{trasmesso ? "presenze inviate a MAVI" : "vedi Presenze del giorno"}</div></div>
        </div>

        {vista === "giorno" ? (
          <div className="pannello">
            <div className="pannello-testa">
              <h2>Dettaglio per paziente, pranzo</h2>
              <span className="conta-piatti">trasmesso alla cucina MAVI</span>
            </div>
            <div className="scorri">
              <table className="dati">
                <thead>
                  <tr><th>Paziente</th><th>Tipo dieta</th><th>Primo</th><th>Secondo</th><th>Contorno</th></tr>
                </thead>
                <tbody>
                  {paz.map((p) => {
                    const dieta = p.dieta["mercoledì"]?.pranzo;
                    return (
                      <tr key={p.id}>
                        <td><b>{p.nome}</b><div style={{ fontSize: 11, color: "var(--muto)" }}>{p.stanza}</div></td>
                        <td>{p.tipo_dieta ? <span className="tag-dieta terap">{p.tipo_dieta}</span> : <span className="tag-dieta base">Standard</span>}</td>
                        <td>{splitPiatto(dieta?.primo).nome}{splitPiatto(dieta?.primo).nota && <div className="nota-prep piccola">⚠ {splitPiatto(dieta?.primo).nota}</div>}</td>
                        <td>{splitPiatto(dieta?.secondo).nome}{splitPiatto(dieta?.secondo).nota && <div className="nota-prep piccola">⚠ {splitPiatto(dieta?.secondo).nota}</div>}</td>
                        <td>{splitPiatto(dieta?.contorno).nome}{splitPiatto(dieta?.contorno).nota && <div className="nota-prep piccola">⚠ {splitPiatto(dieta?.contorno).nota}</div>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pannello-piede">
              Il resoconto resta consultabile anche dopo la chiusura. Le etichette adesive
              per le vaschette vengono generate dalla cucina MAVI, non dalla struttura.
            </div>
          </div>
        ) : (
          /* vista settimanale: accordion per paziente */
          <div className="pannello">
            <div className="pannello-testa">
              <h2>Resoconto settimanale</h2>
              <span className="conta-piatti">{paz.length} pazienti · clicca per espandere</span>
            </div>
            {paz.map((p) => (
              <PazienteAccordion key={p.id} paziente={p} giorni={GIORNI_SETT_DEMO} />
            ))}
            <div className="pannello-piede">
              Il resoconto resta consultabile anche dopo la chiusura. Le etichette adesive
              per le vaschette vengono generate dalla cucina MAVI, non dalla struttura.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* Export come oggetto per import singolo */
const Comunita = {
  Pazienti,
  Presenze: PresenzeComunita,
  Etichette: EtichetteComunita,
  Resoconti: ResocontiComunita,
};
export default Comunita;
