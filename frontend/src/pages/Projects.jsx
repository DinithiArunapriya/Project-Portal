import React from "react";
import { Link } from "react-router-dom";
import { useNotify } from "../notifications/NotificationProvider";

import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Table, { Th, Td } from "../components/ui/Table";

import ProjectModal from "../components/ProjectModal";
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_CATEGORIES,
} from "../services/projectsApi";

import { listUsersForAssign } from "../services/tasksApi";

export default function Projects() {
  const notify = useNotify();

  const [projects, setProjects] = React.useState([]);
  const [users, setUsers] = React.useState([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState("create");
  const [selected, setSelected] = React.useState(null);

  // Filters (same style as Tasks)
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
      const [p, u] = await Promise.all([listProjects(), listUsersForAssign()]);
      setProjects(p || []);
      setUsers(u || []);
    } catch (e) {
      const msg = e?.message || "Failed to load projects";
      setError(msg);
      notify({ title: "Error", message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  React.useEffect(() => {
    load();
  }, [load]);

  const userName = (id) => {
    if (!id) return "—";
    const u = users.find((x) => x.id === id);
    return u ? u.name : "Unknown";
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

    return projects.filter((p) => {
      const matchesText =
        !text ||
        (p.name || "").toLowerCase().includes(text) ||
        (p.owner || "").toLowerCase().includes(text);

      const matchesStatus = status === "ALL" || p.status === status;
      const matchesAssignee = assigneeId === "ALL" || (p.assigneeId || "") === assigneeId;
      const matchesPriority = priority === "ALL" || (p.priority || "MEDIUM") === priority;
      const matchesCategory = category === "ALL" || (p.category || "OTHER") === category;

      const ts = p.updatedAt || 0;
      const matchesFrom = fromTs == null || ts >= fromTs;
      const matchesTo = toTs == null || ts <= toTs;

      return matchesText && matchesStatus && matchesAssignee && matchesPriority && matchesCategory && matchesFrom && matchesTo;
    });
  }, [projects, q, status, assigneeId, priority, category, fromDate, toDate]);

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setOpen(true);
  };

  const openEdit = (p) => {
    setMode("edit");
    setSelected(p);
    setOpen(true);
  };

  const onSubmit = async (payload) => {
    try {
      if (mode === "edit" && selected?.id) {
        await updateProject(selected.id, payload);
        notify({ title: "Saved", message: "Project updated", type: "success" });
      } else {
        await createProject(payload);
        notify({ title: "Created", message: "Project created", type: "success" });
      }
      setOpen(false);
      await load();
    } catch (e) {
      notify({ title: "Error", message: e?.message || "Save failed", type: "error" });
    }
  };

  const onDelete = async (p) => {
    const ok = window.confirm(`Delete project "${p.name}"?`);
    if (!ok) return;

    try {
      await deleteProject(p.id);
      notify({ title: "Deleted", message: "Project deleted", type: "success" });
      await load();
    } catch (e) {
      notify({ title: "Error", message: e?.message || "Delete failed", type: "error" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Track and manage project progress"
        actions={<Button variant="primary" onClick={openCreate}>+ New Project</Button>}
      />

      {/* Filters */}
      <Card style={{ marginBottom: 12 }}>
        <div style={styles.filtersTop}>
          <div style={{ fontSize: 22, fontWeight: 950 }}>Filters</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" onClick={() => setShowMore((s) => !s)} style={styles.linkBtn}>
              {showMore ? "Less Filters" : "More Filters"}
            </button>
            <button type="button" onClick={clearAll} style={styles.linkBtnStrong}>Clear All</button>
          </div>
        </div>

        <div style={styles.filtersGrid}>
          <div>
            <div style={styles.label}>Search</div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects..." style={styles.input} />
          </div>

          <div>
            <div style={styles.label}>Status</div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
              <option value="ALL">All Statuses</option>
              {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
                  {PROJECT_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <div style={styles.label}>Category</div>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
                  <option value="ALL">All Categories</option>
                  {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <div style={styles.label}>Date Range</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={styles.input} />
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={styles.input} />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </Card>

      {loading ? <Card>Loading projects…</Card> : null}
      {error ? <Card style={styles.error}>{error}</Card> : null}

      {!loading && !error ? (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Owner</Th>
                <Th>Assigned To</Th>
                <Th>Status</Th>
                <Th>Progress</Th>
                <Th>Updated</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link to={`/projects/${p.id}`} style={styles.link}>
                      {p.name}
                    </Link>
                  </Td>
                  <Td>{p.owner}</Td>
                  <Td>{userName(p.assigneeId)}</Td>
                  <Td><Pill>{p.status}</Pill></Td>
                  <Td>{Number(p.progress || 0)}%</Td>
                  <Td>{formatTime(p.updatedAt)}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="ghost" onClick={() => openEdit(p)}>Edit</Button>
                      <Button variant="danger" onClick={() => onDelete(p)}>Delete</Button>
                    </div>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <Td colSpan={7}>No projects match your filters.</Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </Card>
      ) : null}

      <ProjectModal
        open={open}
        mode={mode}
        initial={selected}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}

function Pill({ children }) {
  return <span style={styles.pill}>{children}</span>;
}

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

const styles = {
  error: { background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" },

  filtersTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  linkBtn: { border: "none", background: "transparent", cursor: "pointer", color: "#6b7280", fontWeight: 800 },
  linkBtnStrong: { border: "none", background: "transparent", cursor: "pointer", color: "#1f3a8a", fontWeight: 900 },

  filtersGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  label: { fontSize: 13, fontWeight: 900, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", outline: "none" },
  select: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "white" },

  link: { textDecoration: "none", fontWeight: 950, color: "#111827" },

  pill: { display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900, background: "#f3f4f6", color: "#374151" },
};
