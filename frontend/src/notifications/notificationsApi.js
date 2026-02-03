const KEY = "notifications_v1";

function readAll() {
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
  return "n_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export async function addNotification(input) {
  const items = readAll();

  const n = {
    id: makeId(),
    title: input.title || "Notification",
    message: input.message || "",
    type: input.type || "info",
    read: false,
    createdAt: Date.now(),
  };

  items.unshift(n);
  writeAll(items);
  return n;
}
