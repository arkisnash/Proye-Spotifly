// [IA] inicio ia/2026-11-05_arkisnash_esqueleto-base.md
// Patrón para todas las vistas: Alpine.data('nombre', ...) y llamar siempre a la capa api.
import { api } from '../api/index.js';

export default (Alpine) => {
  Alpine.data('inicio', () => ({
    canciones: [], cargando: true, error: '',
    async cargar() {
      this.cargando = true; this.error = '';
      const r = await api.canciones.listar();
      if (r.ok) this.canciones = r.data; else this.error = r.error;
      this.cargando = false;
    },
    init() { this.cargar(); },
  }));
};
// [IA] fin
