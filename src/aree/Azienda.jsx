import React from "react";
import { usaStato } from "../store.jsx";
import Dipendente from "./Dipendente.jsx";
import Cliente from "./Cliente.jsx";

/* Smistatore del portale azienda: due telai diversi, dipendente e referente.
   Quale dei due lo dice il campo `vista` del ruolo; per un ruolo creato a mano
   che non lo dichiara si guarda se ha almeno una pagina da referente. */
export default function Azienda({ onEsci, utente }) {
  const st = usaStato();
  const ruolo = st.ruoloSessione;

  React.useEffect(() => {
    st.setCommittente((utente && utente.struttura) || "azienda");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paginePerVista = {
    dipendente: ["menu.vedi", "settimana.vedi", "prenotazioni.vedi", "diete.vedi"],
    referente: ["cruscotto.vedi", "dipendenti.vedi", "resoconti.vedi", "fatture.vedi"],
  };
  const haPagine = (v) => paginePerVista[v].some((k) => st.puo(k));
  const dichiarata = ruolo && (ruolo.vista === "referente" || ruolo.vista === "dipendente") ? ruolo.vista : null;
  /* se il telaio dichiarato non ha nessuna pagina permessa ma l'altro sì, si
     usa quello: meglio il portale giusto di una barra laterale vuota */
  const vista = dichiarata && (haPagine(dichiarata) || !haPagine(dichiarata === "dipendente" ? "referente" : "dipendente"))
    ? dichiarata
    : (haPagine("referente") ? "referente" : "dipendente");

  return vista === "dipendente"
    ? <Dipendente onEsci={onEsci} utente={utente} />
    : <Cliente onEsci={onEsci} utente={utente} />;
}
