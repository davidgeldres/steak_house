// auth.js - Funciones de autenticación y utilidades globales

const API_URL = "http://localhost:4001/api";

/* ============================================================
   GESTIÓN DE SESIÓN
============================================================ */

function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function getSession() {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch (e) {
    // error parsing
  }
  return { token, user };
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function getCurrentUser() {
  const { user } = getSession();
  return user;
}

/* ============================================================
   PROTECCIÓN DE RUTAS (requireRole)
============================================================ */

function requireRole(roleRequired) {
  const { token, user } = getSession();

  if (!token || !user) {
    window.location.href = "login.html";
    return null;
  }

  if (roleRequired && user.rol !== roleRequired) {
    // Si es admin y trata de entrar a cliente, o viceversa
    // Podríamos redirigir al home o a su panel correspondiente
    if (user.rol === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "cliente.html";
    }
    return null;
  }

  return user;
}

/* ============================================================
   FETCH CON AUTH (fetchAuth)
============================================================ */

async function fetchAuth(endpoint, options = {}) {
  const { token } = getSession();

  // Asegurar headers
  const headers = options.headers || {};

  // Si hay token, lo agregamos
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Si enviamos body y no se especificó content-type, asumimos JSON
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers
  };

  // Construir URL completa
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const res = await fetch(url, config);

  // Si da 401 (no autorizado) o 403 (prohibido), cerrar sesión
  if (res.status === 401 || res.status === 403) {
    clearSession();
    window.location.href = "login.html";
    return null; // o lanzar error
  }

  return res;
}

/* ============================================================
   EXPOSICIÓN GLOBAL
============================================================ */
window.API_URL = API_URL;
window.setSession = setSession;
window.getSession = getSession;
window.clearSession = clearSession;
window.getCurrentUser = getCurrentUser;
window.requireRole = requireRole;
window.fetchAuth = fetchAuth;

/* ============================================================
   LÓGICA DE LOGIN SIMPLE (SI ESTAMOS EN LOGIN.HTML)
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  // La lógica del submit se maneja en login-page.js o aquí mismo si se prefiere.
  // Como ya existe login-page.js, dejamos que ese archivo maneje el evento,
  // pero usando las funciones globales que acabamos de definir.
});