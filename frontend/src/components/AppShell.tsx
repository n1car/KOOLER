"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { mockOrganizer, mockStudent } from "@/lib/mock";
import type { AuthUser } from "@/lib/types";
import { Avatar, cn } from "./ui";
import {
  BookmarkIcon,
  ChartIcon,
  ChevronLeftIcon,
  HistoryIcon,
  HomeIcon,
  LogoutIcon,
  PlusIcon,
} from "./icons";

function useCloseOnRoute(pathname: string) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  return [open, setOpen] as const;
}

function roleLabel(user: AuthUser) {
  return user.role === "ORGANIZADOR" ? "Organizador" : "Estudiante";
}

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<{ width?: number; height?: number }>;
};

function ProfileMenu({
  pathname,
  children,
  className,
}: {
  pathname: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useCloseOnRoute(pathname);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [setOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Perfil"
        className={className}
      >
        {children}
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-30 w-44 overflow-hidden rounded-card border border-border bg-white shadow-lg">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-danger active:bg-surface-2"
          >
            <LogoutIcon width={18} height={18} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

function ShellHeader({
  user,
  overlay = false,
  className,
}: {
  user: AuthUser;
  overlay?: boolean;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "z-20 flex items-center px-5",
        overlay
          ? "absolute inset-0"
          : "sticky top-0 border-b border-border bg-white/95 py-3 backdrop-blur",
        className,
      )}
    >
      <ProfileMenu
        pathname={pathname}
        className="flex items-center gap-3 rounded-input py-1 pr-3 text-left active:opacity-90"
      >
        <Avatar firstName={user.firstName} lastName={user.lastName} />
        <div className="leading-tight">
          <p
            className={cn(
              "font-semibold",
              overlay ? "text-3xl text-white" : "text-[15px] text-foreground",
            )}
          >
            {`${user.firstName} ${user.lastName}`}
          </p>
          <p className={cn(overlay ? "text-base text-white/45" : "text-xs text-muted")}>
            {roleLabel(user)}
          </p>
        </div>
      </ProfileMenu>
    </header>
  );
}

function DesktopNav({
  user,
  items,
  pathname,
  exact = false,
  overlay = false,
}: {
  user: AuthUser;
  items: NavItem[];
  pathname: string;
  exact?: boolean;
  overlay?: boolean;
}) {
  return (
    <header
      className={cn(
        "z-30 hidden items-center justify-between gap-6 lg:flex",
        overlay
          ? "absolute inset-x-6 top-4 rounded-full border border-[#E2E8F0] bg-white/95 px-5 py-2 shadow-[0_10px_25px_rgba(15,23,42,0.18)] backdrop-blur xl:inset-x-10"
          : "sticky top-0 border-b border-[#E2E8F0] bg-white/95 px-8 py-2.5 backdrop-blur",
      )}
    >
      <ProfileMenu
        pathname={pathname}
        className="flex items-center gap-3 rounded-input py-1 pr-3 text-left active:opacity-90"
      >
        <Avatar firstName={user.firstName} lastName={user.lastName} />
        <div className="leading-tight">
          <p className="text-[15px] font-semibold text-foreground">
            {`${user.firstName} ${user.lastName}`}
          </p>
          <p className="text-xs text-muted">{roleLabel(user)}</p>
        </div>
      </ProfileMenu>
      <nav className="flex items-center gap-1">
        {items.map(({ href, label, Icon }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-black text-white"
                  : "text-[#90A1B9] hover:bg-black/5 hover:text-foreground",
              )}
            >
              <Icon width={18} height={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function AppContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#F0F1F5] lg:max-w-none">
      {children}
    </div>
  );
}

const studentNav: NavItem[] = [
  { href: "/home", label: "Inicio", Icon: HomeIcon },
  { href: "/my-enrollments", label: "Inscripciones", Icon: BookmarkIcon },
  { href: "/progress", label: "Progreso", Icon: ChartIcon },
  { href: "/history", label: "Historial", Icon: HistoryIcon },
];

export function StudentShell({
  children,
  bannerSrc,
  hideHeader = false,
  hideNav = false,
  fullBleed = false,
}: {
  children: ReactNode;
  bannerSrc?: string;
  hideHeader?: boolean;
  hideNav?: boolean;
  fullBleed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <AppContainer>
      {hideHeader ? null : bannerSrc ? (
        <div className="relative h-40 w-full shrink-0 overflow-hidden lg:h-auto">
          <Image
            src={bannerSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-left-bottom lg:hidden"
          />
          <Image
            src="/images/bannerPC.png"
            alt=""
            width={5757}
            height={1185}
            priority
            unoptimized
            className="hidden h-auto w-full lg:block"
          />
          <ShellHeader user={mockStudent} overlay className="lg:hidden" />
          {hideNav ? null : (
            <DesktopNav
              user={mockStudent}
              items={studentNav}
              pathname={pathname}
              overlay
            />
          )}
        </div>
      ) : (
        <>
          <ShellHeader user={mockStudent} className="lg:hidden" />
          {hideNav ? null : (
            <DesktopNav
              user={mockStudent}
              items={studentNav}
              pathname={pathname}
            />
          )}
        </>
      )}
      <main
        className={cn(
          "flex flex-1 flex-col gap-4 lg:gap-6",
          fullBleed
            ? ""
            : cn(
                "px-5 py-5 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-8 lg:py-8",
                !hideNav && "pb-28 lg:pb-12",
              ),
        )}
      >
        {children}
      </main>
      {hideNav ? null : (
        <nav className="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#E2E8F0] bg-white px-3 py-2.5 shadow-[0_10px_25px_rgba(15,23,42,0.18)] lg:hidden">
          {studentNav.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                  active
                    ? "bg-black text-white"
                    : "text-[#90A1B9] hover:bg-black hover:text-white",
                )}
              >
                <Icon />
              </Link>
            );
          })}
        </nav>
      )}
    </AppContainer>
  );
}

const organizerNav: NavItem[] = [
  { href: "/organizer/activities", label: "Mis actividades", Icon: ChartIcon },
  { href: "/organizer/activities/new", label: "Crear", Icon: PlusIcon },
];

export function OrganizerShell({
  children,
  bannerSrc,
  hideHeader = false,
  hideNav = false,
  fullBleed = false,
}: {
  children: ReactNode;
  bannerSrc?: string;
  hideHeader?: boolean;
  hideNav?: boolean;
  fullBleed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <AppContainer>
      {hideHeader ? null : bannerSrc ? (
        <div className="relative h-40 w-full shrink-0 overflow-hidden lg:h-auto">
          <Image
            src={bannerSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-left-bottom lg:hidden"
          />
          <Image
            src="/images/bannerPC.png"
            alt=""
            width={5757}
            height={1185}
            priority
            unoptimized
            className="hidden h-auto w-full lg:block"
          />
          <ShellHeader user={mockOrganizer} overlay className="lg:hidden" />
          {hideNav ? null : (
            <DesktopNav
              user={mockOrganizer}
              items={organizerNav}
              pathname={pathname}
              exact
              overlay
            />
          )}
        </div>
      ) : (
        <>
          <ShellHeader user={mockOrganizer} className="lg:hidden" />
          {hideNav ? null : (
            <DesktopNav
              user={mockOrganizer}
              items={organizerNav}
              pathname={pathname}
              exact
            />
          )}
        </>
      )}
      <main
        className={cn(
          "flex flex-1 flex-col gap-4 lg:gap-6",
          fullBleed
            ? ""
            : cn(
                "px-5 py-5 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-8 lg:py-8",
                !hideNav && "pb-28 lg:pb-12",
              ),
        )}
      >
        {children}
      </main>
      {hideNav ? null : (
        <nav className="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#E2E8F0] bg-white px-3 py-2.5 shadow-[0_10px_25px_rgba(15,23,42,0.18)] lg:hidden">
          {organizerNav.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                  active
                    ? "bg-black text-white"
                    : "text-[#90A1B9] hover:bg-black hover:text-white",
                )}
              >
                <Icon />
              </Link>
            );
          })}
        </nav>
      )}
    </AppContainer>
  );
}

export function BackHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Volver"
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground active:bg-surface-2"
      >
        <ChevronLeftIcon />
      </button>
      <h1 className="text-lg font-bold text-foreground">{title}</h1>
    </div>
  );
}
