import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";
import Preloader from "./Preloader.jsx";

function Avvio() {
  const [pronto, setPronto] = React.useState(
    () => sessionStorage.getItem("mavi-avviato") === "1"
  );
  const finito = React.useCallback(() => {
    try { sessionStorage.setItem("mavi-avviato", "1"); } catch (e) { /* niente */ }
    setPronto(true);
  }, []);
  return (
    <>
      <App />
      {!pronto && <Preloader onFine={finito} />}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Avvio />
  </React.StrictMode>
);
