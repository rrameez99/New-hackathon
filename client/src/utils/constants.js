export const SPORTS = [
  { id: "table-tennis", name: "Table Tennis", emoji: "🏓", color: "#FF6B35" },
  { id: "basketball", name: "Basketball", emoji: "🏀", color: "#E8533F" },
  { id: "soccer", name: "Soccer", emoji: "⚽", color: "#2DC653" },
  { id: "volleyball", name: "Volleyball", emoji: "🏐", color: "#7B61FF" },
  { id: "badminton", name: "Badminton", emoji: "🏸", color: "#00B4D8" },
  { id: "tennis", name: "Tennis", emoji: "🎾", color: "#C5E063" },
  { id: "pickleball", name: "Pickleball", emoji: "🏓", color: "#22D3EE" },
  { id: "frisbee", name: "Ultimate Frisbee", emoji: "🥏", color: "#FF9F1C" },
  { id: "running", name: "Running", emoji: "🏃", color: "#F72585" },
  { id: "jogging", name: "Jogging", emoji: "🏃‍♂️", color: "#FB923C" },
  { id: "gym", name: "Gym Workout", emoji: "🏋️", color: "#A78BFA" },
  { id: "other", name: "Other", emoji: "🎯", color: "#94A3B8" },
];

export const LOCATIONS = [
  "Bakke Recreation Center",
  "Nicholas Recreation Center (SERF)",
  "Shell (Camp Randall)",
  "Natatorium",
  "Nielsen Tennis Stadium",
  "Lakeshore Path",
  "Memorial Union Terrace",
  "Engineering Hall Courtyard",
];

export const SKILL_LEVELS = ["Any Level", "Beginner", "Intermediate", "Advanced"];

export function getSportById(id, game) {
  const found = SPORTS.find((s) => s.id === id);
  if (found) return found;
  // Custom sport
  if (game?.customSportName) {
    return { id: "other", name: game.customSportName, emoji: "🎯", color: "#94A3B8" };
  }
  return { id: "other", name: "Other", emoji: "🎯", color: "#94A3B8" };
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date) {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function getSpotsLeft(game) {
  return game.maxPlayers - game.players.length;
}
