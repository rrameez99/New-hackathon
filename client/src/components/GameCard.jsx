import { getSportById, formatTime, formatDate, getSpotsLeft } from "../utils/constants";

export default function GameCard({ game, joined, onJoin, onLeave, onClick }) {
  const sport = getSportById(game.sport, game);
  const spotsLeft = getSpotsLeft(game);
  const isFull = spotsLeft <= 0;
  const isUrgent = spotsLeft <= 2 && spotsLeft > 0;

  return (
    <div
      onClick={onClick}
      className="bg-brand-card border border-brand-border rounded-2xl p-4 cursor-pointer transition-all hover:border-gray-700 animate-slide-up"
      style={{ borderLeft: `3px solid ${sport.color}` }}
    >
      {/* Top row */}
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{sport.emoji}</span>
          <div>
            <p className="font-display font-bold" style={{ color: sport.color }}>
              {game.customSportName || sport.name}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">{game.location}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wide">
            {formatDate(game.time)}
          </p>
          <p className="font-display text-lg font-bold">{formatTime(game.time)}</p>
        </div>
      </div>

      {/* Description */}
      {game.description && (
        <p className="text-gray-500 text-sm mb-2.5 leading-relaxed">{game.description}</p>
      )}

      {/* Tags */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {game.visibility === "private" && (
          <span className="px-2.5 py-0.5 rounded-md bg-brand-purple/10 text-brand-purple text-[11px] font-semibold">
            🔒 Private
          </span>
        )}
        <span className="px-2.5 py-0.5 rounded-md bg-brand-purple/10 text-brand-purple text-[11px] font-semibold">
          {game.skillLevel}
        </span>
        <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-gray-500 text-[11px]">
          Hosted by {game.hostName}
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          {/* Player avatars */}
          <div className="flex -space-x-2">
            {game.players.slice(0, 4).map((p, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-brand-card text-white"
                style={{
                  background: `hsl(${(i * 80 + 120) % 360}, 55%, 45%)`,
                  zIndex: 4 - i,
                }}
              >
                {p.name?.[0] || "?"}
              </div>
            ))}
          </div>
          <span className="text-gray-500 text-sm">
            <span className="font-bold text-white">{game.players.length}</span>
            /{game.maxPlayers}
          </span>
        </div>

        {/* Action button */}
        {joined ? (
          <button
            onClick={(e) => { e.stopPropagation(); onLeave?.(); }}
            className="px-4 py-1.5 rounded-full border border-brand-green/30 bg-brand-green/10 text-brand-green text-sm font-semibold"
          >
            ✓ Joined
          </button>
        ) : isFull ? (
          <span className="px-4 py-1.5 rounded-full bg-white/5 text-gray-600 text-sm font-semibold">
            Full
          </span>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onJoin?.(); }}
            className="px-4 py-1.5 rounded-full text-white text-sm font-bold transition-all hover:scale-105"
            style={{ background: sport.color }}
          >
            Join{isUrgent ? ` · ${spotsLeft} left!` : ""}
          </button>
        )}
      </div>

      {/* Capacity bar */}
      {!isFull && (
        <div className="h-0.5 bg-brand-border rounded-full mt-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(game.players.length / game.maxPlayers) * 100}%`,
              background: isUrgent
                ? "linear-gradient(90deg, #FF6B35, #E8533F)"
                : sport.color,
            }}
          />
        </div>
      )}
    </div>
  );
}
