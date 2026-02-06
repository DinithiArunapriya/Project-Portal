import React from "react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_CATEGORIES,
} from "../services/projectsApi";

export default function ProjectModal({ open, mode, initial, users = [], onClose, onSubmit }) {
  const [form, setForm] = React.useState({
    id: "",
    name: "",
    description: "",
    ownerId: "unassigned",
    assigneeId: "unassigned",
    status: "PLANNING",
    priority: "MEDIUM",
    category: "OTHER",
    startDate: "",
    endDate: "",
  });

  React.useEffect(() => {
    if (!open) return;

    setForm({
      id: initial?.id || "",
      name: initial?.name || "",
      description: initial?.description || "",
      ownerId: initial?.ownerId || "unassigned",
      assigneeId: initial?.assigneeId || "unassigned",
      status: initial?.status || "PLANNING",
      priority: initial?.priority || "MEDIUM",
      category: initial?.category || "OTHER",
      startDate: initial?.startDate || "",
      endDate: initial?.endDate || "",
    });
  }, [open, initial]);

  if (!open) return null;

  const title = mode === "edit" ? "Edit Project" : "Create Project";

  const submit = () => {
    if (!form.name.trim()) return alert("Project name is required");

    const owner = users.find((u) => String(u.id) === String(form.ownerId));
    const payload = {
      ...(mode === "create" ? { id: form.id.trim() } : {}),
      name: form.name.trim(),
      description: form.description.trim(),
      ownerId: form.ownerId === "unassigned" ? null : form.ownerId,
      owner: owner?.name || "",
      assigneeId: form.assigneeId === "unassigned" ? null : form.assigneeId,
      status: form.status,
      priority: form.priority,
      category: form.category,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    onSubmit?.(payload);
  };

  return (
    <div style={styles.overlay} onMouseDown={onClose}>
      <div style={styles.dialog} onMouseDown={(e) => e.stopPropagation()}>
        <Card>
          <div style={styles.header}>
            <div style={styles.h}>{title}</div>
            <button onClick={onClose} style={styles.x}>✕</button>
          </div>

          <div style={styles.grid}>
            {mode === "create" ? (
              <Field label="Project ID (optional)">
                <input
                  value={form.id}
                  onChange={(e) => setForm((s) => ({ ...s, id: e.target.value }))}
                  placeholder="ex: p2"
                  style={styles.input}
                />
              </Field>
            ) : null}

            <Field label="Project Name">
              <input
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="Project name"
                style={styles.input}
              />
            </Field>


            <Field label="Assigned To">
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
              <select
                value={form.status}
                onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                style={styles.input}
              >
                {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))}
                style={styles.input}
              >
                {PROJECT_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>

            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                style={styles.input}
              >
                {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Start Date">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((s) => ({ ...s, startDate: e.target.value }))}
                style={styles.input}
              />
            </Field>

            <Field label="End Date">
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((s) => ({ ...s, endDate: e.target.value }))}
                style={styles.input}
              />
            </Field>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Description">
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Optional description"
                  style={{ ...styles.input, height: 110, resize: "vertical" }}
                />
              </Field>
            </div>
          </div>

          <div style={styles.footer}>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={submit}>
              {mode === "edit" ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={styles.label}>{label}</div>
      {children}
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    display: "grid",
    placeItems: "center",
    zIndex: 999,
    padding: 16,
  },
  dialog: { width: "min(900px, 100%)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  h: { fontSize: 18, fontWeight: 950, color: "#0f172a" },
  x: { border: "none", background: "transparent", cursor: "pointer", fontSize: 18, fontWeight: 900 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  label: { fontSize: 12, fontWeight: 900, color: "#475569" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e2e8f0", outline: "none" },
  footer: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 },
};
