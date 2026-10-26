"use client";

import { usePathname } from "next/navigation";
import { OrganizerShell } from "@/components/AppShell";

const BANNER_ROUTES = ["/organizer/activities", "/organizer/activities/new"];

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <OrganizerShell
      bannerSrc={
        BANNER_ROUTES.includes(pathname) ? "/images/Banner.png" : undefined
      }
    >
      {children}
    </OrganizerShell>
  );
}
