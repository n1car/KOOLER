"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, cn } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    router.push("/home");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-surface">
      <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Bienvenido</h1>
          <p className="text-sm text-muted">Ingresa a tu cuenta institucional.</p>
        </header>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input
            label="Correo institucional"
            type="email"
            placeholder="usuario@icesi.edu.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth>
            Iniciar sesión
          </Button>
        </form>

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className={cn("font-semibold text-primary")}>
              Regístrate
            </Link>
          </p>
          <button
            type="button"
            onClick={() => router.push("/organizer/activities")}
            className="text-xs font-medium text-muted underline underline-offset-2"
          >
            Entrar como organizador demo
          </button>
        </div>
      </div>
    </div>
  );
}
