"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Alert, Card, cn, Select } from "@/components/ui";
import { BackHeader } from "@/components/AppShell";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { findActivity, mockAttendance, mockRoster, mockSessions } from "@/lib/mock";
import type { AttendanceStatus } from "@/lib/types";

export default function AttendancePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const activity = findActivity(id);
  const sessions = mockSessions[id] ?? [];
  const roster = mockRoster[id] ?? null;

  const [sessionId, setSessionId] = useState<number | null>(
    sessions[0]?.id ?? null,
  );
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>(
    {},
  );
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    // Cada sesión mantiene sus propias marcaciones dentro del conjunto de datos demo.
    const records = mockAttendance[`${id}:${sessionId}`] ?? [];
    setStatuses(
      Object.fromEntries(records.map((record) => [record.studentId, record.status])),
    );
  }, [id, sessionId]);

  const isFinished = activity?.status === "FINISHED";

  function mark(studentId: number, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
    setNotice("Asistencia registrada.");
  }

  return (
    <div className="flex flex-col gap-4">
      <BackHeader title={activity?.name ?? "Asistencia"} />
      {notice && <Alert tone="success">{notice}</Alert>}

      {!isFinished && (
        <Alert tone="info">
          La actividad debe estar finalizada para registrar asistencia. Ve al
          detalle y pulsa &quot;Finalizar actividad&quot;.
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
            onChange={(e) => setSessionId(Number(e.target.value))}
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
                      disabled={!isFinished || recorded}
                      onClick={() => mark(student.id, "PRESENT")}
                    />
                    <ToggleButton
                      label="Ausente"
                      tone="danger"
                      active={current === "ABSENT"}
                      disabled={!isFinished || recorded}
                      onClick={() => mark(student.id, "ABSENT")}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
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
      disabled={disabled && !active}
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
