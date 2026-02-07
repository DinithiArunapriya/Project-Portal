// src/pages/AuthDemo.jsx
import React from "react";
import { useAuth } from "../auth/AuthProvider";
import RoleBadge from "../components/RoleBadge"; // if you have it; otherwise see fallback below

export default function AuthDemo() {
  const { user, isAuthenticated } = useAuth();

  // If your AuthProvider doesn't expose these, we compute safe fallbacks:
  const role = user?.role || "";
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];

  const isSuperAdmin = role === "SUPER_ADMIN";
  const isManager = role === "MANAGER" || role === "SUPER_ADMIN";

  const expiresAt = user?.expiresAt || user?.exp || null; // optional
  const isSessionValid = isAuthenticated && (!!user); // simple fallback

  // Helpers that mimic your Nuxt store API
  const hasPermission = React.useCallback(
    (resource, action) => {
      // supports permissions as: [{resource:'projects', actions:['read','create']}]
      return permissions.some(
        (p) => p?.resource === resource && Array.isArray(p.actions) && p.actions.includes(action)
      );
    },
    [permissions]
  );

  const canAccessResource = React.useCallback(
    (resource) => permissions.some((p) => p?.resource === resource),
    [permissions]
  );

  const canCreateResource = React.useCallback(
    (resource) => hasPermission(resource, "create"),
    [hasPermission]
  );

  // Debug logging
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("Auth Demo - Auth State:", {
      isAuthenticated,
      isSessionValid,
      role,
      permissionsCount: permissions.length,
      user,
    });
  }, [isAuthenticated, isSessionValid, role, permissions.length, user]);

  const permissionExamples = [
    {
      title: "Project Permissions",
      permissions: [
        { resource: "projects", action: "read", label: "View Projects" },
        { resource: "projects", action: "create", label: "Create Projects" },
        { resource: "projects", action: "update", label: "Edit Projects" },
        { resource: "projects", action: "delete", label: "Delete Projects" },
      ],
    },
    {
      title: "User Permissions",
      permissions: [
        { resource: "users", action: "read", label: "View Users" },
        { resource: "users", action: "update", label: "Edit User Roles" },
        { resource: "users", action: "delete", label: "Delete Users" },
      ],
    },
    {
      title: "Report Permissions",
      permissions: [
        { resource: "reports", action: "read", label: "View Reports" },
        { resource: "reports", action: "create", label: "Create Reports" },
        { resource: "reports", action: "update", label: "Edit Reports" },
      ],
    },
  ];

  const templateExamples = `// JSX permission checking
{hasPermission('projects','create') && (
  <button>Create Project</button>
)}

{canAccessResource('users') && (
  <div>User management content...</div>
)}

{isSuperAdmin ? <AdminPanel /> : isManager ? <ManagerDashboard /> : <UserDashboard />}

{canCreateResource('projects') && <NewProjectButton />}`;

  const scriptExamples = `// In a React component
const { user, isAuthenticated } = useAuth();

const role = user?.role;
const permissions = user?.permissions || [];

const hasPermission = (resource, action) =>
  permissions.some(p => p.resource === resource && p.actions?.includes(action));

const canEditProject = hasPermission('projects', 'update');

const handleProjectAction = () => {
  if (hasPermission('projects', 'create')) {
    // proceed
  } else {
    // show denied toast
  }
};`;

  const middlewareExamples = `// React Router protection (client-side)
// <RequireRole allow={["SUPER_ADMIN","MANAGER"]}><AuthDemo/></RequireRole>

// API protection is server-side (example)
// requirePermission('projects','create') before creating a project`;

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto", display: "grid", gap: 16 }}>
      {/* Debug Information */}
      <div
        style={{
          background: "#fefce8",
          border: "1px solid #fde68a",
          borderRadius: 12,
          padding: 14,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 950, color: "#92400e", marginBottom: 8 }}>
          Debug Information
        </div>

        <div style={{ fontSize: 13, color: "#a16207", display: "grid", gap: 4 }}>
          <div>
            <strong>Authenticated:</strong> {String(isAuthenticated)}
          </div>
          <div>
            <strong>Session Valid:</strong> {String(isSessionValid)}
          </div>
          <div>
            <strong>User Email:</strong> {user?.email || "Not set"}
          </div>
          <div>
            <strong>Role:</strong> {role || "Not assigned"}
          </div>
          <div>
            <strong>Permissions Count:</strong> {permissions.length}
          </div>
          <div>
            <strong>Expires At:</strong>{" "}
            {expiresAt ? new Date(expiresAt).toLocaleString() : "Not set"}
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 950, color: "#111827" }}>
          Role-Based Authentication System
        </h1>
        <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
          Complete implementation examples and current user permissions
        </p>
      </div>

      {/* Current User Info */}
      <div style={styles.card}>
        <h2 style={styles.h2}>Current User Information</h2>

        <div style={styles.grid2}>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={styles.label}>Name:</div>
              <div style={styles.value}>{user?.name || "Not provided"}</div>
            </div>
            <div>
              <div style={styles.label}>Email:</div>
              <div style={styles.value}>{user?.email || "Not provided"}</div>
            </div>
            <div>
              <div style={styles.label}>Role:</div>
              <div style={{ marginTop: 6 }}>
                {role ? <RoleBadge role={role} /> : <span style={{ color: "#6b7280" }}>No role assigned</span>}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={styles.label}>Authentication Status:</div>
              <div style={{ fontWeight: 950, color: isAuthenticated ? "#16a34a" : "#dc2626" }}>
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </div>
            </div>
            <div>
              <div style={styles.label}>Role Level:</div>
              <div style={styles.value}>{isManager ? "Manager Level" : "Employee Level"}</div>
            </div>
            <div>
              <div style={styles.label}>Admin Status:</div>
              <div style={{ fontWeight: 950, color: isSuperAdmin ? "#7c3aed" : "#6b7280" }}>
                {isSuperAdmin ? "Super Administrator" : "Regular User"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Examples */}
      <div style={styles.card}>
        <h2 style={styles.h2}>Permission Examples</h2>

        <div style={styles.grid3}>
          {permissionExamples.map((ex) => (
            <div key={ex.title} style={styles.exampleCard}>
              <div style={{ fontWeight: 950, marginBottom: 8 }}>{ex.title}</div>

              <div style={{ display: "grid", gap: 8 }}>
                {ex.permissions.map((p) => {
                  const ok = hasPermission(p.resource, p.action);
                  return (
                    <div
                      key={`${p.resource}-${p.action}`}
                      style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
                    >
                      <span style={{ fontSize: 13, color: "#6b7280" }}>{p.label}</span>
                      <span style={{ fontWeight: 950, color: ok ? "#16a34a" : "#dc2626" }}>
                        {ok ? "✔" : "✖"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UI Components with Role Restrictions */}
      <div style={styles.card}>
        <h2 style={styles.h2}>Role-Based UI Components</h2>

        <div style={{ display: "grid", gap: 12 }}>
          {/* Project Management */}
          <div style={styles.block}>
            <div style={styles.blockTitle}>Project Management</div>

            <div style={styles.btnRow}>
              {canCreateResource("projects") ? (
                <button style={{ ...styles.btn, ...styles.primary }}>＋ Create Project</button>
              ) : null}

              {hasPermission("projects", "update") ? (
                <button style={{ ...styles.btn, background: "#2563eb", color: "white", border: "1px solid #2563eb" }}>
                  ✎ Edit Projects
                </button>
              ) : null}

              {hasPermission("projects", "delete") ? (
                <button style={{ ...styles.btn, background: "#dc2626", color: "white", border: "1px solid #dc2626" }}>
                  🗑 Delete Projects
                </button>
              ) : null}

              {!canAccessResource("projects") ? (
                <span style={{ color: "#6b7280", fontStyle: "italic" }}>No project permissions</span>
              ) : null}
            </div>
          </div>

          {/* User Management */}
          <div style={styles.block}>
            <div style={styles.blockTitle}>User Management</div>

            <div style={styles.btnRow}>
              {canAccessResource("users") ? (
                <button style={{ ...styles.btn, background: "#16a34a", color: "white", border: "1px solid #16a34a" }}>
                  👥 View Users
                </button>
              ) : null}

              {hasPermission("users", "update") ? (
                <button style={{ ...styles.btn, background: "#7c3aed", color: "white", border: "1px solid #7c3aed" }}>
                  🧑‍💼 Edit User Roles
                </button>
              ) : null}

              {!canAccessResource("users") ? (
                <span style={{ color: "#6b7280", fontStyle: "italic" }}>No user management permissions</span>
              ) : null}
            </div>
          </div>

          {/* Reports */}
          <div style={styles.block}>
            <div style={styles.blockTitle}>Reports & Analytics</div>

            <div style={styles.btnRow}>
              {canAccessResource("reports") ? (
                <button style={{ ...styles.btn, background: "#4f46e5", color: "white", border: "1px solid #4f46e5" }}>
                  📊 View Reports
                </button>
              ) : null}

              {hasPermission("reports", "create") ? (
                <button style={{ ...styles.btn, background: "#f97316", color: "white", border: "1px solid #f97316" }}>
                  ➕ Create Reports
                </button>
              ) : null}

              {!canAccessResource("reports") ? (
                <span style={{ color: "#6b7280", fontStyle: "italic" }}>No reporting permissions</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div style={styles.card}>
        <h2 style={styles.h2}>Implementation Examples</h2>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <div style={styles.blockTitle}>Template Usage Examples</div>
            <pre style={styles.code}>{templateExamples}</pre>
          </div>

          <div>
            <div style={styles.blockTitle}>Script Usage Examples</div>
            <pre style={styles.code}>{scriptExamples}</pre>
          </div>

          <div>
            <div style={styles.blockTitle}>Protection Examples</div>
            <pre style={styles.code}>{middlewareExamples}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * If you don't have RoleBadge component yet, use this quick fallback:
 *
 * export default function RoleBadge({ role }) {
 *   return (
 *     <span style={{ padding:"4px 10px", borderRadius:999, fontWeight:900, fontSize:12, background:"#f3f4f6" }}>
 *       {role}
 *     </span>
 *   );
 * }
 */

const styles = {
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
  },
  h2: { margin: "0 0 12px", fontSize: 18, fontWeight: 950 },
  label: { fontSize: 13, fontWeight: 900, color: "#374151" },
  value: { marginTop: 4, color: "#111827", fontWeight: 900 },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  exampleCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
  },

  block: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 },
  blockTitle: { fontWeight: 950, marginBottom: 10 },

  btnRow: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" },
  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontWeight: 950,
  },
  primary: { background: "#111827", color: "white", borderColor: "#111827" },

  code: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    overflowX: "auto",
    fontSize: 12,
    lineHeight: 1.5,
    margin: 0,
    whiteSpace: "pre",
  },
};
