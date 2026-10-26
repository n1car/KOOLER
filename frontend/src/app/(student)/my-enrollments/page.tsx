"use client";

import Link from "next/link";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/ui";
import { BookmarkIcon } from "@/components/icons";
import { mockActivities, mockEnrolledIds } from "@/lib/mock";

export default function MyEnrollmentsPage() {
  const enrolledActivities = mockActivities.filter((activity) =>
    mockEnrolledIds.has(activity.id),
  );

  if (enrolledActivities.length === 0) {
    return (
      <EmptyState
        icon={<BookmarkIcon width={36} height={36} />}
        title="Aún no tienes inscripciones"
        description="Explora las actividades disponibles y apúntate a las que te interesen."
        action={
          <Link
            href="/home"
            className="rounded-input bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Explorar actividades
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-bold text-foreground lg:text-2xl">
          Mis inscripciones
        </h1>
        <p className="text-sm text-muted">Actividades a las que ya te uniste</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
        {enrolledActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} enrolled />
        ))}
      </div>
    </>
  );
}
