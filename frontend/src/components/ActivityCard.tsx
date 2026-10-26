"use client";

import Link from "next/link";
import { BookmarkIcon } from "./icons";
import { activityTypeColor } from "@/lib/category";
import type { Activity } from "@/lib/types";

export function ActivityCard({
  activity,
  enrolled = false,
}: {
  activity: Activity;
  enrolled?: boolean;
}) {
  const color = activityTypeColor(activity.activityType?.name);

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
