Aquí tienes el contenido reescrito en formato Markdown listo para añadir a tu archivo `README.md`:

```markdown
# Arquitectura inicial (7.6)

## 6.1 Diagrama de arquitectura
La arquitectura inicial del sistema se plantea mediante una separación entre frontend, backend y base de datos[cite: 3]. El frontend será desarrollado con **Next.js** y se comunicará mediante HTTP con una API desarrollada en **NestJS**[cite: 3]. El backend gestionará la lógica de negocio y utilizará **TypeORM** para acceder a la base de datos **PostgreSQL**[cite: 3]. **Docker** será utilizado para facilitar la configuración y ejecución de los servicios del proyecto[cite: 3].


```

Usuario ──> Frontend (Next.js) ──<HTTP/REST>──> Backend API (NestJS) ──(TypeORM)──> PostgreSQL

```

No se contemplan servicios externos adicionales en la arquitectura inicial, ya que las funcionalidades principales del sistema pueden ser gestionadas por el frontend, backend y base de datos[cite: 3].

---

## 6.2 Stack tecnológico
* **Frontend:** Next.js — Desarrollo de la interfaz de usuario, páginas y navegación de la aplicación[cite: 3].
* **Backend:** NestJS — Desarrollo de la API y gestión de la lógica de negocio[cite: 3].
* **ORM:** TypeORM — Gestión de entidades y conexión con la base de datos[cite: 3].
* **Base de datos:** PostgreSQL — Almacenamiento de la información del sistema[cite: 3].
* **Contenedores:** Docker — Configuración y ejecución del entorno de desarrollo[cite: 3].
* **Pruebas de API:** Postman — Prueba y validación de los endpoints del backend[cite: 3].

---

## 6.3 Organización preliminar de módulos del backend
El backend se organizará en módulos de acuerdo con las principales funcionalidades del sistema[cite: 3]:

* **Users:** gestión de usuarios y roles[cite: 3].
* **Activities:** creación, consulta, actualización y gestión de actividades[cite: 3].
* **Activity Types:** clasificación de las actividades[cite: 3].
* **Locations:** gestión de las ubicaciones[cite: 3].
* **Enrollments:** registro y gestión de inscripciones[cite: 3].
* **Attendance:** registro y consulta de asistencia[cite: 3].
* **Reviews:** gestión de valoraciones de las actividades[cite: 3].
* **Certificates:** generación y consulta de certificados de participación[cite: 3].

Esta organización permite separar las responsabilidades del sistema y facilita el mantenimiento y evolución del backend[cite: 3].

---

## 6.4 Rutas principales del frontend
* `/login` — Inicio de sesión[cite: 3].
* `/activities` — Consulta de actividades disponibles[cite: 3].
* `/activities/[id]` — Visualización del detalle de una actividad[cite: 3].
* `/my-enrollments` — Consulta de inscripciones del estudiante[cite: 3].
* `/attendance` — Consulta de asistencia[cite: 3].
* `/reviews` — Registro y consulta de valoraciones[cite: 3].
* `/organizer/activities` — Gestión de actividades del organizador[cite: 3].
* `/organizer/activities/new` — Creación de actividades[cite: 3].
* `/certificates` — Consulta de certificados de participación[cite: 3].
* `/certificates/[id]` — Visualización y descarga de un certificado[cite: 3].

---

## 6.5 Decisiones técnicas iniciales y justificación
* **Next.js:** se utilizará para desarrollar el frontend y organizar las páginas, componentes y rutas de la aplicación[cite: 3].
* **NestJS:** se utilizará para construir el backend debido a su estructura modular, permitiendo separar las diferentes funcionalidades del sistema[cite: 3].
* **PostgreSQL:** se selecciona como sistema gestor de base de datos por tratarse de una base de datos relacional adecuada para manejar las relaciones entre usuarios, actividades, inscripciones, asistencia y valoraciones[cite: 3].
* **TypeORM:** permitirá conectar el backend con PostgreSQL y trabajar con las entidades definidas en el modelo de datos[cite: 3].
* **Docker:** permitirá mantener un entorno de desarrollo consistente y facilitar la ejecución de los diferentes componentes del proyecto[cite: 3].
* **API REST:** se utilizará como medio de comunicación entre Next.js y NestJS, manteniendo separadas la interfaz de usuario y la lógica de negocio[cite: 3].
* **Postman:** se utilizará para comprobar el funcionamiento de los endpoints del backend antes y durante la integración con el frontend[cite: 3].

---

## 6.6 Flujo general de la arquitectura
El usuario interactúa con la aplicación mediante el frontend desarrollado en Next.js[cite: 3]. Las solicitudes relacionadas con las funcionalidades del sistema son enviadas al backend NestJS mediante una API REST[cite: 3]. NestJS procesa las solicitudes y aplica la lógica de negocio correspondiente, utilizando TypeORM para consultar o modificar la información almacenada en PostgreSQL[cite: 3]. Docker proporciona el entorno para ejecutar y mantener los componentes del proyecto de forma organizada[cite: 3].

```