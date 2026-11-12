"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  cn,
  ErrorState,
  LoadingState,
  Select,
} from "@/components/ui";
import { BackHeader } from "@/components/AppShell";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { api, ApiError } from "@/lib/api";
import type {
  Activity,
  ActivityEnrollments,
  AttendanceStatus,
  Session,
} from "@/lib/types";

export default function AttendancePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [roster, setRoster] = useState<ActivityEnrollments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceLoadError, setAttendanceLoadError] = useState("");
  const [refreshAttendance, setRefreshAttendance] = useState(0);
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>(
    {},
  );
  const [savingStudents, setSavingStudents] = useState<Record<number, boolean>>(
    {},
  );
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setError("Actividad no encontrada.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [activityData, sessionList, enrollmentList] = await Promise.all([
        api.activities.get(id),
        api.activities.sessions(id),
        api.activities.enrollments(id),
      ]);
      setActivity(activityData);
      setSessions(sessionList);
      setRoster(enrollmentList);
      setSessionId((current) =>
        sessionList.some((session) => session.id === current)
          ? current
          : (sessionList[0]?.id ?? null),
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo cargar la información de asistencia.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!activity || sessionId === null) {
      setStatuses({});
      setAttendanceLoading(false);
      setAttendanceError("");
      return;
    }

    let active = true;
    setAttendanceLoading(true);
    setAttendanceLoadError("");
    setStatuses({});

    api.attendance
      .get(id, sessionId)
      .then((response) => {
        if (!active) return;
        setStatuses(
          response.attendance.reduce<Record<number, AttendanceStatus>>(
            (result, record) => {
              result[record.studentId] = record.status;
              return result;
            },
            {},
          ),
        );
      })
      .catch((err: unknown) => {
        if (!active) return;
        setAttendanceLoadError(
          err instanceof ApiError
            ? err.message
            : "No se pudo cargar la asistencia de esta sesión.",
        );
      })
      .finally(() => {
        if (active) setAttendanceLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activity, id, refreshAttendance, sessionId]);

  const isFinished = activity?.status === "FINISHED";
  const isSaving = Object.values(savingStudents).some(Boolean);

  async function mark(studentId: number, status: AttendanceStatus) {
    if (!isFinished || sessionId === null || savingStudents[studentId]) return;

    setSavingStudents((prev) => ({ ...prev, [studentId]: true }));
    setNotice("");
    setAttendanceError("");
    try {
      const record = await api.attendance.record(id, sessionId, {
        studentId,
        status,
      });
      setStatuses((prev) => ({ ...prev, [record.studentId]: record.status }));
      setNotice("Asistencia registrada.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAttendanceError(
          "Este estudiante ya tiene una asistencia registrada. Se mostrará el estado guardado.",
        );
        setRefreshAttendance((current) => current + 1);
      } else {
        setAttendanceError(
          err instanceof ApiError
            ? err.message
            : "No se pudo registrar la asistencia.",
        );
      }
    } finally {
      setSavingStudents((prev) => ({ ...prev, [studentId]: false }));
    }
  }

  if (loading) {
    return <LoadingState label="Cargando control de asistencia..." />;
  }

  if (error && !activity) {
    return (
      <div className="flex flex-col gap-4">
        <BackHeader title="Asistencia" />
        <ErrorState message={error} onRetry={() => void load()} />
      </div>
    );
  }

  if (!activity) {
    return <Alert>Actividad no encontrada.</Alert>;
  }

  return (
    <div className="flex flex-col gap-4">
      <BackHeader title={activity.name} />
      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      {!isFinished && (
        <Alert tone="info">
          La actividad debe estar finalizada para registrar asistencia. Ve al
          detalle y pulsa &quot;Finalizar actividad&quot;.
        </Alert>
      )}

      {attendanceError && (
        <Alert>{attendanceError}</Alert>
      )}
      {attendanceLoadError && (
        <Alert>
          <div className="flex flex-col items-start gap-2">
            <span>{attendanceLoadError}</span>
            <Button
              variant="outline"
              onClick={() => setRefreshAttendance((current) => current + 1)}
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      )}

      {sessions.length === 0 ? (
        <Alert tone="info">
          Esta actividad aún no tiene sesiones. Crea una desde el detalle.
        </Alert>
      ) : (
        <>
          <Select
            label="Sesión"
            value={sessionId ?? ""}
            disabled={isSaving}
            onChange={(e) => {
              setAttendanceError("");
              setAttendanceLoadError("");
              setAttendanceLoading(true);
              setStatuses({});
              setNotice("");
              setSessionId(Number(e.target.value));
            }}
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {formatDateLong(session.sessionDate)} ·{" "}
                {formatTimeRange(session.startTime, session.endTime)}
              </option>
            ))}
          </Select>

          <p className="text-xs text-muted">
            Registra la asistencia de los estudiantes inscritos en esta sesión.
          </p>

          {attendanceLoading ? (
            <LoadingState label="Cargando asistencia de la sesión..." />
          ) : (
            <Card className="flex flex-col divide-y divide-border p-0">
              {(roster?.enrollments.length ?? 0) === 0 && (
                <p className="p-5 text-center text-sm text-muted">
                  No hay estudiantes inscritos.
                </p>
              )}
              {roster?.enrollments.map(({ enrollmentId, student }) => {
                const current = statuses[student.id];
                const recorded = Boolean(current);
                return (
                  <div
                    key={enrollmentId}
                    className="flex items-center justify-between gap-3 p-4"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="truncate text-xs text-muted">
                        {student.email}
                      </span>
                      {!recorded && (
                        <span className="text-xs text-muted">Sin registrar</span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <ToggleButton
                        label="Presente"
                        tone="success"
                        active={current === "PRESENT"}
                        disabled={
                          !isFinished ||
                          recorded ||
                          attendanceLoading ||
                          Boolean(attendanceLoadError) ||
                          savingStudents[student.id]
                        }
                        onClick={() => void mark(student.id, "PRESENT")}
                      />
                      <ToggleButton
                        label="Ausente"
                        tone="danger"
                        active={current === "ABSENT"}
                        disabled={
                          !isFinished ||
                          recorded ||
                          attendanceLoading ||
                          Boolean(attendanceLoadError) ||
                          savingStudents[student.id]
                        }
                        onClick={() => void mark(student.id, "ABSENT")}
                      />
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function ToggleButton({
  label,
  tone,
  active,
  disabled,
  onClick,
}: {
  label: string;
  tone: "success" | "danger";
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const activeClass =
    tone === "success"
      ? "bg-success text-white border-success"
      : "bg-danger text-white border-danger";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
        active ? activeClass : "border-border bg-white text-muted",
      )}
    >
      {label}
    </button>
  );
}
