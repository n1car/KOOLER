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
  * Colección de Postman exportada y ejecutable.
  * Backend desplegado con URL pública funcional.
* **Frontend:**
  * Proyecto Next.js con layout base, navegación y estilos mobile-first.
  * Pantallas de login/registro, dashboard y al menos 1 representativa por funcionalidad.
* **Límite de D2 (Fuera de alcance):**
  * NO incluir pagos, reservas de espacios físicos ni subida binaria a AWS S3.

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

### ⭐ Valoraciones y Reseñas (`/api/reviews`) *(Responsable: Jhon)*
*(Documentar aquí los endpoints creados por J: consultar reseñas públicas y calificar actividad finalizada).*

### 📜 Certificados y Asistencia (`/api/certificates`) *(Responsable: Samuel)*
*(Documentar aquí los endpoints creados por S: registrar asistencia y consultar/descargar certificado).*

---

## 🧪 Pruebas Automatizadas
```bash
cd backend
npm test
```

## 📝 Registro de Uso de IA
Ver detalles en el archivo obligatorio [`AI_USAGE.md`](./AI_USAGE.md).
