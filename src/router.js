// [IA] inicio ia/2026-11-05_arkisnash_esqueleto-base.md
// Cada ruta #/nombre carga src/vistas/nombre.html. #/cancion/3 usa la vista "cancion" con param = '3'.
const vistas = import.meta.glob('./vistas/*.html', {
  query: '?raw',
  import: 'default',
  eager: true
});

const publicas = ['login', 'registro', '404'];

export function iniciarRouter(Alpine) {
  const router = Alpine.store('router');
  const sesion = Alpine.store('sesion');

  function cambiarVista() {
    const partes = location.hash.replace(/^#\/?/, '').split('/');
    let nombre = partes[0] || 'inicio';

    if (!vistas[`./vistas/${nombre}.html`]) {
      nombre = '404';
    }

    if (!publicas.includes(nombre) && !sesion.estaAutenticado) {
      location.hash = '#/login';
      return;
    }

    if (nombre === 'admin' && !sesion.esAdmin) {
      nombre = '404';
    }

    router.ruta = nombre;
    router.param = partes[1] || null;
    router.html = vistas[`./vistas/${nombre}.html`];

    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', cambiarVista);
  cambiarVista();
}
// [IA] fin
