const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const gameRoutes = require("./routes/games");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());

// Request logger (helpful during development)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================================
// ROUTES
// ============================================================
app.get("/", (req, res) => {
  res.json({ message: "🏓 PlayNow API is running!" });
});

app.use("/api/games", gameRoutes);
app.use("/api/auth", authRoutes);

// ============================================================
// START SERVER
// ============================================================
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🏓 PlayNow server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   GET    /api/games`);
    console.log(`   POST   /api/games`);
    console.log(`   POST   /api/games/:id/join`);
    console.log(`   POST   /api/games/:id/leave`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login\n`);
  });
};

startServer();
