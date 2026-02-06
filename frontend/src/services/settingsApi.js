import { api } from "./apiClient";

export async function getSettings() {
  return api.get("/settings");
}

export async function updateProfileSettings(patch) {
  return api.put("/settings/profile", patch || {});
}

export async function updateNotificationSettings(patch) {
  return api.put("/settings/notifications", patch || {});
}

export async function updateAppearanceSettings(patch) {
  return api.put("/settings/appearance", patch || {});
}
