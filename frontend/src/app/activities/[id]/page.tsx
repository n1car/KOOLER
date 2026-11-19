"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentShell } from "@/components/AppShell";
import { RequireRole } from "@/components/RequireRole";
import {
  Alert,
  Badge,
  ErrorState,
  LoadingState,
  Stars,
  StatusBadge,
} from "@/components/ui";
import {
  ChevronDownIcon,
  MapPinIcon,
  StarIcon,
  UsersIcon,
} from "@/components/icons";
import { ActivityHero } from "@/components/activities/ActivityHero";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { api, ApiError } from "@/lib/api";
import { getEnrollmentAction } from "@/lib/enrollment";
import type { EnrollmentActionKind } from "@/lib/enrollment";
import { CertificateAccessSection } from "./CertificateAccessSection";
import type {
  Activity,
  Certificate,
  Eligibility,
  ReviewSummary,
  Session,
} from "@/lib/types";

const actionStyles: Record<EnrollmentActionKind, string> = {
  enroll: "bg-primary text-white hover:bg-[#171923] active:bg-[#171923] disabled:opacity-60",
  enrolled: "border border-[#8FE0B8] bg-[#CAFFE6] text-[#065F46]",
  full: "border border-[#EDA9A9] bg-[#FFEBEB] text-[#991B1B]",
  finished: "border border-[#E2E8F0] bg-surface-2 text-muted",
  cancelled: "border border-[#EDA9A9] bg-[#FFEBEB] text-[#991B1B]",
  deadline: "border border-[#E2E8F0] bg-surface-2 text-muted",
};

export default function ActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [activity, setActivity] = useState<Activity | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<ReviewSummary | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [notice, setNotice] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [certificateId, setCertificateId] = useState<number | null>(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  const [certificateDownloading, setCertificateDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const downloadLock = useRef(false);

  const loadCertificateProgress = useCallback(async (activityId: number) => {
    setCertificateLoading(true);
    setCertificateError("");
    setEligibility(null);
    setCertificateId(null);
    setDownloadMessage(null);

    try {
      const result = await api.certificates.eligibility(activityId);
      setEligibility(result);
      if (result.eligible) {
        const certificates = await api.certificates.list().catch((err: unknown) => {
          if (err instanceof ApiError && err.status === 404) return [];
          throw err;
        });
        const certificate = certificates.find(
          (item: Certificate) => item.activityId === activityId,
        );
        setCertificateId(certificate?.id ?? null);
      }
    } catch (err) {
      setCertificateError(
        err instanceof ApiError
          ? err.message
          : "No se pudo consultar la elegibilidad del certificado.",
      );
    } finally {
      setCertificateLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) {
      setError("Actividad no encontrada.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [detail, sessionList, reviewSummary, enrollments] = await Promise.all([
        api.activities.get(id),
        api.activities.sessions(id),
        api.reviews.byActivity(id),
        api.activities.myEnrollments(),
      ]);
      setActivity(detail);
      setSessions(sessionList);
      setReviews(reviewSummary);
      const isEnrolled = enrollments.some((item) => item.activity.id === id);
      setEnrolled(isEnrolled);
      if (isEnrolled && detail.isCertifiable) {
        await loadCertificateProgress(id);
      } else {
        setEligibility(null);
        setCertificateId(null);
        setCertificateLoading(false);
        setCertificateError("");
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo cargar la actividad.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, loadCertificateProgress]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleEnroll() {
    if (!activity || enrolling) return;
    setEnrolling(true);
    setEnrollError("");
    setNotice("");
    try {
      await api.activities.enroll(id);
      setEnrolled(true);
      setActivity((prev) =>
        prev
          ? {
              ...prev,
              enrolledCount: (prev.enrolledCount ?? 0) + 1,
              availableSpots: Math.max(0, (prev.availableSpots ?? 0) - 1),
            }
          : prev,
      );
      if (activity.isCertifiable) {
        void loadCertificateProgress(id);
      }
      setNotice("¡Inscripción realizada exitosamente!");
    } catch (err) {
      setEnrollError(
        err instanceof ApiError
          ? err.message
          : "No se pudo completar la inscripción.",
      );
    } finally {
      setEnrolling(false);
    }
  }

  async function downloadCertificate() {
    if (certificateId === null || downloadLock.current) return;
    downloadLock.current = true;
    setCertificateDownloading(true);
    setDownloadMessage(null);
    try {
      await api.certificates.download(certificateId);
      setDownloadMessage({
        tone: "success",
        text: "La descarga del certificado comenzó.",
      });
    } catch (err) {
      setDownloadMessage({
        tone: "error",
        text:
          err instanceof ApiError
            ? err.message
            : "No se pudo descargar el certificado.",
      });
    } finally {
      downloadLock.current = false;
      setCertificateDownloading(false);
    }
  }

  if (loading) {
    return (
      <RequireRole role="ESTUDIANTE">
        <StudentShell hideHeader hideNav fullBleed>
          <div className="px-5 py-8">
            <LoadingState label="Cargando actividad..." />
          </div>
        </StudentShell>
      </RequireRole>
    );
  }

  if (error || !activity) {
    return (
      <RequireRole role="ESTUDIANTE">
        <StudentShell hideHeader hideNav fullBleed>
          <div className="px-5 py-8">
            <ErrorState message={error || "Actividad no encontrada."} onRetry={load} />
          </div>
        </StudentShell>
      </RequireRole>
    );
  }

  const spots = activity.availableSpots ?? 0;
  const enrollmentAction = getEnrollmentAction(activity, enrolled);
  const reviewItems = reviews?.items ?? [];
  const canIssueCertificate = activity.isCertifiable;

  return (
    <RequireRole role="ESTUDIANTE">
      <StudentShell hideHeader hideNav fullBleed>
        <ActivityHero activity={activity} onBack={() => router.back()} />

        <div className="flex flex-col gap-6 px-5 pb-10 pt-6 lg:mx-auto lg:w-full lg:max-w-3xl lg:px-8 lg:py-10">
          {notice && <Alert tone="success">{notice}</Alert>}
          {enrollError && <Alert>{enrollError}</Alert>}

          <p className="text-sm leading-relaxed text-[#475569]">
            {activity.description}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={activity.status} />
            {enrolled && <Badge tone="success">Inscrito</Badge>}
            {canIssueCertificate && <Badge tone="primary">Certificable</Badge>}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              {formatDateLong(activity.date)} ·{" "}
              {formatTimeRange(activity.startTime, activity.endTime)}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPinIcon
                width={16}
                height={16}
                className="shrink-0 text-[#475569]"
              />
              <span>{activity.location?.name ?? "Sin ubicación"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <UsersIcon
                width={16}
                height={16}
                className="shrink-0 text-[#475569]"
              />
              <span>
                {spots} de {activity.capacity} cupos disponibles
              </span>
            </div>
          </div>

          {sessions.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-foreground">Sesiones</h2>
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
            </div>
          )}

          <div className="my-4 flex">
            {enrollmentAction.kind === "enroll" ? (
              <button
                type="button"
                onClick={handleEnroll}
                disabled={enrolling}
                className={`w-full rounded-input px-5 py-3 text-sm font-semibold sm:w-auto sm:px-8 ${actionStyles.enroll}`}
              >
                {enrolling ? "Inscribiendo..." : enrollmentAction.label}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className={`w-full rounded-input px-5 py-3 text-sm font-semibold sm:w-auto sm:px-8 ${actionStyles[enrollmentAction.kind]}`}
              >
                {enrollmentAction.label}
              </button>
            )}
          </div>

          {enrolled && canIssueCertificate && (
            <CertificateAccessSection
              enrolled={enrolled}
              certifiable={activity.isCertifiable}
              loading={certificateLoading}
              error={certificateError}
              eligibility={eligibility}
              certificateAvailable={certificateId !== null}
              downloading={certificateDownloading}
              downloadMessage={downloadMessage}
              onRetry={() => void loadCertificateProgress(id)}
              onDownload={() => void downloadCertificate()}
            />
          )}

          {reviewItems.length > 0 && reviews && (
            <div className="flex flex-col gap-3 border-t border-[#E2E8F0] pt-5">
              <button
                type="button"
                onClick={() => setShowComments((value) => !value)}
                aria-expanded={showComments}
                className="flex items-center justify-between gap-2 text-left"
              >
                <span className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">
                    Comentarios
                  </h2>
                  <span className="text-xs font-medium text-muted">
                    {reviews.total}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <StarIcon
                      width={14}
                      height={14}
                      className="text-[#FE9A00]"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      {reviews.average}
                    </span>
                  </span>
                  <ChevronDownIcon
                    width={18}
                    height={18}
                    className={`shrink-0 text-[#475569] transition-transform ${
                      showComments ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              {showComments && (
                <div className="flex flex-col gap-3">
                  {reviewItems.map((review) => (
                    <div
                      key={review.id}
                      className="flex gap-3 rounded-card border border-[#E2E8F0] bg-white p-4"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-sm font-semibold text-[#4F46E5]">
                        {review.author.charAt(0)}
                      </span>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {review.author}
                          </span>
                          <Stars value={review.rating} readOnly size={13} />
                        </div>
                        <p className="text-xs text-muted">
                          {formatDateLong(review.date)}
                        </p>
                        {review.comment && (
                          <p className="text-sm leading-relaxed text-[#475569]">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </StudentShell>
    </RequireRole>
  );
}
