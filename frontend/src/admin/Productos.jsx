import React, { useState, useEffect } from "react";
import { Table, Button, Alert } from "react-bootstrap";
import { API_BASE } from "../config";
import AdminProductForm from "../components/AdminProductForm";

const FORM0 = { nombre: "", descripcion: "", precio: "", marca: "", stock: "", categoria_id: "" };

export default function AdminProductos() {
  const [productos, setProductos]   = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [editando, setEditando]     = useState(null);
  const [mensaje, setMensaje]       = useState(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const [rP, rC] = await Promise.all([
      fetch(`${API_BASE}/productos/`),
      fetch(`${API_BASE}/categorias/`),
    ]);
    setProductos(await rP.json());
    setCategorias(await rC.json());
  };

  const abrirNuevo  = () => { setEditando(null); setShowModal(true); };
  const abrirEditar = (p) => { setEditando(p); setShowModal(true); };
  const cerrar = () => { setShowModal(false); setEditando(null); };

  const flash = (tipo, texto) => { setMensaje({ tipo, texto }); setTimeout(() => setMensaje(null), 3200); };

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`${API_BASE}/productos/${id}`, { method: "DELETE" });
    flash("success", "Producto eliminado");
    cargar();
  };

  const stockColor = (n) => n > 10 ? "var(--ok)" : n > 0 ? "var(--warn)" : "var(--err)";

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
        <div>
          <h4 style={{ color: "var(--t1)", fontWeight: 800, margin: "0 0 6px", fontSize: "1.35rem" }}>Gestión de Productos</h4>
          <div className="heading-line" />
        </div>
        <Button className="btn-theme-primary" style={{ padding: "10px 22px" }} onClick={abrirNuevo}>
          + Nuevo Producto
        </Button>
      </div>

      {mensaje && (
        <Alert variant={mensaje.tipo} className={`py-2 text-center mb-4 alert-${mensaje.tipo}`} style={{ fontSize: "0.86rem" }}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Tabla */}
      <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--r3)", overflow: "hidden" }}>
        <Table responsive className="table-admin mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "48px 0", color: "var(--t2)" }}>
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: "var(--t3)", fontWeight: 500 }}>{p.id}</td>
                  <td style={{ fontWeight: 600, color: "var(--t1)" }}>{p.nombre}</td>
                  <td><span className="badge-cat">{p.categoria?.nombre ?? "—"}</span></td>
                  <td style={{ color: "var(--t2)" }}>{p.marca}</td>
                  <td><span className="text-gold" style={{ fontWeight: 700 }}>${parseFloat(p.precio).toLocaleString()}</span></td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: "0.87rem", color: stockColor(p.stock) }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Button size="sm" variant="outline-warning" style={{ borderRadius: "7px", fontSize: "0.76rem", padding: "5px 13px" }} onClick={() => abrirEditar(p)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" style={{ borderRadius: "7px", fontSize: "0.76rem", padding: "5px 13px" }} onClick={() => eliminar(p.id, p.nombre)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal con AdminProductForm */}
      <AdminProductForm
        show={showModal}
        onHide={cerrar}
        productoEditando={editando}
        onSuccess={(msg) => { flash(msg.tipo, msg.texto); cargar(); }}
      />
    </div>
  );
}
