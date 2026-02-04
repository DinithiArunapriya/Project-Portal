import React from "react";
import { useNotify } from "../notifications/NotificationProvider";

import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Table, { Th, Td } from "../components/ui/Table";

import UserModal from "../components/UserModal";
import { listUsers, createUser, updateUser, deleteUser, USER_ROLES } from "../services/usersApi";

export default function Users() {
  const notify = useNotify();

  const [users, setUsers] = React.useState([]); // ALWAYS array
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState("create"); // create | edit
  const [selected, setSelected] = React.useState(null);

  // Filters
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState("ALL");
  const [activeOnly, setActiveOnly] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      // Don't break UI
      console.warn("Users load failed:", e);
      setUsers([]);
      // If you want ZERO UI noise, comment this out:
      // notify({ title: "Warning", message: "Users not available right now", type: "info" });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const text = q.trim().toLowerCase();

    return (Array.isArray(users) ? users : []).filter((u) => {
      const name = String(u?.name || "").toLowerCase();
      const email = String(u?.email || "").toLowerCase();
      const dept = String(u?.department || "").toLowerCase();
      const uRole = String(u?.role || "");
      const isActive = !!u?.isActive;

      const matchesText = !text || name.includes(text) || email.includes(text) || dept.includes(text);
      const matchesRole = role === "ALL" || uRole === role;
      const matchesActive = !activeOnly || isActive;

      return matchesText && matchesRole && matchesActive;
    });
  }, [users, q, role, activeOnly]);

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setOpen(true);
  };

  const openEdit = (u) => {
    setMode("edit");
    setSelected(u);
    setOpen(true);
  };

  const onSubmit = async (payload) => {
    try {
      if (mode === "edit" && selected?.id) {
        await updateUser(selected.id, payload);
        notify({ title: "Saved", message: "User updated", type: "success" });
      } else {
        await createUser(payload);
        notify({ title: "Created", message: "User created", type: "success" });
      }
      setOpen(false);
      await load();
    } catch (e) {
      console.warn("Save user failed:", e);
      // Don't break UI
      notify({ title: "Save failed", message: e?.message || "Could not save user", type: "error" });
    }
  };

  const onDelete = async (u) => {
    const ok = window.confirm(`Delete user "${u?.name || "this user"}"?`);
    if (!ok) return;

    try {
      await deleteUser(u.id);
      notify({ title: "Deleted", message: "User deleted", type: "success" });
      await load();
    } catch (e) {
      console.warn("Delete user failed:", e);
      notify({ title: "Delete failed", message: e?.message || "Could not delete user", type: "error" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage users and roles"
        actions={
          <Button variant="primary" onClick={openCreate}>
            + New User
          </Button>
        }
      />

      {/* Filters */}
      <Card style={{ marginBottom: 12 }}>
        <div style={styles.filtersTop}>
          <div style={{ fontSize: 22, fontWeight: 950 }}>Filters</div>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setRole("ALL");
              setActiveOnly(false);
            }}
            style={styles.linkBtnStrong}
          >
            Clear All
          </button>
        </div>

        <div style={styles.filtersGrid}>
          <div>
            <div style={styles.label}>Search</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users by name, email, dept..."
              style={styles.input}
            />
          </div>

          <div>
            <div style={styles.label}>Role</div>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
              <option value="ALL">All Roles</option>
              {(USER_ROLES || []).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 26 }}>
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <div style={{ fontWeight: 900, color: "#111827" }}>Active only</div>
          </div>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Card>Loading users…</Card>
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Department</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <Td colSpan={6} style={{ textAlign: "center", color: "#6b7280" }}>
                    No users to show.
                  </Td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <Td style={{ fontWeight: 950 }}>{u?.name || "—"}</Td>
                    <Td>{u?.email || "—"}</Td>
                    <Td>{u?.department || "—"}</Td>
                    <Td>
                      <span style={styles.pill}>{u?.role || "—"}</span>
                    </Td>
                    <Td>{u?.isActive ? "Active" : "Inactive"}</Td>
                    <Td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button variant="ghost" onClick={() => openEdit(u)}>
                          Edit
                        </Button>
                        <Button variant="danger" onClick={() => onDelete(u)}>
                          Delete
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      )}

      <UserModal open={open} mode={mode} initial={selected} onClose={() => setOpen(false)} onSubmit={onSubmit} />
    </div>
  );
}

const styles = {
  filtersTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  filtersGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },

  label: { fontSize: 13, fontWeight: 900, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", outline: "none" },
  select: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "white" },

  linkBtnStrong: { border: "none", background: "transparent", cursor: "pointer", color: "#1f3a8a", fontWeight: 900 },

  pill: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: "#f3f4f6",
    color: "#374151",
  },
};
