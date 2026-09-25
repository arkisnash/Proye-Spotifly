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