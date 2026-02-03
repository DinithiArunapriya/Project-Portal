const PROJECTS_KEY = "projects_v1";
const TASKS_KEY = "tasks_v1";
const USERS_KEY = "users_v1";

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function daysAgoTs(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export async function getReports(rangeDays) {
  // simulate network
  await new Promise((r) => setTimeout(r, 200));

  const projects = read(PROJECTS_KEY);
  const tasks = read(TASKS_KEY);
  const users = read(USERS_KEY);

  const fromTs = rangeDays === "ALL" ? 0 : daysAgoTs(Number(rangeDays));
  const inRange = (ts) => (ts ? ts >= fromTs : false);

  const projectsInRange = projects.filter((p) => inRange(p.updatedAt || p.createdAt || 0));
  const tasksInRange = tasks.filter((t) => inRange(t.updatedAt || t.createdAt || 0));

  // status distribution
  const statusCounts = countBy(tasksInRange, (t) => t.status || "UNKNOWN");

  // priority distribution
  const priorityCounts = countBy(tasksInRange, (t) => t.priority || "UNKNOWN");

  // last 14 days trend (task updates)
  const trendDays = 14;
  const trend = buildTrend(tasks, trendDays);

  return {
    rangeDays,
    totals: {
      totalUsers,
      activeUsers,
      totalProjects,
      avgProjectProgress,
      totalTasks,
      openTasks,
      doneTasks,
      overdueTasks,
      projectsInRange: projectsInRange.length,
      tasksInRange: tasksInRange.length,
    },
    distributions: {
      statusCounts,
      priorityCounts,
    },
    trend,
  };
}

function countBy(items, keyFn) {
  const out = {};
  for (const item of items) {
    const k = keyFn(item);
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

function isOverdue(dueISO, status) {
  if (!dueISO) return false;
  if (status === "DONE") return false;

  const today = new Date();
  const today0 = new Date(today.toISOString().slice(0, 10) + "T00:00:00").getTime();
  const due = new Date(dueISO + "T00:00:00").getTime();
  return due < today0;
}

function buildTrend(tasks, days) {
  // buckets per day (0..days-1), oldest -> newest
  const now = Date.now();
  const start = daysAgoTs(days - 1);

  const buckets = Array.from({ length: days }, (_, i) => {
    const dayTs = start + i * 86400000;
    const label = new Date(dayTs).toISOString().slice(5, 10); // MM-DD
    return { dayTs, label, updates: 0 };
  });

  for (const t of tasks) {
    const ts = t.updatedAt || t.createdAt || 0;
    if (!ts) continue;
    if (ts < start || ts > now) continue;

    const day = startOfDay(ts);
    const idx = Math.round((day - start) / 86400000);
    if (idx >= 0 && idx < buckets.length) buckets[idx].updates += 1;
  }

  return buckets;
}
