const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },

    profile: {
      name: { type: String, default: "" },
      jobTitle: { type: String, default: "" },
      department: { type: String, default: "" },
      bio: { type: String, default: "" },
      avatar: { type: String, default: null }
    },

    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      taskReminders: { type: Boolean, default: true }
    },

    appearance: {
      theme: { type: String, default: "light" },
      colorScheme: { type: String, default: "primary" }
    }
  },
  { timestamps: true }
);

module.exports = { Settings: mongoose.model("Settings", settingsSchema) };
