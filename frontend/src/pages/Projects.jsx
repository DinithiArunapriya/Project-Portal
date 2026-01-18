import MainLayout from "../layouts/MainLayout";
import { useState } from "react";

const Projects = () => {
  const [projects, setProjects] = useState([
    {
      name: "Customer Portal Revamp",
      status: "Ongoing",
      jira: "Not linked",
      assigned: "Alice",
      timeline: "Nov 1, 2025 - Feb 28, 2025",
    },
    {
      name: "Mobile App Redesign",
      status: "On Hold",
      jira: "Not linked",
      assigned: "Bob",
      timeline: "Feb 1, 2026 - May 31, 2026",
    },
    {
      name: "API Migration",
      status: "Completed",
      jira: "Not linked",
      assigned: "John",
      timeline: "Feb 15, 2025 - May 20, 2025",
    },
    {
      name: "Marketing Website",
      status: "Ongoing",
      jira: "Not linked",
      assigned: "Frank",
      timeline: "Mar 1, 2025 - Dec 31, 2025",
    },
    {
      name: "Internal CRM Update",
      status: "Completed",
      jira: "Not linked",
      assigned: "Shene",
      timeline: "Jan 15, 2024 - Jun 30, 2024",
    },
    {
      name: "New Mobile Feature",
      status: "Ongoing",
      jira: "Not linked",
      assigned: "Derek",
      timeline: "Jan 1, 2026 - Apr 30, 2026",
    },
  ]);

  const statusColors = {
    Completed: "#10B981",
    Ongoing: "#FBBF24",
    "On Hold": "#EF4444",
  };

  // Delete modal state
  const [showModal, setShowModal] = useState(false);
  const [deleteProject, setDeleteProject] = useState(null);

  const handleDelete = (project) => {
    setDeleteProject(project);
    setShowModal(true);
  };

  const confirmDelete = () => {
    setProjects(projects.filter((p) => p !== deleteProject));
    setShowModal(false);
  };

  return (
    <MainLayout>
      {/* Filters */}
      <div style={styles.filters}>
        <input style={styles.search} placeholder="Search projects..." />
        <select style={styles.select}>
          <option>Status</option>
          <option>Completed</option>
          <option>Ongoing</option>
          <option>On Hold</option>
        </select>
        <select style={styles.select}>
          <option>Assigned To</option>
          <option>Alice</option>
          <option>Bob</option>
          <option>Charlie</option>
        </select>
        <input type="date" style={styles.dateInput} placeholder="From" />
        <input type="date" style={styles.dateInput} placeholder="To" />
        <button style={styles.primaryBtn}>Apply Filter</button>
        <button style={styles.clearBtn}>Clear All</button>
        <button style={styles.addBtn}>Add Project</button>
      </div>

      {/* Page Title */}
      <h2 style={styles.pageTitle}>Projects</h2>

      {/* Projects Overview Cards */}
      <div style={styles.cards}>
        <StatCard title="Total Projects" value={6} color="#4F46E5" />
        <StatCard title="Completed" value={2} color="#10B981" />
        <StatCard title="Ongoing" value={3} color="#FBBF24" />
        <StatCard title="On Hold" value={1} color="#EF4444" />
        <StatCard title="Average Progress" value="70%" color="#6B7280" />
        <StatCard title="Team Allocation" value="6 / 6" color="#2563EB" />
      </div>

      {/* Projects Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>JIRA Integration</th>
              <th>Assigned To</th>
              <th>Timeline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom:
                    idx < projects.length - 1 ? "1px solid #E5E7EB" : "none",
                }}
              >
                <td style={styles.cell}>{p.name}</td>
                <td
                  style={{
                    ...styles.cell,
                    color: statusColors[p.status],
                    fontWeight: 500,
                  }}
                >
                  {p.status}
                </td>
                <td style={{ ...styles.cell, ...styles.jiraLink }}>
                  🔗 <a href="#" style={styles.jiraAnchor}>{p.jira}</a>
                </td>
                <td style={styles.cell}>{p.assigned}</td>
                <td style={styles.cell}>{p.timeline}</td>
                <td style={styles.cell}>
                  <button style={styles.viewBtn}>View</button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(p)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Centered Details */}
        <div style={styles.tableDetailsContainer}>
          <span style={styles.tableDetails}>
            Showing {projects.length} of {projects.length} projects
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        {["Refresh", "Export Excel", "Export PDF", "Reports"].map((t, idx) => (
          <button key={idx} style={styles.actionBtn}>
            {t}
          </button>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <p>Are you sure you want to delete "{deleteProject.name}"?</p>
            <div style={styles.modalBtns}>
              <button style={styles.deleteBtn} onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button
                style={styles.clearBtn}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

// ---- Stat Card ----
const StatCard = ({ title, value, color }) => (
  <div style={{ ...styles.statCard, borderLeft: `6px solid ${color}` }}>
    <h4>{title}</h4>
    <p>{value}</p>
  </div>
);

// ---- Styles ----
const styles = {
  filters: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
    alignItems: "center",
  },
  search: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #E5E7EB",
    flex: 1,
    minWidth: "180px",
  },
  select: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #E5E7EB" },
  dateInput: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #E5E7EB" },
  primaryBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
  clearBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    cursor: "pointer",
  },
  addBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    background: "#4F46E5",
    color: "#fff",
    cursor: "pointer",
  },
  viewBtn: {
    marginRight: "6px",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#4F46E5", // same as Add Project
    color: "#fff",
  },
  pageTitle: { fontSize: "22px", fontWeight: 600, marginBottom: "16px" },
  cards: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" },
  statCard: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "20px", textAlign: "center" },
  tableCard: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "32px",
    overflowX: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  cell: {
    padding: "16px 12px",
    textAlign: "left",
    verticalAlign: "middle",
  },
  jiraLink: { display: "flex", alignItems: "center", gap: "4px" },
  jiraAnchor: { color: "#4F46E5", textDecoration: "underline", cursor: "pointer" },
  deleteBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", background: "#EF4444", color: "#fff" },
  tableDetailsContainer: { display: "flex", justifyContent: "center", width: "100%", marginTop: "16px" },
  tableDetails: { fontSize: "14px", color: "#6B7280" },
  quickActions: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" },
  actionBtn: { padding: "12px", borderRadius: "8px", border: "none", background: "#111827", color: "#fff", cursor: "pointer" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: { background: "#fff", padding: "24px", borderRadius: "12px", width: "400px", textAlign: "center" },
  modalBtns: { display: "flex", justifyContent: "space-around", marginTop: "16px" },
};

export default Projects;
