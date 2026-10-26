"use client";

import Link from "next/link";
import { Button, Card, EmptyState, ProgressBar } from "@/components/ui";
import { ChartIcon, CertificateIcon } from "@/components/icons";
import { formatDate, formatPercent } from "@/lib/format";
import { mockCertificates, mockEligibility, mockEnrollments } from "@/lib/mock";

export default function ProgressPage() {
  const certifiable = mockEnrollments.filter((e) => e.activity.isCertifiable);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">Mi progreso</h2>

      {certifiable.length === 0 ? (
        <EmptyState
          icon={<ChartIcon width={36} height={36} />}
          title="Sin actividades certificables"
          description="Inscríbete en actividades que otorgan certificación para ver tu avance aquí."
        />
      ) : (
        certifiable.map((enrollment) => {
          const eligibility = mockEligibility[enrollment.activity.id] ?? null;
          const certificate =
            mockCertificates.find(
              (c) => c.activityId === enrollment.activity.id,
            ) ?? null;
          const percentage = eligibility?.attendancePercentage ?? 0;
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

              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <span>
                  {eligibility
                    ? `${eligibility.sessionsPresent}/${eligibility.sessionsTotal} sesiones · mínimo ${eligibility.minimumAttendancePercentage}%`
                    : "Sin datos de asistencia"}
                </span>
                {eligibility?.eligible && (
                  <span className="font-semibold text-success">Apto</span>
                )}
              </div>

              {certificate ? (
                <Button variant="success" fullWidth>
                  <CertificateIcon width={18} height={18} />
                  Ver certificado
                </Button>
              ) : (
                <p className="text-xs font-medium text-muted">
                  Certificado disponible al alcanzar el mínimo de asistencia.
                </p>
              )}

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
