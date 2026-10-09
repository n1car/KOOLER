# Plan de trabajo — Entrega D2 (Kooler)

**Fecha:** 6 de octubre de 2026  
**Preparado por:** Nico  
**Equipo:** 
* **N:** Template base + Gestión y participación
* **J:** Historial, valoración y comentarios
* **S:** Certificación por asistencia

**Peso de D2 en la nota del curso:** 10%  
**Tiempo disponible estimado:** 1.5–2 semanas  

---

## 1. Visión general del reparto

La idea central: nadie espera a nadie más de lo necesario[cite: 6]. N arma un "esqueleto" inicial del backend (setup + autenticación + la entidad central Actividad) y lo sube a `main` el primer día o día y medio[cite: 6]. A partir de ahí, los 3 trabajan en paralelo, cada uno en su propia rama, sincronizando con `git pull`/`push` frecuentes — no se turnan por días, todos avanzan al mismo tiempo[cite: 6].

| Persona | Responsabilidad principal | Funcionalidad que lidera |
| :--- | :--- | :--- |
| **N** | Template base del proyecto (setup, Docker, autenticación) | 1. Gestión y participación en actividades[cite: 6] |
| **J** | — | 2. Historial, valoración y comentarios[cite: 6] |
| **S** | — | 3. Certificación por asistencia[cite: 6] |

Cada uno construye su funcionalidad de punta a punta: su entidad, su service, su controller, sus pruebas, y su pantalla de frontend correspondiente[cite: 6]. Así nadie depende de que otro termine su backend para avanzar en el suyo[cite: 6].

---

## 2. Persona N — Template base + Gestión y participación en actividades

### Parte A: Template base (día 1–1.5)
* Proyecto NestJS creado y corriendo localmente[cite: 6].
* Conexión a la base de datos (PostgreSQL) usando TypeORM[cite: 6].
* `docker-compose.yml` que levante backend + base de datos con un solo comando[cite: 6].
* `.env.example` con las variables necesarias, sin datos reales[cite: 6].
* `AuthModule` completo: registro, login con JWT, hash de contraseñas (bcrypt), `RolesGuard` genérico reutilizable[cite: 6].
* Entidad Actividad (`id`, `nombre`, `descripcion`, `horario`, `lugar`, `categoria`, `cupoMaximo`, `estado`, `organizadorId`, `esCertificable`, `porcentajeMinimoAsistencia`)[cite: 6].
* 👉 Apenas esto esté en `main`, N avisa al grupo para que J y S hagan `git pull`[cite: 6].

### Parte B: Funcionalidad 1 — Gestión y participación
* **Backend:**
  * Entidad Inscripcion[cite: 6].
  * Endpoints `POST`/`PATCH`/`DELETE` `/actividades`, `GET` `/actividades`, `GET` `/actividades/:id`[cite: 6].
  * Endpoint `POST` `/actividades/:id/inscripciones` — valida cupo, duplicados y estado activo[cite: 6].
  * Endpoint `GET` `/actividades/:id/inscritos` — solo visible para el organizador dueño[cite: 6].
  * Al menos 1 prueba de servicio[cite: 6].
* **Frontend:**
  * Listado con filtros, detalle con inscripción, confirmación, creación/edición (organizador), dashboard organizador[cite: 6].

---

## 3. Persona J — Historial, valoración y comentarios

> ⚠️ **Retroalimentación del profesor:** las reseñas son públicas, visibles para todos los estudiantes, no solo el organizador[cite: 6].

* **Backend:**
  * Entidad Valoracion (puntaje 1–5, comentario)[cite: 6].
  * Endpoints de calificar, consultar público, vista organizador, historial del estudiante[cite: 6].
  * Al menos 1 prueba de servicio[cite: 6].
* **Frontend:**
  * Historial personal, sección de reseñas en detalle de actividad, formulario de calificar, panel organizador[cite: 6].
* **Nota:** el organizador no puede editar ni eliminar comentarios de estudiantes[cite: 6].

---

## 4. Persona S — Certificación por asistencia

* **Backend:**
  * Entidad Certificado + registro de asistencia por sesión[cite: 6].
  * Endpoints de registrar asistencia y consultar certificado propio[cite: 6].
  * Cálculo automático del % de asistencia cumplido al finalizar la actividad[cite: 6].
  * Al menos 1 prueba de servicio[cite: 6].
* **Frontend:**
  * Registro de asistencia (organizador), pantalla "mi certificado" (estudiante)[cite: 6].

---

## 5. Flujo de trabajo con Git (ramas)

* **Antes de empezar cada día:** todos hacen `git pull` de `main` hacia su propia rama[cite: 6].
* **Ramas por persona:** `feature/actividades` (N), `feature/valoraciones` (J), `feature/certificados` (S)[cite: 6].
* **Mergear seguido:** push y merge a `main` apenas haya algo funcional. Recomendado: cada 2–3 días máximo[cite: 6].
* **Evitar conflictos en `app.module.ts`:** avisar en el chat antes de tocarlo, o usar Pull Requests[cite: 6].
* **"Contrato de nombres":** postear campos y endpoints exactos al definirlos[cite: 6].
* **Probar que compila:** después de cada merge, no dejarlo para el final[cite: 6].

---

## 6. Checklist completo de D2

### Backend
* [ ] Las tres funcionalidades cuentan con soporte funcional en el backend[cite: 6].
* [ ] Los datos se almacenan en una base de datos (TypeORM)[cite: 6].
* [ ] La autenticación funciona (JWT + Passport)[cite: 6].
* [ ] La autorización se verifica en el backend — no basta con ocultar un botón en el frontend[cite: 6].
* [ ] Los datos de entrada se validan (DTOs, pipes, validators)[cite: 6].
* [ ] Existen pruebas automatizadas relevantes, incluida al menos 1 de integración[cite: 6].
* [ ] La colección de Postman permite comprobar los flujos[cite: 6].
* [ ] Docker permite reproducir el entorno, sin secretos en el repo[cite: 6].
* [ ] El backend está desplegado y accesible[cite: 6].

### Frontend
* [ ] Proyecto Next.js organizado, con layout/navegación/estilos base[cite: 6].
* [ ] Pantallas de autenticación (login/registro)[cite: 6].
* [ ] Pantalla principal o dashboard[cite: 6].
* [ ] Al menos una pantalla representativa de cada funcionalidad[cite: 6].
* [ ] Correspondencia visible con el prototipo de Figma[cite: 6].

### Documentación
* [ ] `README.md` actualizado[cite: 6].
* [ ] Diagrama de arquitectura actualizado[cite: 6].
* [ ] Modelo de base de datos actualizado (entidad de comentarios/reseñas ajustada)[cite: 6].
* [ ] Instrucciones de instalación y ejecución[cite: 6].
* [ ] URL del backend desplegado[cite: 6].
* [ ] Credenciales de demostración (un estudiante y un organizador)[cite: 6].
* [ ] `AI_USAGE.md` actualizado si usaron un agente de IA[cite: 6].

### Sustentación
* [ ] Demostrar la API funcionando en vivo[cite: 6].
* [ ] Poder recorrer la arquitectura y explicar decisiones[cite: 6].
* [ ] Cualquier integrante puede ser consultado sobre cualquier parte del código[cite: 6].

---

## 7. Cronograma sugerido (10–13 días)

| Día | N | J | S |
| :--- | :--- | :--- | :--- |
| **1–1.5** | Template base → push a main | Figma/frontend con datos temporales | Figma/frontend con datos temporales[cite: 6] |
| **2–8** | Backend + frontend de Gestión y participación | Backend + frontend de Historial y comentarios | Backend + frontend de Certificación[cite: 6] |
| **9–10** | Merge final de las 3 ramas a main | Merge final de las 3 ramas a main | Merge final de las 3 ramas a main[cite: 6] |
| **10–11** | Postman conjunto + integración cruzada | Postman conjunto + integración cruzada | Postman conjunto + integración cruzada[cite: 6] |
| **11–12** | Deploy + Docker verificado | Deploy + Docker verificado | Deploy + Docker verificado[cite: 6] |
| **12–13** | Documentación final + ensayo de sustentación | Documentación final + ensayo de sustentación | Documentación final + ensayo de sustentación[cite: 6] |

---

## 8. Documentación y despliegue final

* **Despliegue:** backend integrado en Railway/Render, URL pública verificada[cite: 6].
* **Docker:** `docker-compose up` levanta todo desde cero[cite: 6].
* **README:** instalación, variables de entorno, pruebas, URL, credenciales demo[cite: 6].
* **Diagramas:** arquitectura y BD actualizados, incluida la entidad de comentarios/reseñas[cite: 6].
* **Antes de sustentar:** ronda rápida donde cada uno explica el módulo de los otros dos[cite: 6].

---

## 9. Pendiente: comentarios y reseñas públicas

### Documento de base de datos — sección 4
* **4.5 Restricciones relevantes, agregar:**
  * Las valoraciones y comentarios de `REVIEW` son visibles para cualquier estudiante en el detalle de la actividad, no solo para el organizador[cite: 6].
  * El organizador no puede editar ni eliminar comentarios de estudiantes[cite: 6].
* **4.7 Soporte de funcionalidades:**
  * Reemplazar el párrafo de `REVIEW` por: *"REVIEW almacena las calificaciones y comentarios de los estudiantes, visibles públicamente en el detalle de cada actividad."*[cite: 6]

### Figma — 3 pantallas
1. **Detalle de actividad (vista estudiante):** agregar sección "Reseñas" con promedio, número de reseñas y comentarios con nombre y fecha[cite: 6].
2. **Retroalimentación (vista organizador):** agregar el texto del comentario debajo de cada estrella/fecha[cite: 6].
3. **Mi historial (vista estudiante):** agregar modal "Calificar actividad" (estrellas 1-5 + comentario + enviar). No existe todavía[cite: 6].

**Responsable:** Persona J (Historial, valoración y comentarios)[cite: 6].