
//[IA] inicio ia/2026-11-11_trashcodingudp_user-dinamics.md
// En la tabla endpoints (junto a /yo):
export const endpoints = [
  // …las filas que ya tienes…
  { metodo: 'GET', ruta: '/yo', privada: true, manejar: ({ yo }) => ok(usuarioPrivado(yo)) },
  { metodo: 'PUT', ruta: '/yo', privada: true, manejar: actualizarYo },
  { metodo: 'PUT', ruta: '/yo/password', privada: true, manejar: cambiarPassword }, // ← nueva
  // …
];

/* ───────────── Cuentas ───────────── */
function registrar({ cuerpo }) {
  const t = tablas();
  const datos = {
    nombre: String(cuerpo.nombre ?? '').trim(),
    usuario: String(cuerpo.usuario ?? '').trim().toLowerCase(),
    email: String(cuerpo.email ?? '').trim().toLowerCase(),
    password: String(cuerpo.password ?? ''),
  };

  const errores = {};
  if (!esTexto(datos.nombre, 2, 60)) errores.nombre = 'El nombre debe tener entre 2 y 60 caracteres.';
  if (!/^[a-z0-9_]{3,20}$/.test(datos.usuario)) errores.usuario = 'Usa 3 a 20 caracteres: minúsculas, números o _.';
  if (!/^\S+@\S+\.\S+$/.test(datos.email)) errores.email = 'Ingresa un correo válido.';
  if (datos.password.length < 6) errores.password = 'La contraseña debe tener al menos 6 caracteres.';
  if (hayErrores(errores)) return fallo(422, 'Revisa los datos del registro.', errores);

  const conflictos = {};
  if (t.usuarios.some((u) => u.email === datos.email)) conflictos.email = 'Ese correo ya tiene una cuenta.';
  if (t.usuarios.some((u) => u.usuario === datos.usuario)) conflictos.usuario = 'Ese nombre de usuario ya está en uso.';
  if (hayErrores(conflictos)) return fallo(409, 'Ya existe una cuenta con esos datos.', conflictos);

  const nuevo = { id: siguienteId(t.usuarios), ...datos, rol: 'usuario', bio: '', creadoEn: ahora() };
  escribir('usuarios', [...t.usuarios, nuevo]);
  return creado({ token: crearToken(nuevo), usuario: usuarioPrivado(nuevo) });
}

function iniciarSesion({ cuerpo }) {
  const email = String(cuerpo.email ?? '').trim().toLowerCase();
  const password = String(cuerpo.password ?? '');

  const errores = {};
  if (!email) errores.email = 'Ingresa tu correo.';
  if (!password) errores.password = 'Ingresa tu contraseña.';
  if (hayErrores(errores)) return fallo(422, 'Completa los campos.', errores);

  const u = leer('usuarios').find((x) => x.email === email && x.password === password);
  if (!u) return fallo(401, 'Correo o contraseña incorrectos.');
  return ok({ token: crearToken(u), usuario: usuarioPrivado(u) });
}

function actualizarYo({ cuerpo, yo }) {
  const nombre = String(cuerpo.nombre ?? '').trim();
  const bio = String(cuerpo.bio ?? '').trim();

  const errores = {};
  if (!esTexto(nombre, 2, 60)) errores.nombre = 'El nombre debe tener entre 2 y 60 caracteres.';
  if (bio.length > 160) errores.bio = 'La biografía admite hasta 160 caracteres.';
  if (hayErrores(errores)) return fallo(422, 'Revisa los datos del perfil.', errores);

  const usuarios = leer('usuarios');
  const actual = usuarios.find((u) => u.id === yo.id);
  const actualizado = { ...actual, nombre, bio };
  escribir('usuarios', usuarios.map((u) => (u.id === yo.id ? actualizado : u)));
  return ok(usuarioPrivado(actualizado));
}

function cambiarPassword({ cuerpo, yo }) {
  const errores = {};
  if (cuerpo.actual !== yo.password) errores.actual = 'La contraseña actual no coincide.';
  if (String(cuerpo.nueva ?? '').length < 6) errores.nueva = 'Debe tener al menos 6 caracteres.';
  if (hayErrores(errores)) return fallo(422, 'No se pudo cambiar la contraseña.', errores);

  const usuarios = leer('usuarios');
  escribir('usuarios', usuarios.map((u) => (u.id === yo.id ? { ...u, password: cuerpo.nueva } : u)));
  return sinContenido();
}
//[IA] fin