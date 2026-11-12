# Explorar parte 1: catálogo, buscador en tiempo real y 4 estados

- **Fecha:** 2026-11-11
- **Integrante:** TrashcodingUDP
- **Herramienta:** Claude (Anthropic)
- **Rama:** feat/user-dinamics

## Objetivo
Implementar y profundizar dinamicas orientadasd a usuario, proporcionando opcionalidad y alcance de personalizacion integral, con el objetivo de expandir la experiencia de usuario en un ambiente multivariable y multipropocito, con la adicion de un registro de cuentas, que nos permitira la implementacion de arquitectura digital vertical con herarquia de decision al usuario, por medio de retencion de preferencias y desiciones.

## Prompt 1
(se le entrega a claude una copia del proyecto junto con la Guia-repositorio-Sazon-DW-2026-2.pdf se le indica) implemente codigo javascript y html para establecer dinamicas de usuarios correspondientes al guardado de informacion necesaria para login, registro, configuracion y perfil. imprima la respuesta en pantalla no genere ningun archivo a parte.

## respuesta 1
Escribí el código con la arquitectura de la guía de Sazón: la vista llama a `api`, `api` guarda la sesión y el mock guarda los usuarios en `localStorage`. No abrí el contenido del ZIP `Proye-Spotifly`, así que si tu proyecto cambió nombres o prefijos (por ejemplo `spotifly:` en vez de `sazon:`), ajústalos. Los helpers `leer`, `escribir`, `siguienteId`, `tablas`, `ahora`, `esTexto`, `hayErrores`, `usuarioPrivado` y `crearToken` son los que ya existen en `endpoints.js`.

---

## 1. `src/api/mock/endpoints.js`: registro, login, perfil y contraseña

Reemplaza los manejadores `registrar`, `iniciarSesion` y `actualizarYo`, y agrega `cambiarPassword` con su fila en la tabla.

```js
// En la tabla endpoints (junto a /yo):
{ metodo: 'PUT', ruta: '/yo/password', privada: true, manejar: cambiarPassword },

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
```

---

## 2. `src/api/index.js`: grupo `auth` (guarda la sesión)

```js
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
```

---

## 3. `src/stores/sesion.js`: acciones del store

```js
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
```

---

## 4. Registro

**`src/vistas/registro.js`**
```js
import { formulario } from '../utils/formulario.js';
import { reglas } from '../utils/validacion.js';

const ESQUEMA = {
  nombre: [reglas.requerido('Ingresa tu nombre.'), reglas.largo(2, 60, 'Entre 2 y 60 caracteres.')],
  usuario: [
    reglas.requerido('Elige un nombre de usuario.'),
    reglas.patron(/^[a-z0-9_]{3,20}$/, 'Usa 3 a 20 caracteres: minúsculas, números o _.'),
  ],
  email: [reglas.requerido('Ingresa tu correo.'), reglas.email()],
  password: [reglas.requerido('Crea una contraseña.'), reglas.largo(6, 100, 'Mínimo 6 caracteres.')],
  confirmar: [reglas.requerido('Repite la contraseña.'), reglas.igualA('password', 'Las contraseñas no coinciden.')],
};

export default () => ({
  ...formulario(ESQUEMA),
  form: { nombre: '', usuario: '', email: '', password: '', confirmar: '' },

  async enviar() {
    if (this.enviando || !this.validarTodo()) return;
    this.enviando = true;

    const { confirmar, ...datos } = this.form;      // "confirmar" no viaja al servidor
    const res = await this.$store.sesion.registrar(datos);
    this.enviando = false;

    if (!res.ok) return this.mostrarErroresServidor(res); // 409 y 422 por campo
    this.$store.toasts.exito(`¡Bienvenido/a, ${res.data.usuario.nombre}!`);
    this.$store.router.reemplazar('/feed');
  },
});
```

**`src/vistas/registro.html`**
```html
<section x-data="vistaRegistro" class="animate-aparecer mx-auto max-w-md py-8 lg:py-12">
  <h1 class="titulo-pagina">Crear cuenta</h1>

  <form class="tarjeta mt-6 space-y-4 p-6" novalidate @submit.prevent="enviar()" @input="revalidar($event)">
    <div>
      <label for="reg-nombre" class="etiqueta">Nombre</label>
      <input id="reg-nombre" name="nombre" class="entrada" autocomplete="name"
             x-model.trim="form.nombre" @blur="validarCampo('nombre')"
             :aria-invalid="!!errores.nombre" aria-describedby="reg-nombre-error" />
      <p id="reg-nombre-error" class="error-campo" x-show="errores.nombre" x-cloak x-text="errores.nombre"></p>
    </div>

    <div>
      <label for="reg-usuario" class="etiqueta">Nombre de usuario</label>
      <input id="reg-usuario" name="usuario" class="entrada" autocomplete="username"
             x-model.trim="form.usuario" @blur="validarCampo('usuario')"
             :aria-invalid="!!errores.usuario" aria-describedby="reg-usuario-error" />
      <p id="reg-usuario-error" class="error-campo" x-show="errores.usuario" x-cloak x-text="errores.usuario"></p>
    </div>

    <div>
      <label for="reg-email" class="etiqueta">Correo electrónico</label>
      <input id="reg-email" name="email" type="email" class="entrada" autocomplete="email"
             x-model.trim="form.email" @blur="validarCampo('email')"
             :aria-invalid="!!errores.email" aria-describedby="reg-email-error" />
      <p id="reg-email-error" class="error-campo" x-show="errores.email" x-cloak x-text="errores.email"></p>
    </div>

    <div>
      <label for="reg-password" class="etiqueta">Contraseña</label>
      <input id="reg-password" name="password" type="password" class="entrada" autocomplete="new-password"
             x-model="form.password" @blur="validarCampo('password')"
             :aria-invalid="!!errores.password" aria-describedby="reg-password-error" />
      <p id="reg-password-error" class="error-campo" x-show="errores.password" x-cloak x-text="errores.password"></p>
    </div>

    <div>
      <label for="reg-confirmar" class="etiqueta">Repite la contraseña</label>
      <input id="reg-confirmar" name="confirmar" type="password" class="entrada" autocomplete="new-password"
             x-model="form.confirmar" @blur="validarCampo('confirmar')"
             :aria-invalid="!!errores.confirmar" aria-describedby="reg-confirmar-error" />
      <p id="reg-confirmar-error" class="error-campo" x-show="errores.confirmar" x-cloak x-text="errores.confirmar"></p>
    </div>

    <p class="alerta-error" role="alert" x-show="errorGeneral" x-cloak x-text="errorGeneral"></p>

    <button type="submit" class="btn btn-primario w-full" :disabled="enviando">
      <span x-text="enviando ? 'Creando cuenta…' : 'Crear cuenta'"></span>
    </button>
    <p class="text-center text-sm text-tenue">¿Ya tienes cuenta? <a href="#/login" class="text-acento">Inicia sesión</a></p>
  </form>
</section>
```

---

## 5. Login

**`src/vistas/login.js`**
```js
import { formulario } from '../utils/formulario.js';
import { reglas } from '../utils/validacion.js';

const ESQUEMA = {
  email: [reglas.requerido('Ingresa tu correo.'), reglas.email()],
  password: [reglas.requerido('Ingresa tu contraseña.')],
};

export default () => ({
  ...formulario(ESQUEMA),
  form: { email: '', password: '' },

  async enviar() {
    if (this.enviando || !this.validarTodo()) return;
    this.enviando = true;
    const res = await this.$store.sesion.iniciar(this.form);
    this.enviando = false;

    if (!res.ok) return this.mostrarErroresServidor(res);

    this.$store.toasts.exito(`Hola de nuevo, ${res.data.usuario.nombre}.`);
    // Solo se acepta una ruta interna, para evitar redirecciones a otros sitios
    const volver = this.$store.router.query.volver;
    this.$store.router.reemplazar(volver?.startsWith('/') ? volver : '/feed');
  },
});
```

**`src/vistas/login.html`**: usa el mismo patrón de campos que el registro, con `email` y `password`. Cambia `form`, `enviar()` y los textos.

```html
<section x-data="vistaLogin" class="animate-aparecer mx-auto max-w-md py-8 lg:py-12">
  <h1 class="titulo-pagina">Iniciar sesión</h1>
  <form class="tarjeta mt-6 space-y-4 p-6" novalidate @submit.prevent="enviar()" @input="revalidar($event)">
    <div>
      <label for="login-email" class="etiqueta">Correo electrónico</label>
      <input id="login-email" name="email" type="email" class="entrada" autocomplete="email"
             x-model.trim="form.email" @blur="validarCampo('email')"
             :aria-invalid="!!errores.email" aria-describedby="login-email-error" />
      <p id="login-email-error" class="error-campo" x-show="errores.email" x-cloak x-text="errores.email"></p>
    </div>
    <div>
      <label for="login-password" class="etiqueta">Contraseña</label>
      <input id="login-password" name="password" type="password" class="entrada" autocomplete="current-password"
             x-model="form.password" @blur="validarCampo('password')"
             :aria-invalid="!!errores.password" aria-describedby="login-password-error" />
      <p id="login-password-error" class="error-campo" x-show="errores.password" x-cloak x-text="errores.password"></p>
    </div>
    <p class="alerta-error" role="alert" x-show="errorGeneral" x-cloak x-text="errorGeneral"></p>
    <button type="submit" class="btn btn-primario w-full" :disabled="enviando">
      <span x-text="enviando ? 'Ingresando…' : 'Ingresar'"></span>
    </button>
    <p class="text-center text-sm text-tenue">¿No tienes cuenta? <a href="#/registro" class="text-acento">Regístrate</a></p>
  </form>
</section>
```

---

## 6. Configuración (editar perfil y contraseña)

**`src/vistas/configuracion.js`**
```js
import { api } from '../api/index.js';
import { formulario } from '../utils/formulario.js';
import { reglas } from '../utils/validacion.js';

const ESQUEMA_PERFIL = {
  nombre: [reglas.requerido('Ingresa tu nombre.'), reglas.largo(2, 60, 'Entre 2 y 60 caracteres.')],
  bio: [reglas.largo(0, 160, 'Máximo 160 caracteres.')],
};

const ESQUEMA_PASSWORD = {
  actual: [reglas.requerido('Ingresa tu contraseña actual.')],
  nueva: [reglas.requerido('Ingresa la nueva contraseña.'), reglas.largo(6, 100, 'Mínimo 6 caracteres.')],
  repetir: [reglas.igualA('nueva', 'Las contraseñas no coinciden.')],
};

export default () => ({
  ...formulario(ESQUEMA_PERFIL),
  form: { nombre: '', bio: '' },

  // Segundo formulario (contraseña) con su propio estado
  pw: { actual: '', nueva: '', repetir: '' },
  pwErrores: {},
  pwEnviando: false,

  init() {
    const u = this.$store.sesion.usuario;
    this.form = { nombre: u.nombre, bio: u.bio ?? '' };
  },

  get hayCambios() {
    const u = this.$store.sesion.usuario;
    return this.form.nombre.trim() !== u.nombre || this.form.bio.trim() !== (u.bio ?? '');
  },

  async guardar() {
    if (this.enviando || !this.hayCambios || !this.validarTodo()) return;
    this.enviando = true;
    const res = await this.$store.sesion.actualizarPerfil({
      nombre: this.form.nombre.trim(),
      bio: this.form.bio.trim(),
    });
    this.enviando = false;

    if (!res.ok) return this.mostrarErroresServidor(res);
    this.$store.toasts.exito('Perfil actualizado.');
  },

  async cambiarPassword() {
    this.pwErrores = validar(this.pw, ESQUEMA_PASSWORD);
    if (Object.keys(this.pwErrores).length || this.pwEnviando) return;

    this.pwEnviando = true;
    const res = await api.auth.cambiarPassword({ actual: this.pw.actual, nueva: this.pw.nueva });
    this.pwEnviando = false;

    if (!res.ok) {
      this.pwErrores = { ...res.errores };
      return this.$store.toasts.error(res.error);
    }
    this.pw = { actual: '', nueva: '', repetir: '' };
    this.$store.toasts.exito('Contraseña actualizada.');
  },
});
```
Agrega `import { reglas, validar } from '../utils/validacion.js';` (en vez del import de arriba) porque `cambiarPassword` usa `validar` directamente.

**`src/vistas/configuracion.html`** (reemplaza o agrega estas secciones dentro de la vista existente)
```html
<section x-data="vistaConfiguracion" class="animate-aparecer mx-auto max-w-2xl space-y-8 py-8 lg:py-12">
  <h1 class="titulo-pagina">Configuración</h1>

  <!-- Datos de la cuenta -->
  <form class="tarjeta space-y-4 p-6" novalidate @submit.prevent="guardar()" @input="revalidar($event)">
    <h2 class="font-display text-xl font-medium">Perfil</h2>

    <div>
      <label class="etiqueta">Correo</label>
      <input class="entrada" disabled :value="$store.sesion.usuario.email" />
      <p class="ayuda">El correo no se puede cambiar.</p>
    </div>

    <div>
      <label for="cfg-nombre" class="etiqueta">Nombre</label>
      <input id="cfg-nombre" name="nombre" class="entrada" x-model.trim="form.nombre"
             @blur="validarCampo('nombre')" :aria-invalid="!!errores.nombre" aria-describedby="cfg-nombre-error" />
      <p id="cfg-nombre-error" class="error-campo" x-show="errores.nombre" x-cloak x-text="errores.nombre"></p>
    </div>

    <div>
      <label for="cfg-bio" class="etiqueta">Biografía</label>
      <textarea id="cfg-bio" name="bio" rows="3" maxlength="160" class="entrada" x-model="form.bio"
                @blur="validarCampo('bio')" :aria-invalid="!!errores.bio" aria-describedby="cfg-bio-error"></textarea>
      <p class="ayuda"><span x-text="form.bio.length"></span>/160</p>
      <p id="cfg-bio-error" class="error-campo" x-show="errores.bio" x-cloak x-text="errores.bio"></p>
    </div>

    <p class="alerta-error" role="alert" x-show="errorGeneral" x-cloak x-text="errorGeneral"></p>
    <button type="submit" class="btn btn-primario" :disabled="enviando || !hayCambios">
      <span x-text="enviando ? 'Guardando…' : 'Guardar cambios'"></span>
    </button>
  </form>

  <!-- Contraseña -->
  <form class="tarjeta space-y-4 p-6" novalidate @submit.prevent="cambiarPassword()">
    <h2 class="font-display text-xl font-medium">Cambiar contraseña</h2>

    <div>
      <label for="pw-actual" class="etiqueta">Contraseña actual</label>
      <input id="pw-actual" type="password" class="entrada" autocomplete="current-password"
             x-model="pw.actual" :aria-invalid="!!pwErrores.actual" aria-describedby="pw-actual-error" />
      <p id="pw-actual-error" class="error-campo" x-show="pwErrores.actual" x-cloak x-text="pwErrores.actual"></p>
    </div>
    <div>
      <label for="pw-nueva" class="etiqueta">Nueva contraseña</label>
      <input id="pw-nueva" type="password" class="entrada" autocomplete="new-password"
             x-model="pw.nueva" :aria-invalid="!!pwErrores.nueva" aria-describedby="pw-nueva-error" />
      <p id="pw-nueva-error" class="error-campo" x-show="pwErrores.nueva" x-cloak x-text="pwErrores.nueva"></p>
    </div>
    <div>
      <label for="pw-repetir" class="etiqueta">Repite la nueva contraseña</label>
      <input id="pw-repetir" type="password" class="entrada" autocomplete="new-password"
             x-model="pw.repetir" :aria-invalid="!!pwErrores.repetir" aria-describedby="pw-repetir-error" />
      <p id="pw-repetir-error" class="error-campo" x-show="pwErrores.repetir" x-cloak x-text="pwErrores.repetir"></p>
    </div>
    <button type="submit" class="btn btn-secundario" :disabled="pwEnviando">Actualizar contraseña</button>
  </form>

  <button type="button" class="btn btn-peligro" @click="$store.sesion.cerrar()">Cerrar sesión</button>
</section>
```
El tema claro/oscuro ya se guarda con `api.preferencias`, así que deja el selector que ya trae tu `configuracion.html`.

---

## 7. Perfil

**`src/vistas/perfil.js`**
```js
import { api } from '../api/index.js';

export default () => ({
  persona: null,
  cargando: true,
  error: null,

  init() {
    this.cargar();
  },

  get esMio() {
    return this.$store.sesion.esYo(this.persona?.id);
  },

  async cargar() {
    this.cargando = true;
    this.error = null;
    const res = await api.usuarios.obtener(this.$store.router.params.usuario);
    this.cargando = false;

    if (!res.ok) {
      this.error = res.status === 404 ? 'Esta persona no existe.' : res.error;
      return;
    }
    this.persona = res.data;
    this.$store.router.ponerTitulo(res.data.nombre);
  },
});
```

**`src/vistas/perfil.html`** (cabecera)
```html
<section x-data="vistaPerfil" class="animate-aparecer py-8 lg:py-12">
  <div class="mt-0">
    <!-- @incluir src/componentes/estado-error.html -->
  </div>

  <header x-show="persona && !cargando" x-cloak class="tarjeta flex flex-wrap items-center gap-5 p-6">
    <span class="avatar size-20 text-xl" :class="$fmt.colorAvatar(persona?.id)"
          x-text="$fmt.iniciales(persona?.nombre ?? '')" aria-hidden="true"></span>

    <div class="min-w-0 flex-1">
      <h1 class="titulo-pagina" x-text="persona?.nombre"></h1>
      <p class="text-tenue">@<span x-text="persona?.usuario"></span> · se unió en <span x-text="$fmt.mesYAnio(persona?.creadoEn)"></span></p>
      <p class="mt-2" x-show="persona?.bio" x-text="persona?.bio"></p>
      <p class="mt-3 text-sm text-tenue">
        <span x-text="persona?.totalRecetas"></span> recetas ·
        <span x-text="persona?.totalSeguidores"></span> seguidores ·
        <span x-text="persona?.totalSiguiendo"></span> siguiendo
      </p>
    </div>

    <!-- Mi perfil: editar. Perfil ajeno: seguir -->
    <a x-show="esMio" href="#/configuracion" class="btn btn-secundario">Editar perfil</a>
    <template x-if="persona && !esMio && $store.sesion.activa">
      <div x-data="botonSeguir(persona)"><!-- @incluir src/componentes/boton-seguir.html --></div>
    </template>
  </header>
</section>
```
Si tu `perfil.html` ya tiene pestañas, conserva el resto y reemplaza solo la cabecera.

---

## 8. Cómo funciona el guardado

| Dato | Dónde se guarda | Clave en `localStorage` |
|---|---|---|
| Usuarios (registro, perfil, contraseña) | Tabla del mock | `sazon:db:usuarios` |
| Sesión (`{ token, usuario }`) | `api/index.js` | `sazon:sesion` |
| Tema | `api.preferencias` | `sazon:pref:tema` |

- El **registro** crea el usuario en la tabla y deja la sesión iniciada, así que la persona no tiene que ingresar otra vez.
- El **login** compara correo y contraseña, y guarda el token para que la sesión sobreviva a recargar.
- La **configuración** actualiza la tabla y también la sesión guardada, para que el nombre se vea al instante en el encabezado.
- El **perfil** lee los datos públicos y muestra «Editar perfil» solo si es el tuyo.

Para probar, entra con `ana@sazon.cl` / `sazon123`, cambia la biografía y recarga: se mantiene. Para empezar de cero, usa «Restablecer datos» o `localStorage.clear()`.

Si usas tu propio prefijo (`mitienda:`), cámbialo también en el script de `index.html` y en `sesion.js`, como indica el capítulo 10 de la guía.

Estas contraseñas están en texto plano solo porque es un mock. Con un backend real deben ir con hash (bcrypt o argon2).

## Resumen en una línea
```
se genera una mock API que luego se usa para generar un pseudo registro de datos
```


## Qué se incorporó
- Todo el contenido de src/vistas/configuiracion.html, src/vistas/configuiracion.js, src/vistas/login.html, src/vistas/login.js, src/vistas/registro.html, src/vistas/registro.js, src/api/endpoints.js, src/vistas/perfil.html, src/vistas/perfil.js  (delimitado con [IA] inicio / [IA] fin).


## Verificación
- pagina responsiva

## prompt 2 
explique en profundidad la utilidad de cada codigo y sus funciones clave

## respuesta 2
# Explicación del código

Sigo el mismo orden de los archivos, de los datos hacia la pantalla. Es el recorrido que hace una acción: la vista llama al store, el store a `api`, `api` al servidor simulado y el endpoint guarda en `localStorage`.

## 1. `endpoints.js`: el "backend" simulado

Es la capa que decide qué es válido, qué se guarda y qué se responde. Aunque el frontend ya valida, esta capa vuelve a validar, porque la validación del navegador se puede saltar.

**`registrar`**
- **Normalización:** `trim()` quita espacios, y `usuario` y `email` pasan a minúsculas. Así `Ana@Mail.cl` y `ana@mail.cl` son la misma cuenta.
- **`String(cuerpo.x ?? '')`:** protege contra campos que no lleguen o que no sean texto. Sin esto, un `undefined.trim()` rompería el servidor.
- **Dos tipos de error:**
  - `422` significa que los datos tienen mal formato (correo inválido, contraseña corta).
  - `409` significa que los datos son válidos pero chocan con algo existente (correo o usuario repetido).
  
  La vista los trata distinto, y ambos traen `errores` por campo para marcar el input exacto.
- **`siguienteId(t.usuarios)`:** simula el autoincremento de una base de datos.
- **`rol: 'usuario'` fijo:** el rol nunca se toma del cuerpo. Si lo aceptara, cualquiera podría registrarse como `admin`.
- **Respuesta:** `{ token, usuario }`. `usuarioPrivado` elimina la contraseña antes de enviar. Esa es la razón de los serializadores.

**`iniciarSesion`**
- Busca un usuario donde coincidan correo y contraseña a la vez. El mensaje de error es genérico a propósito ("Correo o contraseña incorrectos"). Si dijera "el correo no existe", ayudaría a un atacante a descubrir qué correos están registrados.
- Devuelve `401` (credenciales inválidas) y no `404`.

**`actualizarYo`**
- Solo acepta `nombre` y `bio`. No toma `rol`, `email` ni `id`: se hace una lista blanca de campos editables.
- `{ ...actual, nombre, bio }` copia el usuario completo y sobrescribe solo esos dos campos.
- `usuarios.map(...)` reemplaza solo la fila del usuario y deja las demás intactas. Se identifica al usuario por `yo.id`, que viene del token y no del cuerpo. Por eso nadie puede editar el perfil de otra persona.

**`cambiarPassword`**
- Exige la contraseña actual, aunque ya haya sesión. Así, si alguien deja el computador abierto, no puede cambiar la clave sin saber la anterior.
- Devuelve `sinContenido()` (204), porque no hay nada útil que devolver.
- Es `privada: true`. El servidor ya devuelve `401` antes de llamar al manejador si no hay sesión.

## 2. `api/index.js`: la puerta única y la persistencia de sesión

Aquí se cruzan los datos y la sesión. Las vistas nunca tocan `localStorage`.

- **`registrar` e `iniciarSesion`:** hacen la petición y, **solo si `res.ok`**, llaman a `guardarSesion(res.data)`. Eso escribe `{ token, usuario }` en `sazon:sesion`. Por esa clave la sesión sobrevive a recargar la página. Después de cada petición, `pedir()` ya agrega ese token a las siguientes.
- **`cerrarSesion`:** tiene `.catch(() => {})` y luego `guardarSesion(null)`. Si el servidor falla, la persona igual queda desconectada en su navegador. Si no, un error de red la dejaría "atrapada" con sesión.
- **`actualizarPerfil`:** además de pedir el cambio, reescribe la sesión guardada con `{ ...sesion, usuario: res.data }`. Sin ese paso, el servidor tendría el nombre nuevo pero `sazon:sesion` el viejo, y al recargar volverías a ver el nombre antiguo hasta que `refrescar()` lo corrigiera.
- **`usuarioGuardado`:** no es una petición, es una lectura síncrona. El store `sesion` la usa al arrancar para que el encabezado muestre el nombre de inmediato, sin esperar al servidor.
- **`cambiarPassword`:** no toca la sesión, porque el token no cambia con la contraseña.

## 3. `stores/sesion.js`: el estado global

El store es la "memoria viva" de quién está conectado. `api` guarda en disco y el store mantiene el estado reactivo que usa el HTML.

- **`iniciar` y `registrar`:** llaman a `api`, actualizan `this.usuario` si salió bien y **devuelven la respuesta completa**. Ese retorno permite que la vista decida qué hacer en caso de error sin que el store sepa nada de formularios.
- **Efecto de actualizar `this.usuario`:** como es reactivo, el encabezado, el menú y los getters `activa`, `esAdmin` y `puedeModificar` cambian solos. El router también lo consulta para sus guardias.
- **`refrescar`:** pide `/yo` al servidor y sincroniza el usuario. Se usa al arrancar para detectar cambios hechos desde otro lado o una sesión caducada.
- **`cerrar`:** pone `usuario = null`, avisa con un toast y navega al login. El orden importa: primero se borra la sesión y después se navega, porque si fuera al revés el router podría ver una sesión aún activa.

## 4. Registro (`registro.js` y `registro.html`)

**`ESQUEMA`:** es un objeto con una lista de reglas por campo. Se evalúan en orden y se muestra solo el primer error. Por eso `requerido` va antes que `largo`: un campo vacío dice "Ingresa tu nombre" y no "mínimo 2 caracteres".

**`...formulario(ESQUEMA)`:** copia en el componente todo el estado y los métodos comunes: `errores`, `errorGeneral`, `enviando`, `validarCampo`, `revalidar`, `validarTodo` y `mostrarErroresServidor`. Así no se reescribe lógica de formularios en cada vista.

**`enviar()`:**
1. `if (this.enviando || !this.validarTodo()) return;` cubre dos casos. Evita el doble clic que crearía dos cuentas y detiene el envío si hay errores locales (además enfoca el primer campo inválido).
2. `const { confirmar, ...datos } = this.form;` separa el campo de confirmación. Solo sirve para comparar en el navegador y no debe viajar ni guardarse.
3. `mostrarErroresServidor(res)` pinta los errores `409` y `422` debajo de cada campo.
4. Si todo sale bien, `reemplazar('/feed')` redirige sin dejar `/registro` en el historial.

**En el HTML**, cada campo repite cuatro piezas:
- `x-model.trim` enlaza el valor y quita espacios.
- `@blur` valida al salir del campo.
- `:aria-invalid` pinta el borde rojo (la clase `.entrada` reacciona a ese atributo) y avisa a los lectores de pantalla.
- `aria-describedby` conecta el input con su mensaje de error.

`@input="revalidar($event)"` en el `<form>` hace que el error desaparezca en cuanto la persona lo corrige. `novalidate` desactiva las burbujas nativas del navegador para que se vean los mensajes propios.

## 5. Login (`login.js` y `login.html`)

Usa el mismo mecanismo, pero con un detalle clave sobre la redirección.

```js
const volver = this.$store.router.query.volver;
this.$store.router.reemplazar(volver?.startsWith('/') ? volver : '/feed');
```

Cuando una ruta privada te manda al login, el router agrega `?volver=/ruta`, y tras ingresar se te devuelve ahí. La comprobación `startsWith('/')` es una defensa: solo acepta rutas internas. Sin ella, un enlace malicioso con `?volver=https://sitio-falso.com` podría redirigir a otro sitio después del login (*open redirect*).

`autocomplete="current-password"` y `"new-password"` permiten que el gestor de contraseñas del navegador distinga login de registro.

## 6. Configuración (`configuracion.js` y `.html`)

Aquí hay **dos formularios independientes** en un mismo componente.

- **Perfil:** usa el mixin `formulario`, con `form`, `errores` y `enviando`.
- **Contraseña:** como el mixin ya ocupó esos nombres, se creó un segundo juego (`pw`, `pwErrores`, `pwEnviando`) y se valida directamente con `validar(this.pw, ESQUEMA_PASSWORD)`.

Piezas clave:
- **`init()`:** copia los datos del usuario al formulario. Se copian y no se enlazan directo al store a propósito: si `x-model` escribiera sobre `$store.sesion.usuario`, el encabezado cambiaría mientras tecleas, antes de guardar.
- **`hayCambios` (getter):** compara el formulario con el usuario guardado, y el botón Guardar queda deshabilitado mientras no haya diferencias. Evita peticiones inútiles y le muestra a la persona si hay algo pendiente.
- **`igualA('nueva', ...)`:** compara el campo "repetir" con el campo `nueva` del mismo objeto de datos. Esa es la razón de que las reglas reciban `(valor, datos)`.
- **Después de cambiar la contraseña** se limpia `pw`, para no dejar contraseñas en memoria ni en pantalla.
- **Campo de correo con `disabled`:** muestra el dato pero no permite editarlo, y el servidor tampoco lo acepta. La restricción existe en ambos lados.
- **Contador `form.bio.length/160`:** feedback inmediato. `maxlength` limita en el navegador y el servidor valida igual.

## 7. Perfil (`perfil.js` y `.html`)

- **`router.params.usuario`:** viene de la ruta `/u/:usuario`. Si el patrón no está en `RUTAS`, nunca llega.
- **`obtener` devuelve el perfil con contadores calculados** (`totalRecetas`, `totalSeguidores`, `loSigo`), que arma el serializador `perfil()` del servidor. La vista solo los muestra.
- **`res.status === 404 ? 'Esta persona no existe.' : res.error`:** usa el código HTTP para mostrar un mensaje específico, tal como describe el capítulo 6 de la guía.
- **`esMio` (getter):** decide qué botón aparece. En tu perfil verás "Editar perfil", que lleva a Configuración. En el de otra persona verás "Seguir".
- **`ponerTitulo(res.data.nombre)`:** pone el nombre en la pestaña del navegador.

## 8. El flujo completo

```
Persona escribe → x-model → form
   └─ @submit → enviar()
        ├─ validarTodo()                 (validación local)
        ├─ $store.sesion.registrar()     (store)
        │    └─ api.auth.registrar()     (puerta única)
        │         ├─ pedir() + token     → servidor mock (latencia, endpoint)
        │         │    └─ registrar()    → valida, escribe sazon:db:usuarios
        │         └─ guardarSesion()     → escribe sazon:sesion
        ├─ store.usuario = ...           (la UI reacciona sola)
        └─ router.reemplazar('/feed')
```

Cada capa tiene una sola responsabilidad, y por eso el mock puede cambiarse por un backend real sin modificar ninguna vista.

## Advertencias

- **Contraseñas en texto plano:** es aceptable solo porque es un mock. Con un backend real se usan hashes (bcrypt o argon2) y tokens firmados (JWT).
- **El token `mock-token-N` es falsificable:** cualquiera puede escribirlo a mano en `localStorage`. En producción debe firmarlo el servidor.
- **`perfil.html`:** reemplacé solo la cabecera. Si tu archivo tiene pestañas (recetas, seguidores, siguiendo), mantenlas debajo.
- **`botonSeguir`:** envolví el componente en un `<div x-data="botonSeguir(persona)">` por mi cuenta. Revisa cómo lo hace `tarjeta-persona.html` en tu repositorio y copia ese mismo patrón, porque `boton-seguir.html` podría ya declarar su propio `x-data`.
- **No abrí el ZIP `Proye-Spotifly`:** todo se basó en la guía. Si tu código real difiere (nombres de campos, prefijos o rutas), esos puntos hay que adaptarlos.

## prompt 3
los codigos entregados en la primera respuesta al principio pueden funcionar como aditivos al proyecto original?

## promt 4
**En parte.** Solo una porción de lo que entregué se puede agregar sin tocar nada. El resto reemplaza código que, según la guía, el proyecto original ya tiene. Además, no abrí el ZIP `Proye-Spotifly`, así que esto se basa en la estructura de Sazón que describe la guía.

## Lo que sí es aditivo (no existe en el original)

| Pieza | Dónde |
|---|---|
| Endpoint `PUT /yo/password` y su manejador `cambiarPassword` | `endpoints.js` (una fila en la tabla y una función nueva) |
| `cambiarPassword: (datos) => pedir('PUT', '/yo/password', datos)` | dentro del grupo `auth` de `api/index.js` |
| Formulario "Cambiar contraseña" con `pw`, `pwErrores`, `pwEnviando` y el método `cambiarPassword()` | `configuracion.js` y `.html` |

Estas piezas no chocan con nada, siempre que le agregues a `configuracion.js` el import de `validar`:
```js
import { reglas, validar } from '../utils/validacion.js';
```

## Lo que reemplaza código existente (no pegar encima)

- **`registrar`, `iniciarSesion` y `actualizarYo` en `endpoints.js`:** estas funciones ya existen en el original. Si pegas las mías sin borrar las anteriores, JavaScript lanza `Identifier 'registrar' has already been declared` y la app no arranca.
- **El grupo `auth` en `api/index.js`:** ya existe con esas mismas funciones. Duplicar la clave `auth` en el objeto `api` no da error, pero la última sobrescribe a la primera sin avisar. Eso es peor, porque puedes perder funciones como `usuarioGuardado` sin notarlo.
- **Métodos de `sesion.js`:** `iniciar`, `registrar`, `actualizarPerfil`, `refrescar` y `cerrar` ya existen.
- **`login.html/.js` y `registro.html/.js`:** el original ya los tiene completos y con la misma convención. Mis versiones son equivalentes, no mejoras.

## Lo que perdería funcionalidad si lo pegas completo

- **`configuracion.html`:** lo escribí desde cero. El original incluye el selector de tema, el acordeón y el simulador de API, que mi versión no tiene.
- **`perfil.html`:** mi versión solo trae la cabecera. El original tiene las pestañas de recetas, seguidores y siguiendo.

## Cómo integrarlo sin romper nada

1. Si tu proyecto parte de Sazón, **registro, login, perfil y sesión ya funcionan**. No hace falta reemplazarlos.
2. Agrega solo la tabla de arriba (cambio de contraseña).
3. Para lo demás, compara mi código con el tuyo y copia únicamente las diferencias que te interesen, por ejemplo la defensa de `volver` en el login o el getter `hayCambios`.
4. Haz un commit antes de pegar. Si algo falla, `git diff` te muestra qué cambió.
5. Revisa la consola: un `Alpine Expression Error` indica una referencia suelta.

Si quieres, abro el ZIP y reviso qué tiene ya implementado tu proyecto. Con eso te digo exactamente qué agregar y qué descartar, sin duplicados.

## prompt 4
el codigo api endpoints me da error en la primera linea y el index.js tambien da error

## respuesta 4
Lo más probable es que pegaste esos fragmentos tal cual, al nivel principal del archivo. Eran trozos para insertar **dentro** de una estructura que ya existe, y por eso fallan en la primera línea.

## `endpoints.js`

Mi primera línea era esta:

```js
{ metodo: 'PUT', ruta: '/yo/password', privada: true, manejar: cambiarPassword },
```

Es un elemento del arreglo `endpoints`. Suelta en el archivo, JavaScript no la entiende y marca error de sintaxis. Va dentro del arreglo que ya existe al inicio del archivo:

```js
export const endpoints = [
  // …las filas que ya tienes…
  { metodo: 'GET', ruta: '/yo', privada: true, manejar: ({ yo }) => ok(usuarioPrivado(yo)) },
  { metodo: 'PUT', ruta: '/yo', privada: true, manejar: actualizarYo },
  { metodo: 'PUT', ruta: '/yo/password', privada: true, manejar: cambiarPassword }, // ← nueva
  // …
];
```

Las **funciones** (`cambiarPassword`, y `registrar`, `iniciarSesion` y `actualizarYo` si decides reemplazarlas) van **debajo** del arreglo, como funciones sueltas.

Si el error dice `Identifier 'registrar' has already been declared`, es porque ya existe una función con ese nombre. Borra la original antes de pegar la mía, o pega solo `cambiarPassword`.

## `index.js`

Mi bloque empezaba así:

```js
auth: {
  registrar: async (datos) => { ... },
  ...
},
```

Eso es una propiedad del objeto `api`, no código suelto. Va dentro de `export const api = { ... }`, **reemplazando** el grupo `auth` que ya tienes (no lo dejes duplicado):

```js
export const api = {
  auth: {
    // ← aquí pega el contenido de mi grupo auth
  },
  categorias: { /* …sin tocar… */ },
  recetas: { /* …sin tocar… */ },
  // …
};
```

Ten cuidado con una cosa: tu `auth` original trae también `usuarioGuardado`, y mi versión lo incluye. Si borras el tuyo y pegas el mío, quedan todas las funciones.

## Para no equivocarte

- **Mínimo cambio:** deja tu `auth` como está y agrega solo una línea dentro de él:
  ```js
  cambiarPassword: (datos) => pedir('PUT', '/yo/password', datos),
  ```
- Si el error sigue, pásame el mensaje exacto de la consola o del terminal, con el archivo y la línea. También puedo abrir el ZIP y darte los archivos ya integrados, sin fragmentos sueltos.

## prompt 5
el tercer script rodeado de que debe ir?

## respuesta 5 
El tercer bloque es el de `src/stores/sesion.js`. Son **métodos de un objeto**, no código suelto, así que van dentro de las llaves del `export default { ... }` de ese archivo, separados por comas.

## Estructura donde va

```js
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
```

## Puntos que causan errores

- **Comas:** cada método termina con `,` (el último puede llevarla o no). Si falta una, el error aparece en la línea siguiente.
- **Sin `function` ni `const`:** se escribe `async iniciar(datos) { ... }`, no `function iniciar`.
- **Duplicados:** tu original ya tiene `iniciar`, `registrar`, `actualizarPerfil`, `refrescar` y `cerrar`. Si pegas los míos sin borrar los tuyos, no da error, pero la última definición sobrescribe a la primera sin avisar. Reemplaza, no dupliques.
- **Imports:** `Alpine` y `api` deben estar importados arriba, porque los métodos los usan.
- **Dependencia de `api/index.js`:** estos métodos llaman a `api.auth.iniciarSesion`, `registrar`, `actualizarPerfil`, `yo` y `cerrarSesion`. Tienen que existir con esos nombres en tu grupo `auth`.

Si te sigue marcando error, pega aquí tu `sesion.js` completo y el mensaje de la consola, y te lo devuelvo ya integrado.

## prompt 6
para conectar las paginas entre si, login no inicia las demas paginas

## respuesta 6
Si el login funciona pero las otras páginas no cargan, el problema casi siempre está en la **conexión entre ruta, vista y registro**. Cada página necesita las mismas piezas en cuatro lugares, y si falta una, aparece en blanco o como "Página no encontrada".

## Diagnóstico en 30 segundos

Inicia sesión y, en la consola del navegador (F12), escribe:

```js
location.hash                        // ¿qué ruta tiene? ej. "#/feed"
Alpine.store('sesion').usuario       // ¿hay usuario o es null?
Alpine.store('router').vista         // ¿qué vista cree el router que debe mostrar?
```

| Resultado | Causa probable |
|---|---|
| `usuario` es `null` tras el login | El login no guarda la sesión (revisa `iniciar` en `sesion.js` y `guardarSesion` en `api/index.js`) |
| `vista` es `'no-encontrado'` | Falta la ruta en `RUTAS` o el patrón no coincide |
| `vista` es correcta pero la pantalla sigue en blanco | Falta el `<template x-if>` en `index.html` o el nombre no coincide |
| Error rojo `vistaX is not defined` | Falta `Alpine.data('vistaX', vistaX)` en `main.js` |
| `location.hash` no cambia | La redirección del login apunta a una ruta que no existe, o el router no se inició |

## Las 4 conexiones que debe tener cada página

Ejemplo con una página `feed` (cambia el nombre por la tuya):

**1. `src/stores/router.js`: la ruta**
```js
const RUTAS = [
  { patron: '/login', vista: 'login', titulo: 'Iniciar sesión', soloInvitados: true },
  { patron: '/feed',  vista: 'feed',  titulo: 'Inicio', seccion: '/feed', privada: true },
  // …
];
```

**2. `index.html`: el montaje** (dentro de `<main>`)
```html
<template x-if="$store.router.vista === 'feed'">
  <!-- @incluir src/vistas/feed.html -->
</template>
```
El texto `'feed'` debe ser **idéntico** al `vista` de la ruta.

**3. `src/main.js`: el registro** (antes de `Alpine.start()`)
```js
import vistaFeed from './vistas/feed.js';
// …
Alpine.data('vistaFeed', vistaFeed);
```

**4. `src/vistas/feed.html`: el nombre del componente**
```html
<section x-data="vistaFeed" class="animate-aparecer py-8">…</section>
```
El `x-data` debe coincidir con el nombre de `Alpine.data`.

## Dónde redirige el login

En `login.js`:
```js
this.$store.router.reemplazar(volver?.startsWith('/') ? volver : '/feed');
```
Si tu proyecto **no tiene** la ruta `/feed`, el login te manda a una página inexistente. Cambia `'/feed'` por la ruta que sí tengas (por ejemplo `'/inicio'` o `'/explorar'`).

## Errores comunes al conectar páginas

- **Enlaces sin hash:** deben ser `href="#/feed"`, no `href="/feed"` ni `href="feed.html"`. Con `/feed` el navegador recarga y pierde la app.
- **Rutas sin `/` inicial en JS:** `router.ir('/feed')`, no `router.ir('feed')`.
- **Orden de `RUTAS`:** `/recetas/nueva` debe ir antes de `/recetas/:id`, o "nueva" se interpreta como un id.
- **Router no iniciado:** al final de `main.js` debe estar `Alpine.start(); Alpine.store('router').iniciar();`. Sin eso, nada resuelve las rutas.
- **Registrar tras `start()`:** todo `Alpine.data` y `Alpine.store` va **antes** de `Alpine.start()`.
- **Ruta `privada: true` sin sesión:** te devuelve al login. Si inicias sesión y vuelve, `usuario` no se está guardando.
- **Abrir con doble clic:** debe usarse `npm run dev`, no `file://`.
- **Menú:** para que aparezcan los enlaces, agrégalos al arreglo `menu` del router: `{ ruta: '/feed', texto: 'Inicio' }`.

## Si sigue sin funcionar

Envíame estas tres cosas y te lo dejo corregido:

1. El mensaje exacto de la consola (texto rojo).
2. Tu arreglo `RUTAS` completo de `router.js`.
3. Las líneas de `index.html` con los `<template x-if>`.

Con eso identifico cuál de las cuatro conexiones falta.
