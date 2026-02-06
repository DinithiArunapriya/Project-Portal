const mongoose = require("mongoose");

const USER_ROLES = [
  "SUPER_ADMIN",
  "MANAGER",
  "DEVELOPER",
  "DESIGNER",
  "QA",
  "HR",
  "BUSINESS_ANALYST",
];

const userSchema = new mongoose.Schema(
  {
    id: { type: String, index: true, unique: true }, // optional custom id
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: "DEVELOPER" },
    department: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: null } // base64 or url
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", userSchema),
  USER_ROLES
};
