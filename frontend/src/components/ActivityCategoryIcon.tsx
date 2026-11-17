import {
  CultureIcon,
  RecreationIcon,
  SportsIcon,
  WorkshopIcon,
} from "./icons";

export function ActivityCategoryIcon({
  category,
  size = 20,
}: {
  category?: string | null;
  size?: number;
}) {
  const normalized = category?.toLowerCase() ?? "";
  const Icon = normalized.includes("deport")
    ? SportsIcon
    : normalized.includes("taller")
      ? WorkshopIcon
      : normalized.includes("recreat")
        ? RecreationIcon
        : normalized.includes("cultur")
          ? CultureIcon
          : null;

  return Icon ? (
    <Icon aria-hidden="true" width={size} height={size} />
  ) : null;
}
