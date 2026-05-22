import { useState, useCallback } from "react";

const IMGBB_KEY = import.meta.env.VITE_IMGBB_KEY;
const IMGBB_URL = "https://api.imgbb.com/1/upload";
const MAX_SIZE = 5 * 1024 * 1024;

export function useImgBB() {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);

  const subir = useCallback(async (archivo) => {
    if (!IMGBB_KEY) {
      setError("VITE_IMGBB_KEY no está configurada en .env");
      return null;
    }
    if (!archivo.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen");
      return null;
    }
    if (archivo.size > MAX_SIZE) {
      setError("La imagen no debe superar los 5MB");
      return null;
    }
    setSubiendo(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", archivo);
      const res = await fetch(`${IMGBB_URL}?key=${IMGBB_KEY}`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`ImgBB respondió con ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Error desconocido de ImgBB");
      return json.data.url;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSubiendo(false);
    }
  }, []);

  return { subir, subiendo, error, limpiarError: () => setError(null) };
}
