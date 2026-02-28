import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SPORTS, LOCATIONS, SKILL_LEVELS } from "../utils/constants";
// import { createGame } from "../utils/api";

export default function CreateGame({ onCreateGame }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    sport: "",
    location: "",
    time: "",
    maxPlayers: "4",
    skillLevel: "Any Level",
    description: "",
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.sport || !form.location || !form.time) return;
    onCreateGame?.(form);
    navigate("/");
  };

  const canSubmit = form.sport && form.location && form.time;

  return (
    <div className="animate-slide-up pb-8">
      <div className="mb-6">
        <button onClick={() => navigate("/")} className="text-brand-orange text-sm font-semibold mb-4 block">
          ← Back
        </button>
        <h2 className="font-display text-3xl font-extrabold tracking-tight">Create a Game</h2>
        <p className="text-gray-600 text-sm mt-1">Post a pickup game and find players</p>
      </div>

      {/* Sport Selection */}
      <div className="mb-6">
        <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Sport</label>
        <div className="grid grid-cols-2 gap-2">
          {SPORTS.map((sport) => (
            <button
              key={sport.id}
              onClick={() => update("sport", sport.id)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                form.sport === sport.id
                  ? "border-current shadow-lg"
                  : "border-brand-border bg-brand-card"
              }`}
              style={
                form.sport === sport.id
                  ? { borderColor: sport.color, background: sport.color + "12", color: sport.color }
                  : { color: "#999" }
              }
            >
              <span className="text-3xl">{sport.emoji}</span>
              <span className="text-xs font-semibold">{sport.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Location</label>
        <div className="flex flex-col gap-1.5">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => update("location", loc)}
              className={`text-left px-3.5 py-3 rounded-xl border text-sm transition-all ${
                form.location === loc
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "border-brand-border bg-brand-card text-gray-500"
              }`}
            >
              📍 {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Time + Max Players */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Date & Time</label>
          <input
            type="datetime-local"
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange transition-colors"
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Max Players</label>
          <input
            type="number"
            min="2"
            max="30"
            value={form.maxPlayers}
            onChange={(e) => update("maxPlayers", e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange transition-colors"
          />
        </div>
      </div>

      {/* Skill Level */}
      <div className="mb-6">
        <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Skill Level</label>
        <div className="flex gap-2 flex-wrap">
          {SKILL_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => update("skillLevel", level)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                form.skillLevel === level
                  ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                  : "border-brand-border bg-brand-card text-gray-500"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Description (optional)</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Any details about your game..."
          rows={3}
          className="w-full px-3.5 py-3 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-4 rounded-2xl text-white font-display text-lg font-bold transition-all ${
          canSubmit
            ? "bg-gradient-to-r from-brand-orange to-brand-red hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            : "bg-gray-800 text-gray-600 cursor-not-allowed"
        }`}
      >
        🎯 Post Game
      </button>
    </div>
  );
}
