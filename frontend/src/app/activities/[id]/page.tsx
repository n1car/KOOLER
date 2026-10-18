"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { StudentShell, BackHeader } from "@/components/AppShell";
import { Alert, Badge, Button, Card, StatusBadge } from "@/components/ui";
import { CertificateIcon } from "@/components/icons";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { findActivity, mockSessions } from "@/lib/mock";

const ALREADY_ENROLLED = new Set([1, 3, 5]);

export default function ActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const activity = findActivity(id);
  const sessions = mockSessions[id] ?? [];
  const [enrolled, setEnrolled] = useState(() => ALREADY_ENROLLED.has(id));
  const [spots, setSpots] = useState(activity?.availableSpots ?? 0);
  const [notice, setNotice] = useState("");

  function handleEnroll() {
    if (!activity) return;
    setEnrolled(true);
    setSpots((value) => Math.max(0, value - 1));
    setNotice("¡Inscripción realizada exitosamente!");
  }

  return (
    <StudentShell>
      <BackHeader title="Detalle de la actividad" />
      {notice && <Alert tone="success">{notice}</Alert>}

      {!activity ? (
        <Alert>Actividad no encontrada.</Alert>
      ) : (
        <>
          <div className="relative flex h-44 items-end overflow-hidden rounded-card bg-gradient-to-br from-primary to-blue-400 p-5 text-white">
            {activity.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activity.imageUrl}
                alt={activity.name}
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
            )}
            <div className="relative z-10 flex w-full items-end justify-between gap-2">
              <h1 className="text-xl font-bold drop-shadow">{activity.name}</h1>
              <StatusBadge status={activity.status} />
            </div>
          </div>

          <Card className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              {formatDateLong(activity.date)} ·{" "}
              {formatTimeRange(activity.startTime, activity.endTime)}
            </p>
            <p className="text-sm text-muted">
              📍 {activity.location?.name ?? "Sin ubicación"}
            </p>
            <p className="text-sm text-muted">
              🎟️ {spots} de {activity.capacity} cupos disponibles
            </p>
            <div className="flex flex-wrap gap-2">
              {activity.activityType && (
                <Badge tone="primary">{activity.activityType.name}</Badge>
              )}
              {activity.isCertifiable && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  <CertificateIcon width={14} height={14} />
                  Esta actividad está certificada
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {activity.description}
            </p>
          </Card>

          {sessions.length > 0 && (
            <Card className="flex flex-col gap-2">
              <h2 className="text-sm font-bold text-foreground">Sesiones</h2>
              <ul className="flex flex-col gap-2">
                {sessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex items-center justify-between rounded-input bg-surface px-4 py-2 text-sm"
                  >
                    <span className="text-foreground">
                      {formatDateLong(session.sessionDate)}
                    </span>
                    <span className="text-muted">
                      {formatTimeRange(session.startTime, session.endTime)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {activity.status === "ACTIVE" && (
            <Button
              fullWidth
              disabled={enrolled || spots <= 0}
              onClick={handleEnroll}
            >
              {enrolled
                ? "Ya estás inscrito"
                : spots <= 0
                  ? "Agotado / Sin cupos"
                  : "Inscribirse"}
            </Button>
          )}
        </>
      )}
    </StudentShell>
  );
}
