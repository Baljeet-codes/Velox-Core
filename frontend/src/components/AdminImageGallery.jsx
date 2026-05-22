import React, { useEffect, useRef } from "react";
import { Form, Spinner } from "react-bootstrap";
import { useImagenes } from "../hooks/useImagenes";
import { useImgBB } from "../hooks/useImgBB";

export default function AdminImageGallery({ productoId }) {
  const { imagenes, cargando, cargar, agregar, eliminar, marcarPrincipal } = useImagenes(productoId);
  const { subir, subiendo, error, limpiarError } = useImgBB();
  const fileRef = useRef(null);

  useEffect(() => {
    if (productoId) cargar();
  }, [productoId]);

  const handleUpload = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const url = await subir(archivo);
    if (url) {
      await agregar(url, imagenes.length === 0);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (imagen) => {
    if (!confirm(`¿Eliminar esta imagen?`)) return;
    await eliminar(imagen.id);
  };

  const handleSetPrincipal = async (imagen) => {
    await marcarPrincipal(imagen.id);
  };

  if (!productoId) return null;

  return (
    <div className="mb-4">
      <Form.Label className="label-theme">Imágenes del producto</Form.Label>

      {cargando && (
        <div className="text-center py-3">
          <Spinner size="sm" style={{ color: "var(--gold)" }} />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {imagenes.map((img) => (
          <div
            key={img.id}
            style={{
              position: "relative",
              width: 90,
              height: 90,
              borderRadius: 10,
              overflow: "hidden",
              border: img.es_principal ? "2px solid var(--gold)" : "2px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                gap: 4,
                padding: "3px 0",
                background: "rgba(0,0,0,0.55)",
              }}
            >
              {!img.es_principal ? (
                <button
                  type="button"
                  onClick={() => handleSetPrincipal(img)}
                  title="Marcar como principal"
                  style={btnMiniStyle}
                >
                  ☆
                </button>
              ) : (
                <span style={{ ...btnMiniStyle, cursor: "default", color: "var(--gold)", fontSize: 13 }} title="Imagen principal">
                  ★
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(img)}
                title="Eliminar imagen"
                style={{ ...btnMiniStyle, color: "#f87171" }}
              >
                🗑
              </button>
            </div>
          </div>
        ))}

        <label
          style={{
            width: 90,
            height: 90,
            border: "2px dashed var(--border)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: subiendo ? "not-allowed" : "pointer",
            flexShrink: 0,
            background: "var(--bg-2)",
            transition: "border-color 0.2s",
          }}
        >
          {subiendo ? (
            <Spinner size="sm" style={{ color: "var(--gold)" }} />
          ) : (
            <span style={{ fontSize: 24, color: "var(--t2)", lineHeight: 1 }}>+</span>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} disabled={subiendo} />
        </label>
      </div>

      {error && (
        <p style={{ color: "var(--err)", fontSize: "0.78rem", marginTop: 6 }}>{error}</p>
      )}
    </div>
  );
}

const btnMiniStyle = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 12,
  cursor: "pointer",
  padding: "2px 4px",
  lineHeight: 1,
};
