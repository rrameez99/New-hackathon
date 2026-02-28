const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ============================================================
// POST /api/auth/register — Register a new user
// ============================================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, major, skillLevel, firebaseUid } = req.body;

    // Check .edu email
    if (!email || !email.endsWith(".edu")) {
      return res.status(400).json({ error: "Must use a .edu email address" });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = new User({
      name,
      email,
      major: major || "",
      skillLevel: skillLevel || "Beginner",
      firebaseUid,
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to register" });
  }
});

// ============================================================
// POST /api/auth/login — Login (find user by Firebase UID)
// ============================================================
router.post("/login", async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
});

// ============================================================
// GET /api/auth/user/:id — Get user profile
// ============================================================
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ============================================================
// PUT /api/auth/user/:id — Update profile
// ============================================================
router.put("/user/:id", async (req, res) => {
  try {
    const { name, major, skillLevel, favoriteSports } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, major, skillLevel, favoriteSports },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
