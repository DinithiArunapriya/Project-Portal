import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useNotify } from "../notifications/NotificationProvider";

import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Table, { Th, Td } from "../components/ui/Table";

import { getProjectById, listProjects } from "../services/projectsApi";
import {
  STATUSES,
  PRIORITIES,
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  listUsersForAssign,
} from "../services/tasksApi";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [project, setProject] = React.useState(null);
  const [allProjects, setAllProjects] = React.useState([]);

  const [tasks, setTasks] = React.useState([]);
  const [users, setUsers] = React.useState([]);

  // Inline create task form state
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [assigneeId, setAssigneeId] = React.useState("");
  const [status, setStatus] = React.useState("TODO");
  const [priority, setPriority] = React.useState("MEDIUM");
  const [dueDate, setDueDate] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [p, t, u, ps] = await Promise.all([
        getProjectById(id),
        listTasks(),
        listUsersForAssign(),
        listProjects(),
      ]);

      if (!p) {
        setProject(null);
        setTasks([]);
        setUsers(u || []);
        setAllProjects(ps || []);
        setError("Project not found.");
        return;
      }

      setProject(p);
      setAllProjects(ps || []);
      setUsers(u || []);

      const related = (t || []).filter((x) => (x.projectId || null) === (id || null));
      setTasks(related);
    } catch (e) {
      const msg = e?.message || "Failed to load project details";
      setError(msg);
      notify({ title: "Load failed", message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  React.useEffect(() => {
    load();
  }, [load]);

  const projectProgress = React.useMemo(() => {
    if (!tasks.length) return project?.progress ?? 0;
    const done = tasks.filter((t) => t.status === "DONE").length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks, project]);

  const onCreateTask = async () => {
    if (!title.trim()) {
      notify({ title: "Missing title", message: "Task title is required.", type: "error" });
      return;
    }

    try {
      await createTask({
        projectId: id,
        title,
        description,
        assigneeId: assigneeId || null,
        status,
        priority,
        dueDate: dueDate || null,
      });

      notify({ title: "Task created", message: "Task added to this project.", type: "success" });

      setTitle("");
      setDescription("");
      setAssigneeId("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setDueDate("");

      await load();
    } catch (e) {
      notify({ title: "Create failed", message: e?.message || "Failed to create task.", type: "error" });
    }
  };

  const onStatusChange = async (taskId, nextStatus) => {
    try {
      await updateTask(taskId, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus, updatedAt: Date.now() } : t)));
      notify({ title: "Status updated", message: `Task moved to ${nextStatus}.`, type: "success" });
    } catch (e) {
      notify({ title: "Update failed", message: e?.message || "Failed to update status.", type: "error" });
    }
  };

  const onDeleteTask = async (t) => {
    const ok = window.confirm(`Delete task "${t.title}"?`);
    if (!ok) return;

    try {
      await deleteTask(t.id);
      notify({ title: "Task deleted", message: "Task removed.", type: "success" });
      await load();
    } catch (e) {
      notify({ title: "Delete failed", message: e?.message || "Failed to delete task.", type: "error" });
    }
  };

  const onBack = () => navigate("/projects");

  if (loading) return <Card>Loading project…</Card>;

  if (error && !project) {
    return (
      <div>
        <PageHeader
          title="Project Details"
          subtitle="Project not found"
          actions={<Button onClick={onBack}>← Back to Projects</Button>}
        />
        <Card style={{ background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" }}>{error}</Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={project?.name || "Project"}
        subtitle={`Owner: ${project?.owner || "—"} • Status: ${project?.status || "—"}`}
        actions={<Button onClick={onBack}>← Back</Button>}
      />

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 12 }}>
        <Card>
          <div style={meta.label}>Project ID</div>
          <div style={meta.value}>{project?.id}</div>
        </Card>
        <Card>
          <div style={meta.label}>Progress</div>
          <div style={meta.value}>{projectProgress}%</div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={projectProgress} />
          </div>
        </Card>
        <Card>
          <div style={meta.label}>Tasks</div>
          <div style={meta.value}>{tasks.length}</div>
          <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>
            Done: {tasks.filter((t) => t.status === "DONE").length}
          </div>
        </Card>
      </div>

      {/* Create task inline */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 950, marginBottom: 10 }}>Add Task</div>

        <div style={form.grid}>
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={form.input} placeholder="Task title" />
          </Field>

          <Field label="Assignee">
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={form.input}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={form.input}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Priority">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={form.input}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Due Date">
            <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={form.input} type="date" />
          </Field>
        </div>

        <div style={{ marginTop: 10 }}>
          <label style={form.label}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...form.input, height: 90, resize: "vertical" }}
            placeholder="Optional description"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <Button variant="primary" onClick={onCreateTask}>
            + Add Task
          </Button>
        </div>
      </Card>

      {/* Tasks table */}
      <Card>
        <div style={{ fontWeight: 950, marginBottom: 10 }}>Project Tasks</div>

        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Assignee</Th>
              <Th>Status</Th>
              <Th>Priority</Th>
              <Th>Due</Th>
              <Th>Updated</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <Td>
                  <div style={{ fontWeight: 950 }}>{t.title}</div>
                  <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{t.description || "—"}</div>
                </Td>

                <Td>{assigneeName(users, t.assigneeId)}</Td>

                <Td>
                  <select
                    value={t.status}
                    onChange={(e) => onStatusChange(t.id, e.target.value)}
                    style={{ ...form.input, padding: "6px 10px", width: 170 }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Td>

                <Td>
                  <Pill>{t.priority}</Pill>
                </Td>

                <Td>{t.dueDate || "—"}</Td>
                <Td>{formatTime(t.updatedAt)}</Td>

                <Td>
                  <Button variant="danger" onClick={() => onDeleteTask(t)}>
                    Delete
                  </Button>
                </Td>
              </tr>
            ))}

            {tasks.length === 0 ? (
              <tr>
                <Td colSpan={7}>No tasks for this project yet.</Td>
              </tr>
            ) : null}
          </tbody>
        </Table>

        {/* Helpful link back */}
        <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
          Tip: You can also manage all tasks from{" "}
          <Link to="/tasks" style={{ fontWeight: 900, textDecoration: "none", color: "#111827" }}>
            Tasks
          </Link>
          .
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={form.label}>{label}</label>
      {children}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        background: "#f3f4f6",
        color: "#374151",
      }}
    >
      {children}
    </span>
  );
}

function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div style={{ height: 10, borderRadius: 999, background: "#f3f4f6", overflow: "hidden", border: "1px solid #e5e7eb" }}>
      <div style={{ height: "100%", width: `${v}%`, background: "#111827" }} />
    </div>
  );
}

function assigneeName(users, id) {
  if (!id) return "Unassigned";
  const u = users.find((x) => x.id === id);
  return u ? u.name : "Unknown";
}

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

const meta = {
  label: { fontSize: 12, color: "#6b7280", fontWeight: 900 },
  value: { fontSize: 22, fontWeight: 950, marginTop: 6 },
};

const form = {
  grid: { display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12 },
  label: { fontSize: 12, color: "#6b7280", fontWeight: 900, marginBottom: 6, display: "block" },
  input: { width: "100%", padding: 10, border: "1px solid #e5e7eb", borderRadius: 10, outline: "none", background: "white" },
};
