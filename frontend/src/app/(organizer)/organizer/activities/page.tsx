"use client";

import Link from "next/link";
import { EmptyState, StatusBadge } from "@/components/ui";
import { PlusIcon } from "@/components/icons";
import { categoryEmoji } from "@/lib/category";
import { formatDate, formatTimeRange } from "@/lib/format";
import { mockActivities } from "@/lib/mock";

export default function OrganizerActivitiesPage() {
  const activities = mockActivities;

  const metrics = {
    active: activities.filter((a) => a.status === "ACTIVE").length,
    finished: activities.filter((a) => a.status === "FINISHED").length,
    enrolled: activities.reduce((total, a) => total + (a.enrolledCount ?? 0), 0),
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-foreground">Mis actividades</h2>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Activas" value={metrics.active} tone="text-primary" />
        <Metric label="Finalizadas" value={metrics.finished} tone="text-muted" />
        <Metric label="Inscritos" value={metrics.enrolled} tone="text-success" />
      </div>

      {activities.length === 0 ? (
        <EmptyState
          icon={<PlusIcon width={36} height={36} />}
          title="Aún no has creado actividades"
          description="Crea tu primera actividad de bienestar para empezar."
          action={
            <Link
              href="/organizer/activities/new"
              className="rounded-input bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Crear actividad
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              href={`/organizer/activities/${activity.id}`}
              className="flex items-center gap-4 rounded-card border border-border bg-white p-4 shadow-sm"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-input bg-surface-2 text-2xl">
                {categoryEmoji(activity.activityType?.name)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={activity.status} />
                </div>
                <h3 className="truncate text-[15px] font-bold text-foreground">
                  {activity.name}
                </h3>
                <p className="truncate text-xs text-muted">
                  {formatDate(activity.date)} ·{" "}
                  {formatTimeRange(activity.startTime, activity.endTime)}
                </p>
                <p className="truncate text-xs text-muted">
                  {activity.location?.name ?? "Sin ubicación"}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-primary">
                  {activity.enrolledCount ?? 0}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-muted">
                  inscritos
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-card border border-border bg-white p-3 text-center shadow-sm">
      <span className={`text-2xl font-extrabold ${tone}`}>{value}</span>
      <span className="text-[11px] font-medium text-muted">{label}</span>
    </div>
  );
}
