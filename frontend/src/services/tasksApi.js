const KEY = "tasks_v1";
const USERS_KEY = "users_v1";

export const STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const TASK_CATEGORIES = ["WEB", "MOBILE", "INTEGRATION", "INTERNAL", "OTHER"];

function seedIfEmpty() {
  const existing = localStorage.getItem(KEY);
  if (existing) return;

  const seed = [
    {
      id: "t1",
      projectId: "p1",
      title: "Define MVP scope",
      description: "Finalize MVP features and acceptance criteria.",
      assigneeId: "u3",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "INTERNAL",
      dueDate: addDaysISO(5),
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      updatedAt: Date.now() - 1000 * 60 * 60 * 6,
    },
    {
      id: "t2",
      projectId: "p1",
      title: "Create dashboard layout",
      description: "Header + Sidebar + protected routes.",
      assigneeId: "u4",
      status: "DONE",
      priority: "MEDIUM",
      category: "WEB",
      dueDate: addDaysISO(-1),
      createdAt: Date.now() - 1000 * 60 * 60 * 72,
      updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    },
    {
      id: "t3",
      projectId: "p2",
      title: "Design Projects table UI",
      description: "Table + create modal + status pills.",
      assigneeId: "u6",
      status: "TODO",
      priority: "LOW",
      category: "MOBILE",
      dueDate: addDaysISO(10),
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      updatedAt: Date.now() - 1000 * 60 * 45,
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
  return "t_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function listUsersForAssign() {
  await new Promise((r) => setTimeout(r, 150));
  const users = readUsers();
  return users
    .slice()
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    .map((u) => ({ id: u.id, name: u.name, email: u.email, status: u.status, role: u.role }));
}

export async function listTasks() {
  await new Promise((r) => setTimeout(r, 250));
  return readAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getTaskById(id) {
  await new Promise((r) => setTimeout(r, 150));
  const items = readAll();
  return items.find((t) => t.id === id) || null;
}

export async function createTask(input) {
  await new Promise((r) => setTimeout(r, 250));
  const items = readAll();

  const task = {
    id: makeId(),
    projectId: input.projectId || null,
    title: input.title.trim(),
    description: input.description?.trim() || "",
    assigneeId: input.assigneeId || null,
    status: input.status,
    priority: input.priority,
    category: input.category || "OTHER",
    dueDate: input.dueDate || null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  items.unshift(task);
  writeAll(items);
  return task;
}

export async function updateTask(id, patch) {
  await new Promise((r) => setTimeout(r, 250));
  const items = readAll();
  const idx = items.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Task not found.");

  items[idx] = {
    ...items[idx],
    ...(patch.projectId !== undefined ? { projectId: patch.projectId || null } : {}),
    ...(patch.title != null ? { title: patch.title.trim() } : {}),
    ...(patch.description != null ? { description: patch.description.trim() } : {}),
    ...(patch.assigneeId !== undefined ? { assigneeId: patch.assigneeId || null } : {}),
    ...(patch.status != null ? { status: patch.status } : {}),
    ...(patch.priority != null ? { priority: patch.priority } : {}),
    ...(patch.category != null ? { category: patch.category } : {}),
    ...(patch.dueDate !== undefined ? { dueDate: patch.dueDate || null } : {}),
    updatedAt: Date.now(),
  };

  writeAll(items);
  return items[idx];
}

export async function deleteTask(id) {
  await new Promise((r) => setTimeout(r, 250));
  const items = readAll();
  writeAll(items.filter((t) => t.id !== id));
  return true;
}
