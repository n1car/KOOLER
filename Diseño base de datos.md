# Diseño de base de datos

## Objetivo del modelo
El modelo de base de datos define cómo se almacenará y relacionará la información necesaria para gestionar las actividades de Bienestar Universitario[cite: 5]. Se contemplan los usuarios y sus roles, las actividades, las inscripciones, la asistencia, las valoraciones y la información de ubicación, permitiendo soportar las funcionalidades de consulta y participación, gestión de actividades, historial/registro de participación y certificación[cite: 5].

---

## 4.1 Diagrama entidad-relación
El modelo de base de datos está compuesto por nueve entidades principales: **ROLE**, **USER**, **ACTIVITY**, **ACTIVITY TYPE**, **LOCATION**, **ENROLLMENT**, **ATTENDANCE**, **REVIEW** y **CERTIFICATE**[cite: 5].

El modelo relaciona la información de los usuarios con las actividades que organizan y en las que participan, permitiendo gestionar inscripciones, asistencia, valoraciones y certificados de participación[cite: 5].

---

## 4.2 Entidades, atributos y tipos de datos
El modelo contempla las siguientes entidades y atributos principales[cite: 5]:

* **ROLE:** `id_role`, `name`[cite: 5].
* **USER:** `id_user`, `first_name`, `last_name`, `email`, `password_hash`, `status`, `id_role`[cite: 5].
* **ACTIVITY:** `id_activity`, `name`, `description`, `date`, `start_time`, `end_time`, `capacity`, `status`, `registration_deadline`, `id_type`, `id_organizer`, `id_location`[cite: 5].
* **ACTIVITY TYPE:** `id_type`, `name`, `requires_enrollment`[cite: 5].
* **LOCATION:** `id_location`, `name`, `building`[cite: 5].
* **ENROLLMENT:** `id_enrollment`, `id_user`, `id_activity`, `enrollment_date`[cite: 5].
* **ATTENDANCE:** `id_attendance`, `id_user`, `id_activity`, `registration_date`, `status`[cite: 5].
* **REVIEW:** `id_review`, `id_user`, `id_activity`, `rating`, `comment`, `date`[cite: 5].
* **CERTIFICATE:** `id_certificate`, `id_user`, `id_activity`, `issue_date`, `certificate_code`[cite: 5].

Los principales tipos de datos considerados son `int`, `string`, `datetime`, `boolean`[cite: 5].

---

## 4.3 Claves primarias y foráneas

### Claves primarias:
* `ROLE.id_role`[cite: 5]
* `USER.id_user`[cite: 5]
* `ACTIVITY.id_activity`[cite: 5]
* `ACTIVITY_TYPE.id_type`[cite: 5]
* `LOCATION.id_location`[cite: 5]
* `ENROLLMENT.id_enrollment`[cite: 5]
* `ATTENDANCE.id_attendance`[cite: 5]
* `REVIEW.id_review`[cite: 5]
* `CERTIFICATE.id_certificate`[cite: 5]

### Claves foráneas:
* `USER.id_role` → `ROLE.id_role`[cite: 5]
* `ACTIVITY.id_organizer` → `USER.id_user`[cite: 5]
* `ACTIVITY.id_type` → `ACTIVITY_TYPE.id_type`[cite: 5]
* `ACTIVITY.id_location` → `LOCATION.id_location`[cite: 5]
* `ENROLLMENT.id_user` → `USER.id_user`[cite: 5]
* `ENROLLMENT.id_activity` → `ACTIVITY.id_activity`[cite: 5]
* `ATTENDANCE.id_user` → `USER.id_user`[cite: 5]
* `ATTENDANCE.id_activity` → `ACTIVITY.id_activity`[cite: 5]
* `REVIEW.id_user` → `USER.id_user`[cite: 5]
* `REVIEW.id_activity` → `ACTIVITY.id_activity`[cite: 5]
* `CERTIFICATE.id_user` → `USER.id_user`[cite: 5]
* `CERTIFICATE.id_activity` → `ACTIVITY.id_activity`[cite: 5]

---

## 4.4 Relaciones y cardinalidades
El modelo establece las siguientes relaciones[cite: 5]:

* `ROLE` 1:N `USER`[cite: 5]
* `USER` 1:N `ACTIVITY`[cite: 5]
* `USER` 1:N `ENROLLMENT`[cite: 5]
* `ACTIVITY` 1:N `ENROLLMENT`[cite: 5]
* `USER` 1:N `ATTENDANCE`[cite: 5]
* `ACTIVITY` 1:N `ATTENDANCE`[cite: 5]
* `ACTIVITY_TYPE` 1:N `ACTIVITY`[cite: 5]
* `LOCATION` 1:N `ACTIVITY`[cite: 5]
* `USER` 1:N `REVIEW`[cite: 5]
* `ACTIVITY` 1:N `REVIEW`[cite: 5]
* `USER` 1:N `CERTIFICATE`[cite: 5]
* `ACTIVITY` 1:N `CERTIFICATE`[cite: 5]

Un usuario puede organizar varias actividades y participar en diferentes actividades mediante inscripciones y registros de asistencia[cite: 5]. Una actividad puede tener múltiples participantes y recibir diferentes valoraciones[cite: 5]. Además, un usuario puede obtener certificados de participación correspondientes a las actividades en las que haya registrado su asistencia[cite: 5].

---

## 4.5 Restricciones relevantes
* Un estudiante no puede inscribirse dos veces en la misma actividad[cite: 5].
* El número de inscritos no puede superar el `capacity` establecido para la actividad[cite: 5].
* Solo las actividades activas permiten nuevas inscripciones[cite: 5].
* No se permiten inscripciones después de `registration_deadline`[cite: 5].
* Un usuario no puede registrar asistencia más de una vez para la misma actividad[cite: 5].
* Un estudiante solo puede tener un certificado por actividad[cite: 5].
* Solo se puede generar un certificado cuando la actividad ha finalizado y el estudiante tiene asistencia registrada[cite: 5].
* Cada certificado debe tener un código único por actividad[cite: 5].
* Un estudiante solo puede realizar una valoración por actividad[cite: 5].
* Las actividades pueden encontrarse en estado `ACTIVE`, `CANCELLED` o `FINISHED`[cite: 5].
* Un organizador solo puede modificar o cancelar las actividades que organiza[cite: 5].
* La valoración se realiza sobre actividades finalizadas en las que el estudiante haya participado[cite: 5].

---

## 4.6 Diccionario de datos inicial
El diccionario de datos inicial presenta los principales campos del modelo, sus tipos de datos y las claves asociadas[cite: 5].

---

## 4.7 Soporte de las funcionalidades y usuarios
* **Consulta e inscripción:** `ACTIVITY`, `ACTIVITY_TYPE` y `LOCATION` permiten almacenar y consultar la información de las actividades[cite: 5]. `ENROLLMENT` registra las inscripciones de los estudiantes y permite controlar los cupos[cite: 5].
* **Gestión de actividades:** `USER` identifica al organizador y `ACTIVITY.id_organizer` establece la relación entre el organizador y sus actividades[cite: 5]. Esto permite gestionar las actividades correspondientes a cada organizador[cite: 5].
* **Registro y consulta de asistencia:** `ATTENDANCE` relaciona a los usuarios con las actividades en las que participan y permite conservar su historial de asistencia[cite: 5].
* **Valoración:** El modelo incorpora `REVIEW` para almacenar las calificaciones y comentarios asociados a las actividades[cite: 5].
* **Certificación de participación:** `CERTIFICATE` almacena los certificados asociados a los estudiantes y actividades, incluyendo la fecha de emisión y un código único[cite: 5]. `ATTENDANCE` permite verificar que el estudiante haya participado antes de generar el certificado[cite: 5].