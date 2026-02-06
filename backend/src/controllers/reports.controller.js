const { User } = require("../models/User");
const { Project } = require("../models/Project");
const { Task } = require("../models/Task");

async function getSummary(req, res) {
  const [users, projects, tasks] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Task.countDocuments()
  ]);

  const doneTasks = await Task.countDocuments({ status: "DONE" });

  res.json({
    users,
    projects,
    tasks,
    doneTasks
  });
}

module.exports = { getSummary };
