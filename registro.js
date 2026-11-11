document.getElementById("registroForm").addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const tipoDocumento = document.getElementById("tipoDocumento").value;
  const numeroDocumento = document.getElementById("numeroDocumento").value;
  const correo = document.getElementById("correo").value;
  const contraseña = document.getElementById("contraseña").value;
  const rol = document.getElementById("rol").value;

  if (contraseña.length < 6) {
    document.getElementById("mensaje").innerHTML = `<span class="text-danger">La contraseña debe tener al menos 6 caracteres</span>`;
    return;
  }

  try {
    const res = await fetch("/usuarios/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, tipoDocumento, numeroDocumento, correo, contraseña, rol })
    });

    const data = await res.json();
    if (res.status === 200) {
      document.getElementById("mensaje").innerHTML = `<span class="text-success">Usuario registrado correctamente</span>`;
      setTimeout(() => window.location.href = "/vista/login.html", 2000);
    } else {
      document.getElementById("mensaje").innerHTML = `<span class="text-danger">${data.error || "Error en el registro"}</span>`;
    }
  } catch (error) {
    console.error("Error al registrar:", error);
    document.getElementById("mensaje").innerHTML = `<span class="text-danger">No se pudo conectar con el servidor. Intenta de nuevo.</span>`;
  }
});
