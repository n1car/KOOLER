"use client";

import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-dark text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="flex h-40 w-40 items-center justify-center rounded-full bg-dark-surface shadow-inner">
            <KoolerMark />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">KOOLER</h1>
            <p className="mt-3 max-w-xs text-[15px] text-white/70">
              Descubre, participa y certifica las actividades de bienestar de tu
              universidad.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-2">
          <Link
            href="/register"
            className="flex w-full items-center justify-center rounded-input bg-primary px-5 py-4 text-[15px] font-semibold text-white active:bg-blue-600"
          >
            Registrarse
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-input border border-white/25 px-5 py-4 text-[15px] font-semibold text-white active:bg-white/10"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

function KoolerMark() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
      <circle cx="36" cy="36" r="30" stroke="#007AFF" strokeWidth="3" />
      <path
        d="M26 20v32M26 36l16-16M26 36l18 16"
        stroke="#007AFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
