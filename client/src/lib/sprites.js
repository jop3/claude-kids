// Sprite library — 50+ inline SVG sprites organized by category

function svgToDataUrl(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const RAW_SPRITES = [
  // ── Människor ──────────────────────────────────────────────────
  {
    id: 'pojke', name: 'Pojke', category: 'Människor',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="16" r="12" fill="#fcd5a0"/>
      <rect x="20" y="28" width="24" height="20" rx="4" fill="#4dabf7"/>
      <rect x="20" y="48" width="10" height="12" rx="3" fill="#343a40"/>
      <rect x="34" y="48" width="10" height="12" rx="3" fill="#343a40"/>
      <rect x="10" y="28" width="10" height="16" rx="4" fill="#4dabf7"/>
      <rect x="44" y="28" width="10" height="16" rx="4" fill="#4dabf7"/>
      <circle cx="27" cy="14" r="2" fill="#333"/>
      <circle cx="37" cy="14" r="2" fill="#333"/>
      <path d="M28 20 q4 4 8 0" stroke="#c77" fill="none" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'flicka', name: 'Flicka', category: 'Människor',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="16" r="12" fill="#fcd5a0"/>
      <path d="M20 28 q12-6 24 0 l4 20 q-12 6-28 0 Z" fill="#e64980"/>
      <ellipse cx="32" cy="48" rx="16" ry="8" fill="#e64980"/>
      <rect x="10" y="28" width="10" height="16" rx="4" fill="#e64980"/>
      <rect x="44" y="28" width="10" height="16" rx="4" fill="#e64980"/>
      <path d="M20 8 q12-10 24 0" stroke="#c0392b" stroke-width="3" fill="none"/>
      <circle cx="27" cy="14" r="2" fill="#333"/>
      <circle cx="37" cy="14" r="2" fill="#333"/>
      <path d="M28 20 q4 4 8 0" stroke="#c77" fill="none" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'superhjalte', name: 'Superhjälte', category: 'Människor',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="14" r="11" fill="#fcd5a0"/>
      <rect x="21" y="25" width="22" height="20" rx="3" fill="#c0392b"/>
      <path d="M21 25 l-10 20 8 4 z" fill="#c0392b"/>
      <path d="M43 25 l10 20 -8 4 z" fill="#c0392b"/>
      <rect x="22" y="45" width="9" height="14" rx="3" fill="#2c3e50"/>
      <rect x="33" y="45" width="9" height="14" rx="3" fill="#2c3e50"/>
      <path d="M26 25 l6 6 6-6" stroke="#f1c40f" stroke-width="2" fill="none"/>
      <circle cx="27" cy="12" r="2" fill="#333"/>
      <circle cx="37" cy="12" r="2" fill="#333"/>
    </svg>`,
  },
  {
    id: 'pirat', name: 'Pirat', category: 'Människor',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="18" r="12" fill="#fcd5a0"/>
      <rect x="20" y="5" width="24" height="10" rx="2" fill="#222"/>
      <rect x="18" y="5" width="28" height="4" rx="2" fill="#333"/>
      <rect x="27" y="15" width="10" height="5" fill="#222"/>
      <rect x="20" y="30" width="24" height="20" rx="4" fill="#e67e22"/>
      <rect x="20" y="50" width="10" height="12" rx="3" fill="#2c3e50"/>
      <rect x="34" y="50" width="10" height="12" rx="3" fill="#2c3e50"/>
      <rect x="10" y="30" width="10" height="16" rx="4" fill="#e67e22"/>
      <rect x="44" y="30" width="10" height="16" rx="4" fill="#e67e22"/>
      <rect x="22" y="13" width="10" height="7" rx="2" fill="#222" opacity="0.8"/>
      <circle cx="37" cy="18" r="2.5" fill="#333"/>
      <path d="M28 23 q4 3 8 0" stroke="#c77" fill="none" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'astronaut', name: 'Astronaut', category: 'Människor',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="16" rx="14" ry="15" fill="#e9ecef"/>
      <circle cx="32" cy="15" r="9" fill="#a8d8ea"/>
      <circle cx="32" cy="15" r="7" fill="#74b9ff"/>
      <rect x="20" y="30" width="24" height="22" rx="6" fill="#e9ecef"/>
      <rect x="20" y="52" width="10" height="10" rx="3" fill="#adb5bd"/>
      <rect x="34" y="52" width="10" height="10" rx="3" fill="#adb5bd"/>
      <rect x="8" y="30" width="12" height="14" rx="5" fill="#e9ecef"/>
      <rect x="44" y="30" width="12" height="14" rx="5" fill="#e9ecef"/>
      <rect x="26" y="34" width="12" height="6" rx="2" fill="#fab005"/>
    </svg>`,
  },
  {
    id: 'ninja', name: 'Ninja', category: 'Människor',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="16" r="12" fill="#333"/>
      <rect x="20" y="10" width="24" height="12" rx="2" fill="#222"/>
      <rect x="22" y="13" width="20" height="6" fill="#c0392b"/>
      <circle cx="28" cy="15" r="2" fill="#f1f1f1"/>
      <circle cx="36" cy="15" r="2" fill="#f1f1f1"/>
      <rect x="21" y="28" width="22" height="22" rx="3" fill="#222"/>
      <rect x="20" y="50" width="10" height="12" rx="3" fill="#111"/>
      <rect x="34" y="50" width="10" height="12" rx="3" fill="#111"/>
      <rect x="9" y="28" width="11" height="16" rx="4" fill="#222"/>
      <rect x="44" y="28" width="11" height="16" rx="4" fill="#222"/>
      <line x1="50" y1="26" x2="58" y2="10" stroke="#adb5bd" stroke-width="2"/>
    </svg>`,
  },

  // ── Djur ──────────────────────────────────────────────────────
  {
    id: 'katt', name: 'Katt', category: 'Djur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="36" r="18" fill="#f4a261"/>
      <polygon points="14,22 22,8 26,22" fill="#f4a261"/>
      <polygon points="38,22 42,8 50,22" fill="#f4a261"/>
      <circle cx="26" cy="34" r="3" fill="#333"/>
      <circle cx="38" cy="34" r="3" fill="#333"/>
      <ellipse cx="32" cy="40" rx="4" ry="3" fill="#e76f51"/>
      <line x1="20" y1="38" x2="10" y2="36" stroke="#333" stroke-width="1.5"/>
      <line x1="20" y1="40" x2="10" y2="40" stroke="#333" stroke-width="1.5"/>
      <line x1="20" y1="42" x2="10" y2="44" stroke="#333" stroke-width="1.5"/>
      <line x1="44" y1="38" x2="54" y2="36" stroke="#333" stroke-width="1.5"/>
      <line x1="44" y1="40" x2="54" y2="40" stroke="#333" stroke-width="1.5"/>
      <line x1="44" y1="42" x2="54" y2="44" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'hund', name: 'Hund', category: 'Djur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="38" rx="18" ry="15" fill="#a0522d"/>
      <circle cx="32" cy="24" r="13" fill="#a0522d"/>
      <ellipse cx="18" cy="22" rx="7" ry="10" fill="#8b4513" transform="rotate(-15,18,22)"/>
      <ellipse cx="46" cy="22" rx="7" ry="10" fill="#8b4513" transform="rotate(15,46,22)"/>
      <circle cx="27" cy="22" r="3" fill="#333"/>
      <circle cx="37" cy="22" r="3" fill="#333"/>
      <ellipse cx="32" cy="29" rx="6" ry="4" fill="#cd853f"/>
      <ellipse cx="32" cy="31" rx="4" ry="2.5" fill="#8b4513"/>
    </svg>`,
  },
  {
    id: 'fagel', name: 'Fågel', category: 'Djur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="36" rx="14" ry="12" fill="#f7dc6f"/>
      <circle cx="32" cy="22" r="10" fill="#f7dc6f"/>
      <circle cx="27" cy="20" r="2.5" fill="#333"/>
      <polygon points="30,25 38,25 34,30" fill="#f39c12"/>
      <ellipse cx="18" cy="34" rx="10" ry="6" fill="#f7dc6f" transform="rotate(-30,18,34)"/>
      <ellipse cx="46" cy="34" rx="10" ry="6" fill="#f0b27a" transform="rotate(30,46,34)"/>
      <line x1="26" y1="48" x2="22" y2="56" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/>
      <line x1="38" y1="48" x2="42" y2="56" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'fisk', name: 'Fisk', category: 'Djur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="30" cy="32" rx="20" ry="12" fill="#3498db"/>
      <polygon points="52,22 64,32 52,42" fill="#2980b9"/>
      <circle cx="20" cy="28" r="3" fill="#fff"/>
      <circle cx="19" cy="28" r="1.5" fill="#333"/>
      <path d="M22 32 q6 4 12 0" stroke="#1a5276" stroke-width="1.5" fill="none"/>
      <ellipse cx="34" cy="26" rx="5" ry="3" fill="#5dade2" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'orm', name: 'Orm', category: 'Djur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M10 48 q10-8 20 0 q10 8 20-4 q4-4 6-12" stroke="#27ae60" stroke-width="10" fill="none" stroke-linecap="round"/>
      <circle cx="38" cy="18" r="9" fill="#27ae60"/>
      <circle cx="34" cy="15" r="2" fill="#333"/>
      <circle cx="42" cy="15" r="2" fill="#333"/>
      <path d="M34 22 l2 4 2-4 2 4" stroke="#e74c3c" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'lejon', name: 'Lejon', category: 'Djur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="30" r="20" fill="#e67e22" opacity="0.6"/>
      <circle cx="32" cy="30" r="14" fill="#f39c12"/>
      <circle cx="27" cy="27" r="2.5" fill="#333"/>
      <circle cx="37" cy="27" r="2.5" fill="#333"/>
      <ellipse cx="32" cy="34" rx="5" ry="3" fill="#e67e22"/>
      <path d="M26 38 q6 5 12 0" stroke="#c0392b" stroke-width="2" fill="none"/>
      <line x1="18" y1="32" x2="10" y2="30" stroke="#333" stroke-width="1.5"/>
      <line x1="18" y1="35" x2="10" y2="35" stroke="#333" stroke-width="1.5"/>
      <line x1="46" y1="32" x2="54" y2="30" stroke="#333" stroke-width="1.5"/>
      <line x1="46" y1="35" x2="54" y2="35" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'elefant', name: 'Elefant', category: 'Djur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="34" cy="36" rx="20" ry="16" fill="#95a5a6"/>
      <circle cx="28" cy="22" r="14" fill="#95a5a6"/>
      <ellipse cx="14" cy="22" rx="8" ry="12" fill="#7f8c8d"/>
      <ellipse cx="42" cy="22" rx="8" ry="12" fill="#7f8c8d"/>
      <path d="M24 34 q-4 10-8 16 q4 2 6 0 q2-4 4-8" fill="#7f8c8d"/>
      <circle cx="24" cy="20" r="2.5" fill="#333"/>
      <circle cx="32" cy="20" r="2.5" fill="#333"/>
    </svg>`,
  },
  {
    id: 'pingvin', name: 'Pingvin', category: 'Djur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="38" rx="14" ry="18" fill="#2c3e50"/>
      <ellipse cx="32" cy="40" rx="9" ry="12" fill="#ecf0f1"/>
      <circle cx="32" cy="20" r="10" fill="#2c3e50"/>
      <circle cx="32" cy="20" r="7" fill="#ecf0f1"/>
      <circle cx="28" cy="18" r="2" fill="#333"/>
      <circle cx="34" cy="18" r="2" fill="#333"/>
      <ellipse cx="32" cy="23" rx="3" ry="2" fill="#f39c12"/>
      <ellipse cx="16" cy="38" rx="7" ry="4" fill="#2c3e50" transform="rotate(-20,16,38)"/>
      <ellipse cx="48" cy="38" rx="7" ry="4" fill="#2c3e50" transform="rotate(20,48,38)"/>
      <ellipse cx="26" cy="56" rx="5" ry="3" fill="#f39c12"/>
      <ellipse cx="38" cy="56" rx="5" ry="3" fill="#f39c12"/>
    </svg>`,
  },
  {
    id: 'uggla', name: 'Uggla', category: 'Djur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="38" rx="16" ry="18" fill="#8e6c3f"/>
      <circle cx="24" cy="28" r="9" fill="#c8a96e"/>
      <circle cx="40" cy="28" r="9" fill="#c8a96e"/>
      <circle cx="24" cy="28" r="5" fill="#1a1a2e"/>
      <circle cx="40" cy="28" r="5" fill="#1a1a2e"/>
      <circle cx="25" cy="27" r="2" fill="#fff"/>
      <circle cx="41" cy="27" r="2" fill="#fff"/>
      <polygon points="28,36 36,36 32,42" fill="#f39c12"/>
      <polygon points="18,16 24,22 30,16" fill="#8e6c3f"/>
      <polygon points="34,16 40,22 46,16" fill="#8e6c3f"/>
    </svg>`,
  },
  {
    id: 'fjäril', name: 'Fjäril', category: 'Djur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="20" cy="24" rx="16" ry="12" fill="#9b59b6" opacity="0.85" transform="rotate(-20,20,24)"/>
      <ellipse cx="44" cy="24" rx="16" ry="12" fill="#9b59b6" opacity="0.85" transform="rotate(20,44,24)"/>
      <ellipse cx="20" cy="42" rx="12" ry="9" fill="#8e44ad" opacity="0.85" transform="rotate(20,20,42)"/>
      <ellipse cx="44" cy="42" rx="12" ry="9" fill="#8e44ad" opacity="0.85" transform="rotate(-20,44,42)"/>
      <ellipse cx="32" cy="32" rx="4" ry="14" fill="#2c3e50"/>
      <circle cx="30" cy="16" r="2" fill="#2c3e50"/>
      <circle cx="34" cy="16" r="2" fill="#2c3e50"/>
      <circle cx="20" cy="24" r="4" fill="#f7dc6f" opacity="0.6"/>
      <circle cx="44" cy="24" r="4" fill="#f7dc6f" opacity="0.6"/>
    </svg>`,
  },

  // ── Monster ──────────────────────────────────────────────────
  {
    id: 'drake', name: 'Drake', category: 'Monster',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="38" rx="18" ry="14" fill="#27ae60"/>
      <circle cx="32" cy="22" r="12" fill="#27ae60"/>
      <polygon points="22,12 18,2 26,10" fill="#27ae60"/>
      <polygon points="42,12 46,2 38,10" fill="#27ae60"/>
      <polygon points="14,30 2,22 14,38" fill="#27ae60"/>
      <polygon points="50,30 62,22 50,38" fill="#27ae60"/>
      <circle cx="27" cy="20" r="3" fill="#e74c3c"/>
      <circle cx="37" cy="20" r="3" fill="#e74c3c"/>
      <path d="M26 28 l4-4 4 4" stroke="#f39c12" stroke-width="2" fill="none"/>
      <path d="M30 52 q2 8 8 10" stroke="#27ae60" stroke-width="6" fill="none" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'zombie', name: 'Zombie', category: 'Monster',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="16" r="12" fill="#8bc34a"/>
      <rect x="20" y="28" width="24" height="20" rx="3" fill="#78909c"/>
      <rect x="20" y="48" width="10" height="14" rx="3" fill="#546e7a"/>
      <rect x="34" y="48" width="10" height="14" rx="3" fill="#546e7a"/>
      <rect x="8" y="26" width="12" height="8" rx="2" fill="#78909c"/>
      <rect x="44" y="28" width="12" height="16" rx="4" fill="#78909c"/>
      <circle cx="26" cy="13" r="3" fill="#e8f5e9"/>
      <circle cx="38" cy="13" r="3" fill="#e8f5e9"/>
      <circle cx="26" cy="13" r="1.5" fill="#c62828"/>
      <circle cx="38" cy="13" r="1.5" fill="#c62828"/>
      <path d="M26 22 l2 2 2-2 2 2 2-2" stroke="#555" stroke-width="1.5" fill="none"/>
    </svg>`,
  },
  {
    id: 'alien', name: 'Alien', category: 'Monster',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="18" rx="16" ry="14" fill="#2ecc71"/>
      <rect x="22" y="30" width="20" height="20" rx="5" fill="#27ae60"/>
      <rect x="22" y="50" width="8" height="12" rx="3" fill="#1e8449"/>
      <rect x="34" y="50" width="8" height="12" rx="3" fill="#1e8449"/>
      <rect x="10" y="30" width="12" height="12" rx="4" fill="#27ae60"/>
      <rect x="42" y="30" width="12" height="12" rx="4" fill="#27ae60"/>
      <ellipse cx="24" cy="16" rx="6" ry="4" fill="#1a252f"/>
      <ellipse cx="40" cy="16" rx="6" ry="4" fill="#1a252f"/>
      <ellipse cx="24" cy="16" rx="4" ry="2.5" fill="#7ed6df"/>
      <ellipse cx="40" cy="16" rx="4" ry="2.5" fill="#7ed6df"/>
      <path d="M27 25 q5 3 10 0" stroke="#1e8449" stroke-width="2" fill="none"/>
      <line x1="20" y1="6" x2="16" y2="0" stroke="#2ecc71" stroke-width="2"/>
      <line x1="44" y1="6" x2="48" y2="0" stroke="#2ecc71" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'robot', name: 'Robot', category: 'Monster',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="18" y="10" width="28" height="22" rx="4" fill="#78909c"/>
      <rect x="22" y="14" width="8" height="6" rx="2" fill="#29b6f6"/>
      <rect x="34" y="14" width="8" height="6" rx="2" fill="#29b6f6"/>
      <rect x="26" y="22" width="12" height="4" rx="2" fill="#f44336"/>
      <rect x="28" y="4" width="8" height="8" rx="2" fill="#78909c"/>
      <rect x="30" y="2" width="4" height="4" rx="1" fill="#f39c12"/>
      <rect x="16" y="32" width="32" height="20" rx="4" fill="#607d8b"/>
      <rect x="16" y="52" width="12" height="10" rx="3" fill="#455a64"/>
      <rect x="36" y="52" width="12" height="10" rx="3" fill="#455a64"/>
      <rect x="4" y="32" width="12" height="16" rx="4" fill="#78909c"/>
      <rect x="48" y="32" width="12" height="16" rx="4" fill="#78909c"/>
    </svg>`,
  },
  {
    id: 'vampyr', name: 'Vampyr', category: 'Monster',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="18" r="12" fill="#e8d5b7"/>
      <path d="M20 8 l-4-8 8 6 8-8 8 8 8-6-4 8 z" fill="#1a1a2e"/>
      <rect x="18" y="30" width="28" height="22" rx="4" fill="#1a1a2e"/>
      <path d="M18 30 l-10 8 2 14 8-8 z" fill="#1a1a2e"/>
      <path d="M46 30 l10 8-2 14-8-8 z" fill="#1a1a2e"/>
      <rect x="20" y="52" width="10" height="12" rx="3" fill="#111"/>
      <rect x="34" y="52" width="10" height="12" rx="3" fill="#111"/>
      <circle cx="26" cy="16" r="2.5" fill="#c0392b"/>
      <circle cx="38" cy="16" r="2.5" fill="#c0392b"/>
      <polygon points="28,22 32,26 36,22" fill="#fff"/>
      <polygon points="30,22 32,28 34,22" fill="#fff"/>
    </svg>`,
  },
  {
    id: 'monster', name: 'Monster', category: 'Monster',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="36" rx="22" ry="20" fill="#8e44ad"/>
      <circle cx="32" cy="18" r="14" fill="#9b59b6"/>
      <circle cx="22" cy="14" r="5" fill="#9b59b6"/>
      <circle cx="42" cy="14" r="5" fill="#9b59b6"/>
      <circle cx="12" cy="22" r="5" fill="#9b59b6"/>
      <circle cx="52" cy="22" r="5" fill="#9b59b6"/>
      <ellipse cx="24" cy="16" rx="5" ry="3" fill="#f39c12"/>
      <ellipse cx="40" cy="16" rx="5" ry="3" fill="#f39c12"/>
      <ellipse cx="24" cy="16" rx="3" ry="2" fill="#333"/>
      <ellipse cx="40" cy="16" rx="3" ry="2" fill="#333"/>
      <path d="M18 30 l4-4 4 4 4-4 4 4 4-4 4 4" stroke="#f1c40f" stroke-width="2" fill="none"/>
    </svg>`,
  },

  // ── Fordon ──────────────────────────────────────────────────
  {
    id: 'bil', name: 'Bil', category: 'Fordon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="4" y="34" width="56" height="18" rx="4" fill="#e74c3c"/>
      <path d="M12 34 l8-16 24 0 8 16 z" fill="#c0392b"/>
      <rect x="16" y="20" width="12" height="12" rx="2" fill="#85c1e9"/>
      <rect x="30" y="20" width="12" height="12" rx="2" fill="#85c1e9"/>
      <circle cx="16" cy="52" r="8" fill="#2c3e50"/>
      <circle cx="16" cy="52" r="4" fill="#7f8c8d"/>
      <circle cx="48" cy="52" r="8" fill="#2c3e50"/>
      <circle cx="48" cy="52" r="4" fill="#7f8c8d"/>
    </svg>`,
  },
  {
    id: 'raket', name: 'Raket', category: 'Fordon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 4 l10 30 -10 4-10-4 z" fill="#e74c3c"/>
      <rect x="22" y="30" width="20" height="22" rx="3" fill="#ecf0f1"/>
      <path d="M22 52 l-10 8 10-6 z" fill="#e67e22"/>
      <path d="M42 52 l10 8-10-6 z" fill="#e67e22"/>
      <ellipse cx="32" cy="34" rx="6" ry="6" fill="#85c1e9"/>
      <rect x="28" y="52" width="8" height="6" fill="#e74c3c"/>
      <ellipse cx="32" cy="60" rx="8" ry="4" fill="#f39c12" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'bat', name: 'Båt', category: 'Fordon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M6 38 q26 18 52 0 l-6 12 q-20 8-40 0 z" fill="#e74c3c"/>
      <rect x="28" y="14" width="4" height="28" fill="#8e6c3f"/>
      <polygon points="32 14 52 26 32 26" fill="#ecf0f1"/>
      <path d="M4 40 q8 4 12-2 q8 10 16 0 q8 10 16 0 q8 6 12 2" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.4"/>
    </svg>`,
  },
  {
    id: 'cykel', name: 'Cykel', category: 'Fordon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="16" cy="42" r="14" fill="none" stroke="#2c3e50" stroke-width="4"/>
      <circle cx="48" cy="42" r="14" fill="none" stroke="#2c3e50" stroke-width="4"/>
      <circle cx="16" cy="42" r="3" fill="#2c3e50"/>
      <circle cx="48" cy="42" r="3" fill="#2c3e50"/>
      <line x1="16" y1="42" x2="32" y2="20" stroke="#e74c3c" stroke-width="3"/>
      <line x1="32" y1="20" x2="48" y2="42" stroke="#e74c3c" stroke-width="3"/>
      <line x1="16" y1="42" x2="48" y2="42" stroke="#e74c3c" stroke-width="3"/>
      <rect x="28" y="14" width="12" height="4" rx="2" fill="#7f8c8d"/>
      <rect x="36" y="14" width="4" height="8" fill="#7f8c8d"/>
    </svg>`,
  },
  {
    id: 'flygplan', name: 'Flygplan', category: 'Fordon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 8 l6 20 H22 z" fill="#3498db"/>
      <rect x="24" y="26" width="16" height="24" rx="4" fill="#2980b9"/>
      <path d="M24 36 l-20 12 v-6 l20-10 z" fill="#3498db"/>
      <path d="M40 36 l20 12 v-6 l-20-10 z" fill="#3498db"/>
      <path d="M28 50 l-10 10 v-4 l10-8 z" fill="#2471a3"/>
      <path d="M36 50 l10 10 v-4 l-10-8 z" fill="#2471a3"/>
      <ellipse cx="32" cy="30" rx="5" ry="4" fill="#85c1e9"/>
    </svg>`,
  },
  {
    id: 'tag', name: 'Tåg', category: 'Fordon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="8" y="18" width="48" height="32" rx="6" fill="#e74c3c"/>
      <rect x="12" y="22" width="16" height="12" rx="2" fill="#85c1e9"/>
      <rect x="32" y="22" width="16" height="12" rx="2" fill="#85c1e9"/>
      <rect x="8" y="14" width="48" height="8" rx="3" fill="#c0392b"/>
      <path d="M14 8 l4-4 32 0 4 4 z" fill="#c0392b"/>
      <circle cx="18" cy="52" r="6" fill="#2c3e50"/>
      <circle cx="46" cy="52" r="6" fill="#2c3e50"/>
      <rect x="4" y="58" width="56" height="4" rx="2" fill="#7f8c8d"/>
    </svg>`,
  },

  // ── Mat ──────────────────────────────────────────────────────
  {
    id: 'pizza', name: 'Pizza', category: 'Mat',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <polygon points="32,4 60,56 4,56" fill="#f0b27a"/>
      <polygon points="32,8 57,54 7,54" fill="#f1948a"/>
      <polygon points="32,12 54,52 10,52" fill="#f4d03f" opacity="0.5"/>
      <circle cx="25" cy="40" r="4" fill="#922b21"/>
      <circle cx="40" cy="36" r="4" fill="#922b21"/>
      <circle cx="32" cy="48" r="3" fill="#922b21"/>
      <circle cx="28" cy="28" r="3" fill="#1e8449"/>
      <circle cx="42" cy="46" r="2.5" fill="#1e8449"/>
    </svg>`,
  },
  {
    id: 'glass', name: 'Glass', category: 'Mat',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="22" rx="16" ry="14" fill="#f8c8d4"/>
      <ellipse cx="24" cy="18" rx="10" ry="10" fill="#f1948a"/>
      <ellipse cx="40" cy="18" rx="10" ry="10" fill="#82e0aa"/>
      <ellipse cx="32" cy="18" rx="10" ry="10" fill="#f9e79f"/>
      <polygon points="24,34 40,34 32,58" fill="#f0b27a"/>
      <rect x="28" y="54" width="8" height="4" rx="2" fill="#e59866"/>
    </svg>`,
  },
  {
    id: 'tartta', name: 'Tårta', category: 'Mat',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="44" rx="24" ry="10" fill="#f1948a"/>
      <rect x="8" y="30" width="48" height="18" rx="4" fill="#f9e79f"/>
      <ellipse cx="32" cy="30" rx="24" ry="10" fill="#f1948a"/>
      <path d="M8 30 q24-12 48 0" fill="#fadbd8"/>
      <rect x="20" y="14" width="8" height="18" fill="#f9e79f"/>
      <rect x="36" y="14" width="8" height="18" fill="#f9e79f"/>
      <rect x="18" y="10" width="4" height="6" rx="2" fill="#e74c3c"/>
      <rect x="34" y="10" width="4" height="6" rx="2" fill="#e74c3c"/>
      <ellipse cx="20" cy="10" rx="3" ry="5" fill="#f39c12"/>
      <ellipse cx="36" cy="10" rx="3" ry="5" fill="#f39c12"/>
    </svg>`,
  },
  {
    id: 'apple', name: 'Äpple', category: 'Mat',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="36" r="22" fill="#e74c3c"/>
      <ellipse cx="22" cy="28" rx="10" ry="14" fill="#c0392b" opacity="0.3"/>
      <rect x="30" y="8" width="4" height="10" rx="2" fill="#8e6c3f"/>
      <path d="M34 12 q8-10 16-4" stroke="#27ae60" stroke-width="2.5" fill="none"/>
      <ellipse cx="38" cy="8" rx="5" ry="3" fill="#27ae60"/>
    </svg>`,
  },
  {
    id: 'hamburgare', name: 'Hamburgare', category: 'Mat',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="20" rx="22" ry="12" fill="#f39c12"/>
      <ellipse cx="32" cy="16" rx="20" ry="8" fill="#e67e22"/>
      <rect x="10" y="28" width="44" height="8" rx="2" fill="#922b21"/>
      <rect x="10" y="34" width="44" height="6" rx="2" fill="#f7dc6f"/>
      <rect x="10" y="38" width="44" height="6" rx="2" fill="#58d68d"/>
      <ellipse cx="32" cy="48" rx="22" ry="10" fill="#f0b27a"/>
      <ellipse cx="32" cy="46" rx="20" ry="8" fill="#e59866"/>
    </svg>`,
  },
  {
    id: 'stjarna', name: 'Stjärna', category: 'Mat',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <polygon points="32,4 39,24 60,24 44,37 50,58 32,45 14,58 20,37 4,24 25,24" fill="#f1c40f"/>
      <polygon points="32,12 37,26 52,26 40,35 45,50 32,41 19,50 24,35 12,26 27,26" fill="#f7dc6f"/>
    </svg>`,
  },

  // ── Natur ──────────────────────────────────────────────────
  {
    id: 'trad', name: 'Träd', category: 'Natur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="28" y="42" width="8" height="18" rx="2" fill="#8e6c3f"/>
      <polygon points="32,4 54,44 10,44" fill="#27ae60"/>
      <polygon points="32,14 50,44 14,44" fill="#2ecc71"/>
    </svg>`,
  },
  {
    id: 'blomma', name: 'Blomma', category: 'Natur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="30" y="30" width="4" height="30" rx="2" fill="#27ae60"/>
      <ellipse cx="32" cy="24" rx="10" ry="12" fill="#e74c3c"/>
      <ellipse cx="20" cy="28" rx="10" ry="8" fill="#e74c3c" transform="rotate(-45,20,28)"/>
      <ellipse cx="44" cy="28" rx="10" ry="8" fill="#e74c3c" transform="rotate(45,44,28)"/>
      <ellipse cx="20" cy="16" rx="8" ry="10" fill="#e74c3c" transform="rotate(30,20,16)"/>
      <ellipse cx="44" cy="16" rx="8" ry="10" fill="#e74c3c" transform="rotate(-30,44,16)"/>
      <circle cx="32" cy="22" r="8" fill="#f1c40f"/>
    </svg>`,
  },
  {
    id: 'moln', name: 'Moln', category: 'Natur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="34" rx="24" ry="16" fill="#ecf0f1"/>
      <circle cx="20" cy="30" r="14" fill="#ecf0f1"/>
      <circle cx="44" cy="28" r="16" fill="#ecf0f1"/>
      <circle cx="32" cy="24" r="14" fill="#bdc3c7"/>
    </svg>`,
  },
  {
    id: 'sol', name: 'Sol', category: 'Natur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="14" fill="#f1c40f"/>
      <line x1="32" y1="4" x2="32" y2="14" stroke="#f39c12" stroke-width="4" stroke-linecap="round"/>
      <line x1="32" y1="50" x2="32" y2="60" stroke="#f39c12" stroke-width="4" stroke-linecap="round"/>
      <line x1="4" y1="32" x2="14" y2="32" stroke="#f39c12" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="32" x2="60" y2="32" stroke="#f39c12" stroke-width="4" stroke-linecap="round"/>
      <line x1="11" y1="11" x2="18" y2="18" stroke="#f39c12" stroke-width="4" stroke-linecap="round"/>
      <line x1="46" y1="46" x2="53" y2="53" stroke="#f39c12" stroke-width="4" stroke-linecap="round"/>
      <line x1="53" y1="11" x2="46" y2="18" stroke="#f39c12" stroke-width="4" stroke-linecap="round"/>
      <line x1="18" y1="46" x2="11" y2="53" stroke="#f39c12" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'mangubbe', name: 'Mångubbe', category: 'Natur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M48 8 a24 24 0 1 0 0 48 a20 20 0 1 1 0-48 z" fill="#f1c40f"/>
      <circle cx="26" cy="26" r="5" fill="#e2b007"/>
      <ellipse cx="36" cy="38" rx="8" ry="5" fill="#e2b007"/>
      <circle cx="42" cy="22" r="3" fill="#e2b007"/>
    </svg>`,
  },
  {
    id: 'vulkan', name: 'Vulkan', category: 'Natur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <polygon points="32,6 58,58 6,58" fill="#7f8c8d"/>
      <polygon points="32,10 54,58 10,58" fill="#95a5a6"/>
      <ellipse cx="32" cy="12" rx="8" ry="6" fill="#e74c3c"/>
      <path d="M28 6 q-4-6-8-4" stroke="#f39c12" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M36 6 q4-6 8-4" stroke="#f39c12" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M32 4 q0-6 0-0" stroke="#e74c3c" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M16 48 q16 8 32 0" stroke="#c0392b" stroke-width="3" fill="none"/>
    </svg>`,
  },

  // ── Föremål ──────────────────────────────────────────────────
  {
    id: 'hjarta', name: 'Hjärta', category: 'Föremål',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 54 L8 30 a14 14 0 0 1 24-10 a14 14 0 0 1 24 10 z" fill="#e74c3c"/>
      <path d="M32 46 L12 26 a10 10 0 0 1 16-8" fill="#ec7063" opacity="0.4"/>
    </svg>`,
  },
  {
    id: 'blixt', name: 'Blixt', category: 'Föremål',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <polygon points="38,4 18,34 30,34 26,60 46,30 34,30" fill="#f1c40f"/>
      <polygon points="36,8 20,34 30,34 27,52 44,28 34,28" fill="#f7dc6f"/>
    </svg>`,
  },
  {
    id: 'krona', name: 'Krona', category: 'Föremål',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <polygon points="8,48 8,22 20,36 32,10 44,36 56,22 56,48" fill="#f1c40f"/>
      <rect x="8" y="48" width="48" height="10" rx="3" fill="#f39c12"/>
      <circle cx="8" cy="22" r="4" fill="#e74c3c"/>
      <circle cx="32" cy="10" r="4" fill="#3498db"/>
      <circle cx="56" cy="22" r="4" fill="#e74c3c"/>
      <circle cx="20" cy="52" r="3" fill="#e74c3c"/>
      <circle cx="32" cy="52" r="3" fill="#27ae60"/>
      <circle cx="44" cy="52" r="3" fill="#3498db"/>
    </svg>`,
  },
  {
    id: 'nyckel', name: 'Nyckel', category: 'Föremål',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="20" cy="22" r="14" fill="none" stroke="#f1c40f" stroke-width="6"/>
      <rect x="30" y="20" width="28" height="6" rx="3" fill="#f1c40f"/>
      <rect x="46" y="26" width="6" height="8" rx="2" fill="#f1c40f"/>
      <rect x="54" y="26" width="6" height="8" rx="2" fill="#f1c40f"/>
      <circle cx="20" cy="22" r="5" fill="#e2b007"/>
    </svg>`,
  },
  {
    id: 'skattekista', name: 'Skattekista', category: 'Föremål',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="6" y="32" width="52" height="28" rx="4" fill="#8e6c3f"/>
      <rect x="6" y="26" width="52" height="14" rx="4" fill="#a0522d"/>
      <rect x="6" y="26" width="52" height="6" rx="3" fill="#6b3a2a"/>
      <rect x="24" y="30" width="16" height="16" rx="3" fill="#7f6000"/>
      <circle cx="32" cy="38" r="4" fill="#f1c40f"/>
      <rect x="10" y="40" width="8" height="4" rx="2" fill="#f1c40f"/>
      <rect x="46" y="40" width="8" height="4" rx="2" fill="#f1c40f"/>
    </svg>`,
  },
  {
    id: 'svard', name: 'Svärd', category: 'Föremål',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="30" y="4" width="4" height="44" rx="2" fill="#bdc3c7"/>
      <polygon points="30,4 34,4 32,2" fill="#ecf0f1"/>
      <rect x="18" y="42" width="28" height="6" rx="3" fill="#f39c12"/>
      <rect x="30" y="48" width="4" height="14" rx="2" fill="#8e6c3f"/>
      <circle cx="32" cy="56" r="4" fill="#a0522d"/>
    </svg>`,
  },

  // ── Byggnader ──────────────────────────────────────────────────
  {
    id: 'hus', name: 'Hus', category: 'Byggnader',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <polygon points="4,34 32,6 60,34" fill="#e74c3c"/>
      <rect x="10" y="32" width="44" height="28" fill="#f0b27a"/>
      <rect x="24" y="40" width="16" height="20" rx="2" fill="#8e6c3f"/>
      <rect x="12" y="36" width="12" height="10" rx="2" fill="#85c1e9"/>
      <rect x="40" y="36" width="12" height="10" rx="2" fill="#85c1e9"/>
    </svg>`,
  },
  {
    id: 'slott', name: 'Slott', category: 'Byggnader',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="14" y="24" width="36" height="36" fill="#bdc3c7"/>
      <rect x="6" y="18" width="12" height="44" fill="#95a5a6"/>
      <rect x="46" y="18" width="12" height="44" fill="#95a5a6"/>
      <rect x="6" y="8" width="4" height="12" fill="#95a5a6"/>
      <rect x="14" y="8" width="4" height="12" fill="#95a5a6"/>
      <rect x="46" y="8" width="4" height="12" fill="#95a5a6"/>
      <rect x="54" y="8" width="4" height="12" fill="#95a5a6"/>
      <rect x="24" y="42" width="16" height="20" rx="2" fill="#7f8c8d"/>
      <rect x="22" y="28" width="10" height="8" rx="2" fill="#85c1e9"/>
      <rect x="32" y="28" width="10" height="8" rx="2" fill="#85c1e9"/>
      <polygon points="32,14 50,24 14,24" fill="#c0392b"/>
    </svg>`,
  },
  {
    id: 'torn', name: 'Torn', category: 'Byggnader',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="20" y="20" width="24" height="42" fill="#bdc3c7"/>
      <polygon points="32,4 48,20 16,20" fill="#c0392b"/>
      <rect x="28" y="42" width="8" height="20" rx="2" fill="#7f8c8d"/>
      <rect x="24" y="28" width="8" height="8" rx="2" fill="#85c1e9"/>
      <rect x="32" y="28" width="8" height="8" rx="2" fill="#85c1e9"/>
      <rect x="28" y="12" width="8" height="2" fill="#f1c40f"/>
    </svg>`,
  },
  {
    id: 'stuga', name: 'Stuga', category: 'Byggnader',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <polygon points="4,36 32,8 60,36" fill="#8e6c3f"/>
      <rect x="10" y="34" width="44" height="26" fill="#f0b27a"/>
      <rect x="24" y="40" width="16" height="20" rx="2" fill="#8e6c3f"/>
      <rect x="12" y="38" width="10" height="10" rx="2" fill="#85c1e9"/>
      <rect x="42" y="38" width="10" height="10" rx="2" fill="#85c1e9"/>
      <rect x="26" y="6" width="4" height="12" fill="#e74c3c"/>
      <ellipse cx="28" cy="6" rx="3" ry="5" fill="#bdc3c7" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'rymdstation', name: 'Rymdstation', category: 'Byggnader',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="32" rx="14" ry="10" fill="#bdc3c7"/>
      <rect x="4" y="28" width="24" height="8" rx="4" fill="#7f8c8d"/>
      <rect x="36" y="28" width="24" height="8" rx="4" fill="#7f8c8d"/>
      <rect x="4" y="24" width="12" height="16" rx="2" fill="#85c1e9"/>
      <rect x="48" y="24" width="12" height="16" rx="2" fill="#85c1e9"/>
      <circle cx="32" cy="32" r="6" fill="#ecf0f1"/>
      <circle cx="32" cy="32" r="3" fill="#74b9ff"/>
      <rect x="28" y="16" width="8" height="16" rx="2" fill="#bdc3c7"/>
      <rect x="28" y="44" width="8" height="8" rx="2" fill="#bdc3c7"/>
    </svg>`,
  },
  {
    id: 'talt', name: 'Tält', category: 'Byggnader',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <polygon points="32,6 62,58 2,58" fill="#e74c3c"/>
      <polygon points="32,6 48,58 16,58" fill="#c0392b"/>
      <rect x="24" y="38" width="16" height="20" rx="2" fill="#922b21"/>
      <line x1="32" y1="6" x2="32" y2="2" stroke="#7f8c8d" stroke-width="2"/>
      <line x1="32" y1="2" x2="28" y2="58" stroke="#adb5bd" stroke-width="1.5" opacity="0.4"/>
      <line x1="32" y1="2" x2="36" y2="58" stroke="#adb5bd" stroke-width="1.5" opacity="0.4"/>
    </svg>`,
  },
];

export const SPRITES = RAW_SPRITES.map(s => ({
  ...s,
  dataUrl: svgToDataUrl(s.svg),
}));

export const SPRITE_CATEGORIES = [...new Set(RAW_SPRITES.map(s => s.category))];
