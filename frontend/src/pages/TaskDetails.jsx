import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotify } from "../notifications/NotificationProvider";

import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import { getTaskById, updateTask, deleteTask, listUsersForAssign, STATUSES, PRIORITIES, TASK_CATEGORIES } from "../services/tasksApi";
import { listProjects } from "../services/projectsApi";

export default function TaskDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const notify = useNotify();

  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState(null);

  const [users, setUsers] = React.useState([]);
  const [projects, setProjects] = React.useState([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [t, u, p] = await Promise.all([getTaskById(id), listUsersForAssign(), listProjects()]);
      setTask(t);
      setUsers(u || []);
      setProjects(p || []);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const userName = (uid) => {
    if (!uid) return "—";
    return users.find((u) => u.id === uid)?.name || "Unknown";
  };

  const projectName = (pid) => {
    if (!pid) return "—";
    return projects.find((p) => p.id === pid)?.name || "Unknown";
  };

  const patch = async (p) => {
    try {
      await updateTask(id, p);
      notify({ title: "Saved", message: "Task updated", type: "success" });
      await load();
    } catch (e) {
      notify({ title: "Error", message: e?.message || "Update failed", type: "error" });
    }
  };

  const onDelete = async () => {
    const ok = window.confirm("Delete this task?");
    if (!ok) return;
    try {
      await deleteTask(id);
      notify({ title: "Deleted", message: "Task deleted", type: "success" });
      nav("/tasks");
    } catch (e) {
      notify({ title: "Error", message: e?.message || "Delete failed", type: "error" });
    }
  };

  if (loading) return <Card>Loading…</Card>;
  if (!task) return <Card>Task not found.</Card>;

  return (
    <div>
      <PageHeader
        title={task.title}
        subtitle={`Project: ${projectName(task.projectId)} • Assigned: ${userName(task.assigneeId)}`}
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={() => nav("/tasks")}>Back</Button>
            <Button variant="danger" onClick={onDelete}>Delete</Button>
          </div>
        }
      />

      <Card>
        <div style={styles.grid}>
          <Field label="Status">
            <select value={task.status} onChange={(e) => patch({ status: e.target.value })} style={styles.select}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Priority">
            <select value={task.priority} onChange={(e) => patch({ priority: e.target.value })} style={styles.select}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>

          <Field label="Category">
            <select value={task.category || "OTHER"} onChange={(e) => patch({ category: e.target.value })} style={styles.select}>
              {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Assigned To">
            <select
              value={task.assigneeId || ""}
              onChange={(e) => patch({ assigneeId: e.target.value || null })}
              style={styles.select}
            >
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>

          <Field label="Due Date">
            <input
              type="date"
              value={task.dueDate || ""}
              onChange={(e) => patch({ dueDate: e.target.value || null })}
              style={styles.input}
            />
          </Field>

          <div style={{ gridColumn: "1 / -1" }}>
            <div style={styles.label}>Description</div>
            <textarea
              value={task.description || ""}
              onChange={(e) => patch({ description: e.target.value })}
              style={{ ...styles.input, minHeight: 120 }}
            />
          </div>
        </div>
      </Card>
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

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },
  label: { fontSize: 12, fontWeight: 900, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", outline: "none" },
  select: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "white" },
};
