
//[IA] inicio ia/2026-11-11_trashcodingudp_user-dinamics.md
import Alpine from 'alpinejs';              // ← deben estar arriba (revisa que existan)
import { api } from '../api/index.js';

export default {
  // ── estado y getters (ya los tienes) ──
  usuario: api.auth.usuarioGuardado(),

  get activa() { return this.usuario !== null; },
  get esAdmin() { return this.usuario?.rol === 'admin'; },
  esYo(id) { return this.usuario?.id === id; },
  puedeModificar(autorId) { /* … */ },

  init() { /* … ya existe … */ },

  // ── AQUÍ pegas mis métodos ──
  async iniciar(datos) {
    const res = await api.auth.iniciarSesion(datos);
    if (res.ok) this.usuario = res.data.usuario;
    return res;
  },

  async registrar(datos) {
    const res = await api.auth.registrar(datos);
    if (res.ok) this.usuario = res.data.usuario;
    return res;
  },

  async actualizarPerfil(datos) {
    const res = await api.auth.actualizarPerfil(datos);
    if (res.ok) this.usuario = res.data;
    return res;
  },

  async refrescar() {
    const res = await api.auth.yo();
    if (res.ok) this.usuario = res.data;
  },

  async cerrar() {
    await api.auth.cerrarSesion();
    this.usuario = null;
    Alpine.store('toasts').info('Sesión cerrada.');
    Alpine.store('router').ir('/login');
  },
};   // ← cierre del objeto
//[IA] fin