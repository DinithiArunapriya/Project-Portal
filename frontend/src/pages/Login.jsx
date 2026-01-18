import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Receive role from previous page
  const selectedRole = location.state?.role || "Not selected";

  return (
    <AuthLayout>
      <h2 style={styles.heading}>Welcome Back</h2>
      <p style={styles.subheading}>Sign in to access your dashboard</p>

      {/* Display Selected Role */}
      <div style={styles.roleInfo}>Role: <strong>{selectedRole}</strong></div>

      <input type="email" placeholder="Email Address" style={styles.input} />
      <input type="password" placeholder="Password" style={styles.input} />

      <button
        style={styles.loginBtn}
        onClick={() => navigate("/dashboard")}
        onMouseEnter={(e) => (e.target.style.background = "#374151")}
        onMouseLeave={(e) => (e.target.style.background = "#111827")}
      >
        Login
      </button>
    </AuthLayout>
  );
};

const styles = {
  heading: {
    fontSize: "28px",
    fontWeight: 600,
    textAlign: "center",
    marginBottom: "8px",
  },
  subheading: {
    fontSize: "16px",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: "16px",
  },
  roleInfo: {
    fontSize: "14px",
    color: "#374151",
    textAlign: "center",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    marginBottom: "16px",
    fontSize: "14px",
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "#111827",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default Login;
