import React from "react";
import {
  DIETE_TERAPEUTICHE, MODELLI, ordinaProforme, testoCondizioni, totaliProforma,
} from "../data.js";
import {
  Documenti, Icone, Intestazione, Messaggi, NessunPermesso,
  Telaio, usaVociPermesse,
} from "../ui.jsx";
import { usaStato } from "../store.jsx";
import { dataIt } from "../documento.js";
import { generaProformaPDF } from "../proforma.js";
import { generaResocontoUnitaPDF } from "../resoconto.js";
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
      "Un referente per ogni centro: diete, presenze e variazioni",
      "Menu fisso con diete personalizzate per paziente",
      "Resoconti per centro e fatture per il responsabile amministrativo",
    ],
    /* `home` è la pagina di partenza del ruolo, se il ruolo può aprirla */
    ruoli: [
      {
        id: "operatore",
        nome: "Referente del centro",
        cosa: "Gestisce diete e presenze del proprio centro e scrive le variazioni a MAVI.",
        utente: "samuele.ferri",
        icona: "gente",
        home: "pazienti",
      },
      {
        id: "responsabile",
        nome: "Responsabile amministrativo",
        cosa: "Segue fatture e pagamenti di tutti i centri, con i resoconti per controllarle.",
        utente: "ilaria.gatti",
        icona: "grafico",
        home: "fatture",
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
const VOCI_COMUNITA = [
  ["cruscotto", "Cruscotto", Icone.grafico],
  ["pazienti", "Pazienti", Icone.gente],
  ["presenze", "Presenze del giorno", Icone.calendario],
  ["variazioni", "Variazioni", Icone.matita],
  ["resoconti", "Resoconti", Icone.lista],
  ["fatture", "Fatture", Icone.fattura],
  ["documenti", "Documenti", Icone.lista],
];

/* RSA e scuola restano fuori dal flusso attivo: nessun utente ha quelle
   strutture. "Ordine del giorno" e "Menu della settimana" non hanno un
   permesso dedicato, quindi restano sempre visibili per quei due modelli. */
const VOCI_ALTRE = [
  ["cruscotto", "Cruscotto", Icone.grafico],
  ["ordine", "Ordine del giorno", Icone.gente],
  ["settimana", "Menu della settimana", Icone.calendario],
  ["fatture", "Fatture", Icone.fattura],
  ["documenti", "Documenti", Icone.lista],
];

const PERMESSO_PAGINA = {
  cruscotto: "cruscotto.vedi",
  pazienti: "pazienti.vedi",
  presenze: "presenze.vedi",
  variazioni: "variazioni.vedi",
  resoconti: "resoconti.vedi",
  fatture: "fatture.vedi",
  documenti: "documenti.vedi",
};

export default function PortaleStruttura({ tipo, onEsci, utente }) {
  const cfg = STRUTTURE[tipo] || STRUTTURE.comunita;
  const st = usaStato();
  const ruoloCfg = cfg.ruoli.find((r) => utente && r.id === utente.ruolo);
  const [voci, pagina, setPagina] = usaVociPermesse(
    tipo === "comunita" ? VOCI_COMUNITA : VOCI_ALTRE, PERMESSO_PAGINA, ruoloCfg && ruoloCfg.home
  );

  /* un utente di un committente creato in demo non ha una configurazione in
     STRUTTURE: si usa il telaio del tipo, con il suo committente vero */
  const record = st.committenti.find((c) => c.id === (utente && utente.struttura));
  const cfgAttiva = React.useMemo(
    () => (record ? { ...cfg, committente: record.id, nome: record.nome } : cfg),
    [cfg, record]
  );

  React.useEffect(() => {
    st.setCommittente(cfgAttiva.committente);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfgAttiva.committente]);

  /* il reparto è il centro della comunità. null = tutti i centri; stringa =
     solo quel centro; stringa vuota = l'utente è limitato al proprio centro
     ma non gliene è stato assegnato nessuno, quindi non vede niente e lo dice
     a schermo */
  const reparto = st.puo("pazienti.tuttiReparti") ? null : ((utente && utente.reparto) || "");
  const puoAnagrafica = st.puo("pazienti.anagrafica");
  const puoDieta = st.puo("pazienti.dieta");
  const nomeVisto = (utente && utente.nome) || cfgAttiva.nome;
  const iniziali = (utente && utente.iniziali)
    || nomeVisto.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
  const nomeRuolo = (st.ruoloSessione && st.ruoloSessione.nome) || cfgAttiva.titolo;
  /* rimonta le pagine che tengono l'elenco in stato locale quando cambiano
     reparto o permessi: senza, la lista resterebbe quella del primo montaggio */
  const chiaveScope = (reparto === null ? "tutti" : reparto || "senza-reparto")
    + (puoAnagrafica ? "-crud" : "") + (puoDieta ? "-dieta" : "");

  return (
    <Telaio
      area={cfgAttiva.tema}
      marchio={cfgAttiva.titolo}
      ruolo={nomeRuolo}
      utente={{ iniziali, nome: nomeVisto, sotto: cfgAttiva.nome }}
      chiaveUtente={utente && utente.u}
      voci={voci}
      pagina={pagina}
      setPagina={setPagina}
      onEsci={() => (onEsci ? onEsci() : null)}
    >
      {voci.length === 0 && <NessunPermesso onEsci={onEsci} />}
      {pagina === "ordine" && tipo !== "comunita" && <OrdiniUnita tipo={tipo} utente={utente} />}
      {tipo === "comunita" && pagina === "pazienti" && (
        <Comunita.Pazienti key={"paz-" + chiaveScope} soloLettura={!puoAnagrafica} puoDieta={puoDieta} reparto={reparto} />
      )}
      {tipo === "comunita" && pagina === "presenze" && <Comunita.Presenze key={"pre-" + chiaveScope} reparto={reparto} />}
      {tipo === "comunita" && pagina === "variazioni" && <Comunita.Variazioni key={"var-" + chiaveScope} reparto={reparto} />}
      {tipo === "comunita" && pagina === "resoconti" && <Comunita.Resoconti key={"res-" + chiaveScope} reparto={reparto} />}
      {pagina === "cruscotto" && <CruscottoStruttura tipo={tipo} cfg={cfgAttiva} />}
      {pagina === "settimana" && <MenuStruttura cfg={cfgAttiva} />}
      {pagina === "fatture" && <FattureStruttura cfg={cfgAttiva} />}
      {pagina === "documenti" && <Documenti soloPubblici={!st.puo("documenti.riservati")} />}
      <Messaggi lista={st.messaggi} />
    </Telaio>
  );
}

/* ==================== cruscotto della struttura ==================== */
const VOCI_PASTO = ["normale", "tritato", "frullato", "iposodica", "diabetica", "senza_glutine"];

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
          pasti: VOCI_PASTO.reduce((s, k) => s + somma(k), 0),
          unita: righe.length,
          speciali: somma("iposodica") + somma("diabetica") + somma("senza_glutine"),
          consistenze: somma("tritato") + somma("frullato"),
        };
      })();

  const etichettaDiete = scuola ? "Diete certificate" : "Diete su prescrizione";

  /* stesse righe e stessi numeri della tabella qui sotto */
  function esportaResoconto() {
    try {
      const righe = scuola
        ? st.presenze.map((r) => ({ unita: r.unita, pasti: r.presenti, diete: r.diete, stato: "trasmesso" }))
        : (st.unita[tipo] || []).map((r) => ({
            unita: r.unita,
            pasti: VOCI_PASTO.reduce((s, k) => s + (r[k] || 0), 0),
            diete: (r.iposodica || 0) + (r.diabetica || 0) + (r.senza_glutine || 0),
            stato: "trasmesso",
          }));
      generaResocontoUnitaPDF({
        struttura: c.nome,
        modello: MODELLI[c.modello].nome,
        periodo: "Settembre 2026",
        etichettaUnita: c.etichettaUnita,
        etichettaDiete,
        numeri: [
          { etichetta: "Pasti di oggi", valore: totali.pasti },
          { etichetta: "Diete speciali", valore: totali.speciali },
          scuola
            ? { etichetta: "Assenti", valore: totali.assenti }
            : { etichetta: "Consistenze modificate", valore: totali.consistenze },
          { etichetta: "Chiusura ordine", valore: scuola ? "ore 9:30" : "ore 16:00" },
        ],
        righe,
        nota: c.nota,
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
              <button className="btn linea piccolo" onClick={esportaResoconto}>Resoconto mensile</button>
              <button className="btn piccolo" onClick={() => st.avvisa("Sollecito inviato ai " + c.etichettaUnita.toLowerCase() + " scoperti")}>Sollecita</button>
            </div>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr>
                  <th>{c.etichettaUnita}</th>
                  <th>Pasti dichiarati</th>
                  <th>{etichettaDiete}</th>
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
                      const tot = VOCI_PASTO.reduce((s, k) => s + (r[k] || 0), 0);
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

/* le scadenze sono date ISO senza ora: si confrontano a mezzanotte locale */
function giornoLocale(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || ""));
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

const giorniTesto = (n) => n + (n === 1 ? " giorno" : " giorni");

/* situazione di pagamento derivata dallo stato della proforma e dalla
   scadenza: `emessa` diventa da saldare oppure scaduta */
function situazioneProforma(p, oggi) {
  if (p.stato === "pagata") return { classe: "p-ok", etichetta: "Pagata", nota: "" };
  if (p.stato === "annullata") return { classe: "p-neu", etichetta: "Annullata", nota: "non va pagata" };
  const scadenza = giornoLocale(p.scadenza);
  if (!scadenza) return { classe: "p-att", etichetta: "Da saldare", nota: "scadenza non indicata" };
  const giorni = Math.round((scadenza - oggi) / 86400000);
  if (giorni < 0) return { classe: "p-err", etichetta: "Scaduta", nota: "da " + giorniTesto(-giorni), scaduta: true, giorni };
  return { classe: "p-att", etichetta: "Da saldare", nota: giorni === 0 ? "scade oggi" : "scade tra " + giorniTesto(giorni), giorni };
}

function FattureStruttura({ cfg }) {
  const st = usaStato();
  const eur = (n) => "€ " + (Number(n) || 0).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const committente = st.committenti.find((x) => x.id === cfg.committente);
  /* solo le proforma di questa struttura: il portale non deve mai mostrare gli
     importi di un altro committente */
  const elenco = ordinaProforme(st.proforme.filter((p) => p.committenteId === cfg.committente));
  const adesso = new Date();
  const oggi = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate());
  const righe = elenco.map((p) => ({ p, t: totaliProforma(p), s: situazioneProforma(p, oggi) }));
  const somma = (lista) => lista.reduce((tot, r) => tot + r.t.totale, 0);

  const daSaldare = righe.filter((r) => r.p.stato === "emessa");
  const scadute = daSaldare.filter((r) => r.s.scaduta);
  const prossima = daSaldare
    .filter((r) => !r.s.scaduta && r.s.giorni != null)
    .sort((a, b) => a.s.giorni - b.s.giorni)[0];
  const pagate = righe.filter((r) => r.p.stato === "pagata");
  const valide = righe.filter((r) => r.p.stato !== "annullata");

  return (
    <>
      <Intestazione occhiello={cfg.nome} titolo="Fatture" sotto="Quello che c'è da pagare a MAVI: importi da saldare, scadenze e proforma già pagate" />
      <div className="tela">
        <div className="numeri">
          <div className="numero">
            <div className="n-lab">Da saldare</div>
            <div className="n-val" style={{ fontSize: 28 }}>{eur(somma(daSaldare))}</div>
            <div className="n-nota">{daSaldare.length === 0 ? "nessuna proforma da pagare" : daSaldare.length === 1 ? "1 proforma emessa, non ancora pagata" : daSaldare.length + " proforma emesse, non ancora pagate"}</div>
          </div>
          <div className="numero">
            <div className="n-lab">Scaduto</div>
            <div className="n-val" style={{ fontSize: 28, color: scadute.length ? "var(--err)" : undefined }}>{eur(somma(scadute))}</div>
            <div className="n-nota">{scadute.length === 0 ? "nessuna proforma oltre la scadenza" : scadute.length === 1 ? "1 proforma oltre la scadenza" : scadute.length + " proforma oltre la scadenza"}</div>
          </div>
          <div className="numero">
            <div className="n-lab">Prossima scadenza</div>
            <div className="n-val" style={{ fontSize: 28 }}>{prossima ? dataIt(prossima.p.scadenza) : "—"}</div>
            <div className="n-nota">{prossima ? prossima.p.numero + ", " + eur(prossima.t.totale) + ", " + prossima.s.nota : "nessun pagamento in scadenza"}</div>
          </div>
          <div className="numero">
            <div className="n-lab">Pagato</div>
            <div className="n-val" style={{ fontSize: 28, color: pagate.length ? "var(--ok)" : undefined }}>{eur(somma(pagate))}</div>
            <div className="n-nota">{pagate.length === 1 ? "1 proforma saldata" : pagate.length + " proforma saldate"}</div>
          </div>
        </div>

        {scadute.length > 0 && (
          <div className="avviso chiuso" style={{ marginBottom: 20 }}>
            <Icone.attenzione size={18} />
            <span>
              {scadute.length === 1 ? "È scaduta " : "Sono scadute "}
              {scadute.map((r) => r.p.numero + " (" + eur(r.t.totale) + ", scadenza " + dataIt(r.p.scadenza) + ")").join(", ")}:
              {" "}{eur(somma(scadute))} da saldare subito.
            </span>
          </div>
        )}

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Proforma ricevute</h2>
            <span className="conta-piatti">{elenco.length} documenti · {eur(somma(daSaldare))} da saldare</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Documento</th><th>Totale</th><th>Scadenza</th><th>Da pagare</th><th>Situazione</th><th /></tr></thead>
              <tbody>
                {elenco.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muto)", padding: 22 }}>
                    Nessuna proforma ricevuta.
                  </td></tr>
                )}
                {righe.map(({ p, t, s }) => (
                  <tr key={p.id} className={p.stato === "annullata" ? "riga-annullata" : undefined}>
                    <td>
                      <b className="cifra">{p.numero}</b>
                      <div style={{ fontSize: 11.5, color: "var(--muto)" }}>{p.periodo} · emessa il {dataIt(p.dataEmissione)}</div>
                    </td>
                    <td className="cifra">
                      <b>{eur(t.totale)}</b>
                      <div style={{ fontSize: 11.5, color: "var(--muto)" }}>
                        {t.conIva ? "imponibile " + eur(t.imponibile) + " + IVA " + eur(t.iva) : "senza IVA"}
                      </div>
                    </td>
                    <td className="cifra">
                      {dataIt(p.scadenza)}
                      <div style={{ fontSize: 11.5, color: "var(--muto)" }}>{testoCondizioni(p)}</div>
                    </td>
                    <td className="cifra"><b>{p.stato === "emessa" ? eur(t.totale) : "—"}</b></td>
                    <td>
                      <span className={"pastiglia " + s.classe}>{s.etichetta}</span>
                      {s.nota && <div style={{ fontSize: 11.5, color: "var(--muto)", marginTop: 4 }}>{s.nota}</div>}
                    </td>
                    <td>
                      {st.puo("fatture.pdf") && (
                        <button className="btn linea piccolo" onClick={() => {
                          generaProformaPDF(p, { datiAziendali: st.datiAziendali, committente, avvisa: st.avvisa });
                        }}>PDF</button>
                      )}
                    </td>
                  </tr>
                ))}
                {elenco.length > 0 && (
                  <tr className="riga-totale">
                    <td><b>Totale</b><div style={{ fontSize: 11.5, color: "var(--muto)" }}>annullate escluse</div></td>
                    <td className="cifra"><b>{eur(somma(valide))}</b></td>
                    <td />
                    <td className="cifra"><b>{eur(somma(daSaldare))}</b></td>
                    <td colSpan={2} style={{ fontSize: 12, color: "var(--muto)" }}>
                      di cui pagato {eur(somma(pagate))}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Le proforma le emette MAVI, con le condizioni concordate per {cfg.nome}
            {committente ? " (" + testoCondizioni(committente) + ")" : ""}. Non transitano dal Sistema di
            Interscambio: la fattura elettronica arriva dal gestionale contabile.
            {cfg.tema === "comunita" && " Per controllare i pasti fatturati ci sono i Resoconti, divisi per centro."}
          </div>
        </div>
      </div>
    </>
  );
}
