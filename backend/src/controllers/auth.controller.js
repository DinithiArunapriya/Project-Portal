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

  const ok = await bcrypt.compare(String(password), user.passwordHash);
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

module.exports = { login };
