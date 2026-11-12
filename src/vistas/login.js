//[IA] inicio ia/2026-11-11_trashcodingudp_user-dinamics.md
import { formulario } from '../utils/formulario.js';
import { reglas } from '../utils/validacion.js';

const ESQUEMA = {
  email: [
    reglas.requerido('Ingresa tu correo.'),
    reglas.email()
  ],
  password: [
    reglas.requerido('Ingresa tu contraseña.')
  ]
};

export default function (Alpine) {
  Alpine.data('vistaLogin', () => ({
    ...formulario(ESQUEMA),

    form: {
      email: '',
      password: ''
    },

    async enviar() {
      if (this.enviando || !this.validarTodo()) return;

      this.enviando = true;
      const res = await this.$store.sesion.iniciar(this.form);
      this.enviando = false;

      if (!res.ok) {
        this.mostrarErroresServidor(res);
        return;
      }

      this.$store.router.ir('/inicio');
    }
  }));
}
//[IA] fin