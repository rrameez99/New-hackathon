const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Friend = require("../models/Friend");
const Message = require("../models/Message");

// ============================================================
// GET /api/social/search?q=name&userId=xxx — Search users
// ============================================================
router.get("/search", async (req, res) => {
  try {
    const { q, userId } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const users = await User.find({
      name: { $regex: q, $options: "i" },
      _id: { $ne: userId },
    })
      .select("name email isVerifiedStudent")
      .limit(20);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// ============================================================
// POST /api/social/friend-request — Send friend request
// ============================================================
router.post("/friend-request", async (req, res) => {
  try {
    const { from, to } = req.body;
    if (from === to) return res.status(400).json({ error: "Can't friend yourself" });

    // Check if already exists
    const existing = await Friend.findOne({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    });
    if (existing) {
      if (existing.status === "accepted") return res.status(400).json({ error: "Already friends" });
      if (existing.status === "pending") return res.status(400).json({ error: "Request already sent" });
    }

    const request = new Friend({ from, to, status: "pending" });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: "Failed to send request" });
  }
});

// ============================================================
// GET /api/social/friend-requests/:userId — Get pending requests
// ============================================================
router.get("/friend-requests/:userId", async (req, res) => {
  try {
    const requests = await Friend.find({
      to: req.params.userId,
      status: "pending",
    }).populate("from", "name email isVerifiedStudent");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// ============================================================
// POST /api/social/friend-request/:id/accept — Accept request
// ============================================================
router.post("/friend-request/:id/accept", async (req, res) => {
  try {
    const request = await Friend.findByIdAndUpdate(
      req.params.id,
      { status: "accepted" },
      { new: true }
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: "Failed to accept" });
  }
});

// ============================================================
// POST /api/social/friend-request/:id/reject — Reject request
// ============================================================
router.post("/friend-request/:id/reject", async (req, res) => {
  try {
    await Friend.findByIdAndDelete(req.params.id);
    res.json({ message: "Rejected" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject" });
  }
});

// ============================================================
// GET /api/social/friends/:userId — Get friends list
// ============================================================
router.get("/friends/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const friendships = await Friend.find({
      $or: [{ from: userId }, { to: userId }],
      status: "accepted",
    })
      .populate("from", "name email isVerifiedStudent")
      .populate("to", "name email isVerifiedStudent");

    const friends = friendships.map((f) => {
      const friend = f.from._id.toString() === userId ? f.to : f.from;
      return { ...friend.toObject(), friendshipId: f._id };
    });

    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

// ============================================================
// DELETE /api/social/friend/:id — Remove friend
// ============================================================
router.delete("/friend/:id", async (req, res) => {
  try {
    await Friend.findByIdAndDelete(req.params.id);
    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove" });
  }
});

// ============================================================
// POST /api/social/message — Send a message
// ============================================================
router.post("/message", async (req, res) => {
  try {
    const { from, to, text } = req.body;
    const msg = new Message({ from, to, text });
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: "Failed to send" });
  }
});

// ============================================================
// GET /api/social/messages/:userId/:friendId — Get conversation
// ============================================================
router.get("/messages/:userId/:friendId", async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    const messages = await Message.find({
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ============================================================
// GET /api/social/chats/:userId — Get chat list (latest msg per friend)
// ============================================================
router.get("/chats/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get all friends
    const friendships = await Friend.find({
      $or: [{ from: userId }, { to: userId }],
      status: "accepted",
    })
      .populate("from", "name email isVerifiedStudent")
      .populate("to", "name email isVerifiedStudent");

    const chats = [];
    for (const f of friendships) {
      const friend = f.from._id.toString() === userId ? f.to : f.from;
      const lastMsg = await Message.findOne({
        $or: [
          { from: userId, to: friend._id },
          { from: friend._id, to: userId },
        ],
      }).sort({ createdAt: -1 });

      chats.push({
        friend: friend.toObject(),
        lastMessage: lastMsg ? lastMsg.text : null,
        lastMessageTime: lastMsg ? lastMsg.createdAt : f.createdAt,
        friendshipId: f._id,
      });
    }

    chats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

module.exports = router;
