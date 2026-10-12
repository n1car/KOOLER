# Registro de Uso de Inteligencia Artificial — Proyecto Kooler

Este documento registra de forma transparente y estructurada el apoyo recibido mediante herramientas de Inteligencia Artificial para el proyecto Kooler, en estricto cumplimiento de las políticas académicas del curso.

---

## Registro de uso de IA — Entrega D2 (Template Base)
- **Integrante:** Nico (Persona N)
- **Herramienta:** Google Antigravity / Gemini 3.8
- **Tarea:** Configuración inicial del proyecto NestJS, Docker Compose con PostgreSQL, TypeORM, arquitectura base, módulo de autenticación (JWT, bcrypt, RolesGuard) y entidades fundamentales.
- **Propósito:** Acelerar el setup del template base para permitir que los integrantes J y S inicien sus funcionalidades en ramas paralelas sin bloqueos, asegurando concordancia con el repositorio de referencia de la clase.
- **Descripción de la consulta o prompt:** "Contexto del proyecto Kooler: necesito ayuda para construir la base (Persona N). Explícame en español sencillo qué hace cada cosa y por qué... Revisa el repositorio de clase y el plan de trabajo".
- **Resultado utilizado:**
  - Estructura modular de NestJS (`users`, `roles`, `auth`, `activities`, `database`).
  - Configuración de `compose.yaml` para PostgreSQL 17 en el puerto 5433 (igual a la clase).
  - `RolesGuard` genérico y decorador `@Roles()`.
  - Módulo de autenticación con hash bcrypt y JWT.
  - `LoggingInterceptor` para trazabilidad y medición de tiempos de respuesta HTTP.
  - Seed inicial para carga automática de roles y usuarios demo.
- **Cambios realizados por el equipo:**
  - Adaptación de nombres de columnas y entidades según el modelo de datos oficial (9 entidades).
  - Configuración de variables de entorno seguras en `.env.example`.
  - Revisión y ajuste de las pruebas unitarias para Vitest.
- **Forma de verificación:**
  - Ejecución de `npm run build` (compilación exitosa en TypeScript sin errores).
  - Ejecución de pruebas unitarias automatizadas (`npm test`) pasando al 100%.
  - Verificación de consistencia del modelo de datos frente al documento aprobado de base de datos.

## Registro de uso de IA — Revisión de asistencia
- **Integrante:** Samuel (Persona S)
- **Herramienta:** GitHub Copilot
- **Tarea:** Orientación técnica y revisión de requisitos y convenciones existentes para `AttendanceEntity`.
- **Propósito:** Revisar el modelo de datos, las relaciones con `UserEntity` y `ActivityEntity`, los estados de asistencia y la unicidad por estudiante y actividad. No se implementó un flujo funcional de asistencia.
- **Forma de verificación:** La compilación quedó pendiente en el primer intento por dependencias locales faltantes. Luego se instalaron sin modificar `package-lock.json`; no se ha ejecutado un nuevo build.
