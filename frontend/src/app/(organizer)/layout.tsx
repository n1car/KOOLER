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

  return (
    <RequireRole role="ORGANIZADOR">
      <OrganizerShell
        bannerSrc={
          BANNER_ROUTES.includes(pathname) ? "/images/Banner.png" : undefined
        }
        hideHeader={isFeedbackPage}
        hideNav={isFeedbackPage}
        fullBleed={isFeedbackPage}
      >
        {children}
      </OrganizerShell>
    </RequireRole>
  );
}
