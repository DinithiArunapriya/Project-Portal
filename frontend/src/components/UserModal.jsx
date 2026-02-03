import React from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { USER_ROLES, USER_STATUSES } from "../services/usersApi";

export default function UserModal({ open, mode = "create", initialUser, onClose, onSubmit }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("VIEWER");
  const [status, setStatus] = React.useState("ACTIVE");

  React.useEffect(() => {
    if (!open) return;

    setName(initialUser?.name || "");
    setEmail(initialUser?.email || "");
    setRole(initialUser?.role || "VIEWER");
    setStatus(initialUser?.status || "ACTIVE");
  }, [open, initialUser]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Name is required.");
    if (!email.trim()) return alert("Email is required.");

    await onSubmit({
      name,
      email,
      role,
      status,
    });
  };

  return (
    <div style={styles.backdrop} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <Card>
          <div style={styles.headerRow}>
            <div>
              <div style={styles.title}>{mode === "edit" ? "Edit User" : "New User"}</div>
              <div style={styles.subtitle}>Manage user account settings</div>
            </div>
            <button style={styles.xBtn} onClick={onClose}>✕</button>
          </div>

          <form onSubmit={submit}>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
                  {USER_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
                  {USER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
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
  modal: { width: "min(760px, 100%)" },
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
