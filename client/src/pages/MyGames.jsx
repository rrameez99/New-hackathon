import { useState } from "react";
import GameCard from "../components/GameCard";

export default function MyGames({ games, joinedIds, onLeave, onDelete, userId, onGameClick }) {
  const [menuOpen, setMenuOpen] = useState(null);

  const publicGames = games.filter((g) => g.visibility !== "private");
  const privateGames = games.filter((g) => g.visibility === "private");

  const renderGameWithMenu = (game) => {
    const isHost = game.hostId === userId;
    return (
      <div key={game._id} className="relative">
        <GameCard game={game} joined={true} onLeave={() => onLeave?.(game._id)} onClick={() => onGameClick?.(game)} />
        {isHost && (
          <div className="flex justify-end mt-1.5 mr-1">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === game._id ? null : game._id); }}
                className="px-3 py-1 rounded-lg bg-brand-card border border-brand-border text-gray-400 text-xs hover:text-white hover:border-brand-orange/30 transition-all flex items-center gap-1">
                ⋮ Manage
              </button>
              {menuOpen === game._id && (
                <div className="absolute top-8 right-0 bg-brand-card border border-brand-border rounded-xl overflow-hidden z-50 shadow-2xl animate-slide-up">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this game? All players will be removed.")) onDelete?.(game._id);
                      setMenuOpen(null);
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-brand-red text-xs font-semibold hover:bg-brand-red/10 w-full text-left whitespace-nowrap">
                    🗑 Delete Game
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" onClick={() => menuOpen && setMenuOpen(null)}>
      <div className="pt-2 pb-5">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">My Games</h2>
        <p className="text-gray-600 text-sm mt-1">{games.length} upcoming</p>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">⭐</p>
          <p className="font-display text-lg font-bold text-gray-600">No games yet</p>
          <p className="text-gray-500 text-sm mt-1">Join or create a game to see it here</p>
        </div>
      ) : (
        <>
          {/* Public Games */}
          {publicGames.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">🌍 Public Games</p>
              <div className="flex flex-col gap-3">
                {publicGames.map(renderGameWithMenu)}
              </div>
            </div>
          )}

          {/* Private Games */}
          {privateGames.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">🔒 Private Games</p>
              <div className="flex flex-col gap-3">
                {privateGames.map(renderGameWithMenu)}
              </div>
            </div>
          )}
        </>
      )}

      <div className="pb-6" />
    </div>
  );
}
