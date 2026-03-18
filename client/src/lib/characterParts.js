// Character body parts library — SVG parts for the character builder block
// Each part is designed for a 128x128 canvas with offsets for compositing

// ── Huvud (Head) ────────────────────────────────────────────────
const HUVUD = [
  {
    id: 'rund',
    name: 'Rund',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><circle cx="40" cy="28" r="26" fill="VAR_SKIN"/></svg>`,
  },
  {
    id: 'fyrkantig',
    name: 'Fyrkantig',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><rect x="8" y="2" width="64" height="52" rx="8" fill="VAR_SKIN"/></svg>`,
  },
  {
    id: 'oval',
    name: 'Oval',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><ellipse cx="40" cy="28" rx="32" ry="26" fill="VAR_SKIN"/></svg>`,
  },
  {
    id: 'triangular',
    name: 'Triangulär',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><path d="M40 2 L72 54 L8 54 Z" rx="4" fill="VAR_SKIN"/><ellipse cx="40" cy="42" rx="28" ry="14" fill="VAR_SKIN"/></svg>`,
  },
  {
    id: 'hjartformad',
    name: 'Hjärtformad',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><path d="M40 50 L14 28 a16 16 0 0 1 26-14 a16 16 0 0 1 26 14 Z" fill="VAR_SKIN"/></svg>`,
  },
  {
    id: 'stjarnformad',
    name: 'Stjärnformad',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><polygon points="40,2 47,20 66,20 52,32 57,50 40,40 23,50 28,32 14,20 33,20" fill="VAR_SKIN"/></svg>`,
  },
];

// ── Ögon (Eyes) ─────────────────────────────────────────────────
const OGON = [
  {
    id: 'glada',
    name: 'Glada',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><circle cx="26" cy="24" r="5" fill="VAR_EYE"/><circle cx="54" cy="24" r="5" fill="VAR_EYE"/><circle cx="27" cy="23" r="2" fill="#fff"/><circle cx="55" cy="23" r="2" fill="#fff"/></svg>`,
  },
  {
    id: 'ledsna',
    name: 'Ledsna',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><ellipse cx="26" cy="26" rx="5" ry="4" fill="VAR_EYE"/><ellipse cx="54" cy="26" rx="5" ry="4" fill="VAR_EYE"/><path d="M21 22 q5-4 10 0" stroke="#666" stroke-width="2" fill="none"/><path d="M49 22 q5-4 10 0" stroke="#666" stroke-width="2" fill="none"/></svg>`,
  },
  {
    id: 'arga',
    name: 'Arga',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><circle cx="26" cy="26" r="5" fill="VAR_EYE"/><circle cx="54" cy="26" r="5" fill="VAR_EYE"/><path d="M21 20 q5 4 10 0" stroke="#333" stroke-width="2.5" fill="none"/><path d="M49 20 q5 4 10 0" stroke="#333" stroke-width="2.5" fill="none"/></svg>`,
  },
  {
    id: 'forvaanade',
    name: 'Förvånade',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><circle cx="26" cy="24" r="7" fill="white" stroke="VAR_EYE" stroke-width="2"/><circle cx="54" cy="24" r="7" fill="white" stroke="VAR_EYE" stroke-width="2"/><circle cx="26" cy="24" r="4" fill="VAR_EYE"/><circle cx="54" cy="24" r="4" fill="VAR_EYE"/><circle cx="27" cy="23" r="1.5" fill="#fff"/><circle cx="55" cy="23" r="1.5" fill="#fff"/></svg>`,
  },
  {
    id: 'somniga',
    name: 'Sömniga',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><path d="M21 22 q5 6 10 0" stroke="VAR_EYE" stroke-width="3" fill="VAR_EYE"/><path d="M49 22 q5 6 10 0" stroke="VAR_EYE" stroke-width="3" fill="VAR_EYE"/><path d="M20 22 q5-3 11 0" stroke="#333" stroke-width="2" fill="none"/><path d="M48 22 q5-3 11 0" stroke="#333" stroke-width="2" fill="none"/></svg>`,
  },
  {
    id: 'coola',
    name: 'Coola',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><rect x="16" y="20" width="18" height="11" rx="5" fill="#222"/><rect x="46" y="20" width="18" height="11" rx="5" fill="#222"/><rect x="34" y="23" width="12" height="5" rx="2" fill="#111"/><circle cx="25" cy="25" r="4" fill="#1a6ef5" opacity="0.6"/><circle cx="55" cy="25" r="4" fill="#1a6ef5" opacity="0.6"/></svg>`,
  },
];

// ── Mun (Mouth) ─────────────────────────────────────────────────
const MUN = [
  {
    id: 'leende',
    name: 'Leende',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><path d="M28 38 q12 12 24 0" stroke="#c0392b" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'ledsen',
    name: 'Ledsen',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><path d="M28 44 q12-10 24 0" stroke="#c0392b" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'rak',
    name: 'Rak',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><line x1="28" y1="42" x2="52" y2="42" stroke="#c0392b" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'skrikande',
    name: 'Skrikande',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><ellipse cx="40" cy="42" rx="10" ry="8" fill="#222"/><path d="M30 38 q10-8 20 0" stroke="#c0392b" stroke-width="2" fill="none"/></svg>`,
  },
  {
    id: 'tungan-ute',
    name: 'Tungan ute',
    offsetX: 24,
    offsetY: 4,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><path d="M28 38 q12 10 24 0" stroke="#c0392b" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="40" cy="44" rx="7" ry="5" fill="#e91e8c"/></svg>`,
  },
];

// ── Kropp (Body) ─────────────────────────────────────────────────
const KROPP = [
  {
    id: 'rund-mage',
    name: 'Rund mage',
    offsetX: 18,
    offsetY: 56,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92 64"><ellipse cx="46" cy="32" rx="36" ry="30" fill="VAR_SKIN"/></svg>`,
  },
  {
    id: 'atletisk',
    name: 'Atletisk',
    offsetX: 18,
    offsetY: 56,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92 64"><path d="M16 4 L76 4 L80 60 L12 60 Z" rx="4" fill="VAR_SKIN"/><path d="M34 4 L46 28 L58 4" stroke="#ddd" stroke-width="2" fill="none" opacity="0.3"/></svg>`,
  },
  {
    id: 'liten',
    name: 'Liten',
    offsetX: 24,
    offsetY: 60,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 48"><rect x="20" y="4" width="40" height="40" rx="10" fill="VAR_SKIN"/></svg>`,
  },
  {
    id: 'stor',
    name: 'Stor',
    offsetX: 10,
    offsetY: 52,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 72"><ellipse cx="54" cy="38" rx="46" ry="32" fill="VAR_SKIN"/></svg>`,
  },
  {
    id: 'hjalteformad',
    name: 'Hjälteformad',
    offsetX: 16,
    offsetY: 56,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 64"><path d="M10 60 L20 4 L76 4 L86 60 Z" fill="VAR_SKIN"/><path d="M48 4 L10 60 L86 60 Z" fill="VAR_SKIN" opacity="0.2"/></svg>`,
  },
];

// ── Armar (Arms) ─────────────────────────────────────────────────
const ARMAR = [
  {
    id: 'raka',
    name: 'Raka',
    offsetX: 0,
    offsetY: 56,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 48"><rect x="4" y="6" width="22" height="36" rx="10" fill="VAR_SKIN"/><rect x="102" y="6" width="22" height="36" rx="10" fill="VAR_SKIN"/></svg>`,
  },
  {
    id: 'bojda-upp',
    name: 'Böjda upp',
    offsetX: 0,
    offsetY: 56,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64"><path d="M4 60 Q8 30 26 16" stroke="VAR_SKIN" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M124 60 Q120 30 102 16" stroke="VAR_SKIN" stroke-width="18" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'bojda-ner',
    name: 'Böjda ner',
    offsetX: 0,
    offsetY: 56,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64"><path d="M4 10 Q8 40 26 56" stroke="VAR_SKIN" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M124 10 Q120 40 102 56" stroke="VAR_SKIN" stroke-width="18" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'muskulosa',
    name: 'Muskulösa',
    offsetX: 0,
    offsetY: 56,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 56"><ellipse cx="15" cy="20" rx="13" ry="16" fill="VAR_SKIN"/><rect x="4" y="30" width="22" height="22" rx="8" fill="VAR_SKIN"/><ellipse cx="113" cy="20" rx="13" ry="16" fill="VAR_SKIN"/><rect x="102" y="30" width="22" height="22" rx="8" fill="VAR_SKIN"/></svg>`,
  },
];

// ── Ben (Legs) ───────────────────────────────────────────────────
const BEN = [
  {
    id: 'raka',
    name: 'Raka',
    offsetX: 22,
    offsetY: 90,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 38"><rect x="4" y="2" width="28" height="34" rx="10" fill="VAR_SKIN"/><rect x="52" y="2" width="28" height="34" rx="10" fill="VAR_SKIN"/></svg>`,
  },
  {
    id: 'bojda',
    name: 'Böjda',
    offsetX: 22,
    offsetY: 90,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 48"><path d="M6 2 Q10 28 18 44" stroke="VAR_SKIN" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M78 2 Q74 28 66 44" stroke="VAR_SKIN" stroke-width="22" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'runda',
    name: 'Runda',
    offsetX: 22,
    offsetY: 90,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 40"><ellipse cx="18" cy="20" rx="16" ry="18" fill="VAR_SKIN"/><ellipse cx="66" cy="20" rx="16" ry="18" fill="VAR_SKIN"/></svg>`,
  },
  {
    id: 'langa',
    name: 'Långa',
    offsetX: 28,
    offsetY: 86,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 42"><rect x="4" y="2" width="24" height="38" rx="10" fill="VAR_SKIN"/><rect x="44" y="2" width="24" height="38" rx="10" fill="VAR_SKIN"/></svg>`,
  },
];

// ── Accessoar (Accessory) ────────────────────────────────────────
const ACCESSOAR = [
  {
    id: 'ingen',
    name: 'Ingen',
    offsetX: 0,
    offsetY: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"></svg>`,
  },
  {
    id: 'hatt',
    name: 'Hatt',
    offsetX: 28,
    offsetY: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 32"><ellipse cx="36" cy="28" rx="34" ry="8" fill="#222"/><rect x="18" y="4" width="36" height="26" rx="4" fill="#333"/></svg>`,
  },
  {
    id: 'krona',
    name: 'Krona',
    offsetX: 28,
    offsetY: 0,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 32"><polygon points="8,30 8,10 20,20 36,4 52,20 64,10 64,30" fill="#f1c40f"/><rect x="8" y="26" width="56" height="6" rx="2" fill="#e67e22"/><circle cx="8" cy="10" r="4" fill="#e74c3c"/><circle cx="36" cy="4" r="4" fill="#3498db"/><circle cx="64" cy="10" r="4" fill="#e74c3c"/></svg>`,
  },
  {
    id: 'glasogon',
    name: 'Glasögon',
    offsetX: 20,
    offsetY: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 28"><circle cx="22" cy="14" r="12" fill="none" stroke="#222" stroke-width="3"/><circle cx="66" cy="14" r="12" fill="none" stroke="#222" stroke-width="3"/><line x1="34" y1="14" x2="54" y2="14" stroke="#222" stroke-width="3"/><circle cx="22" cy="14" r="9" fill="#74b9ff" opacity="0.3"/><circle cx="66" cy="14" r="9" fill="#74b9ff" opacity="0.3"/></svg>`,
  },
  {
    id: 'cape',
    name: 'Cape',
    offsetX: 8,
    offsetY: 56,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 72"><path d="M16 4 Q56 8 96 4 L106 68 Q56 80 10 68 Z" fill="#c0392b" opacity="0.9"/><path d="M16 4 Q56 14 96 4" stroke="#922b21" stroke-width="3" fill="none"/></svg>`,
  },
  {
    id: 'ryggsack',
    name: 'Ryggsäck',
    offsetX: 80,
    offsetY: 56,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 64"><rect x="4" y="8" width="28" height="50" rx="6" fill="#3498db"/><rect x="10" y="2" width="16" height="10" rx="4" fill="#2980b9"/><rect x="8" y="26" width="20" height="14" rx="3" fill="#2980b9"/></svg>`,
  },
  {
    id: 'svard',
    name: 'Svärd',
    offsetX: 90,
    offsetY: 50,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 72"><rect x="12" y="2" width="4" height="52" rx="2" fill="#bdc3c7"/><polygon points="12,2 16,2 14,0" fill="#ecf0f1"/><rect x="4" y="48" width="20" height="6" rx="3" fill="#f39c12"/><rect x="11" y="54" width="6" height="16" rx="2" fill="#8e6c3f"/></svg>`,
  },
  {
    id: 'trollstav',
    name: 'Trollstav',
    offsetX: 90,
    offsetY: 46,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 76"><rect x="12" y="20" width="4" height="54" rx="2" fill="#8e6c3f"/><polygon points="14,0 18,14 28,14 20,22 24,36 14,28 4,36 8,22 0,14 10,14" fill="#f1c40f"/></svg>`,
  },
];

export const CHARACTER_PARTS = {
  huvud: HUVUD,
  ogon: OGON,
  mun: MUN,
  kropp: KROPP,
  armar: ARMAR,
  ben: BEN,
  accessoar: ACCESSOAR,
};

export const DEFAULT_CHARACTER = {
  huvud: 0,
  ogon: 0,
  mun: 0,
  kropp: 0,
  armar: 0,
  ben: 0,
  accessoar: 0,
  skinColor: '#ffcba4',
  hairColor: '#4a3728',
  eyeColor: '#2d7dd2',
};
