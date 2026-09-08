import React from "react";
import { Icone } from "../ui.jsx";
import { usaStato } from "../store.jsx";
import { SceltaRuolo } from "./Struttura.jsx";
import Dipendente from "./Dipendente.jsx";
import Cliente from "./Cliente.jsx";

const CFG = {
  tema: "dipendente",
  nome: "Rossi Manifatture Spa",
  titolo: "Portale azienda",
  ruoli: [
    {
      id: "dipendente",
      nome: "Dipendente",
      cosa: "Consulta il menu del giorno, apre la scheda dei piatti e prenota il proprio pasto.",
      icona: "piatto",
    },
    {
      id: "referente",
      nome: "Referente aziendale",
      cosa: "Gestisce i commensali, controlla chi non ha prenotato, scarica resoconti e fatture.",
      icona: "grafico",
    },
  ],
};

export default function Azienda({ ruoloIniziale, onEsci, utente }) {
  const st = usaStato();
  const [ruolo, setRuolo] = React.useState(
    ruoloIniziale ? CFG.ruoli.find((r) => r.id === ruoloIniziale) : null
  );

  React.useEffect(() => {
    st.setCommittente("azienda");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ruolo)
    return <SceltaRuolo cfg={CFG} onIndietro={() => (onEsci ? onEsci() : null)} onScegli={(r) => setRuolo(r)} />;

  const esci = () => (ruoloIniziale ? onEsci && onEsci() : setRuolo(null));
  return ruolo.id === "dipendente"
    ? <Dipendente onEsci={esci} utente={utente} />
    : <Cliente onEsci={esci} utente={utente} />;
}
