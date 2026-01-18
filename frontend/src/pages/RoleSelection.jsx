import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

const roles = [
  "Super Admin",
  "Business Analyst",
  "Developer",
  "Designer",
  "QA",
  "HR",
];

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    // Navigate to login and pass selected role
    navigate("/login", { state: { role } });
  };

  return (
    <AuthLayout>
      <div style={styles.container}>
        <h2 style={styles.heading}>Select Your Role</h2>
        <p style={styles.subheading}>
          Choose the role you want to use to login to the Project Portal.
        </p>

        <div style={styles.rolesGrid}>
          {roles.map((role, idx) => (
            <button
              key={idx}
              style={styles.roleBtn}
              onClick={() => handleRoleClick(role)}
              onMouseEnter={(e) => (e.target.style.background = "#E5E7EB")}
              onMouseLeave={(e) => (e.target.style.background = "#F9FAFB")}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
};

const styles = {
  container: {
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  heading: {
    fontSize: "28px",
    fontWeight: 600,
    marginBottom: "8px",
  },
  subheading: {
    fontSize: "14px",
    color: "#6B7280",
    marginBottom: "24px",
  },
  rolesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginTop: "24px",
  },
  roleBtn: {
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    background: "#F9FAFB",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s",
    fontSize: "14px",
  },
};

export default RoleSelection;
