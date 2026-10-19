"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentShell } from "@/components/AppShell";
import { Alert, Stars } from "@/components/ui";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  MapPinIcon,
  StarIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/icons";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { activityTypeColor } from "@/lib/category";
import { findActivity, mockActivityReviews } from "@/lib/mock";

const ALREADY_ENROLLED = new Set([1, 3, 5]);

export default function ActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const activity = findActivity(id);
  const reviews = mockActivityReviews[id]?.items ?? [];
  const [enrolled, setEnrolled] = useState(() => ALREADY_ENROLLED.has(id));
  const [spots, setSpots] = useState(activity?.availableSpots ?? 0);
  const [notice, setNotice] = useState("");
  const [showComments, setShowComments] = useState(false);

  if (!activity) {
    return (
      <StudentShell hideHeader hideNav fullBleed>
        <div className="px-5 py-5">
          <Alert>Actividad no encontrada.</Alert>
        </div>
      </StudentShell>
    );
  }

  function handleEnroll() {
    if (!activity) return;
    setEnrolled(true);
    setSpots((value) => Math.max(0, value - 1));
    setNotice("¡Inscripción realizada exitosamente!");
  }

  return (
    <StudentShell hideHeader hideNav fullBleed>
      <div
        className="relative flex min-h-56 flex-col gap-4 overflow-hidden px-5 pb-10 pt-6 lg:min-h-72 lg:px-8"
        style={{ backgroundColor: activityTypeColor(activity.activityType?.name) }}
      >
        {activity.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activity.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-10"
          />
        )}

        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
          className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-white active:bg-white/20"
        >
          <ChevronLeftIcon />
        </button>

        <div className="relative z-10 flex flex-col gap-1">
          {activity.activityType && (
            <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              {activity.activityType.name}
            </span>
          )}
          <h1 className="text-2xl font-bold text-white">{activity.name}</h1>
          <p className="pt-1 text-sm text-white/80">
            {activity.organizer.firstName} {activity.organizer.lastName}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5 pb-10 pt-6 lg:mx-auto lg:w-full lg:max-w-3xl lg:px-8 lg:py-10">
        {notice && <Alert tone="success">{notice}</Alert>}

        <p className="text-sm leading-relaxed text-[#475569]">
          {activity.description}
        </p>

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

        {activity.isCertifiable && (
          <div className="flex gap-3 rounded-card border border-[#F2E3A7] bg-[#FFFBEB] p-4">
            <TrophyIcon
              width={22}
              height={22}
              className="shrink-0 text-[#FE9A00]"
            />
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-[#92400E]">
                Certificación de participación
              </h2>
              <p className="text-sm text-[#B45309]">
                Esta actividad cuenta para tu certificación. Completar tu
                asistencia sumará esta actividad a tu progreso.
              </p>
            </div>
          </div>
        )}

        {activity.status === "ACTIVE" && (
          <div className="my-4">
            {enrolled ? (
              <button
                type="button"
                disabled
                className="w-full rounded-full border border-[#8FE0B8] bg-[#CAFFE6] px-5 py-3 text-[15px] font-semibold text-[#065F46]"
              >
                Ya estás inscrito en esta actividad
              </button>
            ) : spots <= 0 ? (
              <button
                type="button"
                disabled
                className="w-full rounded-full border border-[#EDA9A9] bg-[#FFEBEB] px-5 py-3 text-[15px] font-semibold text-[#991B1B]"
              >
                Agotado / Sin cupos
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnroll}
                className="w-full rounded-full bg-black px-5 py-3 text-[15px] font-semibold text-white active:opacity-90"
              >
                Inscribirse
              </button>
            )}
          </div>
        )}

        {reviews.length > 0 && (
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
                  {reviews.length}
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
                    {mockActivityReviews[id]?.average}
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
                {reviews.map((review) => (
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
  );
}
