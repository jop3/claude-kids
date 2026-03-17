const STORAGE_KEY = 'claudekids_projects';

export function getProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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

export function exportProject(id) {
  const project = getProject(id);
  if (!project) return;
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name || 'projekt'}.claudekids`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importProject(jsonString) {
  let project;
  try {
    project = JSON.parse(jsonString);
  } catch {
    throw new Error('Ogiltig fil');
  }
  if (!project.id || !project.type || !project.name || !Array.isArray(project.blocks)) {
    throw new Error('Projektet saknar obligatoriska fält');
  }
  saveProject(project);
  return project;
}
