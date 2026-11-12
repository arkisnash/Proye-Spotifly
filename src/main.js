// [IA] inicio ia/2026-11-05_arkisnash_esqueleto-base.md
import Alpine from 'alpinejs';
import './css/app.css';
import { api } from './api/index.js';
import { iniciarRouter } from './router.js';

window.Alpine = Alpine;

// Tema de la pagina
Alpine.store('tema', {
  oscuro: localStorage.getItem('bst:tema') !== 'claro',

  alternar() {
    this.oscuro = !this.oscuro;
    this.aplicar();
  },

  aplicar() {
    document.documentElement.classList.toggle('dark', this.oscuro);
    localStorage.setItem('bst:tema', this.oscuro ? 'oscuro' : 'claro');
  }
});

// Sesion del usuario
Alpine.store('sesion', {
  usuario: JSON.parse(localStorage.getItem('bst:sesion') || 'null'),

  get activa() {
    return this.usuario !== null;
  },

  get estaAutenticado() {
    return this.activa;
  },

  get esAdmin() {
    return this.usuario?.rol === 'admin';
  },

  entrar(usuario) {
    this.usuario = usuario;
    localStorage.setItem('bst:sesion', JSON.stringify(usuario));
  },

  async iniciar(datos) {
    const res = await api.usuarios.listar();

    if (!res.ok) return { ok: false, error: 'No se pudieron cargar los usuarios.' };

    const usuario = res.data.find(u =>
      u.correo === datos.email && u.clave === datos.password
    );

    if (!usuario) {
      return { ok: false, error: 'Correo o contraseña incorrectos.' };
    }

    this.entrar(usuario);
    return { ok: true, data: { usuario } };
  },

  async registrar(datos) {
    const res = await api.usuarios.listar();

    if (!res.ok) return { ok: false, error: 'No se pudieron revisar los usuarios.' };

    const existe = res.data.some(u =>
      u.correo === datos.email || u.usuario === datos.usuario
    );

    if (existe) {
      return { ok: false, error: 'El correo o usuario ya está registrado.' };
    }

    const nuevo = await api.usuarios.crear({
      nombre: datos.nombre,
      usuario: datos.usuario,
      correo: datos.email,
      clave: datos.password,
      rol: 'usuario',
      bio: ''
    });

    if (!nuevo.ok) return nuevo;

    this.entrar(nuevo.data);
    return { ok: true, data: { usuario: nuevo.data } };
  },

  async actualizarPerfil(datos) {
    const res = await api.usuarios.actualizar(this.usuario.id, datos);

    if (res.ok) this.entrar(res.data);

    return res;
  },

  esYo(id) {
    return this.usuario?.id === id;
  },

  cerrar() {
    this.usuario = null;
    localStorage.removeItem('bst:sesion');
    location.hash = '#/login';
  },

  salir() {
    this.cerrar();
  }
});

// Mensajes
Alpine.store('toasts', {
  mostrar(texto) {
    alert(texto);
  },
  exito(texto) {
    this.mostrar(texto);
  },
  error(texto) {
    this.mostrar(texto);
  },
  info(texto) {
    this.mostrar(texto);
  }
});

Alpine.store('toast', {
  mensaje: '',
  mostrar(texto) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 3000);
  }
});

Alpine.store('router', {
  html: '',
  ruta: '',
  param: null,
  busqueda: '',
  params: {},
  query: {},
  ir(ruta) {
    location.hash = '#' + ruta;
  },
  reemplazar(ruta) {
    location.hash = '#' + ruta;
  }
});

Alpine.magic('api', () => api);

Object.values(import.meta.glob('./vistas/*.js', { eager: true }))
  .forEach(m => m.default?.(Alpine));

Alpine.start();
Alpine.store('tema').aplicar();
iniciarRouter(Alpine);
// [IA] fin
