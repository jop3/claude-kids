const WORLD_THEMES = {
  'Rymden🚀':         { bg: ['#0d0d2b','#1a1a4e'], ground: '#2d1b69', platform: '#6c3bbd', accent: '#e94560', obstacle: '#6c3bbd' },
  'Djungeln🌿':       { bg: ['#0d2b0d','#1a4e1a'], ground: '#2d4a1b', platform: '#3bb273', accent: '#f18f01', obstacle: '#5d4037' },
  'Havet🌊':          { bg: ['#0d1b2b','#1a3a4e'], ground: '#1b3a69', platform: '#2d7dd2', accent: '#00d4ff', obstacle: '#0d47a1' },
  'Staden🏙️':         { bg: ['#1a1a1a','#2d2d2d'], ground: '#3d3d3d', platform: '#5c6bc0', accent: '#ff6b6b', obstacle: '#424242' },
  'Drömvärlden✨':    { bg: ['#2b0d4e','#4e1a6e'], ground: '#6a1b9a', platform: '#e040fb', accent: '#ffeb3b', obstacle: '#7b1fa2' },
  'Vulkanen🌋':       { bg: ['#2b0d00','#4e1a00'], ground: '#6e2800', platform: '#e64a19', accent: '#ff6d00', obstacle: '#b71c1c' },
};

const CHARACTERS = {
  'Ninja🥷':          { color: '#e94560', shape: 'ninja' },
  'Robot🤖':          { color: '#78909c', shape: 'robot' },
  'Dinosaurie🦕':     { color: '#66bb6a', shape: 'dino' },
  'Enhörning🦄':      { color: '#ce93d8', shape: 'unicorn' },
  'Rymdalien👽':      { color: '#80cbc4', shape: 'alien' },
  'Pirat🏴‍☠️':          { color: '#8d6e63', shape: 'pirate' },
};

export function getSpelConfig(answers, title) {
  const ENEMIES = {
    'Monster\uD83D\uDC79':  { color: '#e53935', enabled: true },
    'Robotar\uD83E\uDD16':  { color: '#607d8b', enabled: true },
    'Fiskar\uD83D\uDC1F':   { color: '#29b6f6', enabled: true },
    'Bomber\uD83D\uDCA3':   { color: '#212121', enabled: true },
    'Sp\u00F6ken\uD83D\uDC7B': { color: '#eeeeee', enabled: true },
    'Inga\u274C':            { color: '#e53935', enabled: false },
  };

  const world = WORLD_THEMES[answers.varld] || WORLD_THEMES['Rymden🚀'];
  const char  = CHARACTERS[answers.karaktar] || CHARACTERS['Ninja🥷'];
  const enemy = ENEMIES[answers.fiende] || ENEMIES['Monster\uD83D\uDC79'];
  const diff  = parseInt(answers.svarighet) || 5;

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
    ENEMY_ENABLED:  enemy.enabled,
    ENEMY_SPEED:    (1 + diff * 0.3).toFixed(1),
    GRAVITY:        (0.4 + diff * 0.025).toFixed(3),
    JUMP_FORCE:     (14 - diff * 0.3).toFixed(1),
    MOVE_SPEED:     (4 + diff * 0.25).toFixed(1),
    LEVEL_COUNT:    Math.min(3 + Math.floor(diff / 4), 5),
    COIN_COLOR:     '#ffd700',
  };
}

export function getRunnerConfig(answers, title) {
  const world = WORLD_THEMES[answers.varld] || WORLD_THEMES['Rymden🚀'];
  const char  = CHARACTERS[answers.karaktar] || CHARACTERS['Ninja🥷'];
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

export function getMemoryConfig(answers, title) {
  const MEMORY_THEMES = {
    'Djur🐾':           { bg: ['#1a3a1a','#2a5a2a'], cardBack: '#2d6a2d', cardFront: '#ffffff', matched: '#4caf50', accent: '#8bc34a', theme: 'djur' },
    'Rymden🚀':         { bg: ['#0d0d2b','#1a1a4e'], cardBack: '#1a237e', cardFront: '#e8eaf6', matched: '#3f51b5', accent: '#7986cb', theme: 'rymden' },
    'Mat🍕':            { bg: ['#3e1a00','#6d2f00'], cardBack: '#bf360c', cardFront: '#fff8e1', matched: '#ff7043', accent: '#ffab40', theme: 'mat' },
    'Sport⚽':          { bg: ['#1a1a2e','#16213e'], cardBack: '#0f3460', cardFront: '#e8f4f8', matched: '#e94560', accent: '#0f3460', theme: 'sport' },
    'Dinosaurier🦕':    { bg: ['#1a2e1a','#2e4a2e'], cardBack: '#33691e', cardFront: '#f9fbe7', matched: '#7cb342', accent: '#c5e1a5', theme: 'dinosaurier' },
    'Superhjältar🦸':   { bg: ['#1a0030','#2d0050'], cardBack: '#4a148c', cardFront: '#f3e5f5', matched: '#7b1fa2', accent: '#ce93d8', theme: 'superhjältar' },
  };

  const diff = parseInt(answers.svarighet) || 2;
  const tema = answers.tema || '';
  const themeData = Object.entries(MEMORY_THEMES).find(([k]) => tema.includes(k.replace(/[^\w]/g,'')))
    ?.[1] || MEMORY_THEMES['Djur🐾'];

  const pairs = diff === 1 ? 6 : diff === 2 ? 8 : 12;

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
