import Footer from "../components/Footer";

const AuthLayout = ({ children }) => {
  return (
    <div style={styles.wrapper}>
      {/* Left informative pane */}
      <div style={styles.left}>
        <div style={styles.infoContainer}>
          <h2 style={styles.title}>Welcome to Project Portal</h2>
          <p style={styles.subtitle}>
            Centralized access to projects, teams, and delivery insights.
          </p>

          {/* Cards Grid */}
          <div style={styles.cardsGrid}>
            <div style={styles.card}>
              <h3>24 Projects</h3>
              <p>Ongoing and completed projects across all teams.</p>
            </div>
            <div style={styles.card}>
              <h3>12 Teams</h3>
              <p>Collaborating efficiently to deliver results.</p>
            </div>
            <div style={styles.card}>
              <h3>6 Reports</h3>
              <p>Insights & analytics to guide your decisions.</p>
            </div>
            <div style={styles.card}>
              <h3>5 Quick Actions</h3>
              <p>Manage tasks, projects, and teams with one click.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer center />
      </div>

      {/* Right pane for login / role selection */}
      <div style={styles.right}>
        <div style={styles.formWrapper}>{children}</div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    height: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  left: {
    background: "#0F172A",
    color: "#E5E7EB",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  infoContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    justifyContent: "center",
  },
  title: {
    fontSize: "36px",
    fontWeight: 700,
  },
  subtitle: {
    fontSize: "16px",
    color: "#9CA3AF",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  card: {
    background: "#1E293B",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    color: "#E5E7EB",
    lineHeight: "1.5",
  },
  right: {
    background: "#F3F4F6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "80px 60px",
  },
  formWrapper: {
    width: "100%",
    maxWidth: "400px", // keeps the form balanced
    display: "flex",
    flexDirection: "column",
    gap: "32px", // more space vertically
    justifyContent: "center",
    alignItems: "center",
  },
};

export default AuthLayout;
