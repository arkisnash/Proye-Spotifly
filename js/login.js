var loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var correo = document.getElementById("loginCorreo").value.trim();
    var clave = document.getElementById("loginClave").value.trim();
    var error = document.getElementById("loginError");

    if (correo === "" || clave === "") {
      error.textContent = "Completa correo y contraseña.";
      return;
    }

    // Esta E1 no valida contra una base de datos real: solo
    // simulamos una sesión iniciada, guardando el nombre de usuario.
    var partes = correo.split("@");
    var nombre = partes[0];
    localStorage.setItem("spotifly_user", nombre);
    window.location.href = "dashboard.html";
  });
}