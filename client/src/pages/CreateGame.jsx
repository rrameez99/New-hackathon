import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SPORTS, LOCATIONS, SKILL_LEVELS } from "../utils/constants";

export default function CreateGame({ onCreateGame }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    sport: "",
    customSport: "",
    location: "",
    customLocation: "",
    time: "",
    maxPlayers: "4",
    skillLevel: "Any Level",
    description: "",
    visibility: "public",
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const sport = form.sport === "other" ? form.customSport : form.sport;
    const location = form.location === "custom" ? form.customLocation : form.location;
    if (!sport || !location || !form.time) return;

    // Append timezone offset so server interprets correctly
    // form.time is "2026-03-02T11:40" from datetime-local
    // We need to tell the server this is CST/CDT not UTC
    const offsetMin = new Date().getTimezoneOffset(); // e.g. 360 for CST (UTC-6)
    const sign = offsetMin <= 0 ? "+" : "-";
    const absH = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
    const absM = String(Math.abs(offsetMin) % 60).padStart(2, "0");
    const tzSuffix = `${sign}${absH}:${absM}`; // e.g. "-06:00"

    const success = await onCreateGame?.({
      sport: form.sport === "other" ? "other" : form.sport,
      customSportName: form.sport === "other" ? form.customSport : null,
      location,
      time: form.time + ":00" + tzSuffix,
      maxPlayers: form.maxPlayers,
      skillLevel: form.skillLevel,
      description: form.description,
      visibility: form.visibility,
    });
    if (success !== false) navigate("/");
  };

  const effectiveSport = form.sport === "other" ? form.customSport : form.sport;
  const effectiveLocation = form.location === "custom" ? form.customLocation : form.location;
  const canSubmit = effectiveSport && effectiveLocation && form.time;

  return (
    <div className="animate-slide-up pb-8">
      <div className="mb-6">
        <button onClick={() => navigate("/")} className="text-brand-orange text-sm font-semibold mb-4 block">← Back</button>
        <h2 className="font-display text-3xl font-extrabold tracking-tight">Create a Game</h2>
        <p className="text-gray-600 text-sm mt-1">Post a pickup game and find players</p>
      </div>

      {/* Visibility Toggle */}
      <div className="mb-6">
        <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Visibility</label>
        <div className="flex gap-2">
          <button
            onClick={() => update("visibility", "public")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${
              form.visibility === "public"
                ? "border-brand-green bg-brand-green/10 text-brand-green"
                : "border-brand-border bg-brand-card text-gray-500"
            }`}
          >
            🌍 Public
          </button>
          <button
            onClick={() => update("visibility", "private")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${
              form.visibility === "private"
                ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                : "border-brand-border bg-brand-card text-gray-500"
            }`}
          >
            🔒 Private
          </button>
        </div>
        <p className="text-gray-600 text-[11px] mt-2">
          {form.visibility === "public"
            ? "Anyone on campus can see and join this game"
            : "Only people you invite through messages can see this game"}
        </p>
      </div>

      {/* Sport Selection */}
      <div className="mb-6">
        <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Sport</label>
        <div className="grid grid-cols-3 gap-2">
          {SPORTS.map((sport) => (
            <button
              key={sport.id}
              onClick={() => update("sport", sport.id)}
              className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all ${
                form.sport === sport.id ? "border-current shadow-lg" : "border-brand-border bg-brand-card"
              }`}
              style={form.sport === sport.id ? { borderColor: sport.color, background: sport.color + "12", color: sport.color } : { color: "#999" }}
            >
              <span className="text-2xl">{sport.emoji}</span>
              <span className="text-[10px] font-semibold">{sport.name}</span>
            </button>
          ))}
        </div>
        {form.sport === "other" && (
          <input
            type="text" value={form.customSport} onChange={(e) => update("customSport", e.target.value)}
            placeholder="What sport or activity?"
            className="w-full mt-3 px-3.5 py-3 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange transition-colors animate-slide-up"
          />
        )}
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Location</label>
        <input
          type="text"
          value={form.location === "custom" ? form.customLocation : form.location}
          onChange={(e) => { update("location", "custom"); update("customLocation", e.target.value); }}
          placeholder="Type a location or pick below..."
          className="w-full px-3.5 py-3 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange transition-colors mb-3"
        />
        <div className="flex gap-2 flex-wrap">
          {LOCATIONS.map((loc) => (
            <button key={loc} onClick={() => { update("location", loc); update("customLocation", ""); }}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                form.location === loc ? "border-brand-orange bg-brand-orange/10 text-brand-orange" : "border-brand-border bg-brand-card text-gray-500"
              }`}>📍 {loc}</button>
          ))}
        </div>
      </div>

      {/* Time + Max Players */}
      <div className="mb-6">
        <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Date & Time</label>
        <input type="datetime-local" value={form.time} onChange={(e) => update("time", e.target.value)}
          className="w-full max-w-full px-3.5 py-3 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange transition-colors overflow-hidden"
          style={{ WebkitAppearance: "none", minWidth: 0 }} />
      </div>
      <div className="mb-6">
        <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Max Players</label>
        <input type="number" min="2" max="30" value={form.maxPlayers} onChange={(e) => update("maxPlayers", e.target.value)}
          className="w-full px-3.5 py-3 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange transition-colors" />
      </div>

      {/* Skill Level */}
      <div className="mb-6">
        <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Skill Level</label>
        <div className="flex gap-2 flex-wrap">
          {SKILL_LEVELS.map((level) => (
            <button key={level} onClick={() => update("skillLevel", level)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                form.skillLevel === level ? "border-brand-purple bg-brand-purple/10 text-brand-purple" : "border-brand-border bg-brand-card text-gray-500"
              }`}>{level}</button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Description (optional)</label>
        <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
          placeholder="Any details about your game..." rows={3}
          className="w-full px-3.5 py-3 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange transition-colors resize-none" />
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={!canSubmit}
        className={`w-full py-4 rounded-2xl text-white font-display text-lg font-bold transition-all ${
          canSubmit ? "bg-gradient-to-r from-brand-orange to-brand-red hover:scale-[1.02] active:scale-[0.98] cursor-pointer" : "bg-gray-800 text-gray-600 cursor-not-allowed"
        }`}>
        {form.visibility === "private" ? "🔒 Post Private Game" : "🎯 Post Game"}
      </button>
    </div>
  );
}
