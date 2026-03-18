const WORLD_THEMES = {
  rymden:      { bg: ['#0d0d2b','#1a1a4e'], ground: '#2d1b69', platform: '#6c3bbd', accent: '#e94560', obstacle: '#6c3bbd' },
  djungeln:    { bg: ['#0d2b0d','#1a4e1a'], ground: '#2d4a1b', platform: '#3bb273', accent: '#f18f01', obstacle: '#5d4037' },
  havet:       { bg: ['#0d1b2b','#1a3a4e'], ground: '#1b3a69', platform: '#2d7dd2', accent: '#00d4ff', obstacle: '#0d47a1' },
  staden:      { bg: ['#1a1a1a','#2d2d2d'], ground: '#3d3d3d', platform: '#5c6bc0', accent: '#ff6b6b', obstacle: '#424242' },
  dromvarlden: { bg: ['#2b0d4e','#4e1a6e'], ground: '#6a1b9a', platform: '#e040fb', accent: '#ffeb3b', obstacle: '#7b1fa2' },
  vulkanen:    { bg: ['#2b0d00','#4e1a00'], ground: '#6e2800', platform: '#e64a19', accent: '#ff6d00', obstacle: '#b71c1c' },
  istiden:     { bg: ['#0d1b2b','#1a3a5e'], ground: '#1e3a5f', platform: '#4fc3f7', accent: '#e1f5fe', obstacle: '#0d47a1' },
  skogen:      { bg: ['#0a1f0a','#1a3d1a'], ground: '#2e5d2e', platform: '#558b2f', accent: '#c8e6c9', obstacle: '#33691e' },
};

const CHARACTERS = {
  ninja:      { color: '#e94560', shape: 'ninja' },
  robot:      { color: '#78909c', shape: 'robot' },
  dinosaurie: { color: '#66bb6a', shape: 'dino' },
  enhornin:   { color: '#ce93d8', shape: 'unicorn' },
  rymdalien:  { color: '#80cbc4', shape: 'alien' },
  pirat:      { color: '#8d6e63', shape: 'pirate' },
  trollet:    { color: '#a5d6a7', shape: 'dino' },
  vampyren:   { color: '#7e57c2', shape: 'ninja' },
};

function fuzzyWorld(varld) {
  const key = (varld || '').toLowerCase().replace(/[^\w]/g, '');
  return Object.entries(WORLD_THEMES).find(([k]) => key.includes(k) || k.includes(key))?.[1]
    || WORLD_THEMES.rymden;
}

function fuzzyChar(karaktar) {
  const key = (karaktar || '').toLowerCase().replace(/[^\w]/g, '');
  return Object.entries(CHARACTERS).find(([k]) => key.includes(k) || k.includes(key))?.[1]
    || CHARACTERS.ninja;
}

export function getSpelConfig(answers, title) {
  const ENEMIES = {
    monster:  { color: '#e53935', enabled: true },
    robotar:  { color: '#607d8b', enabled: true },
    fiskar:   { color: '#29b6f6', enabled: true },
    bomber:   { color: '#212121', enabled: true },
    spoken:   { color: '#eeeeee', enabled: true },
    inga:     { color: '#e53935', enabled: false },
  };

  function fuzzyEnemy(fiende) {
    const key = (fiende || '').toLowerCase().replace(/[^\w]/g, '');
    return Object.entries(ENEMIES).find(([k]) => key.includes(k) || k.includes(key))?.[1]
      || ENEMIES.monster;
  }

  const world = fuzzyWorld(answers.varld);
  const char  = fuzzyChar(answers.karaktar);
  const enemy = fuzzyEnemy(answers.fiende);
  const diff  = parseInt(answers.svarighet) || 5;
  const isObby = (answers.speltyp || '').toLowerCase().includes('obby');

  return {
    TITLE:          title || 'Mitt Spel',
    WORLD_BG_TOP:   world.bg[0],
    WORLD_BG_BOT:   world.bg[1],
    GROUND_COLOR:   world.ground,
    PLATFORM_COLOR: world.platform,
    ACCENT:         world.accent,
    PLAYER_COLOR:   char.color,
    PLAYER_SHAPE:   char.shape,
    ENEMY_COLOR:    enemy.color,
    ENEMY_ENABLED:  isObby ? false : enemy.enabled,
    ENEMY_SPEED:    (1 + diff * 0.3).toFixed(1),
    GRAVITY:        (0.4 + diff * 0.025).toFixed(3),
    JUMP_FORCE:     (14 - diff * 0.3).toFixed(1),
    MOVE_SPEED:     (4 + diff * 0.25).toFixed(1),
    LEVEL_COUNT:    Math.min(3 + Math.floor(diff / 4), 5),
    COIN_COLOR:     '#ffd700',
  };
}

export function getRunnerConfig(answers, title) {
  const world = fuzzyWorld(answers.varld);
  const char  = fuzzyChar(answers.karaktar);
  const diff  = parseInt(answers.svarighet) || 5;

  return {
    TITLE:          title || 'Mitt Spel',
    WORLD_BG_TOP:   world.bg[0],
    WORLD_BG_BOT:   world.bg[1],
    GROUND_COLOR:   world.ground,
    OBSTACLE_COLOR: world.obstacle || world.platform,
    ACCENT:         world.accent,
    PLAYER_COLOR:   char.color,
    PLAYER_SHAPE:   char.shape,
    COIN_COLOR:     '#ffd700',
    GRAVITY:        (0.45 + diff * 0.02).toFixed(3),
    JUMP_FORCE:     -(13 - diff * 0.2).toFixed(1),
    INIT_SPEED:     (4 + diff * 0.2).toFixed(1),
    MAX_SPEED:      (10 + diff * 0.5).toFixed(1),
  };
}

export function getMusicConfig(answers, title) {
  const GENRE_THEMES = {
    pop:         { bg: '#1a0020', accent: '#ff69b4', bpm: 120 },
    hiphop:      { bg: '#1a1500', accent: '#ffd700', bpm: 90 },
    rock:        { bg: '#1a0000', accent: '#ff3300', bpm: 140 },
    elektronisk: { bg: '#001a1a', accent: '#00e5ff', bpm: 128 },
    jazz:        { bg: '#0d0010', accent: '#9c27b0', bpm: 100 },
    klassisk:    { bg: '#1a1a10', accent: '#f5f0dc', bpm: 80 },
  };
  const genre = (answers.genre || 'pop').toLowerCase();
  const theme = Object.entries(GENRE_THEMES).find(([k]) => genre.includes(k))?.[1] || GENRE_THEMES.pop;
  const instruments = Array.isArray(answers.instrument) ? answers.instrument : ['piano', 'trummor'];
  const tempo = parseInt(answers.tempo) || 5;
  const tempoScale = 0.4 + (tempo / 10) * 1.6; // 0.4–2.0x
  return {
    TITLE:        title || genre.charAt(0).toUpperCase() + genre.slice(1) + ' Studio',
    BG:           theme.bg,
    ACCENT:       theme.accent,
    BPM:          Math.round(theme.bpm * tempoScale),
    INSTRUMENT_1: instruments[0] || 'piano',
    INSTRUMENT_2: instruments[1] || 'trummor',
    GENRE:        genre,
  };
}

export function getMemoryConfig(answers, title) {
  const MEMORY_THEMES = {
    'Djur🐾':           { bg: ['#1a3a1a','#2a5a2a'], cardBack: '#2d6a2d', cardFront: '#ffffff', matched: '#4caf50', accent: '#8bc34a', theme: 'djur' },
    'Rymden🚀':         { bg: ['#0d0d2b','#1a1a4e'], cardBack: '#1a237e', cardFront: '#e8eaf6', matched: '#3f51b5', accent: '#7986cb', theme: 'rymden' },
    'Mat🍕':            { bg: ['#3e1a00','#6d2f00'], cardBack: '#bf360c', cardFront: '#fff8e1', matched: '#ff7043', accent: '#ffab40', theme: 'mat' },
    'Sport⚽':          { bg: ['#1a1a2e','#16213e'], cardBack: '#0f3460', cardFront: '#e8f4f8', matched: '#e94560', accent: '#0f3460', theme: 'sport' },
    'Dinosaurier🦕':    { bg: ['#1a2e1a','#2e4a2e'], cardBack: '#33691e', cardFront: '#f9fbe7', matched: '#7cb342', accent: '#c5e1a5', theme: 'dinosaurier' },
    'Superhjältar🦸':   { bg: ['#1a0030','#2d0050'], cardBack: '#4a148c', cardFront: '#f3e5f5', matched: '#7b1fa2', accent: '#ce93d8', theme: 'superhjältar' },
    'Pirater☠️':        { bg: ['#1a0f00','#2e1a00'], cardBack: '#5d4037', cardFront: '#fff8e1', matched: '#8d6e63', accent: '#ffd54f', theme: 'pirater' },
    'Framtiden🤖':      { bg: ['#001a2e','#002e4e'], cardBack: '#0d47a1', cardFront: '#e8f4fd', matched: '#1976d2', accent: '#00e5ff', theme: 'framtiden' },
  };

  const svMap = { latt: 1, lagom: 2, svart: 3 };
  const diff = svMap[answers.svarighet] ?? parseInt(answers.svarighet) ?? 2;
  const tema = (answers.tema || '').toLowerCase();
  const themeData = Object.entries(MEMORY_THEMES).find(([k]) =>
    tema.includes(k.replace(/[^\w]/g,'').toLowerCase())
  )?.[1] || MEMORY_THEMES['Djur🐾'];

  const pairs = diff === 1 ? 6 : diff === 3 ? 12 : 8;

  return {
    TITLE:         title || 'Memory',
    BG_TOP:        themeData.bg[0],
    BG_BOT:        themeData.bg[1],
    CARD_BACK:     themeData.cardBack,
    CARD_FRONT:    themeData.cardFront,
    MATCHED_COLOR: themeData.matched,
    ACCENT:        themeData.accent,
    THEME:         themeData.theme,
    PAIRS:         pairs,
  };
}
