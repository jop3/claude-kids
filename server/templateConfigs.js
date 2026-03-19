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

export function getHemsidaConfig(answers, title) {
  const AVATAR_EMOJIS = {
    ninja: '🥷', robot: '🤖', katt: '🐱', dinosaurie: '🦕',
    'superhjälte': '🦸', magiker: '🧙', haxan: '🧙‍♀️', bjorn: '🐻',
    enhornin: '🦄', pirat: '🏴‍☠️', alien: '👽', sjojungfru: '🧜',
  };
  const FAV_EMOJIS = {
    musik: '🎵', sport: '⚽', djur: '🐾', mat: '🍕',
    spel: '🎮', bocker: '📚', film: '🎬', dans: '💃',
  };
  const FAV_LABELS = {
    musik: 'Musik', sport: 'Sport', djur: 'Djur', mat: 'Mat',
    spel: 'Spel', bocker: 'Böcker', film: 'Film', dans: 'Dans',
  };
  const STIL_THEMES = {
    cool: {
      primary:'#00e5ff', bg:'#0d0d1a', text:'#e0e0e0',
      cardBg:'rgba(255,255,255,0.06)', border:'1px solid rgba(0,229,255,0.2)',
      headerBg:'linear-gradient(135deg,#0d0d2b,#1a1a3e)',
      favCardBg:'rgba(0,229,255,0.08)', inputBg:'rgba(255,255,255,0.05)',
      radius:'16px', font:'monospace',
      titleShadow:'0 0 20px #00e5ff88', subtitleStyle:'normal',
      badgeText:'#000', primaryShadow:'#00e5ff66', headerExtra:'display:none',
      styleCss:'h1{letter-spacing:0.1em;text-transform:uppercase}',
    },
    sot: {
      primary:'#ff69b4', bg:'#fff5f8', text:'#4a2040',
      cardBg:'#fff', border:'2px solid #ffb6d966',
      headerBg:'linear-gradient(135deg,#ffe4f0,#ffd6ee)',
      favCardBg:'#fff0f5', inputBg:'#fff',
      radius:'24px', font:'"Comic Sans MS", cursive',
      titleShadow:'0 2px 8px #ff69b444', subtitleStyle:'italic',
      badgeText:'#fff', primaryShadow:'#ff69b466', headerExtra:'display:none',
      styleCss:'body{background:linear-gradient(180deg,#fff5f8,#ffedf5)}',
    },
    spooky: {
      primary:'#b000ff', bg:'#080810', text:'#cccccc',
      cardBg:'rgba(176,0,255,0.07)', border:'1px solid rgba(176,0,255,0.25)',
      headerBg:'linear-gradient(135deg,#0d0010,#1a0030)',
      favCardBg:'rgba(176,0,255,0.1)', inputBg:'rgba(255,255,255,0.04)',
      radius:'8px', font:'Georgia, serif',
      titleShadow:'0 0 24px #b000ff99', subtitleStyle:'italic',
      badgeText:'#fff', primaryShadow:'#b000ff66', headerExtra:'display:none',
      styleCss:'h1{letter-spacing:0.06em} .section{box-shadow:0 0 20px rgba(176,0,255,0.1)}',
    },
    futuristisk: {
      primary:'#00ff88', bg:'#020c14', text:'#a0ffcc',
      cardBg:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.2)',
      headerBg:'linear-gradient(135deg,#020c14,#041a24)',
      favCardBg:'rgba(0,255,136,0.08)', inputBg:'rgba(0,255,136,0.04)',
      radius:'4px', font:'"Courier New", monospace',
      titleShadow:'0 0 16px #00ff8888', subtitleStyle:'normal',
      badgeText:'#000', primaryShadow:'#00ff8866', headerExtra:'display:none',
      styleCss:'body{background-image:repeating-linear-gradient(0deg,rgba(0,255,136,0.03) 0px,transparent 1px,transparent 24px)} h1{text-transform:uppercase;letter-spacing:0.12em}',
    },
    naturlig: {
      primary:'#4caf50', bg:'#f5f0e8', text:'#2e3a28',
      cardBg:'#fff', border:'1px solid #a5d6a766',
      headerBg:'linear-gradient(135deg,#e8f5e9,#dcedc8)',
      favCardBg:'#f1f8e9', inputBg:'#fff',
      radius:'20px', font:'Georgia, serif',
      titleShadow:'0 2px 8px rgba(76,175,80,0.3)', subtitleStyle:'italic',
      badgeText:'#fff', primaryShadow:'#4caf5066', headerExtra:'display:none',
      styleCss:'',
    },
    fargglad: {
      primary:'#ff4081', bg:'#fff', text:'#222',
      cardBg:'#fff', border:'2px solid #ff408133',
      headerBg:'linear-gradient(90deg,#ff4081,#7c4dff,#00b0ff,#00e676)',
      favCardBg:'#f8f8ff', inputBg:'#fff',
      radius:'18px', font:'Arial Rounded MT Bold, Arial, sans-serif',
      titleShadow:'0 2px 12px rgba(0,0,0,0.2)', subtitleStyle:'normal',
      badgeText:'#fff', primaryShadow:'#ff408166', headerExtra:'display:none',
      styleCss:'h1{color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.3)} .subtitle{color:rgba(255,255,255,0.85)}',
    },
  };

  const favorites = Array.isArray(answers.favoriter) ? answers.favoriter : ['musik', 'spel', 'djur'];
  const stilKey = (answers.stil || 'cool').toLowerCase();
  const theme = STIL_THEMES[stilKey] || STIL_THEMES.cool;
  const avatarKey = (answers.avatar || 'robot').toLowerCase();
  const avatarEmoji = Object.entries(AVATAR_EMOJIS).find(([k]) => avatarKey.includes(k))?.[1] || '🤖';
  const fav1 = favorites[0] || 'musik';
  const fav2 = favorites[1] || 'spel';
  const fav3 = favorites[2] || 'djur';
  return {
    TITLE:          title || 'Min Hemsida',
    AVATAR_EMOJI:   avatarEmoji,
    PRIMARY:        theme.primary,
    BG:             theme.bg,
    TEXT_COLOR:     theme.text,
    CARD_BG:        theme.cardBg,
    BORDER_STYLE:   theme.border,
    RADIUS:         theme.radius,
    FONT:           theme.font,
    HEADER_BG:      theme.headerBg,
    HEADER_EXTRA:   theme.headerExtra,
    FAV_CARD_BG:    theme.favCardBg,
    INPUT_BG:       theme.inputBg,
    TITLE_SHADOW:   theme.titleShadow,
    SUBTITLE_STYLE: theme.subtitleStyle,
    BADGE_TEXT:     theme.badgeText,
    PRIMARY_SHADOW: theme.primaryShadow,
    STYLE_CSS:      theme.styleCss,
    FAV_1_EMOJI:    FAV_EMOJIS[fav1] || '🎵',
    FAV_1_LABEL:    FAV_LABELS[fav1] || fav1,
    FAV_2_EMOJI:    FAV_EMOJIS[fav2] || '🎮',
    FAV_2_LABEL:    FAV_LABELS[fav2] || fav2,
    FAV_3_EMOJI:    FAV_EMOJIS[fav3] || '🐾',
    FAV_3_LABEL:    FAV_LABELS[fav3] || fav3,
  };
}

export function getAnimationConfig(answers, title) {
  const CHAR_EMOJIS = {
    ninja: '🥷', robot: '🤖', katt: '🐱', dinosaurie: '🦕', enhornin: '🦄', pirat: '🏴‍☠️',
    haxan: '🧙‍♀️', bjorn: '🐻', pingvin: '🐧', rymdalien: '👽', delfin: '🐬',
  };
  const BG_WORLDS = {
    rymden:      ['#0d0d2b','#1a1a4e'],
    djungeln:    ['#0a2e0a','#1a5e1a'],
    havet:       ['#001a3e','#0047ab'],
    staden:      ['#1a1a2e','#2d2d4e'],
    dromvarlden: ['#1a0a2e','#3d1a5e'],
    vulkanen:    ['#2e0a00','#5e1a00'],
  };
  const EFFEKT_ACCENTS = {
    konfetti: '#ff6b6b', stjarnor: '#ffd700', eld: '#ff6600',
    bubblor: '#4ecdc4', regnbage: '#a29bfe', blixt: '#00e5ff',
    sno: '#aaddff', hjartan: '#ff69b4', musik: '#ffd700', magi: '#ea80fc',
  };
  const char = (answers.karaktar || 'ninja').toLowerCase();
  const world = (answers.bakgrund || 'rymden').toLowerCase();
  const effekt = (answers.effekter || 'stjarnor').toLowerCase();
  const charKey = Object.keys(CHAR_EMOJIS).find(k => char.includes(k)) || 'ninja';
  const worldKey = Object.keys(BG_WORLDS).find(k => world.includes(k) || k.includes(world)) || 'rymden';
  const bg = BG_WORLDS[worldKey] || BG_WORLDS.rymden;
  const effektKey = Object.keys(EFFEKT_ACCENTS).find(k => effekt.includes(k)) || 'stjarnor';
  return {
    TITLE:      title || (answers.karaktar || 'Ninja') + ' Animation',
    CHAR_EMOJI: CHAR_EMOJIS[charKey] || '🥷',
    CHAR_NAME:  (answers.karaktar || 'Ninja').charAt(0).toUpperCase() + (answers.karaktar || 'Ninja').slice(1),
    BG_TOP:     bg[0],
    BG_BOT:     bg[1],
    RORELSE:    (answers.rorelse || 'hoppa').toLowerCase(),
    EFFEKT:     effektKey,
    ACCENT:     EFFEKT_ACCENTS[effektKey] || '#ffd700',
    WORLD:      worldKey,
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
  const tempoScale = 0.4 + (tempo / 10) * 1.6;
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

export function getBradspelConfig(answers, title) {
  const TEMA_META = {
    banspel:  { accent: '#4a90d9', bg: ['#0a1a2e','#1a2e4a'] },
    pirater:  { accent: '#c49a6c', bg: ['#1a0f00','#2e1a05'] },
    rymd:     { accent: '#7986cb', bg: ['#00001a','#0d0d2e'] },
    djungel:  { accent: '#43a047', bg: ['#0a1a0a','#1a2e1a'] },
    saga:     { accent: '#ce93d8', bg: ['#0d001a','#1a0035'] },
  };
  const tema = (answers.tema || 'banspel').toLowerCase();
  const temaKey = Object.keys(TEMA_META).find(k => tema.includes(k)) || 'banspel';
  const meta = TEMA_META[temaKey];
  const playersRaw = answers.spelare || '2';
  const players = parseInt(playersRaw) || 2;
  return {
    TITLE:   title || 'Brädspel',
    TEMA:    temaKey,
    PLAYERS: players,
    ACCENT:  meta.accent,
    BG_TOP:  meta.bg[0],
    BG_BOT:  meta.bg[1],
  };
}

export function getLarospelConfig(answers, title) {
  const AMNE_META = {
    matte:    { icon: '➕', accent: '#e91e63', bg: '#0d0a1a' },
    svenska:  { icon: '📖', accent: '#2196f3', bg: '#0a0d1a' },
    geografi: { icon: '🌍', accent: '#4caf50', bg: '#0a1a0a' },
    natur:    { icon: '🌱', accent: '#8bc34a', bg: '#0a1a08' },
    historia: { icon: '🏛️', accent: '#ff9800', bg: '#1a0d00' },
    engelska: { icon: '🇬🇧', accent: '#00bcd4', bg: '#001a1a' },
  };
  const amneKey = Object.keys(AMNE_META).find(k => (answers.amne || '').toLowerCase().includes(k)) || 'matte';
  const meta = AMNE_META[amneKey];
  const svMap = { latt: 'latt', lätt: 'latt', lagom: 'lagom', svart: 'svart', svårt: 'svart' };
  const svarighet = svMap[(answers.svarighet || 'lagom').toLowerCase()] || 'lagom';
  return {
    TITLE:        title || amneKey.charAt(0).toUpperCase() + amneKey.slice(1) + ' Quiz',
    AMNE:         amneKey.charAt(0).toUpperCase() + amneKey.slice(1),
    SVARIGHET:    svarighet,
    SUBJECT_ICON: meta.icon,
    ACCENT:       meta.accent,
    BG:           meta.bg,
  };
}

export function getFilmstudioConfig(answers, title) {
  const GENRE_THEMES = {
    aventyr:     { color: '#ffd700', bg: ['#0d1a00','#1a3300'], ambient: 'epic' },
    komedi:      { color: '#ff9800', bg: ['#1a1000','#2e1a00'], ambient: 'bouncy' },
    skrack:      { color: '#880000', bg: ['#000','#1a0000'], ambient: 'tense' },
    scifi:       { color: '#00e5ff', bg: ['#00001a','#001a2e'], ambient: 'synth' },
    saga:        { color: '#ab47bc', bg: ['#0d001a','#1a002e'], ambient: 'magical' },
    superhjälte: { color: '#1565c0', bg: ['#00001a','#001a3e'], ambient: 'epic' },
  };
  const genre = (answers.genre || 'aventyr').toLowerCase();
  const theme = Object.entries(GENRE_THEMES).find(([k]) => genre.includes(k))?.[1] || GENRE_THEMES.aventyr;
  const ending = answers.slut || 'glad';
  return {
    TITLE:        title || 'Min Film',
    GENRE:        genre,
    GENRE_COLOR:  theme.color,
    HERO:         answers.hjalte || 'ninja',
    VILLAIN:      answers.skurk || 'drake',
    MILJO:        answers.miljo || 'skog',
    ENDING_STYLE: ending,
    BG_TOP:       theme.bg[0],
    BG_BOT:       theme.bg[1],
    AMBIENT:      theme.ambient,
  };
}

export function getRostlabConfig(answers, title) {
  const EFFEKT_ACCENTS = {
    robot:    '#00e5ff',
    chipmunk: '#ffeb3b',
    monster:  '#f44336',
    echo:     '#ce93d8',
    reverb:   '#80cbc4',
    pitchupp: '#ff9800',
    none:     '#ffffff',
  };
  const effekt = answers.effekt || 'robot';
  const accent = EFFEKT_ACCENTS[effekt] || '#00e5ff';
  const loopRaw = answers.loop || '';
  const loopMode = loopRaw === 'loopa' || loopRaw.includes('loopa') ? 'ja' : 'nej';
  const layerRaw = answers.lager || '1';
  const layers = parseInt(layerRaw) || 1;
  return {
    TITLE:          title || 'Rostlab',
    DEFAULT_EFFEKT: effekt,
    LOOP_MODE:      loopMode,
    LAYERS:         layers,
    ACCENT:         accent,
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
    'Pirater\u2620\uFE0F':  { bg: ['#1a0f00','#2e1a00'], cardBack: '#5d4037', cardFront: '#fff8e1', matched: '#8d6e63', accent: '#ffd54f', theme: 'pirater' },
    'Framtiden\uD83E\uDD16': { bg: ['#001a2e','#002e4e'], cardBack: '#0d47a1', cardFront: '#e8f4fd', matched: '#1976d2', accent: '#00e5ff', theme: 'framtiden' },
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
