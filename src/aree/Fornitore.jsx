import React from "react";
import {
  ALLERGENI, CATEGORIE, splitPiatto, COLORI, DIPENDENTI, ETICHETTA_ADESSO, ETICHETTE_PORTALE, GIORNI, GIORNI_COMUNITA, GIORNI_SETT, GIRI, INDICE_DOMANI,
  MARCATORI, METODI_PAGAMENTO, PASTI_TIPO, PAZIENTI_COMUNITA, PERMESSI, PIATTI,
  REGIMI_IVA, TERMINI_PAGAMENTO, catalogoPerCategoria, dietaEffettiva, etichettaGiorno, menuDelGiorno, metodoPagamento, presenzaVariata,
  ordinaProforme, pastiDi, permessiDelPortale, portateServite, primoAperto, proformaValida, regimeIva, scadenzaPagamento, sostituisce, statoProforma,
  terminiPagamento, testoCondizioni, totaliProforma,
} from "../data.js";
import {
  Accesso, DiscoColore, Documenti, Icone, Illustrazione, Intestazione, Messaggi, NessunPermesso,
  PastigliaProforma, Telaio, Velo, schedaPdf, usaVociPermesse,
} from "../ui.jsx";
import { usaStato } from "../store.jsx";
import { dataIt, giornoDataIt } from "../documento.js";
import { generaDistintaPDF, generaDistintaSettimanaPDF } from "../resoconto.js";
import { generaProformaPDF } from "../proforma.js";
import { generaManifestoConsegna } from "../manifesto.js";
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

const PERMESSO_PAGINA = {
  produzione: "produzione.vedi",
  flussi: "flussi.vedi",
  consegne: "consegne.vedi",
  etichette: "etichette.vedi",
  modelli: "modelli.vedi",
  impostazioni: "impostazioni.vedi",
  settimana: "menu.vedi",
  catalogo: "catalogo.vedi",
  fatturazione: "fatturazione.vedi",
  log: "log.vedi",
  gestione: "gestione.vedi",
  documenti: "documenti.vedi",
};

export default function Fornitore({ diretto, onEsci, utente }) {
  const [dentro, setDentro] = React.useState(!!diretto);
  const st = usaStato();
  const [voci, pagina, setPagina] = usaVociPermesse(VOCI, PERMESSO_PAGINA);

  if (!dentro)
    return (
      <Accesso
        area="fornitore"
        titolo="Portale MAVI"
        claim="Un solo documento, <em>certo</em>, per la cucina."
        punti={[
          "Distinta di produzione divisa per committente e per centro",
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
      ruolo={(st.ruoloSessione && st.ruoloSessione.nome) || "MAVI Ristorazione"}
      utente={{
        iniziali: (utente && utente.iniziali) || "MV",
        nome: (utente && utente.nome) || "Cucina centrale",
        sotto: (utente && utente.committente) || "MAVI Ristorazione",
      }}
      chiaveUtente={(utente && utente.u) || "cucina.mavi"}
      voci={voci}
      pagina={pagina}
      setPagina={setPagina}
      onEsci={() => (onEsci ? onEsci() : null)}
    >
      {voci.length === 0 && <NessunPermesso onEsci={onEsci} />}
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
      {pagina === "documenti" && (
        <Documenti soloPubblici={!st.puo("documenti.riservati")} gestibile={st.puo("documenti.gestisci")} />
      )}
      <Messaggi lista={st.messaggi} />
    </Telaio>
  );
}

/* ==================== distinta di produzione, per giorno e per settimana ==================== */

/* La settimana della distinta è quella delle comunità, da lunedì a domenica
   (GIORNI_COMUNITA): l'azienda ha il menu solo nei giorni di GIORNI e nel fine
   settimana risulta "nessun servizio". Si apre su domani rispetto ad "adesso"
   (INDICE_DOMANI, mercoledì 16): la giornata che la cucina prepara stanotte. */
const GIORNO_APERTURA = INDICE_DOMANI;
const ETICHETTA_SETTIMANA = "Settimana dal " + dataIt(GIORNI_COMUNITA[0].data).slice(0, 5)
  + " al " + dataIt(GIORNI_COMUNITA[GIORNI_COMUNITA.length - 1].data);

/* Coperti previsti dell'azienda, uno per giornata. Finché i dipendenti non
   confermano, la cucina deve comunque avere un ordine di grandezza su cui
   lavorare: sono numeri deterministici, dichiarati sempre come stima e mai
   confusi con un ordine trasmesso. La stima copre solo i coperti non ancora
   confermati: 7 conferme su 28 previsti fanno 7 + 21, non 7 + 28. */
const COPERTI_STIMA_AZIENDA = [26, 24, 28, 25, 22];
const ETICHETTA_PASTO = { pranzo: "Pranzo", cena: "Cena", entrambi: "Pranzo e cena" };
const ETICHETTA_TIPO_VARIAZIONE = { dieta: "Dieta", presenze: "Presenze", altro: "Altro" };

/* Peso di scelta per posizione nel menu del giorno: il primo piatto in elenco è
   il più richiesto. I pesi si normalizzano sul numero di piatti realmente a
   menu, così la somma delle porzioni resta esattamente il numero di coperti. */
const PESI_SCELTA = [40, 26, 18, 10, 6];
const PORTATE_STIMA = ["primo", "secondo", "contorno"];
const NOME_CATEGORIA = CATEGORIE.reduce((o, c) => { o[c.id] = c.nome; return o; }, {});
const ORDINE_CATEGORIA = CATEGORIE.map((c) => c.id);

function ripartisci(totale, quanti) {
  if (quanti <= 0 || totale <= 0) return [];
  const pesi = Array.from({ length: quanti }, (unused, i) => PESI_SCELTA[i] || 4);
  const somma = pesi.reduce((a, b) => a + b, 0);
  const quote = pesi.map((p) => Math.floor((totale * p) / somma));
  let resto = totale - quote.reduce((a, b) => a + b, 0);
  for (let i = 0; resto > 0; i = (i + 1) % quanti) {
    quote[i] += 1;
    resto -= 1;
  }
  return quote;
}

function ordinaVoci(a, b) {
  const posA = ORDINE_CATEGORIA.indexOf(a.categoria);
  const posB = ORDINE_CATEGORIA.indexOf(b.categoria);
  if (posA !== posB) return posA - posB;
  if (b.totale !== a.totale) return b.totale - a.totale;
  return a.nome.localeCompare(b.nome, "it");
}

/* dieta dichiarata in anagrafica dipendenti: "riservata" resta riservata, il
   portale sa che c'è una prescrizione, non cosa contiene */
function dietaDipendente(nome) {
  const chiave = String(nome || "").trim().toLowerCase();
  const d = DIPENDENTI.find((x) => x.n.toLowerCase() === chiave);
  if (!d || d.dieta === "nessuna") return null;
  if (d.dieta === "riservata") {
    return { tipoDieta: "Riservata", note: "Prescrizione non visibile al portale, chiedere al referente aziendale" };
  }
  return { tipoDieta: d.dieta.charAt(0).toUpperCase() + d.dieta.slice(1), note: "" };
}

/* Destinazioni di consegna: l'azienda riceve un solo carico, la comunità uno
   per centro, perché ogni centro riceve i suoi pasti.
   `centriExtra` raccoglie i centri che compaiono nei pazienti o nelle presenze
   ma non ancora nell'anagrafica del committente. */
function destinazioniDi(c, centriExtra = []) {
  if (c.tipo !== "Comunità") return [{ chiave: c.id, committente: c, centro: "" }];
  const centri = [...(c.unita || [])];
  centriExtra.forEach((x) => { if (x && !centri.includes(x)) centri.push(x); });
  if (!centri.length) return [{ chiave: c.id, committente: c, centro: "" }];
  return centri.map((centro) => ({ chiave: c.id + "|" + centro, committente: c, centro }));
}

/* Distinta di una giornata, sempre su pranzo e cena: il filtro del pasto si
   applica dopo, in lettura. Ogni voce ha `per[destinazione][pasto]`, ogni
   destinazione i coperti del pasto divisi in confermati e stimati.
   L'azienda (solo pranzo) somma le righe nominative confermate per quel giorno
   e stima i coperti che mancano sul menu del giorno. La comunità lavora centro
   per centro e pasto per pasto: presenze trasmesse da quel centro, oppure, se
   quel centro non ha ancora trasmesso, stima dalle diete dei suoi pazienti.
   Senza la divisione per centro, il primo referente che trasmette farebbe
   sparire la stima degli altri centri. */
function distintaDelGiorno({ committenti, indiceGiorno, menu, nominativi, presenze, trasmissioni = [], variazioni = [], idPerNome, centriComunita }) {
  const voci = new Map();
  const contributi = new Map();
  const diete = new Map();

  const contributo = (dest, pasto) => {
    if (!contributi.has(dest)) contributi.set(dest, {});
    const c = contributi.get(dest);
    if (!c[pasto]) c[pasto] = { coperti: 0, confermati: 0, stimati: 0, porzioni: 0, trasmessi: 0, chiusi: 0 };
    return c[pasto];
  };

  const aggiungi = (testo, categoria, dest, pasto, quanti) => {
    const nome = String(splitPiatto(testo).nome || "").trim();
    if (!nome || nome === "—" || !(quanti > 0)) return;
    const chiave = categoria + "|" + nome.toLowerCase();
    if (!voci.has(chiave)) {
      const idPiatto = idPerNome.get(nome.toLowerCase()) || "";
      voci.set(chiave, {
        chiave, nome, categoria, idPiatto,
        colore: idPiatto ? PIATTI[idPiatto].col : "",
        per: {},
      });
    }
    const per = voci.get(chiave).per;
    if (!per[dest]) per[dest] = {};
    per[dest][pasto] = (per[dest][pasto] || 0) + quanti;
    contributo(dest, pasto).porzioni += quanti;
  };

  const segnaDieta = (dest, committente, nome, reparto, tipoDieta, note, pasto) => {
    const chiave = dest + "|" + nome;
    if (!diete.has(chiave)) diete.set(chiave, { chiave, dest, committente, nome, reparto, tipoDieta, note, pasti: [] });
    const d = diete.get(chiave);
    if (!d.pasti.includes(pasto)) d.pasti.push(pasto);
  };

  const azienda = committenti.find((c) => c.id === "azienda");
  if (azienda && indiceGiorno >= GIORNI.length) {
    contributo(azienda.id, "pranzo").chiusi += 1;
  } else if (azienda) {
    const dest = azienda.id;
    const confermati = nominativi.filter((n) => n.indiceGiorno === indiceGiorno);
    confermati.forEach((r) => {
      aggiungi(r.primo, "primo", dest, "pranzo", 1);
      aggiungi(r.secondo, "secondo", dest, "pranzo", 1);
      aggiungi(r.contorno, "contorno", dest, "pranzo", 1);
      aggiungi(r.unico, "unico", dest, "pranzo", 1);
      const dieta = dietaDipendente(r.nome);
      if (dieta) segnaDieta(dest, azienda.id, r.nome, r.reparto || "", dieta.tipoDieta, dieta.note, "pranzo");
    });
    const c = contributo(dest, "pranzo");
    c.coperti += confermati.length;
    c.confermati += confermati.length;
    const stimati = Math.max(0, (COPERTI_STIMA_AZIENDA[indiceGiorno] || 0) - confermati.length);
    if (stimati > 0) {
      PORTATE_STIMA.forEach((categoria) => {
        const lista = menuDelGiorno(menu, indiceGiorno, categoria).filter((id) => PIATTI[id]);
        ripartisci(stimati, lista.length).forEach((q, i) => aggiungi(PIATTI[lista[i]].n, categoria, dest, "pranzo", q));
      });
      c.coperti += stimati;
      c.stimati += stimati;
    }
  }

  const comunita = committenti.find((c) => c.id === "comunita");
  if (comunita) {
    const giornoSett = GIORNI_SETT[indiceGiorno] || "";
    destinazioniDi(comunita, centriComunita).forEach(({ chiave: dest, centro }) => {
      const delCentro = (stanza) => (centro ? stanza === centro : true);
      PASTI_TIPO.forEach((pasto) => {
        const c = contributo(dest, pasto);
        const trasmesse = presenze.filter((r) => r.giorno === giornoSett && r.pasto === pasto && delCentro(r.stanza));
        /* un centro che ha trasmesso tutti assenti ha zero righe ma è confermato:
           non si torna alla stima dei suoi pazienti */
        const trasmessoVuoto = trasmissioni.some((t) => t.giorno === giornoSett && t.pasto === pasto && delCentro(t.reparto));
        if (trasmesse.length || trasmessoVuoto) {
          c.trasmessi += 1;
          trasmesse.forEach((r) => {
            portateServite(r.dieta).forEach((categoria) => aggiungi(r.dieta[categoria], categoria, dest, pasto, 1));
            if (r.tipo_dieta && r.tipo_dieta !== "Standard") {
              segnaDieta(dest, comunita.id, r.nome, r.stanza, r.tipo_dieta, r.note || "", pasto);
            }
          });
          c.coperti += trasmesse.length;
          c.confermati += trasmesse.length;
          return;
        }
        /* stima: le variazioni di presenza e di dieta inviate per quel giorno
           valgono già (un paziente segnato assente non si cucina) */
        PAZIENTI_COMUNITA.forEach((p) => {
          if (!delCentro(p.stanza) || !pastiDi(p).includes(pasto)) return;
          if (presenzaVariata(variazioni, p.id, indiceGiorno, pasto) === false) return;
          const dieta = dietaEffettiva(p, indiceGiorno, pasto, variazioni);
          const portate = portateServite(dieta);
          if (!portate.length) return;
          portate.forEach((categoria) => aggiungi(dieta[categoria], categoria, dest, pasto, 1));
          if (p.tipo_dieta && p.tipo_dieta !== "Standard") {
            segnaDieta(dest, comunita.id, p.nome, p.stanza, p.tipo_dieta, p.note || "", pasto);
          }
          c.coperti += 1;
          c.stimati += 1;
        });
      });
    });
  }

  return { voci: [...voci.values()], contributi, diete: [...diete.values()] };
}

/* nomi dei file scaricati: "Comunità" diventa "Comunita", non "Comunit_" */
const senzaAccenti = (testo) => String(testo || "").normalize("NFD").replace(/[̀-ͯ]/g, "");

/* Stato di una destinazione sul periodo e sui pasti guardati. */
function statoContributo(r) {
  if (r.coperti === 0) {
    if (r.trasmessi > 0) return { testo: "trasmesso, nessun pasto", classe: "p-ok" };
    if (r.chiusi > 0) return { testo: "nessun servizio", classe: "p-neu" };
    return { testo: "in attesa", classe: "p-neu" };
  }
  if (r.stimati === 0) return { testo: "confermato", classe: "p-ok" };
  if (r.confermati === 0) return { testo: "stima", classe: "p-att" };
  return { testo: "in parte stimato", classe: "p-att" };
}

/* Piatti quasi omonimi: la cucina non li somma da sola, li segnala. Si
   confrontano le parole significative (senza articoli e preposizioni, con la
   radice): se le parole di un nome stanno tutte nell'altro, i due nomi si
   somigliano. Si segnala solo quando almeno uno dei due è fuori catalogo, il
   caso tipico dei piatti scritti a mano nelle diete o negli ordini. */
const PAROLE_VUOTE = new Set(["a", "al", "alla", "alle", "allo", "ai", "agli", "all", "di", "del", "della", "delle",
  "dei", "degli", "d", "e", "ed", "con", "in", "il", "la", "lo", "le", "gli", "i", "l", "per", "su", "sul", "sulla"]);
const SINONIMI_PASTA = new Set(["pasta", "penne", "pennette", "fusilli", "spaghetti", "maccheroni", "rigatoni", "sedanini"]);

function radiciNome(nome) {
  return String(nome || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .split(/[^a-z]+/)
    .filter((p) => p && !PAROLE_VUOTE.has(p))
    .map((p) => (SINONIMI_PASTA.has(p) ? "pasta" : p.length > 4 ? p.replace(/[aeiou]$/, "") : p));
}

function nomiSimili(a, b) {
  const ra = radiciNome(a);
  const rb = radiciNome(b);
  if (!ra.length || !rb.length) return false;
  const [corta, lunga] = ra.length <= rb.length ? [ra, rb] : [rb, ra];
  const uguale = (x, y) => x === y || (Math.min(x.length, y.length) >= 4 && (x.startsWith(y) || y.startsWith(x)));
  return corta.every((x) => lunga.some((y) => uguale(x, y)));
}

function piattiSimili(righe) {
  const simili = {};
  righe.forEach((a, i) => righe.slice(i + 1).forEach((b) => {
    if (a.categoria !== b.categoria || (a.idPiatto && b.idPiatto)) return;
    if (a.nome.toLowerCase() === b.nome.toLowerCase() || !nomiSimili(a.nome, b.nome)) return;
    (simili[a.chiave] = simili[a.chiave] || []).push(b.nome);
    (simili[b.chiave] = simili[b.chiave] || []).push(a.nome);
  }));
  return simili;
}

const notaSimili = (nomi) => (nomi && nomi.length
  ? "Nome simile a " + nomi.map((n) => "«" + n + "»").join(", ") + ": verificare se è lo stesso piatto"
  : "");

function Produzione() {
  const st = usaStato();
  const committenti = st.committenti;
  const [vista, setVista] = React.useState("giorno");
  const [giorno, setGiorno] = React.useState(GIORNO_APERTURA);
  const [filtro, setFiltro] = React.useState("tutte");
  const [pasto, setPasto] = React.useState("entrambi");

  /* i piatti delle diete sono testo libero, non codici: per il colore WHP si
     risale all'id di catalogo dal nome. Dipende da st.versione perché PIATTI è
     mutato fuori da React, vedi file.md/11-convenzioni.md */
  const idPerNome = React.useMemo(() => {
    const indice = new Map();
    Object.keys(PIATTI).forEach((id) => indice.set(PIATTI[id].n.trim().toLowerCase(), id));
    return indice;
  }, [st.versione]);

  const pastiScelti = pasto === "entrambi" ? PASTI_TIPO : [pasto];

  /* centri della comunità: anagrafica del committente più quelli che compaiono
     nei pazienti e nelle presenze trasmesse */
  const centriComunita = [...new Set([
    ...PAZIENTI_COMUNITA.map((p) => p.stanza),
    ...st.presenzeTrasmesse.map((r) => r.stanza),
    ...st.trasmissioniCentri.map((t) => t.reparto),
  ].filter(Boolean))];
  const chiaveCentri = centriComunita.join("|");

  const destinazioni = React.useMemo(() => committenti.flatMap((c) =>
    destinazioniDi(c, c.id === "comunita" ? centriComunita : [])), [committenti, chiaveCentri]);

  const giorni = React.useMemo(() => GIORNI_COMUNITA.map((unused, i) => distintaDelGiorno({
    committenti, indiceGiorno: i, menu: st.menu, nominativi: st.nominativiAzienda,
    presenze: st.presenzeTrasmesse, trasmissioni: st.trasmissioniCentri, variazioni: st.variazioni,
    idPerNome, centriComunita,
  })), [committenti, st.menu, st.nominativiAzienda, st.presenzeTrasmesse, st.trasmissioniCentri, st.variazioni, idPerNome, chiaveCentri]);

  const indiciGiornate = vista === "giorno" ? [giorno] : GIORNI_COMUNITA.map((unused, i) => i);
  const filtroCentro = filtro.indexOf("centro:") === 0;
  const dentroFiltro = (d) => {
    if (filtro === "tutte") return true;
    if (filtro.indexOf("tipo:") === 0) return d.committente.tipo === filtro.slice(5);
    if (filtroCentro) return d.chiave === filtro.slice(7);
    return d.committente.id === filtro;
  };

  /* chi segue il centro: gli utenti che trasmettono le presenze e vedono tutti i
     centri, oppure sono assegnati proprio a quello */
  const referentiDi = (d) => (d.committente.tipo === "Comunità"
    ? (st.utenti || [])
      .filter((u) => {
        if (u.attivo === false || u.struttura !== d.committente.id || !d.centro) return false;
        const permessi = ((st.ruoli || []).find((r) => r.id === u.ruolo) || {}).permessi || [];
        return permessi.includes("presenze.trasmetti")
          && (permessi.includes("pazienti.tuttiReparti") || u.reparto === d.centro);
      })
      .map((u) => u.nome)
    : [d.committente.referente].filter(Boolean));

  const vuoto = () => ({ coperti: 0, confermati: 0, stimati: 0, porzioni: 0, trasmessi: 0, chiusi: 0, perPasto: { pranzo: 0, cena: 0 } });
  const somma = (lista) => lista.reduce((t, r) => {
    ["coperti", "confermati", "stimati", "porzioni", "trasmessi", "chiusi"].forEach((k) => { t[k] += r[k]; });
    PASTI_TIPO.forEach((p) => { t.perPasto[p] += r.perPasto[p]; });
    return t;
  }, vuoto());
  const sommaDestinazione = (chiave, indici) => {
    const r = vuoto();
    indici.forEach((i) => {
      const c = giorni[i].contributi.get(chiave) || {};
      pastiScelti.forEach((p) => {
        if (!c[p]) return;
        ["coperti", "confermati", "stimati", "porzioni", "trasmessi", "chiusi"].forEach((k) => { r[k] += c[p][k]; });
        r.perPasto[p] += c[p].coperti;
      });
    });
    return r;
  };

  const righeDest = destinazioni.map((d) => ({
    ...d, dentro: dentroFiltro(d), referenti: referentiDi(d), ...sommaDestinazione(d.chiave, indiciGiornate),
  }));
  const destDentro = righeDest.filter((d) => d.dentro);
  const chiaviDentro = destDentro.map((d) => d.chiave);

  const contributi = committenti.map((c) => {
    const centri = righeDest.filter((d) => d.committente.id === c.id);
    return { c, centri, dentro: centri.some((d) => d.dentro), ...somma(centri) };
  });

  const quota = (v, chiavi) => chiavi.reduce((s, k) =>
    s + pastiScelti.reduce((x, p) => x + ((v.per[k] || {})[p] || 0), 0), 0);

  /* colonne per committente della distinta del giorno: solo quelli del
     perimetro che hanno davvero porzioni */
  const colonne = committenti
    .map((c) => ({ c, chiavi: destDentro.filter((d) => d.committente.id === c.id).map((d) => d.chiave) }))
    .filter((col) => destDentro.some((d) => d.committente.id === col.c.id && d.porzioni > 0));
  const conColonne = vista === "giorno" && colonne.length > 1;

  const unisciVoci = (chiavi, conPerPasto) => {
    const unite = new Map();
    indiciGiornate.forEach((i) => giorni[i].voci.forEach((v) => {
      const q = quota(v, chiavi);
      if (q <= 0) return;
      if (!unite.has(v.chiave)) {
        unite.set(v.chiave, {
          chiave: v.chiave, nome: v.nome, categoria: v.categoria, idPiatto: v.idPiatto, colore: v.colore,
          perStruttura: colonne.map(() => 0), perGiorno: GIORNI_COMUNITA.map(() => 0), perPasto: pastiScelti.map(() => 0), totale: 0,
        });
      }
      const r = unite.get(v.chiave);
      if (!conPerPasto) colonne.forEach((col, k) => { r.perStruttura[k] += quota(v, col.chiavi); });
      if (conPerPasto) pastiScelti.forEach((p, k) => { r.perPasto[k] += chiavi.reduce((s, ch) => s + ((v.per[ch] || {})[p] || 0), 0); });
      r.perGiorno[i] += q;
      r.totale += q;
    }));
    return [...unite.values()].sort(ordinaVoci);
  };

  const righe = unisciVoci(chiaviDentro, false);
  const simili = piattiSimili(righe);
  const coppieSimili = Object.keys(simili).length;

  const massimo = Math.max(1, ...righe.map((v) => v.totale));
  const totale = somma(destDentro);
  const porzioni = righe.reduce((s, v) => s + v.totale, 0);
  const copertiTotali = totale.coperti;
  const copertiAzienda = somma(destDentro.filter((d) => d.committente.tipo === "Azienda")).coperti;
  const copertiComunita = somma(destDentro.filter((d) => d.committente.tipo === "Comunità")).coperti;
  const confermate = destDentro.filter((d) => d.coperti > 0 && d.stimati === 0).length;
  const inAttesa = destDentro.filter((d) => d.coperti === 0).length;
  const copertiPerGiorno = GIORNI_COMUNITA.map((unused, i) =>
    chiaviDentro.reduce((s, k) => s + sommaDestinazione(k, [i]).coperti, 0));

  const nomeCommittente = (id) => (committenti.find((c) => c.id === id) || {}).nome || id;
  const etichettaPasti = (lista) => (lista.length > 1 ? "Pranzo e cena" : ETICHETTA_PASTO[lista[0]] || "");

  const dieteMappa = new Map();
  indiciGiornate.forEach((i) => giorni[i].diete.forEach((d) => {
    if (chiaviDentro.indexOf(d.dest) < 0) return;
    const pastiDentro = d.pasti.filter((p) => pastiScelti.includes(p));
    if (!pastiDentro.length) return;
    if (!dieteMappa.has(d.chiave)) dieteMappa.set(d.chiave, { ...d, pasti: [] });
    const x = dieteMappa.get(d.chiave);
    pastiDentro.forEach((p) => { if (!x.pasti.includes(p)) x.pasti.push(p); });
  }));
  const diete = [...dieteMappa.values()]
    .sort((a, b) => chiaviDentro.indexOf(a.dest) - chiaviDentro.indexOf(b.dest) || a.nome.localeCompare(b.nome, "it"))
    .map((d) => ({
      ...d, committenteNome: nomeCommittente(d.committente),
      pastiTesto: etichettaPasti(PASTI_TIPO.filter((p) => d.pasti.includes(p))),
    }));

  /* variazioni dei centri sul periodo, sul perimetro e sul pasto guardati */
  const variazioni = (st.variazioni || [])
    .filter((v) => indiciGiornate.includes(v.indiceGiorno)
      && (pasto === "entrambi" || v.pasto === pasto || v.pasto === "entrambi")
      && destDentro.some((d) => d.committente.id === v.committenteId && (!filtroCentro || d.centro === v.reparto)))
    .sort((a, b) => a.indiceGiorno - b.indiceGiorno
      || String(a.reparto).localeCompare(String(b.reparto), "it")
      || String(a.creataIl).localeCompare(String(b.creataIl)))
    .map((v) => ({
      id: v.id,
      committenteId: v.committenteId,
      reparto: v.reparto,
      giorno: etichettaGiorno(v.indiceGiorno),
      committente: nomeCommittente(v.committenteId),
      centro: v.reparto || "—",
      pasto: ETICHETTA_PASTO[v.pasto] || v.pasto,
      paziente: v.pazienteNome || "Tutto il centro",
      tipo: ETICHETTA_TIPO_VARIAZIONE[v.tipo] || v.tipo,
      testo: v.testo,
      autore: [v.autore, v.ruoloAutore].filter(Boolean).join(", "),
      inviata: formattaQuando(v.creataIl) || "—",
      presa: v.stato === "presa_in_carico",
      stato: v.stato === "presa_in_carico"
        ? ["Presa in carico", v.presaInCaricoIl && "il " + formattaQuando(v.presaInCaricoIl), v.presaInCaricoDa && "da " + v.presaInCaricoDa].filter(Boolean).join(" ")
        : "Da prendere in carico",
    }));
  const variazioniDaPrendere = variazioni.filter((v) => !v.presa).length;

  /* dettaglio per committente e centro: una scheda per destinazione */
  const dettaglio = destDentro.map((d) => ({
    ...d,
    titolo: d.centro ? d.committente.nome + " · " + d.centro : d.committente.nome,
    stato: statoContributo(d),
    colonnePasto: d.committente.tipo === "Comunità" && pastiScelti.length > 1 ? pastiScelti : [],
    righe: unisciVoci([d.chiave], true),
    diete: diete.filter((x) => x.dest === d.chiave),
    variazioni: variazioni.filter((v) => v.committenteId === d.committente.id && (!d.centro || v.reparto === d.centro)),
  }));

  const giornoCorrente = GIORNI_COMUNITA[giorno];
  const etichettaVista = vista === "giorno" ? etichettaGiorno(giorno) : ETICHETTA_SETTIMANA;
  const etichettaPasto = pasto === "entrambi" ? "pranzo e cena" : pasto;
  const destinazioneFiltro = filtroCentro ? destinazioni.find((d) => d.chiave === filtro.slice(7)) : null;
  const nomeFiltro = filtro === "tutte" ? "Tutte le strutture"
    : filtro === "tipo:Azienda" ? "Solo le aziende"
      : filtro === "tipo:Comunità" ? "Solo le comunità"
        : destinazioneFiltro ? destinazioneFiltro.committente.nome + " · centro " + destinazioneFiltro.centro
          : (committenti.find((c) => c.id === filtro) || {}).nome || "Struttura non in elenco";
  const perimetro = nomeFiltro + " · pasto " + etichettaPasto;
  const etichetteGiorni = GIORNI_COMUNITA.map((g) => g.n + " " + g.breve);
  const nColonne = 3 + (vista === "giorno" ? (conColonne ? colonne.length : 0) : GIORNI_COMUNITA.length) + 1;

  const nomeColore = (v) => (v.colore ? COLORI[v.colore].nome : "fuori catalogo");

  /* Tutto quello che finisce nel PDF e nell'Excel nasce qui, dalle stesse righe
     della pagina: i documenti non ricalcolano nulla. */
  const sezioniDocumento = (chiave) => ORDINE_CATEGORIA
    .map((cat) => ({
      categoria: NOME_CATEGORIA[cat],
      righe: righe.filter((v) => v.categoria === cat).map((v) => ({
        piatto: v.nome,
        colore: nomeColore(v),
        nota: notaSimili(simili[v.chiave]),
        perStruttura: chiave === "perStruttura" && conColonne ? v.perStruttura : [],
        perGiorno: chiave === "perGiorno" ? v.perGiorno : [],
        totale: v.totale,
      })),
    }))
    .filter((sez) => sez.righe.length);

  const totaliDocumento = [
    { etichetta: "Pasti", valore: copertiTotali },
    { etichetta: "Porzioni", valore: porzioni },
    { etichetta: "Diete particolari", valore: diete.length },
    { etichetta: "Variazioni dai centri", valore: variazioni.length },
  ];

  const colonnePastoRiepilogo = pastiScelti.map((p) => ETICHETTA_PASTO[p]);
  const rigaPasti = (d) => ({
    committente: d.committente.nome,
    centro: d.centro || (d.committente.tipo === "Azienda" ? "Consegna unica" : "—"),
    referente: d.referenti.join(", ") || "—",
    perPasto: pastiScelti.map((p) => d.perPasto[p]),
    pasti: d.coperti,
    confermati: d.confermati,
    stimati: d.stimati,
    porzioni: d.porzioni,
    stato: statoContributo(d).testo,
  });
  const pastiPerCentro = {
    colonnePasto: colonnePastoRiepilogo,
    righe: destDentro.map(rigaPasti),
    totale: { ...rigaPasti({ ...totale, committente: { nome: "TOTALE", tipo: "" }, centro: "", referenti: [] }), centro: "", referente: "", stato: "" },
  };

  const destinazioniDocumento = dettaglio.map((d) => ({
    titolo: d.committente.nome,
    centro: d.centro,
    tipo: d.committente.tipo,
    referente: d.referenti.join(", "),
    pasti: d.coperti,
    confermati: d.confermati,
    stimati: d.stimati,
    porzioni: d.porzioni,
    perPasto: pastiScelti.map((p) => ({ pasto: ETICHETTA_PASTO[p], pasti: d.perPasto[p] })),
    stato: d.stato.testo,
    colonnePasto: d.colonnePasto.map((p) => ETICHETTA_PASTO[p]),
    righe: d.righe.map((v) => ({
      categoria: NOME_CATEGORIA[v.categoria] || v.categoria,
      piatto: v.nome,
      colore: nomeColore(v),
      nota: notaSimili(simili[v.chiave]),
      perPasto: d.colonnePasto.length ? v.perPasto : [],
      totale: v.totale,
    })),
    diete: d.diete,
    variazioni: d.variazioni,
  }));

  /* import statico dei generatori: apriDocumento deve restare dentro il gesto
     di click, un await prima dell'apertura farebbe bloccare la scheda */
  function stampaDistinta() {
    try {
      if (vista === "giorno") {
        generaDistintaPDF({
          giorno: giornoCorrente.data,
          perimetro,
          strutture: conColonne ? colonne.map((col) => col.c.nome) : [],
          sezioni: sezioniDocumento("perStruttura"),
          totali: totaliDocumento,
          pastiPerCentro,
          destinazioni: destinazioniDocumento,
          variazioni,
          diete,
          datiAziendali: st.datiAziendali,
          avvisa: st.avvisa,
        });
      } else {
        generaDistintaSettimanaPDF({
          periodo: ETICHETTA_SETTIMANA,
          perimetro,
          giorni: etichetteGiorni,
          sezioni: sezioniDocumento("perGiorno"),
          totali: totaliDocumento,
          pastiPerCentro,
          destinazioni: destinazioniDocumento,
          variazioni,
          diete,
          datiAziendali: st.datiAziendali,
          avvisa: st.avvisa,
        });
      }
      st.logga("Cucina MAVI", "Fornitore", "Distinta di produzione generata",
        etichettaVista + ", " + nomeFiltro + ", " + porzioni + " porzioni", "generico");
    } catch (errore) {
      st.avvisa("Non è stato possibile aprire la distinta: " + errore.message);
    }
  }

  async function scaricaDistinta() {
    try {
      const { scaricaExcel } = await import("../excel.js");
      const titolo = etichettaVista + " · " + perimetro;
      const intestazioni = vista === "giorno"
        ? (conColonne ? colonne.map((col) => col.c.nome) : [])
        : etichetteGiorni;
      const valori = (v) => (vista === "giorno" ? (conColonne ? v.perStruttura : []) : v.perGiorno);
      const dati = righe.map((v) => {
        const riga = {
          portata: NOME_CATEGORIA[v.categoria] || v.categoria,
          piatto: v.nome,
          colore: nomeColore(v),
          totale: v.totale,
          verifica: notaSimili(simili[v.chiave]),
        };
        valori(v).forEach((q, i) => { riga["c" + i] = q; });
        return riga;
      });
      if (dati.length) {
        const riga = { portata: "TOTALE", piatto: "", colore: "", totale: porzioni, verifica: "" };
        intestazioni.forEach((unused, i) => {
          riga["c" + i] = righe.reduce((s, v) => s + (valori(v)[i] || 0), 0);
        });
        dati.push(riga);
      }

      const colonnePasti = pastiScelti.map((p, i) => ({ header: "Pasti " + p, key: "p" + i, width: 13 }));
      const rigaExcelPasti = (r) => {
        const x = {
          committente: r.committente, centro: r.centro, referente: r.referente, pasti: r.pasti,
          confermati: r.confermati, stimati: r.stimati, porzioni: r.porzioni, stato: r.stato,
        };
        r.perPasto.forEach((q, i) => { x["p" + i] = q; });
        return x;
      };
      const datiPasti = pastiPerCentro.righe.map(rigaExcelPasti);
      if (datiPasti.length) datiPasti.push(rigaExcelPasti(pastiPerCentro.totale));

      const colonnePortate = pastiScelti.map((p, i) => ({ header: ETICHETTA_PASTO[p], key: "q" + i, width: 11 }));
      const datiCentri = [];
      dettaglio.forEach((d) => d.righe.forEach((v) => {
        const x = {
          committente: d.committente.nome, centro: d.centro || "Consegna unica",
          portata: NOME_CATEGORIA[v.categoria] || v.categoria, piatto: v.nome, colore: nomeColore(v), totale: v.totale,
        };
        pastiScelti.forEach((p, i) => { x["q" + i] = v.perPasto[i]; });
        datiCentri.push(x);
      }));
      if (datiCentri.length) {
        const riga = { committente: "TOTALE", centro: "", portata: "", piatto: "", colore: "", totale: datiCentri.reduce((s, x) => s + x.totale, 0) };
        pastiScelti.forEach((p, i) => { riga["q" + i] = datiCentri.reduce((s, x) => s + (x["q" + i] || 0), 0); });
        datiCentri.push(riga);
      }

      const nomeFile = "Distinta_" + (vista === "giorno" ? giornoCorrente.data : "settimana_" + GIORNI_COMUNITA[0].data)
        + (filtro === "tutte" ? "" : "_" + senzaAccenti(nomeFiltro).replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, ""))
        + "_" + (pasto === "entrambi" ? "pranzo_e_cena" : pasto) + ".xlsx";

      await scaricaExcel(
        nomeFile,
        [
          {
            nome: "Quantità per piatto",
            titolo,
            colonne: [
              { header: "Portata", key: "portata", width: 18 },
              { header: "Piatto", key: "piatto", width: 34 },
              { header: "Colore WHP", key: "colore", width: 15 },
              ...intestazioni.map((nome, i) => ({ header: nome, key: "c" + i, width: 18 })),
              { header: "Porzioni", key: "totale", width: 12 },
              { header: "Da verificare", key: "verifica", width: 48 },
            ],
            dati,
          },
          {
            nome: "Pasti per centro",
            titolo,
            colonne: [
              { header: "Committente", key: "committente", width: 26 },
              { header: "Centro", key: "centro", width: 24 },
              { header: "Referente", key: "referente", width: 22 },
              ...colonnePasti,
              { header: "Pasti", key: "pasti", width: 10 },
              { header: "Confermati", key: "confermati", width: 12 },
              { header: "Stimati", key: "stimati", width: 10 },
              { header: "Porzioni", key: "porzioni", width: 11 },
              { header: "Stato", key: "stato", width: 18 },
            ],
            dati: datiPasti,
          },
          {
            nome: "Per committente e centro",
            titolo,
            colonne: [
              { header: "Committente", key: "committente", width: 26 },
              { header: "Centro", key: "centro", width: 24 },
              { header: "Portata", key: "portata", width: 18 },
              { header: "Piatto", key: "piatto", width: 34 },
              { header: "Colore WHP", key: "colore", width: 15 },
              ...colonnePortate,
              { header: "Porzioni", key: "totale", width: 11 },
            ],
            dati: datiCentri,
          },
          {
            nome: "Variazioni dai centri",
            titolo,
            colonne: [
              { header: "Giorno", key: "giorno", width: 22 },
              { header: "Committente", key: "committente", width: 24 },
              { header: "Centro", key: "centro", width: 22 },
              { header: "Pasto", key: "pasto", width: 14 },
              { header: "Paziente", key: "paziente", width: 20 },
              { header: "Tipo", key: "tipo", width: 11 },
              { header: "Variazione", key: "testo", width: 60 },
              { header: "Inviata da", key: "autore", width: 30 },
              { header: "Inviata il", key: "inviata", width: 18 },
              { header: "Stato", key: "stato", width: 40 },
            ],
            dati: variazioni,
          },
          {
            nome: "Diete particolari",
            titolo,
            colonne: [
              { header: "Nominativo", key: "nome", width: 24 },
              { header: "Committente", key: "committenteNome", width: 24 },
              { header: "Centro o reparto", key: "reparto", width: 24 },
              { header: "Pasti", key: "pastiTesto", width: 14 },
              { header: "Tipo di dieta", key: "tipoDieta", width: 28 },
              { header: "Note di preparazione", key: "note", width: 60 },
            ],
            dati: diete.map((d) => ({
              nome: d.nome, committenteNome: d.committenteNome, reparto: d.reparto, pastiTesto: d.pastiTesto,
              tipoDieta: d.tipoDieta, note: d.note,
            })),
          },
        ],
        { datiAziendali: st.datiAziendali }
      );
      st.avvisa("Distinta esportata in Excel · " + etichettaVista);
    } catch (errore) {
      st.avvisa("Export Excel non riuscito: " + errore.message);
    }
  }

  return (
    <>
      <Intestazione
        occhiello={vista === "giorno" ? giornoDataIt(giornoCorrente.data) : ETICHETTA_SETTIMANA}
        titolo={"Distinta di produzione · " + etichettaVista}
        sotto="Quanto produrre, un giorno alla volta o sull'intera settimana, sommando quello che arriva dalle strutture servite"
        azioni={st.puo("produzione.stampa") && <>
          <button className="btn linea piccolo" onClick={scaricaDistinta}>
            <Icone.scarica size={16} /> Excel
          </button>
          <button className="btn piccolo" onClick={stampaDistinta}>
            <Icone.stampa size={16} /> Stampa / PDF
          </button>
        </>}
      />
      <div className="tela">
        <div className="dist-barra">
          <div className="commuta">
            <button className={vista === "giorno" ? "on" : ""} onClick={() => setVista("giorno")}>Giorno</button>
            <button className={vista === "settimana" ? "on" : ""} onClick={() => setVista("settimana")}>Settimana</button>
          </div>
          {vista === "giorno" ? (
            <div className="dist-nav">
              <button type="button" title="Giorno precedente" disabled={giorno === 0}
                onClick={() => setGiorno((g) => Math.max(0, g - 1))}>
                <Icone.sx size={17} />
              </button>
              <div className="dist-nav-giorno">
                {etichettaGiorno(giorno)}
                <small>{copertiPerGiorno[giorno]} pasti · {dataIt(giornoCorrente.data)}</small>
              </div>
              <button type="button" title="Giorno successivo" disabled={giorno === GIORNI_COMUNITA.length - 1}
                onClick={() => setGiorno((g) => Math.min(GIORNI_COMUNITA.length - 1, g + 1))}>
                <Icone.dx size={17} />
              </button>
            </div>
          ) : (
            <div className="dist-nav">
              <div className="dist-nav-giorno larga">
                {ETICHETTA_SETTIMANA}
                <small>{GIORNI_COMUNITA.length} giornate, da {GIORNI_COMUNITA[0].n.toLowerCase()} a {GIORNI_COMUNITA[GIORNI_COMUNITA.length - 1].n.toLowerCase()}</small>
              </div>
            </div>
          )}
          {vista === "giorno" && (giornoCorrente.chiuso
            ? <span className="pastiglia p-att stato-chiuso"><Icone.lucchetto size={11} /> ordini chiusi</span>
            : <span className="pastiglia p-ok">ordini aperti</span>
          )}
          <div className="commuta">
            <button className={filtro === "tutte" ? "on" : ""} onClick={() => setFiltro("tutte")}>Tutte</button>
            <button className={filtro === "tipo:Azienda" ? "on" : ""} onClick={() => setFiltro("tipo:Azienda")}>Aziende</button>
            <button className={filtro === "tipo:Comunità" ? "on" : ""} onClick={() => setFiltro("tipo:Comunità")}>Comunità</button>
          </div>
          <div className="commuta">
            <button className={pasto === "pranzo" ? "on" : ""} onClick={() => setPasto("pranzo")}>Pranzo</button>
            <button className={pasto === "cena" ? "on" : ""} onClick={() => setPasto("cena")}>Cena</button>
            <button className={pasto === "entrambi" ? "on" : ""} onClick={() => setPasto("entrambi")}>Entrambi</button>
          </div>
          <span className="dist-nota-barra">L'azienda serve solo il pranzo: con Cena restano le sole comunità.</span>
        </div>

        <div className="numeri">
          <div className="numero">
            <div className="n-lab">Pasti totali</div>
            <div className="n-val">{copertiTotali}</div>
            <div className="n-nota">
              {copertiAzienda} azienda · {copertiComunita} comunità
              {totale.stimati > 0 && <> · <b>{totale.stimati} stimati</b></>}
            </div>
          </div>
          <div className="numero">
            <div className="n-lab">Porzioni da produrre</div>
            <div className="n-val">{porzioni}</div>
            <div className="n-nota">{righe.length} {righe.length === 1 ? "piatto diverso" : "piatti diversi"}</div>
          </div>
          <div className="numero">
            <div className="n-lab">Diete particolari</div>
            <div className="n-val">{diete.length}</div>
            <div className="n-nota">persone con prescrizione o dieta dichiarata</div>
          </div>
          <div className="numero">
            <div className="n-lab">Variazioni dai centri</div>
            <div className="n-val">{variazioni.length}</div>
            <div className="n-nota">
              {variazioniDaPrendere > 0 ? <b>{variazioniDaPrendere} da prendere in carico</b> : "nessuna da prendere in carico"}
              {" "}· presenza e dieta già nelle quantità
            </div>
          </div>
          <div className="numero">
            <div className="n-lab">Destinazioni confermate</div>
            <div className="n-val">{confermate}<span className="n-su">su {destDentro.length}</span></div>
            <div className="n-nota">
              {destDentro.length - confermate === 0
                ? "tutti i pasti sono confermati"
                : [destDentro.length - confermate - inAttesa > 0 && (destDentro.length - confermate - inAttesa) + " con stima",
                  inAttesa > 0 && inAttesa + " in attesa"].filter(Boolean).join(" · ")}
              {" "}(azienda e centri)
            </div>
          </div>
        </div>

        <div className={"dist-banner" + (filtro === "tutte" ? "" : " attivo")}>
          <Icone.calendario size={16} />
          <span>Stai guardando <b>{etichettaVista}</b> · {nomeFiltro} · pasto {etichettaPasto}</span>
          {filtro !== "tutte" && (
            <button className="btn linea piccolo" onClick={() => setFiltro("tutte")}>Mostra tutte</button>
          )}
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Pasti per committente e centro</h2>
            <span className="conta-piatti">{committenti.length} committenti · {destinazioni.length} destinazioni di consegna</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr>
                  <th>Committente e centro</th><th>Tipo</th><th>Referente</th>
                  {pastiScelti.map((p) => <th key={p}>{ETICHETTA_PASTO[p]}</th>)}
                  <th>Pasti</th><th>Porzioni</th><th>Stato</th><th />
                </tr>
              </thead>
              <tbody>
                {contributi.map((r) => {
                  const attivo = filtro === r.c.id;
                  const perCentro = r.c.tipo === "Comunità" && r.centri.some((d) => d.centro);
                  const stato = statoContributo(r);
                  return (
                    <React.Fragment key={r.c.id}>
                      <tr className={r.dentro ? "" : "dist-fuori"} style={{ opacity: r.c.attivo === false ? 0.5 : undefined }}>
                        <td><b>{r.c.nome}</b></td>
                        <td><span className="pastiglia p-neu">{r.c.tipo}</span></td>
                        <td style={{ color: "var(--muto)" }}>
                          {perCentro ? "per centro" : (r.centri[0] && r.centri[0].referenti.join(", ")) || "—"}
                        </td>
                        {pastiScelti.map((p) => <td key={p} className="cifra">{r.perPasto[p]}</td>)}
                        <td className="quantita">{r.coperti}</td>
                        <td className="cifra">{r.porzioni}</td>
                        <td>
                          <span className={"pastiglia " + stato.classe}>{stato.testo}</span>
                          {r.confermati > 0 && r.stimati > 0 && (
                            <span className="dist-piu-stima">{r.confermati} confermati, {r.stimati} stimati</span>
                          )}
                        </td>
                        <td>
                          <button className={"btn piccolo" + (attivo ? "" : " linea")}
                            onClick={() => setFiltro(attivo ? "tutte" : r.c.id)}>
                            {attivo ? "Mostra tutte" : "Filtra questa"}
                          </button>
                        </td>
                      </tr>
                      {perCentro && r.centri.map((d) => {
                        const statoCentro = statoContributo(d);
                        const attivoCentro = filtro === "centro:" + d.chiave;
                        return (
                          <tr key={d.chiave} className={"dist-riga-centro" + (d.dentro ? "" : " dist-fuori")}>
                            <td><span className="dist-freccia">↳</span> {d.centro}</td>
                            <td><span className="pastiglia p-neu">Centro</span></td>
                            <td>{d.referenti.join(", ") || <span className="riservato">nessun referente</span>}</td>
                            {pastiScelti.map((p) => <td key={p} className="cifra">{d.perPasto[p]}</td>)}
                            <td className="quantita">{d.coperti}</td>
                            <td className="cifra">{d.porzioni}</td>
                            <td><span className={"pastiglia " + statoCentro.classe}>{statoCentro.testo}</span></td>
                            <td>
                              <button className={"btn piccolo" + (attivoCentro ? "" : " linea")}
                                onClick={() => setFiltro(attivoCentro ? "tutte" : "centro:" + d.chiave)}>
                                {attivoCentro ? "Mostra tutte" : "Filtra centro"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            I numeri sono quelli del periodo e del pasto scelti qui sopra; le righe in grigio sono fuori dal
            filtro. <b>Confermato</b>: i pasti arrivano da prenotazioni dei dipendenti o da presenze
            trasmesse dal referente. <b>Stima</b>: il centro o l'azienda non ha ancora
            confermato e il portale propone un ordine di grandezza. Ogni centro della comunità riceve i
            suoi pasti: si conferma e si stima centro per centro.
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Quantità da produrre</h2>
            <span className="conta-piatti">
              {vista === "giorno" ? "riepilogo totale della giornata" : "riepilogo totale, porzioni per giornata"}
            </span>
          </div>
          {coppieSimili > 0 && (
            <div className="avviso chiuso dist-avviso">
              <Icone.attenzione size={16} />
              <span>
                <b>{coppieSimili} piatti con un nome quasi uguale a un altro.</b> Il portale non li somma: sono
                segnalati sotto il nome con «da verificare». Chiedere al committente se sono lo stesso piatto.
              </span>
            </div>
          )}
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr>
                  <th>Piatto</th>
                  <th>Portata</th>
                  <th>Colore</th>
                  {vista === "giorno"
                    ? conColonne && colonne.map((col) => <th key={col.c.id}>{col.c.nome}</th>)
                    : etichetteGiorni.map((t) => <th key={t}>{t}</th>)}
                  <th>Porzioni</th>
                </tr>
              </thead>
              <tbody>
                {righe.length === 0 ? (
                  <tr>
                    <td className="riga-vuota" colSpan={nColonne}>
                      Nessuna porzione da produrre con il perimetro scelto.
                    </td>
                  </tr>
                ) : righe.map((v) => (
                  <tr key={v.chiave}>
                    <td>
                      <div className="dist-piatto">
                        {v.idPiatto ? (
                          <span className="voce-mini" style={{ cursor: "default" }}><Illustrazione id={v.idPiatto} /></span>
                        ) : (
                          <span className="dist-senza-scheda" title="Piatto di dieta, non presente nel catalogo">—</span>
                        )}
                        <div>
                          <b>{v.nome}</b>
                          {simili[v.chiave] && (
                            <span className="dist-simile">
                              <span className="pastiglia p-att">da verificare</span> {notaSimili(simili[v.chiave])}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><span className="pastiglia p-neu">{NOME_CATEGORIA[v.categoria] || v.categoria}</span></td>
                    <td>
                      {v.colore ? (
                        <span className="dist-colore">
                          <DiscoColore colore={v.colore} size={11} />
                          {COLORI[v.colore].nome}
                        </span>
                      ) : <span className="riservato">fuori catalogo</span>}
                    </td>
                    {vista === "giorno"
                      ? conColonne && colonne.map((col, k) => <td key={col.c.id} className="cifra">{v.perStruttura[k]}</td>)
                      : v.perGiorno.map((q, i) => <td key={etichetteGiorni[i]} className="cifra">{q}</td>)}
                    <td className="dist-totale">
                      <span className="quantita">{v.totale}</span>
                      <div className="progresso"><i style={{ width: Math.round((v.totale / massimo) * 100) + "%" }} /></div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {righe.length > 0 && (
                <tfoot>
                  <tr className="dist-riga-totale">
                    <td colSpan={3}><b>Totale porzioni</b></td>
                    {vista === "giorno"
                      ? conColonne && colonne.map((col, k) => (
                        <td key={col.c.id} className="cifra"><b>{righe.reduce((s, v) => s + v.perStruttura[k], 0)}</b></td>
                      ))
                      : etichetteGiorni.map((t, i) => (
                        <td key={t} className="cifra"><b>{righe.reduce((s, v) => s + v.perGiorno[i], 0)}</b></td>
                      ))}
                    <td><span className="quantita">{porzioni}</span></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          <div className="pannello-piede">
            La cucina lavora sulla somma del perimetro scelto. Per l'azienda entrano le prenotazioni
            confermate dai dipendenti su quella giornata e, per i coperti che mancano, una stima sul menu
            del giorno; per la comunità, centro per centro, le presenze trasmesse dal referente per quel
            giorno e quel pasto, o in mancanza le diete dei pazienti del centro. Il dettaglio per
            destinazione è subito sotto.
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Dettaglio per committente e centro</h2>
            <span className="conta-piatti">
              {dettaglio.length} {dettaglio.length === 1 ? "destinazione" : "destinazioni"} di consegna · una scheda ciascuna nella stampa
            </span>
          </div>
          {dettaglio.length === 0 ? (
            <div className="dist-dest-vuoto">Nessuna destinazione nel perimetro scelto.</div>
          ) : (
            <div className="dist-dest-griglia">
              {dettaglio.map((d) => (
                <section key={d.chiave} className="dist-dest">
                  <header className="dist-dest-testa">
                    <div>
                      <div className="dist-dest-committente">{d.committente.nome} · {d.committente.tipo}</div>
                      <h3>{d.centro || (d.committente.tipo === "Azienda" ? "Consegna unica" : d.committente.nome)}</h3>
                      <div className="dist-dest-referente">
                        {d.referenti.length ? "Referente: " + d.referenti.join(", ") : "Nessun referente indicato"}
                      </div>
                    </div>
                    <div className="dist-dest-numeri">
                      <span><span className="quantita">{d.coperti}</span> {d.coperti === 1 ? "pasto" : "pasti"}</span>
                      <small>
                        {pastiScelti.length > 1 && d.committente.tipo === "Comunità"
                          ? "pranzo " + d.perPasto.pranzo + " · cena " + d.perPasto.cena + " · "
                          : ""}
                        {d.porzioni} porzioni
                      </small>
                      <span className={"pastiglia " + d.stato.classe}>{d.stato.testo}</span>
                    </div>
                  </header>
                  {d.righe.length === 0 ? (
                    <div className="dist-dest-vuoto">Nessun pasto per questa destinazione nel periodo e nel pasto scelti.</div>
                  ) : (
                    <table className="dati dist-dest-tabella">
                      <thead>
                        <tr>
                          <th>Piatto</th>
                          {d.colonnePasto.map((p) => <th key={p} className="cifra">{ETICHETTA_PASTO[p]}</th>)}
                          <th className="cifra">Porzioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.righe.map((v) => (
                          <tr key={v.chiave}>
                            <td>
                              {v.nome}
                              <small className="dist-dest-portata">{NOME_CATEGORIA[v.categoria] || v.categoria}</small>
                            </td>
                            {d.colonnePasto.map((p, k) => <td key={p} className="cifra">{v.perPasto[k]}</td>)}
                            <td className="cifra"><b>{v.totale}</b></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {(d.diete.length > 0 || d.variazioni.length > 0) && (
                    <div className="dist-dest-note">
                      {d.diete.length > 0 && (
                        <div><b>Diete:</b> {d.diete.map((x) => x.nome + " (" + x.tipoDieta + ")").join("; ")}</div>
                      )}
                      {d.variazioni.length > 0 && (
                        <div>
                          <b>Variazioni:</b> {d.variazioni.length} dal centro
                          {d.variazioni.some((v) => !v.presa) && <>, <b>{d.variazioni.filter((v) => !v.presa).length} da prendere in carico</b></>}
                          {" "}(vedi sotto)
                        </div>
                      )}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
          <div className="pannello-piede">
            Una scheda per ogni destinazione di consegna: l'azienda riceve un solo carico, ogni centro della
            comunità il suo. Le porzioni delle schede sommano esattamente il riepilogo totale qui sopra.
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Variazioni dai centri</h2>
            <span className="conta-piatti">
              {variazioni.length} {variazioni.length === 1 ? "variazione" : "variazioni"}
              {variazioniDaPrendere > 0 ? " · " + variazioniDaPrendere + " da prendere in carico" : ""}
            </span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr>
                  {vista === "settimana" && <th>Giorno</th>}
                  <th>Centro</th><th>Pasto</th><th>Paziente</th><th>Tipo</th><th>Variazione</th><th>Inviata da</th><th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {variazioni.length === 0 ? (
                  <tr>
                    <td className="riga-vuota" colSpan={vista === "settimana" ? 8 : 7}>
                      Nessuna variazione dai centri per il periodo, il perimetro e il pasto scelti.
                    </td>
                  </tr>
                ) : variazioni.map((v) => (
                  <tr key={v.id}>
                    {vista === "settimana" && <td style={{ whiteSpace: "nowrap" }}>{v.giorno}</td>}
                    <td><b>{v.centro}</b><small className="dist-dest-portata">{v.committente}</small></td>
                    <td>{v.pasto}</td>
                    <td>{v.paziente}</td>
                    <td><span className="pastiglia p-neu">{v.tipo}</span></td>
                    <td className="dist-testo-variazione">{v.testo}</td>
                    <td style={{ color: "var(--muto)" }}>{v.autore}<small className="dist-dest-portata">{v.inviata}</small></td>
                    <td>
                      <span className={"pastiglia " + (v.presa ? "p-ok" : "p-att")}>{v.presa ? "presa in carico" : "da prendere in carico"}</span>
                      {v.presa && <small className="dist-dest-portata">{v.stato.replace(/^Presa in carico ?/, "")}</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Le scrive il referente. Quelle di <b>presenza e dieta di un paziente sono già conteggiate nelle
            quantità</b> di quel giorno; quelle <b>Altro</b> (ospiti in più, avvisi generali) la cucina le applica a
            mano, dopo averle prese in carico da Ordini in arrivo. Compaiono anche nella stampa e
            nell'Excel della distinta.
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Diete particolari e consistenze</h2>
            <span className="conta-piatti">{diete.length} {diete.length === 1 ? "persona" : "persone"}</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr><th>Nominativo</th><th>Committente</th><th>Centro o reparto</th><th>Pasti</th><th>Tipo di dieta</th><th>Note di preparazione</th></tr>
              </thead>
              <tbody>
                {diete.length === 0 ? (
                  <tr>
                    <td className="riga-vuota" colSpan={6}>
                      Nessuna dieta particolare fra le persone comprese nel perimetro.
                    </td>
                  </tr>
                ) : diete.map((d) => (
                  <tr key={d.chiave}>
                    <td><b>{d.nome}</b></td>
                    <td style={{ color: "var(--muto)" }}>{d.committenteNome}</td>
                    <td style={{ color: "var(--muto)" }}>{d.reparto || "—"}</td>
                    <td>{d.pastiTesto}</td>
                    <td><span className="pastiglia p-att dist-tag-dieta">{d.tipoDieta}</span></td>
                    <td>{d.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Le note arrivano dall'anagrafica dei pazienti della comunità e dalla dieta dichiarata in
            anagrafica dipendenti. Le prescrizioni riservate restano tali: il portale segnala che
            ci sono, non che cosa contengono. La stessa tabella finisce nella stampa e nell'Excel.
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== menu della settimana, editabile ==================== */
function Settimana() {
  const st = usaStato();
  const [giorno, setGiorno] = React.useState(() => primoAperto(GIORNI));
  const [categoria, setCategoria] = React.useState("primo");
  const [cerca, setCerca] = React.useState("");
  const [stampa, setStampa] = React.useState(false);
  const SETTIMANE = [
    "Settimana 35, 24 · 28 agosto 2026",
    "Settimana 36, 31 agosto · 4 settembre 2026",
    "Settimana 37, 7 · 11 settembre 2026",
    "Settimana 38, 14 · 18 settembre 2026",
  ];
  const [settimanaIdx, setSettimanaIdx] = React.useState(SETTIMANE.length - 1); // settimana coperta da GIORNI/menu reale

  /* il menu di un giorno chiuso è quello già ordinato: si consulta, non si cambia */
  const giornoChiuso = GIORNI[giorno].chiuso;
  const puoModificare = st.puo("menu.modifica") && !giornoChiuso;
  const puoFissi = st.puo("menu.fissi") && !giornoChiuso;
  const fissi = st.menu.fissi[categoria] || [];
  const delGiorno = (st.menu.variabili[giorno] || {})[categoria] || [];
  const cat = CATEGORIE.find((c) => c.id === categoria);

  const catalogo = catalogoPerCategoria(categoria)
    .filter((id) => PIATTI[id].n.toLowerCase().includes(cerca.toLowerCase()));

  /* un piatto fisso vale per tutti i giorni: se era nel giorno corrente va
     prima tolto, altrimenti resterebbe in elenco due volte */
  const rendiFisso = (id) => {
    if (delGiorno.includes(id)) st.cambiaMenu(giorno, categoria, id);
    st.cambiaMenu("fissi", categoria, id);
  };

  if (stampa) return <GrigliaStampa onIndietro={() => setStampa(false)} />;

  return (
    <>
      <Intestazione
        occhiello={SETTIMANE[settimanaIdx]}
        titolo="Composizione del menu"
        sotto="Scegli il giorno, poi la portata. I piatti si aggiungono dal catalogo a destra."
        azioni={<>
          {st.puo("menu.modifica") && <button className="btn linea piccolo" onClick={st.ripristinaMenu}>Ripristina</button>}
          {st.puo("menu.griglia") && (
            <button className="btn linea piccolo" onClick={() => setStampa(true)}>
              <Icone.calendario size={16} /> Griglia settimana
            </button>
          )}
          {st.puo("menu.modifica") && (
            <button className="btn piccolo" onClick={() => st.avvisa("Menu pubblicato, i dipendenti lo vedono da subito")}>
              Pubblica
            </button>
          )}
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
            <button key={g.n} className={(i === giorno ? "on" : "") + (g.chiuso ? " chiuso" : "")} onClick={() => setGiorno(i)}>
              {g.chiuso && <Icone.lucchetto size={12} />}{g.n}<span>{g.chiuso ? "chiuso · " + g.breve : g.d}</span>
            </button>
          ))}
        </div>

        {giornoChiuso && st.puo("menu.modifica") && (
          <div className="avviso chiuso" style={{ marginBottom: 18 }}>
            <Icone.lucchetto size={16} />
            <span>
              Gli ordini di {GIORNI[giorno].n.toLowerCase()} {GIORNI[giorno].d} sono chiusi: il menu è quello già
              prenotato e resta in sola lettura. Si compone dai giorni ancora aperti.
            </span>
          </div>
        )}

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
                    {puoModificare && (
                      <button className={"btn piccolo" + (attiva ? "" : " linea")} onClick={() => setCategoria(c.id)}>
                        {attiva ? "In modifica" : "Modifica"}
                      </button>
                    )}
                  </div>
                  {lista.length + fis.length === 0 ? (
                    <div className="blocco-lista vuota">Nessun piatto previsto per questa portata.</div>
                  ) : (
                    <ListaOrdinabile
                      giorno={giorno}
                      categoria={c.id}
                      variabili={lista}
                      fissi={fis}
                      modificabile={puoModificare}
                      puoFissi={puoFissi}
                    />
                  )}
                </section>
              );
            })}
          </div>

          {puoModificare && <aside className="catalogo-lato">
            <div className="catalogo-testa">
              <div className="occhiello">{GIORNI[giorno].n} {GIORNI[giorno].d}</div>
              <h3>{cat.nome}</h3>
              <p>Aggiungi il piatto solo a questo giorno, oppure rendilo fisso per tutta la settimana.</p>
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
              {catalogo.map((id) => {
                const nelGiorno = delGiorno.includes(id);
                const eFisso = fissi.includes(id);
                return (
                  <div key={id} className={"catalogo-voce" + (eFisso || nelGiorno ? " in-uso" : "")}>
                    <span className="disco"><Illustrazione id={id} /></span>
                    <span className="corpo">
                      <b>{PIATTI[id].n}</b>
                      <span>
                        {COLORI[PIATTI[id].col].nome} · {PIATTI[id].kcal} kcal
                        {PIATTI[id].a.length ? " · allergeni " + PIATTI[id].a.join(", ") : ""}
                      </span>
                    </span>
                    {eFisso && <span className="etichetta-fisso">fisso</span>}
                    <span className="catalogo-azioni">
                      <button
                        className="cat-azione"
                        onClick={() => st.cambiaMenu(giorno, categoria, id)}
                        disabled={nelGiorno || eFisso}
                      >
                        {eFisso ? "In tutti i giorni" : nelGiorno ? "Già in questo giorno" : "Aggiungi al giorno"}
                      </button>
                      {puoFissi && (
                        <button
                          className="cat-azione forte"
                          onClick={() => rendiFisso(id)}
                          disabled={eFisso}
                        >
                          {eFisso ? "Già fisso" : "Rendi fisso"}
                        </button>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="scelta-piede catalogo-nota">
              Un piatto fisso compare in tutti i giorni della settimana, su ogni portale.
            </div>
          </aside>}
        </div>
      </div>
    </>
  );
}

function ListaOrdinabile({ giorno, categoria, variabili, fissi, modificabile = true, puoFissi = true }) {
  const st = usaStato();
  const [trascinato, setTrascinato] = React.useState(null);
  /* stessa deduplica di menuDelGiorno: un piatto presente in entrambi gli
     elenchi si mostra una volta sola, come riga del giorno */
  const soloFissi = fissi.filter((id) => !variabili.includes(id));
  return (
    <div className="blocco-lista">
      {variabili.map((id, i) => (
        <RigaPiatto
          key={id}
          id={id}
          indice={i}
          trascinato={trascinato}
          setTrascinato={setTrascinato}
          onSposta={modificabile ? (da, a) => {
            if (a < 0 || a >= variabili.length) return;
            st.riordinaMenu(giorno, categoria, da, a);
          } : undefined}
          onTogli={modificabile ? () => st.cambiaMenu(giorno, categoria, id) : undefined}
          onRendiFisso={modificabile && puoFissi ? () => {
            st.cambiaMenu(giorno, categoria, id);
            st.cambiaMenu("fissi", categoria, id);
          } : undefined}
        />
      ))}
      {soloFissi.map((id) => (
        <RigaPiatto key={id} id={id} fisso indice={-1}
          onTogli={modificabile && puoFissi ? () => st.cambiaMenu("fissi", categoria, id) : undefined} />
      ))}
    </div>
  );
}

function RigaPiatto({ id, fisso, indice, onTogli, onRendiFisso, onSposta, trascinato, setTrascinato }) {
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
      {typeof onRendiFisso === "function" && (
        <button className="rendi-fisso" onClick={onRendiFisso} title="vale per tutti i giorni della settimana">
          Rendi fisso
        </button>
      )}
      {typeof onTogli === "function" && (
        <button className="tolgo" onClick={onTogli} aria-label="togli dal menu"><Icone.x size={15} /></button>
      )}
    </div>
  );
}

function GrigliaStampa({ onIndietro }) {
  const st = usaStato();
  return (
    <>
      <Intestazione
        occhiello="Settimana 38" titolo="Griglia della settimana"
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
        azioni={st.puo("catalogo.modifica") && <>
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
                        {st.puo("catalogo.modifica") && <>
                          <button className="btn linea piccolo"
                            onClick={() => { setInCorso(id); setTimeout(() => inputSingolo.current.click(), 0); }}>
                            Foto
                          </button>
                          {st.foto[id] && (
                            <button className="btn linea piccolo" onClick={() => st.togliFoto(id)}>Togli</button>
                          )}
                          <button className="btn linea piccolo" onClick={() => setModulo({ id })}>Modifica</button>
                        </>}
                        <button className="btn linea piccolo" onClick={() => schedaPdf(id, { datiAziendali: st.datiAziendali, avvisa: st.avvisa })}>Scheda</button>
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

/* ==================== fatturazione — proforma create a mano ==================== */
const MESI = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

function eurIt(n) {
  return (Number(n) || 0).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* il periodo da fatturare è il mese appena chiuso */
function meseChiuso() {
  const oggi = new Date();
  const prec = new Date(oggi.getFullYear(), oggi.getMonth() - 1, 1);
  return { mese: MESI[prec.getMonth()], anno: prec.getFullYear() };
}

function Fatturazione() {
  const st = usaStato();
  const [attivo, setAttivo] = React.useState(st.committenti[0]?.id);
  const [nuova, setNuova] = React.useState(false);

  const c = st.committenti.find((x) => x.id === attivo) || st.committenti[0];

  /* riepilogo per committente: quello che si è davvero emesso, non una stima */
  const righe = React.useMemo(() => st.committenti.map((x) => {
    const elenco = ordinaProforme(st.proforme.filter((p) => p.committenteId === x.id));
    const valide = elenco.filter(proformaValida);
    const somma = valide.reduce((s, p) => {
      const t = totaliProforma(p);
      return { imponibile: s.imponibile + t.imponibile, iva: s.iva + t.iva, totale: s.totale + t.totale };
    }, { imponibile: 0, iva: 0, totale: 0 });
    return { c: x, elenco, valide, somma, ultima: elenco[0] || null };
  }), [st.committenti, st.proforme]);

  const r = righe.find((x) => x.c.id === attivo) || righe[0];
  const totImponibile = righe.reduce((s, x) => s + x.somma.imponibile, 0);
  const totIva = righe.reduce((s, x) => s + x.somma.iva, 0);
  const totProforme = righe.reduce((s, x) => s + x.valide.length, 0);

  function apriPdf(p) {
    const dest = st.committenti.find((x) => x.id === p.committenteId);
    generaProformaPDF(p, { datiAziendali: st.datiAziendali, committente: dest, avvisa: st.avvisa });
  }

  /* emissione e apertura del PDF nello stesso gesto di click: nessun await in
     mezzo, altrimenti il browser considera la scheda un popup e la blocca */
  function emetti(dati) {
    const p = st.emettiProforma({ ...dati, committenteId: c.id, nomeCommittente: c.nome });
    generaProformaPDF(p, { datiAziendali: st.datiAziendali, committente: c, avvisa: st.avvisa });
    st.avvisa("Proforma " + p.numero + " emessa per " + c.nome);
    setNuova(false);
  }

  const COLONNE_ELENCO = [
    { header: "Numero", key: "numero", width: 16 },
    { header: "Periodo", key: "periodo", width: 16 },
    { header: "Emissione", key: "emissione", width: 14 },
    { header: "Scadenza", key: "scadenza", width: 14 },
    { header: "Imponibile", key: "imponibile", width: 16 },
    { header: "IVA", key: "iva", width: 14 },
    { header: "Totale", key: "totale", width: 16 },
    { header: "Stato", key: "stato", width: 14 },
  ];
  const COLONNE_RIEPILOGO = [
    { header: "Struttura", key: "struttura", width: 28 },
    { header: "Tipo", key: "tipo", width: 14 },
    { header: "Termini", key: "termini", width: 18 },
    { header: "Metodo", key: "metodo", width: 20 },
    { header: "Regime IVA", key: "regime", width: 18 },
    { header: "Proforma", key: "proforma", width: 12 },
    { header: "Imponibile", key: "imponibile", width: 16 },
    { header: "IVA", key: "iva", width: 14 },
    { header: "Totale", key: "totale", width: 16 },
    { header: "Ultima scadenza", key: "scadenza", width: 18 },
  ];

  async function scaricaExcelStruttura(x) {
    try {
      const { scaricaExcel } = await import("../excel.js");
      const dati = x.elenco.map((p) => {
        const t = totaliProforma(p);
        return {
          numero: p.numero, periodo: p.periodo, emissione: dataIt(p.dataEmissione), scadenza: dataIt(p.scadenza),
          imponibile: "€ " + eurIt(t.imponibile), iva: "€ " + eurIt(t.iva), totale: "€ " + eurIt(t.totale),
          stato: statoProforma(p.stato).etichetta,
        };
      });
      dati.push({
        numero: "", periodo: "", emissione: "", scadenza: "TOTALE",
        imponibile: "€ " + eurIt(x.somma.imponibile), iva: "€ " + eurIt(x.somma.iva),
        totale: "€ " + eurIt(x.somma.totale), stato: x.valide.length + " valide",
      });
      await scaricaExcel("Proforma_" + senzaAccenti(x.c.nome).replace(/[^a-zA-Z0-9]+/g, "_") + ".xlsx",
        [{ nome: "Proforma", dati, colonne: COLONNE_ELENCO }], { datiAziendali: st.datiAziendali });
      st.avvisa("Excel di " + x.c.nome + " scaricato");
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nella generazione, riprova");
    }
  }

  async function scaricaExcelTutte() {
    try {
      const { scaricaExcel } = await import("../excel.js");
      const dati = righe.map((x) => ({
        struttura: x.c.nome, tipo: x.c.tipo,
        termini: terminiPagamento(x.c.termini).nome,
        metodo: metodoPagamento(x.c.metodoPagamento).nome,
        regime: regimeIva(x.c.regimeIva).conIva ? "IVA " + (x.c.ivaPercentuale || 0) + "%" : regimeIva(x.c.regimeIva).nome,
        proforma: x.valide.length,
        imponibile: "€ " + eurIt(x.somma.imponibile), iva: "€ " + eurIt(x.somma.iva),
        totale: "€ " + eurIt(x.somma.totale),
        scadenza: x.ultima ? dataIt(x.ultima.scadenza) : "—",
      }));
      dati.push({
        struttura: "", tipo: "", termini: "", metodo: "", regime: "TOTALE", proforma: totProforme,
        imponibile: "€ " + eurIt(totImponibile), iva: "€ " + eurIt(totIva),
        totale: "€ " + eurIt(totImponibile + totIva), scadenza: "",
      });
      await scaricaExcel("Proforma_MAVI_riepilogo.xlsx",
        [{ nome: "Riepilogo", dati, colonne: COLONNE_RIEPILOGO }], { datiAziendali: st.datiAziendali });
      st.avvisa("Excel scaricato, un rigo per committente più il totale");
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nella generazione, riprova");
    }
  }

  if (!r) return null;

  return (
    <>
      <Intestazione
        occhiello="Chiusura mensile" titolo="Proforma"
        sotto="Ogni proforma si compone a mano: righe, periodo e condizioni si decidono documento per documento"
      />
      <div className="tela">
        <div className="giorni-tab">
          {righe.map((x) => (
            <button key={x.c.id} className={attivo === x.c.id ? "on" : ""} onClick={() => setAttivo(x.c.id)}>
              {x.c.tipo}<span>{x.c.nome}</span>
            </button>
          ))}
        </div>

        <div className="numeri">
          <div className="numero"><div className="n-lab">Proforma emesse</div><div className="n-val">{r.valide.length}</div><div className="n-nota">{r.valide.filter((p) => p.stato === "pagata").length} pagate · {r.valide.filter((p) => p.stato === "emessa").length} non pagate · {r.elenco.length - r.valide.length} annullate o stornate</div></div>
          <div className="numero"><div className="n-lab">Imponibile</div><div className="n-val" style={{ fontSize: 22 }}>€ {eurIt(r.somma.imponibile)}</div><div className="n-nota">IVA € {eurIt(r.somma.iva)}</div></div>
          <div className="numero"><div className="n-lab">Totale documenti</div><div className="n-val" style={{ fontSize: 22 }}>€ {eurIt(r.somma.totale)}</div><div className="n-nota">{r.c.nome}</div></div>
          <div className="numero"><div className="n-lab">Prezzo unitario</div><div className="n-val" style={{ fontSize: 22 }}>€ {eurIt(r.c.prezzoUnitario)}</div><div className="n-nota">{testoCondizioni(r.c)}</div></div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Proforma di {r.c.nome}</h2>
            <span className="conta-piatti">{r.elenco.length} documenti</span>
            {st.puo("fatturazione.proforma") && (
              <button className="btn piccolo" style={{ marginLeft: "auto" }} onClick={() => setNuova(true)}>
                <Icone.piu size={14} /> Nuova proforma
              </button>
            )}
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Documento</th><th>Imponibile</th><th>IVA</th><th>Totale</th><th>Scadenza</th><th>Stato</th><th /></tr></thead>
              <tbody>
                {r.elenco.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muto)", padding: 22 }}>
                    Nessuna proforma per questo committente. Creane una con "Nuova proforma".
                  </td></tr>
                )}
                {r.elenco.map((p) => {
                  const t = totaliProforma(p);
                  const annullata = !proformaValida(p);
                  return (
                    <tr key={p.id} className={annullata ? "riga-annullata" : undefined}>
                      <td>
                        <b className="cifra" style={{ whiteSpace: "nowrap" }}>{p.numero}</b>
                        <div style={{ fontSize: 11.5, color: "var(--muto)" }}>{p.periodo} · emessa il {dataIt(p.dataEmissione)}</div>
                      </td>
                      <td className="cifra">€ {eurIt(t.imponibile)}</td>
                      <td className="cifra">€ {eurIt(t.iva)}{t.conIva && <span style={{ color: "var(--muto)", fontSize: 11 }}> ({t.aliquota}%)</span>}</td>
                      <td className="cifra"><b>€ {eurIt(t.totale)}</b></td>
                      <td className="cifra">{dataIt(p.scadenza)}</td>
                      <td><PastigliaProforma stato={p.stato} /></td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <button className="btn linea piccolo" onClick={() => apriPdf(p)}>PDF</button>
                          {/* non pagata: si segna pagata, si storna o si annulla; pagata: si storna */}
                          {p.stato === "emessa" && st.puo("fatturazione.pagamenti") && (
                            <button className="btn piccolo" onClick={() => st.segnaPagataProforma(p.id)}>Segna pagata</button>
                          )}
                          {!annullata && st.puo("fatturazione.storna") && (
                            <button className="btn linea piccolo" onClick={() => st.stornaProforma(p.id)}>Storna</button>
                          )}
                          {p.stato === "emessa" && st.puo("fatturazione.annulla") && (
                            <button className="btn linea piccolo" onClick={() => st.annullaProforma(p.id)}>Annulla</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ flex: 1 }}>
              Le condizioni proposte arrivano da <b>Impostazioni per committente</b> e restano modificabili
              per la singola proforma. Lo stato (non pagata, pagata, annullata, stornata) è stampato
              anche sul PDF. Annullate e stornate restano in elenco, anche per il cliente, ma fuori dai totali.
            </span>
            {st.puo("fatturazione.excel") && (
              <button className="btn linea piccolo" onClick={() => scaricaExcelStruttura(r)}><Icone.scarica size={16} /> Scarica Excel</button>
            )}
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Tutte le strutture</h2>
            <span className="conta-piatti">{righe.length} committenti, {totProforme} proforma valide</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Struttura</th><th>Condizioni</th><th>Regime IVA</th><th>Proforma</th><th>Imponibile</th><th>IVA</th><th>Totale</th><th>Ultima scadenza</th><th /></tr></thead>
              <tbody>
                {righe.map((x) => {
                  const regime = regimeIva(x.c.regimeIva);
                  return (
                    <tr key={x.c.id} style={x.c.id === attivo ? { background: "var(--carta)" } : undefined}>
                      <td><b>{x.c.nome}</b><div style={{ fontSize: 11, color: "var(--muto)" }}>{x.c.tipo}</div></td>
                      <td>
                        {terminiPagamento(x.c.termini).nome}
                        <div style={{ fontSize: 11, color: "var(--muto)" }}>{metodoPagamento(x.c.metodoPagamento).nome}</div>
                      </td>
                      <td>{regime.conIva ? "IVA " + (x.c.ivaPercentuale || 0) + "%" : <span className="pastiglia p-neu">senza IVA</span>}</td>
                      <td className="quantita">{x.valide.length}</td>
                      <td className="cifra">€ {eurIt(x.somma.imponibile)}</td>
                      <td className="cifra">€ {eurIt(x.somma.iva)}</td>
                      <td className="cifra"><b>€ {eurIt(x.somma.totale)}</b></td>
                      <td className="cifra">{x.ultima ? dataIt(x.ultima.scadenza) : "—"}</td>
                      <td><button className="btn linea piccolo" onClick={() => setAttivo(x.c.id)}>Apri</button></td>
                    </tr>
                  );
                })}
                <tr className="riga-totale">
                  <td colSpan={3}><b>Totale</b></td>
                  <td className="quantita">{totProforme}</td>
                  <td className="cifra">€ {eurIt(totImponibile)}</td>
                  <td className="cifra">€ {eurIt(totIva)}</td>
                  <td className="cifra"><b>€ {eurIt(totImponibile + totIva)}</b></td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
          <div className="pannello-piede" style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
            <span style={{ flex: 1 }}>Riepilogo di quello che è stato emesso, annullate e stornate escluse dai totali.</span>
            {st.puo("fatturazione.excel") && (
              <button className="btn linea piccolo" onClick={scaricaExcelTutte}><Icone.scarica size={16} /> Excel di tutte</button>
            )}
          </div>
        </div>
      </div>

      {nuova && <ModuloProforma committente={r.c} datiAziendali={st.datiAziendali} onChiudi={() => setNuova(false)} onEmetti={emetti} />}
    </>
  );
}

/* ==================== nuova proforma, righe e condizioni a mano ==================== */
function ModuloProforma({ committente, datiAziendali, onChiudi, onEmetti }) {
  const iniziale = meseChiuso();
  const periodoIniziale = iniziale.mese + " " + iniziale.anno;
  const regimeCommittente = regimeIva(committente.regimeIva);

  const [mese, setMese] = React.useState(iniziale.mese);
  const [anno, setAnno] = React.useState(iniziale.anno);
  /* un committente appena creato non ha uno storico: si parte dai pasti
     stimati al giorno per ventidue giorni lavorativi, poi si corregge a mano */
  const pastiProposti = committente.pastiMeseDemo != null
    ? committente.pastiMeseDemo
    : Math.round((committente.pasti || 0) * 22);
  const [righe, setRighe] = React.useState(() => [{
    descrizione: "Pasti " + periodoIniziale,
    quantita: pastiProposti,
    prezzo: committente.prezzoUnitario || 0,
  }]);
  const [termini, setTermini] = React.useState(committente.termini || "");
  const [metodo, setMetodo] = React.useState(committente.metodoPagamento || "bonifico");
  const [regime, setRegime] = React.useState(regimeCommittente.id);
  const [aliquota, setAliquota] = React.useState(regimeCommittente.conIva ? (committente.ivaPercentuale || 0) : 10);
  const [dicitura, setDicitura] = React.useState(committente.dicituraIva || regimeCommittente.dicitura);
  const [note, setNote] = React.useState("");

  const periodo = mese + " " + anno;
  const conIva = regimeIva(regime).conIva;
  const totali = totaliProforma({ righe, regimeIva: regime, aliquota });
  const scadenza = scadenzaPagamento(new Date(), termini);
  const valido = !!termini && righe.some((r) => r.descrizione.trim() && (Number(r.quantita) || 0) > 0);

  /* cambiando periodo si riscrive la descrizione solo delle righe rimaste
     quelle proposte: una riga scritta a mano non va toccata */
  function cambiaPeriodo(nuovoMese, nuovoAnno) {
    const vecchia = "Pasti " + mese + " " + anno;
    const nuovaDescrizione = "Pasti " + nuovoMese + " " + nuovoAnno;
    setRighe((rs) => rs.map((r) => (r.descrizione === vecchia ? { ...r, descrizione: nuovaDescrizione } : r)));
    setMese(nuovoMese);
    setAnno(nuovoAnno);
  }

  const cambiaRiga = (i, campo, valore) =>
    setRighe((rs) => rs.map((r, k) => (k === i ? { ...r, [campo]: valore } : r)));
  const aggiungiRiga = () =>
    setRighe((rs) => [...rs, { descrizione: "", quantita: 1, prezzo: committente.prezzoUnitario || 0 }]);
  const togliRiga = (i) => setRighe((rs) => rs.filter((_, k) => k !== i));

  function cambiaRegime(id) {
    setRegime(id);
    const r = regimeIva(id);
    if (!r.conIva && !dicitura.trim()) setDicitura(r.dicitura);
    if (r.conIva && !(Number(aliquota) > 0)) setAliquota(10);
  }

  function invia() {
    if (!valido) return;
    onEmetti({
      periodo,
      righe: righe.filter((r) => r.descrizione.trim()),
      termini, metodoPagamento: metodo, regimeIva: regime,
      aliquota: Number(aliquota) || 0,
      dicituraIva: dicitura,
      note: note.trim(),
    });
  }

  return (
    <Velo largo onChiudi={onChiudi}>
      <div className="scelta-testa">
        <div className="occhiello">Nuova proforma</div>
        <h2>{committente.nome}</h2>
        <p>Righe e condizioni valgono solo per questo documento: le impostazioni del committente restano come sono.</p>
      </div>
      <div className="modulo" style={{ padding: "0 26px 8px" }}>
        <div className="modulo-riga due">
          <label>
            <span>Mese del periodo</span>
            <select value={mese} onChange={(e) => cambiaPeriodo(e.target.value, anno)}>
              {MESI.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label>
            <span>Anno</span>
            <input type="number" min="2020" max="2099" value={anno}
              onChange={(e) => cambiaPeriodo(mese, Number(e.target.value) || anno)} />
          </label>
        </div>

        <div className="pro-righe">
          <div className="pro-righe-testa">
            <span>Righe del documento</span>
            <button type="button" className="btn linea piccolo" onClick={aggiungiRiga}>
              <Icone.piu size={14} /> Aggiungi riga
            </button>
          </div>
          {righe.map((r, i) => (
            <div key={i} className="pro-riga">
              <label>
                <span>Descrizione</span>
                <input type="text" value={r.descrizione} placeholder="Es. Pasti Agosto 2026"
                  onChange={(e) => cambiaRiga(i, "descrizione", e.target.value)} />
              </label>
              <label>
                <span>Quantità</span>
                <input type="number" min="0" step="1" value={r.quantita}
                  onChange={(e) => cambiaRiga(i, "quantita", e.target.value)} />
              </label>
              <label>
                <span>Prezzo unit.</span>
                <input type="number" min="0" step="0.10" value={r.prezzo}
                  onChange={(e) => cambiaRiga(i, "prezzo", e.target.value)} />
              </label>
              <div className="pro-riga-importo">
                <span>€ {eurIt((Number(r.quantita) || 0) * (Number(r.prezzo) || 0))}</span>
                <button type="button" onClick={() => togliRiga(i)} disabled={righe.length === 1}
                  aria-label="togli riga" title="Togli riga">
                  <Icone.x size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="modulo-riga due">
          <label>
            <span>Termini di pagamento</span>
            <select value={termini} onChange={(e) => setTermini(e.target.value)}>
              {!termini && <option value="">Scegli i termini</option>}
              {TERMINI_PAGAMENTO.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </label>
          <label>
            <span>Metodo di pagamento</span>
            <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              {METODI_PAGAMENTO.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </label>
        </div>
        <div className="modulo-riga due">
          <label>
            <span>Regime IVA</span>
            <select value={regime} onChange={(e) => cambiaRegime(e.target.value)}>
              {REGIMI_IVA.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
            </select>
          </label>
          <label>
            <span>Aliquota IVA %</span>
            <input type="number" min="0" max="100" step="1" value={conIva ? aliquota : 0} disabled={!conIva}
              onChange={(e) => setAliquota(e.target.value)} />
          </label>
        </div>
        {!conIva && (
          <label className="modulo-blocco">
            <span>Dicitura di esenzione</span>
            <input type="text" value={dicitura} onChange={(e) => setDicitura(e.target.value)}
              placeholder="Operazione esente IVA ai sensi dell'art. 10 DPR 633/72" />
          </label>
        )}
        <label className="modulo-blocco">
          <span>Note sul documento</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
            placeholder="Facoltative, finiscono in fondo alla proforma" />
        </label>

        <div className="pro-anteprima">
          <div><span>Imponibile</span><b>€ {eurIt(totali.imponibile)}</b></div>
          <div><span>{conIva ? "IVA " + (Number(aliquota) || 0) + "%" : "IVA, operazione esente"}</span><b>€ {eurIt(totali.iva)}</b></div>
          <div className="forte"><span>Totale documento</span><b>€ {eurIt(totali.totale)}</b></div>
          <div><span>Scadenza</span><b>{dataIt(scadenza)}</b></div>
        </div>
      </div>
      <div className="scelta-piede modulo-piede">
        <button className="btn linea" onClick={onChiudi}>Annulla</button>
        <button className="btn" disabled={!valido} onClick={invia}>Emetti e apri PDF</button>
      </div>
    </Velo>
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


/* ==================== ordini in arrivo, drill-down per committente ====================
   Riscritta il 12 settembre 2026 su richiesta di Filippo: non più una riga per
   evento con dati inventati, ma una struttura per riga che apre il dettaglio
   reale — piatti e quantità per l'azienda, elenco nominativo per reparto per
   la comunità — presa dallo stesso stato condiviso della distinta di
   produzione e delle presenze, non da un elenco statico a parte. */
/* "generato il" (quando è stato trasmesso l'ordine) e "per il" (a quale
   giorno del menu si riferisce) sono due date diverse — un ordine di oggi può
   valere per un giorno futuro della settimana — e vanno sempre mostrate
   insieme, mai una al posto dell'altra. */
function formattaQuando(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" }) + " alle " +
    d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

function OrdiniAzienda({ pasti, giorniConfermati, nominativi, onManifesto }) {
  const righe = Object.entries(pasti).sort((a, b) => b[1] - a[1]);
  /* il manifesto è di una consegna sola: si sceglie la giornata e l'elenco
     nominativo mostra quella, così il foglio stampato è quello che si vede */
  const primoConNominativi = nominativi.length
    ? Math.min(...nominativi.map((n) => n.indiceGiorno))
    : 0;
  const [giorno, setGiorno] = React.useState(primoConNominativi);
  const delGiorno = nominativi.filter((n) => n.indiceGiorno === giorno);
  /* il dettaglio nominativo (e il manifesto) si mostra anche senza conferme
     dal vivo: gli ordini già chiusi dei giorni precedenti sono lì */
  if (!righe.length && !nominativi.length) return (
    <div className="avviso info">
      <Icone.attenzione size={16} />
      <span>Nessuna prenotazione confermata ancora oggi. La lista si popola quando un dipendente conferma dal proprio portale.</span>
    </div>
  );
  return (
    <>
      {giorniConfermati.map((g) => (
        <div key={g.giorno} style={{ fontSize: 12, color: "var(--muto)", marginBottom: 4 }}>
          Per <b style={{ color: "var(--inchiostro)" }}>{g.giorno}</b> · generato il {g.quando || "poco fa"}
        </div>
      ))}
      {righe.length > 0 && <table className="dati" style={{ marginTop: 8 }}>
        <thead><tr><th>Piatto</th><th>Quantità</th></tr></thead>
        <tbody>
          {righe.map(([id, q]) => PIATTI[id] && (
            <tr key={id}>
              <td><b>{PIATTI[id].n}</b></td>
              <td className="quantita">×{q}</td>
            </tr>
          ))}
        </tbody>
      </table>}

      <div className="pannello-testa" style={{ padding: "14px 0 8px", border: "none" }}>
        <h2 style={{ fontSize: 15 }}>Dettaglio nominativo</h2>
        <span className="pastiglia p-att">riservato al fornitore</span>
      </div>
      <p style={{ fontSize: 12, color: "var(--muto)", margin: "0 0 10px" }}>
        Chi ha ordinato cosa, una giornata alla volta. Non è mai visibile al cliente né al
        dipendente: le etichette pasto dell'azienda restano anonime, questo elenco serve solo al
        fornitore per il cassone termico.
      </p>
      <div className="giorni-tab">
        {GIORNI.map((g, i) => {
          const quanti = nominativi.filter((n) => n.indiceGiorno === i).length;
          return (
            <button key={g.n} className={(i === giorno ? "on" : "") + (g.chiuso ? " chiuso" : "")} onClick={() => setGiorno(i)}
              title={g.chiuso ? "Ordini chiusi: elenco definitivo" : "Ordini ancora aperti: l'elenco può cambiare"}>
              {g.chiuso && <Icone.lucchetto size={12} />}{g.n}
              <span>{(g.chiuso ? "chiuso · " : "aperto · ") + (quanti ? quanti + (quanti === 1 ? " nominativo" : " nominativi") : "nessuno")}</span>
            </button>
          );
        })}
      </div>
      {delGiorno.length === 0 ? (
        <div className="avviso info"><Icone.attenzione size={16} /><span>Nessun nominativo per {etichettaGiorno(giorno)}.</span></div>
      ) : (
        <div className="scorri">
          <table className="dati">
            <thead><tr><th>Nominativo</th><th>Reparto</th><th>Primo</th><th>Secondo</th><th>Contorno</th></tr></thead>
            <tbody>
              {delGiorno.map((n) => (
                <tr key={n.id}>
                  <td><b>{n.nome}</b></td>
                  <td style={{ color: "var(--muto)" }}>{n.reparto}</td>
                  <td>{n.unico ? "Piatto unico: " + n.unico : n.primo}</td>
                  <td>{n.secondo}</td>
                  <td>{n.contorno}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {onManifesto && (
        <div style={{ marginTop: 12 }}>
          <button className="btn linea piccolo" onClick={() => onManifesto(giorno)}>
            <Icone.stampa size={16} /> Manifesto PDF di {etichettaGiorno(giorno)} per il cassone termico
          </button>
        </div>
      )}
    </>
  );
}

function OrdiniComunita({ righe, variazioni = [], onPrendiInCarico }) {
  const pazienti = new Set(righe.map((r) => r.id)).size;
  const daPrendere = variazioni.filter((v) => v.stato !== "presa_in_carico").length;
  return (
    <>
      {!righe.length ? (
        <div className="avviso info">
          <Icone.attenzione size={16} />
          <span>Nessuna presenza trasmessa ancora oggi. La lista si popola quando il referente di un centro trasmette a MAVI.</span>
        </div>
      ) : (
        <div className="scorri">
          <p style={{ fontSize: 12.5, color: "var(--muto)", margin: "0 0 10px" }}>
            {righe.length} {righe.length === 1 ? "pasto" : "pasti"} da {pazienti} {pazienti === 1 ? "paziente" : "pazienti"}:
            pranzo e cena sono righe distinte, trasmesse separatamente dal referente di ogni centro.
          </p>
          <table className="dati">
            <thead><tr><th>Paziente</th><th>Centro</th><th>Per il giorno</th><th>Pasto</th><th>Primo</th><th>Secondo</th><th>Contorno</th><th>Generato il</th></tr></thead>
            <tbody>
              {righe.map((r) => (
                <tr key={r.id + r.pasto}>
                  <td><b>{r.nome}</b></td>
                  <td style={{ color: "var(--muto)" }}>{r.stanza}</td>
                  <td>{r.giorno}</td>
                  <td>{r.pasto}</td>
                  <td>{splitPiatto(r.dieta.primo).nome}</td>
                  <td>{splitPiatto(r.dieta.secondo).nome}</td>
                  <td>{splitPiatto(r.dieta.contorno).nome}</td>
                  <td style={{ fontSize: 12, color: "var(--muto)" }}>{formattaQuando(r.generatoIl) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flussi-variazioni">
        <div className="pannello-testa" style={{ padding: "4px 0 8px", border: "none" }}>
          <h3>Variazioni dai centri</h3>
          <span className={"pastiglia " + (daPrendere ? "p-att" : "p-neu")}>
            {daPrendere ? daPrendere + " da prendere in carico" : variazioni.length ? "tutte prese in carico" : "nessuna"}
          </span>
        </div>
        {variazioni.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "var(--muto)", margin: 0 }}>
            Nessuna variazione inviata dai referenti.
          </p>
        ) : (
          <div className="scorri">
            <table className="dati">
              <thead>
                <tr><th>Centro</th><th>Inviata da</th><th>Giorno</th><th>Pasto</th><th>Paziente</th><th>Variazione</th><th>Stato</th></tr>
              </thead>
              <tbody>
                {variazioni.map((v) => {
                  const presa = v.stato === "presa_in_carico";
                  return (
                    <tr key={v.id}>
                      <td><b>{v.reparto || "—"}</b></td>
                      <td style={{ color: "var(--muto)" }}>
                        {v.autore}
                        <small className="dist-dest-portata">{[v.ruoloAutore, formattaQuando(v.creataIl)].filter(Boolean).join(" · ")}</small>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{etichettaGiorno(v.indiceGiorno)}</td>
                      <td>{ETICHETTA_PASTO[v.pasto] || v.pasto}</td>
                      <td>{v.pazienteNome || "Tutto il centro"}</td>
                      <td className="dist-testo-variazione">
                        <span className="pastiglia p-neu" style={{ marginRight: 6 }}>{ETICHETTA_TIPO_VARIAZIONE[v.tipo] || v.tipo}</span>
                        {v.testo}
                      </td>
                      <td>
                        {presa ? (
                          <>
                            <span className="pastiglia p-ok">presa in carico</span>
                            <small className="dist-dest-portata">
                              {[formattaQuando(v.presaInCaricoIl), v.presaInCaricoDa && "da " + v.presaInCaricoDa].filter(Boolean).join(" ")}
                            </small>
                          </>
                        ) : onPrendiInCarico ? (
                          <button className="btn piccolo" onClick={() => onPrendiInCarico(v.id)}>Prendi in carico</button>
                        ) : (
                          <span className="pastiglia p-att">da prendere in carico</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

const FOGLIO_VUOTO = { colonne: [{ header: "Nessun ordine ricevuto per questo committente", key: "x", width: 44 }], dati: [] };

function foglioPerCommittente(id, pastiAzienda, presenzeTrasmesse) {
  if (id === "azienda") {
    return {
      colonne: [{ header: "Piatto", key: "piatto", width: 30 }, { header: "Quantità", key: "quantita", width: 12 }],
      dati: Object.entries(pastiAzienda).map(([pid, q]) => ({ piatto: PIATTI[pid]?.n || pid, quantita: q })),
    };
  }
  if (id === "comunita") {
    return {
      colonne: [
        { header: "Paziente", key: "paziente", width: 22 }, { header: "Centro", key: "reparto", width: 24 },
        { header: "Per il giorno", key: "perGiorno", width: 20 }, { header: "Pasto", key: "pasto", width: 10 },
        { header: "Primo", key: "primo", width: 24 }, { header: "Secondo", key: "secondo", width: 24 },
        { header: "Contorno", key: "contorno", width: 24 }, { header: "Generato il", key: "generato", width: 20 },
      ],
      dati: presenzeTrasmesse.map((r) => ({
        paziente: r.nome, reparto: r.stanza, perGiorno: r.giorno, pasto: r.pasto,
        primo: splitPiatto(r.dieta.primo).nome, secondo: splitPiatto(r.dieta.secondo).nome, contorno: splitPiatto(r.dieta.contorno).nome,
        generato: formattaQuando(r.generatoIl) || "—",
      })),
    };
  }
  return FOGLIO_VUOTO;
}

function FlussiOrdine() {
  const st = usaStato();
  const committenti = st.committenti;
  const [aperto, setAperto] = React.useState(null);

  const pastiAzienda = React.useMemo(() => {
    const a = {};
    Object.keys(st.confermati).forEach((g) => {
      Object.values(st.ordini[g] || {}).forEach((id) => { if (PIATTI[id]) a[id] = (a[id] || 0) + 1; });
    });
    return a;
  }, [st.ordini, st.confermati]);
  const totAzienda = Object.values(pastiAzienda).reduce((a, b) => a + b, 0);
  /* una riga per paziente E pasto: pranzo e cena sono due pasti distinti,
     quindi qui si contano pasti, non pazienti */
  const totComunita = st.presenzeTrasmesse.length;
  /* "generato il" e "per il giorno" sono due informazioni diverse: un ordine
     confermato oggi vale per un giorno della settimana in corso, non per oggi
     stesso. Un giorno per riga, con la data/ora reale della conferma. */
  const giorniConfermatiAzienda = React.useMemo(() =>
    Object.keys(st.confermati).map((g) => ({
      giorno: (GIORNI[g]?.n || "") + " " + (GIORNI[g]?.d || ""),
      quando: formattaQuando(st.oraConferma[g]),
    })),
  [st.confermati, st.oraConferma]);

  /* variazioni scritte dai referenti: il bottone compare solo se lo
     store sa prenderle in carico e il ruolo ha il permesso */
  const variazioni = st.variazioni || [];
  const puoPrendere = typeof st.prendiInCaricoVariazione === "function" && st.puo("flussi.variazioni");
  const variazioniDi = (id) => variazioni
    .filter((v) => v.committenteId === id)
    .sort((a, b) => (a.stato === "presa_in_carico") - (b.stato === "presa_in_carico")
      || String(b.creataIl).localeCompare(String(a.creataIl)));

  const dati = React.useMemo(() => committenti.map((c) => ({
    c,
    pasti: c.id === "azienda" ? totAzienda : c.id === "comunita" ? totComunita : 0,
    trasmesso: c.id === "azienda" ? totAzienda > 0 : c.id === "comunita" ? totComunita > 0 || st.trasmissioniCentri.length > 0 : false,
    daPrendere: variazioni.filter((v) => v.committenteId === c.id && v.stato !== "presa_in_carico").length,
  })), [committenti, totAzienda, totComunita, st.trasmissioniCentri, variazioni]);

  const totale = dati.reduce((s, d) => s + d.pasti, 0);
  const trasmessi = dati.filter((d) => d.trasmesso).length;
  const percentuale = dati.length ? Math.round((trasmessi / dati.length) * 100) : 0;

  async function scaricaGlobale() {
    const { scaricaExcel } = await import("../excel.js");
    const fogli = dati.map((d) => ({ nome: d.c.nome.slice(0, 28), ...foglioPerCommittente(d.c.id, pastiAzienda, st.presenzeTrasmesse) }));
    await scaricaExcel("Ordini_in_arrivo.xlsx", fogli, { datiAziendali: st.datiAziendali });
    st.avvisa("Resoconto globale scaricato, un foglio per struttura");
  }
  async function scaricaStruttura(d) {
    const { scaricaExcel } = await import("../excel.js");
    await scaricaExcel("Ordini_" + senzaAccenti(d.c.nome).replace(/[^a-zA-Z0-9]+/g, "_") + ".xlsx",
      [{ nome: "Ordini", ...foglioPerCommittente(d.c.id, pastiAzienda, st.presenzeTrasmesse) }], { datiAziendali: st.datiAziendali });
    st.avvisa("Resoconto di " + d.c.nome + " scaricato");
  }
  /* il manifesto è il resoconto dettagliato della cucina: a ogni riga si
     aggiungono dieta dichiarata in anagrafica e allergie. Le allergie note al
     portale sono quelle impostate dal dipendente nel suo profilo (nella demo
     un solo dipendente ha il portale, lo stato allergeniUtente è il suo). */
  function generaManifesto(struttura, indiceGiorno) {
    const quanti = st.nominativiAzienda.filter((n) => n.indiceGiorno === indiceGiorno).length;
    const conPortale = new Set((st.utenti || []).filter((u) => u.ruolo === "dipendente").map((u) => u.nome));
    generaManifestoConsegna({
      struttura, pasto: "pranzo", indiceGiorno,
      righe: st.nominativiAzienda.map((r) => {
        const suo = conPortale.has(r.nome);
        const dietaPortale = suo && st.dietaUtente
          ? { tipoDieta: st.dietaUtente.charAt(0).toUpperCase() + st.dietaUtente.slice(1), note: "impostata dal dipendente" }
          : null;
        return {
          ...r,
          dieta: dietaDipendente(r.nome) || dietaPortale,
          allergeni: suo ? (st.allergeniUtente || []).map((c) => ALLERGENI[c]).filter(Boolean) : [],
        };
      }),
      datiAziendali: st.datiAziendali,
      avvisa: st.avvisa,
    });
    st.logga("Cucina MAVI", "Operatore", "Manifesto di consegna generato",
      struttura + ", " + etichettaGiorno(indiceGiorno) + ", " + quanti + " nominativi", "generico");
  }

  return (
    <>
      <Intestazione
        occhiello={ETICHETTA_ADESSO}
        titolo="Ordini in arrivo"
        sotto="Da dove arrivano gli ordini di oggi: apri una struttura per vedere cosa ha dichiarato"
        azioni={<>
          <button className="btn linea piccolo" onClick={() => st.avvisa("Sollecito inviato alle strutture in attesa")}>
            Sollecita chi manca
          </button>
          {st.puo("flussi.excel") && (
            <button className="btn piccolo" onClick={scaricaGlobale}>
              <Icone.scarica size={16} /> Resoconto globale
            </button>
          )}
        </>}
      />
      <div className="tela">
        <div className="barra-avanzamento">
          <div className="ba-testa">
            <span><b>{trasmessi}</b> strutture hanno trasmesso su <b>{dati.length}</b></span>
            <span className="ba-perc">{percentuale}%</span>
          </div>
          <div className="ba-progresso"><i style={{ width: percentuale + "%" }} /></div>
          <p>{trasmessi < dati.length ? "Le strutture in attesa non hanno ancora trasmesso l'ordine o le presenze di oggi." : "Tutte le strutture hanno trasmesso, si può passare alla produzione."}</p>
        </div>
        <div className="numeri">
          <div className="numero"><div className="n-lab">Strutture</div><div className="n-val">{dati.length}</div><div className="n-nota">azienda, comunità e quelle aggiunte</div></div>
          <div className="numero"><div className="n-lab">Hanno trasmesso</div><div className="n-val">{trasmessi}</div><div className="n-nota">su {dati.length} attese</div></div>
          <div className="numero"><div className="n-lab">Pasti dichiarati</div><div className="n-val">{totale}</div><div className="n-nota">somma di tutte le strutture</div></div>
          <div className="numero"><div className="n-lab">In attesa</div><div className="n-val">{dati.length - trasmessi}</div><div className="n-nota">non ancora trasmesso</div></div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Strutture servite</h2>
            <span className="conta-piatti">clicca per aprire il dettaglio</span>
          </div>
          <div className="scorri">
            <table className="dati">
              <thead><tr><th>Struttura</th><th>Tipo</th><th>Cutoff</th><th>Pasti</th><th>Stato</th><th>Variazioni</th><th /></tr></thead>
              <tbody>
                {dati.map((d) => (
                  <React.Fragment key={d.c.id}>
                    <tr>
                      <td><b>{d.c.nome}</b></td>
                      <td><span className="pastiglia p-neu">{d.c.tipo}</span></td>
                      <td className="cifra">{d.c.cutoff}</td>
                      <td className="quantita">{d.pasti}</td>
                      <td>{d.trasmesso ? <span className="pastiglia p-ok">trasmesso</span> : <span className="pastiglia p-att">in attesa</span>}</td>
                      <td>
                        {d.daPrendere > 0
                          ? <span className="pastiglia p-att">{d.daPrendere} da prendere in carico</span>
                          : d.c.tipo === "Comunità"
                            ? <span className="pastiglia p-neu">nessuna da prendere</span>
                            : <span style={{ color: "var(--muto)" }}>—</span>}
                      </td>
                      <td>
                        <button className={"btn piccolo" + (aperto === d.c.id ? "" : " linea")} onClick={() => setAperto(aperto === d.c.id ? null : d.c.id)}>
                          {aperto === d.c.id ? "Chiudi" : "Apri dettaglio"}
                        </button>
                      </td>
                    </tr>
                    {aperto === d.c.id && (
                      <tr>
                        <td colSpan={7} style={{ background: "var(--carta)", padding: "16px 18px" }}>
                          {d.c.id === "azienda"
                            ? <OrdiniAzienda pasti={pastiAzienda} giorniConfermati={giorniConfermatiAzienda} nominativi={st.nominativiAzienda}
                                onManifesto={st.puo("flussi.manifesto") ? (i) => generaManifesto(d.c.nome, i) : null} />
                            : d.c.id === "comunita"
                              ? <OrdiniComunita righe={st.presenzeTrasmesse} variazioni={variazioniDi(d.c.id)}
                                  onPrendiInCarico={puoPrendere ? (id) => st.prendiInCaricoVariazione(id) : null} />
                              : <div className="avviso info"><Icone.attenzione size={16} /><span>Nessuna fonte di ordini collegata ancora per questo committente.</span></div>}
                          <div style={{ marginTop: 14 }}>
                            {st.puo("flussi.excel") && (
                              <button className="btn linea piccolo" onClick={() => scaricaStruttura(d)}>
                                <Icone.scarica size={16} /> Scarica resoconto di {d.c.nome}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pannello-piede">
            Per l'azienda il dettaglio somma i piatti confermati dai dipendenti. Per la comunità
            elenca i pazienti trasmessi, con centro, pasto e portate, perché il pasto è nominativo:
            pranzo e cena arrivano da due trasmissioni distinte e contano come due pasti. Sotto ci sono
            le variazioni scritte dai referenti: prenderle in carico le segna come lette e il
            referente vede subito lo stato aggiornato.
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
/* raggruppa le etichette azienda per piatto (anonime, con contatore) */
function raggruppaAzienda(lista) {
  const perPiatto = {};
  lista.forEach((e) => {
    const k = e.piatto;
    if (!perPiatto[k]) perPiatto[k] = { piatto: e.piatto, portata: e.portata, giorno: e.giorno, pasto: e.pasto, count: 0, chiavi: [] };
    perPiatto[k].count++;
    perPiatto[k].chiavi.push(e.chiave);
  });
  return Object.values(perPiatto);
}
/* raggruppa le etichette comunità per reparto, poi per paziente: senza il
   reparto come primo livello, molte comunità con molti pazienti tornano a
   essere uno scroll unico enorme, lo stesso problema di partenza */
function raggruppaComunita(lista) {
  const perReparto = {};
  lista.forEach((e) => {
    const reparto = e.stanza || "Senza centro";
    if (!perReparto[reparto]) perReparto[reparto] = {};
    if (!perReparto[reparto][e.nome]) perReparto[reparto][e.nome] = { nome: e.nome, stanza: e.stanza, tipoDieta: e.tipoDieta, note: e.note, pranzo: [], cena: [] };
    const pasto = e.pasto === "cena" ? "cena" : "pranzo";
    perReparto[reparto][e.nome][pasto].push(e);
  });
  return Object.entries(perReparto).map(([reparto, pazienti]) => ({ reparto, pazienti: Object.values(pazienti) }));
}

function CardEtichettaAzienda({ g, onElimina }) {
  return (
    <div>
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
        </div>
      </div>
      {onElimina && (
        <button className="btn-rimuovi-et" onClick={onElimina}>
          <Icone.x size={12} /> Elimina gruppo
        </button>
      )}
    </div>
  );
}

function CardEtichettaComunita({ e, onElimina }) {
  return (
    <div>
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
        </div>
        {e.note && (
          <div className="etichetta-allergeni">
            <span className="so-lab">Note</span>
            <p>{e.note}</p>
          </div>
        )}
      </div>
      {onElimina && (
        <button className="btn-rimuovi-et" onClick={onElimina}>
          <Icone.x size={12} /> Elimina etichetta
        </button>
      )}
    </div>
  );
}

/* Sezione azienda: griglia di card, una per piatto. onElimina assente = vista
   di stampa, niente bottoni di rimozione fra le etichette. */
function SezioneAzienda({ gruppi, onElimina }) {
  if (!gruppi.length) return <p style={{ fontSize: 13, color: "var(--muto)" }}>Nessuna etichetta con questo filtro.</p>;
  return (
    <div className="etichette-griglia">
      {gruppi.map((g) => (
        <CardEtichettaAzienda key={g.piatto} g={g} onElimina={onElimina && (() => onElimina(g.chiavi[0], g.piatto, g.portata))} />
      ))}
    </div>
  );
}

/* Sezione comunità: reparto come primo livello, poi paziente, poi pasto.
   Senza il reparto, una comunità con molti pazienti torna a essere un unico
   scroll enorme — lo stesso problema che questa riscrittura vuole evitare. */
function SezioneComunita({ gruppi, onElimina }) {
  if (!gruppi.length) return <p style={{ fontSize: 13, color: "var(--muto)" }}>Nessuna etichetta con questo filtro.</p>;
  return (
    <>
      {gruppi.map(({ reparto, pazienti }) => (
        <div key={reparto} style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muto)", margin: "0 0 14px", paddingBottom: 8, borderBottom: "1px solid var(--linea)" }}>
            {reparto} <span style={{ fontWeight: 400, textTransform: "none" }}>· {pazienti.length} {pazienti.length === 1 ? "paziente" : "pazienti"}</span>
          </h3>
          {pazienti.map((paz) => (
            <div key={paz.nome} style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "var(--inchiostro-2)", fontFamily: "var(--serif)" }}>
                {paz.nome}
                {paz.tipoDieta && paz.tipoDieta !== "Standard" && (
                  <span className="tag-dieta terap" style={{ marginLeft: 10, fontSize: 11 }}>{paz.tipoDieta}</span>
                )}
              </h4>
              {["pranzo", "cena"].map((pasto) => {
                const lista = paz[pasto];
                if (!lista.length) return null;
                return (
                  <div key={pasto} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muto)", marginBottom: 8 }}>{pasto}</div>
                    <div className="etichette-griglia">
                      {lista.map((e) => (
                        <CardEtichettaComunita key={e.chiave} e={e} onElimina={onElimina && (() => onElimina(e.chiave, e.nome, e.portata))} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

/* Vista di stampa dedicata: una sola struttura, senza numeri/tabella/altre
   strutture intorno. window.print() qui stampa solo questo, non 3000
   etichette di altre venti aziende insieme. */
function VistaStampaEtichette({ struttura, gruppiAzienda, gruppiComunita, onIndietro }) {
  return (
    <>
      <Intestazione
        occhiello={struttura.nome}
        titolo="Etichette pronte per la stampa"
        sotto={gruppiAzienda ? "Anonime, raggruppate per piatto" : "Nominative, per centro e paziente"}
        azioni={<>
          <button className="btn linea piccolo" onClick={onIndietro}><Icone.sx size={16} /> Torna all'elenco</button>
          <button className="btn piccolo" onClick={() => window.print()}><Icone.stampa size={16} /> Stampa</button>
        </>}
      />
      <div className="tela">
        {gruppiAzienda && <SezioneAzienda gruppi={gruppiAzienda} />}
        {gruppiComunita && <SezioneComunita gruppi={gruppiComunita} />}
      </div>
    </>
  );
}

function EtichettePasto() {
  const st = usaStato();
  const committenti = st.committenti;
  const trasmessi = st.presenzeTrasmesse || [];
  const [rimossi, setRimossi] = React.useState([]);
  const [conferma, setConferma] = React.useState(null);
  /* Riscritta il 12 settembre 2026: con più committenti (20 aziende, 30
     comunità...) uno scroll unico con tutte le etichette diventa
     ingestibile. Ora si apre una struttura alla volta (stesso drill-down di
     "Ordini in arrivo"), con ricerca dentro, e si stampa quella sola
     struttura in una vista dedicata — mai "tutto insieme". */
  const [aperto, setAperto] = React.useState(null);
  const [cerca, setCerca] = React.useState("");
  const [stampaStruttura, setStampaStruttura] = React.useState(null);
  /* quante etichette aveva questa struttura l'ultima volta che è stata
     aperta: se il conteggio attuale è più alto, sono arrivate etichette
     nuove da quando nessuno guardava, e lo segnaliamo con il pallino. */
  const [visti, setVisti] = React.useState({});
  const puoEliminare = st.puo("etichette.elimina");

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
        });
      });
    });
    return lista;
  }, [st.confermati, st.ordini]);

  /* etichette comunità: dalle presenze trasmesse */
  const etichetteComunita = React.useMemo(() => {
    const lista = [];
    trasmessi.forEach((t) => {
      const { primo, secondo, contorno } = t.dieta;
      [["primo", primo], ["secondo", secondo], ["contorno", contorno]].forEach(([portata, piatto]) => {
        if (!piatto || piatto === "—") return;
        const nomeClean = splitPiatto(piatto).nome;
        lista.push({
          chiave: "com-" + t.id + "-" + t.pasto + "-" + portata,
          nome: t.nome,
          stanza: t.stanza,
          tipoDieta: t.tipo_dieta,
          note: t.note,
          giorno: t.giorno,
          pasto: t.pasto,
          portata,
          piatto: nomeClean,
          nota: splitPiatto(piatto).nota,
        });
      });
    });
    return lista;
  }, [trasmessi]);

  const azFiltrate = etichetteAzienda.filter((e) => !rimossi.includes(e.chiave));
  const comFiltrate = etichetteComunita.filter((e) => !rimossi.includes(e.chiave));
  const totale = azFiltrate.length + comFiltrate.length;
  const vuoto = totale === 0;

  /* i pasti realmente presenti fra le etichette comunità: pranzo e cena
     arrivano da trasmissioni separate, la card non può essere fissa */
  const pastiPresenti = React.useMemo(() => {
    const presenti = new Set(comFiltrate.map((e) => e.pasto).filter(Boolean));
    if (azFiltrate.length) presenti.add("pranzo");
    return ["pranzo", "cena"].filter((p) => presenti.has(p));
  }, [azFiltrate, comFiltrate]);
  const etichettaPasto = pastiPresenti.length === 0 ? "—"
    : pastiPresenti.map((p) => p[0].toUpperCase() + p.slice(1)).join(" + ");

  const righe = React.useMemo(() => committenti.map((c) => ({
    c,
    conteggio: c.id === "azienda" ? azFiltrate.length : c.id === "comunita" ? comFiltrate.length : 0,
  })), [committenti, azFiltrate, comFiltrate]);

  const cercaAzienda = (lista) => cerca ? lista.filter((e) => e.piatto.toLowerCase().includes(cerca.toLowerCase())) : lista;
  const cercaComunita = (lista) => cerca ? lista.filter((e) => e.nome.toLowerCase().includes(cerca.toLowerCase())) : lista;

  const nuovoArrivo = (r) => r.conteggio > 0 && (visti[r.c.id] ?? 0) < r.conteggio;
  function apriStruttura(id, conteggio) {
    setAperto((prec) => (prec === id ? null : id));
    setCerca("");
    setVisti((v) => ({ ...v, [id]: conteggio }));
  }

  const righeAzienda = righe.filter((r) => r.c.tipo === "Azienda");
  const righeComunita = righe.filter((r) => r.c.tipo === "Comunità");
  const righeAltro = righe.filter((r) => r.c.tipo !== "Azienda" && r.c.tipo !== "Comunità");

  function rimuovi(chiave) {
    setRimossi((p) => [...p, chiave]);
    st.avvisa("Etichetta rimossa");
    setConferma(null);
  }

  if (stampaStruttura) {
    const c = committenti.find((x) => x.id === stampaStruttura);
    return (
      <VistaStampaEtichette
        struttura={c}
        gruppiAzienda={stampaStruttura === "azienda" ? raggruppaAzienda(azFiltrate) : null}
        gruppiComunita={stampaStruttura === "comunita" ? raggruppaComunita(comFiltrate) : null}
        onIndietro={() => setStampaStruttura(null)}
      />
    );
  }

  return (
    <>
      <Intestazione
        occhiello="Cucina centrale"
        titolo="Etichette pasto"
        sotto="Apri una struttura per vedere le sue etichette e stamparle: azienda anonime per piatto, comunità nominative per centro e paziente"
      />
      <div className="tela">
        {vuoto ? (
          <div className="avviso info" style={{ alignItems: "flex-start" }}>
            <Icone.attenzione size={18} />
            <span>
              Nessuna etichetta da mostrare. Le etichette azienda si generano quando un dipendente
              conferma la prenotazione dal suo portale. Quelle della comunità quando il referente
              trasmette le presenze.
            </span>
          </div>
        ) : (
          <>
            <div className="numeri">
              <div className="numero"><div className="n-lab">Etichette totali</div><div className="n-val">{totale}</div><div className="n-nota">azienda + comunità</div></div>
              <div className="numero"><div className="n-lab">Azienda</div><div className="n-val">{azFiltrate.length}</div><div className="n-nota">anonime, solo piatto</div></div>
              <div className="numero"><div className="n-lab">Comunità</div><div className="n-val">{comFiltrate.length}</div><div className="n-nota">nominative, per paziente</div></div>
              <div className="numero"><div className="n-lab">Pasto</div><div className="n-val" style={{ fontSize: 20 }}>{etichettaPasto}</div><div className="n-nota">mer 16 set 2026</div></div>
            </div>

            {[["Aziende", righeAzienda], ["Comunità", righeComunita], ["Altri committenti", righeAltro]].map(([titolo, sottoinsieme]) => sottoinsieme.length > 0 && (
              <div className="pannello" key={titolo}>
                <div className="pannello-testa">
                  <h2>{titolo}</h2>
                  <span className="conta-piatti">
                    {sottoinsieme.some(nuovoArrivo) ? <><span className="pallino-nuovo" />etichette arrivate</> : "clicca per aprire il dettaglio"}
                  </span>
                </div>
                <div className="scorri">
                  <table className="dati">
                    <thead><tr><th>Struttura</th><th>Etichette</th><th /></tr></thead>
                    <tbody>
                      {sottoinsieme.map((r) => (
                        <React.Fragment key={r.c.id}>
                          <tr>
                            <td>
                              {nuovoArrivo(r) && <span className="pallino-nuovo" title="Etichette arrivate" />}
                              <b>{r.c.nome}</b>
                            </td>
                            <td className="quantita">{r.conteggio}</td>
                            <td>
                              <button className={"btn piccolo" + (aperto === r.c.id ? "" : " linea")}
                                disabled={r.conteggio === 0}
                                onClick={() => apriStruttura(r.c.id, r.conteggio)}>
                                {aperto === r.c.id ? "Chiudi" : nuovoArrivo(r) ? "Visualizza etichette arrivate" : "Apri dettaglio"}
                              </button>
                            </td>
                          </tr>
                          {aperto === r.c.id && (
                            <tr>
                              <td colSpan={3} style={{ background: "var(--carta)", padding: "18px 20px" }}>
                                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
                                  <input type="text" value={cerca} onChange={(e) => setCerca(e.target.value)}
                                    placeholder={r.c.id === "azienda" ? "Cerca per piatto…" : "Cerca per nominativo…"}
                                    style={{ flex: 1, minWidth: 200, padding: "8px 12px", border: "1px solid var(--linea-forte)", borderRadius: "var(--r-s)", fontFamily: "var(--sans)", fontSize: 13 }} />
                                  {st.puo("etichette.stampa") && (
                                    <button className="btn piccolo" onClick={() => setStampaStruttura(r.c.id)}>
                                      <Icone.stampa size={16} /> Stampa etichette di {r.c.nome}
                                    </button>
                                  )}
                                </div>
                                {r.c.id === "azienda" && (
                                  <SezioneAzienda gruppi={raggruppaAzienda(cercaAzienda(azFiltrate))}
                                    onElimina={puoEliminare ? (chiave, nome, portata) => setConferma({ chiave, nome, portata }) : null} />
                                )}
                                {r.c.id === "comunita" && (
                                  <SezioneComunita gruppi={raggruppaComunita(cercaComunita(comFiltrate))}
                                    onElimina={puoEliminare ? (chiave, nome, portata) => setConferma({ chiave, nome, portata }) : null} />
                                )}
                                {r.c.id !== "azienda" && r.c.id !== "comunita" && (
                                  <p style={{ fontSize: 13, color: "var(--muto)" }}>Nessuna fonte di etichette collegata ancora per questo committente.</p>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pannello-piede">
                  {titolo === "Aziende"
                    ? "Etichette anonime, raggruppate per piatto."
                    : titolo === "Comunità"
                      ? "Etichette nominative, raggruppate per centro e poi per paziente."
                      : "Nessuna fonte di etichette collegata ancora per questi committenti."}{" "}
                  Il pallino rosso segnala una struttura con etichette arrivate da quando non la aprivi:
                  sparisce non appena apri il dettaglio.
                </div>
              </div>
            ))}
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
/* il portale di una struttura: MAVI a parte, lo dice il tipo del committente.
   Da qui si decide quali ruoli si possono assegnare a quell'utente. */
function portaleDiStruttura(id, committenti) {
  if (id === "mavi") return "mavi";
  const c = committenti.find((x) => x.id === id);
  if (!c) return "comunita";
  return c.tipo === "Azienda" ? "azienda" : "comunita";
}

const stileEtichetta = {
  display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
  textTransform: "uppercase", color: "var(--muto)", marginBottom: 4,
};
const stileCampo = { width: "100%", fontSize: 13, padding: "8px 10px" };

function ModaleUtente({ utente, ruoli, strutture, committenti, repartiComunita, onSalva, onChiudi }) {
  const primaStruttura = strutture[0] ? strutture[0].id : "mavi";
  const [form, setForm] = React.useState(() => utente || {
    nome: "", u: "", ruolo: "", struttura: primaStruttura,
    committente: strutture[0] ? strutture[0].nome : "",
    mansione: "", email: "", telefono: "", attivo: true,
  });
  const [errore, setErrore] = React.useState("");
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrore(""); };

  const portale = portaleDiStruttura(form.struttura, committenti);
  const ruoliAmmessi = ruoli.filter((r) => r.portale === portale);
  const ruolo = ruoliAmmessi.find((r) => r.id === form.ruolo) || ruoliAmmessi[0] || null;
  /* in comunità chi non vede tutti i reparti ne ha per forza uno assegnato,
     altrimenti entrerebbe in un portale senza nessun paziente */
  const repartoObbligatorio = portale === "comunita" && !!ruolo && !ruolo.permessi.includes("pazienti.tuttiReparti");
  const permessiRuolo = ruolo ? PERMESSI.filter((p) => p.portale === portale && ruolo.permessi.includes(p.k)) : [];

  function cambiaStruttura(id) {
    const c = committenti.find((x) => x.id === id);
    const nuovoPortale = portaleDiStruttura(id, committenti);
    const primo = ruoli.find((r) => r.portale === nuovoPortale);
    setForm((f) => ({
      ...f,
      struttura: id,
      committente: c ? c.nome : "MAVI Ristorazione",
      ruolo: ruoli.some((r) => r.id === f.ruolo && r.portale === nuovoPortale) ? f.ruolo : (primo ? primo.id : ""),
    }));
    setErrore("");
  }

  function salva() {
    if (!form.nome.trim()) { setErrore("Il nome completo è obbligatorio."); return; }
    if (!String(form.u || "").trim()) { setErrore("Il nome utente è obbligatorio: senza, la persona non entra."); return; }
    if (!ruolo) { setErrore("Non c'è nessun ruolo disponibile per questa struttura."); return; }
    if (repartoObbligatorio && !String(form.reparto || "").trim()) {
      setErrore("Questo ruolo vede solo il proprio centro: assegnagliene uno.");
      return;
    }
    onSalva({ ...form, ruolo: ruolo.id, reparto: repartoObbligatorio ? form.reparto : "" });
  }

  return (
    <Velo onChiudi={onChiudi}>
      <div className="scelta-testa">
        <div className="occhiello">Gestione utenti</div>
        <h2>{utente ? "Modifica utente" : "Nuovo utente"}</h2>
      </div>
      <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
        <div style={{ marginBottom: 14 }}>
          <label style={stileEtichetta}>Nome completo</label>
          <input type="text" value={form.nome} onChange={(e) => set("nome", e.target.value)} style={stileCampo} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={stileEtichetta}>Nome utente</label>
          <input type="text" value={form.u || ""} onChange={(e) => set("u", e.target.value.toLowerCase())}
            style={stileCampo} placeholder="nome.cognome" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={stileEtichetta}>Struttura</label>
          <select value={form.struttura} onChange={(e) => cambiaStruttura(e.target.value)} style={stileCampo}>
            {strutture.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={stileEtichetta}>Ruolo</label>
          <select value={ruolo ? ruolo.id : ""} onChange={(e) => set("ruolo", e.target.value)} style={stileCampo}
            disabled={ruoliAmmessi.length === 0}>
            {ruoliAmmessi.length === 0 && <option value="">Nessun ruolo per questo portale</option>}
            {ruoliAmmessi.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </select>
          <p style={{ fontSize: 11, color: "var(--muto)", marginTop: 4 }}>
            I ruoli disponibili sono quelli del portale {ETICHETTE_PORTALE[portale]}.
          </p>
        </div>
        {repartoObbligatorio && (
          <div style={{ marginBottom: 14 }}>
            <label style={stileEtichetta}>Centro assegnato</label>
            {repartiComunita.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--muto)" }}>Nessun centro censito. Aggiungine uno da Impostazioni per committente.</p>
            ) : (
              <select value={form.reparto || ""} onChange={(e) => set("reparto", e.target.value)} style={stileCampo}>
                <option value="">Scegli un centro</option>
                {form.reparto && !repartiComunita.includes(form.reparto) && (
                  <option value={form.reparto}>{form.reparto}, non più censito</option>
                )}
                {repartiComunita.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
            <p style={{ fontSize: 11, color: "var(--muto)", marginTop: 4 }}>Determina quali pazienti, presenze e variazioni gestisce nel portale comunità.</p>
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={stileEtichetta}>Mansione</label>
          <input type="text" value={form.mansione || ""} onChange={(e) => set("mansione", e.target.value)} style={stileCampo} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={stileEtichetta}>Email</label>
          <input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} style={stileCampo} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={stileEtichetta}>Telefono</label>
          <input type="tel" value={form.telefono || ""} onChange={(e) => set("telefono", e.target.value)} style={stileCampo} />
        </div>
      </div>
      <div style={{ padding: "0 24px 16px" }}>
        <label style={stileEtichetta}>Permessi del ruolo {ruolo ? ruolo.nome : "—"}</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {permessiRuolo.length === 0 && <span style={{ fontSize: 12, color: "var(--muto)" }}>Nessun permesso assegnato.</span>}
          {permessiRuolo.map((p) => (
            <span key={p.k} className="pastiglia p-ok" style={{ fontSize: 11 }}>{p.n}</span>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--muto)", marginTop: 8 }}>
          I permessi arrivano dal ruolo. Per cambiarli si va in <b>Ruoli e permessi</b>, dove la
          modifica vale per tutti gli utenti che hanno quel ruolo.
        </p>
      </div>
      {errore && (
        <div className="avviso info" style={{ margin: "0 24px 12px", background: "#fdf0e6", border: "1px solid #e8c9a8" }}>
          <Icone.attenzione size={16} /><span>{errore}</span>
        </div>
      )}
      <div className="scelta-piede" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn linea" onClick={onChiudi}>Annulla</button>
        <button className="btn" onClick={salva}>{utente ? "Salva modifiche" : "Crea utente"}</button>
      </div>
    </Velo>
  );
}

/* ==================== matrice ruoli e permessi ==================== */
function RuoliPermessi() {
  const st = usaStato();
  const [portale, setPortale] = React.useState("mavi");
  const [nuovo, setNuovo] = React.useState(null); // null | { nome, portale, copiaDa, vista }
  const [daEliminare, setDaEliminare] = React.useState(null);

  /* i permessi del portale, già raggruppati per pagina nell'ordine di PERMESSI */
  const gruppi = [];
  permessiDelPortale(portale).forEach((p) => {
    const ultimo = gruppi[gruppi.length - 1];
    if (ultimo && ultimo.nome === p.gruppo) ultimo.voci.push(p);
    else gruppi.push({ nome: p.gruppo, voci: [p] });
  });
  const ruoliPortale = st.ruoli.filter((r) => r.portale === portale);
  const contaUtenti = (id) => st.utenti.filter((u) => u.ruolo === id).length;

  function creaRuolo() {
    const copiato = st.ruoli.find((r) => r.id === nuovo.copiaDa);
    const chiaviValide = permessiDelPortale(nuovo.portale).map((x) => x.k);
    const fatto = st.salvaRuolo({
      nome: nuovo.nome,
      portale: nuovo.portale,
      vista: nuovo.portale === "azienda"
        ? (nuovo.vista || (copiato && copiato.vista) || "dipendente")
        : undefined,
      permessi: copiato ? copiato.permessi.filter((k) => chiaviValide.includes(k)) : [],
    });
    if (fatto) {
      st.avvisa("Ruolo " + nuovo.nome.trim() + " creato");
      setPortale(nuovo.portale);
      setNuovo(null);
    }
  }

  return (
    <div className="pannello">
      <div className="pannello-testa">
        <h2>Ruoli e permessi</h2>
        <span className="conta-piatti">{ruoliPortale.length} ruoli in {ETICHETTE_PORTALE[portale]}</span>
        <button className="btn piccolo" style={{ marginLeft: "auto" }}
          onClick={() => setNuovo({ nome: "", portale, copiaDa: "", vista: "dipendente" })}>
          <Icone.piu size={14} /> Nuovo ruolo
        </button>
      </div>
      <div style={{ padding: "18px 24px 0" }}>
        <div className="commuta" style={{ marginBottom: 18 }}>
          {Object.keys(ETICHETTE_PORTALE).map((k) => (
            <button key={k} className={portale === k ? "on" : ""} onClick={() => setPortale(k)}>{ETICHETTE_PORTALE[k]}</button>
          ))}
        </div>
      </div>
      <div className="scorri">
        <table className="dati matrice-permessi">
          <thead>
            <tr>
              <th style={{ minWidth: 250 }}>Permesso</th>
              {ruoliPortale.map((r) => (
                <th key={r.id} className="mp-ruolo">
                  <span className="mp-nome">{r.nome}</span>
                  <span className="mp-nota">
                    {r.bloccato ? "ruolo di sistema" : contaUtenti(r.id) + (contaUtenti(r.id) === 1 ? " utente" : " utenti")}
                  </span>
                  {!r.bloccato && <button className="mp-elimina" onClick={() => setDaEliminare(r)}>Elimina</button>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ruoliPortale.length === 0 && (
              <tr><td colSpan={2} style={{ textAlign: "center", color: "var(--muto)", padding: 22 }}>
                Nessun ruolo su questo portale. Creane uno con "Nuovo ruolo".
              </td></tr>
            )}
            {ruoliPortale.length > 0 && gruppi.map((g) => (
              <React.Fragment key={g.nome}>
                <tr className="mp-gruppo">
                  <td colSpan={ruoliPortale.length + 1}>{g.nome}</td>
                </tr>
                {g.voci.map((p) => (
                  <tr key={p.k}>
                    <td>
                      <b>{p.n}</b>
                      <div className="mp-chiave">{p.k}</div>
                    </td>
                    {ruoliPortale.map((r) => (
                      <td key={r.id} style={{ textAlign: "center" }}>
                        <input type="checkbox" className="mp-casella"
                          checked={r.permessi.includes(p.k)}
                          disabled={!!r.bloccato}
                          onChange={() => st.commutaPermesso(r.id, p.k)}
                          aria-label={p.n + ", " + r.nome} />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pannello-piede">
        Le modifiche valgono subito, anche per chi è già dentro il portale: la voce di menu sparisce
        e la pagina corrente torna alla prima disponibile, senza rifare l'accesso. Il ruolo di
        sistema non si modifica, altrimenti MAVI potrebbe chiudersi fuori dal proprio portale.
      </div>

      {nuovo && (
        <Velo onChiudi={() => setNuovo(null)}>
          <div className="scelta-testa">
            <div className="occhiello">Ruoli e permessi</div>
            <h2>Nuovo ruolo</h2>
            <p>Un ruolo vive dentro un solo portale. I permessi si spuntano dopo, nella matrice.</p>
          </div>
          <div style={{ padding: "16px 24px" }}>
            <div style={{ marginBottom: 14 }}>
              <label style={stileEtichetta}>Nome del ruolo</label>
              <input type="text" value={nuovo.nome} autoFocus style={stileCampo}
                onChange={(e) => setNuovo((n) => ({ ...n, nome: e.target.value }))} placeholder="per esempio Cuoco" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={stileEtichetta}>Portale</label>
              <select value={nuovo.portale} style={stileCampo}
                onChange={(e) => setNuovo((n) => ({ ...n, portale: e.target.value, copiaDa: "" }))}>
                {Object.keys(ETICHETTE_PORTALE).map((k) => <option key={k} value={k}>{ETICHETTE_PORTALE[k]}</option>)}
              </select>
            </div>
            {nuovo.portale === "azienda" && (
              <div style={{ marginBottom: 14 }}>
                <label style={stileEtichetta}>Telaio</label>
                <select value={nuovo.vista} style={stileCampo}
                  onChange={(e) => setNuovo((n) => ({ ...n, vista: e.target.value }))}>
                  <option value="dipendente">Vista dipendente</option>
                  <option value="referente">Vista referente</option>
                </select>
                <p style={{ fontSize: 11, color: "var(--muto)", marginTop: 4 }}>
                  Il portale azienda ha due telai: quello del commensale e quello di chi gestisce il servizio.
                </p>
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={stileEtichetta}>Copia i permessi da</label>
              <select value={nuovo.copiaDa} style={stileCampo}
                onChange={(e) => setNuovo((n) => ({ ...n, copiaDa: e.target.value }))}>
                <option value="">Nessuno, parti da zero</option>
                {st.ruoli.filter((r) => r.portale === nuovo.portale).map((r) => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="scelta-piede" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn linea" onClick={() => setNuovo(null)}>Annulla</button>
            <button className="btn" disabled={!nuovo.nome.trim()} onClick={creaRuolo}>Crea ruolo</button>
          </div>
        </Velo>
      )}

      {daEliminare && (
        <Velo onChiudi={() => setDaEliminare(null)}>
          <div className="scelta-testa">
            <div className="occhiello">Conferma eliminazione</div>
            <h2>Eliminare il ruolo {daEliminare.nome}?</h2>
            <p>
              {contaUtenti(daEliminare.id) > 0
                ? "Ci sono ancora utenti con questo ruolo: vanno spostati su un altro ruolo prima di eliminarlo."
                : "Il ruolo sparisce dalla matrice e non sarà più assegnabile."}
            </p>
          </div>
          <div className="scelta-piede modulo-piede">
            <button className="btn linea" onClick={() => setDaEliminare(null)}>Annulla</button>
            <button className="btn" style={{ background: "#d9534f", color: "#fff" }}
              onClick={() => { if (st.eliminaRuolo(daEliminare.id)) st.avvisa("Ruolo eliminato"); setDaEliminare(null); }}>
              Elimina
            </button>
          </div>
        </Velo>
      )}
    </div>
  );
}

/* ==================== gestione portale ==================== */
const TAB_GESTIONE = [
  ["azienda", "Dati aziendali", "gestione.azienda"],
  ["tema", "Aspetto", "gestione.tema"],
  ["utenti", "Utenti", "gestione.utenti"],
  ["ruoli", "Ruoli e permessi", "gestione.ruoli"],
  ["notifiche", "Notifiche", "gestione.notifiche"],
  ["backup", "Backup", "gestione.backup"],
];

function GestionePortale() {
  const st = usaStato();
  const tabPermessi = React.useMemo(
    () => TAB_GESTIONE.filter(([, , permesso]) => st.puo(permesso)), [st.puo]
  );
  const [tab, setTab] = React.useState(() => (tabPermessi[0] ? tabPermessi[0][0] : ""));
  /* togliere un permesso mentre la scheda è aperta la fa sparire subito */
  React.useEffect(() => {
    if (tabPermessi.length && !tabPermessi.some(([k]) => k === tab)) setTab(tabPermessi[0][0]);
  }, [tabPermessi, tab]);
  const [dati, setDati] = React.useState({ ...st.datiAziendali });
  const [editUtente, setEditUtente] = React.useState(null); // null | "nuovo" | utente obj
  /* le strutture assegnabili a un utente sono i committenti censiti più MAVI:
     un committente creato in demo compare subito anche qui */
  const STRUTTURE = [...st.committenti.map((c) => ({ id: c.id, nome: c.nome })),
    { id: "mavi", nome: "MAVI Ristorazione" }];
  const nomeRuolo = (id) => {
    const r = st.ruoli.find((x) => x.id === id);
    return r ? r.nome : "ruolo non assegnato";
  };

  function salvaDati() {
    st.setDatiAziendali(dati);
    st.avvisa("Dati aziendali salvati");
    st.loggaSessione("Dati aziendali aggiornati", "Ragione sociale, indirizzo, P.IVA", "modifica");
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
          {tabPermessi.map(([k, l]) => (
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
              {campo("Note standard proforma", "noteProforma", "area")}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button className="btn" onClick={salvaDati}>Salva dati</button>
              </div>
            </div>
            <div className="pannello-piede">
              Ragione sociale, indirizzo, dati fiscali e contatti compaiono nella testata di ogni
              documento stampabile del portale: proforma, manifesto di consegna e scheda piatto.
              Quello che resta vuoto esce nel documento come segnaposto in corsivo terracotta.
              L'<b>IBAN</b> finisce nelle condizioni di pagamento della proforma (bonifico o SDD), le
              <b> note standard</b> in fondo a ogni proforma. Termini, metodo e regime IVA non hanno un
              predefinito: si decidono per committente in <b>Impostazioni</b>.
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
              <span className="conta-piatti">{st.utenti.filter((u) => u.attivo !== false).length} attivi su {st.utenti.length}</span>
              <button className="btn piccolo" style={{ marginLeft: "auto" }} onClick={() => setEditUtente("nuovo")}>
                <Icone.piu size={14} /> Nuovo utente
              </button>
            </div>
            <div className="scorri">
              <table className="dati">
                <thead><tr><th>Nome</th><th>Nome utente</th><th>Ruolo</th><th>Struttura</th><th>Centro</th><th>Stato</th><th /></tr></thead>
                <tbody>
                  {st.utenti.map((u) => (
                    <tr key={u.id} style={{ opacity: u.attivo !== false ? 1 : 0.5 }}>
                      <td><b>{u.nome}</b></td>
                      <td className="cifra">{u.u || "—"}</td>
                      <td>{nomeRuolo(u.ruolo)}</td>
                      <td style={{ color: "var(--muto)" }}>{u.committente || u.struttura}</td>
                      <td style={{ color: "var(--muto)" }}>{u.reparto || "—"}</td>
                      <td>{u.attivo !== false ? <span className="pastiglia p-ok">attivo</span> : <span className="pastiglia p-neu">disattivato</span>}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn linea piccolo" onClick={() => setEditUtente({ ...u })}>Modifica</button>
                          <button className={"btn piccolo" + (u.attivo !== false ? " linea" : "")}
                            style={u.attivo !== false ? { color: "#d9534f" } : { background: "#5cb85c", color: "#fff" }}
                            onClick={() => st.commutaAttivoUtente(u.id)}>
                            {u.attivo !== false ? "Disattiva" : "Riattiva"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pannello-piede">
              Il nome utente di questa tabella è quello con cui si entra: creare un utente qui
              significa poter fare l'accesso con lui subito dopo. La password resta dimostrazione
              per tutti; in produzione ogni utente avrà la propria, con reset via email e log degli accessi.
            </div>

            {editUtente && (
              <ModaleUtente
                utente={editUtente === "nuovo" ? null : editUtente}
                ruoli={st.ruoli}
                strutture={STRUTTURE}
                committenti={st.committenti}
                repartiComunita={st.committenti.find((c) => c.id === "comunita")?.unita || []}
                onSalva={(u) => { if (st.salvaUtente(u)) setEditUtente(null); }}
                onChiudi={() => setEditUtente(null)}
              />
            )}
          </div>
        )}

        {tab === "ruoli" && <RuoliPermessi />}

        {tab === "notifiche" && (
          <div className="pannello">
            <div className="pannello-testa"><h2>Notifiche automatiche</h2></div>
            <div style={{ padding: "20px 24px" }}>
              {toggleNotifica("promemoria", "Promemoria prenotazione ai dipendenti che non hanno prenotato")}
              {toggleNotifica("cutoff", "Avviso cutoff in avvicinamento a chi ordina")}
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

  /* esporta quello che è a schermo, filtro compreso */
  async function esportaLog() {
    try {
      const { scaricaExcel } = await import("../excel.js");
      await scaricaExcel("Log_operazioni.xlsx", [
        { nome: "Log operazioni", dati: lista.map((l) => ({
          ora: l.ora, utente: l.utente, ruolo: l.ruolo, azione: l.azione, dettaglio: l.dettaglio, tipo: l.tipo,
        })), colonne: [
          { header: "Ora", key: "ora", width: 10 },
          { header: "Utente", key: "utente", width: 22 },
          { header: "Ruolo", key: "ruolo", width: 20 },
          { header: "Azione", key: "azione", width: 34 },
          { header: "Dettaglio", key: "dettaglio", width: 48 },
          { header: "Tipo", key: "tipo", width: 16 },
        ] },
      ], { datiAziendali: st.datiAziendali });
      st.avvisa("Log esportato in Excel, " + lista.length + " operazioni");
    } catch (e) {
      console.error(e);
      st.avvisa("Errore nell'export Excel, riprova");
    }
  }

  return (
    <>
      <Intestazione
        occhiello="Audit trail"
        titolo="Log operazioni"
        sotto="Cronologia di tutte le azioni eseguite nel portale, filtrabile per tipo"
        azioni={st.puo("log.excel") && (
          <button className="btn linea piccolo" onClick={esportaLog}>
            <Icone.scarica size={16} /> Esporta
          </button>
        )}
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
  const strutture = st.committenti;
  const [attivo, setAttivo] = React.useState(strutture[0]?.id);
  const [nuovoReparto, setNuovoReparto] = React.useState("");
  const c = strutture.find((s) => s.id === attivo) || strutture[0];
  const modificabile = st.puo("impostazioni.modifica");
  const cambia = (campo, val) => st.aggiornaCommittente(attivo, { [campo]: val });
  const conIva = regimeIva(c.regimeIva).conIva;

  /* passando a "senza IVA" l'aliquota si azzera e si propone la dicitura di
     esenzione; tornando a ordinaria si riparte dal 10%, che è l'aliquota
     della ristorazione collettiva */
  function cambiaRegime(id) {
    const r = regimeIva(id);
    const patch = { regimeIva: id };
    if (!r.conIva) {
      patch.ivaPercentuale = 0;
      if (!(c.dicituraIva || "").trim()) patch.dicituraIva = r.dicitura;
    } else if (!(Number(c.ivaPercentuale) > 0)) {
      patch.ivaPercentuale = 10;
    }
    st.aggiornaCommittente(c.id, patch);
  }

  function aggiungiReparto(e) {
    e.preventDefault();
    const nome = nuovoReparto.trim();
    if (!nome || c.unita.includes(nome)) return;
    st.aggiornaCommittente(c.id, { unita: [...c.unita, nome] });
    st.avvisa(nome + " aggiunto");
    setNuovoReparto("");
  }
  function togliReparto(nome) {
    st.aggiornaCommittente(c.id, { unita: c.unita.filter((u) => u !== nome) });
    st.avvisa(nome + " rimosso");
  }

  return (
    <>
      <Intestazione
        occhiello="Configurazione servizio"
        titolo="Impostazioni per committente"
        sotto="Ogni struttura ha le sue regole. Qui si definiscono orari limite, listino, composizione del pasto e condizioni di fatturazione"
        azioni={modificabile && (
          <button className="btn piccolo" onClick={() => st.avvisa("Impostazioni salvate per " + c.nome)}>Salva</button>
        )}
      />
      <div className="tela">
        <div className="giorni-tab">
          {strutture.map((s) => (
            <button key={s.id} className={attivo === s.id ? "on" : ""} onClick={() => setAttivo(s.id)}>
              {s.tipo}<span>{s.nome}</span>
            </button>
          ))}
        </div>

        {/* un solo fieldset disattiva tutti i controlli della pagina in sola
            lettura: i tab dei committenti restano fuori e navigabili */}
        <fieldset disabled={!modificabile} style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}>
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
              <em>Etichetta libera mostrata al cliente. Il prezzo usato in Fatturazione è qui sotto.</em>
            </label>
          </div>
          <div className="impo-riga">
            <label>
              <span className="so-lab">Prezzo unitario a pasto</span>
              <input type="number" min="0" step="0.10" value={c.prezzoUnitario}
                onChange={(e) => cambia("prezzoUnitario", Number(e.target.value) || 0)} />
              <em>Precompila le righe di ogni nuova proforma di questo committente.</em>
            </label>
            <label>
              <span className="so-lab">Regola di composizione del pasto</span>
              <input type="text" value={c.regolaPasto} onChange={(e) => cambia("regolaPasto", e.target.value)} />
              <em>Base per l'indicatore di equilibrio nel vassoio del commensale.</em>
            </label>
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>Condizioni di fatturazione</h2>
            <span className="conta-piatti">{testoCondizioni(c)}</span>
          </div>
          <div style={{ padding: "18px 24px" }}>
            <div className="impo-riga">
              <label>
                <span className="so-lab">Termini di pagamento</span>
                <select value={c.termini || ""} onChange={(e) => cambia("termini", e.target.value)}>
                  {!c.termini && <option value="">Scegli i termini</option>}
                  {TERMINI_PAGAMENTO.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
                <em>I termini "fine mese" contano i giorni dall'ultimo giorno del mese di emissione.</em>
              </label>
              <label>
                <span className="so-lab">Metodo di pagamento</span>
                <select value={c.metodoPagamento || "bonifico"} onChange={(e) => cambia("metodoPagamento", e.target.value)}>
                  {METODI_PAGAMENTO.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
                <em>Con bonifico e SDD la proforma riporta l'IBAN dei Dati aziendali.</em>
              </label>
            </div>
            <div className="impo-riga">
              <label>
                <span className="so-lab">Regime IVA</span>
                <select value={c.regimeIva || "ordinaria"} onChange={(e) => cambiaRegime(e.target.value)}>
                  {REGIMI_IVA.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
                </select>
                <em>Senza IVA la proforma espone comunque la riga IVA a zero, con la dicitura.</em>
              </label>
              <label>
                <span className="so-lab">Aliquota IVA %</span>
                <input type="number" min="0" max="100" step="1" value={c.ivaPercentuale} disabled={!conIva}
                  onChange={(e) => cambia("ivaPercentuale", Number(e.target.value) || 0)} />
                <em>{conIva ? "Applicata sull'imponibile di ogni proforma." : "Disattivata: il regime scelto è senza IVA."}</em>
              </label>
            </div>
            {!conIva && (
              <div className="impo-riga">
                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="so-lab">Dicitura di esenzione</span>
                  <input type="text" value={c.dicituraIva || ""} onChange={(e) => cambia("dicituraIva", e.target.value)}
                    placeholder="Operazione esente IVA ai sensi dell'art. 10 DPR 633/72" />
                  <em>Stampata nel blocco Condizioni della proforma.</em>
                </label>
              </div>
            )}
            <div className="impo-riga tre">
              <label>
                <span className="so-lab">Codice fiscale</span>
                <input type="text" value={c.cf || ""} onChange={(e) => cambia("cf", e.target.value)} />
                <em>Se diverso dalla P.IVA.</em>
              </label>
              <label>
                <span className="so-lab">PEC</span>
                <input type="text" value={c.pec || ""} onChange={(e) => cambia("pec", e.target.value)} />
                <em>Recapito per la fattura elettronica.</em>
              </label>
              <label>
                <span className="so-lab">Codice destinatario SDI</span>
                <input type="text" value={c.codiceSdi || ""} onChange={(e) => cambia("codiceSdi", e.target.value)} />
                <em>Sette caratteri, in alternativa alla PEC.</em>
              </label>
            </div>
          </div>
          <div className="pannello-piede">
            Queste condizioni precompilano ogni nuova proforma di {c.nome} in <b>Fatturazione</b>, dove
            restano modificabili per il singolo documento. Le proforma già emesse non cambiano.
          </div>
        </div>

        <div className="pannello">
          <div className="pannello-testa">
            <h2>{c.tipo === "Comunità" || c.etichettaUnita === "Centro" ? "Centri" : "Reparti"}</h2>
            <span className="conta-piatti">{c.unita.length} censiti per {c.nome}</span>
          </div>
          <div style={{ padding: "18px 24px" }}>
            <p style={{ fontSize: 12.5, color: "var(--muto)", margin: "0 0 14px" }}>
              {c.tipo === "Comunità"
                ? <>Determinano chi vede cosa: nel portale comunità il referente assegnato a un centro
                  vede e gestisce solo i pazienti, le presenze e le variazioni di quel centro (campo
                  "Stanza / struttura" del paziente). Ogni centro è anche una destinazione di consegna
                  nella distinta di produzione. Rimuovere un centro non sposta i pazienti già assegnati.</>
                : <>Reparti dell'azienda: servono a leggere prenotazioni e resoconti per reparto. La
                  consegna resta unica per tutta l'azienda.</>}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {c.unita.length === 0 && <span style={{ fontSize: 13, color: "var(--muto)" }}>Nessuno ancora.</span>}
              {c.unita.map((u) => (
                <span key={u} className="pastiglia p-neu" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "6px 8px 6px 12px" }}>
                  {u}
                  <button type="button" onClick={() => togliReparto(u)} aria-label={"rimuovi " + u}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muto)", display: "flex", padding: 2 }}>
                    <Icone.x size={13} />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={aggiungiReparto} style={{ display: "flex", gap: 10, maxWidth: 420 }}>
              <input type="text" value={nuovoReparto} onChange={(e) => setNuovoReparto(e.target.value)}
                placeholder={c.tipo === "Comunità" ? "Nuovo centro" : "Nuovo " + String(c.etichettaUnita || "reparto").toLowerCase()}
                style={{ flex: 1, padding: "9px 12px", border: "1px solid var(--linea-forte)", borderRadius: "var(--r-s)", fontFamily: "var(--sans)", fontSize: 14 }} />
              <button type="submit" className="btn linea piccolo" disabled={!nuovoReparto.trim()}>
                <Icone.piu size={14} /> Aggiungi
              </button>
            </form>
          </div>
          <div className="pannello-piede">
            {c.tipo === "Comunità"
              ? <>L'elenco alimenta anche il menu a tendina di "Stanza / struttura" nel modulo paziente e
                il campo Centro assegnato del referente in Gestione portale → Utenti.</>
              : <>L'elenco è quello dei reparti mostrati nei resoconti dell'azienda.</>}
          </div>
        </div>
        </fieldset>
      </div>
    </>
  );
}
