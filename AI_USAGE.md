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
- **Orientación de GitHub Copilot:** Análisis de la estructura del módulo, convenciones existentes, validaciones disponibles y estrategia de pruebas para asistencia.
- **Ayuda de GitHub Copilot en la implementación:** Apoyo para crear `AttendanceModule`, `AttendanceService` y sus pruebas unitarias, e integrar el módulo en `AppModule`. No se implementaron endpoints, guards de autorización ni validación de inscripciones.
- **Verificación:** `npm run build` compiló correctamente; las pruebas focalizadas de asistencia pasaron con 8 pruebas y `npm test` pasó con 11 pruebas en 3 archivos. `git diff --check` no reportó errores.

## Registro de uso de IA — Autenticación condicional por roles
- **Integrante:** Samuel (Persona S)
- **Herramienta:** GitHub Copilot
- **Orientación de GitHub Copilot:** Análisis del orden de guards de NestJS 12.1.2 y del uso existente de Passport, `JwtStrategy`, metadata `@Roles` y `RolesGuard`.
- **Ayuda de GitHub Copilot en la implementación:** Orientación para crear `RolesJwtAuthGuard`, registrarlo con `APP_GUARD` en `AppModule` y añadir pruebas HTTP con la estrategia JWT real. No se añadieron endpoints funcionales de asistencia ni se modificó `main.ts`.
- **Verificación:** `npm run build` compiló correctamente; `npm test` pasó con 11 pruebas en 3 archivos; `npx vitest run --config ./vitest.config.e2e.mts test/auth-authorization.e2e-spec.ts` pasó con 5 pruebas.

## Registro de uso de IA — Endpoint de registro de asistencia
- **Integrante:** Samuel (Persona S)
- **Herramienta:** GitHub Copilot
- **Orientación de GitHub Copilot:** Revisión de la estrategia JWT, los guards globales, `@CurrentUser()`, la relación de propietario en `ActivityEntity`, el DTO y los patrones de pruebas existentes.
- **Ayuda de GitHub Copilot en la implementación:** Orientación para crear `POST /api/activities/:activityId/attendance`, validar al organizador propietario y al estudiante inscrito, construir una respuesta explícita sin entidades relacionadas, y ampliar las pruebas unitarias y HTTP E2E. La prueba E2E utiliza la estrategia JWT y los guards reales; los servicios de usuarios/inscripción y los repositorios están simulados. No se implementaron sesiones ni reglas de certificados.
- **Verificación:** `npm test` pasó con 20 pruebas en 5 archivos; las pruebas E2E de asistencia y autorización pasaron con 16 pruebas en 2 archivos; `npm run build` compiló correctamente; `git diff --check` no reportó errores.

## Registro de uso de IA — Asistencia por sesión
- **Integrante:** Samuel (Persona S)
- **Herramienta:** GitHub Copilot
- **Orientación de GitHub Copilot:** Revisión del modelo actual de asistencia, de la incompatibilidad entre la unicidad por actividad y el requisito de sesiones, y del patrón de TypeORM y NestJS del proyecto.
- **Ayuda de GitHub Copilot en la implementación:** Análisis y ajuste para introducir `SessionEntity`, modificar `AttendanceEntity` para relacionarlo con sesión y no con actividad directa, adaptar `AttendanceService` y `AttendanceController` para validar `sessionId` y permitir varias asistencias en diferentes sesiones, y actualizar las pruebas unitarias y E2E para cubrir casos de sesión válida, duplicado por sesión, sesión ajena a la actividad y actividad no finalizada.
- **Verificación:** Se ejecutará `npm test`, `npm run build` y `git diff --check` para confirmar el cambio real antes de cerrar la tarea.

## Registro de uso de IA — Infraestructura de certificados
- **Integrante:** Samuel (Persona S)
- **Herramienta:** GitHub Copilot
- **Orientación de GitHub Copilot:** Revisión de la estructura del backend, del diseño de base de datos para `CERTIFICATE`, de la identidad del usuario autenticado y del patrón `@CurrentUser()` para consultas del estudiante autenticado.
- **Ayuda de GitHub Copilot en la implementación:** Creación de `CertificateEntity`, `CertificatesModule`, `CertificatesService`, `CertificatesController`, restricción única por estudiante y actividad, código único y endpoint seguro `GET /api/certificates` para consultar los propios certificados sin aceptar IDs arbitrarios del cliente. Se dejó explícito que la emisión automática de certificados y el porcentaje de elegibilidad siguen pendientes de decisión de negocio.
- **Verificación:** Se ejecutarán `npm test`, `npm run build`, `npx vitest run --config ./vitest.config.e2e.ts` y `git diff --check` para confirmar la infraestructura introducida y conservar intactos los cambios de asistencia por sesión.
