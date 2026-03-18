export function getSpelConfig(answers, title) {
  const WORLD_THEMES = {
    'Rymden\uD83D\uDE80':       { bg: ['#0d0d2b','#1a1a4e'], ground: '#2d1b69', platform: '#6c3bbd', accent: '#e94560' },
    'Djungeln\uD83C\uDF3F':     { bg: ['#0d2b0d','#1a4e1a'], ground: '#2d4a1b', platform: '#3bb273', accent: '#f18f01' },
    'Havet\uD83C\uDF0A':        { bg: ['#0d1b2b','#1a3a4e'], ground: '#1b3a69', platform: '#2d7dd2', accent: '#00d4ff' },
    'Staden\uD83C\uDFD9\uFE0F': { bg: ['#1a1a1a','#2d2d2d'], ground: '#3d3d3d', platform: '#5c6bc0', accent: '#ff6b6b' },
    'Dr\u00F6mv\u00E4rlden\u2728': { bg: ['#2b0d4e','#4e1a6e'], ground: '#6a1b9a', platform: '#e040fb', accent: '#ffeb3b' },
    'Vulkanen\uD83C\uDF0B':     { bg: ['#2b0d00','#4e1a00'], ground: '#6e2800', platform: '#e64a19', accent: '#ff6d00' },
  };

  const CHARACTERS = {
    'Ninja\uD83E\uDD77':        { color: '#e94560', shape: 'ninja' },
    'Robot\uD83E\uDD16':        { color: '#78909c', shape: 'robot' },
    'Dinosaurie\uD83E\uDD95':   { color: '#66bb6a', shape: 'dino' },
    'Enh\u00F6rning\uD83E\uDD84': { color: '#ce93d8', shape: 'unicorn' },
    'Rymdalien\uD83D\uDC7D':    { color: '#80cbc4', shape: 'alien' },
    'Pirat\uD83C\uDFF4\u200D\u2620\uFE0F': { color: '#8d6e63', shape: 'pirate' },
  };

  const ENEMIES = {
    'Monster\uD83D\uDC79':  { color: '#e53935', enabled: true },
    'Robotar\uD83E\uDD16':  { color: '#607d8b', enabled: true },
    'Fiskar\uD83D\uDC1F':   { color: '#29b6f6', enabled: true },
    'Bomber\uD83D\uDCA3':   { color: '#212121', enabled: true },
    'Sp\u00F6ken\uD83D\uDC7B': { color: '#eeeeee', enabled: true },
    'Inga\u274C':            { color: '#e53935', enabled: false },
  };

  const world = WORLD_THEMES[answers.varld] || WORLD_THEMES['Rymden\uD83D\uDE80'];
  const char  = CHARACTERS[answers.karaktar] || CHARACTERS['Ninja\uD83E\uDD77'];
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
