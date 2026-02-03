import React from "react";
import { listUsersForAssign } from "../services/tasksApi";
import { PROJECT_STATUSES, PROJECT_PRIORITIES, PROJECT_CATEGORIES } from "../services/projectsApi";
import Card from "./ui/Card";
import Button from "./ui/Button";

export default function ProjectModal({ open, mode = "create", onClose, onSubmit, initial }) {
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [users, setUsers] = React.useState([]);

  const [name, setName] = React.useState("");
  const [owner, setOwner] = React.useState("");
  const [status, setStatus] = React.useState("PLANNING");
  const [progress, setProgress] = React.useState(0);

  const [assigneeId, setAssigneeId] = React.useState("");
  const [priority, setPriority] = React.useState("MEDIUM");
  const [category, setCategory] = React.useState("OTHER");

  React.useEffect(() => {
    if (!open) return;

    setName(initial?.name || "");
    setOwner(initial?.owner || "");
    setStatus(initial?.status || "PLANNING");
    setProgress(Number(initial?.progress || 0));

    setAssigneeId(initial?.assigneeId || "");
    setPriority(initial?.priority || "MEDIUM");
    setCategory(initial?.category || "OTHER");
  }, [open, initial]);

  React.useEffect(() => {
    if (!open) return;
    (async () => {
      setLoadingUsers(true);
      try {
        const u = await listUsersForAssign();
        setUsers(u || []);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Project name is required.");
    if (!owner.trim()) return alert("Owner is required.");

    await onSubmit({
      name,
      owner,
      status,
      progress: Number(progress) || 0,
      assigneeId: assigneeId || null,
      priority,
      category,
    });
  };

  return (
    <div style={styles.backdrop} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <Card>
          <div style={styles.headerRow}>
            <div>
              <div style={styles.title}>{mode === "edit" ? "Edit Project" : "New Project"}</div>
              <div style={styles.subtitle}>Manage project configuration</div>
            </div>
            <button style={styles.xBtn} onClick={onClose}>✕</button>
          </div>

          <form onSubmit={submit}>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Project Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Owner</label>
                <input value={owner} onChange={(e) => setOwner(e.target.value)} style={styles.input} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Progress (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Assigned To</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  style={styles.select}
                  disabled={loadingUsers}
                >
                  <option value="">{loadingUsers ? "Loading..." : "Unassigned"}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={styles.select}>
                  {PROJECT_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
  backdrop: { position: "fixed", inset: 0, background: "rgba(17,24,39,0.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 },
  modal: { width: "min(860px, 100%)" },
  headerRow: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 950, color: "#111827" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  xBtn: { border: "1px solid #e5e7eb", background: "white", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontWeight: 900 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 10 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 900, color: "#374151" },
  input: { padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", outline: "none" },
  select: { padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "white", outline: "none" },
  footer: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 },
};
