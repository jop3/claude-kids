const STORAGE_KEY = 'kompisen_profile';

export function hasProfile() {
  return !!localStorage.getItem(STORAGE_KEY);
}

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || { name: 'Skaparen', avatar: '🎨' };
  } catch {
    return { name: 'Skaparen', avatar: '🎨' };
  }
}

export function saveProfile({ name, avatar }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, avatar }));
}
