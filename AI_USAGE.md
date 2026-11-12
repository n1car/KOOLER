# Registro de Uso de Inteligencia Artificial — Proyecto Kooler

Este documento registra de forma general el apoyo recibido de herramientas de Inteligencia Artificial durante el proyecto Kooler, en cumplimiento de las políticas académicas del curso. La IA se usó como apoyo; el diseño, las decisiones técnicas y el código final fueron revisados, probados y adaptados por el equipo.

---

## Herramientas utilizadas

- **Google Antigravity / Gemini:** apoyo en la configuración inicial del proyecto.
- **OpenCode:** apoyo en la revisión de estándares, integración y validación del proyecto.
- **GitHub Copilot:** apoyo puntual en tareas de desarrollo del backend y del frontend.

---

## Registro por integrante

### Nico (N)

- **Herramientas:** Google Antigravity / Gemini, OpenCode.
- **Tareas de apoyo:**
  - Base del proyecto: estructura inicial del backend, configuración de Docker y de la base de datos.
  - Especificaciones y estándares del equipo (convenciones de nombres, organización por módulos).
  - Revisión de aspectos sistemáticos: llaves foráneas, restricciones y coherencia con el modelo de datos.
  - Integración de los módulos del equipo y apoyo en la base del frontend.
- **Verificación:** revisión manual del código, compilación y ejecución de pruebas antes de integrar cambios.

### Jhon (J)

- **Herramienta:** OpenCode.
- **Tareas de apoyo:**
  - Apoyo en aspectos sistemáticos de la configuración del backend (variables de entorno, validación al arranque).
  - Apoyo en la preparación del despliegue y de la colección de pruebas de la API.
- **Verificación:** compilación, pruebas automatizadas y validación de la colección de la API.

### Samuel (S)

- **Herramienta:** GitHub Copilot.
- **Tareas de apoyo:**
  - Apoyo en la especificación y en la estructura de los módulos de asistencia y certificados.
  - Apoyo en la implementación de algunos componentes del backend y del frontend.
  - Apoyo en la revisión de requerimientos y del plan de trabajo.
- **Verificación:** compilación, pruebas y revisión manual de cada cambio antes de integrarlo.

---

## Integración de F1 y sesión JWT en el frontend (Nico)

- **Herramienta:** OpenCode.
- **Uso:** apoyo puntual en el cliente API, el contexto de autenticación y la conexión de las pantallas de actividades.
- **Verificación:** `npm run lint` y `npm run build` (frontend) y `npm run build` + `npm test` (backend, 78 pruebas) en verde.

---

## Cliente API de F2/F3 (Nico)

- **Herramienta:** OpenCode.
- **Uso:** apoyo puntual para exponer en `frontend/src/lib/api.ts` los métodos y tipos de historial, reseñas, asistencia y certificados.
- **Verificación:** `npm run lint` y `npm run build` (frontend) en verde; smoke E2E de producción 27/27.

---

## Conexión de Render y Neon (Nico)

- **Herramienta:** OpenCode.
- **Uso:** apoyo puntual en `neon init/deploy`, soporte de `DATABASE_URL`/`DATABASE_URL_UNPOOLED` y verificación con smoke test.
- **Verificación:** `npm run build` (backend y frontend), `npm test` (81 pruebas), `npm run lint` y smoke E2E 27/27 contra Neon.

---

## Despliegue en Render de backend y frontend (Nico)

- **Herramienta:** Render CLI + OpenCode.
- **Uso:** apoyo puntual para crear `kooler-api-neon` y `kooler-web-neon` en la cuenta de Nico y verificar health/build.
- **Verificación:** `render deploys list` en `live`, `GET /api/health` → `database: up` y `GET /` → 200.

---

## Compromiso del equipo

- Todo resultado generado con IA fue revisado y comprendido por quien lo integró.
- No se compartieron contraseñas, tokens ni secretos con ninguna herramienta.
- Cada integrante puede explicar y modificar el código que aparece en el repositorio.

## Eliminación segura de actividades (Samuel)

- **Herramienta:** GitHub Copilot.
- **Uso:** apoyo puntual en el endpoint protegido y la confirmación de borrado permanente.
- **Verificación:** `npm test`, `npm run lint`, `npm run build` y `npx tsc --noEmit -p tsconfig.build.json` (en verde).
