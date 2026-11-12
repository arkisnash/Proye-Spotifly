import { api } from '../api/index.js';

export default () => ({
  persona: null,
  cargando: true,
  error: null,

  init() {
    this.cargar();
  },

  get esMio() {
    return this.$store.sesion.esYo(this.persona?.id);
  },

  async cargar() {
    this.cargando = true;
    this.error = null;
    const res = await api.usuarios.obtener(this.$store.router.params.usuario);
    this.cargando = false;

    if (!res.ok) {
      this.error = res.status === 404 ? 'Esta persona no existe.' : res.error;
      return;
    }
    this.persona = res.data;
    this.$store.router.ponerTitulo(res.data.nombre);
  },
});
