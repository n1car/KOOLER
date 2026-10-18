# Kooler — Plataforma de Bienestar Universitario

Kooler es una aplicación web mobile-first diseñada para centralizar, gestionar y certificar las actividades de bienestar estudiantil e institucional (Caso de estudio: Universidad Icesi).

---

## 📚 Documentación del Proyecto (`docs/`)
Todos los documentos de especificación inicial y diseño se encuentran organizados en la carpeta [`docs/`](./docs):
* 📋 [`Requerimientos.md`](./docs/Requerimientos.md) — Requerimientos del sistema.
* 🗄️ [`Diseño base de datos.md`](./docs/Diseño%20base%20de%20datos.md) — Modelo relacional de 9 entidades.
* 🏛️ [`Arquitectura inicial.md`](./docs/Arquitectura%20inicial.md) — Arquitectura y stack tecnológico.
* 💡 [`Funcionalidades.md`](./docs/Funcionalidades.md) — Detalle de las funcionalidades principales.
* 📅 [`Plan de trabajo.md`](./docs/Plan%20de%20trabajo.md) — Reparto de tareas y tiempos.
* 🎯 [`Taller y rubrica del proyecto.md`](./docs/Taller%20y%20rubrica%20del%20proyecto.md) — Criterios de evaluación oficiales.

---

## 👥 Reparto de Funcionalidades (Entrega D2)
* **Persona N (Nico) — Rama: `feature/actividades`:**
  * Template base de backend (Docker, Auth JWT, RolesGuard, Entidades comunes).
  * Funcionalidad 1: Gestión y participación en actividades (creación, edición, cancelación, cupos e inscripciones).
* **Persona J (Jhon) — Rama: `feature/valoraciones`:**
  * Funcionalidad 2: Historial, valoraciones y comentarios públicos.
* **Persona S (Samuel) — Rama: `feature/certificados`:**
  * Funcionalidad 3: Control de asistencia por sesión y emisión de certificados.

> ⚠️ **Para agentes de IA y desarrolladores:** Leer obligatoriamente el archivo [`AGENTS.md`](./AGENTS.md) antes de escribir código.

---

## 📝 Estándar de Commits y Límites por Persona
Todo commit debe seguir el formato Conventional Commits:
```
<tipo>(<alcance>): <descripción concisa>
```
* **Tipos:** `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
* **Alcances por integrante:**
  * **Nico (N):** `feat(base)`, `feat(auth)`, `feat(actividades)`, `feat(inscripciones)`
  * **Jhon (J):** `feat(valoraciones)`, `feat(comentarios)`, `feat(historial)`
  * **Samuel (S):** `feat(certificados)`, `feat(asistencia)`
  * **Común:** `chore(docker)`, `docs(readme)`, `test(auth)`

### 🔢 Límite Máximo de Commits por Persona:
* **Entrega D2:** **Máximo 20 commits por persona** (Recomendado: 10 - 18 commits atómicos).
* **Entrega D3:** **Máximo 15 commits por persona** (Recomendado: 8 - 12 commits).
* **Entrega Final (DF):** **Máximo 10 commits por persona** (Recomendado: 5 - 8 commits).

---

## 🎯 Límites y Entregables por Hito (Deliveries)

### 📌 Entrega D2 (Actual — 10% de la Nota)
* **Backend:**
  * Soporte funcional completo para las 3 funcionalidades.
  * Base de datos PostgreSQL 17 reproducida con Docker (`compose.yaml`).
  * Autenticación JWT + Passport con contraseñas encriptadas con `bcrypt`.
  * Autorización verificada en backend con `RolesGuard` (no solo ocultando botones).
  * Validación estricta con DTOs y class-validator.
  * Interceptor de logging para auditoría de peticiones HTTP y tiempos de respuesta.
  * Pruebas automatizadas de servicio e integración.
  * Colección de Postman exportada y ejecutable (`backend/Kooler-D2.postman_collection.json`).
  * Backend desplegado con URL pública funcional.
* **Frontend:**
  * Proyecto Next.js con layout base, navegación y estilos mobile-first.
  * Pantallas de login/registro, dashboard y al menos 1 representativa por funcionalidad.
  * En D2 las pantallas pueden usar datos temporales (mock) si la integración no está terminada.
* **Límite de D2 (Fuera de alcance):**
  * NO incluir pagos, reservas de espacios físicos ni subida binaria a AWS S3.

#### ✅ Estado de avance D2 — Persona N (verificado 2026-10-11, rama `dev`)
* **Backend N terminado y probado en vivo:**
  * `npm run build` 0 errores · `npm test` 12/12 · `npm run lint` 0 warnings · `npm run test:e2e` 2/2 (requiere `docker compose up -d`).
  * Smoke HTTP real: login org/estudiante, crear actividad `201`, inscribirse `200`, duplicado `400`, estudiante-creando `403`, cupo agotado `400`.
  * Reglas cubiertas: cupo máximo, no duplicados (`@Unique`), solo `ACTIVE`, `registration_deadline`, solo dueño edita/cancela, cupo no reducible bajo inscritos, `ACTIVE→FINISHED` automático (RF09), inscripción transaccional con lock pesimista (RNF07).
* **Pendiente grupal D2 (no es de N):** módulos de Jhon (`Review`) y Samuel (`Attendance`/`Certificate`), URL pública del deploy.
* **Pendiente frontend D2 — alcance de N (Funcionalidad 1, con mocks):**
  * Scaffold Next.js (App Router) + layout + navegación + estilos mobile-first.
  * Rutas: `/login`, `/register`, `/activities`, `/activities/[id]`, `/my-enrollments`, `/organizer/activities`, `/organizer/activities/new`.
  * Pantallas: listado con filtros (estado/búsqueda), detalle con cupos e inscripción + confirmación, formulario crear/editar (organizador), mis inscripciones.
  * Capa `lib/mock-data.ts` con el mismo contrato del backend para conectar la API real en D3 sin reescribir pantallas.

### 📌 Entrega D3 y Entrega Final (DF — 20%+ de la Nota)
* Integración punta a punta de todos los flujos sin datos falsos.
* Pruebas completas de regresión y concurrencia.
* Frontend, Backend y BD desplegados en la nube.
* Sustentación oral individual: cada estudiante debe dominar y poder explicar cualquier línea de código.

---

## 🚀 Tecnologías del Backend
* **Framework:** NestJS 11 con TypeORM
* **Base de Datos:** PostgreSQL 17 (Docker) en puerto `5433`
* **Autenticación:** JWT con Passport y encriptación `bcrypt`
* **Autorización:** `RolesGuard` genérico y `JwtAuthGuard`
* **Validación:** DTOs con `class-validator` y `class-transformer`
* **Auditoría:** `LoggingInterceptor` global (registra método, URL, código de estado y tiempo de respuesta en ms)
* **Pruebas:** Vitest (ejecución rápida con `npm test`)
* **Tareas programadas:** `@nestjs/schedule` para finalizar actividades vencidas.
* **PDF:** `pdfkit` para generar certificados en memoria, sin archivos temporales.

## 🗄️ Entidades de asistencia y certificación definidas
* **Sesión (`SESSION`):** `id_session` (PK), `id_activity` (FK), `session_date`, `start_time`, `end_time` y `created_at`. Representa una sesión concreta dentro de una actividad. Para el cálculo vigente, todas las sesiones asociadas a la actividad cuentan como sesiones válidas.
* **Asistencia (`ATTENDANCE`):** `id_attendance` (PK), `id_user` (FK), `id_session` (FK), `registration_date` y `status` (`PRESENT` o `ABSENT`). La unicidad se aplica por estudiante y sesión para permitir varias asistencias dentro de la misma actividad en sesiones distintas.
* **Inscripción (`ENROLLMENT`):** `id_enrollment` (PK), `id_user` (FK), `id_activity` (FK) y `enrollment_date`. Se permite una inscripción por estudiante y actividad; todavía no existen estados de inscripción.
* **Certificado (`CERTIFICATE`):** `id_certificate` (PK), `id_user` (FK), `id_activity` (FK), `issue_date` y `certificate_code` único. La restricción de unicidad evita más de un certificado por estudiante y actividad. La emisión del servicio es idempotente y genera códigos aleatorios únicos, respetando también la restricción de base de datos.
* **Registro de asistencia:** `AttendanceModule` expone `POST /api/activities/:activityId/sessions/:sessionId/attendance` para el rol `ORGANIZADOR`. El servicio exige que el organizador autenticado sea propietario de la actividad, que la sesión pertenezca a su actividad indicada, que el estudiante exista y tenga rol de estudiante, que esté inscrito y que la actividad esté finalizada. Solo acepta `PRESENT` o `ABSENT`; los duplicados en la misma sesión se rechazan.
* **Consulta de certificados:** `CertificatesModule` expone `GET /api/certificates` para el rol `ESTUDIANTE`, devolviendo los certificados del estudiante autenticado. El cliente no recibe un identificador configurable para consultar certificados ajenos; el endpoint usa `@CurrentUser()` para filtrar por la identidad real del usuario.
* **Elegibilidad:** Se calcula sobre las sesiones asociadas a la actividad: `sesiones PRESENT / total de sesiones * 100`. Una sesión sin registro cuenta en el denominador, `ABSENT` no suma al numerador, las sesiones se cuentan una sola vez y se exige al menos 80 %. Actividades sin sesiones no otorgan certificado; la actividad debe estar `FINISHED` y ser certificable.
* **Consulta de elegibilidad:** `GET /api/certificates/activities/:activityId/eligibility` requiere rol `ESTUDIANTE` e inscripción a esa actividad. La respuesta contiene solo el resumen de asistencia del estudiante autenticado.
* **Finalización automática:** Un cron cada minuto marca actividades en lotes de 50 únicamente si están `ACTIVE` y su combinación `date + endTime` ya venció. La comparación interpreta la fecha/hora en `America/Bogota`; horarios con formato no válido se omiten. Nunca cambia actividades `CANCELLED`.
* **Emisión:** `CertificatesService.issueEligibleCertificates(activityId)` procesa inscritos en actividades `FINISHED` y certificables. Se exige el umbral fijo confirmado de 80 %; `ActivityEntity.minAttendancePercentage` permanece sin uso para no cambiar silenciosamente la regla vigente. La emisión es idempotente; los errores por estudiante o actividad se registran y se reintentan en ciclos posteriores. Sesiones sin asistencia y `ABSENT` no suman al numerador; actividades sin sesiones no emiten.
* **Respuesta y límites:** Los endpoints devuelven únicamente los campos necesarios (IDs, fecha, código y resumen de elegibilidad). No exponen entidades relacionadas ni `passwordHash`. El PDF se genera en memoria y la búsqueda limita por certificado y estudiante autenticado.

---

## 🌿 Estrategia de Ramas en Git (Git Flow del Equipo)
El repositorio maneja un flujo de 3 niveles para proteger la estabilidad del proyecto:
1. **`main` (Producción / Entrega Oficial):** Rama 100% estable. Solo recibe merges desde `dev` una vez verificado que todo compila y pasa pruebas.
2. **`dev` (Integración y Pruebas Conjuntas):** Rama de integración del equipo. Aquí se unen los avances de las 3 ramas para probar que todo funcione junto y corregir detalles sin romper `main`.
3. **Ramas de Funcionalidad (`feature/*`):** Cada integrante trabaja de forma aislada en su propia rama creada a partir de `dev`:
   * Nico: `feature/actividades`
   * Jhon: `feature/valoraciones`
   * Samuel: `feature/certificados`

### 🛠️ Guía Rápida para Jhon y Samuel al Clonar el Repositorio

1. **Clonar, cambiarse a `dev` y sacar su rama de trabajo:**
   ```bash
   git clone https://github.com/n1car/KOOLER.git
   cd KOOLER
   
   # Cambiarse a la rama dev (base común)
   git checkout dev
   
   # Si eres Jhon (Persona J):
   git checkout -b feature/valoraciones
   
   # Si eres Samuel (Persona S):
   git checkout -b feature/certificados
   ```
   *(Al terminar avances, cada integrante hace merge o PR hacia `dev`, NUNCA directo a `main`)*.

2. **Levantar la base de datos (Docker Desktop debe estar abierto):**
   ```bash
   cd backend
   docker compose up -d
   ```

3. **Instalar dependencias y encender el backend:**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
   El backend iniciará en: `http://localhost:3000/api`

4. **Credenciales Demo de Fábrica (creadas automáticamente por Seed):**
   * **Estudiante:** `estudiante@icesi.edu.co` | `Password123!`
   * **Organizador:** `organizador@icesi.edu.co` | `Password123!`

---

## 📡 Catálogo de Endpoints de la API

### 🔐 Autenticación (`/api/auth`)
| Método | Endpoint | Rol permitido | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registro de usuarios (asigna rol ESTUDIANTE por defecto). |
| `POST` | `/api/auth/login` | Público | Inicio de sesión, devuelve token JWT y rol. |
| `GET` | `/api/auth/profile` | Autenticado | Devuelve los datos del usuario conectado según su token JWT. |

### 📅 Actividades e Inscripciones (`/api/activities`) ✅ *(Completado por Persona N)*
| Método | Endpoint | Rol permitido | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/activities` | Público / Autenticado | Listado de actividades con filtros (estado, categoría). |
| `GET` | `/api/activities/:id` | Público / Autenticado | Detalle de la actividad con cupos disponibles calculados. |
| `POST` | `/api/activities` | ORGANIZADOR | Crear una nueva actividad de bienestar. |
| `PATCH` | `/api/activities/:id` | ORGANIZADOR (Dueño) | Modificar datos de una actividad existente. |
| `DELETE` | `/api/activities/:id` | ORGANIZADOR (Dueño) | Cancelar una actividad (cambia su estado a CANCELLED). |
| `POST` | `/api/activities/:id/enroll` | ESTUDIANTE | Inscribirse a una actividad (valida cupos, fecha y duplicados). |
| `GET` | `/api/activities/my-enrollments` | ESTUDIANTE | Ver las inscripciones del estudiante conectado. |
| `GET` | `/api/activities/:id/enrollments` | ORGANIZADOR (Dueño) | Ver la lista de estudiantes inscritos a su actividad. |
| `GET` | `/api/activities/:id/sessions` | Público | Lista las sesiones de una actividad. |
| `POST` | `/api/activities/:id/sessions` | ORGANIZADOR (Dueño) | Crear una sesión en la actividad (habilita asistencia y certificados). |

### ⭐ Valoraciones, Reseñas e Historial (`/api/reviews`, `/api/history`) *(Responsable: Jhon)*
| Método | Endpoint | Rol permitido | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews` | ESTUDIANTE | Calificar (1-5) y comentar una actividad finalizada a la que asistió. Una sola vez. |
| `GET` | `/api/reviews/activity/:activityId` | Público | Promedio y comentarios públicos de una actividad. |
| `GET` | `/api/reviews/organizer/activity/:activityId` | ORGANIZADOR (Dueño) | Solo lectura. El organizador no puede editar ni eliminar reseñas. |
| `GET` | `/api/history` | ESTUDIANTE | Actividades finalizadas del estudiante con asistencia y calificación propia. |

### 📜 Certificados y Asistencia *(Responsable: Samuel)*
| Método | Endpoint | Rol permitido | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/activities/:activityId/sessions/:sessionId/attendance` | ORGANIZADOR (Dueño) | Registrar `PRESENT` o `ABSENT` para un estudiante inscrito en una sesión concreta de la actividad, únicamente cuando la actividad haya finalizado. |
| `GET` | `/api/certificates` | ESTUDIANTE | Consulta los certificados emitidos para el usuario autenticado. El endpoint usa la identidad real del estudiante y no acepta un identificador del cliente para consultar certificados ajenos. |
| `GET` | `/api/certificates/activities/:activityId/eligibility` | ESTUDIANTE inscrito | Consulta el porcentaje y la elegibilidad del estudiante autenticado para una actividad. |
| `GET` | `/api/certificates/:certificateId/download` | ESTUDIANTE (propietario) | Descarga el certificado propio como PDF (`application/pdf`) con nombre, actividad, código y fecha de emisión. |

El cron de `ActivityFinalizationService` finaliza actividades vencidas cada minuto y luego intenta emitir certificados. También revisa actividades certificables ya finalizadas para reintentar emisiones fallidas o pendientes de registro de asistencia. El umbral de 80 % es más específico que RF14, cuya redacción original solicita que exista un registro de asistencia; este criterio debe mantenerse alineado con el equipo.

> **Sesiones:** la asistencia y los certificados dependen de que la actividad tenga sesiones. El organizador dueño las crea con `POST /api/activities/:id/sessions` y cualquier usuario puede listarlas con `GET /api/activities/:id/sessions`.

> **Seguridad (unificada):** todas las rutas protegidas usan `@UseGuards(JwtAuthGuard, RolesGuard)` de forma explícita por ruta. El `RolesGuard` **no** se registra global (corría antes que `JwtAuthGuard`, veía `request.user` vacío y devolvía 403 en toda ruta protegida).

---

## 🧪 Pruebas Automatizadas
```bash
cd backend
npm test
npm run test:e2e
```

## 📝 Registro de Uso de IA
Ver detalles en el archivo obligatorio [`AI_USAGE.md`](./AI_USAGE.md).
