const express = require("express");
const router = express.Router();
const Game = require("../models/Game");

// ============================================================
// GET /api/games — Fetch all upcoming games
// ============================================================
router.get("/", async (req, res) => {
  try {
    const { sport, date } = req.query;

    // Build filter
    const filter = { status: "upcoming", time: { $gte: new Date() } };
    if (sport && sport !== "all") {
      filter.sport = sport;
    }

    const games = await Game.find(filter).sort({ time: 1 }).limit(50);

    res.json(games);
  } catch (error) {
    console.error("GET /games error:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

// ============================================================
// GET /api/games/:id — Get single game details
// ============================================================
router.get("/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

// ============================================================
// POST /api/games — Create a new game
// ============================================================
router.post("/", async (req, res) => {
  try {
    const { sport, location, time, maxPlayers, skillLevel, description, hostId, hostName } =
      req.body;

    // Validation
    if (!sport || !location || !time || !maxPlayers) {
      return res.status(400).json({ error: "Missing required fields: sport, location, time, maxPlayers" });
    }

    if (new Date(time) < new Date()) {
      return res.status(400).json({ error: "Game time must be in the future" });
    }

    const game = new Game({
      sport,
      location,
      time: new Date(time),
      maxPlayers: parseInt(maxPlayers),
      skillLevel: skillLevel || "Any Level",
      description: description || "",
      hostId,
      hostName,
      // Host automatically joins
      players: [{ userId: hostId, name: hostName }],
    });

    const savedGame = await game.save();
    res.status(201).json(savedGame);
  } catch (error) {
    console.error("POST /games error:", error);
    res.status(500).json({ error: "Failed to create game" });
  }
});

// ============================================================
// POST /api/games/:id/join — Join a game
// ============================================================
router.post("/:id/join", async (req, res) => {
  try {
    const { userId, userName } = req.body;
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Check if game is full
    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({ error: "Game is full" });
    }

    // Check if already joined
    const alreadyJoined = game.players.some(
      (p) => p.userId && p.userId.toString() === userId
    );
    if (alreadyJoined) {
      return res.status(400).json({ error: "Already joined this game" });
    }

    // Add player
    game.players.push({ userId, name: userName });
    await game.save();

    res.json(game);
  } catch (error) {
    console.error("POST /games/:id/join error:", error);
    res.status(500).json({ error: "Failed to join game" });
  }
});

// ============================================================
// POST /api/games/:id/leave — Leave a game
// ============================================================
router.post("/:id/leave", async (req, res) => {
  try {
    const { userId } = req.body;
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Remove player
    game.players = game.players.filter(
      (p) => !p.userId || p.userId.toString() !== userId
    );
    await game.save();

    res.json(game);
  } catch (error) {
    console.error("POST /games/:id/leave error:", error);
    res.status(500).json({ error: "Failed to leave game" });
  }
});

// ============================================================
// DELETE /api/games/:id — Cancel a game (host only)
// ============================================================
router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (game.hostId.toString() !== userId) {
      return res.status(403).json({ error: "Only the host can cancel" });
    }

    game.status = "cancelled";
    await game.save();

    res.json({ message: "Game cancelled" });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel game" });
  }
});

module.exports = router;
