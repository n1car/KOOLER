"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "@/components/ui";
import { CategoryStripe } from "@/components/CategoryStripe";
import { PlusIcon } from "@/components/icons";
import { categoryEmoji } from "@/lib/category";
import { formatDate, formatTimeRange } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import type { Activity, ActivityStatus } from "@/lib/types";

export default function OrganizerActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus>("ACTIVE");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await api.activities.list();
      setActivities(list.filter((item) => item.organizer.id === user?.id));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudieron cargar tus actividades.",
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const deletedName = new URLSearchParams(window.location.search).get(
      "deleted",
    );
    if (!deletedName) return;

    setNotice(`“${deletedName}” se eliminó correctamente.`);
    window.history.replaceState(window.history.state, "", window.location.pathname);
  }, []);

  const metrics = {
    active: activities.filter((a) => a.status === "ACTIVE").length,
    finished: activities.filter((a) => a.status === "FINISHED").length,
    cancelled: activities.filter((a) => a.status === "CANCELLED").length,
    enrolled: activities
      .filter((a) => a.status === "ACTIVE")
      .reduce((total, a) => total + (a.enrolledCount ?? 0), 0),
  };
  const visibleActivities = activities.filter(
    (activity) => activity.status === statusFilter,
  );

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-foreground">Mis actividades</h2>
      {notice && <Alert tone="success">{notice}</Alert>}

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Activas" value={metrics.active} tone="text-primary" />
        <Metric label="Finalizadas" value={metrics.finished} tone="text-muted" />
        <Metric label="Inscritos" value={metrics.enrolled} tone="text-success" />
      </div>

      {loading ? (
        <LoadingState label="Cargando tus actividades..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : activities.length === 0 ? (
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
          <div
            aria-label="Filtrar actividades por estado"
            className="flex flex-wrap gap-2"
            role="tablist"
          >
            <StatusTab
              count={metrics.active}
              label="Activas"
              selected={statusFilter === "ACTIVE"}
              onClick={() => setStatusFilter("ACTIVE")}
            />
            <StatusTab
              count={metrics.finished}
              label="Finalizadas"
              selected={statusFilter === "FINISHED"}
              onClick={() => setStatusFilter("FINISHED")}
            />
            <StatusTab
              count={metrics.cancelled}
              label="Canceladas"
              selected={statusFilter === "CANCELLED"}
              onClick={() => setStatusFilter("CANCELLED")}
            />
          </div>

          {visibleActivities.length === 0 ? (
            <EmptyState
              title={`No tienes actividades ${statusLabel(statusFilter)}.`}
              description="Las actividades de otros estados se consultan desde sus filtros."
            />
          ) : (
            visibleActivities.map((activity) => (
              <Link
                key={activity.id}
                href={`/organizer/activities/${activity.id}`}
                className="overflow-hidden rounded-card border border-[#E2E8F0] bg-white"
              >
                <CategoryStripe category={activity.activityType?.name} />
                <div className="flex items-center gap-4 p-4">
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-input bg-surface-2 text-2xl">
                    {categoryEmoji(activity.activityType?.name)}
                    {activity.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activity.imageUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}
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
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function statusLabel(status: ActivityStatus): string {
  switch (status) {
    case "ACTIVE":
      return "activas";
    case "FINISHED":
      return "finalizadas";
    case "CANCELLED":
      return "canceladas";
  }
}

function StatusTab({
  count,
  label,
  selected,
  onClick,
}: {
  count: number;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        selected
          ? "border-primary bg-primary text-white"
          : "border-border bg-white text-muted hover:border-primary/40"
      }`}
    >
      {label}
      <span className={selected ? "text-white/75" : "text-muted"}>{count}</span>
    </button>
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
    <div className="flex flex-col items-center gap-1 rounded-card border border-[#E2E8F0] bg-white p-3 text-center">
      <span className={`text-2xl font-extrabold ${tone}`}>{value}</span>
      <span className="text-[11px] font-medium text-muted">{label}</span>
    </div>
  );
}
