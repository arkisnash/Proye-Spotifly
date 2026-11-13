# Beat Sound Track (BST)

App de música (Entrega 2, CIT2008). Frontend con Vite, Alpine.js y Tailwind CSS; los datos son simulados (mocks) y se acceden solo a través de `src/api/`.

**Integrantes:**
- Benjamín Ayala (@arkisnash)
- Thomas Cisternas (@Thomas1-byte)
- Sebastián Pino (@TrashcodingUDP)

## Requisitos y ejecución
Node.js 20.19 o superior y navegador web moderno (Chrome, Edge o Firefox).

1. `npm install`
2. `npm run dev` y abrir la dirección que muestra la terminal (ej.: http://localhost:5173)

## Credenciales de prueba
- Usuario: `usuario@bst.cl` / `bst12345`
- Administrador: `admin@bst.cl` / `admin123`

## Estructura
- `src/vistas/`: una vista por archivo (`.html` y, si hace falta, un `.js` con `Alpine.data`).
- `src/main.js`: inicialización de Alpine, stores globales (`tema`, `sesion`, `toast`, `router` y `reproductor` de audio persistente).
- `src/api/index.js`: capa de servicios (latencia 300-800 ms, formato `{ ok, status, data, error }`, escrituras en `localStorage`). `api.config.probabilidadFallo` fuerza errores.
- `public/mocks/`: un JSON por recurso (`canciones.json`, `generos.json`, `playlists.json`, `usuarios.json`).
- `public/audios/`: pistas MP3 locales integradas con el reproductor global inferior.
- `src/css/app.css`: paleta clara y oscura (variables).
- `ia/`: registro del uso de IA en [ia/README.md](ia/README.md).

## Endpoints simulados
| Función | Método | Ruta equivalente | Descripción |
|---|---|---|---|
| `canciones.listar({busqueda})` | GET | /api/canciones | Lista canciones con búsqueda opcional |
| `canciones.obtener(id)` | GET | /api/canciones/:id | Una canción o error 404 |
| `canciones.crear(datos)` | POST | /api/canciones | Crea una canción en localStorage |
| `canciones.actualizar(id, datos)` | PUT | /api/canciones/:id | Actualiza datos de una canción |
| `canciones.eliminar(id)` | DELETE | /api/canciones/:id | Elimina una canción por id |
| `generos.listar()` | GET | /api/generos | Lista los géneros disponibles |
| `playlists.listar()` | GET | /api/playlists | Lista las playlists guardadas |
| `playlists.obtener(id)` | GET | /api/playlists/:id | Obtiene una playlist o error 404 |
| `playlists.crear(datos)` | POST | /api/playlists | Crea una playlist nueva |
| `playlists.actualizar(id, datos)` | PUT | /api/playlists/:id | Actualiza datos de la playlist |
| `playlists.eliminar(id)` | DELETE | /api/playlists/:id | Elimina una playlist por id |
| `usuarios.listar()` | GET | /api/usuarios | Lista los usuarios registrados |
| `usuarios.actualizar(id, datos)` | PUT | /api/usuarios/:id | Actualiza datos del usuario |
| `auth.iniciarSesion({correo, clave})` | POST | /api/auth/login | Devuelve el usuario o 401 |
| `auth.registrar({nombre, correo, clave})` | POST | /api/auth/registro | Crea usuario (201) o 409 |

## Vistas y rutas configuradas
- `#/login` y `#/registro`: rutas públicas de acceso y registro (el router redirige a `#/login` si no hay sesión activa).
- `#/` (inicio): vista principal con listado de canciones, reproducción rápida y menú contextual (⋮) para agregar a playlists.
- `#/explorar`: catálogo conectado al buscador global superior y filtro por géneros.
- `#/biblioteca`: creación, listado y eliminación de playlists del usuario.
- `#/cancion/:id` y `#/playlist/:id`: rutas dinámicas por parámetro para ver el detalle de canción o administrar pistas de una playlist.
- `#/perfil` y `#/configuracion`: rutas del menú lateral para datos de usuario y ajustes de la aplicación.
- `#/admin`: ruta protegida en el menú lateral exclusiva para usuarios con rol `admin` (CRUD de canciones, géneros y usuarios).
- `#/404`: vista mostrada por el router cuando la ruta no existe.

## Reglas del equipo
- Cada uno trabaja en su rama (`feature/...`) y une a `main` con pull request.
- Cada integrante edita solo sus vistas; el router, el layout y la capa `api` se cambian avisando.
- Todo código obtenido con IA se marca con `[IA] inicio` / `[IA] fin`, se registra en `ia/` y el commit lleva `[IA]`.
