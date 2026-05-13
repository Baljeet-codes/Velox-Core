import React, { useState } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [exitoso, setExitoso] = useState(false);
  const navigate = useNavigate();

  const validar = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = "Campo requerido";
    if (!email.trim()) e.email = "Campo requerido";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "Email inválido";
    if (!password) e.password = "Campo requerido";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validar()) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/usuarios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, direccion, telefono }),
      });
      if (res.ok) {
        setExitoso(true);
      } else {
        const err = await res.json();
        setMessage(err.detail || "Error al registrar");
      }
    } catch {
      setMessage("Error de conexión con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  if (exitoso) {
    return (
      <div className="auth-page">
        <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-accent)", borderRadius: "var(--r-xl)", padding: "48px 36px", boxShadow: "var(--shadow-gold)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✓</div>
            <h4 className="fw-bold mb-2" style={{ color: "var(--text-primary)" }}>¡Cuenta creada!</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "32px" }}>
              Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión.
            </p>
            <Button className="btn-theme-primary px-5" style={{ padding: "12px 40px" }} onClick={() => navigate("/login")}>
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: "520px" }}>
        <div className="text-center mb-5">
          <p className="navbar-brand-theme" style={{ fontSize: "1.1rem", letterSpacing: "2.5px", marginBottom: "8px" }}>
            ECOMMERCE CAPS
          </p>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)", fontSize: "1.6rem" }}>
            Crea tu cuenta
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Únete y empieza a explorar la colección
          </p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-hover)", borderRadius: "var(--r-xl)", padding: "36px", boxShadow: "var(--shadow-lg)" }}>
          {message && (
            <Alert variant="danger" className="py-2 text-center mb-4" style={{ fontSize: "0.87rem" }}>
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="label-theme">Nombre completo</Form.Label>
              <Form.Control
                type="text"
                className={`input-theme${errors.nombre ? " is-invalid" : ""}`}
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              {errors.nombre && <div style={{ color: "var(--danger)", fontSize: "0.78rem", marginTop: "6px" }}>{errors.nombre}</div>}
            </Form.Group>

            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Label className="label-theme">Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  className={`input-theme${errors.email ? " is-invalid" : ""}`}
                  placeholder="nombre@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <div style={{ color: "var(--danger)", fontSize: "0.78rem", marginTop: "6px" }}>{errors.email}</div>}
              </Col>
              <Col md={6}>
                <Form.Label className="label-theme">Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  className={`input-theme${errors.password ? " is-invalid" : ""}`}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <div style={{ color: "var(--danger)", fontSize: "0.78rem", marginTop: "6px" }}>{errors.password}</div>}
              </Col>
            </Row>

            <Row className="g-3 mb-5">
              <Col md={7}>
                <Form.Label className="label-theme">Dirección <span style={{ color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>(opcional)</span></Form.Label>
                <Form.Control
                  type="text"
                  className="input-theme"
                  placeholder="Calle 123, Ciudad"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </Col>
              <Col md={5}>
                <Form.Label className="label-theme">Teléfono <span style={{ color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>(opcional)</span></Form.Label>
                <Form.Control
                  type="text"
                  className="input-theme"
                  placeholder="300 000 0000"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </Col>
            </Row>

            <Button type="submit" className="btn-theme-primary w-100" style={{ padding: "14px" }} disabled={submitting}>
              {submitting ? "Creando cuenta…" : "Registrarme"}
            </Button>
          </Form>

          <p className="text-center mt-4 mb-0" style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-gold fw-semibold text-decoration-none">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
