"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, ErrorState, LoadingState, Stars } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { activityTypeColor } from "@/lib/category";
import { formatDate } from "@/lib/format";
import type { Activity, ReviewSummary } from "@/lib/types";

export default function OrganizerFeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const activityId = Number(id);

  const [activity, setActivity] = useState<Activity | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [activityData, reviews] = await Promise.all([
        api.activities.get(activityId),
        api.reviews.organizer(activityId),
      ]);
      setActivity(activityData);
      setSummary(reviews);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar la retroalimentación.");
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    void load();
  }, [load]);

  const color = activityTypeColor(activity?.activityType?.name);
  const items = summary?.items ?? [];
  const total = summary?.total ?? 0;

  const distribution = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: items.filter((r) => r.rating === n).length,
  }));

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header
        className="relative flex min-h-[190px] shrink-0 flex-col justify-between overflow-hidden px-6 pb-6 pt-7 text-white"
        style={{
          backgroundColor: color,
          backgroundImage: activity?.imageUrl
            ? `linear-gradient(115deg, rgba(151, 62, 190, .88), rgba(120, 48, 163, .80)), url(${JSON.stringify(activity.imageUrl)})`
            : `linear-gradient(115deg, ${color}, #7b3da0)`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <Link href={`/organizer/activities/${id}`} className="relative z-10 inline-flex items-center gap-2 text-sm font-medium text-white/95">
          <span aria-hidden="true">←</span> Volver
        </Link>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-white/80">Retroalimentación</p>
          <h1 className="text-2xl font-bold leading-tight">{activity?.name ?? "Actividad"}</h1>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center px-5 py-8">
          <LoadingState label="Cargando retroalimentación..." />
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center px-5 py-8">
          <ErrorState message={error} onRetry={() => void load()} />
        </div>
      ) : total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-surface text-[#90A1B9]">
            <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-9.5A7.5 7.5 0 0 1 10.5 4h2A7.5 7.5 0 0 1 20 11.5Z" />
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-foreground">Sin calificaciones aún</h2>
            <p className="text-sm text-muted">Los estudiantes pueden calificar en su historial.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 px-5 py-6">
          <Card className="flex items-center gap-5 rounded-3xl border-0 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl font-bold text-foreground">
                {summary!.average.toFixed(1)}
              </span>
              <Stars value={summary!.average} readOnly size={18} />
              <span className="text-xs text-muted">
                {total} {total === 1 ? "reseña" : "reseñas"}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {distribution.map(({ n, count }) => (
                <div key={n} className="flex items-center gap-2 text-xs text-muted">
                  <span className="w-3">{n}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-warning"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                  <span className="w-3 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            {items.map((review) => (
              <Card key={review.id} className="flex flex-col gap-2 rounded-2xl border-0 p-4 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between">
                  <Stars value={review.rating} readOnly size={16} />
                  <span className="text-xs text-muted">{formatDate(review.date)}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{review.author}</p>
                {review.comment && <p className="text-sm text-foreground">{review.comment}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
