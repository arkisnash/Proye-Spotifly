// [IA] inicio ia/2026-11-05_arkisnash_esqueleto-base.md
// Capa de servicios: ÚNICO lugar que accede a los datos. Imita una API REST.
// Todas las funciones devuelven una Promesa con { ok, status, data, error }.
const KEY = 'bst:';
export const config = { probabilidadFallo: 0 }; // ej.: 0.3 para forzar errores y probar la interfaz

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (data, status = 200) => ({ ok: true, status, data, error: null });
const fallo = (status, error) => ({ ok: false, status, data: null, error });

// Lee un recurso: primero localStorage (cambios del usuario), si no, el JSON de public/mocks/
async function leer(nombre) {
  const g = localStorage.getItem(KEY + nombre);
  if (g) return JSON.parse(g);
  const res = await fetch(`${import.meta.env.BASE_URL}mocks/${nombre}.json`);
  if (!res.ok) throw new Error('mock no encontrado');
  const datos = await res.json();
  localStorage.setItem(KEY + nombre, JSON.stringify(datos));
  return datos;
}
const guardar = (nombre, datos) => localStorage.setItem(KEY + nombre, JSON.stringify(datos));

// Simula latencia (300-800 ms) y fallos aleatorios
async function llamar(fn) {
  await esperar(300 + Math.random() * 500);
  if (Math.random() < config.probabilidadFallo) return fallo(500, 'Error simulado del servidor');
  try { return await fn(); } catch { return fallo(500, 'No se pudieron cargar los datos'); }
}

// CRUD genérico: listar, obtener, crear, actualizar, eliminar
function recurso(nombre) {
  return {
    listar: (f = {}) => llamar(async () => {
      let d = await leer(nombre);
      const q = (f.busqueda || '').toLowerCase();
      if (q) d = d.filter((x) => JSON.stringify(x).toLowerCase().includes(q));
      return ok(d);
    }),
    obtener: (id) => llamar(async () => {
      const x = (await leer(nombre)).find((x) => x.id == id);
      return x ? ok(x) : fallo(404, 'No encontrado');
    }),
    crear: (datos) => llamar(async () => {
      const d = await leer(nombre);
      const nuevo = { ...datos, id: Math.max(0, ...d.map((x) => x.id)) + 1 };
      guardar(nombre, [...d, nuevo]);
      return ok(nuevo, 201);
    }),
    actualizar: (id, datos) => llamar(async () => {
      const d = await leer(nombre);
      const i = d.findIndex((x) => x.id == id);
      if (i < 0) return fallo(404, 'No encontrado');
      d[i] = { ...d[i], ...datos };
      guardar(nombre, d);
      return ok(d[i]);
    }),
    eliminar: (id) => llamar(async () => {
      const d = await leer(nombre);
      if (!d.some((x) => x.id == id)) return fallo(404, 'No encontrado');
      guardar(nombre, d.filter((x) => x.id != id));
      return ok(null);
    }),
  };
}

export const api = {
  config,
  canciones: recurso('canciones'),
  playlists: recurso('playlists'),
  generos: recurso('generos'),
  usuarios: recurso('usuarios'),
  auth: {
    iniciarSesion: ({ correo, clave }) => llamar(async () => {
      const u = (await leer('usuarios')).find((x) => x.correo === correo && x.clave === clave);
      if (!u) return fallo(401, 'Correo o contraseña incorrectos');
      const { clave: _omitida, ...publico } = u;
      return ok(publico);
    }),
    registrar: ({ nombre, correo, clave }) => llamar(async () => {
      const d = await leer('usuarios');
      if (d.some((x) => x.correo === correo)) return fallo(409, 'Ese correo ya está registrado');
      const nuevo = { id: Math.max(0, ...d.map((x) => x.id)) + 1, nombre, correo, clave, rol: 'usuario' };
      guardar('usuarios', [...d, nuevo]);
      const { clave: _omitida, ...publico } = nuevo;
      return ok(publico, 201);
    }),
  },
};
// [IA] fin
