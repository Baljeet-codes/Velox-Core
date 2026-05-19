import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "../api";

export function useCarritoCount(usuario) {
  const [carritoCount, setCarritoCount] = useState(0);

  const fetchCarritoCount = useCallback(async () => {
    if (!usuario) { setCarritoCount(0); return; }
    try {
      const res = await apiFetch(`/carrito/${usuario.id}`);
      if (!res.ok) { setCarritoCount(0); return; }
      const data = await res.json();
      setCarritoCount(data.items?.length ?? 0);
    } catch { /* silencioso */ }
  }, [usuario]);

  useEffect(() => {
    fetchCarritoCount();
  }, [fetchCarritoCount]);

  return { carritoCount, fetchCarritoCount };
}
