import { activityTypeColor } from "@/lib/category";

export function CategoryStripe({
  category,
  color,
}: {
  category?: string | null;
  color?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="h-[7px] w-full shrink-0"
      style={{ backgroundColor: color ?? activityTypeColor(category) }}
    />
  );
}
