export function categoryEmoji(name?: string | null): string {
  const key = (name ?? "").toLowerCase();
  if (key.includes("deport")) return "⚽";
  if (key.includes("cultur")) return "🎭";
  if (key.includes("taller")) return "🛠️";
  if (key.includes("recreat")) return "🎉";
  return "📌";
}
