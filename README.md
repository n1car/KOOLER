# Kooler — Plataforma de Bienestar Universitario

Kooler es una aplicación web mobile-first diseñada para centralizar, gestionar y certificar las actividades de bienestar estudiantil e institucional (Caso de estudio: Universidad Icesi).

---

## 👥 Reparto de Funcionalidades (Entrega D2)
* **Persona N (Nico) — Rama: `feature/actividades`:**
  * Template base de backend (Docker, Auth JWT, RolesGuard, Entidades comunes).
  * Funcionalidad 1: Gestión y participación en actividades (creación, edición, cancelación, cupos e inscripciones).
* **Persona J — Rama: `feature/valoraciones`:**
  * Funcionalidad 2: Historial, valoraciones y comentarios públicos.
* **Persona S — Rama: `feature/certificados`:**
  * Funcionalidad 3: Control de asistencia por sesión y emisión de certificados.

> ⚠️ **Para agentes de IA y desarrolladores:** Leer obligatoriamente el archivo [`AGENTS.md`](./AGENTS.md) antes de escribir código.

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

## 🛠️ Guía Rápida para J y S al Clonar el Repositorio

1. **Clonar y sacar tu rama de trabajo:**
   ```bash
   git clone <URL_DEL_REPO>
   cd Kooler
   
   # Si eres la Persona J:
   git checkout -b feature/valoraciones
   
   # Si eres la Persona S:
   git checkout -b feature/certificados
   ```

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
| `POST` | `/api/auth/register` | Público | Registro de usuarios (por defecto asigna rol ESTUDIANTE). |
| `POST` | `/api/auth/login` | Público | Inicio de sesión, devuelve token JWT y datos de rol. |
| `GET` | `/api/auth/profile` | Autenticado | Devuelve los datos del usuario conectado según su token JWT. |

### 📅 Actividades (`/api/activities`) *(En desarrollo por Persona N)*
| Método | Endpoint | Rol permitido | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/activities` | Público / Autenticado | Listado de actividades con filtros (estado, categoría). |
| `GET` | `/api/activities/:id` | Público / Autenticado | Detalle de la actividad con cupos disponibles calculados. |
| `POST` | `/api/activities` | ORGANIZADOR | Crear una nueva actividad de bienestar. |
| `PATCH` | `/api/activities/:id` | ORGANIZADOR (Dueño) | Modificar datos de una actividad existente. |
| `DELETE` | `/api/activities/:id` | ORGANIZADOR (Dueño) | Cancelar una actividad (cambia su estado a CANCELLED). |
| `POST` | `/api/activities/:id/enroll` | ESTUDIANTE | Inscribirse a una actividad (valida cupos, fecha y duplicados). |
| `GET` | `/api/activities/:id/enrollments` | ORGANIZADOR (Dueño) | Ver la lista de estudiantes inscritos a su actividad. |

### ⭐ Valoraciones y Reseñas (`/api/reviews`) *(Responsable: Persona J)*
*(Documentar aquí los endpoints creados por J: consultar reseñas públicas y calificar actividad finalizada).*

### 📜 Certificados y Asistencia (`/api/certificates`) *(Responsable: Persona S)*
*(Documentar aquí los endpoints creados por S: registrar asistencia y consultar/descargar certificado).*

---

## 🧪 Pruebas Automatizadas
```bash
cd backend
npm test
```

## 📝 Registro de Uso de IA
Ver detalles en el archivo obligatorio [`AI_USAGE.md`](./AI_USAGE.md).
