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

---

## Registro de uso de IA — Entrega D2 (Funcionalidad 1: Actividades e Inscripciones)
- **Integrante:** Nico (Persona N)
- **Herramienta:** Google Antigravity / Gemini 3.8
- **Tarea:** Desarrollo del módulo completo de actividades e inscripciones (`EnrollmentEntity`, CRUD de actividades, control de concurrencia y cupos, pruebas unitarias).
- **Propósito:** Implementar la Funcionalidad 1 de punta a punta en el backend cumpliendo con las 4 reglas de negocio de la base de datos (capacidad, duplicados, fecha límite y propiedad del organizador).
- **Descripción de la consulta o prompt:** "Desarrollar la funcionalidad de la Persona N: actividades e inscripciones con validación de cupos, cancelaciones y lista de inscritos para el organizador...".
- **Resultado utilizado:**
  - Entidad `EnrollmentEntity` con restricción única compuesta (`@Unique(['user', 'activity'])`).
  - DTOs (`CreateActivityDto`, `UpdateActivityDto`, `FilterActivitiesDto`) con validadores estrictos.
  - `ActivitiesService` con lógica de cálculo dinámico de `availableSpots` y validaciones de seguridad.
  - `ActivitiesController` con protección por `RolesGuard` y decoradores `@Roles('ORGANIZADOR')` y `@Roles('ESTUDIANTE')`.
  - Suite de 6 pruebas unitarias automáticas en Vitest cubriendo todos los casos límite y excepciones.
- **Cambios realizados por el equipo:**
  - Ajuste de relaciones foráneas en cascada y formato de fecha límite (`registrationDeadline`).
  - Revisión del cálculo de cupos para evitar números negativos (`Math.max(0, capacity - count)`).
- **Forma de verificación:**
  - Ejecución de `npm run build` (compilación TypeScript limpia con 0 errores).
  - Ejecución de `npm test` pasando el 100% de las 9 pruebas unitarias automatizadas.
