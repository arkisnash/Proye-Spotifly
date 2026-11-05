# Beat Sound Track (BST)

App de música (Entrega 2, CIT2008). Frontend con Vite, Alpine.js y Tailwind CSS; los datos son simulados (mocks) y se acceden solo a través de `src/api/`.

**Integrantes:** (completar)

## Requisitos y ejecución
Node.js 20.19 o superior.

1. `npm install`
2. `npm run dev` y abrir la dirección que muestra la terminal (ej.: http://localhost:5173)

## Credenciales de prueba
- Usuario: `usuario@bst.cl` / `bst12345`
- Administrador: `admin@bst.cl` / `admin123`

## Estructura
- `src/vistas/`: una vista por archivo (`.html` y, si hace falta, un `.js` con `Alpine.data`).
- `src/api/index.js`: capa de servicios (latencia 300-800 ms, formato `{ ok, status, data, error }`, escrituras en `localStorage`). `api.config.probabilidadFallo` fuerza errores.
- `public/mocks/`: un JSON por recurso.
- `src/css/app.css`: paleta clara y oscura (variables).
- `ia/`: registro del uso de IA.

## Endpoints simulados
| Función | Método | Ruta equivalente | Descripción |
|---|---|---|---|
| `canciones.listar({busqueda})` | GET | /api/canciones | Lista canciones con búsqueda opcional |
| `canciones.obtener(id)` | GET | /api/canciones/:id | Una canción o error 404 |
| `canciones.crear(datos)` / `actualizar(id, datos)` / `eliminar(id)` | POST / PUT / DELETE | /api/canciones[/:id] | Escritura simulada |
| `playlists.*`, `generos.*`, `usuarios.*` | (igual que canciones) | /api/playlists, /api/generos, /api/usuarios | CRUD genérico |
| `auth.iniciarSesion({correo, clave})` | POST | /api/auth/login | Devuelve el usuario o 401 |
| `auth.registrar({nombre, correo, clave})` | POST | /api/auth/registro | Crea usuario (201) o 409 |

## Vistas
`#/login`, `#/registro`, `#/` (inicio), `#/explorar`, `#/biblioteca`, `#/cancion/:id`, `#/playlist/:id`, `#/perfil`, `#/configuracion`, `#/admin` (solo rol admin).

## Reglas del equipo
- Cada uno trabaja en su rama (`feature/...`) y une a `main` con pull request.
- Cada integrante edita solo sus vistas; el router, el layout y la capa `api` se cambian avisando.
- Todo código obtenido con IA se marca con `[IA] inicio` / `[IA] fin`, se registra en `ia/` y el commit lleva `[IA]`.
