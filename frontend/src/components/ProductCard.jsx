// ════════════════════════════════════════════════════════════════
// COMPONENTE: Tarjeta individual de producto (grilla del catálogo)
// - Muestra imagen principal vía imgPrincipal()
// - Fallback "SIN IMAGEN" si el producto no tiene imágenes
// - Badge de categoría, nombre, marca y precio
// - Botones contextuales según el rol:
//   * Usuario normal → "Ver" + "+ Carrito"
//   * Admin → "Ver" + "Editar" + "✕ Eliminar"
// ════════════════════════════════════════════════════════════════
import React from "react";
import { Col, Card, Button } from "react-bootstrap";
import { imgPrincipal } from "../utils/imagenUtils";

export default function ProductCard({
  producto: p,
  esAdmin,
  agregadoId,
  agregando,
  onVer,
  onAgregarAlCarrito,
  onEditar,
  onEliminar,
}) {
  const img = imgPrincipal(p);
  const yaAgregado = agregadoId === p.id;

  return (
    <Col>
      <Card className="h-100 card-product">
        <div
          style={{ height: "215px", background: "var(--bg-1)", overflow: "hidden", position: "relative", cursor: "pointer" }}
          onClick={() => onVer(p)}
        >
          {img
            ? <img src={img} alt={p.nombre} className="prod-img" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s var(--ease)" }} />
            : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--t3)", fontSize: "0.7rem", letterSpacing: "1px" }}>SIN IMAGEN</div>
          }
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "56px", background: "linear-gradient(transparent, var(--bg-2))", pointerEvents: "none" }} />
        </div>

        <Card.Body style={{ display: "flex", flexDirection: "column", padding: "18px 20px" }}>
          <span className="badge-cat" style={{ marginBottom: "10px", cursor: "pointer" }} onClick={() => onVer(p)}>
            {p.categoria?.nombre ?? "Colección"}
          </span>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--t1)", margin: "0 0 2px", lineHeight: 1.3, cursor: "pointer" }} onClick={() => onVer(p)}>
            {p.nombre}
          </p>
          {p.marca && (
            <p style={{ fontSize: "0.76rem", color: "var(--t2)", margin: 0 }}>{p.marca}</p>
          )}

          <div style={{ marginTop: "auto", paddingTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ color: "var(--t3)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.6px" }}>Precio</span>
              <span className="text-gold" style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                ${p.precio.toLocaleString()}
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                variant="outline-secondary"
                style={{ flex: "0 0 auto", borderRadius: "var(--r2)", borderColor: "var(--border-md)", color: "var(--t2)", fontSize: "0.8rem", padding: "8px 12px" }}
                onClick={() => onVer(p)}
              >
                Ver
              </Button>
              {esAdmin ? (
                <>
                  <Button
                    variant="outline-warning"
                    style={{ flex: "1", borderRadius: "var(--r2)", fontSize: "0.8rem", padding: "8px" }}
                    onClick={() => onEditar(p)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    style={{ flex: "0 0 auto", borderRadius: "var(--r2)", fontSize: "0.8rem", padding: "8px 12px" }}
                    onClick={() => onEliminar(p.id)}
                  >
                    ✕
                  </Button>
                </>
              ) : (
                <Button
                  className="btn-theme-primary flex-fill"
                  style={{ padding: "8px", fontSize: "0.82rem" }}
                  onClick={() => onAgregarAlCarrito(p)}
                  disabled={agregando}
                >
                  {yaAgregado ? "✓ Agregado" : "+ Carrito"}
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}
