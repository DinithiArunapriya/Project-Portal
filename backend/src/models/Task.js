const mongoose = require("mongoose");

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const taskSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true }, // optional custom id
    projectId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    assigneeId: { type: String, default: null, index: true },
    status: { type: String, enum: TASK_STATUSES, default: "TODO" },
    priority: { type: String, enum: TASK_PRIORITIES, default: "MEDIUM" },
    dueDate: { type: String, default: "" } // YYYY-MM-DD for easy frontend
  },
  { timestamps: true }
);

module.exports = {
  Task: mongoose.model("Task", taskSchema),
  TASK_STATUSES,
  TASK_PRIORITIES
};
