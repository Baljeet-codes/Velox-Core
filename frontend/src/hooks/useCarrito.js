import { useState, useCallback, useEffect } from "react";

const API_BASE = "http://127.0.0.1:8000";

export function useCarritoCount(usuario) {
  const [carritoCount, setCarritoCount] = useState(0);

  const fetchCarritoCount = useCallback(async () => {
    if (!usuario) { setCarritoCount(0); return; }
    try {
      const res = await fetch(`${API_BASE}/carrito/${usuario.id}`);
      const data = await res.json();
      setCarritoCount(data.items?.length ?? 0);
    } catch { /* silencioso */ }
  }, [usuario]);

  useEffect(() => {
    fetchCarritoCount();
  }, [fetchCarritoCount]);

  return { carritoCount, fetchCarritoCount };
}
