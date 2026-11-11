// authFetch.js
// Envuelve fetch() agregando automáticamente el token JWT guardado tras el login.
// Si el servidor responde 401 (token ausente/expirado), limpia la sesión y regresa al login.

function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers }).then(res => {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("rol");
      window.location.href = "/vista/login.html";
    }
    return res;
  });
}
