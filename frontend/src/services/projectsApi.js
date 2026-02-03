const KEY = "projects_v1";

export const PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "DONE"];
export const PROJECT_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const PROJECT_CATEGORIES = ["WEB", "MOBILE", "INTEGRATION", "INTERNAL", "OTHER"];

function seedIfEmpty() {
  const existing = localStorage.getItem(KEY);
  if (existing) return;

  const seed = [
    {
      id: "p1",
      name: "Website Redesign",
      owner: "Michael Chen",
      assigneeId: "u4",
      status: "IN_PROGRESS",
      progress: 65,
      priority: "HIGH",
      category: "WEB",
      updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: "p2",
      name: "Mobile App MVP",
      owner: "Emily Rodriguez",
      assigneeId: "u3",
      status: "PLANNING",
      progress: 20,
      priority: "MEDIUM",
      category: "MOBILE",
      updatedAt: Date.now() - 1000 * 60 * 60 * 8,
    },
    {
      id: "p3",
      name: "JIRA Integration",
      owner: "Alex Thompson",
      assigneeId: "",
      status: "ON_HOLD",
      progress: 10,
      priority: "LOW",
      category: "INTEGRATION",
      updatedAt: Date.now() - 1000 * 60 * 60 * 72,
    },
  ];

  localStorage.setItem(KEY, JSON.stringify(seed));
}

function readAll() {
  seedIfEmpty();
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function writeAll(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function makeId() {
  return "p_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export async function listProjects() {
  await new Promise((r) => setTimeout(r, 250));
  return readAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getProjectById(id) {
  await new Promise((r) => setTimeout(r, 150));
  const items = readAll();
  return items.find((p) => p.id === id) || null;
}

export async function createProject(input) {
  await new Promise((r) => setTimeout(r, 250));
  const items = readAll();

  const project = {
    id: makeId(),
    name: input.name.trim(),
    owner: input.owner.trim(),
    status: input.status,
    progress: Number(input.progress) || 0,

    assigneeId: input.assigneeId || null,
    priority: input.priority || "MEDIUM",
    category: input.category || "OTHER",

    updatedAt: Date.now(),
  };

  items.unshift(project);
  writeAll(items);
  return project;
}

export async function updateProject(id, patch) {
  await new Promise((r) => setTimeout(r, 250));
  const items = readAll();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Project not found.");

  items[idx] = {
    ...items[idx],
    ...(patch.name != null ? { name: patch.name.trim() } : {}),
    ...(patch.owner != null ? { owner: patch.owner.trim() } : {}),
    ...(patch.status != null ? { status: patch.status } : {}),
    ...(patch.progress != null ? { progress: Number(patch.progress) || 0 } : {}),

    ...(patch.assigneeId !== undefined ? { assigneeId: patch.assigneeId || null } : {}),
    ...(patch.priority != null ? { priority: patch.priority } : {}),
    ...(patch.category != null ? { category: patch.category } : {}),

    updatedAt: Date.now(),
  };

  writeAll(items);
  return items[idx];
}

export async function deleteProject(id) {
  await new Promise((r) => setTimeout(r, 250));
  const items = readAll();
  writeAll(items.filter((p) => p.id !== id));
  return true;
}
