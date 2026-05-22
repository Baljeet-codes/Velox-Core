import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

import { API_BASE } from "../config";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

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
      onLogin(data);
      navigate(data.es_admin ? "/admin" : "/");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div className="text-center mb-5">
          <p className="navbar-brand-theme" style={{ fontSize: "1.1rem", letterSpacing: "2.5px", marginBottom: "8px" }}>
            VELOX-CORE
          </p>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)", fontSize: "1.6rem" }}>
            Bienvenido de nuevo
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-hover)", borderRadius: "var(--r-xl)", padding: "36px", boxShadow: "var(--shadow-lg)" }}>
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
                placeholder="nombre@gmail.com"
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
              {cargando ? "Ingresando…" : "Iniciar Sesión"}
            </Button>
          </Form>

          <p className="text-center mt-4 mb-0" style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="text-gold fw-semibold text-decoration-none">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
