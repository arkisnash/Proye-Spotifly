# Explorar parte 1: catálogo, buscador en tiempo real y 4 estados

- **Fecha:** 2026-11-09
- **Integrante:** Thomas1-byte
- **Herramienta:** Claude (Anthropic)
- **Rama:** feat/catalogo-playlists

## Objetivo
Implementar en src/vistas/explorar.html la carga del catálogo desde la capa API y un buscador en tiempo real por título y buscar por genero.

## Prompt 1
podrias darme un ejemplo generico de como realizar un menu para una pagina web donde salgan todos los articulos (que en este caso son canciones) donde pueda realizar busquedas por nombre y genero individuales y se puedan ordenar

## Respuesta 1
Este ejemplo es un solo archivo que funciona sin instalar nada: lo guardas como `catalogo.html` y lo abres en el navegador. 

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta>
  <title>Catálogo de canciones</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>

<section 
  x-data="{
    <!-- Lista de camciones -->
    canciones: [{ id: 1, titulo: 'nombre-cancion',    artista: 'nombre-artista',   genero: 'nombre-genero',    duracion: 1 }],

    busqueda: '',
    genero: '',
    orden: 'titulo-asc',

    get generos() {
      return [...new Set(this.canciones.map((c) => c.genero))].sort();
    },

    get resultado() {
      const q = this.busqueda.trim().toLowerCase();
      const lista = this.canciones.filter((c) =>
        (!q || c.titulo.toLowerCase().includes(q)) &&
        (!this.genero || c.genero === this.genero));

      const [campo, dir] = this.orden.split('-');
      return lista.sort((a, b) => {
        const r = typeof a[campo] === 'number'
          ? a[campo] - b[campo]
          : a[campo].localeCompare(b[campo]);
        return dir === 'desc' ? -r : r;
      });
    },

    formatoDuracion(seg) {
      return Math.floor(seg / 60) + ':' + String(seg % 60).padStart(2, '0');
    },
  }>

  <h1>Catálogo</h1>

  <!-- Controles: cada uno actúa por separado -->
  <div class="mt-4 grid gap-3 sm:grid-cols-3">
    <input type="search" x-model="busqueda" placeholder="Buscar por nombre"
      class="rounded-lg border border-violet-700 bg-gray-900 px-4 py-2" />

    <select x-model="genero" class="rounded-lg border border-violet-700 bg-gray-900 px-4 py-2">
      <option value="">Todos los géneros</option>
      <template x-for="g in generos" :key="g">
        <option :value="g" x-text="g"></option>
      </template>
    </select>

    <select x-model="orden" class="rounded-lg border border-violet-700 bg-gray-900 px-4 py-2">
      <option value="titulo-asc">Título (A-Z)</option>
      <option value="titulo-desc">Título (Z-A)</option>
      <option value="artista-asc">Artista (A-Z)</option>
      <option value="duracion-asc">Duración (menor a mayor)</option>
      <option value="duracion-desc">Duración (mayor a menor)</option>
    </select>
  </div>

  <p></p>

  <!-- Vacío -->
  <p>No hay canciones con esos filtros.</p>

  <!-- Lista -->
  <ul>
    <template x-for="c in resultado" :key="c.id">
      <li>
        <div>
          <p x-text="c.titulo"></p>
          <p x-text="c.artista + ' · ' + c.genero"></p>
        </div>
        <span></span>
      </li>
    </template>
  </ul>
</section>

</body>
</html>
```

## Cómo funciona

El patrón es el mismo de siempre: **tres controles, tres variables y una lista calculada**.

| Control | Variable | Efecto |
|---|---|---|
| Input de texto | `busqueda` | Filtra por nombre |
| Select de género | `genero` | Filtra por género (`''` significa todos) |
| Select de orden | `orden` | Define el criterio, por ejemplo `titulo-asc` |

- **`generos`** arma la lista de géneros a partir de las canciones. `new Set` elimina los repetidos y `.sort()` los ordena. Así el select no necesita escribirse a mano.
- **`resultado`** hace dos cosas seguidas. Primero `filter` deja solo las canciones que cumplen **ambas** condiciones: el nombre contiene el texto (o no hay texto) **y** el género coincide (o no hay género elegido). Después `sort` ordena. El valor de `orden` se parte en dos con `split('-')`: el campo (`titulo`) y la dirección (`asc` o `desc`). Si el campo es un número, como la duración, se restan; si es texto, se usa `localeCompare`, que respeta tildes y la ñ.
- Los tres controles usan `x-model`, así que cualquier cambio recalcula `resultado` y la lista se redibuja sola.


## Prompt 2
puedes explicarme el funcionamiento de este codigo

## Respuesta 2
Te lo explico en el orden en que ocurre todo, de arriba hacia abajo.

## 1. Las librerías
```html
<script src="...@tailwindcss/browser@4"></script>
<script defer src="...alpinejs..."></script>
```
- **Alpine.js** da la lógica: hace que la página reaccione cuando cambian los datos. El `defer` hace que se cargue después de leer el HTML.

## 2. El componente: `x-data`
```html
<section x-data="{ ... }">
```
Todo lo que está dentro de `x-data` es la "memoria" del componente. Cualquier elemento dentro del `<section>` puede leer esos datos y reaccionar cuando cambian.

## 3. Los datos
```js
canciones: [ ... ],   // la lista completa, nunca se modifica
busqueda: '',         // texto del buscador
genero: '',           // género elegido ('' = todos)
orden: 'titulo-asc',  // criterio de orden
```
La clave del diseño es que **`canciones` nunca se toca**. Los filtros y el orden trabajan sobre una copia, así que borrar un filtro siempre devuelve la lista completa.

## 4. `get generos`: la lista del select
```js
return [...new Set(this.canciones.map((c) => c.genero))].sort();
```
Se lee de adentro hacia afuera:
1. `map` saca solo el género de cada canción: `['Rock', 'Jass', 'Pop', ...]`
2. `new Set(...)` elimina los repetidos.
3. `[...]` lo convierte de nuevo en arreglo.
4. `.sort()` lo ordena alfabéticamente.

Así el select se arma solo con los géneros que existen.

## 5. `get resultado`: el corazón del código
Tiene dos etapas.

**Etapa 1: filtrar**
```js
const q = this.busqueda.trim().toLowerCase();
const lista = this.canciones.filter((c) =>
  (!q || c.titulo.toLowerCase().includes(q)) &&
  (!this.genero || c.genero === this.genero));
```
Una canción se queda en la lista solo si cumple **las dos condiciones** (`&&`):
- `!q || ...includes(q)`: si el buscador está vacío, pasa; si no, el título debe contener el texto.
- `!this.genero || c.genero === this.genero`: si no hay género elegido, pasa; si hay, debe coincidir exactamente.

Por eso los filtros funcionan por separado o juntos. Si dejas uno vacío, esa condición siempre se cumple y no filtra nada. El `toLowerCase()` hace que "BRUMA" y "bruma" sean lo mismo.

**Etapa 2: ordenar**
```js
const [campo, dir] = this.orden.split('-');
```
Si `orden` vale `'duracion-desc'`, esto lo parte en `campo = 'duracion'` y `dir = 'desc'`.

```js
return lista.sort((a, b) => {
  const r = typeof a[campo] === 'number'
    ? a[campo] - b[campo]
    : a[campo].localeCompare(b[campo]);
  return dir === 'desc' ? -r : r;
});
```
`sort` compara canciones de a pares (`a` y `b`) y necesita un número como respuesta:
- Negativo: `a` va antes que `b`.
- Positivo: `a` va después.
- Cero: quedan igual.

El código elige cómo comparar según el tipo de dato:
- **Números** (duración): la resta funciona directamente.
- **Texto** (título, artista): `localeCompare` ordena bien con tildes y ñ.

Al final, si el orden es descendente, se invierte el signo (`-r`) y el resultado queda al revés.

## 6. `formatoDuracion(seg)`
```js
Math.floor(seg / 60) + ':' + String(seg % 60).padStart(2, '0')
```
Con 214 segundos: `214 / 60 = 3,56`, y `Math.floor` da `3` minutos. `214 % 60 = 34` segundos. `padStart(2, '0')` asegura dos dígitos, así 5 segundos se ve `05` y no `5`. Resultado: `3:34`.

## 7. El HTML: cómo se conecta con los datos

| Directiva | Qué hace |
|---|---|
| `x-model="busqueda"` | Enlaza el input con la variable en ambos sentidos: si escribes, la variable cambia; si la variable cambia, el input se actualiza |
| `x-for="g in generos"` | Repite el elemento una vez por cada género |
| `:key="g"` | Identificador único de cada elemento repetido, para que Alpine sepa cuál es cuál |
| `:value="g"` | Pone el valor del `<option>` (los `:` significan "evalúa esto como código") |
| `x-text="c.titulo"` | Escribe el valor como texto dentro del elemento |
| `x-show="resultado.length === 0"` | Muestra u oculta el elemento según la condición |

El `<template>` que envuelve a los `x-for` es obligatorio. Alpine lo usa como molde para clonar.

## 8. Qué pasa cuando haces algo
Ejemplo: eliges "Synth pop" en el select.
1. `x-model` cambia `genero` a `'Synth pop'`.
2. Alpine detecta que `resultado` depende de `genero` y lo recalcula.
3. El filtro deja solo 2 canciones y `sort` las ordena.
4. El `x-for` de la lista se redibuja con esas 2 canciones.
5. El contador (`resultado.length + ' canciones'`) pasa a decir "2 canciones".

No escribiste ninguna función que "actualice la pantalla". Alpine hace ese trabajo porque sabe qué datos usa cada parte del HTML.

## Resumen en una línea
```
controles (x-model) → variables (busqueda, genero, orden) → resultado (filtra y ordena) → x-for dibuja la lista
```


## Qué se incorporó
- Todo el contenido de src/vistas/explorar.html (delimitado con [IA] inicio / [IA] fin).
- Se adapto el contenido generado a la vista natural de la pagina 

## Verificación
- Skeletons visibles durante la carga simulada.
- Búsqueda en tiempo real por título y genero.
