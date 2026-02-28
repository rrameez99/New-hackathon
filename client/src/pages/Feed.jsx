import { useState } from "react";
import GameCard from "../components/GameCard";
import { SPORTS } from "../utils/constants";

export default function Feed({ games, joinedIds, onJoin, onLeave }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? games : games.filter((g) => g.sport === filter);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="pt-2 pb-5">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          Find Your Game
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {filtered.length} {filtered.length === 1 ? "game" : "games"} happening near you
        </p>
      </div>

      {/* Filters — fixed scrollbar */}
      <div
        className="flex gap-2 pb-4 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        <style>{`.filter-scroll::-webkit-scrollbar { display: none; }`}</style>
        <button
          onClick={() => setFilter("all")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            filter === "all"
              ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
              : "border-brand-border bg-brand-card text-gray-500"
          }`}
        >
          All
        </button>
        {SPORTS.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setFilter(sport.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
              filter === sport.id
                ? ""
                : "border-brand-border bg-brand-card text-gray-500"
            }`}
            style={
              filter === sport.id
                ? { color: sport.color, borderColor: sport.color, background: sport.color + "18" }
                : {}
            }
          >
            {sport.emoji} {sport.name}
          </button>
        ))}
      </div>

      {/* Game List */}
      <div className="flex flex-col gap-3 pb-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🏟️</p>
            <p className="font-display text-lg font-bold text-gray-600">No games found</p>
            <p className="text-gray-500 text-sm mt-1">Be the first to create one!</p>
          </div>
        ) : (
          filtered.map((game) => (
            <GameCard
              key={game._id}
              game={game}
              joined={joinedIds.has(game._id)}
              onJoin={() => onJoin(game._id)}
              onLeave={() => onLeave(game._id)}
              onClick={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}
