import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeftIcon } from "./icons";

type AuthVariant = "login" | "register";

const AUTH_IMAGES: Record<AuthVariant, { mobile: string; desktop: string }> = {
  login: {
    mobile: "/images/Login mobile.png",
    desktop: "/images/Login pc.png",
  },
  register: {
    mobile: "/images/Registro mobile.png",
    desktop: "/images/Registro pc.png",
  },
};

export function AuthLayout({
  variant,
  children,
}: {
  variant: AuthVariant;
  children: ReactNode;
}) {
  const images = AUTH_IMAGES[variant];

  return (
    <div className="flex min-h-dvh flex-col bg-[#F0F1F5] lg:grid lg:grid-cols-2">
      <aside className="relative h-[258px] shrink-0 overflow-hidden bg-[#24206f] text-white lg:h-auto lg:min-h-dvh">
        <Image
          src={images.mobile}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center lg:hidden"
        />
        <Image
          src={images.desktop}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="hidden object-cover object-left lg:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#211d68]/20 via-transparent to-[#211d68]/20 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#211d68]/15"
        />
        <Link
          href="/"
          className="absolute left-5 top-7 z-10 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-sm font-medium text-white lg:hidden"
        >
          <ChevronLeftIcon width={19} height={19} />
          Volver
        </Link>
      </aside>

      <div className="flex flex-1 flex-col lg:min-h-dvh lg:justify-center lg:px-12 lg:py-12">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-7 px-6 pb-10 pt-9 lg:flex-none lg:px-0 lg:py-0">
          <Link
            href="/"
            className="hidden items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground lg:inline-flex"
          >
            <ChevronLeftIcon width={18} height={18} />
            Volver
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
