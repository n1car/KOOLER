"use client";

import Image from "next/image";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-[#242633] text-white lg:block">
      <div className="relative min-h-0 w-full flex-1 overflow-hidden lg:hidden">
        <Image
          src="/images/bienvenida.png"
          alt="Ilustración de bienvenida de Kooler"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 hidden lg:block">
        <Image
          src="/images/BienvenidaPC.png"
          alt="Ilustración de bienvenida de Kooler"
          fill
          sizes="100vw"
          unoptimized
          className="object-cover object-center"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col gap-3 px-6 pb-8 pt-2 lg:absolute lg:top-0 lg:right-[6%] lg:mx-0 lg:h-full lg:w-[40%] lg:max-w-none lg:items-center lg:justify-center lg:gap-6 lg:px-14 lg:py-0 lg:text-center">
        <Image
          src="/images/Logo.png"
          alt="Kooler"
          width={220}
          height={54}
          className="mb-2 hidden h-auto w-44 lg:block lg:w-64"
        />

        <p className="text-center text-[15px] leading-snug text-white/80 lg:max-w-xs lg:text-center lg:text-base">
          Descubre e inscríbete en actividades de bienestar de tu institución
        </p>

        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-full bg-white px-5 py-4 text-[15px] font-semibold text-[#242633] active:opacity-90 lg:w-56 lg:py-3.5"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="flex w-full items-center justify-center rounded-full bg-[#393B47] px-5 py-4 text-[15px] font-semibold text-white active:opacity-90 lg:w-56 lg:py-3.5"
        >
          Registrarse
        </Link>
      </div>
    </div>
  );
}
