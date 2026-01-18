import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>{children}</main>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
  },
  main: {
    flex: 1,
    padding: "24px",
    overflowY: "auto", // main content scrolls
    maxHeight: "100vh", // prevents stretching below viewport
    boxSizing: "border-box",
  },
};

export default MainLayout;
