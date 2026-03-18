import { SPRITES } from './sprites.js';

const ADJECTIVES = [
  'Rolig', 'Glad', 'Snabb', 'Modig', 'Smart', 'Cool', 'Vild', 'Lugn',
  'Energisk', 'Kreativ', 'Busig', 'Snäll', 'Stark', 'Nyfiken', 'Tokig',
];

const NOUNS = [
  'Äventyraren', 'Hjälten', 'Konstnären', 'Spelaren', 'Byggaren',
  'Drömmaren', 'Forskararen', 'Musikern', 'Läsaren', 'Mästaren',
  'Utforskaren', 'Uppfinnaren', 'Trollkarlen', 'Stjärnan', 'Roboten',
];

const AVATAR_SPRITES_IDS = SPRITES
  .filter(s => s.category === 'Människor' || s.category === 'Monster')
  .map(s => s.id);

export function exportHomepage(sections, theme) {
  const bg = theme['--hem-bg'] || '#1a1a2e';
  const accent = theme['--hem-accent'] || '#6c3bbd';
  const text = theme['--hem-text'] || '#ffffff';

  const sectionsHtml = sections.map(sec => renderSection(sec)).join('\n');

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Min Hemsida</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${bg};
      color: ${text};
      font-family: 'Segoe UI', system-ui, sans-serif;
      min-height: 100vh;
      padding: 24px 16px;
    }
    .page {
      max-width: 700px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .header {
      text-align: center;
      padding: 32px 16px 16px;
      background: linear-gradient(135deg, ${accent}33, ${accent}11);
      border-radius: 24px;
      border: 1px solid ${accent}44;
    }
    .header h1 {
      font-size: 2.2rem;
      font-weight: 900;
      color: ${text};
      margin-bottom: 8px;
    }
    .header .subtitle {
      color: ${accent};
      font-size: 1rem;
      font-weight: 600;
    }
    .section {
      background: rgba(255,255,255,0.05);
      border-radius: 20px;
      padding: 24px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .section-title {
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: ${accent};
      margin-bottom: 16px;
    }
    .avatar-name {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .avatar-img {
      width: 96px;
      height: 96px;
      background: linear-gradient(135deg, ${accent}, #2d7dd2);
      border-radius: 20px;
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-img img { width: 80px; height: 80px; }
    .name-display {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .name-word {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 1.2rem;
      font-weight: 900;
      color: #fff;
    }
    .adj-word { background: linear-gradient(135deg, #6c3bbd, #a855f7); }
    .noun-word { background: linear-gradient(135deg, #2d7dd2, #06b6d4); }
    .drawing-area {
      text-align: center;
    }
    .drawing-area img {
      max-width: 100%;
      border-radius: 12px;
      border: 2px solid rgba(255,255,255,0.15);
    }
    .sprite-display {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sprite-display img {
      width: 120px;
      height: 120px;
    }
    .favorites-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .fav-chip {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 999px;
      padding: 8px 18px;
      font-size: 1.4rem;
    }
    .musik-card {
      background: linear-gradient(135deg, ${accent}44, #2d7dd233);
      border: 1px solid ${accent}66;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .musik-play-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }
    .musik-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: ${text};
    }
    .musik-label {
      font-size: 0.8rem;
      color: ${accent};
      margin-top: 4px;
    }
    .footer {
      text-align: center;
      padding: 16px;
      color: rgba(255,255,255,0.3);
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>Min Hemsida 🏠</h1>
      <div class="subtitle">Skapad med ClaudeKids</div>
    </div>
    ${sectionsHtml}
    <div class="footer">Gjord med ❤️ i ClaudeKids</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'min-hemsida.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function renderSection(sec) {
  const { type, config = {} } = sec;

  if (type === 'om-mig') {
    const spriteIdx = config.spriteIdx ?? 0;
    const adjIdx = config.adjIdx ?? 0;
    const nounIdx = config.nounIdx ?? 0;
    const allAvatars = SPRITES.filter(s => s.category === 'Människor' || s.category === 'Monster');
    const sprite = allAvatars[spriteIdx % allAvatars.length];
    const adj = ADJECTIVES[adjIdx % ADJECTIVES.length];
    const noun = NOUNS[nounIdx % NOUNS.length];
    return `
    <div class="section">
      <div class="section-title">Om Mig</div>
      <div class="avatar-name">
        <div class="avatar-img">
          <img src="${sprite.dataUrl}" alt="${sprite.name}" />
        </div>
        <div class="name-display">
          <span class="name-word adj-word">${adj}</span>
          <span class="name-word noun-word">${noun}</span>
        </div>
      </div>
    </div>`;
  }

  if (type === 'foto-rit') {
    const mode = config.mode || 'rita';
    if (mode === 'rita' && config.canvasData) {
      return `
    <div class="section">
      <div class="section-title">Min Teckning</div>
      <div class="drawing-area">
        <img src="${config.canvasData}" alt="Min teckning" />
      </div>
    </div>`;
    }
    if (mode === 'bild' && config.sprite) {
      const sp = SPRITES.find(s => s.id === config.sprite);
      if (sp) {
        return `
    <div class="section">
      <div class="section-title">Min Bild</div>
      <div class="sprite-display">
        <img src="${sp.dataUrl}" alt="${sp.name}" />
      </div>
    </div>`;
      }
    }
    return `
    <div class="section">
      <div class="section-title">Foto / Ritning</div>
      <div style="text-align:center;color:rgba(255,255,255,0.4);padding:20px;">Ingen bild vald</div>
    </div>`;
  }

  if (type === 'favoriter') {
    const picks = config.picks || [];
    if (picks.length === 0) {
      return `
    <div class="section">
      <div class="section-title">Mina Favoriter</div>
      <div style="color:rgba(255,255,255,0.4);font-size:0.9rem;">Inga favoriter valda</div>
    </div>`;
    }
    const chips = picks.map(e => `<div class="fav-chip">${e}</div>`).join('');
    return `
    <div class="section">
      <div class="section-title">Mina Favoriter</div>
      <div class="favorites-chips">${chips}</div>
    </div>`;
  }

  if (type === 'musik-player') {
    const name = config.projektNamn;
    if (!name) {
      return `
    <div class="section">
      <div class="section-title">Musik</div>
      <div style="color:rgba(255,255,255,0.4);font-size:0.9rem;">Inget musikprojekt valt</div>
    </div>`;
    }
    return `
    <div class="section">
      <div class="section-title">Min Musik</div>
      <div class="musik-card">
        <div class="musik-play-icon">🎵</div>
        <div>
          <div class="musik-name">${name}</div>
          <div class="musik-label">Lyssna på mitt musikprojekt</div>
        </div>
      </div>
    </div>`;
  }

  return '';
}
