import GameCard from "../components/GameCard";

export default function MyGames({ games, joinedIds, onLeave }) {
  const myGames = games.filter((g) => joinedIds.has(g._id));

  return (
    <div className="animate-fade-in">
      <div className="pt-2 pb-5">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">My Games</h2>
        <p className="text-gray-600 text-sm mt-1">{myGames.length} upcoming</p>
      </div>

      <div className="flex flex-col gap-3 pb-6">
        {myGames.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">⭐</p>
            <p className="font-display text-lg font-bold text-gray-600">No games yet</p>
            <p className="text-gray-500 text-sm mt-1">Join or create a game to see it here</p>
          </div>
        ) : (
          myGames.map((game) => (
            <GameCard
              key={game._id}
              game={game}
              joined={true}
              onLeave={() => onLeave?.(game._id)}
              onClick={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}
