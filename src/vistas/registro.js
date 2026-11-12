//[IA] inicio ia/2026-11-11_trashcodingudp_user-dinamics.md

import { formulario } from '../utils/formulario.js';
import { reglas } from '../utils/validacion.js';

const ESQUEMA = {
  nombre: [reglas.requerido('Ingresa tu nombre.'), reglas.largo(2, 60, 'Entre 2 y 60 caracteres.')],
  usuario: [
    reglas.requerido('Elige un nombre de usuario.'),
    reglas.patron(/^[a-z0-9_]{3,20}$/, 'Usa 3 a 20 caracteres: minúsculas, números o _.'),
  ],
  email: [reglas.requerido('Ingresa tu correo.'), reglas.email()],
  password: [reglas.requerido('Crea una contraseña.'), reglas.largo(6, 100, 'Mínimo 6 caracteres.')],
  confirmar: [reglas.requerido('Repite la contraseña.'), reglas.igualA('password', 'Las contraseñas no coinciden.')],
};

export default () => ({
  ...formulario(ESQUEMA),
  form: { nombre: '', usuario: '', email: '', password: '', confirmar: '' },

  async enviar() {
    if (this.enviando || !this.validarTodo()) return;
    this.enviando = true;

    const { confirmar, ...datos } = this.form;      // "confirmar" no viaja al servidor
    const res = await this.$store.sesion.registrar(datos);
    this.enviando = false;

    if (!res.ok) return this.mostrarErroresServidor(res); // 409 y 422 por campo
    this.$store.toasts.exito(`¡Bienvenido/a, ${res.data.usuario.nombre}!`);
    this.$store.router.reemplazar('/feed');
  },
});
//[IA] fin