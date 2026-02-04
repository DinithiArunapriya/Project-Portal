// src/components/UserModal.jsx
import React from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { USER_ROLES } from "../services/usersApi";

export default function UserModal({ open, mode, initial, onClose, onSubmit }) {
  const isEdit = mode === "edit";

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    department: "",
    role: "VIEWER",
    isActive: true,
    password: "",
  });

  React.useEffect(() => {
    if (!open) return;

    if (isEdit && initial) {
      setForm({
        name: initial.name || "",
        email: initial.email || "",
        department: initial.department || "",
        role: initial.role || "VIEWER",
        isActive: initial.isActive ?? true,
        password: "", // blank by default on edit
      });
    } else {
      setForm({
        name: "",
        email: "",
        department: "",
        role: "VIEWER",
        isActive: true,
        password: "",
      });
    }
  }, [open, isEdit, initial]);

  if (!open) return null;

  const submit = () => {
    const payload = {
      name: form.name,
      email: form.email,
      department: form.department,
      role: form.role,
      isActive: form.isActive,
      // password required on create; optional on edit
      ...(form.password ? { password: form.password } : {}),
    };

    // Frontend validation
    if (!String(form.name).trim()) return alert("Name is required");
    if (!String(form.email).trim()) return alert("Email is required");
    if (!isEdit && !String(form.password).trim()) return alert("Password is required");

    onSubmit(payload);
  };

  return (
    <div style={styles.backdrop} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <Card>
          <div style={styles.header}>
            <div style={{ fontSize: 18, fontWeight: 950, color: "#0f172a" }}>
              {isEdit ? "Edit User" : "New User"}
            </div>
            <button style={styles.x} onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          <div style={styles.grid}>
            <Field label="Name">
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                style={styles.input}
                placeholder="Full name"
              />
            </Field>

            <Field label="Email">
              <input
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                style={styles.input}
                placeholder="email@company.com"
              />
            </Field>

            <Field label="Department">
              <input
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                style={styles.input}
                placeholder="Engineering"
              />
            </Field>

            <Field label="Role">
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                style={styles.input}
              >
                {(USER_ROLES || []).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={isEdit ? "New Password (optional)" : "Password"}>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                style={styles.input}
                placeholder={isEdit ? "Leave blank to keep current password" : "Set password"}
              />
            </Field>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24 }}>
              <input
                type="checkbox"
                checked={!!form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                style={{ width: 18, height: 18 }}
              />
              <div style={{ fontWeight: 900, color: "#111827" }}>Active</div>
            </div>
          </div>

          <div style={styles.footer}>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={submit}>
              {isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </Card>
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

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  },
  modal: { width: "100%", maxWidth: 760 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  x: { border: "none", background: "transparent", cursor: "pointer", fontSize: 16, fontWeight: 900 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 },
  label: { fontSize: 13, fontWeight: 900, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", outline: "none" },
  footer: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 },
};
