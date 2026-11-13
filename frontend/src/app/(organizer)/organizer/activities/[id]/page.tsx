"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  ErrorState,
  Input,
  LoadingState,
  StatusBadge,
} from "@/components/ui";
import { CertificateIcon } from "@/components/icons";
import { formatDate, formatDateLong, formatTimeRange } from "@/lib/format";
import { api, ApiError } from "@/lib/api";
import type { Activity, ActivityEnrollments, Session } from "@/lib/types";

export default function OrganizerActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [activity, setActivity] = useState<Activity | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [roster, setRoster] = useState<ActivityEnrollments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [sessionForm, setSessionForm] = useState({
    sessionDate: "",
    startTime: "",
    endTime: "",
  });

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) {
      setError("Actividad no encontrada.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [detail, sessionList, enrollmentList] = await Promise.all([
        api.activities.get(id),
        api.activities.sessions(id),
        api.activities.enrollments(id),
      ]);
      setActivity(detail);
      setSessions(sessionList);
      setRoster(enrollmentList);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo cargar la actividad.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function finishActivity() {
    if (!activity || busy) return;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      await api.activities.update(id, { status: "FINISHED" });
      setActivity((prev) => (prev ? { ...prev, status: "FINISHED" } : prev));
      setNotice("Actividad finalizada. Ya puedes registrar asistencia.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo finalizar la actividad.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteActivity() {
    if (!activity || busy) return;
    setBusy(true);
    setDeleteError("");
    try {
      await api.activities.deletePermanently(id);
      router.replace(
        `/organizer/activities?deleted=${encodeURIComponent(activity.name)}`,
      );
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar la actividad. Inténtalo de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function addSession(event: React.FormEvent) {
    event.preventDefault();
    if (!sessionForm.sessionDate || busy) return;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      await api.activities.createSession(id, {
        sessionDate: sessionForm.sessionDate,
        ...(sessionForm.startTime ? { startTime: sessionForm.startTime } : {}),
        ...(sessionForm.endTime ? { endTime: sessionForm.endTime } : {}),
      });
      setSessions(await api.activities.sessions(id));
      setSessionForm({ sessionDate: "", startTime: "", endTime: "" });
      setNotice("Sesión creada correctamente.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo crear la sesión.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LoadingState label="Cargando actividad..." />;
  }

  if (error && !activity) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (!activity) {
    return <Alert>Actividad no encontrada.</Alert>;
  }

  const isActive = activity.status === "ACTIVE";

  return (
    <div className="flex flex-col gap-4">
      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

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

      <div className="flex flex-col gap-2">
        {(isActive || activity.status === "FINISHED") && (
          <Link
            href={`/organizer/activities/${id}/attendance`}
            className="flex w-full items-center justify-center rounded-input bg-primary px-5 py-3 text-[15px] font-semibold text-white"
          >
            Control de asistencia
          </Link>
        )}
        {isActive && (
          <Button
            variant="outline"
            fullWidth
            loading={busy}
            onClick={finishActivity}
          >
            Finalizar actividad
          </Button>
        )}
        {!isActive && (
          <Link
            href={`/organizer/activities/${id}/feedback`}
            className="flex w-full items-center justify-center rounded-input bg-primary px-5 py-3 text-[15px] font-semibold text-white"
          >
            Ver retroalimentación
          </Link>
        )}
        <Button
          variant="danger"
          fullWidth
          disabled={busy}
          onClick={() => {
            setDeleteError("");
            setDeleteDialogOpen(true);
          }}
        >
          Eliminar actividad
        </Button>
      </div>

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
            required
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
          <Button type="submit" variant="secondary" fullWidth loading={busy}>
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

      {deleteDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !busy) {
              setDeleteDialogOpen(false);
            }
          }}
        >
          <section
            aria-labelledby="delete-activity-title"
            aria-describedby="delete-activity-description"
            aria-modal="true"
            className="w-full max-w-md rounded-card border border-danger/20 bg-white p-6 shadow-2xl"
            role="alertdialog"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-danger">
              Acción irreversible
            </p>
            <h2
              className="text-lg font-bold text-foreground"
              id="delete-activity-title"
            >
              ¿Eliminar “{activity.name}”?
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed text-muted"
              id="delete-activity-description"
            >
              La actividad se borrará permanentemente. No se puede deshacer.
              Las sesiones asociadas también se eliminarán. Para proteger el
              historial, el sistema rechazará la acción si existen
              inscripciones, asistencias, reseñas o certificados asociados.
            </p>
            {deleteError && (
              <div className="mt-4">
                <Alert>{deleteError}</Alert>
              </div>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                autoFocus
                disabled={busy}
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Conservar actividad
              </Button>
              <Button
                loading={busy}
                variant="danger"
                onClick={deleteActivity}
              >
                Eliminar definitivamente
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
