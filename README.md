# Kooler — Plataforma de Bienestar Universitario

Kooler es una aplicación web mobile-first diseñada para centralizar, gestionar y certificar las actividades de bienestar estudiantil e institucional (Caso de estudio: Universidad Icesi).

---

## 👥 Equipo y Responsabilidades (Entrega D2)
* **N (Nico):** Template base del backend (Docker, Auth JWT, RolesGuard, Entidades base) y Funcionalidad 1 (Gestión y participación en actividades).
* **J:** Funcionalidad 2 (Historial, valoraciones y comentarios públicos).
* **S:** Funcionalidad 3 (Certificación y control de asistencia).

---

## 🚀 Arquitectura y Tecnologías
* **Backend:** NestJS 11 con TypeORM
* **Base de Datos:** PostgreSQL 17 (Docker)
* **Seguridad:** Autenticación JWT, contraseñas hasheadas con bcrypt, `RolesGuard` y `JwtAuthGuard`
* **Validación:** DTOs con `class-validator` y `class-transformer`
* **Auditoría:** `LoggingInterceptor` global para monitoreo de peticiones HTTP
* **Pruebas:** Vitest con pruebas unitarias de servicio

---

## 🛠️ Instrucciones de Ejecución Local

### 1. Requisitos previos
* Node.js v20+ o v24+
* Docker Desktop instalado y en ejecución

### 2. Base de Datos (Docker)
Para levantar la base de datos PostgreSQL aislada:
```bash
cd backend
docker compose up -d
```
*Nota: La base de datos corre en el puerto `5433` para evitar conflictos locales con instalaciones previas de Postgres.*

### 3. Configuración del Backend
Crear el archivo `.env` a partir del ejemplo:
```bash
cd backend
cp .env.example .env
```

Instalar dependencias y levantar el servidor en modo desarrollo:
```bash
npm install
npm run start:dev
```
El backend estará disponible en: `http://localhost:3000/api`

---

## 🔑 Credenciales de Demostración (Seed automático)
El backend cuenta con un seeder automático al iniciar la aplicación que crea los roles y los siguientes usuarios de prueba:

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| **Estudiante** | `estudiante@icesi.edu.co` | `Password123!` |
| **Organizador** | `organizador@icesi.edu.co` | `Password123!` |

---

## 🧪 Pruebas Automatizadas
Para ejecutar las pruebas unitarias:
```bash
cd backend
npm test
```

---

## 📡 Endpoints Base Disponibles
* `POST /api/auth/register` — Registro de usuario (asigna rol ESTUDIANTE por defecto).
* `POST /api/auth/login` — Inicio de sesión (retorna token JWT y datos de rol).
* `GET /api/auth/profile` — Consulta del perfil autenticado (requiere `Bearer <token>`).
