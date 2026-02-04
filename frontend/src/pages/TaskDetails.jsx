import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getProjectById } from "../services/projectsApi";
import { listTasks, updateTask, deleteTask } from "../services/tasksApi";
import { listUsers } from "../services/usersApi";

export default function TaskDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState(null);
  const [project, setProject] = React.useState(null);
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const [allTasks, u] = await Promise.all([listTasks(), listUsers()]);
        const t = allTasks.find((x) => String(x.id) === String(id)) || null;

        if (!mounted) return;
        setUsers(u || []);
        setTask(t);

        if (t?.projectId) {
          const p = await getProjectById(t.projectId);
          if (mounted) setProject(p || null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const userName = (uid) => {
    if (!uid) return "Unassigned";
    const u = users.find((x) => String(x.id) === String(uid));
    return u?.name || "Unknown";
  };

  const onToggleDone = async () => {
    if (!task) return;
    const next = task.status === "DONE" ? "TODO" : "DONE";
    setTask({ ...task, status: next });
    await updateTask(task.id, { status: next });
  };

  const onDelete = async () => {
    if (!task) return;
    const ok = window.confirm("Delete this task?");
    if (!ok) return;
    await deleteTask(task.id);
    nav("/tasks");
  };

  if (loading) return <Card>Loading…</Card>;
  if (!task) return <Card>Task not found.</Card>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 950 }}>{task.title}</div>
          <div style={{ marginTop: 6, color: "#64748b", fontWeight: 800 }}>
            Project: {project?.name || "—"} • Assigned: {userName(task.assigneeId)} • Status: {task.status}
          </div>
        </div>
        <Button onClick={() => nav(-1)}>← Back</Button>
      </div>

      <Card style={{ marginTop: 14 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <div><b>Description:</b> {task.description || "—"}</div>
          <div><b>Priority:</b> {task.priority}</div>
          <div><b>Category:</b> {task.category}</div>
          <div><b>Due:</b> {task.dueDate || "—"}</div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
            <Button variant="ghost" onClick={onToggleDone}>
              {task.status === "DONE" ? "Mark TODO" : "Mark DONE"}
            </Button>
            <Button variant="danger" onClick={onDelete}>Delete</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
