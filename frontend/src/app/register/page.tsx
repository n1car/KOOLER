"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Select, cn } from "@/components/ui";
import type { RoleName } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleName: "ESTUDIANTE" as RoleName,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push("/account-created");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-surface">
      <div className="flex flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Crear cuenta</h1>
          <p className="text-sm text-muted">
            Regístrate con tu correo institucional.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombres"
            placeholder="Nombres completos"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
          />
          <Input
            label="Apellidos"
            placeholder="Apellidos completos"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
          />
          <Input
            label="Correo institucional"
            type="email"
            placeholder="usuario@icesi.edu.co"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            minLength={6}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
          <Select
            label="Rol"
            value={form.roleName}
            onChange={(e) => update("roleName", e.target.value as RoleName)}
          >
            <option value="ESTUDIANTE">Estudiante</option>
            <option value="ORGANIZADOR">Organizador</option>
          </Select>

          <Button type="submit" fullWidth>
            Registrarse
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className={cn("font-semibold text-primary")}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
