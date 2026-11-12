export const formulario = {
  validarEmail(email) {
    return email && email.includes('@');
  },
  validarPassword(pass) {
    return pass && pass.length >= 4;
  }
};
export const reglas = {};
