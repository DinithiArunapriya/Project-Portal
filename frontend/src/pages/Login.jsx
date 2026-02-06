// src/pages/Login.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useNotify } from "../notifications/NotificationProvider";
import { loginWithEmail } from "../services/authApi";

const DEMO_USERS = [
  {
    id: "u_super_admin",
    name: "Super Admin",
    email: "superadmin@portal.test",
    password: "Super@123",
    role: "SUPER_ADMIN",
    dept: "Admin",
  },
  {
    id: "u_mgr",
    name: "Manager",
    email: "manager@portal.test",
    password: "Manager@123",
    role: "MANAGER",
    dept: "Management",
  },
  {
    id: "u_dev",
    name: "Developer",
    email: "developer@portal.test",
    password: "Developer@123",
    role: "DEVELOPER",
    dept: "Engineering",
  },
  {
    id: "u_des",
    name: "Designer",
    email: "designer@portal.test",
    password: "Designer@123",
    role: "DESIGNER",
    dept: "Design",
  },
  {
    id: "u_qa",
    name: "QA Engineer",
    email: "qa@portal.test",
    password: "Qa@123",
    role: "QA",
    dept: "Quality",
  },

  {
    id: "u_hr",
    name: "HR",
    email: "hr@portal.test",
    password: "Hr@123",
    role: "HR",
    dept: "Human Resources",
  },
];

const ROLE_META = {
  SUPER_ADMIN: {
    title: "Super Admin",
    desc: "Full system access and user management",
  },
  MANAGER: {
    title: "Manager",
    desc: "Manage projects, teams, and reporting",
  },
  DEVELOPER: {
    title: "Developer",
    desc: "Work on assigned tasks and projects",
  },
  DESIGNER: {
    title: "Designer",
    desc: "Design tasks, collaboration, and reviews",
  },

  QA: {
    title: "QA",
    desc: "QA tasks, collaboration, and reviews",
  },
  HR: {
    title: "HR",
    desc: "Human resources and user management",
  },
};

function initials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function groupUsersByRole(users) {
  return users.reduce((acc, u) => {
    acc[u.role] = acc[u.role] || [];
    acc[u.role].push(u);
    return acc;
  }, {});
}

function redirectByRole(role, navigate) {
  const r = String(role || "").trim().toUpperCase();
  switch (r) {
    case "SUPER_ADMIN":
    case "MANAGER":
      navigate("/dashboard");
      return;
    case "DEVELOPER":
    case "QA":
    case "DESIGNER":
      navigate("/projects");
      return;
    case "HR":
      navigate("/reports");
      return;
    default:
      navigate("/dashboard");
      return;
  }
}

function StatCard({ value, label }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function Accordion({ title, tone = "info", children }) {
  const [open, setOpen] = React.useState(false);
  const tones = {
    info: { bg: "#EFF6FF", border: "#BFDBFE", iconBg: "#DBEAFE", icon: "i" },
    success: { bg: "#ECFDF5", border: "#A7F3D0", iconBg: "#D1FAE5", icon: "?" },
  };
  const t = tones[tone] || tones.info;

  return (
    <button
      type="button"
      onClick={() => setOpen((s) => !s)}
      style={{
        ...styles.accordion,
        background: t.bg,
        borderColor: t.border,
      }}
      aria-expanded={open}
    >
      <div style={styles.accLeft}>
        <div style={{ ...styles.accIcon, background: t.iconBg }}>
          <span style={{ fontWeight: 900 }}>{t.icon}</span>
        </div>
        <div style={{ fontWeight: 900 }}>{title}</div>
      </div>
      <div style={{ fontWeight: 900, opacity: 0.7 }}>{open ? "▴" : "▾"}</div>

      {open ? <div style={styles.accBody}>{children}</div> : null}
    </button>
  );
}

function RoleCard({ roleKey, users, onPick }) {
  const meta = ROLE_META[roleKey] || { title: roleKey, desc: "" };
  return (
    <div style={styles.roleCard}>
      <div style={styles.roleTitle}>{meta.title}</div>
      <div style={styles.roleDesc}>{meta.desc}</div>

      <div style={styles.roleUsersWrap}>
        {users.map((u) => (
          <button key={u.id} type="button" style={styles.userRowBtn} onClick={() => onPick(u)}>
            <div style={styles.avatar}>
              <span style={{ fontWeight: 950, color: "#1F3A8A" }}>{initials(u.name)}</span>
            </div>
            <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
              <div style={styles.userName}>{u.name}</div>
              <div style={styles.userEmail}>{u.email}</div>
              <div style={styles.userDept}>{u.dept}</div>
            </div>
            <div style={{ fontWeight: 900, opacity: 0.45 }}>›</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const notify = useNotify();

  const grouped = React.useMemo(() => groupUsersByRole(DEMO_USERS), []);
  const roleCount = Object.keys(grouped).length;

  const onPickUser = async (u) => {
    try {
      const result = await loginWithEmail(u.email, u.password);
      login({ token: result?.token, user: result?.user });

      notify({
        type: "success",
        title: "Signed in",
        message: `Welcome ${result?.user?.name || u.name} (${result?.user?.role || u.role})`,
      });

      redirectByRole(result?.user?.role || u.role, navigate);
    } catch (e) {
      notify({
        type: "error",
        title: "Login failed",
        message: e?.message || "Could not sign in",
      });
    }
  };

  return (
    <div style={styles.page}>
      {/* Left / Hero */}
      <div style={styles.left}>
        <div style={styles.brandRow}>
          <div style={styles.brandIcon}>〽</div>
          <div>
            <div style={styles.brandName}> Project Portal </div>
            <div style={styles.badgesRow}>
            </div>
          </div>
        </div>

        <div style={styles.hero}>
          <div style={styles.heroSub}>
            Experience the full capabilities of our enterprise project management platform with realistic sample data and
            mock integrations.
          </div>

          <div style={styles.statsGrid}>
            <StatCard value={String(DEMO_USERS.length)} label="Demo Users" />
            <StatCard value="5" label="Sample Projects" />
            <StatCard value={String(roleCount)} label="User Roles" />
          </div>

          <div style={styles.whatTitle}>What You Can Explore</div>
          <ul style={styles.bullets}>
            <li style={styles.bulletItem}>Multiple user roles with different permissions</li>
            <li style={styles.bulletItem}>Complete project lifecycle management</li>
            <li style={styles.bulletItem}>Analytics dashboards and insights</li>
          </ul>
        </div>

        <div style={styles.footerNote}>© {new Date().getFullYear()} All Rights Reserved </div>
      </div>

      {/* Right / Login Panel */}
      <div style={styles.right}>
        <div style={styles.rightCard}>
          <div style={styles.logoCircle}>〽</div>
          <div style={styles.rightTitle}> Project Portal </div>
          <div style={styles.rightPill}>DEMO ENVIRONMENT</div>
          <div style={styles.rightSub}>Select a role below to explore the platform with realistic sample data</div>

          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            <Accordion title="Demo Features & Capabilities" tone="info">
              <div style={styles.accText}>
                • Role-based access (Admin / Manager / Employee roles)
                <br />
                • Projects, Tasks, Users, Reports, Settings
                <br />
                • Admin tools (Roles, Email mappings) for SUPER_ADMIN
              </div>
            </Accordion>

            <Accordion title="How to Use This Demo" tone="success">
              <div style={styles.accText}>
                1) Pick a user card below
                <br />
                2) You will be redirected to the dashboard
                <br />
                3) Use sidebar navigation to explore features
              </div>
            </Accordion>
          </div>

          <div style={styles.chooseTitle}>Choose Your Demo Role</div>

          <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
            {Object.keys(ROLE_META).map((roleKey) =>
              grouped[roleKey]?.length ? (
                <RoleCard key={roleKey} roleKey={roleKey} users={grouped[roleKey]} onPick={onPickUser} />
              ) : null
            )}
          </div>

          <div style={styles.limitBox}>
            <div style={{ fontWeight: 950, color: "#92400E" }}>Important Demo Limitations</div>
            <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "#92400E", lineHeight: 1.6 }}>
              <li>All data is temporary and may reset (demo mode)</li>
              <li>No actual emails are sent (notifications are simulated)</li>
              <li>Integrations use mock data (no real external connections)</li>
              <li>Some advanced features may have reduced functionality</li>
            </ul>
          </div>

          <div style={styles.resetBar}>
            <span style={{ fontWeight: 900 }}>↻</span>
            <span>Data Reset: Demo data may reset when you refresh the page or restart the session</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1.05fr 1.4fr",
    background: "#F3F4F6",
  },

  // Left
  left: {
    padding: 28,
    color: "white",
    background:
      "linear-gradient(135deg, rgba(30,58,138,1) 0%, rgba(37,99,235,1) 55%, rgba(14,165,233,1) 100%)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 12 },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(255,255,255,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 950,
    fontSize: 18,
  },
  brandName: { fontWeight: 950, fontSize: 18, lineHeight: 1.1 },
  badgesRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 },
  badgeDemo: {
    fontSize: 12,
    fontWeight: 950,
    background: "rgba(250, 204, 21, 0.95)",
    color: "#1F2937",
    padding: "3px 10px",
    borderRadius: 999,
  },
  badgeVer: { fontSize: 12, opacity: 0.8, fontWeight: 900 },

  hero: { marginTop: 46, maxWidth: 520 },
  heroTitle: { fontSize: 56, fontWeight: 950, letterSpacing: -1, lineHeight: 1.05 },
  heroSub: { marginTop: 16, fontSize: 18, opacity: 0.92, lineHeight: 1.6 },

  statsGrid: {
    marginTop: 26,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  statCard: {
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 16,
    backdropFilter: "blur(8px)",
  },
  statValue: { fontSize: 34, fontWeight: 950, lineHeight: 1 },
  statLabel: { marginTop: 6, opacity: 0.9, fontWeight: 800 },

  whatTitle: { marginTop: 22, fontSize: 18, fontWeight: 950 },
  bullets: { marginTop: 12, paddingLeft: 18, lineHeight: 1.85, opacity: 0.94 },
  bulletItem: { fontWeight: 800 },
  footerNote: { marginTop: "auto", opacity: 0.75, fontWeight: 800 },

  // Right
  right: {
    padding: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rightCard: {
    width: "min(860px, 100%)",
    background: "white",
    border: "1px solid #E5E7EB",
    borderRadius: 22,
    padding: 26,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 999,
    background: "linear-gradient(135deg, #1D4ED8, #60A5FA)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 950,
    fontSize: 22,
    margin: "0 auto",
  },
  rightTitle: { marginTop: 14, textAlign: "center", fontSize: 28, fontWeight: 950, color: "#111827" },
  rightPill: {
    margin: "10px auto 0",
    width: "fit-content",
    padding: "6px 12px",
    borderRadius: 999,
    background: "#FEF3C7",
    border: "1px solid #FDE68A",
    color: "#92400E",
    fontWeight: 950,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  rightSub: { marginTop: 10, textAlign: "center", color: "#6B7280", fontWeight: 700 },

  accordion: {
    width: "100%",
    textAlign: "left",
    border: "1px solid",
    borderRadius: 14,
    padding: 14,
    cursor: "pointer",
  },
  accLeft: { display: "flex", alignItems: "center", gap: 10 },
  accIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  accBody: { marginTop: 10 },
  accText: { color: "#374151", fontWeight: 700, lineHeight: 1.6 },

  chooseTitle: { marginTop: 18, fontSize: 18, fontWeight: 950, color: "#111827" },

  roleCard: {
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: 16,
    background: "white",
  },
  roleTitle: { fontSize: 18, fontWeight: 950, color: "#111827" },
  roleDesc: { marginTop: 4, color: "#6B7280", fontWeight: 700 },
  roleUsersWrap: { marginTop: 14, display: "grid", gap: 10 },

  userRowBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    padding: 12,
    background: "white",
    cursor: "pointer",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "#DBEAFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userName: { fontWeight: 950, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userEmail: { color: "#6B7280", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userDept: { color: "#9CA3AF", fontWeight: 700, fontSize: 12 },

  limitBox: {
    marginTop: 18,
    borderRadius: 16,
    border: "1px solid #FCD34D",
    background: "#FFFBEB",
    padding: 16,
  },
  resetBar: {
    marginTop: 12,
    borderRadius: 14,
    border: "1px solid #E9D5FF",
    background: "#F5F3FF",
    padding: 12,
    display: "flex",
    gap: 10,
    alignItems: "center",
    color: "#6D28D9",
    fontWeight: 800,
  },
};
