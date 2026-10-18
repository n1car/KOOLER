"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Badge, Button, Card, Input, StatusBadge } from "@/components/ui";
import { CertificateIcon } from "@/components/icons";
import { formatDate, formatDateLong, formatTimeRange } from "@/lib/format";
import { findActivity, mockRoster, mockSessions } from "@/lib/mock";
import type { Session } from "@/lib/types";

export default function OrganizerActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const activity = findActivity(id);
  const roster = mockRoster[id] ?? null;

  const [status, setStatus] = useState(activity?.status ?? "ACTIVE");
  const [sessions, setSessions] = useState<Session[]>(mockSessions[id] ?? []);
  const [sessionForm, setSessionForm] = useState({
    sessionDate: "",
    startTime: "",
    endTime: "",
  });
  const [notice, setNotice] = useState("");

  if (!activity) return <Alert>Actividad no encontrada.</Alert>;

  const isActive = status === "ACTIVE";

  function finishActivity() {
    setStatus("FINISHED");
    setNotice("Actividad finalizada. Ya puedes registrar asistencia.");
  }

  function addSession(event: React.FormEvent) {
    event.preventDefault();
    if (!sessionForm.sessionDate) return;
    setSessions((prev) => [
      ...prev,
      {
        id: Date.now(),
        activityId: id,
        sessionDate: sessionForm.sessionDate,
        startTime: sessionForm.startTime || null,
        endTime: sessionForm.endTime || null,
        createdAt: new Date().toISOString(),
      },
    ]);
    setSessionForm({ sessionDate: "", startTime: "", endTime: "" });
    setNotice("Sesión creada correctamente.");
  }

  return (
    <div className="flex flex-col gap-4">
      {notice && <Alert tone="success">{notice}</Alert>}

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
          <StatusBadge status={status} />
        </div>
      </div>

      <Card className="flex flex-col gap-2">
        <p className="text-sm text-muted">
          {formatDateLong(activity.date)} ·{" "}
          {formatTimeRange(activity.startTime, activity.endTime)}
        </p>
        <p className="text-sm text-muted">
          📍 {activity.location?.name ?? "Sin ubicación"}
        </p>
        <p className="text-sm text-muted">
          👥 {activity.enrolledCount ?? 0} de {activity.capacity} inscritos
        </p>
        {activity.isCertifiable && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            <CertificateIcon width={14} height={14} />
            Esta actividad está certificada
          </span>
        )}
        <p className="text-sm leading-relaxed text-foreground">
          {activity.description}
        </p>
      </Card>

      {isActive ? (
        <div className="flex flex-col gap-2">
          <Link
            href={`/organizer/activities/${id}/attendance`}
            className="flex w-full items-center justify-center rounded-input bg-primary px-5 py-3 text-[15px] font-semibold text-white"
          >
            Control de asistencia
          </Link>
          <Button variant="outline" fullWidth onClick={finishActivity}>
            Finalizar actividad
          </Button>
        </div>
      ) : (
        <Link
          href={`/organizer/activities/${id}/feedback`}
          className="flex w-full items-center justify-center rounded-input bg-primary px-5 py-3 text-[15px] font-semibold text-white"
        >
          Ver retroalimentación
        </Link>
      )}

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-foreground">Sesiones</h2>
        {sessions.length === 0 ? (
          <p className="text-xs text-muted">
            Agrega al menos una sesión para poder registrar asistencia y emitir
            certificados.
          </p>
        ) : (
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
        )}

        <form
          onSubmit={addSession}
          className="flex flex-col gap-3 border-t border-border pt-3"
        >
          <p className="text-xs font-semibold text-muted">Nueva sesión</p>
          <Input
            label="Fecha"
            type="date"
            value={sessionForm.sessionDate}
            onChange={(e) =>
              setSessionForm((prev) => ({ ...prev, sessionDate: e.target.value }))
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Hora inicio"
              type="time"
              value={sessionForm.startTime}
              onChange={(e) =>
                setSessionForm((prev) => ({ ...prev, startTime: e.target.value }))
              }
            />
            <Input
              label="Hora fin"
              type="time"
              value={sessionForm.endTime}
              onChange={(e) =>
                setSessionForm((prev) => ({ ...prev, endTime: e.target.value }))
              }
            />
          </div>
          <Button type="submit" variant="secondary" fullWidth>
            Agregar sesión
          </Button>
        </form>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            Inscritos ({roster?.totalEnrolled ?? 0})
          </h2>
          {roster && <Badge tone="muted">Cupos: {roster.capacity}</Badge>}
        </div>
        {!roster || roster.enrollments.length === 0 ? (
          <p className="text-xs text-muted">Todavía no hay inscritos.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {roster.enrollments.map(({ enrollmentId, enrollmentDate, student }) => (
              <li
                key={enrollmentId}
                className="flex items-center justify-between rounded-input bg-surface px-4 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {student.firstName} {student.lastName}
                  </span>
                  <span className="text-xs text-muted">{student.email}</span>
                </div>
                <span className="text-xs text-muted">
                  {formatDate(enrollmentDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
