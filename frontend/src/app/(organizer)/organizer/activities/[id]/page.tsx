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
import { ActivityHero } from "@/components/activities/ActivityHero";
import { FinishActivityDialog } from "@/components/activities/FinishActivityDialog";
import {
  CertificateIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/icons";
import { activityTypeColor } from "@/lib/category";
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
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [finishEnrolledCount, setFinishEnrolledCount] = useState(0);
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

  async function performFinish() {
    if (!activity) return;
    await api.activities.update(id, { status: "FINISHED" });
    setFinishDialogOpen(false);
    await load();
    setNotice(
      sessions.length > 0
        ? "Actividad finalizada. Ya puedes registrar asistencia."
        : "Actividad finalizada.",
    );
  }

  async function requestFinish() {
    if (!activity || busy) return;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const latestRoster = await api.activities.enrollments(id);
      setRoster(latestRoster);
      if (latestRoster.totalEnrolled > 0) {
        setFinishEnrolledCount(latestRoster.totalEnrolled);
        setFinishDialogOpen(true);
        return;
      }
      await performFinish();
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

  async function confirmFinish() {
    if (!activity || busy) return;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      await performFinish();
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
  const isMultiSession = sessions.length > 1 || activity.isCertifiable;
  const canIssueCertificate = activity.isCertifiable;
  const categoryColor = activityTypeColor(activity.activityType?.name);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <div className="overflow-hidden rounded-card">
        <ActivityHero
          activity={activity}
          onBack={() => router.push("/organizer/activities")}
        >
          <StatusBadge status={activity.status} />
        </ActivityHero>
      </div>

      <Card className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-foreground">
          {activity.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={activity.status} />
          {canIssueCertificate && (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <CertificateIcon width={14} height={14} />
              Certificable
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">
            {formatDateLong(activity.date)} ·{" "}
            {formatTimeRange(activity.startTime, activity.endTime)}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted">
            <MapPinIcon width={16} height={16} className="shrink-0" />
            {activity.location?.name ?? "Sin ubicación"}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted">
            <UsersIcon width={16} height={16} className="shrink-0" />
            {activity.enrolledCount ?? 0} de {activity.capacity} inscritos
          </p>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-foreground">Acciones</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {sessions.length > 0 &&
            (isActive || activity.status === "FINISHED") && (
              <Link
                href={`/organizer/activities/${id}/attendance`}
                className="flex w-full items-center justify-center rounded-input border px-5 py-3 text-sm font-semibold text-foreground transition-[filter] hover:brightness-95 sm:w-auto"
                style={{
                  borderColor: `${categoryColor}55`,
                  backgroundColor: `${categoryColor}14`,
                }}
              >
                Control de asistencia
              </Link>
            )}
          {isActive && (
            <Button
              fullWidth
              loading={busy}
              onClick={requestFinish}
              className="sm:w-auto"
            >
              Finalizar actividad
            </Button>
          )}
          {!isActive && (
            <Link
              href={`/organizer/activities/${id}/feedback`}
              className="flex w-full items-center justify-center rounded-input border px-5 py-3 text-sm font-semibold text-foreground transition-[filter] hover:brightness-95 sm:w-auto"
              style={{
                borderColor: `${categoryColor}55`,
                backgroundColor: `${categoryColor}14`,
              }}
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
            className="sm:w-auto"
          >
            Eliminar actividad
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-foreground">Sesiones</h2>
        {sessions.length === 0 ? (
          <p className="text-xs text-muted">
            Esta actividad no tiene sesiones registradas.
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

        {isMultiSession ? (
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
                setSessionForm((prev) => ({
                  ...prev,
                  sessionDate: e.target.value,
                }))
              }
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Hora inicio"
                type="time"
                value={sessionForm.startTime}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
              />
              <Input
                label="Hora fin"
                type="time"
                value={sessionForm.endTime}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
              />
            </div>
            <Button
              type="submit"
              loading={busy}
              className="w-full sm:w-auto sm:self-start"
            >
              Agregar sesión
            </Button>
          </form>
        ) : (
          <p className="border-t border-border pt-3 text-xs text-muted">
            El control de asistencia estará disponible cuando finalice la
            sesión.
          </p>
        )}
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

      {finishDialogOpen && (
        <FinishActivityDialog
          enrolledCount={finishEnrolledCount}
          busy={busy}
          onCancel={() => setFinishDialogOpen(false)}
          onConfirm={confirmFinish}
        />
      )}

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
