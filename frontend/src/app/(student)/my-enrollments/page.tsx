"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui";
import { BookmarkIcon } from "@/components/icons";
import { api, ApiError } from "@/lib/api";
import type { EnrollmentSummary } from "@/lib/types";

export default function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEnrollments(await api.activities.myEnrollments());
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudieron cargar tus inscripciones.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <LoadingState label="Cargando inscripciones..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (enrollments.length === 0) {
    return (
      <EmptyState
        icon={<BookmarkIcon width={36} height={36} />}
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
    <>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-bold text-foreground lg:text-2xl">
          Mis inscripciones
        </h1>
        <p className="text-sm text-muted">Actividades a las que ya te uniste</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
        {enrollments.map(({ enrollmentId, activity }) => (
          <ActivityCard
            key={enrollmentId}
            activity={{
              id: activity.id,
              name: activity.name,
              imageUrl: activity.imageUrl,
              activityType: activity.category
                ? { name: activity.category }
                : null,
            }}
            enrolled
          />
        ))}
      </div>
    </>
  );
}
