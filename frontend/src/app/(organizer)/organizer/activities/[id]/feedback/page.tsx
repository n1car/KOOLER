"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, EmptyState, Stars } from "@/components/ui";
import { BackHeader } from "@/components/AppShell";
import { formatDateTime } from "@/lib/format";
import { findActivity, mockActivityReviews } from "@/lib/mock";

export default function FeedbackPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const activity = findActivity(id);
  const reviews = mockActivityReviews[id] ?? null;

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews?.items.forEach((item) => {
      if (item.rating >= 1 && item.rating <= 5) counts[item.rating - 1] += 1;
    });
    return counts;
  }, [reviews]);

  return (
    <div className="flex flex-col gap-4">
      <BackHeader title={activity?.name ?? "Retroalimentación"} />

      {!reviews || reviews.total === 0 ? (
        <EmptyState
          title="Sin calificaciones aún"
          description="Cuando los estudiantes califiquen esta actividad, verás aquí el resumen de reseñas."
        />
      ) : (
        <>
          <Card className="flex flex-col items-center gap-2 py-6">
            <span className="text-5xl font-extrabold text-foreground">
              {reviews.average.toFixed(1)}
            </span>
            <Stars value={reviews.average} readOnly size={24} />
            <span className="text-xs text-muted">
              {reviews.total} {reviews.total === 1 ? "reseña" : "reseñas"}
            </span>
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground">
              Distribución de calificaciones
            </h2>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star - 1];
              const pct = reviews.total ? (count / reviews.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-semibold text-muted">
                    {star}★
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-[#FFCC00]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-muted">
                    {count}
                  </span>
                </div>
              );
            })}
          </Card>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground">Comentarios</h2>
            {reviews.items.map((item) => (
              <Card key={item.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {item.author}
                  </span>
                  <Stars value={item.rating} readOnly size={16} />
                </div>
                {item.comment && (
                  <p className="text-sm leading-relaxed text-foreground">
                    {item.comment}
                  </p>
                )}
                <span className="text-xs text-muted">
                  {formatDateTime(item.date)}
                </span>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
