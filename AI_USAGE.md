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

---

## Registro de uso de IA — Entrega D2 (Sincronía de ramas + verificación Postman + alcance frontend N)
- **Integrante:** Nico (Persona N)
- **Herramienta:** OpenCode / Muse Spark
- **Tarea:** Igualar `feature/actividades` con `dev` (fast-forward + push, sin trabajar en `dev`), validar la colección Postman (JSON + 11 requests en vivo) y analizar la rúbrica D2 para definir el avance frontend de N.
- **Propósito:** Cerrar la parte N con evidencia verificable y dejar el alcance frontend acotado a lo que D2 exige (con mocks permitidos).
- **Descripción de la consulta o prompt:** "Iguala las ramas sin trabajar en dev, dime qué sigue de mi parte y si probaste lo de Postman; analiza la rúbrica para el frontend y documenta en los .md".
- **Resultado utilizado:**
  - `git checkout feature/actividades` + merge fast-forward desde `dev` (0 commits extra) + push; `rev-list dev...feature/actividades` = `0 0`.
  - Colección validada: JSON con 11 items en orden y ejecución en vivo 11/11 (crear ID=3, inscribir 200, duplicado 400, inscritos 1/10).
  - `README.md`: nueva subsección de estado D2 (backend N verificado + pendientes grupales + alcance frontend N con rutas y `lib/mock-data.ts`).
- **Cambios realizados por el equipo:**
  - Se resolvió conflicto de puerto `5433` con otro proyecto local (`coffee-orders-db` detenido; documentado que ambos no pueden correr a la vez).
- **Forma de verificación:**
   - `git log` y `rev-list` confirman ramas iguales; `node -e` valida el JSON; smoke HTTP de los 11 requests en verde.

---

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
- **Ayuda de GitHub Copilot en la implementación:** Orientación para construcción de `CertificateEntity`, `CertificatesModule`, `CertificatesService`, `CertificatesController`, restricción única por estudiante y actividad, código único y endpoint seguro `GET /api/certificates` para consultar los propios certificados sin aceptar IDs arbitrarios del cliente. Se dejó explícito que la emisión automática de certificados y el porcentaje de elegibilidad siguen pendientes de decisión de negocio.
- **Verificación:** Se ejecutarán `npm test`, `npm run build`, `npx vitest run --config ./vitest.config.e2e.ts` y `git diff --check` para confirmar la infraestructura introducida y conservar intactos los cambios de asistencia por sesión.

## Registro de uso de IA — Elegibilidad y emisión de certificados
- **Integrante:** Samuel (Persona S)
- **Herramienta:** GitHub Copilot
- **Ayuda en la implementación:** Revisión del Cálculo de elegibilidad con umbral confirmado de 80 %, sesiones sin registro como ausencias, filtro por sesiones de la actividad, emisión idempotente y consulta privada de elegibilidad por el estudiante inscrito. El servicio de emisión se dejó listo para invocarse tras una finalización confiable.
- **Límites identificados:** No existe actualmente un flujo de backend que marque actividades como `FINISHED` ni un scheduler para RF09. Por eso no se añadió un cron ni una transición de estado artificial y la emisión aún requiere invocación desde un futuro flujo de finalización/reintento. No se implementó descarga PDF.
- **Verificación:** `npm test` pasó con 38 pruebas en 6 archivos; `npm run test:e2e` pasó con 25 pruebas en 4 archivos; `npm run build` compiló correctamente. Las pruebas HTTP usan JWT/guards reales y repositorios mockeados, sin conexión a PostgreSQL.

## Registro de uso de IA — Finalización automática y descarga PDF
- **Integrante:** Samuel (Persona S)
- **Herramienta:** GitHub Copilot
- **Ayuda en la implementación:** Sugerencia de Integración de `@nestjs/schedule` para procesar cada minuto actividades `ACTIVE` vencidas usando `date` y `endTime`, y reintentar la emisión idempotente sobre actividades certificables `FINISHED`. Se fijó la interpretación local `America/Bogota`; el umbral permanece fijo en 80 % y no se usa `minAttendancePercentage`. Se añadió descarga propia de certificados con PDFKit en memoria, protegida por JWT/rol y filtrada por estudiante.
- **Límites:** Horarios con formato no reconocido se omiten con seguridad; la infraestructura no incluye persistencia de configuración de zona horaria. RF14 originalmente habla de asistencia registrada mientras la regla confirmada de este desarrollo exige 80 %. No se probó contra PostgreSQL real.
- **Verificación:** `npm test` pasó con 48 pruebas en 7 archivos; `npm run test:e2e` pasó con 28 pruebas en 4 archivos; `npm run build` compiló correctamente. Las pruebas PDF usan PDFKit real en memoria. Las E2E usan la estrategia JWT/guards reales y repositorios simulados.
