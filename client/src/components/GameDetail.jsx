import { API_BASE } from "../utils/api";
import { useState, useEffect, useRef } from "react";
import { SPORTS, formatTime, formatDate, LOCATIONS, SKILL_LEVELS } from "../utils/constants";

export default function GameDetail({ game, user, joined, onJoin, onLeave, onClose, onViewProfile, onRefresh }) {
  const sport = SPORTS.find(s => s.id === game.sport) || { emoji: "🎯", name: game.customSportName || game.sport, color: "#94A3B8" };
  const isFull = game.players.length >= game.maxPlayers;
  const isHost = game.hostId === user._id;

  const [tab, setTab] = useState("info"); // info | chat
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatText, setChatText] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    location: game.location,
    time: new Date(game.time).toISOString().slice(0, 16),
    maxPlayers: game.maxPlayers,
    skillLevel: game.skillLevel,
    description: game.description || "",
  });
  const chatEndRef = useRef(null);

  // Load chat
  useEffect(() => {
    if (tab !== "chat") return;
    const load = () => fetch(`${API_BASE}/games/${game._id}/chat`).then(r => r.json()).then(setChatMsgs).catch(() => {});
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [tab, game._id]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);

  const sendChat = async () => {
    if (!chatText.trim()) return;
    await fetch(`${API_BASE}/games/${game._id}/chat`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, userName: user.name, text: chatText }),
    });
    setChatText("");
    fetch(`${API_BASE}/games/${game._id}/chat`).then(r => r.json()).then(setChatMsgs);
  };

  const saveEdit = async () => {
    const res = await fetch(`${API_BASE}/games/${game._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, ...editForm }),
    });
    if (res.ok) { setShowEdit(false); onRefresh?.(); }
  };

  // ======================== EDIT MODAL ========================
  if (showEdit) {
    return (
      <div className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center px-4" onClick={() => setShowEdit(false)}>
        <div className="w-full max-w-[420px] bg-brand-card border border-brand-border rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <h3 className="font-display text-lg font-bold mb-4">Edit Game</h3>

          <label className="block text-gray-500 text-xs font-semibold uppercase mb-2">Location</label>
          <input type="text" value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange mb-3" />

          <label className="block text-gray-500 text-xs font-semibold uppercase mb-2">Date & Time</label>
          <input type="datetime-local" value={editForm.time} onChange={e => setEditForm(p => ({ ...p, time: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange mb-3" />

          <label className="block text-gray-500 text-xs font-semibold uppercase mb-2">Max Players</label>
          <input type="number" min="2" max="30" value={editForm.maxPlayers} onChange={e => setEditForm(p => ({ ...p, maxPlayers: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange mb-3" />

          <label className="block text-gray-500 text-xs font-semibold uppercase mb-2">Skill Level</label>
          <div className="flex gap-2 flex-wrap mb-3">
            {SKILL_LEVELS.map(l => (
              <button key={l} onClick={() => setEditForm(p => ({ ...p, skillLevel: l }))}
                className={`px-3 py-1.5 rounded-full text-xs border ${editForm.skillLevel === l ? "border-brand-purple bg-brand-purple/10 text-brand-purple" : "border-brand-border text-gray-500"}`}>{l}</button>
            ))}
          </div>

          <label className="block text-gray-500 text-xs font-semibold uppercase mb-2">Description</label>
          <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange mb-4 resize-none" />

          <div className="flex gap-2">
            <button onClick={() => setShowEdit(false)} className="flex-1 py-2.5 rounded-xl border border-brand-border text-gray-500 text-sm">Cancel</button>
            <button onClick={saveEdit} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-red text-white text-sm font-bold">Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[300] flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[480px] bg-brand-card border-t border-brand-border rounded-t-3xl overflow-hidden animate-slide-up"
        style={{ maxHeight: "85vh" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 pb-3" style={{ borderBottom: `2px solid ${sport.color}30` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{sport.emoji}</span>
              <div>
                <h2 className="font-display text-xl font-extrabold" style={{ color: sport.color }}>
                  {game.customSportName || sport.name}
                </h2>
                <p className="text-gray-500 text-xs">📍 {game.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isHost && (
                <button onClick={() => setShowEdit(true)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 text-sm">✏️</button>
              )}
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 text-sm">✕</button>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="text-gray-400">📅 {formatDate(game.time)}</span>
            <span className="text-gray-400">⏰ {formatTime(game.time)}</span>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {game.visibility === "private" && <span className="px-2 py-0.5 rounded-lg bg-brand-purple/10 text-brand-purple text-[11px] font-semibold">🔒 Private</span>}
            <span className="px-2 py-0.5 rounded-lg bg-brand-purple/10 text-brand-purple text-[11px] font-semibold">{game.skillLevel}</span>
          </div>
          {game.description && <p className="text-gray-400 text-sm mt-2">{game.description}</p>}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-border">
          <button onClick={() => setTab("info")}
            className={`flex-1 py-2.5 text-sm font-semibold ${tab === "info" ? "text-brand-orange border-b-2 border-brand-orange" : "text-gray-500"}`}>
            Players ({game.players.length}/{game.maxPlayers})
          </button>
          <button onClick={() => setTab("chat")}
            className={`flex-1 py-2.5 text-sm font-semibold ${tab === "chat" ? "text-brand-orange border-b-2 border-brand-orange" : "text-gray-500"}`}>
            💬 Group Chat
          </button>
        </div>

        {/* ============ INFO TAB ============ */}
        {tab === "info" && (
          <div className="p-5" style={{ maxHeight: "40vh", overflowY: "auto" }}>
            <div className="flex flex-col gap-2">
              {game.players.map((p, i) => (
                <button key={p.userId || i} onClick={() => p.userId && onViewProfile?.(p.userId)}
                  className="flex items-center justify-between bg-brand-card border border-brand-border rounded-xl px-3.5 py-2.5 hover:border-brand-orange/30 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 border-brand-card text-white"
                      style={{ background: `hsl(${(i * 80 + 120) % 360}, 55%, 45%)` }}>
                      {p.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{p.name || "Unknown"}</p>
                      {p.userId === game.hostId && <p className="text-brand-orange text-[10px] font-semibold">👑 Host</p>}
                    </div>
                  </div>
                  <span className="text-gray-600 text-xs">View →</span>
                </button>
              ))}
              {Array.from({ length: Math.max(0, game.maxPlayers - game.players.length) }).map((_, i) => (
                <div key={`e-${i}`} className="flex items-center gap-3 bg-brand-card/50 border border-dashed border-brand-border rounded-xl px-3.5 py-2.5">
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-700 text-xs">?</div>
                  <p className="text-gray-700 text-sm italic">Open slot</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ CHAT TAB ============ */}
        {tab === "chat" && (
          <div className="flex flex-col" style={{ height: "40vh" }}>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {chatMsgs.length === 0 && <p className="text-gray-600 text-sm text-center py-6">No messages yet. Coordinate with your team!</p>}
              {chatMsgs.map((m, i) => {
                if (m.userId === "system") {
                  return <p key={i} className="text-center text-gray-500 text-xs py-1">{m.text}</p>;
                }
                const isOwn = m.userId === user._id;
                return (
                  <div key={i} className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isOwn ? "bg-brand-orange/20 text-white self-end rounded-br-sm" : "bg-brand-card border border-brand-border text-gray-300 self-start rounded-bl-sm"
                  }`}>
                    {!isOwn && <p className="text-brand-orange text-[10px] font-semibold mb-0.5">{m.userName}</p>}
                    {m.text}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            {joined && (
              <div className="flex gap-2 p-3 border-t border-brand-border shrink-0">
                <input type="text" value={chatText} onChange={e => setChatText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                  placeholder="Message the group..."
                  className="flex-1 px-3 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange" />
                <button onClick={sendChat} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-red text-white text-sm font-bold">Send</button>
              </div>
            )}
            {!joined && (
              <p className="text-center text-gray-600 text-xs py-3 border-t border-brand-border">Join the game to chat</p>
            )}
          </div>
        )}

        {/* Action */}
        <div className="px-5 pb-5 pt-3">
          {joined ? (
            <button onClick={() => { onLeave?.(game._id); onClose(); }}
              className="w-full py-3 rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red font-display font-bold text-sm">
              Leave Game
            </button>
          ) : isFull ? (
            <div className="w-full py-3 rounded-2xl bg-white/5 text-gray-600 font-display font-bold text-sm text-center">Game Full</div>
          ) : (
            <button onClick={() => { onJoin?.(game._id); onClose(); }}
              className="w-full py-3 rounded-2xl text-white font-display font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${sport.color}, ${sport.color}CC)` }}>
              Join Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
