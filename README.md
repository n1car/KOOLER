# KOOLER — Bienestar Universitario

KOOLER es una aplicación web para organizar y gestionar las actividades de bienestar universitario, tomando como caso de estudio la Universidad Icesi. La idea es reunir en un solo lugar la información de las actividades y facilitar la participación de los estudiantes, el trabajo de los organizadores y el seguimiento de la asistencia.

## Funcionalidades principales

- **Gestión de actividades:** creación, edición y cancelación de actividades, con información sobre sus fechas, categorías y cupos.
- **Inscripciones:** los estudiantes pueden inscribirse en las actividades disponibles, teniendo en cuenta los cupos y las condiciones de inscripción.
- **Control de asistencia:** registro de asistencia de los participantes por sesión.
- **Historial y valoraciones:** consulta de actividades y publicación de comentarios y valoraciones cuando la actividad ha finalizado.
- **Certificados:** gestión de certificados asociados a la participación y asistencia de los estudiantes.
- **Usuarios y permisos:** registro e inicio de sesión, con acceso a las funciones según el rol del usuario.

La disponibilidad de algunas funciones puede variar entre el frontend y el backend, ya que la integración completa de todos los flujos forma parte del desarrollo del proyecto.

## Tecnologías utilizadas

| Componente | Tecnología |
|---|---|
| Frontend | Next.js, React y TypeScript |
| Backend | NestJS 11 |
| Base de datos | PostgreSQL 17 |
| ORM | TypeORM |
| Autenticación | JWT y Passport |
| Validación | class-validator y class-transformer |
| Contenedores | Docker Compose |
| Pruebas | Pruebas automatizadas del backend |

## Estructura del proyecto

```text
KOOLER/
├── backend/       # API, lógica de negocio y acceso a datos
├── frontend/      # Interfaz web
├── docs/          # Documentación y diseño del proyecto
├── AGENTS.md      # Instrucciones para trabajar en el repositorio
├── AI_USAGE.md    # Registro de uso de herramientas de IA
└── README.md
```

## Requisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js y npm.
- Docker Desktop con Docker Compose.
- Git.

## Cómo ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/n1car/KOOLER.git
cd KOOLER
```

Para trabajar con la rama de integración del equipo:

```bash
git checkout dev
```

### 2. Configurar y levantar la base de datos

Desde la raíz del repositorio, ejecuta:

```bash
cd backend
docker compose up -d
```

Esto inicia los servicios definidos en el archivo `backend/compose.yaml`.

### 3. Configurar el backend

Instala las dependencias:

```bash
cd backend
npm install
```

Configura las variables de entorno requeridas por el backend. Consulta el archivo de validación de configuración y la configuración de TypeORM para verificar los nombres y valores necesarios en tu entorno local.

No utilices credenciales reales ni secretos de producción en archivos que vayan a subirse al repositorio.

Inicia el servidor en modo desarrollo:

```bash
npm run start:dev
```

La API está disponible en:

`http://localhost:3000/api`

El endpoint de salud es:

`http://localhost:3000/api/health`

### 4. Ejecutar el frontend

Abre otra terminal desde la raíz del repositorio:

```bash
cd frontend
npm install
npm run dev
```

Next.js iniciará el servidor de desarrollo en `http://localhost:3001`.

Copia `frontend/.env.example` a `frontend/.env.local` y ajusta `NEXT_PUBLIC_API_URL` si el backend no está en `http://localhost:3000/api`. El frontend consume el backend real, por lo que requiere Docker y el backend encendidos.

## Usuarios de prueba

En el entorno de desarrollo se pueden crear usuarios de demostración mediante el proceso de seed, según la configuración del backend.

Las cuentas de demostración no deben utilizarse en producción. Si necesitas las credenciales locales, revisa la configuración de seed del proyecto.

## Plan D3 — Reparto detallado por integrante

**Base de partida:** `dev` ya contiene el backend completo (F1, F2 y F3) y el prototipo visual del frontend. En D3 cada integrante conecta sus pantallas al backend real, termina su diseño y cubre los estados de interfaz.

**Objetivo de la entrega:** que el frontend consuma el backend con sesión real, permisos por rol, manejo de errores y al menos **2 de las 3 funcionalidades de punta a punta**.

### Fase 0 — Infraestructura compartida (bloquea a todos)

Responsable: **N**, con revisión de J y S.

* Cliente HTTP único (`frontend/src/lib/api.ts`) con `NEXT_PUBLIC_API_URL`.
* Manejo del token: guardar, enviar `Authorization: Bearer` y limpiar al cerrar sesión.
* `AuthContext` + hook `useAuth` con usuario y rol.
* Guardas de ruta por rol y redirección en 401/403.
* Componentes reutilizables de carga, error, vacío y éxito.
* Cierre de sesión visible en los shells de estudiante y organizador.
* Variables documentadas en `frontend/.env.example`.

### Persona N (Nico) — Infraestructura + Funcionalidad 1

**Pantallas a cargo:** Bienvenida, Home del estudiante, Detalle de actividad, Mis Inscripciones, Detalle admin y Crear actividad.

**Tareas:**

* Completar la Fase 0 (API client, auth context, guards, estados).
* Home: listado real con búsqueda, filtro por categoría, cupos y estado.
* Detalle: datos reales de la actividad, sesiones y organizador.
* Inscripción: `POST /api/activities/:id/enroll`; manejar 400 por duplicado, cupo agotado, plazo vencido o actividad no activa.
* Mis Inscripciones: `GET /api/activities/my-enrollments`.
* Panel del organizador: filtrar sus actividades, métricas reales de activas/finalizadas/inscritos.
* Crear actividad: formulario conectado, catálogos reales y validación de errores del backend.
* Detalle admin: sesiones reales (`GET/POST /api/activities/:id/sessions`), inscritos reales (`GET /api/activities/:id/enrollments`) y finalización (`PATCH /api/activities/:id` con `status: FINISHED`).

**Endpoints que consume:** `/api/auth`, `/api/activities`, `/api/activities/:id`, `/api/activities/:id/enroll`, `/api/activities/my-enrollments`, `/api/activities/:id/enrollments`, `/api/activities/:id/sessions`, `/api/activity-types`, `/api/locations`.

**Archivos clave:** `frontend/src/lib/api.ts`, `frontend/src/lib/auth.tsx`, `frontend/src/components/RequireRole.tsx`, `frontend/src/components/AppShell.tsx`, `frontend/src/app/(student)/home/page.tsx`, `frontend/src/app/(student)/my-enrollments/page.tsx`, `frontend/src/app/activities/[id]/page.tsx`, `frontend/src/app/(organizer)/organizer/activities/page.tsx`, `frontend/src/app/(organizer)/organizer/activities/new/page.tsx`, `frontend/src/app/(organizer)/organizer/activities/[id]/page.tsx`.

**Criterios de aceptación:**

* Un estudiante se inscribe y ve la actividad en Mis Inscripciones sin recargar datos falsos.
* El organizador crea una actividad y la ve en su panel.
* Los errores del backend se muestran en pantalla (cupo, duplicado, plazo).
* `npm run lint` y `npm run build` en verde.

### Persona J (Jhon) — Autenticación + Funcionalidad 2

**Pantallas a cargo:** Login, Registro, Cuenta creada, Historial, Valoraciones y Retroalimentación.

**Tareas:**

* Login y Registro conectados a `/api/auth/login` y `/api/auth/register`.
* Guardar la sesión y redirigir según el rol (estudiante u organizador).
* Cierre de sesión y protección de rutas.
* Historial real: `GET /api/history`.
* Valoraciones: crear reseña con `POST /api/reviews` (5 estrellas + comentario).
* Manejar 400 por rango inválido y 409 por reseña duplicada.
* Retroalimentación del organizador: `GET /api/reviews/organizer/activity/:activityId` (solo lectura).
* Comentarios públicos en el detalle: `GET /api/reviews/activity/:activityId`.

**Endpoints que consume:** `/api/auth/login`, `/api/auth/register`, `/api/auth/profile`, `/api/reviews`, `/api/reviews/activity/:activityId`, `/api/reviews/organizer/activity/:activityId`, `/api/history`.

**Archivos clave:** `frontend/src/app/login/page.tsx`, `frontend/src/app/register/page.tsx`, `frontend/src/app/account-created/page.tsx`, `frontend/src/app/(student)/history/page.tsx`, `frontend/src/app/(organizer)/organizer/activities/[id]/feedback/page.tsx`.

**Criterios de aceptación:**

* Login y logout funcionan de extremo a extremo con token real.
* Un organizador no puede calificar y un estudiante sí.
* El historial y las reseñas provienen del backend.
* Errores de autenticación y autorización visibles en la interfaz.

### Persona S (Samuel) — Funcionalidad 3 + Despliegue

**Pantallas a cargo:** Panel Mis Actividades, Control de Asistencia y Mi Progreso / Mi Certificado.

**Tareas:**

* Panel del organizador con actividades, sesiones e inscritos reales.
* Control de Asistencia: crear sesión, registrar `PRESENT`/`ABSENT` y leer la asistencia de la sesión.
* Mi Progreso: `GET /api/certificates/activities/:activityId/eligibility`.
* Mis Certificados: `GET /api/certificates` y descarga del PDF.
* Desplegar backend y base de datos con URL pública y variables de entorno.
* Verificar CORS y que el frontend apunte al backend desplegado.
* Ejecutar el smoke en producción.

**Endpoints que consume:** `/api/activities/:id/sessions`, `/api/activities/:id/sessions/:sessionId/attendance`, `/api/certificates`, `/api/certificates/activities/:activityId/eligibility`, `/api/certificates/:certificateId/download`.

**Archivos clave:** `frontend/src/app/(organizer)/organizer/activities/page.tsx`, `frontend/src/app/(organizer)/organizer/activities/[id]/attendance/page.tsx`, `frontend/src/app/(student)/progress/page.tsx`, `backend/compose.yaml`, `backend/scripts/smoke.ps1`.

**Criterios de aceptación:**

* El organizador registra asistencia y el estudiante ve su elegibilidad.
* El certificado se descarga como PDF.
* Backend y BD accesibles por URL pública.
* `npm run smoke` en verde contra el ambiente desplegado.

### Flujos mínimos de D3

| Flujo | Meta |
| :--- | :--- |
| Autenticación y autorización | Obligatorio de punta a punta (J) |
| F1 — Actividades e inscripciones | Obligatorio de punta a punta (N) |
| F3 — Asistencia y certificados | Obligatorio de punta a punta (S) |
| F2 — Reseñas e historial | Pantallas + plan; integrar si el tiempo alcanza (J) |

### Orden de trabajo y dependencias

1. N entrega la Fase 0 (API client, auth context, guards y estados).
2. J integra login/registro y deja el token funcionando.
3. En paralelo: N integra F1, S integra F3 y J integra F2.
4. S publica backend y BD; todos apuntan a la URL pública.
5. Pruebas manuales por flujo, README de integración y ensayo de sustentación.

### Pruebas y evidencias de D3

* Casos de prueba manuales por funcionalidad.
* Colección Postman actualizada.
* `npm run lint`, `npm run build`, `npm test` y `npm run test:e2e` en verde.
* README con instrucciones de integración y registro de decisiones.
* URL de demostración del frontend y del backend.
* Planning actualizado y Figma si el diseño cambió.

### Límite de commits para D3

* Máximo **15 commits por persona** (recomendado 8–12), agrupando cambios lógicos completos.

## API

La API utiliza el prefijo `/api`.

### Autenticación — `/api/auth`

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | Público | Registra un usuario. |
| `POST` | `/api/auth/login` | Público | Inicia sesión y devuelve la información de autenticación. |
| `GET` | `/api/auth/profile` | Autenticado | Consulta el perfil del usuario autenticado. |

### Actividades — `/api/activities`

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/activities` | Público o autenticado | Consulta las actividades y sus filtros disponibles. |
| `GET` | `/api/activities/:id` | Público o autenticado | Consulta el detalle de una actividad. |
| `POST` | `/api/activities` | Organizador | Crea una actividad. |
| `PATCH` | `/api/activities/:id` | Organizador autorizado | Modifica una actividad propia. |
| `DELETE` | `/api/activities/:id` | Organizador autorizado | Cancela una actividad. |
| `POST` | `/api/activities/:id/enroll` | Estudiante | Solicita la inscripción a una actividad. |
| `GET` | `/api/activities/:id/enrollments` | Organizador autorizado | Consulta las inscripciones de una actividad propia. |

Los permisos, validaciones y condiciones específicas se aplican desde el backend.

Para consultar la implementación de asistencia, certificados y valoraciones, revisa los controladores y módulos correspondientes en `backend/src`.

## Pruebas

Desde la carpeta `backend`, ejecuta:

```bash
npm test
```

El proyecto también contiene pruebas de integración y de extremo a extremo. Revisa los scripts definidos en `backend/package.json` para conocer los comandos disponibles y los requisitos de cada tipo de prueba.

## Despliegue

El backend cuenta con un despliegue en Render. El estado del servicio puede consultarse en:

`https://kooler-api.onrender.com/api/health`

El frontend y el backend deben configurarse por separado cuando se despliegan en la nube. La integración entre ambos depende de las variables de entorno y de las llamadas a la API implementadas en el frontend.

## Documentación adicional

En la carpeta [`docs/`](./docs/) se encuentran los documentos de apoyo del proyecto:

- [Requerimientos](./docs/Requerimientos.md)
- [Diseño de base de datos](./docs/Diseño%20base%20de%20datos.md)
- [Arquitectura](./docs/Arquitectura%20inicial.md)
- [Funcionalidades](./docs/Funcionalidades.md)
- [Plan de trabajo](./docs/Plan%20de%20trabajo.md)
- [Taller y rúbrica del proyecto](./docs/Taller%20y%20rubrica%20del%20proyecto.md)

También puedes consultar [`AGENTS.md`](./AGENTS.md) para las instrucciones de trabajo del repositorio y [`AI_USAGE.md`](./AI_USAGE.md) para el registro del uso de herramientas de inteligencia artificial.
```

## 📝 Registro de Uso de IA
Ver detalles en el archivo obligatorio [`AI_USAGE.md`](./AI_USAGE.md).
