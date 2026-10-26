export const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  deportiva: "#ED8A2F",
  taller: "#AC56D5",
  recreativa: "#00BBA7",
  cultural: "#6D77F3",
};

export function activityTypeColor(name?: string | null): string {
  // Los catálogos pueden devolver categorías en plural; los tokens usan singular.
  const key = (name ?? "").toLowerCase().replace(/s$/, "");
  return ACTIVITY_TYPE_COLORS[key] ?? "#6D77F3";
}

export function categoryEmoji(name?: string | null): string {
  const key = (name ?? "").toLowerCase();
  if (key.includes("deport")) return "⚽";
  if (key.includes("cultur")) return "🎭";
  if (key.includes("taller")) return "🛠️";
  if (key.includes("recreat")) return "🎉";
  return "📌";
}
