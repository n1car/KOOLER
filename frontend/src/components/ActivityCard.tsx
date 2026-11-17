"use client";

import Link from "next/link";
import { BookmarkIcon } from "./icons";
import { activityTypeColor } from "@/lib/category";
import type { ActivityStatus } from "@/lib/types";

export interface ActivityCardData {
  id: number;
  name: string;
  imageUrl?: string | null;
  activityType?: { name: string } | null;
  status?: ActivityStatus;
  availableSpots?: number;
}

export function ActivityCard({
  activity,
  enrolled = false,
}: {
  activity: ActivityCardData;
  enrolled?: boolean;
}) {
  const color = activityTypeColor(activity.activityType?.name);
  const statusLabel =
    activity.status === "FINISHED"
      ? "Finalizada"
      : activity.status === "CANCELLED"
        ? "Cancelada"
        : activity.availableSpots === 0
          ? "Sin cupos"
          : null;

  return (
    <Link
      href={`/activities/${activity.id}`}
      className="relative flex min-h-36 flex-col justify-end overflow-hidden rounded-card p-4"
      style={{ backgroundColor: color }}
    >
      {activity.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activity.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-10"
        />
      )}

      {statusLabel && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-foreground">
          {statusLabel}
        </span>
      )}

      {enrolled && (
        <span
          className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white"
          style={{ color }}
        >
          <BookmarkIcon width={13} height={13} />
        </span>
      )}

      <div className="relative z-10 flex flex-col items-start gap-2">
        <h3 className="text-base font-bold leading-snug text-white">
          {activity.name}
        </h3>
        {activity.activityType && (
          <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold text-white">
            {activity.activityType.name}
          </span>
        )}
      </div>
    </Link>
  );
}
