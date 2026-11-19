"use client";

import { usePathname } from "next/navigation";
import { OrganizerShell } from "@/components/AppShell";
import { RequireRole } from "@/components/RequireRole";

const BANNER_ROUTES = ["/organizer/activities", "/organizer/activities/new"];

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFeedbackPage = pathname.endsWith("/feedback");
  const isActivitiesPage = pathname === "/organizer/activities";
  const isCreatePage = pathname === "/organizer/activities/new";

  return (
    <RequireRole role="ORGANIZADOR">
      <OrganizerShell
        bannerSrc={
          BANNER_ROUTES.includes(pathname) ? "/images/Banner.png" : undefined
        }
        bannerTitle={
          isCreatePage
            ? "Crea tu nueva actividad"
            : isActivitiesPage
              ? "Mis actividades"
              : undefined
        }
        bannerSubtitle={
          isCreatePage
            ? "Comparte una nueva experiencia de bienestar."
            : isActivitiesPage
              ? "Organiza y acompaña las actividades de tu comunidad."
              : undefined
        }
        bannerArtSrc={isCreatePage ? "/images/kooler%20azul.png" : undefined}
        bannerBackHref={isCreatePage ? "/organizer/activities" : undefined}
        hideHeader={isFeedbackPage}
        hideNav={isFeedbackPage}
        fullBleed={isFeedbackPage}
      >
        {children}
      </OrganizerShell>
    </RequireRole>
  );
}
