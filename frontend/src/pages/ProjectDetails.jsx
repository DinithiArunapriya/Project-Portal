import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotify } from "../notifications/NotificationProvider";

import { listUsers } from "../services/usersApi";
import { getProjectById } from "../services/projectsApi";
import {
  listTasksByProjectId,
  createTask,
  updateTask,
  deleteTask,
  TASK_STATUSES,
  TASK_PRIORITIES,
} from "../services/tasksApi";

export default function ProjectDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const notify = useNotify();

  const [loading, setLoading] = React.useState(true);
  const [project, setProject] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);

  const [form, setForm] = React.useState({
    title: "",
    assigneeId: "unassigned",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    description: "",
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [u, p, t] = await Promise.all([
        listUsers(),
        getProjectById(id),
        listTasksByProjectId(id),
      ]);

      setUsers(Array.isArray(u) ? u : []);
      setProject(p || null);
      setTasks(Array.isArray(t) ? t : []);
    } catch (e) {
      notify({ type: "error", title: "Load failed", message: e?.message || "Failed to load project details" });
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  React.useEffect(() => {
    load();
  }, [load]);

  const getUserName = (uid) => {
    if (!uid) return "Unassigned";
    const u = users.find((x) => String(x.id || x._id) === String(uid));
    return u?.name || "Unknown";
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;

  const progressPct = React.useMemo(() => {
    if (!totalTasks) return 0;
    return Math.round((doneTasks / totalTasks) * 100);
  }, [doneTasks, totalTasks]);

  const onAddTask = async () => {
    const title = form.title.trim();
    if (!title) return notify({ type: "error", title: "Validation", message: "Task title is required" });

    try {
      const created = await createTask({
        projectId: id,
        title,
        description: form.description.trim(),
        assigneeId: form.assigneeId === "unassigned" ? null : form.assigneeId,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || "",
        category: "OTHER",
      });

      setTasks((prev) => [created, ...prev]);
      setForm({ title: "", assigneeId: "unassigned", status: "TODO", priority: "MEDIUM", dueDate: "", description: "" });
      notify({ type: "success", title: "Created", message: "Task added" });
    } catch (e) {
      notify({ type: "error", title: "Create failed", message: e?.message || "Failed to create task" });
    }
  };

  const onChangeTaskStatus = async (taskId, nextStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));
    try {
      await updateTask(taskId, { status: nextStatus });
    } catch {
      // revert by reloading
      load();
    }
  };

  const onDeleteTask = async (taskId) => {
    const ok = window.confirm("Delete this task?");
    if (!ok) return;

    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      notify({ type: "success", title: "Deleted", message: "Task deleted" });
    } catch (e) {
      notify({ type: "error", title: "Delete failed", message: e?.message || "Failed to delete task" });
    }
  };

  if (loading) return <div style={styles.page}><div style={styles.card}>Loading…</div></div>;

  if (!project) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, borderColor: "#fecaca", background: "#fff1f2" }}>Project not found.</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header row */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.h1}>{project.name || "Project"}</h1>
          <div style={styles.subLine}>
            <span>Owner: {project.owner || getUserName(project.ownerId) || "—"}</span>
            <span style={styles.dot}>•</span>
            <span>Status: {String(project.status || "PLANNING")}</span>
          </div>
        </div>

        <button style={styles.backBtn} onClick={() => nav(-1)}>← Back</button>
      </div>

      {/* KPI cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Project ID</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={styles.kpiValue}>{shortId(project.id || id)}</div>
            <button
              onClick={() => copyToClipboard(project.id || id, notify)}
              style={styles.copyBtn}
              title="Copy full ID"
            >
              Copy
            </button>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Progress</div>
          <div style={styles.kpiValue}>{progressPct}%</div>
          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${progressPct}%` }} />
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Tasks</div>
          <div style={styles.kpiValue}>{totalTasks}</div>
          <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>Done: {doneTasks}</div>
        </div>
      </div>

      {/* Add Task */}
      <div style={{ ...styles.card, marginTop: 14 }}>
        <div style={styles.sectionTitle}>Add Task</div>

        <div style={styles.formGrid}>
          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="Task title"
              style={styles.input}
            />
          </Field>

          <Field label="Assignee">
            <select
              value={form.assigneeId}
              onChange={(e) => setForm((s) => ({ ...s, assigneeId: e.target.value }))}
              style={styles.input}
            >
              <option value="unassigned">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))} style={styles.input}>
              {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Priority">
            <select value={form.priority} onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))} style={styles.input}>
              {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>

          <Field label="Due Date">
            <input type="date" value={form.dueDate} onChange={(e) => setForm((s) => ({ ...s, dueDate: e.target.value }))} style={styles.input} />
          </Field>
        </div>

        <div style={{ marginTop: 10 }}>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="Optional description"
              rows={4}
              style={{ ...styles.input, height: 110, resize: "vertical" }}
            />
          </Field>
        </div>

        <button style={{ ...styles.primaryBtn, marginTop: 12 }} onClick={onAddTask}>+ Add Task</button>
      </div>

      {/* Tasks table */}
      <div style={{ ...styles.card, marginTop: 14, padding: 0 }}>
        <div style={{ padding: 14, borderBottom: "1px solid #eef2f7" }}>
          <div style={styles.sectionTitle}>Project Tasks</div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Assignee</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Due</th>
                <th style={styles.th}>Updated</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 18, textAlign: "center", color: "#6b7280" }}>
                    No tasks yet.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 900 }}>{t.title}</div>
                      {t.description ? <div style={{ marginTop: 4, color: "#6b7280", fontSize: 13 }}>{t.description}</div> : null}
                    </td>
                    <td style={styles.td}>{getUserName(t.assigneeId)}</td>
                    <td style={styles.td}>
                      <select value={t.status} onChange={(e) => onChangeTaskStatus(t.id, e.target.value)} style={styles.statusSelect}>
                        {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={styles.td}><PriorityPill value={t.priority} /></td>
                    <td style={styles.td}>{t.dueDate || "—"}</td>
                    <td style={styles.td}>{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "—"}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <button style={styles.deleteBtn} onClick={() => onDeleteTask(t.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.footerTip}>Tip: You can also manage all tasks from <b>Tasks</b>.</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      {children}
    </div>
  );
}

function PriorityPill({ value }) {
  const v = String(value || "MEDIUM").toUpperCase();
  const map = {
    LOW: { bg: "#f1f5f9", fg: "#0f172a" },
    MEDIUM: { bg: "#e0f2fe", fg: "#075985" },
    HIGH: { bg: "#fee2e2", fg: "#991b1b" },
    CRITICAL: { bg: "#ffe4e6", fg: "#9f1239" },
  };
  const c = map[v] || map.MEDIUM;
  return <span style={{ ...styles.pill, background: c.bg, color: c.fg }}>{v}</span>;
}

function shortId(full) {
  const s = String(full || "");
  if (s.length <= 14) return s;
  return `${s.slice(0, 6)}…${s.slice(-6)}`;
}

async function copyToClipboard(text, notify) {
  try {
    await navigator.clipboard.writeText(String(text));
    notify?.({ type: "success", title: "Copied", message: "Project ID copied" });
  } catch {
    notify?.({ type: "error", title: "Copy failed", message: "Could not copy" });
  }
}

const styles = {
  page: { padding: 18, maxWidth: 1200, margin: "0 auto" },

  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  h1: { margin: 0, fontSize: 28, fontWeight: 950, color: "#0f172a" },
  subLine: { marginTop: 6, color: "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 },
  dot: { opacity: 0.6 },

  backBtn: { border: "1px solid #e2e8f0", background: "white", padding: "10px 14px", borderRadius: 12, fontWeight: 900, cursor: "pointer", color: "#0f172a" },

  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 },
  kpiCard: { background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 },
  kpiLabel: { color: "#64748b", fontWeight: 900, fontSize: 13 },
  kpiValue: { marginTop: 10, fontSize: 18, fontWeight: 950, color: "#0f172a" },

  copyBtn: { border: "1px solid #e2e8f0", background: "white", padding: "8px 10px", borderRadius: 12, fontWeight: 900, cursor: "pointer", color: "#0f172a" },

  progressOuter: { marginTop: 10, height: 10, borderRadius: 999, background: "#f1f5f9", overflow: "hidden", border: "1px solid #e2e8f0" },
  progressInner: { height: "100%", borderRadius: 999, background: "#0f172a", width: "0%" },

  card: { background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 950, color: "#0f172a" },

  formGrid: { display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, marginTop: 12 },
  label: { fontSize: 12, fontWeight: 900, color: "#64748b", marginBottom: 6 },

  input: { width: "100%", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 12px", outline: "none", fontWeight: 800 },

  primaryBtn: { border: "1px solid #0f172a", background: "#0f172a", color: "white", padding: "10px 14px", borderRadius: 14, fontWeight: 950, cursor: "pointer", width: 140 },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 14px", fontSize: 12, color: "#64748b", fontWeight: 950, borderBottom: "1px solid #eef2f7", background: "#ffffff" },
  td: { padding: "14px 14px", fontSize: 14, color: "#0f172a", verticalAlign: "top" },

  statusSelect: { padding: "8px 10px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", fontWeight: 900, cursor: "pointer" },

  pill: { display: "inline-flex", alignItems: "center", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 950 },

  deleteBtn: { border: "1px solid #fecaca", background: "#fff1f2", color: "#b91c1c", borderRadius: 12, padding: "10px 14px", fontWeight: 950, cursor: "pointer" },

  footerTip: { padding: 12, borderTop: "1px solid #eef2f7", color: "#64748b", fontSize: 13 },
};
