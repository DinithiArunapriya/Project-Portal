import React from "react";
import Chart from "chart.js/auto";
import { Link } from "react-router-dom";
import { useNotify } from "../notifications/NotificationProvider";

import { listProjects } from "../services/projectsApi";
import { listUsers } from "../services/usersApi";

export default function Reports() {
  const notify = useNotify();

  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState("all"); // all | ongoing | completed | onhold | atrisk
  const [isExporting, setIsExporting] = React.useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = React.useState(false);

  const [projects, setProjects] = React.useState([]);
  const [users, setUsers] = React.useState([]);

  const statusChartRef = React.useRef(null);
  const progressChartRef = React.useRef(null);

  const statusChartInstance = React.useRef(null);
  const progressChartInstance = React.useRef(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, u] = await Promise.all([listProjects(), listUsers()]);
      setProjects(Array.isArray(p) ? p : []);
      setUsers(Array.isArray(u) ? u : []);
    } catch (e) {
      notify({
        type: "error",
        title: "Load failed",
        message: e?.message || "Failed to load reports data",
      });
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  React.useEffect(() => {
    load();
  }, [load]);

  const normalizeStatus = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "DONE" || s === "COMPLETED") return "COMPLETED";
    if (s === "IN_PROGRESS" || s === "ONGOING") return "ONGOING";
    if (s === "ON_HOLD") return "ON_HOLD";
    if (s === "AT_RISK") return "AT_RISK";
    return "OTHER";
  };

  const getUserName = React.useCallback(
    (userId) => {
      if (!userId) return "Unassigned";
      const u = users.find((x) => x.id === userId || x._id === userId);
      return u?.name || "Unknown User";
    },
    [users]
  );

  const totalProjects = projects.length;

  const completedProjects = React.useMemo(
    () => projects.filter((p) => normalizeStatus(p.status) === "COMPLETED"),
    [projects]
  );

  const ongoingProjects = React.useMemo(
    () => projects.filter((p) => normalizeStatus(p.status) === "ONGOING"),
    [projects]
  );

  const onHoldProjects = React.useMemo(
    () => projects.filter((p) => normalizeStatus(p.status) === "ON_HOLD"),
    [projects]
  );

  const atRiskProjects = React.useMemo(
    () => projects.filter((p) => normalizeStatus(p.status) === "AT_RISK"),
    [projects]
  );

  const counts = {
    completed: completedProjects.length,
    ongoing: ongoingProjects.length,
    onhold: onHoldProjects.length,
    atrisk: atRiskProjects.length,
  };

  const completionPercentage = React.useMemo(() => {
    if (!totalProjects) return 0;
    return Math.round((counts.completed / totalProjects) * 100);
  }, [counts.completed, totalProjects]);

  const averageProgress = React.useMemo(() => {
    if (!ongoingProjects.length) return 0;
    const total = ongoingProjects.reduce((acc, p) => acc + (Number(p.progress) || 0), 0);
    return Math.round(total / ongoingProjects.length);
  }, [ongoingProjects]);

  const monthLabels = React.useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(m.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
    }
    return months;
  }, []);

  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const getHistoricalCounts = React.useCallback(
    (bucket) => {
      const result = [0, 0, 0, 0, 0, 0];
      const today = new Date();

      for (const p of projects) {
        if (normalizeStatus(p.status) !== bucket) continue;

        const created = parseDate(p.createdAt) || parseDate(p.startDate) || parseDate(p.updatedAt);
        if (!created) continue;

        const monthsDiff =
          (today.getFullYear() - created.getFullYear()) * 12 + (today.getMonth() - created.getMonth());

        if (monthsDiff >= 0 && monthsDiff < 6) {
          const idx = 5 - monthsDiff;
          result[idx] += 1;
        }
      }

      return result;
    },
    [projects]
  );

  // Projects list with tab + search
  const filteredProjects = React.useMemo(() => {
    let result = projects.slice();

    if (selectedTab !== "all") {
      if (selectedTab === "ongoing") result = ongoingProjects.slice();
      if (selectedTab === "completed") result = completedProjects.slice();
      if (selectedTab === "onhold") result = onHoldProjects.slice();
      if (selectedTab === "atrisk") result = atRiskProjects.slice();
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => {
        const name = String(p.name || "").toLowerCase();
        const assigneeName = getUserName(p.assignedTo).toLowerCase();
        return name.includes(q) || assigneeName.includes(q);
      });
    }

    return result;
  }, [
    projects,
    selectedTab,
    searchQuery,
    ongoingProjects,
    completedProjects,
    onHoldProjects,
    atRiskProjects,
    getUserName,
  ]);

  // Charts
  React.useEffect(() => {
    if (isLoading) return;

    if (statusChartInstance.current) statusChartInstance.current.destroy();
    if (progressChartInstance.current) progressChartInstance.current.destroy();

    const statusCtx = statusChartRef.current;
    if (statusCtx) {
      statusChartInstance.current = new Chart(statusCtx, {
        type: "doughnut",
        data: {
          labels: ["Ongoing", "Completed", "On Hold", "At Risk"],
          datasets: [
            {
              data: [counts.ongoing, counts.completed, counts.onhold, counts.atrisk],
              backgroundColor: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"],
              borderColor: "#ffffff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: { legend: { position: "bottom" } },
        },
      });
    }

    const progressCtx = progressChartRef.current;
    if (progressCtx) {
      progressChartInstance.current = new Chart(progressCtx, {
        type: "line",
        data: {
          labels: monthLabels,
          datasets: [
            {
              label: "Completed Projects",
              data: getHistoricalCounts("COMPLETED"),
              borderColor: "#10b981",
              backgroundColor: "rgba(16,185,129,0.12)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Ongoing Projects",
              data: getHistoricalCounts("ONGOING"),
              borderColor: "#4f46e5",
              backgroundColor: "rgba(79,70,229,0.12)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "On Hold Projects",
              data: getHistoricalCounts("ON_HOLD"),
              borderColor: "#f59e0b",
              backgroundColor: "rgba(245,158,11,0.12)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top" } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    return () => {
      if (statusChartInstance.current) statusChartInstance.current.destroy();
      if (progressChartInstance.current) progressChartInstance.current.destroy();
    };
  }, [isLoading, counts.ongoing, counts.completed, counts.onhold, counts.atrisk, monthLabels, getHistoricalCounts]);

  // Export menu close on outside click
  React.useEffect(() => {
    const onDocClick = (e) => {
      if (!isExportMenuOpen) return;
      const target = e.target;
      if (target?.closest?.("[data-export-menu]")) return;
      setIsExportMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [isExportMenuOpen]);

  const exportReports = async (format) => {
    setIsExportMenuOpen(false);
    setIsExporting(true);

    try {
      notify({ type: "info", title: "Export", message: `Preparing ${format.toUpperCase()} export...` });
      if (format === "csv") exportCSV(filteredProjects, users);
      notify({ type: "success", title: "Export complete", message: `Exported as ${format.toUpperCase()}` });
    } catch (e) {
      notify({ type: "error", title: "Export failed", message: e?.message || "Failed to export reports" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {isLoading ? (
        <div style={styles.loadingOverlay}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Spinner />
            <p style={{ marginTop: 10, color: "#374151", fontWeight: 700 }}>Loading reports...</p>
          </div>
        </div>
      ) : null}

      {/* Header */}
      <div style={styles.headerRow}>
        <div style={{ width: "100%" }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#111827" }}>Reports Dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "#6b7280" }}>View and analyze project performance metrics</p>
        </div>

        <div style={styles.headerActions}>
          <div style={{ position: "relative", width: 260 }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              style={styles.searchInput}
            />
            <div style={styles.searchIcon}>⌕</div>
          </div>

          <div style={{ position: "relative" }} data-export-menu>
            <button onClick={() => setIsExportMenuOpen((v) => !v)} style={styles.exportBtn} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export"} ▾
            </button>

            {isExportMenuOpen ? (
              <div style={styles.exportMenu}>
                <button style={styles.exportItem} onClick={() => exportReports("csv")}>
                  Export as CSV
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div style={styles.statsGrid}>
        <StatCard title="Total Projects" value={totalProjects} subtitle="All time projects" />
        <StatCard title="Ongoing" value={counts.ongoing} subtitle={`Avg. Progress: ${averageProgress}%`} />
        <StatCard title="Completed" value={counts.completed} subtitle={`${completionPercentage}% completion rate`} />
        <StatCard title="At Risk" value={counts.atrisk} subtitle="Requires attention" />
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        <div style={styles.card}>
          <div style={styles.chartTitle}>Project Status Distribution</div>
          <div style={{ height: 260 }}>
            <canvas ref={statusChartRef} />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.chartTitle}>Progress Over Time</div>
          <div style={{ height: 260 }}>
            <canvas ref={progressChartRef} />
          </div>
        </div>
      </div>

      {/* Projects Overview */}
      <div style={{ ...styles.card, marginTop: 14, padding: 0 }}>
        <div style={{ padding: 14, borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={styles.sectionTitle}>Projects Overview</div>
            <Link to="/projects" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 900 }}>
              View all →
            </Link>
          </div>

          <div style={styles.tabRow}>
            <Tab label={`All Projects (${totalProjects})`} active={selectedTab === "all"} onClick={() => setSelectedTab("all")} />
            <Tab label={`Ongoing (${counts.ongoing})`} active={selectedTab === "ongoing"} onClick={() => setSelectedTab("ongoing")} />
            <Tab label={`Completed (${counts.completed})`} active={selectedTab === "completed"} onClick={() => setSelectedTab("completed")} />
            <Tab label={`On Hold (${counts.onhold})`} active={selectedTab === "onhold"} onClick={() => setSelectedTab("onhold")} />
            <Tab label={`At Risk (${counts.atrisk})`} active={selectedTab === "atrisk"} onClick={() => setSelectedTab("atrisk")} />
          </div>
        </div>

        <div style={{ padding: 14 }}>
          <div style={{ display: "grid", gap: 12 }}>
            {filteredProjects.map((p) => (
              <div key={p.id || p._id} style={styles.projectCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 950, fontSize: 16 }}>{p.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      <Badge text={String(p.status || "OTHER")} />
                      <Badge text={String(p.department || "N/A")} tone="neutral" />
                    </div>
                  </div>

                  <div style={{ textAlign: "right", color: "#6b7280", fontSize: 13 }}>
                    <div>Deadline: {p.endDate || p.deadline || "N/A"}</div>
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Progress</div>
                  <div style={styles.progressOuter}>
                    <div
                      style={{
                        ...styles.progressInner,
                        width: `${Math.max(0, Math.min(100, Number(p.progress) || 0))}%`,
                        background: "#4f46e5",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
                  Assigned to: <b style={{ color: "#111827" }}>{getUserName(p.assignedTo)}</b>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 12, background: "#f9fafb", borderTop: "1px solid #e5e7eb", color: "#6b7280", fontSize: 13 }}>
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      </div>
    </div>
  );
}

/* ---------------- Small components ---------------- */

function Spinner() {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "4px solid #e5e7eb",
        borderTopColor: "#4f46e5",
        animation: "spin 1s linear infinite",
      }}
    />
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div style={styles.statCard}>
      <div style={{ fontWeight: 900, color: "#374151" }}>{title}</div>
      <div style={{ fontSize: 38, fontWeight: 950, marginTop: 8 }}>{value}</div>
      <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>{subtitle}</div>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 10px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontWeight: 900,
        color: active ? "#4f46e5" : "#6b7280",
        borderBottom: active ? "2px solid #4f46e5" : "2px solid transparent",
      }}
    >
      {label}
    </button>
  );
}

function Badge({ text, tone = "primary" }) {
  const map = {
    primary: { bg: "#eef2ff", fg: "#3730a3" },
    neutral: { bg: "#f3f4f6", fg: "#374151" },
  };
  const c = map[tone] || map.primary;
  return (
    <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900, background: c.bg, color: c.fg }}>
      {text}
    </span>
  );
}

/* ---------------- Export CSV ---------------- */

function exportCSV(projects, users) {
  const userNameById = new Map(users.map((u) => [u.id || u._id, u.name]));

  const rows = projects.map((p) => ({
    id: p.id || p._id,
    name: p.name,
    status: p.status,
    progress: p.progress,
    department: p.department || "",
    assignedTo: userNameById.get(p.assignedTo) || "",
    startDate: p.startDate || "",
    endDate: p.endDate || p.deadline || "",
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : "",
  }));

  const header = Object.keys(rows[0] || { id: "", name: "", status: "", progress: "" });
  const csv = [header.join(","), ...rows.map((r) => header.map((k) => escapeCSV(r[k])).join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `reports_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeCSV(value) {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

/* ---------------- Styles ---------------- */

const styles = {
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderRadius: 14,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  headerActions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },

  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 34px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    fontWeight: 900,
  },

  exportBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #4f46e5",
    background: "#4f46e5",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  exportMenu: {
    position: "absolute",
    right: 0,
    marginTop: 8,
    width: 200,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    overflow: "hidden",
    zIndex: 20,
  },
  exportItem: {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    border: "none",
    background: "white",
    cursor: "pointer",
    fontWeight: 800,
  },

  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  },

  sectionTitle: { fontSize: 18, fontWeight: 950, color: "#111827", marginBottom: 12 },

  statsGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  statCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  },

  chartsGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  chartTitle: { fontWeight: 950, marginBottom: 10, color: "#111827" },

  progressOuter: {
    height: 10,
    borderRadius: 999,
    background: "#f3f4f6",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    flex: 1,
  },
  progressInner: { height: "100%", borderRadius: 999 },

  tabRow: { display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" },

  projectCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    background: "white",
  },
};
