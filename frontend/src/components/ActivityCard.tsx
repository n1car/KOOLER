"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkIcon } from "./icons";
import { activityTypeColor } from "@/lib/category";
import { getActivityImageSources } from "@/lib/activity-image";
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
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(
    () => new Set(),
  );
  const imageSources = getActivityImageSources({
    id: activity.id,
    name: activity.name,
    imageUrl: activity.imageUrl,
    category: activity.activityType?.name,
  });
  const imageUrl =
    imageSources.find((source) => !failedImageUrls.has(source)) ?? null;
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
      className="relative block aspect-square w-full overflow-hidden rounded-card"
      style={{ backgroundColor: color }}
    >
      {imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() =>
              setFailedImageUrls((failed) => new Set(failed).add(imageUrl))
            }
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ backgroundColor: color, opacity: 0.85 }}
          />
        </>
      )}

      {statusLabel && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-foreground">
          {statusLabel}
        </span>
      )}

      {enrolled && (
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white"
          style={{ color }}
        >
          <BookmarkIcon width={14} height={14} />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-2 p-4">
        <h3 className="text-sm font-bold leading-snug text-white">
          {activity.name}
        </h3>
        {activity.activityType && (
          <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-semibold text-white">
            {activity.activityType.name}
          </span>
        )}
      </div>
    </Link>
  );
}
