// [IA] inicio ia/2026-11-05_arkisnash_esqueleto-base.md
import Alpine from 'alpinejs';
import './css/app.css';
import { api } from './api/index.js';
import { iniciarRouter } from './router.js';

window.Alpine = Alpine;

// Tema claro/oscuro (se recuerda en localStorage; por defecto, oscuro)
Alpine.store('tema', {
  oscuro: localStorage.getItem('bst:tema') !== 'claro',
  init() { this.aplicar(); },
  alternar() { this.oscuro = !this.oscuro; this.aplicar(); },
  aplicar() {
    document.documentElement.classList.toggle('dark', this.oscuro);
    localStorage.setItem('bst:tema', this.oscuro ? 'oscuro' : 'claro');
  },
});

// Sesión simulada
Alpine.store('sesion', {
  usuario: JSON.parse(localStorage.getItem('bst:sesion') || 'null'),
  entrar(u) { this.usuario = u; localStorage.setItem('bst:sesion', JSON.stringify(u)); },
  salir() { this.usuario = null; localStorage.removeItem('bst:sesion'); location.hash = '#/login'; },
});

// Notificaciones: Alpine.store('toast').mostrar('Playlist creada')
Alpine.store('toast', {
  items: [],
  mostrar(texto) {
    const t = { id: Date.now() + Math.random(), texto };
    this.items.push(t);
    setTimeout(() => { this.items = this.items.filter((i) => i.id !== t.id); }, 3500);
  },
});

// Estado del router: vista actual, parámetro de la URL (#/cancion/3 -> '3') y texto del buscador
Alpine.store('router', { html: '', ruta: '', param: null, busqueda: '' });

// En las plantillas se usa $api (ej.: $api.canciones.listar())
Alpine.magic('api', () => api);

// Cada src/vistas/*.js puede registrar su lógica con Alpine.data (ver inicio.js)
Object.values(import.meta.glob('./vistas/*.js', { eager: true })).forEach((m) => m.default?.(Alpine));

Alpine.start();
iniciarRouter(Alpine);
// [IA] fin
