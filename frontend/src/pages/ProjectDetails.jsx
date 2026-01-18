import MainLayout from "../layouts/MainLayout";
import { useState } from "react";
import { FaUsers, FaClock, FaCheckCircle, FaFileAlt, FaGithub, FaFigma, FaTasks, FaInfoCircle, FaPlus } from "react-icons/fa";

const ProjectDetails = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <MainLayout>
      {/* Page Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>Sri Lankan Data Analytics Dashboard</h2>
        <p style={styles.subtitle}>Project ID: 1005 | Company: The Qexle | Lead: Ashan Fernando</p>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <FaCheckCircle size={24} color="#10B981" />
          <div>
            <span style={styles.cardTitle}>Completion</span>
            <span style={styles.cardValue}>85%</span>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <FaClock size={24} color="#EF4444" />
          <div>
            <span style={styles.cardTitle}>Timeline</span>
            <span style={styles.cardValue}>627 days overdue</span>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <FaUsers size={24} color="#FBBF24" />
          <div>
            <span style={styles.cardTitle}>Team</span>
            <span style={styles.cardValue}>5 members</span>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <FaInfoCircle size={24} color="#4F46E5" />
          <div>
            <span style={styles.cardTitle}>Status</span>
            <span style={styles.cardValue}>High Priority</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <TabButton
          title="Overview"
          icon={<FaInfoCircle />}
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        />
        <TabButton
          title="Team"
          icon={<FaUsers />}
          active={activeTab === "team"}
          onClick={() => setActiveTab("team")}
        />
        <TabButton
          title="Updates"
          icon={<FaClock />}
          active={activeTab === "updates"}
          onClick={() => setActiveTab("updates")}
        />
        <TabButton
          title="Files"
          icon={<FaFileAlt />}
          active={activeTab === "files"}
          onClick={() => setActiveTab("files")}
        />
        <TabButton
          title="External Links"
          icon={<FaTasks />}
          active={activeTab === "links"}
          onClick={() => setActiveTab("links")}
        />
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {activeTab === "overview" && (
          <div>
            <h3 style={styles.sectionTitle}>Project Overview</h3>
            <p>Company: The Qexle</p>
            <p>Category: Data Science</p>
            <p>Status: High Priority</p>
            <p>Responsible Person: Susith Deshan Alwis</p>
          </div>
        )}

        {activeTab === "team" && (
          <div>
            <h3 style={styles.sectionTitle}>Project Team Members</h3>
            <div style={styles.teamCard}>
              <strong>Leadership</strong>
              <p>Project Lead: Nadeesha Jayawardena</p>
              <p>Responsible Person: Susith Deshan Alwis</p>
            </div>
            <div style={styles.teamCard}>
              <strong>Team Members (3)</strong>
              <ul>
                <li>Kavinda Wickramasinghe</li>
                <li>Ashan Fernando</li>
                <li>Sashini Silva</li>
              </ul>
            </div>
            <div style={styles.teamCard}>
              <strong>Developers (2)</strong>
              <ul>
                <li>Kavinda Wickramasinghe</li>
                <li>Ashan Fernando</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "updates" && (
          <div>
            <h3 style={styles.sectionTitle}>Project Updates</h3>
            <div style={styles.addUpdate}>
              <select style={styles.select}>
                <option>Regular Update</option>
                <option>Daily Update</option>
              </select>
              <textarea placeholder="Enter project update..." style={styles.textarea} />
              <button style={styles.primaryBtn}><FaPlus /> Add Update</button>
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div>
            <h3 style={styles.sectionTitle}>Project Files</h3>
            <div style={styles.filesCard}>
              <p>No files yet</p>
              <p>Upload files to share project documents with the team.</p>
              <button style={styles.primaryBtn}>Upload File</button>
            </div>
          </div>
        )}

        {activeTab === "links" && (
          <div>
            <h3 style={styles.sectionTitle}>External Project Links</h3>
            <div style={styles.linksGrid}>
              <a href="https://github.com/qexle/retail-platform" target="_blank" rel="noreferrer" style={styles.linkCard}>
                <FaGithub size={24} />
                <div>
                  <strong>GitHub Repository</strong>
                  <p>Access the project's source code repository</p>
                </div>
              </a>
              <a href="https://figma.com/file/qexle-retail-platform" target="_blank" rel="noreferrer" style={styles.linkCard}>
                <FaFigma size={24} />
                <div>
                  <strong>Figma Design</strong>
                  <p>Access the project's design files in Figma</p>
                </div>
              </a>
              <a href="#" target="_blank" rel="noreferrer" style={styles.linkCard}>
                <FaTasks size={24} />
                <div>
                  <strong>Jira Project</strong>
                  <p>Access the project's tasks and tracking in Jira</p>
                </div>
              </a>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

/* --- Tab Button --- */
const TabButton = ({ title, icon, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      ...styles.tabButton,
      background: active ? "#4F46E5" : "#F3F4F6",
      color: active ? "#fff" : "#111827",
    }}
  >
    {icon} <span style={{ marginLeft: 6 }}>{title}</span>
  </button>
);

/* --- Styles --- */
const styles = {
  header: { marginBottom: 24 },
  pageTitle: { fontSize: 24, fontWeight: 600, marginBottom: 4 },
  subtitle: { color: "#6B7280", fontSize: 14 },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  summaryCard: { display: "flex", alignItems: "center", gap: 12, background: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" },
  cardTitle: { fontSize: 12, color: "#6B7280" },
  cardValue: { fontSize: 18, fontWeight: 600 },
  tabs: { display: "flex", gap: 12, marginBottom: 16 },
  tabButton: { padding: "8px 16px", borderRadius: 8, border: "none", display: "flex", alignItems: "center", cursor: "pointer", fontWeight: 500 },
  tabContent: { background: "#fff", padding: 24, borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 12 },
  teamCard: { background: "#F9FAFB", padding: 16, borderRadius: 8, marginBottom: 16 },
  addUpdate: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  select: { padding: "8px 12px", borderRadius: 6, border: "1px solid #E5E7EB" },
  textarea: { padding: 8, borderRadius: 6, border: "1px solid #E5E7EB", minHeight: 80, resize: "vertical" },
  primaryBtn: { padding: "8px 16px", borderRadius: 6, border: "none", background: "#4F46E5", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  filesCard: { background: "#F9FAFB", padding: 16, borderRadius: 8 },
  linksGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 },
  linkCard: { display: "flex", alignItems: "center", gap: 12, background: "#F3F4F6", padding: 16, borderRadius: 8, textDecoration: "none", color: "#111827", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
};

export default ProjectDetails;
