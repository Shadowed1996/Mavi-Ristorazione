import React from "react";
import {
  PAZIENTI_COMUNITA, GIORNI_COMUNITA, GIORNI_SETT, INDICE_DEMO_COMUNITA, PASTI_TIPO, PASTI_VARIAZIONE, PORTATE_DIETA, TIPI_VARIAZIONE,
  daA, dietaEffettiva, etichettaGiorno, giorniAperti as apertiDi, giorniSettimana, presenzaVariata, splitPiatto, pastiDi, portateServite,
  testoVariazioneDieta, testoVariazionePresenza,
} from "../data.js";
import { Icone, Intestazione, Velo } from "../ui.jsx";
import { usaStato } from "../store.jsx";
import { generaResocontoComunitaPDF, generaResocontoCentriPDF } from "../resoconto.js";

/* La giornata in cui la demo segna e trasmette le presenze: il primo giorno
   ancora aperto agli ordini (INDICE_DEMO_COMUNITA, giovedì 17 con "adesso"
   martedì 15 alle 22:56). Chiave delle diete, data ISO ed etichetta. */
const INDICE_GIORNO_DEMO = INDICE_DEMO_COMUNITA;
const GIORNO_DEMO = GIORNI_SETT[INDICE_GIORNO_DEMO];
const DATA_DEMO = GIORNI_COMUNITA[INDICE_GIORNO_DEMO].data;
const ETICHETTA_DEMO = etichettaGiorno(INDICE_GIORNO_DEMO) + " " + DATA_DEMO.slice(0, 4);

/* Avviso sul perimetro di visibilità. Il reparto è il centro della comunità:
   `reparto` null significa tutti i centri, una stringa vuota significa che
   l'utente è limitato al proprio centro ma non gliene è stato assegnato
   nessuno: senza questo avviso vedrebbe solo una pagina vuota, senza capire
   perché. */
function BannerReparto({ reparto, margine }) {
  if (reparto === null || reparto === undefined) return null;
  const stile = margine ? { marginBottom: 16 } : null;
  if (!reparto)
    return (
      <div className="banner-dieta banner-attenzione" style={stile}>
        <Icone.attenzione size={15} />
        <span>
          Al tuo profilo non è assegnato nessun centro, quindi non vedi nessun paziente. Chiedi a MAVI
          di assegnartene uno da <b>Gestione portale, Utenti</b>.
        </span>
      </div>
    );
  return (
    <div className="banner-dieta banner-info" style={stile}>
      <Icone.attenzione size={15} />
      <span>Stai vedendo solo il centro <b>{reparto}</b>, quello assegnato alla tua utenza in Gestione portale.</span>
    </div>
  );
}

/* "15/09 alle 10:15" da una data ISO con ora */
function quandoIt(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
    + " alle " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

/* ==================== pagina Pazienti ==================== */
function Pazienti({ soloLettura, puoDieta, reparto }) {
  const st = usaStato();
  /* reparto null = tutti i reparti; stringa = solo quel reparto; stringa
     vuota = utente limitato al proprio reparto, ma senza reparto assegnato */
  const limitato = reparto !== null && reparto !== undefined;
  const [lista, setLista] = React.useState(() =>
    limitato ? PAZIENTI_COMUNITA.filter((p) => p.stanza === reparto) : PAZIENTI_COMUNITA
  );
  const [scheda, setScheda] = React.useState(null);
  const [modulo, setModulo] = React.useState(null); // null | "nuovo" | paziente per modifica
  const [giornoVista, setGiornoVista] = React.useState("lunedì");
  /* chi è limitato al proprio centro crea e sposta pazienti solo lì */
  const censiti = st.committenti.find((c) => c.id === "comunita")?.unita || [];
  const repartiComunita = limitato ? (reparto ? [reparto] : []) : censiti;

  /* Nuovo paziente ed eliminazione mutano anche l'elenco condiviso
     PAZIENTI_COMUNITA (stessa scorciatoia del catalogo piatti in store.jsx):
     senza questo, un paziente creato qui non comparirebbe in Presenze,
     Resoconti né nelle Etichette del portale MAVI. */
  function salva(dati) {
    if (dati.id) {
      Object.assign(PAZIENTI_COMUNITA.find((p) => p.id === dati.id) || {}, dati);
      setLista((l) => l.map((p) => (p.id === dati.id ? { ...p, ...dati } : p)));
      st.avvisa(dati.nome + " aggiornato");
      st.loggaSessione("Anagrafica paziente modificata", dati.nome + ", " + dati.stanza, "modifica");
    } else {
      const nuovo = { ...dati, id: "p" + Date.now(), dal: "settembre 2026" };
      PAZIENTI_COMUNITA.push(nuovo);
      setLista((l) => [...l, nuovo]);
      st.avvisa(nuovo.nome + " aggiunto all'anagrafica");
      st.loggaSessione("Nuovo paziente accettato", nuovo.nome + ", " + nuovo.stanza, "modifica");
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
        sotto="Anagrafica e dieta settimanale di ogni paziente. La dieta la scrive il dietista, il referente la carica"
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

        <BannerReparto reparto={reparto} />

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
                {pastiDi(p).length === 1 && <span className="tag-pasti">Solo {pastiDi(p)[0]}</span>}
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
          puoDieta={!!puoDieta}
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
  const NOMI_GIORNI = { "lunedì": "Lunedì", "martedì": "Martedì", "mercoledì": "Mercoledì", "giovedì": "Giovedì", "venerdì": "Venerdì", "sabato": "Sabato", "domenica": "Domenica" };
  const pastiPrevisti = pastiDi(paziente);

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
          <span className="tag-pasti">{pastiPrevisti.length === 2 ? "Pranzo e cena" : "Solo " + pastiPrevisti[0]}</span>
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
                {pastiPrevisti.map((pasto) => (
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
                {PASTI_TIPO.filter((p) => !pastiPrevisti.includes(p)).map((pasto) => (
                  <div key={pasto} className="menu-sett-portata pasto-escluso">
                    <div className="menu-sett-portata-lab">{pasto}</div>
                    <div style={{ fontSize: 12 }}>{pasto === "cena" ? "Non prevista" : "Non previsto"} per questo paziente</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="scelta-piede" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        {!soloLettura && <button className="btn linea" style={{ color: "var(--rosso-azione)" }} onClick={onElimina}>Elimina</button>}
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
        <div className="avviso info avviso-attenzione" style={{ margin: "12px 24px" }}>
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
              st.loggaSessione("Dieta caricata da file Excel", paziente.nome + ", settimana da lunedì a domenica, pranzo e cena", "modifica");
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
  const [pasti, setPasti] = React.useState(() => (paziente ? pastiDi(paziente) : [...PASTI_TIPO]));

  const commutaPasto = (p) =>
    setPasti((prec) => (prec.includes(p) ? prec.filter((x) => x !== p) : PASTI_TIPO.filter((x) => x === p || prec.includes(x))));

  function invia(e) {
    e.preventDefault();
    if (!nome.trim() || !stanza || pasti.length === 0) return;
    onSalva({
      ...(paziente || {}),
      nome: nome.trim(),
      stanza,
      note: note.trim(),
      pasti,
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
          <label>Centro</label>
          {opzioni.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "var(--muto)" }}>
              Nessun centro ancora censito. MAVI lo aggiunge da Impostazioni per committente → Comunità Il Ponte.
            </p>
          ) : (
            <select value={stanza} onChange={(e) => setStanza(e.target.value)}>
              {opzioni.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
          )}
          <p style={{ fontSize: 11, color: "var(--muto)", margin: "4px 0 0" }}>
            Il paziente lo vede e lo gestisce il referente di questo centro.
          </p>
        </div>
        <div className="campo">
          <label>Pasti previsti</label>
          <div className="pasti-scelta">
            {PASTI_TIPO.map((p) => (
              <label key={p} className={pasti.includes(p) ? "on" : ""}>
                <input type="checkbox" checked={pasti.includes(p)} onChange={() => commutaPasto(p)} />
                {p === "pranzo" ? "Pranzo" : "Cena"}
              </label>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--muto)", margin: "6px 0 0" }}>
            {pasti.length === 0
              ? "Serve almeno un pasto: il paziente comparirà solo nelle presenze dei pasti selezionati."
              : "Il paziente comparirà solo nelle presenze e nelle etichette dei pasti selezionati."}
          </p>
        </div>
        <div className="campo">
          <label>Note per la cucina</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Allergie, preferenze, consistenza" />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 10 }}>
          <button type="button" className="btn linea" onClick={onChiudi}>Annulla</button>
          <button type="submit" className="btn" disabled={!nome.trim() || !stanza || pasti.length === 0}>
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
  /* pranzo e cena si segnano separatamente: nel pasto scelto compaiono solo i
     pazienti che lo prevedono, e i contatori valgono solo per quel pasto */
  const tuttiPaz = reparto != null ? PAZIENTI_COMUNITA.filter((p) => p.stanza === reparto) : PAZIENTI_COMUNITA;
  const paz = tuttiPaz.filter((p) => pastiDi(p).includes(pasto));

  const puoSegnare = st.puo("presenze.segna");
  const puoTrasmettere = st.puo("presenze.trasmetti");
  const statoDi = (id) => presenti[id]?.[pasto] ?? null;
  const segna = (id, valore) =>
    st.setPresenzeComunita((prec) => ({ ...prec, [id]: { ...(prec[id] || {}), [pasto]: valore } }));
  const totPresenti = paz.filter((p) => statoDi(p.id) === true).length;
  const totAssenti = paz.filter((p) => statoDi(p.id) === false).length;
  const totNonSegnati = paz.filter((p) => statoDi(p.id) == null).length;
  /* la dieta del giorno con applicate le variazioni di dieta inviate */
  const dietaDi = (p) => dietaEffettiva(p, INDICE_GIORNO_DEMO, pasto, st.variazioni);
  const totEtichette = paz
    .filter((p) => statoDi(p.id) === true)
    .reduce((somma, p) => somma + portateServite(dietaDi(p)).length, 0);
  const esclusi = tuttiPaz.length - paz.length;

  return (
    <>
      <Intestazione
        occhiello={ETICHETTA_DEMO + ", " + pasto + (reparto ? " · " + reparto : "")}
        titolo="Presenze del giorno"
        sotto="Segna ogni paziente come presente o assente. La cucina prepara solo i pasti dei presenti"
        azioni={puoTrasmettere && (
          <button className="btn piccolo" disabled={totNonSegnati > 0 || paz.length === 0} onClick={() => {
            const trasmessi = paz
              .filter((p) => statoDi(p.id) === true)
              .map((p) => rigaTrasmessa(p, pasto, dietaDi(p)));
            st.trasmettiPresenze(trasmessi, {
              centri: [...new Set(paz.map((p) => p.stanza).filter(Boolean))], pasto, giorno: GIORNO_DEMO,
            });
            st.avvisa(trasmessi.length + " presenze del " + pasto + " trasmesse alla cucina MAVI con " + totEtichette + " etichette");
          }}>
            {paz.length === 0 ? "Nessun paziente per questo pasto" : totNonSegnati > 0 ? "Segna tutti prima di trasmettere" : "Trasmetti " + pasto + " a MAVI"}
          </button>
        )}
      />
      <div className="tela">
        <div className="commuta" style={{ marginBottom: 20 }}>
          <button className={pasto === "pranzo" ? "on" : ""} onClick={() => setPasto("pranzo")}>Pranzo</button>
          <button className={pasto === "cena" ? "on" : ""} onClick={() => setPasto("cena")}>Cena</button>
        </div>
        <div className="numeri">
          <div className="numero"><div className="n-lab">Presenti</div><div className="n-val n-presenti">{totPresenti}</div><div className="n-nota">{pasto === "pranzo" ? "pranzi" : "cene"} da preparare</div></div>
          <div className="numero"><div className="n-lab">Assenti</div><div className="n-val n-assenti">{totAssenti}</div><div className="n-nota">nessun pasto</div></div>
          <div className="numero"><div className="n-lab">Da segnare</div><div className="n-val">{totNonSegnati}</div><div className="n-nota">non ancora segnati, solo {pasto}</div></div>
          <div className="numero"><div className="n-lab">Etichette</div><div className="n-val">{totEtichette}</div><div className="n-nota">una per portata prevista</div></div>
        </div>

        {esclusi > 0 && (
          <div className="banner-dieta banner-prugna">
            <Icone.attenzione size={15} />
            {esclusi === 1 ? "Un paziente non è" : esclusi + " pazienti non sono"} in elenco: non {esclusi === 1 ? "prevede" : "prevedono"} <b>{pasto === "pranzo" ? "il pranzo" : "la cena"}</b>. I pasti previsti si impostano dall'anagrafica del paziente.
          </div>
        )}

        <BannerReparto reparto={reparto} />

        <div className="pannello">
          <div className="pannello-testa">
            <h2>{reparto != null ? "Pazienti del centro" : "Pazienti di tutti i centri"}, {pasto}</h2>
            <span className="conta-piatti">{totPresenti} presenti, {totAssenti} assenti su {paz.length}</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr>
                  <th>Paziente</th>
                  <th>Centro</th>
                  <th>Primo</th>
                  <th>Secondo</th>
                  <th>Contorno</th>
                  <th style={{ textAlign: "center" }}>Stato</th>
                </tr>
              </thead>
              <tbody>
                {paz.map((p) => {
                  const dieta = dietaDi(p);
                  const stato = statoDi(p.id); // null, true, false
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
                            disabled={!puoSegnare}
                            onClick={() => segna(p.id, true)}
                          >✓ Presente</button>
                          <button
                            className={stato === false ? "on-rosso" : ""}
                            disabled={!puoSegnare}
                            onClick={() => segna(p.id, false)}
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
            Segna ogni paziente come presente o assente. Il pulsante Trasmetti si attiva quando tutti sono segnati
            per questo pasto: pranzo e cena sono indipendenti e si trasmettono separatamente, senza cancellarsi a vicenda.
            I pasti dei pazienti assenti non vengono preparati.
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== pagina Variazioni ==================== */
const NOME_PASTO_VARIAZIONE = Object.fromEntries(PASTI_VARIAZIONE.map((p) => [p.id, p.nome]));
const NOME_TIPO_VARIAZIONE = Object.fromEntries(TIPI_VARIAZIONE.map((t) => [t.id, t.nome]));
/* riga trasmessa a MAVI per un paziente presente: la stessa per Presenze del
   giorno e per una variazione su un pasto già trasmesso */
function rigaTrasmessa(p, pasto, dieta) {
  return { id: p.id, nome: p.nome, stanza: p.stanza, tipo_dieta: p.tipo_dieta, note: p.note, pasto, giorno: GIORNO_DEMO, dieta: dieta || {} };
}
const NOME_STATO_PRESENZA = (v) => (v === true ? "presente" : v === false ? "assente" : "non ancora segnato");

function VariazioniComunita({ reparto }) {
  const st = usaStato();
  const puoInviare = st.puo("variazioni.invia");
  const limitato = reparto !== null && reparto !== undefined;
  const censiti = st.committenti.find((c) => c.id === "comunita")?.unita || [];
  const centri = limitato ? (reparto ? [reparto] : []) : censiti;
  const giorniAperti = apertiDi(GIORNI_COMUNITA);

  const [giorno, setGiorno] = React.useState(() =>
    giorniAperti.some((g) => g.i === INDICE_GIORNO_DEMO) ? INDICE_GIORNO_DEMO : (giorniAperti[0] ? giorniAperti[0].i : 0));
  const [centro, setCentro] = React.useState(centri[0] || "");
  const [pasto, setPasto] = React.useState("pranzo");
  const [tipo, setTipo] = React.useState("dieta");
  const [pazienteId, setPazienteId] = React.useState("");
  const [testo, setTesto] = React.useState("");
  /* scelte in corso sul paziente: presenza per pasto e piatti riscritti */
  const [presenzaScelta, setPresenzaScelta] = React.useState({});
  const [dietaScelta, setDietaScelta] = React.useState({});
  React.useEffect(() => {
    setPresenzaScelta({});
    setDietaScelta({});
  }, [pazienteId, giorno, pasto, tipo, centro]);

  const pazientiCentro = PAZIENTI_COMUNITA.filter((p) => p.stanza === centro);
  const paziente = tipo === "altro" && !pazienteId ? null : pazientiCentro.find((p) => p.id === pazienteId) || null;
  const pastiScelti = pasto === "entrambi" ? PASTI_TIPO : [pasto];
  const elenco = (st.variazioni || [])
    .filter((v) => v.committenteId === "comunita" && (!limitato || v.reparto === reparto))
    .sort((a, b) => String(b.creataIl).localeCompare(String(a.creataIl)));
  const inAttesa = elenco.filter((v) => v.stato !== "presa_in_carico").length;

  /* com'è adesso: nella giornata della demo vale quanto segnato in Presenze del
     giorno, negli altri giorni l'ultima variazione; la dieta è quella del
     giorno con applicata l'ultima variazione di dieta */
  const prevede = (p, ps) => pastiDi(p).includes(ps);
  const presenzaAttuale = (p, ps) => (giorno === INDICE_GIORNO_DEMO
    ? st.presenzeComunita[p.id]?.[ps] ?? null
    : presenzaVariata(st.variazioni, p.id, giorno, ps));
  const dietaAttuale = (p, ps) => dietaEffettiva(p, giorno, ps, st.variazioni) || {};

  const presenzeCambiate = tipo === "presenze" && paziente
    ? Object.fromEntries(pastiScelti
      .filter((ps) => prevede(paziente, ps) && typeof presenzaScelta[ps] === "boolean"
        && presenzaScelta[ps] !== presenzaAttuale(paziente, ps))
      .map((ps) => [ps, presenzaScelta[ps]]))
    : {};
  const dieteCambiate = tipo === "dieta" && paziente
    ? Object.fromEntries(pastiScelti
      .filter((ps) => prevede(paziente, ps))
      .map((ps) => {
        const attuale = dietaAttuale(paziente, ps);
        return [ps, Object.fromEntries(PORTATE_DIETA
          .map((c) => [c.id, String(dietaScelta[ps]?.[c.id] ?? "").trim()])
          .filter(([portata, valore]) => valore && valore !== (attuale[portata] || "")))];
      })
      .filter(([, cambi]) => Object.keys(cambi).length > 0))
    : {};

  const pronto = !!centro && !GIORNI_COMUNITA[giorno]?.chiuso && (
    tipo === "altro" ? !!testo.trim()
      : tipo === "presenze" ? Object.keys(presenzeCambiate).length > 0
        : Object.keys(dieteCambiate).length > 0);

  /* nella giornata della demo la variazione si applica subito: Presenze del
     giorno e, se quel pasto è già partito, la riga arrivata alla cucina */
  const pastoTrasmesso = (p, ps) =>
    st.trasmissioniCentri.some((t) => t.reparto === p.stanza && t.pasto === ps && t.giorno === GIORNO_DEMO)
    || st.presenzeTrasmesse.some((r) => r.stanza === p.stanza && r.pasto === ps && r.giorno === GIORNO_DEMO);

  function applicaPresenze(p, cambi) {
    if (giorno !== INDICE_GIORNO_DEMO) return;
    st.setPresenzeComunita((prec) => ({ ...prec, [p.id]: { ...(prec[p.id] || {}), ...cambi } }));
    Object.entries(cambi).forEach(([ps, presente]) => {
      if (pastoTrasmesso(p, ps)) {
        st.sostituisciRigaTrasmessa(p.id, ps, GIORNO_DEMO, presente ? rigaTrasmessa(p, ps, dietaAttuale(p, ps)) : null);
      }
    });
  }

  function applicaDieta(p, cambi, prima) {
    if (giorno !== INDICE_GIORNO_DEMO) return;
    Object.entries(cambi).forEach(([ps, nuove]) => {
      if (st.presenzeTrasmesse.some((r) => r.id === p.id && r.pasto === ps && r.giorno === GIORNO_DEMO)) {
        st.sostituisciRigaTrasmessa(p.id, ps, GIORNO_DEMO, rigaTrasmessa(p, ps, { ...prima[ps], ...nuove }));
      }
    });
  }

  function invia(e) {
    e.preventDefault();
    if (!pronto) return;
    const base = {
      committenteId: "comunita",
      reparto: centro,
      autore: st.sessione ? st.sessione.nome : undefined,
      ruoloAutore: st.ruoloSessione ? st.ruoloSessione.nome : undefined,
      indiceGiorno: Number(giorno),
      pasto,
      pazienteId: paziente ? paziente.id : null,
      pazienteNome: paziente ? paziente.nome : null,
      tipo,
    };
    let id = null;
    if (tipo === "presenze") {
      const presenzaPrima = Object.fromEntries(Object.keys(presenzeCambiate).map((ps) => [ps, presenzaAttuale(paziente, ps)]));
      id = st.inviaVariazione({
        ...base, presenza: presenzeCambiate, presenzaPrima,
        testo: testoVariazionePresenza(presenzaPrima, presenzeCambiate),
      });
      if (id) applicaPresenze(paziente, presenzeCambiate);
    } else if (tipo === "dieta") {
      const dietaPrima = Object.fromEntries(Object.keys(dieteCambiate).map((ps) => [ps, { ...dietaAttuale(paziente, ps) }]));
      id = st.inviaVariazione({
        ...base, dieta: dieteCambiate, dietaPrima,
        testo: testoVariazioneDieta(dietaPrima, dieteCambiate),
      });
      if (id) applicaDieta(paziente, dieteCambiate, dietaPrima);
    } else {
      id = st.inviaVariazione({ ...base, testo });
    }
    if (id) {
      setTesto("");
      setPresenzaScelta({});
      setDietaScelta({});
    }
  }

  const piccolo = { fontSize: 11.5, color: "var(--muto)", marginTop: 4 };

  return (
    <>
      <Intestazione
        occhiello={"Comunità Il Ponte" + (reparto ? " · " + reparto : "")}
        titolo="Variazioni"
        sotto="Cambi di dieta, ospiti in più o in meno, uscite: quello che la cucina deve sapere oltre alle presenze. Qui vedi anche quando MAVI le prende in carico"
      />
      <div className="tela">
        <BannerReparto reparto={reparto} margine />

        <div className="numeri">
          <div className="numero"><div className="n-lab">In attesa di MAVI</div><div className="n-val">{inAttesa}</div><div className="n-nota">inviate, non ancora prese in carico</div></div>
          <div className="numero"><div className="n-lab">Prese in carico</div><div className="n-val">{elenco.length - inAttesa}</div><div className="n-nota">lette dalla cucina, che ne tiene conto</div></div>
          <div className="numero"><div className="n-lab">Variazioni inviate</div><div className="n-val">{elenco.length}</div><div className="n-nota">{limitato ? "dal tuo centro" : "da tutti i centri"}</div></div>
        </div>

        {puoInviare && centri.length > 0 && (
          <div className="pannello">
            <div className="pannello-testa">
              <h2>Nuova variazione</h2>
              <span className="conta-piatti">arriva subito alla cucina MAVI</span>
            </div>
            <form className="modulo-variazione" onSubmit={invia}>
              <div className="modulo-riga due">
                <div className="campo">
                  <label htmlFor="var-giorno">Giorno</label>
                  <select id="var-giorno" value={giorno} onChange={(e) => setGiorno(Number(e.target.value))} disabled={giorniAperti.length === 0}>
                    {giorniSettimana(GIORNI_COMUNITA).map((g) => (
                      <option key={g.i} value={g.i} disabled={g.chiuso}>
                        {etichettaGiorno(g.i) + (g.chiuso ? " · chiuso" : "")}
                      </option>
                    ))}
                  </select>
                  <p style={piccolo}>
                    {giorniAperti.length === 0
                      ? "Nessun giorno ancora aperto: le variazioni riprendono con la settimana successiva."
                      : "I giorni chiusi non accettano più variazioni: gli ordini sono già in cucina."}
                  </p>
                </div>
                <div className="campo">
                  <label htmlFor="var-centro">Centro</label>
                  <select id="var-centro" value={centro} disabled={limitato}
                    onChange={(e) => { setCentro(e.target.value); setPazienteId(""); }}>
                    {centri.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="modulo-riga due">
                <div className="campo">
                  <label>Tipo</label>
                  <div className="pasti-scelta">
                    {TIPI_VARIAZIONE.map((t) => (
                      <label key={t.id} className={tipo === t.id ? "on" : ""}>
                        <input type="radio" name="var-tipo" checked={tipo === t.id} onChange={() => setTipo(t.id)} />
                        {t.nome}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="campo">
                  <label>Pasto</label>
                  <div className="pasti-scelta">
                    {PASTI_VARIAZIONE.map((p) => (
                      <label key={p.id} className={pasto === p.id ? "on" : ""}>
                        <input type="radio" name="var-pasto" checked={pasto === p.id} onChange={() => setPasto(p.id)} />
                        {p.nome}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modulo-riga due">
                <div className="campo">
                  <label htmlFor="var-paziente">Paziente</label>
                  <select id="var-paziente" value={pazienteId} onChange={(e) => setPazienteId(e.target.value)}>
                    <option value="">{tipo === "altro" ? "Tutto il centro" : "Scegli il paziente"}</option>
                    {pazientiCentro.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                  <p style={piccolo}>
                    {tipo === "altro"
                      ? "Facoltativo: lascia \"Tutto il centro\" per ospiti in più, uscite di gruppo o avvisi generali."
                      : "Presenze e dieta si cambiano per un paziente alla volta."}
                  </p>
                </div>
              </div>

              {tipo !== "altro" && !paziente && (
                <div className="var-vuoto">
                  Scegli il paziente: si apre {tipo === "dieta" ? "la sua dieta" : "la sua presenza"} di {etichettaGiorno(giorno).toLowerCase()}, da cambiare.
                </div>
              )}

              {tipo === "presenze" && paziente && (
                <div className="var-dettaglio">
                  <div className="var-dettaglio-testa">Presenza di {paziente.nome} · {etichettaGiorno(giorno)}</div>
                  {pastiScelti.map((ps) => {
                    const attuale = presenzaAttuale(paziente, ps);
                    const scelta = typeof presenzaScelta[ps] === "boolean" ? presenzaScelta[ps] : attuale;
                    const previsto = prevede(paziente, ps);
                    return (
                      <div className="var-riga" key={ps}>
                        <div>
                          <b>{NOME_PASTO[ps]}</b>
                          <div style={piccolo}>
                            {!previsto ? "Non previsto nella dieta del paziente"
                              : scelta !== attuale ? "Cambia " + daA(NOME_STATO_PRESENZA(attuale), NOME_STATO_PRESENZA(scelta))
                                : "Adesso: " + NOME_STATO_PRESENZA(attuale)}
                          </div>
                        </div>
                        <div className="toggle-presenza">
                          <button type="button" className={scelta === true ? "on-verde" : ""} disabled={!previsto}
                            onClick={() => setPresenzaScelta((s) => ({ ...s, [ps]: true }))}>✓ Presente</button>
                          <button type="button" className={scelta === false ? "on-rosso" : ""} disabled={!previsto}
                            onClick={() => setPresenzaScelta((s) => ({ ...s, [ps]: false }))}>✕ Assente</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {tipo === "dieta" && paziente && (
                <div className="var-dettaglio">
                  <div className="var-dettaglio-testa">Dieta di {paziente.nome} · {etichettaGiorno(giorno)}</div>
                  <p style={{ ...piccolo, marginTop: 0 }}>
                    Riscrivi solo i piatti da cambiare. Vale per questo giorno: la dieta settimanale nella scheda del paziente resta com'è.
                  </p>
                  {pastiScelti.map((ps) => {
                    if (!prevede(paziente, ps)) {
                      return (
                        <div className="var-riga" key={ps}>
                          <b>{NOME_PASTO[ps]}</b>
                          <span style={piccolo}>Non previsto nella dieta del paziente</span>
                        </div>
                      );
                    }
                    const attuale = dietaAttuale(paziente, ps);
                    return (
                      <div className="var-pasto" key={ps}>
                        <b>{NOME_PASTO[ps]}</b>
                        <div className="var-portate">
                          {PORTATE_DIETA.map((c) => {
                            const valore = dietaScelta[ps]?.[c.id] ?? (attuale[c.id] || "");
                            const cambiata = !!valore.trim() && valore.trim() !== (attuale[c.id] || "");
                            return (
                              <div className="campo" key={c.id}>
                                <label htmlFor={"var-" + ps + "-" + c.id}>{c.nome}</label>
                                <input id={"var-" + ps + "-" + c.id} type="text" className={cambiata ? "var-cambiata" : ""} value={valore}
                                  onChange={(e) => setDietaScelta((s) => ({ ...s, [ps]: { ...(s[ps] || {}), [c.id]: e.target.value } }))} />
                                {cambiata && <p style={piccolo}>Era: {splitPiatto(attuale[c.id]).nome}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {tipo === "altro" && (
                <div className="campo">
                  <label htmlFor="var-testo">Variazione</label>
                  <textarea id="var-testo" rows={3} value={testo} onChange={(e) => setTesto(e.target.value)}
                    placeholder="es. Stasera 2 ospiti in più a cena, dieta standard, nessuna allergia" />
                </div>
              )}

              <div className="variazione-piede">
                <span style={{ fontSize: 12, color: "var(--muto)" }}>
                  {tipo === "altro"
                    ? "La cucina la trova in Ordini in arrivo e nella distinta di Produzione del giorno indicato."
                    : "Si applica subito: presenze e quantità della cucina per quel giorno, e la cucina la trova anche in Ordini in arrivo."}
                </span>
                <button type="submit" className="btn" disabled={!pronto}>
                  <Icone.ok size={15} /> Invia a MAVI
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="pannello">
          <div className="pannello-testa">
            <h2>{limitato ? "Variazioni del centro" : "Variazioni di tutti i centri"}</h2>
            <span className="conta-piatti">le più recenti in alto</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr>
                  <th>Per quando</th>
                  {!limitato && <th>Centro</th>}
                  <th>Riguarda</th>
                  <th>Variazione</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {elenco.length === 0 && (
                  <tr><td colSpan={limitato ? 4 : 5} className="riga-vuota">Nessuna variazione inviata.</td></tr>
                )}
                {elenco.map((v) => (
                  <tr key={v.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <b>{etichettaGiorno(v.indiceGiorno)}</b>
                      <div style={piccolo}>{NOME_PASTO_VARIAZIONE[v.pasto] || v.pasto}</div>
                    </td>
                    {!limitato && <td style={{ fontSize: 13 }}>{v.reparto}</td>}
                    <td style={{ minWidth: 140 }}>
                      {v.pazienteNome || "Tutto il centro"}
                      <div style={{ marginTop: 5 }}><span className="tag-pasti">{NOME_TIPO_VARIAZIONE[v.tipo] || v.tipo}</span></div>
                    </td>
                    <td style={{ minWidth: 280 }}>
                      {v.testo}
                      <div style={piccolo}>Inviata il {quandoIt(v.creataIl)} da {v.autore}{v.ruoloAutore ? " (" + v.ruoloAutore.toLowerCase() + ")" : ""}</div>
                    </td>
                    <td>
                      {v.stato === "presa_in_carico" ? (
                        <>
                          <span className="pastiglia p-ok">Presa in carico</span>
                          <div style={piccolo}>il {quandoIt(v.presaInCaricoIl)}{v.presaInCaricoDa ? " da " + v.presaInCaricoDa : ""}</div>
                        </>
                      ) : (
                        <>
                          <span className="pastiglia p-att">Inviata a MAVI</span>
                          <div style={piccolo}>in attesa di presa in carico</div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Le variazioni di presenza e di dieta valgono per quel giorno e pasto: aggiornano le presenze e le
            quantità della cucina, anche se il pasto era già stato trasmesso. La dieta settimanale nella scheda
            del paziente non cambia. Le variazioni Altro sono avvisi che la cucina applica a mano.
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
        occhiello={ETICHETTA_DEMO + ", " + pasto}
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
          if (!pastiDi(p).includes(pasto)) return null;
          const dieta = p.dieta[GIORNO_DEMO]?.[pasto];
          const portate = portateServite(dieta);
          if (!portate.length) return null;
          return (
            <div key={p.id} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: "var(--inchiostro-2)" }}>
                {p.nome} · {p.stanza}
              </h3>
              <div className="etichette-griglia">
                {portate.map((portata) => (
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
  const pastiPrevisti = pastiDi(p);
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
        <span className="tag-pasti">{pastiPrevisti.length === 2 ? "Pranzo e cena" : "Solo " + pastiPrevisti[0]}</span>
        <span style={{ fontSize: 12, color: "var(--muto)" }}>{giorni.length} giorni</span>
      </button>
      {aperto && (
        <div style={{ padding: "0 20px 16px" }}>
          <div className="menu-sett-grid" style={{ marginTop: 8 }}>
            {giorni.map((g) => {
              if (!p.dieta[g]) return null;
              return (
                <div className="menu-sett-giorno" key={g} style={{ fontSize: 13 }}>
                  <div className="menu-sett-giorno-testa" style={{ padding: "8px 12px" }}>
                    <h3 style={{ fontSize: 14, textTransform: "capitalize" }}>{g}</h3>
                  </div>
                  {pastiPrevisti.map((pasto) => {
                    const d = p.dieta[g][pasto];
                    if (!d) return null;
                    return (
                      <div key={pasto} className="menu-sett-portata">
                        <div className="menu-sett-portata-lab">{pasto}</div>
                        {["primo", "secondo", "contorno"].map((portata) => {
                          const val = d[portata] || "—";
                          return (
                            <div key={portata} style={{ padding: "4px 0" }}>
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- una tabella per pasto nella vista giorno dei resoconti ---- */
function TabellaGiornoPasto({ pasto, inviato, pazienti }) {
  return (
    <div className="pannello" style={{ marginBottom: 20 }}>
      <div className="pannello-testa">
        <h2>Dettaglio per paziente, {pasto}</h2>
        <span className="conta-piatti">
          {pazienti.length} {pazienti.length === 1 ? "paziente" : "pazienti"} ·{" "}
          {inviato ? "trasmesso alla cucina MAVI" : "non ancora trasmesso"}
        </span>
      </div>
      <div className="scorri">
        <table className="dati">
          <thead>
            <tr><th>Paziente</th><th>Tipo dieta</th><th>Primo</th><th>Secondo</th><th>Contorno</th></tr>
          </thead>
          <tbody>
            {pazienti.map((p) => {
              const dieta = p.dieta[GIORNO_DEMO]?.[pasto];
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
  );
}

/* ==================== resoconti ==================== */
/* le comunità mangiano tutta la settimana, da lunedì a domenica */
const GIORNI_SETT_DEMO = GIORNI_SETT;

/* Nomi e diete sono dati sanitari: li vede solo chi ha resoconti.nominativi
   (il referente). Il responsabile amministrativo vede i numeri
   dei pasti per centro, che bastano a controllare le fatture. Due componenti
   distinti, così togliere il permesso dalla matrice cambia vista senza
   mescolare gli hook. */
function ResocontiComunita({ reparto }) {
  const st = usaStato();
  return st.puo("resoconti.nominativi")
    ? <ResocontiNominativi reparto={reparto} />
    : <ResocontiCentri reparto={reparto} />;
}

function ResocontiNominativi({ reparto }) {
  const st = usaStato();
  const [vista, setVista] = React.useState("giorno"); // "giorno" o "mese"
  const paz = reparto != null ? PAZIENTI_COMUNITA.filter((p) => p.stanza === reparto) : PAZIENTI_COMUNITA;

  /* lo stato "trasmesso" vale per pasto: il pranzo può essere già partito
     mentre la cena è ancora da segnare */
  const pazientiDelPasto = (pasto) => paz.filter((p) => pastiDi(p).includes(pasto));
  const statoPasto = (pasto) => {
    const elenco = pazientiDelPasto(pasto);
    if (!elenco.length) return null;
    return elenco.some((p) => st.presenzeComunita[p.id]?.[pasto] != null)
      || st.presenzeTrasmesse.some((t) => t.pasto === pasto && elenco.some((p) => p.id === t.id))
      || st.trasmissioniCentri.some((t) => t.pasto === pasto && elenco.some((p) => p.stanza === t.reparto));
  };
  const statiPasto = PASTI_TIPO.map((pasto) => [pasto, statoPasto(pasto)]).filter(([, v]) => v !== null);
  const pastiInviati = statiPasto.filter(([, v]) => v);
  const etichettaStato = statiPasto.length === 0 ? "—"
    : pastiInviati.length === statiPasto.length ? "Trasmesso"
      : pastiInviati.length > 0 ? "Parziale" : "Da trasmettere";
  const notaStato = statiPasto.length === 0 ? "nessun pasto previsto"
    : statiPasto.map(([nome, v]) => nome + ": " + (v ? "inviato" : "da inviare")).join(" · ");
  const portateTotali = paz.reduce((somma, p) =>
    somma + pastiDi(p).reduce((s, pasto) => s + portateServite(p.dieta[GIORNO_DEMO]?.[pasto]).length, 0), 0);

  async function esportaExcel() {
    try {
      const { scaricaExcel } = await import("../excel.js");
      const righe = [];
      paz.forEach((p) => {
        pastiDi(p).forEach((pasto) => {
          const dieta = p.dieta[GIORNO_DEMO]?.[pasto];
          if (!dieta) return;
          righe.push({
            paziente: p.nome, stanza: p.stanza, tipoDieta: p.tipo_dieta || "Standard", pasto,
            primo: splitPiatto(dieta?.primo).nome, secondo: splitPiatto(dieta?.secondo).nome,
            contorno: splitPiatto(dieta?.contorno).nome,
            note: [splitPiatto(dieta?.primo).nota, splitPiatto(dieta?.secondo).nota, splitPiatto(dieta?.contorno).nota].filter(Boolean).join("; ") || "—",
          });
        });
      });
      const sett = [];
      paz.forEach((p) => {
        GIORNI_SETT_DEMO.forEach((g) => {
          pastiDi(p).forEach((pasto) => {
            const d = p.dieta[g]?.[pasto];
            if (!d || !portateServite(d).length) return;
            sett.push({ paziente: p.nome, giorno: g, pasto,
              primo: splitPiatto(d?.primo).nome, secondo: splitPiatto(d?.secondo).nome,
              contorno: splitPiatto(d?.contorno).nome });
          });
        });
      });
      const nomeFile = "Resoconto_Comunita_Il_Ponte" + (reparto ? "_" + reparto.replace(/[^a-zA-Z0-9]+/g, "_") : "") + ".xlsx";
      await scaricaExcel(nomeFile, [
        { nome: GIORNI_COMUNITA[INDICE_GIORNO_DEMO].n, dati: righe, colonne: [
          { header: "Paziente", key: "paziente", width: 22 },
          { header: "Centro", key: "stanza", width: 24 },
          { header: "Tipo dieta", key: "tipoDieta", width: 22 },
          { header: "Pasto", key: "pasto", width: 10 },
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
      ], { datiAziendali: st.datiAziendali });
      st.avvisa("Resoconto Excel scaricato con pranzo e cena, dettaglio giornaliero e settimanale");
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nell'export Excel, riprova");
    }
  }

  /* stesse righe della vista a schermo: una tabella per pasto, con le note di
     preparazione sotto la portata a cui si riferiscono */
  function esportaPDF() {
    try {
      const pasti = statiPasto.map(([pasto]) => ({
        pasto,
        righe: pazientiDelPasto(pasto).map((p) => {
          const dieta = p.dieta[GIORNO_DEMO]?.[pasto];
          return {
            paziente: p.nome,
            reparto: p.stanza,
            tipoDieta: p.tipo_dieta || "Standard",
            primo: splitPiatto(dieta?.primo),
            secondo: splitPiatto(dieta?.secondo),
            contorno: splitPiatto(dieta?.contorno),
          };
        }),
      }));
      generaResocontoComunitaPDF({
        struttura: "Comunità Il Ponte",
        reparto,
        giorno: DATA_DEMO,
        pasti,
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
        occhiello={ETICHETTA_DEMO + (reparto ? " · " + reparto : "")}
        titolo="Resoconti"
        sotto="Cosa è stato trasmesso alla cucina MAVI, con dettaglio per giorno e per paziente"
        azioni={st.puo("resoconti.export") && <>
          <button className="btn linea piccolo" onClick={esportaExcel}><Icone.scarica size={16} /> Excel</button>
          <button className="btn linea piccolo" onClick={esportaPDF}>
            <Icone.stampa size={16} /> PDF
          </button>
        </>}
      />
      <div className="tela">
        <BannerReparto reparto={reparto} margine />
        <div className="commuta" style={{ marginBottom: 20 }}>
          <button className={vista === "giorno" ? "on" : ""} onClick={() => setVista("giorno")}>Giorno</button>
          <button className={vista === "mese" ? "on" : ""} onClick={() => setVista("mese")}>Settimana</button>
        </div>
        <div className="numeri">
          <div className="numero"><div className="n-lab">Pazienti</div><div className="n-val">{paz.length}</div><div className="n-nota">{reparto ? "in " + reparto : "in tutta la comunità"}</div></div>
          <div className="numero"><div className="n-lab">Portate totali</div><div className="n-val">{portateTotali}</div><div className="n-nota">pranzo e cena del giorno</div></div>
          <div className="numero"><div className="n-lab">Diete speciali</div><div className="n-val">{paz.filter(p => p.tipo_dieta && p.tipo_dieta !== "Standard").length}</div><div className="n-nota">con restrizioni</div></div>
          <div className="numero"><div className="n-lab">Stato</div><div className="n-val" style={{ fontSize: 20 }}>{etichettaStato}</div><div className="n-nota">{notaStato}</div></div>
        </div>

        {vista === "giorno" ? (
          <>
            {statiPasto.map(([pasto, inviato]) => (
              <TabellaGiornoPasto
                key={pasto}
                pasto={pasto}
                inviato={inviato}
                pazienti={pazientiDelPasto(pasto)}
              />
            ))}
            {statiPasto.length === 0 && (
              <div className="avviso info">
                <Icone.attenzione size={16} />
                <span>Nessun paziente in elenco per questo giorno.</span>
              </div>
            )}
          </>
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

/* ---- resoconto per centro e per pasto, senza nominativi ---- */
const NOME_PASTO = { pranzo: "Pranzo", cena: "Cena" };
const INDICE_SETT_DEMO = GIORNI_SETT_DEMO.indexOf(GIORNO_DEMO);
const sommaNumeri = (lista) => lista.reduce((s, n) => s + (Number(n) || 0), 0);

function totaleRighe(righe) {
  return {
    previsti: sommaNumeri(righe.map((r) => r.previsti)),
    trasmessi: sommaNumeri(righe.map((r) => r.trasmessi)),
    settimana: GIORNI_SETT_DEMO.map((_, i) => sommaNumeri(righe.map((r) => r.settimana[i]))),
    totaleSettimana: sommaNumeri(righe.map((r) => r.totaleSettimana)),
  };
}

/* Unico punto di calcolo: schermo, Excel e PDF leggono le righe che escono da
   qui, quindi non possono dare numeri diversi.
   Previsti: pazienti del centro che hanno quel pasto fra i pasti previsti e
   almeno una portata nella dieta del giorno (le stesse regole di Presenze).
   Trasmessi: presenti della giornata della demo confermati a MAVI (st.presenzeTrasmesse). */
function contaPastiPerCentro(pazienti, centri, trasmesse) {
  const haPasto = (p, giorno, pasto) =>
    pastiDi(p).includes(pasto) && portateServite(p.dieta?.[giorno]?.[pasto]).length > 0;
  const gruppi = centri.map((centro) => {
    const delCentro = pazienti.filter((p) => p.stanza === centro);
    const ids = new Set(delCentro.map((p) => p.id));
    const righe = PASTI_TIPO.map((pasto) => {
      const settimana = GIORNI_SETT_DEMO.map((g) => delCentro.filter((p) => haPasto(p, g, pasto)).length);
      return {
        pasto,
        previsti: settimana[INDICE_SETT_DEMO],
        trasmessi: trasmesse.filter((t) => t.pasto === pasto && ids.has(t.id) && (t.giorno || GIORNO_DEMO) === GIORNO_DEMO).length,
        settimana,
        totaleSettimana: sommaNumeri(settimana),
      };
    }).filter((r) => r.previsti || r.trasmessi || r.totaleSettimana);
    return { centro, righe, totale: totaleRighe(righe) };
  });
  return { gruppi, totale: totaleRighe(gruppi.flatMap((g) => g.righe)) };
}

/* righe piatte nell'ordine dello schermo: una per centro e pasto, il totale
   del centro quando i centri sono più di uno, il totale in fondo */
function righeResocontoCentri({ gruppi, totale }) {
  const righe = [];
  gruppi.forEach((g) => {
    if (!g.righe.length) {
      righe.push({ tipo: "dettaglio", centro: g.centro, pasto: "Nessun pasto previsto", ...totaleRighe([]) });
      return;
    }
    g.righe.forEach((r) => righe.push({ ...r, tipo: "dettaglio", centro: g.centro, pasto: NOME_PASTO[r.pasto] || r.pasto }));
    if (gruppi.length > 1) righe.push({ tipo: "centro", centro: "Totale " + g.centro, pasto: "", ...g.totale });
  });
  righe.push({ tipo: "totale", centro: "Totale", pasto: gruppi.length > 1 ? "Tutti i centri" : "", ...totale });
  return righe;
}

const intestazioneGiorno = (i) => (GIORNI_COMUNITA[i] ? GIORNI_COMUNITA[i].n.slice(0, 3) + " " + GIORNI_COMUNITA[i].breve : GIORNI_SETT_DEMO[i]);
const PERIODO_SETTIMANA = GIORNI_COMUNITA.length
  ? "dal " + GIORNI_COMUNITA[0].d + " al " + GIORNI_COMUNITA[GIORNI_COMUNITA.length - 1].d + " " + GIORNI_COMUNITA[GIORNI_COMUNITA.length - 1].data.slice(0, 4)
  : "";

function ResocontiCentri({ reparto }) {
  const st = usaStato();
  const [vista, setVista] = React.useState("giorno");
  const limitato = reparto !== null && reparto !== undefined;
  const censiti = st.committenti.find((c) => c.id === "comunita")?.unita || [];
  /* un paziente con un centro non più censito resta nel conteggio, in coda */
  const centri = limitato
    ? (reparto ? [reparto] : [])
    : [...censiti, ...[...new Set(PAZIENTI_COMUNITA.map((p) => p.stanza))].filter((s) => s && !censiti.includes(s))];
  const conteggio = contaPastiPerCentro(PAZIENTI_COMUNITA, centri, st.presenzeTrasmesse);
  const righe = righeResocontoCentri(conteggio);
  const { totale } = conteggio;
  const perPasto = (pasto) => sommaNumeri(conteggio.gruppi.flatMap((g) => g.righe).filter((r) => r.pasto === pasto).map((r) => r.previsti));
  const giornata = etichettaGiorno(INDICE_GIORNO_DEMO);
  const intestazioni = GIORNI_SETT_DEMO.map((_, i) => intestazioneGiorno(i));
  const perimetro = limitato ? (reparto || "Nessun centro assegnato") : "Tutti i centri";

  const numeri = [
    { etichetta: "Centri", valore: centri.length, nota: limitato ? perimetro : "di Comunità Il Ponte" },
    { etichetta: "Pasti previsti, " + giornata.toLowerCase(), valore: totale.previsti, nota: perPasto("pranzo") + " pranzi e " + perPasto("cena") + " cene" },
    { etichetta: "Presenti trasmessi a MAVI", valore: totale.trasmessi, nota: "confermati dai referenti" },
    { etichetta: "Pasti previsti in settimana", valore: totale.totaleSettimana, nota: PERIODO_SETTIMANA },
  ];

  const nomeFile = "Resoconto_pasti_per_centro_Comunita_Il_Ponte" + (reparto ? "_" + reparto.replace(/[^a-zA-Z0-9]+/g, "_") : "") + ".xlsx";

  async function esportaExcel() {
    try {
      const { scaricaExcel } = await import("../excel.js");
      await scaricaExcel(nomeFile, [
        {
          nome: giornata,
          dati: righe.map((r) => ({ centro: r.centro, pasto: r.pasto, previsti: r.previsti, trasmessi: r.trasmessi })),
          colonne: [
            { header: "Centro", key: "centro", width: 32 },
            { header: "Pasto", key: "pasto", width: 22 },
            { header: "Pasti previsti", key: "previsti", width: 16 },
            { header: "Presenti trasmessi a MAVI", key: "trasmessi", width: 26 },
          ],
        },
        {
          nome: "Settimana",
          dati: righe.map((r) => ({
            centro: r.centro, pasto: r.pasto,
            ...Object.fromEntries(r.settimana.map((n, i) => ["g" + i, n])),
            totaleSettimana: r.totaleSettimana,
          })),
          colonne: [
            { header: "Centro", key: "centro", width: 32 },
            { header: "Pasto", key: "pasto", width: 22 },
            ...intestazioni.map((titolo, i) => ({ header: titolo, key: "g" + i, width: 12 })),
            { header: "Totale settimana", key: "totaleSettimana", width: 18 },
          ],
        },
      ], { datiAziendali: st.datiAziendali });
      st.avvisa("Resoconto Excel scaricato: pasti per centro, giornata e settimana");
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nell'export Excel, riprova");
    }
  }

  function esportaPDF() {
    try {
      generaResocontoCentriPDF({
        struttura: "Comunità Il Ponte",
        perimetro,
        giorno: DATA_DEMO,
        periodo: PERIODO_SETTIMANA,
        intestazioni,
        righe,
        numeri: numeri.map(({ etichetta, valore }) => ({ etichetta, valore })),
        datiAziendali: st.datiAziendali,
        avvisa: st.avvisa,
      });
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nella generazione del PDF, riprova");
    }
  }

  const classeRiga = (r) => (r.tipo === "totale" ? "riga-totale" : r.tipo === "centro" ? "riga-subtotale" : undefined);
  const cellaCentro = (r) => (r.tipo === "dettaglio" ? r.centro : <b>{r.centro}</b>);

  return (
    <>
      <Intestazione
        occhiello={giornata + " 2026" + (reparto ? " · " + reparto : "")}
        titolo="Resoconti"
        sotto="Pasti per centro e per pasto, del giorno e della settimana: i numeri per controllare le fatture"
        azioni={st.puo("resoconti.export") && <>
          <button className="btn linea piccolo" onClick={esportaExcel}><Icone.scarica size={16} /> Excel</button>
          <button className="btn linea piccolo" onClick={esportaPDF}><Icone.stampa size={16} /> PDF</button>
        </>}
      />
      <div className="tela">
        <div className="avviso info" style={{ marginBottom: 16 }}>
          <Icone.lucchetto size={18} />
          <span>
            Nomi dei pazienti e diete non compaiono: sono dati sanitari e restano ai referenti.
            Per controllare le fatture bastano i numeri dei pasti.
          </span>
        </div>
        <BannerReparto reparto={reparto} margine />
        <div className="commuta" style={{ marginBottom: 20 }}>
          <button className={vista === "giorno" ? "on" : ""} onClick={() => setVista("giorno")}>Giorno</button>
          <button className={vista === "settimana" ? "on" : ""} onClick={() => setVista("settimana")}>Settimana</button>
        </div>
        <div className="numeri">
          {numeri.map((n) => (
            <div className="numero" key={n.etichetta}>
              <div className="n-lab">{n.etichetta}</div>
              <div className="n-val">{n.valore}</div>
              <div className="n-nota">{n.nota}</div>
            </div>
          ))}
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>{vista === "giorno" ? "Pasti per centro, " + giornata.toLowerCase() : "Pasti previsti per centro, settimana " + PERIODO_SETTIMANA}</h2>
            <span className="conta-piatti">{perimetro}</span>
          </div>
          <div className="scorri">
            <table className="dati resoconto-centri">
              <thead>
                {vista === "giorno" ? (
                  <tr><th>Centro</th><th>Pasto</th><th className="num">Pasti previsti</th><th className="num">Presenti trasmessi a MAVI</th></tr>
                ) : (
                  <tr>
                    <th>Centro</th><th>Pasto</th>
                    {intestazioni.map((t) => <th key={t} className="num">{t}</th>)}
                    <th className="num">Totale settimana</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {righe.map((r, i) => (
                  <tr key={r.tipo + "-" + r.centro + "-" + r.pasto + "-" + i} className={classeRiga(r)}>
                    <td>{cellaCentro(r)}</td>
                    <td>{r.tipo === "totale" ? <b>{r.pasto}</b> : r.pasto}</td>
                    {vista === "giorno" ? (
                      <>
                        <td className="num quantita">{r.previsti}</td>
                        <td className="num quantita">{r.trasmessi}</td>
                      </>
                    ) : (
                      <>
                        {r.settimana.map((n, g) => <td key={g} className="num cifra">{n}</td>)}
                        <td className="num quantita">{r.totaleSettimana}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            {vista === "giorno"
              ? "Pasti previsti: pazienti che hanno quel pasto nella dieta del giorno. Presenti trasmessi: quelli confermati a MAVI dal referente; finché le presenze del centro non sono trasmesse restano a zero. "
              : "Pasti previsti giorno per giorno dalle diete dei pazienti, da lunedì a domenica. "}
            Il PDF e l'Excel riportano le stesse righe, giornata e settimana.
          </div>
        </div>
      </div>
    </>
  );
}

/* Export come oggetto per import singolo */
const Comunita = {
  Pazienti,
  Presenze: PresenzeComunita,
  Variazioni: VariazioniComunita,
  Etichette: EtichetteComunita,
  Resoconti: ResocontiComunita,
};
export default Comunita;
