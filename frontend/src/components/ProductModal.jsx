import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { imgPrincipal } from "../utils/imagenUtils";

const navBtnStyle = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 2,
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "none",
  background: "rgba(0,0,0,0.45)",
  color: "#fff",
  fontSize: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backdropFilter: "blur(4px)",
  transition: "all 0.2s ease",
  padding: 0,
  lineHeight: 1,
};

export default function ProductModal({ producto, esAdmin, onClose, onAgregarAlCarrito }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgActiva, setImgActiva] = useState(0);

  if (!producto) return null;

  const imagenes = producto.imagenes ?? [];
  const selImg = imagenes[imgActiva]?.url ?? imgPrincipal(producto);
  const slides = imagenes.length > 0
    ? imagenes.map((img) => ({ src: img.url }))
    : (selImg ? [{ src: selImg }] : []);

  const handlePrev = useCallback(() => {
    setImgActiva((i) => (i - 1 + imagenes.length) % imagenes.length);
  }, [imagenes.length]);

  const handleNext = useCallback(() => {
    setImgActiva((i) => (i + 1) % imagenes.length);
  }, [imagenes.length]);

  useEffect(() => {
    const handler = (e) => {
      if (!producto) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [producto, handlePrev, handleNext]);

  useEffect(() => {
    setImgActiva(0);
  }, [producto]);

  if (!producto) return null;

  return (
    <>
      <Modal show={!!producto} onHide={onClose} centered size="lg" contentClassName="modal-product-c" className="modal-product">
        <Modal.Body>
          {/* ── Imagen principal con navegación ── */}
          {selImg && (
            <div
              style={{
                position: "relative",
                height: 280,
                background: "var(--bg-1)",
                overflow: "hidden",
                cursor: "zoom-in",
              }}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                key={imgActiva}
                src={selImg}
                alt={producto.nombre}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                  animation: "veloxFadeIn 0.35s ease",
                }}
              />

              {imagenes.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    style={{ ...navBtnStyle, left: 12 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    style={{ ...navBtnStyle, right: 12 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}
                    aria-label="Imagen siguiente"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Thumbnails ── */}
          {imagenes.length > 1 && (
            <div style={{ display: "flex", gap: 8, padding: "12px 16px 0", overflowX: "auto" }}>
              {imagenes.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setImgActiva(i)}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 8,
                    overflow: "hidden",
                    flexShrink: 0,
                    cursor: "pointer",
                    border: i === imgActiva ? "2px solid var(--gold)" : "2px solid transparent",
                    opacity: i === imgActiva ? 1 : 0.5,
                    transition: "all 0.25s ease",
                  }}
                >
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}

          {/* ── Dots ── */}
          {imagenes.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 5, padding: "10px 0 4px" }}>
              {imagenes.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setImgActiva(i)}
                  style={{
                    width: i === imgActiva ? 20 : 7,
                    height: 7,
                    borderRadius: 4,
                    background: i === imgActiva ? "var(--gold)" : "var(--border)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Info del producto ── */}
          <div style={{ padding: "16px 28px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <span className="badge-cat">{producto.categoria?.nombre}</span>
                <h4 style={{ color: "var(--t1)", fontWeight: 800, margin: "10px 0 2px", fontSize: "1.2rem" }}>{producto.nombre}</h4>
                {producto.marca && <p style={{ color: "var(--t2)", fontSize: "0.84rem", margin: 0 }}>{producto.marca}</p>}
              </div>
              <span className="text-gold" style={{ fontWeight: 800, fontSize: "1.9rem", lineHeight: 1 }}>
                ${producto.precio.toLocaleString()}
              </span>
            </div>
            <hr style={{ borderColor: "var(--border)", margin: "20px 0" }} />
            {producto.descripcion && (
              <p style={{ color: "var(--t2)", fontSize: "0.88rem", lineHeight: 1.75, margin: "0 0 18px" }}>{producto.descripcion}</p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="label-theme" style={{ margin: 0 }}>Stock:</span>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: producto.stock > 5 ? "var(--ok)" : producto.stock > 0 ? "var(--warn)" : "var(--err)" }}>
                {producto.stock > 0 ? `${producto.stock} unidades disponibles` : "Sin stock"}
              </span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ background: "var(--bg-3)", borderTop: "1px solid var(--border)", padding: "16px 28px", gap: "12px" }}>
          {!esAdmin && (
            <Button
              className="btn-theme-primary flex-fill"
              style={{ padding: "12px" }}
              onClick={() => { onAgregarAlCarrito(producto); onClose(); }}
              disabled={producto.stock === 0}
            >
              {producto.stock === 0 ? "Sin stock" : "+ Agregar al carrito"}
            </Button>
          )}
          <Button
            variant="link"
            style={{ color: "var(--t2)", textDecoration: "none", fontSize: "0.87rem", padding: "12px 6px" }}
            onClick={onClose}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Lightbox ── */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={imgActiva}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
      />

      <style>{`
        @keyframes veloxFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        .modal-product-c {
          background: var(--bg-3) !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          border-radius: 22px !important;
          overflow: hidden !important;
          box-shadow: 0 20px 60px rgba(0,0,0,.70) !important;
        }
        .modal-product .modal-body  { padding: 0 !important; background: var(--bg-3) !important; }
        .modal-product .modal-footer { background: var(--bg-3) !important; border-top: 1px solid var(--border) !important; }
      `}</style>
    </>
  );
}
