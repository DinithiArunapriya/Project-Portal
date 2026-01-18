const Footer = ({ center }) => {
  return (
    <footer style={{ ...styles.footer, justifyContent: center ? "center" : "space-between" }}>
      <span>© 2026 DTA LLC | All Rights Reserved. </span>
      <span style={styles.logo}>🚀</span>
    </footer>
  );
};

const styles = {
  footer: {
    display: "flex",
    alignItems: "center",
    paddingTop: "20px",
    fontSize: "14px",
    color: "#9CA3AF",
    gap: "8px",
  },
  logo: {
    fontSize: "18px",
  },
};

export default Footer;
