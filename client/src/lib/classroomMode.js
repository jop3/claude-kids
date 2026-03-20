const KEY = 'kompisen_classroom_mode';

export function isClassroomMode() {
  return localStorage.getItem(KEY) === 'true';
}

export function setClassroomMode(val) {
  localStorage.setItem(KEY, val ? 'true' : 'false');
}

export function toggleClassroomMode() {
  const next = !isClassroomMode();
  setClassroomMode(next);
  return next;
}
