import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const estadoStyle = (estado) => ({
  background:
    estado === "pendiente" ? "rgba(251,191,36,.12)" :
    estado === "pagado"    ? "rgba(52,211,153,.12)"  :
    estado === "enviado"   ? "rgba(96,165,250,.12)"  :
    estado === "entregado" ? "rgba(52,211,153,.20)"  :
                             "rgba(248,113,113,.12)",
  border: `1px solid ${
    estado === "pendiente" ? "rgba(251,191,36,.35)" :
    estado === "pagado"    ? "rgba(52,211,153,.35)" :
    estado === "enviado"   ? "rgba(96,165,250,.35)" :
    estado === "entregado" ? "rgba(52,211,153,.50)" :
                             "rgba(248,113,113,.35)"}`,
  color:
    estado === "pendiente" ? "var(--warn)" :
    estado === "pagado"    ? "var(--ok)"   :
    estado === "enviado"   ? "#60a5fa"     :
    estado === "entregado" ? "var(--ok)"   :
                             "var(--err)",
  borderRadius: "var(--r1)",
  padding: "5px 10px",
  fontSize: "0.8rem",
  fontWeight: 600,
  display: "inline-block",
});

const productoStyle = {
  display: "flex", alignItems: "center", gap: "12px", padding: "10px 0",
  borderBottom: "1px solid var(--border)",
};

export default function MisPedidos({ usuario }) {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    if (!usuario) { navigate("/login"); return; }
    cargarPedidos();
  }, [usuario]);

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE}/pedidos/historial/${usuario.id}`);
      if (res.ok) setPedidos(await res.json());
    } catch {}
    setCargando(false);
  };

  if (!usuario) return null;

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: "820px" }}>
        <div className="text-center mb-5">
          <p
            className="navbar-brand-theme"
            style={{ fontSize: "1.1rem", letterSpacing: "2.5px", marginBottom: "8px" }}
          >
            ECOMMERCE CAPS
          </p>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)", fontSize: "1.6rem" }}>
            Mis Pedidos
          </h2>
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="grow" style={{ color: "var(--gold)" }} />
          </div>
        ) : pedidos.length === 0 ? (
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-hover)",
              borderRadius: "var(--r-xl)",
              padding: "60px 36px",
              textAlign: "center",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <p style={{ color: "var(--t2)", fontSize: "1rem", margin: 0 }}>
              No has realizado ningún pedido aún.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {pedidos.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-hover)",
                  borderRadius: "var(--r-xl)",
                  padding: "24px",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginBottom: "12px", cursor: "pointer",
                  }}
                  onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                >
                  <div>
                    <span style={{ color: "var(--t2)", fontSize: "0.85rem" }}>Pedido #</span>
                    <span style={{ color: "var(--t1)", fontWeight: 700 }}>{p.id}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={estadoStyle(p.estado)}>{p.estado}</span>
                    <span className="text-gold fw-bold">${p.total.toLocaleString()}</span>
                  </div>
                </div>

                {expandido === p.id && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                    {p.estado === "cancelado" && (
                      <div style={{
                        background: "rgba(248,113,113,.08)",
                        border: "1px solid rgba(248,113,113,.25)",
                        borderRadius: "var(--r1)",
                        padding: "12px 16px",
                        marginBottom: "12px",
                        textAlign: "center",
                      }}>
                        <span style={{ color: "var(--err)", fontWeight: 700, fontSize: "0.9rem" }}>
                          Pedido cancelado — Capital devuelto
                        </span>
                      </div>
                    )}
                    <p style={{ color: "var(--t2)", fontSize: "0.8rem", marginBottom: "8px" }}>
                      Dirección de envío: <span style={{ color: "var(--t1)" }}>{p.direccion_envio}</span>
                    </p>
                    {p.items && p.items.length > 0 && (
                      <div>
                        <p style={{ color: "var(--t2)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: "8px" }}>
                          Productos
                        </p>
                        {p.items.map((item) => (
                          <div key={item.id} style={productoStyle}>
                            <div
                              style={{
                                width: "40px", height: "40px", borderRadius: "8px",
                                background: "var(--bg-4)", overflow: "hidden", flexShrink: 0,
                              }}
                            >
                              {item.producto?.imagen_url && (
                                <img
                                  src={item.producto.imagen_url}
                                  alt={item.producto.nombre}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ color: "var(--t1)", fontSize: "0.88rem", fontWeight: 600 }}>
                                {item.producto?.nombre || `Producto #${item.producto_id}`}
                              </span>
                            </div>
                            <span style={{ color: "var(--t2)", fontSize: "0.82rem" }}>x{item.cantidad}</span>
                            <span className="text-gold" style={{ fontWeight: 600, fontSize: "0.88rem", minWidth: "70px", textAlign: "right" }}>
                              ${(item.precio_unitario * item.cantidad).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {expandido !== p.id && (
                  <>
                    {p.estado === "cancelado" && (
                      <p style={{ color: "var(--err)", fontSize: "0.78rem", margin: "4px 0 0" }}>
                        Pedido cancelado — Capital devuelto
                      </p>
                    )}
                    <p style={{ color: "var(--t3)", fontSize: "0.78rem", margin: p.estado === "cancelado" ? "2px 0 0" : "4px 0 0", cursor: "pointer" }}
                       onClick={() => setExpandido(p.id)}>
                      Ver detalle ▾
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
