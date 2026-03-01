// ============================================================
// API Helper — all frontend-to-backend communication
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export { API_BASE };

// Generic fetch wrapper
async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

// ============================================================
// GAMES
// ============================================================

export async function getGames(sport = "all") {
  const query = sport !== "all" ? `?sport=${sport}` : "";
  return apiFetch(`/games${query}`);
}

export async function getGame(id) {
  return apiFetch(`/games/${id}`);
}

export async function createGame(gameData) {
  return apiFetch("/games", {
    method: "POST",
    body: JSON.stringify(gameData),
  });
}

export async function joinGame(gameId, userId, userName) {
  return apiFetch(`/games/${gameId}/join`, {
    method: "POST",
    body: JSON.stringify({ userId, userName }),
  });
}

export async function leaveGame(gameId, userId) {
  return apiFetch(`/games/${gameId}/leave`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

// ============================================================
// AUTH
// ============================================================

export async function registerUser(userData) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function loginUser(firebaseUid) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ firebaseUid }),
  });
}

export async function getUser(id) {
  return apiFetch(`/auth/user/${id}`);
}

export async function updateUser(id, userData) {
  return apiFetch(`/auth/user/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}
