// ════════════════════════════════════════════════════════════════
// SHELL DE LA APLICACIÓN
// - HashRouter en vez de BrowserRouter:
//   Amplify + CloudFront sirven archivos estáticos sin
//   redirección 200 para rutas SPA, así que HashRouter
//   evita errores 404 en rutas como /perfil o /mis-pedidos.
//
// - Sesión persistida en localStorage:
//   Sin estado global (Redux/Zustand). El objeto usuario
//   se guarda en localStorage al login y se propaga por props.
//
// - CarritoDrawer a nivel raíz:
//   Se renderiza fuera de <Routes> para que el overlay
//   cubra toda la ventana sin problemas de z-index.
// ════════════════════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import Catalogo from "./pages/Catalogo";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import MisPedidos from "./pages/MisPedidos";
import Dashboard from "./admin/Dashboard";
import CarritoDrawer from "./Carrito";
import { useCarritoCount } from "./hooks/useCarrito";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carritoOpen, setCarritoOpen] = useState(false);
  const { carritoCount, fetchCarritoCount } = useCarritoCount(usuario);

  // ── Recuperar sesión desde localStorage al montar ──
  useEffect(() => {
    const guardado = localStorage.getItem("usuario");
    if (guardado) setUsuario(JSON.parse(guardado));
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem("usuario", JSON.stringify(data));
    setUsuario(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setCarritoOpen(false);
  };

  return (
    <Router>
      <Routes>
        {/* ────────────────────────────────────────────────────── */}
        {/* RUTA ADMIN: Dashboard protegido o Login redirigido   */}
        {/* Si el usuario no tiene es_admin=true, se muestra      */}
        {/* el Login de admin en vez del Dashboard.               */}
        {/* ────────────────────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            usuario?.es_admin
              ? <Dashboard admin={usuario} onLogout={handleLogout} />
              : <Login onLogin={handleLogin} />
          }
        />

        {/* ────────────────────────────────────────────────────── */}
        {/* RUTAS PÚBLICAS (Catálogo, Login, Registro, Perfil...) */}
        {/* ────────────────────────────────────────────────────── */}
        <Route
          path="*"
          element={
            <>
              <Navbar expand="lg" className="navbar-theme sticky-top">
                <Container>
                  <Navbar.Brand as={Link} to="/" className="navbar-brand-theme">
                    VELOX-CORE
                  </Navbar.Brand>
                  <Navbar.Toggle
                    aria-controls="main-navbar"
                    className="border-0"
                    style={{ filter: "invert(1) opacity(0.5)" }}
                  />
                  <Navbar.Collapse id="main-navbar">
                    <Nav className="ms-auto align-items-center gap-3">
                      <Nav.Link as={Link} to="/" className="nav-link-theme">
                        Catálogo
                      </Nav.Link>

                      {usuario ? (
                        <>
                          <Nav.Link as={Link} to="/mis-pedidos" className="nav-link-theme">
                            Mis Pedidos
                          </Nav.Link>

                          {/* Carrito */}
                          <button
                            className="cart-btn"
                            onClick={() => setCarritoOpen(true)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                              <line x1="3" y1="6" x2="21" y2="6"/>
                              <path d="M16 10a4 4 0 01-8 0"/>
                            </svg>
                            Carrito
                            {carritoCount > 0 && (
                              <span className="cart-badge">{carritoCount}</span>
                            )}
                          </button>

                          <Nav.Link as={Link} to="/perfil" className="nav-link-theme" style={{ padding: 0 }}>
                            <span style={{ color: "var(--t2)", fontSize: "0.85rem" }}>
                              Hola,{" "}
                              <span className="text-gold fw-semibold">{usuario.nombre.split(" ")[0]}</span>
                            </span>
                          </Nav.Link>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleLogout}
                            style={{ borderRadius: "8px", fontSize: "0.8rem", padding: "6px 16px" }}
                          >
                            Salir
                          </Button>
                        </>
                      ) : (
                        <>
                          <Nav.Link as={Link} to="/login" className="nav-link-theme">
                            Iniciar Sesión
                          </Nav.Link>
                          <Link
                            to="/registro"
                            className="btn btn-theme-primary text-decoration-none"
                            style={{ padding: "8px 20px" }}
                          >
                            Crear Cuenta
                          </Link>
                        </>
                      )}
                    </Nav>
                  </Navbar.Collapse>
                </Container>
              </Navbar>

              <Routes>
                <Route
                  path="/"
                  element={
                    <Container className="py-5">
                      <Catalogo usuario={usuario} onCarritoChange={fetchCarritoCount} />
                    </Container>
                  }
                />
                <Route path="/login"    element={<Login onLogin={handleLogin} />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/perfil"   element={<Perfil usuario={usuario} onLogout={handleLogout} />} />
                <Route path="/mis-pedidos" element={<MisPedidos usuario={usuario} />} />
              </Routes>

              {/* ── CarritoDrawer a nivel raíz ── */}
              {/* Renderizado fuera de <Routes> para que su      */}
              {/* backdrop oscuro cubra toda la ventana.          */}
              <CarritoDrawer
                open={carritoOpen}
                onClose={() => setCarritoOpen(false)}
                usuario={usuario}
                onChange={fetchCarritoCount}
              />
            </>
          }
        />
      </Routes>
    </Router>
  );
}
