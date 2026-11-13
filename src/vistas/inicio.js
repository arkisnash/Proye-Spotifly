// [IA] inicio ia/2026-11-12_arkisnash_tarjetas-y-playlists.md
import { api } from '../api/index.js';

export default (Alpine) => {
  Alpine.data('inicio', () => ({
    canciones: [],
    playlists: [],
    menuAbierto: null,
    cargando: true,
    error: '',

    async cargar() {
      this.cargando = true;
      this.error = '';
      const [rCanciones, rPlaylists] = await Promise.all([
        api.canciones.listar(),
        api.playlists.listar(),
      ]);
      if (rCanciones.ok) this.canciones = rCanciones.data;
      else this.error = rCanciones.error;
      if (rPlaylists.ok) this.playlists = rPlaylists.data;
      this.cargando = false;
    },

    async agregarAPlaylist(playlist, cancionId) {
      const ids = playlist.cancionIds || [];
      if (ids.includes(cancionId)) {
        Alpine.store('toast').mostrar('La canción ya está en "' + playlist.nombre + '"');
        this.menuAbierto = null;
        return;
      }
      const res = await api.playlists.actualizar(playlist.id, {
        cancionIds: [...ids, cancionId],
      });
      if (res.ok) {
        playlist.cancionIds = res.data.cancionIds;
        Alpine.store('toast').mostrar('Agregada a "' + playlist.nombre + '"');
      }
      this.menuAbierto = null;
    },

    formatoDuracion(seg) {
      if (!seg) return '0:00';
      return Math.floor(seg / 60) + ':' + String(seg % 60).padStart(2, '0');
    },

    init() { this.cargar(); },
  }));
};
// [IA] fin