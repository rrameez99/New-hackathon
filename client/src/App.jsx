import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Feed from "./pages/Feed";
import CreateGame from "./pages/CreateGame";
import MyGames from "./pages/MyGames";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import { SPORTS } from "./utils/constants";

const now = new Date();
const today = (h, m) => { const d = new Date(now); d.setHours(h, m, 0, 0); return d; };
const tomorrow = (h, m) => { const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(h, m, 0, 0); return d; };

const INITIAL_GAMES = [
  {
    _id: "1", sport: "table-tennis", location: "Bakke Recreation Center",
    time: today(18, 0), maxPlayers: 4,
    players: [{ name: "Alex C." }, { name: "Sarah K." }],
    hostId: "u1", hostName: "Alex C.", skillLevel: "Any Level",
    description: "Casual doubles match, all welcome!",
  },
  {
    _id: "2", sport: "basketball", location: "Nicholas Recreation Center (SERF)",
    time: today(20, 0), maxPlayers: 10,
    players: [{ name: "Marcus" }, { name: "Priya" }, { name: "Jordan" }, { name: "Emma" }, { name: "Alex" }, { name: "Sarah" }],
    hostId: "u3", hostName: "Marcus J.", skillLevel: "Any Level",
    description: "5v5 pickup game. First come first served!",
  },
  {
    _id: "3", sport: "soccer", location: "Shell (Camp Randall)",
    time: tomorrow(16, 30), maxPlayers: 14,
    players: [{ name: "Jordan" }, { name: "Emma" }, { name: "Sarah" }],
    hostId: "u5", hostName: "Jordan L.", skillLevel: "Intermediate",
    description: "7v7 indoor soccer, need more players!",
  },
  {
    _id: "4", sport: "volleyball", location: "Bakke Recreation Center",
    time: tomorrow(19, 0), maxPlayers: 12,
    players: [{ name: "Priya" }],
    hostId: "u4", hostName: "Priya P.", skillLevel: "Beginner",
    description: "Beginner-friendly volleyball — come learn!",
  },
  {
    _id: "5", sport: "badminton", location: "Nicholas Recreation Center (SERF)",
    time: today(17, 0), maxPlayers: 4,
    players: [{ name: "Alex" }, { name: "Marcus" }, { name: "Emma" }],
    hostId: "u1", hostName: "Alex C.", skillLevel: "Intermediate",
    description: "Badminton doubles — need 1 more!",
  },
];

export default function App() {
  const [games, setGames] = useState(INITIAL_GAMES);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addNotification = (msg, icon) => {
    setNotifications((prev) => [
      { id: Date.now(), message: msg, icon, time: new Date(), read: false },
      ...prev,
    ]);
  };

  const handleJoin = (gameId) => {
    if (joinedIds.has(gameId)) return;
    const game = games.find((g) => g._id === gameId);
    if (!game || game.players.length >= game.maxPlayers) return;

    setGames((prev) =>
      prev.map((g) =>
        g._id === gameId
          ? { ...g, players: [...g.players, { name: "Rameez" }] }
          : g
      )
    );
    setJoinedIds((prev) => new Set([...prev, gameId]));

    const sport = SPORTS.find((s) => s.id === game.sport);
    showToast(`Joined ${sport?.emoji} ${sport?.name}!`);
    addNotification(`You joined ${sport?.name} at ${game.location}`, sport?.emoji);
  };

  const handleLeave = (gameId) => {
    setGames((prev) =>
      prev.map((g) =>
        g._id === gameId
          ? { ...g, players: g.players.filter((p) => p.name !== "Rameez") }
          : g
      )
    );
    setJoinedIds((prev) => {
      const next = new Set(prev);
      next.delete(gameId);
      return next;
    });
  };

  const handleCreateGame = (formData) => {
    const sport = SPORTS.find((s) => s.id === formData.sport);
    const newGame = {
      _id: Date.now().toString(),
      sport: formData.sport,
      location: formData.location,
      time: new Date(formData.time),
      maxPlayers: parseInt(formData.maxPlayers),
      players: [{ name: "Rameez" }],
      hostId: "current_user",
      hostName: "Rameez",
      skillLevel: formData.skillLevel,
      description: formData.description,
    };
    setGames((prev) => [newGame, ...prev]);
    setJoinedIds((prev) => new Set([...prev, newGame._id]));
    showToast(`Created ${sport?.emoji} ${sport?.name} game!`);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-brand-dark relative pb-20 overflow-x-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-brand-dark/90 backdrop-blur-xl px-5 pt-4 pb-3 flex justify-between items-center border-b border-brand-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-brand-red flex items-center justify-center text-sm font-extrabold">
            ▶
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-orange to-yellow-400 bg-clip-text text-transparent leading-none">
              PlayNow
            </h1>
            <span className="text-[10px] text-gray-600 tracking-wide">UW-Madison</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="relative bg-brand-card border border-brand-border rounded-xl px-2.5 py-2 text-lg"
            onClick={() => {
              setShowNotifs(!showNotifs);
              if (!showNotifs) {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              }
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red rounded-full text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-sm font-bold cursor-pointer">
            R
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifs && (
        <div className="absolute top-16 left-0 right-0 z-[200] px-4 animate-slide-up">
          <div className="bg-[#16161F] border border-brand-border rounded-2xl p-5 max-h-72 overflow-y-auto shadow-2xl">
            <h3 className="font-display text-base font-bold mb-4">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-600 text-sm">No notifications yet — join a game!</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex gap-3 items-start py-3 border-b border-brand-border last:border-0">
                  <span className="text-xl">{n.icon}</span>
                  <div>
                    <p className="text-gray-300 text-sm leading-relaxed">{n.message}</p>
                    <p className="text-gray-600 text-xs mt-1">Just now</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="px-5" onClick={() => showNotifs && setShowNotifs(false)}>
        <Routes>
          <Route
            path="/"
            element={
              <Feed
                games={games}
                joinedIds={joinedIds}
                onJoin={handleJoin}
                onLeave={handleLeave}
              />
            }
          />
          <Route
            path="/create"
            element={<CreateGame onCreateGame={handleCreateGame} />}
          />
          <Route
            path="/my-games"
            element={
              <MyGames
                games={games}
                joinedIds={joinedIds}
                onLeave={handleLeave}
              />
            }
          />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      {/* Toast — centered and contained */}
      {toast && (
        <div className="fixed bottom-24 left-4 right-4 flex justify-center z-[999] animate-slide-up">
          <div className="bg-brand-card border border-brand-green/30 text-white px-5 py-3 rounded-2xl text-sm font-medium shadow-2xl text-center max-w-[90%]">
            ✅ {toast}
          </div>
        </div>
      )}

      <Navbar />
    </div>
  );
}
