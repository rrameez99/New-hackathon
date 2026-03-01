import { API_BASE } from "../utils/api";
import { useState, useEffect } from "react";
import { SPORTS } from "../utils/constants";

export default function Profile({ user, onLogout, viewUserId, onBack, onGamesPlayedClick }) {
  const isOwnProfile = !viewUserId || viewUserId === user?._id;
  const [profile, setProfile] = useState(isOwnProfile ? user : null);
  const [favorites, setFavorites] = useState([]);
  const [showAddSport, setShowAddSport] = useState(false);
  const [customSport, setCustomSport] = useState("");
  const [friendStatus, setFriendStatus] = useState(null);
  const [showTopPicker, setShowTopPicker] = useState(false);
  const [topSportId, setTopSportId] = useState(null);

  useEffect(() => {
    const id = isOwnProfile ? user?._id : viewUserId;
    if (!id) return;
    fetch(`${API_BASE}/auth/profile/${id}`)
      .then(r => r.json())
      .then((data) => {
        setProfile(data);
        setFavorites(data.favoriteSports || []);
        setTopSportId(data.favoriteSports?.[0] || null);
      })
      .catch(() => {});
    if (!isOwnProfile) {
      fetch(`${API_BASE}/social/friends/${user._id}`)
        .then(r => r.json())
        .then((friends) => setFriendStatus(friends.some(f => f._id === viewUserId) ? "friends" : "none"))
        .catch(() => setFriendStatus("none"));
    }
  }, [viewUserId, isOwnProfile, user]);

  const saveFavorites = async (newFavs) => {
    setFavorites(newFavs);
    await fetch(`${API_BASE}/auth/favorites`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, favoriteSports: newFavs }),
    });
  };

  const setTopSport = async (sportId) => {
    // Move selected sport to front of favorites
    const newFavs = [sportId, ...favorites.filter(f => f !== sportId)];
    setTopSportId(sportId);
    setShowTopPicker(false);
    saveFavorites(newFavs);
  };

  const addSport = (sportId) => {
    if (favorites.includes(sportId)) return;
    saveFavorites([...favorites, sportId]);
    setShowAddSport(false);
    setCustomSport("");
  };

  const removeSport = (sportId) => saveFavorites(favorites.filter(f => f !== sportId));

  const addCustomSport = () => {
    if (!customSport.trim()) return;
    const id = customSport.trim().toLowerCase().replace(/\s+/g, "-");
    if (!favorites.includes(id)) saveFavorites([...favorites, id]);
    setShowAddSport(false);
    setCustomSport("");
  };

  const sendFriendRequest = async () => {
    const res = await fetch(`${API_BASE}/social/friend-request`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: user._id, to: viewUserId }),
    });
    if (res.ok) setFriendStatus("pending");
    else { const d = await res.json(); alert(d.error || "Failed"); }
  };

  const getSportDisplay = (id) => {
    const s = SPORTS.find(s => s.id === id);
    if (s) return { emoji: s.emoji, name: s.name, color: s.color };
    return { emoji: "🎯", name: id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), color: "#94A3B8" };
  };

  const topSport = topSportId ? getSportDisplay(topSportId) : (favorites[0] ? getSportDisplay(favorites[0]) : null);
  const isVerified = (profile?.email || "").endsWith(".edu");

  if (!profile) return <div className="text-center py-16 text-gray-600">Loading...</div>;

  return (
    <div className="animate-slide-up pt-2 pb-6">
      {onBack && <button onClick={onBack} className="text-brand-orange text-sm font-semibold mb-4 block">← Back</button>}

      <div className="bg-brand-card border border-brand-border rounded-2xl p-7">
        {/* Avatar */}
        <div className="text-center">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-3xl font-extrabold mx-auto mb-4">
            {profile.name?.[0] || "?"}
          </div>
          <h2 className="font-display text-2xl font-extrabold">{profile.name}</h2>
          <div className={`inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-semibold ${
            isVerified ? "bg-brand-green/10 text-brand-green" : "bg-yellow-500/10 text-yellow-500"
          }`}>
            {isVerified ? "wisc.edu verified ✓" : "Guest account"}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-around my-6 py-5 border-t border-b border-brand-border">
          <button onClick={() => isOwnProfile && onGamesPlayedClick?.()}
            className={`text-center flex-1 ${isOwnProfile ? "hover:bg-white/5 rounded-xl py-1 -my-1 transition-all cursor-pointer" : ""}`}>
            <p className="font-display text-xl font-extrabold text-brand-orange">{profile.gamesPlayed || 0}</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wide mt-1">Games Played</p>
            {isOwnProfile && <p className="text-gray-700 text-[9px] mt-0.5">Tap to view history</p>}
          </button>
          <div className="w-px bg-brand-border" />
          <button onClick={() => isOwnProfile && setShowTopPicker(!showTopPicker)}
            className={`text-center flex-1 ${isOwnProfile ? "hover:bg-white/5 rounded-xl py-1 -my-1 transition-all cursor-pointer" : ""}`}>
            <p className="font-display text-xl font-extrabold text-white">{topSport ? topSport.emoji : "--"}</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wide mt-1">Top Sport</p>
            {isOwnProfile && <p className="text-gray-700 text-[9px] mt-0.5">Tap to change</p>}
          </button>
        </div>

        {/* Top Sport Picker */}
        {showTopPicker && isOwnProfile && (
          <div className="mb-4 bg-brand-dark border border-brand-border rounded-xl p-3 animate-slide-up">
            <p className="text-gray-500 text-xs font-semibold mb-2">Choose your top sport:</p>
            <div className="flex gap-2 flex-wrap">
              {SPORTS.filter(s => s.id !== "other").map(s => (
                <button key={s.id} onClick={() => setTopSport(s.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                    topSportId === s.id ? "border-brand-orange bg-brand-orange/10 text-brand-orange" : "border-brand-border text-gray-400"
                  }`}>
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Favorite Sports */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-xs font-bold text-gray-500 uppercase tracking-wide">Favorite Sports</h3>
            {isOwnProfile && (
              <button onClick={() => setShowAddSport(!showAddSport)}
                className="px-3 py-1 rounded-lg bg-brand-orange/10 text-brand-orange text-xs font-semibold">+ Add</button>
            )}
          </div>

          {showAddSport && isOwnProfile && (
            <div className="mb-4 bg-brand-dark border border-brand-border rounded-xl p-3 animate-slide-up">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {SPORTS.filter(s => s.id !== "other" && !favorites.includes(s.id)).map(s => (
                  <button key={s.id} onClick={() => addSport(s.id)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-brand-border bg-brand-card text-xs hover:border-brand-orange/30">
                    <span>{s.emoji}</span><span className="text-gray-400 truncate">{s.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={customSport} onChange={e => setCustomSport(e.target.value)} placeholder="Custom sport..."
                  className="flex-1 px-3 py-2 rounded-lg border border-brand-border bg-brand-card text-white text-xs outline-none focus:border-brand-orange" />
                <button onClick={addCustomSport} disabled={!customSport.trim()}
                  className="px-3 py-2 rounded-lg bg-brand-orange/10 text-brand-orange text-xs font-semibold">Add</button>
              </div>
            </div>
          )}

          {favorites.length === 0 ? (
            <div className="border border-dashed border-brand-border rounded-xl py-8 text-center">
              <p className="text-gray-600 text-sm italic">Build your roster of favorite sports</p>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {favorites.map(sportId => {
                const d = getSportDisplay(sportId);
                return (
                  <span key={sportId} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm"
                    style={{ borderColor: d.color + "60", color: d.color }}>
                    {d.emoji} {d.name}
                    {isOwnProfile && (
                      <button onClick={() => removeSport(sportId)} className="ml-1 text-gray-500 hover:text-white text-xs">✕</button>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isOwnProfile ? (
          <div className="mt-8">
            {friendStatus === "friends" ? (
              <div className="w-full py-3 rounded-xl border border-brand-green/30 bg-brand-green/10 text-brand-green text-sm font-semibold text-center">✓ Friends</div>
            ) : friendStatus === "pending" ? (
              <div className="w-full py-3 rounded-xl border border-brand-orange/30 bg-brand-orange/10 text-brand-orange text-sm font-semibold text-center">⏳ Request Sent</div>
            ) : (
              <button onClick={sendFriendRequest}
                className="w-full py-3 rounded-xl bg-brand-green/10 border border-brand-green/30 text-brand-green text-sm font-bold">
                👋 Send Friend Request
              </button>
            )}
          </div>
        ) : (
          <button onClick={onLogout}
            className="w-full mt-8 py-3 rounded-xl border border-brand-red/30 text-brand-red text-sm font-semibold hover:bg-brand-red/10 transition-all">
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
