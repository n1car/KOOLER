"use client";

import { usePathname } from "next/navigation";
import { StudentShell } from "@/components/AppShell";
import { RequireRole } from "@/components/RequireRole";

const BANNER_ROUTES = ["/home", "/my-enrollments", "/progress", "/history"];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <RequireRole role="ESTUDIANTE">
      <StudentShell
        bannerSrc={BANNER_ROUTES.includes(pathname) ? "/images/Banner.png" : undefined}
      >
        {children}
      </StudentShell>
    </RequireRole>
  );
}
