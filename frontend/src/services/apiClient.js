const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8081/api";

function getToken() {
  try {
    const raw = localStorage.getItem("auth_state_v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const message =
      (data && data.message) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body || {}) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body || {}) }),
  del: (path) => request(path, { method: "DELETE" }),
};
