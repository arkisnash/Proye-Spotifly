// [IA] inicio ia/2026-11-05_arkisnash_esqueleto-base.md
// Cada ruta #/nombre carga src/vistas/nombre.html. #/cancion/3 usa la vista "cancion" con param = '3'.
const vistas = import.meta.glob('./vistas/*.html', { query: '?raw', import: 'default', eager: true });
const publicas = ['login', 'registro', '404'];

export function iniciarRouter(Alpine) {
  const r = Alpine.store('router');
  const s = Alpine.store('sesion');

  const ir = () => {
    const [nombre, param = null] = location.hash.replace(/^#\/?/, '').split('/');
    let n = nombre || 'inicio';
    if (!vistas[`./vistas/${n}.html`]) n = '404';
    if (!publicas.includes(n) && !s.usuario) { location.hash = '#/login'; return; } // vistas privadas
    if (n === 'admin' && s.usuario?.rol !== 'admin') n = '404';
    r.param = param;
    r.ruta = n;
    r.html = vistas[`./vistas/${n}.html`];
    window.scrollTo(0, 0);
  };

  addEventListener('hashchange', ir);
  ir();
}
// [IA] fin
