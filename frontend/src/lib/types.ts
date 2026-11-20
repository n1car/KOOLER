export type RoleName = "ESTUDIANTE" | "ORGANIZADOR";

export type ActivityStatus = "ACTIVE" | "CANCELLED" | "FINISHED";

export type AttendanceStatus = "PRESENT" | "ABSENT";

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleName;
}

export interface ActivityType {
  id: number;
  name: string;
  requiresEnrollment: boolean;
}

export interface Location {
  id: number;
  name: string;
  building?: string | null;
}

export interface OrganizerSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export interface Activity {
  id: number;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  status: ActivityStatus;
  registrationDeadline: string;
  isCertifiable: boolean;
  minAttendancePercentage: number;
  imageUrl: string | null;
  activityType: ActivityType | null;
  location: Location | null;
  organizer: OrganizerSummary;
  createdAt: string;
  enrolledCount?: number;
  availableSpots?: number;
}

export interface Session {
  id: number;
  activityId?: number;
  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

export interface EnrollmentSummary {
  enrollmentId: number;
  enrollmentDate: string;
  activity: {
    id: number;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    status: ActivityStatus;
    imageUrl: string | null;
    isCertifiable: boolean;
    category: string | null;
    location: string | null;
  };
}

export interface EnrollmentStudent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ActivityEnrollments {
  activityId: number;
  activityName: string;
  totalEnrolled: number;
  capacity: number;
  enrollments: {
    enrollmentId: number;
    enrollmentDate: string;
    student: EnrollmentStudent;
  }[];
}

export interface ReviewItem { // esta interfaz representa un elemento individual de reseña, que incluye el id de la reseña, la calificación, el comentario (si lo hay), la fecha de creación y el autor de la reseña.
  id: number;
  rating: number;
  comment: string | null;
  date: string;
  author: string;
}

export interface ReviewSummary { // esta interfaz representa un resumen de las reseñas de una actividad, incluyendo el promedio de calificaciones, el total de reseñas y una lista de los elementos de reseña individuales.
  average: number;
  total: number;
  items: ReviewItem[];
}
// la diferencia entre reviewsSummary y CreatedReview es que ReviewSummary se utiliza para mostrar un resumen de las reseñas existentes de una actividad, mientras que CreatedReview se utiliza para representar una nueva reseña creada por un usuario.
export interface CreatedReview { // la diferencia entre esta interfaz y ReviewItem es que CreatedReview incluye el id del usuario y de la actividad, mientras que ReviewItem no. Esto es útil para cuando se crea una nueva reseña, ya que necesitamos asociarla con un usuario y una actividad específicos.
  id: number;
  idUser: number;
  idActivity: number;
  rating: number;
  comment: string | null;
  date: string;
}

export interface HistoryItem {
  activityId: number;
  name: string;
  date: string;
  attendance: AttendanceStatus;
  reviewed: boolean;
  myRating: number | null;
}

export interface Certificate {
  id: number;
  studentId: number;
  activityId: number;
  certificateCode: string;
  issueDate: string;
}

export interface Eligibility {
  activityId: number;
  sessionsTotal: number;
  sessionsPresent: number;
  attendancePercentage: number;
  minimumAttendancePercentage: number;
  sessionsPending: number;
  eligible: boolean;
  reason?:
    | "ACTIVITY_NOT_FINISHED"
    | "ACTIVITY_NOT_CERTIFIABLE"
    | "NO_SESSIONS"
    | "SESSIONS_PENDING"
    | "BELOW_MINIMUM";
}

export interface AttendanceRecord {
  studentId: number;
  firstName: string;
  lastName: string;
  status: AttendanceStatus;
  registrationDate: string;
}

export interface SessionAttendance {
  activityId: number;
  sessionId: number;
  attendance: AttendanceRecord[];
}

export interface RecordedAttendance {
  id: number;
  studentId: number;
  activityId: number;
  sessionId: number;
  status: AttendanceStatus;
  registrationDate: string;
}
