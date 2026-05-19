/**
 * Wrapper de fetch que inyecta automáticamente el Bearer token
 * desde localStorage cuando el usuario está autenticado.
 *
 * Uso: import { apiFetch } from "../api";
 *      const res = await apiFetch("/carrito/1");
 */
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    return usuario?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    // Token expirado — limpiar sesión
    localStorage.removeItem("usuario");
    window.location.hash = "#/login";
  }
  return res;
}
