export const reglas = {
  requerido: (msg = 'Campo obligatorio.') => (v) => (String(v ?? '').trim() ? '' : msg),
  email: (msg = 'Ingresa un correo válido.') => (v) => (!v || /^\S+@\S+\.\S+$/.test(v) ? '' : msg),
  largo: (min, max, msg) => (v) => {
    const n = String(v ?? '').trim().length;
    return n >= min && n <= max ? '' : msg || `Entre ${min} y ${max} caracteres.`;
  },
  patron: (re, msg = 'Formato no válido.') => (v) => (!v || re.test(v) ? '' : msg),
  igualA: (otro, msg = 'Los valores no coinciden.') => (v, form) => (v === form?.[otro] ? '' : msg),
};

export function validar(datos, esquema) {
  const errores = {};
  for (const campo of Object.keys(esquema)) {
    for (const regla of esquema[campo]) {
      const msg = regla(datos[campo], datos);
      if (msg) { errores[campo] = msg; break; }
    }
  }
  return errores;
}
