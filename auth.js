document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const tipoDocumento = document.getElementById("tipoDocumento").value;
  const numeroDocumento = document.getElementById("numeroDocumento").value;
  const contraseña = document.getElementById("contraseña").value;

  try {
    const res = await fetch("/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoDocumento, numeroDocumento, contraseña })
    });

    const data = await res.json();
    const mensajeDiv = document.getElementById("mensaje");

    if (res.status === 200) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol);
      mensajeDiv.innerHTML = `<span class="text-success">Bienvenido, rol: ${data.rol}</span>`;
      // Redirección según rol
      if (data.rol === "admin") window.location.href = "/vista/dashboard";
      else if (data.rol === "medico") window.location.href = "/vista/medicamentos";
      else if (data.rol === "repartidor") window.location.href = "/vista/entregas";
    } else {
      mensajeDiv.innerHTML = `<span class="text-danger">${data.error}</span>`;
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    document.getElementById("mensaje").innerHTML = `<span class="text-danger">No se pudo conectar con el servidor. Intenta de nuevo.</span>`;
  }
});

