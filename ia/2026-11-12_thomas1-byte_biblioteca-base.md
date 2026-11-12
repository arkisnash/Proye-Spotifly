# Biblioteca: listado de playlist

- **Fecha:** 2026-11-12
- **Integrante:** Thomas1-byte
- **Herramienta:** Claude (Anthropic)
- **Rama:** feat/catalogo-playlists

## Objetivo
Dejar en src/vistas/biblioteca.html la base de la vista: cargar las playlists desde la capa API y mostrarlas en tarjetas

## Prompt 1
puedes generar un html de biblioteca generico

## Respuesta 1
Se generó una vista con un solo `x-data` que llama a `$api.playlists.listar()` en `init()` y dibuja una tarjeta por playlist con `x-for`. Cada tarjeta enlaza a `#/playlist/ID`.

<section class="p-6" x-data="{
  playlists: [],

  async init() {
    const r = await $api.playlists.listar();
    if (r.ok) this.playlists = r.data;
  },
}">

  <h1>Biblioteca</h1>
  <p></p>
  <ul>
    <template>
      <li>
        <a
          class="block rounded-xl border border-borde bg-superficie p-4 hover:border-acento">
          <p class="font-semibold text-acento" x-text="p.nombre"></p>
          <p class="text-sm text-texto-2" x-text="p.descripcion"></p>
          <p class="mt-2 text-xs text-texto-2" x-text="p.cancionIds.length + ' canciones'"></p>
        </a>
      </li>
    </template>
  </ul>
</section>

## Qué se incorporó
- Todo el contenido de src/vistas/biblioteca.html (delimitado con [IA] inicio / [IA] fin).

## Verificación
- Al abrir `#/biblioteca` aparecen las 2 playlists de public/mocks/playlists.json.
- El contador muestra el total y cada tarjeta lleva a `#/playlist/ID`.
