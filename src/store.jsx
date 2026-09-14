import React from "react";
import { PIATTI, GIORNI, MENU_INIZIALE, COMMITTENTI, ORDINI_UNITA, PAZIENTI_COMUNITA, ETICHETTE_AZIENDA_DEMO } from "./data.js";

const Ctx = React.createContext(null);
export const usaStato = () => React.useContext(Ctx);

let contatore = 0;

function nowHM() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

/* ordini già inviati oggi, per popolare le pagine di dimostrazione */
const ORDINI_IN_CODA = [
  { id: "o1", struttura: "azienda", strutturaNome: "Rossi Manifatture Spa", mittente: "Roberto Manzi", ruoloMittente: "Referente", unita: "Amministrazione", pasti: 28, note: "3 vegetariani, 2 senza glutine", stato: "approvato", ora: "13:42", oraApprov: "14:05" },
  { id: "o2", struttura: "rsa", strutturaNome: "RSA Villa Serena", mittente: "Marco Pallino", ruoloMittente: "Operatore", unita: "Nucleo Glicine", pasti: 34, note: "6 tritati, 3 frullati, 4 iposodica", stato: "in_attesa", ora: "07:18" },
  { id: "o3", struttura: "rsa", strutturaNome: "RSA Villa Serena", mittente: "Elena Vergani", ruoloMittente: "Operatore", unita: "Nucleo Magnolia", pasti: 27, note: "4 tritati, 2 frullati, 3 iposodica", stato: "approvato", ora: "07:22", oraApprov: "07:45" },
  { id: "o4", struttura: "comunita", strutturaNome: "Comunità Il Ponte", mittente: "Samuele Ferri", ruoloMittente: "Educatore", unita: "Spazio Giovani SGA", pasti: 19, note: "1 senza glutine", stato: "in_attesa", ora: "08:31" },
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
  const [datiAziendali, setDatiAziendali] = React.useState({
    ragioneSociale: "", indirizzo: "", piva: "", cf: "", telefono: "", email: "", pec: "",
    iban: "", condizioniPagamento: "30 giorni data fattura", noteProforma: "",
  });
  const [utenti, setUtenti] = React.useState([
    { id: "u1", nome: "Antonella Rossi", ruolo: "Dipendente", struttura: "Rossi Manifatture Spa", attivo: true },
    { id: "u2", nome: "Roberto Manzi", ruolo: "Referente aziendale", struttura: "Rossi Manifatture Spa", attivo: true },
    { id: "u3", nome: "Samuele Ferri", ruolo: "Educatore", struttura: "Comunità Il Ponte", reparto: "Spazio Giovani SGA", attivo: true },
    { id: "u4", nome: "Ilaria Gatti", ruolo: "Responsabile", struttura: "Comunità Il Ponte", attivo: true },
    { id: "u5", nome: "Cucina MAVI", ruolo: "Operatore cucina", struttura: "MAVI Ristorazione", attivo: true },
  ]);
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
    Object.fromEntries((PAZIENTI_COMUNITA || []).map((p) => [p.id, { pranzo: null, cena: null }]))
  );
  const [logOperazioni, setLogOperazioni] = React.useState([
    { id: "s1", ora: "06:00", utente: "Sistema", ruolo: "Automatico", azione: "Backup giornaliero completato", dettaglio: "Database e file multimediali", tipo: "sistema" },
    { id: "s2", ora: "06:02", utente: "Sistema", ruolo: "Automatico", azione: "Menu ciclico: rotazione settimana", dettaglio: "Passaggio a settimana 2 del ciclo autunnale", tipo: "sistema" },
    { id: "l0", ora: "07:18", utente: "Marco Pallino", ruolo: "Operatore RSA", azione: "Ordine trasmesso", dettaglio: "34 pasti, RSA Villa Serena, Nucleo Glicine", tipo: "ordine" },
    { id: "l1", ora: "07:22", utente: "Elena Vergani", ruolo: "Operatore RSA", azione: "Ordine trasmesso", dettaglio: "27 pasti, RSA Villa Serena, Nucleo Magnolia", tipo: "ordine" },
    { id: "l2", ora: "07:45", utente: "Cucina MAVI", ruolo: "Operatore", azione: "Ordine approvato", dettaglio: "RSA Villa Serena, Nucleo Magnolia", tipo: "approvazione" },
    { id: "l3", ora: "08:31", utente: "Samuele Ferri", ruolo: "Educatore", azione: "Ordine trasmesso", dettaglio: "19 pasti, Comunità Il Ponte", tipo: "ordine" },
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

  /* aggiorna per id E pasto invece di sovrascrivere: un educatore trasmette
     solo il proprio reparto, il responsabile può trasmettere il resto più
     tardi, e la cena non deve far perdere il pranzo già trasmesso */
  const trasmettiPresenze = React.useCallback((lista) => {
    const generatoIl = new Date().toISOString();
    const listaTimbrata = lista.map((r) => ({ ...r, generatoIl }));
    setPresenzeTrasmesse((prec) => {
      const restanti = prec.filter((r) => !lista.some((n) => n.id === r.id && n.pasto === r.pasto));
      return [...restanti, ...listaTimbrata];
    });
    const pasti = [...new Set(lista.map((r) => r.pasto).filter(Boolean))];
    const dettaglio = lista.length + " pazienti presenti" + (pasti.length ? ", " + pasti.join(" e ") : "");
    logga("Comunità", "Operatore", "Presenze trasmesse", dettaglio, "presenze");
  }, [logga]);

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
    setCommittenti((p) => [...p, { attivo: true, unita: [], frutta: false, monoporzione: false, ...dati, id }]);
    logga("Cucina MAVI", "Admin", "Nuovo committente creato", dati.nome + " (" + dati.tipo + ")", "modifica");
    return id;
  }, [logga]);
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

  const conferma = React.useCallback(
    (giorno, chi = { nome: "Antonella Rossi", ruolo: "Dipendente" }) => {
      setConfermati((c) => ({ ...c, [giorno]: true }));
      setOraConferma((o) => ({ ...o, [giorno]: new Date().toISOString() }));
      avvisa("Prenotazione confermata, entra nella distinta di MAVI");
      logga(chi.nome, chi.ruolo, "Prenotazione confermata", GIORNI[giorno]?.n + " " + GIORNI[giorno]?.breve + ", portale dipendente", "ordine");
      /* entra anche nel manifesto nominativo del fornitore: quali portate,
         non solo quante. Sostituisce l'eventuale riga precedente della stessa
         persona per lo stesso giorno, non la somma. */
      setNominativiAzienda((prec) => {
        const o = ordini[giorno] || {};
        const nomePortata = (id) => (id && PIATTI[id] ? PIATTI[id].n : "—");
        const riga = {
          id: "conf-" + giorno + "-" + chi.nome.replace(/\s+/g, "_"),
          nome: chi.nome, matricola: "", reparto: chi.ruolo, committente: "Rossi Manifatture Spa",
          giorno: (GIORNI[giorno]?.n || "") + " " + (GIORNI[giorno]?.d || ""), pasto: "pranzo",
          primo: nomePortata(o.primo || o.sost_primo || o.unico),
          secondo: nomePortata(o.secondo || o.sost_secondo),
          contorno: nomePortata(o.contorno),
        };
        return [...prec.filter((r) => r.id !== riga.id), riga];
      });
    },
    [avvisa, logga, ordini]
  );

  const disdici = React.useCallback(
    (giorno) => {
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
    committente, setCommittente, committenti, aggiungiCommittente, aggiornaCommittente, unita, cambiaUnita, aggiungiOspitePresente, presenze, cambiaPresenze, assenti, commutaAssente, ospitiExtra, aggiungiOspite, presenzeTrasmesse, trasmettiPresenze,
    oraConferma, nominativiAzienda,
    presenzeComunita, setPresenzeComunita, logOperazioni, logga,
    tema, setTema, datiAziendali, setDatiAziendali, utenti, setUtenti, notifiche, setNotifiche, profili, aggiornaProfilo,
    ordiniTrasmessi, trasmettiOrdine, approvaOrdine, respingiOrdine, allergeniUtente, dietaUtente, setDietaUtente, avvisa, scegli, conferma,
    disdici, coperte, mancanti, cambiaMenu, ripristinaMenu, commutaAllergene,
  };
  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>;
}
