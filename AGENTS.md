# 🤖 Protocolo Obligatorio para Agentes de Inteligencia Artificial — Proyecto Kooler

Este archivo define las **reglas de oro, contratos de datos, restricciones arquitectónicas y estándar de commits** para cualquier agente de IA (Antigravity, Cursor, Copilot, Claude, ChatGPT, etc.) que asista a los integrantes **N (Nico), J o S** en este repositorio.

Cualquier agente que modifique código DEBE leer y respetar estas reglas para evitar conflictos de merge, roturas de código o inconsistencias en la sustentación.

---

## 📌 1. Reparto Estricto de Responsabilidades
* **Persona N (Nico) — Rama: `feature/actividades`:**
  * Base del backend (Setup, Docker, Auth, Roles, Seeds).
  * Funcionalidad 1: Gestión de actividades (`ActivityEntity`) e inscripciones (`EnrollmentEntity`).
* **Persona J — Rama: `feature/valoraciones`:**
  * Funcionalidad 2: Reseñas y calificaciones (`ReviewEntity`).
  * Endpoints públicos de lectura de reseñas y creación por estudiantes que hayan participado.
  * REGLA: El organizador NO puede editar ni eliminar reseñas de estudiantes.
* **Persona S — Rama: `feature/certificados`:**
  * Funcionalidad 3: Control de asistencia (`AttendanceEntity`) y certificados (`CertificateEntity`).
  * Cálculo del porcentaje de asistencia y emisión de código único de certificado.

---

## 📝 2. Estándar Obligatorio de Mensajes de Commit (Conventional Commits)
Todos los commits generados por desarrolladores o agentes de IA deben seguir estrictamente esta estructura:

```
<tipo>(<alcance>): <descripción corta en minúsculas y modo imperativo>
```

### Tipos Permitidos:
* **`feat`**: Nueva funcionalidad para el usuario.
* **`fix`**: Corrección de un error o bug.
* **`docs`**: Modificaciones en documentación (`README.md`, `AI_USAGE.md`, etc.).
* **`test`**: Creación o actualización de pruebas automatizadas.
* **`refactor`**: Reestructuración de código sin cambiar su comportamiento externo.
* **`chore`**: Tareas de configuración, Docker, dependencias o tooling.

### Alcances (`scope`) por Integrante:
* **Persona N:** `feat(base)`, `feat(auth)`, `feat(actividades)`, `feat(inscripciones)`
* **Persona J:** `feat(valoraciones)`, `feat(comentarios)`, `feat(historial)`
* **Persona S:** `feat(certificados)`, `feat(asistencia)`
* **Generales:** `chore(docker)`, `chore(deps)`, `docs(readme)`, `test(auth)`

### Ejemplos Válidos:
* `feat(actividades): agregar endpoint para crear actividad con validacion de cupo`
* `feat(valoraciones): implementar endpoint publico de consulta de resenas`
* `feat(certificados): calcular porcentaje de asistencia y generar codigo unico`
* `test(inscripciones): agregar prueba unitaria para validar que no exceda capacity`
* `docs(readme): registrar nuevos endpoints del modulo de asistencia`

> ❌ **Prohibidos commits vagos como:** *"cambios"*, *"fix"*, *"actualización"*, *"subiendo avances"*.

---

## 🎯 3. Alcance y Límites por Entrega (Milestones)

Los agentes NO deben implementar funcionalidades que pertenezcan a entregas posteriores. Respetar este límite:

| Entrega | Peso | Alcance Backend & Requisitos | Límite Estricto (NO hacer) |
| :--- | :--- | :--- | :--- |
| **D1 (Superada)** | — | Requerimientos, modelo de 9 entidades y arquitectura inicial. | No aplica. |
| **D2 (Actual)** | **10%** | • Backend funcional con las 3 funcionalidades base.<br>• PostgreSQL 17 en Docker y TypeORM.<br>• Auth JWT + Passport + Bcrypt + RolesGuard.<br>• DTOs, validaciones con class-validator.<br>• Interceptor de logging justificado.<br>• Al menos 1 prueba de servicio y 1 de integración.<br>• Colección Postman funcional.<br>• Semillas demo (1 estudiante, 1 organizador).<br>• Frontend Next.js con pantallas representativas.<br>• Backend desplegado con URL pública. | **NO implementar:**<br>❌ Pasarelas de pago ni cobranzas.<br>❌ Manejo complejo de archivos en AWS S3 (usar URLs directas).<br>❌ WebSockets en tiempo real innecesarios.<br>❌ Control de reservas de salones o logística institucional. |
| **D3** | — | Integración profunda frontend-backend, flujos interactivos completos, feedback de errores y carga en Next.js, suite de pruebas ampliada. | No adelantar antes de validar D2. |
| **DF (Final)** | **20%+** | Sistema desplegado de punta a punta, 100% responsivo, sin fallos de concurrencia, 0 secretos expuestos, dominio del código en sustentación oral. | Pulido final de producto. |

---

## 🚫 4. Lo que los Agentes NUNCA deben hacer
1. **NO modificar entidades existentes sin necesidad:**
   * `UserEntity`, `RoleEntity` y `ActivityEntity` son la base común. Si necesitas relacionarlas con tu nueva entidad, usa decoradores `@ManyToOne` en TU entidad sin alterar destructivamente las columnas existentes.
2. **NO cambiar las convenciones de nombres:**
   * Base de datos: minúsculas con snake_case (`id_user`, `start_time`, `registration_deadline`).
   * Clases y TypeScript: PascalCase con sufijo `Entity` (`ActivityEntity`, `EnrollmentEntity`) y propiedades en camelCase (`startTime`, `registrationDeadline`).
   * Rutas REST: en inglés y plural con prefijo global `/api` (`/api/activities`, `/api/reviews`, `/api/certificates`).
3. **NO romper `app.module.ts`:**
   * Al agregar un nuevo módulo (`ReviewsModule`, `CertificatesModule`), agrégalo al arreglo `imports` sin eliminar los módulos existentes.
4. **NO subir secretos:**
   * NUNCA hardcodear contraseñas ni llaves en el código. Usar `ConfigService.get(...)` y documentar nuevas variables en `.env.example`.
5. **NO inventar tecnologías fuera de la rúbrica:**
   * Prohibido meter GraphQL, microservicios o librerías raras que no se puedan defender en la sustentación oral.

---

## 📋 5. Regla de Actualización Obligatoria de Documentación
Cada vez que un agente de IA cree o modifique un endpoint o entidad, **TIENE LA OBLIGACIÓN DE:**
1. **Actualizar `README.md`:**
   * Agregar la nueva entidad en la sección del Modelo de Datos.
   * Documentar el nuevo endpoint (Método HTTP, Ruta, Rol requerido y qué hace).
2. **Actualizar `AI_USAGE.md`:**
   * Añadir una entrada con el integrante, tarea realizada y verificación (exigido por el 10% de la nota de D2).
3. **Verificar antes de hacer commit:**
   * Ejecutar `npm run build` (debe compilar con 0 errores).
   * Ejecutar `npm test` (todas las pruebas deben pasar).
