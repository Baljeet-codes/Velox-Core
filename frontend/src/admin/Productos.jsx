import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert, Row, Col } from "react-bootstrap";

import { API_BASE } from "../config";
const FORM0 = { nombre: "", descripcion: "", precio: "", marca: "", stock: "", imagen_url: "", categoria_id: "" };

export default function AdminProductos() {
  const [productos, setProductos]   = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [editando, setEditando]     = useState(null);
  const [form, setForm]             = useState(FORM0);
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

  const abrirNuevo  = () => { setEditando(null); setForm(FORM0); setShowModal(true); };
  const abrirEditar = (p) => {
    setEditando(p);
    setForm({ nombre: p.nombre, descripcion: p.descripcion ?? "", precio: p.precio, marca: p.marca, stock: p.stock, imagen_url: p.imagen_url ?? "", categoria_id: p.categoria_id });
    setShowModal(true);
  };
  const cerrar = () => { setShowModal(false); setEditando(null); };

  const flash = (tipo, texto) => { setMensaje({ tipo, texto }); setTimeout(() => setMensaje(null), 3200); };

  const guardar = async (e) => {
    e.preventDefault();
    const body = { ...form, precio: parseFloat(form.precio), stock: parseInt(form.stock), categoria_id: parseInt(form.categoria_id) };
    const url  = editando ? `${API_BASE}/productos/${editando.id}` : `${API_BASE}/productos/`;
    const res  = await fetch(url, { method: editando ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { flash("success", editando ? "Producto actualizado" : "Producto creado"); cargar(); cerrar(); }
    else        { const err = await res.json(); flash("danger", err.detail ?? "Error al guardar"); }
  };

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`${API_BASE}/productos/${id}`, { method: "DELETE" });
    flash("success", "Producto eliminado");
    cargar();
  };

  const f = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

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

      {/* ── Modal crear / editar ── */}
      <Modal show={showModal} onHide={cerrar} centered contentClassName="modal-admin-c" className="modal-admin">
        <Modal.Header closeButton>
          <Modal.Title>{editando ? "Editar Producto" : "Nuevo Producto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={guardar}>
            <Form.Group className="mb-3">
              <Form.Label className="label-theme">Nombre</Form.Label>
              <Form.Control className="input-theme" value={form.nombre} onChange={f("nombre")} placeholder="Nombre del producto" required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="label-theme">Descripción</Form.Label>
              <Form.Control className="input-theme" as="textarea" rows={2} value={form.descripcion} onChange={f("descripcion")} placeholder="Descripción opcional" />
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col>
                <Form.Label className="label-theme">Precio</Form.Label>
                <Form.Control className="input-theme" type="number" step="0.01" min="0" value={form.precio} onChange={f("precio")} placeholder="0.00" required />
              </Col>
              <Col>
                <Form.Label className="label-theme">Stock</Form.Label>
                <Form.Control className="input-theme" type="number" min="0" value={form.stock} onChange={f("stock")} placeholder="0" required />
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col>
                <Form.Label className="label-theme">Marca</Form.Label>
                <Form.Control className="input-theme" value={form.marca} onChange={f("marca")} placeholder="Nike, Adidas…" required />
              </Col>
              <Col>
                <Form.Label className="label-theme">Categoría</Form.Label>
                <Form.Select className="input-theme" value={form.categoria_id} onChange={f("categoria_id")} required>
                  <option value="">Seleccionar…</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="label-theme">
                URL Imagen{" "}
                <span style={{ color: "var(--t3)", textTransform: "none", letterSpacing: 0 }}>(opcional)</span>
              </Form.Label>
              <Form.Control className="input-theme" value={form.imagen_url} onChange={f("imagen_url")} placeholder="https://…" />
            </Form.Group>

            <Button type="submit" className="btn-theme-primary w-100" style={{ padding: "13px" }}>
              {editando ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <style>{`
        .modal-admin-c {
          background: var(--bg-3) !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          border-radius: 22px !important;
          overflow: hidden !important;
          box-shadow: 0 20px 60px rgba(0,0,0,.70) !important;
        }
        .modal-admin .modal-header {
          background: var(--bg-4) !important;
          border-bottom: 1px solid rgba(255,255,255,.07) !important;
          padding: 18px 24px !important;
        }
        .modal-admin .modal-title { color: var(--t1) !important; font-weight: 700 !important; font-size: .95rem !important; }
        .modal-admin .modal-body  { background: var(--bg-3) !important; padding: 24px !important; }
        .modal-admin .btn-close   { filter: invert(1) opacity(.4) !important; }
        .modal-admin .btn-close:hover { filter: invert(1) opacity(.85) !important; }
      `}</style>
    </div>
  );
}
