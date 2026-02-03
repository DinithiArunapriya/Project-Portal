import React from "react";

const STATUSES = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "DONE"];

export default function ProjectEditModal({ open, mode, initialProject, onClose, onSubmit }) {
  const isEdit = mode === "edit";

  const [name, setName] = React.useState("");
  const [owner, setOwner] = React.useState("");
  const [status, setStatus] = React.useState("PLANNING");
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;

    if (isEdit && initialProject) {
      setName(initialProject.name || "");
      setOwner(initialProject.owner || "");
      setStatus(initialProject.status || "PLANNING");
      setProgress(Number(initialProject.progress) || 0);
    } else {
      setName("");
      setOwner("");
      setStatus("PLANNING");
      setProgress(0);
    }
  }, [open, isEdit, initialProject]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Project name is required.");
    if (!owner.trim()) return alert("Owner is required.");

    const p = {
      name: name.trim(),
      owner: owner.trim(),
      status,
      progress: Number(progress),
    };

    await onSubmit(p);
  };

  return (
    <div style={styles.backdrop} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ fontWeight: 950 }}>
            {isEdit ? "Edit Project" : "New Project"}
          </div>
          <button onClick={onClose} style={styles.x}>✕</button>
        </div>

        <form onSubmit={submit}>
          <div style={styles.grid}>
            <Field label="Name" value={name} onChange={setName} placeholder="Website Redesign" />
            <Field label="Owner" value={owner} onChange={setOwner} placeholder="Michael Chen" />

            <div>
              <label style={styles.label}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.input}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Progress</label>
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                style={styles.input}
              />
              <div style={styles.help}>0–100</div>
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.btn}>Cancel</button>
            <button type="submit" style={styles.primaryBtn}>
              {isEdit ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    zIndex: 50,
  },
  modal: {
    width: "min(720px, 100%)",
    background: "white",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    padding: 14,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  x: {
    border: "1px solid #e5e7eb",
    background: "white",
    borderRadius: 10,
    cursor: "pointer",
    padding: "6px 10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  label: { fontSize: 12, color: "#6b7280", fontWeight: 900, marginBottom: 6, display: "block" },
  input: {
    width: "100%",
    padding: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    outline: "none",
    background: "white",
  },
  help: { fontSize: 12, color: "#6b7280", marginTop: 6 },

  footer: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 },
  btn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
  },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    cursor: "pointer",
  },
};
