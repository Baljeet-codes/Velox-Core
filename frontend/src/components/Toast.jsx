import React from "react";

export default function Toast({ mensaje }) {
  if (!mensaje) return null;
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px",
      background: mensaje.tipo === "ok" ? "rgba(52,211,153,.12)" : "rgba(248,113,113,.12)",
      border: `1px solid ${mensaje.tipo === "ok" ? "rgba(52,211,153,.35)" : "rgba(248,113,113,.35)"}`,
      color: mensaje.tipo === "ok" ? "var(--ok)" : "var(--err)",
      borderRadius: "var(--r2)", padding: "14px 20px",
      fontWeight: 600, fontSize: "0.88rem",
      zIndex: 9999, boxShadow: "var(--sh-md)"
    }}>
      {mensaje.tipo === "ok" ? "✓" : "✕"} {mensaje.texto}
    </div>
  );
}
