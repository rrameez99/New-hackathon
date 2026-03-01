import { useState, useEffect } from "react";
import { SPORTS, formatTime, formatDate } from "../utils/constants";

export default function GameHistory({ user, onViewProfile, onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/games/history/${user._id}`)
      .then(r => r.json())
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="animate-fade-in pt-2 pb-6">
      <button onClick={onBack} className="text-brand-orange text-sm font-semibold mb-4">← Back</button>
      <h2 className="font-display text-2xl font-extrabold mb-1">Game History</h2>
      <p className="text-gray-600 text-sm mb-5">{history.length} games played</p>

      {loading ? (
        <p className="text-gray-600 text-sm text-center py-12">Loading...</p>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-600 text-sm">No game history yet</p>
          <p className="text-gray-700 text-xs mt-1">Games will appear here after they end</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((game) => {
            const sport = SPORTS.find(s => s.id === game.sport) || { emoji: "🎯", name: game.sport, color: "#94A3B8" };
            return (
              <div key={game._id} className="bg-brand-card border border-brand-border rounded-2xl p-4"
                style={{ borderLeft: `3px solid ${sport.color}` }}>
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{sport.emoji}</span>
                    <div>
                      <p className="font-display font-bold text-sm" style={{ color: sport.color }}>{sport.name}</p>
                      <p className="text-gray-500 text-xs">{game.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-[10px] uppercase">{formatDate(game.time)}</p>
                    <p className="font-display text-sm font-bold text-gray-400">{formatTime(game.time)}</p>
                  </div>
                </div>

                {/* Players */}
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  Played with ({game.players.length} players)
                </p>
                <div className="flex flex-col gap-1.5">
                  {game.players.map((p, i) => (
                    <button
                      key={p.userId || i}
                      onClick={() => p.userId && p.userId !== user._id && onViewProfile?.(p.userId)}
                      className="flex items-center gap-2.5 py-1.5 hover:bg-white/5 rounded-lg px-2 -mx-2 transition-all text-left"
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: `hsl(${(i * 80 + 120) % 360}, 55%, 45%)` }}>
                        {p.name?.[0] || "?"}
                      </div>
                      <span className="text-sm text-gray-300">
                        {p.name}{p.userId === user._id ? " (you)" : ""}
                      </span>
                      {p.userId && p.userId !== user._id && (
                        <span className="text-gray-600 text-xs ml-auto">View →</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
