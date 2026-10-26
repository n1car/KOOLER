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
  * Frontend: Inicio (Bienvenida), Home del estudiante, Mis Inscripciones, Detalle de actividad y Crear/editar (organizador).
* **Persona J (Jhon) — Rama: `feature/valoraciones`:**
  * Funcionalidad 2: Historial, valoraciones y comentarios públicos.
  * Frontend: Registro, Login y Cuenta creada; Historial, Valoraciones y Retroalimentación (organizador).
* **Persona S (Samuel) — Rama: `feature/certificados`:**
  * Funcionalidad 3: Control de asistencia por sesión y emisión de certificados.
  * Frontend: Mis Actividades (dashboard del organizador), Control de Asistencia (organizador) y Mi Progreso / Mi Certificado (estudiante).

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

#### ✅ Estado de avance D2 (verificado 2026-10-25, rama `dev`)
* **Backend completo y probado en vivo:**
  * `npm run build` 0 errores · `npm test` 76/76 · `npm run lint` 0 warnings · `npm run test:e2e` 30/30 (requiere `docker compose up -d`) · `npm run smoke` 27/27.
  * `npm run smoke` recorre salud del servicio, login/roles, catálogos, actividades, inscripción, sesión, asistencia, elegibilidad, certificado (PDF), reseñas e historial, con casos negativos 400/403/409.
  * `GET /api/health` verifica proceso y conexión a PostgreSQL; lo usa el proveedor de despliegue.
  * La configuración se valida al arrancar (`src/config/env.validation.ts`); no hay secretos por defecto en el código.
  * Catálogos añadidos (`LOCATION`, `ACTIVITY_TYPE`) con relación a `ACTIVITY`, filtro por categoría y seed demo; `GET` de asistencia por sesión para el panel admin.
  * Reglas cubiertas: cupo máximo, no duplicados (`@Unique`), solo `ACTIVE`, `registration_deadline`, solo dueño edita/cancela, cupo no reducible bajo inscritos, `ACTIVE→FINISHED` automático (RF09), inscripción transaccional con lock pesimista (RNF07).
* **Las tres funcionalidades están integradas:** actividades/inscripciones (N), reseñas/historial (J) y asistencia/certificados (S).
* **Pendiente único de D2:** confirmar la URL pública del despliegue en Render (blueprint listo en `render.yaml`).
* **Frontend D2 (proyecto `frontend/`, Next.js 16 + Tailwind v4) — avance visual de D2:**
  * Scaffold Next.js (App Router, TypeScript, mobile-first) con tokens de diseño, layout, navegación y estilos base.
  * Rutas: `/` (Bienvenida), `/login`, `/register`, `/account-created`; estudiante `/home`, `/my-enrollments`, `/progress`, `/history`; detalle `/activities/[id]`; organizador `/organizer/activities`, `/organizer/activities/[id]`, `/organizer/activities/[id]/attendance`, `/organizer/activities/[id]/feedback`, `/organizer/activities/new`.
  * Pantallas representativas con **datos temporales** (`src/lib/mock.ts`): listado con búsqueda/filtro e inscripción, mis inscripciones, progreso con elegibilidad y certificado, historial con valoración de 5 estrellas; panel del organizador con métricas, detalle, control de asistencia, retroalimentación y formulario de creación.
  * Alcance D2: pantallas que corresponden al prototipo de Figma y son navegables; **sin** conexión al backend ni sesión real (eso corresponde a D3), como permite la rúbrica (datos temporales).

### 🖥️ Frontend — Ejecución local
```bash
cd frontend
npm install
npm run dev        # http://localhost:3001
```
* No requiere el backend ni variables de entorno: el prototipo de D2 usa datos temporales locales.
* Verificación: `npm run lint` (0 errores) y `npm run build` (type-check en verde).


### 🧪 Pruebas de la API con Postman

```bash
cd backend
npx newman run Kooler-D2.postman_collection.json
```

* La colección (`backend/Kooler-D2.postman_collection.json`) tiene 23 requests en orden de flujo y 46 aserciones.
* Los tokens y los IDs (`orgToken`, `studentToken`, `activityId`, `sessionId`, `certificateId`) se guardan **automáticamente** al ejecutar los requests de login y creación; no hay que copiarlos a mano.
* `baseUrl` apunta a `http://localhost:3000/api`. Para probar el despliegue, cámbielo a `{{prodUrl}}`.
* Requiere el backend en ejecución y `docker compose up -d`.


### 📌 Entrega D3 y Entrega Final (DF — 20%+ de la Nota)
* Integración punta a punta de todos los flujos sin datos falsos.
* Pruebas completas de regresión y concurrencia.
* Frontend, Backend y BD desplegados en la nube.
* Sustentación oral individual: cada estudiante debe dominar y poder explicar cualquier línea de código.

---

## 🚀 Tecnologías del Backend
* **Framework:** NestJS 12 con TypeORM
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

## 🗂️ Catálogos de categorías y ubicaciones
* **Categoría (`ACTIVITY_TYPE`):** `id_type` (PK), `name` (único) y `requires_enrollment`. Catálogo público de tipos de actividad exigido por RF03/RF06.
* **Ubicación (`LOCATION`):** `id_location` (PK), `name` y `building`. Catálogo público de espacios donde se realizan las actividades.
* **Relación en `ACTIVITY`:** `id_type` (FK → `ACTIVITY_TYPE`) e `id_location` (FK → `LOCATION`), ambos opcionales. `CreateActivityDto`/`UpdateActivityDto` aceptan `activityTypeId` y `locationId`; `GET /api/activities?activityTypeId=..` filtra por categoría. Las consultas que usan bloqueo pesimista (inscripción) desactivan el eager loading para evitar `FOR UPDATE` sobre `LEFT JOIN`.
* **Seed:** crea 4 categorías (Deportiva, Cultural, Taller, Recreativa) y 6 ubicaciones demo (Auditorio Varela, Cancha 1, Coliseo, Biblioteca, Sala de Música, Piscina).
* **Emisión inmediata:** al registrar asistencia, `AttendanceService` dispara `issueEligibleCertificates` (idempotente) para dejar el certificado disponible sin esperar el cron; el cron sigue cubriendo reintentos.

---

## 🌿 Estrategia de Ramas en Git (Git Flow del Equipo)
El repositorio maneja un flujo de 3 niveles para proteger la estabilidad del proyecto:
1. **`main` (Producción / Entrega Oficial):** Rama 100% estable. Solo recibe merges desde `dev` una vez verificado que todo compila y pasa pruebas.
2. **`dev` (Integración y Pruebas Conjuntas):** Rama de integración del equipo. Aquí se unen los avances de las 3 ramas para probar que todo funcione junto y corregir detalles sin romper `main`.
3. **Ramas de Funcionalidad (`feature/*`):** Cada integrante trabaja de forma aislada en su propia rama creada a partir de `dev`:
   * Nico: `feature/actividades`
   * Jhon: `feature/valoraciones`
   * Samuel: `feature/certificados`

### 🚀 Inicio desde cero (desarrollo local)

#### Requisitos previos

* Git para clonar el repositorio.
* Docker Desktop con Docker Compose v2 para iniciar PostgreSQL y el backend.
* Node.js y npm para ejecutar el frontend o las pruebas localmente. El backend dentro del contenedor usa Node.js 20.

#### Configurar e iniciar PostgreSQL y el backend

1. Clona el repositorio y entra en la carpeta del backend:
   ```bash
   git clone https://github.com/n1car/KOOLER.git
   cd KOOLER/backend
   ```
2. Crea la configuración local a partir del ejemplo y reemplaza `JWT_SECRET` por un valor aleatorio propio de al menos 32 caracteres. No compartas ni subas el archivo `.env`:
   ```bash
   cp .env.example .env
   ```
   `backend/.env.example` contiene un secreto de ejemplo que la aplicación rechaza; debes reemplazarlo antes de iniciar Compose. En esta configuración Compose toma `JWT_SECRET` del entorno o de ese archivo `.env`; las variables `DB_*` del servicio se definen en `compose.yaml`.
3. Construye e inicia los servicios:
   ```bash
   docker compose up --build -d
   ```
   Compose inicia los servicios `postgres` y `backend`. La API queda en `http://localhost:3000/api` y PostgreSQL se publica en `localhost:5433`.
4. Comprueba el estado de los contenedores y de la API:
   ```bash
   docker compose ps
   curl http://localhost:3000/api/health
   ```
   La respuesta correcta de salud incluye `"status":"ok"` y `"database":"up"`. Si necesitas revisar el arranque del backend:
   ```bash
   docker compose logs backend
   ```

Al iniciar NestJS, `SeedService` se ejecuta automáticamente y agrega los roles, catálogos y usuarios demo que aún no existan. No hay que ejecutar un comando de seed separado. Las credenciales de demostración definidas en el seed son:

* **Estudiante:** `estudiante@icesi.edu.co` / `Password123!`
* **Organizador:** `organizador@icesi.edu.co` / `Password123!`

Son credenciales para desarrollo local; no las uses en un entorno compartido o de producción.

#### Iniciar el frontend

El frontend es independiente del Compose del backend y actualmente usa datos locales de demostración, no consume la API. En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:3001`.

---

## ☁️ Despliegue del backend (Render)

El repositorio incluye [`render.yaml`](./render.yaml), un blueprint que crea en un solo paso el backend (imagen Docker) y una base de datos PostgreSQL administrada.

| Recurso | Valor |
| :--- | :--- |
| **URL de la API** | `https://kooler-api.onrender.com/api` |
| **Health check** | `https://kooler-api.onrender.com/api/health` |
| **Credenciales demo** | `estudiante@icesi.edu.co` y `organizador@icesi.edu.co` / `Password123!` |

### Cómo desplegar

1. En Render: **New → Blueprint** y seleccionar el repositorio `n1car/KOOLER`, rama `dev`.
2. Render crea `kooler-api` y `kooler-db`, e inyecta las variables `DB_*` desde la base de datos. `JWT_SECRET` se genera aleatorio.
3. Esperar el primer build y verificar `GET /api/health` → `{"status":"ok","database":"up"}`.
4. Cada push a `dev` vuelve a desplegar automáticamente.

### Variables de entorno en producción

| Variable | Origen |
| :--- | :--- |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Las inyecta Render desde `kooler-db` |
| `JWT_SECRET` | Generado por Render; nunca se versiona |
| `JWT_EXPIRES_IN` | `24h` |
| `PORT` | Lo define la plataforma |

El arranque valida la configuración (`src/config/env.validation.ts`): si falta una variable obligatoria o `JWT_SECRET` conserva un valor de ejemplo, el proceso no inicia.

### Comportamiento del plan gratuito (importante para la demo)

* El servicio **se suspende tras 15 minutos sin tráfico** y tarda entre 30 y 60 segundos en despertar. Antes de la sustentación conviene abrir `/api/health` un par de minutos antes.
* La base de datos gratuita **expira a los 30 días**. Para reconstruirla: recrear `kooler-db`, actualizar `DB_HOST` y `DB_PASSWORD`, y reiniciar el servicio; el esquema se genera con `synchronize` y el seed repuebla los datos demo.
* Mientras el servicio está suspendido el cron de finalización no corre; al despertar, la finalización también se aplica en las lecturas, así que el estado se corrige solo.

### Smoke test contra el despliegue

```powershell
cd backend
npm run smoke -- -BaseUrl https://kooler-api.onrender.com/api
```

---

## 📡 Catálogo de Endpoints de la API

### 🩺 Salud del servicio (`/api/health`)

| Método | Endpoint | Rol permitido | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Público | Estado del servicio y de la conexión a PostgreSQL (`200` operativo / `503` base de datos no disponible). Lo usan el proveedor de despliegue y el smoke test. |

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

### 🗂️ Catálogos (`/api/activity-types`, `/api/locations`) *(Soporte RF03/RF06)*
| Método | Endpoint | Rol permitido | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/activity-types` | Público | Lista las categorías de actividad (para filtros y creación). |
| `GET` | `/api/locations` | Público | Lista las ubicaciones disponibles (para creación de actividades). |

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
| `GET` | `/api/activities/:activityId/sessions/:sessionId/attendance` | ORGANIZADOR (Dueño) | Leer la asistencia registrada en una sesión (usado por el panel admin para mostrar el estado actual). |
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
