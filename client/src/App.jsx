import { Routes, Route } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Feed from "./pages/Feed";
import CreateGame from "./pages/CreateGame";
import MyGames from "./pages/MyGames";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import GameHistory from "./pages/GameHistory";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import GameDetail from "./components/GameDetail";
import { API_BASE } from "./utils/api";
import { SPORTS } from "./utils/constants";

const API = API_BASE;

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("badgerplay_user");
    return saved ? JSON.parse(saved) : null;
  });
  const handleLogin = (d) => { setUser(d); localStorage.setItem("badgerplay_user", JSON.stringify(d)); };
  const handleLogout = () => { setUser(null); localStorage.removeItem("badgerplay_user"); };
  if (!user) return <Login onLogin={handleLogin} />;
  return <MainApp user={user} onLogout={handleLogout} />;
}

function MainApp({ user, onLogout }) {
  const [games, setGames] = useState([]);
  const [myGames, setMyGames] = useState([]);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [viewProfileId, setViewProfileId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch(`${API}/games`);
      const data = await res.json();
      setGames(data);
      const myRes = await fetch(`${API}/games/my/${user._id}`);
      const myData = await myRes.json();
      setMyGames(myData);
      const joined = new Set();
      [...data, ...myData].forEach((g) => {
        if (g.players.some((p) => p.userId === user._id || p.name === user.name)) joined.add(g._id);
      });
      setJoinedIds(joined);
    } catch (err) { console.error("Fetch error:", err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchGames(); const i = setInterval(fetchGames, 10000); return () => clearInterval(i); }, [fetchGames]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const addNotification = (msg, icon) => {
    setNotifications((p) => [{ id: Date.now(), message: msg, icon, time: new Date(), read: false }, ...p]);
  };

  const handleJoin = async (gameId) => {
    if (joinedIds.has(gameId)) return;
    const game = [...games, ...myGames].find((g) => g._id === gameId);
    if (!game || game.players.length >= game.maxPlayers) return;
    try {
      const res = await fetch(`${API}/games/${gameId}/join`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, userName: user.name }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchGames();
        const sport = SPORTS.find((s) => s.id === game.sport);
        showToast(`Joined ${sport?.emoji} ${sport?.name}!`);
        addNotification(`You joined ${sport?.name} at ${game.location}`, sport?.emoji);
      } else showToast(data.error || "Couldn't join");
    } catch { showToast("Failed to join"); }
  };

  const handleLeave = async (gameId) => {
    try {
      await fetch(`${API}/games/${gameId}/leave`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });
      fetchGames();
    } catch {}
  };

  const handleDelete = async (gameId) => {
    try {
      const res = await fetch(`${API}/games/${gameId}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });
      if (res.ok) { fetchGames(); showToast("Game deleted"); }
    } catch { showToast("Failed to delete"); }
  };

  const handleCreateGame = async (formData) => {
    try {
      const res = await fetch(`${API}/games`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, hostId: user._id, hostName: user.name }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchGames();
        const sport = SPORTS.find((s) => s.id === formData.sport);
        showToast(`Created ${sport?.emoji} ${sport?.name} game!`);
        addNotification(`You're hosting ${sport?.name}!`, "🎯");
        return true;
      } else { showToast(data.error || "Couldn't create"); return false; }
    } catch { showToast("Failed to create"); return false; }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ============ VIEW PROFILE ============
  if (viewProfileId) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen bg-brand-dark relative pb-20 overflow-x-hidden">
        <Header user={user} unreadCount={unreadCount} showNotifs={showNotifs} setShowNotifs={setShowNotifs}
          notifications={notifications} setNotifications={setNotifications} />
        <div className="px-5">
          <Profile user={user} viewUserId={viewProfileId} onBack={() => setViewProfileId(null)} />
        </div>
        <Navbar />
      </div>
    );
  }

  // ============ GAME HISTORY ============
  if (showHistory) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen bg-brand-dark relative pb-20 overflow-x-hidden">
        <Header user={user} unreadCount={unreadCount} showNotifs={showNotifs} setShowNotifs={setShowNotifs}
          notifications={notifications} setNotifications={setNotifications} />
        <div className="px-5">
          <GameHistory user={user} onViewProfile={(id) => { setShowHistory(false); setViewProfileId(id); }}
            onBack={() => setShowHistory(false)} />
        </div>
        <Navbar />
      </div>
    );
  }

  // ============ MAIN APP ============
  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-brand-dark relative pb-20 overflow-x-hidden">
      <Header user={user} unreadCount={unreadCount} showNotifs={showNotifs} setShowNotifs={setShowNotifs}
        notifications={notifications} setNotifications={setNotifications} />

      <div className="px-5" onClick={() => showNotifs && setShowNotifs(false)}>
        <Routes>
          <Route path="/" element={
            <Feed games={games} joinedIds={joinedIds} onJoin={handleJoin} onLeave={handleLeave}
              loading={loading} onGameClick={(g) => setSelectedGame(g)} />
          } />
          <Route path="/create" element={<CreateGame onCreateGame={handleCreateGame} />} />
          <Route path="/messages" element={<Messages user={user} onViewProfile={(id) => setViewProfileId(id)} />} />
          <Route path="/my-games" element={
            <MyGames games={myGames} joinedIds={joinedIds} onLeave={handleLeave} onDelete={handleDelete}
              userId={user._id} onGameClick={(g) => setSelectedGame(g)} />
          } />
          <Route path="/profile" element={
            <Profile user={user} onLogout={onLogout} onGamesPlayedClick={() => setShowHistory(true)} />
          } />
        </Routes>
      </div>

      {/* Game Detail Modal */}
      {selectedGame && (
        <GameDetail
          game={selectedGame}
          user={user}
          joined={joinedIds.has(selectedGame._id)}
          onJoin={handleJoin}
          onLeave={handleLeave}
          onClose={() => setSelectedGame(null)}
          onViewProfile={(id) => { setSelectedGame(null); setViewProfileId(id); }}
          onRefresh={() => { fetchGames(); setSelectedGame(null); }}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 left-4 right-4 flex justify-center z-[999] animate-slide-up">
          <div className="bg-brand-card border border-brand-green/30 text-white px-5 py-3 rounded-2xl text-sm font-medium shadow-2xl text-center max-w-[90%]">✅ {toast}</div>
        </div>
      )}
      <Navbar />
    </div>
  );
}

// ============ SHARED HEADER ============
const THEMES = [
  { id: "dark", label: "Dark", icon: "🌙", accent: "#0a0a0f" },
  { id: "light", label: "Light", icon: "☀️", accent: "#f5f3f0" },
  { id: "wisconsin", label: "Badger", icon: "🦡", accent: "#c5050c" },
  { id: "ocean", label: "Ocean", icon: "🌊", accent: "#0a1628" },
];

function Header({ user, unreadCount, showNotifs, setShowNotifs, notifications, setNotifications }) {
  const [showThemes, setShowThemes] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("bp_theme") || "dark");

  const applyTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    setTheme(t);
    localStorage.setItem("bp_theme", t);
    setShowThemes(false);
  };

  // Apply on mount
  useState(() => { document.documentElement.setAttribute("data-theme", theme); });

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-dark/90 backdrop-blur-xl px-5 pt-4 pb-3 flex justify-between items-center border-b border-brand-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-brand-red flex items-center justify-center text-sm font-extrabold">🦡</div>
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-orange to-yellow-400 bg-clip-text text-transparent leading-none">BadgerPlay</h1>
            <span className="text-[10px] text-gray-600 tracking-wide">UW-Madison</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={() => { setShowThemes(!showThemes); setShowNotifs(false); }}
            className="bg-brand-card border border-brand-border rounded-xl px-2.5 py-2 text-sm font-bold"
            style={{ color: "#FF6B35" }}>
            🎨
          </button>
          <button className="relative bg-brand-card border border-brand-border rounded-xl px-2.5 py-2 text-lg"
            onClick={() => { setShowNotifs(!showNotifs); setShowThemes(false); if (!showNotifs) setNotifications((p) => p.map((n) => ({ ...n, read: true }))); }}>
            🔔
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red rounded-full text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>}
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-sm font-bold">{user.name?.[0] || "?"}</div>
        </div>
      </header>

      {/* Theme picker dropdown */}
      {showThemes && (
        <div className="absolute top-16 right-4 z-[200] animate-slide-up">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-3 shadow-2xl w-48">
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wide mb-2 px-1">Theme</p>
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => applyTheme(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  theme === t.id ? "bg-brand-orange/10 border border-brand-orange/30" : "hover:bg-white/5 border border-transparent"
                }`}>
                <span className="text-lg">{t.icon}</span>
                <span className="text-sm font-semibold">{t.label}</span>
                <div className="ml-auto w-4 h-4 rounded-full border-2 border-brand-border" style={{ background: t.accent }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {showNotifs && (
        <div className="absolute top-16 left-0 right-0 z-[200] px-4 animate-slide-up">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-5 max-h-72 overflow-y-auto shadow-2xl">
            <h3 className="font-display text-base font-bold mb-4">Notifications</h3>
            {notifications.length === 0 ? <p className="text-gray-600 text-sm">No notifications yet</p> :
              notifications.map((n) => (
                <div key={n.id} className="flex gap-3 items-start py-3 border-b border-brand-border last:border-0">
                  <span className="text-xl">{n.icon}</span>
                  <div><p className="text-gray-300 text-sm">{n.message}</p><p className="text-gray-600 text-xs mt-1">Just now</p></div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
