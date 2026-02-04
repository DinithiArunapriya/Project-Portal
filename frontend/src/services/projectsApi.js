// src/services/projectsApi.js
const PROJECTS_KEY = "pp_projects_v1";

export const PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "AT_RISK"];
export const PROJECT_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const PROJECT_CATEGORIES = ["OTHER", "ENGINEERING", "DESIGN", "MARKETING", "SALES", "HR"];

function now() {
  return Date.now();
}

function seed() {
  const existing = localStorage.getItem(PROJECTS_KEY);
  if (existing) return;

  const projects = [
    {
      id: "p2",
      name: "Mobile App MVP",
      description: "Finalize MVP features and acceptance criteria.",
      ownerName: "Emily Rodriguez",
      ownerId: "u1",
      assigneeId: "u2",
      status: "PLANNING",
      priority: "MEDIUM",
      category: "ENGINEERING",
      startDate: "2026-02-01",
      endDate: "2026-02-28",
      updatedAt: now(),
      createdAt: now(),
    },
    {
      id: "p3",
      name: "Website Redesign",
      description: "Header + Sidebar + protected routes.",
      ownerName: "Emily Rodriguez",
      ownerId: "u1",
      assigneeId: "u3",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "DESIGN",
      startDate: "2026-01-10",
      endDate: "2026-02-20",
      updatedAt: now(),
      createdAt: now(),
    },
  ];

  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

seed();

function readAll() {
  const raw = localStorage.getItem(PROJECTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeAll(rows) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(rows));
}

export async function listProjects() {
  return readAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getProjectById(id) {
  const rows = readAll();
  return rows.find((p) => String(p.id) === String(id)) || null;
}

export async function createProject(payload) {
  const rows = readAll();

  const id = payload.id?.trim()
    ? payload.id.trim()
    : "p_" + Math.random().toString(16).slice(2) + Date.now().toString(16);

  if (rows.some((p) => String(p.id) === String(id))) {
    throw new Error("Project ID already exists. Use a different ID.");
  }

  const p = {
    id,
    name: payload.name || "Untitled",
    description: payload.description || "",
    ownerName: payload.ownerName || "",
    ownerId: payload.ownerId || null,
    assigneeId: payload.assigneeId || null,
    status: payload.status || "PLANNING",
    priority: payload.priority || "MEDIUM",
    category: payload.category || "OTHER",
    startDate: payload.startDate || "",
    endDate: payload.endDate || "",
    createdAt: now(),
    updatedAt: now(),
  };

  rows.push(p);
  writeAll(rows);
  return p;
}

export async function updateProject(id, patch) {
  const rows = readAll();
  const idx = rows.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) throw new Error("Project not found");

  rows[idx] = {
    ...rows[idx],
    ...patch,
    updatedAt: now(),
  };

  writeAll(rows);
  return rows[idx];
}

export async function deleteProject(id) {
  const rows = readAll();
  writeAll(rows.filter((p) => String(p.id) !== String(id)));
  return true;
}
