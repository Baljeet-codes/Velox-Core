import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const FORM_VACIO = { nombre: "", descripcion: "", precio: "", marca: "", stock: "", categoria_id: "", archivo: null };

export default function AdminProductForm({ show, onHide, productoEditando, onSuccess }) {
  const [form, setForm] = useState(FORM_VACIO);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    if (!show) return;
    fetch(`${API_BASE}/categorias/`).then((r) => r.json()).then(setCategorias);
    setForm(
      productoEditando
        ? {
            nombre: productoEditando.nombre,
            descripcion: productoEditando.descripcion || "",
            precio: productoEditando.precio,
            marca: productoEditando.marca,
            stock: productoEditando.stock,
            categoria_id: productoEditando.categoria_id,
            archivo: null,
          }
        : FORM_VACIO
    );
  }, [show, productoEditando]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      marca: form.marca,
      stock: parseInt(form.stock),
      categoria_id: parseInt(form.categoria_id),
    };

    const url = productoEditando
      ? `${API_BASE}/productos/${productoEditando.id}`
      : `${API_BASE}/productos/`;
    const method = productoEditando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();

      if (form.archivo) {
        const formData = new FormData();
        formData.append("file", form.archivo);
        formData.append("producto_id", data.id);
        formData.append("es_principal", "true");
        await fetch(`${API_BASE}/imagenes/subir`, {
          method: "POST",
          body: formData,
        });
      }

      onSuccess({ tipo: "ok", texto: productoEditando ? "Producto actualizado" : "Producto creado" });
      onHide();
    } else {
      onSuccess({ tipo: "err", texto: "Error al guardar el producto" });
    }
  };

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Modal show={show} onHide={onHide} centered className="modal-admin">
      <Modal.Header closeButton>
        <Modal.Title>{productoEditando ? "Editar Producto" : "Nuevo Producto"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="label-theme">Nombre</Form.Label>
            <Form.Control className="input-theme" value={form.nombre} onChange={set("nombre")} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="label-theme">Descripción</Form.Label>
            <Form.Control className="input-theme" as="textarea" rows={2} value={form.descripcion} onChange={set("descripcion")} />
          </Form.Group>
          <div className="d-flex gap-3">
            <Form.Group className="mb-3 flex-fill">
              <Form.Label className="label-theme">Precio</Form.Label>
              <Form.Control className="input-theme" type="number" value={form.precio} onChange={set("precio")} required />
            </Form.Group>
            <Form.Group className="mb-3 flex-fill">
              <Form.Label className="label-theme">Stock</Form.Label>
              <Form.Control className="input-theme" type="number" value={form.stock} onChange={set("stock")} required />
            </Form.Group>
          </div>
          <Form.Group className="mb-3">
            <Form.Label className="label-theme">Marca</Form.Label>
            <Form.Control className="input-theme" value={form.marca} onChange={set("marca")} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="label-theme">Categoría</Form.Label>
            <Form.Select className="input-theme" value={form.categoria_id} onChange={set("categoria_id")} required>
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="label-theme">Imagen del producto</Form.Label>
            <Form.Control
              className="input-theme"
              type="file"
              accept="image/*"
              onChange={(e) => setForm((prev) => ({ ...prev, archivo: e.target.files[0] }))}
            />
            {form.archivo && (
              <p style={{ color: "var(--t2)", fontSize: "0.78rem", marginTop: "6px" }}>
                Seleccionado: {form.archivo.name}
              </p>
            )}
          </Form.Group>
          <div className="d-grid">
            <Button type="submit" className="btn-theme-primary">
              {productoEditando ? "Actualizar Producto" : "Crear Producto"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
