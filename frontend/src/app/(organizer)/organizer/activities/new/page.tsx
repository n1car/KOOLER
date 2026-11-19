"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Input, Select, Textarea } from "@/components/ui";
import { ActivityCategoryIcon } from "@/components/ActivityCategoryIcon";
import { CalendarIcon } from "@/components/icons";
import { api, ApiError } from "@/lib/api";
import { activityTypeColor } from "@/lib/category";
import { formatDateLong } from "@/lib/format";
import { generateSessionDates } from "@/lib/session-schedule";
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

const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

export default function CreateActivityPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [saving, setSaving] = useState(false);
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null);
  const [multipleSessions, setMultipleSessions] = useState(false);
  const [isCertifiable, setIsCertifiable] = useState(false);
  const [sessionCount, setSessionCount] = useState("2");
  const [durationWeeks, setDurationWeeks] = useState("4");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3]);
  const [singleSession, setSingleSession] = useState<SessionDraft>({
    ...EMPTY_SESSION,
  });
  const [schedule, setSchedule] = useState({
    startDate: "",
    startTime: "",
    endTime: "",
  });
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

  function updateSingleSession(key: keyof SessionDraft, value: string) {
    setSingleSession((previous) => ({ ...previous, [key]: value }));
  }

  function updateSchedule(
    key: keyof typeof schedule,
    value: (typeof schedule)[keyof typeof schedule],
  ) {
    setSchedule((previous) => ({ ...previous, [key]: value }));
  }

  function selectMode(multiple: boolean) {
    setMultipleSessions(multiple);
    if (multiple) {
      setSchedule((previous) => ({
        startDate: previous.startDate || singleSession.date,
        startTime: previous.startTime || singleSession.startTime,
        endTime: previous.endTime || singleSession.endTime,
      }));
      return;
    }

    setSingleSession((previous) => ({
      date: schedule.startDate || previous.date,
      startTime: schedule.startTime || previous.startTime,
      endTime: schedule.endTime || previous.endTime,
    }));
  }

  function toggleWeekday(weekday: number) {
    setSelectedDays((previous) =>
      previous.includes(weekday)
        ? previous.filter((day) => day !== weekday)
        : [...previous, weekday].sort((a, b) => a - b),
    );
  }

  const generatedDates = useMemo(
    () =>
      generateSessionDates(
        schedule.startDate,
        selectedDays,
        Number(sessionCount),
        Number(durationWeeks),
      ),
    [durationWeeks, schedule.startDate, selectedDays, sessionCount],
  );
  const generatedSessions = useMemo(
    () =>
      generatedDates.map((date) => ({
        date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })),
    [generatedDates, schedule.endTime, schedule.startTime],
  );
  const imagePreviewUrl = form.imageUrl.trim();
  const canPreviewImage =
    /^https?:\/\//i.test(imagePreviewUrl) &&
    failedPreviewUrl !== imagePreviewUrl;
  const selectedCategory = types.find(
    (type) => String(type.id) === form.activityTypeId,
  )?.name;
  const selectedCategoryColor = activityTypeColor(selectedCategory);

  function validateSessions(activeSessions: SessionDraft[]): string | null {
    if (multipleSessions) {
      const count = Number(sessionCount);
      const weeks = Number(durationWeeks);
      if (!Number.isInteger(count) || count < 2 || count > 20) {
        return "La cantidad debe estar entre 2 y 20 sesiones.";
      }
      if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) {
        return "La duración debe estar entre 1 y 52 semanas.";
      }
      if (selectedDays.length === 0) {
        return "Selecciona al menos un día para las sesiones.";
      }
      if (!schedule.startDate || !schedule.startTime || !schedule.endTime) {
        return "Completa la fecha de inicio y el horario de las sesiones.";
      }
      if (activeSessions.length !== count) {
        return "Aumenta la duración o selecciona más días para completar la cantidad de sesiones.";
      }
    } else if (activeSessions.length !== 1) {
      return "Agrega una fecha para la actividad.";
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

  function getActiveSessions(): SessionDraft[] {
    return multipleSessions ? generatedSessions : [singleSession];
  }

  function updateCount(value: string) {
    setSessionCount(value);
  }

  function updateDuration(value: string) {
    setDurationWeeks(value);
  }

  function getSessionCountHint() {
    if (!schedule.startDate || selectedDays.length === 0) return "";
    if (generatedDates.length < Number(sessionCount)) {
      return `${generatedDates.length} de ${sessionCount} sesiones caben en este periodo.`;
    }
    return `${generatedDates.length} sesiones programadas.`;
  }

  function getDayButtonClass(selected: boolean) {
    return selected
      ? "border-primary bg-primary text-white"
      : "border-border bg-white text-muted hover:border-primary/40";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const activeSessions = getActiveSessions();
    const sessionError = validateSessions(activeSessions);
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

    if (multipleSessions && isCertifiable) {
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
        isCertifiable,
        ...(multipleSessions && isCertifiable
          ? { minAttendancePercentage: Number(form.minAttendancePercentage) }
          : {}),
        ...(imageUrl ? { imageUrl } : {}),
        ...(form.activityTypeId
          ? { activityTypeId: Number(form.activityTypeId) }
          : {}),
        ...(form.locationName.trim()
          ? { locationName: form.locationName.trim() }
          : {}),
        sessions: activeSessions.map((session) => ({
          sessionDate: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
        })),
      });
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

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-5xl flex-col gap-5"
    >
      <p className="text-sm leading-relaxed text-muted">
        Completa la información y organiza las sesiones de tu actividad.
      </p>
      {error && <Alert>{error}</Alert>}
      {catalogError && <Alert tone="info">{catalogError}</Alert>}

      <Card className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Información de la actividad
          </h2>
          <p className="mt-1 text-xs text-muted">
            Cuéntales a los estudiantes qué van a realizar.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(200px,0.85fr)] sm:items-end">
          <Input
            label="Imagen de la actividad (URL)"
            placeholder="https://..."
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            hint="Usa un enlace directo a una imagen JPG, PNG o WebP."
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">
              Vista previa
            </span>
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-dashed border-[#D8DDE7] bg-surface-2">
              {canPreviewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreviewUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => setFailedPreviewUrl(imagePreviewUrl)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                  {selectedCategory && (
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white"
                      style={{ color: selectedCategoryColor }}
                    >
                      <ActivityCategoryIcon
                        category={selectedCategory}
                        size={22}
                      />
                    </span>
                  )}
                  <span className="text-xs text-muted">
                    {failedPreviewUrl === imagePreviewUrl && imagePreviewUrl
                      ? "No se pudo cargar esta imagen."
                      : "La imagen aparecerá aquí."}
                  </span>
                </div>
              )}
              {canPreviewImage && (
                <span className="absolute bottom-2 left-2 rounded-full bg-primary/80 px-2.5 py-1 text-[10px] font-semibold text-white">
                  Vista previa
                </span>
              )}
            </div>
          </div>
        </div>
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

      <Card className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Configuración de sesiones
            </h2>
            <p className="mt-1 text-xs text-muted">
              Elige cómo se desarrollará la actividad.
            </p>
          </div>
          <div
            aria-label="Tipo de sesiones"
            className="grid grid-cols-2 gap-2"
            role="group"
          >
            <button
              type="button"
              aria-pressed={!multipleSessions}
              onClick={() => selectMode(false)}
              className={`flex min-h-[72px] flex-col items-start justify-center gap-1 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                !multipleSessions
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-[#E5E8EF] bg-white text-muted hover:border-primary/40"
              }`}
            >
              <span className="text-sm font-bold">Sesión única</span>
              <span className="text-[11px] font-normal opacity-80">
                Un día y un horario
              </span>
            </button>
            <button
              type="button"
              aria-pressed={multipleSessions}
              onClick={() => selectMode(true)}
              className={`flex min-h-[72px] flex-col items-start justify-center gap-1 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                multipleSessions
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-[#E5E8EF] bg-white text-muted hover:border-primary/40"
              }`}
            >
              <span className="text-sm font-bold">Varias sesiones</span>
              <span className="text-[11px] font-normal opacity-80">
                Programa días recurrentes
              </span>
            </button>
          </div>
        </div>

        {multipleSessions ? (
          <>
            <p className="text-xs text-muted">
              Programa sesiones recurrentes eligiendo una fecha inicial, los días
              y el horario. Las fechas se repiten durante la duración indicada.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Cantidad de sesiones"
                type="number"
                min={2}
                max={20}
                step={1}
                value={sessionCount}
                onChange={(e) => updateCount(e.target.value)}
                required
              />
              <Input
                label="Duración (semanas)"
                type="number"
                min={1}
                max={52}
                step={1}
                value={durationWeeks}
                onChange={(e) => updateDuration(e.target.value)}
                required
              />
            </div>
            <Input
              label="Fecha inicial"
              type="date"
              value={schedule.startDate}
              onChange={(e) => updateSchedule("startDate", e.target.value)}
              required
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">
                Días seleccionados
              </span>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {WEEKDAYS.map((day) => {
                  const selected = selectedDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleWeekday(day.value)}
                      className={`rounded-input border px-2 py-2 text-sm font-semibold transition-colors ${getDayButtonClass(selected)}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Hora inicio"
                type="time"
                value={schedule.startTime}
                onChange={(e) => updateSchedule("startTime", e.target.value)}
                required
              />
              <Input
                label="Hora fin"
                type="time"
                value={schedule.endTime}
                onChange={(e) => updateSchedule("endTime", e.target.value)}
                required
              />
            </div>
            <div className="rounded-input border border-border bg-surface px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                Fechas generadas
              </p>
              <p className="mt-1 text-xs text-muted">
                {getSessionCountHint() || "Elige la fecha inicial y los días."}
              </p>
              {generatedDates.length > 0 && (
                <ol className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted sm:grid-cols-3">
                  {generatedDates.map((date, index) => (
                    <li
                      key={`${date}-${index}`}
                      className="flex items-start gap-1.5"
                    >
                      <CalendarIcon
                        aria-hidden="true"
                        width={14}
                        height={14}
                        className="mt-0.5 shrink-0"
                      />
                      <span>
                        Sesión {index + 1}: {formatDateLong(date)}
                        {schedule.startTime && schedule.endTime
                          ? ` · ${schedule.startTime}–${schedule.endTime}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              {generatedDates.length < Number(sessionCount) &&
                schedule.startDate &&
                selectedDays.length > 0 && (
                  <p className="mt-2 text-xs font-medium text-warning">
                    Aumenta la duración o selecciona más días para completar las
                    sesiones.
                  </p>
                )}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-muted">
              La actividad tendrá una sola sesión. Podrás registrar asistencia
              cuando finalice.
            </p>
            <Input
              label="Fecha de la actividad"
              type="date"
              value={singleSession.date}
              onChange={(e) => updateSingleSession("date", e.target.value)}
              required
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Hora inicio"
                type="time"
                value={singleSession.startTime}
                onChange={(e) =>
                  updateSingleSession("startTime", e.target.value)
                }
                required
              />
              <Input
                label="Hora fin"
                type="time"
                value={singleSession.endTime}
                onChange={(e) => updateSingleSession("endTime", e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="border-t border-[#E8EAF0] pt-4">
          <p className="mb-3 text-sm font-bold text-foreground">
            Inscripciones
          </p>
          <Input
            label="Fecha límite de inscripción"
            type="datetime-local"
            value={form.registrationDeadline}
            onChange={(e) => update("registrationDeadline", e.target.value)}
            required
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-3 border-[#DDEDE6] bg-white p-4 sm:p-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={isCertifiable}
            onChange={(event) => setIsCertifiable(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-primary"
          />
          <span className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              ¿Esta actividad emitirá certificados?
            </span>
            <span className="text-xs leading-relaxed text-muted">
              {isCertifiable
                ? "Se emitirán cuando la actividad finalice y cada estudiante cumpla el requisito de asistencia."
                : "La actividad tendrá control de asistencia, pero no se emitirán certificados."}
            </span>
          </span>
        </label>
      </Card>

      {multipleSessions && isCertifiable && (
        <Card className="flex flex-col gap-4 border-[#DDEDE6] bg-white p-4 sm:p-6">
          <div className="rounded-input bg-success/10 px-4 py-3 text-sm text-success">
            El certificado se genera al finalizar la actividad si se cumple el
            requisito de asistencia. El PDF se descarga desde el detalle.
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
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 border-t border-[#E5E8EF] pt-4 sm:flex sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="border-transparent bg-white shadow-sm sm:w-44"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={saving} className="sm:w-44">
          Crear actividad
        </Button>
      </div>
    </form>
  );
}
