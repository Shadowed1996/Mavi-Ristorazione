import React from "react";
import { Provider, usaStato } from "./store.jsx";
import AccessoUnico from "./Accesso.jsx";
import Azienda from "./aree/Azienda.jsx";
import PortaleStruttura from "./aree/Struttura.jsx";
import Fornitore from "./aree/Fornitore.jsx";

function Instradamento() {
  const st = usaStato();
  const [sessione, setSessione] = React.useState(null);

  function entra(utente) {
    setSessione(utente);
    if (utente.struttura !== "mavi") st.setCommittente(utente.struttura);
  }
  const esci = () => setSessione(null);

  if (!sessione) return <AccessoUnico onEntra={entra} />;

  if (sessione.struttura === "mavi") return <Fornitore diretto onEsci={esci} />;
  if (sessione.struttura === "azienda")
    return <Azienda ruoloIniziale={sessione.ruolo} onEsci={esci} utente={sessione} />;
  return (
    <PortaleStruttura
      tipo={sessione.struttura}
      ruoloIniziale={sessione.ruolo}
      onEsci={esci}
      utente={sessione}
    />
  );
}

export default function App() {
  return (
    <Provider>
      <Instradamento />
    </Provider>
  );
}
