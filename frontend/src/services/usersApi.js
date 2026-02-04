// src/services/usersApi.js

const STORAGE_KEY = "pp_users_v1";

// Feel free to edit roles to match your app
export const USER_ROLES = ["SUPER_ADMIN", "MANAGER", "DEVELOPER", "VIEWER"];

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function makeId() {
  return "u_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

// Optional: seed initial users once, so page isn't empty
function seedIfEmpty() {
  const users = read();
  if (users.length > 0) return;

  const seeded = [
    {
      id: makeId(),
      name: "Emily Rodriguez",
      email: "emily@company.com",
      department: "Product",
      role: "MANAGER",
      isActive: true,
      password: "password123", // demo only
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: makeId(),
      name: "Michael Chen",
      email: "michael@company.com",
      department: "Engineering",
      role: "DEVELOPER",
      isActive: true,
      password: "password123", // demo only
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  write(seeded);
}

export async function listUsers() {
  seedIfEmpty();
  return read();
}

export async function createUser(payload) {
  const users = read();

  // basic validation
  if (!payload?.name?.trim()) throw new Error("Name is required");
  if (!payload?.email?.trim()) throw new Error("Email is required");
  if (!payload?.password?.trim()) throw new Error("Password is required");

  const emailLower = payload.email.trim().toLowerCase();
  const exists = users.some((u) => String(u.email || "").toLowerCase() === emailLower);
  if (exists) throw new Error("A user with this email already exists");

  const now = Date.now();
  const newUser = {
    id: makeId(),
    name: payload.name.trim(),
    email: payload.email.trim(),
    department: (payload.department || "").trim(),
    role: payload.role || "VIEWER",
    isActive: payload.isActive ?? true,
    password: payload.password, // NOTE: stored locally (demo only)
    createdAt: now,
    updatedAt: now,
  };

  write([newUser, ...users]);
  return newUser;
}

export async function updateUser(id, payload) {
  const users = read();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("User not found");

  const current = users[idx];

  // If updating email, prevent duplicates
  if (payload?.email && payload.email.trim().toLowerCase() !== String(current.email).toLowerCase()) {
    const emailLower = payload.email.trim().toLowerCase();
    const exists = users.some((u) => u.id !== id && String(u.email || "").toLowerCase() === emailLower);
    if (exists) throw new Error("A user with this email already exists");
  }

  const next = {
    ...current,
    name: payload?.name != null ? String(payload.name).trim() : current.name,
    email: payload?.email != null ? String(payload.email).trim() : current.email,
    department: payload?.department != null ? String(payload.department).trim() : current.department,
    role: payload?.role != null ? payload.role : current.role,
    isActive: payload?.isActive != null ? !!payload.isActive : current.isActive,
    // Password optional on edit: only update if user typed it
    password: payload?.password ? payload.password : current.password,
    updatedAt: Date.now(),
  };

  const copy = [...users];
  copy[idx] = next;
  write(copy);
  return next;
}

export async function deleteUser(id) {
  const users = read();
  write(users.filter((u) => u.id !== id));
  return true;
}

// Optional helper if you ever need it elsewhere:
export async function getUserById(id) {
  const users = read();
  return users.find((u) => u.id === id) || null;
}
