function seedData() {
  if (!localStorage.getItem("spotifly_artists")) {
    var artistas = [
      { id: 1, nombre: "Luna Marea", activo: true },
      { id: 2, nombre: "Nico Rivas", activo: true },
      { id: 3, nombre: "Colectivo Sur", activo: true },
      { id: 4, nombre: "Eva Ríos", activo: true }
    ];
    localStorage.setItem("spotifly_artists", JSON.stringify(artistas));
  }

  if (!localStorage.getItem("spotifly_songs")) {
    var canciones = [
      { id: 1, titulo: "Marea Baja", artistaId: 1, activo: true },
      { id: 2, titulo: "Horizonte", artistaId: 1, activo: true },
      { id: 3, titulo: "Calle Sola", artistaId: 2, activo: true },
      { id: 4, titulo: "Luz de Noviembre", artistaId: 2, activo: true },
      { id: 5, titulo: "Puerto Libre", artistaId: 3, activo: true },
      { id: 6, titulo: "Estación Sur", artistaId: 3, activo: true },
      { id: 7, titulo: "Vidrio", artistaId: 4, activo: true },
      { id: 8, titulo: "Antesala", artistaId: 4, activo: true }
    ];
    localStorage.setItem("spotifly_songs", JSON.stringify(canciones));
  }

  if (!localStorage.getItem("spotifly_favorites")) {
    localStorage.setItem("spotifly_favorites", JSON.stringify([]));
  }
  if (!localStorage.getItem("spotifly_playlists")) {
    localStorage.setItem("spotifly_playlists", JSON.stringify([]));
  }
  if (!localStorage.getItem("spotifly_history")) {
    localStorage.setItem("spotifly_history", JSON.stringify([]));
  }
}
seedData();
function getArtists() {
  return JSON.parse(localStorage.getItem("spotifly_artists"));
}
function getSongs() {
  return JSON.parse(localStorage.getItem("spotifly_songs"));
}
function getFavorites() {
  return JSON.parse(localStorage.getItem("spotifly_favorites"));
}
function getPlaylists() {
  return JSON.parse(localStorage.getItem("spotifly_playlists"));
}
function getHistory() {
  return JSON.parse(localStorage.getItem("spotifly_history"));
}
function getUser() {
  return localStorage.getItem("spotifly_user");
}

function saveArtists(lista) {
  localStorage.setItem("spotifly_artists", JSON.stringify(lista));
}
function saveSongs(lista) {
  localStorage.setItem("spotifly_songs", JSON.stringify(lista));
}
function saveFavorites(lista) {
  localStorage.setItem("spotifly_favorites", JSON.stringify(lista));
}
function savePlaylists(lista) {
  localStorage.setItem("spotifly_playlists", JSON.stringify(lista));
}
function saveHistory(lista) {
  localStorage.setItem("spotifly_history", JSON.stringify(lista));
}
function artistName(artistaId) {
  var artistas = getArtists();
  var nombreEncontrado = "Desconocido";
  for (var i = 0; i < artistas.length; i++) {
    if (artistas[i].id === artistaId) {
      nombreEncontrado = artistas[i].nombre;
    }
  }
  return nombreEncontrado;
}

var PALETA = ["#8b6cf0", "#f0687a", "#5fd192", "#f0b95c", "#5cb8f0", "#c06cf0"];

function colorFor(id) {
  return PALETA[id % PALETA.length];
}

function inicial(texto) {
  if (texto) {
    return texto.charAt(0).toUpperCase();
  } else {
    return "?";
  }
}
function protegerPagina() {
  var necesitaSesion = document.body.hasAttribute("data-requires-auth");
  if (necesitaSesion && !getUser()) {
    window.location.href = "index.html";
  }
}
protegerPagina();

function pintarNavbar() {
  var tag = document.getElementById("userTag");
  if (tag && getUser()) {
    tag.textContent = "Hola, " + getUser();
  }

  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("spotifly_user");
      window.location.href = "index.html";
    });
  }
}
pintarNavbar();

function pintarSidebarPlaylists() {
  var contenedor = document.getElementById("sidebarPlaylists");
  if (!contenedor) return;

  var playlists = getPlaylists();

  if (playlists.length === 0) {
    contenedor.innerHTML = '<span class="sidebar-playlist-item">Sin playlists aún</span>';
    return;
  }

  var html = "";
  for (var i = 0; i < playlists.length; i++) {
    html += '<a href="playlists.html" class="sidebar-playlist-item">' + playlists[i].nombre + "</a>";
  }
  contenedor.innerHTML = html;
}
pintarSidebarPlaylists();