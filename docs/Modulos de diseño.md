# Documentación Técnica Integral para el Agente de IA: Aplicación Móvil KOOLER

> **Propósito:** Construir los flujos completos de **Autenticación**, **Sección de Estudiante** y **Sección de Administrador** para la aplicación móvil [BU – Figma](https://www.figma.com/design/sIoDopqv9SfngNoxKYrah2/BU?node-id=91-807&p=f&t=9NqRdw9zYsSjmRbS-0). Sigue rigurosamente cada especificación de diseño, paleta de colores, estructura y lógica de negocio descrita a continuación.

---

## 1. Especificaciones Globales de Diseño (Tokens)
* **Tipografía:** Fuente sans-serif limpia (`Inter` o `Roboto`).
  * Títulos (H1): Negrita, tamaño 24px - 28px.
  * Etiquetas de inputs (Labels): Semibold, tamaño 14px.
  * Botones y textos secundarios: 14px - 16px.
* **Radios de Borde (*Border-radius*):** `12px` / `16px` para contenedores, tarjetas e inputs.
* **Espaciados internos:** `padding: 20px` a `24px` en contenedores.
* **Paleta de Colores y Diferenciación de Fondo:**
  * **Modo Oscuro (Exclusivo Pantalla 1 de Autenticación):** Fondo profundo (`#121212` o `#1E1E1E`).
  * **Modo Claro (Resto de pantallas y flujos de Autenticación, Estudiante y Admin):** Fondo limpio (`#FFFFFF` o `#F8F9FA`).
  * **Color Primario (Acento / Botones de acción):** Azul institucional (`#007AFF`).
  * **Color de Éxito (Estados positivos):** Verde institucional (`#34C759`).
  * **Color de Texto Principal:** `#FFFFFF` (en oscuro) / `#1C1C1E` (en claro).
  * **Color de Texto Secundario (Labels / Placeholders):** `#8E8E93` (Gris claro).

---

## MÓDULO A: Autenticación

* **Pantalla 1: Pantalla de Inicio (Bienvenida)**
  * **Fondo:** **Oscuro** (`#1E1E1E`).
  * **Estructura visual:**
    * *Contenedor Superior (Hero de Imagen):* Contenedor central que alberga la ilustración principal de bienvenida y la identidad gráfica o logotipo de la app (`KOOLER`).
    * *Contenedor Inferior (Acciones):* Dos botones principales apilados verticalmente:
      1. **Botón sólido ("Registrarse"):** Color primario de acento (`#007AFF`), texto blanco, esquinas redondeadas. Dirige a la Pantalla de Registro.
      2. **Botón secundario ("Iniciar sesión"):** Con borde sutil o estilo plano, texto blanco. Dirige a la Pantalla de Login.

* **Pantalla 2: Pantalla de Registro**
  * **Fondo:** **Claro** (`#FFFFFF` / `#F8F9FA`).
  * **Estructura visual:**
    * *Cabecera:* Título principal superior ("Crear cuenta").
    * *Contenedor de Formulario (4 campos de texto con bordes definidos y fondo sutil `#2C2C2E` o equivalente claro):*
      1. *Campo 1:* **Nombres** (Placeholder: "Nombres completos", Tipo: `text`).
      2. *Campo 2:* **Correo institucional** (Placeholder: "usuario@icesi.edu.co", Tipo: `email`).
      3. *Campo 3:* **Contraseña** (Placeholder: "••••••••", Tipo: `password`).
      4. *Campo 4:* **Rol** (Selector o Dropdown con opciones institucionales como Estudiante o Profesor).
    * *Nota de Lógica (Simplificación de Código):* Para no complicar el código por ahora, se permite que el usuario escoja libremente su rol en este input.
    * *Botón de Acción Inferior:* Botón de ancho completo con color primario (`#007AFF`) y texto blanco "Registrarse".

* **Pantalla 3: Pantalla de Login (Inicio de Sesión)**
  * **Fondo:** **Claro** (`#FFFFFF` / `#F8F9FA`).
  * **Estructura visual:**
    * *Cabecera:* Título principal ("Bienvenido") y subtítulo de apoyo ("Ingresa a tu cuenta institucional").
    * *Contenedor de Formulario (2 campos esenciales):*
      1. *Campo 1:* **Correo institucional** (Placeholder: "usuario@icesi.edu.co", Tipo: `email`).
      2. *Campo 2:* **Contraseña** (Placeholder: "••••••••", Tipo: `password`).
    * *Botón de Acción Inferior:* Botón ancho con color primario (`#007AFF`) y texto "Iniciar sesión".

* **Pantalla 4: Pantalla de Cuenta Creada (Confirmación)**
  * **Fondo:** **Claro** (`#FFFFFF` / `#F8F9FA`).
  * **Estructura visual:**
    * *Centro de Pantalla:*
      * *Contenedor de Icono (Hero gráfico de éxito):* Elemento central o contenedor circular con un icono de confirmación/éxito en tono verde institucional (`#34C759`).
      * *Título:* "Cuenta creada" (Texto oscuro de alto contraste).
    * *Botón Inferior:*
      * Botón de acción principal de ancho completo ("Ir a iniciar sesión").
      * *Acción de código:* Redireccionar automáticamente al usuario directo a la **Pantalla 3 (Login)**.

---

## MÓDULO B: Sección del Estudiante

* **Elementos Globales y Cabecera (Común en Pantallas 1, 2, 3 y 4):**
  * *Cabecera Superior (Header de Perfil):* Alineada a la izquierda, avatar circular del usuario con su nombre. Alineada a la derecha, icono de perfil o botón compacto que despliega un menú flotante con **únicamente la opción de cerrar sesión ("Cerrar sesión")**.
  * *Barra de Navegación Inferior (Bottom Navigation - 4 ítems fijos):*
    * *Ítem 1 (Home):* Icono de inicio / casa $\rightarrow$ Lleva a la **Pantalla 1 (Home)**.
    * *Ítem 2 (Mis Inscripciones):* Icono de boleto / lista $\rightarrow$ Lleva a la **Pantalla 2 (Mis Inscripciones / Guardadas)**.
    * *Ítem 3 (Mi Progreso):* Icono de gráfico / progreso $\rightarrow$ Lleva a la **Pantalla 3 (Mi Progreso con certificación)**.
    * *Ítem 4 (Historial):* Icono de historial / reloj o estrella $\rightarrow$ Lleva a la **Pantalla 4 (Historial y Valoraciones)**.

* **Pantalla 1: Home (Exploración de Actividades)**
  * *Estructura de Layout:*
    * *Fila de Búsqueda Superior:* Barra de búsqueda con placeholder ("Buscar actividades...") en un contenedor con esquinas redondeadas y fondo gris suave. Acompañada a la derecha por un **icono interactivo de filtro**.
    * *Contenedor Principal de Actividades:* Lista vertical (*feed*) de tarjetas de actividades disponibles.
  * *Jerarquía y Estados de la Card de Actividad:*
    * Título de la actividad en negrita, tamaño mediano.
    * Detalles internos: Fecha, hora, ubicación y cupos disponibles.
    * Mensaje explícito en el detalle indicando **"Esta actividad está certificada"** (si aplica).
    * Botón de Acción Inferior según Estado (Condicional):
      1. **Estado "Inscribirse":** Botón de acción con color primario (`#007AFF`) para apuntarse.
      2. **Estado "Ya inscrito":** Botón de estado deshabilitado o variante secundaria con texto "Inscrito".
      3. **Estado "Sin cupos":** Botón en color gris o rojo atenuado con el texto "Agotado / Sin cupos".

* **Pantalla 2: Mis Inscripciones (Guardadas)**
  * *Estructura de Layout:* Listado vertical de tarjetas que agrupa exclusivamente las actividades en las que el estudiante ya se encuentra registrado (provenientes del estado "ya inscrito" del home).
  * *Jerarquía de la Card:* Título de la actividad institucional, fecha y detalles de asistencia, con un indicador visual o etiqueta de estado ("Inscrito / Confirmado") en la esquina superior de la tarjeta.

* **Pantalla 3: Mi Progreso (Certificación)**
  * *Estructura de Layout:* Listado vertical enfocado en el seguimiento de avance académico o de bienestar.
  * *Restricción de Filtrado:* **Solo muestra aquellas actividades que otorgan certificación por asistencia**.
  * *Jerarquía de la Card:* Título de la actividad y una **Barra de Progreso (*Progress Bar*)** visual de porcentaje de avance (ej. 75% o 100%) con indicador numérico.

* **Pantalla 4: Historial y Valoraciones**
  * *Estructura de Layout:* Listado de actividades pasadas que ya finalizaron y **cuentan con certificación**.
  * *Jerarquía de la Card:*
    * Título de la actividad completada.
    * **Componente de Valoración:** Sistema interactivo de **5 estrellas** para que el usuario califique la actividad.
    * **Campo de Comentarios:** Input de texto integrado o botón para "Dejar un comentario" público.
    * **Acción de Certificado:** Botón destacado o enlace directo con icono para **"Ver certificado"** generado.

---

## MÓDULO C: Sección del Administrador

* **Pantalla 1: Mis Actividades (Panel General del Administrador)**
  * *Estructura de Layout:*
    * *Métricas Superiores (Contadores rápidos):* Una barra con tres indicadores numéricos clave en tarjetas compactas: Actividades Activas, Actividades Finalizadas, Total de Inscritos.
    * *Listado Principal (*Feed*):* Lista vertical de todas las actividades creadas por el organizador.
  * *Detalles de la Card de Actividad:*
    * Icono miniatura de la categoría y etiqueta de estado (ej. Activa, Cancelada, Finalizada).
    * Título de la actividad.
    * Fecha, hora y ubicación en texto secundario.
    * Indicador lateral numérico con la cantidad de inscritos actuales.

* **Pantalla 2: Detalles de la Actividad**
  * *Estructura de Layout:*
    * *Hero Superior de Imagen:* Contenedor visual destacado con la imagen representativa de la actividad y el título superpuesto.
    * *Metadatos:* Fecha, hora, ubicación, cupos máximos y descripción detallada de la actividad.
    * *Indicador de Certificación:* Mensaje destacado en el detalle que especifica claramente **"Esta actividad está certificada"** (si aplica).
    * *Botones de Acción Principales (Condicionales según el estado):*
      1. *Si la actividad está Activa:*
         * Botón de **Asistencia** (lleva directamente a la *Pantalla 3: Control de Asistencia*).
         * Botón de **Finalizar actividad** (permite cerrar el evento).
      2. *Si la actividad fue Finalizada o Cancelada:*
         * El botón cambia automáticamente a **"Ver retroalimentación"**, el cual redirige a la *Pantalla 4*.
         * *Nota de Lógica:* Si la actividad fue cancelada y no hay calificaciones, se mostrará la pantalla de "Sin calificaciones aún".
    * *Sección de Inscritos:* Lista desplegable o resumen con los nombres de los usuarios inscritos y la fecha de registro.

* **Pantalla 3: Pantalla de Asistencia**
  * *Estructura de Layout:*
    * *Cabecera:* Título de la actividad y opciones de visualización de asistencia.
    * *Selector de Sesiones (Si aplica):* Pestañas o controles deslizantes para alternar entre sesiones.
    * *Listado de Estudiantes:* Tabla o lista vertical con los nombres de los asistentes inscritos.
    * *Control Interactivo de Asistencia:* Cada estudiante cuenta con un interruptor (*switch*) o botón de presencia individual para marcar o desmarcar su asistencia de forma directa.
    * *Nota de Simplificación de Flujo:* Se elimina cualquier botón redundante de "asistencia guardada"; la interacción actualiza los registros en tiempo real.

* **Pantalla 4: Pantalla de Retroalimentación**
  * *Estructura de Layout:*
    * *Cabecera:* Título de la actividad finalizada.
    * *Resumen de Calificación:* Bloque destacado con la puntuación promedio general (ej. `4.0` de 5 estrellas) acompañada de las estrellas amarillas y el conteo total de reseñas.
    * *Desglose de Calificaciones:* Barras de progreso horizontales que muestran la distribución de votos por cada nivel de estrella (de 5 a 1).
    * *Listado de Comentarios:* Tarjetas individuales de feedback con las opiniones, valoraciones y nombres de los estudiantes.
    * *Nota condicional:* Si la actividad se canceló o no tiene reseñas, muestra un contenedor limpio indicando **"Sin calificaciones aún"**.

* **Pantalla 5: Crear Actividad**
  * *Estructura de Layout:*
    * *Cabecera:* Título superior "Crea tu nueva actividad".
    * *Formulario Completo de Campos (Inputs con bordes redondeados):*
      1. *Campo 1:* **Imagen de la actividad** (URL o botón para subir archivo gráfico).
      2. *Campo 2:* **Nombre** (Título de la actividad).
      3. *Campo 3:* **Descripción** (Área de texto explicativa).
      4. *Campo 4:* **Categoría** (Selector desplegable, ej. Deportiva, Cultural).
      5. *Campo 5:* **Cupos máximos** (Numérico).
      6. *Campo 6:* **Fecha de inicio y Hora**.
      7. *Campo 7:* **Lugar / Ubicación**.
      8. *Campo 8:* **Configuración de Sesiones** (Selector entre *Sesión única* o *Varias sesiones*).
      9. *Campo 9:* **Certificación** (Checkbox o switch: "Esta actividad certifica participación", el cual habilita un campo extra para adjuntar el formato o plantilla del certificado).
    * *Botones Inferiores:* Botón secundario "Cancelar" y botón primario de acción sólida con el texto **"Crear actividad"**.