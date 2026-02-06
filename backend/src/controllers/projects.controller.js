const { Project } = require("../models/Project");

async function listProjects(req, res) {
  const projects = await Project.find().sort({ updatedAt: -1 }).lean();
  res.json(projects.map(p => ({
    id: p.id || p._id.toString(),
    name: p.name,
    owner: p.owner || "",
    ownerId: p.ownerId || null,
    assigneeId: p.assigneeId || null,
    status: p.status,
    priority: p.priority,
    category: p.category,
    progress: p.progress || 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  })));
}

async function getProjectById(req, res) {
  const id = req.params.id;
  const p = await Project.findOne({ $or: [{ id }, { _id: id }] }).lean();
  if (!p) return res.status(404).json({ message: "Project not found" });

  res.json({
    id: p.id || p._id.toString(),
    name: p.name,
    owner: p.owner || "",
    ownerId: p.ownerId || null,
    assigneeId: p.assigneeId || null,
    status: p.status,
    priority: p.priority,
    category: p.category,
    progress: p.progress || 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  });
}

async function createProject(req, res) {
  const payload = req.body || {};
  if (!payload.name) return res.status(400).json({ message: "Project name required" });

  const created = await Project.create({
    id: payload.id || undefined,
    name: payload.name,
    owner: payload.owner || "",
    ownerId: payload.ownerId || null,
    assigneeId: payload.assigneeId || null,
    status: payload.status || "PLANNING",
    priority: payload.priority || "MEDIUM",
    category: payload.category || "OTHER",
    progress: Number(payload.progress || 0)
  });

  res.status(201).json({ id: created.id || created._id.toString() });
}

async function updateProject(req, res) {
  const id = req.params.id;
  const payload = req.body || {};
  const p = await Project.findOne({ $or: [{ id }, { _id: id }] });
  if (!p) return res.status(404).json({ message: "Project not found" });

  Object.assign(p, {
    name: payload.name ?? p.name,
    owner: payload.owner ?? p.owner,
    ownerId: payload.ownerId ?? p.ownerId,
    assigneeId: payload.assigneeId ?? p.assigneeId,
    status: payload.status ?? p.status,
    priority: payload.priority ?? p.priority,
    category: payload.category ?? p.category,
    progress: payload.progress != null ? Number(payload.progress) : p.progress
  });

  await p.save();
  res.json({ ok: true });
}

async function deleteProject(req, res) {
  const id = req.params.id;
  const d = await Project.findOneAndDelete({ $or: [{ id }, { _id: id }] });
  if (!d) return res.status(404).json({ message: "Project not found" });
  res.json({ ok: true });
}

module.exports = { listProjects, getProjectById, createProject, updateProject, deleteProject };
