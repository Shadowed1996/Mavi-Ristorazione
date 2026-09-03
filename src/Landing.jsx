import { Link } from "react-router-dom";
import { Icone, Illustrazione, Marchio } from "./ui.jsx";

const PORTALI = [
  {
    to: "/azienda", area: "dipendente", numero: "01", icona: Icone.edificio,
    titolo: "Azienda", sotto: "Mensa aziendale",
    testo: "Ogni dipendente compone il proprio pasto dal menu del giorno e prenota entro l'orario limite.",
    punti: ["Dipendente", "Referente aziendale"],
    modello: "Ordinazione individuale",
  },
  {
    to: "/rsa", area: "rsa", numero: "02", icona: Icone.gente,
    titolo: "RSA", sotto: "Residenza assistenziale",
    testo: "L'operatore dichiara le quantità del nucleo per dieta e consistenza, senza dati clinici.",
    punti: ["Operatore di nucleo", "Responsabile di struttura"],
    modello: "Ordinazione per unità",
  },
  {
    to: "/comunita", area: "comunita", numero: "03", icona: Icone.foglia,
    titolo: "Comunità", sotto: "Casa alloggio",
    testo: "L'educatore di turno dichiara i pasti della propria casa su un menu essenziale.",
    punti: ["Educatore di turno", "Coordinatore"],
    modello: "Ordinazione per unità",
  },
  {
    to: "/scuola", area: "scuola", numero: "04", icona: Icone.lista,
    titolo: "Scuola", sotto: "Istituto paritario",
    testo: "Non si sceglie, si contano i presenti per classe. Menu vidimato e grammature per età.",
    punti: ["Insegnante", "Segreteria"],
    modello: "Rilevazione presenze",
  },
  {
    to: "/mavi", area: "fornitore", numero: "05", icona: Icone.cuoco,
    titolo: "MAVI", sotto: "La cucina",
    testo: "Compone i menu, riceve le distinte già aggregate da tutte le strutture e fattura.",
    punti: ["Cucina e amministrazione"],
    modello: "Portale del fornitore",
  },
];

const VETRINA = ["uni_ris", "sal_for", "ins_mis", "ris_fun", "ver_gri", "las_bol"];

export default function Landing() {
  return (
    <>
      <div className="nastro">
        <b>Prototipo dimostrativo.</b> Dati di esempio, nessun salvataggio reale.
      </div>

      <div className="home">
        <header className="home-testa">
          <div className="home-marchio">
            <Marchio sotto="Ristorazione" />
          </div>
          <span className="home-data">Settimana 36 · 31 agosto 2026</span>
        </header>

        <section className="home-apertura">
          <div className="home-claim">
            <span className="home-etichetta">Portale pasti aziendali</span>
            <h1>Il pranzo aziendale,<br /><em>ordinato bene.</em></h1>
            <p>
              Aziende, residenze, comunità e scuole ordinano ciascuna a modo suo. La cucina
              riceve un unico documento certo su cui produrre. Nessun foglio, nessun messaggio,
              nessun conteggio fatto a mano il mattino presto.
            </p>
            <div className="home-numeri">
              <div><b>4</b><span>tipi di struttura</span></div>
              <div><b>14</b><span>allergeni dichiarati</span></div>
              <div><b>3</b><span>modelli di ordinazione</span></div>
            </div>
          </div>

          <div className="home-vetrina" aria-hidden="true">
            <span className="vetrina-cerchio" />
            {VETRINA.map((id, i) => (
              <span className={"vetrina-disco d" + i} key={id}>
                <Illustrazione id={id} />
              </span>
            ))}
          </div>
        </section>

        <section className="home-portali">
          <div className="home-titoletto"><span>Scegli la struttura</span><i /></div>
          <div className="portali">
            {PORTALI.map((p) => {
              const Ic = p.icona;
              return (
                <Link className="portale" to={p.to} data-area={p.area} key={p.to}>
                  <span className="portale-alto">
                    <span className="portale-icona"><Ic size={20} /></span>
                    <span className="portale-num">{p.numero}</span>
                  </span>
                  <span className="portale-sotto">{p.sotto}</span>
                  <h2>{p.titolo}</h2>
                  <p>{p.testo}</p>
                  <span className="portale-modello">{p.modello}</span>
                  <span className="portale-punti">
                    {p.punti.map((x) => (<span key={x}><Icone.ok size={13} />{x}</span>))}
                  </span>
                  <span className="entra">Entra <Icone.dx size={15} /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="home-piede">
          <span>Prototipo di presentazione, i dati non vengono salvati.</span>
          <span>Allergeni secondo il Regolamento UE 1169/2011.</span>
          <span>Codice colori WHP, Regione Lombardia.</span>
        </footer>
      </div>
    </>
  );
}
