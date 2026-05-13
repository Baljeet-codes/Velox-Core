import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

const API_BASE = "http://127.0.0.1:8000";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Credenciales incorrectas"); return; }
      if (!data.es_admin) { setError("No tienes permisos de administrador"); return; }
      localStorage.setItem("usuario", JSON.stringify(data));
      onLogin(data);
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: "var(--bg-primary)" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Header */}
        <div className="text-center mb-5">
          <p className="navbar-brand-theme" style={{ fontSize: "1.1rem", letterSpacing: "2.5px", marginBottom: "8px" }}>
            ECOMMERCE CAPS
          </p>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)", fontSize: "1.6rem" }}>
            Panel de Administración
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Acceso restringido al personal autorizado
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-hover)", borderRadius: "var(--r-xl)", padding: "36px", boxShadow: "var(--shadow-lg)" }}>
          {/* Indicador de admin */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "var(--gold-glow)", border: "1px solid var(--border-accent)", borderRadius: "var(--r-md)", marginBottom: "28px" }}>
            <span style={{ fontSize: "1rem" }}>🔐</span>
            <span style={{ color: "var(--gold)", fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.3px" }}>
              Solo administradores
            </span>
          </div>

          {error && (
            <Alert variant="danger" className="py-2 text-center mb-4" style={{ fontSize: "0.87rem" }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="label-theme">Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                className="input-theme"
                placeholder="admin@ecommerce.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-5">
              <Form.Label className="label-theme">Contraseña</Form.Label>
              <Form.Control
                type="password"
                className="input-theme"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" className="btn-theme-primary w-100" style={{ padding: "14px" }} disabled={cargando}>
              {cargando ? "Verificando…" : "Ingresar al Panel"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
