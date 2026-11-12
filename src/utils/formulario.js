import { validar } from './validacion.js';

export const formulario = (esquema) => ({
  errores: {},
  errorGeneral: '',
  enviando: false,

  validarCampo(campo) {
    const e = validar(this.form, { [campo]: esquema[campo] || [] });
    if (e[campo]) this.errores[campo] = e[campo];
    else delete this.errores[campo];
  },
  revalidar(ev) {
    const campo = ev?.target?.name;
    if (campo && this.errores[campo] && esquema[campo]) this.validarCampo(campo);
    this.errorGeneral = '';
  },
  validarTodo() {
    this.errores = validar(this.form, esquema);
    return Object.keys(this.errores).length === 0;
  },
  mostrarErroresServidor(res) {
    this.errores = { ...(res.errores || {}) };
    this.errorGeneral = res.error || 'No se pudo completar la acción.';
  },
});
