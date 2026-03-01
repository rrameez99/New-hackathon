const express = require("express");
const router = express.Router();
const Game = require("../models/Game");

// ============================================================
// GET /api/games — Fetch all upcoming games
// ============================================================
router.get("/", async (req, res) => {
  try {
    const { sport, userId } = req.query;

    // Build filter - exclude ALL private games and past games from main feed
    const filter = {
      status: "upcoming",
      time: { $gt: new Date() },
      $or: [{ visibility: "public" }, { visibility: { $exists: false } }],
    };
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
// GET /api/games/hosted/:userId — Get games hosted by a user
// ============================================================
router.get("/hosted/:userId", async (req, res) => {
  try {
    const games = await Game.find({
      hostId: req.params.userId,
      status: "upcoming",
    }).sort({ time: 1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hosted games" });
  }
});

// ============================================================
// GET /api/games/history/:userId — Get past games (expired)
// ============================================================
router.get("/history/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const games = await Game.find({
      "players.userId": userId,
      time: { $lt: new Date() },
    }).sort({ time: -1 }).limit(50);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// ============================================================
// GET /api/games/my/:userId — Get all games user has joined (including private)
// ============================================================
router.get("/my/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const games = await Game.find({
      status: "upcoming",
      time: { $gt: new Date() },
      "players.userId": userId,
    }).sort({ time: 1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch my games" });
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
    const { sport, location, time, maxPlayers, skillLevel, description, hostId, hostName, visibility, customSportName } =
      req.body;

    // Validation
    if (!sport || !location || !time || !maxPlayers) {
      return res.status(400).json({ error: "Missing required fields: sport, location, time, maxPlayers" });
    }

    if (new Date(time) < new Date()) {
      return res.status(400).json({ error: "Game time must be in the future" });
    }

    // Generate unique invite code for private games
    const inviteCode = visibility === "private"
      ? Math.random().toString(36).substring(2, 10).toUpperCase()
      : null;

    const game = new Game({
      sport,
      location,
      time: new Date(time),
      maxPlayers: parseInt(maxPlayers),
      skillLevel: skillLevel || "Any Level",
      description: description || "",
      hostId,
      hostName,
      visibility: visibility || "public",
      inviteCode,
      customSportName: customSportName || null,
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

    // Block joining private games unless invited
    if (game.visibility === "private") {
      const isInvited = game.invitedUsers && game.invitedUsers.includes(userId);
      const isHost = game.hostId === userId;
      if (!isInvited && !isHost) {
        return res.status(403).json({ error: "This is a private game. You need an invite to join." });
      }
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

    // Auto-add join notification to game chat
    game.chatMessages.push({
      userId: "system",
      userName: "BadgerPlay",
      text: `${userName} joined the game! 🎉`,
      createdAt: new Date(),
    });

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

    await Game.findByIdAndDelete(req.params.id);

    res.json({ message: "Game deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel game" });
  }
});

// ============================================================
// POST /api/games/:id/invite — Invite a user to a game
// ============================================================
router.post("/:id/invite", async (req, res) => {
  try {
    const { userId } = req.body;
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found" });

    if (!game.invitedUsers.includes(userId)) {
      game.invitedUsers.push(userId);
      await game.save();
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: "Failed to invite" });
  }
});

// ============================================================
// PUT /api/games/:id — Edit a game (host only)
// ============================================================
router.put("/:id", async (req, res) => {
  try {
    const { userId, location, time, maxPlayers, skillLevel, description } = req.body;
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found" });
    if (game.hostId !== userId) return res.status(403).json({ error: "Only host can edit" });

    if (location) game.location = location;
    if (time) game.time = new Date(time);
    if (maxPlayers) game.maxPlayers = parseInt(maxPlayers);
    if (skillLevel) game.skillLevel = skillLevel;
    if (description !== undefined) game.description = description;

    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: "Failed to edit game" });
  }
});

// ============================================================
// POST /api/games/:id/chat — Send message in game chat
// ============================================================
router.post("/:id/chat", async (req, res) => {
  try {
    const { userId, userName, text } = req.body;
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found" });

    game.chatMessages.push({ userId, userName, text, createdAt: new Date() });
    await game.save();
    res.json(game.chatMessages);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ============================================================
// GET /api/games/:id/chat — Get game chat messages
// ============================================================
router.get("/:id/chat", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json(game.chatMessages || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

module.exports = router;
