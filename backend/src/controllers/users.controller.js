const bcrypt = require("bcryptjs");
const { User, USER_ROLES } = require("../models/User");

async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  res.json(users.map(u => ({
    id: u.id || u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    isActive: u.isActive,
    avatar: u.avatar || null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  })));
}

async function createUser(req, res) {
  const { id, name, email, password, role, department, isActive, avatar } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: "name, email, password required" });

  const r = role && USER_ROLES.includes(role) ? role : "DEVELOPER";
  const cleanId = String(id || "").trim() || undefined;
  const passwordHash = await bcrypt.hash(String(password), 10);

  const created = await User.create({
    id: cleanId,
    name,
    email: String(email).toLowerCase().trim(),
    passwordHash,
    role: r,
    department: department || "",
    isActive: isActive !== false,
    avatar: avatar || null
  });

  res.status(201).json({
    id: created.id || created._id.toString(),
    name: created.name,
    email: created.email,
    role: created.role,
    department: created.department,
    isActive: created.isActive,
    avatar: created.avatar || null
  });
}

async function updateUser(req, res) {
  const userId = req.params.id;
  const { id, name, email, password, role, department, isActive, avatar } = req.body || {};

  const user = await User.findOne({ $or: [{ id: userId }, { _id: userId }] });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (id != null) {
    const cleanId = String(id || "").trim() || undefined;
    user.id = cleanId;
  }
  if (name != null) user.name = name;
  if (email != null) user.email = String(email).toLowerCase().trim();
  if (role != null && USER_ROLES.includes(role)) user.role = role;
  if (department != null) user.department = department;
  if (isActive != null) user.isActive = !!isActive;
  if (avatar !== undefined) user.avatar = avatar;

  if (password) {
    user.passwordHash = await bcrypt.hash(String(password), 10);
  }

  await user.save();

  res.json({
    id: user.id || user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    isActive: user.isActive,
    avatar: user.avatar || null
  });
}

async function deleteUser(req, res) {
  const userId = req.params.id;
  const deleted = await User.findOneAndDelete({ $or: [{ id: userId }, { _id: userId }] });
  if (!deleted) return res.status(404).json({ message: "User not found" });
  res.json({ ok: true });
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
