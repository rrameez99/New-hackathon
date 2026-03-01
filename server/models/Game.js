const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    sport: {
      type: String,
      required: true,
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
        userId: String,
        name: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    hostId: {
      type: String,
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
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    invitedUsers: [String],
    inviteCode: {
      type: String,
      default: null,
    },
    customSportName: {
      type: String,
      default: null,
    },
    chatMessages: [
      {
        userId: String,
        userName: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

gameSchema.index({ time: 1, sport: 1 });
gameSchema.index({ status: 1 });

module.exports = mongoose.model("Game", gameSchema);
