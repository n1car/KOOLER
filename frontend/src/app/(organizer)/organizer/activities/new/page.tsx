"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Input, Select, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { ActivityType, Location } from "@/lib/types";

interface SessionDraft {
  date: string;
  startTime: string;
  endTime: string;
}

const EMPTY_SESSION: SessionDraft = {
  date: "",
  startTime: "",
  endTime: "",
};

export default function CreateActivityPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [saving, setSaving] = useState(false);
  const [multipleSessions, setMultipleSessions] = useState(false);
  const [sessionCount, setSessionCount] = useState("2");
  const [sessions, setSessions] = useState<SessionDraft[]>([{ ...EMPTY_SESSION }]);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    activityTypeId: "",
    locationName: "",
    capacity: "20",
    registrationDeadline: "",
    minAttendancePercentage: "80",
  });

  useEffect(() => {
    let active = true;
    Promise.all([api.catalog.activityTypes(), api.catalog.locations()])
      .then(([typeList, locationList]) => {
        if (!active) return;
        setTypes(typeList);
        setLocations(locationList);
      })
      .catch((err) => {
        if (!active) return;
        setCatalogError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar las categorías y ubicaciones.",
        );
      });
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSession(
    index: number,
    key: keyof SessionDraft,
    value: string,
  ) {
    setSessions((prev) =>
      prev.map((session, sessionIndex) =>
        sessionIndex === index ? { ...session, [key]: value } : session,
      ),
    );
  }

  function selectMode(multiple: boolean) {
    setMultipleSessions(multiple);
    if (multiple) {
      setSessions((prev) => {
        if (prev.length >= 2) return prev;
        const first = prev[0] ?? EMPTY_SESSION;
        return [
          first,
          { date: "", startTime: first.startTime, endTime: first.endTime },
        ];
      });
      return;
    }

    setSessionCount("2");
    setSessions((prev) => [prev[0] ?? { ...EMPTY_SESSION }]);
  }

  function updateSessionCount(value: string) {
    setSessionCount(value);
    const count = Number.parseInt(value, 10);
    if (!Number.isFinite(count) || count < 2) return;

    setSessions((prev) => {
      const next = [...prev];
      while (next.length < count) {
        const last = next[next.length - 1] ?? EMPTY_SESSION;
        next.push({ date: "", startTime: last.startTime, endTime: last.endTime });
      }
      return next.slice(0, count);
    });
  }

  function validateSessions(): string | null {
    const activeSessions = multipleSessions ? sessions : sessions.slice(0, 1);
    if (activeSessions.length === 0) {
      return "Agrega al menos una fecha para la actividad.";
    }
    if (multipleSessions && activeSessions.length < 2) {
      return "Una actividad con varias sesiones debe tener al menos dos fechas.";
    }

    for (const [index, session] of activeSessions.entries()) {
      if (!session.date || !session.startTime || !session.endTime) {
        return `Completa la fecha y las horas de la sesión ${index + 1}.`;
      }
      if (session.endTime <= session.startTime) {
        return `La hora de fin de la sesión ${index + 1} debe ser posterior a la de inicio.`;
      }
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const sessionError = validateSessions();
    if (sessionError) {
      setError(sessionError);
      return;
    }

    const deadline = new Date(form.registrationDeadline);
    if (Number.isNaN(deadline.getTime())) {
      setError("La fecha límite de inscripción no es válida.");
      return;
    }

    const imageUrl = form.imageUrl.trim();
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      setError("La imagen debe ser una URL que empiece por http:// o https://.");
      return;
    }

    if (multipleSessions) {
      const minimumAttendance = Number(form.minAttendancePercentage);
      if (
        !Number.isFinite(minimumAttendance) ||
        minimumAttendance < 1 ||
        minimumAttendance > 100
      ) {
        setError("La asistencia mínima debe estar entre 1 y 100.");
        return;
      }
    }

    const activeSessions = multipleSessions ? sessions : sessions.slice(0, 1);
    const firstSession = activeSessions[0];
    if (!firstSession) {
      setError("Agrega al menos una fecha para la actividad.");
      return;
    }

    setSaving(true);
    try {
      const created = await api.activities.create({
        name: form.name.trim(),
        description: form.description.trim(),
        date: firstSession.date,
        startTime: firstSession.startTime,
        endTime: firstSession.endTime,
        capacity: Number(form.capacity),
        registrationDeadline: deadline.toISOString(),
        isCertifiable: multipleSessions,
        ...(multipleSessions
          ? { minAttendancePercentage: Number(form.minAttendancePercentage) }
          : {}),
        ...(imageUrl ? { imageUrl } : {}),
        ...(form.activityTypeId
          ? { activityTypeId: Number(form.activityTypeId) }
          : {}),
        ...(form.locationName.trim()
          ? { locationName: form.locationName.trim() }
          : {}),
      });

      try {
        for (const session of activeSessions) {
          await api.activities.createSession(created.id, {
            sessionDate: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
          });
        }
      } catch {
        router.push(`/organizer/activities/${created.id}`);
        return;
      }

      router.push(`/organizer/activities/${created.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo crear la actividad. Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  }

  const activeSessions = multipleSessions ? sessions : sessions.slice(0, 1);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">Crea tu nueva actividad</h2>
      {error && <Alert>{error}</Alert>}
      {catalogError && <Alert tone="info">{catalogError}</Alert>}

      <Card className="flex flex-col gap-4">
        <Input
          label="Imagen de la actividad (URL)"
          placeholder="https://..."
          value={form.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
          hint="Usa una URL directa a la imagen (JPG, PNG o WebP)."
        />
        <Input
          label="Nombre"
          placeholder="Título de la actividad"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
        <Textarea
          label="Descripción"
          placeholder="Describe la actividad..."
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Categoría"
            value={form.activityTypeId}
            onChange={(e) => update("activityTypeId", e.target.value)}
          >
            <option value="">Sin categoría</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
          <Input
            label="Cupos máximos"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => update("capacity", e.target.value)}
            required
          />
        </div>
        <Input
          label="Lugar / Ubicación"
          list="activity-location-options"
          placeholder="Escribe el lugar, por ejemplo: Campus Pance"
          value={form.locationName}
          onChange={(e) => update("locationName", e.target.value)}
          hint="Puedes escribir una ubicación nueva o elegir una existente."
        />
        <datalist id="activity-location-options">
          {locations.map((location) => (
            <option key={location.id} value={location.name}>
              {location.building ?? undefined}
            </option>
          ))}
        </datalist>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">
            Configuración de sesiones
          </span>
          <div className="flex items-center gap-1 rounded-full bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => selectMode(false)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                !multipleSessions ? "bg-white text-foreground shadow-sm" : "text-muted"
              }`}
            >
              Única
            </button>
            <button
              type="button"
              onClick={() => selectMode(true)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                multipleSessions ? "bg-white text-foreground shadow-sm" : "text-muted"
              }`}
            >
              Varias
            </button>
          </div>
        </div>

        {multipleSessions ? (
          <>
            <p className="text-xs text-muted">
              Define cuántas sesiones tendrá la actividad. Puedes cambiar la fecha
              de cada una y mantener la misma hora.
            </p>
            <Input
              label="Cantidad de sesiones"
              type="number"
              min={2}
              max={20}
              value={sessionCount}
              onChange={(e) => updateSessionCount(e.target.value)}
              onBlur={() => {
                if (Number(sessionCount) < 2) {
                  updateSessionCount("2");
                }
              }}
              required
            />

            <div className="flex flex-col gap-3">
              {activeSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-input border border-border p-3"
                >
                  <span className="text-xs font-semibold text-muted">
                    Sesión {index + 1}
                  </span>
                  <Input
                    label="Fecha"
                    type="date"
                    value={session.date}
                    onChange={(e) =>
                      updateSession(index, "date", e.target.value)
                    }
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Hora inicio"
                      type="time"
                      value={session.startTime}
                      onChange={(e) =>
                        updateSession(index, "startTime", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Hora fin"
                      type="time"
                      value={session.endTime}
                      onChange={(e) =>
                        updateSession(index, "endTime", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-muted">
              La actividad tendrá una sola fecha y no llevará control de
              asistencia.
            </p>
            <Input
              label="Fecha de la actividad"
              type="date"
              value={activeSessions[0]?.date ?? ""}
              onChange={(e) => updateSession(0, "date", e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Hora inicio"
                type="time"
                value={activeSessions[0]?.startTime ?? ""}
                onChange={(e) => updateSession(0, "startTime", e.target.value)}
                required
              />
              <Input
                label="Hora fin"
                type="time"
                value={activeSessions[0]?.endTime ?? ""}
                onChange={(e) => updateSession(0, "endTime", e.target.value)}
                required
              />
            </div>
          </>
        )}

        <Input
          label="Fecha límite de inscripción"
          type="datetime-local"
          value={form.registrationDeadline}
          onChange={(e) => update("registrationDeadline", e.target.value)}
          required
        />
      </Card>

      <Card className="flex flex-col gap-4">
        {multipleSessions ? (
          <>
            <div className="rounded-input bg-success/10 px-4 py-3 text-sm text-success">
              Las actividades con varias sesiones emiten certificado
              automáticamente. El PDF se genera al finalizar y se descarga desde
              el detalle de la actividad.
            </div>
            <Input
              label="Asistencia mínima para certificar (%)"
              type="number"
              min={1}
              max={100}
              value={form.minAttendancePercentage}
              onChange={(e) =>
                update("minAttendancePercentage", e.target.value)
              }
            />
          </>
        ) : (
          <div className="rounded-input bg-surface-2 px-4 py-3 text-sm text-muted">
            Las actividades de sesión única no emiten certificado ni llevan
            control de asistencia.
          </div>
        )}
      </Card>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" fullWidth loading={saving}>
          Crear actividad
        </Button>
      </div>
    </form>
  );
}
