# Registro de uso de IA — Reproductor global en barra inferior

- **Fecha:** 2026-11-12
- **Autor:** Benjamín Ayala (@arkisnash)
- **Herramienta:** Gemini
- **Archivos intervenidos:**
  - `src/main.js`
  - `index.html`

## Prompt utilizado
> Implementar un reproductor de audio global en la barra inferior fija (`<footer>` de `index.html`) siguiendo el diseño de tres columnas (datos de pista, controles centrales con barra de progreso y control de volumen), manejado mediante `Alpine.store('reproductor')` en `src/main.js` con pistas MP3 de respaldo.

## Qué generó la IA
1. **`src/main.js`:** Definición de `Alpine.store('reproductor')` utilizando la interfaz nativa `new Audio()`, manejo de eventos (`timeupdate`, `loadedmetadata`, `ended`), control de reproducción (`reproducir`, `alternar`, `irA`, `cambiarVolumen`), formateador de segundos a `m:ss` y arreglo de 5 pistas MP3 de demostración para canciones sin `audioUrl` propia.
2. **`index.html`:** Reemplazo del `<footer>` estático por la barra interactiva de 3 secciones enlazada reactivamente a `$store.reproductor`.

## Revisión y adaptación humana
Se verificó que el audio continúe reproduciéndose al navegar entre distintas rutas del router (`#/`, `#/explorar`, `#/perfil`) y que los estilos respeten las variables de tema claro y oscuro del proyecto.
