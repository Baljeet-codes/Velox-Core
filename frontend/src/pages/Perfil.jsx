import React, { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { API_BASE } from "../config";

const TIERS = [
  { min: 0,   label: "Bronce",   color: "#cd7f32", nextLabel: "Plata", nextMin: 100 },
  { min: 100, label: "Plata",    color: "#c0c0c0", nextLabel: "Oro",   nextMin: 300 },
  { min: 300, label: "Oro",      color: "#ffd700", nextLabel: null,    nextMin: null },
];

function calcularTier(puntos) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (puntos >= t.min) tier = t;
  }
  return tier;
}

function Perfil({ usuario, onLogout }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!usuario) { navigate("/login"); return; }
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/usuarios/${usuario.id}`);
        if (!res.ok) throw new Error("Error al obtener datos");
        const data = await res.json();
        setUserData(data);
      } catch {
        setUserData(usuario);
      } finally {
        setCargando(false);
      }
    };
    fetchUser();
  }, [usuario, navigate]);

  if (!usuario) return null;

  if (cargando) {
    return (
      <div className="auth-page">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  const u = userData || usuario;
  const puntos = u.puntos_fidelidad ?? 0;
  const tier = calcularTier(puntos);
  const necesita = tier.nextMin ? tier.nextMin - puntos : 0;

  const campos = [
    { label: "Nombre completo", value: u.nombre, icon: "👤" },
    { label: "Correo electrónico", value: u.email, icon: "✉️" },
    { label: "Teléfono", value: u.telefono || "No registrado", icon: "📱" },
    { label: "Dirección", value: u.direccion || "No registrada", icon: "📍" },
  ];

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: "560px" }}>
        <div className="text-center mb-4">
          <p className="navbar-brand-theme" style={{ fontSize: "1.1rem", letterSpacing: "2.5px", marginBottom: "6px" }}>
            VELOX-CORE
          </p>
          <h2 className="fw-bold mb-0" style={{ color: "var(--text-primary)", fontSize: "1.6rem" }}>
            Mi Perfil
          </h2>
        </div>

        {/* ── Tarjeta de información personal ── */}
        <div style={{
          background: "var(--bg-card, var(--bg-2))",
          border: "1px solid var(--border-hover, var(--border))",
          borderRadius: "var(--r-xl, 18px)",
          padding: "32px",
          boxShadow: "var(--shadow-lg)",
          marginBottom: "24px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginBottom: "28px",
            paddingBottom: "24px",
            borderBottom: "1px solid var(--border)"
          }}>
            <div style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--gold-dk), var(--gold-lt))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
              color: "#0a0a0a",
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: "0 0 0 3px var(--bg-card, var(--bg-2)), 0 0 0 5px rgba(16,185,129,.2)"
            }}>
              {u.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h5 style={{ color: "var(--t1)", fontWeight: 700, margin: "0 0 4px", fontSize: "1.1rem" }}>
                {u.nombre}
              </h5>
              <p style={{ color: "var(--t2)", fontSize: "0.85rem", margin: 0 }}>
                {u.email}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {campos.map(({ label, value, icon }) => {
              const noRegistrado = value === "No registrado" || value === "No registrada";
              return (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "13px 16px",
                    borderRadius: "12px",
                    background: noRegistrado ? "transparent" : "var(--bg-3, var(--bg-3))",
                    border: noRegistrado ? "1px dashed var(--border-md, rgba(255,255,255,.1))" : "1px solid transparent"
                  }}
                >
                  <span style={{ fontSize: "1.2rem", flexShrink: 0, opacity: 0.7 }}>{icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="label-theme" style={{ margin: "0 0 2px", fontSize: "0.68rem" }}>{label}</p>
                    <span style={{
                      color: noRegistrado ? "var(--t3, #505050)" : "var(--t1)",
                      fontSize: "0.9rem",
                      fontWeight: noRegistrado ? 400 : 500,
                      fontStyle: noRegistrado ? "italic" : "normal"
                    }}>
                      {value}
                    </span>
                  </div>
                  {noRegistrado && (
                    <span style={{
                      fontSize: "0.65rem",
                      color: "var(--t3, #505050)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap"
                    }}>
                      Pendiente
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Tarjeta de Puntos de fidelidad ── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(16,185,129,.08), rgba(16,185,129,.02))",
          border: "1px solid var(--border-accent, rgba(16,185,129,.30))",
          borderRadius: "var(--r-xl, 18px)",
          padding: "32px",
          boxShadow: "var(--sh-emerald, 0 8px 40px rgba(16,185,129,.14))",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,.12), transparent 70%)",
            pointerEvents: "none"
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", position: "relative", zIndex: 1 }}>
            <div>
              <p className="label-theme" style={{ margin: "0 0 4px", fontSize: "0.7rem" }}>Tus Puntos</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{
                  fontSize: "2.4rem",
                  fontWeight: 800,
                  background: "var(--emerald-gradient, linear-gradient(135deg, #059669, #10b981, #34d399))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1.1
                }}>
                  {puntos}
                </span>
                <span style={{ color: "var(--t2)", fontSize: "0.85rem", fontWeight: 500 }}>pts</span>
              </div>
            </div>
            <div style={{
              background: `linear-gradient(135deg, ${tier.color}22, ${tier.color}11)`,
              border: `1px solid ${tier.color}44`,
              borderRadius: "12px",
              padding: "8px 16px",
              textAlign: "center"
            }}>
              <p style={{
                color: tier.color,
                fontWeight: 700,
                fontSize: "0.75rem",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}>
                {tier.label}
              </p>
            </div>
          </div>

          {tier.nextMin ? (
            <>
              <div style={{
                width: "100%",
                height: "8px",
                background: "var(--bg-4, #222)",
                borderRadius: "4px",
                overflow: "hidden",
                marginBottom: "10px",
                position: "relative",
                zIndex: 1
              }}>
                <div style={{
                  width: `${Math.min(100, (puntos / tier.nextMin) * 100)}%`,
                  height: "100%",
                  background: "var(--emerald-gradient, linear-gradient(90deg, #059669, #10b981, #34d399))",
                  borderRadius: "4px",
                  transition: "width 0.8s var(--ease, cubic-bezier(.4,0,.2,1))",
                  boxShadow: "0 0 12px rgba(16,185,129,.3)"
                }} />
              </div>
              <p style={{
                color: "var(--t2, #a0a0a0)",
                fontSize: "0.78rem",
                margin: 0,
                position: "relative",
                zIndex: 1
              }}>
                Te faltan <strong style={{ color: "var(--gold, #10b981)" }}>{necesita} pts</strong> para llegar a <strong>{tier.nextLabel}</strong>
              </p>
            </>
          ) : (
            <p style={{
              color: "var(--gold, #10b981)",
              fontSize: "0.82rem",
              fontWeight: 600,
              margin: 0,
              position: "relative",
              zIndex: 1
            }}>
              🏆 ¡Has alcanzado el nivel más alto!
            </p>
          )}
        </div>

        {/* ── Botón cerrar sesión ── */}
        <Button
          variant="outline-danger"
          className="w-100"
          style={{
            borderRadius: "14px",
            padding: "14px",
            fontSize: "0.88rem",
            fontWeight: 600,
            borderColor: "rgba(239,68,68,.3)",
            background: "rgba(239,68,68,.05)",
            transition: "all .2s var(--ease)"
          }}
          onClick={onLogout}
        >
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}

export default Perfil;
