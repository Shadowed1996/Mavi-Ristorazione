import React from "react";
import { ETICHETTE_RUOLO, ETICHETTE_STRUTTURA } from "./data.js";
import { usaStato } from "./store.jsx";
import { Icone, Marchio } from "./ui.jsx";

/* Accesso unico. Non si sceglie il portale, lo decide il profilo. */
export default function AccessoUnico({ avviso, onAvvisoLetto }) {
  const st = usaStato();
  const [u, setU] = React.useState("");
  const [p, setP] = React.useState("dimostrazione");
  const [errore, setErrore] = React.useState("");
  const [profili, setProfili] = React.useState(false);
  /* motivo dell'uscita forzata dal portale, mostrato dove l'utente guarda */
  const messaggio = errore || avviso || "";
  const pulisci = () => {
    setErrore("");
    if (avviso && onAvvisoLetto) onAvvisoLetto();
  };

  const attivi = st.utenti.filter((x) => x.attivo !== false);
  const nomeRuolo = (id) => {
    const r = st.ruoli.find((x) => x.id === id);
    return (r && r.nome) || ETICHETTE_RUOLO[id] || id;
  };

  function entra(e) {
    if (e) e.preventDefault();
    const pulito = String(u).trim().toLowerCase();
    const utente = st.trovaUtente(pulito);
    if (!utente) {
      const disattivato = st.utenti.some((x) => x.u === pulito && x.attivo === false);
      setErrore(disattivato
        ? "Utenza disattivata. Chiedi a chi amministra il portale di riattivarla."
        : "Nome utente non riconosciuto. Verifica di averlo scritto per intero.");
      return;
    }
    if (!st.ruoli.some((r) => r.id === utente.ruolo)) {
      setErrore("A questa utenza non è assegnato un ruolo valido. Chiedi a chi amministra il portale.");
      return;
    }
    pulisci();
    st.entra(utente);
  }

  function scegli(utente) {
    setU(utente.u);
    pulisci();
    st.entra(utente);
  }

  return (
    <div data-area="fornitore">
      <div className="nastro">
        <b>Prototipo dimostrativo.</b> Dati di esempio, nessun salvataggio reale.
      </div>

      <div className="accesso-unico">
        <div className="au-sinistra">
          <div className="au-marchio"><Marchio sotto="Ristorazione" /></div>
          <svg className="au-illustrazione" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="luce" cx="38%" cy="35%" r="55%">
                <stop offset="0%" stopColor="#f2ece1" stopOpacity="0.14" />
                <stop offset="60%" stopColor="#f2ece1" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#f2ece1" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="metallo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f2ece1" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#d5c9b1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f2ece1" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="manico" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f2ece1" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#f2ece1" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* piatto esterno */}
            <circle cx="220" cy="195" r="145" fill="url(#luce)" stroke="#f2ece1" strokeOpacity="0.18" strokeWidth="2" />
            {/* bordo decorativo */}
            <circle cx="220" cy="195" r="130" fill="none" stroke="#f2ece1" strokeOpacity="0.1" strokeWidth="1" />
            {/* piatto interno */}
            <circle cx="220" cy="195" r="105" fill="none" stroke="#f2ece1" strokeOpacity="0.08" strokeWidth="1" />
            {/* riflesso */}
            <path d="M135 145 A105 105 0 0 1 185 105" stroke="#f2ece1" strokeOpacity="0.15" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* forchetta */}
            <g transform="translate(32, 115)">
              {/* rebbi */}
              <rect x="0" y="0" width="3" height="42" rx="1.5" fill="url(#metallo)" />
              <rect x="9" y="0" width="3" height="42" rx="1.5" fill="url(#metallo)" />
              <rect x="18" y="0" width="3" height="42" rx="1.5" fill="url(#metallo)" />
              <rect x="27" y="0" width="3" height="42" rx="1.5" fill="url(#metallo)" />
              {/* collo */}
              <path d="M0 42 Q0 56 7 58 L7 68 Q14 72 22 68 L22 58 Q30 56 30 42" fill="url(#metallo)" />
              {/* manico */}
              <rect x="8" y="68" width="14" height="100" rx="4" fill="url(#manico)" />
              <rect x="10" y="72" width="2" height="90" rx="1" fill="#f2ece1" fillOpacity="0.08" />
            </g>

            {/* coltello */}
            <g transform="translate(382, 110)">
              {/* lama */}
              <path d="M0 0 Q-8 30 -5 60 L0 60 Q4 30 2 0 Z" fill="url(#metallo)" />
              {/* filo */}
              <path d="M0 2 Q-7 30 -4 58" stroke="#f2ece1" strokeOpacity="0.12" strokeWidth="0.8" fill="none" />
              {/* dorso lama */}
              <path d="M2 0 Q4 30 0 60" stroke="#f2ece1" strokeOpacity="0.06" strokeWidth="1" fill="none" />
              {/* collo */}
              <rect x="-4" y="58" width="9" height="12" rx="2" fill="url(#metallo)" />
              {/* manico */}
              <rect x="-5" y="70" width="12" height="100" rx="4" fill="url(#manico)" />
              <rect x="-2" y="74" width="2" height="90" rx="1" fill="#f2ece1" fillOpacity="0.08" />
            </g>

            {/* tre portate stilizzate sul piatto */}
            {/* primo - giallo */}
            <ellipse cx="195" cy="185" rx="35" ry="25" fill="#e0b249" fillOpacity="0.2" />
            <ellipse cx="195" cy="185" rx="35" ry="25" stroke="#e0b249" strokeOpacity="0.15" strokeWidth="1" fill="none" />
            {/* secondo - rosso */}
            <ellipse cx="250" cy="175" rx="30" ry="22" fill="#c8443b" fillOpacity="0.18" />
            <ellipse cx="250" cy="175" rx="30" ry="22" stroke="#c8443b" strokeOpacity="0.12" strokeWidth="1" fill="none" />
            {/* contorno - verde */}
            <ellipse cx="220" cy="215" rx="38" ry="18" fill="#4e8c4a" fillOpacity="0.18" />
            <ellipse cx="220" cy="215" rx="38" ry="18" stroke="#4e8c4a" strokeOpacity="0.12" strokeWidth="1" fill="none" />
          </svg>

          <div className="au-claim">
            <span className="occhiello">Ristorazione collettiva, ripensata</span>
            <h1>Ogni pasto ha<br /><em>la sua storia</em>.</h1>
            <p>
              Dal menu alla tavola, dalla scelta alla consegna. Una piattaforma che conosce
              chi serve, rispetta chi cucina, e semplifica chi organizza.
            </p>
          </div>
          <ul className="au-passi">
            <li><span>1</span>Aziende, scuole, RSA e comunità</li>
            <li><span>2</span>Diete, consistenze, allergeni sotto controllo</li>
            <li><span>3</span>Dalla cucina al reparto, tutto tracciato</li>
          </ul>
        </div>

        <div className="au-destra">
          <div className="au-modulo">
            <span className="occhiello">Accedi</span>
            <h2>Entra nel portale</h2>
            <p className="au-sotto">Le credenziali le riceve ogni utente dal proprio referente.</p>

            <form onSubmit={entra}>
              <div className="campo">
                <label htmlFor="au-u">Nome utente</label>
                <input id="au-u" type="text" autoComplete="username" placeholder="nome.cognome"
                  value={u} onChange={(e) => { setU(e.target.value); pulisci(); }} />
              </div>
              <div className="campo">
                <label htmlFor="au-p">Password</label>
                <input id="au-p" type="password" autoComplete="current-password"
                  value={p} onChange={(e) => setP(e.target.value)} />
              </div>
              {messaggio && <div className="au-errore"><Icone.attenzione size={16} /> {messaggio}</div>}
              <button className="btn pieno" type="submit">Accedi</button>
            </form>

            <button className="au-mostra" onClick={() => setProfili((x) => !x)}>
              {profili ? "Nascondi i profili di prova" : "Mostra i profili di prova"}
              <Icone.dx size={14} />
            </button>

            {profili && (
              <div className="au-profili">
                {attivi.map((x) => (
                  <button key={x.u} className="au-profilo" data-area={x.struttura} onClick={() => scegli(x)}>
                    <span className="au-iniziali">{x.iniziali}</span>
                    <span className="au-testo">
                      <b>{x.nome}</b>
                      <span>{x.committente} · {x.mansione}</span>
                    </span>
                    <span className="au-tag">
                      <em>{ETICHETTE_STRUTTURA[x.struttura] || x.committente}</em>
                      {nomeRuolo(x.ruolo)}
                    </span>
                  </button>
                ))}
                <p className="au-nota">
                  La password è la stessa per tutti, dimostrazione. Nel prodotto reale ogni utente
                  ha la propria e la cambia al primo accesso.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}