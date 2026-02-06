import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { loginWithEmail } from "../services/authApi";

const redirectByRole = (role, navigate) => {
  const r = String(role || "").trim().toUpperCase();

  // Optional: normalize common variations
  const normalized = r === "SUPER ADMIN" ? "SUPER_ADMIN" : r;

  switch (normalized) {
    case "SUPER_ADMIN":
      navigate("/admin");
      return;

    case "MANAGER":
      navigate("/dashboard");
      return;

    case "DEVELOPER":
      navigate("/projects");
      return;

    case "QA":
      navigate("/tasks");
      return;

    case "DESIGNER":
      navigate("/projects");
      return;

    case "HR":
      navigate("/users");
      return;

    default:
      navigate("/dashboard");
      return;
  }
};



export default function AuthLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await loginWithEmail(email, password);
      login({ token: result?.token, user: result?.user });
      redirectByRole(result?.user?.role, navigate);
    } catch (err) {
      setError(err?.message || "Invalid email or password");
    }
  };

  return (
    <div style={styles.page}>
      {/* LEFT PANE */}
      <div style={styles.leftPane}>
        <div style={styles.leftInner}>
          <div style={styles.brandRow}>
            <div style={styles.logoDot} />
            <div>
              <div style={styles.brandTitle}>Project Portal</div>
              <div style={styles.brandSub}>Access your workspace securely</div>
            </div>
          </div>

          <div style={styles.bigHeadline}>All your work, in one place.</div>
          <div style={styles.leftText}>
            Manage projects, tasks, and teams efficiently with role-based access.
            Use credentials shared by your administrator.
          </div>

          {/* 4 GRID CARDS */}
          <div style={styles.grid4}>
            <InfoCard title="Projects" desc="Track status, progress & ownership" icon="📁" />
            <InfoCard title="Tasks" desc="Assign, prioritize & follow deadlines" icon="✅" />
            <InfoCard title="Teams" desc="Role-based access for each user" icon="👥" />
            <InfoCard title="Reports" desc="Basic summaries & progress insights" icon="📊" />
          </div>

          <div style={styles.leftNote}>
            <b>Note:</b> If you don’t have access, please contact your <b>Super Admin</b>.
          </div>
        </div>
      </div>
      

      {/* RIGHT PANE */}
      <div style={styles.rightPane}>
        <form onSubmit={onLogin} style={styles.card}>
          <div style={styles.welcome}>Welcome back</div>
          <div style={styles.subtitle}>
            Login with the email and password provided by your administrator.
          </div>

          {error ? <div style={styles.error}>{error}</div> : null}

          <div style={styles.field}>
            <div style={styles.label}>Email</div>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <div style={styles.label}>Password</div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.primaryBtn}>
            Sign in
          </button>

          <div style={styles.smallHint}>
            By signing in, you agree to follow internal access policies.
          </div>
        </form>
      </div>
    </div>
  );
}

function InfoCard({ title, desc, icon }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoIcon}>{icon}</div>
      <div style={{ fontWeight: 950, marginBottom: 4 }}>{title}</div>
      <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.35 }}>{desc}</div>
    </div>
  );
}

/* ---------------- styles ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    background: "#f8fafc",
  },

  /* Left */
  leftPane: {
    background: "linear-gradient(135deg, #2563eb, #1e40af)",
    color: "white",
    display: "flex",
    alignItems: "center",
    padding: 60,
  },
  leftInner: {
    maxWidth: 620,
    width: "100%",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },
  logoDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    background: "rgba(255,255,255,0.9)",
    boxShadow: "0 0 0 6px rgba(255,255,255,0.12)",
  },
  brandTitle: {
    fontWeight: 950,
    fontSize: 18,
    letterSpacing: 0.3,
  },
  brandSub: {
    fontSize: 13,
    opacity: 0.85,
    marginTop: 2,
  },
  bigHeadline: {
    fontSize: 38,
    fontWeight: 950,
    lineHeight: 1.05,
    marginBottom: 14,
  },
  leftText: {
    fontSize: 15,
    lineHeight: 1.7,
    opacity: 0.95,
    marginBottom: 22,
    maxWidth: 560,
  },

  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
    marginTop: 10,
    marginBottom: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(6px)",
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.18)",
    marginBottom: 10,
    fontSize: 16,
  },
  leftNote: {
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    lineHeight: 1.55,
  },

  /* Right */
  rightPane: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    padding: 24,
  },
  card: {
    width: 380,
    background: "white",
    padding: 28,
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  },
  welcome: {
    fontSize: 26,
    fontWeight: 950,
    marginBottom: 8,
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 1.5,
    marginBottom: 18,
  },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: 900, color: "#475569", marginBottom: 6 },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
  },
  primaryBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: 950,
    cursor: "pointer",
    marginTop: 6,
  },
  smallHint: {
    marginTop: 14,
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 1.4,
    textAlign: "center",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: 800,
    textAlign: "center",
    border: "1px solid #fecaca",
  },
};
