import React, { useState, useEffect } from "react";
import { Row, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import AdminProductForm from "../components/AdminProductForm";
import Toast from "../components/Toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Catalogo({ usuario, onCarritoChange, esAdmin = false }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [sel, setSel] = useState(null);
  const [agregando, setAgregando] = useState(false);
  const [agregadoId, setAgregadoId] = useState(null);
  const [modalProducto, setModalProducto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [mensajeAdmin, setMensajeAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ok = true;
    fetch(`${API_BASE}/productos/`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((d) => { if (ok) setProductos(d); })
      .catch((e) => { if (ok) setError(e.message); })
      .finally(() => ok && setCargando(false));
    return () => (ok = false);
  }, []);

  const agregarAlCarrito = async (producto) => {
    if (!usuario) { navigate("/login"); return; }
    setAgregando(true);
    try {
      await fetch(`${API_BASE}/carrito/${usuario.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto_id: producto.id, cantidad: 1 }),
      });
      setAgregadoId(producto.id);
      onCarritoChange?.();
      setTimeout(() => setAgregadoId(null), 2000);
    } finally {
      setAgregando(false);
    }
  };

  const abrirEditar = (producto) => {
    setProductoEditando(producto);
    setModalProducto(true);
  };

  const abrirNuevo = () => {
    setProductoEditando(null);
    setModalProducto(true);
  };

  const eliminarProducto = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`${API_BASE}/productos/${id}`, { method: "DELETE" });
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const recargarProductos = async () => {
    const res = await fetch(`${API_BASE}/productos/`);
    setProductos(await res.json());
  };

  const handleFormSuccess = (mensaje) => {
    recargarProductos();
    setMensajeAdmin(mensaje);
    setTimeout(() => setMensajeAdmin(null), 3000);
  };

  if (cargando) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "55vh", gap: "16px" }}>
      <Spinner animation="grow" style={{ color: "var(--gold)", width: "2.2rem", height: "2.2rem" }} />
      <span style={{ color: "var(--t2)", fontSize: "0.82rem", letterSpacing: "0.5px" }}>Cargando colección…</span>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--err)", fontSize: "0.9rem" }}>
      Error al cargar productos: {error}
    </div>
  );

  return (
    <>
      <div style={{ marginBottom: "44px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ color: "var(--t2)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", margin: "0 0 6px" }}>
            Colección actual
          </p>
          <h2 style={{ color: "var(--t1)", fontWeight: 800, fontSize: "1.75rem", margin: 0 }}>
            Nuestros Productos
          </h2>
          <div className="heading-line" />
        </div>
        {esAdmin && (
          <Button className="btn-theme-primary" onClick={abrirNuevo}>
            + Nuevo Producto
          </Button>
        )}
      </div>

      {esAdmin && <Toast mensaje={mensajeAdmin} />}

      {productos.length === 0 ? (
        <p style={{ color: "var(--t2)", textAlign: "center", paddingTop: "60px" }}>
          No hay productos disponibles.
        </p>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {productos.map((p) => (
            <ProductCard
              key={p.id}
              producto={p}
              esAdmin={esAdmin}
              agregadoId={agregadoId}
              agregando={agregando}
              onVer={setSel}
              onAgregarAlCarrito={agregarAlCarrito}
              onEditar={abrirEditar}
              onEliminar={eliminarProducto}
            />
          ))}
        </Row>
      )}

      <ProductModal
        producto={sel}
        esAdmin={esAdmin}
        onClose={() => setSel(null)}
        onAgregarAlCarrito={agregarAlCarrito}
      />

      <AdminProductForm
        show={modalProducto}
        onHide={() => setModalProducto(false)}
        productoEditando={productoEditando}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
