"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth";

export default function AccountCreatedPage() {
  const { user } = useAuth();
  const nextHref =
    user?.role === "ORGANIZADOR" ? "/organizer/activities" : "/home";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#F0F1F5]">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#35c7b8] text-white">
            <CheckIcon width={44} height={44} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cuenta creada</h1>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Ya puedes empezar a participar en Kooler.
            </p>
          </div>
        </div>
        <Link
          href={nextHref}
          className="mt-2 flex w-full items-center justify-center rounded-full bg-[#242633] px-5 py-4 text-[15px] font-semibold text-white active:opacity-90"
        >
          Continuar
        </Link>
      </div>
    </div>
  );
}
