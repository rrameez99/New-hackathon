const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ============================================================
// POST /api/auth/register — Create new account
// ============================================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "Account already exists. Please sign in." });
    }

    const isVerifiedStudent = email.toLowerCase().endsWith(".edu");

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      isVerifiedStudent,
    });

    await user.save();

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// ============================================================
// POST /api/auth/login — Sign in with email + password
// ============================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "Account not found. Please sign up first." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to sign in" });
  }
});

// ============================================================
// GET /api/auth/profile/:userId — Get public profile
// ============================================================
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Count past games dynamically
    const Game = require("../models/Game");
    const pastGames = await Game.countDocuments({
      "players.userId": req.params.userId,
      time: { $lt: new Date() },
    });

    const userObj = user.toObject();
    userObj.gamesPlayed = pastGames;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ============================================================
// PUT /api/auth/favorites — Update favorite sports
// ============================================================
router.put("/favorites", async (req, res) => {
  try {
    const { userId, favoriteSports } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { favoriteSports },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update favorites" });
  }
});

module.exports = router;
