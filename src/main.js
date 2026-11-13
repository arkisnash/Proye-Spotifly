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

// [IA] inicio ia/2026-11-12_arkisnash_reproductor-global.md
const pistasDemo = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
];

Alpine.store('reproductor', {
  audio: new Audio(),
  actual: null,
  sonando: false,
  tiempo: 0,
  duracion: 0,
  volumen: 0.8,

  init() {
    this.audio.volume = this.volumen;
    this.audio.addEventListener('timeupdate', () => { this.tiempo = this.audio.currentTime; });
    this.audio.addEventListener('loadedmetadata', () => { this.duracion = this.audio.duration || 0; });
    this.audio.addEventListener('ended', () => { this.sonando = false; });
  },

  reproducir(cancion) {
    if (!cancion) return;
    if (this.actual?.id !== cancion.id) {
      this.actual = cancion;
      const idx = (Number(cancion.id) || 1) % pistasDemo.length;
      this.audio.src = cancion.audioUrl || pistasDemo[idx];
      this.tiempo = 0;
    }
    this.audio.play();
    this.sonando = true;
  },

  alternar() {
    if (!this.actual) return;
    if (this.sonando) {
      this.audio.pause();
      this.sonando = false;
    } else {
      this.audio.play();
      this.sonando = true;
    }
  },

  irA(segundos) {
    if (!this.actual) return;
    this.audio.currentTime = Number(segundos);
    this.tiempo = this.audio.currentTime;
  },

  cambiarVolumen(v) {
    this.volumen = Number(v);
    this.audio.volume = this.volumen;
  },

  formato(seg) {
    if (!seg || isNaN(seg)) return '0:00';
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
});
// [IA] fin

// En las plantillas se usa $api (ej.: $api.canciones.listar())
Alpine.magic('api', () => api);

// Cada src/vistas/*.js puede registrar su lógica con Alpine.data (ver inicio.js)
Object.values(import.meta.glob('./vistas/*.js', { eager: true })).forEach((m) => m.default?.(Alpine));

Alpine.start();
iniciarRouter(Alpine);
// [IA] fin