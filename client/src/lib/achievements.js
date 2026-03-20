const STORAGE_KEY = 'kompisen_achievements';

export const ACHIEVEMENTS = [
  { id: 'forsta_skapelsen', emoji: '🎨', title: 'Forsta skapelsen', desc: 'Spara din forsta skapelse' },
  { id: 'samlare',          emoji: '🌟', title: 'Samlare',          desc: 'Spara 5 skapelser' },
  { id: 'mastare',          emoji: '🏆', title: 'Mastare',          desc: 'Spara 10 skapelser' },
  { id: 'spelmakare',       emoji: '🎮', title: 'Spelmakare',       desc: 'Skapa ett spel' },
  { id: 'musikproducent',   emoji: '🎵', title: 'Musikproducent',   desc: 'Skapa ett musikprojekt' },
  { id: 'regissor',         emoji: '🎬', title: 'Regissor',         desc: 'Skapa en film' },
  { id: 'forfattare',       emoji: '📖', title: 'Forfattare',       desc: 'Skapa en berattelse' },
  { id: 'konstnaren',       emoji: '🖼️',  title: 'Konstnaren',      desc: 'Skapa pixel art' },
  { id: 'larare',           emoji: '🧠', title: 'Larare',           desc: 'Skapa ett quiz' },
  { id: 'streakmastare',    emoji: '🔥', title: 'Streakmastare',    desc: 'Fa 5 i rad i Larospel' },
  { id: 'snabb',            emoji: '🏅', title: 'Snabb',            desc: 'Klara Memory under 60 sekunder' },
  { id: 'allroundare',      emoji: '🌈', title: 'Allroundare',      desc: 'Skapa en av varje kategori' },
];

export function getUnlocked() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUnlocked(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function unlock(id) {
  const unlocked = getUnlocked();
  if (unlocked.includes(id)) return false;
  saveUnlocked([...unlocked, id]);
  return true; // newly unlocked
}

// Returns array of newly unlocked achievement objects
export function checkAchievements(event) {
  const newlyUnlocked = [];

  function maybeUnlock(id) {
    if (unlock(id)) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) newlyUnlocked.push(ach);
    }
  }

  if (event.type === 'creation') {
    const { category, totalSaved } = event;

    // Category-specific
    const catMap = {
      spel:       'spelmakare',
      musik:      'musikproducent',
      filmstudio: 'regissor',
      berattelse: 'forfattare',
      pixelart:   'konstnaren',
      quiz:       'larare',
    };
    if (catMap[category]) maybeUnlock(catMap[category]);

    // Count-based
    if (totalSaved >= 1)  maybeUnlock('forsta_skapelsen');
    if (totalSaved >= 5)  maybeUnlock('samlare');
    if (totalSaved >= 10) maybeUnlock('mastare');

    // Allroundare: check if all 13 categories have been created
    if (event.savedCategories) {
      const ALL_CATS = ['musik','spel','ritprogram','animation','hemsida','filmstudio',
                        'kortspel','bradspel','larospel','rostlab','berattelse','pixelart','quiz'];
      const covered = ALL_CATS.every(c => event.savedCategories.includes(c));
      if (covered) maybeUnlock('allroundare');
    }
  }

  if (event.type === 'streak' && event.count >= 5) {
    maybeUnlock('streakmastare');
  }

  if (event.type === 'memory_finish' && event.seconds < 60) {
    maybeUnlock('snabb');
  }

  return newlyUnlocked;
}
