import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon } from "./icons";

export function AuthHero() {
  return (
    <header className="relative h-[258px] shrink-0 overflow-hidden bg-[#24206f] text-white">
      <Image
        src="/images/bienvenida.png"
        alt=""
        fill
        priority
        sizes="(max-width: 448px) 100vw, 448px"
        className="object-cover object-[center_44%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#211d68]/20 via-transparent to-[#211d68]/30" />
      <Link
        href="/"
        className="absolute left-5 top-7 z-10 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-sm font-medium text-white"
      >
        <ChevronLeftIcon width={19} height={19} />
        Volver
      </Link>
    </header>
  );
}
