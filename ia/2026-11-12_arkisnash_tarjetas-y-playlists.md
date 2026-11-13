# Registro de uso de IA — Menú contextual en catálogo y gestión completa de playlists

- **Fecha:** 2026-11-12
- **Autor:** Benjamín Ayala (@arkisnash)
- **Herramienta:** Gemini
- **Archivos intervenidos:**
  - `src/vistas/inicio.js`
  - `src/vistas/explorar.html`
  - `src/vistas/biblioteca.html`
  - `src/vistas/playlist.html`

## Prompt utilizado
> Agregar lógica de menú contextual (⋮) en Inicio y Explorar para reproducir o añadir canciones a playlists, conectar Explorar con el buscador global superior e implementar la administración completa de playlists en Biblioteca y su vista de detalle (`playlist.html`).

## Qué generó la IA
1. **`src/vistas/inicio.js` y `src/vistas/explorar.html`:** Lógica para cargar playlists disponibles, añadir pistas mediante `$api.playlists.actualizar` desde el menú de tres puntos y filtrar el catálogo en tiempo real usando `$store.router.busqueda`.
2. **`src/vistas/biblioteca.html` y `src/vistas/playlist.html`:** Creación y eliminación de playlists, edición de nombre y descripción, reproducción de la lista y gestión de canciones (agregar y quitar pistas de cada playlist).

## Revisión y adaptación humana
Se probó el flujo completo de creación de playlists, adición de canciones desde el menú contextual y persistencia en `localStorage` a través de la capa `$api`.
