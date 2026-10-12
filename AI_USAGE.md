# Registro de Uso de Inteligencia Artificial — Proyecto Kooler

Este documento registra de forma transparente y estructurada el apoyo recibido mediante herramientas de Inteligencia Artificial para el proyecto Kooler, en estricto cumplimiento de las políticas académicas del curso.

---

## Registro de uso de IA — Entrega D2 (Template Base)
- **Integrante:** Nico (Persona N)
- **Herramienta:** Google Antigravity / Gemini 3.8
- **Tarea:** Configuración inicial del proyecto NestJS, Docker Compose con PostgreSQL, TypeORM, arquitectura base, módulo de autenticación (JWT, bcrypt, RolesGuard) y entidades fundamentales.
- **Propósito:** Acelerar el setup del template base para permitir que los integrantes J y S inicien sus funcionalidades en ramas paralelas sin bloqueos, asegurando concordancia con el repositorio de referencia de la clase.
- **Descripción de la consulta o prompt:** "Contexto del proyecto Kooler: necesito ayuda para construir la base (Persona N). Explícame en español sencillo qué hace cada cosa y por qué... Revisa el repositorio de clase y el plan de trabajo".
- **Resultado utilizado:**
  - Estructura modular de NestJS (`users`, `roles`, `auth`, `activities`, `database`).
  - Configuración de `compose.yaml` para PostgreSQL 17 en el puerto 5433 (igual a la clase).
  - `RolesGuard` genérico y decorador `@Roles()`.
  - Módulo de autenticación con hash bcrypt y JWT.
  - `LoggingInterceptor` para trazabilidad y medición de tiempos de respuesta HTTP.
  - Seed inicial para carga automática de roles y usuarios demo.
- **Cambios realizados por el equipo:**
  - Adaptación de nombres de columnas y entidades según el modelo de datos oficial (9 entidades).
  - Configuración de variables de entorno seguras en `.env.example`.
  - Revisión y ajuste de las pruebas unitarias para Vitest.
- **Forma de verificación:**
  - Ejecución de `npm run build` (compilación exitosa en TypeScript sin errores).
  - Ejecución de pruebas unitarias automatizadas (`npm test`) pasando al 100%.
  - Verificación de consistencia del modelo de datos frente al documento aprobado de base de datos.

## Registro de uso de IA — Revisión de asistencia
- **Integrante:** Samuel (Persona S)
- **Herramienta:** GitHub Copilot
- **Orientación de GitHub Copilot:** Análisis de la estructura del módulo, convenciones existentes, validaciones disponibles y estrategia de pruebas para asistencia.
- **Ayuda de GitHub Copilot en la implementación:** Apoyo para crear `AttendanceModule`, `AttendanceService` y sus pruebas unitarias, e integrar el módulo en `AppModule`. No se implementaron endpoints, guards de autorización ni validación de inscripciones.
- **Verificación:** `npm run build` compiló correctamente; las pruebas focalizadas de asistencia pasaron con 8 pruebas y `npm test` pasó con 11 pruebas en 3 archivos. `git diff --check` no reportó errores.
