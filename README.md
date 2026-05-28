# Gestor de Horarios CESDE - Frontend (React + Vite)

Este proyecto es la interfaz gráfica (Frontend) del Gestor de Horarios para CESDE. Está desarrollado en **React** usando **Vite** como empaquetador, y se conecta a un backend en **Spring Boot** (Java).

## 🚀 Características Principales

El proyecto tiene dos roles principales: **Administrador** y **Profesor**, cada uno con su propio panel interactivo.

### 1. Panel del Administrador (`AdminPage.jsx`)
- **Gestión de Profesores:** Crear, ver información, modificar y eliminar profesores (CRUD completo).
- **Asignación de Horarios (Clases Internas):** El administrador puede seleccionar un profesor, materia, sede, aula, y asignarle un horario recurrente (ej. todos los Lunes y Jueves).
- **Calendario Administrativo:** Permite visualizar todos los horarios asignados por la administración. Al hacer clic en una clase, se abre un modal con el detalle (incluyendo el nombre del profesor, gracias al mapeo virtual de IDs).

### 2. Panel del Profesor (`ProfesorPage.jsx`)
- **Gestión de Clases Externas:** Los profesores pueden registrar clases que dictan en *otras instituciones*. Estas se guardan en la base de datos de forma independiente.
- **Calendario Unificado (`CalendarioProfesor.jsx`):** Muestra al mismo tiempo:
  1. Las clases asignadas por el Administrador (internas).
  2. Las clases agregadas por el mismo Profesor (externas).
- **Tooltip Interactivo:** Al pasar el mouse sobre una clase en el calendario, se despliega una tarjeta flotante con los detalles (hora, aula, sede, recurrencia).
- **Próximos Eventos:** Un panel lateral que calcula dinámicamente cuáles son las próximas clases a partir del día de **hoy**, ordenadas cronológicamente.

### 3. Sistema de Notificaciones (`HeaderProfesor.jsx`)
- La campana superior lee las clases futuras y muestra un *badge* numérico rojo.
- Al hacer clic, se abre un **Dropdown** con la lista de clases.
- Puedes marcar las notificaciones como "vistas" dando clic en la `✕` (se guardan en la memoria local del navegador - `localStorage`), y el contador numérico bajará.

---

## 📂 Estructura del Código y Cómo Entenderlo

El código está organizado para ser fácil de leer. A lo largo de los archivos verás comentarios de dos tipos:
- `//` para explicar una línea específica.
- `/** ... */` para explicar qué hace una función completa.

### Archivos Clave a Revisar:

1. **`src/services/api.js`**: 
   *Aquí es donde el Frontend habla con el Backend (Spring Boot).*
   - **`expandirHorarios()`**: Es una de las funciones más importantes. Como en la base de datos se guarda "Todos los jueves de Marzo a Mayo", esta función usa un ciclo (`while`) para calcular cada fecha exacta y pintar cuadritos individuales en el calendario.
   - **`normalizarDia()`**: Transforma "Jueves" a "Jue" para que las clases viejas no rompan el calendario.

2. **`src/pages/AdminPage.jsx` y `ProfesorPage.jsx`**:
   *Son las "páginas" principales.*
   - Usan `useState` para guardar los datos (ej. `horarios`, `profesores`).
   - Usan `useEffect` para cargar esos datos desde el backend apenas abres la página (la función `cargarDatos()`).

3. **`src/components/calendario/CalendarioProfesor.jsx`**:
   *El motor gráfico del calendario.*
   - Pinta la grilla de días.
   - Contiene la lógica del **Tooltip** (`handleEventoMouseEnter`), usando un pequeño retraso (`setTimeout`) para que la tarjeta no titile al mover el mouse.

4. **`src/index.css`**:
   *Estilos y animaciones.*
   - Aquí viven clases como `.evento-tooltip` y `.notif-dropdown`. Se usan animaciones `@keyframes` para que los elementos aparezcan suavemente de abajo hacia arriba (`fade-scale-in`).

---

## 🛠️ Cómo Ejecutar el Proyecto

1. Asegúrate de tener **Node.js** instalado.
2. Abre la terminal en esta carpeta y ejecuta:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Asegúrate de que el Backend de Spring Boot (en el puerto `8080`) esté corriendo simultáneamente para que los datos carguen.

---

*Nota para el desarrollador: Si necesitas cambiar colores corporativos, ve a `tailwind.config.js` y modifica la propiedad `colors.primary`. Todos los botones y calendarios se actualizarán automáticamente.*
