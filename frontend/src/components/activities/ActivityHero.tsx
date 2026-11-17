"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeftIcon } from "@/components/icons";
import { activityTypeColor, categoryEmoji } from "@/lib/category";
import type { Activity } from "@/lib/types";

export function ActivityHero({
  activity,
  onBack,
  children,
}: {
  activity: Activity;
  onBack: () => void;
  children?: ReactNode;
}) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage = Boolean(
    activity.imageUrl && failedImageUrl !== activity.imageUrl,
  );

  return (
    <div
      className="relative flex min-h-56 flex-col gap-4 overflow-hidden px-5 pb-10 pt-6 lg:min-h-72 lg:px-8"
      style={{ backgroundColor: activityTypeColor(activity.activityType?.name) }}
    >
      {!showImage && (
        <span
          aria-hidden="true"
          className="absolute right-8 top-8 text-7xl opacity-30 lg:text-8xl"
        >
          {categoryEmoji(activity.activityType?.name)}
        </span>
      )}
      {showImage && activity.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activity.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          onError={() => setFailedImageUrl(activity.imageUrl ?? null)}
        />
      )}
      {showImage && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      )}

      <button
        type="button"
        onClick={onBack}
        aria-label="Volver"
        className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-white active:bg-white/20"
      >
        <ChevronLeftIcon />
      </button>

      <div className="relative z-10 flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          {activity.activityType && (
            <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              {activity.activityType.name}
            </span>
          )}
          {children}
        </div>
        <h1 className="text-2xl font-bold text-white">{activity.name}</h1>
        <p className="pt-1 text-sm text-white/80">
          {activity.organizer.firstName} {activity.organizer.lastName}
        </p>
      </div>
    </div>
  );
}
