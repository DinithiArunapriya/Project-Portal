const mongoose = require("mongoose");

async function connectDB(uri) {
  mongoose.set("strictQuery", true);

  // If uri isn't provided, try environment variable, otherwise use a sensible local fallback.
  let mongoUri = uri || process.env.MONGO_URI;

  if (!mongoUri) {
    const fallback = "mongodb://127.0.0.1:27017/project-portal";
    console.warn(
      "⚠️  MONGO_URI not set. Falling back to local MongoDB at:",
      fallback,
      "\nIf you intended to use a different database, set MONGO_URI in your .env file or environment."
    );
    mongoUri = fallback;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message || err);
    // Re-throw so calling code / process can handle exit or retry.
    throw err;
  }
}

module.exports = { connectDB };
