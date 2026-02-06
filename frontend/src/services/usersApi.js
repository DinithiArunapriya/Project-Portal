import { api } from "./apiClient";

// Match backend roles
export const USER_ROLES = [
  "SUPER_ADMIN",
  "MANAGER",
  "DEVELOPER",
  "DESIGNER",
  "QA",
  "HR",
  "BUSINESS_ANALYST",
];

export async function listUsers() {
  return api.get("/users");
}

export async function createUser(payload) {
  if (!payload?.name?.trim()) throw new Error("Name is required");
  if (!payload?.email?.trim()) throw new Error("Email is required");
  if (!payload?.password?.trim()) throw new Error("Password is required");

  return api.post("/users", {
    name: payload.name.trim(),
    email: payload.email.trim(),
    password: payload.password,
    role: payload.role,
    department: payload.department || "",
    isActive: payload.isActive ?? true,
    avatar: payload.avatar ?? null,
  });
}

export async function updateUser(id, payload) {
  return api.put(`/users/${id}`, {
    name: payload?.name,
    email: payload?.email,
    password: payload?.password,
    role: payload?.role,
    department: payload?.department,
    isActive: payload?.isActive,
    avatar: payload?.avatar,
  });
}

export async function deleteUser(id) {
  return api.del(`/users/${id}`);
}

export async function getUserById(id) {
  const users = await listUsers();
  return Array.isArray(users) ? users.find((u) => String(u.id) === String(id)) || null : null;
}
