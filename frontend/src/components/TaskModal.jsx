import React from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { listUsersForAssign, STATUSES, PRIORITIES, TASK_CATEGORIES } from "../services/tasksApi";
import { listProjects } from "../services/projectsApi";

export default function TaskModal({ open, mode = "create", initialTask, onClose, onSubmit }) {
  const [users, setUsers] = React.useState([]);
  const [projects, setProjects] = React.useState([]);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [assigneeId, setAssigneeId] = React.useState("");
  const [status, setStatus] = React.useState("TODO");
  const [priority, setPriority] = React.useState("MEDIUM");
  const [category, setCategory] = React.useState("OTHER");
  const [dueDate, setDueDate] = React.useState("");

  React.useEffect(() => {
    if (!open) return;

    setTitle(initialTask?.title || "");
    setDescription(initialTask?.description || "");
    setProjectId(initialTask?.projectId || "");
    setAssigneeId(initialTask?.assigneeId || "");
    setStatus(initialTask?.status || "TODO");
    setPriority(initialTask?.priority || "MEDIUM");
    setCategory(initialTask?.category || "OTHER");
    setDueDate(initialTask?.dueDate || "");
  }, [open, initialTask]);

  React.useEffect(() => {
    if (!open) return;
    (async () => {
      const [u, p] = await Promise.all([listUsersForAssign(), listProjects()]);
      setUsers(u || []);
      setProjects(p || []);
    })();
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required.");
    await onSubmit({
      title,
      description,
      projectId: projectId || null,
      assigneeId: assigneeId || null,
      status,
      priority,
      category,
      dueDate: dueDate || null,
    });
  };

  return (
    <div style={styles.backdrop} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <Card>
          <div style={styles.headerRow}>
            <div>
              <div style={styles.title}>{mode === "edit" ? "Edit Task" : "New Task"}</div>
              <div style={styles.subtitle}>Create and manage tasks</div>
            </div>
            <button style={styles.xBtn} onClick={onClose}>✕</button>
          </div>

          <form onSubmit={submit}>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} style={styles.input} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Project</label>
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={styles.select}>
                  <option value="">Unassigned</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...styles.input, minHeight: 90 }}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Assigned To</label>
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={styles.select}>
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={styles.select}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
                  {TASK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={styles.input} />
              </div>
            </div>

            <div style={styles.footer}>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary">{mode === "edit" ? "Save" : "Create"}</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(17,24,39,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  },
  modal: { width: "min(900px, 100%)" },
  headerRow: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 950 },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  xBtn: { border: "1px solid #e5e7eb", background: "white", borderRadius: 10, width: 36, height: 36, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 900, color: "#374151" },
  input: { padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", outline: "none" },
  select: { padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "white", outline: "none" },
  footer: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 },
};
