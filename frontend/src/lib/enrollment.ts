import type { Activity } from "./types";

export type EnrollmentActionKind =
  | "enroll"
  | "enrolled"
  | "full"
  | "finished"
  | "cancelled"
  | "deadline";

export interface EnrollmentAction {
  kind: EnrollmentActionKind;
  label: string;
}

export function getEnrollmentAction(
  activity: Activity,
  enrolled: boolean,
  now: Date = new Date(),
): EnrollmentAction {
  if (activity.status === "CANCELLED") {
    return { kind: "cancelled", label: "Actividad cancelada" };
  }

  if (activity.status === "FINISHED") {
    return { kind: "finished", label: "Actividad finalizada" };
  }

  if (enrolled) {
    return { kind: "enrolled", label: "Ya estás inscrito en esta actividad" };
  }

  const availableSpots =
    activity.availableSpots ??
    Math.max(0, activity.capacity - (activity.enrolledCount ?? 0));

  if (availableSpots <= 0) {
    return { kind: "full", label: "Agotado / Sin cupos" };
  }

  const deadline = new Date(activity.registrationDeadline).getTime();
  if (Number.isFinite(deadline) && now.getTime() > deadline) {
    return { kind: "deadline", label: "Inscripciones cerradas" };
  }

  return { kind: "enroll", label: "Inscribirse" };
}
