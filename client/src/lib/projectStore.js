const STORAGE_KEY = 'claudekids_projects';

export function getProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const projects = raw ? JSON.parse(raw) : [];
    // newest first
    return projects.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch {
    return [];
  }
}

export function saveProject(project) {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function deleteProject(id) {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getProject(id) {
  return getProjects().find(p => p.id === id) || null;
}

export function createProject(category, answers, file, name) {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    name: name || 'Namnlös',
    category: category || '',
    answers: answers || {},
    file: file || '',
    thumb: '',
    date: new Date().toISOString(),
  };
}
