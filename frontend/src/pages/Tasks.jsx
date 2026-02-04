import React from "react";
import { useNotify } from "../notifications/NotificationProvider";

import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Table, { Th, Td } from "../components/ui/Table";

import TaskModal from "../components/TaskModal";
import { listProjects } from "../services/projectsApi";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_CATEGORIES,
} from "../services/tasksApi";
import { listUsers } from "../services/usersApi";

export default function Tasks() {
  const notify = useNotify();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [tasks, setTasks] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [users, setUsers] = React.useState([]);

  // modal
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState("create");
  const [selected, setSelected] = React.useState(null);

  // Filters (screenshot)
  const [showMore, setShowMore] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [assigneeId, setAssigneeId] = React.useState("ALL");
  const [priority, setPriority] = React.useState("ALL");
  const [category, setCategory] = React.useState("ALL");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [t, p, u] = await Promise.all([listTasks(), listProjects(), listUsers()]);
      setTasks(Array.isArray(t) ? t : []);
      setProjects(Array.isArray(p) ? p : []);
      setUsers(Array.isArray(u) ? u : []);
    } catch (e) {
      const msg = e?.message || "Failed to load tasks";
      setError(msg);
      notify({ title: "Error", message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  React.useEffect(() => {
    load();
  }, [load]);

  const projectName = (id) => {
    const p = projects.find((x) => String(x.id) === String(id));
    return p?.name || "—";
  };

  const userName = (id) => {
    if (!id) return "—";
    const u = users.find((x) => String(x.id) === String(id));
    return u?.name || "Unknown";
  };

  const clearAll = () => {
    setQ("");
    setStatus("ALL");
    setAssigneeId("ALL");
    setPriority("ALL");
    setCategory("ALL");
    setFromDate("");
    setToDate("");
    notify({ title: "Cleared", message: "All filters cleared", type: "info" });
  };

  const filtered = React.useMemo(() => {
    const text = q.trim().toLowerCase();
    const fromTs = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
    const toTs = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

    return tasks.filter((t) => {
      const matchesText =
        !text ||
        String(t.title || "").toLowerCase().includes(text) ||
        String(t.description || "").toLowerCase().includes(text) ||
        projectName(t.projectId).toLowerCase().includes(text);

      const matchesStatus = status === "ALL" || String(t.status || "") === status;
      const matchesAssignee = assigneeId === "ALL" || String(t.assigneeId || "") === assigneeId;
      const matchesPriority = priority === "ALL" || String(t.priority || "MEDIUM") === priority;
      const matchesCategory = category === "ALL" || String(t.category || "OTHER") === category;

      // filter by dueDate, fallback updatedAt
      const ts = t.dueDate ? new Date(t.dueDate + "T12:00:00").getTime() : (t.updatedAt || 0);
      const matchesFrom = fromTs == null || ts >= fromTs;
      const matchesTo = toTs == null || ts <= toTs;

      return matchesText && matchesStatus && matchesAssignee && matchesPriority && matchesCategory && matchesFrom && matchesTo;
    });
  }, [tasks, q, status, assigneeId, priority, category, fromDate, toDate, projects]);

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setOpen(true);
  };

  const openEdit = (t) => {
    setMode("edit");
    setSelected(t);
    setOpen(true);
  };

  const onSubmit = async (payload) => {
    try {
      if (mode === "edit" && selected?.id) {
        await updateTask(selected.id, payload);
        notify({ title: "Saved", message: "Task updated", type: "success" });
      } else {
        await createTask(payload);
        notify({ title: "Created", message: "Task created", type: "success" });
      }
      setOpen(false);
      await load();
    } catch (e) {
      notify({ title: "Error", message: e?.message || "Save failed", type: "error" });
    }
  };

  const onDelete = async (t) => {
    const ok = window.confirm(`Delete task "${t.title}"?`);
    if (!ok) return;

    try {
      await deleteTask(t.id);
      notify({ title: "Deleted", message: "Task deleted", type: "success" });
      await load();
    } catch (e) {
      notify({ title: "Error", message: e?.message || "Delete failed", type: "error" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Create, assign, and track tasks"
        actions={
          <Button variant="primary" onClick={openCreate}>
            + New Task
          </Button>
        }
      />

      {/* Filters */}
      <Card style={{ marginBottom: 12 }}>
        <div style={styles.filtersTop}>
          <div style={{ fontSize: 26, fontWeight: 950, color: "#0f172a" }}>Filters</div>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <button type="button" onClick={() => setShowMore((s) => !s)} style={styles.linkBtn}>
              {showMore ? "Less Filters" : "More Filters"}
            </button>
            <button type="button" onClick={clearAll} style={styles.linkBtnStrong}>
              Clear All
            </button>
          </div>
        </div>

        <div style={styles.filtersGrid}>
          <div>
            <div style={styles.label}>Search</div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks..." style={styles.input} />
          </div>

          <div>
            <div style={styles.label}>Status</div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
              <option value="ALL">All Statuses</option>
              {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <div style={styles.label}>Assigned To</div>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={styles.select}>
              <option value="ALL">All Assignees</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          {showMore ? (
            <>
              <div>
                <div style={styles.label}>Priority</div>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={styles.select}>
                  <option value="ALL">All Priorities</option>
                  {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <div style={styles.label}>Category</div>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
                  <option value="ALL">All Categories</option>
                  {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <div style={styles.label}>Date Range</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={styles.input} />
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={styles.input} />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </Card>

      {loading ? <Card>Loading tasks…</Card> : null}
      {error ? <Card style={styles.error}>{error}</Card> : null}

      {!loading && !error ? (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Project</Th>
                <Th>Assigned To</Th>
                <Th>Status</Th>
                <Th>Priority</Th>
                <Th>Category</Th>
                <Th>Due</Th>
                <Th>Updated</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <Td colSpan={9} style={{ padding: 16, color: "#64748b" }}>
                    No tasks match your filters.
                  </Td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <Td>
                      <div style={{ display: "grid", gap: 4 }}>
                        <div style={styles.titleText}>{t.title}</div>
                        {t.description ? <div style={styles.subText}>{t.description}</div> : null}
                      </div>
                    </Td>
                    <Td>{projectName(t.projectId)}</Td>
                    <Td>{userName(t.assigneeId)}</Td>
                    <Td><Pill>{t.status}</Pill></Td>
                    <Td><Pill tone="neutral">{t.priority || "MEDIUM"}</Pill></Td>
                    <Td><Pill tone="neutral">{t.category || "OTHER"}</Pill></Td>
                    <Td>{t.dueDate || "—"}</Td>
                    <Td>{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "—"}</Td>
                    <Td>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <Button variant="ghost" onClick={() => openEdit(t)}>Edit</Button>
                        <Button variant="danger" onClick={() => onDelete(t)}>Delete</Button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      ) : null}

      <TaskModal
        open={open}
        mode={mode}
        initial={selected}
        users={users}
        projects={projects}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}

function Pill({ children, tone = "status" }) {
  const style =
    tone === "status"
      ? styles.pill
      : { ...styles.pill, background: "#f1f5f9", color: "#334155" };
  return <span style={style}>{children}</span>;
}

const styles = {
  error: { background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" },

  filtersTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 },
  linkBtn: { border: "none", background: "transparent", cursor: "pointer", color: "#64748b", fontWeight: 900 },
  linkBtnStrong: { border: "none", background: "transparent", cursor: "pointer", color: "#1d4ed8", fontWeight: 950 },

  filtersGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18 },
  label: { fontSize: 13, fontWeight: 950, color: "#334155", marginBottom: 8 },

  input: { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #e5e7eb", outline: "none" },
  select: { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #e5e7eb", outline: "none", background: "white" },

  titleText: { fontWeight: 950, color: "#0f172a", fontSize: 16, lineHeight: 1.2 },
  subText: { color: "#64748b", fontSize: 13, lineHeight: 1.3 },

  pill: { display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 950, background: "#f1f5f9", color: "#334155" },
};
