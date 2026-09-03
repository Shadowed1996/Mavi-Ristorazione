import React from "react";
import {
  COMMITTENTI, CONSISTENZE, DIETE_TERAPEUTICHE, FASCE_SCOLASTICHE, MODELLI,
} from "../data.js";
import { Icone, Intestazione, Velo } from "../ui.jsx";
import { usaStato } from "../store.jsx";

export function committenteAttivo(id) {
  return COMMITTENTI.find((c) => c.id === id) || COMMITTENTI[0];
}

/* selettore del committente, in testa alle pagine del portale cliente */
export function SceltaCommittente() {
  const st = usaStato();
  return (
    <div className="scelta-committente">
      <span className="occhiello">Struttura servita</span>
      <div className="strutture">
        {COMMITTENTI.map((c) => (
          <button
            key={c.id}
            className={"struttura" + (st.committente === c.id ? " on" : "")}
            onClick={() => st.setCommittente(c.id)}
          >
            <b>{c.tipo}</b>
            <span>{c.nome}</span>
            <em>{MODELLI[c.modello].nome}</em>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ==================== ordini per unità, RSA e comunità ==================== */
const COLONNE_UNITA = [
  { campo: "normale", testa: "Normale", nota: "consistenza standard" },
  { campo: "tritato", testa: "Tritato", nota: "masticazione ridotta" },
  { campo: "frullato", testa: "Frullato", nota: "disfagia" },
  { campo: "iposodica", testa: "Iposodica", nota: "prescritta" },
  { campo: "diabetica", testa: "Diabetici", nota: "prescritta" },
  { campo: "senza_glutine", testa: "Senza glutine", nota: "certificata" },
];

export function OrdiniUnita({ tipo, utente }) {
  const st = usaStato();
  const c = committenteAttivo(st.committente);
  const righe = st.unita[tipo] || [];
  const totale = (r) => COLONNE_UNITA.reduce((s, col) => s + (r[col.campo] || 0), 0);
  const totali = COLONNE_UNITA.map((col) => righe.reduce((s, r) => s + (r[col.campo] || 0), 0));
  const complessivo = totali.reduce((a, b) => a + b, 0);

  return (
    <>
      <Intestazione
        occhiello={c.nome}
        titolo="Ordine di giornata"
        sotto="Si dichiarano le quantità per tipo di dieta e di consistenza, non le scelte individuali"
        azioni={
          <>
            <button className="btn linea piccolo" onClick={() => st.avvisa("Ordine di ieri ricopiato")}>
              Ricopia da ieri
            </button>
            <button className="btn piccolo" onClick={() => {
              st.trasmettiOrdine({
                struttura: c.id, strutturaNome: c.nome,
                mittente: (utente && utente.nome) || "Operatore", ruoloMittente: (utente && utente.mansione) || c.etichettaUnita,
                unita: (utente && utente.mansione) || "Nucleo", pasti: complessivo,
                note: righe.reduce((s, r) => s + r.iposodica + r.diabetica + r.senza_glutine + r.tritato + r.frullato, 0) + " diete o consistenze",
              });
            }}>
              Trasmetti al responsabile
            </button>
          </>
        }
      />
      <div className="tela">
        <div className="avviso info" style={{ alignItems: "flex-start" }}>
          <Icone.attenzione size={18} />
          <span>
            Le diete terapeutiche e le consistenze modificate derivano da prescrizione. Il portale
            raccoglie solo il conteggio, la prescrizione resta nella cartella dell'ospite e non
            transita da qui.
          </span>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Quantità per {c.etichettaUnita.toLowerCase()}</h2>
            <span className="conta-piatti">{complessivo} pasti dichiarati</span>
          </div>
          <div className="scorri">
            <table className="dati griglia-unita">
              <thead>
                <tr>
                  <th>{c.etichettaUnita}</th>
                  {COLONNE_UNITA.map((col) => (
                    <th key={col.campo}>
                      {col.testa}
                      <em>{col.nota}</em>
                    </th>
                  ))}
                  <th>Totale</th>
                </tr>
              </thead>
              <tbody>
                {righe.map((r, i) => (
                  <tr key={r.unita}>
                    <td><b>{r.unita}</b></td>
                    {COLONNE_UNITA.map((col) => (
                      <td key={col.campo}>
                        <input
                          className="cella-numero"
                          type="number"
                          min="0"
                          value={r[col.campo] || 0}
                          onChange={(e) => st.cambiaUnita(tipo, i, col.campo, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="quantita">{totale(r)}</td>
                  </tr>
                ))}
                <tr className="riga-totale">
                  <td><b>Totale</b></td>
                  {totali.map((t, i) => (<td key={i} className="quantita">{t}</td>))}
                  <td className="quantita">{complessivo}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Le celle sono modificabili, prova a cambiarne una e guarda i totali. Alla chiusura il
            documento si congela e diventa la distinta di produzione per la cucina.
          </div>
        </div>

        <div className="due-colonne">
          <div className="pannello">
            <div className="pannello-testa"><h2>Consistenze previste</h2></div>
            <div className="elenco-voci">
              {CONSISTENZE.map((x) => (
                <div className="voce-semplice" key={x.id}>
                  <b>{x.nome}</b>
                  <span>{x.nota}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pannello">
            <div className="pannello-testa"><h2>Diete gestite</h2></div>
            <div className="elenco-voci">
              {DIETE_TERAPEUTICHE.map((x) => (
                <div className="voce-semplice" key={x.id}>
                  <b>{x.nome}</b>
                  <span>origine {x.tipo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== presenze, scuole ==================== */
export function Presenze({ utente }) {
  const st = usaStato();
  const c = committenteAttivo(st.committente);
  const presenti = st.presenze.reduce((s, r) => s + r.presenti, 0);
  const iscritti = st.presenze.reduce((s, r) => s + r.iscritti, 0);
  const diete = st.presenze.reduce((s, r) => s + r.diete, 0);

  return (
    <>
      <Intestazione
        occhiello={c.nome}
        titolo="Presenze di giornata"
        sotto="Il menu è fisso e vidimato, si confermano i presenti per classe"
        azioni={
          <>
            <button className="btn linea piccolo" onClick={() => st.avvisa("Presenze del giorno precedente ricopiate")}>
              Ricopia da ieri
            </button>
            <button className="btn piccolo" onClick={() => {
              st.trasmettiOrdine({
                struttura: c.id, strutturaNome: c.nome,
                mittente: (utente && utente.nome) || "Insegnante", ruoloMittente: "Insegnante",
                unita: (utente && utente.mansione) || "Classe", pasti: presenti,
                note: diete + " diete certificate",
              });
            }}>
              Trasmetti al responsabile
            </button>
          </>
        }
      />
      <div className="tela">
        <div className="numeri">
          <div className="numero"><div className="n-lab">Presenti oggi</div><div className="n-val">{presenti}</div><div className="n-nota">su {iscritti} iscritti</div><div className="progresso"><i style={{ width: Math.round((presenti / iscritti) * 100) + "%" }} /></div></div>
          <div className="numero"><div className="n-lab">Diete speciali</div><div className="n-val">{diete}</div><div className="n-nota">con certificato validato</div></div>
          <div className="numero"><div className="n-lab">Fasce servite</div><div className="n-val">2</div><div className="n-nota">infanzia e primaria</div></div>
          <div className="numero"><div className="n-lab">Chiusura</div><div className="n-val" style={{ fontSize: 24 }}>ore 9:30</div><div className="n-nota">dello stesso giorno</div></div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Presenti per classe</h2>
            <span className="conta-piatti">{presenti} pasti da produrre</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr><th>Classe</th><th>Fascia</th><th>Iscritti</th><th>Presenti</th><th>Diete speciali</th><th>Assenti</th></tr>
              </thead>
              <tbody>
                {st.presenze.map((r, i) => (
                  <tr key={r.unita}>
                    <td><b>{r.unita}</b></td>
                    <td>{r.fascia === "infanzia" ? "Infanzia" : "Primaria"}</td>
                    <td className="cifra">{r.iscritti}</td>
                    <td>
                      <input className="cella-numero" type="number" min="0" max={r.iscritti}
                        value={r.presenti} onChange={(e) => st.cambiaPresenze(i, "presenti", e.target.value)} />
                    </td>
                    <td>
                      <input className="cella-numero" type="number" min="0"
                        value={r.diete} onChange={(e) => st.cambiaPresenze(i, "diete", e.target.value)} />
                    </td>
                    <td>
                      {r.iscritti - r.presenti > 0
                        ? <span className="pastiglia p-att">{r.iscritti - r.presenti}</span>
                        : <span className="pastiglia p-ok">nessuno</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            La rilevazione si chiude alle 9:30 dello stesso giorno, perché una classe in gita non
            deve tradursi in venticinque pasti buttati.
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Grammature per fascia d'età</h2>
            <span className="conta-piatti">valori indicativi, da capitolato</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Fascia</th><th>Primo</th><th>Secondo</th><th>Contorno</th><th>Pane</th></tr></thead>
              <tbody>
                {FASCE_SCOLASTICHE.map((f) => (
                  <tr key={f.id}>
                    <td><b>{f.nome}</b></td>
                    <td className="cifra">{f.primo} g</td>
                    <td className="cifra">{f.secondo} g</td>
                    <td className="cifra">{f.contorno} g</td>
                    <td className="cifra">{f.pane} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Le grammature vanno allineate alle tabelle dietetiche approvate dall'ATS di competenza,
            che variano da territorio a territorio.
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== schema dei modelli, portale MAVI ==================== */
export function ModelliServizio() {
  const st = usaStato();
  const [stati, setStati] = React.useState(() => Object.fromEntries(COMMITTENTI.map((c) => [c.id, "attivo"])));
  const [espanso, setEspanso] = React.useState(null);

  const OPERATIVO = {
    azienda: { ordinato: true, ora: "13:42", pasti: 28, cutoff: "14:00 giorno prima", ultimoOrdine: "oggi" },
    comunita: { ordinato: true, ora: "08:31", pasti: 19, cutoff: "16:00 giorno prima", ultimoOrdine: "oggi" },
  };
  const CONTATTI = {
    azienda: { referente: "Roberto Manzi", ruolo: "Ufficio del personale", email: "r.manzi@rossimanifatture.it", tel: "0332 445 122", indirizzo: "Via dell'Industria 42, Varese", piva: "02114560123" },
    comunita: { referente: "Ilaria Gatti", ruolo: "Responsabile struttura", email: "i.gatti@comunitailponte.it", tel: "0362 998 741", indirizzo: "Via Sole Luna 8, Desio (MB)", piva: "03887120968" },
  };

  return (
    <>
      <Intestazione
        occhiello="Gestione servizio"
        titolo="Committenti"
        sotto="Anagrafica e stato operativo delle strutture servite"
        azioni={<button className="btn piccolo" onClick={() => st.avvisa("Nuovo committente: form completo in produzione")}>
          <Icone.piu size={16} /> Nuovo committente
        </button>}
      />
      <div className="tela">
        <div className="numeri">
          <div className="numero"><div className="n-lab">Committenti attivi</div><div className="n-val">{Object.values(stati).filter((s) => s === "attivo").length}</div><div className="n-nota">su {COMMITTENTI.length} censiti</div></div>
          <div className="numero"><div className="n-lab">Pasti oggi</div><div className="n-val">{Object.values(OPERATIVO).reduce((s, o) => s + o.pasti, 0)}</div><div className="n-nota">ordini ricevuti</div></div>
          <div className="numero"><div className="n-lab">Hanno ordinato</div><div className="n-val">{Object.values(OPERATIVO).filter((o) => o.ordinato).length}/{COMMITTENTI.length}</div><div className="n-nota">entro il cutoff</div></div>
          <div className="numero"><div className="n-lab">In ritardo</div><div className="n-val">0</div><div className="n-nota">nessuna criticità</div></div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Stato operativo di oggi</h2>
            <span className="conta-piatti">mercoledì 2 settembre</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Struttura</th><th>Tipo</th><th>Ordine</th><th>Ora</th><th>Pasti</th><th>Cutoff</th><th /></tr></thead>
              <tbody>
                {COMMITTENTI.map((c) => {
                  const op = OPERATIVO[c.id] || {};
                  const attivo = stati[c.id] === "attivo";
                  return (
                    <tr key={c.id} style={{ opacity: attivo ? 1 : 0.5 }}>
                      <td><b>{c.nome}</b></td>
                      <td><span className="pastiglia p-neu">{c.tipo}</span></td>
                      <td>{op.ordinato ? <span className="pastiglia p-ok">ricevuto</span> : <span className="pastiglia p-att">in attesa</span>}</td>
                      <td className="cifra">{op.ora || "—"}</td>
                      <td className="quantita">{op.pasti || 0}</td>
                      <td style={{ fontSize: 12, color: "var(--muto)" }}>{op.cutoff}</td>
                      <td>
                        <button className="btn linea piccolo" onClick={() => setEspanso(espanso === c.id ? null : c.id)}>
                          {espanso === c.id ? "Chiudi" : "Dettagli"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {espanso && (() => {
          const c = COMMITTENTI.find((x) => x.id === espanso);
          const ct = CONTATTI[espanso] || {};
          const attivo = stati[espanso] === "attivo";
          return (
            <div className="pannello">
              <div className="pannello-testa">
                <h2>{c.nome}</h2>
                <span className={"pastiglia " + (attivo ? "p-ok" : "p-neu")} style={{ marginLeft: 10 }}>{attivo ? "attivo" : "sospeso"}</span>
              </div>
              <div style={{ padding: "18px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <div className="so-lab" style={{ marginBottom: 8 }}>Anagrafica</div>
                  <table className="dati" style={{ fontSize: 13 }}>
                    <tbody>
                      <tr><td style={{ color: "var(--muto)", width: 110 }}>Ragione sociale</td><td><b>{c.nome}</b></td></tr>
                      <tr><td style={{ color: "var(--muto)" }}>Indirizzo</td><td>{ct.indirizzo}</td></tr>
                      <tr><td style={{ color: "var(--muto)" }}>P.IVA</td><td className="cifra">{ct.piva}</td></tr>
                      <tr><td style={{ color: "var(--muto)" }}>Referente</td><td>{ct.referente}<div style={{ fontSize: 11, color: "var(--muto)" }}>{ct.ruolo}</div></td></tr>
                      <tr><td style={{ color: "var(--muto)" }}>Email</td><td>{ct.email}</td></tr>
                      <tr><td style={{ color: "var(--muto)" }}>Telefono</td><td className="cifra">{ct.tel}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <div className="so-lab" style={{ marginBottom: 8 }}>Configurazione servizio</div>
                  <table className="dati" style={{ fontSize: 13 }}>
                    <tbody>
                      <tr><td style={{ color: "var(--muto)", width: 110 }}>Modello ordine</td><td>{MODELLI[c.modello].nome}</td></tr>
                      <tr><td style={{ color: "var(--muto)" }}>Chi ordina</td><td>{MODELLI[c.modello].chi}</td></tr>
                      <tr><td style={{ color: "var(--muto)" }}>Chi paga</td><td>{MODELLI[c.modello].paga}</td></tr>
                      <tr><td style={{ color: "var(--muto)" }}>Unità</td><td>{c.unita.length} {c.etichettaUnita.toLowerCase()}</td></tr>
                      <tr><td style={{ color: "var(--muto)" }}>Pasti stimati</td><td className="quantita">{c.pasti}/giorno</td></tr>
                      <tr><td style={{ color: "var(--muto)" }}>Cutoff</td><td>{(OPERATIVO[espanso] || {}).cutoff}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="pannello-piede" style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
                <span style={{ flex: 1 }}>Modifica dati e configurazione dalla scheda completa in produzione.</span>
                <button className="btn linea piccolo" onClick={() => { st.setCommittente(c.id); st.avvisa(c.nome + " impostato come committente attivo"); }}>Imposta attivo</button>
                <button className="btn piccolo" style={attivo ? { color: "#d9534f", background: "transparent", border: "1px solid #d9534f" } : { background: "#5cb85c" }}
                  onClick={() => { setStati((p) => ({ ...p, [c.id]: attivo ? "sospeso" : "attivo" })); st.avvisa(c.nome + (attivo ? " sospeso" : " riattivato")); }}>
                  {attivo ? "Sospendi servizio" : "Riattiva servizio"}
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}

/* ==================== ospiti RSA, ordine per persona ==================== */
import { OSPITI, ospitiDelNucleo, nomeDieta, nomeConsistenza } from "../data.js";

const ETICHETTE_PASTO = { normale: "Normale", tritato: "Tritato", frullato: "Frullato" };

export function OspitiRsa() {
  const st = usaStato();
  const nucleiBase = [...new Set(OSPITI.map((o) => o.nucleo))];
  const nucleiExtra = [...new Set(st.ospitiExtra.map((o) => o.nucleo))];
  const nuclei = [...new Set([...nucleiBase, ...nucleiExtra])];
  const [nucleo, setNucleo] = React.useState(nuclei[0]);
  const [scheda, setScheda] = React.useState(null);
  const [nuovo, setNuovo] = React.useState(false);
  const ospitiBase = ospitiDelNucleo(nucleo);
  const ospitiAgg = st.ospitiExtra.filter((o) => o.nucleo === nucleo);
  const ospiti = [...ospitiBase, ...ospitiAgg];
  const presenti = ospiti.filter((o) => !st.assenti.includes(o.id));

  return (
    <>
      <Intestazione
        occhiello="RSA Villa Serena, dato dimostrativo"
        titolo="Ordine per ospite"
        sotto="Ogni ospite ha la sua scheda. Conferma la presenza e il sistema applica dieta e consistenza."
        azioni={
          <>
            <button className="btn linea piccolo" onClick={() => setNuovo(true)}>
              <Icone.piu size={14} /> Nuovo ospite
            </button>
            <button className="btn linea piccolo" onClick={() => st.avvisa("Presenze di ieri ricopiate")}>Ricopia da ieri</button>
            <button className="btn piccolo" onClick={() => st.avvisa("Ordine per ospite trasmesso a MAVI")}>Trasmetti a MAVI</button>
          </>
        }
      />
      <div className="tela">
        <div className="avviso info" style={{ alignItems: "flex-start" }}>
          <Icone.attenzione size={18} />
          <span>
            Nomi di fantasia, dati dimostrativi. Nel prodotto reale l'anagrafica degli ospiti
            contiene dati sanitari, quindi richiede consenso, cifratura e responsabilità dedicate,
            da definire con la struttura.
          </span>
        </div>

        <div className="giorni-tab">
          {nuclei.map((n) => (
            <button key={n} className={n === nucleo ? "on" : ""} onClick={() => setNucleo(n)}>
              {n}<span>{ospitiDelNucleo(n).length + st.ospitiExtra.filter((o) => o.nucleo === n).length} ospiti</span>
            </button>
          ))}
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>{nucleo}</h2>
            <span className="conta-piatti">{presenti.length} presenti su {ospiti.length}</span>
          </div>
          <div className="ospiti-lista">
            {ospiti.map((o) => {
              const assente = st.assenti.includes(o.id);
              return (
                <div className={"ospite-riga" + (assente ? " assente" : "")} key={o.id}>
                  <button className="ospite-presenza" onClick={() => st.commutaAssente(o.id)}
                    title={assente ? "segna presente" : "segna assente"}>
                    {assente ? <Icone.x size={17} /> : <Icone.ok size={17} />}
                  </button>
                  <button className="ospite-corpo" onClick={() => setScheda(o)}>
                    <span className="ospite-nome">{o.nome}</span>
                    <span className="ospite-meta">
                      <span className="tag-consistenza">{nomeConsistenza(o.consistenza)}</span>
                      {o.diete.map((d) => (<span className="tag-dieta" key={d}>{nomeDieta(d)}</span>))}
                      {!o.diete.length && o.consistenza === "normale" && <span className="tag-neutro">nessuna particolarità</span>}
                    </span>
                  </button>
                  <button className="ospite-scheda" onClick={() => setScheda(o)}>Scheda</button>
                </div>
              );
            })}
          </div>
          <div className="pannello-piede">
            Chi è segnato assente non entra nella produzione del giorno. La scheda del singolo ospite
            raccoglie dieta, consistenza e note, e viaggia con l'etichetta del pasto.
          </div>
        </div>

        <RiepilogoProduzione ospiti={presenti} />
      </div>

      {scheda && <SchedaOspite ospite={scheda} onChiudi={() => setScheda(null)} />}
      {nuovo && (
        <NuovoOspite
          nuclei={nuclei}
          onChiudi={() => setNuovo(false)}
          onSalva={(dati) => {
            st.aggiungiOspite(dati);
            st.avvisa(dati.nome + " aggiunto all'anagrafica del " + dati.nucleo);
            setNuovo(false);
            setNucleo(dati.nucleo);
          }}
        />
      )}
    </>
  );
}

/* riepilogo di cosa la cucina deve produrre per il nucleo */
function RiepilogoProduzione({ ospiti }) {
  const perConsistenza = {};
  const perDieta = {};
  ospiti.forEach((o) => {
    perConsistenza[o.consistenza] = (perConsistenza[o.consistenza] || 0) + 1;
    o.diete.forEach((d) => { perDieta[d] = (perDieta[d] || 0) + 1; });
  });
  return (
    <div className="pannello">
      <div className="pannello-testa"><h2>Cosa produce la cucina, per questo nucleo</h2></div>
      <div className="riepilogo-produzione">
        <div>
          <span className="rp-tit">Per consistenza</span>
          {Object.entries(perConsistenza).map(([k, n]) => (
            <div className="rp-riga" key={k}><b>{nomeConsistenza(k)}</b><span>{n}</span></div>
          ))}
        </div>
        <div>
          <span className="rp-tit">Diete particolari</span>
          {Object.keys(perDieta).length === 0 && <div className="rp-riga"><span>nessuna</span></div>}
          {Object.entries(perDieta).map(([k, n]) => (
            <div className="rp-riga" key={k}><b>{nomeDieta(k)}</b><span>{n}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SchedaOspite({ ospite, onChiudi }) {
  const st = usaStato();
  return (
    <Velo onChiudi={onChiudi}>
      <div className="scheda-ospite-testa">
        <div>
          <div className="occhiello">Scheda ospite, dato dimostrativo</div>
          <h2>{ospite.nome}</h2>
          <p>{ospite.nucleo} · {ospite.eta} anni</p>
        </div>
        <button className="modale-x" onClick={onChiudi} aria-label="chiudi"><Icone.x /></button>
      </div>
      <div className="scheda-ospite-corpo">
        <div className="so-blocco">
          <span className="titoletto">Consistenza del pasto</span>
          <div className="so-scelte">
            {["normale", "tritato", "frullato"].map((c) => (
              <button key={c} className={"so-scelta" + (ospite.consistenza === c ? " on" : "")}
                onClick={() => st.avvisa("Consistenza aggiornata, funzione dimostrativa")}>
                {ETICHETTE_PASTO[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="so-blocco">
          <span className="titoletto">Diete prescritte</span>
          <div className="so-diete">
            {ospite.diete.length === 0 && <span className="tag-neutro">nessuna dieta particolare</span>}
            {ospite.diete.map((d) => (<span className="tag-dieta grande" key={d}>{nomeDieta(d)}</span>))}
          </div>
        </div>

        {ospite.note && (
          <div className="so-blocco">
            <span className="titoletto">Note</span>
            <p className="paragrafo">{ospite.note}</p>
          </div>
        )}

        <div className="so-nota">
          Quando l'operatore conferma la presenza, il sistema costruisce il pasto di
          {" " + ospite.nome} applicando in automatico la consistenza e le diete di questa scheda.
          L'etichetta stampata riporta gli stessi dati, così in cucina e in reparto non ci sono
          ambiguità.
        </div>
      </div>
      <div className="scelta-piede" style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
        <button className="btn linea" onClick={onChiudi}>Chiudi</button>
        <button className="btn pieno" onClick={() => {
          st.aggiungiOspitePresente(ospite);
          st.avvisa(ospite.nome + " aggiunto al pasto di oggi, colonna " + coloriDieta(ospite.dieta));
          onChiudi();
        }}>
          <Icone.piu size={16} /> Aggiungi al pasto di oggi
        </button>
      </div>
    </Velo>
  );
}

function coloriDieta(d) {
  return ({ std: "Normale", iposodica: "Iposodica", ipoproteica: "Iposodica",
           diabetica: "Diabetica", senza_glutine: "Senza glutine" })[d] || "Normale";
}


function NuovoOspite({ onSalva, onChiudi, nuclei }) {
  const [d, setD] = React.useState({
    nome: "", nucleo: nuclei[0] || "Nucleo Glicine", stanza: "",
    dieta: "std", consistenza: "normale", note: "", dal: "settembre 2026",
  });
  const cambia = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const valido = d.nome.trim().length > 3 && d.stanza.trim();
  const dieta = DIETE_TERAPEUTICHE.find((x) => x.id === d.dieta);
  function salva() {
    if (!valido) return;
    onSalva(d);
  }
  return (
    <Velo onChiudi={onChiudi}>
      <div className="scelta-testa">
        <div className="occhiello">Anagrafica ospiti</div>
        <h2>Nuovo ospite</h2>
        <p>La scheda entra subito in anagrafica. I dati sensibili qui inseriti sono dimostrativi.</p>
      </div>
      <div className="modulo-ospite">
        <div className="mo-riga">
          <label className="mo-largo">
            <span className="so-lab">Nome e cognome</span>
            <input type="text" value={d.nome} onChange={(e) => cambia("nome", e.target.value)} placeholder="Es. Maria Rossi" />
          </label>
          <label>
            <span className="so-lab">Stanza</span>
            <input type="text" value={d.stanza} onChange={(e) => cambia("stanza", e.target.value)} placeholder="12" />
          </label>
        </div>
        <div className="mo-riga">
          <label>
            <span className="so-lab">Nucleo</span>
            <select value={d.nucleo} onChange={(e) => cambia("nucleo", e.target.value)}>
              {["Nucleo Glicine", "Nucleo Magnolia", "Nucleo protetto"].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="so-lab">In struttura dal</span>
            <input type="text" value={d.dal} onChange={(e) => cambia("dal", e.target.value)} />
          </label>
        </div>
        <div className="mo-riga">
          <label>
            <span className="so-lab">Dieta prescritta</span>
            <select value={d.dieta} onChange={(e) => cambia("dieta", e.target.value)}>
              {DIETE_TERAPEUTICHE.map((x) => (
                <option key={x.id} value={x.id}>{x.nome}</option>
              ))}
            </select>
            <em>Origine {dieta.tipo}. Le diete terapeutiche richiedono prescrizione medica in cartella.</em>
          </label>
          <label>
            <span className="so-lab">Consistenza</span>
            <select value={d.consistenza} onChange={(e) => cambia("consistenza", e.target.value)}>
              {CONSISTENZE.map((x) => (
                <option key={x.id} value={x.id}>{x.nome}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mo-riga">
          <label className="mo-largo">
            <span className="so-lab">Note per la cucina</span>
            <textarea rows="3" value={d.note} onChange={(e) => cambia("note", e.target.value)}
              placeholder="Preferenze, difficoltà, orari particolari" />
          </label>
        </div>
      </div>
      <div className="scelta-piede" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn linea" onClick={onChiudi}>Annulla</button>
        <button className="btn" disabled={!valido} onClick={salva}>Salva ospite</button>
      </div>
    </Velo>
  );
}
