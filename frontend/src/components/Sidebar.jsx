import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const loggedInUser = "John Doe"; // Replace with backend username later

  const NavButton = ({ children, onClick }) => (
    <button
      style={styles.navBtn}
      onClick={onClick}
      onMouseEnter={(e) => (e.target.style.background = "#1F2937")}
      onMouseLeave={(e) => (e.target.style.background = "transparent")}
    >
      {children}
    </button>
  );

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <h3 style={styles.logo}>Project Portal</h3>

      {/* Navigation Buttons */}
      <div style={styles.navGroup}>
        <NavButton onClick={() => navigate("/dashboard")}>Dashboard</NavButton>
        <NavButton onClick={() => navigate("/projects")}>Projects</NavButton>
        <NavButton onClick={() => navigate("/users")}>Users</NavButton>
        <NavButton onClick={() => navigate("/tasks")}>My Tasks</NavButton>
        <NavButton onClick={() => navigate("/reports")}>Reports</NavButton>
        <NavButton onClick={() => navigate("/settings")}>Settings</NavButton>
        <NavButton onClick={() => navigate("/admin")}>Admin Panel</NavButton>
      </div>

       {/* User info & logout at bottom */}
      <div style={styles.bottom}>
        <div style={styles.user}>
          {/* Optional icon placeholder */}
          <span style={styles.userIcon}>👤</span> {loggedInUser}
        </div>
        <button style={styles.logoutBtn} onClick={() => alert("Logout clicked")}>
          🔒 Logout
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "240px",
    background: "#0F172A",
    color: "#E5E7EB",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100vh",
    position: "sticky",
    top: 0, // keeps sidebar fixed
  },
  logo: { marginBottom: "32px", fontSize: "20px", fontWeight: 700, color: "#fff" },
  navGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  navBtn: {
    background: "transparent",
    border: "none",
    color: "#E5E7EB",
    textAlign: "left",
    padding: "12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  bottom: { display: "flex", flexDirection: "column", gap: "12px", marginTop: "auto" },
  user: { fontSize: "14px", fontWeight: 500 },
  logoutBtn: {
    background: "#F9FAFB",
    border: "none",
    borderRadius: "6px",
    padding: "8px",
    fontWeight: 500,
    color: "#111827",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default Sidebar;
