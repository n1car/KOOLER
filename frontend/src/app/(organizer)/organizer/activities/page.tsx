"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Alert,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "@/components/ui";
import { ActivityCategoryIcon } from "@/components/ActivityCategoryIcon";
import { CategoryStripe } from "@/components/CategoryStripe";
import {
  CalendarIcon,
  MapPinIcon,
  PlusIcon,
  StarIcon,
  UsersIcon,
} from "@/components/icons";
import { activityTypeColor } from "@/lib/category";
import { getActivityImageSources } from "@/lib/activity-image";
import { formatDate, formatTimeRange } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import type {
  Activity,
  ActivityStatus,
  ReviewSummary,
} from "@/lib/types";

type ActivityRatingState =
  | { status: "loading" }
  | { status: "loaded"; summary: ReviewSummary }
  | { status: "error"; message: string };

export default function OrganizerActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [ratings, setRatings] = useState<Record<number, ActivityRatingState>>(
    {},
  );
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
    let active = true;
    const finishedActivities = activities.filter(
      (activity) => activity.status === "FINISHED",
    );

    if (finishedActivities.length === 0) {
      setRatings({});
      return () => {
        active = false;
      };
    }

    const initialRatings: Record<number, ActivityRatingState> = {};
    for (const activity of finishedActivities) {
      initialRatings[activity.id] = { status: "loading" };
    }
    setRatings(initialRatings);

    void Promise.all(
      finishedActivities.map(async (activity) => {
        try {
          return {
            id: activity.id,
            rating: {
              status: "loaded",
              summary: await api.reviews.organizer(activity.id),
            } satisfies ActivityRatingState,
          };
        } catch (err) {
          return {
            id: activity.id,
            rating: {
              status: "error",
              message:
                err instanceof ApiError
                  ? err.message
                  : "No se pudo cargar la valoración.",
            } satisfies ActivityRatingState,
          };
        }
      }),
    ).then((results) => {
      if (!active) return;
      const nextRatings: Record<number, ActivityRatingState> = {};
      for (const result of results) {
        nextRatings[result.id] = result.rating;
      }
      setRatings(nextRatings);
    });

    return () => {
      active = false;
    };
  }, [activities]);

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
    <div className="flex flex-col gap-6">
      {notice && <Alert tone="success">{notice}</Alert>}

      <section aria-label="Resumen de actividades" className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-muted">
          Resumen
        </h2>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <Metric
            icon={<CalendarIcon width={18} height={18} />}
            label="Activas"
            value={metrics.active}
            tone="text-primary"
          />
          <Metric
            icon={<StarIcon width={18} height={18} />}
            label="Finalizadas"
            value={metrics.finished}
            tone="text-[#8290A6]"
          />
          <Metric
            icon={<UsersIcon width={18} height={18} />}
            label="Estudiantes inscritos"
            value={metrics.enrolled}
            tone="text-success"
          />
        </div>
      </section>

      {loading ? (
        <LoadingState label="Cargando tus actividades..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-muted">
              Tus actividades
            </h2>
            <div
              aria-label="Filtrar actividades por estado"
              className="flex gap-2 overflow-x-auto pb-1"
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
          ) : visibleActivities.length === 0 ? (
            <EmptyState
              title={`No tienes actividades ${statusLabel(statusFilter)}.`}
              description="Las actividades de otros estados se consultan desde sus filtros."
            />
          ) : (
            <div className="grid gap-3.5 md:grid-cols-2">
              {visibleActivities.map((activity) => (
                <OrganizerActivityCard
                  key={activity.id}
                  activity={activity}
                  rating={ratings[activity.id]}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function OrganizerActivityCard({
  activity,
  rating,
}: {
  activity: Activity;
  rating?: ActivityRatingState;
}) {
  const [failedImages, setFailedImages] = useState<Set<string>>(
    () => new Set(),
  );
  const category = activity.activityType?.name;
  const color = activityTypeColor(category);
  const imageSources = getActivityImageSources({
    id: activity.id,
    name: activity.name,
    imageUrl: activity.imageUrl,
    category,
  });
  const imageUrl =
    imageSources.find((source) => !failedImages.has(source)) ?? null;

  return (
    <Link
      href={`/organizer/activities/${activity.id}`}
      className="group overflow-hidden rounded-card border border-[#E5E8EF] bg-white transition-colors hover:border-[#CCD2DE]"
    >
      <CategoryStripe category={category} />
      <div className="flex min-w-0 items-start gap-3 p-3.5 sm:gap-4 sm:p-4">
        <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:h-20 sm:w-20">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={() =>
                setFailedImages((failed) => new Set(failed).add(imageUrl))
              }
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ color }}
            >
              <ActivityCategoryIcon category={category} size={28} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={activity.status} />
            {category && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold"
                style={{ color }}
              >
                <ActivityCategoryIcon category={category} size={13} />
                {category}
              </span>
            )}
          </div>
          <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-foreground sm:text-[15px]">
            {activity.name}
          </h3>
          <div className="mt-2 flex flex-col gap-1.5 text-xs text-muted">
            <p className="flex min-w-0 items-center gap-1.5">
              <CalendarIcon
                aria-hidden="true"
                width={14}
                height={14}
                className="shrink-0"
              />
              <span className="truncate">
                {formatDate(activity.date)} ·{" "}
                {formatTimeRange(activity.startTime, activity.endTime)}
              </span>
            </p>
            <p className="flex min-w-0 items-center gap-1.5">
              <MapPinIcon
                aria-hidden="true"
                width={14}
                height={14}
                className="shrink-0"
              />
              <span className="truncate">
                {activity.location?.name ?? "Sin ubicación"}
              </span>
            </p>
          </div>

          {activity.status === "FINISHED" &&
            rating?.status === "loading" && (
              <p className="mt-2 text-xs text-muted">Cargando valoración…</p>
            )}
          {activity.status === "FINISHED" &&
            rating?.status === "error" && (
              <p className="mt-2 text-xs text-danger" title={rating.message}>
                Valoración no disponible
              </p>
            )}
          {activity.status === "FINISHED" &&
            rating?.status === "loaded" &&
            rating.summary.total > 0 && (
              <div
                aria-label={`Valoración promedio ${rating.summary.average.toFixed(1)} de 5, ${rating.summary.total} reseñas`}
                className="mt-2 flex items-center gap-1.5"
              >
                <span className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      width={13}
                      height={13}
                      className={
                        star <= Math.round(rating.summary.average)
                          ? "text-[#FE9A00]"
                          : "text-border"
                      }
                    />
                  ))}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {rating.summary.average.toFixed(1)}
                </span>
                <span className="text-xs text-muted">
                  ({rating.summary.total})
                </span>
              </div>
            )}
        </div>

        <div className="flex shrink-0 flex-col items-center rounded-xl bg-surface px-2 py-2 text-center">
          <span className="text-lg font-bold leading-none text-primary">
            {activity.enrolledCount ?? 0}
          </span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-muted">
            inscritos
          </span>
        </div>
      </div>
    </Link>
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
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
        selected
          ? "border-primary bg-primary text-white"
          : "border-[#E2E8EF] bg-white text-muted hover:border-primary/40"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
          selected ? "bg-white/15 text-white" : "bg-surface-2 text-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function Metric({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 rounded-card border border-[#E5E8EF] bg-white px-2 py-3 text-center sm:gap-2 sm:p-4">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-surface ${tone}`}>
        {icon}
      </span>
      <span className="text-2xl font-extrabold leading-none text-foreground sm:text-3xl">
        {value}
      </span>
      <span className="min-h-7 text-[10px] font-medium leading-tight text-muted sm:min-h-0 sm:text-xs">
        {label}
      </span>
    </div>
  );
}
