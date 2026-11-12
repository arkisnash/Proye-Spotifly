export default function (Alpine) {
  Alpine.data('vistaConfiguracion', () => ({
    nombre: '',
    bio: '',
    enviando: false,
    mensaje: '',
    init() {
      const usuario = this.$store.sesion.usuario;
      this.nombre = usuario?.nombre || '';
      this.bio = usuario?.bio || '';
    },
    async guardar() {
      if (this.enviando) return;
      if (this.nombre.trim().length < 2) {
        this.mensaje = 'El nombre debe tener al menos 2 caracteres.';
        return;
      }
      if (this.bio.length > 160) {
        this.mensaje = 'La biografía admite máximo 160 caracteres.';
        return;
      }
      this.enviando = true;
      this.mensaje = '';
      const res = await this.$store.sesion.actualizarPerfil({
        nombre: this.nombre.trim(),
        bio: this.bio.trim()
      });
      this.enviando = false;
      if (!res.ok) {
        this.mensaje = 'No se pudieron guardar los cambios.';
        return;
      }
      this.mensaje = 'Cambios guardados correctamente.';
    }
  }));
}