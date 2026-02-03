import React from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNotify } from "../notifications/NotificationProvider";

import UserModal from "../components/UserModal";
import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Table, { Th, Td } from "../components/ui/Table";

import { listUsers, createUser, updateUser, deleteUser } from "../services/usersApi";

export default function Users() {
  const { user } = useAuth();
  const notify = useNotify();

  const role = user?.role;
  const isAdmin = role === "SUPER_ADMIN";

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [users, setUsers] = React.useState([]);

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState("create");
  const [selected, setSelected] = React.useState(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listUsers();
      setUsers(data || []);
    } catch (e) {
      const msg = e?.message || "Failed to load users";
      setError(msg);
      notify({ title: "Error", message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  React.useEffect(() => {
    load();
  }, [load]);

  const stats = React.useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const disabled = users.filter((u) => u.status === "DISABLED").length;
    return { total, active, disabled };
  }, [users]);

  const openCreate = () => {
    if (!isAdmin) {
      return notify({ title: "Not allowed", message: "Only SUPER_ADMIN can create users.", type: "error" });
    }
    setMode("create");
    setSelected(null);
    setOpen(true);
  };

  const openEdit = (u) => {
    if (!isAdmin) {
      return notify({ title: "Not allowed", message: "Only SUPER_ADMIN can edit users.", type: "error" });
    }
    setMode("edit");
    setSelected(u);
    setOpen(true);
  };

  const onSubmit = async (payload) => {
    if (!isAdmin) {
      return notify({ title: "Not allowed", message: "Only SUPER_ADMIN can manage users.", type: "error" });
    }

    try {
      if (mode === "edit" && selected?.id) {
        await updateUser(selected.id, payload);
        notify({ title: "Saved", message: "User updated successfully.", type: "success" });
      } else {
        await createUser(payload);
        notify({ title: "Created", message: "User created successfully.", type: "success" });
      }

      setOpen(false);
      await load();
    } catch (e) {
      notify({ title: "Error", message: e?.message || "Save failed", type: "error" });
    }
  };

  const onToggleStatus = async (u) => {
    if (!isAdmin) return notify({ title: "Not allowed", message: "Only SUPER_ADMIN can change status.", type: "error" });

    const next = u.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      await updateUser(u.id, { status: next });
      notify({ title: "Updated", message: `User ${next === "ACTIVE" ? "enabled" : "disabled"}.`, type: "success" });
      await load();
    } catch (e) {
      notify({ title: "Error", message: e?.message || "Update failed", type: "error" });
    }
  };

  const onDelete = async (u) => {
    if (!isAdmin) return notify({ title: "Not allowed", message: "Only SUPER_ADMIN can delete users.", type: "error" });

    const ok = window.confirm(`Delete user "${u.name}"?\n\nThis removes them from local mock storage.`);
    if (!ok) return;

    try {
      await deleteUser(u.id);
      notify({ title: "Deleted", message: "User deleted.", type: "success" });
      await load();
    } catch (e) {
      notify({ title: "Error", message: e?.message || "Delete failed", type: "error" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage team members and roles"
        actions={
          <Button variant="primary" onClick={openCreate} disabled={!isAdmin} title={!isAdmin ? "Only SUPER_ADMIN can create users" : ""}>
            + New User
          </Button>
        }
      />

      {/* Stats */}
      <div style={styles.statsRow}>
        <StatCard label="Total Users" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Disabled" value={stats.disabled} />
      </div>

      {loading ? <Card>Loading users…</Card> : null}
      {error ? <Card style={styles.error}>{error}</Card> : null}

      {!loading && !error ? (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Updated</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <Td>
                    <div style={{ fontWeight: 950 }}>{u.name}</div>
                  </Td>
                  <Td>{u.email}</Td>
                  <Td><Pill>{u.role}</Pill></Td>
                  <Td>
                    <span style={{ ...styles.status, ...(u.status === "ACTIVE" ? styles.active : styles.disabled) }}>
                      {u.status}
                    </span>
                  </Td>
                  <Td>{formatTime(u.updatedAt)}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="ghost" onClick={() => openEdit(u)} disabled={!isAdmin}>Edit</Button>
                      <Button variant="ghost" onClick={() => onToggleStatus(u)} disabled={!isAdmin}>
                        {u.status === "ACTIVE" ? "Disable" : "Enable"}
                      </Button>
                      <Button variant="danger" onClick={() => onDelete(u)} disabled={!isAdmin}>Delete</Button>
                    </div>
                  </Td>
                </tr>
              ))}

              {users.length === 0 ? (
                <tr>
                  <Td colSpan={6}>No users found.</Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </Card>
      ) : null}

      <UserModal
        open={open}
        mode={mode}
        initialUser={selected}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />

      {!isAdmin ? (
        <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
          Note: Only <b>SUPER_ADMIN</b> can create/edit/disable/delete users.
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 900 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 950, marginTop: 6 }}>{value}</div>
    </Card>
  );
}

function Pill({ children }) {
  return <span style={styles.pill}>{children}</span>;
}

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

const styles = {
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 12,
  },
  error: {
    background: "#fee2e2",
    borderColor: "#fecaca",
    color: "#991b1b",
    marginBottom: 12,
  },
  pill: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: "#f3f4f6",
    color: "#374151",
  },
  status: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  active: { background: "#dcfce7", color: "#166534" },
  disabled: { background: "#fee2e2", color: "#991b1b" },
};
