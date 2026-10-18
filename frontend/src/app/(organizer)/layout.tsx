"use client";

import { OrganizerShell } from "@/components/AppShell";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrganizerShell>{children}</OrganizerShell>;
}
