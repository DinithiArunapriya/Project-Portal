import { api } from "./apiClient";

export const PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "DONE"];
export const PROJECT_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
export const PROJECT_CATEGORIES = ["INTERNAL", "CLIENT", "MAINTENANCE", "OTHER"];

export async function listProjects() {
  return api.get("/projects");
}

export async function getProjectById(id) {
  return api.get(`/projects/${id}`);
}

export async function createProject(payload) {
  if (!payload?.name?.trim()) throw new Error("Project name is required");

  return api.post("/projects", {
    id: payload.id || undefined,
    name: payload.name.trim(),
    owner: payload.owner || payload.ownerName || "",
    ownerId: payload.ownerId || null,
    assigneeId: payload.assigneeId || null,
    status: payload.status || "PLANNING",
    priority: payload.priority || "MEDIUM",
    category: payload.category || "OTHER",
    progress: payload.progress ?? 0,
    description: payload.description || "",
    startDate: payload.startDate || "",
    endDate: payload.endDate || "",
  });
}

export async function updateProject(id, patch) {
  return api.put(`/projects/${id}`, {
    name: patch?.name,
    owner: patch?.owner || patch?.ownerName,
    ownerId: patch?.ownerId,
    assigneeId: patch?.assigneeId,
    status: patch?.status,
    priority: patch?.priority,
    category: patch?.category,
    progress: patch?.progress,
    description: patch?.description,
    startDate: patch?.startDate,
    endDate: patch?.endDate,
  });
}

export async function deleteProject(id) {
  return api.del(`/projects/${id}`);
}
