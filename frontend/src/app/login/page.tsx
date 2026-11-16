"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, cn } from "@/components/ui";
import { AuthHero } from "@/components/AuthHero";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace(
        user.role === "ORGANIZADOR" ? "/organizer/activities" : "/home",
      );
    }
  }, [loading, user, router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const logged = await login(email.trim(), password);
      router.replace(
        logged.role === "ORGANIZADOR" ? "/organizer/activities" : "/home",
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#F0F1F5]">
      <AuthHero />
      <div className="flex flex-1 flex-col gap-7 px-6 pb-10 pt-9">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Bienvenido</h1>
          <p className="text-sm text-muted">Ingresa a tu cuenta institucional.</p>
        </header>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <Alert>{error}</Alert>}

          <Input
            label="Correo institucional"
            type="email"
            placeholder="usuario@icesi.edu.co"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth loading={submitting} className="mt-1 rounded-full py-4">
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className={cn("font-semibold text-primary")}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
