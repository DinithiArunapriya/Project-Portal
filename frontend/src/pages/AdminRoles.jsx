// src/pages/AdminRoles.jsx
import React from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNotify } from "../notifications/NotificationProvider";
import { listUsers, updateUser } from "../services/usersApi";

// Simple role config (edit names/permissions as you like)
export const ROLES = {
  SUPER_ADMIN: {
    name: "Super Admin",
    hierarchy: 100,
    permissions: [
      { resource: "users", actions: ["create", "read", "update", "delete"] },
      { resource: "projects", actions: ["create", "read", "update", "delete"] },
      { resource: "tasks", actions: ["create", "read", "update", "delete"] },
      { resource: "reports", actions: ["read", "export"] },
      { resource: "settings", actions: ["update"] },
      { resource: "admin", actions: ["access"] },
    ],
  },
  MANAGER: {
    name: "Manager",
    hierarchy: 80,
    permissions: [
      { resource: "users", actions: ["read", "update"] },
      { resource: "projects", actions: ["create", "read", "update"] },
      { resource: "tasks", actions: ["create", "read", "update"] },
      { resource: "reports", actions: ["read", "export"] },
      { resource: "settings", actions: ["update"] },
      { resource: "admin", actions: ["access"] },
    ],
  },
  HR: {
    name: "HR",
    hierarchy: 60,
    permissions: [
      { resource: "users", actions: ["read", "update"] },
      { resource: "reports", actions: ["read"] },
      { resource: "settings", actions: ["update"] },
    ],
  },
  DEVELOPER: {
    name: "Developer",
    hierarchy: 40,
    permissions: [
      { resource: "projects", actions: ["read"] },
      { resource: "tasks", actions: ["read", "update"] },
      { resource: "reports", actions: ["read"] },
      { resource: "settings", actions: ["update"] },
    ],
  },
  QA: {
    name: "QA",
    hierarchy: 35,
    permissions: [
      { resource: "projects", actions: ["read"] },
      { resource: "tasks", actions: ["read", "update"] },
      { resource: "reports", actions: ["read"] },
      { resource: "settings", actions: ["update"] },
    ],
  },
  DESIGNER: {
    name: "Designer",
    hierarchy: 30,
    permissions: [
      { resource: "projects", actions: ["read"] },
      { resource: "tasks", actions: ["read", "update"] },
      { resource: "reports", actions: ["read"] },
      { resource: "settings", actions: ["update"] },
    ],
  },
};

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(ts) {
  if (!ts) return "Never";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleDateString();
}

function getRoleDotColor(roleKey) {
  const colorMap = {
    SUPER_ADMIN: "#ef4444",
    MANAGER: "#a855f7",
    HR: "#0ea5e9",
    DEVELOPER: "#60a5fa",
    QA: "#f97316",
    DESIGNER: "#14b8a6",
  };
  return colorMap[roleKey] || "#9ca3af";
}

function RoleBadge({ role }) {
  const label = ROLES[role]?.name || role || "Unknown";
  const bg = {
    SUPER_ADMIN: "#fee2e2",
    MANAGER: "#f3e8ff",
    HR: "#e0f2fe",
    DEVELOPER: "#dbeafe",
    QA: "#ffedd5",
    DESIGNER: "#ccfbf1",
  }[role] || "#f3f4f6";

  const fg = {
    SUPER_ADMIN: "#991b1b",
    MANAGER: "#6b21a8",
    HR: "#075985",
    DEVELOPER: "#1e40af",
    QA: "#9a3412",
    DESIGNER: "#0f766e",
  }[role] || "#374151";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        background: bg,
        color: fg,
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      {label}
    </span>
  );
}

export default function AdminRoles() {
  const { user } = useAuth();
  const notify = useNotify();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isManager = user?.role === "MANAGER";

  const [loading, setLoading] = React.useState(false);
  const [users, setUsers] = React.useState([]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");

  const [showRoleEditor, setShowRoleEditor] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [newRole, setNewRole] = React.useState("");

  const refreshUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(Array.isArray(data) ? data : []);
      notify({ type: "success", title: "Loaded", message: "Users refreshed" });
    } catch (e) {
      notify({ type: "error", title: "Error", message: e?.message || "Failed to load users" });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  React.useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const roleStats = React.useMemo(() => {
    const stats = {};
    Object.keys(ROLES).forEach((roleKey) => {
      stats[roleKey] = {
        name: ROLES[roleKey].name,
        count: users.filter((u) => u.role === roleKey).length,
      };
    });
    return stats;
  }, [users]);

  const filteredUsers = React.useMemo(() => {
    let result = [...users];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q)
      );
    }

    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    return result;
  }, [users, searchQuery, roleFilter]);

  const canEditUserRole = React.useCallback(
    (target) => {
      if (!target) return false;

      // Super Admin can edit anyone (including managers)
      if (isSuperAdmin) return true;

      // Manager can edit roles BELOW manager
      if (isManager) {
        const targetLevel = ROLES[target.role]?.hierarchy ?? 0;
        const myLevel = ROLES[user?.role]?.hierarchy ?? 0;
        return targetLevel < myLevel;
      }

      return false;
    },
    [isSuperAdmin, isManager, user?.role]
  );

  const openRoleEditor = (u) => {
    setSelectedUser(u);
    setNewRole(u?.role || "DEVELOPER");
    setShowRoleEditor(true);
  };

  const closeRoleEditor = () => {
    setShowRoleEditor(false);
    setSelectedUser(null);
    setNewRole("");
  };

  const getUserPermissions = (roleKey) => ROLES[roleKey]?.permissions || [];

  const updateUserRole = async () => {
    if (!selectedUser?.id) return;

    if (!canEditUserRole(selectedUser)) {
      notify({ type: "error", title: "Denied", message: "You cannot change this user's role" });
      return;
    }

    if (!newRole || newRole === selectedUser.role) return;

    try {
      await updateUser(selectedUser.id, { role: newRole });

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole, updatedAt: Date.now() } : u))
      );

      notify({ type: "success", title: "Updated", message: "Role updated successfully" });
      closeRoleEditor();
    } catch (e) {
      notify({ type: "error", title: "Error", message: e?.message || "Failed to update role" });
    }
  };

  const viewUserDetails = (u) => {
    notify({
      type: "info",
      title: "User",
      message: `${u?.name || "User"} • ${u?.email || ""}`,
    });
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 950 }}>Role Management</h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280" }}>Manage user roles and permissions</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={refreshUsers} style={styles.grayBtn} disabled={loading}>
            ↻ Refresh
          </button>

          {/* Bulk Update button shown only for super admin (placeholder) */}
          {isSuperAdmin ? (
            <button
              onClick={() =>
                notify({ type: "info", title: "Bulk Update", message: "Bulk update UI not added yet" })
              }
              style={styles.primaryBtn}
            >
              👥 Bulk Update
            </button>
          ) : null}
        </div>
      </div>

      {/* Role Stats */}
      <div style={styles.statsGrid}>
        {Object.entries(roleStats).map(([roleKey, info]) => (
          <div key={roleKey} style={styles.statCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#6b7280" }}>{info.name}</div>
                <div style={{ fontSize: 22, fontWeight: 950 }}>{info.count}</div>
              </div>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: getRoleDotColor(roleKey),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <div style={{ fontWeight: 950 }}>Users & Roles</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>🔎</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                style={styles.searchInput}
              />
            </div>

            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.select}>
              <option value="">All Roles</option>
              {Object.keys(ROLES).map((roleKey) => (
                <option key={roleKey} value={roleKey}>
                  {ROLES[roleKey].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Current Role</th>
                <th style={styles.th}>Last Active</th>
                <th style={styles.th}>Permissions</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={styles.avatar}>{getInitials(u.name)}</div>
                      <div>
                        <div style={{ fontWeight: 950 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <RoleBadge role={u.role} />
                  </td>

                  <td style={styles.td}>{formatDate(u.lastActive || u.updatedAt)}</td>

                  <td style={styles.td}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {getUserPermissions(u.role).map((p) => (
                        <span key={`${p.resource}-${p.actions.join(",")}`} style={styles.permPill}>
                          {p.resource}
                        </span>
                      ))}
                      {getUserPermissions(u.role).length === 0 ? (
                        <span style={{ fontSize: 12, color: "#6b7280" }}>—</span>
                      ) : null}
                    </div>
                  </td>

                  <td style={{ ...styles.td, textAlign: "right" }}>
                    {canEditUserRole(u) ? (
                      <button style={styles.linkBtn} onClick={() => openRoleEditor(u)}>
                        Edit Role
                      </button>
                    ) : null}

                    <button style={{ ...styles.linkBtn, color: "#374151" }} onClick={() => viewUserDetails(u)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 18, textAlign: "center", color: "#6b7280" }}>
                    No users found. Try adjusting your search or filter criteria.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Editor Modal */}
      {showRoleEditor ? (
        <div style={styles.modalOverlay} onMouseDown={closeRoleEditor}>
          <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 950 }}>
              Edit Role: {selectedUser?.name || "User"}
            </h3>

            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              <div>
                <div style={styles.label}>Current Role</div>
                {selectedUser?.role ? <RoleBadge role={selectedUser.role} /> : null}
              </div>

              <div>
                <div style={styles.label}>New Role</div>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={styles.input}>
                  {Object.keys(ROLES).map((roleKey) => (
                    <option key={roleKey} value={roleKey}>
                      {ROLES[roleKey].name} (Level {ROLES[roleKey].hierarchy})
                    </option>
                  ))}
                </select>
              </div>

              {newRole ? (
                <div style={styles.permBox}>
                  <div style={{ fontSize: 12, fontWeight: 950, color: "#374151", marginBottom: 8 }}>
                    New Permissions
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(ROLES[newRole]?.permissions || []).map((p) => (
                      <span key={`${p.resource}-${p.actions.join(",")}`} style={styles.permGreen}>
                        {p.resource}: {p.actions.join(", ")}
                      </span>
                    ))}
                    {(ROLES[newRole]?.permissions || []).length === 0 ? (
                      <span style={{ fontSize: 12, color: "#6b7280" }}>No permissions</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div style={styles.modalActions}>
              <button style={styles.grayBtn} onClick={closeRoleEditor}>
                Cancel
              </button>
              <button
                style={styles.primaryBtn}
                onClick={updateUserRole}
                disabled={!newRole || newRole === selectedUser?.role}
                title={!newRole || newRole === selectedUser?.role ? "Choose a different role" : ""}
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: 12,
  },

  statCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    minWidth: 160,
  },

  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    overflow: "hidden",
  },

  cardHead: {
    padding: 14,
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 900,
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  td: {
    padding: "12px 12px",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "top",
  },
  tr: {},

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    background: "#e0e7ff",
    color: "#3730a3",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
  },

  permPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: "#dbeafe",
    color: "#1e40af",
  },

  linkBtn: {
    background: "transparent",
    border: "none",
    padding: 0,
    marginLeft: 12,
    cursor: "pointer",
    color: "#2563eb",
    fontWeight: 900,
  },

  searchWrap: { position: "relative" },
  searchIcon: { position: "absolute", left: 10, top: 9, fontSize: 14, opacity: 0.7 },
  searchInput: {
    padding: "10px 12px 10px 32px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    width: 220,
  },

  select: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    height: 42,
  },

  grayBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
    cursor: "pointer",
    fontWeight: 900,
    height: 42,
  },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    fontWeight: 900,
    height: 42,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    zIndex: 50,
  },
  modal: {
    width: "min(560px, 100%)",
    background: "white",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    padding: 16,
  },

  label: { fontSize: 12, fontWeight: 950, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" },

  permBox: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 },
  permGreen: {
    display: "inline-flex",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: "#dcfce7",
    color: "#166534",
  },

  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 },
};
