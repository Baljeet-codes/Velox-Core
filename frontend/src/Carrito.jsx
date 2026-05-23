// ════════════════════════════════════════════════════════════════
// CARRITO: Drawer lateral + Checkout modal
//
// CarritoDrawer (PASO 6):
//   - Backdrop oscuro + panel deslizante desde la derecha
//   - GET /carrito/{usuario_id} al abrirse
//   - Cada item: miniatura, nombre, precio total
//   - Controles: − cantidad +, "Eliminar"
//   - Footer: total acumulado + "Finalizar Pedido →"
//
// Checkout modal (PASO 7):
//   - Formulario con dirección de envío (precargada del perfil)
//   - Botón "Confirmar Pedido · $XXXX"
//   - POST /pedidos/{usuario_id} { direccion_envio }
//   - Pantalla "✅ Pedido realizado" al confirmar (PASO 8)
// ════════════════════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Alert, Spinner } from "react-bootstrap";

import { API_BASE } from "./config";
import { imgPrincipal } from "./utils/imagenUtils";

/* ────────────────────────────────────────────────────────── */
/*  CHECKOUT MODAL (PASO 7-8): Confirmación de pedido        */
/* ────────────────────────────────────────────────────────── */
function Checkout({ usuario, total, onClose, onSuccess }) {
  const [direccion, setDireccion] = useState(usuario.direccion || "");
  const [cargando, setCargando] = useState(false);
  const [exitoso, setExitoso] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!direccion.trim()) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/pedidos/${usuario.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direccion_envio: direccion }),
      });
      if (res.ok) {
        setExitoso(true);
        setTimeout(onSuccess, 2800);
      } else {
        const err = await res.json();
        setError(err.detail || "Error al procesar el pedido");
      }
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal show centered onHide={onClose} contentClassName="modal-admin-c" className="modal-admin" style={{ zIndex: 1060 }}>
      <Modal.Header closeButton>
        <Modal.Title>{exitoso ? "¡Pedido confirmado!" : "Finalizar Pedido"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {exitoso ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "14px" }}>✅</div>
            <h5 style={{ color: "var(--t1)", fontWeight: 800, marginBottom: "8px" }}>¡Pedido realizado!</h5>
            <p style={{ color: "var(--t2)", fontSize: "0.88rem" }}>
              Tu pedido fue registrado correctamente. Pronto recibirás tu colección.
            </p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="danger" className="alert-danger py-2 text-center mb-3" style={{ fontSize: "0.85rem" }}>
                {error}
              </Alert>
            )}

            {/* Resumen */}
            <div style={{ background: "var(--bg-4)", borderRadius: "var(--r2)", padding: "16px 18px", marginBottom: "22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--t2)", fontSize: "0.84rem" }}>Total a pagar</span>
              <span className="text-gold" style={{ fontWeight: 800, fontSize: "1.3rem" }}>
                ${total.toLocaleString()}
              </span>
            </div>

            <Form.Group className="mb-4">
              <Form.Label className="label-theme">Dirección de envío</Form.Label>
              <Form.Control
                className="input-theme"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle 123, Ciudad, País"
                required
              />
            </Form.Group>

            <Button
              type="submit"
              className="btn-theme-primary w-100"
              style={{ padding: "13px" }}
              disabled={cargando}
            >
              {cargando ? "Procesando…" : `Confirmar Pedido · $${total.toLocaleString()}`}
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

/* ─── Drawer del carrito ─── */
export default function CarritoDrawer({ open, onClose, usuario, onChange }) {
  const [carrito, setCarrito] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (open && usuario) fetchCarrito();
  }, [open, usuario]);

  const fetchCarrito = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE}/carrito/${usuario.id}`);
      setCarrito(await res.json());
    } finally {
      setCargando(false);
    }
  };

  const eliminarItem = async (itemId) => {
    await fetch(`${API_BASE}/carrito/${usuario.id}/item/${itemId}`, { method: "DELETE" });
    fetchCarrito();
    onChange();
  };

  const cambiarCantidad = async (item, delta) => {
    const nueva = item.cantidad + delta;
    if (nueva < 1) { eliminarItem(item.id); return; }
    await fetch(`${API_BASE}/carrito/${usuario.id}/item/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producto_id: item.producto_id, cantidad: nueva }),
    });
    fetchCarrito();
    onChange();
  };

  const items = carrito?.items ?? [];
  const total = items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);

  return (
    <>
      {/* ── Backdrop oscuro ── */}
      <div className={`cart-backdrop${open ? " open" : ""}`} onClick={onClose} />

      {/* ── Drawer lateral (PASO 6) ── */}
      <div className={`cart-drawer${open ? " open" : ""}`}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 22px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h5 style={{ color: "var(--t1)", fontWeight: 800, margin: 0, fontSize: "1rem" }}>Mi Carrito</h5>
            {items.length > 0 && (
              <p style={{ color: "var(--t2)", fontSize: "0.78rem", margin: "3px 0 0" }}>
                {items.length} {items.length === 1 ? "producto" : "productos"}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--t2)", fontSize: "1.2rem", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", lineHeight: 1, transition: "color .15s" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--t1)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--t2)")}
          >
            ✕
          </button>
        </div>

        {/* Lista de items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 22px" }}>
          {cargando ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: "50px" }}>
              <Spinner animation="grow" style={{ color: "var(--gold)" }} />
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: "70px" }}>
              <div style={{ fontSize: "2.8rem", marginBottom: "14px" }}>🧢</div>
              <p style={{ color: "var(--t1)", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 6px" }}>
                Tu carrito está vacío
              </p>
              <p style={{ color: "var(--t2)", fontSize: "0.83rem", margin: 0 }}>
                Agrega productos desde el catálogo.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const img = imgPrincipal(item.producto);
              return (
                <div key={item.id} style={{ display: "flex", gap: "14px", padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                  {/* Miniatura */}
                  <div style={{ width: "70px", height: "70px", borderRadius: "10px", overflow: "hidden", background: "var(--bg-1)", flexShrink: 0 }}>
                    {img
                      ? <img src={img} alt={item.producto.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t3)", fontSize: "0.6rem" }}>IMG</div>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "var(--t1)", fontWeight: 600, fontSize: "0.88rem", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.producto.nombre}
                    </p>
                    <p style={{ color: "var(--gold)", fontWeight: 700, fontSize: "0.88rem", margin: "0 0 10px" }}>
                      ${(item.producto.precio * item.cantidad).toLocaleString()}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button className="qty-btn" onClick={() => cambiarCantidad(item, -1)}>−</button>
                      <span style={{ color: "var(--t1)", fontWeight: 700, fontSize: "0.88rem", minWidth: "22px", textAlign: "center" }}>
                        {item.cantidad}
                      </span>
                      <button className="qty-btn" onClick={() => cambiarCantidad(item, +1)}>+</button>
                      <button
                        onClick={() => eliminarItem(item.id)}
                        style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--err)", fontSize: "0.75rem", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer: total + "Finalizar Pedido" ── */}
        {items.length > 0 && (
          <div style={{ padding: "18px 22px", borderTop: "1px solid var(--border)", background: "var(--bg-1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ color: "var(--t2)", fontSize: "0.84rem" }}>Total</span>
              <span className="text-gold" style={{ fontWeight: 800, fontSize: "1.35rem" }}>
                ${total.toLocaleString()}
              </span>
            </div>
            <Button
              className="btn-theme-primary w-100"
              style={{ padding: "13px" }}
              onClick={() => setCheckoutOpen(true)}
            >
              Finalizar Pedido →
            </Button>
          </div>
        )}
      </div>

      {/* ── Checkout modal (PASO 7) ── */}
      {checkoutOpen && (
        <Checkout
          usuario={usuario}
          total={total}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {
            setCheckoutOpen(false);
            setCarrito(null);
            fetchCarrito();
            onChange();
            onClose();
          }}
        />
      )}
    </>
  );
}
