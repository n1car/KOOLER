# 🤖 Protocolo Obligatorio para Agentes de Inteligencia Artificial — Proyecto Kooler

Este archivo define las **reglas de oro, contratos de datos y restricciones arquitectónicas** para cualquier agente de IA (Antigravity, Cursor, Copilot, Claude, ChatGPT, etc.) que asista a los integrantes **N (Nico), J o S** en este repositorio.

Cualquier agente que modifique código DEBE leer y respetar estas reglas para evitar conflictos de merge, roturas de código o inconsistencias en la sustentación.

---

## 📌 1. Reparto Estricto de Responsabilidades
* **Persona N (Nico) — `feature/actividades`:**
  * Base del backend (Setup, Docker, Auth, Roles, Seeds).
  * Funcionalidad 1: Gestión de actividades (`ActivityEntity`) e inscripciones (`EnrollmentEntity`).
* **Persona J — `feature/valoraciones`:**
  * Funcionalidad 2: Reseñas y calificaciones (`ReviewEntity`).
  * Endpoints públicos de lectura de reseñas y creación por estudiantes que hayan participado.
  * REGLA: El organizador NO puede editar ni eliminar reseñas de estudiantes.
* **Persona S — `feature/certificados`:**
  * Funcionalidad 3: Control de asistencia (`AttendanceEntity`) y certificados (`CertificateEntity`).
  * Cálculo del porcentaje de asistencia y emisión de código único de certificado.

---

## 🚫 2. Lo que los Agentes NUNCA deben hacer
1. **NO modificar entidades existentes sin necesidad:**
   * `UserEntity`, `RoleEntity` y `ActivityEntity` son la base común. Si necesitas relacionarlas con tu nueva entidad, usa decoradores `@ManyToOne` en TU entidad sin alterar destructivamente las columnas existentes.
2. **NO cambiar las convenciones de nombres:**
   * Base de datos: minúsculas con snake_case (`id_user`, `start_time`, `registration_deadline`).
   * Clases y TypeScript: PascalCase con sufijo `Entity` (`ActivityEntity`, `EnrollmentEntity`) y propiedades en camelCase (`startTime`, `registrationDeadline`).
   * Rutas REST: en inglés y plural con prefijo global `/api` (`/api/activities`, `/api/reviews`, `/api/certificates`).
3. **NO romper `app.module.ts`:**
   * Al agregar un nuevo módulo (`ReviewsModule`, `CertificatesModule`), agrégalo al arreglo `imports` sin eliminar los módulos existentes (`AuthModule`, `UsersModule`, `ActivitiesModule`, `SeedModule`).
4. **NO subir secretos:**
   * NUNCA hardcodear contraseñas ni llaves en el código. Usar `ConfigService.get(...)` y documentar nuevas variables en `.env.example`.
5. **NO inventar tecnologías fuera de la rúbrica:**
   * Prohibido meter GraphQL, microservicios, librerías raras de S3 o dependencias no explicables en la sustentación oral.

---

## 📋 3. Regla de Actualización Obligatoria de Documentación
Cada vez que un agente de IA cree o modifique un endpoint o entidad, **TIENE LA OBLIGACIÓN DE:**
1. **Actualizar `README.md`:**
   * Agregar la nueva entidad en la sección del Modelo de Datos.
   * Documentar el nuevo endpoint (Método HTTP, Ruta, Rol requerido y qué hace).
2. **Actualizar `AI_USAGE.md`:**
   * Añadir una entrada con el integrante, tarea realizada y verificación (exigido por el 10% de la nota de D2).
3. **Verificar antes de hacer commit:**
   * Ejecutar `npm run build` (debe compilar con 0 errores).
   * Ejecutar `npm test` (todas las pruebas deben pasar).

---

## 🧩 4. Contrato de Datos Compartido

### Entidad Usuario (`users`)
* Clave primaria: `id_user` (propiedad: `id`)
* Campos: `firstName`, `lastName`, `email`, `role` (`RoleEntity`: 'ESTUDIANTE' | 'ORGANIZADOR')

### Entidad Actividad (`activities`)
* Clave primaria: `id_activity` (propiedad: `id`)
* Campos: `name`, `description`, `date`, `startTime`, `endTime`, `capacity`, `status` ('ACTIVE' | 'CANCELLED' | 'FINISHED'), `registrationDeadline`, `isCertifiable`, `minAttendancePercentage`, `imageUrl`, `organizer` (`UserEntity`).

---

## 🛡️ 5. Manejo de Autorización
* Toda ruta protegida debe usar:
  ```typescript
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZADOR') // o 'ESTUDIANTE'
  ```
* Para obtener el usuario autenticado en el controller, usar el decorador:
  ```typescript
  @CurrentUser() user: any
  ```
