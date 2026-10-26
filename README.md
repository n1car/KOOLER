# KOOLER — Bienestar Universitario

KOOLER es una aplicación web para organizar y gestionar las actividades de bienestar universitario, tomando como caso de estudio la Universidad Icesi. La idea es reunir en un solo lugar la información de las actividades y facilitar la participación de los estudiantes, el trabajo de los organizadores y el seguimiento de la asistencia.

## Funcionalidades principales

- **Gestión de actividades:** creación, edición y cancelación de actividades, con información sobre sus fechas, categorías y cupos.
- **Inscripciones:** los estudiantes pueden inscribirse en las actividades disponibles, teniendo en cuenta los cupos y las condiciones de inscripción.
- **Control de asistencia:** registro de asistencia de los participantes por sesión.
- **Historial y valoraciones:** consulta de actividades y publicación de comentarios y valoraciones cuando la actividad ha finalizado.
- **Certificados:** gestión de certificados asociados a la participación y asistencia de los estudiantes.
- **Usuarios y permisos:** registro e inicio de sesión, con acceso a las funciones según el rol del usuario.

La disponibilidad de algunas funciones puede variar entre el frontend y el backend, ya que la integración completa de todos los flujos forma parte del desarrollo del proyecto.

## Tecnologías utilizadas

| Componente | Tecnología |
|---|---|
| Frontend | Next.js, React y TypeScript |
| Backend | NestJS 11 |
| Base de datos | PostgreSQL 17 |
| ORM | TypeORM |
| Autenticación | JWT y Passport |
| Validación | class-validator y class-transformer |
| Contenedores | Docker Compose |
| Pruebas | Pruebas automatizadas del backend |

## Estructura del proyecto

```text
KOOLER/
├── backend/       # API, lógica de negocio y acceso a datos
├── frontend/      # Interfaz web
├── docs/          # Documentación y diseño del proyecto
├── AGENTS.md      # Instrucciones para trabajar en el repositorio
├── AI_USAGE.md    # Registro de uso de herramientas de IA
└── README.md
```

## Requisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js y npm.
- Docker Desktop con Docker Compose.
- Git.

## Cómo ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/n1car/KOOLER.git
cd KOOLER
```

Para trabajar con la rama de integración del equipo:

```bash
git checkout dev
```

### 2. Configurar y levantar la base de datos

Desde la raíz del repositorio, ejecuta:

```bash
cd backend
docker compose up -d
```

Esto inicia los servicios definidos en el archivo `backend/compose.yaml`.

### 3. Configurar el backend

Instala las dependencias:

```bash
cd backend
npm install
```

Configura las variables de entorno requeridas por el backend. Consulta el archivo de validación de configuración y la configuración de TypeORM para verificar los nombres y valores necesarios en tu entorno local.

No utilices credenciales reales ni secretos de producción en archivos que vayan a subirse al repositorio.

Inicia el servidor en modo desarrollo:

```bash
npm run start:dev
```

La API está disponible en:

`http://localhost:3000/api`

El endpoint de salud es:

`http://localhost:3000/api/health`

### 4. Ejecutar el frontend

Abre otra terminal desde la raíz del repositorio:

```bash
cd frontend
npm install
npm run dev
```

Next.js iniciará el servidor de desarrollo. La dirección local se muestra en la terminal al arrancar.

Si necesitas configurar variables de entorno para el frontend, revisa los archivos de configuración y las variables utilizadas por la aplicación.

## Usuarios de prueba

En el entorno de desarrollo se pueden crear usuarios de demostración mediante el proceso de seed, según la configuración del backend.

Las cuentas de demostración no deben utilizarse en producción. Si necesitas las credenciales locales, revisa la configuración de seed del proyecto.

## API

La API utiliza el prefijo `/api`.

### Autenticación — `/api/auth`

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | Público | Registra un usuario. |
| `POST` | `/api/auth/login` | Público | Inicia sesión y devuelve la información de autenticación. |
| `GET` | `/api/auth/profile` | Autenticado | Consulta el perfil del usuario autenticado. |

### Actividades — `/api/activities`

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/activities` | Público o autenticado | Consulta las actividades y sus filtros disponibles. |
| `GET` | `/api/activities/:id` | Público o autenticado | Consulta el detalle de una actividad. |
| `POST` | `/api/activities` | Organizador | Crea una actividad. |
| `PATCH` | `/api/activities/:id` | Organizador autorizado | Modifica una actividad propia. |
| `DELETE` | `/api/activities/:id` | Organizador autorizado | Cancela una actividad. |
| `POST` | `/api/activities/:id/enroll` | Estudiante | Solicita la inscripción a una actividad. |
| `GET` | `/api/activities/:id/enrollments` | Organizador autorizado | Consulta las inscripciones de una actividad propia. |

Los permisos, validaciones y condiciones específicas se aplican desde el backend.

Para consultar la implementación de asistencia, certificados y valoraciones, revisa los controladores y módulos correspondientes en `backend/src`.

## Pruebas

Desde la carpeta `backend`, ejecuta:

```bash
npm test
```

El proyecto también contiene pruebas de integración y de extremo a extremo. Revisa los scripts definidos en `backend/package.json` para conocer los comandos disponibles y los requisitos de cada tipo de prueba.

## Despliegue

El backend cuenta con un despliegue en Render. El estado del servicio puede consultarse en:

`https://kooler-api.onrender.com/api/health`

El frontend y el backend deben configurarse por separado cuando se despliegan en la nube. La integración entre ambos depende de las variables de entorno y de las llamadas a la API implementadas en el frontend.

## Documentación adicional

En la carpeta [`docs/`](./docs/) se encuentran los documentos de apoyo del proyecto:

- [Requerimientos](./docs/Requerimientos.md)
- [Diseño de base de datos](./docs/Diseño%20base%20de%20datos.md)
- [Arquitectura](./docs/Arquitectura%20inicial.md)
- [Funcionalidades](./docs/Funcionalidades.md)
- [Plan de trabajo](./docs/Plan%20de%20trabajo.md)
- [Taller y rúbrica del proyecto](./docs/Taller%20y%20rubrica%20del%20proyecto.md)

También puedes consultar [`AGENTS.md`](./AGENTS.md) para las instrucciones de trabajo del repositorio y [`AI_USAGE.md`](./AI_USAGE.md) para el registro del uso de herramientas de inteligencia artificial.
