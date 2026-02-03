import React from "react";
import { useNotify } from "../notifications/NotificationProvider";

const KEY = "email_mappings_v1";

function seedIfEmpty() {
  const raw = localStorage.getItem(KEY);
  if (raw) return;

  const seed = [
    { id: "m1", pattern: "@company.com", role: "EMPLOYEE", updatedAt: Date.now() - 3600_000 },
    { id: "m2", pattern: "admin@", role: "SUPER_ADMIN", updatedAt: Date.now() - 7200_000 },
  ];
  localStorage.setItem(KEY, JSON.stringify(seed));
}

function readAll() {
  seedIfEmpty();
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
  return "m_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function EmailMappings() {
  const notify = useNotify();

  const [items, setItems] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState("create"); // create | edit
  const [selected, setSelected] = React.useState(null);

  const [pattern, setPattern] = React.useState("");
  const [role, setRole] = React.useState("EMPLOYEE");

  const load = React.useCallback(() => {
    const data = readAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    setItems(data);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setPattern("");
    setRole("EMPLOYEE");
    setOpen(true);
  };

  const openEdit = (m) => {
    setMode("edit");
    setSelected(m);
    setPattern(m.pattern || "");
    setRole(m.role || "EMPLOYEE");
    setOpen(true);
  };

  const onSave = () => {
    const p = pattern.trim();
    if (!p) {
      notify({ type: "error", title: "Validation", message: "Pattern is required" });
      return;
    }

    const all = readAll();

    if (mode === "edit" && selected?.id) {
      const next = all.map((x) =>
        x.id === selected.id ? { ...x, pattern: p, role, updatedAt: Date.now() } : x
      );
      writeAll(next);
      notify({ type: "success", title: "Updated", message: "Mapping updated" });
    } else {
      const created = { id: makeId(), pattern: p, role, updatedAt: Date.now() };
      writeAll([created, ...all]);
      notify({ type: "success", title: "Created", message: "Mapping created" });
    }

    setOpen(false);
    load();
  };

  const onDelete = (m) => {
    const ok = window.confirm(`Delete mapping "${m.pattern}" → ${m.role}?`);
    if (!ok) return;

    const next = readAll().filter((x) => x.id !== m.id);
    writeAll(next);
    notify({ type: "success", title: "Deleted", message: "Mapping deleted" });
    load();
  };

  return (
    <div>
      <div style={styles.top}>
        <div>
          <h1 style={{ margin: 0 }}>Email Role Mappings</h1>
          <p style={styles.sub}>Auto-assign roles based on email patterns</p>
        </div>

        <button style={styles.primaryBtn} onClick={openCreate}>
          + New Mapping
        </button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Pattern</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Updated</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                {/* ✅ FIX: single style prop */}
                <td style={{ ...styles.td, fontWeight: 900 }}>{m.pattern}</td>

                <td style={styles.td}>{m.role}</td>
                <td style={styles.td}>{new Date(m.updatedAt || 0).toLocaleString()}</td>

                <td style={styles.td}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={styles.btn} onClick={() => openEdit(m)}>
                      Edit
                    </button>
                    <button style={{ ...styles.btn, ...styles.dangerBtn }} onClick={() => onDelete(m)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={4}>
                  No mappings yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {open ? (
        <div style={styles.modalOverlay} onMouseDown={() => setOpen(false)}>
          <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={styles.modalHead}>
              <h3 style={{ margin: 0 }}>{mode === "edit" ? "Edit Mapping" : "New Mapping"}</h3>
              <button style={styles.xBtn} onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              <div>
                <label style={styles.label}>Email Pattern</label>
                <input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder='Example: "@company.com" or "admin@"'
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.btn} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button style={styles.primaryBtn} onClick={onSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  top: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  sub: { margin: "6px 0 0", color: "#6b7280" },

  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 900,
    padding: "10px 8px",
    borderBottom: "1px solid #e5e7eb",
  },
  td: { padding: "12px 8px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" },

  btn: {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontWeight: 900,
  },
  dangerBtn: { borderColor: "#fecaca", background: "#fff1f2" },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    height: 42,
    fontWeight: 900,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  },
  modal: { width: "min(520px, 100%)", background: "white", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14 },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  xBtn: { border: "1px solid #e5e7eb", background: "white", borderRadius: 10, padding: "6px 10px", cursor: "pointer" },

  label: { display: "block", fontSize: 12, fontWeight: 900, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb", outline: "none" },

  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 },
};
