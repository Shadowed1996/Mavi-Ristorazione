import React from "react";
import { ALLERGENI, COLORI, MARCATORI, PIATTI, ingredientiEvidenziati, sostituisce } from "./data.js";
import { usaStato } from "./store.jsx";
import { apriDocumento, blocco, elenco, etichette, paginaDocumento, paragrafo, tabellaHtml } from "./documento.js";

/* ============================ icone ============================ */
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
const Svg = ({ d, size = 18, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...s} aria-hidden="true">
    {children || <path d={d} />}
  </svg>
);

export const Icone = {
  piatto: (p) => <Svg {...p}><circle cx="12" cy="10" r="7" /><path d="M12 17v4" /></Svg>,
  lista: (p) => <Svg {...p}><rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M8 8h8M8 12h8M8 16h5" /></Svg>,
  foglia: (p) => <Svg {...p}><path d="M4 20C4 10 11 4 20 4c0 9-5.5 15-16 16z" /><path d="M4 20c4-5 8-7 12-8" /></Svg>,
  grafico: (p) => <Svg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Svg>,
  gente: (p) => <Svg {...p}><circle cx="9" cy="8" r="3.3" /><path d="M2.6 20c0-3.5 2.9-5.5 6.4-5.5s6.4 2 6.4 5.5" /><path d="M17 8.4a3 3 0 010 5M18.5 20c0-2-.7-3.5-2-4.6" /></Svg>,
  fattura: (p) => <Svg {...p}><path d="M6 2h9l5 5v15H6z" /><path d="M15 2v5h5M9 13h6M9 17h4" /></Svg>,
  cuoco: (p) => <Svg {...p}><path d="M6 21h12M6 17h12l.6-6.2A4.4 4.4 0 0016 4.6 4 4 0 0012 2a4 4 0 00-4 2.6 4.4 4.4 0 00-2.6 6.2z" /></Svg>,
  calendario: (p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M16 3v4M8 3v4M3 10h18" /></Svg>,
  sacco: (p) => <Svg {...p}><path d="M6 7h12l1.4 13.2a1 1 0 01-1 1.1H5.6a1 1 0 01-1-1.1z" /><path d="M9 10V6a3 3 0 016 0v4" /></Svg>,
  ok: (p) => <Svg {...p}><path d="M5 13l4.5 4.5L19 7" /></Svg>,
  piu: (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>,
  x: (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>,
  sx: (p) => <Svg {...p}><path d="M15 6l-6 6 6 6" /></Svg>,
  dx: (p) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>,
  lucchetto: (p) => <Svg {...p}><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 018 0v3" /></Svg>,
  scarica: (p) => <Svg {...p}><path d="M12 3v12M7.5 11L12 15.5 16.5 11M4 20h16" /></Svg>,
  stampa: (p) => <Svg {...p}><path d="M7 8V3h10v5" /><rect x="3" y="8" width="18" height="8" rx="2" /><path d="M7 14h10v7H7z" /></Svg>,
  griglia: (p) => <Svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Svg>,
  attenzione: (p) => <Svg {...p}><path d="M12 3l9.5 17H2.5z" /><path d="M12 10v4M12 17.5h.01" /></Svg>,
  edificio: (p) => <Svg {...p}><path d="M4 21V6l8-3 8 3v15" /><path d="M9 21v-5h6v5M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01" /></Svg>,
  utente: (p) => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.9 3.6-6 8-6s8 2.1 8 6" /></Svg>,
  matita: (p) => <Svg {...p}><path d="M4 20l1-4.5L15.5 5 19 8.5 8.5 19z" /><path d="M13.5 6.5L17 10" /></Svg>,
};

/* ============================ illustrazioni ============================ */
/* Nel prodotto finito qui va la fotografia reale del piatto.
   Finché non ci sono, disegniamo il piatto in ceramica visto dall'alto. */

const Tovaglia = ({ a, b }) => (
  <>
    <rect width="200" height="150" fill={a} />
    <circle cx="164" cy="10" r="58" fill={b} opacity="0.42" />
    <circle cx="16" cy="142" r="46" fill={b} opacity="0.3" />
    <circle cx="100" cy="80" r="70" fill="#1C1917" opacity="0.05" />
  </>
);

const Ceramica = ({ cy = 80, rx = 62, ry = 52, interno = "#FFFFFF" }) => (
  <>
    <ellipse cx="100" cy={cy + 4} rx={rx} ry={ry} fill="#1C1917" opacity="0.1" />
    <ellipse cx="100" cy={cy} rx={rx} ry={ry} fill="#FDFCFA" />
    <ellipse cx="100" cy={cy} rx={rx - 3} ry={ry - 3} fill="none" stroke="#1C1917" strokeOpacity="0.06" strokeWidth="1.2" />
    <ellipse cx="100" cy={cy} rx={rx - 12} ry={ry - 11} fill={interno} />
    <ellipse cx="100" cy={cy} rx={rx - 12} ry={ry - 11} fill="none" stroke="#1C1917" strokeOpacity="0.05" strokeWidth="1.2" />
    <path d={`M ${100 - rx + 8} ${cy - 12} A ${rx - 8} ${ry - 8} 0 0 1 ${100 - 14} ${cy - ry + 10}`}
      fill="none" stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="3" strokeLinecap="round" />
  </>
);

const Scodella = ({ colore }) => (
  <>
    <ellipse cx="100" cy="86" rx="62" ry="52" fill="#1C1917" opacity="0.1" />
    <ellipse cx="100" cy="82" rx="62" ry="52" fill="#FDFCFA" />
    <ellipse cx="100" cy="82" rx="49" ry="40" fill="#F2EDE4" />
    <ellipse cx="100" cy="83" rx="46" ry="37" fill={colore} />
    <ellipse cx="100" cy="83" rx="46" ry="37" fill="none" stroke="#1C1917" strokeOpacity="0.07" strokeWidth="1.4" />
  </>
);

/* elementi ricorrenti */
const Prezzemolo = ({ punti }) =>
  punti.map(([x, y, r], i) => (
    <g key={i}>
      <circle cx={x} cy={y} r={r} fill="#4E7A32" opacity="0.9" />
      <circle cx={x + r * 0.6} cy={y - r * 0.5} r={r * 0.7} fill="#67934A" opacity="0.85" />
    </g>
  ));

const DISEGNI = {
  pasta: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      <ellipse cx="100" cy="84" rx="40" ry="26" fill={p[2]} opacity="0.55" />
      {Array.from({ length: 11 }).map((_, i) => {
        const ang = i * 33;
        const x = 78 + (i % 5) * 11;
        const y = 70 + Math.floor(i / 5) * 12;
        return (
          <g key={i} transform={`rotate(${ang} ${x + 9} ${y + 4})`}>
            <rect x={x} y={y} width="19" height="9.5" rx="4.7" fill={p[3]} />
            <rect x={x + 2} y={y + 1.6} width="15" height="3" rx="1.5" fill="#FFFFFF" opacity="0.22" />
          </g>
        );
      })}
      <Prezzemolo punti={[[86, 68, 3.4], [118, 92, 3], [102, 100, 2.6]]} />
    </>
  ),
  risotto: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      <ellipse cx="100" cy="84" rx="41" ry="28" fill={p[2]} />
      <ellipse cx="100" cy="82" rx="34" ry="22" fill="#FBF6E9" opacity="0.75" />
      {Array.from({ length: 26 }).map((_, i) => {
        const x = 72 + (i % 7) * 9.4;
        const y = 70 + Math.floor(i / 7) * 8.6;
        return <ellipse key={i} cx={x} cy={y} rx="4.4" ry="2.7" fill="#FFFDF6" stroke="#E6DCC4" strokeWidth="0.6" transform={`rotate(${i * 37} ${x} ${y})`} />;
      })}
      {[[88, 76], [110, 86], [98, 92]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="9" ry="5.5" fill="#8A6034" transform={`rotate(${i * 40 - 20} ${x} ${y})`} />
          <ellipse cx={x - 1} cy={y - 1.4} rx="6" ry="3" fill="#A87A47" transform={`rotate(${i * 40 - 20} ${x} ${y})`} />
        </g>
      ))}
      <Prezzemolo punti={[[118, 74, 3], [82, 92, 2.6]]} />
    </>
  ),
  lasagna: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      <g>
        <path d="M66 100 L74 62 H126 L134 100 Z" fill="#E9D6A8" />
        <rect x="70" y="64" width="60" height="8" rx="2" fill="#F2DFB4" />
        <rect x="69" y="72" width="62" height="8" rx="2" fill={p[2]} />
        <rect x="68" y="80" width="64" height="8" rx="2" fill="#F2DFB4" />
        <rect x="67" y="88" width="66" height="8" rx="2" fill={p[2]} />
        <path d="M66 96 L134 96 L133 101 Q100 106 67 101 Z" fill="#FBF0D6" />
        <path d="M72 62 Q100 56 128 62 L126 66 Q100 61 74 66 Z" fill="#D9A24E" />
      </g>
      <Prezzemolo punti={[[92, 58, 3.6], [112, 60, 2.8]]} />
    </>
  ),
  zuppa: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Scodella colore={p[2]} />
      <ellipse cx="90" cy="76" rx="14" ry="9" fill="#FFFFFF" opacity="0.28" />
      {[[86, 88, 4], [104, 74, 3.2], [114, 90, 3.6], [96, 94, 2.8]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={p[3]} opacity="0.8" />
      ))}
      <path d="M78 92 Q100 100 122 90" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Prezzemolo punti={[[100, 70, 3.2], [112, 96, 2.6]]} />
    </>
  ),
  carne: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      <g>
        <path d="M70 82 Q70 62 100 60 Q130 62 130 82 Q130 102 100 104 Q70 102 70 82 Z" fill={p[2]} />
        <path d="M70 82 Q70 62 100 60 Q130 62 130 82 Q130 102 100 104 Q70 102 70 82 Z" fill="none" stroke="#1C1917" strokeOpacity="0.09" strokeWidth="1.4" />
        <path d="M78 74 Q100 70 122 74" stroke={p[3]} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M76 84 Q100 80 124 84" stroke={p[3]} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M78 94 Q100 90 122 94" stroke={p[3]} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.85" />
      </g>
      <ellipse cx="68" cy="102" rx="14" ry="7" fill="#5E8A47" transform="rotate(-16 68 102)" />
      <ellipse cx="132" cy="66" rx="10" ry="5" fill="#5E8A47" transform="rotate(18 132 66)" />
      <Prezzemolo punti={[[104, 62, 3], [92, 104, 2.6]]} />
    </>
  ),
  pesce: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      <g>
        <path d="M64 82 Q84 60 116 62 Q136 64 138 82 Q136 100 116 102 Q84 104 64 82 Z" fill={p[2]} />
        <path d="M70 82 Q90 68 118 70" stroke={p[3]} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M70 84 Q90 96 118 94" stroke={p[3]} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M78 74 Q98 78 118 76 M78 90 Q98 86 118 88" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <g>
        <circle cx="70" cy="104" r="11" fill="#F4D65E" />
        <circle cx="70" cy="104" r="11" fill="none" stroke="#E0BC3E" strokeWidth="1.4" />
        <path d="M70 93v22M59 104h22" stroke="#FFFDF2" strokeWidth="1.6" />
      </g>
      <Prezzemolo punti={[[112, 60, 3.4], [128, 96, 2.8]]} />
    </>
  ),
  polpette: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      <ellipse cx="100" cy="86" rx="42" ry="27" fill={p[2]} />
      {[[85, 76], [113, 74], [99, 92], [76, 92], [122, 92]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y + 2} rx="12" ry="10" fill="#1C1917" opacity="0.14" />
          <circle cx={x} cy={y} r="12" fill={p[3]} />
          <circle cx={x} cy={y} r="12" fill="none" stroke="#1C1917" strokeOpacity="0.1" strokeWidth="1.2" />
          <ellipse cx={x - 4} cy={y - 4.5} rx="4.5" ry="3" fill="#FFFFFF" opacity="0.22" />
        </g>
      ))}
      <Prezzemolo punti={[[100, 66, 3.4], [90, 100, 2.8]]} />
    </>
  ),
  tofu: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      {[[72, 70, -12], [102, 64, 8], [86, 92, 16], [116, 86, -6]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x + 13} ${y + 10})`}>
          <rect x={x} y={y + 2} width="27" height="21" rx="4" fill="#1C1917" opacity="0.12" />
          <rect x={x} y={y} width="27" height="21" rx="4" fill={p[2]} stroke={p[3]} strokeWidth="1.6" />
          <path d={`M${x + 4} ${y + 6} h19 M${x + 4} ${y + 12} h19`} stroke={p[3]} strokeWidth="1.4" opacity="0.55" />
        </g>
      ))}
      <ellipse cx="128" cy="70" rx="12" ry="6" fill="#5E8A47" transform="rotate(-20 128 70)" />
      <Prezzemolo punti={[[76, 100, 3], [110, 104, 2.6]]} />
    </>
  ),
  burger: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      <g>
        <path d="M66 76 Q66 52 100 52 Q134 52 134 76 Z" fill={p[2]} />
        <path d="M74 60 Q100 54 126 60" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {[[86, 62], [100, 58], [113, 63], [93, 68], [107, 67]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="2.4" ry="1.5" fill="#FFF6DE" />
        ))}
        <path d="M64 76 h72 q0 8 -6 8 h-60 q-6 0 -6 -8 z" fill="#5E8A47" />
        <rect x="65" y="83" width="70" height="14" rx="4" fill={p[3]} />
        <rect x="65" y="83" width="70" height="14" rx="4" fill="none" stroke="#1C1917" strokeOpacity="0.12" strokeWidth="1.2" />
        <path d="M66 97 h68 q-4 13 -34 13 q-30 0 -34 -13 z" fill={p[2]} />
      </g>
    </>
  ),
  insalata: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Scodella colore="#FBFAF4" />
      {[[82, 72, "#4E7A32", -18], [114, 70, "#67934A", 22], [96, 90, "#3E6628", -6],
        [74, 90, "#7FAE5C", 14], [122, 90, "#4E7A32", -24], [102, 76, "#8FBE6B", 8]].map(([x, y, c, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="17" ry="11" fill={c} />
          <path d={`M${x - 12} ${y} q12 -7 24 0`} stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="2" fill="none" />
        </g>
      ))}
      {[[90, 84, 6], [116, 78, 5], [78, 78, 4.2]].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#C0392B" />
          <ellipse cx={x - r * 0.35} cy={y - r * 0.4} rx={r * 0.35} ry={r * 0.25} fill="#FFFFFF" opacity="0.35" />
        </g>
      ))}
      {[[104, 94, "#E8A33A"], [86, 96, "#E8A33A"]].map(([x, y, c], i) => (
        <ellipse key={i} cx={x} cy={y} rx="7" ry="3" fill={c} transform={`rotate(${i * 30 - 15} ${x} ${y})`} />
      ))}
    </>
  ),
  patate: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      {[[72, 72, -28], [98, 64, 12], [120, 78, -8], [82, 92, 26], [108, 94, -18]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x + 12} ${y + 9})`}>
          <rect x={x} y={y + 2} width="25" height="18" rx="5" fill="#1C1917" opacity="0.12" />
          <rect x={x} y={y} width="25" height="18" rx="5" fill={p[2]} />
          <rect x={x} y={y} width="25" height="18" rx="5" fill="none" stroke={p[3]} strokeWidth="1.6" />
          <path d={`M${x + 4} ${y + 5} h16`} stroke="#FFF6E0" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </g>
      ))}
      <Prezzemolo punti={[[132, 66, 3.2], [70, 100, 2.8]]} />
    </>
  ),
  verdure: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      {[[80, 74, "#8E3B2C", -22], [114, 70, "#5E8A47", 16], [94, 92, "#D68A28", -8], [124, 90, "#7A5AA0", 24]].map(
        ([x, y, c, r], i) => (
          <g key={i} transform={`rotate(${r} ${x} ${y})`}>
            <ellipse cx={x} cy={y + 2} rx="17" ry="10" fill="#1C1917" opacity="0.12" />
            <ellipse cx={x} cy={y} rx="17" ry="10" fill={c} />
            <path d={`M${x - 11} ${y - 3} h22 M${x - 11} ${y + 3} h22`} stroke="#1C1917" strokeOpacity="0.22" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )
      )}
      <Prezzemolo punti={[[70, 92, 3], [130, 66, 2.6]]} />
    </>
  ),
  riso: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      <ellipse cx="100" cy="84" rx="42" ry="28" fill={p[2]} />
      {Array.from({ length: 24 }).map((_, i) => {
        const x = 72 + (i % 6) * 11;
        const y = 70 + Math.floor(i / 6) * 9;
        return <ellipse key={i} cx={x} cy={y} rx="5" ry="2.8" fill="#FFFCF2" stroke="#E5DBC6" strokeWidth="0.6" transform={`rotate(${i * 41} ${x} ${y})`} />;
      })}
      {[[86, 76], [108, 88], [96, 94]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="9" height="7" rx="2" fill="#E28B7A" transform={`rotate(${i * 33} ${x} ${y})`} />
      ))}
      {[[100, 72], [116, 80], [82, 90]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.4" fill="#5E9A4A" />
      ))}
      <path d="M92 82 q8 -5 16 0" stroke="#F2C94C" strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  piadina: (p) => (
    <>
      <Tovaglia a={p[0]} b={p[1]} />
      <Ceramica />
      <g>
        <path d="M62 100 Q70 60 100 56 Q130 60 138 100 Z" fill="#1C1917" opacity="0.12" transform="translate(0,3)" />
        <path d="M62 100 Q70 60 100 56 Q130 60 138 100 Z" fill={p[2]} />
        <path d="M62 100 Q70 60 100 56 Q130 60 138 100 Z" fill="none" stroke={p[3]} strokeWidth="1.6" />
        {[[84, 76, 3], [104, 68, 2.4], [116, 82, 2.8], [94, 90, 2.2]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#C8A268" opacity="0.7" />
        ))}
        <path d="M68 94 Q100 84 132 94" stroke="#5E8A47" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M72 98 Q100 90 128 98" stroke="#FBFAF2" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    </>
  ),
};

export function Faccia({ tipo, size = 26 }) {
  const c = { sorriso: "var(--ok)", sorridente: "var(--ok)", quasi: "var(--avv)", neutra: "var(--avv)", triste: "var(--err)", neutro: "var(--muto)" }[tipo] || "var(--muto)";
  const bocca = {
    sorriso: "M8 15 Q12 19 16 15",
    sorridente: "M8 15 Q12 19 16 15",
    quasi: "M8 16 Q12 17.5 16 16",
    neutra: "M8 16 H16",
    triste: "M8 17 Q12 13 16 17",
    neutro: "M8 16 H16",
  }[tipo] || "M8 16 H16";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.8" fill="none" />
      <circle cx="8.5" cy="10" r="1.35" fill={c} />
      <circle cx="15.5" cy="10" r="1.35" fill={c} />
      <path d={bocca} stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function DiscoColore({ colore, size = 13 }) {
  const c = COLORI[colore];
  if (!c) return null;
  return (
    <span
      className="pallino-colore"
      style={{ background: c.hex, width: size, height: size }}
      title={`Codice colori WHP, ${c.nome}, ${c.cosa}`}
    />
  );
}

/* Gli allergeni compaiono in maiuscolo, come nella modulistica di settore. */
export function Ingredienti({ testo }) {
  const evidenziato = ingredientiEvidenziati(testo);
  const pezzi = evidenziato.split(/([A-ZÀ-Ý]{3,}(?:[ '][A-ZÀ-Ý]{2,})*)/g);
  return (
    <span className="ingredienti">
      {pezzi.map((p, i) => (/^[A-ZÀ-Ý]{3,}/.test(p) ? <b key={i}>{p}</b> : <React.Fragment key={i}>{p}</React.Fragment>))}
    </span>
  );
}

/* Ordine di preferenza dell'immagine di un piatto:
   1. fotografia caricata dal portale MAVI, resta in memoria per la sessione
   2. file presente nella cartella foto, nominato con il codice del piatto
   3. illustrazione disegnata, sempre disponibile anche senza rete
   L'illustrazione è sempre il primo render: verificare se esiste una foto in
   cartella richiede fino a quattro tentativi di rete in sequenza (una per
   estensione), e finché quel giro non finisce l'area apparirebbe vuota. Si
   passa alla foto solo a caricamento avvenuto (miglioramento progressivo). */
const ESTENSIONI = ["jpg", "jpeg", "png", "webp"];

export function Illustrazione({ id }) {
  const st = usaStato();
  const p = PIATTI[id];
  const caricata = st && st.foto ? st.foto[id] : null;
  const [urlTrovato, setUrlTrovato] = React.useState(null);

  React.useEffect(() => {
    setUrlTrovato(null);
    if (caricata) return;
    let annullato = false;
    (async () => {
      for (const estensione of ESTENSIONI) {
        const url = `${import.meta.env.BASE_URL}foto/${id}.${estensione}`;
        const trovato = await new Promise((risolvi) => {
          const prova = new Image();
          prova.onload = () => risolvi(true);
          prova.onerror = () => risolvi(false);
          prova.src = url;
        });
        if (annullato) return;
        if (trovato) { setUrlTrovato(url); return; }
      }
    })();
    return () => { annullato = true; };
  }, [id, caricata]);

  if (caricata) {
    return <img className="foto-piatto" src={caricata} alt={p.n} loading="lazy" />;
  }
  if (urlTrovato) {
    return <img className="foto-piatto" src={urlTrovato} alt={p.n} loading="lazy" />;
  }
  const dis = DISEGNI[p.ill] || DISEGNI.pasta;
  return (
    <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" role="img" aria-label={p.n}>
      {dis(p.pal)}
    </svg>
  );
}

/* Il marchio: se in cartella c'è marchio/logo.png lo usa, altrimenti scritta. */
export function Marchio({ sotto, chiaro }) {
  const [logo, setLogo] = React.useState(true);
  if (logo) {
    return (
      <span className={"marchio-logo" + (chiaro ? " chiaro" : "")}>
        <img
          src={`${import.meta.env.BASE_URL}marchio/logo.png`}
          alt="MAVI Ristorazione"
          onError={() => setLogo(false)}
        />
        {sotto && <em>{sotto}</em>}
      </span>
    );
  }
  return (
    <span className="marchio-t">
      MAVI{sotto && <span>{sotto}</span>}
    </span>
  );
}

export function Faccina({ livello, size = 34 }) {
  const bocca = livello === "ok"
    ? "M11 21 Q17 27 23 21"           // sorriso
    : livello === "medio"
      ? "M11 23 L23 23"               // neutra
      : "M11 25 Q17 19 23 25";        // triste
  const colore = livello === "ok" ? "#4E8C4A" : livello === "medio" ? "#C9932A" : "#B93A2B";
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <circle cx="17" cy="17" r="15.5" fill="none" stroke={colore} strokeWidth="2" />
      <circle cx="12" cy="14" r="1.8" fill={colore} />
      <circle cx="22" cy="14" r="1.8" fill={colore} />
      <path d={bocca} fill="none" stroke={colore} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ============================ messaggi ============================ */
export function Messaggi({ lista }) {
  return (
    <div className="messaggi">
      {lista.map((m) => (<div className="messaggio" key={m.id}>{m.testo}</div>))}
    </div>
  );
}

/* ============================ scheda piatto ============================ */
/* Tabella valori nutrizionali per porzione, condivisa fra la scheda a video e il PDF. */
function nutrientiDi(p) {
  return [
    ["Energia", p.kcal + " kcal"],
    ["Grassi", p.g[0] + " g"],
    ["di cui acidi grassi saturi", p.g[1] + " g"],
    ["Carboidrati", p.g[2] + " g"],
    ["di cui zuccheri", p.g[3] + " g"],
    ["Proteine", p.g[4] + " g"],
    ["Sale", p.g[5] + " g"],
  ];
}

export function SchedaPiatto({ id, scelto, soloLettura, allergeniUtente = [], onChiudi, onScegli }) {
  const st = usaStato();
  const p = PIATTI[id];
  const conflitto = p.a.filter((n) => allergeniUtente.includes(n));
  const nutrienti = nutrientiDi(p);
  return (
    <Velo onChiudi={onChiudi}>
      <div className="modale-foto">
        <Illustrazione id={id} />
        <button className="modale-x" onClick={onChiudi} aria-label="chiudi"><Icone.x /></button>
      </div>
      <div className="modale-corpo">
        <h2>{p.n}</h2>
        <div className="etichette">
          <span className="et" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <DiscoColore colore={p.col} size={12} /> {COLORI[p.col].nome}, {COLORI[p.col].cosa.toLowerCase()}
          </span>
          {p.so && <span className="et acc">Piatto unico, {sostituisce(id)}</span>}
          {(p.mk || []).map((k) => (
            <span key={k} className={"et" + (k === "V" || k === "VEG" || k === "SG" ? " verde" : "")}>{MARCATORI[k]}</span>
          ))}
          <span className="et">{p.kcal} kcal</span>
        </div>
        {conflitto.length > 0 && (
          <div className="banda-allarme">
            <Icone.attenzione size={19} />
            Attenzione, questo piatto contiene {conflitto.map((n) => ALLERGENI[n].toLowerCase()).join(", ")},
            che hai indicato nel tuo profilo.
          </div>
        )}
        <p className="descrizione">{p.de}</p>

        <div className="titoletto">Ingredienti, allergeni in maiuscolo</div>
        <p className="paragrafo"><Ingredienti testo={p.ing} /></p>

        <div className="titoletto">Allergeni dichiarati</div>
        <div className="allergeni">
          {p.a.length ? p.a.map((n) => (
            <span className="allergene" key={n}><i>{n}</i>{ALLERGENI[n]}</span>
          )) : (
            <span className="allergene nessuno"><i><Icone.ok size={13} /></i>Nessun allergene dichiarato</span>
          )}
        </div>

        <div className="titoletto">Valori nutrizionali per porzione</div>
        <table className="nutrienti">
          <tbody>{nutrienti.map(([a, b]) => (<tr key={a}><td>{a}</td><td>{b}</td></tr>))}</tbody>
        </table>

        <div className="titoletto">Come consumarlo</div>
        <div className="consiglio"><b>Riscaldamento</b>{p.ris}</div>
        <div className="consiglio"><b>Consiglio</b>{p.con}</div>

        <div className="modale-azioni">
          <button className="btn linea" onClick={() => schedaPdf(id, { datiAziendali: st.datiAziendali, avvisa: st.avvisa })}><Icone.scarica size={16} /> Scarica scheda PDF</button>
          {!soloLettura && (
            <button className={"btn" + (scelto ? " linea" : "")} onClick={onScegli}>
              {scelto ? "Rimuovi dalla scelta" : "Scegli questo piatto"}
            </button>
          )}
        </div>
      </div>
    </Velo>
  );
}

export function Velo({ children, onChiudi, largo }) {
  React.useEffect(() => {
    const h = (e) => e.key === "Escape" && onChiudi();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onChiudi]);
  return (
    <div className="velo" onClick={(e) => e.target === e.currentTarget && onChiudi()}>
      <div className={"modale" + (largo ? " largo" : "")}>{children}</div>
    </div>
  );
}

/* scheda stampabile, il browser la salva in PDF. Impaginazione e regole di
   escape stanno in documento.js: i campi del catalogo si modificano dal
   portale, quindi nel documento vanno come testo, non come HTML. */
export function schedaPdf(id, { datiAziendali, avvisa } = {}) {
  const p = PIATTI[id];
  if (!p) return;
  const nutrienti = nutrientiDi(p);

  const tag = [
    p.so ? "Piatto unico, " + sostituisce(id) : null,
    ...(p.mk || []).map((k) => MARCATORI[k]),
  ].filter(Boolean);

  const html = paginaDocumento({
    titolo: p.n,
    badge: "Scheda prodotto",
    sottotitolo: p.de,
    meta: [
      { etichetta: "Codice", valore: id },
      { etichetta: "Energia", valore: p.kcal + " kcal" },
      { etichetta: "Colore WHP", valore: COLORI[p.col]?.nome || "—" },
      { etichetta: "Allergeni", valore: p.a.length ? p.a.length + " dichiarati" : "nessuno" },
    ],
    blocchi: [
      etichette(tag),
      blocco("Ingredienti", paragrafo(p.ing)),
      blocco("Allergeni, Regolamento UE 1169/2011", p.a.length
        ? elenco(p.a.map((n) => ({ etichetta: n, valore: ALLERGENI[n] })))
        : paragrafo("Nessun allergene dichiarato fra i quattordici previsti dalla normativa.")),
      blocco("Valori nutrizionali per porzione", tabellaHtml({
        colonne: [{ titolo: "Voce" }, { titolo: "Per porzione", allinea: "dx" }],
        righe: nutrienti,
      })),
      blocco("Riscaldamento", paragrafo(p.ris)),
      blocco("Consiglio di consumo", paragrafo(p.con)),
    ],
    piede: "I valori nutrizionali sono indicativi e riferiti alla porzione standard. "
      + "Per informazioni su eventuali contaminazioni crociate rivolgersi al servizio.",
    datiAziendali,
  });

  apriDocumento(html, { nomeFile: "Scheda_" + id + ".html", avvisa });
}

/* ============================ telaio dell'area ============================ */
export function Telaio({ area, marchio, ruolo, utente, chiaveUtente, voci, pagina, setPagina, onEsci, children }) {
  const st = usaStato();
  const [profiloAperto, setProfiloAperto] = React.useState(false);
  const chiave = chiaveUtente || utente.nome;
  const ov = st.profili[chiave] || {};
  const nomeVisto = ov.nome || utente.nome;
  const inizialiViste = nomeVisto === utente.nome ? utente.iniziali
    : nomeVisto.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div data-area={area}>
      <div className="nastro">
        <b>Prototipo dimostrativo.</b> Dati di esempio, nessun salvataggio reale.
      </div>
      <div className="telaio">
        <aside className="fianco">
          <div className="marchio">
            <Marchio sotto={marchio} />
          </div>
          <span className="area-tag">{ruolo}</span>
          <nav className="menu">
            {voci.map(([k, l, Ic]) => (
              <button key={k} className={pagina === k ? "on" : ""} onClick={() => setPagina(k)}>
                <Ic size={18} /><span>{l}</span>
              </button>
            ))}
          </nav>
          <div className="fianco-piede">
            <div className="tema-toggle">
              <button className={st.tema === "chiaro" ? "on" : ""} onClick={() => st.setTema("chiaro")}>☀</button>
              <button className={st.tema === "auto" ? "on" : ""} onClick={() => st.setTema("auto")}>Auto</button>
              <button className={st.tema === "scuro" ? "on" : ""} onClick={() => st.setTema("scuro")}>🌙</button>
            </div>
            <button className="utente" style={{ cursor: "pointer", border: "none", background: "none", width: "100%", textAlign: "left" }}
              onClick={() => setProfiloAperto(true)} title="Modifica profilo">
              {ov.foto ? <div className="iniziali" style={{ padding: 0, overflow: "hidden" }}>
                <img src={ov.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
              </div> : <div className="iniziali">{inizialiViste}</div>}
              <div><div className="un">{nomeVisto}</div><div className="ur">{utente.sotto}</div></div>
              <Icone.matita size={13} style={{ marginLeft: "auto", opacity: 0.5, flexShrink: 0 }} />
            </button>
            <button className="esci" onClick={onEsci}>Esci dal portale</button>
          </div>
        </aside>
        <main className="principale">{children}</main>
      </div>
      <nav className="barra-basso">
        {voci.map(([k, l, Ic]) => (
          <button key={k} className={pagina === k ? "on" : ""} onClick={() => setPagina(k)}>
            <Ic size={19} /><span>{l.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
      {profiloAperto && (
        <ModificaProfilo
          chiave={chiave}
          nomeBase={utente.nome}
          onChiudi={() => setProfiloAperto(false)}
        />
      )}
    </div>
  );
}

/* ==================== modifica del profilo personale ==================== */
function ModificaProfilo({ chiave, nomeBase, onChiudi }) {
  const st = usaStato();
  const ov = st.profili[chiave] || {};
  const [nome, setNome] = React.useState(ov.nome || nomeBase);
  const [email, setEmail] = React.useState(ov.email || "");
  const [telefono, setTelefono] = React.useState(ov.telefono || "");
  const [password, setPassword] = React.useState("");
  const [conferma, setConferma] = React.useState("");
  const [errore, setErrore] = React.useState("");
  const fileRef = React.useRef(null);

  function salva(e) {
    e.preventDefault();
    if (password && password !== conferma) {
      setErrore("Le due password non coincidono.");
      return;
    }
    const patch = { nome: nome.trim() || nomeBase, email: email.trim(), telefono: telefono.trim() };
    if (password) patch.password = password;
    st.aggiornaProfilo(chiave, patch);
    st.avvisa("Profilo aggiornato");
    st.logga(patch.nome, "Profilo", "Dati personali modificati", password ? "Dati e password aggiornati" : "Email e telefono aggiornati", "modifica");
    onChiudi();
  }

  function caricaFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      st.aggiornaProfilo(chiave, { foto: reader.result });
      st.avvisa("Foto profilo aggiornata");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <Velo onChiudi={onChiudi}>
      <div className="scelta-testa">
        <div className="occhiello">Account</div>
        <h2>Modifica profilo</h2>
        <p>Nome, contatti, password e foto. Visibili solo a te in questa sessione dimostrativa.</p>
      </div>
      <div style={{ padding: "0 24px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <div className="iniziali" style={{ width: 56, height: 56, fontSize: 20, padding: 0, overflow: "hidden", flexShrink: 0 }}>
          {ov.foto
            ? <img src={ov.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (nome || nomeBase).split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={caricaFoto} />
        <button type="button" className="btn linea piccolo" onClick={() => fileRef.current?.click()}>Cambia foto</button>
        {ov.foto && (
          <button type="button" className="btn linea piccolo" onClick={() => { st.aggiornaProfilo(chiave, { foto: null }); st.avvisa("Foto profilo rimossa"); }}>
            Rimuovi
          </button>
        )}
      </div>
      <form onSubmit={salva} style={{ padding: "0 26px 20px" }}>
        <div className="campo">
          <label>Nome e cognome</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="modulo-riga due">
          <div className="campo">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@esempio.it" />
          </div>
          <div className="campo">
            <label>Telefono</label>
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="333 1234567" />
          </div>
        </div>
        <div className="modulo-riga due">
          <div className="campo">
            <label>Nuova password</label>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrore(""); }} placeholder="Lascia vuoto per non cambiarla" />
          </div>
          <div className="campo">
            <label>Conferma password</label>
            <input type="password" value={conferma} onChange={(e) => { setConferma(e.target.value); setErrore(""); }} placeholder="Ripeti la nuova password" />
          </div>
        </div>
        {errore && <div className="au-errore"><Icone.attenzione size={16} /> {errore}</div>}
        <p style={{ fontSize: 11, color: "var(--muto)", margin: "4px 0 14px" }}>
          In produzione il cambio password richiede quella attuale ed è cifrato lato server; qui resta dimostrativo.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="btn linea" onClick={onChiudi}>Annulla</button>
          <button type="submit" className="btn">Salva modifiche</button>
        </div>
      </form>
    </Velo>
  );
}

export function Intestazione({ occhiello, titolo, sotto, azioni, extra }) {
  return (
    <header className="intestazione">
      <div>
        <div className="occhiello">{occhiello}</div>
        <h1>{titolo}</h1>
        {sotto && <p className="sotto">{sotto}</p>}
        {extra}
      </div>
      {azioni && <div className="azioni">{azioni}</div>}
    </header>
  );
}

/* ============================ accesso ============================ */
function IllustrazioneAccesso({ area }) {
  const col = { azienda: "#f2ece1", rsa: "#f2ece1", comunita: "#f2ece1", scuola: "#f2ece1" }[area] || "#f2ece1";
  if (area === "rsa") return (
    <svg viewBox="0 0 300 300" fill="none" className="accesso-illu">
      {/* cuore con croce, cura */}
      <path d="M150 260 C60 200 20 140 60 100 C90 70 130 80 150 110 C170 80 210 70 240 100 C280 140 240 200 150 260Z"
        stroke={col} strokeOpacity="0.18" strokeWidth="2" fill={col} fillOpacity="0.04" />
      <path d="M150 260 C60 200 20 140 60 100 C90 70 130 80 150 110 C170 80 210 70 240 100 C280 140 240 200 150 260Z"
        stroke={col} strokeOpacity="0.08" strokeWidth="1" fill="none" transform="scale(0.7) translate(64,64)" />
      <rect x="143" y="130" width="14" height="50" rx="4" fill={col} fillOpacity="0.12" />
      <rect x="130" y="148" width="40" height="14" rx="4" fill={col} fillOpacity="0.12" />
    </svg>
  );
  if (area === "scuola") return (
    <svg viewBox="0 0 300 300" fill="none" className="accesso-illu">
      {/* libro aperto */}
      <path d="M150 80 C120 85 60 90 40 100 L40 230 C60 220 120 215 150 210 C180 215 240 220 260 230 L260 100 C240 90 180 85 150 80Z"
        stroke={col} strokeOpacity="0.18" strokeWidth="2" fill={col} fillOpacity="0.04" />
      <line x1="150" y1="80" x2="150" y2="210" stroke={col} strokeOpacity="0.12" strokeWidth="1.5" />
      {/* righe pagina sinistra */}
      <line x1="70" y1="130" x2="135" y2="125" stroke={col} strokeOpacity="0.1" strokeWidth="1" />
      <line x1="70" y1="150" x2="135" y2="145" stroke={col} strokeOpacity="0.1" strokeWidth="1" />
      <line x1="70" y1="170" x2="135" y2="165" stroke={col} strokeOpacity="0.1" strokeWidth="1" />
      <line x1="70" y1="190" x2="120" y2="185" stroke={col} strokeOpacity="0.1" strokeWidth="1" />
      {/* righe pagina destra */}
      <line x1="165" y1="125" x2="230" y2="130" stroke={col} strokeOpacity="0.1" strokeWidth="1" />
      <line x1="165" y1="145" x2="230" y2="150" stroke={col} strokeOpacity="0.1" strokeWidth="1" />
      <line x1="165" y1="165" x2="230" y2="170" stroke={col} strokeOpacity="0.1" strokeWidth="1" />
      {/* matita */}
      <rect x="220" y="50" width="12" height="70" rx="2" fill={col} fillOpacity="0.1" transform="rotate(25 226 85)" />
      <polygon points="220,120 226,135 232,120" fill={col} fillOpacity="0.12" transform="rotate(25 226 127)" />
    </svg>
  );
  if (area === "comunita") return (
    <svg viewBox="0 0 300 300" fill="none" className="accesso-illu">
      {/* casa */}
      <path d="M150 60 L50 145 L70 145 L70 240 L230 240 L230 145 L250 145 Z"
        stroke={col} strokeOpacity="0.18" strokeWidth="2" fill={col} fillOpacity="0.04" />
      {/* porta */}
      <rect x="125" y="170" width="50" height="70" rx="4" stroke={col} strokeOpacity="0.14" strokeWidth="1.5" fill={col} fillOpacity="0.06" />
      <circle cx="165" cy="208" r="4" fill={col} fillOpacity="0.15" />
      {/* finestre */}
      <rect x="85" y="160" width="28" height="28" rx="3" stroke={col} strokeOpacity="0.12" strokeWidth="1" fill={col} fillOpacity="0.04" />
      <rect x="187" y="160" width="28" height="28" rx="3" stroke={col} strokeOpacity="0.12" strokeWidth="1" fill={col} fillOpacity="0.04" />
      {/* cuoricino sul tetto */}
      <path d="M150 100 C143 90 130 92 133 102 C135 110 150 120 150 120 C150 120 165 110 167 102 C170 92 157 90 150 100Z"
        fill={col} fillOpacity="0.12" />
    </svg>
  );
  /* azienda: edificio */
  return (
    <svg viewBox="0 0 300 300" fill="none" className="accesso-illu">
      {/* edificio */}
      <rect x="70" y="80" width="160" height="180" rx="4" stroke={col} strokeOpacity="0.18" strokeWidth="2" fill={col} fillOpacity="0.04" />
      {/* finestre */}
      {[0,1,2,3].map(r => [0,1,2].map(c => (
        <rect key={r+"-"+c} x={95+c*42} y={100+r*38} width="24" height="20" rx="3"
          stroke={col} strokeOpacity="0.12" strokeWidth="1" fill={col} fillOpacity="0.05" />
      )))}
      {/* porta */}
      <rect x="130" y="215" width="40" height="45" rx="4" stroke={col} strokeOpacity="0.14" strokeWidth="1.5" fill={col} fillOpacity="0.06" />
      <circle cx="160" cy="240" r="3.5" fill={col} fillOpacity="0.15" />
      {/* tetto-antenna */}
      <line x1="150" y1="80" x2="150" y2="55" stroke={col} strokeOpacity="0.14" strokeWidth="1.5" />
      <line x1="140" y1="60" x2="160" y2="60" stroke={col} strokeOpacity="0.14" strokeWidth="1.5" />
    </svg>
  );
}

export function Accesso({ area, titolo, claim, punti, utente, password, onEntra, onIndietro }) {
  const [u, setU] = React.useState(utente);
  const [p, setP] = React.useState(password);
  return (
    <div data-area={area}>
      <div className="nastro"><b>Prototipo dimostrativo.</b> Dati di esempio, nessun salvataggio reale.</div>
      <div className="accesso">
        <div className="accesso-sx">
          <button className="indietro" onClick={onIndietro}><Icone.sx size={16} /> Tutti i portali</button>
          <div>
            <h2 dangerouslySetInnerHTML={{ __html: claim }} />
            <ul>{punti.map((x) => (<li key={x}>{x}</li>))}</ul>
          </div>
          <IllustrazioneAccesso area={area} />
        </div>
        <div className="accesso-dx">
          <div className="occhiello">MAVI Ristorazione</div>
          <h3>{titolo}</h3>
          <p className="sotto">Inserisci le credenziali per accedere all'area riservata.</p>
          <form onSubmit={(e) => { e.preventDefault(); onEntra(); }}>
            <div className="campo">
              <label htmlFor="u">Nome utente</label>
              <input id="u" type="text" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
            </div>
            <div className="campo">
              <label htmlFor="p">Password</label>
              <input id="p" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
            </div>
            <button className="btn pieno" type="submit">Accedi</button>
          </form>
          <div className="cred">
            Accesso dimostrativo già compilato.<br />
            utente <b>{utente}</b><br />password <b>{password}</b>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Documenti condivisi
   Caricati da MAVI, consultabili dall'azienda cliente e, quando
   contrassegnati come pubblici, anche dai dipendenti.
   ============================================================ */
export function Documenti({ soloPubblici, gestibile }) {
  const st = usaStato();
  const input = React.useRef(null);
  const lista = soloPubblici ? st.documenti.filter((d) => d.perDipendenti) : st.documenti;

  function apri(d) {
    if (!d.file) { st.avvisa("Documento non ancora caricato"); return; }
    if (d.dato) { window.open(d.dato, "_blank"); return; }
    window.open(`${import.meta.env.BASE_URL}documenti/${d.file}`, "_blank");
  }

  function carica(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      st.aggiungiDocumento({
        nome: file.name.replace(/\.[^.]+$/, ""),
        tipo: "Documento",
        descrizione: "Caricato dal portale MAVI in questa sessione.",
        file: file.name,
        dato: r.result,
        peso: (file.size / 1024 / 1024).toFixed(1).replace(".", ",") + " MB",
        data: "Caricato ora",
        perDipendenti: true,
      });
      st.avvisa("Documento caricato e visibile alle aziende clienti");
    };
    r.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <>
      <Intestazione
        occhiello="Archivio"
        titolo={soloPubblici ? "Documenti utili" : "Documenti del servizio"}
        sotto={
          soloPubblici
            ? "Materiale informativo messo a disposizione da MAVI"
            : "Normative, capitolati e materiale informativo condiviso da MAVI"
        }
        azioni={
          gestibile ? (
            <button className="btn piccolo" onClick={() => input.current.click()}>
              <Icone.scarica size={16} /> Carica documento
            </button>
          ) : null
        }
      />
      {gestibile && (
        <input ref={input} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
          style={{ display: "none" }} onChange={carica} />
      )}
      <div className="tela">
        <div className="documenti">
          {lista.map((d) => (
            <article className={"documento" + (d.file ? "" : " assente")} key={d.id}>
              <span className="doc-icona">
                <Icone.fattura size={22} />
                <em>{d.file ? (d.file.split(".").pop() || "file").toUpperCase() : "—"}</em>
              </span>
              <div className="doc-corpo">
                <span className="doc-tipo">{d.tipo}</span>
                <h3>{d.nome}</h3>
                <p>{d.descrizione}</p>
                <span className="doc-meta">
                  {d.data} · {d.peso}
                  {d.perDipendenti ? " · visibile ai dipendenti" : " · riservato all'amministrazione"}
                </span>
              </div>
              <div className="doc-azioni">
                <button className="btn linea piccolo" onClick={() => apri(d)} disabled={!d.file}>
                  {d.file ? "Apri" : "Non disponibile"}
                </button>
                {gestibile && !String(d.id).startsWith("doc-") && (
                  <button className="btn linea piccolo" onClick={() => st.rimuoviDocumento(d.id)}>Rimuovi</button>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="legenda-colori">
          <div className="legenda-testa">
            <h3>Il codice colori in breve</h3>
            <p>Regione Lombardia, programma di promozione della salute nei luoghi di lavoro.</p>
          </div>
          <div className="legenda-griglia">
            {Object.entries(COLORI).map(([k, c]) => (
              <div className="legenda-voce" key={k}>
                <span className="legenda-disco" style={{ background: c.hex }} />
                <div>
                  <b>{c.nome}</b>
                  <span>{c.cosa}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="legenda-nota">
            Un pasto equilibrato mette insieme giallo, rosso e verde, oppure un blu con il verde.
            La frutta, il viola, si aggiunge quando prevista dal capitolato.
          </p>
        </div>
      </div>
    </>
  );
}
