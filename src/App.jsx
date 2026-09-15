import React from "react";
import { Provider, usaStato } from "./store.jsx";
import AccessoUnico from "./Accesso.jsx";
import Azienda from "./aree/Azienda.jsx";
import PortaleStruttura, { STRUTTURE } from "./aree/Struttura.jsx";
import Fornitore from "./aree/Fornitore.jsx";

function Instradamento() {
  const st = usaStato();
  const { sessione, ruoloSessione, esci } = st;
  const [avvisoUscita, setAvvisoUscita] = React.useState("");

  /* un utente senza ruolo valido (ruolo eliminato mentre era dentro, o record
     incompleto) non ha nessun portale in cui stare: si torna al login, dove
     il motivo si vede davvero — sull'accesso non c'è la coda dei toast */
  React.useEffect(() => {
    if (sessione && !ruoloSessione) {
      setAvvisoUscita("Il ruolo della tua utenza non è più configurato. Chiedi a MAVI di riassegnartelo.");
      esci();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessione, ruoloSessione]);

  if (!sessione || !ruoloSessione) {
    return <AccessoUnico avviso={avvisoUscita} onAvvisoLetto={() => setAvvisoUscita("")} />;
  }

  if (ruoloSessione.portale === "mavi") return <Fornitore diretto onEsci={esci} utente={sessione} />;
  if (ruoloSessione.portale === "azienda") return <Azienda onEsci={esci} utente={sessione} />;

  /* un utente di un committente creato in demo non ha una configurazione in
     STRUTTURE: si usa il telaio comunità, che è il portale base del tipo */
  const tipo = STRUTTURE[sessione.struttura] ? sessione.struttura : "comunita";
  return <PortaleStruttura tipo={tipo} onEsci={esci} utente={sessione} />;
}

export default function App() {
  return (
    <Provider>
      <Instradamento />
    </Provider>
  );
}
