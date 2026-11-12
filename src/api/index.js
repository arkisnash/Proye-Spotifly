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
//[IA] inicio ia/2026-11-11_trashcodingudp_user-dinamics.md
export const api = {
  config,
  canciones: recurso('canciones'),
  playlists: recurso('playlists'),
  generos: recurso('generos'),
  usuarios: recurso('usuarios'),
  auth: {
  registrar: async (datos) => {
    const res = await pedir('POST', '/auth/registro', datos);
    if (res.ok) guardarSesion(res.data);            // { token, usuario }
    return res;
  },
  iniciarSesion: async (datos) => {
    const res = await pedir('POST', '/auth/login', datos);
    if (res.ok) guardarSesion(res.data);
    return res;
  },
  cerrarSesion: async () => {
    await pedir('POST', '/auth/logout').catch(() => {});
    guardarSesion(null);                             // se borra aunque el servidor falle
    return { ok: true, status: 204, data: null, error: null };
  },
  yo: () => pedir('GET', '/yo'),
  actualizarPerfil: async (datos) => {
    const res = await pedir('PUT', '/yo', datos);
    if (res.ok) {
      const sesion = leerSesion();
      if (sesion) guardarSesion({ ...sesion, usuario: res.data }); // la sesión guardada se mantiene al día
    }
    return res;
  },
  cambiarPassword: (datos) => pedir('PUT', '/yo/password', datos),
  usuarioGuardado: () => leerSesion()?.usuario ?? null,
},
};
// [IA] fin
//[IA] inicio ia/2026-11-11_trashcodingudp_user-dinamics.md
// Capa de servicios: ÚNICO lugar que accede a los datos. Imita una API REST.
