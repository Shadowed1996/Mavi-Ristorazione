import React from "react";
import { DIETE_TERAPEUTICHE, FATTURE, MODELLI } from "../data.js";
import { Accesso, Documenti, Icone, Intestazione, Messaggi, Telaio } from "../ui.jsx";
import { usaStato } from "../store.jsx";
import { generaProformaPDF } from "../proforma.js";
import { OrdiniUnita } from "./Modelli.jsx";
import Comunita from "./Comunita.jsx";

/* ============================================================
   Configurazione dei portali per tipo di struttura.
   Stesso impianto, identità e ruoli diversi.
   ============================================================ */
export const STRUTTURE = {
  rsa: {
    committente: "rsa",
    tema: "rsa",
    nome: "RSA Villa Serena",
    titolo: "Portale RSA",
    claim: "Le diete giuste, <em>nel nucleo giusto</em>.",
    punti: [
      "Quantità per nucleo, dieta e consistenza",
      "Consistenze modificate gestite come categoria propria",
      "Nessun dato clinico dell'ospite transita dal portale",
    ],
    ruoli: [
      {
        id: "operatore",
        nome: "Operatore di nucleo",
        cosa: "Dichiara le quantità della giornata per il proprio nucleo, per dieta e consistenza.",
        utente: "op.glicine",
        icona: "gente",
        home: "ordine",
      },
      {
        id: "responsabile",
        nome: "Responsabile di struttura",
        cosa: "Controlla i nuclei, scarica i resoconti mensili e verifica le fatture.",
        utente: "resp.villaserena",
        icona: "grafico",
        home: "cruscotto",
      },
    ],
  },
  comunita: {
    committente: "comunita",
    tema: "comunita",
    nome: "Comunità Il Ponte",
    titolo: "Portale comunità",
    claim: "Poche voci, <em>ordinate in un minuto</em>.",
    punti: [
      "Ordine dichiarato dall'educatore di turno",
      "Menu fisso con poche personalizzazioni",
      "Riepiloghi per casa e per mese",
    ],
    ruoli: [
      {
        id: "operatore",
        nome: "Educatore di turno",
        cosa: "Dichiara i pasti della giornata per la propria casa.",
        utente: "edu.aurora",
        icona: "gente",
        home: "ordine",
      },
      {
        id: "responsabile",
        nome: "Coordinatore",
        cosa: "Vede l'andamento delle case, i resoconti e i documenti del servizio.",
        utente: "coord.ilponte",
        icona: "grafico",
        home: "cruscotto",
      },
    ],
  },
  scuola: {
    committente: "scuola",
    tema: "scuola",
    nome: "Istituto Sant'Anna",
    titolo: "Portale scuola",
    claim: "Si contano i presenti, <em>non si sceglie</em>.",
    punti: [
      "Rilevazione presenze per classe entro le 9:30",
      "Menu vidimato e grammature per fascia d'età",
      "Diete speciali con certificato validato",
    ],
    ruoli: [
      {
        id: "operatore",
        nome: "Insegnante",
        cosa: "Conferma i presenti della propria classe, in trenta secondi dal tablet.",
        utente: "ins.primaria1",
        icona: "gente",
        home: "ordine",
      },
      {
        id: "responsabile",
        nome: "Segreteria",
        cosa: "Controlla le classi, gestisce le diete certificate e i documenti.",
        utente: "segreteria.santanna",
        icona: "grafico",
        home: "cruscotto",
      },
    ],
  },
};

const ICONE = { gente: Icone.gente, grafico: Icone.grafico, piatto: Icone.piatto };

/* ==================== scelta del ruolo ==================== */
export function SceltaRuolo({ cfg, onScegli, onIndietro }) {
  return (
    <div data-area={cfg.tema}>
      <div className="nastro">
        <b>Prototipo dimostrativo.</b> Dati di esempio, nessun salvataggio reale.
      </div>
      <div className="ruoli-pagina">
        <button className="ruoli-indietro" onClick={onIndietro}>
          <Icone.sx size={16} /> Tutti i portali
        </button>
        <div className="ruoli-testa">
          <span className="occhiello">{cfg.nome}</span>
          <h1>{cfg.titolo}</h1>
          <p>Scegli il ruolo con cui accedere.</p>
        </div>
        <div className="ruoli-schede">
          {cfg.ruoli.map((r) => {
            const Ic = ICONE[r.icona] || Icone.gente;
            return (
              <button className="ruolo-scheda" key={r.id} onClick={() => onScegli(r)}>
                <span className="ruolo-icona"><Ic size={22} /></span>
                <h2>{r.nome}</h2>
                <p>{r.cosa}</p>
                <span className="ruolo-entra">Accedi <Icone.dx size={15} /></span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ==================== portale della struttura ==================== */
export default function PortaleStruttura({ tipo, ruoloIniziale, onEsci, utente }) {
  const cfg = STRUTTURE[tipo];
  const st = usaStato();
  const iniziale = ruoloIniziale ? cfg.ruoli.find((r) => r.id === ruoloIniziale) : null;
  const [ruolo, setRuolo] = React.useState(iniziale);
  const [dentro, setDentro] = React.useState(!!iniziale);
  const [pagina, setPagina] = React.useState(iniziale ? iniziale.home : "");

  React.useEffect(() => {
    st.setCommittente(cfg.committente);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  if (!ruolo)
    return <SceltaRuolo cfg={cfg} onIndietro={() => (onEsci ? onEsci() : null)} onScegli={(r) => { setRuolo(r); setPagina(r.home); }} />;

  if (!dentro)
    return (
      <Accesso
        area={cfg.tema}
        titolo={ruolo.nome}
        claim={cfg.claim}
        punti={cfg.punti}
        utente={ruolo.utente}
        password="dimostrazione"
        onEntra={() => setDentro(true)}
        onIndietro={() => (ruoloIniziale ? onEsci && onEsci() : setRuolo(null))}
      />
    );

  const operatore = ruolo.id === "operatore";
  /* il reparto/casa dell'educatore arriva dall'anagrafica di accesso (UTENTI,
     campo reparto): scoping delle pagine paziente per chi non è responsabile.
     Assente per il responsabile e per il flusso di prova senza login reale. */
  const reparto = tipo === "comunita" && operatore ? (utente?.reparto || null) : null;
  const voci = tipo === "comunita"
    ? (operatore
      ? [
          ["pazienti", "Pazienti", Icone.gente],
          ["presenze", "Presenze del giorno", Icone.calendario],
          ["resoconti", "Resoconti", Icone.lista],
          ["documenti", "Documenti", Icone.lista],
        ]
      : [
          ["cruscotto", "Cruscotto", Icone.grafico],
          ["pazienti", "Pazienti", Icone.gente],
          ["presenze", "Presenze del giorno", Icone.calendario],
          ["resoconti", "Resoconti", Icone.lista],
          ["fatture", "Fatture", Icone.fattura],
          ["documenti", "Documenti", Icone.lista],
        ])
    : (operatore
      ? [
          ["ordine", "Ordine del giorno", Icone.gente],
          ["settimana", "Menu della settimana", Icone.calendario],
          ["documenti", "Documenti", Icone.lista],
        ]
      : [
          ["cruscotto", "Cruscotto", Icone.grafico],
          ["ordine", "Ordine del giorno", Icone.gente],
          ["fatture", "Fatture", Icone.fattura],
          ["documenti", "Documenti", Icone.lista],
        ]);

  const nomeVisto = utente?.nome || ruolo.nome;
  const iniziali = utente?.iniziali || nomeVisto.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Telaio
      area={cfg.tema}
      marchio={cfg.titolo}
      ruolo={ruolo.nome}
      utente={{ iniziali, nome: nomeVisto, sotto: cfg.nome }}
      chiaveUtente={utente?.u}
      voci={voci}
      pagina={pagina}
      setPagina={setPagina}
      onEsci={() => (onEsci ? onEsci() : setRuolo(null))}
    >
      {pagina === "ordine" && tipo !== "comunita" && <OrdiniUnita tipo={tipo} utente={utente} />}
      {tipo === "comunita" && pagina === "pazienti" && <Comunita.Pazienti soloLettura={operatore} reparto={reparto} />}
      {tipo === "comunita" && pagina === "presenze" && <Comunita.Presenze reparto={reparto} />}
      {tipo === "comunita" && pagina === "resoconti" && <Comunita.Resoconti reparto={reparto} />}
      {pagina === "cruscotto" && <CruscottoStruttura tipo={tipo} cfg={cfg} />}
      {pagina === "settimana" && <MenuStruttura cfg={cfg} />}
      {pagina === "fatture" && <FattureStruttura cfg={cfg} />}
      {pagina === "documenti" && <Documenti soloPubblici={operatore} />}
      <Messaggi lista={st.messaggi} />
    </Telaio>
  );
}

/* ==================== cruscotto della struttura ==================== */
function CruscottoStruttura({ tipo, cfg }) {
  const st = usaStato();
  const c = st.committenti.find((x) => x.id === cfg.committente);
  const scuola = tipo === "scuola";

  const totali = scuola
    ? {
        pasti: st.presenze.reduce((s, r) => s + r.presenti, 0),
        unita: st.presenze.length,
        speciali: st.presenze.reduce((s, r) => s + r.diete, 0),
        assenti: st.presenze.reduce((s, r) => s + (r.iscritti - r.presenti), 0),
      }
    : (() => {
        const righe = st.unita[tipo] || [];
        const somma = (k) => righe.reduce((s, r) => s + (r[k] || 0), 0);
        return {
          pasti: ["normale", "tritato", "frullato", "iposodica", "diabetica", "senza_glutine"].reduce((s, k) => s + somma(k), 0),
          unita: righe.length,
          speciali: somma("iposodica") + somma("diabetica") + somma("senza_glutine"),
          consistenze: somma("tritato") + somma("frullato"),
        };
      })();

  return (
    <>
      <Intestazione
        occhiello={c.nome}
        titolo="Cruscotto"
        sotto={MODELLI[c.modello].nome + ", situazione della giornata"}
      />
      <div className="tela">
        <div className="numeri">
          <div className="numero"><div className="n-lab">Pasti di oggi</div><div className="n-val">{totali.pasti}</div><div className="n-nota">{c.etichettaUnita.toLowerCase()} serviti, {totali.unita}</div></div>
          <div className="numero"><div className="n-lab">Diete speciali</div><div className="n-val">{totali.speciali}</div><div className="n-nota">{scuola ? "con certificato validato" : "su prescrizione"}</div></div>
          {scuola ? (
            <div className="numero"><div className="n-lab">Assenti</div><div className="n-val">{totali.assenti}</div><div className="n-nota">pasti non prodotti</div></div>
          ) : (
            <div className="numero"><div className="n-lab">Consistenze modificate</div><div className="n-val">{totali.consistenze}</div><div className="n-nota">tritato e frullato</div></div>
          )}
          <div className="numero"><div className="n-lab">Chiusura ordine</div><div className="n-val" style={{ fontSize: 23 }}>{scuola ? "ore 9:30" : "ore 16:00"}</div><div className="n-nota">{scuola ? "dello stesso giorno" : "del giorno precedente"}</div></div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Situazione per {c.etichettaUnita.toLowerCase()}</h2>
            <div className="az">
              <button className="btn linea piccolo" onClick={() => st.avvisa("Resoconto mensile generato")}>Resoconto mensile</button>
              <button className="btn piccolo" onClick={() => st.avvisa("Sollecito inviato ai " + c.etichettaUnita.toLowerCase() + " scoperti")}>Sollecita</button>
            </div>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr>
                  <th>{c.etichettaUnita}</th>
                  <th>Pasti dichiarati</th>
                  <th>{scuola ? "Diete certificate" : "Diete su prescrizione"}</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {scuola
                  ? st.presenze.map((r) => (
                      <tr key={r.unita}>
                        <td><b>{r.unita}</b></td>
                        <td className="quantita">{r.presenti}</td>
                        <td className="cifra">{r.diete}</td>
                        <td><span className="pastiglia p-ok">trasmesso</span></td>
                      </tr>
                    ))
                  : (st.unita[tipo] || []).map((r) => {
                      const tot = ["normale", "tritato", "frullato", "iposodica", "diabetica", "senza_glutine"].reduce((s, k) => s + (r[k] || 0), 0);
                      return (
                        <tr key={r.unita}>
                          <td><b>{r.unita}</b></td>
                          <td className="quantita">{tot}</td>
                          <td className="cifra">{(r.iposodica || 0) + (r.diabetica || 0) + (r.senza_glutine || 0)}</td>
                          <td><span className="pastiglia p-ok">trasmesso</span></td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">{c.nota}</div>
        </div>

        {!scuola && (
          <div className="pannello">
            <div className="pannello-testa"><h2>Diete gestite dalla struttura</h2></div>
            <div className="elenco-voci">
              {DIETE_TERAPEUTICHE.map((d) => (
                <div className="voce-semplice" key={d.id}>
                  <b>{d.nome}</b>
                  <span>origine {d.tipo}</span>
                </div>
              ))}
            </div>
            <div className="pannello-piede">
              La prescrizione resta nella cartella dell'ospite. Il portale conosce solo il numero di
              pasti per tipo di dieta, mai il nominativo associato alla patologia.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ==================== menu della settimana, sola lettura ==================== */
function MenuStruttura({ cfg }) {
  const st = usaStato();
  return (
    <>
      <Intestazione
        occhiello={cfg.nome}
        titolo="Menu della settimana"
        sotto="Composto da MAVI, consultabile e stampabile"
        azioni={<button className="btn linea piccolo" onClick={() => window.print()}><Icone.stampa size={16} /> Stampa</button>}
      />
      <div className="tela">
        <div className="pannello">
          <div className="pannello-testa"><h2>14 · 20 settembre 2026</h2></div>
          <div className="elenco-voci">
            {["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"].map((g, i) => (
              <div className="voce-semplice" key={g}>
                <b>{g}</b>
                <span>
                  {(st.menu.variabili[i].primo || []).length} primi ·{" "}
                  {(st.menu.variabili[i].secondo || []).length} secondi ·{" "}
                  {(st.menu.variabili[i].unico || []).length} piatti unici
                </span>
              </div>
            ))}
          </div>
          <div className="pannello-piede">
            Il menu è composto dalla cucina. La struttura lo consulta ma non lo modifica.
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== fatture della struttura ==================== */
const ETICHETTA_TIPO = { rsa: "RSA", comunita: "Comunità", scuola: "Scuola" };

function FattureStruttura({ cfg }) {
  const st = usaStato();
  return (
    <>
      <Intestazione occhiello={cfg.nome} titolo="Fatture" sotto="Documenti ricevuti e stato dei pagamenti" />
      <div className="tela">
        <div className="pannello">
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Documento</th><th>Periodo</th><th>Pasti</th><th>Importo</th><th>Stato</th><th /></tr></thead>
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
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn linea piccolo" onClick={() => {
                          const c = st.committenti.find((x) => x.id === cfg.committente);
                          generaProformaPDF(
                            [{ nome: cfg.nome, tipo: ETICHETTA_TIPO[cfg.committente] || "Struttura", pasti: f.pasti, mese: f.periodo, prezzo: c?.prezzoUnitario, ivaPercentuale: c?.ivaPercentuale }],
                            7.50,
                            { datiAziendali: st.datiAziendali, avvisa: st.avvisa }
                          );
                        }}>PDF</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Importi di esempio. Il ciclo di fatturazione va definito con MAVI.
          </div>
        </div>
      </div>
    </>
  );
}
