"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { mockOrganizer, mockStudent } from "@/lib/mock";
import type { AuthUser } from "@/lib/types";
import { Avatar, cn } from "./ui";
import {
  ChartIcon,
  ChevronLeftIcon,
  HistoryIcon,
  HomeIcon,
  LogoutIcon,
  TicketIcon,
  UserIcon,
} from "./icons";

function useCloseOnRoute(pathname: string) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  return [open, setOpen] as const;
}

function ProfileMenu({ pathname }: { pathname: string }) {
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
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted active:bg-surface-2"
      >
        <UserIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-44 overflow-hidden rounded-card border border-border bg-white shadow-lg">
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

function ShellHeader({ user }: { user: AuthUser }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-white/95 px-5 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <Avatar firstName={user.firstName} lastName={user.lastName} />
        <div className="leading-tight">
          <p className="text-[15px] font-semibold text-foreground">
            {`${user.firstName} ${user.lastName}`}
          </p>
          <p className="text-xs text-muted">
            {user.role === "ORGANIZADOR" ? "Organizador" : "Estudiante"}
          </p>
        </div>
      </div>
      <ProfileMenu pathname={pathname} />
    </header>
  );
}

export function AppContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white">
      {children}
    </div>
  );
}

const studentNav = [
  { href: "/home", label: "Inicio", Icon: HomeIcon },
  { href: "/my-enrollments", label: "Inscripciones", Icon: TicketIcon },
  { href: "/progress", label: "Progreso", Icon: ChartIcon },
  { href: "/history", label: "Historial", Icon: HistoryIcon },
];

export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AppContainer>
      <ShellHeader user={mockStudent} />
      <main className="flex flex-1 flex-col gap-4 px-5 py-5 pb-28">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-border bg-white/95 backdrop-blur">
        <ul className="flex items-stretch justify-between px-2 py-2">
          {studentNav.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-input py-1.5 text-[11px] font-medium",
                    active ? "text-primary" : "text-muted",
                  )}
                >
                  <Icon />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </AppContainer>
  );
}

export function OrganizerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCreate = pathname.includes("/new");

  return (
    <AppContainer>
      <ShellHeader user={mockOrganizer} />
      <div className="flex items-center gap-2 px-5 pt-4">
        <Link
          href="/organizer/activities"
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            !isCreate ? "bg-primary text-white" : "bg-surface-2 text-muted",
          )}
        >
          Mis actividades
        </Link>
        <Link
          href="/organizer/activities/new"
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            isCreate ? "bg-primary text-white" : "bg-surface-2 text-muted",
          )}
        >
          + Crear
        </Link>
      </div>
      <main className="flex flex-1 flex-col gap-4 px-5 py-5 pb-10">
        {children}
      </main>
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
