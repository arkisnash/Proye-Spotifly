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

  renderCatalogo("");
}