import { API_BASE } from "../utils/api";
import { useState, useEffect, useRef } from "react";
import { SPORTS } from "../utils/constants";

export default function Messages({ user, onViewProfile }) {
  const [tab, setTab] = useState("messages");
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showChat, setShowChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [hostedGames, setHostedGames] = useState([]);
  const [inviteFriend, setInviteFriend] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    fetch(`${API_BASE}/social/chats/${user._id}`).then(r => r.json()).then(setChats).catch(() => {});
    fetch(`${API_BASE}/social/friends/${user._id}`).then(r => r.json()).then(setFriends).catch(() => {});
    fetch(`${API_BASE}/social/friend-requests/${user._id}`).then(r => r.json()).then(setRequests).catch(() => {});
  }, [user, showChat]);

  // Global search
  useEffect(() => {
    if (!showGlobalSearch || search.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      fetch(`${API_BASE}/social/search?q=${search}&userId=${user._id}`).then(r => r.json()).then(setSearchResults).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search, showGlobalSearch, user]);

  // Load conversation
  useEffect(() => {
    if (!showChat) return;
    const load = () => fetch(`${API_BASE}/social/messages/${user._id}/${showChat._id}`).then(r => r.json()).then(setMessages).catch(() => {});
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [showChat, user]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadHostedGames = async () => {
    const res = await fetch(`${API_BASE}/games/hosted/${user._id}`);
    const data = await res.json();
    setHostedGames(data);
  };

  const sendFriendRequest = async (toId) => {
    const res = await fetch(`${API_BASE}/social/friend-request`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: user._id, to: toId }),
    });
    const data = await res.json();
    alert(res.ok ? "Friend request sent!" : (data.error || "Failed"));
  };

  const acceptRequest = async (reqId) => {
    await fetch(`${API_BASE}/social/friend-request/${reqId}/accept`, { method: "POST" });
    setRequests(prev => prev.filter(r => r._id !== reqId));
    fetch(`${API_BASE}/social/friends/${user._id}`).then(r => r.json()).then(setFriends);
  };

  const rejectRequest = async (reqId) => {
    await fetch(`${API_BASE}/social/friend-request/${reqId}/reject`, { method: "POST" });
    setRequests(prev => prev.filter(r => r._id !== reqId));
  };

  const removeFriend = async (friendshipId) => {
    await fetch(`${API_BASE}/social/friend/${friendshipId}`, { method: "DELETE" });
    setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
    setMenuOpen(null);
  };

  const sendMessage = async (text, toUser) => {
    const target = toUser || showChat;
    if (!text?.trim() || !target) return;
    await fetch(`${API_BASE}/social/message`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: user._id, to: target._id, text }),
    });
    if (target._id === showChat?._id) {
      setMsgText("");
      fetch(`${API_BASE}/social/messages/${user._id}/${showChat._id}`).then(r => r.json()).then(setMessages);
    }
  };

  const sendGameInvite = async (game, targetUser) => {
    const target = targetUser || showChat;
    await fetch(`${API_BASE}/games/${game._id}/invite`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: target._id }),
    });
    const sport = SPORTS.find(s => s.id === game.sport);
    const inviteText = `🏟️ GAME_INVITE:${game._id}|${sport?.emoji || "🎯"} ${sport?.name || game.sport} at ${game.location}`;
    await sendMessage(inviteText, target);
    setShowInvite(false);
    setInviteFriend(null);
  };

  const handleJoinFromChat = async (gameId) => {
    const res = await fetch(`${API_BASE}/games/${gameId}/join`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, userName: user.name }),
    });
    if (res.ok) sendMessage("✅ I joined the game!", showChat);
    else { const data = await res.json(); alert(data.error || "Couldn't join"); }
  };

  const renderMessage = (m) => {
    if (m.text.startsWith("🏟️ GAME_INVITE:")) {
      const parts = m.text.replace("🏟️ GAME_INVITE:", "").split("|");
      const gameId = parts[0];
      const gameInfo = parts[1] || "a game";
      const isOwn = m.from === user._id;
      return (
        <div key={m._id} className={`max-w-[80%] rounded-2xl overflow-hidden ${isOwn ? "self-end" : "self-start"}`}>
          <div className={`px-4 py-3 ${isOwn ? "bg-brand-orange/20" : "bg-brand-card border border-brand-border"}`}>
            <p className="text-xs text-gray-500 mb-1">{isOwn ? "You sent an invite" : "Game Invite"}</p>
            <p className="text-sm font-semibold text-white">🏟️ {gameInfo}</p>
            {!isOwn && (
              <button onClick={() => handleJoinFromChat(gameId)}
                className="mt-2 w-full py-2 rounded-xl bg-gradient-to-r from-brand-green to-emerald-600 text-white text-xs font-bold">
                Join Game →
              </button>
            )}
          </div>
        </div>
      );
    }
    return (
      <div key={m._id} className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
        m.from === user._id ? "bg-brand-orange/20 text-white self-end rounded-br-sm" : "bg-brand-card border border-brand-border text-gray-300 self-start rounded-bl-sm"
      }`}>{m.text}</div>
    );
  };

  const filteredChats = chats.filter(c => c.friend.name.toLowerCase().includes(search.toLowerCase()));
  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  // ======================== INVITE PICKER MODAL ========================
  const renderInvitePicker = (targetUser) => (
    <div className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center px-4" onClick={() => { setShowInvite(false); setInviteFriend(null); }}>
      <div className="w-full max-w-[420px] bg-brand-card border border-brand-border rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-lg font-bold mb-1">Invite to Game</h3>
        <p className="text-gray-500 text-xs mb-4">Select a game to invite {targetUser?.name}</p>
        {hostedGames.length === 0 ? (
          <p className="text-gray-600 text-sm py-6 text-center">You're not hosting any games yet</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {hostedGames.map((game) => {
              const sport = SPORTS.find(s => s.id === game.sport);
              return (
                <button key={game._id} onClick={() => sendGameInvite(game, targetUser)}
                  className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-left hover:border-brand-orange/30 transition-all">
                  <span className="text-2xl">{sport?.emoji || "🎯"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{sport?.name || game.sport}</p>
                    <p className="text-gray-600 text-xs">{game.location} • {new Date(game.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                  <span className="text-xs text-gray-500">{game.visibility === "private" ? "🔒" : "🌍"}</span>
                </button>
              );
            })}
          </div>
        )}
        <button onClick={() => { setShowInvite(false); setInviteFriend(null); }}
          className="w-full mt-4 py-2.5 rounded-xl border border-brand-border text-gray-500 text-sm font-medium">Cancel</button>
      </div>
    </div>
  );

  // ======================== CHAT VIEW ========================
  if (showChat) {
    return (
      <div className="animate-fade-in flex flex-col" style={{ height: "calc(100vh - 150px)" }}>
        {/* Header - fixed at top */}
        <div className="shrink-0 pt-2">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setShowChat(null)} className="text-brand-orange text-sm font-semibold">← Back</button>
            <button onClick={() => { loadHostedGames(); setShowInvite(true); }}
              className="px-3 py-1.5 rounded-xl bg-brand-orange/10 border border-brand-orange/30 text-brand-orange text-xs font-semibold">
              🏟️ Invite
            </button>
          </div>

          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-brand-border cursor-pointer" onClick={() => onViewProfile?.(showChat._id)}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-sm font-bold">{showChat.name?.[0]}</div>
            <div>
              <p className="font-display font-bold text-sm hover:text-brand-orange transition-colors">{showChat.name}</p>
              <p className="text-gray-600 text-xs">{showChat.email}</p>
            </div>
          </div>
        </div>

        {/* Messages area - scrollable middle */}
        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto min-h-0 pb-2">
          {messages.length === 0 && <p className="text-gray-600 text-sm text-center py-12">No messages yet. Say hi!</p>}
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - fixed at bottom */}
        <div className="shrink-0 flex gap-2 pt-3 pb-2">
          <input type="text" value={msgText} onChange={(e) => setMsgText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(msgText)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-2xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange" />
          <button onClick={() => sendMessage(msgText)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-red text-white font-bold text-sm shrink-0">
            Send
          </button>
        </div>

        {showInvite && renderInvitePicker(showChat)}
      </div>
    );
  }

  // ======================== GLOBAL SEARCH (New Message / New Friend) ========================
  if (showGlobalSearch) {
    return (
      <div className="animate-fade-in pt-2">
        <button onClick={() => { setShowGlobalSearch(false); setSearch(""); setSearchResults([]); }}
          className="text-brand-orange text-sm font-semibold mb-4">← Back</button>
        <h2 className="font-display text-2xl font-extrabold mb-4">
          {tab === "messages" ? "New Message" : "Find People"}
        </h2>
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..." autoFocus
            className="w-full pl-9 pr-8 py-3 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">✕</button>}
        </div>
        <div className="flex flex-col gap-2">
          {searchResults.length === 0 && search.length >= 2 && <p className="text-gray-600 text-sm text-center py-6">No users found</p>}
          {searchResults.map((u) => {
            const isFriend = friends.some(f => f._id === u._id);
            return (
              <div key={u._id} className="flex items-center justify-between bg-brand-card border border-brand-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-sm font-bold">{u.name?.[0]}</div>
                  <div>
                    <p className="text-sm font-semibold">{u.name} {u.isVerifiedStudent && <span className="text-brand-green text-[10px]">✓ Student</span>}</p>
                    <p className="text-gray-600 text-xs">{u.email}</p>
                  </div>
                </div>
                {isFriend ? (
                  <button onClick={() => { setShowGlobalSearch(false); setShowChat(u); }}
                    className="px-3 py-1.5 rounded-lg bg-brand-orange/10 text-brand-orange text-xs font-semibold">💬 Chat</button>
                ) : (
                  <button onClick={() => sendFriendRequest(u._id)}
                    className="px-3 py-1.5 rounded-lg bg-brand-green/10 text-brand-green text-xs font-semibold">+ Add</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ======================== MAIN VIEW ========================
  return (
    <div className="animate-fade-in pt-2" onClick={() => menuOpen && setMenuOpen(null)}>
      {/* Primary Tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab("messages")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            tab === "messages" ? "bg-brand-card border-2 border-brand-orange text-brand-orange" : "bg-brand-card border border-brand-border text-gray-500"
          }`}>
          Messages
        </button>
        <button onClick={() => setTab("friends")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all relative ${
            tab === "friends" ? "bg-brand-card border-2 border-brand-orange text-brand-orange" : "bg-brand-card border border-brand-border text-gray-500"
          }`}>
          Friends
          {requests.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-red rounded-full text-[10px] font-bold flex items-center justify-center text-white">{requests.length}</span>}
        </button>
      </div>

      {/* ============ MESSAGES TAB ============ */}
      {tab === "messages" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl font-extrabold">Recent Chats</h3>
            <button onClick={() => { setShowGlobalSearch(true); setSearch(""); }}
              className="px-3.5 py-2 rounded-xl border border-brand-border bg-brand-card text-sm font-semibold text-gray-400 hover:text-brand-orange hover:border-brand-orange/30 transition-all">
              New Message <span className="text-brand-orange">+</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
            <input type="text" value={tab === "messages" ? search : ""} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">✕</button>}
          </div>

          {/* Chat list */}
          <div className="flex flex-col gap-2 pb-6">
            {filteredChats.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-gray-600 text-sm">No conversations yet</p>
                <p className="text-gray-700 text-xs mt-1">Add friends and start chatting!</p>
              </div>
            ) : filteredChats.map((chat) => (
              <button key={chat.friend._id} onClick={() => setShowChat(chat.friend)}
                className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-xl px-4 py-3.5 text-left hover:border-brand-orange/30 transition-all">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-green to-brand-blue flex items-center justify-center text-sm font-bold shrink-0">
                  {chat.friend.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{chat.friend.name}</p>
                  <p className="text-gray-500 text-xs truncate mt-0.5">
                    {chat.lastMessage?.startsWith("🏟️ GAME_INVITE:") ? "🏟️ Sent a game invite" : (chat.lastMessage || "No messages yet")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ============ FRIENDS TAB ============ */}
      {tab === "friends" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl font-extrabold">Your Friends</h3>
            <button onClick={() => { setShowGlobalSearch(true); setSearch(""); }}
              className="px-3.5 py-2 rounded-xl border border-brand-border bg-brand-card text-sm font-semibold text-gray-400 hover:text-brand-orange hover:border-brand-orange/30 transition-all">
              New Friend <span className="text-brand-orange">+</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
            <input type="text" value={tab === "friends" ? search : ""} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search friends..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white text-sm outline-none focus:border-brand-orange" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">✕</button>}
          </div>

          {/* Friend requests */}
          {requests.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Friend Requests</p>
              {requests.map((req) => (
                <div key={req._id} className="flex items-center justify-between bg-brand-card border border-brand-orange/20 rounded-xl px-4 py-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-green to-brand-blue flex items-center justify-center text-sm font-bold">{req.from.name?.[0]}</div>
                    <div>
                      <p className="text-sm font-semibold">{req.from.name}</p>
                      <p className="text-gray-600 text-xs">{req.from.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => acceptRequest(req._id)} className="px-3.5 py-2 rounded-lg bg-brand-green/10 text-brand-green text-xs font-bold">✓ Accept</button>
                    <button onClick={() => rejectRequest(req._id)} className="px-3 py-2 rounded-lg bg-brand-red/10 text-brand-red text-xs font-bold">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friends list */}
          <div className="flex flex-col gap-2 pb-6">
            {filteredFriends.length === 0 && requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-gray-600 text-sm">No friends yet</p>
                <p className="text-gray-700 text-xs mt-1">Tap "New Friend +" to find people</p>
              </div>
            ) : filteredFriends.map((f) => (
              <div key={f._id} className="flex items-center justify-between bg-brand-card border border-brand-border rounded-xl px-4 py-3 relative">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewProfile?.(f._id)}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-sm font-bold">{f.name?.[0]}</div>
                    {f.isVerifiedStudent && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-green rounded-full border-2 border-brand-card" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold hover:text-brand-orange transition-colors">{f.name}</p>
                    <p className="text-gray-600 text-xs">{f.isVerifiedStudent ? "Student" : "Guest"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setShowChat(f)}
                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-sm hover:bg-brand-orange/10 transition-all" title="Message">💬</button>
                  <button onClick={() => { setInviteFriend(f); loadHostedGames(); setShowInvite(true); }}
                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-sm hover:bg-brand-green/10 transition-all" title="Invite to game">🏟️</button>
                  <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === f._id ? null : f._id); }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 text-lg hover:text-white transition-all">⋮</button>
                </div>
                {/* Dropdown */}
                {menuOpen === f._id && (
                  <div className="absolute right-3 top-14 bg-brand-card border border-brand-border rounded-xl overflow-hidden z-50 shadow-2xl">
                    <button onClick={() => removeFriend(f.friendshipId)}
                      className="flex items-center gap-2 px-4 py-2.5 text-brand-red text-xs font-semibold hover:bg-brand-red/10 w-full text-left whitespace-nowrap">
                      Remove Friend
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Invite modal (from friends tab) */}
      {showInvite && inviteFriend && renderInvitePicker(inviteFriend)}
    </div>
  );
}
