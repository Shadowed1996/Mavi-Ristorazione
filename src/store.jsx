import React from "react";
import {
  PIATTI, GIORNI, GIORNI_COMUNITA, INDICE_DEMO_COMUNITA, MENU_INIZIALE, COMMITTENTI, ORDINI_UNITA, PAZIENTI_COMUNITA,
  ETICHETTE_AZIENDA_DEMO, PROFORME_INIZIALI, RUOLI_INIZIALI, UTENTI, VARIAZIONI_INIZIALI,
  anagraficaAzienda, etichettaGiorno, presenzaVariata, regimeIva, scadenzaPagamento,
} from "./data.js";

const Ctx = React.createContext(null);
export const usaStato = () => React.useContext(Ctx);

let contatore = 0;
/* numerazione delle variazioni: prosegue dal seed (var-1, var-2, ...) */
let contatoreVariazioni = VARIAZIONI_INIZIALI.length;
const PASTI_AMMESSI = ["pranzo", "cena", "entrambi"];
const TIPI_AMMESSI = ["dieta", "presenze", "altro"];

function nowHM() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

/* ordini già inviati oggi, per popolare le pagine di dimostrazione */
const ORDINI_IN_CODA = [
  { id: "o1", struttura: "azienda", strutturaNome: "Rossi Manifatture Spa", mittente: "Roberto Manzi", ruoloMittente: "Referente", unita: "Amministrazione", pasti: 28, note: "3 vegetariani, 2 senza glutine", stato: "approvato", ora: "13:42", oraApprov: "14:05" },
  { id: "o2", struttura: "rsa", strutturaNome: "RSA Villa Serena", mittente: "Marco Pallino", ruoloMittente: "Operatore", unita: "Nucleo Glicine", pasti: 34, note: "6 tritati, 3 frullati, 4 iposodica", stato: "in_attesa", ora: "07:18" },
  { id: "o3", struttura: "rsa", strutturaNome: "RSA Villa Serena", mittente: "Elena Vergani", ruoloMittente: "Operatore", unita: "Nucleo Magnolia", pasti: 27, note: "4 tritati, 2 frullati, 3 iposodica", stato: "approvato", ora: "07:22", oraApprov: "07:45" },
  { id: "o4", struttura: "comunita", strutturaNome: "Comunità Il Ponte", mittente: "Samuele Ferri", ruoloMittente: "Referente", unita: "Spazio Giovani SGA", pasti: 19, note: "1 senza glutine", stato: "in_attesa", ora: "08:31" },
  { id: "o5", struttura: "scuola", strutturaNome: "Istituto Sant'Anna", mittente: "Chiara Beltrami", ruoloMittente: "Insegnante", unita: "Primaria 1", pasti: 24, note: "1 dieta certificata", stato: "approvato", ora: "09:12", oraApprov: "09:18" },
];

/* Documenti già presenti nel prototipo. I file stanno nella cartella documenti. */
const DOCUMENTI_INIZIALI = [
  {
    id: "doc-whp",
    nome: "Codice colori WHP, allegato 1F",
    tipo: "Normativa",
    descrizione: "Regione Lombardia, promozione della salute nei luoghi di lavoro. Come si assegnano i colori ai piatti e come si compone un pasto equilibrato.",
    file: "codice-colori-whp.pdf",
    peso: "1,2 MB",
    data: "Aggiornato ad agosto 2026",
    perDipendenti: true,
  },
  {
    id: "doc-allergeni",
    nome: "Tabella dei quattordici allergeni",
    tipo: "Normativa",
    descrizione: "Elenco degli allergeni previsti dal Regolamento UE 1169/2011, con i codici usati nelle schede piatto.",
    file: "",
    peso: "—",
    data: "Riferimento normativo",
    perDipendenti: true,
  },
  {
    id: "doc-capitolato",
    nome: "Capitolato del servizio mensa",
    tipo: "Contratto",
    descrizione: "Condizioni del servizio, orari di consegna, composizione del pasto e modalità di fatturazione.",
    file: "",
    peso: "—",
    data: "Da caricare",
    perDipendenti: false,
  },
];

/* le proforma si timbrano al giorno, non al millisecondo: la data resta
   confrontabile, stampabile e leggibile così com'è */
function isoGiorno(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

const PREFISSO_PROFORMA = "PRO-2026/";

function prossimoNumero(elenco) {
  const ultimo = elenco.reduce((max, p) => {
    const m = /^PRO-2026\/(\d+)$/.exec(p.numero || "");
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0);
  return PREFISSO_PROFORMA + String(ultimo + 1).padStart(3, "0");
}

/* espande il seed di data.js nella forma completa della proforma, prendendo
   listino e condizioni dal committente: l'importo che il cliente vede in
   elenco è lo stesso che esce nel PDF */
function proformeIniziali() {
  return PROFORME_INIZIALI.map((p, i) => {
    const c = COMMITTENTI.find((x) => x.id === p.committenteId) || {};
    const regime = regimeIva(c.regimeIva);
    return {
      id: "pro" + (i + 1),
      numero: p.numero,
      committenteId: p.committenteId,
      periodo: p.periodo,
      dataEmissione: p.dataEmissione,
      righe: [{ descrizione: "Pasti " + p.periodo, quantita: p.pasti, prezzo: c.prezzoUnitario || 0 }],
      termini: c.termini || "",
      metodoPagamento: c.metodoPagamento || "bonifico",
      regimeIva: regime.id,
      aliquota: regime.conIva ? (c.ivaPercentuale || 0) : 0,
      dicituraIva: regime.conIva ? "" : (c.dicituraIva || regime.dicitura),
      note: "",
      stato: p.stato,
      pagataIl: p.pagataIl || null,
      scadenza: isoGiorno(scadenzaPagamento(p.dataEmissione, c.termini)),
    };
  });
}

export function Provider({ children }) {
  const [ordini, setOrdini] = React.useState({}); // giorno -> { categoria: idPiatto }
  const [confermati, setConfermati] = React.useState({});
  const [messaggi, setMessaggi] = React.useState([]);
  const [menu, setMenu] = React.useState(MENU_INIZIALE);
  const [foto, setFoto] = React.useState({}); // id piatto -> immagine caricata dall'utente
  const [versione, setVersione] = React.useState(0); // sale a ogni modifica del catalogo
  const [documenti, setDocumenti] = React.useState(DOCUMENTI_INIZIALI);
  const [committente, setCommittente] = React.useState(COMMITTENTI[0].id);
  const [committenti, setCommittenti] = React.useState(COMMITTENTI);
  /* proforma emesse, una per committente e per periodo: MAVI le compone a mano
     in Fatturazione, i portali cliente vedono solo le proprie */
  const [proforme, setProforme] = React.useState(proformeIniziali);
  const [profili, setProfili] = React.useState({}); // username -> { nome, email, telefono, password, foto }
  const [unita, setUnita] = React.useState(() => ({
    comunita: (ORDINI_UNITA.comunita || []).map((r) => ({ ...r })),
  }));
  const [presenze, setPresenze] = React.useState([]);
  const [ordiniTrasmessi, setOrdiniTrasmessi] = React.useState(() => ORDINI_IN_CODA);
  const [allergeniUtente, setAllergeniUtente] = React.useState([]);
  const [dietaUtente, setDietaUtente] = React.useState("");  // "", "vegetariano", "vegano"
  const [assenti, setAssenti] = React.useState([]);
  const [ospitiExtra, setOspitiExtra] = React.useState([]);
  const [presenzeTrasmesse, setPresenzeTrasmesse] = React.useState([]);
  const [trasmissioniCentri, setTrasmissioniCentri] = React.useState([]);
  /* variazioni scritte dai referenti e prese in carico da MAVI */
  const [variazioni, setVariazioni] = React.useState(VARIAZIONI_INIZIALI);
  /* quando (data/ora reale) è stato confermato l'ordine di ciascun giorno del
     menu: senza questo, "Ordini in arrivo" non può distinguere "generato il"
     da "per quando", che sono due date diverse (si ordina oggi per un giorno
     futuro della settimana). */
  const [oraConferma, setOraConferma] = React.useState({});
  /* elenco nominativo di chi ha ordinato cosa in azienda: parte dai sette
     ordini demo già presenti in data.js (mai usati altrove) e cresce con le
     conferme reali della demo. Riservato al portale MAVI: serve al fornitore
     per il manifesto di consegna nel cassone termico, mai al cliente. */
  const [nominativiAzienda, setNominativiAzienda] = React.useState(ETICHETTE_AZIENDA_DEMO);
  const [tema, setTemaRaw] = React.useState(() => {
    try { return localStorage.getItem("mavi-tema") || "auto"; } catch { return "auto"; }
  });
  /* dati del mittente, da Gestione portale › Dati aziendali. Le condizioni di
     fatturazione non hanno più un predefinito unico (niente "30 giorni per
     tutti"): si decidono committente per committente */
  const [datiAziendali, setDatiAziendali] = React.useState({
    ragioneSociale: "", indirizzo: "", piva: "", cf: "", telefono: "", email: "", pec: "",
    iban: "", noteProforma: "",
  });
  /* utenti gestiti: stessa anagrafica che alimenta il login (UTENTI è solo il
     seed) e la tabella di Gestione portale › Utenti. `ruolo` è l'id di un
     record di `ruoli`, da cui dipendono voci di menu e azioni visibili. */
  const [utenti, setUtenti] = React.useState(UTENTI);
  const [ruoli, setRuoli] = React.useState(RUOLI_INIZIALI);
  /* la sessione tiene il solo nome utente: l'oggetto si rilegge da `utenti` a
     ogni render, così cambiare ruolo o disattivare qualcuno mentre è dentro
     si applica subito, senza rifare il login */
  const [sessioneU, setSessioneU] = React.useState(null);
  const [notifiche, setNotifiche] = React.useState({
    promemoria: true, cutoff: true, ordineRicevuto: true,
    presenzeMancanti: true, reportMensile: true, emailDigest: false,
  });
  const setTema = React.useCallback((t) => {
    setTemaRaw(t);
    try { localStorage.setItem("mavi-tema", t); } catch {}
  }, []);
  React.useEffect(() => {
    const root = document.documentElement;
    const applica = () => {
      if (tema === "auto") {
        root.setAttribute("data-tema", window.matchMedia("(prefers-color-scheme: dark)").matches ? "scuro" : "chiaro");
      } else { root.setAttribute("data-tema", tema); }
    };
    applica();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", applica);
    return () => mq.removeEventListener("change", applica);
  }, [tema]);
  /* presenza per paziente E per pasto: pranzo e cena sono indipendenti, si
     segnano e si trasmettono separatamente */
  const [presenzeComunita, setPresenzeComunita] = React.useState(() =>
    Object.fromEntries((PAZIENTI_COMUNITA || []).map((p) => [p.id, {
      /* le variazioni di presenza già inviate per la giornata della demo
         partono applicate: la pagina Presenze le mostra già segnate */
      pranzo: presenzaVariata(VARIAZIONI_INIZIALI, p.id, INDICE_DEMO_COMUNITA, "pranzo"),
      cena: presenzaVariata(VARIAZIONI_INIZIALI, p.id, INDICE_DEMO_COMUNITA, "cena"),
    }]))
  );
  const [logOperazioni, setLogOperazioni] = React.useState([
    { id: "s1", ora: "06:00", utente: "Sistema", ruolo: "Automatico", azione: "Backup giornaliero completato", dettaglio: "Database e file multimediali", tipo: "sistema" },
    { id: "s2", ora: "06:02", utente: "Sistema", ruolo: "Automatico", azione: "Menu ciclico: rotazione settimana", dettaglio: "Passaggio a settimana 2 del ciclo autunnale", tipo: "sistema" },
    { id: "l0", ora: "07:18", utente: "Marco Pallino", ruolo: "Operatore RSA", azione: "Ordine trasmesso", dettaglio: "34 pasti, RSA Villa Serena, Nucleo Glicine", tipo: "ordine" },
    { id: "l1", ora: "07:22", utente: "Elena Vergani", ruolo: "Operatore RSA", azione: "Ordine trasmesso", dettaglio: "27 pasti, RSA Villa Serena, Nucleo Magnolia", tipo: "ordine" },
    { id: "l2", ora: "07:45", utente: "Cucina MAVI", ruolo: "Operatore", azione: "Ordine approvato", dettaglio: "RSA Villa Serena, Nucleo Magnolia", tipo: "approvazione" },
    { id: "l3", ora: "08:31", utente: "Samuele Ferri", ruolo: "Referente", azione: "Ordine trasmesso", dettaglio: "19 pasti, Comunità Il Ponte", tipo: "ordine" },
    { id: "s4", ora: "09:00", utente: "Sistema", ruolo: "Automatico", azione: "Promemoria prenotazione inviato", dettaglio: "3 dipendenti Rossi Manifatture non hanno prenotato", tipo: "sistema" },
    { id: "l4", ora: "09:12", utente: "Chiara Beltrami", ruolo: "Insegnante", azione: "Ordine trasmesso", dettaglio: "24 pasti, Istituto Sant'Anna", tipo: "ordine" },
    { id: "l5", ora: "09:18", utente: "Cucina MAVI", ruolo: "Operatore", azione: "Ordine approvato", dettaglio: "Istituto Sant'Anna", tipo: "approvazione" },
    { id: "s5", ora: "12:00", utente: "Sistema", ruolo: "Automatico", azione: "Distinta di produzione generata", dettaglio: "42 pasti azienda + 19 pasti comunità", tipo: "sistema" },
    { id: "l6", ora: "13:42", utente: "Roberto Manzi", ruolo: "Referente", azione: "Ordine trasmesso", dettaglio: "28 pasti, Rossi Manifatture Spa", tipo: "ordine" },
    { id: "l7", ora: "14:05", utente: "Cucina MAVI", ruolo: "Operatore", azione: "Ordine approvato", dettaglio: "Rossi Manifatture Spa", tipo: "approvazione" },
    { id: "s6", ora: "14:30", utente: "Sistema", ruolo: "Automatico", azione: "Etichette generate", dettaglio: "61 etichette per azienda + comunità", tipo: "sistema" },
    { id: "s7", ora: "15:00", utente: "Sistema", ruolo: "Automatico", azione: "Giri di consegna calcolati", dettaglio: "2 giri, 5 tappe totali", tipo: "sistema" },
  ]);

  const logga = React.useCallback((utente, ruolo, azione, dettaglio, tipo = "generico") => {
    const id = "l" + Date.now();
    setLogOperazioni((p) => [{ id, ora: nowHM(), utente, ruolo, azione, dettaglio, tipo }, ...p]);
  }, []);

  /* ---------- sessione e permessi ---------- */
  const sessione = React.useMemo(
    () => (sessioneU ? utenti.find((x) => x.u === sessioneU && x.attivo !== false) || null : null),
    [sessioneU, utenti]
  );
  const ruoloSessione = React.useMemo(
    () => (sessione ? ruoli.find((r) => r.id === sessione.ruolo) || null : null),
    [sessione, ruoli]
  );
  const permessiSessione = React.useMemo(
    () => new Set(ruoloSessione ? ruoloSessione.permessi : []),
    [ruoloSessione]
  );
  const puo = React.useCallback((chiave) => !!chiave && permessiSessione.has(chiave), [permessiSessione]);

  const entra = React.useCallback((utente) => {
    setSessioneU(utente.u);
    if (utente.struttura !== "mavi") setCommittente(utente.struttura);
  }, []);
  const esci = React.useCallback(() => setSessioneU(null), []);

  /* riga di log attribuita a chi sta davvero usando il portale, invece del
     nome cablato che c'era prima in ogni chiamata */
  const loggaSessione = React.useCallback((azione, dettaglio, tipo = "generico") => {
    const nome = sessione ? sessione.nome : "Sistema";
    const ruolo = ruoloSessione ? ruoloSessione.nome : (sessione ? sessione.mansione || "—" : "Automatico");
    logga(nome, ruolo, azione, dettaglio, tipo);
  }, [sessione, ruoloSessione, logga]);

  /* aggiorna per id E pasto invece di sovrascrivere: un utente limitato a un
     centro trasmette solo quello, gli altri centri arrivano più tardi, e la
     cena non deve far perdere il pranzo già trasmesso.
     `ambito` ({ centri, pasto, giorno }) dice cosa copre la trasmissione: le
     righe già trasmesse di quei centri per quel pasto vengono sostituite, così
     un paziente passato da presente ad assente sparisce dalla distinta, e ogni
     centro resta registrato in `trasmissioniCentri` anche con zero presenti
     (altrimenti la cucina tornerebbe alla stima dei pazienti). */
  const trasmettiPresenze = React.useCallback((lista, ambito = {}) => {
    const generatoIl = new Date().toISOString();
    const listaTimbrata = lista.map((r) => ({ ...r, generatoIl }));
    const { centri = [], pasto = null, giorno = null } = ambito;
    const coperta = (r) => lista.some((n) => n.id === r.id && n.pasto === r.pasto)
      || (pasto != null && r.pasto === pasto && (giorno == null || r.giorno === giorno) && centri.includes(r.stanza));
    setPresenzeTrasmesse((prec) => [...prec.filter((r) => !coperta(r)), ...listaTimbrata]);
    if (pasto != null && centri.length) {
      setTrasmissioniCentri((prec) => [
        ...prec.filter((t) => !(t.pasto === pasto && t.giorno === giorno && centri.includes(t.reparto))),
        ...centri.map((reparto) => ({
          reparto, pasto, giorno, generatoIl, presenti: lista.filter((r) => r.stanza === reparto).length,
        })),
      ]);
    }
    const pasti = [...new Set(lista.map((r) => r.pasto).concat(pasto).filter(Boolean))];
    const dettaglio = lista.length + " pazienti presenti" + (pasti.length ? ", " + pasti.join(" e ") : "")
      + (centri.length ? " · " + centri.join(", ") : "");
    loggaSessione("Presenze trasmesse", dettaglio, "presenze");
  }, [loggaSessione]);

  const commutaAssente = React.useCallback((id) => {
    setAssenti((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }, []);
  const aggiungiOspite = React.useCallback((ospite) => {
    const id = "n" + Date.now();
    setOspitiExtra((p) => [...p, { ...ospite, id }]);
    return id;
  }, []);

  /* anagrafica dei committenti: creazione e modifica. È lo stesso record che
     alimenta Committenti, Impostazioni, Produzione e Fatturazione, quindi un
     committente nuovo compare ovunque senza bisogno di elenchi paralleli. */
  const aggiungiCommittente = React.useCallback((dati) => {
    const id = (dati.tipo === "Comunità" ? "com" : "az") + Date.now();
    const base = {
      attivo: true, unita: [], frutta: false, monoporzione: false,
      cf: "", pec: "", codiceSdi: "",
      termini: "", metodoPagamento: "bonifico", regimeIva: "ordinaria", dicituraIva: "",
    };
    setCommittenti((p) => [...p, { ...base, ...dati, id }]);
    loggaSessione("Nuovo committente creato", dati.nome + " (" + dati.tipo + ")", "modifica");
    return id;
  }, [loggaSessione]);
  const aggiornaCommittente = React.useCallback((id, patch) => {
    setCommittenti((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  /* profilo personale dell'utente: dati modificabili dall'interessato,
     indicizzati per username. Sovrascrivono i dati di UTENTI solo per la
     visualizzazione, in aggiunta e non al posto dell'anagrafica del cliente. */
  const aggiornaProfilo = React.useCallback((chiave, patch) => {
    setProfili((p) => ({ ...p, [chiave]: { ...(p[chiave] || {}), ...patch } }));
  }, []);

  const avvisa = React.useCallback((testo) => {
    const id = ++contatore;
    setMessaggi((m) => [...m, { id, testo }]);
    setTimeout(() => setMessaggi((m) => m.filter((x) => x.id !== id)), 3200);
  }, []);

  /* ---------- variazioni dai centri della comunità ---------- */

  /* dal referente a MAVI. Restituisce l'id, oppure null se manca il
     testo. L'id si genera fuori dall'aggiornamento di stato, che in
     StrictMode può essere eseguito due volte. Presenze e dieta portano i dati
     strutturati (`presenza`/`presenzaPrima`, `dieta`/`dietaPrima`, vedi
     VARIAZIONI_INIZIALI) e valgono solo per un paziente. */
  const inviaVariazione = React.useCallback((dati = {}) => {
    const testo = String(dati.testo || "").trim();
    if (!testo) {
      avvisa("Scrivi il testo della variazione prima di inviarla");
      return null;
    }
    if (GIORNI_COMUNITA[Number(dati.indiceGiorno)]?.chiuso) {
      avvisa("Gli ordini di questo giorno sono chiusi, la variazione non si può più inviare");
      return null;
    }
    const tipo = TIPI_AMMESSI.includes(dati.tipo) ? dati.tipo : "altro";
    if (tipo !== "altro" && !dati.pazienteId) {
      avvisa("Scegli il paziente della variazione");
      return null;
    }
    const id = "var-" + (++contatoreVariazioni);
    const indice = Number(dati.indiceGiorno);
    const record = {
      id,
      committenteId: dati.committenteId || "comunita",
      reparto: String(dati.reparto || ""),
      autore: dati.autore || (sessione ? sessione.nome : "—"),
      ruoloAutore: dati.ruoloAutore || (ruoloSessione ? ruoloSessione.nome : ""),
      indiceGiorno: Number.isInteger(indice) && indice >= 0 && indice < GIORNI_COMUNITA.length ? indice : 0,
      pasto: PASTI_AMMESSI.includes(dati.pasto) ? dati.pasto : "entrambi",
      pazienteId: dati.pazienteId || null,
      pazienteNome: dati.pazienteId ? dati.pazienteNome || null : null,
      tipo,
      ...(tipo === "presenze" ? { presenza: { ...dati.presenza }, presenzaPrima: { ...dati.presenzaPrima } } : {}),
      ...(tipo === "dieta" ? { dieta: { ...dati.dieta }, dietaPrima: { ...dati.dietaPrima } } : {}),
      testo,
      creataIl: new Date().toISOString(),
      stato: "inviata",
      presaInCaricoIl: null,
      presaInCaricoDa: null,
    };
    setVariazioni((prec) => [record, ...prec]);
    const pasto = record.pasto === "entrambi" ? "pranzo e cena" : record.pasto;
    loggaSessione("Variazione inviata a MAVI",
      [record.reparto, etichettaGiorno(record.indiceGiorno) + ", " + pasto, record.pazienteNome || "tutto il centro"].filter(Boolean).join(" · "),
      "ordine");
    avvisa("Variazione inviata a MAVI");
    return id;
  }, [sessione, ruoloSessione, loggaSessione, avvisa]);

  /* variazione su un pasto già trasmesso: la riga del paziente per quel giorno
     e pasto si sostituisce (riga nuova) o si toglie (riga null, ora assente),
     così distinta, etichette e ordini in arrivo contano giusto */
  const sostituisciRigaTrasmessa = React.useCallback((id, pasto, giorno, riga) => {
    const generatoIl = new Date().toISOString();
    setPresenzeTrasmesse((prec) => [
      ...prec.filter((r) => !(r.id === id && r.pasto === pasto && r.giorno === giorno)),
      ...(riga ? [{ ...riga, generatoIl }] : []),
    ]);
  }, []);

  /* lato MAVI. Legge da una ref, come `conferma`: due clic ravvicinati non
     devono prendere in carico (e loggare) due volte la stessa variazione */
  const variazioniRef = React.useRef(variazioni);
  variazioniRef.current = variazioni;
  const prendiInCaricoVariazione = React.useCallback((id) => {
    const v = variazioniRef.current.find((x) => x.id === id);
    if (!v || v.stato === "presa_in_carico") return false;
    const aggiornata = {
      ...v, stato: "presa_in_carico",
      presaInCaricoIl: new Date().toISOString(),
      presaInCaricoDa: sessione ? sessione.nome : "Cucina MAVI",
    };
    variazioniRef.current = variazioniRef.current.map((x) => (x.id === id ? aggiornata : x));
    setVariazioni((prec) => prec.map((x) => (x.id === id ? aggiornata : x)));
    loggaSessione("Variazione presa in carico",
      [v.reparto, etichettaGiorno(v.indiceGiorno), v.pazienteNome || "tutto il centro"].filter(Boolean).join(" · "),
      "approvazione");
    avvisa("Variazione presa in carico: il referente vede lo stato aggiornato");
    return true;
  }, [sessione, loggaSessione, avvisa]);

  /* ---------- ruoli, permessi e utenti gestiti ---------- */

  /* chi può ancora aprire "Ruoli e permessi": se resta uno solo, il portale
     non deve permettergli di chiudersi fuori da sé stesso */
  const amministratori = React.useCallback((elencoUtenti, elencoRuoli) =>
    elencoUtenti.filter((u) => {
      if (u.attivo === false) return false;
      const r = elencoRuoli.find((x) => x.id === u.ruolo);
      return !!r && r.permessi.includes("gestione.ruoli");
    }), []);

  const trovaUtente = React.useCallback((nomeUtente) => {
    const pulito = String(nomeUtente || "").trim().toLowerCase();
    return utenti.find((x) => x.u === pulito && x.attivo !== false) || null;
  }, [utenti]);

  const salvaRuolo = React.useCallback((ruolo) => {
    const esistente = ruoli.find((r) => r.id === ruolo.id);
    if (esistente && esistente.bloccato) {
      avvisa("Il ruolo " + esistente.nome + " è di sistema e non si modifica");
      return false;
    }
    const nome = String(ruolo.nome || "").trim();
    if (!nome) {
      avvisa("Il ruolo ha bisogno di un nome");
      return false;
    }
    if (ruoli.some((r) => r.id !== ruolo.id && r.nome.toLowerCase() === nome.toLowerCase())) {
      avvisa("Esiste già un ruolo con questo nome");
      return false;
    }
    const id = ruolo.id || "r" + Date.now();
    const record = { ...ruolo, id, nome, permessi: [...new Set(ruolo.permessi || [])] };
    setRuoli((p) => (esistente ? p.map((r) => (r.id === id ? { ...r, ...record } : r)) : [...p, record]));
    loggaSessione(esistente ? "Ruolo modificato" : "Ruolo creato", nome + ", " + record.permessi.length + " permessi", "modifica");
    return true;
  }, [ruoli, avvisa, loggaSessione]);

  const eliminaRuolo = React.useCallback((id) => {
    const r = ruoli.find((x) => x.id === id);
    if (!r) return false;
    if (r.bloccato) {
      avvisa("Il ruolo " + r.nome + " è di sistema e non si elimina");
      return false;
    }
    const assegnati = utenti.filter((u) => u.ruolo === id);
    if (assegnati.length) {
      avvisa("Ci sono ancora " + assegnati.length + (assegnati.length === 1 ? " utente" : " utenti") + " con il ruolo " + r.nome);
      return false;
    }
    setRuoli((p) => p.filter((x) => x.id !== id));
    loggaSessione("Ruolo eliminato", r.nome, "eliminazione");
    return true;
  }, [ruoli, utenti, avvisa, loggaSessione]);

  const commutaPermesso = React.useCallback((ruoloId, chiave) => {
    const r = ruoli.find((x) => x.id === ruoloId);
    if (!r) return false;
    if (r.bloccato) {
      avvisa("Il ruolo " + r.nome + " è di sistema, i suoi permessi non si toccano");
      return false;
    }
    const aveva = r.permessi.includes(chiave);
    if (aveva && chiave === "gestione.ruoli") {
      const dopo = ruoli.map((x) => (x.id === ruoloId ? { ...x, permessi: x.permessi.filter((k) => k !== chiave) } : x));
      if (amministratori(utenti, dopo).length === 0) {
        avvisa("Non resterebbe nessuno a gestire ruoli e permessi");
        return false;
      }
    }
    setRuoli((p) => p.map((x) => (x.id === ruoloId
      ? { ...x, permessi: aveva ? x.permessi.filter((k) => k !== chiave) : [...x.permessi, chiave] }
      : x)));
    return true;
  }, [ruoli, utenti, avvisa, amministratori]);

  const salvaUtente = React.useCallback((dati) => {
    const nome = String(dati.nome || "").trim();
    const username = String(dati.u || "").trim().toLowerCase();
    if (!nome) { avvisa("Il nome è obbligatorio"); return false; }
    if (!username) { avvisa("Il nome utente è obbligatorio: senza, la persona non entra"); return false; }
    if (utenti.some((x) => x.u === username && x.id !== dati.id)) {
      avvisa("Il nome utente " + username + " è già assegnato");
      return false;
    }
    const esistente = utenti.find((x) => x.id === dati.id);
    if (esistente && esistente.ruolo !== dati.ruolo) {
      const dopo = utenti.map((x) => (x.id === dati.id ? { ...x, ruolo: dati.ruolo } : x));
      if (amministratori(utenti, ruoli).length > 0 && amministratori(dopo, ruoli).length === 0) {
        avvisa("È l'ultimo utente che può gestire ruoli e permessi: il ruolo non si cambia");
        return false;
      }
    }
    const iniziali = nome.split(" ").filter(Boolean).map((x) => x[0]).join("").slice(0, 2).toUpperCase();
    const record = { ...dati, nome, u: username, iniziali: dati.iniziali || iniziali };
    if (esistente) {
      setUtenti((p) => p.map((x) => (x.id === dati.id ? { ...x, ...record } : x)));
    } else {
      setUtenti((p) => [...p, { attivo: true, ...record, id: "u" + Date.now() }]);
    }
    loggaSessione(esistente ? "Utente modificato" : "Utente creato", nome + " — " + username, "modifica");
    return true;
  }, [utenti, ruoli, avvisa, loggaSessione, amministratori]);

  const commutaAttivoUtente = React.useCallback((id) => {
    const u = utenti.find((x) => x.id === id);
    if (!u) return false;
    if (u.attivo !== false) {
      const dopo = utenti.map((x) => (x.id === id ? { ...x, attivo: false } : x));
      if (amministratori(dopo, ruoli).length === 0) {
        avvisa("È l'ultimo utente che può gestire ruoli e permessi: non si disattiva");
        return false;
      }
    }
    setUtenti((p) => p.map((x) => (x.id === id ? { ...x, attivo: x.attivo === false } : x)));
    avvisa(u.nome + (u.attivo !== false ? " disattivato" : " riattivato"));
    loggaSessione(u.attivo !== false ? "Utente disattivato" : "Utente riattivato", u.nome, "modifica");
    return true;
  }, [utenti, ruoli, avvisa, loggaSessione, amministratori]);

  const coperte = React.useCallback(
    (giorno) => {
      const o = ordini[giorno] || {};
      /* il piatto scelto come unico può essere stato nel frattempo eliminato
         dal catalogo da un altro portale (demo incrociata): senza il guard
         PIATTI[o.unico] sarebbe undefined e l'accesso a .so andrebbe in errore */
      return o.unico ? (PIATTI[o.unico]?.so || []) : [];
    },
    [ordini]
  );

  const scegli = React.useCallback(
    (giorno, categoria, id) => {
      if (GIORNI[giorno].chiuso) {
        avvisa("Le prenotazioni per questo giorno sono chiuse");
        return;
      }
      setOrdini((prec) => {
        const o = { ...(prec[giorno] || {}) };
        if (o[categoria] === id) {
          delete o[categoria];
        } else {
          o[categoria] = id;
          if (categoria === "primo") delete o.sost_primo;
          if (categoria === "sost_primo") delete o.primo;
          if (categoria === "secondo") delete o.sost_secondo;
          if (categoria === "sost_secondo") delete o.secondo;
          if (categoria === "unico") {
            (PIATTI[id].so || []).forEach((c) => {
              delete o[c];
              if (c === "primo") delete o.sost_primo;
              if (c === "secondo") delete o.sost_secondo;
            });
          } else if (o.unico && (PIATTI[o.unico].so || []).includes(categoria)) {
            delete o.unico;
          }
        }
        return { ...prec, [giorno]: o };
      });
      setConfermati((c) => {
        const n = { ...c };
        delete n[giorno];
        return n;
      });
    },
    [avvisa]
  );

  const mancanti = React.useCallback(
    (giorno) => {
      const o = ordini[giorno] || {};
      const cop = coperte(giorno);
      const m = [];
      if (!o.primo && !o.sost_primo && !cop.includes("primo")) m.push("il primo");
      if (!o.secondo && !o.sost_secondo && !cop.includes("secondo")) m.push("il secondo");
      if (!o.contorno && !cop.includes("contorno")) m.push("il contorno");
      return m;
    },
    [ordini, coperte]
  );

  /* `conferma` viene passata ai figli e memorizzata: senza questa ref
     leggerebbe gli `ordini` catturati dalla closure al momento della
     creazione, non quelli aggiornati un istante prima dal clic. */
  const ordiniRef = React.useRef(ordini);
  ordiniRef.current = ordini;

  /* `chi` è la persona per cui vale il pasto: `{ nome, matricola, ruolo }`.
     Se porta anche `inseritaDa: { nome, ruolo }` la prenotazione è fatta da
     qualcun altro (il referente per un dipendente) e il log lo attribuisce a
     lui, non al commensale.
     `piatti` è la prenotazione per conto di un altro, nella forma
     `{ categoria: idPiatto }`: in quel caso non si toccano né `ordini` né
     `confermati`, che sono il carrello del dipendente collegato, e si produce
     solo la riga nominativa. */
  const conferma = React.useCallback(
    (giorno, chi = { nome: "Antonella Rossi", ruolo: "Dipendente" }, piatti) => {
      if (GIORNI[giorno]?.chiuso) {
        avvisa("Le prenotazioni per questo giorno sono chiuse");
        return;
      }
      const perConto = !!piatti;
      const scelte = piatti || ordiniRef.current[giorno] || {};
      if (!perConto) {
        setConfermati((c) => ({ ...c, [giorno]: true }));
        setOraConferma((o) => ({ ...o, [giorno]: new Date().toISOString() }));
        avvisa("Prenotazione confermata, entra nella distinta di MAVI");
      }
      const autore = chi.inseritaDa || chi;
      logga(
        autore.nome, autore.ruolo,
        chi.inseritaDa ? "Prenotazione per conto di " + chi.nome : "Prenotazione confermata",
        etichettaGiorno(giorno) + ", " + (chi.inseritaDa ? "cruscotto referente" : "portale dipendente"),
        "ordine"
      );
      /* entra nell'elenco nominativo, che alimenta il riepilogo del giorno del
         referente e il manifesto di consegna del fornitore: quali portate, non
         solo quante. Sostituisce l'eventuale riga precedente della stessa
         persona per lo stesso giorno, seme compreso, non la somma. */
      const nomePortata = (id) => (id && PIATTI[id] ? PIATTI[id].n : "—");
      const anagrafica = anagraficaAzienda(chi.nome);
      const riga = {
        id: "conf-" + giorno + "-" + chi.nome.replace(/\s+/g, "_"),
        nome: chi.nome,
        matricola: chi.matricola || anagrafica.matricola,
        reparto: anagrafica.reparto || chi.ruolo,
        committente: "azienda",
        committenteNome: "Rossi Manifatture Spa",
        indiceGiorno: giorno,
        giorno: etichettaGiorno(giorno),
        pasto: "pranzo",
        primo: nomePortata(scelte.primo || scelte.sost_primo),
        secondo: nomePortata(scelte.secondo || scelte.sost_secondo),
        contorno: nomePortata(scelte.contorno),
        unico: scelte.unico && PIATTI[scelte.unico] ? PIATTI[scelte.unico].n : "",
      };
      setNominativiAzienda((prec) =>
        [...prec.filter((r) => !(r.nome === riga.nome && r.indiceGiorno === giorno)), riga]
      );
    },
    [avvisa, logga]
  );

  const disdici = React.useCallback(
    (giorno) => {
      if (GIORNI[giorno]?.chiuso) {
        avvisa("Le prenotazioni per questo giorno sono chiuse, non si può più disdire");
        return;
      }
      setConfermati((c) => {
        const n = { ...c };
        delete n[giorno];
        return n;
      });
      avvisa("Prenotazione disdetta, puoi rifarla entro l'orario limite");
    },
    [avvisa]
  );

  /* modifica del menu dal portale MAVI */
  const cambiaMenu = React.useCallback((giorno, categoria, id) => {
    setMenu((prec) => {
      if (giorno === "fissi") {
        const lista = prec.fissi[categoria] || [];
        const nuova = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
        return { ...prec, fissi: { ...prec.fissi, [categoria]: nuova } };
      }
      const variabili = prec.variabili.map((g, i) => {
        if (i !== giorno) return g;
        const lista = g[categoria] || [];
        const nuova = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
        return { ...g, [categoria]: nuova };
      });
      return { ...prec, variabili };
    });
  }, []);

  const commutaAllergene = React.useCallback((n) => {
    setAllergeniUtente((a) => (a.includes(n) ? a.filter((x) => x !== n) : [...a, n]));
  }, []);

  const ripristinaMenu = React.useCallback(() => {
    setMenu({ variabili: MENU_INIZIALE.variabili.map((g) => ({ ...g })), fissi: { ...MENU_INIZIALE.fissi } });
    avvisa("Menu riportato alla versione iniziale");
  }, [avvisa]);

  /* caricamento delle fotografie dal portale MAVI */
  const caricaFoto = React.useCallback((id, dato) => {
    setFoto((f) => ({ ...f, [id]: dato }));
  }, []);
  const togliFoto = React.useCallback((id) => {
    setFoto((f) => {
      const n = { ...f };
      delete n[id];
      return n;
    });
  }, []);

  /* riordino dei piatti dentro una portata, per il trascinamento */
  const riordinaMenu = React.useCallback((giorno, categoria, da, a) => {
    setMenu((prec) => {
      const sposta = (lista) => {
        const n = [...lista];
        const [tolto] = n.splice(da, 1);
        n.splice(a, 0, tolto);
        return n;
      };
      if (giorno === "fissi") {
        return { ...prec, fissi: { ...prec.fissi, [categoria]: sposta(prec.fissi[categoria] || []) } };
      }
      const variabili = prec.variabili.map((g, i) =>
        i === giorno ? { ...g, [categoria]: sposta(g[categoria] || []) } : g
      );
      return { ...prec, variabili };
    });
  }, []);

  /* creazione e modifica di un piatto a catalogo */
  const salvaPiatto = React.useCallback((id, dati) => {
    PIATTI[id] = { ...(PIATTI[id] || {}), ...dati };
    setVersione((v) => v + 1);
  }, []);

  const eliminaPiatto = React.useCallback((id) => {
    delete PIATTI[id];
    setMenu((prec) => ({
      variabili: prec.variabili.map((g) => {
        const n = { ...g };
        Object.keys(n).forEach((c) => { n[c] = (n[c] || []).filter((x) => x !== id); });
        return n;
      }),
      fissi: Object.fromEntries(Object.entries(prec.fissi).map(([c, l]) => [c, l.filter((x) => x !== id)])),
    }));
    /* toglie anche la fotografia caricata: senza, se in seguito si crea un
       piatto nuovo con lo stesso codice, si ritroverebbe la foto del piatto eliminato */
    setFoto((f) => {
      if (!(id in f)) return f;
      const n = { ...f };
      delete n[id];
      return n;
    });
    setVersione((v) => v + 1);
  }, []);

  /* quantità dichiarate dalle unità, RSA e comunità */
  /* aggiunge un ospite alla griglia della sua RSA nella colonna della dieta.
     La colonna della griglia unità è determinata dalla dieta prescritta. */
  const aggiungiOspitePresente = React.useCallback((ospite) => {
    setUnita((prec) => {
      if (!prec.rsa) return prec; // modulo RSA non ancora inizializzato in questo perimetro
      const gruppo = [...prec.rsa];
      const idx = gruppo.findIndex((r) => r.unita === ospite.nucleo);
      if (idx < 0) return prec;
      const riga = { ...gruppo[idx] };
      const colonna = ({ std: "normale", iposodica: "iposodica", ipoproteica: "iposodica",
                        diabetica: "diabetica", senza_glutine: "senza_glutine" })[ospite.dieta] || "normale";
      riga[colonna] = (riga[colonna] || 0) + 1;
      /* consistenza modificata la tracciamo in una colonna dedicata se non normale */
      if (ospite.consistenza !== "normale" && riga[ospite.consistenza] !== undefined) {
        riga[ospite.consistenza] = (riga[ospite.consistenza] || 0) + 1;
      }
      gruppo[idx] = riga;
      return { ...prec, rsa: gruppo };
    });
  }, []);

  const cambiaUnita = React.useCallback((tipo, riga, campo, valore) => {
    setUnita((prec) => {
      if (!prec[tipo]) return prec;
      return {
        ...prec,
        [tipo]: prec[tipo].map((r, i) => (i === riga ? { ...r, [campo]: Math.max(0, Number(valore) || 0) } : r)),
      };
    });
  }, []);

  /* presenze dichiarate dalle classi */
  const cambiaPresenze = React.useCallback((riga, campo, valore) => {
    setPresenze((prec) => prec.map((r, i) => (i === riga ? { ...r, [campo]: Math.max(0, Number(valore) || 0) } : r)));
  }, []);

  /* flusso ordini: struttura -> responsabile -> cucina MAVI */
  const trasmettiOrdine = React.useCallback((ord) => {
    const id = "o" + Date.now();
    setOrdiniTrasmessi((p) => [{ id, stato: "in_attesa", ora: nowHM(), ...ord }, ...p]);
    avvisa("Ordine inviato al responsabile per l'approvazione");
    return id;
  }, [avvisa]);
  const approvaOrdine = React.useCallback((id) => {
    setOrdiniTrasmessi((p) => p.map((o) => (o.id === id ? { ...o, stato: "approvato", oraApprov: nowHM() } : o)));
    avvisa("Ordine approvato e trasmesso alla cucina");
  }, [avvisa]);
  const respingiOrdine = React.useCallback((id, motivo) => {
    setOrdiniTrasmessi((p) => p.map((o) => (o.id === id ? { ...o, stato: "respinto", motivo } : o)));
    avvisa("Ordine respinto, notificato al mittente");
  }, [avvisa]);

  /* proforma: MAVI le compone a mano in Fatturazione. Le condizioni si
     copiano dentro il documento al momento dell'emissione e da lì restano
     ferme: cambiare le condizioni del committente non riscrive le proforma
     già emesse. Ritorna il documento creato, così il chiamante può aprire il
     PDF nello stesso gesto di click senza aspettare il ridisegno. */
  const emettiProforma = React.useCallback((dati) => {
    const regime = regimeIva(dati.regimeIva);
    const dataEmissione = dati.dataEmissione || isoGiorno(new Date());
    const proforma = {
      id: "pro" + Date.now(),
      numero: prossimoNumero(proforme),
      committenteId: dati.committenteId,
      periodo: dati.periodo || "",
      dataEmissione,
      righe: (dati.righe || []).map((r) => ({
        descrizione: String(r.descrizione || "").trim(),
        quantita: Number(r.quantita) || 0,
        prezzo: Number(r.prezzo) || 0,
      })),
      termini: dati.termini || "",
      metodoPagamento: dati.metodoPagamento || "bonifico",
      regimeIva: regime.id,
      aliquota: regime.conIva ? Number(dati.aliquota) || 0 : 0,
      dicituraIva: regime.conIva ? "" : (dati.dicituraIva || regime.dicitura),
      note: dati.note || "",
      stato: "emessa",
      scadenza: isoGiorno(scadenzaPagamento(dataEmissione, dati.termini)),
    };
    setProforme((p) => [proforma, ...p]);
    loggaSessione("Proforma emessa",
      proforma.numero + ", " + (dati.nomeCommittente || proforma.committenteId) + ", " + (proforma.periodo || "periodo non indicato"), "generico");
    return proforma;
  }, [proforme, loggaSessione]);

  /* cambi di stato di una proforma emessa: la data del cambio resta sul
     documento (pagataIl, stornataIl, annullataIl) e finisce nel timbro del PDF */
  const cambiaStatoProforma = React.useCallback((id, stato, campoData, azione, avviso) => {
    const p = proforme.find((x) => x.id === id);
    setProforme((prec) => prec.map((x) => (x.id === id ? { ...x, stato, [campoData]: isoGiorno(new Date()) } : x)));
    loggaSessione(azione, p ? p.numero : id, "generico");
    avvisa(avviso);
  }, [proforme, loggaSessione, avvisa]);
  const annullaProforma = React.useCallback((id) => cambiaStatoProforma(id, "annullata", "annullataIl",
    "Proforma annullata", "Proforma annullata, resta in elenco per tracciabilità"), [cambiaStatoProforma]);
  const segnaPagataProforma = React.useCallback((id) => cambiaStatoProforma(id, "pagata", "pagataIl",
    "Proforma segnata pagata", "Proforma segnata come pagata: il cliente la vede saldata"), [cambiaStatoProforma]);
  const stornaProforma = React.useCallback((id) => cambiaStatoProforma(id, "stornata", "stornataIl",
    "Proforma stornata", "Proforma stornata: non è più esigibile, resta in elenco"), [cambiaStatoProforma]);

  /* documenti condivisi, caricati da MAVI */
  const aggiungiDocumento = React.useCallback((doc) => {
    setDocumenti((d) => [{ ...doc, id: "doc" + Date.now() }, ...d]);
  }, []);
  const rimuoviDocumento = React.useCallback((id) => {
    setDocumenti((d) => d.filter((x) => x.id !== id));
  }, []);

  const valore = {
    ordini, confermati, messaggi, menu, foto, caricaFoto, togliFoto,
    versione, riordinaMenu, salvaPiatto, eliminaPiatto,
    documenti, aggiungiDocumento, rimuoviDocumento,
    proforme, emettiProforma, annullaProforma, segnaPagataProforma, stornaProforma,
    committente, setCommittente, committenti, aggiungiCommittente, aggiornaCommittente, unita, cambiaUnita, aggiungiOspitePresente, presenze, cambiaPresenze, assenti, commutaAssente, ospitiExtra, aggiungiOspite, presenzeTrasmesse, trasmissioniCentri, trasmettiPresenze, sostituisciRigaTrasmessa,
    oraConferma, nominativiAzienda,
    variazioni, inviaVariazione, prendiInCaricoVariazione,
    presenzeComunita, setPresenzeComunita, logOperazioni, logga,
    tema, setTema, datiAziendali, setDatiAziendali, notifiche, setNotifiche, profili, aggiornaProfilo,
    sessione, ruoloSessione, entra, esci, puo, loggaSessione, trovaUtente,
    utenti, salvaUtente, commutaAttivoUtente,
    ruoli, salvaRuolo, eliminaRuolo, commutaPermesso,
    ordiniTrasmessi, trasmettiOrdine, approvaOrdine, respingiOrdine, allergeniUtente, dietaUtente, setDietaUtente, avvisa, scegli, conferma,
    disdici, coperte, mancanti, cambiaMenu, ripristinaMenu, commutaAllergene,
  };
  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>;
}
