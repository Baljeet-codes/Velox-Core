import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import Catalogo from "../pages/Catalogo";
import Usuarios from "./Usuarios";
import Pedidos from "./Pedidos";

import { API_BASE } from "../config";

export default function Dashboard({ admin, onLogout }) {
  const [vista, setVista] = useState("productos");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    const res = await fetch(`${API_BASE}/stats/`);
    setStats(await res.json());
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)" }}>
      {/* Topbar */}
      <div className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="admin-brand">VELOX-CORE</span>
          <div className="admin-nav-pill">
            {["productos", "usuarios", "pedidos"].map((v) => (
              <button
                key={v}
                className={`admin-nav-item${vista === v ? " active" : ""}`}
                onClick={() => setVista(v)}
              >
                {v === "productos" ? "📦 Productos" : v === "usuarios" ? "👥 Usuarios" : "📋 Pedidos"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "var(--t2)", fontSize: "0.85rem" }}>
            Hola, <span className="text-gold fw-semibold">{admin.nombre}</span>
          </span>
          <Button variant="outline-danger" size="sm" onClick={onLogout}
            style={{ borderRadius: "8px", fontSize: "0.8rem", padding: "6px 16px" }}>
            Salir
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", padding: "24px 28px 0" }}>
          {[
            { label: "Productos", value: stats.total_productos, color: "var(--gold)" },
            { label: "Usuarios", value: stats.total_usuarios, color: "var(--ok)" },
            { label: "Pedidos", value: stats.total_pedidos, color: "#60a5fa" },
            { label: "Sin stock", value: stats.productos_sin_stock, color: "var(--err)" },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--r3)", padding: "20px 24px" }}>
              <p style={{ color: "var(--t2)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 8px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: "2rem", fontWeight: 800, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Contenido */}
      <Container fluid className="py-4 px-4">
        {vista === "productos" && (
          <Catalogo usuario={admin} onCarritoChange={() => {}} esAdmin={true} />
        )}
        {vista === "usuarios" && <Usuarios admin={admin} />}
        {vista === "pedidos" && <Pedidos />}
      </Container>
    </div>
  );
}
