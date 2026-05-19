import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

const imgPrincipal = (p) =>
  p.imagenes?.find((i) => i.es_principal)?.url ?? p.imagenes?.[0]?.url ?? null;

export default function ProductModal({ producto, esAdmin, onClose, onAgregarAlCarrito }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!producto) return null;

  const selImg = imgPrincipal(producto);
  const slides = producto.imagenes?.map((img) => ({ src: img.url })) ?? (selImg ? [{ src: selImg }] : []);

  return (
    <>
      <Modal show={!!producto} onHide={onClose} centered size="lg" contentClassName="modal-product-c" className="modal-product">
        <Modal.Body>
          {selImg && (
            <div style={{ height: "220px", overflow: "hidden" }} onClick={() => setLightboxOpen(true)}>
              <img
                src={selImg}
                alt={producto.nombre}
                style={{ width: "100%", height: "100%", objectFit: "contain", background: "var(--bg-1)", display: "block" }}
              />
            </div>
          )}
          <div style={{ padding: "26px 28px" }}>
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

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
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
