const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { id: user.id || user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user || user.isActive === false) return res.status(401).json({ message: "Invalid credentials" });

  let ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok && user.passwordHash === String(password)) {
    // One-time migration for legacy records that stored plain passwords.
    user.passwordHash = await bcrypt.hash(String(password), 10);
    await user.save();
    ok = true;
  }
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);

  // Send user object (without passwordHash)
  return res.json({
    token,
    user: {
      id: user.id || user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      avatar: user.avatar || null
    }
  });
}

async function listDemoUsers(req, res) {
  const users = await User.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).lean();
  res.json(
    users.map((u) => ({
      id: u.id || u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      avatar: u.avatar || null,
      createdAt: u.createdAt,
    }))
  );
}

module.exports = { login, listDemoUsers };
