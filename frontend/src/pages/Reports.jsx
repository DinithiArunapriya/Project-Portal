import React from "react";
import Chart from "chart.js/auto";
import { Link } from "react-router-dom";
import { useNotify } from "../notifications/NotificationProvider";

// You can replace these with your real APIs
import { listProjects } from "../services/projectsApi";
import { listUsers } from "../services/usersApi";

/**
 * Reports Dashboard (React version of your Vue requirement)
 * - Uses Chart.js (doughnut + line + bar)
 * - Uses useNotify() for toasts
 */
export default function Reports() {
  const notify = useNotify();

  // UI state
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState("all"); // all | ongoing | completed | onhold | atrisk
  const [isExporting, setIsExporting] = React.useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(false);

  // data
  const [projects, setProjects] = React.useState([]);
  const [users, setUsers] = React.useState([]);

  // filters
  const [filters, setFilters] = React.useState({
    dateRange: "30", // 7 | 30 | 90 | all
    department: "all",
    teamMember: "all",
  });

  // chart refs
  const statusChartRef = React.useRef(null);
  const progressChartRef = React.useRef(null);
  const workloadChartRef = React.useRef(null);

  // chart instances (to destroy properly)
  const statusChartInstance = React.useRef(null);
  const progressChartInstance = React.useRef(null);
  const workloadChartInstance = React.useRef(null);

  // Fetch
  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, u] = await Promise.all([listProjects(), listUsers()]);
      // NOTE: your projects may not have these fields.
      // This page assumes: { id, name, status, progress, updatedAt, owner, department, assignedTo, startDate, endDate, createdAt }
      setProjects(Array.isArray(p) ? p : []);
      setUsers(Array.isArray(u) ? u : []);
    } catch (e) {
      notify({ type: "error", title: "Load failed", message: e?.message || "Failed to load reports data" });
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh
  React.useEffect(() => {
    if (!autoRefresh) return;

    const id = setInterval(() => {
      load();
      notify({ type: "info", title: "Refreshed", message: "Dashboard data refreshed" });
    }, 60_000);

    return () => clearInterval(id);
  }, [autoRefresh, load, notify]);

  // Helpers
  const getUserName = React.useCallback(
    (userId) => {
      if (!userId) return "Unassigned";
      const u = users.find((x) => x.id === userId || x._id === userId);
      return u?.name || "Unknown User";
    },
    [users]
  );

  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const computeDaysToDeadline = (endDate) => {
    const end = parseDate(endDate);
    if (!end) return null;
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const computeRiskLevel = (p) => {
    // Skip completed
    if (normalizeStatus(p.status) === "COMPLETED") return "LOW";

    const days = computeDaysToDeadline(p.endDate || p.deadline);
    if (days == null) return "LOW";

    const progress = Number(p.progress) || 0;

    // Simple risk rules (same spirit as Vue)
    if (days < 0) return "OVERDUE";
    if (days < 7 && progress < 80) return "HIGH";
    if (days < 14 && progress < 60) return "MEDIUM";
    return "LOW";
  };

  const normalizeStatus = (status) => {
    // map your app statuses to these buckets
    // Accepts: DONE/Completed, IN_PROGRESS/Ongoing, ON_HOLD, PLANNING, etc
    const s = String(status || "").toUpperCase();
    if (s === "DONE" || s === "COMPLETED") return "COMPLETED";
    if (s === "IN_PROGRESS" || s === "ONGOING") return "ONGOING";
    if (s === "ON_HOLD") return "ON_HOLD";
    return "OTHER";
  };

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

  const projectsAtRisk = React.useMemo(() => {
    return projects
      .map((p) => {
        const daysToDeadline = computeDaysToDeadline(p.endDate || p.deadline);
        const riskLevel = computeRiskLevel(p);
        return { ...p, daysToDeadline: daysToDeadline ?? "N/A", riskLevel };
      })
      .filter((p) => p.riskLevel === "HIGH" || p.riskLevel === "OVERDUE");
  }, [projects]);

  const counts = {
    completed: completedProjects.length,
    ongoing: ongoingProjects.length,
    onhold: onHoldProjects.length,
    atrisk: projectsAtRisk.length,
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

  // KPIs
  const onTimeDeliveryRate = React.useMemo(() => {
    // projects completed before endDate/deadline (if available)
    const completed = completedProjects.filter((p) => p.endDate || p.deadline);
    if (!completed.length) return 0;

    let onTime = 0;
    for (const p of completed) {
      const deadline = parseDate(p.endDate || p.deadline);
      if (!deadline) continue;

      // Use updatedAt as completion time fallback
      const completedAt = parseDate(p.completedAt) || parseDate(p.updatedAt) || null;
      if (!completedAt) {
        onTime += 1; // assume on-time if no completion timestamp
      } else if (completedAt.getTime() <= deadline.getTime()) {
        onTime += 1;
      }
    }
    return Math.round((onTime / completed.length) * 100);
  }, [completedProjects]);

  const resourceUtilization = React.useMemo(() => {
    if (!users.length) return 0;

    // user considered utilized if assignedTo matches any project (or appears in team arrays if you have them)
    const utilized = users.filter((u) =>
      projects.some((p) => {
        const uid = u.id || u._id;
        return p.assignedTo === uid || p.ownerId === uid;
      })
    );

    return Math.round((utilized.length / users.length) * 100);
  }, [projects, users]);

  const projectHealthIndex = React.useMemo(() => {
    if (!projects.length) return 0;

    let totalScore = 0;
    for (const p of projects) {
      const status = normalizeStatus(p.status);
      const progress = Math.max(0, Math.min(100, Number(p.progress) || 0));
      const risk = computeRiskLevel(p);

      // very simple scoring:
      // - Completed: 100
      // - Otherwise: progress adjusted by risk
      let score = status === "COMPLETED" ? 100 : progress;

      if (risk === "OVERDUE") score *= 0.25;
      else if (risk === "HIGH") score *= 0.5;
      else if (risk === "MEDIUM") score *= 0.8;

      totalScore += score;
    }
    return Math.round(totalScore / projects.length);
  }, [projects]);

  // Filtering
  const filteredProjects = React.useMemo(() => {
    let result = projects.slice();

    // Tab status filter
    if (selectedTab !== "all") {
      if (selectedTab === "ongoing") result = ongoingProjects.slice();
      if (selectedTab === "completed") result = completedProjects.slice();
      if (selectedTab === "onhold") result = onHoldProjects.slice();
      if (selectedTab === "atrisk") result = projectsAtRisk.slice();
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => {
        const name = String(p.name || "").toLowerCase();
        const assigneeName = getUserName(p.assignedTo).toLowerCase();
        return name.includes(q) || assigneeName.includes(q);
      });
    }

    // Date range (based on startDate or createdAt)
    if (filters.dateRange !== "all") {
      const days = Number(filters.dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      result = result.filter((p) => {
        const d = parseDate(p.startDate) || parseDate(p.createdAt) || parseDate(p.updatedAt);
        if (!d) return true; // keep if missing
        return d.getTime() >= cutoff.getTime();
      });
    }

    // Department
    if (filters.department !== "all") {
      result = result.filter((p) => String(p.department || "").toLowerCase() === filters.department);
    }

    // Team Member
    if (filters.teamMember !== "all") {
      result = result.filter((p) => p.assignedTo === filters.teamMember);
    }

    // Attach computed display fields
    return result.map((p) => {
      const daysToDeadline = computeDaysToDeadline(p.endDate || p.deadline);
      const riskLevel = computeRiskLevel(p);
      return {
        ...p,
        daysToDeadline: daysToDeadline ?? "N/A",
        riskLevel,
      };
    });
  }, [
    projects,
    ongoingProjects,
    completedProjects,
    onHoldProjects,
    projectsAtRisk,
    selectedTab,
    searchQuery,
    filters,
    getUserName,
  ]);

  // Department counts (based on project.department string)
  const departmentCounts = React.useMemo(() => {
    const counts = { engineering: 0, design: 0, marketing: 0, sales: 0 };
    for (const p of projects) {
      const d = String(p.department || "").toLowerCase();
      if (counts[d] != null) counts[d] += 1;
    }
    return counts;
  }, [projects]);

  const calculateDepartmentPercentage = (dept) => {
    if (!projects.length) return 0;
    return Math.round(((departmentCounts[dept] || 0) / projects.length) * 100);
  };

  // Team performance (simple)
  const teamPerformance = React.useMemo(() => {
    if (!users.length || !projects.length) return [];

    const rows = users.map((u) => {
      const uid = u.id || u._id;

      const userProjects = projects.filter((p) => p.assignedTo === uid);
      const completed = userProjects.filter((p) => normalizeStatus(p.status) === "COMPLETED");
      const ongoing = userProjects.filter((p) => normalizeStatus(p.status) === "ONGOING");

      const avgProgress = ongoing.length
        ? Math.round(ongoing.reduce((acc, p) => acc + (Number(p.progress) || 0), 0) / ongoing.length)
        : 0;

      // on-time rate
      let onTime = 0;
      const completedWithDeadlines = completed.filter((p) => p.endDate || p.deadline);
      for (const p of completedWithDeadlines) {
        const deadline = parseDate(p.endDate || p.deadline);
        const completedAt = parseDate(p.completedAt) || parseDate(p.updatedAt);
        if (!deadline || !completedAt) {
          onTime += 1;
        } else if (completedAt.getTime() <= deadline.getTime()) {
          onTime += 1;
        }
      }
      const onTimeRate = completedWithDeadlines.length ? Math.round((onTime / completedWithDeadlines.length) * 100) : 0;

      return {
        id: uid,
        name: u.name,
        role: u.role || "Team Member",
        assignedProjects: userProjects.length,
        completedProjects: completed.length,
        avgProgress,
        onTimeRate,
        utilizationRate: 0, // computed below
      };
    });

    // compute utilization rate for top contributors UI
    const avgAssigned = projects.length / Math.max(1, users.length);
    for (const r of rows) {
      r.utilizationRate = Math.min(100, Math.round((r.assignedProjects / Math.max(1, avgAssigned * 2)) * 100));
    }

    // sort by assigned projects desc
    rows.sort((a, b) => b.assignedProjects - a.assignedProjects);
    return rows;
  }, [users, projects]);

  const topContributors = React.useMemo(() => {
    return teamPerformance
      .slice()
      .sort((a, b) => (b.assignedProjects * 2 + b.completedProjects * 3 + b.onTimeRate / 10) - (a.assignedProjects * 2 + a.completedProjects * 3 + a.onTimeRate / 10))
      .slice(0, 5);
  }, [teamPerformance]);

  const riskBuckets = React.useMemo(() => {
    const enriched = filteredProjects.map((p) => ({
      ...p,
      daysToDeadline: p.daysToDeadline,
      riskLevel: p.riskLevel,
    }));

    const high = enriched.filter((p) => p.riskLevel === "HIGH" || p.riskLevel === "OVERDUE");
    const med = enriched.filter((p) => p.riskLevel === "MEDIUM");
    const low = enriched.filter((p) => p.riskLevel === "LOW");

    return { high, med, low };
  }, [filteredProjects]);

  // Charts data helpers
  const monthLabels = React.useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(m.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
    }
    return months;
  }, []);

  const getHistoricalCounts = React.useCallback(
    (statusBucket) => {
      // statusBucket: "COMPLETED" | "ONGOING" | "ON_HOLD"
      const result = [0, 0, 0, 0, 0, 0];
      const today = new Date();

      for (const p of projects) {
        if (normalizeStatus(p.status) !== statusBucket) continue;

        const created = parseDate(p.createdAt) || parseDate(p.startDate) || parseDate(p.updatedAt);
        if (!created) continue;

        const monthsDiff = (today.getFullYear() - created.getFullYear()) * 12 + (today.getMonth() - created.getMonth());
        if (monthsDiff >= 0 && monthsDiff < 6) {
          const idx = 5 - monthsDiff;
          result[idx] += 1;
        }
      }
      return result;
    },
    [projects]
  );

  // Initialize charts whenever filteredProjects/projects/teamPerformance changes
  React.useEffect(() => {
    if (isLoading) return;

    // destroy old
    if (statusChartInstance.current) statusChartInstance.current.destroy();
    if (progressChartInstance.current) progressChartInstance.current.destroy();
    if (workloadChartInstance.current) workloadChartInstance.current.destroy();

    // Doughnut: Status Distribution
    const statusCtx = statusChartRef.current;
    if (statusCtx) {
      statusChartInstance.current = new Chart(statusCtx, {
        type: "doughnut",
        data: {
          labels: ["Ongoing", "Completed", "On Hold", "At Risk"],
          datasets: [
            {
              data: [counts.ongoing, counts.completed, counts.onhold, counts.atrisk],
              backgroundColor: [
                "#4f46e5", // ongoing (indigo)
                "#10b981", // completed (green)
                "#f59e0b", // on hold (amber)
                "#ef4444", // at risk (red)
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
            legend: { position: "bottom" },
          },
        },
      });
    }

    // Line: Progress Over Time
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

    // Bar: Workload (top 7)
    const workloadCtx = workloadChartRef.current;
    if (workloadCtx && teamPerformance.length) {
      const top = teamPerformance.slice(0, 7);
      workloadChartInstance.current = new Chart(workloadCtx, {
        type: "bar",
        data: {
          labels: top.map((x) => x.name),
          datasets: [
            {
              label: "Assigned Projects",
              data: top.map((x) => x.assignedProjects),
              backgroundColor: "rgba(79,70,229,0.6)",
              borderColor: "#4f46e5",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    return () => {
      if (statusChartInstance.current) statusChartInstance.current.destroy();
      if (progressChartInstance.current) progressChartInstance.current.destroy();
      if (workloadChartInstance.current) workloadChartInstance.current.destroy();
    };
  }, [
    isLoading,
    counts.ongoing,
    counts.completed,
    counts.onhold,
    counts.atrisk,
    monthLabels,
    getHistoricalCounts,
    teamPerformance,
  ]);

  // Actions
  const applyFilters = () => {
    notify({ type: "success", title: "Filters applied", message: "Filters applied successfully" });
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh((v) => {
      const next = !v;
      notify({
        type: "info",
        title: "Auto refresh",
        message: next ? "Auto-refresh enabled (every 60s)" : "Auto-refresh disabled",
      });
      return next;
    });
  };

  const exportReports = async (format) => {
    setIsExportMenuOpen(false);
    setIsExporting(true);

    try {
      notify({ type: "info", title: "Export", message: `Preparing ${format.toUpperCase()} export...` });

      if (format === "csv") {
        exportCSV(filteredProjects, users);
      } else {
        // Simulated for now (you can later add jsPDF/xlsx)
        await sleep(900);
      }

      notify({ type: "success", title: "Export complete", message: `Exported as ${format.toUpperCase()}` });
    } catch (e) {
      notify({ type: "error", title: "Export failed", message: e?.message || "Failed to export reports" });
    } finally {
      setIsExporting(false);
    }
  };

  // Close export menu on outside click
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

  return (
    <div style={{ position: "relative" }}>
      {/* Loading overlay */}
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
          {/* Search */}
          <div style={{ position: "relative", width: 260 }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              style={styles.searchInput}
            />
            <div style={styles.searchIcon}>⌕</div>
          </div>

          {/* Export dropdown */}
          <div style={{ position: "relative" }} data-export-menu>
            <button
              onClick={() => setIsExportMenuOpen((v) => !v)}
              style={styles.exportBtn}
              disabled={isExporting}
            >
              {isExporting ? "Exporting..." : "Export"} ▾
            </button>

            {isExportMenuOpen ? (
              <div style={styles.exportMenu}>
                <button style={styles.exportItem} onClick={() => exportReports("csv")}>Export as CSV</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      <div style={styles.card}>
        <div style={{ fontWeight: 900, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span>⚲</span> Advanced Filters
        </div>

        <div style={styles.filtersRow}>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters((s) => ({ ...s, dateRange: e.target.value }))}
            style={styles.select}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          <select
            value={filters.department}
            onChange={(e) => setFilters((s) => ({ ...s, department: e.target.value }))}
            style={styles.select}
          >
            <option value="all">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
          </select>

          <div style={{ width: 260 }}>
            <UserSelect
              value={filters.teamMember}
              onChange={(v) => setFilters((s) => ({ ...s, teamMember: v }))}
              users={users}
              placeholder="All Team Members"
            />
          </div>

          <button onClick={applyFilters} style={styles.primaryBtn}>
            Apply Filters
          </button>

          <button onClick={toggleAutoRefresh} style={{ ...styles.toggleBtn, ...(autoRefresh ? styles.toggleOn : styles.toggleOff) }}>
            {autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
          </button>
        </div>
      </div>

      {/* KPI section */}
      <div style={{ ...styles.card, marginTop: 14 }}>
        <div style={styles.sectionTitle}>Key Performance Indicators</div>

        <div style={styles.kpiGrid}>
          <KPI title="On-time Delivery Rate" value={onTimeDeliveryRate} target={90} color="#10b981" />
          <KPI title="Resource Utilization" value={resourceUtilization} target={85} color={resourceUtilization >= 80 ? "#10b981" : resourceUtilization >= 60 ? "#f59e0b" : "#ef4444"} />
          <KPI title="Project Health Index" value={projectHealthIndex} target={80} color={projectHealthIndex >= 75 ? "#10b981" : projectHealthIndex >= 50 ? "#f59e0b" : "#ef4444"} />
        </div>
      </div>

      {/* Stats cards */}
      <div style={styles.statsGrid}>
        <StatCard title="Total Projects" value={totalProjects} subtitle="All time projects" />
        <StatCard title="Ongoing" value={counts.ongoing} subtitle={`Avg. Progress: ${averageProgress}%`} />
        <StatCard title="Completed" value={counts.completed} subtitle={`${completionPercentage}% completion rate`} />
        <StatCard title="At Risk" value={counts.atrisk} subtitle="Requires attention" />
      </div>

      {/* Analytics charts */}
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

      {/* Resource Utilization */}
      <div style={{ ...styles.card, marginTop: 14 }}>
        <div style={styles.sectionTitle}>Resource Utilization</div>

        <div style={styles.resourceGrid}>
          <div>
            <div style={styles.chartTitle}>Team Workload Distribution</div>
            <div style={{ height: 320 }}>
              <canvas ref={workloadChartRef} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={styles.chartTitle}>Top Contributors</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Based on active projects</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topContributors.length ? topContributors.map((m) => (
                <div key={m.id} style={styles.contributorCard}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={styles.avatarCircle}>👤</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ fontWeight: 900 }}>{m.name}</div>
                        <div style={{ color: "#6b7280", fontSize: 13 }}>{m.role}</div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                        <div style={styles.progressOuter}>
                          <div style={{ ...styles.progressInner, width: `${m.utilizationRate}%`, background: "#4f46e5" }} />
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800 }}>{m.utilizationRate}%</div>
                      </div>

                      <div style={styles.contributorMeta}>
                        <span>Assigned: <b>{m.assignedProjects}</b></span>
                        <span>Completed: <b>{m.completedProjects}</b></span>
                        <span>On-time: <b>{m.onTimeRate}%</b></span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: 18, textAlign: "center", color: "#6b7280" }}>No team data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Department distribution */}
        <div style={{ marginTop: 14 }}>
          <div style={styles.chartTitle}>Department Project Distribution</div>
          <div style={styles.deptGrid}>
            <DeptCard title="Engineering" value={departmentCounts.engineering || 0} pct={calculateDepartmentPercentage("engineering")} />
            <DeptCard title="Design" value={departmentCounts.design || 0} pct={calculateDepartmentPercentage("design")} />
            <DeptCard title="Marketing" value={departmentCounts.marketing || 0} pct={calculateDepartmentPercentage("marketing")} />
            <DeptCard title="Sales" value={departmentCounts.sales || 0} pct={calculateDepartmentPercentage("sales")} />
          </div>
        </div>
      </div>

      {/* Team Performance table */}
      <div style={{ ...styles.card, marginTop: 14, padding: 0 }}>
        <div style={{ padding: 14, borderBottom: "1px solid #e5e7eb" }}>
          <div style={styles.sectionTitle}>Team Performance</div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                {["Team Member", "Role", "Assigned Projects", "Completed Projects", "Average Progress", "On-time Completion"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamPerformance.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 18, textAlign: "center", color: "#6b7280" }}>
                    No team performance data available.
                  </td>
                </tr>
              ) : (
                teamPerformance.map((m) => (
                  <tr key={m.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={styles.td}><b>{m.name}</b></td>
                    <td style={styles.td}>{m.role}</td>
                    <td style={styles.td}>{m.assignedProjects}</td>
                    <td style={styles.td}>{m.completedProjects}</td>
                    <td style={styles.td}>
                      <BarMini value={m.avgProgress} />
                    </td>
                    <td style={styles.td}>
                      <BarMini value={m.onTimeRate} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Risk Assessment */}
      <div style={{ ...styles.card, marginTop: 14 }}>
        <div style={styles.sectionTitle}>Project Risk Assessment</div>

        <div style={styles.riskGrid}>
          <RiskBox title={`High Risk (${riskBuckets.high.length})`} color="#ef4444" items={riskBuckets.high} />
          <RiskBox title={`Medium Risk (${riskBuckets.med.length})`} color="#f59e0b" items={riskBuckets.med} />
          <RiskBox title={`Low Risk (${riskBuckets.low.length})`} color="#10b981" items={riskBuckets.low} />
        </div>
      </div>

      {/* Projects Overview Tabs */}
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
              <div key={p.id} style={styles.projectCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 950, fontSize: 16 }}>{p.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      <Badge text={String(p.status || "OTHER")} />
                      <Badge text={String(p.department || "N/A")} tone="neutral" />
                      <Badge text={`Risk: ${p.riskLevel}`} tone={p.riskLevel === "OVERDUE" || p.riskLevel === "HIGH" ? "danger" : p.riskLevel === "MEDIUM" ? "warn" : "ok"} />
                    </div>
                  </div>

                  <div style={{ textAlign: "right", color: "#6b7280", fontSize: 13 }}>
                    <div>Deadline: {p.endDate || p.deadline || "N/A"}</div>
                    <div>{p.daysToDeadline === "N/A" ? "No deadline" : (p.daysToDeadline < 0 ? `${Math.abs(p.daysToDeadline)} days overdue` : `${p.daysToDeadline} days remaining`)}</div>
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Progress</div>
                  <div style={styles.progressOuter}>
                    <div style={{ ...styles.progressInner, width: `${Math.max(0, Math.min(100, Number(p.progress) || 0))}%`, background: "#4f46e5" }} />
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

/* ------------------------- Small components ------------------------- */

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

function KPI({ title, value, target, color }) {
  return (
    <div style={styles.kpiCard}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 800 }}>{title}</div>
        <div title="KPI info" style={{ color: "#9ca3af" }}>ⓘ</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 950, marginTop: 8 }}>{value}%</div>
      <div style={{ ...styles.progressOuter, marginTop: 10 }}>
        <div style={{ ...styles.progressInner, width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>Target: {target}%</div>
    </div>
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

function DeptCard({ title, value, pct }) {
  return (
    <div style={styles.deptCard}>
      <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 900 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 950, marginTop: 8 }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>{pct}% of projects</div>
    </div>
  );
}

function RiskBox({ title, color, items }) {
  return (
    <div style={{ ...styles.riskBox, borderColor: color + "33", background: color + "0f" }}>
      <div style={{ fontWeight: 950, marginBottom: 8, color }}>{title}</div>
      <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {items.length ? items.map((p) => (
          <div key={p.id} style={{ fontSize: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: "inline-block" }} />
              <span style={{ fontWeight: 800, color: "#111827" }}>{p.name}</span>
            </div>
            <div style={{ marginLeft: 16, color: "#6b7280", fontSize: 12 }}>
              {p.daysToDeadline === "N/A"
                ? "No deadline"
                : p.daysToDeadline < 0
                  ? `${Math.abs(p.daysToDeadline)} days overdue`
                  : `${p.daysToDeadline} days remaining`} • {Math.max(0, Math.min(100, Number(p.progress) || 0))}% progress
            </div>
          </div>
        )) : (
          <div style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic" }}>No items</div>
        )}
      </div>
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
    ok: { bg: "#dcfce7", fg: "#166534" },
    warn: { bg: "#fef3c7", fg: "#92400e" },
    danger: { bg: "#fee2e2", fg: "#991b1b" },
  };
  const c = map[tone] || map.primary;
  return (
    <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900, background: c.bg, color: c.fg }}>
      {text}
    </span>
  );
}

function BarMini({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const color = v >= 80 ? "#10b981" : v >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ ...styles.progressOuter, width: 120 }}>
        <div style={{ ...styles.progressInner, width: `${v}%`, background: color }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 900 }}>{v}%</div>
    </div>
  );
}

function UserSelect({ value, onChange, users, placeholder }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select}>
      <option value="all">{placeholder}</option>
      {users
        .slice()
        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
        .map((u) => (
          <option key={u.id || u._id} value={u.id || u._id}>
            {u.name} {u.email ? `(${u.email})` : ""}
          </option>
        ))}
    </select>
  );
}

/* ------------------------- Export CSV (REAL) ------------------------- */

function exportCSV(projects, users) {
  const userNameById = new Map(users.map((u) => [u.id || u._id, u.name]));

  const rows = projects.map((p) => ({
    id: p.id,
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
  const csv = [
    header.join(","),
    ...rows.map((r) =>
      header
        .map((k) => escapeCSV(r[k]))
        .join(",")
    ),
  ].join("\n");

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
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ------------------------- Styles ------------------------- */

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

  filtersRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  select: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    minWidth: 180,
  },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  toggleBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    fontWeight: 900,
    cursor: "pointer",
  },
  toggleOn: { background: "#eef2ff", borderColor: "#c7d2fe", color: "#3730a3" },
  toggleOff: { background: "white", borderColor: "#e5e7eb", color: "#374151" },

  sectionTitle: { fontSize: 18, fontWeight: 950, color: "#111827", marginBottom: 12 },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  kpiCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  },

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
  progressInner: {
    height: "100%",
    borderRadius: 999,
  },

  resourceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },

  contributorCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    background: "#eef2ff",
    display: "grid",
    placeItems: "center",
    fontSize: 18,
  },
  contributorMeta: {
    marginTop: 10,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
    fontSize: 12,
    color: "#6b7280",
  },

  deptGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  deptCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    textAlign: "center",
  },

  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 900,
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
  },
  td: { padding: "12px 12px", fontSize: 13 },

  riskGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 },
  riskBox: {
    border: "1px solid",
    borderRadius: 14,
    padding: 12,
  },

  tabRow: {
    display: "flex",
    gap: 10,
    marginTop: 10,
    flexWrap: "wrap",
  },

  projectCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    background: "white",
  },
};

// Global keyframes (put this in your globals.css if you want)
// @keyframes spin { to { transform: rotate(360deg) } }
