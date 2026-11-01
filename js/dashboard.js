var catalogoGrid = document.getElementById("catalogoGrid");
if (catalogoGrid) {
  var soloFavoritos = false;

  function renderCatalogo(filtro) {
    if (!filtro) filtro = "";
    var favoritos = getFavorites();
    var todasLasCanciones = getSongs();

    var cancionesFiltradas = [];
    for (var i = 0; i < todasLasCanciones.length; i++) {
      var cancion = todasLasCanciones[i];
      var coincideBusqueda = cancion.titulo.toLowerCase().indexOf(filtro.toLowerCase()) !== -1;
      var esFavoritaSiCorresponde = true;
      if (soloFavoritos) {
        esFavoritaSiCorresponde = favoritos.indexOf(cancion.id) !== -1;
      }
      if (cancion.activo && coincideBusqueda && esFavoritaSiCorresponde) {
        cancionesFiltradas.push(cancion);
      }
    }

    if (cancionesFiltradas.length === 0) {
      catalogoGrid.innerHTML = '<div class="empty-state">No se encontraron canciones.</div>';
      return;
    }

    var html = "";
    for (var j = 0; j < cancionesFiltradas.length; j++) {
      var c = cancionesFiltradas[j];
      var esFavorito = favoritos.indexOf(c.id) !== -1;
      var textoFavorito;
      if (esFavorito) {
        textoFavorito = "♥ Quitar";
      } else {
        textoFavorito = "♡ Favorito";
      }

      html += '<div class="card">';
      html += '<div class="thumb thumb-card" style="background:' + colorFor(c.id) + '">' + inicial(c.titulo) + "</div>";
      html += "<h3>" + c.titulo + "</h3>";
      html += '<div class="artist">' + artistName(c.artistaId) + "</div>";
      html += '<div class="card-actions">';
      html += '<button onclick="reproducir(' + c.id + ')">▶ Reproducir</button>';
      html += '<button class="secondary" onclick="alternarFavorito(' + c.id + ')">' + textoFavorito + "</button>";
      html += "</div>";
      html += '<div class="card-actions">';
      html += '<button class="secondary" onclick="agregarAPlaylist(' + c.id + ')">+ Playlist</button>';
      html += "</div>";
      html += "</div>";
    }
    catalogoGrid.innerHTML = html;
  }
    window.reproducir = function (cancionId) {
    var canciones = getSongs();
    var cancionEncontrada = null;
    for (var i = 0; i < canciones.length; i++) {
      if (canciones[i].id === cancionId) cancionEncontrada = canciones[i];
    }

    var historial = getHistory();
    historial.unshift({
      cancionId: cancionEncontrada.id,
      titulo: cancionEncontrada.titulo,
      artista: artistName(cancionEncontrada.artistaId),
      fecha: new Date().toLocaleString()
    });
    saveHistory(historial);
    alert("Reproduciendo: " + cancionEncontrada.titulo);
  };

  window.alternarFavorito = function (cancionId) {
    var favoritos = getFavorites();
    var yaEsFavorito = favoritos.indexOf(cancionId) !== -1;
    var nuevaLista = [];

    if (yaEsFavorito) {
      for (var i = 0; i < favoritos.length; i++) {
        if (favoritos[i] !== cancionId) nuevaLista.push(favoritos[i]);
      }
    } else {
      for (var j = 0; j < favoritos.length; j++) nuevaLista.push(favoritos[j]);
      nuevaLista.push(cancionId);
    }

    saveFavorites(nuevaLista);
    renderCatalogo(document.getElementById("buscador").value);
  };

  window.agregarAPlaylist = function (cancionId) {
    var playlists = getPlaylists();
    if (playlists.length === 0) {
      alert("Primero crea una playlist en la sección Playlists.");
      return;
    }

    var textoOpciones = "";
    for (var i = 0; i < playlists.length; i++) {
      textoOpciones += (i + 1) + ". " + playlists[i].nombre + "\n";
    }

    var eleccion = prompt("¿A qué playlist agregar esta canción?\n" + textoOpciones);
    var indice = parseInt(eleccion, 10) - 1;
    if (isNaN(indice) || !playlists[indice]) return;

    var yaEstaEnPlaylist = playlists[indice].canciones.indexOf(cancionId) !== -1;
    if (!yaEstaEnPlaylist) {
      playlists[indice].canciones.push(cancionId);
      savePlaylists(playlists);
      alert("Agregada a " + playlists[indice].nombre);
    }
  };

  document.getElementById("buscador").addEventListener("input", function (evento) {
    renderCatalogo(evento.target.value);
  });

  var pillTodos = document.getElementById("pillTodos");
  var pillFavoritos = document.getElementById("pillFavoritos");
  if (pillTodos && pillFavoritos) {
    pillTodos.addEventListener("click", function () {
      soloFavoritos = false;
      pillTodos.classList.add("active");
      pillFavoritos.classList.remove("active");
      renderCatalogo(document.getElementById("buscador").value);
    });
    pillFavoritos.addEventListener("click", function () {
      soloFavoritos = true;
      pillFavoritos.classList.add("active");
      pillTodos.classList.remove("active");
      renderCatalogo(document.getElementById("buscador").value);
    });
  }

  renderCatalogo("");
}