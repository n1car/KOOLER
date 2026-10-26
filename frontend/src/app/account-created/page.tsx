"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/icons";

export default function AccountCreatedPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#F0F1F5]">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckIcon width={44} height={44} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cuenta creada</h1>
          <p className="mt-2 max-w-xs text-sm text-muted">
            ¡Bienvenido! Tu cuenta está lista para que empieces a participar.
          </p>
        </div>
      </div>

      <div className="px-6 pb-10">
        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-input bg-primary px-5 py-4 text-[15px] font-semibold text-white active:bg-blue-600"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
