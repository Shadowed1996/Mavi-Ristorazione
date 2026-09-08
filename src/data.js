/* Dati di esempio del prototipo.
   Nel prodotto reale arrivano dalle API, qui stanno in memoria. */

export const ALLERGENI = {
  1: "Glutine", 2: "Crostacei", 3: "Uova", 4: "Pesce", 5: "Arachidi",
  6: "Soia", 7: "Latte", 8: "Frutta a guscio", 9: "Sedano", 10: "Senape",
  11: "Sesamo", 12: "Solfiti", 13: "Lupini", 14: "Molluschi",
};

/* Codice colori WHP, Regione Lombardia, allegato 1F.
   Il colore descrive la natura nutrizionale del piatto e non coincide
   necessariamente con la categoria di menu. */
export const COLORI = {
  giallo: { nome: "Giallo", cosa: "Carboidrati, cereali e tuberi", hex: "#E8B430" },
  rosso: { nome: "Rosso", cosa: "Proteine, carne, pesce, uova, latticini, legumi", hex: "#C8443B" },
  verde: { nome: "Verde", cosa: "Verdure", hex: "#4E8C4A" },
  viola: { nome: "Viola", cosa: "Frutta", hex: "#A83E7C" },
  blu: { nome: "Blu", cosa: "Piatto unico, carboidrati e proteine insieme", hex: "#37629E" },
};

/* Un pasto equilibrato secondo il codice colori WHP:
   giallo + rosso + verde, oppure blu + verde.
   Il viola, la frutta, entra nel calcolo solo se il capitolato la prevede. */
export function equilibrio(coloriPresenti, conFrutta = false) {
  const ha = (c) => coloriPresenti.includes(c);
  const conBlu = ha("blu");
  const richiesti = conBlu ? ["blu", "verde"] : ["giallo", "rosso", "verde"];
  if (conFrutta) richiesti.push("viola");
  const mancanti = richiesti.filter((c) => !ha(c));

  // tre livelli: buono, migliorabile, sbilanciato
  let livello, faccia, titolo, testo;
  if (coloriPresenti.length === 0) {
    livello = "vuoto"; faccia = "neutro";
    titolo = "Componi il tuo pasto";
    testo = "Aggiungi le portate per vedere se il pasto è equilibrato.";
  } else if (mancanti.length === 0) {
    livello = "buono"; faccia = "sorriso";
    titolo = "Pasto equilibrato";
    testo = conBlu
      ? "Piatto unico e verdura, la combinazione consigliata."
      : "Carboidrati, proteine e verdura, la combinazione consigliata.";
  } else if (mancanti.length === 1) {
    livello = "migliorabile"; faccia = "quasi";
    const nomeMancante = { giallo: "un carboidrato", rosso: "una proteina", verde: "una verdura", blu: "un piatto unico", viola: "la frutta" }[mancanti[0]];
    titolo = "Ci sei quasi";
    testo = "Manca " + nomeMancante + " per completare il pasto.";
  } else {
    livello = "sbilanciato"; faccia = "triste";
    titolo = "Pasto sbilanciato";
    testo = "Mancano più elementi. Prova ad aggiungere proteine e verdura.";
  }
  return { richiesti, mancanti, ok: mancanti.length === 0, livello, faccia, titolo, testo };
}

/* Evidenzia in maiuscolo gli ingredienti allergenici, come da prassi del settore. */
const PAROLE_ALLERGENICHE = [
  "uova", "uovo", "latte", "burro", "panna", "grana padano", "grana", "pecorino",
  "formaggi", "formaggio", "mozzarella", "squacquerone", "provolone", "caciotta",
  "yogurt", "besciamella", "farina di grano tenero", "farina di soia", "farina",
  "semola integrale di grano duro", "semola di grano duro", "semola", "pangrattato",
  "pane grattugiato", "orzo perlato", "farro perlato", "sfoglia all'uovo", "sfoglia",
  "salsa di soia senza glutine", "salsa di soia", "tofu di soia", "soia", "pinoli",
  "noci", "mandorle", "sedano", "senape", "salmone atlantico", "salmone", "pesce",
  "crostacei", "molluschi", "solfiti", "lupini", "sesamo", "arachidi", "quinoa",
];
export function ingredientiEvidenziati(testo) {
  let out = testo;
  PAROLE_ALLERGENICHE.forEach((w) => {
    if (w === "quinoa") return;
    const re = new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
    out = out.replace(re, (m) => m.toUpperCase());
  });
  return out;
}

export const MARCATORI = {
  SG: "Senza glutine",
  V: "Vegetariano",
  VEG: "Vegano",
  M: "Contiene maiale",
  SUR: "Surgelato all'origine",
};

export const CATEGORIE = [
  { id: "primo", nome: "Primo", nota: "Scegline uno, oppure passa al sostitutivo." },
  { id: "sost_primo", nome: "Sostitutivo primo", nota: "Alternativa al primo, si escludono a vicenda." },
  { id: "secondo", nome: "Secondo", nota: "Scegline uno, oppure passa al sostitutivo." },
  { id: "sost_secondo", nome: "Sostitutivo secondo", nota: "Alternativa al secondo, si escludono a vicenda." },
  { id: "contorno", nome: "Contorno", nota: "Una scelta per completare il pasto." },
  { id: "unico", nome: "Piatto unico", nota: "Sostituisce più portate, la scheda indica quali." },
];

/* g = [grassi, saturi, carboidrati, zuccheri, proteine, sale] */
export const PIATTI = {
  pas_pom: {
    col: "giallo",
    n: "Penne al pomodoro e basilico", ill: "pasta", pal: ["#FBF1EB", "#F6DFD2", "#EBB79E", "#C0442E"],
    ing: "Penne di semola di grano duro, pomodori pelati, basilico fresco, aglio, olio EVO, sale, zucchero",
    kcal: 375, g: [12.4, 2.1, 62, 5.2, 11.8, 0.9], mk: ["V"], a: [1],
    de: "Penne di semola trafilate al bronzo con salsa di pomodoro fresco, olio extravergine e basilico spezzato a mano.",
    ing: "SEMOLA DI GRANO DURO, passata di pomodoro, olio extravergine di oliva, basilico fresco, aglio, sale, pepe.",
    ris: "Microonde 800 W per 2 minuti, mescolando a metà tempo. In forno 160 gradi per 8 minuti coprendo con alluminio.",
    con: "Ottimo con una spolverata di formaggio grattugiato, fornito a parte su richiesta.",
  },
  ris_fun: {
    col: "giallo",
    n: "Risotto ai funghi porcini", ill: "risotto", pal: ["#FAF6EC", "#F0E8D4", "#E7DDC2", "#FDFBF5"],
    ing: "Riso carnaroli, funghi porcini, brodo vegetale, cipolla, burro, parmigiano reggiano DOP, olio EVO, prezzemolo, sale",
    kcal: 430, g: [14.2, 6.8, 58, 2.4, 10.1, 1.2], mk: ["V", "SG"], a: [7],
    de: "Riso Carnaroli mantecato con funghi porcini, brodo vegetale e una nota di prezzemolo fresco.",
    ing: "RISO CARNAROLI, funghi porcini, BURRO, brodo vegetale, cipolla, vino bianco, prezzemolo, sale.",
    ris: "Microonde 800 W per due minuti e mezzo, aggiungendo un cucchiaio d'acqua per ritrovare la cremosità.",
    con: "Va consumato subito dopo il riscaldamento, il riso tende ad asciugarsi.",
  },
  las_bol: {
    col: "blu",
    n: "Lasagne alla bolognese", ill: "lasagna", pal: ["#FBF0E8", "#F5DDC9", "#C0442E", "#F3DFAE"],
    kcal: 520, g: [26.5, 12.4, 44, 6.1, 24.2, 1.6], mk: ["M"], a: [1, 3, 7],
    de: "Sfoglia all'uovo alternata a ragù di carne mista e besciamella, gratinata al forno fino alla crosta dorata.",
    ing: "SFOGLIA ALL'UOVO, carne bovina e suina, passata di pomodoro, LATTE, BURRO, farina, SEDANO, carota, cipolla, noce moscata.",
    ris: "Forno 180 gradi per 12 minuti. Al microonde 800 W per 3 minuti, la crosta però resta morbida.",
    con: "Piatto sostanzioso, si abbina bene a un contorno leggero come l'insalata mista.",
  },
  pas_pes: {
    col: "giallo",
    n: "Pasta integrale al pesto", ill: "pasta", pal: ["#F5F7EC", "#E6EDD3", "#D2E0B4", "#5E7A34"],
    kcal: 465, g: [19.8, 4.2, 54, 3.1, 14.6, 1.1], mk: ["V"], a: [1, 7, 8],
    de: "Pasta integrale con pesto di basilico, pinoli tostati e pecorino stagionato.",
    ing: "SEMOLA INTEGRALE DI GRANO DURO, basilico, olio extravergine, PINOLI, PECORINO, aglio, sale.",
    ris: "Microonde 800 W per 2 minuti. Evitare temperature alte, il pesto perde profumo.",
    con: "Un filo d'olio a crudo dopo il riscaldamento ravviva il condimento.",
  },
  min_orz: {
    col: "giallo",
    n: "Minestra di orzo e verdure", ill: "zuppa", pal: ["#F9F5EA", "#F0E9D3", "#D3B063", "#A07B2E"],
    kcal: 240, g: [6.2, 1.1, 38, 4.8, 8.4, 1.3], mk: ["V"], a: [1, 9],
    de: "Orzo perlato cotto lentamente con verdure di stagione in brodo vegetale leggero.",
    ing: "ORZO PERLATO, carote, SEDANO, patate, zucchine, cipolla, olio extravergine, brodo vegetale, alloro.",
    ris: "Microonde 800 W per 3 minuti mescolando, oppure in pentola a fuoco basso.",
    con: "Piatto leggero, adatto anche a chi sceglie di saltare il secondo.",
  },
  vel_zuc: {
    col: "verde",
    n: "Vellutata di zucca e carote", ill: "zuppa", pal: ["#FDF6EA", "#FAE8C9", "#DF8B27", "#F2BE70"],
    kcal: 215, g: [7.8, 2.4, 30, 9.6, 5.2, 1.0], mk: ["V", "SG"], a: [7],
    de: "Crema vellutata di zucca e carote con un tocco di panna e semi di zucca tostati.",
    ing: "Zucca, carote, patate, PANNA, cipolla, olio extravergine, semi di zucca, brodo vegetale, sale, pepe bianco.",
    ris: "Microonde 800 W per due minuti e mezzo. Mescolare bene prima di servire.",
    con: "I semi di zucca vanno aggiunti a fine riscaldamento per restare croccanti.",
  },
  ins_far: {
    col: "giallo",
    n: "Insalata di farro e verdure", ill: "insalata", pal: ["#F4F8EC", "#E4EFD5", "#D2E0B4", "#5E7A34"],
    kcal: 305, g: [9.6, 1.4, 46, 4.2, 10.2, 0.8], mk: ["V", "VEG"], a: [1],
    de: "Farro perlato freddo con pomodorini, zucchine grigliate, olive taggiasche e menta.",
    ing: "FARRO PERLATO, pomodorini, zucchine, olive taggiasche, menta, olio extravergine, limone, sale.",
    ris: "Si consuma freddo, non richiede riscaldamento.",
    con: "Se conservato in frigorifero, toglierlo dieci minuti prima per apprezzarne il profumo.",
  },
  ins_qui: {
    col: "blu",
    n: "Insalata di quinoa e ceci", ill: "insalata", pal: ["#F6F9F1", "#E8F1DB", "#D2E0B4", "#5E7A34"],
    kcal: 290, g: [10.4, 1.2, 38, 3.6, 12.8, 0.7], mk: ["V", "VEG", "SG"], a: [],
    de: "Quinoa tricolore con ceci, peperoni croccanti, cetriolo e vinaigrette agli agrumi.",
    ing: "Quinoa, ceci, peperoni, cetriolo, cipollotto, prezzemolo, olio extravergine, succo di limone, sale.",
    ris: "Si consuma freddo, non richiede riscaldamento.",
    con: "Ricca di proteine vegetali, valida alternativa completa per chi non mangia carne.",
  },
  pol_gri: {
    col: "rosso",
    n: "Petto di pollo alla griglia", ill: "carne", pal: ["#FDFAF1", "#F6EFDB", "#E0B87E", "#A9793C"],
    ing: "Petto di pollo, rosmarino, timo, aglio, olio EVO, sale, pepe nero",
    kcal: 320, g: [11.2, 2.6, 1.8, 0.4, 42.6, 1.1], mk: ["SG"], a: [],
    de: "Petto di pollo marinato con erbe aromatiche e cotto sulla piastra rovente.",
    ing: "Petto di pollo, olio extravergine, rosmarino, timo, aglio, succo di limone, sale, pepe.",
    ris: "Forno 170 gradi per 8 minuti. Al microonde 800 W per 90 secondi, non oltre, altrimenti asciuga.",
    con: "Un filo d'olio a crudo e qualche goccia di limone dopo il riscaldamento.",
  },
  sal_for: {
    col: "rosso",
    n: "Salmone al forno con erbe", ill: "pesce", pal: ["#FDF2EC", "#F9DED0", "#EE9670", "#DC6C45"],
    ing: "Filetto di salmone atlantico, limone, aneto, olio EVO, pangrattato, aglio, sale, pepe",
    kcal: 340, g: [21.4, 4.2, 1.2, 0.3, 34.8, 0.9], mk: ["SG", "SUR"], a: [4],
    de: "Trancio di salmone cotto al forno con erbe fini e scorza di limone grattugiata.",
    ing: "SALMONE ATLANTICO, olio extravergine, aneto, prezzemolo, scorza di limone, sale, pepe.",
    ris: "Forno 170 gradi per 8 minuti coprendo con alluminio. Sconsigliato il microonde.",
    con: "Si accompagna bene con verdure al vapore o insalata.",
  },
  pol_sug: {
    col: "rosso",
    n: "Polpette di manzo al sugo", ill: "polpette", pal: ["#FBF1EC", "#F6DED3", "#C0442E", "#8E4326"],
    kcal: 410, g: [22.8, 7.4, 18, 5.4, 28.4, 1.5], mk: [], a: [1, 3],
    de: "Polpette di manzo cotte lentamente in salsa di pomodoro e basilico.",
    ing: "Carne bovina, PANE GRATTUGIATO, UOVA, GRANA, passata di pomodoro, basilico, aglio, olio extravergine.",
    ris: "Microonde 800 W per due minuti e mezzo, oppure in padella a fuoco basso con un dito di sugo.",
    con: "Il sugo in eccesso è ottimo per accompagnare il pane.",
  },
  tac_lim: {
    col: "rosso",
    n: "Tacchino al limone", ill: "carne", pal: ["#FDFAEE", "#F8F2D8", "#E7D59B", "#A08322"],
    kcal: 280, g: [9.4, 1.8, 4.2, 0.6, 40.2, 1.0], mk: ["SG"], a: [],
    de: "Fettine di fesa di tacchino scottate e sfumate al succo di limone.",
    ing: "Fesa di tacchino, succo di limone, olio extravergine, prezzemolo, sale, pepe bianco.",
    ris: "Microonde 800 W per 90 secondi, oppure padella coperta per 4 minuti.",
    con: "Carne magra e digeribile, adatta anche a chi cerca un pasto leggero.",
  },
  tof_pia: {
    col: "rosso",
    n: "Tofu alla piastra con verdure", ill: "tofu", pal: ["#F9F7EC", "#EFEBD8", "#F4F0DD", "#C4B98A"],
    kcal: 300, g: [16.8, 2.4, 12, 3.2, 22.6, 0.8], mk: ["V", "VEG", "SG"], a: [6],
    de: "Tofu marinato alla piastra con verdure di stagione saltate al salto.",
    ing: "TOFU DI SOIA, zucchine, peperoni, carote, SALSA DI SOIA SENZA GLUTINE, olio extravergine, zenzero.",
    ris: "Padella a fuoco vivo per 3 minuti, oppure microonde 800 W per 2 minuti.",
    con: "Fonte completa di proteine vegetali, indicata per chi segue un regime vegano.",
  },
  bur_leg: {
    col: "rosso",
    n: "Burger di legumi", ill: "burger", pal: ["#FDF8EC", "#FAEDD1", "#E3B771", "#A0762E"],
    kcal: 330, g: [13.6, 2.2, 34, 4.8, 14.2, 1.2], mk: ["V", "VEG"], a: [1, 6],
    de: "Burger vegetale di ceci e lenticchie con panatura leggera alle erbe.",
    ing: "Ceci, lenticchie, PANGRATTATO, FARINA DI SOIA, cipolla, prezzemolo, paprika, olio extravergine.",
    ris: "Forno 180 gradi per 8 minuti per una crosta croccante. Il microonde lo rende morbido.",
    con: "Buono anche freddo, tagliato dentro un'insalata.",
  },
  fri_zuc: {
    col: "rosso",
    n: "Frittata alle zucchine", ill: "carne", pal: ["#FDFBEE", "#FAF4D2", "#F0CE4E", "#C09E2C"],
    kcal: 300, g: [21.4, 5.6, 6.2, 3.1, 20.8, 1.0], mk: ["V", "SG"], a: [3, 7],
    de: "Frittata soffice di uova e zucchine trifolate con una punta di grana padano.",
    ing: "UOVA, zucchine, GRANA PADANO, cipollotto, olio extravergine, sale, pepe.",
    ris: "Microonde 800 W per 90 secondi. Non superare i due minuti o diventa gommosa.",
    con: "Si può consumare anche a temperatura ambiente.",
  },
  for_mis: {
    col: "rosso",
    n: "Piatto di formaggi misti", ill: "tofu", pal: ["#FDFAEC", "#F9F1CE", "#F7E9AE", "#BFA046"],
    kcal: 390, g: [30.2, 18.6, 3.4, 2.8, 26.4, 1.8], mk: ["V", "SG"], a: [7],
    de: "Selezione di tre formaggi italiani a pasta dura e semidura, serviti con noci.",
    ing: "GRANA PADANO, PROVOLONE, CACIOTTA, NOCI.",
    ris: "Si consuma a temperatura ambiente, non richiede riscaldamento.",
    con: "Tirare fuori dal frigorifero venti minuti prima per esprimere gli aromi.",
  },
  gno_gor: {
    col: "giallo",
    n: "Gnocchi al gorgonzola", ill: "risotto", pal: ["#FAF6EC", "#F1E9D6", "#EFE7D0", "#FDFBF4"],
    kcal: 455, g: [18.6, 9.8, 54, 3.2, 14.4, 1.4], mk: ["V"], a: [1, 7],
    de: "Gnocchi di patate mantecati in crema di gorgonzola dolce e noci tostate.",
    ing: "Patate, FARINA di grano tenero, GORGONZOLA, PANNA, NOCI, sale, pepe.",
    ris: "Microonde 800 W per 2 minuti. Mescolare per riportare la crema alla giusta consistenza.",
    con: "Piatto ricco, si abbina bene a un contorno di verdure crude.",
  },
  pas_arr: {
    col: "giallo",
    n: "Pasta all'arrabbiata", ill: "pasta", pal: ["#FCF0EA", "#F8DCD0", "#EFAF95", "#B93A26"],
    kcal: 390, g: [11.8, 1.8, 63, 5.6, 11.2, 1.0], mk: ["V", "VEG"], a: [1],
    de: "Pasta corta con pomodoro, aglio e peperoncino, la versione classica romana.",
    ing: "SEMOLA DI GRANO DURO, passata di pomodoro, aglio, peperoncino, olio extravergine, prezzemolo, sale.",
    ris: "Microonde 800 W per 2 minuti mescolando a metà tempo.",
    con: "Piccante moderato. Su richiesta la cucina prepara la versione senza peperoncino.",
  },
  ris_zaf: {
    col: "giallo",
    n: "Risotto allo zafferano", ill: "risotto", pal: ["#FDF7E4", "#F8EDC6", "#F2E3AE", "#FEFCF2"],
    kcal: 445, g: [15.4, 7.2, 60, 2.1, 10.6, 1.3], mk: ["V", "SG"], a: [7],
    de: "Riso Carnaroli mantecato con zafferano in pistilli e grana padano.",
    ing: "RISO CARNAROLI, zafferano, BURRO, GRANA PADANO, cipolla, brodo vegetale, vino bianco, sale.",
    ris: "Microonde 800 W per due minuti e mezzo con un cucchiaio d'acqua.",
    con: "Va servito subito, il riso si asciuga in fretta.",
  },
  zup_leg: {
    col: "rosso",
    n: "Zuppa di legumi misti", ill: "zuppa", pal: ["#F8F2E8", "#EFE3D0", "#B07A45", "#8A5A2E"],
    kcal: 265, g: [7.4, 1.2, 34, 4.2, 15.8, 1.2], mk: ["V", "VEG", "SG"], a: [9],
    de: "Fagioli, lenticchie e ceci cotti lentamente con SEDANO, carote e rosmarino.",
    ing: "Fagioli, lenticchie, ceci, SEDANO, carote, cipolla, rosmarino, olio extravergine, sale.",
    ris: "Microonde 800 W per 3 minuti mescolando, oppure in pentola a fuoco basso.",
    con: "Ottima fonte di proteine vegetali, si abbina a un contorno leggero.",
  },
  cre_spi: {
    col: "giallo",
    n: "Crespelle agli spinaci", ill: "lasagna", pal: ["#F6F8EE", "#E9F0DA", "#5E8A47", "#F3DFAE"],
    kcal: 430, g: [21.2, 10.4, 42, 4.8, 17.6, 1.5], mk: ["V"], a: [1, 3, 7],
    de: "Crespelle sottili farcite con spinaci e ricotta, gratinate con besciamella.",
    ing: "FARINA, UOVA, LATTE, spinaci, RICOTTA, BURRO, GRANA PADANO, noce moscata, sale.",
    ris: "Forno 180 gradi per 10 minuti. Al microonde 800 W per 2 minuti e mezzo.",
    con: "La gratinatura torna croccante solo in forno.",
  },
  pas_fag: {
    col: "blu",
    n: "Pasta e fagioli", ill: "zuppa", pal: ["#FBF3E9", "#F4E4CE", "#B4603A", "#8E4526"],
    ing: "Pasta mista di semola, fagioli borlotti, carota, sedano, cipolla, passata di pomodoro, olio EVO, rosmarino, sale",
    kcal: 480, g: [14.2, 2.6, 62, 4.4, 19.8, 1.6], mk: ["V"], a: [1, 9],
    de: "Il piatto unico per eccellenza, pasta corta e fagioli borlotti in crema densa.",
    ing: "SEMOLA DI GRANO DURO, fagioli borlotti, SEDANO, carote, cipolla, rosmarino, olio extravergine, sale.",
    ris: "Microonde 800 W per 3 minuti. Aggiungere un cucchiaio d'acqua se troppo denso.",
    con: "Piatto unico completo, richiede solo verdura e frutta.",
    so: ["primo", "secondo"],
  },
  cot_mil: {
    col: "rosso",
    n: "Cotoletta alla milanese", ill: "carne", pal: ["#FDF8EC", "#F9EFD4", "#E0B063", "#A9762F"],
    kcal: 490, g: [28.4, 8.2, 24, 1.2, 34.6, 1.4], mk: [], a: [1, 3, 7],
    de: "Fettina di lonza impanata e dorata, servita con spicchio di limone.",
    ing: "Lonza di suino, PANE GRATTUGIATO, UOVA, BURRO, sale, pepe, limone.",
    ris: "Forno 190 gradi per 8 minuti per ritrovare la croccantezza. Il microonde ammorbidisce la panatura.",
    con: "Il limone va spremuto solo al momento.",
  },
  pla_mug: {
    col: "rosso",
    n: "Platessa alla mugnaia", ill: "pesce", pal: ["#FBF6EC", "#F5EBD6", "#EDD9AE", "#C9A45E"],
    kcal: 310, g: [16.8, 6.4, 8.4, 0.6, 32.2, 1.1], mk: ["SUR"], a: [1, 4, 7],
    de: "Filetto di PLATESSA scottato al BURRO con prezzemolo e limone.",
    ing: "PLATESSA, BURRO, FARINA, prezzemolo, limone, sale, pepe.",
    ris: "Padella a fuoco medio per 3 minuti. Sconsigliato il microonde.",
    con: "Pesce delicato, si abbina a patate o verdure al vapore.",
  },
  spe_pol: {
    col: "rosso",
    n: "Spezzatino con piselli", ill: "polpette", pal: ["#FBF0E9", "#F5DCCB", "#A9542E", "#7E3C1E"],
    kcal: 425, g: [21.6, 7.8, 16, 4.6, 34.2, 1.5], mk: ["SG"], a: [9],
    de: "Bocconcini di manzo brasati con piselli e salsa di pomodoro leggera.",
    ing: "Carne bovina, piselli, passata di pomodoro, SEDANO, carote, cipolla, olio extravergine, alloro.",
    ris: "Microonde 800 W per 3 minuti, oppure padella coperta a fuoco basso.",
    con: "Il fondo di cottura è ottimo con il pane o la polenta.",
  },
  arr_tac: {
    col: "rosso",
    n: "Arrosto di tacchino farcito", ill: "carne", pal: ["#FDFAEE", "#F8F1DA", "#E5D3A0", "#B29245"],
    kcal: 350, g: [14.2, 4.6, 6.8, 1.4, 42.8, 1.3], mk: [], a: [1, 7],
    de: "Fesa di tacchino farcita e arrotolata, tagliata a fette con il suo fondo.",
    ing: "Fesa di tacchino, prosciutto cotto, FORMAGGIO, PANE GRATTUGIATO, erbe aromatiche, vino bianco, sale.",
    ris: "Forno 170 gradi per 9 minuti coprendo con alluminio.",
    con: "Va riscaldato con il suo fondo, altrimenti asciuga.",
  },
  ham_gri: {
    col: "rosso",
    n: "Hamburger di manzo alla griglia", ill: "burger", pal: ["#FBF1EA", "#F5DECD", "#C88A56", "#8E4E28"],
    kcal: 380, g: [24.6, 9.2, 2.4, 0.8, 36.4, 1.2], mk: ["SG"], a: [],
    de: "Hamburger di sola carne bovina, cotto sulla piastra e servito al naturale.",
    ing: "Carne bovina, sale, pepe.",
    ris: "Padella a fuoco vivo per 2 minuti per lato, oppure forno 180 gradi per 7 minuti.",
    con: "Senza panatura né additivi, adatto anche a chi evita il glutine.",
  },
  sfo_ver: {
    col: "rosso",
    n: "Sformato di verdure e formaggio", ill: "tofu", pal: ["#F9F7EA", "#F0ECD6", "#F5F1DE", "#C4B98A"],
    kcal: 340, g: [22.4, 11.6, 14, 4.2, 19.8, 1.4], mk: ["V", "SG"], a: [3, 7],
    de: "Verdure di stagione legate con UOVA e FORMAGGIO, cotte al forno in stampo.",
    ing: "Zucchine, carote, spinaci, UOVA, GRANA PADANO, LATTE, noce moscata, sale.",
    ris: "Forno 170 gradi per 10 minuti, oppure microonde 800 W per 2 minuti.",
    con: "Buono anche tiepido, si taglia meglio dopo qualche minuto di riposo.",
  },
  ver_gri: {
    col: "verde",
    n: "Verdure grigliate", ill: "verdure", pal: ["#F6F8F0", "#EAF0DC", "#D2E0B4", "#5E7A34"],
    ing: "Zucchine, melanzane, peperoni rossi, cipolla rossa, olio EVO, origano, sale",
    kcal: 95, g: [6.2, 0.9, 7.4, 4.6, 2.1, 0.5], mk: ["V", "VEG", "SG"], a: [],
    de: "Melanzane, zucchine e peperoni grigliati e conditi con olio ed erbe aromatiche.",
    ing: "Melanzane, zucchine, peperoni, olio extravergine, origano, aglio, sale.",
    ris: "Microonde 800 W per 90 secondi, oppure padella antiaderente per 2 minuti.",
    con: "Ottime anche fredde come contorno estivo.",
  },
  ins_mis: {
    col: "verde",
    n: "Insalata mista", ill: "insalata", pal: ["#F5F9EF", "#E6F0D9", "#D2E0B4", "#5E7A34"],
    kcal: 55, g: [3.8, 0.5, 4.2, 3.1, 1.4, 0.4], mk: ["V", "VEG", "SG"], a: [],
    de: "Misto di foglie fresche con pomodorini e carote julienne, condimento a parte.",
    ing: "Lattuga, radicchio, rucola, pomodorini, carote. Olio e aceto in bustina separata.",
    ris: "Si consuma fredda, non richiede riscaldamento.",
    con: "Condire solo al momento del consumo per non far appassire le foglie.",
  },
  pat_for: {
    col: "giallo",
    n: "Patate al forno", ill: "patate", pal: ["#FDF9EC", "#FAF0D1", "#EDC878", "#A9793C"],
    kcal: 185, g: [6.4, 1.0, 28, 1.4, 3.2, 0.7], mk: ["V", "VEG", "SG"], a: [],
    de: "Spicchi di patata cotti al forno con rosmarino e olio extravergine.",
    ing: "Patate, olio extravergine, rosmarino, aglio, sale.",
    ris: "Forno 190 gradi per 7 minuti per ritrovare la croccantezza. Il microonde le ammorbidisce.",
    con: "Vanno consumate calde, appena riscaldate.",
  },
  fag_vap: {
    col: "verde",
    n: "Fagiolini al vapore", ill: "verdure", pal: ["#F4F9EF", "#E5F0DA", "#D2E0B4", "#5E7A34"],
    kcal: 65, g: [3.2, 0.4, 6.8, 2.4, 2.6, 0.3], mk: ["V", "VEG", "SG"], a: [],
    de: "Fagiolini cotti al vapore, conditi con olio a crudo e una punta di limone.",
    ing: "Fagiolini, olio extravergine, succo di limone, sale.",
    ris: "Microonde 800 W per 90 secondi, oppure padella con un cucchiaio d'acqua.",
    con: "Contorno molto leggero, si abbina bene ai secondi più sostanziosi.",
  },
  uni_ris: {
    col: "blu",
    n: "Riso alla cantonese", ill: "riso", pal: ["#FDFAF0", "#FAF2DA", "#F4EBD2", "#C58A2C"],
    kcal: 520, g: [18.4, 4.2, 68, 3.8, 22.6, 1.9], mk: ["M"], a: [3, 6],
    de: "Riso saltato con prosciutto cotto, piselli e uovo strapazzato. Piatto completo.",
    ing: "Riso, prosciutto cotto, piselli, UOVA, salsa di soia, olio di semi, cipollotto.",
    ris: "Padella a fuoco vivo per 3 minuti, oppure microonde 800 W per due minuti e mezzo.",
    con: "Piatto completo, non richiede secondo né contorno.",
    so: ["primo", "secondo", "contorno"],
  },
  uni_pia: {
    col: "blu",
    n: "Piadina con squacquerone e verdure", ill: "piadina", pal: ["#FDF8F0", "#FAEDDA", "#F2DDBE", "#A9793C"],
    kcal: 445, g: [19.6, 8.4, 48, 3.2, 16.4, 1.7], mk: ["V"], a: [1, 7],
    de: "Piadina romagnola farcita con squacquerone, rucola e verdure grigliate.",
    ing: "FARINA DI GRANO TENERO, strutto vegetale, SQUACQUERONE, rucola, zucchine e melanzane grigliate.",
    ris: "Padella a fuoco medio per 2 minuti per lato. Sconsigliato il microonde.",
    con: "Sostituisce secondo e contorno, si abbina volendo a un primo leggero.",
    so: ["secondo", "contorno"],
  },
  uni_ins: {
    col: "blu",
    n: "Insalatona proteica del giorno", ill: "insalata", pal: ["#F6F9F1", "#E9F1DC", "#D2E0B4", "#5E7A34"],
    kcal: 395, g: [18.2, 4.6, 22, 5.2, 32.4, 1.4], mk: ["SG"], a: [3, 7],
    de: "Foglie miste con pollo alla griglia, uovo sodo, grana a scaglie e pomodorini.",
    ing: "Insalata mista, petto di pollo, UOVA, GRANA PADANO, pomodorini, mais, olio extravergine.",
    ris: "Si consuma fredda, non richiede riscaldamento.",
    con: "Piatto completo e bilanciato, sostituisce secondo e contorno.",
    so: ["secondo", "contorno"],
  },
  uni_las: {
    col: "blu",
    n: "Lasagna vegetariana con insalata", ill: "lasagna", pal: ["#F7F9F0", "#EBF2DE", "#5E7A34", "#F3DFAE"],
    kcal: 560, g: [24.8, 11.2, 52, 6.4, 21.2, 1.8], mk: ["V"], a: [1, 3, 7],
    de: "Porzione abbondante di lasagna alle verdure servita con insalata di contorno.",
    ing: "SFOGLIA ALL'UOVO, zucchine, melanzane, besciamella, GRANA, passata di pomodoro, insalata mista.",
    ris: "Forno 180 gradi per 12 minuti. L'insalata va tenuta da parte.",
    con: "Piatto unico completo, sostituisce primo, secondo e contorno.",
    so: ["primo", "secondo", "contorno"],
  },
};

/* piatti presenti tutti i giorni */
export const FISSI = {
  primo: ["pas_pom", "pas_arr"],
  sost_primo: ["ins_far", "ins_qui"],
  secondo: ["pol_gri", "ham_gri"],
  sost_secondo: ["for_mis", "fri_zuc"],
  contorno: ["ins_mis", "pat_for", "fag_vap"],
  unico: [],
};

/* piatti che ruotano, uno per giorno */
export const VARIABILI = [
  { primo: ["ris_fun", "las_bol", "gno_gor", "ris_zaf"], sost_primo: ["vel_zuc", "zup_leg"], secondo: ["sal_for", "pol_sug", "cot_mil", "spe_pol"], sost_secondo: ["tof_pia", "sfo_ver"], contorno: ["ver_gri"], unico: ["uni_ris", "pas_fag"] },
  { primo: ["pas_pes", "min_orz", "cre_spi", "gno_gor"], sost_primo: ["vel_zuc", "zup_leg"], secondo: ["pol_sug", "tac_lim", "pla_mug", "arr_tac"], sost_secondo: ["bur_leg", "sfo_ver"], contorno: ["ver_gri"], unico: ["uni_pia"] },
  { primo: ["ris_fun", "min_orz", "pas_arr", "cre_spi"], sost_primo: ["ins_far", "ins_qui"], secondo: ["tac_lim", "sal_for", "spe_pol", "cot_mil"], sost_secondo: ["fri_zuc", "tof_pia"], contorno: ["ver_gri"], unico: ["pas_fag"] },
  { primo: ["pas_pes", "las_bol", "ris_zaf", "gno_gor"], sost_primo: ["vel_zuc", "ins_qui"], secondo: ["pol_gri", "pol_sug", "pla_mug", "arr_tac"], sost_secondo: ["for_mis", "bur_leg"], contorno: ["ver_gri"], unico: ["uni_ins"] },
  { primo: ["min_orz", "ris_fun", "cre_spi", "pas_arr"], sost_primo: ["ins_far", "zup_leg"], secondo: ["sal_for", "tac_lim", "cot_mil", "spe_pol"], sost_secondo: ["fri_zuc", "sfo_ver"], contorno: ["ver_gri"], unico: ["uni_las"] },
];

export const GIORNI = [
  { n: "Lunedì", d: "31 agosto", breve: "31 ago", chiuso: true },
  { n: "Martedì", d: "1 settembre", breve: "1 set", chiuso: true },
  { n: "Mercoledì", d: "2 settembre", breve: "2 set", chiuso: false },
  { n: "Giovedì", d: "3 settembre", breve: "3 set", chiuso: false },
  { n: "Venerdì", d: "4 settembre", breve: "4 set", chiuso: false },
];

/* menu = { variabili: [...5 giorni], fissi: {...} }, tenuto nello stato */
export const MENU_INIZIALE = {
  variabili: VARIABILI.map((g) => ({ ...g })),
  fissi: { ...FISSI },
};

export function menuDelGiorno(menu, indiceGiorno, categoria) {
  const variabili = (menu.variabili[indiceGiorno] || {})[categoria] || [];
  const fissi = menu.fissi[categoria] || [];
  return variabili.concat(fissi.filter((id) => !variabili.includes(id)));
}

/* piatti del catalogo compatibili con una categoria */
export function catalogoPerCategoria(categoria) {
  const unici = Object.keys(PIATTI).filter((id) => PIATTI[id].so);
  if (categoria === "unico") return unici;
  return Object.keys(PIATTI).filter((id) => !PIATTI[id].so);
}

export function sostituisce(id) {
  const so = PIATTI[id].so;
  if (!so) return "";
  return "sostituisce " + so.join(" + ");
}

export const DIPENDENTI = [
  { m: "MV0142", n: "Anna Ferrari", rep: "Amministrazione", dieta: "riservata", stato: "attivo", pasti: 21 },
  { m: "MV0143", n: "Marco Bassi", rep: "Produzione", dieta: "nessuna", stato: "attivo", pasti: 19 },
  { m: "MV0144", n: "Sara Colombo", rep: "Amministrazione", dieta: "vegetariano", stato: "attivo", pasti: 20 },
  { m: "MV0145", n: "Luca De Santis", rep: "Logistica", dieta: "nessuna", stato: "attivo", pasti: 18 },
  { m: "MV0146", n: "Giulia Moretti", rep: "Logistica", dieta: "riservata", stato: "attivo", pasti: 21 },
  { m: "MV0147", n: "Paolo Rinaldi", rep: "Produzione", dieta: "nessuna", stato: "sospeso", pasti: 7 },
  { m: "MV0148", n: "Chiara Vitali", rep: "Commerciale", dieta: "vegetariano", stato: "attivo", pasti: 20 },
  { m: "MV0149", n: "Davide Orlando", rep: "Produzione", dieta: "nessuna", stato: "attivo", pasti: 17 },
];

export const FATTURE = [
  { num: "2026/0412", periodo: "Giugno 2026", pasti: 842, imp: "6.315,00", stato: "pagata", sdi: "consegnata" },
  { num: "2026/0489", periodo: "Luglio 2026", pasti: 790, imp: "5.925,00", stato: "da pagare", sdi: "consegnata" },
  { num: "proforma", periodo: "Agosto 2026", pasti: 301, imp: "2.257,50", stato: "in corso", sdi: "non emessa" },
];

/* base della distinta di produzione, il prototipo somma le scelte fatte in demo */
export const AGGREGATO = {
  pas_pom: 5, ris_fun: 4, las_bol: 3, vel_zuc: 2, ins_far: 1,
  pol_gri: 6, sal_for: 4, pol_sug: 3, tof_pia: 2, for_mis: 1,
  ver_gri: 5, ins_mis: 6, pat_for: 4, fag_vap: 2, uni_ris: 3,
};

export const PREZZO_PASTO = 7.5;
export const QUOTA_DIPENDENTE = 3.2;

/* elenco degli allergeni presenti in un menu di giornata */
export function allergeniDelGiorno(menu, giorno) {
  const set = new Set();
  CATEGORIE.forEach((c) => {
    menuDelGiorno(menu, giorno, c.id).forEach((id) => PIATTI[id].a.forEach((n) => set.add(n)));
  });
  return [...set].sort((a, b) => a - b);
}

/* ============================================================
   Tipi di committente e modelli di ordinazione
   La cucina è la stessa, cambia chi ordina e come si aggrega.
   ============================================================ */
export const MODELLI = {
  individuale: {
    nome: "Ordinazione individuale",
    chi: "Il singolo commensale",
    come: "Ogni persona sceglie le proprie portate dal menu del giorno.",
    aggrega: "Per reparto e per punto di consegna, con distinta nominativa.",
    paga: "L'azienda fattura, il dipendente rimborsa in busta paga.",
  },
  unita: {
    nome: "Ordinazione per unità",
    chi: "L'operatore del nucleo o del reparto",
    come: "Si dichiarano le quantità per tipo di dieta e di consistenza, non le scelte individuali.",
    aggrega: "Per nucleo, con il dettaglio delle diete terapeutiche e delle consistenze.",
    paga: "La struttura, a pasto erogato.",
  },
  presenze: {
    nome: "Rilevazione presenze",
    chi: "L'insegnante o la segreteria",
    come: "Si confermano i presenti per classe. Il menu è fisso e vidimato dall'ATS.",
    aggrega: "Per classe e per fascia d'età, con grammature differenziate.",
    paga: "L'ente gestore, oppure le famiglie tramite l'ente.",
  },
};

export const COMMITTENTI = [
  {
    id: "azienda", nome: "Rossi Manifatture Spa", tipo: "Azienda", modello: "individuale",
    unita: ["Amministrazione", "Produzione", "Logistica", "Commerciale"],
    etichettaUnita: "Reparto", pasti: 28,
    nota: "Modello classico della mensa aziendale, ogni dipendente compone il proprio pasto.",
  },
    {
    id: "comunita", nome: "Comunità Il Ponte", tipo: "Comunità", modello: "unita",
    unita: ["Casa Aurora", "Casa Ulivo"],
    etichettaUnita: "Casa", pasti: 31,
    nota: "Menu fisso con poche personalizzazioni, ordine dichiarato dall'educatore di turno.",
  },
  ];

/* Diete e consistenze, il vocabolario di RSA e comunità */
export const CONSISTENZE = [
  { id: "normale", nome: "Normale", nota: "Nessuna modifica di consistenza" },
  { id: "tritato", nome: "Tritato", nota: "Alimenti sminuzzati, per masticazione ridotta" },
  { id: "frullato", nome: "Frullato", nota: "Consistenza omogenea, per disfagia" },
  { id: "addensato", nome: "Liquidi addensati", nota: "Su indicazione logopedica" },
];

export const DIETE_TERAPEUTICHE = [
  { id: "std", nome: "Standard", tipo: "base" },
  { id: "iposodica", nome: "Iposodica", tipo: "terapeutica" },
  { id: "ipoproteica", nome: "Ipoproteica", tipo: "terapeutica" },
  { id: "diabetica", nome: "Per diabetici", tipo: "terapeutica" },
  { id: "senza_glutine", nome: "Senza glutine", tipo: "sanitaria" },
  { id: "vegetariana", nome: "Vegetariana", tipo: "etica" },
  { id: "no_suino", nome: "Senza carne suina", tipo: "religiosa" },
];

/* Grammature scolastiche indicative, grammi a porzione per fascia d'età */
export const FASCE_SCOLASTICHE = [
  { id: "infanzia", nome: "Infanzia, 3 · 5 anni", primo: 50, secondo: 60, contorno: 100, pane: 40 },
  { id: "primaria", nome: "Primaria, 6 · 10 anni", primo: 70, secondo: 80, contorno: 130, pane: 50 },
  { id: "secondaria", nome: "Secondaria, 11 · 13 anni", primo: 90, secondo: 100, contorno: 150, pane: 60 },
];

/* dati di esempio della giornata, per i modelli non individuali */
export const ORDINI_UNITA = {
  comunita: [
    { unita: "Casa Aurora", normale: 16, tritato: 0, frullato: 0, iposodica: 1, diabetica: 1, senza_glutine: 1 },
    { unita: "Casa Ulivo", normale: 11, tritato: 1, frullato: 0, iposodica: 0, diabetica: 0, senza_glutine: 0 },
  ],
};

export const PRESENZE_SCUOLA = [
  { unita: "Infanzia A", fascia: "infanzia", iscritti: 24, presenti: 21, diete: 2 },
  { unita: "Infanzia B", fascia: "infanzia", iscritti: 22, presenti: 20, diete: 3 },
  { unita: "Primaria 1", fascia: "primaria", iscritti: 26, presenti: 24, diete: 1 },
  { unita: "Primaria 2", fascia: "primaria", iscritti: 27, presenti: 26, diete: 4 },
  { unita: "Primaria 3", fascia: "primaria", iscritti: 28, presenti: 27, diete: 2 },
];

/* ============================================================
   Utenti della piattaforma.
   Un solo accesso per tutti. Il profilo dice a quale committente
   appartiene la persona e con quale ruolo, e da lì la piattaforma
   decide cosa mostrare. A regime questa è una tabella del database,
   con la chiave esterna verso il committente.
   ============================================================ */
export const UTENTI = [
  { u: "antonella.rossi", nome: "Antonella Rossi", iniziali: "AR", struttura: "azienda", ruolo: "dipendente", committente: "Rossi Manifatture Spa", mansione: "Amministrazione" },
  { u: "roberto.manzi", nome: "Roberto Manzi", iniziali: "RM", struttura: "azienda", ruolo: "referente", committente: "Rossi Manifatture Spa", mansione: "Ufficio del personale" },
      { u: "samuele.ferri", nome: "Samuele Ferri", iniziali: "SF", struttura: "comunita", ruolo: "operatore", committente: "Comunità Il Ponte", mansione: "Casa Aurora" },
  { u: "ilaria.gatti", nome: "Ilaria Gatti", iniziali: "IG", struttura: "comunita", ruolo: "responsabile", committente: "Comunità Il Ponte", mansione: "Responsabile" },
      { u: "cucina.mavi", nome: "Cucina centrale", iniziali: "MV", struttura: "mavi", ruolo: "fornitore", committente: "MAVI Ristorazione", mansione: "Produzione e amministrazione" },
];

export const ETICHETTE_STRUTTURA = {
  azienda: "Azienda",
  comunita: "Comunità",
  mavi: "Fornitore",
};

export const ETICHETTE_RUOLO = {
  dipendente: "Dipendente",
  referente: "Referente",
  operatore: "Operatore",
  responsabile: "Responsabile",
  fornitore: "Cucina MAVI",
};

export function trovaUtente(nomeUtente) {
  const pulito = String(nomeUtente || "").trim().toLowerCase();
  return UTENTI.find((x) => x.u === pulito) || null;
}

/* ============================================================
   Ospiti delle RSA. NOMI DI FANTASIA, dati dimostrativi.
   In produzione sono dati sanitari, con consenso, cifratura e
   responsabilità dedicate. Qui servono solo a mostrare il flusso.
   ============================================================ */
export const OSPITI = [
  { id: "osp1", nome: "Giuseppina M.", nucleo: "Nucleo Glicine", eta: 84, consistenza: "normale", diete: ["iposodica"], note: "Gradisce porzioni ridotte a cena." },
  { id: "osp2", nome: "Adelmo R.", nucleo: "Nucleo Glicine", eta: 79, consistenza: "tritato", diete: ["diabetica"], note: "Difficoltà di masticazione." },
  { id: "osp3", nome: "Teresa B.", nucleo: "Nucleo Glicine", eta: 88, consistenza: "frullato", diete: ["iposodica", "senza_glutine"], note: "Disfagia, liquidi da addensare." },
  { id: "osp4", nome: "Vittorio L.", nucleo: "Nucleo Glicine", eta: 81, consistenza: "normale", diete: [], note: "" },
  { id: "osp5", nome: "Carmela P.", nucleo: "Nucleo Magnolia", eta: 90, consistenza: "tritato", diete: ["iposodica"], note: "" },
  { id: "osp6", nome: "Rosario D.", nucleo: "Nucleo Magnolia", eta: 76, consistenza: "normale", diete: ["diabetica"], note: "Controllo glicemico." },
  { id: "osp7", nome: "Ida F.", nucleo: "Nucleo Magnolia", eta: 85, consistenza: "normale", diete: [], note: "" },
  { id: "osp8", nome: "Bruno G.", nucleo: "Nucleo protetto", eta: 83, consistenza: "frullato", diete: ["ipoproteica"], note: "Insufficienza renale, dieta controllata." },
  { id: "osp9", nome: "Antonietta S.", nucleo: "Nucleo protetto", eta: 87, consistenza: "tritato", diete: ["diabetica", "iposodica"], note: "" },
];

export function ospitiDelNucleo(nucleo) {
  return OSPITI.filter((o) => o.nucleo === nucleo);
}

/* etichetta leggibile di una dieta, a partire dal codice */
export function nomeDieta(id) {
  const d = DIETE_TERAPEUTICHE.find((x) => x.id === id);
  return d ? d.nome : id;
}
export function nomeConsistenza(id) {
  const c = CONSISTENZE.find((x) => x.id === id);
  return c ? c.nome : id;
}

/* ============================================================
   Anagrafica ospiti RSA, con la dieta prescritta.
   Nomi di fantasia, dato dimostrativo. A regime i dati sanitari
   richiedono cifratura, consenso e responsabilità precise.
   ============================================================ */
export const OSPITI_RSA = [
  { id: "o01", nome: "Adelina Bianchi", nucleo: "Nucleo Glicine", stanza: "12", dieta: "std", consistenza: "normale", note: "Preferisce porzioni piccole, non gradisce il pesce.", dal: "marzo 2024" },
  { id: "o02", nome: "Giovanni Ranieri", nucleo: "Nucleo Glicine", stanza: "14", dieta: "diabetica", consistenza: "normale", note: "Diabete tipo 2, controllo glicemico due volte al giorno.", dal: "settembre 2023" },
  { id: "o03", nome: "Elsa Ferrari", nucleo: "Nucleo Glicine", stanza: "16", dieta: "iposodica", consistenza: "tritato", note: "Difficoltà di masticazione dopo intervento.", dal: "gennaio 2025" },
  { id: "o04", nome: "Umberto Marini", nucleo: "Nucleo Glicine", stanza: "18", dieta: "std", consistenza: "frullato", note: "Disfagia moderata, seguito da logopedista.", dal: "luglio 2024" },
  { id: "o05", nome: "Rosa Conti", nucleo: "Nucleo Magnolia", stanza: "22", dieta: "senza_glutine", consistenza: "normale", note: "Celiachia diagnosticata, certificato in cartella.", dal: "novembre 2022" },
  { id: "o06", nome: "Alfredo Longhi", nucleo: "Nucleo Magnolia", stanza: "24", dieta: "ipoproteica", consistenza: "normale", note: "Insufficienza renale cronica.", dal: "aprile 2024" },
  { id: "o07", nome: "Maria Piras", nucleo: "Nucleo Magnolia", stanza: "26", dieta: "diabetica", consistenza: "tritato", note: "Diabete e problemi di deglutizione.", dal: "febbraio 2025" },
  { id: "o08", nome: "Ernesto Vitali", nucleo: "Nucleo protetto", stanza: "31", dieta: "std", consistenza: "frullato", note: "Deterioramento cognitivo, assistenza al pasto.", dal: "ottobre 2023" },
  { id: "o09", nome: "Livia Sartori", nucleo: "Nucleo protetto", stanza: "33", dieta: "iposodica", consistenza: "frullato", note: "Ipertensione, richiede assistenza.", dal: "giugno 2024" },
];

/* ============================================================
   Flusso dell'ordine, chi lo ha inviato e chi lo riceve
   ============================================================ */
export const FLUSSI_ORDINE = [
      { id: "f03", quando: "oggi, ore 08:35", struttura: "Comunità Il Ponte", tipo: "Comunità", inviato_da: "Samuele Ferri", ruolo: "Educatore, Casa Aurora", pasti: 19, note: "Nessuna dieta speciale", stato: "ricevuto" },
    { id: "f05", quando: "ieri, ore 13:52", struttura: "Rossi Manifatture Spa", tipo: "Azienda", inviato_da: "aggregato dei dipendenti", ruolo: "22 prenotazioni individuali", pasti: 22, note: "Due vegetariani", stato: "chiuso" },
  { id: "f06", quando: "oggi, in attesa", struttura: "Comunità Il Ponte", tipo: "Comunità", inviato_da: "Casa Ulivo", ruolo: "operatore non ancora entrato", pasti: 0, note: "Sollecito automatico alle 10:00", stato: "attesa" },
];

/* ============================================================
   Giri di consegna
   ============================================================ */
export const GIRI = [
  {
    id: "g1", nome: "Giro Nord", furgone: "Ducato FZ-421", autista: "Paolo Neri", partenza: "10:15",
    tappe: [
            { ora: "11:10", struttura: "Comunità Il Ponte, Casa Aurora", punto: "Portoncino laterale", pasti: 12, note: "Suonare al citofono, non lasciare fuori" },
      { ora: "11:35", struttura: "Comunità Il Ponte, Casa Ulivo", punto: "Ingresso principale", pasti: 7, note: "Fermata breve" },
    ],
  },
  {
    id: "g2", nome: "Giro Sud", furgone: "Doblò EY-088", autista: "Vera Piatti", partenza: "10:30",
    tappe: [
      { ora: "10:55", struttura: "Rossi Manifatture Spa", punto: "Refettorio, secondo piano", pasti: 22, note: "Il ritiro vaschette resi lo stesso pomeriggio alle 15" },
          ],
  },
];

/* ============================================================
   Impostazioni per committente
   ============================================================ */
export const IMPOSTAZIONI_INIZIALI = {
  azienda: { cutoff: "14:00 del giorno precedente", regolaPasto: "Composizione libera, dipendente sceglie", listino: "Tariffa unica, 7,50 €", frutta: false, monoporzione: false },
  comunita: { cutoff: "16:00 del giorno precedente", regolaPasto: "Menu fisso, personalizzazioni per singola casa", listino: "Convenzione, fatturazione mensile", frutta: true, monoporzione: false },
};

/* ============================================================
   Menu ciclico, quattro settimane a rotazione
   ============================================================ */
export const CICLICO = [
  { n: 1, nome: "Settimana 1, autunnale", nota: "In vigore dal 1 settembre", stato: "in vigore" },
  { n: 2, nome: "Settimana 2, autunnale", nota: "In vigore dall'8 settembre", stato: "prossima" },
  { n: 3, nome: "Settimana 3, autunnale", nota: "In vigore dal 15 settembre", stato: "programmata" },
  { n: 4, nome: "Settimana 4, autunnale", nota: "In vigore dal 22 settembre, poi si riparte dalla 1", stato: "programmata" },
];


/* Verifica se un piatto è fuori dalla dieta scelta */
export function fuoriDieta(piatto, dieta) {
  if (!dieta) return false;
  const m = piatto.m || [];
  if (dieta === "vegetariano") {
    // fuori dieta se contiene carne o pesce (non ha marcatore V né VEG)
    return !m.includes("V") && !m.includes("VEG");
  }
  if (dieta === "vegano") {
    // fuori dieta se non è vegano
    return !m.includes("VEG");
  }
  return false;
}

/* ============================================================
   Comunità: pazienti con dieta settimanale personalizzata.
   Nomi di fantasia, dato dimostrativo.
   ============================================================ */
const GIORNI_SETT = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];
const PASTI_TIPO = ["pranzo", "cena"];

export const PAZIENTI_COMUNITA = [
  {
    id: "p01", nome: "Beatrice Comi", stanza: "Spazio Giovani SGA", dal: "marzo 2025",
    note: "Celiachia + intolleranza al lattosio. Pasta senza glutine e riso integrale. Niente latticini.",
    tipo_dieta: "Allergia / Intolleranza",
    dieta: {
      lunedì:    { pranzo: { primo: "Risotto agli asparagi || NO MANTECATO", secondo: "Tacchino freddo", contorno: "Patate arrosto" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      martedì:   { pranzo: { primo: "Pasta zucchine e pomodori", secondo: "Frittata alle verdure || allergene 3", contorno: "Pomodori e mais" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      mercoledì: { pranzo: { primo: "Pasta al ragù", secondo: "Prosciutto cotto", contorno: "Broccoli in insalata" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      giovedì:   { pranzo: { primo: "Pasta alla norma", secondo: "Lonzino tonnato", contorno: "Spinaci all'olio EVO" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      venerdì:   { pranzo: { primo: "Pasta alla tarantina", secondo: "Filetto di pesce al forno", contorno: "Finocchi a vapore" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      sabato:    { pranzo: { primo: "—", secondo: "—", contorno: "—" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      domenica:  { pranzo: { primo: "—", secondo: "—", contorno: "—" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
    },
  },
  {
    id: "p02", nome: "Zied Dridi", stanza: "Spazio Giovani SGA", dal: "settembre 2025",
    note: "Dieta etico-religiosa. No carne di maiale, no gnocchi. Pasta = pastina.",
    tipo_dieta: "Etico-religiosa + personalizzata",
    dieta: {
      lunedì:    { pranzo: { primo: "Risotto agli asparagi || NO MANTECATO", secondo: "Fuselli di pollo al forno", contorno: "Patate arrosto" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      martedì:   { pranzo: { primo: "Pasta zucchine e pomodori", secondo: "Arrosto di tacchino alle erbe", contorno: "Piselli al tegame" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      mercoledì: { pranzo: { primo: "Pasta cacio e pepe", secondo: "Tonno all'olio EVO", contorno: "Tris di verdure" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      giovedì:   { pranzo: { primo: "Pasta alla norma con ricotta", secondo: "Petto di pollo al forno", contorno: "Spinaci al Padano" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      venerdì:   { pranzo: { primo: "Pasta alla tarantina", secondo: "Filetto di pesce al forno", contorno: "Finocchi a vapore" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      sabato:    { pranzo: { primo: "—", secondo: "—", contorno: "—" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
      domenica:  { pranzo: { primo: "—", secondo: "—", contorno: "—" }, cena: { primo: "—", secondo: "—", contorno: "—" } },
    },
  },
  {
    id: "p03", nome: "Carmelo Aronica", stanza: "CSS Sole Luna, Desio", dal: "gennaio 2026",
    note: "Esofagite + ernia jatale. No: piccante, limone, tonno, crostacei, formaggi fermentati, pomodori, peperoni, piselli, ceci, lenticchie, agrumi.",
    tipo_dieta: "Personalizzata per patologia",
    dieta: {
      lunedì:    { pranzo: { primo: "Risotto agli asparagi", secondo: "Fuselli di pollo al forno", contorno: "Patate arrosto" }, cena: { primo: "Pasta pomodoro e basilico", secondo: "Tacchino freddo", contorno: "Carote prezzemolate" } },
      martedì:   { pranzo: { primo: "Pasta al pesto", secondo: "Arrosto di coppa alle erbe", contorno: "Insalata fresca" }, cena: { primo: "Pasta zucchine", secondo: "Frittata alle verdure", contorno: "Purè di patate" } },
      mercoledì: { pranzo: { primo: "Pasta ai formaggi || NO PICCANTE", secondo: "Burger di manzo alla pizzaiola || SENZA POMODORO", contorno: "Broccoli in insalata" }, cena: { primo: "Pasta al ragù", secondo: "Caprese", contorno: "Cime di rapa ripassate" } },
      giovedì:   { pranzo: { primo: "Pasta alla norma con ricotta", secondo: "Lonzino tonnato", contorno: "Spinaci al Padano" }, cena: { primo: "Insalata di pasta mediterranea", secondo: "Primo sale", contorno: "Insalata di barbabietole" } },
      venerdì:   { pranzo: { primo: "Pasta all'olio", secondo: "Uova strapazzate", contorno: "Finocchi a vapore" }, cena: { primo: "Pasta aurora", secondo: "Prosciutto cotto", contorno: "Zucchine alla scapece" } },
      sabato:    { pranzo: { primo: "Gnocchi al pomodoro", secondo: "Scaloppa di pollo al formaggio", contorno: "Carote all'olio EVO" }, cena: { primo: "Pizza", secondo: "Prosciutto cotto", contorno: "Ratuille di verdure" } },
      domenica:  { pranzo: { primo: "Pasta al ragù", secondo: "Sofficini al formaggio", contorno: "Insalata mista" }, cena: { primo: "Sfoglia tacchino e formaggio", secondo: "Nuggets di pollo", contorno: "Patatine al forno" } },
    },
  },
  {
    id: "p04", nome: "Marco Bellini", stanza: "CSS Sole Luna, Desio", dal: "maggio 2024",
    note: "Dieta standard. Nessuna allergia o intolleranza nota. Porzioni regolari.",
    tipo_dieta: "Standard",
    dieta: {
      lunedì:    { pranzo: { primo: "Risotto agli asparagi", secondo: "Fuselli di pollo al forno", contorno: "Patate arrosto" }, cena: { primo: "Pasta pomodoro e basilico", secondo: "Tacchino freddo", contorno: "Carote prezzemolate" } },
      martedì:   { pranzo: { primo: "Pasta al pesto", secondo: "Arrosto di coppa alle erbe", contorno: "Insalata fresca" }, cena: { primo: "Pasta zucchine", secondo: "Frittata alle verdure", contorno: "Purè di patate" } },
      mercoledì: { pranzo: { primo: "Pasta ai formaggi", secondo: "Burger di manzo alla pizzaiola", contorno: "Broccoli in insalata" }, cena: { primo: "Pasta al ragù", secondo: "Caprese", contorno: "Cime di rapa ripassate" } },
      giovedì:   { pranzo: { primo: "Pasta alla norma con ricotta", secondo: "Lonzino tonnato", contorno: "Spinaci al Padano" }, cena: { primo: "Insalata di pasta mediterranea", secondo: "Primo sale", contorno: "Insalata di barbabietole" } },
      venerdì:   { pranzo: { primo: "Pasta all'olio", secondo: "Uova strapazzate", contorno: "Finocchi a vapore" }, cena: { primo: "Pasta aurora", secondo: "Prosciutto cotto", contorno: "Zucchine alla scapece" } },
      sabato:    { pranzo: { primo: "Gnocchi al pomodoro", secondo: "Scaloppa di pollo al formaggio", contorno: "Carote all'olio EVO" }, cena: { primo: "Pizza", secondo: "Prosciutto cotto", contorno: "Ratuille di verdure" } },
      domenica:  { pranzo: { primo: "Pasta al ragù", secondo: "Sofficini al formaggio", contorno: "Insalata mista" }, cena: { primo: "Sfoglia tacchino e formaggio", secondo: "Nuggets di pollo", contorno: "Patatine al forno" } },
    },
  },
]

export { GIORNI_SETT, PASTI_TIPO };


/* Separa il nome del piatto dalla nota di preparazione */
export function splitPiatto(testo) {
  if (!testo || testo === "—") return { nome: testo || "—", nota: "" };
  const parti = testo.split(" || ");
  return { nome: parti[0], nota: parti[1] || "" };
}

/* ============================================================
   Etichette demo dipendenti azienda — ordini già confermati
   ============================================================ */
export const ETICHETTE_AZIENDA_DEMO = [
  { id: "ea01", nome: "Anna Ferrari", matricola: "MV0142", reparto: "Amministrazione", committente: "Rossi Manifatture Spa",
    giorno: "mer 2 set 2026", pasto: "pranzo", primo: "Pasta al pomodoro", secondo: "Pollo grigliato", contorno: "Verdure grigliate" },
  { id: "ea02", nome: "Marco Bassi", matricola: "MV0143", reparto: "Produzione", committente: "Rossi Manifatture Spa",
    giorno: "mer 2 set 2026", pasto: "pranzo", primo: "Risotto ai funghi", secondo: "Salmone al forno", contorno: "Insalata mista" },
  { id: "ea03", nome: "Sara Colombo", matricola: "MV0144", reparto: "Amministrazione", committente: "Rossi Manifatture Spa",
    giorno: "mer 2 set 2026", pasto: "pranzo", primo: "Vellutata di zucca", secondo: "Tofu alla piastra", contorno: "Fagiolini a vapore" },
  { id: "ea04", nome: "Luca De Santis", matricola: "MV0145", reparto: "Logistica", committente: "Rossi Manifatture Spa",
    giorno: "mer 2 set 2026", pasto: "pranzo", primo: "Lasagne alla bolognese", secondo: "Polpette al sugo", contorno: "Patate al forno" },
  { id: "ea05", nome: "Giulia Moretti", matricola: "MV0146", reparto: "Logistica", committente: "Rossi Manifatture Spa",
    giorno: "mer 2 set 2026", pasto: "pranzo", primo: "Insalata di farro", secondo: "Formaggio misto", contorno: "Insalata mista" },
  { id: "ea06", nome: "Chiara Vitali", matricola: "MV0148", reparto: "Commerciale", committente: "Rossi Manifatture Spa",
    giorno: "mer 2 set 2026", pasto: "pranzo", primo: "Pasta al pomodoro", secondo: "Tofu alla piastra", contorno: "Verdure grigliate" },
  { id: "ea07", nome: "Davide Orlando", matricola: "MV0149", reparto: "Produzione", committente: "Rossi Manifatture Spa",
    giorno: "mer 2 set 2026", pasto: "pranzo", primo: "Risotto ai funghi", secondo: "Pollo grigliato", contorno: "Patate al forno" },
];

/* ============================================================
   Resoconto mensile demo — dati aggregati per il mese
   ============================================================ */
export const RESOCONTO_MENSILE = {
  mese: "Agosto 2026",
  azienda: {
    dipendenti: DIPENDENTI.map((d) => ({
      ...d,
      dettaglio: [
        { giorno: "1 ago", primo: "Pasta al pomodoro", secondo: "Pollo grigliato", contorno: "Insalata mista" },
        { giorno: "2 ago", primo: "Risotto ai funghi", secondo: "Salmone al forno", contorno: "Verdure grigliate" },
        { giorno: "5 ago", primo: "Lasagne alla bolognese", secondo: "Polpette al sugo", contorno: "Patate al forno" },
        { giorno: "6 ago", primo: "Vellutata di zucca", secondo: "Tofu alla piastra", contorno: "Fagiolini a vapore" },
        { giorno: "7 ago", primo: "Pasta al pesto", secondo: "Formaggio misto", contorno: "Insalata mista" },
        { giorno: "8 ago", primo: "Insalata di farro", secondo: "Pollo grigliato", contorno: "Verdure grigliate" },
        { giorno: "9 ago", primo: "Risotto ai funghi", secondo: "Salmone al forno", contorno: "Patate al forno" },
        { giorno: "12 ago", primo: "Pasta al pomodoro", secondo: "Polpette al sugo", contorno: "Insalata mista" },
        { giorno: "13 ago", primo: "Lasagne alla bolognese", secondo: "Tofu alla piastra", contorno: "Fagiolini a vapore" },
        { giorno: "14 ago", primo: "—", secondo: "—", contorno: "—" },
        { giorno: "16 ago", primo: "Vellutata di zucca", secondo: "Pollo grigliato", contorno: "Verdure grigliate" },
        { giorno: "19 ago", primo: "Pasta al pesto", secondo: "Salmone al forno", contorno: "Patate al forno" },
        { giorno: "20 ago", primo: "Insalata di farro", secondo: "Formaggio misto", contorno: "Insalata mista" },
        { giorno: "21 ago", primo: "Risotto ai funghi", secondo: "Polpette al sugo", contorno: "Verdure grigliate" },
        { giorno: "22 ago", primo: "Pasta al pomodoro", secondo: "Pollo grigliato", contorno: "Fagiolini a vapore" },
        { giorno: "23 ago", primo: "Lasagne alla bolognese", secondo: "Tofu alla piastra", contorno: "Patate al forno" },
        { giorno: "26 ago", primo: "Vellutata di zucca", secondo: "Salmone al forno", contorno: "Insalata mista" },
        { giorno: "27 ago", primo: "Pasta al pesto", secondo: "Formaggio misto", contorno: "Verdure grigliate" },
        { giorno: "28 ago", primo: "Insalata di farro", secondo: "Pollo grigliato", contorno: "Fagiolini a vapore" },
        { giorno: "29 ago", primo: "Risotto ai funghi", secondo: "Polpette al sugo", contorno: "Patate al forno" },
        { giorno: "30 ago", primo: "Pasta al pomodoro", secondo: "Salmone al forno", contorno: "Insalata mista" },
      ].slice(0, d.pasti),
    })),
    totPasti: DIPENDENTI.reduce((s, d) => s + d.pasti, 0),
  },
};

export const INGREDIENTI_DIETE = {
  "Pasta al ragù": { ing: "Pasta di semola, ragù di carne bovina, carota, sedano, cipolla, passata di pomodoro, olio EVO, sale", a: ["1"] },
  "Prosciutto cotto": { ing: "Coscia di suino, sale, destrosio, aromi naturali", a: [] },
  "Broccoli in insalata": { ing: "Broccoli, olio EVO, limone, sale", a: [] },
  "Pasta zucchine e pomodori": { ing: "Pasta di semola, zucchine, pomodorini, aglio, olio EVO, basilico, sale", a: ["1"] },
  "Tonno all'olio EVO": { ing: "Filetto di tonno, olio EVO, sale", a: ["4"] },
  "Pomodori e mais": { ing: "Pomodori, mais dolce, olio EVO, origano, sale", a: [] },
  "Pasta ai formaggi": { ing: "Pasta di semola, fontina, gorgonzola, parmigiano, burro, pepe, sale", a: ["1","7"] },
  "Fuselli di pollo al forno": { ing: "Fusi di pollo, rosmarino, aglio, olio EVO, patate, sale, pepe", a: [] },
  "Patate arrosto": { ing: "Patate, olio EVO, rosmarino, aglio, sale", a: [] },
  "Pasta cacio e pepe": { ing: "Pasta di semola, pecorino romano DOP, pepe nero, sale", a: ["1","7"] },
  "Burger di manzo alla pizzaiola": { ing: "Carne bovina macinata, passata di pomodoro, origano, capperi, olio EVO, sale", a: [] },
  "Tris di verdure": { ing: "Zucchine, carote, fagiolini, olio EVO, sale", a: [] },
  "Pasta alla norma": { ing: "Pasta di semola, melanzane, passata di pomodoro, ricotta salata, basilico, olio EVO, sale", a: ["1","7"] },
  "Lonzino tonnato": { ing: "Lonza di suino, tonno, capperi, acciughe, maionese, limone", a: ["3","4"] },
  "Spinaci all'olio EVO": { ing: "Spinaci freschi, olio EVO, aglio, sale", a: [] },
  "Filetto di pesce al forno": { ing: "Filetto di merluzzo, pangrattato, prezzemolo, aglio, olio EVO, limone, sale", a: ["1","4"] },
  "Finocchi a vapore": { ing: "Finocchi, olio EVO, sale", a: [] },
  "Risotto agli asparagi": { ing: "Riso carnaroli, asparagi, cipolla, brodo vegetale, burro, parmigiano, sale", a: ["1","7"] },
  "Tacchino freddo": { ing: "Petto di tacchino, sale, aromi naturali", a: [] },
  "Pasta alla tarantina": { ing: "Pasta di semola, cozze, vongole, pomodorini, aglio, prezzemolo, olio EVO, peperoncino", a: ["1","14"] },
  "Frittata alle verdure": { ing: "Uova, zucchine, peperoni, cipolla, parmigiano, olio EVO, sale", a: ["3","7"] },
  "Insalata mista": { ing: "Lattuga, pomodori, carote, mais, olio EVO, aceto, sale", a: [] },
  "Patate al forno": { ing: "Patate, olio EVO, rosmarino, sale", a: [] },
  "Verdure grigliate": { ing: "Zucchine, melanzane, peperoni, cipolla rossa, olio EVO, origano, sale", a: [] },
  "Pasta al pomodoro": { ing: "Pasta di semola, passata di pomodoro, basilico, aglio, olio EVO, sale", a: ["1"] },
  "Pollo grigliato": { ing: "Petto di pollo, rosmarino, timo, aglio, olio EVO, sale, pepe", a: [] },
  "Tofu alla piastra": { ing: "Tofu biologico, salsa di soia, zenzero, olio di sesamo, sale", a: ["6"] },
  "Fagiolini a vapore": { ing: "Fagiolini, olio EVO, sale", a: [] },
  "Piselli al tegame": { ing: "Piselli, cipolla, olio EVO, sale, menta", a: [] },
  "Polpette al sugo": { ing: "Carne bovina e suina, pangrattato, uova, parmigiano, passata di pomodoro, cipolla, olio EVO, sale", a: ["1","3","7"] },
  "Formaggio misto": { ing: "Selezione di formaggi stagionati e freschi", a: ["7"] },
  "Insalata di farro": { ing: "Farro perlato, pomodorini, olive, cetrioli, cipolla rossa, olio EVO, basilico, sale", a: ["1"] },
  "Salmone al forno": { ing: "Filetto di salmone, limone, aneto, olio EVO, pangrattato, sale, pepe", a: ["1","4"] },
  "Petto di pollo al forno": { ing: "Petto di pollo, rosmarino, limone, olio EVO, sale, pepe", a: [] },
};
