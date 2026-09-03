import React from "react";

/* Preloader di apertura.
   Il piatto si prepara sul tavolo: si posano le posate, poi tre
   portate arrivano e alla fine il piatto è completo.
   Solo al primo avvio della sessione. */
export default function Preloader({ onFine }) {
  const [passo, setPasso] = React.useState(0);
  const [uscita, setUscita] = React.useState(false);

  React.useEffect(() => {
    const t = [
      setTimeout(() => setPasso(1), 320),
      setTimeout(() => setPasso(2), 720),
      setTimeout(() => setPasso(3), 1120),
      setTimeout(() => setPasso(4), 1520),
      setTimeout(() => setUscita(true), 2400),
      setTimeout(onFine, 3050),
    ];
    return () => t.forEach(clearTimeout);
  }, [onFine]);

  return (
    <div className={"preloader" + (uscita ? " via" : "")}>
      <div className="pre-fondo" aria-hidden="true">
        <span className="pre-alone a" />
        <span className="pre-alone b" />
        <span className="pre-alone c" />
      </div>

      <div className="pre-centro">
        <div className="pre-scena">
          <svg viewBox="0 0 320 240" className="pre-svg" aria-hidden="true" role="img">
            <defs>
              <radialGradient id="preLuce" cx="40%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#f6ecda" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#e8dcc0" stopOpacity="0.5" />
              </radialGradient>
              <linearGradient id="preLama" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f2ede2" />
                <stop offset="55%" stopColor="#d6cdb8" />
                <stop offset="100%" stopColor="#a8a08b" />
              </linearGradient>
              <linearGradient id="preManico" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a3d2e" />
                <stop offset="100%" stopColor="#2d251b" />
              </linearGradient>
            </defs>

            {/* tavola apparecchiata */}
            <ellipse cx="160" cy="220" rx="140" ry="14" fill="#000" opacity="0.28" />

            {/* forchetta a sinistra */}
            <g className={"pre-posate sx" + (passo >= 1 ? " dentro" : "")} transform="translate(0,0)">
              <rect x="52" y="82" width="6" height="88" rx="3" fill="url(#preManico)" />
              <path d="M42 60 L44 96 L48 96 L48 60 M50 60 L50 96 L54 96 L54 60 M56 60 L56 96 L60 96 L62 60"
                fill="none" stroke="url(#preLama)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M42 96 Q52 104 62 96 L60 108 Q52 112 44 108 Z" fill="url(#preLama)" />
            </g>

            {/* coltello a destra, ben visibile */}
            <g className={"pre-posate dx" + (passo >= 1 ? " dentro" : "")}>
              <rect x="262" y="82" width="6" height="88" rx="3" fill="url(#preManico)" />
              <path d="M259 46 Q252 72 258 96 L272 96 Q274 72 268 46 Z" fill="url(#preLama)" />
              <path d="M259 46 Q253 71 258 96" fill="none" stroke="#8a8272" strokeWidth="1.2" opacity="0.7" />
              <path d="M262 52 Q259 74 262 92" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.6" fill="none" />
            </g>

            {/* piatto */}
            <g transform="translate(160,124)">
              <ellipse cx="0" cy="8" rx="98" ry="20" fill="#000" opacity="0.22" />
              <circle r="94" fill="url(#preLuce)" />
              <circle r="94" fill="none" stroke="#c9beaa" strokeWidth="1.2" opacity="0.6" />
              <circle r="78" fill="#fbf5e8" />
              <circle r="78" fill="none" stroke="#d5c9b1" strokeOpacity="0.55" strokeWidth="1" />
              <circle r="62" fill="#f2e9d2" opacity="0.6" />
              <path d="M-68 -22 A78 78 0 0 1 -22 -70" fill="none" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="4" strokeLinecap="round" />

              {/* portata gialla, primo */}
              <g className={"pre-portata p1" + (passo >= 2 ? " giu" : "")}>
                <ellipse cx="-26" cy="-18" rx="30" ry="22" fill="#f0d488" />
                <ellipse cx="-26" cy="-18" rx="30" ry="22" fill="none" stroke="#b48a30" strokeOpacity="0.35" strokeWidth="1.2" />
                {[[-40, -22], [-30, -30], [-16, -22], [-24, -8], [-38, -10], [-20, -24]].map(([x, y], i) => (
                  <rect key={i} x={x} y={y} width="12" height="4.5" rx="2" fill="#e0b249"
                    transform={`rotate(${i * 47} ${x + 6} ${y + 2})`} />
                ))}
              </g>

              {/* portata rossa, secondo */}
              <g className={"pre-portata p2" + (passo >= 3 ? " giu" : "")}>
                <ellipse cx="30" cy="-14" rx="28" ry="22" fill="#c8443b" />
                <ellipse cx="30" cy="-14" rx="28" ry="22" fill="none" stroke="#8b2f27" strokeOpacity="0.4" strokeWidth="1.2" />
                <path d="M8 -18 Q30 -26 52 -18" stroke="#9c3830" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M8 -8 Q30 -16 52 -8" stroke="#9c3830" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <ellipse cx="22" cy="-20" rx="6" ry="3" fill="#ffffff" opacity="0.25" />
              </g>

              {/* portata verde, contorno */}
              <g className={"pre-portata p3" + (passo >= 4 ? " giu" : "")}>
                <ellipse cx="0" cy="34" rx="46" ry="20" fill="#4e8c4a" />
                <ellipse cx="0" cy="34" rx="46" ry="20" fill="none" stroke="#2e5f2b" strokeOpacity="0.4" strokeWidth="1.2" />
                <ellipse cx="-18" cy="30" rx="12" ry="7" fill="#67a85e" transform="rotate(-18 -18 30)" />
                <ellipse cx="16" cy="36" rx="11" ry="6" fill="#3d7239" transform="rotate(14 16 36)" />
                <circle cx="8" cy="28" r="4" fill="#c0392b" />
                <circle cx="-4" cy="40" r="3" fill="#c0392b" />
              </g>
            </g>
          </svg>
        </div>

        <div className="pre-testo">
          <div className="pre-marchio">MAVI<span>Ristorazione</span></div>
          <div className="pre-portate">
            <span className={"pre-voce" + (passo >= 2 ? " viva" : "")}>
              <i style={{ background: "#e8b430" }} />Primo
            </span>
            <span className={"pre-voce" + (passo >= 3 ? " viva" : "")}>
              <i style={{ background: "#c8443b" }} />Secondo
            </span>
            <span className={"pre-voce" + (passo >= 4 ? " viva" : "")}>
              <i style={{ background: "#4e8c4a" }} />Contorno
            </span>
          </div>
          <div className="pre-barra"><i /></div>
          <span className="pre-payoff">Il pranzo aziendale, ordinato bene</span>
        </div>
      </div>
    </div>
  );
}
