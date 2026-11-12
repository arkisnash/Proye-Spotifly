
import { api } from '../api/index.js';
import { formulario } from '../utils/formulario.js';
import { reglas } from '../utils/validacion.js';

const ESQUEMA_PERFIL = {
  nombre: [reglas.requerido('Ingresa tu nombre.'), reglas.largo(2, 60, 'Entre 2 y 60 caracteres.')],
  bio: [reglas.largo(0, 160, 'Máximo 160 caracteres.')],
};

const ESQUEMA_PASSWORD = {
  actual: [reglas.requerido('Ingresa tu contraseña actual.')],
  nueva: [reglas.requerido('Ingresa la nueva contraseña.'), reglas.largo(6, 100, 'Mínimo 6 caracteres.')],
  repetir: [reglas.igualA('nueva', 'Las contraseñas no coinciden.')],
};

export default () => ({
  ...formulario(ESQUEMA_PERFIL),
  form: { nombre: '', bio: '' },

  // Segundo formulario (contraseña) con su propio estado
  pw: { actual: '', nueva: '', repetir: '' },
  pwErrores: {},
  pwEnviando: false,

  init() {
    const u = this.$store.sesion.usuario;
    this.form = { nombre: u.nombre, bio: u.bio ?? '' };
  },

  get hayCambios() {
    const u = this.$store.sesion.usuario;
    return this.form.nombre.trim() !== u.nombre || this.form.bio.trim() !== (u.bio ?? '');
  },

  async guardar() {
    if (this.enviando || !this.hayCambios || !this.validarTodo()) return;
    this.enviando = true;
    const res = await this.$store.sesion.actualizarPerfil({
      nombre: this.form.nombre.trim(),
      bio: this.form.bio.trim(),
    });
    this.enviando = false;

    if (!res.ok) return this.mostrarErroresServidor(res);
    this.$store.toasts.exito('Perfil actualizado.');
  },

  async cambiarPassword() {
    this.pwErrores = validar(this.pw, ESQUEMA_PASSWORD);
    if (Object.keys(this.pwErrores).length || this.pwEnviando) return;

    this.pwEnviando = true;
    const res = await api.auth.cambiarPassword({ actual: this.pw.actual, nueva: this.pw.nueva });
    this.pwEnviando = false;

    if (!res.ok) {
      this.pwErrores = { ...res.errores };
      return this.$store.toasts.error(res.error);
    }
    this.pw = { actual: '', nueva: '', repetir: '' };
    this.$store.toasts.exito('Contraseña actualizada.');
  },
});