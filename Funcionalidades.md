# Funcionalidades principales

## Funcionalidad 1: Consulta e inscripción a actividades
* **Usuario beneficiado:** estudiante.
* **Necesidad que resuelve:** encontrar en un solo lugar todas las actividades de Bienestar Universitario disponibles y poder inscribirse sin depender de canales dispersos.
* **Flujo principal:** el estudiante ingresa al listado/calendario de actividades → filtra por categoría, fecha o disponibilidad → selecciona una actividad para ver el detalle (horario, lugar, cupos disponibles) → se inscribe → recibe confirmación de inscripción.
* **Reglas de negocio:**
  * Cada actividad tiene un cupo máximo definido por el organizador, si se llena, no se permiten más inscripciones.
  * Un estudiante no puede inscribirse dos veces a la misma actividad.
  * Solo se pueden inscribir a actividades con estado "activa" (no canceladas ni ya finalizadas).
* **Información que utiliza o produce:** actividad (nombre, horario, lugar, categoría, cupo), inscripción (estudiante, actividad, fecha de inscripción).
* **Criterio para demostrar que funciona:** un estudiante puede ver el listado real de actividades, inscribirse a una con cupo disponible, y ver su inscripción reflejada tanto para él como para el organizador.

---

## Funcionalidad 2: Gestión de actividades (organizador)
* **Usuario beneficiado:** organizador/monitor/coordinador de Bienestar Universitario.
* **Necesidad que resuelve:** publicar y administrar sus actividades de forma centralizada, sin depender de carteleras o redes sociales, y tener visibilidad de quién se ha inscrito.
* **Flujo principal:** el organizador crea una actividad (nombre, descripción, horario, lugar, categoría, cupo máximo) → la publica → puede editarla mientras esté activa → puede cancelarla si es necesario → consulta en cualquier momento la lista de estudiantes inscritos.
* **Reglas de negocio:**
  * Solo el organizador dueño de la actividad (o un administrador) puede editarla o cancelarla.
  * Si se cancela una actividad, deja de estar disponible para nuevas inscripciones y los estudiantes ya inscritos deben poder verlo reflejado como "cancelada".
  * No se puede reducir el cupo máximo por debajo del número de inscritos actuales.
* **Información que utiliza o produce:** datos completos de la actividad, estado (activa/cancelada/finalizada), lista de estudiantes inscritos.
* **Criterio para demostrar que funciona:** un organizador puede crear una actividad de principio a fin, verla reflejada inmediatamente en el listado de los estudiantes, y consultar en todo momento quién se ha inscrito.

---

## Funcionalidad 3: Historial, valoración y certificación de actividades
* **Usuario beneficiado:** estudiante (consulta su historial, obtiene su certificado y deja su valoración) y organizador (registra asistencia y recibe retroalimentación).
* **Necesidad que resuelve:** el estudiante no tiene forma de recordar o consultar en qué actividades ha participado antes, ni de obtener una constancia de su participación, y el organizador no recibe ninguna retroalimentación sobre la calidad de sus actividades para mejorar futuras ediciones.
* **Flujo principal:** una vez que una actividad ya pasó (su horario ya finalizó), el sistema la marca como "finalizada" → el organizador registra la asistencia → si el estudiante tiene asistencia registrada, el sistema genera su certificado de participación → el estudiante puede consultar y descargar el certificado → el estudiante evalúa y califica la actividad → el organizador puede consultar el promedio de calificación.
* **Reglas de negocio:**
  * Solo puede calificar una actividad quien estuvo inscrito en ella.
  * Solo se puede calificar una vez que la actividad ya finalizó (no antes).
  * Un estudiante solo puede dejar una calificación por actividad.
  * Solo se puede generar un certificado si la actividad finalizó y el estudiante tiene asistencia registrada.
  * Un estudiante solo puede tener un certificado por cada actividad.
* **Información que utiliza o produce:** calificación (estudiante, actividad, puntaje, comentario, fecha), historial de actividades pasadas por estudiante, certificado de participación (estudiante, actividad, fecha de emisión y código).
* **Criterio para demostrar que funciona:** un estudiante puede ver su historial de actividades pasadas, calificar una y obtener su certificado de participación, y el organizador puede consultar el promedio y los comentarios recibidos en su actividad.