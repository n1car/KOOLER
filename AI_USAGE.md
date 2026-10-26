# Registro de Uso de Inteligencia Artificial — Proyecto Kooler

Registro breve del apoyo puntual recibido con herramientas de IA, en cumplimiento de las políticas académicas del curso.

---

## D2 — Backend base (Nico)
- **Herramienta:** Google Antigravity / Gemini.
- **Uso:** setup de NestJS, Docker/PostgreSQL, autenticación (JWT, bcrypt, RolesGuard) y entidades base.
- **Verificación:** `npm run build` y `npm test` en verde.

## D2 — Funcionalidad 1: actividades e inscripciones (Nico)
- **Herramienta:** Google Antigravity / Gemini.
- **Uso:** `EnrollmentEntity`, CRUD de actividades, control de cupos y concurrencia, pruebas unitarias.
- **Verificación:** `npm test` y `npm run test:e2e` en verde.

## D2 — Seguridad y reglas de negocio (Nico)
- **Herramienta:** OpenCode.
- **Uso:** revisión contra la rúbrica: rol en el registro, filtros, tope de cupos, concurrencia de inscripción y log de errores.
- **Verificación:** `npm test`, `npm run test:e2e` y smoke HTTP en verde.

## D2 — Sincronía de ramas y colección Postman (Nico)
- **Herramienta:** OpenCode.
- **Uso:** igualar `feature/actividades` con `dev` y validar la colección Postman.
- **Verificación:** ramas iguales y 11 requests ejecutados en verde.

## Asistencia (Samuel)
- **Herramienta:** GitHub Copilot.
- **Uso:** apoyo puntual para el módulo de asistencia y sus pruebas.
- **Verificación:** `npm run build` y `npm test` en verde.

## Autenticación por roles (Samuel)
- **Herramienta:** GitHub Copilot.
- **Uso:** apoyo puntual para el guard de roles y sus pruebas.
- **Verificación:** `npm test` y e2e de autorización en verde.

## Registro de asistencia (Samuel)
- **Herramienta:** GitHub Copilot.
- **Uso:** apoyo puntual para el endpoint de registro de asistencia y sus pruebas.
- **Verificación:** `npm test`, e2e y `npm run build` en verde.

## Asistencia por sesión (Samuel)
- **Herramienta:** GitHub Copilot.
- **Uso:** apoyo puntual para relacionar la asistencia con sesiones y ajustar pruebas.
- **Verificación:** `npm test`, `npm run build` y `git diff --check` en verde.

## Infraestructura de certificados (Samuel)
- **Herramienta:** GitHub Copilot.
- **Uso:** apoyo puntual para la entidad, el módulo y la consulta de certificados.
- **Verificación:** `npm test`, e2e y `npm run build` en verde.

## Elegibilidad y emisión de certificados (Samuel)
- **Herramienta:** GitHub Copilot.
- **Uso:** apoyo puntual para el cálculo de elegibilidad (80 %) y la emisión idempotente.
- **Verificación:** `npm test`, `npm run test:e2e` y `npm run build` en verde.

## Finalización automática y descarga PDF (Samuel)
- **Herramienta:** GitHub Copilot.
- **Uso:** apoyo puntual para la finalización programada de actividades y la descarga de certificados en PDF.
- **Verificación:** `npm test`, `npm run test:e2e` y `npm run build` en verde.

## Integración D2 en `dev` (Nico)
- **Herramienta:** OpenCode.
- **Uso:** apoyo puntual para integrar las 3 funcionalidades, resolver conflictos y unificar la seguridad.
- **Verificación:** `npm test`, `npm run test:e2e` y smoke HTTP contra PostgreSQL.

## Catálogos y soporte de frontend (Nico)
- **Herramienta:** OpenCode.
- **Uso:** apoyo puntual para `LOCATION`/`ACTIVITY_TYPE`, lectura de asistencia y corrección de gaps de flujo.
- **Verificación:** `npm run build`, `npm test`, `npm run test:e2e` y smoke en verde.

## Frontend Next.js para D2 (Nico)
- **Herramienta:** OpenCode.
- **Uso:** apoyo puntual para construir el frontend (layout, navegación, estilos y pantallas) con datos temporales.
- **Verificación:** `npm run lint` y `npm run build` en verde.

## Pulido visual y versión responsive para PC (Nico)
- **Herramienta:** OpenCode.
- **Uso:** apoyo puntual para el pulido visual de las pantallas de actividades y su versión responsive.
- **Verificación:** `npm run lint` y `npm run build` en verde.

## Orientación y validación visual D2 (Samuel)
- **Herramienta:** GitHub Copilot.
- **Uso:** revisión de requerimientos y plan de trabajo; orientación y validación visual de Mi Progreso / Mi Certificado y Registro de asistencia, dentro del alcance D2 y sin integración con backend ni autenticación.
- **Verificación:** `git diff --check` en verde; lint y build no ejecutados por ausencia de dependencias locales.

## Endpoint de salud y configuración por entorno (Jhon)
- **Herramienta:** OpenCode.
- **Uso:** apoyo puntual para `GET /api/health`, la validación de variables al arrancar y la eliminación del secreto JWT por defecto.
- **Verificación:** `npm run build`, `npm test` (76/76), `npm run test:e2e` (30/30) y `npm run smoke` (27/27) en verde.

## Blueprint de despliegue y colección Postman (Jhon)
- **Herramienta:** OpenCode.
- **Uso:** apoyo puntual para `render.yaml`, la captura automática de tokens en Postman y la corrección de sus aserciones.
- **Verificación:** `npx newman run Kooler-D2.postman_collection.json` con 23 requests y 46 aserciones en verde.
