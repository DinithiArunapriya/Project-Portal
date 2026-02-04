import React from "react";
import Chart from "chart.js/auto";
import { Link } from "react-router-dom";
import { useNotify } from "../notifications/NotificationProvider";

import { listProjects } from "../services/projectsApi";
import { listTasks } from "../services/tasksApi";

export default function Dashboard() {
  const notify = useNotify();

  const [loading, setLoading] = React.useState(true);
  const [projects, setProjects] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);

  // chart refs + instances
  const statusChartRef = React.useRef(null);
  const progressChartRef = React.useRef(null);
  const statusChartInstance = React.useRef(null);
  const progressChartInstance = React.useRef(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([listProjects(), listTasks()]);
      setProjects(Array.isArray(p) ? p : []);
      setTasks(Array.isArray(t) ? t : []);
    } catch (e) {
      notify({
        type: "error",
        title: "Dashboard",
        message: e?.message || "Failed to load dashboard data",
      });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Helpers
  const normalizeProjectStatus = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "DONE" || s === "COMPLETED") return "COMPLETED";
    if (s === "IN_PROGRESS" || s === "ONGOING") return "IN_PROGRESS";
    if (s === "ON_HOLD") return "ON_HOLD";
    return "OTHER";
  };

  const parseDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  // counts for pie chart
  const statusCounts = React.useMemo(() => {
    const counts = { IN_PROGRESS: 0, COMPLETED: 0, ON_HOLD: 0, OTHER: 0 };
    for (const p of projects) {
      counts[normalizeProjectStatus(p.status)] += 1;
    }
    return counts;
  }, [projects]);

  // recent lists
  const recentProjects = React.useMemo(() => {
    return projects
      .slice()
      .sort((a, b) => {
        const da = parseDate(a.updatedAt) || parseDate(a.createdAt) || new Date(0);
        const db = parseDate(b.updatedAt) || parseDate(b.createdAt) || new Date(0);
        return db - da;
      })
      .slice(0, 5);
  }, [projects]);

  const recentTasks = React.useMemo(() => {
    return tasks
      .slice()
      .sort((a, b) => {
        const da = parseDate(a.updatedAt) || parseDate(a.createdAt) || new Date(0);
        const db = parseDate(b.updatedAt) || parseDate(b.createdAt) || new Date(0);
        return db - da;
      })
      .slice(0, 5);
  }, [tasks]);

  // month labels
  const monthLabels = React.useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(
        m.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      );
    }
    return months;
  }, []);

  const getMonthlyCounts = React.useCallback(
    (bucket) => {
      const result = [0, 0, 0, 0, 0, 0];
      const today = new Date();

      for (const p of projects) {
        if (normalizeProjectStatus(p.status) !== bucket) continue;

        const d =
          parseDate(p.createdAt) ||
          parseDate(p.startDate) ||
          parseDate(p.updatedAt);
        if (!d) continue;

        const monthsDiff =
          (today.getFullYear() - d.getFullYear()) * 12 +
          (today.getMonth() - d.getMonth());

        if (monthsDiff >= 0 && monthsDiff < 6) {
          result[5 - monthsDiff] += 1;
        }
      }
      return result;
    },
    [projects]
  );

  // charts
  React.useEffect(() => {
    if (loading) return;

    if (statusChartInstance.current) statusChartInstance.current.destroy();
    if (progressChartInstance.current) progressChartInstance.current.destroy();

    if (statusChartRef.current) {
      statusChartInstance.current = new Chart(statusChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["In Progress", "Completed", "On Hold", "Other"],
          datasets: [
            {
              data: [
                statusCounts.IN_PROGRESS,
                statusCounts.COMPLETED,
                statusCounts.ON_HOLD,
                statusCounts.OTHER,
              ],
              backgroundColor: ["#4f46e5", "#10b981", "#f59e0b", "#94a3b8"],
              borderColor: "#ffffff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true } },
          },
        },
      });
    }

    if (progressChartRef.current) {
      progressChartInstance.current = new Chart(progressChartRef.current, {
        type: "line",
        data: {
          labels: monthLabels,
          datasets: [
            {
              label: "Completed",
              data: getMonthlyCounts("COMPLETED"),
              borderColor: "#10b981",
              backgroundColor: "rgba(16,185,129,0.12)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "In Progress",
              data: getMonthlyCounts("IN_PROGRESS"),
              borderColor: "#4f46e5",
              backgroundColor: "rgba(79,70,229,0.12)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    return () => {
      statusChartInstance.current?.destroy();
      progressChartInstance.current?.destroy();
    };
  }, [loading, statusCounts, monthLabels, getMonthlyCounts]);

  return (
    <div>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ marginTop: 6, color: "#6b7280" }}>
            Overview of recent activity
          </p>
        </div>

        <button style={styles.primaryBtn} onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Charts FIRST */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Project Status Distribution</div>
          <div style={{ height: 280 }}>
            <canvas ref={statusChartRef} />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Progress Over Time</div>
          <div style={{ height: 280 }}>
            <canvas ref={progressChartRef} />
          </div>
        </div>
      </div>

      {/* Recent Projects / Tasks AFTER */}
      <div style={{ ...styles.grid2, marginTop: 12 }}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Recent Projects
            <Link to="/projects" style={styles.link}>View all →</Link>
          </div>

          {recentProjects.length ? (
            recentProjects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} style={styles.rowItem}>
                <strong>{p.name}</strong>
                <span style={styles.muted}>{p.status || "—"}</span>
              </Link>
            ))
          ) : (
            <div style={styles.muted}>No projects yet.</div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Recent Tasks
            <Link to="/tasks" style={styles.link}>View all →</Link>
          </div>

          {recentTasks.length ? (
            recentTasks.map((t) => (
              <Link key={t.id} to={`/tasks/${t.id}`} style={styles.rowItem}>
                <strong>{t.title || t.name || "Untitled Task"}</strong>
                <span style={styles.muted}>{t.status || "—"}</span>
              </Link>
            ))
          ) : (
            <div style={styles.muted}>No tasks yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  },
  cardTitle: {
    fontWeight: 900,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
  },
  link: {
    color: "#4f46e5",
    fontWeight: 800,
    textDecoration: "none",
    fontSize: 13,
  },
  rowItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 12px",
    border: "1px solid #f3f4f6",
    borderRadius: 12,
    textDecoration: "none",
    color: "#111827",
    marginBottom: 8,
  },
  muted: { color: "#6b7280", fontSize: 13 },
  primaryBtn: {
    background: "#111827",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 800,
    border: "none",
  },
};
