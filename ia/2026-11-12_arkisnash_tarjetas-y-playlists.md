# Registro de uso de IA — Menú contextual y gestión de playlists

- **Fecha:** 2026-11-12
- **Autor:** Benjamín Ayala (@arkisnash)
- **Herramienta:** Gemini
- **Archivos intervenidos:** `src/vistas/inicio.js`, `src/vistas/explorar.html`, `src/vistas/biblioteca.html`, `src/vistas/playlist.html`

## Conversación (texto completo, sin editar)

**Mi Prompt:**
Necesito que me ayudes a agregar una lógica de menú contextual (⋮) en Inicio y Explorar para añadir canciones a playlists, y conectar Explorar con el buscador global superior en tiempo real

**Respuesta de la IA (Código generado):**
```html
<script>
  get resultado() {
    const q = ($store.router.busqueda || '').trim().toLowerCase();
    return this.canciones.filter((c) =>
      (!q || (c.titulo + ' ' + c.artista).toLowerCase().includes(q))
    );
  }
  async agregarAPlaylist(playlist, cancionId) {
    const ids = playlist.cancionIds || [];
    await this.$api.playlists.actualizar(playlist.id, { cancionIds: [...ids, cancionId] });
  }
</script>