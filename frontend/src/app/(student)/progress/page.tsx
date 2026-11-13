"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
} from "@/components/ui";
import { ChartIcon, CertificateIcon } from "@/components/icons";
import { formatDate, formatPercent } from "@/lib/format";
import { api, ApiError } from "@/lib/api";
import type { Eligibility, EnrollmentSummary } from "@/lib/types";

interface ActivityProgress {
  enrollment: EnrollmentSummary;
  eligibility: Eligibility;
}

function getEligibilityMessage(eligibility: Eligibility): string {
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

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const enrollments = await api.activities.myEnrollments();
      const progress = await Promise.all(
        enrollments.map(async (enrollment) => ({
          enrollment,
          eligibility: await api.certificates.eligibility(
            enrollment.activity.id,
          ),
        })),
      );
      setActivities(progress);
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
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">Mi progreso</h2>

      {activities.length === 0 ? (
        <EmptyState
          icon={<ChartIcon width={36} height={36} />}
          title="Aún no tienes inscripciones"
          description="Inscríbete en actividades para consultar tu asistencia y avance hacia la certificación."
        />
      ) : (
        activities.map(({ enrollment, eligibility }) => {
          const percentage = eligibility.attendancePercentage;
          return (
            <Card key={enrollment.enrollmentId} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {enrollment.activity.name}
                  </h3>
                  <p className="text-xs text-muted">
                    {formatDate(enrollment.activity.date)}
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">
                  {formatPercent(percentage)}
                </span>
              </div>

              <ProgressBar value={percentage} />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>
                  {eligibility.sessionsPresent}/{eligibility.sessionsTotal}{" "}
                  sesiones · mínimo {eligibility.minimumAttendancePercentage}%
                  {eligibility.sessionsPending > 0 &&
                    ` · ${eligibility.sessionsPending} pendientes`}
                </span>
                <Badge tone={eligibility.eligible ? "success" : "muted"}>
                  {eligibility.eligible ? (
                    <span className="inline-flex items-center gap-1">
                      <CertificateIcon width={14} height={14} />
                      Apto
                    </span>
                  ) : eligibility.reason === "ACTIVITY_NOT_CERTIFIABLE" ? (
                    "No certificable"
                  ) : (
                    "Pendiente"
                  )}
                </Badge>
              </div>

              <Alert tone={eligibility.eligible ? "success" : "info"}>
                {getEligibilityMessage(eligibility)}
              </Alert>

              <Link
                href={`/activities/${enrollment.activity.id}`}
                className="text-center text-xs font-semibold text-primary"
              >
                Ver actividad
              </Link>
            </Card>
          );
        })
      )}
    </div>
  );
}
