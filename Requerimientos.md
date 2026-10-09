# Requerimientos

## Objetivo general del producto
Desarrollar una aplicación web que centralice la publicación, inscripción, gestión, asistencia, valoración y certificación de las actividades de bienestar de una institución educativa, permitiendo a los estudiantes descubrir e inscribirse fácilmente a las actividades disponibles, registrar su participación, consultar sus certificados y brindar retroalimentación, mientras los organizadores administran sus actividades, participantes y resultados, todo con roles y permisos diferenciados[cite: 4].

---

## Requerimientos funcionales

* **RF01:** El sistema debe permitir el registro e inicio de sesión de usuarios[cite: 4].
* **RF02:** El sistema debe diferenciar al menos dos roles: estudiante y organizador[cite: 4].
* **RF03:** El sistema debe permitir a los estudiantes consultar el listado de actividades disponibles, con filtros por categoría, fecha o disponibilidad de cupo[cite: 4].
* **RF04:** El sistema debe permitir a un estudiante inscribirse a una actividad con cupo disponible[cite: 4].
* **RF05:** El sistema debe impedir que un estudiante se inscriba dos veces a la misma actividad, o a una actividad sin cupo o cancelada[cite: 4].
* **RF06:** El sistema debe permitir a un organizador crear una actividad con nombre, descripción, horario, lugar, categoría y cupo máximo[cite: 4].
* **RF07:** El sistema debe permitir a un organizador editar o cancelar únicamente las actividades que él mismo creó[cite: 4].
* **RF08:** El sistema debe permitir a un organizador consultar la lista de estudiantes inscritos en cada una de sus actividades[cite: 4].
* **RF09:** El sistema debe marcar automáticamente una actividad como "finalizada" una vez pasado su horario[cite: 4].
* **RF10:** El sistema debe permitir registrar y consultar la asistencia de los estudiantes inscritos a una actividad[cite: 4].
* **RF11:** El sistema debe permitir a un estudiante consultar su historial de actividades pasadas en las que estuvo inscrito y su estado de asistencia[cite: 4].
* **RF12:** El sistema debe permitir a un estudiante calificar (puntaje y comentario opcional) una actividad finalizada en la que haya estado inscrito y participado, una única vez[cite: 4].
* **RF13:** El sistema debe permitir a un organizador consultar el promedio de calificación y los comentarios recibidos en cada una de sus actividades[cite: 4].
* **RF14:** El sistema debe generar un certificado de participación para un estudiante cuando la actividad haya finalizado y exista un registro de asistencia[cite: 4].
* **RF15:** El sistema debe permitir a un estudiante consultar y descargar sus certificados de participación[cite: 4].
* **RF16:** El sistema debe asignar a cada certificado un código único que permita identificarlo[cite: 4].

---

## Requerimientos no funcionales

* **RNF01 (Seguridad):** Las contraseñas deben almacenarse cifradas (hash), nunca en texto plano[cite: 4].
* **RNF02 (Seguridad):** Toda operación sensible (crear, editar, inscribir, registrar asistencia, calificar y generar certificados) debe validarse en el backend, no solo ocultarse en la interfaz[cite: 4].
* **RNF03 (Usabilidad):** La interfaz debe ser responsiva y utilizable desde celular y computador, dado que los estudiantes suelen consultar actividades y certificados desde el móvil[cite: 4].
* **RNF04 (Rendimiento):** El listado de actividades y la consulta de información del estudiante deben cargar en un tiempo razonable incluso con un volumen considerable de actividades, inscripciones y registros de asistencia[cite: 4].
* **RNF05 (Disponibilidad):** El sistema debe estar desplegado y accesible mediante una URL pública para su demostración[cite: 4].
* **RNF06 (Mantenibilidad):** El backend debe estar organizado por módulos (usuarios, autenticación, actividades, inscripciones, asistencia, valoraciones y certificaciones) para facilitar cambios futuros o su adaptación a otra institución[cite: 4].
* **RNF07 (Confiabilidad de datos):** Las operaciones de cupo e inscripción deben evitar condiciones de carrera (por ejemplo, dos estudiantes inscribiéndose al mismo tiempo en el último cupo disponible)[cite: 4].

---

## Historias de usuario y criterios de aceptación

### HU01: Consultar e inscribirme a una actividad
> **Como** estudiante,  
> **quiero** ver las actividades de bienestar disponibles e inscribirme a una,  
> **para** participar sin depender de canales dispersos[cite: 4].

* **Criterios de aceptación:**
  * Dado que hay actividades activas con cupo, cuando el estudiante consulta el listado, entonces las ve con su horario, lugar y cupos disponibles[cite: 4].
  * Dado que una actividad tiene cupo disponible, cuando el estudiante se inscribe, entonces el sistema confirma la inscripción y registra su inscripción[cite: 4].
  * Dado que una actividad no tiene cupo o está cancelada, cuando el estudiante intenta inscribirse, entonces el sistema lo impide y muestra un mensaje claro[cite: 4].

### HU02: Crear y gestionar una actividad
> **Como** organizador,  
> **quiero** crear y administrar mis actividades,  
> **para** centralizar su difusión y controlar mis propias inscripciones[cite: 4].

* **Criterios de aceptación:**
  * Dado que el organizador crea una actividad con los datos requeridos, cuando la publica, entonces queda visible para los estudiantes[cite: 4].
  * Dado que el organizador quiere cancelar una actividad, cuando lo hace, entonces deja de aceptar inscripciones y los inscritos ven el estado "cancelada"[cite: 4].
  * Dado que un organizador intenta editar la actividad de otro organizador, cuando lo intenta, entonces el sistema lo rechaza[cite: 4].

### HU03: Calificar una actividad pasada
> **Como** estudiante,  
> **quiero** calificar una actividad en la que participé,  
> **para** dar retroalimentación al organizador[cite: 4].

* **Criterios de aceptación:**
  * Dado que una actividad ya finalizó y el estudiante estuvo inscrito, cuando la califica, entonces el sistema guarda el puntaje y comentario[cite: 4].
  * Dado que el estudiante ya calificó una actividad, cuando intenta calificarla de nuevo, entonces el sistema lo impide[cite: 4].
  * Dado que la actividad aún no ha finalizado, cuando el estudiante intenta calificarla, entonces el sistema no lo permite[cite: 4].

### HU04: Ver retroalimentación recibida
> **Como** organizador,  
> **quiero** ver el promedio y los comentarios de mis actividades,  
> **para** mejorar futuras ediciones[cite: 4].

* **Criterios de aceptación:**
  * Dado que una actividad tiene calificaciones registradas, cuando el organizador la consulta, entonces ve el promedio y la lista de comentarios[cite: 4].

### HU05: Obtener certificado de participación
> **Como** estudiante,  
> **quiero** obtener un certificado de las actividades en las que participé,  
> **para** contar con una constancia de mi participación[cite: 4].

* **Criterios de aceptación:**
  * Dado que una actividad finalizó y el estudiante tiene asistencia registrada, cuando consulta sus certificados, entonces puede ver el certificado correspondiente[cite: 4].
  * Dado que el estudiante no tiene asistencia registrada, cuando intenta obtener un certificado, entonces el sistema no lo permite[cite: 4].
  * Dado que el estudiante tiene un certificado disponible, cuando selecciona descargarlo, entonces el sistema permite obtenerlo[cite: 4].

---

## Actores, roles y permisos

| Actor | Permisos |
| :--- | :--- |
| **Estudiante** | Consultar actividades, inscribirse, ver su historial, calificar actividades finalizadas en las que participó, consultar y descargar certificados de participación[cite: 4]. |
| **Organizador** | Crear, editar y cancelar sus propias actividades, registrar asistencia, ver inscritos y calificaciones de sus propias actividades. No puede modificar actividades de otros organizadores[cite: 4]. |

---

## Matriz de trazabilidad

| Problema | Requerimiento(s) | Funcionalidad |
| :--- | :--- | :--- |
| Información dispersa de actividades | RF03, RNF03, RNF04 | 1. Consulta e inscripción[cite: 4] |
| No hay visibilidad de cupos en tiempo real | RF04, RF05, RNF07 | 1. Consulta e inscripción[cite: 4] |
| Cada organizador usa su propio canal sin retroalimentación sobre sus actividades | RF06, RF07, RF08, RF09, RF10, RF11, RF12, RF13 | 2. Gestión de actividades<br>3. Historial y valoración[cite: 4] |
| No existe un mecanismo para obtener una constancia de participación | RF14, RF15, RF16 | 4. Certificación de participación[cite: 4] |
| Necesidad transversal de identificar usuarios y permisos | RF01, RF02, RNF01, RNF02 | Autenticación y autorización (transversal)[cite: 4] |