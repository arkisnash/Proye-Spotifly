//[IA] inicio ia/2026-11-11_trashcodingudp_user-dinamics.md
import { formulario } from '../utils/formulario.js';
import { reglas } from '../utils/validacion.js';

const ESQUEMA = {
  email: [reglas.requerido('Ingresa tu correo.'), reglas.email()],
  password: [reglas.requerido('Ingresa tu contraseña.')],
};

export default () => ({
  ...formulario(ESQUEMA),
  form: { email: '', password: '' },

  async enviar() {
    if (this.enviando || !this.validarTodo()) return;
    this.enviando = true;
    const res = await this.$store.sesion.iniciar(this.form);
    this.enviando = false;

    if (!res.ok) return this.mostrarErroresServidor(res);

    this.$store.toasts.exito(`Hola de nuevo, ${res.data.usuario.nombre}.`);
    // Solo se acepta una ruta interna, para evitar redirecciones a otros sitios
    const volver = this.$store.router.query.volver;
    this.$store.router.reemplazar(volver?.startsWith('/') ? volver : '/feed');
  },
});
//[IA] fin