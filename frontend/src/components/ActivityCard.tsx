"use client";

import Link from "next/link";
import { Badge, Button, cn, StatusBadge } from "./ui";
import { CertificateIcon } from "./icons";
import type { Activity } from "@/lib/types";
import { formatDateLong, formatTimeRange } from "@/lib/format";

export function ActivityCard({
  activity,
  enrolled = false,
  onEnroll,
  enrolling = false,
}: {
  activity: Activity;
  enrolled?: boolean;
  onEnroll?: (activity: Activity) => void;
  enrolling?: boolean;
}) {
  const spots = activity.availableSpots ?? activity.capacity;
  const full = spots <= 0;
  const isActive = activity.status === "ACTIVE";

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-border bg-white shadow-sm">
      <Link href={`/activities/${activity.id}`} className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold leading-snug text-foreground">
            {activity.name}
          </h3>
          <StatusBadge status={activity.status} />
        </div>

        <dl className="flex flex-col gap-1 text-sm text-muted">
          <Detail icon="📅" text={formatDateLong(activity.date)} />
          <Detail
            icon="🕒"
            text={formatTimeRange(activity.startTime, activity.endTime)}
          />
          <Detail icon="📍" text={activity.location?.name ?? "Sin ubicación"} />
          <Detail
            icon="🎟️"
            text={
              full
                ? "Sin cupos disponibles"
                : `${spots} de ${activity.capacity} cupos disponibles`
            }
          />
        </dl>

        <div className="flex flex-wrap items-center gap-2">
          {activity.activityType && (
            <Badge tone="primary">{activity.activityType.name}</Badge>
          )}
          {activity.isCertifiable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <CertificateIcon width={14} height={14} />
              Certifica
            </span>
          )}
        </div>
      </Link>

      {onEnroll && (
        <div className="border-t border-border p-4">
          <Button
            fullWidth
            variant={enrolled ? "secondary" : full || !isActive ? "outline" : "primary"}
            disabled={enrolled || full || !isActive || enrolling}
            loading={enrolling}
            onClick={() => onEnroll(activity)}
            className={cn((full || !isActive) && !enrolled && "text-muted")}
          >
            {enrolled
              ? "Inscrito"
              : !isActive
                ? "No disponible"
                : full
                  ? "Agotado / Sin cupos"
                  : "Inscribirse"}
          </Button>
        </div>
      )}
    </article>
  );
}

function Detail({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden className="text-xs">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}
