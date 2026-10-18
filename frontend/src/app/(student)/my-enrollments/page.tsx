"use client";

import Link from "next/link";
import { Badge, EmptyState } from "@/components/ui";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { TicketIcon } from "@/components/icons";
import { mockEnrollments } from "@/lib/mock";

export default function MyEnrollmentsPage() {
  const items = mockEnrollments;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<TicketIcon width={36} height={36} />}
        title="Aún no tienes inscripciones"
        description="Explora las actividades disponibles y apúntate a las que te interesen."
        action={
          <Link
            href="/home"
            className="rounded-input bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Explorar actividades
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">Mis inscripciones</h2>
      {items.map(({ enrollmentId, enrollmentDate, activity }) => (
        <Link
          key={enrollmentId}
          href={`/activities/${activity.id}`}
          className="relative flex flex-col gap-2 rounded-card border border-border bg-white p-5 shadow-sm"
        >
          <span className="absolute right-4 top-4">
            <Badge tone="success">Inscrito / Confirmado</Badge>
          </span>
          <h3 className="pr-28 text-base font-bold text-foreground">
            {activity.name}
          </h3>
          <p className="text-sm text-muted">{formatDateLong(activity.date)}</p>
          <p className="text-sm text-muted">
            {formatTimeRange(activity.startTime, activity.endTime)}
          </p>
          <p className="text-xs text-muted">
            Inscrito el {formatDateLong(enrollmentDate)}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {activity.category && <Badge tone="primary">{activity.category}</Badge>}
            {activity.isCertifiable && <Badge tone="success">Certifica</Badge>}
          </div>
        </Link>
      ))}
    </div>
  );
}
