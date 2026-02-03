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
      notify({ type: "error", title: "Dashboard", message: e?.message || "Failed to load dashboard data" });
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

  // recent grids
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

  // time series labels for last 6 months
  const monthLabels = React.useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(m.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
    }
    return months;
  }, []);

  const getMonthlyCounts = React.useCallback(
    (bucket) => {
      // bucket: COMPLETED or IN_PROGRESS
      const result = [0, 0, 0, 0, 0, 0];
      const today = new Date();

      for (const p of projects) {
        if (normalizeProjectStatus(p.status) !== bucket) continue;

        // choose any date your app has (createdAt/startDate/updatedAt)
        const d = parseDate(p.createdAt) || parseDate(p.startDate) || parseDate(p.updatedAt);
        if (!d) continue;

        const monthsDiff =
          (today.getFullYear() - d.getFullYear()) * 12 + (today.getMonth() - d.getMonth());

        if (monthsDiff >= 0 && monthsDiff < 6) {
          const idx = 5 - monthsDiff;
          result[idx] += 1;
        }
      }
      return result;
    },
    [projects]
  );

  // Build charts once data loaded or changes
  React.useEffect(() => {
    if (loading) return;

    // destroy previous instances (important!)
    if (statusChartInstance.current) statusChartInstance.current.destroy();
    if (progressChartInstance.current) progressChartInstance.current.destroy();

    // PIE / DOUGHNUT
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
              // nice colors (you asked!)
              backgroundColor: [
                "#4f46e5", // indigo
                "#10b981", // green
                "#f59e0b", // amber
                "#94a3b8", // slate
              ],
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
            legend: {
              position: "bottom",
              labels: { usePointStyle: true, padding: 14 },
            },
          },
        },
      });
    }

    // LINE chart: Completed vs In Progress over time
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
          plugins: {
            legend: { position: "top" },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }

    return () => {
      if (statusChartInstance.current) statusChartInstance.current.destroy();
      if (progressChartInstance.current) progressChartInstance.current.destroy();
    };
  }, [loading, statusCounts, monthLabels, getMonthlyCounts]);

  return (
    <div>
      <div style={styles.headerRow}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280" }}>Overview of recent activity</p>
        </div>

        <button style={styles.primaryBtn} onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Recent grids */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Recent Projects <Link to="/projects" style={styles.link}>View all →</Link>
          </div>

          {recentProjects.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {recentProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  style={styles.rowItem}
                >
                  <div style={{ fontWeight: 900 }}>{p.name}</div>
                  <div style={styles.muted}>{String(p.status || "—")}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={styles.muted}>No projects yet.</div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Recent Tasks <Link to="/tasks" style={styles.link}>View all →</Link>
          </div>

          {recentTasks.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {recentTasks.map((t) => (
                <Link
                  key={t.id}
                  to={`/tasks/${t.id}`}
                  style={styles.rowItem}
                >
                  <div style={{ fontWeight: 900 }}>{t.title || t.name || "Untitled Task"}</div>
                  <div style={styles.muted}>{String(t.status || "—")}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={styles.muted}>No tasks yet.</div>
          )}
        </div>
      </div>

      {/* Charts BELOW the grids (as you requested) */}
      <div style={{ ...styles.grid2, marginTop: 12 }}>
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
    </div>
  );
}

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  },
  cardTitle: {
    fontWeight: 950,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  link: { color: "#4f46e5", textDecoration: "none", fontWeight: 900, fontSize: 13 },
  rowItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #f3f4f6",
    textDecoration: "none",
    color: "#111827",
    background: "#fafafa",
  },
  muted: { color: "#6b7280", fontSize: 13, fontWeight: 800 },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    height: 42,
    cursor: "pointer",
    fontWeight: 900,
  },
};
