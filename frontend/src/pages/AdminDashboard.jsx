import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useNotify } from "../notifications/NotificationProvider";
import { listUsers } from "../services/usersApi";

// Simple initials helper
function getInitials(name) {
  if (!name) return "A";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatActivityTime(ts) {
  const now = Date.now();
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return "—";
  const diffMin = Math.floor((now - t) / (1000 * 60));
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffMin < 1440) return `${diffHr}h ago`;
  return `${Math.floor(diffMin / 1440)}d ago`;
}

function activityIcon(type) {
  const map = {
    user_login: "🔐",
    user_created: "➕",
    role_changed: "👤",
    email_mapping: "✉️",
    system: "⚙️",
  };
  return map[type] || "ℹ️";
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const notify = useNotify();

  const name = user?.name || "Admin";
  const role = user?.role;

  const isAdmin = role === "SUPER_ADMIN" || role === "MANAGER";

  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    emailMappings: 0,
    activeSessions: 0,
    usersOnlineNow: 0,
  });

  const [recentActivity, setRecentActivity] = React.useState([]);
  const [loadingActivity, setLoadingActivity] = React.useState(false);

  const [showAuthDemo, setShowAuthDemo] = React.useState(false);

  // If you want a hard-stop inside component as well (route already protects)
  React.useEffect(() => {
    if (!isAdmin) {
      notify({
        type: "error",
        title: "Access denied",
        message: "Admin privileges required.",
      });
    }
  }, [isAdmin, notify]);

  const fetchStats = React.useCallback(async () => {
    try {
      const users = await listUsers();
      const all = Array.isArray(users) ? users : [];

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const newThisMonth = all.filter((u) => {
        const d = new Date(u.createdAt || u.updatedAt || 0);
        return d >= monthStart;
      }).length;

      // Mock numbers for now (replace when backend is ready)
      const activeSessions = Math.max(1, Math.floor(all.length * 0.3));
      const usersOnlineNow = Math.max(0, Math.floor(all.length * 0.1));
      const emailMappings = 6; // TODO: replace with real store/API later

      setStats({
        totalUsers: all.length,
        newUsersThisMonth: newThisMonth,
        emailMappings,
        activeSessions,
        usersOnlineNow,
      });
    } catch (e) {
      notify({
        type: "error",
        title: "Admin Dashboard",
        message: e?.message || "Failed to load admin stats",
      });
    }
  }, [notify]);

  const refreshActivity = React.useCallback(async () => {
    setLoadingActivity(true);
    try {
      // Mock activity feed (replace with API later)
      await new Promise((r) => setTimeout(r, 700));
      setRecentActivity([
        {
          id: "a1",
          type: "user_login",
          description: "John Doe logged in",
          timestamp: Date.now() - 5 * 60 * 1000,
        },
        {
          id: "a2",
          type: "role_changed",
          description: "Jane Smith’s role was updated to MANAGER",
          timestamp: Date.now() - 30 * 60 * 1000,
        },
        {
          id: "a3",
          type: "user_created",
          description: "New user Bob Wilson was created",
          timestamp: Date.now() - 2 * 60 * 60 * 1000,
        },
        {
          id: "a4",
          type: "email_mapping",
          description: "Email mapping added for developer@company.com",
          timestamp: Date.now() - 4 * 60 * 60 * 1000,
        },
      ]);
    } catch (e) {
      notify({
        type: "error",
        title: "Recent Activity",
        message: e?.message || "Failed to refresh activity",
      });
    } finally {
      setLoadingActivity(false);
    }
  }, [notify]);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        await Promise.all([fetchStats(), refreshActivity()]);
        if (mounted) setLoading(false);
      } catch {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchStats, refreshActivity]);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Admin Dashboard</h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
            Manage users, roles, and system settings
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Welcome back, {name}</div>
          <div style={styles.avatar}>
            <span style={{ color: "#4f46e5", fontWeight: 900 }}>{getInitials(name)}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          footer={
            <span>
              <b style={{ color: "#16a34a" }}>+{stats.newUsersThisMonth}</b> this month
            </span>
          }
        />

        <StatCard
          title="Email Mappings"
          value={stats.emailMappings}
          icon="✉️"
          footer={
            <Link to="/admin/email-mappings" style={styles.inlineLink}>
              Manage mappings →
            </Link>
          }
        />

        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon="✅"
          footer={
            <span>
              <b style={{ color: "#16a34a" }}>{stats.usersOnlineNow}</b> online now
            </span>
          }
        />

        <StatCard
          title="System Status"
          value="Healthy"
          icon="🛡️"
          valueStyle={{ color: "#059669", fontSize: 18 }}
          footer={
            <span>
              <b style={{ color: "#059669" }}>99.9%</b> uptime
            </span>
          }
        />
      </div>

      {/* Quick actions */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Quick Actions</h2>

        <div style={styles.actionsGrid}>
          <ActionLink
            to="/admin/roles"
            title="Manage User Roles"
            desc="Assign and modify user permissions"
            icon="👤"
          />

          <ActionLink
            to="/admin/email-mappings"
            title="Email Role Mappings"
            desc="Configure automatic role assignments"
            icon="✉️"
          />

          <ActionLink to="/users" title="User Management" desc="View and manage all users" icon="👥" />

          <ActionLink to="/settings" title="System Settings" desc="Configure system preferences" icon="⚙️" />

          <ActionLink to="/reports" title="Reports" desc="View system and user reports" icon="📊" />

          <button
            type="button"
            onClick={() => setShowAuthDemo(true)}
            style={{ ...styles.actionCard, textAlign: "left", cursor: "pointer" }}
          >
            <div style={styles.actionIcon}>🛡️</div>
            <div>
              <div style={styles.actionTitle}>Auth Demo</div>
              <div style={styles.actionDesc}>Test authentication features</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.card}>
        <div style={styles.cardHeadRow}>
          <h2 style={styles.cardTitle}>Recent Activity</h2>

          <button
            type="button"
            onClick={refreshActivity}
            style={styles.linkBtn}
            disabled={loadingActivity}
          >
            {loadingActivity ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading || loadingActivity ? (
          <div style={{ padding: 18, color: "#6b7280" }}>Loading activity...</div>
        ) : recentActivity.length === 0 ? (
          <div style={{ padding: 18, color: "#6b7280" }}>No recent activity</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {recentActivity.map((a) => (
              <div key={a.id} style={styles.activityRow}>
                <div style={styles.activityIcon}>{activityIcon(a.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: "#111827" }}>{a.description}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {formatActivityTime(a.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auth Demo Modal */}
      {showAuthDemo ? (
        <div style={styles.modalOverlay} onMouseDown={() => setShowAuthDemo(false)}>
          <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={styles.modalHead}>
              <h3 style={{ margin: 0 }}>Authentication Demo</h3>
              <button style={styles.xBtn} onClick={() => setShowAuthDemo(false)}>
                ✕
              </button>
            </div>

            <p style={{ color: "#6b7280", marginTop: 8 }}>
              This will open the authentication demo page where you can test various auth features.
            </p>

            <div style={styles.modalActions}>
              <button style={styles.btn} onClick={() => setShowAuthDemo(false)}>
                Cancel
              </button>

              <Link
                to="/admin/auth-demo"
                onClick={() => setShowAuthDemo(false)}
                style={{ ...styles.primaryBtn, textDecoration: "none", display: "inline-flex" }}
              >
                Open Demo
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ title, value, icon, footer, valueStyle }) {
  return (
    <div style={styles.statCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={styles.statIcon}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#6b7280" }}>{title}</div>
          <div style={{ fontSize: 26, fontWeight: 950, color: "#111827", marginTop: 4, ...valueStyle }}>
            {value}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>{footer}</div>
    </div>
  );
}

function ActionLink({ to, title, desc, icon }) {
  return (
    <Link to={to} style={{ ...styles.actionCard, textDecoration: "none", color: "#111827" }}>
      <div style={styles.actionIcon}>{icon}</div>
      <div>
        <div style={styles.actionTitle}>{title}</div>
        <div style={styles.actionDesc}>{desc}</div>
      </div>
    </Link>
  );
}

const styles = {
  page: { padding: 16, display: "grid", gap: 14 },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e5e7eb",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },

  statCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  },

  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    border: "1px solid #e5e7eb",
  },

  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  },

  cardTitle: { margin: 0, fontSize: 16, fontWeight: 950 },

  cardHeadRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    marginTop: 12,
  },

  actionCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    background: "#ffffff",
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e5e7eb",
    fontSize: 18,
  },

  actionTitle: { fontWeight: 950 },
  actionDesc: { color: "#6b7280", fontSize: 13, marginTop: 4 },

  activityRow: {
    display: "flex",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #f3f4f6",
    background: "#fafafa",
  },

  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  linkBtn: {
    border: "1px solid #e5e7eb",
    background: "white",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
  },

  inlineLink: {
    color: "#7c3aed",
    fontWeight: 900,
    textDecoration: "none",
  },

  btn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontWeight: 900,
  },

  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    cursor: "pointer",
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

  modal: {
    width: "min(520px, 100%)",
    background: "white",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    padding: 14,
  },

  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  xBtn: {
    border: "1px solid #e5e7eb",
    background: "white",
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer",
  },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 },
};

<div style={styles.card}>
  <h2 style={styles.cardTitle}>Quick Actions</h2>

  <div style={styles.actionsGrid}>
    <ActionLink
      to="/admin/roles"
      title="Manage User Roles"
      desc="Assign and modify user permissions"
      icon="👤"
    />

    <ActionLink
      to="/users"
      title="User Management"
      desc="View and manage all users"
      icon="👥"
    />

    <ActionLink
      to="/settings"
      title="System Settings"
      desc="Configure system preferences"
      icon="⚙️"
    />

    <ActionLink
      to="/reports"
      title="Reports"
      desc="View system and user reports"
      icon="📊"
    />
  </div>
</div>
