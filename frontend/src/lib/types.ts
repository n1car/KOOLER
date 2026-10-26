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

export interface ReviewItem {
  id: number;
  rating: number;
  comment: string | null;
  date: string;
  author: string;
}

export interface ReviewSummary {
  average: number;
  total: number;
  items: ReviewItem[];
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
  eligible: boolean;
  reason?:
    | "ACTIVITY_NOT_FINISHED"
    | "ACTIVITY_NOT_CERTIFIABLE"
    | "NO_SESSIONS"
    | "BELOW_MINIMUM";
}

export interface AttendanceRecord {
  studentId: number;
  firstName: string;
  lastName: string;
  status: AttendanceStatus;
  registrationDate: string;
}
