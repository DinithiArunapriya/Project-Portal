require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/db");
const { User } = require("../models/User");
const { Project } = require("../models/Project");
const { Task } = require("../models/Task");

const DEMO_USERS = [
  { id: "u_super_admin", name: "Emma Frank", email: "superadmin@portal.test", password: "Super@123", role: "SUPER_ADMIN", department: "Admin" },
  { id: "u_manager", name: "Anne Silva", email: "manager@portal.test", password: "Manager@123", role: "MANAGER", department: "Management" },
  { id: "u_dev", name: "David Brown", email: "developer@portal.test", password: "Developer@123", role: "DEVELOPER", department: "Engineering" },
  { id: "u_qa", name: "Shayne Wards", email: "qa@portal.test", password: "Qa@123", role: "QA", department: "Quality" },
  { id: "u_designer", name: "Johnny Doe", email: "designer@portal.test", password: "Designer@123", role: "DESIGNER", department: "Design" },
  { id: "u_hr", name: "Rachel Adams", email: "hr@portal.test", password: "Hr@123", role: "HR", department: "Human Resources" }
];

const DEMO_PROJECTS = [
  {
    id: "p2",
    name: "Mobile App MVP",
    description: "Finalize MVP features and acceptance criteria.",
    owner: "Manager",
    ownerId: "u_manager",
    assigneeId: "u_dev",
    status: "PLANNING",
    priority: "MEDIUM",
    category: "INTERNAL",
    progress: 20,
    startDate: "2026-02-01",
    endDate: "2026-02-28"
  },
  {
    id: "p3",
    name: "Website Redesign",
    description: "Header + Sidebar + protected routes.",
    owner: "Manager",
    ownerId: "u_manager",
    assigneeId: "u_designer",
    status: "IN_PROGRESS",
    priority: "HIGH",
    category: "CLIENT",
    progress: 55,
    startDate: "2026-01-10",
    endDate: "2026-02-20"
  }
];

const DEMO_TASKS = [
  {
    id: "t1",
    projectId: "p2",
    title: "Define MVP scope",
    description: "Finalize scope with stakeholders.",
    assigneeId: "u_manager",
    status: "BLOCKED",
    priority: "HIGH",
    category: "RESEARCH",
    dueDate: "2026-02-10"
  },
  {
    id: "t2",
    projectId: "p2",
    title: "Design Projects table UI",
    description: "Table + create modal + status pills.",
    assigneeId: "u_designer",
    status: "TODO",
    priority: "LOW",
    category: "UI_UX",
    dueDate: "2026-02-12"
  }
];

(async () => {
  await connectDB(process.env.MONGO_URI);

  for (const u of DEMO_USERS) {
    const email = String(u.email || "").toLowerCase().trim();
    const exists = await User.findOne({ $or: [{ email }, { id: u.id }] });

    if (exists) {
      exists.id = u.id || exists.id;
      exists.name = u.name;
      exists.email = email;
      exists.role = u.role;
      exists.department = u.department;
      exists.isActive = true;

      // Only set password if missing (don't overwrite real users)
      if (!exists.passwordHash && u.password) {
        exists.passwordHash = await bcrypt.hash(u.password, 10);
      }

      await exists.save();
      continue;
    }

    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({
      id: u.id,
      name: u.name,
      email,
      passwordHash,
      role: u.role,
      department: u.department,
      isActive: true
    });
  }

  for (const p of DEMO_PROJECTS) {
    const exists = await Project.findOne({ $or: [{ id: p.id }, { name: p.name }] });
    if (exists) continue;
    await Project.create(p);
  }

  for (const t of DEMO_TASKS) {
    const exists = await Task.findOne({ $or: [{ id: t.id }, { title: t.title, projectId: t.projectId }] });
    if (exists) continue;
    await Task.create(t);
  }

  console.log("✅ Seed complete");
  process.exit(0);
})();
