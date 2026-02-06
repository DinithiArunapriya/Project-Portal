import { api } from "./apiClient";

export async function loginWithEmail(email, password) {
  if (!email || !password) throw new Error("Email and password required");
  return api.post("/auth/login", { email, password });
}

export async function listDemoUsers() {
  return api.get("/auth/demo-users");
}
