// src/services/tasksApi.js
const TASKS_KEY = "pp_tasks_v1";

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const TASK_CATEGORIES = ["OTHER", "FEATURE", "BUG", "RESEARCH", "UI_UX"];

function now() {
  return Date.now();
}

function seed() {
  const existing = localStorage.getItem(TASKS_KEY);
  if (existing) return;

  const tasks = [
    {
      id: "t1",
      projectId: "p2",
      title: "test",
      description: "test",
      assigneeId: "u2",
      status: "BLOCKED",
      priority: "HIGH",
      category: "OTHER",
      dueDate: "2026-02-04",
      updatedAt: now(),
      createdAt: now(),
    },
    {
      id: "t2",
      projectId: "p2",
      title: "Design Projects table UI",
      description: "Table + create modal + status pills.",
      assigneeId: "u3",
      status: "TODO",
      priority: "LOW",
      category: "UI_UX",
      dueDate: "2026-02-12",
      updatedAt: now(),
      createdAt: now(),
    },
  ];

  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

seed();

function readAll() {
  const raw = localStorage.getItem(TASKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeAll(rows) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(rows));
}

export async function listTasks() {
  return readAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function listTasksByProjectId(projectId) {
  return readAll()
    .filter((t) => String(t.projectId) === String(projectId))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function createTask(payload) {
  const rows = readAll();

  const t = {
    id: "t_" + Math.random().toString(16).slice(2) + Date.now().toString(16),
    projectId: payload.projectId || null,
    title: payload.title || "Untitled",
    description: payload.description || "",
    assigneeId: payload.assigneeId || null,
    status: payload.status || "TODO",
    priority: payload.priority || "MEDIUM",
    category: payload.category || "OTHER",
    dueDate: payload.dueDate || "",
    createdAt: now(),
    updatedAt: now(),
  };

  rows.push(t);
  writeAll(rows);
  return t;
}

export async function updateTask(id, patch) {
  const rows = readAll();
  const idx = rows.findIndex((t) => String(t.id) === String(id));
  if (idx === -1) throw new Error("Task not found");

  rows[idx] = { ...rows[idx], ...patch, updatedAt: now() };
  writeAll(rows);
  return rows[idx];
}

export async function deleteTask(id) {
  const rows = readAll();
  writeAll(rows.filter((t) => String(t.id) !== String(id)));
  return true;
}

// your Projects page was calling this:
export async function listUsersForAssign() {
  // keep compatibility
  const { listUsers } = await import("./usersApi");
  return listUsers();
}
