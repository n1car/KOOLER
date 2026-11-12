import type {
  Activity,
  ActivityEnrollments,
  ActivityStatus,
  ActivityType,
  AttendanceStatus,
  AuthUser,
  Certificate,
  CreatedReview,
  Eligibility,
  EnrollmentSummary,
  HistoryItem,
  Location,
  RecordedAttendance,
  ReviewSummary,
  RoleName,
  Session,
  SessionAttendance,
} from "./types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

export const AUTH_TOKEN_KEY = "kooler.accessToken";
export const AUTH_USER_KEY = "kooler.user";

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface AuthResponse {
  message: string;
  user: AuthUser;
  accessToken: string;
}

interface RawUser extends Omit<AuthUser, "role"> {
  role: RoleName | { name: RoleName };
}

function normalizeUser(user: RawUser): AuthUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: typeof user.role === "string" ? user.role : user.role.name,
  };
}

function extractMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const message = (payload as { message?: unknown }).message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) {
    const parts = message.filter((item): item is string => typeof item === "string");
    return parts.length > 0 ? parts.join(" ") : null;
  }
  return null;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function storeSession(user: AuthUser, token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que el backend esté encendido.",
      0,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredSession();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("kooler:unauthorized"));
      }
    }
    throw new ApiError(
      extractMessage(payload) ?? "Ocurrió un error inesperado.",
      response.status,
      payload,
    );
  }

  return payload as T;
}

async function requestBlob(
  path: string,
): Promise<{ blob: Blob; fileName: string | null }> {
  const headers: Record<string, string> = { Accept: "application/pdf" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { headers });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que el backend esté encendido.",
      0,
    );
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);
    if (response.status === 401) {
      clearStoredSession();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("kooler:unauthorized"));
      }
    }
    throw new ApiError(
      extractMessage(payload) ?? "No se pudo descargar el archivo.",
      response.status,
      payload,
    );
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  const match = /filename="?([^"]+)"?/i.exec(disposition);
  return { blob: await response.blob(), fileName: match?.[1] ?? null };
}

async function downloadFile(path: string): Promise<void> {
  const { blob, fileName } = await requestBlob(path);
  if (typeof window === "undefined") return;
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName ?? "certificado.pdf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleName?: RoleName;
}

export interface ActivityFilters {
  status?: ActivityStatus;
  search?: string;
  activityTypeId?: number;
}

export interface CreateActivityPayload {
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  registrationDeadline: string;
  isCertifiable?: boolean;
  minAttendancePercentage?: number;
  imageUrl?: string;
  activityTypeId?: number;
  locationId?: number;
}

export type UpdateActivityPayload = Partial<CreateActivityPayload> & {
  status?: ActivityStatus;
};

export interface CreateSessionPayload {
  sessionDate: string;
  startTime?: string;
  endTime?: string;
}

export interface CreateReviewPayload {
  activityId: number;
  rating: number;
  comment?: string;
}

export interface RecordAttendancePayload {
  studentId: number;
  status: AttendanceStatus;
}

export interface EnrollResponse {
  message: string;
  enrollmentId: number;
  activityId: number;
  activityName: string;
  enrollmentDate: string;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      }),
    register: (payload: RegisterPayload) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: payload,
      }),
    profile: async () => {
      const response = await request<{ message: string; user: RawUser }>(
        "/auth/profile",
      );
      return { ...response, user: normalizeUser(response.user) };
    },
  },
  activities: {
    list: (filters: ActivityFilters = {}) =>
      request<Activity[]>(
        `/activities${query({
          status: filters.status,
          search: filters.search,
          activityTypeId: filters.activityTypeId,
        })}`,
      ),
    get: (id: number) => request<Activity>(`/activities/${id}`),
    myEnrollments: () =>
      request<EnrollmentSummary[]>("/activities/my-enrollments"),
    enroll: (id: number) =>
      request<EnrollResponse>(`/activities/${id}/enroll`, { method: "POST" }),
    create: (payload: CreateActivityPayload) =>
      request<Activity>("/activities", { method: "POST", body: payload }),
    update: (id: number, payload: UpdateActivityPayload) =>
      request<Activity>(`/activities/${id}`, { method: "PATCH", body: payload }),
    deletePermanently: (id: number) =>
      request<{ id: number; message: string }>(
        `/activities/${id}/permanent`,
        { method: "DELETE" },
      ),
    enrollments: (id: number) =>
      request<ActivityEnrollments>(`/activities/${id}/enrollments`),
    sessions: (id: number) => request<Session[]>(`/activities/${id}/sessions`),
    createSession: (id: number, payload: CreateSessionPayload) =>
      request<Session>(`/activities/${id}/sessions`, {
        method: "POST",
        body: payload,
      }),
  },
  catalog: {
    activityTypes: () => request<ActivityType[]>("/activity-types"),
    locations: () => request<Location[]>("/locations"),
  },
  history: {
    list: () => request<HistoryItem[]>("/history"),
  },
  reviews: {
    byActivity: (activityId: number) =>
      request<ReviewSummary>(`/reviews/activity/${activityId}`),
    create: (payload: CreateReviewPayload) =>
      request<CreatedReview>("/reviews", {
        method: "POST",
        body: payload,
      }),
    organizer: (activityId: number) =>
      request<ReviewSummary>(`/reviews/organizer/activity/${activityId}`),
  },
  attendance: {
    get: (activityId: number, sessionId: number) =>
      request<SessionAttendance>(
        `/activities/${activityId}/sessions/${sessionId}/attendance`,
      ),
    record: (
      activityId: number,
      sessionId: number,
      payload: RecordAttendancePayload,
    ) =>
      request<RecordedAttendance>(
        `/activities/${activityId}/sessions/${sessionId}/attendance`,
        { method: "POST", body: payload },
      ),
  },
  certificates: {
    list: () => request<Certificate[]>("/certificates"),
    eligibility: (activityId: number) =>
      request<Eligibility>(`/certificates/activities/${activityId}/eligibility`),
    download: (certificateId: number) =>
      downloadFile(`/certificates/${certificateId}/download`),
  },
};
