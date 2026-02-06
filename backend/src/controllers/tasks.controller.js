const { Task } = require("../models/Task");

async function listTasks(req, res) {
  const tasks = await Task.find().sort({ updatedAt: -1 }).lean();
  res.json(tasks.map(t => ({
    id: t.id || t._id.toString(),
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    assigneeId: t.assigneeId,
    status: t.status,
    priority: t.priority,
    category: t.category || "OTHER",
    dueDate: t.dueDate,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  })));
}

async function listTasksByProject(req, res) {
  const { projectId } = req.params;
  const tasks = await Task.find({ projectId }).sort({ updatedAt: -1 }).lean();
  res.json(tasks.map(t => ({
    id: t.id || t._id.toString(),
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    assigneeId: t.assigneeId,
    status: t.status,
    priority: t.priority,
    category: t.category || "OTHER",
    dueDate: t.dueDate,
    updatedAt: t.updatedAt
  })));
}

async function getTaskById(req, res) {
  const id = req.params.id;
  const t = await Task.findOne({ $or: [{ id }, { _id: id }] }).lean();
  if (!t) return res.status(404).json({ message: "Task not found" });

  res.json({
    id: t.id || t._id.toString(),
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    assigneeId: t.assigneeId,
    status: t.status,
    priority: t.priority,
    category: t.category || "OTHER",
    dueDate: t.dueDate,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  });
}

async function createTask(req, res) {
  const payload = req.body || {};
  if (!payload.projectId) return res.status(400).json({ message: "projectId required" });
  if (!payload.title) return res.status(400).json({ message: "title required" });

  const created = await Task.create({
    id: payload.id || undefined,
    projectId: payload.projectId,
    title: payload.title,
    description: payload.description || "",
    assigneeId: payload.assigneeId || null,
    status: payload.status || "TODO",
    priority: payload.priority || "MEDIUM",
    category: payload.category || "OTHER",
    dueDate: payload.dueDate || ""
  });

  res.status(201).json({
    id: created.id || created._id.toString(),
    projectId: created.projectId,
    title: created.title,
    description: created.description,
    assigneeId: created.assigneeId,
    status: created.status,
    priority: created.priority,
    category: created.category || "OTHER",
    dueDate: created.dueDate,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt
  });
}

async function updateTask(req, res) {
  const id = req.params.id;
  const payload = req.body || {};

  const t = await Task.findOne({ $or: [{ id }, { _id: id }] });
  if (!t) return res.status(404).json({ message: "Task not found" });

  Object.assign(t, {
    title: payload.title ?? t.title,
    description: payload.description ?? t.description,
    assigneeId: payload.assigneeId ?? t.assigneeId,
    status: payload.status ?? t.status,
    priority: payload.priority ?? t.priority,
    category: payload.category ?? t.category,
    dueDate: payload.dueDate ?? t.dueDate
  });

  await t.save();
  res.json({ ok: true });
}

async function deleteTask(req, res) {
  const id = req.params.id;
  const d = await Task.findOneAndDelete({ $or: [{ id }, { _id: id }] });
  if (!d) return res.status(404).json({ message: "Task not found" });
  res.json({ ok: true });
}

async function myTasks(req, res) {
  const myId = req.user?.id;
  const tasks = await Task.find({ assigneeId: myId }).sort({ updatedAt: -1 }).lean();
  res.json(tasks.map(t => ({
    id: t.id || t._id.toString(),
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    assigneeId: t.assigneeId,
    status: t.status,
    priority: t.priority,
    category: t.category || "OTHER",
    dueDate: t.dueDate,
    updatedAt: t.updatedAt
  })));
}

module.exports = {
  listTasks,
  listTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  myTasks
};
