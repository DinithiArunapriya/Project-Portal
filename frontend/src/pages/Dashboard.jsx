import MainLayout from "../layouts/MainLayout";
import { useNavigate } from "react-router-dom"; // ✅ import navigate
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const Dashboard = () => {
  const navigate = useNavigate(); // ✅ initialize navigate

  const projects = [
    { title: "Customer Portal Revamp", status: "Ongoing", priority: "High" },
    { title: "Mobile App Redesign", status: "Completed", priority: "Medium" },
    { title: "API Migration", status: "Blocked", priority: "High" },
    { title: "Marketing Website", status: "Ongoing", priority: "Medium" },
    { title: "Internal CRM Update", status: "Ongoing", priority: "Low" },
    { title: "New Mobile Feature", status: "Completed", priority: "High" },
  ];

  const statusCounts = {
    Ongoing: projects.filter((p) => p.status === "Ongoing").length,
    Completed: projects.filter((p) => p.status === "Completed").length,
    Blocked: projects.filter((p) => p.status === "Blocked").length,
  };

  const pieData = {
    labels: ["Ongoing", "Completed", "Blocked"],
    datasets: [
      {
        data: [
          statusCounts.Ongoing,
          statusCounts.Completed,
          statusCounts.Blocked,
        ],
        backgroundColor: ["#FBBF24", "#10B981", "#EF4444"],
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Ongoing Projects",
        data: [3, 4, 2, 5],
        borderColor: "#FBBF24",
        backgroundColor: "rgba(251, 191, 36, 0.2)",
        tension: 0.4,
      },
      {
        label: "Completed Projects",
        data: [1, 2, 3, 4],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <MainLayout>
      {/* Filters + Search + Buttons */}
      <div style={styles.header}>
        <input style={styles.searchBar} placeholder="Search projects..." />

        <select style={styles.select}>
          <option>Status</option>
          <option>Ongoing</option>
          <option>Completed</option>
          <option>Blocked</option>
        </select>

        <select style={styles.select}>
          <option>Priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select style={styles.select}>
          <option>Assigner</option>
          <option>Alice</option>
          <option>Bob</option>
          <option>Charlie</option>
        </select>

        <button style={styles.primaryBtn}>Apply Filter</button>
        <button style={styles.clearBtn}>Clear Filter</button>

        {/* ✅ REDIRECT BUTTON */}
        <button
          style={styles.addProjectBtn}
          onClick={() => navigate("/add-project")}
        >
          Add New Project
        </button>
      </div>

      {/* Projects Overview */}
      <div>
        <h3 style={styles.sectionTitle}>Projects Overview</h3>
        <div style={styles.cards}>
          {projects.map((p, idx) => (
            <ProjectCard key={idx} project={p} navigate={navigate} />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.chartsSection}>
        <div style={styles.chartContainer}>
          <h3 style={styles.sectionTitle}>Project Status Distribution</h3>
          <Pie data={pieData} />
        </div>

        <div style={styles.chartContainer}>
          <h3 style={styles.sectionTitle}>Progress Over Time</h3>
          <Line data={lineData} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={styles.sectionTitle}>Quick Actions & Tools</h3>
        <div style={styles.quickActionsGrid}>
          {["Refresh", "Export CSV", "Reports", "Team"].map((title, idx) => (
            <ActionCard key={idx} title={title} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

// ---- Project Card ----
const ProjectCard = ({ project, navigate }) => {
  const { title, status, priority } = project;
  const statusColors = {
    Ongoing: "#FBBF24",
    Completed: "#10B981",
    Blocked: "#EF4444",
  };
  const priorityColors = {
    High: "#EF4444",
    Medium: "#F59E0B",
    Low: "#10B981",
  };

  return (
    <div style={styles.projectCard}>
      <h4>{title}</h4>
      <div style={styles.meta}>
        <span style={{ color: statusColors[status] }}>Status: {status}</span>
        <span style={{ color: priorityColors[priority] }}>Priority: {priority}</span>
      </div>
      {/* ✅ View button redirects to project details */}
      <button
        style={styles.secondaryBtn}
        onClick={() => navigate("/project-details")}
      >
        View
      </button>
    </div>
  );
};

// ---- Action Card ----
const ActionCard = ({ title }) => (
  <button style={styles.actionBtn}>{title}</button>
);

// ---- Styles ----
const styles = {
  header: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px", alignItems: "center" },
  searchBar: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #E5E7EB", flex: 1, minWidth: "180px" },
  select: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #E5E7EB" },
  primaryBtn: { padding: "8px 16px", borderRadius: "6px", border: "none", backgroundColor: "#111827", color: "#fff", cursor: "pointer" },
  clearBtn: { padding: "8px 16px", borderRadius: "6px", border: "1px solid #E5E7EB", background: "#F9FAFB", cursor: "pointer" },
  addProjectBtn: { padding: "8px 16px", borderRadius: "6px", border: "none", background: "#4F46E5", color: "#fff", cursor: "pointer" },
  sectionTitle: { fontSize: "18px", fontWeight: 600, marginBottom: "12px" },
  cards: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" },
  projectCard: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "20px" },
  meta: { display: "flex", justifyContent: "space-between", margin: "12px 0", fontWeight: 500 },
  secondaryBtn: { background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" },
  chartsSection: { display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "32px" },
  chartContainer: { flex: "1 1 45%", minWidth: "300px", maxWidth: "450px", padding: "20px", borderRadius: "10px", background: "#fff", border: "1px solid #E5E7EB" },
  quickActionsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" },
  actionBtn: { width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#111827", color: "#fff", cursor: "pointer" },
};

export default Dashboard;
