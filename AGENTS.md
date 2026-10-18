# 🤖 Protocolo Obligatorio para Agentes de Inteligencia Artificial — Proyecto Kooler

Este archivo define las **reglas de oro, contratos de datos, restricciones arquitectónicas, estándar de commits y límites de entregas** para cualquier agente de IA (Antigravity, Cursor, Copilot, Claude, ChatGPT, etc.) que asista a los integrantes **Nico (N), Jhon (J) o Samuel (S)** en este repositorio.

Cualquier agente que modifique código DEBE leer y respetar estas reglas para evitar conflictos de merge, roturas de código o penalizaciones en la rúbrica del curso.

---

## 📁 1. Estructura de Documentación del Repositorio
Toda la documentación conceptual, requerimientos y rúbricas del proyecto se encuentra centralizada en la carpeta [`docs/`](./docs):
* [`docs/Requerimientos.md`](./docs/Requerimientos.md) — Requerimientos funcionales y no funcionales.
* [`docs/Diseño base de datos.md`](./docs/Diseño%20base%20de%20datos.md) — Modelo oficial de 9 entidades, atributos y restricciones.
* [`docs/Arquitectura inicial.md`](./docs/Arquitectura%20inicial.md) — Diagrama y decisiones técnicas.
* [`docs/Funcionalidades.md`](./docs/Funcionalidades.md) — Detalle de las 3 funcionalidades.
* [`docs/Plan de trabajo.md`](./docs/Plan%20de%20trabajo.md) — Reparto de tareas y cronograma.
* [`docs/Modulos de diseño.md`](./docs/Modulos%20de%20diseño.md) — Tokens de diseño, pantallas, estados y reglas de UI del frontend (Figma "BU").
* [`docs/Problematica.md`](./docs/Problematica.md) — Problemática y justificación del proyecto.
* [`docs/Taller y rubrica del proyecto.md`](./docs/Taller%20y%20rubrica%20del%20proyecto.md) — Criterios de evaluación oficiales.

---

## 🌿 Estrategia de Ramas (`main` y `dev`)
* **`main`**: Rama protegida para entrega final.
* **`dev`**: Rama base común e integración continua. Todas las ramas `feature/*` deben crearse a partir de `dev` y hacer merge hacia `dev`.
* **Prohibido:** Hacer merge directo de una rama `feature/*` a `main`.
* **Avisar antes de subir a `dev`:** nadie hace push/merge a `dev` sin anunciarlo antes en el chat del equipo (qué rama, qué cambia, qué archivos toca). Así se evita que dos integrantes suban a la vez y choquen en `app.module.ts` u otros archivos compartidos.

---

## 📌 2. Reparto Estricto de Responsabilidades
* **Persona N (Nico) — Rama: `feature/actividades`:**
  * Base del backend (Setup, Docker, Auth, Roles, Seeds).
  * Funcionalidad 1: Gestión de actividades (`ActivityEntity`) e inscripciones (`EnrollmentEntity`).
  * Catálogos de apoyo: categorías (`ActivityTypeEntity`) y ubicaciones (`LocationEntity`) exigidos por RF03/RF06.
  * **Frontend:** Inicio (Bienvenida, pantalla oscura), Home del estudiante (listado + filtros + inscripción), Mis Inscripciones, Detalle de actividad, panel **Mis Actividades** del organizador, Detalle admin y Crear/editar actividad.
* **Persona J (Jhon) — Rama: `feature/valoraciones`:**
  * Funcionalidad 2: Reseñas y calificaciones (`ReviewEntity`).
  * Endpoints públicos de lectura de reseñas y creación por estudiantes que hayan participado.
  * REGLA: El organizador NO puede editar ni eliminar reseñas de estudiantes.
  * **Frontend:** **Registro, Login y Cuenta creada** (pantallas de autenticación asignadas a J para descargar a N), Historial personal, Valoraciones (5 estrellas + comentario) y Retroalimentación (vista organizador).
* **Persona S (Samuel) — Rama: `feature/certificados`:**
  * Funcionalidad 3: Control de asistencia (`AttendanceEntity`) y certificados (`CertificateEntity`).
  * Cálculo del porcentaje de asistencia y emisión de código único de certificado.
  * **Frontend:** Control de Asistencia (organizador) y Mi Progreso / Mi Certificado (estudiante).

> **Nota de reparto frontend (acordado 2026-10-17):** las pantallas de **Registro, Login y Cuenta creada** pasan de N a **J** porque N quedó muy cargado. La pantalla de **Inicio/Bienvenida (oscura)** permanece con **N** (es su puerta de entrada al flujo de actividades).

---

## 📝 3. Estándar de Commits y Límite Máximo por Persona

Para asegurar un historial de Git limpio, legible y profesional ante la revisión del profesor:

### Formato Obligatorio:
```
<tipo>(<alcance>): <descripción concisa en minúsculas y modo imperativo>
```

### Límites Máximos de Commits por Integrante:
| Hito / Entrega | Límite Máximo por Persona | Rango Recomendado | Justificación |
| :--- | :--- | :--- | :--- |
| **D2 (Actual - 10%)** | **Máximo 20 commits** | **10 a 18 commits** | Commits atómicos y significativos. Evitar micro-commits de 1 línea. |
| **D3** | **Máximo 15 commits** | **8 a 12 commits** | Enfoque en integración front-back y pulido. |
| **DF (Final - 20%+)** | **Máximo 10 commits** | **5 a 8 commits** | Pruebas finales, corrección de bugs y deploy. |

> ⚠️ **REGLA DE ORO:** Los agentes NO deben hacer commit por cada pequeño archivo o coma modificada. Se agrupan cambios lógicos completos (ej: crear entidad + servicio + controlador en un único commit `feat`).

### Tipos Permitidos:
* **`feat`**: Nueva funcionalidad.
* **`fix`**: Corrección de bug.
* **`docs`**: Documentación (`README.md`, `AI_USAGE.md`).
* **`test`**: Pruebas automatizadas.
* **`refactor`**: Limpieza o reestructuración sin cambio funcional.
* **`chore`**: Tooling, dependencias o configuración Docker.

### Alcances (`scope`) por Integrante:
* **Nico (N):** `feat(base)`, `feat(auth)`, `feat(actividades)`, `feat(inscripciones)`
* **Jhon (J):** `feat(valoraciones)`, `feat(comentarios)`, `feat(historial)`
* **Samuel (S):** `feat(certificados)`, `feat(asistencia)`
* **Generales:** `chore(docker)`, `docs(readme)`, `test(auth)`

---

## 🎯 4. Alcance y Límites por Entrega (Milestones)

| Entrega | Peso | Alcance Backend & Requisitos | Límite Estricto (NO hacer) |
| :--- | :--- | :--- | :--- |
| **D1 (Superada)** | — | Requerimientos, modelo de 9 entidades y arquitectura inicial. | No aplica. |
| **D2 (Actual)** | **10%** | • Backend funcional con las 3 funcionalidades base.<br>• PostgreSQL 17 en Docker y TypeORM.<br>• Auth JWT + Passport + Bcrypt + RolesGuard.<br>• DTOs, validaciones con class-validator.<br>• Interceptor de logging justificado.<br>• Al menos 1 prueba de servicio y 1 de integración.<br>• Colección Postman funcional.<br>• Semillas demo (1 estudiante, 1 organizador).<br>• Frontend Next.js con pantallas representativas.<br>• Backend desplegado con URL pública. | **NO implementar:**<br>❌ Pasarelas de pago ni cobranzas.<br>❌ Manejo complejo de archivos en AWS S3.<br>❌ WebSockets en tiempo real innecesarios.<br>❌ Control de reservas de salones o logística institucional. |
| **D3** | — | Integración profunda frontend-backend, flujos interactivos completos, feedback de errores y carga en Next.js, suite de pruebas ampliada. | No adelantar antes de validar D2. |
| **DF (Final)** | **20%+** | Sistema desplegado de punta a punta, 100% responsivo, sin fallos de concurrencia, 0 secretos expuestos, dominio del código en sustentación oral. | Pulido final de producto. |

---

## 🚫 5. Restricciones Técnicas Inquebrantables
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
5. **Catálogos y decisiones de alcance fijadas:**
   * `LOCATION` (`id_location`, `name`, `building`) y `ACTIVITY_TYPE` (`id_type`, `name`, `requires_enrollment`) son parte del modelo oficial. Se consultan con `GET /api/activity-types` y `GET /api/locations`; `ACTIVITY` se relaciona con ambos de forma opcional (`activityTypeId`, `locationId`).
   * **Imágenes de actividad:** solo por URL (`ACTIVITY.image_url`). **NO** implementar subida de archivos binarios.
   * **Certificados:** el PDF se genera automáticamente en el backend (`pdfkit`); **NO** existe (ni debe agregarse) campo para subir una plantilla de certificado.
   * **Plataforma del frontend:** Next.js web mobile-first (la palabra "móvil" en `docs/Módulos de diseño.md` se interpreta como diseño mobile-first responsivo; RNF03 exige uso desde celular y computador).
   * **Lock pesimista:** en consultas con bloqueo (`pessimistic_write`) usar `loadEagerRelations: false` para evitar `FOR UPDATE` sobre `LEFT JOIN` (error Postgres `0A000`).

---

## 📋 6. Regla de Actualización Obligatoria de Documentación
Cada vez que un agente de IA cree o modifique un endpoint o entidad, **TIENE LA OBLIGACIÓN DE:**
1. **Actualizar `README.md`:**
   * Agregar la nueva entidad en el Modelo de Datos.
   * Documentar el nuevo endpoint (Método HTTP, Ruta, Rol requerido y qué hace).
2. **Actualizar `AI_USAGE.md`:**
   * Añadir una entrada con el integrante, tarea realizada y verificación (exigido por la rúbrica de D2).
3. **Verificar antes de hacer commit:**
   * Ejecutar `npm run build` (debe compilar con 0 errores).
   * Ejecutar `npm test` (todas las pruebas deben pasar).
