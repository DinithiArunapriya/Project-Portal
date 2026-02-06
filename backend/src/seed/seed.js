require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/db");
const { User } = require("../models/User");

const DEMO_USERS = [
  { id: "u_super_admin", name: "Super Admin", email: "superadmin@portal.test", password: "Super@123", role: "SUPER_ADMIN", department: "Admin" },
  { id: "u_manager", name: "Manager", email: "manager@portal.test", password: "Manager@123", role: "MANAGER", department: "Management" },
  { id: "u_dev", name: "Developer", email: "developer@portal.test", password: "Developer@123", role: "DEVELOPER", department: "Engineering" },
  { id: "u_qa", name: "QA Engineer", email: "qa@portal.test", password: "Qa@123", role: "QA", department: "Quality" },
  { id: "u_designer", name: "Designer", email: "designer@portal.test", password: "Designer@123", role: "DESIGNER", department: "Design" },
  { id: "u_hr", name: "HR", email: "hr@portal.test", password: "Hr@123", role: "HR", department: "Human Resources" }
];

(async () => {
  await connectDB(process.env.MONGO_URI);

  for (const u of DEMO_USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) continue;

    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash,
      role: u.role,
      department: u.department,
      isActive: true
    });
  }

  console.log("✅ Seed complete");
  process.exit(0);
})();
