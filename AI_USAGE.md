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
---

## Registro de uso de IA — Entrega D2 (Endurecimiento Persona N: seguridad y reglas)
- **Integrante:** Nico (Persona N)
- **Herramienta:** OpenCode / Muse Spark
- **Tarea:** Auditoría de la parte N contra la rúbrica D2 y corrección de gaps: registro con rol libre, filtros sin enum, `update()` sin tope de cupo, RF09 sin implementar, `enroll()` sin transacción, interceptor sin log de errores, script `test:e2e` roto, e2e de plantilla y `my-enrollments` sin documentar.
- **Propósito:** Dejar el backend de N al 100% defendible en sustentación (RNF07 concurrencia, RF09 finalización automática, autorización real en backend).
- **Descripción de la consulta o prompt:** "Revisa solo mi parte N del backend contra la rúbrica D2 y ajusta lo que falte para que quede lo mejor posible".
- **Resultado utilizado:**
  - `RegisterDto.roleName` con `@IsEnum(['ESTUDIANTE','ORGANIZADOR'])`; `FilterActivitiesDto.status` con `@IsEnum`.
  - `ActivitiesService.update()` bloquea bajar `capacity` por debajo de inscritos; helper `isPastEnd()` + transición `ACTIVE→FINISHED` (RF09) en `findAll`/`findOne`/`enroll`.
  - `enroll()` dentro de `dataSource.transaction()` con `pessimistic_write` sobre la actividad (RNF07).
  - `LoggingInterceptor` con `catchError` (loggea fallos con status y duración).
  - `main.ts`: se quitó `RolesGuard` global (corría antes que `JwtAuthGuard`, dejaba `request.user` vacío y toda ruta protegida devolvía 403; los controllers ya declaran `@UseGuards(JwtAuthGuard, RolesGuard)`).
  - `enroll()` transaccional sin `relations` en el `findOne` con lock (Postgres rechaza `FOR UPDATE` con `LEFT JOIN`: `FOR UPDATE cannot be applied to the nullable side of an outer join`, daba 500).
  - Nuevo `activities.integration.spec.ts` (flujo crear→inscribir→duplicado 400→cupo 400→cupos en 0) + `test/app.e2e-spec.ts` real con prefijo `/api`; fix `test:e2e` a `vitest.config.e2e.mts`; `*.tsbuildinfo` a `.gitignore`; fila `my-enrollments` en `README.md`.
  - Nueva colección `backend/Kooler-D2.postman_collection.json` (11 requests del flujo Persona N).
- **Cambios realizados por el equipo:**
  - Revisión de cada regla contra `docs/Diseño base de datos.md` y `docs/Funcionalidades.md`; se mantuvo el modelo sin `LOCATION`/`ACTIVITY_TYPE` como deuda documentada para no bloquear a J/S.
- **Forma de verificación:**
  - `npm run build` (0 errores), `npm test` (12/12 verde: 8 activities unit + 1 integración + 2 auth + 1 app), `npm run lint` (0 warnings).
  - `npm run test:e2e` (2/2 verde contra Postgres real) + smoke HTTP en vivo: login org/estudiante, crear 201, inscribir 200, duplicado 400, estudiante-creando 403.
