const mongoose = require("mongoose");

const PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "DONE"];
const PROJECT_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const PROJECT_CATEGORIES = ["INTERNAL", "CLIENT", "MAINTENANCE", "OTHER"];

const projectSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true }, // optional custom id
    name: { type: String, required: true },
    owner: { type: String, default: "" }, // display string
    ownerId: { type: String, default: null },
    assigneeId: { type: String, default: null },
    status: { type: String, enum: PROJECT_STATUSES, default: "PLANNING" },
    priority: { type: String, enum: PROJECT_PRIORITIES, default: "MEDIUM" },
    category: { type: String, enum: PROJECT_CATEGORIES, default: "OTHER" },
    progress: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = {
  Project: mongoose.model("Project", projectSchema),
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_CATEGORIES
};
