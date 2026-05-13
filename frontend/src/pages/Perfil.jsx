import React, { useEffect } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Perfil({ usuario, onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario) navigate("/login");
  }, [usuario, navigate]);

  if (!usuario) return null;

  const campos = [
    { label: "Nombre", value: usuario.nombre },
    { label: "Email", value: usuario.email },
    { label: "Teléfono", value: usuario.telefono || "No registrado" },
    { label: "Dirección", value: usuario.direccion || "No registrada" },
  ];

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: "520px" }}>
        <div className="text-center mb-5">
          <p className="navbar-brand-theme" style={{ fontSize: "1.1rem", letterSpacing: "2.5px", marginBottom: "8px" }}>
            ECOMMERCE CAPS
          </p>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)", fontSize: "1.6rem" }}>
            Mi Perfil
          </h2>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-hover)", borderRadius: "var(--r-xl)", padding: "36px", boxShadow: "var(--shadow-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--bg-4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "var(--gold)", fontWeight: 800, flexShrink: 0 }}>
              {usuario.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h5 style={{ color: "var(--t1)", fontWeight: 700, margin: "0 0 4px" }}>{usuario.nombre}</h5>
              <p style={{ color: "var(--t2)", fontSize: "0.84rem", margin: 0 }}>{usuario.email}</p>
            </div>
          </div>

          {campos.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <span className="label-theme" style={{ margin: 0 }}>{label}</span>
              <span style={{ color: "var(--t1)", fontSize: "0.9rem", textAlign: "right", maxWidth: "60%" }}>{value}</span>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", marginBottom: "24px" }}>
            <span className="label-theme" style={{ margin: 0 }}>Puntos de fidelidad</span>
            <span className="text-gold" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
              {usuario.puntos_fidelidad ?? 0} pts
            </span>
          </div>

          <Button
            variant="outline-danger"
            className="w-100"
            style={{ borderRadius: "10px", padding: "12px" }}
            onClick={onLogout}
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
