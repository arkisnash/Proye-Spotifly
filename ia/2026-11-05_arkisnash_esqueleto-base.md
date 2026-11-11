# Esqueleto base con Vite, Tailwind y Alpine

- **Fecha:** 2026-11-05
- **Integrante:** Benjamín Ayala (@arkisnash)
- **Herramienta y modelo:** Claude Sonnet 4
- **Archivos afectados:** index.html, src/main.js, src/router.js, src/api/index.js, src/css/app.css, src/vistas/inicio.html, src/vistas/inicio.js

## Objetivo
Armar la estructura base para la Entrega 2 de Spotifly (Beat Sound Track) con Vite, Tailwind CSS v4 y Alpine.js instalados por npm, incluyendo router por hash, capa api con mocks y latencia simulada.

## Conversación (texto completo, sin editar)

### Prompt 1
Necesito armar el esqueleto base para la segunda entrega de mi proyecto web de musica Beat Sound Track (Spotifly) usando Vite, Tailwind v4 por npm y Alpine.js. Tiene que tener router por hash con rutas protegidas si no hay sesion, una carpeta public/mocks con canciones, generos, playlists y usuarios en json, y un archivo src/api/index.js que tenga latencia de 300 a 800ms, guarde en localStorage con prefijo bst: y devuelva {ok, status, data, error}. Tambien deja lista la vista de inicio cargando las canciones con estado cargando, error con boton reintentar y vacio.

### Respuesta 1
Te entrego la estructura base del proyecto configurada para Vite + Tailwind CSS v4 (@tailwindcss/vite) y Alpine.js:

1. src/api/index.js: función llamar() con demora aleatoria de 300 a 800 ms, lectura inicial con etch desde /mocks/*.json, persistencia en localStorage (st:canciones, st:playlists, st:usuarios, st:generos), soporte para config.probabilidadFallo y métodos para listar, obtener, crear, actualizar y eliminar.
2. src/router.js: carga las vistas HTML con import.meta.glob('./vistas/*.html', { query: '?raw', import: 'default', eager: true }) y redirige a #/login cuando la ruta es privada y no existe sesión en el store.
3. src/main.js: registra Alpine.store('tema'), Alpine.store('sesion'), Alpine.store('toast') y el helper $api.
4. src/css/app.css: variables de color para tema claro y oscuro con @theme.
5. src/vistas/inicio.html y src/vistas/inicio.js: componente Alpine.data('inicio') que consulta $api.canciones.listar() manejando estados cargando, error (con botón Reintentar) y listado de tarjetas.

## Qué se incorporó al proyecto
Se incorporó la configuración de Vite, src/api/index.js, src/router.js, src/main.js, src/css/app.css, index.html y la vista inicio.

## Adaptaciones realizadas
Se ajustaron los textos del menú lateral, el logo de la aplicación y los placeholders de las vistas para dividir el trabajo entre los 3 integrantes del grupo.

## Verificación
Se probó con 
pm install, 
pm run dev y 
pm run build, revisando en consola que no existan errores y que la redirección a #/login y la carga de mocks funcionen bien.
