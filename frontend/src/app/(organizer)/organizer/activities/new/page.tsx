"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Input, Select, Textarea } from "@/components/ui";
import { mockActivityTypes, mockLocations } from "@/lib/mock";

export default function CreateActivityPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [multipleSessions, setMultipleSessions] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    activityTypeId: "",
    locationId: "",
    capacity: "20",
    date: "",
    startTime: "",
    endTime: "",
    registrationDeadline: "",
    isCertifiable: false,
    minAttendancePercentage: "80",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }
    router.push("/organizer/activities");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">Crea tu nueva actividad</h2>
      {error && <Alert>{error}</Alert>}

      <Card className="flex flex-col gap-4">
        <Input
          label="Imagen de la actividad (URL)"
          placeholder="https://..."
          value={form.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
          hint="Solo se admiten imágenes por URL."
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
            {mockActivityTypes.map((type) => (
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
        <Select
          label="Lugar / Ubicación"
          value={form.locationId}
          onChange={(e) => update("locationId", e.target.value)}
        >
          <option value="">Sin ubicación</option>
          {mockLocations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
              {location.building ? ` — ${location.building}` : ""}
            </option>
          ))}
        </Select>
      </Card>

      <Card className="flex flex-col gap-4">
        <Input
          label="Fecha de inicio"
          type="date"
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Hora inicio"
            type="time"
            value={form.startTime}
            onChange={(e) => update("startTime", e.target.value)}
            required
          />
          <Input
            label="Hora fin"
            type="time"
            value={form.endTime}
            onChange={(e) => update("endTime", e.target.value)}
            required
          />
        </div>
        <Input
          label="Fecha límite de inscripción"
          type="datetime-local"
          value={form.registrationDeadline}
          onChange={(e) => update("registrationDeadline", e.target.value)}
          required
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">
            Configuración de sesiones
          </span>
          <div className="flex items-center gap-1 rounded-full bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => setMultipleSessions(false)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                !multipleSessions ? "bg-white text-foreground shadow-sm" : "text-muted"
              }`}
            >
              Única
            </button>
            <button
              type="button"
              onClick={() => setMultipleSessions(true)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                multipleSessions ? "bg-white text-foreground shadow-sm" : "text-muted"
              }`}
            >
              Varias
            </button>
          </div>
        </div>
        <p className="text-xs text-muted">
          {multipleSessions
            ? "Podrás agregar las sesiones desde el detalle de la actividad."
            : "La actividad tendrá una sola sesión principal."}
        </p>

        <label className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-sm font-medium text-foreground">
            Esta actividad certifica participación
          </span>
          <input
            type="checkbox"
            checked={form.isCertifiable}
            onChange={(e) => update("isCertifiable", e.target.checked)}
            className="h-5 w-5 accent-[#007AFF]"
          />
        </label>

        {form.isCertifiable && (
          <Input
            label="Asistencia mínima para certificar (%)"
            type="number"
            min={1}
            max={100}
            value={form.minAttendancePercentage}
            onChange={(e) => update("minAttendancePercentage", e.target.value)}
          />
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
        <Button type="submit" fullWidth>
          Crear actividad
        </Button>
      </div>
    </form>
  );
}
