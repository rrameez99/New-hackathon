const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    sport: {
      type: String,
      required: true,
      enum: [
        "table-tennis",
        "basketball",
        "soccer",
        "volleyball",
        "badminton",
        "tennis",
        "frisbee",
        "running",
      ],
    },
    location: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: 2,
      max: 30,
    },
    players: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostName: {
      type: String,
      required: true,
    },
    skillLevel: {
      type: String,
      enum: ["Any Level", "Beginner", "Intermediate", "Advanced"],
      default: "Any Level",
    },
    description: {
      type: String,
      maxLength: 200,
    },
    status: {
      type: String,
      enum: ["upcoming", "in-progress", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
gameSchema.index({ time: 1, sport: 1 });
gameSchema.index({ status: 1 });

module.exports = mongoose.model("Game", gameSchema);
