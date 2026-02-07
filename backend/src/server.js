require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 8081;

(async () => {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
})();
