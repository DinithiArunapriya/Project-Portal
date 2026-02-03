const KEY = "users_v1";

export const USER_ROLES = [
  "SUPER_ADMIN",
  "MANAGER",
  "BUSINESS_ANALYST",
  "DEVELOPER",
  "DESIGNER",
  "HR",
  "QA",
  "OTHER",
];

export const USER_STATUSES = ["ACTIVE", "DISABLED"];

function seedIfEmpty() {
  const existing = localStorage.getItem(KEY);
  if (existing) return;

  const seed = [
    {
      id: "u1",
      name: "Sarah Johnson",
      email: "sarah.johnson@demo.com",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      updatedAt: Date.now() - 1000 * 60 * 60 * 72,
    },
    {
      id: "u2",
      name: "Michael Chen",
      email: "michael.chen@demo.com",
      role: "MANAGER",
      status: "ACTIVE",
      updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    },
    {
      id: "u3",
      name: "Emily Rodriguez",
      email: "emily.rodriguez@demo.com",
      role: "BUSINESS_ANALYST",
      status: "ACTIVE",
      updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: "u4",
      name: "Alex Thompson",
      email: "alex.thompson@demo.com",
      role: "DEVELOPER",
      status: "ACTIVE",
      updatedAt: Date.now() - 1000 * 60 * 60 * 6,
    },
    {
      id: "u5",
      name: "Priya Patel",
      email: "priya.patel@demo.com",
      role: "DEVELOPER",
      status: "ACTIVE",
      updatedAt: Date.now() - 1000 * 60 * 60 * 9,
    },
    {
      id: "u6",
      name: "David Kim",
      email: "david.kim@demo.com",
      role: "DESIGNER",
      status: "ACTIVE",
      updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    },
    {
      id: "u7",
      name: "Lisa Wang",
      email: "lisa.wang@demo.com",
      role: "HR",
      status: "DISABLED",
      updatedAt: Date.now() - 1000 * 60 * 60 * 18,
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
  return "u_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export async function listUsers() {
  await new Promise((r) => setTimeout(r, 200));
  return readAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getUserById(id) {
  await new Promise((r) => setTimeout(r, 150));
  return readAll().find((u) => u.id === id) || null;
}

export async function createUser(input) {
  await new Promise((r) => setTimeout(r, 250));
  const items = readAll();

  const email = (input.email || "").trim().toLowerCase();
  if (!email) throw new Error("Email is required.");

  const exists = items.some((u) => (u.email || "").toLowerCase() === email);
  if (exists) throw new Error("A user with this email already exists.");

  const user = {
    id: makeId(),
    name: (input.name || "").trim(),
    email,
    role: input.role || "VIEWER",
    status: input.status || "ACTIVE",
    updatedAt: Date.now(),
  };

  if (!user.name) throw new Error("Name is required.");

  items.unshift(user);
  writeAll(items);
  return user;
}

export async function updateUser(id, patch) {
  await new Promise((r) => setTimeout(r, 250));
  const items = readAll();
  const idx = items.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("User not found.");

  if (patch.email != null) {
    const nextEmail = (patch.email || "").trim().toLowerCase();
    if (!nextEmail) throw new Error("Email is required.");
    const conflict = items.some((u) => u.id !== id && (u.email || "").toLowerCase() === nextEmail);
    if (conflict) throw new Error("Another user already has this email.");
  }

  items[idx] = {
    ...items[idx],
    ...(patch.name != null ? { name: (patch.name || "").trim() } : {}),
    ...(patch.email != null ? { email: (patch.email || "").trim().toLowerCase() } : {}),
    ...(patch.role != null ? { role: patch.role } : {}),
    ...(patch.status != null ? { status: patch.status } : {}),
    updatedAt: Date.now(),
  };

  if (!items[idx].name) throw new Error("Name is required.");

  writeAll(items);
  return items[idx];
}

export async function deleteUser(id) {
  await new Promise((r) => setTimeout(r, 200));
  const items = readAll();
  writeAll(items.filter((u) => u.id !== id));
  return true;
}
