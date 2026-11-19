"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import {
  CalendarIcon,
  CertificateIcon,
  ChartIcon,
  MapPinIcon,
} from "@/components/icons";
import { ActivityCategoryIcon } from "@/components/ActivityCategoryIcon";
import { activityTypeColor } from "@/lib/category";
import { formatDate, formatPercent } from "@/lib/format";
import { api, ApiError } from "@/lib/api";
import type { Eligibility, EnrollmentSummary } from "@/lib/types";

interface ActivityProgress {
  enrollment: EnrollmentSummary;
  eligibility: Eligibility;
}

function getEligibilityMessage(
  eligibility: Eligibility,
  isCertifiable: boolean,
): string {
  if (!isCertifiable) {
    return "Este resumen muestra tu asistencia. La actividad no emite certificados.";
  }

  switch (eligibility.reason) {
    case "ACTIVITY_NOT_FINISHED":
      return "La actividad todavía no ha finalizado; la elegibilidad se confirmará después.";
    case "ACTIVITY_NOT_CERTIFIABLE":
      return "Esta actividad no entrega certificados.";
    case "NO_SESSIONS":
      return "Aún no hay sesiones registradas para calcular la asistencia.";
    case "SESSIONS_PENDING":
      return `Quedan ${eligibility.sessionsPending} sesiones por finalizar; la elegibilidad se confirmará después.`;
    case "BELOW_MINIMUM":
      return "Tu asistencia todavía no alcanza el porcentaje mínimo requerido.";
    default:
      return eligibility.eligible
        ? "Cumples los requisitos de asistencia para esta actividad."
        : "Aún no se puede confirmar tu elegibilidad.";
  }
}

export default function ProgressPage() {
  const [activities, setActivities] = useState<ActivityProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [partialError, setPartialError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setPartialError("");
    try {
      const enrollments = await api.activities.myEnrollments();
      const results = await Promise.allSettled(
        enrollments.map(async (enrollment) => ({
          enrollment,
          eligibility: await api.certificates.eligibility(
            enrollment.activity.id,
          ),
        })),
      );
      const progress = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      if (enrollments.length > 0 && progress.length === 0) {
        setError("No se pudo cargar tu progreso.");
        return;
      }
      setActivities(progress);
      const failed = results.length - progress.length;
      if (failed > 0) {
        setPartialError(
          `No se pudo cargar el progreso de ${failed} ${
            failed === 1 ? "actividad" : "actividades"
          }.`,
        );
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo cargar tu progreso.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <LoadingState label="Cargando tu progreso..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">Mi progreso</h2>

      {partialError && <Alert tone="info">{partialError}</Alert>}

      {activities.length === 0 ? (
        <EmptyState
          icon={<ChartIcon width={36} height={36} />}
          title="Aún no tienes inscripciones"
          description="Inscríbete en actividades para consultar tu asistencia y avance hacia la certificación."
        />
      ) : (
        activities.map(({ enrollment, eligibility }) => {
          const percentage = eligibility.attendancePercentage;
          const category = enrollment.activity.category;
          const accent = activityTypeColor(category);
          const progressWidth = Math.max(
            0,
            Math.min(100, Number.isFinite(percentage) ? percentage : 0),
          );
          return (
            <article
              key={enrollment.enrollmentId}
              className="flex flex-col gap-4 rounded-2xl bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  {category && (
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: `${accent}1A`,
                        color: accent,
                      }}
                    >
                      <ActivityCategoryIcon category={category} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    {category && (
                      <span
                        className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${accent}1A`,
                          color: accent,
                        }}
                      >
                        {category}
                      </span>
                    )}
                    <h3 className="mt-1 text-[15px] font-bold leading-snug text-foreground">
                      {enrollment.activity.name}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <CalendarIcon width={14} height={14} />
                        {formatDate(enrollment.activity.date)}
                      </span>
                      {enrollment.activity.location && (
                        <span className="inline-flex min-w-0 items-center gap-1 break-words">
                          <MapPinIcon
                            width={14}
                            height={14}
                            className="shrink-0"
                          />
                          {enrollment.activity.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className="shrink-0 pt-1 text-base font-bold"
                  style={{ color: accent }}
                >
                  {formatPercent(percentage)}
                </span>
              </div>

              <div
                aria-label={`Asistencia: ${formatPercent(percentage)}`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={progressWidth}
                className="h-2.5 w-full overflow-hidden rounded-full bg-[#E8EAF0]"
                role="progressbar"
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progressWidth}%`,
                    backgroundColor: accent,
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>
                  {eligibility.sessionsPresent}/{eligibility.sessionsTotal}{" "}
                  clases
                  {enrollment.activity.isCertifiable &&
                    ` · mínimo ${eligibility.minimumAttendancePercentage}%`}
                  {eligibility.sessionsPending > 0 &&
                    ` · ${eligibility.sessionsPending} pendientes`}
                </span>
                <Badge
                  tone={
                    enrollment.activity.isCertifiable && eligibility.eligible
                      ? "success"
                      : "muted"
                  }
                >
                  {enrollment.activity.isCertifiable ? (
                    eligibility.eligible ? (
                      <span className="inline-flex items-center gap-1">
                        <CertificateIcon width={14} height={14} />
                        Apto
                      </span>
                    ) : eligibility.reason === "ACTIVITY_NOT_CERTIFIABLE" ? (
                      "No certificable"
                    ) : (
                      "Pendiente"
                    )
                  ) : (
                    "Asistencia"
                  )}
                </Badge>
              </div>

              <p className="rounded-xl bg-[#F4F5F8] px-3 py-2 text-xs leading-relaxed text-muted">
                {getEligibilityMessage(
                  eligibility,
                  enrollment.activity.isCertifiable,
                )}
              </p>

              <Link
                href={`/activities/${enrollment.activity.id}`}
                className="text-center text-xs font-semibold text-primary"
              >
                Ver actividad
              </Link>
            </article>
          );
        })
      )}
    </div>
  );
}
