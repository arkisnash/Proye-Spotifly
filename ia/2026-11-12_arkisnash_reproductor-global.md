# Registro de uso de IA — Reproductor global

- **Fecha:** 2026-11-12
- **Autor:** Benjamín Ayala (@arkisnash)
- **Herramienta:** Gemini
- **Archivos intervenidos:** `src/main.js`, `index.html`

## Conversación (texto completo, sin editar)

**Mi Prompt:**
Ayudame a implementar un reproductor de audio global en la barra inferior fija (<footer> de index.html) siguiendo el diseño de tres columnas, manejado mediante Alpine.store('reproductor') en src/main.js con pistas MP3

**Respuesta de la IA (Código generado):**
```javascript
Alpine.store('reproductor', {
  audio: new Audio(),
  actual: null,
  sonando: false,
  tiempo: 0,
  duracion: 0,
  volumen: 1,
  init() {
    this.audio.addEventListener('timeupdate', () => { this.tiempo = this.audio.currentTime; });
    this.audio.addEventListener('loadedmetadata', () => { this.duracion = this.audio.duration; });
    this.audio.addEventListener('ended', () => { this.sonando = false; });
  },
  reproducir(cancion) {
    if (this.actual?.id === cancion.id) { this.alternar(); return; }
    this.actual = cancion;
    this.audio.src = cancion.audioUrl || '/audios/pista-default.mp3';
    this.audio.play();
    this.sonando = true;
  },
  alternar() {
    if (!this.actual) return;
    if (this.sonando) this.audio.pause(); else this.audio.play();
    this.sonando = !this.sonando;
  }
});