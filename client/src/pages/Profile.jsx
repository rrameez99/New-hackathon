export default function Profile() {
  return (
    <div className="animate-slide-up pt-2">
      <div className="bg-brand-card border border-brand-border rounded-2xl p-7 text-center">
        {/* Avatar */}
        <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-3xl font-extrabold mx-auto mb-4">
          R
        </div>
        <h2 className="font-display text-2xl font-extrabold">Rameez</h2>
        <p className="text-gray-500 text-sm mt-1">Computer Science</p>
        <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-xs font-semibold">
          wisc.edu verified ✓
        </div>

        {/* Stats */}
        <div className="flex justify-around my-6 py-5 border-t border-b border-brand-border">
          <div className="text-center">
            <p className="font-display text-xl font-extrabold text-brand-orange">12</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wide mt-1">Games Played</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-extrabold text-brand-orange">4.7</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wide mt-1">Rating</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-extrabold text-brand-orange">Int.</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wide mt-1">Level</p>
          </div>
        </div>

        {/* Favorite Sports */}
        <div className="text-left mt-6">
          <h3 className="font-display text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Favorite Sports
          </h3>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3.5 py-1.5 rounded-full border border-brand-orange/40 text-brand-orange text-sm">
              🏓 Table Tennis
            </span>
            <span className="px-3.5 py-1.5 rounded-full border border-brand-red/40 text-brand-red text-sm">
              🏀 Basketball
            </span>
            <span className="px-3.5 py-1.5 rounded-full border border-brand-blue/40 text-brand-blue text-sm">
              🏸 Badminton
            </span>
          </div>
        </div>

        {/* Achievements */}
        <div className="text-left mt-6">
          <h3 className="font-display text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Achievements
          </h3>
          <div className="flex gap-2 flex-wrap">
            {["🏆 First Game", "🔥 5 Game Streak", "🏓 Ping Pong Pro", "🤝 Social Butterfly"].map(
              (a) => (
                <span key={a} className="px-3 py-2 rounded-xl bg-white/5 text-sm text-gray-300">
                  {a}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
