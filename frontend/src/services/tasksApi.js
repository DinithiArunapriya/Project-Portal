import { api } from "./apiClient";

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
export const TASK_CATEGORIES = ["OTHER", "FEATURE", "BUG", "RESEARCH", "UI_UX"];

export async function listTasks() {
  return api.get("/tasks");
}

export async function listTasksByProjectId(projectId) {
  return api.get(`/tasks/project/${projectId}`);
}

export async function createTask(payload) {
  if (!payload?.projectId) throw new Error("projectId required");
  if (!payload?.title?.trim()) throw new Error("title required");

  return api.post("/tasks", {
    projectId: payload.projectId,
    title: payload.title.trim(),
    description: payload.description || "",
    assigneeId: payload.assigneeId || null,
    status: payload.status || "TODO",
    priority: payload.priority || "MEDIUM",
    category: payload.category || "OTHER",
    dueDate: payload.dueDate || "",
  });
}

export async function updateTask(id, patch) {
  return api.put(`/tasks/${id}`, {
    title: patch?.title,
    description: patch?.description,
    assigneeId: patch?.assigneeId,
    status: patch?.status,
    priority: patch?.priority,
    category: patch?.category,
    dueDate: patch?.dueDate,
  });
}

export async function deleteTask(id) {
  return api.del(`/tasks/${id}`);
}

export async function listUsersForAssign() {
  const { listUsers } = await import("./usersApi");
  return listUsers();
}
