"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { RoleName } from "@/lib/types";
import { Spinner } from "./ui";

export function RequireRole({
  role,
  children,
}: {
  role: RoleName;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const allowed = !loading && user?.role === role;
  const wrongRole = !loading && Boolean(user) && user?.role !== role;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (wrongRole) {
      router.replace(
        user.role === "ORGANIZADOR" ? "/organizer/activities" : "/home",
      );
    }
  }, [loading, user, wrongRole, router]);

  if (loading || !allowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-primary">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <>{children}</>;
}
