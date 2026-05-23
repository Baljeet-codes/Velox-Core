// ════════════════════════════════════════════════════════════════
// HOOK: CRUD DE IMÁGENES CONTRA BACKEND FASTAPI
// Métodos disponibles:
//   cargar()         → GET  /imagenes/{producto_id}
//   agregar(url, pri) → POST /imagenes/
//   eliminar(id)     → DELETE /imagenes/{id}
//   marcarPrincipal(id) → PATCH /imagenes/{id}/principal
//
// Cada mutación refresca la lista automáticamente.
// ════════════════════════════════════════════════════════════════
import { useState, useCallback } from "react";
import { API_BASE } from "../config";

export function useImagenes(productoId) {
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    if (!productoId) return;
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE}/imagenes/${productoId}`);
      if (res.ok) setImagenes(await res.json());
    } finally {
      setCargando(false);
    }
  }, [productoId]);

  const agregar = async (url, esPrincipal = false) => {
    const res = await fetch(`${API_BASE}/imagenes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, es_principal: esPrincipal, producto_id: productoId }),
    });
    if (res.ok) await cargar();
    return res.ok;
  };

  const eliminar = async (imagenId) => {
    const res = await fetch(`${API_BASE}/imagenes/${imagenId}`, { method: "DELETE" });
    if (res.ok) await cargar();
    return res.ok;
  };

  const marcarPrincipal = async (imagenId) => {
    const res = await fetch(`${API_BASE}/imagenes/${imagenId}/principal`, { method: "PATCH" });
    if (res.ok) await cargar();
    return res.ok;
  };

  return { imagenes, cargando, cargar, agregar, eliminar, marcarPrincipal };
}
